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
        # The modern site header remains usable, but the old global floating
        # nav must not obstruct Cayo map search or its marker legend.
        assert page.locator('header nav').count()>0,'Primary site navigation is preserved'
        if page.locator('#j89-shell').count():
            assert page.locator('#j89-shell').evaluate("(e)=>getComputedStyle(e).display==='none'"),'Legacy All Pages dock must not cover the Cayo map'
        if page.locator('#j98-flow').count():
            assert page.locator('#j98-flow').evaluate("(e)=>getComputedStyle(e).display==='none'"),'Legacy map dock must not cover Cayo mission controls'
        if page.locator('.j132-nav').count():
            assert page.locator('.j132-nav').evaluate("(e)=>getComputedStyle(e).position!=='fixed'"),'Modern All Pages menu should remain available in page flow, not cover Cayo map'
            assert page.locator('#j132-nav-toggle').count()==1,'All Pages directory remains accessible'
        # Atlas 18 flagship starts in map-first mode; open the linked planning drawer.
        page.locator('#j180-shell').wait_for(state='visible',timeout=30000)
        page.wait_for_function("document.querySelectorAll('.j180-chest').length === 19",timeout=20000)
        page.wait_for_function("['gta-wiki','local-trace'].includes(document.querySelector('#j167-heist-map')?.dataset.mapAsset)",timeout=30000)
        # All map sources now use one Elario SVG marker family. The bare
        # game-map raster was previously showing only yellow chest dots.
        page.locator('#j181-hotspots').wait_for(state='attached')
        marker=page.locator('.j181-hotspot[data-category="entry"]').first
        assert marker.locator('.j183-svg').count()==1,'Game map entry pin requires SVG icon'
        assert page.locator('.j181-hotspot .j183-svg').count()>=50,'All category icons render as real map assets'
        assert marker.evaluate("(e)=>getComputedStyle(e.querySelector('svg')).color!=='rgba(0, 0, 0, 0)'"),'Colored SVG must be visible on primary game map'
        assert marker.evaluate("(e)=>getComputedStyle(e.querySelector('svg')).width !== '0px'"),'SVG must have nonzero visible width'
        assert marker.evaluate("(e)=>getComputedStyle(e,'::after').content==='none'"),'No second glyph should overlay a primary or backup map symbol'
        assert page.locator('.j180-legend-row .j183-svg').count()==14,'Legend shares exact same SVG marker artwork'
        page.get_by_role('button',name='Enhanced',exact=True).click()
        page.wait_for_function("document.querySelector('#j167-heist-map')?.dataset.mapSource==='enhanced'")
        assert marker.locator('.j183-svg').is_visible(),'Enhanced map retains working colorful symbols'
        page.get_by_role('button',name='Game map',exact=True).click()
        page.wait_for_function("document.querySelector('#j167-heist-map')?.dataset.mapSource==='original'",timeout=30000)
        assert page.locator('.j180-chest').count()==19,'All 19 possible chest references render'
        assert page.locator('.j180-legend-row').count()==14,'All 14 interactive marker legend rows render'
        page.locator('#j181-hotspots').wait_for(state='attached',timeout=10000)
        assert page.locator('.j181-hotspot').count()>=50,'Reference colored map icons must have clickable hotspots'
        assert page.locator('.j167-pins').evaluate('(x)=>getComputedStyle(x).display')=='none','Generic heist pins must not be visible in Cayo'
        assert page.locator('.j180-ref-layer').evaluate('(x)=>getComputedStyle(x).display')=='none','Generic misplaced reference pins must be hidden'
        # Full desktop legend stays visible; phone legend is compact by default.
        polish=page.locator('#j185-polish')
        assert polish.count()==1,'Cayo 18.5 polish loaded'
        pan=page.locator('.j185-pan')
        assert pan.count()==1 and pan.get_attribute('aria-pressed')=='false','Pan toggle is discoverable'
        pan.click()
        assert pan.get_attribute('aria-pressed')=='true','Native map move mode turns on'
        assert page.locator('.j167-viewport').evaluate("(e)=>e.style.touchAction")=='none','Pan must capture touch moves'
        pan.click()
        assert pan.get_attribute('aria-pressed')=='false','Pan mode turns back off'
        assert page.locator('.j167-viewport').evaluate("(e)=>e.style.touchAction")=='pan-y','Normal page scrolling restored'
        assert page.locator('.j167-viewport').evaluate("(e)=>abs(e.getBoundingClientRect().width/e.getBoundingClientRect().height-1284/1262)<0.025".replace('abs(', 'Math.abs(')),'Island aspect ratio is preserved'
        if kind=='mobile':
            toggle=page.get_by_role('button',name='Show marker filters')
            assert toggle.count()==1 and toggle.is_visible(),'Compact filter control visible on phone'
            assert page.locator('.j180-legend-rows').is_hidden(),'Phone map starts before expanded filter list'
            toggle.click()
            assert page.locator('.j180-legend-rows').is_visible(),'Phone filters can expand'
        legend=page.locator('.j180-legend-row').filter(has_text='Grappling equipment')
        assert legend.count()==1,'Grappling category must match the legend'
        legend.click()
        assert page.locator('.j181-hotspot[data-category="grapple"]:visible').count()==0,'Legend hides only grappling hotspots'
        legend.click()
        assert page.locator('.j181-hotspot[data-category="grapple"]:visible').count()>0,'Legend restores grappling hotspots'
        # These colorful reference icons are legitimately clustered at the
        # airstrip. Tapping the topmost one must offer the underlying markers.
        page.locator('.j181-hotspot[data-category="control"]').first.click()
        assert page.locator('.j180-pin-info').is_visible(),'Existing colorful source icon click opens map details'
        assert page.locator('.j185-cluster-choices').is_visible(),'Overlapping icons should expose a specific-target picker'
        option=page.locator('.j185-cluster-choice').filter(has_text='Airstrip infiltration')
        assert option.count()==1,'Crowded entry marker remains individually selectable'
        option.click()
        assert 'Airstrip infiltration' in page.locator('.j180-pin-info').inner_text(),'Chosen airstrip entry detail opens'
        assert page.locator('.j180-pin-info').evaluate("(e)=>getComputedStyle(e).position==='fixed'"),'Marker details stay visible as map scrolls'
        page.keyboard.press('Escape')
        assert page.locator('.j180-pin-info').is_hidden(),'Escape closes marker details'
        page.locator('#j180-shell').screenshot(path=str(path/('cayo-180-map-'+kind+'.png')),animations='disabled',timeout=35000)
        page.locator('.j180-menu-link').filter(has_text='Entry & exit planning').click()
        page.locator('#j171-cayo-board').wait_for(state='visible',timeout=10000)
        # Verify real tab actions, DOM category counts and focusable controls.
        assert page.locator('.j171-cards .j171-card').count()==8,kind+' infiltration count'
        page.get_by_role('tab',name='Compound entrances').click()
        assert page.locator('.j171-cards .j171-card').count()==6,kind+' compound count'
        page.get_by_role('tab',name='Escape choices').click()
        assert page.locator('.j171-cards .j171-card').count()==4,kind+' escape count'
        page.get_by_role('tab',name='Island infiltration').click()
        # Select approach and verify persistence is independent of historic heist keys.
        page.get_by_role('combobox',name='Approach vehicle',exact=True).select_option('Longfin')
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
            shell_overflow=page.locator('#j180-shell').evaluate('(e)=>e.scrollWidth>e.clientWidth+4')
            assert not shell_overflow,'Flagship map shell exceeds phone viewport'
        page.locator('#j171-cayo-board').scroll_into_view_if_needed()
        page.screenshot(path=str(path/('cayo-171-'+kind+'.png')),full_page=False,animations='disabled')
        if kind=='desktop':
            backup=context.new_page()
            backup.route('**/wikiassets.net/**',lambda route: route.abort())
            backup.goto(url,wait_until='domcontentloaded',timeout=50000)
            backup.wait_for_function("document.querySelector('#j167-heist-map')?.dataset.mapAsset === 'local-trace'",timeout=30000)
            assert backup.locator('.j181-hotspot .j183-svg').count()>=50,'Offline map retains the same clickable colored icons'
            assert backup.locator('.j180-chest').count()==19,'Offline fallback retains all 19 chest references'
            backup.close()
        context.close();browser.close()
    print('Cayo 18.5 desktop and mobile interactions, map pan, filters, popup, backup and art PASS on '+engine)
finally:
 server.shutdown()
