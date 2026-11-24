#!/usr/bin/env python3
"""Exercise the actual built Heist HQ and private intel ledger."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import threading
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'heists.html').is_file()
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
server.daemon_threads=True
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/'
key='team-jura-atlas93-heist-intel-heist-fleeca.html'
other='team-jura-atlas93-heist-intel-heist-diamond-casino.html'
bad='{malformed intel: preserve me}'
seed=[dict(label='Legacy evidence',url='javascript:alert(1)',level='source',updated='2026-11-22T12:00:00Z',extra='retain')]
raw=json.dumps(seed,ensure_ascii=False)
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        for width,height in ((390,844),(1440,900)):
            context=browser.new_context(viewport=dict(width=width,height=height),accept_downloads=True,reduced_motion='reduce')
            context.route('https://**/*',lambda route:route.abort())
            hq=context.new_page()
            hq.goto(base+'heists.html',wait_until='domcontentloaded')
            expect(hq.locator('#heistCount')).to_have_text('15 of 15 workspaces',timeout=20000)
            hq.evaluate('([k,v,o,b])=>{localStorage.setItem(k,v);localStorage.setItem(o,b)}',[key,raw,other,bad])
            hq.reload(wait_until='domcontentloaded')
            resume=hq.locator('.j297-heist-resume')
            expect(resume.locator('a[href="./heist-fleeca.html"]')).to_contain_text('1 intel note')
            expect(resume.locator('a[href="./heist-diamond-casino.html"]')).to_contain_text('Saved data needs recovery')
            hq.locator('#heistStarted').check()
            expect(hq.locator('#heistCount')).to_have_text('2 of 15 workspaces')
            assert hq.evaluate('(k)=>localStorage.getItem(k)',key)==raw
            assert hq.evaluate('(k)=>localStorage.getItem(k)',other)==bad
            mission=context.new_page()
            mission.goto(base+'heist-fleeca.html',wait_until='domcontentloaded')
            ledger=mission.locator('#j93-heist-intel')
            expect(ledger).to_be_visible(timeout=20000)
            expect(ledger.locator('.j93-heist-list')).to_contain_text('Legacy evidence')
            expect(ledger.locator('.j93-heist-list a')).to_have_count(0)
            expect(ledger.locator('.j93-heist-list')).to_contain_text('not a safe HTTPS link')
            expect(ledger.get_by_role('button',name='Download original intel save')).to_be_hidden()
            task=ledger.get_by_role('textbox',name='Intel task label')
            source=ledger.get_by_role('textbox',name='Evidence link')
            add=ledger.get_by_role('button',name='+ Add intel note')
            task.fill('Second source')
            source.fill('https://name:password@example.com')
            add.click()
            expect(ledger.locator('.j93-heist-status')).to_contain_text('without credentials')
            assert mission.evaluate('(k)=>localStorage.getItem(k)',key)==raw
            # A distinct tab writes a newer note; the ledger must retain that record.
            hq.evaluate('([k,rows])=>localStorage.setItem(k,JSON.stringify(rows))',[key,seed+[dict(label='Other tab',url='',level='personal')]])
            expect(ledger.locator('.j93-heist-list')).to_contain_text('Other tab')
            source.fill('https://example.com/evidence')
            add.click()
            expect(ledger.locator('.j93-heist-status')).to_contain_text('Intel saved locally')
            notes=mission.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',key)
            assert len(notes)==3 and notes[0]['extra']=='retain'
            assert notes[1]['label']=='Other tab' and notes[2]['label']=='Second source'
            expect(ledger.locator('.j93-heist-list a')).to_have_attribute('href','https://example.com/evidence')
            expect(resume.locator('a[href="./heist-fleeca.html"]')).to_contain_text('3 intel notes')
            # Failed persistence must not pretend success or clear the draft.
            mission.evaluate('k=>{const old=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key===k)throw new Error("quota");return old.call(this,key,value)}}',key)
            task.fill('Unsaved draft')
            add.click()
            expect(task).to_have_value('Unsaved draft')
            expect(ledger.locator('.j93-heist-status')).to_contain_text('Could not save')
            assert mission.evaluate('(k)=>JSON.parse(localStorage.getItem(k)).length',key)==3
            mission.goto(base+'heist-diamond-casino.html',wait_until='domcontentloaded')
            ledger=mission.locator('#j93-heist-intel')
            expect(ledger.get_by_role('textbox',name='Intel task label')).to_be_disabled(timeout=20000)
            reset=ledger.get_by_role('button',name='Reset unreadable intel')
            expect(reset).to_be_disabled()
            with mission.expect_download() as download:
                ledger.get_by_role('button',name='Download original intel save').click()
            assert download.value.path().read_bytes()==bad.encode('utf-8')
            expect(reset).to_be_enabled()
            mission.once('dialog',lambda dialog:dialog.dismiss())
            reset.click()
            assert mission.evaluate('(k)=>localStorage.getItem(k)',other)==bad
            mission.once('dialog',lambda dialog:dialog.accept())
            reset.click()
            expect(ledger.get_by_role('textbox',name='Intel task label')).to_be_enabled()
            assert mission.evaluate('(k)=>localStorage.getItem(k)',other) is None
            assert mission.evaluate('(k)=>JSON.parse(localStorage.getItem(k)).length',key)==3
            expect(hq.locator('#heistCount')).to_have_text('1 of 15 workspaces')
            # Cayo uses the shared intel module, not a changed island map.
            mission.goto(base+'heist-cayo-perico.html',wait_until='domcontentloaded')
            expect(mission.locator('#j93-heist-intel')).to_be_attached(timeout=20000)
            print(f'PASS {width}: intel-only resume, safe links, concurrent notes, quota failure, byte-exact recovery and Cayo module attachment',flush=True)
            context.close()
        browser.close()
finally:
    server.shutdown()
