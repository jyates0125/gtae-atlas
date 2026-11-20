# Atlas 16.1 · Premium design, real-function parity and release acceptance

**Audited:** 2026-11-20 · **Branch:** `feature/atlas144-consent-first-cloud-transfers` · **Target:** Cloudflare-connected `development` after explicit owner approval only · **Status:** STAGING / VISUAL HOLD.

This is a source-grounded plan, **not a claim of complete feature parity** or production readiness. Follow the Team Jura Standing Charter, approved original reference pack, Site Completion Contract and the owner-approved cinema-grade multi-screen mockups. All real UI controls must perform an accessible action; painted-on controls in a mockup are decorative and may not substitute for actual inputs.

## Verified current implementation and truthful limits

| Surface | Source-backed state | Blocker or next acceptance step |
| --- | --- | --- |
| Public entrance | Original public-preview poster, actual guest-dashboard link; optional account info; no social kit download | Compare actual phone/desktop screenshots, functional taps |
| All 13 map destinations | Four flagship cinematic WebP covers and nine different classic game-specific cinematic WebP covers; `atlas98-worlds.js` selects each | Review each card/crop/link on iPhone and desktop |
| GTA V Story and Online | Separate existing map engines, controls, categories and local progress; updated zoom/Fit UI | Confirm controls work on real iPhone; source-check actual marker completeness and Story/Online separation |
| GTA VI Leonida | Source-labelled community research views and provisional markers; tile loading recovery implemented | Reconcile new Rockstar/launch-era facts against official sources; do not treat speculation as verified game truth |
| GTA IV / San Andreas / seven classic worlds | GTA IV partial and SA tracker/map import; classic worlds have personal notebook/checklists and map-image workflows; new cinema covers and touch zoom | Calibrated built-in world coordinate systems and authoritative pins remain incomplete for several destinations |
| Heist HQ / 15 missions | Fifteen separate cinematic original local WebP covers and 15 mission pages; original checklists, progress keys and map links preserved | No fabricated heist-specific georeferenced overlays. Inspect every image, CTA and mobile layout; verify mission-specific facts |
| Characters | Approved cinematic page hero and game-era browse concepts from III through VI | Full verified character bios, portrait-by-character art and consistent per-game metadata not yet complete |
| Weapons / vehicles / wildlife | Existing catalogs and individual pages; several art and spec gaps remain | Distinct real game-relevant art, verified individual metadata, usable comparisons, no empty/fake interactive cards |
| 3D vehicle configurator | Original WebGL geometry supports rotation, zoom, paint concepts and private build notes | It is *not* an exact Rockstar vehicle model nor verified per-model tuning; cannot claim GTADB parity yet |
| One Last Ride | Original tribute art, chapter/story plan and an existing short motion-poster/teaser | The full approved 3–5 minute finished film is **not produced**; real footage, editing, original audio and rights are required |
| Signup & progress sync | Guest device backups and account-readiness page, secure provider setup planned | Owner explicitly deferred public signup integration until **after** the artwork-approved live merge, as a separate audited release |

## Public benchmark research (competitor capabilities; independent sources)

1. [GTAMap.io GTA V map](https://gtamap.io/gta-5-interactive-map/) describes nested layers and checklists, hide/show category controls, tick-off progress, and a route planner with movable stops, draggable waypoints and vehicle/on-foot choices. Atlas must match useful player outcomes where our own verified coordinates, rights and engine support them.
2. [GTADb.io tools](https://gtadb.io/tools) describes side-by-side comparisons for vehicles, weapons, characters and radio (up to four), series-evolution timelines, searchable GTA maps and browser-saved 100%-completion checklists. Atlas's world count and cover count cannot be substituted for these capabilities.
3. [GTADB.net](https://gtadb.net/) presents vehicle statistics, a 3D configurator, GTA Online rotation information, weapons, GTA VI animal and character records, and other linked database tools. Exact model geometry, live rotations and statistics are separate engineering/data tasks, not things the original Atlas 3D concept renders faithfully today.
4. [GTADB.org](https://gtadb.org/) supplies community landmark mapping. Reuse only specific datasets and imagery where their licences and provenance have been verified. Public display is not a blanket copying licence.

## Priority and quality gates

**P0 — before any merge:** Keep 17 original world/hero assets, 15+ independent heist artworks and all their working links intact; no flat SVG/photo regression. Test full-resolution media decode, 390px iPhone and 1440px desktop screenshots, Chromium/Edge functional smoke, all map zoom/touch/Fit controls, iPhone header/nav/footer overlays, guest entrance and footer social actions. Preserve every persisted user progress key and existing map functionality. CI passing source scripts alone does not equal visual acceptance.

**P1 — finish and verify:** Complete subject-specific cinematic coverage for weapons, animals, characters, business/garage, heist interiors and remaining page panels without image reuse unrelated to subject; pursue exact source-verified maps, complete collectible locations, stable routing, individual heist overlays, richer vehicle/weapon comparisons, and research confidence labels. Complete the approved One Last Ride film as a real player-visible deliverable, not just a poster or teaser; do not misrepresent a concept as finished footage. Document every unresolved parity gap.

**P2 — post-merge next release:** Audit HTTPS account provider integration, terms/privacy, optional signup and sync, consent-based migration of guest saves, authz, recovery and abuse protection; only then enable public login. Children's Elario properties are separate from mature-rated GTA companion areas.

**Release lock:** `docs/ATLAS151-VISUAL-ACCEPTANCE.json` remains `HOLD` until actual rendered preview is reviewed and explicitly accepted by owner. Never merge staging PR #68 into `development` or protected `main` merely because a preview deployed.
