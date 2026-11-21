#!/usr/bin/env python3
"""GTAE 22.3 browser QA: real desktop/phone navigation, search and mobile overflow."""
import os,threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];P=R/'public'
assert (P/'atlas-dashboard.html').is_file()
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(P)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base='http://127.0.0.1:%d/'%server.server_port
engine=os.environ.get('ATLAS_BROWSER','chromium')
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,**({'channel':'msedge'} if engine=='msedge' else {}))
  for width,height in ((1440,900),(390,844),(375,812)):
   ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   page=ctx.new_page();errors=[]
   page.on('pageerror',lambda ex:errors.append(str(ex)))
   page.goto(base+'atlas-dashboard.html',wait_until='domcontentloaded',timeout=60000)
   expect(page.locator('.j223-world-card')).to_have_count(7,timeout=20000)
   expect(page.locator('.j223-shortcuts a')).to_have_count(13)
   expect(page.locator('.j223-feature-panel')).to_have_count(4)
   expect(page.locator('#j223-hero-brief')).to_have_count(0) # correct aside is a class, not duplicate ID
   assert page.locator('.j223-hero-brief .j223-brief-button').get_attribute('href')=='./atlas-vi.html'
   assert page.locator('.j223-world-card.j223-world-vi').get_attribute('href')=='./atlas-vi.html'
   page.locator('#j223-search-input').fill('Lucia')
   suggestion=page.locator('#j223-search-results a').filter(has_text='Lucia Caminos').first
   expect(suggestion).to_be_visible(timeout=25000)
   assert 'game=vi' in suggestion.get_attribute('href')
   page.locator('#j223-search-input').fill('Trevor')
   suggestion=page.locator('#j223-search-results a').filter(has_text='Trevor Philips').first
   expect(suggestion).to_be_visible(timeout=15000)
   assert 'game=story' in suggestion.get_attribute('href')
   page.locator('#j223-search-input').fill('online')
   suggest=page.locator('#j223-search-results a')
   expect(suggest.first).to_be_visible(timeout=15000)
   assert any('online' in a.get_attribute('href').lower() for a in suggest.all())
   page.keyboard.press('Escape')
   assert page.locator('#j223-search-results').is_hidden()
   assert not errors,errors
   if width<=390:
    overflow=page.evaluate('document.documentElement.scrollWidth-innerWidth')
    assert overflow<=1,('Dashboard horizontal overflow',width,overflow)
    assert page.locator('.menu-toggle').is_visible()
    page.locator('.menu-toggle').click()
    assert page.locator('#primaryNav').get_attribute('data-open')=='true'
    page.locator('.menu-toggle').click()
    assert page.locator('#primaryNav').get_attribute('data-open')=='false'
   out=R/'qa-evidence'/engine;out.mkdir(parents=True,exist_ok=True)
   page.screenshot(path=str(out/('atlas223-home-'+str(width)+'.png')),full_page=False,animations='disabled',timeout=20000)
   print('PASS GTAE 22.3 '+engine+' '+str(width)+': seven worlds, thirteen shortcuts, searchable characters, source links and no overflow',flush=True)
   ctx.close()
  browser.close()
finally:
 server.shutdown()
