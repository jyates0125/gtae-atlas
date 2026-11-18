# Team Jura Atlas 9.8A · Designed Brand Foundation

**Status: deployable development candidate, NOT production-certified.**

This is a **forward-only overlay**, intended for the EXISTING `jyates0125/team-jura-atlas-preview` GitHub `development` branch at Atlas 9.7 (commit `56898765`). It is **not** a complete replacement repository. Unzip at the repository root, retaining all existing source files and history. **Do not delete other files.** Cloudflare currently deploys `development` to Production automatically, so uploading this overlay there will update the publicly accessible website. For safe QA, create a feature branch off `development` and upload there first; Cloudflare should build it as a Preview because the configured production branch remains `development`.

## What is genuinely added

1. `index.html`: unified branded homepage (4 featured cards + All 13 + working links to original map/tools). Approved user-provided cinematic hero reference converted to optimized WebP. Native map engines are NOT replaced or fabricated inside the homepage.
2. `maps.html` + `atlas98-worlds.js`: one catalog of 13 destinations, search and availability filters, honest status and coverage notes.
3. `map-hub.html` + `atlas98-classic.*`: independent personal **map notebook** for seven classic worlds/episodes (GTA III, VC, LCS, VCS, Chinatown Wars, TLAD, TBOGT). Functional zoom, pan, personal pins, search, local-only persistence, JSON export/restore, per-world category checklist and optional user-provided authorized map image. This is NOT a licensed full-coordinate replacement for third-party classic maps. Map position values on this page are image-space percentages, not canonical GTA coordinates.
4. `atlas98-style-lab.html`: wardrobe concept gallery using the user's Team Jura artwork; user-approved visuals are distinguished from proposed character outfit concepts. Browser-local idea bookmarks work without any account.
5. `atlas98-flow.js`/CSS via additive `atlas97-connect.js` bridge: safe **Home / 13 Maps / Choose world** dock on existing pages already loading the 9.7 connector, without rewriting map controls or local progress keys.
6. `atlas98-landmarks.*`: attributed GTA IV, GTA V and GTA VI landmark search that reads local offline snapshots and avoids pretending the data are all collectibles. Starts on GTA VI, for which the 9.7 repository already contains `data/gtadb-6.json`. GTA IV/V entries show honest missing-snapshot guidance until the separate sync is run.
7. `scripts/sync_atlas98_gtadb.py`: independent mirror for GTADB.ORG GTA IV/V **landmark research only**, with source URL, license, original row structure and content hash. Run only in a network-enabled environment, and inspect the resulting files before publishing. GTA VI has an existing 9.7 mirror. No direct scraping from GTADB.net, GTAWeb or GTAMI is bundled.

## How to safely test

1. Create a new GitHub branch **from `development`** such as `atlas98-preview`; do not use the older, diverged `main` branch and do not delete anything.
2. Extract this ZIP. Upload its **contents**, preserving folders `art/`, `docs/`, `scripts/`, `tests/` and root HTML/JS/CSS, to the `atlas98-preview` branch. Old files not in the ZIP must stay in the repo.
3. Use GitHub commit title `feat(atlas): Atlas 9.8A branded four-world portal and 13-world flow`; description `Preserve the original Atlas map engines, introduce approved branded homepage, searchable 13-world directory, classic personal notebooks, outfit gallery and scoped navigation; no main branch changes.`
4. Open the Cloudflare **Preview** deployment URL for the branch. Verify `/`, `/maps.html`, `/atlas98-style-lab.html`, `/map-hub.html?game=vc`, `/atlas98-landmarks.html`, plus the four flagship map pages. In DevTools, check failed network requests and errors. Test iPhone-size navigation, marker save/reload and data export.
5. Only after visual and functional QA should changes be integrated into `development`. Note that this triggers public Cloudflare Production automatically under the current branch settings. Merging into `main` is **not** part of 9.8A.

## Validation already completed in this package

- `node --check` on the 9.8 JavaScript files: passed.
- `scripts/sync_atlas98_gtadb.py` Python syntax: passed.
- `tests/test_portal.py`: **36/36 passed** using in-memory DOM fixtures with headless Chromium at desktop/mobile sizes. The browser sandbox blocks HTTP and file navigation, so these are DOM behavior tests rather than an actual hosted click-through.
- ZIP CRC/manifest test completed when packaged.

## Must remain explicit, not falsely marketed as complete

- Gameplay-grade map coordinates and all collectibles for the seven classic worlds have **not** been bundled; their current notebooks are functional personal workspaces, not the full GTAWeb map data.
- The original Atlas 9.7 GTA V, Online, Leonida, GTA IV and Cayo native engines were preserved rather than fully browser-tested here. Cayo has schematic positions; GTADB VI data are provisional.
- Rockstar logos, official footage, and third-party site assets are **not** granted redistribution rights merely by their availability online.
- Character look variations are concepts unless directly approved; only the two user-approved reference graphics are labeled approved in the gallery.
- `One Last Ride` **film/story is not finished**. This release links to its existing page and organizes approved concept artwork but does not create a completed video.

## Source and licensing

- GTADB.ORG (NOT automatically GTADB.net): https://github.com/rolux/gtadb.org — authors state code MIT, landmark data/photo/tiles CC BY 4.0, and request git-based mirroring instead of repeatedly fetching from the live site. Attribution must remain visible. Original GTA intellectual property remains owned by its rights holders.
- GTAWeb: https://gtaweb.eu/ — navigation/UX comparison, not copy authorization.
- GTAMI: https://gtami.com/en/terms/ — the site's terms emphasize per-content licensing; not blanket reuse authorization.
- Team Jura original character and creative art: provided and approved by the user in this conversation; concept variants have separate status.

## Next prioritized package

**9.8B — Coverage + functional parity gate:** produce and validate the GTADB.org GTA IV/V snapshots in a network-enabled CI environment; instrument 60-page link and asset checks; test map layers/filters/routes/saving across actual Cloudflare preview; reconcile old tracker keys without deleting records; fix verified failures.

**9.8C — launch QA/hardening:** screenshot against original approved reference, mobile performance, tested live event labels, credits and licensing, launch checklist for Nov 17–19, and reviewed branch promotion. Do not ship a page describing a speculative tool as complete.
