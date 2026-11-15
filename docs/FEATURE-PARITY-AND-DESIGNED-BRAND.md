# Team Jura Atlas 8.9 — Designed Brand / feature-parity audit

**Status:** Development candidate; **NOT a claim of full feature parity or complete production verification.** Audited against the user-approved Team Jura Original Design Reference Pack, supplied screenshots, current development code as inspected in GitHub, and publicly accessible GTAWeb, GTADB, GTAMap and GTALens feature references on November 14, 2026.

## Original design is the permanent master
ELARIO STUDIOS → TEAM JURA → ATLAS. Cinematic violet/amber/orange contrast, approved original Loki/Scaly illustrations, distinctive game/world cards, readable compact modern controls and interactive maps are the visual master. Competitor screenshots are *functional benchmarks*, not an invitation to replace our art. See `DESIGNED-BRAND-REFERENCE-VS-COMPONENT-QA.jpg`: this compares the approved layout with a local **synthetic component test**, not a screenshot of deployed Atlas.

## Implemented in 8.6–8.9

- **GTA VI map usability:** Scaly and Loki portraits cropped from approved user-provided artwork visible in the left sidebar; the existing Map Legend and Trailer Legend moved from floating map overlays to stacked, initially expanded left-hand panels. No source records discarded. Direct visual view buttons replace the native VI map-view dropdown, which remains in the DOM as the actual state source. Some artwork is a character crop, not yet a full-position original-poster composition.
- **Icon parity for currently supported collections:** 20 V/Online collection definitions share one icon mapping across left-side collection labels and the actual existing canvas renderer where source records are present; e.g. 🛸 Spaceship Parts, ☢ Nuclear Waste. The existing map remains authoritative for source coordinates, filtering, and progress. San Andreas supports tags, snapshots, horseshoes and oysters as separate map icons.
- **Guided Hunt:** Existing Atlas 8.5 map engine already reorders remaining mapped stops and removes completed selected pins when Hide Found is enabled, using approximate straight-line route optimization. No road graph with independently validated GTA V road connectivity was imported.
- **Illustrated All Maps:** searchable directory of 13 destinations with labeled status and artwork; interactive vs classic reference gateways explicitly differentiated. Illustrated hero uses an approved artwork crop.
- **San Andreas:** credited map background from a published MIT-licensed repository, with a separate copyright note; saved collectible progress and user-imported aligned pin packs remain available. Auto-loaded external background is **not** an imported complete location pack.
- **Cayo:** source reference, clearer connection to map and heist workspace, and disclosure that existing plotted positions are schematic rather than verified coordinates.
- **Daily/weekly intelligence:** original Team Jura 6.8 conditions engine reused for dated rotation status, reset times, prerequisite flags, event toggles, and user-imported snapshots. 8.8 displays source-linked events, seasonal/weekly rules and ghost hours in the map's left-side panels. Yellow = current eligible when conditions are met; white = possible/inactive; explicit Event Off when disabled. A local session toggle or selected hour is not a live Rockstar feed.
- **All-page navigation:** 8.9 adds a collapsible Atlas HQ / All Maps / Dailies / Heists / Collectibles / Elario dock to all root HTML pages, retaining original page functionality; Escape closes it. Desktop and 390px-mobile synthetic browser DOM test passed.

## What the competitors have that Atlas does not yet fully match

| Capability | 8.9 verdict | Next real implementation requirement |
|---|---|---|
| GTA V / Online / Leonida interactive maps | **Partial** | Verify every map layer, tile, click, search and route on live Cloudflare; complete marker provenance and performance audit |
| Individual icons for collection types | **Partial** | Test every actual imported record; missing-source records cannot draw a pin; full artwork/icon atlas beyond emoji glyphs would improve consistency |
| Per-item completion + hide found + remaining route | **Partial** | Live end-to-end tests across map, legend and HQ; road-following navigation still needs compatible validated graph |
| GTA Online Today vs All possible | **Partial** | Acquire a dated, reliably updated authorized feed and match published location IDs to Atlas coordinates; do not set every possible spawn yellow |
| Ghost #1–10, alternate points, event hours | **Partial** | Source accurate alternate positions, canonical marker IDs and session/clock synchronization; current rules know hours but point coverage is not complete |
| Daily / weekly collectibles and activities | **Partial** | Source every set and activity location; import current selection and inventory with a dated provenance, not just hard-coded possibilities |
| GTA V Story 100% per-location checklist | **Partial** | Complete individual validated records and link challenge success rather than merely visiting a place |
| Cayo island basemap with accurate loot spots | **Not complete** | Obtain georeferenced art and individual source-verified heist points; recalibrate existing schematic points |
| San Andreas accurate complete map markers | **Not complete** | Source compatible coordinate-to-image translation and each individual collectible point |
| GTAWeb's wider classic-game catalog | **Partial / gateways** | GTA III, Vice City, LCS, VCS, CW, GTA 1/2 and others need actual local engines and attributed datasets, not cards alone |
| Direct marker links + consistent view/filter sharing | **Partial** | Cross-mode URL state, exact imported IDs, and round-trip browser tests |
| Full pixel fidelity to Designed Brand original | **Partial** | Replace generic residual pages, align logo/character placement and responsive art after screenshot regression tests of live pages |

**Key comparator evidence:**
- GTAWeb game directory: https://gtaweb.eu/
- GTADB Online: https://gtadb.net/gta-online-map/interactive/
- GTADB Ghosts 2026: https://gtadb.net/gta-online-map/ghosts-exposed-2026/
- GTAMap.io Story: https://gtamap.io/gta-5-interactive-map/
- GTADB map/data terms: https://github.com/rolux/gtadb.org

## Current risks and restrictions

1. The user-provided approved image is preserved and crops used for the brand. Image placement still differs from the reference. User approval is not in question; **implementation fidelity** is incomplete.
2. Some existing map tiles use published community tile hosts. External host stability, reuse conditions and performance need validation. Attribution should be retained. Game art may have different rights from a repository's software license.
3. GTAWeb/GTADB/other UI screenshots inform feature usability. Their code, marker dumps and artwork cannot be silently presented as originally authored by Team Jura or redistributed without a basis for reuse.
4. Local browser tests use synthetic DOM components; they are not full-map tests and do not establish Cloudflare deployment.
5. The original 6.8 event rules provide statuses; **they do not include an automated authenticated Rockstar feed**. Event toggles are manual. A white inactive marker does not prove whether an event is officially running.
6. Old pages vary in style and remain accessible; the new dock improves navigation rather than fully restyling 50+ pages.
7. San Andreas map artwork uses a remote asset, which may be unavailable on some networks; the user can still import a local map image.
8. Other previous Atlas 8.5 GitHub workflows should not be deleted without an intentional migration review. This ZIP includes only one coordinated deployment workflow for 8.6–8.9 to avoid concurrent self-writing actions.

## Completed verification

- Node syntax checks on all newly introduced JavaScript files and the modified engine in a synthetic integration fixture.
- Python `py_compile` for integration scripts.
- Idempotent repeated integration of 8.6, 8.7, 8.8 and 8.9; no duplicate references in sample pages.
- Browser DOM tests (Chromium / Playwright via set_content): left-docked legends, visible approved characters, map-view buttons, 20-category icon matching (sampled), world directory search/filter, dated daily-status presentation, ghost status/visibility logic, site-wide menu on mobile and desktop.
- Browser page navigation to the actual local site is blocked in this runtime; no live full-map, pointer, layer or route end-to-end claims.
- Exact approved-reference-vs-deployment pixel regression test **not passed**. Component-only side-by-side comparison included for manual visual review.

**Next live acceptance suite:** map starts in correct world, correct tile art is visible, all layers load, Scaly and Loki portraits remain visible, alternate ghost markers appear only if sourced, ghosts have consistent color by rule, game-scoped markers stay separate, mark Found hides/replans, refresh preserves progress, All Maps filters work, cross-page menu works, Cayo and San Andreas art display, and no runtime console errors or broken URLs. Capture 1440×900 and 390×844 screenshots and compare against approved master.
