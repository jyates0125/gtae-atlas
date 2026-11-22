#!/usr/bin/env python3
"""Atlas 29.7 real Chromium/Edge: resume HQ and 14 non-Cayo mission workspaces."""
import os,threading
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'heists.html').is_file(),'Build Cloudflare public/ first'
IDS=('fleeca','prison-break','humane-labs','series-a','pacific-standard',
     'doomsday-act-1','doomsday-act-2','doomsday-act-3','diamond-casino',
     'cluckin-bell','salvage-yard','auto-shop','agency-vip','kortz-center')
assert len(IDS)==14
DETAIL={'fleeca','doomsday-act-3','diamond-casino','kortz-center'}
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=64
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
threading.Thread(target=server.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{server.server_port}/'
engine=os.getenv('ATLAS_BROWSER','chromium')
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,**({'channel':'msedge'} if engine=='msedge' else {}))
  for width,height in ((390,844),(1440,900)):
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   context.route('https://**/*',lambda route:route.abort())
   page=context.new_page()
   page.goto(BASE+'heists.html',wait_until='domcontentloaded',timeout=45000)
   expect(page.locator('#heistCount')).to_have_text('15 of 15 workspaces',timeout=20000)
   expect(page.locator('.j297-heist-resume')).to_be_hidden()
   # Seed only the isolated browser context; directory must read and never rewrite saves.
   page.evaluate("""() => {
     localStorage.setItem('teamjura-heist-fleeca',JSON.stringify({'Scope Out':true}));
     localStorage.setItem('teamjura-heist-plan-v1:doomsday-act-3',JSON.stringify({approach:'Owner route',updatedAt:'2026-11-22T12:00:00Z'}));
     localStorage.setItem('teamjura-heist-focus-v1:kortz-center',JSON.stringify({route:['m1'],scoped:['m0'],updatedAt:'2026-11-22T13:00:00Z'}));
     localStorage.setItem('teamjura-heist-plan-v1:diamond-casino','{not json');
   }""")
   page.reload(wait_until='domcontentloaded')
   resume=page.locator('.j297-heist-resume')
   expect(resume).to_be_visible(timeout=15000)
   expect(resume.locator('.j297-resume-card')).to_have_count(3)
   urls=set(resume.locator('a').evaluate_all("(items)=>items.map(x=>x.getAttribute('href'))"))
   assert urls=={'./heist-fleeca.html','./heist-doomsday-act-3.html','./heist-kortz-center.html'},urls
   assert page.evaluate("localStorage.getItem('teamjura-heist-plan-v1:diamond-casino')")=='{not json'
   page.locator('#heistStarted').check()
   expect(page.locator('#heistCount')).to_have_text('3 of 15 workspaces')
   page.locator('#heistSearch').fill('kortz')
   expect(page.locator('#heistCount')).to_have_text('1 of 15 workspaces')
   page.locator('#heistReset').click()
   expect(page.locator('#heistCount')).to_have_text('15 of 15 workspaces')
   if width==390:
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+1"),'Heist HQ phone overflow'
   for heist in IDS:
    page.goto(BASE+'heist-'+heist+'.html',wait_until='domcontentloaded',timeout=45000)
    assert page.locator('body').get_attribute('data-heist')==heist
    expect(page.locator('#j167-heist-map')).to_be_attached(timeout=15000)
    expect(page.locator('#j168-heist-guide')).to_be_attached(timeout=15000)
    expect(page.locator('#j169-views')).to_be_attached(timeout=15000)
    expect(page.locator('#j164-mission-map')).to_be_attached(timeout=15000)
    expect(page.locator('.j167-pin').first).to_be_attached(timeout=15000)
    cover=page.locator('.mapbox > img')
    expect(cover).to_have_count(1)
    cover.evaluate("(img)=>{img.loading='eager'}")
    expect(cover).to_have_js_property('complete',True,timeout=15000)
    assert cover.evaluate('(img)=>img.naturalWidth>0'),heist+' unique cover did not decode'
    assert page.locator('#j164-map-frame').is_hidden(),'Embedded wider map loads only on demand'
    if heist in DETAIL:
     item=page.locator('.j167-item').first
     expect(item).to_be_visible()
     item.click()
     detail=page.locator('.j167-detail')
     expect(detail.get_by_role('button',name='Mark scoped')).to_be_visible()
     detail.get_by_role('button',name='Mark scoped').click()
     detail.get_by_role('button',name='+ Add to route').click()
     save=page.evaluate("(id)=>JSON.parse(localStorage.getItem('teamjura-heist-focus-v1:'+id))",heist)
     assert len(save['route'])==1 and len(save['scoped'])==1,(heist,save)
     check=page.locator('input[data-step]').first
     check.check()
     assert page.evaluate("(id)=>Object.values(JSON.parse(localStorage.getItem('teamjura-heist-'+id))).some(x=>x===true)",heist)
     text=page.locator('.j164-field textarea').first
     text.fill('Personal test route')
     assert page.evaluate("(id)=>JSON.parse(localStorage.getItem('teamjura-heist-plan-v1:'+id)).approach",heist)=='Personal test route'
     page.locator('#j169-views [data-view="objective"]').click()
     expect(page.locator('#j169-objective')).to_be_visible()
     expect(page.locator('.j169-objective-card').first).to_be_visible()
     page.locator('#j169-views [data-view="enhanced"]').click()
     expect(page.locator('.j167-viewport')).to_be_visible()
     load=page.locator('#j164-mission-map .j164-main')
     load.click()
     expect(load).to_have_attribute('aria-expanded','true')
     assert not page.locator('#j164-map-frame').is_hidden()
     load.click()
     expect(load).to_have_attribute('aria-expanded','false')
     assert page.locator('#j164-map-frame').is_hidden()
     page.reload(wait_until='domcontentloaded')
     expect(page.locator('.j164-field textarea').first).to_have_value('Personal test route',timeout=15000)
     expect(page.locator('input[data-step]').first).to_be_checked()
     saved=page.evaluate("(id)=>JSON.parse(localStorage.getItem('teamjura-heist-focus-v1:'+id))",heist)
     assert len(saved['route'])==1,(heist,saved)
    if width==390:
     assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),heist+' phone overflow'
   print(f'PASS Atlas 29.7 {engine} {width}: 14 non-Cayo mission maps, source-labeled covers, HQ resume, private notes/routes/checklists',flush=True)
   context.close()
  browser.close()
finally:
 server.shutdown()
