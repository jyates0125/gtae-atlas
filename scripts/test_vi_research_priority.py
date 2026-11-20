#!/usr/bin/env python3
"""Static contract: prefer the maintained research snapshot, fallback only on failure."""
from pathlib import Path

source=(Path(__file__).resolve().parents[1] / "atlas-research.js").read_text(encoding="utf-8")
expected="for(const url of ['./data/gtadb-6.json','./gtadb-v6.json'])"
assert expected in source, "Research sources must be checked in priority order"
assert "if(list.length>0){data=val;origin=url;break}" in source, "Stop at first valid snapshot"
assert "list.length>normalize(data).length" not in source, "Do not favor older sources by record count"
assert "No GTA VI research landmarks loaded" in source, "Preserve missing-data diagnostics"
print("GTA VI research source priority check PASS")
