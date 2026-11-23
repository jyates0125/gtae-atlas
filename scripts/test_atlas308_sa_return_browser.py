#!/usr/bin/env python3
"""Atlas 30.8: SA pin-to-card-to-map journey; no save or transform rewrites."""
import json
from functools import partial
from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright,expect

root=Path(__file__).resolve().parents[1]
public=root/'public'
assert (public/'atlas-sa.html').is_file(),'Build the published Cloudflare files first'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(public)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/atlas-sa.html'
key='team-jura-sa-v1'
out=root/'qa-evidence'/'chromium';out.mkdir(parents=True,exist_ok=True)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width,height in ((375,667),(390,844),(844,390),(1440,900)):
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   context.route('https://**/*',lambda route:route.abort())
   page=context.new_page()
   errors=[]
   page.on('pageerror',lambda err:errors.append(str(err)))
   page.goto(url,wait_until='domcontentloaded')
   fixture=json.dumps({'schema':1,'items':{'snapshots:1':{'done':True,'note':'Important prior progress'}}})
   page.evaluate("([k,v])=>localStorage.setItem(k,v)",[key,fixture])
   page.reload(wait_until='domcontentloaded')
   # The bundled source load deliberately switches its default from Tags (100)
   # to Snapshots (50). Assert both real category counts, then restore the
   # source-preserved initial state before testing map exit and saved progress.
   expect(page.locator('#items .item')).to_have_count(50,timeout=30000)
   assert page.locator('#setTitle').inner_text().endswith('Snapshots')
   assert page.locator('body').get_attribute('data-jura-sa-set') == 'snapshots'
   page.locator('#categories .cat',has_text='Graffiti Tags').click()
   expect(page.locator('#items .item')).to_have_count(100,timeout=30000)
   assert page.locator('body').get_attribute('data-jura-sa-set') == 'tags'
   page.locator('#categories .cat',has_text='Snapshots').click()
   expect(page.locator('#items .item')).to_have_count(50,timeout=30000)
   assert page.locator('body').get_attribute('data-jura-sa-set') == 'snapshots'
   back=page.locator('#j308-back-map')
   expect(back).to_be_visible()
   dims=back.bounding_box()
   assert dims and dims['width']>=135 and dims['height']>=44,(width,height,dims)
   before=page.evaluate("k=>localStorage.getItem(k)",key)
   camera=page.locator('#mapContents').get_attribute('style')
   title=page.locator('#setTitle').inner_text()
   first=page.locator('#pinLayer .pin').first
   if first.count():
    first.click()
    expect(page.locator('#items .item input[type=checkbox]')).not_to_have_count(0)
   else:
    page.locator('#items .item').first.locator('input[type=checkbox]').focus()
   back.click()
   assert page.locator('#mapContents').get_attribute('style')==camera,(width,height,'camera altered by return')
   assert page.locator('#setTitle').inner_text()==title
   assert page.evaluate("k=>localStorage.getItem(k)",key)==before
   assert page.evaluate("location.pathname.endsWith('atlas-sa.html')")
   assert page.evaluate("document.activeElement.id==='mapContainer'||document.activeElement.classList.contains('pin')"),(width,height,'map focus missing')
   page.locator('#items .item').first.locator('textarea').focus()
   page.locator('#items .item').first.locator('textarea').press('Escape')
   assert page.evaluate("document.activeElement.id==='mapContainer'||document.activeElement.classList.contains('pin')")
   assert page.evaluate("k=>localStorage.getItem(k)",key)==before
   assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),(width,height,'horizontal overflow')
   if width in (390,844):
    page.screenshot(path=str(out/f'atlas308-sa-{width}x{height}.png'),full_page=False)
   assert not errors,(width,height,errors[:4])
   context.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 30.8 passed: SA four viewport pin/card/map and Escape with no source/progress changes')
