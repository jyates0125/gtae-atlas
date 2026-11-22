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
   if width==1440:page.route('**/data/atlas-universe-profiles.json*',lambda route:route.abort()) # Prove offline featured search/cast fallback
   page.on('pageerror',lambda ex:errors.append(str(ex)))
   page.goto(base+'atlas-dashboard.html',wait_until='domcontentloaded',timeout=60000)
   expect(page.locator('.j223-world-card')).to_have_count(7,timeout=20000)
   expect(page.locator('.j223-shortcuts a')).to_have_count(13)
   # The 13 tools must be accessible but not overwhelm the initial phone view.
   menu=page.locator('.j223-shortcuts-menu')
   expect(menu).to_have_count(1)
   assert menu.get_attribute('open') is None,'Shortcuts should start collapsed'
   assert not page.locator('.j223-shortcuts a').first.is_visible(),'Collapsed shortcuts must not be visible'
   menu.locator('summary').click()
   expect(page.locator('.j223-shortcuts a').first).to_be_visible()
   assert menu.get_attribute('open') is not None,'Shortcuts did not expand'
   assert page.locator('.j223-shortcuts a').count()==13
   menu.locator('summary').click()
   assert menu.get_attribute('open') is None,'Shortcuts did not collapse'
   # Keyboard-only visitors must be able to reopen the menu and activate
   # each tool without a pointer or hidden/offscreen focus trap.
   menu.locator('summary').focus()
   page.keyboard.press('Enter')
   expect(page.locator('.j223-shortcuts a').first).to_be_visible()
   page.keyboard.press('Tab')
   assert page.evaluate('document.activeElement?.closest(".j223-shortcuts") !== null'),'Tab did not enter opened shortcuts'
   page.keyboard.press('Shift+Tab')
   assert menu.locator('summary').evaluate('(el) => document.activeElement === el'),'Shift+Tab did not return to menu summary'
   page.keyboard.press('Enter')
   assert menu.get_attribute('open') is None,'Keyboard could not collapse shortcuts'
   assert page.locator('.j223-map-actions a[href="./atlas-vi.html?view=rockstar"]').count()>=1,'Missing official VI poster action'
   assert page.locator('.j223-map-actions a[href="./atlas-vi.html"]').count()>=1,'Missing separate interactive VI map action'
   if width==1440:
    # Verify that each of the 13 tools and seven featured world destinations
    # actually returns a built HTML page, without executing unrelated workspaces.
    hrefs=page.locator('.j223-shortcuts a, .j223-world-card').evaluate_all('(links) => links.map(a => a.getAttribute("href"))')
    assert len(hrefs)==20,('Dashboard route count',len(hrefs))
    for href in dict.fromkeys(hrefs+['./atlas-vi.html?view=rockstar']):
     response=page.request.get(base+href.removeprefix('./'),timeout=15000)
     assert response.status==200,('Dashboard destination not served',href,response.status)
     assert '<html' in response.text().lower()[:3000],('Dashboard destination is not HTML',href)
    print('PASS dashboard route smoke: 13 tools, 7 worlds and official VI map',flush=True)
   expect(page.locator('.j223-feature-panel')).to_have_count(4)
   expect(page.locator('#j223-hero-brief')).to_have_count(0) # correct aside is a class, not duplicate ID
   assert page.locator('.j223-hero-brief .j223-brief-button').get_attribute('href')=='./atlas-vi.html'
   assert page.locator('.j223-world-card.j223-world-vi').get_attribute('href')=='./atlas-vi.html'
   page.locator('#j223-search-input').fill('Lucia')
   suggestion=page.locator('#j223-search-results a').filter(has_text='Lucia Caminos').first
   expect(suggestion).to_be_visible(timeout=25000)
   assert 'game=vi' in suggestion.get_attribute('href')
   assert 'profile=character%3Alucia' in suggestion.get_attribute('href'),'Home search should open the selected profile directly'
   page.locator('#j223-search-input').fill('Trevor')
   suggestion=page.locator('#j223-search-results a').filter(has_text='Trevor Philips').first
   expect(suggestion).to_be_visible(timeout=15000)
   assert 'game=story' in suggestion.get_attribute('href')
   # Compact and punctuation-normalized profile links are real homepage results.
   page.locator('#j223-search-input').fill('CJ')
   cj=page.locator('#j223-search-results a[href*="profile=character%3Acj"]').filter(has_text='Carl Johnson')
   expect(cj).to_have_count(1,timeout=15000)
   assert 'edition=GTA%20San%20Andreas' in cj.get_attribute('href')
   assert 'profile=character%3Acj' in cj.get_attribute('href')
   page.locator('#j223-search-input').fill('Dre Quan Priest')
   dre=page.locator('#j223-search-results a').filter(has_text="Dre'Quan Priest")
   expect(dre).to_have_count(1,timeout=15000)
   assert '%27' in dre.get_attribute('href') and 'profile=character%3Adre-quan-priest' in dre.get_attribute('href')
   page.locator('#j223-search-input').fill('online')
   suggest=page.locator('#j223-search-results a')
   expect(suggest.first).to_be_visible(timeout=15000)
   assert any('online' in a.get_attribute('href').lower() for a in suggest.all())
   page.keyboard.press('Escape')
   assert page.locator('#j223-search-results').is_hidden()
   concepts=page.locator('#j223-cast-rail img[data-art="concept"]')
   expect(concepts).to_have_count(5,timeout=15000)
   for img in concepts.all():
    img.scroll_into_view_if_needed()
    img.evaluate("el => el.decode()")
    assert img.evaluate("el => el.naturalWidth > 0")
   expect(page.locator('#j223-cast-rail .j223-cast-credit')).to_have_text(['Fan concept']*5)
   for key,choice in (('official','official'),('community','community'),('unverified','unverified')):
    card=page.locator('.j223-evidence-card[data-j223-evidence="%s"]'%key)
    card.locator('button[data-j223-grade="%s"]'%choice).click()
    assert card.locator('.j223-evidence-feedback').get_attribute('class').find('j223-correct')>=0
   assert not errors,errors
   if width<=390:
    overflow=page.evaluate('document.documentElement.scrollWidth-innerWidth')
    if overflow>1:
     offenders=page.evaluate("""() => [...document.querySelectorAll('body *')].map(el=>({tag:el.tagName,cls:String(el.className).slice(0,90),width:Math.round(el.getBoundingClientRect().width),right:Math.round(el.getBoundingClientRect().right)})).filter(x=>x.right>innerWidth+2&&x.width>0).sort((a,b)=>b.right-a.right).slice(0,12)""")
     print('OVERFLOW DIAGNOSTICS',width,offenders,flush=True)
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
