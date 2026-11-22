# Team Jura Atlas — 2150 completion and release board
**Created:** 2026-11-21 · **Status:** staging working board, not release certification
**Canonical repository:** `jyates0125/team-jura-atlas-preview` · **Current reviewed baseline:** `development` PR #91 merge `1d86d5c28d63aa6cfd14f48a5da3ed61bba58fcd`; protected `main` PR #90 synchronized as `8039ee9214fe7bfa3801bcea8f0c95b41f44b94d` with 0 tracked-file differences. **Open staged upgrade:** PR #94 Leonida dual-map/source notebook (not live, exact-head CI, Safari/owner gates outstanding).
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

25.6 Jetmax profile cross-checked from https://gtadb.net/gta-online/vehicles/jetmax/ , https://www.gtabase.com/grand-theft-auto-v/vehicles/shitzu-jetmax and https://gtacars.net/gta5/jetmax : Shitzu boat, GTA$299,000, 70 mph tested, Pegasus, non-customizable in-game. Seat-count sources conflict so left null rather than fabricate certainty. Browser acceptance now exercises persisted design settings, marine vs aircraft classification, Garage/Studio handoff, fallback behavior and screenshot capture where WebGL works. 25.5 focused browser test expected obsolete Garage restore success copy; actual merge succeeded, test updated. Full validation reached SA and failed the test's arrow expression init script, so seed directly on the same-origin IV page before navigation. Exact new integrated validation required.


## Atlas 26.7 — actual thirteen-world inventory and release repair
Staging code checkpoint `8f259346c707e01834b16a014520220b92457aaa` adds a searchable, responsive all-world source inventory at `atlas-coverage.html#j267-world-evidence` and direct map-directory navigation. Displays actual bundled pack counts or unavailable states, separate classic/Definitive Edition counts, unique GTA III objective count versus alternate spawn locations, and explicit native-map/collectible gaps for VCS, LCS and CTW. Online and Cayo covered as tool-specific workspaces, not invented coordinate totals. Current VI manifest reports 3,754 research landmarks (3,663 positioned, 91 search-only); no gameplay confirmation. Ten direct JS assertions executed against the actual bundled datasets passed; executable cross-product regression added. No new location data or artwork claim. Previous 26.6 cross-product run 44991096176 passed; full Chromium static regression failed at test_configurator_101.py line 26 on outdated literal import-call shape, now corrected with explicit world metadata assertion. Full and focused browser jobs in run 44991096158 were canceled during subsequent head updates, not passed. Do not replace visual/device acceptance with inventory evidence. Keep improved vehicle models, all map functionality and user saves intact. Latest exact-head CI and owner approval remain pending.


## Atlas 27.1 — source-specific classic progress milestone
Owner direction: finish a coherent functional area against the standing charter before starting the next, rather than dispersing changes across unrelated pages. Track implementation, direct tests, exact-head browser validation and owner approval separately; do not call blocked source acquisition complete. This batch implements source-specific found/visited marks, hide-completed filters, route filtering, map detail buttons, preview/export and merge-only source/revision-isolated progress for GTA III, VC classic, VC Definitive Edition, LCS PSP and VCS PSP. GTA III 160 locations represent 140 objectives (both rampage alternatives share a mark); classic VC 51, VC DE 171, LCS 52 and VCS 51 referenced destinations. PSP entries are visits to reference destinations, not verified collectible spawns. Existing sequential guide slots, personal markers, maps, routes and saves remain separate. Six pure identity/merge checks plus eight simulated DOM/storage interaction checks passed, including reload, hide-found, alternate spawns, stale click intent, and scope isolation. All five data packs were inspected for actual source counts. Committed browser regression includes mark/hide/reload, shared rampage objectives and preserved route. Exact-head Chromium/Edge validation remains required. Research located third-party VC/LCS maps and source leads but did not establish new licensed calibrated classic positions; do not copy from unvalidated sources or claim parity. Code checkpoint `d05d2f5e30d6a9311f694be162c9c667c2e79e16`.

## Atlas 29.1 — staging release blockers and focused-test operating gate (2026-11-22)
**Candidate:** PR #96, `feature/atlas-mobile-shortcuts-20261122` → `development`. This is **not** a completed website or an approved release. Last documented navigation baseline: `d739628be1e9385f03c5089d5f5c62b90f43003d` (new head may differ; always inspect GitHub).

**Delivered in staging:** Collapsible, keyboard-accessible dashboard tool shortcuts; separate official Leonida poster and interactive community map links; visible source/provenance note; narrow-phone link wrapping; targeted dashboard diagnostics. `atlas143-official-map-view.js` already handles `?view=rockstar` on GTA VI pages; the poster is separate from uncalibrated community markers. No external asset permissions are implied by this feature.

**Known blocker:** At commit `e0d34a9b3b5a4b824d772df41e536193668c3b67`, full Edge validation failed `scripts/test_atlas223_home_browser.py` at 375px: document horizontal overflow **361px**. Chromium/static, focused Chromium/Edge and other Edge checks passed, but that does **not** waive the failed Edge dashboard gate. Added overflow-element logging and a dashboard-only Chromium workflow to reproduce without rerunning unrelated Cayo tests. The first focused browser job failed before running tests because Playwright 1.58 cannot install on runner Ubuntu 26.04; the runner was pinned to `ubuntu-24.04` at `d739628`. Wait for the actual supported-runner output; fix the measured offending DOM/CSS and confirm at 375px, 390px and desktop. Verify Edge again before release.

**CI rule:** Source and dashboard browser checks for navigation changes; product integration tests only when relevant characters/Garage files change; heist/Cayo checks only when related features change. Full static audit, all-world Chromium and Edge phone/desktop, heist/Cayo, production ZIP, owner-approved artwork and Safari remain a **manual exact-head pre-merge release gate**. A green focused workflow is not release certification. Preserve guest saves, game isolation, existing working maps and the protected main branch.

**Still open:** Remaining world-by-world and heist-by-heist QA, source/asset licensing and character portrait audit, Garage↔studio functional acceptance, final premium design parity, live iPhone Safari, Cloudflare production verification and owner approval. Do not mark these complete from static tests alone.


### Atlas 29.1 verified navigation acceptance update — 2026-11-22
The historical 375px Edge overflow failure above is **not currently reproducing** in the isolated dashboard browser suite: workflow run [45048148138](https://github.com/jyates0125/team-jura-atlas-preview/actions/runs/45048148138) passed Edge, Chromium and navigation-source checks at `c25d83dc7368faad8650191ea1b8a87776835be7`. Run [45048536412](https://github.com/jyates0125/team-jura-atlas-preview/actions/runs/45048536412) passed all three jobs at `8b60f864589007d9987f8e265e1ed26f8af476d0`, including 375px/390px phone widths, desktop, the native disclosure keyboard focus traversal, and smoke testing 13 tool destinations, seven featured worlds and the separate VI official poster route. These are focused browser tests, **not** an Edge full-site release retest or actual iPhone Safari acceptance. Preserve the prior failure record for regression history rather than erasing it.

**Further source integrity:** `863ec4c` adds duplicate/missing route checks for all 20 dashboard destinations; `a07ede2` checks served HTML from the built Cloudflare payload. The navigation workflow now watches dashboard JS, CSS and browser test changes as well as HTML/shortcuts. Any later commit requires its own exact-head CI status. Do not trigger full Cayo regression for dashboard-only work.

**Release hold remains:** complete remaining board items, run manual exact-head production release workflow, review visual/device and attribution evidence, obtain owner approval, then merge. Protected `main` synchronization is a separate reviewed operation.

## Atlas 29.3 — Garage ↔ Forge staging implementation (2026-11-22)

- **SOURCE:** Garage selected-model link carries `source=garage`; Forge opens the exact Garage paint, notes, name and normalized design as an unsaved working copy, even when a previous Studio preset exists. Named variants and saved Studio presets remain intact until the visitor chooses to save.
- **SOURCE:** Forge now exposes an explicit **Save working concept to Garage** action for GTA V catalogued vehicles. It rereads the latest Garage local-storage snapshot, updates only the selected model's paint, body, name, notes and normalized design, and preserves ownership, bay/location, plate, favorites, other vehicles and Studio presets. GTA VI hides and rejects the action.
- **SOURCE:** Real Chromium journey checks the round trip and data isolation at 390px, with independent local-storage state before and after. Focused source contracts, syntax, build and asset audits run in the scoped workflow.
- **CI:** On previous commit `0ab51ea917b6a949e83999da91d9986c12d7bce3`, focused Garage/character Chromium and cross-product workflows passed. New reverse-save changes require **fresh exact-head CI** before calling them verified.
- **BLOCKED:** Real Safari/iPhone review, owner visual acceptance and release approval. Subject-specific Lamar Story and Online portraits still missing; Agent 14, CJ and Claude need owner visual likeness review even though bundled assets decode in Chromium.
- **Release:** Draft PR #97 targets `development`; nothing in this entry authorizes merge or live deployment. No Cayo-specific tests were added for unrelated changes.


## Atlas 29.3 — Garage ↔ Forge selected-model milestone (2026-11-22)
- **SOURCE completed in draft PR #97:** GTA V/Online Garage model detail opens the matching Forge concept with a deliberate `source=garage` working copy; the independent Studio preset remains separately loadable. The visitor may explicitly save a Forge design back to the same Garage vehicle without setting owned/wishlist or rewriting the ownership registry. GTA VI concepts cannot write into the GTA V Garage.
- **SOURCE completed:** exact custom RGB, personal name, notes and class-specific original procedural design carry between workspaces. A named Studio build is never silently overwritten. Boat/aircraft class concepts are labeled as original studies rather than exact game meshes.
- **SOURCE completed:** Garage vehicle saves now read the latest saved Garage snapshot, merge only the selected model, preserve other vehicles edited from another tab and do not rewrite the ownership collection key. Malformed storage fails closed rather than overwriting it.
- **CI evidence:** focused Chromium and cross-product workflows passed on `1574fbc1b0c4ae75f3db981eee325bdd7cff4e37`; the full-suite Squalo expectation was updated at `5d4801437a016d3c3c8b09c46f947f5dde945632`. New concurrent-tab regression checkpoint `e90cab149aa63218b47948e711664a51913ba94e` requires exact-head CI confirmation.
- **Still required for release:** exact-head full Chromium/Edge and Safari owner device acceptance; check the final public deployment after approved merge. This milestone is not the same as finishing the complete 2150 Garage showroom/Forge visual and feature ambitions.


## Atlas 29.5 — stale Garage tab / guest progress safety (staged)

- **SOURCE:** Independent key-specific ownership and Garage location saves replace the older two-key `persist()` operation. Both reread the latest localStorage snapshot; deleting a now-occupied garage is prevented; corrupted existing records fail closed.
- **SOURCE:** Garage export uses the latest stored builds and owned marks, not stale page state. Import refuses to overwrite corrupted local data.
- **TEST:** `scripts/test_atlas295_garage_multitab_browser.py` and `scripts/test_atlas295_garage_safety.py`, with focused workflow `atlas295-garage-preservation.yml`. This tests exactly Garage ownership, multi-tab Forge data, naming and backups on a 390px Chromium viewport and does not run an unrelated Cayo/full-site matrix.
- **GATE:** CI at exact head, cross-browser release pass, device behavior and owner approval remain unverified. Separate stacked staging candidate based on integrated PR #98, **not a public or protected-main merge**. See `docs/ATLAS295-GARAGE-STORAGE-ACCEPTANCE.md`.


## Atlas 29.6 — Forge hub for saved, not-yet-owned Garage designs

- **SOURCE:** The private Forge Collections page now includes saved Garage concepts without requiring an owned mark. Owned-only, saved-only, and both cases are truthfully distinguished; a model with both flags has one Garage entry, not two. Unsaved/unowned models do not appear as finished builds. GTA VI Forge profiles remain separate.
- **SOURCE:** Links contain only the public model identity, never saved notes, ownership or personalized design contents. Viewing/searching is read-only; no signup, upload or production database writes.
- **TEST:** `tests/atlas296-forge-collections.test.cjs` and `scripts/test_atlas296_forge_collections_browser.py`; scope-limited workflow `atlas296-forge-collections.yml`. Screenshots planned at 390px and 1440px on actual built Cloudflare files.
- **GATES:** Exact-head focused test pass, real iPhone Safari and owner visual approval still pending; this is one Garage/Forge charter step, not the entire Elario 2150 showroom. See `docs/ATLAS296-FORGE-COLLECTIONS-CHECKPOINT.md`.


## Atlas 29.8 — mission-specific map stages and portable briefing (staging)
- **SOURCE:** Fourteen non-Cayo heist maps receive purpose-built Recon & Setup / Finale & Escape / All Points layer controls, live visible-POI/route counts and mobile accessible tap targets. Existing source-informed, schematic POI positions and approved Elario visuals are preserved; no invented geographic coordinates or proprietary map copies.
- **SOURCE:** Per-heist route/scoped/award export and non-destructive restore (same-mission validation, historical-point preservation, latest-record reread, explicit reload). Existing mission notes, crew, checklist, other game data and Cayo remain independent.
- **SOURCE:** Kortz Center release context links the official Rockstar Art Studio/heist announcement instead of implying the mission is unreleased; precise interior geometry remains labeled illustrative.
- **TEST:** `tests/atlas298-heist-map-kit.test.cjs`, `scripts/test_atlas298_heist_map_kit_browser.py`, and path-scoped `atlas298-heist-map-kit.yml`. Tests inspect all fourteen maps at 390px/1440px, import/export and privacy. Exact-head results must still be checked; do not infer a pass from source existence.
- **GATE:** Real iPhone Safari, full final browser + ZIP validation, sourced exact in-game map geometry, complete charter content and owner approval remain open. More detail: `docs/ATLAS298-HEIST-MAP-KIT-ACCEPTANCE.md`.


## Atlas 30.0 — relevant-only feature acceptance (staging)
- **SOURCE:** Twelve path-scoped GitHub workflows (14 jobs) now inspect each new PR synchronization's *actual head commit* before installing browsers or rebuilding unrelated features. Initial PR, manual, unavailable history and final release validation remain fail-open and fully available.
- **SOURCE:** Shared dependencies are explicitly included for Garage/Forge, character, navigation, heist and integrated Leonida tests; deleted/renamed critical files count. The standalone final production Chromium/Edge/ZIP signoff gate remains manual and unchanged.
- **TEST:** `scripts/atlas300-ci-delta.py`, `scripts/test_atlas300_ci_delta.py` and lightweight workflow `atlas300-ci-delta.yml`. Exact-head YAML/source CI and observed workflow-skip evidence must pass before this is treated as verified.
- **HOLD:** This saves development test minutes, not user-facing charter completion. Owner visual, source/rights and real iPhone checks remain mandatory. See `docs/ATLAS300-CI-DELTA-ACCEPTANCE.md`.


## Atlas 30.1 — fifteen heist checklist guest-save safety (staging)
- **SOURCE:** Heist pages now read their saved checklists without rewriting localStorage on page open. Checkbox changes reread the latest record and update only one named step, preserving retired tasks, extra metadata, other missions and independently saved notes/routes. Reset requires confirmation and only resets the displayed mission steps.
- **SOURCE:** Malformed or unreadable checklist storage is never replaced with empty progress; accessible error status and a raw JSON recovery export protect guest data. No new account or server storage.
- **TEST:** `scripts/test_atlas301_heist_checklist.py`, `scripts/test_atlas301_heist_checklist_browser.py` and `atlas301-heist-checklists.yml` cover all 15 mission pages at 390px/1440px, cross-tab updates, historical data, reset and corrupt export. Check exact-head results before claiming automated proof.
- **HOLD:** Production release, exact-head full suite, user iPhone Safari, design review, source rights and owner approval remain mandatory. See `docs/ATLAS301-HEIST-CHECKLIST-PRESERVATION.md`.


## Atlas 30.2 — accessible Cayo corrupted guest-checklist rescue and single map mount
- **SOURCE:** The fully tested Atlas 30.1 checklist code in draft PR #98 remains authoritative. If a historical Cayo checklist is malformed, a small branded recovery panel now appears outside the Cayo flagship's intentionally hidden legacy layout. It offers an exact-raw-byte download, then separate confirmation to reset **only that old checklist**; modern island map, mission notes, daily chest data and every other saved key remain intact.
- **SOURCE:** One duplicate shared Atlas 29.8 mission-phase script/CSS injection was removed; all 14 non-Cayo heists mount their phase map once. Cayo and the 29.9 complete backup stay independent.
- **TEST:** Scoped `scripts/test_atlas302_cayo_rescue.py` and `scripts/test_atlas302_cayo_rescue_browser.py` run through `atlas302-cayo-rescue.yml`, with 390px/1440px Cayo recovery and Fleeca phase screenshots, malformed and concurrently changed JSON, upload-free safe reset, and payload audit.
- **GATES:** Exact-head CI result, final release browser/ZIP and actual iPhone/Safari/owner visual approval are separate. See `docs/ATLAS302-CAYO-RECOVERY-ACCEPTANCE.md`. Duplicate earlier PR #104 remains closed, not merged.

## Atlas 30.2 — seven classic map guest notebook preservation (staging)
- **SOURCE:** GTA III, Vice City, Vice City Stories, Liberty City Stories, Chinatown Wars, TLAD and TBOGT share a fail-closed notebook reader. Corrupt/wrong-world stored records are not silently rewritten, and stale tabs cannot replace newer local guest markers in the ordinary sequential-save case.
- **SOURCE:** Clear recovery panel lets the visitor export untouched raw bytes before choosing an explicit confirmed fresh notebook; a second byte check refuses to erase a newer tab's save. Original keys and image-relative coordinate/source distinctions remain intact.
- **SOURCE:** Marker CRUD, category progress, JSON import and personal map image actions avoid claiming success after failed notebook saves. Cache revisions `v=302` prevent browsers using outdated Classic notebook logic.
- **TEST:** `scripts/test_atlas302_classic_safe.py`, `scripts/test_atlas302_classic_browser.py` and `atlas302-classic-notebook.yml`. Real Chromium built-site checks for seven classic worlds at 390px/1440px, no load overwrite, corrupt export, intentional recovery and stale-tab preservation. Exact-head CI not claimed until confirmed.
- **HOLD:** Source/location alignment gaps, complete classic-world data/media, manual full browser/ZIP release validation, real Safari and owner approval remain. See `docs/ATLAS302-CLASSIC-NOTEBOOK-RECOVERY.md`.


## Atlas 30.3 — all thirteen GTA destinations and phone/desktop navigation
- **SOURCE/UX:** The four featured worlds and nine additional game/episode destinations have unique, same-origin game-correct links. The world finder now exposes a single-tap Show all 13 reset whenever search or filters are active; the allowlisted recent-world shortcut refreshes after browser Back restores a cached directory page.
- **TESTED:** Exact-head focused source and Chromium acceptance `bf3c83e24909b0b8ee472746dc311320fea569a8` passed for 13 routes, world identities, phone 390px and desktop 1440px, return links, search/reset, Back/recent-world continuity and no horizontal overflow. PR #108 merged into draft staging only.
- **RETAINED:** Existing Cayo and GTA V/Online/VI engine separation, original game covers, classic episode image-relative map notebooks and provisional source notices. The new workflow `atlas303-thirteen-worlds.yml` is strictly world/directory focused.
- **REMAINING:** This certifies navigation, not exhaustive 13-world verified collectibles/road networks, source permissions, 3D, real Safari/iPhone, full final Chromium/Edge/ZIP or owner release approval. See `docs/ATLAS303-THIRTEEN-WORLD-ACCEPTANCE.md`.


## Atlas 30.2 — Mobile marker exit and safe map return (staging)
- **SOURCE:** GTA V Story / GTA Online / GTA VI map detail cards now have a sticky, 44px **Back to map** button, 44px existing × and focus return to the map canvas after closing. Scrolling tall media/text no longer strands the exit below an overflowing overlay. Short iPhone landscape receives a bounded fixed panel.
- **SOURCE:** Closing keeps world, map camera/zoom, marker sources, user routes, progress and browser history unchanged. Original Elario violet/gold styling and approved imagery remain intact.
- **TEST:** `scripts/test_atlas302_map_marker_exit.py`, `scripts/test_atlas302_map_marker_exit_browser.py` and focused `atlas302-map-marker-exit.yml` cover all three map pages at 375×667, 390×844, 844×390 and 1440×900; confirm exact-head CI before accepting.
- **HOLD:** Actual iPhone Safari signoff, complete 13-world navigation/device QA, final Chromium/Edge/ZIP and owner-approved release remain outstanding. See `docs/ATLAS302-MAP-DETAIL-EXIT-ACCEPTANCE.md`.
