#!/usr/bin/env python3
"""Atlas 34.6: real-browser GTA IV bird save must finish before asserting labels.

Runs Chromium or Edge against built Cloudflare public/, not a source mock.
Never writes into any non-test user's storage or a live website.
"""
import os
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
assert (PUBLIC / "atlas-iv.html").is_file(), "Build production public/ before browser test"


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


class Server(ThreadingHTTPServer):
    request_queue_size = 64
    daemon_threads = True


server = Server(("127.0.0.1", 0), partial(Quiet, directory=str(PUBLIC)))
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{server.server_port}/"
engine = os.environ.get("ATLAS_BROWSER", "chromium")
try:
    with sync_playwright() as pw:
        for width, height in ((390, 844), (1440, 900)):
            opts = {"headless": True}
            if engine == "msedge":
                opts["channel"] = "msedge"
            browser = pw.chromium.launch(**opts)
            context = browser.new_context(viewport={"width": width, "height": height})
            page = context.new_page()
            # No remote map tile dependency: local built data and controls are tested.
            page.route("**/maps/tiles/**", lambda route: route.abort())
            page.goto(base + "atlas-iv.html", wait_until="domcontentloaded", timeout=45000)
            page.locator("#j190-iv-scope").select_option("iv")
            page.wait_for_function(
                "document.getElementById('visibleCount').textContent==='200'",
                timeout=25000,
            )
            expect(page.locator("#resultCount")).to_have_text("200")
            page.locator(".classic-result").first.click()
            selected_id = page.evaluate(
                "new URL(location.href).searchParams.get('loc')"
            )
            assert selected_id and selected_id.startswith("iv-bird-"), selected_id
            mark = page.locator("#j190-iv-found")
            expect(mark).to_contain_text("Mark found")
            mark.click()
            # Web Locks can resolve *after* the click event. No immediate text snapshot.
            expect(mark).to_contain_text("Mark uncollected", timeout=15000)
            page.wait_for_function(
                "(id) => JSON.parse(localStorage.getItem("
                "'team-jura-iv-bird-progress-v1')||'[]').includes(id)",
                arg=selected_id,
                timeout=15000,
            )
            expect(page.locator("#ivBirdProgress")).to_contain_text("1 of 200 collected")
            page.locator("#j190-iv-hide-found").check()
            expect(page.locator("#resultCount")).to_have_text("199")
            page.locator("#j190-iv-hide-found").uncheck()
            page.reload(wait_until="domcontentloaded")
            page.locator("#j190-iv-scope").select_option("iv")
            page.wait_for_function(
                "document.getElementById('visibleCount').textContent==='200'",
                timeout=25000,
            )
            expect(page.locator("#ivBirdProgress")).to_contain_text("1 of 200 collected")
            page.locator(".classic-result").first.click()
            expect(mark).to_contain_text("Mark uncollected")
            mark.click()
            expect(mark).to_contain_text("Mark found", timeout=15000)
            page.wait_for_function(
                "(id) => !JSON.parse(localStorage.getItem("
                "'team-jura-iv-bird-progress-v1')||'[]').includes(id)",
                arg=selected_id,
                timeout=15000,
            )
            expect(page.locator("#ivBirdProgress")).to_contain_text("0 of 200 collected")
            # Malformed legacy state must block a write and offer raw export.
            page.evaluate("""() => localStorage.setItem(
              'team-jura-iv-bird-progress-v1', '{unreadable,retain me')""")
            page.reload(wait_until="domcontentloaded")
            page.locator("#j190-iv-scope").select_option("iv")
            page.locator(".classic-result").first.click()
            expect(mark).to_be_disabled()
            expect(page.locator("#ivBirdProgress")).to_contain_text(
                "Bird progress could not be read"
            )
            assert page.evaluate(
                "localStorage.getItem('team-jura-iv-bird-progress-v1')"
            ) == "{unreadable,retain me", "Corrupted private guest record changed"
            print(f"PASS {engine} {width}px: async bird save, reload, hide, undo, raw-safe refusal", flush=True)
            page.close()
            context.close()
            browser.close()
finally:
    server.shutdown()
