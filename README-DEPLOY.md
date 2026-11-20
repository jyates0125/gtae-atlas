# Team Jura Atlas 8.5 — Controlled integration

**Only work on `development`.** Do not merge to `main` or replace the original artwork before live tests.

## Easiest integration — manual GitHub Actions workflow

1. Open `https://github.com/jyates0125/team-jura-atlas-preview/tree/development`.
2. Download and unzip this package.
3. Upload these FIVE new site-root files to GitHub `development`:
   - `atlas85-enhance.js`
   - `atlas85-brand.css`
   - `atlas-sa.html`
   - `atlas85-sa.js`
   - `atlas85-sa.css`
4. Upload `tools/apply_atlas85.py` and `tools/validate_road_graph.py` into the GitHub repository's **`tools/` folder** (create if missing).
5. Upload `.github/workflows/atlas85-apply.yml` into **`.github/workflows/`**, alongside the existing workflows. Use the package's folder structure; don't put workflow YAML at repository root.
6. Commit with title `feat: stage Atlas 8.5 Designed Brand and San Andreas`.
7. After the commit, go to **Actions** and inspect **Apply Atlas 8.5 Designed Brand integration**. Its `development` push trigger should run automatically. It will attempt to commit the guarded integration to `development`. If GitHub branch rules or Actions permissions block its push, inspect the job log; do not merge to `main`. A manual **Run workflow** action may only be visible if that workflow also exists on the default branch.
8. When green, Cloudflare Pages should redeploy the `development` branch. Verify `https://team-jura-atlas-preview.pages.dev/atlas.html` and `/atlas-sa.html`.
9. **Do not merge** until the checks in `docs/DESIGNED-BRAND-AND-FEATURE-PARITY.md` pass on the live website.

## Alternative: Windows / local Python

1. Download the *current `development` repository ZIP* from GitHub and extract it.
2. Copy the 5 site-root runtime files to its root, and the installer script under `tools/`.
3. Run `python tools/apply_atlas85.py` (Windows may need `py tools/apply_atlas85.py`). This edits `atlas.js`, `atlas83-map.js`, `atlas.html`, `atlas-online.html`, `atlas-vi.html`, and `atlas81-hq.html`.
4. Upload the **changed existing files** plus the 5 new files to the GitHub `development` branch. Replacing `atlas.js` without the complete patch is unsafe.

## Road data

No third-party GTA V road graph has been shipped. The game-specific provenance and topology have not been verified. The existing original `atlas-road-core.js` is preserved and its UI should clearly label straight-line previews. Use `python tools/validate_road_graph.py candidate.json` as an *initial* gate for authorized candidate graphs. Even a passing result is **not** verified driving directions.

## Safety and provenance

- The workflow's first write is after all patch anchors are checked; a mismatch causes a nonzero exit and no commit.
- Installer is idempotent for reruns; it does not clear or reset browser progress keys.
- Do not upload the master reference pack or competitor screenshots to the production webroot just to satisfy a design comparison. The approved `art/atlas81-approved-dashboard-crew.webp` in GitHub is reused.
- See the full parity and visual discrepancy audit in `docs/`.
