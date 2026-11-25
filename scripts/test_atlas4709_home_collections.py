import os, threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'qa-evidence'/'atlas4709'/os.getenv('ATLAS_BROWSER','chromium')
OUT.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
with ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'public'))) as server:
 threading.Thread(target=server.serve_forever,daemon=True).start()
 base=f'http://127.0.0.1:{server.server_port}/'
 with sync_playwright() as pw:
  browser=pw.chromium.launch(**({'channel':'msedge'} if os.getenv('ATLAS_BROWSER')=='msedge' else {}))
  for width in (390,1440):
   ctx=browser.new_context(viewport={'width':width,'height':844})
   page=ctx.new_page()
   for path in ('index.html','atlas-dashboard.html'):
    page.goto(base+path)
    panel=page.locator('.j4709-entry')
    expect(panel).to_be_visible()
    assert panel.evaluate("(e)=>{const hero=e.parentElement.querySelector('.j130-public-hero,.j223-hero');return !!hero && Boolean(hero.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING) && !e.previousElementSibling?.matches('.j223-worlds,.j130-worlds')}")
    for target in ('atlas-forge-collections.html','atlas90-vehicles5.html?world=story','atlas90-vehicles5.html?world=online','atlas90-vehicles6.html','atlas90-weapons.html?world=story','atlas90-weapons.html?world=online','atlas90-weapons6.html'):
     expect(panel.locator(f'a[href="./{target}"]')).to_have_count(1)
    for img in panel.locator('img').all():
     img.scroll_into_view_if_needed()
     expect(img).to_be_visible()
     assert img.evaluate('(e)=>e.complete && e.naturalWidth>0') or img.evaluate('(e)=>e.decode().then(()=>true)')
    assert panel.evaluate('(e)=>e.scrollWidth<=e.clientWidth+2')
    panel.screenshot(path=str(OUT/f'{path}-{width}.png'),animations='disabled')
    if path=='index.html':
     cards=page.locator('#featuredGrid>.world-card')
     expect(cards).to_have_count(4,timeout=15000)
     for world in cards.all():
      assert world.evaluate('(e)=>{const r=e.getBoundingClientRect();return r.left>=-2&&r.right<=innerWidth+2&&r.width>0}'),('featured world exceeds viewport',width,world.get_attribute('href'))
    overflow=page.evaluate('document.documentElement.scrollWidth-innerWidth')
    assert overflow<=2, ('page overflow',path,width,overflow,page.evaluate('''()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+2&&getComputedStyle(e).position!=='fixed').slice(0,15).map(e=>[e.tagName,e.className,Math.round(e.getBoundingClientRect().right)])'''))
   page.goto(base+'atlas-forge-collections.html')
   expect(page.locator('.c-hero')).to_have_css('background-image',__import__('re').compile('atlas93-garage-hero'))
   expect(page.get_by_role('link',name='Browse & compare GTA VI vehicles')).to_be_visible()
   for query,art in (('', 'jura161-vehicles.webp'),('?world=vi','jura161-vehicles6.webp')):
    page.goto(base+'atlas-vehicle-configurator.html'+query)
    expect(page.locator('.c-hero')).to_have_css('background-image',__import__('re').compile(art))
    page.locator('.c-hero').screenshot(path=str(OUT/f'forge-{art}-{width}.png'),animations='disabled')
   ctx.close()
  browser.close()
print('PASS home entry, world links, art decode, mobile fit and workshop headers')
