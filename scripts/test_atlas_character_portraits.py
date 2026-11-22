"""Run against deployed-format files or a local Atlas source directory."""
import json
import os
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

root = Path(os.environ.get("ATLAS_TEST_ROOT", "public")).resolve()

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

with ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=root)) as server:
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}/"
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="msedge" if os.getenv("ATLAS_BROWSER") == "msedge" else None,
                                     executable_path=os.getenv("ATLAS_CHROME_PATH"))
        for width in (375, 390, 1440):
            page = browser.new_page(reduced_motion="reduce", viewport={"width": width, "height": 812})
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.route("https://**/*", lambda route: route.abort())
            page.goto(base + "atlas-characters.html", wait_until="domcontentloaded")
            concepts = page.locator("#j222-character-grid img[src*='jura221-']")
            # Lazy reference images request their fallback once they enter the viewport.
            cards = page.locator(".j222-character-card")
            expect(cards.first).to_be_visible()
            for card in cards.all():
                card.scroll_into_view_if_needed()
            expect(concepts).to_have_count(9)
            for img in concepts.all():
                img.scroll_into_view_if_needed()
                img.evaluate("el => el.decode()")
                assert img.evaluate("el => el.naturalWidth === 418 && el.naturalHeight === 418")
            agent = cards.filter(has=page.get_by_role("heading",name="Agent 14",exact=True))
            assert agent.get_attribute("data-j222-world")=="online"
            agent_image=agent.locator('img[src$="elario-agent14-portrait.webp"]')
            agent_image.scroll_into_view_if_needed()
            agent_image.evaluate("el => el.decode()")
            assert agent_image.evaluate("el => el.naturalWidth === 640")
            for slug,scope in (("huang-lee","classic"),("agatha-baker","online"),("bigsmoke","classic")):
                portrait=cards.locator(f'img[src$="elario-{slug}-portrait.webp"]')
                portrait.scroll_into_view_if_needed()
                assert portrait.evaluate("el => el.closest('article').dataset.j222World")==scope
                portrait.evaluate("el => el.decode()")
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
              const markers = [[10,10],[80,80],[11,11]].map(([x,y],i)=>({
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
            page.goto(base + "map-hub.html?game=vc",wait_until="domcontentloaded")
            expect(page.locator("#j98bRouteStops li span")).to_have_count(0)

            page.goto(base + "atlas93-garage.html",wait_until="domcontentloaded")
            page.wait_for_function("Number(document.querySelector('#catalogCount').textContent.replaceAll(',',''))>0")
            backup={"schema":1,"app":"team-jura-atlas93-garage","garage":{"garages":["Main Garage"],"vehicles":{}},
                    "collection":{"owned":{"vehicles5:adder":True},"wishlist":{"vehicles5:zentorno":True}}}
            page.locator("#importGarage").set_input_files({"name":"garage.json","mimeType":"application/json",
                                                          "buffer":json.dumps(backup).encode()})
            expect(page.locator("#garageNotice")).to_have_text("Garage backup restored.")
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
            assert not errors, errors
            page.close()
            print(f"PASS portraits, history and database navigation at {width}px", flush=True)
        browser.close()
    server.shutdown()
