"""Run against deployed-format files or a local Atlas source directory."""
import json
import os
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

root = Path(os.environ.get("ATLAS_TEST_ROOT", "public")).resolve()
roster = [r for r in json.loads((root / "data/atlas-universe-profiles.json").read_text(encoding="utf-8"))["records"] if r["kind"] == "character"]
local_roster = [r for r in roster if r.get("conceptPortrait")]
assert len(roster) == 59 and len(local_roster) >= 13
assert all(r.get("preferConceptPortrait") is True for r in local_roster)

def decode_portrait(locator, identity):
    # Native lazy loading and layout may not yet have scheduled an image request.
    # Require a rendered successfully loaded image before decode; never swallow failure.
    locator.scroll_into_view_if_needed()
    locator.evaluate("el => { el.loading = 'eager'; }")
    try:
        expect(locator).to_have_js_property("complete", True, timeout=15000)
        locator.evaluate("el => el.decode()")
        assert locator.evaluate("el => el.naturalWidth>0 && el.naturalHeight>0")
    except Exception as error:
        details = locator.evaluate("el => ({src: el.getAttribute('src'), currentSrc:el.currentSrc, complete:el.complete, width:el.naturalWidth, height:el.naturalHeight})") if locator.count() else {"missing": True}
        raise AssertionError(f"Portrait decode failed for {identity}: {details}") from error

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

class AtlasTestServer(ThreadingHTTPServer):
    request_queue_size = 128
    daemon_threads = True
    def handle_error(self, request, client_address):
        # Navigating away can abort an in-flight tile/image response on Windows.
        # Ignore only socket disconnects; all other handler failures are reported.
        import sys
        if isinstance(sys.exc_info()[1], (BrokenPipeError, ConnectionResetError, ConnectionAbortedError)):
            return
        super().handle_error(request, client_address)

with AtlasTestServer(("127.0.0.1", 0), partial(QuietHandler, directory=root)) as server:
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}/"
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="msedge" if os.getenv("ATLAS_BROWSER") == "msedge" else None,
                                     executable_path=os.getenv("ATLAS_CHROME_PATH"))
        for width in (375, 390, 1440):
            page = browser.new_page(reduced_motion="reduce", viewport={"width": width, "height": 812})
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            # Check local-first selection before blocking any network requests.
            exterior = []
            page.on("request", lambda request: exterior.append(request.url) if request.url.startswith("https://") else None)
            page.route("https://**/*", lambda route: route.abort())
            page.goto(base + "atlas-characters.html", wait_until="domcontentloaded")
            all_cards = page.locator("#j222-character-grid .j222-character-card")
            expect(all_cards).to_have_count(len(roster),timeout=15000)
            for entry in local_roster:
                # Filter by record ID, including exact edition; duplicate names must stay distinct.
                portrait_card=page.locator(f'#j222-character-grid [data-character-id="{entry["id"]}"]')
                expect(portrait_card.locator(".j222-character-media")).to_have_attribute("data-art-status","character-concept")
                portrait=portrait_card.locator("img.jura-concept-portrait")
                expect(portrait).to_have_attribute("src","./"+entry["conceptPortrait"])
                decode_portrait(portrait,entry["id"])
                assert portrait.evaluate("el => el.naturalWidth>0 && new URL(el.src).origin===location.origin")
                expect(portrait_card.locator(".j222-art-credit")).to_have_text("Elario Studios · illustrated character concept")
            # Shared reference URLs may belong to a different appearance (e.g. Franklin Online).
            only_local_urls = {r.get("image") for r in local_roster} - {r.get("image") for r in roster if not r.get("conceptPortrait")} - {None, ""}
            assert not only_local_urls.intersection(exterior), "Local-first portraits made exterior image requests"
            for entry in (r for r in roster if not r.get("conceptPortrait")):
                pending=page.locator(f'#j222-character-grid [data-character-id="{entry["id"]}"]')
                pending.scroll_into_view_if_needed()
                expect(pending.locator(".j222-character-media")).to_have_attribute("data-art-status","portrait-pending",timeout=15000)
                expect(pending.get_by_role("group",name="Individual portrait unavailable for "+entry["name"])).to_be_visible()
                expect(pending.locator(".j222-art-credit")).to_contain_text("not a depiction")
            concepts = page.locator("#j222-character-grid img[src*='jura221-']")
            # CJ is an approved local primary image, not dependent on a remote host.
            cj_card=page.locator(".j222-character-card").filter(has=page.get_by_role("heading",name="Carl Johnson",exact=True))
            cj_portrait=cj_card.locator('img[src$="jura221-cj-cinematic.webp"]')
            expect(cj_portrait).to_have_count(1,timeout=15000)
            decode_portrait(cj_portrait,"CJ archive")
            assert cj_portrait.evaluate("el => el.naturalWidth>0 && new URL(el.src).origin===location.origin")
            expect(cj_card.locator(".j222-art-credit")).to_have_text("Elario Studios · illustrated character concept")
            cj_card.get_by_role("link",name="View profile").click()
            cj_dialog=page.get_by_role("dialog",name="Carl Johnson")
            expect(cj_dialog).to_be_visible()
            decode_portrait(cj_dialog.locator('img[src$="jura221-cj-cinematic.webp"]'),"CJ profile dialog")
            cj_dialog.get_by_role("button",name="Close character profile").click()
            expect(cj_dialog).to_be_hidden()
            page.wait_for_function("!new URL(location.href).searchParams.has('profile')")
            # Lazy reference images request their fallback once they enter the viewport.
            cards = page.locator(".j222-character-card")
            expect(cards.first).to_be_visible()
            for card in cards.all():
                card.scroll_into_view_if_needed()
            expect(concepts).to_have_count(9)
            for img in concepts.all():
                decode_portrait(img,img.get_attribute("src"))
                assert img.evaluate("el => el.naturalWidth === 418 && el.naturalHeight === 418")
            agent = cards.filter(has=page.get_by_role("heading",name="Agent 14",exact=True))
            assert agent.get_attribute("data-j222-world")=="online"
            agent_image=agent.locator('img[src$="elario-agent14-portrait.webp"]')
            decode_portrait(agent_image,"Agent 14")
            assert agent_image.evaluate("el => el.naturalWidth === 640")
            for slug,scope in (("huang-lee","classic"),("agatha-baker","online"),("bigsmoke","classic")):
                portrait=cards.locator(f'img[src$="elario-{slug}-portrait.webp"]')
                portrait.scroll_into_view_if_needed()
                assert portrait.evaluate("el => el.closest('article').dataset.j222World")==scope
                decode_portrait(portrait,slug)
                assert portrait.evaluate("el => el.naturalWidth === 640")
            card = cards.filter(has=page.get_by_role("heading", name="Jason Duval", exact=True))
            card.get_by_text("View profile").click()
            dialog = page.get_by_role("dialog", name="Jason Duval")
            expect(dialog).to_be_visible()
            expect(dialog.get_by_text("Elario Studios · illustrated character concept")).to_be_visible()
            directory=Path("qa-evidence")/(os.getenv("ATLAS_BROWSER") or "chromium")
            directory.mkdir(parents=True,exist_ok=True)
            page.screenshot(path=str(directory/f"jura-jason-concept-{width}.png"),animations="disabled")
            page.go_back()
            expect(dialog).to_be_hidden()
            page.go_forward()
            expect(dialog).to_be_visible()
            dialog.get_by_role("button", name="Close character profile").click()
            expect(dialog).to_be_hidden()
            page.wait_for_function("!new URL(location.href).searchParams.has('profile')")
            # The underlying database must share the archive's canonical lookup
            # and link the actual classic game rather than a generic classic page.
            page.goto(base+"atlas-database.html?kind=character&game=all&q=CJ",wait_until="domcontentloaded")
            record=page.locator("#recordGrid .u-card")
            expect(record).to_have_count(1,timeout=15000)
            expect(record.locator("h3")).to_have_text("Carl Johnson")
            local_cj=record.locator('img[src$="jura221-cj-cinematic.webp"]')
            expect(local_cj).to_have_count(1)
            decode_portrait(local_cj,"CJ Universe Database")
            expect(record.locator(".u-image-note")).to_have_text("ELARIO CHARACTER CONCEPT")
            expect(record.locator(".u-card-eyebrow")).to_contain_text("GTA San Andreas")
            profile_link=record.get_by_role("link",name="Open character profile")
            assert "edition=GTA%20San%20Andreas" in profile_link.get_attribute("href")
            record.get_by_role("button",name="View details").click()
            expect(page.locator("#recordDialog").get_by_role("link",name="Open character profile")).to_have_attribute("href",profile_link.get_attribute("href"))
            page.locator("#recordDialog").get_by_role("button",name="Close details").click()
            for world, url in (("vi","atlas90-weapons6.html"),("online","atlas90-weapons.html?world=online")):
                page.goto(base + "atlas-database.html?kind=weapon&game=" + world, wait_until="domcontentloaded")
                page.get_by_role("button",name="View details").first.click()
                detail = page.locator("#recordDialog")
                expect(detail).to_have_accessible_name(detail.locator("h2").inner_text())
                expect(detail.locator(f'a[href="./{url}"]')).to_be_visible()
                detail.evaluate("d => d.scrollTop = d.scrollHeight")
                expect(detail.get_by_role("button", name="Close details")).to_be_in_viewport()
                detail.get_by_role("button", name="Close details").click()
            page.goto(base + "maps.html?q=gta6",wait_until="domcontentloaded")
            expect(page.locator('.directory-card[data-id="vi"]')).to_be_visible()
            page.locator("#worldSearch").fill("")
            expect(page.locator(".directory-card")).to_have_count(13)
            page.goto(base + "heists.html?q=casino+diamond",wait_until="domcontentloaded")
            expect(page.locator(".cards article:visible")).to_have_count(1)
            expect(page.locator(".cards article:visible h2")).to_contain_text("Diamond Casino")
            page.locator("#heistReset").click()
            expect(page.locator(".cards article:visible")).to_have_count(15)

            page.goto(base + "map-hub.html?game=iii",wait_until="domcontentloaded")
            page.evaluate("""() => {
              const markers = [[10,10],[80,80],[11,11],[50,50]].map(([x,y],i)=>({
                id:String(i), name:'Test pin '+i, x,y, category:'Note'
              }));
              localStorage.setItem('team-jura-atlas98-classic-iii-v1',JSON.stringify({
                schema:'team-jura-atlas98-classic-v1',world:'iii',markers,completed:[],background:null
              }));
            }""")
            page.reload(wait_until="domcontentloaded")
            pick=page.locator("#j98bRoutePick")
            for pin in ("1","2","0"):
                pick.select_option(pin)
                page.locator("#j98bRouteAdd").click()
            page.locator("#j98bRouteOrder").click()
            expected=["1. Test pin 0","2. Test pin 2","3. Test pin 1"]
            expect(page.locator("#j98bRouteStops li span")).to_have_text(expected)
            page.reload(wait_until="domcontentloaded")
            expect(page.locator("#j98bRouteStops li span")).to_have_text(expected)
            route_backup={"schema":"team-jura-classic-route-v1","world":"iii","stops":["1","3","unknown"]}
            page.locator("#j228RouteImport").set_input_files({"name":"route.json","mimeType":"application/json","buffer":json.dumps(route_backup).encode()})
            expect(page.locator("#j98bRouteStatus")).to_contain_text("1 route stop(s) added; 1 unavailable")
            expect(page.locator("#j98bRouteStops li span")).to_have_text(expected+["4. Test pin 3"])
            route_backup["world"]="vc"
            page.locator("#j228RouteImport").set_input_files({"name":"wrong-world.json","mimeType":"application/json","buffer":json.dumps(route_backup).encode()})
            expect(page.locator("#j98bRouteStatus")).to_contain_text("Restore refused:")
            expect(page.locator("#j98bRouteStops li span")).to_have_text(expected+["4. Test pin 3"])
            pick.select_option("1")
            page.locator("#j269RouteFinish").select_option("2")
            page.locator("#j98bRouteOrder").click()
            expect(page.locator("#j98bRouteStops li span").first).to_have_text("1. Test pin 1")
            expect(page.locator("#j98bRouteStops li span").last).to_have_text("4. Test pin 2")
            expect(page.locator("#j98bRouteStatus")).to_contain_text("selected finish preserved")
            page.reload(wait_until="domcontentloaded")
            expect(page.locator("#j98bRouteStops li span").last).to_have_text("4. Test pin 2")
            page.goto(base + "map-hub.html?game=vc",wait_until="domcontentloaded")
            expect(page.locator("#j98bRouteStops li span")).to_have_count(0)
            # Seven classic-world checklists use merge-only, game-scoped restores.
            worlds=("iii","vc","vcs","lcs","ctw","tlad","tbogt")
            for world in worlds if width==390 else ("iii","tlad"):
                page.goto(base+"map-hub.html?game="+world+"&notebook=1",wait_until="domcontentloaded")
                slots=page.locator("#j98bGrid .j150-slot button[data-done]")
                expect(slots.first).to_be_visible(timeout=15000)
                category=page.locator("#j98bSet").input_value()
                slots.nth(0).click()
                check_backup={"schema":"team-jura-atlas98b-items-v1","game":world,"done":{category:[2,9999]}}
                page.locator("#j98bImport").set_input_files({"name":"collection.json","mimeType":"application/json","buffer":json.dumps(check_backup).encode()})
                expect(page.locator("#j98bStatus")).to_contain_text("1 completed slot(s) added.")
                expect(slots.nth(0)).to_have_attribute("data-done","true")
                expect(slots.nth(1)).to_have_attribute("data-done","true")
                check_backup["game"]="another"
                page.locator("#j98bImport").set_input_files({"name":"wrong.json","mimeType":"application/json","buffer":json.dumps(check_backup).encode()})
                expect(page.locator("#j98bStatus")).to_contain_text("Restore refused:")
                page.reload(wait_until="domcontentloaded")
                expect(slots.nth(0)).to_have_attribute("data-done","true",timeout=15000)
                expect(slots.nth(1)).to_have_attribute("data-done","true")
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"),world
                assert page.locator("#j98bImport").evaluate("e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1}"),world

            # Studio restore must preserve both a conflicting existing idea and Garage ownership.
            page.goto(base+"atlas-vehicle-configurator.html?model=adder",wait_until="domcontentloaded")
            expect(page.locator("#modelSelect")).to_have_value("adder",timeout=15000)
            page.evaluate("""() => {
                localStorage.setItem('team-jura-atlas101-concept-presets-v1',JSON.stringify({schema:1,builds:{
                    adder:{model:'adder',paint:'#102030',body:'auto',name:'Keep my Adder',note:'Original notes'}
                }}));
                localStorage.setItem('team-jura-atlas90-collection-v1',JSON.stringify({schema:1,owned:{'vehicles5:adder':true},wishlist:{}}));
            }""")
            preset_backup={"schema":1,"builds":{
                "adder":{"model":"adder","paint":"#ff0000","body":"sports","name":"Do not overwrite","note":""},
                "zentorno":{"model":"zentorno","paint":"#aabbcc","body":"sports","name":"Restored Zentorno","note":"Saved offline"},
                "invalid_unknown":{"model":"invalid_unknown","paint":"#ffffff","body":"auto","name":"Ignore","note":""}}}
            page.locator("#importBuilds").set_input_files({"name":"concepts.json","mimeType":"application/json","buffer":json.dumps(preset_backup).encode()})
            expect(page.locator("#builderStatus")).to_contain_text("1 new preset(s), 0 named build(s) imported; 1 existing kept; 1 invalid or unknown skipped")
            page.locator("#loadBuild").click()
            expect(page.locator("#buildName")).to_have_value("Keep my Adder")
            page.locator("#modelSelect").select_option("zentorno")
            expect(page.locator("#buildName")).to_have_value("Restored Zentorno")
            expect(page.locator("#paintColor")).to_have_value("#aabbcc")
            page.locator("#modelSelect").select_option("alkonost")
            expect(page.locator("#bodyStyle")).to_be_disabled()
            expect(page.locator("#bodyStyleHint")).to_contain_text("road body styles do not apply")
            page.locator("#modelSelect").select_option("adder")
            expect(page.locator("#bodyStyle")).to_be_enabled()
            page.locator("#importBuilds").set_input_files({"name":"invalid.json","mimeType":"application/json","buffer":b'{"schema":99}'})
            expect(page.locator("#builderStatus")).to_contain_text("Import rejected:")
            saved_studio=page.evaluate("JSON.parse(localStorage.getItem('team-jura-atlas101-concept-presets-v1'))")
            assert saved_studio["builds"]["adder"]["name"]=="Keep my Adder"
            assert saved_studio["builds"]["zentorno"]["paint"]=="#aabbcc"
            assert page.evaluate("JSON.parse(localStorage.getItem('team-jura-atlas90-collection-v1')).owned['vehicles5:adder']") is True
            page.goto(base + "atlas93-garage.html",wait_until="domcontentloaded")
            page.wait_for_function("Number(document.querySelector('#catalogCount').textContent.replaceAll(',',''))>0")
            backup={"schema":1,"app":"team-jura-atlas93-garage","garage":{"garages":["Main Garage"],"vehicles":{}},
                    "collection":{"owned":{"vehicles5:adder":True},"wishlist":{"vehicles5:zentorno":True}}}
            page.locator("#importGarage").set_input_files({"name":"garage.json","mimeType":"application/json",
                                                          "buffer":json.dumps(backup).encode()})
            expect(page.locator("#garageNotice")).to_contain_text("1 collection marks.")
            collection=page.evaluate("JSON.parse(localStorage.getItem('team-jura-atlas90-collection-v1'))")
            assert collection["owned"]["vehicles5:adder"] and collection["wishlist"]["vehicles5:zentorno"]
            page.goto(base + "atlas-collectibles.html?game=online&q=snowmen",wait_until="domcontentloaded")
            page.get_by_role("button",name="View details").first.click()
            checklist=page.locator("#recordDialog").get_by_text("Open collection checklist")
            expect(checklist).to_have_attribute("href","./atlas81-hq.html?collection=online-snowmen#collections")
            checklist.click()
            expect(page.locator("#selectedTitle")).to_contain_text("Snowmen")
            expect(page.locator("#modeOnline")).to_have_attribute("aria-pressed","true")
            page.reload(wait_until="domcontentloaded")
            expect(page.locator("#selectedTitle")).to_contain_text("Snowmen")
            # Local Story source must load and retain stable IDs even with HTTPS blocked.
            page.goto(base+"atlas-completion.html",wait_until="domcontentloaded")
            source=page.evaluate("async()=>{const x=await window.JuraSources.load('story');return {bundled:x.bundled,count:x.records.length,spaceship:x.records.filter(r=>r.collectionType==='Spaceship Part').length,ids:new Set(x.records.map(r=>r.id)).size,scope:x.records.every(r=>r.scope==='story')}}")
            assert source=={"bundled":True,"count":275,"spaceship":50,"ids":275,"scope":True},source
            # Main map backup merge: preserve existing private pins, progress and route order,
            # restore missing collectible/vehicle types, and reject cross-world route stops.
            page.goto(base+"atlas-online.html",wait_until="domcontentloaded")
            page.evaluate("""() => {
              localStorage.setItem('team-jura-atlas-v41-pins',JSON.stringify([{id:'user-5-qa-1',game:'5',scope:'online',category:'vehicle',name:'Current vehicle',x:30,y:40}]));
              localStorage.setItem('jura3-progress',JSON.stringify({'online:user-5-qa-1':true}));
              localStorage.setItem('jura-atlas-routes',JSON.stringify({'5':[],'6':[],online:['user-5-qa-1']}));
              localStorage.setItem('jura58-route-starts',JSON.stringify({online:{x:30,y:40,name:'Current start'}}));
            }""")
            page.reload(wait_until="domcontentloaded")
            page.wait_for_function("typeof window.JuraDualLegendAPI?.state==='function'",timeout=15000)
            map_backup={"version":58,"progress":{"online:user-5-qa-1":False,"online:user-5-qa-2":True},"favorites":{},"personal":[
              {"id":"user-5-qa-1","game":"5","scope":"online","category":"user","name":"Older version","x":1,"y":2},
              {"id":"user-5-qa-2","game":"5","scope":"online","category":"collectible","name":"Restored pickup","x":50,"y":60},
              {"id":"user-6-qa-3","game":"6","scope":"story","category":"vehicle","name":"Leonida private vehicle","x":80,"y":90},
              {"id":"gtadb-5-L1","game":"5","scope":"online","name":"Wrong canonical id","x":0,"y":0}],
              "routes":{"online":["user-5-qa-2","user-6-qa-3","user-5-qa-1"],"6":["user-6-qa-3","user-5-qa-1"]},
              "routeStarts":{"online":{"x":1,"y":2,"name":"Old start"}}}
            page.once("dialog",lambda dialog:dialog.accept())
            page.locator("#importFile").set_input_files({"name":"map.json","mimeType":"application/json","buffer":json.dumps(map_backup).encode()})
            page.wait_for_function("JSON.parse(localStorage.getItem('team-jura-atlas-v41-pins')).length===3",timeout=15000)
            restored=page.evaluate("""() => ({pins:JSON.parse(localStorage.getItem('team-jura-atlas-v41-pins')),progress:JSON.parse(localStorage.getItem('jura3-progress')),routes:JSON.parse(localStorage.getItem('jura-atlas-routes')),starts:JSON.parse(localStorage.getItem('jura58-route-starts'))})""")
            assert restored["pins"][0]["name"]=="Current vehicle"
            assert restored["pins"][1]["category"]=="collectible" and restored["pins"][2]["scope"]=="vi"
            assert restored["progress"]["online:user-5-qa-1"] is True and restored["progress"]["online:user-5-qa-2"] is True
            assert restored["routes"]["online"]==["user-5-qa-1","user-5-qa-2"] and restored["routes"]["6"]==["user-6-qa-3"]
            assert restored["starts"]["online"]["name"]=="Current start"
            # A synthetic, local-only source pack tests temporary event focus without
            # introducing any claimed real game coordinates into the published catalog.
            page.goto(base+"atlas-online.html",wait_until="domcontentloaded")
            page.evaluate("""() => {
              localStorage.setItem('jura-atlas-v5-packs',JSON.stringify({qa:{records:[
                {id:'qa-event-only',game:'5',scope:'online',x:100,y:100,name:'Gun Van QA fixture',category:'activity',source:'QA synthetic fixture',tags:[],uncertain:true},
                {id:'qa-story-only',game:'5',scope:'story',x:101,y:101,name:'Gun Van story QA fixture',category:'activity',source:'QA synthetic fixture',tags:[],uncertain:true}
              ]}}));
              localStorage.setItem('jura101-visible-map-categories-v1',JSON.stringify({'5-story':['landmark'],'5-online':[],'6':['landmark']}));
              localStorage.setItem('jura62-named-layers',JSON.stringify({'5-online':['activity']}));
            }""")
            page.reload(wait_until="domcontentloaded")
            page.wait_for_function("window.JuraAtlasEventLocations?.count(window.JuraConditions.BY_ID['gun-van'])>0",timeout=20000)
            page.locator("#search").fill("my previous search")
            before=page.evaluate("JSON.stringify([localStorage.getItem('jura101-visible-map-categories-v1'),localStorage.getItem('jura62-named-layers')])")
            found=page.evaluate("window.JuraAtlasEventLocations.focus(window.JuraConditions.BY_ID['gun-van']).count")
            assert found>=1
            expect(page.locator("#j232-event-focus-notice")).to_contain_text("Temporary event focus")
            expect(page.locator("#search")).to_have_value("my previous search")
            page.evaluate("window.JuraAtlasEventLocations.refresh()")
            assert page.evaluate("window.JuraAtlasEventLocations.focused()")
            assert page.evaluate("JSON.stringify([localStorage.getItem('jura101-visible-map-categories-v1'),localStorage.getItem('jura62-named-layers')])")==before
            expect(page.locator("#results")).to_contain_text("Gun Van QA fixture")
            expect(page.locator("#results")).not_to_contain_text("Gun Van story QA fixture")
            page.evaluate("window.JuraAtlasEventLocations.clear()")
            expect(page.locator("#j232-event-focus-notice")).to_be_hidden()
            expect(page.locator("#search")).to_have_value("my previous search")
            assert page.evaluate("JSON.stringify([localStorage.getItem('jura101-visible-map-categories-v1'),localStorage.getItem('jura62-named-layers')])")==before
            page.evaluate("localStorage.removeItem('jura-atlas-v5-packs')")
            # Verify the new coverage dashboard uses exact world-specific checklists.
            page.goto(base+"atlas-coverage.html",wait_until="domcontentloaded")
            evidence_rows=page.locator("#j229-collection-rows tr[data-set]")
            expect(evidence_rows).to_have_count(20,timeout=15000)
            page.locator("#j229-collection-world").select_option("story")
            expect(evidence_rows).to_have_count(11)
            expect(page.locator("#j229-collection-status")).to_contain_text("377 numbered reference slots")
            page.locator("#j229-collection-world").select_option("online")
            expect(evidence_rows).to_have_count(9)
            expect(page.locator("#j229-collection-status")).to_contain_text("578 numbered reference slots")
            page.locator("#j229-collection-search").fill("snowmen")
            expect(evidence_rows).to_have_count(1)
            expect(evidence_rows.locator("a").first).to_have_attribute("href","./atlas81-hq.html?collection=online-snowmen#collections")
            # Restore Leonida-only notes with exact IDs, leaving conflicting local notes intact.
            page.goto(base+"atlas90-weapons6.html",wait_until="domcontentloaded")
            expect(page.locator(".viweapon-card")).to_have_count(22,timeout=15000)
            page.evaluate("""() => localStorage.setItem('teamjura-vi-weapon-notes-v1',JSON.stringify({schema:1,notes:{'girardi-es9':'Current note'},seen:{'girardi-es9':true}}))""")
            page.reload(wait_until="domcontentloaded")
            expect(page.locator(".viweapon-card")).to_have_count(22,timeout=15000)
            vi_backup={"schema":1,"app":"team-jura-vi-weapons","scope":"vi","notes":{"girardi-es9":"Do not replace","klose-k17":"Restored field note","unknown":"Ignore"},"seen":{"girardi-es9":False,"klose-k17":True}}
            page.locator("#viWeaponImport").set_input_files({"name":"vi-notes.json","mimeType":"application/json","buffer":json.dumps(vi_backup).encode()})
            expect(page.locator("#viWeaponStatus")).to_contain_text("2 note/review value(s) restored; 1 note conflict(s) kept; 1 invalid entries skipped")
            vi_saved=page.evaluate("JSON.parse(localStorage.getItem('teamjura-vi-weapon-notes-v1'))")
            assert vi_saved["notes"]["girardi-es9"]=="Current note" and vi_saved["seen"]["girardi-es9"] is True
            assert vi_saved["notes"]["klose-k17"]=="Restored field note" and vi_saved["seen"]["klose-k17"] is True
            vi_backup["scope"]="online"
            page.locator("#viWeaponImport").set_input_files({"name":"wrong.json","mimeType":"application/json","buffer":json.dumps(vi_backup).encode()})
            expect(page.locator("#viWeaponStatus")).to_contain_text("Import rejected:")
            page.reload(wait_until="domcontentloaded")
            expect(page.locator('[data-weapon-id="klose-k17"] textarea')).to_have_value("Restored field note",timeout=15000)
            # Check all 14 non-Cayo route workspaces at phone width and a representative
            # set of three other missions at each remaining viewport. Cayo retains its own planner.
            heist_ids=("fleeca","prison-break","humane-labs","series-a","pacific-standard","doomsday-act-1","doomsday-act-2","doomsday-act-3","diamond-casino","cluckin-bell","salvage-yard","auto-shop","agency-vip","kortz-center")
            for heist in heist_ids if width==390 else ("fleeca","diamond-casino","kortz-center"):
                print(f"Checking {heist} at {width}px",flush=True)
                response=page.goto(base+"heist-"+heist+".html",wait_until="domcontentloaded")
                assert response and response.ok,heist
                rows=page.locator("#j167-heist-map .j167-item")
                expect(rows.first).to_be_visible(timeout=20000)
                for i in (0,1,2):
                    rows.nth(i).click()
                    page.locator(".j167-detail").get_by_role("button",name="+ Add to route",exact=True).click()
                ordered=page.locator(".j227-route-row")
                expect(ordered).to_have_count(3)
                def ids(): return ordered.evaluate_all("rows => rows.map(r => r.dataset.routePoint)")
                initial=ids()
                ordered.nth(2).locator('[data-route-action="start"]').click()
                assert ids()==[initial[2],initial[0],initial[1]]
                ordered.nth(1).locator('[data-route-action="down"]').click()
                assert ids()==[initial[2],initial[1],initial[0]]
                page.get_by_role("button",name="Reverse order",exact=True).click()
                assert ids()==initial
                page.get_by_role("button",name="Nearest next",exact=True).click()
                result=ids()
                assert result[0]==initial[0] and set(result)==set(initial)
                page.reload(wait_until="domcontentloaded")
                expect(ordered).to_have_count(3,timeout=15000)
                assert ids()==result
                notes=page.locator(".j164-notes textarea")
                expect(notes).to_have_count(5,timeout=15000)
                notes.nth(0).fill("Existing private approach")
                restore={"schema":"teamjura-heist-plan-v1","heist":heist,"notes":{"approach":"Do not overwrite","entry":"Restored private entry"}}
                page.locator(".j228-import input").set_input_files({"name":"mission.json","mimeType":"application/json","buffer":json.dumps(restore).encode()})
                expect(page.locator(".j164-notes [role=status]")).to_contain_text("1 field(s) restored; 1 saved field(s) preserved.")
                expect(notes.nth(0)).to_have_value("Existing private approach")
                expect(notes.nth(1)).to_have_value("Restored private entry")
                restore["heist"]="another-mission"
                page.locator(".j228-import input").set_input_files({"name":"wrong.json","mimeType":"application/json","buffer":json.dumps(restore).encode()})
                expect(page.locator(".j164-notes [role=status]")).to_contain_text("Import rejected:")
                assert ids()==result
                page.reload(wait_until="domcontentloaded")
                expect(notes.nth(1)).to_have_value("Restored private entry",timeout=15000)
                if width==390:
                    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 2"),heist
            assert not errors, errors
            page.close()
            print(f"PASS portraits, history and database navigation at {width}px", flush=True)
        browser.close()
    server.shutdown()
