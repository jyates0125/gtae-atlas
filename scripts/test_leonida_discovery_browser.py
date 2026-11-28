import json,threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
KEY='team-jura-objective-progress-v1:vi-story'
LEGACY='team-jura-vi-activity-counts-v1'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
with ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'public'))) as server:
 threading.Thread(target=server.serve_forever,daemon=True).start()
 base=f'http://127.0.0.1:{server.server_port}/'
 with sync_playwright() as pw:
  browser=pw.chromium.launch()
  for width in (390,1440):
   ctx=browser.new_context(viewport={'width':width,'height':844},accept_downloads=True)
   ctx.route('https://**/*',lambda route:route.abort())
   p=ctx.new_page();p.goto(base+'atlas-collectibles.html?game=vi')
   expect(p.locator('#leonidaDiscovery')).to_be_visible(timeout=20000)
   expect(p.locator('.jo-card')).to_have_count(16,timeout=20000)
   p.evaluate("(k)=>localStorage.setItem(k,'old-counts')",LEGACY)
   p.locator('#jo-search').fill('King Gator')
   expect(p.locator('.jo-card')).to_have_count(1)
   card=p.locator('.jo-card');card.get_by_role('button',name='Hunt next',exact=True).click()
   expect(p.locator('#jo-queued')).to_have_text('1')
   card.locator('summary').click();card.locator('textarea').fill('Find the entrance')
   card.get_by_role('button',name='Save note').click()
   expect(p.locator('#jo-message')).to_have_text('Saved on this device.')
   card.get_by_role('button',name='Mark visited').click()
   expect(p.locator('#jo-done')).to_have_text('1')
   expect(p.locator('.jo-card')).to_have_count(0)
   p.locator('#jo-filter').select_option('done')
   expect(p.locator('.jo-card')).to_have_count(1)
   card.locator('summary').click();expect(card.locator('textarea')).to_have_value('Find the entrance')
   assert 'search=' in card.get_by_role('link',name='Search Leonida map (approximate)').get_attribute('href')
   p.reload();expect(p.locator('#jo-done')).to_have_text('1',timeout=20000)
   assert p.evaluate('(k)=>localStorage.getItem(k)',LEGACY)=='old-counts'
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   p.locator('.jo-backup summary').click()
   with p.expect_download() as download:p.locator('#jo-export').click()
   backup=json.loads(Path(download.value.path()).read_text())
   assert backup['items']['vi-o-7d4b983e21a6']['done']
   p.evaluate("(k)=>localStorage.setItem(k,'broken')",KEY);p.reload()
   expect(p.locator('#jo-message')).to_contain_text('Editing paused',timeout=20000)
   expect(p.locator('.jo-card [data-action=mark]').first).to_be_disabled()
   assert p.evaluate('(k)=>localStorage.getItem(k)',KEY)=='broken'
   p.locator('[data-world=story]').click();expect(p.locator('#leonidaDiscovery')).to_be_hidden()
   p.locator('[data-world=vi]').click();expect(p.locator('#leonidaDiscovery')).to_be_visible()
   ctx.close()
  browser.close()
print('PASS Leonida discovery workspace, phone/desktop, progress, note, queue, backup, corruption and world isolation')
