#!/usr/bin/env python3
"""Atlas 36.7: three real maps recover from bad GTADB tile responses
without reloading or changing private progress. Uses synthetic 16px image
bytes through Playwright request interception; no external bulk fetch.
"""
import base64
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'atlas.html').exists(), 'Run Cloudflare build before browser tests'
PNG=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGUlEQVR4nGMwr136nxLMMGrAqAGjBgwXAwDLX1gfy17+uAAAAABJRU5ErkJggg==')
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=72
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{server.server_port}/'
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for filename in ('atlas.html','atlas-online.html','atlas-vi.html'):
   for width,height in ((390,844),(1440,900)):
    ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
    ctx.add_init_script("""() => {
      localStorage.setItem('jura3-progress','{"test-source-id":true}');
    }""")
    page=ctx.new_page()
    phase={'working':False,'seen':0}
    ctx.route('https://**/*',lambda route:route.abort())
    def tiles(route):
     phase['seen']+=1
     if phase['working']:
      route.fulfill(status=200,body=PNG,headers={
       'content-type':'image/png','access-control-allow-origin':'*',
       'cache-control':'no-store'})
     else:
      route.fulfill(status=404,body='tile offline',headers={
       'access-control-allow-origin':'*','cache-control':'no-store'})
    page.route('https://raw.githubusercontent.com/rolux/gtadb.org/**',tiles)
    page.goto(BASE+filename,wait_until='domcontentloaded',timeout=60000)
    expect(page.locator('#atlasCanvas')).to_be_visible(timeout=35000)
    expect(page.locator('#retryMapArtwork')).to_be_visible(timeout=25000)
    assert 'unavailable' in page.locator('#tileHealthText').inner_text().lower()
    assert phase['seen']>0,(filename,width,'fixture should have intercepted image requests')
    expected='{"test-source-id":true}'
    assert page.evaluate("localStorage.getItem('jura3-progress')")==expected
    before=page.evaluate("performance.getEntriesByType('navigation').length")
    phase['working']=True
    if width==390:
     page.locator('#retryMapArtwork').click(timeout=12000)
    else:
     page.evaluate("window.dispatchEvent(new Event('online'))")
    expect(page.locator('#tileHealthText')).to_contain_text('Illustration:',timeout=25000)
    expect(page.locator('#retryMapArtwork')).to_be_hidden(timeout=15000)
    assert page.evaluate("performance.getEntriesByType('navigation').length")==before
    assert page.evaluate("localStorage.getItem('jura3-progress')")==expected
    expect(page.locator('#atlasCanvas')).to_be_visible()
    expect(page.locator('.map-wrap .credits-line')).to_contain_text('GTADB.org')
    print(f'Atlas 36.7 {filename} at {width}px: failed tiles recovered, session and map preserved PASS')
    ctx.close()
  browser.close()
finally:
 server.shutdown()
