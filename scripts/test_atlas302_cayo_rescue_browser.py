#!/usr/bin/env python3
"""Atlas 30.2: Cayo readable saved state stays unchanged; raw rescue works on phone/desktop."""
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
public=root/'public'
assert (public/'heist-cayo-perico.html').is_file(),'Build Cloudflare site first'
out=root/'qa-evidence'/'chromium';out.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(public)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/'
K='teamjura-heist-cayo-perico'
R='teamjura-heist-focus-v1:cayo-perico'
N='teamjura-heist-plan-v1:cayo-perico'
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width in (390,1440):
   context=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce',accept_downloads=True)
   context.route('https://**/*',lambda route:route.abort())
   page=context.new_page()
   errors=[];page.on('pageerror',lambda x:errors.append(str(x)))
   page.goto(base+'heist-cayo-perico.html',wait_until='domcontentloaded')
   expect(page.locator('.j180-map-area')).to_be_visible(timeout=30000)
   expect(page.locator('#j302-cayo-recovery')).to_have_count(0)
   assert page.evaluate('k=>localStorage.getItem(k)',K) is None,'Clean Cayo page wrote legacy guest record'
   assert page.locator('script[src*="atlas302-cayo-legacy-rescue.js"]').count()==1
   assert page.locator('script[src*="atlas298-heist-map-kit.js"]').count()==0
   page.evaluate("""([key,route,note])=>{
     localStorage.setItem(key,'{broken-cayo-legacy');
     localStorage.setItem(route,JSON.stringify({route:['m1'],scoped:['m0']}));
     localStorage.setItem(note,JSON.stringify({approach:'Preserve Cayo approach'}));
   }""",[K,R,N])
   original=page.evaluate("keys=>keys.map(k=>localStorage.getItem(k))",[K,R,N])
   page.reload(wait_until='domcontentloaded')
   panel=page.locator('#j302-cayo-recovery')
   expect(panel).to_be_visible(timeout=30000)
   expect(panel).to_contain_text('older Cayo checklist')
   expect(page.locator('.j180-map-area')).to_be_visible()
   expect(panel.locator('#j302-cayo-reset')).to_be_disabled()
   assert page.evaluate("keys=>keys.map(k=>localStorage.getItem(k))",[K,R,N])==original
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'),f'Cayo rescue overflow at {width}px'
   page.screenshot(path=str(out/f'atlas302-cayo-emergency-{width}.png'),full_page=True)
   with page.expect_download() as event:
     panel.locator('#j302-cayo-download').click()
   assert event.value.suggested_filename=='team-jura-cayo-perico-raw-checklist-recovery.txt'
   assert Path(event.value.path()).read_text(encoding='utf-8')=='{broken-cayo-legacy'
   expect(panel.locator('#j302-cayo-reset')).to_be_enabled()
   # A same-tab updated damaged record must never be overwritten by stale rescue.
   page.evaluate("k=>localStorage.setItem(k,'{changed-after-copy')",K)
   page.on('dialog',lambda dialog:dialog.accept())
   panel.locator('#j302-cayo-reset').click()
   expect(panel.locator('.j302-cayo-status')).to_contain_text('Reset blocked')
   assert page.evaluate("k=>localStorage.getItem(k)",K)=='{changed-after-copy'
   with page.expect_download() as event:
     panel.locator('#j302-cayo-download').click()
   assert Path(event.value.path()).read_text(encoding='utf-8')=='{changed-after-copy'
   panel.locator('#j302-cayo-reset').click()
   assert page.evaluate("k=>localStorage.getItem(k)",K)=='{}'
   expect(panel).to_have_count(0)
   assert page.evaluate("keys=>keys.map(k=>localStorage.getItem(k))",[R,N])==original[1:]
   expect(page.locator('.j180-map-area')).to_be_visible()
   assert not errors,errors[:5]
   # Existing non-Cayo mission phases are loaded exactly once.
   page.goto(base+'heist-fleeca.html',wait_until='domcontentloaded')
   expect(page.locator('#j298-mission-map-kit')).to_be_visible(timeout=20000)
   assert page.locator('script[src*="atlas298-heist-map-kit.js"]').count()==1,'Duplicate heist map module'
   assert page.locator('link[href*="atlas298-heist-map-kit.css"]').count()==1,'Duplicate map stylesheet'
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),width
   context.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 30.2 Cayo mobile/desktop raw recovery and single mission-map loader passed')
