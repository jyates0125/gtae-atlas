# Team Jura Atlas 9.8C — QA status at package assembly
2026-11-15

## Verified locally in this assembly

- Source audit `python scripts/audit_release.py`: **PASS**, 65 HTML, 48 CSS, 75 JS, 35 JSON, zero missing same-origin links in source, zero JS syntax errors, zero data parse errors.
- Static publish build `node scripts/build-cloudflare.cjs`: **PASS**, 348 static source assets copied (plus one generated manifest) to `public/`; no development scripts, workflow YAML, PowerShell files or test directories published.
- Actual publish directory `python scripts/audit_published.py`: **PASS**, 65 HTML pages, 349 public files, zero missing relative HTML/CSS assets.
- `node --test tests/data-lab.test.cjs`: **PASS**, 11/11.
- `python -m unittest discover -s tests -p 'test_atlas98b_sync.py'`: **PASS**, 6/6.
- `python scripts/test_site_release_70.py`: **PASS**.
- `python scripts/test_atlas_static.py`: **PASS** with an updated assertion for the modern GTADB research adapter (former direct `atlas.js` assertion was obsolete).
- `python scripts/test_sync_gtadb_vi.py`: **PASS**.
- `python tools/test_atlas96.py`: **PASS**, 6/6.
- `python tools/test_atlas97.py`: **PASS**.
- `node test-route-58.cjs`: **PASS**, 8 assertion groups.
- `node test-layer-deck-621.cjs`: **PASS**, 12 checks.
- New GitHub YAML workflows parsed with YAML BaseLoader: **PASS**, one consolidated quality gate + one manual data review workflow.
- Existing 9.8B isolated DOM fixture report: 58/58 checks passed at time of original assembly; not equivalent to real hosted browser navigation.

## NOT VERIFIED — release gates

- **Microsoft Edge and Playwright Chromium real HTTP navigation**: current execution environment blocks page navigation via administrator restrictions; GitHub Actions now has an Edge job on Windows and a Chromium job on Linux. The artifacts are only uploaded after both jobs succeed.
- **Cloudflare Pages settings and actual deployments**: no Cloudflare management connector is available in this session. Project must use `node scripts/build-cloudflare.cjs` and output `public`, production branch `development` only after preview approval.
- **Third-party GTA map tiles, outside APIs, high-quality full icon licensing, GTA VI placement accuracy, complete GTA V/Online items and proper road graph**: dependent on independently sourced/licensed data and live acceptance; community research remains labeled provisional.
- **Film full playable production**: included original *One Last Ride* motion preview, audio, screenplay and cards, but no finished feature film is claimed.

## Before switching production traffic

1. Upload complete source ZIP to `development` using `INSTALL-TO-DEVELOPMENT.ps1` (Git for Windows). This does not merge or modify old `main`.
2. Confirm all GitHub Actions jobs green, including **Microsoft Edge**. If any fail, leave production unchanged and investigate the linked log; do not waive the failure for launch.
3. In Cloudflare, configure static build command `node scripts/build-cloudflare.cjs` and output `public`. Check the branch and enable Always Use HTTPS.
4. Open the Cloudflare preview in Edge desktop and iPhone Safari; pan/zoom/load actual GTA V, GTA Online, Leonida and Cayo tile layers; test pins, search, routing, collectibles, progress export/import and video playback.
5. Publish only after visible artwork and functionality match approved Team Jura designed-brand standards and necessary rights are documented.

**Status:** Complete assembled **candidate package** with verified static/unit checks. Not yet certified production-ready until browser and hosted acceptance checks pass.
