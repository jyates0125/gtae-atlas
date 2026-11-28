const assert=require('node:assert/strict'),api=require('../atlas450-vi-progress.js');assert.equal(api.rows.length,33);assert.equal(api.venues.length,12);assert.equal(new Set(api.rows.map(r=>r[0])).size,33);assert.equal(api.rows.filter(r=>r[4]==='Stunts').reduce((n,r)=>n+r[2],0),397);let raw=null;const store={getItem:()=>raw,setItem:(k,v)=>{assert.equal(k,api.KEY);raw=v}};api.set(store,'stunt-jumps',130);api.set(store,'bridges',170);assert.equal(api.stunts(api.clean(JSON.parse(raw))),300);assert.throws(()=>api.set(store,'bridges',203));assert.throws(()=>api.set(store,'online:gun-van',1));assert.throws(()=>api.set(store,'races',1.5));raw='broken';assert.throws(()=>api.set(store,'races',1));assert.equal(raw,'broken');console.log('Leonida progress counts, isolation and safe save tests passed');
assert.equal(api.arcadeGames.length,4);

const A='vj-'+'a'.repeat(32),B='vj-'+'b'.repeat(32),records=new Map(),s={getItem:k=>records.get(k)??null,setItem:(k,v)=>records.set(k,v)};
api.set(s,'stunt-jumps',23);api.set(s,'stunt-jumps',5,A);api.set(s,'stunt-jumps',8,B);
assert.equal(api.read(s).state.counts['stunt-jumps'],23);assert.equal(api.read(s,A).state.counts['stunt-jumps'],5);assert.equal(api.read(s,B).state.counts['stunt-jumps'],8);
assert.throws(()=>api.set(s,'stunt-jumps',12,A,4));assert.equal(api.read(s,A).state.counts['stunt-jumps'],5);
assert.equal(api.merge(s,{schema:1,profile:A,counts:{'stunt-jumps':120}},A).conflicts,1);
assert.equal(api.read(s,A).state.counts['stunt-jumps'],5);
assert.throws(()=>api.merge(s,{schema:1,profile:B,counts:{}},A));assert.throws(()=>api.read(s,'malformed'));
records.set(api.key(B),JSON.stringify({schema:1,profile:B,counts:{'unknown-future':1}}));assert.throws(()=>api.set(s,'stunt-jumps',1,B));assert.ok(records.get(api.key(B)).includes('unknown-future'));
const C='vj-'+'c'.repeat(32);assert.equal(api.merge(s,{schema:1,profile:C,counts:{races:8}},C).added,1);assert.equal(api.read(s,C).state.counts.races,8);
console.log('Independent activity scopes, safe conflict and backup tests passed');
