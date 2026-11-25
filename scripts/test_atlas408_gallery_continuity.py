#!/usr/bin/env python3
"""Gallery filter continuity and honest imagery, with controlled archive responses."""
import base64
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import parse_qs, urlparse
from playwright.sync_api import expect, sync_playwright

PUBLIC=Path(__file__).resolve().parents[1]/'public'
assert (PUBLIC/'atlas90-vehicles5.html').is_file()
STORE='team-jura-atlas90-collection-v1'
# Synthetic one-pixel response tests the image lifecycle only, not upstream art rights or identity.
PIXEL=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jfZkAAAAASUVORK5CYII=')
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
def query(page):
    return parse_qs(urlparse(page.url).query)
with ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC))) as server:
    Thread(target=server.serve_forever,daemon=True).start()
    origin=f'http://127.0.0.1:{server.server_port}/'
    with sync_playwright() as pw:
        browser=pw.chromium.launch()
        for width in (390,1440):
            ctx=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce')
            def external(route):
                if route.request.url.endswith('/vehicles/adder.webp'):
                    route.fulfill(status=200,content_type='image/png',body=PIXEL)
                else: route.abort()
            ctx.route('https://**/*',external)
            page=ctx.new_page()
            page.goto(origin+'atlas90-vehicles5.html?world=online&q=truffade+adder')
            cards=page.locator('#j90Cards .j90-card')
            expect(cards).to_have_count(1,timeout=15000)
            expect(cards).to_contain_text('Adder')
            cards.locator('img').evaluate("(img)=>img.loading='eager'")
            expect(cards).to_have_attribute('data-image-state','archive',timeout=15000)
            expect(cards.locator('.j90-caption')).to_contain_text('Archive reference image')
            page.locator('#j90Class').select_option('Super')
            assert query(page)['class']==['Super'] and query(page)['world']==['online']
            expect(cards).to_have_attribute('data-collected','false')
            expect(cards.locator('.j90-flag-pending')).to_have_text('NOT COLLECTED')
            cards.get_by_role('button',name='+ Collect').click()
            expect(cards).to_have_attribute('data-collected','true')
            expect(cards.locator('.j90-flag-done')).to_contain_text('COLLECTED')
            page.locator('#j90Ownership').select_option('owned')
            assert query(page)['collection']==['owned']
            page.reload()
            expect(cards).to_have_count(1,timeout=15000)
            expect(page.locator('#j90Search')).to_have_value('truffade adder')
            expect(page.locator('#j90Class')).to_have_value('Super')
            expect(page.locator('#j90Ownership')).to_have_value('owned')
            expect(cards.get_by_role('button',name='Collected')).to_have_attribute('aria-pressed','true')
            saved=page.evaluate('(k)=>localStorage.getItem(k)',STORE)
            page.locator('#j408ClearFilters').click()
            expect(page.locator('#j90Search')).to_have_value('')
            assert query(page)=={'world':['online']}
            page.locator('#j90Next').click()
            assert query(page)['page']==['2']
            page.reload()
            expect(page.locator('#j90Results')).to_contain_text('2 /')
            page.goto(origin+'atlas90-vehicles5.html?world=story&q=truffade+adder')
            expect(page.locator('.j90-empty')).to_be_visible(timeout=15000)
            expect(page.locator('#j90Header')).to_contain_text('STORY')
            expect(page.locator('#j90Discover')).to_be_hidden()
            page.goto(origin+'atlas90-vehicles5.html?world=story&q=adder')
            expect(cards).to_have_count(1,timeout=15000)
            cards.get_by_role('button',name='+ Compare').click()
            expect(page.locator('#j90Compare')).to_contain_text('Story availability')
            expect(page.locator('#j90Compare')).not_to_contain_text('GTA Online class')
            expect(page.locator('#j90Compare')).not_to_contain_text('Recorded price')
            expect(page.locator('#j90Compare')).not_to_contain_text('Tested top speed')
            assert page.evaluate('(k)=>localStorage.getItem(k)',STORE)==saved
            page.goto(origin+'atlas90-vehicles5.html?world=story&q=akula&class=Helicopters')
            expect(cards).to_have_count(1,timeout=15000)
            cards.locator('img').evaluate("(img)=>img.loading='eager'")
            expect(cards).to_have_attribute('data-image-state','concept',timeout=15000)
            expect(cards.locator('.j90-caption')).to_contain_text('exact archive image unavailable')
            expect(cards.locator('img')).to_have_attribute('alt',__import__('re').compile('not an exact game render'))
            assert page.evaluate('(k)=>localStorage.getItem(k)',STORE)==saved
            page.goto(origin+'atlas90-weapons.html?world=story&q=advanced+rifle')
            expect(cards).to_have_count(1,timeout=15000)
            expect(cards).to_contain_text('Advanced Rifle')
            expect(cards.locator('.j90-caption')).to_contain_text('Story Mode needs per-item checking')
            page.goto(origin+'atlas90-vehicles6.html?q=Dinka+Enduro')
            expect(cards).to_have_count(1,timeout=15000)
            cards.locator('img').evaluate("(img)=>img.loading='eager'")
            expect(cards).to_have_attribute('data-image-state','concept',timeout=15000)
            expect(cards.locator('.j90-caption')).to_contain_text('exact archive image unavailable')
            assert not cards.locator('img').get_attribute('src').startswith('https:')
            expect(cards.locator('.j90-caption')).to_have_count(1)
            expect(cards.locator('.j90-acquisition')).to_contain_text('Registration candidate')
            page.goto(origin+'atlas90-vehicles6.html?acquisition=water-temporary')
            expect(cards).to_have_count(12,timeout=15000)
            assert any('Como' in x for x in cards.all_text_contents())
            expect(page.locator('#j90Acquisition')).to_have_value('water-temporary')
            assert all(x=='water-temporary' for x in cards.evaluate_all("els=>els.map(e=>e.dataset.acquisition)"))
            page.locator('#j90Evidence').select_option('official-named')
            expect(cards).to_have_count(1)
            expect(cards).to_contain_text('Squalo')
            assert query(page)['acquisition']==['water-temporary'] and query(page)['evidence']==['official-named']
            page.reload()
            expect(cards).to_have_count(1,timeout=15000)
            expect(page.locator('#j90Acquisition')).to_have_value('water-temporary')
            page.locator('#j90Acquisition').select_option('air-temporary')
            expect(page.locator('.j90-empty')).to_be_visible()
            page.locator('#j90Evidence').select_option('all')
            expect(cards).to_have_count(17)
            assert any('Mallard' in x for x in cards.all_text_contents())
            page.locator('#j408ClearFilters').click()
            expect(page.locator('#j90Acquisition')).to_have_value('all')
            assert query(page)=={}
            assert page.evaluate('(k)=>localStorage.getItem(k)',STORE)==saved
            ctx.close()
            print(f'PASS Atlas 40.8 {width}: URL filters, reload, Online aliases, world isolation, image-state truth, VI concept',flush=True)
        browser.close()
