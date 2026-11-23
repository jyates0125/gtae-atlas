"""Atlas 33.7: Story/Online vehicle saves, legacy progress, tab safety and raw recovery."""
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import expect, sync_playwright

PUBLIC = Path(__file__).resolve().parents[1] / 'public'
STORE = 'team-jura-atlas90-collection-v1'


def ready(page):
    expect(page.locator('#j90Cards .j90-card').first).to_be_visible()


def flags(page):
    return page.evaluate('(key) => JSON.parse(localStorage.getItem(key)).owned', STORE)


with ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(PUBLIC))) as server:
    Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/'
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for width in (390, 1440):
            context = browser.new_context(viewport={'width': width, 'height': 844}, accept_downloads=True)
            a = context.new_page()
            a.route('https://**/*', lambda route: route.abort())
            a.goto(url + 'atlas90-vehicles5.html?world=online')
            a.evaluate('(key) => localStorage.removeItem(key)', STORE)
            a.reload()
            ready(a)
            expect(a.locator('[data-world="online"].j192-world-link')).to_have_attribute('aria-current', 'true')
            expect(a.locator('#j90Header')).to_contain_text('ONLINE')
            a.locator('#j90Cards .j90-card button').filter(has_text='+ Collect').first.click()
            legacy = flags(a)
            assert len(legacy) == 1, legacy
            old_key = next(iter(legacy))
            assert old_key.startswith('vehicles5:') and not old_key.startswith('vehicles5-story:'), old_key

            a.goto(url + 'atlas90-vehicles5.html?world=story')
            ready(a)
            expect(a.locator('[data-world="story"].j192-world-link')).to_have_attribute('aria-current', 'true')
            expect(a.locator('#j90Header')).to_contain_text('STORY')
            assert flags(a) == legacy, 'Opening Story must not migrate or overwrite Online saves'
            a.locator('#j90Cards .j90-card button').filter(has_text='+ Collect').first.click()
            saved = flags(a)
            assert len(saved) == 2 and old_key in saved, saved
            assert len([k for k in saved if k.startswith('vehicles5-story:')]) == 1, saved

            # Two already-open tabs must retain both users' later changes in the common v1 key.
            b = context.new_page()
            b.route('https://**/*', lambda route: route.abort())
            b.goto(url + 'atlas90-vehicles5.html?world=online')
            ready(b)
            a.locator('#j90Cards .j90-card').nth(1).get_by_role('button', name='+ Collect').click()
            b.locator('#j90Cards .j90-card').nth(1).get_by_role('button', name='+ Collect').click()
            after = flags(a)
            assert len(after) == 4, after
            assert len([k for k in after if k.startswith('vehicles5-story:')]) == 2
            assert len([k for k in after if k.startswith('vehicles5:')]) == 2
            assert flags(b) == after, 'Other tab must receive storage refresh'

            # An unreadable shared v1 record is never silently replaced by an empty save.
            a.evaluate('(value) => localStorage.setItem("team-jura-atlas90-collection-v1", value)', '{broken-json')
            a.reload()
            ready(a)
            expect(a.locator('#galleryStatus')).to_contain_text('cannot be read safely')
            a.locator('#j90Cards .j90-card').nth(2).get_by_role('button', name='+ Collect').click()
            assert a.evaluate('(key) => localStorage.getItem(key)', STORE) == '{broken-json'
            with a.expect_download() as item:
                a.get_by_role('button', name='Export collection').click()
            download = item.value
            assert download.suggested_filename.endswith('-raw-recovery.txt'), download.suggested_filename
            assert Path(download.path()).read_text(encoding='utf-8') == '{broken-json'

            # Previously saved legacy flags become usable again when a good backup is restored.
            a.evaluate('([key, record]) => localStorage.setItem(key, JSON.stringify(record))', [STORE, {'schema': 1, 'owned': legacy, 'wishlist': {}, 'note': {}}])
            a.reload()
            ready(a)
            assert flags(a) == legacy
            context.close()
        browser.close()
    server.shutdown()

print('PASS Atlas 33.7: separate vehicle flags, legacy preservation, multi-tab merge, corrupt-save raw backup')
