/* Private local crew workspaces. Legacy v1 remains untouched; no cloud or Rockstar account. */
(function(root){
'use strict';
const KEY='team-jura-world-profiles-v2',OLD='team-jura-my-crew-v1';
const worlds=Object.freeze({online:'GTA Online',story:'GTA V Story',vi:'GTA VI Story',other:'Other GTA world'});
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const str=(v,n)=>typeof v==='string'?v.slice(0,n):'';
const fields=Object.freeze({name:60,tag:8,motto:120,bio:1000});
const blank=()=>({name:'',tag:'',motto:'',bio:'',tasks:[],members:[]});
const fresh=()=>({schema:2,world:'online',activeCrew:0,crews:[blank()],story:blank(),vi:blank(),other:blank()});
function clean(v){
 if(!object(v)||!Array.isArray(v.tasks)||v.tasks.length>50||v.tasks.some(t=>!object(t)||typeof t.text!=='string'||t.text.length>140||typeof t.done!=='boolean'))throw Error('Invalid profile plans');
 for(const [key,max] of Object.entries(fields))if(v[key]!==undefined&&(typeof v[key]!=='string'||v[key].length>max))throw Error('Invalid profile field');
 const members=v.members===undefined?[]:v.members;
 if(!Array.isArray(members)||members.length>40||members.some(x=>typeof x!=='string'||x.length>40))throw Error('Invalid roster');
 return {...Object.fromEntries(Object.entries(fields).map(([k,n])=>[k,str(v[k],n)])),tasks:v.tasks.map(t=>({text:t.text,done:t.done})),members:[...members]};
}
function normalize(v){
 if(!object(v)||v.schema!==2||!Object.hasOwn(worlds,v.world)||!Array.isArray(v.crews)||!v.crews.length||v.crews.length>20||!Number.isInteger(v.activeCrew)||v.activeCrew<0||v.activeCrew>=v.crews.length)throw Error('Invalid local workspace backup');
 return {schema:2,world:v.world,activeCrew:v.activeCrew,crews:v.crews.map(clean),story:clean(v.story),vi:clean(v.vi),other:v.other===undefined?blank():clean(v.other)};
}
function migrate(v){
 if(!object(v)||v.schema!==1)throw Error('Unknown profile backup');
 const state=fresh(),world=Object.hasOwn(worlds,v.game)?v.game:'online',p=clean(v);
 state.world=world;if(world==='online')state.crews[0]=p;else state[world]=p;return state;
}
function parse(v){return v?.schema===1?migrate(v):normalize(v)}
function current(state){return state.world==='online'?state.crews[state.activeCrew]:state[state.world]}
function read(storage){
 let raw=null,legacy=null;
 try{
  raw=storage.getItem(KEY);
  if(raw!==null)return {state:normalize(JSON.parse(raw)),raw,legacy,blocked:false};
  legacy=storage.getItem(OLD);
  return {state:legacy===null?fresh():migrate(JSON.parse(legacy)),raw,legacy,blocked:false};
 }catch(error){return {state:fresh(),raw,legacy,blocked:true,error:String(error.message||error)}}
}
function write(storage,base,next){
 if(base.blocked)throw Error('Existing local profiles could not be read. Original data was not overwritten.');
 if(storage.getItem(KEY)!==base.raw||(base.raw===null&&storage.getItem(OLD)!==base.legacy))throw Error('Profiles changed in another tab. Reload before saving; your existing data is preserved.');
 const normalized=normalize(next),raw=JSON.stringify(normalized);
 storage.setItem(KEY,raw);return {state:normalized,raw,legacy:base.legacy,blocked:false};
}
const nonempty=p=>Object.keys(fields).some(k=>p[k])||p.tasks.length>0||p.members.length>0;
function mergeProfile(existing,incoming,stats){
 for(const k of Object.keys(fields)){if(!existing[k]&&incoming[k]){existing[k]=incoming[k];stats.added++}else if(existing[k]&&incoming[k]&&existing[k]!==incoming[k])stats.conflicts++}
 for(const t of incoming.tasks){const old=existing.tasks.find(x=>x.text===t.text);if(old){if(old.done!==t.done)stats.conflicts++;continue}if(existing.tasks.length>=50)throw Error('Profile plan limit would be exceeded');existing.tasks.push({...t});stats.added++}
 for(const member of incoming.members){if(existing.members.includes(member))continue;if(existing.members.length>=40)throw Error('Profile roster limit would be exceeded');existing.members.push(member);stats.added++}
}
function merge(base,imported){
 const out=normalize(base),incoming=parse(imported),stats={added:0,conflicts:0};
 for(const p of incoming.crews){
  if(!nonempty(p)||out.crews.some(c=>JSON.stringify(c)===JSON.stringify(p)))continue;
  const empty=out.crews.findIndex(c=>!nonempty(c));
  if(empty>=0)out.crews[empty]=p;else{if(out.crews.length>=20)throw Error('Online crew limit would be exceeded');out.crews.push(p)}stats.added++;
 }
 for(const world of ['story','vi','other'])mergeProfile(out[world],incoming[world],stats);
 return {state:out,...stats};
}
const API=Object.freeze({KEY,OLD,worlds,blank,fresh,normalize,migrate,parse,current,read,write,merge});
if(typeof module==='object'&&module.exports)module.exports=API;
if(root)root.JuraCrewProfiles=API;
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id);
const ids={name:'crewName',tag:'crewTag',motto:'crewMotto',bio:'crewBio'};
let base;try{base=read(localStorage)}catch{base={state:fresh(),raw:null,legacy:null,blocked:true,error:'Storage unavailable'}}
const status=msg=>{$('crewStatus').textContent=msg};
function draft(){const next=normalize(base.state),p=current(next);for(const [k,id] of Object.entries(ids))p[k]=str($(id).value,fields[k]);return next}
function commit(next,msg='Saved locally on this device.'){try{base=write(localStorage,base,next);draw();status(msg);return true}catch(error){status(error.message);return false}}
function rows(list,items,kind){
 list.replaceChildren();
 items.forEach((item,i)=>{
  const li=document.createElement('li'),label=document.createElement('span'),remove=document.createElement('button');
  label.textContent=kind==='task'?item.text:item;
  if(kind==='task'){
   const check=document.createElement('input');check.type='checkbox';check.checked=item.done;check.setAttribute('aria-label','Completed: '+item.text);check.disabled=base.blocked;
   check.onchange=()=>{const next=draft();current(next).tasks[i].done=check.checked;if(!commit(next))check.checked=item.done};li.append(check);if(item.done)label.style.textDecoration='line-through';
  }
  remove.type='button';remove.textContent='Remove';remove.disabled=base.blocked;remove.setAttribute('aria-label','Remove '+label.textContent);
  remove.onclick=()=>{const next=draft();current(next)[kind==='task'?'tasks':'members'].splice(i,1);commit(next)};
  li.append(label,remove);list.append(li);
 });
}
function draw(){
 const s=base.state,p=current(s),online=s.world==='online';
 $('crewGame').value=s.world;$('crewSwitcher').hidden=!online;$('rosterSection').hidden=!online;
 $('profileHeading').textContent=online?'Crew identity':'Personal world profile';$('plansTitle').textContent=online?'Session plans':'Story goals and notes';
 const select=$('crewSelect');select.replaceChildren();
 s.crews.forEach((c,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=(c.name||'Unnamed crew')+' · '+(i+1);select.append(o)});
 select.value=String(s.activeCrew);$('deleteCrew').disabled=base.blocked||s.crews.length<2;$('newCrew').disabled=base.blocked||s.crews.length>=20;
 for(const [k,id] of Object.entries(ids))$(id).value=p[k];
 $('cardName').textContent=p.name||(online?'Your crew':'Your world profile');$('cardTag').textContent=p.tag||'YOUR TAG';$('cardGame').textContent=worlds[s.world];$('cardMotto').textContent=p.motto||'Many Crews. One Vision.';$('cardBio').textContent=p.bio||'Customize your personal workspace.';
 rows($('taskList'),p.tasks,'task');rows($('memberList'),p.members,'member');
 if(base.blocked){status('Existing profile storage cannot be read. Your original data was not changed.');$('crewForm').querySelector('button[type=submit]').disabled=true;$('crewGame').disabled=true;$('crewSelect').disabled=true;$('resetCrew').disabled=true;$('importCrew').disabled=true;$('taskForm').querySelector('button').disabled=true;$('rosterForm').querySelector('button').disabled=true;}
}
$('crewForm').onsubmit=e=>{e.preventDefault();commit(draft())};
$('crewGame').onchange=e=>{const next=draft();next.world=e.target.value;if(!commit(next))$('crewGame').value=base.state.world};
$('crewSelect').onchange=e=>{const next=draft();next.activeCrew=Number(e.target.value);if(!commit(next))$('crewSelect').value=String(base.state.activeCrew)};
$('newCrew').onclick=()=>{if(base.state.crews.length>=20)return;const next=draft();next.crews.push(blank());next.activeCrew=next.crews.length-1;if(commit(next))$('crewName').focus()};
$('deleteCrew').onclick=()=>{if(base.state.crews.length<2||!confirm('Delete only this Online crew and its local plans?'))return;const next=normalize(base.state);next.crews.splice(next.activeCrew,1);next.activeCrew=Math.min(next.activeCrew,next.crews.length-1);commit(next,'Selected Online crew deleted. Other profiles preserved.')};
$('taskForm').onsubmit=e=>{e.preventDefault();const next=draft(),p=current(next),value=$('taskInput').value.trim();if(!value)return;if(p.tasks.length>=50){status('This profile already has 50 plans.');return}p.tasks.push({text:str(value,140),done:false});if(commit(next))$('taskInput').value=''};
$('rosterForm').onsubmit=e=>{e.preventDefault();const next=draft(),p=current(next),value=$('memberInput').value.trim();if(next.world!=='online'||!value)return;if(p.members.length>=40){status('This crew already has 40 members.');return}if(p.members.includes(value)){status('This display name is already in your local roster.');return}p.members.push(str(value,40));if(commit(next))$('memberInput').value=''};
function download(body,name){const blob=new Blob([body],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('exportCrew').onclick=()=>{if(base.blocked){const raw=base.raw??base.legacy;if(raw!==null){download(raw,'team-jura-profile-recovery.json');$('backupStatus').textContent='Original unreadable data exported for recovery.'}else $('backupStatus').textContent='Profile storage is unavailable.';return}download(JSON.stringify(draft(),null,2),'team-jura-world-profiles.json');$('backupStatus').textContent='All-world local backup prepared.'};
$('importCrew').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>500000)throw Error('Backup too large');const result=merge(draft(),JSON.parse(await file.text()));if(!commit(result.state))throw Error('Storage unavailable or changed');$('backupStatus').textContent=result.added+' new profiles or entries; '+result.conflicts+' existing conflicts kept. Original backup unchanged.'}catch(error){$('backupStatus').textContent='Import not saved: '+error.message+'. Existing profiles preserved.'}finally{e.target.value=''}};
$('resetCrew').onclick=()=>{if(!confirm('Clear only this selected profile and its local plans? Other profiles and legacy backup remain.'))return;const next=normalize(base.state);if(next.world==='online')next.crews[next.activeCrew]=blank();else next[next.world]=blank();if(commit(next))$('backupStatus').textContent='Selected profile cleared. Other profiles preserved.'};
draw();
})(typeof globalThis!=='undefined'?globalThis:null);
