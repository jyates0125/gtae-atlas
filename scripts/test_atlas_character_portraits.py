"""Run against deployed-format files or a local Atlas source directory."""
import os
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

root = Path(os.environ.get("ATLAS_TEST_ROOT", "public")).resolve()

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

with ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=root)) as server:
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}/"
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="msedge" if os.getenv("ATLAS_BROWSER") == "msedge" else None,
                                     executable_path=os.getenv("ATLAS_CHROME_PATH"))
        for width in (375, 390, 1440):
            page = browser.new_page(reduced_motion="reduce", viewport={"width": width, "height": 812})
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.route("https://**/*", lambda route: route.abort())
            page.goto(base + "atlas-characters.html", wait_until="domcontentloaded")
            concepts = page.locator("#j222-character-grid img[src*='jura221-']")
            # Lazy reference images request their fallback once they enter the viewport.
            cards = page.locator(".j222-character-card")
            expect(cards.first).to_be_visible()
            for card in cards.all():
                card.scroll_into_view_if_needed()
            expect(concepts).to_have_count(9)
            for img in concepts.all():
                img.scroll_into_view_if_needed()
                img.evaluate("el => el.decode()")
                assert img.evaluate("el => el.naturalWidth === 418 && el.naturalHeight === 418")
            card = cards.filter(has=page.get_by_role("heading", name="Jason Duval", exact=True))
            card.get_by_text("View profile").click()
            dialog = page.get_by_role("dialog", name="Jason Duval")
            expect(dialog).to_be_visible()
            expect(dialog.get_by_text("Elario Studios · illustrated character concept")).to_be_visible()
            page.go_back()
            expect(dialog).to_be_hidden()
            page.go_forward()
            expect(dialog).to_be_visible()
            dialog.get_by_role("button", name="Close character profile").click()
            expect(dialog).to_be_hidden()
            page.wait_for_function("!new URL(location.href).searchParams.has('profile')")
            for world, url in (("vi","atlas90-weapons6.html"),("online","atlas90-weapons.html?world=online")):
                page.goto(base + "atlas-database.html?kind=weapon&game=" + world, wait_until="domcontentloaded")
                page.get_by_role("button",name="View details").first.click()
                detail = page.locator("#recordDialog")
                expect(detail).to_have_accessible_name(detail.locator("h2").inner_text())
                expect(detail.locator(f'a[href="./{url}"]')).to_be_visible()
                detail.evaluate("d => d.scrollTop = d.scrollHeight")
                expect(detail.get_by_role("button", name="Close details")).to_be_in_viewport()
                detail.get_by_role("button", name="Close details").click()
            assert not errors, errors
            page.close()
            print(f"PASS portraits, history and database navigation at {width}px", flush=True)
        browser.close()
    server.shutdown()
