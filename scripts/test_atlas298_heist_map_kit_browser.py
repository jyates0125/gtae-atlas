#!/usr/bin/env python3
"""Atlas 29.8: 14 unique non-Cayo mission phase maps, local route backup QA."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
from playwright.sync_api import sync_playwright, expect

root=Path(__file__).resolve().parents[1]
public=root/'public'
assert (public/'heist-fleeca.html').is_file(),'Build Cloudflare payload first'
ids=('fleeca','prison-break','humane-labs','series-a','pacific-standard',
     'doomsday-act-1','doomsday-act-2','doomsday-act-3',
     'diamond-casino','cluckin-bell','salvage-yard','auto-shop','agency-vip','kortz-center')
assert len(ids)==14
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
   context=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce',accept_downloads=True)
   context.route('https://**/*',lambda route:route.abort())
   page=context.new_page()
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   for id in ids:
    page.goto(base+'heist-'+id+'.html',wait_until='domcontentloaded',timeout=45000)
    kit=page.locator('#j298-mission-map-kit')
    expect(kit).to_be_visible(timeout=30000)
    expect(kit.locator('[data-j298-phase]')).to_have_count(3)
    expect(kit.locator('[data-j298-phase=all]')).to_have_attribute('aria-pressed','true')
    pins=page.locator('#j167-heist-map .j167-pin')
    all_count=pins.count()
    assert all_count>=4,(width,id,'missing distinct mission POIs',all_count)
    save_key='teamjura-heist-focus-v1:'+id
    before=page.evaluate("key=>localStorage.getItem(key)",save_key)
    kit.locator('[data-j298-phase=recon]').click()
    expect(kit.locator('[data-j298-phase=recon]')).to_have_attribute('aria-pressed','true')
    recon_count=pins.count()
    assert 0<recon_count<all_count,(id,'recon phase not meaningful')
    assert page.locator('.j167-chip[data-cat=prep]').get_attribute('aria-pressed')=='true'
    assert page.locator('.j167-chip[data-cat=entry]').get_attribute('aria-pressed')=='false'
    kit.locator('[data-j298-phase=finale]').click()
    expect(kit.locator('[data-j298-phase=finale]')).to_have_attribute('aria-pressed','true')
    finale_count=pins.count()
    assert finale_count>0,(id,'finale map is blank')
    kit.locator('[data-j298-phase=all]').click()
    expect(pins).to_have_count(all_count)
    assert page.evaluate("key=>localStorage.getItem(key)",save_key)==before,(
      id,'phase switching must not modify saved route')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'),(
      width,id,'horizontal overflow')
    if id in ('fleeca','diamond-casino','kortz-center'):
     page.screenshot(path=str(out/f'atlas298-{id}-{width}.png'),full_page=True)
   assert not errors,(width,errors[:5])

   # Only one deeper portability journey per browser width, without Cayo.
   id='fleeca'
   page.goto(base+'heist-fleeca.html',wait_until='domcontentloaded')
   kit=page.locator('#j298-mission-map-kit')
   expect(kit).to_be_visible(timeout=20000)
   key='teamjura-heist-focus-v1:fleeca'
   notes_key='teamjura-heist-plan-v1:fleeca'
   checklist_key='teamjura-heist-fleeca'
   page.evaluate("""([k,n,c]) => {
    localStorage.setItem(k,JSON.stringify({schema:1,route:['m0'],scoped:['m1'],awards:['a0'],
     customHistory:'KEEP'}));
    localStorage.setItem(n,JSON.stringify({entry:'Personal bank approach',crew:'Team Jura'}));
    localStorage.setItem(c,JSON.stringify({'Scope Out':true}));
   }""",[key,notes_key,checklist_key])
   page.reload(wait_until='domcontentloaded')
   kit=page.locator('#j298-mission-map-kit')
   expect(kit).to_be_visible(timeout=20000)
   expect(page.locator('#j167-heist-map .j167-route [data-route-point]')).to_have_count(1)
   with page.expect_download() as download:
    kit.get_by_role('button',name='Export mission map').click()
   backup=json.loads(Path(download.value.path()).read_text(encoding='utf-8'))
   assert backup['schema']=='teamjura-heist-map-transfer-v1'
   assert backup['heist']=='fleeca'
   assert backup['route']==['m0']
   assert not any(key in backup for key in ('coordinates','notes','crew','entry')),(
    'Transfer may not disclose private free-text notes or invented coordinates')
   previous=page.evaluate("keys=>keys.map(k=>localStorage.getItem(k))",[key,notes_key,checklist_key])
   wrong=dict(backup);wrong['heist']='diamond-casino'
   kit.locator('input[type=file]').set_input_files({
    'name':'foreign-mission.json','mimeType':'application/json',
    'buffer':json.dumps(wrong).encode('utf-8')})
   expect(kit.locator('.j298-message')).to_contain_text('Import rejected')
   assert page.evaluate("keys=>keys.map(k=>localStorage.getItem(k))",[key,notes_key,checklist_key])==previous

   incoming=dict(backup)
   incoming['route']=['m2','m3','m0']
   incoming['scoped']=['m3','m1']
   incoming['awards']=['a1','a0']
   kit.locator('input[type=file]').set_input_files({
    'name':'fleeca-mission.json','mimeType':'application/json',
    'buffer':json.dumps(incoming).encode('utf-8')})
   expect(kit.locator('.j298-message')).to_contain_text('Restored 2 route stop')
   state=page.evaluate("key=>JSON.parse(localStorage.getItem(key))",key)
   assert state['route']==['m0','m2','m3']
   assert state['scoped']==['m1','m3']
   assert state['awards']==['a0','a1']
   assert state['customHistory']=='KEEP'
   assert page.evaluate("keys=>keys.map(k=>localStorage.getItem(k))",[notes_key,checklist_key])==previous[1:]
   kit.get_by_role('button',name='Show restored map').click()
   expect(page.locator('#j167-heist-map .j167-route [data-route-point]')).to_have_count(3,timeout=20000)
   expect(page.locator('#j298-mission-map-kit')).to_be_visible()
   assert page.evaluate("keys=>keys.map(k=>localStorage.getItem(k))",[notes_key,checklist_key])==previous[1:]
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'),width
   context.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 29.8 complete: all 14 non-Cayo mission phases at phone/desktop, durable route transfer, scope and privacy')
