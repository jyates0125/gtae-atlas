# Atlas 11.8 — Designed-brand screenshot review workflow

**Status:** automated capture for human comparison, not a claim of approved visual parity.

## What is captured
The existing production-build browser suite continues to test the same static files and map interactions. After it finishes, a **separate advisory Playwright process** (`scripts/capture_design_review.py`) starts with its own fresh browser/context/server and captures **desktop 1440×900** and **mobile 390×844** viewport screenshots for:

1. `index.html` — original approved home hero, top navigation and start actions
2. `maps.html` — all-world directory and game-specific covers
3. `atlas-activities.html?mode=online` — redesigned game-scoped intelligence
4. `atlas93-garage.html` — personal garage hero and progress counters
5. `project.html` — current Elario Studios showcase
6. `atlas.html` — GTA V map, map controls and actual initial loading state
7. `atlas-vi.html` — provisional Leonida map and source labels
8. `one-last-ride.html` — community film/story page

Each browser creates a `qa-evidence/<browser>/manifest.json` listing captured files and any screenshot errors. Images are generated from a **fresh CI process and context**; they contain no connected user account, local notes, garage saves or private photos. The screenshots are **review evidence**, not permission to republish any third-party imagery they might incidentally display.

## Retrieve and compare

On GitHub, open **Actions → Team Jura Atlas - validate production website → latest successful development run → Artifacts** and download:

- `team-jura-atlas-design-review-chromium`
- `team-jura-atlas-design-review-edge`
- `team-jura-atlas-cloudflare-validated-after-chromium-and-edge` (production ZIP)

Screenshots are stored 14 days. The production ZIP is a separate public-build artifact and is unaffected by screenshot collection. The blocking functional smoke suite never takes screenshots; the separate capture step is explicitly non-gating, so a stalled image renderer cannot turn an unrelated passing functional suite into a false failure.

Compare desktop and mobile images against `docs/APPROVED-DESIGNED-BRAND-MASTER.png` and the owner-approved home, One Last Ride and garage references. Inspect original Elario identity, 4K-style art quality, contrast, page-specific motifs, map provenance, game-mode separation, button readability, clipping and consistent navigation.

**Important:** a 0.8-second or two-second automated screenshot does not prove remote tile providers finished loading or a screenshot matches the approved design. The actual map smoke tests remain independent; review images manually, then verify any suspected discrepancy in a live browser.

## No changes to
Map tile providers, marker positions, datasets, player progress or save keys, routes, artwork, video, Git branch permissions, attribution or generated public site source. This change captures browser evidence after page load and uploads it **only as private CI execution artifacts**, not to the public Cloudflare website.

**Release rule:** merge to `development` only after source/static, Chromium, Edge and validated ZIP checks pass. Never promote this or later site changes to protected `main` without fresh owner approval.
