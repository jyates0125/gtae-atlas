/* Guest heist intel: preserve original device key and evidence labels.
   No game-coordinate claims or network writes. */
(()=>{
'use strict';
const page=location.pathname.split('/').pop()||'';
if(!/^heist-[a-z0-9-]+\.html$/.test(page))return;
const KEY='team-jura-atlas93-heist-intel-'+page;
const refs={
 'heist-cayo-perico.html':[['Interactive Cayo scoping planner','atlas-cayo.html'],['GTADB GTA Online interactive map','https://gtadb.net/gta-online-map/interactive/']],
 'heist-diamond-casino.html':[['GTA Online map and city entry points','atlas-online.html'],['GTADB interactive map','https://gtadb.net/gta-online-map/interactive/']],
 'heist-doomsday-act-3.html':[['Atlas Blaine County map','atlas-online.html'],['Heist HQ','heists.html']]
};
const elem=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
const button=text=>{const b=elem('button','',text);b.type='button';return b};
function safeUrl(value){
 if(typeof value!=='string'||!value||value.length>400)return '';
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}
}
function read(){
 let raw;
 try{raw=localStorage.getItem(KEY)}catch{return {ok:false,raw:null,notes:[],error:'Browser storage is unavailable. No changes can be saved.'}}
 if(raw===null)return {ok:true,raw,notes:[]};
 try{
  const notes=JSON.parse(raw);
  if(!Array.isArray(notes)||notes.length>40||notes.some(n=>!n||typeof n!=='object'||Array.isArray(n)||typeof n.label!=='string'||!n.label.trim()||n.label.length>90))throw Error();
  return {ok:true,raw,notes};
 }catch{return {ok:false,raw,notes:[],error:'Saved intel is unreadable. Download the original data before recovery. Nothing has been overwritten.'}}
}
function init(){
 const main=document.querySelector('.mapbox');
 if(!main||document.getElementById('j93-heist-intel'))return;
 const root=elem('section','j93-heist-intel');root.id='j93-heist-intel';
 root.append(elem('h3','','♜ HEIST INTEL LEDGER'),elem('p','','Attach a source or personal gameplay finding to preparation details. Schematic planning pins are not game-coordinate verification.'));
 const links=elem('div','j93-heist-links');
 for(const [label,url] of refs[page]||[['Shared GTA Online map','atlas-online.html'],['GTADB research reference','https://gtadb.net/gta-online-map/interactive/']]){
  const a=elem('a','',label+' ↗');a.href=url.startsWith('https:')?url:'./'+url;if(url.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer'}links.append(a);
 }
 root.append(links);
 const form=elem('div','j93-heist-form');
 const label=elem('input');label.placeholder='Intel / mission task';label.maxLength=90;label.setAttribute('aria-label','Intel task label');
 const source=elem('input');source.placeholder='https:// official, wiki or credited source (optional)';source.maxLength=400;source.setAttribute('aria-label','Evidence link');
 const select=elem('select');select.setAttribute('aria-label','Verification level');
 for(const [v,n] of [['personal','Personal gameplay note'],['source','Source referenced; not independently checked'],['verified','Verified by me in gameplay']])select.add(new Option(n,v));
 const add=button('+ Add intel note');form.append(label,source,select,add);
 const recovery=elem('div','j93-heist-links');recovery.hidden=true;
 const exportRaw=button('Download original intel save');const reset=button('Reset unreadable intel');reset.disabled=true;recovery.append(exportRaw,reset);
 const list=elem('ul','j93-heist-list');const msg=elem('p','j93-heist-status');msg.setAttribute('role','status');msg.setAttribute('aria-live','polite');
 root.append(form,recovery,list,msg);main.append(root);
 let shown=read(),backedUp=null;
 function render(message){
  shown=read();list.replaceChildren();
  for(const control of [label,source,select,add])control.disabled=!shown.ok;
  recovery.hidden=shown.ok||shown.raw===null;
  reset.disabled=backedUp===null||backedUp!==shown.raw;
  if(!shown.ok){msg.textContent=shown.error;return}
  for(const [i,n] of shown.notes.entries()){
   const li=elem('li');
   li.append(elem('span','',n.label+' · '+({personal:'MY NOTE',source:'SOURCE LINK',verified:'PERSONAL GAMEPLAY VERIFIED'}[n.level]||'RESEARCH')));
   const url=safeUrl(n.url);
   if(url){const a=elem('a','','Source ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';li.append(a)}
   else if(n.url)li.append(elem('small','','Original source link retained in storage; not a safe HTTPS link.'));
   const remove=button('Remove');remove.setAttribute('aria-label','Remove intel note '+n.label);
   const original=shown.raw;
   remove.onclick=()=>{
    const current=read();
    if(!current.ok||current.raw!==original){render('Intel changed in another tab. Review the updated list before removing.');return}
    const next=current.notes.slice();next.splice(i,1);write(current,next,'Intel note removed.');
   };
   li.append(remove);list.append(li);
  }
  if(!shown.notes.length)list.append(elem('li','','No sourced intel notes yet.'));
  msg.textContent=message||'Intel notes stay on this device. Personal verification is not official verification.';
 }
 function write(current,next,success){
  try{
   if(localStorage.getItem(KEY)!==current.raw){render('Intel changed in another tab. Review the updated list and retry.');return false}
   localStorage.setItem(KEY,JSON.stringify(next));
  }catch{msg.textContent='Could not save intel. Existing data was not intentionally overwritten; copy your draft and retry.';return false}
  render(success);return true;
 }
 add.onclick=()=>{
  const title=label.value.trim(),url=source.value.trim();
  if(!title){msg.textContent='Enter a note or mission task.';return}
  if(url&&!safeUrl(url)){msg.textContent='Enter a valid HTTPS source link without credentials.';return}
  const current=read();if(!current.ok){render();return}
  if(current.notes.length>=40){msg.textContent='40 notes maximum';return}
  const next=[...current.notes,{label:title,url,level:select.value,updated:new Date().toISOString()}];
  if(write(current,next,'Intel saved locally. Your selected status does not confer official verification.')){label.value='';source.value=''}
 };
 exportRaw.onclick=()=>{
  const current=read();
  if(current.ok||current.raw===null){render();return}
  const url=URL.createObjectURL(new Blob([current.raw],{type:'text/plain;charset=utf-8'}));
  const a=elem('a');a.href=url;a.download=page.replace('.html','')+'-intel-recovery.txt';
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  backedUp=current.raw;reset.disabled=false;msg.textContent='Original intel download requested. Keep it safe before resetting.';
 };
 reset.onclick=()=>{
  const current=read();
  if(current.ok||backedUp===null||current.raw!==backedUp){backedUp=null;render();return}
  if(!window.confirm('Reset only this heist’s unreadable intel after saving the recovery file? Other progress is unaffected.'))return;
  try{
   if(localStorage.getItem(KEY)!==backedUp){backedUp=null;render();return}
   localStorage.removeItem(KEY);backedUp=null;render('Unreadable intel reset. Keep your original recovery file.');
  }catch{msg.textContent='Reset failed. Existing data was not intentionally overwritten.'}
 };
 window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null){backedUp=null;render()}});
 window.addEventListener('pageshow',()=>render());
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
