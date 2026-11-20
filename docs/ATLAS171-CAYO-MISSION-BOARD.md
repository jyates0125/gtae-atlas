# Atlas 17.1 · Cayo Perico acceptance workspace (STAGING ONLY)

Owner brief: finish the Cayo heist page as a pilot for the other 14 heists. Do not copy a new generic design across all heists until the owner inspects this staging page.

## Added
- Dedicated Cayo board with 8 infiltration choices, 6 compound entrance choices, 4 escape choices, and source-qualified intel/loot reminders.
- Per-location Show on map actions reuse the same map+pin+route viewport rather than launching a competing duplicate map.
- Personal finale selections for approach, island infiltration, compound entry, escape, target, crew, and notes; saved under NEW key `teamjura-cayo-mission-v1`.
- Compatibility guidance and 3 clearly illustrative route templates. The templates reuse the existing stored POI route system and never infer actual navigable map geometry.
- JSON export/reset and keyboard-operable location tabs; mobile compact responsive layout.
- The existing cinematic original cover, Elario world map, existing source-linked guide, regional fallback, and all existing progress/local storage keys are preserved.

## Evidence and limitations
Sources: [Rockstar Cayo page](https://www.rockstargames.com/gta-online/heists/cayo-perico-heist); [Rockstar gameplay guidance](https://www.rockstargames.com/newswire/article/51974aa3aa1427/the-cayo-perico-heist-tips-and-tricks); [GTABase Cayo finale](https://www.gtabase.com/gta-online/jobs/heists/the-cayo-perico-heist); [GTA Wiki Gather Intel](https://gta.wiki/w/Heist_Prep:_Gather_Intel).
Official game-map screenshot is externally loaded from the previously used GTA Wiki origin, with original enhanced local raster fallback. Rights remain conditional on applicable fan-content policy; no inferred third-party tile reuse or relicensing.
The current Cayo island pin placements remain approximate display coordinates. Mission variable spawns, rotating target/loot, guards and daily chests are **not verified current positions**. Route plans are player-selected order only. The 2026 figures on community pages were not imported; use current gameplay for payouts and event availability.

## Gate
Run `node --check atlas171-cayo-board.js`, `python scripts/test_atlas171_cayo_board.py`, existing heist/static regressions, Chromium and Edge desktop+mobile, Cloudflare preview and approved artwork comparison. No merge to `development` without renewed owner approval of the current staging page. Never merge `main`.
