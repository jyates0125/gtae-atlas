# Team Jura Atlas 18.5 — Cayo Perico final polish review

**Date:** November 20, 2026  
**Branch:** `feature/atlas163-postrelease-parity` → PR #70 → `development` (review only; no merge).  
**Approved design:** owner's second full Cayo desktop mockup (`IMG_2785.jpeg`); reference marker imagery (`IMG_2782.jpeg` and `IMG_2783.jpeg`).

## Finishing pass, Cayo ONLY
- Preserve the Elario violet/gold premium heist page, cinematic Cayo hero, map-first island stage, distinct 14-category legend, and independent mission drawer.
- Keep the **single** colorful original Elario SVG family for clickable map symbols AND legend. The generic `.j167-pins` and `.j180-ref-layer` visuals remain hidden. Native map artwork is preferred; local Elario road-map reconstruction is the fallback.
- Preserve all 19 published possible treasure-chest spots and the 06:00 UTC daily validity window. Yellow = possible chest, cyan = dated/calculated or personally selected. Never claim live-game verification for a calculated pair.
- Add a **Pan / Move map** control that activates the existing pointer-drag engine; mode is visible and reversible. Existing zoom, fit, fullscreen, layered filters, route planning and local save keys stay intact.
- Preserve the near-square source island geometry with CSS aspect ratio `1284 / 1262`. Keep island symbols moving with map zoom/pan instead of translating separately.
- On narrow screens, the legend collapses until `Show marker filters` is selected, bringing the playable island up directly after its hero/header. Opening it exposes all 14 real category toggles; it does not change their saved/active state.
- Tapping any colored marker or chest opens a viewport-visible details card; Escape closes it. Source status shows game map, local backup, or enhanced illustration honestly.

## QA and non-regression
- `scripts/test_atlas180_cayo_flagship.py`
- `scripts/test_atlas181_cayo_hotspots.py`
- `scripts/test_atlas184_cayo_visible_symbols.py`
- `scripts/test_atlas185_cayo_polish.py`, and `node --check atlas185-cayo-polish.js`
- `scripts/test_atlas171_browser.py` on Chromium and Edge, desktop 1440×900, mobile 390×844.
- Browser QA explicitly checks original and enhanced marker visibility, 14 legend categories, category filtering, pan on/off and touch-action, true map aspect ratio, visible details with Escape dismissal, preserved personal route and checklist, and an independently forced remote-source failure leading to the local map.

## Acceptance status and remaining limits
This artifact records implementation and acceptance gates **not a release certification**. Cloudflare preview success proves deployment, not all browser interactions. Only call browser checks passed after the relevant GitHub job reports green for the exact staging head. Underlay and screenshot-derived coordinates remain approximate, especially equipment and variable loot; do not mislabel them as verified world coordinates. The current daily pair may be calculated, not confirmed in the game. Never infer user approval of the 14 other heists from this Cayo-only pilot. Do not merge into `development` until the owner reviews and approves the exact staging preview; never merge `main`.
