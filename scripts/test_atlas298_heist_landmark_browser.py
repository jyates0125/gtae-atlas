#!/usr/bin/env python3
"""Atlas 29.8 real built-site Chromium: heist site links open exact source pins."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from urllib.parse import parse_qs,urlparse
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1]
P=R/'public'
assert (P/'heist-fleeca.html').is_file()
EXPECTED={
 'fleeca':('L697','Fleeca'),
 'prison-break':('L508','Bolingbroke'),
 'humane-labs':('L553','Humane Labs'),
 'pacific-standard':('L2013','Pacific Standard'),
 'cluckin-bell':('L1596','Clucking Bell'),
 'kortz-center':('L139','Kortz Center'),
}
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True;request_queue_size=64
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(P)))
Thread(target=server.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{server.server_port}/'
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width in (390,1440):
   ctx=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce')
   page=ctx.new_page()
   for heist,(id,name) in EXPECTED.items():
    page.goto(BASE+'heist-'+heist+'.html',wait_until='domcontentloaded',timeout=45000)
    source=page.locator('.j298-mission-sites .j298-site-link')
    expect(source).to_have_count(1,timeout=20000)
    target=source.get_attribute('href')
    assert target and parse_qs(urlparse(target).query).get('place')==['gtadb-5-'+id],(heist,target)
    assert '/atlas-online.html' in target,(heist,target)
    source.click()
    expect(page.locator('#selectedCard')).to_be_visible(timeout=30000)
    expect(page.locator('#selectedName')).to_contain_text(name)
    assert page.url.find('place=gtadb-5-'+id)>0,(heist,page.url)
    image=page.locator('#selectedPhoto')
    expect(image).to_have_attribute('src',f'https://raw.githubusercontent.com/rolux/gtadb.org/main/map/photos/5/{id},ig.jpg',timeout=25000)
    assert page.locator('#selectedInfo').inner_text().find('X ')>=0
    if width==390:
     assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'),(heist,'map phone overflow')
   page.goto(BASE+'heist-doomsday-act-3.html',wait_until='domcontentloaded')
   expect(page.locator('#j298-mission-sites')).to_have_count(0), 'Do not invent Doomsday sites'
   print(f'PASS Atlas 29.8 {width}: six heist-specific source pins open real map/info and photo reference',flush=True)
   ctx.close()
  browser.close()
finally:
 server.shutdown()
