from pathlib import Path
import tempfile, shutil, json, base64
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parents[1]

def run():
 with tempfile.TemporaryDirectory() as td:
  root=Path(td)
  for fname in ['atlas86-ui.js','atlas86-ui.css','atlas86-sa-enhance.js','atlas86-cayo.js']:
   shutil.copy(BASE/fname,root/fname)
  (root/'art').mkdir()
  for name in ['scaly','loki']:
   shutil.copy(BASE/'art'/f'atlas86-{name}-approved.webp',root/'art'/f'atlas86-{name}-approved.webp')
  # Minimal fixture emulates the existing IDs and events, not a full deployed map.
  fixture='''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="atlas86-ui.css"></head><body>
<header class="topbar"><nav></nav></header><aside id="sidebar"><div class="worlds"></div><div id="jura83-panel"><select id="j83-set"><option value="story-spaceship-parts">Spaceship Parts · 50</option><option value="story-nuclear-waste">Nuclear Waste · 30</option></select><div id="j83-items"><div class="j83-item"><span class="j83-item-label">Nuclear Waste #1</span></div></div></div></aside>
<div class="mapcontrols"><label for="layer">Map view</label><select id="layer"><option value="scaly,view">Scaly</option><option value="loki,view">Loki</option><option value="uv2">UV</option></select></div>
<details id="juraMapLegend" class="jura-floating-legend jura-floating-left"><summary>Map Legend</summary><div id="juraMapLegendRows"><button>Landmarks 250</button></div></details>
<details id="juraTrailerLegend" class="jura-floating-legend jura-floating-right"><summary>Trailer Legend</summary><div id="juraTrailerLegendRows"><button>Trailer A</button></div></details>
<script>window.JuraDualLegendAPI={state:()=>({game:'6',style:document.getElementById('layer').value})};</script>
</body></html>'''
  (root/'atlas-vi.html').write_text(fixture)
  results={}
  with sync_playwright() as pw:
   browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
   page=browser.new_page(viewport={'width':1280,'height':800})
   issues=[];page.on('pageerror',lambda e:issues.append(str(e)))
   page.set_content(fixture,wait_until='load',timeout=15000)
   page.add_style_tag(content=(BASE/'atlas86-ui.css').read_text())
   js=(BASE/'atlas86-ui.js').read_text().replace("const page=(location.pathname.split('/').pop()||'').toLowerCase();","const page='atlas-vi.html';")
   for name in ('scaly','loki'):
    src=f'./art/atlas86-{name}-approved.webp'
    data=base64.b64encode((BASE/'art'/f'atlas86-{name}-approved.webp').read_bytes()).decode()
    js=js.replace(src,'data:image/webp;base64,'+data)
   page.add_script_tag(content=js)
   page.wait_for_timeout(200)
   results['legends_in_sidebar']=page.evaluate("document.getElementById('sidebar').contains(document.getElementById('juraMapLegend')) && document.getElementById('sidebar').contains(document.getElementById('juraTrailerLegend'))")
   results['legends_stacked']=page.locator('.j86-legend-stack > details').count()==2
   results['crew_portraits_loaded']=page.locator('.j86-crew img').count()==2 and all(page.locator('.j86-crew img').nth(i).evaluate('(el)=>el.complete&&el.naturalWidth>0') for i in (0,1))
   results['style_buttons']=page.locator('.j86-view-btn').count()==3
   page.locator('.j86-view-btn[data-view="loki,view"]').click()
   results['style_switch']=page.locator('#layer').input_value()=='loki,view'
   results['nuclear_icon']=page.evaluate("window.TeamJuraIcon86.forRecord({category:'collectible',collectionType:'Nuclear Waste'})==='☢️'")
   results['spaceship_icon']=page.evaluate("window.TeamJuraIcon86.forRecord({category:'collectible',collectionType:'Spaceship Part'})==='🛸'")
   page.locator('#j83-set').select_option('story-nuclear-waste');page.wait_for_timeout(100)
   results['legend_nuclear_icon']=page.locator('#j83-set option:checked').inner_text().startswith('☢️')
   results['item_nuclear_icon']=page.locator('.j86-mark').first.inner_text()=='☢️'
   results['no_runtime_errors']=not issues
   results['errors']=issues
   page.screenshot(path=str(BASE/'docs'/'ATLAS86-LOCAL-VI-UI-PREVIEW.png'),full_page=True)
   browser.close()

  assert all(v for k,v in results.items() if k!='errors'),results
  (BASE/'docs'/'QA-ATLAS86-RESULTS.json').write_text(json.dumps(results,indent=2))
  print(json.dumps(results,indent=2))
if __name__=='__main__':run()
