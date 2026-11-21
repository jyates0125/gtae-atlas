/* Team Jura Atlas 9.6 · Individual parked vehicles, built on top of My Garage 9.3.
 * Multiple copies per model, user-specified garage capacities, JSON backup, and
 * 9.0 model ownership integration. Separate save key avoids destructive migrations. */
(()=>{'use strict';
if(!/atlas93-garage\.html$/i.test(location.pathname))return;
const $=id=>document.getElementById(id),KEY='team-jura-atlas96-parking-v1';
const OWN='team-jura-atlas90-collection-v1',LEGACY='team-jura-atlas93-garage-v1',ARCHIVE='team-jura-atlas93-archive-v1';
const node=(type,cls,str)=>{const n=document.createElement(type);if(cls)n.className=cls;if(str!==undefined)n.textContent=str;return n};
const parse=(key,other)=>{try{const obj=JSON.parse(localStorage.getItem(key)||'null');return obj&&typeof obj==='object'&&!Array.isArray(obj)?obj:other}catch{return other}};
const clean=(x,n=90)=>String(x??'').replace(/[\u0000-\u001F]/g,' ').trim().slice(0,n);
const validModel=x=>typeof x==='string'&&/^[a-z0-9_]{1,65}$/.test(x);
const saved=parse(KEY,{schema:1,slots:[],capacities:{}});
const state={schema:1,slots:Array.isArray(saved.slots)?saved.slots:[],capacities:saved.capacities&&typeof saved.capacities==='object'&&!Array.isArray(saved.capacities)?saved.capacities:{}};
state.slots=state.slots.filter(s=>s&&validModel(s.model)&&typeof s.id==='string'&&s.id.length<=90).slice(0,4000).map(s=>({...s,garage:clean(s.garage,56),floor:clean(s.floor,32),bay:clean(s.bay,32),plate:clean(s.plate,20),notes:clean(s.notes,900)}));
const knownModels=new Set(),names=new Map();
let selectedGarage='',search='',importInput=null;
function persist(next=state){try{localStorage.setItem(KEY,JSON.stringify({...next,updated:new Date().toISOString()}));return true}catch{status('Browser storage unavailable. Export your records before closing.');return false}}
function garages(){const raw=parse(LEGACY,{garages:['Main Garage']});return [...new Set(['Main Garage',...(Array.isArray(raw.garages)?raw.garages:[])].filter(x=>typeof x==='string').map(x=>clean(x,56)).filter(Boolean))].slice(0,40)}
function status(text){const target=$('j96-message');if(target)target.textContent=text}
function options(select,values,selected){select.replaceChildren();for(const [name,label] of values)select.add(new Option(label,name));if(values.some(x=>x[0]===selected))select.value=selected}
function initModels(seed){for(const model of seed?.vehicles||[])if(validModel(model))knownModels.add(model);
 const c=parse(ARCHIVE,{ids:[]});for(const model of c.ids||[])if(validModel(model))knownModels.add(model);
 const models=[...knownModels].sort();const model=$('j96-model');model.replaceChildren();for(const m of models){names.set(m,m.replace(/_/g,' ').replace(/\b[a-z]/g,ch=>ch.toUpperCase()));model.add(new Option(names.get(m)+' · '+m,m))}
 const wanted=new URL(location.href).searchParams.get('addModel');if(validModel(wanted)&&knownModels.has(wanted)){
  model.value=wanted;status('Selected '+names.get(wanted)+'. Choose a garage and press Park another vehicle. Existing model ownership stays unchanged.');
 }
 render();}
function report(){const stats=$('j96-count');if(stats)stats.textContent=state.slots.length+' parked instances · '+new Set(state.slots.map(s=>s.model)).size+' distinct models';}
function addGarageOpts(){const gs=garages();for(const id of ['j96-garage','j96-filter-garage','j96-cap-garage']){
 const el=$(id);if(!el)continue;const current=el.value;let vals=gs.map(g=>[g,g]);if(id==='j96-garage')vals.unshift(['','Unassigned']);if(id==='j96-filter-garage')vals.unshift(['','All garages']);options(el,vals,current);
 }
}
function render(){addGarageOpts();report();const gs=garages(),g=$('j96-filter-garage').value;
 const capName=$('j96-cap-garage').value||gs[0];const capacity=Number(state.capacities[capName]||10);$('j96-capacity').value=capacity;
 const used=state.slots.filter(s=>s.garage===capName).length;$('j96-occupancy').textContent=capName+': '+used+' / '+capacity+' planned spaces';
 $('j96-occupancy').classList.toggle('j96-warning',used>capacity);$('j96-meter-fill').style.width=Math.min(100,(used/Math.max(1,capacity))*100)+'%';
 const rows=state.slots.filter(s=>(!g||s.garage===g)&&(!search||[s.model,names.get(s.model)||'',s.garage,s.plate,s.notes,s.bay].join(' ').toLowerCase().includes(search)));
 const root=$('j96-ledger');root.replaceChildren();if(!rows.length)root.append(node('p','','No parked vehicle instances in this view. Add a car to start your parking ledger.'));
 const cap=150;for(const [i,s] of rows.slice(0,cap).entries()){
  const row=node('article','j96-row');const label=node('div');label.append(node('strong','',names.get(s.model)||s.model),node('small','',(s.garage||'Unassigned')+' · '+[s.floor,s.bay,s.plate].filter(Boolean).join(' · ')+(s.notes?' · '+s.notes:'')));
  const actions=node('div','j96-row-actions');const edit=node('button','','Edit');edit.type='button';edit.onclick=()=>{for(const [id,value] of [['j96-model',s.model],['j96-garage',s.garage],['j96-floor',s.floor],['j96-bay',s.bay],['j96-plate',s.plate],['j96-note',s.notes]])if($(id))$(id).value=value;
    $('j96-cancel').hidden=false;$('j96-save').dataset.editId=s.id;$('j96-save').textContent='Save parking record';$('j96-form').scrollIntoView({behavior:'smooth',block:'nearest'});status('Editing '+s.model+'. Changes are saved only when you press Save parking record.');};
  const del=node('button','','Remove');del.type='button';del.onclick=()=>{if(!confirm('Remove this parked instance? Model ownership and your 9.3 garage remain intact.'))return;state.slots=state.slots.filter(x=>x.id!==s.id);persist();render();status('Parked instance removed. Original model ownership preserved.');};actions.append(edit,del);row.append(label,actions);root.append(row)
 }
 if(rows.length>cap)root.append(node('p','j96-warning','Showing '+cap+' of '+rows.length+' matching instances. Refine search or export your records.'));
}
function download(payload,name){const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=node('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000)}
function park(){const m=$('j96-model').value;
 if(!validModel(m)||!knownModels.has(m)){status('Choose a model from the local vehicle catalog.');return}
 const entry={model:m,garage:clean($('j96-garage').value,56),floor:clean($('j96-floor').value,32),bay:clean($('j96-bay').value,32),plate:clean($('j96-plate').value,20),notes:clean($('j96-note').value,900)};
 if(entry.garage&&!garages().includes(entry.garage)){status('Choose a garage from your existing Garage Manager.');return}
 const id=$('j96-save').dataset.editId;
 const nextSlots=state.slots.slice();
 if(id){
  const at=nextSlots.findIndex(slot=>slot.id===id);
  if(at<0){status('This parking record is unavailable. Cancel the edit to start another.');return}
  nextSlots[at]={...nextSlots[at],...entry};
 }else{
  if(nextSlots.length>=4000){status('Parking is full. Remove a record before adding another.');return}
  const next=globalThis.crypto?.randomUUID?.()||'local-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
  nextSlots.push({...entry,id:next,added:new Date().toISOString()});
 }
 if(!persist({...state,slots:nextSlots}))return;
 state.slots=nextSlots;
 delete $('j96-save').dataset.editId;
 $('j96-save').textContent='Park another vehicle';$('j96-cancel').hidden=true;
 // Sync aggregate model ownership but NEVER delete it when removing a parking instance.
 const gallery=parse(OWN,{schema:1,owned:{},wishlist:{},note:{}});if(!gallery.owned||typeof gallery.owned!=='object')gallery.owned={};gallery.owned['vehicles5:'+m]=true;
 try{const json=JSON.stringify({...gallery,schema:1,updated:new Date().toISOString()});localStorage.setItem(OWN,json);window.dispatchEvent(new StorageEvent('storage',{key:OWN,newValue:json}));}catch{render();status('Parking record saved. Model ownership could not be saved on this device.');return}
 render();status('Saved a '+(names.get(m)||m)+' instance. Garage and model ownership are recorded locally.');
}
function legacyImport(){const old=parse(LEGACY,{vehicles:{}}),rows=Object.entries(old.vehicles||{}).filter(([id,r])=>validModel(id)&&r&&typeof r==='object'&&typeof r.garage==='string'&&r.garage&&knownModels.has(id));
 const incoming=rows.filter(([m])=>!state.slots.some(s=>s.legacyKey===m));if(!incoming.length){status('No new legacy garage assignments need importing.');return}
 if(!confirm('Copy '+incoming.length+' previously assigned model records into individual parking spaces? Your 9.3 garage entries will remain unchanged.'))return;
 for(const [m,r] of incoming){state.slots.push({id:globalThis.crypto?.randomUUID?.()||'migrated-'+m,model:m,garage:garages().includes(r.garage)?r.garage:'',floor:'',bay:'',plate:clean(r.plate,20),notes:clean(r.note,900),legacyKey:m,added:new Date().toISOString()})}
 persist();render();status('Imported '+incoming.length+' previous garage assignments without removing the originals.');
}
function setup(){const main=document.querySelector('main.layout');if(!main)return;const root=node('section');root.id='j96-parking';root.setAttribute('aria-label','Individual vehicle parking and garages');
 const heading=node('div');heading.append(node('div','j96-kicker','ELARIO STUDIOS · TEAM JURA · GARAGE INTELLIGENCE'),node('h2','','My parking slots · individual vehicles'),node('p','','Keep separate copies of the same model in different garages, choose floor/bay labels, plan garage capacity and maintain private backups. Slot capacities are your own planning figures—not verified GTA Online property limits.'));
 root.append(heading);const grid=node('div','j96-grid');root.append(grid);
 const form=node('section','j96-form');form.id='j96-form';form.append(node('h3','','Park or customize a vehicle instance'));
 const fields=node('div','j96-form-fields');const add=(labelText,id,kind,max)=>{const label=node('label','',labelText);const input=node(kind||'input');input.id=id;if(max)input.maxLength=max;label.append(input);fields.append(label);return input};
 const model=add('GTA V / Online model','j96-model','select');const garage=add('Garage location','j96-garage','select');const floor=add('Floor / level','j96-floor','input',32);floor.placeholder='B2 / Floor 1';const bay=add('Bay / parking spot','j96-bay','input',32);bay.placeholder='Spot 07';const plate=add('Plate / personal ID','j96-plate','input',20);plate.placeholder='Your label';const note=add('Build or parking notes','j96-note','textarea',900);note.rows=2;form.append(fields);
 const actions=node('div','j96-buttons');const save=node('button','j96-primary','Park another vehicle');save.id='j96-save';save.type='button';save.onclick=park;
 const migrate=node('button','','Copy earlier assignments');migrate.type='button';migrate.onclick=legacyImport;const exportButton=node('button','','↓ Export parking slots');exportButton.type='button';exportButton.onclick=()=>download({schema:1,app:'team-jura-atlas96-parking',exportedAt:new Date().toISOString(),slots:state.slots,capacities:state.capacities},'team-jura-atlas96-parking-backup.json');
 const importLabel=node('label','','↑ Import parking backup');importLabel.style.display='block';importInput=node('input');importInput.type='file';importInput.accept='.json,application/json';importLabel.append(importInput);
 const cancel=node('button','','Cancel edit');cancel.id='j96-cancel';cancel.type='button';cancel.hidden=true;
 cancel.onclick=()=>{
  delete save.dataset.editId;save.textContent='Park another vehicle';cancel.hidden=true;
  for(const field of [garage,floor,bay,plate,note])field.value='';
  model.focus();status('Parking edit discarded.');
 };
 actions.append(save,cancel,migrate,exportButton,importLabel);form.append(actions);
 const message=node('p','j96-message','Parking is local to this browser. Export before clearing device data.');message.id='j96-message';message.setAttribute('role','status');form.append(message);grid.append(form);
 const ledger=node('section','j96-ledger');ledger.append(node('h3','','Garage occupancy & parking ledger'));
 const capFields=node('div','j96-form-fields');const capLabel=node('label','','Garage');const capGarage=node('select');capGarage.id='j96-cap-garage';capLabel.append(capGarage);
 const capacityLabel=node('label','','Planned capacity');const capacity=node('input');capacity.type='number';capacity.min='1';capacity.max='500';capacity.id='j96-capacity';capacityLabel.append(capacity);capFields.append(capLabel,capacityLabel);ledger.append(capFields);
 const occupancy=node('p','j96-count','');occupancy.id='j96-occupancy';const meter=node('div','j96-meter');const fill=node('span');fill.id='j96-meter-fill';meter.append(fill);ledger.append(occupancy,meter);
 const capButton=node('button','','Save planned capacity');capButton.type='button';capButton.onclick=()=>{const n=Number(capacity.value);if(!Number.isInteger(n)||n<1||n>500){status('Capacity must be between 1 and 500.');return}const g=capGarage.value;if(!g)return;state.capacities[g]=n;persist();render();status('Planned capacity updated for '+g+'.')};ledger.append(capButton);
 const filterLabel=node('label','','View garage');const filter=node('select');filter.id='j96-filter-garage';filter.onchange=render;filterLabel.append(filter);
 const queryLabel=node('label','','Find parked vehicle');const query=node('input');query.type='search';query.placeholder='Model, plate, garage, bay…';query.oninput=()=>{search=query.value.trim().toLowerCase();render()};queryLabel.append(query);ledger.append(filterLabel,queryLabel);
 const count=node('p','j96-count','Loading saved parking instances…');count.id='j96-count';const list=node('div');list.id='j96-ledger';ledger.append(count,list);grid.append(ledger);main.append(root);
 capGarage.onchange=render;
 importInput.onchange=async()=>{const file=importInput.files?.[0];if(!file)return;try{if(file.size>2_000_000)throw Error('File exceeds 2MB');const data=JSON.parse(await file.text());if(data?.app!=='team-jura-atlas96-parking'||data.schema!==1||!Array.isArray(data.slots)||data.slots.length>4000)throw Error('Unrecognized parking backup');
  const rows=data.slots.filter(s=>s&&typeof s.id==='string'&&s.id.length<=90&&validModel(s.model)).map(s=>({id:s.id,model:s.model,garage:clean(s.garage,56),floor:clean(s.floor,32),bay:clean(s.bay,32),plate:clean(s.plate,20),notes:clean(s.notes,900),added:clean(s.added,40)}));
  if(!confirm('Merge '+rows.length+' valid parked instances into this browser? Existing instance IDs are preserved.'))return;
  const used=new Set(state.slots.map(s=>s.id));let inserted=0;for(const r of rows){if(used.has(r.id)||state.slots.length>=4000)continue;used.add(r.id);state.slots.push(r);inserted++}
  if(data.capacities&&typeof data.capacities==='object')for(const [k,v] of Object.entries(data.capacities)){if(k.length<=56&&Number.isInteger(v)&&v>=1&&v<=500)state.capacities[k]=v}
  persist();render();status('Imported '+inserted+' new parking instances. Earlier garage and catalog records remain intact.');
 }catch(err){status('Import failed: '+err.message)}finally{importInput.value=''}};
 const nativeList=$('garageList');if(nativeList)new MutationObserver(()=>{const g=garage.value;const gs=garages();if(gs.includes(g)||g==='')addGarageOpts()}).observe(nativeList,{childList:true,subtree:true});
 fetch('./atlas90-seed.json').then(r=>{if(!r.ok)throw Error('Catalog HTTP '+r.status);return r.json()}).then(initModels).catch(err=>status('Vehicle catalog unavailable: '+err.message));render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
