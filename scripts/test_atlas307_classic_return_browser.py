#!/usr/bin/env python3
"""7 classic game editors × 4 viewports: Back, unsaved confirmation, Escape and save isolation."""
import json
from pathlib import Path
from threading import Thread
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
assert (PUBLIC/'map-hub.html').exists(),'Build public/ before browser QA'
W={'iii':'Missions','vc':'Missions','vcs':'Missions','lcs':'Missions',
   'ctw':'Missions','tlad':'Motorcycle missions','tbogt':'Nightclub missions'}
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=80
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/'
out=ROOT/'qa-evidence'/'chromium';out.mkdir(parents=True,exist_ok=True)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width,height in ((375,667),(390,844),(844,390),(1440,900)):
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   context.route('https://**/*',lambda route:route.abort())
   page=context.new_page()
   errors=[]
   page.on('pageerror',lambda err:errors.append(str(err)))
   for game,category in W.items():
    key='team-jura-atlas98-classic-'+game+'-v1'
    fixture={'schema':'team-jura-atlas98-classic-v1','world':game,
             'markers':[{'id':'atlas307-marker','name':'Preserved personal pin',
             'category':category,'note':'Saved note','x':45,'y':55,
             'source':'personal-image-percent'}],'completed':[],'background':None}
    page.goto(base+'map-hub.html?game='+game+'&notebook=1',wait_until='domcontentloaded')
    page.evaluate("([k,v])=>localStorage.setItem(k,v)",[key,json.dumps(fixture)])
    page.reload(wait_until='domcontentloaded')
    expect(page.locator('#classicTitle')).not_to_be_empty(timeout=15000)
    row=page.locator('#classicPinList .classic-pin-row')
    expect(row).to_have_count(1)
    back=page.locator('#j307-back-map')
    expect(back).to_be_hidden()
    raw=page.evaluate("k=>localStorage.getItem(k)",key)
    camera=page.locator('#classicMapSurface').get_attribute('style')
    row.get_by_role('button',name='Edit').click()
    editor=page.locator('#classicEditor')
    expect(editor).to_be_visible()
    expect(back).to_be_visible()
    box=back.bounding_box()
    assert box and box['height']>=44 and box['width']>=135,(game,width,box)
    page.locator('#markerName').fill('Do not save this')
    page.once('dialog',lambda d:d.dismiss())
    back.click()
    expect(editor).to_be_visible()
    expect(page.locator('#markerName')).to_have_value('Do not save this')
    assert page.evaluate("k=>localStorage.getItem(k)",key)==raw
    page.once('dialog',lambda d:d.accept())
    back.click()
    expect(editor).to_be_hidden()
    expect(page.locator('#classicViewport')).to_be_focused()
    assert page.locator('#classicMapSurface').get_attribute('style')==camera
    assert page.evaluate("k=>localStorage.getItem(k)",key)==raw
    assert page.evaluate("new URL(location.href).searchParams.get('game')")==game
    row.first.get_by_role('button',name='Edit').click()
    expect(editor).to_be_visible()
    page.locator('#markerNote').fill('Unsaved Escape note')
    page.once('dialog',lambda d:d.accept())
    page.locator('#markerNote').press('Escape')
    expect(editor).to_be_hidden()
    expect(page.locator('#classicViewport')).to_be_focused()
    assert page.evaluate("k=>localStorage.getItem(k)",key)==raw
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(game,width,height,'overflow')
    if game=='ctw' and width in (390,844):
     page.screenshot(path=str(out/f'atlas307-classic-{width}x{height}.png'),full_page=False)
   assert not errors,(width,height,errors[:5])
   context.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 30.7: 7 worlds × 4 viewports; cancel/accept, Escape, focus and unchanged saves passed')
