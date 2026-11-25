#!/usr/bin/env python3
"""Atlas 15.7 directory: nine classic reference pages are concise but their actual limitations remain honest."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
js=(root/'atlas98-portal.js').read_text()
css=(root/'atlas98-portal.css').read_text()
worlds=(root/'atlas98-worlds.js').read_text()
assert "w.features.slice(0,3)" in js and "'world-coverage-note',w.note" in js
assert "world-feature-summary" in js and "world-coverage-note" in js
assert 'world-feature-summary' in css and '-webkit-line-clamp:2' in css
assert "id:'iii'" in worlds and "160 source locations" in worlds, "Retain GTA III source-backed upgrade"
# Vice City and both IV episodes now have source-backed interactive map workspaces.
rows={m.group(1):line for line in worlds.splitlines() if (m:=re.search(r"\{id:'([^']+)'",line))}
assert len(rows)==13
assert {key for key,line in rows.items() if "kind:'gateway'" in line}=={'vcs','lcs','ctw'}, "Only genuinely uncalibrated gateways remain"
for key in ('vc','iii','iv','sa','tlad','tbogt'):
    assert "kind:'limited'" in rows[key], (key,'source-backed map must not regress to gateway')
for key in ('vcs','lcs'):
    assert 'Built-in calibrated collectible pins remain unavailable' in rows[key]
assert "atlas-iv.html?scope=tlad" in rows['tlad'] and "atlas-iv.html?scope=tbogt" in rows['tbogt']
assert worlds.count("group:'additional'")==9, "All nine additional game destinations remain available"
assert "publisher coordinates need alignment" in worlds, "Do not discard truthful underlying scope disclosures"
print('Atlas 15.7 concise world directory + full registry truth PASS')
