# Atlas 36.3 — GTADB original-source credit and opt-in elevation reference
Date: 2026-11-23. No source heightfield redistributed or downloaded.

## Owner-approved attribution
The owner requests full credit to GTADB.org and contributors in the dedicated Sources & Rights register, not repeated credit cards obscuring the map. Keep a single slim visible map credit: "Map data: GTADB.org · CC BY 4.0 · Credits & changes." The sidebar category controls link to full source details. The source register includes GTADB's preferred attribution for GTA VI Landmarks Data and GTA VI Map Tiles, original publisher/copyright details, repository/license links, and a description of Team Jura changes (source organization, categories, styling, route preview, search, guest progress and caching). None of this claims rights to Rockstar's underlying game IP or unrelated third-party proprietary files.

GTADB GitHub: https://github.com/rolux/gtadb.org (published data license: LICENSE-DATA, CC BY 4.0; code MIT). Reuse FAQ: https://faq.gtadb.org. The repository README specifically asks users not to fetch live website media and recommends the versioned GitHub copies for data, imagery and map tiles.

## Ground-height inspector, not a full DEM
The publicly documented GTADB experimental elevation API https://api.gtadb.org exposes a per-coordinate GTA VI ground-height query. Atlas 36.3 uses it ONLY after the visitor presses "Check GTADB height at map center" inside Directions > Experimental Leonida 3D terrain. Source: the active 2D map camera X/Y. The browser makes a single request to GTADB's documented API endpoint, with no credentials or API key; it does not stream a raster, crawl millions of points, or poll in the background.

A successful result shows the returned community height in meters. If the user has a permitted local heightfield in memory, it also shows the interpolated local height and difference at that coordinate. This comparison is an analytical convenience: both sources may derive from the same map reconstruction; it does NOT establish independent game correctness, source permission, calibrated official heights, or acceptance of a distributable binary. No visitor coordinates or GTADB replies are sent to Elario servers or stored in local storage. An unavailable API, missing CORS permission, network failure, invalid reply, or timeout leaves the existing 2D/3D map untouched with an explanatory status.

## Actual 3D gap
The WebGL 3D terrain engine, mobile orbit/two-finger pan/pinch, local heightfield import and optional SHA-256/independent-control-point claimed alignment gate are implemented. The 1536 x 1748 GTA VI elevation binary is not present in GTADB's public GitHub repository (as of pinned revision d406fea099e1df2bce42fd6b87eed04bce646629). GTADB's FAQ welcomes reuse but the specific file is still absent. A separate georeferenced raster from wpenistone/leonida_gis is a technically plausible candidate, though source-file redistribution rights have not been established. Do not manufacture hills or claim 3D elevation completeness.

## Tests and release boundaries
Focused test: node scripts/test_atlas363_gtadb_elevation_probe.cjs. It runs deterministic mocked network checks for source URL, coordinate range, bad API replies, missing local DEM, successful local comparison and attribution. No actual external elevation requests occur during automated tests. Existing terrain importer/geometry tests, publish build, and internal-file publishing audit must pass. Actual external API accessibility, CORS, native iPhone Safari, true licensed grid rendering, independent gameplay alignment and full release QA remain separate owner acceptance gates.

Merge only into internal draft integrated staging PR #98 after focused checks; public Cloudflare development and protected main remain unchanged.
