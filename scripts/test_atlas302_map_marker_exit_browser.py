#!/usr/bin/env python3
"""Atlas 30.2: marker-card return remains reachable at phone, landscape, desktop."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright,expect

root=Path(__file__).resolve().parents[1]
public=root/'public'
assert (public/'atlas-vi.html').is_file(),'Build real Cloudflare payload before browser test'
pages=('atlas.html','atlas-online.html','atlas-vi.html')
sizes=((375,667),(390,844),(844,390),(1440,900))
out=root/'qa-evidence'/'chromium'
out.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=64
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(public)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/'
try:
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(headless=True)
  for width,height in sizes:
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   context.route('https://**/*',lambda route:route.abort())
   # Preload isolated guest fixtures through the real current save namespace.
   # The genuine selection engine must own marker state, including during
   # asynchronous daily-data refreshes that re-render the detail card.
   context.add_init_script("""(() => {
     const key='team-jura-atlas-v41-pins';
     if(localStorage.getItem(key)!==null)return;
     localStorage.setItem(key,JSON.stringify([
       ['5','story'],['5','online'],['6','vi']
     ].map(([game,scope])=>({
       id:'user-marker-exit-'+scope,game,scope,category:'user',x:0,y:0,
       name:'Long verified landmark briefing',tags:[],
       detail:'Detailed mission research · '.repeat(70),
       address:'Additional local source information. '.repeat(30),
       source:'My saved location',uncertain:false
     }))));
   })();""")
   page=context.new_page()
   for name in pages:
    page.goto(base+name,wait_until='domcontentloaded',timeout=45000)
    back=page.locator('#j302-back-to-map')
    card=page.locator('#selectedCard')
    expect(back).to_have_count(1,timeout=15000)
    # atlas.js initializes independently of the additive button and can
    # re-hide the selection card during its initial game/dataset switch.
    # Wait until the real close handler is attached and initial local network
    # requests have settled before injecting long-card fixture content.
    page.wait_for_function("() => typeof document.getElementById('closeSelected')?.onclick === 'function'",timeout=20000)
    page.wait_for_load_state('networkidle',timeout=20000)
    assert not back.is_visible(),(name,width,height,'Hidden card return leaked into map')
    scope={'atlas.html':'story','atlas-online.html':'online','atlas-vi.html':'vi'}[name]
    marker_id='user-marker-exit-'+scope
    def select_fixture():
     page.evaluate("(id) => window.JuraDualLegendAPI.selectPlace(id)",marker_id)
     expect(page.locator('#selectedName')).to_have_text('Long verified landmark briefing')
     expect(back).to_be_visible(timeout=12000)
    before=page.evaluate("""() => ({
      progress:localStorage.getItem('jura3-progress'),
      routes:localStorage.getItem('jura-atlas-routes'),
      pins:localStorage.getItem('team-jura-atlas-v41-pins'),
      hash:location.hash,
      history:history.length
    })""")
    # Select the real fixture; only media geometry is simulated. Daily feed
    # refreshes no longer hide a DOM-only card with no engine selection.
    select_fixture()
    page.evaluate("""() => {
      const figure=document.getElementById('selectedPhotoFigure');
      figure.hidden=false;
      const media=document.createElement('div');media.style.height='380px';
      media.textContent='Source media placeholder sizing only';figure.append(media);
    }""")
    rect=back.bounding_box()
    card_rect=card.bounding_box()
    assert rect is not None and card_rect is not None
    if name=='atlas-vi.html':
     overlay=page.evaluate("""() => {
       const back=document.getElementById('j302-back-to-map');
       const card=document.getElementById('selectedCard');
       const hub=document.getElementById('j217-vi-hub');
       const r=back.getBoundingClientRect();
       const top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
       return {cardZ:getComputedStyle(card).zIndex,hubZ:getComputedStyle(hub).zIndex,
        hit:!!top?.closest('#selectedCard'),obstruction:top?.tagName+'#'+(top?.id||'')};
     }""")
     assert overlay['hit'],(name,width,height,'Leonida overlay covers marker return',overlay)
    assert rect['width']>=120 and rect['height']>=44,(name,width,height,'Small back hitbox',rect)
    assert card_rect['height']<=height+2,(name,width,height,'Card taller than viewport',card_rect)
    # Both portrait and short landscape must keep the exit onscreen.
    if width<701 or height<=540:
     assert 0<=rect['y'] and rect['y']+rect['height']<=height+3,(name,width,height,'Cannot reach exit without page scroll',rect)
    assert page.evaluate("""() => {
      const c=document.querySelector('#selectedCard');
      return c.scrollHeight > c.clientHeight && getComputedStyle(c).overflowY==='auto';
    }"""),(name,width,height,'Long detail did not become an internal scroll')
    page.evaluate("document.querySelector('#selectedCard').scrollTop=9999")
    expect(back).to_be_visible()
    if width<701 or height<=540:
     sticky=back.bounding_box()
     assert sticky['y']>=0 and sticky['y']+sticky['height']<=height+3,(name,width,height,'Return scrolled outside viewport')
    if name=='atlas-vi.html' and width in (390,844):
     page.screenshot(path=str(out/f'atlas302-marker-exit-{width}x{height}.png'),full_page=False)
    # Exercising the original × handler is required, not class-removal hacks.
    back.click()
    expect(card).to_be_hidden(timeout=15000)
    expect(page.locator('#atlasCanvas')).to_be_focused(timeout=15000)
    # Escape must be equivalent while focus is within the detail region.
    select_fixture()
    back.focus()
    page.keyboard.press('Escape')
    expect(card).to_be_hidden(timeout=10000)
    expect(page.locator('#atlasCanvas')).to_be_focused(timeout=10000)
    # The existing × remains operational with an accessible 44px hitbox.
    select_fixture()
    x_button=page.locator('#closeSelected')
    x_rect=x_button.bounding_box()
    assert x_rect and x_rect['width']>=44 and x_rect['height']>=44,(
      name,width,height,'Original close hitbox undersized')
    x_button.click()
    expect(card).to_be_hidden(timeout=10000)
    expect(page.locator('#atlasCanvas')).to_be_focused(timeout=10000)
    after=page.evaluate("""() => ({
      progress:localStorage.getItem('jura3-progress'),
      routes:localStorage.getItem('jura-atlas-routes'),
      pins:localStorage.getItem('team-jura-atlas-v41-pins'),
      hash:location.hash,
      history:history.length
    })""")
    assert after==before,(name,width,height,'Exit mutated map history or guest progress')
   context.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 30.2 passed: 3 maps × four viewports, reachable scroll-sticky Back, Escape and focus, no progress mutations')
