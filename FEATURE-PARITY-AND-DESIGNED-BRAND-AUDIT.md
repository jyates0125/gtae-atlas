# Team Jura Atlas 8.1 — Designed Brand, feature parity and source-audit report

**Audit date:** November 14, 2026. **Status: functional prototype / unmerged development preview; NOT complete.**

## Source of truth and actual implementation

The approved `Team Jura Atlas Gaming Dashboard.png` is packaged in `reference/` as the visual reference. The crop `art/atlas81-approved-dashboard-crew.webp` is taken **from that approved composite screenshot**, not falsely described as a separate original painting. User-supplied screenshots show the current Passport, Heist HQ, Story/Online map, Cayo Perico, and Activity Intelligence workflows. Existing GitHub repository on `development`: `jyates0125/team-jura-atlas-preview`, inspected November 14, 2026.

The design vocabulary used: hierarchy **ELARIO STUDIOS → TEAM JURA ATLAS**, cinematic purple/orange/gold, the original Scaly/Scaly Man/Loki crew panel, bright map-and-tools navigation, heists, vehicles, collectibles and a wider GTA universe. Layout is a purposeful working adaptation, **not pixel-perfect reproduction**. The approved master remains unchanged; no existing file is overwritten by this package.

## Feature parity against the sites and current Atlas

| Feature | Reference benchmark | Existing Atlas | New Atlas 8.1 HQ | Remaining gap |
|---|---|---|---|---|
| GTA V and GTA Online separate worlds | GTADB, GTAMap.io | Working separate maps | Direct connected navigation | Modern shared visual shell on all map pages |
| GTA VI research | Community map sites | Provisional Leonida map | Prominently labeled, accessible | Cannot verify unreleased content |
| Collectible set filtering | GTADB, GTAMap.io | Set lists, anonymous slots | 20 source-labeled sets, search, modes | More collection types and definitive item records |
| Item-level completion | GTAMap.io, GTADB | Existing checklist and mapped Story tracker | 20 set-specific checklists + per-item completion | Story and Online identity reconciliation before automatic migration |
| Item identification | GTA Wiki, published location guides | Limited | 20 source-described items (6 cards, 14 figures) | Many per-item descriptions and photographs missing |
| Exact item map links | GTADB, GTAMap.io | Existing `atlas-completion.html` with source-mapped Story pins | Uses `JuraSources.load('story')` mapped record IDs to deep-link to `atlas.html?world=5&place=...` when numeric collection slot matches | Online exact pins not yet unified; remote source availability and live link tests pending |
| Hide found / hunt queue | The GTA Map, GTAMap.io | Several old tools | All/Todo/Found/Hunt queue/Identified/Notes, queue unfinished, export hunt plan | Queue-to-map optimized route for Online not integrated |
| Personal clues and backups | GTAMap.io | Old checklist exports, Passport | Per-item notes, local persistence, import/export, optional legacy checkmark import | Cloud sync / account portability not implemented |
| Mapped Story routing | GTAMap.io | Existing `atlas-completion.html` route handoff | Direct link, no replacement | Native embedded map-and-checklist split view needed |
| Heist mission workspace | Atlas own feature | 15 named heist workspaces | Consolidated mission directory | Not re-skinned end-to-end |
| Passport achievements | Atlas own feature | 11 worlds, progress | Linked, kept safe | Passport and collection progress use separate models |
| Activity intelligence | GTADB daily locations | GTA V/Online/VI conditions tracked; daily imports manual | Linked, clearly separated | No independently checked current-day rotations or automated update |
| Game map modes | GTADB | In-game/satellite/2D/3D options | Existing map pages preserved | Calibrated screenshots, performance benchmarks and unified controls pending |
| Data provenance | GTADB and open-licensed datasets | Verification and credits pages | Source links, confidence disclaimers | Collection-by-collection independent coordinate verification incomplete |
| Designed Brand artwork | Approved screenshot | Broken crew/Studio image on 8.0 screenshot | Approved character-scene crop appears in new hero | Original individual assets, exact approved layout and mobile artwork not fully reconstructed |
| Responsive UX and accessibility | Common best practice | Mixed | Grid breakpoints, labeled inputs, focus states, menu toggle, skip link | Real-device browser acceptance not performed |

## External research references (functional comparison only)

- GTADB GTA Online interactive map: https://gtadb.net/gta-online-map/interactive/ — searchable categories, current vs possible daily spawn locations, marker permalink support.
- GTADB GTA V Story map: https://gtadb.net/gta-5-map/ — collection and challenge metadata, source/provenance distinctions.
- GTAMap.io Story map: https://gtamap.io/gta-5-interactive-map/ — layered category checklist, individual map link, coordinates and hidden-found functionality.
- GTAMap.io Online map: https://gtamap.io/gta-online-map/ — route planner and checklist synchronization.
- GTA Wiki collectible types: https://gta.wiki/w/Collectibles — general counts.
- GTA Wiki source tables: https://gta.fandom.com/wiki/Playing_Cards and https://gta.fandom.com/wiki/Action_Figures — source-described item references in 8.1 evidence JSON.
- The GTA Map: https://thegtamap.com/map — show/hide collected, route optimizer and daily spawn distinction.

These links provide comparison and user navigation; third-party proprietary implementations were not copied. Data entered is separately attributed. Existing open-data licenses and artwork permissions must still be honored.

## Specific data conflicts that must not be hidden

1. Historical Team Jura `story-hidden-packages` total is **15** while GTAMap.io distinguishes **12 underwater hidden packages**. Atlas 8.1 marks the 15-set *legacy reference*, not a resolved canonical count. Reconcile scope and edition before renumbering saved checks.
2. Thirty LS Tags are **possible sites**, not thirty daily-active tags; only a subset is active on any given day. Thus a 30-slot coverage tracker is not a daily tracker.
3. Halloween Jack O'Lanterns and Snowmen have seasonal status; a persistent completed count does not establish that the event is currently active.
4. Source-guide numeric indexes can differ. Six Playing Card and fourteen Action Figure descriptions are source-specific references, **not universally verified Rockstar IDs**.
5. GTA VI locations remain pre-release community research and do not confer proof of gameplay positions.

## Tested, blocked and unfinished

**Static checks:** HTML IDs, source counts, evidence bounds, JS syntax, local asset availability, link-name audit, image open, no placeholder anchors; see `tests/qa-results.json`.

**Blocked:** Chromium `Page.goto` returned `ERR_BLOCKED_BY_ADMINISTRATOR` for both `localhost` and `file://` in this container, so browser screenshots and dynamic interactions could not be verified here. A Playwright test script is supplied in `tests/browser_qa.py` for a capable desktop environment, but its test expectations require adaptation to real network data and first-load timing. **Do not treat those interactions as passed.**

**Pending before calling finished:** live Cloudflare deployment and clicks on every section; test each map link with verified source data; measure performance on mobile and desktop; compare actual screenshots with approved reference at same viewport; image permissions and original art source recovery; complete per-item location ingestion (license-appropriate); full shared progress migration with undo/export; integration of collection queue into actual route engine; fixes for third-party maps and overloaded pin layers; automated deployment guard on missing assets; consistent brand design on all legacy pages.

## Release protection

Upload these six runtime files **only to `development`**, keeping their relative folders:

- `atlas81-hq.html`
- `atlas81-hq.css`
- `atlas81-hq.js`
- `atlas81-collections.json`
- `atlas81-evidence.json`
- `art/atlas81-approved-dashboard-crew.webp`

All other packaged files (`reference`, `tests`, markdown reports) are documentation/QA only. Existing main, Atlas 8.0 and legacy pages are not modified. Open `/atlas81-hq.html` on Cloudflare after the deploy finishes. Do not merge to main until live QA is performed.
