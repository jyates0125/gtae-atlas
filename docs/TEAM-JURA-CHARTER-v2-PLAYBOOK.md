# Team Jura Atlas — Charter v2 Acceptance & Release Playbook (proposed)

**Status:** PROPOSED supplement to docs/TEAM-JURA-STANDING-CHARTER.md and docs/ATLAS-SITE-COMPLETION-CONTRACT.md.  
**Parent standard:** docs/ELARIO-STUDIOS-QUALITY-STANDARD-v2.md.  
**Staging:** PR #70, feature/atlas163-postrelease-parity. **Never promote without the owner's explicit instruction.**

## 1. Keep an exact evidence ledger

Every changed feature must record:
- User-facing purpose and an actual acceptance scenario
- Product/world/edition and source IDs
- Screenshot/approved-art reference and per-asset attribution or rights status
- Saved-data keys / migration impact and safe rollback
- Code commit SHA + preview build ID
- Static tests; Chromium and Edge phone/desktop interaction tests; visual review results
- Current status and P0–P3 gaps

Use these status names consistently: BACKLOG, IN PROGRESS, CODE VERIFIED, BROWSER VERIFIED, VISUALLY REVIEWED, PREVIEW READY, OWNER APPROVED, LIVE VERIFIED, PARTIAL / BLOCKED. Neither a working source test nor an older approval JSON is an exact-head release authorization.

## 2. Feature-specific definition of done

| Workspace | Must be demonstrated |
|---|---|
| All public pages | Correct subject imagery; no blank primary image; usable empty/error/loading states; clear destination; functional links, controls and keyboard labels; 390px and 1440px layout; no horizontal page overflow or overlay collisions |
| All 13 GTA map destinations | Correct game/edition; honest map style and coordinate status; clickable visible markers; category/search/filter; source/accuracy/edition labels; save and share behavior; no fictional road network |
| GTA IV / TLAD / TBOGT | Distinct episode filters and deep links; stable source IDs including unnamed rows; mapped vs unpositioned counts labeled; selected start, nearest-next, optional last finish; visited/save/restore; straight-line routing identified as approximate |
| GTA V Story / GTA Online / GTA VI | No cross-world spillover in pins, progress, weapons, research labels, artwork or route links; provisional VI records remain provisional until individually verified |
| Cayo and 14 other heists | Correct individual mission imagery and island/game workspace; legend matches actual hotspots; map marker clicks not intercepted; route start/finish/nearest-next; no fake daily active spots; guest progress retained |
| Vehicle / weapon galleries | Game-specific subject art; no permanent blank remote thumbnails; explicit original-concept fallback, not a misleading item image; filters, model cards, sources and relevant verified specs |
| Squalo / Garage | Watercraft-class treatment, no generic car 3D; correct game pricing and source; DockTease/Pegasus metadata with provenance; gallery-to-Garage deep link; notes/owned status survive reload/export; no promise of in-game boat recoloring |
| All 15 heist film/planning workspaces | Distinct heist assets, controls and precise source coverage; a useful schematic when licensed game-specific pins are unavailable; never silently embed unrelated GTA V geography |
| One Last Ride | Storyboard, teaser and 3–5-minute finished video are separate deliverables; final means actual playable audiovisual media + authorized voices/music/likeness and QA |
| Family/educational future Elario properties | Use parent Studio Standard; separate from GTA mature audience; safe instruction, learner outcomes and age/privacy review before data collection |

## 3. Release confidence pipeline

**Gate A: Code and facts.** Build passes, static/schema tests green, source attribution present, no secrets, no loss of saved-data keys.

**Gate B: Real functionality.** Chromium and Edge at 1440px desktop and 390px phone; all main journeys; all relevant specialized flows; test scripts exit nonzero on first failure. Browser smoke alone is not proof that all buttons work.

**Gate C: Visual quality.** Images actually decode, hero/covers match approved quality and subject, mobile viewport reviewed in real screenshots including scroll/overlays, no inappropriate placeholders. Screenshot capture is evidence, not automatic approval.

**Gate D: Artifact and rights.** Actual production package, local assets, credits, privacy and security review, URL/deep-link/backup checks, documented remaining P2/P3 gaps.

**Gate E: Human review.** Owner checks exact SHA staging preview, approves art and interaction and authorizes one target merge. Only then verify deployment to development. Protected main has separate authorization. Safari on an actual iPhone gets a manual checklist and explicit limitations until executed.

If Gate B fails, do not allow later passing commands to mask failure. If an automated run is cancelled by a newer commit, record CANCELLED, not PASSED.

## 4. Priority order until the release candidate

1. Critical browser failures, user-data regressions, inaccessible markers, incorrect scope, mobile overflows.
2. Squalo/watercraft and Garage flows; catalog/weapon missing images; broken deep links and empty states.
3. GTA IV/TLAD/TBOGT data and route acceptance, Cayo stability and 13-map navigation.
4. All public pages' context-specific cover/hero presentation and 15 heist workspaces.
5. Additional data and feature parity where lawful and source-backed, Safari physical-device review and final film.
6. After owner-approved live release, optional secured sign-in only on explicit new owner request.

## 5. Per-change handoff template

- **Head & preview:** exact staging SHA / preview URL (only when real)
- **What changed:** linked file paths, user value, preserved features
- **Evidence:** source checks, exact workflow IDs, browser engines/widths, screenshots inspected
- **Data/art rights:** provenance and honest confidence; approved art retained
- **Blockers:** severity, player-visible impact and exact next action
- **Decision:** staging only / review requested / owner-authorized release
- **Rollback:** prior SHA and saved-data migration notes

## 6. Decision hygiene

The 2026-11-20 owner acceptance of earlier PR #68 is a historical fact, not permission to merge PR #70. Branch-specific and SHA-specific evidence must be fresh. Older pre-release GTA VI research wording and obsolete historical cover lists should be updated with dated evidence while preserving history; do not silently promote old claims. Elario Studios is **an original parent studio**, not a GTA-only or Rockstar-themed company.

This Playbook is deliberately short enough to use before every commit; the full Standing Charter and approved reference pack remain authoritative.
