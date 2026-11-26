const assert=require('node:assert/strict'),fs=require('node:fs'),C=require('../atlas-conditions.js');
const now=Date.parse('2026-11-23T10:00:00Z');
const pack=(id,ids,checked=now-1000,end=C.nextReset(now,C.BY_ID[id].reset))=>({schema:1,rotations:{[id]:{activeIds:ids,checkedAtUtc:new Date(checked).toISOString(),validUntilUtc:new Date(end).toISOString(),source:'test fixture'}}});
const empty={schema:1,rotations:{}},local=pack('gun-van',['old'],now-2000),remote=pack('gun-van',['new']),dealer=pack('street-dealers',['a','b','c']);
const fetcher=(a,b)=>async(url,options)=>{assert.equal(options.credentials,'omit');assert.equal(options.referrerPolicy,'no-referrer');const x=url===C.PUBLISHED_ROTATIONS_URL?b:a;if(x===null)throw Error('offline');return{ok:true,text:async()=>JSON.stringify(x)}};
(async()=>{
 assert.deepEqual((await C.loadPublishedRotations(fetcher(local,remote),'./local',empty,now)).rotations['gun-van'].activeIds,['new']);
 assert.deepEqual(Object.keys((await C.loadPublishedRotations(fetcher(local,dealer),'./local',empty,now)).rotations).sort(),['gun-van','street-dealers']);
 assert.deepEqual((await C.loadPublishedRotations(fetcher(local,null),'./local',empty,now)).rotations['gun-van'].activeIds,['old']);
 assert.deepEqual((await C.loadPublishedRotations(fetcher(empty,null),'./local',remote,now)).rotations['gun-van'].activeIds,['new']);
 assert.deepEqual(C.mergePublishedRotations([remote],C.nextReset(now,6)),empty);
 assert.deepEqual(C.mergePublishedRotations([pack('street-dealers',['a','b'])],now),empty);
 assert.deepEqual(C.mergePublishedRotations([pack('street-dealers',['a','a','b'])],now),empty);
 // One bad category must not discard an otherwise valid published feed.
 const bad={schema:1,rotations:{...dealer.rotations,'gun-van':{activeIds:null}}};
 assert.throws(()=>C.safeSnapshot(bad));
 assert.deepEqual(Object.keys((await C.loadPublishedRotations(fetcher(null,bad),'./local',empty,now)).rotations),['street-dealers']);
 // Same-timestamp remote corrections supersede bundled copies.
 assert.deepEqual((await C.loadPublishedRotations(fetcher(pack('gun-van',['bundled']),remote),'./local',empty,now)).rotations['gun-van'].activeIds,['new']);
 // Partial personal imports cannot mask a complete current published selection.
 const partial=pack('street-dealers',['a','b']);
 assert.equal(C.rotationFeed(partial,'street-dealers',now),null);
 assert.deepEqual(C.selectRotationSnapshot(partial,dealer,now).rotations['street-dealers'].activeIds,['a','b','c']);
 assert.equal(C.evaluate('street-dealers',{now,snapshot:partial,markerId:'a'}).status,'unknown');
 const preReset=Date.parse('2026-11-24T05:59:00Z'),postReset=Date.parse('2026-11-24T06:00:00Z');
 assert.equal(C.rotationFeed(pack('gun-van',['future'],postReset,C.nextReset(postReset,6)),'gun-van',preReset),null);
 assert.equal(C.rotationFeed(pack('cayo-chests',['cayo-chest-1','cayo-chest-2']),'cayo-chests',now),null);
 await assert.rejects(C.loadPublishedRotations(fetcher(null,null),'./local',empty,now));
 for(const file of ['atlas.js','atlas87-daily.js','atlas-activities.js'])assert.match(fs.readFileSync(file,'utf8'),/loadPublishedRotations/);
 const art=fs.readFileSync('atlas155-art-review.html','utf8');assert.match(art,/GTAE <em>GTA EXPLORER<\/em>/);assert.equal((art.match(/<article class="r155-card">/g)||[]).length,32); // 4 flagship + 4 section + 9 classic + 15 heists
 console.log('Independent daily channel, expiry, fallback and artwork masthead checks passed');
})().catch(e=>{console.error(e);process.exitCode=1});
