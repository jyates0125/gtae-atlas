'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {createRepository}=require('../atlas140-cloud-saves.js');

function fake(options={}){
 const actions=[];
 const auth={getUser:async()=>options.unauthorized?{data:{user:null}}:{data:{user:{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'}}}};
 function chain(op){
  const entry={op,fields:[]};actions.push(entry);
  const q={
   select(v){entry.fields.push(['select',v]);return q},
   eq(k,v){entry.fields.push(['eq',k,v]);return q},
   insert(v){entry.fields.push(['insert',v]);return q},
   update(v){entry.fields.push(['update',v]);return q},
   delete(){entry.fields.push(['delete']);return q},
   async maybeSingle(){return options.missing?{data:null,error:null}:{data:{namespace:'garage',revision:2,payload:{}},error:null}},
   async single(){return {data:{namespace:'garage',revision:1,payload:{}},error:null}}
  };return q;
 }
 return {client:{auth,from:table=>{assert.equal(table,'atlas_saves');return chain('query')}},actions};
}
test('SQL-like input is data, never a query or namespace',async()=>{
 const f=fake(),repo=createRepository(f.client);
 for(const s of ["' OR 1=1 --",'1+1=True','garage; DROP TABLE atlas_saves;','garage OR TRUE']) {
  await assert.rejects(()=>repo.read(s),{code:'INVALID_NAMESPACE'});
 }
 assert.equal(f.actions.length,0);
});
test('No cloud operation without a verified authenticated user',async()=>{
 const f=fake({unauthorized:true}),repo=createRepository(f.client);
 await assert.rejects(()=>repo.read('garage'),{code:'NOT_AUTHENTICATED'});
 await assert.rejects(()=>repo.create('garage',{cars:[]}),{code:'NOT_AUTHENTICATED'});
});
test('Queries always bind authenticated user and namespace as structured values',async()=>{
 const f=fake(),repo=createRepository(f.client);
 await repo.read('garage');
 const filters=f.actions[0].fields;
 assert.deepEqual(filters.filter(x=>x[0]==='eq'),[['eq','user_id','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'],['eq','namespace','garage']]);
});
test('Updates require revision match and never trust a supplied user id',async()=>{
 const f=fake(),repo=createRepository(f.client);
 await repo.update('garage',{user_id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',cars:[]},1);
 const fields=f.actions[0].fields;
 assert.ok(fields.some(x=>x[0]==='eq'&&x[1]==='revision'&&x[2]===1));
 assert.ok(fields.some(x=>x[0]==='eq'&&x[1]==='user_id'&&x[2]==='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'));
 assert.equal(fields.find(x=>x[0]==='update')[1].revision,2);
});
test('Outdated writes and deletes fail rather than overwrite',async()=>{
 const f=fake({missing:true}),repo=createRepository(f.client);
 await assert.rejects(()=>repo.update('garage',{},4),{code:'CONFLICT'});
 await assert.rejects(()=>repo.remove('garage',4),{code:'CONFLICT'});
});
test('Only small object payloads are accepted',async()=>{
 const f=fake(),repo=createRepository(f.client);
 await assert.rejects(()=>repo.create('garage','hello'),{code:'INVALID_PAYLOAD'});
 await assert.rejects(()=>repo.create('garage',{huge:'x'.repeat(132000)}),{code:'INVALID_PAYLOAD'});
 await assert.rejects(()=>repo.update('garage',{},0),{code:'INVALID_REVISION'});
});
test('Creating a cloud record binds owner to current authenticated session',async()=>{
 const f=fake(),repo=createRepository(f.client);
 await repo.create('garage',{cars:[]});
 assert.deepEqual(f.actions[0].fields.find(x=>x[0]==='insert')[1],{
 user_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',namespace:'garage',schema_version:1,payload:{cars:[]},revision:1
 });
});
