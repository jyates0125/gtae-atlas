#!/usr/bin/env python3
"""Real service worker, cache storage, IndexedDB and offline navigation against built output."""
import os, json, threading
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import expect, sync_playwright
ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'map-hub.html').is_file(), 'Build actual public output first'
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
class TestServer(ThreadingHTTPServer):
    request_queue_size=64
    daemon_threads=True
server=TestServer(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base='http://127.0.0.1:%s/'%server.server_port
engine=os.getenv('ATLAS_BROWSER','chromium')
try:
 with sync_playwright() as pw:
  opts={'headless':True}
  if engine=='msedge':opts['channel']='msedge'
  browser=pw.chromium.launch(**opts)
  for width,height in [(1440,900),(390,844)]:
   context=browser.new_context(viewport={'width':width,'height':height},service_workers='allow',accept_downloads=True)
   page=context.new_page()
   # External map publishers are not required for this test.
   page.route('**/*',lambda route:route.continue_() if route.request.url.startswith(base) else route.abort())
   page.goto(base+'map-hub.html?game=ctw',wait_until='domcontentloaded')
   expect(page.locator('#j273-camera-list li')).to_have_count(100,timeout=20000)
   # Seed the older manual-download cache before activation.
   page.evaluate("""async()=>{const c=await caches.open('team-jura-atlas-v41-tiles');await c.put('https://raw.githubusercontent.com/rolux/gtadb.org/main/maps/tiles/5/0/0/0.png',new Response('legacy-tile'));}""")
   page.locator('#j273-camera-list li').first.get_by_role('button',name='Mark found',exact=False).click()
   page.get_by_role('button',name='Prepare local offline tools').click()
   expect(page.locator('#j277-offline [role=status]')).to_contain_text('listed local files cached',timeout=120000)
   page.wait_for_function("navigator.serviceWorker.controller?.scriptURL.endsWith('/atlas-sw.js?v=277')",timeout=60000)
   state=page.evaluate("""async()=>{const c=await caches.open('team-jura-atlas-v41-tiles');return await (await c.match('https://raw.githubusercontent.com/rolux/gtadb.org/main/maps/tiles/5/0/0/0.png')).text()}""")
   assert state=='legacy-tile'
   page.unroute('**/*')
   context.set_offline(True)
   page.reload(wait_until='domcontentloaded',timeout=45000)
   expect(page.locator('#j273-camera-list li')).to_have_count(100,timeout=20000)
   expect(page.locator('#j273-camera .j271-source-progress')).to_contain_text('1 / 100')
   page.locator('#j274-collection').select_option('jumps')
   expect(page.locator('#j273-camera-list li')).to_have_count(30)
   page.locator('#j273-camera-list li').first.get_by_role('button',name='Mark found',exact=False).click()
   expect(page.locator('#j273-camera .j271-source-progress')).to_contain_text('1 / 30')
   page.locator('#j273-camera .j271-source-progress input[type=checkbox]').check()
   expect(page.locator('#j273-camera-list li')).to_have_count(29)
   page.goto(base+'map-hub.html?game=lcs',wait_until='domcontentloaded',timeout=45000)
   expect(page.locator('#j247-results li')).to_have_count(52,timeout=20000)
   page.goto(base+'map-hub.html?game=vcs',wait_until='domcontentloaded',timeout=45000)
   expect(page.locator('#j247-results li')).to_have_count(51,timeout=20000)
   page.goto(base+'maps.html',wait_until='domcontentloaded',timeout=45000)
   expect(page.locator('#worldCount')).to_contain_text('13')
   page.goto(base+'map-hub.html?game=ctw',wait_until='domcontentloaded',timeout=45000)
   page.locator('#j274-collection').select_option('jumps')
   expect(page.locator('#j273-camera .j271-source-progress')).to_contain_text('1 / 30')
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   context.close()
   print('PASS real offline worker, preserved legacy cache, world navigation and local collection progress:',engine,width)
  browser.close()
finally:
 server.shutdown()
