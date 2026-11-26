const assert=require('node:assert/strict'),fs=require('node:fs');
for(const p of ['atlas.js','atlas87-daily.js','atlas-activities.js']){
 const s=fs.readFileSync(p,'utf8');assert.match(s,/refreshPublishedRotations/);assert.match(s,/visibilitychange/);assert.match(s,/ROTATION_STATUS_MS/);assert.match(s,/finally\{(?:rotationPending|pending)=false\}/);
}
const C=require('../atlas-conditions.js');const now=Date.parse('2026-11-23T06:05:00Z'),s={schema:1,rotations:{'gun-van':{checkedAtUtc:new Date(now).toISOString(),validUntilUtc:new Date(C.nextReset(now,6)).toISOString(),activeIds:['test-only'],source:'fixture'}}};
assert.ok(C.rotationFeed(s,'gun-van',now));assert.equal(C.rotationFeed(s,'gun-van',C.nextReset(now,6)),null);assert.equal(C.rotationFeed({schema:1,rotations:{}},'gun-van',now),null);
assert.equal(C.ROTATION_PERIOD_MS,86400000);
assert.equal(C.ROTATION_REFRESH_MS,600000);
assert.equal(C.ROTATION_STATUS_MS,60000);
const empty={schema:1,rotations:{}};
assert.equal(C.rotationRefreshDue(0,empty,now),true);
assert.equal(C.rotationRefreshDue(now,empty,now+599999),false);
assert.equal(C.rotationRefreshDue(now,empty,now+600000),true);
assert.equal(C.rotationRefreshDue(now,empty,now-1),true);
const at=Date.parse('2026-11-23T08:00:00Z');
const makeGroup=(id,checked=at)=>({checkedAtUtc:new Date(checked).toISOString(),validUntilUtc:new Date(C.nextReset(checked,C.BY_ID[id].reset)).toISOString(),activeIds:id==='cayo-chests'?['cayo-chest-3','cayo-chest-14']:Array.from({length:C.BY_ID[id].today},(_,i)=>id+'-'+(i+1)),source:'QA'});
const full={schema:1,rotations:Object.fromEntries(C.expectedRotationGroups(empty).map(id=>[id,makeGroup(id)]))};
assert.equal(C.rotationRefreshDue(at,full,at+600000),false);
assert.equal(C.rotationRefreshDue(at,full,at+12*3600000),false);
const reset=C.nextReset(at,6);
assert.equal(C.rotationRefreshDue(reset-1000,full,reset),true);
assert.equal(C.rotationRefreshDue(reset,full,reset+1000),false);
assert.equal(C.rotationRefreshDue(reset,full,reset+600000),true);
const seven=C.nextReset(at,7);
assert.equal(C.rotationRefreshDue(seven-1000,full,seven),true);
assert.equal(C.rotationRefreshDue(at,full,at+600000,['cayo-chests']),false);
assert.equal(C.rotationRefreshDue(at,{...full,supportedGroups:['ls-tags']},at+600000),true);
assert.equal(C.rotationRefreshDue(at,{...full,supportedGroups:['ls-tags']},at+600000,['cayo-chests']),false);
assert.ok(C.expectedRotationGroups({supportedGroups:['ls-tags','invalid','__proto__']}).includes('ls-tags'));
assert.ok(!C.expectedRotationGroups({supportedGroups:['invalid']}).includes('invalid'));
for(const r of C.RULES.filter(r=>r.kind==='rotation')){const next=C.nextReset(now,r.reset);assert.equal(C.nextReset(next,r.reset)-next,C.ROTATION_PERIOD_MS);}
console.log('Reset-aware retry, expiry, supported categories and daily periods passed');
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

// Exercise the actual shared network/cache layer. No real network or guest data.
(async()=>{
 const memory=new Map();global.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
 let requests=0;const get=async()=>{requests++;return {ok:true,text:async()=>JSON.stringify(full)}};
 const [first,second]=await Promise.all([C.refreshPublishedRotations(get,empty,{now:at}),C.refreshPublishedRotations(get,empty,{now:at})]);
 assert.equal(requests,2);assert.deepEqual(first,second);
 assert.equal(Object.keys(first.rotations).length,4);
 await C.refreshPublishedRotations(get,empty,{now:at+3600000});assert.equal(requests,2);
 await C.refreshPublishedRotations(get,empty,{now:at+3600001,force:true});assert.equal(requests,4);
 const again=await C.refreshPublishedRotations(get,empty,{now:reset});assert.equal(requests,6);assert.equal(again.rotations['gun-van'],undefined);
 assert.equal(again.supportedGroups.includes('gun-van'),true);
 await C.refreshPublishedRotations(get,empty,{now:reset+1000});assert.equal(requests,6);
 await C.refreshPublishedRotations(get,empty,{now:reset+600000});assert.equal(requests,8);
 assert.equal(memory.size,1);assert.ok(memory.has(C.ROTATION_CACHE_KEY));
 delete global.localStorage;
 console.log('Shared request deduplication, reset, manual retry and public-only cache passed');
})().catch(e=>{console.error(e);process.exitCode=1});
