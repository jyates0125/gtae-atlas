#!/usr/bin/env python3
"""Atlas 36.5: rendered, source-credited map and world-switch browser acceptance.
Uses actual built public HTML/JS/CSS and Chromium. Does not test external network
availability or certify that any map/terrain dataset is accurate.
"""
import re
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert all((PUBLIC/name).is_file() for name in
           ('atlas.html','atlas-online.html','atlas-vi.html',
            'atlas364-map-credit.js','atlas364-map-credit.css'))
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
    daemon_threads=True
    request_queue_size=64

server=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{server.server_port}/'
ROUTES=[
    ('atlas.html','game5','GTA V · Los Santos'),
    ('atlas-online.html','gameOnline','GTA Online · Los Santos'),
    ('atlas-vi.html','game6','GTA VI · Leonida')
]
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width,height in ((390,844),(1440,900)):
   mobile=width<700
   ctx=browser.new_context(viewport={'width':width,'height':height},
       is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   # Offline-safe: the map shell must be usable even without remote tiles
   # or GTADB API access. Local data files remain available.
   ctx.route('https://**/*',lambda route:route.abort())
   page=ctx.new_page()
   errors=[]
   page.on('pageerror',lambda err:errors.append(str(err)))
   for route,active,title in ROUTES:
    page.goto(BASE+route,wait_until='domcontentloaded',timeout=60000)
    expect(page.locator('#atlasCanvas')).to_be_visible(timeout=25000)
    expect(page.locator('#'+active)).to_have_attribute('aria-pressed','true',timeout=25000)
    expect(page.locator('#mapTitle')).to_have_text(title,timeout=25000)
    expect(page.locator('#layer option')).not_to_have_count(0,timeout=25000)
    strip=page.locator('.map-wrap > .credits-line')
    expect(strip).to_be_visible()
    assert strip.count()==1,(route,'duplicate credit')
    assert page.locator('a[data-j87-maps-link]').count()==1
    assert page.locator('nav[aria-label="Atlas pages"] a[data-j87-maps-link]').count()==1
    assert page.locator('[data-j87-maps-link][style]').count()==0
    for href in ('https://map.gtadb.org/',
                 'https://creativecommons.org/licenses/by/4.0/',
                 './atlas-credits.html#licensed'):
     assert strip.locator('a').evaluate_all(
        '(nodes,h)=>nodes.some(a=>a.getAttribute("href")===h)',href), (route,href)
    geometry=page.evaluate("""() => {
      const rect=s=>document.querySelector(s).getBoundingClientRect();
      const credit=rect('.credits-line'),map=rect('.map-wrap');
      const actions=rect('.map-actions');
      const style=getComputedStyle(document.querySelector('.credits-line'));
      return {credit:{x:credit.x,y:credit.y,width:credit.width,height:credit.height,bottom:credit.bottom},
       map:{x:map.x,y:map.y,width:map.width,height:map.height,bottom:map.bottom},
       actions:{y:actions.y,bottom:actions.bottom},
       display:style.display,overflow:document.documentElement.scrollWidth-innerWidth,
       duplicates:document.querySelectorAll('.credits-line').length};
    }""")
    credit=geometry['credit']
    mapbox=geometry['map']
    assert geometry['duplicates']==1,(route,geometry)
    assert credit['height']>=26 and credit['height']<=55,(route,'credit too large',geometry)
    assert abs(credit['bottom']-mapbox['bottom'])<=3,(route,'credit not map-bottom',geometry)
    assert credit['width']<=mapbox['width']+2,(route,'credit overflow',geometry)
    assert geometry['actions']['bottom']<credit['y']-2,(route,'map buttons overlap credits',geometry)
    assert geometry['overflow']<=2,(route,'page horizontal overflow',geometry)

    # Layer choice and map-world toggle must keep source names fresh without
    # altering the actual artwork provenance.
    page.locator('#game6').click()
    expect(page.locator('#mapTitle')).to_have_text('GTA VI · Leonida',timeout=15000)
    page.locator('#layer').select_option('day')
    if not mobile:
     expect(page.locator('#j364MapViewCredit')).to_contain_text('Rockstar artwork')
    page.locator('#layer').select_option('dupzor,51')
    if not mobile:
     expect(page.locator('#j364MapViewCredit')).to_contain_text('DUPZOR V51')
    page.locator('#game5').click()
    expect(page.locator('#mapTitle')).to_have_text('GTA V · Los Santos')
    if not mobile:
     expect(page.locator('#j364MapViewCredit')).to_contain_text('GTA V radar')
    page.locator('#gameOnline').click()
    expect(page.locator('#mapTitle')).to_have_text('GTA Online · Los Santos')
    if not mobile:
     expect(page.locator('#j364MapViewCredit')).to_contain_text('GTA V radar')
    assert not errors,(route,width,errors[:4])
    print(f'Atlas 36.5 {width}px {route}: single compact source credit, active world, '
          'map controls clear, working in-page styles and navigation PASS')
   ctx.close()
  browser.close()
finally:
 server.shutdown()
