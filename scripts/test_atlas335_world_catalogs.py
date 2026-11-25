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
                if scope == 'story':
                    comparison = showroom.get_by_role('link', name='Compare GTA V archive vehicles')
                    expect(comparison).to_have_attribute('href', './atlas90-vehicles5.html?world=story#j90Cards')
                    compare_button = page.locator('#j90Cards button').filter(has_text='+ Compare').first
                    compare_button.click()
                    expect(page.locator('#j90Compare')).to_be_visible()
                top_cast = page.locator('.j90-nav').get_by_role('link', name='Characters')
                assert top_cast.evaluate("a => new URL(a.href).searchParams.get('game')") == scope
                forge = showroom.get_by_role('link', name='Original 3D configurator')
                expect(forge).to_have_attribute('href', './atlas-vehicle-configurator.html' + ('?world=vi' if scope == 'vi' else ''))
            page.goto(origin + 'atlas.html', wait_until='domcontentloaded')
            for _, scope, button, armory, vehicles in [worlds[1], worlds[2], worlds[0]]:
                # Responsive layouts may hide the original controls behind the map menu.
                page.locator('#' + button).evaluate('el => el.click()')
                check_catalog(page, scope, armory, vehicles)
            page.goto(origin + 'atlas90-vehicles6.html', wait_until='domcontentloaded')
            # Wait for the actual asynchronous seed, not merely the HTML shell.
            total = len(json.loads((public / 'atlas90-seed.json').read_text())['vi'])
            expect(page.locator('#j90Total')).to_have_text(f'{total:,}', timeout=15000)
            search = page.locator('#j90Search')
            for term in ('Dinka Enduro', 'Crest Kayak', 'Ganado Retro Build', 'Dominator Buggy'):
                search.fill(term)
                result = page.locator('#j90Cards article')
                expect(result, f'{width}px search {term}').to_have_count(1, timeout=15000)
                expect(result).to_contain_text(term)
                assert result.get_by_role('link', name='Research source').get_attribute('href').startswith('https://www.rockstargames.com/VI/')
            search.fill('Piccia Furia')
            expect(result).to_have_count(1)
            expect(result).to_contain_text('Piccia Furia')
            expect(result).to_have_attribute('data-record-id', 'vehicles6:furia')
            expect(result.get_by_role('link', name='Research source')).to_have_attribute('href', 'https://fullsweepmap.com/wiki/gta6-vehicle-list/')
            search.fill('')
            expect(page.locator('#j90Results')).to_contain_text(f'{total:,} visible')
            page.goto(origin + 'atlas-database.html?game=vi&kind=property&q=Shore%20Court', wait_until='domcontentloaded')
            expect(page.locator('#recordGrid .u-card')).to_contain_text('Ocean Beach')
            page.goto(origin + 'atlas90-weapons6.html', wait_until='domcontentloaded')
            for item, chapter in [('girardi-es9', 1), ('klose-k17', 2)]:
                row = page.locator(f'[data-weapon-id="{item}"]')
                expect(row).to_contain_text(f'Chapter {chapter}')
                expect(row.get_by_role('link', name='Check evidence')).to_have_count(0)
            source_rows=json.loads((public/'data/atlas192-vi-weapons.json').read_text(encoding='utf-8'))['records']
            for item in ('girardi-es9','klose-k17'):
                record=next(r for r in source_rows if r['id']==item)
                page.goto(origin+'atlas-credits.html#vi-armory-visuals',wait_until='domcontentloaded')
                page.locator('#viArmorySourceFilter').fill(record['name'])
                detail=page.locator('#viArmorySources details').filter(has=page.get_by_text(record['name']+' · '+record['group'],exact=True))
                expect(detail).to_have_count(1,timeout=15000)
                detail.locator('summary').click()
                expect(detail.locator('a[href="'+record['sourceUrl']+'"]').first).to_be_visible()
                assert record['sourceUrl'].startswith('https://www.gamesradar.com/')
            page.close()
        browser.close()
    server.shutdown()
