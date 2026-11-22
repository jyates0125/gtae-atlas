# Atlas 29.0 — Official Leonida Poster + Source Landmark Notebook

**Status:** staging only; not yet a live site release or an official location verification. **World:** GTA VI Story only. **Source review:** November 22, 2026.

## Source and data evidence

- Rockstar released the official flat printable Leonida map on November 19: https://www.rockstargames.com/newswire/article/39akk424a9oo53/grand-theft-auto-vi-now-available and https://www.rockstargames.com/VI/media . Atlas already offers the map through its official ZIP source or browser-local image upload. This release does NOT redistribute the official map image.
- Existing data/gtadb-6.json is a CC BY 4.0 GTADB community snapshot pinned to upstream commit d406fea099e1df2bce42fd6b87eed04bce646629 (November 19). The November 22 GitHub upstream history still listed that commit as latest for map/data/6/landmarks.json. Atlas already has 3,754 research entries, including 3,663 community-positioned and 91 search-only. See data/gtadb-6-manifest.json, atlas-credits.html, https://github.com/rolux/gtadb.org/tree/main/map/data/6 and https://creativecommons.org/licenses/by/4.0/ .
- Six official region names and eleven source-graded launch topics are indexed separately in data/atlas222-vi-release-index.json. Community XY, real-world matches and fan tags are NOT proof of placement on the exact Rockstar poster pixel.

## Atlas 29.0 implementation

1. Adds a searchable notebook using the full existing VI GTADB source pack; searchable original names, IDs and tags. No replacement map engine and no guessed automatic official-poster XY transformation.
2. Players select a reference and tap the location on their privately opened poster. The separate, pointed violet/gold Atlas marker is visibly user-positioned and clickable, with Move/Remove and Show/Hide. This is a personal note, NOT verified in-game coordinates.
3. SHA-256 of the exact locally loaded poster scopes private normalized image-relative placements to the correct version/crop. Storing only landmark IDs and the visitor's normalized positions does not upload artwork, user photos, credentials or other world's progress. Original poster IndexedDB and all existing Atlas progress remain independent.
4. Supports a 500-pin per-poster cap to protect phone performance, 30 results per visible search batch, and JSON export with SHA-verified non-destructive backup merge. Reject unknown landmark IDs, wrong-world backups, nonfinite/out-of-bounds positions, image mismatch and excessive imports.
5. If the local file, source pack or SHA-256 mechanism is unavailable, the existing standalone official map viewer remains usable. No unverified automatic projected pins or fabricated collectible positions ship.

## Quality gates and future work

- scripts/test_atlas290_poster_source.py and scripts/test_atlas290_poster_browser.py are wired into the existing Chromium/Edge release workflow. The browser test uploads two small synthetic private PNGs; no Rockstar artwork is repackaged in test fixtures.
- Require exact-head CI, validated built ZIP, browser-interaction and phone screenshot inspection, actual Safari/owner acceptance, and review of Cloudflare deployed SHA before any production merge.
- Next phase can fit a provisional game-world-to-poster transform using 3 or more INDEPENDENTLY VERIFIED common control points, documented residual error, and an opt-in user setting. Never auto-place 3,663 community points using an uncalibrated crop or claim straight-line routes follow actual roads.
- License review and upstream freshness remain separate: using attribution does not itself authorize copying a unique third-party map, and an impressive number of community records is not the same as full GTA VI confirmed collectible coverage.
