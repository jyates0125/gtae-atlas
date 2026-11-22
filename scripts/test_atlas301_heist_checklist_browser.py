#!/usr/bin/env python3
"""Atlas 30.1 · 15 real heist pages: read-only load, scoped saves, corrupt rescue."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import json
from playwright.sync_api import sync_playwright, expect

root=Path(__file__).resolve().parents[1]
public=root/'public'
assert (public/'heist-fleeca.html').is_file(),'Build Cloudflare payload first'
ids=('fleeca','prison-break','humane-labs','series-a','pacific-standard',
 'doomsday-act-1','doomsday-act-2','doomsday-act-3','diamond-casino','cayo-perico',
 'cluckin-bell','salvage-yard','auto-shop','agency-vip','kortz-center')
assert len(ids)==15
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=64
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(public)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/'
out=root/'qa-evidence'/'chromium'
out.mkdir(parents=True,exist_ok=True)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width in (390,1440):
   ctx=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce',accept_downloads=True)
   ctx.route('https://**/*',lambda route:route.abort())
   page=ctx.new_page()
   page.goto(base+'atlas-dashboard.html',wait_until='domcontentloaded')
   for id in ids:
    key='teamjura-heist-'+id
    assert page.evaluate('key=>localStorage.getItem(key)',key) is None
    page.goto(base+'heist-'+id+'.html',wait_until='domcontentloaded',timeout=45000)
    checks=page.locator('input[data-step]')
    expect(checks.first).to_be_visible(timeout=20000)
    # Cayo's flagship mission board hides the legacy checklist container.
    # Its handler/status must still exist, without forcing a second UI over it.
    if id=='cayo-perico':
     expect(page.locator('#j301-checklist-status')).to_have_count(1)
     expect(page.locator('#j301-checklist-status')).to_contain_text('Checklist updates')
    else:
     expect(page.locator('#j301-checklist-status')).to_be_visible()
    assert page.evaluate('key=>localStorage.getItem(key)',key) is None,(
      id,'Merely visiting a heist page wrote a checklist key')
    assert not checks.first.is_disabled()
    first=checks.first.get_attribute('data-step')
    if id=='cayo-perico':
     # Cayo intentionally hides the old checklist beneath its modern mission
     # board. Exercise the shared save handler with a genuine change event,
     # without trying to click a legacy control users cannot see.
     page.evaluate("""() => {
       const input=document.querySelector('input[data-step]');
       input.checked=true;
       input.dispatchEvent(new Event('change',{bubbles:true}));
     }""")
    else:
     checks.first.check()
    saved=page.evaluate('key=>JSON.parse(localStorage.getItem(key))',key)
    assert saved[first] is True,(id,'Checklist interaction not saved')
    untouched=page.evaluate('key=>localStorage.getItem(key)',key)
    page.reload(wait_until='domcontentloaded')
    expect(page.locator('input[data-step]').first).to_be_checked(timeout=12000)
    assert page.evaluate('key=>localStorage.getItem(key)',key)==untouched,(
      id,'Reopening a heist rewrote a valid guest checklist')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'),(
      width,id,'horizontal overflow')
    if id in ('fleeca','cayo-perico','kortz-center'):
     page.screenshot(path=str(out/f'atlas301-{id}-{width}.png'),full_page=True)

   # Same-page external save: no storage event, so the old tab's cache is stale.
   # Editing one checkbox must re-read and retain every unrelated saved mark.
   page.goto(base+'heist-fleeca.html',wait_until='domcontentloaded')
   first='Scope Out';second='Kuruma'
   key='teamjura-heist-fleeca'
   page.evaluate("""key=>{
    const v=JSON.parse(localStorage.getItem(key));
    v['Kuruma']=true;v.history='kept from old revision';
    localStorage.setItem(key,JSON.stringify(v));
   }""",key)
   page.locator('input[data-step="Finale"]').check()
   saved=page.evaluate('key=>JSON.parse(localStorage.getItem(key))',key)
   assert saved[first] and saved[second] and saved['Finale'] and saved['history']=='kept from old revision'
   assert page.locator('input[data-step="Kuruma"]').is_checked(), 'UI did not reflect latest saved step after edit'

   # Guest checklist export must read the latest local copy, not stale tab UI.
   page.evaluate("""key=>{
    const v=JSON.parse(localStorage.getItem(key));v['Kuruma']=false;
    localStorage.setItem(key,JSON.stringify(v));
   }""",key)
   with page.expect_download(timeout=15000) as event:
    page.locator('#exportProgress').click()
   obj=json.loads(Path(event.value.path()).read_text(encoding='utf-8'))
   assert obj['heist']=='fleeca'
   assert obj['steps']['Kuruma'] is False
   assert obj['steps']['Scope Out'] is True
   assert page.evaluate('key=>JSON.parse(localStorage.getItem(key)).history',key)=='kept from old revision'

   # Invalid JSON must be backed up byte-for-byte before an explicit repair.
   notes='teamjura-heist-plan-v1:fleeca';focus='teamjura-heist-focus-v1:fleeca'
   page.evaluate("""([k,n,f])=>{
    localStorage.setItem(k,'{saved-corrupted-checklist');
    localStorage.setItem(n,JSON.stringify({approach:'Keep notes'}));
    localStorage.setItem(f,JSON.stringify({schema:1,route:['m1'],scoped:['m0']}));
   }""",[key,notes,focus])
   page.reload(wait_until='domcontentloaded')
   assert page.evaluate('key=>localStorage.getItem(key)',key)=='{saved-corrupted-checklist'
   expect(page.locator('#j301-checklist-status')).to_contain_text('cannot be read')
   expect(page.locator('input[data-step]').first).to_be_disabled()
   expect(page.locator('#j301-rescue-download')).to_be_visible()
   expect(page.locator('#j301-rescue-reset')).to_be_disabled()
   with page.expect_download() as event:
    page.locator('#j301-rescue-download').click()
   rescue=Path(event.value.path()).read_text(encoding='utf-8')
   assert rescue=='{saved-corrupted-checklist', 'Raw recovery export must preserve exact bytes'
   assert not page.locator('#j301-rescue-reset').is_disabled()
   page.on('dialog',lambda dialog:dialog.accept())
   page.locator('#j301-rescue-reset').click()
   assert page.evaluate('key=>localStorage.getItem(key)',key)=='{}'
   expect(page.locator('input[data-step]').first).to_be_enabled()
   assert page.evaluate('key=>JSON.parse(localStorage.getItem(key)).approach',notes)=='Keep notes'
   assert page.evaluate('key=>JSON.parse(localStorage.getItem(key)).route',focus)==['m1']
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'),width
   ctx.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 30.1 passed: all 15 mission checklists, both widths, read-only loads, cross-tab marks, accurate exports, raw rescue and explicit repair')
