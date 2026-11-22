#!/usr/bin/env python3
"""Atlas 29.9 Chromium: export/restore one heist without overwriting guest progress."""
import json,threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];P=R/'public'
assert (P/'heist-fleeca.html').is_file()
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=64
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(P)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/'
fixture={
 'schema':'teamjura-heist-bundle-v1','heist':'fleeca',
 'checklist':{'Scope Out':True,'Kuruma':True,'Unknown objective':True},
 'notes':{'approach':'Imported approach must not overwrite','crew':'Crew notes from file','exit':'Guest escape notes'},
 'focus':{'scoped':['m0','m1'],'route':['m0','m1'],'awards':['Elite']}
}
def upload(page,data):
 page.locator('#j299-heist-backup input[type="file"]').set_input_files({
  'name':'team-jura-fleeca-backup.json','mimeType':'application/json',
  'buffer':json.dumps(data).encode('utf-8')
 })
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width in (390,1440):
   ctx=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce',accept_downloads=True)
   page=ctx.new_page()
   page.goto(base+'heist-fleeca.html',wait_until='domcontentloaded',timeout=45000)
   expect(page.locator('#j299-heist-backup')).to_be_visible(timeout=15000)
   page.evaluate("""() => {
    localStorage.setItem('teamjura-heist-fleeca', JSON.stringify({'Scope Out':true,'Kuruma':false,'Finale':false}));
    localStorage.setItem('teamjura-heist-plan-v1:fleeca',JSON.stringify({approach:'Existing original',entry:'Kept entry',updatedAt:'2026-10-01T00:00:00Z'}));
    localStorage.setItem('teamjura-heist-focus-v1:fleeca',JSON.stringify({schema:1,scoped:['m0'],route:['m2'],awards:[]}));
    localStorage.setItem('teamjura-heist-prison-break',JSON.stringify({'Plane':true}));
   }""")
   page.reload(wait_until='domcontentloaded')
   expect(page.locator('#j299-heist-backup')).to_be_visible(timeout=15000)
   with page.expect_navigation(wait_until='domcontentloaded',timeout=30000):
    upload(page,fixture)
   page.wait_for_function("""() => {
    const v=JSON.parse(localStorage.getItem('teamjura-heist-plan-v1:fleeca')||'{}');
    return v.crew==='Crew notes from file';
   }""",timeout=15000)
   keys=page.evaluate("""() => ({
    check:JSON.parse(localStorage.getItem('teamjura-heist-fleeca')),
    note:JSON.parse(localStorage.getItem('teamjura-heist-plan-v1:fleeca')),
    focus:JSON.parse(localStorage.getItem('teamjura-heist-focus-v1:fleeca')),
    other:JSON.parse(localStorage.getItem('teamjura-heist-prison-break'))
   })""")
   assert keys['check']['Scope Out'] is True and keys['check']['Kuruma'] is True
   assert keys['note']['approach']=='Existing original' and keys['note']['entry']=='Kept entry'
   assert keys['note']['crew']=='Crew notes from file'
   assert keys['focus']['route']==['m2'],'Existing route was overwritten'
   assert set(keys['focus']['scoped'])=={'m0','m1'}
   assert keys['focus']['awards']==['Elite']
   assert keys['other']=={'Plane':True},'Cross-heist guest progress changed'
   expect(page.locator('input[data-step="Kuruma"]')).to_be_checked(timeout=12000)
   expect(page.locator('.j164-field textarea').first).to_have_value('Existing original')
   with page.expect_download(timeout=15000) as event:
    page.locator('.j299-export').click()
   download=event.value
   backup=json.loads(Path(download.path()).read_text(encoding='utf-8'))
   assert download.suggested_filename=='team-jura-fleeca-complete-backup.json'
   assert backup['heist']=='fleeca' and backup['schema']=='teamjura-heist-bundle-v1'
   assert backup['notes']['approach']=='Existing original'
   assert backup['focus']['route']==['m2'] and 'm1' in backup['focus']['scoped']
   assert 'Plane' not in backup['checklist']
   originals=page.evaluate("""() => ({
    a:localStorage.getItem('teamjura-heist-fleeca'),
    b:localStorage.getItem('teamjura-heist-plan-v1:fleeca'),
    c:localStorage.getItem('teamjura-heist-focus-v1:fleeca')
   })""")
   invalid={**fixture,'heist':'prison-break'}
   upload(page,invalid)
   expect(page.locator('.j299-status')).to_contain_text('Import rejected')
   current=page.evaluate("""() => ({
    a:localStorage.getItem('teamjura-heist-fleeca'),
    b:localStorage.getItem('teamjura-heist-plan-v1:fleeca'),
    c:localStorage.getItem('teamjura-heist-focus-v1:fleeca')
   })""")
   assert current==originals,'Cross-heist import unexpectedly modified progress'
   page.evaluate("localStorage.setItem('teamjura-heist-plan-v1:fleeca','{broken')")
   upload(page,fixture)
   expect(page.locator('.j299-status')).to_contain_text('Import rejected')
   assert page.evaluate("localStorage.getItem('teamjura-heist-plan-v1:fleeca')")=='{broken'
   if width==390:
    assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),'Backup panel overflow on phone'
   print(f'PASS Atlas 29.9 {width}: export, conflict-safe merge, route preservation, wrong-heist refusal and corrupt-state refusal',flush=True)
   ctx.close()
  browser.close()
finally:
 server.shutdown()
