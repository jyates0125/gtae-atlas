#!/usr/bin/env python3
"""Atlas 19.1: visible starter POIs on all three 2D maps, with saved choices preserved."""
import os,threading
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1];PUBLIC=ROOT/'public'
if not(PUBLIC/'atlas.html').exists():raise SystemExit('Build public/ first')
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(PUBLIC)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base='http://127.0.0.1:%s/'%server.server_port
options={'atlas.html':('5-story',['landmark','transport','nature','collectible']),
 'atlas-online.html':('5-online',['landmark','transport','activity','collectible','shop']),
 'atlas-vi.html':('6',['landmark','transport','food'])}
engine=os.environ.get('ATLAS_BROWSER','chromium')
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,**({'channel':'msedge'} if engine=='msedge' else {}))
  for width,height in ((1440,900),(390,844)):
   for pageName,(scope,desired) in options.items():
    context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
    pg=context.new_page();errors=[]
    pg.on('pageerror',lambda e:errors.append(str(e)[:250]))
    pg.goto(base+pageName,wait_until='domcontentloaded',timeout=40000)
    pg.wait_for_function("() => window.JuraDualLegendAPI?.categories().some(c=>c.count>0)",timeout=25000)
    actual=pg.evaluate("""() => window.JuraDualLegendAPI.categories().filter(c=>c.enabled).map(c=>c.id)""")
    assert set(actual)==set(desired),(pageName,'unexpected default pin types',actual)
    count=pg.evaluate("""() => window.JuraDualLegendAPI.categories().filter(c=>c.enabled).reduce((sum,c)=>sum+c.count,0)""")
    assert count>0,(pageName,'default map falsely empty')
    # Explicitly hidden categories persist and are not silently reactivated.
    pg.evaluate("document.querySelector('#allOff').click()")
    pg.reload(wait_until='domcontentloaded')
    pg.wait_for_function("() => Boolean(window.JuraDualLegendAPI?.categories())")
    assert pg.evaluate("window.JuraDualLegendAPI.categories().filter(c=>c.enabled).length")==0,'All Off must survive reload'
    # Explicit All must survive reload too; never override stored preferences.
    pg.evaluate("document.querySelector('#allOn').click()")
    pg.reload(wait_until='domcontentloaded')
    pg.wait_for_function("() => Boolean(window.JuraDualLegendAPI?.categories())")
    assert pg.evaluate("window.JuraDualLegendAPI.categories().every(c=>c.enabled)"),'All On must survive reload'
    assert not errors,(pageName,'unhandled scripts',errors)
    print('PASS first-visit pins '+engine+' '+str(width)+' '+pageName+': '+str(count)+' default source records, all-off/all-on saved')
    context.close()
  browser.close()
finally:
 server.shutdown()
