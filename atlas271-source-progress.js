/* Source-specific guest progress. Never infer equivalence to guide slots or other editions. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.JuraSourceProgress=api})(typeof window==='undefined'?null:window,function(){'use strict';
const schema='team-jura-source-progress-v1';
function makeIndex(rows,identity){const ids=new Map();for(const row of rows){const key=identity(row);if(typeof key!=='string'||!key||ids.has(row.id))throw Error('Invalid objective identity');ids.set(row.id,key)}return ids}
function clean(raw,scope,revision,known){if(!raw||raw.schema!==schema||raw.scope!==scope||raw.revision!==revision||!Array.isArray(raw.done))throw Error('Wrong source, edition or backup schema');if(raw.done.some(x=>typeof x!=='string'||!known.has(x)))throw Error('Unknown or invalid objective; original data preserved');return [...new Set(raw.done)].sort()}
function merge(current,incoming,scope,revision,known){const next=clean(incoming,scope,revision,known);return [...new Set([...current.filter(x=>known.has(x)),...next])].sort()}
function create(w,opts){
 const {scope,revision,rows,identity,onChange,host,kind='found'}=opts,d=w.document,index=makeIndex(rows,identity),known=new Set(index.values()),key='team-jura-source-progress-v1:'+scope+':'+revision;
 const label=kind==='visited'?'visited':'found',make=(tag,text)=>{const node=d.createElement(tag);if(text!==undefined)node.textContent=text;return node};
 let done=new Set(),pending=new Map(),blocked='',rawRecovery=null;
 const payload=()=>({schema,scope,revision,done:[...done].sort()});
 // Always re-read the actual saved bytes before a mutation, including another tab's changes.
 // Quota-failed edits remain an in-memory delta; never overwrite valid newer unrelated marks.
 function refresh(){let raw=null;try{raw=w.localStorage.getItem(key);const latest=new Set(raw===null?[]:clean(JSON.parse(raw),scope,revision,known));for(const [id,value] of pending)value?latest.add(id):latest.delete(id);done=latest;blocked='';rawRecovery=null;return true}catch(error){blocked=raw===null?'Storage cannot be read. Editing is paused.':'Saved source progress is unreadable or incompatible. Original bytes are preserved.';rawRecovery=raw;return false}}
 function persist(){if(blocked)return false;try{w.localStorage.setItem(key,JSON.stringify(payload()));pending.clear();return true}catch{return false}}
 const panel=make('section');panel.className='j271-source-progress';panel.setAttribute('aria-label','Independent source progress');
 const header=make('strong','Source-specific '+label+' progress'),counter=make('p'),help=make('p','Only this source and edition. These marks do not change your older numbered guide checklist or verify a location.');
 const warning=make('p');warning.className='j400-source-warning';warning.setAttribute('role','alert');warning.hidden=true;
 const hideLabel=make('label'),hide=make('input');hide.type='checkbox';hideLabel.append(hide,d.createTextNode(' Hide '+label+' locations'));
 const actions=make('div');actions.className='j240-controls';const exportButton=make('button','Export source progress');exportButton.type='button';const rawButton=make('button','Download original unreadable source progress');rawButton.type='button';rawButton.hidden=true;const importLabel=make('label','Merge source progress'),input=make('input');input.type='file';input.accept='.json,application/json';importLabel.append(input);actions.append(exportButton,importLabel,rawButton);
 const status=make('p');status.setAttribute('role','status');panel.append(header,counter,help,warning,hideLabel,actions,status);const list=host.querySelector('ol');if(list)list.before(panel);else host.append(panel);
 const isDone=row=>done.has(index.get(row.id)),visible=row=>!hide.checked||!isDone(row);
 function sync(){warning.hidden=!blocked;warning.textContent=blocked+(blocked&&pending.size?' Unsaved working edits can still be exported separately.':'');rawButton.hidden=rawRecovery===null;input.disabled=!!blocked;exportButton.disabled=!!blocked&&!pending.size;counter.textContent=(blocked?'Last readable working state · ':'')+done.size+' / '+known.size+' '+label+(kind==='visited'?' reference destinations':' source objectives')}
 function update(){sync();onChange()}
 function set(row,value){const id=index.get(row.id);if(!known.has(id))return;if(!refresh()){status.textContent='Edit refused; saved bytes unchanged.';update();return}if(value)done.add(id);else done.delete(id);pending.set(id,value);const ok=persist();status.textContent=ok?'Saved on this device.':'Storage unavailable; export your working progress.';update()}
 function button(row){const wasDone=isDone(row),b=make('button',wasDone?'✓ '+label:'Mark '+label);b.type='button';b.className='j271-mark';b.disabled=!!blocked;b.setAttribute('aria-pressed',String(wasDone));b.setAttribute('aria-label',(wasDone?'Unmark ':'Mark '+label+' ')+row.name);b.onclick=()=>set(row,!wasDone);return b}
 function download(content,name,type){const a=make('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
 hide.onchange=update;
 exportButton.onclick=()=>{refresh();if(!blocked||pending.size)download(JSON.stringify(payload(),null,2),'team-jura-'+scope+'-source-progress.json','application/json');update()};
 rawButton.onclick=()=>{refresh();if(rawRecovery!==null)download(rawRecovery,'team-jura-'+scope+'-unreadable-source-progress.txt','text/plain;charset=utf-8');update()};
 input.onchange=async()=>{const file=input.files?.[0];input.value='';if(!file)return;try{if(file.size>100000)throw Error('Backup too large');const raw=JSON.parse(await file.text());if(!refresh())throw Error('Current save unreadable; download original bytes first');const previous=done.size;for(const id of clean(raw,scope,revision,known)){if(!done.has(id)){done.add(id);pending.set(id,true)}}const ok=persist();status.textContent=(done.size-previous)+' source objective(s) added. Existing marks kept.'+(ok?'':' Storage unavailable; export your progress.');update()}catch(error){status.textContent='Restore refused: '+error.message;update()}};
 const onStorage=e=>{if(e.key===key||e.key===null){refresh();update()}};w.addEventListener('storage',onStorage);
 refresh();sync();
 return {isDone,visible,button,set,update,hasUnsaved:()=>pending.size>0,dispose(){w.removeEventListener('storage',onStorage);panel.remove()}};
}
return Object.freeze({schema,makeIndex,clean,merge,create});
});
