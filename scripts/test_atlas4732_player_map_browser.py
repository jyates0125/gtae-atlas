#!/usr/bin/env python3
"""Focused Chromium/Edge checks for player-first V / Online controls."""
import os
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
        engine=os.environ.get("ATLAS_BROWSER","chromium")
        browser=p.chromium.launch(channel="msedge") if engine=="msedge" else p.chromium.launch()
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
            expect(page.locator("#resultCount")).to_have_text("1 locations",timeout=15000)
            expect(page.locator("#togglePins")).to_have_attribute("aria-pressed","true")
            assert page.evaluate("localStorage.getItem('jura4731-online-selected-layers')") is None
            if width==390:
                expect(page.locator("header.topbar>nav")).to_be_hidden()
                assert page.locator("main.map-wrap").evaluate("(e)=>e.getBoundingClientRect().top+scrollY")<230
            # Optional source layers are discoverable but never an expanded wall of rows.
            sources=page.locator(".j4730-advanced-sources")
            expect(sources).to_have_count(1)
            assert not sources.evaluate("(e)=>e.open")
            expect(page.locator("#sourceToggles")).to_be_hidden()
            summary=sources.locator("summary")
            expect(summary).to_contain_text("layers")
            summary.click()
            source_search=page.locator("#sourceLayerSearch")
            expect(source_search).to_be_visible()
            expect(page.locator("#sourceToggles input[aria-label^='GTA V Story']")).to_have_count(0)
            before=page.evaluate("localStorage.getItem('jura55-source-visible')")
            source_search.fill("ATMs")
            expect(page.locator("#sourceToggles .source-option:visible")).to_have_count(1)
            expect(page.locator("#sourceToggles .source-option:visible")).to_contain_text("ATMs")
            source_search.fill("no matching fixture")
            expect(page.locator("#sourceLayerCount")).to_contain_text("No matching layers")
            source_search.fill("")
            assert page.locator("#sourceToggles .source-option:visible").count()>10
            assert page.locator("#sourceToggles").evaluate("(e)=>e.clientHeight<=320 && e.scrollHeight>e.clientHeight")
            summary.click()
            expect(page.locator("#sourceToggles")).to_be_hidden()
            assert page.evaluate("localStorage.getItem('jura55-source-visible')")==before
            page.locator("#j4731-filters-map").click()
            expect(page.locator("#allOff")).to_be_visible()
            page.locator("#j4730-legend-search").fill("Gun Van")
            expect(page.locator('.j4730-quick-row[data-legend-key="gun-van"] .legend-choice')).to_have_attribute("aria-pressed","true")
            page.locator("#allOff").click()
            expect(page.locator("#resultCount")).to_have_text("0 locations")
            page.reload(wait_until="domcontentloaded")
            page.locator("#j4731-filters-map").click()
            expect(page.locator("#resultCount")).to_have_text("0 locations")
            page.locator("#j4730-legend-search").fill("Gun Van")
            van=page.locator('.j4730-quick-row[data-legend-key="gun-van"] .legend-choice')
            expect(van).to_be_visible()
            expect(van).to_have_attribute("aria-pressed","false")
            van_glyph=van.locator("svg path").get_attribute("d")
            van_color=van.locator(".legend-symbol").evaluate("(e)=>getComputedStyle(e).color")
            assert van_color=="rgb(244, 182, 106)",van_color
            assert van_glyph, "Gun Van must have a glyph geometry"
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
            expect(page.locator("#selectedName .j4730-selected-glyph path")).to_have_attribute("d",van_glyph)
            # Feed refresh can replace the selected SVG between locator resolution
            # and evaluation. Assert the visible, currently connected glyph's paint.
            page.wait_for_function("""(color)=>{
              const e=document.querySelector('#selectedName .j4730-selected-glyph'),p=e?.querySelector('path');
              return !!(e?.isConnected&&p?.isConnected&&e.getClientRects().length&&
                getComputedStyle(e).color===color&&getComputedStyle(p).fill===color);
            }""",arg=van_color,timeout=15000)
            expect(page.locator("#selectedName .j4730-selected-glyph")).to_be_visible()
            expect(page.locator("#selectedName .j4730-selected-glyph path")).to_have_css("fill",van_color)
            assert page.locator(".j4730-advanced-events").evaluate("(e)=>e.open")
            # Fresh visitor with an expired feed: no stale or unrelated default pins.
            page.evaluate("localStorage.removeItem('jura4731-online-selected-layers')")
            page.clock.set_fixed_time(datetime(2026,11,27,8,0,tzinfo=timezone.utc))
            page.goto(base+"atlas-online.html",wait_until="domcontentloaded")
            expect(page.locator("#resultCount")).to_have_text("0 locations",timeout=25000)
            expect(page.locator("#togglePins")).to_have_attribute("aria-pressed","false")
            # QA-only stops, deliberately similar names: no production data changes.
            page.evaluate("""() => {
              const records=['Alpha','Bravo','Charlie'].map((name,i)=>({id:'qa-route-'+i,name:'QA Route '+name,game:'5',scope:'online',category:'landmark',x:100+i*100,y:200+i*80,tags:[],source:'Synthetic QA fixture'}));
              localStorage.setItem('jura-atlas-v5-packs',JSON.stringify({qa:{records}}));
            }""")
            page.reload(wait_until="domcontentloaded")
            page.locator("#juraOpenNav").click()
            planner=page.locator("#juraNavPanel")
            expect(planner).to_be_visible()
            start=planner.get_by_role("combobox",name="Starting location")
            dest=planner.get_by_role("combobox",name="Destination")
            start.fill("QA Route")
            expect(planner.locator("#j4730-nav-options-0 [role=option]")).to_have_count(3)
            start.press("Enter")
            expect(page.locator("#juraNavStatus")).to_contain_text("Choose a location from the list")
            start.press("ArrowDown")
            expect(start).to_have_attribute("aria-activedescendant","j4730-nav-options-0-0")
            start.press("Enter")
            expect(start).to_have_value("QA Route Alpha")
            planner.get_by_role("button",name="Browse locations for stop 2").click()
            expect(dest).to_have_attribute("aria-expanded","true")
            assert planner.locator("#j4730-nav-options-1 [role=option]").count()>0
            dest.fill("QA Route Bravo")
            planner.get_by_role("option",name=__import__('re').compile("QA Route Bravo")).click()
            expect(dest).to_have_value("QA Route Bravo")
            planner.locator("#juraNavAdd").click()
            middle=planner.get_by_role("combobox",name="Stop 1")
            middle.fill("QA Route Charlie")
            planner.get_by_role("option",name=__import__('re').compile("QA Route Charlie")).click()
            expect(middle).to_have_value("QA Route Charlie")
            planner.locator("#juraNavGo").click()
            expect(planner.locator("#juraNavResults")).to_contain_text("2 segments")
            expect(planner.locator("#juraNavResults")).to_contain_text("Direct-line preview")
            expect(page.locator("#juraNavStatus")).to_contain_text("not driving directions")
            planner.locator("#juraNavReverse").click()
            expect(start).to_have_value("QA Route Bravo")
            expect(dest).to_have_value("QA Route Alpha")
            expect(middle).to_have_value("QA Route Charlie")
            planner.locator("#juraNavClear").click()
            expect(start).to_have_value("")
            expect(dest).to_have_value("")
            print(f"PASS {engine} {width}px clean layers, persistence, Today, deep link, keyboard/browse and multi-stop route",flush=True)
            ctx.close()
        # Exercise the same filters and searchable route dropdown on actual VI data,
        # not a GTA V fixture or an assertion about source strings alone.
        for width,height in [(390,844),(1440,900)]:
            ctx=browser.new_context(viewport={"width":width,"height":height})
            ctx.route("https://**/*",lambda r:r.abort())
            page=ctx.new_page()
            page.goto(base+"atlas-vi.html",wait_until="domcontentloaded")
            page.wait_for_function("document.querySelector('#legend [data-legend-key=hotel]')!==null",timeout=30000)
            page.locator("#j4731-filters-map").click()
            legend=page.locator("#legend")
            search=page.locator("#j4730-legend-search")
            expect(search).to_be_visible()
            assert legend.locator("details[open]").count()<=1
            expect(page.locator("#j4748-vi-gameplay")).to_be_visible()
            assert page.locator("#j449-vi-jobs").evaluate("(e)=>!!(e.compareDocumentPosition(document.getElementById(\"j290-vi-ledger\")) & Node.DOCUMENT_POSITION_FOLLOWING)")
            page.locator("#j4748-vi-gameplay").click()
            assert page.evaluate("window.JuraDualLegendAPI.categories().filter(c=>c.enabled).every(c=>[\"collectible\",\"vehicle\",\"weapon\",\"activity\",\"property\",\"user\"].includes(c.id))")
            if width==390:
                assert page.locator("#atlasCanvas").evaluate("(c)=>c.width*c.height<=2002000")
                page.evaluate("() => {const c=document.getElementById(\"atlasCanvas\"); window.__j4748CanvasMutations=0; new MutationObserver(rs=>window.__j4748CanvasMutations+=rs.length).observe(c,{attributes:true,attributeFilter:[\"width\",\"height\"]}); for(let i=0;i<12;i++)window.dispatchEvent(new Event(\"resize\"));}")
                page.wait_for_timeout(250)
                assert page.evaluate("window.__j4748CanvasMutations")==0
            search.fill("Hotels & homes")
            row=legend.locator('[data-legend-key="hotel"]')
            expect(row).to_be_visible()
            expect(legend.locator(".legend-row")).to_have_count(1)
            expect(row.locator("svg path")).to_have_css("stroke","rgb(234, 165, 202)")
            search.fill("Gun Van")
            expect(legend.locator(".legend-row")).to_have_count(0)
            search.fill("")
            assert legend.locator("details[open]").count()<=1
            page.locator("#allOff").click()
            search.fill("Hotels & homes")
            expect(row.locator(".legend-choice")).to_have_attribute("aria-pressed","false")
            row.locator(".legend-choice").click()
            expect(row.locator(".legend-choice")).to_have_attribute("aria-pressed","true")
            if width==390:
                page.locator("#j4732-back-map").click()
            page.locator("#juraOpenNav").click()
            planner=page.locator("#juraNavPanel")
            expect(planner).to_be_visible()
            start=planner.get_by_role("combobox",name="Starting location")
            start.fill("Vice Regal")
            expect(planner.get_by_role("option",name=__import__('re').compile("Vice Regal"))).to_be_visible(timeout=15000)
            assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2")
            print(f"PASS {engine} {width}px VI searchable categories, collapsed defaults, matching color and VI-only route search",flush=True)
            ctx.close()
        browser.close()
finally:
    server.shutdown()
