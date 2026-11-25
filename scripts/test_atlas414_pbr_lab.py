from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright, expect
root=Path(__file__).resolve().parents[1]/'qa-evidence'/'forge-pbr'
with ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root))) as server:
    Thread(target=server.serve_forever,daemon=True).start()
    with sync_playwright() as pw:
        browser=pw.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        for width in (390,1440):
            context=browser.new_context(viewport={'width':width,'height':900},device_scale_factor=1)
            context.route('https://**/*',lambda r:r.abort())
            page=context.new_page()
            page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
            stage=page.locator('#stage')
            expect(stage).to_have_attribute('data-state','ready',timeout=60000)
            assert int(stage.get_attribute('data-triangles'))>=50000
            assert int(stage.get_attribute('data-paint-materials'))>0
            canvas=stage.locator('canvas')
            initial=canvas.screenshot(path=str(root/f'metallic-{width}.png'))
            page.locator('#paint').evaluate("e=>{e.value='#bd252d';e.dispatchEvent(new Event('input'))}")
            painted=canvas.screenshot(path=str(root/f'red-{width}.png'))
            assert painted!=initial
            page.locator('#finish').select_option('matte')
            assert canvas.screenshot()!=painted
            page.locator('#mirror').uncheck()
            matte=canvas.screenshot(path=str(root/f'matte-no-mirror-{width}.png'))
            page.locator('#mirror').check()
            assert canvas.screenshot()!=matte
            page.locator('#view').select_option('rear')
            expect(stage).to_have_attribute('data-camera-view','rear')
            assert canvas.screenshot(path=str(root/f'wedge-rear-{width}.png'))!=matte
            page.locator('#view').select_option('front')
            page.locator('#model').select_option('fastback')
            expect(stage).to_have_attribute('data-state','ready',timeout=60000)
            expect(stage).to_have_attribute('data-asset','fastback')
            assert int(stage.get_attribute('data-triangles'))>53000
            assert 'tevy' in page.locator('#credit').inner_text()
            factory=canvas.screenshot(path=str(root/f'fastback-front-{width}.png'))
            page.locator('#view').select_option('side')
            assert canvas.screenshot(path=str(root/f'fastback-side-{width}.png'))!=factory
            if int(stage.get_attribute('data-paint-materials')):
                page.locator('#paint').evaluate("e=>{e.value='#334455';e.dispatchEvent(new Event('input'))}")
                canvas.screenshot(path=str(root/f'fastback-paint-{width}.png'))
            else:
                expect(page.locator('#paint')).to_be_disabled()
            print('Fastback material channels:',stage.get_attribute('data-material-names'),flush=True)
            page.locator('#model').select_option('wedge')
            expect(stage).to_have_attribute('data-state','ready',timeout=60000)
            expect(stage).to_have_attribute('data-asset','wedge')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
            assert page.evaluate('localStorage.length')==0
            context.close()
            print(f'PASS PBR lab {width}: real GLB, paint, clearcoat, reflection, no storage/network dependencies',flush=True)
        browser.close()
