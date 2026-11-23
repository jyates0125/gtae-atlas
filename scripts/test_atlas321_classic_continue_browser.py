#!/usr/bin/env python3
"""Focused Atlas 32.1 journey: seven classic collections, exact set links, safe raw recovery."""
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'maps.html').is_file(), 'Build Cloudflare payload first'
EVIDENCE=ROOT/'qa-evidence'/'chromium'
EVIDENCE.mkdir(parents=True,exist_ok=True)

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*_args):pass

server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
iii_key='team-jura-atlas98b-items-iii-v1'
vcs_key='team-jura-atlas98b-items-vcs-v1'
damaged='{"schema": broken legacy record'
good={'schema':'team-jura-atlas98b-items-v1','game':'iii','done':{'Hidden packages':[1,2,42]}}
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        context=browser.new_context(viewport={'width':390,'height':844},accept_downloads=True,reduced_motion='reduce')
        page=context.new_page()
        page.goto(base+'/maps.html',wait_until='domcontentloaded')
        page.evaluate("""payload=>{
          localStorage.setItem(payload.iii,JSON.stringify(payload.good));
          localStorage.setItem(payload.vcs,payload.bad);
        }""",{'iii':iii_key,'vcs':vcs_key,'good':good,'bad':damaged})
        original=page.evaluate('keys=>keys.map(k=>localStorage.getItem(k))',[iii_key,vcs_key])
        page.reload(wait_until='domcontentloaded')
        disclosure=page.locator('.j321-classic-pulse details')
        disclosure.locator('summary').click()
        expect(page.locator('.j321-world')).to_have_count(7)
        expect(page.locator('#j321ClassicStatus')).to_contain_text('1 need recovery')
        expect(page.locator('.j321-world[data-game="vcs"]')).to_contain_text('needs recovery')
        expect(page.locator('.j321-world[data-game="iii"]')).to_contain_text('3 /')
        iii=page.locator('.j321-world[data-game="iii"] a').filter(has_text='Hidden packages')
        assert iii.get_attribute('href')=='./map-hub.html?game=iii&collection=Hidden%20packages'
        for width,height in [(390,844),(844,390),(1440,900)]:
            page.set_viewport_size({'width':width,'height':height})
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),f'Directory overflow {width}x{height}'
            page.screenshot(path=str(EVIDENCE/f'atlas321-classic-resume-{width}.png'),full_page=True)
        assert page.evaluate('keys=>keys.map(k=>localStorage.getItem(k))',[iii_key,vcs_key])==original, 'Directory read must not rewrite saved keys'
        # Exact-set deep links restore the correct title without source or progress leakage.
        page.set_viewport_size({'width':390,'height':844})
        iii.click()
        expect(page).to_have_url(base+'/map-hub.html?game=iii&collection=Hidden%20packages')
        select=page.locator('#j98bSet')
        expect(select).to_have_value('Hidden packages')
        expect(page.locator('#j98bCounter')).to_contain_text('3 / 100')
        select.select_option('Unique stunt jumps')
        assert 'collection=Unique+stunt+jumps' in page.url,'Changing named checklist preserves a shareable non-private set link'
        assert page.evaluate('keys=>keys.map(k=>localStorage.getItem(k))',[iii_key,vcs_key])==original
        # Corrupted VCS storage must never turn into a blank saved game on slot clicks or import.
        page.goto(base+'/map-hub.html?game=vcs&collection=Red%20balloons',wait_until='domcontentloaded')
        expect(page.locator('#j98bSet')).to_have_value('Red balloons')
        expect(page.locator('#j321-checklist-warning')).to_be_visible()
        expect(page.locator('#j98bGrid button[aria-label*="Red balloons slot 1"]')).to_be_disabled()
        expect(page.locator('#j98bImport')).to_be_disabled()
        with page.expect_download() as info:
            page.locator('#j321-checklist-raw').click()
        downloaded=info.value
        assert downloaded.suggested_filename=='team-jura-vcs-unreadable-checklist-raw.txt'
        assert Path(downloaded.path()).read_text(encoding='utf-8')==damaged
        assert page.evaluate('keys=>keys.map(k=>localStorage.getItem(k))',[iii_key,vcs_key])==original
        # When valid data is restored externally, normal completion editing resumes.
        page.evaluate("payload => localStorage.setItem(payload.key,JSON.stringify(payload.value))",
                      {'key':vcs_key,'value':{'schema':'team-jura-atlas98b-items-v1','game':'vcs','done':{}}})
        page.reload(wait_until='domcontentloaded')
        expect(page.locator('#j321-checklist-warning')).to_be_hidden()
        first=page.locator('#j98bGrid button[aria-label*="Red balloons slot 1"]')
        expect(first).to_be_enabled()
        first.click()
        current=page.evaluate('k=>JSON.parse(localStorage.getItem(k))',vcs_key)
        assert current['done']['Red balloons']==[1]
        assert page.evaluate('k=>JSON.parse(localStorage.getItem(k))',iii_key)==good,'VCS changes must not touch GTA III saved slots'
        context.close()
        browser.close()
finally:
    server.shutdown()
print('Atlas 32.1: seven-world directory progress, exact set links, 3 viewports, damaged-save raw export and no cross-world writes passed')
