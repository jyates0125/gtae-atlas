#!/usr/bin/env python3
"""Atlas 31.0 scoped browser checks: filtering, CSV, URL and missing-data failure."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
public=root/'public'
assert (public/'atlas-coverage.html').is_file(),'Build Cloudflare static output first'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=80
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(public)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/atlas-coverage.html'
out=root/'qa-evidence/chromium';out.mkdir(parents=True,exist_ok=True)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width,height in [(375,667),(390,844),(844,390),(1440,900)]:
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce',accept_downloads=True)
   context.route('https://**/*',lambda route:route.abort())
   page=context.new_page()
   page.goto(url+'?evidenceWorld=sa&evidenceKind=coordinate',wait_until='domcontentloaded',timeout=45000)
   expect(page.locator('#j310-status')).to_contain_text('Showing 5 of 54',timeout=25000)
   expect(page.locator('#j310-rows tr')).to_have_count(5)
   expect(page.locator('#j310-world')).to_have_value('sa')
   expect(page.locator('#j310-kind')).to_have_value('coordinate')
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(width,height,'horizontal overflow')
   assert page.locator('.j310-scroll').evaluate('e=>e.scrollWidth>=e.clientWidth')
   if width in (390,1440):
    page.screenshot(path=str(out/f'atlas310-coverage-{width}.png'),full_page=False)
   page.locator('#j310-world').select_option('iii')
   page.locator('#j310-kind').select_option('all')
   expect(page.locator('#j310-rows tr')).to_have_count(3)
   ramp=page.locator('#j310-rows tr').filter(has=page.locator('th span',has_text='Rampages'))
   expect(ramp).to_have_count(1)
   assert ramp.locator('td').nth(0).inner_text()=='40'
   assert ramp.locator('td').nth(2).inner_text()=='20'
   page.locator('#j310-world').select_option('online')
   expect(page.locator('#j310-rows tr')).to_have_count(9)
   assert page.locator('#j310-rows tr').first.locator('td').nth(0).inner_text()=='—'
   page.locator('#j310-world').select_option('ctw')
   expect(page.locator('#j310-rows tr')).to_have_count(1)
   expect(page.locator('#j310-rows')).to_contain_text('No calibrated source pack')
   page.locator('#j310-world').select_option('vi')
   expect(page.locator('#j310-rows')).to_contain_text('3,754')
   expect(page.locator('#j310-rows')).to_contain_text('3,663')
   expect(page.locator('#j310-rows')).to_contain_text('Unverified GTA VI')
   page.locator('#j310-world').select_option('sa')
   page.locator('#j310-kind').select_option('all')
   with page.expect_download(timeout=15000) as download:
    page.locator('#j310-export').click()
   saved=download.value
   assert 'coverage-sa.csv' in saved.suggested_filename
   csv=Path(saved.path()).read_text(encoding='utf-8')
   assert csv.count('\n')==6,(width,height,'CSV should have header + 5 rows')
   assert 'Airborne trigger centers' in csv
   page.locator('#j310-search').fill('tags')
   expect(page.locator('#j310-rows tr')).to_have_count(1)
   assert page.evaluate("new URL(location.href).searchParams.get('evidenceSearch')")=='tags'
   page.locator('#j310-reset').click()
   expect(page.locator('#j310-rows tr')).to_have_count(54)
   expect(page.locator('#j310-world')).to_have_value('all')
   assert not page.evaluate("new URL(location.href).searchParams.has('evidenceWorld')")
   failed=context.new_page()
   failed.route('**/data/atlas310-coverage-matrix.json',lambda route:route.abort())
   failed.goto(url,wait_until='domcontentloaded')
   expect(failed.locator('#j310-status')).to_contain_text('Source inventory unavailable',timeout=15000)
   expect(failed.locator('#j310-export')).to_be_disabled()
   expect(failed.locator('#j310-rows tr')).to_have_count(1)
   context.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 31.0 browser: 13-world matrix, safe CSV, query/reset and fail-closed in 4 viewports')
