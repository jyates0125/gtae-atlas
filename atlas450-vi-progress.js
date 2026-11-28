/* Independent launch-week progress counts. No map coordinates or Rockstar account connection. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else if(root){root.JuraVIActivity=api;api.start(root)}})(typeof window==='undefined'?null:window,function(){'use strict';
const rows=Object.freeze([["stunt-jumps","Stunt jumps",130,null,"Stunts"],["bridges","Under the bridges",202,null,"Stunts"],["knife-flights","Knife flights",40,null,"Stunts"],["base-jumps","BASE jumps",25,null,"Stunts"],["races","Unique races",40,30,"Sports & challenges"],["race-medals","Race challenge golds",13,10,"Sports & challenges"],["drone-trials","Top Fun drone time trials",42,42,"Sports & challenges"],["basketball","Basketball hoops",100,90,"Sports & challenges"],["pool","Pool opponents",7,5,"Sports & challenges"],["mini-golf","Mini golf courses",3,2,"Sports & challenges"],["golf","Full-size golf courses",2,null,"Sports & challenges"],["arcades","Video games",4,4,"Sports & challenges"],["range-medals","Shooting range gold medals",42,42,"Sports & challenges"],["challenges","Challenges",80,70,"Sports & challenges"],["target-decks","Bret’s target decks",15,15,"Sports & challenges"],["fish","Fish species",35,null,"Discovery"],["cards","Complete card sets",18,15,"Exploration"],["card-items","Individual collectible cards",480,null,"Exploration"],["waink","WAiNK location scans",108,100,"Exploration"],["underwater","Underwater discoveries",33,33,"Exploration"],["kenton","Kenton treasure sets",7,5,"Exploration"],["reading","Magazines, books & comics",34,30,"Exploration"],["meditation","Meditation spots",18,15,"Exploration"],["flamingos","Cocaine Flamingos",125,100,"Exploration"],["playlists","Unique playlists",2,2,"Exploration"],["styles","Discovered styles",79,70,"Exploration"],["street-art","Ahol street art",112,null,"Exploration"],["murals","1010 murals",5,null,"Exploration"],["base-vehicles","Base vehicle scans",277,200,"Discovery"],["standout-vehicles","Standout vehicles",280,null,"Discovery"],["standard-weapons","Standard weapon finds",66,50,"Discovery"],["weapon-variants","Weapon variants",130,null,"Discovery"],["animals","Animals studied",255,100,"Discovery"]].map(r=>Object.freeze(r)));
const venues=Object.freeze([["King Gator Adventure Golf","Buckskin Swamp","Mini golf"],["Frontier Adventure Golf","Waning Sands","Mini golf"],["Dino Golf Challenge","Frogswater","Mini golf"],["Leaf Links Golf Challenge","Leaf Links","Golf"],["Mount Hailes Golf Challenge","Mount Hailes Club, Waning Sands","Golf"],["The Rusty Anchor","Key Lento","Pool"],["Skeeter’s","Hamlet","Pool"],["Zotico’s","Baslero","Pool"],["The Thirsty Wolf","Belville","Pool"],["Jacob’s Tavern","Milport","Pool"],["Delights Cabaret","Port Gellhorn","Pool"],["Kowaachobee Cafe & Bar","Buckskin Swamp","Pool"]].map(r=>Object.freeze(r)));
const arcadeGames=Object.freeze([["Tenebrae Lux","Home JoySystem · Chapters 1 and 3 onward"],["Street Trash III","Home JoySystem · Chapters 1 and 3 onward"],["Time Jackers Rewind","Home JoySystem · Chapters 1 and 3 onward"],["Bang For Your Buck","Arcade cabinets · e.g. Bargain World, Port Gellhorn"]].map(r=>Object.freeze(r)));
const KEY='team-jura-vi-activity-counts-v1',PROFILE=/^vj-[a-f0-9]{32}$/,byId=new Map(rows.map(r=>[r[0],r]));
function key(profile=null){if(profile===null)return KEY;if(typeof profile!=='string'||!PROFILE.test(profile))throw Error('Invalid playthrough');return KEY+':'+profile}
function clean(raw,profile=null){
 key(profile);const result={schema:1,...(profile===null?{}:{profile}),counts:Object.create(null)};
 if(raw===null)return result;
 if(!raw||raw.schema!==1||(profile===null?Object.hasOwn(raw,'profile'):raw.profile!==profile)||!raw.counts||typeof raw.counts!=='object'||Array.isArray(raw.counts))throw Error('Invalid progress scope');
 for(const [id,value] of Object.entries(raw.counts)){
  const row=byId.get(id);if(!row||!Number.isInteger(value)||value<0||value>row[2])throw Error('Unknown or invalid count; original data retained');
  if(value)result.counts[id]=value;
 }
 return result;
}
function read(store,profile=null){const raw=store.getItem(key(profile));return {raw,state:clean(raw===null?null:JSON.parse(raw),profile)}}
function set(store,id,value,profile=null,expected){
 const row=byId.get(id);if(!row||!Number.isInteger(value)||value<0||value>row[2])throw Error('Invalid count');
 const k=key(profile),{raw,state}=read(store,profile),current=state.counts[id]||0;
 if(expected!==undefined&&current!==expected&&current!==value)throw Error('This count changed in another tab; retain or discard your draft explicitly');
 if(value)state.counts[id]=value;else delete state.counts[id];
 if(store.getItem(k)!==raw)throw Error('Concurrent update');store.setItem(k,JSON.stringify(state));return state;
}
function merge(store,incoming,profile=null){
 const candidate=clean(incoming,profile),{raw,state}=read(store,profile),k=key(profile);
 if(raw!==null){
  const same=Object.keys(candidate.counts).length===Object.keys(state.counts).length&&Object.keys(candidate.counts).every(id=>candidate.counts[id]===state.counts[id]);
  return {state,conflicts:same?0:1,added:0};
 }
 if(store.getItem(k)!==raw)throw Error('Concurrent update');
 store.setItem(k,JSON.stringify(candidate));return {state:candidate,conflicts:0,added:1};
}
function stunts(state){return rows.filter(r=>r[4]==='Stunts').reduce((n,r)=>n+(state.counts[r[0]]||0),0)}
function start(w){
 const d=w.document;
 function init(){
  const root=d.getElementById('j450-vi-progress');if(!root)return;
  const E=(tag,txt)=>{const el=d.createElement(tag);if(txt!==undefined)el.textContent=txt;return el};
  const profileEnabled=!!d.getElementById('viJourney')&&new URLSearchParams(w.location.search).get('mode')==='vi';
  const fragment='#activity-playthrough=',linked=profileEnabled&&w.location.hash.startsWith(fragment)?w.location.hash.slice(fragment.length):null;
  let invalid=linked!==null&&!PROFILE.test(linked),profile=invalid?null:linked,state=clean(null,profile),blocked=false,busy=false,rawRecovery=null;
  const drafts=new Map(),shell=E('details');shell.className='j450-progress';shell.append(E('summary','Leonida activities & discoveries'));if(!w.JuraAtlas85)shell.open=true;
  shell.append(E('p','Reported in-game Progress totals and 100% targets. Enter your own game counts; no account connection. These are selected completion requirements, not an overall percentage or a complete checklist.'));
  const select=E('select');select.id='j450-scope';select.setAttribute('aria-label','Activity count playthrough');
  const scopeNote=E('p');scopeNote.id='j450-scope-note';
  if(profileEnabled){const label=E('label','Activity count playthrough');label.append(select);shell.append(label,scopeNote)}
  else{const link=E('a','Choose a playthrough in Activity Intelligence');link.href='./atlas-activities.html?mode=vi';shell.append(E('p','Map counters use existing unassigned counts only.'),link)}
  const status=E('p');status.id='j450-status';status.setAttribute('role','status');
  const stunt=E('p');stunt.id='j450-stunts';
  const discard=E('button','Discard unsaved count edits');discard.type='button';discard.id='j450-discard';
  const recover=E('button','Download unreadable original counts');recover.type='button';recover.id='j450-recover';
  shell.append(stunt,status,discard,recover);
  const inputs=[];
  function refreshProfiles(){
   if(!profileEnabled)return true;
   let profiles=[];try{profiles=w.JuraVIJourney.read(w.localStorage).state.profiles}catch{}
   select.replaceChildren();const general=E('option','Unassigned · existing counts');general.value='';select.append(general);
   for(const p of profiles){const o=E('option',p.name);o.value=p.id;select.append(o)}
   const missing=profile!==null&&!profiles.some(p=>p.id===profile);
   if(missing){const o=E('option','Selected playthrough unavailable');o.value=profile;select.append(o)}
   if(invalid){const o=E('option','Invalid playthrough link');o.value='invalid';o.disabled=true;select.append(o)}
   select.value=invalid?'invalid':profile||'';
   scopeNote.textContent=invalid||missing?'Choose an available local playthrough or unassigned counts explicitly.': 'Choose independently of Discovery. Existing counts stay unassigned; no automatic transfer.';
   return !missing&&!invalid;
  }
  function buttons(){select.disabled=busy;discard.hidden=drafts.size===0;discard.disabled=busy;recover.hidden=rawRecovery===null;for(const {input} of inputs)input.disabled=blocked||busy;}
  function refresh(){
   const available=refreshProfiles();
   try{
    if(!available)throw Error('Playthrough unavailable');
    state=read(w.localStorage,profile).state;blocked=false;rawRecovery=null;
    for(const {id,input} of inputs)if(!drafts.has(id))input.value=String(state.counts[id]||0);
    stunt.textContent='Combined stunts: '+stunts(state)+' / 397 · 100% target 300; trophy target 250.';
   }catch{
    blocked=true;state=clean(null,profile);try{rawRecovery=invalid?null:w.localStorage.getItem(key(profile))}catch{rawRecovery=null}
    for(const {id,input} of inputs)if(!drafts.has(id))input.value='';
    stunt.textContent='Combined stunts: unavailable';
    status.textContent='Saved progress unavailable or unreadable; edits blocked. Original bytes retained.';
   }
   buttons();
  }
  async function save(id,input){
   if(blocked||busy)return;
   const selected=profile,draft=drafts.get(id)||{value:input.value,expected:state.counts[id]||0};drafts.set(id,draft);
   busy=true;buttons();
   try{
    const task=()=>{if(selected!==null&&!w.JuraVIJourney.read(w.localStorage).state.profiles.some(p=>p.id===selected))throw Error('Playthrough unavailable');return set(w.localStorage,id,draft.value===''?0:Number(draft.value),selected,draft.expected)};
    state=w.navigator.locks?.request?await w.navigator.locks.request(key(selected),task):task();
    drafts.delete(id);status.textContent='Saved on this device.';
   }catch(e){status.textContent='Could not save: '+e.message+'. Draft retained.'}
   finally{busy=false;refresh();}
  }
  for(const group of new Set(rows.map(r=>r[4]))){
   const section=E('details');section.append(E('summary',group));
   for(const [id,name,max,target] of rows.filter(r=>r[4]===group)){
    const label=E('label'),input=E('input');input.type='number';input.min='0';input.max=String(max);input.step='1';input.dataset.progressId=id;
    label.append(E('span',name+' · total '+max+(target===null?'':' · 100% target '+target)),input);section.append(label);inputs.push({id,input});
    input.oninput=()=>{drafts.set(id,{value:input.value,expected:drafts.get(id)?.expected??(state.counts[id]||0)});status.textContent='Unsaved count edit.';buttons()};
    input.onchange=()=>save(id,input);
   }
   shell.append(section)
  }
  select.onchange=()=>{
   if(busy||drafts.size){select.value=invalid?'invalid':profile||'';status.textContent='Save or discard unsaved count edits before switching playthroughs.';return;}
   profile=select.value||null;invalid=false;
   const url=new URL(w.location.href);if(profile)url.hash='activity-playthrough='+profile;else if(url.hash.startsWith(fragment))url.hash='';
   w.history.replaceState(w.history.state,'',url);status.textContent=profile?'Independent playthrough counts selected.':'Existing unassigned counts selected.';refresh();
  };
  if(profileEnabled)w.addEventListener('hashchange',()=>{
   const next=w.location.hash.startsWith(fragment)?w.location.hash.slice(fragment.length):null;
   if(busy||drafts.size){const url=new URL(w.location.href);url.hash=invalid?fragment.slice(1)+'invalid':profile?fragment.slice(1)+profile:'';w.history.replaceState(w.history.state,'',url);status.textContent='Save or discard unsaved count edits before switching playthroughs.';return;}
   invalid=next!==null&&!PROFILE.test(next);profile=invalid?null:next;status.textContent='Activity scope changed.';refresh();
  });
  discard.onclick=()=>{if(drafts.size&&w.confirm('Discard unsaved count edits? Saved progress is unchanged.')){drafts.clear();status.textContent='Unsaved counts discarded.';refresh()}};
  recover.onclick=()=>{if(rawRecovery===null)return;const a=E('a'),url=w.URL.createObjectURL(new w.Blob([rawRecovery],{type:'text/plain'}));a.href=url;a.download='gtae-leonida-original-counts.txt';d.body.append(a);a.click();a.remove();w.setTimeout(()=>w.URL.revokeObjectURL(url),2000)};
  const places=E('details');places.append(E('summary','Golf and pool location directory · 12 references'),E('p','Use the named area to search our map. Exact activity coordinates are not yet verified.'));
  for(const [name,area,type] of venues){const row=E('p');row.append(E('strong',name+' · '+type),E('span',' — '+area+' '));const a=E('a','Search map');a.href='./atlas-vi.html?search='+encodeURIComponent(name);row.append(a);places.append(row)}shell.append(places);
  const games=E('details');games.append(E('summary','Four playable video games'),E('p','Play each once for the reported completion requirement. Finish one for Stick Fiddler.'));for(const [name,location] of arcadeGames)games.append(E('p',name+' · '+location));shell.append(games);
  const source=E('a','Source notes');source.href='./atlas-credits.html#vi-activity-progress';shell.append(source);root.append(shell);
  function scope(){const world=w.JuraAtlas85?.state();root.hidden=world?world.game!=='6':new URLSearchParams(w.location.search).get('mode')!=='vi'}
  refresh();scope();d.addEventListener('jura:legend-updated',scope);w.addEventListener('jura:journey-changed',()=>{if(!busy)refresh()});w.addEventListener('storage',e=>{if(!busy&&(e.key===key(profile)||e.key===w.JuraVIJourney?.KEY||e.key===null))refresh()});
 }
 if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});else init()
}
return Object.freeze({rows,venues,arcadeGames,KEY,key,clean,read,set,merge,stunts,start});
});
