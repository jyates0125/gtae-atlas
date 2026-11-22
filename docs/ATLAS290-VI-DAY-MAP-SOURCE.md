# Atlas 29.0 — GTA VI post-launch Day map source and integration

**Reviewed:** 2026-11-22 · **Status:** staged, requires browser acceptance and owner review

## Exact public source and rights

- GTADB upstream: https://github.com/rolux/gtadb.org
- Upstream tile engine: https://github.com/rolux/gtadb.org/blob/main/maps/maps.js
- Tile asset tree: https://github.com/rolux/gtadb.org/tree/main/maps/tiles/6/day
- License statement: https://github.com/rolux/gtadb.org/blob/main/LICENSE-DATA
- Rockstar retains game-art and world copyright, including the underlying map imagery. GTADB publishes eligible map/data contributions under **CC BY 4.0**; this is not a transfer of Rockstar rights.
- Existing approved Team Jura attribution: `atlas-credits.html`. Label clearly identifies the upstream GTADB map, with transformed portal presentation and our independent controls.
- Source inspected: `maps/maps.js` advertises `gta6.tileSet=day`; `tileSetRanges.day` has the exact seven rows below; `maps/tiles/6/day` contains zoom directories 0–6 and `0/0,1,1.jpg` is an independently observed file.

## Native Day tile bounds

| Zoom | Minimum X,Y | Maximum X,Y |
| ---: | :--- | :--- |
| 0 | 0, 0 | 2, 3 |
| 1 | 1, 1 | 5, 6 |
| 2 | 2, 2 | 10, 12 |
| 3 | 4, 4 | 20, 25 |
| 4 | 8, 8 | 41, 51 |
| 5 | 17, 17 | 83, 103 |
| 6 | 34, 34 | 167, 206 |

The source rendering origin is `zeroX=zeroY=16384` on a 32768-unit canvas, same convention Atlas already uses. **This is not proof that every prior YANIS or DUPZOR landmark coordinate is aligned with the released game map.** Existing community points retain provisional labels and must be checked against the new geography before claiming exact game positions. Do not import a new marker database by extrapolating the graphic.

## Implementation and regression guard

- Add `day` to GTA VI selectable base views and introduce its own z=6 tile extent; preserve V/Online layer sets, `scaly,view` (YANIS V18), YANIS archive, `dupzor,51` (Loki), Community Research and separate Rockstar official poster.
- Default new VI viewers to Day. Keep existing guest progress, favorites, pins, route IDs and GTA V/Online distinctions. No sign-in, coordinates, map downloads or unapproved art mirror.
- Existing GTADB remote map tile fetch and GitHub raw fallback only. No third-party proprietary site copy.
- Revision the map script URL and offline shell cache only; **do not delete old map tile caches or guest progress data**.
- Run new source contract (`scripts/test_atlas290_vi_day.py`) and browser (`scripts/test_atlas290_vi_day_browser.py`) alongside full release gates for Chromium and Edge, mobile/desktop.
- Browser fixture intercepts Day tiles **only inside deterministic tests**. A green fixture proves request path and UI behavior; verify real external tile display on phone and the actual Cloudflare production SHA separately.
- Cloudflare GTAE production = `development`. Old Team Jura Pages project is retained for historical redirect/export. Neither project is changed by staging this PR.

**Not finished by this change:** complete VI gameplay marker calibration, native road routing, all collectibles, exact vehicle positions and real-device Safari or owner visual signoff.
