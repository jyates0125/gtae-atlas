#!/usr/bin/env python3
"""Focused canonical navigation journeys; no unrelated map or Cayo retests."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect
import os
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(("127.0.0.1",0),partial(Quiet,directory=str(ROOT/"public")))
Thread(target=server.serve_forever,daemon=True).start()
base=f"http://127.0.0.1:{server.server_port}/"
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(channel="msedge" if os.getenv("ATLAS_BROWSER")=="msedge" else None)
        for width,height in [(390,844),(1440,900)]:
            ctx=browser.new_context(viewport={"width":width,"height":height})
            ctx.route("https://**/*",lambda r:r.abort())
            page=ctx.new_page()
            for path,scope in [("index.html",None),("atlas-online.html","online"),("atlas.html","story"),("atlas-vi.html","vi"),("atlas90-vehicles5.html?world=story","story"),("atlas-characters.html?game=vi","vi"),("atlas-sa.html",None),("atlas-forge-collections.html",None)]:
                page.goto(base+path,wait_until="domcontentloaded",timeout=50000)
                menu=page.locator("#j132-nav-toggle")
                expect(menu).to_have_count(1)
                menu.click()
                drawer=page.locator("#j132-nav-drawer")
                expect(drawer).to_be_visible()
                primary=drawer.locator(".j4724-primary")
                directory=drawer.locator(".j4724-all-pages")
                expect(directory).to_be_visible()
                assert not directory.evaluate("(node)=>node.open")
                hrefs=primary.locator("a").evaluate_all("(nodes)=>nodes.map(a=>a.getAttribute('href'))")
                assert len(hrefs)==len(set(hrefs)) and len(hrefs)<=20, (path,hrefs)
                assert "./atlas-forge-collections.html" in hrefs
                if scope:
                    assert ("./atlas90-vehicles6.html" if scope=="vi" else "./atlas90-vehicles5.html?world="+scope) in hrefs
                    assert "./atlas-characters.html?game="+scope in hrefs
                if scope=="online":
                    assert "./atlas-online.html#j393-online-activity-slot" in hrefs
                else:
                    assert "./atlas-online.html#j393-online-activity-slot" not in hrefs
                directory.locator("summary").click()
                assert directory.evaluate("(node)=>node.open")
                drawer.locator("#j132-search").fill("garage")
                expect(drawer.locator('a[href="./atlas-forge-collections.html"]')).to_have_count(1)
                drawer.locator("#j132-search").fill("GTA VI")
                expect(drawer.locator('a[href="./atlas-vi.html"]')).to_have_count(1)
                drawer.locator(".j132-close").click()
                expect(drawer).to_be_hidden()
                expect(menu).to_be_focused()
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),path
            ctx.close()
            print(f"PASS {width}px canonical menu journeys")
        browser.close()
finally:
    server.shutdown()
