/* Atlas 24.0 — source-grounded classic XYZ index, distinct from personal image pins. */
(()=>{'use strict';
const p=new URLSearchParams(location.search),raw=(p.get('game')||p.get('world')||'iii').toLowerCase();
const iii=['iii','gta-iii'].includes(raw);if(!iii&&!['vc','vice-city'].includes(raw))return;
const collectibleConfig=iii?{world:'iii',name:'GTA III',image:'./art/atlas128-gta3-radar.png',file:'./data/atlas-iii-160-source-points.json',revision:'aa120220618c4c1314d319bc6210071437d14662',blob:'e9ddb8461f9300b4097ccfeeeb88393c7ea5fbb7',count:160,cats:{'Hidden packages':100,'Rampages':40,'Unique stunt jumps':20},source:'https://github.com/Lighnat0r-pers/GTA-III-SCM-Converted/tree/aa120220618c4c1314d319bc6210071437d14662'}:{world:'vc',name:'Vice City',image:'./art/atlas128-vice-city-radar.png',file:'./data/atlas-vc-51-source-points.json',revision:'b06265e1bf37e2b1ed389c58c80679addfbc8f20',blob:'7ae40595da5d5480c50f6a82c2b20557f1f7f6ae',count:51,cats:{'Stunt jumps':36,'Store robberies':15},source:'https://github.com/kong78/collectibles-on-radar-gta-vc/blob/b06265e1bf37e2b1ed389c58c80679addfbc8f20/src/Util.cpp'};
const landmarkConfig={...collectibleConfig,kind:'landmarks',file:iii?'./data/atlas401-iii-landmarks.json':'./data/atlas401-vc-landmarks.json',revision:'f69c37a0ac5e68e81e770f79a0a8387f1054f03c',count:iii?42:22,cats:iii?{"Police stations":3,"Hospitals":3,"Fire stations":3,"Pay 'n' Spray":3,"Ammu-Nation":2,"Train stations":6,"Safehouses":1,"Landmarks":21}:{"Police stations":3,"Hospitals":2,"Landmarks":8,"Food & bars":3,"Clubs":2,"Tool shops":2,"Ammu-Nation":1,"Pay 'n' Spray":1},source:'https://github.com/VortrexFTW/v-essentials/blob/f69c37a0ac5e68e81e770f79a0a8387f1054f03c/v-sandbox/shared/util.js'};
let config=collectibleConfig,generation=0;
const formatZ=z=>Number.isFinite(z)?z.toFixed(3):'not specified (2D trigger)';
const target=document.getElementById('classicFlatReference');if(!target||document.getElementById('j240-source-index'))return;
const E=(t,s)=>{const n=document.createElement(t);if(s!==undefined)n.textContent=s;return n};
const root=E('section');root.id='j240-source-index';root.className='j240-source-index';root.setAttribute('aria-label',config.name+' sourced coordinates');
const heading=E('h3',config.name+' · sourced map locations');
const note=E('p','Game-script reference positions projected using the original radar publisher’s documented coordinates. Only the matching original image displays source markers. Source numbering differs from guide checklists. Geometric routes are not street navigation or gameplay verification.');
const status=E('p','Loading locally bundled source…');status.setAttribute('role','status');status.id='j240-status';
const controls=E('div');controls.className='j240-controls';
const cat=E('select');cat.id='j240-category';cat.setAttribute('aria-label','Source category');
const q=E('input');q.type='search';q.placeholder='Search source ID or name';q.setAttribute('aria-label','Search source positions');
const start=E('select');start.id='j240-start';start.setAttribute('aria-label','Route starting reference');
const order=E('button','Build geometric preview');order.type='button';order.disabled=true;
const exportButton=E('button','Export source preview');exportButton.type='button';exportButton.disabled=true;
const mode=E('select');mode.id='j401-source-mode';mode.setAttribute('aria-label','Choose classic map source layer');for(const [value,label] of [['collectibles','Collectibles and activities'],['landmarks','Landmarks and services']]){const o=E('option',label);o.value=value;mode.append(o)}controls.append(mode,cat,q,start,order,exportButton);
const legend=E('fieldset');legend.id='j402-category-legend';legend.className='j402-category-legend';legend.append(E('legend','Map category legend'));
const legendActions=E('div');legendActions.className='j402-legend-actions';
const all=E('button','Show all categories'),none=E('button','Hide all categories');all.type=none.type='button';all.disabled=none.disabled=true;legendActions.append(all,none);
const legendRows=E('div');legendRows.className='j402-legend-rows';legend.append(legendActions,legendRows);
const activeCats=new Set(),legendInputs=new Map();
const list=E('ol');list.id='j240-rows';
const source=E('a','Original source and author ↗');source.href=config.source;source.target='_blank';source.rel='noopener noreferrer';
root.append(heading,note,status,controls,legend,list,source);target.after(root);
let rows=[],planned=[],selectedId='',progress=null,selectedRecord=null;
const viewport=document.getElementById('classicViewport'),surface=document.getElementById('classicMapSurface');
const projected=E('div');projected.id='j241-source-pins';projected.className='j241-source-pins';
const detail=E('section');detail.id='j241-source-detail';detail.className='j241-source-detail';detail.hidden=true;detail.setAttribute('aria-live','polite');
const toggle=E('button','Hide sourced pins');toggle.type='button';toggle.setAttribute('aria-pressed','true');
const alignment=E('p','Checking radar image alignment…');alignment.id='j241-alignment';alignment.setAttribute('role','status');
viewport.after(detail,alignment);surface.append(projected);controls.prepend(toggle);
let enabled=true;
function compatible(){return viewport.dataset.mapImage==='game-original'&&viewport.dataset.sourceImage===config.image&&viewport.dataset.sourceWidth==='1024'&&viewport.dataset.sourceHeight==='1024'}
function selectRecord(r){
 selectedId=r.id;selectedRecord=r;detail.hidden=false;detail.replaceChildren(E('strong',r.name),E('p','World X '+r.x.toFixed(3)+' · Y '+r.y.toFixed(3)+' · Z '+formatZ(r.z)+(config.kind==='landmarks'?' · source teleport approach, not a verified entrance.':' · source reference, not individually gameplay verified.')));
 const link=E('a','Coordinate source ↗');link.href=r.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';const close=E('button','Close detail');close.type='button';close.onclick=()=>{selectedId='';selectedRecord=null;detail.hidden=true;drawMap()};detail.append(link);if(progress)detail.append(progress.button(r));detail.append(close);drawMap();
}
function drawMap(){
 projected.replaceChildren();
 const aligned=compatible();alignment.textContent=aligned?'Original radar image matched · source-documented projection · gameplay verification pending.':'Source pins hidden — the selected artwork is not the matched original radar image.';
 toggle.disabled=!aligned;projected.hidden=!aligned||!enabled;
 if(!aligned||!enabled){detail.hidden=true;return}
 const selected=visible();
 if(!selected.some(r=>r.id===selectedId))detail.hidden=true;
 if(planned.length>1){
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','j241-source-route');const line=document.createElementNS(ns,'polyline');line.setAttribute('points',planned.map(r=>r.imageX+','+r.imageY).join(' '));svg.append(line);projected.append(svg);
 }
 for(const r of selected){
  const pin=E('button',/jump/i.test(r.category)?'🏁':r.category==='Hidden packages'?'📦':'◆');pin.type='button';pin.className='j241-source-pin';pin.dataset.sourceId=r.id;pin.dataset.category=r.category;pin.dataset.found=String(progress?.isDone(r)||false);pin.style.left=r.imageX+'%';pin.style.top=r.imageY+'%';pin.title=r.name;pin.setAttribute('aria-label','Sourced '+r.name);pin.setAttribute('aria-pressed',String(r.id===selectedId));pin.onclick=e=>{e.stopPropagation();selectRecord(r)};projected.append(pin);
 }
}
toggle.onclick=()=>{enabled=!enabled;toggle.textContent=enabled?'Hide sourced pins':'Show sourced pins';toggle.setAttribute('aria-pressed',String(enabled));drawMap()};
window.addEventListener('team-jura:classic-map-image-change',drawMap);
const option=(value,label)=>{const o=E('option',label);o.value=value;return o};
function visible(){const s=q.value.trim().toLowerCase();return rows.filter(r=>(!progress||progress.visible(r))&&activeCats.has(r.category)&&(!s||(r.id+' '+r.name).toLowerCase().includes(s)))}
function display(items){list.replaceChildren();for(const r of items){const li=E('li'),label=E('strong',r.name),detail=E('small','X '+r.x.toFixed(3)+' · Y '+r.y.toFixed(3)+' · Z '+formatZ(r.z));li.dataset.id=r.id;const locate=E('button','Locate reference');locate.type='button';locate.onclick=()=>{selectRecord(r);if(compatible()&&enabled)viewport.scrollIntoView({block:'center',behavior:'smooth'});else detail.hidden=false};li.append(label,detail,locate);if(progress)li.append(progress.button(r));list.append(li)}}
function reset(){planned=[];exportButton.disabled=true;const selected=start.value,items=visible();start.replaceChildren(option('','Choose origin…'),...items.map(r=>option(r.id,r.name)));if(items.some(r=>r.id===selected))start.value=selected;order.disabled=!start.value;display(items);status.textContent=items.length+' references shown · '+config.count+' total · source-matched radar projection.'+(iii&&activeCats.has('Rampages')?' Rampages: 20 objectives; 2 possible spawns each.':'');drawMap()}
function syncLegend(){
 for(const [category,input] of legendInputs)input.checked=activeCats.has(category);
 const n=activeCats.size,total=legendInputs.size;
 cat.value=n===0?'__none':n===1?[...activeCats][0]:n===total?'__all':'__custom';
 all.disabled=!total||n===total;none.disabled=!total||n===0;
}
function setCategories(values){activeCats.clear();for(const v of values)if(legendInputs.has(v))activeCats.add(v);syncLegend();reset()}
all.onclick=()=>setCategories(legendInputs.keys());
none.onclick=()=>setCategories([]);
q.oninput=reset;
cat.onchange=()=>{if(cat.value==='__all')setCategories(legendInputs.keys());else if(cat.value==='__none')setCategories([]);else if(cat.value!=='__custom')setCategories([cat.value])};
start.onchange=()=>{order.disabled=!start.value;planned=[];exportButton.disabled=true;display(visible());drawMap()};
order.onclick=()=>{
 const points=visible(),origin=points.find(r=>r.id===start.value);if(!origin)return;
 const alternateSpawns=iii&&points.some(r=>r.category==='Rampages'),objective=r=>iii&&r.category==='Rampages'?'rampage:'+r.slot:r.id;
 let pending=points.filter(r=>objective(r)!==objective(origin));const baseline=[origin];
 while(pending.length){
  const from=baseline.at(-1);
  pending.sort((a,b)=>((a.x-from.x)**2+(a.y-from.y)**2)-((b.x-from.x)**2+(b.y-from.y)**2)||a.slot-b.slot||a.id.localeCompare(b.id));
  const next=pending[0];baseline.push(next);pending=pending.filter(r=>objective(r)!==objective(next));
 }
 const improved=window.JuraRoutePlanner?.improveOrder?.(origin,baseline.slice(1));
 planned=improved?.improved?[origin,...improved.stops]:baseline;
 display(planned);exportButton.disabled=false;
 status.textContent=planned.length+' reference stops · '+(alternateSpawns?'one candidate spawn per objective; confirm the active spawn. ':'')+(improved?.improved?'shorter geometric order; ':'nearest-next order retained; ')+'not road directions.';
 drawMap();
};
exportButton.onclick=()=>{if(!planned.length)return;const blob=new Blob([JSON.stringify({schema:1,world:config.world,kind:config.kind==='landmarks'?'landmark-approach-preview':'sourced-coordinate-preview',sourceUrl:source.href,route:planned.map(({id,x,y,z})=>({id,x,y,z}))},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=E('a');a.href=url;a.download='team-jura-'+config.world+(config.kind==='landmarks'?'-landmarks':'')+'-reference-route.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)};
function loadConfig(next){
 if(progress?.hasUnsaved()){mode.value=config.kind==='landmarks'?'landmarks':'collectibles';status.textContent='Unsaved working progress. Export before leaving this layer.';return}
 const load=++generation;progress?.dispose();progress=null;config=next;rows=[];planned=[];selectedId='';selectedRecord=null;detail.hidden=true;cat.replaceChildren();activeCats.clear();legendInputs.clear();legendRows.replaceChildren();all.disabled=none.disabled=true;start.replaceChildren();list.replaceChildren();q.value='';cat.disabled=q.disabled=start.disabled=true;order.disabled=exportButton.disabled=true;heading.textContent=config.name+(config.kind==='landmarks'?' · landmarks and services':' · sourced map locations');note.textContent=config.kind==='landmarks'?'MIT-licensed named teleport approach references on the matched original radar. These are not collectible spawns, exact entrances or verified gameplay positions. Visited progress is separate.':'Game-script reference positions projected using the original radar publisher’s documented coordinates. Only the matching original image displays source markers. Source numbering differs from guide checklists. Geometric routes are not street navigation or gameplay verification.';source.href=config.source;source.textContent=config.kind==='landmarks'?'Vortrex / MIT source and author ↗':'Original source and author ↗';status.textContent='Loading locally bundled source…';drawMap();
 fetch(config.file).then(r=>{if(!r.ok)throw Error('source unavailable');return r.json()}).then(d=>{
 if(load!==generation)return;
 const seen=new Set();
 if(config.kind==='landmarks'&&(d.kind!=='landmark-approach-reference'||d.edition!=='classic-reference'||d.license!=='MIT'||d.gameplayVerified!==false))throw Error('landmark source identity mismatch');
 if(d.schema!==1||d.world!==config.world||d.sourceRevision!==config.revision||d.mapAlignment!=='source-transform-matched'||d.projection?.gitBlobSha!==config.blob||d.records?.length!==config.count)throw Error('source identity mismatch');
 for(const r of d.records){
  if(typeof r.id!=='string'||!r.id.startsWith(config.world+'-')||seen.has(r.id)||!Object.hasOwn(config.cats,r.category)||![r.x,r.y].every(Number.isFinite)||!(Number.isFinite(r.z)||(iii&&r.category==='Unique stunt jumps'&&r.z===null))||typeof r.name!=='string'||typeof r.sourceUrl!=='string'||!r.sourceUrl.startsWith('https://github.com/')||Math.abs(r.x)>2000||Math.abs(r.y)>2000||!Number.isFinite(r.imageX)||!Number.isFinite(r.imageY)||Math.abs(r.imageX-(r.x+2000)/40)>.000001||Math.abs(r.imageY-(2000-r.y)/40)>.000001)throw Error('invalid source row');
  seen.add(r.id);
 }
 for(const [category,count] of Object.entries(config.cats)){
  if(d.records.filter(r=>r.category===category).length!==count)throw Error('category count mismatch');
  cat.append(option(category,category+' · '+count));
  const label=E('label'),input=E('input');input.type='checkbox';input.dataset.category=category;input.onchange=()=>{input.checked?activeCats.add(category):activeCats.delete(category);syncLegend();reset()};
  label.append(input,document.createTextNode(category+' · '+count));legendInputs.set(category,input);legendRows.append(label);
 }
 const mixed=option('__custom','Custom category selection');mixed.disabled=true;cat.append(option('__all','All categories'),option('__none','No categories'),mixed);
 activeCats.add(Object.keys(config.cats)[0]);syncLegend();
 rows=d.records;progress=window.JuraSourceProgress.create(window,{scope:config.world+(config.kind==='landmarks'?'-classic-landmarks':'-classic'),revision:config.revision,rows,identity:r=>iii&&r.category==='Rampages'?'rampage:'+r.slot:r.id,kind:config.kind==='landmarks'?'visited':'found',host:root,onChange:()=>{const current=detail.hidden?null:selectedRecord;reset();if(current&&visible().some(r=>r.id===current.id)&&enabled&&compatible())selectRecord(current)}});cat.disabled=q.disabled=start.disabled=false;reset()
 }).catch(e=>{if(load!==generation)return;status.textContent='Reference index unavailable: '+e.message;cat.disabled=q.disabled=start.disabled=true});
}
mode.onchange=()=>loadConfig(mode.value==='landmarks'?landmarkConfig:collectibleConfig);
loadConfig(collectibleConfig);
})();
