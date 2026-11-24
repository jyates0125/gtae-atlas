#!/usr/bin/env python3
"""Atlas 36.6: real Chromium readiness with synthetic on-demand local DEM.
No generated heightfield is written, copied to public/, or deployed.
This tests loading and mode logic; not GTA VI geography accuracy.
"""
from array import array
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'atlas-vi.html').is_file(), 'Build the public site first'
assert not (ROOT/'elevation-6.bin').exists(),'Do not test with an unreviewed real elevation file'
heightmap=array('H')
for y in range(1748):
 heightmap.extend(28000+y//4+x//30 for x in range(1536))
BYTES=heightmap.tobytes()
assert len(BYTES)==1536*1748*2
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=64
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{server.server_port}/'
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,args=['--enable-webgl','--use-angle=swiftshader'])
  for width,height in ((390,844),(1440,900)):
   ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   ctx.route('https://**/*',lambda route:route.abort())
   page=ctx.new_page()
   page.route('**/elevation-6.bin',lambda route:route.fulfill(
    status=200,body=BYTES,headers={'content-type':'application/octet-stream',
      'content-length':str(len(BYTES))}))
   page.goto(BASE+'atlas-vi.html',wait_until='domcontentloaded',timeout=60000)
   expect(page.locator('#atlasCanvas')).to_be_visible(timeout=35000)
   page.wait_for_function("""() => typeof document.getElementById('jura3d')?.onclick==='function'""",timeout=20000)
   assert not page.evaluate("""() => window.teamJuraNav?.terrain()?.hasElevation()??false"""),'fixture loaded without user request'
   page.locator('#jura3d').click()
   page.wait_for_function("""() => window.teamJuraNav?.terrain()?.hasElevation()===true""",timeout=30000)
   assert page.evaluate("""() => window.teamJuraNav?.getDimension()==='3d'""")
   mode=page.evaluate("""() => ({
    active:window.teamJuraNav?.terrain()?.isActive(),
    fallback:document.body.classList.contains('jura-perspective-fallback'),
    status:document.getElementById('jura3dStatus')?.textContent,
    notice:!document.getElementById('j362TerrainNotice')?.hidden
   })""")
   assert mode['active'] != mode['fallback'],(width,'WebGL or fallback must be explicit',mode)
   if mode['active']:
    expect(page.locator('#jura3dCanvas')).to_be_visible()
    assert not mode['notice'],(width,mode)
   else:
    expect(page.locator('#atlasCanvas')).to_be_visible()
    assert mode['notice'] and 'WebGL' in mode['status'],(width,mode)
   page.locator('#jura2d').click()
   expect(page.locator('#atlasCanvas')).to_be_visible()
   assert page.evaluate("""() => window.teamJuraNav?.getDimension()==='2d'""")
   assert page.evaluate("""() => window.teamJuraNav?.terrain()?.hasElevation()===true"""), 'loaded terrain was lost on 2D return'
   print(f'Atlas 36.6 {width}px: on-demand local binary recognized, honest WebGL/fallback, and 2D return PASS')
   ctx.close()
  browser.close()
finally:
 server.shutdown()
