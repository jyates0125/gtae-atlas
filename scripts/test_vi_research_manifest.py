#!/usr/bin/env python3
"""Validate the bundled GTA VI research manifest against its snapshot.

Run: python scripts/test_vi_research_manifest.py
This test is offline and does not download or replace upstream data.
"""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
snapshot = json.loads((root / "data/gtadb-6.json").read_text(encoding="utf-8"))
manifest = json.loads((root / "data/gtadb-6-manifest.json").read_text(encoding="utf-8"))

assert snapshot["game"] == manifest["game"] == "6"
assert snapshot["license"] == manifest["license"] == "CC BY 4.0"
assert snapshot["sourceHash"] == manifest["sourceHash"], "Snapshot/manifest hash mismatch"
assert snapshot["sourceUrl"] == manifest["sourceUrl"]
assert snapshot["count"] == manifest["count"] == len(snapshot["records"])
assert snapshot["count"] == snapshot["mappedCount"] + snapshot["searchOnlyCount"]
assert snapshot["mappedCount"] == manifest["mappedCount"]
assert snapshot["searchOnlyCount"] == manifest["searchOnlyCount"]
assert manifest["status"].startswith("provisional"), "Research must remain unverified"
print("GTA VI research manifest consistency PASS:", manifest["count"], "records")

# November 28 pinned candidate: verify exact stored records bytes and held ID behavior.
if snapshot.get("sourceHashAlgorithm") == "SHA-256 of exact compact records JSON as stored":
    import hashlib
    raw=(root/"data/gtadb-6.json").read_text(encoding="utf-8").rstrip("\n")
    records_raw=raw.split(',"records":',1)[1][:-1]
    assert hashlib.sha256(records_raw.encode("utf-8")).hexdigest()==snapshot["sourceHash"]
    assert json.loads(records_raw)==snapshot["records"]
    assert snapshot["heldForReviewIds"]==manifest["heldForReviewIds"]
    assert all(snapshot["records"][key][1]==[] for key in snapshot["heldForReviewIds"])
    assert snapshot["upstreamRevision"]==manifest["upstreamRevision"]
