#!/usr/bin/env python3
"""Atlas 31.3: private named Forge handoff without name in share URL."""
import json
from pathlib import Path
from threading import Thread
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'atlas-forge-collections.html').is_file(),'Build Cloudflare static payload first'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=80
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
keys={'v':'team-jura-atlas101-concept-presets-v1','vi':'team-jura-forge-vi-concept-presets-v1'}
handoff='team-jura-forge-private-handoff-v1'
OUT=ROOT/'qa-evidence/chromium';OUT.mkdir(parents=True,exist_ok=True)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width,height in ((390,844),(844,390),(1440,900)):
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   context.route('https://**/*',lambda route:route.abort())
   page=context.new_page()
   page.goto(base+'/atlas-forge-collections.html',wait_until='domcontentloaded')
   sensitive='Private Violet - do not share'
   records={
    'v':{'schema':1,'builds':{},'variants':{'sultan':[{'model':'sultan','name':sensitive,'paint':'#dd11aa','note':'Keep private','body':'auto','design':{}}]}},
    'vi':{'schema':1,'builds':{},'variants':{'vi_squalo':[{'model':'vi_squalo','name':'VI Harbor Confidential','paint':'#00bbcc','note':'Keep VI private','body':'auto','design':{}}]}}
   }
   for world,key in keys.items():
    page.evaluate("([key,content])=>localStorage.setItem(key,JSON.stringify(content))",[key,records[world]])
   page.reload(wait_until='domcontentloaded')
   cards=page.locator('#forgeCollectionRows .fc-entry')
   expect(cards).to_have_count(2,timeout=20000)
   links=cards.locator('a')
   assert all('Private' not in (x or '') and 'Confidential' not in (x or '') and '#variant=' not in (x or '') for x in links.evaluate_all('(a)=>a.map(x=>x.href)'))
   for model,name,world in [('sultan',sensitive,'v'),('vi_squalo','VI Harbor Confidential','vi')]:
    if not page.url.endswith('/atlas-forge-collections.html'):
     page.goto(base+'/atlas-forge-collections.html',wait_until='domcontentloaded')
    expect(cards).to_have_count(2,timeout=15000)
    target=cards.filter(has_text=name).locator('a')
    href=target.get_attribute('href')
    assert href and name not in href and '#variant=' not in href
    target.click()
    expect(page.locator('#modelSelect')).to_have_value(model,timeout=30000)
    expect(page.locator('#paintColor')).to_have_value(records[world]['variants'][model][0]['paint'])
    expect(page.locator('#builderStatus')).to_contain_text('Opened saved named concept',timeout=20000)
    assert name not in page.url and '#variant=' not in page.url,(width,world,'name exposed in URL')
    assert page.evaluate('sessionStorage.getItem("team-jura-forge-private-handoff-v1")') is None
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(width,world,'overflow')
    if width==390:
     page.screenshot(path=str(OUT/f'atlas313-private-{world}.png'),full_page=False)
   # Existing user bookmarks with a title must still load but immediately scrub it.
   page.goto(base+'/atlas-vehicle-configurator.html?model=sultan#variant='+sensitive.replace(' ','%20'),wait_until='domcontentloaded')
   expect(page.locator('#paintColor')).to_have_value('#dd11aa',timeout=30000)
   assert '#variant=' not in page.url and sensitive not in page.url
   for world,key in keys.items():
    assert page.evaluate("([k,v])=>JSON.stringify(JSON.parse(localStorage.getItem(k)))===JSON.stringify(v)",[key,records[world]])
   context.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 31.3: two-world named Forge privacy, bookmark scrub, storage safety and three Chromium viewports passed')
