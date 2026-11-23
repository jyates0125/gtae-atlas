# Team Jura Atlas — Canonical Repository, Deployment and Release Runbook

**Consolidated:** 2026-11-22 · **Authority:** [Standing Project Charter](TEAM-JURA-STANDING-CHARTER.md), [Site Completion Contract](ATLAS-SITE-COMPLETION-CONTRACT.md), Elario Studios operating charter and owner-approved Designed Brand.

## The only maintained GTAE source and the intended site

| Role | Location | Rule |
| --- | --- | --- |
| Canonical GitHub repository | `jyates0125/team-jura-atlas-preview` | Keep this repo name for now; the public name remains GTAE / Team Jura Atlas |
| Primary public GTAE URL | `https://gtae-online.pages.dev/` | Cloudflare Pages project `gtae-online`; real deployment must be observed independently |
| Official Cloudflare production source | protected lowercase `main` | **Only** reviewed and owner-approved releases publish to `gtae-online.pages.dev`; verify actual live SHA |
| Working and test branch | lowercase `development` | New features and source research are staged and checked here; Cloudflare preview only, never official GTAE production |
| Temporary work | `feature/*`, `docs/*`, `fix/*` | Branch from current `development`, review/test via PR, then archive only after safety audit |
| Old Cloudflare project | `https://team-jura-atlas-preview.pages.dev/` | Duplicate project can now be retired by owner; do NOT delete the single canonical GitHub repo or its branches |

**A single repository with two permanent branches is the intended topology.** It does not imply deleting open PR heads, safety refs, incomplete research or an older Cloudflare project without separate review. No second GitHub repository is authoritative merely because a second site URL exists.

## November 23, 2026 — owner-approved final GTAE deployment topology (SUPERSEDES November 22 site branch roles)

**The official live URL remains `https://gtae-online.pages.dev/`.** The Cloudflare Pages `gtae-online` project now builds protected `main` for production and `development` for development/preview only. The older Cloudflare `team-jura-atlas-preview` project is no longer needed by the owner and can be retired separately in the Cloudflare dashboard; deleting it must not remove the GitHub repository, `main`, `development` or staging PRs. No public studio email addresses until separately approved.

- **Validated GTAE main:** release `94a74150a5d7eb3d6b6efa77097a7ce7c13be8b4` (PR #156), secure build output `public/`, protected legacy-source path redirects on primary main only. Exact live SHA and route tests passed in [GitHub audit #45185841893](https://github.com/jyates0125/team-jura-atlas-preview/actions/runs/45185841893); previously exposed `/scripts/`, `/docs/` and `/.github/` no longer returned raw source, including official alias and immutable release URL.
- **Current baseline synchronization:** [PR #157](https://github.com/jyates0125/team-jura-atlas-preview/pull/157) merged verified production `main` back to `development` as `393c4a38ad6a49e37cd3cde3b11b1fcb5b0737b0`. Both Git trees verified byte-identical: `d8b509390b3a89fc4aed57a045d169c4c5d05e59`. Later development commits are permitted to differ; never demand permanent file parity during feature work. Only main is public production.
- **Unreleased integrated staging** PR #98 remains a draft feature candidate and must merge current production security baseline before any future release. Preserve owner native iPhone Safari/design approval, complete source rights and browser/ZIP checks for major releases.
- **Deployment facts:** two separate Cloudflare Pages projects can create preview builds from one GitHub repo. Cloudflare Pages project settings/removal require account-side access; the connected GitHub app does not directly control or delete Pages projects. The temporary secure legacy typo forwarding entry point is `scripts/build-cloudfare.cjs` and canonical script `scripts/build-cloudflare.cjs`; only filtered `public/` may be deployed.
- **GitHub repo name:** `jyates0125/team-jura-atlas-preview` stays unchanged until the owner separately renames it and verifies reconnecting Cloudflare and saved auto-build references.

Historical branch descriptions and Nov 22 release instructions below remain for audit background but **do not override this November 23 production/main policy**.

## Current verified GitHub checkpoint (2026-11-22)

- PR [#88](https://github.com/jyates0125/team-jura-atlas-preview/pull/88) merged into `development` at `f838b82d13c4b22954eedb93bdf3729be5defe84` (Atlas 28.8).
- PR [#89](https://github.com/jyates0125/team-jura-atlas-preview/pull/89) passed full Chromium, Edge, focused checks and a validated ZIP, then merged the all-13-world directory improvement into `development` as `4f766df1d5e1ecd97eb1bb739314d2def9916e20`. Cloudflare production remains **UNVERIFIED** without observing its actual deployment SHA.
- **Release sync hazard found November 22:** PR [#90](https://github.com/jyates0125/team-jura-atlas-preview/pull/90) was originally built using PR #88's tree (`69a02aca4163e43a5f263eedbc299cd92ebbce8e`), before PR #89 entered `development`. Its initial green checks cannot prove parity with current `development`. After documentation PR #91 is approved/merged, advance the existing protected-main sync candidate using the *then-current* `development` tree, retain both commit histories, rerun exact-head CI, compare tracked trees and verify live site separately. Do not merge the stale tree.
- On inspection, GitHub reports the default as lowercase `main`. A historical accidental uppercase `Main` ref still exists. **Do not rename or delete it in a routine build.** Recheck GitHub default, rulesets, active PR bases and the recovery refs before any owner-approved cleanup.
- Branch histories diverge. A historical statement that `main` and `development` had identical trees at Atlas 22.0 does not establish parity after Atlas 28.8. Compare current **files**, not only commit counts, and never force-push to mask divergence.
- [The completion board](ATLAS-2150-COMPLETION-BOARD.md) is an evidence register, not a declaration of completion.

## Must-preserve product decisions

1. **Guest-first:** no public login/signup/cloud save activation until the owner explicitly opens that phase after site completion; keep private guest progress, export/import, Forge ownership, settings and backup data.
2. Preserve the Elario violet, amber and gold original brand, E crest, approved world/portrait/heist media, `Many Crews. One Vision.`, all 13 destinations, relevant 15 heist workspaces and accessible mobile controls.
3. Keep GTA V Story, GTA Online, GTA VI, IV/episodes and every classic game strictly scoped. GTA VI was released on November 19, 2026; an individual **community** location remains unverified until game/official evidence supports that claim.
4. Treat YANIS v18 / GTADB and current community pins as a **versioned, attributed reference**, never as a verified Rockstar map. Do not replace original map layers merely because another site displays a newer count. Source-specific rights, data revisions and geometric transforms must be documented; preserve unpositioned search-only records.
5. Maintain source license notices, corrections workflow, public credits, guest content boundaries, and no fabricated coordinates, real-time rotations, game meshes or test results.
6. No unattended GitHub edits/PR merges or public sign-in enablement. Do not infer that a scheduled report, a staging PR or successful tests constitute owner acceptance.

## Review, package, release, verify

1. Read **actual** repository heads/open PRs, charter, completion ledger and approved designed-brand art; identify the smallest safe set of changes.
2. Work on a short-lived branch from the current `development` head; never from uppercase `Main` or a historical release tag. Preserve rollback safety refs and localStorage/IndexedDB schemas.
3. Require source integrity, rights/provenance, static regression, focused affected-feature tests, full Chromium + Edge desktop/mobile, offline where touched, built-site links/media checks and a validated static ZIP. Tests must correspond to the candidate's **exact** head SHA.
4. Inspect actual screenshots and control interactions at phone and desktop sizes, plus real iPhone Safari and owner acceptance where required. CI does not replace device or owner visual review.
5. Obtain the owner's approval for the **specific release candidate**, first merge a reviewed feature into `development` for nonproduction QA, then prepare a separately reviewed production PR into protected **`main`**. Verify the real main deployment SHA, `atlas-build-identity.json`, `maps.html`, filtered scripts/assets, cache headers, navigation and guest progress/backup.
6. If GTAE production `atlas-build-identity.json` has `revision: null`, or the served SHA differs from protected **`main`**, mark deployment **UNVERIFIED**. This file is generated during the Cloudflare build and the source placeholder is not proof.
7. Promote reviewed releases from `development` to protected **`main`** only after owner approval, full source/rights/Chromium/Edge/ZIP gates and Safari acceptance. After a production release, merge `main` back into `development` to retain the live security baseline; no force-push or automatic production mirroring.
8. Account, domain, cleanup and migration phases remain distinct. Before any destructive operation, inventory branches/repos, inspect unmerged content, verify backups and obtain explicit owner approval.

## Cloudflare configuration and troubleshooting

Expected official GTAE Cloudflare Pages config: production branch **`main`**, command `node scripts/build-cloudflare.cjs` (legacy typo `build-cloudfare.cjs` also supported), output directory **`public`**, root repository root/blank. The old project is not the canonical output. `_headers` should prevent sticky JS/CSS/HTML caches, but only inspecting real response headers and served asset bytes can prove whether visitors see a release.

When source branch is correct but the site looks old, check in order: deployment **project and production branch**, recent build status/SHA, build output artifact, `atlas-build-identity.json`, actual requested JS/CSS URLs and cache headers, then device cache/service worker. Do **not** merge `main` reflexively as a cache fix. A browser snapshot cannot establish source-version identity.

## Source/rightsholder and public-safety line

Attribution is mandatory but **does not itself grant permission** to reproduce unique imagery, maps or data. Preserve each actual license/grant and mark any transformed or independently entered work. Private research, credentials, private user exports or proprietary raw archives do not belong in a public repository, preview URL or Pages output. Report security defects through the canonical repo's private vulnerability-reporting path if enabled.

**Older PR #86** was a historical draft for the same cleanup; retain its audit as historical source, and avoid blindly merging outdated status lines. No branch/project deletion, production redeploy or rule change is authorized merely by this document.
