#!/usr/bin/env python3
"""Original WebGL model customization and isolated V/VI garage handoff."""
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
            p.on('console',lambda msg: print(msg.text,flush=True) if '[Forge renderer]' in msg.text else None)
            p.on('pageerror',lambda error: print('PAGE ERROR:',error,flush=True))
            p.goto(origin+'atlas-vehicle-configurator.html?model=ellie',wait_until='domcontentloaded')
            expect(p.locator('#modelSelect')).to_have_value('ellie',timeout=30000)
            stage=p.locator('#concept3d')
            expect(stage).to_have_attribute('data-forge-status','ready',timeout=15000)
            expect(stage).to_have_attribute('data-forge-fidelity','model-study')
            assert 'fastback' in stage.inner_text().lower()
            initial=int(stage.get_attribute('data-forge-triangles'))
            stage.locator('[data-forge-control="wheels"]').select_option('mesh')
            assert int(stage.get_attribute('data-forge-triangles'))!=initial
            stage.locator('[data-forge-control="rim"]').select_option('gold')
            stage.locator('[data-forge-control="stripe"]').select_option('dual')
            workshop=stage.locator('[data-forge-control="workshopLivery"]')
            expect(workshop.locator('option')).to_have_count(12)
            workshop.select_option('ellie-black-twin')
            stage.get_by_role('button',name='Preview original stripe interpretation').click()
            expect(stage.locator('[data-forge-control="accent"]')).to_have_value('#111111')
            baseline=stage.locator('canvas').screenshot()
            workshop.select_option('ellie-white-twin')
            stage.get_by_role('button',name='Preview original stripe interpretation').click()
            expect(stage.locator('[data-forge-control="accent"]')).to_have_value('#f4f4f4')
            assert stage.locator('canvas').screenshot()!=baseline
            workshop.select_option('ellie-8')
            expect(stage.get_by_role('button',name='Preview original stripe interpretation')).to_be_disabled()
            workshop.select_option('ellie-black-twin')
            stage.get_by_role('button',name='Preview original stripe interpretation').click()
            stage.locator('[data-workshop-category="engine"]').select_option('engine-3')
            expect(stage.locator('[data-forge-control="livery"]')).to_have_count(0)
            p.locator('#paintColor').evaluate("(el)=>{el.value='#30323a';el.dispatchEvent(new Event('input',{bubbles:true}))}")
            p.locator('#buildName').fill('Jura Fastback')
            p.locator('#saveBuild').click()
            p.locator('#saveToGarage').click()
            saved=p.evaluate('([g,v,o])=>[JSON.parse(localStorage.getItem(g)),JSON.parse(localStorage.getItem(v)),localStorage.getItem(o)]',[G,V,O])
            assert saved[0]['vehicles']['ellie']['studioDesign']['wheels']=='mesh'
            assert saved[0]['vehicles']['ellie']['studioDesign']['stripe']=='dual'
            assert saved[1]['builds']['ellie']['design']['rim']=='gold'
            assert saved[0]['vehicles']['ellie']['studioDesign']['livery']=='none'
            assert saved[0]['vehicles']['ellie']['studioDesign']['workshopLivery']=='ellie-black-twin'
            assert saved[0]['vehicles']['ellie']['studioDesign']['workshopOptions']['engine']=='engine-3'
            assert saved[2] is None, 'Concept must not mark GTA ownership'
            p.reload(wait_until='domcontentloaded')
            expect(stage.locator('[data-forge-control="stripe"]')).to_have_value('dual',timeout=15000)
            expect(stage).to_have_attribute('data-forge-renderer','lit-reflective')
            expect(stage).to_have_attribute('data-forge-reflection','active')
            image=p.locator('#concept3d canvas')
            reflected=image.screenshot(path=str(E/f'atlas409-ellie-{width}.png'))
            reflect=stage.locator('[data-forge-control="reflection"]')
            reflect.uncheck()
            expect(stage).to_have_attribute('data-forge-reflection','off')
            matte=image.screenshot(path=str(E/f'atlas409-ellie-no-reflection-{width}.png'))
            assert reflected!=matte,'Actual rendered reflection toggle must change canvas pixels'
            reflect.check()
            expect(stage).to_have_attribute('data-forge-reflection','active')
            p.goto(origin+'atlas93-garage.html?addModel=ellie',wait_until='domcontentloaded')
            garage=p.locator('.j99-showroom.j256-forge')
            expect(garage).to_have_attribute('data-forge-status','ready',timeout=30000)
            expect(garage).to_have_attribute('data-forge-reflection','active')
            expect(garage.locator('[data-forge-control="wheels"]')).to_have_value('mesh')
            expect(garage.locator('[data-forge-control="stripe"]')).to_have_value('dual')
            expect(garage.locator('[data-forge-control="workshopLivery"]')).to_have_value('ellie-black-twin')
            expect(garage.locator('[data-workshop-category="engine"]')).to_have_value('engine-3')
            garage.locator('canvas').screenshot(path=str(E/f'atlas409-my-garage-{width}.png'))
            before=p.evaluate('keys=>keys.map(k=>localStorage.getItem(k))',[G,V,O])
            p.goto(origin+'atlas90-vehicles6.html?q=cheetah+95',wait_until='domcontentloaded')
            link=p.locator('#j90Cards').get_by_role('link',name='Open Leonida Forge')
            expect(link).to_have_count(1,timeout=15000)
            link.click()
            expect(p.locator('#modelSelect')).to_have_value('vi_cheetah95',timeout=15000)
            expect(stage).to_have_attribute('data-forge-status','ready',timeout=15000)
            expect(stage).to_have_attribute('data-forge-fidelity','model-study')
            stage.locator('[data-forge-control="wheels"]').select_option('deepdish')
            stage.locator('[data-forge-control="stripe"]').select_option('single')
            expect(stage.locator('[data-forge-control="workshopLivery"]')).to_have_count(0)
            expect(stage.get_by_text('GTA VI workshop: release-era shop research',exact=False)).to_be_visible()
            p.locator('#buildName').fill('Leonida Wedge')
            p.locator('#saveBuild').click()
            vi=p.evaluate('k=>JSON.parse(localStorage.getItem(k))',VI)
            assert vi['builds']['vi_cheetah95']['design']['wheels']=='deepdish'
            assert vi['builds']['vi_cheetah95']['design']['workshopLivery']=='none'
            assert vi['builds']['vi_cheetah95']['design']['workshopOptions']=={}
            assert p.evaluate('keys=>keys.map(k=>localStorage.getItem(k))',[G,V,O])==before
            p.locator('#concept3d canvas').screenshot(path=str(E/f'atlas409-leonida-{width}.png'))
            p.locator('#j409ViGarage').click()
            expect(p.locator('#forgeCollectionWorld')).to_have_value('vi')
            expect(p.locator('#forgeCollectionKind')).to_have_value('vehicle')
            expect(p.locator('.fc-entry')).to_have_count(1,timeout=15000)
            expect(p.locator('.fc-entry')).to_contain_text('Leonida Wedge')
            stored=p.evaluate('keys=>keys.map(k=>localStorage.getItem(k))',[G,V,VI,O])
            p.locator('.fc-entry').get_by_role('button',name='View saved 3D model').click()
            live=p.locator('.fc-live-preview .j256-forge')
            expect(live).to_have_attribute('data-forge-status','ready',timeout=15000)
            expect(live).to_have_attribute('data-forge-reflection','active')
            expect(live.locator('[data-forge-control="wheels"]')).to_have_value('deepdish')
            expect(live.locator('[data-forge-control="workshopLivery"]')).to_have_count(0)
            live.locator('[data-forge-control="stripe"]').select_option('dual')
            assert p.evaluate('keys=>keys.map(k=>localStorage.getItem(k))',[G,V,VI,O])==stored
            p.get_by_role('button',name='Close 3D preview').click()
            expect(p.locator('.fc-live-preview')).to_be_hidden()
            assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
            # The new released-game Ganado remains distinct from the bonus Retro Build.
            p.goto(origin+'atlas90-vehicles6.html?q=70+ganado',wait_until='domcontentloaded')
            link=p.locator('#j90Cards').get_by_role('link',name='Open Leonida Forge')
            expect(link).to_have_count(1,timeout=15000)
            link.click()
            expect(p.locator('#modelSelect')).to_have_value('vi_ganado70',timeout=15000)
            expect(stage).to_have_attribute('data-forge-status','ready',timeout=15000)
            expect(stage).to_have_attribute('data-forge-fidelity','model-study')
            expect(stage.locator('.j413-tab legend')).to_have_count(6)
            expect(stage.locator('[data-forge-control="workshopLivery"] option')).to_have_count(3)
            expect(stage.locator('[data-workshop-category="hood"]')).to_be_disabled()
            stage.locator('[data-workshop-category="engine"]').select_option('engine-1')
            stage.locator('[data-forge-control="workshopLivery"]').select_option('ganado-vintage')
            stage.get_by_role('button',name='Preview original stripe interpretation').click()
            p.locator('#buildName').fill('Ganado launch build')
            p.locator('#saveBuild').click()
            vi=p.evaluate('k=>JSON.parse(localStorage.getItem(k))',VI)
            assert vi['builds']['vi_ganado70']['design']['workshopOptions']['engine']=='engine-1'
            assert vi['builds']['vi_ganado70']['design']['workshopLivery']=='ganado-vintage'
            assert 'vi_ganado_retro' not in vi['builds']
            assert p.evaluate('keys=>keys.map(k=>localStorage.getItem(k))',[G,V,O])==before
            p.reload(wait_until='domcontentloaded')
            expect(stage.locator('[data-workshop-category="engine"]')).to_have_value('engine-1',timeout=15000)
            expect(stage.locator('[data-forge-control="workshopLivery"]')).to_have_value('ganado-vintage')
            p.locator('#concept3d canvas').screenshot(path=str(E/f'atlas409-ganado-{width}.png'))
            ctx.close()
            print(f'PASS Atlas 40.9 {width}: actual WebGL, V Garage save/reload, VI isolated save, gallery handoff and collection',flush=True)
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
