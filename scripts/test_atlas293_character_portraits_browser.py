#!/usr/bin/env python3
"""Focused real-browser character QA for Lamar, Agent 14, CJ and Claude."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

root=Path(__file__).resolve().parents[1]
public=root/'public'
assert (public/'atlas-characters.html').is_file(), 'Build Cloudflare payload first'
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(public)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/'
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        for width in (390,1440):
            page=browser.new_page(viewport={'width':width,'height':844},reduced_motion='reduce')
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.route('https://**/*',lambda route:route.abort())
            page.goto(base+'atlas-characters.html?game=all',wait_until='domcontentloaded')
            cards=page.locator('#j222-character-grid .j222-character-card')
            expect(cards).to_have_count(40,timeout=20000)
            search=page.locator('#j222-character-search')
            search.fill('Lamar')
            expect(cards).to_have_count(2)
            assert {x.get_attribute('data-j222-world') for x in cards.all()}=={'story','online'}
            for id,world in [('character:lamar-story','story'),('character:lamar','online')]:
                card=page.locator(f'[data-character-id="{id}"]')
                expect(card.locator('h3')).to_have_text('Lamar Davis')
                assert card.get_attribute('data-j222-world')==world
                expect(card.locator('.j222-character-media')).to_have_attribute('data-art-status','portrait-pending',timeout=20000)
                expect(card.get_by_role('group',name='Individual portrait unavailable for Lamar Davis')).to_be_visible()
                expected='atlas.html' if world=='story' else 'atlas-online.html'
                assert expected in card.locator('.j222-card-actions a').nth(1).get_attribute('href')
            for name,id,asset in [
                ('Agent 14','character:agent14','elario-agent14-portrait.webp'),
                ('Carl Johnson','character:cj','jura221-cj-cinematic.webp'),
                ('Claude','character:claude','jura221-claude-cinematic.webp')]:
                search.fill(name)
                expect(cards).to_have_count(1)
                card=page.locator(f'[data-character-id="{id}"]')
                expect(card.locator('.j222-character-media')).to_have_attribute('data-art-status','character-concept')
                img=card.locator('img.jura-concept-portrait')
                expect(img).to_have_attribute('src','./art/'+asset)
                img.scroll_into_view_if_needed()
                img.evaluate("el => {el.loading='eager'}")
                expect(img).to_have_js_property('complete',True,timeout=20000)
                assert img.evaluate("el => el.naturalWidth>0 && el.naturalHeight>0"),name+' portrait decode failed'
                card.locator('a.j222-primary').click()
                modal=page.locator('#j222-profile-dialog')
                expect(modal).to_be_visible()
                assert modal.locator('img.jura-concept-portrait').count()==1
                page.keyboard.press('Escape')
                expect(modal).to_be_hidden()
            # A shared appearance link must open its exact character even if the
            # incoming URL still carries a conflicting world filter.
            page.goto(base+'atlas-characters.html?game=online&profile=character%3Alamar-story',wait_until='domcontentloaded')
            modal=page.locator('#j222-profile-dialog')
            expect(modal).to_be_visible(timeout=20000)
            expect(modal.locator('#j222-profile-title')).to_have_text('Lamar Davis')
            expect(page.locator('[data-j222-scope="story"]')).to_have_attribute('aria-pressed','true')
            assert 'game=story' in page.url
            page.keyboard.press('Escape')
            expect(modal).to_be_hidden()
            page.goto(base+'atlas-characters.html?game=story&profile=character%3Alamar',wait_until='domcontentloaded')
            expect(modal).to_be_visible(timeout=20000)
            expect(page.locator('[data-j222-scope="online"]')).to_have_attribute('aria-pressed','true')
            assert 'game=online' in page.url
            page.keyboard.press('Escape')
            expect(modal).to_be_hidden()
            assert not errors,errors
            page.close()
        browser.close()
finally:
    server.shutdown()
print('Atlas 29.3 Lamar/Agent14/CJ/Claude browser contracts passed')
