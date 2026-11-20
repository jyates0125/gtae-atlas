# TEAM JURA ATLAS 9.3 — Source, Parity, and Risk Register

## Verified code-base findings (read from `development`, November 14–15, 2026)

- `data/gtadb-6-manifest.json` currently reports **count 0 / not-yet-synced**. The original `gtadb-v6.json` contains a small manually curated starter sample, not a 2,706-record GTADB.net snapshot. The optional 9.3 development-branch sync updates `data/gtadb-6.json` from **GTADB.org**'s separately licensed open-source GitHub dataset, which is not identical to GTADB.net's interactive research categories.
- GTA VI map application already provides Yanis/Scaly/Dupzor/research styles and dual research legends; **keep all existing map engines and no fabricated coordinates**. Art panels and map illustrations are different concepts. Existing image tiles need explicit source/license verification.
- Atlas 8.7 Daily Intelligence depends on `jura68-rotation-feed`; without a local dated snapshot, "current" spawns cannot be verified. 9.2 fixes empty event cards, and 9.3 adds safe import/freshness inspection, but DOES NOT claim automated feed sync.
- Existing Atlas 9.0 garage/gallery state is `team-jura-atlas90-collection-v1` with `owned['vehicles5:modelid']`. 9.3 garage shares this model, stores garage attributes separately at `team-jura-atlas93-garage-v1` and does not overwrite other collection keys.
- Heist mission pages have existing simple checklists and mostly illustrative map panels; 9.2 adds personal **schematic** pins, 9.3 adds research/provenance notes and distinct original scalable SVG accent art. This is not yet complete verified heist-coordinate parity.
- Pre-9.0 front-end identifiers are legacy implementation names, **not** instructions to downgrade or remove them. 9.3 updates displayed 7.x labels without renaming storage, modules or breaking routes.

## Source permissions and workflow

| Source | Use | Terms / caution |
|---|---|---|
| [GTADB.org GitHub source](https://github.com/rolux/gtadb.org) | GTA V/VI landmarks from licensed GitHub snapshot | Code MIT, landmark data CC BY 4.0; attribution to GTADB.org and contributors; upstream explicitly asks NOT to fetch live from gtadb.org site |
| [GTADB.net GTA VI research](https://gtadb.net/gta-6-map/interactive/) | Compare user experience, categorize research and link to source | 2,706 research markers, 93 categories, 102 without coordinates (as checked); *not the same dataset as GTADB.org*; do not bulk-copy without separate permission/data license |
| [GTADB.net GTA Online](https://gtadb.net/gta-online-map/interactive/) | Compare date reset and current/all-possible controls | Daily statuses require expiration and source; no documented public JSON feed license verified here |
| [Stuyk GTA V image archive](https://github.com/Stuyk/gtav-image-archive) | Model reference pictures by model ID | Gallery image references are often white/neutral renders; color swatch is USER PLAN ONLY; check image reuse rights/hosting and attribution before commercial deployment |
| [Rockstar GTA VI media](https://www.rockstargames.com/VI/media) | Official screenshots and marketing images | Rockstar/Take-Two policy is conditional on noncommercial fan use; not a blanket commercial license. Don't bundle by default without suitable permission and visible attribution |
| GTA Wiki / GTAWeb / GTAmap.io / GTABase | Research, catalog parity, guide links | Citation and comparisons, not wholesale copying of their database/artwork; review each license individually |

## Current implementation added in 9.3

- Pictured My Garage: owned states shared with Atlas 9.0, paint-theme previews, secondary color, custom notes, plate labels, multiple named garages, favorites, filters, local backups and optional archive image ID discovery. **Color backgrounds do not recolor Rockstar models.** No Rockstar account sync.
- Atlas Dispatch: 3-card local daily plan for collectible/garage/heist; checks user-browser data, UTC day checkmarks, export, reset. **No invented live spawns or falsely claimed live achievements.**
- Original brand artwork: garage and dispatch widescreen banners use newly generated Team Jura source imagery upscaled to 3840×1440. This is an **upscale, not native source 4K detail**; 22 unique vector scene accents scale without raster pixelation.
- Heist evidence notebook: manual linked sources and explicitly user-verified gameplay status, no claims of verified coordinates.
- Daily source-freshness workbench: safe dated JSON import and expired/current-readable status display; no automated third-party scrape.
- Revision label cleanup + navigation links on existing pages, idempotent files and saved browser data unchanged.

## Parity remaining / DO NOT claim complete

1. GTA VI 2,706/93-category GTADB.net parity requires a **licensed bulk source**, schema adapter and coordinate validation. `gtadb-6.json` from GTADB.org does NOT by itself provide those GTADB.net categories. 102 unlocated records should remain searchable only, never map pins.
2. GTA Online daily automatic current locations require a stable, permissioned machine-readable provider, freshness checks and time-zone/reset validation; no verified public source acquired in this release. Weekly bonuses need official or licensed source/date checks.
3. Verify and map *actual* heist POI coordinates, approach-specific entry/exit, secondary loot, and rewards one heist at a time. Existing 9.2 schematic pins are planning notes, not ground truth.
4. All page artwork: 22 distinct vector accents + two unique illustrated banners are included. Not all 296 repo files were tested live; some pages still have legacy markup. Do not promise every page 4K photographic art.
5. Garage model images are not proven accurate paint/color images. A verified livery catalog requires per-vehicle legal media and manual review. No false recoloring.
6. Full site QA in Cloudflare after deployment: actual map tiles, overlays/zoom, mobile menus, account-free persistence, source fetches, map-page CSS, copyright notices, and route correctness.

## Differentiator: Atlas Dispatch

Not "another site with today's Gun Van": a private, actionable, *your own progress* workflow that points to the next collectible, garage and heist preparation. Future extension: a real "Next Missing Location" API built from verified in-game coordinates and data provenance, without a server dependency.
