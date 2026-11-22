#!/usr/bin/env python3
"""Focused Chromium browser test: Garage -> Forge never overwrites stored designs."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

root = Path(__file__).resolve().parents[1]
public = root / 'public'
assert (public / 'atlas-vehicle-configurator.html').exists(), 'Build Cloudflare payload first'

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(public)))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'
garage_key = 'team-jura-atlas93-garage-v1'
forge_key = 'team-jura-atlas101-concept-presets-v1'
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        page.goto(base + '/atlas-dashboard.html', wait_until='domcontentloaded')
        page.evaluate("""([g, f]) => {
            localStorage.setItem(g, JSON.stringify({schema:1,vehicles:{jetmax:{
                paint:'#12ab34',studioName:'My Marina',note:'Dock A',studioBody:'auto'
            }}}));
            localStorage.setItem(f, JSON.stringify({schema:1,builds:{jetmax:{
                model:'jetmax',paint:'#ff0000',name:'Old Forge',note:'Keep me'
            }},variants:{}}));
        }""", [garage_key, forge_key])
        before = page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key])
        page.goto(base + '/atlas-vehicle-configurator.html?model=jetmax&source=garage', wait_until='domcontentloaded')
        expect(page.locator('#modelSelect')).to_have_value('jetmax', timeout=30000)
        expect(page.locator('#paintColor')).to_have_value('#12ab34')
        expect(page.locator('#buildName')).to_have_value('My Marina')
        expect(page.locator('#buildNote')).to_have_value('Dock A')
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before, 'Opening working copy mutated saved data'
        expect(page.locator('#builderStatus')).to_contain_text('saved Garage build')
        page.locator('#saveBuild').click()
        after = page.evaluate("([g,f]) => [localStorage.getItem(g),JSON.parse(localStorage.getItem(f))]", [garage_key, forge_key])
        assert after[0] == before[0], 'Saving Forge should not modify Garage'
        assert after[1]['builds']['jetmax']['paint'] == '#12ab34'
        browser.close()
finally:
    server.shutdown()
print('Atlas 29.3 browser handoff and non-destructive save passed')
