# Atlas 15.2 — live comparator benchmark and prioritized gap register
**Date:** 2026-11-19 (America/Chicago) · **Status:** owner-review staging only; NOT verified full parity · **Release:** HOLD pending approved premium art and preview.

## Authority and method
Follow `docs/TEAM-JURA-STANDING-CHARTER.md` and the approved art reference pack. Compare competitor *functionality*, not copy their layouts/code/data. A live public site listing is not a reusable data license. A link/description below records a feature to investigate, not proof that Atlas implements it. Test behavior in both Chromium and Edge at phone/desktop before checking a row.

**Benchmarks checked:** 
- GTADB Online: https://gtadb.net/gta-online-map/interactive/ — filtering, distinct category groups, current/possible locations.
- GTADB GTA V Story: https://gtadb.net/gta-5-map/ — collectible tracking, layer options, Story scope.
- GTAWeb: https://gtaweb.eu/gtao-map — multi-category reference, compare dynamic/rotation controls and map types in-browser.
- GTAMap.io directory: https://gtamap.io/gta-maps/ — classic-map coverage and per-game trackers.
- GTAMap.io GTA V and Online: https://gtamap.io/gta-5-interactive-map/ , https://gtamap.io/gta-online-map/ — source-aware base layer, routing, multi-waypoint, find/hide completed.
- GTAMap.io Vice City: https://gtamap.io/gta-vice-city-map/ — X/Y shown for that site's calibrated, specific map; transforms are not portable to other art.
- GTAMap.io Vice City Stories: https://gtamap.io/gta-vice-city-stories-map/ — documented alignment using anchors on its own image; not automatically Atlas-certified.
- Official policy and primary game data: https://support.rockstargames.com/articles/7bNaeoMFTV0iUDGhStTXvz/policy-on-posting-copyrighted-rockstar-games-material , https://www.rockstargames.com/VI .
- GTADB marker source / CC BY 4.0 requires original attribution and per-asset license discipline; official game media is not automatically open-license content.

## Honest feature parity matrix
| Priority | Area | Atlas existing evidence from staged PR #68 / completion contract | Comparator expectation | Gap / gate | Status |
|---|---|---|---|---|---|
| P0 | Premium art / maps | 13 locally bundled covers; 4 featured concept SVGs introduced in 14.8 | Era-specific premium game / cinematic pages | Owner rejected generic SVG skyline regression; 13 individually assessed premium covers and in-page support still required | **BLOCKED—owner rejection** |
| P0 | Responsive controls | Navigation and mobile map entry worked in automated smoke | Clear map unobstructed at 390px | Owner-provided screenshots show duplicate fixed nav, overlapping CTAs and obscured content; inspect screenshots and verify fix | **BLOCKED pending real mobile visual** |
| P0 | GTA V Story | Separate interactive explorer, category/search, route and progress | GTADB/GTAMap.io item-specific collectibles and multiple accurate base modes | Audit all categories, actual individual pin provenance, route accuracy, browser render | Partial |
| P0 | GTA Online | Separate Online map, category feeds and optional dated activity status | Source-dated current Gun Van, Street Dealers and seasonal/offline classifications | Shipped rotation feed has zero current items per stage report; cannot claim live current locations | Partial |
| P0 | GTA VI Research | Multiple provisional community views, source-labeled records; official poster viewer | Official-map access, research layers, categories and correct evidence | Official vs community layers must remain distinct; provisional accuracy and right-edge collage / mobile viewport review | Partial |
| P0 | Cayo and heists | Cayo schematic, 15 illustrated distinct planners in staged checks | Heist-specific routes, scope entries, setups and objectives | Each operation needs source-backed locations, its own art and map/workspace; not an unrelated V redirect | Partial |
| P0 | Classics / 13 world directory | 13 destinations; 7 classic individual notebooks; Atlas 15.0 personal normalized-image pin placement | Per-world correct map images, mapped collectible counts and game-coordinate X/Y when validated | User-added locations are not independently verified fixed pin data; image-specific transform/edition/calibration remains missing | Partial |
| P1 | Collectibles | 20 sets, set-linked tracking and some positioned pins; 150 approximate SA points | All individual collectible points, hide complete and optimized routes | GTA III, VC, VCS, LCS, CTW etc require per-image sourced pins and category coverage; SA tags/jumps missing | Partial |
| P1 | Authentic 2D / 3D | Current interactive layers; official poster + flat/Research coverage | Source-cleared native basemap, progressive zoom, selective true 3D where geometry exists | Source licenses, true meshes and per-world coordinate transforms not universally available | Partial |
| P1 | Database and galleries | Searchable vehicle and research catalog; class/sort filters, concept configurator | Item photo/spec identity, filters, side-by-side comparison, source links | Model/spec/photo provenance incomplete; no fake performance or GTA V photo as VI official | Partial |
| P1 | My Garage | Local-owned records, display/notes and backup | Detailed ownership, appropriate classes and contextual models | Mobile bay and vehicle/boat/aircraft presentation, provenance and migration QA | Partial |
| P1 | Progress & accounts | Guest-first local progress and explicit transfers with conflict handling in stage | Persistent secure optional account or local-first backups | Real-device OAuth/security not accepted; no HTTP login or auto-cloud sync | Partial |
| P1 | Accessibility / sharing | Keyboard nav, sharing and mobile nav QA in stage | Screen-reader labels, no obscured controls, reliable deep links | Keyboard/phone visual and practical tap targets need acceptance checks | Partial |
| P2 | One Last Ride / studio | Dedicated tribute and brand pages | Distinct story media; community-first tone | Film production is a separate deliverable, not evidence website parity | Separate work |

### Execution order
1. Restore/generate **cinematic subject-specific, locally bundled** art for four flagship worlds, all nine additional maps, heists and each top-level tool; compare real 390/1440 screenshots with approved reference. Never approve shared generic placeholders.
2. Remove fixed mobile navigation overlap without deleting meaningful controls; keep anchors/tap areas accessible.
3. Re-run source audits, static/provenance and browser smoke, map/route/collection progress and account data safety.
4. Audit per-world source/map/data coverage against competitor matrix; record license, coordinate edition, evidence and a user-visible verified/provisional/guide-only status.
5. Produce a staged Cloudflare URL, screenshots of actual rendered pages and precise remaining gaps for owner inspection. **Only after explicit new owner approval may a single merge into `development` be considered.** `main` stays untouched.

## Artwork acceptance record (must be filled before review)
For each of the following, record `source path; provenance; screenshot URL; quality reviewed; owner response`:
Story · Online · VI/Leonida · Cayo · IV · San Andreas · Vice City · GTA III · Vice City Stories · Liberty City Stories · Chinatown Wars · The Lost and Damned · The Ballad of Gay Tony.
Also audit: every heist's title-specific hero/detail art, vehicle/boat/aircraft/weapon galleries, research, wildlife, character profiles, collectible collections, route tools, My Garage, Atlas HQ, Studio and tribute.

## Release verdict
**NOT READY FOR LIVE MERGE.** A successful CI run proves specific source, browser and packaging tests, not that the approved visuals are present or that all competitor features are implemented. Owner's approval of the actual staged preview is required.
