# Atlas 14.5 — Map-view layout and mobile-first navigation review

**Release status:** STAGED ONLY; preserve owner's single later combined merge to `development`. Main untouched.

## Evidence reviewed

The approved screenshot capture artifact from passing GitHub run #375 (Chromium and Edge) included:

- Desktop `atlas-vi.html` at 1440×900: the custom **MAP ARTWORK · CHOOSE VIEW** selector protruded beyond the left side of the explorer instead of remaining within the sidebar. Buttons were clipped and hard to reach.
- Mobile `atlas.html` and `atlas-vi.html` at 390×844: the capture landed on the search/filter sidebar rather than exposing the interactive map at first glance. This can occur when a page fragment targets a world button during responsive layout.
- The source map tile imagery also contains research/collage material on part of the canvas. That artwork is **upstream map content**, not a second Team Jura category legend. It remains a separate upstream source/art evaluation; do not cover pins or misrepresent community reconstruction as official.

## Changes staged

1. Keep the *same existing* `atlas86-ui.js` buttons, map engine `atlas.js`, source tiles and selection/change handlers. Only reparent the **existing** element `.j86-mapviews` into `#sidebar` and override its legacy absolute positioning with a readable two-column, responsive control grid.
2. Add a clear **Open interactive map** shortcut after map guidance for all GTA V Story, GTA Online and GTA VI explorer pages. On mobile this collapses the sidebar and focuses the actual map region.
3. On a fresh mobile map visit with no user-supplied fragment or coordinate target, restore initial map-first scroll. Existing coordinate links and deep links retain their own behavior.
4. Maintain the approved violet/amber/gold palette, keyboard focus treatments, real button events, progress storage keys and distinct Story/Online/VI data contexts.

## Validation gates

- Source contract: `python scripts/test_atlas145_map_ux.py`.
- Browser QA: `scripts/browser_smoke.py` checks the VI view selector is fully inside the sidebar, world-view button count is preserved, and the mobile shortcut/first-screen map positioning exists on all three explorers.
- Build/release: existing full Chromium, Edge, static/provenance audit and validated ZIP workflow.
- **Human review required:** compare new 1440×900/390×844 screenshots to `docs/APPROVED-DESIGNED-BRAND-MASTER.png` and the approved design pack. Automated test passing is not human visual acceptance.

## Unfinished

An independently cleared official Rockstar tiled/calibrated interactive basemap, deep collectible coverage, per-world media rights review and true real-user cloud account sign-in are still pending. The existing official Rockstar poster mode is a distinct source-backed view; YANIS/DUPZOR positions remain community provisional. Do not claim parity or complete game launch data.
