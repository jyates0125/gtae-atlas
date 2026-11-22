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

# Read-only collection hub: world isolation, private named-build deep links and ownership semantics.
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
assert.ok(rows.some(x=>x.href.includes('variant=Sun%20%26%20Moon')));
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
        "atlas98-approved-hero.webp")
assert (ROOT / "art/atlas98-approved-hero.webp").is_file(), "Approved hero artwork missing"

# Confirm the stage-gate rules and the adopted studio vision stay discoverable.
require("docs/TEAM-JURA-STANDING-CHARTER.md", "ELARIO-STUDIOS-OPERATING-CHARTER-V2-PROPOSAL.md")
require("docs/ELARIO-STUDIOS-OPERATING-CHARTER-V2-PROPOSAL.md",
        "The Elario 2150 Vision", "Owner-approved", "Release hold triggers")

print("PASS Atlas 2150 focused cross-product source contracts")
