#!/usr/bin/env python3
"""Atlas 32.0: compare private saved Forge concepts at phone and desktop width."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'atlas-forge-collections.html').exists(), 'Build the Cloudflare static site first'
EVIDENCE=ROOT/'qa-evidence'/'chromium'
EVIDENCE.mkdir(parents=True,exist_ok=True)

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*_args): pass

server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}'
keys=['team-jura-atlas101-concept-presets-v1','team-jura-forge-vi-concept-presets-v1',
      'team-jura-atlas93-garage-v1']
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
        page=context.new_page()
        page.goto(url+'/atlas-dashboard.html',wait_until='domcontentloaded')
        page.evaluate("""keys => {
          localStorage.setItem(keys[0],JSON.stringify({schema:1,builds:{
            sultan:{model:'sultan',name:'Sultan Primary',paint:'#aacc55',body:'auto',design:{finish:'metallic',lights:true}},
            adder:{model:'adder',name:'Adder Primary',paint:'#113355',body:'sports',design:{kit:'track'}}},
            variants:{sultan:[
              {model:'sultan',name:'Private Weekend',paint:'#bb33aa',body:'sports',note:'personal secret note',
                design:{finish:'stealth',lights:false,accent:'#d0ab20',environment:'signature'}},
              {model:'sultan',name:'Track Night',paint:'#f0a060',body:'sports',note:'not public',
                design:{finish:'satin',kit:'track'}}]}}));
          localStorage.setItem(keys[1],JSON.stringify({schema:1,builds:{
            vi_squalo:{model:'vi_squalo',name:'Boat Concept',paint:'#1288aa',body:'auto',design:{}}},variants:{}}));
          localStorage.setItem(keys[2],JSON.stringify({schema:1,vehicles:{jetmax:{note:'private garage notes'}}}));
        }""",keys)
        original=page.evaluate("keys => keys.map(k => localStorage.getItem(k))",keys)
        page.goto(url+'/atlas-forge-collections.html',wait_until='domcontentloaded')
        expect(page.locator('.fc-entry')).to_have_count(6,timeout=15000)
        expect(page.locator('#forgeComparePanel')).to_be_hidden()
        first=page.locator('.fc-entry').filter(has_text='Sultan Primary')
        second=page.locator('.fc-entry').filter(has_text='Private Weekend')
        first.locator('.fc-compare-toggle').click()
        expect(page.locator('#forgeComparePanel')).to_be_visible()
        expect(page.locator('#forgeCompareStatus')).to_contain_text('1 of 2')
        second=page.locator('.fc-entry').filter(has_text='Private Weekend')
        second.locator('.fc-compare-toggle').click()
        expect(page.locator('#forgeCompareStatus')).to_contain_text('Comparing 2 local designs')
        expect(page.locator('.fc-compare-table thead th')).to_have_count(3)
        expect(page.locator('.fc-compare-table')).to_contain_text('Sultan Primary')
        expect(page.locator('.fc-compare-table')).to_contain_text('Private Weekend')
        expect(page.locator('.fc-compare-table')).to_contain_text('Concept lighting')
        assert 'personal secret note' not in page.locator('#forgeComparePanel').inner_text()
        assert 'Private%20Weekend' not in page.url
        assert 'Private Weekend' not in page.locator('.fc-entry').filter(has_text='Private Weekend').locator('a').get_attribute('href')
        for width,height in [(390,844),(844,390),(1440,900)]:
            page.set_viewport_size({'width':width,'height':height})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'), (
                f'Forge comparison caused document overflow at {width}x{height}')
            page.screenshot(path=str(EVIDENCE/f'atlas320-forge-compare-{width}.png'),full_page=True)
        # Choosing a different model resets rather than merging unrelated design data.
        page.locator('.fc-entry').filter(has_text='Adder Primary').locator('.fc-compare-toggle').click()
        expect(page.locator('#forgeCompareStatus')).to_contain_text('restricted to the same vehicle')
        expect(page.locator('#forgeCompareStatus')).to_contain_text('1 of 2')
        assert page.locator('.fc-compare-table').count()==0
        # A Leonida design must not compare against the GTA V model.
        page.locator('.fc-entry').filter(has_text='Boat Concept').locator('.fc-compare-toggle').click()
        expect(page.locator('#forgeCompareStatus')).to_contain_text('restricted to the same vehicle')
        assert page.evaluate("keys => keys.map(k => localStorage.getItem(k))",keys)==original, (
            'Compare and filters cannot edit primary Forge, VI Forge or personal Garage keys')
        page.locator('#forgeCompareClear').click()
        expect(page.locator('#forgeComparePanel')).to_be_hidden()
        page.reload(wait_until='domcontentloaded')
        expect(page.locator('#forgeComparePanel')).to_be_hidden()
        assert page.evaluate("keys => keys.map(k => localStorage.getItem(k))",keys)==original, (
            'No comparison state persisted across reload')
        context.close()
        browser.close()
finally:
    server.shutdown()
print('Atlas 32.0 read-only same-model Forge comparison Chromium responsive and privacy checks passed')
