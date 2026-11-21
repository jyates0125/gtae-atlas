# Elario Studios — Studio Operating Charter v2 (PROPOSAL)
**Status:** Proposed for owner review; not yet the authoritative charter.
**Prepared:** 2026-11-20 (America/Chicago) · **Home:** Elario Studios · **First project:** Team Jura Atlas.
**Relationship:** Complements, never silently replaces, `docs/TEAM-JURA-STANDING-CHARTER.md`, `docs/ATLAS-SITE-COMPLETION-CONTRACT.md` and owner-approved Original Design Reference Pack.

## 1. Identity, product families and mission
Elario Studios creates original interactive worlds, useful software, learning tools, and cinematic stories. The standard is to **build, package, test, refine and deliver** usable experiences—not a screenshot, placeholder, unfinished demo, or unverified claim presented as complete.
- **Team Jura Atlas:** mature-audience fan companion, world-separated GTA map/player utility and an original Elario Studios presentation. **Many Crews. One Vision.**
- **Elario family and learning:** separate age-appropriate stories, interactive science, AI literacy and education experiences. Never silently combine kids' journeys, community, data capture or discoverability with the mature GTA family. Guardians' control, safeguarding and appropriate privacy/legal review are mandatory before public child-directed launches.
- **Future studio productions:** own product briefs, audiences, art references, testing, licences, asset ledgers and release approval. Reuse the engineering process; do **not** copy context-inappropriate GTA visuals or content into them.

## 2. Permanent quality principles
1. **Original identity:** preserve approved Elario E crest, typography, color and cinematic visual direction. Team Jura's violet/gold/amber scheme and its line “Many Crews. One Vision.” are specific approved identifiers, not universal boilerplate for every studio property. New properties must have approved separate art/characters.
2. **Usable before decorative:** every advertised control performs a real action; every screen has intentional loading, empty, offline and error states. User journeys should not depend on downloading JSON or ZIP files, installing software, or signing in unless essential.
3. **Truthful research:** record provenance, date, world/edition, and uncertainty. Never fabricate coordinates, specifications, current online rotations, screenshots, model meshes or completion claims. Distinguish source fact, inference, illustration and user-added content.
4. **Permission and IP:** official promotional media, fan-content discretion, community data and open-source code have different rights. For every external asset, document the exact intended use and rights basis. Attribution alone is not a licence. Honor removal/correction requests, embargoes and copyright requirements.
5. **Safe and private by design:** no client secrets, HTTP credential forms, silent personal-data sharing or unauthorized edits to canonical content. Minimize collection; offer guest-first, export and deletion/recovery choices. Secure HTTPS login only after its own audited, explicitly authorized rollout.
6. **Accessible and inclusive:** keyboard and touchscreen operation, useful focus indicators, named controls, text alternatives, contrast, sensible motion preferences and responsive layouts must be tested at representative sizes and real devices when available.
7. **Resilience:** broken image/CDN/network/service requests must degrade to honest original art, safe explanations or offline cached content, never blank layout, false imagery or inaccessible UI. Preserve saved progress with explicit migration tests.
8. **Professional engineering:** version control, focused PRs, reversible changes, dependency and licence reviews, reproducible builds, test evidence linked to immutable commit, performance budget based on measured baseline, no secrets in source.
9. **Creative integrity:** use distinct subject-specific art and context-appropriate stories. An approved image never becomes a generic placeholder across unrelated pages. Record approvals and review both desktop and phone rendering, not just source files.

## 3. Product-level ownership
Every active Elario project needs:
- **Product brief:** purpose, user audience and maturity, core experience, first release's success criteria, and deliberately excluded scope.
- **Design reference pack:** approved original art, hierarchy, theme, interactions, subject/era continuity, and per-screen visual acceptance examples.
- **Data / media register:** source, owner, licence or permission evidence, allowed uses, attribution, revision date, and fallback.
- **Definition of done:** reachable and interactive, useful/true, accessible, no save regression, image decode verified, responsive, browser QA, error/loading/empty handling, owner design signoff.
- **Release board:** evidence-level status and open blockers for each page, feature, world and user journey; test results belong to a specific SHA.
- **Decision log:** append-only dated decisions for scope, design and release permission. An older blanket approval does not authorize a later specific release.
- **Operations plan:** monitoring, source freshness/expiry, issue triage, backup/recovery, dependency maintenance and calm milestone notifications.

## 4. Evidence-based stage gates
`Idea → referenced design → approved design → implementation → source/rights reviewed → unit/static verified → real interaction and accessibility tested → visual/device reviewed → owner-approved release candidate → controlled release → monitored`.

The status **implemented** means only the code exists; it is not **verified**. A screenshot proves rendering at that viewport only. CI green proves only the suites executed at that exact commit. Published preview is not a live-branch merge. Release and owner approval must be independently recorded.

**Release hold triggers:** security/privacy violation, data loss or save migration failure, wrong content/world, broken primary flow, illegible/blank main visual or controls, unlicensed media, failing declared gate, missing evidence, or owner art rejection. Nonblocking work is explicitly listed as follow-up—never quietly labeled finished.

## 5. Change authority and safe automation
- Explicit latest owner instruction for the **specific project, staging head and deployment target** overrides older general merge statements while preserving all other compatible agreed rules.
- Only the owner may approve first-time public release, current release candidate to live, changes in intended audience, child-facing features, new signup or monetization. Developers and automations prepare reproducible evidence and staged proposals, never infer approval.
- Prevent unnecessary CI churn: batch related changes, fix unit/static blockers, **freeze one candidate SHA**, execute required end-to-end suite, document failures, then accept/reject that SHA. Cosmetic changes during the frozen run require a new candidate/review.
- Use existing scheduled reporting, not overlapping hourly check-ins: exception alerts for blocked releases, stale source-critical data or a complete evidence package needing an owner decision; otherwise milestone summaries.

## 6. Adoption
This document is a **proposed operational foundation**. It becomes binding only after a distinct owner approval. Until then the Standing Charter, Completion Contract, current PR-specific owner instructions and approved reference artwork remain authoritative. Keep a concise studio charter, separate product annexes, an append-only decisions register and machine-readable release-board evidence rather than indefinitely extending one document.
