#!/usr/bin/env python3
"""Regression guard for pin-free starts in Team Jura map worlds."""
from pathlib import Path

source = (Path(__file__).resolve().parents[1] / "atlas.js").read_text(encoding="utf-8")
checks = {
    "global pin visibility starts disabled": "onlyFavorites=false,showPins=false,selected=null",
    "world changes reset pin visibility": "function switchGame(g){if(!['5','6','online'].includes(g))return;showPins=false;",
    "pin button reveals all categories when nothing was selected": "if(showPins&&enabled().size===0)active[filterScope()]=null;render()",
    "floating named layers can activate from pin-free startup": "if(l)updateNamedLayerVisibility([id],!showPins||namedHidden().has(id))",
    "sidebar named layers can activate from pin-free startup": "updateNamedLayerVisibility([id],!on)",
    "global toggle is user operated": "$('togglePins').onclick=()=>{showPins=!showPins;",
}
for label, snippet in checks.items():
    assert snippet in source, label
for mode in ("'5-story'", "'5-online'", "'6'"):
    assert mode in source, f"Missing category scope {mode}"
assert "if(showPins&&enabled().size===0)active[filterScope()]=null" in source
extra = [
    ("3D respects global pins-off", "places:()=>showPins?cachedVisibleMarkers.slice(0,12000):(selected?.game===game?[selected]:[])"),
    ("hide all disables map pins", "showPins=false;active[filterScope()]=new Set();page=0;render()"),
    ("named only-layer enables pins", "showPins=true;active[filterScope()]=null;hiddenNamed[namedScope()]"),
    ("pinch zoom anchored", "anchor:fromScreen(mid.x,mid.y)"),
    ("cached viewport markers refreshed by filters", "function render(){cachedVisibleMarkers=matches();"),
    ("canvas marker draw reads cached results", "const visible=showPins?cachedVisibleMarkers:[]"),
    ("pinch does not trigger tap", "if(wasSingle&&!p.multi&&(p.travel||0)<7)tapMap(spot)"),
    ("source snapshot preferred even if smaller", "if(v.length>=datasets[g].length||refresh)" ),
]
for label, fragment in extra:
    if label == "source snapshot preferred even if smaller":
        assert fragment not in source, label
    else:
        assert fragment in source, label
print("Team Jura map startup and gesture regression PASS")

# Map entry points must invalidate browser/CDN caches together.
for page in ("atlas.html", "atlas-online.html", "atlas-vi.html"):
    html = (Path(__file__).resolve().parents[1] / page).read_text(encoding="utf-8")
    assert "./atlas.js?v=102-map-completion" in html, (page, "stale map script URL")
sw = (Path(__file__).resolve().parents[1] / "atlas-sw.js").read_text(encoding="utf-8")
assert "team-jura-atlas-v102-map-completion" in sw, "Service worker cache version mismatch"
assert "./atlas-sw.js?v=102-map-completion" in source, "Service worker registration URL stale"
print("Team Jura map release cache version contract PASS")
