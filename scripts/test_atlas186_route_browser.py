#!/usr/bin/env python3
"""Real Chromium/mobile Cayo 18.6 route behavior, saved state, link rehydration.
This is complementary to the existing Cayo 18.5 interaction suite."""
import os, threading, urllib.parse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public'
if not (OUT/'heist-cayo-perico.html').is_file():
 raise SystemExit('Build the actual public Cloudflare files first')
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(OUT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/heist-cayo-perico.html'
engine=os.getenv('ATLAS_BROWSER','chromium')
try:
 with sync_playwright() as pw:
  for kind,viewport in [('desktop',{'width':1440,'height':900}),('phone',{'width':390,'height':844})]:
   args={'headless':True}
   if engine=='msedge':args['channel']='msedge'
   browser=pw.chromium.launch(**args)
   ctx=browser.new_context(viewport=viewport,device_scale_factor=1)
   page=ctx.new_page()
   page.goto(url,wait_until='domcontentloaded',timeout=50000)
   page.locator('#j186-route').wait_for(state='visible',timeout=30000)
   page.wait_for_function("document.querySelectorAll('.j180-chest').length===19",timeout=20000)
   assert page.locator('.j186-route-layer').count()==1,'Route must be drawn in the SAME map world'
   assert page.locator('.j186-filter').count()==14,'The route planner must match all 14 legend categories'
   assert page.locator('.j186-map-jump').count()==1,'One route shortcut exists in map header'
   # A real click on a crowded map marker opens the 18.5 nearby chooser.
   page.locator('.j181-hotspot[data-category="control"]').first.click()
   page.locator('.j185-cluster-choice').filter(has_text='Airstrip infiltration').click()
   start=page.locator('.j180-pin-info .j186-pin-actions').get_by_role('button',name='Start route here')
   start.click()
   a=page.evaluate("window.teamJuraCayoPinRoute.getState()")
   assert a['start']=='entry-0' and a['order'][0]=='entry-0',a
   assert len(a['order'])>1,'Nearest route must include candidate locations'
   assert page.locator('.j186-route-line').count()==1,'Route line visible on the island after pin click'
   assert page.locator('.j186-route-badges .j186-stop').count()==len(a['order']),'All route steps need readable numbers above the source map'
   assert page.locator('.j186-stop-item').count()==len(a['order']),'Visible stop list matches island line'
   # Save actual Chromium/Edge evidence showing BOTH the map route overlay
   # and the companion mission planner, on desktop and a phone-width page.
   proof=ROOT/'qa-evidence'/engine
   proof.mkdir(parents=True,exist_ok=True)
   page.locator('.j180-map-frame').screenshot(path=str(proof/('cayo-186-route-map-'+kind+'.png')),animations='disabled')
   page.locator('#j186-route').screenshot(path=str(proof/('cayo-186-route-planner-'+kind+'.png')),animations='disabled')
   assert page.locator('.j186-start').count()==1,'Start pin is highlighted'
   page.locator('.j186-preset').filter(has_text='Equipment').click()
   b=page.evaluate("window.teamJuraCayoPinRoute.getState()")
   assert b['categories']==['bolts','grapple','clothes','truck','powder'],b['categories']
   nodes=page.evaluate("window.teamJuraCayoPinRoute.getNodes()")
   by_id={n['id']:n for n in nodes}
   eligible=[n for n in nodes if n['cat'] in b['categories'] and n['id']!=b['start']]
   s=by_id[b['start']]
   assert eligible,'Equipment stops must exist'
   def dist(n):return ((n['x']-s['x'])*1.0174)**2+(n['y']-s['y'])**2
   expected=min(eligible,key=lambda n:(dist(n),n['id']))['id']
   assert b['order'][1]==expected,('nearest next marker',b['order'][1],expected)
   page.locator('.j186-action').filter(has_text='Reverse stops').click()
   manual=page.evaluate("window.teamJuraCayoPinRoute.getState()")
   assert manual['mode']=='manual' and manual['order'][0]=='entry-0'
   assert manual['order'][1:]==list(reversed(b['order'][1:]))
   page.locator('.j186-done').first.click()
   done=page.evaluate("window.teamJuraCayoPinRoute.getState()")
   assert len(done['completed'])==1,'Visited stop should persist'
   page.reload(wait_until='domcontentloaded')
   page.locator('#j186-route').wait_for(state='visible',timeout=30000)
   saved=page.evaluate("window.teamJuraCayoPinRoute.getState()")
   assert saved['order']==done['order'] and saved['completed']==done['completed'],kind+' saved route'
   # Verify Cayo old 16.7 map route key remains independent.
   assert page.evaluate("typeof window.teamJuraCayoRoute?.setRoute")== 'function'
   # Explicit start from a chest; it loads async. Reload cannot discard it.
   page.wait_for_function("document.querySelectorAll('.j180-chest').length===19")
   assert page.evaluate("window.teamJuraCayoPinRoute.startFrom('chest-19')") is True
   page.reload(wait_until='domcontentloaded')
   page.locator('#j186-route').wait_for(state='visible',timeout=30000)
   page.wait_for_function("document.querySelectorAll('.j180-chest').length===19",timeout=20000)
   reloaded=page.evaluate("window.teamJuraCayoPinRoute.getState()")
   assert reloaded['start']=='chest-19','Async daily-chest module must not erase saved starting pin'
   assert page.locator('.j186-route-layer').count()==1,'One route overlay after reloading chest start'
   # Cayo 18.6: Start-from-map is a direct player action, including the
   # crowded-marker chooser. The stop order must originate at that pin.
   picker=page.locator('#j186-pick-start')
   assert picker.count()==1,'Direct start-pin tool exists'
   picker.click()
   assert picker.get_attribute('aria-pressed')=='true','Selecting a start is an explicit mode'
   page.locator('.j181-hotspot[data-category="control"]').first.click()
   page.locator('.j185-cluster-choice').filter(has_text='Airstrip infiltration').click()
   picked=page.evaluate("window.teamJuraCayoPinRoute.getState()")
   assert picked['start']=='entry-0','Clicked colorful pin becomes actual route origin'
   assert picker.get_attribute('aria-pressed')=='false','Start selection exits after pin choice'
   page.locator('.j186-action').filter(has_text='Build nearest route').click()
   assert page.locator('.j186-route-line').count()==1,'Route drawn from clicked pin'
   evidence=ROOT/'qa-evidence'/engine
   evidence.mkdir(parents=True,exist_ok=True)
   page.locator('.j180-map-frame').screenshot(path=str(evidence/('cayo-186-island-route-'+kind+'.png')),animations='disabled',timeout=35000)
   page.locator('#j186-route').screenshot(path=str(evidence/('cayo-186-route-planner-'+kind+'.png')),animations='disabled',timeout=35000)
   # Shared plans must actually rehydrate in a new tab, without
   # transferring checklist keys or personal notes.
   shared={'version':1,'start':'chest-4','order':['chest-4','secondary-0'],
           'categories':['secondary'],'mode':'manual','chestMode':'all','limit':10}
   link=url+'?cayoRoute='+urllib.parse.quote(__import__('json').dumps(shared,separators=(',',':')))
   other=ctx.new_page();other.goto(link,wait_until='domcontentloaded',timeout=50000)
   other.locator('#j186-route').wait_for(state='visible',timeout=30000)
   other.wait_for_function("document.querySelectorAll('.j180-chest').length===19",timeout=20000)
   imported=other.evaluate("window.teamJuraCayoPinRoute.getState()")
   assert imported['start']=='chest-4' and imported['order'][:2]==['chest-4','secondary-0'],'Shared URL restores route start and stop sequence'
   other.close()
   # Phone viewport should not gain horizontal scrolling from the new panel.
   if kind=='phone':
    bad=page.locator('#j186-route').evaluate('(e)=>e.scrollWidth>e.clientWidth+4')
    assert not bad,'Phone route panel must not overflow horizontally'
   ctx.close();browser.close()
   print('PASS Cayo 18.6 route: '+kind+' start/presets/nearest/line/manual/visited/reload/chest')
finally:
 server.shutdown()
