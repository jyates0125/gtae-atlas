# Atlas 19.4 · Research and visual coverage charter
**Staging only.** This does not assert exact parity with competing fan sites or authority over third-party artwork.

## Verified external comparison, 20 November 2026
- [GTADB GTA Online interactive map](https://gtadb.net/gta-online-map/interactive/): searchable, toggleable map markers, locally saved progress and source credited landmarks and Online locations. Our Atlas has world-scoped filters and locally saved favorites, routes and personal pins. **Gap:** verify completeness of current rotating/daily locations and source-per-marker detail.
- [GTADB GTA Online daily locations](https://gtadb.net/gta-online-map/street-dealers/): current daily reset labels and sourced positions; our Daily board must never advertise today's locations without verified provenance. **Gap:** comprehensive daily rotation status, time zones and automatic resets.
- [GTADb tools / maps](https://gtadb.io/tools/maps): multi-GTA franchise map browsers with world-specific coordinates and completion tracking. Our 13 destinations exist but coordinate coverage varies and older maps defer 3D. **Gap:** verified individual marker totals and archival game progression.
- [GTAWeb](https://gtaweb.eu/): long-running GTA community map/toolkit; compare icon parity, discovery by category, seasonal state and save usability. **Gap:** audited equivalence of category inventories, not merely similar-looking menus.
- [GTA Base GTA V maps](https://www.gtabase.com/grand-theft-auto-v/map-locations): strong vehicle/game reference coverage and a separately embedded third-party map. Our database should keep vehicle specification provenance and distinguish Story versus Online.

## Immediate release gates
1. All 80 published root HTML pages must have a captured 1440px desktop and 390px phone image in Chromium **and** Edge; query-specific map variants add further images.
2. Keep machine-readable per-page evidence of viewport overflow and failed *visible* image assets. A screenshot capture does NOT certify interactivity or licensing.
3. Preserve interactive controls/keyboard labels/source links, separate user-progress keys and game-world boundaries. Gating functional QA remains the production-browser smoke and dedicated suites.
4. Manually review the output against the owner-approved Original Design Reference Pack; individual improvements should be focused on game context and user journeys, never generic color-only skining.
5. Live merge on hold until the owner accepts rendered staging in writing.
