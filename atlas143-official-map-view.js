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
 <div class="j143-stage" tabindex="0" aria-label="Pan the official Leonida poster by dragging, use plus and minus buttons to zoom"><img class="j143-poster" alt="Your personal locally installed copy of Rockstar Games official Leonida map" hidden><div class="j143-empty"><strong>View Rockstar's official Leonida map here.</strong><p>Rockstar provides the print-ready map as a download. Download the official ZIP or save its JPEG, then select it below to open it in our zoomable, draggable map viewer. The image stays in this browser; it is never uploaded to Team Jura.</p><a href="https://www.rockstargames.com/VI/media" target="_blank" rel="noopener noreferrer">Get official Rockstar map ↗</a><label class="j143-upload">Choose official Rockstar ZIP / JPEG / PNG / WebP<input type="file" accept=".zip,application/zip,image/jpeg,image/png,image/webp" aria-label="Choose image from official Rockstar map download"></label></div></div>
 <footer class="j143-foot"><span role="status" aria-live="polite" class="j143-status">Rockstar poster mode · no map pins are overlaid because coordinates are not calibrated.</span><div><label class="j143-replace">Change image<input type="file" accept=".zip,application/zip,image/jpeg,image/png,image/webp" aria-label="Replace personal official map image"></label><button type="button" data-j143="forget">Forget image</button><a href="https://www.rockstargames.com/VI/media" target="_blank" rel="noopener noreferrer">Source ↗</a></div></footer>`;
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
  if(!file)return;
  if(file.type==='application/zip'||/\.zip$/i.test(file.name)){try{status.textContent='Opening the Rockstar map archive locally…';file=await imageFromZip(file)}catch(err){status.textContent=err?.message||'Could not read ZIP. Extract the JPEG and select it instead.';return}}
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){status.textContent='Use the official map ZIP, JPEG, PNG or WebP file.';return}
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
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
