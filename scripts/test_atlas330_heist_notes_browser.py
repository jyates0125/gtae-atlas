#!/usr/bin/env python3
"""Atlas 33.0: real Chromium tests only where mission notes safety changed."""
import json
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'heist-fleeca.html').is_file(),'Build the static Cloudflare site first'
EVIDENCE=ROOT/'qa-evidence'/'chromium'
EVIDENCE.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/'
key='teamjura-heist-plan-v1:fleeca'
other='teamjura-heist-plan-v1:prison-break'
check='teamjura-heist-fleeca'
broken='{"heist":"fleeca","approach":; Do not remove this original.'
try:
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(headless=True)
  for width,height in [(390,844),(844,390),(1440,900)]:
   ctx=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True,reduced_motion='reduce')
   page=ctx.new_page()
   page.goto(base+'heist-fleeca.html',wait_until='domcontentloaded',timeout=45000)
   expect(page.locator('.j164-notes textarea')).to_have_count(5,timeout=15000)
   page.evaluate("""payload=>{
      localStorage.setItem(payload.key,payload.bad);
      localStorage.setItem(payload.other,JSON.stringify({approach:'Other mission preserved'}));
      localStorage.setItem(payload.check,JSON.stringify({'Scope Out':true,'Kuruma':true}));
   }""",{'key':key,'bad':broken,'other':other,'check':check})
   page.reload(wait_until='domcontentloaded')
   expect(page.locator('#j330-notes-recovery')).to_be_visible(timeout=15000)
   expect(page.locator('.j164-notes textarea')).to_have_count(5)
   expect(page.locator('.j164-notes textarea').first).to_be_disabled()
   expect(page.locator('.j164-notes button',has_text='Clear mission notes')).to_be_disabled()
   expect(page.locator('.j228-import input[type=file]')).to_be_disabled()
   with page.expect_download(timeout=15000) as info:
    page.locator('#j330-raw-notes').click()
   export=info.value
   assert export.suggested_filename=='team-jura-fleeca-unreadable-notes-raw.txt'
   assert Path(export.path()).read_text(encoding='utf-8')==broken,'Raw export must be byte-for-byte unchanged'
   # Exporting a normal plan from damaged notes must fail safely (never export a fake empty clean save).
   page.locator('.j164-notes button',has_text='Export plan').click()
   expect(page.locator('#j330-notes-status')).to_contain_text('blocked by unreadable')
   assert page.evaluate('(k)=>localStorage.getItem(k)',key)==broken
   assert page.evaluate('(k)=>JSON.parse(localStorage.getItem(k)).approach',other)=='Other mission preserved'
   assert page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))["Scope Out"]',check) is True
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'),f'Phone/desktop width overflow {width}x{height}'
   page.screenshot(path=str(EVIDENCE/f'atlas330-heist-note-recovery-{width}.png'),full_page=True)
   # User has repaired the raw note from their backup. No automatic reset ever happens.
   page.evaluate("""payload=>localStorage.setItem(payload.key,JSON.stringify(payload.good))""",{
     'key':key,'good':{'version':1,'heist':'fleeca','approach':'Original approach','legacyMarker':'keep-me','crew':'Earlier crew'}})
   page.reload(wait_until='domcontentloaded')
   expect(page.locator('#j330-notes-recovery')).to_be_hidden()
   expect(page.locator('.j164-notes textarea').first).to_be_enabled()
   expect(page.locator('.j164-notes textarea').first).to_have_value('Original approach')
   # Two stale tabs write DIFFERENT fields: the second must not erase the first.
   second=ctx.new_page()
   second.goto(base+'heist-fleeca.html',wait_until='domcontentloaded',timeout=45000)
   expect(second.locator('.j164-notes textarea')).to_have_count(5,timeout=15000)
   page.locator('.j164-notes textarea').nth(1).fill('New entry from tab A')
   second.locator('.j164-notes textarea').nth(4).fill('New crew from tab B')
   saved=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',key)
   assert saved['entry']=='New entry from tab A' and saved['crew']=='New crew from tab B',saved
   assert saved['approach']=='Original approach' and saved['legacyMarker']=='keep-me'
   second.close()
   # Cross-workspace and checklist stores may NEVER be changed by notes operations.
   expect(page.locator('.j164-notes textarea').nth(4)).to_have_value('New crew from tab B')
   page.once('dialog',lambda d:d.accept())
   page.get_by_role('button',name='Clear mission notes').click()
   cleared=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',key)
   assert 'approach' not in cleared and 'crew' not in cleared and 'entry' not in cleared,cleared
   assert cleared['legacyMarker']=='keep-me'
   assert page.evaluate('(k)=>JSON.parse(localStorage.getItem(k)).approach',other)=='Other mission preserved'
   assert page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))["Kuruma"]',check) is True
   # Safe restore adds only missing notes and leaves arbitrary legacy metadata alone.
   fixture={'schema':'teamjura-heist-plan-v1','heist':'fleeca','notes':{'approach':'Restored approach','entry':'Restored entry'}}
   page.locator('.j228-import input[type=file]').set_input_files({
     'name':'fleeca-notes.json','mimeType':'application/json','buffer':json.dumps(fixture).encode()})
   expect(page.locator('#j330-notes-status')).to_contain_text('2 field(s) restored')
   restored=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',key)
   assert restored['approach']=='Restored approach' and restored['entry']=='Restored entry'
   assert restored['legacyMarker']=='keep-me'
   # Importing same fields again never overwrites existing values.
   page.locator('.j228-import input[type=file]').set_input_files({
     'name':'fleeca-notes.json','mimeType':'application/json','buffer':json.dumps(fixture).encode()})
   expect(page.locator('#j330-notes-status')).to_contain_text('2 saved field(s) preserved')
   assert page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',key)==restored
   ctx.close()
  # Confirm the mission directory surfaces corrupt notes rather than hiding the mission.
  ctx=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
  page=ctx.new_page()
  page.goto(base+'heists.html',wait_until='domcontentloaded')
  page.evaluate('data=>localStorage.setItem(data.key,data.bad)',{'key':key,'bad':broken})
  page.reload(wait_until='domcontentloaded')
  target=page.locator('.cards article').filter(has=page.locator('h2',has_text='The Fleeca Job'))
  expect(target).to_have_attribute('data-recovery-required','true',timeout=15000)
  expect(target).to_contain_text('Saved data needs recovery')
  page.locator('#heistStarted').check()
  expect(target).to_be_visible()
  expect(page.locator('.j297-heist-resume')).to_be_visible()
  assert page.evaluate('(k)=>localStorage.getItem(k)',key)==broken
  ctx.close()
  # Cayo shares the same notes editor, but has no plan-import UI by design.
  ctx=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
  page=ctx.new_page()
  page.goto(base+'heist-cayo-perico.html',wait_until='domcontentloaded',timeout=45000)
  expect(page.locator('.j164-notes textarea')).to_have_count(5,timeout=20000)
  page.evaluate("localStorage.setItem('teamjura-heist-plan-v1:cayo-perico','{bad')")
  page.reload(wait_until='domcontentloaded')
  expect(page.locator('#j330-notes-recovery')).to_be_visible(timeout=20000)
  expect(page.locator('.j164-notes textarea').first).to_be_disabled()
  assert page.evaluate("localStorage.getItem('teamjura-heist-plan-v1:cayo-perico')")=='{bad'
  ctx.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 33.0 Chromium: 390/844/1440 layouts, raw corrupt note recovery, stale-tab field isolation, exact-heist import, checklist isolation, directory alert and Cayo note guard passed')
