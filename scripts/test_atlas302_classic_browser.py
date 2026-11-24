#!/usr/bin/env python3
"""Atlas 30.2: seven classic maps, malformed-save recovery and stale-tab safety."""
import json
from pathlib import Path
from threading import Thread
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'map-hub.html').exists(),'Build Cloudflare public/ first'
IDS=('iii','vc','vcs','lcs','ctw','tlad','tbogt')
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=64
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{server.server_port}/'
OUT=ROOT/'qa-evidence'/'chromium';OUT.mkdir(parents=True,exist_ok=True)
def store_key(game):return 'team-jura-atlas98-classic-'+game+'-v1'
def valid(game):
 return {'schema':'team-jura-atlas98-classic-v1','world':game,'markers':[
  {'id':'m-older','name':'Historic personal pin','category':'Missions','x':40,'y':52,'source':'personal-image-percent'}
 ],'completed':[],'background':None,'customHistory':{'source':'older-device','keep':True}}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width in (390,1440):
   context=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce',accept_downloads=True)
   context.route('https://**/*',lambda route:route.abort())
   page=context.new_page()
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   for game in IDS:
    page.goto(BASE+'map-hub.html?game='+game,wait_until='domcontentloaded',timeout=45000)
    key=store_key(game)
    raw=json.dumps(valid(game),separators=(',',':'))
    page.evaluate("([key,text])=>localStorage.setItem(key,text)",[key,raw])
    page.reload(wait_until='domcontentloaded',timeout=45000)
    expect(page.locator('#classicTitle')).not_to_be_empty(timeout=15000)
    expect(page.locator('#j302-storage-warning')).to_be_hidden()
    assert page.evaluate("key=>localStorage.getItem(key)",key)==raw,(
      game,width,'The classic map rewrote guest data on load')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'),(
      game,width,'horizontal overflow')

    # Break the record deliberately without issuing an application save.
    broken='{damaged-'+game
    page.evaluate("([key,text])=>localStorage.setItem(key,text)",[key,broken])
    page.reload(wait_until='domcontentloaded',timeout=45000)
    panel=page.locator('#j302-storage-warning')
    expect(panel).to_be_visible(timeout=15000)
    expect(panel).to_contain_text('unreadable or incompatible saved record')
    recovery=panel.locator('#j302-recovery-action')
    expect(recovery).to_be_disabled()
    assert page.evaluate("key=>localStorage.getItem(key)",key)==broken

    # The ordinary notebook export must now return the raw original bytes,
    # not a fabricated empty, apparently valid notebook.
    with page.expect_download(timeout=15000) as event:
     panel.locator('#j302-recovery-export').click()
    backup=json.loads(Path(event.value.path()).read_text(encoding='utf-8'))
    assert backup['world']==game and backup['unreadableRaw']==broken
    assert backup['schema']=='team-jura-classic-recovery-v1'
    assert page.evaluate("key=>localStorage.getItem(key)",key)==broken
    expect(recovery).to_be_enabled()
    if game=='iii':
     page.screenshot(path=str(OUT/f'atlas302-classic-recovery-{width}.png'),full_page=True)
     page.once('dialog',lambda dialog:dialog.accept())
     recovery.click()
     expect(panel).to_be_hidden(timeout=12000)
     new=page.evaluate("key=>JSON.parse(localStorage.getItem(key))",key)
     assert new['world']=='iii' and new['markers']==[] and new['completed']==[]
     # Existing independent source collection and other world keys untouched.
     assert page.locator('#classicAddPin').is_enabled()
    else:
     assert page.evaluate("key=>localStorage.getItem(key)",key)==broken
   assert not errors,(width,errors[:6])

   # Exact old/new tab race: a stale editor cannot erase a newer personal pin.
   one=context.new_page()
   two=context.new_page()
   k=store_key('iii')
   one.goto(BASE+'map-hub.html?game=iii',wait_until='domcontentloaded')
   initial=valid('iii')
   one.evaluate("([k,data])=>localStorage.setItem(k,JSON.stringify(data))",[k,initial])
   one.reload(wait_until='domcontentloaded')
   two.goto(BASE+'map-hub.html?game=iii',wait_until='domcontentloaded')
   newer=valid('iii')
   newer['markers'].append({'id':'m-newer','name':'Second tab location','category':'Missions','x':66,'y':33})
   two.evaluate("([k,data])=>localStorage.setItem(k,JSON.stringify(data))",[k,newer])
   panel=one.locator('#j302-storage-warning')
   expect(panel).to_be_visible(timeout=15000)
   expect(panel).to_contain_text('Another tab changed')
   # Classic data tools are behind an intentional disclosure; open it as a player would.
   one.locator('.classic-accordions summary').filter(has_text='Map & data tools').click()
   one.once('dialog',lambda dialog:dialog.accept())
   one.locator('#classicClear').click()
   stored=one.evaluate("k=>JSON.parse(localStorage.getItem(k))",k)
   assert stored['markers']==newer['markers'], 'Stale tab erased newer marker'
   assert stored['customHistory']==newer['customHistory']
   panel.locator('#j302-recovery-action').click()
   expect(one.locator('#classicPinList')).to_contain_text('Second tab location',timeout=20000)
   assert one.evaluate("k=>JSON.parse(localStorage.getItem(k))",k)['markers']==newer['markers']
   one.close();two.close();context.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 30.2: seven classic worlds on phone/desktop; corrupt exports, guarded reset and newer-tab pin preservation passed')
