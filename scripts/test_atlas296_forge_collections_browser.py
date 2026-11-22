#!/usr/bin/env python3
"""Atlas 29.6 browser: read-only Forge hub includes saved unowned Garage designs."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

root=Path(__file__).resolve().parents[1]
public=root/'public'
assert (public/'atlas-forge-collections.html').exists(), 'Build Cloudflare site first'
evidence=root/'qa-evidence'/'chromium'
evidence.mkdir(parents=True,exist_ok=True)

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*_args):pass

server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(public)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'

keys=[
 'team-jura-atlas93-garage-v1',
 'team-jura-atlas90-collection-v1',
 'team-jura-atlas101-concept-presets-v1',
 'team-jura-forge-vi-concept-presets-v1'
]
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
        page=context.new_page()
        page.goto(base+'/atlas-dashboard.html',wait_until='domcontentloaded')
        page.evaluate("""keys => {
          localStorage.setItem(keys[0],JSON.stringify({schema:1,garages:['Main Garage','Marina'],
            vehicles:{adder:{studioName:'Night Run',garage:'Main Garage',note:'Private note'},
              jetmax:{note:'My unowned boat concept',paint:'#37abef'},
              bati:{paint:'Graphite',secondary:'Midnight'}}}));
          localStorage.setItem(keys[1],JSON.stringify({schema:1,
            owned:{'vehicles5:adder':true},wishlist:{'vehicles5:jetmax':true},note:{private:'keep'}}));
          localStorage.setItem(keys[2],JSON.stringify({schema:1,
            builds:{sultan:{model:'sultan',paint:'#ffaa22',name:'Studio V',body:'auto',note:''}},variants:{}}));
          localStorage.setItem(keys[3],JSON.stringify({schema:1,
            builds:{vi_squalo:{model:'vi_squalo',paint:'#0099cc',name:'Leonida Boat',body:'auto',note:''}},variants:{}}));
        }""",keys)
        initial=page.evaluate("keys => keys.map(k => localStorage.getItem(k))",keys)
        page.goto(base+'/atlas-forge-collections.html',wait_until='domcontentloaded')
        cards=page.locator('#forgeCollectionRows .fc-entry')
        expect(cards).to_have_count(4,timeout=20000)
        expect(page.locator('#forgeCollectionCount')).to_contain_text('4 of 4')
        for width in (390,1440):
            page.set_viewport_size({'width':width,'height':844})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'), f'Forge collection overflow at {width}px'
            page.screenshot(path=str(evidence/f'atlas296-forge-collections-{width}.png'),full_page=True)
        page.set_viewport_size({'width':390,'height':844})
        page.locator('#forgeCollectionKind').select_option('garage')
        expect(cards).to_have_count(2)
        # Entries are sorted by their saved sources, not by ownership.
        # Verify the concrete unowned saved vehicle rather than assuming order.
        page.locator('#forgeCollectionSearch').fill('Jetmax')
        expect(cards).to_have_count(1)
        row=cards.first
        expect(row).to_contain_text('Saved Garage build')
        expect(row).to_contain_text('not marked owned')
        assert 'My unowned boat concept' not in row.inner_text(), 'Private note should not leak into summary'
        assert row.locator('a').get_attribute('href')=='./atlas93-garage.html?addModel=jetmax'
        assert page.evaluate("keys => keys.map(k => localStorage.getItem(k))",keys)==initial, (
            'Browsing, filtering and searching private hub must not rewrite any saved record')
        row.locator('a').click()
        expect(page).to_have_url(base+'/atlas93-garage.html?addModel=jetmax')
        expect(page.locator('#garageDetails h2').filter(has_text='Jetmax')).to_be_visible(timeout=30000)
        assert page.evaluate("keys => keys.map(k => localStorage.getItem(k))",keys)==initial, (
            'Following a saved unowned Garage link must not claim ownership or mutate the collection')
        context.close()
        browser.close()
finally:
    server.shutdown()
print('Atlas 29.6 private saved Garage collection phone/desktop browser proof passed')
