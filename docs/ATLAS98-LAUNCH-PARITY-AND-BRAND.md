# Team Jura Atlas 9.8 — Launch readiness, feature parity, Designed Brand

**Source branch:** `development` commit `5689876565af2a248b1e230c77fbdaedb43bd85b` reviewed November 15, 2026. The generated patch has NOT been merged, uploaded or checked on Cloudflare.

## Visual authority / original brand
`APPROVED-REFERENCE-DASHBOARD(1).png` and the approved references in `docs/APPROVED-DESIGNED-BRAND-MASTER.png` are the masters. The landing page features the approved duo scene and high-density purple/amber/gold design with meaningful real HTML links (not a clickless rendered website screenshot). Brand hierarchy remains **Elario Studios → Team Jura → Atlas**. User confirmed approved hero and home-reference graphics; concept clothing panels are labeled unapproved until specifically accepted.

Loki: signature red top hat, clown/slasher face, red hair, red suit with gold tailoring; Scaly Man: short dark/green hair, clown/slasher makeup, black tactical vest and alternate red checker/galaxy outfits. Clothes are fan-created visual concepts, not represented as unlockable GTA equipment. The image assets are 1672px-wide source artwork optimized to WebP; do **not** describe them as native 3840x2160 production 4K.

## Launch structure — four featured maps, thirteen total
Primary: GTA V Story (`atlas.html`), GTA Online (`atlas-online.html`), GTA VI research (`atlas-vi.html`), Cayo Perico (`atlas-cayo.html`). All Maps always exposes GTA IV, San Andreas, GTA Vice City, GTA III, Vice City Stories, Liberty City Stories, Chinatown Wars, The Lost and Damned and The Ballad of Gay Tony.

The 7 classic `map-hub.html?game=...` destinations have distinct persistent personal notebook states, game categories, filtering, pan/zoom, optional imported map image, marker placement, export/restore, and credits. **No fake geographic pin precision or invented built-in basemaps.** Native map engines for GTA IV/SA remain linked unchanged. Backward-compatible `?world=vice-city`, `?world=gta-iii`, etc. are accepted.

## What the patch actually changes
- Replaces the old `index.html` with brand-led real-functional homepage; adds persistent 'Continue last workspace' link and local read-only progress indicators.
- Replaces old `maps.html` with genuine 13-world searchable directory. Fixes prior bug where `atlas87-all-maps.js` used `?world=...` but old `map-hub.js` read `?game=...`.
- Replaces `map-hub.html` gateway with usable manual map notebook for seven classic worlds.
- Adds `atlas98-style-lab.html` to organize character and outfit concepts; local saved ideas and image preview, no GTA account sync.
- Adds `atlas98-landmarks.html` plus offline CC BY 4.0 search/viewer, and optional network-enabled GTADB.ORG IV/V sync script. Existing `data/gtadb-6.json` unchanged.
- Updates `atlas97-connect.js` only to append a non-invasive `atlas98-flow.js` dock on legacy pages. Original existing 9.7 logic untouched.
- **Does not replace** `atlas.js`, `atlas-vi.html`, `atlas-online.html`, `atlas81-hq`, heist engines, GTA data snapshots, garage engine or users' legacy save keys.

## Source licensing and data scope
- Original GTADB.ORG public GitHub `map/data/4`, `/5`, `/6` landmark files: CC BY 4.0 (per `LICENSE-DATA`) and MIT code (per `LICENSE`). Explicit credit and license URL are required. Existing `data/gtadb-6.json` contains 3,425 VI research records with 3,334 positioned and 91 search-only at 2026-11-15; *community-provisional*, not gameplay confirmation.
- GTADB.net, GTAWeb and GTAMI original content have **not** been determined redistributable as complete datasets. Cross-site functionality parity is not an asset license. Never assume that lack of a visible prohibition means permission. GTA V/older games remain Rockstar's intellectual property.
- The new `scripts/sync_atlas98_gtadb.py` must run once with network access to generate `data/gtadb-4.json` and `data/gtadb-5.json`, and generated files must be committed for true offline browsing. This build package **does not** falsely claim to have downloaded these extra records.

## Feature parity by tool (strict evidence)
| Tool or destination | Baseline `development` | 9.8 upgrade | Not verified / remaining |
|---|---|---|---|
| 4-map homepage | Separate `atlas97-journey.html` | Promoted to `index.html` with live links | Cloudflare screenshot, keyboard/mobile QA |
| All 13 map destinations | `maps.html` cards | Filterable featured four + nine more; source-grade labels | Hosted path load tests |
| V/Online/VI native layers | Existing `atlas.js` and enhancements | Preserved unchanged | Live tile servers, illustrated UV parity, mobile gestures |
| Source-linked pin filter/search | Existing native map engine | Preserved, direct world links | Full per-set pin and icon coverage incomplete |
| VI 3D/clustering | 9.5 / 9.6 | Preserved | 3D heightfield and live browser behavior, no false 3D terrain |
| VI data | 3,425 CC BY research records | Preserved | Gameplay check after launch, unverified status |
| Cayo | Interactive schematic | Preserved, direct entrance | Real calibrated terrain and source coordinate overlay |
| GTA IV | Partial native GTADB research | Preserved + license-ready source library | Full per-category location coverage |
| San Andreas | 320-slot tracker, optional map | Preserved | Full verified game-space pin pack |
| Seven older game/episode gateways | Text-only external reference | Interactive personal image-map notebooks | Built-in verified source coordinates and basemaps |
| Vehicles/Garage/Heists | Existing functions | Discoverable from homepage; original engines preserved | Deep QA of every original function, images, payout claims |
| Daily/weekly Online | Source-conditional snapshot | Discoverable, no fake live statuses | Verified dated feed ingestion |
| Progress and data | Several older localStorage keys | Read-only homepage cross-surface counts; bookmarks isolated | True single versioned state adapter and restore regression |
| Team Jura wardrobe | Artwork in history | New filterable, bookmarkable Style Lab | Approved individual outfits vs inspiration need review |
| One Last Ride | Existing tribute/story page | Showcase link only | The final video has not been made/tested, do not claim production done |

## Prelaunch order (Nov 17–18 preview, Nov 19 sharing)
1. **Safety and launch basics:** upload three packages to a new preview branch from `development`, not live Cloudflare Production; verify no pages removed and inspect changed files.
2. **P0 test:** Homepage and all four flagship maps load, map art shows, layer buttons respond, search and categories toggle actual pins, native route planner, coordinate finder and collectible progress survive refresh. Repeat on phone.
3. **P0 test:** `maps.html` lists exactly 13; search and filters work; all seven old worlds open their own notebook with correctly named category sets; imported image, marker, export/restore work.
4. **P0 test:** All old heist/garage/vehicle tools remain available and existing user saves are intact. Check routes and local storage.
5. **P0 QA:** Cayo schematic disclaimer, VI provisional sourcing and off-by-one pin counts checked; no broken images/404s/JS errors; confirm credit links and rights.
6. **P1 data:** run the source sync on network-enabled CI for GTADB IV/V; add offline files; don't overwrite native marker engine with unmatched coordinate system.
7. **P1 polish:** Compare 1440 and 390 screenshots to approved master; keyboard navigation; mobile scroll; fast load, responsive artwork.
8. **Film:** *One Last Ride* video remains a separate storyboard/edit/rights QA project; retain link and approved poster, don't block map-site launch on unfinished film.

## Version and repository safety
GitHub `main` is protected and GitHub Pages branch publishing is set to None; it remains preserved. `development` is Cloudflare's CURRENT production branch, so commits there immediately publish. Preview using a **new branch** (`atlas98-preview`) before merging. Existing code/assets and user progress remain untouched by the patch unless explicitly listed above. All successful build claims require actual browser evidence—not only a green Cloudflare deployment.
