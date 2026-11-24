# Atlas 36.2 — Leonida mobile map visibility, sharing and source-credit audit

Owner screenshots captured on iPhone 2026-11-23 showed that:
1. Clicking 3D could replace usable illustrated map tiles with a dark/blank surface, offering no clear reason why.
2. Share the Atlas appeared between map and sidebar content, even though the social component was appended as a footer in the DOM. Mobile shell/sidebar height and overflow did not reserve the full height of filters/results.
3. Map zoom, Pins/Find/Source bar, Expand/Brighten and status/tile badges collided, reducing tappability.
4. GTADB map credit was useful below map, but detailed attribution should have one canonical source page.

## Implementation
- GTA VI only: 3D without elevation retains the illustrated map using an expressly labeled perspective preview rather than hiding it behind an empty WebGL mesh. A visible message clearly says no elevation data is installed and provides functional Terrain options and Return to 2D buttons. Optional terrain import remains private and source-cleared. Importing a valid 1536x1748 sample grid while in preview can activate WebGL; always label as unverified.
- Preserve normal 2D canvas gestures, real 2D texture tiles, map category filters, legend, routes and guest progress.
- On phones, shell and expanded sidebar grow in document flow so universal sharing is beneath all filters/results rather than visually covering the sidebar. Universal sharing script itself is unchanged.
- Map action rows, research buttons and tile status are positioned in distinct vertical bands at phone widths. Existing map Back route, All Pages menu and zoom controls remain accessible.
- Compact map credit links to GTADB.org source, CC BY 4.0 and the Atlas source register; full upstream notices remain in atlas-credits.html.

## Focused automated acceptance
Run node scripts/build-cloudflare.cjs; python scripts/audit_published.py; python scripts/test_atlas362_vi_map_clarity_browser.py. Chromium acceptance checks 390px / 430px mobile and 1440px desktop, full sidebar vs footer geometry, tappable map tools, no-height preview, terrain options, source credit, 2D return, and screenshots.

## Release limits
Native iPhone Safari screenshots, actual 3D terrain with a rights-cleared altitude source, independent control points and production Cloudflare changes are NOT covered by this milestone. Merge only into draft integrated staging; protected main and Cloudflare development unchanged pending owner acceptance and full browser/ZIP gate.
