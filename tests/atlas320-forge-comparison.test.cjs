'use strict';
/* Atlas 32.0 · no invented game models, no mutation, no private URL leakage. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {collect,compareFields}=require('../atlas263-forge-collections.js');
const stores={
 v:{schema:1,builds:{
  sultan:{model:'sultan',name:'Primary Sultan',paint:'#c95c22',body:'sports',
    design:{finish:'metallic',environment:'city',accent:'#aa77cc',stance:'low',lights:true},note:'never publish this note'},
  adder:{model:'adder',name:'Primary Adder',paint:'#335588',body:'standard',design:{finish:'satin'}}
 },variants:{sultan:[
  {model:'sultan',name:'Private Weekend',paint:'#4499aa',body:'auto',note:'Family private data',design:{finish:'stealth',stance:'raised',lights:false,kit:'sport'}},
  {model:'sultan',name:'Track Night',paint:'#1100ff',body:'sports',note:'hidden',design:{kit:'track',accent:'#d4a222'}}
 ]}},
 vi:{schema:1,builds:{vi_squalo:{model:'vi_squalo',name:'Leonida Concept',paint:'#0078ab',body:'auto'}},variants:{}},
 garage:{schema:1,vehicles:{jetmax:{note:'Boat personal note'}}}
};
const before=JSON.stringify(stores);
const rows=collect(stores);
assert.equal(JSON.stringify(stores),before,'Reading a comparison must never modify stored objects');
const cars=rows.filter(x=>x.kind==='vehicle');
assert.equal(cars.length,5,'Three Sultan concepts, one separate GTA V model, one VI craft');
const sultans=cars.filter(x=>x.model==='sultan');
const primary=sultans.find(x=>x.compare.kind==='primary');
const weekend=sultans.find(x=>x.title==='Private Weekend');
const track=sultans.find(x=>x.title==='Track Night');
assert.equal(new Set(sultans.map(x=>x.compare.key)).size,3,'Each named saved design is independently selectable');
assert.equal(primary.compare.finish,'metallic');
assert.equal(weekend.compare.paint,'#4499aa');
assert.equal(weekend.compare.lights,'Off');
assert.equal(weekend.compare.environment,'Not saved');
assert.equal(primary.compare.note,undefined,'Private notes are never copied into comparison descriptors');
assert(!cars.some(x=>x.href.includes('Private')||x.href.includes('Track%20Night')));
const fields=compareFields(primary.compare,weekend.compare);
assert.deepEqual(fields.find(x=>x[0]==='Paint'),['Paint','paint','#c95c22','#4499aa']);
assert.deepEqual(fields.find(x=>x[0]==='Concept lighting'),['Concept lighting','lights','On','Off']);
assert(fields.some(x=>x[0]==='Ride height'));
assert(!fields.some(x=>x[0]==='Aero / deck styling'),'Omit settings absent from both designs');
assert.equal(compareFields(weekend.compare,weekend.compare),null,'Cannot compare a design with itself');
assert.equal(compareFields(primary.compare,cars.find(x=>x.model==='adder').compare),null,'Only compare the same vehicle');
assert.equal(compareFields(primary.compare,cars.find(x=>x.world==='vi').compare),null,'Never merge GTA V and VI identity');
assert.deepEqual(compareFields(weekend.compare,track.compare).find(x=>x[0]==='Surface finish'),['Surface finish','finish','stealth','Not saved']);
const html=fs.readFileSync(path.join(__dirname,'../atlas-forge-collections.html'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../atlas320-forge-compare.css'),'utf8');
const code=fs.readFileSync(path.join(__dirname,'../atlas263-forge-collections.js'),'utf8');
for(const token of ['forgeComparePanel','forgeCompareStatus','forgeCompareBody','forgeCompareClear'])assert.equal(html.split('id="'+token+'"').length-1,1,token);
assert(html.includes('atlas320-forge-compare.css?v=320'));
assert(css.includes('.fc-compare[hidden]'));
assert(code.includes('aria-pressed')&&code.includes('compareFields'));
assert(!code.includes('localStorage.setItem'),'Comparison hub must not write stored collection data');
assert(!code.includes('history.pushState')&&!code.includes('history.replaceState'),'Comparison selections must not become URL state');
assert.equal(JSON.stringify(stores),before);
console.log('Atlas 32.0 Forge saved-design comparison: 5 concepts, same-model boundaries, read-only/privacy contracts passed');
