#!/usr/bin/env python3
"""Atlas 30.3: all 13 game/episode destinations, links, return and mobile usability."""
import json,re
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlsplit,parse_qs
from playwright.sync_api import sync_playwright,expect

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'maps.html').is_file()
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=64
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{server.server_port}/'
IDS=['story','online','vi','cayo','iv','sa','vc','iii','vcs','lcs','ctw','tlad','tbogt']
CLASSIC={'vc','iii','vcs','lcs','ctw','tlad','tbogt'}
assert len(IDS)==13
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width in (390,1440):
   context=browser.new_context(viewport={'width':width,'height':844},
      reduced_motion='reduce',accept_downloads=True)
   context.route('https://**/*',lambda route:route.abort())
   page=context.new_page()
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(BASE+'maps.html',wait_until='domcontentloaded',timeout=45000)
   featured=page.locator('#directoryFeatured a.directory-card')
   additional=page.locator('#directoryAdditional a.directory-card')
   expect(featured).to_have_count(4,timeout=20000)
   expect(additional).to_have_count(9)
   cards=page.locator('a.directory-card')
   expect(cards).to_have_count(13)
   assert page.locator('#worldCount').inner_text()=='13 of 13 destinations'
   hrefs=cards.evaluate_all("a=>a.map(e=>({id:e.dataset.id,href:e.getAttribute('href')}))")
   ids=[p['id'] for p in hrefs]
   assert ids==IDS,(width,ids)
   assert len({p['href'] for p in hrefs})==13
   assert all(p['href'].startswith('./') for p in hrefs)
   assert all('/' not in p['href'][2:].split('?')[0] for p in hrefs)
   for link in hrefs:
    path=urlsplit(link['href'][2:]).path
    assert (PUBLIC/path).is_file(),(link['id'],'missing built world route',path)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),f'Directory overflow at {width}px'
   # Research, then return all: no world should disappear from other worlds.
   page.locator('#worldSearch').fill('leonida')
   expect(cards).to_have_count(1)
   assert cards.first.get_attribute('data-id')=='vi'
   expect(page.locator('#clearWorldSearch')).to_be_visible()
   page.locator('#clearWorldSearch').click()
   expect(page.locator('#clearWorldSearch')).to_be_hidden()
   expect(cards).to_have_count(13)
   assert page.locator('#worldSearch').input_value()==''
   # A normal tap records an allowlisted recent world and supports Back.
   page.locator('a.directory-card[data-id="vc"]').click()
   expect(page).to_have_url(re.compile(r'/map-hub\.html\?game=vc'))
   expect(page.locator('#classicTitle')).to_contain_text('Vice City',timeout=20000)
   page.go_back(wait_until='domcontentloaded')
   expect(page.locator('#directoryFeatured a.directory-card')).to_have_count(4)
   expect(page.locator('#directoryAdditional a.directory-card')).to_have_count(9)
   expect(page.locator('#j212RecentLink')).to_contain_text('GTA Vice City')
   assert page.locator('#j212RecentLink').get_attribute('href')=='./map-hub.html?game=vc'

   for spec in hrefs:
    game=spec['id']
    target=spec['href'][2:]
    page.goto(BASE+target,wait_until='domcontentloaded',timeout=45000)
    assert page.url.startswith(BASE+urlsplit(target).path),game
    if game in ('story','online','vi'):
     expect(page.locator('#atlasCanvas')).to_be_visible(timeout=25000)
     button={'story':'game5','online':'gameOnline','vi':'game6'}[game]
     expect(page.locator('#'+button)).to_have_attribute('aria-pressed','true',timeout=20000)
     assert page.locator('#selectedCard').get_attribute('aria-label')=='Selected map location'
     close_label=page.locator('#closeSelected').get_attribute('aria-label') or ''
     assert 'close' in close_label.lower(),(game,'Map detail must have an accessible Close control',close_label)
    elif game=='cayo':
     assert page.locator('body').get_attribute('data-heist')=='cayo-perico'
     expect(page.locator('#j167-heist-map')).to_be_visible(timeout=25000)
    elif game=='iv':
     expect(page.locator('#ivWorldName')).to_contain_text('Liberty City',timeout=25000)
    elif game=='sa':
     expect(page.locator('#main')).to_be_visible(timeout=20000)
     assert 'San Andreas' in page.title()
    elif game in ('tlad','tbogt'):
     expect(page.locator('#j190-iv-scope')).to_have_value(game)
     expect(page.locator('#visibleCount')).to_have_text('50')
     expect(page.locator('#classicMapShell')).to_be_visible()
     assert page.locator('#classicViewport').count()==0
    elif game in CLASSIC:
     assert page.locator('body').get_attribute('data-page')=='classic'
     assert parse_qs(urlsplit(page.url).query).get('game')==[game]
     expect(page.locator('#classicTitle')).to_be_visible(timeout=20000)
     expect(page.locator('#classicViewport')).to_be_visible(timeout=20000)
     if game=='tlad':expect(page.locator('#classicTitle')).to_contain_text('Lost and Damned')
     if game=='tbogt':expect(page.locator('#classicTitle')).to_contain_text('Ballad')
     assert page.locator('script[src*="atlas98-classic.js"]').count()==1
    else:raise AssertionError('Unknown game '+game)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(game,width,'horizontal overflow')
    assert page.locator('a[href="./maps.html"]').count()>0,(game,width,'Missing return-to-directory link')
   assert not errors,(width,errors[:5])
   print(f'Atlas 30.3: {width}px, 13 world URLs, 4+9 cards, searchable filter, Back + recent-world resume passed')
   context.close()
  browser.close()
finally:
 server.shutdown()
