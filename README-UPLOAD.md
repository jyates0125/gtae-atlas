# Atlas 9.0 Designed Brand integration (includes 8.9) — GitHub development

This is a **development candidate**, not a complete GTAWeb clone. Use the existing `jyates0125/team-jura-atlas-preview` repository, branch `development` only. GitHub Pages main remains untouched.

**Do not upload the ZIP file itself. Extract it.** Upload contents maintaining these paths:

1. Root: `atlas86-ui.js`, `atlas86-ui.css`, `atlas86-sa-enhance.js`, `atlas86-cayo.js`, `atlas87-all-maps.js`, `atlas87-all-maps.css`, `atlas87-daily.html`, `atlas87-daily.js`, `atlas87-daily.css`, `atlas88-events.js`, `atlas88-events.css`, `atlas89-shell.js`, `atlas89-shell.css`.
2. `art/`: the three `atlas86-*-approved.webp` image files.
3. `tools/`: all `apply_atlas86.py` through `apply_atlas89.py`. Tests may also be uploaded if desired.
4. `.github/workflows/`: `atlas88-apply.yml` **only**. The combined workflow integrates all 8.6–8.9 changes and commits to `development`; do not also upload the older 8.6/8.7 workflow definitions from this package. The older workflow already in GitHub may also run if its path conditions are met; review GitHub Actions for failures or conflicts.
5. Optional `docs/` QA files and Designed Brand comparison are for review, not runtime.

Suggested commit title: `feat: Atlas 8.9 designed brand maps, ghosts, dailies and unified navigation`

Suggested description: `Dock Scaly/Loki legends in the sidebar, match collection icons between map and legend, improve visibility of approved character artwork, add the illustrated All Maps directory, expose dated daily/weekly event status and ghost rule icons, and provide accessible Atlas HQ navigation across all pages. Preserve original map progress and document remaining parity gaps.`

**Before upload:** Existing `atlas.js`, map pages, Atlas HQ and map data should remain unchanged by your manual upload. The GitHub Actions job will apply isolated, repeat-safe changes using `tools/apply_atlas86.py` through `tools/apply_atlas89.py`.

**If Actions reports failed:** Do not delete or merge working files. Read the failed step and share it. A failed integration job means the new scripts may have uploaded but not yet been connected to the live pages. No direct GitHub write permission is available to Aura through this connection.

**Live preview URLs after successful Actions and Cloudflare deployment:**
- https://team-jura-atlas-preview.pages.dev/maps.html
- https://team-jura-atlas-preview.pages.dev/atlas-vi.html
- https://team-jura-atlas-preview.pages.dev/atlas-online.html
- https://team-jura-atlas-preview.pages.dev/atlas87-daily.html
- https://team-jura-atlas-preview.pages.dev/atlas-sa.html
- https://team-jura-atlas-preview.pages.dev/atlas-cayo.html

The image assets are cropped from user-approved reference material. San Andreas image URL is credited in code and links to https://github.com/gptrk0/mtasa-map-images. Third-party game art rights remain separate from software licenses. Other comparator websites are used as functional references and are not redistributed.


## Atlas 9.0 · Pictured weapons and vehicles

**This supersedes the Atlas 8.9 ZIP**: only upload this latest package to development to prevent duplicate deployments. Upload the ZIP's contents (not the ZIP itself) while keeping root, `art/`, `tools/`, and `.github/workflows/` paths. The included `atlas88-apply.yml` workflow was upgraded to apply 8.6–9.0 in sequence; upload it once and replace the earlier version of that workflow. Watch the GitHub Actions integration run.

Additional root files: `atlas90-gallery.css`, `atlas90-gallery.js`, `atlas90-seed.json`, `atlas90-shortcuts.js`, `atlas90-weapons.html`, `atlas90-vehicles5.html`, `atlas90-vehicles6.html`.
Additional tool: `tools/apply_atlas90.py`. This retires the **Loki map style option** while keeping Loki's approved character art and the DUPZOR source artwork as alternative standalone research layer. It adds gallery links from the universal site menu, All Maps and the three main map pages.

**Gallery limitations:** 91 curated weapon archive entries, 210 GTA V image/archive entries, and 41 GTA VI research entries are a starting baseline. They are not an official complete roster; archive discovery can supplement GTA V entries from the community image archive. Each card displays an image URL or a custom original image fallback. The per-card GTA VI image may be a clearly labeled reference to the GTA V equivalent, not a true GTA VI screenshot. No live price, handling, damage or weapon upgrade stats are fabricated. The original inventory remains intact.

Commit title: `feat: Atlas 9.0 futuristic weapons and vehicles galleries`
Commit description: `Expand Designed Brand with pictured weapons, GTA V/Online and GTA VI catalog workspaces; add search, class filters, comparison selection, wishlist, owned-item tracking and JSON export; retire Loki map view while preserving Loki character artwork; keep all maps, events, progress and navigation compatible; document source and parity gaps.`
