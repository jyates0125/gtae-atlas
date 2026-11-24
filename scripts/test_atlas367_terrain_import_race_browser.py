#!/usr/bin/env python3
"""Atlas 36.7: real built-site Chromium race regression at phone and desktop.
All heightfields are synthetic in-memory fixture bytes. No source tile or DEM
is requested, bundled, uploaded or submitted to GTADB.
"""
from array import array
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright,expect

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'atlas-vi.html').is_file(),'Run the Cloudflare build first'
grid=array('H')
for y in range(1748):
 grid.extend(28000+y//4+x//16 for x in range(1536))
BYTES=grid.tobytes()
assert len(BYTES)==5369856
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=64
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{server.server_port}/'
INTERCEPT="""(() => {
 const original=window.fetch.bind(window);
 window.__j367FetchCount=0;
 window.fetch=(input,options)=>{
  if(String(input).includes('elevation-6.bin')){
   window.__j367FetchCount++;
   return new Promise(resolve=>{window.__j367Resolve=resolve});
  }
  return original(input,options);
 };
})()"""
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,args=['--enable-webgl','--use-angle=swiftshader'])
  for width,height in ((390,844),(1440,900)):
   ctx=browser.new_context(viewport={'width':width,'height':height},
                            reduced_motion='reduce')
   ctx.route('https://**/*',lambda route:route.abort())
   ctx.add_init_script(INTERCEPT)
   page=ctx.new_page()
   page.goto(BASE+'atlas-vi.html',wait_until='domcontentloaded',timeout=60000)
   expect(page.locator('#atlasCanvas')).to_be_visible(timeout=35000)
   page.wait_for_function("""() => typeof window.teamJuraNav?.getDimension==='function'""")
   assert page.evaluate('window.__j367FetchCount')==0,'terrain fetched without user interaction'
   page.locator('#jura3d').click()
   page.wait_for_function("""() => typeof window.__j367Resolve==='function'""")
   assert page.evaluate("window.teamJuraNav.getDimension()")=='3d'
   assert page.evaluate("document.body.classList.contains('jura-perspective-fallback')")
   # Real input change occurs before the on-demand same-origin fetch finishes.
   page.locator('#juraElevationFile').set_input_files({
    'name':'local-research-elevation-6.bin',
    'mimeType':'application/octet-stream','buffer':BYTES})
   page.wait_for_function("""() => window.teamJuraNav?.terrain()?.hasElevation()===true""",
                          timeout=30000)
   # The late server result is malformed. It must NOT override local upload.
   page.evaluate("""() => window.__j367Resolve(new Response(
       new Uint8Array([0,0]),{status:200,headers:{'Content-Length':'2'}}))""")
   page.wait_for_timeout(150)
   state=page.evaluate("""() => ({
    dimension:teamJuraNav.getDimension(),
    active:teamJuraNav.terrain().isActive(),
    has:teamJuraNav.terrain().hasElevation(),
    fallback:document.body.classList.contains('jura-perspective-fallback'),
    notice:document.getElementById('j362TerrainNotice').hidden,
    label:document.getElementById('jura3dStatus').textContent,
    requests:window.__j367FetchCount
   })""")
   assert state['dimension']=='3d' and state['has'],(width,state)
   assert state['active']!=state['fallback'],(width,'inconsistent renderer/fallback',state)
   assert ('no elevation data' not in state['label'].lower()),(width,'late fetch erased imported source',state)
   if state['active']:
    assert state['notice'],(width,'preview obscures accepted 3D renderer',state)
   else:
    assert 'WebGL unavailable' in state['label'],(width,state)
    expect(page.locator('#atlasCanvas')).to_be_visible()
   # Invalid second upload must preserve the validated first grid AND
   # its comparison evidence; no auto-reset or destructive mutation.
   page.locator('#juraElevationFile').set_input_files({
    'name':'damaged.bin','mimeType':'application/octet-stream','buffer':b'\x01\x02'})
   expect(page.locator('#juraNavStatus')).to_contain_text(
      'Previously accepted terrain and evidence preserved',timeout=20000)
   assert page.evaluate('teamJuraNav.terrain().hasElevation()')
   page.locator('#jura2d').click()
   assert page.evaluate('teamJuraNav.getDimension()')=='2d'
   page.locator('#jura3d').click()
   page.wait_for_function("""() => teamJuraNav.getDimension()==='3d'""")
   assert page.evaluate('teamJuraNav.terrain().hasElevation()')
   assert page.evaluate('window.__j367FetchCount')==1,'cached import was re-downloaded'
   page.locator('#jura2d').click()
   # New page lifecycle: cancelling an in-flight check must not install data
   # later or flip the user's restored 2D view back to 3D.
   page.reload(wait_until='domcontentloaded')
   page.wait_for_function("""() => typeof window.teamJuraNav?.getDimension==='function'""")
   page.locator('#jura3d').click()
   page.wait_for_function("""() => typeof window.__j367Resolve==='function'""")
   page.locator('#jura2d').click()
   page.evaluate("""() => {
    const a=new Uint16Array(1536*1748);a.fill(28000);
    a[0]=28112;a[a.length-1]=28115;
    window.__j367Resolve(new Response(a.buffer,{status:200}));
   }""")
   page.wait_for_timeout(200)
   assert page.evaluate('teamJuraNav.getDimension()')=='2d'
   assert not page.evaluate('teamJuraNav.terrain().hasElevation()'),(width,'cancelled download applied')
   expect(page.locator('#atlasCanvas')).to_be_visible()
   print(f'Atlas 36.7 {width}px: local-import race, stale fetch, damaged replacement, 2D/3D cache reuse and cancelled import PASS')
   ctx.close()
  browser.close()
finally:
 server.shutdown()
