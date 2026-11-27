#!/usr/bin/env python3
"""Verify an exact public payload and produce a cross-run comparison fingerprint.

Shadow-only: never accepts a failed build or authorizes reuse. Only the two
documented generated metadata files are normalized, after full validation.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re

IDENTITY = "atlas-build-identity.json"
MANIFEST = "release-manifest.json"
SHA = re.compile(r"[0-9a-f]{40}")
DIGEST = re.compile(r"[0-9a-f]{64}")

def digest(path):
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def unique_json(path):
    def pairs(items):
        out = {}
        for k, v in items:
            if k in out:
                raise ValueError("duplicate JSON key: " + k)
            out[k] = v
        return out
    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=pairs)

def require(condition, message):
    if not condition:
        raise ValueError(message)

def snapshot(root, revision):
    require(bool(SHA.fullmatch(revision)), "exact expected revision required")
    require(root.is_dir() and not root.is_symlink(), "invalid public directory")
    actual = {}
    folded = set()
    for p in root.rglob("*"):
        require(not p.is_symlink(), "symbolic link: " + str(p))
        if p.is_dir():
            continue
        require(p.is_file(), "unexpected entry: " + str(p))
        rel = p.relative_to(root).as_posix()
        require(rel.casefold() not in folded, "case collision: " + rel)
        folded.add(rel.casefold())
        actual[rel] = p
    require(IDENTITY in actual and MANIFEST in actual, "missing metadata")
    identity = unique_json(actual[IDENTITY])
    require(set(identity) == {"schema", "revision", "generatedAt"}, "unknown identity format")
    require(identity["schema"] == 1 and identity["revision"] == revision, "identity mismatch")
    require(isinstance(identity["generatedAt"], str) and bool(identity["generatedAt"]), "missing build timestamp")
    manifest = unique_json(actual[MANIFEST])
    require(set(manifest) == {"version", "generatedAt", "fileCount", "bytes", "files"}, "unknown manifest format")
    require(manifest["generatedAt"] == identity["generatedAt"], "timestamp mismatch")
    require(manifest["version"] == "9.8C", "unknown build manifest version")
    require(isinstance(manifest["files"], list), "invalid file inventory")
    entries = {}
    for item in manifest["files"]:
        require(isinstance(item, dict) and set(item) == {"path", "bytes", "sha256"}, "invalid entry")
        rel = item["path"]
        require(isinstance(rel, str) and rel in actual and rel != MANIFEST and rel not in entries, "unknown or duplicate entry")
        require(type(item["bytes"]) is int and item["bytes"] >= 0 and actual[rel].stat().st_size == item["bytes"], "size mismatch: " + rel)
        require(isinstance(item["sha256"], str) and bool(DIGEST.fullmatch(item["sha256"])) and digest(actual[rel]) == item["sha256"], "hash mismatch: " + rel)
        entries[rel] = item
    require(set(entries) == set(actual) - {MANIFEST}, "incomplete manifest")
    require(type(manifest["bytes"]) is int and manifest["bytes"] == sum(x["bytes"] for x in entries.values()), "manifest byte count mismatch")
    require(type(manifest["fileCount"]) is int and 0 < manifest["fileCount"] <= len(entries), "invalid source count")
    payload = [entries[p] for p in sorted(entries) if p != IDENTITY]
    canonical = json.dumps({"revision": revision, "schema": 1, "manifest_version": manifest["version"], "source_count": manifest["fileCount"], "files": payload}, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return {"schema": 1, "revision": revision, "payload_sha256": hashlib.sha256(canonical.encode()).hexdigest(), "payload_files": len(payload), "payload_bytes": sum(x["bytes"] for x in payload), "build_timestamp": identity["generatedAt"]}

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("root", type=Path)
    p.add_argument("revision")
    p.add_argument("--output", type=Path, required=True)
    a = p.parse_args()
    result = snapshot(a.root, a.revision)
    a.output.write_text(json.dumps(result, indent=2, sort_keys=True)+"\n", encoding="utf-8")
    print(json.dumps(result, sort_keys=True))

if __name__ == "__main__":
    main()
