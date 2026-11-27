#!/usr/bin/env python3
"""Exact selected image, decoded dimensions and visual evidence for nine GTAE heroes."""
import functools, hashlib, http.server, json, os, threading
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
OUT=ROOT/'qa-evidence'/'atlas3905-cinematic-headers'
OUT.mkdir(parents=True,exist_ok=True)
ENTRIES=json.loads((ROOT/'docs/ATLAS3904-HEADER-ART.json').read_text())['images']
assert len(ENTRIES)==9
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
report=[]
with http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(PUBLIC))) as server:
    threading.Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as pw:
            engine=os.getenv('ATLAS_BROWSER','chromium')
            browser=pw.chromium.launch(headless=True,**({'channel':'msedge'} if engine=='msedge' else {}))
            try:
                for width,height in ((1440,900),(390,844)):
                    ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
                    # No third-party requests are necessary to verify local cinematic artwork.
                    ctx.route('**/*',lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
                    try:
                        for key,entry in ENTRIES.items():
                            page=ctx.new_page()
                            try:
                                rel=entry['fallback'] if entry['selected']=='existing' else entry['path']
                                response=page.goto(base+entry['page'],wait_until='domcontentloaded',timeout=30000)
                                assert response and response.ok,(key,width,'page response')
                                hero=page.locator('[data-gtae-header="'+key+'"]')
                                expect(hero).to_have_count(1)
                                expect(hero).to_be_visible()
                                result=hero.evaluate(r"""async (el) => {
                                  const style=getComputedStyle(el);
                                  const match=style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
                                  if(!match)throw Error('Missing background image');
                                  const url=new URL(match[1],document.baseURI);
                                  const image=new Image();
                                  image.src=url.href;
                                  await image.decode();
                                  const rect=el.getBoundingClientRect();
                                  return {path:url.pathname,origin:url.origin,backgroundSize:style.backgroundSize,
                                    width:image.naturalWidth,height:image.naturalHeight,
                                    box:{x:rect.x,width:rect.width,height:rect.height},
                                    scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth};
                                }""")
                                assert result['origin']==base.rstrip('/'),(key,result)
                                assert result['path']=='/'+rel,(key,'wrong selected image',result)
                                assert result['width']>100 and result['height']>100,(key,result)
                                assert 'cover' in result['backgroundSize'],(key,result)
                                assert result['box']['height']>0 and result['box']['x']>=-1,(key,result)
                                assert result['box']['x']+result['box']['width']<=width+2,(key,result)
                                assert result['scrollWidth']<=width+1,(key,result)
                                if key=='studio-preview' and width==1440:
                                    layout=page.evaluate("""() => {
                                      const get=s=>{const el=document.querySelector(s),r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right}};
                                      return {note:get('main.dashboard > #j97-legacy-note'),worlds:get('main.dashboard > .worlds'),
                                        center:get('main.dashboard > .center'),right:get('main.dashboard > .right'),hero:get('[data-gtae-header="studio-preview"]')};
                                    }""")
                                    assert layout['note']['bottom']<=layout['worlds']['y']+1,(key,layout)
                                    assert layout['note']['w']>=width*.85,(key,layout)
                                    assert layout['center']['w']>=width*.45,(key,layout)
                                    assert abs(layout['worlds']['y']-layout['center']['y'])<=2,(key,layout)
                                    assert abs(layout['right']['y']-layout['center']['y'])<=2,(key,layout)
                                    assert layout['worlds']['right']<=layout['center']['x']+1,(key,layout)
                                    assert layout['center']['right']<=layout['right']['x']+1,(key,layout)
                                    assert layout['hero']['w']>=layout['center']['w']*.95,(key,layout)
                                    result['studioGrid']=layout
                                # Check the exact served bytes in the same browser context
                                # as the decoded artwork, avoiding a separate API client.
                                served=page.evaluate('''async (url) => {
                                  const r=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(15000)});
                                  if(!r.ok)throw Error('Image HTTP '+r.status);
                                  const digest=await crypto.subtle.digest('SHA-256',await r.arrayBuffer());
                                  return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
                                }''',base+rel)
                                assert served==hashlib.sha256((ROOT/rel).read_bytes()).hexdigest(),key
                                page.screenshot(path=str(OUT/f'{key}-{width}.png'),animations='disabled',timeout=15000)
                                report.append({'key':key,'page':entry['page'],'viewport':width,'asset':rel,**result})
                                print(f"PASS {key} {width}px: {rel} ({result['width']}x{result['height']})",flush=True)
                            finally:
                                page.close()
                    finally:
                        ctx.close()
            finally:
                browser.close()
    finally:
        (OUT/'report.json').write_text(json.dumps(report,indent=2)+'\n')
        server.shutdown()
assert len(report)==18
print('PASS 18 cinematic header views; screenshots are evidence for owner review, not automatic visual approval.')
