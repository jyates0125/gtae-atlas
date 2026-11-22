'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const api=require('../atlas298-heist-map-kit.js');
const focus=fs.readFileSync(path.resolve(__dirname,'../atlas167-heist-focus.js'),'utf8');
const loader=fs.readFileSync(path.resolve(__dirname,'../heist-pages.js'),'utf8');
const html=fs.readFileSync(path.resolve(__dirname,'../heist-kortz-center.html'),'utf8');
const points=[
 {id:'m0',name:'Approach',category:'entry'},
 {id:'m1',name:'Recon',category:'intel'},
 {id:'m2',name:'Vault',category:'objective'},
 {id:'m3',name:'Getaway',category:'exit'}
];
assert.deepEqual(api.categories.recon,['intel','prep']);
assert.deepEqual(api.categories.finale,['entry','objective','loot','exit']);
assert.equal(Object.keys(api.categories).length,3);
assert.equal(api.schema,'teamjura-heist-map-transfer-v1');
const empty=api.readState(null);
assert.deepEqual(empty,{schema:1,scoped:[],route:[],awards:[]});
for(const bad of ['{invalid','[]','"test"','{"route":"not-an-array"}','{"scoped":[12]}','{"awards":{}}']){
 assert.throws(()=>api.readState(bad),'Existing map corruption must fail closed');
}
const original={schema:1,route:['m1','m-old'],scoped:['m3'],awards:['a2'],note:'old metadata'};
const snapshot=JSON.stringify(original);
const transfer=api.makeTransfer('diamond-casino',{
 route:['m2','m0','m2','bogus'],scoped:['m2','m3'],awards:['a1','a99']
},points,5);
assert.equal(transfer.heist,'diamond-casino');
assert.equal(transfer.quality,'illustrative, not georeferenced');
assert.deepEqual(transfer.route,['m2','m0']);
assert.deepEqual(transfer.awards,['a1']);
assert(!JSON.stringify(transfer).includes('"x"')&&!JSON.stringify(transfer).includes('"y"'),
 'Exports must not imply georeferenced map positions');
const merged=api.mergeTransfer(original,transfer,'diamond-casino',points,5);
assert.deepEqual(merged.record.route,['m1','m-old','m2','m0'],
 'Existing route, even historical points, comes before missing imported stops');
assert.deepEqual(merged.record.scoped,['m3','m2']);
assert.deepEqual(merged.record.awards,['a2','a1']);
assert.deepEqual(merged.added,{route:2,scoped:1,awards:1});
assert.equal(merged.record.note,'old metadata');
assert.equal(JSON.stringify(original),snapshot,'Inputs must stay unmodified');
assert.equal(api.mergeTransfer(merged.record,transfer,'diamond-casino',points,5).changed,false,
 'Importing same backup twice must not rewrite saved metadata');
const wrong={...transfer,heist:'fleeca'};
assert.throws(()=>api.mergeTransfer(original,wrong,'diamond-casino',points,5),/not a mission map backup/);
for(const invalid of [
 {...transfer,version:2},{...transfer,route:[] .concat(Array.from({length:151},()=> 'm0'))},
 {...transfer,route:['m1',42]},{...transfer,scoped:'bad'},{...transfer,awards:[null]}
])assert.throws(()=>api.mergeTransfer(original,invalid,'diamond-casino',points,5));
assert(merged.record.route.indexOf('m-old')===1,'Never discard old saved map IDs');

assert.match(focus,/if\(advancedRoutes\)window\.teamJuraHeistManifest/,'Map manifest is only published for non-Cayo');
assert.match(loader,/heistId!=='cayo-perico'/,'Do not add phase map to Cayo flagship');
assert.match(loader,/atlas298-heist-map-kit\.js/);
assert.match(loader,/atlas298-heist-map-kit\.css/);
assert.match(focus,/2525o93834o413\/the-kortz-center-heist-now-available-in-gta-online/,
 'Kortz reference must link to official release announcement');
assert.match(focus,/Art Studio planning and prep gear/);
assert.match(html,/data-heist="kortz-center"/);
const ids=[...focus.matchAll(/"(fleeca|prison-break|humane-labs|series-a|pacific-standard|doomsday-act-[123]|diamond-casino|cayo-perico|cluckin-bell|salvage-yard|auto-shop|agency-vip|kortz-center)":\{"title":/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,15,'Retain 15 independent mission maps');

/* Atlas 31.4: merged backups cannot silently exceed the on-disk 150-ID format. */
const manyPoints=Array.from({length:150},(_,i)=>({id:'m'+i,name:'Point '+i,category:'entry'}));
const olderRoute=Array.from({length:149},(_,i)=>'retired-'+i);
const older={schema:1,route:olderRoute,scoped:olderRoute.slice(),awards:olderRoute.slice(),note:'KEEP'};
const largeBackup={schema:api.schema,version:1,heist:'fleeca',
 route:manyPoints.map(x=>x.id),scoped:manyPoints.map(x=>x.id),
 awards:Array.from({length:150},(_,i)=>'a'+i)};
const bounded=api.mergeTransfer(older,largeBackup,'fleeca',manyPoints,150);
assert.deepEqual(bounded.added,{route:1,scoped:1,awards:1});
assert.equal(bounded.skipped,447);
assert.deepEqual(bounded.record.route.slice(0,149),olderRoute,'Historical route order must survive');
assert.deepEqual(bounded.record.route.slice(-1),['m0']);
for(const field of ['route','scoped','awards'])assert.equal(bounded.record[field].length,150);
assert.equal(api.readState(JSON.stringify(bounded.record)).note,'KEEP',
 'Capacity-safe restored record must remain readable and keep metadata');
assert.equal(api.mergeTransfer(bounded.record,largeBackup,'fleeca',manyPoints,150).changed,false,
 'A full valid saved list must not be rewritten on repeated import');
assert.equal(JSON.stringify(older),JSON.stringify({schema:1,route:olderRoute,scoped:olderRoute.slice(),awards:olderRoute.slice(),note:'KEEP'}));
assert.match(focus,/if\(id!=='cayo-perico'\)/,'Do not change Cayo save contract');
assert.match(focus,/older\[k\]\.length>150/,'Refuse writes over a damaged mission map save');

console.log('Atlas 29.8 + 31.4 passed: 15 unique maps; 14 non-Cayo phase interfaces; safe map backup contract, historical IDs, official Kortz source');
