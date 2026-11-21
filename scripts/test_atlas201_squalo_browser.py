#!/usr/bin/env python3
"""Browser QA: Squalo profile, craft art, gallery deep-link, persistence and mobile width."""
import os, threading
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
   page.locator('#j90Search').fill('squalo')
   expect(page.locator('#j90Cards article.j90-card')).to_have_count(1,timeout=18000)
   concept=page.locator('#j90Cards .j90-photo.j90-fallback img')
   concept.scroll_into_view_if_needed()
   page.wait_for_function("document.querySelector('#j90Cards .j90-photo.j90-fallback img')?.naturalWidth>100",timeout=12000)
   assert 'not an exact game render of Squalo' in concept.get_attribute('alt')
   link=page.locator('#j90Cards a.j96-park-link')
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
   art=page.locator('#garageDetails .jura-marine-art')
   expect(art).to_contain_text('illustrative; not a Squalo game model')
   page.wait_for_function("document.querySelector('#garageDetails .jura-marine-art img')?.naturalWidth>100",timeout=12000)
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
   context.close();browser.close()
   print('PASS Squalo source facts, original marine art, safe deep link, local notes and responsive QA:',engine,width)
finally:
 server.shutdown()
