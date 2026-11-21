# Team Jura Atlas — Canonical Repository, Deployment and Branch Plan

**Status:** Owner-directed infrastructure cleanup, 2026-11-21. **Authority:** [Standing Project Charter](TEAM-JURA-STANDING-CHARTER.md) and [Site Completion Contract](ATLAS-SITE-COMPLETION-CONTRACT.md). This file is the current operational guide; older README deployment notes are historical.

## One source of truth

| Role | Canonical target | Policy |
| --- | --- | --- |
| Team Jura working source | `jyates0125/team-jura-atlas-preview` | The one repository to maintain; the GitHub repository name need not match the public site name |
| Visitor-facing site | `https://gtae-online.pages.dev/` | Primary GTAE site; Cloudflare Pages project `gtae-online` |
| Live production source | `development` | The **existing lowercase** branch, integrated into GTAE's production deployment |
| Reference/release source | `main` | The **existing lowercase** branch, protected and updated only by separately approved release PRs |
| New work | `feature/<topic>` or `fix/<topic>` | Short-lived staging branches based on current `development`; PRs target `development` |
| Old Cloudflare project | `team-jura-atlas-preview.pages.dev` | Legacy entry and guest-progress export path; redirect homepage only after verifying deployment, do not casually delete |
| Old GitHub repositories | Investigate individually | Their existence, accessibility, domain links and uniquely stored files require confirmation; do not assume they are synchronized or safe to delete |

**Two permanent branches do not mean prohibiting temporary feature, Dependabot, safety or release branches.** Those exist only while needed. Keep the canonical deployment and release names stable; never change a branch name to change the default branch.

## GitHub protection — binding

- Use **GitHub Settings → General → Default branch** to select existing lowercase `main`. Do **not** click **Rename branch**. The default branch governs GitHub navigation and default-branch targeting; it does not change Cloudflare's production-branch setting.
- Keep ruleset **Protect Team Jura Atlas Main** (ID `27253290`) active for `main`; it currently targets `~DEFAULT_BRANCH`. It only protects lowercase `main` while lowercase `main` is the GitHub default. The owner must confirm settings after restoring default.
- Keep **Protect Team Jura Dev Branch** (ID `27798960`) active and explicitly targeting `refs/heads/development`. Both rulesets should prevent deletion and force pushes and require a pull request; bypass lists empty; zero required reviewer approvals is an intentional solo-maintainer setting, **not** a waiver of actual owner acceptance or quality checks.
- Do not enable **Restrict updates** or **Restrict creations** without designing the permissions; those settings can block all routine merges. Do not accidentally require linear history when merge commits are part of the release policy.
- Before considering mandatory status-check branch rules, confirm the exact stable check names and that both Chromium and Edge, source audit, and validated artifact gates work on a new PR; avoid deadlocking deploys through names that do not exist.
- Revalidate `main` and `development` protection immediately after editing the GitHub default branch, branch names or rulesets. The GitHub integration used for builds/PRs lacks repository administration access; an owner must change Settings.

## Recovery state from the November 21 rename mistake

The user inadvertently renamed `development` to **`Main`** (capital M). This is a separate branch name, **not** lowercase `main`. Subsequently, `development` was recreated at the exact validated Atlas 22.0 commit, and the ten open PRs that GitHub had redirected to `Main` were retargeted to `development`.

Observed at documentation time:

| Branch | Head | Observed condition |
| --- | --- | --- |
| `development` | `aa9940482a913505185dac2ce5de66b850df5fd8` | Restored, protected by explicit development ruleset; Cloudflare's last owner-confirmed GTAE production commit |
| `main` | `fcfda6a6ee3a227e43367f6effbfd49a6d5e7c08` | Intended protected reference release; **temporarily unprotected while default branch remains `Main`** |
| `Main` | `aa9940482a913505185dac2ce5de66b850df5fd8` | Accidental uppercase copy and current GitHub default; do not use as permanent branch |
| `safety/development-pre-atlas220-20261121` | `814a9876e95f36269960f009e0acfe3c49290320` | Recovery backup — preserve |
| `safety/main-pre-atlas220-20261121` | `dd8c69d41ba14c982c04bf9d543e962422592726` | Recovery backup — preserve |

The `main` and `development` release trees were verified byte-identical at `713de3cae1a1f5d2ca604c1291cc8ce516ecf652` at the Atlas 22.0 sync. Their commit hashes differ because their histories are separate.

**Immediate order:** (1) change GitHub's default branch to existing `main` in **Settings**, without renaming anything; (2) verify both named branches protected, all open PR bases correct and GitHub Actions; (3) verify Cloudflare production project is still watching **development**, build command `node scripts/build-cloudflare.cjs`, output `public`; (4) check live browser behavior and older-site redirect; (5) only after these checks, consider removing the redundant uppercase `Main`, with explicit owner approval and a rollback reference. Never delete it while it is default.

## Branch and repository cleanup policy

On 2026-11-21 the canonical repository had **95 branch refs**. See the full dated [branch cleanup inventory](TEAM-JURA-BRANCH-CLEANUP-INVENTORY.md) for all names, head SHAs and 10 active PR head refs. That count includes many old merged/release/feature branches, open PR heads, Dependabot branches, and important safety backups. This count is an observed snapshot, not an authorization to delete anything.

1. Keep `main`, `development`, every currently active PR's head, and every safety/rollback ref.
2. Inventory the remaining branches with SHA, most recent commit, merged-into status, active PRs, owner approval, and any unmerged files or changes.
3. Mark candidates **review**, **keep**, **archive** or **safe to delete**; GitHub's automatic “merged” label is insufficient when the work was selectively integrated.
4. After backups and owner acceptance, remove genuinely obsolete remote branches individually or in a reviewed small batch. Never force-push or rewrite history as cleanup.
5. Other GitHub repositories and Cloudflare projects must be audited separately. `jyates0125/leonida-explorer` returned 404 through the current GitHub connection, so its current state is **unknown**, not proven deleted. A second Cloudflare Pages project is not proof of a second source repository.

## Cloudflare and visitor safety

- Cloudflare owner screenshots verified GTAE **production = development, commit `aa994048`, successful**, and showed newer `main` commit as a **preview**. A GitHub merge alone does not establish Cloudflare deployment success; inspect the actual Cloudflare deployment, branch, SHA, status, artifact and public mobile site.
- The old Pages project uses a conditional homepage redirect to GTAE only if its build environment matches the original project. Do not assert all older paths/sites redirect. Preserve `/atlas-account.html` on the old origin so guests can manually export localStorage progress; cross-origin storage cannot migrate automatically.
- The site remains public/guest-first over HTTPS. Public sign-in and cloud sync are **disabled**. No login on HTTP or an embedded page; never expose secrets in GitHub, HTML, frontend JS, Cloudflare build outputs or public research routes. Before enabling future accounts: verified HTTPS, trusted server-side authentication and authorization, parameterized queries, ownership/RLS checks, CSRF/session defenses, rate limiting, abuse protection and independent security tests. A browser-side HTTPS guard is not by itself complete account protection.
- An optional **future** GitHub repository rename (e.g. `gtae-atlas`) is a separate planned migration, not part of current cleanup. It requires verified Cloudflare Git integrations, workflow/action references, attribution URLs, redirects, documentation and backups; renaming the repository does not rename the public website.

## Release runbook

1. Read charter, approved art, completion contract and the latest active GitHub branch/PR head.
2. Work in a short-lived staging branch **from development**; do not target uppercase `Main`, an older repo, or the GitHub default reflexively.
3. Run source/rights audits, mobile & desktop Chromium/Edge tests, exact-head Cloudflare payload checks and the validated ZIP. Review rendered screenshots against the approved Elario visual reference.
4. Present the real preview to the owner and obtain **separate explicit approval** to merge a specified PR into live `development`; no auto-merge.
5. Confirm GitHub PR merged, observe Cloudflare production deployment with expected SHA and test actual served pages, controls and mobile state.
6. Update protected `main` only after separately approved, tested release sync; protect history, preserve backup refs and avoid reviving legacy layouts.
7. Recheck old-homepage redirect and backup/export behavior before retiring or redirecting old public URLs.

**Operational record:** GitHub issue [#81](https://github.com/jyates0125/team-jura-atlas-preview/issues/81) stores the Atlas 22.0 release/branch recovery history. Older charter milestones remain valuable for design, content and provenance but their previous branch/PR/SHA status is historical where this guide explicitly supersedes it.
