# Elario Studios — Studio Quality & Creative Standard v2 (proposed)

**Status:** PROPOSED — for owner approval. **Applies to:** every Elario Studios production, current or future.  
**Purpose:** Build original, useful, trustworthy creative and technical experiences that feel like one premium studio without forcing unrelated products into one look or audience.

## A. Two-layer governance

Elario Studios is the independent parent creative/technology brand. Team Jura Atlas is one mature-game fan-companion product, not the definition of all Elario products. Each project inherits these studio standards and has its own product charter, art bible, audience classification, privacy model, architecture, and tests.

The latest explicit owner instruction outranks historical summaries or stale status claims. Existing owner-approved artwork and protected decisions are never silently overwritten. The current Team Jura Standing Charter and Site Completion Contract remain binding for Atlas. This document cannot authorize merges, sign-in, revenue use of others' IP, or deviations from those contracts.

## B. Elario's seven non-negotiable qualities

1. **Original creative identity.** Modern, cinematic, polished, intentional and recognizable as Elario. The E crest and approved violet/amber/gold identity remain mandatory for Team Jura Atlas; future Elario properties can have context-specific palettes and character systems rather than a GTA look.
2. **Real functionality.** Interactive features do what they promise. A trailer image is not a finished film; a schematic is not street navigation; a research record is not a verified map point; a mockup is not a deployed experience.
3. **Research and truthfulness.** Separate known facts from estimates, provisional research and creative fiction. Record sources, dates, confidence and rights/permission for each sourced claim and asset. AI-generated or human-created concepts must never masquerade as exact in-game or real-world evidence.
4. **People-first usability.** Guest-first where suitable, mobile-first touch targets, accessibility, clear navigation, useful empty/loading/error states, and reversible personal actions. No unnecessary downloads, mystery controls, broken buttons or misleading status messages.
5. **Private by design.** Minimize data collection, never commit secrets, obtain explicit consent for any account sync, and preserve user-controlled backups. Protect children's learning properties through separate audience-specific experiences and a dedicated privacy/legal review before collecting children's data. A public mature-game workspace must not automatically link to a children's learning experience.
6. **Engineering that survives growth.** Separate content/data from UI, assign stable world/project IDs, retain migration-compatible data schemas, test critical paths, document dependencies and rollback steps, and keep an actual versioned build/package. Optimize for future features without rebuilding working components unnecessarily.
7. **Earned quality claims.** Explicit evidence for source checks, runtime behavior, real browser tests, approved visual comparisons and owner release authority. "CI green", "artwork approved", "deployed", "done" and "feature parity" are different statements.

## C. Product families and audience boundaries

| Elario family | Audience | Product-specific requirements |
|---|---|---|
| Team Jura Atlas & future gaming tools | Mature-game audience | Scope by game and edition; accurate game-source labels, local progress, rights-aware fan project disclosures, mature-content guidance and no cross-world leakage |
| Elario Learning Worlds / educational cartoons | Family/children and educators | Age-appropriate visual and pedagogical standards, accessible narration/reading controls, curriculum review, safe interaction, parent-facing controls when relevant, no adult GTA characters/assets/content |
| Elario AI and software products | Relevant users/developers | Honest capability limits, tests of model output and data provenance, prompt-injection/privacy protections when external data is processed, accessible human override, explicit user authorization for external actions |
| Elario Original Stories & Media | Defined per production | Story/character bible, consent and likeness/music rights, clear version/shot status, actual playable deliverable testing, separated drafts from approved final art |

A single studio component system may share accessibility, security, typography fundamentals, data contracts and QA tools; it must not force one aesthetic, monetization strategy or audience identity across all families.

## D. Staged development workflow

**1 Brief → 2 Evidence → 3 Design → 4 Build → 5 Tests → 6 Real preview → 7 Owner sign-off → 8 Controlled release → 9 Monitor.**

- Brief: player/viewer/learner goal, audience, success criteria, constraints and source requirements.
- Evidence: source and asset-license ledger, confidence states and competitor/market observations used only as inspiration or for permitted reuse.
- Design: approved reference screens, context-specific images, responsive behavior, actual controls and states.
- Build: smallest reversible changes; preserve existing features, progress keys and approved assets.
- Tests: source/schema checks, relevant unit and integration tests, real browser flows, mobile overflow, image decode, accessibility and persistence.
- Preview: a built/deployed candidate tied to **one immutable commit SHA**, with desktop/phone screenshots and known limitations.
- Owner sign-off: explicit approval for that candidate and destination; old approval does not transfer to new commits.
- Release: reviewed PR, rollback path, deployment verification and release notes.
- Monitor: observe actual errors, broken images and post-release changes; prioritize corrective follow-up.

## E. Studio-wide definition of ready / done

**Ready for build:** problem and audience clear; approved art/spec reference or explicit unapproved placeholder status; technical approach and sources listed; acceptance criteria testable.

**Done for feature:** works for actual user; safe state and persistence; input errors handled; accessible touch/keyboard; assets and factual claims labeled and sourced; unit/integration tests + relevant desktop/phone browser checks passed; evidence tied to commit; gap and rollback documented.

**Done for release:** no critical or major unsolved user defects; required source/license and privacy checks; validated production artifact; real preview; visual approval; owner-authorized target-branch merge; live verification. Partial content can be released only with truthful labels and no broken core journey.

## F. Priority and release severity

- **P0 / STOP:** destructive user-data loss, credential exposure, security/privacy violation, deceptive legal/media claim, public-page outage or unauthorized release.
- **P1 / BLOCK:** broken primary navigation/action, incorrect GTA-world or audience data, unusable mobile controls, failed critical browser test, blank required imagery or inaccessible mandatory information.
- **P2 / FIX SOON:** imperfect page spacing, a noncritical missing individual detail, slower interaction, unsupported optional browser polish when disclosed and isolated.
- **P3 / BACKLOG:** enhancement or new premium feature that is not required for the current trustworthy release candidate.

Any P0/P1 blocks promotion. P2/P3 go into the public-facing/internal completion ledger with owner-visible status, not silently declared complete.

## G. Studio operating dashboard (measured, not guessed)

For every release candidate report: exact source head; affected projects and worlds; number of publicly linked pages checked; number of verified interactive flows; broken visible images; horizontal-overflow failures; data-source/rights exceptions; local-save/backup regressions; accessibility gaps; CI result by browser; visual sign-off; critical outstanding issues; reviewed artifact and preview links; explicit release decision. Do **not** use a percentage unless numerator, denominator, scope and date are supplied.

## H. Ownership and change control

Production changes require the product owner's explicit permission in context. For Team Jura, live Cloudflare-connected development and protected main are **both on hold for PR #70** pending owner approval of a real staging preview. Existing sign-in infrastructure is not permission to enable it. Staging/charter drafting is reversible and not a production release. Keep Elario identity, approved assets, user data and rights intact.

**Studio motto for Team Jura:** Many Crews. One Vision.  
**Working rule:** Build it. Package it. Test it. Refine it. Deliver it.
