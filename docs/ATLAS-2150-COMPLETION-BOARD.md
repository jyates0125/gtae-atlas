# Team Jura Atlas — 2150 completion and release board
**Created:** 2026-11-21 · **Status:** staging working board, not release certification
**Canonical repository:** `jyates0125/team-jura-atlas-preview` · **Staging PR:** #88 targeting `development`
**Studio authority:** `docs/ELARIO-STUDIOS-OPERATING-CHARTER-V2-PROPOSAL.md` (contents adopted)
**Project authority:** `docs/TEAM-JURA-STANDING-CHARTER.md`, `docs/ATLAS-SITE-COMPLETION-CONTRACT.md`, approved Designed Brand Master and Original Design Reference Pack.

## Meaning of the evidence labels
- **SOURCE:** code or asset exists; not proof of working rendered behavior.
- **CI:** automated tests passed on an immutable commit; list the commit.
- **DEVICE:** actual phone/desktop screenshot or interaction verified; list device and preview SHA.
- **OWNER:** explicit visual and release acceptance for that exact candidate.
- **BLOCKED:** known defect or missing evidence; cannot claim complete.
- **UNKNOWN:** not audited; never convert to passed by inference.

## Release-wide gates
- [ ] One frozen candidate SHA and complete Chromium + Edge acceptance against built Cloudflare payload; record job links.
- [ ] All public routes, all 13 game-world destinations, all 15 heist planning pages, global navigation, search and core controls function on phone and desktop.
- [ ] Real iPhone Safari visual and interaction acceptance (not simulated Chromium alone); no horizontal overflow, obstructing bottom controls or inaccessible dialogs.
- [ ] No legacy-looking public layout, old placeholder graphics, broken external image, mismatched subject portrait, or unrelated generic 3D vehicle model in the release candidate.
- [ ] Source rights/attribution, exact game separation, uncertainty labels and image decoding audited. No invented coordinates, stats or exact meshes.
- [ ] Guest save continuity and import/export verified with existing local keys and realistic data; no destructive migration.
- [ ] Owner reviews updated staging preview, approves design and specific release candidate; only then merge to Cloudflare-connected `development`.
- [ ] Verify actual deployed Cloudflare URL and smoke test production; preserve protected lowercase `main` and safety branches.

## Page-by-page 2150 implementation and acceptance board
| Experience | Desired flagship behavior | Current evidence | Remaining release work |
|---|---|---|---|
| Public entry / Start Here | Cinematic approved Elario art, immediate world choice, clear guest-first journey | SOURCE | Verify final entry route, CTA links, phone/desktop art, no legacy landing |
| Home / 13-world dashboard | Four featured destinations + nine additional worlds, useful search and progress | SOURCE | Audit all thirteen covers, route targets and selected world context |
| GTA V Story map | Correct Story pins, selectable categories, saved progress, usable routes | SOURCE | Full interactive device QA and coordinate provenance |
| GTA Online map | Online-only activities, event availability, legends, safe route/progress | SOURCE | Validate rotations, no stale active badges, marker QA |
| GTA VI / Leonida | Clear official versus research confidence, interactive research view | SOURCE | Inspect source freshness, visual quality, marker and dialog close |
| Seven classic map gateways | GTA III, VC, SA, VCS, LCS, CTW, IV episodes correctly scoped | SOURCE | Verify per-world art, map/pin calibration and navigation |
| Cayo workspace | Clickable mission-specific entry/exit/POI pins, selectable start and route | CI on 42856a0 | Preserve focused test; final Safari and cross-navigation acceptance |
| Remaining heist workspaces | Fifteen useful distinct heist boards, not generic map redirects | SOURCE | Test every heist map, filter, reset and route |
| Characters / All Characters | Recognizable named portraits, source-backed profiles, world isolation and search | SOURCE; owner screenshot BLOCKED | Replace broken Agent 14 image and Claude ensemble fallback; upgrade CJ/Claude; verify every card image |
| Vehicles / database | World-correct imagery, verified specs, filters, compare and Garage handoff | SOURCE | Cross-page state and exact model identity QA |
| My Garage | Personal owned collection, bays, saved builds, virtual showroom and export | SOURCE; owner screenshot BLOCKED | Confirm correct class shape, synchronize selections and ownership, verify persistence and restore |
| 3D concept studio | Rotatable class-correct vehicle, color preview, camera, honest asset labels | SOURCE | Render and test plane/boat/car and class-specific fallbacks on phone; do not claim exact game mesh |
| Weapons, wildlife, collectibles | Game-specific media, sourced data, accessible search and progress | SOURCE | Subject-specific media audit and category/collection completeness |
| Research / Data Lab | Transparent provenance, useful evidence workspaces and safe data imports | SOURCE | Browser QA, permissions audit, no false verified claims |
| One Last Ride / Studio | Approved tribute, separate studio identity and audience-appropriate content | SOURCE | Original film/art signoff, correct branding and navigation |
| Atlas header and global nav | Premium approved cinematic hero and consistent no-legacy UI | SOURCE; owner screenshot BLOCKED | Verify approved asset renders, remove visual regressions and mobile overlays |
| Credits / verification / privacy | Asset rights register, corrections, data boundaries, guest safety | SOURCE | Check each external asset and production behavior |

## Verified staging evidence (not release signoff)
At commit `42856a0488711f6228d6b39565a4ec9babf6d554`, GitHub reported **success** for:
- Team Jura Atlas - validate production website (run 44959636398)
- Team Jura Cayo - focused acceptance (run 44959636171)
- Team Jura Atlas 2150 - cross-product acceptance (run 44959636541)

The 2150 cross-product workflow currently checks **source contracts, JavaScript syntax and the Cloudflare build**; it does not prove complete user journeys, correct artwork, Safari behavior or comparative superiority.

## Next execution order
1. Audit and repair subject-specific character portraits, including Agent 14, Claude and CJ. Fail gracefully when remote images cannot decode; never mislabel a generic cinematic scene as the named character.
2. Complete Garage↔studio bidirectional selected-model and saved-preset handoff; test airplane, boat, car and helicopter class rendering without misleading exact-game-model claims.
3. Review and replace remaining temporary public headers and legacy layout remnants with approved, context-specific Elario art; test all routes.
4. Run a full built-site device/browser and source-permission audit; freeze one candidate and collect exact-head evidence.
5. Request owner visual and release approval only after blockers are closed; merge safely and verify live deployment.

**Policy:** Progress claims must cite exact files, SHAs and rendered evidence. This board is an implementation checklist, not a declaration that any listed page is finished.

## Owner decision — interim imagery (2026-11-21)
Keep approved Elario cinematic world scenes as **clearly labeled interim backgrounds** when a named character portrait cannot be sourced or decoded. Do not leave a visually empty card, but never imply the scene depicts that named person. Prioritize correct individual portraits and unique model-accurate 3D representations in subsequent passes. The fallback is not visual completion. Relevant staging commits: `14cabe62` (character media), `96a1a1b4` (fallback styling), `c2ed1a84` (regression check). GTA VI is released; game-wide pre-release labels are obsolete, while per-record source verification remains mandatory.

## Deployment and legacy-version synchronization (owner requirement)
- The authoritative public site is `https://gtae-online.pages.dev/` from Cloudflare's `development` production branch. PR #87 and its Cloudflare branch previews are **staging**, not automatic public updates. Do not confuse green CI or preview deployment with a live production sync.
- The old `team-jura-atlas-preview.pages.dev` origin is a separate Cloudflare Pages project. `scripts/atlas209-legacy-redirect.cjs` intentionally redirects only its root on production builds; deeper legacy URLs remain accessible to let visitors export guest progress from that origin. Do not destroy that data bridge or blindly redirect every route.
- `_headers` now revalidates JS/CSS and the page directory, alongside HTML, to reduce stale legacy UI after future releases. Verify actual Cloudflare response headers and iPhone Safari caching before marking solved. Cache control cannot make unmerged PR changes appear on the public site.
- Before any public release: identify current `development` head, compare candidate and deployed content, verify Cloudflare production project/branch, run exact-head CI and device checks, get owner approval, then merge once and verify live pages and old-site root redirect. Do not overwrite protected `main` or migrate guest storage without export/import verification.

## Main/development history versus content (2026-11-21)
GitHub compare `main...development` reports `development` behind by 18 commits, **but zero changed files**. Directly fetched `index.html` and `_headers` have identical blob SHAs on both branches. A different commit SHA does not by itself mean different website files. Do **not** force-push or merge unfinished staging simply to equalize commit counts. Staging adds `.github/workflows/atlas2150-branch-parity.yml` to check tracked-file parity whenever `main` or `development` is pushed, once that workflow is merged. Production Cloudflare project must explicitly select `development` as production branch; its exact deployment SHA, build output, cache headers and URL must be checked independently. Old deployment/cache can look stale even when Git branches contain identical files.


## Atlas 23.2 development continuation
- Frozen Atlas 23.1 PR head `40151e8a6ea9b1a60f03d651ecbd25bad9338222`: cross-product source checks passed; exact-head full browser validation in progress when this batch was written.
- Prior 22.8 full Chromium found mobile file-upload overflow in seven classic gateways; 23.1 implements a correction and direct viewport assertions. Do not call the defect closed until exact-head browser proof.
- Next batch: temporary Online event focus preserves category/named-layer preferences, text search and Story/Online isolation; evidence refresh does not cancel focus. Source-level changes and synthetic local-only regression fixture; no new live locations or game coordinates claimed.
- Pending: all exact-head tests, local individual artwork for remaining character appearances, source-backed missing map data, approved visual review, real phone and owner release approval. No production branch changes.


## Atlas 23.9 — all-world source improvement
- Exact prior staging head a8d3c75fca4cf9b216402360212ebfab1cea517e: all five production jobs succeeded (focused Chromium/Edge, full Chromium/Edge, validated ZIP); cross-product and Cayo passed. No owner sign-off inferred.
- Next-batch San Andreas expansion: 320 source-backed records across all five collections, including 70 unique save-derived start/landing boxes. New integration/browser validation required. Existing map projection approximate; no ramp placement or gameplay claim.
- Source review policy now explicitly covers all 13 destinations. See docs/ATLAS-ALL-WORLD-SOURCE-REVIEW.md. Other unfinished map/data/art work remains open.


## Atlas 25.3 — classic source expansion and route/save repair
- New staged development includes all five SA sets (320 coordinate records), GTA III 160 source locations (140 objectives), VC 51 classic projected points and 171 edition-isolated DE coordinate references, 103 LCS/VCS PSP named destinations, original pointed source pins, optional high-detail viewer and four-point private alignment.
- Native VCS/CTW basemap replacement and genuine collectible location inventory for Stories/CTW are still unresolved. External viewer is not equivalent to native integration. Reserve owner review for actual branded rendering and release.
- Prior 25.1 exact head 268c40d89a1ed9e3bf995ca11a6717856ebac9b1 static failure: obsolete literal atlas98-classic.js?v=190 assertion; updated version checks, current LCS reference assertion and SA source identity namespace. Shared fixed-endpoint route core exact blob independently executed with 60 deterministic synthetic cases passing. CI must still validate all source and browser scenarios. No release approval inferred.


## Atlas 25.4 — Garage ownership and exact-color build continuity
Import older backups using a strict non-destructive merge: preserve existing builds including later edits, union garage names within capacity, add only known model IDs, accept boolean ownership/wishlist flags, preserve notes and warn on conflicts. Re-read latest cross-tab keys and attempt rollback on storage failure. Garage and studio now round-trip exact custom RGB, concept name/body metadata without replacing existing saved studio presets or representing custom colors as confirmed in-game paint. Tests added for conflicting builds, scope validation, original objects untouched, exact hex and ownership retention. Browser evidence pending. Map 25.3 candidate remains saved.

25.4 independent unit evidence: retrieved exact Garage merge core (Git blob 75abb87fcaa03b3f85eca32ff828c2b7348f2fb7, verified local hash) and executed 13 core assertions plus 5 capacity/prototype rejection assertions in Node, all passing. This verifies the merge helper only; browser UI and storage behavior remain subject to CI.


## Atlas 25.5 — explicit Garage / Studio working-copy handoff
Add a private exact-color input to Garage and keep its picker and named swatches synchronized. Studio offers Load saved Garage build even when an independently saved Studio idea exists; uses a working copy only, leaves both persistent records unchanged until explicit save. Preserve model scope and correct the fallback classification of Jetmax (watercraft, not jet aircraft). Expanded the existing Squalo browser test with exact RGB, conflicting backup merge, separate Studio preset, and restoring either working source. No runtime pass claimed until CI reports it.

25.5 validation continuation: 25.1 full Edge smoke reported one issue on Credits at 1440 and 390: the GTAMap.io disclaimer link appeared twice (new Stories card plus canonical source card). Consolidated the new card link to the existing attribution section, retaining the original disclaimer URL exactly once. Focused Chromium, focused Edge, Cayo and cross-product runs succeeded for 25.1; full validation failed. 25.2–25.5 integrated candidate requires fresh exact-head validation. No release approved.


## Atlas 25.6 — Elario 2150 Forge geometry checkpoint
Original procedural mesh engine replaces block-like prototypes: sculpted cross-section body and cabin, detailed radial wheels, trim and underglow, pointed marine hull with cockpit/seating, fuselage/wings and rotorcraft, illuminated circular platform. Six class meshes and six altered design variants were generated directly from the same factory saved in atlas256-forge-geometry.js; finite triangles, valid stride, distinct variant geometry/colors, Jetmax marine classification checked. Results: [{"model":"adder","kind":"sport","triangles":2744,"variantTriangles":2756},{"model":"bison","kind":"utility","triangles":2744,"variantTriangles":2756},{"model":"tailgater","kind":"touring","triangles":2744,"variantTriangles":2756},{"model":"jetmax","kind":"marine","triangles":1080,"variantTriangles":1092},{"model":"lazer","kind":"air","triangles":952,"variantTriangles":952},{"model":"buzzard","kind":"rotor","triangles":1072,"variantTriangles":1072}]. This is concept geometry, not extracted or exact game models. Viewer integration and browser visual review next.


## Atlas 25.6 — interactive Forge integration
Shared original sculpted mesh generator now feeds both Garage and Concept Studio. New responsive live 3D stage, circular grid platform, named camera views, optional auto orbit, accessible keyboard controls, finish, independent RGB accent, road stance/aero, marine deck styling and lighting. Design metadata round-trips through separate guest presets and Garage backups; no silent overwrite or official game customization claims. Marine/air classes can launch their own original preview in My Garage while preserving approved reference art and verified facts. Jetmax is a powerboat, not an aircraft. Exact geometry checks passed during source creation; full visual/browser validation pending. Motorcycles and military models retain reference-only behavior until appropriate concept geometry exists.
