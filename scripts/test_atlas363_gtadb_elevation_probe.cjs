/* Atlas 36.3 focused, synthetic tests. No live GTADB calls or third-party bytes. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
require('../atlas-3d.js');
require('../atlas-terrain-evidence.js');
const probe=require('../atlas363-elevation-probe.js');
const root=path.resolve(__dirname,'..');
async function main(){
 const x=-3778.98,y=712.94,expected=3.246;
 let calls=0;
 const mock=async (url,opts)=>{
  calls++;
  assert.equal(url,'https://api.gtadb.org/elevation?gta=6&x=-3778.98&y=712.94');
  assert.equal(opts.credentials,'omit');assert.equal(opts.mode,'cors');
  assert.equal(opts.method,'GET');assert.equal(opts.referrerPolicy,'no-referrer');
  return{ok:true,json:async()=>({status:'OK',results:[{elevation:expected,location:[x,y]}]})};
 };
 assert.equal(calls,0,'No background fetch allowed');
 const point=await probe.check('6',x,y,mock);
 assert.equal(point.meters,expected);
 assert.equal(point.confidence,'experimental');
 assert.equal(calls,1,'Only one on-demand reference request');
 await assert.rejects(probe.check('5',x,y,mock),/Only GTA VI/);
 await assert.rejects(probe.check('6',NaN,y,mock),/finite/);
 await assert.rejects(probe.check('6',100000,y,mock),/outside/);
 assert.equal(calls,1,'Invalid requests must not reach GTADB');
 await assert.rejects(probe.check('6',x,y,async()=>({ok:false,status:503})),/HTTP 503/);
 for(const bad of [
  {status:'FAILED',results:[{elevation:expected}]},
  {status:'OK',results:[]},
  {status:'OK',results:[{elevation:'3'}]},
  {status:'OK',results:[{elevation:Infinity}]},
  {status:'OK',results:[{elevation:expected,location:[4000,y]}]},
 ]){
  assert.throws(()=>probe.parse(bad,x,y));
 }
 const d=globalThis.JuraTerrain3D.ELEVATIONS[6];
 const samples=new Uint16Array(d.width*d.height);
 samples.fill(28000);
 const local={game:'6',bytes:samples.buffer};
 const val=probe.compare(local,'6',x,y,point);
 assert.ok(Number.isFinite(val.localMeters)&&Number.isFinite(val.differenceMeters));
 assert.equal(probe.compare(null,'6',x,y,point),null);
 assert.equal(probe.compare(local,'5',x,y,point),null);
 const vi=fs.readFileSync(path.join(root,'atlas-vi.html'),'utf8');
 const nav=fs.readFileSync(path.join(root,'atlas-navigation.js'),'utf8');
 const credits=fs.readFileSync(path.join(root,'atlas-credits.html'),'utf8');
 assert.match(vi,/atlas363-elevation-probe\.js\?v=363/);
 assert.match(vi,/atlas363-elevation-probe\.css\?v=363/);
 assert.match(vi,/id="j363CheckHeight"/);
 assert.match(vi,/id="j363HeightResult"/);
 assert.match(nav,/JuraElevationPointProbe/);
 assert.match(vi,/class="credits-line"[^>]*aria-label="Map source attribution"/);
 assert.match(vi,/href="https:\/\/map\.gtadb\.org\/"/);
 assert.match(vi,/href="https:\/\/creativecommons\.org\/licenses\/by\/4\.0\/"/);
 assert.match(vi,/href="\.\/atlas-credits\.html#licensed"/);
 assert.match(vi,/Sources &amp; changes/);
 assert.match(credits,/GTA VI Landmarks Data \(CC BY 4\.0\)/);
 assert.match(credits,/GTA VI Map Tiles \(CC BY 4\.0\)/);
 assert.match(credits,/GTADB\.ORG and contributors/);
 for(const file of ['atlas.html','atlas-online.html']){
  const other=fs.readFileSync(path.join(root,file),'utf8');
  assert.doesNotMatch(other,/j363CheckHeight/,'VI-only 3D source lookup');
 }
 console.log('Atlas 36.3: CC BY 4.0 source placement, one-point GTADB elevation query, safety and comparison PASS');
}
main().catch(e=>{console.error(e);process.exitCode=1});
