# Team Jura Atlas · source-safe classic map integration (18 Nov 2026)

## Why GTAMap.io helps

GTAMap.io documents a useful **technique**: align a game-specific 2D image with an independently verified coordinate system, tile it at multiple zoom levels, and render categories on top. Its public source list is a research lead, not a blanket license to mirror the finished map website.

Sources reviewed:
- [GTAMap.io disclaimer](https://gtamap.io/disclaimer/) (last edited 16 Nov 2026)
- [GTAMap.io about](https://gtamap.io/about/)
- [GTAMap.io Vice City mapping methodology](https://gtamap.io/gta-vice-city-map/)
- [Official Rockstar trilogy high-res map downloads](https://www.rockstargames.com/newswire/article/89k8a554512311/download-high-res-maps-for-gta-trilogy-titles.html)
- [GTADB open community map repository](https://github.com/rolux/gtadb.org)

## Asset rights by category

| Input | Permitted route for Atlas | Limits / next check |
|---|---|---|
| GTADB community map tiles and landmark data | Obtain **directly from upstream** under the applicable CC BY 4.0 notice; identify project, contributors, source URL and adaptations | Community GTA VI mapping can be approximate/unverified and may contain spoiler-sensitive or leak-derived details; preserve that warning |
| Toliak GTA San Andreas vector tracing | Fetch from the author/repository; keep Apache-2.0 NOTICE and original copyright credits | Game world and trademarks remain Rockstar/Take-Two IP |
| MIT-licensed map engines, coordinates or scripts | Reuse covered **code** or permissively released facts with license and copyright notices | MIT code licensing does not transfer ownership of embedded Rockstar images |
| GTA Wiki text / hand-made map annotations | Check exact page/media licensing and obtain from original source where permitted, satisfying CC BY-SA obligations when applicable | Game screenshots and Rockstar art are separately copyrighted; do not equate wiki text license with game-art permission |
| Rockstar downloadable printed map JPGs | Link to the official downloadable map page; players may install their own lawful copy into a **private browser-local viewer** | Official downloads for viewing/printing do **not** establish permission to republish copies across a public site |
| GTAMap.io's own satellite/paths/road/terrain renders and descriptive text | Link for research; approach rights holder if redistribution or import is desired | Attribution alone is not a public rehosting license |
| GTAMap.io-hosted composite raster tiles | Do not copy or hotlink without a verified grant covering **all** elements | Build our own permitted derivative from upstream assets if possible |

## Atlas 10.8 implementation

- Each of seven classic worlds keeps a distinct game-specific reference URL and original Elario artwork.
- A visitor may import their own PNG, JPG or WebP up to 18 MiB into that world's 2D notebook. File content is validated as a browser-decodable raster, dimension-checked and saved as a Blob in **local IndexedDB**, not uploaded or published to Atlas servers.
- The map is fitted to the notebook without changing its aspect ratio. Personal marker percentages are calculated against the **actual image surface**, not empty viewport margins.
- Existing marker JSON and personal completion save keys remain unchanged.
- Older small embedded personal images continue loading.
- JSON marker exports are **not a backup of a newly imported high-resolution raster**; the UI tells players to retain the original map file. Removing an image never removes annotations.
- On browsers that block offline image storage, the imported file is rejected without changing saved markers.

## Remaining, not yet verified

1. Per-title high-resolution basemap redistribution rights for GTA III, Vice City, Vice City Stories, Liberty City Stories, Chinatown Wars, TLAD and TBoGT.
2. Independent world-coordinate calibration with at least three anchor points per map and quantified pixel error.
3. Fully licensed in-app source marker datasets, **not** blind copies of GTAMap.io pins or GTA Wiki image assets.
4. On-device performance for 18 MiB images on older iPhones, plus cross-browser source evidence for production deployments.
5. Genuine 3D map rendering on older GTA worlds remains deliberately deferred.

No game/map component should be called official, verified, or complete until its source and coordinate checks pass.
