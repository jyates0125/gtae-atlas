#!/usr/bin/env python3
"""Atlas 36.2: rendered Chromium map/footer placement and honest 3D fallback.
Run against built public/; not a substitute for native iPhone Safari QA.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'atlas-vi.html').is_file(), 'Build public/ first'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=64
http=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
threading.Thread(target=http.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{http.server_port}/atlas-vi.html'

try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width,height in [(390,844),(430,932),(1440,900)]:
   mobile=width<700
   ctx=browser.new_context(
    viewport={'width':width,'height':height},
    is_mobile=mobile,has_touch=mobile,device_scale_factor=1,
    reduced_motion='reduce',
   )
   page=ctx.new_page()
   page.goto(url,wait_until='domcontentloaded',timeout=60000)
   expect(page.locator('#atlasCanvas')).to_be_visible(timeout=35000)
   expect(page.locator('.j133-universal-footer')).to_be_attached(timeout=20000)
   expect(page.locator('#jura3d')).to_be_visible(timeout=20000)
   if mobile:
    geometry=page.evaluate("""() => {
      const box=s=>document.querySelector(s)?.getBoundingClientRect();
      const footer=box('.j133-universal-footer');
      const shell=box('.shell');
      const sidebar=box('#sidebar');
      return {footerTop:footer?.top,shellBottom:shell?.bottom,
        sidebarBottom:sidebar?.bottom,sidebarHeight:sidebar?.height,
        scrollHeight:document.querySelector('#sidebar')?.scrollHeight,
        shellCSS:getComputedStyle(document.querySelector('.shell')).height,
        shellOverflow:getComputedStyle(document.querySelector('.shell')).overflowY,
        sidebarOverflow:getComputedStyle(document.querySelector('#sidebar')).overflowY};
    }""")
    assert geometry['footerTop']>=geometry['shellBottom']-2, (
      'Share footer overlaps the full map/sidebar stack', geometry)
    assert geometry['sidebarOverflow']=='visible',('Sidebar is internally scrolling',geometry)
    assert geometry['sidebarHeight']+2>=geometry['scrollHeight'],(
      'Sidebar still spills underneath footer',geometry)
    assert page.locator('.j133-universal-footer .j131-social-grid button').count()>=5
   expect(page.locator('.credits-line a[href^="./atlas-credits.html"]')).to_be_attached()
   expect(page.locator('#j362TerrainNotice')).to_be_hidden()
   page.locator('#jura3d').click(timeout=25000)
   expect(page.locator('#j362TerrainNotice')).to_be_visible(timeout=15000)
   assert page.evaluate("""() => document.body.classList.contains('jura-perspective-fallback')"""), (
    '3D without an installed grid must NOT activate the untextured WebGL canvas')
   expect(page.locator('#j362TerrainNotice')).to_contain_text('No elevation data installed',timeout=15000)
   assert page.evaluate("""() => {
     const canvas=document.getElementById('atlasCanvas');
     const st=getComputedStyle(canvas);
     return st.visibility==='visible' && st.pointerEvents==='auto' &&
       st.transform!=='none';
   }"""), 'Illustrated map disappeared or stopped responding in preview'
   page.locator('#j362ImportTerrain').click(timeout=15000)
   expect(page.locator('#juraNavPanel')).to_be_visible()
   assert page.locator('#juraElevationFile').evaluate('(x)=>x.closest("details").open'), (
    'Terrain file control not exposed when selecting terrain options')
   page.locator('#juraCloseNav').click()
   page.locator('#j362ClosePreview').click()
   expect(page.locator('#j362TerrainNotice')).to_be_hidden()
   assert not page.evaluate("document.body.classList.contains('jura-in-3d')")
   if mobile:
    check=page.evaluate("""() => {
      const btns=[
        ...document.querySelectorAll('#j171-map-tools button'),
        ...document.querySelectorAll('.map-actions button')
      ].filter(x=>getComputedStyle(x).display!=='none');
      const result=[];
      for(const button of btns){
        const b=button.getBoundingClientRect();
        const x=b.x+b.width/2,y=b.y+b.height/2;
        const top=document.elementFromPoint(x,y);
        result.push({label:button.textContent,top:top===button||button.contains(top),
         x,y,bottom:b.bottom});
      }
      return result;
    }""")
    assert len(check)>=4,('Map actions disappeared',check)
    assert all(x['top'] for x in check),('One or more map actions are blocked',check)
   output=ROOT/'qa-evidence'/'atlas362-map-clarity'
   output.mkdir(parents=True,exist_ok=True)
   page.screenshot(path=str(output/f'vi-{width}-preview-exited.png'),
                   animations='disabled',full_page=not mobile,timeout=20000)
   print(f'Atlas 36.2 {width}px: 3D fallback, source credits, full footer flow and mobile control taps PASS')
   ctx.close()
  browser.close()
finally:
 http.shutdown()
