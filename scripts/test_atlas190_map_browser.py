#!/usr/bin/env python3
"""Atlas 19.0 production-HTML/browser acceptance for IV, SA, two episodes."""
import os, re, threading
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import expect, sync_playwright

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
if not (PUBLIC/'atlas-iv.html').is_file() or not (PUBLIC/'atlas-sa.html').is_file():
    raise SystemExit('Build the actual Cloudflare public/ output first')
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
class AtlasTestServer(ThreadingHTTPServer):
    # Rapid tile/page transitions can exceed the default Windows accept backlog.
    request_queue_size=64
    daemon_threads=True
server=AtlasTestServer(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
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
   # Source tag categories must actually filter the map, not merely
   # change aria-pressed while resetting the category to All.
   total=int(page.locator('#visibleCount').inner_text())
   first=page.locator('.classic-result').first.inner_text()
   assert first.strip(),'A mapped source landmark is presented as a blank result'
   # The licensed pack has 14 positioned but untitled community records.
   # They must remain reachable, named honestly, and retain the original ID.
   page.locator('#classicSearch').fill('Unnamed community landmark')
   expect(page.locator('#resultCount')).to_have_text('14')
   expect(page.locator('.classic-result')).to_have_count(14)
   page.locator('.classic-result').first.click()
   expect(page.locator('#detailName')).to_contain_text('Unnamed community landmark (source L')
   assert 'loc=L' in page.url
   page.locator('#closeDetail').click()
   page.locator('#classicSearch').clear()
   expect(page.locator('#resultCount')).to_have_text(str(total))
   page.locator('#ivNext').click()
   assert page.locator('.classic-result').first.inner_text()!=first
   expect(page.locator('#ivRange')).to_have_text('81–160 of '+str(total))
   page.locator('#ivPrev').click()
   expect(page.locator('.classic-result').first).to_have_text(re.compile(re.escape(first.splitlines()[0])))
   labels=page.locator('#categories button').all_text_contents()
   filtered_choice=next(((i,int(m.group(1))) for i,label in enumerate(labels)
                        if i>0 and (m:=re.search(r'\((\d+)\)$',label))
                        and 0<int(m.group(1))<total),None)
   assert filtered_choice is not None,'No nontrivial licensed GTA IV category found'
   choice_index,expected_count=filtered_choice
   page.locator('#categories button').nth(choice_index).click()
   assert page.locator('#resultCount').inner_text()==str(expected_count),(
       'GTA IV category click did not actually filter the source records')
   assert page.locator('#categories button').nth(choice_index).get_attribute('aria-pressed')=='true'
   page.locator('#categories button').first.click()
   assert page.locator('#resultCount').inner_text()==str(total)

   page.locator('#j190-iv-scope').select_option('iv')
   page.wait_for_function("document.getElementById('visibleCount').textContent==='200'",timeout=15000)
   expect(page.locator('#j190-marker-status')).to_have_text(re.compile(r'^200 matching collectibles'))
   assert page.locator('.classic-result').count()>0
   page.locator('.classic-result').first.click()
   assert 'Flying Rat' in page.locator('#detailName').inner_text()
   assert page.locator('#detailCoord').inner_text().count(',')>=1
   assert 'pigeon-locator' in page.locator('#detailSource').get_attribute('href')
   # Selecting an item must retain its episode when a user copies or
   # refreshes the location URL; clicking Close must keep the same scope.
   assert 'scope=iv' in page.url and 'loc=iv-bird-' in page.url
   page.reload(wait_until='domcontentloaded',timeout=45000)
   page.wait_for_function("document.getElementById('detailName')?.textContent?.includes('Flying Rat')",timeout=20000)
   assert page.locator('#j190-iv-scope').input_value()=='iv'
   page.locator('#closeDetail').click()
   assert 'scope=iv' in page.url and 'loc=' not in page.url
   assert page.locator('#j190-iv-scope').input_value()=='iv'
   page.locator('.classic-result').first.click()
   page.locator('#j190-iv-found').click()
   assert 'Mark uncollected' in page.locator('#j190-iv-found').inner_text()
   page.locator('#j190-iv-hide-found').check()
   assert page.locator('#resultCount').inner_text()=='199'
   assert page.locator('#visibleCount').inner_text()=='200'
   # Use real licensed positions to check nearest-next ordering independently.
   stops=[]
   for i in range(5):
    page.locator('.classic-result').nth(i).click()
    stops.append(page.evaluate("""() => ({
      id:new URL(location.href).searchParams.get('loc'),
      xy:document.querySelector('#detailCoord').textContent.split(',').slice(0,2).map(Number)
    })"""))
    page.locator('#detailRoute').click()
   planner=page.locator('details').filter(has=page.locator('#routeOrder'))
   planner.locator('summary').click()
   start,finish=stops[2],stops[0]
   page.locator('#routeStart').select_option(start['id'])
   page.locator('#routeFinish').select_option(finish['id'])
   page.locator('#routeOrder').click()
   expected=[start]
   remaining=[item for item in stops if item not in (start,finish)]
   while remaining:
    x,y=expected[-1]['xy']
    best=min(remaining,key=lambda item:(item['xy'][0]-x)**2+(item['xy'][1]-y)**2)
    expected.append(best)
    remaining.remove(best)
   ids=[item['id'] for item in expected+[finish]]
   actual=lambda: page.locator('#routeStart option').evaluate_all('(opts)=>opts.map(o=>o.value)')
   assert actual()==ids
   page.locator('#ivNearby').click()
   expanded=actual()
   assert len(expanded)==len(set(expanded))==10 and expanded[:4]==ids[:4] and expanded[-1]==ids[-1]
   ids=expanded
   page.reload(wait_until='domcontentloaded')
   expect(page.locator('#stopCount')).to_have_text('10')
   assert actual()==ids and page.locator('#routeFinish').input_value()==finish['id']
   page.locator('#j190-iv-scope').select_option('tlad')
   page.wait_for_function("document.getElementById('visibleCount').textContent==='50'")
   assert page.locator('#j190-iv-scope').input_value()=='tlad'
   page.locator('#j190-iv-scope').select_option('tbogt')
   assert page.locator('#visibleCount').inner_text()=='50'
   page.locator('#classicPins').click()
   page.wait_for_function("document.querySelector('#j190-marker-status')?.textContent?.includes('Map symbols hidden')",timeout=10000)
   page.locator('#classicPins').click()
   page.wait_for_function("document.querySelector('#j190-marker-status')?.textContent?.includes('matching collectibles')",timeout=10000)
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
   page.locator('#categories button').filter(has_text='Graffiti Tags').click()
   expect(page.locator('.pin-source-projected')).to_have_count(100,timeout=15000)
   expect(page.locator('#mapped')).to_have_text('320')
   page.locator('#j190-sa-start').select_option('tags:1')
   page.locator('#j190-sa-finish').select_option('tags:100')
   tag_route=page.evaluate("window.TeamJuraSARoute.getRoute()")
   assert tag_route[0]=='tags:1' and tag_route[-1]=='tags:100' and all(p.startswith('tags:') for p in tag_route)
   expect(page.locator('#item-1 a')).to_have_attribute('href','https://dev.prineside.com/en/gtasa_samp_model_id/model/1490-tag_01/')
   page.locator('#categories button').filter(has_text='Unique Stunt Jumps').click()
   expect(page.locator('.pin-source-projected')).to_have_count(70,timeout=15000)
   expect(page.locator('#item-1')).to_contain_text('Landing zone center')
   page.locator('#j190-sa-start').select_option('jumps:1')
   page.locator('#j190-sa-finish').select_option('jumps:70')
   page.locator('#j190-sa-limit').select_option('100')
   jump_route=page.evaluate("window.TeamJuraSARoute.getRoute()")
   assert len(jump_route)==len(set(jump_route))==70 and jump_route[0]=='jumps:1' and jump_route[-1]=='jumps:70'
   page.goto(base+'map-hub.html?game=vc',wait_until='domcontentloaded',timeout=45000)
   expect(page.locator('#j240-rows li')).to_have_count(36,timeout=15000)
   expect(page.locator('#j241-source-pins button')).to_have_count(36,timeout=15000)
   expect(page.locator('#j241-alignment')).to_contain_text('Original radar image matched')
   pin=page.locator('[data-source-id="vc-jump-01"]')
   assert abs(float(pin.evaluate("(e)=>parseFloat(e.style.left)"))-12.805475)<.00001
   pin.evaluate('(e)=>e.click()')
   expect(page.locator('#j241-source-detail')).to_contain_text('Stunt Jump 01')
   page.locator('#j241-source-detail button').click()
   expect(page.locator('#j241-source-detail')).to_be_hidden()
   page.get_by_role('button',name='Hide sourced pins').click()
   expect(page.locator('#j241-source-pins')).to_be_hidden()
   page.get_by_role('button',name='Show sourced pins').click()
   expect(page.locator('#j241-source-pins')).to_be_visible()
   page.locator('#j240-category').select_option('Store robberies')
   expect(page.locator('#j240-rows li')).to_have_count(15)
   page.locator('#j240-start').select_option('vc-robbery-01')
   page.get_by_role('button',name='Build geometric preview').click()
   expect(page.locator('#j240-rows li').first).to_have_attribute('data-id','vc-robbery-01')
   expect(page.locator('#j240-status')).to_contain_text('not road directions')
   expect(page.locator('#j241-source-route'.replace('#','.'))).to_have_count(1)
   # Different artwork must never inherit the calibrated map points.
   page.evaluate("""() => {const v=document.getElementById('classicViewport');v.dataset.mapImage='local-highres';window.dispatchEvent(new CustomEvent('team-jura:classic-map-image-change',{detail:{game:'vc'}}))}""")
   expect(page.locator('#j241-source-pins')).to_be_hidden()
   expect(page.locator('#j241-alignment')).to_contain_text('Source pins hidden')
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   page.locator('#j244-de summary').click()
   expect(page.locator('#j244-results li')).to_have_count(100,timeout=15000)
   page.locator('#j244-category').select_option('Rampages')
   expect(page.locator('#j244-results li')).to_have_count(35)
   page.locator('#j244-category').select_option('Jump approaches')
   expect(page.locator('#j244-results li')).to_have_count(36)
   page.locator('#j244-origin').select_option('vc-de-stunt-jumps-1')
   page.get_by_role('button',name='Preview reference route').click()
   expect(page.locator('#j244-results li').first).to_have_attribute('data-id','vc-de-stunt-jumps-1')
   expect(page.locator('#j244-status')).to_contain_text('not road directions')
   page.goto(base+'map-hub.html?game=iii',wait_until='domcontentloaded',timeout=45000)
   expect(page.locator('#j240-rows li')).to_have_count(100,timeout=15000)
   expect(page.locator('#j241-source-pins button')).to_have_count(100,timeout=15000)
   page.locator('#j240-category').select_option('Rampages')
   expect(page.locator('#j240-rows li')).to_have_count(40)
   expect(page.locator('#j240-status')).to_contain_text('20 objectives')
   page.locator('#j240-category').select_option('Unique stunt jumps')
   expect(page.locator('#j240-rows li')).to_have_count(20)
   expect(page.locator('#j240-rows')).to_contain_text('not specified (2D trigger)')
   for scope in ('tlad','tbogt'):
    page.goto(base+'map-hub.html?game='+scope,wait_until='domcontentloaded',timeout=45000)
    link=page.locator('#j190-episode-collectibles')
    link.wait_for(state='visible',timeout=15000)
    assert link.get_attribute('href')=='./atlas-iv.html?scope='+scope
    if kind=='mobile':
     assert not link.evaluate('(e)=>e.scrollWidth>e.clientWidth+4')
    link.click()
    page.wait_for_function("document.getElementById('visibleCount')?.textContent==='50'")
    assert page.locator('#j190-iv-scope').input_value()==scope and actual()==[]
    page.locator('.classic-result').first.click()
    assert 'loc='+scope+'-bird-' in page.url
    page.locator('#detailRoute').click()
    page.reload(wait_until='domcontentloaded')
    expect(page.locator('#stopCount')).to_have_text('1')
    assert actual()[0].startswith(scope+'-bird-')
   page.locator('#j190-iv-scope').select_option('iv')
   assert actual()==ids
   print('PASS Atlas 19.0 '+engine+' '+kind+': IV 200/50/50 scope, search, found, clusters, SA map route, classic episode links')
   page.goto(base+'maps.html?q=tbogt&filter=gateway',wait_until='domcontentloaded')
   expect(page.locator('#worldCount')).to_have_text('1 of 13 destinations')
   expect(page.locator('.directory-card')).to_have_attribute('href','./map-hub.html?game=tbogt')
   page.locator('#worldSearch').fill('no such destination')
   page.locator('#resetWorldSearch').click()
   expect(page.locator('.directory-card')).to_have_count(13)
   # Finish previous map fetches and require Fleeca's deferred bundle to load.
   # Windows Edge can occasionally abort local test-server requests while
   # unloading tile-heavy maps. Retry the full page only if initialization
   # never happened; a second missed bootstrap remains a hard regression.
   page.goto('about:blank',wait_until='load')
   page.goto(base+'heist-fleeca.html',wait_until='load',timeout=45000)
   try:
    expect(page.locator('#progress')).to_have_text('0 / 3 tracked',timeout=7000)
   except AssertionError:
    page.reload(wait_until='load',timeout=45000)
    expect(page.locator('#progress')).to_have_text('0 / 3 tracked',timeout=15000)
   page.locator('input[data-step]').first.check()
   # Cross-page progress must persist before the heist directory filters it.
   page.wait_for_function("""() => {
     try { return Object.values(JSON.parse(localStorage.getItem('teamjura-heist-fleeca') || '{}')).some(v=>v===true); }
     catch (_) { return false; }
   }""",timeout=15000)
   expect(page.locator('#progress')).to_have_text('1 / 3 tracked')
   page.goto(base+'heists.html',wait_until='load')
   page.locator('#heistStarted').check()
   expect(page.locator('#heistCount')).to_have_text('1 of 15 workspaces')
   expect(page.locator('.cards .card:visible h2')).to_have_text('The Fleeca Job')
   page.locator('#heistReset').click()
   expect(page.locator('.cards .card:visible')).to_have_count(15)
   page.goto(base+'atlas90-vehicles5.html',wait_until='domcontentloaded')
   for model in ('adder','akula'):
    page.locator('#j90Search').fill(model)
    page.get_by_role('button',name='+ Compare',exact=True).first.click()
   expect(page.locator('#j90Compare article')).to_have_count(2)
   expect(page.locator('#j90Compare')).to_contain_text('126.25 mph')
   expect(page.locator('#j90Compare')).to_contain_text('157.25 mph')
   page.get_by_role('button',name='Remove Adder from comparison').click()
   expect(page.locator('#j90Compare article')).to_have_count(1)
   if kind=='mobile':
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
   print('PASS world directory, heist checklist recovery, comparison sources and nearby route extension',engine,kind)
   context.close();browser.close()
finally:
 server.shutdown()
