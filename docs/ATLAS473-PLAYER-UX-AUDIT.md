# GTAE player-first map and navigation audit — November 27, 2026

Owner benchmark: GTAWeb.eu and GTAMap.io. Preserve game-specific maps and source rights; do not copy proprietary data, icons or routing graphs.

## Observed external behavior
- GTAMap.io Online: https://gtamap.io/gta-online-map/ — published controls include search, dedicated today's dailies, Hide all / Hide found, per-category Only, nested permanent collections, separate properties/business types and seasonal sets initially hidden. Its directions guide describes driving/walking, adding and reordering stops and distinct road/path handling. These are source descriptions, not native-device interaction tests.
- GTAWeb.eu: https://gtaweb.eu/gtao-map — public HTML exposes multi-game map navigation and account/toolkit entry. Its dynamically rendered category panel was not independently exercised here; use owner-requested opt-in behavior, not an assumed competitor default.
- GTADB: https://gtadb.net/gta-online-map/interactive/ — searchable categories, daily data and independent visibility; source and coordinate fallback, not a license for unrelated proprietary assets.

## Current audit / action
| Workspace | Problem / evidence | Work / remaining |
|---|---|---|
| GTA Online | Owner iPhone screenshots show overlapping generic symbols and four navigation rows before the map | #285 shared glyphs and routing; #286 independent opt-in layers, MIT filled symbols, direct Today/Filters; current batch remembers explicit layer choices, expands individual property categories and compacts mobile header. Browser verification pending. |
| GTA V Story | Shares map shell; broad default categories and collectible discoverability need review | Same compact mobile header; Story-specific opt-in parity remains open. Do not mix Online markers. |
| Today's activities | Existing menu deep links target the activity slot now inside collapsed details | Open both parent controls on explicit event/hash links; keep current rotation expiry and prerequisites. |
| Directions | Searchable stop selection now implemented; duplicate names cannot silently choose a destination | Test actual touch and keyboard flows, multi-stop editing; no driving/walking claim until a licensed validated road/path graph exists. |
| Home / welcome / map directory | Shared searchable directory and functional Home exist; earlier native screenshots show redundant navigation in map shell | Review all reachable routes against the unified menu and scope; current batch limits mobile shell changes to V/Online. |
| GTA IV / episodes, classic maps, local heists | Unverified in this batch | Audit independent categories, map accuracy, routes, back controls, mobile overflow and saved progress individually. Preserve working Cayo. |
| Leonida | Owner-approved map views held | No VI map or layout changes intended; verify shared dependency isolation before release. |
| Characters / vehicles / weapons / Garage | Distinct game scopes and canonical menu paths exist | Verify actual destination, filtering, return navigation, approved art and mobile usability; no new hub. |

## Acceptance
First visit: no unrelated markers, explicit categories add/remove independently, Today temporary, Hide all available without scrolling past long lists. Reload preserves explicit layer choices. Menu remains available after redundant header rows are removed, fallback navigation remains if menu fails. Test actual 390px and desktop interactions, deep links and directions. Existing production unchanged; source/syntax checks are not browser proof. Continue backlog page-by-page, then exact-candidate full release gates and owner iPhone review.
