#!/usr/bin/env python3
"""Prove consolidation changes exactly six duplicated browser calls, nothing else."""
import re
import subprocess
from pathlib import Path
from collections import Counter

BASE = "6872bf4b0fa0ab91cb2dbc588a9b4451fc69d0d2"
PATH = ".github/workflows/team-jura-release.yml"
SCRIPTS = {
    "python scripts/test_atlas171_browser.py",
    "python scripts/test_atlas186_route_browser.py",
    "python scripts/test_atlas220_vi_mobile_browser.py",
}
BROAD = {"chromium-and-static", "microsoft-edge"}
FOCUS = {"atlas22-focus-chromium", "atlas22-focus-edge"}
OLD = "Verify Cayo mission board and capture phone/desktop screenshots"
NEW = "Verify classic worlds, offline recovery, navigation and VI feature journeys"

def process(source, remove=False):
    job = ""
    counts = Counter()
    output = []
    for line in source.splitlines(keepends=True):
        match = re.fullmatch(r"  ([\w-]+):\s*", line)
        if match:
            job = match[1]
        command = line.strip().removeprefix("run: ")
        if command in SCRIPTS:
            counts[job, command] += 1
            if remove and job in BROAD:
                continue
        if remove and job in BROAD and "name: "+OLD in line:
            line = line.replace(OLD, NEW)
        output.append(line)
    return "".join(output), counts

def main():
    before = subprocess.check_output(["git", "show", BASE+":"+PATH]).decode()
    after = Path(PATH).read_bytes().decode()
    expected, old_counts = process(before, True)
    _, new_counts = process(after)
    assert after == expected, "Unexpected workflow changes; review required"
    assert old_counts == Counter({(j, s): 1 for j in BROAD | FOCUS for s in SCRIPTS}), old_counts
    assert new_counts == Counter({(j, s): 1 for j in FOCUS for s in SCRIPTS}), new_counts
    assert "needs: [chromium-and-static, microsoft-edge, atlas22-focus-chromium, atlas22-focus-edge]" in after
    print("PASS: exactly six duplicate invocations removed; all six distinct browser/feature checks preserved")
    print("PASS: all other commands, gates, permissions and package dependencies identical")

if __name__ == "__main__":
    main()
