#!/usr/bin/env python3
"""Atlas 29.4: real browser Day/Scaly sidebar switch, no world leakage."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

root=Path(__file__).resolve().parents[1]
public=root/'public'
assert (public/'atlas-vi.html').is_file(),'Build Cloudflare payload before browser test'
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(public)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/'
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        for width in (390,1440):
            context=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce')
            page=context.new_page()
            errors=[]
            page.on('pageerror',lambda error: errors.append(str(error)))
            page.goto(base+'atlas-vi.html',wait_until='domcontentloaded')
            layer=page.locator('#layer')
            expect(layer.locator('option[value="day"]')).to_have_count(1,timeout=25000)
            assert layer.input_value()=='day','Owner-approved in-game Day map is primary'
            day=page.locator('#j294-day-map')
            expect(day).to_be_visible()
            expect(day).to_be_enabled()
            expect(day).to_have_attribute('aria-pressed','true')
            day.click()
            expect(layer).to_have_value('scaly,view')
            expect(day).to_have_attribute('aria-pressed','false')
            day.click()
            expect(layer).to_have_value('day')
            expect(day).to_have_attribute('aria-pressed','true')
            assert not page.locator('#j290-vi-ledger').evaluate('(el)=>el.hidden')
            if width==390:
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Day shortcut caused mobile overflow'
            assert not errors,errors
            for world in ('atlas.html','atlas-online.html'):
                page.goto(base+world,wait_until='domcontentloaded')
                expect(page.locator('#j294-day-map')).to_have_count(0)
            context.close()
        browser.close()
finally:
    server.shutdown()
print('PASS Atlas 29.4: optional Day/Scaly sidebar control, no world leak or mobile overflow')
