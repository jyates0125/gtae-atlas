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

### Nov 27 reconciliation
Stack parent 24d564c3993ccabb43e21dcafcee83a635e089e5 reconciled into f0a151ab4357feb27b963f5893d6b0101382f7f7. The shared event script is byte-identical; the child HTML already includes the parent cache version. Unique parent tests retained. Added SVG-versus-canvas path geometry assertions for 14 glyphs, seven distinct daily symbols, and real browser Gun Van legend/selected icon parity. No new assets or runtime change. Exact-head CI pending; parent #267 still requires passing activity/artwork checks before integration. Production unchanged.

### Fresh-visitor daily default — Nov 27
Previous candidate rendered zero pins before the first layer selection even with a validated current feed. Fresh Online visitors now see only dated, eligible mainland activity markers; prior explicit layer arrays (including Hide all) remain untouched. First explicit layer edit materializes the currently eligible event categories, then saves the player's choice; Today remains a temporary view. Corrected advanced named-layer enabled count to match actual selections. No feed, source coordinates, Story/VI layout or save-key changes; existing browser regression extended with real first-load count, toggle state, explicit empty reload and expired fixture. Exact-head validation pending. Roll back isolated commit if needed.

Source review before CI identified that the asynchronous reviewed feed refresh did not update the pin toolbar state. Factored the existing visibility logic into updatePinButton and call it after legend rendering in both normal render and feed refresh. No extra full-map rerender; retained browser assertion that the fresh dated fixture turns the Pins button on and expired feed off. Cache version 4734. This is a diagnosed dependency correction, not a claim of a passed browser run.

### Directions and cross-browser acceptance
Retargeted #286 to development after tested #267 and #287 were merged. Their four disjoint armory paths are retained; no code replay. Added real keyboard selection (ambiguous query cannot silently choose a destination), empty dropdown browse, three-stop selection, direct-line disclosure, reverse and clear tests using isolated QA-only records. Existing focused map browser test now runs Chromium and Edge at 390/1440 px; no test removed. Live browser not independently accessible. Production reader at 4de7bcfe executed against saved feed blob 3e691ae5: 22/22 matched (six categories, 19 catalog extensions accepted, no Story leakage, zero expired groups). Mock network and narrow plain-HTTPS URL adapter because tool runtime lacks standard URL; no live verification or source-rights expansion. New exact-head results pending.

### Retargeted integration validation repair
Exact a37a4a1 logs: single-point elevation and route/release jobs 140537002112 and 140537001218 passed their functional core assertions but failed the old exact V/Online cache literal 47302; updated to 4734 while keeping VI 4722 and every terrain, source and save-key assertion. Actual-texture job 140537000949 failed the obsolete always-visible HQ link expectation on compact mobile V/Online. Verify deliberate hidden fallback, visible in-bounds canonical menu, searchable Home and Escape on those two mobile routes; preserve original HQ/menu geometry assertion on desktop and VI, and all actual pinned texture/terrain tests. No runtime/asset changes or reduced VI acceptance. New candidate requires exact CI.
