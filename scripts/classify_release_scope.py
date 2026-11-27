#!/usr/bin/env python3
"""Shadow-only classifier. Never authorizes skipping a required check."""
import argparse
import json
import re
import subprocess

DOCS = {"docs/FOCUSED-PRODUCTION-VALIDATION-PROPOSAL.md",
        "docs/PRODUCTION-RELEASE-VERIFICATION.md"}
SEASONAL = {"elario-seasonal-2026.css", "elario-seasonal-2026.js",
            "art/elario-thanksgiving-2026.webp",
            "scripts/test_elario_seasonal_2026.py"}
HTML = {"index.html", "elario.html"}
CACHE = re.compile(rb"(elario-seasonal-2026\.(?:css|js)\?v=)[0-9]+")
SHA = re.compile(r"[0-9a-f]{40}")

def git(*args):
    return subprocess.check_output(["git", *args], stderr=subprocess.PIPE)

def parse_raw(raw):
    if not raw:
        return []
    if not raw.endswith(b"\0"):
        raise ValueError("unterminated diff")
    fields = raw[:-1].split(b"\0")
    if len(fields) % 2:
        raise ValueError("malformed diff")
    changes = []
    for i in range(0, len(fields), 2):
        m = re.fullmatch(rb":([0-7]{6}) ([0-7]{6}) [0-9a-f]{40} [0-9a-f]{40} ([AMDT])", fields[i])
        if not m:
            raise ValueError("unsupported diff status")
        old, new, status = (v.decode("ascii") for v in m.groups())
        path = fields[i+1].decode("utf-8", errors="strict")
        if not path or path.startswith("/") or any(p in ("", ".", "..") for p in path.split("/")):
            raise ValueError("invalid path")
        changes.append((path, old, new, status))
    return changes

def cache_only(before, after):
    return (before != after and CACHE.search(before) is not None
            and CACHE.sub(rb"\g<1>VERSION", before) == CACHE.sub(rb"\g<1>VERSION", after))

def classify(base, head):
    result = {"base": base, "head": head, "suggested_scope": "full",
              "effective_execution": "full", "reuse_authorized": False,
              "paths": [], "reason": "unclassified"}
    try:
        if not SHA.fullmatch(base) or not SHA.fullmatch(head):
            raise ValueError("require exact commit SHAs")
        for ref in (base, head):
            if git("rev-parse", "--verify", ref+"^{commit}").decode().strip() != ref:
                raise ValueError("not a resolved commit")
        git("merge-base", "--is-ancestor", base, head)
        changes = parse_raw(git("diff", "--raw", "-z", "--no-renames", "--no-abbrev", base, head, "--"))
        result["paths"] = [c[0] for c in changes]
        if not changes:
            result["reason"] = "no changes; no authorization"
            return result
        for path, old, new, status in changes:
            if new != "100644" or status not in ("A", "M") or old not in ("000000", "100644"):
                result["reason"] = "deletion, type or mode change: "+path
                return result
            if path in HTML:
                if status != "M" or not cache_only(git("show", base+":"+path), git("show", head+":"+path)):
                    result["reason"] = "HTML changed beyond seasonal cache revision: "+path
                    return result
            elif path not in DOCS and path not in SEASONAL:
                result["reason"] = "unknown or shared dependency: "+path
                return result
        if all(c[0] in DOCS for c in changes):
            result["suggested_scope"] = "documentation"
            result["reason"] = "explicit documentation allowlist; review required"
        else:
            result["suggested_scope"] = "seasonal"
            result["reason"] = "explicit seasonal allowlist and cache-only HTML; review required"
    except (ValueError, UnicodeError, OSError, subprocess.CalledProcessError) as exc:
        result["reason"] = "fail closed: "+type(exc).__name__
    return result

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("base")
    parser.add_argument("head")
    args = parser.parse_args()
    print(json.dumps(classify(args.base, args.head), indent=2, sort_keys=True))

if __name__ == "__main__":
    main()
