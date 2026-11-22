#!/usr/bin/env python3
"""Atlas 30.1: all 15 heist checklist saves survive load, edits and corruption."""
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright,expect

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'heist-fleeca.html').is_file(),'Build Cloudflare public/ first'
IDS=('fleeca','prison-break','humane-labs','series-a','pacific-standard',
'doomsday-act-1','doomsday-act-2','doomsday-act-3','diamond-casino',
'cayo-perico','cluckin-bell','salvage-yard','auto-shop','agency-vip','kortz-center')
assert len(IDS)==15
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=64
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/'
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width in (390,1440):
   ctx=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce',accept_downloads=True)
   ctx.route('https://**/*',lambda route:route.abort())
   page=ctx.new_page()
   errors=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   for heist in IDS:
    key='teamjura-heist-'+heist
    page.goto(base+'heist-'+heist+'.html',wait_until='domcontentloaded',timeout=45000)
    step=page.locator('[data-step]').first.get_attribute('data-step')
    assert step,heist
    record={step:True,'Retired legacy step':True,'_history':{'revision':1,'source':'older'}}
    raw=json.dumps(record,separators=(',',':'))
    page.evaluate("([k,raw])=>localStorage.setItem(k,raw)",[key,raw])
    page.reload(wait_until='domcontentloaded',timeout=45000)
    expect(page.locator('[data-step]').first).to_be_checked(timeout=20000)
    expect(page.locator('#j301-checklist-notice')).to_be_hidden(timeout=15000)
    assert page.evaluate("k=>localStorage.getItem(k)",key)==raw,(
      heist,'Initial load rewrote saved bytes')
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),(
      width,heist,'horizontal overflow')
    # Each page supports a reversible edit that preserves unknown historical keys.
    if page.locator('[data-step]').count()>1:
     another=page.locator('[data-step]').nth(1)
     another.check()
     latest=page.evaluate("k=>JSON.parse(localStorage.getItem(k))",key)
     assert latest['Retired legacy step'] is True
     assert latest['_history']==record['_history']
     assert latest[step] is True
     assert latest[another.get_attribute('data-step')] is True
    if heist in ('fleeca','diamond-casino','cayo-perico'):
     assert page.locator('#progress').inner_text().endswith('tracked')
   assert not errors,(width,errors[:5])

   # Compare storage across two tabs on the same origin. Writes to different
   # checklist steps must not erase each other; storage events update the UI.
   page.goto(base+'heist-fleeca.html',wait_until='domcontentloaded')
   key='teamjura-heist-fleeca'
   page.evaluate("""k=>localStorage.setItem(k,JSON.stringify({
      'Scope Out':false,'Kuruma':false,'Finale':false,
      'Retired legacy step':true,extra:{from:'old build'}}))""",key)
   page.reload(wait_until='domcontentloaded')
   other=ctx.new_page()
   other.goto(base+'heist-fleeca.html',wait_until='domcontentloaded')
   other.locator('[data-step="Scope Out"]').check()
   expect(page.locator('[data-step="Scope Out"]')).to_be_checked(timeout=10000)
   page.locator('[data-step="Kuruma"]').check()
   expect(other.locator('[data-step="Kuruma"]')).to_be_checked(timeout=10000)
   latest=page.evaluate("k=>JSON.parse(localStorage.getItem(k))",key)
   assert latest['Scope Out'] and latest['Kuruma'] and latest['Retired legacy step']
   assert latest['extra']=={'from':'old build'}
   other.close()

   # Reset changes only the currently displayed three Fleeca steps, preserving
   # unknown historical progress and notes/route from independent keys.
   notes='teamjura-heist-plan-v1:fleeca'
   focus='teamjura-heist-focus-v1:fleeca'
   page.evaluate("""([n,f])=>{
     localStorage.setItem(n,JSON.stringify({approach:'My approach'}));
     localStorage.setItem(f,JSON.stringify({route:['m1'],scoped:['m0']}));
   }""",[notes,focus])
   unrelated=page.evaluate("keys=>keys.map(k=>localStorage.getItem(k))",[notes,focus])
   page.once('dialog',lambda dialog:dialog.accept())
   page.locator('#resetProgress').click()
   expect(page.locator('[data-step="Scope Out"]')).not_to_be_checked()
   cleared=page.evaluate("k=>JSON.parse(localStorage.getItem(k))",key)
   assert cleared['Scope Out'] is False and cleared['Kuruma'] is False and cleared['Finale'] is False
   assert cleared['Retired legacy step'] is True and cleared['extra']=={'from':'old build'}
   assert page.evaluate("keys=>keys.map(k=>localStorage.getItem(k))",[notes,focus])==unrelated

   # Corrupt raw storage must be protected from both check-toggle and Reset.
   page.evaluate("k=>localStorage.setItem(k,'{broken-legacy')",key)
   page.locator('[data-step="Scope Out"]').click()
   expect(page.locator('#j301-checklist-notice')).to_contain_text('not saved')
   assert page.evaluate("k=>localStorage.getItem(k)",key)=='{broken-legacy'
   page.once('dialog',lambda dialog:dialog.accept())
   page.locator('#resetProgress').click()
   expect(page.locator('#j301-checklist-notice')).to_contain_text('Reset blocked')
   assert page.evaluate("k=>localStorage.getItem(k)",key)=='{broken-legacy'
   with page.expect_download() as event:
    page.locator('#exportProgress').click()
   record=json.loads(Path(event.value.path()).read_text(encoding='utf-8'))
   assert event.value.suggested_filename=='team-jura-fleeca-progress.json'
   assert record['heist']=='fleeca' and record['steps'] is None
   assert record['unreadableRaw']=='{broken-legacy'
   assert page.evaluate("k=>localStorage.getItem(k)",key)=='{broken-legacy'
   assert page.evaluate("keys=>keys.map(k=>localStorage.getItem(k))",[notes,focus])==unrelated
   ctx.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 30.1: all 15 heist checklists, 390px/1440px, cross-tab merges, historical keys, safe corrupt exports passed')
