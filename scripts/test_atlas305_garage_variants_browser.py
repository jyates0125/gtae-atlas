#!/usr/bin/env python3
"""Atlas 30.5: built-site Garage loading named Forge variants never writes on load."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright,expect

root=Path(__file__).resolve().parents[1]
public=root/'public'
assert (public/'atlas93-garage.html').is_file(),'Build Cloudflare payload first'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(public)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
G='team-jura-atlas93-garage-v1'
F='team-jura-atlas101-concept-presets-v1'
O='team-jura-atlas90-collection-v1'
VI='team-jura-forge-vi-concept-presets-v1'
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width in (390,1440):
   context=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce')
   page=context.new_page()
   page.route('https://**/*',lambda r:r.abort())
   page.goto(base+'/atlas-dashboard.html',wait_until='domcontentloaded')
   page.evaluate("""([g,f,o,vi])=>{
      localStorage.setItem(g,JSON.stringify({schema:1,garages:['Main Garage','Marina'],vehicles:{
       jetmax:{paint:'#223344',note:'Original note',plate:'BAY7',garage:'Marina',favorite:true},
       sultan:{paint:'#112233',note:'Do not change'}}}));
      localStorage.setItem(o,JSON.stringify({schema:1,owned:{'vehicles5:jetmax':true},wishlist:{},note:{}}));
      localStorage.setItem(f,JSON.stringify({schema:1,builds:{},variants:{jetmax:[
       {model:'jetmax',paint:'#aabbcc',body:'auto',name:'Dock Night',note:'Private Forge note',design:{environment:'marina'}},
       {model:'jetmax',paint:'#abcdef',body:'auto',name:'Early Morning',note:'Private alternate',design:{environment:'marina'}}]}}));
      localStorage.setItem(vi,JSON.stringify({schema:1,builds:{},variants:{jetmax:[
       {model:'jetmax',paint:'#ffffff',body:'auto',name:'Wrong game',note:'Not for GTA V',design:{}}]}}));
    }""",[G,F,O,VI])
   before=page.evaluate("([g,f,o,vi])=>[localStorage.getItem(g),localStorage.getItem(f),localStorage.getItem(o),localStorage.getItem(vi)]",[G,F,O,VI])
   page.goto(base+'/atlas93-garage.html?addModel=jetmax',wait_until='domcontentloaded')
   expect(page.locator('#garageDetails h2').filter(has_text='Jetmax')).to_be_visible(timeout=30000)
   select=page.locator('#j305-variant-choice')
   expect(select.locator('option')).to_have_count(2)
   assert 'Wrong game' not in select.inner_text()
   select.select_option('Dock Night')
   page.locator('#j305-load-variant').click()
   expect(page.locator('#j305-primary')).to_have_count(0) # uses existing j255-primary
   expect(page.locator('#j255-primary')).to_have_value('#aabbcc')
   expect(page.locator('#j255-rgb')).to_have_value('#aabbcc')
   expect(page.locator('.j305-variant-status')).to_contain_text('Working copy loaded: Dock Night')
   assert page.evaluate("([g,f,o,vi])=>[localStorage.getItem(g),localStorage.getItem(f),localStorage.getItem(o),localStorage.getItem(vi)]",[G,F,O,VI])==before, 'Loading variant wrote private collection'
   # A second tab can update the named entry; loading must read the latest.
   page.evaluate("""f=>{const x=JSON.parse(localStorage.getItem(f));x.variants.jetmax[0].paint='#badc0f';localStorage.setItem(f,JSON.stringify(x))}""",F)
   page.locator('#j305-load-variant').click()
   expect(page.locator('#j255-primary')).to_have_value('#badc0f')
   # Saving must change only the selected Garage concept, not Forge or ownership.
   forge_before=page.evaluate("f=>localStorage.getItem(f)",F)
   owner_before=page.evaluate("o=>localStorage.getItem(o)",O)
   page.locator('#garageDetails button.save').click()
   updated=page.evaluate("g=>JSON.parse(localStorage.getItem(g)).vehicles",G)
   assert updated['jetmax']['paint']=='#badc0f'
   assert updated['jetmax']['garage']=='Marina' and updated['jetmax']['plate']=='BAY7'
   assert updated['jetmax']['note']=='Original note' and updated['jetmax']['favorite'] is True
   assert updated['sultan']=={'paint':'#112233','note':'Do not change'}
   assert page.evaluate("f=>localStorage.getItem(f)",F)==forge_before
   assert page.evaluate("o=>localStorage.getItem(o)",O)==owner_before
   # A malformed Forge record must not change Garage editor or overwrite bytes.
   page.evaluate("f=>localStorage.setItem(f,'{bad-json')",F)
   page.locator('#j305-load-variant').click()
   expect(page.locator('.j305-variant-status')).to_contain_text('unreadable')
   assert page.evaluate("f=>localStorage.getItem(f)",F)=='{bad-json'
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'),width
   context.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 30.5 passed: named Forge variants load as private working copies, stale save recheck, Garage scope, phone/desktop')
