"""Exercise private wardrobe bookmarks and artwork history on the built site."""
import os
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

root = Path(__file__).resolve().parents[1] / "public"
key = "team-jura-atlas98-style-bookmarks-v1"
server = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(root)))
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f"http://127.0.0.1:{server.server_port}/atlas98-style-lab.html"


def bookmark(page, index):
    return page.locator(".style-tile").nth(index).get_by_role("button").last


try:
    with sync_playwright() as pw:
        engine = os.getenv("ATLAS_BROWSER", "chromium")
        browser = pw.chromium.launch(**({"channel": "msedge"} if engine == "msedge" else {}))
        for width in (390, 1440):
            ctx = browser.new_context(viewport={"width": width, "height": 844})
            page, other = ctx.new_page(), ctx.new_page()
            page.goto(url)
            other.goto(url)
            expect(page.locator(".style-tile:visible")).to_have_count(8)
            page.evaluate("k=>localStorage.setItem(k,JSON.stringify({future:{keep:true}}))", key)
            bookmark(page, 0).click()
            expect(bookmark(page, 0)).to_be_focused()
            bookmark(other, 1).click()
            expect(page.locator("#savedStylesCount")).to_have_text("2 saved looks")
            page.get_by_role("button", name="Saved looks", exact=True).click()
            expect(page.locator(".style-tile:visible")).to_have_count(2)
            bookmark(page, 0).click()
            expect(page.locator(".style-tile:visible")).to_have_count(1)
            expect(page.get_by_role("button", name="Saved looks", exact=True)).to_be_focused()
            assert page.evaluate("k=>JSON.parse(localStorage.getItem(k)).future.keep", key)

            page.get_by_role("button", name="View artwork").click()
            dialog = page.locator("#styleDialog")
            expect(dialog).to_be_visible()
            page.locator("#stylePreview").evaluate("img=>img.decode()")
            assert page.url.endswith("?look=home")
            page.go_back()
            expect(dialog).to_be_hidden()
            page.go_forward()
            expect(dialog).to_be_visible()
            page.keyboard.press("Escape")
            expect(dialog).to_be_hidden()
            page.goto(url + "?keep=1&look=loki")
            expect(dialog).to_be_visible()
            page.get_by_role("button", name="Close artwork").click()
            expect(dialog).to_be_hidden()
            assert page.url == url + "?keep=1"
            page.goto(url + "?look=unknown")
            expect(dialog).to_be_hidden()

            for damaged in ("{", "null", "[]", '{"hero":"invalid"}'):
                page.evaluate("([k,v])=>localStorage.setItem(k,v)", [key, damaged])
                page.reload()
                expect(bookmark(page, 0)).to_be_disabled()
                expect(page.locator("#styleSaveStatus")).to_contain_text("preserved")
                assert page.evaluate("k=>localStorage.getItem(k)", key) == damaged
            other.evaluate("k=>localStorage.removeItem(k)", key)
            expect(bookmark(page, 0)).to_be_enabled()
            page.evaluate("Storage.prototype.setItem=()=>{throw Error('QuotaExceededError')}")
            bookmark(page, 0).click()
            expect(page.locator("#styleSaveStatus")).to_contain_text("Could not save")
            expect(bookmark(page, 0)).to_have_attribute("aria-pressed","false")
            ctx.close()
            print(f"PASS {engine} width {width}: bookmark integrity, focus, artwork history", flush=True)
        browser.close()
finally:
    server.shutdown()
