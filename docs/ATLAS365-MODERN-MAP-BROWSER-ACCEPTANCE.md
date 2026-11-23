# Atlas 36.5 — rendered map credit + world-switch regression

Date: November 23, 2026 · Integrated draft staging only.

This continues Atlas 36.4 without replacing the GTADB map engine, original branded art or any saved user state.

## Change
The bottom map credit now listens to the explorer's existing `jura:legend-updated` event as well as select changes, DOM option rebuilds and page-show. This makes source text update reliably when the player switches worlds **inside one explorer page** without firing a manual select event. Narrow labels keep flex-shrink space on desktops; all legal links remain visible.

## Rendered acceptance
New `scripts/test_atlas365_modern_map_browser.py` builds and serves real Cloudflare public output in offline-safe Chromium. It checks GTA V Story, GTA Online and GTA VI at 390 x 844 and 1440 x 900: all three required attribution links, only one in-map source strip, strip geometry and no control overlap/horizontal overflow, a single top-nav All Maps shortcut, initial world labels and active game, in-page switches across worlds, YANIS/Day/DUPZOR layer metadata. Running without external network intentionally exercises the local map shell and is not a tile availability test.

Focused workflow: `.github/workflows/atlas365-rendered-map-attribution.yml`. First-source node and Cloudflare published-artifact audit included; failures must be inspected before merge. Owner's actual iPhone Safari and end-to-end Chromium+Edge+ZIP release gate remain mandatory.

## Source and release truth
GTADB repo/LICENSE-DATA remain the atlas source and license of record, linked from the small strip and `atlas-credits.html`. The in-game Day art remains Rockstar intellectual property. No new elevation grid is installed; the GTA VI 3D perspective fallback is not full 3D relief. This PR does not change production `main`, `development`, any Cloudflare project, source data, account sign-in, user storage or release approvals.

## Mobile navigation nuance and legacy rule corrected
- The universal phone menu can hide the in-sidebar world buttons. Built Chromium verifies the explorer's real click handler and source-change propagation with DOM-dispatched clicks when buttons are hidden. This **does not** certify those offscreen buttons as physically tappable; iPhone Safari owner acceptance stays open.
- The former Leonida mobile rule hid every `a[data-j87-maps-link]` after universal-menu initialization. When Atlas 36.4 moved All Maps into existing top navigation, that rule concealed the new link. It now applies solely to the removed legacy floating direct-child badge. No new floating control is added.
