#!/usr/bin/env python3
"""Atlas 21.9 premium HQ browser acceptance in desktop/mobile Chromium and Edge."""
import os,threading
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];PUBLIC=ROOT/'public'
assert (PUBLIC/'atlas81-hq.html').is_file()
assert (PUBLIC/'atlas219-collection-cinema.css').is_file()
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 request_queue_size=64
 daemon_threads=True
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url='http://127.0.0.1:%d/atlas81-hq.html'%server.server_port
engine=os.environ.get('ATLAS_BROWSER','chromium')
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,**({'channel':'msedge'} if engine=='msedge' else {}))
  for width,height in ((1440,900),(390,844)):
   ctx=browser.new_context(viewport={'width':width,'height':height},is_mobile=(width==390),has_touch=(width==390),reduced_motion='reduce')
   page=ctx.new_page()
   page.goto(url,wait_until='domcontentloaded',timeout=45000)
   page.wait_for_function("document.querySelectorAll('#heistTiles .j219-heist-card').length===15",timeout=20000)
   assert page.locator('#overview .j219-quick-card').count()==8
   assert page.locator('#overview .j219-quick-cover').count()==8
   assert page.locator('.j219-logo').evaluate('(e)=>e.complete && e.naturalWidth>0')
   if page.locator('#j89-shell').count():
    assert not page.locator('#j89-shell').is_visible(),'Legacy floating nav overlaps HQ'
   assert 'Atlas 8.1 is a development preview' not in page.locator('body').inner_text()
   page.goto(url+'#maps',wait_until='domcontentloaded',timeout=45000)
   expect(page.locator('#maps')).to_be_visible(timeout=12000)
   assert page.locator('#maps .j219-map-card').count()==6
   assert page.locator('#maps .j219-map-card img').count()==6
   assert page.locator('#maps a[href="./atlas-vi.html"]').count()==1
   assert page.locator('#maps a[href="./heist-cayo-perico.html"]').count()==1
   assert page.locator('#maps a[href="./atlas-iv.html"]').count()==1
   if width==390:
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Map cards overflow mobile viewport'
   page.goto(url+'#missions',wait_until='domcontentloaded',timeout=45000)
   expect(page.locator('#missions')).to_be_visible(timeout=12000)
   page.wait_for_function("document.querySelectorAll('#heistTiles img').length===15",timeout=15000)
   assert page.locator('#heistTiles a[href="./heist-kortz-center.html"]').count()==1
   assert page.locator('#heistTiles a[href="./heist-cayo-perico.html"]').count()==1
   if width==390:
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Heist cards overflow mobile viewport'
   page.goto(url+'#collections',wait_until='domcontentloaded',timeout=45000)
   expect(page.locator('#collections')).to_be_visible(timeout=12000)
   assert page.locator('#modeStory').count()==1 and page.locator('#modeOnline').count()==1
   assert page.locator('#exportAll').count()==1 and page.locator('#importAll').count()==1
   print('PASS Atlas 21.9 '+engine+' '+str(width)+': HQ art, six map cards, 15 heist-specific entries, saves accessible',flush=True)
   ctx.close()
  browser.close()
finally:server.shutdown()
