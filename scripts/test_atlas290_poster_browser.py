#!/usr/bin/env python3
"""Atlas 29.0 real-browser poster notebook acceptance. Local synthetic PNG only, no Rockstar image repackaging."""
import os,io,json,zlib,struct,threading
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright,expect

R=Path(__file__).resolve().parents[1]
PUBLIC=R/'public'
assert (PUBLIC/'atlas290-official-landmarks.js').is_file(),'Build public/ first'

class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 request_queue_size=64
 daemon_threads=True

def test_png(rgb):
 def chunk(name,data):
  return struct.pack('!I',len(data))+name+data+struct.pack('!I',zlib.crc32(name+data)&0xffffffff)
 raw=b''.join(b'\x00'+bytes(rgb)*64 for _ in range(64))
 return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!IIBBBBB',64,64,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw))+chunk(b'IEND',b'')

server=Server(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url='http://127.0.0.1:%d/atlas-vi.html'%server.server_port
engine=os.getenv('ATLAS_BROWSER','chromium')
try:
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(headless=True,**({'channel':'msedge'} if engine=='msedge' else {}))
  for width,height in ((1440,900),(390,844),(926,428)):
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   page=context.new_page()
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   # Keep automatic Rockstar fetching unresolved: local manual choice must still win.
   # No Rockstar network or map image is needed by this deterministic test.
   page.route('**/Leonida_Map_Poster_Printable.zip',lambda route:None)
   page.goto(url,wait_until='domcontentloaded',timeout=60000)
   expect(page.locator('#j143-official-button')).to_be_visible(timeout=25000)
   page.locator('#j143-official-button').click()
   expect(page.locator('#j143-official-layer')).to_be_visible()
   image={'name':'local-test-poster.png','mimeType':'image/png','buffer':test_png((18,34,65))}
   page.locator('#j143-official-layer input[type="file"]').first.set_input_files(image)
   expect(page.locator('.j290-ui')).to_be_visible(timeout=30000)
   page.wait_for_function("document.querySelector('#j143-official-layer')?.dataset?.j290Hash?.length===64",timeout=30000)
   page.locator('.j290-open').click()
   expect(page.locator('.j290-meta')).to_contain_text('4600',timeout=20000)
   if width==1440:
    map_box=page.locator('.j143-stage').bounding_box()
    panel_box=page.locator('.j290-ui').bounding_box()
    assert map_box and panel_box and panel_box['x']>=map_box['x']+map_box['width']-3,'Desktop search must sit beside the official poster'
   page.locator('.j290-search').fill('Vice Regal, Washington Beach, Vice Beach')
   place=page.locator('.j290-result [data-place-id="L1"]')
   expect(place).to_be_visible(timeout=10000)
   place.click()
   expect(page.locator('.j290-status')).to_contain_text('Tap')
   expect(page.locator('.j290-map-hint')).to_be_visible()
   page.keyboard.press('Escape')
   expect(page.locator('#j143-official-layer')).to_be_visible()
   expect(page.locator('.j290-map-hint')).to_be_hidden()
   place.click()
   expect(page.locator('.j290-map-hint')).to_be_visible()
   size=page.locator('.j143-stage').bounding_box()
   assert size and size['width']>100 and size['height']>(75 if height<500 else 100),(width,height,size)
   page.locator('.j143-stage').click(position={'x':size['width']/2,'y':size['height']/2})
   expect(page.locator('.j290-pin')).to_have_count(1)
   assert 'NOT verified' in page.locator('.j290-status').inner_text()
   page.locator('[data-j290="toggle-pins"]').click()
   assert page.locator('.j290-pins').is_hidden()
   page.locator('[data-j290="toggle-pins"]').click()
   expect(page.locator('.j290-pin')).to_have_count(1)
   key=page.evaluate("""() => Object.keys(localStorage).find(k=>k.startsWith('team-jura-vi-official-poster-pins-v1:'))""")
   assert key,'Private user poster pin was not stored'
   backup=page.evaluate('(key)=>localStorage.getItem(key)',key)
   saved=json.loads(backup)
   assert saved['game']=='6' and list(saved['items'])==['L1']
   assert len(saved['fingerprint'])==64
   page.locator('[data-remove-id="L1"]').click()
   expect(page.locator('.j290-pin')).to_have_count(0)
   page.locator('.j290-import input').set_input_files({'name':'pins.json','mimeType':'application/json','buffer':backup.encode()})
   expect(page.locator('.j290-pin')).to_have_count(1)
   wrong={**saved,'fingerprint':'0'*64}
   page.locator('.j290-import input').set_input_files({'name':'wrong-image.json','mimeType':'application/json','buffer':json.dumps(wrong).encode()})
   expect(page.locator('.j290-status')).to_contain_text('Backup rejected')
   expect(page.locator('.j290-pin')).to_have_count(1)
   # Another poster does not inherit the first image's pins.
   page.locator('#j143-official-layer input[type="file"]').first.set_input_files(
    {'name':'different-poster.png','mimeType':'image/png','buffer':test_png((70,16,19))})
   page.wait_for_function("""old => document.querySelector('#j143-official-layer')?.dataset?.j290Hash!==old""",arg=saved['fingerprint'],timeout=30000)
   expect(page.locator('.j290-pin')).to_have_count(0)
   # The original poster restores its own saved user placements.
   page.locator('#j143-official-layer input[type="file"]').first.set_input_files(image)
   page.wait_for_function("""hash => document.querySelector('#j143-official-layer')?.dataset?.j290Hash===hash""",arg=saved['fingerprint'],timeout=30000)
   expect(page.locator('.j290-pin')).to_have_count(1)
   assert not any('atlas290-' in e for e in errors),errors
   # The source index and the poster notebook must form one connected workflow.
   page.goto(url,wait_until='domcontentloaded',timeout=45000)
   if width<=700:
    page.wait_for_timeout(220)
    if page.locator('#sidebar').evaluate('(el)=>el.classList.contains("mobile-collapsed")'):
     page.locator('#mobileTools').click()
    expect(page.locator('#sidebar')).to_be_visible()
   page.locator('#j290-vi-ledger').evaluate('(el)=>el.open=true')
   expect(page.locator('#j290-count')).to_contain_text('4,600',timeout=20000)
   page.locator('#j290-search').fill('Vice Regal, Washington Beach, Vice Beach')
   poster_link=page.locator('.j290-entry a[href*="view=rockstar&landmark=L1"]')
   expect(poster_link).to_have_count(1,timeout=10000)
   poster_link.click()
   expect(page.locator('#j143-official-layer')).to_be_visible(timeout=20000)
   expect(page.locator('.j290-ui')).to_be_visible(timeout=25000)
   expect(page.locator('.j290-search')).to_have_value('L1',timeout=25000)
   expect(page.locator('.j290-selected')).to_contain_text('Vice Regal',timeout=25000)
   expect(page.locator('.j290-pin')).to_have_count(1)
   assert 'view=rockstar' in page.url and 'landmark=L1' in page.url
   expect(page.locator('[data-j143="close"]')).to_be_visible()
   page.locator('.j290-selected [data-place-id="L1"]').click()
   expect(page.locator('.j290-map-hint')).to_be_visible()
   page.locator('[data-j143="close"]').click()
   expect(page.locator('#j143-official-layer')).to_be_hidden()
   page.locator('#j143-official-button').click()
   expect(page.locator('#j143-official-layer')).to_be_visible()
   expect(page.locator('.j290-map-hint')).to_be_hidden()
   expect(page.locator('.j290-pin')).to_have_count(1)
   if width==390 or height<500:
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Poster notebook causes horizontal overflow'
   # Capture rendered desktop/portrait/landscape UI for independent human visual review.
   evidence=R/'qa-evidence'/engine/'leonida-dual'
   evidence.mkdir(parents=True,exist_ok=True)
   page.screenshot(path=str(evidence/f'poster-{width}x{height}.png'),animations='disabled',full_page=False,timeout=25000)
   print('PASS Atlas 29.0 '+engine+' '+str(width)+': source search, manual poster placement, show/hide, private backup, image SHA isolation and restore',flush=True)
   context.close()
  browser.close()
finally:
 server.shutdown()
