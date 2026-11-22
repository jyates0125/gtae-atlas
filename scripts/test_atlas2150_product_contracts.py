#!/usr/bin/env python3
"""Focused Atlas 2150 cross-product regression guards.

Run on repository source before browser QA. These assertions do not replace
rendered Chromium/Edge, Safari, or owner visual acceptance.
"""
from pathlib import Path
import re

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
require("atlas99-garage3d.js", "const aircraft=", "const watercraft=", "const helicopter=")

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
