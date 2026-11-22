# Atlas 22.2 — GTA VI Post-Launch Source & Parity Register

**Evidence reviewed:** 2026-11-21 · **Scope:** GTA VI **Story** (not GTA Online / GTA V Story) · **Launch:** 2026-11-19 · **Primary authority:** Rockstar Games (official product, Newswire, Only in Leonida, media gallery and published credits).

## Confirmed primary sources

1. [Rockstar GTA VI — Out Now](https://www.rockstargames.com/VI): released for PS5 and Xbox Series X|S, primary Jason/Lucia synopsis, links to People & Places, media, soundtrack.
2. [Rockstar Newswire release](https://www.rockstargames.com/newswire/article/39akk424a9oo53/grand-theft-auto-vi-now-available): 2026-11-19 launch announcement.
3. [Only in Leonida](https://www.rockstargames.com/VI/only-in-leonida): **eight showcased character/person/group profiles**, **six named geographic areas**. Names: Lucia Caminos, Jason Duval, Cal Hampton, Boobie Ike, Dre'Quan Priest, Real Dimez (Bae-Luxe and Roxy), Raul Bautista, Brian Heder. Regions: Vice City, Leonida Keys, Grassrivers, Port Gellhorn, Ambrosia, Mount Kalaga.
4. [Rockstar media and artwork](https://www.rockstargames.com/VI/media): printable Leonida map/cover poster; official gallery with 138 launch screenshots and launch clips; edition media specifically labels **'95 Grotti Cheetah**, **'55 Vapid Stanier**, and **Hawk & Little Morgan Revolvers**. Named promotional items do **not** prove standard-edition availability, unlock rules, map spawns, exact damage or vehicle performance.
5. [Rockstar published GTA VI credits](https://www.rockstargames.com/VI/credits): main cast credits verify performers (listed in sourced character records); credits and other site material can include spoilers. Credits are *not* a reproduction license.
6. [Rockstar launch gallery](https://www.rockstargames.com/VI/launch-gallery): new official Leonida screenshots, descriptions and source visuals.
7. [Rockstar music](https://www.rockstargames.com/VI/music): official soundtrack and radio station metadata; site visitors should play only through licensed/authorized services. Original album lists 34 tracks; official score release is listed for December 11, 2026.

## Working status by category

| GTA VI category | Evidence we can publish now | Atlas 22.2 connected user route | Still requires real verification |
| --- | --- | --- | --- |
| Interactive map | Official printable Leonida map and six named regions | `atlas-vi.html` official poster switch + separate original community research views | In-game map calibration, precise accessible coordinates, non-straight-line road routing |
| Characters | Eight promoted Rockstar profiles, relationships and credited performers | `atlas-characters.html?game=vi`, global site search, game-specific profile details | Secondary cast depth, truly recognizable rights-cleared per-person media, spoiler-aware detail pages |
| Vehicles | Two officially named edition-media cars + existing source-labeled community research | `atlas90-vehicles6.html`, `atlas-database.html?kind=vehicle&game=vi` | Comprehensive named roster, stats, prices, garages, location/availability by edition |
| Weapons | Existing seven-item local evidence library plus one official edition-media reference | `atlas90-weapons6.html`, `atlas-database.html?kind=weapon&game=vi` | All actual weapons, model-specific images, purchase/unlock methods, damage/range and map points |
| Businesses | Only Raw Records is named in official people pages | `atlas-database.html?kind=business&game=vi` | Full organization list, interactive or player-ownable mechanics, exact locations |
| Properties | Some named property relationships in Rockstar public profiles | `atlas-database.html?kind=property&game=vi` | Purchasable properties, storage rules, interiors, locations and owner modes |
| Collectibles | Legacy VI research is unverified; existing Atlas tracker separation retained | `atlas-collectibles.html?game=vi` | Full sourced in-game item lists, exact game-world and map-point calibration |
| Wildlife | Existing category research with individually labeled uncertainty | `atlas-animals.html?game=vi` | Species and habitat confirmation, spawn zones, accuracy on real game map |
| Activities | Story/game trailer context and separate research | `atlas-activities.html?mode=vi` | Gameplay event types, unlocks, rewards and event availability |
| Missions | Rockstar's official public synopsis only; avoid forced spoilers | `atlas-research.html` | In-game objective sources, mission entries, routes and opt-in spoiler pages |
| Official media/music | Rockstar's gallery, map/poster, soundtrack and published radio | `atlas-news.html`, release source hub | In-app editorial guides only; no unlicensed streaming or rebroadcast |

**Implementation:** `data/atlas222-vi-release-index.json` is the compact machine-readable release source index; `data/atlas-universe-profiles.json` holds individual source-linked records; `atlas100-universe.js` preserves verified versus unverified status **per item**, not per game. Do not substitute GTA V models for VI, assume Story equals Online, conflate an official media mention with a gameplay mechanic, or treat competitor screenshots as licensed datasets.

## Artwork and mobile rules

- Character art quality must match the cinematic Elario standard. The old six-card flat-vector gallery is replaced in Atlas 22.2 staging by a searchable source-linked record experience. Remote reference portraits that fail receive explicit **world-scene** fallback labels; they are **not** represented as verified character likenesses.
- The original nine-person cinematic concept contact sheet and 418px WebP portrait candidates were generated separately. They are not part of the GitHub staging PR or live website until an authorized binary upload, source/artist review, visual comparison and browser release checks succeed. A concept made for Claude, Tommy, CJ, Niko, Michael, Franklin, Trevor, Lucia or Jason is **fan art**, not official.
- Owners must be able to open the first page, search all character names and aliases, tap a profile, go to the proper world, close dialogs, change Story/Online/VI filters and use the map controls on 390px phones without horizontal overflow.
- Mobile/desktop Chromium and Edge exact-head checks are required. Archived PR screenshots and any screenshot shown in chat are not proof that Cloudflare has deployed an unmerged PR.

## Highest-priority next production increments

1. Replace fragile/low-resolution remotely referenced protagonist images with approved **locally controlled, individually verified rights-cleared** official images or original cinematic concepts, with image decode checks for every card; assess 390px/1440px actual renders. Do not ship generic low-detail placeholders as final.
2. Parse **Rockstar's printable released VI map** as an auxiliary source reference and calibrate one pin set at a time against checked game coordinates; clearly label exact, estimated, unpositioned and unavailable data. Preserve genuine existing interactive map and zoom/route behavior.
3. Build richer **separate VI Story collections, vehicles, weapons, businesses, properties, activity and missions** pages with item-level citations, edition/platform applicability and local player progress. Avoid implying the entire roster was discovered two days after release.
4. Add opt-in **mission spoiler and save-progress** workflows after field review, never silently reveal endings in global search.
5. Maintain the same premium original design, per-title art, no-dummy-actions policy and full test coverage across all other 12 destinations. Update `docs/ATLAS187-FULL-FEATURE-PARITY-MATRIX.md` as comparisons actually pass.

**Release gate:** PR staging, Chromium/Edge full browser QA, source/rights audit, packaged output, owner screenshot review, then a separate authorized single merge into protected `development`; synchronize `main` only on a separately approved release. The existing Cloudflare production must remain live throughout.
