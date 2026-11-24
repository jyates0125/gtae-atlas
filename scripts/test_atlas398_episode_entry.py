"""Native GTA IV episode entry, compatibility links and isolated saved progress."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

root=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
with ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root/'public'))) as server:
    Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}/'
    with sync_playwright() as p:
        browser=p.chromium.launch()
        for width in (390,1440):
            page=browser.new_page(viewport={'width':width,'height':900})
            page.route('https://**/*',lambda route:route.abort())
            for scope in ('tlad','tbogt'):
                page.goto(base+'maps.html?q='+scope,wait_until='domcontentloaded')
                card=page.locator('.directory-card')
                expect(card).to_have_count(1)
                expect(card).to_have_attribute('href','./atlas-iv.html?scope='+scope)
                card.click()
                expect(page.locator('#j190-iv-scope')).to_have_value(scope)
                expect(page.locator('#visibleCount')).to_have_text('50')
                expect(page.locator('#classicMapShell')).to_be_visible()
                assert page.locator('#classicViewport').count()==0
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
                note=page.locator('#j398-episode-notebook')
                expect(note).to_be_hidden()
                assert note.get_attribute('href') is None
                # Both native episodes retain explicit recovery without a normal notebook CTA.
                page.goto(base+'map-hub.html?game='+scope+'&notebook=1',wait_until='domcontentloaded')
                expect(page.locator('#classicViewport')).to_have_count(1)
                link=page.locator('#j190-episode-collectibles')
                expect(link).to_have_attribute('href','./atlas-iv.html?scope='+scope)
                link.click()
                expect(page.locator('#visibleCount')).to_have_text('50')
                page.goto(base+'map-hub.html?game='+scope,wait_until='domcontentloaded')
                expect(page.locator('#j190-iv-scope')).to_have_value(scope)
                expect(page.locator('#visibleCount')).to_have_text('50')
                assert page.locator('#classicViewport').count()==0
            page.goto(base+'atlas-cayo.html',wait_until='domcontentloaded')
            expect(page.locator('#j180-shell')).to_be_visible(timeout=30000)
            assert '/heist-cayo-perico.html' in page.url
            assert page.locator('#j121Original').count()==0
            assert page.locator('#j169-cayo-frame').get_attribute('src') is None
            expect(page.locator('#j180-shell')).to_have_count(1)
            page.goto(base+'atlas-cayo.html?recovery=1',wait_until='domcontentloaded')
            expect(page.locator('#j121Original')).to_have_count(1)
            assert 'recovery=1' in page.url
            page.close()
            print(f'PASS {width}px: both episode cards, native map, 50 birds, optional notebook and old bookmark redirects')
        browser.close()
    server.shutdown()
