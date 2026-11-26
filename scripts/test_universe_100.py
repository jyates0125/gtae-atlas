#!/usr/bin/env python3
"""Atlas Universe 10.0 source and page integration guard, dependency-free."""
from pathlib import Path
import json
import re
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
    html = (D / page).read_text(encoding="utf8")
    for world in ("story", "online", "vi", "classic", "all"):
        assert f'data-world="{world}"' in html, (page, world)
    assert 'u-category-paths' in html and 'u-world-buttons' in html
    assert './atlas93-garage.html' in html or './atlas-forge-collections.html' in html

    assert any(re.fullmatch(r"\./atlas100-universe\.js\?v=\d+", ref) for ref in p.refs), (page, "shared JS")
    assert any(re.fullmatch(r"\./atlas100-universe\.css\?v=\d+", ref) for ref in p.refs), (page, "shared CSS")
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
assert "const DEFAULT_KIND=MODE==='all'?'vehicle':MODE" in js, "Universe may not mix record types by default"
assert "const DEFAULT_GAME=MODE==='animal'?'vi':MODE==='character'?'all':MODE==='collectible'?'story':'online'" in js, "Character Atlas must show All worlds by default"
assert 'x.aliases||[]' in js, "Names and aliases must both be searchable"
assert "r.scope==='vi'||/unverified" not in js, "Official GTA VI records must not be labeled unverified by default"
assert "WORLD_CODES.has(args.get('game'))" in js, "World-specific URL not supported"
assert "document.querySelectorAll('[data-world]')" in js, "World buttons are not wired"
assert "elarioCharacterPortrait" in js and "Portrait source" in js and "img.referrerPolicy" in js
assert "function scopeMatch(r)" in js
assert "image:'',imageCredit:''" in js, "VI vehicle listing must not use GTA V archive images as VI representations"
assert "return'Unclassified vehicle'" in js, "Never guess unknown model classes"
assert "function syncURL()" in js, "World filters must be shareable"

assert "atlas.js" not in js, "Universe renderer must not rewrite map engine"
gallery_versions=set()
for page in ("atlas90-vehicles5.html", "atlas90-vehicles6.html", "atlas90-weapons.html"):
    h = (D / page).read_text(encoding="utf8")
    style=re.search(r'\./atlas100-showroom\.css\?v=(\w+)',h)
    assert style and style.group(1) in ("202","100a"), "Missing current subject-specific showroom stylesheet"
    assert "./atlas100-showroom.js?v=337" in h
    # These shared gallery pages intentionally version their script together.
    # Guard presence and a coherent cache version, not an obsolete literal.
    m=re.search(r'\./atlas90-gallery\.js\?v=(\d+)',h)
    assert m and int(m.group(1))>=201, "Current gallery engine and cache-busting version required"
    gallery_versions.add(m.group(1))
assert len(gallery_versions)==1, "Vehicle and weapon galleries must use the same gallery engine version"
assert "const STORE='team-jura-atlas90-collection-v1'" in (D/'atlas90-gallery.js').read_text(), "Preserve original gallery collection key"

# The approved welcome is a guest gateway; database access lives on functional Home.
welcome=(D/"index.html").read_text(encoding="utf8")
assert 'data-j4728-welcome="true"' in welcome
assert 'class="action primary" href="./atlas-dashboard.html"' in welcome
assert "./atlas-database.html" not in welcome
for page in ("atlas-dashboard.html", "maps.html", "atlas93-garage.html", "atlas97-journey.html", "atlas81-hq.html"):
    assert "./atlas-database.html" in (D / page).read_text(encoding="utf8"), page

# Confirm current map directory still references its 13 existing local covers.
world_data=(D/'atlas98-worlds.js').read_text(encoding="utf8")
import re
covers=re.findall(r"\bart:'([^']+)'",world_data)
assert len(covers)==13 and len(set(covers))==13, covers
for art in covers:
    assert (D/'art'/art).is_file(), ("Map cover missing",art)
assert (D/'docs/ATLAS-SITE-COMPLETION-CONTRACT.md').exists()
print("PASS Atlas 10.2 world-first routes, source isolation, category tags, 13 existing covers, approved-brand pages")
