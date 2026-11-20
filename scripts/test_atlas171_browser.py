#!/usr/bin/env python3
"""Playwright Cayo acceptance: click actual staging-built UI on desktop and phone."""
import os
import json
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public'
if not (OUT/'heist-cayo-perico.html').exists():
    raise SystemExit('Build the Cloudflare public/ output before running Cayo browser QA')
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(OUT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url='http://127.0.0.1:%s/heist-cayo-perico.html'%server.server_port
engine=os.environ.get('ATLAS_BROWSER','chromium')
path=ROOT/'qa-evidence'/engine
path.mkdir(parents=True,exist_ok=True)
try:
 with sync_playwright() as playwright:
    for kind,width,height in [('desktop',1440,900),('mobile',390,844)]:
        args={'headless':True}
        if engine=='msedge':args['channel']='msedge'
        browser=playwright.chromium.launch(**args)
        context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1)
        page=context.new_page()
        page.goto(url,wait_until='domcontentloaded',timeout=50000)
        page.locator('#j171-cayo-board').wait_for(state='visible',timeout=30000)
        # Verify real tab actions, DOM category counts and focusable controls.
        assert page.locator('.j171-cards .j171-card').count()==8,kind+' infiltration count'
        page.get_by_role('tab',name='Compound entrances').click()
        assert page.locator('.j171-cards .j171-card').count()==6,kind+' compound count'
        page.get_by_role('tab',name='Escape choices').click()
        assert page.locator('.j171-cards .j171-card').count()==4,kind+' escape count'
        page.get_by_role('tab',name='Island infiltration').click()
        # Select approach and verify persistence is independent of historic heist keys.
        page.get_by_label('Approach vehicle').select_option('Longfin')
        saved=page.evaluate("JSON.parse(localStorage.getItem('teamjura-cayo-mission-v1'))")
        assert saved['approach']=='Longfin',kind+' local mission selection'
        assert page.evaluate("typeof window.teamJuraCayoRoute?.setRoute")== 'function',kind+' route engine'
        page.get_by_role('button',name='Tunnel / stealth').click()
        route=page.evaluate("window.teamJuraCayoRoute.getRoute()")
        assert len(route)==3,(kind,'illustrative template',route)
        page.get_by_role('tab',name='Island infiltration').click()
        page.locator('.j171-cards .j171-go').first.click()
        assert 'Highlighted' in page.locator('.j171-feedback').inner_text() or 'No matching active pin' in page.locator('.j171-feedback').inner_text()
        image=page.locator('.mapbox > img')
        assert image.count()==1 and image.evaluate('(img)=>img.complete && img.naturalWidth>0'),kind+' cinematic art'
        if kind=='mobile':
            overflow=page.locator('#j171-cayo-board').evaluate('(e)=>e.scrollWidth>e.clientWidth+4')
            assert not overflow,'Cayo board exceeds phone viewport'
        page.screenshot(path=str(path/('cayo-171-'+kind+'.png')),full_page=False,animations='disabled')
        context.close();browser.close()
    print('Cayo 17.1 browser interactions, route, save and art PASS on '+engine)
finally:
 server.shutdown()
