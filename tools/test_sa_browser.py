from pathlib import Path
from playwright.sync_api import sync_playwright
import subprocess, time, json
root=Path(__file__).resolve().parent.parent/'runtime'
server=subprocess.Popen(['python','-m','http.server','8787','--directory',str(root)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 time.sleep(.4)
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1365,'height':850})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('http://127.0.0.1:8787/atlas-sa.html',wait_until='domcontentloaded')
  assert page.locator('.cat').count()==5
  assert '100' in page.locator('#countLabel').inner_text()
  page.locator('.item input[type=checkbox]').first.check()
  assert page.locator('#collected').inner_text()=='1'
  page.reload();assert page.locator('.item input[type=checkbox]').first.is_checked()
  page.locator('#hideComplete').check();assert page.locator('.item').count()==99
  page.locator('#hideComplete').uncheck()
  page.locator('.cat').nth(1).click();assert 'Snapshots' in page.locator('#setTitle').inner_text()
  assert page.locator('.item').count()==50
  page.locator('#search').fill('33');assert page.locator('.item').count()==1
  page.locator('#search').fill('');
  page.screenshot(path='/mnt/data/Team_Jura_Atlas_85_Designed_Brand/docs/san-andreas-desktop-tested.png',full_page=False)
  mobile=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  mobile.goto('http://127.0.0.1:8787/atlas-sa.html',wait_until='domcontentloaded')
  assert mobile.locator('.cat').count()==5
  mobile.screenshot(path='/mnt/data/Team_Jura_Atlas_85_Designed_Brand/docs/san-andreas-mobile-tested.png',full_page=False)
  print(json.dumps({'browser':'Chromium','desktop':'passed','mobile':'passed','persistent_progress':'passed','filters':'passed','search':'passed','js_errors':errors}))
  assert not errors,errors
  browser.close()
finally:server.terminate();server.wait()
