#!/usr/bin/env python3
"""3D terrain release gate: never claim genuine elevation without heightfield bytes."""
from pathlib import Path
import json
import sys

root = Path(__file__).resolve().parents[1]
engine = (root / "atlas-3d.js").read_text(encoding="utf-8")
errors = []
worlds = {5: (930, 1300), 6: (1536, 1748)}
report = []
for game, (width, height) in worlds.items():
    asset = root / f"elevation-{game}.bin"
    expected = width * height * 2
    present = asset.is_file()
    valid = present and asset.stat().st_size == expected
    report.append({"game": game, "heightfield": asset.name,
                   "expected_bytes": expected, "present": present,
                   "valid": valid, "mode": "terrain" if valid else "perspective-only"})
    if present and not valid:
        errors.append(f"{asset.name} has incorrect size; must not deploy corrupt 3D data")
for snippet in ("terrain elevation not installed", "flat mesh until licensed heightfield",
                "setElevationBinary", "sourceHeights=null"):
    if snippet not in engine:
        errors.append(f"3D fallback or local-import safety contract missing: {snippet}")
print(json.dumps({"check": "3D geometry availability and honest fallback",
                  "worlds": report, "errors": errors}, indent=2))
sys.exit(bool(errors))
