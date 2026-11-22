#!/usr/bin/env python3
"""Atlas 31.2 built Chromium: V/VI raw recovery, newer-tab race and exact key isolation."""
import json
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'atlas-vehicle-configurator.html').is_file(),'Build the Cloudflare static payload first'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{server.server_port}/atlas-vehicle-configurator.html'
V='team-jura-atlas101-concept-presets-v1'
VI='team-jura-forge-vi-concept-presets-v1'
G='team-jura-atlas93-garage-v1'
O='team-jura-atlas90-collection-v1'
OUT=ROOT/'qa-evidence'/'chromium';OUT.mkdir(parents=True,exist_ok=True)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for world,model,key,other in [('v','adder',V,VI),('vi','vi_squalo',VI,V)]:
   for width,height in [(390,844),(1440,900)]:
    context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce',accept_downloads=True)
    context.route('https://**/*',lambda route:route.abort())
    page=context.new_page()
    page.goto(BASE+('?world=vi&model='+model if world=='vi' else '?model='+model),wait_until='domcontentloaded')
    broken=('{damaged-'+world) if world=='v' else '{"schema":2,"builds":{},"variants":{}}'
    unrelated={other:json.dumps({'schema':1,'builds':{'sentinel':{'model':'sentinel','name':'Keep'}},'variants':{}},separators=(',',':')),
               G:'{"schema":1,"garages":["Main Garage"],"vehicles":{"adder":{"paint":"#ffcc00"}}}',
               O:'{"schema":1,"owned":{"vehicles5:adder":true}}'}
    page.evaluate("([key,raw,other])=>{localStorage.setItem(key,raw);for(const [k,v] of Object.entries(other))localStorage.setItem(k,v)}",[key,broken,unrelated])
    page.reload(wait_until='domcontentloaded')
    expect(page.locator('#j312-recovery')).to_be_visible(timeout=20000)
    expect(page.locator('#j312-reset')).to_be_disabled()
    assert page.evaluate("key=>localStorage.getItem(key)",key)==broken
    assert all(page.evaluate("k=>localStorage.getItem(k)",k)==v for k,v in unrelated.items())
    with page.expect_download(timeout=15000) as event:
     page.locator('#j312-export').click()
    file=event.value
    data=json.loads(Path(file.path()).read_text(encoding='utf-8'))
    assert data['schema']=='team-jura-forge-recovery-v1'
    assert data['world']==world and data['originalKey']==key
    assert data['unreadableRaw']==broken
    expect(page.locator('#j312-reset')).to_be_enabled()
    # A newer tab wrote a valid record; the old reset must not delete it.
    latest='{"schema":1,"builds":{"latest":{"note":"newer tab"}},"variants":{}}'
    page.evaluate("([key,value])=>localStorage.setItem(key,value)",[key,latest])
    page.locator('#j312-reset').click()
    assert page.evaluate("key=>localStorage.getItem(key)",key)==latest
    expect(page.locator('#j312-recovery')).to_be_hidden()
    page.evaluate("([key,value])=>localStorage.setItem(key,value)",[key,broken])
    page.reload(wait_until='domcontentloaded')
    expect(page.locator('#j312-reset')).to_be_disabled()
    with page.expect_download() as second:
     page.locator('#j312-export').click()
    expect(page.locator('#j312-reset')).to_be_enabled()
    page.once('dialog',lambda dialog:dialog.dismiss())
    page.locator('#j312-reset').click()
    assert page.evaluate("key=>localStorage.getItem(key)",key)==broken
    page.once('dialog',lambda dialog:dialog.accept())
    page.locator('#j312-reset').click()
    expect(page.locator('#j312-recovery')).to_be_hidden()
    fresh=page.evaluate("key=>JSON.parse(localStorage.getItem(key))",key)
    assert fresh=={'schema':1,'builds':{},'variants':{}}
    assert all(page.evaluate("k=>localStorage.getItem(k)",k)==v for k,v in unrelated.items())
    assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),(world,width,'horizontal overflow')
    if width==390:
     page.screenshot(path=str(OUT/f'atlas312-forge-recovery-{world}-phone.png'),full_page=False)
    context.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 31.2: both worlds, phone/desktop, byte-exact backup, stale-tab refusal and isolated confirmed reset passed')
