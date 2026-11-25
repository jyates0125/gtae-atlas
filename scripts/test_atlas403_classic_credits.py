#!/usr/bin/env python3
"""Verify unobtrusive world-specific source links and preserved functional map credits."""
from html.parser import HTMLParser
from pathlib import Path
from collections import Counter
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
class IDs(HTMLParser):
    def __init__(self): super().__init__(); self.ids=[]; self.links=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if 'id' in d:self.ids.append(d['id'])
        if tag=='a' and 'href' in d:self.links.append(d['href'])
credits=IDs()
credits.feed((ROOT/'atlas-credits.html').read_text())
anchors={'iii':'classic-iii-sources','vc':'classic-vc-sources','lcs':'classic-lcs-sources','vcs':'classic-vcs-sources','ctw':'ctw-camera-reference'}
for anchor in list(anchors.values())+['classic-episode-sources','classic-iii-collectibles','classic-vc-collectibles','classic-vc-definitive','classic-psp-reference','classic-landmark-approaches','game-artwork']:
    assert credits.ids.count(anchor)==1,anchor
assert 'https://itemaps.com/maps/gta-chinatown-wars' in credits.links
assert 'https://www.igrandtheftauto.com/gtacw/maps/drug-dealers' in credits.links
assert 'https://github.com/Freakler/CheatDeviceRemastered/blob/eb962c5bff9c1d94e6cb48077885fde0f5d28317/LICENSE' in credits.links
for script in ['atlas240-classic-coordinate-index.js','atlas244-vc-de.js','atlas247-stories-reference.js','atlas273-ctw-cameras.js']:
    src=(ROOT/script).read_text()
    assert 'sourceUrl:' in src or 'sourceUrl,route:' in src
    assert 'sourceUrl:link.href' not in src and 'sourceUrl:source.href' not in src
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
with ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'public'))) as server:
    Thread(target=server.serve_forever,daemon=True).start()
    url=f'http://127.0.0.1:{server.server_port}'
    with sync_playwright() as pw:
        browser=pw.chromium.launch()
        for width in (390,1440):
            context=browser.new_context(viewport={'width':width,'height':900},reduced_motion='reduce')
            context.route('https://**/*',lambda route:route.abort())
            page=context.new_page()
            for world,anchor in anchors.items():
                page.goto(url+'/map-hub.html?game='+world,wait_until='domcontentloaded')
                link=page.locator('footer #j98b-source-link')
                expect(link).to_have_count(1)
                expect(link).to_have_attribute('href','./atlas-credits.html#'+anchor)
                expect(link).to_have_text('Sources & credits')
                expect(page.locator('.classic-info')).to_have_count(0)
                expect(page.locator('#classicMapAttribution')).to_be_visible()
                expect(page.locator('#classicFlatLink')).to_be_visible()
                expect(page.locator('#classicRetryMap')).to_be_visible()
                expect(page.locator('#classicMapSourceLink')).to_be_visible()
                if world in ('lcs','vcs','ctw'):
                    expect(page.locator('#j250-source-link')).to_be_visible()
                if world in ('iii','vc'):
                    expect(page.locator('#j402-category-legend')).to_be_visible()
                    expect(page.locator('#j240-status')).to_contain_text('total')
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
                link.click()
                expect(page).to_have_url(url+'/atlas-credits.html#'+anchor)
                expect(page.locator('#'+anchor)).to_be_visible()
                print('PASS',width,world,'compact central credit link and functional fallback')
            context.close()
        browser.close()
    server.shutdown()
