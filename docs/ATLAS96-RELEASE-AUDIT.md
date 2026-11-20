# TEAM JURA ATLAS 9.6 — Cumulative Designed Brand / Full-Site Functional Audit

**Release candidate prepared:** November 15, 2026  
**Upgrades combined:** 9.4 + 9.5 + 9.6  
**Only branch authorized for automation:** `development`  
**Production `main`:** left unchanged, promotion blocked until browser/brand QA passes.

## 1. The unchanging brand master

The reference design is **Team Jura Original Design Reference Pack**, implemented in repository as `docs/APPROVED-DESIGNED-BRAND-MASTER.png`, supported by `docs/ATLAS92-MASTER-SPEC.md` and newer approved screenshots. The hierarchy is **Elario Studios → Team Jura → Atlas**; signature presentation is violet/purple, sunset orange, gold, accessible contrast, cinematic/game-specific illustrations, approved Scaly/Loki art, branded navigation, map-centric working space. Third-party map sites are **data, accessibility and interaction references**, not masters to visually copy.

This release **reuses** existing approved `art/atlas86-scaly-approved.webp`, `art/atlas86-loki-approved.webp`, installed garage/Dispatch hero art, YANIS / DUPZOR attributed map imagery and existing artwork. It adds styling but does not silently replace approved hero images or brand hierarchy. No new third-party art is bundled. A static reference check cannot prove pixel equivalence; visual browser comparison against the original image remains required.

## 2. GTA VI sources, date and honesty

- **GTADB.org open source repository** (`https://github.com/rolux/gtadb.org`, `map/data/6/landmarks.json`) is the data source for this release's synced VI research snapshot. Code MIT; landmark data marked **CC BY 4.0**. Preserve attribution and modifications note. *The map art, original game assets and external websites can have different rights; attribution does not alone grant reuse rights.*
- At review time the public source contained **3,401 keyed records**, of which **3,307** had usable X/Y pairs and **94** lacked usable coordinates. These numbers are an upstream observation, **not a claim of currently installed Atlas records**. The source dataset is fetched during the user-triggered GitHub workflow, with hash and counts recorded in `data/gtadb-6-manifest.json`.
- **GTADB.net** is separately operated and reports **2,706 community markers / 93 categories / 102 unpositioned search records**. Those totals and data are NOT imported automatically and are not equivalent to the GTADB.org source. Compare only until specific reuse rights are confirmed.
- All GTA VI community positions, **including trailer/screenshot or source-derived locations**, are labeled **UNVERIFIED** until independently matched to actual in-game geometry. Evidence of a trailer scene is not verification of coordinate accuracy.
- Invalid/missing coordinates remain searchable only. Never generate them from names or make up collectible/vehicle spawn positions. No speculative pins, Rockstar account access, or fake live GTA VI feed.
- Rockstar's announced November 19, 2026 launch is the checkpoint for a controlled post-release verification workflow; no unsupported auto-upgrade of community confidence to official.

## 3. What's actually implemented in this ONE cumulative package

### 9.4 — Clean controls and research progress

- Hides the redundant `juraMapLegend` panel; existing engine's left-hand category and named-layer toggles stay functional.
- Keeps the trailer evidence in a collapsed, left-sidebar section; no obscuring the illustrated map.
- Hides duplicate 3D quick button; keeps native 2D / WebGL map controls and honest optional heightfield notice.
- Restores the missing **Loki / DUPZOR** map view selector choice while preserving the renderer. Runtime tiles/position alignment require browser verification.
- Adds standalone research progress export/import and a next-unvisited shortcut, without a proprietary backend.

### 9.5 — Native Research 3D + full licensed VI source path

- Uses **the existing Atlas WebGL renderer inside `atlas-research.html`** with 2D/3D switch, north reset, zoom and optional local elevation binary. No new fake CSS perspective. Displays a flat illustrative perspective with an explicit status when no verified heightfield is present.
- Reuses Scaly/Loki approved portraits and branded violet/amber/glossy controls. Adds source counts, mapped vs coordinate-less filtering, a cross-link from a selected GTADB.org L-ID to the native GTA VI explorer and source/uncertainty labels.
- Replaces the existing GTADB.org sync script with a version that keeps the source records without coordinates as search-only entries. The workflow generates a reproducible source hash, source date, mapped/unmapped counts, additions/changes/removals and attribution.
- Native V/Online route/collection keys, other game-world pages and original map geometry remain untouched.

### 9.6 — Clustering, collection/garage linkage, page sweep

- Custom original **screen-space pin clustering** for the standalone Research map: groups many close source pins into numbered violet/gold circles, clicking a circle zooms and recenters to break it into individual colored pins, and at closer zoom pins show individually. Pin count never implies verified gameplay. Keyboard arrows pan, +/− zoom. No changes to actual source coordinates.
- Full **My Garage per-instance parking ledger**: supports multiple copies of one car model, a location/floor/parking bay, personal plate/build notes, user-entered planned garage capacity, occupancy meter and warnings, edit/remove without deleting model ownership, migration of prior model assignments on confirmation, JSON merge backup and restore. Own separate storage key (`team-jura-atlas96-parking-v1`); preserves 9.0/9.3 keys and original showroom.
- Catalog cards for GTA V/Online now get a **Park in My Garage** link with the actual model ID. It selects the model on arrival and never creates a car automatically without the user's click.
- Adds in-site Atlas 9.6 audit gate to `atlas-feature-audit.html`, and a **59-page repository-wide static analyzer** which checks missing refs, duplicate IDs, alt text, known brand source files, critical core pages. It emits `docs/ATLAS96-SITE-AUDIT.generated.json` in the Action run. This is **static** inspection, not a tested functionality claim.

## 4. Full-site scope: 59 HTML pages (development branch)

| Page or group | Source code / baseline observation | This release | Remaining release gate |
|---|---|---|---|
| `index.html`, `elario.html`, `team-jura.html`, `project.html`, `atlas81-hq.html` | Elario brand, original approved crew/hero, HQ/studio presentation | Preserved; reference assets checked by site audit | Visual screenshot comparisons; menu and card links on desktop/mobile |
| `maps.html`, `map-hub.html` | All-world directory and reference routes; original maps hero art | Preserved, not redesigned into generic placeholders | Test every world-link destination and honest implemented/reference labels |
| `atlas.html` (V Story), `atlas-online.html` (Online) | GTA V map layers, filters, personal pins, routes, collection status, online-only safeguards | Preserved; no retrofit of speculative VI data | Validate satellite/terrain/UV layers, completion, roads, import and save state |
| `atlas-vi.html` | Scaly / YANIS, DUPZOR, left categories, route/3D, trailer research | Duplicate legends cleaned, Loki choice restored, source banner; 3D status clarified | Live tile load, correct Loki imagery and coordinate alignment; phone layout |
| `atlas-research.html` | Standalone 2D YANIS canvas, source/category filters, mapped and unpositioned GTADB.org data | Embedded native 3D, visible source counts, clustering, next-unvisited, JSON progress | Browser WebGL, CORS texture, data fetch, 3,307 upstream pin stress test |
| `atlas93-garage.html` | Existing 9.3 owned/assigned model tracker, colors/notes/custom builds/export | Per-instance parking, migration and capacities with independent key | Playwright test with full real repo, actual image availability, responsive screenshot |
| `atlas90-vehicles5.html` / 6 / weapons | Pictured catalog with source-linked archive/fallback art; VI images labeled reference | V/Online per-model direct link to parking | Vehicle roster completeness, game-edition source, image rights and image parity |
| `atlas-catalog.html`, `atlas90-vehicles5.html` | Legacy catalog vs 9.0 vehicle gallery have overlapping browsing | New parking link in 9.0, legacy unchanged | Deliberate unified model-ID migration and no duplicate ownership sources |
| `atlas-checklist.html`, `atlas-completion.html`, `atlas-passport.html`, `hunt-hq.html` | Local collection progress and HQ bridges | Saved-state keys preserved | Source ID → individual pin → completed → route exclusion cross-page integration |
| `atlas87-daily.html`, `atlas93-dispatch.html` | Local dated rotation import/status; no official feed | Preserved; cannot claim live server automation | Confirm daily/weekly date reset logic and opt-in data permissions |
| `atlas-cayo.html`, `atlas-sa.html`, `atlas-iv.html` | Heist/older-world maps with varying completeness, SA tracker | Preserved | Accurate licenses, real image tiles, pin coordinate packs, browser checks |
| 14 `heist-*.html` | Personalized notes, sourced intel and schematic pinboards | Preserved; no invented POIs | Real mode-specific heist POIs, entry/exit and multi-stage route verification |
| `atlas-verification.html`, `atlas-coverage.html`, `atlas-calibration.html`, `atlas-test-center.html` | Source/QA tools in repo | Static audit panel linked for discoverability | Run real browser tests and review actual license + screenshot evidence |
| `atlas-activities.html`, `atlas-toolkit.html`, `atlas-pack-format.html`, `atlas-credits.html` | Data packs, sources and activity rules | Preserved | Check source update, import permissions, attributions and pack schema |
| `directory.html`, `discovery.html`, `explorer.html`, `online-explorer.html`, `legacy-explorer.html`, `leonida-hq.html`, `atlas8-preview.html`, `guides.html`, `one-last-ride.html` | Mixed old/reference/creative pages and legacy routes | Static audit includes them; no destructive redirect or deletion | Decide canonical URLs, legacy retirement and intended artwork after live testing |

Every HTML document is included in the analyzer, even pages not individually named above. The table expresses **scope and risk**, not 59 browser-tested pages.

## 5. Feature parity vs GTAWeb / GTADB.org / GTADB.net / GTABase

| Capability | Cumulative 9.6 expected state | What is NOT claimed |
|---|---|---|
| VI landmark pins | GTADB.org licensed source snapshot after Actions workflow, all unverified | Not GTADB.net 93-category licensed parity |
| Unknown-location records | Searchable, no speculative coordinates or pins | No geolocation inferred from names |
| Layer/marker controls | Existing engine's left filters; source-family and category filters in Research | No verified in-game interactions or all game modes |
| Marker clusters | Native Research 2D canvas circles, click to zoom and separate | No 3D-side cluster UI parity yet |
| 2D/3D | Native research WebGL perspective, 2D fallback | No accurate elevation absent proven heightfield |
| Routes | Existing approximate/roadgraph-import tools | No verified navigable GTA VI driving route provider |
| Visited / Favorites | Existing browser-local data and progress backups | No cloud sync or Rockstar Social Club sync |
| Owned vehicle garage | Separate model ownership + multiple individual instances | No automatic feed from game or guaranteed floor capacities |
| Vehicle/weapons catalogs | Existing image-first local model catalog | No guaranteed complete official DLC statistics/vehicle images |
| Daily/weekly availability | Source-dated imported local snapshots only | No live Rockstar activity API |
| Image/art rights | Reuse of approved repo imagery and linked source credits | No blanket redistribution rights from mere public visibility |
| Designed Brand | Master preserved; typography/color/chrome treatment implemented | NOT pixel-perfect until actual screenshot comparison |

## 6. Automated release tests performed at packaging

- `node --check` for newly shipped JavaScript and patch syntax.
- Python 3 static tests for source validation, 9.5 source filter/provenance, exact guard anchors, idempotent HTML injection, marker cluster click + keyboard integration and garage link injection.
- Original vanilla JavaScript `TeamJuraClusters96.group()` verified for grouping and no source record mutation in Node.
- Chromium browser **isolated DOM fixture** with mocked catalog and localStorage: created two parked `buffalo` instances in separate bays, confirmed count, storage, edit control and no page errors. The real repository website could not be navigated in this runtime (`net::ERR_BLOCKED_BY_ADMINISTRATOR`); fixture tests are not live production verification.
- GitHub direct write attempt returned **403 resource not accessible by integration**; package is local, not committed or deployed. Source GitHub action requires upload by an authorized account.

## 7. Deployment gate checklist

- [ ] Upload all package files to repository **development** branch, retaining exact paths.
- [ ] Run only **Apply Team Jura Atlas 9.6 cumulative major upgrade** workflow once.
- [ ] Confirm synced source count, mapped vs search-only, source SHA, path references; report no missing required assets.
- [ ] Check map Research on desktop and mobile: Yanis tile visibility, source pins, clustering at low zoom, cluster click→zoom→individual pins, filters, selection, imports, 2D/3D WebGL and fallback.
- [ ] Check VI explorer Scaly, Loki, original YANIS, original DUPZOR, footer credits, routes, category/named layer toggles, no floating obstruction.
- [ ] Check My Garage: owned model→catalog→Park link, multiple instances, slot edit/removal, capacity warning, offline restart, JSON backup, no state migration loss.
- [ ] Compare screenshots at desktop and iPhone widths with **approved master image**, document differences and unfinished work.
- [ ] Confirm nav, color contrast, keyboard focus, screen-reader labels, caching and CORS; resolve any failures before promoting `main`.

## 8. Sources and rights

- https://github.com/rolux/gtadb.org — GTADB.org source, repository MIT code license, published open geographic data attribution.
- https://creativecommons.org/licenses/by/4.0/ — attributed landmark data license terms.
- https://gtadb.net/gta-6-map/interactive/ — separate operator/UX benchmark (NOT bulk copied).
- https://www.gtabase.com/gta-6/map/ — set controls / next-unvisited UX reference (no data copied).
- https://github.com/Stuyk/gtav-image-archive — linked model imagery reference; check individual media rights before redistribution.
- https://www.rockstargames.com/VI — official upcoming launch/news source, not a license for images or proprietary code.
- `docs/ATLAS92-MASTER-SPEC.md` and `docs/APPROVED-DESIGNED-BRAND-MASTER.png` — project-owned approved master reference files.

**Prepared by Team Jura for Elario Studios; independent fan project, not affiliated with or endorsed by Rockstar Games or Take-Two Interactive.**
