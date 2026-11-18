const assert = require('node:assert/strict');
const test = require('node:test');
const lab = require('../atlas98-data-lab.js');
const meta={sourceName:'Independent test',sourceUrl:'https://example.org/source',license:'CC-BY-4.0',game:'5',checkedAt:'2026-11-15T00:00:00Z'};
test('CSV supports quoted commas and newlines',()=>assert.deepEqual(lab.parse('name,x,y,category\n"Hill, West",5,6,places\n"Two\nLines",2,3,places','test.csv').map(x=>x.name),['Hill, West','Two\nLines']));
test('GeoJSON point features normalize correctly',()=>{const data=lab.parse(JSON.stringify({type:'FeatureCollection',features:[{type:'Feature',properties:{name:'Bridge',category:'landmark'},geometry:{type:'Point',coordinates:[10,20]}}]}));assert.equal(lab.validate(data,meta).usable[0].x,10)});
test('duplicates detected and excluded',()=>{const r=lab.validate([{name:'Shop',x:1,y:2,category:'store'},{name:'Shop',x:1,y:2,category:'store'}],meta);assert.equal(r.duplicates,1);assert.equal(r.usable.length,1)});
test('missing coordinates never pass',()=>assert.equal(lab.validate([{name:'Shop'}],meta).usable.length,0));
test('unknown rights block usable export',()=>assert.equal(lab.validate([{name:'Shop',x:1,y:2}],{...meta,license:'unknown'}).usable.length,0));
test('GTA VI stays provisional',()=>assert.equal(lab.validate([{name:'Mystery',x:1,y:2}],{...meta,game:'6'}).usable[0].verification,'provisional'));
test('CSV injection stays plain data',()=>assert.equal(lab.parse('name,x,y\n"=cmd",1,2','test.csv')[0].name,'=cmd'));
test('reject malformed CSV and oversized record counts',()=>{assert.throws(()=>lab.parse('a,b\n"bad,1','x.csv'));assert.throws(()=>lab.validate(new Array(25001),meta))});

test('Atlas pack exports compatible schema, online mode and provisional pins',()=>{
  const meta={license:'CC-BY-4.0',game:'online',coordinateSystem:'gta-world-xy',sourceName:'Test community',sourceUrl:'https://github.com/example/source',checkedAt:'2026-11-15T00:00:00Z'};
  const r=lab.validate([{id:'car-1',name:'Test Car',category:'vehicles',x:1,y:2}],meta);
  const p=lab.toAtlasPack(r,meta).pack;
  assert.equal(p.license,'CC BY 4.0');assert.equal(p.records[0].game,'5');assert.equal(p.records[0].scope,'online');assert.equal(p.records[0].category,'vehicle');assert.equal(p.records[0].uncertain,true);
});
test('Atlas map export blocks absent coordinate-system proof and unknown reuse rights',()=>{
  const meta={license:'CC-BY-4.0',game:'5',coordinateSystem:'unknown',sourceName:'Test',sourceUrl:'https://github.com/example/source'};
  const r=lab.validate([{name:'Test',category:'other',x:1,y:2}],meta);
  assert.throws(()=>lab.toAtlasPack(r,meta),/Confirm map-aligned/);
  assert.throws(()=>lab.toAtlasPack(r,{...meta,coordinateSystem:'gta-world-xy',license:'unknown'}),/license/);
  assert.throws(()=>lab.toAtlasPack(r,{...meta,coordinateSystem:'gta-world-xy',sourceUrl:''}),/HTTPS source/);
});
test('Atlas map export removes out-of-world coordinates rather than plotting them',()=>{
  const meta={license:'original',game:'5',coordinateSystem:'gta-world-xy',sourceName:'Team Jura test',sourceUrl:''};
  const r=lab.validate([{name:'Mapped',x:100,y:100},{name:'Off map',x:18000,y:0}],meta);
  const x=lab.toAtlasPack(r,meta);assert.equal(x.omitted,1);assert.equal(x.pack.records.length,1);
});
