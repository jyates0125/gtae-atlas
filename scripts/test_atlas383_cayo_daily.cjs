'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),C=require('../atlas-conditions.js');
const now=Date.parse('2026-11-23T10:00:00Z'),end=C.nextReset(now,6);
const pack=ids=>({schema:1,rotations:{'cayo-chests':{activeIds:ids,checkedAtUtc:new Date(now-1000).toISOString(),validUntilUtc:new Date(end).toISOString(),source:'fixture only'}}});
const s=pack(['cayo-chest-14','cayo-chest-8']),current=C.cayoChestSelection(s,now);
assert.equal(current.land,8);assert.equal(current.underwater,14);assert.equal(current.windowStartUTC,'2026-11-23T06:00:00.000Z');
assert.equal(current.windowEndUTC,'2026-11-24T06:00:00.000Z');assert.equal(current.confidence,'calculated_unconfirmed_in_game');
for(const ids of [['cayo-chest-1','cayo-chest-2'],['cayo-chest-11','cayo-chest-12'],['cayo-chest-0','cayo-chest-14'],['cayo-chest-1','cayo-chest-20'],['cayo-chest-1'],['8','14']]){assert.equal(C.cayoChestSelection(pack(ids),now),null);assert.deepEqual(C.mergePublishedRotations([pack(ids)],now),{schema:1,rotations:{}})}
assert.equal(C.cayoChestSelection(s,end),null);assert.deepEqual(C.mergePublishedRotations([s],end),{schema:1,rotations:{}});
const f=fs.readFileSync('atlas180-cayo-flagship.js','utf8');assert.match(f,/C\.loadPublishedRotations/);assert.match(f,/personal\?\.day===key/);assert.match(f,/rotationRefreshDue\(lastDailyAttempt\)/);assert.match(f,/teamjura-cayo-daily-choice-v1/);
assert.match(fs.readFileSync('heist-cayo-perico.html','utf8'),/atlas-conditions\.js\?v=4721/);
console.log('PASS Cayo published rotation, exact island IDs, one land/one underwater, expiry and guest override');

// Availability must not convert missing evidence into a false inactive claim.
const snapshot={schema:1,rotations:{'gun-van':{activeIds:['van-1'],checkedAtUtc:'2026-11-24T06:00:00Z',validUntilUtc:'2026-11-25T06:00:00Z',source:'QA'}}};
const t=Date.parse('2026-11-24T12:00:00Z');
const ctx={mode:'online',now:t,snapshot};
assert.equal(C.markerAvailability('gun-van',{...ctx,markerId:'van-1'}).hide,false);
assert.equal(C.markerAvailability('gun-van',{...ctx,markerId:'van-2'}).hide,true);
assert.equal(C.markerAvailability('gun-van',{...ctx,markerId:'van-2',now:Date.parse('2026-11-25T06:00:00Z')}).availability,'unconfirmed');
assert.equal(C.markerAvailability('gun-van',ctx).hide,true);
for(const id of ['pumpkins','slashers','ghosts-exposed'])assert.equal(C.markerAvailability(id,ctx).hide,true);
assert.equal(C.markerAvailability('snowmen',ctx).availability,'unconfirmed');
assert.equal(C.markerAvailability('story-letters',{mode:'story',now:t}).hide,false);
console.log('PASS explicit inactive, active, expired/unknown, seasonal and Story separation');

const october=Date.parse('2026-10-25T12:00:00Z');
const slasher={mode:'online',now:october,state:{events:{halloween:true}},hour:1,slasherSession:{freeroam:true,elapsed:true,vehicle:true,cooldown:true}};
assert.equal(C.markerAvailability('slashers',slasher).status,'active');
assert.equal(C.markerAvailability('slashers',{...slasher,hour:5}).hide,false);
for(const hour of [0,6,23])assert.equal(C.markerAvailability('slashers',{...slasher,hour}).hide,true);
for(const flag of Object.keys(slasher.slasherSession))assert.equal(C.markerAvailability('slashers',{...slasher,slasherSession:{...slasher.slasherSession,[flag]:false}}).hide,true);
assert.equal(C.markerAvailability('slashers',{...slasher,state:{}}).availability,'unconfirmed');
assert.equal(C.markerAvailability('slashers',{...slasher,now:t}).availability,'inactive');
const anchors=Object.values(JSON.parse(fs.readFileSync('data/gtadb-5.json','utf8')).records);
assert.equal(C.SLASHER_ZONES.length,7);
for(const z of C.SLASHER_ZONES){assert.ok(anchors.some(a=>a[0].includes(z.anchor)&&a[1][0]===z.x&&a[1][1]===z.y),z.anchor);assert.ok(z.radius>0);}
console.log('PASS Slasher event, hour, session prerequisites, expiry and licensed regional anchors');

assert.equal(C.markerAvailability('slashers',{...slasher,mode:'story'}).hide,true);
assert.ok(C.rulesForMode('vi').some(r=>r.id==='vi-story-launch'));
assert.ok(!C.rulesForMode('vi').some(r=>r.id==='slashers'));
assert.match(fs.readFileSync('atlas-credits.html','utf8'),/id="activity-evidence"/);

assert.equal(C.activityGuidance('slashers',slasher).length,6);
assert.ok(C.activityGuidance('slashers',slasher).every(step=>step.met));
assert.ok(C.activityGuidance('ls-tags',{}).some(step=>step.label==='Collected a spray can'&&!step.met));
assert.ok(C.activityGuidance('story-nuclear',{}).some(step=>!step.met));
