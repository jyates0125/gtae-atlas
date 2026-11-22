const assert = require('node:assert/strict');
const {plan,length,MAX_STOPS}=require('./atlas-route-core.js');
const S={x:0,y:0};
const r=plan(S,[{id:'d',x:40,y:0},{id:'b',x:10,y:0},{id:'c',x:20,y:0}]);
assert.deepEqual(r.stops.map(x=>x.id),['b','c','d']);
assert.equal(r.units,40);
assert.equal(length(S,r.stops),40);
const n=plan({x:100,y:100},[{id:'a',x:0,y:0},{id:'b',x:90,y:100}]);
assert.equal(n.stops[0].id,'b');
assert.equal(plan(S,[{id:'x',x:1,y:1},{id:'x',x:1,y:1},{id:'bad',x:NaN,y:1}]).stops.length,1);
const many=Array.from({length:500},(_,i)=>({id:'p'+i,x:i*10,y:0}));
const capped=plan(S,many);assert.equal(capped.stops.length,MAX_STOPS);assert.equal(capped.omitted,250);
const manual=plan(S,[{id:'a',x:20,y:0},{id:'b',x:0,y:10},{id:'c',x:20,y:10},{id:'d',x:0,y:20}]);
assert.ok(manual.units<=100);
assert.throws(()=>plan({x:NaN,y:0},[]));
console.log('Atlas 5.8 route core: 8 assertions groups passed');

// Endpoint-aware 2-opt must preserve the exact selected stops and never grow the path.
const {improveOrder}=require('./atlas-route-core.js');
const assertFixed=(origin,items,finish)=>{
 const before=length(origin,[...items,finish]);const saved=items.map(r=>r.id);
 const updated=improveOrder(origin,items,finish);
 assert.deepEqual(items.map(r=>r.id),saved);
 assert.deepEqual(updated.stops.map(r=>r.id).sort(),saved.slice().sort());
 assert.ok(updated.units<=before+.000001);
 assert.ok(Math.abs(length(origin,[...updated.stops,finish])-updated.units)<.000001);
 return updated;
};
const fixedStart={x:0,y:0},fixedFinish={x:20,y:0};
const fixed=assertFixed(fixedStart,[{id:'b',x:20,y:10},{id:'a',x:0,y:10}],fixedFinish);
assert.deepEqual(fixed.stops.map(r=>r.id),['a','b']);
assert.throws(()=>improveOrder(fixedStart,[],{x:NaN,y:0}));
const points=[...require('./data/atlas-sa-150-sourced-pins.json').records,...require('./data/atlas-sa-100-tag-placements.json').records,...require('./data/atlas-sa-70-jump-zones.json').records].map(p=>({...p,id:p.set+':'+p.slot}));
let samples=0,improved=0;
for(const category of ['snapshots','horseshoes','oysters','tags','jumps']){
 const rows=points.filter(p=>p.set===category);
 for(const [origin,finish] of [[rows[0],rows.at(-1)],[rows.at(-1),rows[0]],[rows[Math.floor(rows.length/3)],rows[Math.floor(rows.length*2/3)]]]){
  const remaining=rows.filter(r=>r.id!==origin.id&&r.id!==finish.id),order=[];let previous=origin;
  while(remaining.length){remaining.sort((a,b)=>Math.hypot(a.x-previous.x,a.y-previous.y)-Math.hypot(b.x-previous.x,b.y-previous.y)||a.slot-b.slot);previous=remaining.shift();order.push(previous)}
  const result=assertFixed(origin,order,finish);samples++;if(result.improved)improved++;
 }
}
console.log('Atlas fixed-endpoint route checks: '+samples+' real collection samples, '+improved+' improved; no regression');
