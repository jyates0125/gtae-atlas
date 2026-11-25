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

const ganado=f.workshopCatalog('vi_ganado70');
assert.equal(ganado.length,30);
assert.deepEqual([...new Set(ganado.map(g=>g.tab))],['Pro Builds','Cosmetics','Bodywork','Performance','Wheels','Interior']);
assert.equal(f.workshopLiveries('vi_ganado70').length,2);
assert.ok(f.build('Pickup / Truck','vi_ganado70','#be9b4a',{}).profile);
assert.equal(f.normalize({workshopOptions:{engine:'engine-1'}},'vi_ganado70').workshopOptions.engine,'engine-1');
assert.deepEqual(f.normalize({workshopOptions:{engine:'engine-1'}},'vi_ganado_retro').workshopOptions,{});
assert.equal(f.normalize({workshopLivery:'ganado-vintage'},'vi_cheetah95').workshopLivery,'none');
console.log('PASS Ganado released-game workshop isolation');

// Same temporary visual foundation, distinct game-specific workshop identity.
for(const [type,v,vi] of [['Sports concept','banshee','vi_banshee'],['Touring concept','dominator','vi_dominator']]){
 assert.equal(f.visualPlatform(vi),v);
 assert.equal(f.modelProfile(type,vi),f.modelProfile(type,v));
 assert.equal(hash(f.build(type,vi,'#30323a',{stripe:'dual',rim:'gold'})),hash(f.build(type,v,'#30323a',{stripe:'dual',rim:'gold'})));
 assert.deepEqual(f.workshopCatalog(vi),[]);
 assert.deepEqual(f.workshopLiveries(vi),[]);
 assert.deepEqual(f.normalize({workshopLivery:'banshee-white-double',workshopOptions:{engine:'engine-1'}},vi).workshopOptions,{});
 assert.equal(f.normalize({workshopLivery:'banshee-white-double'},vi).workshopLivery,'none');
}
assert.equal(f.visualPlatform('vi_dominator67_buggy'),'vi_dominator67_buggy');
assert.equal(f.visualPlatform('vi_ganado70'),'vi_ganado70');
console.log('PASS Atlas 41.5 shared visual platform, independent game workshop data');
