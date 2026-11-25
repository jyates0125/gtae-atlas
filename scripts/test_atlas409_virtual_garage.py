#!/usr/bin/env python3
"""Public reference-first workshops and isolated legacy renderer recovery."""
import json, threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright, expect
R=Path(__file__).resolve().parents[1]
P=R/'public'
E=R/'qa-evidence'/'chromium'
E.mkdir(parents=True,exist_ok=True)
assert (P/'atlas-vehicle-configurator.html').exists()
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
G='team-jura-atlas93-garage-v1'
V='team-jura-atlas101-concept-presets-v1'
VI='team-jura-forge-vi-concept-presets-v1'
O='team-jura-atlas90-collection-v1'
with ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(P))) as server:
    threading.Thread(target=server.serve_forever,daemon=True).start()
    origin=f'http://127.0.0.1:{server.server_port}/'
    with sync_playwright() as pw:
        browser=pw.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        for width in (390,1440):
            ctx=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce')
            ctx.route('https://**/*',lambda route:route.abort())
            p=ctx.new_page()
            p.goto(origin+'atlas-vehicle-configurator.html?model=ellie',wait_until='domcontentloaded')
            expect(p.locator('#modelSelect')).to_have_value('ellie',timeout=30000)
            stage=p.locator('#concept3d')
            expect(stage).to_have_attribute('data-forge-status','reference',timeout=15000)
            expect(stage).to_have_attribute('data-forge-fidelity','reference-only')
            expect(stage.get_by_role('link',name='Open this vehicle in GTADB 3D viewer')).to_have_attribute('href','https://gtadb.net/gta-online/vehicle-configurator/?vehicle=ellie')
            expect(stage.get_by_role('link',name='Open this vehicle in GTADB 3D viewer')).to_have_attribute('referrerpolicy','no-referrer')
            expect(stage.locator('canvas')).to_have_count(0)
            expect(p.locator('#bodyStyle')).to_be_disabled()
            expect(stage.locator('[data-forge-control="wheels"]')).to_have_count(0)
            workshop=stage.locator('[data-forge-control="workshopLivery"]')
            expect(workshop.locator('option')).to_have_count(12)
            workshop.select_option('ellie-black-twin')
            stage.locator('[data-workshop-category="engine"]').select_option('engine-3')
            p.locator('#buildName').fill('Jura Fastback')
            p.locator('#saveBuild').click()
            p.locator('#saveToGarage').click()
            saved=p.evaluate('([g,v,o])=>[JSON.parse(localStorage.getItem(g)),JSON.parse(localStorage.getItem(v)),localStorage.getItem(o)]',[G,V,O])
            assert saved[0]['vehicles']['ellie']['studioDesign']['workshopLivery']=='ellie-black-twin'
            assert saved[0]['vehicles']['ellie']['studioDesign']['workshopOptions']['engine']=='engine-3'
            assert saved[1]['builds']['ellie']['design']['workshopLivery']=='ellie-black-twin'
            assert saved[2] is None, 'A saved build must not mark ownership'
            p.locator('#forgeOwned').click()
            expect(p.locator('#forgeOwned')).to_have_attribute('aria-pressed','true')
            assert p.evaluate('k=>JSON.parse(localStorage.getItem(k)).owned["vehicles5:ellie"]',O) is True
            p.reload(wait_until='domcontentloaded')
            expect(stage.locator('[data-workshop-category="engine"]')).to_have_value('engine-3',timeout=15000)
            expect(stage.locator('[data-forge-control="workshopLivery"]')).to_have_value('ellie-black-twin')
            expect(p.locator('#forgeOwned')).to_have_attribute('aria-pressed','true')
            p.goto(origin+'atlas93-garage.html?addModel=ellie',wait_until='domcontentloaded')
            garage=p.locator('.j99-showroom.j256-forge')
            expect(garage).to_have_attribute('data-forge-status','reference',timeout=30000)
            expect(garage.locator('canvas')).to_have_count(0)
            expect(garage.locator('[data-forge-control="workshopLivery"]')).to_have_value('ellie-black-twin')
            expect(garage.locator('[data-workshop-category="engine"]')).to_have_value('engine-3')
            before=p.evaluate('keys=>keys.map(k=>localStorage.getItem(k))',[G,V,O])
            p.goto(origin+'atlas90-vehicles6.html?q=cheetah+95',wait_until='domcontentloaded')
            link=p.locator('#j90Cards').get_by_role('link',name='Open Leonida Forge')
            expect(link).to_have_count(1,timeout=15000)
            link.click()
            expect(p.locator('#modelSelect')).to_have_value('vi_cheetah95',timeout=15000)
            expect(stage).to_have_attribute('data-forge-status','reference',timeout=15000)
            expect(stage.locator('canvas')).to_have_count(0)
            expect(stage.locator('[data-forge-control="workshopLivery"]')).to_have_count(0)
            p.locator('#buildName').fill('Leonida Wedge')
            p.locator('#saveBuild').click()
            vi=p.evaluate('k=>JSON.parse(localStorage.getItem(k))',VI)
            assert vi['builds']['vi_cheetah95']['design']['workshopOptions']=={}
            assert p.evaluate('keys=>keys.map(k=>localStorage.getItem(k))',[G,V,O])==before
            p.locator('#forgeOwned').click()
            assert p.evaluate('k=>JSON.parse(localStorage.getItem(k)).owned["vehicles6:cheetah-95"]',O) is True
            assert p.evaluate('k=>JSON.parse(localStorage.getItem(k)).owned["vehicles5:ellie"]',O) is True
            p.locator('#j409ViGarage').click()
            expect(p.locator('#forgeCollectionWorld')).to_have_value('vi')
            expect(p.locator('#forgeCollectionKind')).to_have_value('vehicle')
            expect(p.locator('.fc-entry')).to_have_count(1,timeout=15000)
            expect(p.locator('.fc-entry')).to_contain_text('Leonida Wedge')
            stored=p.evaluate('keys=>keys.map(k=>localStorage.getItem(k))',[G,V,VI,O])
            p.locator('.fc-entry').get_by_role('button',name='Review saved build').click()
            live=p.locator('.fc-live-preview .j256-forge')
            expect(live).to_have_attribute('data-forge-status','reference',timeout=15000)
            expect(live.locator('canvas')).to_have_count(0)
            expect(live.locator('img')).to_have_count(1)
            expect(live.get_by_role('link',name='Official Leonida reference gallery')).to_have_attribute('href','https://www.rockstargames.com/VI/media/screenshots')
            assert p.evaluate('keys=>keys.map(k=>localStorage.getItem(k))',[G,V,VI,O])==stored
            p.get_by_role('button',name='Close build preview').click()
            p.locator('#forgeCollectionKind').select_option('garage')
            expect(p.locator('.fc-entry')).to_have_count(1,timeout=15000)
            expect(p.locator('.fc-entry')).to_contain_text('Marked owned')
            assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
            p.goto(origin+'atlas90-vehicles6.html?q=70+ganado',wait_until='domcontentloaded')
            link=p.locator('#j90Cards').get_by_role('link',name='Open Leonida Forge')
            expect(link).to_have_count(1,timeout=15000)
            link.click()
            expect(p.locator('#modelSelect')).to_have_value('vi_ganado70',timeout=15000)
            expect(stage).to_have_attribute('data-forge-status','reference',timeout=15000)
            expect(stage.locator('.j413-tab legend')).to_have_count(6)
            expect(stage.locator('[data-forge-control="workshopLivery"] option')).to_have_count(3)
            expect(stage.locator('[data-workshop-category="hood"]')).to_be_disabled()
            stage.locator('[data-workshop-category="engine"]').select_option('engine-1')
            stage.locator('[data-forge-control="workshopLivery"]').select_option('ganado-vintage')
            p.locator('#buildName').fill('Ganado launch build')
            p.locator('#saveBuild').click()
            vi=p.evaluate('k=>JSON.parse(localStorage.getItem(k))',VI)
            assert vi['builds']['vi_ganado70']['design']['workshopOptions']['engine']=='engine-1'
            assert vi['builds']['vi_ganado70']['design']['workshopLivery']=='ganado-vintage'
            assert 'vi_ganado_retro' not in vi['builds']
            p.reload(wait_until='domcontentloaded')
            expect(stage.locator('[data-workshop-category="engine"]')).to_have_value('engine-1',timeout=15000)
            p.goto(origin+'atlas-vehicle-configurator.html?model=jetmax',wait_until='domcontentloaded')
            expect(p.locator('#modelSelect')).to_have_value('jetmax',timeout=15000)
            expect(stage).to_contain_text('Collection only')
            expect(stage.locator('canvas')).to_have_count(0)
            expect(stage.locator('[data-workshop-category]')).to_have_count(0)
            p.locator('#forgeOwned').click()
            assert p.evaluate('k=>JSON.parse(localStorage.getItem(k)).owned["vehicles5:jetmax"]',O) is True
            ctx.close()
            print(f'PASS public reference workshop {width}: no substitute mesh, documented choices, collection ownership and V/VI isolation',flush=True)
        # Portable preview uses the exact same renderer, no site storage or network.
        demo=browser.new_page(viewport={'width':1440,'height':900})
        demo.route('http://**/*',lambda route:route.abort())
        demo.route('https://**/*',lambda route:route.abort())
        demo.goto((E/'elario-forge-preview.html').as_uri(),wait_until='domcontentloaded')
        expect(demo.locator('#stage')).to_have_attribute('data-forge-status','ready',timeout=15000)
        expect(demo.locator('#stage')).to_have_attribute('data-forge-reflection','active')
        expect(demo.locator('[data-forge-control="workshopLivery"]')).to_have_value('none')
        demo.locator('[data-forge-control="workshopLivery"]').select_option('ellie-white-twin')
        demo.get_by_role('button',name='Preview original stripe interpretation').click()
        demo.locator('#stage canvas').screenshot(path=str(E/'atlas409-portable-ellie.png'))
        demo.locator('#model').select_option('vi_cheetah95')
        expect(demo.locator('#stage')).to_have_attribute('data-forge-fidelity','model-study')
        expect(demo.locator('#stage')).to_have_attribute('data-forge-status','ready')
        expect(demo.locator('[data-forge-control="workshopLivery"]')).to_have_count(0)
        demo.locator('#stage canvas').screenshot(path=str(E/'atlas409-portable-vi.png'))
        print('PASS portable real-source interactive Forge preview with no network',flush=True)
        browser.close()
