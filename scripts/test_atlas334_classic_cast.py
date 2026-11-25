"""Follow each classic map into its edition's cast and verify the profile's return map."""
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urljoin

from playwright.sync_api import expect, sync_playwright

public = Path(__file__).resolve().parents[1] / 'public'
roster = json.loads((public / 'data/atlas-universe-profiles.json').read_text())['records']
maps = {
    'atlas-iv.html': 'GTA IV',
    'atlas-sa.html': 'GTA San Andreas',
    'map-hub.html?game=iii': 'GTA III',
    'map-hub.html?game=vc': 'GTA Vice City',
    'map-hub.html?game=vcs': 'GTA Vice City Stories',
    'map-hub.html?game=lcs': 'GTA Liberty City Stories',
    'map-hub.html?game=ctw': 'GTA Chinatown Wars',
    'atlas-iv.html?scope=tlad': 'GTA The Lost and Damned',
    'atlas-iv.html?scope=tbogt': 'GTA The Ballad of Gay Tony',
}

with ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(public))) as server:
    Thread(target=server.serve_forever, daemon=True).start()
    origin = f'http://127.0.0.1:{server.server_port}/'
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for width in (390, 1440):
            page = browser.new_page(viewport={'width': width, 'height': 844})
            page.route('https://**/*', lambda route: route.abort())
            for path, edition in maps.items():
                page.goto(origin + path, wait_until='domcontentloaded')
                if '?scope=' in path:
                    expect(page.locator('#j190-iv-scope')).to_have_value(path.split('=')[1])
                cast = page.locator('#classicCastLink')
                expect(cast).to_contain_text('characters')
                cast.click()
                expect(page.get_by_role('combobox', name='Classic game edition')).to_have_value(edition)
                cards = page.locator('#j222-character-grid .j222-character-card')
                expected = {r['id'] for r in roster if r.get('kind') == 'character' and r.get('game') == edition}
                expect(cards).to_have_count(len(expected))
                assert expected and {r.get_attribute('data-character-id') for r in cards.all()} == expected
                cards.first.get_by_role('link', name='View profile').click()
                return_map = page.get_by_role('dialog').get_by_role('link', name='Open world map')
                assert urljoin(page.url, return_map.get_attribute('href')) == origin + path
            page.goto(origin + 'atlas-iv.html', wait_until='domcontentloaded')
            page.wait_for_function('window.TeamJuraIV3DBridge?.hasData()')
            for scope, edition in [('tlad', maps['atlas-iv.html?scope=tlad']), ('tbogt', maps['atlas-iv.html?scope=tbogt']), ('iv', 'GTA IV'), ('landmarks', 'GTA IV')]:
                page.locator('#j190-iv-scope').select_option(scope)
                assert page.locator('#classicCastLink').evaluate("el => new URL(el.href).searchParams.get('edition')") == edition
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
            page.close()
        browser.close()
    server.shutdown()
