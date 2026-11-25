const assert=require('node:assert/strict');
const f=require('../atlas256-forge-geometry.js');
const fs=require('node:fs');
const crypto=require('node:crypto');
const seed=JSON.parse(fs.readFileSync('atlas90-seed.json','utf8'));
const intel=JSON.parse(fs.readFileSync('data/atlas-vehicle-intel.json','utf8'));
assert.equal(seed.vehicles.filter(x=>x==='ellie').length,1);
assert.equal(intel.vehicles.ellie.game,'GTA Online');
const studies=[['Touring concept','ellie'],['Touring concept','dominator'],['Touring concept','gauntlet'],['Sports concept','cheetah2'],['Sports concept','banshee'],['Sports concept','vi_cheetah95'],['Touring concept','vi_stanier55']];
const hash=mesh=>crypto.createHash('sha256').update(Buffer.from(mesh.vertices.buffer)).digest('hex');
const hashes=new Set();
for(const [type,id] of studies){
 const base=f.build(type,id,'#30323a',{});
 assert.ok(base.profile,id+' missing model study');
 assert.ok(base.vertices.length>10000&&base.vertices.length%18===0&&base.vertices.every(Number.isFinite),id);
 const raw=hash(base);hashes.add(raw);
 for(const change of [{stripe:'dual'},{stripe:'single'},{wheels:'mesh'},{wheels:'deepdish'},{rim:'gold'},{rim:'black'}]){
  const styled=f.build(type,id,'#30323a',change);
  assert.notEqual(hash(styled),raw,id+' customization must change actual geometry or vertex color');
  assert.ok(styled.vertices.every(Number.isFinite),id);
 }
}
assert.equal(hashes.size,studies.length,'Vehicle studies must differ geometrically');
const safe=f.normalize({wheels:'not-a-wheel',rim:'bad',stripe:'bad'});
assert.equal(safe.wheels,'classic');assert.equal(safe.rim,'silver');assert.equal(safe.stripe,'none');
console.log('PASS Atlas 40.9: seven distinct model studies, actual wheel/stripe/color changes, valid finite meshes and normalized settings');
