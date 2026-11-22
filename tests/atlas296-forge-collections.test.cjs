'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {collect,vehicleLink}=require('../atlas263-forge-collections.js');

const stores={
 v:{schema:1,builds:{sultan:{model:'sultan',paint:'#ffbb33',name:'Studio V'}},variants:{}},
 vi:{schema:1,builds:{vi_squalo:{model:'vi_squalo',paint:'#2288aa',name:'Leonida Boat'}},variants:{}},
 garage:{schema:1,vehicles:{
  adder:{studioName:'Adder Echo',paint:'#123456',garage:'Downtown',note:'Private: do not put in link'},
  jetmax:{paint:'#aabbcc',note:'Watercraft concept'},
  sultan:{studioBody:'auto',studioDesign:{lights:true},paint:'Graphite',secondary:'Midnight'},
  bison:{paint:'Graphite',secondary:'Midnight'},
  bati:{paint:'Graphite',secondary:'Midnight'},
  vi_squalo:{studioName:'Wrong world',paint:'#ff0000'}
 }},
 owned:{schema:1,owned:{'vehicles5:adder':true,'vehicles5:bison':true,'vehicles5:jetmax':false},wishlist:{},note:{}},
 story:null,online:null,viArmory:null
};
const before=JSON.stringify(stores);
const rows=collect(stores);
assert.equal(JSON.stringify(stores),before,'Forge collection projection must be read-only');
const garage=rows.filter(x=>x.kind==='garage');
assert.equal(garage.length,4,'Show two owned and two unowned saved Garage designs');
assert.deepEqual(new Set(garage.map(x=>x.model)),new Set(['adder','jetmax','sultan','bison']));
assert.equal(garage.filter(x=>x.model==='adder').length,1,'Owned + saved model must not duplicate');
assert.match(garage.find(x=>x.model==='adder').detail,/marked owned/i);
assert.match(garage.find(x=>x.model==='jetmax').detail,/not marked owned/i);
assert.match(garage.find(x=>x.model==='sultan').detail,/not marked owned/i);
assert.equal(garage.find(x=>x.model==='bison').detail,'Marked owned in My Garage');
assert.equal(garage.find(x=>x.model==='adder').title,'Adder Echo');
assert(!garage.some(x=>x.model==='bati'||x.model==='vi_squalo'),'Do not invent an unsaved build or cross world');
assert(garage.every(x=>x.href==='./atlas93-garage.html?addModel='+encodeURIComponent(x.model)));
assert(!rows.some(x=>x.href.includes('Private')||x.href.includes('Watercraft%20concept')),'Share only model identity');
assert.equal(rows.filter(x=>x.kind==='vehicle'&&x.world==='v').length,1);
assert.equal(rows.filter(x=>x.kind==='vehicle'&&x.world==='vi').length,1,'VI concept remains world-isolated');
assert.equal(vehicleLink('vi','vi_squalo','My Look'),'./atlas-vehicle-configurator.html?world=vi&model=vi_squalo&source=collection');
assert(!rows.some(x=>x.href.includes('#variant=')||x.href.includes('Studio%20V')||x.href.includes('My%20Look')));
const titled=collect({v:{schema:1,builds:{},variants:{sultan:[{model:'sultan',name:'Family private nickname',paint:'#cc11aa'}]}}});
assert.equal(titled[0].href,'./atlas-vehicle-configurator.html?model=sultan&source=collection');
assert.equal(titled[0].privateVariant.name,'Family private nickname');
assert(!titled[0].href.includes('Family'));

// Garage-only saved builds must appear even without any ownership collection.
const only=collect({garage:{schema:1,vehicles:{jetmax:{note:'Saved boat'}}}}, {});
assert.equal(only.length,1);
const legacy=collect({garage:{vehicles:{adder:{garage:'Main Garage'}}},owned:{schema:1,owned:{'vehicles5:adder':true}}}, {});
assert.equal(legacy.length,1,'Legacy schema-less Garage records remain readable');
assert.equal(legacy[0].subtitle,'Main Garage');
assert.equal(collect({garage:{schema:999,vehicles:{adder:{note:'unsupported'}}}},{}).length,0,'Explicit unknown schema remains unsupported');
assert.equal(only[0].model,'jetmax');
assert.match(only[0].detail,/not marked owned/);

// Bad model identities or malformed vehicle records must not become entries.
const bad=collect({garage:{schema:1,vehicles:{jetmax:null,vi_cheetah95:{note:'VI in wrong world'},'__proto__':{note:'bad'}}}}, {});
assert.equal(bad.length,0);

const html=fs.readFileSync(path.resolve(__dirname,'../atlas-forge-collections.html'),'utf8');
assert.match(html,/Garage builds &amp; marked-owned vehicles/);
assert.match(html,/Saved Garage designs appear even when you have not marked the vehicle owned/);
console.log('Atlas 29.6 Forge collections: saved/owned identity, VI separation and privacy passed');
