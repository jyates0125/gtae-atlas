# Atlas 30.3 — Thirteen destination directory and phone/desktop acceptance

**Date:** 2026-11-22. **Status:** draft staging; exact-head browser proof pending.

The existing Elario All 13 Maps directory uses four featured destinations (GTA V Story, GTA Online, GTA VI Leonida, Cayo Perico) and nine additional worlds or episodes (GTA IV, San Andreas, Vice City, GTA III, VCS, LCS, Chinatown Wars, TLAD and TBOGT). This is a thirteen-destination routing and UX acceptance milestone, **not** a claim that all map locations or road navigation data are complete.

## Contract
- All 13 links must reference built, same-origin HTML destinations, map to unique canonical game IDs, and preserve GTA V Story/Online and VI isolation.
- The seven classic editions must route through map-hub.html?game=ID with their own notebook progress namespace; no alias may send a player into a different game.
- Map-capable flagship pages must display the matching world selector and interactive map surface; Cayo retains its dedicated heist and original map layers. GTA IV, San Andreas and classic notebooks must expose their actual existing workspaces.
- Return to the All 13 Maps directory must remain available on every destination at both phone and desktop widths. The directory's last-visited link only returns allowlisted known destinations.
- World search, Reset, four/nine split, existing original Elario artwork and frank provisional source labels must not regress. No unverified coordinate assertions, image scraping or licensing guesses are part of this test.

## Focused checks
- scripts/test_atlas303_thirteen_worlds.py checks the source world roster, unique paths, classic edition query selection, cited/provisional map descriptions and JavaScript syntax.
- scripts/test_atlas303_thirteen_worlds_browser.py exercises the Cloudflare-built site under Chromium at **390px and 1440px**: all thirteen paths, four/nine rendered directory cards, one-world search, Reset, Back and last-world resume, world-specific map/episode view, return link and horizontal-overflow checks.
- .github/workflows/atlas303-thirteen-worlds.yml runs only this world-directory acceptance suite. No routine Cayo gameplay, character gallery, Garage/Forge or all-release Edge/ZIP matrix.

**Release hold:** Passing this narrows the navigation acceptance gap but cannot certify complete licensed map content, 3D, accurate collectible coordinates, source data, real iPhone Safari, owner visual approval or deployed Cloudflare cache. Final frozen-head validation and release owner approval remain required.
