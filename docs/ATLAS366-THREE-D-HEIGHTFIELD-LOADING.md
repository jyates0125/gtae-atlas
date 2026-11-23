# Atlas 36.6 — 3D terrain loads before the viewer checks readiness

November 23, 2026. Source branch only; do not promote to public site without
full release testing and owner's approval.

## The recovered cutoff bug
The existing WebGL terrain engine already has GTADB-coordinate geometry,
camera controls, binary heightfield decoder, on-demand local file import, and
credit links. The 3D navigation button previously checked
`terrain.hasElevation()` **before** triggering its internal `loadElevation()`;
therefore a perfectly valid `elevation-6.bin` in the same Atlas deployment
could be ignored and the button could show perspective fallback indefinitely.

## Corrected sequence
1. Clicking **3D** keeps the illustrated 2D map visible and transparently
   says the local heightfield is being checked.
2. `prepareElevation('6')` reads only `./elevation-6.bin` from the Atlas site.
   It validates exact dimensions (1536x1748 Uint16 little endian = 5,369,856 bytes)
   and rejects uniform or missing payloads. No background GTADB requests or
   downloads occur, and source/user data is unchanged.
3. Successful validation gives the WebGL renderer its actual grid, then the
   navigation controller activates 3D. If WebGL cannot initialize, it retains
   the illustrated perspective preview and accurately explains why.
4. A failed or missing file retains the illustrated preview with an honest
   unavailable message. Returning to **2D**, changing worlds, or importing a
   user file cancels/supersedes stale async results, so a late request cannot
   replace a newer user-selected grid.
5. A successful local file is kept in memory when switching back to 2D and
   reused after selecting 3D again; no additional fetch. No storage keys or
   sign-in boundaries change.

## Tests
- `scripts/test_atlas366_heightfield_first.cjs`: deterministic source-only tests
  for valid file, 404, short/incorrect file, flat file, wrong game, cache reuse,
  and a real user import racing an in-flight fetch.
- `scripts/test_atlas366_heightfield_first_browser.py`: actual Chromium
  390px/1440px built-site smoke with synthetic complete binary injected
  **in memory through request interception**, never committed or distributed.
  Checks that data loads only after user presses 3D and then either WebGL
  activates or the old map remains visible with an honest WebGL message.
- Existing `scripts/test_atlas362_vi_map_clarity_browser.py` now waits for the
  asynchronous missing-file result before checking its visible fallback text.

## Source/rights boundary
GTADB README explicitly invites reuse of its published landmarks, photos and
map tiles under CC BY 4.0, with attribution to GTADB.ORG and contributors:
https://github.com/rolux/gtadb.org/blob/main/LICENSE-DATA .
Source names, license and change notes already appear in Atlas 36.4/36.5.
No new alternative source search, unlicensed asset, or source screenshot is
necessary for this loader fix. **The full Leonida binary is not present in
this Atlas repository.** This work completes the loader handoff but is not
evidence of published real GTA VI relief. Source-matched game accuracy,
native iPhone Safari, release Chromium/Edge/ZIP, Cloudflare and owner review
remain separate acceptance gates.
