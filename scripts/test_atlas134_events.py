#!/usr/bin/env python3
"""Atlas 13.4 regression: automatic data loading without fake active event claims."""
from pathlib import Path
import json,subprocess
R=Path(__file__).resolve().parents[1]
def src(name): return (R/name).read_text(encoding="utf8")
pack=json.loads(src("data/online-rotation-current.json"))
assert pack["schema"]==1
assert pack["rotations"]=={}, "Do not ship fabricated current spawn IDs"
conditions=src("atlas-conditions.js")
assert "halloween2026" in conditions
assert "Halloween 2026 ended November 4" in conditions
assert "closed:'Not active'" in conditions
activities=src("atlas-activities.html")
assert "Loading the site's reviewed rotation information automatically" in activities
assert "Advanced · Import a personal rotation file (optional)" in activities
assert "<h2>Activity directory · active and inactive</h2>" in activities
js=src("atlas-activities.js")
daily=src("atlas87-daily.js")
for value in (js,daily):
 assert "fetch('./data/online-rotation-current.json'" in value
assert "loadReviewedRotations();" in js
assert "seasonExpired" in src("atlas88-events.js")
assert "checkbox.disabled=true" in src("atlas88-events.js")
assert "Import dated position JSON" not in src("atlas87-daily.html")
node=r"""
const assert=require('node:assert/strict');
const C=require('./atlas-conditions.js');
const now=Date.parse('2026-11-18T20:00:00Z');
let state=C.safeState({events:{halloween:true},completed:{},seen:{},flags:{}});
for(const id of ['pumpkins','ufo','ghosts-exposed','ghost-1']){
 let st=C.evaluate(id,{mode:'online',state,now,hour:20});
 assert.equal(st.status,'closed',id+' must be inactive after the season');
 assert.match(st.reason,/ended November 4/);
}
assert.equal(C.statusText('closed'),'Not active');
assert.equal(C.evaluate('gun-van',{mode:'online',state,now,snapshot:{schema:1,rotations:{}}}).status,'unknown');
console.log('PASS event status and absent rotation feed');
"""
subprocess.run(["node","-e",node],cwd=R,check=True)
print("PASS Atlas 13.4 automatic rotation file, optional JSON and ended Halloween event")
