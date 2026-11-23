#!/usr/bin/env python3
"""Atlas 35.3: owner-selected GTAE branch roles remain consistent.

Only latest binding sections are checked. Historic archived decisions are not
rewritten, and development is allowed to differ from protected main.
"""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(path):
    return (ROOT/path).read_text(encoding="utf-8")
workflow=read(".github/workflows/atlas2150-branch-parity.yml")
charter=read("docs/TEAM-JURA-STANDING-CHARTER.md").replace(chr(96),"")
runbook=read("docs/TEAM-JURA-CANONICAL-REPO-AND-DEPLOYMENT.md").replace(chr(96),"")
contract=read("docs/ATLAS-SITE-COMPLETION-CONTRACT.md").replace(chr(96),"")
assert "push:" in workflow and "branches: [main, development]" in workflow
assert "pull_request:" in workflow and "branches: [development]" in workflow
assert "git merge-base --is-ancestor origin/main" in workflow
assert "Branch divergence is expected while developing new features." in workflow
assert "Only reviewed releases from development may go to protected main." in workflow
assert "Cloudflare Pages gtae-online / branch main." in workflow
assert "November 23, 2026 — binding NEW GTAE public-main / private-development release policy" in charter
assert "ONE official website, SAME URL" in charter
assert "Nov 23 binding" in charter
assert "November 23, 2026 — owner-approved final GTAE deployment topology" in runbook
assert "Official Cloudflare production source | protected lowercase main" in runbook
assert "Working and test branch | lowercase development" in runbook
assert "production branch **main**" in runbook
assert "Promote separately approved, fully validated release candidates into protected main" in contract
for doc in (charter,runbook,contract):
    assert "gtae-online.pages.dev" in doc
    assert "development" in doc and "main" in doc
print("PASS Atlas 35.3: production main, development builds and ancestry guard")
