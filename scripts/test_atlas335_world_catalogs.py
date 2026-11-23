"""Check modern map catalogs and follow each cast link into its actual filtered roster."""
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import expect, sync_playwright

public = Path(__file__).resolve().parents[1] / 'public'
records = json.loads((public / 'data/atlas-universe-profiles.json').read_text())['records']
worlds = [
    ('atlas.html', 'story', 'game5', 'atlas90-weapons.html?world=story', 'atlas90-vehicles5.html?world=story'),
    ('atlas-online.html', 'online', 'gameOnline', 'atlas90-weapons.html?world=online', 'atlas90-vehicles5.html'),
    ('atlas-vi.html', 'vi', 'game6', 'atlas90-weapons6.html', 'atlas90-vehicles6.html')
]


def check_catalog(page, scope, armory, vehicles):
    links = page.get_by_role('navigation', name='Current world catalogs').get_by_role('link')
    expect(links).to_have_count(3)
    for link, path in zip(links.all(), [f'atlas-characters.html?game={scope}#mainCharacterEra', armory, vehicles]):
        expect(link).to_have_attribute('href', './' + path)
    return links.first


with ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(public))) as server:
    Thread(target=server.serve_forever, daemon=True).start()
    origin = f'http://127.0.0.1:{server.server_port}/'
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for width in (390, 1440):
            page = browser.new_page(viewport={'width': width, 'height': 844})
            page.route('https://**/*', lambda route: route.abort())
            for path, scope, _, armory, vehicles in worlds:
                page.goto(origin + path, wait_until='domcontentloaded')
                cast = check_catalog(page, scope, armory, vehicles)
                cast.click()
                expect(page.locator(f'[data-j222-scope="{scope}"]')).to_have_attribute('aria-pressed', 'true')
                cards = page.locator('#j222-character-grid .j222-character-card')
                ids = {r['id'] for r in records if r.get('kind') == 'character' and r['scope'] == scope}
                expect(cards).to_have_count(len(ids))
                assert {card.get_attribute('data-character-id') for card in cards.all()} == ids
                name = 'Lucia' if scope == 'vi' else 'Lamar'
                page.locator('#j222-character-search').fill(name)
                expect(cards).to_have_count(1)
                cards.get_by_role('link', name='View profile').click()
                expect(page.get_by_role('dialog').get_by_role('link', name='Open world map')).to_have_attribute('href', './' + path)
                page.goto(origin + vehicles, wait_until='domcontentloaded')
                showroom = page.locator('.j100-showroom-links')
                expect(showroom.get_by_role('link', name='Characters')).to_have_attribute('href', './atlas-characters.html?game=' + scope)
                top_cast = page.locator('.j90-nav').get_by_role('link', name='Characters')
                assert top_cast.evaluate("a => new URL(a.href).searchParams.get('game')") == scope
                forge = showroom.get_by_role('link', name='Original 3D configurator')
                expect(forge).to_have_attribute('href', './atlas-vehicle-configurator.html' + ('?world=vi' if scope == 'vi' else ''))
            page.goto(origin + 'atlas.html', wait_until='domcontentloaded')
            for _, scope, button, armory, vehicles in [worlds[1], worlds[2], worlds[0]]:
                # Responsive layouts may hide the original controls behind the map menu.
                page.locator('#' + button).evaluate('el => el.click()')
                check_catalog(page, scope, armory, vehicles)
            page.close()
        browser.close()
    server.shutdown()
