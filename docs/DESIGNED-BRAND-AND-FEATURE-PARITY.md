# Team Jura Atlas 8.5 — Designed Brand and feature-parity audit
Date: November 14, 2026. Development branch, **not deployed or merged**.

## Authoritative visual reference
`Team Jura Atlas Gaming Dashboard.png` from the original user-approved reference material. Hierarchy: **Elario Studios → Team Jura → Atlas**. Cinematic orange-purple-gold, glossy icon-labeled sidebar, clear map-centric working area, Loki and Scaly illustrated artwork, game selector, tiles for Heists/Vehicles/Collectibles/Routes, seasonal events, community and progress panels. **Other GTA map websites are UX/data references, not our brand master.**

### What this package implements
- Original Team Jura collection symbols for 20 existing Story/Online collection categories, mapped source pins (where imported) and sidebar labels. Emoji glyphs are original UI labels using the visitor's system font; not scraped GTAWeb icon files.
- Source-level completion updates Atlas map state, Atlas 8.1 HQ progress, checklist and existing route records; guided hunt drops completed stops, reorders unfinished route with existing planner, invalidates stale drawn navigation plans and clears completed selected pins under Hide Found.
- Atlas 8.3 sidebar checkbox updates native map directly when engine 8.5 API exists, without a reload. Start Guided Hunt invokes existing planner for the current mapped category.
- One persistent, accessible Atlas navigation bar with **Atlas HQ**, dedicated GTA V Story, GTA Online, GTA VI research, San Andreas links.
- New GTA San Andreas **collection workspace** tracks **320 records/slots** in 5 categories: 100 graffiti tags, 50 snapshots, 50 horseshoes, 50 oysters and 70 optional jumps. Filters, notes, browser-local progress, JSON export/merge, pan/zoom and optional *user-supplied* map image / validated image-pixel location pack.
- The San Andreas page does **not** invent location coordinates. Without an authorized basemap/location pack it operates as a tracker and links to an independently sourced interactive San Andreas map.
- A conservative road-graph structure and provenance validator. Do not enable driving directions without measured, world-compatible road graph data.

## Feature comparison
| Feature | Existing Atlas 8.3 | Atlas 8.5 package | External UX benchmark | Status |
|---|---|---|---|---|
| Collection/category choice inside map | Yes | Kept with per-set original symbols | GTAWeb, GTADB | Code complete, live QA pending |
| Category symbols drawn on physical map pins | Generic glyph | 20 specialized categories where mapped | GTAWeb | Engine patch syntactically tested; live QA pending |
| Clicking found hides it | Native Hide Found available, selected item still overdrawn | Selected highlight suppressed when hidden | GTADB | Code complete, live QA pending |
| Reroute after marking found | Removes route ID but leaves original order/old navigation overlay | Reorders unfinished stops and invalidates old overlay | GTA map routing tools | Code complete, live QA pending |
| Native route following streets | Only optional imported graph, always unverified | NOT falsely enabled | GTAWeb/GTAMap.io | **BLOCKED: licensed/compatible/validated GTA V graph not verified** |
| Completion sync across checklist/HQ/map | Partial | Added native map→HQ sync for matched Story IDs | GTADB | Code complete, live QA pending |
| GTA V / Online / VI distinct views | Separate URLs, mode switch still confusing | Explicit global links; mode-specific pages retained | GTAWeb | Partial, deeper layout consolidation pending |
| San Andreas map & collections | Not native | 320-item collection workspace + optional map pack; direct sourced map link | GTAWeb SA, GTADB SA | **PARTIAL: no built-in sourced pins or basemap included** |
| San Andreas individual verified map locations | None | Imported only, no invented positions | GTADB SA | Not complete |
| Save/export/import | Existing tools | Retained + SA backups | GTAWeb | SA UI built, live QA pending |
| Approved Loki and Scaly cinematic artwork | Current cropped original crew on HQ | Reuses `art/atlas81-approved-dashboard-crew.webp` as backdrop; does not overwrite it | Master design pack | Partial fidelity |
| Feature parity across ~20 old utility pages | Scattered | Unified primary links and SA addition | GTAWeb universe directory | Partial; not 20 full rebuilt pages |
| Mobile layout | Existing map CSS | Added responsive navigation, SA two→one-column | GTAWeb | CSS checked, browser test blocked |

## San Andreas verified collection totals
Collection totals confirmed by https://thegta.wiki/wiki/collectibles/ and https://gtadb.net/gta-san-andreas/map/ . Record counts are **not** proof of 320 item coordinates imported into our site.

## Maps / universes considered
GTAWeb explicitly lists GTA 1, GTA 2, GTA III, Vice City, San Andreas, Advance, Liberty City Stories, Vice City Stories, GTA IV, The Lost and Damned, The Ballad of Gay Tony, Chinatown Wars, GTA V, GTA Online, GTA VI and RDO. See https://gtaweb.eu/ . We are **not** claiming those maps are all natively implemented or licensed for reuse. Priority: V/Online/VI, San Andreas, GTA IV, then verified classic worlds as standalone datasets become available.

## Licensing and data provenance
- GTAWeb's website is a competitive functionality reference, not a source of redistribution rights for its art/tiles/complete dataset.
- `jamiemansfield/SanMap` (MIT) concerns app code; rights to underlying game imagery should be assessed independently.
- `SampStack/san-andreas-locations` is PolyForm Noncommercial and currently has 0 approved location records; **do not ship it as validated data**.
- `Leuansin/GTA-SA-Nodes-Json` covers **San Andreas**, not GTA V. Based on available evidence, full rights/format and drivable-world validation have not been established. Not imported.
- The user requested licensed materials where possible; no external copyrighted maps or complete proprietary databases have been bundled without reuse rights.

## Verification performed
1. New JavaScript `node --check` — passed for `atlas85-enhance.js` and `atlas85-sa.js`.
2. Python syntax for installer and graph validator — passed.
3. A synthetic fixture matching the inspected GitHub 8.3 source anchors was successfully patched and patched JS syntax verified. Idempotent rerun passed. **This is not yet an end-to-end test of the full actual repository.**
4. Native local Playwright Chromium tests attempted for San Andreas desktop/mobile and persistent progress — **BLOCKED** by `net::ERR_BLOCKED_BY_ADMINISTRATOR` for localhost and file URLs. Neither browser interaction nor screenshot was marked passed.
5. Read-only GitHub source inspection confirmed Atlas 8.3 installed on three map pages as of this session. Direct GitHub writes failed HTTP 403; this patch is **not deployed**.

## Remaining designed-brand discrepancies / unfinished items
- Full-scale reference screenshot has much denser cinematic UI, illustrated icon tiles, branded character art, interactive center map and community panels. This package improves architecture/icons and uses brand colors; it does **not** reproduce the full master layout pixel-for-pixel.
- Existing HQ art has original crop; several older legacy pages still use mismatched headers and different visual density.
- Neither complete GTA Online collectible positions nor complete GTA V source verified pickup positions were created by this package.
- San Andreas requires a correctly licensed/reusable map asset and a verified per-item coordinate pack for native pin parity. External sourced map available now.
- Native GTA V street graph, turn restrictions, snapped road geometry and route validation remain outstanding.
- Live Cloudflare screenshot comparison and interaction matrix must be completed after manual workflow run. No claim of completion until successful.

## Live test checklist (post deployment)
1. Test each GTA V, Online and VI URL; home links return to `/atlas81-hq.html`.
2. Story: Spaceship Parts → icon displayed on mapped pins and dropdown, Start Guided Hunt; mark one found; verify route drops it and next stop is visible; Hide Found hides selected marker; refresh retains state.
3. Unmark a pin; verify both HQ and map reflect reversal; restore state from backup.
4. Online: category icons shown in legend; unavailable source positions are labeled unmapped, not silently invented.
5. GTA VI has research status, not fabricated playable collectible markers.
6. San Andreas: switch all five categories; check count totals; mark/reload; test search, hide completed, import/export and optional local image/pack size validation.
7. Desktop and phone: visual comparison side-by-side with approved dashboard reference; record spacing/artwork/navigation differences.
8. Route: confirm existing 2D and 3D map, road-graph validator and route exports still work; never label straight-line preview driving instructions.
