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
   page=context.new_page()
   for name in pages:
    page.goto(base+name,wait_until='domcontentloaded',timeout=45000)
    back=page.locator('#j302-back-to-map')
    card=page.locator('#selectedCard')
    expect(back).to_have_count(1,timeout=15000)
    assert not back.is_visible(),(name,width,height,'Hidden card return leaked into map')
    before=page.evaluate("""() => ({
      progress:localStorage.getItem('jura3-progress'),
      routes:localStorage.getItem('jura-atlas-routes'),
      pins:localStorage.getItem('jura-atlas-pins'),
      hash:location.hash,
      history:history.length
    })""")
    # Test long marker notes and tall photos without relying on a remote source.
    page.evaluate("""() => {
      const card=document.getElementById('selectedCard');
      card.classList.remove('hidden');
      document.getElementById('selectedName').textContent='Long verified landmark briefing';
      document.getElementById('selectedInfo').textContent=('Detailed mission research · ').repeat(70);
      document.getElementById('selectedAddress').textContent=('Additional local source information. ').repeat(30);
      const figure=document.getElementById('selectedPhotoFigure');
      figure.hidden=false;
      figure.innerHTML='<div style="height:380px">Source media placeholder sizing only</div>';
    }""")
    expect(back).to_be_visible(timeout=12000)
    rect=back.bounding_box()
    card_rect=card.bounding_box()
    assert rect is not None and card_rect is not None
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
    page.evaluate("""() => {
      const c=document.querySelector('#selectedCard');
      c.classList.remove('hidden');
    }""")
    back.focus()
    page.keyboard.press('Escape')
    expect(card).to_be_hidden(timeout=10000)
    expect(page.locator('#atlasCanvas')).to_be_focused(timeout=10000)
    # The existing × remains operational with an accessible 44px hitbox.
    page.evaluate("document.getElementById('selectedCard').classList.remove('hidden')")
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
      pins:localStorage.getItem('jura-atlas-pins'),
      hash:location.hash,
      history:history.length
    })""")
    assert after==before,(name,width,height,'Exit mutated map history or guest progress')
   context.close()
  browser.close()
finally:
 server.shutdown()
print('Atlas 30.2 passed: 3 maps × four viewports, reachable scroll-sticky Back, Escape and focus, no progress mutations')
