#!/usr/bin/env python3
"""Atlas 29.0: deterministic public-build GTA VI Day map switching browser test.

Intercept upstream Day image *only in the browser test* to guarantee tile-render
control works without dependence on remote hosts. Production never uses this
fixture; the upstream tile source and rights are checked separately.
"""
import base64
import os
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
assert (PUBLIC / "atlas-vi.html").is_file() and (PUBLIC / "atlas.js").is_file()
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass
class Server(ThreadingHTTPServer):
    request_queue_size = 64
    daemon_threads = True

server = Server(("127.0.0.1", 0), partial(Quiet, directory=str(PUBLIC)))
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{server.server_port}/"
engine = os.environ.get("ATLAS_BROWSER", "chromium")
# A syntactically valid 1px raster, with permissive CORS to exercise Image.onload.
fixture = base64.b64decode(
    "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
)
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=True, **({"channel": "msedge"} if engine == "msedge" else {})
        )
        for width, height in ((1440, 900), (390, 844)):
            ctx = browser.new_context(
                viewport={"width": width, "height": height},
                reduced_motion="reduce",
                is_mobile=width == 390,
                has_touch=width == 390,
            )
            requests = []
            def day_asset(route):
                requests.append(route.request.url)
                route.fulfill(
                    status=200, body=fixture, headers={
                        "content-type": "image/gif",
                        "access-control-allow-origin": "*",
                        "cache-control": "no-store",
                    },
                )
            ctx.route("**/tiles/6/day/**", day_asset)
            page = ctx.new_page()
            page.goto(base + "atlas-vi.html", wait_until="domcontentloaded", timeout=45000)
            layer = page.locator("#layer")
            expect(layer.locator('option[value="day"]')).to_have_count(1, timeout=25000)
            assert layer.input_value() == "day", "Day should be new first-visit VI default"
            expect(layer.locator('option[value="scaly,view"]')).to_have_count(1)
            expect(layer.locator('option[value="yanis,18"]')).to_have_count(1)
            expect(layer.locator('option[value="dupzor,51"]')).to_have_count(1)
            page.wait_for_function(
                "() => /Illustration: [1-9][0-9]* tiles/.test(document.querySelector('#tileHealth')?.textContent || '')",
                timeout=25000,
            )
            assert requests, "Map engine did not request GTADB Day tiles"
            assert all("/tiles/6/day/" in u for u in requests)
            assert page.locator("#atlasCanvas").evaluate(
                "e => e.width > 0 && e.height > 0"
            ), "No live map canvas"
            # Day zoom tiles and the map-selection interaction must remain usable.
            page.locator("#zoomIn").click()
            page.wait_for_timeout(180)
            layer.select_option("scaly,view")
            assert layer.input_value() == "scaly,view"
            layer.select_option("day")
            assert layer.input_value() == "day"
            page.locator("#togglePins").click()
            page.locator("#togglePins").click()
            assert not page.locator("#atlasCanvas").is_hidden()
            if width == 390:
                assert page.evaluate(
                    "document.documentElement.scrollWidth <= innerWidth + 1"
                ), "Day-map UI overflows iPhone width"
            for old in ("atlas.html", "atlas-online.html"):
                page.goto(base + old, wait_until="domcontentloaded", timeout=45000)
                expect(page.locator('#layer option[value="day"]')).to_have_count(
                    0, timeout=25000
                )
            print(
                f"PASS Atlas 29.0 {engine} {width}: default Day map,"
                " distinct historic views, tile load, zoom, toggle,"
                " no GTA V/Online day leak",
                flush=True,
            )
            ctx.close()
        browser.close()
finally:
    server.shutdown()
