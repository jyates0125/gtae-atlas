#!/usr/bin/env python3
"""Atlas 33.0: 15-game heist notes save safety, without claims of map/data parity."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
names=['fleeca','prison-break','humane-labs','series-a','pacific-standard','doomsday-act-1','doomsday-act-2','doomsday-act-3','diamond-casino','cayo-perico','cluckin-bell','salvage-yard','auto-shop','agency-vip','kortz-center']
assert len(names)==15 and len(set(names))==15
for name in names:
    page=root/f'heist-{name}.html'
    assert page.is_file(),name
    assert f'data-heist="{name}"' in page.read_text(encoding='utf-8'),name
js=(root/'atlas164-heist-workspace.js').read_text(encoding='utf-8')
directory=(root/'heist-directory.js').read_text(encoding='utf-8')
css=(root/'atlas164-heist-workspace.css').read_text(encoding='utf-8')
for name in names:
    assert f"'{name}'" in js,('missing heist',name)
assert "function readNotes()" in js
assert "value.heist!==id" in js
assert "JSON.parse(raw)" in js
assert "if(!setSafety(latest))return;" in js
assert "if(!setSafety(refreshed))return;" in js
assert "if(!setSafety(latest))throw Error" in js
assert "original saved text" in js
assert "downloadText(raw" in js
assert "team-jura-'+id+'-unreadable-notes-raw.txt" in js
assert "localStorage.getItem(key)!==expectedRaw" in js
assert "const next={...latest.value,version:1,heist:id" in js
assert "if(typeof next[name]==='string'&&next[name].trim())" in js
assert "delete next[name]" in js
assert "Object.keys(next).length>0" in js
assert "window.addEventListener('storage'" in js
assert "function safeJson(" not in directory # old corrupt-to-empty helper gone
assert "damaged:check.damaged||notes.damaged||focus.damaged" not in directory or "const damaged=check.damaged||notes.damaged||focus.damaged" in directory
assert "Saved data needs recovery" in directory
assert "teamjura-heist-plan-v1:" in directory and "teamjura-heist-focus-v1:" in directory
assert 'id="j330-notes-recovery"' not in js # generated dynamically with the same id
assert "recovery.id='j330-notes-recovery'" in js
assert "#j330-notes-recovery[hidden]" in css
assert ".j164-field textarea:disabled" in css
print("Atlas 33.0: fifteen independent heist workspaces, fail-closed raw save recovery, cross-tab field merging and exact-page styling contracts passed")
