# Atlas 18.0 · Cayo flagship approval (November 20, 2026)

## Owner-approved immutable direction
The owner approved the SECOND Team Jura Cayo screenshot mockup, re-uploaded as `IMG_2785.jpeg`, as the **master reference for Cayo and the design direction for all future heist-specific workspaces**. It is a design target, not evidence that the code already looks exactly like the image. Maintain the modern violet/amber/gold Elario brand, E crest, unique cinematic heist art, compact left mission hero and action menu, dominant authentic Cayo island map, marker legend alongside the map, and map zoom/layer/fullscreen controls. Do NOT roll back to legacy teal, oversized full-width banner plus three columns, inaccurate generic SVG placeholders, or a Cayo map with no relevant pins. All 14 other heists remain unchanged in this Cayo staging iteration until owner's inspection and explicit direction to apply the same shell.

## Implemented in staging branch PR #70
- `atlas180-cayo-flagship.js/css`: map-first desktop/phone layout that **moves/reuses** original `#j167-heist-map` and existing Cayo checklist/planner/notes elements; no old save keys were changed. The approved source image is the previously sourced game-island image through `teamJuraHeistViews.activate('original')` with Elario enhanced fallback.
- Interactive left mission menu for checklist, intel, infiltration/exits, equipment, vehicle planning and notes. The existing walkthrough, POI selection, route tools, category toggles, guest progress, JSON export and optional regional map remain in the DOM and are reused where applicable. Source status is shown.
- Original Elario marker legend, approximate game-island location overlays inspired by the owner's reference images (`IMG_2782.jpeg`, `IMG_2783.jpeg`), plus 19 separately placed treasure-chest pins (10 land, 9 underwater) using **published GTA world-space XYZ** facts. Their projection onto the game-island screenshot is **approximate and not pixel calibrated**.
- The daily 06:00 UTC snapshot `data/cayo-treasure-today.json` is dated and self-expires. The 2026-11-20 pair (#8 land, #14 underwater) is calculated from GTAMap.io's Nov 19 'Tomorrow' forecast and is prominently **marked calculated/unconfirmed**, not official proof of an in-game spawn.
- Yellow dots are possible locations; cyan starred dots mean the dated calculated or player-selected two. 'Today's two' filters to current picks; 'All 19 possible' remains a safety fallback when daily information is missing, stale or not confirmed. Players can check a current tracker and manually enter both numbers; their override resets on the next 06:00 UTC day. No public user notes are published to master data and no current Rockstar feed is falsely claimed.
- New code is Cayo scoped only. Both map sources retain truthful geometry and licensing labels. No copied GTALens/MapGenie/GTADB/GTAMap tile or icon assets.

## Data sources and rights
- Published coordinates, 19 chest positions and the dated Nov 19→Nov 20 calculated pair: https://gtamap.io/gta-online/daily/treasure-chests/
- Supporting 19 possible/2 daily semantics: https://gta.fandom.com/wiki/Treasure_Chests
- Other comparison locations: https://gtalens.com/map/cayo-treasure-chests and https://www.gtaboom.com/cayo-perico-treasure-chests-locations-25c3
- Rockstar game source: https://www.rockstargames.com/gta-online/heists/cayo-perico-heist
- Original screenshot already sourced by existing `atlas167-heist-focus.js` via GTA Wiki, artwork © Rockstar Games / Take-Two, subject to its fan-content policy; this does **not** provide an independent commercial reuse license.
- `docs/TEAM-JURA-STANDING-CHARTER.md` remains authoritative. All original heist progress keys, per-page cinematic artwork, 15 heist links and other worlds are preserved.

## Gates before owner acceptance/live
1. Pass new `scripts/test_atlas180_cayo_flagship.py`, JavaScript syntax, all existing 16.x/17.x regressions, and complete Chromium + Edge desktop/phone screenshot and interaction tests.
2. Inspect `heist-cayo-perico.html` at ~390px and 1440px, including full map and legend (not only the opening hero), and confirm in-game underlay actually loaded or a clearly labeled enhanced fallback.
3. Distinguish **staging deployed** from **release approved**. Owner must inspect the newly deployed exact head and explicitly approve a merge into Cloudflare-connected `development`. Protected `main` must not be touched.
4. Keep open gaps listed: independent pixel registration/calibration of map screenshot, validation of extra equipment-reference zones against gameplay, automatic licensed daily-feed ingestion, full iPhone Safari QA, 14 other heists not yet converted.
