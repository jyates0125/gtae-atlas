# Atlas 36.7 — GTA V Story / Online / Leonida map artwork recovery

November 23, 2026. Source PR for draft staging; NOT an approved live site release.

## Problem and implementation
The existing CC BY 4.0 GTADB GitHub tile renderer retains an `error`
entry in its in-memory `tileStore` after exhausting repository fallback
hosts. Once a connection returned, revisiting the same world/style could
still show the failed placeholders indefinitely because the tile entry
was cached as `error`. Refreshing the entire site or changing styles was
an unreliable workaround, especially on iPhone.

Atlas 36.7 keeps the working map canvas, camera, search, pinned locations
and local checklist data untouched. A single small 44px-accessible
**Retry artwork** button appears *only when the currently selected map
style reports failed image tiles*. It is grouped inside the existing
map health status (not a new permanent floating legend or source badge).
On click, remove only failed in-memory image requests for the current GTA
world; retain healthy, pending, and other-world tiles. Redraw loads visible
tiles through the existing GTADB source GitHub mirror and immutable pinned
fallback. A browser `online` transition makes the same recovery attempt
without reloading the page. No new network host, user-data upload,
third-party API scrape, GTADB data refresh, or saved progress mutation.

The status text remains in a separate `tileHealthText` span so updates
do not destroy the actual interactive Retry button. The button hides
after successful recovery. On an ongoing outage or truly absent image,
the source fail-safe remains visible; no false completeness is claimed.
Existing compact GTADB CC BY 4.0 footer and Sources & changes links
are unchanged.

## Evidence
- `scripts/test_atlas367_tile_recovery.cjs`: cache isolation for
  successful/pending/failed tiles and game separation; three HTML pages
  and original source links.
- `scripts/test_atlas367_map_recovery_browser.py`: actual built-site
  Chromium 390px and 1440px × GTA V Story, GTA Online and GTA VI;
  intercepts tile URLs with a 404 then responds with a synthetic valid
  image; checks manually triggered and reconnect-triggered recovery,
  unchanged guest progress, no new page navigation, working map canvas
  and unchanged GTADB attribution.
- `scripts/test_atlas365_modern_map_browser.py`: existing attribution,
  navigation, mobile and three-world UX remains protected.
- No synthetic tile image is added to the repository or production bundle.
  All third-party tiles continue to originate from GTADB's published
  GitHub repository only. Their data/media CC BY 4.0 and original game
  imagery rightsholder notices are already recorded in credits.

## Verified upstream record freshness
GTADB's current `rolux/gtadb.org` main commit at inspection was
`d406fea099e1df2bce42fd6b87eed04bce646629` (Nov 19, 2026).
We compared its `map/data/6/landmarks.json` with Atlas'
`data/gtadb-6.json` and found zero additions, changes or deletions:
3,754 indexed records, 3,663 positioned, 91 search-only. Therefore,
there is no unreviewed landmark delta to import in this batch. This
does NOT certify each coordinate against GTA VI gameplay.

## Release hold
The full distributable GTA VI elevation grid remains unavailable in
Atlas; 3D readiness from 36.6 is already staged. Map recovery is not
elevation installation. Preserve exact-head Chromium/Edge/ZIP, the
physical iPhone Safari and owner design approval before any public
development/main promotion.
