/* Team Jura Atlas 9.5 · Designed Brand research consolidation.
   Uses existing GTADB.org-licensed records and existing map/3D engines.
   No GTA VI community coordinate is represented as gameplay verified. */
(()=>{'use strict';
const page=(location.pathname.split('/').pop()||'').toLowerCase();
const $=id=>document.getElementById(id);
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
const sourceColors={trailer:'#ffbd71',screenshot:'#91dbef',community:'#91d7b1',leak:'#bd9de3',other:'#edbe82'};
function setupVi(){
 const aside=$('sidebar');if(!aside)return;
 document.body.classList.add('j95-vi');
 const section=make('section','j95-vi-evidence');section.setAttribute('aria-label','Leonida community map provenance');
 const top=make('div','j95-eyebrow','ELARIO STUDIOS / TEAM JURA ATLAS');
 const label=make('strong','','LEONIDA · UNVERIFIED COMMUNITY RESEARCH');
 const desc=make('p','', 'Map pins represent licensed source/community research, not independently confirmed GTA VI gameplay. Map views do not certify coordinate accuracy.');
 const link=make('a','j95-brand-link','◈ Research desk · source filters, pins and tracking');link.href='./atlas-research.html';
 const status=make('small','j95-dataset-health','Checking mapped community records…');status.setAttribute('role','status');
 section.append(top,label,desc,link,status);
 const anchor=aside.querySelector('.named-layer-section')||$('atlasFilterDrawer');
 if(anchor)anchor.insertAdjacentElement('beforebegin',section);else aside.prepend(section);
 const nativeStatus=$('dataStatus');
 const update=()=>{
  const raw=nativeStatus?.textContent?.trim()||'';
  status.textContent=raw?raw.slice(0,220)+' · all VI source positions provisional':'Source availability has not been confirmed.';
 };
 if(nativeStatus){new MutationObserver(update).observe(nativeStatus,{childList:true,subtree:true,characterData:true});update()}
 // Make the left-side mapping source clear without changing native toggles.
 const names=aside.querySelector('.named-layer-section .named-layer-head strong');
 if(names)names.title='One canonical left-hand layer control. No duplicate floating panel.';
 const layer=$('layer');if(layer){layer.setAttribute('aria-label','Licensed map artwork style, not location verification');}
}
function setupResearch(){
 const api=window.TeamJuraResearch95,rail=$('rail'),mapArea=$('maparea');
 if(!rail||!mapArea||!api)return;
 document.body.classList.add('j95-research');
 const eyebrow=make('div','j95-eyebrow','ELARIO STUDIOS · TEAM JURA · ATLAS 9.5');
 const identity=make('section','j95-identity');identity.append(eyebrow,make('h2','','LEONIDA RESEARCH INTELLIGENCE'));
 identity.append(make('p','','Every GTA VI pin is UNVERIFIED community research until checked against released gameplay.'));
 const crew=make('div','j95-crew');for(const [name,src] of [['Scaly','./art/atlas86-scaly-approved.webp'],['Loki','./art/atlas86-loki-approved.webp']]){
  const img=make('img');img.src=src;img.alt='Team Jura approved '+name+' artwork';img.loading='lazy';img.decoding='async';img.onerror=()=>{img.hidden=true};crew.append(img);
 }identity.append(crew);
 const originalHead=rail.querySelector('.eyebrow');if(originalHead)originalHead.insertAdjacentElement('beforebegin',identity);else rail.prepend(identity);
 const banner=make('div','j95-map-confidence','UNVERIFIED COMMUNITY MAP · NOT ROCKSTAR COORDINATES');banner.setAttribute('role','note');mapArea.append(banner);
 const status=make('section','j95-status');status.setAttribute('aria-label','Research map data coverage');
 const count=make('div','j95-stats','Loading research pins…');count.setAttribute('role','status');
 const source=make('small','','Source: GTADB.org CC BY 4.0 snapshot where available. GTADB.net is a separate site and its marker totals are not this feed.');
 status.append(count,source);
 const deck=rail.querySelector('.j94-view-deck');const reference=rail.querySelector('.j94-progress');
 if(deck)deck.insertAdjacentElement('afterend',status);else rail.querySelector('.toolbar')?.insertAdjacentElement('afterend',status);
 const position=make('label','j95-position-choice','Coordinate availability');
 const positionSelect=make('select');positionSelect.setAttribute('aria-label','Filter by coordinate availability');
 for(const [value,name] of [['all','All records'],['mapped','Mapped pins only'],['unmapped','Search-only (no coordinates)']])positionSelect.add(new Option(name,value));
 positionSelect.onchange=()=>api.setPositionMode(positionSelect.value);
 position.append(positionSelect);
 status.append(position);
 const describe=make('p','j95-muted','Locations shown on the map can be selected, favorited, visited and added to straight-line research routes. Search-only entries never receive guessed pin positions.');status.append(describe);
 const badgeMap=$('placeSource');if(badgeMap)badgeMap.setAttribute('aria-label','Source evidence and verification status');
 const details=$('place');const viLink=make('a','j95-vi-place-link','↗ Locate this pin in GTA VI Atlas');viLink.target='_self';viLink.hidden=true;
 details?.querySelector('.actions')?.insertAdjacentElement('afterend',viLink);
 const syncSelected=()=>{const r=api.selected();viLink.hidden=!(r&&r.positioned&&/^L\d+$/.test(r.id));if(!viLink.hidden)viLink.href='./atlas-vi.html?place=gtadb-6-'+encodeURIComponent(r.id)+'#game6';};
 if($('placeName'))new MutationObserver(syncSelected).observe($('placeName'),{childList:true,subtree:true,characterData:true});
 const title=$('dataInfo');
 const updateStats=()=>{
  const s=api.stats();count.textContent=s.all.toLocaleString()+' community records · '+s.mapped.toLocaleString()+' pins · '+s.searchOnly.toLocaleString()+' search-only · '+s.filtered.toLocaleString()+' matching';
  syncSelected();
 };
 if(title)new MutationObserver(updateStats).observe(title,{childList:true,characterData:true,subtree:true});
 ['q','tag','region','hideVisited','favoritesOnly','sort','allOn','allOff','reset','reload','more'].forEach(id=>$(id)?.addEventListener('input',updateStats));
 document.addEventListener('jura95:research-refresh',updateStats);updateStats();
 const nextButton=reference?.querySelector('.j94-progress-actions button');
 const nextStatus=reference?.querySelector('p[role="status"]');
 if(nextButton){nextButton.onclick=()=>{const row=api.nextUnvisited();if(nextStatus)nextStatus.textContent=row?'Selected '+row.name+' · UNVERIFIED community research':'No unvisited records match the current filters.';};}
 const progressStatus=reference?.querySelector('p[role="status"]');
 if(progressStatus)new MutationObserver(()=>{if(progressStatus.textContent.includes('Backup merged. Refresh')){api.reloadProgress();updateStats();progressStatus.textContent='Imported progress is now reflected in research filters and pins.';}}).observe(progressStatus,{childList:true,characterData:true,subtree:true});
 // Use the existing public WebGL terrain engine in this page, not a fake CSS 3D simulation.
 const canvas=make('canvas','j95-terrain');canvas.id='j95Terrain';canvas.hidden=true;canvas.setAttribute('aria-label','Interactive GTA VI community map perspective. Drag to orbit; shift-drag to pan; wheel to zoom.');
 const overlay=make('div','j95-terrain-overlays');overlay.id='j95TerrainPins';overlay.hidden=true;
 const dimension=make('span','j95-terrain-status','2D illustrated research map');dimension.id='j95Dimension';dimension.setAttribute('role','status');dimension.setAttribute('aria-live','polite');
 const control=make('div','j95-terrain-controls');control.setAttribute('aria-label','Research map perspective controls');
 const north=make('button','','N ↑'),zoomIn=make('button','','+'),zoomOut=make('button','','−');
 for(const b of [north,zoomIn,zoomOut])b.type='button';north.title='Reset 3D bearing';zoomIn.title='Zoom in 3D';zoomOut.title='Zoom out 3D';
 control.append(north,zoomIn,zoomOut,dimension);
 mapArea.append(canvas,overlay,control);
 const bridge={game:()=> '6',camera:()=>api.camera(),places:()=>api.visible().filter(r=>r.positioned).map(r=>({...r,markerColor:sourceColors[r.family]||sourceColors.other})),
  route:()=>api.route(),symbol:()=> '◆',color:(_,r)=>sourceColors[r.family]||sourceColors.other,
  select:r=>{api.selectId(r.id);syncSelected()},textureDraw:(out,b)=>api.textureDraw(out,b)};
 const terrain=window.JuraTerrain3D?.create({canvas,overlay,status:dimension,bridge});
 const oldDeck=deck?.querySelector('.j94-view-actions');const two=oldDeck?.querySelector('button');const link=oldDeck?.querySelector('a');
 const three=make('button','j95-3d-toggle','▨ 3D perspective');three.type='button';three.setAttribute('aria-pressed','false');
 if(link){link.replaceWith(three);const note=make('a','j95-explorer-link','↗ Open full GTA VI explorer');note.href='./atlas-vi.html#game6';deck.append(note)}else oldDeck?.append(three);
 const outdated=deck?.querySelectorAll('.j94-sub');if(outdated?.length>1)outdated[outdated.length-1].textContent='3D uses Team Jura WebGL. Terrain remains flat unless a correctly licensed local heightfield is available; map artwork may require cross-origin tile permissions.';
 if(two){two.disabled=false;two.onclick=()=>switchDimension('2d')};
 const instruction=make('p','j95-terrain-help','3D: drag to rotate, Shift+drag to pan, scroll to zoom. Without a compatible heightfield, the perspective is flat—not a verified terrain model.');
 deck?.append(instruction);
 const upload=make('label','j95-heightfield-import','Optional licensed elevation file (.bin)');const file=make('input');file.type='file';file.accept='.bin,application/octet-stream';file.setAttribute('aria-label','Import user-supplied GTA VI elevation heightfield');upload.append(file);deck?.append(upload);
 let active=false,renderPending=false;
 function switchDimension(next){
  if(next==='2d'){
   if(active)terrain?.deactivate();active=false;document.body.classList.remove('j95-3d-on');
   three.setAttribute('aria-pressed','false');if(two)two.setAttribute('aria-current','true');
   dimension.textContent='2D illustrated research map';return;
  }
  if(!terrain){dimension.textContent='3D unavailable: WebGL engine failed to load. 2D remains active.';return}
  const success=terrain.activate();if(!success){dimension.textContent='WebGL not available on this device; 2D remains active.';return}
  active=true;document.body.classList.add('j95-3d-on');three.setAttribute('aria-pressed','true');if(two)two.removeAttribute('aria-current');
  dimension.textContent='3D perspective loading. Elevation not verified; original 2D remains available.';
 }
 three.onclick=()=>switchDimension(active?'2d':'3d');
 north.onclick=()=>{if(active)terrain?.resetNorth()};zoomIn.onclick=()=>{if(active)terrain?.zoom(.8)};zoomOut.onclick=()=>{if(active)terrain?.zoom(1.25)};
 file.onchange=async()=>{const f=file.files?.[0];if(!f)return;try{
    if(!terrain)throw Error('WebGL unavailable');if(f.size>8_000_000)throw Error('File exceeds 8 MB');
    await terrain.setElevationBinary(await f.arrayBuffer(),'6');
    if(!active)switchDimension('3d');dimension.textContent='User-supplied heightfield loaded · community reconstruction, NOT game-verified';
   }catch(e){dimension.textContent='Elevation import rejected: '+e.message}finally{file.value=''}
 };
 document.addEventListener('jura95:research-tile',()=>{if(!active||renderPending)return;renderPending=true;requestAnimationFrame(()=>{renderPending=false;if(active)terrain?.render()})});
 document.addEventListener('jura95:research-refresh',()=>{if(active)terrain?.render()});
 window.addEventListener('resize',()=>{if(active)terrain?.render()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active&&document.activeElement?.tagName!=='INPUT')switchDimension('2d')});
}
function init(){if(page==='atlas-vi.html')setupVi();if(page==='atlas-research.html')setupResearch()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
