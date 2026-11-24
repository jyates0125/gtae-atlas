const assert=require('node:assert/strict'),fs=require('node:fs');
for(const p of ['atlas.js','atlas87-daily.js','atlas-activities.js']){
 const s=fs.readFileSync(p,'utf8');assert.match(s,/online-rotation-current\.json\?update=1/);assert.match(s,/300000/);assert.match(s,/visibilitychange/);assert.match(s,/60000/);assert.match(s,/finally\{(?:rotationPending|pending)=false\}/);
}
const C=require('../atlas-conditions.js');const now=Date.parse('2026-11-23T06:05:00Z'),s={schema:1,rotations:{'gun-van':{checkedAtUtc:new Date(now).toISOString(),validUntilUtc:new Date(C.nextReset(now,6)).toISOString(),activeIds:['test-only'],source:'fixture'}}};
assert.ok(C.rotationFeed(s,'gun-van',now));assert.equal(C.rotationFeed(s,'gun-van',C.nextReset(now,6)),null);assert.equal(C.rotationFeed({schema:1,rotations:{}},'gun-van',now),null);
console.log('Daily refresh contracts and expiry passed');