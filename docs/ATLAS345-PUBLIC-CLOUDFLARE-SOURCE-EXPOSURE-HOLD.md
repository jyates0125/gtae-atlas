# Atlas 34.5 — STOP: public Pages sites serve raw repository source

**Verified:** 2026-11-23, GitHub Actions run [#45167768252](https://github.com/jyates0125/team-jura-atlas-preview/actions/runs/45167768252) with a read-only 12 KB bounded probe per nonsensitive source path. Report artifact `atlas345-cloudflare-public-source-boundary`. Do not publish candidate #98 or synchronize protected `main` while this hold applies.

## Confirmed on BOTH public sites

- `https://gtae-online.pages.dev/` and `https://team-jura-atlas-preview.pages.dev/` each return HTTP 200 and the **exact file contents** of `scripts/build-cloudflare.cjs`, `docs/TEAM-JURA-STANDING-CHARTER.md`, and `.github/workflows/team-jura-release.yml` (the probe compares safe fingerprints and does not log the responses).
- Both publish `atlas-build-identity.json` with `revision: null` and no generated timestamp, not the output from the required build script.
- This proves the sites currently serve repository-source paths which our audited `public/` build excludes. It **does not** prove that any credential or private file was leaked: the audit purposely did not request potentially sensitive paths. Avoid overclaiming either way.
- Under Cloudflare Pages build configuration, the site build output should be the curated `public/` directory, not the Git checkout root. This is a Cloudflare project-setting/deployment issue, not a change fixed by syncing `main`.

## Immediate safe remediation — BOTH Pages projects

In the Cloudflare dashboard, open **Workers & Pages** and select each project **separately**: `gtae-online` and `team-jura-atlas-preview`. Check its production source and edit **Settings → Builds & deployments** (or **Build**, depending on dashboard UI):

| Setting | Required value |
| --- | --- |
| Git repository | `jyates0125/team-jura-atlas-preview` |
| Production branch | lowercase `development` |
| Build command | `node scripts/build-cloudflare.cjs` |
| Build output directory | `public` |
| Root directory | repository root, usually blank or `/` |
| Node.js | current supported Node version, use 22 if a selector/environment override is required |

Do not use `.` or repository root as the **output directory**. Cloudflare supplies `CF_PAGES_COMMIT_SHA` automatically when the Pages build runs. The repository's build script fails if required site assets are missing and copies only its explicit filtered output to `public/`.

Because an existing deployment may remain live while settings change, inspect the **new** Cloudflare deployment logs and the active production deployment. If necessary, use the dashboard's redeploy/retry of the **existing reviewed** development commit `1d86d5c28d63aa6cfd14f48a5da3ed61bba58fcd` first. Avoid deploying unreviewed staging or changing `main` as a remediation workaround. If the public exposure creates urgent risk, restrict public access/disable production delivery in Cloudflare until corrected; do not delete projects or guest backups.

## Verification before any release

1. Both `atlas-build-identity.json` endpoints have a **40-character Git SHA** equal to the expected current `development` deployment and a generated ISO timestamp, not `null`.
2. The formerly exposed `/scripts/build-cloudflare.cjs`, `/docs/TEAM-JURA-STANDING-CHARTER.md`, and `/.github/workflows/team-jura-release.yml` **must no longer return the exact raw source**. A normal 404 or an unrelated same-origin HTML fallback is acceptable.
3. Both sites load the correct `maps.html`, Story, Online, VI and Garage routes, preserve old origin export/deep links, and serve scoped CSS/JS and the approved 39-second music-only teaser.
4. Run the full exact-head Chromium + Edge + validated ZIP gate on the release candidate and confirm source/rights/media and real iPhone Safari owner review. Only then merge the reviewed PR into `development`.
5. Compare the **live** served SHA with that newly merged `development` SHA on both origins. Once good and separately approved, sync protected `main` by PR (no force-push, no accidental historical-branch deletion).

## Security follow-up

Review whether the published repository root contains any private material and, if any credential was ever included, revoke/rotate it using the appropriate provider. Do not publish potentially sensitive paths or contents in a diagnostic log, issue or pull request. No user collection progress, authentication setting or live account data was touched by this audit.

**Owner instruction:** release to `development` first, then protected `main` only when it is actually good. This explicitly **does not** waive production source-exposure, identity, tests or device acceptance gates. Both Cloudflare projects must be corrected.

References: [Cloudflare build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [Cloudflare Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/).
