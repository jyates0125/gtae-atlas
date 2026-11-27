#!/usr/bin/env python3
"""Prove the six duplicate removals and the exact additive player release gate."""
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

# Reviewed additive gate. Keep its exact contents under proof; do not permit
# unrelated workflow edits, missing test calls, or relaxed packaging dependencies.
PLAYER_GATE = "  # Validate recent player journeys on the combined release tree, not only\n  # the earlier feature PRs. This is a required dependency of packaging.\n  player-workspaces:\n    if: github.event_name == 'workflow_dispatch' || startsWith(github.head_ref, 'release/')\n    strategy:\n      fail-fast: false\n      matrix:\n        include:\n          - os: ubuntu-24.04\n            browser: chromium\n          - os: windows-latest\n            browser: msedge\n    runs-on: ${{ matrix.os }}\n    timeout-minutes: 18\n    env:\n      ATLAS_BROWSER: ${{ matrix.browser }}\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ github.event.pull_request.head.sha || github.sha }}\n          persist-credentials: false\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '22'\n      - uses: actions/setup-python@v5\n        with:\n          python-version: '3.12'\n      - name: Verify player and crew logic, and build exact release\n        shell: bash\n        run: |\n          node scripts/test_atlas4730_gameplay_legend.cjs\n          node scripts/test_atlas140_crew_profiles.cjs\n          node scripts/build-cloudflare.cjs\n          python scripts/audit_published.py\n      - run: python -m pip install playwright==1.58.0\n      - if: matrix.browser == 'chromium'\n        run: python -m playwright install --with-deps chromium\n      - if: matrix.browser == 'msedge'\n        run: python -m playwright install msedge\n      - name: Verify canonical navigation and current activity links\n        run: python scripts/test_atlas4724_navigation_journeys.py\n      - name: Verify filters, layer search and directions\n        run: python scripts/test_atlas4732_player_map_browser.py\n      - name: Verify local profiles and guest backup recovery\n        run: python scripts/test_atlas140_crew_profiles_browser.py\n"
OLD_NEEDS = "needs: [chromium-and-static, microsoft-edge, atlas22-focus-chromium, atlas22-focus-edge]"
NEW_NEEDS = "needs: [chromium-and-static, microsoft-edge, atlas22-focus-chromium, atlas22-focus-edge, player-workspaces]"

def main():
    before = subprocess.check_output(["git", "show", BASE+":"+PATH]).decode()
    after = Path(PATH).read_bytes().decode()
    expected, old_counts = process(before, True)
    _, new_counts = process(after)
    assert expected.count("  validated-zip:\n") == 1
    assert expected.count(OLD_NEEDS) == 1
    expected = expected.replace("  validated-zip:\n", PLAYER_GATE + "  validated-zip:\n").replace(OLD_NEEDS, NEW_NEEDS)
    assert after == expected, "Unexpected workflow changes; review required"
    assert old_counts == Counter({(j, s): 1 for j in BROAD | FOCUS for s in SCRIPTS}), old_counts
    assert new_counts == Counter({(j, s): 1 for j in FOCUS for s in SCRIPTS}), new_counts
    assert after.count(NEW_NEEDS) == 1
    print("PASS: exactly six duplicate invocations removed; all six distinct browser/feature checks preserved")
    print("PASS: exact additive Chromium/Edge player gate and mandatory packaging dependency; all other commands, gates and permissions identical")

if __name__ == "__main__":
    main()
