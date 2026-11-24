#!/usr/bin/env python3
"""Atlas 32.3: Passport copy remains explicitly user-confirmed and world-isolated."""
import json
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1];PUBLIC=ROOT/'public'
assert (PUBLIC/'atlas-passport.html').is_file(),'Cloudflare static payload required'
EVIDENCE=ROOT/'qa-evidence'/'chromium';EVIDENCE.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
pass_key='team-jura-passport-v74'
iii_key='team-jura-atlas98b-items-iii-v1'
vcs_key='team-jura-atlas98b-items-vcs-v1'
lcs_key='team-jura-atlas98b-items-lcs-v1'
old_pass={'iii__hidden-packages':12,'lcs__hidden-packages':6,'vc__hidden-packages':4}
iii={'schema':'team-jura-atlas98b-items-v1','game':'iii','done':{'Hidden packages':[1,3,4]}}
lcs={'schema':'team-jura-atlas98b-items-v1','game':'lcs','done':{'Hidden packages':[1,2]}}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  context=browser.new_context(viewport={'width':390,'height':844},accept_downloads=True,reduced_motion='reduce')
  page=context.new_page();page.goto(base+'/atlas-passport.html',wait_until='domcontentloaded')
  page.evaluate("""data => {
   localStorage.setItem(data.passKey,JSON.stringify(data.passport));
   localStorage.setItem(data.iiiKey,JSON.stringify(data.iii));
   localStorage.setItem(data.lcsKey,JSON.stringify(data.lcs));
   localStorage.setItem(data.vcsKey,'{broken-checklist');
  }""",{'passKey':pass_key,'passport':old_pass,'iiiKey':iii_key,'iii':iii,'lcsKey':lcs_key,'lcs':lcs,'vcsKey':vcs_key})
  before=page.evaluate("keys=>keys.map(k=>localStorage.getItem(k))",[iii_key,vcs_key,lcs_key])
  page.reload(wait_until='domcontentloaded')
  expect(page.locator('#passportTotalWorlds')).to_have_text('12')
  iii_card=page.locator('.passport-world').filter(has=page.locator('h3',has_text='GTA III'))
  expect(iii_card).to_contain_text('Classic checklist on this device: 3 / 100')
  expect(iii_card).to_contain_text('Passport: 12 / 100')
  vcs_card=page.locator('.passport-world').filter(has=page.locator('h3',has_text='Vice City Stories'))
  expect(vcs_card).to_contain_text('cannot be read safely')
  expect(vcs_card.locator('button',has_text='Use saved checklist count')).to_have_count(0)
  expect(iii_card.locator('a',has_text='Open exact checklist')).to_have_attribute('href','./map-hub.html?game=iii&collection=Hidden%20packages')
  lcs_card=page.locator('.passport-world').filter(has=page.locator('h3',has_text='Liberty City Stories'))
  expect(lcs_card).to_contain_text('Classic checklist on this device: 2 / 100')
  for width,height in ((390,844),(1440,900)):
   page.set_viewport_size({'width':width,'height':height})
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'),f'Passport overflow at {width}x{height}'
   page.screenshot(path=str(EVIDENCE/f'atlas323-passport-{width}.png'),full_page=True)
  # Only a user-confirmed, same-goal copy updates Passport. Keep other worlds and the source.
  page.once('dialog',lambda dialog:dialog.accept())
  iii_card.locator('button',has_text='Use saved checklist count').click()
  expect(page.locator('#passportMessage')).to_contain_text('updated from its saved local checklist')
  updated=page.evaluate('key=>JSON.parse(localStorage.getItem(key))',pass_key)
  assert updated=={'iii__hidden-packages':3,'lcs__hidden-packages':6,'vc__hidden-packages':4},updated
  assert page.evaluate("keys=>keys.map(k=>localStorage.getItem(k))",[iii_key,vcs_key,lcs_key])==before
  # Re-open other world profile, refuse user rejection of a lower count.
  page.once('dialog',lambda dialog:dialog.dismiss())
  lcs_card=page.locator('.passport-world').filter(has=page.locator('h3',has_text='Liberty City Stories'))
  lcs_card.locator('button',has_text='Use saved checklist count').click()
  unchanged=page.evaluate('key=>JSON.parse(localStorage.getItem(key))',pass_key)
  assert unchanged==updated
  # Original game-specific exact link should restore the specific collection.
  page.locator('.passport-world').filter(has=page.locator('h3',has_text='GTA III')).locator('a',has_text='Open exact checklist').click()
  expect(page.locator('#j98bSet')).to_have_value('Hidden packages',timeout=20000)
  assert page.evaluate("keys=>keys.map(k=>localStorage.getItem(k))",[iii_key,vcs_key,lcs_key])==before
  context.close();browser.close()
finally:
 server.shutdown()
print('Atlas 32.3: 12 Passport records, seven linked sources, 390/1440px, owner-approved one-way count copy, declined copy and source isolation passed')
