/* Team Jura Atlas 14.3: official Leonida poster image viewer.
 * Personal local file remains entirely in the visitor's browser. No upload or third-party relay.
 * The official poster is not a calibrated GTADB coordinate system: do not draw pins or routes on it.
 * No Rockstar art copied into the deployable package; link to their official download.
 */
(()=>{'use strict';
const PAGE='6';
const VIEW_KEY='view',ROCKSTAR_VIEW='rockstar';
const DATABASE='team-jura-official-map-v1',STORE='official-map',KEY='leonida-poster';
const SOURCE='https://www.rockstargames.com/VI/media';
const DIRECT_ZIP='https://media-rockstargames-com.akamaized.net/VI/downloads/artwork_wallpapers/Leonida_Map_Poster_Printable.zip';
const $=id=>document.getElementById(id);
const isSix=()=>document.body?.dataset?.startWorld===PAGE;
function openDatabase(){
 return new Promise((resolve,reject)=>{
  if(!('indexedDB' in window))return reject(Error('Offline storage unavailable'));
  const request=indexedDB.open(DATABASE,1);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE)};
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||Error('Storage unavailable'));
 });
}
async function stored(method,value){
 const db=await openDatabase();
 return new Promise((resolve,reject)=>{
  const transaction=db.transaction(STORE,method==='get'?'readonly':'readwrite');
  const store=transaction.objectStore(STORE);
  const request=method==='get'?store.get(KEY):method==='put'?store.put(value,KEY):store.delete(KEY);
  request.onerror=()=>reject(request.error||Error('Could not access saved map'));
  transaction.oncomplete=()=>{db.close();resolve(request.result)};
  transaction.onabort=()=>{db.close();reject(transaction.error||Error('Storage interrupted'))};
 });
}
function mount(){
 if(!isSix()||$('j143-official-layer'))return;
 const map=document.querySelector('main.map-wrap'),controls=map?.querySelector('.mapcontrols');
 if(!map||!controls)return;
 const button=document.createElement('button');
 button.type='button';button.id='j143-official-button';button.className='j143-view-button';
 button.textContent='▧ Rockstar · Official Map';button.setAttribute('aria-expanded','false');
 button.setAttribute('aria-controls','j143-official-layer');
 const mapSelector=controls.querySelector('#layer');
 if(mapSelector)mapSelector.insertAdjacentElement('afterend',button);
 else controls.append(button);
 const panel=document.createElement('section');panel.id='j143-official-layer';panel.className='j143-official-layer';
 panel.hidden=true;panel.setAttribute('aria-label','Official Rockstar Leonida map viewer');
 panel.innerHTML=`<header class="j143-toolbar"><div><strong>Leonida · Rockstar official map</strong><small>OFFICIAL POSTER VIEW · NO UNVERIFIED PINS</small></div><div class="j143-actions"><button type="button" data-j143="minus" aria-label="Zoom out">−</button><button type="button" data-j143="plus" aria-label="Zoom in">+</button><button type="button" data-j143="reset">Fit</button><button type="button" data-j143="close" aria-label="Return to interactive Leonida map">✕ Interactive map</button></div></header>
 <div class="j143-stage" tabindex="0" aria-label="Official Leonida map. Drag or use arrow keys to pan. Pinch or use plus and minus to zoom."><img class="j143-poster" alt="Your personal locally installed copy of Rockstar Games official Leonida map" hidden><div class="j143-empty"><strong>Explore Rockstar's official Leonida map</strong><p>Open the official map here and zoom or pan just like our other map views. The official map loads here and can be saved in this browser for later visits.</p><button type="button" data-j143="fetch" hidden>Reload Rockstar map</button><details class="j143-advanced"><summary>Map not loading? Other options</summary><p>Some browsers block Rockstar's download. You can download the official map directly and open it here without uploading it to Team Jura.</p><a href="https://www.rockstargames.com/VI/media" target="_blank" rel="noopener noreferrer">Get map from Rockstar ↗</a><label class="j143-upload">Open downloaded map<input type="file" accept=".zip,application/zip,image/jpeg,image/png,image/webp" aria-label="Open downloaded official Rockstar map image"></label></details></div></div>
 <footer class="j143-foot"><span role="status" aria-live="polite" class="j143-status">Rockstar poster view · research pins are shown only on calibrated community map layers.</span><div><button type="button" data-j143="forget">Clear locally saved map</button><a href="${DIRECT_ZIP}" aria-label="Download GTA VI map, official printable ZIP">Download GTA VI map (ZIP)</a><a href="https://www.rockstargames.com/VI/media" target="_blank" rel="noopener noreferrer">Official source ↗</a></div></footer>`;
 map.append(panel);
 const img=panel.querySelector('.j143-poster'),stage=panel.querySelector('.j143-stage'),status=panel.querySelector('.j143-status');
 const empty=panel.querySelector('.j143-empty');
 const fetchButton=panel.querySelector('[data-j143="fetch"]');
 const forgetButton=panel.querySelector('[data-j143="forget"]');
 const fileInput=panel.querySelector('input[type="file"]');
 function setBusy(busy){
  for(const control of [fetchButton,forgetButton,fileInput])control.disabled=busy;
 }
 async function runOperation(operation){
  if(fetchButton.disabled)return;
  setBusy(true);
  try{await operation()}
  finally{setBusy(false)}
 }
 let zoom=1,dx=0,dy=0,objectUrl=null,loaded=false;
 const pointers=new Map();
 function position(){img.style.transform=`translate3d(${dx}px,${dy}px,0) scale(${zoom})`;}
 function fit(){zoom=1;dx=dy=0;position();}
 function zoomAt(nextZoom,fromX,fromY,toX=fromX,toY=fromY){
  const bounded=Math.max(1,Math.min(8,nextZoom));
  if(bounded===1){fit();return}
  const rect=stage.getBoundingClientRect();
  const centerX=rect.left+rect.width/2,centerY=rect.top+rect.height/2;
  const ratio=bounded/zoom;
  dx=toX-centerX-(fromX-centerX-dx)*ratio;
  dy=toY-centerY-(fromY-centerY-dy)*ratio;
  zoom=bounded;position();
 }
 function zoomFromCenter(factor){
  const rect=stage.getBoundingClientRect();
  zoomAt(zoom*factor,rect.left+rect.width/2,rect.top+rect.height/2);
 }
 async function showFile(file,notice){
  const priorHash=panel.dataset.j290Hash||'';
  // While switching image bytes, immediately hide previous-image pins.
  panel.removeAttribute('data-j290-hash');
  window.dispatchEvent(new Event('jura:poster:clear'));
  const nextUrl=URL.createObjectURL(file);
  try{
   img.src=nextUrl;
   await img.decode();
  }catch{
   URL.revokeObjectURL(nextUrl);
   if(objectUrl)img.src=objectUrl;
   else img.removeAttribute('src');
   if(priorHash){panel.dataset.j290Hash=priorHash;window.dispatchEvent(new CustomEvent('jura:poster:ready',{detail:{sha256:priorHash}}));}
   throw Error('This image could not be displayed. Try the official Rockstar download again.');
  }
  if(objectUrl)URL.revokeObjectURL(objectUrl);
  objectUrl=nextUrl;img.hidden=false;empty.hidden=true;loaded=true;fit();
  status.textContent=notice;
  // The poster itself remains local. Hash its exact bytes so personal pins
  // cannot silently appear on a different crop, edition, or unrelated image.
  try{
   const digest=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());
   const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
   panel.dataset.j290Hash=hash;
   window.dispatchEvent(new CustomEvent('jura:poster:ready',{detail:{sha256:hash}}));
  }catch{
   panel.removeAttribute('data-j290-hash');
   window.dispatchEvent(new Event('jura:poster:clear'));
  }
 }
 async function imageFromZip(file){
  if(file.size>90*1024*1024)throw Error('ZIP exceeds 90 MB. Extract the official JPG manually.');
  const bytes=new Uint8Array(await file.arrayBuffer()),view=new DataView(bytes.buffer);
  // Find ZIP end-of-central-directory, then an image entry. Ignore arbitrary paths and executable files.
  let end=-1;for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){
   if(view.getUint32(i,true)===0x06054b50){end=i;break}
  }
  if(end<0)throw Error('This is not a supported official map ZIP file.');
  let cursor=view.getUint32(end+16,true),remaining=view.getUint16(end+10,true),chosen=null;
  if(remaining>256)throw Error('Archive has too many entries.');
  const nameDecoder=new TextDecoder();
  while(remaining-->0&&cursor+46<=bytes.length){
   if(view.getUint32(cursor,true)!==0x02014b50)break;
   const method=view.getUint16(cursor+10,true),compressed=view.getUint32(cursor+20,true),expanded=view.getUint32(cursor+24,true);
   const nameLen=view.getUint16(cursor+28,true),extraLen=view.getUint16(cursor+30,true),commentLen=view.getUint16(cursor+32,true);
   const localOffset=view.getUint32(cursor+42,true);
   const endName=cursor+46+nameLen;
   if(endName>bytes.length)break;
   const name=nameDecoder.decode(bytes.subarray(cursor+46,endName));
   if(/\.(?:jpe?g|png|webp)$/i.test(name)&&expanded>0&&expanded<=80*1024*1024
      &&(method===0||method===8)&&(!chosen||/leonida.*map|map.*leonida/i.test(name))){
     chosen={name,method,compressed,expanded,localOffset};
     if(/leonida.*map|map.*leonida/i.test(name))break;
   }
   cursor=endName+extraLen+commentLen;
  }
  if(!chosen)throw Error('No supported map image found. Extract the official JPEG instead.');
  const {method,compressed,expanded,localOffset,name}=chosen;
  if(localOffset+30>bytes.length||view.getUint32(localOffset,true)!==0x04034b50)throw Error('Broken ZIP entry.');
  const begin=localOffset+30+view.getUint16(localOffset+26,true)+view.getUint16(localOffset+28,true);
  if(begin+compressed>bytes.length)throw Error('Incomplete ZIP data.');
  const raw=bytes.subarray(begin,begin+compressed);
  const blob=method===0?new Blob([raw]):await new Response(
   new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  ).blob();
  if(blob.size!==expanded||blob.size>80*1024*1024)throw Error('Image in ZIP failed size validation.');
  const type=/\.png$/i.test(name)?'image/png':/\.webp$/i.test(name)?'image/webp':'image/jpeg';
  return new File([blob],name.split('/').pop(),{type});
 }
 async function onFile(file){
  if(file.type==='application/zip'||/\.zip$/i.test(file.name)){
   status.textContent='Opening the Rockstar map archive locally…';
   file=await imageFromZip(file);
  }
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Use the official map ZIP, JPEG, PNG or WebP file.');
  if(file.size>80*1024*1024)throw Error('This image is over 80 MB. Use a smaller JPEG or WebP copy.');
  await showFile(file,'Official map opened in this browser. Community pins are hidden on the poster view.');
  try{await stored('put',file);status.textContent='Official map saved in this browser for future visits. No upload performed.'}
  catch{status.textContent='Map open for this visit only; this browser could not save the image offline.'}
 }
 fileInput.addEventListener('change',()=>{
  const file=fileInput.files?.[0];
  fileInput.value='';
  if(file)runOperation(async()=>{
   try{await onFile(file)}
   catch(err){status.textContent=err.message}
  });
 });
 function updateViewUrl(open){
  const url=new URL(location.href);
  if(open)url.searchParams.set(VIEW_KEY,ROCKSTAR_VIEW);
  else if(url.searchParams.get(VIEW_KEY)===ROCKSTAR_VIEW)url.searchParams.delete(VIEW_KEY);
  else return;
  if(url.href!==location.href)history.replaceState(history.state,'',url);
 }
 async function loadRockstarMap(){
   fetchButton.hidden=true;
   let file;
   try{
    status.textContent='Loading Rockstar’s official map…';
    const response=await fetch(DIRECT_ZIP,{mode:'cors',credentials:'omit',signal:AbortSignal.timeout(90000)});
    if(!response.ok)throw Error('Rockstar download was not available');
    const announced=Number(response.headers.get('content-length')||0);
    if(announced>90*1024*1024)throw Error('File size exceeds allowed limit');
    file=await response.blob();
    if(file.size>90*1024*1024)throw Error('File size exceeds allowed limit');
   }catch{
    fetchButton.hidden=false;
    status.textContent='Rockstar did not allow automatic loading in this browser. Expand “Map not loading? Other options” to open the official download here.';
    panel.querySelector('.j143-advanced').open=true;
    return;
   }
   try{await onFile(new File([file],'Leonida_Map_Poster_Printable.zip',{type:'application/zip'}))}
   catch(err){
    fetchButton.hidden=false;
    status.textContent=err.message;
    panel.querySelector('.j143-advanced').open=true;
   }
   }
 function openView({focus=true}={}){
  updateViewUrl(true);
  panel.hidden=false;button.setAttribute('aria-expanded','true');
  button.setAttribute('aria-pressed','true');
  if(focus)panel.querySelector('[data-j143="close"]').focus();
  if(!loaded)runOperation(async()=>{
   try{
    const file=await stored('get');
    if(file instanceof Blob){
     await showFile(file,'Official map restored from this browser; no upload performed.');
     return;
    }
   }catch{
    // An unavailable or unreadable cache should fall back to Rockstar.
   }
   if(!panel.hidden)await loadRockstarMap();
  });
 }
 function closeView(){
  updateViewUrl(false);
  panel.hidden=true;button.setAttribute('aria-expanded','false');button.setAttribute('aria-pressed','false');
  // Tell optional personal-poster tools to disarm pending placement on exit.
  window.dispatchEvent(new CustomEvent('jura:poster:visibility',{detail:{open:false}}));
  if(!button.hidden)button.focus();
 }
 button.addEventListener('click',()=>panel.hidden?openView():closeView());
 panel.addEventListener('click',async ev=>{
  const cmd=ev.target.closest('[data-j143]')?.dataset.j143;
  if(!cmd)return;
  if(cmd==='fetch')await runOperation(loadRockstarMap);
  if(cmd==='close')closeView();
  if(cmd==='reset')fit();
  if(cmd==='plus'&&loaded)zoomFromCenter(1.3);
  if(cmd==='minus'&&loaded)zoomFromCenter(1/1.3);
  if(cmd==='forget')await runOperation(async()=>{
   try{await stored('delete')}
   catch{
    status.textContent='Could not clear the saved map. Try again.';
    return;
   }
   if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}
   img.removeAttribute('src');img.hidden=true;empty.hidden=false;fetchButton.hidden=false;loaded=false;fit();
   panel.removeAttribute('data-j290-hash');window.dispatchEvent(new Event('jura:poster:clear'));
   status.textContent='Local image forgotten. No player map progress was changed.';
  });
 });
 stage.addEventListener('wheel',ev=>{
  if(!loaded)return;
  ev.preventDefault();
  if(ev.deltaY)zoomAt(zoom*(ev.deltaY<0?1.15:1/1.15),ev.clientX,ev.clientY);
 },{passive:false});
 stage.addEventListener('pointerdown',ev=>{
  if(!loaded||ev.button!==0||pointers.size>=2)return;
  pointers.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
  stage.setPointerCapture(ev.pointerId);
 });
 stage.addEventListener('pointermove',ev=>{
  const previous=pointers.get(ev.pointerId);
  if(!previous||!loaded)return;
  const next={x:ev.clientX,y:ev.clientY};
  pointers.set(ev.pointerId,next);
  if(pointers.size===1){
   if(zoom>1){dx+=next.x-previous.x;dy+=next.y-previous.y;position()}
   return;
  }
  const other=Array.from(pointers.values()).find(point=>point!==next);
  const distance=Math.hypot(previous.x-other.x,previous.y-other.y);
  if(!distance)return;
  const nextDistance=Math.hypot(next.x-other.x,next.y-other.y);
  zoomAt(zoom*nextDistance/distance,
   (previous.x+other.x)/2,(previous.y+other.y)/2,
   (next.x+other.x)/2,(next.y+other.y)/2);
 });
 stage.addEventListener('lostpointercapture',ev=>pointers.delete(ev.pointerId));
 stage.addEventListener('keydown',ev=>{
  if(!loaded)return;
  if(['+','=','-','0'].includes(ev.key)){
   ev.preventDefault();
   if(ev.key==='0')fit();
   else zoomFromCenter(ev.key==='-'?1/1.3:1.3);
   return;
  }
  const steps={ArrowLeft:[-30,0],ArrowRight:[30,0],ArrowUp:[0,-30],ArrowDown:[0,30]};
  if(zoom>1&&steps[ev.key]){
   ev.preventDefault();dx+=steps[ev.key][0];dy+=steps[ev.key][1];position();
  }
 });
 document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!panel.hidden)closeView()});
 // The shared game switcher can move this page to GTA V or Online without navigation.
 // Never show the official Leonida poster button over a different GTA game.
 const worldSwitch=$('game6');
 function syncWorld(){
  const visible=!!worldSwitch&&worldSwitch.getAttribute('aria-pressed')==='true';
  button.hidden=!visible;
  if(!visible&&!panel.hidden)closeView();
 }
 if(worldSwitch){
  const observer=new MutationObserver(syncWorld);
  observer.observe(worldSwitch,{attributes:true,attributeFilter:['aria-pressed']});
 }
 syncWorld();
 if(!button.hidden&&new URLSearchParams(location.search).get(VIEW_KEY)===ROCKSTAR_VIEW){
  openView({focus:false});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
