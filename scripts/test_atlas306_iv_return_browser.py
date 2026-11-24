#!/usr/bin/env python3
"""Atlas 30.6: visible IV/TLAD/TBOGT map return at four viewports."""
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright,expect

root=Path(__file__).resolve().parents[1]
public=root/'public'
assert (public/'atlas-iv.html').exists(),'Build Cloudflare payload first'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(public)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/atlas-iv.html'
out=root/'qa-evidence'/'chromium'
out.mkdir(parents=True,exist_ok=True)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width,height in ((375,667),(390,844),(844,390),(1440,900)):
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   page=context.new_page()
   page.route('https://**/*',lambda route:route.abort())
   errors=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   for scope in ('iv','tlad','tbogt'):
    page.goto(base+'?scope='+scope,wait_until='domcontentloaded',timeout=45000)
    page.wait_for_function("() => window.TeamJuraIV3DBridge?.hasData() && document.querySelectorAll('#classicResults .classic-result').length>0",timeout=30000)
    detail=page.locator('#detailContent')
    back=page.locator('#j306-return-map')
    expect(back).to_be_hidden()
    page.locator('#classicResults .classic-result').first.click()
    expect(detail).to_be_visible()
    expect(back).to_be_visible()
    snapshot=page.evaluate("""() => ({
       state:window.TeamJuraIV3DBridge.state(),
       favorites:localStorage.getItem('jura-iv-favorites'),
       found:localStorage.getItem('team-jura-iv-bird-progress-v1'),
       route:localStorage.getItem('team-jura-iv-route-v1:'+document.body.dataset.ivScope)
    })""")
    assert snapshot['state']['selectedId'],(scope,width,height,'selected ID missing')
    bounds=back.bounding_box()
    assert bounds and bounds['width']>=120 and bounds['height']>=44,(scope,width,height,bounds)
    if width==390 and scope=='tlad':
     page.screenshot(path=str(out/'atlas306-tlad-return-phone.png'),full_page=False)
    back.click()
    expect(detail).to_be_hidden()
    expect(back).to_be_hidden()
    expect(page.locator('#classicCanvas')).to_be_focused()
    state=page.evaluate('window.TeamJuraIV3DBridge.state()')
    assert state['selectedId'] is None
    assert all(state[key]==snapshot['state'][key] for key in ('x','y','z','layer')),(scope,width,height,'Map camera reset')
    assert page.evaluate("new URL(location.href).searchParams.get('scope')")==scope
    assert page.evaluate("!new URL(location.href).searchParams.has('loc')")
    assert page.evaluate("""() => ({
       favorites:localStorage.getItem('jura-iv-favorites'),
       found:localStorage.getItem('team-jura-iv-bird-progress-v1'),
       route:localStorage.getItem('team-jura-iv-route-v1:'+document.body.dataset.ivScope)
    })""") == {key:snapshot[key] for key in ('favorites','found','route')}
    page.locator('#classicResults .classic-result').first.click()
    expect(back).to_be_visible()
    back.focus()
    page.keyboard.press('Escape')
    expect(detail).to_be_hidden()
    expect(page.locator('#classicCanvas')).to_be_focused()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(scope,width,height,'horizontal overflow')
   assert not errors,(width,height,errors)
   context.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 30.6 passed: IV, TLAD, TBOGT × four viewports, back/Escape, map camera, history and progress preserved')
