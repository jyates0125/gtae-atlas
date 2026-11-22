#!/usr/bin/env python3
"""Atlas 22.2 — serve the Cloudflare build and exercise real desktop/phone character UI."""
import os,threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1]
P=R/'public'
assert (P/'atlas222-characters.js').is_file() and (P/'data/atlas222-vi-release-index.json').is_file()
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
s=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(P)))
threading.Thread(target=s.serve_forever,daemon=True).start()
base='http://127.0.0.1:%d/'%s.server_port
engine=os.environ.get('ATLAS_BROWSER','chromium')
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,**({'channel':'msedge'} if engine=='msedge' else {}))
  for width,height in ((1440,900),(390,844),(375,812)):
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   page=context.new_page()
   issues=[]
   page.on('pageerror',lambda ex:issues.append(str(ex)))
   page.goto(base+'atlas-characters.html?game=all',wait_until='domcontentloaded',timeout=60000)
   cards=page.locator('#j222-character-grid .j222-character-card')
   expect(cards.first).to_be_visible(timeout=25000)
   assert cards.count()>=30,('All must show the full world roster',cards.count())
   assert page.locator('#j222-character-count').inner_text().startswith(str(cards.count()))
   assert page.locator('img[src*="atlas152-era"]').count()==0,'Obsolete generic portraits exposed'
   page.locator('#j222-character-search').fill('Lucia')
   expect(cards).to_have_count(1,timeout=10000)
   assert 'q=Lucia' in page.url,'Gallery search should create a shareable URL'
   assert 'Lucia Caminos' in cards.first.locator('h3').inner_text()
   cards.first.locator('a.j222-primary').click()
   modal=page.locator('#j222-profile-dialog')
   expect(modal).to_be_visible()
   expect(modal.locator('.j222-profile-media img')).to_have_count(1)
   expect(modal.locator('dt').filter(has_text='Source confidence')).to_have_count(1)
   expect(modal.locator('a').filter(has_text='View original source')).to_have_count(1)
   assert 'profile=character%3Alucia' in page.url,'Opened character must have a shareable profile ID'
   page.keyboard.press('Escape')
   expect(modal).to_be_hidden()
   page.wait_for_function("!new URL(location.href).searchParams.has('profile')",timeout=5000)
   assert 'profile=' not in page.url,'Close must clear selected profile from the URL'
   assert 'atlas-vi.html' in cards.first.locator('.j222-card-actions a').nth(1).get_attribute('href')
   # Shared characters have distinct verified Story/Online records, not a merged world.
   page.locator('#j222-character-search').fill('Lamar')
   expect(cards).to_have_count(2,timeout=10000)
   assert {c.get_attribute('data-j222-world') for c in cards.all()}=={'story','online'}
   page.locator('[data-j222-scope="story"]').click()
   expect(cards).to_have_count(1,timeout=10000)
   cards.first.locator('.j222-primary').click()
   expect(page.locator('#j222-profile-dialog .j225-character-appearances a')).to_have_count(1)
   assert 'game=online' in page.locator('#j222-profile-dialog .j225-character-appearances a').get_attribute('href')
   page.keyboard.press('Escape')
   expect(page.locator('#j222-profile-dialog')).to_be_hidden()
   page.locator('#j222-reset').click()
   assert cards.count()>=30,'Reset must restore all records'
   page.locator('[data-j222-scope="vi"]').click()
   expect(cards).to_have_count(8,timeout=10000)
   assert 'game=vi' in page.url,'World filters must be deep-linkable'
   assert cards.first.get_attribute('data-j222-world')=='vi'
   page.locator('[data-j222-scope="online"]').click()
   expect(cards).to_have_count(8,timeout=10000)
   assert all(card.get_attribute('data-j222-world')=='online' for card in cards.all())
   page.locator('[data-j222-scope="story"]').click()
   expect(cards).to_have_count(10,timeout=10000)
   assert all(card.get_attribute('data-j222-world')=='story' for card in cards.all())
   page.locator('[data-j222-scope="classic"]').click()
   selector=page.locator('.j226-edition-select')
   expect(selector).to_be_visible()
   selector.select_option('GTA III')
   expect(cards).not_to_have_count(0)
   assert all('game=iii' in c.locator('.j222-card-actions a').nth(1).get_attribute('href') for c in cards.all())
   assert 'edition=GTA+III' in page.url
   page.reload(wait_until='domcontentloaded')
   expect(selector).to_have_value('GTA III')
   expect(cards.first).to_be_visible()
   page.locator('#j222-reset').click()
   expect(selector).to_be_hidden()
   assert 'edition=' not in page.url
   page.locator('[data-j222-scope="all"]').click()
   page.locator('#j132-nav-toggle').click()
   page.locator('#j132-search').fill('Jason')
   hit=page.locator('#j132-groups a').filter(has_text='Jason Duval')
   expect(hit.first).to_be_visible(timeout=15000)
   assert 'game=vi' in hit.first.get_attribute('href')
   page.locator('.j132-close').click()
   if width<=390:
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Character page horizontal overflow'
   out=R/'qa-evidence'/engine
   out.mkdir(parents=True,exist_ok=True)
   page.screenshot(path=str(out/('atlas222-characters-'+str(width)+'.png')),full_page=False,animations='disabled',timeout=20000)
   page.goto(base+'atlas-characters.html?game=vi&q=Jason&profile=character%3Ajason#mainCharacterEra',wait_until='domcontentloaded',timeout=60000)
   expect(page.locator('#j222-character-grid .j222-character-card')).to_have_count(1,timeout=15000)
   assert 'Jason' in page.locator('#j222-character-grid h3').inner_text()
   expect(page.locator('#j222-profile-dialog')).to_be_visible(timeout=15000)
   assert page.locator('#j222-profile-dialog h2').inner_text()=='Jason Duval'
   modal=page.locator('#j222-profile-dialog')
   modal.evaluate("(el) => { el.scrollTop=el.scrollHeight; }")
   close=modal.locator('.u-close')
   expect(close).to_be_in_viewport()
   close.click()
   expect(page.locator('#j222-profile-dialog')).to_be_hidden()
   page.wait_for_function("!new URL(location.href).searchParams.has('profile')",timeout=5000)
   assert 'profile=' not in page.url,'Closing a shared character must leave the gallery usable'
   page.goto(base+'atlas-vi.html',wait_until='domcontentloaded',timeout=60000)
   hub=page.locator('#j217-vi-hub')
   hub.locator('summary').first.click(timeout=15000)
   directory=page.locator('#j222-vi-release')
   directory.locator('summary').first.click(timeout=15000)
   cards6=page.locator('#j222-vi-categories .j222-launch-card')
   expect(cards6).to_have_count(11,timeout=15000)
   assert page.locator('#j222-vi-categories a').filter(has_text='Open in Atlas').count()==11,'Every category must have a real Atlas link'
   expect(page.locator('#j222-vi-regions a')).to_have_count(6)
   assert page.locator('a[href="./atlas-characters.html?game=vi#mainCharacterEra"]').count()>=1
   assert not issues,('page Javascript exceptions',issues)
   if width<=390:
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'VI page horizontal overflow'
   print('PASS Atlas 22.2 %s %s: All characters, 8 Rockstar VI profiles, world isolation, global search and 11-category launch hub'%(engine,width),flush=True)
   context.close()
  browser.close()
finally:s.shutdown()
