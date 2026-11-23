#!/usr/bin/env python3
"""3D terrain release gate: never claim genuine elevation without heightfield bytes."""
from pathlib import Path
from array import array
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
    relief = None
    if valid:
        samples = array("H")
        with asset.open("rb") as handle:
            samples.fromfile(handle, width * height)
        relief = any(sample != samples[0] for sample in samples)
        if not relief:
            errors.append(f"{asset.name} contains only one elevation value")
    report.append({"game": game, "heightfield": asset.name,
                   "expected_bytes": expected, "present": present,
                   "valid": bool(valid and relief), "relief_detected": relief,
                   "mode": "terrain" if valid and relief else "perspective-only"})
    if present and not valid:
        errors.append(f"{asset.name} has incorrect size; must not deploy corrupt 3D data")
for snippet in ("No elevation data available for true 3D", "flat mesh until licensed heightfield",
                "setElevationBinary", "prepareElevation", "sourceHeights=null"):
    if snippet not in engine:
        errors.append(f"3D fallback or local-import safety contract missing: {snippet}")
print(json.dumps({"check": "3D geometry availability and honest fallback",
                  "worlds": report, "errors": errors}, indent=2))
sys.exit(bool(errors))
