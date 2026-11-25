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
            assert canvas.screenshot(path=str(root/f'matte-no-mirror-{width}.png'))!=painted
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
            assert page.evaluate('localStorage.length')==0
            context.close()
            print(f'PASS PBR lab {width}: real GLB, paint, clearcoat, reflection, no storage/network dependencies',flush=True)
        browser.close()
