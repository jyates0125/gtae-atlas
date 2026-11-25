#!/usr/bin/env python3
"""Focused public-route navigation audit; no claims about gameplay or full visual QA."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json, os
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
width = int(os.environ.get("ATLAS_AUDIT_WIDTH", "390"))
height = {390: 844, 820: 1180, 1440: 900}[width]
routes = [item["path"] for item in json.loads((PUBLIC / "atlas132-page-directory.json").read_text())["pages"]]
routes += ["map-hub.html?game=" + game for game in ("vc","iii","vcs","lcs","ctw")]
routes += ["atlas-iv.html?scope=tlad","atlas-iv.html?scope=tbogt","atlas-vi.html?view=rockstar"]
routes = list(dict.fromkeys(routes))
out = ROOT / "qa-evidence" / "atlas391"
out.mkdir(parents=True, exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = ThreadingHTTPServer(("127.0.0.1",0), partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
base = f"http://127.0.0.1:{server.server_port}/"
records, failures = [], []
# Only inspect layout in this test: remote tiles/news/media are not required.
# Record candidate occlusions; an intentionally open overlay or clipped
# scrollable list can produce a candidate and needs human triage.
probe = """() => {
  const result=[];
  function* ancestors(el){for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')yield p}
  const nodes=[...document.querySelectorAll('button:not([disabled]),a[href],summary,input:not([disabled]),select:not([disabled])')];
  for(const el of nodes){
    // Closed native disclosures can return geometry for non-rendered descendants.
    // Exclude those, but retain each disclosure's own visible summary.
    if([...ancestors(el)].some(d=>!d.open&&!d.querySelector(':scope > summary')?.contains(el)))continue;
    if(el.checkVisibility&&!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true,contentVisibilityAuto:true}))continue;
    const r=el.getBoundingClientRect(),s=getComputedStyle(el);
    if(r.width<12||r.height<12||r.left<0||r.top<0||r.right>innerWidth||r.bottom>innerHeight||s.visibility!=='visible'||s.display==='none'||el.closest('[hidden],[aria-hidden=true],[inert]'))continue;
    const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
    if(!hit||el.contains(hit)||hit.contains(el))continue;
    const covering=hit.closest('button,a[href],summary,input,select');
    if(!covering||covering===el)continue;
    const label=e=>({id:e.id||'',text:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,100)});
    result.push({control:label(el),covering:label(covering)});
    if(result.length>=40)break;
  }
  return result;
}"""
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        for route in routes:
            ctx=browser.new_context(viewport={"width":width,"height":height},has_touch=width<900,is_mobile=width==390,reduced_motion="reduce")
            ctx.route("https://**/*",lambda r:r.abort())
            page=ctx.new_page()
            page.set_default_timeout(6500)
            record={"route":route,"width":width}
            try:
                response=page.goto(base+route,wait_until="domcontentloaded",timeout=20000)
                assert response and response.ok, "page HTTP error"
                menu=page.locator("#j132-nav-toggle")
                expect(menu).to_have_count(1)
                expect(menu).to_be_visible()
                record["topCandidates"]=page.evaluate(probe)
                record["horizontalOverflow"]=page.evaluate("Math.max(0,document.documentElement.scrollWidth-innerWidth)")
                menu.scroll_into_view_if_needed()
                # Playwright actionability verifies the control receives pointer input.
                menu.click()
                drawer=page.locator("#j132-nav-drawer")
                expect(drawer).to_be_visible()
                expect(menu).to_have_attribute("aria-expanded","true")
                drawer.locator(".j132-close").click()
                expect(drawer).to_be_hidden()
                expect(menu).to_have_attribute("aria-expanded","false")
                expect(menu).to_be_focused()
                record["menu"]="passed"
                legacy=page.locator("#j89-shell")
                if legacy.count(): expect(legacy).to_be_hidden()
                dock=page.locator("body > #j98-flow")
                if dock.count() and dock.is_visible():
                    assert dock.evaluate("(node)=>getComputedStyle(node).position")!="fixed", "Legacy world dock still floats"
                if route=="atlas-sa.html":
                    maps=page.locator(".j391-inline > a[data-j87-maps-link]")
                    expect(maps).to_be_visible()
                    maps.scroll_into_view_if_needed()
                    maps.click(trial=True)
                if route=="atlas-vi.html":
                    guide=page.locator("#j217-vi-hub")
                    guide.locator(":scope > summary").click()
                    back=page.locator("#j391-guide-back")
                    expect(back).to_be_visible()
                    back.click()
                    assert guide.evaluate("(node)=>!node.open")
                    expect(guide.locator(":scope > summary")).to_be_focused()
                    expand=page.locator("#j171-expand-map")
                    expand.click()
                    expect(expand).to_have_attribute("aria-pressed","true")
                    guide.locator(":scope > summary").click()
                    back.click()
                    assert guide.evaluate("(node)=>!node.open")
                    expand.click()
                    expect(expand).to_have_attribute("aria-pressed","false")
                    record["viGuide"]="passed (normal and expanded)"
                if route=="atlas-vi.html?view=rockstar":
                    official=page.locator("#j143-official-layer")
                    expect(official).to_be_visible()
                    assert page.locator(".zoom").evaluate("(node)=>!!node.closest('[inert]')")
                    official.locator('[data-j143="close"]').click()
                    expect(official).to_be_hidden()
                    assert not page.locator(".zoom").evaluate("(node)=>!!node.closest('[inert]')")
                    record["officialReturn"]="passed"
                if route in ("atlas-dashboard.html","atlas-vi.html"):
                    page.screenshot(path=str(out/f"{width}-{route}.png"),animations="disabled")
            except Exception as exc:
                record["error"]=str(exc)
                failures.append(route)
            finally:
                records.append(record)
                print(json.dumps(record),flush=True)
                ctx.close()
        browser.close()
finally:
    server.shutdown()
    (out/f"audit-{width}.json").write_text(json.dumps(records,indent=2))
assert not failures, f"{width}px: navigation failures {failures}"
print(f"{len(records)} route variants at {width}px: menu actions passed; candidate overlaps require triage")
