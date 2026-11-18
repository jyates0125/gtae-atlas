#!/usr/bin/env python3
"""Atlas Universe 10.0 source and page integration guard, dependency-free."""
from pathlib import Path
import json
from html.parser import HTMLParser

D = Path(__file__).resolve().parents[1]
PAGES = {
    "atlas-database.html": "all",
    "atlas-characters.html": "character",
    "atlas-animals.html": "animal",
    "atlas-collectibles.html": "collectible",
}
NEEDED_IDS = {
    "totalRecords", "visibleRecords", "selectedCompare", "clearFilters",
    "universeSearch", "filterKind", "filterGame", "filterGroup", "sortBy",
    "researchOnly", "universeStatus", "gridView", "listView", "recordGrid",
    "results", "resultsCount", "pageStatus", "prevRecords", "nextRecords",
    "recordDialog", "detailContent", "compareDialog", "compareContent",
    "compareDock", "compareDockText", "openCompare", "resetCompare",
}

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.data_kind = ""
        self.refs = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.append(a["id"])
        if tag == "body":
            self.data_kind = a.get("data-atlas-kind", "")
        if tag in ("a", "script", "link"):
            ref = a.get("href") or a.get("src")
            if ref:
                self.refs.append(ref)

for page, expected_kind in PAGES.items():
    p = Page()
    p.feed((D / page).read_text(encoding="utf8"))
    assert p.data_kind == expected_kind, (page, p.data_kind)
    assert len(p.ids) == len(set(p.ids)), (page, "duplicate element ids")
    assert NEEDED_IDS.issubset(set(p.ids)), (page, sorted(NEEDED_IDS - set(p.ids)))
    assert "./atlas100-universe.js?v=100a" in p.refs, (page, "shared JS")
    assert "./atlas100-universe.css?v=100a" in p.refs, (page, "shared CSS")
    for ref in p.refs:
        if not ref.startswith("./"):
            continue
        local = ref[2:].split("?", 1)[0].split("#", 1)[0]
        if local:
            assert (D / local).is_file(), (page, "broken internal link", ref)

profiles = json.loads((D / "data/atlas-universe-profiles.json").read_text(encoding="utf8"))
assert profiles["schema"] == 1
assert len(profiles["records"]) >= 35, "Character and wildlife initial seed missing"
assert any(r["kind"] == "character" for r in profiles["records"])
assert any(r["kind"] == "animal" for r in profiles["records"])
for rec in profiles["records"]:
    assert rec["id"] and rec["name"] and rec["scope"] and rec["verification"], rec

js = (D / "atlas100-universe.js").read_text(encoding="utf8")
assert "team-jura-atlas90-collection-v1" in js, "Existing garage ownership key must be preserved"
assert "atlas90-seed.json" in js and "atlas-catalog.json" in js
assert "atlas-collections.json" in js
assert "atlas93-garage.html?addModel=" in js, "Garage deep link"
assert "selectCompare" in js and "showCompare" in js
assert "filterGame" in js and "researchOnly" in js
assert "UNVERIFIED" in js, "Provisional entries must be visibly marked"
assert "atlas.js" not in js, "Universe renderer must not rewrite map engine"
for page in ("atlas90-vehicles5.html", "atlas90-vehicles6.html", "atlas90-weapons.html"):
    h = (D / page).read_text(encoding="utf8")
    assert "./atlas100-showroom.css?v=100a" in h
    assert "./atlas100-showroom.js?v=100a" in h
    assert "./atlas90-gallery.js?v=90" in h, "Do not replace old gallery ownership logic"

for page in ("index.html", "maps.html", "atlas93-garage.html", "atlas97-journey.html", "atlas81-hq.html"):
    assert "./atlas-database.html" in (D / page).read_text(encoding="utf8"), page

print("PASS Atlas 10.0 Universe: pages, data, navigation, garage preservation, filters, image provenance")
