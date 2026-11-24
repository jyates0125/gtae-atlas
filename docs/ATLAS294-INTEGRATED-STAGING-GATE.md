# Atlas 29.4 — combined GTAE staging candidate (not published)

**Reviewed common baseline:** `development` `1d86d5c28d63aa6cfd14f48a5da3ed61bba58fcd`.

**Source heads integrated:** Leonida optional Day map / local poster pin research [PR #94](https://github.com/jyates0125/team-jura-atlas-preview/pull/94) `ac30436`; mobile dashboard, saved-build finder and share controls [PR #96](https://github.com/jyates0125/team-jura-atlas-preview/pull/96) `9c002f5`; Garage↔Forge and character portraits [PR #97](https://github.com/jyates0125/team-jura-atlas-preview/pull/97) `0aa33eb`.

This is a **draft integration branch only**. It does not authorize publishing, protected main synchronization, signup/cloud accounts or a claim that the Site Completion Contract is finished.

## Five overlapping-file resolutions

1. `atlas93-garage.js`: union non-overlapping edits to preserve the saved-build filter, per-model share link and accessible Back focus from PR #96, plus the Forge handoff, accurate class descriptions and latest-cross-tab storage merge from PR #97.
2. `atlas222-characters.js`: use PR #96's more complete exact-ID profile/world/classic-edition/search reconciliation, which subsumes PR #97's earlier exact-Lamar deep-link adjustment; keep both source and real-browser tests.
3. `.github/workflows/team-jura-release.yml`: preserve PR #94's official-poster and Day-map tests, and PR #96's **manual-only full release gate**, avoiding expensive unrelated full browser and ZIP runs on routine PR updates.
4. `docs/TEAM-JURA-STANDING-CHARTER.md`: include PR #94's current approved protected-main release checkpoint plus PR #96's scoped-CI owner direction.
5. `docs/ATLAS-2150-COMPLETION-BOARD.md`: retain the PR #94 release state and both PR #96 and #97 append-only acceptance checkpoints.

## Integration acceptance still required

- Focused automated build, source contracts and real Chromium journeys must pass at the **combined** SHA; passing individual source PRs does not certify this integration.
- Before an approved release, run the full Chromium+Edge mobile/desktop, Cloudflare artifact and validated ZIP gate manually, including Cayo/heist checks.
- Visually review at 390px phone and 1440px desktop; verify actual iPhone Safari interactions, map tiles, poster pin privacy, Garage ownership and local progress.
- **Owner preview approval before merge** to Cloudflare-connected `development`; separate approval and current tree parity before protected `main` changes. Verify actual Cloudflare deployment SHA afterward.
- Complete remaining thirteen-map evidence, subject-specific Lamar portrait, visual likeness review of Agent 14/CJ/Claude, navigation consistency, credits/asset rights and all charter workstreams.

Never treat public availability or attribution as a license to copy third-party proprietary maps.
