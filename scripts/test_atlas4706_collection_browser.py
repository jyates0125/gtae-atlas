import os,threading,json
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
records=json.loads((ROOT/'data/atlas192-vi-weapons.json').read_text(encoding='utf-8'))['records']
ids={r['id'] for r in records}; variants={r['id'] for r in records if r.get('variantOf')}
assert len(records)==185 and len(ids)==185 and len(variants)==114
assert all(r['variantOf'] in ids and r['variantOf'] not in variants for r in records if r.get('variantOf'))
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
with ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'public'))) as server:
 threading.Thread(target=server.serve_forever,daemon=True).start()
 base=f'http://127.0.0.1:{server.server_port}/'
 with sync_playwright() as pw:
  browser=pw.chromium.launch(**({'channel':'msedge'} if os.getenv('ATLAS_BROWSER')=='msedge' else {}))
  for width in (390,1440):
   context=browser.new_context(viewport={'width':width,'height':844})
   context.route('https://**/*',lambda r:r.abort())
   page=context.new_page()
   page.goto(base+'atlas90-weapons6.html')
   expect(page.locator('.viweapon-card')).to_have_count(len(records),timeout=15000)
   expect(page.locator('#viWeaponBenchmark')).to_contain_text('196 items')
   page.locator('#viWeaponVariant').select_option('variants')
   expect(page.locator('.viweapon-card')).to_have_count(len(variants))
   expect(page.locator('[data-weapon-id="gutterball-moreland-850"]')).to_contain_text('Named variant')
   page.locator('#viWeaponVariant').select_option('base')
   expect(page.locator('.viweapon-card')).to_have_count(len(records)-len(variants))
   page.locator('#viWeaponClear').click()
   expect(page.locator('.viweapon-card')).to_have_count(len(records))
   card=page.locator('[data-weapon-id="girardi-es9"]')
   expect(card).to_have_attribute('data-collected','false',timeout=15000)
   expect(card.locator('.viweapon-media figcaption')).to_contain_text('not the stock model')
   card.locator('.viweapon-media').scroll_into_view_if_needed()
   expect(card.locator('.viweapon-image-unavailable')).to_be_visible(timeout=15000)
   expect(page.locator('[data-weapon-id="duke-556"] .viweapon-image-unavailable')).to_contain_text('not yet verified')
   assert page.locator('#viWeaponCards img').evaluate_all("els=>els.every(e=>e.src.startsWith('https://www.rockstargames.com/VI/_next/static/media/ULTIMATE_EDITION_'))")
   card.locator('.viweapon-note').click()
   expect(card).to_have_attribute('data-collected','false')
   card.locator('.viweapon-collect').click()
   expect(card).to_have_attribute('data-collected','true')
   expect(page.locator('#viWeaponCollected')).to_have_text('1 collected')
   page.reload()
   expect(card).to_have_attribute('data-collected','true',timeout=15000)
   expect(card.locator('.viweapon-note')).to_have_attribute('aria-pressed','true')
   page.locator('#viWeaponOnlyCollected').check()
   expect(page.locator('.viweapon-card')).to_have_count(1)
   card.locator('.viweapon-collect').click()
   expect(page.locator('.viweapon-card')).to_have_count(0)
   page.locator('#viWeaponClear').click()
   expect(page.locator('[data-weapon-id="cold-war-556"]')).to_have_count(1)
   assert page.evaluate("localStorage.getItem('team-jura-atlas90-collection-v1')") is None
   page.goto(base+'atlas90-vehicles6.html?q=squalo')
   v=page.locator('#j90Cards .j90-card')
   expect(v).to_have_count(1,timeout=15000)
   expect(v).to_have_attribute('data-collected','false')
   v.locator('.j90-collect-toggle').click()
   expect(v).to_have_attribute('data-collected','true')
   page.reload()
   expect(v).to_have_attribute('data-collected','true',timeout=15000)
   page.goto(base+'atlas90-vehicles5.html?world=online&q=squalo')
   expect(v).to_have_count(1,timeout=15000)
   expect(v).to_have_attribute('data-collected','false')
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
   context.close()
  browser.close()
print('PASS collection states, independent review, reload, world isolation')
