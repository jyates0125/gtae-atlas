# Team Jura Atlas 9.4 — Designed Brand / parity and release audit

**Date:** 2026-11-15. **Target:** `development` only. **Production `main`:** must remain unchanged until browser QA. **Master:** `docs/APPROVED-DESIGNED-BRAND-MASTER.png` and `docs/ATLAS92-MASTER-SPEC.md` in the original repository.

## Implemented in the enclosed code
- Hide legacy `Map Legend` that duplicates the live left sidebar category and named-layer controls. The underlying engine and category filters remain untouched.
- Keep `Trailer & scene research` as an **optional, collapsed section in the left sidebar**, never a floating map overlay. Its records and locate/route controls are retained.
- Remove the **duplicate** quick 3D terrain button, preserving the existing native WebGL toggle and 2D map. Explain that heightfield relief requires a licensed local elevation file.
- Add a map display section to the standalone Leonida research sidebar: current 2D research view, direct link to existing 3D explorer, existing source/category toggles. This is **not** embedded 3D on the research canvas.
- Preserve violet, orange and gold brand colors, crew art, licensed map illustrations and existing route/progress mechanisms.
- No claimed live-data feed, no new guessed markers and no changes to GTA V/Online views.

## Current external feature parity, November 15, 2026
- GTADB.net GTA VI: publicly describes 2,706 community markers, 93 landmark categories, and 102 search-only records without coordinates; marker-family filters, 2D Yanis view, share links, visited/favorite state, source-linked photos. https://gtadb.net/gta-6-map/interactive/
- GTABase GTA VI: 106 locations in 24 categories at Nov 11 update; next unvisited item, hide-found, fullscreen, device progress sync for signed-in members. https://www.gtabase.com/gta-6/map/
- GTAMap.io GTA V: nested set toggles, completion checklists, coordinate feedback, 85 marker types, road/navigation layers and saved style. https://gtamap.io/gta-5-interactive-map/
- GTADB.org provides map/landmark open-source material and experimental geo/elevation/route APIs; public status of a route API does not grant permission to fetch arbitrary data. https://gtadb.org/ and https://api.gtadb.org/

## Additional targeted fixes included
- **Loki restoration**: guarded restoration of the `loki,view` selector choice for the existing native DUPZOR rendering path; source map implementation existed, but the published dropdown lacked the value. This should be browser-tested for correct tiles/artwork.
- **Research next unvisited**: shortcut clicks the existing filtered/loaded result list, extends batches up to eight times if all currently shown entries are visited, and selects the next available research result. This is *not* a full global 2,706-record optimal route solver.
- **Research progress backup**: export and merge-import visited/favorite browser-local states with schema validation and explicit user confirmation; no cloud sync claims, and a page refresh is needed after importing.
- **Post-release safeguards**: existing route data, native engine, game-specific save keys, map tiles and location records are untouched; all GTADB research records remain provisional unless independently verified.

## Major push priority, not yet delivered
1. **Single canonical map-control architecture** shared by V, Online and VI; remove obsolete patches rather than stack yet another UI bridge; centralize state and accessibility.
2. **Research 2D/3D parity:** move 3D into the research map viewport using one engine/view state, with WebGL detection, safe fallback, loaded heightfield provenance and explicit geographic calibration; do not falsely badge flat perspective as elevation.
3. **Verified and provisional data pipelines:** run the existing `gtadb-vi-sync.yml` after checking upstream attribution/rights; inspect `data/gtadb-6-manifest.json` (currently reported not-yet-synced in repository). Import licensed actual data only; search-only records stay unpinned.
4. **Collection parity:** per-collection next unvisited, per-category full count, hide found, optimized routes, source page / photo, bookmarks, CSV/JSON backup and device-sync design.
5. **Releases & provenance:** evidence confidence tier, cited original source, review date, schema validation, import report of added/changed/deleted markers and no silent migration of user saves.
6. **Performance:** virtualize large search lists; viewport spatial index for 2,700+ markers; visible tile cache; responsive sidebar; screen-reader focus flow and keyboard map controls.
7. **Real QA gate:** laptop+phone screenshots against approved reference pack; test all map styles, 2D/3D, named layers, category toggles, markers, source photos, routes, persistence, malformed data imports, broken tile fallbacks, and service worker cache invalidation.

## Pending verification / no unsupported claims
- 3D on standalone research page is only linked, not implemented inline.
- Existing WebGL renderer may show flat relief without `elevation-6.bin` and WebGL support; browser behavior not tested here.
- GTADB.net and GTADB.org are distinct projects; never automatically assume their respective terms/feeds are interchangeable.
- Visual screenshot pixel parity cannot be certified by static checks; original reference image needs browser screenshot comparison.
- Existing GTA VI `data/gtadb-6-manifest.json` is not-yet-synced per Nov 15 repo inspection; do not claim 2,706 markers imported into Atlas. The external public GTADB.net community count is not equivalent to the separately licensed GTADB.org upstream snapshot.
- The full major feature-parity overhaul is a subsequent project, not included in this contained UI cleanup.

## Deployment
Upload the enclosed files keeping relative paths to repository branch `development`, commit, then run `Actions → Apply Atlas 9.4 map control consolidation → Run workflow` on `development`, entering `development`. Inspect real Cloudflare preview and keep `main` protected. The workflow is idempotent for the HTML injection. Do not overwrite existing repo files: this package contains only new source/workflow paths.

## Designed Brand last-conversation acceptance gate
- Reference pack remains authoritative: `docs/APPROVED-DESIGNED-BRAND-MASTER.png`, `docs/ATLAS92-MASTER-SPEC.md`, plus newer explicitly approved design images. An original reference file existing in the repo does **not** prove every page matches it.
- Elario Studios parent identity, Team Jura heading, Atlas project label and approved violet/amber/orange-gold chrome must persist. Keep Scaly/Loki art and original map illustrations; do not generate fake licensed tiles.
- Each collection should eventually connect **item → mapped pin → route → found status → synced checklist**; retaining separate disconnected buttons is not feature parity.
- Current downloadable patch cannot certify pixel-level design parity because no live browser screenshot comparison has been executed against the master.
- Product launch dependency: Rockstar currently lists GTA VI launch **November 19, 2026**; until play-tested release data is available, GTA VI coordinates and speculative collectibles are unverified. Check official release notes before any post-launch import.

## Further release audit — 15 November 2026
| Area | Current state evidenced | Target for major successor | Risk |
|---|---|---|---|
| GTA VI source coverage | Existing local VI manifest reports 0 synced records | Licensed GTADB.org snapshot + provenance, source counts and stable IDs | HIGH |
| Duplicate legends | Two floating panels re-docked by 8.6, overlapping control concepts | This 9.4 patch hides redundant map panel, collapses trailer panel | LOW |
| Loki style | Native map engine recognizes Loki but selector omits it | Restore and verify selector, tiles, marker alignment | MEDIUM |
| Research 3D | WebGL engine elsewhere; research canvas 2D-only | One live view/controller and honest 3D/flat fallback | HIGH |
| 3D terrain | Optional local elevation-6.bin missing/unverified | License, geometry alignment, source citation, fallback and WebGL QA | HIGH |
| Collections | Partial bridge across maps/HQ/checklists | End-to-end unique IDs, named pins, progress, routes, testable migration | HIGH |
| Daily/weekly intelligence | Local dated snapshots or unknown, not official live data | Provenance/expiry verified and source-updated only | MEDIUM |
| Performance | Research canvas scans and draws visible marker candidates in iteration | Spatial index and list virtualization for thousands of pins | MEDIUM |
| Brand visuals | Approved master and separate patch CSS exist | Screenshot/diff matrix at desktop and mobile | HIGH |
| Test coverage | Static/unit tests available; prior browser QA blocked | Browser smoke tests, screenshot diffs, responsive + keyboard QA | HIGH |

## Public references checked
- Rockstar VI release / pre-load: https://www.rockstargames.com/VI
- GTADB.net VI interactive map and changelog: https://gtadb.net/gta-6-map/interactive/
- GTATracker maps: https://gtatracker.gg/v/maps
- The GTA Map filter/route behavior: https://thegtamap.com/map
