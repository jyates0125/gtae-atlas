# Team Jura / Elario Studios — Site Completion Contract
Updated: November 17, 2026 · Scope: the user's approved designed-brand experience, not a competing site's design

## Approved design, source and release rules
- Visual hierarchy: **Elario Studios → Team Jura → Atlas**. Original cinematic violet/amber design, approved original artwork, accessibility, 4 featured maps plus 9 others, **Many Crews. One Vision.**
- Keep **GTA V Story**, **GTA Online**, **GTA VI Research**, and **Classic GTA** distinct. A combined database results grid is **opt-in only**.
- **Never infer license from public visibility.** Rockstar's published copyrighted-material policy generally permits occasional non-commercial, non-spoiler fan use, at its discretion; it is not a blanket commercial image or game-mesh license. Use only Rockstar official public promo media consistent with that policy, or third-party assets with documented permission/license, or original Team Jura artwork. Third-party licenses must be checked per asset.
- GTA VI release is listed by Rockstar for Nov 19, 2026 as of this document; leaked / pre-release footage is excluded. Research stays explicitly labeled. Official screenshot visibility ≠ official model/specification confirmation.
- Do not claim exact in-game 3D meshes unless authorized, matched mesh data exists. Our WebGL concept is **illustrative**. A real-world look-alike is not an in-game technical specification.
- GTA V Story collectible pins are not GTA Online event pins. Do not import competitor proprietary coordinates or map art without permission. The map engine and 3,425 research records must not be mutated in catalog/design PRs.
- Keep existing guest saves, progress, ownership, garage placements and completed collection states intact; never overwrite or rename their storage keys without a verified migration.

## Shipped world-first behavior in this pass
- [x] Game selector across Atlas Database, Characters, Animals, Collectibles, with Story / Online / VI / Classics / optional All.
- [x] Focused initial state: Universe Database = Online Vehicles; Characters = Story; Animals = VI Research; Collectibles = Story.
- [x] Category gateways for Vehicles, Weapons, Characters, Animals, Collectibles, My Garage.
- [x] Game+kind+search URL state shareable and restorable.
- [x] Conservative car type labeling: recognizable helicopters, planes, boats, bikes, trucks, SUVs, supers, sports, muscle and emergency; otherwise **Unclassified vehicle**, not guessed.
- [x] GTA VI research vehicles no longer display GTA V source photos as VI renders. Preserve provisional labels; use original non-exact representation until item-specific permission and identity are confirmed.
- [ ] Real device and reference-pack pixel inspection after passing CI and preview deployment.

## Page-by-page completion targets
| Priority | Page | Required experience | Gate |
|---|---|---|---|
| 1 | `atlas-database.html` | Focused world+category, global search, shareable filters, comparison, no cross-world mixed default | Implemented; browser QA pending |
| 2 | `atlas-characters.html` | Individual profiles, game isolation, approved portrait where authorized, evidence labels | Partly implemented; image audit outstanding |
| 3 | `atlas-animals.html` | World-specific wildlife, exact species/habitat tags, GTA VI-only research art | Partly implemented; wildlife media audit outstanding |
| 4 | `atlas-collectibles.html` | Collection artwork, total & scope, guide/map/details, no invented coordinates | Partly implemented; individual pin audit outstanding |
| 5 | `atlas90-vehicles5.html` | Class filter, readable pictured cards, exact known specs, compare, garage link | Existing; model/spec provenance audit outstanding |
| 6 | `atlas90-vehicles6.html` | VI research-only visuals and provisional identities; no V photos falsely labeled VI | Existing; media audit outstanding |
| 7 | `atlas90-weapons.html` | Pictured weapons, game-class filters and source-checked specs | Existing; missing item imagery audit outstanding |
| 8 | `atlas93-garage.html` | Premium owned-collection layout, categorized bays, saved notes, safe import/export | Existing; visual layout refinement outstanding |
| 9 | `atlas-vehicle-configurator.html` | Original non-exact WebGL prototype, preview, paint/zoom/save/export, separated from owned records | Existing; licensed model-specific meshes unavailable |
| 10 | `atlas81-hq.html` | Clear collectible entry points and progress, not mixed with Story/Online incorrect scope | Existing; cross-page navigation audit |
| 11 | `atlas.html` / `atlas-online.html` / `atlas-vi.html` | Preserve working 2D maps; sources and scope, no speculative pins marked verified | Hold: map rendering separately tested |
| 12 | `atlas-sa.html` | Flat SA map, indexed collection slots, only separately verified or player-added pins | Existing; sourced location-pack research outstanding |
| 13 | `atlas-iv.html` / `atlas-cayo.html` | Provenance and calibrated-vs-schematic overlays visibly labeled | Existing; source audit outstanding |
| 14 | `map-hub.html` | VC/III/VCS/LCS/CTW/TLAD/TBOGT personal map notebook and clear scope | Existing reference gateways; standalone art review |
| 15 | `maps.html` | All 13 accurate artwork covers, working links and type/coverage badges | Existing 13 references; cover audit pending |
| 16 | `index.html` / `atlas97-journey.html` | Four featured worlds, accessible discoverability, revised database, newsroom & cheats links | Existing; navigation finish |
| 17 | `atlas-research.html` / `atlas98-landmarks.html` | 3,425 provisional GTA VI research records, source credits and status | Existing; do not change in this pass |
| 18 | **New:** `atlas-cheats.html` | Source-checked offline single-player cheat quick reference; no GTA Online exploits; VI awaiting verification | Planned |
| 19 | **New:** `atlas-news.html` | Dated links to official Rockstar Newswire/patch notes, no invented live updates | Planned |
| 20 | **New:** `atlas-stats.html` | Clearly sourced, timestamped public stats only; no fake live Steam numbers | Planned |
| 21 | `one-last-ride.html` / `team-jura.html` / `elario.html` | Approved original stories/art; family/studio sections segmented from mature games | Existing; separate creative review |
| 22 | `atlas-credits.html` / `atlas-verification.html` | Media permission log, source attribution, correction procedure and uncertainty | Existing; per-asset audit outstanding |

## Exact category and filter system
- **Vehicles**: game, model/name, available documented class (Helicopters, Planes & Aircraft, Boats & Watercraft, Motorcycles, Trucks & Utility, SUVs & Off-Road, Super, Sports & Coupes, Muscle, Emergency & Military, Unclassified vehicle), manufacturer *when confirmed*, game-verified features. Do not derive door count, 0–60 acceleration, top speed or real-life performance from a model name.
- **Weapons**: game, family (Melee, Throwables, Heavy, Sniper, Shotgun, Rifle, SMG/MG, Pistol, Other), manufacturer *if sourced*, ammo/damage *only if sourced*.
- **Animals**: game, species, broad habitat, sources; VI species and depicted environment are not asserted to be exact spawns.
- **Characters**: game, role, faction *where verified*, individual detail profiles and photo provenance.
- **Collectibles**: game, collection, count, occurrence/cycle, source-checked map/guide links, individual completion.
- **Garage**: garage bay, owned vehicle, user-supplied notes and concept paint, locally saved; never write to Rockstar account.
- **Legacy**: keep the original release-era aesthetic while making search, labels and buttons modern.

## Media badges (match evidence)
- **Official Rockstar media**: source URL to official site, rightsholder credit; no assumption of commercial licensing.
- **Licensed third-party reference**: source URL, rights/license, attribution, original game and source date.
- **Community reference**: identifiable reference/photo, not official proof of model or gameplay.
- **Unverified GTA VI**: no invented confirmation; if an image is a concept, label **Not exact representation**.
- **Original Team Jura illustration**: credited original art, not a Rockstar asset.
- **Placeholder / missing image**: obvious fallback, no fabricated statistics.
- Avoid stacked badges repeating status; show one primary confidence label and put detailed attribution in record details.

## Map directory cover list — existing referenced files, not verified reuse rights for external replacements
| # | Map ID | Current local cover file (under `art/`) | Target visual |
|---|---|---|---|
| 1 | Story | `atlas93-los-santos.svg` | LS & Blaine County official media if permitted / original |
| 2 | Online | `atlas93-gta-online.svg` | Official Online update media if permitted / original |
| 3 | VI | `atlas93-leonida.svg` | Public official VI launch-gallery media if permitted / original |
| 4 | Cayo | `atlas93-cayo.svg` | Official Cayo promo or original schematic |
| 5 | IV | `atlas93-liberty.svg` | Official GTA IV art or original gritty skyline |
| 6 | San Andreas | `atlas93-sa.svg` | Original early-1990s style / official art if permitted |
| 7 | Vice City | `sunset.svg` | Original retro-neon waterfront |
| 8 | GTA III | `oldcity.svg` | Original early-2000s Liberty |
| 9 | Vice City Stories | `vice.svg` | Original 1984 Vice City |
| 10 | Liberty City Stories | `liberty.svg` | Original 1998 Liberty |
| 11 | Chinatown Wars | `chin.svg` | Original illustrated handheld-era |
| 12 | The Lost and Damned | `biker.svg` | Original biker-episode |
| 13 | The Ballad of Gay Tony | `nightlife.svg` | Original Liberty nightlife |

The existing 13 local images are already referenced by `atlas98-worlds.js`. Replace only after an actual media suitability and permission review; do not blank a working card while awaiting a new asset.

## External references / policy checks
- Official Rockstar GTA VI public gallery: https://www.rockstargames.com/VI
- Rockstar policy on copyrighted game material: https://support.rockstargames.com/articles/7bNaeoMFTV0iUDGhStTXvz/policy-on-posting-copyrighted-rockstar-games-material
- GTADB source discussion: https://gtadb.net/sources-methodology/
- GTA V archive image origin: https://github.com/Stuyk/gtav-image-archive (public CDN is not itself proof of unrestricted relicensing).
- No ads, donations or monetization on game-IP media without a separate legal review; rightsholders can take down material.

## Release gates
1. Sources identified, fields labeled, and original storage keys preserved.
2. Static regression and real desktop/mobile Chromium + Edge tests pass.
3. Cloudflare preview verified. The CI deployment preview is **not** the live public deployment.
4. Branch comparison confirms no map-engine changes on database PRs.
5. Merge only to `development`, then check live URL. Record unfinished source/art issues instead of declaring completion.
