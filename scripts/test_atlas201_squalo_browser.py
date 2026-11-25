#!/usr/bin/env python3
"""Browser QA: Squalo profile, craft art, gallery deep-link, persistence and mobile width."""
import os, threading, json
from functools import partial
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import expect, sync_playwright
ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'atlas93-garage.html').is_file(), 'Build public/ first'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base='http://127.0.0.1:%s/'%server.server_port
engine=os.getenv('ATLAS_BROWSER','chromium')
try:
 with sync_playwright() as pw:
  for width,height in ((1440,900),(390,844)):
   opts={'headless':True}
   if engine=='msedge':opts['channel']='msedge'
   browser=pw.chromium.launch(**opts)
   context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1)
   page=context.new_page()
   # Force archive-image network failures: original Elario fallbacks must render instead of blanks.
   page.route('**/cdn.jsdelivr.net/**',lambda route:route.abort())
   page.goto(base+'atlas90-vehicles5.html',wait_until='domcontentloaded')
   page.wait_for_function("getComputedStyle(document.querySelector('.j90-hero-art')).backgroundImage.includes('jura161-vehicles.webp')",timeout=10000)

   page.locator('#j90Search').fill('squalo')
   expect(page.locator('#j90Cards article.j90-card')).to_have_count(1,timeout=18000)
   concept=page.locator('#j90Cards .j90-photo.j90-fallback img')
   concept.scroll_into_view_if_needed()
   page.wait_for_function("document.querySelector('#j90Cards .j90-photo.j90-fallback img')?.naturalWidth>100",timeout=12000)
   assert 'not an exact game render of Squalo' in concept.get_attribute('alt')
   link=page.locator('#j90Cards a.j96-park-link[href="./atlas93-garage.html?addModel=squalo"]')
   expect(link).to_have_attribute('href','./atlas93-garage.html?addModel=squalo')
   link.click()
   page.wait_for_url('**/atlas93-garage.html?addModel=squalo')
   expect(page.locator('#garageDetails h2')).to_have_text('Squalo',timeout=20000)
   expect(page.locator('#garageSearch')).to_have_value('squalo')
   expect(page.locator('#garageFilter')).to_have_value('all')
   info=page.locator('#garageDetails .j104-intelligence')
   for expected in ('Shitzu','65.75 mph','GTA$196,621','DockTease','Pegasus','Chris-Craft'):
    expect(info).to_contain_text(expected)
   expect(page.locator('#garageDetails .j104-provenance a').first).to_have_attribute('href','https://gtadb.net/gta-online/vehicles/squalo/')
   assert page.locator('#garageDetails .j99-showroom canvas').count()==0,'Boat represented as a generic road car'
   showroom=page.locator('#garageDetails .j99-showroom')
   expect(showroom).to_have_attribute('data-forge-status','reference')
   expect(showroom).to_have_attribute('data-forge-fidelity','reference-only')
   expect(showroom.locator('.j256-rights')).to_contain_text('not replaced with a generic 3D body')
   expect(page.locator('#garageDetails label').filter(has_text='NOT an in-game customization')).to_have_count(1)
   owned=page.locator('#garageDetails input[type="checkbox"]').first
   assert not owned.is_checked(),'Gallery preview silently marked boat owned'
   page.locator('#garageDetails textarea').fill('Squalo berth / personal QA notes')
   page.locator('#garageDetails button.save').click()
   page.reload(wait_until='domcontentloaded')
   expect(page.locator('#garageDetails h2')).to_have_text('Squalo',timeout=20000)
   expect(page.locator('#garageDetails textarea')).to_have_value('Squalo berth / personal QA notes')
   assert not page.locator('#garageDetails input[type="checkbox"]').first.is_checked(),'Saved note toggled ownership'
   if width==390:
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+8'),'Squalo page causes phone horizontal overflow'
   evidence=ROOT/'qa-evidence'/engine
   evidence.mkdir(parents=True,exist_ok=True)
   page.locator('#garageDetails').screenshot(path=str(evidence/('atlas201-squalo-'+str(width)+'.png')),animations='disabled')
   # Use exact RGB, retain the Studio preset, and import a conflicting older Garage backup.
   page.locator('#j255-rgb').fill('#13a9ce')
   page.locator('#garageDetails button.save').click()
   expect(page.locator('#j255-primary')).to_have_value('#13a9ce')
   page.evaluate("""()=>localStorage.setItem('team-jura-atlas101-concept-presets-v1',JSON.stringify({schema:1,builds:{squalo:{model:'squalo',paint:'#aa3344',body:'auto',name:'Separate Studio idea',note:'Studio-only note'}}}))""")
   backup={'schema':1,'app':'team-jura-atlas93-garage','garage':{'garages':['New berth'],'vehicles':{'squalo':{'paint':'Midnight','note':'Older backup note'},'adder':{'garage':'New berth','paint':'#ffaa33','secondary':'Midnight','note':'Imported build','favorite':True}}},'collection':{'owned':{'vehicles5:adder':True}}}
   page.locator('#importGarage').set_input_files({'name':'older-garage.json','mimeType':'application/json','buffer':json.dumps(backup).encode()})
   expect(page.locator('#garageNotice')).to_contain_text('1 existing builds kept')
   expect(page.locator('#j255-primary')).to_have_value('#13a9ce')
   expect(page.locator('#garageDetails textarea')).to_have_value('Squalo berth / personal QA notes')
   assert page.evaluate("""()=>{const m=JSON.parse(localStorage.getItem('team-jura-atlas93-garage-v1'));return m.vehicles.adder.paint==='#ffaa33'&&m.vehicles.squalo.paint==='#13a9ce'&&m.garages.includes('New berth')}""")
   page.locator('#garageDetails a[data-forge-handoff="true"]').click()
   # Explicit Garage handoff loads the saved Garage working copy, not the independent Studio preset.
   expect(page.locator('#paintColor')).to_have_value('#13a9ce',timeout=20000)
   expect(page.locator('#builderStatus')).to_contain_text('saved Garage build')
   # The separately saved Studio preset is still accessible without changing Garage storage.
   page.locator('#loadBuild').click()
   expect(page.locator('#paintColor')).to_have_value('#aa3344')
   expect(page.locator('#buildName')).to_have_value('Separate Studio idea')
   stage=page.locator('#concept3d')
   expect(stage).to_have_attribute('data-forge-status','reference')
   expect(stage.locator('canvas')).to_have_count(0)
   expect(stage.locator('.j256-rights')).to_be_visible()
   expect(page.locator('#bodyStyle')).to_be_disabled()
   page.locator('#loadGarageBuild').click()
   expect(page.locator('#paintColor')).to_have_value('#13a9ce')
   expect(page.locator('#builderStatus')).to_contain_text('saved Studio idea and Garage record are unchanged')
   page.locator('#loadBuild').click()
   expect(page.locator('#paintColor')).to_have_value('#aa3344')
   expect(page.locator('#buildName')).to_have_value('Separate Studio idea')
   page.locator('#paintColor').fill('#10abcf')
   page.locator('#saveBuild').click()
   page.reload(wait_until='domcontentloaded')
   expect(page.locator('#paintColor')).to_have_value('#13a9ce',timeout=20000)
   page.locator('#loadBuild').click()
   expect(page.locator('#paintColor')).to_have_value('#10abcf')
   expect(page.locator('#modelSelect')).to_have_value('squalo')
   expect(page.locator('#addToGarage')).to_have_attribute('href','./atlas93-garage.html?addModel=squalo')
   # Simulate a transient failed local catalog request during Studio handoff.
   # Do not retry the whole navigation or weaken the destination assertions.
   attempts={'seed':0}
   def transient_seed(route):
    if '/atlas93-garage.html' in route.request.frame.url:
     attempts['seed']+=1
     if attempts['seed']==1:
      route.abort('connectionreset')
      return
    route.continue_()
   page.route('**/atlas90-seed.json',transient_seed)
   page.locator('#addToGarage').click()
   page.wait_for_url('**/atlas93-garage.html?addModel=squalo')
   expect(page.locator('#garageDetails h2')).to_have_text('Squalo',timeout=20000)
   assert attempts['seed']>=2,'Garage did not recover from injected catalog failure'
   page.unroute('**/atlas90-seed.json',transient_seed)
   page.get_by_role('button',name='Use studio concept in build editor').click()
   expect(page.locator('#j255-primary')).to_have_value('#10abcf')
   page.locator('#garageDetails button.save').click()
   page.goto(base+'atlas-vehicle-configurator.html?model=jetmax',wait_until='domcontentloaded')
   expect(stage).to_have_attribute('data-forge-status','reference',timeout=20000)
   expect(stage).to_contain_text('Collection only')
   expect(stage.locator('canvas')).to_have_count(0)
   expect(stage.locator('[data-workshop-category]')).to_have_count(0)
   expect(page.locator('#bodyStyle')).to_be_disabled()
   page.goto(base+'atlas93-garage.html?addModel=jetmax',wait_until='domcontentloaded')
   expect(page.locator('#garageDetails h2')).to_have_text('Jetmax',timeout=20000)
   expect(page.locator('#garageDetails .j104-intelligence')).to_contain_text('GTA$299,000')
   expect(page.locator('#garageDetails .j104-intelligence')).to_contain_text('Pegasus')
   expect(page.locator('#garageDetails label').filter(has_text='NOT an in-game customization')).to_have_count(1)
   if width==390:
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+8'),'Studio handoff causes phone horizontal overflow'
   # Forge 26.5: test the actual served collection hub and cross-world deep links.
   identity=page.request.get(base+'atlas-build-identity.json')
   assert identity.ok,'Published build identity missing'
   assert identity.json()['schema']==1
   page.goto(base+'atlas-vehicle-configurator.html?model=jetmax',wait_until='domcontentloaded')
   expect(page.locator('#concept3d')).to_have_attribute('data-forge-fidelity','reference-only',timeout=20000)
   page.locator('#buildName').fill('QA Marina Edition')
   page.locator('#buildNote').fill('Private marina display idea')
   page.locator('#saveVariant').click()
   expect(page.locator('#builderStatus')).to_contain_text('Named build saved')
   page.goto(base+'atlas-forge-collections.html',wait_until='domcontentloaded')
   page.locator('#forgeCollectionSearch').fill('QA Marina Edition')
   card=page.locator('#forgeCollectionRows .fc-entry')
   expect(card).to_have_count(1,timeout=20000)
   expect(card).to_contain_text('Jetmax')
   # Atlas 31.3: named design titles never belong in a shareable URL.
   # The private name is handed to Forge through a single-use same-tab session
   # value and consumed on arrival; both V and VI collections remain isolated.
   open_studio=card.get_by_role('link',name='Open in Forge Studio')
   expect(open_studio).to_have_attribute('href','./atlas-vehicle-configurator.html?model=jetmax&source=collection')
   assert 'QA Marina Edition' not in open_studio.get_attribute('href')
   open_studio.click()
   expect(page.locator('#buildName')).to_have_value('QA Marina Edition',timeout=20000)
   expect(page.locator('#buildNote')).to_have_value('Private marina display idea')
   assert '#variant=' not in page.url and 'QA%20Marina' not in page.url,'Private design title leaked into URL'
   assert page.evaluate('sessionStorage.getItem("team-jura-forge-private-handoff-v1")') is None,'One-time handoff not consumed'
   # Reload must not expose/replay a private URL payload. The named design is
   # still saved and can be re-opened explicitly from the local selector.
   page.reload(wait_until='domcontentloaded')
   expect(page.locator('#forgeVariant option[value="QA Marina Edition"]')).to_have_count(1,timeout=20000)
   page.locator('#forgeVariant').select_option('QA Marina Edition')
   page.locator('#loadVariant').click()
   expect(page.locator('#buildName')).to_have_value('QA Marina Edition',timeout=20000)
   expect(page.locator('#buildNote')).to_have_value('Private marina display idea')
   assert '#variant=' not in page.url and 'QA%20Marina' not in page.url
   page.goto(base+'atlas-vehicle-configurator.html?world=vi&model=vi_squalo',wait_until='domcontentloaded')
   expect(page.locator('#modelSelect')).to_have_value('vi_squalo',timeout=20000)
   expect(page.locator('#concept3d')).to_have_attribute('data-forge-fidelity','reference-only')
   expect(page.locator('#referenceNote')).to_contain_text('not the named vehicle')
   assert not page.locator('#addToGarage').is_visible()
   page.goto(base+'atlas-forge-collections.html',wait_until='domcontentloaded')
   page.locator('#forgeCollectionWorld').select_option('vi')
   expect(page.locator('#forgeCollectionCount')).to_contain_text('0 of',timeout=20000)
   page.locator('#forgeCollectionWorld').select_option('all')
   page.screenshot(path=str(evidence/('atlas265-forge-collections-'+str(width)+'.png')),animations='disabled',full_page=True)
   if width==390:
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+8'),'Forge collection hub overflows phone width'
   context.close();browser.close()
   print('PASS Squalo source facts, original marine art, safe deep link, local notes and responsive QA:',engine,width)
finally:
 server.shutdown()
