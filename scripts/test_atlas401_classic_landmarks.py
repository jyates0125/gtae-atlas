#!/usr/bin/env python3
"""Atlas 40.1: scoped landmark source packs and real native radar interaction."""
import json
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
REV='f69c37a0ac5e68e81e770f79a0a8387f1054f03c'
packs={}
for game,n in [('iii',42),('vc',22)]:
    p=json.loads((ROOT/f'data/atlas401-{game}-landmarks.json').read_text())
    packs[game]=p
    assert p['world']==game and p['sourceRevision']==REV and p['license']=='MIT'
    assert p['gameplayVerified'] is False and p['kind']=='landmark-approach-reference'
    assert 'Copyright (c) 2022 Vortrex' in p['licenseText']
    assert len(p['records'])==n and sum(p['counts'].values())==n
    assert len({r['id'] for r in p['records']})==n
    assert len({(r['x'],r['y']) for r in p['records']})==n
    for r in p['records']:
        assert r['id'].startswith(game+'-landmark-')
        assert abs(r['imageX']-(r['x']+2000)/40)<1e-9
        assert abs(r['imageY']-(2000-r['y'])/40)<1e-9
        assert 0<=r['imageX']<=100 and 0<=r['imageY']<=100
        assert REV in r['sourceUrl']
    assert len(p['excluded'])==(2 if game=='vc' else 0)
    for path in ['atlas-sw.js','atlas277-offline-classic.js']:
        assert f'./data/atlas401-{game}-landmarks.json' in (ROOT/path).read_text()
    assert (ROOT/'public'/f'data/atlas401-{game}-landmarks.json').is_file()
print('PASS 64 scoped source records, projection, exclusions, MIT and built payload')
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
with ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'public'))) as server:
    Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}/'
    with sync_playwright() as p:
        browser=p.chromium.launch()
        for width in (390,1440):
            context=browser.new_context(viewport={'width':width,'height':900},accept_downloads=True,reduced_motion='reduce')
            context.route('https://**/*',lambda route:route.abort())
            page=context.new_page()
            for game,oldrev,oldn in [('iii','aa120220618c4c1314d319bc6210071437d14662',160),('vc','b06265e1bf37e2b1ed389c58c80679addfbc8f20',51)]:
                page.goto(base+'map-hub.html?game='+game,wait_until='domcontentloaded')
                root=page.locator('#j240-source-index')
                mode=root.locator('#j401-source-mode')
                expect(root.locator('#j240-status')).to_contain_text(str(oldn)+' total')
                expect(mode).to_have_value('collectibles')
                oldkey='team-jura-source-progress-v1:'+game+'-classic:'+oldrev
                old=page.evaluate('k=>localStorage.getItem(k)',oldkey)
                mode.select_option('landmarks')
                expect(root.locator('#j240-status')).to_contain_text(str(len(packs[game]['records']))+' total')
                expect(root).to_contain_text('not collectible spawns')
                expect(root.locator('.j271-source-progress')).to_contain_text('visited reference destinations')
                first=packs[game]['records'][0]
                root.locator('#j240-category').select_option(first['category'])
                expect(root.locator('li[data-id]')).to_have_count(packs[game]['counts'][first['category']])
                expect(page.locator('#j241-source-pins .j241-source-pin')).to_have_count(packs[game]['counts'][first['category']],timeout=15000)
                row=root.locator('li[data-id="'+first['id']+'"]')
                row.get_by_role('button',name='Locate reference').click()
                expect(page.locator('#j241-source-detail')).to_contain_text('not a verified entrance')
                row.locator('.j271-mark').click()
                key='team-jura-source-progress-v1:'+game+'-classic-landmarks:'+REV
                assert page.evaluate('k=>JSON.parse(localStorage.getItem(k)).done',key)==[first['id']]
                root.locator('#j240-start').select_option(first['id'])
                root.get_by_role('button',name='Build geometric preview').click()
                with page.expect_download() as info:
                    root.get_by_role('button',name='Export source preview').click()
                data=json.loads(Path(info.value.path()).read_text())
                assert data['world']==game and data['kind']=='landmark-approach-preview'
                assert data['route'][0]['id']==first['id']
                mode.select_option('collectibles')
                expect(root.locator('#j240-status')).to_contain_text(str(oldn)+' total')
                assert page.evaluate('k=>localStorage.getItem(k)',oldkey)==old
                mode.select_option('landmarks')
                expect(root.locator('#j240-status')).to_contain_text(str(len(packs[game]['records']))+' total')
                expect(root.locator('li[data-id="'+first['id']+'"] .j271-mark')).to_have_attribute('aria-pressed','true')
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
                print('PASS',width,game,'map pins, visited progress, route export, layer separation')
            context.close()
        browser.close()
    server.shutdown()
