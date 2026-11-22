#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const worker=fs.readFileSync('atlas-sw.js','utf8'),helper=fs.readFileSync('atlas277-offline-classic.js','utf8');
const list=JSON.parse(worker.match(/const SITE_FILES=(\[[^\n]+\]);/)[1]),required=JSON.parse(helper.match(/const required=(\[[^\n]+\]),shell=/)[1]);
assert.equal(new Set(list).size,list.length);
for(const path of required){assert.ok(list.includes(path)&&/^\.\/[a-zA-Z0-9_./-]+$/.test(path),'Unrecognized offline path '+path);assert.ok(fs.existsSync(path),'Missing offline dependency '+path)}
assert.ok(list.includes('./data/atlas-ctw-100-camera-references.json')&&list.includes('./data/atlas-ctw-85-collection-references.json'));
assert.ok(!worker.includes('caches.delete('));for(const path of ['map-hub.html','maps.html'])assert.ok(fs.readFileSync(path,'utf8').includes('atlas277-offline-classic.js?v=277'));
const handlers={},db=new Map(),key=k=>String(k.url||k),get=n=>{if(!db.has(n))db.set(n,new Map());return db.get(n)};
let offline=false,quota=false,blocked=false,active=0,maxActive=0,claims=0;
const response={ok:true,clone(){return this}},old={legacy:true,ok:true,clone(){return this}};
const caches={open:async n=>{if(blocked)throw Error('blocked');return{put:async(k,v)=>{if(quota)throw Error('quota');get(n).set(key(k),v)},match:async k=>get(n).get(key(k))}},match:async(k,o)=>get(o.cacheName).get(key(k))};
const context={URL,Response:{error:()=>({error:true})},caches,fetch:async()=>{active++;maxActive=Math.max(active,maxActive);await Promise.resolve();active--;if(offline)throw Error('offline');return response},self:{location:{href:'https://example.test/atlas-sw.js?v=277'},registration:{scope:'https://example.test/'},addEventListener:(t,f)=>handlers[t]=f,skipWaiting:async()=>{},clients:{claim:async()=>claims++}}};
vm.runInNewContext(worker,context);
function event(name,request){let work;handlers[name]({request,waitUntil:p=>work=p,respondWith:p=>work=p});return work}
(async()=>{const tile='https://raw.githubusercontent.com/rolux/gtadb.org/main/maps/tiles/5/0/0/0.png';get('team-jura-atlas-v41-tiles').set(tile,old);get('team-jura-atlas-v191-shell').set('legacy',old);
await event('install');await event('activate');assert.equal(claims,1);assert.equal(get('team-jura-atlas-v290-shell').size,list.length);assert.ok(maxActive<=4);assert.equal(get('team-jura-atlas-v191-shell').get('legacy'),old);
offline=true;for(const url of ['https://example.test/map-hub.html?game=ctw','https://example.test/atlas273-ctw-cameras.js?v=275','https://example.test/data/atlas-ctw-85-collection-references.json'])assert.equal(await event('fetch',{method:'GET',url}),response);
assert.equal(await event('fetch',{method:'GET',url:tile}),old);assert.equal(event('fetch',{method:'GET',url:'https://gtamap.io/gta-chinatown-wars-map/'}),undefined);assert.equal(event('fetch',{method:'POST',url:'https://example.test/map-hub.html'}),undefined);
offline=false;quota=true;assert.equal(await event('fetch',{method:'GET',url:'https://example.test/map-hub.html?game=ctw'}),response);blocked=true;assert.equal(await event('fetch',{method:'GET',url:'https://example.test/data/atlas-ctw-85-collection-references.json'}),response);console.log('PASS offline dependencies, installation, query navigation, legacy tile retention and online storage-failure recovery')})().catch(e=>{console.error(e);process.exitCode=1});
