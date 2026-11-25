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
        page.goto(base + '/atlas-forge-collections.html', wait_until='domcontentloaded')
        expect(page.locator('h1')).to_have_text('MY GARAGE.')
        expect(page.locator('.hero-links a[href="./atlas-vehicle-configurator.html"]')).to_be_visible()
        expect(page.locator('.fc-destinations a[href="./atlas93-garage.html"]')).to_be_visible()
        for width in (390, 1440):
            page.set_viewport_size({'width':width,'height':844})
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"), f'My Garage overflow at {width}px'
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before, 'Opening My Garage hub modified saved data'
        page.set_viewport_size({'width':390,'height':844})
        page.locator('.fc-destinations a[href="./atlas93-garage.html"]').click()
        expect(page.locator('h1')).to_have_text('GARAGE MANAGEMENT.')
        expect(page.locator('.heroactions a[href="./atlas-forge-collections.html"]')).to_be_visible()
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before, 'Opening ownership management modified saved data'
        # The garage front door opens real world-specific divisions, not mock cards.
        page.goto(base + '/atlas-forge-collections.html', wait_until='domcontentloaded')
        divisions=page.locator('#garage-divisions article')
        expect(divisions).to_have_count(7)
        expect(page.locator('#garage-divisions a')).to_have_count(14)
        page.locator('#garage-divisions a[href="./atlas-vehicle-configurator.html?world=vi&division=marine"]').click()
        expect(page.locator('#forgeDivision')).to_have_value('marine')
        expect(page.locator('#forgeModelReferences')).to_have_attribute('href','./atlas-credits.html#forge-model-references-vi')
        expect(page.locator('#forgeModelReferences')).to_have_text('GTA VI vehicle model research')
        expect(page.locator('#modelSelect option[value="vi_squalo"]')).to_have_count(1,timeout=30000)
        expect(page.locator('#modelSelect option[value="vi_crest_kayak"]')).to_have_count(1)
        assert all(x.startswith('vi_') for x in page.locator('#modelSelect option').evaluate_all('(rows)=>rows.map(x=>x.value)'))
        expect(page.locator('#forgeDivision option[value="hsw"]')).to_have_count(0)
        expect(page.locator('#forgeDivision option[value="bennys"]')).to_have_count(0)
        page.goto(base + '/atlas-forge-collections.html',wait_until='domcontentloaded')
        page.locator('#garage-specialist-workshops a[href="./atlas-vehicle-configurator.html?division=hsw"]').click()
        expect(page.locator('#forgeDivision')).to_have_value('hsw')
        expect(page.locator('#forgeModelReferences')).to_have_attribute('href','./atlas-credits.html#forge-model-references-online')
        expect(page.locator('#forgeModelReferences')).to_have_text('GTA Online 3D model references')
        expect(page.locator('#modelSelect option')).to_have_count(31,timeout=30000)
        page.locator('#modelSelect').select_option('banshee')
        expect(page.locator('#concept3d [data-workshop-category="hsw-conversion"]')).to_be_visible()
        expect(page.locator('#concept3d [data-workshop-category="bennys-conversion"]')).to_be_visible()
        page.locator('#forgeDivision').select_option('bennys')
        expect(page.locator('#modelSelect option')).to_have_count(61)
        page.locator('#modelSelect').select_option('banshee2')
        expect(page.locator('#concept3d')).to_contain_text('distinct vehicle and ownership record')
        expect(page.locator('#concept3d [data-workshop-category="hsw-conversion"]')).to_have_count(0)
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before, 'Specialist browsing modified saved data'
        # World-specific external references are ordinary links, not embedded mesh requests.
        page.goto(base + '/atlas-credits.html#forge-model-references-online', wait_until='domcontentloaded')
        expect(page.locator('#forge-model-references-online a[href="https://gtadb.net/gta-online/vehicle-configurator/"]')).to_have_attribute('rel','noopener noreferrer')
        expect(page.locator('#forge-model-references-vi a[href="https://gtadb.net/gta-6/vehicles/"]')).to_have_attribute('rel','noopener noreferrer')
        expect(page.locator('#forge-model-references-vi a[href="https://gtascoop.com/wiki/vehicles/"]')).to_have_attribute('rel','noopener noreferrer')
        expect(page.locator('#forge-model-references iframe')).to_have_count(0)
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before, 'External source browsing modified saved data'
        # Released VI-specific candidates are not substituted with GTA V records.
        page.goto(base + '/atlas-vehicle-configurator.html?world=vi&model=vi_bison_3800',wait_until='domcontentloaded')
        expect(page.locator('#modelSelect')).to_have_value('vi_bison_3800',timeout=30000)
        expect(page.locator('#referenceTitle')).to_have_text('Bravado Bison 3800')
        expect(page.locator('#referenceNote a')).to_have_attribute('href','https://www.gtabase.com/gta-6/vehicles/comparison/?vehicle1=bison-3800')
        expect(page.locator('#modelSelect option[value="vi_bison"]')).to_have_count(1)
        expect(page.locator('#modelSelect option[value="vi_bison_900_95"]')).to_have_count(1)
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before, 'VI variant research modified GTA V saves'
        page.goto(base + '/atlas-vehicle-configurator.html?world=vi&model=vi_tailgater_s',wait_until='domcontentloaded')
        expect(page.locator('#modelSelect')).to_have_value('vi_tailgater_s',timeout=30000)
        expect(page.locator('#referenceTitle')).to_have_text('Obey Tailgater S')
        expect(page.locator('#referenceNote a')).to_have_attribute('href','https://gta6motors.com/vehicles/')
        expect(page.locator('#modelSelect option[value="vi_tailgater"]')).to_have_count(1)
        expect(page.locator('#modelSelect option[value="vi_baller_st_d"]')).to_have_count(1)
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before, 'VI roster research modified GTA V saves'
        page.goto(base + '/atlas-vehicle-configurator.html?world=vi&model=vi_bison_1800',wait_until='domcontentloaded')
        expect(page.locator('#modelSelect')).to_have_value('vi_bison_1800',timeout=30000)
        expect(page.locator('#referenceTitle')).to_have_text('Bravado Bison 1800')
        expect(page.locator('#referenceNote a')).to_have_attribute('href','https://gtascoop.com/wiki/vehicles/')
        expect(page.locator('#modelSelect option[value="vi_bison_1800_police"]')).to_have_count(1)
        expect(page.locator('#modelSelect option[value="vi_bison_3800"]')).to_have_count(1)
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before, 'VI expanded roster modified GTA V saves'
        # Official named and media references remain separate in both gallery and Forge.
        page.goto(base + '/atlas90-vehicles6.html?evidence=official-named',wait_until='domcontentloaded')
        expect(page.locator('#j90Evidence')).to_have_value('official-named')
        expect(page.locator('#j90Cards [data-evidence="official-named"]')).to_have_count(5,timeout=30000)
        page.locator('#j90Evidence').select_option('official-media')
        expect(page.locator('#j90Cards [data-evidence="official-media"]')).to_have_count(3)
        assert page.evaluate("new URL(location.href).searchParams.get('evidence')")== 'official-media'
        page.locator('#j408ClearFilters').click()
        expect(page.locator('#j90Evidence')).to_have_value('all')
        assert page.evaluate("!new URL(location.href).searchParams.has('evidence')")
        page.goto(base + '/atlas-vehicle-configurator.html?world=vi&division=evidence-official-media',wait_until='domcontentloaded')
        expect(page.locator('#forgeDivision')).to_have_value('evidence-official-media')
        expect(page.locator('#modelSelect option')).to_have_count(3,timeout=30000)
        expect(page.locator('#modelSelect option[value="vi_enduro"]')).to_have_text('Dinka Enduro')
        page.locator('#forgeDivision').select_option('evidence-official-named')
        expect(page.locator('#modelSelect option')).to_have_count(5)
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before
        # Source-specific workshop choices must not bleed into another model.
        page.goto(base + '/atlas-vehicle-configurator.html?model=zentorno',wait_until='domcontentloaded')
        expect(page.locator('#concept3d [data-workshop-category="exhaust"]')).to_be_visible(timeout=30000)
        expect(page.locator('#concept3d a[href="./atlas-credits.html#forge-vehicle-workshop-expansion-3"]')).to_have_count(1)
        page.locator('#modelSelect').select_option('kuruma')
        expect(page.locator('#concept3d [data-workshop-category="spoiler"]')).to_be_visible()
        expect(page.locator('#concept3d [data-workshop-category="rear-bumper"]')).to_have_count(0)
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before
        page.locator('#forgeDivision').select_option('documented-workshops')
        for model in ['elegy2','sultan','bati','gauntlet','feltzer','infernus']:
            expect(page.locator('#modelSelect option[value="'+model+'"]')).to_have_count(1)
        page.locator('#modelSelect').select_option('bati')
        expect(page.locator('#concept3d [data-workshop-category="engine"]')).to_be_visible()
        expect(page.locator('#concept3d [data-workshop-category="suspension"]')).to_have_count(0)
        expect(page.locator('#concept3d a[href="./atlas-credits.html#forge-vehicle-workshop-expansion-4"]')).to_have_count(1)
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before
        page.goto(base + '/atlas-vehicle-configurator.html?world=vi&division=acquisition-water-temporary&model=vi_squalo',wait_until='domcontentloaded')
        expect(page.locator('#forgeDivision')).to_have_value('acquisition-water-temporary')
        expect(page.locator('#modelSelect option')).to_have_count(12,timeout=30000)
        expect(page.locator('#modelSelect option[value="vi_como"]')).to_have_count(1)
        expect(page.locator('#concept3d [data-vi-acquisition="water-temporary"]')).to_contain_text('no normal registration reported')
        expect(page.locator('#concept3d')).to_contain_text('Ultimate Edition')
        page.locator('#forgeDivision').select_option('acquisition-air-temporary')
        expect(page.locator('#modelSelect option')).to_have_count(17)
        expect(page.locator('#modelSelect option[value="vi_mallard"]')).to_have_count(1)
        page.locator('#modelSelect').select_option('vi_maverick')
        expect(page.locator('#concept3d [data-vi-acquisition="air-temporary"]')).to_contain_text('temporary aircraft use')
        page.locator('#forgeDivision').select_option('acquisition-road-review')
        page.locator('#modelSelect').select_option('vi_bati_801')
        expect(page.locator('#concept3d [data-vi-acquisition="road-review"]')).to_contain_text('Chapter 2')
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before
        # New acquisition views preserve ownership and legacy builds.
        page.goto(base + '/atlas-vehicle-configurator.html?world=vi&division=returning&model=vi_cheetah95',wait_until='domcontentloaded')
        expect(page.locator('#forgeDivision')).to_have_value('returning')
        expect(page.locator('#modelSelect option')).to_have_count(68,timeout=30000)
        expect(page.locator('#modelSelect')).to_have_value('vi_cheetah95')
        expect(page.locator('#concept3d')).to_contain_text('Related vehicle family')
        expect(page.locator('#concept3d')).to_contain_text('Ultimate Edition claim guide')
        expect(page.locator('#concept3d a[href="https://support.rockstargames.com/articles/1tnvcdbUMG0v1yJ1SVn0WU/claiming-ultimate-edition-bonuses-in-grand-theft-auto-vi"]')).to_have_count(1)
        # Empty searches must remove stale model/variant URL state without changing saves.
        page.evaluate("() => {const u=new URL(location.href);u.searchParams.set('variant','Old design');u.hash='variant=Old%20design';history.replaceState(null,'',u)}")
        page.locator('#modelSearch').fill('no-such-vehicle-453')
        expect(page.locator('#modelSelect')).to_have_value('')
        expect(page.locator('#forgeOwned')).to_be_disabled()
        assert page.evaluate("() => {const u=new URL(location.href);return u.searchParams.get('world')==='vi'&&u.searchParams.get('division')==='returning'&&!u.searchParams.has('model')&&!u.searchParams.has('variant')&&!u.hash}")
        page.locator('#modelSearch').fill('')
        expect(page.locator('#modelSelect option')).to_have_count(68)
        page.locator('#modelSelect').select_option('vi_cheetah95')
        expect(page.locator('#concept3d')).to_contain_text('Related vehicle family')
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before
        page.locator('#concept3d a[href="./atlas-vehicle-configurator.html?model=cheetah"]').click()
        expect(page.locator('#modelSelect')).to_have_value('cheetah',timeout=30000)
        expect(page.locator('#concept3d')).to_contain_text('Related vehicle family')
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before
        page.goto(base + '/atlas-vehicle-configurator.html?division=pegasus',wait_until='domcontentloaded')
        expect(page.locator('#forgeDivision')).to_have_value('pegasus')
        expect(page.locator('#modelSelect option')).to_have_count(17,timeout=30000)
        page.locator('#modelSelect').select_option('jetmax')
        expect(page.locator('#concept3d')).to_contain_text('Pegasus')
        expect(page.locator('#concept3d select')).to_have_count(0)
        page.locator('#modelSelect').select_option('swift')
        expect(page.locator('#concept3d')).to_contain_text('Personal Aircraft')
        expect(page.locator('#concept3d')).to_contain_text('Elitás Travel')
        expect(page.locator('#concept3d select')).to_have_count(0)
        page.locator('#forgeDivision').select_option('dealer-docktease')
        page.locator('#modelSelect').select_option('dinghy')
        expect(page.locator('#concept3d')).to_contain_text('DockTease')
        expect(page.locator('#concept3d')).to_contain_text('no conventional in-game boat modifications')
        page.locator('#forgeDivision').select_option('warehouse')
        expect(page.locator('#modelSelect option')).to_have_count(8)
        page.locator('#modelSelect').select_option('dune5')
        expect(page.locator('#concept3d')).to_contain_text('Vehicle Warehouse')
        expect(page.locator('#concept3d')).to_contain_text('Not a Pegasus delivery')
        page.locator('#forgeDivision').select_option('dealer-warstock')
        expect(page.locator('#modelSelect option[value="oppressor2"]')).to_have_count(1)
        page.locator('#modelSelect').select_option('oppressor2')
        expect(page.locator('#concept3d')).to_contain_text('Terrorbyte')
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before
        # Inline matcher must retain selections on ordinary daily refreshes.
        page.goto(base + '/atlas-online.html',wait_until='domcontentloaded')
        map_matcher=page.locator('#j87-simeon-map')
        expect(map_matcher.locator('.j87-simeon > summary')).to_have_count(1,timeout=15000)
        expect(map_matcher).not_to_have_attribute('hidden','')
        # DOM interactions here also work when the mobile map drawer is collapsed.
        map_matcher.locator('.j87-simeon > summary').evaluate('(el)=>el.click()')
        map_matcher.locator('input[value="Banshee"]').evaluate('(el)=>el.click()')
        expect(map_matcher.locator('.j87-simeon details')).to_have_count(3)
        page.evaluate("document.dispatchEvent(new Event('visibilitychange'))")
        expect(map_matcher.locator('input[value="Banshee"]')).to_be_checked()
        map_matcher.get_by_role('button',name='Clear selection').evaluate('(el)=>el.click()')
        expect(map_matcher.locator('.j87-simeon details')).to_have_count(8)
        page.goto(base + '/atlas87-daily.html#j87-simeon',wait_until='domcontentloaded')
        page.locator('#j87-simeon .j87-simeon > summary').click()
        for name in ['Banshee','Coquette','Sentinel','Dubsta','Infernus']:
            page.locator('#j87-simeon input[value="'+name+'"]').check()
        expect(page.locator('#j87-simeon [role="status"]')).to_have_text('2 matching list(s)')
        expect(page.locator('#j87-simeon .j87-simeon details')).to_have_count(2)
        page.get_by_role('button',name='Clear selection').click()
        expect(page.locator('#j87-simeon .j87-simeon details')).to_have_count(8)
        expect(page.locator('#j87-member-offers article')).to_have_count(3)
        for width in (390,1440):
            page.set_viewport_size({'width':width,'height':844})
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"), f'Daily page overflow at {width}px'
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before
        page.set_viewport_size({'width':390,'height':844})
        page.goto(base + '/atlas-vehicle-configurator.html?division=motorcycles&model=jetmax',wait_until='domcontentloaded')
        expect(page.locator('#modelSelect')).to_have_value('jetmax',timeout=30000)
        expect(page.locator('#forgeDivision')).to_have_value('all')
        page.locator('#forgeDivision').select_option('marine')
        expect(page.locator('#modelSelect')).to_have_value('jetmax')
        assert 'division=marine' in page.url
        assert page.evaluate("([g,f]) => [localStorage.getItem(g),localStorage.getItem(f)]", [garage_key, forge_key]) == before, 'Division navigation modified existing saves'
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
        # The mobile visitor must be able to reach the bottom controls without a trapped scroll.
        page.locator('#saveToGarage').scroll_into_view_if_needed()
        assert page.locator('#saveToGarage').is_visible()
        assert page.locator('#saveToGarage').evaluate("""el => {
          const r=el.getBoundingClientRect();
          return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth+2;
        }"""), 'Forge save control is clipped or unreachable on phone'
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
        # Actual reverse navigation: the Garage opens the same model with its saved concept.
        garage_page=context.new_page()
        garage_page.goto(base+'/atlas93-garage.html?addModel=jetmax',wait_until='domcontentloaded')
        expect(garage_page.locator('#garageDetails h2').filter(has_text='Jetmax')).to_be_visible(timeout=30000)
        expect(garage_page.locator('[data-forge-handoff="true"]')).to_have_attribute('href','./atlas-vehicle-configurator.html?model=jetmax&source=garage')
        assert garage_page.evaluate("g => JSON.parse(localStorage.getItem(g)).vehicles.jetmax.studioName",garage_key)=='Refit Three'
        assert garage_page.evaluate("g => JSON.parse(localStorage.getItem(g)).vehicles.sultan.favorite",garage_key) is True
        # Concurrent Forge edits to another model must survive a stale Garage tab save.
        page.evaluate("""g => {const x=JSON.parse(localStorage.getItem(g));x.vehicles.adder={paint:'#fa3311',note:'Saved in another tab'};localStorage.setItem(g,JSON.stringify(x))}""",garage_key)
        registry_snapshot=garage_page.evaluate("() => localStorage.getItem('team-jura-atlas90-collection-v1')")
        garage_page.locator('#garageDetails textarea').fill('Garage tab edited after Forge')
        garage_page.locator('#garageDetails button.save').click()
        assert garage_page.evaluate("g => JSON.parse(localStorage.getItem(g)).vehicles.adder.note",garage_key)=='Saved in another tab'
        assert garage_page.evaluate("g => JSON.parse(localStorage.getItem(g)).vehicles.jetmax.note",garage_key)=='Garage tab edited after Forge'
        assert garage_page.evaluate("() => localStorage.getItem('team-jura-atlas90-collection-v1')")==registry_snapshot
        garage_page.locator('[data-forge-handoff="true"]').click()
        expect(garage_page).to_have_url(base+'/atlas-vehicle-configurator.html?model=jetmax&source=garage')
        expect(garage_page.locator('#buildName')).to_have_value('Refit Three',timeout=30000)
        assert garage_page.evaluate("g => JSON.parse(localStorage.getItem(g)).vehicles.sultan.favorite",garage_key) is True
        garage_page.close()
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
