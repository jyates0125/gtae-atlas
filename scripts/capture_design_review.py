#!/usr/bin/env python3
"""Non-gating Elario designed-brand screenshots in *separate* browser contexts.

Run after functional QA. Never include personal progress or screenshot PNGs
in the Cloudflare public build. Review screenshots manually against approved
reference artwork; a screenshot cannot verify remote tile completeness.
"""
from __future__ import annotations
import asyncio, functools, http.server, json, os, socketserver, threading
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
BROWSER=os.getenv('ATLAS_BROWSER','chromium').lower()
PAGES=[
 'index.html','atlas-dashboard.html','atlas-account.html','atlas-share.html','maps.html','atlas-activities.html?mode=online',
 'atlas93-garage.html','project.html','atlas.html','atlas-vi.html',
 'one-last-ride.html','atlas155-art-review.html','atlas-characters.html','heists.html','elario.html',
 'atlas-online.html','atlas90-weapons.html','atlas-vehicle-configurator.html','map-hub.html?game=vc',
 'atlas-iv.html','atlas-iv.html?scope=tlad','atlas-iv.html?scope=tbogt','atlas-sa.html','atlas-cayo.html','atlas-animals.html','atlas-collectibles.html','atlas90-vehicles5.html','atlas90-vehicles6.html','map-hub.html?game=iii','map-hub.html?game=vcs','map-hub.html?game=lcs','map-hub.html?game=ctw','map-hub.html?game=tlad','map-hub.html?game=tbogt','heist-fleeca.html','heist-prison-break.html','heist-humane-labs.html','heist-series-a.html','heist-pacific-standard.html','heist-doomsday-act-1.html','heist-doomsday-act-2.html','heist-doomsday-act-3.html','heist-diamond-casino.html','heist-cayo-perico.html','heist-cluckin-bell.html','heist-salvage-yard.html','heist-auto-shop.html','heist-agency-vip.html','heist-kortz-center.html'
]
# Sitewide visual contract: preserve special route/query screenshots above,
# then include EVERY built public HTML page at both desktop and phone sizes.
# A screenshot cannot prove that interactions work; functional smoke tests
# remain the separate release gate.
COVERED={name.split('?',1)[0] for name in PAGES}
PAGES.extend(sorted(p.name for p in PUBLIC.glob('*.html') if p.name not in COVERED))
assert {p.name for p in PUBLIC.glob('*.html')}.issubset({name.split('?',1)[0] for name in PAGES})
VIEWPORTS=[('desktop',1440,900),('mobile',390,844)]
OUT=ROOT/'qa-evidence'/BROWSER

class Static(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(PUBLIC),**kwargs)
    def log_message(self,*args):pass

class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address=True
    daemon_threads=True

async def capture():
    OUT.mkdir(parents=True,exist_ok=True)
    records=[]
    with Server(('127.0.0.1',0),Static) as http:
        port=http.server_address[1]
        thread=threading.Thread(target=http.serve_forever,daemon=True)
        thread.start()
        try:
            async with async_playwright() as playwright:
                opts={'headless':True,'args':['--no-sandbox']}
                if BROWSER=='msedge':opts['channel']='msedge'
                elif BROWSER!='chromium':raise RuntimeError('Unsupported browser: '+BROWSER)
                browser=await playwright.chromium.launch(**opts)
                try:
                    for label,width,height in VIEWPORTS:
                        # Fresh isolated browser state, never user's account or saves.
                        context=await browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
                        try:
                            for path in PAGES:
                                slug=path.removesuffix('.html').replace('.html','').replace('?','-').replace('=','-').replace('/','-')
                                file=OUT/label/(slug+'.png')
                                file.parent.mkdir(parents=True,exist_ok=True)
                                page=await context.new_page()
                                try:
                                    response=await page.goto(f'http://127.0.0.1:{port}/'+path,wait_until='domcontentloaded',timeout=20000)
                                    if not response or response.status!=200:
                                        raise RuntimeError('Unexpected page response')
                                    await page.wait_for_timeout(700)
                                    await page.screenshot(path=str(file),animations='disabled',timeout=26000 if path=='legacy-explorer.html' else 12000,full_page=False)
                                    # Advisory: a visually present image that has actually failed
                                    # to load is actionable. Lazy offscreen images are excluded.
                                    image_issues=await page.evaluate("""() => [...document.images]
                                      .filter(img=>{const r=img.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0})
                                      .filter(img=>img.complete&&img.naturalWidth===0)
                                      .map(img=>({src:img.getAttribute('src')||'',alt:img.alt||''})).slice(0,12)""")
                                    overflow=await page.evaluate("""() => {
                                      const width=window.innerWidth;
                                      const scroll=document.documentElement.scrollWidth;
                                      if(scroll<=width+8)return {scroll,width,offenders:[]};
                                      const offenders=[...document.body.querySelectorAll('*')].map(el=>{
                                        const box=el.getBoundingClientRect();
                                        return {el,left:Math.round(box.left),right:Math.round(box.right),
                                          width:Math.round(box.width)};
                                      }).filter(o=>o.width>0&&o.left<width&&o.right>width+8)
                                        .sort((a,b)=>b.right-a.right).slice(0,18)
                                        .map(o=>({tag:o.el.tagName.toLowerCase(),id:o.el.id,
                                          cls:String(o.el.className?.baseVal||o.el.className||'').slice(0,100),
                                          left:o.left,right:o.right,width:o.width,
                                          overflowX:getComputedStyle(o.el).overflowX}));
                                      return {scroll,width,offenders};
                                    }""")
                                    records.append({'page':path,'viewport':[width,height],'captured':True,
                                      'file':file.relative_to(ROOT).as_posix(),
                                      'visibleImageFailures':image_issues,
                                      'horizontalOverflowPixels':max(0,overflow['scroll']-overflow['width']),
                                      'horizontalOverflowCandidates':overflow['offenders']})
                                except Exception as exc:
                                    records.append({'page':path,'viewport':[width,height],'captured':False,'reason':str(exc)[:260]})
                                    print('Visual evidence warning:',path,label,str(exc)[:180])
                                finally:
                                    await page.close()
                        finally:
                            await context.close()
                finally:
                    await browser.close()
        finally:
            http.shutdown()
    return records

async def main():
    if not (PUBLIC/'index.html').is_file():
        print('Visual evidence warning: public site not built')
        return 0
    try:records=await capture()
    except Exception as exc:
        records=[{'captured':False,'reason':'Capture environment unavailable: '+str(exc)[:260]}]
        print('Visual evidence warning:',str(exc)[:180])
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'manifest.json').write_text(json.dumps({
        'browser':BROWSER,
        'purpose':'Human visual reference comparison only; functional tests run separately',
        'designReference':'docs/APPROVED-DESIGNED-BRAND-MASTER.png',
        'captured':sum(bool(x['captured']) for x in records),
        'expected':len(VIEWPORTS)*len(PAGES),
        'entries':records
    },indent=2)+'\n',encoding='utf-8')
    for row in records:
        if row.get('horizontalOverflowPixels',0)>1:
            print('Viewport overflow',row['page'],row['viewport'],row['horizontalOverflowPixels'],row['horizontalOverflowCandidates'][:3])
    print('Design screenshots:',sum(bool(x['captured']) for x in records),'/',len(VIEWPORTS)*len(PAGES))
    # Review capture is advisory: never convert a flaky screenshot into a
    # failure of a fully independent map/data interaction test.
    return 0

if __name__=='__main__':raise SystemExit(asyncio.run(main()))
