# Team Jura Atlas · Designed Brand / Forward-Only Master Specification

This file is a source of truth for new work and does not authorize a rollback of existing functionality.

## Approved vision

- **Parent:** Elario Studios; **project:** Team Jura Atlas; **team:** Team Jura.
- Visual authority: user-provided `APPROVED-REFERENCE-DASHBOARD.png` and related newer approved screenshots. Sitewide neon violet/amber/gold, readable high-contrast chrome elements, game-specific illustration; each page deserves a distinct artwork treatment. No generic black rectangles.
- Map reference: stacked, searchable, toggleable left-side legend as seen in user GTA DB screenshots and working Cayo controls. Preserve markers, pin icons, route, searches, local saves, layouts and accessible responsive behavior.
- Keep all existing **GTA VI community research views** (Scaly/Yanis, Loki/Dupzor and existing alternatives); flat map only where it helps heist planning. Map views and data categories are distinct concepts.
- Distinguish `official`, `licensed/community-sourced`, `research-estimated`, `unverified`, and `no usable coordinates`. No fabricated GTA VI collectible coordinates or active Online locations.
- Sitewide menu top-right on desktop, bottom-right when mobile space requires it. Native game controls remain visible.
- Cayo category stacking is the interaction pattern for GTA V/Online/VI. Never clone a second set of pins to simulate categories; keep one engine as source of truth.
- Each collectible needs an individual accurate pin when source coordinates permit, a named matching legend icon, a persistent collection flag and route exclusion on collection where supported.
- Clear event separation: `current verified`, `source-calculated/dated`, `all possible`, `inactive/seasonal`, `research only`. UTC validity windows and source links are required. Do not hotlink an unknown proprietary JSON feed or scrape a site contrary to its terms.
- Heist pages must be usable: checklists, personal route/pin planning, verified source links, and location data when available; keep schematic maps plainly labeled until source coordinates exist.
- Catalog image placeholders must not be represented as authentic vehicle/game screenshots; missing Widowmaker should be debugged as image/search/display issue before duplicating records.
- No page may claim a fake 'live' Rockstar integration. Use in-game source verification and dated public records.

## Scope of the Atlas 9.2 focused patch

1. New unique original directory hero artwork; preserve existing home/crew artwork.
2. Move floating global menu to desktop upper-right, with mobile-friendly fallback.
3. Make existing left-side map legend/filter category controls easier to locate; relocate *existing* VI map view buttons into the sidebar, preserving their event bindings. No map tile, map data, map engine or routing rewrite.
4. Fill empty Daily Intelligence page with known **category names** only, never pretend that unsourced daily active positions are confirmed.
5. Personal heist map-workspace schematic pinboard with local save, delete, export JSON. It does not claim map coordinates or provide verified route geometry.
6. Idempotent GitHub workflow integration into `development` only; existing `main` untouched.

## Follow-up tasks (NOT completed by this patch)

- Source-by-source licensing review of GTADB.org and any GTADB.net original transforms/creative material before bulk copying; signed-up account may not confer redistribution rights.
- Expand GTA VI **positioned** records from allowed datasets with matching coordinate transforms and provenance. Keep non-positioned records search-only, and distinguish actual collectibles from speculative ones.
- Full GTA V/Online/VI map category coverage matrix using actual engine data + regression runs; dynamic category counts must reflect actual records, never marketing numbers.
- Accurate official/community artwork per game and independent original hero art for each distinct page.
- GTA Online daily/weekly genuinely source-dated data ingestion, automated validity checks, expiry warnings, and user opt-in import/export. No invented 'current' pins.
- Heist-specific verified coordinate overlays (entrances, exits, setup objectives), initial actual map view and route planner. Pin notebook is explicitly schematic interim functionality.
- GTA V personal garage: link owned vehicles from gallery to garage and drive persistent slots. Audit image archive licensing and individual car model photographs.
- Map screenshots / UI tests on desktop and mobile for all worlds and routes; broken image and empty event alerts, accessibility tests, caching and performance.

## Research/source register, checked November 14, 2026

- GTADB GTA VI interactive map: https://gtadb.net/gta-6-map/interactive/ (2,706 positioned community map markers, 93 categories, 102 unpositioned research records at review time). Counts and data may change.
- GTADB GTA Online interactive: https://gtadb.net/gta-online-map/interactive/ (3,410 markers at review time, current/possible distinction with UTC deadlines). Do **not** redistribute all content merely because the site is public.
- GTADB GTA V Story: https://gtadb.net/gta-5-map/ (track collectibles and challenges; location-coordinate sources vary).
- GTADB source credits: https://gtadb.net/sources-methodology/
- Creative Commons licenses are per-work/per-data-set; original web interface and source artwork may have distinct rights.

## Release QA gate

- GitHub `development` workflow success; **main untouched**.
- HTML static injection checks; JS syntax and idempotence.
- Actual Cloudflare screen checks: all map artwork loads; current GTA VI views still switch; left filters toggle markers; zero console errors; no overlapping menus; heist notes survive refresh; online daily fallback appears when legacy dashboard fails; existing gallery and collection tests remain passed.
- Do not declare full feature parity until test results verify it.
