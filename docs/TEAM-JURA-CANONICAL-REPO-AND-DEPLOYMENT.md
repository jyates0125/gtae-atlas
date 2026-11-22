# Team Jura Atlas — Canonical Repository, Deployment and Release Runbook

**Consolidated:** 2026-11-22 · **Authority:** [Standing Project Charter](TEAM-JURA-STANDING-CHARTER.md), [Site Completion Contract](ATLAS-SITE-COMPLETION-CONTRACT.md), Elario Studios operating charter and owner-approved Designed Brand.

## The only maintained GTAE source and the intended site

| Role | Location | Rule |
| --- | --- | --- |
| Canonical GitHub repository | `jyates0125/team-jura-atlas-preview` | Keep this repo name for now; the public name remains GTAE / Team Jura Atlas |
| Primary public GTAE URL | `https://gtae-online.pages.dev/` | Cloudflare Pages project `gtae-online`; real deployment must be observed independently |
| Cloudflare-connected production source | lowercase `development` | Reviewed feature PRs merge here; intended public release does **not** equal a finished Cloudflare deploy |
| Protected reference branch | lowercase `main` | Separately owner-approved release snapshots only; never automatically synchronize with each feature |
| Temporary work | `feature/*`, `docs/*`, `fix/*` | Branch from current `development`, review/test via PR, then archive only after safety audit |
| Legacy site | `https://team-jura-atlas-preview.pages.dev/` | Conditional **homepage-only** redirect; keep deep links for guest-progress export until migration review |

**A single repository with two permanent branches is the intended topology.** It does not imply deleting open PR heads, safety refs, incomplete research or an older Cloudflare project without separate review. No second GitHub repository is authoritative merely because a second site URL exists.

## Current verified GitHub checkpoint (2026-11-22)

- PR [#88](https://github.com/jyates0125/team-jura-atlas-preview/pull/88) merged into `development` at `f838b82d13c4b22954eedb93bdf3729be5defe84` (Atlas 28.8).
- PR [#89](https://github.com/jyates0125/team-jura-atlas-preview/pull/89) is subsequent staging work on the all-13-world directory; its final result and release gates must be checked at its **latest head** rather than assumed from this dated note.
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
5. Obtain the owner's approval for the **specific release candidate**, merge one reviewed PR into `development`, then verify Cloudflare production project's branch, successful deployment **commit SHA**, `atlas-build-identity.json`, `maps.html`, scripts, cache headers, navigation, data layers, progress/backup and old-site export.
6. If `atlas-build-identity.json` has `revision: null`, or the served SHA differs from the new `development` merge commit, mark deployment **UNVERIFIED**. This file is generated during the Cloudflare build and the source placeholder is not proof.
7. Separately schedule a **reviewed** `main` synchronization only after owner release approval and no staging regressions. Keep `main` protected and full history; no automatic branch mirroring.
8. Account, domain, cleanup and migration phases remain distinct. Before any destructive operation, inventory branches/repos, inspect unmerged content, verify backups and obtain explicit owner approval.

## Cloudflare configuration and troubleshooting

Expected Cloudflare Pages config: production branch `development`, command `node scripts/build-cloudflare.cjs`, output directory `public`, root `.`. The old project is not the canonical output. `_headers` should prevent sticky JS/CSS/HTML caches, but only inspecting real response headers and served asset bytes can prove whether visitors see a release.

When source branch is correct but the site looks old, check in order: deployment **project and production branch**, recent build status/SHA, build output artifact, `atlas-build-identity.json`, actual requested JS/CSS URLs and cache headers, then device cache/service worker. Do **not** merge `main` reflexively as a cache fix. A browser snapshot cannot establish source-version identity.

## Source/rightsholder and public-safety line

Attribution is mandatory but **does not itself grant permission** to reproduce unique imagery, maps or data. Preserve each actual license/grant and mark any transformed or independently entered work. Private research, credentials, private user exports or proprietary raw archives do not belong in a public repository, preview URL or Pages output. Report security defects through the canonical repo's private vulnerability-reporting path if enabled.

**Older PR #86** was a historical draft for the same cleanup; retain its audit as historical source, and avoid blindly merging outdated status lines. No branch/project deletion, production redeploy or rule change is authorized merely by this document.
