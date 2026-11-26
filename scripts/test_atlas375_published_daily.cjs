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
 // Bad category isolation: keep valid Cayo and independently recover dealer data.
 const cayo=pack('cayo-chests',['cayo-chest-3','cayo-chest-14']);
 const corrupt={schema:1,rotations:{...cayo.rotations,'street-dealers':{activeIds:null}}};
 assert.throws(()=>C.safeSnapshot(corrupt)); // strict personal import unchanged
 assert.deepEqual(Object.keys((await C.loadPublishedRotations(fetcher(dealer,corrupt),'./local',empty,now)).rotations).sort(),['cayo-chests','street-dealers']);
 // Same-reset remote corrections take precedence; cached corrections survive outages.
 const sameOld=pack('gun-van',['old']),sameNew=pack('gun-van',['new']);
 assert.deepEqual((await C.loadPublishedRotations(fetcher(sameOld,sameNew),'./local',empty,now)).rotations['gun-van'].activeIds,['new']);
 assert.deepEqual((await C.loadPublishedRotations(fetcher(sameOld,null),'./local',sameNew,now)).rotations['gun-van'].activeIds,['new']);
 assert.deepEqual((await C.loadPublishedRotations(fetcher(remote,sameOld),'./local',empty,now)).rotations['gun-van'].activeIds,['old']);
 // A published selection for the next reset must never appear early.
 const beforeReset=Date.parse('2026-11-24T05:58:00Z'),reset=Date.parse('2026-11-24T06:00:00Z');
 const tomorrow=pack('gun-van',['next'],reset,C.nextReset(reset,6));
 assert.deepEqual(C.mergePublishedRotations([tomorrow],beforeReset),empty);
 assert.deepEqual(C.mergePublishedRotations([tomorrow],reset).rotations['gun-van'].activeIds,['next']);
 await assert.rejects(C.loadPublishedRotations(fetcher(null,null),'./local',empty,now));
 for(const file of ['atlas.js','atlas87-daily.js','atlas-activities.js'])assert.match(fs.readFileSync(file,'utf8'),/loadPublishedRotations/);
 const art=fs.readFileSync('atlas155-art-review.html','utf8');assert.match(art,/GTAE <em>GTA EXPLORER<\/em>/);assert.equal((art.match(/<article class="r155-card">/g)||[]).length,32); // 4 flagship + 4 section + 9 classic + 15 heists
 console.log('Independent daily channel, expiry, fallback and artwork masthead checks passed');
})().catch(e=>{console.error(e);process.exitCode=1});
