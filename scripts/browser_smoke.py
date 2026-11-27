#!/usr/bin/env python3
"""Cloudflare-oriented real-browser smoke tests for the fully assembled Atlas site.
Run after `pip install playwright` and `python -m playwright install chromium`.
Uses local HTTP so canvas fetch, video, and navigation share a genuine origin.
No live Rockstar/GTADB feed or external network request is considered verified.
"""
from __future__ import annotations
import asyncio, base64, functools, http.server, io, json, os, threading, zipfile
from pathlib import Path
from playwright.async_api import async_playwright
PROJECT=Path(__file__).resolve().parents[1]
ROOT=Path(os.getenv('ATLAS_SERVE_ROOT', str(PROJECT/'public'))).resolve()
if not (ROOT/'index.html').is_file():
    raise SystemExit('Production site missing. Run: node scripts/build-cloudflare.cjs')
PORT=int(os.getenv('ATLAS_SMOKE_PORT','18765'))
URL=f'http://127.0.0.1:{PORT}'
PAGES=['atlas-sa.html','atlas-stats.html','atlas-cheats.html','atlas-news.html','atlas-vehicle-configurator.html','atlas-database.html','atlas-characters.html','atlas-animals.html','atlas-collectibles.html','index.html','atlas-dashboard.html','atlas-share.html','atlas-account.html','maps.html','atlas.html','atlas-online.html','atlas-vi.html','atlas-research.html','atlas-iv.html','atlas-sa.html','atlas-cayo.html','atlas93-garage.html','atlas81-hq.html','atlas98-landmarks.html','atlas98-data-lab.html','atlas-source-registry.html','atlas-credits.html','project.html','atlas98b-test.html','atlas-activities.html?mode=story','atlas-activities.html?mode=online','atlas-activities.html?mode=vi','directory.html','discovery.html','leonida-hq.html','atlas-catalog.html','atlas-checklist.html','atlas-toolkit.html','atlas-passport.html','guides.html','team-jura.html','command-center.html','hunt-hq.html','atlas-calibration.html','atlas-coverage.html','atlas-verification.html','atlas-test-center.html','atlas-pack-format.html','atlas-feature-audit.html','atlas-completion.html','map-hub.html?game=vc','one-last-ride.html','elario.html','heists.html','heist-fleeca.html','heist-cayo-perico.html','atlas98-style-lab.html']

CLASSIC_WORLDS={
    'vc':('GTA Vice City','Properties'),
    'iii':('GTA III · Liberty City','Unique stunt jumps'),
    'vcs':('Vice City Stories','Red balloons'),
    'lcs':('Liberty City Stories','Rampages'),
    'ctw':('Chinatown Wars','Security cameras'),
    'tlad':('The Lost and Damned','Gang wars'),
    'tbogt':('The Ballad of Gay Tony','Base jumps'),
}
PAGES.extend('map-hub.html?game='+world for world in CLASSIC_WORLDS if world not in ('vc','tlad','tbogt'))
PAGES.extend(['atlas-iv.html?scope=tlad','atlas-iv.html?scope=tbogt'])
HEIST_PAGES={p.name for p in ROOT.glob('heist-*.html')}
if len(HEIST_PAGES)<15:
    raise SystemExit('The release must contain all 15 heist planning pages')
PAGES.extend(sorted(HEIST_PAGES.difference(PAGES)))
# Separate Story Mode progression must be exercised as a real URL state.
PAGES.append('atlas90-weapons.html?world=story')
# Atlas 19.1: every deployable root HTML page must be covered, including
# archive/secondary tools omitted from the earlier hand-maintained list.
PAGES.extend(p.name for p in sorted(ROOT.glob('*.html')) if p.name not in PAGES)
assert {p.name for p in ROOT.glob('*.html')} <= {p.split('?')[0] for p in PAGES}

# Release-candidate completeness: do not let newly added/older public pages fall
# through the cracks just because an earlier manual smoke list missed them.
# Preserve explicit query-state scenarios, then append every other published
# top-level HTML page exactly once for desktop + phone browser load checks.
AUDITED_PAGE_NAMES={p.split('?',1)[0] for p in PAGES}
PAGES.extend(sorted(p.name for p in ROOT.glob('*.html') if p.name not in AUDITED_PAGE_NAMES))
assert {p.name for p in ROOT.glob('*.html')}.issubset({p.split('?',1)[0] for p in PAGES})

# Explicitly opt-in to a two-page diagnostic run on staging. With no override,
# production release validation still audits every page and ancillary journey.
SMOKE_ONLY = tuple(x.strip() for x in os.getenv('ATLAS_SMOKE_ONLY','').split(',') if x.strip())
if SMOKE_ONLY:
    unknown=set(SMOKE_ONLY)-set(PAGES)
    if unknown:raise SystemExit('Unknown scoped smoke page(s): '+', '.join(sorted(unknown)))
    PAGES=[x for x in PAGES if x in SMOKE_ONLY]

class Server(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args):pass

class AssetServer(http.server.ThreadingHTTPServer):
    request_queue_size=32

async def smoke():
    results=[]
    with AssetServer(('127.0.0.1',PORT),Server) as http:
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
                            # Record first-load scroll before Playwright scrolls into off-screen
                            # sidebar and category controls further down this test.
                            initial_map_scroll=await pg.evaluate('window.scrollY') if width==390 and path in ('atlas.html','atlas-online.html','atlas-vi.html') else 0
                            info=await pg.evaluate('''() => {
 const controls=[...document.querySelectorAll('button,input:not([type=hidden]),select,textarea,[role=button]')];
 const unlabeled=controls.filter(el => {
   const aria=el.getAttribute('aria-label')||el.getAttribute('aria-labelledby')||el.title||'';
   const text=el.textContent?.trim()||el.value||'';
   const wrapping=el.closest('label')?.textContent?.trim()||'';
   return !(aria||text||wrapping||el.labels?.length);
 }).map(el=>({tag:el.tagName,id:el.id||'',type:el.type||''})).slice(0,8);
 return {title:document.title,h1:document.querySelector('h1')?.textContent?.trim(),
   scroll:document.documentElement.scrollWidth,width:window.innerWidth,
   controls:controls.length,unlabeledCount:unlabeled.length,unlabeled};
}''')
                            failures=[]
                            if not response or response.status!=200:failures.append('HTTP page response not 200')
                            if not info.get('title') or not info.get('h1'):failures.append('Missing page title or heading')
                            if errors:failures.extend('JS: '+e for e in errors)
                            if missing:failures.extend('Missing local response: '+e for e in missing)
                            # Guard the actual document width on every production route.
                            if width==390 and info['scroll']>info['width']+1:
                                offenders=await pg.evaluate("""() => {
                                  const vw=innerWidth;
                                  return [...document.body.querySelectorAll('*')].map(el=>{
                                    const r=el.getBoundingClientRect();
                                    return {tag:el.tagName.toLowerCase(),id:el.id||'',
                                      cls:String(el.className?.baseVal||el.className||'').slice(0,65),
                                      left:Math.round(r.left),right:Math.round(r.right)};
                                  }).filter(x=>x.left<vw&&x.right>vw+8)
                                    .sort((a,b)=>b.right-a.right).slice(0,6);
                                }""")
                                failures.append(f"Atlas 19.9 mobile horizontal overflow {path}: "
                                                f"{info['scroll']}/{info['width']} offenders={offenders}")

                            # Site-wide release candidate: the ONE universal page-directory
                            # button must open, filter, and dismiss on every functional page.
                            # The welcome gateway intentionally has no gameplay menu; its
                            # guest entry and absence of tools are verified below.
                            if not failures and path!='index.html':
                                try:
                                    nav=pg.locator('#j132-nav-toggle')
                                    await nav.wait_for(state='visible',timeout=4500)
                                    await nav.click(timeout=4500)
                                    drawer=pg.locator('#j132-nav-drawer')
                                    if not await drawer.is_visible():
                                        failures.append('All Pages button did not open navigation')
                                    else:
                                        if path.startswith('map-hub.html?game=') or path in ('atlas93-garage.html','atlas-forge-collections.html'):
                                            active=drawer.locator('a[aria-current="page"]')
                                            if await active.count()!=1 or await active.get_attribute('href')!='./'+path:
                                                failures.append('Directory current destination does not match '+path)
                                        await pg.locator('#j132-search').fill('My Garage')
                                        garage_link=drawer.get_by_role('link',name='My Garage',exact=True)
                                        if await garage_link.count()!=1 or await garage_link.get_attribute('href')!='./atlas-forge-collections.html':
                                            failures.append('All Pages search omitted canonical My Garage collection hub')
                                        await pg.keyboard.press('Escape')
                                        if await drawer.is_visible():
                                            failures.append('All Pages Escape did not dismiss navigation')
                                        if await nav.get_attribute('aria-expanded')!='false':
                                            failures.append('All Pages button did not reset aria-expanded')
                                except Exception as ex:
                                    failures.append('All Pages universal control failed: '+str(ex)[:200])

                            # Release 19.1: actual player actions on the tool pages
                            # that had previously escaped the page-by-page smoke list.
                            # Every page has its own browser context; test data is not
                            # sent to a user account or the shared canonical Atlas.
                            if not failures and path in ('atlas90-vehicles5.html','atlas90-vehicles6.html','atlas90-weapons.html'):
                                try:
                                    await pg.locator('#j90Cards').wait_for(timeout=7000)
                                    await pg.wait_for_function("document.querySelector('#j90Results')?.textContent?.includes('visible')",timeout=9000)
                                    card=pg.locator('#j90Cards .j90-card').first
                                    # An earlier Garage action can already own this model.
                                    # Verify both directions from the actual saved state.
                                    for off,on in (('+ Collect','✓ Collected'),('☆ Wishlist','★ Wanted'),('+ Compare','✓ Compare')):
                                        inactive=card.get_by_role('button',name=off,exact=True)
                                        active=card.get_by_role('button',name=on,exact=True)
                                        before,after=(inactive,active) if await inactive.count() else (active,inactive)
                                        original=await before.get_attribute('aria-pressed')
                                        await before.click()
                                        if await after.get_attribute('aria-pressed')==original:
                                            failures.append('Gallery action did not toggle: '+off)
                                        await after.click()
                                        if await before.get_attribute('aria-pressed')!=original:
                                            failures.append('Gallery action did not restore: '+off)
                                    if path=='atlas90-vehicles6.html':
                                        invalid=await pg.locator('#j90Cards .j90-card').evaluate_all("""cards=>cards.some(card=>{
                                          const src=card.querySelector('img')?.getAttribute('src');
                                          const local=['./art/jura161-vehicles6.webp','./art/elario-watercraft-showroom.webp'];
                                          const model=window.JuraForge?.viModelFromOwnership(card.dataset.recordId);
                                          const visual=window.JuraViVehicleVisuals?.get(model);
                                          return !!src&&!local.includes(src)&&src!==visual?.url;
                                        })""")
                                        if invalid:
                                            failures.append('VI gallery displayed out-of-world imagery')
                                    await pg.locator('#j90Search').fill('zzx-nonexistent-atlas-marker')
                                    if '0 visible' not in await pg.locator('#j90Results').inner_text():
                                        failures.append('Gallery search failed to apply an empty-result filter')
                                    await pg.locator('#j90Search').fill('')
                                    if 'zzx-nonexistent-atlas-marker' in await pg.locator('#j90Search').input_value():
                                        failures.append('Gallery search did not clear')
                                except Exception as err:
                                    failures.append('Vehicle/weapon gallery search failed: '+str(err)[:190])
                            if not failures and path=='my-crew.html':
                                try:
                                    await pg.locator('#crewName').fill('Team Jura QA')
                                    await pg.locator('#crewForm button[type="submit"]').click()
                                    if 'Team Jura QA' not in await pg.locator('#cardName').inner_text():
                                        failures.append('My Crew save failed to update the visible crew card')
                                    await pg.locator('#taskInput').fill('Test a private crew plan')
                                    await pg.locator('#taskForm button[type="submit"]').click()
                                    if await pg.locator('#taskList li').count()!=1:
                                        failures.append('My Crew add-task action failed')
                                    await pg.reload(wait_until='domcontentloaded')
                                    if 'Team Jura QA' not in await pg.locator('#cardName').inner_text() or await pg.locator('#taskList li').count()!=1:
                                        failures.append('My Crew browser refresh lost locally saved crew/task')
                                except Exception as err:
                                    failures.append('My Crew save and reload workflow failed: '+str(err)[:190])
                            if not failures and path=='atlas-coverage.html':
                                try:
                                    await pg.wait_for_function("document.querySelector('#j195-status')?.textContent?.includes('unique landmark research entries')",timeout=12000)
                                    await pg.locator('#j195-world').select_option('6')
                                    expected_vi_count=json.loads((ROOT/'data/gtadb-6-manifest.json').read_text(encoding='utf-8'))['count']
                                    if f'{expected_vi_count:,} unique' not in await pg.locator('#j195-status').inner_text():
                                        failures.append('Local GTA VI research source count is inaccurate')
                                    await pg.locator('#j195-search').fill('residential')
                                    if await pg.locator('#j195-rows tr').count()<1:
                                        failures.append('Source-tag filter failed')
                                    if await pg.locator('#j195-export').is_disabled():
                                        failures.append('Source-tag CSV export not interactive')
                                except Exception as err:
                                    failures.append('Local per-world source-tag audit: '+str(err)[:220])
                            if not failures and path=='atlas93-dispatch.html':
                                try:
                                    await pg.locator('#dispatchCards article').first.wait_for(timeout=7000)
                                    mark=pg.locator('#dispatchCards article button').first
                                    await mark.click()
                                    if 'Done today' not in await mark.inner_text():
                                        failures.append('Dispatch card did not mark a task completed')
                                    await pg.locator('#dispatchReset').click()
                                    if 'Mark done' not in await pg.locator('#dispatchCards article button').first.inner_text():
                                        failures.append('Dispatch reset did not clear the daily task flag')
                                except Exception as err:
                                    failures.append('Daily Dispatch actions failed: '+str(err)[:190])
                            if not failures and path=='atlas-collectibles.html':
                                try:
                                    await pg.wait_for_function("document.querySelector('#universeStatus')?.textContent?.startsWith('Indexed ')",timeout=13000)
                                    await pg.locator('#universeSearch').fill('zzx-nonexistent-atlas-marker')
                                    await pg.locator('#clearFilters').click()
                                    if await pg.locator('#universeSearch').input_value():
                                        failures.append('Collectibles clear-filters action did not clear the search')
                                    await pg.locator('#listView').click()
                                    if await pg.locator('#listView').get_attribute('aria-pressed')!='true':
                                        failures.append('Collectibles list-view action did not activate')
                                except Exception as err:
                                    failures.append('Collectibles search/list actions failed: '+str(err)[:190])

                            # Atlas 19.2: actual game-separated weapon, garage and film
                            # interactions, tested on desktop and on a phone-sized viewport.
                            if not failures and path=='atlas90-weapons.html?world=story':
                                try:
                                    await pg.wait_for_function("document.querySelector('#j90Results')?.textContent?.includes('visible')",timeout=9000)
                                    if await pg.locator('body').get_attribute('data-active-world')!='story':
                                        failures.append('Story weapon page silently opened GTA Online mode')
                                    if 'Story' not in await pg.locator('#j90Header').inner_text():
                                        failures.append('Story armory heading lacks game identity')
                                    await pg.locator('#j90Cards .j90-card button').first.click()
                                    scoped=await pg.evaluate("""() => {
                                     const x=JSON.parse(localStorage.getItem('team-jura-atlas90-collection-v1')||'{}');
                                     return Object.keys(x.owned||{}).filter(k=>k.startsWith('weapons-story:')&&x.owned[k]).length
                                    }""")
                                    if scoped<1:
                                        failures.append('GTA V Story tracking did not use a separate save key')
                                except Exception as err:
                                    failures.append('Story armory scope/collection failed: '+str(err)[:220])
                            if not failures and path=='atlas90-weapons6.html':
                                try:
                                    weapon_records=json.loads((ROOT/'data/atlas192-vi-weapons.json').read_text(encoding='utf-8'))['records']
                                    expected_ids={r['id'] for r in weapon_records}
                                    await pg.wait_for_function("n => document.querySelectorAll('#viWeaponCards .viweapon-card').length===n",arg=len(expected_ids),timeout=15000)
                                    if set(await pg.locator('#viWeaponCards .viweapon-card').evaluate_all("els=>els.map(e=>e.dataset.weaponId)"))!=expected_ids:
                                        failures.append('GTA VI armory omitted source records')
                                    if await pg.locator('#viWeaponClass option').count()<3:
                                        failures.append('GTA VI weapon classes did not load from source evidence')
                                    await pg.locator('#viWeaponSearch').fill('Girardi ES9')
                                    expected_search={r['id'] for r in weapon_records if 'girardi es9' in ' '.join(str(r.get(k,'')) for k in ('name','group','evidence','description')).lower()}
                                    actual_search=set(await pg.locator('#viWeaponCards .viweapon-card').evaluate_all("els=>els.map(e=>e.dataset.weaponId)"))
                                    if actual_search!=expected_search or 'girardi-es9' not in actual_search:
                                        failures.append('GTA VI armory search omitted base or variant evidence')
                                    await pg.locator('[data-weapon-id="girardi-es9"] .viweapon-note').click()
                                    notes=await pg.evaluate("JSON.parse(localStorage.getItem('teamjura-vi-weapon-notes-v1')||'{}')")
                                    if not notes.get('seen',{}).get('girardi-es9'):
                                        failures.append('GTA VI weapon review did not persist to its own storage key')
                                    await pg.reload(wait_until='domcontentloaded')
                                    await pg.wait_for_function("n => document.querySelectorAll('#viWeaponCards .viweapon-card').length===n",arg=len(expected_ids),timeout=15000)
                                    await pg.locator('#viWeaponSearch').fill('Girardi ES9')
                                    if await pg.locator('[data-weapon-id="girardi-es9"] .viweapon-note').get_attribute('aria-pressed')!='true':
                                        failures.append('GTA VI weapon review lost on refresh')
                                    if await pg.locator('#viWeaponCards img.viweapon-linked-image').evaluate_all("els=>els.some(e=>!e.src.startsWith('https://www.rockstargames.com/VI/_next/static/media/ULTIMATE_EDITION_')&&!e.src.startsWith('https://vi.gtax.dev/images/weapons/'))"):
                                        failures.append('GTA VI weapons display a non-approved media origin')
                                    if await pg.locator('[data-weapon-id=\"girardi-es9\"] .viweapon-media figcaption').count()!=1:
                                        failures.append('GTA VI official image provenance missing')
                                    if await pg.locator('#viWeaponCards .viweapon-media').count()!=len(expected_search):
                                        failures.append('GTA VI visual card missing from search results')
                                except Exception as err:
                                    failures.append('GTA VI armory interactive checks failed: '+str(err)[:220])
                            if not failures and path=='atlas93-garage.html':
                                try:
                                    await pg.wait_for_function("Number(document.querySelector('#catalogCount')?.textContent.replace(/,/g,''))>10",timeout=10000)
                                    await pg.locator('#showAll').click()
                                    if await pg.locator('#garageCards .card').count()==0 and await pg.locator('#garageCards article').count()==0:
                                        failures.append('Garage All models button did not show the picture catalog')
                                    if await pg.locator('#garageClassFilter option').count()<3:
                                        failures.append('Garage categories did not load')
                                    await pg.locator('#j96-model').select_option('adder')
                                    await pg.locator('#j96-plate').fill('JURA-QA')
                                    await pg.locator('#j96-save').click()
                                    row=pg.locator('#j96-ledger .j96-row').filter(has_text='JURA-QA')
                                    await row.get_by_role('button',name='Edit').click()
                                    await pg.locator('#j96-plate').fill('UNSAVED')
                                    await pg.locator('#j96-cancel').click()
                                    await row.get_by_role('button',name='Edit').click()
                                    if await pg.locator('#j96-plate').input_value()!='JURA-QA':
                                        failures.append('Cancel edit overwrote the saved parking record')
                                    await pg.locator('#j96-plate').fill('JURA-OK')
                                    await pg.locator('#j96-save').click()
                                    await pg.reload(wait_until='domcontentloaded')
                                    await pg.locator('#j96-ledger .j96-row').filter(has_text='JURA-OK').wait_for()
                                    if await pg.locator('#j96-ledger .j96-row').count()!=1:
                                        failures.append('Editing a parked vehicle added a duplicate instance')

                                except Exception as err:
                                    failures.append('Garage model browse checks failed: '+str(err)[:210])
                            if not failures and path=='one-last-ride.html':
                                try:
                                    await pg.wait_for_function("document.querySelectorAll('#olrSceneList .olr-scene-btn').length===9",timeout=7000)
                                    play=pg.locator('#olrStoryboardPlay')
                                    await play.click()
                                    if await play.get_attribute('aria-pressed')!='true':
                                        failures.append('Guided storyboard did not start')
                                    await pg.locator('#olrNext').click()
                                    if await pg.locator('#olrStoryboardProgress').get_attribute('value')!='2':
                                        failures.append('Storyboard did not track selected chapter')
                                    await pg.locator('#olrStoryboardRestart').click()
                                    if await pg.locator('#sceneCounter').inner_text()!='1 / 9':
                                        failures.append('Storyboard reset did not restore first chapter')
                                    if await play.get_attribute('aria-pressed')!='false':
                                        failures.append('Storyboard reset kept background playback active')
                                except Exception as err:
                                    failures.append('One Last Ride storyboard controls failed: '+str(err)[:210])

                            # Atlas 17.2: the separate Leonida Research page must be usable
                            # on an actual mobile viewport, with a reversible full-size map.
                            if path=='atlas-research.html' and not failures:
                                try:
                                    await pg.locator('#j172-research-tools').wait_for(timeout=7000)
                                    await pg.locator('#j172-bright').click()
                                    if await pg.locator('#j172-bright').get_attribute('aria-pressed')!='true':
                                        failures.append('Research map brightness button did not toggle')
                                    await pg.locator('#j172-expand').click()
                                    if not await pg.locator('#maparea').evaluate("(n) => n.classList.contains('j172-full-map')"):
                                        failures.append('Research map did not expand')
                                    await pg.keyboard.press('Escape')
                                    if await pg.locator('#maparea').evaluate("(n) => n.classList.contains('j172-full-map')"):
                                        failures.append('Research map Escape did not restore view')
                                except Exception as err:
                                    failures.append('Research map display controls failed: '+str(err)[:180])
                            
                            # Atlas 19.5: the Cayo 18.6 island/route view replaces the
                            # retired 16.4/16.9 panels. Test actual public controls;
                            # separate focused Cayo acceptance covers route order, saves,
                            # presets and every filter/pin interaction in two browsers.
                            if path=='heist-cayo-perico.html' and not failures:
                                try:
                                    await pg.locator('#j186-route').wait_for(state='visible',timeout=14000)
                                    if not await pg.locator('.j180-map-frame').is_visible():
                                        failures.append('Current Cayo island workspace is not visible')
                                    if await pg.locator('.j186-filter').count()!=14:
                                        failures.append('Cayo map/route categories do not match all 14 legend filters')
                                    if await pg.locator('.j181-hotspot').count()<12:
                                        failures.append('Current Cayo island markers are missing')
                                    if not await pg.evaluate("Boolean(window.teamJuraCayoPinRoute?.getState)"):
                                        failures.append('Cayo route state API is unavailable')
                                    if await pg.locator('.j186-route-layer').count()!=1:
                                        failures.append('Cayo route overlay is detached from island map')
                                    if await pg.locator('#j169-views').is_visible():
                                        failures.append('Retired duplicate 16.9 Cayo view controls still visible')
                                except Exception as err:
                                    failures.append('Cayo active island/route UI: '+str(err)[:320])

                            # Atlas 16.4: interactive mission map is user-triggered; plans are local
                            # and must not change the existing mission checklist storage.
                            if path=='heist-fleeca.html' and not failures:
                                try:
                                    # Atlas 31.6: a missing key on a first visit is normal.
                                    # Seed a *real legacy* private checklist value before the
                                    # planning interactions, then assert byte-for-byte
                                    # preservation rather than incorrectly requiring a key
                                    # that no user ever created.
                                    legacy_checklist='{"Old mission checklist":true,"_future_marker":"KEEP"}'
                                    seeded=await pg.evaluate("""(raw)=>{
                                        const k='teamjura-heist-'+document.body.dataset.heist;
                                        localStorage.setItem(k,raw);
                                        return localStorage.getItem(k);
                                    }""",legacy_checklist)
                                    if seeded!=legacy_checklist:
                                        failures.append('Could not seed isolated legacy checklist regression')
                                    await pg.locator('#j164-mission-map').wait_for(state='attached',timeout=7000)
                                    mission=path.removeprefix('heist-').removesuffix('.html')
                                    # Atlas 16.7: each heist must show its own focused mission map
                                    # before the optional regional world-map iframe.
                                    await pg.locator('#j167-heist-map').wait_for(timeout=9000)
                                    # Atlas 16.9: view tabs are mission-specific, save-safe and functional.
                                    await pg.locator('#j169-views').wait_for(timeout=9000)
                                    if await pg.locator('#j169-views .j169-view').count()!=(4 if path=='heist-cayo-perico.html' else 3):
                                        failures.append('Wrong mission view count')
                                    await pg.locator('#j169-views .j169-view[data-view="objective"]').click()
                                    if not await pg.locator('#j169-objective').is_visible():
                                        failures.append('Mission objective reference did not open')
                                    if await pg.locator('#j169-objective .j169-objective-card').count()<1:
                                        failures.append('Missing interactive objective POI cards')
                                    await pg.locator('#j169-objective .j169-objective-card').first.click()
                                    if not await pg.locator('#j167-heist-map .j167-viewport').is_visible():
                                        failures.append('Objective POI failed to return to map')
                                    if path=='heist-cayo-perico.html':
                                        await pg.locator('#j169-views .j169-view[data-view="original"]').click()
                                        # Atlas 17.0: Cayo ORIGINAL basemap is now the SAME interactive
                                        # map viewport with POI pins, routes and controls—not an iframe.
                                        if await pg.locator('#j169-original').is_visible():
                                            failures.append('Legacy separate Cayo source panel unexpectedly visible')
                                        if await pg.locator('#j169-cayo-frame').get_attribute('src'):
                                            failures.append('Legacy Cayo source iframe unexpectedly loaded')
                                        if not await pg.locator('#j167-heist-map .j167-viewport').is_visible():
                                            failures.append('Cayo original map with interactive pins is missing')
                                        if not await pg.evaluate("Boolean(window.teamJuraHeistBaseMap?.setSource)"):
                                            failures.append('Cayo original basemap switcher is unavailable')
                                        if await pg.locator('#j169-views [data-view="original"]').get_attribute('aria-pressed')!='true':
                                            failures.append('Cayo combined original map tab did not activate')
                                    await pg.locator('#j169-views .j169-view[data-view="route"]').click()
                                    if not await pg.locator('#j167-heist-map .j167-viewport').is_visible():
                                        failures.append('Route planning map did not reopen')
                                    await pg.locator('#j169-views .j169-view[data-view="enhanced"]').click()
                                    # Atlas 16.8: the visible heist map and the source-informed
                                    # five-question guide must coexist without changing older save keys.
                                    await pg.locator('#j168-heist-guide').wait_for(timeout=9000)
                                    if await pg.locator('#j168-heist-guide .j168-fields dt').all_inner_texts()!=['What','When','Where','Why','How']:
                                        failures.append('Walkthrough does not explain What, When, Where, Why and How')
                                    await pg.locator('#j168-heist-guide .j168-tab').filter(has_text='Preps').click()
                                    if await pg.locator('#j168-heist-guide .j168-step').count()<1:
                                        failures.append('Source-informed heist preparations missing')
                                    else:
                                        await pg.locator('#j168-heist-guide .j168-step').first.click()
                                        await pg.locator('#j168-heist-guide .j168-done').click()
                                        done=await pg.evaluate("""() => JSON.parse(localStorage.getItem('teamjura-heist-walkthrough-v1:'+document.body.dataset.heist)||'{}').done""")
                                        if not isinstance(done,list) or not done:
                                            failures.append('New heist walkthrough completion was not saved locally')
                                        if await pg.locator('#j168-heist-guide .j168-map').count():
                                            await pg.locator('#j168-heist-guide .j168-map').click()
                                            field=await pg.locator('#j167-heist-map .j167-search').input_value()
                                            if not field:
                                                failures.append('Walkthrough map POI button did not filter the focused map')
                                            # Restore all markers for the independent map-coverage checks below.
                                            await pg.locator('#j167-heist-map .j167-search').fill('')
                                    await pg.wait_for_function("""() => /jura167-map-|wikiassets/.test(getComputedStyle(document.querySelector('#j167-heist-map .j167-world')).backgroundImage)""",timeout=9000)
                                    pins=pg.locator('#j167-heist-map .j167-pin')
                                    if await pins.count()<5:
                                        failures.append('Focused mission map has fewer than five accessible POI pins')
                                    if await pg.locator('#j167-heist-map canvas.j167-canvas').count()!=1:
                                        failures.append('Focused custom mission map canvas missing')
                                    if await pg.locator('#j167-heist-map .j167-tool').count()<3:
                                        failures.append('Mission map zoom and Fit controls missing')
                                    await pg.locator('#j167-heist-map .j167-tool').filter(has_text='+').first.click()
                                    z=await pg.locator('#j167-heist-map .j167-scale').inner_text()
                                    if z.strip()=='1.0×':
                                        failures.append('Focused mission zoom did not advance')
                                    await pg.locator('#j167-heist-map .j167-tool').filter(has_text='Fit').click()
                                    z=await pg.locator('#j167-heist-map .j167-scale').inner_text()
                                    if z.strip()!='1.0×':
                                        failures.append('Focused mission map Fit did not reset')
                                    await pins.first.click()
                                    await pg.locator('#j167-heist-map .j167-detail-actions .j167-primary').click()
                                    route=await pg.evaluate("""() => JSON.parse(localStorage.getItem('teamjura-heist-focus-v1:'+document.body.dataset.heist)||'{}').route""")
                                    if not route or len(route)<1:
                                        failures.append('New mission-specific route did not save locally')
                                    await pg.locator('#j167-heist-map .j167-detail-actions .j167-secondary').click()
                                    scoped=await pg.evaluate("""() => JSON.parse(localStorage.getItem('teamjura-heist-focus-v1:'+document.body.dataset.heist)||'{}').scoped""")
                                    if not scoped or len(scoped)<1:
                                        failures.append('Mission-specific scoped POI did not persist')
                                    if mission=='cayo-perico':
                                        if await pg.locator('#j167-heist-map a[href="#j180-shell"]').count()!=1:
                                            failures.append('Cayo island original-map and scoping source is not linked')
                                    actual_art=await pg.locator('.mapbox > img').get_attribute('src')
                                    mission=path.removeprefix('heist-').removesuffix('.html')
                                    if actual_art!='./art/jura159-heist-'+mission+'.webp':
                                        failures.append('Mission artwork regressed to legacy image: '+str(actual_art))
                                    await pg.locator('.j164-notes textarea').first.fill('Atlas 16.4 real-browser saved test')
                                    saved=await pg.evaluate("""() => localStorage.getItem('teamjura-heist-plan-v1:'+document.body.dataset.heist)""")
                                    if not saved or 'real-browser saved test' not in saved:
                                        failures.append('Heist personal note did not persist locally')
                                    await pg.locator('.j164-main').click()
                                    frame=pg.locator('#j164-map-frame')
                                    if not await frame.is_visible():
                                        failures.append('Embedded world map did not open')
                                    expect='./atlas-online.html'
                                    if await frame.get_attribute('src')!=expect:
                                        failures.append('Wrong game map loaded in mission workspace')
                                    await pg.locator('.j164-main').click()
                                    if await frame.is_visible():
                                        failures.append('Embedded map failed to close')
                                    progress=await pg.evaluate("""() => localStorage.getItem('teamjura-heist-'+document.body.dataset.heist)""")
                                    if progress!=legacy_checklist:
                                        failures.append('Existing legacy checklist bytes changed during mission planning')
                                except Exception as e:
                                    failures.append('Heist real-map and local note UI: '+str(e)[:330])

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
                                        # Every handheld world should load correct platform-specific codes.
                                        await pg.locator('#hubGame').select_option('ctw')
                                        if await pg.locator('#hubPlatform').input_value()!='nds':
                                            failures.append('Chinatown Wars did not select Nintendo DS by default')
                                        if await pg.locator('#hubCards .h-card').count()!=16:
                                            failures.append('Chinatown Wars DS game-specific button codes missing')
                                        ds_health=await pg.locator('#hubCards .h-card').filter(has_text='Restore health and armor').first.locator('code').inner_text()
                                        if 'A' not in ds_health or 'B' not in ds_health:
                                            failures.append('Chinatown Wars DS code uses wrong button alphabet')
                                        await pg.locator('#hubPlatform').select_option('mobile')
                                        if await pg.locator('#hubCards .h-card').count()!=15:
                                            failures.append('Chinatown Wars mobile whiteboard codes missing')
                                        if await pg.locator('#hubCards .h-card').filter(has_text='Restore health and armor').first.locator('code').inner_text()!='LIFEUP':
                                            failures.append('Chinatown Wars whiteboard code mismatch')
                                        await pg.locator('#hubGame').select_option('lcs')
                                        if await pg.locator('#hubPlatform').input_value()!='psp':
                                            failures.append('Liberty City Stories did not switch to PSP')
                                        if await pg.locator('#hubCards .h-card').count()!=11:
                                            failures.append('Liberty City Stories PSP codes missing')
                                        await pg.locator('#hubGame').select_option('vcs')
                                        if await pg.locator('#hubCards .h-card').count()!=11:
                                            failures.append('Vice City Stories PSP codes missing')
                                        await pg.locator('#hubPlatform').select_option('ps2')
                                        if await pg.locator('#hubCards .h-card').count()!=11:
                                            failures.append('Vice City Stories PS2 codes missing')
                                        await pg.locator('#hubGame').select_option('story')
                                        if await pg.locator('#hubPlatform').input_value()!='pc':
                                            failures.append('Cheat platform did not reset from Stories to PC for GTA V')
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
                                    stage=pg.locator('#concept3d')
                                    if await stage.get_attribute('data-forge-status')!='reference' or await stage.get_attribute('data-forge-fidelity')!='reference-only' or await stage.locator('canvas').count()!=0:
                                        failures.append('Unapproved substitute model or missing reference workshop')
                                    if not await stage.locator('[data-forge-external-reference]').is_visible():
                                        failures.append('Model reference link missing')
                                    await pg.locator('#paintColor').fill('#d84443')
                                    await pg.locator('#buildName').fill('Team Jura test concept')
                                    await pg.locator('#saveBuild').click()
                                    saved=await pg.evaluate("JSON.parse(localStorage.getItem('team-jura-atlas101-concept-presets-v1')||'{}')")
                                    if saved.get('builds',{}).get('adder',{}).get('name')!='Team Jura test concept':
                                        failures.append('Concept preset did not save into isolated local storage')
                                    if 'addModel=adder' not in (await pg.locator('#addToGarage').get_attribute('href') or ''):
                                        failures.append('Chosen model does not link to My Garage')
                                    if await pg.locator('#resetCamera').is_visible() or not await pg.locator('#bodyStyle').is_disabled():
                                        failures.append('Unavailable reference-only camera or body controls presented as usable')
                                except Exception as exc:
                                    failures.append('Original 3D configurator browser check failed: '+str(exc)[:450])
                            if not failures and path in ('atlas-database.html','atlas-characters.html','atlas-animals.html','atlas-collectibles.html'):
                                try:
                                    await pg.wait_for_function("document.querySelector('#universeStatus')?.textContent?.startsWith('Indexed ')",timeout=8000)
                                    expected_world={'atlas-database.html':'online','atlas-characters.html':'all','atlas-animals.html':'vi','atlas-collectibles.html':'story'}[path]
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
                                    if path=='atlas-collectibles.html':
                                        await pg.locator('#universeSearch').fill('Spaceship Parts')
                                        await pg.get_by_role('button',name='Spaceship Parts',exact=True).click()
                                        collection_link=pg.get_by_role('link',name='Open collection on map')
                                        href=await collection_link.get_attribute('href')
                                        if href!='./atlas.html?collection=story-spaceship-parts':
                                            failures.append('Collection detail did not point to the right Story set')
                                        else:
                                            target=await ctx.new_page()
                                            try:
                                                story_fixture=[{
                                                    'id':i+1,'title':f'Fixture part {i+1}',
                                                    'type':'Spaceship Part','lat':60,'lng':-125
                                                } for i in range(276)]
                                                async def serve_story_fixture(route):
                                                    await route.fulfill(json=story_fixture,headers={'access-control-allow-origin':'*'})
                                                await target.route('https://raw.githubusercontent.com/danharper/GTAV/master/locations.json',serve_story_fixture)
                                                await target.goto(URL+'/'+href.removeprefix('./'),wait_until='domcontentloaded')
                                                await target.wait_for_function(
                                                    "() => document.querySelector('#j83-set')?.value==='story-spaceship-parts'",
                                                    timeout=10000)
                                                if not await target.locator('#j83-showset').is_enabled():
                                                    failures.append('Mapped Spaceship Parts lost access to map pins')
                                            finally:
                                                await target.close()
                                        await pg.locator('#recordDialog .u-close').click()
                                    if path=='atlas-characters.html':
                                        # Use a known credited external reference, not the first alphabetically
                                        # sorted card, which may have no individual portrait.
                                        await pg.locator('#universeSearch').fill('Lester Crest')
                                        portrait=pg.locator('#recordGrid .u-card').filter(has=pg.get_by_role('button',name='Lester Crest',exact=True))
                                        await portrait.first.wait_for(timeout=10000)
                                        portrait=portrait.first
                                        credit=portrait.locator('a.u-portrait-source')
                                        if await credit.count()!=1 or await credit.get_attribute('href')!='https://gta.fandom.com/wiki/Lester_Crest':
                                            failures.append('Character image source credit not visible on its sourced card')
                                        art=portrait.locator('.u-image-character')
                                        if await art.get_attribute('data-art-status')!='world-scene' and await art.locator('img').count():
                                            await art.locator('img').first.evaluate("(el)=>el.dispatchEvent(new Event('error'))")
                                        fallback=art.locator('img')
                                        if await fallback.count()!=1 or not (await fallback.get_attribute('src') or '').endswith('.webp'):
                                            failures.append('Character broken-image fallback must be a bundled cinematic world illustration, not initials')
                                        elif 'not an exact portrait' not in (await fallback.get_attribute('alt') or '').lower():
                                            failures.append('Fallback image must disclose that the scene is not a character likeness')
                                        note=art.locator('.u-image-note')
                                        if await note.count()!=1 or 'NOT A PORTRAIT' not in (await note.inner_text()):
                                            failures.append('Character fallback must have exactly one honest world-art disclaimer')
                                        await pg.locator('#universeSearch').fill('')
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
                                        await pg.locator('[data-world="vi"]').click()
                                        group_select=pg.locator('#filterGroup')
                                        group=await group_select.locator('option').nth(1).get_attribute('value')
                                        await group_select.select_option(group)
                                        await pg.locator('#sortBy').select_option('name-desc')
                                        await pg.locator('#researchOnly').check()
                                        await pg.locator('#listView').click()
                                        shared=await ctx.new_page()
                                        try:
                                            await shared.goto(pg.url,wait_until='domcontentloaded')
                                            await shared.wait_for_function(
                                                "() => document.querySelector('#recordGrid').classList.contains('u-list')")
                                            state=await shared.evaluate("""() => [
                                                document.querySelector('#filterGame').value,
                                                document.querySelector('#filterGroup').value,
                                                document.querySelector('#sortBy').value,
                                                document.querySelector('#researchOnly').checked
                                            ]""")
                                            if state!=['vi',group,'name-desc',True]:
                                                failures.append('Shared database URL did not restore world, group, sort and research filter')
                                        finally:
                                            await shared.close()
                                        await pg.locator('#universeSearch').fill('unlikely-jura-000000')
                                        if await pg.locator('#recordGrid .u-card').count()!=0:
                                            failures.append('Universe search did not filter results')
                                except Exception as exc:
                                    failures.append('Universe catalog browser interaction failed: '+str(exc)[:450])
                            if not failures and path=='atlas-vi.html':
                                try:
                                    docked=pg.locator('#sidebar .j86-mapviews')
                                    if await docked.count()!=1:
                                        failures.append('Leonida view controls must be in the existing left map sidebar')
                                    else:
                                        outer=await pg.locator('#sidebar').bounding_box()
                                        inner=await docked.bounding_box()
                                        if not outer or not inner or inner['x']<outer['x']-3 or inner['x']+inner['width']>outer['x']+outer['width']+3:
                                            failures.append('Leonida map view control panel is clipped outside the sidebar')
                                        view_keys=await docked.locator('button[data-view]').evaluate_all("(buttons)=>buttons.map(b=>b.dataset.view)")
                                        if view_keys!=['day','scaly,view','dupzor,51']:
                                            failures.append('Leonida must retain exactly the approved Day, Scaly and Loki native view switches')
                                        names=await docked.locator('button[data-view]').all_inner_texts()
                                        if len(names)!=len(set(names)):
                                            failures.append('Leonida map view buttons contain indistinguishable duplicate labels')
                                        if len(names)!=3 or not all(any(term in n for n in names) for term in ('In-game Map','Scaly','YANIS V18','Loki','DUPZOR V51')):
                                            failures.append('Leonida view names must retain their distinct source labels')
                                    if await pg.locator('#sidebar a.j145-open-map[href="#atlasCanvas"]').count()!=1:
                                        failures.append('Accessible jump to interactive Leonida map is missing')
                                    # Initial mobile scroll is asserted above, before map controls are interacted with.
                                    if await pg.locator('.mapcontrols .j141-official-flat').count()!=0:
                                        failures.append('Duplicate Rockstar flat-link still competing with the functional map viewer')
                                    # The VI source panel can legitimately include another link to the same
                                    # Rockstar media page. Validate the dedicated source link, not total count.
                                    if await pg.locator('#sidebar p.hint a[href="https://www.rockstargames.com/VI/media"]').count()!=1:
                                        failures.append('Dedicated Rockstar printable-map source link missing from research sidebar')
                                    official=pg.locator('#j143-official-button')
                                    if await official.count()!=1:
                                        failures.append('Official Rockstar map is not selectable inside the Leonida map')
                                    else:
                                        async def unexpected_poster_request(route):
                                            failures.append('A cached Rockstar map made another network request')
                                            await route.abort()
                                        # The official printable ZIP contains a CMYK JPEG.
                                        poster_jpeg=base64.b64decode('/9j/7gAOQWRvYmUAZAAAAAAA/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/8AAFAgABgAEBEMRAE0RAFkRAEsRAP/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/aAA4EQwBNAFkASwAAPwD2uu5r3+vda//Z')
                                        zipped=io.BytesIO()
                                        with zipfile.ZipFile(zipped,'w',compression=zipfile.ZIP_DEFLATED) as archive:
                                            archive.writestr('Leonida_Map_Poster_Printable.jpg',poster_jpeg)
                                        official_zip='https://media-rockstargames-com.akamaized.net/VI/downloads/artwork_wallpapers/Leonida_Map_Poster_Printable.zip'
                                        async def serve_official_zip(route):
                                            await route.fulfill(status=200,headers={
                                                'access-control-allow-origin':'*',
                                                'content-type':'application/zip'},body=zipped.getvalue())
                                        async def unavailable_poster(route):
                                            await route.fulfill(status=503,headers={'access-control-allow-origin':'*'})
                                        await pg.route(official_zip,unavailable_poster,times=1)
                                        await official.click()
                                        retry=pg.locator('[data-j143="fetch"]')
                                        await retry.wait_for(state='visible',timeout=7000)
                                        download=pg.locator('#j143-official-layer .j143-foot a',has_text='Download GTA VI map (ZIP)')
                                        if await download.get_attribute('href')!=official_zip:
                                            failures.append('Optional GTA VI download does not link to Rockstar’s printable map')
                                        await pg.route(official_zip,serve_official_zip)
                                        await retry.click()
                                        await pg.wait_for_function(
                                            "() => document.querySelector('.j143-status')?.textContent?.includes('Official map saved')"
                                            " || document.querySelector('.j143-status')?.textContent?.includes('Map open for this visit')",
                                            timeout=7000)
                                        if not await pg.locator('.j143-poster').is_visible():
                                            failures.append('Rockstar map did not load after retry')
                                        restored=await ctx.new_page()
                                        try:
                                            cached='Official map saved' in await pg.locator('.j143-status').inner_text()
                                            await restored.route('https://media-rockstargames-com.akamaized.net/VI/downloads/**',
                                                                 unexpected_poster_request if cached else serve_official_zip)
                                            await restored.goto(URL+'/atlas-vi.html?view=rockstar',wait_until='domcontentloaded')
                                            await restored.locator('.j143-poster').wait_for(state='visible',timeout=7000)
                                            await restored.locator('[data-j143="close"]').click()
                                            if 'view=rockstar' in restored.url:
                                                failures.append('Closing the linked poster left it selected in the URL')
                                        finally:
                                            await restored.close()
                                        await pg.locator('#j143-official-layer [data-j143="forget"]').click()
                                        await pg.locator('#j143-official-layer [data-j143="fetch"]').wait_for(state='visible',timeout=8000)
                                        await pg.locator('.j143-empty input[type="file"]').set_input_files(
                                            {'name':'invalid.jpg','mimeType':'image/jpeg','buffer':b'not an image'})
                                        await pg.wait_for_function("""() => document.querySelector('.j143-status')
                                            ?.textContent.includes('could not be displayed')""",timeout=7000)
                                        if not await pg.locator('.j143-empty').is_visible():
                                            failures.append('Invalid image hid the Rockstar download and retry controls')
                                        await pg.locator('.j143-empty input[type="file"]').set_input_files(
                                            {'name':'Leonida_Map_Poster_Printable.zip','mimeType':'application/zip','buffer':zipped.getvalue()})
                                        await pg.wait_for_function("""() => {const img=document.querySelector('.j143-poster');
                                            return img && !img.hidden && img.complete && img.naturalWidth > 0}""",timeout=9000)
                                        if not await pg.locator('.j143-poster').is_visible():
                                            failures.append('Rockstar ZIP file did not render inside our interactive map view')
                                        await pg.locator('#j143-official-layer [data-j143="plus"]').click()
                                        if 'scale(' not in (await pg.locator('.j143-poster').get_attribute('style') or ''):
                                            failures.append('Official map zoom did not update image')
                                        stage=pg.locator('.j143-stage')
                                        await stage.press('0')
                                        await stage.press('Equal')
                                        if 'scale(1.3)' not in (await pg.locator('.j143-poster').get_attribute('style') or ''):
                                            failures.append('Official map keyboard zoom did not update image')
                                        if width==390:
                                            await stage.press('0')
                                            box=await stage.bounding_box()
                                            cx=int(box['x']+box['width']/2)
                                            cy=int(box['y']+box['height']/2)
                                            touch=await ctx.new_cdp_session(pg)
                                            await touch.send('Emulation.setTouchEmulationEnabled',{'enabled':True,'maxTouchPoints':2})
                                            for event,spread in [('touchStart',22),('touchMove',60),('touchEnd',0)]:
                                                points=[{'x':cx-spread,'y':cy,'id':1},{'x':cx+spread,'y':cy,'id':2}] if spread else []
                                                await touch.send('Input.dispatchTouchEvent',{'type':event,'touchPoints':points})
                                            await pg.wait_for_function("""() => new DOMMatrix(
                                                getComputedStyle(document.querySelector('.j143-poster')).transform).a > 1.5""",timeout=5000)
                                        await pg.locator('#j143-official-layer [data-j143="close"]').click()
                                        if await pg.locator('#j143-official-layer').is_visible():
                                            failures.append('Official map viewer cannot return to interactive map')
                                        if not await pg.locator('#atlasCanvas').is_visible():
                                            failures.append('Interactive GTA VI canvas was removed by official view')
                                        await pg.evaluate("document.querySelector('#game5').click()")
                                        if await official.is_visible():
                                            failures.append('Official Leonida map button incorrectly shown in GTA V mode')
                                        await pg.evaluate("document.querySelector('#game6').click()")
                                        if not await official.is_visible():
                                            failures.append('Official Leonida map button failed to return to GTA VI mode')
                                except Exception as exc:
                                    failures.append('Official Rockstar in-map view interaction failed: '+str(exc)[:350])
                            if not failures and path in ('index.html','atlas-dashboard.html','maps.html','atlas.html','atlas-online.html','atlas-vi.html','atlas93-garage.html','atlas-share.html','one-last-ride.html'):
                                icons=pg.locator('.j131-social-grid button[data-j131-platform]')
                                try:
                                    await pg.wait_for_function("document.querySelectorAll('.j131-social-grid button[data-j131-platform]').length===7",timeout=6000)
                                except Exception:
                                    failures.append('Seven clickable branded social icons did not render')
                                if await icons.count()!=7:failures.append('Seven branded social icon buttons not present after ready')
                                else:
                                    actual=await icons.evaluate_all("(nodes)=>nodes.map(n=>n.getAttribute('data-j131-platform'))")
                                    if actual!=['facebook','youtube','tiktok','instagram','discord','reddit','more']:failures.append('Social icon buttons use incorrect platform semantics')
                                    if not await icons.first.is_visible():failures.append('Share icons not visible')
                            if not failures and path in ('atlas.html','atlas-online.html','atlas-vi.html') and width==390:
                                if await pg.locator('#sidebar a.j145-open-map[href="#atlasCanvas"]').count()!=1:
                                    failures.append('Mobile explorer missing the visible Open interactive map shortcut')
                                else:
                                    if not await pg.locator('#sidebar a.j145-open-map[href="#atlasCanvas"]').is_visible():
                                        failures.append('Mobile Open interactive map shortcut is not visible')
                                    placed=await pg.locator('#sidebar a.j145-open-map[href="#atlasCanvas"]').evaluate(
                                        """(link) => {
                                            const sidebar=link.closest('#sidebar');
                                            const heading=sidebar?.querySelector('.atlas-explorer-head');
                                            const gameNav=[...(sidebar?.querySelectorAll('.worlds,.j83-worldnav')||[])];
                                            // The optional Day-layer toggle is intentionally
                                            // placed between map jump and search heading.
                                            // Check semantic order, not stale adjacency.
                                            return !!heading && gameNav.length>0
                                                && gameNav.every(nav=>!!(nav.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING))
                                                && !!(link.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING);
                                        }""")
                                    if not placed:
                                        failures.append('Mobile Open interactive map shortcut must follow all game nav before explorer search')
                                if initial_map_scroll>100:
                                    failures.append('Mobile explorer opens scrolled into filters instead of showing the map: '+str(initial_map_scroll)+'px at initial load')
                                nav=pg.locator('#j132-nav-toggle')
                                if await nav.count()!=1 or not await nav.is_visible():failures.append('Mobile map all-pages navigation missing')
                                else:
                                    area=await nav.bounding_box()
                                    if not area or area['width']<38:failures.append('Mobile map all-pages button lacks accessible size')
                                    positioning=await nav.evaluate('(el)=>getComputedStyle(el.closest(".j132-nav")).position')
                                    if positioning not in ('relative','static'):
                                        failures.append('Mobile map all-pages control still floats above map content')
                                    if path=='atlas.html':
                                        maps=pg.locator('[data-j87-maps-link]')
                                        if await maps.count()==1 and await maps.is_visible():
                                            rect=await maps.bounding_box()
                                            if rect and area and not (area['x']+area['width']<=rect['x'] or rect['x']+rect['width']<=area['x'] or area['y']+area['height']<=rect['y'] or rect['y']+rect['height']<=area['y']):
                                                failures.append('Mobile map navigation overlaps All Maps shortcut')
                                    await nav.click()
                                    if not await pg.locator('#j132-nav-drawer').is_visible():failures.append('Map all-pages drawer did not open')
                                    else:
                                        await pg.locator('#j132-search').focus()
                                        await pg.keyboard.press('Shift+Tab')
                                        focus=await pg.evaluate("document.activeElement?.classList.contains('j132-close')")
                                        if not focus:failures.append('Drawer focus did not cycle to Close on shift-tab')
                                        await pg.keyboard.press('Escape')
                                        if await pg.locator('#j132-nav-drawer').is_visible():failures.append('Escape did not close map page drawer')
                            if not failures and path in ('atlas-dashboard.html','atlas-share.html','atlas-account.html','maps.html','one-last-ride.html'):
                                global_nav=pg.locator('#j132-nav-toggle')
                                if await global_nav.count()!=1:failures.append('Universal public page menu missing')
                                else:
                                    await global_nav.click()
                                    if not await pg.locator('#j132-nav-drawer').is_visible():failures.append('Universal page menu cannot open')
                                    await pg.locator('#j132-search').fill('garage')
                                    if await pg.locator('#j132-groups a[href="./atlas-forge-collections.html"]').count()!=1:failures.append('Universal page search did not find My Garage collection hub')
                                    await pg.locator('.j132-close').click()
                                    if await pg.locator('#j132-nav-drawer').is_visible():failures.append('Universal page menu cannot close')
                            if not failures and path=='maps.html':
                                dest='./atlas-dashboard.html'
                                start=pg.locator('a.j99-start-link[href="'+dest+'"]')
                                if await start.count()!=1 or not await start.is_visible():failures.append('Start Here must be visible without opening the navigation menu')
                            if not failures and path=='index.html':
                                if await pg.locator('a.action.primary[href="./atlas-dashboard.html"]').count()!=1:failures.append('Guest home entry missing')
                                if not await pg.locator('.j4728-signin').is_disabled():failures.append('Deferred sign-in must remain disabled')
                                if await pg.locator('#j132-nav-toggle,#featuredGrid,.j4709-entry').count()!=0:failures.append('Welcome must remain separate from player tools')
                            if not failures and path=='atlas-account.html':
                                if await pg.locator('button[disabled]').count()<1:failures.append('Unconfigured sign-in must not collect credentials')
                                if await pg.locator('#j131Export').count()!=1:failures.append('Atlas backup export missing')
                                if await pg.locator('#j131Import').count()!=1:failures.append('Atlas backup restore input missing')
                                try:
                                    await pg.evaluate("localStorage.setItem('team-jura-passport-v74',JSON.stringify({test:3}))")
                                    await pg.locator('#j131Export').click()
                                    await pg.wait_for_function("document.querySelector('#j131ProgressStatus')?.textContent.includes('Backup exported')",timeout=2500)
                                    before_review=await pg.evaluate("localStorage.getItem('team-jura-passport-v74')")
                                    await pg.locator('#j144Review').click()
                                    await pg.wait_for_function("document.querySelectorAll('#j144Entries li').length === 9",timeout=3000)
                                    if await pg.locator('#j144Entries .j144-present').count()<1:
                                        failures.append('Device progress review did not find saved Passport')
                                    if 'No data was uploaded' not in await pg.locator('#j144Summary').inner_text():
                                        failures.append('Device progress review must explicitly report no upload')
                                    after_review=await pg.evaluate("localStorage.getItem('team-jura-passport-v74')")
                                    if before_review!=after_review:
                                        failures.append('Read-only local progress review modified stored data')
                                except Exception as exc:
                                    failures.append('Account backup export interaction failed: '+str(exc)[:300])
                            if not failures and path=='atlas-dashboard.html':
                                if await pg.locator('#featuredGrid a').count()<4:failures.append('Preserved dashboard missing four featured game cards')
                                if await pg.locator('#progressCollections').count()!=1:failures.append('Dashboard progress tracker missing')
                            if not failures and path=='atlas-share.html':
                                if await pg.locator('.j130-share-stacks').count()!=0:failures.append('Legacy launch platform package is still present')
                                if not await pg.locator('#shareCaptionText').input_value():failures.append('Launch caption not hydrated')
                                await pg.locator('#shareCaptionText').fill('My own Team Jura launch caption')
                                await pg.locator('[data-j130-action="copy-text"][data-kind="custom"]').click()
                                try:
                                    await pg.wait_for_function("!!document.querySelector('[data-j130-status]')?.textContent.trim()",timeout=3000)
                                except Exception:
                                    failures.append('Copy-caption interaction gave no feedback')
                            if not failures and path=='maps.html':
                                if await pg.locator('#directoryFeatured a, #directoryAdditional a').count()!=13:failures.append('Directory should show exactly 13 worlds')
                                covers=pg.locator('#directoryFeatured img.world-art-main,#directoryAdditional img.world-art-main')
                                if await covers.count()!=13:failures.append('Map directory must render 13 distinct primary cover images')
                                else:
                                    # Check each cover as the user scrolls through the directory.
                                    for index in range(13):
                                        cover=covers.nth(index)
                                        try:
                                            await cover.scroll_into_view_if_needed(timeout=6500)
                                            await pg.wait_for_function("(i)=>{const el=document.querySelectorAll('#directoryFeatured img.world-art-main,#directoryAdditional img.world-art-main')[i];return !!el&&el.complete&&el.naturalWidth>0}",arg=index,timeout=8500)
                                        except Exception as err:
                                            src=await cover.get_attribute('src')
                                            failures.append('Atlas cover failed to load on scroll: '+str(src)+' · '+str(err)[:115])
                                            break
                                    urls=await covers.evaluate_all("(imgs)=>imgs.map(x=>x.getAttribute('src'))")
                                    if any(not u or not u.startswith('./art/') for u in urls):
                                        failures.append('Map directory must load bundled source-cleared illustrations, not fragile third-party hotlinks')
                                    # GTA IV and its two episodes legitimately share a Liberty City map;
                                    # GTA V Story and Online similarly share the same game terrain.
                                    # Ensure game-map imagery is loaded and not merely old placeholders.
                                    if len(set(urls))<8:failures.append('Too few distinct game-world map artworks displayed')
                                    if any('oldcity.svg' in x or 'sunset.svg' in x for x in urls):
                                        failures.append('Legacy skyline artwork returned to map covers')
                            if not failures and path=='atlas-sa.html':
                                await pg.wait_for_function("document.querySelector('#mapped')?.textContent==='320'")
                                for label,expected in [('Graffiti Tags',100),('Unique Stunt Jumps',70),('Snapshots',50),('Horseshoes',50),('Oysters',50)]:
                                    await pg.locator('#categories button').filter(has_text=label).click()
                                    status=pg.locator('#mapStatus')
                                    if f'{expected} mapped' not in await status.inner_text():
                                        failures.append(f'SA {label} source coverage count is incorrect')
                                    pins=pg.locator('#pinLayer .pin-source-projected')
                                    if await pins.count()!=expected:
                                        failures.append(f'SA {label} actual marker count is incorrect')
                                    if label in ('Graffiti Tags','Unique Stunt Jumps') and not await pg.locator('#item-1 a[href^="https://"]').count():
                                        failures.append(f'SA {label} source link missing')
                            if not failures and path=='atlas-cayo.html':
                                if await pg.locator('#j180-shell').count()!=1:
                                    failures.append('Old Cayo URL did not redirect to native island workspace')
                            if not failures and path in ('atlas.html','atlas-online.html','atlas-vi.html'):
                                header_hq=pg.locator('header.topbar nav a[href="./atlas81-hq.html"]')
                                if width<=700 and path in ('atlas.html','atlas-online.html'):
                                    # The approved compact mobile header uses the unified menu, not the old raw link row.
                                    if await header_hq.count()!=1 or await header_hq.first.is_visible():
                                        failures.append('Legacy Atlas HQ header link must remain available but hidden on compact mobile maps')
                                    try:
                                        nav=pg.locator('#j132-nav-toggle')
                                        await nav.wait_for(state='visible',timeout=15000)
                                        if await nav.count()!=1:failures.append('Compact mobile map has duplicate menus')
                                        await nav.click()
                                        await pg.locator('#j132-search').fill('Tracker & HQ')
                                        hq=pg.locator('#j132-groups a[href="./atlas81-hq.html"]')
                                        await hq.wait_for(state='visible',timeout=6500)
                                        if await hq.count()!=1:failures.append('Unified menu must expose one Atlas HQ destination')
                                        await pg.keyboard.press('Escape')
                                        await pg.locator('#j132-nav-drawer').wait_for(state='hidden',timeout=6500)
                                    except Exception as exc:
                                        failures.append('Compact mobile HQ navigation failed: '+str(exc)[:500])
                                elif await header_hq.count()!=1 or not await header_hq.first.is_visible():
                                    failures.append('Map header must show exactly one Atlas HQ link')
                                if not await pg.locator('body.j117-map-world').count():
                                    failures.append('Current Elario flagship map brand missing')
                                if await pg.locator('header.topbar .brand img[src="./art/elario-crest.svg"]').count()!=1:
                                    failures.append('Original Elario crest missing from active map')
                                if 'ATLAS 9.3' in await pg.title():
                                    failures.append('Retired map title presented as current Atlas')
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
                                        if path in ('atlas.html','atlas-online.html'):
                                            # Exercise the visible Filters button and searchable generic layer,
                                            # not the first (possibly collapsed or unrelated) quick-row button.
                                            await pg.wait_for_function("window.JuraDualLegendAPI?.categories().some(c=>c.id==='landmark'&&c.count>0)",timeout=25000)
                                            await pg.locator('#j4731-filters-map').click()
                                            search=pg.locator('#j4730-legend-search')
                                            await search.wait_for(state='visible',timeout=6500)
                                            await search.fill('Landmarks')
                                            layer=pg.locator('#legend .legend-row:not(.j4730-quick-row) button.legend-choice').filter(has_text='Landmarks')
                                            await layer.wait_for(state='visible',timeout=6500)
                                            if await layer.count()!=1:failures.append('Search must expose exactly one Landmarks category')
                                            initial='false' if path=='atlas-online.html' else 'true'
                                            if await layer.get_attribute('aria-pressed')!=initial:
                                                failures.append('Incorrect clean Online / Story default Landmarks state')
                                            if path=='atlas-online.html' and not await pg.evaluate("window.JuraDualLegendAPI.categories().every(c=>!c.enabled)"):
                                                failures.append('Online first visit enabled unrelated generic categories')
                                            for expected in ('true','false') if initial=='false' else ('false','true'):
                                                await layer.click(timeout=6500)
                                                await pg.wait_for_function("(v)=>window.JuraDualLegendAPI.categories().find(c=>c.id==='landmark').enabled===v",arg=expected=='true',timeout=6500)
                                                if await layer.get_attribute('aria-pressed')!=expected:failures.append('Landmarks control and state disagree')
                                                if expected=='true' and await pg.locator('#togglePins').get_attribute('aria-pressed')!='true':
                                                    failures.append('Enabled category did not activate map pins')
                                            await search.fill('')
                                            if width<=700:
                                                await pg.locator('#j4732-back-map').click()
                                        else:
                                            drawer=pg.locator('#atlasFilterDrawer')
                                            if width<=700:
                                                side=pg.locator('#sidebar')
                                                if await side.evaluate("(el)=>el.classList.contains('mobile-collapsed')"):
                                                    await pg.locator('#mobileTools').click()
                                                await drawer.scroll_into_view_if_needed(timeout=6000)
                                            await drawer.evaluate('(el)=>{el.open=true}')
                                            # Gameplay groups now precede world references. Test the actual
                                            # first-visit default, not the first DOM row in the legend.
                                            search=pg.locator('#j4730-legend-search')
                                            await search.fill('Landmarks')
                                            first=pg.locator('#legend [data-legend-key="landmark"] button.legend-choice')
                                            await first.wait_for(state='visible',timeout=6500)
                                            await first.scroll_into_view_if_needed(timeout=6500)
                                            if not await pg.evaluate("window.JuraDualLegendAPI.categories().find(c=>c.id==='landmark').enabled"):
                                                failures.append('VI first-visit landmark preference missing')
                                            initial=await first.get_attribute('aria-pressed')
                                            if initial!='true':
                                                failures.append('New visitor is missing the default visible map category')
                                            else:
                                                await first.click(timeout=5000)
                                                if await first.get_attribute('aria-pressed')!='false':
                                                    failures.append('One-click category off did not disable selected category')
                                                await first.click(timeout=5000)
                                                if await first.get_attribute('aria-pressed')!='true':
                                                    failures.append('One-click category on did not restore selected category')
                                                if await pg.locator('#togglePins').get_attribute('aria-pressed')!='true':
                                                    failures.append('Restored category did not activate map pins')
                                                if not await pg.evaluate("window.JuraDualLegendAPI.categories().find(c=>c.id==='landmark').enabled"):
                                                    failures.append('Restored VI landmark control and state disagree')
                                            await search.fill('')
                                            if width<=700:
                                                await pg.locator('#j4732-back-map').click()
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
                            if not failures and path in HEIST_PAGES:
                                scene=pg.locator('.mapbox > img')
                                if await scene.count()!=1:failures.append('Heist illustration missing')
                                else:
                                    image_src=await scene.get_attribute('src')
                                    expected_art='./art/jura159-heist-'+path.removeprefix('heist-').removesuffix('.html')+'.webp'
                                    if image_src!=expected_art:
                                        failures.append('Approved cinematic heist artwork regressed: expected '+expected_art+', got '+str(image_src))
                                    await scene.evaluate("(el)=>{el.loading='eager';el.fetchPriority='high'}")
                                    # Edge can defer decoding a background image on
                                    # a long page until it is actually scrolled into
                                    # view, even after loading=eager is assigned.
                                    # Never replace the owner's approved asset with
                                    # fallback artwork or waive decode verification.
                                    if await scene.is_visible():
                                        await scene.scroll_into_view_if_needed(timeout=5500)
                                    try:
                                        await pg.wait_for_function("() => { const x=document.querySelector('.mapbox > img'); return x && x.complete && x.naturalWidth > 0; }",timeout=14000)
                                    except Exception:
                                        image_state=await scene.evaluate("""(x) => ({
                                            src:x.getAttribute('src'),
                                            complete:x.complete,
                                            naturalWidth:x.naturalWidth,
                                            naturalHeight:x.naturalHeight,
                                            loading:x.loading,
                                            currentSrc:x.currentSrc
                                        })""")
                                        failures.append('Original heist illustration did not load or decode: '+str(image_state)[:240])
                            if not failures and (path=='heists.html' or (path in HEIST_PAGES and path!='heist-cayo-perico.html')):
                                try:
                                    await pg.wait_for_selector('.sitebar .j104-logo',timeout=6000)
                                    if path=='heists.html':
                                        if await pg.locator('.cards .card[data-theme]').count()<10:
                                            failures.append('Heist HQ lacks operation-specific art classes')
                                    else:
                                        await pg.wait_for_selector('#missionBrief .j104-brief-visual figcaption',timeout=7000)
                                        if await pg.locator('#missionBrief .j104-brief-visual img').count():
                                            failures.append('Retired schematic image is still inserted above the real mission map')
                                        if await pg.locator('#j164-mission-map .j164-main').count()!=1:
                                            failures.append('Opt-in real Atlas map controls are missing from the heist workspace')
                                        if await pg.locator('#missionBrief .j104-mission-flow li').count()<1:
                                            failures.append('Heist planning sequence missing')
                                        if await pg.locator('.j104-heist-actions button').count()!=1:
                                            failures.append('Heist-specific planning board action missing')
                                        if path=='heist-fleeca.html':
                                            if await pg.locator('.j104-optional-world summary').count()!=1:
                                                failures.append('General map not demoted to optional reference')
                                        if path=='heist-cayo-perico.html':
                                            if await pg.locator('.j104-heist-actions a[href="#j180-shell"]').count()!=1:
                                                failures.append('Cayo island planner not directly linked')
                                except Exception as exc:
                                    failures.append('Heist-specific planning UI unavailable: '+str(exc)[:330])
                            if not failures and path.startswith('map-hub.html?game='):
                                await pg.wait_for_selector('#classicFlatLink',timeout=7000)
                                href=await pg.locator('#classicFlatLink').get_attribute('href')
                                world=path.split('game=',1)[1]
                                title,category=CLASSIC_WORLDS[world]
                                if await pg.locator('#classicTitle').inner_text()!=title:
                                    failures.append('Wrong classic workspace title for '+world)
                                if world=='vc' and href!='https://gtamap.io/gta-vice-city-map/':
                                    failures.append('Wrong 1986 Vice City actual map reference: '+str(href))
                                if await pg.locator('#classicMapBackground').count()!=1:
                                    failures.append('Existing personal map workbench missing')

                                if await pg.locator('header img[src="./art/elario-crest.svg"]').count()!=1:
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
                                    await pg.locator('#markerCategory').select_option(label=category)
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
                                    await pg.wait_for_function("['game-original','original-art'].includes(document.getElementById('classicViewport')?.dataset.mapImage)",timeout=10000)
                                    if await pg.locator('#pinCount').inner_text()!='1':
                                        failures.append('Removing an imported image deleted personal markers')
                                    if await pg.locator('#classicMapSourceLink').count()!=1 or not await pg.locator('#classicMapSourceLink').get_attribute('href'):
                                        failures.append('Classic game-map image provenance link missing')
                                    if world=='vc':
                                        await pg.locator('#classicRetryMap').click()
                                        await pg.wait_for_function("document.getElementById('classicViewport')?.dataset.mapImage==='game-original'",timeout=10000)
                                    async with pg.expect_download() as exported:
                                        await pg.locator('#classicExport').evaluate('(button)=>button.click()')
                                    download=await exported.value
                                    backup=Path(await download.path()).read_bytes()
                                    payload=json.loads(backup)
                                    if payload['world']!=world or len(payload['markers'])!=1:
                                        failures.append('Classic notebook exported incorrect world or marker count')
                                    await pg.locator('#classicClear').click()
                                    await pg.locator('#classicImport').set_input_files(
                                        {'name':'notebook.json','mimeType':'application/json','buffer':backup})
                                    await pg.wait_for_function("document.querySelector('#pinCount')?.textContent==='1'",timeout=7000)
                                    # Re-import a conflicting and a new pin: preserve existing notes and routes.
                                    if world=='vc':
                                        original=payload['markers'][0]
                                        merge_payload={**payload,'markers':[{**original,'name':'Do not overwrite'},{**original,'id':'qa-new-pin','name':'Additional private marker','x':25,'y':75}]}
                                        await pg.locator('#classicImport').set_input_files({'name':'merge.json','mimeType':'application/json','buffer':json.dumps(merge_payload).encode()})
                                        await pg.wait_for_function("document.querySelector('#pinCount')?.textContent==='2'",timeout=7000)
                                        merged=await pg.evaluate("JSON.parse(localStorage.getItem('team-jura-atlas98-classic-vc-v1')).markers")
                                        if merged[0]['name']!=original['name'] or merged[1]['id']!='qa-new-pin':
                                            failures.append('Classic merge overwrote an existing note or ignored new pin')
                                    # Atlas 15.0: each of the seven classic worlds must connect
                                    # a numbered checklist slot to a user-placed map-image pin.
                                    if await pg.locator('#j98bGrid .j150-place-pin').count()==0:
                                        failures.append('Classic checklist missing place-on-map actions: '+world)
                                    else:
                                        await pg.locator('#j98bGrid .j150-place-pin').first.click()
                                        if await pg.locator('#classicAddPin').get_attribute('aria-pressed')!='true':
                                            failures.append('Collectible slot did not enable map placement: '+world)
                                        area=await pg.locator('#classicMapSurface').bounding_box()
                                        if not area or area['width']<40 or area['height']<40:
                                            failures.append('Slot placement has no usable map canvas')
                                        else:
                                            await pg.locator('#classicMapSurface').click(position={'x':area['width']*.27,'y':area['height']*.29})
                                            if not await pg.locator('#classicEditor').is_visible():
                                                failures.append('Image-relative pin editor did not open')
                                            else:
                                                await pg.locator('#markerSave').click()
                                                pins=await pg.evaluate("""() => JSON.parse(localStorage.getItem('team-jura-atlas98-classic-'+new URLSearchParams(location.search).get('game')+'-v1')).markers""")
                                                linked=[m for m in pins if m.get('collectionSlot')==1]
                                                if len(linked)!=1 or linked[0].get('source')!='personal-image-percent':
                                                    failures.append('Slot marker lost numbered link or personal-position provenance')
                                                await pg.locator('#j98bGrid .j150-slot > button:first-child').first.click()
                                                if await pg.locator('#classicMarkerLayer .classic-marker[data-slot-done="true"]').count()!=1:
                                                    failures.append('Checklist completion did not update map pin state')
                                                await pg.reload(wait_until='domcontentloaded')
                                                await pg.wait_for_function("document.querySelector('#pinCount')?.textContent==="+json.dumps('3' if world=='vc' else '2'),timeout=7000)
                                                if await pg.locator('#classicMarkerLayer .classic-marker[data-slot-done="true"]').count()!=1:
                                                    failures.append('Numbered pin/completion relationship lost on reload')
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
                            if not failures and path=='project.html':
                                if not await pg.locator('body.j116-showcase').count():
                                    failures.append('Current Elario showcase theme missing')
                                if not await pg.locator('a[href="https://github.com/jyates0125/team-jura-atlas-preview"]').count():
                                    failures.append('Showcase GitHub source link points to retired repository')
                                if await pg.locator('header img[src="./art/elario-crest.svg"]').count() == 0:
                                    failures.append('Showcase missing original Elario crest')
                            if not failures and path=='atlas98b-test.html':
                                if await pg.locator('#qaRunCore').count()!=1 or await pg.locator('#qaRunAll').count()!=1:
                                    failures.append('Atlas QA buttons missing')
                                if await pg.locator('header img[src="./art/elario-crest.svg"]').count() !=1:
                                    failures.append('Atlas QA Elario crest missing')
                            if not failures and path=='atlas-credits.html':
                                if await pg.locator('h1#pageTitle').count()!=1:
                                    failures.append('Canonical credits page title missing')
                                if await pg.locator('.source-card').count()<16:
                                    failures.append('Source credits list incomplete')
                                if await pg.locator('a[href="https://gtamap.io/disclaimer/"]').count()!=1:
                                    failures.append('GTAMap.io original source disclaimer not linked')
                                if await pg.locator('a[href="https://github.com/rolux/gtadb.org"]').count()<1:
                                    failures.append('GTADB source repository not credited')
                                if await pg.locator('header img[src="./art/elario-crest.svg"]').count()!=1:
                                    failures.append('Original Elario crest missing on credits')
                                if 'MANY CREWS' not in await pg.locator('header .brand').inner_text():
                                    failures.append('Community branding changed')
                                if await pg.locator('a[href^="./atlas109-credits.css"]').count()>0:
                                    failures.append('Unexpected stylesheet link inside document anchor')
                                try:
                                    await pg.locator('details summary').filter(has_text='GTADB upstream MIT software notice').click()
                                    if not await pg.locator('details pre.license').first.is_visible():
                                        failures.append('GTADB MIT copyright notice cannot be expanded')
                                except Exception as exc:
                                    failures.append('Credits MIT license UI did not work: '+str(exc)[:250])
                            if not failures and path=='atlas93-garage.html':
                                if width==390:
                                    garage_nav=pg.locator('.mast nav')
                                    destinations=set(await garage_nav.locator('a').evaluate_all("els=>els.map(a=>a.getAttribute('href'))"))
                                    expected={'./atlas81-hq.html','./maps.html','./heists.html','./atlas90-vehicles5.html','./atlas-database.html?kind=vehicle','./atlas-vehicle-configurator.html','./atlas93-dispatch.html','./atlas90-vehicles6.html','./atlas-forge-collections.html?world=vi&kind=vehicle'}
                                    if destinations!=expected:
                                        failures.append('Mobile Garage navigation must preserve all nine scoped destinations')
                                    metrics=await garage_nav.evaluate('(el)=>({height:el.getBoundingClientRect().height, scroll:el.scrollWidth,client:el.clientWidth,wrap:getComputedStyle(el).flexWrap})')
                                    if metrics['height']>65 or metrics['wrap']!='nowrap':
                                        failures.append('Garage mobile header navigation wraps into multiple rows')
                                    if metrics['scroll']<=metrics['client']+20:
                                        failures.append('Garage mobile navigation lacks horizontal scrolling for all destinations')
                                await pg.locator('#showAll').click()
                                buttons=pg.locator('#garageCards article.card button.primary')
                                if await buttons.count()>0:
                                    await buttons.first.click()
                                    showroom=pg.locator('#garageDetails .j99-showroom')
                                    if await showroom.get_attribute('data-forge-status')!='reference' or await showroom.get_attribute('data-forge-fidelity')!='reference-only':
                                        failures.append('Garage must preserve honest reference-only workshop mode')
                                    if await showroom.locator('canvas').count()!=0 or await showroom.locator('.j99-3d-controls').is_visible():
                                        failures.append('Garage exposed substitute geometry or inactive camera controls')
                                    if not await showroom.locator('.j256-rights').is_visible() or 'not replaced with a generic 3D body' not in (await showroom.locator('.j256-rights').inner_text()):
                                        failures.append('Reference-only Garage disclaimer missing')
                                    if not await showroom.locator('[data-forge-external-reference]').is_visible():
                                        failures.append('Garage external reference link missing')
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
                                    else:
                                        marine=pg.locator('#garageDetails .j256-forge')
                                        if await marine.get_attribute('data-forge-status')!='reference' or await marine.get_attribute('data-forge-fidelity')!='reference-only':
                                            failures.append('Squalo must retain honest reference-only mode until marine asset approval')
                                        if not await marine.locator('.j256-rights').is_visible() or not await marine.locator('[data-forge-external-reference]').is_visible():
                                            failures.append('Marine reference and disclaimer missing')
                                await pg.locator('#garageClassFilter').select_option('all')
                                await pg.locator('#garageSearch').fill('')
                            if not failures and path=='atlas-research.html':
                                if await pg.locator('#map').count()==0:failures.append('Research canvas missing')
                                if await pg.locator('#showResearchPins:checked').count()!=0:failures.append('Research pins should start hidden')
                                if await pg.locator('.j94-view-deck').count():failures.append('Legacy duplicate research map legend remains')
                                if 'GTADB.org' not in await pg.locator('#researchSourceStatus').inner_text():failures.append('Licensed VI research records did not load')
                            if not failures and path=='atlas-sa.html':
                                try:
                                    await pg.wait_for_function("document.querySelector('#mapBackground .j86-san-map')?.naturalWidth > 200",timeout=15000)
                                    source=await pg.locator('#mapBackground .j86-san-map').get_attribute('src')
                                    if 'atlas-sa-vector.svg' not in source:
                                        failures.append('Bundled licensed San Andreas 2D map did not render as the primary artwork')
                                    if not await pg.locator('.j86-sa-credit a').count():
                                        failures.append('San Andreas vector license attribution missing')
                                    if 'approximate' not in (await pg.locator('.j105-accuracy').inner_text()).lower():
                                        failures.append('Approximate coordinate disclaimer missing')
                                    await pg.locator('#categories .cat').filter(has_text='Snapshots').click()
                                    if await pg.locator('#items #item-1 input[type="checkbox"]').count()==0:
                                        failures.append('Individual sourced completion tracking missing')
                                except Exception as exc:
                                    failures.append('San Andreas artwork, attribution or individual completion: '+str(exc)[:240])
                            if not failures and path in ('heists.html','atlas-iv.html','atlas-research.html','atlas98-data-lab.html'):
                                expected={'heists.html':'j119-heists','atlas-iv.html':'j119-iv','atlas-research.html':'j119-research','atlas98-data-lab.html':'j119-lab'}[path]
                                if await pg.locator('body.'+expected).count()!=1:
                                    failures.append('Current Elario workspace skin missing: '+expected)
                                if await pg.locator('header img[src="./art/elario-crest.svg"]').count()!=1:
                                    failures.append('Original Elario crest missing from workspace header')
                                if path=='heists.html' and await pg.locator('.cards article.card').count()<10:
                                    failures.append('Heist HQ has fewer than 10 dedicated job links')
                                if path=='atlas-research.html' and await pg.locator('#showResearchPins').count()!=1:
                                    failures.append('Research unverified marker toggle missing')
                            if not failures and path=='atlas-iv.html':
                                if await pg.locator('#classicCanvas').count()==0:failures.append('GTA IV canvas missing')
                                if await pg.locator('#classicLayer option').count()<2:failures.append('GTA IV layers missing')
                                if 'licensed community landmarks' not in await pg.locator('#recordStatus').inner_text():
                                    failures.append('Bundled GTA IV landmark snapshot did not load')
                                if int((await pg.locator('#visibleCount').inner_text()).replace(',','') or '0')<2000:
                                    failures.append('GTA IV landmark snapshot has fewer than 2,000 mapped records') 
                                if await pg.locator('#classic3dToggle').count():
                                    failures.append('Older map incorrectly includes deferred 3D viewer')
                            if not failures and path=='atlas98-landmarks.html':
                                if 'sourced landmarks shown' not in await pg.locator('#landmarkStatus').inner_text():failures.append('Bundled VI landmark library did not load')
                            if not failures and path=='one-last-ride.html':
                                if not await pg.locator('body.j117-film').count():
                                    failures.append('One Last Ride current film identity missing')
                                if await pg.locator('header .portal-logo img[src="./art/elario-crest.svg"]').count()!=1:
                                    failures.append('Film project Elario crest missing')
                                if await pg.locator('video source[src*="one-last-ride-action-cut-3906.mp4"]').count()==0:failures.append('Film preview source missing')
                                if await pg.locator('.olr-scene-btn').count()!=9:failures.append('One Last Ride nine film chapters missing')
                                if await pg.locator('.j130-olr-share').count():failures.append('Discontinued film share kit still interrupts content')
                                if await pg.locator('[data-j131-social-host] [data-j131-platform]').count()<4:
                                    failures.append('Bottom-of-page community social buttons missing on film')
                            if not failures and path in ('legacy-explorer.html','online-explorer.html') and width<=390:
                                for selector in ('header.top .brand','header.top #game5','header.top #game6'):
                                    control=pg.locator(selector)
                                    bounds=await control.bounding_box()
                                    if not bounds or bounds['x']<0 or bounds['x']+bounds['width']>width+1:
                                        failures.append('Legacy header item outside phone viewport: '+selector)
                                    if bounds and selector.endswith(('game5','game6')) and bounds['height']<43:
                                        failures.append('Legacy game switch is not touch sized: '+selector)
                            
                            header_cases={"atlas-dashboard.html":"dashboard","guides.html":"guides","atlas-news.html":"news","atlas-cheats.html":"cheats","atlas-activities.html":"activities","atlas-account.html":"account","atlas-toolkit.html":"toolkit","atlas-checklist.html":"checklist","atlas8-preview.html":"studio-preview"}
                            if path in header_cases:
                                hero=pg.locator('[data-gtae-header="'+header_cases[path]+'"]')
                                if await hero.count()!=1 or not await hero.is_visible():
                                    failures.append('Cinematic header missing: '+path)
                                else:
                                    background=await hero.evaluate('(el)=>getComputedStyle(el).backgroundImage')
                                    if 'url(' not in background:
                                        failures.append('Cinematic header lost its image: '+path)
                                    else:
                                        decoded=await hero.evaluate(r"""async (el) => {
                                          const raw=getComputedStyle(el).backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
                                          if(!raw)return false;
                                          const image=new Image();image.src=raw[1];
                                          try{await image.decode();return image.naturalWidth>100}catch{return false}
                                        }""")
                                        if not decoded:failures.append('Cinematic header image failed to decode: '+path)
                                    bounds=await hero.bounding_box()
                                    if not bounds or bounds['x']< -1 or bounds['x']+bounds['width']>width+2:
                                        failures.append('Refreshed header overflows viewport: '+path)
                            # Generic, non-destructive UX checks after individual page tests.
                            # Do not click destructive/financial/account/import actions automatically.
                            if not failures:
                                try:
                                    disclosures=pg.locator('details > summary')
                                    if path=='atlas-vi.html' and width==390:
                                        # After the detailed legend smoke has scrolled the
                                        # off-canvas sidebar, the generic disclosure probe
                                        # must exercise a *map-visible* control, not the
                                        # sidebar's offscreen source-index summary.
                                        # Dedicated Atlas 29.0 browser acceptance separately
                                        # opens Map Tools and tests that source index end-to-end.
                                        side=pg.locator('#sidebar')
                                        if await side.count() and not await side.evaluate("(e)=>e.classList.contains('mobile-collapsed')"):
                                            await pg.locator('#mobileTools').click(timeout=5500)
                                        disclosures=pg.locator('#j217-vi-hub > summary')
                                    if path=='atlas-research.html':
                                        # The map-first phone layout intentionally keeps
                                        # research accordion filters inside the Filters /
                                        # Results drawer, not behind the map canvas.
                                        if width==390:
                                            await pg.locator('#toggleRail').click(timeout=5500)
                                            if not await pg.locator('#rail').evaluate("(e)=>e.classList.contains('open')"):
                                                failures.append('Research Filters / Results drawer did not open')
                                        disclosures=pg.locator('#rail > details > summary')
                                    for d in (await disclosures.all())[:1]:
                                        if await d.is_visible():
                                            was=await d.evaluate('(e)=>e.parentElement.open')
                                            await d.click(timeout=5500)
                                            now=await d.evaluate('(e)=>e.parentElement.open')
                                            if was==now:failures.append('Details disclosure did not respond')
                                            break
                                except Exception as exc:
                                    failures.append('Details disclosure interaction: '+str(exc)[:230])
                            results.append({'page':path,'viewport':width,'ok':not failures,'issues':failures,
                              'controls':info['controls'],'unlabeledControls':info['unlabeledCount'],
                              'unlabeledExamples':info['unlabeled']})
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
