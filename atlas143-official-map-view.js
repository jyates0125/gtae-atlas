/* Team Jura Atlas 14.3: official Leonida poster image viewer.
 * Personal local file remains entirely in the visitor's browser. No upload or third-party relay.
 * The official poster is not a calibrated GTADB coordinate system: do not draw pins or routes on it.
 * No Rockstar art copied into the deployable package; link to their official download.
 */
(()=>{'use strict';
const PAGE='6';
const DATABASE='team-jura-official-map-v1',STORE='official-map',KEY='leonida-poster';
const SOURCE='https://www.rockstargames.com/VI/media';
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
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||Error('Could not access saved map'));
  transaction.oncomplete=()=>db.close();
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
 controls.insertBefore(button,controls.querySelector('.j141-official-flat'));
 const panel=document.createElement('section');panel.id='j143-official-layer';panel.className='j143-official-layer';
 panel.hidden=true;panel.setAttribute('aria-label','Official Rockstar Leonida map viewer');
 panel.innerHTML=`<header class="j143-toolbar"><div><strong>Leonida · Rockstar official map</strong><small>OFFICIAL POSTER VIEW · NO UNVERIFIED PINS</small></div><div class="j143-actions"><button type="button" data-j143="minus" aria-label="Zoom out">−</button><button type="button" data-j143="plus" aria-label="Zoom in">+</button><button type="button" data-j143="reset">Fit</button><button type="button" data-j143="close" aria-label="Return to interactive Leonida map">✕ Interactive map</button></div></header>
 <div class="j143-stage" tabindex="0" aria-label="Pan the official Leonida poster by dragging, use plus and minus buttons to zoom"><img class="j143-poster" alt="Your personal locally installed copy of Rockstar Games official Leonida map" hidden><div class="j143-empty"><strong>View Rockstar's official Leonida map here.</strong><p>Rockstar provides the print-ready map as a download. Save the JPEG from the official package, then select it below to open it in our zoomable, draggable map viewer. The image stays in this browser; it is never uploaded to Team Jura.</p><a href="https://www.rockstargames.com/VI/media" target="_blank" rel="noopener noreferrer">Get official Rockstar map ↗</a><label class="j143-upload">Choose official map JPEG / PNG / WebP<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose image from official Rockstar map download"></label></div></div>
 <footer class="j143-foot"><span role="status" aria-live="polite" class="j143-status">Rockstar poster mode · no map pins are overlaid because coordinates are not calibrated.</span><div><label class="j143-replace">Change image<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Replace personal official map image"></label><button type="button" data-j143="forget">Forget image</button><a href="https://www.rockstargames.com/VI/media" target="_blank" rel="noopener noreferrer">Source ↗</a></div></footer>`;
 map.append(panel);
 const img=panel.querySelector('.j143-poster'),stage=panel.querySelector('.j143-stage'),status=panel.querySelector('.j143-status');
 const empty=panel.querySelector('.j143-empty');
 let zoom=1,dx=0,dy=0,dragging=false,startX=0,startY=0,pointer=null,objectUrl=null,loaded=false;
 function position(){img.style.transform=`translate3d(${dx}px,${dy}px,0) scale(${zoom})`;}
 function fit(){zoom=1;dx=dy=0;position();}
 function showFile(file,notice){
  if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}
  objectUrl=URL.createObjectURL(file);img.src=objectUrl;img.hidden=false;empty.hidden=true;loaded=true;fit();
  status.textContent=notice;
 }
 async function onFile(file){
  if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){status.textContent='Use a JPEG, PNG or WebP image from the official map package.';return}
  if(file.size>80*1024*1024){status.textContent='This image is over 80 MB. Use a smaller JPEG or WebP copy.';return}
  showFile(file,'Official map opened in this browser. Community pins are hidden on the poster view.');
  try{await stored('put',file);status.textContent='Official map saved in this browser for future visits. No upload performed.'}
  catch{status.textContent='Map open for this visit only; this browser could not save the image offline.'}
 }
 for(const input of panel.querySelectorAll('input[type="file"]'))input.addEventListener('change',()=>{onFile(input.files?.[0]);input.value=''});
 async function openView(){
  panel.hidden=false;button.setAttribute('aria-expanded','true');
  button.setAttribute('aria-pressed','true');
  if(!loaded){try{const f=await stored('get');if(f instanceof Blob)showFile(f,'Official map restored from this browser; no upload performed.')}catch{status.textContent='Choose the official Rockstar map image to view it here.'}}
  panel.querySelector('[data-j143="close"]').focus();
 }
 function closeView(){panel.hidden=true;button.setAttribute('aria-expanded','false');button.setAttribute('aria-pressed','false');button.focus()}
 button.addEventListener('click',()=>panel.hidden?openView():closeView());
 panel.addEventListener('click',async ev=>{
  const cmd=ev.target.closest('[data-j143]')?.dataset.j143;
  if(!cmd)return;
  if(cmd==='close')closeView();
  if(cmd==='reset')fit();
  if(cmd==='plus'){zoom=Math.min(8,zoom*1.3);position()}
  if(cmd==='minus'){zoom=Math.max(1,zoom/1.3);if(zoom===1){dx=dy=0}position()}
  if(cmd==='forget'){
   try{await stored('delete')}catch{}
   if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}
   img.removeAttribute('src');img.hidden=true;empty.hidden=false;loaded=false;fit();
   status.textContent='Local image forgotten. No player map progress was changed.';
  }
 });
 stage.addEventListener('wheel',ev=>{if(!loaded)return;ev.preventDefault();zoom=Math.min(8,Math.max(1,zoom*(ev.deltaY<0?1.15:1/1.15)));if(zoom===1){dx=dy=0}position()},{passive:false});
 stage.addEventListener('pointerdown',ev=>{if(!loaded||ev.target!==img)return;dragging=true;pointer=ev.pointerId;startX=ev.clientX-dx;startY=ev.clientY-dy;img.setPointerCapture?.(pointer)});
 stage.addEventListener('pointermove',ev=>{if(!dragging||pointer!==ev.pointerId)return;dx=ev.clientX-startX;dy=ev.clientY-startY;position()});
 const release=()=>{dragging=false;pointer=null};stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
 stage.addEventListener('keydown',ev=>{if(!loaded)return;const steps={ArrowLeft:[-30,0],ArrowRight:[30,0],ArrowUp:[0,-30],ArrowDown:[0,30]};if(steps[ev.key]){ev.preventDefault();dx+=steps[ev.key][0];dy+=steps[ev.key][1];position()}});
 document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!panel.hidden)closeView()});
 // If visitors switch between worlds inside the same map engine, never display VI poster over GTA V.
 const observer=new MutationObserver(()=>{if(!isSix()&&!panel.hidden)closeView()});
 observer.observe(document.body,{attributes:true,attributeFilter:['data-start-world']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
