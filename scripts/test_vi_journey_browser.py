import threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
KEY='team-jura-vi-journeys-v1'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
with ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'public'))) as server:
 threading.Thread(target=server.serve_forever,daemon=True).start()
 base=f'http://127.0.0.1:{server.server_port}/'
 with sync_playwright() as pw:
  browser=pw.chromium.launch()
  for width in (390,1440):
   ctx=browser.new_context(viewport={'width':width,'height':844})
   ctx.route('https://**/*',lambda r:r.abort())
   p=ctx.new_page();p.goto(base+'atlas-activities.html?mode=vi')
   expect(p.locator('#viJourney')).to_be_visible()
   p.locator('#vj-new').fill('First');p.locator('#vj-add').click()
   expect(p.locator('#vj-name')).to_have_value('First')
   p.locator('#vj-chapter').fill('My stage')
   p.locator('#vj-spoilers').check();p.locator('#vj-notes').fill('Personal choice')
   p.locator('#vj-save').click()
   expect(p.locator('#vj-status')).to_have_text('Journey saved on this device.')
   expect(p.locator('#vj-notes')).to_be_hidden()
   first=p.locator('#vj-select').input_value()
   p.locator('#vj-new').fill('Second');p.locator('#vj-add').click()
   expect(p.locator('#vj-name')).to_have_value('Second')
   expect(p.locator('#vj-chapter')).to_have_value('')
   p.locator('#vj-select').select_option(first)
   expect(p.locator('#vj-chapter')).to_have_value('My stage')
   expect(p.locator('#vj-notes')).to_be_hidden()
   p.reload();expect(p.locator('#vj-name')).to_have_value('First')
   expect(p.locator('#vj-notes')).to_be_hidden()
   p.locator('#vj-spoilers').check();expect(p.locator('#vj-notes')).to_have_value('Personal choice')
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
   p.goto(base+'atlas-activities.html?mode=online');expect(p.locator('#viJourney')).to_be_hidden()
   p.goto(base+'atlas-activities.html?mode=story');expect(p.locator('#viJourney')).to_be_hidden()
   p.evaluate("(k)=>localStorage.setItem(k,'broken')",KEY)
   p.goto(base+'atlas-activities.html?mode=vi');expect(p.locator('#vj-status')).to_contain_text('Editing paused')
   expect(p.locator('#vj-add')).to_be_disabled()
   assert p.evaluate('(k)=>localStorage.getItem(k)',KEY)=='broken'
   ctx.close()
  browser.close()
print('PASS VI personal journeys, profile switching, spoilers, reload, corruption and world isolation')
