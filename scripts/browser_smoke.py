#!/usr/bin/env python3
"""Cloudflare-oriented real-browser smoke tests for the fully assembled Atlas site.
Run after `pip install playwright` and `python -m playwright install chromium`.
Uses local HTTP so canvas fetch, video, and navigation share a genuine origin.
No live Rockstar/GTADB feed or external network request is considered verified.
"""
from __future__ import annotations
import asyncio, functools, http.server, json, os, socketserver, threading
from pathlib import Path
from playwright.async_api import async_playwright
PROJECT=Path(__file__).resolve().parents[1]
ROOT=Path(os.getenv('ATLAS_SERVE_ROOT', str(PROJECT/'public'))).resolve()
if not (ROOT/'index.html').is_file():
    raise SystemExit('Production site missing. Run: node scripts/build-cloudflare.cjs')
PORT=int(os.getenv('ATLAS_SMOKE_PORT','18765'))
URL=f'http://127.0.0.1:{PORT}'
PAGES=['atlas-cheats.html','atlas-news.html','atlas-vehicle-configurator.html','atlas-database.html','atlas-characters.html','atlas-animals.html','atlas-collectibles.html','index.html','maps.html','atlas.html','atlas-online.html','atlas-vi.html','atlas-research.html','atlas-iv.html','atlas-sa.html','atlas-cayo.html','atlas93-garage.html','atlas81-hq.html','atlas98-landmarks.html','atlas98-data-lab.html','atlas-source-registry.html','atlas-credits.html','atlas-activities.html?mode=story','atlas-activities.html?mode=online','atlas-activities.html?mode=vi','directory.html','discovery.html','leonida-hq.html','atlas-catalog.html','atlas-checklist.html','atlas-toolkit.html','atlas-passport.html','guides.html','team-jura.html','command-center.html','hunt-hq.html','atlas-calibration.html','atlas-coverage.html','atlas-verification.html','atlas-test-center.html','atlas-pack-format.html','atlas-feature-audit.html','atlas-completion.html','map-hub.html?game=vc','one-last-ride.html','elario.html','heists.html','heist-fleeca.html','heist-cayo-perico.html','atlas98-style-lab.html']

class Server(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args):pass

async def smoke():
    results=[]
    with socketserver.TCPServer(('127.0.0.1',PORT),Server) as http:
        thread=threading.Thread(target=http.serve_forever,daemon=True);thread.start()
        try:
            async with async_playwright() as pw:
                browser_mode=os.getenv('ATLAS_BROWSER','chromium').lower()
                opts={'headless':True,'args':['--no-sandbox']}
                if browser_mode=='msedge':opts['channel']='msedge'
                elif browser_mode not in ('chromium','msedge'):raise RuntimeError('Unsupported ATLAS_BROWSER: '+browser_mode)
                browser=await pw.chromium.launch(**opts)
                try:
                    for width,height in [(1440,900),(390,844)]:
                        ctx=await browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
                        for path in PAGES:
                            pg=await ctx.new_page()
                            if width==390 and path=='atlas.html':
                                # Simulate a transient mobile Canvas allocation failure.
                                # The real 2D engine must recover without a page reload.
                                await pg.add_init_script("""(() => {
                                  const original=HTMLCanvasElement.prototype.getContext;
                                  let missed=2;
                                  HTMLCanvasElement.prototype.getContext=function(kind,...args){
                                    if(this.id==='atlasCanvas' && kind==='2d' && missed>0){
                                      missed--;return null;
                                    }
                                    return original.call(this,kind,...args);
                                  };
                                })()""")
                            errors=[];missing=[]
                            pg.on('pageerror',lambda err:errors.append((getattr(err,'stack',None) or str(err))[:700]))
                            pg.on('response',lambda r:missing.append(r.url) if r.status>=400 and r.url.startswith(URL+'/') else None)
                            response=await pg.goto(URL+'/'+path,wait_until='domcontentloaded',timeout=25000)
                            await pg.wait_for_timeout(800)
                            info=await pg.evaluate('''() => ({title:document.title, h1:document.querySelector('h1')?.textContent?.trim(),scroll:document.documentElement.scrollWidth, width:window.innerWidth})''')
                            failures=[]
                            if not response or response.status!=200:failures.append('HTTP page response not 200')
                            if not info.get('title') or not info.get('h1'):failures.append('Missing page title or heading')
                            if errors:failures.extend('JS: '+e for e in errors)
                            if missing:failures.extend('Missing local response: '+e for e in missing)
                            if width==390 and path in ['index.html','maps.html','atlas98-data-lab.html','one-last-ride.html'] and info['scroll']>info['width']+35:failures.append(f"Mobile overflow {info['scroll']}/{info['width']}")
                            if not failures and path in ('atlas-cheats.html','atlas-news.html'):
                                try:
                                    await pg.wait_for_function("document.querySelector('#hubCount')?.textContent?.includes('snapshot ')",timeout=8000)
                                    if path=='atlas-cheats.html':
                                        if await pg.locator('#hubCards .h-card').count()<10:
                                            failures.append('Story quick cheat reference missing')
                                        await pg.locator('#hubSearch').fill('TURTLE')
                                        if await pg.locator('#hubCards .h-card').count()!=1:
                                            failures.append('Quick-code text search failed')
                                        await pg.locator('#hubGame').select_option('vi')
                                        if await pg.locator('#hubCards .h-card').count()!=0:
                                            failures.append('Speculative VI cheat cards displayed')
                                        await pg.locator('#hubGame').select_option('sa')
                                        await pg.locator('#hubSearch').fill('')
                                        if await pg.locator('#hubCards .h-card').count()<6:
                                            failures.append('Classic San Andreas cheats missing')
                                    else:
                                        if await pg.locator('#hubCards .h-card').count()<3:
                                            failures.append('Official VI news sources not loaded')
                                        await pg.locator('#hubGame').select_option('online')
                                        if await pg.locator('#hubCards .h-card').count()<1:
                                            failures.append('GTA Online news filter empty')
                                        urls=await pg.locator('#hubCards .h-card a').evaluate_all("(els)=>els.map(a=>a.href)")
                                        if any(not ('rockstargames.com' in u) for u in urls):
                                            failures.append('Unofficial news link in official-news hub')
                                except Exception as exc:
                                    failures.append('Cheats/Newsroom smoke test failed: '+str(exc)[:450])
                            if not failures and path=='atlas-vehicle-configurator.html':
                                try:
                                    await pg.wait_for_function("document.querySelector('#modelSelect')?.options.length > 20",timeout=8500)
                                    await pg.locator('#modelSelect').select_option('adder')
                                    if await pg.locator('#concept3d canvas').count()!=1:
                                        failures.append('Original 3D canvas missing')
                                    await pg.locator('#paintColor').fill('#d84443')
                                    await pg.locator('#buildName').fill('Team Jura test concept')
                                    await pg.locator('#saveBuild').click()
                                    saved=await pg.evaluate("JSON.parse(localStorage.getItem('team-jura-atlas101-concept-presets-v1')||'{}')")
                                    if saved.get('builds',{}).get('adder',{}).get('name')!='Team Jura test concept':
                                        failures.append('Concept preset did not save into isolated local storage')
                                    if 'addModel=adder' not in (await pg.locator('#addToGarage').get_attribute('href') or ''):
                                        failures.append('Chosen model does not link to My Garage')
                                    await pg.locator('#resetCamera').click()
                                except Exception as exc:
                                    failures.append('Original 3D configurator browser check failed: '+str(exc)[:450])
                            if not failures and path in ('atlas-database.html','atlas-characters.html','atlas-animals.html','atlas-collectibles.html'):
                                try:
                                    await pg.wait_for_function("document.querySelector('#universeStatus')?.textContent?.startsWith('Indexed ')",timeout=8000)
                                    expected_world={'atlas-database.html':'online','atlas-characters.html':'story','atlas-animals.html':'vi','atlas-collectibles.html':'story'}[path]
                                    expected_kind={'atlas-database.html':'vehicle','atlas-characters.html':'character','atlas-animals.html':'animal','atlas-collectibles.html':'collectible'}[path]
                                    if await pg.locator('#filterGame').input_value()!=expected_world:
                                        failures.append('Unexpected default game scope on '+path)
                                    if await pg.locator('#filterKind').input_value()!=expected_kind:
                                        failures.append('Unexpected default record category on '+path)
                                    if await pg.locator(f'[data-world="{expected_world}"]').get_attribute('aria-pressed')!='true':
                                        failures.append('World selector does not reflect default state on '+path)
                                    await pg.locator('[data-world="vi"]').click()
                                    if await pg.locator('#filterGame').input_value()!='vi':
                                        failures.append('VI world button failed on '+path)
                                    if await pg.locator('[data-world="vi"]').get_attribute('aria-pressed')!='true':
                                        failures.append('VI selector not marked active on '+path)
                                    await pg.locator(f'[data-world="{expected_world}"]').click()
                                    if await pg.locator('#filterGame').input_value()!=expected_world:
                                        failures.append('Could not restore initial world on '+path)
                                    cards=pg.locator('#recordGrid .u-card')
                                    if await cards.count()==0:
                                        failures.append('Universe catalog has no pictured/profile cards')
                                    else:
                                        await cards.first.locator('button.u-card-title').click()
                                        if await pg.locator('#recordDialog[open]').count()!=1:
                                            failures.append('Individual record detail dialog failed to open')
                                        else:
                                            await pg.locator('#recordDialog .u-close').click()
                                    if path=='atlas-database.html':
                                        await pg.locator('#filterKind').select_option('vehicle')
                                        if await pg.locator('#recordGrid .u-card').count()<2:
                                            failures.append('Vehicle catalog filtering removed all records')
                                        else:
                                            first=pg.locator('#recordGrid .u-card .u-card-actions button[aria-pressed="false"]').first
                                            if await first.count():
                                                await first.click()
                                                second=pg.locator('#recordGrid .u-card .u-card-actions button[aria-pressed="false"]').first
                                                if await second.count():await second.click()
                                                if await pg.locator('#openCompare').is_enabled():
                                                    await pg.locator('#openCompare').click()
                                                    if await pg.locator('#compareDialog[open]').count()!=1:
                                                        failures.append('Comparison panel failed to open')
                                                    await pg.locator('#compareDialog .u-close').click()
                                                else:failures.append('Comparison selection did not enable Compare')
                                        await pg.locator('#universeSearch').fill('unlikely-jura-000000')
                                        if await pg.locator('#recordGrid .u-card').count()!=0:
                                            failures.append('Universe search did not filter results')
                                except Exception as exc:
                                    failures.append('Universe catalog browser interaction failed: '+str(exc)[:450])
                            if not failures and path in ('index.html','maps.html'):
                                start=pg.locator('a.j99-start-link[href="./atlas97-journey.html"]')
                                if await start.count()!=1 or not await start.is_visible():failures.append('Start Here must be visible without opening the navigation menu')
                            if not failures and path=='index.html':
                                if await pg.locator('#featuredGrid a').count()<4:failures.append('Fewer than four flagship world cards')
                                if await pg.locator('a[href="./one-last-ride.html"]').count()==0:failures.append('Film link missing')
                            if not failures and path=='maps.html':
                                if await pg.locator('#directoryFeatured a, #directoryAdditional a').count()!=13:failures.append('Directory should show exactly 13 worlds')
                                covers=pg.locator('#directoryFeatured img,#directoryAdditional img')
                                if await covers.count()!=13:failures.append('Map directory must render 13 distinct covers')
                                else:
                                    # The site intentionally lazy-loads the nine
                                    # additional covers. Test real scroll-to-view
                                    # decoding, not an artificial 13-image eager
                                    # allocation spike that exhausts mobile Edge.
                                    for index in range(13):
                                        cover=covers.nth(index)
                                        try:
                                            await cover.scroll_into_view_if_needed(timeout=6500)
                                            await pg.wait_for_function("(i)=>{const el=document.querySelectorAll('#directoryFeatured img,#directoryAdditional img')[i];return !!el&&el.complete&&el.naturalWidth>0}",arg=index,timeout=8500)
                                        except Exception as err:
                                            src=await cover.get_attribute('src')
                                            failures.append('Atlas cover failed to load on scroll: '+str(src)+' · '+str(err)[:115])
                                            break
                                    urls=await covers.evaluate_all("(imgs)=>imgs.map(x=>x.getAttribute('src'))")
                                    if len(set(urls))!=13:failures.append('Duplicate world cover used')
                                    if len([x for x in urls if 'atlas106-' in x])!=7:
                                        failures.append('Seven original classic-world artwork files not displayed')
                            if not failures and path in ('atlas.html','atlas-online.html','atlas-vi.html'):
                                if await pg.locator('#atlasCanvas').count()==0:failures.append('Map canvas missing')
                                try:
                                    await pg.wait_for_function("document.querySelector('#layer')?.options.length >= 2",timeout=6500)
                                except Exception:
                                    failures.append('Map layer options missing after 6.5 seconds')
                                if await pg.locator('#juraMapLegend,#juraTrailerLegend').count():
                                    failures.append('Duplicate or trailer floating legend still in DOM')
                                if await pg.locator('#layer option[value="uv"],#layer option[value="uv2"]').count():failures.append('Retired UV pseudo-views still offered')
                                if await pg.locator('#search').count()==0:failures.append('Location search missing')
                                if await pg.locator('#atlasFilterDrawer').count()!=1:
                                    failures.append('Left legend missing')
                                else:
                                    try:
                                        drawer=pg.locator('#atlasFilterDrawer')
                                        if width<=700:
                                            side=pg.locator('#sidebar')
                                            if await side.evaluate("(el)=>el.classList.contains('mobile-collapsed')"):
                                                await pg.locator('#mobileTools').click()
                                            await drawer.scroll_into_view_if_needed(timeout=6000)
                                        await drawer.evaluate('(el)=>{el.open=true}')
                                        first=pg.locator('#legend button.legend-choice').first
                                        await first.wait_for(state='visible',timeout=6500)
                                        await first.scroll_into_view_if_needed(timeout=6500)
                                        if await first.get_attribute('aria-pressed')!='false':
                                            failures.append('New visitor sees active marker categories by default')
                                        else:
                                            await first.click(timeout=5000)
                                            if await pg.locator('#legend button.legend-choice').first.get_attribute('aria-pressed')!='true':
                                                failures.append('One-click category on did not change button state')
                                            if await pg.locator('#togglePins').get_attribute('aria-pressed')!='true':
                                                failures.append('One-click category on did not activate map pins')
                                            await pg.locator('#legend button.legend-choice').first.click(timeout=5000)
                                            if await pg.locator('#legend button.legend-choice').first.get_attribute('aria-pressed')!='false':
                                                failures.append('One-click category off did not disable pins')
                                    except Exception as exc:
                                        failures.append('Map legend could not be toggled: '+str(exc)[:700])
                                toggle=pg.locator('#juraToggle3d')
                                three=pg.locator('#jura3d')
                                two=pg.locator('#jura2d')
                                if await three.count()!=1 or await two.count()!=1:
                                    failures.append('Map 2D/3D dimension controls missing')
                                elif path!='atlas-vi.html':
                                    if await three.is_visible() or await toggle.is_visible():
                                        failures.append('Legacy map exposed unfinished 3D instead of primary illustrated 2D')
                                elif not await three.is_visible() or not await two.is_visible():
                                    failures.append('GTA VI research 3D controls hidden')
                                else:
                                    try:
                                        await three.click(timeout=6500)
                                        await pg.wait_for_timeout(150)
                                        if await toggle.get_attribute('aria-pressed')!='true':
                                            failures.append('3D dimension did not activate')
                                        if not await pg.locator('body').evaluate("(el)=>el.classList.contains('jura-in-3d')"):
                                            failures.append('3D map view did not activate')
                                        await two.click(timeout=6500)
                                        if await toggle.get_attribute('aria-pressed')!='false':
                                            failures.append('3D button did not return to 2D')
                                        if await pg.locator('body').evaluate("(el)=>el.classList.contains('jura-in-3d')"):
                                            failures.append('Native 2D map did not recover after 3D')
                                    except Exception as exc:
                                        failures.append('3D map control could not be used: '+str(exc)[:150])
                            if not failures and path in ('heist-fleeca.html','heist-cayo-perico.html'):
                                scene=pg.locator('.mapbox > img')
                                if await scene.count()!=1:failures.append('Heist illustration missing')
                                else:
                                    image_src=await scene.get_attribute('src')
                                    if not image_src or 'atlas93-heist-' not in image_src:
                                        failures.append('Specific original heist art not selected')
                                    await scene.evaluate("(el)=>el.loading='eager'")
                                    try:
                                        await pg.wait_for_function("() => { const x=document.querySelector('.mapbox > img'); return x && x.complete && x.naturalWidth > 0; }",timeout=6000)
                                    except Exception:
                                        failures.append('Original heist illustration did not load')
                            if not failures and path in ('heists.html','heist-fleeca.html','heist-cayo-perico.html'):
                                try:
                                    await pg.wait_for_selector('.sitebar .j104-logo',timeout=6000)
                                    if path=='heists.html':
                                        if await pg.locator('.cards .card[data-theme]').count()<10:
                                            failures.append('Heist HQ lacks operation-specific art classes')
                                    else:
                                        await pg.wait_for_selector('#missionBrief .j104-brief-visual img',timeout=7000)
                                        if await pg.locator('#missionBrief .j104-mission-flow li').count()<1:
                                            failures.append('Heist planning sequence missing')
                                        if await pg.locator('.j104-heist-actions button').count()!=1:
                                            failures.append('Heist-specific planning board action missing')
                                        if path=='heist-fleeca.html':
                                            if await pg.locator('.j104-optional-world summary').count()!=1:
                                                failures.append('General map not demoted to optional reference')
                                        if path=='heist-cayo-perico.html':
                                            if await pg.locator('.j104-heist-actions a[href="./atlas-cayo.html"]').count()!=1:
                                                failures.append('Cayo island planner not directly linked')
                                except Exception as exc:
                                    failures.append('Heist-specific planning UI unavailable: '+str(exc)[:330])
                            if not failures and path.startswith('map-hub.html?game='):
                                await pg.wait_for_selector('#classicFlatLink',timeout=7000)
                                href=await pg.locator('#classicFlatLink').get_attribute('href')
                                if href!='https://gtamap.io/gta-vice-city-map/':
                                    failures.append('Wrong 1986 Vice City actual map reference: '+str(href))
                                if await pg.locator('#classicMapBackground').count()!=1:
                                    failures.append('Existing personal map workbench missing')

                                if await pg.locator('img[src="./art/elario-crest.svg"]').count()!=1:
                                    failures.append('Original Elario crest missing on classic world')
                                try:
                                    # Use a generated original 16x8 image; never depend on a third-party map.
                                    await pg.evaluate("""async () => {
                                      const c=document.createElement('canvas');c.width=16;c.height=8;
                                      const ctx=c.getContext('2d');ctx.fillStyle='#49a4b4';ctx.fillRect(0,0,16,8);
                                      const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));
                                      const dt=new DataTransfer();dt.items.add(new File([blob],'team-jura-local-test.png',{type:'image/png'}));
                                      const input=document.getElementById('classicImageFile');
                                      input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));
                                    }""")
                                    await pg.wait_for_function("document.getElementById('classicViewport')?.dataset.mapImage==='local-highres'",timeout=10000)
                                    bounds=await pg.locator('#classicMapSurface').bounding_box()
                                    if not bounds or abs(bounds['width']/bounds['height']-2)>.05:
                                        failures.append('Imported classic map lost its native 2:1 aspect ratio')
                                    await pg.locator('.classic-accordions details').nth(2).locator('summary').click()
                                    await pg.locator('#classicAddPin').click()
                                    await pg.locator('#classicMapSurface').click(position={'x':bounds['width']/2,'y':bounds['height']/2})
                                    await pg.locator('#markerName').fill('Local high-res marker test')
                                    await pg.locator('#markerSave').click()
                                    if await pg.locator('#pinCount').inner_text()!='1':
                                        failures.append('Personal map marker was not placed')
                                    await pg.reload(wait_until='domcontentloaded')
                                    await pg.wait_for_function("document.getElementById('classicViewport')?.dataset.mapImage==='local-highres'",timeout=10000)
                                    if await pg.locator('#pinCount').inner_text()!='1':
                                        failures.append('Markers were lost after restoring an offline high-res image')
                                    await pg.locator('.classic-accordions details').nth(2).locator('summary').click()
                                    await pg.evaluate("window.confirm=()=>true")
                                    await pg.locator('#classicClearMap').click()
                                    await pg.wait_for_function("document.getElementById('classicViewport')?.dataset.mapImage==='original-art'",timeout=10000)
                                    if await pg.locator('#pinCount').inner_text()!='1':
                                        failures.append('Removing an imported image deleted personal markers')
                                    await pg.locator('#classicClear').click()
                                except Exception as exc:
                                    failures.append('Local classic high-resolution image regression: '+str(exc)[:300])
                            if not failures and path.startswith('atlas-activities.html'):
                                if not await pg.locator('body.j112-activities').count():
                                    failures.append('Elario Activity Intelligence design missing')
                                if not await pg.locator('.j112-activity-hero h1#headline').is_visible():
                                    failures.append('Game-specific activity hero/title missing')
                                try:
                                    await pg.wait_for_function("() => Number(document.getElementById('ruleCount')?.textContent) >= 0 && Number(document.getElementById('resultTotal')?.textContent?.split(' ')[0]) >= 0", timeout=8500)
                                    if await pg.locator('.rule-list .rule').count() == 0 and 'mode=vi' not in path:
                                        failures.append('Activity cards did not render')
                                    if 'mode=story' in path and not await pg.locator('#storyControls').is_visible():
                                        failures.append('Story-only prerequisites not exposed')
                                    if 'mode=online' in path and not await pg.locator('#onlineControls').is_visible():
                                        failures.append('Online-only event filters not exposed')
                                    if 'mode=vi' in path and not await pg.locator('#viControls').is_visible():
                                        failures.append('VI research controls not exposed')
                                except Exception as exc:
                                    failures.append('Activities failed game-mode initialization: '+str(exc)[:250])
                            if not failures and path in ('directory.html','discovery.html','leonida-hq.html'):
                                if not await pg.locator('body.j112-unified').count():
                                    failures.append('Older destination was not upgraded to the current Elario theme')
                            if not failures and path in ('atlas-catalog.html','atlas-checklist.html','atlas-toolkit.html','atlas-passport.html','guides.html','team-jura.html','command-center.html','hunt-hq.html'):
                                if not await pg.locator('body.j113-workspace').count():
                                    failures.append('Atlas 11.3 current Elario workspace theme not present')
                                if not await pg.locator('link[href^="./atlas113-workspaces.css"]').count():
                                    failures.append('Modern workspace CSS link missing')
                                if path=='atlas-catalog.html' and not await pg.locator('#dbSearch').count():
                                    failures.append('Vehicle/location catalog search missing')
                                if path=='atlas-checklist.html' and not await pg.locator('#setSearch').count():
                                    failures.append('Game-scoped collectibles search missing')
                                if path=='hunt-hq.html':
                                    if not await pg.locator('#canvas').count():
                                        failures.append('Research canvas missing after redesign')
                                    if not await pg.locator('a[href="./atlas81-hq.html#collections"]').count():
                                        failures.append('Canonical collection HQ link missing')
                            if not failures and path in ('atlas-calibration.html','atlas-coverage.html','atlas-verification.html','atlas-test-center.html','atlas-pack-format.html','atlas-feature-audit.html','atlas-completion.html'):
                                if not await pg.locator('body.j115-research').count():
                                    failures.append('Elario research page does not use the current visual system')
                                if not await pg.locator('.j115-source-head h1').count():
                                    failures.append('Original research/verification hero is missing')
                                if path=='atlas-calibration.html' and await pg.locator('body').get_by_text('2,335 / 3,401').count():
                                    failures.append('Old VI landmark count still presented as current')
                                if path=='atlas-verification.html' and not await pg.locator('img.j115-original-crest').count():
                                    failures.append('Original Elario crest absent from the verification header')
                                if path=='atlas-test-center.html' and not await pg.locator('#pass').count():
                                    failures.append('QA controls missing after visual redesign')
                            if not failures and path=='atlas-credits.html':
                                if await pg.locator('h1#pageTitle').count()!=1:
                                    failures.append('Canonical credits page title missing')
                                if await pg.locator('.source-card').count()<16:
                                    failures.append('Source credits list incomplete')
                                if await pg.locator('a[href="https://gtamap.io/disclaimer/"]').count()!=1:
                                    failures.append('GTAMap.io original source disclaimer not linked')
                                if await pg.locator('a[href="https://github.com/rolux/gtadb.org"]').count()<1:
                                    failures.append('GTADB source repository not credited')
                                if await pg.locator('img[src="./art/elario-crest.svg"]').count()!=1:
                                    failures.append('Original Elario crest missing on credits')
                                if 'MANY CREWS' not in await pg.locator('header .brand').inner_text():
                                    failures.append('Community branding changed')
                                if await pg.locator('a[href^="./atlas109-credits.css"]').count()>0:
                                    failures.append('Unexpected stylesheet link inside document anchor')
                                try:
                                    await pg.locator('details summary').first.click()
                                    if not await pg.locator('details pre.license').first.is_visible():
                                        failures.append('GTADB MIT copyright notice cannot be expanded')
                                except Exception as exc:
                                    failures.append('Credits MIT license UI did not work: '+str(exc)[:250])
                            if not failures and path=='atlas93-garage.html':
                                await pg.locator('#showAll').click()
                                buttons=pg.locator('#garageCards article.card button.primary')
                                if await buttons.count()>0:
                                    await buttons.first.click()
                                    if await pg.locator('#garageDetails .j99-showroom canvas').count()!=1:failures.append('3D concept preview missing from selected Garage vehicle')
                                    if await pg.locator('#garageDetails .j99-3d-controls button').count()!=3:failures.append('Showroom interaction controls missing')
                                    if 'not a scanned or official model' not in (await pg.locator('#garageDetails .j99-showroom').inner_text()).lower():failures.append('3D concept rights disclaimer missing')
                                else:failures.append('Garage vehicle catalogue did not load')
                                await pg.locator('#garageSearch').fill('squalo')
                                await pg.locator('#garageClassFilter').select_option('Boats & Watercraft')
                                boat=pg.locator('#garageCards article.card button.primary').first
                                if await boat.count()!=1:
                                    failures.append('Boat not found in class-correct catalog')
                                else:
                                    await boat.click()
                                    intelligence=await pg.locator('#garageDetails .j104-intelligence').inner_text()
                                    if 'Shitzu' not in intelligence or '65.75 mph' not in intelligence:
                                        failures.append('Squalo boat facts did not load')
                                    if await pg.locator('#garageDetails .j99-showroom canvas').count()!=0:
                                        failures.append('Boat incorrectly represented as generic 3D car')
                                await pg.locator('#garageClassFilter').select_option('all')
                                await pg.locator('#garageSearch').fill('')
                            if not failures and path=='atlas-research.html':
                                if await pg.locator('#map').count()==0:failures.append('Research canvas missing')
                                if await pg.locator('#showResearchPins:checked').count()!=0:failures.append('Research pins should start hidden')
                                if await pg.locator('.j94-view-deck').count():failures.append('Legacy duplicate research map legend remains')
                                if 'GTADB.org' not in await pg.locator('#researchSourceStatus').inner_text():failures.append('Licensed VI research records did not load')
                            if not failures and path=='atlas-sa.html':
                                try:
                                    await pg.wait_for_function("document.querySelector('#mapBackground .j86-san-map')?.naturalWidth > 200",timeout=9000)
                                    source=await pg.locator('#mapBackground .j86-san-map').get_attribute('src')
                                    if 'atlas-sa-vector.svg' not in source:
                                        failures.append('Bundled licensed San Andreas 2D map did not render as the primary artwork')
                                    if not await pg.locator('.j86-sa-credit a').count():
                                        failures.append('San Andreas vector license attribution missing')
                                    await pg.wait_for_function("document.querySelector('#mapped')?.textContent?.trim()==='150'",timeout=9000)
                                    if await pg.locator('#categories .cat[aria-pressed="true"]').inner_text() and 'Snapshots' not in await pg.locator('#categories .cat[aria-pressed="true"]').inner_text():
                                        failures.append('San Andreas default set should show sourced snapshot locations')
                                    if await pg.locator('#pinLayer .pin-source-projected').count()!=50:
                                        failures.append('San Andreas 50 snapshot markers missing on vector map')
                                    await pg.locator('#categories .cat').filter(has_text='Horseshoes').click()
                                    if await pg.locator('#pinLayer .pin-source-projected').count()!=50:
                                        failures.append('San Andreas horseshoe markers missing')
                                    await pg.locator('#categories .cat').filter(has_text='Oysters').click()
                                    if await pg.locator('#pinLayer .pin-source-projected').count()!=50:
                                        failures.append('San Andreas oyster markers missing')
                                    await pg.locator('#categories .cat').filter(has_text='Graffiti Tags').click()
                                    if await pg.locator('#pinLayer .pin-source-projected').count()!=0:
                                        failures.append('Unverified graffiti tag positions were fabricated')
                                    if 'approximate' not in (await pg.locator('.j105-accuracy').inner_text()).lower():
                                        failures.append('Approximate coordinate disclaimer missing')
                                    await pg.locator('#categories .cat').filter(has_text='Snapshots').click()
                                    if await pg.locator('#items #item-1 input[type="checkbox"]').count()==0:
                                        failures.append('Individual sourced completion tracking missing')
                                except Exception as exc:
                                    failures.append('San Andreas local base artwork could not load: '+str(exc)[:240])
                            if not failures and path=='atlas-iv.html':
                                if await pg.locator('#classicCanvas').count()==0:failures.append('GTA IV canvas missing')
                                if await pg.locator('#classicLayer option').count()<2:failures.append('GTA IV layers missing')
                                if 'source landmarks' not in await pg.locator('#recordStatus').inner_text():failures.append('Local GTA IV landmark snapshot did not load') 
                                if await pg.locator('#classic3dToggle').count():
                                    failures.append('Older map incorrectly includes deferred 3D viewer')
                            if not failures and path=='atlas98-landmarks.html':
                                if 'sourced landmarks shown' not in await pg.locator('#landmarkStatus').inner_text():failures.append('Bundled VI landmark library did not load')
                            if not failures and path=='one-last-ride.html':
                                if await pg.locator('video source[src*="one-last-ride-motion-preview.mp4"]').count()==0:failures.append('Film preview source missing')
                            results.append({'page':path,'viewport':width,'ok':not failures,'issues':failures})
                            await pg.close()
                        await ctx.close()
                    ctx=await browser.new_context(viewport={'width':1366,'height':850})
                    pg=await ctx.new_page()
                    await pg.goto(URL+'/atlas98-data-lab.html',wait_until='domcontentloaded')
                    csv=b'name,category,x,y\nHawick,landmark,100,200\nVespucci,landmark,-150,300\n'
                    await pg.locator('#sourceFile').set_input_files({'name':'sample.csv','mimeType':'text/csv','buffer':csv})
                    await pg.locator('#sourceName').fill('Original functional smoke data')
                    await pg.locator('#license').select_option('original')
                    await pg.locator('#coordinateSystem').select_option('gta-world-xy')
                    await pg.locator('#review').click()
                    records=(await pg.locator('#total').inner_text()).strip()
                    ready=await pg.locator('#mapPack').is_enabled()
                    results.append({'page':'Data Lab interactive CSV/pack export','viewport':1366,'ok':records=='2' and ready,'issues':[] if records=='2' and ready else [f'Unexpected validated total {records}, map pack enabled {ready}']})
                    await ctx.close()
                    # Simulate a failed optional route-core script in the real
                    # 390px game-map viewer; core map and legend must still boot.
                    ctx=await browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
                    pg=await ctx.new_page()
                    nav_errors=[]
                    pg.on('pageerror',lambda e:nav_errors.append(str(e)[:300]))
                    async def block_road_core(route):await route.abort()
                    await pg.route('**/atlas-road-core.js*',block_road_core)
                    await pg.goto(URL+'/atlas.html',wait_until='domcontentloaded',timeout=25000)
                    degraded=[]
                    try:
                        await pg.wait_for_function("() => document.querySelector('#layer')?.options.length >= 2 && document.querySelector('#legend')?.children.length > 0",timeout=11000)
                        status=await pg.locator('#juraNavStatus').inner_text()
                        if 'Route navigation temporarily unavailable' not in status:
                            degraded.append('No degraded-route guidance when road-core is missing')
                        if await pg.evaluate("Boolean(window.teamJuraNav)"):
                            degraded.append('Router incorrectly initialized without its required road core')
                        if nav_errors:
                            degraded.extend('Unhandled JS error: '+e for e in nav_errors)
                    except Exception as e:
                        degraded.append('Game map did not survive missing optional road-core: '+str(e)[:350])
                    results.append({'page':'GTA V mobile map with blocked optional road-core','viewport':390,'ok':not degraded,'issues':degraded})
                    await ctx.close()
                finally:await browser.close()
        finally:http.shutdown()
    report={'passed':sum(x['ok'] for x in results),'total':len(results),'results':results}
    (PROJECT/'docs').mkdir(exist_ok=True)
    (PROJECT/'docs'/('RELEASE-98C-'+os.getenv('ATLAS_BROWSER','chromium').upper()+'-BROWSER-SMOKE.json')).write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2));return 0 if report['passed']==report['total'] else 1

if __name__=='__main__':raise SystemExit(asyncio.run(smoke()))
