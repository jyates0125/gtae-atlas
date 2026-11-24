# Atlas 30.6 — Map-return action for GTA IV, TLAD and TBOGT

**Draft staging only; not a public deployment.**

## Functional change
The Liberty City map is shared by GTA IV landmarks, GTA IV Flying Rats, TLAD seagulls and TBOGT seagulls while keeping each source, collection and game identity separate. A sticky, 44px minimum **Back to map** action appears only when a location is selected, beside the original ×. It calls that existing close control and returns focus and viewport to the interactive map canvas, preserving camera position, zoom, layer, saved route, bird progress and favorites. Escape from inside the detail panel does the same. There are no new maps, invented coordinates, license changes, data writes or history pushes.

## Focused acceptance
- `scripts/test_atlas306_iv_return.py` checks source, no destructive storage/history operations and keyboard/touch contracts.
- `scripts/test_atlas306_iv_return_browser.py` verifies real built-site Chromium at **375×667, 390×844, 844×390 and 1440×900** for IV, TLAD and TBOGT scope, Back/Escape/×, preserved zoom/camera, URL `scope` and stored progress and no horizontal overflow.
- `.github/workflows/atlas306-iv-return.yml` scopes only this map/detail area. It does not repeat Cayo or unrelated Garage/Forge checks.

**Release holds:** genuine native iPhone Safari acceptance, all-world art and map data/source completeness, final Chromium+Edge+ZIP gate and specific owner release approval. Native licensed in-app topological road routing and exact geometry are not claimed.
