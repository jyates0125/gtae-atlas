#!/usr/bin/env python3
"""Atlas 30.9: hero raster decode, proper attribution and original SA map remain usable."""
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1];public=root/'public'
assert (public/'atlas-sa.html').is_file(),'Build published static payload first'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(public)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/atlas-sa.html'
out=root/'qa-evidence/chromium';out.mkdir(parents=True,exist_ok=True)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width,height in ((375,667),(390,844),(844,390),(1440,900)):
   page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
   page.route('https://**/*',lambda r:r.abort())
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(url,wait_until='domcontentloaded')
   hero=page.locator('.hero')
   image=hero.locator('.j309-sa-hero-art img')
   expect(image).to_be_visible(timeout=15000)
   expect(image).to_have_attribute('src','./art/jura157-sa-cinematic.webp')
   image.evaluate("el=>el.loading='eager'")
   expect(image).to_have_js_property('complete',True,timeout=15000)
   assert image.evaluate("el=>el.naturalWidth>200&&el.naturalHeight>150"),(width,height,'hero failed to decode')
   assert page.evaluate("getComputedStyle(document.querySelector('.hero')).backgroundImage.includes('atlas81-approved-dashboard-crew.webp')") is False
   assert not page.locator('.hero .sketch').count()
   expect(page.locator('.j309-sa-hero-art figcaption')).to_contain_text('LOS SANTOS')
   expect(page.locator('#mapContainer')).to_be_attached()
   page.wait_for_function("() => document.querySelectorAll('#items .item').length >= 50",timeout=30000)
   assert page.locator('#items .item').count() in (50,70,100),(width,height,'unexpected collection inventory')
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(width,height,'horizontal overflow')
   assert not errors,(width,height,errors[:3])
   if width in (390,1440):page.screenshot(path=str(out/f'atlas309-sa-premium-{width}.png'),full_page=False)
   page.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 30.9: local SA cinematic image decoded and map/collectible UI preserved at four viewports')
