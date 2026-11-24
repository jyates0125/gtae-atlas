/* Team Jura Atlas Passport — local-only, exportable completion counts. */
(()=>{'use strict';const KEY='team-jura-passport-v74';const worlds=[
{id:'iii',name:'GTA III',where:'Liberty City',goals:[['Hidden packages',100]]},
{id:'vc',name:'GTA Vice City',where:'Vice City',goals:[['Hidden packages',100]]},
{id:'lcs',name:'Liberty City Stories',where:'Liberty City, 1998',goals:[['Hidden packages',100]]},
{id:'sa',name:'GTA San Andreas',where:'San Andreas',goals:[['Gang tags',100],['Snapshots',50],['Horseshoes',50],['Oysters',50]]},
{id:'iv',name:'GTA IV',where:'Liberty City',goals:[['Flying rats (pigeons)',200],['Stunt jumps',50]]},
{id:'tlad',name:'The Lost and Damned',where:'Liberty City',goals:[['Seagulls',50]]},
{id:'tbogt',name:'The Ballad of Gay Tony',where:'Liberty City',goals:[['Seagulls',50]]},
{id:'ctw',name:'Chinatown Wars',where:'Liberty City',goals:[['Security cameras',100]]},
{id:'vcs',name:'Vice City Stories',where:'Vice City',goals:[['Red balloons',99]]},
{id:'v',name:'GTA V',where:'Los Santos & Blaine County',goals:[['Spaceship parts',50],['Letter scraps',50],['Stunt jumps',50]]},
{id:'online',name:'GTA Online',where:'Los Santos Online',goals:[['Action figures',100],['Playing cards',54],['Signal jammers',50]]},
{id:'vi',name:'GTA VI',where:'Leonida · awaiting verified goals',goals:[]}
];const root=document.getElementById('passportWorlds');if(!root)return;const $=id=>document.getElementById(id);let state={};try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');if(v&&typeof v==='object'&&!Array.isArray(v))state=v}catch{};const key=(w,goal)=>w.id+'__'+goal[0].toLowerCase().replace(/[^a-z0-9]+/g,'-');const clamp=(v,n)=>Math.min(n,Math.max(0,Number.isFinite(+v)?Math.floor(+v):0));const stored=(id,n)=>clamp(state[id]||0,n);function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{$('passportMessage').textContent='Storage is unavailable. Export a backup to retain your progress.';return false}}
function text(tag,value,cls){const e=document.createElement(tag);e.textContent=value;if(cls)e.className=cls;return e}
/* Passport is a manual aggregate; copying from a real classic checklist is an
 * explicit one-way, one-goal operation. Never overwrite unknown/corrupt raw data. */
function latestPassport(){
 let raw;
 try{raw=localStorage.getItem(KEY);if(raw===null)return {};
  const parsed=JSON.parse(raw);return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:null;
 }catch{return null}
}
function saveOne(id,max,value){
 const latest=latestPassport();
 if(!latest){$('passportMessage').textContent='Passport save refused: existing local Passport data could not be read. No stored bytes changed. Export your original data before repair.';return false}
 const next={...latest,[id]:clamp(value,max)};
 try{localStorage.setItem(KEY,JSON.stringify(next));state=next;return true}
 catch{$('passportMessage').textContent='Passport save unavailable. Your other device records were not changed.';return false}
}
function classicEvidence(world,goal){
 const bridge=window.JuraPassportBridge;
 if(!bridge||!Object.hasOwn(bridge.LINKED,world)||bridge.LINKED[world]!==goal)return null;
 let raw;
 try{raw=localStorage.getItem(bridge.key(world))}
 catch{return {status:'unavailable',url:bridge.link(world,goal)}}
 return bridge.read(world,goal,window.TeamJuraClassicCollections?.[world],raw);
}
function addClassicBridge(item,world,goal,max,value,id){
 const evidence=classicEvidence(world.id,goal[0]);if(!evidence)return;
 const line=text('div','', 'j323-passport-bridge'),msg=text('p','', 'j323-passport-status');
 if(evidence.status==='saved')msg.textContent='Classic checklist on this device: '+evidence.count+' / '+evidence.total+' recorded slots. Passport: '+value+' / '+max+'.';
 else if(evidence.status==='empty')msg.textContent='No saved classic checklist in this browser yet. Passport count is independent.';
 else if(evidence.status==='damaged')msg.textContent='Classic checklist cannot be read safely. Open its workspace to download the original raw save before changing it.';
 else msg.textContent='Linked checklist evidence is unavailable; Passport manual count remains unchanged.';
 line.append(msg);
 if(evidence.url){
  const open=text('a','Open exact checklist');open.href=evidence.url;line.append(open);
 }
 if(evidence.status==='saved'&&evidence.total===max&&evidence.count!==value){
  const copy=text('button','Use saved checklist count');
  copy.type='button';copy.setAttribute('aria-label','Copy '+world.name+' '+goal[0]+' checklist count to Passport');
  copy.addEventListener('click',()=>{
   const current=classicEvidence(world.id,goal[0]);
   if(!current||current.status!=='saved'||current.total!==max||current.count!==evidence.count){
    $('passportMessage').textContent='Checklist changed or became unreadable. Reload the current counts before copying; no data was changed.';render();return;
   }
   const previous=latestPassport();
   if(!previous){$('passportMessage').textContent='Passport saved bytes cannot be read. No changes made.';return}
   const from=clamp(previous[id]||0,max);
   if(!confirm('Copy '+current.count+' / '+max+' recorded '+world.name+' '+goal[0]+' slots into Passport? Current Passport count '+from+' will be replaced. Your original classic checklist and other games remain unchanged.'))return;
   if(saveOne(id,max,current.count)){render();$('passportMessage').textContent=world.name+' '+goal[0]+' Passport count updated from its saved local checklist. Source progress was not changed.'}
  });
  line.append(copy);
 }
 item.append(line);
}

function render(){const q=($('passportSearch')?.value||'').trim().toLowerCase();root.replaceChildren();let done=0,total=0,items=0,goalCount=0;worlds.forEach(w=>{const card=document.createElement('article');card.className='passport-world';const heading=text('h3',w.name);card.append(text('small',w.where,'passport-place'),heading);const goals=w.goals.filter(g=>!q||(`${w.name} ${w.where} ${g[0]}`).toLowerCase().includes(q));if(!goals.length){if(!w.goals.length&&(!q||(`${w.name} ${w.where}`).toLowerCase().includes(q))){card.append(text('p','Awaiting independently verified collectible totals. No invented progress goals.','passport-empty'))}else return}
 goals.forEach(goal=>{const id=key(w,goal),max=goal[1],value=stored(id,max);const item=document.createElement('div');item.className='passport-goal';const info=document.createElement('div');info.className='passport-goal-head';info.append(text('span',goal[0]),text('span',`${value} / ${max}`));const bar=document.createElement('div');bar.className='passport-progress';bar.setAttribute('role','progressbar');bar.setAttribute('aria-label',w.name+' '+goal[0]);bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax',String(max));bar.setAttribute('aria-valuenow',String(value));const fill=document.createElement('span');fill.style.width=`${100*value/max}%`;bar.append(fill);const controls=document.createElement('div');controls.className='passport-controls';const minus=text('button','−','passport-step');minus.type='button';minus.setAttribute('aria-label','Decrease '+goal[0]);minus.disabled=value===0;const input=document.createElement('input');input.type='number';input.min='0';input.max=String(max);input.step='1';input.value=String(value);input.setAttribute('aria-label',w.name+' '+goal[0]+' collected');const plus=text('button','+','passport-step');plus.type='button';plus.setAttribute('aria-label','Increase '+goal[0]);plus.disabled=value===max;const apply=(v)=>{if(!saveOne(id,max,v))return;const focus=document.activeElement===input;render();if(focus){const replacement=root.querySelector(`[data-goal="${id}"] input`);replacement?.focus()}};minus.addEventListener('click',()=>apply(value-1));plus.addEventListener('click',()=>apply(value+1));input.addEventListener('change',()=>apply(input.value));controls.append(minus,input,plus);item.dataset.goal=id;item.append(info,bar,controls);addClassicBridge(item,w,goal,max,value,id);card.append(item)});root.append(card)});worlds.forEach(w=>w.goals.forEach(g=>{const n=stored(key(w,g),g[1]);items+=n;total+=g[1];goalCount++;done+=(n===g[1]?1:0)}));$('passportTotalWorlds').textContent=String(worlds.length);$('passportStamps').textContent=String(done)+' / '+goalCount;$('passportOverall').textContent=total?Math.round(100*items/total)+'%':'0%';$('passportCollected').textContent=items.toLocaleString();if(!root.children.length)root.append(text('p','No matching world or goal. Try a different search.','passport-empty'))}
window.addEventListener('storage',event=>{if(event.key===KEY||event.key?.startsWith('team-jura-atlas98b-items-')){const current=latestPassport();if(current)state=current;render()}});
window.addEventListener('pageshow',()=>{const current=latestPassport();if(current)state=current;render()});
$('passportSearch')?.addEventListener('input',render);
$('passportExport')?.addEventListener('click',()=>{const output={app:'Team Jura Atlas Passport',version:1,exportedAt:new Date().toISOString(),progress:state};const blob=new Blob([JSON.stringify(output,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='team-jura-atlas-passport.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000);$('passportMessage').textContent='Passport backup downloaded.'});
$('passportImport')?.addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>250000)throw Error('The backup file is too large.');const v=JSON.parse(await f.text());if(v.app!=='Team Jura Atlas Passport'||v.version!==1||!v.progress||typeof v.progress!=='object'||Array.isArray(v.progress))throw Error('This is not a Team Jura Passport backup.');const next={};for(const w of worlds)for(const g of w.goals){const id=key(w,g);if(Object.hasOwn(v.progress,id))next[id]=clamp(v.progress[id],g[1])}state=next;save();render();$('passportMessage').textContent='Passport restored successfully.'}catch(err){$('passportMessage').textContent=err.message||'Unable to read backup.'}e.target.value='' });
$('passportReset')?.addEventListener('click',()=>{if(confirm('Reset all Passport counts stored in this browser? Export a backup first if you want to keep them.')){state={};save();render();$('passportMessage').textContent='Passport counts reset.'}});render()})();
