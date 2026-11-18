#!/usr/bin/env python3
"""Site navigation and install smoke checks, browser DOM tests."""
from pathlib import Path
import tempfile,subprocess,shutil,json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
results={}
for file in ['atlas89-shell.js','atlas86-ui.js','atlas87-daily.js','atlas88-events.js']:
 p=subprocess.run(['node','--check',str(root/file)],capture_output=True,text=True)
 results[f'syntax_{file}']=p.returncode==0
 assert p.returncode==0,p.stderr
with tempfile.TemporaryDirectory() as td:
 d=Path(td);(d/'tools').mkdir()
 for i in range(21): (d/f'page{i}.html').write_text('<!doctype html><html><head></head><body><header>Header</header><main>Main page</main></body></html>')
 shutil.copy(root/'tools/apply_atlas89.py',d/'tools/apply_atlas89.py')
 for _ in range(2):
  p=subprocess.run(['python',str(d/'tools/apply_atlas89.py')],capture_output=True,text=True)
  assert p.returncode==0,p.stderr
 results['21_pages_integrated']=all((d/f'page{i}.html').read_text().count('atlas89-shell.js?v=89')==1 for i in range(21))
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in [390,1366]:
  page=browser.new_page(viewport={'width':width,'height':800})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content('<!doctype html><html><head></head><body><header><nav>Legacy navigation</nav></header><main>Original content</main></body></html>')
  page.add_style_tag(content=(root/'atlas89-shell.css').read_text())
  page.add_script_tag(content=(root/'atlas89-shell.js').read_text())
  results[f'home_visible_{width}']=page.locator('#j89-shell .j89-home').is_visible()
  results[f'original_content_preserved_{width}']=page.get_by_text('Original content').is_visible()
  page.locator('#j89-shell .j89-open').click()
  results[f'menu_opens_{width}']=page.locator('#j89-menu').is_visible() and page.locator('#j89-menu a').count()==6
  page.keyboard.press('Escape')
  results[f'escape_closes_{width}']=not page.locator('#j89-menu').is_visible()
  results[f'no_browser_errors_{width}']=not errors
  page.close()
 browser.close()
assert all(results.values()),results
(root/'docs/QA-ATLAS89-RESULTS.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
