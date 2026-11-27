#!/usr/bin/env python3
"""Focused real Chromium checks for player-first V / Online controls."""
from datetime import datetime, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(("127.0.0.1",0),partial(Quiet,directory=str(ROOT/"public")))
Thread(target=server.serve_forever,daemon=True).start()
base=f"http://127.0.0.1:{server.server_port}/"
fixture={"schema":1,"rotations":{"gun-van":{"activeIds":["gun-van-procopio-beach"],"checkedAtUtc":"2026-11-26T15:53:49Z","validUntilUtc":"2026-11-27T06:00:00Z","source":"Synthetic regression fixture"}}}
try:
    with sync_playwright() as p:
        browser=p.chromium.launch()
        for width,height in [(390,844),(1440,900)]:
            ctx=browser.new_context(viewport={"width":width,"height":height})
            ctx.route("https://**/*",lambda r:r.abort())
            ctx.route("**/online-rotation-current.json*",lambda r:r.fulfill(status=200,content_type="application/json",body=json.dumps(fixture)))
            page=ctx.new_page()
            page.clock.set_fixed_time(datetime(2026,11,26,18,0,tzinfo=timezone.utc))
            page.goto(base+"atlas-online.html",wait_until="domcontentloaded")
            menu=page.locator("#j132-nav-toggle")
            expect(menu).to_be_visible(timeout=15000)
            page.wait_for_function("window.JuraDualLegendAPI && window.JuraAtlasEventLocations?.availableCount(window.JuraConditions.BY_ID['gun-van'])===1",timeout=25000)
            assert page.evaluate("window.JuraDualLegendAPI.categories().every(c=>!c.enabled)")
            if width==390:
                expect(page.locator("header.topbar>nav")).to_be_hidden()
                assert page.locator("main.map-wrap").evaluate("(e)=>e.getBoundingClientRect().top+scrollY")<230
            page.locator("#j4731-filters-map").click()
            expect(page.locator("#allOff")).to_be_visible()
            page.locator("#allOff").click()
            page.locator("#j4730-legend-search").fill("Gun Van")
            van=page.locator('.j4730-quick-row[data-legend-key="gun-van"] .legend-choice')
            expect(van).to_be_visible()
            expect(van).to_have_attribute("aria-pressed","false")
            van.click()
            expect(van).to_have_attribute("aria-pressed","true")
            assert page.evaluate("JSON.parse(localStorage.getItem('jura4731-online-selected-layers')).includes('event:gun-van')")
            page.reload(wait_until="domcontentloaded")
            page.locator("#j4731-filters-map").click()
            page.locator("#j4730-legend-search").fill("Gun Van")
            expect(van).to_have_attribute("aria-pressed","true",timeout=15000)
            van.click()
            expect(van).to_have_attribute("aria-pressed","false")
            page.locator("#j4730-legend-search").fill("")
            page.locator("#allOff").click()
            if width==390:
                page.locator("#j4732-back-map").click()
            page.locator("#j4731-today-map").click()
            expect(page.locator("#j4731-today-map")).to_have_attribute("aria-pressed","true")
            page.locator("#j4731-today-map").click()
            expect(page.locator("#j4731-today-map")).to_have_attribute("aria-pressed","false")
            assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2")
            page.goto(base+"atlas-online.html?event=gun-van#j393-online-activity-slot",wait_until="domcontentloaded")
            expect(page.locator("#j393-online-activity-slot #j88-events")).to_be_visible(timeout=25000)
            expect(page.locator("#selectedName")).to_contain_text("Procopio Beach",timeout=25000)
            assert page.locator(".j4730-advanced-events").evaluate("(e)=>e.open")
            print(f"PASS {width}px clean layers, persistence, Today, header and deep link",flush=True)
            ctx.close()
        browser.close()
finally:
    server.shutdown()
