'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {summarize,href,key,IDS}=require('../atlas321-classic-continue.js');
const collection={
 'Hidden packages':{count:100,url:'https://example.org/source'},
 'Rampages (PS2)':{count:35,url:'https://example.org/source'}
};
assert.equal(IDS.length,7);
assert.equal(key('vcs'),'team-jura-atlas98b-items-vcs-v1');
const empty=summarize('vcs',collection,null);
assert.equal(empty.status,'empty');
assert.deepEqual(empty.sets.map(s=>s.done),[0,0]);
assert(empty.sets[1].edition);
const input={schema:'team-jura-atlas98b-items-v1',game:'vcs',done:{
 'Hidden packages':[1,2,2,100,101,-3,'4',4],
 'Rampages (PS2)':[3,5,5,35,50]
}};
const before=JSON.stringify(input);
const result=summarize('vcs',collection,JSON.stringify(input));
assert.equal(JSON.stringify(input),before,'Read-only summary must not mutate saved state');
assert.equal(result.status,'ready');
assert.deepEqual(result.sets.map(x=>x.done),[4,3]);
assert.equal(result.sets[1].total,35);
assert.equal(result.sets[1].href,'./map-hub.html?game=vcs&collection=Rampages%20(PS2)');
assert.equal(href('ctw','Lions of Fo'),'./map-hub.html?game=ctw&collection=Lions%20of%20Fo');
for(const data of ['{oops',JSON.stringify({schema:1,game:'vcs',done:{}}),JSON.stringify({...input,game:'lcs'}),JSON.stringify({...input,done:{'Hidden packages':'1'}})])assert.equal(summarize('vcs',collection,data).status,'damaged');
assert.equal(summarize('other',collection,null).status,'unavailable');
assert.equal(summarize('vcs',{'Unknown':{count:0}},null).status,'unavailable');
const root=path.resolve(__dirname,'..');
const maps=fs.readFileSync(path.join(root,'maps.html'),'utf8');
const classic=fs.readFileSync(path.join(root,'map-hub.html'),'utf8');
const tracker=fs.readFileSync(path.join(root,'atlas98b-progress.js'),'utf8');
assert(maps.includes('id="j321ClassicRows"'));
assert(maps.includes('atlas321-classic-continue.js?v=321'));
assert(maps.includes('atlas98b-collection-data.js?v=321'));
assert(classic.includes('atlas98b-progress.js?v=321'));
assert(classic.includes('atlas321-classic-continue.css?v=321'));
assert(tracker.includes("Object.hasOwn(sets,params.get('collection'))"),'Direct link selects a real named set');
assert(tracker.includes('if(!assertWritable())'),'Damaged records must not be overwritten');
assert(tracker.includes("btn.disabled=damagedRaw!==null"),'Block completion changes while stored data is unreadable');
assert(tracker.includes('a.download=\'team-jura-\'+game+\'-unreadable-checklist-raw.txt\''),'Keep original bad bytes exportable');
assert(!fs.readFileSync(path.join(root,'atlas321-classic-continue.js'),'utf8').includes('localStorage.setItem'));
console.log('Atlas 32.1: seven-world read-only resume, exact checklist links, safe damaged-data contracts passed');
