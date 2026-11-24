#!/usr/bin/env python3
"""Fail-closed audit of the generated public/ Cloudflare Pages artifact."""
from pathlib import Path
import json
import re
import sys

root = Path(__file__).resolve().parents[1]
out = root / "public"
errors = []
required = ("index.html", "maps.html", "atlas.html", "atlas-online.html",
            "atlas-vi.html", "atlas90-vehicles5.html", "atlas93-garage.html",
            "one-last-ride.html", "atlas-build-identity.json", "_headers")
for name in required:
    if not (out / name).is_file():
        errors.append(f"Missing published asset: {name}")
if out.exists():
    for path in out.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(out).as_posix()
        parts = set(path.relative_to(out).parts)
        if parts.intersection({".git", ".github", "private", "private-lab",
                               "research-private", "user-exports", "node_modules",
                               "scripts", "tests", "docs", "qa-evidence"}):
            errors.append(f"Private/development directory published: {rel}")
        if path.name.startswith(".env") or path.suffix.lower() in {
                ".pem", ".key", ".p12", ".sqlite", ".db", ".py", ".ps1"}:
            errors.append(f"Sensitive/development file published: {rel}")
    identity_path = out / "atlas-build-identity.json"
    if identity_path.is_file():
        try:
            identity = json.loads(identity_path.read_text())
            revision = identity.get("revision")
            if not isinstance(revision, str) or not re.fullmatch(r"[0-9a-fA-F]{40}", revision):
                errors.append("Built identity must contain the exact 40-character commit SHA")
        except (ValueError, OSError, AttributeError):
            errors.append("Invalid build identity JSON")
print(json.dumps({"audit": "Atlas 33.9 published artifact", "passed": not errors,
                  "errors": errors}, indent=2))
sys.exit(bool(errors))
