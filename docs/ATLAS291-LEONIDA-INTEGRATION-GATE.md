# Atlas 29.1 · GTA VI dual-map integration — staged acceptance contract

**Date:** November 22, 2026 · **Target:** GTAE / Cloudflare development after exact-head review · **State:** staging, not live.

## Design: one map experience, two honest coordinate systems

| Workspace | Background | Records and pins | Current trust statement |
| --- | --- | --- | --- |
| GTA VI Scaly / YANIS v18 | Existing licensed GTADB community layer | Existing pinned community XY, routes and progress unchanged | Existing, functioning first-visit default; game positions provisional |
| GTA VI Day · in-game | New GTADB `maps/tiles/6/day` seven-level image pyramid | Same separately source-labeled community landmarks, with placement NOT declared confirmed | **Opt-in** map choice until their positions are gameplay-aligned |
| GTA VI complete source index | Existing local `data/gtadb-6.json` | 3,754 source entries; 3,663 provisional XY; 91 searchable without valid XY | CC BY 4.0 contributor material; not all official gameplay objectives |
| Rockstar official Leonida poster | User-opened Rockstar ZIP/image; browser-local image, no CDN mirror | Independent *visitor-selected* normalized image-relative markers, matched to source IDs | Map art is Rockstar's; manually positioned visitor pins are not official coordinates |
| GTA V Story / GTA Online | Their existing five map sources | Their independent pins, save, gameplay and menus | NO Day layer, poster notebook or data migration |

## Seamless interaction

The VI sidebar index supplies a link for **each** source ID: `atlas-vi.html?view=rockstar&landmark=L[number]`. The official poster opens via existing view controls or saved private image. After load, the notebook filters and selects that source ID; **no automatic poster pin is created**. The visitor taps the correct spot and saves a personal marker. A different poster file SHA-256 never inherits incorrect placements. Show/hide, relocate, cancel/Escape, merge/export work without login, upload, location tracking or changes to the global GTA save namespace.

Desktop opens an optional adjacent research column beside the poster. Narrow phones use a collapsed drawer beneath the map; landscape phone controls retain a visible Exit/Close. The regular Scaly map remains usable if Day source tiles or poster auto-fetch are blocked.

## Source and release evidence

- Rockstar official source: https://www.rockstargames.com/newswire/article/39akk424a9oo53/grand-theft-auto-vi-now-available and https://www.rockstargames.com/VI/media (Nov 19, 2026).
- GTADB published tiles and data: https://github.com/rolux/gtadb.org/tree/main/maps/tiles/6/day , https://github.com/rolux/gtadb.org/tree/main/map/data/6 , https://github.com/rolux/gtadb.org/blob/main/LICENSE-DATA ; license notice https://creativecommons.org/licenses/by/4.0/ . Eligible community contributions are CC BY 4.0; original Rockstar artwork is not transferred by this license.
- Precise current manifest: `data/gtadb-6-manifest.json`. November 22 upstream check shows no newer GTADB landmark blob than the pinned November 19 release revision. This does not imply all records have been checked against the final game.
- Reuse is sourced and adapted, with original Elario violet/gold UI. Attribution is not blanket rights to third-party or Rockstar art.
- Two pre-existing independent staging drafts (#92 Day + source index, #93 private poster notebook) are consolidated into this one tested integration candidate to avoid divergent `atlas-vi.html` / workflow edits. No automatic changes to those upstream drafts or permanent branches.
- CI must include `scripts/test_atlas290_vi_day.py`, `scripts/test_atlas290_vi_day_browser.py`, `scripts/test_atlas290_poster_source.py`, `scripts/test_atlas290_poster_browser.py`, `scripts/test_atlas291_dual_leonida.py`, full Chromium, Edge, site audit and ZIP. Test fixture map tiles and private PNGs are not actual public imaging verification.
- Hold for QA screenshot inspection, real publisher Day tile display, iPhone Safari and owner visual approval. Check actual Cloudflare production *deployment SHA* after any future authorized merge; GitHub CI is not Cloudflare.
- Preserve previous `development` and `main` release trees as rollback refs. No sign-in or cloud-save activation; account migration stays a later phase.

## Next substantive parity step

An automatic map projection needs **independently verified matched game and official-poster control points** and quantified transform error. Until that exists, do not auto-place community coordinates on the poster, certify 3,663 pins as collectibles, or claim a road network follows exact streets. Continue verified item-level source research, category validation, character/vehicle coverage, and native game-geometry calibration without altering working progress.
