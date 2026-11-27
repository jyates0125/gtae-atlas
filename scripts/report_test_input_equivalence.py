#!/usr/bin/env python3
"""Public-safe shadow report of exact Git input equivalence.

Tree equality is necessary but not sufficient for carrying forward a test.
No result of this module authorizes reuse, trusts a user-supplied CI status,
or substitutes for runtime, security, rights, toolchain or deployment checks.
"""
import argparse
import json
import re
import subprocess

from classify_release_scope import classify

SHA = re.compile(r"[0-9a-f]{40}")

def git(*args):
    return subprocess.check_output(["git", *args], stderr=subprocess.PIPE).decode("ascii").strip()

def compare_inputs(tested, candidate):
    out = {"schema": 1, "tested": tested, "candidate": candidate,
           "source_equivalent": False, "reuse_authorized": False,
           "effective_execution": "full", "status": "requires_validation"}
    try:
        for revision in (tested, candidate):
            if not SHA.fullmatch(revision) or git("rev-parse", "--verify", revision+"^{commit}") != revision:
                raise ValueError("exact commit required")
        git("merge-base", "--is-ancestor", tested, candidate)
        tested_tree = git("rev-parse", tested+"^{tree}")
        candidate_tree = git("rev-parse", candidate+"^{tree}")
        out.update(tested_tree=tested_tree, candidate_tree=candidate_tree)
        if tested_tree == candidate_tree:
            out.update(source_equivalent=True, status="source_identical",
                       reason="all tracked inputs identical; CI provenance and environment still require validation")
        else:
            scope = classify(tested, candidate)
            out.update(suggested_scope=scope["suggested_scope"], paths=scope["paths"],
                       reason="tracked inputs differ; dependency proof required")
    except (ValueError, OSError, UnicodeError, subprocess.CalledProcessError) as exc:
        out["reason"] = "fail closed: "+type(exc).__name__
    return out

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("tested")
    p.add_argument("candidate")
    args = p.parse_args()
    print(json.dumps(compare_inputs(args.tested, args.candidate), indent=2, sort_keys=True))

if __name__ == "__main__":
    main()
