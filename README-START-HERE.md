# TEAM JURA ATLAS 9.8B · CUMULATIVE DESIGNED BRAND + FUNCTIONAL PARITY PACKAGE

**Elario Studios → Team Jura → Atlas** · November 15, 2026

**State:** ready to upload to a **GitHub preview branch** for functional acceptance testing. **NOT live-deployed, NOT production-certified, NOT a complete replacement repository.**

## What is this package?

The package is **cumulative**: it contains all 9.8A files plus 9.8B improvements. Do **not** upload 9.8A separately first. Unzip, and upload **all extracted contents** to your repository at `jyates0125/team-jura-atlas-preview`, into a new branch **`atlas98-preview` created from `development` commit `5689876565af2a248b1e230c77fbdaedb43bd85b` (or the current development head, once verified)**. Preserve folders and *all existing files that are not in this package*. Cloudflare's Production branch remains `development`; GitHub's `main` branch is protected and GitHub Pages publishing is disabled (None). **Do not change these settings during QA.**

## Working features added cumulatively

### From 9.8A — the Designed Brand foundation
- Home with user-approved original Loki & Scaly artwork, violet/amber/gold styling and *real HTML navigation*.
- **Four featured worlds:** GTA V Story, GTA Online, GTA VI Leonida Research and Cayo Perico.
- **All 13 destinations:** separate map directory with search, source/status labels, and direct routes to existing game-specific pages.
- Seven personal classic GTA map notebooks (`map-hub.html?game=...`) with image zoom/pan, manual markers, per-world local save, export and restore. Classic-world notes are NOT verified GTA coordinates.
- Style Lab with approved visuals versus outfit concept images clearly distinguished.
- Local GTADB.org IV/V/VI research landmark viewer (VI snapshot already in `development`; IV/V require source download).
- Additive quick-nav bridge on legacy pages; no native GTA map engines, stored map layers, route data or garage keys replaced.

### New 9.8B improvements — source-backed per-item functionality
- **Individual numbered collectible checklists** for sourced sets in GTA III, Vice City, VCS, LCS, Chinatown Wars, The Lost and Damned and The Ballad of Gay Tony. Buttons toggle specific slots, not entire categories. Slot counts use cited, independently published game facts; individual positions are NOT invented. PSP/PS2 variant totals are noted on VCS.
- Game-by-game progress isolated in `team-jura-atlas98b-items-<game>-v1`. Previous whole-category flags and all native 9.7 progress keys are preserved, never silently migrated or overwritten. Local JSON export/restore is built in.
- **Personal straight-line route planner** for classic-world markers, with reorder/remove stops, per-game persistence and copyable route list. Routes use image percentages, not street networks, driving times or GPS.
- Classic world source links now direct to the corresponding game where a verified reference URL exists (external reference is not permission to copy media).
- **Launch QA dashboard** at `atlas98b-test.html`: scan flagship pages or all 63 HTML destinations for missing same-origin internal assets/links and stale titles, then export a JSON report. This is passive URL checking, not native map click-testing.
- Python full-tree link/asset inspector `tools/audit_atlas98b.py` (run against the entire repository checkout, not the partial ZIP alone).
- GitHub Actions preview-only data sync `.github/workflows/atlas98b-preview-quality.yml` for explicitly CC BY 4.0 GTA IV/V **landmark research**, using the offline mirror script from 9.8A. It commits only the generated `data/gtadb-4/5` JSON and manifests to `atlas98-preview`. **It cannot deploy to `main` or `development`.**

## SAFE UPLOAD STEPS (ONE BRANCH, ONE CUMULATIVE ZIP)

1. Open `https://github.com/jyates0125/team-jura-atlas-preview` → branch selector `development` → create new branch **`atlas98-preview`** from `development`.
2. Download this `9.8B-Cumulative` ZIP, unzip it locally. Upload its extracted **file/folder contents** onto `atlas98-preview` via GitHub **Add file → Upload files** (NOT the ZIP itself). Keep all existing source files that are not in the ZIP.
3. Commit title: `feat(atlas): 9.8B cumulative branded map parity and source QA`.
   Commit description: `Integrate approved Team Jura homepage and 13-world directory with game-specific collection trackers, personal routes, preview-only licensed IV/V landmark sync, and the launch QA center. Preserve all original 9.7 map engines, data and local progress. No changes to main or Cloudflare Production.`
4. GitHub Actions should automatically run **Atlas 9.8B — Preview source data and quality** when the package is first committed to `atlas98-preview`. Once the workflow is complete, check that attributed GTA IV/V files were committed. If the workflow errors, **do not merge**; inspect its logs (e.g., upstream data/network or GitHub permissions).
5. Cloudflare should build this **non-Production branch as Preview** because production currently points to `development`. Open the **immutable preview deployment URL**, not `team-jura-atlas-preview.pages.dev` (which still shows 9.7).
6. Check `/` (home), `/maps.html` (13 worlds), `/atlas98b-test.html` (click **Audit all pages**), then the four featured map pages, classic notebooks (`/map-hub.html?game=vc`), and Style Lab. Follow `docs/ATLAS98B-LAUNCH-GATE.md` for acceptance.
7. **Only after a successful preview** consider an explicit PR into `development`. This updates Cloudflare's public production branch. Do not merge whole development into protected `main` until separate comparison/QA is approved.

## TEST EVIDENCE AND LIMITATIONS

- Browser DOM fixtures: **58 / 58 passed**, desktop 1440px and mobile 390px.
- Offline data sync unit tests: **6 / 6 passed**.
- New JavaScript files pass Node syntax checks.
- `tools/audit_atlas98b.py` can inspect the full repo after upload. Its overlay-only report has expected missing targets because this ZIP is intentionally not the complete repository and old map/media files are preserved in `development`.
- **Not completed:** public Cloudflare preview browser QA, GTA V/Online/VI native canvas interaction regression, complete collection coordinate coverage, calibrated Cayo terrain, GTA VI confirmed game coordinates, published GTADB IV/V snapshots (generated AFTER preview GitHub workflow), precise visual screenshot parity against the approved master, final One Last Ride film.

The user-approved reference image, approved character identities, and original Loki/Scaly visual grammar are binding. Any novel costume images are wardrobe **concepts**, not invented in-game purchasable items. The 1672px source concept art is optimized, **not claimed to be a 3840x2160 original**.

## SOURCES / GAMEPLAY TRUTH

- GTADB.ORG, MIT code and CC BY 4.0 landmark/tiles: https://github.com/rolux/gtadb.org
- Rockstar official GTA VI date: https://www.rockstargames.com/newswire/article/ak3ak31a49a221/grand-theft-auto-vi-is-now-set-to-launch-november-19-2026
- Original game counts and source links: `atlas98b-collection-data.js`
- Research, rights and integration plan: `docs/ATLAS98B-SOURCE-AND-LICENSE-REGISTER.md`
- Full 60+ page QA plan: `docs/ATLAS98B-LAUNCH-GATE.md`
- `GTAWeb.eu`, `GTADB.net`, `GTAMI`, `GTAMap.io` are **feature and source references**, not automatically public domain code and art. Copy only the items licensed/authorized independently and retain attribution. Fan-site status alone is not a license.

**Motto:** Build it. Package it. Test it. Refine it. Deliver it.
