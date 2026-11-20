'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {createTransfer,progressKeys,TransferError}=require('../atlas144-cloud-transfer.js');

function fixture(){
 const store=new Map(),records=new Map(),calls=[];
 const storage={
  getItem:k=>store.has(k)?store.get(k):null,
  setItem:(k,v)=>{calls.push(['local-write',k]);store.set(k,v)},
  removeItem:k=>{calls.push(['local-remove',k]);store.delete(k)}
 };
 const repository={
  read:async n=>{calls.push(['read',n]);return records.get(n)?structuredClone(records.get(n)):null},
  create:async(n,p)=>{calls.push(['create',n]);if(records.has(n))throw Error('duplicate');
   const row={namespace:n,payload:structuredClone(p),revision:1};records.set(n,row);return structuredClone(row)},
  update:async(n,p,rev)=>{calls.push(['update',n,rev]);const current=records.get(n);
   if(!current||current.revision!==rev)throw Error('conflict');
   const row={namespace:n,payload:structuredClone(p),revision:rev+1};records.set(n,row);return structuredClone(row)}
 };
 return {store,records,calls,storage,repository,transfer:createTransfer({repository,storage})};
}
test('no cloud or local changes occur on construction or inspection',async()=>{
 const f=fixture();const names=f.transfer.namespaces();
 assert.ok(names.includes('parking_ledger')&&names.includes('story_progress'));
 assert.deepEqual(f.calls,[]);assert.equal(f.store.size,0);
 const inspection=await f.transfer.inspect('story_progress');
 assert.equal(inspection.localExists,false);assert.equal(inspection.cloudExists,false);
 assert.deepEqual(f.calls,[['read','story_progress']]);
});
test('every upload and download requires explicit consent',async()=>{
 const f=fixture();f.store.set(progressKeys.story_progress,JSON.stringify({collected:['a']}));
 await assert.rejects(f.transfer.upload('story_progress',{mode:'create'}),{code:'CONSENT_REQUIRED'});
 await assert.rejects(f.transfer.download('story_progress',{overwriteLocal:true}),{code:'CONSENT_REQUIRED'});
 assert.equal(f.records.size,0);
 assert.equal(f.calls.length,0);
});
test('only approved progress namespaces can be transferred (SQL-like strings are harmless)',async()=>{
 const f=fixture();
 for(const name of ["' OR 1=1 --",'1+1=True','token','auth_session','__proto__','constructor']){
  await assert.rejects(f.transfer.inspect(name),{code:'UNSUPPORTED_NAMESPACE'});
  await assert.rejects(f.transfer.upload(name,{consent:true,mode:'create'}),{code:'UNSUPPORTED_NAMESPACE'});
 }
 assert.equal(f.calls.length,0);
});
test('first explicit upload creates one owner-repository record without changing guest data',async()=>{
 const f=fixture();const value=JSON.stringify({garage:['Adder'],notes:'My progress'});
 f.store.set(progressKeys.garage_details,value);
 const result=await f.transfer.upload('garage_details',{consent:true,mode:'create'});
 assert.equal(result.status,'created');
 assert.equal(f.records.get('garage_details').payload.value,value);
 assert.equal(f.records.get('garage_details').payload.localKey,progressKeys.garage_details);
 assert.equal(f.store.get(progressKeys.garage_details),value);
 await assert.rejects(f.transfer.upload('garage_details',{consent:true,mode:'create'}),{code:'CONFLICT'});
 assert.equal(f.records.get('garage_details').revision,1);
});
test('replacement is blocked until the exact reviewed remote revision is supplied',async()=>{
 const f=fixture(),name='parking_ledger';
 f.store.set(progressKeys[name],'{"slots":[1]}');
 await f.transfer.upload(name,{consent:true,mode:'create'});
 f.store.set(progressKeys[name],'{"slots":[2]}');
 const inspect=await f.transfer.inspect(name);
 assert.equal(inspect.needsDecision,true);assert.equal(inspect.cloudRevision,1);
 await assert.rejects(f.transfer.upload(name,{consent:true,mode:'replace'}),{code:'CONFLICT'});
 await assert.rejects(f.transfer.upload(name,{consent:true,mode:'replace',expectedRevision:2}),{code:'CONFLICT'});
 const updated=await f.transfer.upload(name,{consent:true,mode:'replace',expectedRevision:1});
 assert.equal(updated.status,'updated');assert.equal(f.records.get(name).revision,2);
 await assert.rejects(f.transfer.upload(name,{consent:true,mode:'replace',expectedRevision:1}),{code:'CONFLICT'});
});
test('remote progress cannot overwrite local without separate explicit overwrite permission',async()=>{
 const f=fixture(),name='collection_hq';
 f.store.set(progressKeys[name],'{"done":["before"]}');
 await f.transfer.upload(name,{consent:true,mode:'create'});
 f.store.set(progressKeys[name],'{"done":["after"]}');
 await assert.rejects(f.transfer.download(name,{consent:true}),{code:'LOCAL_CONFLICT'});
 assert.equal(f.store.get(progressKeys[name]),'{"done":["after"]}');
 const r=await f.transfer.download(name,{consent:true,overwriteLocal:true});
 assert.equal(r.status,'replaced');
 assert.equal(f.store.get(progressKeys[name]),'{"done":["before"]}');
});
test('unknown or malformed cloud record is rejected before local changes',async()=>{
 const f=fixture();f.store.set(progressKeys.passport,'{"level":7}');
 f.records.set('passport',{revision:1,payload:{format:'stranger',localKey:'password',value:'{}'}});
 await assert.rejects(f.transfer.download('passport',{consent:true,overwriteLocal:true}),{code:'REMOTE_FORMAT'});
 assert.equal(f.store.get(progressKeys.passport),'{"level":7}');
});
test('invalid and oversized local progress is never uploaded',async()=>{
 const f=fixture();f.store.set(progressKeys.map_routes,'not JSON');
 await assert.rejects(f.transfer.upload('map_routes',{consent:true,mode:'create'}),{code:'INVALID_LOCAL_PROGRESS'});
 f.store.set(progressKeys.map_routes,JSON.stringify({huge:'x'.repeat(120000)}));
 await assert.rejects(f.transfer.upload('map_routes',{consent:true,mode:'create'}),{code:'TOO_LARGE'});
 assert.equal(f.records.size,0);
});
test('cloud restore into an empty category is explicit and leaves other keys untouched',async()=>{
 const f=fixture();f.store.set(progressKeys.passport,'{"level":7}');
 f.store.set(progressKeys.story_progress,'{"found":[1]}');
 await f.transfer.upload('story_progress',{consent:true,mode:'create'});
 f.store.delete(progressKeys.story_progress);
 const restored=await f.transfer.download('story_progress',{consent:true});
 assert.equal(restored.status,'restored');
 assert.equal(f.store.get(progressKeys.story_progress),'{"found":[1]}');
 assert.equal(f.store.get(progressKeys.passport),'{"level":7}');
});
test('same local and cloud value is reported as already synchronized without another write',async()=>{
 const f=fixture();f.store.set(progressKeys.map_favorites,'{"places":["a"]}');
 await f.transfer.upload('map_favorites',{consent:true,mode:'create'});
 const before=f.calls.length;
 const s=await f.transfer.inspect('map_favorites');
 assert.equal(s.same,true);assert.equal(s.needsDecision,false);
 const result=await f.transfer.upload('map_favorites',{consent:true,mode:'replace',expectedRevision:1});
 assert.equal(result.status,'unchanged');assert.equal(f.records.get('map_favorites').revision,1);
 assert.equal(f.calls.slice(before).filter(c=>c[0]==='update').length,0);
});
