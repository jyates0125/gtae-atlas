#!/usr/bin/env python3
"""Atlas 15.0: seven classic-world numbered collection slots can link to personal map pins.
This test checks the release contract; Playwright independently exercises interactions.
"""
from pathlib import Path
R=Path(__file__).resolve().parents[1]
p=(R/'atlas98b-progress.js').read_text(encoding='utf8')
c=(R/'atlas98-classic.js').read_text(encoding='utf8')
h=(R/'map-hub.html').read_text(encoding='utf8')
pc=(R/'atlas98b-progress.css').read_text(encoding='utf8')
cc=(R/'atlas98-classic.css').read_text(encoding='utf8')
collections=(R/'atlas98b-collection-data.js').read_text(encoding='utf8')
for text in ('j150-place-pin','team-jura:classic-place-slot','team-jura:classic-checklist-change',
             'team-jura:classic-change','team-jura-atlas98-classic-','mapped.has(n)'):
 assert text in p,text
for text in ('collectionSlot','collectionSet','pendingSlot','team-jura:classic-place-slot',
             'team-jura:classic-checklist-change','personal-image-percent','classicNoteStyle',
             'dataset.mapImage','team-jura-atlas98b-items-'):
 assert text in c,text
assert "source:'personal-image-percent',...(link?{collectionSet:link.set,collectionSlot:link.slot}:{})" in c
assert 'validLink?' in c, 'Backup import should validate optional slot linking'
assert 'Number.isInteger(slot)' in c and 'slot>count' in c, 'No invented out-of-range slot numbers'
assert 'Number.isInteger(m.collectionSlot)' in c, 'Prior manual pins must remain valid'
assert "sets:['Red balloons','Rampages','Empire sites'" in c, 'VCS missing sourced collection categories'
assert "sets:['Security cameras','Rampages','Unique jumps'" in c, 'CTW missing sourced collection categories'
for world in ('iii','vc','vcs','lcs','ctw','tlad','tbogt'):
 assert "'"+world+"':{" in collections,world
for entry in ('atlas98-classic.js?v=','atlas98-classic.css?v=',
              'atlas98b-progress.js?v=','atlas98b-progress.css?v=231'):
 assert entry in h,entry
assert '.j150-slot' in pc and '.j150-place-pin' in pc
assert '.classic-marker[data-slot-done="true"]' in cc
assert 'team-jura-atlas98-classic-'+'' in c
assert 'team-jura-atlas98b-items-' in p, 'Checklist key must not be renamed'
assert 'existing' in p.lower() and 'const prior=new Set' in p and 'state=merged' in p
route=(R/'atlas98b-route.js').read_text(encoding='utf8')
assert 'team-jura-classic-route-v1' in route and 'input.world!==game' in route
assert 'existing.has(id)' in route and 'j228RouteImport' in route and 'j228RouteExport' in route
assert 'team-jura-atlas98-classic-'+'' in c, 'Marker key must not be renamed'
print('PASS Atlas 15.0: linked classic-world slots, preserved old save keys, explicit personal image coordinates')

import subprocess
subprocess.run(['node','-e',"""const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');const ctx={window:{}};vm.runInNewContext(fs.readFileSync('atlas98b-collection-data.js','utf8'),ctx);const c=ctx.window.TeamJuraClassicCollections;assert.equal(c.vcs.Rampages.count,30);assert.equal(c.vcs['Rampages (PS2)'].count,35);assert.equal(c.vcs['Stunt jumps (PS2)'].count,36);assert.equal(c.ctw['Rampages (PSP)'].count,35);assert.equal(c.ctw['Riding Shotguns'].count,5);assert.equal(c.ctw['Riding Shotguns (PSP)'].count,8);assert.equal(c.ctw['Lions of Fo'].count,2);assert.equal(c.lcs['Hidden packages'].count,100);console.log('PASS edition-specific collection totals');"""],cwd=R,check=True)
# Protect the current checklist implementation, not the obsolete pre-recovery
# statement adjacency. Refresh must precede each slot toggle, but damaged data
# must block writes before constructing a target Set. Remote-tab changes still
# trigger a fresh render rather than silently resetting the saved checklist.
assert "refreshLatest();if(damagedRaw!==null){showSafety();return}" in p, 'Damaged checklist must block toggles'
assert "const target=new Set(state.done[selected]||[])" in p, 'Toggle must use refreshed current-world progress'
assert "window.addEventListener('storage'" in p and "if(e.key===key||e.key===null){refreshLatest();render()" in p, 'Cross-tab updates must refresh'
assert "if(!assertWritable())" in p and "download raw saved checklist" in p.lower(), 'Unreadable checklist must be recoverable without overwriting it'

# Exercise the notebook merge helper without DOM or storage side effects.
subprocess.run(['node','-e',"""const assert=require('node:assert/strict'),fs=require('node:fs');const source=fs.readFileSync('atlas98-classic.js','utf8');const helper=source.slice(source.indexOf('function mergeNotebook('),source.indexOf('function read(){'));const merge=new Function(helper+';return mergeNotebook')();const sets=['Hidden packages','Rampages'],collections={'Hidden packages':{count:100}};const row=(id,slot)=>({id,name:id,category:'Hidden packages',collectionSet:'Hidden packages',collectionSlot:slot,x:10,y:20});const before={schema:'team-jura-atlas98-classic-v1',world:'iii',markers:[{...row('a',1),name:'Keep my note'}],completed:['Hidden packages'],background:'existing image'};const backup={...before,markers:[row('a',2),row('b',1),row('c',2),row('d',3),row('d',4),row('e',999),{...row('bad',5),x:-1}],completed:['Rampages'],background:'different image'};const out=merge(before,backup,'iii',sets,collections);assert.equal(out.added,3);assert.equal(out.kept,3);assert.equal(out.skipped,1);assert.equal(out.state.markers[0].name,'Keep my note');assert.equal(out.state.background,'existing image');assert.deepEqual(out.state.completed,sets);assert.equal(before.markers.length,1);assert.ok(!Object.hasOwn(out.state.markers.at(-1),'collectionSlot'));assert.throws(()=>merge(before,{...backup,world:'vc'},'iii',sets,collections));console.log('PASS classic notebook non-destructive restore');"""],cwd=R,check=True)
