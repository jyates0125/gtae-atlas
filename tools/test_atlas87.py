from pathlib import Path
import tempfile, subprocess, shutil, json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
results={}
for fname in ('atlas87-all-maps.js','atlas87-daily.js'):
 p=subprocess.run(['node','--check',str(root/fname)],capture_output=True,text=True)
 assert p.returncode==0,(fname,p.stderr)
results['js_syntax']=True
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1366,'height':900})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content('<html><body><main id="main"></main></body></html>')
 page.add_script_tag(content=(root/'atlas87-all-maps.js').read_text())
 results['map_worlds']=page.locator('.j87-world').count()==13
 page.locator('input[type=search]').fill('San Andreas')
 results['search_filter']=page.locator('.j87-world').count()==1 and 'San Andreas' in page.locator('.j87-world').inner_text()
 page.locator('input[type=search]').fill('')
 page.get_by_role('button',name='Interactive maps').click()
 results['interactive_filter']=page.locator('.j87-world').count()==3
 results['all_maps_no_js_errors']=not errors
 page.set_content('<html><body><div id="j87-daily-list"></div><p id="j87-daily-summary"></p></body></html>')
 page.evaluate('''() => { window.JuraConditions={rulesForMode:()=>[{id:'gun-van',name:'Gun Van',kind:'rotation',reset:6,source:'https://example.org'},{id:'nope',name:'Other',kind:'seasonal'}],safeSnapshot:x=>x}; }''')
 js=(root/'atlas87-daily.js').read_text().replace("path=(location.pathname.split('/').pop()||'').toLowerCase()","path='atlas87-daily.html'")
 page.add_script_tag(content=js)
 results['daily_no_fake_live']=page.locator('.j87-daily-card').count()==1 and 'Not confirmed today' in page.locator('.j87-daily-card').inner_text()
 results['no_js_errors']=not errors
 browser.close()
(root/'docs').mkdir(exist_ok=True)
(root/'docs'/'QA-ATLAS87-RESULTS.json').write_text(json.dumps(results,indent=2))
assert all(results.values()),results
print(json.dumps(results,indent=2))
