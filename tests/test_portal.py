#!/usr/bin/env python3
"""Browser-executed isolated DOM fixtures, NOT hosted Cloudflare end-to-end tests."""
import pathlib,json,os,re
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]

def fixture(name,game=None,state=None):
    src=(ROOT/name).read_text();soup=BeautifulSoup(src,'html.parser')
    for tag in list(soup.find_all('link',rel='stylesheet')):
        href=tag.get('href','').split('?')[0]
        path=ROOT/href
        if path.exists():
            t=soup.new_tag('style');t.string=path.read_text();tag.replace_with(t)
        else:tag.decompose()
    for tag in list(soup.find_all('script',src=True)):
        js=ROOT/tag['src'].split('?')[0]
        if js.exists():
            code=js.read_text()
            if game and js.name in {'atlas98-classic.js','atlas98b-progress.js','atlas98b-route.js'}:code=code.replace("(params.get('game')||params.get('world')||'iii')",repr(game))
            tag.attrs.pop('src',None);tag.attrs.pop('defer',None);tag.string=code
        else:tag.decompose()
    inject=soup.new_tag('script');inject.string="""Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.prototype.hasOwnProperty.call(window.__testStore,k)?window.__testStore[k]:null,setItem:(k,v)=>{window.__testStore[k]=String(v)},removeItem:k=>delete window.__testStore[k]}});"""
    init=soup.new_tag('script');init.string='window.__testStore='+json.dumps(state or {})+';'
    soup.head.insert(0,inject);soup.head.insert(0,init)
    return str(soup)

def run():
    checks=[];errors=[]
    def check(name,passed):
        checks.append({'name':name,'passed':bool(passed)})
        if not passed:errors.append(name)
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=os.getenv('CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        for name,viewport in [('desktop',{'width':1440,'height':900}),('mobile',{'width':390,'height':844})]:
            page=browser.new_page(viewport=viewport)
            js_errors=[];page.on('pageerror',lambda e:js_errors.append(str(e)))
            page.set_content(fixture('index.html'),wait_until='load')
            check(name+': four featured worlds',page.locator('#featuredGrid a.world-card').count()==4)
            check(name+': nine sidebar worlds',page.locator('#classicRail a').count()==9)
            check(name+': home has all maps',page.locator('a[href="./maps.html"]').count()>0)
            check(name+': homepage runtime',not js_errors)
            if name=='mobile':
                page.locator('.menu-toggle').click();check('mobile: menu opens',page.locator('.menu-toggle').get_attribute('aria-expanded')=='true')
                page.keyboard.press('Escape');check('mobile: menu closes',page.locator('.menu-toggle').get_attribute('aria-expanded')=='false')
            page.set_content(fixture('maps.html'),wait_until='load')
            check(name+': 13 world cards',page.locator('.directory-card').count()==13)
            page.locator('#worldSearch').fill('Vice City Stories');check(name+': directory search',page.locator('.directory-card').count()==1)
            page.locator('#worldSearch').fill('');page.locator('[data-world-filter="gateway"]').click()
            check(name+': gateway count',page.locator('.directory-card').count()==7)
            check(name+': directory runtime',not js_errors)
            page.set_content(fixture('atlas98-style-lab.html'),wait_until='load')
            check(name+': style cards',page.locator('.style-tile').count()>=7)
            page.locator('.style-tile .style-actions button').last.click()
            check(name+': saved style browser bookmark',page.locator('#savedStylesCount').inner_text().startswith('1'))
            page.set_content(fixture('map-hub.html',game='vc'),wait_until='load')
            check(name+': correct classic title','Vice City' in page.locator('#classicTitle').inner_text())
            check(name+': 5 classic categories',page.locator('#classicCategories .classic-category').count()==5)
            check(name+': individual 100-slot package checklist',page.locator('#j98bSet option[value="Hidden packages"]').count()==1 and '0 / 100' in page.locator('#j98bCounter').inner_text())
            page.locator('#j98bGrid button').first.click()
            check(name+': individual collection item saved',page.locator('#j98bCounter').inner_text().startswith('1 / 100'))
            check(name+': no JS errors after upgraded tracker',not js_errors)

            page.locator('.classic-accordions details').last.locator('summary').click();page.locator('#classicAddPin').click();page.locator('#classicViewport').click(position={'x':110,'y':130})
            check(name+': marker editor opens',page.locator('#classicEditor').is_visible())
            page.locator('#markerName').fill('My test marker');page.locator('#markerSave').click()
            check(name+': marker saved',page.locator('#classicPinList .classic-pin-row').count()==1)
            page.locator('#classicAddPin').click();page.locator('#classicViewport').click(position={'x':180,'y':190})
            page.locator('#markerName').fill('Second stop');page.locator('#markerSave').click()
            check(name+': two personal markers saved',page.locator('#classicPinList .classic-pin-row').count()==2)
            choices=page.locator('#j98bRoutePick option').evaluate_all('(opts)=>opts.map(x=>x.value).filter(Boolean)')
            check(name+': personal markers offered in route builder',len(choices)==2)
            for choice in choices:
                page.locator('#j98bRoutePick').select_option(value=choice);page.locator('#j98bRouteAdd').click()
            check(name+': route drawn from personal markers',page.locator('#j98b-route-lines polyline').count()==1)

            state=page.evaluate('window.__testStore')
            page.set_content(fixture('map-hub.html',game='vc',state=state),wait_until='load')
            check(name+': same world marker persists',page.locator('#classicPinList .classic-pin-row').count()==2)
            check(name+': individual item progress persists',page.locator('#j98bCounter').inner_text().startswith('1 / 100'))
            check(name+': personal route persists',page.locator('#j98b-route-lines polyline').count()==1)

            page.set_content(fixture('map-hub.html',game='lcs',state=state),wait_until='load')
            check(name+': different world isolated',page.locator('#classicPinList .classic-pin-row').count()==0)
            check(name+': other world checklist isolated',page.locator('#j98bSet option[value="Hidden packages"]').count()==1 and page.locator('#j98bCounter').inner_text().startswith('0 / 100'))

            check(name+': classic runtime',not js_errors)
            page.set_content(fixture('atlas98b-test.html'),wait_until='load')
            check(name+': full-site audit controls',page.locator('#qaRunAll').count()==1 and page.locator('#qaExport').is_disabled())
            check(name+': audit page initialization',not js_errors)

            if js_errors:print(name,'js errors:',js_errors)
            page.close()
        browser.close()
    result={'type':'isolated-dom-fixture','checks':checks,'passed':sum(x['passed'] for x in checks),'total':len(checks),'failed':errors,'limitations':['The browser sandbox blocks HTTP and file navigation; this fixture uses HTML/CSS/JS in-memory.','It validates new-page JavaScript behavior but cannot prove deployed asset loading, old map engines, real navigation, provider tiles, or licensed source coverage.','Cloudflare desktop/mobile and map engine smoke tests still required after publishing.']}
    (ROOT/'docs'/'ATLAS98B-BROWSER-TEST-RESULTS.json').write_text(json.dumps(result,indent=2))
    print(json.dumps(result,indent=2))
    if errors:raise SystemExit(1)
if __name__=='__main__':run()
