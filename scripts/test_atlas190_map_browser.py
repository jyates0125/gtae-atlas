#!/usr/bin/env python3
"""Atlas 19.0 production-HTML/browser acceptance for IV, SA, two episodes."""
import os, threading
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
if not (PUBLIC/'atlas-iv.html').is_file() or not (PUBLIC/'atlas-sa.html').is_file():
    raise SystemExit('Build the actual Cloudflare public/ output first')
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base='http://127.0.0.1:%s/'%server.server_port
engine=os.getenv('ATLAS_BROWSER','chromium')
try:
 with sync_playwright() as pw:
  for kind,width,height in [('desktop',1440,900),('mobile',390,844)]:
   opts={'headless':True}
   if engine=='msedge':opts['channel']='msedge'
   browser=pw.chromium.launch(**opts)
   context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1)
   page=context.new_page()
   page.goto(base+'atlas-iv.html',wait_until='domcontentloaded',timeout=45000)
   page.wait_for_function("Number(document.getElementById('visibleCount').textContent)>2000",timeout=25000)
   page.locator('#j190-marker-status').wait_for(state='visible')
   assert page.locator('#j190-iv-scope option').count()==4
   page.locator('#j190-iv-scope').select_option('iv')
   page.wait_for_function("document.getElementById('visibleCount').textContent==='200'",timeout=15000)
   assert page.locator('#j190-marker-status').inner_text().startswith('200 matching')
   assert page.locator('.classic-result').count()>0
   page.locator('.classic-result').first.click()
   assert 'Flying Rat' in page.locator('#detailName').inner_text()
   assert page.locator('#detailCoord').inner_text().count(',')>=1
   assert 'pigeon-locator' in page.locator('#detailSource').get_attribute('href')
   page.locator('#j190-iv-found').click()
   assert 'Mark uncollected' in page.locator('#j190-iv-found').inner_text()
   page.locator('#j190-iv-hide-found').check()
   assert page.locator('#resultCount').inner_text()=='199'
   assert page.locator('#visibleCount').inner_text()=='200'
   page.locator('#j190-iv-scope').select_option('tlad')
   page.wait_for_function("document.getElementById('visibleCount').textContent==='50'")
   assert page.locator('#j190-iv-scope').input_value()=='tlad'
   page.locator('#j190-iv-scope').select_option('tbogt')
   assert page.locator('#visibleCount').inner_text()=='50'
   page.locator('#classicPins').click()
   page.wait_for_function("document.querySelector('#j190-marker-status')?.textContent?.includes('Map symbols hidden')",timeout=10000)
   page.locator('#classicPins').click()
   page.wait_for_function("document.querySelector('#j190-marker-status')?.textContent?.includes('matching landmark records')",timeout=10000)
   proof=ROOT/'qa-evidence'/engine
   proof.mkdir(parents=True,exist_ok=True)
   page.locator('#classicMapShell').screenshot(path=str(proof/('atlas-190-iv-collectibles-'+kind+'.png')),animations='disabled',timeout=30000)
   page.goto(base+'atlas-sa.html',wait_until='domcontentloaded',timeout=45000)
   page.wait_for_function("document.querySelector('#j190-sa-start')&&!document.querySelector('#j190-sa-start').disabled",timeout=30000)
   assert page.locator('.pin-source-projected').count()==50
   page.locator('#j190-sa-start').select_option('snapshots:1')
   route=page.evaluate("window.TeamJuraSARoute.getRoute()")
   assert len(route)==15 and route[0]=='snapshots:1',route
   page.locator('#j190-sa-finish').select_option('snapshots:2')
   route=page.evaluate("window.TeamJuraSARoute.getRoute()")
   assert route[-1]=='snapshots:2' and route.count('snapshots:2')==1,route
   assert page.locator('.j190-sa-step').count()==15
   assert page.locator('.j190-sa-line').count()==1
   # Existing native checklist remains the single source of progress.
   one=route[1]
   slot=int(one.split(':')[1])
   page.locator('#item-%s input[type=checkbox]'%slot).check()
   page.wait_for_function("(id)=>!window.TeamJuraSARoute.getRoute().includes(id)",arg=one,timeout=10000)
   assert page.locator('#j190-sa-list .j190-sa-stop').count()==15
   page.locator('#mapContainer').screenshot(path=str(proof/('atlas-190-sa-route-'+kind+'.png')),animations='disabled',timeout=30000)
   for scope in ('tlad','tbogt'):
    page.goto(base+'map-hub.html?game='+scope,wait_until='domcontentloaded',timeout=45000)
    link=page.locator('#j190-episode-collectibles')
    link.wait_for(state='visible',timeout=15000)
    assert link.get_attribute('href')=='./atlas-iv.html?scope='+scope
   if kind=='mobile':
    for target in ('#j190-episode-collectibles',):
     assert not page.locator(target).evaluate('(e)=>e.scrollWidth>e.clientWidth+4')
   print('PASS Atlas 19.0 '+engine+' '+kind+': IV 200/50/50 scope, search, found, clusters, SA map route, classic episode links')
   context.close();browser.close()
finally:
 server.shutdown()
