import json,threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 request_queue_size=64
 daemon_threads=True
with Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'public'))) as server:
 threading.Thread(target=server.serve_forever,daemon=True).start()
 base=f'http://127.0.0.1:{server.server_port}/'
 with sync_playwright() as pw:
  browser=pw.chromium.launch()
  ctx=browser.new_context(viewport={'width':390,'height':844},service_workers='block')
  ctx.route('https://**/*',lambda route:route.abort())
  p=ctx.new_page();p.goto(base+'atlas-build-identity.json')
  p.evaluate("""async()=>{const c=await caches.open('team-jura-atlas-v41-data');const old={};for(let i=0;i<600;i++)old['L'+i]=['Old raw marker '+i,[i,i]];await c.put('https://raw.githubusercontent.com/rolux/gtadb.org/main/map/data/6/landmarks.json',new Response(JSON.stringify(old)));}""")
  ctx.route('**/data/gtadb-6.json*',lambda route:route.abort())
  p.goto(base+'atlas-vi.html',wait_until='domcontentloaded')
  expect(p.locator('#dataStatus')).to_contain_text('Reviewed VI landmarks unavailable offline',timeout=30000)
  ctx.unroute('**/data/gtadb-6.json*')
  p.reload(wait_until='domcontentloaded')
  expect(p.locator('#dataStatus')).to_contain_text('4,501 attributed provisional',timeout=30000)
  assert p.evaluate("""async()=>{const c=await caches.open('team-jura-atlas-v41-vi-reviewed-data');return (await c.keys()).length===1}""")
  ctx.route('**/data/gtadb-6.json*',lambda route:route.abort())
  p.reload(wait_until='domcontentloaded')
  expect(p.locator('#dataStatus')).to_contain_text('4,501 cached reviewed provisional',timeout=30000)
  assert p.evaluate("""async()=>{const c=await caches.open('team-jura-atlas-v41-data');return !!(await c.match('https://raw.githubusercontent.com/rolux/gtadb.org/main/map/data/6/landmarks.json'))}""")
  ctx.close();browser.close()
print('PASS VI offline reviewed-cache isolation, fresh snapshot and reviewed offline recovery')
