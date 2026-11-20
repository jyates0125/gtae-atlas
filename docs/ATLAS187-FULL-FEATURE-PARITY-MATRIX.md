# Atlas 18.7 — Full feature-parity matrix and release priorities

**Audit date:** 2026-11-20 (America/Chicago)  
**Scope:** Team Jura Atlas under Elario Studios; PR #70 staging branch `feature/atlas163-postrelease-parity`; Cloudflare-connected `development` is NOT changed.  
**Standard:** Comparable player functionality and independently defensible data, **not** unauthorized copying of maps, icons, source code, premium content or entire proprietary databases.  
**Evidence grade:** `CODE` = feature directly found in staging source; `FOCUSED-QA` = browser evidence for stated specific prior build; `PARTIAL` = some features/coverage are present; `GAP` = core capability or evidence missing; `UNTESTED` = needs current-head browser/visual acceptance. No row means certified 1:1 content parity.

## Current benchmark links

- [Rockstar GTA VI launch announcement — 2026-11-19](https://www.rockstargames.com/newswire/article/39akk424a9oo53/grand-theft-auto-vi-now-available): officially released GTA VI and downloadable official printable Leonida map; review use terms before embedding/rehosting.
- [GTAWeb](https://gtaweb.eu/): GTA-world map directory and GTA Online toolkit.
- [GTADB Online map](https://gtadb.net/gta-online-map/interactive/): published categories, per-category counts and dated/possible daily locations.
- [GTADB.io tools](https://gtadb.io/tools): maps, cross-game compares and completion checklists.
- [GTAMap.io Online](https://gtamap.io/gta-online-map/): tiled 2D map styles and road/footway-aware routes.
- [GTAMap.io Story](https://gtamap.io/gta-5-interactive-map/): searchable group checklists and on-map route editing.
- [GTALens Cayo](https://gtalens.com/map/cayo-perico-heist): dedicated entry, exit, loot, equipment and daily collectible reference categories.
- [The GTA Map Cayo](https://thegtamap.com/map?g=gta5&r=cayo): route optimizer, custom pins, online/story scope and Cayo categories.
- [GTABase vehicles](https://www.gtabase.com/grand-theft-auto-v/vehicles/): manufacturer/class filtering, purchase information and side-by-side comparison.
- [GTABase properties](https://www.gtabase.com/gta-online/properties/): categorized purchasable properties.
- [MapGenie GTA V Android](https://play.google.com/store/apps/details?id=io.mapgenie.gta5map): marker search, notes, multiple map views and cloud progress sync.

Competitor descriptions are public page evidence observed 2026-11-20, **not** authorization to reuse their images or datasets. Verify subsequent changes before importing claims.

## Feature-by-feature evidence matrix

| ID | Player capability / benchmark | Team Jura staging evidence | Verdict | Required next acceptance |
|---|---|---|---|---|
| M01 | Open all GTA destinations (GTAWeb / GTADB.io) | `atlas98-worlds.js`, `maps.html`: 13 destination cards; separate game scopes | **CODE / PARTIAL** | Open each on Chromium + Edge phone and desktop; some classic cards lead to notebooks rather than complete native maps |
| M02 | GTA V Story vs GTA Online isolation | `atlas.html`, `atlas-online.html`, `atlas.js`, Standing Charter | **CODE** | Test that progress/filter/route categories do not leak across modes |
| M03 | GTA VI research separated from verified games | `atlas-vi.html`, `atlas-research.html`, `atlas172-research-map.js` | **CODE / PARTIAL** | Keep 3,425 provisional research records separately; post-launch verify item-by-item instead of bulk promoting |
| M04 | Multiple correct geospatial basemap views (MapGenie / GTAMap.io) | `atlas.js`, `atlas-3d.js`, maps use several map styles | **PARTIAL / UNTESTED** | Desktop/phone visually inspect every style, tile fallback and UV coverage, game/world alignment; styles do not guarantee licensing or pixel-calibration |
| M05 | Accurate category markers (GTADB / GTALens) | `atlas.js`, `atlas-coverage.js`, `data/atlas-coverage-67.json` | **PARTIAL** | Count verified individual pins by mode, compare category totals, remove false 'complete' states; coverage page counts matching starter samples only |
| M06 | Search / hide all / show all / hide found | `atlas.js`, `atlas98-worlds.js`, collectible tools | **PARTIAL** | Per-world keyboard/touch filter tests, search by marker name/alias, no clustering that obscures results |
| M07 | In-map details, contextual links, accessible popup | Map scripts and Cayo `atlas181-cayo-hotspots.js` | **PARTIAL** | All categories show meaningful location source, status and detail; verify dismiss/select on iPhone |
| M08 | Live X/Y coordinate readouts and shareable pin URLs (GTAMap.io / GTADB) | `atlas.js`, route and navigation modules | **PARTIAL** | Roundtrip exact game coordinate and URL per world, including older games where grids differ |
| M09 | Nearest-next / multi-stop paths | `atlas-route-core.js`, `atlas186-cayo-route.js` | **CODE / FOCUSED-QA for 18.6 only** | Test 18.7 chosen finish, resume, saved state and share route on both browser engines |
| M10 | Road-aware car and foot navigation, line dragging (GTAMap.io) | `atlas-road-core.js` supports validated graph schema but has no authenticated complete road data | **GAP** | Obtain independently licensed/verified topology, projection, one-ways, routing, performance; until then **straight line only** |
| M11 | Cayo dedicated map with proper colorful legend (GTALens) | `heist-cayo-perico.html`, `atlas180-*`, `atlas181-*`, `atlas185-*` | **CODE / FOCUSED-QA for 18.6** | Owner iPhone review of exact staged page, including close clusters, movable map, 14 toggles, map fallback |
| M12 | Cayo start anywhere, select finish, edit stops, mark completed | `atlas186-cayo-route.js` (18.7), independent `teamjura-cayo-pinroute-v1` storage | **CODE / 18.7 QA PENDING** | Route start/finish not equal, finish remains last, no fake road/time estimate, share URL restores endpoints, visited stops survive refresh |
| M13 | Cayo treasure 19 possible / dated active two (GTALens) | `data/cayo-treasure-spots.json`, `data/cayo-treasure-today.json`, `atlas180-cayo-flagship.js` | **PARTIAL** | Current pair must have reliable source + expiry; otherwise all 19 possible only, never pretend daily prediction is confirmed |
| M14 | 15 individual heist HQ/workspaces, objective guides | `heist-pages.js`, `atlas167-heist-focus.js`, `atlas168-heist-guides.js`, `atlas169-heist-views.js` | **CODE / PARTIAL** | Each heist own contextual map, meaningful location evidence, 5-question guides, actual walkthrough and responsive art; Cayo quality cannot be extrapolated to 14 others |
| M15 | Story-mode complete collectible checklists (GTADB.io) | `atlas81-hq.html`, `atlas-collectibles.html`, `atlas-activities.html` | **PARTIAL** | Per-item 100% category and progress parity with sourced coordinates and required-vs-optional labels |
| M16 | GTA Online Action Figures, Cards, Jammers etc. (GTADB.net) | Online mode, `atlas87-daily.js`, bundled starter records | **PARTIAL / GAP for complete pin set** | Independent per-set quantitative map coverage audit against public documented totals; do not merge Story data |
| M17 | Current Gun Van, Dealers, Shipwreck, seasonal rotation | `atlas87-daily.js`, `data/online-rotation-current.json` | **PARTIAL** | Trusted dated feed with expiry, valid reset/timezone and source log; separately label candidate locations and actually current daily points |
| M18 | Genuine native classic-world maps and collectible points | `atlas-iv.html`, `atlas-sa.html`, `map-hub.html` | **GAP / PARTIAL** | GTA IV complete categories; San Andreas currently 150 approximate records (50 snapshots, 50 horseshoes, 50 oysters), still missing 100 tags/70 jumps; 7 other game/episode notebooks need licensed native basemaps and georeferenced pins |
| D01 | Searchable vehicle, boat, bike, aircraft catalogue (GTABase / GTADB) | `atlas90-vehicles5.html`, `atlas100-universe.js`, `atlas93-garage.js` | **PARTIAL** | Source-proven model, class, sale location, variants, handling, 4-wheel/boat/aircraft separation, source dates; flag unknown rather than guess |
| D02 | Detailed performance and compare with official/tested provenance | `atlas100-universe.js`, `atlas100-showroom.js` | **PARTIAL / GAP** | Never infer 0–60, top speed, lap times, armor or upgrades; implement side-by-side comparison only for independently verified matching specs |
| D03 | Property and business reference pages (GTABase) | `atlas-database.html`, `atlas93-garage.html`, world tools | **PARTIAL** | Price, location, in-game access, storage, unlock and variants from credited records |
| D04 | My Garage / personal location ownership / customization | `atlas93-garage.js`, `atlas99-garage3d.js`, `atlas-vehicle-configurator.html` | **CODE / PARTIAL** | Boat/aircraft bay-type accuracy, vehicle spec/source panels, saved placement/notes, image verification, export/import + migration regression |
| D05 | Weapon, character, wildlife detail pages | `atlas90-weapons.html`, `atlas-characters.html`, `atlas-animals.html` | **PARTIAL** | Full provenance, exact game edition, proper subject-specific imagery, missing profiles/images |
| U01 | No-account guest save, export, restore, on-device ownership | `atlas93-garage.js`, `atlas186-cayo-route.js`, site progress tools | **CODE / PARTIAL** | Per-tool backup roundtrip and storage-key migration; shared route links must not share private notes |
| U02 | Secure synced account progress (MapGenie / GTAMap.io) | Guest storage is local; no verified HTTPS account provider | **GAP by design** | Separate consent/privacy/security project after core maps are solid; guest access must remain default |
| U03 | Clear updated info vs 'possible' / season expired | `atlas87-daily.js`, `atlas166-update-notice.css`, Cayo daily expiry | **CODE / PARTIAL** | Time-stamped source provenance, inactive seasonal labels, no stale live badges, owner-reviewed refresh process |
| U04 | Premium per-world original cinematic artwork | `art/jura155-*.webp`, `art/jura157-*.webp`, 15 heist WebPs, `scripts/test_atlas163_premium_asset_ledger.py` | **CODE / PARTIAL** | Side-by-side vs approved reference pack, desktop/390px photo decode and target uniqueness; no generic legacy fallbacks presented as final |
| U05 | Phone/tablet usability, map gestures, accessibility | Responsive styles, `scripts/test_atlas171_browser.py`, `scripts/test_atlas186_route_browser.py` | **PARTIAL** | Full Chromium AND Edge, iPhone Safari physical-device map gesture + keyboard/screen reader + offline fallback, no overlay collisions |
| U06 | Sources, attributions, corrections and rights | `atlas-credits.html`, `atlas-verification.html`, Standing Charter | **CODE / PARTIAL** | Item-level rights checks before imported imagery/map tiles; full source-specific ledger; compare permissible workflows not artwork |
| VI01 | Post-launch Leonida official mapping (Rockstar 2026-11-19) | Existing `atlas-vi.html` is provisional from prelaunch research | **NEW PRIORITY / GAP** | Save immutable existing research separately; review Rockstar official printable map, verify projection/legal terms, build new official-reference layer only when allowed; promote claims individually with evidence |
| VI02 | GTA VI screenshot/model/spec fact freshness | `atlas-research.html`, `atlas-database.html`, labeled VI records | **GAP for comprehensive post-launch data** | New official launch source ledger and game-play verification queues; no fake completeness or unconfirmed meshes |
| P01 | Real in-game 3D model / terrain | `atlas-3d.js` plus illustrative configurator | **PARTIAL / GAP** | Distinguish conceptual WebGL heightfield from verified licensed 3D geometry; prioritize complete 2D first |

## Priority order and release gates

**P0 / Now — Prevent incorrect claims and protect accepted quality**
1. Complete Cayo 18.7 actual Chromium + Edge browser acceptance and owner visual review without merging `development` before approval.
2. Audit GTA VI post-launch claims and update site labels showing '*coming soon*' where launch has happened; don't bulk verify provisional locations.
3. Preserve 13 distinct premium world covers, 15 heist images, original E crest, saved progress, Story/Online/VI isolation and security headers in every later release.

**P1 / Core 1:1 usefulness — Mapping and progress**
4. Produce automated **quantitative per-category source coverage tables** in Story, Online, Cayo, IV, SA and classic workspaces. Distinguish count of source records, displayable pins, verified coordinates and user-added pins. No category is 'complete' because a menu entry exists.
5. Add independent, licensed/verified geospatial pins and native 2D basemaps for classic GTA worlds; add missing SA tags and stunt jumps.
6. Correlate local progress across checklist and map for same canonical ID; preserve old localStorage keys or provide migration tests. Add hide-collected and share-to-item where absent.
7. Obtain independently validated road topology and route geometry for V/Online; road-aware Cayo routing only after valid Cayo graph, otherwise keep visible 'straight-line schematic' caveat.

**P2 / Database parity**
8. Structured item-level provenance for vehicles, boats, planes, properties, weapons; sources for prices, specs and in-game locations; compare only trustworthy like-for-like rows.
9. Per-heist objective/entry/exit/checklist audits for all 15, beginning with other high-traffic heists after Cayo approval.
10. Upgrade personal garages and ownership tracking with per-class parking/slot logic and protected export/import backups.

**P3 / Freshness and GTA VI launch**
11. Daily and weekly source snapshots (UTC validity, exact reset logic), player-facing 'last verified' and seasonal inactive wording, no fabricated daily active claims.
12. Rockstar official launched-game Leonida map review and permission; versioned VI research-vs-verified overlay migration. Keep original 3,425-record provisional snapshot available to trace what was previously believed.
13. Secure optional account sync only after standalone security / privacy acceptance.

**P4 / Premium final**
14. Designed-brand side-by-side check for each of 13 world portals and 15 heists, 390×844 and 1440×900, map interactions in both Chromium/Edge, iOS Safari device test, complete artifact ZIP audit, attribution inventory and owner sign-off. Only then consider cross-site parity substantially complete.

## What *must not* be called parity

- A working 13-world link does **not** mean 13 world maps have licensed accurate location layers.
- A list of 14 Cayo categories does **not** prove all spawn points or daily selections are verified.
- A JavaScript graph engine does **not** imply a sourced road/path network; distances must not be advertised as travel times.
- The existence of a vehicle list does **not** guarantee GTABase-level stats and variants.
- Desktop/Chromium tests alone do **not** establish true iPhone Safari gesture quality.
- Rockstar's 2026-11-19 GTA VI release does **not** retroactively confirm 3,425 historical community locations.
- Source-licensed **code** and source-licensed **data** are separate; public site visibility alone is not reuse permission.

## Current work-in-progress / provenance

- [PR #70 staging work](https://github.com/jyates0125/team-jura-atlas-preview/pull/70) contains Atlas 18.7 route-from-any-marker + chosen final pin, resume after visited and sharing; CI status must be read **per exact head**. The last fully passed focused QA run for Cayo 18.6 is [#44816426882](https://github.com/jyates0125/team-jura-atlas-preview/actions/runs/44816426882) and does not automatically certify 18.7.
- Authoritative project reference: `docs/TEAM-JURA-STANDING-CHARTER.md`, `docs/ATLAS-SITE-COMPLETION-CONTRACT.md`, and approved original design pack.
- Old `atlas-feature-audit.html` is correctly labeled an **historical** snapshot; this matrix is the current code/reference comparison, **not** a release certificate.
