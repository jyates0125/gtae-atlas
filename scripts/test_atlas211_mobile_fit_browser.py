#!/usr/bin/env python3
"""Atlas 21.1: prevent actual phone document overflow on V Story/Online/VI maps.

Runs on built Cloudflare public/ with ATLAS_BROWSER=chromium or msedge.
Checks 390px and 375px, navigation as a scroll *container*, map entry after
interaction, and records real screenshots for owner/brand review.
"""
import os
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
if not (PUBLIC/'atlas.html').is_file():
    raise SystemExit('Build public/ before mobile map acceptance')

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):
        pass

server=ThreadingHTTPServer(('127.0.0.1',0), partial(Quiet,directory=str(PUBLIC)))
threading.Thread(target=server.serve_forever,daemon=True).start()
origin='http://127.0.0.1:%d/'%server.server_port
engine=os.getenv('ATLAS_BROWSER','chromium')

def inspect(page, stage, path, width):
    data=page.evaluate("""() => {
      const nav=document.querySelector('.topbar>nav');
      const menu=document.querySelector('#j132-nav-toggle');
      const menuBox=menu?.getBoundingClientRect();
      const shortcut=document.querySelector('#sidebar a.j145-open-map[href="#atlasCanvas"]');
      const sidebar=document.querySelector('#sidebar');
      const box=shortcut?.getBoundingClientRect();
      const vw=innerWidth;
      return {
        viewport:vw, scroll:document.documentElement.scrollWidth,
        navClient:nav?.clientWidth||0, navScroll:nav?.scrollWidth||0,
        navOverflow:nav?getComputedStyle(nav).overflowX:'',
        navDisplay:nav?getComputedStyle(nav).display:'',
        menuWidth:menuBox?.width||0, menuLeft:menuBox?.left, menuRight:menuBox?.right,
        shortcutLeft:box?.left,shortcutRight:box?.right,
        sidebarRight:sidebar?.getBoundingClientRect().right,
        offenders:[...document.body.querySelectorAll('*')].filter(el=>{
          const r=el.getBoundingClientRect();
          return r.width>0 && r.left<vw && r.right>vw+2 &&
            getComputedStyle(el).position!=='fixed';
        }).slice(0,5).map(el=>({tag:el.tagName,id:el.id,cls:el.className}))
      };
    }""")
    assert data['viewport']==width, (stage,path,data)
    assert data['scroll']<=width+1, (stage,path,data)
    if path in ('atlas.html','atlas-online.html'):
        assert data['navDisplay']=='none' and data['navClient']==0, (stage,path,data)
        assert data['menuWidth']>=38 and data['menuLeft']>=0 and data['menuRight']<=width+1,(stage,path,data)
    else:
        assert 0<data['navClient']<=width, (stage,path,data)
        assert data['navOverflow'] in ('auto','scroll'),(stage,path,data)
    assert data['shortcutRight'] is not None and data['shortcutRight']<=width+1, (stage,path,data)
    assert data['sidebarRight']<=width+1, (stage,path,data)
    return data

try:
    with sync_playwright() as pw:
        launch={'headless':True}
        if engine=='msedge':launch['channel']='msedge'
        browser=pw.chromium.launch(**launch)
        for width in (390,375):
            context=browser.new_context(viewport={'width':width,'height':844},device_scale_factor=1,
                                        is_mobile=True,has_touch=True,reduced_motion='reduce')
            for path in ('atlas.html','atlas-online.html','atlas-vi.html'):
                page=context.new_page()
                page.goto(origin+path,wait_until='domcontentloaded',timeout=45000)
                page.locator('#sidebar a.j145-open-map[href="#atlasCanvas"]').wait_for(state='visible',timeout=15000)
                if path in ('atlas.html','atlas-online.html'):
                    page.locator('#j132-nav-toggle').wait_for(state='visible',timeout=15000)
                    page.locator('#j132-nav-toggle').click()
                    page.locator('#j132-search').fill('Tracker & HQ')
                    page.locator('#j132-groups a[href="./atlas81-hq.html"]').wait_for(state='visible',timeout=6500)
                    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
                    page.keyboard.press('Escape')
                    page.locator('#j132-nav-drawer').wait_for(state='hidden',timeout=6500)
                page.wait_for_timeout(350)
                inspect(page,'loaded',path,width)
                # This shortcut must retain real map-first interaction and must
                # not create an offscreen horizontal stripe after sidebar hide.
                page.locator('#sidebar a.j145-open-map[href="#atlasCanvas"]').click()
                page.wait_for_function("document.getElementById('sidebar')?.classList.contains('mobile-collapsed')",
                                       timeout=7000)
                inspect(page,'map shortcut',path,width)
                out=ROOT/'qa-evidence'/engine/'mobile-fit'
                out.mkdir(parents=True,exist_ok=True)
                page.screenshot(path=str(out/(path.replace('.html','')+'-'+str(width)+'.png')),
                                animations='disabled',full_page=False,timeout=20000)
                page.close()
            context.close()
        browser.close()
        print('PASS Atlas 21.1 %s: Story/Online/VI mobile widths 375/390, compact unified/scrollable VI navigation, no document overflow, live map shortcut' % engine)
finally:
    server.shutdown()
