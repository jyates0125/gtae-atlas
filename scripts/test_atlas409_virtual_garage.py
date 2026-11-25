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
            p.locator('#paintColor').evaluate("(el)=>{el.value='#30323a';el.dispatchEvent(new Event('input',{bubbles:true}))}")
            p.locator('#buildName').fill('Jura Fastback')
            p.locator('#saveBuild').click()
            p.locator('#saveToGarage').click()
            saved=p.evaluate('([g,v,o])=>[JSON.parse(localStorage.getItem(g)),JSON.parse(localStorage.getItem(v)),localStorage.getItem(o)]',[G,V,O])
            assert saved[0]['vehicles']['ellie']['studioDesign']['wheels']=='mesh'
            assert saved[0]['vehicles']['ellie']['studioDesign']['stripe']=='dual'
            assert saved[1]['builds']['ellie']['design']['rim']=='gold'
            assert saved[2] is None, 'Concept must not mark GTA ownership'
            p.reload(wait_until='domcontentloaded')
            expect(stage.locator('[data-forge-control="stripe"]')).to_have_value('dual',timeout=15000)
            p.locator('#concept3d canvas').screenshot(path=str(E/f'atlas409-ellie-{width}.png'))
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
            p.locator('#buildName').fill('Leonida Wedge')
            p.locator('#saveBuild').click()
            vi=p.evaluate('k=>JSON.parse(localStorage.getItem(k))',VI)
            assert vi['builds']['vi_cheetah95']['design']['wheels']=='deepdish'
            assert p.evaluate('keys=>keys.map(k=>localStorage.getItem(k))',[G,V,O])==before
            p.locator('#concept3d canvas').screenshot(path=str(E/f'atlas409-leonida-{width}.png'))
            p.locator('#j409ViGarage').click()
            expect(p.locator('#forgeCollectionWorld')).to_have_value('vi')
            expect(p.locator('#forgeCollectionKind')).to_have_value('vehicle')
            expect(p.locator('.fc-entry')).to_have_count(1,timeout=15000)
            expect(p.locator('.fc-entry')).to_contain_text('Leonida Wedge')
            assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
            ctx.close()
            print(f'PASS Atlas 40.9 {width}: actual WebGL, V Garage save/reload, VI isolated save, gallery handoff and collection',flush=True)
        browser.close()
