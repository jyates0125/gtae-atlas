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
   # Full-map tools must still access the same global directory.
   page.locator('#j171-expand-map').click()
   page.locator('#j217-vi-hub > summary').click()
   page.locator('#j369-full-map-menu').click()
   expect(page.locator('.j369-menu-portal #j132-nav-drawer')).to_be_visible()
   expect(page.locator('#j132-nav-drawer')).to_have_count(1)
   page.keyboard.press('Escape')
   expect(page.locator('#j132-nav-drawer')).to_be_hidden()
   expect(page.locator('#j171-expand-map')).to_have_attribute('aria-pressed','true')
   page.locator('#j217-vi-hub > summary').click()
   page.locator('#j171-expand-map').click()
   # Canonical VI page: no second confirmation step, no import required.
   page.wait_for_function('typeof window.teamJuraNav?.getDimension==="function"')
   expect(page.locator('.jura-nav-bar #j143-official-button')).to_be_visible()
   expect(page.locator('#layer option')).to_have_count(3)
   labels=page.locator('#layer option').evaluate_all('(nodes)=>nodes.map(n=>n.textContent)')
   assert labels==['In-game Map','Scaly · YANIS V18','Loki · DUPZOR V51'], labels
   page.locator('#layer').select_option('scaly,view')
   expect(page.locator('#legend .j371-landmark-legend')).to_have_count(1)
   page.locator('#jura3d').click()
   page.wait_for_function('teamJuraNav.terrain().isActive()||teamJuraNav.terrain().getFrameReport()!==null',timeout=30000)
   assert page.evaluate('teamJuraNav.terrain().isActive()'),page.evaluate('teamJuraNav.terrain().getFrameReport()')
   page.wait_for_function('teamJuraNav.terrain().hasMapTexture()',timeout=35000)
   assert page.evaluate('teamJuraNav.terrain().hasVisibleFrame()'), '3D activated without a drawn frame'
   assert page.evaluate('teamJuraNav.terrain().verifyFrame()'), '3D framebuffer contains only clear color'
   assert page.evaluate('jura3dCanvas.width>100&&jura3dCanvas.height>100'), '3D rendered at hidden canvas dimensions'
   expect(page.locator('#juraNavDimension')).to_contain_text('Approx.')
   expect(page.locator('#j362TerrainNotice')).to_be_hidden()
   expect(page.locator('#jura3dCanvas')).to_be_visible()
   pins=page.locator('.jura-3d-pin.j371-landmark-pin')
   if pins.count():
    style=pins.first.evaluate('(p)=>({width:p.offsetWidth,color:getComputedStyle(p).backgroundColor,border:getComputedStyle(p).borderTopColor,symbol:p.textContent})')
    assert style=={'width':16,'color':'rgb(73, 49, 94)','border':'rgb(233, 189, 121)','symbol':'◆'},style
   page.screenshot(path=str(out/f'actual-gtadb-textured-{width}.png'),animations='disabled')
   # The orbit gesture must change the camera, not pan the hidden 2D canvas.
   page.locator('#togglePins').click()
   canvas=page.locator('#jura3dCanvas')
   canvas.scroll_into_view_if_needed()
   box=canvas.bounding_box()
   before=page.evaluate('teamJuraNav.terrain().getView()')
   x=box['x']+box['width']*.48
   y=box['y']+box['height']*.48
   page.mouse.move(x,y)
   page.mouse.down()
   page.mouse.move(x+55,y-20,steps=8)
   page.mouse.up()
   page.wait_for_function("(b)=>Math.abs(teamJuraNav.terrain().getView().bearing-b)>.2",arg=before['bearing'])
   assert page.evaluate('teamJuraNav.terrain().verifyFrame()'), 'Rotating produced a blank frame'
   expect(page.locator('#j371-compass')).to_be_visible()
   page.locator('#j371-compass').click()
   page.wait_for_function('teamJuraNav.terrain().getView().bearing===0')
   page.evaluate('teamJuraNav.terrain().zoom(.1)')
   page.wait_for_timeout(300)
   near=page.evaluate('teamJuraNav.terrain().getView()')
   page.evaluate('teamJuraNav.terrain().zoom(10)')
   page.wait_for_function('(near)=>teamJuraNav.terrain().getView().extent>near',arg=near['extent'])
   page.locator('#resetView').click()
   fitted=page.evaluate('teamJuraNav.terrain().getView()')
   assert fitted['bearing']==0 and fitted['distance']>15000 and abs(fitted['center']['x']+4099.5243)<1, fitted
   assert page.evaluate('teamJuraNav.terrain().verifyFrame()'), 'Whole-world Fit produced a blank frame'
   after=fitted
   page.locator('#layer').select_option('day')
   assert page.evaluate('teamJuraNav.terrain().isActive()')
   assert page.evaluate('teamJuraNav.terrain().getView()')==after,'Style change reset 3D camera'
   page.locator('#layer').select_option('dupzor,51')
   assert page.evaluate('teamJuraNav.terrain().getView()')==after
   page.locator('#layer').select_option('scaly,view')
   page.wait_for_function('teamJuraNav.terrain().hasMapTexture()',timeout=35000)
   page.locator('#togglePins').click()
   page.locator('#j368CoverageToggle').click()
   expect(page.locator('#j368CoverageToggle')).to_have_attribute('aria-pressed','true')
   expect(page.locator('#j368CoverageLegend')).to_be_visible()
   expect(page.locator('.zoom')).to_be_hidden()
   page.locator('#j368CoverageToggle').click()
   expect(page.locator('#j368CoverageLegend')).to_be_hidden()
   page.locator('#jura2d').click()
   expect(page.locator('#atlasCanvas')).to_be_visible()
   assert not page.evaluate('teamJuraNav.terrain().isActive()')
   page.wait_for_load_state('networkidle',timeout=25000)
   page.locator('#jura3d').click()
   page.wait_for_function('teamJuraNav.terrain().isActive()',timeout=30000)
   assert page.evaluate('teamJuraNav.terrain().verifyFrame()'), 'Cached reentry blank frame'
   page.keyboard.press('Escape')
   assert page.evaluate('teamJuraNav.getDimension()')=='2d'
   page.locator('#j143-official-button').click()
   expect(page.locator('#j143-official-layer')).to_be_visible()
   page.locator('[data-j143="close"]').click()
   expect(page.locator('#j143-official-layer')).to_be_hidden()
   expect(page.locator('#layer')).to_have_value('scaly,view')
   print(f'Atlas 36.9 {width}x{height}: 3 map headers, one attribution strip, direct 3D, actual pinned tile texture, return to 2D and official exit PASS')
   ctx.close()
  browser.close()
finally:
 server.shutdown()
