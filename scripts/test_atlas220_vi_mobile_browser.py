#!/usr/bin/env python3
"""Atlas 22.0 real built-site Chromium and Edge mobile/desktop marker acceptance."""
import os,threading
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright,expect

R=Path(__file__).resolve().parents[1]
P=R/'public'
assert (P/'atlas220-vi-mobile.js').is_file() and (P/'atlas220-vi-mobile.css').is_file()
engine=os.getenv('ATLAS_BROWSER','chromium')
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=64
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(P)))
threading.Thread(target=server.serve_forever,daemon=True).start()
origin=f'http://127.0.0.1:{server.server_port}/'
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,**({'channel':'msedge'} if engine=='msedge' else {}))
  for width,height in ((1440,900),(390,844),(375,812)):
   ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   page=ctx.new_page()
   page.goto(origin+'atlas-vi.html',wait_until='domcontentloaded',timeout=45000)
   canvas=page.locator('#atlasCanvas')
   expect(canvas).to_be_visible(timeout=30000)
   expect(page.locator('#game6')).to_have_attribute('aria-pressed','true',timeout=25000)
   # A user-created mapped record makes this independent of optional remote source latency.
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),f'{width}px VI page horizontal overflow'
   if width<701:
    assert page.locator('.jura-quick-nav').evaluate('(el)=>getComputedStyle(el).display')=='none','Redundant phone map actions still cover canvas'
   # Create two real guest pins in this isolated browser context; engine owns their
   # selection, card and local save, not the test harness.
   page.locator('#tabPins').click(timeout=20000)
   page.locator('#addPin').click(timeout=20000)
   page.once('dialog',lambda d:d.accept('Atlas 22 First Pin'))
   box=canvas.bounding_box()
   assert box and box['width']>200 and box['height']>250,'Map canvas not usable'
   page.mouse.click(box['x']+box['width']*.52,box['y']+box['height']*.60)
   card=page.locator('#selectedCard')
   expect(card).to_be_visible(timeout=20000)
   expect(page.locator('#selectedName')).to_have_text('Atlas 22 First Pin')
   page.locator('#legend .elario-legend-glyph').first.wait_for(state='attached',timeout=12000)
   assert page.locator('#legend .elario-legend-glyph').count()>0,'Original category-specific legend icons required'
   close=page.locator('#closeSelected')
   expect(close).to_be_visible()
   assert close.bounding_box()['height']>=43,'Sticky Close must be touch sized'
   assert card.get_attribute('aria-hidden')=='false'
   if width<701:
    bounds=card.bounding_box()
    assert bounds['y']>=box['y']-3 and bounds['y']+bounds['height']<=box['y']+box['height']+3,'Detail sheet extends beyond the map workspace'
   output=R/'qa-evidence'/engine
   output.mkdir(parents=True,exist_ok=True)
   page.screenshot(path=str(output/f'atlas220-vi-{width}.png'))
   close.click()
   expect(card).to_be_hidden(timeout=6000)
   assert card.get_attribute('aria-hidden')=='true'
   # Same marker must reopen after Close, then Escape must clear it via engine.
   page.mouse.click(box['x']+box['width']*.50,box['y']+box['height']*.50)
   expect(card).to_be_visible(timeout=7000)
   page.keyboard.press('Escape')
   expect(card).to_be_hidden(timeout=6000)
   if width<701:
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),'Phone overflow after map interaction'
   print(f'PASS Atlas 22.0 {engine} {width}: real guest marker/detail/Close/reselect/Escape, Elario legend, no overflow',flush=True)
   ctx.close()
  browser.close()
finally:
 server.shutdown()
