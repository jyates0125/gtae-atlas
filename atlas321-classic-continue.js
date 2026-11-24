/* Atlas 32.1: read-only classic completion pulse across the seven notebook worlds.
 * No collectible coordinates are generated and no save keys are written. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else if(root)api.start(root)})(typeof window==='undefined'?null:window,function(){'use strict';
const SCHEMA='team-jura-atlas98b-items-v1',IDS=['iii','vc','vcs','lcs','ctw','tlad','tbogt'];
const NAMES={iii:'GTA III',vc:'Vice City',vcs:'Vice City Stories',lcs:'Liberty City Stories',ctw:'Chinatown Wars',tlad:'The Lost and Damned',tbogt:'The Ballad of Gay Tony'};
const cleanObject=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const key=id=>'team-jura-atlas98b-items-'+id+'-v1';
const href=(id,set)=>'./map-hub.html?game='+encodeURIComponent(id)+'&collection='+encodeURIComponent(set);
function summarize(id,sets,raw){
 if(!IDS.includes(id)||!cleanObject(sets))return {status:'unavailable',sets:[]};
 let data=null;
 if(raw!==null&&raw!==undefined){
  try{data=JSON.parse(raw)}catch{return {status:'damaged',sets:[]}}
  if(!cleanObject(data)||data.schema!==SCHEMA||data.game!==id||!cleanObject(data.done))return {status:'damaged',sets:[]};
 }
 const rows=[];
 for(const [name,info] of Object.entries(sets)){
  if(!Number.isInteger(info?.count)||info.count<1||info.count>500)return {status:'unavailable',sets:[]};
  const entry=data?.done?.[name];
  if(entry!==undefined&&!Array.isArray(entry))return {status:'damaged',sets:[]};
  const found=new Set((entry||[]).filter(n=>Number.isInteger(n)&&n>=1&&n<=info.count));
  rows.push({name,done:found.size,total:info.count,href:href(id,name),edition:/\(PS2\)|\(PSP\)/.test(name)});
 }
 return {status:raw==null?'empty':'ready',sets:rows};
}
function start(w){
 const d=w.document,host=d.getElementById('j321ClassicRows'),state=d.getElementById('j321ClassicStatus');if(!host||!state)return;
 const collections=w.TeamJuraClassicCollections;if(!cleanObject(collections))return;
 const E=(tag,value)=>{const element=d.createElement(tag);if(value!==undefined)element.textContent=String(value);return element};
 function render(){
  host.replaceChildren();let hasProgress=0,damaged=0;
  for(const id of IDS){
   let raw=null,storageAvailable=true;
   try{raw=w.localStorage.getItem(key(id))}catch{storageAvailable=false}
   const result=storageAvailable?summarize(id,collections[id],raw):{status:'unavailable',sets:[]};
   const row=E('article');row.className='j321-world';row.dataset.game=id;
   const heading=E('h3',NAMES[id]),header=E('div');header.className='j321-world-header';
   header.append(heading);
   if(result.status==='damaged'||result.status==='unavailable'){
    if(result.status==='damaged')damaged++;
    header.append(E('span',result.status==='damaged'?'Saved data needs recovery':'Storage unavailable'));
    row.append(header,E('p',result.status==='damaged'?'Existing checklist bytes were not changed. Open this world to download the original before editing.':'Progress cannot be read here. Existing guest data is untouched.'));
    const open=E('a','Open '+NAMES[id]);open.href='./map-hub.html?game='+id;row.append(open);
    host.append(row);continue;
   }
   const done=result.sets.reduce((n,s)=>n+s.done,0),total=result.sets.reduce((n,s)=>n+s.total,0);
   if(done)hasProgress++;
   header.append(E('span',done+' / '+total+' personal checklist slots'));row.append(header);
   const ul=E('ul');ul.className='j321-sets';
   for(const set of result.sets){
    const li=E('li'),a=E('a',set.name+' · '+set.done+'/'+set.total);
    a.href=set.href;a.setAttribute('aria-label','Continue '+NAMES[id]+' · '+set.name+' · '+set.done+' of '+set.total+' slots complete');
    li.append(a);ul.append(li);
   }
   row.append(ul);host.append(row);
  }
  state.textContent=IDS.length+' classic destinations · '+hasProgress+' with saved checklist progress'+(damaged?' · '+damaged+' need recovery':'')+'. Local browser only; edition-specific checklists are counted separately, and these are not verified map locations.';
 }
 const refresh=d.getElementById('j321Refresh');if(refresh)refresh.addEventListener('click',render);
 w.addEventListener('pageshow',render);
 w.addEventListener('storage',e=>{if(!e.key||IDS.some(id=>key(id)===e.key))render()});
 render();
}
return Object.freeze({IDS,NAMES,key,href,summarize,start});
});
