#!/usr/bin/env python3
"""Atlas 22.0: verify the approved, bundled Salvage Yard hero in both browsers."""
import os, threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
ASSET='art/jura159-heist-salvage-yard.webp'
assert (PUBLIC/ASSET).is_file(), 'Approved art not bundled into Cloudflare payload'
browser_name=os.getenv('ATLAS_BROWSER','chromium')
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
http=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
threading.Thread(target=http.serve_forever,daemon=True).start()
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,**({'channel':'msedge'} if browser_name=='msedge' else {}))
  for width,height in ((1440,900),(390,844)):
   ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   page=ctx.new_page()
   failed=[];responses=[]
   page.on('requestfailed',lambda req:failed.append(req.url))
   page.on('response',lambda res:responses.append((res.url,res.status)) if ASSET in res.url else None)
   page.goto(f'http://127.0.0.1:{http.server_port}/heist-salvage-yard.html',wait_until='domcontentloaded',timeout=45000)
   hero=page.locator('.mapbox > img')
   expect(hero).to_have_attribute('src','./'+ASSET)
   expect(hero).to_be_visible(timeout=8000)
   hero.scroll_into_view_if_needed()
   try:
    page.wait_for_function("""() => {
      const hero=document.querySelector('.mapbox>img');
      return hero && hero.complete && hero.naturalWidth>0 && hero.naturalHeight>0;
    }""",timeout=16000)
   except Exception as exc:
    state=hero.evaluate("""h=>({src:h.currentSrc,complete:h.complete,
     width:h.naturalWidth,height:h.naturalHeight,loading:h.loading})""")
    raise AssertionError(f'Approved Salvage Yard illustration failed to load on {browser_name} {width}: {state}; responses={responses}; failed={failed[:5]}') from exc
   assert any(code==200 for _,code in responses),f'Asset request not HTTP 200: {responses}'
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),f'Viewport overflow at {width}'
   out=ROOT/'qa-evidence'/browser_name
   out.mkdir(parents=True,exist_ok=True)
   hero.screenshot(path=str(out/f'atlas220-salvage-art-{width}.png'),animations='disabled')
   print(f'PASS Salvage Yard {browser_name} {width}: exact approved local artwork HTTP 200, decoded and visible',flush=True)
   ctx.close()
  browser.close()
finally:
 http.shutdown()
