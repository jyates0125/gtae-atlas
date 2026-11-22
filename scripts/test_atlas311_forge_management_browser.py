#!/usr/bin/env python3
"""Atlas 31.1: V+VI Forge named versions, stale-tab protection, exact private keys."""
import json
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
public=root/'public'
assert (public/'atlas-vehicle-configurator.html').is_file(),'Build actual public payload'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(public)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
V='team-jura-atlas101-concept-presets-v1'
VI='team-jura-forge-vi-concept-presets-v1'
G='team-jura-atlas93-garage-v1'
O='team-jura-atlas90-collection-v1'
out=root/'qa-evidence/chromium'
out.mkdir(parents=True,exist_ok=True)
def variant(model,name,paint,note):
 return {'model':model,'name':name,'paint':paint,'body':'auto','note':note,'design':{},'updated':'2026-11-22T01:00:00Z'}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for world,model,other,forge_key in [('v','adder','sultan',V),('vi','vi_squalo','vi_stanier55',VI)]:
   for width,height in [(390,844),(844,390),(1440,900)]:
    context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
    context.route('https://**/*',lambda route:route.abort())
    page=context.new_page()
    params='?world=vi&model='+model if world=='vi' else '?model='+model
    page.goto(base+'/atlas-vehicle-configurator.html'+params,wait_until='domcontentloaded')
    a=variant(model,'Night Harbor','#abc123','Protected night notes')
    b=variant(model,'Morning Run','#2266bb','Protected morning notes')
    v={'schema':1,'builds':{model:variant(model,'Primary Idea','#ff9911','Main note')},
       'variants':{model:[a,b],other:[variant(other,'Other Model','#112233','Keep this other model')]}}
    unrelated={'schema':1,'builds':{},'variants':{'sentinel':[variant('sultan','Other world','#443322','Never touch')]}}
    seed={forge_key:json.dumps(v,separators=(',',':')),VI if forge_key==V else V:json.dumps(unrelated,separators=(',',':')),
          G:'{"schema":1,"garages":["Marina"],"vehicles":{"adder":{"paint":"#ff0000","garage":"Marina"}}}',
          O:'{"schema":1,"owned":{"vehicles5:adder":true}}'}
    page.evaluate("values=>{for(const [k,v] of Object.entries(values))localStorage.setItem(k,v)}",seed)
    page.reload(wait_until='domcontentloaded')
    expect(page.locator('#modelSelect')).to_have_value(model,timeout=30000)
    selected=page.locator('#forgeVariant')
    expect(selected.locator('option')).to_have_count(3,timeout=20000)
    expect(page.locator('#j311-rename')).to_be_disabled()
    selected.select_option('Night Harbor')
    expect(page.locator('#j311-rename')).to_be_enabled()
    expect(page.locator('#j311-new-name')).to_have_value('Night Harbor')
    page.locator('#j311-new-name').fill('Harbor Night II')
    page.locator('#j311-rename').click()
    expect(page.locator('#builderStatus')).to_contain_text('Renamed Night Harbor to Harbor Night II')
    edited=page.evaluate("key=>JSON.parse(localStorage.getItem(key))",forge_key)
    assert edited['variants'][model][0]['name']=='Harbor Night II'
    assert edited['variants'][model][0]['paint']=='#abc123'
    assert edited['variants'][model][0]['note']=='Protected night notes'
    assert edited['builds']==v['builds']
    assert edited['variants'][other]==v['variants'][other]
    assert all(page.evaluate("k=>localStorage.getItem(k)",k)==seed[k] for k in (G,O,VI if forge_key==V else V))
    # A concurrently modified selected version is NOT silently replaced.
    page.evaluate("""([key,model])=>{const x=JSON.parse(localStorage.getItem(key));
       x.variants[model][0].note='Newer tab has changed this!';
       localStorage.setItem(key,JSON.stringify(x))}""",[forge_key,model])
    newer=page.evaluate("key=>localStorage.getItem(key)",forge_key)
    page.locator('#j311-new-name').fill('Should be refused')
    page.locator('#j311-rename').click()
    expect(page.locator('#builderStatus')).to_contain_text('Another tab changed')
    assert page.evaluate("key=>localStorage.getItem(key)",forge_key)==newer
    page.reload(wait_until='domcontentloaded')
    expect(page.locator('#forgeVariant option')).to_have_count(3,timeout=25000)
    page.locator('#forgeVariant').select_option('Morning Run')
    page.once('dialog',lambda dialog:dialog.dismiss())
    page.locator('#j311-delete').click()
    expect(page.locator('#forgeVariant')).to_have_value('Morning Run')
    before=page.evaluate("key=>localStorage.getItem(key)",forge_key)
    page.once('dialog',lambda dialog:dialog.accept())
    page.locator('#j311-delete').click()
    expect(page.locator('#builderStatus')).to_contain_text('Deleted only the selected named build')
    result=page.evaluate("key=>JSON.parse(localStorage.getItem(key))",forge_key)
    assert [x['name'] for x in result['variants'][model]]==['Harbor Night II']
    assert result['variants'][other]==v['variants'][other]
    assert result['builds']==v['builds']
    assert page.evaluate("key=>localStorage.getItem(key)",forge_key)!=before
    if width==390:
     page.screenshot(path=str(out/f'atlas311-forge-{world}-phone.png'),full_page=False)
    # Never replace malformed existing bytes, including primary idea saves.
    page.locator('#forgeVariant').select_option('Harbor Night II')
    page.evaluate("key=>localStorage.setItem(key,'{corrupted-json')",forge_key)
    page.once('dialog',lambda dialog:dialog.accept())
    page.locator('#j311-delete').click()
    # Confirmed deletion still refuses to overwrite corrupt Forge storage.
    expect(page.locator('#builderStatus')).to_contain_text('Named design NOT changed',timeout=10000)
    page.locator('#saveBuild').click()
    expect(page.locator('#builderStatus')).to_contain_text('Forge storage is unreadable')
    assert page.evaluate("key=>localStorage.getItem(key)",forge_key)=='{corrupted-json'
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(world,width,height,'overflow')
    context.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 31.1 passed: V + VI isolated named edits, multi-tab changes, confirmation, corrupt-storage safety and viewports')
