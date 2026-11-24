#!/usr/bin/env python3
"""Focused Online activity sidebar and conditional red search areas."""
from datetime import datetime, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

root=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(("127.0.0.1",0),partial(Quiet,directory=str(root/"public")))
Thread(target=server.serve_forever,daemon=True).start()
url=f"http://127.0.0.1:{server.server_port}/atlas-online.html"
try:
    with sync_playwright() as p:
        browser=p.chromium.launch()
        for width,height in [(390,844),(1440,900)]:
            context=browser.new_context(viewport={"width":width,"height":height})
            context.route("https://**/*",lambda route:route.abort())
            page=context.new_page()
            page.set_default_timeout(15000)
            page.clock.set_fixed_time(datetime(2026,10,25,12,tzinfo=timezone.utc))
            page.goto(url,wait_until="domcontentloaded",timeout=50000)
            panel=page.locator("#sidebar #j393-online-activity-slot #j88-events")
            expect(panel).to_have_count(1)
            expect(panel).to_be_visible()
            card=panel.locator(".j88-event-card").filter(has_text="Halloween free-roam Slashers")
            expect(card).to_have_count(1)
            switch=card.locator(".j393-event-switch")
            expect(switch).to_have_attribute("aria-pressed","true")
            zones=lambda:page.evaluate("window.JuraAtlasEventLocations.zones().length")
            assert zones()==0
            panel.get_by_text("Halloween event active in my session",exact=True).click()
            panel.locator(".j88-time select").select_option("2")
            panel.locator(".j393-slasher summary").click()
            assert zones()==0
            for box in panel.locator(".j393-slasher input[type=checkbox]").all(): box.check()
            page.wait_for_function("window.JuraAtlasEventLocations.zones().length===6")
            switch.click()
            assert zones()==0
            switch.click()
            assert zones()==6
            panel.locator(".j88-time select").select_option("6")
            assert zones()==0
            panel.locator(".j88-time select").select_option("1")
            assert zones()==6
            panel.get_by_role("button",name="Reset session conditions").click()
            assert zones()==0
            page.clock.set_fixed_time(datetime(2026,11,24,12,tzinfo=timezone.utc))
            page.reload(wait_until="domcontentloaded")
            expect(card.locator(".j88-status")).to_have_text("NOT ACTIVE")
            expect(card).to_have_class("j88-event-card j393-closed")
            switch.click()
            switch.click()
            assert zones()==0
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2")
            context.close()
            print(f"PASS {width}px: left sidebar, session and hour gates, switch, expired season, no horizontal overflow")
        browser.close()
finally:
    server.shutdown()
