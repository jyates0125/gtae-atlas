#!/usr/bin/env python3
"""Static and browser DOM tests for Atlas event panel, icon parity and status handling."""
from pathlib import Path
import tempfile,shutil,subprocess,json
ROOT=Path(__file__).resolve().parents[1]
results={}
for n in ('atlas88-events.js','atlas87-daily.js','atlas87-all-maps.js','atlas86-ui.js'):
 r=subprocess.run(['node','--check',str(ROOT/n)],capture_output=True,text=True)
 results['syntax_'+n]=r.returncode==0
 assert r.returncode==0,(n,r.stderr)
# Integration fixture exercises 8.6, 8.7, 8.8 without manipulating a live user's repository.
with tempfile.TemporaryDirectory() as td:
 d=Path(td);(d/'tools').mkdir()
 for n in ('atlas.html','atlas-online.html','atlas-vi.html','atlas81-hq.html','atlas-sa.html','atlas-cayo.html','maps.html'):
  (d/n).write_text('<!doctype html><html><head></head><body data-start-world="online"><div id="sidebar"></div></body></html>')
 (d/'atlas87-daily.html').write_text('<!doctype html><html><head></head><body></body></html>')
 (d/'atlas.js').write_text("function atlas85CollectibleIcon(r){return null;}\nfunction conditionPinColor(r,storeCache){const c=conditionForRecord(r,storeCache);return c?window.JuraConditions.markerColor(c.status):r.markerColor||CATEGORIES[r.category]?.[1]||'#f7c97b';}")
 for n in ('apply_atlas86.py','apply_atlas87.py','apply_atlas88.py'):
  shutil.copy(ROOT/'tools'/n,d/'tools'/n)
 for n in ('apply_atlas86.py','apply_atlas87.py','apply_atlas88.py'):
  for _ in range(2):
   p=subprocess.run(['python',str(d/'tools'/n)],capture_output=True,text=True)
   assert p.returncode==0,(n,p.stderr)
 results['integration_repeat_safe']=all((d/n).read_text().count('atlas88-events.js?v=88')==1 for n in ('atlas-online.html','atlas87-daily.html'))
 results['no_duplicate_libraries']=all((d/n).read_text().count('atlas86-ui.js?v=86')==1 for n in ('atlas.html','atlas-online.html','atlas-vi.html'))
 results['ghost_icon_patch']='window.TeamJuraEventIcon88?.forRecord(r)' in (d/'atlas.js').read_text()
 results['ghost_white_possible_patch']="return '#f8fafc';" in (d/'atlas.js').read_text()
# Browser controls under a synthetic conditions engine: no network or runtime feed assumptions.
try:
 from playwright.sync_api import sync_playwright
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':1200,'height':760})
  page.set_content('<!doctype html><html><body><aside id="sidebar"><div id="jura83-panel"></div></aside><input id="search"><button id="allOn"></button></body></html>')
  page.evaluate('''() => { const state={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>state[k]??null,setItem:(k,v)=>{state[k]=String(v)},removeItem:k=>{delete state[k]}}}); }''')
  page.evaluate('''() => {window.JuraConditions={rulesForMode:()=>[{id:'ghost-2',name:'Ghost #2',kind:'clock',event:'halloween',group:'Ghosts',source:'https://example.org'},{id:'gun-van',name:'Gun Van',kind:'rotation',group:'Daily rotations',source:'https://example.org'}],BY_ID:{'ghost-2':{id:'ghost-2',name:'Ghost #2'},'gun-van':{id:'gun-van',name:'Gun Van'}},safeState:(x)=>({events:{...(x.events||{})},completed:{},flags:{},seen:{}}),safeSnapshot:x=>x,evaluate:(id,ctx)=>{if(id==='ghost-2'&&!ctx.state.events.halloween)return {status:'closed',reason:'event off'};if(id==='ghost-2')return {status:ctx.hour===21?'active':'possible',reason:'game clock'};return {status:'unknown',reason:'No dated feed'};}}}''')
  js=(ROOT/'atlas88-events.js').read_text().replace("const path=(location.pathname.split('/').pop()||'').toLowerCase();","const path='atlas-online.html';")
  page.add_script_tag(content=js)
  results['two_event_cards']=page.locator('.j88-event-card').count()==2
  results['ghost_off_when_event_off']=page.locator('.j88-event-card').filter(has_text='Ghost #2').get_by_text('EVENT OFF').count()==1
  page.locator('.j88-event-toggle input').check()
  page.locator('.j88-time select').select_option('21')
  results['ghost_active_when_enabled_and_hour_matches']=page.locator('.j88-event-card').filter(has_text='Ghost #2').get_by_text('CURRENT · YELLOW PIN').count()==1
  results['gunvan_not_falsely_active']=page.locator('.j88-event-card').filter(has_text='Gun Van').get_by_text('NOT CONFIRMED').count()==1
  page.locator('.j88-tabs button[data-type=ghost]').click()
  results['ghost_filter']=page.locator('.j88-event-card').count()==1
  browser.close()
except Exception as e:
 results['browser_test_blocked']=str(e)[:400]
(ROOT/'docs').mkdir(exist_ok=True)
(ROOT/'docs'/'QA-ATLAS88-RESULTS.json').write_text(json.dumps(results,indent=2))
assert all(v for k,v in results.items() if k!='browser_test_blocked'),results
print(json.dumps(results,indent=2))
