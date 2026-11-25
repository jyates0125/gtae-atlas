#!/usr/bin/env python3
"""Atlas 30.0: skip expensive unrelated PR synchronize checks.

GitHub's pull_request.paths matches the *whole PR diff*. For successive
commits on a long-lived staging PR, match the event's complete before/after delta.
Initial PR checks and manually dispatched release checks always run.
If a Git diff cannot be trusted, fail open and run the requested checks.
"""
from __future__ import annotations
import fnmatch
import json
import re
import os
from pathlib import Path
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]

def parse_patterns(source: str) -> list[str]:
    lines=source.splitlines()
    found=False
    patterns=[]
    for line in lines:
        if not found:
            if line=="    paths:":
                found=True
            continue
        if line.startswith("      - "):
            value=line.strip()[2:].strip()
            if value.startswith(("'",'"')) and value.endswith(value[:1]):
                value=value[1:-1]
            if value and not value.startswith("!"):
                patterns.append(value)
        elif line and not line.startswith("      ") and not line.lstrip().startswith("#"):
            break
    if not patterns:
        raise ValueError("No configured pull_request.paths filters")
    return patterns

def relevant(changed: list[str], patterns: list[str]) -> bool:
    # We use a conservative extra common-dependency rule for a reused script.
    # Each workflow still includes its own tracked workflow file as a trigger.
    return any(fnmatch.fnmatchcase(path,pattern) for path in changed for pattern in patterns)

def should_run(event: str, action: str, changed: list[str] | None, patterns: list[str]) -> bool:
    if event != "pull_request" or action != "synchronize":
        return True  # initial PR, reopen or manual dispatch: always verify
    return changed is None or relevant(changed,patterns)

def current_changes() -> list[str] | None:
    """Only skip when the complete synchronize event range is trustworthy.

    Shallow checkouts often lack an earlier pushed commit; in that case run
    checks rather than guessing a range or silently inspecting only HEAD^.
    """
    try:
        event_path=os.environ.get("GITHUB_EVENT_PATH")
        if not event_path:
            return None
        payload=json.loads(Path(event_path).read_text(encoding="utf-8"))
        if not isinstance(payload,dict) or payload.get("action")!="synchronize":
            return None
        before,after=payload.get("before"),payload.get("after")
        if not all(isinstance(v,str) and re.fullmatch(r"[0-9a-f]{40}",v) and v!="0"*40 for v in (before,after)):
            return None
        def git(*args):
            return subprocess.run(["git",*args],cwd=ROOT,check=True,text=True,capture_output=True,timeout=15).stdout
        if git("rev-parse","HEAD").strip()!=after:
            return None
        # Non-ancestor/force-push or unavailable shallow history is fail-open.
        git("merge-base","--is-ancestor",before,after)
        output=git("diff","--name-only","-z","--no-renames","--diff-filter=ACDMRT",before,after)
        return [name for name in output.split("\0") if name]
    except (OSError, ValueError, TypeError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None


def main() -> None:
    if len(sys.argv)!=2 or not sys.argv[1].startswith(".github/workflows/") or not sys.argv[1].endswith(".yml"):
        raise SystemExit("Usage: python scripts/atlas300-ci-delta.py .github/workflows/name.yml")
    name=sys.argv[1]
    workflow=ROOT/name
    if not workflow.is_file() or workflow.resolve().parent!=(ROOT/".github/workflows").resolve():
        raise SystemExit("Workflow must be a local tracked .github/workflows/*.yml file")
    patterns=parse_patterns(workflow.read_text(encoding="utf-8"))
    event=os.getenv("GITHUB_EVENT_NAME","")
    action=os.getenv("ATLAS_PR_ACTION",os.getenv("GITHUB_EVENT_ACTION",""))
    changed=current_changes() if event=="pull_request" and action=="synchronize" else None
    selected=should_run(event,action,changed,patterns)
    status="RUN" if selected else "SKIP"
    print(f"[Atlas 30.0] {status} {name}: {len(changed) if changed is not None else 'unavailable'} head-delta files; paths={len(patterns)}")
    if changed is not None:
        print("Head files:",", ".join(changed[:40]) or "(no paths)")
    output=os.getenv("GITHUB_OUTPUT")
    if output:
        with open(output,"a",encoding="utf-8") as f:
            f.write("run="+("true" if selected else "false")+"\n")
    else:
        print("run="+("true" if selected else "false"))

if __name__=="__main__":
    main()
