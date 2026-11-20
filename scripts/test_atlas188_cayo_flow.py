#!/usr/bin/env python3
"""Cayo 18.8 regression: one map legend/route choice, map-first quick access."""
from pathlib import Path
r=Path(__file__).resolve().parents[1]
quick=(r/'atlas188-cayo-flow.js').read_text(encoding='utf-8')
style=(r/'atlas188-cayo-flow.css').read_text(encoding='utf-8')
route=(r/'atlas186-cayo-route.js').read_text(encoding='utf-8')
loader=(r/'heist-pages.js').read_text(encoding='utf-8')
assert "document.body.dataset.heist!=='cayo-perico'" in quick
assert "const route=window.teamJuraCayoPinRoute" in quick
assert "new Set(route.getState().categories)" in quick
assert "route.setCategories(selected)" in quick
assert "route.setCategories([...selected])" in quick
assert "row.getAttribute('aria-pressed')" in quick
assert "event.target.closest?.('.j180-legend-row[data-cat]')" in quick
assert "teamjura:cayo:route-categories" in quick
assert "teamjura:cayo:route-updated" in quick
for kind in ("all","loot","equipment","entry","intel","chests"):
 assert f"id:'{kind}'" in quick,kind
for phrase in ("EXPLORE THE ISLAND","Pick starting pin","Map accuracy, sources & credits",
               "19 possible", "not official live confirmation","not drivable paths",
               "atlas-credits.html","GTALens references"):
 assert phrase in quick,phrase
for phrase in ("function setCategories(values)","render,setCategories","const DEFAULT=ALL_CATS.slice()",
               "window.dispatchEvent(new CustomEvent('teamjura:cayo:route-categories'",
               "window.dispatchEvent(new CustomEvent('teamjura:cayo:route-updated'",
               "jump.hidden=true","oldRouteMode.textContent='Route details'"):
 assert phrase in route,phrase
for phrase in ("atlas188-cayo-flow.js?v=188","atlas188-cayo-flow.css?v=188"):
 assert phrase in loader,phrase
assert loader.index('atlas186-cayo-route.js?v=187')<loader.index('atlas188-cayo-flow.js?v=188')
assert ".j188-quickbar" in style and "overflow-x:auto" in style
assert "j188-cayo-smooth" in style
assert quick.count("{")==quick.count("}")
assert style.count("{")==style.count("}")
print("PASS Cayo 18.8: one legend, one map-visible route filter, map-first quick-start, cited accuracy, mobile CSS")
