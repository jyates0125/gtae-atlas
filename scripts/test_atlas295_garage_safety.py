#!/usr/bin/env python3
"""Source guard for scoped, non-destructive Garage persistence."""
from pathlib import Path

root=Path(__file__).resolve().parents[1]
js=(root/'atlas93-garage.js').read_text(encoding='utf-8')
assert "function readChecked(key,fallback,valid)" in js
assert "function saveOwnedMark(id,shouldOwn)" in js
assert "function saveGarageName(name,remove=false)" in js
assert "function readLiveGallery()" in js and "const latest=readLiveGallery();" in js, "Ownership must re-read and normalize live registry"
assert "function readLiveMeta()" in js and "const latest=readLiveMeta();" in js, "Garage naming must re-read and normalize latest metadata"
assert "const liveMeta=readLiveMeta(),liveGallery=readLiveGallery();" in js, "Export both live storage keys"
assert "latest.owned??{}" in js and "latest.garages??['Main Garage']" in js, "Preserve legacy missing optional fields"
assert "const latestMeta=readLiveMeta(),latestGallery=readLiveGallery();" in js, "Import must read validated latest data"
assert "if(Object.values(latest.vehicles).some(v=>v.garage===name))" in js, "Block occupied-garage removal"
assert "if(saveOwners(r.id,!owned))paint()" in js
assert "saveOwners(r.id,owned.checked)" in js
assert "if(saveGarageName(g,true))" in js
assert "if(saveGarageName(name))" in js
assert "function persist()" not in js, "Do not bring back a stale two-key save"
owner=js.split('function saveOwnedMark(id,shouldOwn)',1)[1].split('function saveGarageName(',1)[0]
names=js.split('function saveGarageName(name,remove=false)',1)[1].split('function notice(',1)[0]
assert "localStorage.setItem(S," in owner and "localStorage.setItem(META," not in owner
assert "localStorage.setItem(META," in names and "localStorage.setItem(S," not in names
print('Atlas 29.5 scoped registry, Garage names and backup contracts passed')
