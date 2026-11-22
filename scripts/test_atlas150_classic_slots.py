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
             'team-jura:classic-checklist-change','personal-image-percent','iconFor',
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
assert "refreshLatest();const target=new Set" in p and "window.addEventListener('storage'" in p
