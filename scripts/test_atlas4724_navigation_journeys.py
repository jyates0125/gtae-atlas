#!/usr/bin/env python3
"""Focused canonical navigation journeys; no unrelated map or Cayo retests."""
from datetime import datetime, timezone
import json
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
            page.goto(base+"index.html",wait_until="domcontentloaded")
            expect(page.locator("#j132-nav-toggle")).to_have_count(0)
            expect(page.locator(".j4728-signin")).to_be_disabled()
            expect(page.locator("input[type=password],input[type=email],#featuredGrid,.j4709-entry")).to_have_count(0)
            expect(page.locator(".j130-public-hero")).to_be_visible()
            assert "atlas97-proposed-loki-scaly-hero.webp" in page.locator(".j130-public-hero").evaluate("(e)=>getComputedStyle(e,'::before').backgroundImage")
            page.locator("a.action.primary").click()
            expect(page).to_have_url(base+"atlas-dashboard.html")
            for path,scope in [("atlas-dashboard.html",None),("atlas-online.html","online"),("atlas.html","story"),("atlas-vi.html","vi"),("atlas90-vehicles5.html?world=story","story"),("atlas-characters.html?game=vi","vi"),("atlas-sa.html",None),("atlas-forge-collections.html",None)]:
                page.goto(base+path,wait_until="domcontentloaded",timeout=50000)
                # Public labels use the collection hub, not the management child.
                wrong=page.locator('a[href="./atlas93-garage.html"]').filter(has_text="My Garage")
                expect(wrong).to_have_count(0)
                if path in ("atlas.html","atlas-online.html","atlas-vi.html"):
                    advanced=page.locator("#datasets > details.j4725-advanced")
                    expect(advanced).to_have_count(1)
                    assert not advanced.evaluate("(node)=>node.open")
                    expect(page.locator("#loadPack")).to_be_hidden()
                    advanced.locator("summary").click()
                    expect(page.locator("#loadPack")).to_be_visible()
                    advanced.locator("summary").click()
                    expect(page.locator("#loadPack")).to_be_hidden()
                    expect(page.locator("#atlasFilterDrawer")).to_have_count(1)
                if path=="atlas-dashboard.html":
                    expect(page.locator(".topbar .menu-toggle")).to_have_count(0)
                    today=page.locator(".topbar .j99-start-link")
                    expect(today).to_be_visible()
                    expect(today).to_have_attribute("href","./atlas-online.html#j393-online-activity-slot")
                    assert page.locator(".j223-worlds").evaluate("(el)=>!!(el.compareDocumentPosition(document.querySelector('.j4709-entry')) & Node.DOCUMENT_POSITION_FOLLOWING)")
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
                legacy=("atlas97-journey.html","atlas93-dispatch.html","atlas-catalog.html","atlas8-preview.html","command-center.html","directory.html","discovery.html","explorer.html","legacy-explorer.html","leonida-hq.html","online-explorer.html")
                for old in legacy:
                    expect(drawer.locator(f'a[href="./{old}"]')).to_have_count(0)
                if path=="atlas-dashboard.html":
                    drawer.locator("#j132-search").fill("dashboard")
                    expect(drawer.locator('a[href="./atlas-dashboard.html"]')).to_have_count(1)
                    drawer.locator("#j132-search").fill("legacy archive")
                    expect(drawer.locator('a[href="./atlas97-journey.html"]')).to_have_count(1)
                for query,event in [("Gun Van","gun-van"),("Shipwreck","shipwreck"),("Street Dealers","street-dealers"),("Smoke on the Water","smoke-products"),("LS Tags","ls-tags"),("Hidden Caches","hidden-caches"),("Junk Energy Skydives","junk-skydives"),("Gun Van inventory","gun-van-stock"),("Simeon","simeon-vehicles")]:
                    drawer.locator("#j132-search").fill(query)
                    expect(drawer.locator(f'a[href="./atlas-online.html?event={event}#j393-online-activity-slot"]')).to_have_count(1)
                drawer.locator("#j132-search").fill("Cayo Treasure Chests")
                expect(drawer.locator('a[href="./heist-cayo-perico.html"]')).to_have_count(1)
                drawer.locator("#j132-search").fill("Welcome")
                expect(drawer.locator('a[href="./index.html"]')).to_have_count(0)
                drawer.locator("#j132-search").fill("garage")
                expect(drawer.locator('a[href="./atlas-forge-collections.html"]')).to_have_count(1)
                drawer.locator("#j132-search").fill("GTA VI")
                expect(drawer.locator('a[href="./atlas-vi.html"]')).to_have_count(1)
                drawer.locator(".j132-close").click()
                expect(drawer).to_be_hidden()
                expect(menu).to_be_focused()
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),path
            # A fixed dated test fixture uses the actual catalog identity, not a live-data claim.
            page.clock.set_fixed_time(datetime(2026,11,26,18,0,tzinfo=timezone.utc))
            fixture={"schema":1,"rotations":{"gun-van":{"activeIds":["gun-van-procopio-beach"],"checkedAtUtc":"2026-11-26T15:53:49Z","validUntilUtc":"2026-11-27T06:00:00Z","source":"Synthetic regression fixture"}}}
            ctx.route("**/online-rotation-current.json*",lambda route:route.fulfill(status=200,content_type="application/json",body=json.dumps(fixture)))
            page.goto(base+"atlas-dashboard.html",wait_until="domcontentloaded")
            page.locator("#j132-nav-toggle").click()
            page.locator("#j132-search").fill("Gun Van")
            page.locator('#j132-nav-drawer a[href="./atlas-online.html?event=gun-van#j393-online-activity-slot"]').click()
            expect(page).to_have_url(base+"atlas-online.html?event=gun-van#j393-online-activity-slot")
            legend=page.locator("#j393-online-activity-slot #j88-events")
            expect(legend).to_be_visible(timeout=20000)
            expect(legend.get_by_role("searchbox")).to_have_value("Gun Van location")
            card=legend.locator(".j88-event-card").filter(has_text="Gun Van location")
            expect(card).to_have_count(1)
            expect(card.locator(".j4723-current-locations")).to_contain_text("Procopio Beach",timeout=25000)
            card.get_by_role("button",name="Find on map").click()
            page.wait_for_function("window.JuraAtlasEventLocations?.focused() && window.JuraAtlasEventLocations.availableCount(window.JuraConditions.BY_ID['gun-van'])===1",timeout=25000)
            expect(page.locator('header a.brand')).to_have_attribute("href","./atlas-dashboard.html")
            ctx.close()
            print(f"PASS {width}px canonical menu journeys")
        browser.close()
finally:
    server.shutdown()
