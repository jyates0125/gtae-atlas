# Atlas 30.2 — Always-reachable map marker exit

**Stage-only; not an approved Cloudflare deployment.** Built against draft PR #98 and the Elario Studios Standing Project Charter.

## Change
The same premium violet/gold map detail interface works in the GTA V Story, GTA Online and GTA VI Leonida explorers. A marker's information card can now contain a source image, a long description, a map address and several action buttons without pushing the only close control offscreen.

- The existing `×` remains present and has a 44 × 44 px touch target.
- A clearly labeled **Back to map** button is sticky at the top of the detail's own scrolling region. It calls the original `closeSelected` control, preserving map selection logic and returning focus to the keyboard-accessible map canvas.
- Card height is capped within portrait and short-height desktop viewports; 844×390 landscape uses a fixed, scrollable detail region so the exit is reachable without scrolling the entire map page.
- Pressing Escape from inside the detail region closes it as well. All functionality is additive; no new modal/history entries, no altered marker source data, no changed world/filter state and no user storage writes.
- The original panel, saved routes, source photos, icons, legend, camera/3D/map layer controls and approved art are preserved. Back returns to the same map and zoom instead of resetting it.

## Focused acceptance
- `scripts/test_atlas302_map_marker_exit.py`: three HTML routes, script/CSS loading, no storage/history mutations, keyboard and touch target contracts.
- `scripts/test_atlas302_map_marker_exit_browser.py`: Chromium on the *built* Cloudflare payload for all three maps at **375×667, 390×844, 844×390 and 1440×900**. Simulates long marker text and tall source imagery, verifies capped/scrollable detail, sticky exit, Back and Escape action, map focus, and unchanged saved guest progress and history.
- `.github/workflows/atlas302-map-marker-exit.yml` checks only changed map detail surfaces, and captures Leonida responsive screenshots for owner review. It does not repeat unrelated heist/Cayo testing during routine upgrades.

## Release hold
Real Safari/iPhone acceptance and approval of full premium artwork and 13-world navigation are separate. Existing final production Chromium/Edge/ZIP and license/source checks remain mandatory at a frozen release head. This is a map UX milestone, not charter completion.
