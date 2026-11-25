const assert=require('node:assert/strict'),fs=require('node:fs');
for(const p of ['atlas.js','atlas87-daily.js','atlas-activities.js']){
 const s=fs.readFileSync(p,'utf8');assert.match(s,/online-rotation-current\.json\?update=1/);assert.match(s,/300000/);assert.match(s,/visibilitychange/);assert.match(s,/60000/);assert.match(s,/finally\{(?:rotationPending|pending)=false\}/);
}
const C=require('../atlas-conditions.js');const now=Date.parse('2026-11-23T06:05:00Z'),s={schema:1,rotations:{'gun-van':{checkedAtUtc:new Date(now).toISOString(),validUntilUtc:new Date(C.nextReset(now,6)).toISOString(),activeIds:['test-only'],source:'fixture'}}};
assert.ok(C.rotationFeed(s,'gun-van',now));assert.equal(C.rotationFeed(s,'gun-van',C.nextReset(now,6)),null);assert.equal(C.rotationFeed({schema:1,rotations:{}},'gun-van',now),null);
console.log('Daily refresh contracts and expiry passed');
// Exercise the actual private helpers without initializing page timers or network.
const vm=require('node:vm');
const source=fs.readFileSync('atlas87-daily.js','utf8');
const hook="if(document.readyState==='loading')";
assert.ok(source.includes(hook));
const sandbox={window:{JuraConditions:{rulesForMode:()=>[]}},location:{pathname:'/atlas87-daily.html'},document:{readyState:'loading',addEventListener(){} }};
vm.runInNewContext(source.replace(hook,'window.testVehicleOffers={memberOfferStatus,memberOffers,matchSimeon,simeonLists,simeonReward,simeonAreas};'+hook),sandbox);
const {memberOfferStatus,memberOffers,matchSimeon,simeonLists,simeonReward,simeonAreas}=sandbox.window.testVehicleOffers;
assert.equal(simeonLists.length,8);
assert.equal(new Set(simeonLists.flat()).size,20);
for(const cars of simeonLists)assert.ok(matchSimeon(cars).length);
assert.equal(matchSimeon(simeonLists[1]).map(x=>x.number).join(','),'2,4');
for(const selection of [[],['Bullet','Zion'],['Banshee','Banshee'],['__proto__']])assert.equal(matchSimeon(selection).length,0);
const offer=memberOffers.find(x=>x.name==='Grotti Itali RSX');
assert.ok(offer);
for(const [date,status] of [['2026-11-05','announced'],['2026-11-06','boundary-check-in-game'],['2026-11-24','free-claim'],['2026-12-09','boundary-check-in-game'],['2026-12-10','expired']])assert.equal(memberOfferStatus(offer,Date.parse(date+'T12:00:00Z')),status);
const long={name:'fixture',kind:'early-access',start:'2026-01-01',end:'2026-01-20',general:'2026-01-21'};
assert.equal(memberOfferStatus(long,Date.parse('2026-01-15T12:00:00Z')),'early-access');
assert.equal(memberOfferStatus(long,Date.parse('2026-01-21T12:00:00Z')),'general-release-date');
assert.equal(memberOfferStatus({...long,end:'2026-02-30'},Date.now()),'unverified');
console.log('PASS Simeon matching and independent GTA+ offer dates');

assert.equal(simeonReward('Bullet'),20000);
assert.equal(simeonReward('Coquette'),19800);
assert.equal(simeonReward('__proto__'),null);
for(const car of new Set(simeonLists.flat()))assert.ok(simeonReward(car)>0);
assert.equal(simeonAreas.F620,'Del Perro Pier parking lot');
assert.equal(matchSimeon(['Banshee']).length,3);
assert.ok(fs.readFileSync('atlas-online.html','utf8').includes('id="j87-simeon-map"'));

assert.match(source,/jura:legend-updated/);
assert.match(source,/state\.game!=='5'\|\|state\.mode!=='online'/);
