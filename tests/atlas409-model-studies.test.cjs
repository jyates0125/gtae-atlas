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
 assert.equal(base.surface.length,base.vertices.length/6*4);
 assert.ok(base.surface.every(Number.isFinite));
 assert.ok(base.stencilCount>0&&base.floorCount>base.stencilCount&&base.vehicleStart>base.floorCount&&base.vehicleStart<base.vertices.length/6);
 for(let i=0;i<base.surface.length;i+=4){assert.ok(Math.abs(Math.hypot(...base.surface.slice(i,i+3))-1)<1e-5);assert.ok(base.surface[i+3]>=0&&base.surface[i+3]<=1)}
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

assert.equal(f.workshopLiveries('ellie').length,11);
assert.equal(f.workshopLiveries('banshee').length,18);
assert.equal(f.workshopLiveries('vi_cheetah95').length,0);
assert.equal(f.workshopCatalog('ellie').length,15);
assert.equal(f.normalize({workshopLivery:'ellie-black-twin',workshopOptions:{engine:'engine-3',unknown:'x'}},'ellie').workshopOptions.engine,'engine-3');
assert.equal(f.normalize({workshopLivery:'ellie-black-twin'},'banshee').workshopLivery,'none');
assert.deepEqual(f.normalize({workshopLivery:'ellie-black-twin',workshopOptions:{engine:'engine-3'}},'vi_cheetah95').workshopOptions,{});
console.log('PASS model-specific game workshop catalog, invalid option rejection and VI isolation');
