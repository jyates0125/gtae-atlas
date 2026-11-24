'use strict';
const assert=require('node:assert/strict'),C=require('../atlas-road-core.js');
const raw=(game='5')=>({version:1,game,units:'gta-world',nodes:[{id:'a',x:0,y:0},{id:'b',x:10,y:0}],edges:[{from:'a',to:'b'}]});
const file=value=>({size:200,text:async()=>JSON.stringify(value)});
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {resolve,file:{size:200,text:()=>promise}}};
(async()=>{
 let scope='story';const loader=C.createGraphLoader(()=>scope);
 const first=(await loader.load(file(raw()),'5')).graph;
 assert.equal(first.nodes.size,2);
 await assert.rejects(loader.load(file({game:'6'}),'5'));assert.equal(loader.get(),first);
 const late=deferred(),pending=loader.load(late.file,'5');loader.reset();scope='vi';late.resolve(JSON.stringify(raw()));assert.deepEqual(await pending,{superseded:true});assert.equal(loader.get(),null);
 const old=deferred(),wait=loader.load(old.file,'6');const current=(await loader.load(file(raw('6')),'6')).graph;old.resolve(JSON.stringify(raw('6')));assert.deepEqual(await wait,{superseded:true});assert.equal(loader.get(),current);
 const bad=deferred(),badPending=loader.load(bad.file,'6');loader.reset();bad.resolve('not JSON');assert.deepEqual(await badPending,{superseded:true});
 const csv=C.routeCSV([{name:'=1+1',x:-5,y:3},{name:'  @test',x:4,y:5}],6,{method:'mixed'});assert.match(csv,/"'=1\+1"/);assert.match(csv,/"'  @test"/);assert.match(csv,/"-5"/);assert.match(csv,/mixed-unverified/);
 console.log('PASS graph replacement, race cancellation, reset, safe CSV and mixed evidence');
})().catch(e=>{console.error(e);process.exitCode=1});