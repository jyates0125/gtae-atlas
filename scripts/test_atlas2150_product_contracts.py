#!/usr/bin/env python3
"""Focused Atlas 2150 cross-product regression guards.

Run on repository source before browser QA. These assertions do not replace
rendered Chromium/Edge, Safari, or owner visual acceptance.
"""
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]

def source(path):
    file = ROOT / path
    assert file.is_file(), f"Missing product component: {path}"
    return file.read_text(encoding="utf-8")

def require(path, *markers):
    body = source(path)
    for marker in markers:
        assert marker in body, f"{path}: missing integration marker {marker!r}"
    print(f"PASS {path}: {len(markers)} contract checks")

# Character gallery: world isolation, deep-link state, actual profile controls.
require("atlas222-characters.js", "j222-character-search", "search.value=q",
        "dialog.showModal()", "worldLink(r)", "srcSafe(r.sourceUrl)",
        "j222-portrait-unavailable", "WORLD_SCENES", "Illustrative world artwork only")
require("atlas-characters.html", 'id="j222-profile-dialog"',
        'id="j222-profile-content"')

# Garage + showroom: actual selected model passed through the URL and
# non-car geometry for aircraft and watercraft; no exact-model claim.
require("atlas93-garage.js", "atlas-vehicle-configurator.html?model=",
        "TeamJuraGarage3D")
require("atlas101-configurator.js", "Aircraft / Plane concept",
        "Boat / Watercraft concept", "Helicopter concept", "sceneType()",
        "prepareImport", "Object.hasOwn(merged,id)", "classLocked")
require("atlas99-garage3d.js", "forge.build(opts.type,opts.model,paint,design,environment)", "forgeStatus")
require("atlas-vehicle-configurator.html", "atlas256-forge-geometry.js", 'id="forgeVariant"', 'id="saveVariant"', 'id="loadVariant"')
require("atlas101-configurator.js", "mergeVariants", "VARIANT_LIMIT=8", "saveVariant", "loadVariant")
# Exercise the replacement geometry engine, not retired renderer variable names.
subprocess.run(["node", "-e", """
const assert = require('node:assert/strict');
const forge = require('./atlas256-forge-geometry.js');
const cases = [["Aircraft / Plane concept","lazer","air"],["Boat / Watercraft concept","jetmax","marine"],["Helicopter concept","akula","rotor"],["Sports concept","adder","sport"],["Truck / Utility concept","bison","utility"],["Touring concept","regina","touring"]];
for (const [type,id,kind] of cases) {
  const model=forge.build(type,id,'#4473c2',{});
  assert.equal(model.kind,kind,id);
  assert.ok(model.vertices.length>0 && model.vertices.length%18===0,id+' triangles');
  assert.ok(model.vertices.every(Number.isFinite),id+' finite geometry');
}
assert.equal(forge.normalize({}).environment,'auto');
assert.equal(forge.normalize({environment:'__proto__'}).environment,'auto');
assert.equal(forge.normalize({environment:'workshop'}).environment,'workshop');
assert.equal(forge.resolveTheme('marine','auto'),'marina');
assert.equal(forge.resolveTheme('air','auto'),'hangar');
assert.equal(forge.resolveTheme('marine','workshop'),'workshop');
const saved=forge.build('Boat','jetmax','#123456',{environment:'hangar'}).vertices;
const auto=forge.build('Boat','jetmax','#123456',{}).vertices;
assert.notDeepEqual(saved,auto,'Saved environment must change stage geometry');
assert.deepEqual(saved,forge.build('Boat','jetmax','#123456',{},'hangar').vertices,'Saved and explicit stage match');
console.log('PASS six original Forge geometry classes and saved environment regression');
const studies = [["Sports","adder"],["Sports","alpha"],["Sports","buffalo"],["Sedan","asea"],["Sedan","regina"],["Utility","rebel"],["Utility","riata"],["Utility","aleutian"],["Utility","rocoto"],["Boat","jetmax"],["Boat","squalo"],["Sports","vi_cheetah95"],["Sedan","vi_stanier55"],["Utility","vi_dominator67_buggy"],["Boat","vi_squalo"]];
for(const [type,id] of studies){
 const mesh=forge.build(type,id,'#4473c2',{},'signature');
 assert.ok(mesh.profile,id+' model profile');
 assert.ok(mesh.vertices.length>0 && mesh.vertices.length%18===0 && mesh.vertices.every(Number.isFinite),id+' valid triangles');
 assert.notDeepEqual(mesh.vertices,forge.build(type,'unprofiled','#4473c2',{},'signature').vertices,id+' distinct from fallback');
}
assert.equal(forge.modelProfile('Utility','adder'),null,'Class override uses matching fallback');
console.log('PASS fifteen targeted model geometry studies');
"""], cwd=ROOT, check=True)

# Read-only collection hub: world isolation, one-time private named-build handoff and ownership semantics.
require("atlas-forge-collections.html", 'id="forgeCollectionRows"', 'id="forgeCollectionWorld"', 'id="forgeCollectionKind"', "atlas263-forge-collections.js")
for page in ("atlas-vehicle-configurator.html", "atlas93-garage.html", "atlas90-weapons.html", "atlas90-weapons6.html"):
    require(page, "atlas-forge-collections.html")
require("atlas101-configurator.js", "requestedVariant", "loadWorking(named)")
subprocess.run(["node", "-e", """
const assert = require('node:assert/strict');
const hub = require('./atlas263-forge-collections.js');
const preset = (model,name) => ({model,name,paint:'#123456'});
const rows = hub.collect({
  v:{schema:1,builds:{adder:preset('adder','Primary'),vi_squalo:preset('vi_squalo','wrong')},variants:{adder:[preset('adder','Sun & Moon'),preset('adder','SUN & MOON')]}},
  vi:{schema:1,builds:{vi_squalo:preset('vi_squalo','Marina'),adder:preset('adder','wrong')}},
  owned:{schema:1,owned:{'vehicles5:adder':true,'vehicles5:bison':false}},
  garage:{vehicles:{adder:{garage:'Main Garage'}}},
  story:{schema:1,items:['bat']},online:{schema:1,items:['bat']},
  viArmory:{schema:1,items:['girardi-es9','unknown']}
},{'girardi-es9':'Girardi ES9'});
assert.equal(rows.length,7);
assert.deepEqual(rows.filter(x=>x.kind==='armory').map(x=>x.world),['story','online','vi']);
assert.ok(rows.some(x=>x.title==='Sun & Moon'&&x.privateVariant?.name==='Sun & Moon'&&x.href.includes('model=adder&source=collection')&&!x.href.includes('Sun%20')&&!x.href.includes('#variant=')), 'Named version opens privately without exposing its title in a URL');
assert.ok(rows.some(x=>x.href.includes('world=vi&model=vi_squalo')));
assert.ok(rows.some(x=>x.kind==='garage'&&x.subtitle==='Main Garage'));
assert.ok(!rows.some(x=>x.model==='bison'));
assert.ok(!rows.some(x=>x.model==='unknown'));
assert.ok(!rows.some(x=>x.title==='wrong'));
console.log('PASS eight Forge collection projection assertions');
"""], cwd=ROOT, check=True)

# World and heist navigation: these pages must remain in the release.
for path in ("index.html", "atlas-dashboard.html", "maps.html",
             "atlas.html", "atlas-online.html", "atlas-vi.html",
             "atlas93-garage.html", "atlas-database.html",
             "heists.html", "heist-cayo-perico.html"):
    require(path, "<")

# Flagship header must use the already-approved cinematic asset.
require("atlas100-universe.css", 'body[data-atlas-kind="all"] .u-hero-art',
        "jura155-map.webp")
assert (ROOT / "art/atlas98-approved-hero.webp").is_file(), "Approved hero artwork missing"

# Confirm the stage-gate rules and the adopted studio vision stay discoverable.
require("docs/TEAM-JURA-STANDING-CHARTER.md", "ELARIO-STUDIOS-OPERATING-CHARTER-V2-PROPOSAL.md")
require("docs/ELARIO-STUDIOS-OPERATING-CHARTER-V2-PROPOSAL.md",
        "The Elario 2150 Vision", "Owner-approved", "Release hold triggers")

print("PASS Atlas 2150 focused cross-product source contracts")

# Execute the same all-world inventory module served by the coverage page.
require("atlas-coverage.html", 'id="j267-world-evidence"', 'id="j267-filter"', 'id="j267-search"', "atlas267-world-evidence.js")
subprocess.run(["node","-e", """
const assert=require('node:assert/strict'), fs=require('node:fs'), vm=require('node:vm');
const api=require('./atlas267-world-evidence.js');
const data=Object.fromEntries(Object.entries(api.files).map(([k,f])=>[k,JSON.parse(fs.readFileSync(f,'utf8'))]));
const result=api.inventory(data), ctx={window:{}};vm.runInNewContext(fs.readFileSync('atlas98-worlds.js','utf8'),ctx);
assert.equal(ctx.window.TeamJuraWorlds.length,13);
assert.deepEqual(Object.keys(result).sort(),Array.from(ctx.window.TeamJuraWorlds,w=>w.id).sort());
assert.ok(result.story.summary.startsWith('275'));
assert.ok(result.sa.summary.startsWith('320'));
assert.ok(result.iii.summary.startsWith('160')&&result.iii.secondary.startsWith('140'));
assert.ok(result.vc.summary.startsWith('51'));
assert.equal(result.vc.secondary, data.vcland.records.length+' separate named landmark approaches · 171 separate Definitive Edition references; no classic overlay');
assert.ok(result.tlad.summary.startsWith('50')&&result.tbogt.summary.startsWith('50'));
assert.ok(result.lcs.summary.startsWith('52')&&result.vcs.summary.startsWith('51'));
assert.ok(api.inventory({}).sa.summary.includes('unavailable'));
assert.ok(result.vi.summary.startsWith(data.vi.mappedCount.toLocaleString('en-US')));
assert.equal(api.inventory({...data,vcde:{...data.vcde,edition:'classic'}}).vc.secondary, data.vcland.records.length+' separate named landmark approaches · Source unavailable');
assert.deepEqual(Object.keys(result).filter(k=>result[k].nativeGap).sort(),['ctw','lcs','vcs']);
console.log('PASS thirteen-world inventory and edition isolation');
"""],cwd=ROOT,check=True)

# Progress identity is tied to exact source revision, not guide numbering.
require("map-hub.html","atlas271-source-progress.js")
subprocess.run(["node","-e","""
const a=require('node:assert/strict'),p=require('./atlas271-source-progress.js');
const rows=require('./data/atlas-iii-160-source-points.json').records;
const index=p.makeIndex(rows,r=>r.category==='Rampages'?'rampage:'+r.slot:r.id),known=new Set(index.values());
a.equal(known.size,140); const variants=rows.filter(r=>r.category==='Rampages'&&r.slot===1);
a.equal(variants.length,2);a.equal(index.get(variants[0].id),index.get(variants[1].id));
const raw={schema:p.schema,scope:'iii-classic',revision:'test',done:['rampage:1','rampage:1','invalid']};
a.deepEqual(p.clean(raw,'iii-classic','test',known),['rampage:1']);
a.equal(p.merge([rows[0].id],raw,'iii-classic','test',known).length,2);
a.throws(()=>p.clean(raw,'vc-classic','test',known));a.throws(()=>p.clean(raw,'iii-classic','other',known));
for(const [file,size] of [['atlas-vc-51-source-points.json',51],['atlas-vc-de-171-source-points.json',171],['atlas-lcs-psp-reference.json',52],['atlas-vcs-psp-reference.json',51]]){const r=require('./data/'+file).records;a.equal(new Set(p.makeIndex(r,x=>x.id).values()).size,size)}
console.log('PASS source progress identity, merge, revision and edition boundaries');
"""],cwd=ROOT,check=True)

# Restored calibration uses trusted source coordinates and exact private raster identity.
subprocess.run(["node","-e","""const a=require('node:assert/strict'),c=require('./atlas249-map-calibration.js');const rows=[{id:'a',x:0,y:0},{id:'b',x:1000,y:0},{id:'c',x:0,y:1000},{id:'d',x:1000,y:1000}],fp='sha256:'+'a'.repeat(64);const record={schema:1,world:'vcs',revision:'rev',fingerprint:fp,anchors:rows.map(r=>({id:r.id,u:10+r.x/20,v:80-r.y/20}))};const run=(r=record,w='vcs',v='rev',f=fp)=>c.restore(r,w,v,f,rows);a.deepEqual(run().transform.project({x:500,y:500}),{u:35,v:55});a.equal(run().anchors.length,4);a.throws(()=>run(record,'lcs'));a.throws(()=>run(record,'vcs','other'));a.throws(()=>run(record,'vcs','rev','sha256:'+'b'.repeat(64)));a.throws(()=>run({...record,anchors:[...record.anchors.slice(0,3),record.anchors[0]]}));a.throws(()=>run({...record,anchors:record.anchors.map((r,i)=>({...r,u:r.u+(i===3?5:0)}))}));a.deepEqual(run({...record,anchors:record.anchors.map(r=>({...r,x:9999,y:9999}))}).transform.project({x:500,y:500}),{u:35,v:55});console.log('PASS image-bound calibration restore and mismatch guards');"""],cwd=ROOT,check=True)

require("map-hub.html","atlas273-ctw-cameras.js")
subprocess.run(["node","-e","""const a=require('node:assert/strict'),c=require('./atlas273-ctw-cameras.js'),d=require('./data/atlas-ctw-100-camera-references.json'),route=require('./atlas-route-core.js');const rows=c.validate(d);a.equal(rows.length,100);a.equal(new Set(rows.map(r=>r.x+','+r.y)).size,100);a.deepEqual([rows[0].x,rows[0].y],[2420.5,479.1]);a.deepEqual([rows[99].x,rows[99].y],[353.1,486.1]);a.throws(()=>c.validate({...d,world:'vc'}));a.throws(()=>c.validate({...d,records:rows.slice(0,99)}));a.throws(()=>c.validate({...d,records:[...rows.slice(0,99),rows[0]]}));const p=route.planEndpoints(rows,rows[0].id,rows.at(-1).id);a.equal(p.stops.length,100);a.equal(p.stops[0].id,rows[0].id);a.equal(p.stops.at(-1).id,rows.at(-1).id);a.ok(p.units<=p.baseline);console.log('PASS imported camera facts and CTW endpoint routing');"""],cwd=ROOT,check=True)

subprocess.run(["node","-e","""const a=require('node:assert/strict'), c=require('./atlas273-ctw-cameras.js'), d=require('./data/atlas-ctw-85-collection-references.json'), core=require('./atlas-route-core.js');const sets=c.validateExtra(d);a.equal(sets.reduce((n,s)=>n+s.records.length,0),85);a.deepEqual(Object.fromEntries(sets.map(s=>[s.id,s.count])),{jumps:30,rampages:30,'psp-rampages':5,lions:20});a.equal(sets.find(s=>s.id==='lions').kind,'visited');a.equal(sets.find(s=>s.id==='psp-rampages').edition,'PSP-exclusive');a.throws(()=>c.validateExtra({...d,world:'vc'}));a.throws(()=>c.validateExtra({...d,sets:[...d.sets.slice(0,3),d.sets[0]]}));for(const s of sets){const p=core.planEndpoints(s.records,s.records[0].id,s.records.at(-1).id);a.equal(p.stops.length,s.count);a.equal(p.stops[0].id,s.records[0].id);a.equal(p.stops.at(-1).id,s.records.at(-1).id);a.ok(p.units<=p.baseline)}console.log('PASS CTW four separate collection sets and anchored routes');"""],cwd=ROOT,check=True)

subprocess.run(["node","-e","""const a=require('node:assert/strict'),c=require('./atlas273-ctw-cameras.js'),cal=require('./atlas249-map-calibration.js');const rows=[{id:'a',x:0,y:0},{id:'b',x:1000,y:0},{id:'c',x:0,y:1000},{id:'d',x:1000,y:1000}],set={id:'cameras',revision:'rev'},fp='sha256:'+'a'.repeat(64),record={schema:1,world:'ctw:cameras',revision:'rev',fingerprint:fp,anchors:rows.map(r=>({id:r.id,u:10+r.x/20,v:80-r.y/20}))},rt={schema:1,world:'ctw',collection:'cameras',revision:'rev',ids:['d','b','a']};a.equal(c.restoreAlignment(record,set,fp,rows,cal).transform.project({x:500,y:500}).u,35);a.deepEqual(c.validateRoute(rt,set,rows).map(r=>r.id),['d','b','a']);a.throws(()=>c.restoreAlignment(record,{...set,id:'jumps'},fp,rows,cal));a.throws(()=>c.restoreAlignment(record,set,'sha256:'+'b'.repeat(64),rows,cal));a.throws(()=>c.restoreAlignment(record,{...set,revision:'new'},fp,rows,cal));a.throws(()=>c.validateRoute(rt,{...set,id:'jumps'},rows));a.throws(()=>c.validateRoute({...rt,ids:['a','a']},set,rows));a.throws(()=>c.validateRoute({...rt,ids:['x']},set,rows));console.log('PASS CTW saved routes and image-specific calibration guards');"""],cwd=ROOT,check=True)

subprocess.run(['node','scripts/test-atlas277-offline.cjs'],cwd=ROOT,check=True)

# 80 required contacts and a separate historically optional dealer; never mix source bases.
subprocess.run(["node","-e","""const a=require('node:assert/strict'),d=require('./data/atlas-ctw-81-dealer-references.json'),api=require('./atlas273-ctw-cameras.js'),core=require('./atlas-route-core.js');const sets=api.validateDealers(d);a.deepEqual(sets.map(s=>s.count),[80,1]);a.equal(sets[0].kind,'visited');a.equal(sets[1].records[0].name,'Sean');a.equal(sets[1].records[0].required,false);a.equal(sets[0].records.every(r=>r.required),true);a.equal(new Set(sets.flatMap(s=>s.records.map(r=>r.name))).size,81);a.equal(sets.find(s=>s.id==='dealers').records.find(r=>r.name==='Andy').x,622.8);a.equal(sets.find(s=>s.id==='dealers').records.find(r=>r.name==='Borris').y,797);a.equal(sets[1].records[0].x,378.9);a.equal(sets[0].records.find(r=>r.name==='Cazza').area,'Hove Beach');a.match(sets[0].records.find(r=>r.name==='Cazza').areaReview,/East Hook Bay/);for(const set of sets){if(set.count===1){a.equal(set.id,'bonus-sean');a.equal(set.records[0].name,'Sean');continue}const r=core.planEndpoints(set.records,set.records[0].id,set.records.at(-1).id);a.equal(r.stops.length,set.count);a.equal(new Set(r.stops.map(x=>x.id)).size,set.count);a.ok(r.units<=r.baseline)}for(const v of [{...d,world:'online'},{...d,sourceRevision:'old'},{...d,sets:[d.sets[0],d.sets[0]]},{...d,sets:[{...d.sets[0],records:[...d.sets[0].records.slice(0,79),d.sets[0].records[0]]},d.sets[1]]},{...d,sets:[d.sets[0],{...d.sets[1],records:[{...d.sets[1].records[0],name:'not-Sean'}]}]}])a.throws(()=>api.validateDealers(v));console.log('PASS CTW 80 dealers plus Sean, unique identity, evidence limits and independent reference routes');"""],cwd=ROOT,check=True)

subprocess.run(["node","-e","""const a=require('node:assert/strict'),m=require('./atlas273-ctw-cameras.js'),set={id:'dealers',revision:'r1',records:[{id:'a'},{id:'b'}]},fp='sha256:'+'a'.repeat(64),good={schema:1,world:'ctw',collection:'dealers',revision:'r1',fingerprint:fp,pins:[{id:'a',u:35,v:55},{id:'b',u:80,v:15}]};a.equal(m.validatePlacements(good,set,fp).size,2);for(const v of [{...good,world:'vcs'},{...good,collection:'cameras'},{...good,revision:'old'},{...good,fingerprint:'sha256:'+'b'.repeat(64)},{...good,pins:[{id:'no',u:1,v:2}]},{...good,pins:[{id:'a',u:1,v:2},{id:'a',u:2,v:3}]},{...good,pins:[{id:'a',u:120,v:3}]}])a.throws(()=>m.validatePlacements(v,set,fp));console.log('PASS private manual pin isolation, reversible position validation');"""],cwd=ROOT,check=True)
