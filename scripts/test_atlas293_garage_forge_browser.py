#!/usr/bin/env python3
"""Focused Chromium browser test: Garage -> Forge never overwrites stored designs."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

root = Path(__file__).resolve().parents[1]
public = root / 'public'
assert (public / 'atlas-vehicle-configurator.html').exists(), 'Build Cloudflare payload first'

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(public)))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'
garage_key = 'team-jura-atlas93-garage-v1'
forge_key = 'team-jura-atlas101-concept-presets-v1'
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 390, 'height': 844})
        page = context.new_page()
        page.goto(base + '/atlas-dashboard.html', wait_until='domcontentloaded')
        page.evaluate("""([g, f]) => {
            localStorage.setItem(g, JSON.stringify({schema:1,vehicles:{jetmax:{
                paint:'#12ab34',studioName:'My Marina',note:'Dock A',studioBody:'auto'
            }}}));
            localStorage.setItem(f, JSON.stringify({schema:1,builds:{jetmax:{
                model:'jetmax',paint:'#ff0000',name:'Old Forge',note:'Keep me'
            }},variants:{}}));
        }""", [garage_key, forge_key])
        before = page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key])
        page.goto(base + '/atlas-vehicle-configurator.html?model=jetmax&source=garage', wait_until='domcontentloaded')
        expect(page.locator('#modelSelect')).to_have_value('jetmax', timeout=30000)
        expect(page.locator('#paintColor')).to_have_value('#12ab34')
        expect(page.locator('#buildName')).to_have_value('My Marina')
        expect(page.locator('#buildNote')).to_have_value('Dock A')
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before, 'Opening working copy mutated saved data'
        expect(page.locator('#builderStatus')).to_contain_text('saved Garage build')
        page.locator('#saveBuild').click()
        after = page.evaluate("([g,f]) => [localStorage.getItem(g),JSON.parse(localStorage.getItem(f))]", [garage_key, forge_key])
        assert after[0] == before[0], 'Saving Forge should not modify Garage'
        assert after[1]['builds']['jetmax']['paint'] == '#12ab34'
        # The selected model must remain navigable back to its Garage detail on mobile.
        garage_link=page.locator('#addToGarage')
        expect(garage_link).to_have_attribute('href','./atlas93-garage.html?addModel=jetmax')
        for width in (375,390):
            page.set_viewport_size({'width':width,'height':812})
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"), f'Forge horizontal overflow at {width}px'
            assert garage_link.is_visible(),f'Garage return link hidden at {width}px'
        page.set_viewport_size({'width':390,'height':844})
        # Reverse journey: editing in Forge must update only this model's Garage concept.
        page.locator('#buildName').fill('Marina Refit')
        page.locator('#buildNote').fill('New dock')
        page.locator('#saveToGarage').click()
        expect(page.locator('#builderStatus')).to_contain_text('Saved Jetmax concept to My Garage')
        snapshot=page.evaluate("([g,f]) => [JSON.parse(localStorage.getItem(g)),JSON.parse(localStorage.getItem(f))]", [garage_key,forge_key])
        assert snapshot[0]['vehicles']['jetmax']['studioName']=='Marina Refit'
        assert snapshot[0]['vehicles']['jetmax']['note']=='New dock'
        assert snapshot[0]['vehicles']['jetmax']['paint']=='#12ab34'
        assert snapshot[1]==after[1], 'Reverse Garage save must not change Forge presets'
        # Preserve independent ownership/location/plate and other vehicles across the handoff.
        page.evaluate("""g => {const obj=JSON.parse(localStorage.getItem(g));
          Object.assign(obj.vehicles.jetmax,{favorite:true,garage:'Marina',plate:'KEEP'});
          obj.vehicles.sultan={favorite:true,paint:'Graphite'};
          localStorage.setItem(g,JSON.stringify(obj));
        }""",garage_key)
        page.locator('#buildName').fill('Refit Two')
        page.locator('#saveToGarage').click()
        preserved=page.evaluate("g => JSON.parse(localStorage.getItem(g)).vehicles",garage_key)
        assert preserved['jetmax']['favorite'] is True
        assert preserved['jetmax']['garage']=='Marina'
        assert preserved['jetmax']['plate']=='KEEP'
        assert preserved['sultan']=={'favorite':True,'paint':'Graphite'}
        # A second tab must see the latest saved Garage build, not a stale in-memory snapshot.
        second=context.new_page()
        second.goto(base+'/atlas-vehicle-configurator.html?model=jetmax&source=garage',wait_until='domcontentloaded')
        expect(second.locator('#modelSelect')).to_have_value('jetmax',timeout=30000)
        expect(second.locator('#buildName')).to_have_value('Refit Two')
        expect(second.locator('#paintColor')).to_have_value('#12ab34')
        second.locator('#buildNote').fill('From second tab')
        second.locator('#saveToGarage').click()
        expect(second.locator('#builderStatus')).to_contain_text('Saved Jetmax concept to My Garage')
        assert page.evaluate("g => JSON.parse(localStorage.getItem(g)).vehicles.jetmax.note",garage_key)=='From second tab'
        # First tab must preserve changes made by the second tab when it saves again.
        page.locator('#buildName').fill('Refit Three')
        page.locator('#saveToGarage').click()
        assert page.evaluate("g => JSON.parse(localStorage.getItem(g)).vehicles.jetmax.studioName",garage_key)=='Refit Three'
        assert page.evaluate("g => JSON.parse(localStorage.getItem(g)).vehicles.sultan.favorite",garage_key) is True
        second.close()
        preserved=page.evaluate("g => JSON.parse(localStorage.getItem(g)).vehicles",garage_key)
        # New vehicle records must not automatically mark a vehicle owned or wished for.
        page.evaluate("g => {const x=JSON.parse(localStorage.getItem(g));delete x.vehicles.jetmax;localStorage.setItem(g,JSON.stringify(x))}",garage_key)
        registry_before=page.evaluate("() => localStorage.getItem('team-jura-atlas90-collection-v1')")
        page.locator('#saveToGarage').click()
        fresh=page.evaluate("g => JSON.parse(localStorage.getItem(g)).vehicles",garage_key)
        assert fresh['jetmax']['studioName']=='Refit Three'
        assert 'owned' not in fresh['jetmax'] and 'wishlist' not in fresh['jetmax']
        assert fresh['sultan']=={'favorite':True,'paint':'Graphite'}
        # A Garage build is a private concept, never a purchase or ownership assertion.
        assert page.evaluate("() => localStorage.getItem('team-jura-atlas90-collection-v1')")==registry_before
        preserved=fresh
        # Corrupt Garage JSON must be preserved byte-for-byte; a save must fail safely.
        page.evaluate("g => localStorage.setItem(g, '{broken-json')",garage_key)
        page.locator('#saveToGarage').click()
        expect(page.locator('#builderStatus')).to_contain_text('Garage was not changed')
        assert page.evaluate("g => localStorage.getItem(g)",garage_key)=='{broken-json'
        # An invalid vehicle record must also fail without silently wiping unrelated data.
        page.evaluate("""g => localStorage.setItem(g,JSON.stringify({
          schema:1,vehicles:{jetmax:'invalid',sultan:{favorite:true}}
        }))""",garage_key)
        invalid_before=page.evaluate("g => localStorage.getItem(g)",garage_key)
        page.locator('#saveToGarage').click()
        expect(page.locator('#builderStatus')).to_contain_text('Existing vehicle record is invalid')
        assert page.evaluate("g => localStorage.getItem(g)",garage_key)==invalid_before
        # Restore the valid snapshot for GTA VI isolation.
        page.evaluate("([g,v]) => localStorage.setItem(g,JSON.stringify(v))",[garage_key,{'schema':1,'vehicles':preserved}])
        # VI must not expose the GTA V Garage write control.
        page.goto(base+'/atlas-vehicle-configurator.html?world=vi',wait_until='domcontentloaded')
        expect(page.locator('#saveToGarage')).to_be_hidden()
        assert page.evaluate("g => JSON.parse(localStorage.getItem(g)).vehicles.jetmax.studioName",garage_key)=='Refit Three'
        context.close()
        browser.close()
finally:
    server.shutdown()
print('Atlas 29.3 browser handoff and non-destructive save passed')
