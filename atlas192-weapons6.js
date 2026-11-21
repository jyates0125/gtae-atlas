/* Atlas 19.2 · GTA VI-only weapon evidence workspace.
 * No GTA V model images, no invented spawn coordinates or performance stats.
 * Source records are separate from private browser-only observation notes.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const KEY='teamjura-vi-weapon-notes-v1';
const make=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n};
const state={seen:{},notes:{}};let rows=[],query='',group='all',onlySeen=false;
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&saved.schema===1){
 for(const field of ['seen','notes'])if(saved[field]&&typeof saved[field]==='object'&&!Array.isArray(saved[field]))Object.assign(state[field],saved[field]);
}}catch(_){}
function announce(msg){if($('viWeaponStatus'))$('viWeaponStatus').textContent=msg}
function save(){try{localStorage.setItem(KEY,JSON.stringify({schema:1,seen:state.seen,notes:state.notes,updated:new Date().toISOString()}));return true}catch(_){announce('Saving is unavailable on this device. Export your research notes.');return false}}
function render(){
 const found=rows.filter(r=>(group==='all'||r.group===group)&&(!onlySeen||state.seen[r.id])&&(!query||[r.name,r.group,r.evidence,r.description].join(' ').toLowerCase().includes(query)));
 $('viWeaponCount').textContent=found.length+' of '+rows.length+' referenced items';
 $('viWeaponNoted').textContent=rows.filter(r=>state.seen[r.id]).length+' noted on this device';
 const root=$('viWeaponCards');root.replaceChildren();
 if(!found.length)root.append(make('p','viweapon-empty','No matching evidence records. Try All classes or remove the search filter.'));
 for(const r of found){
  const card=make('article','viweapon-card');card.dataset.weaponId=r.id;
  const top=make('div','viweapon-card-top');
  const mark=make('span','viweapon-type',r.group);
  const evidence=make('span','viweapon-grade '+(r.grade.includes('Named')?'viweapon-official':'viweapon-observed'),r.grade);
  top.append(mark,evidence);card.append(top);
  const h=make('h3','',r.name);card.append(h,make('p','viweapon-copy',r.description));
  const disclosure=make('p','viweapon-evidence',r.evidence);card.append(disclosure);
  const actions=make('div','viweapon-actions');
  const noted=make('button','viweapon-note',state.seen[r.id]?'✓ Added to my notes':'+ Mark reviewed');
  noted.type='button';noted.setAttribute('aria-pressed',String(!!state.seen[r.id]));
  noted.addEventListener('click',()=>{state.seen[r.id]=!state.seen[r.id];if(!state.seen[r.id])delete state.seen[r.id];save();render();announce('Personal review updated.');});
  const source=make('a','viweapon-source','Check evidence');source.href=r.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';source.title=r.sourceName;
  actions.append(noted,source);card.append(actions);
  const d=make('details','viweapon-notes');d.append(make('summary','','My research notes'));
  const input=make('textarea','');input.rows=3;input.maxLength=900;input.value=String(state.notes[r.id]||'').slice(0,900);
  input.setAttribute('aria-label','Private research notes for '+r.name);input.placeholder='What did you verify in your own gameplay? No public edits are made.';
  const saveButton=make('button','viweapon-note-save','Save note');saveButton.type='button';
  saveButton.addEventListener('click',()=>{const value=input.value.trim().slice(0,900);if(value)state.notes[r.id]=value;else delete state.notes[r.id];if(save())announce('Saved your note for '+r.name+'.')});
  d.append(input,saveButton);card.append(d);root.append(card);
 }
}
function exportNotes(){
 const payload={schema:1,app:'team-jura-vi-weapons',scope:'vi',exportedAt:new Date().toISOString(),notes:{...state.notes},seen:{...state.seen}};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='team-jura-gta-vi-weapon-research.json';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 announce('Exported this device’s GTA VI research notes.');
}
async function start(){
 try{
  const response=await fetch('./data/atlas192-vi-weapons.json',{cache:'no-cache'});
  if(!response.ok)throw Error('Source catalog HTTP '+response.status);
  const raw=await response.json();
  if(raw.schema!==1||raw.scope!=='vi'||raw.kind!=='weapon'||!Array.isArray(raw.records))throw Error('Wrong weapon dataset');
  const seen=new Set();
  rows=raw.records.filter(r=>r&&/^[a-z0-9-]+$/.test(r.id)&&r.name&&r.group&&r.sourceUrl?.startsWith('https://')&&!seen.has(r.id)&&seen.add(r.id));
  const select=$('viWeaponClass');const categories=[...new Set(rows.map(r=>r.group))].sort();
  for(const cls of categories)select.add(new Option(cls,cls));
  $('viWeaponReviewed').textContent='Research snapshot reviewed '+String(raw.reviewedAt||'date not recorded');
  $('viWeaponDisclaimer').textContent=String(raw.disclaimer||'GTA VI sources must be checked per item.');
  render();announce('GTA VI source-qualified research loaded. This is not a complete game arsenal.');
 }catch(err){announce('Research catalog unavailable: '+String(err.message).slice(0,120));$('viWeaponCards').replaceChildren(make('p','viweapon-empty','GTA VI records could not load. GTA V records will not be substituted.'))}
 $('viWeaponSearch').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase().slice(0,120);render()});
 $('viWeaponClass').addEventListener('change',e=>{group=e.target.value;render()});
 $('viWeaponMine').addEventListener('change',e=>{onlySeen=e.target.checked;render()});
 $('viWeaponClear').addEventListener('click',()=>{$('viWeaponSearch').value='';$('viWeaponClass').value='all';$('viWeaponMine').checked=false;query='';group='all';onlySeen=false;render();});
 $('viWeaponExport').addEventListener('click',exportNotes);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
