#!/usr/bin/env python3
"""Actual source-derived 96x110 grid, built-site Chromium at phone/desktop.
External tile and API requests are blocked: this test uses only the bundled
approximation, not fake dense data. One synthetic local import tests priority.
"""
from array import array
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright,expect

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'data/atlas368-approx-terrain.json').is_file()
assert (PUBLIC/'atlas-vi.html').is_file()
assert not (PUBLIC/'elevation-6.bin').exists(),'This scenario requires no bundled dense DEM'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=64
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{server.server_port}/'
out=ROOT/'qa-evidence'/'atlas368-browser'
out.mkdir(parents=True,exist_ok=True)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,args=['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  for width,height in ((390,844),(1440,900)):
   ctx=browser.new_context(viewport={'width':width,'height':height},
     reduced_motion='reduce',is_mobile=width<700,has_touch=width<700)
   ctx.route('https://**/*',lambda route:route.abort())
   page=ctx.new_page()
   requests=[]
   page.on('request',lambda req:requests.append(req.url))
   page.route('**/elevation-6.bin',lambda route:route.fulfill(status=404,body='not installed'))
   page.goto(BASE+'atlas-vi.html',wait_until='domcontentloaded',timeout=60000)
   expect(page.locator('#atlasCanvas')).to_be_visible(timeout=35000)
   page.wait_for_function("""() => typeof window.teamJuraNav?.getDimension==='function'""")
   assert not any('atlas368-approx-terrain.json' in x for x in requests),'data loaded without opt-in'
   page.locator('#jura3d').click()
   page.wait_for_function("""() => teamJuraNav.terrain().hasApproximate()&&teamJuraNav.terrain().isActive()""",timeout=30000)
   assert not page.evaluate('teamJuraNav.terrain().hasElevation()')
   expect(page.locator('#jura3dCanvas')).to_be_visible()
   expect(page.locator('#juraNavDimension')).to_contain_text('Approx.')
   expect(page.locator('#j362TerrainNotice')).to_be_hidden()
   assert page.evaluate("""() => getComputedStyle(document.getElementById('jura3dCanvas')).opacity==='1'"""),'approximate geometry is hidden waiting for texture'
   expect(page.locator('.jura-nav-bar #j368CoverageToggle')).to_be_visible()
   expect(page.locator('#jura3dTools #j368CoverageToggle')).to_have_count(0)
   assert page.evaluate("""() => document.documentElement.scrollWidth<=innerWidth+2""")
   page.locator('#j368CoverageToggle').click()
   expect(page.locator('#j368CoverageToggle')).to_have_attribute('aria-pressed','true')
   expect(page.locator('#j368CoverageLegend')).to_be_visible()
   assert page.evaluate('teamJuraNav.terrain().getCoverageVisible()')
   page.screenshot(path=str(out/f'approximate-coverage-{width}.png'),animations='disabled')
   page.locator('#j368CoverageToggle').click()
   expect(page.locator('#j368CoverageLegend')).to_be_hidden()
   page.screenshot(path=str(out/f'approximate-relief-{width}.png'),animations='disabled')
   page.locator('#jura2d').click()
   expect(page.locator('#atlasCanvas')).to_be_visible()
   expect(page.locator('#juraNavDimension')).to_have_text('2D')
   assert not page.evaluate('teamJuraNav.terrain().hasApproximate()')
   page.locator('#jura3d').click()
   page.wait_for_function("""() => teamJuraNav.terrain().hasApproximate()&&teamJuraNav.terrain().isActive()""",timeout=30000)
   assert sum('atlas368-approx-terrain.json' in x for x in requests)==1,'approximation not cached in session'
   # Opening the actual Rockstar viewer must return to 2D, without mixing
   # the two coordinate systems, losing the selected research layer or
   # dropping the locally cached source grid. No external poster download.
   layer=page.locator('#layer')
   original_layer=layer.input_value()
   expect(layer.locator('option[value="dupzor,51"]')).to_have_count(1)
   expect(page.locator('#j143-official-button')).to_be_visible()
   page.locator('#j143-official-button').click()
   expect(page.locator('#j143-official-layer')).to_be_visible()
   expect(page.locator('#juraNavDimension')).to_have_text('2D')
   assert not page.evaluate('teamJuraNav.terrain().isActive()')
   assert not page.evaluate('teamJuraNav.terrain().hasApproximate()')
   page.locator('[data-j143="close"]').click()
   expect(page.locator('#j143-official-layer')).to_be_hidden()
   expect(layer).to_have_value(original_layer)
   page.locator('#jura3d').click()
   page.wait_for_function("""() => teamJuraNav.terrain().hasApproximate()&&teamJuraNav.terrain().isActive()""",timeout=30000)
   assert sum('atlas368-approx-terrain.json' in x for x in requests)==1
   # Real file input can replace the approximation without losing map mode.
   fixture=array('H',[28000])*(1536*1748);fixture[0]=28113;fixture[-1]=28317
   page.locator('#juraElevationFile').set_input_files({'name':'synthetic-local.bin','mimeType':'application/octet-stream','buffer':fixture.tobytes()})
   page.wait_for_function("""() => teamJuraNav.terrain().hasElevation()&&!teamJuraNav.terrain().hasApproximate()""",timeout=30000)
   expect(page.locator('#j368CoverageToggle')).to_be_hidden()
   expect(page.locator('#juraNavDimension')).to_have_text('3D')
   assert not page.evaluate("document.body.classList.contains('j368-approximate')")
   page.locator('#jura2d').click()
   expect(page.locator('#atlasCanvas')).to_be_visible()
   print(f'Atlas 36.8 {width}px: actual approximate dataset, active WebGL, persistent approximation label, coverage toggle, same-session reuse and dense override PASS')
   ctx.close()
  browser.close()
finally:
 server.shutdown()
