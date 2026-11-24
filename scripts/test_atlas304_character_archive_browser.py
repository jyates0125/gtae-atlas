#!/usr/bin/env python3
"""Atlas 30.4 — character coverage and mobile-safe next/previous browser acceptance."""
import json
from pathlib import Path
from threading import Thread
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect

root=Path(__file__).resolve().parents[1]
public=root/'public'
assert (public/'atlas-characters.html').is_file(),'Run Cloudflare static build first'
roster=[r for r in json.loads((public/'data/atlas-universe-profiles.json').read_text(encoding='utf-8'))['records'] if r.get('kind')=='character']
concept=lambda r:r.get('preferConceptPortrait') is True and isinstance(r.get('conceptPortrait'),str) and r['conceptPortrait'].startswith('art/')
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=64
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(public)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/atlas-characters.html'
out=root/'qa-evidence'/'chromium'
out.mkdir(parents=True,exist_ok=True)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width,height in [(375,667),(390,844),(844,390),(1440,900)]:
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   page=context.new_page()
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.route('https://**/*',lambda route:route.abort())
   page.goto(url,wait_until='domcontentloaded')
   cards=page.locator('#j222-character-grid .j222-character-card')
   expect(cards).to_have_count(40,timeout=20000)
   expect(page.locator('#j304-portrait-metrics')).to_contain_text('15 listed local concepts')
   page.locator('[data-j304-art="concept"]').click()
   expect(cards).to_have_count(15)
   assert page.evaluate("new URL(location.href).searchParams.get('art')")=='concept'
   page.locator('[data-j222-scope="classic"]').click()
   expect(cards).to_have_count(len([r for r in roster if r['scope']=='classic' and concept(r)]))
   page.locator('[data-j304-art="reference"]').click()
   expect(cards).to_have_count(len([r for r in roster if r['scope']=='classic' and not concept(r)]))
   page.locator('#j222-reset').click()
   expect(cards).to_have_count(40)
   assert not page.evaluate("new URL(location.href).searchParams.has('art')")
   page.locator('#j222-character-search').fill('Lamar')
   expect(cards).to_have_count(2)
   assert {x.get_attribute('data-j222-world') for x in cards.all()}=={'online','story'}
   before_history=page.evaluate('history.length')
   cards.first.get_by_role('link',name='View profile').click()
   dialog=page.locator('#j222-profile-dialog')
   expect(dialog).to_be_visible()
   first=page.evaluate("new URL(location.href).searchParams.get('profile')")
   expect(dialog.locator('.j304-profile-position')).to_contain_text('of 2 appearances')
   dialog.get_by_role('button',name='Next character').click()
   second=page.evaluate("new URL(location.href).searchParams.get('profile')")
   assert first!=second,(width,height,first,second)
   assert page.evaluate('history.length')==before_history+1,'Profile next created extra history entry'
   expect(dialog.locator('.j304-profile-position')).to_contain_text('of 2 appearances')
   dialog.get_by_role('button',name='Previous character').click()
   assert page.evaluate("new URL(location.href).searchParams.get('profile')")==first
   if height<=540:
    bounds=dialog.bounding_box()
    assert bounds and bounds['y']>=-2 and bounds['y']+bounds['height']<=height+2,(width,height,bounds)
   if width in (390,844):
    page.screenshot(path=str(out/f'atlas304-characters-{width}x{height}.png'),full_page=False)
   dialog.get_by_role('button',name='Close character profile').click()
   expect(dialog).to_be_hidden()
   page.wait_for_function("() => !new URL(location.href).searchParams.has('profile')")
   expect(cards).to_have_count(2)
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),(width,height,'horizontal overflow')
   page.goto(url+'?game=online&art=reference&profile=character%3Alamar-story',wait_until='domcontentloaded')
   expect(dialog).to_be_visible(timeout=15000)
   expect(page.locator('[data-j222-scope="story"]')).to_have_attribute('aria-pressed','true')
   expect(page.locator('[data-j304-art="all"]')).to_have_attribute('aria-pressed','true')
   assert page.evaluate("new URL(location.href).searchParams.get('profile')")=='character:lamar-story'
   assert not errors,(width,height,errors)
   context.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 30.4 passed: 4 viewports, filtered concept/reference roster, modal browsing/Back, honest profile scopes')
