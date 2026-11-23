# Atlas 35.1 — one-public-site main-production deployment activation

**Date:** 2026-11-23. **Intent:** emit a guarded Git commit containing a non-published Cloudflare command compatibility entry point and deployment runbook on protected `main` to trigger Cloudflare Pages Git integration after owner switched the GTAE project's production branch from `development` to `main`. No browser-served HTML, site JavaScript, maps, artwork, localStorage keys, user credentials, accounts or emails change in this commit. The only new script is a server-side build-entry compatibility shim, plus its offline test and focused CI. The production builder explicitly excludes `docs/` and `scripts/` from its `public/` output.

## Why this commit exists

Cloudflare dashboard screenshots supplied by owner show `gtae-online.pages.dev` still running the *old* November 22, 2026, 8:36 AM deployment from `development` SHA `1d86d5c28d63aa6cfd14f48a5da3ed61bba58fcd`, created before build configuration was corrected. This old production deployment returned ungenerated `atlas-build-identity.json` and directly served source trees such as `scripts/`, `docs/` and `.github/`. Changing the project's branch-control field is not proof that a *new* production deployment was created.

The owner has requested one official GTAE Pages site with production `main`, `development` for development, and the old `team-jura-atlas-preview` Pages project retired after successful verification. GitHub `main` and `development` had identical source tree `074292dd22793b9e6101faa8b938dbb71ea0b662`, despite different commit histories. Therefore no risky source merge/reset is warranted merely to align site contents.

Cloudflare Pages Git integration automatically builds new commits pushed to its configured production branch. A reviewed PR into `main` adding the internal runbook plus a tiny compatibility shim is a minimal, visible, auditable way to request a fresh production build without publishing unfinished integrated staging work. The previously observed wrong dashboard command `node scripts/build-cloudfare.cjs` can now run safely through `scripts/build-cloudfare.cjs`, which invokes canonical `build-cloudflare.cjs` and generates the filtered `public/` tree. The spelling in Cloudflare should still be corrected when feasible; the shim is a defense against a stale or mistyped dashboard field.

## Required verified production settings in Cloudflare dashboard (owner-controlled)

- Project: `gtae-online`.
- Production branch: `main` with automatic production builds enabled.
- Build command: **`node scripts/build-cloudflare.cjs`** (not `build-cloudfare.cjs`).
- Build output: **`public`**, never repository root `.`.
- Root directory: repository root (empty).
- Connected GitHub repository: `jyates0125/team-jura-atlas-preview` until owner separately renames it and confirms webhook re-link.

This commit cannot itself change Cloudflare account-side settings. It safely supports both known command spellings using the exact same filtered production builder. If the new production build fails due to other dashboard errors, report the exact failure instead of repeatedly pushing commits.

## Mandatory acceptance checks

1. Inspect Cloudflare `gtae-online` → Deployments → **Production** for the newly merged **`main`** SHA and successful **build** and **deploy** steps; do not confuse with a preview deployment, including `ops/atlas35x` branches.
2. Verify `https://gtae-online.pages.dev/atlas-build-identity.json` has a 40-character SHA matching this new `main` commit and an ISO generated timestamp.
3. Verify `https://gtae-online.pages.dev/scripts/build-cloudflare.cjs`, `/docs/TEAM-JURA-STANDING-CHARTER.md`, and `/.github/workflows/team-jura-release.yml` **do not** return raw repository source; normal 404 or unrelated fallback is acceptable.
4. Smoke-check homepage, all-map navigation, Story, Online, VI, Garage, source credits and guest export without changing data. Confirm published `_headers` are active.
5. Keep the old Cloudflare site separate until user has accepted GTAE. Old Pages site retirement is a Cloudflare dashboard action and not implied by this commit.
6. Keep the newer multi-feature staging PR #98 out of production until full release qualification (Chromium, Edge, ZIP, sources/rights and owner Safari design review). No email mailbox/contact address may be published until the owner approves and it is tested.

**Rollback:** If Cloudflare builds fail, the existing production deployment normally remains served; inspect the failing new deployment and fix its dashboard configuration. No destructive Git revert or branch force-push is necessary to roll back this internal compatibility commit.

*Many Crews. One Vision.*
