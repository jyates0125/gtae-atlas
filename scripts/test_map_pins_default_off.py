#!/usr/bin/env python3
"""Regression guard for pin-free starts in Team Jura map worlds."""
from pathlib import Path

source = (Path(__file__).resolve().parents[1] / "atlas.js").read_text(encoding="utf-8")
checks = {
    "global pin visibility starts disabled": "onlyFavorites=false,showPins=false,selected=null",
    "world changes reset pin visibility": "function switchGame(g){if(!['5','6','online'].includes(g))return;showPins=false;",
    "pin button reveals all categories when nothing was selected": "if(showPins&&enabled().size===0)active[filterScope()]=null;render()",
    "floating named layers can activate from pin-free startup": "if(l)updateNamedLayerVisibility([id],!showPins||namedHidden().has(id))",
    "sidebar named layers can activate from pin-free startup": "updateNamedLayerVisibility([id],!showPins||hidden.has(id))",
    "global toggle is user operated": "$('togglePins').onclick=()=>{showPins=!showPins;",
}
for label, snippet in checks.items():
    assert snippet in source, label
for mode in ("'5-story'", "'5-online'", "'6'"):
    assert mode in source, f"Missing category scope {mode}"
assert "if(showPins&&enabled().size===0)active[filterScope()]=null" in source
print("Team Jura map startup visibility regression PASS")
