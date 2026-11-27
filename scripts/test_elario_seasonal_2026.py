"""Verify the uploaded artwork, calendar bounds, graceful fallback and guest controls."""
from datetime import datetime, timezone
from functools import partial
from hashlib import sha256
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import os
from playwright.sync_api import sync_playwright, expect

root=Path(__file__).resolve().parents[1]
asset=root/"art/elario-thanksgiving-2026.webp"
assert sha256(asset.read_bytes()).hexdigest()=="f2b05e2913e80b8f670c34d2718f44fd59754e8e371f219276abc662d6f484d7", "Uploaded WebP differs from approved optimized edition"
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(("127.0.0.1",0),partial(Quiet,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start()
base=f"http://127.0.0.1:{server.server_port}/"
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(channel="msedge" if os.getenv("ATLAS_BROWSER")=="msedge" else None)
        for width,height in [(390,844),(1440,900)]:
            for stamp,active,missing in [
                ("2026-11-30T23:59:59-06:00",True,False),
                ("2026-12-01T00:00:00-06:00",False,False),
                ("2026-11-29T12:00:00-06:00",False,True)]:
                ctx=browser.new_context(viewport={"width":width,"height":height})
                ctx.route("https://**/*",lambda route:route.abort())
                if missing: ctx.route("**/art/elario-thanksgiving-2026.webp",lambda route:route.fulfill(status=404,body=""))
                page=ctx.new_page()
                page.clock.set_fixed_time(datetime.fromisoformat(stamp))
                page.goto(base+"index.html",wait_until="load")
                hero=page.locator(".j130-public-hero")
                card=page.locator('[data-elario-seasonal-card="welcome"]')
                if active:
                    expect(card).to_be_visible()
                    expect(hero).to_have_attribute("data-elario-seasonal","active")
                    assert card.locator("img").evaluate("(img)=>img.naturalWidth===1448&&img.naturalHeight===1086")
                    expect(card).to_contain_text("Elario Studios™")
                    expect(card).to_contain_text("© 2026")
                else:
                    expect(card).to_be_hidden()
                    assert "atlas97-proposed-loki-scaly-hero.webp" in hero.evaluate("(e)=>getComputedStyle(e,'::before').backgroundImage")
                expect(page.locator(".j4728-signin")).to_be_disabled()
                expect(page.locator("a.action.primary")).to_have_attribute("href","./atlas-dashboard.html")
                expect(page.locator("a.action.primary")).to_be_visible()
                assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2")
                if not missing and not active:
                    page.goto(base+"elario.html",wait_until="load")
                    expect(page.locator(".elario-creative-archive")).to_be_visible()
                    expect(page.locator('[data-elario-seasonal-card="archive"] img')).to_be_visible()
                    assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2")
                ctx.close()
                print("PASS",width,stamp,missing,flush=True)
        browser.close()
finally:
    server.shutdown()
