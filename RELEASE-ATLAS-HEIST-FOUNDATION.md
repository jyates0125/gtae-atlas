# Team Jura — Heist HQ foundation (local preview, not production release)

## Implemented and testable
- 1 Heist HQ directory and 15 dedicated heist planning pages.
- Responsive autumn/neon theme, persistent checklist via browser localStorage, checklist search, reset and JSON export.
- Reuses the existing GTA Online and Cayo map entry points; no fabricated heist markers.
- Links from four existing home/map directories. Existing map engines are unchanged.

## Not yet complete
- Exact approved screenshot styling across all existing pages; older layouts remain and require a shared component migration.
- Full game-world tiles, comprehensive category databases, mission-specific route overlays, 3D/satellite layer parity and browser/device QA.
- Animated One Last Ride film and voices. Existing 36-second preview is NOT the requested film.
- Kortz Center content is research-only until independently verified.

## Source and rights policy
- GTADB.org source code MIT, specific data CC BY 4.0 with contributor attribution; inspect each asset's own terms.
- Some GTADB.net tile origins are not separately documented. Do not assume they are licensed for reuse.
- Rockstar/Take-Two game art and logos retain their respective rights; fan/nonprofit status is not a blanket license.
- No external images, icons or datasets were copied in this package.

## Local test
Run `py -m http.server 8000` from the extracted folder, then visit `http://localhost:8000/heists.html`.
