/* Atlas 30.2 — Cayo flagship access to damaged legacy checklist recovery.
 * Cayo hides main.wrap>.layout; the original checklist export is therefore
 * inaccessible when malformed saved data is detected. This extension adds an
 * emergency-only, visible rescue UI; it never changes live Cayo map controls.
 */
(()=>{'use strict';
if(document.body?.dataset.heist!=='cayo-perico')return;
const KEY='teamjura-heist-cayo-perico';
const isObject=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const readRaw=()=>{
 try{return{raw:localStorage.getItem(KEY),accessible:true}}
 catch{return{raw:null,accessible:false}}
};
const invalid=raw=>{
 if(raw===null)return false;
 try{return !isObject(JSON.parse(raw))}
 catch{return true}
};
let record=readRaw();
if(!record.accessible||!invalid(record.raw))return;
let raw=record.raw,exported=false;
const el=(tag,cls,txt)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(txt!==undefined)node.textContent=txt;return node};
const panel=el('section','j302-cayo-recovery');
panel.id='j302-cayo-recovery';
panel.setAttribute('aria-labelledby','j302-cayo-recovery-title');
const heading=el('h2','', 'Recover older Cayo checklist');heading.id='j302-cayo-recovery-title';
const intro=el('p','',
 'Your legacy Cayo checklist cannot be decoded. The newer island map and mission board remain available. No stored data has been overwritten.');
const actions=el('div','j302-cayo-actions');
const download=el('button','','Download raw recovery copy');download.type='button';
download.id='j302-cayo-download';
const reset=el('button','','Reset only damaged checklist');reset.type='button';
reset.id='j302-cayo-reset';reset.disabled=true;
actions.append(download,reset);
const message=el('p','j302-cayo-status',
 'First download the original bytes. You can then choose an optional reset of only this older checklist.');
message.setAttribute('role','status');message.setAttribute('aria-live','polite');
panel.append(heading,intro,actions,message);
const header=document.querySelector('header.sitebar');
if(header)header.after(panel);else document.body.prepend(panel);
function refreshFromOutside(){
 const latest=readRaw();
 if(!latest.accessible){download.disabled=true;reset.disabled=true;message.textContent='Local storage is unavailable. Existing progress has not been modified.';return}
 if(latest.raw===null||!invalid(latest.raw)){panel.remove();return}
 if(latest.raw!==raw){raw=latest.raw;exported=false;reset.disabled=true;message.textContent='The saved checklist changed in another tab. Download a new raw recovery copy before deciding on a reset.'}
}
window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null)refreshFromOutside()});
download.addEventListener('click',()=>{
 try{
  refreshFromOutside();if(!panel.isConnected)return;
  const url=URL.createObjectURL(new Blob([raw],{type:'text/plain;charset=utf-8'}));
  const link=el('a');link.href=url;link.download='team-jura-cayo-perico-raw-checklist-recovery.txt';
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1200);
  exported=true;reset.disabled=false;
  message.textContent='The original checklist bytes were downloaded. Only after your confirmation can this legacy checklist be reset; Cayo routes, notes and other saved data stay intact.';
 }catch{
  reset.disabled=true;exported=false;message.textContent='Download unavailable. Reset is disabled to protect the saved checklist.';
 }
});
reset.addEventListener('click',()=>{
 if(!exported||reset.disabled)return;
 if(!window.confirm('Replace only this unreadable older Cayo checklist? You downloaded its original bytes. Your modern Cayo map, mission planning, notes and other heists stay unchanged.'))return;
 try{
  if(readRaw().raw!==raw)throw Error('Checklist changed since the recovery download');
  localStorage.setItem(KEY,'{}');
  panel.remove();
 }catch{
  exported=false;reset.disabled=true;
  message.textContent='Reset blocked: saved data changed or browser storage is unavailable. Download a fresh copy if needed. No other progress was altered.';
 }
});
})();