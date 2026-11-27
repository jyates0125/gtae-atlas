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
            advanced=page.locator("details.j4730-advanced-events")
            assert not advanced.evaluate("(el)=>el.open")
            advanced.locator(":scope > summary").click()
            expect(panel).to_be_visible()
            expect(page.locator('#atlasFilterDrawer #j393-online-activity-slot #j88-events')).to_have_count(1)
            if width <= 820:
                assert page.evaluate('''() => { const s=document.querySelector('.shell'), a=document.querySelector('#sidebar'), f=document.querySelector('.j133-universal-footer'); return !!f && f.getBoundingClientRect().top >= Math.max(s.getBoundingClientRect().bottom,a.getBoundingClientRect().bottom)-2 && document.documentElement.scrollWidth<=innerWidth+2 }'''), 'Footer must follow entire workspace, not overlap sidebar'
                expect(page.locator('.jura-brand-map')).to_be_hidden()
            card=panel.locator(".j88-event-card").filter(has_text="Halloween free-roam Slashers")
            expect(card).to_have_count(1)
            switch=card.locator(".j393-event-switch")
            expect(switch).to_have_attribute("aria-pressed","true")
            zones=lambda:page.evaluate("window.JuraAtlasEventLocations.zones().length")
            assert zones()==0
            # Real partial catalog stays online-only and unconfirmed without a dated feed.
            for rule_id, count in [('gun-van',1),('shipwreck',1),('street-dealers',3)]:
                page.wait_for_function("([id,n])=>window.JuraAtlasEventLocations.count({id})===n",arg=[rule_id,count])
                assert page.evaluate("(id)=>window.JuraAtlasEventLocations.availableCount({id})",rule_id)==0
            card.locator('.j395-guide summary').click()
            expect(card.locator('.j395-guide')).to_contain_text('At least 16 minutes in session')
            expect(card.locator('.j395-guide')).to_contain_text('In-game time 01:00–06:00')
            panel.get_by_text("Halloween event active in my session",exact=True).click()
            panel.locator(".j88-time select").select_option("2")
            panel.locator(".j393-slasher summary").click()
            assert zones()==0
            for box in panel.locator(".j393-slasher input[type=checkbox]").all(): box.check()
            page.wait_for_function("window.JuraAtlasEventLocations.zones().length===7")
            switch.click()
            assert zones()==0
            switch.click()
            assert zones()==7
            panel.locator(".j88-time select").select_option("6")
            assert zones()==0
            panel.locator(".j88-time select").select_option("1")
            assert zones()==7
            panel.get_by_role("button",name="Reset session conditions").click()
            assert zones()==0
            page.clock.set_fixed_time(datetime(2026,11,24,12,tzinfo=timezone.utc))
            page.reload(wait_until="domcontentloaded")
            advanced.locator(":scope > summary").click()
            expect(card.locator(".j88-status")).to_have_text("NOT ACTIVE")
            expect(card).to_have_class("j88-event-card j393-closed")
            switch.click()
            switch.click()
            assert zones()==0
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2")
            # The standalone directory shares the same open guide, without mixing game progress.
            directory=url.replace("atlas-online.html","atlas-activities.html")
            page.goto(directory+"?mode=story",wait_until="domcontentloaded")
            nuclear=page.locator(".rule").filter(has=page.get_by_role("heading",name="Nuclear Waste",exact=True))
            expect(nuclear).to_have_count(1)
            nuclear.locator(".j396-guidance summary").click()
            expect(nuclear.locator(".j396-guidance")).to_contain_text("Unlocked suitable submersible")
            expect(nuclear.get_by_text("Open Story map",exact=True)).to_be_visible()
            assert page.locator(".rule").filter(has_text="Halloween free-roam Slashers").count()==0
            page.goto(directory+"?mode=online",wait_until="domcontentloaded")
            slash=page.locator(".rule").filter(has=page.get_by_role("heading",name="Halloween free-roam Slashers",exact=True))
            expect(slash).to_have_count(1)
            slash.locator(".j396-guidance summary").click()
            expect(slash.locator(".j396-guidance")).to_contain_text("At least 16 minutes in session")
            expect(slash.locator(".j396-guidance")).to_contain_text("15-minute encounter cooldown clear")
            assert page.locator(".rule").filter(has_text="Nuclear Waste").count()==0
            page.goto(directory+"?mode=vi",wait_until="domcontentloaded")
            launch=page.locator(".rule").filter(has=page.get_by_role("heading",name="GTA VI Story · launch and gameplay evidence",exact=True))
            expect(launch).to_have_count(1)
            launch.locator(".j396-guidance summary").click()
            expect(launch.locator(".j396-guidance")).to_contain_text("Research information only")
            assert page.locator(".rule").filter(has_text="Halloween free-roam Slashers").count()==0
            assert page.locator(".rule").filter(has_text="Nuclear Waste").count()==0
            # Synthetic local fixture only: exact ID matching, no invented production data.
            page.evaluate("""() => {
                const rows=[
                  {id:'qa-existing',game:'5',scope:'online',name:'QA existing route',x:50,y:50,category:'landmark'},
                  {id:'qa-current',game:'5',scope:'online',name:'QA current van',x:100,y:100,category:'activity',activityId:'gun-van',rotationMarkerId:'qa-van-1'},
                  {id:'qa-old',game:'5',scope:'online',name:'QA other van',x:200,y:200,category:'activity',activityId:'gun-van',rotationMarkerId:'qa-van-2'},
                  {id:'qa-dealer',game:'5',scope:'online',name:'QA incomplete dealer',x:300,y:300,category:'activity',activityId:'street-dealers',rotationMarkerId:'qa-dealer-1'}];
                localStorage.setItem('jura-atlas-v5-packs',JSON.stringify({qa:{records:rows}}));
                localStorage.setItem('jura-atlas-routes',JSON.stringify({'5':[],online:['qa-existing'],'6':[]}));
                localStorage.setItem('jura68-rotation-feed',JSON.stringify({schema:1,rotations:{
                  'gun-van':{activeIds:['qa-van-1'],checkedAtUtc:'2026-11-24T06:00:00Z',validUntilUtc:'2026-11-25T06:00:00Z',source:'QA fixture'},
                  'street-dealers':{activeIds:['qa-dealer-1','qa-dealer-2','qa-dealer-3'],checkedAtUtc:'2026-11-24T07:00:00Z',validUntilUtc:'2026-11-25T07:00:00Z',source:'QA fixture'}}}));
            }""")
            page.goto(url,wait_until="domcontentloaded")
            page.locator("#tabRoute").click()
            daily=page.locator("#j397-daily-route")
            expect(daily).to_be_visible()
            expect(daily.locator("small")).to_contain_text("1 unfinished dated mainland stops")
            daily.locator("button").click()
            saved=lambda:page.evaluate("JSON.parse(localStorage.getItem('jura-atlas-routes'))")
            assert saved()["online"]==["qa-existing","qa-current"]
            daily.locator("button").click()
            assert saved()["online"]==["qa-existing","qa-current"]
            assert saved()["5"]==[] and saved()["6"]==[]
            page.clock.set_fixed_time(datetime(2026,11,25,8,tzinfo=timezone.utc))
            page.reload(wait_until="domcontentloaded")
            page.locator("#tabRoute").click()
            expect(daily.locator("small")).to_contain_text("0 unfinished dated mainland stops")
            expect(page.locator("#routeList")).to_contain_text("Saved stop")
            assert saved()["online"]==["qa-existing","qa-current"]
            context.close()
            print(f"PASS {width}px: left sidebar, session and hour gates, switch, expired season, no horizontal overflow")
        browser.close()
finally:
    server.shutdown()
