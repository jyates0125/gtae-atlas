#!/usr/bin/env python3
"""Atlas 21.8: actual Yanis V18 base tiles, mobile framing, interaction and saved pins."""
import os,threading
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'atlas-research.html').is_file(),'Build public/ before browser acceptance'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
class Server(ThreadingHTTPServer):
 request_queue_size=64
 daemon_threads=True
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base='http://127.0.0.1:%s/'%server.server_port
engine=os.getenv('ATLAS_BROWSER','chromium')
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,**({'channel':'msedge'} if engine=='msedge' else {}))
  for width,height in ((1440,900),(390,844)):
   context=browser.new_context(viewport={'width':width,'height':height},
    device_scale_factor=1,reduced_motion='reduce',is_mobile=(width==390),has_touch=(width==390))
   page=context.new_page()
   page.goto(base+'atlas-research.html',wait_until='domcontentloaded',timeout=45000)
   page.wait_for_function('window.TeamJuraResearch95 && document.getElementById("j172-pins")',timeout=25000)
   expect(page.locator('.mapcredit')).to_contain_text('Yanis V18')
   assert 'YANIS V18' in page.locator('.pill').first.inner_text()
   state=page.evaluate('window.TeamJuraResearch95.camera()')
   assert state=={'x':-4000,'y':2000,'z':1},('Wrong Yanis V18 initial center',state)
   assert page.locator('#map').evaluate('(e)=>e.getBoundingClientRect().width>200')
   # All tiles are CC BY 4.0 sourced from GTADB: fail if the initial view
   # never draws actual imagery. A blank canvas is not a usable map.
   page.wait_for_function("""() => /[1-9][0-9]* tiles loaded/.test(
      document.querySelector('#mapStatus')?.textContent||'')""",timeout=35000)
   assert page.locator('#j172-pins').get_attribute('aria-pressed')=='false'
   out=ROOT/'qa-evidence'/engine/'yanis-v18'
   out.mkdir(parents=True,exist_ok=True)
   page.screenshot(path=str(out/('research-'+str(width)+'.png')),animations='disabled',full_page=False,timeout=20000)
   page.locator('#j172-pins').click()
   assert page.locator('#j172-pins').get_attribute('aria-pressed')=='true'
   assert page.locator('#showResearchPins').is_checked()
   assert page.evaluate("localStorage.getItem('jura101-research-pins-visible')")=='true'
   page.locator('#j172-pins').click()
   assert page.locator('#j172-pins').get_attribute('aria-pressed')=='false'
   assert page.evaluate("localStorage.getItem('jura101-research-pins-visible')")=='false'
   page.locator('#zoomIn').click()
   assert page.evaluate("window.TeamJuraResearch95.camera().z")>1
   page.locator('#home').click()
   assert page.evaluate('window.TeamJuraResearch95.camera()')=={'x':-4000,'y':2000,'z':1}
   page.locator('#j172-bright').click()
   assert 'brightness(1.12)' in page.locator('#map').evaluate('(e)=>getComputedStyle(e).filter')
   page.locator('#j172-bright').click()
   assert page.locator('#map').evaluate('(e)=>getComputedStyle(e).filter')=='none'
   page.locator('#j172-expand').click()
   assert 'j172-full-map' in page.locator('#maparea').get_attribute('class')
   page.keyboard.press('Escape')
   assert 'j172-full-map' not in page.locator('#maparea').get_attribute('class')
   if width==390:
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),'Mobile research page overflows phone'
   print('PASS Atlas 21.8 '+engine+' '+str(width)+': Yanis V18 tiles, source framing, pin toggle/storage, zoom/fit, true-color switch, expand/Escape',flush=True)
   context.close()
  browser.close()
finally:
 server.shutdown()
