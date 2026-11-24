#!/usr/bin/env python3
"""Owner-device regression using actual pinned CC BY 4.0 GTADB coarse tiles.
Never packages downloaded test images or makes new bulk source requests.
Only the existing 16 source overview tiles are retrieved from their pinned
GitHub revision and git-blob-verified, then supplied to Chromium via routing.
"""
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from hashlib import sha1
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.request import urlopen, Request
from urllib.parse import unquote, urlparse
import json
from playwright.sync_api import sync_playwright,expect

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
source=json.loads((PUBLIC/'data/atlas368-approx-terrain.json').read_text())['source']
rev=source['mapRevision']
def tile(pair):
 y,x=pair
 name=f'0,{y},{x}.jpg'
 url=f'https://raw.githubusercontent.com/rolux/gtadb.org/{rev}/maps/tiles/6/yanis,18/0/{name}'
 with urlopen(Request(url,headers={'User-Agent':'Team-Jura-Atlas-source-check'}),timeout=25) as f:
  data=f.read(500000)
 assert sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==source['tileBlobs'][y][x],name
 assert data.startswith(b'\xff\xd8'),name
 return name,data
with ThreadPoolExecutor(max_workers=4) as pool:
 tiles=dict(pool.map(tile,[(y,x) for y in range(4) for x in range(4)]))
assert len(tiles)==16

class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=64
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{server.server_port}/'
out=ROOT/'qa-evidence'/'atlas369'
out.mkdir(parents=True,exist_ok=True)
def source_route(route):
 path=unquote(urlparse(route.request.url).path)
 name=path.rsplit('/',1)[-1]
 if '/maps/tiles/6/yanis,18/0/' in path and name in tiles:
  route.fulfill(status=200,body=tiles[name],content_type='image/jpeg',headers={'Access-Control-Allow-Origin':'*'})
 else:route.abort()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,args=['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  for width,height in ((390,844),(1366,768)):
   ctx=browser.new_context(viewport={'width':width,'height':height},is_mobile=width<700,has_touch=width<700,reduced_motion='reduce')
   ctx.route('https://**/*',source_route)
   page=ctx.new_page()
   for file in ('atlas.html','atlas-online.html','atlas-vi.html'):
    page.goto(BASE+file,wait_until='domcontentloaded',timeout=60000)
    expect(page.locator('#atlasCanvas')).to_be_visible(timeout=30000)
    expect(page.locator('#j369-site-tools #j132-nav-toggle')).to_be_visible()
    expect(page.locator('#j89-shell')).to_be_hidden()
    expect(page.locator('.credits-line')).to_have_count(1)
    assert page.locator('#original').is_hidden()
    hq=page.locator('#j369-site-tools>a')
    menu=page.locator('#j132-nav-toggle')
    expect(hq).to_be_visible()
    a,b=hq.bounding_box(),menu.bounding_box()
    assert a and b and a['x']+a['width']<=b['x']+1,(file,width,a,b)
    assert b['x']+b['width']<=width+2,(file,width,b)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(file,width,'horizontal overflow')
   # Canonical VI page: no second confirmation step, no import required.
   page.wait_for_function('typeof window.teamJuraNav?.getDimension==="function"')
   expect(page.locator('.jura-nav-bar #j143-official-button')).to_be_visible()
   page.locator('#layer').select_option('research,view')
   page.locator('#jura3d').click()
   page.wait_for_function('teamJuraNav.terrain().isActive()&&teamJuraNav.terrain().hasApproximate()',timeout=30000)
   page.wait_for_function('teamJuraNav.terrain().hasMapTexture()',timeout=35000)
   expect(page.locator('#juraNavDimension')).to_contain_text('Approx.')
   expect(page.locator('#j362TerrainNotice')).to_be_hidden()
   expect(page.locator('#jura3dCanvas')).to_be_visible()
   page.screenshot(path=str(out/f'actual-gtadb-textured-{width}.png'),animations='disabled')
   page.locator('#jura2d').click()
   expect(page.locator('#atlasCanvas')).to_be_visible()
   assert not page.evaluate('teamJuraNav.terrain().isActive()')
   page.locator('#jura3d').click()
   page.wait_for_function('teamJuraNav.terrain().isActive()',timeout=30000)
   page.keyboard.press('Escape')
   assert page.evaluate('teamJuraNav.getDimension()')=='2d'
   page.locator('#j143-official-button').click()
   expect(page.locator('#j143-official-layer')).to_be_visible()
   page.locator('[data-j143="close"]').click()
   expect(page.locator('#j143-official-layer')).to_be_hidden()
   expect(page.locator('#layer')).to_have_value('research,view')
   print(f'Atlas 36.9 {width}x{height}: 3 map headers, one attribution strip, direct 3D, actual pinned tile texture, return to 2D and official exit PASS')
   ctx.close()
  browser.close()
finally:
 server.shutdown()
