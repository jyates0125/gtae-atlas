/* Source-specific guest progress. Never infer equivalence to guide slots or other editions. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.JuraSourceProgress=api})(typeof window==='undefined'?null:window,function(){'use strict';
const schema='team-jura-source-progress-v1';
function makeIndex(rows,identity){const ids=new Map();for(const row of rows){const key=identity(row);if(typeof key!=='string'||!key)throw Error('Invalid objective identity');ids.set(row.id,key)}return ids}
function clean(raw,scope,revision,known){if(!raw||raw.schema!==schema||raw.scope!==scope||raw.revision!==revision||!Array.isArray(raw.done))throw Error('Wrong source, edition or backup schema');return [...new Set(raw.done.filter(x=>typeof x==='string'&&known.has(x)))].sort()}
function merge(current,incoming,scope,revision,known){const next=clean(incoming,scope,revision,known);return [...new Set([...current.filter(x=>known.has(x)),...next])].sort()}
function create(w,opts){
 const {scope,revision,rows,identity,onChange,host,kind='found'}=opts,d=w.document,index=makeIndex(rows,identity),known=new Set(index.values()),key='team-jura-source-progress-v1:'+scope+':'+revision;
 const label=kind==='visited'?'visited':'found',make=(tag,text)=>{const node=d.createElement(tag);if(text!==undefined)node.textContent=text;return node};
 let done=new Set(),unsaved=false;
 const payload=()=>({schema,scope,revision,done:[...done].sort()});
 function refresh(){if(unsaved)return;try{const raw=w.localStorage.getItem(key);done=new Set(raw?clean(JSON.parse(raw),scope,revision,known):[])}catch{}}
 function persist(){try{w.localStorage.setItem(key,JSON.stringify(payload()));unsaved=false;return true}catch{unsaved=true;return false}}
 const panel=make('section');panel.className='j271-source-progress';panel.setAttribute('aria-label','Independent source progress');
 const header=make('strong','Source-specific '+label+' progress'),counter=make('p'),help=make('p','Only this source and edition. These marks do not change your older numbered guide checklist or verify a location.');
 const hideLabel=make('label'),hide=make('input');hide.type='checkbox';hideLabel.append(hide,d.createTextNode(' Hide '+label+' locations'));
 const actions=make('div');actions.className='j240-controls';const exportButton=make('button','Export source progress');exportButton.type='button';const importLabel=make('label','Merge source progress'),input=make('input');input.type='file';input.accept='.json,application/json';importLabel.append(input);actions.append(exportButton,importLabel);
 const status=make('p');status.setAttribute('role','status');panel.append(header,counter,help,hideLabel,actions,status);host.append(panel);
 const isDone=row=>done.has(index.get(row.id)),visible=row=>!hide.checked||!isDone(row);
 function update(){counter.textContent=done.size+' / '+known.size+' '+label+(kind==='visited'?' reference destinations':' source objectives');onChange()}
 function set(row,value){refresh();const id=index.get(row.id);if(!known.has(id))return;if(value)done.add(id);else done.delete(id);const ok=persist();status.textContent=ok?'Saved on this device.':'Storage unavailable; export your working progress.';update()}
 function button(row){const b=make('button',isDone(row)?'✓ '+label:'Mark '+label);b.type='button';b.className='j271-mark';b.setAttribute('aria-pressed',String(isDone(row)));b.setAttribute('aria-label',(isDone(row)?'Unmark ':'Mark '+label+' ')+row.name);b.onclick=()=>set(row,!isDone(row));return b}
 hide.onchange=update;
 exportButton.onclick=()=>{refresh();const a=make('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload(),null,2)],{type:'application/json'}));a.download='team-jura-'+scope+'-source-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
 input.onchange=async()=>{const file=input.files?.[0];input.value='';if(!file)return;try{if(file.size>100000)throw Error('Backup too large');const raw=JSON.parse(await file.text());refresh();const previous=done.size;done=new Set(merge([...done],raw,scope,revision,known));const ok=persist();status.textContent=(done.size-previous)+' source objective(s) added. Existing marks kept.'+(ok?'':' Storage unavailable; export your progress.');update()}catch(error){status.textContent='Restore refused: '+error.message}};
 w.addEventListener('storage',e=>{if(e.key===key||e.key===null){refresh();update()}});
 refresh();counter.textContent=done.size+' / '+known.size+' '+label+(kind==='visited'?' reference destinations':' source objectives');
 return {isDone,visible,button,set,update};
}
return Object.freeze({schema,makeIndex,clean,merge,create});
});