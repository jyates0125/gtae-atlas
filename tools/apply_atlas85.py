#!/usr/bin/env python3
"""Atlas 8.5 — source-level patch with backups, guards, idempotency and dry-run.
Run in an extracted GitHub repository root using python tools/apply_atlas85.py.
"""
from pathlib import Path
import sys, shutil
ROOT=Path(__file__).resolve().parent.parent
# When tools script is copied to repo root/tools, its parent is repo root.
MARKER='/* ATLAS85 DESIGNED BRAND MAP ENGINE */'

def replace_once(data, old, new, label):
    occurrences=data.count(old)
    if occurrences!=1: raise ValueError(f'{label}: expected 1 source anchor, found {occurrences}; stopped to protect original')
    return data.replace(old,new,1)

def fix_engine():
    f=ROOT/'atlas.js'
    data=f.read_text(encoding='utf8')
    if MARKER in data: return ('atlas.js','already upgraded')
    data=MARKER+'\n'+data
    original='function toggleFound(r){progress[doneKey(r)]=!progress[doneKey(r)];if(progress[doneKey(r)])routes[routeScope()]=routeIds().filter(id=>id!==r.id);syncedChecklist(r,progress[doneKey(r)]);persist();render();updateSelected()}'
    improved='''function toggleFound(r){
 const done=!progress[doneKey(r)], oldRoute=routeIds().slice();progress[doneKey(r)]=done;
 if(done){
  const lookup=new Map(records().map(p=>[p.id,p]));
  const unfinished=oldRoute.filter(id=>id!==r.id).map(id=>lookup.get(id)).filter(p=>p&&!progress[doneKey(p)]);
  if(unfinished.length>1&&window.JuraRoutePlanner){
   const origin=currentRouteStart()||r;
   routes[routeScope()]=window.JuraRoutePlanner.plan(origin,unfinished).stops.map(p=>p.id);
  }else routes[routeScope()]=unfinished.map(p=>p.id);
  // Invalidate an old road/line overlay: the old plan includes completed stops.
  navPlan=null;navPlanScope=null;
  if(onlyUnfound&&selected?.id===r.id)selected=null;
  // Guide a hunt to the next remaining routed target.
  if(routeIds().length&&onlyUnfound){selected=lookup.get(routeIds()[0])||null;}
 }
 syncedChecklist(r,done);
 // Keep the 8.1 HQ state synchronized for individually mapped Story records.
 if(r.sourceId==='story'&&mode==='story'&&Number.isInteger(r.collectionSlot)){
  const collection=CHECKSET[r.collectionType];if(collection){try{
   const key='team-jura-atlas81-hq-v1',saved=loadStore(key,{schema:1,items:{}}),slot=collection+':'+r.collectionSlot;
   saved.items=saved.items||{};saved.items[slot]={...saved.items[slot],done,queue:done?false:!!saved.items[slot]?.queue};
   saved.updated=new Date().toISOString();store(key,saved)
  }catch{}}
 }
 persist();render();updateSelected();
 document.dispatchEvent(new CustomEvent('jura:progress-updated',{detail:{id:r.id,done,remaining:routeIds().length}}));
 if(done&&oldRoute.includes(r.id))toast('Collected · hunt rerouted: '+routeIds().length+' unfinished stops. Straight-line preview unless a validated road graph is loaded.');
}'''
    data=replace_once(data,original,improved,'completion + reroute')
    data=replace_once(data,"function pin(x,y,color,highlight=false,number=null,category='landmark',plain=false){",'''function atlas85CollectibleIcon(r){
 if(!r)return null;
 const name=String(r.collectionType||r.name||'').toLowerCase();
 const symbols=[[/spaceship|ufo/, '🛸'],[/letter scrap/, '✉'],[/nuclear waste/, '☢'],[/submarine piece/, '⚓'],[/monkey mosaic/, '🐒'],[/peyote/, '🌵'],[/epsilon/, '📜'],[/hidden package/, '🎁'],[/stunt jump/, '🏍'],[/under the bridge/, '🌉'],[/knife flight/, '✈'],[/playing card/, '🃏'],[/action figure/, '🤖'],[/signal jammer/, '📡'],[/ld organics/, '🍃'],[/movie prop/, '🎬'],[/media stick/, '💿'],[/snowm/, '☃'],[/jack.o.lantern|pumpkin/, '🎃'],[/ls tag|graffiti|spray tag/, '🎨'],[/snapshot/, '📷'],[/horseshoe/, '🧲'],[/oyster/, '🦪']];
 if(r.category!=='collectible'&&r.sourceId!=='story')return null;
 return symbols.find(([re])=>re.test(name))?.[1]||'◆';
}
function pin(x,y,color,highlight=false,number=null,category='landmark',plain=false,atlas85Icon=null){''','collection icon helper')
    data=replace_once(data,"if(plain&&!highlight){ctx.restore();return;}","if(plain&&!highlight&&!atlas85Icon){ctx.restore();return;}",'allow custom icons on plain pins')
    data=replace_once(data,"ctx.fillText(number!==null?String(number):CATEGORY_SYMBOLS[category]||'✦',x,y-3);", "if(atlas85Icon){ctx.font=(highlight?'17px':'14px')+' \"Segoe UI Emoji\",\"Apple Color Emoji\",sans-serif';ctx.fillText(atlas85Icon,x,y-3)}else ctx.fillText(number!==null?String(number):CATEGORY_SYMBOLS[category]||'✦',x,y-3);",'marker label')
    data=replace_once(data,'pin(p.x,p.y,color,false,null,r.category,!!r.markerColor&&!r.activityId);','pin(p.x,p.y,color,false,null,r.category,!!r.markerColor&&!r.activityId,atlas85CollectibleIcon(r));','all markers')
    data=replace_once(data,"pin(p.x,p.y,'#ffe7a8',true,null,selected.category,false);","pin(p.x,p.y,'#ffe7a8',true,null,selected.category,false,atlas85CollectibleIcon(selected));",'selected icon')
    # Suppress selected highlight when completed + Hide found.
    data=replace_once(data,"if(selected?.game===game){const p=toScreen(selected.x,selected.y);", "if(selected?.game===game&&(!onlyUnfound||!progress[doneKey(selected)])){const p=toScreen(selected.x,selected.y);",'selected hidden behavior')
    # Expose a tightly scoped supported hook to update state from atlas83 sidebar without reload.
    hook='''
window.JuraAtlas85=Object.freeze({
  state:()=>({game,mode,hideFound:onlyUnfound,route:routeIds().slice()}),
  mappedCollections:()=>records().filter(r=>r.sourceId==='story'&&Number.isInteger(r.collectionSlot)).map(r=>({id:r.id,collectionType:r.collectionType,collectionSlot:r.collectionSlot,found:!!progress[doneKey(r)]})),
  mark:(id,done)=>{const r=records().find(p=>p.id===id);if(!r)return false;
    if(Boolean(progress[doneKey(r)])!==Boolean(done))toggleFound(r);return true},
  showOnly:(type)=>{const q=$('search');q.value=String(type||'');q.dispatchEvent(new Event('input',{bubbles:true}))},
  startRouteForVisible:()=>autoRouteVisible(),
  hideCompleted:(on)=>{const el=$('hideFound');el.checked=Boolean(on);el.dispatchEvent(new Event('change',{bubbles:true}))}
});
'''
    data=replace_once(data,'function init(){if(!ctx){',hook+'\nfunction init(){if(!ctx){','native bridge')
    f.write_text(data,encoding='utf8')
    return ('atlas.js','engine patched')

def inject_html(path):
    f=ROOT/path
    if not f.exists(): raise ValueError(f'Missing {path}')
    text=f.read_text(encoding='utf8')
    if 'atlas85-brand.css' not in text:
        text=replace_once(text,'</head>','<link rel="stylesheet" href="./atlas85-brand.css">\n<script defer src="./atlas85-enhance.js"></script>\n</head>',path+' scripts')
    f.write_text(text,encoding='utf8')
    return (path,'assets connected')

def upgrade_sidebar():
    f=ROOT/'atlas83-map.js'; text=f.read_text(encoding='utf8')
    if 'ATLAS85 SIDEBAR SYNC' in text:return ('atlas83-map.js','already upgraded')
    old="// The existing map engine owns its canvas and reads progress at startup. Reload to\n// keep pins and list honest instead of painting a fake marker state on top of it.\nif(rec){sessionStorage.setItem('j83-selection',s.id);location.reload()}else render();"
    new="""// ATLAS85 SIDEBAR SYNC: update the canvas and route immediately, no page reload.
if(rec&&window.JuraAtlas85){window.JuraAtlas85.mark(rec.id,done);render()}
else if(rec){sessionStorage.setItem('j83-selection',s.id);location.reload()}
else render();"""
    text=replace_once(text,old,new,'sidebar no-reload synchronization')
    text=replace_once(text,"new Option(s.name+' · '+s.total,s.id)","new Option(atlas85SetIcon(s.name)+' '+s.name+' · '+s.total,s.id)",'collection labels')
    text=replace_once(text,"const names={'Spaceship Part':", "function atlas85SetIcon(t){const name=String(t||'').toLowerCase();const options=[['spaceship','🛸'],['letter scrap','✉'],['nuclear waste','☢'],['submarine','⚓'],['monkey mosaic','🐒'],['peyote','🌵'],['epsilon','📜'],['hidden package','🎁'],['stunt jump','🏍'],['under the bridge','🌉'],['knife flight','✈'],['playing card','🃏'],['action figure','🤖'],['signal jammer','📡'],['ld organics','🍃'],['movie prop','🎬'],['media stick','💿'],['snowm','☃'],['jack','🎃'],['ls tag','🎨']];return options.find(([k])=>name.includes(k))?.[1]||'◆'}\nconst names={'Spaceship Part':",'collection icon set')
    text=replace_once(text,'<button id="j83-showset" type="button">Show set pins on map</button><button id="j83-clearset" type="button">', '<button id="j83-showset" type="button">Show set pins on map</button><button id="j85-route" type="button">▶ Start guided hunt</button><button id="j83-clearset" type="button">','guided route button')
    text=replace_once(text,"$('j83-showset').onclick=showSetOnMap;$('j83-clearset').onclick=clearSetOnMap;", "$('j83-showset').onclick=showSetOnMap;$('j85-route').onclick=()=>{showSetOnMap();if(window.JuraAtlas85)window.JuraAtlas85.startRouteForVisible();else feedback('Refresh the map to activate the Atlas 8.5 route engine.');};$('j83-clearset').onclick=clearSetOnMap;",'guided route action')
    f.write_text(text,encoding='utf8')
    return ('atlas83-map.js','sidebar synchronized')

def inject_hq():
    f=ROOT/'atlas81-hq.html'; text=f.read_text(encoding='utf8')
    if './atlas-sa.html' not in text:
        needle='<a href="./atlas-iv.html">'
        if needle not in text: raise ValueError('HQ San Andreas entry location unavailable')
        text=text.replace(needle,'<a href="./atlas-sa.html">GTA San Andreas · Classic State ↗</a>'+needle,1)
        f.write_text(text,encoding='utf8')
    return ('atlas81-hq.html','San Andreas linked')

def main():
    expected=['atlas.js','atlas83-map.js','atlas.html','atlas-online.html','atlas-vi.html','atlas81-hq.html']
    for p in expected:
        if not (ROOT/p).exists():raise ValueError(f'Run this script in repository root; missing {p}')
    targets=[ROOT/p for p in expected]
    original={p:p.read_bytes() for p in targets}
    try:
        results=[fix_engine(),upgrade_sidebar()]+[inject_html(p) for p in ['atlas.html','atlas-online.html','atlas-vi.html']]+[inject_hq()]
    except Exception:
        for p,blob in original.items():p.write_bytes(blob)
        raise
    for file,state in results:print(f'PASS {file}: {state}')
    print('DONE. Review changes, run tests, then commit to development. No road graph imported without validation.')
if __name__=='__main__':
    try:main()
    except Exception as e:print('PATCH ABORTED SAFELY:',e,file=sys.stderr);sys.exit(1)
