/* Team Jura Atlas 9.8 — seven separate local classic-world workspaces.
   Map annotations are normalized IMAGE percentages, not GTA world coordinates.
   Offline data remains user-generated; proprietary basemaps or third-party coordinates are NOT redistributed. */
(function(){'use strict';
const worlds={
 iii:{name:'GTA III · Liberty City',desc:'The original 3D-era Liberty City. Track personal map notes and collections.',art:'atlas106-gta3.svg',map:'./art/atlas128-gta3-radar.png',sets:['Hidden packages','Unique stunt jumps','Rampages','Missions','Safehouses']},
 vc:{name:'GTA Vice City',desc:'Ocean Beach, Downtown, Little Havana and the classic neon coastline.',art:'atlas106-vice-city.svg',map:'./art/atlas128-vice-city-radar.png',sets:['Hidden packages','Rampages','Stunt jumps','Properties','Missions']},
 vcs:{name:'Vice City Stories',desc:'Explore the earlier Vice City era with your personal research notes.',art:'atlas106-vcs.svg',map:'https://gtwfilesie.grandtheftwiki.com/ViceCity-GTAVCS-map.png',sets:['Red balloons','Rampages','Empire sites','Stunt jumps','Missions','Safehouses']},
 lcs:{name:'Liberty City Stories',desc:'Return to Liberty City in 1998; build an organized record of pickups and missions.',art:'atlas106-lcs.svg',map:'https://wikiassets.net/gta-vi-1c4e11/images/5019685d9fa05493b4cea714ca968bf1.webp',sets:['Hidden packages','Rampages','Stunt jumps','Missions','Safehouses']},
 ctw:{name:'Chinatown Wars',desc:'A different Liberty City map and handheld-era collections.',art:'atlas106-chinatown-wars.svg',map:'https://www.igrandtheftauto.com/content/images/1934-gtacw-full-map.jpg',sets:['Security cameras','Rampages','Unique jumps','Collectibles','Missions','Safehouses','Drug dealer locations']},
 tlad:{name:'The Lost and Damned',desc:'Liberty City motorcycle-club episode; notes stay separate from GTA IV.',art:'atlas106-lost-damned.svg',map:'./art/atlas128-gta4-landmarks.jpg',sets:['Seagulls','Gang wars','Motorcycle missions','Races','Activities']},
 tbogt:{name:'The Ballad of Gay Tony',desc:'Liberty City nightlife episode; nightclub missions and activities.',art:'atlas106-gay-tony.svg',map:'./art/atlas128-gta4-landmarks.jpg',sets:['Seagulls','Drug wars','Base jumps','Nightclub missions','Activities']}
};
// One explicit source trail per image, not an inferred license for an entire fan site.
// A failed third-party image must not silently become an unrelated city's map.
const mapAlternates={
 vcs:[
  {url:'https://www.igrandtheftauto.com/content/images/1933-gtavcs-full-map.jpg',name:'Vice City Stories · independent fan archive',page:'https://www.igrandtheftauto.com/gtavcs/images/1933-gtavcs-full-map'},
  {url:'https://www.igrandtheftauto.com/content/images/3630-gtavcs-vice-city-stories-map.jpg',name:'Vice City Stories · second archive image',page:'https://www.igrandtheftauto.com/gtavcs/images/3630-gtavcs-vice-city-stories-map'}
 ],
 lcs:[
  {url:'https://www.igrandtheftauto.com/content/images/1932-gtalcs-full-map.jpg',name:'Liberty City Stories · independent fan archive',page:'https://www.igrandtheftauto.com/gtalcs/images/1932-gtalcs-full-map'},
  {url:'https://gtwfilesie.grandtheftwiki.com/LibertyCity-GTALCS-map.jpg',name:'Liberty City Stories · previous original reference',page:'https://www.grandtheftwiki.com/File:LibertyCity-GTALCS-map.jpg'}
 ],
 ctw:[
  {url:'https://gtwfilesie.grandtheftwiki.com/LibertyCity-GTACW-map.png',name:'Chinatown Wars · GTASeries.com neighborhood map adapted from GTA IV artwork',page:'https://www.grandtheftwiki.com/File:LibertyCity-GTACW-map.png'},  
  {url:'https://wikiassets.net/gta-wiki-aef1ab/images/03205438369fb05f953c0fbfa4b1fd8d.webp',name:'Chinatown Wars · wiki image reference',page:'https://www.igrandtheftauto.com/gtacw/setting'}
 ]
};
const mapOrigins={
 iii:{name:'GTA III radar · XiaoNiaoa/noiseXYZ (game art: Rockstar)',page:'https://github.com/XiaoNiaoa/vc_lc'},
 vc:{name:'Vice City radar · XiaoNiaoa/noiseXYZ (game art: Rockstar)',page:'https://github.com/XiaoNiaoa/vc_lc'},
 vcs:{name:'Vice City Stories · original game-map reference (Rockstar)',page:'https://www.grandtheftwiki.com/File:ViceCity-GTAVCS-map.png'},
 lcs:{name:'Liberty City Stories · clean in-game road image (Rockstar / GTA Wiki reference)',page:'https://grandtheftauto6wiki.com/wiki/liberty-city-3d-universe/'}, 
 ctw:{name:'Chinatown Wars · original game-era map (Rockstar), archived by iGrandTheftAuto',page:'https://www.igrandtheftauto.com/gtacw/setting'},  
 tlad:{name:'GTA IV map · GTADB.ORG contributors, CC BY 4.0 (game world: Rockstar)',page:'https://github.com/rolux/gtadb.org/blob/main/LICENSE-DATA'},
 tbogt:{name:'GTA IV map · GTADB.ORG contributors, CC BY 4.0 (game world: Rockstar)',page:'https://github.com/rolux/gtadb.org/blob/main/LICENSE-DATA'}
};
const publicFlatMaps={
 iii:{url:'https://gtamap.io/gta-3-map/',title:'GTA III · original Liberty City',desc:'Independent viewer of GTA III\'s actual radar map, Hidden Packages and source-attributed collectables.'},
 vc:{url:'https://gtamap.io/gta-vice-city-map/',title:'GTA Vice City · 1986 radar map',desc:'Period-correct Vice City in-game map, 100 Hidden Packages, rampages, jumps and properties.'},
 vcs:{url:'https://gtamap.io/gta-vice-city-stories-map/',title:'GTA Vice City Stories · 1984',desc:'Vice City Stories-era map and Red Balloon references. Not the GTA VI Leonida map.'},
 lcs:{url:'https://gtamap.io/gta-liberty-city-stories-map/',title:'Liberty City Stories · 1998',desc:'Liberty City Stories game-specific radar/collectible map, not GTA IV.'},
 ctw:{url:'https://gtamap.io/gta-chinatown-wars-map/',title:'Chinatown Wars · PDA map',desc:'Original handheld-era PDA map; no Alderney and no verified positional alignment for player notes.'},
 tlad:{url:'https://gtamap.io/gta-4-map/',title:'The Lost and Damned · Liberty City',desc:'Select The Lost and Damned layers in the external GTA IV viewer. The episode shares Liberty City geography with GTA IV.'},
 tbogt:{url:'https://gtamap.io/gta-4-map/',title:'The Ballad of Gay Tony · Liberty City',desc:'Select The Ballad of Gay Tony layers in the external GTA IV viewer. This is not a separate imaginary island.'}
};
function flatReference(){const ref=publicFlatMaps[id];if(!ref)return;const ep=document.getElementById('j190-episode-collectibles');if(ep&&(id==='tlad'||id==='tbogt')){ep.hidden=false;ep.href='./atlas-iv.html?scope='+id;ep.textContent=id==='tlad'?'Explore all 50 Lost and Damned Seagulls on our Liberty City map →':'Explore all 50 Ballad of Gay Tony Seagulls on our Liberty City map →';}const title=$('#classicFlatTitle'),desc=$('#classicFlatDescription'),a=$('#classicFlatLink'),credit=$('#classicFlatCredit');if(!title||!desc||!a||!credit)return;title.textContent=ref.title;desc.textContent=ref.desc+' The original game map appears above when the reference image is reachable. The external viewer has additional location layers. Atlas personal pins are not game-world coordinates.';a.href=ref.url;a.textContent='View game-specific 2D map and verified map layers ↗';credit.textContent='External GTAMap.io reference · game artwork © Rockstar / Take-Two · own map notes stay on this device';}

const alias={'vice-city':'vc','gta-iii':'iii','vice-city-stories':'vcs','liberty-city-stories':'lcs','chinatown-wars':'ctw','lost-and-damned':'tlad','ballad-of-gay-tony':'tbogt'};
const $=q=>document.querySelector(q),E=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
const params=new URLSearchParams(location.search),raw=(params.get('game')||params.get('world')||'iii').toLowerCase();const id=worlds[raw]?raw:(alias[raw]||'iii'),w=worlds[id];
const key='team-jura-atlas98-classic-'+id+'-v1';const blank=()=>({schema:'team-jura-atlas98-classic-v1',world:id,markers:[],completed:[],background:null});
function read(){try{const data=JSON.parse(localStorage.getItem(key)||'null');if(data&&data.schema==='team-jura-atlas98-classic-v1'&&data.world===id&&Array.isArray(data.markers))return data}catch{}return blank()}
let state=read(),adding=false,editing=null,pendingSlot=null,scale=1,dx=0,dy=0,dragged=false;
let highResUrl=null,highResSize=null; // personal map raster is stored separately
let originalMapReady=false,originalMapSize=null,activeMapUrl=null; // source-backed map image, not a world coordinate transform
const status=message=>{if($('#classicMessage'))$('#classicMessage').textContent=message};
function persist(){try{localStorage.setItem(key,JSON.stringify(state));window.dispatchEvent(new CustomEvent('team-jura:classic-change',{detail:{world:id}}));return true}catch(e){status('This browser could not save all records. Export a backup, or remove an oversized map image.');return false}}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function applyTransform(){const s=$('#classicMapSurface');if(s)s.style.transform=`translate(${dx}px,${dy}px) scale(${scale})`;
 const level=$('#classicZoomLevel');if(level)level.textContent=scale.toFixed(1)+'×';
 const inBtn=$('#classicZoomIn'),outBtn=$('#classicZoomOut');
 if(inBtn){inBtn.disabled=scale>=5.999;inBtn.title=inBtn.disabled?'Maximum zoom reached':'Zoom in'}
 if(outBtn){outBtn.disabled=scale<=1.001;outBtn.title=outBtn.disabled?'Minimum zoom reached':'Zoom out'}
}

function fitClassicImage(){
 const viewport=$('#classicViewport'),surface=$('#classicMapSurface');if(!viewport||!surface)return;
 const dimensions=highResSize||(!state.background&&originalMapReady?originalMapSize:null);
 if(!dimensions){for(const prop of ['inset','width','height','left','top'])surface.style.removeProperty(prop);return}
 const ratio=dimensions.width/dimensions.height,vw=viewport.clientWidth,vh=viewport.clientHeight;
 if(!vw||!vh||!Number.isFinite(ratio)||ratio<=0)return;
 const width=Math.min(vw,vh*ratio),height=width/ratio;
 surface.style.inset='auto';surface.style.width=width+'px';surface.style.height=height+'px';
 surface.style.left=(vw-width)/2+'px';surface.style.top=(vh-height)/2+'px';
}
function renderBackground(){
 const b=$('#classicMapBackground');if(!b)return;const own=highResUrl||state.background;
 const img=own||(originalMapReady?activeMapUrl:null);
 b.style.backgroundImage=img?'url('+JSON.stringify(img)+')':'linear-gradient(#1b10233d,#1b1126c9),url(./art/'+w.art+')';
 b.classList.toggle('has-image',!!img);
 b.querySelector('span').hidden=true;b.querySelector('small').hidden=true;
 const viewport=$('#classicViewport');if(viewport)viewport.dataset.mapImage=highResUrl?'local-highres':state.background?'legacy-local':originalMapReady?'game-original':'original-art';
 if(viewport){if(own)viewportSourceMismatch(false);viewport.dataset.sourceImage=!own&&originalMapReady?activeMapUrl||'':'';viewport.dataset.sourceWidth=!own&&originalMapReady?String(originalMapSize?.width||0):'';viewport.dataset.sourceHeight=!own&&originalMapReady?String(originalMapSize?.height||0):'';}
 fitClassicImage();
 window.dispatchEvent(new CustomEvent('team-jura:classic-map-image-change',{detail:{game:id}}));
}
function viewportSourceMismatch(mismatch){
 const v=$('#classicViewport');if(v)v.dataset.personalImageMismatch=String(!!mismatch);
 const layer=$('#classicMarkerLayer');if(layer)layer.hidden=!!mismatch;
}
function loadOriginalWorldMap(){
 // Keep the game/era unchanged across every fallback; don't redirect fans to generic city artwork.
 const origins=mapOrigins[id],choices=[{url:w.map,...origins},...(mapAlternates[id]||[])];
 // Personal pins use image percentages, not world coordinates. Keep a stable
 // source across visits when personal pins exist; never silently prefer a
 // different higher-resolution image over the user's previous reference.
 const sourceKey='team-jura-classic-image-source-v1:'+id;
 let previousSource='';try{previousSource=localStorage.getItem(sourceKey)||''}catch{}
 // Older saved LCS markers without a source key were made on the former first-choice artwork.
 if(id==='lcs'&&state.markers.length&&!previousSource)previousSource='https://gtwfilesie.grandtheftwiki.com/LibertyCity-GTALCS-map.jpg';
 const previous=choices.findIndex(c=>c.url===previousSource);
 if(state.markers.length&&previous>0)choices.unshift(...choices.splice(previous,1));
 const credit=$('#classicMapAttribution'),source=$('#classicMapSourceLink');
 let index=0;
 function showSource(item){
  if(credit)credit.textContent='Map image: '+item.name+' · Rockstar / Take-Two retain game-art rights';
  if(source){source.href=item.page;source.textContent='Image provenance ↗';}
 }
 function next(){
  if(index>=choices.length){
   originalMapReady=false;originalMapSize=null;renderBackground();
   if(credit)credit.textContent='No map image source is currently reachable. Your personal data is unchanged.';
   if(source){source.href=origins.page;source.textContent='Open original source ↗';}
   if(!highResUrl&&!state.background)status('The map image sources could not be loaded. Use the original source link or your private image import; pins remain safe.');
   return;
  }
  const current=choices[index++],image=new Image();
  image.referrerPolicy='no-referrer';
  image.onload=()=>{
   if(!image.naturalWidth||!image.naturalHeight){next();return}
   originalMapReady=true;originalMapSize={width:image.naturalWidth,height:image.naturalHeight};
   activeMapUrl=current.url;
   if(!highResUrl&&!state.background){
    if(state.markers.length&&previousSource&&previousSource!==current.url){
     // Preserve old coordinates and origin, but flag the mismatching artwork.
     viewportSourceMismatch(true);
    }else{viewportSourceMismatch(false);try{localStorage.setItem(sourceKey,current.url)}catch{}}
   }
   showSource(current);
   if(!highResUrl&&!state.background){
    renderBackground();
    status(w.name+' game-map image ready · '+image.naturalWidth+' × '+image.naturalHeight+' px. '+(state.markers.length&&previousSource&&previousSource!==current.url?'Alternate artwork: review personal pin alignment. ':'')+'Personal notes are not calibrated coordinates.');
   }
  };
  image.onerror=next;
  image.src=current.url;
 }
 next();
}

function activateLocalMap(blob,width,height){
 if(highResUrl)URL.revokeObjectURL(highResUrl);
 highResUrl=URL.createObjectURL(blob);highResSize={width,height};scale=1;dx=0;dy=0;applyTransform();renderBackground();
}
function measureLegacyMap(){
 if(highResUrl||!state.background)return;
 const img=new Image();
 img.onload=()=>{if(!highResUrl){highResSize={width:img.naturalWidth,height:img.naturalHeight};fitClassicImage()}};
 img.onerror=()=>status('Earlier map image could not be decoded. You can remove it to restore the original art.');
 img.src=state.background;
}
async function restoreStoredMap(){
 measureLegacyMap();
 if(!window.TeamJuraLocalMap)return;
 try{
  const record=await window.TeamJuraLocalMap.restore(id);
  if(record){activateLocalMap(record.blob,record.width,record.height);status('High-resolution map restored locally · '+record.width+' × '+record.height+' px.')}
 }catch(error){status('Local image storage unavailable. Personal markers and earlier map remain intact.')}
}
function categoryList(){const list=$('#classicCategories');list.replaceChildren();for(const name of w.sets){const row=E('div','classic-category');const count=window.TeamJuraClassicCollections?.[id]?.[name];if(count){
 const open=E('button','',name+' · '+count.count+' items');open.type='button';open.setAttribute('aria-label','Open individual '+name+' checklist');open.addEventListener('click',()=>{const panel=$('#j98b-progress');if(panel){panel.scrollIntoView?.({behavior:'smooth',block:'start'});const choice=$('#j98bSet');if(choice){choice.value=name;choice.dispatchEvent(new Event('change'))}}});row.append(open);const legacy=state.completed.includes(name)?' · prior whole-set flag preserved':'';row.append(E('small','',String(state.markers.filter(m=>m.category===name).length)+' personal notes'+legacy));
 }else{const label=E('label');const check=E('input');check.type='checkbox';check.checked=state.completed.includes(name);check.addEventListener('change',()=>{state.completed=check.checked?[...new Set([...state.completed,name])]:state.completed.filter(x=>x!==name);persist();status(name+(check.checked?' marked complete.':' marked in progress.'))});label.append(check,' '+name);row.append(label,E('small','',String(state.markers.filter(m=>m.category===name).length)+' personal notes'));}list.append(row)}}
function renderMarkers(){const layer=$('#classicMarkerLayer'),list=$('#classicPinList');layer.replaceChildren();list.replaceChildren();const query=($('#classicSearch')?.value||'').toLowerCase();let n=0;
 let completed={};try{const record=JSON.parse(localStorage.getItem('team-jura-atlas98b-items-'+id+'-v1')||'null');if(record?.game===id&&record.done&&typeof record.done==='object')completed=record.done}catch{}
 const iconFor=category=>/package/i.test(category)?'📦':/balloon/i.test(category)?'🎈':/seagull/i.test(category)?'🕊️':/rampage/i.test(category)?'🔥':/stunt|jump/i.test(category)?'🏁':/camera/i.test(category)?'📷':/property|safehouse/i.test(category)?'🏠':'✦';
 for(const m of state.markers){if(query&&!(`${m.name} ${m.category} ${m.note||''}`.toLowerCase().includes(query)))continue;n++;
 const linked=Number.isInteger(m.collectionSlot)&&window.TeamJuraClassicCollections?.[id]?.[m.collectionSet]?.count>=m.collectionSlot&&m.collectionSlot>0;
 const complete=linked&&Array.isArray(completed[m.collectionSet])&&completed[m.collectionSet].includes(m.collectionSlot);
 const pin=E('button','classic-marker',iconFor(m.category));pin.dataset.slotDone=String(!!complete);pin.type='button';pin.style.left=m.x+'%';pin.style.top=m.y+'%';pin.title=m.name+' — '+m.category+(linked?' · slot #'+m.collectionSlot+(complete?' · collected':' · not yet collected'):' · personal note');pin.setAttribute('aria-label','Open marker '+pin.title);pin.setAttribute('aria-current',String(editing===m.id));pin.addEventListener('click',e=>{e.stopPropagation();openEditor(m.id)});layer.append(pin);
 const row=E('div','classic-pin-row');row.append(E('strong','',m.name));const edit=E('button','','Edit');edit.type='button';edit.addEventListener('click',()=>openEditor(m.id));row.append(edit,E('small','',m.category+(linked?' · #'+m.collectionSlot+(complete?' · ✓ collected':' · to collect'):'')+' · '+(m.note||'Personal image-relative location')));list.append(row)
 }
 if($('#pinCount'))$('#pinCount').textContent=String(state.markers.length);if(n===0)list.append(E('p','panel-note',query?'No notes match your search.':'No personal markers yet. Add one on the map.'));
 }
 function draw(){categoryList();renderMarkers();renderBackground()}
function openEditor(pinId,position){editing=pinId;const m=state.markers.find(x=>x.id===pinId);const edit=$('#classicEditor');edit.hidden=false;const link=pendingSlot||(m?.collectionSet&&m?.collectionSlot?{set:m.collectionSet,slot:m.collectionSlot}:null);
 $('#markerName').value=m?.name||(link?link.set+' #'+link.slot:'');$('#markerCategory').replaceChildren(...w.sets.map(x=>{const opt=E('option','',x);opt.value=x;return opt}));$('#markerCategory').value=link?.set||m?.category||w.sets[0];$('#markerCategory').disabled=!!link;$('#markerNote').value=m?.note||'';edit.dataset.x=String(position?.x??m?.x??50);edit.dataset.y=String(position?.y??m?.y??50);let deleteBtn=edit.querySelector('#markerDelete');if(deleteBtn)deleteBtn.remove();if(m){deleteBtn=E('button','','Delete marker');deleteBtn.id='markerDelete';deleteBtn.type='button';deleteBtn.addEventListener('click',()=>{if(!window.confirm('Remove this personal marker?'))return;state.markers=state.markers.filter(x=>x.id!==m.id);persist();closeEditor();draw();status('Marker removed.')});edit.querySelector('.classic-editor-buttons').append(deleteBtn)}$('#markerName').focus();renderMarkers()}
function closeEditor(){$('#classicEditor').hidden=true;editing=null;adding=false;pendingSlot=null;$('#markerCategory').disabled=false;$('#classicAddPin').setAttribute('aria-pressed','false');$('#classicViewport').classList.remove('adding');renderMarkers()}
function createOrEdit(){const name=$('#markerName').value.trim(),category=$('#markerCategory').value,note=$('#markerNote').value.trim();if(!name){status('Enter a marker title before saving.');$('#markerName').focus();return}const x=clamp(Number($('#classicEditor').dataset.x),0,100),y=clamp(Number($('#classicEditor').dataset.y),0,100);if(!Number.isFinite(x)||!Number.isFinite(y)){status('Invalid marker position.');return}
 const old=state.markers.find(x=>x.id===editing);
 const link=pendingSlot||(old?.collectionSet&&old?.collectionSlot?{set:old.collectionSet,slot:old.collectionSlot}:null);
 if(old)Object.assign(old,{name:name.slice(0,100),category,note:note.slice(0,300)});
 else state.markers.push({id:globalThis.crypto?.randomUUID?.()||'p'+Date.now()+Math.random().toString(36).slice(2),name:name.slice(0,100),category,note:note.slice(0,300),x,y,source:'personal-image-percent',...(link?{collectionSet:link.set,collectionSlot:link.slot}:{})});
 if(state.markers.length>1000){state.markers.pop();status('Limit reached (1000 markers per world).');return}persist();closeEditor();draw();status('Saved personal marker to this browser.')}
function coords(e){const s=$('#classicMapSurface').getBoundingClientRect();if(!s.width||!s.height||e.clientX<s.left||e.clientX>s.right||e.clientY<s.top||e.clientY>s.bottom)return null;return {x:clamp((e.clientX-s.left)/s.width*100,0,100),y:clamp((e.clientY-s.top)/s.height*100,0,100)}}
function bindMap(){const viewport=$('#classicViewport');
 // Atlas 15.7: multitouch mobile controls and zoom-at-anchor, preserving all world data.
 const pointers=new Map();
 let pan=null,pinch=null;
 const controls=document.querySelector('.classic-controls');
 let indicator=$('#classicZoomLevel');
 if(controls&&!indicator){indicator=document.createElement('output');indicator.id='classicZoomLevel';indicator.className='classic-zoom-level';indicator.setAttribute('aria-label','Map zoom');controls.append(indicator)}
 function setZoom(next,clientX,clientY){
   const zoom=clamp(next,1,6);
   if(Math.abs(zoom-scale)<.001){status(zoom>=6?'Maximum map zoom reached. Use − or Fit to zoom out.':'Minimum map zoom reached. Use + to zoom in.');return false}
   const rect=viewport.getBoundingClientRect();
   const anchorX=Number.isFinite(clientX)?clientX-rect.left-rect.width/2:0;
   const anchorY=Number.isFinite(clientY)?clientY-rect.top-rect.height/2:0;
   const factor=zoom/scale;
   dx=clamp(dx+(anchorX-dx)*(1-factor),-rect.width*zoom/1.8,rect.width*zoom/1.8);
   dy=clamp(dy+(anchorY-dy)*(1-factor),-rect.height*zoom/1.8,rect.height*zoom/1.8);
   scale=zoom;applyTransform();return true;
 }
 function spacing(){const a=[...pointers.values()];if(a.length<2)return null;return{distance:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2}}
 viewport.addEventListener('pointerdown',e=>{
   if(e.target.closest('button,input,a,[role="button"]'))return;
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   dragged=false;viewport.setPointerCapture?.(e.pointerId);
   if(pointers.size===1){pan={id:e.pointerId,x:e.clientX,y:e.clientY,dx,dy};pinch=null}
   if(pointers.size===2){const start=spacing();pinch={distance:Math.max(start.distance,1),zoom:scale};pan=null;dragged=true}
 });
 viewport.addEventListener('pointermove',e=>{
   if(!pointers.has(e.pointerId))return;
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size>=2&&pinch){const span=spacing();if(span&&span.distance>2){setZoom(pinch.zoom*span.distance/pinch.distance,span.x,span.y);dragged=true}return}
   if(!pan||pan.id!==e.pointerId||adding)return;
   const mx=e.clientX-pan.x,my=e.clientY-pan.y;
   if(Math.abs(mx)+Math.abs(my)>5)dragged=true;
   dx=clamp(pan.dx+mx,-viewport.clientWidth*scale/1.8,viewport.clientWidth*scale/1.8);
   dy=clamp(pan.dy+my,-viewport.clientHeight*scale/1.8,viewport.clientHeight*scale/1.8);
   applyTransform();
 });
 function endPointer(e){
   if(!pointers.has(e.pointerId))return;
   const only=pointers.size===1;
   pointers.delete(e.pointerId);
   if(only&&adding&&!dragged&&!e.target.closest('button,input,a,[role="button"]')){
     const point=coords(e);if(point){adding=false;openEditor(null,point)}
   }
   if(pointers.size===1){const [id,p]=pointers.entries().next().value;pan={id,x:p.x,y:p.y,dx,dy};pinch=null;dragged=true}
   else if(pointers.size===0){pan=null;pinch=null;dragged=false}
 }
 viewport.addEventListener('pointerup',endPointer);
 viewport.addEventListener('pointercancel',endPointer);
 viewport.addEventListener('lostpointercapture',endPointer);
 viewport.addEventListener('wheel',e=>{e.preventDefault();setZoom(scale*(e.deltaY<0?1.22:1/1.22),e.clientX,e.clientY)},{passive:false});
 viewport.addEventListener('dblclick',e=>{if(adding||e.target.closest('button,a'))return;e.preventDefault();setZoom(scale*1.4,e.clientX,e.clientY)});
 viewport.addEventListener('keydown',e=>{
   if(e.key==='+'||e.key==='='){e.preventDefault();setZoom(scale*1.3)}
   else if(e.key==='-'){e.preventDefault();setZoom(scale/1.3)}
   else if(e.key==='0'){e.preventDefault();scale=1;dx=0;dy=0;applyTransform()}
 });
 $('#classicZoomIn').addEventListener('click',()=>setZoom(scale*1.3));
 $('#classicZoomOut').addEventListener('click',()=>setZoom(scale/1.3));
 $('#classicReset').addEventListener('click',()=>{scale=1;dx=0;dy=0;applyTransform();status('Map fitted to viewport.')});
 applyTransform();
 $('#classicAddPin').addEventListener('click',()=>{pendingSlot=null;adding=!adding;$('#classicAddPin').setAttribute('aria-pressed',String(adding));viewport.classList.toggle('adding',adding);status(adding?'Tap the map to place a personal marker.':'Marker placement canceled.')});
 $('#classicSearch').addEventListener('input',renderMarkers);$('#markerSave').addEventListener('click',createOrEdit);$('#markerCancel').addEventListener('click',closeEditor);
 
 $('#classicImageFile').addEventListener('change',async e=>{
  const file=e.target.files?.[0];e.target.value='';if(!file)return;
  if(!window.TeamJuraLocalMap){status('Offline image storage is unavailable; your markers are unchanged.');return}
  try{
   status('Checking your local map image…');
   const dims=await window.TeamJuraLocalMap.inspect(file);
   await window.TeamJuraLocalMap.save(id,file,dims);
   state.background=null;persist();activateLocalMap(file,dims.width,dims.height);
   status('Local map saved privately · '+dims.width+' × '+dims.height+' px. Marker positions have not been changed. Keep your original image for backups.');
  }catch(error){status('Map unchanged: '+(error?.message||'Image storage failed')+'. Personal markers are safe.')}
 });
 $('#classicClearMap').addEventListener('click',async ()=>{
  if(!window.confirm('Remove your personal map image from this browser? Your markers will remain, but they may no longer align with the new background.'))return;
  try{
   await window.TeamJuraLocalMap?.remove(id);state.background=null;
   if(highResUrl)URL.revokeObjectURL(highResUrl);
   highResUrl=null;highResSize=null;scale=1;dx=0;dy=0;persist();applyTransform();renderBackground();
   status('Personal map image removed. Markers and collection progress remain saved.');
  }catch(error){status('Could not remove local map: '+String(error?.message||error))}
 });
 $('#classicExport').addEventListener('click',()=>{const copy={...state,exportedAt:new Date().toISOString()};const blob=new Blob([JSON.stringify(copy,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=E('a');a.href=url;a.download='team-jura-'+id+'-my-map.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);status(highResUrl?'Markers and progress exported. Your high-resolution map image is stored separately; keep the original PNG/JPEG/WebP file.':'World markers, checked categories and earlier embedded image exported.')});
 $('#classicImport').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>2500000){status('Import too large; maximum 2.5 MB.');return}const rd=new FileReader();rd.onload=()=>{try{const obj=JSON.parse(rd.result);if(obj.schema!=='team-jura-atlas98-classic-v1'||obj.world!==id||!Array.isArray(obj.markers)||obj.markers.length>1000)throw Error('Invalid world schema');const clean=[];for(const m of obj.markers){if(typeof m.name!=='string'||!Number.isFinite(m.x)||!Number.isFinite(m.y)||m.x<0||m.x>100||m.y<0||m.y>100)throw Error('Invalid marker');const validLink=window.TeamJuraClassicCollections?.[id]?.[m.collectionSet]?.count>=m.collectionSlot&&Number.isInteger(m.collectionSlot)&&m.collectionSlot>0&&m.collectionSet===m.category;
 clean.push({id:String(m.id).slice(0,80),name:m.name.slice(0,100),category:w.sets.includes(m.category)?m.category:w.sets[0],note:String(m.note||'').slice(0,300),x:m.x,y:m.y,source:'personal-image-percent',...(validLink?{collectionSet:m.collectionSet,collectionSlot:m.collectionSlot}:{})})}state={schema:'team-jura-atlas98-classic-v1',world:id,markers:clean,completed:Array.isArray(obj.completed)?obj.completed.filter(x=>w.sets.includes(x)):[],background:(typeof obj.background==='string'&&(/^data:image\/(png|jpeg|webp);base64,/.test(obj.background))&&obj.background.length<1700000)?obj.background:null};persist();closeEditor();draw();status('World-specific personal data restored.')}catch(err){status('Import refused: invalid file or different GTA world.')}};rd.onerror=()=>status('Could not read JSON.');rd.readAsText(f)});
 $('#classicClear').addEventListener('click',()=>{if(!window.confirm('Delete your personal markers for '+w.name+'? Export first if needed.'))return;state.markers=[];persist();closeEditor();draw();status('Personal markers cleared. Collection checkboxes and map illustration preserved.')});
}
function init(){
 window.addEventListener('team-jura:classic-checklist-change',e=>{if(e.detail?.game===id)renderMarkers()});
 window.addEventListener('team-jura:classic-place-slot',e=>{
  const requested=e.detail;if(requested?.game!==id)return;
  const set=requested.set,slot=requested.slot,count=window.TeamJuraClassicCollections?.[id]?.[set]?.count;
  if(!Number.isInteger(slot)||slot<1||slot>count||!w.sets.includes(set))return;
  const same=state.markers.find(m=>m.collectionSet===set&&m.collectionSlot===slot);
  pendingSlot={set,slot};adding=!same;
  $('#classicAddPin').setAttribute('aria-pressed',String(adding));
  $('#classicViewport').classList.toggle('adding',adding);
  if(same){openEditor(same.id);status(set+' #'+slot+' already has your map note. Edit it or cancel.');}
  else status('Place '+set+' #'+slot+': tap its location on the visible '+w.name+' map. This is your image-relative pin, not verified game coordinates.');
  $('#classicViewport').scrollIntoView({behavior:'smooth',block:'center'});
 });
 flatReference();$('#classicRetryMap')?.addEventListener('click',()=>{status('Trying the original game-map sources again…');loadOriginalWorldMap()});document.title=w.name+' | Team Jura Atlas';$('#classicTitle').textContent=w.name;$('#classicDescription').textContent=w.desc;$('#breadWorld').textContent=w.name;const classicWorldArt=$('#classicWorldArt');const premiumClassicArt='./art/jura157-'+id+'-cinematic.webp';classicWorldArt.src=premiumClassicArt;classicWorldArt.alt='Original cinematic Elario Studios fan concept for '+w.name+'; not an in-game map or screenshot';classicWorldArt.onerror=()=>{classicWorldArt.onerror=null;classicWorldArt.src='./art/'+w.art;};$('#mapWorkspaceTitle').textContent=w.name+' · personal map';bindMap();draw();status('Loading original '+w.name+' game map…');loadOriginalWorldMap();restoreStoredMap();window.addEventListener('resize',fitClassicImage);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
