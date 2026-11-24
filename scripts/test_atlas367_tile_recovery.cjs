#!/usr/bin/env node
/* Atlas 36.7: precise failed-tile recovery; no user keys are accessed. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const helper=require('../atlas367-tile-recovery.js');
const tiles=new Map([
 ['failed-V',{game:'5',path:'radar',state:'error'}],
 ['ok-V',{game:'5',path:'radar',state:'ok'}],
 ['loading-V',{game:'5',path:'satellite',state:'loading'}],
 ['failed-VI',{game:'6',path:'yanis,18',state:'error'}],
 ['ok-VI',{game:'6',path:'day',state:'ok'}],
]);
assert.equal(helper.clearFailed(tiles,'5'),1,'retry exactly one failed GTA V tile');
assert.equal(tiles.has('failed-V'),false);
assert.equal(tiles.get('ok-V').state,'ok');
assert.equal(tiles.get('loading-V').state,'loading');
assert.equal(tiles.get('failed-VI').state,'error');
assert.equal(helper.clearFailed(tiles,'5'),0);
assert.equal(helper.clearFailed(tiles,'6'),1);
assert.equal(tiles.get('ok-VI').state,'ok');
assert.throws(()=>helper.clearFailed(tiles,'4'),/Unsupported/);
assert.throws(()=>helper.clearFailed({},'5'),/Tile cache Map/);
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'atlas.js'),'utf8');
assert.match(app,/function recoverMapArtwork\(reason='manual'\)/);
assert.match(app,/JuraTileRecovery\?\.clearFailed\(tileStore,game\)/);
assert.match(app,/schedulePaint\(\)/);
assert.match(app,/addEventListener\('online',/);
assert.match(app,/const label=\$\('tileHealthText'\)\|\|el/);
for(const page of ['atlas.html','atlas-online.html','atlas-vi.html']){
 const s=fs.readFileSync(path.join(root,page),'utf8');
 for(const snippet of ['id="retryMapArtwork"','id="tileHealthText"','atlas367-tile-recovery.js?v=367','atlas367-map-artwork-recovery.css?v=367','atlas.js?v=367','atlas-credits.html#licensed']){
  assert.ok(s.includes(snippet),page+' missing '+snippet);
 }
 assert.equal((s.match(/id="retryMapArtwork"/g)||[]).length,1);
}
console.log('Atlas 36.7 recovery cache isolation, UI controls and source credits: PASS');
