/* Atlas 10.1 · source-id deduplication unit tests (Node built-in). */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const engine=fs.readFileSync(require('node:path').resolve(__dirname,'../atlas.js'),'utf8');
const f=engine.match(/function uniqueSourceIds\(rows\)\{[\s\S]*?\n\}/);
assert.ok(f,'Actual Atlas identity helper must be present');
const unique=vm.runInNewContext('('+f[0]+')');
test('same source ID is shown once and later authorized source wins',()=>{
 const rows=[{id:'gtadb-5-L25',name:'old'},{id:'new-event',name:'Other'},{id:'gtadb-5-L25',name:'updated'}];
 const data=unique(rows);assert.deepEqual(Array.from(data,r=>r.name),['Other','updated']);
});
test('different IDs at the same coordinates stay distinct',()=>{
 const data=unique([{id:'gtadb-5-L2',x:1,y:2},{id:'online-event-7',x:1,y:2}]);
 assert.equal(data.length,2);
});
test('GTA V and GTA VI source keys never collide',()=>{
 const data=unique([{id:'gtadb-5-L2'},{id:'gtadb-6-L2'}]);assert.equal(data.length,2);
});
test('identity dedup does not mutate input or progress references',()=>{
 const a={id:'v-car',scope:'story'},b={id:'v-car',scope:'online'},rows=[a,b];
 assert.equal(unique(rows).length,1);
 assert.equal(rows.length,2);
 assert.equal(unique(rows.filter(r=>r.scope==='story'))[0],a);
 assert.equal(unique(rows.filter(r=>r.scope==='online'))[0],b);
});
