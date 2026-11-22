#!/usr/bin/env python3
"""Atlas 29.5: stale-tab Garage save isolation, real Chromium, 390px phone."""
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

root = Path(__file__).resolve().parents[1]
public = root / 'public'
assert (public / 'atlas93-garage.html').is_file(), 'Build the actual Cloudflare payload first'
G = 'team-jura-atlas93-garage-v1'
S = 'team-jura-atlas90-collection-v1'

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(public)))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 390, 'height': 844},
                                      reduced_motion='reduce', accept_downloads=True)
        page = context.new_page()
        page.goto(base + '/atlas-dashboard.html', wait_until='domcontentloaded')
        page.evaluate("""([g,s]) => {
          localStorage.setItem(g, JSON.stringify({schema:1,
            garages:['Main Garage','Spare'],
            vehicles:{jetmax:{paint:'#234567',note:'Harbor A'},sultan:{note:'Original'}}}));
          localStorage.setItem(s, JSON.stringify({schema:1,owned:{'vehicles5:sultan':true},
            wishlist:{'vehicles5:adder':true},note:{'sultan':'Keep personal history'}}));
        }""", [G, S])
        page.goto(base + '/atlas93-garage.html?addModel=jetmax', wait_until='domcontentloaded')
        expect(page.locator('#garageDetails h2').filter(has_text='Jetmax')).to_be_visible(timeout=30000)
        owned = page.locator('#garageDetails input[type=checkbox]').first
        assert not owned.is_checked()

        # A Forge save can finish before a stale Garage tab receives its storage event.
        # Write through the same test page so there is deliberately no storage event.
        page.evaluate("""g => {
          const x=JSON.parse(localStorage.getItem(g));
          x.vehicles.sultan={paint:'#00ffee',note:'Updated by Forge',favorite:true};
          localStorage.setItem(g,JSON.stringify(x));
        }""", G)
        newest_meta = page.evaluate("g => localStorage.getItem(g)", G)
        owned.check()
        assert page.evaluate("g => localStorage.getItem(g)", G) == newest_meta, (
            'Ownership toggle must NEVER rewrite older Garage metadata')
        registry = page.evaluate("s => JSON.parse(localStorage.getItem(s))", S)
        assert registry['owned']['vehicles5:jetmax'] is True
        assert registry['owned']['vehicles5:sultan'] is True
        assert registry['wishlist']['vehicles5:adder'] is True
        assert registry['note']['sultan'] == 'Keep personal history'

        # Download must use the latest stored records, not stale in-memory copies.
        with page.expect_download() as event:
            page.locator('#exportGarage').click()
        saved = json.loads(Path(event.value.path()).read_text(encoding='utf-8'))
        assert saved['garage']['vehicles']['sultan']['note'] == 'Updated by Forge'
        assert saved['collection']['owned']['vehicles5:jetmax'] is True

        # Naming a garage must only modify the garage-name list.
        registry_raw = page.evaluate("s => localStorage.getItem(s)", S)
        page.locator('#newGarage').fill('VIP Garage')
        page.locator('#addGarage').click()
        meta = page.evaluate("g => JSON.parse(localStorage.getItem(g))", G)
        assert 'VIP Garage' in meta['garages']
        assert meta['vehicles']['sultan']['paint'] == '#00ffee'
        assert page.evaluate("s => localStorage.getItem(s)", S) == registry_raw, (
            'Garage-name edit must not rewrite the ownership registry')

        # The list looked empty before a late external Garage assignment.
        page.evaluate("""g => {
          const x=JSON.parse(localStorage.getItem(g));
          x.vehicles.sultan.garage='Spare';
          localStorage.setItem(g,JSON.stringify(x));
        }""", G)
        before_remove = page.evaluate("g => localStorage.getItem(g)", G)
        page.locator('#garageList .location-row').filter(has_text='Spare').locator('button').click()
        expect(page.locator('#garageNotice')).to_contain_text('Move vehicles out of this garage')
        assert page.evaluate("g => localStorage.getItem(g)", G) == before_remove, (
            'Stale-tab deletion must never remove an occupied garage')

        # Preserve a concurrent collection mark when removing the selected model.
        page.evaluate("""s => {
          const x=JSON.parse(localStorage.getItem(s));
          x.owned['vehicles5:adder']=true;
          x.note['adder']='Another tab';
          localStorage.setItem(s,JSON.stringify(x));
        }""", S)
        page.locator('#garageDetails input[type=checkbox]').first.uncheck()
        registry = page.evaluate("s => JSON.parse(localStorage.getItem(s))", S)
        assert 'vehicles5:jetmax' not in registry['owned']
        assert registry['owned']['vehicles5:adder'] is True
        assert registry['owned']['vehicles5:sultan'] is True
        assert registry['note']['adder'] == 'Another tab'
        assert page.evaluate("g => localStorage.getItem(g)", G) == before_remove

        # Corrupt persisted JSON must remain untouched by any subsequent action.
        page.evaluate("g => localStorage.setItem(g,'{damaged-meta')", G)
        page.locator('#newGarage').fill('Do Not Overwrite')
        page.locator('#addGarage').click()
        assert page.evaluate("g => localStorage.getItem(g)", G) == '{damaged-meta'
        expect(page.locator('#garageNotice')).to_contain_text('Garage locations not saved')

        # A backup import must fail closed instead of replacing damaged data.
        backup = {'schema':1,'app':'team-jura-atlas93-garage',
                  'garage':{'garages':['Backup Bay'],'vehicles':{'jetmax':{'paint':'Graphite'}}},
                  'collection':{'owned':{'vehicles5:jetmax':True}}}
        page.locator('#importGarage').set_input_files({
            'name':'garage.json', 'mimeType':'application/json',
            'buffer':json.dumps(backup).encode('utf-8')})
        expect(page.locator('#garageNotice')).to_contain_text('Import rejected')
        assert page.evaluate("g => localStorage.getItem(g)", G) == '{damaged-meta'

        page.evaluate("s => localStorage.setItem(s,'{damaged-collection')", S)
        # The rejected click immediately restores the original checkbox state.
        # Playwright check() waits for it to remain checked and would time out.
        page.locator('#garageDetails input[type=checkbox]').first.click()
        assert page.evaluate("s => localStorage.getItem(s)", S) == '{damaged-collection'
        expect(page.locator('#garageNotice')).to_contain_text('Ownership not saved')
        assert page.evaluate("g => localStorage.getItem(g)", G) == '{damaged-meta'

        # Legacy guest keys may omit wishlist, note or locations. This is
        # recoverable schema evolution, distinct from corrupted JSON.
        page.evaluate("""([g,s]) => {
          localStorage.setItem(g,JSON.stringify({schema:1,vehicles:{jetmax:{paint:'#112233',note:'Legacy model'}}}));
          localStorage.setItem(s,JSON.stringify({schema:1,owned:{'vehicles5:sultan':true}}));
        }""",[G,S])
        page.locator('#garageDetails input[type=checkbox]').first.check()
        legacy_marks=page.evaluate("s => JSON.parse(localStorage.getItem(s))",S)
        assert legacy_marks['owned']['vehicles5:jetmax'] is True
        assert legacy_marks['owned']['vehicles5:sultan'] is True
        assert legacy_marks['wishlist']=={} and legacy_marks['note']=={}
        page.locator('#newGarage').fill('Legacy Bay')
        page.locator('#addGarage').click()
        legacy_meta=page.evaluate("g => JSON.parse(localStorage.getItem(g))",G)
        assert legacy_meta['garages']==['Main Garage','Legacy Bay']
        assert legacy_meta['vehicles']['jetmax']['note']=='Legacy model'
        context.close()
        browser.close()
finally:
    server.shutdown()
print('Atlas 29.5 phone Garage stale-tab ownership/name/export/import isolation passed')
