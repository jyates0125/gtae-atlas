# Team Jura Atlas — Release Operations v2 (PROPOSAL)
**Scope:** Draft PR #70 (`feature/atlas163-postrelease-parity` → `development`), 13 distinct game destinations, 80 root public HTML pages and the original Elario visual language.
**Authority:** Existing Standing Charter and Site Completion Contract; this is a proposed implementation runbook pending owner approval.

## A. Hard rules that remain unchanged
- Live Cloudflare-connected `development` and protected `main` are **never** merged or pushed without the owner's **fresh explicit** approval for this exact staged preview; PR #70 stays draft.
- Preserve GTA V Story / Online / GTA VI Research / GTA IV / TLAD / TBOGT / each classic title's separate sources, marks and storage. No guessed road-aware routes; straight-line planning must be labeled as such. Preserve existing guest data, local backups and working map/route engines.
- Do not downgrade approved subject-specific artwork, reused source imagery or per-world covers to generic placeholders; no "technical green" may override rejected aesthetics or third-party rights.
- Secure signup and sync remain a separate, future owner-requested phase; this release remains guest-first.

## B. One release-candidate SHA, one auditable package
1. Verify current GitHub branch head and changed files. Build only approved/public static assets; forbid credentials, secrets and unlicensed dumps.
2. Fix **fast tests** and local source contracts before spending minutes on browser runners. Tests should validate behavior and current asset presence—not stale literal cache version numbers.
3. Freeze and label a candidate commit. Do not push cosmetic changes while its full workflows run. A fix creates a new candidate, not an assertion that old CI results apply.
4. On this same exact SHA run: source/licence/static audit, map/route/collectible and world isolation, vehicle/weapon/garage and Squalo source facts, 15 heist pages, all public pages' functional smoke, 1440px desktop/390px mobile Chromium and Edge, empty/failed-image/overflow diagnostics, keyboard/touch interactions, screenshot/design review.
5. Inspect screenshots **beyond the first viewport**, confirm meaningful covers/art decode, stable navigation, disabled/unavailable states, all primary controls, and brand consistency against approved refs. Record physical iPhone Safari gaps explicitly; browser emulation is not a real iPhone.
6. Require a validated Cloudflare production ZIP and the actual staging deployed URL; record exact SHA, workflow links and an artifact manifest. Never equate 176 screenshot captures with all 176 screenshots reviewed or every interaction passing.
7. Provide owner a **short release scorecard** with green/yellow/red evidence, tested link and exact SHA. Explicit preview approval must match this candidate, then exactly one authorized merge to `development`, then post-deploy smoke. `main` remains untouched.

## C. Measured release scorecard per area
| Area | Minimum acceptance evidence | Blocker examples |
|---|---|---|
| Site and navigation | 80 public pages open, accessible links, intentional empty states, no missing asset/phone overflow | Dead buttons, inaccessible first visit, broken mobile shell |
| 13 world destinations | Source-cleared map or honestly labeled research notebook for that world; correct edition and credits | Incorrect GTA world, invented positions, blank map |
| Cayo + 15 heist workspaces | Game-specific map, selectable meaningful pins/plan, preserved saved checklist, route/finish logic | Overlay eats pointer taps, unrelated shared map |
| GTA IV / TLAD / TBOGT | 2,648 positioned community landmarks, honest untitled source IDs, separated episode collectibles, paging/route saves | Cross-episode route leakage, missing entries |
| Garage, vehicles, watercraft, weapons | Model class and individual facts from provenance; originals/fallbacks display; no fake 3D or boat recolor; local notes roundtrip | Misclassified Squalo, broken gallery deep link, corrupted ownership |
| Visual, accessibility, performance | Distinct approved artwork, decoded images, first/full-scroll phone & desktop checks, keyboard controls; measured performance baseline | Rejected placeholder, clipped UI, inaccessible actions |
| Delivery | Exact-head Chromium and Edge CI, reviewed screenshot package, validated ZIP, owner-approved staging preview | Failure hidden by shell, incomplete CI, unauthorized merge |

**Legend:** `not-started | implemented | evidence-checked | browser-tested | visually-reviewed | owner-approved | released`. Never automatically promote a row to the next state based on tests elsewhere.

## D. Execution priorities
- **P0 — release blockers:** broken map interactions, failed required tests, missing primary art, horizontal overflow, script/runtime errors, source or privacy violations, loss of player saves.
- **P1 — player usefulness:** all-world interactive map parity, verified category coverage, routes, 15 heists, separated collectible checklists, navigation and Garage.
- **P2 — researched depth:** individual car/boat/aircraft/weapon facts, provenance and availability, subject-specific artwork, reliable fallback and missing states.
- **P3 — optional enhancements:** future WebGL/3D only where model assets are lawful/accurate; full One Last Ride production, optional sync, added maps and game modes in separate approved phases.

Maintain a feature backlog with impact, evidence grade, uncertainty and test link. Finish player-critical functions before expanding unverified catalog counts.

## E. Automation boundary and reporting
Reuse Team Jura Preview Builder and morning build report; do **not** create duplicate periodic tasks. Their reports must inspect actual current SHA, workflows, cancelled/failing jobs, rollout status, any dated source expiry and top three actionable blockers. They may prepare/commit staging fixes only when authorized and must **never** merge to `development` or `main`, change protected settings, activate signup, or publish unapproved art without owner approval.

## F. Required owner handoff format
`Candidate SHA` · `Cloudflare exact-build preview` · `what changed and why` · `Chromium desktop/phone` · `Edge desktop/phone` · `source/art rights` · `screenshots actually reviewed` · `ZIP audit` · `Safari limitations` · `known gaps` · `merge approval: requested/not granted`.
