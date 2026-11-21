# Atlas 21.8 · Yanis V18 Community Research map restoration

**Branch:** `feature/atlas217-leonida-connected-world` · draft PR #77 · **review only**. This is not a production merge.

## Diagnosis and source

On the prior built screenshots, `atlas-research.html` loaded Yanis V18 map tiles successfully, but the original map artwork appeared washed out and centered on Vice City with the separate image-reference collage visible on the right. The application had been using `camera={x:0,y:0,z:1.3}` and CSS `brightness(1.17) contrast(1.07)`; Brighten increased it further to `brightness(1.38)`.

GTADB's upstream `rolux/gtadb.org/maps/maps.js`, under GTA VI defaults, specifies `x:-4000`, `y:2000`, `z:1`. Yanis V18 is listed as `yanis,18` with published bounds for tile levels 0–5. Repo: https://github.com/rolux/gtadb.org · reference map https://map.gtadb.org. Data and tiles are credited to YANIS, GTADB.ORG and the GTA VI Mapping Community under CC BY 4.0; see `atlas-credits.html`.

## What changed

- Initial camera **and** Fit/Home both use `(-4000, 2000, 1)`. This centers the map on the source-defined overview rather than the artwork's right-side reference area. Panning/zooming still work.
- Yanis V18 renders in its **natural, unfiltered colors**. An optional milder Brighten mode remains available.
- The map is clearly labeled Yanis V18 and credited to its community creators. It is **not** claimed to be Rockstar's official coordinate map.
- A direct, accessible on-map Show pins/Hide pins control proxies the preexisting `#showResearchPins` change event and `jura101-research-pins-visible` local-only preference. The canonical landmark source, filters, favorites, visited markers, route data and any imported personal research were **not** modified.
- On phones the display tools move above the map body so they no longer obstruct the lower edge and credits.
- The standalone Research map remains distinct from the GTA VI main explorer. In the connected VI workspace, the official Rockstar poster and speculative community coordinates remain separate layers, with no synthetic georeferencing.

## Acceptance gates

- `python scripts/test_atlas172_research_map.py`
- `python scripts/test_atlas218_yanis_v18.py`
- `python scripts/test_atlas218_yanis_v18_browser.py`, both Chromium and Microsoft Edge, at 1440px and 390px against built `public/`
- The browser test checks 1+ real Yanis V18 tile loads, camera start/reset, map canvas visibility, interactive pin preference and localStorage, zoom, optional brightness, fullscreen/Escape and phone document overflow.
- Full project source audit, 80+ public page smoke, brand screenshot capture, Cloudflare production ZIP and owner's visual sign-off still apply.

## Known limitations / remaining work

- Zoom levels 0–5 currently request licensed upstream GTADB tiles with a GitHub raw fallback. **Offline low-zoom assets are not yet bundled**; do not describe this view as fully offline certified.
- V18 is a community pre-/postlaunch comparison reconstruction, **not** the released in-game basemap; a GTADB research point must remain provisional until actually verified.
- Do not infer that Rockstar has published or permitted source downloads of every vehicle, weapon, character illustration or image. Use official launch material as attributable evidence, and inspect reuse terms per asset before copying.
- iPhone Safari/WebKit native touch, dynamic URL bar and true offline behavior remain device/manual acceptance gates.
- No merge into `development` or protected `main` without the owner's explicit rendered-preview approval.
