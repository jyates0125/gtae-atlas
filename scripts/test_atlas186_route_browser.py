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
# Modern Chromium/Edge can open many local asset requests before the route
# script hydrates; the default 5-connection backlog can return an empty
# browser document on busy Windows runners. Keep the test strict, serve reliably.
class StableStaticServer(ThreadingHTTPServer):
 request_queue_size=64
 daemon_threads=True
 allow_reuse_address=True
server=StableStaticServer(('127.0.0.1',0),partial(Quiet,directory=str(OUT)))
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
   errors=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   response=page.goto(url,wait_until='domcontentloaded',timeout=50000)
   assert response is not None and response.status==200, (
    f'Built Cayo workspace request failed for {engine}/{kind}: '
    f'{response.status if response else "no response"} {page.url}')
   try:
    page.locator('#j186-route').wait_for(state='visible',timeout=30000)
   except Exception as exc:
    diagnostic=page.evaluate("""() => ({
      heist:document.body.dataset.heist,
      source:!!document.querySelector('#j167-heist-map'),
      world:!!document.querySelector('#j167-heist-map .j167-world'),
      hotspots:!!document.querySelector('#j181-hotspots'),
      chests:!!document.querySelector('.j180-chest-layer'),
      stage:!!document.querySelector('.j180-stage'),
      frame:!!document.querySelector('.j180-map-frame'),
      routeScript:!!document.querySelector('script[src*="atlas186-cayo-route.js"]'),
      routePanel:!!document.querySelector('#j186-route'),
      routeApi:!!window.teamJuraCayoPinRoute
    })""")
    raise AssertionError(f'Cayo route did not initialize for {engine}/{kind}: {diagnostic} JS errors={errors[:5]}') from exc
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
   assert page.locator('#j188-advanced').count()==1,'Advanced routing options remain available but compact'
   assert page.locator('#j188-advanced').get_attribute('open') is None,'Advanced options should start collapsed'
   page.locator('#j188-advanced > summary').click()
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
   # Re-select all markers after the saved Equipment preset: the new
   # map-first quick filters intentionally hide the control-tower category.
   page.locator('.j188-preset[data-preset="all"]').click()
   # Confirm the map engine actually exposed the selected symbol. A route
   # filter showing "All" while the corresponding icon remains hidden is a
   # real user-facing regression, not a reason to force-click a hidden pin.
   try:
    page.wait_for_function("() => { const n=document.querySelector('.j181-hotspot[data-category=control]'); return n && !n.hidden; }",timeout=12000)
   except Exception:
    info=page.evaluate("""() => ({
      source:document.querySelector('#j167-heist-map')?.dataset.mapSource,
      asset:document.querySelector('#j167-heist-map')?.dataset.mapAsset,
      search:document.querySelector('#j167-heist-map .j167-search')?.value,
      controlLegend:document.querySelector('.j180-legend-row[data-cat=control]')?.getAttribute('aria-pressed'),
      routeCategories:window.teamJuraCayoPinRoute?.getState().categories,
      controlHidden:document.querySelector('.j181-hotspot[data-category=control]')?.hidden,
      availablePins:document.querySelectorAll('.j181-hotspot:not([hidden])').length
    })""")
    raise AssertionError('Visible-map filter did not reveal control tower: '+str(info))
   picker=page.locator('#j186-pick-start')
   assert picker.count()==1,'Direct start-pin tool exists'
   picker.click()
   assert picker.get_attribute('aria-pressed')=='true','Selecting a start is an explicit mode'
   page.locator('.j181-hotspot[data-category="control"]').first.click()
   page.locator('.j185-cluster-choice').filter(has_text='Airstrip infiltration').click()
   picked=page.evaluate("window.teamJuraCayoPinRoute.getState()")
   assert picked['start']=='entry-0','Clicked colorful pin becomes actual route origin'
   assert picker.get_attribute('aria-pressed')=='false','Start selection exits after pin choice'
   assert page.locator('.j180-pin-info').is_hidden(),'Start-picker marker card closes to reveal route controls on phone'
   page.locator('.j186-action').filter(has_text='Build nearest route').click()
   assert page.locator('.j186-route-line').count()==1,'Route drawn from clicked pin'
   evidence=ROOT/'qa-evidence'/engine
   evidence.mkdir(parents=True,exist_ok=True)
   page.locator('.j180-map-frame').screenshot(path=str(evidence/('cayo-186-island-route-'+kind+'.png')),animations='disabled',timeout=35000)
   page.locator('#j186-route').screenshot(path=str(evidence/('cayo-186-route-planner-'+kind+'.png')),animations='disabled',timeout=35000)
   # Shared plans must actually rehydrate in a new tab, without
   # transferring checklist keys or personal notes.
   shared={'version':1,'start':'chest-4','order':['chest-4','secondary-11'],
           'categories':['secondary'],'mode':'manual','chestMode':'all','limit':10,'finish':'exit-6'}
   link=url+'?cayoRoute='+urllib.parse.quote(__import__('json').dumps(shared,separators=(',',':')))
   other=ctx.new_page();other.goto(link,wait_until='domcontentloaded',timeout=50000)
   other.locator('#j186-route').wait_for(state='visible',timeout=30000)
   other.wait_for_function("document.querySelectorAll('.j180-chest').length===19",timeout=20000)
   imported=other.evaluate("window.teamJuraCayoPinRoute.getState()")
   assert imported['start']=='chest-4' and imported['order'][:2]==['chest-4','secondary-11'],'Shared URL restores route start and stop sequence'
   assert imported['finish']=='exit-6' and imported['order'][-1]=='exit-6','Shared URL preserves a distinct, final destination'
   other.close()
   # Atlas 18.7: selecting any map exit as the ending pin keeps it last,
   # even when exit markers are NOT in the active loot categories.
   assert page.evaluate("window.teamJuraCayoPinRoute.setFinish('exit-6')") is True
   page.evaluate("window.teamJuraCayoPinRoute.autoRoute()")
   ended=page.evaluate("window.teamJuraCayoPinRoute.getState()")
   assert ended['finish']=='exit-6' and ended['order'][-1]=='exit-6',ended
   assert ended['order'].count('exit-6')==1,'Finish appears exactly once'
   assert page.locator('.j186-final-stop').count()==1,'Finish labeled in player stop list'
   assert page.locator('.j186-route-badges .j186-last').count()==1,'Finish badge is visible on the same map'
   # Adding another stop must be routed before the chosen finish, not after it.
   page.locator('#j188-advanced > summary').click()
   page.locator('.j186-action').filter(has_text='Add next nearest').click()
   extended=page.evaluate("window.teamJuraCayoPinRoute.getState()")
   assert extended['order'][-1]=='exit-6' and len(extended['order'])==len(ended['order'])+1,extended
   # A checked stop becomes a new origin when resuming; checked stops remain
   # local and the destination is not dropped.
   first_pending=extended['order'][1]
   page.locator('.j186-done').first.click()
   page.locator('.j186-action').filter(has_text='Resume after visited').click()
   resumed=page.evaluate("window.teamJuraCayoPinRoute.getState()")
   assert resumed['start']==first_pending and resumed['finish']=='exit-6',resumed
   assert resumed['order'][-1]=='exit-6','Resume still ends at selected map pin'
   page.locator('.j186-action').filter(has_text='Remove finish').click()
   assert page.evaluate("window.teamJuraCayoPinRoute.getState().finish") is None
   # Cayo 18.8: one set of visible symbols drives both map and route.
   quick=page.locator('#j188-quickbar')
   assert quick.count()==1,'Map-first quick flow must exist exactly once'
   assert page.locator('.j188-preset').count()==6,'Six direct user categories, not an extra crowded toolbar'
   page.locator('.j188-preset[data-preset="equipment"]').click()
   categories=page.evaluate("window.teamJuraCayoPinRoute.getState().categories")
   assert set(categories)=={'bolts','grapple','clothes','truck','powder'},categories
   assert page.locator('.j180-legend-row[data-cat="entry"]').get_attribute('aria-pressed')=='false'
   assert page.locator('.j180-legend-row[data-cat="bolts"]').get_attribute('aria-pressed')=='true'
   visible_cats=page.locator('.j181-hotspot:not([hidden])').evaluate_all(
    '(nodes)=>[...new Set(nodes.map(n=>n.dataset.category))]')
   assert set(visible_cats).issubset(set(categories)),visible_cats
   # Desktop shows category rows directly. Phone keeps them collapsed, so
   # open the visible disclosure once; do not double-toggle or click a
   # display:none mobile-only button on desktop.
   if kind=='phone':
    legend_toggle=page.locator('.j185-legend-toggle')
    assert legend_toggle.count()==1,'One working marker-filter disclosure'
    if legend_toggle.get_attribute('aria-expanded')!='true':
     legend_toggle.click()
    assert legend_toggle.get_attribute('aria-expanded')=='true','Marker filters must expand'
   else:
    assert page.locator('.j180-legend-row[data-cat="entry"]').is_visible(), 'Desktop categories must be visible'
   page.locator('.j180-legend-row[data-cat="entry"]').click()
   changed=page.evaluate("window.teamJuraCayoPinRoute.getState().categories")
   assert 'entry' in changed and 'bolts' in changed,changed
   page.locator('.j188-preset[data-preset="all"]').click()
   assert len(page.evaluate("window.teamJuraCayoPinRoute.getState().categories"))==14
   assert page.locator('.j180-legend-row[aria-pressed="true"]').count()==14
   assert page.locator('.j186-map-jump').is_hidden(),'No duplicate header route buttons'
   # Quick start stays on the island when a player chooses the origin.
   page.locator('#j188-start').click()
   assert page.locator('#j186-pick-start').get_attribute('aria-pressed')=='true'
   page.locator('.j181-hotspot[data-category="control"]').first.click()
   page.locator('.j185-cluster-choice').filter(has_text='Airstrip infiltration').click()
   assert page.evaluate("window.teamJuraCayoPinRoute.getState().start")=='entry-0'
   assert page.locator('#j188-start').get_attribute('aria-pressed')=='false'
   assert 'Start:' in page.locator('#j188-status').inner_text()
   # Sources are available at point of use without obscuring map controls.
   assert page.locator('.j188-provenance a[href="./atlas-credits.html"]').count()==1
   proof.mkdir(parents=True,exist_ok=True)
   quick.screenshot(path=str(proof/('cayo-188-quickbar-'+kind+'.png')),animations='disabled')
   # Phone viewport should not gain horizontal scrolling from the new panel.
   if kind=='phone':
    bad=page.locator('#j186-route').evaluate('(e)=>e.scrollWidth>e.clientWidth+4')
    assert not bad,'Phone route panel must not overflow horizontally'
   ctx.close();browser.close()
   print('PASS Cayo 18.6 route: '+kind+' start/presets/nearest/line/manual/visited/reload/chest')
  # Recovery integration: deliberately fail the original Cayo focus module
  # once. The static, Cayo-only loader must rebuild dependencies in order;
  # no manual reload, no duplicate map/route, and no source/guest-save changes.
  args={'headless':True}
  if engine=='msedge':args['channel']='msedge'
  browser=pw.chromium.launch(**args)
  ctx=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
  page=ctx.new_page()
  blocked=[]
  def block_original(route):
   if 'j220retry=' in route.request.url:
    route.continue_()
   else:
    blocked.append(route.request.url)
    route.abort()
  page.route('**/atlas167-heist-focus.js*',block_original)
  page.goto(url,wait_until='domcontentloaded',timeout=50000)
  page.locator('#j186-route').wait_for(state='visible',timeout=30000)
  page.wait_for_function("document.body.dataset.j220CayoRecovery==='ready'",timeout=30000)
  assert blocked,'Missing-module simulation did not block original focus script'
  assert 'atlas167-heist-focus.js' in page.evaluate('document.body.dataset.j220Recovered'),'Recovery did not reinitialize the focus module'
  assert page.locator('#j167-heist-map').count()==1,'Recovery duplicated focus map'
  assert page.locator('#j180-shell').count()==1,'Recovery duplicated flagship map'
  assert page.locator('#j186-route').count()==1,'Recovery duplicated route planner'
  assert page.locator('#j188-quickbar').count()==1,'Recovery lost synchronized map controls'
  print('PASS Cayo 22.0 '+engine+': missing focus script recovered in order without duplicate map, route or filters',flush=True)
  ctx.close();browser.close()
finally:
 server.shutdown()
