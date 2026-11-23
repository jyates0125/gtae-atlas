#!/usr/bin/env python3
"""Atlas 33.9: real built Newsroom, release-unrelated tests intentionally omitted."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect
import json

root = Path(__file__).resolve().parents[1]
public = root / 'public'
feed = json.loads((root / 'data/atlas-news-cheats.json').read_text(encoding='utf8'))
assert feed['schema'] == 1
assert feed['checkedAt'] == '2026-11-23'
assert (public / 'atlas-news.html').is_file(), 'Build Cloudflare output before browser test'
assert (public / 'data/atlas-news-cheats.json').is_file(), 'Reviewed feed missing from build'
assert json.loads((public / 'data/atlas-news-cheats.json').read_text(encoding='utf8'))['news'] == feed['news']
assert all(x['game'] in ('vi','online') for x in feed['news'])
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):
        pass

server = ThreadingHTTPServer(('127.0.0.1',0), partial(Quiet,directory=str(public)))
Thread(target=server.serve_forever,daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}/'
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        try:
            for width,height in ((390,844),(1440,900)):
                page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
                errors=[]
                page.on('pageerror',lambda err:errors.append(str(err)))
                page.route('https://**/*',lambda route:route.abort())
                page.goto(base+'atlas-news.html',wait_until='domcontentloaded')
                cards=page.locator('#hubCards article.h-card')
                expect(cards).to_have_count(sum(x['game']=='vi' for x in feed['news']),timeout=15000)
                assert cards.first.locator('h3').inner_text() == 'Grand Theft Auto VI: The Album Now Available'
                assert 'November 20, 2026' in cards.first.inner_text()
                expected_urls={x['url'] for x in feed['news'] if x['game']=='vi'}
                shown_urls=set(cards.locator('a').evaluate_all('(els)=>els.map(e=>e.href)'))
                assert shown_urls == expected_urls,(shown_urls,expected_urls)
                assert 'snapshot 2026-11-23' in page.locator('#hubCount').inner_text()
                page.locator('#hubGame').select_option('online')
                expect(cards).to_have_count(sum(x['game']=='online' for x in feed['news']))
                assert page.locator('#resultsTitle').inner_text() == 'GTA Online official posts'
                page.locator('#hubSearch').fill('Itali')
                expect(cards).to_have_count(1)
                assert 'Grotti Itali RSX' in cards.first.inner_text()
                assert 'game=online' in page.url and 'q=itali' in page.url
                page.locator('#resetHub').click()
                expect(cards).to_have_count(sum(x['game']=='online' for x in feed['news']))
                page.locator('#hubGame').select_option('all')
                expect(cards).to_have_count(len(feed['news']))
                assert all(a.get_attribute('href').startswith('https://') for a in cards.locator('a').all())
                assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 2'),f'Newsroom horizontal overflow at {width}px'
                assert not errors,errors
                page.close()
        finally:
            browser.close()
finally:
    server.shutdown()
print('PASS Atlas 33.9 Newsroom: built feed, trusted links, search, world filters and responsive mobile/desktop')
