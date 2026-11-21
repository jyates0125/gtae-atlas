#!/usr/bin/env python3
"""Atlas 21.7: Playwright acceptance on built public/ VI workspace and Start Here."""
import os,threading
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1]
P=R/'public'
assert (P/'atlas217-vi-world.css').is_file() and (P/'atlas217-vi-world.js').is_file(),'Missing built VI hub'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
class Server(ThreadingHTTPServer):
 request_queue_size=64
 daemon_threads=True
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(P)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base='http://127.0.0.1:%s/'%server.server_port
engine=os.environ.get('ATLAS_BROWSER','chromium')
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,**({'channel':'msedge'} if engine=='msedge' else {}))
  for width,height in ((1440,900),(390,844)):
   ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   page=ctx.new_page()
   page.goto(base+'atlas-vi.html',wait_until='domcontentloaded',timeout=45000)
   panel=page.locator('#j217-vi-hub')
   expect(panel.locator('summary')).to_be_visible(timeout=20000)
   assert not panel.evaluate('(e)=>e.open'),'World menu must start collapsed'
   panel.locator('summary').click()
   assert panel.evaluate('(e)=>e.open'),'Native world panel did not open'
   links=panel.locator('.j217-vi-grid a')
   assert links.count()==8,('Expected eight VI-specific destinations',links.count())
   assert panel.locator('a[href="./atlas-vi.html?view=rockstar"]').count()==1
   assert panel.locator('a[href="./atlas90-vehicles6.html"]').count()==1
   assert panel.locator('a[href="./atlas90-weapons6.html"]').count()==1
   assert panel.locator('a[href="./atlas-characters.html?game=vi#results"]').count()==1
   assert panel.locator('a[href="./atlas-research.html"]').count()==1
   assert page.locator('#atlasCanvas').count()==1
   if width==390:
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),'VI workspace document overflows phone'
   page.keyboard.press('Escape')
   assert not panel.evaluate('(e)=>e.open'),'Escape must close world panel'
   page.goto(base+'atlas97-journey.html',wait_until='domcontentloaded',timeout=45000)
   assert page.locator('.j97-world-grid .j97-world').count()==4
   assert page.locator('.j97-world[data-j97-world="vi"]').get_attribute('href')=='./atlas-vi.html'
   assert page.locator('.j97-world[data-j97-world="cayo"]').get_attribute('href')=='./heist-cayo-perico.html'
   assert page.locator('.j97-world-grid img[src$=".webp"]').count()==4
   if width==390:
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),'Start Here overflows phone'
   page.goto(base+'atlas-research.html',wait_until='domcontentloaded',timeout=45000)
   assert page.locator('#j217-vi-research a[href="./atlas-vi.html"]').count()==1
   assert page.locator('#j217-vi-research a[href="./atlas-vi.html?view=rockstar"]').count()==1
   print('PASS Atlas 21.7 '+engine+' '+str(width)+': VI hub/open/Escape, 8 deep links, premium Start Here, research bridge',flush=True)
   ctx.close()
  browser.close()
finally:
 server.shutdown()
