/* Team Jura Atlas 6.0 — original GTADB-inspired multi-stop navigation interface.
 * Does not use Google Maps, GTADB proprietary routes, or unlicensed artwork.
 * GTA road directions are never claimed without a validated licensed graph. */
(function(root){'use strict';
const $=id=>document.getElementById(id),esc=s=>String(s||'').replace(/[&<>"']/g,v=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]));
function create(bridge){const Core=root.JuraRoadCore;if(!Core)throw Error('atlas-road-core.js missing');
let active=false,waypoints=[null,null],graph=null,plan=null,ordering='manual',dimension='2d',terrain=null,fields=[],resultItems=[],fallback3d=false,localElevation=null,terrainViewToken=0,densePending=false,approxPending=false;
const panel=$('juraNavPanel'),container=$('juraNavFields'),results=$('juraNavResults'),mapCanvas=$('jura3dCanvas'),routeStatus=$('juraNavStatus');
function status(s){routeStatus.textContent=s;bridge.notice(s)}
function all(){return bridge.records()}
function invalidate(){plan=null;bridge.clearRoutePlan()}
function find(s){const q=s.trim().toLowerCase();if(!q)return[];const items=all();let found=items.filter(v=>v.name.toLowerCase()===q||v.id.toLowerCase()===q);if(found.length)return found.slice(0,10);return items.filter(v=>(v.name+' '+(v.address||'')+' '+(v.category||'')+' '+v.id).toLowerCase().includes(q)).slice(0,10)}
function popup(row,index){const matches=find(row.input.value);row.suggest.replaceChildren();for(const place of matches){const b=document.createElement('button');b.type='button';b.className='jura-place-suggest';const n=document.createElement('strong');n.textContent=place.name;const small=document.createElement('small');small.textContent=(place.address?'Reference: '+place.address+' · ':'')+'X '+Math.round(place.x)+' Y '+Math.round(place.y);b.append(n,small);b.addEventListener('pointerdown',e=>e.preventDefault());b.onclick=()=>{waypoints[index]=place;row.input.value=place.name;row.suggest.replaceChildren();invalidate();render(false);};row.suggest.append(b)}
 if(!matches.length&&row.input.value.trim()){const p=document.createElement('p');p.textContent='No matching landmark. Try another name or import licensed data.';row.suggest.append(p)}
}
function resolve(index){const row=fields[index],q=row?.input.value.trim()||'';if(!q)return false;if(waypoints[index]?.name===q)return true;const match=find(q)[0];if(match){waypoints[index]=match;row.input.value=match.name;row.suggest.replaceChildren();return true}return false}
function renderFields(){container.replaceChildren();fields=[];waypoints.forEach((value,i)=>{const box=document.createElement('div');box.className='jura-nav-stop';const number=document.createElement('span');number.className='jura-stop-bubble';number.textContent=i===0?'A':String(i);const input=document.createElement('input');input.type='search';input.value=value?.name||'';input.placeholder=i===0?'Choose start location':i===waypoints.length-1?'Choose destination':'Add intermediate location';input.setAttribute('aria-label',i===0?'Starting location':`Stop ${i}`);input.autocomplete='off';const suggestions=document.createElement('div');suggestions.className='jura-suggestions';const remove=document.createElement('button');remove.type='button';remove.className='jura-remove-stop';remove.title='Remove stop';remove.setAttribute('aria-label','Remove stop '+i);remove.textContent='×';remove.disabled=waypoints.length<=2;remove.onclick=()=>{waypoints.splice(i,1);invalidate();render()};input.oninput=()=>{waypoints[i]=null;invalidate();popup({input,suggest:suggestions},i)};input.onfocus=()=>{if(input.value)popup({input,suggest:suggestions},i)};input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();resolve(i);render()}if(e.key==='Escape')suggestions.replaceChildren()};input.onblur=()=>setTimeout(()=>suggestions.replaceChildren(),170);const up=document.createElement('button');up.type='button';up.className='jura-move-stop';up.textContent='↑';up.title='Move stop up';up.setAttribute('aria-label','Move stop '+(i+1)+' up');up.disabled=i===0;up.onclick=()=>{[waypoints[i-1],waypoints[i]]=[waypoints[i],waypoints[i-1]];invalidate();render()};const down=document.createElement('button');down.type='button';down.className='jura-move-stop';down.textContent='↓';down.title='Move stop down';down.setAttribute('aria-label','Move stop '+(i+1)+' down');down.disabled=i===waypoints.length-1;down.onclick=()=>{[waypoints[i],waypoints[i+1]]=[waypoints[i+1],waypoints[i]];invalidate();render()};box.append(number,input,up,down,remove,suggestions);container.append(box);fields.push({input,suggest:suggestions})})}
function renderInstructions(){results.replaceChildren();if(!plan){const p=document.createElement('p');p.className='jura-route-notice';p.textContent='Choose named landmarks and press Generate route. Routes do not automatically imply road access.';results.append(p);return}
 const summary=document.createElement('div');summary.className='jura-summary';summary.innerHTML=`<strong>${plan.waypoints.length-1} segment${plan.waypoints.length>2?'s':''} · ${Math.round(plan.length).toLocaleString()} GTA world units</strong><small>${esc(plan.roadGraphUsed?'Imported road graph · UNVERIFIED':'Direct-line preview — not drivable road directions')}</small>`;results.append(summary);
 for(const segment of Core.instructions(plan,waypoints)){const p=document.createElement('div');p.className='jura-route-step';const b=document.createElement('b');b.textContent=segment.step+'.';const t=document.createElement('span');t.textContent=segment.label+' · '+Math.round(segment.length)+' units';p.append(b,t);results.append(p)}
 const warn=document.createElement('p');warn.className='jura-route-warning';warn.textContent=plan.warning;results.append(warn)}
function render(fieldsToo=true){if(fieldsToo)renderFields();renderInstructions();$('juraNavAdd').disabled=waypoints.length>=12;const el=$('juraNavDimension');el.textContent=dimension==='3d'&&!fallback3d&&terrain?.hasApproximate()?'3D · Approx.':dimension.toUpperCase();$('juraToggle3d').textContent=dimension==='2d'?'3D':'2D';$('juraToggle3d').setAttribute('aria-pressed',String(dimension==='3d'));$('jura2d')?.setAttribute('aria-pressed',String(dimension==='2d'));$('jura3d')?.setAttribute('aria-pressed',String(dimension==='3d'));}
function setRoutePoint(place){if(!place)return;const i=waypoints.findIndex((p,j)=>j>0&&!p);if(i>=0)waypoints[i]=place;else if(waypoints.length<12)waypoints.splice(waypoints.length-1,0,place);else{status('Maximum 12 named stops');return}invalidate();open();render();}
function setStart(place){waypoints[0]=place;plan=null;open();render()}
function open(){active=true;panel.hidden=false;document.body.classList.add('jura-nav-open');$('juraOpenNav').setAttribute('aria-expanded','true');render();}
function close(){active=false;panel.hidden=true;document.body.classList.remove('jura-nav-open');$('juraOpenNav').setAttribute('aria-expanded','false')}
function makeRoute(){for(let i=0;i<waypoints.length;i++)if(!waypoints[i]&&!resolve(i)){status('Choose a matching location for stop '+(i+1)+'.');fields[i]?.input.focus();return}
 const points=ordering==='nearest'?nearestOrder(waypoints):waypoints;waypoints=points;
 try{plan=Core.route(waypoints,graph);bridge.setRoutePlan(plan,waypoints);bridge.fitPoints(waypoints);render();status(plan.drivingVerified?'Route follows the imported road graph (source quality must be verified).':'Multi-stop route preview ready. Straight lines are not driving directions.')}catch(e){status(e.message)}}
function nearestOrder(places){const rem=places.slice(1),out=[places[0]];while(rem.length){let best=0,d=Infinity;for(let i=0;i<rem.length;i++){let v=Core.distance(out.at(-1),rem[i]);if(v<d){best=i;d=v}}out.push(rem.splice(best,1)[0])}return out}
function supports3d(){return bridge.game()==='6'}
function syncDimensionControls(){
 const on=supports3d();
 for(const id of ['jura3d','jura2d','juraToggle3d','threeDReference']){
  const el=$(id);if(el){el.hidden=!on;el.setAttribute('aria-hidden',String(!on));}
 }
 document.body.classList.toggle('jura-2d-only',!on);
 if(!on&&dimension==='3d')setDimension('2d');
}
function syncTerrainNotice(){
 const note=$('j362TerrainNotice');
 if(note)note.hidden=!(dimension==='3d'&&fallback3d);
 const approximate=dimension==='3d'&&!fallback3d&&!!terrain?.hasApproximate();
 document.body.classList.toggle('j368-approximate',approximate);
 const use=$('j368UseApproximate');
 if(use){use.hidden=!!terrain?.hasElevation();use.disabled=densePending||approxPending||!!terrain?.hasElevation();}
 const toggle=$('j368CoverageToggle'),legend=$('j368CoverageLegend');
 const coverage=approximate&&!!terrain?.getCoverageVisible();
 if(toggle){toggle.hidden=!approximate;toggle.setAttribute('aria-pressed',String(coverage));toggle.textContent=coverage?'Coverage on':'Coverage off';}
 if(legend)legend.hidden=!coverage;
}
function setDimension(next){
 if(next==='3d'&&!supports3d()){bridge.notice('The original 2D map is the active view for this world. GTA VI research is the current 3D focus.');return}
 if(next==='3d'&&supports3d()&&!root.JuraApproxTerrain){location.assign('./atlas-vi.html?dimension=3d');return}
 if(next===dimension)return;
 const epoch=++terrainViewToken;
 if(next==='3d'){
  const target=bridge.game();
  close();
  document.getElementById('closeSelected')?.click();
  const hub=document.getElementById('j217-vi-hub');if(hub)hub.open=false;
  dimension='3d';densePending=true;approxPending=false;
  // Keep the illustrated map visible during this asynchronous same-origin
  // heightfield check. Never reveal a flat WebGL canvas as genuine relief.
  fallback3d=true;
  document.body.classList.add('jura-in-3d','jura-perspective-fallback');
  const message=$('j362TerrainStatus');
  if(message)message.textContent='Checking this Atlas build for compatible Leonida elevation data… Your map remains available.';
  $('jura3dStatus').textContent='Checking terrain data…';
  bridge.notice('Checking bundled Leonida heightfield before switching to real 3D terrain…');
  syncTerrainNotice();render(false);
  Promise.resolve(terrain?.prepareElevation(target)??false).then(ready=>{
   if(epoch!==terrainViewToken||dimension!=='3d'||bridge.game()!==target)return;
   densePending=false;
   // An explicit local import can supersede the same-origin request at any
   // point. Its validated grid takes priority even when the stale fetch
   // resolves false; never relabel a real running renderer as unavailable.
   const available=!!terrain?.hasElevation(target);
   const ok=available&&(!!terrain?.isActive()||!!terrain?.activate());
   fallback3d=!ok;
   document.body.classList.toggle('jura-perspective-fallback',fallback3d);
   $('jura3dStatus').textContent=ok?'3D terrain active · community reconstruction':available?'WebGL unavailable · illustrated map retained':'Perspective preview · no elevation data installed';
   if(message){
    message.textContent=available
     ?'A compatible elevation grid is loaded, but this device could not start WebGL. The illustrated 2D map is still available.'
     :'No elevation data installed yet. The illustrated map remains available. Add a compatible permitted heightfield under Directions → Experimental Leonida 3D terrain.';
   }
   bridge.notice(ok?'Reconstructed 3D terrain active. One finger orbits; two fingers pan and pinch to zoom.':'Illustrated 2D perspective preview · '+(available?'WebGL is unavailable.':'No elevation data installed.'));
   syncTerrainNotice();render(false);
   if(!available&&root.JuraApproxTerrain)void openApproximateTerrain();
  }).catch(()=>{
   if(epoch!==terrainViewToken||dimension!=='3d'||bridge.game()!==target)return;
   densePending=false;
   fallback3d=true;
   if(message)message.textContent='No elevation data installed yet. The illustrated 2D map is still available.';
   $('jura3dStatus').textContent='Perspective preview · terrain unavailable';
   bridge.notice('Terrain could not be loaded; illustrated map retained.');
   syncTerrainNotice();render(false);
   if(root.JuraApproxTerrain)void openApproximateTerrain();
  });
 }else{
  terrain?.deactivate();dimension='2d';fallback3d=false;densePending=false;approxPending=false;
  document.body.classList.remove('jura-in-3d','jura-perspective-fallback');
  bridge.notice('2D illustrated map active.');
  syncTerrainNotice();render(false);
 }
}

async function openApproximateTerrain(){
 if(dimension!=='3d'||bridge.game()!=='6'||!fallback3d||!terrain||!root.JuraApproxTerrain||densePending||approxPending||terrain.hasElevation())return;
 const epoch=++terrainViewToken,button=$('j368UseApproximate'),message=$('j362TerrainStatus');
 approxPending=true;syncTerrainNotice();
 if(message)message.textContent='Loading the local GTADB-derived approximate terrain…';
 try{
  const surface=await root.JuraApproxTerrain.load();
  if(epoch!==terrainViewToken||dimension!=='3d'||bridge.game()!=='6')return;
  // An accepted local/dense import always outranks this illustrative surface.
  const dense=terrain.hasElevation();
  if(!dense)terrain.setApproximateSurface(surface);
  const ok=terrain.isActive()||terrain.activate();
  fallback3d=!ok;
  document.body.classList.toggle('jura-perspective-fallback',fallback3d);
  if(!ok){terrain.clearApproximateSurface();if(message)message.textContent=(dense?'A dense heightfield':'Approximate terrain')+' loaded, but WebGL is unavailable. Your illustrated map remains usable.';}
  else if(dense){
   $('jura3dStatus').textContent='3D terrain active · local heightfield';
   bridge.notice('A compatible local heightfield finished loading; it takes priority over the approximate surface.');
  }else{
   $('jura3dStatus').textContent='Approximate terrain · GTADB community reconstruction';
   bridge.notice('Approximate 3D active · interpolated community terrain, not measured game elevations. Coverage shows distance to source observations.');
  }
  syncTerrainNotice();render(false);
 }catch(err){
  if(epoch!==terrainViewToken||dimension!=='3d')return;
  if(message)message.textContent='Approximate terrain is unavailable: '+String(err?.message||'could not load')+'. Your illustrated map remains usable.';
  syncTerrainNotice();render(false);
 }finally{if(epoch===terrainViewToken){approxPending=false;syncTerrainNotice();}}
}
function clear(){waypoints=[null,null];plan=null;bridge.clearRoutePlan();render();status('Navigation cleared. Saved collectible progress is unchanged.')}
function refresh(){if(terrain?.isActive())terrain.render()}
function gameChanged(){graph=null;waypoints=[null,null];plan=null;syncDimensionControls();render();if(dimension==='3d')terrain?.rebase();}
function init(){terrain=root.JuraTerrain3D?.create({canvas:mapCanvas,overlay:$('jura3dMarkerOverlay'),status:$('jura3dStatus'),bridge})||null;
 if($('j362ClosePreview'))$('j362ClosePreview').onclick=()=>setDimension('2d');
 if($('j368UseApproximate'))$('j368UseApproximate').onclick=openApproximateTerrain;
 if($('j368CoverageToggle'))$('j368CoverageToggle').onclick=()=>{if(terrain?.hasApproximate()){terrain.setCoverageVisible(!terrain.getCoverageVisible());syncTerrainNotice();}};
 if($('j362ImportTerrain'))$('j362ImportTerrain').onclick=()=>{
   open();
   const section=$('juraElevationFile')?.closest('details');
   if(section){
    section.open=true;
    section.scrollIntoView({block:'nearest',behavior:'auto'});
   }
 };
 syncTerrainNotice();
 if($('j363CheckHeight'))$('j363CheckHeight').onclick=async()=>{
  const button=$('j363CheckHeight'),note=$('j363HeightResult'),api=root.JuraElevationPointProbe;
  if(!api){note.textContent='The elevation inspector is unavailable. Try reloading this staging page.';return}
  if(button.disabled)return;
  const x=bridge.camera()?.x,y=bridge.camera()?.y,g=bridge.game();
  button.disabled=true;note.textContent='Checking one community ground-height sample…';
  const controller=typeof AbortController==='function'?new AbortController():null;
  const timer=controller?setTimeout(()=>controller.abort(),9000):null;
  try{
   const request=(url,opts)=>root.fetch(url,{...opts,...(controller?{signal:controller.signal}:{})});
   const reference=await api.check(g,x,y,request);
   let message='GTADB estimated ground height: '+reference.meters.toFixed(2)+' m at X '+reference.x+', Y '+reference.y+'.';
   const comparison=api.compare(localElevation,g,x,y,reference);
   if(comparison)message+=' Your imported local grid: '+comparison.localMeters.toFixed(2)+' m (difference '+comparison.differenceMeters.toFixed(2)+' m).';
   message+=' Community reconstruction, not independent or official game verification.';
   note.textContent=message;
  }catch(err){
   note.textContent='GTADB point lookup unavailable: '+(err?.name==='AbortError'?'timed out':err?.message||'network blocked')+
     '. No map data was changed. The source is experimental; try later or use a local permitted heightfield.';
  }finally{
   if(timer!==null)clearTimeout(timer);
   button.disabled=false;
  }
 };
 $('juraOpenNav').onclick=()=>active?close():open();$('juraCloseNav').onclick=close;$('juraNavAdd').onclick=()=>{if(waypoints.length>=12)return;waypoints.splice(waypoints.length-1,0,null);invalidate();render();fields.at(-2)?.input.focus()};$('juraNavReverse').onclick=()=>{waypoints.reverse();invalidate();render()};$('juraNavGo').onclick=makeRoute;$('juraNavClear').onclick=clear;$('juraNavOrder').onchange=e=>{ordering=e.target.value};$('juraToggle3d').onclick=()=>setDimension(dimension==='2d'?'3d':'2d');$('jura2d').onclick=()=>setDimension('2d');$('jura3d').onclick=()=>setDimension('3d');$('jura3dNorth').onclick=()=>terrain?.resetNorth();$('jura3dZoomIn').onclick=()=>terrain?.zoom(.8);$('jura3dZoomOut').onclick=()=>terrain?.zoom(1.25);
 $('juraNavExport').onclick=()=>{if(!plan){status('Generate a route first');return}const rows=waypoints.map((r,i)=>`${i===0?'Start':`Stop ${i}`}: ${r.name} (X ${r.x.toFixed(1)}, Y ${r.y.toFixed(1)})`).join('\n');const s='Team Jura Atlas · GTA '+bridge.game()+'\n'+rows+'\n\n'+plan.warning;if(navigator.clipboard?.writeText){navigator.clipboard.writeText(s).then(()=>status('Route summary copied.')).catch(()=>window.prompt('Copy route',s))}else window.prompt('Copy route',s)};
 if($('juraNavCsv'))$('juraNavCsv').onclick=()=>{if(!plan){status('Generate a route first');return}const quote=s=>'"'+String(s??'').replace(/"/g,'""')+'"';const csv=[['order','name','x','y','game','routing'].map(quote).join(','),...waypoints.map((r,i)=>[i,r.name,r.x,r.y,bridge.game(),plan.roadGraphUsed?'imported-road-graph-unverified':'direct-line'].map(quote).join(','))].join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='team-jura-route-'+bridge.game()+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);status('Route CSV exported with coordinate and routing labels.')};
 if($('juraElevationFile'))$('juraElevationFile').onchange=async e=>{
  const file=e.target.files?.[0];if(!file)return;
  const previous=localElevation; // invalid replacement never destroys earlier evidence
  try{
   if(!terrain)throw Error('3D renderer unavailable');
   const g=bridge.game(),d=root.JuraTerrain3D?.ELEVATIONS[g];
   if(!d)throw Error('No heightfield for this game');
   if(file.size!==d.width*d.height*2)throw Error('Expected '+(d.width*d.height*2).toLocaleString()+' bytes');
   const bytes=await file.arrayBuffer();
   if(g!==bridge.game())throw Error('The active GTA world changed while importing');
   await terrain.setElevationBinary(bytes,g);
   localElevation={game:g,bytes};
   // Invalidate the pending button load: the local upload is authoritative,
   // and late async 404/corrupt responses must not overwrite its status.
   ++terrainViewToken;densePending=false;approxPending=false;
   if(dimension==='3d'){
    const ok=!!terrain.isActive()||!!terrain.activate();
    fallback3d=!ok;
    document.body.classList.toggle('jura-perspective-fallback',fallback3d);
    $('jura3dStatus').textContent=ok?'3D terrain active · locally imported':'WebGL unavailable · illustrated map retained';
    const preview=$('j362TerrainStatus');
    if(preview)preview.textContent=ok?'Local reconstructed terrain loaded.':'Your compatible terrain file was accepted. WebGL is unavailable on this device; the illustrated map remains usable.';
    syncTerrainNotice();render(false);
   }
   status('Private community heightfield loaded · UNVERIFIED. '+(dimension==='3d'&&!fallback3d?'Actual WebGL terrain active.':dimension==='3d'?'WebGL unavailable; map retained.':'Switch to 3D to see terrain.')+' File remains on this device; not uploaded.');
  }catch(err){
   localElevation=previous;
   status('Elevation rejected: '+err.message+(previous?' · Previously accepted terrain and evidence preserved.':''));
  }finally{e.target.value=''}
 };
 if($('juraElevationProofFile'))$('juraElevationProofFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{
  if(!localElevation||localElevation.game!==bridge.game())throw Error('Import matching terrain first');
  if(!root.JuraTerrainEvidence)throw Error('Terrain evidence validator unavailable');
  if(file.size>32768)throw Error('Evidence JSON exceeds 32 KB');
  const result=await root.JuraTerrainEvidence.verify(localElevation.bytes,JSON.parse(await file.text()),
   root.JuraTerrain3D.ELEVATIONS[localElevation.game],localElevation.game);
  status('SHA-256 and '+result.pointsChecked+' claimed control points match ('+result.maxResidualMeters.toFixed(2)+' m maximum error). Source rights and independent coordinates still need human review.');
 }catch(err){status('Evidence rejected: '+err.message+' · Existing personal terrain remains unverified.')}finally{e.target.value=''}};
 $('juraNavRoadFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>16000000)throw Error('Graph exceeds 16 MB limit');const raw=JSON.parse(await file.text());if(String(raw.game)!==bridge.game())throw Error('Road graph must belong to the active GTA game');graph=Core.validateGraph(raw);status('Imported road graph: '+graph.nodes.size+' nodes. UNVERIFIED: map connectivity is not proof of game-road accuracy.');}catch(err){graph=null;status('Road graph rejected: '+err.message)}finally{e.target.value=''}};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.activeElement?.tagName!=='INPUT'){if(active)close();else if(dimension==='3d')setDimension('2d')}});syncDimensionControls();render();}
init();return{open,close,setRoutePoint,setStart,refresh,gameChanged,render,setDimension,getDimension:()=>dimension,getPlan:()=>plan,terrain:()=>terrain};}
root.JuraNavigation=Object.freeze({create});
})(typeof window!=='undefined'?window:globalThis);
