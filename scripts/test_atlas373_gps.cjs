'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),Core=require('../atlas-road-core.js');
const p=(name,x,y)=>({name,x,y});
const A=p('A',0,0),B=p('B',100,100),X=p('X',90,90),Y=p('Y',10,0);
assert.deepEqual(Core.nearestOrder([A,X,Y,B]),[A,Y,X,B]);
assert.deepEqual(Core.nearestOrder([A,B]),[A,B]);
const graph=Core.validateGraph({version:1,game:'5',units:'gta-world',nodes:[{id:'a',x:0,y:0},{id:'b',x:0,y:100},{id:'c',x:100,y:100},{id:'d',x:200,y:100}],edges:[{from:'a',to:'b',name:'North Road',length:110,oneway:true},{from:'b',to:'c',name:'East Road',length:120},{from:'c',to:'d',name:'East Road',length:130}]});
const from=p('Start',-10,0),to=p('Finish',210,100),r=Core.route([from,to],graph),steps=Core.instructions(r,[from,to]);
assert.equal(r.method,'road-graph');assert.equal(r.drivingVerified,false);
assert.deepEqual(steps.map(s=>s.kind),['connector','graph','graph','connector','arrival']);
assert.match(steps[2].label,/Turn right onto East Road/);assert.equal(steps[2].length,250);
assert.equal(steps.reduce((a,s)=>a+s.length,0),r.length);
assert.equal(Core.shortest(graph,p('c',100,100),A),null);
const mixed=Core.route([A,B,p('Far',9000,9000)],graph);assert.equal(mixed.method,'mixed');assert.match(Core.instructions(mixed,[A,B,p('Far',9000,9000)]).at(-1).label,/Direct line/);
assert.match(Core.instructions(Core.route([A,B]),[A,B])[0].label,/Direct line northeast/);
assert.equal(Core.turn(p('',0,0),p('',0,100),p('',-100,100)),'Turn left');
for(const f of ['atlas.html','atlas-online.html','atlas-vi.html']){const s=fs.readFileSync(f,'utf8');assert.match(s,/atlas-road-core\.js\?v=382/);assert.match(s,(f==='atlas-vi.html' ? /atlas-navigation\.js\?v=382"/ : /atlas-navigation\.js\?v=47301"/));assert.match(s,/Nearest next · keep A\/B/)}
console.log('Atlas 37.3 GPS core checks passed');
