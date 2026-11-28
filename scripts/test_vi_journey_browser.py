import threading,json
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
KEY='team-jura-vi-journeys-v1'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
with ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'public'))) as server:
 threading.Thread(target=server.serve_forever,daemon=True).start()
 base=f'http://127.0.0.1:{server.server_port}/'
 with sync_playwright() as pw:
  browser=pw.chromium.launch()
  for width in (390,1440):
   ctx=browser.new_context(viewport={'width':width,'height':844})
   ctx.route('https://**/*',lambda r:r.abort())
   p=ctx.new_page();p.goto(base+'atlas-activities.html?mode=vi')
   expect(p.locator('#viJourney')).to_be_visible()
   p.locator('#vj-new').fill('First');p.locator('#vj-add').click()
   expect(p.locator('#vj-name')).to_have_value('First')
   expect(p.locator('#vj-discovery-profile')).to_be_visible()
   p.locator('#vj-chapter').fill('My stage')
   expect(p.locator('#vj-discovery-profile')).to_be_hidden()
   p.locator('#vj-spoilers').check();p.locator('#vj-notes').fill('Personal choice')
   p.locator('#vj-save').click()
   expect(p.locator('#vj-status')).to_have_text('Journey saved on this device.')
   expect(p.locator('#vj-notes')).to_be_hidden()
   first=p.locator('#vj-select').input_value()
   expect(p.locator('#vj-discovery-profile')).to_have_attribute('href','./atlas-collectibles.html?game=vi#playthrough='+first)
   p.locator('#vj-new').fill('Second');p.locator('#vj-add').click()
   expect(p.locator('#vj-name')).to_have_value('Second')
   expect(p.locator('#vj-chapter')).to_have_value('')
   p.locator('#vj-select').select_option(first)
   expect(p.locator('#vj-chapter')).to_have_value('My stage')
   expect(p.locator('#vj-notes')).to_be_hidden()
   p.reload();expect(p.locator('#vj-name')).to_have_value('First')
   expect(p.locator('#vj-notes')).to_be_hidden()
   p.locator('#vj-spoilers').check();expect(p.locator('#vj-notes')).to_have_value('Personal choice')
   p.locator('#vj-goal').fill('Unsaved goal')
   other=ctx.new_page();other.goto(base+'atlas-activities.html?mode=vi')
   expect(other.locator('#vj-name')).to_have_value('First')
   other.locator('#vj-goal').fill('New saved goal')
   other.locator('#vj-save').click()
   expect(other.locator('#vj-status')).to_have_text('Journey saved on this device.')
   expect(p.locator('#vj-status')).to_contain_text('Another tab changed')
   p.locator('#vj-save').click()
   expect(p.locator('#vj-status')).to_contain_text('changed in another tab')
   expect(p.locator('#vj-goal')).to_have_value('Unsaved goal')
   assert p.evaluate("(k)=>JSON.parse(localStorage.getItem(k)).profiles.find(p=>p.name==='First').goal",KEY)=='New saved goal'
   p.once('dialog',lambda dialog:dialog.dismiss())
   p.locator('#vj-reload').click()
   expect(p.locator('#vj-goal')).to_have_value('Unsaved goal')
   p.once('dialog',lambda dialog:dialog.accept())
   p.locator('#vj-reload').click()
   expect(p.locator('#vj-goal')).to_have_value('New saved goal')
   expect(p.locator('#vj-notes')).to_be_hidden()
   # Delay real file read: editing, switching and reload stay disabled until merge.
   backup=p.evaluate("(k)=>JSON.parse(localStorage.getItem(k))",KEY)
   backup['profiles'][0]['goal']='Old backup goal'
   imported={'id':'vj-'+'c'*32,'name':'Imported','chapter':'','character':'','goal':'','notes':''}
   backup['profiles'].append(imported);backup['active']=imported['id']
   payload={'name':'journey.json','mimeType':'application/json','buffer':json.dumps(backup).encode()}
   p.evaluate("""()=>{window.originalJourneyFileText=File.prototype.text;File.prototype.text=function(){const file=this;return new Promise(resolve=>{window.finishJourneyRead=()=>resolve(window.originalJourneyFileText.call(file))})}}""")
   p.locator('#vj-import').set_input_files(payload)
   expect(p.locator('#vj-status')).to_contain_text('Reading backup')
   for control in ('vj-select','vj-add','vj-new','vj-save','vj-goal','vj-import','vj-reload'):
    expect(p.locator('#'+control)).to_be_disabled()
   # Another tab may commit while the file is reading; merge must retain that latest local version.
   other.locator('#vj-goal').fill('Newer while reading')
   other.locator('#vj-save').click()
   expect(other.locator('#vj-status')).to_have_text('Journey saved on this device.')
   p.evaluate("()=>window.finishJourneyRead()")
   expect(p.locator('#vj-status')).to_have_text('1 profile(s) added; 1 conflict(s) kept local.')
   expect(p.locator('#vj-goal')).to_have_value('Newer while reading')
   expect(p.locator('#vj-select')).to_have_value(first)
   expect(p.locator('#vj-select option')).to_have_count(3)
   p.evaluate("()=>{File.prototype.text=window.originalJourneyFileText}")
   # Unsaved edits refuse a new import before reading or mutating anything.
   p.locator('#vj-goal').fill('Keep my draft')
   before=p.evaluate('(k)=>localStorage.getItem(k)',KEY)
   p.locator('#vj-import').set_input_files(payload)
   expect(p.locator('#vj-status')).to_contain_text('Save your current edits')
   expect(p.locator('#vj-goal')).to_have_value('Keep my draft')
   assert p.evaluate('(k)=>localStorage.getItem(k)',KEY)==before
   p.once('dialog',lambda dialog:dialog.accept())
   p.locator('#vj-reload').click()
   expect(p.locator('#vj-goal')).to_have_value('Newer while reading')
   other.close()
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
   p.goto(base+'atlas-activities.html?mode=online');expect(p.locator('#viJourney')).to_be_hidden()
   p.goto(base+'atlas-activities.html?mode=story');expect(p.locator('#viJourney')).to_be_hidden()
   p.evaluate("(k)=>localStorage.setItem(k,'broken')",KEY)
   p.goto(base+'atlas-activities.html?mode=vi');expect(p.locator('#vj-status')).to_contain_text('Editing paused')
   expect(p.locator('#vj-add')).to_be_disabled()
   assert p.evaluate('(k)=>localStorage.getItem(k)',KEY)=='broken'
   ctx.close()
  browser.close()
print('PASS VI personal journeys, profile switching, spoilers, reload, corruption and world isolation')
