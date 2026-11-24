#!/usr/bin/env python3
"""Actual built-site verification of shared classic source-progress recovery."""
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
cases=[
 ('iii','iii-classic','aa120220618c4c1314d319bc6210071437d14662','#j240-source-index','iii-package-1','iii-package-2'),
 ('vc','vc-classic','b06265e1bf37e2b1ed389c58c80679addfbc8f20','#j240-source-index','vc-robbery-01','vc-robbery-02'),
 ('vc','vc-definitive','577530924ad52473d48a57047e1d064840dc41af','#j244-de','vc-de-hidden-packages-1','vc-de-hidden-packages-2'),
 ('lcs','lcs-psp-reference','eb962c5bff9c1d94e6cb48077885fde0f5d28317','#j247-reference','lcs-ref-1','lcs-ref-2'),
 ('vcs','vcs-psp-reference','eb962c5bff9c1d94e6cb48077885fde0f5d28317','#j247-reference','vcs-ref-1','vcs-ref-2'),
 ('ctw','ctw-camera-reference','itemaps-camera-index-2026-11-22-v1','#j273-camera','ctw-camera-1','ctw-camera-2'),
]
def payload(scope,rev,done):
    return json.dumps({'schema':'team-jura-source-progress-v1','scope':scope,'revision':rev,'done':done})
def prepare(page,game,root):
    page.goto(base+'map-hub.html?game='+game,wait_until='domcontentloaded')
    host=page.locator(root)
    if root=='#j244-de':
        host.locator('summary').click()
    if game=='vc' and root=='#j240-source-index':
        host.locator('#j240-category').select_option('Store robberies')
    expect(host.locator('.j271-source-progress')).to_be_visible(timeout=20000)
    return host
with ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'public'))) as server:
    Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}/'
    with sync_playwright() as p:
        browser=p.chromium.launch()
        for width in (390,1440):
            context=browser.new_context(viewport={'width':width,'height':900},accept_downloads=True,reduced_motion='reduce')
            context.route('https://**/*',lambda route:route.abort())
            page=context.new_page()
            page.goto(base+'maps.html',wait_until='domcontentloaded')
            for game,scope,rev,root,first,second in cases:
                key='team-jura-source-progress-v1:'+scope+':'+rev
                other='team-jura-atlas98b-items-'+game+'-v1'
                broken='{"schema": broken source record' if width==390 else payload(scope,rev,[first,'unknown-future-id'])
                page.evaluate('v=>{localStorage.setItem(v.key,v.raw);localStorage.setItem(v.other,v.sentinel)}',{'key':key,'raw':broken,'other':other,'sentinel':'legacy-sentinel'})
                host=prepare(page,game,root)
                panel=host.locator('.j271-source-progress')
                expect(panel.locator('.j400-source-warning')).to_be_visible()
                mark=host.locator('li[data-id="'+first+'"] .j271-mark')
                expect(mark).to_be_disabled()
                expect(panel.locator('input[type=file]')).to_be_disabled()
                expect(panel.get_by_role('button',name='Export source progress',exact=True)).to_be_disabled()
                with page.expect_download() as info:
                    panel.get_by_role('button',name='Download original unreadable source progress').click()
                assert Path(info.value.path()).read_bytes()==broken.encode()
                assert page.evaluate('k=>localStorage.getItem(k)',key)==broken
                # Restore valid data from another tab, then verify that writes merge latest marks.
                peer=context.new_page()
                peer.goto(base+'maps.html',wait_until='domcontentloaded')
                peer.evaluate('v=>localStorage.setItem(v.key,v.raw)',{'key':key,'raw':payload(scope,rev,[first])})
                expect(panel.locator('.j400-source-warning')).to_be_hidden()
                expect(mark).to_have_attribute('aria-pressed','true')
                mark2=host.locator('li[data-id="'+second+'"] .j271-mark')
                expect(mark2).to_be_enabled()
                mark2.click()
                assert set(page.evaluate('k=>JSON.parse(localStorage.getItem(k)).done',key))=={first,second}
                # New corruption from a different tab must disable previously working edits.
                peer.evaluate('v=>localStorage.setItem(v.key,v.raw)',{'key':key,'raw':broken})
                expect(panel.locator('.j400-source-warning')).to_be_visible()
                expect(mark2).to_be_disabled()
                assert page.evaluate('k=>localStorage.getItem(k)',key)==broken
                assert page.evaluate('k=>localStorage.getItem(k)',other)=='legacy-sentinel'
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
                peer.close()
                print('PASS',width,scope)
            context.close()
        browser.close()
    server.shutdown()
print('Six source scopes: original raw recovery, incompatible ID refusal, cross-tab restoration, independent saves and phone/desktop passed.')
