#!/usr/bin/env node
/* Verify the ACTUAL generated source-derived data and interpolation contract.
 * Synthetic dense bytes are used only to test priority, never shipped. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
require('../atlas-3d.js');
const api=require('../atlas368-approx-terrain.js');
const root=path.resolve(__dirname,'..');
const asset='data/atlas368-approx-terrain.json';
const raw=fs.readFileSync(path.join(root,asset),'utf8').trimEnd();
assert.equal(createHash('sha256').update(raw).digest('hex'),'cfb8f5197b52250e2f0251d0252d711392db60ad9364ac1c57a2c6bc9883daaa');
const data=JSON.parse(raw);
const def=JuraTerrain3D.ELEVATIONS['6'];
const surface=api.decode(data);
assert.equal(surface.game,6);
assert.equal(surface.width*surface.height,10560);
assert.equal(surface.stats.anchors,286);
assert.equal(surface.stats.groundBins,74);
assert.equal(surface.stats.sameSourceHoldoutMaxM,262.79);
assert.deepEqual(surface.stats.coverageCells,{'0':7376,'1':973,'2':1415,'3':796});
const mountain=surface.sample(-3281.434,6231.413);
assert.ok(mountain.height>100&&mountain.height<=405,JSON.stringify(mountain));
assert.ok(mountain.coverage>=2);
assert.deepEqual(surface.sample(Infinity,0),{height:0,coverage:1});
assert.deepEqual(surface.sample(100000,0),{height:0,coverage:1});
const [west,south,east,north]=surface.bounds;
const counts=[0,0,0,0];
for(let r=0;r<110;r++)for(let c=0;c<96;c++){
 const point=surface.sample(west+(east-west)*c/95,north-(north-south)*r/109);
 assert.ok(Number.isFinite(point.height)&&point.height>=0&&point.height<=405);
 assert.ok(point.coverage>=0&&point.coverage<=3);
 if(point.coverage===0)assert.equal(point.height,0);
 counts[point.coverage]++;
}
assert.deepEqual(counts,[7376,973,1415,796]);
function reject(edit,reason){const d=structuredClone(data);edit(d);assert.throws(()=>api.decode(d),reason)}
reject(d=>d.game=5,/wrong world/);
reject(d=>d.bounds[0]+=200,/coordinate bounds/);
reject(d=>d.source.pointRevision='unreviewed',/source revision/);
reject(d=>d.grid.width=100,/dimensions/);
reject(d=>d.grid.heightDmLE='abc',/encoded grid/);
reject(d=>d.stats.coverageCells['2']=0,/coverage totals/);
reject(d=>d.grid.supportU8=Buffer.alloc(10560,7).toString('base64'),/coverage cell/);
function engine(game='6'){
 return JuraTerrain3D.create({canvas:{addEventListener(){},clientWidth:390,hidden:true,style:{}},status:{textContent:''},bridge:{game:()=>game}});
}
(async()=>{
 const e=engine();
 assert.equal(e.hasElevation(),false);
 assert.equal(e.hasApproximate(),false);
 assert.equal(e.setApproximateSurface(surface),true);
 assert.equal(e.hasApproximate(),true);
 assert.equal(e.hasElevation(),false,'approximate data must NOT pass the dense DEM contract');
 assert.equal(e.setCoverageVisible(true),true);
 const samples=new Uint16Array(def.width*def.height);samples.fill(28000);samples[0]=28010;
 await e.setElevationBinary(samples.buffer,'6');
 assert.equal(e.hasApproximate(),false);
 assert.equal(e.hasElevation(),true);
 assert.equal(e.getCoverageVisible(),false);
 assert.throws(()=>e.setApproximateSurface(surface),/without a dense/);
 assert.throws(()=>engine('5').setApproximateSurface(surface),/only available for Leonida/);
 const response={ok:true,text:async()=>raw};let hits=0;
 const loader=async(url,opts)=>{hits++;assert.equal(url,'./'+asset);assert.equal(opts.credentials,'same-origin');return response};
 const one=await api.load(loader),two=await api.load(loader);
 assert.equal(one,two);assert.equal(hits,1);
 if(fs.existsSync(path.join(root,'public',asset)))assert.equal(fs.readFileSync(path.join(root,'public',asset),'utf8').trimEnd(),raw);
 const html=fs.readFileSync(path.join(root,'atlas-vi.html'),'utf8'),credit=fs.readFileSync(path.join(root,'atlas-credits.html'),'utf8');
 assert.match(html,/id="j368UseApproximate"/);
 assert.match(html,/id="j368CoverageToggle"/);
 assert.match(html,/Approximate 3D is not the original elevation grid/);
 assert.match(credit,/id="gtadb-approx-relief"/);
 for(const f of ['atlas.html','atlas-online.html'])assert.doesNotMatch(fs.readFileSync(path.join(root,f),'utf8'),/id="j368UseApproximate"/);
 console.log('Atlas 36.8 actual source grid: 286 observations, 10,560 cells, coverage, alignment, data SHA, interpolation, source scoping and dense priority PASS',mountain);
})().catch(err=>{console.error(err);process.exitCode=1});
