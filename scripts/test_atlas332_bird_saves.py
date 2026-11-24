"""Exercise the original GTA IV save key through three built map pages."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1] / 'public'
KEY = 'team-jura-iv-bird-progress-v1'


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


with ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT))) as server:
    Thread(target=server.serve_forever, daemon=True).start()
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        context = browser.new_context(viewport={'width': 390, 'height': 844})
        context.route('https://**/*', lambda route: route.abort())
        pages = []
        for scope in ['iv', 'tlad', 'tbogt']:
            page = context.new_page()
            page.goto(f'http://127.0.0.1:{server.server_port}/atlas-iv.html?scope={scope}&loc={scope}-bird-001',
                      wait_until='domcontentloaded')
            expect(page.locator('#j190-iv-found')).to_be_visible()
            pages.append(page)
        iv, lost, ballad = pages
        # Hold the same Web Lock so two separate tabs queue competing writes.
        iv.evaluate("""key => new Promise(ready => navigator.locks.request(key, () =>
            new Promise(release => {window.releaseBirdLock = release; ready()})))""", KEY)
        for page in (iv, lost):
            page.locator('#j190-iv-found').click()
        iv.evaluate('window.releaseBirdLock()')
        for page in (iv, lost):
            expect(page.locator('#j190-iv-found')).to_contain_text('Mark uncollected')
        assert sorted(iv.evaluate('k => JSON.parse(localStorage.getItem(k))', KEY)) == ['iv-bird-001', 'tlad-bird-001']
        expect(ballad.locator('#ivBirdProgress')).to_have_text('0 of 50 collected')
        ballad.evaluate("""key => {
            const write = Storage.prototype.setItem;
            Storage.prototype.setItem = function(k, v) {
                if (k === key) throw new DOMException('Full', 'QuotaExceededError');
                return write.call(this, k, v);
            };
        }""", KEY)
        ballad.locator('#j190-iv-found').click()
        expect(ballad.locator('#ivBirdProgress')).to_contain_text('Could not save')
        expect(ballad.locator('#j190-iv-found')).to_contain_text('Mark found')
        original = '  ["iv-bird-001",\n unfinished'
        iv.evaluate('([key, raw]) => localStorage.setItem(key, raw)', [KEY, original])
        expect(lost.locator('#j190-iv-found')).to_be_disabled()
        expect(lost.locator('#j190-iv-hide-found')).to_be_disabled()
        with lost.expect_download() as download:
            lost.locator('#ivBirdDownload').click()
        assert download.value.path().read_bytes() == original.encode()
        assert iv.evaluate('k => localStorage.getItem(k)', KEY) == original
        iv.evaluate('k => localStorage.removeItem(k)', KEY)
        expect(lost.locator('#j190-iv-found')).to_be_enabled()
        expect(lost.locator('#ivBirdProgress')).to_have_text('0 of 50 collected')
        context.close()
        browser.close()
    server.shutdown()
