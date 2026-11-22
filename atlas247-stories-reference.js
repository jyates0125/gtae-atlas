/* Atlas 24.7 — edition-specific PSP reference index; no uncalibrated pixel placement. */
(()=>{'use strict';
const p=new URLSearchParams(location.search),raw=(p.get('game')||p.get('world')||'iii').toLowerCase(),world=({'vice-city-stories':'vcs','liberty-city-stories':'lcs'})[raw]||raw;
const counts={"lcs":52,"vcs":51};if(!Object.hasOwn(counts,world))return;
const title=world==='lcs'?'Liberty City Stories':'Vice City Stories',host=document.getElementById('classicFlatReference');if(!host)return;
const E=(t,s)=>{const n=document.createElement(t);if(s!==undefined)n.textContent=s;return n};
const root=E('section');root.id='j247-reference';root.className='j240-source-index';root.setAttribute('aria-label',title+' PSP source locations');
const heading=E('h3',title+' · PSP location references'),note=E('p','Game-specific teleport presets from Freakler / CheatDeviceRemastered. These are reference destinations, not verified collectible spawns. No pins are projected onto an uncalibrated map.');
const controls=E('div');controls.className='j240-controls';const cat=E('select');cat.id='j247-category';cat.setAttribute('aria-label','Location category');const q=E('input');q.type='search';q.placeholder='Find a location';q.setAttribute('aria-label','Search location references');const origin=E('select');origin.id='j247-origin';origin.setAttribute('aria-label','Choose reference origin');const plan=E('button','Preview reference route');plan.type='button';plan.disabled=true;const save=E('button','Export reference route');save.type='button';save.disabled=true;controls.append(cat,q,origin,plan,save);
const status=E('p','Loading reference source…');status.id='j247-status';status.setAttribute('role','status');const list=E('ol');list.id='j247-results';const link=E('a','Original source and license ↗');link.href='https://github.com/Freakler/CheatDeviceRemastered/blob/eb962c5bff9c1d94e6cb48077885fde0f5d28317/src/functions.c';link.target='_blank';link.rel='noopener noreferrer';const sources=E('div');sources.className='j240-controls';sources.id='j248-map-sources';
const satellite=E('a','Open high-resolution satellite / radar ↗');satellite.href=world==='lcs'?'https://gtamap.io/gta-liberty-city-stories-map/':'https://gtamap.io/gta-vice-city-stories-map/';
const official=E('a','Rockstar original high-resolution maps ↗');official.href='https://www.rockstargames.com/newswire/article/25o2411819oo5k/download-high-res-maps-for-liberty-city-stories-and-vice-city-st.html?hl=en-US';
for(const a of [satellite,official]){a.target='_blank';a.rel='noopener noreferrer';sources.append(a)}
const info=E('p','GTAMap.io publishes an edition-specific 32,000 × 32,000 satellite render with native world coordinates. Open the external interactive view to compare these XYZ locations. Rockstar also supplies downloadable original print maps. Use a downloaded image in Atlas privately via the map image import; existing personal marker percentages may need realignment. No automatic marker conversion.');
const importMap=E('button','Use my downloaded map image');importMap.type='button';importMap.onclick=()=>document.getElementById('classicImageFile')?.click();sources.append(importMap);
root.append(heading,note,sources,info,controls,status,list,link);host.after(root);
let rows=[],route=[];const option=(v,label)=>{const o=E('option',label);o.value=v;return o};const matched=()=>rows.filter(r=>(!cat.value||r.category===cat.value)&&r.name.toLowerCase().includes(q.value.trim().toLowerCase()));
function show(items){list.replaceChildren();for(const r of items){const li=E('li');li.dataset.id=r.id;li.append(E('strong',r.name),E('small',r.category+' · X '+r.x+' · Y '+r.y+' · Z '+r.z));list.append(li)}drawAligned(items)}
function reset(){route=[];save.disabled=true;const old=origin.value,items=matched();origin.replaceChildren(option('','Choose origin…'),...items.map(r=>option(r.id,r.name)));if(items.some(r=>r.id===old))origin.value=old;plan.disabled=!origin.value;show(items);status.textContent=items.length+' of '+rows.length+' source references · PSP edition only.'}
cat.onchange=q.oninput=reset;origin.onchange=()=>{route=[];save.disabled=true;plan.disabled=!origin.value;show(matched())};
plan.onclick=()=>{const items=matched(),first=items.find(r=>r.id===origin.value);if(!first)return;const remaining=items.filter(r=>r.id!==first.id);route=[first];while(remaining.length){const p=route.at(-1);remaining.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)||a.id.localeCompare(b.id));route.push(remaining.shift())}const better=window.JuraRoutePlanner?.improveOrder(first,route.slice(1));if(better?.improved)route=[first,...better.stops];show(route);save.disabled=false;status.textContent=route.length+' reference stops · geometric XY order, not road directions.'};
save.onclick=()=>{if(!route.length)return;const a=E('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({schema:1,world,edition:'PSP',kind:'reference-route',sourceUrl:link.href,route:route.map(({id,x,y,z})=>({id,x,y,z}))},null,2)],{type:'application/json'}));a.download='team-jura-'+world+'-reference-route.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};

// Private image alignment is never transferred to another image or world.
const viewport=document.getElementById('classicViewport'),surface=document.getElementById('classicMapSurface'),bg=document.getElementById('classicMapBackground');
let anchors=[],transform=null,imageKey='',picking=false;
const calibration=E('details');calibration.id='j249-calibrate';
calibration.append(E('summary','Align sourced pins to my map image'),E('p','Choose three well-separated recognizable reference points and a fourth independent check point. Pick each exact corresponding place on the visible image. Accepted alignment is approximate and private to this image/session. It does not move personal markers or certify gameplay locations.'));
const anchor=E('select');anchor.id='j249-anchor';anchor.setAttribute('aria-label','Choose alignment landmark');
const pick=E('button','Pick point on map');pick.type='button';pick.disabled=true;
const clear=E('button','Reset alignment');clear.type='button';
const calStatus=E('p','Load an actual game map image first.');calStatus.id='j249-status';calStatus.setAttribute('role','status');
const anchorList=E('ol');anchorList.id='j249-anchors';
const calControls=E('div');calControls.className='j240-controls';calControls.append(anchor,pick,clear);
calibration.append(calControls,calStatus,anchorList);sources.after(calibration);
const layer=E('div');layer.id='j249-pins';layer.className='j241-source-pins';layer.hidden=true;surface.append(layer);
const markerInfo=E('p');markerInfo.id='j249-selected';markerInfo.hidden=true;markerInfo.setAttribute('role','status');viewport.after(markerInfo);
const getImage=()=>viewport.dataset.mapImage!=='original-art'&&bg.classList.contains('has-image')?bg.style.backgroundImage:'';
function drawAligned(items=route.length?route:matched()){
 layer.replaceChildren();layer.hidden=!transform;
 if(!transform)return;
 const ns='http://www.w3.org/2000/svg';
 if(route.length>1){const svg=document.createElementNS(ns,'svg');svg.setAttribute('class','j241-source-route');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');const line=document.createElementNS(ns,'polyline');line.setAttribute('points',route.map(r=>{const p=transform.project(r);return p.u+','+p.v}).join(' '));svg.append(line);layer.append(svg)}
 for(const r of items){const p=transform.project(r);if(p.u<0||p.u>100||p.v<0||p.v>100)continue;const b=E('button');b.type='button';b.className='j241-source-pin j249-pin';b.dataset.sourceId=r.id;b.dataset.category=r.category;b.style.left=p.u+'%';b.style.top=p.v+'%';b.textContent=r.category==='Safehouses and hideouts'?'⌂':r.category==='Services'?'+':r.category==='Transport'?'↔':'◆';b.setAttribute('aria-label',r.name);b.title=r.name;b.onclick=e=>{e.stopPropagation();markerInfo.hidden=false;markerInfo.textContent=r.name+' · X '+r.x+' · Y '+r.y+' · Z '+r.z+' · approximate user-aligned reference.'};layer.append(b)}
}
function refreshAnchors(){
 const old=anchor.value;
 anchor.replaceChildren(option('','Choose known landmark…'),...rows.filter(r=>!anchors.some(a=>a.id===r.id)).map(r=>option(r.id,r.name)));
 if([...anchor.options].some(o=>o.value===old))anchor.value=old;
 anchorList.replaceChildren(...anchors.map(a=>E('li',a.name+' · '+a.u.toFixed(2)+'%, '+a.v.toFixed(2)+'%')));
 pick.disabled=!getImage()||!anchor.value||anchors.length>=4;anchor.disabled=!getImage()||anchors.length>=4;
}
function cancelPicking(){picking=false;surface.classList.remove('j249-picking')}
function invalidate(){cancelPicking();anchors=[];transform=null;markerInfo.hidden=true;imageKey=getImage();calStatus.textContent=imageKey?'Choose four known landmarks. Source pins stay hidden until the independent check passes.':'Load an actual game map image first.';refreshAnchors();drawAligned()}
anchor.onchange=refreshAnchors;clear.onclick=invalidate;
pick.onclick=()=>{if(!getImage()||!anchor.value||anchors.length>=4)return;picking=true;imageKey=getImage();surface.classList.add('j249-picking');calStatus.textContent='Tap the exact location of '+rows.find(r=>r.id===anchor.value).name+' on the map. Use Reset to cancel.';viewport.scrollIntoView({block:'center',behavior:'smooth'})};
let tap=null;
viewport.addEventListener('pointerdown',e=>{if(!picking)return;tap={x:e.clientX,y:e.clientY,id:e.pointerId};e.preventDefault();e.stopImmediatePropagation()},true);
viewport.addEventListener('pointerup',e=>{if(!picking||!tap||tap.id!==e.pointerId)return;e.preventDefault();e.stopImmediatePropagation();const from=tap;tap=null;if(Math.hypot(e.clientX-from.x,e.clientY-from.y)>12)return;
 const r=rows.find(r=>r.id===anchor.value),bounds=surface.getBoundingClientRect();if(!r||!bounds.width||!bounds.height||getImage()!==imageKey){invalidate();return}
 const u=(e.clientX-bounds.left)/bounds.width*100,v=(e.clientY-bounds.top)/bounds.height*100;
 if(u<0||u>100||v<0||v>100)return;
 anchors.push({...r,u,v});cancelPicking();refreshAnchors();
 if(anchors.length===4){try{transform=window.JuraMapCalibration.fit(anchors);calStatus.textContent='Approximate private alignment accepted · independent check error '+transform.error.toFixed(2)+'% of image dimensions.';drawAligned()}catch(err){transform=null;calStatus.textContent=err.message+'. Reset and try again.';drawAligned()}}
 else calStatus.textContent=anchors.length+' of 4 control points recorded. Choose next landmark.';
},true);
viewport.addEventListener('pointercancel',()=>{tap=null},true);
window.addEventListener('team-jura:classic-map-image-change',()=>{if(getImage()!==imageKey)invalidate()});

fetch('./data/atlas-'+world+'-psp-reference.json').then(r=>{if(!r.ok)throw Error('Source unavailable');return r.json()}).then(d=>{if(d.schema!==1||d.world!==world||d.sourceRevision!=='eb962c5bff9c1d94e6cb48077885fde0f5d28317'||d.mapAlignment!=='unverified'||d.records?.length!==counts[world])throw Error('Source mismatch');const ids=new Set();for(const r of d.records){if(typeof r.id!=='string'||!r.id.startsWith(world+'-ref-')||ids.has(r.id)||typeof r.name!=='string'||typeof r.category!=='string'||![r.x,r.y,r.z].every(Number.isFinite))throw Error('Invalid record');ids.add(r.id)}rows=d.records;cat.append(option('','All categories'),...[...new Set(rows.map(r=>r.category))].map(c=>option(c,c)));invalidate();reset()}).catch(e=>{status.textContent='References unavailable: '+e.message;cat.disabled=q.disabled=origin.disabled=true});
})();
