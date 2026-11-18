# Team Jura — full GitHub branch comparison
Date: 2026-11-15 · Repository: `jyates0125/team-jura-atlas-preview`

Information from GitHub REST tree and compare operations. The connected GitHub app can read this repository, but direct writes returned 403; these are not deployment results.

## Production and development

| Branch | Files | HTML | JS | Contents (approx) | GitHub tree |
| --- | ---: | ---: | ---: | ---: | --- |
| `main` | 229 | 50 | 36 | 8.70 MB | `a77af888ec259897ef4630d7aab8fffc1236b5bb` |
| `development` | 379 | 60 | 64 | 15.26 MB | `5689876565af2a248b1e230c77fbdaedb43bd85b` |

`development` adds 150 files compared with `main`, changes 54 existing files, and drops no files in this tree snapshot. The histories nevertheless diverged: development is 27 commits ahead and 4 behind main. **Do not automatically merge main into development.** The integrated 9.8C release package contains 65 HTML pages, including latest 9.8B features and restored 7.4.1 cinema assets.

## Other branches checked

| Branch | Files | HTML | JS | Notes |
| --- | ---: | ---: | ---: | --- |
| `jyates0125-patch-1` | 228 | 50 | 36 | Old, divergent; changes workflow `atlas88-apply.yml` compared with development. |
| `jyates0125-patch-2` | 228 | 50 | 36 | Old, divergent; changes `atlas93-apply.yml`. |
| `jyates0125-patch-3` | 229 | 50 | 36 | Old, divergent workflow changes, including `atlas97-one-upload-apply.yml`. |
| `jyates0125-patch-4` | 229 | 50 | 36 | Old, divergent workflow changes; not a production candidate. |
| `dependabot/github_actions/actions/checkout-7` | — | — | — | Ahead 1, behind 29 relative to development; workflow-only PR context. |
| `dependabot/github_actions/actions/setup-node-7` | — | — | — | Ahead 1, behind 29; workflow dependency only. |
| `dependabot/github_actions/actions/setup-python-7` | — | — | — | Ahead 1, behind 29; workflow dependency only. |
| `dependabot/github_actions/actions/upload-artifact-7` | — | — | — | Ahead 1, behind 29; workflow dependency only. |

The Dependabot branches were compared through GitHub's compare API; full content trees were not directly enumerated because that endpoint rejected slash-containing ref paths. They should be handled as ordinary dependency PRs, not site releases.

## Release workflow decision

Keep `main` untouched. On `development`, replace obsolete auto-applying workflows with `team-jura-release.yml` and `team-jura-data-review.yml` (read-only review). The new release CI validates source, builds clean `public/`, performs desktop/mobile Chromium and Microsoft Edge smoke tests, and only then attaches the validated production artifact. Cloudflare Pages' Git push trigger runs independently and must not be mistaken for a pass of GitHub CI.

## Cloudflare limitation

Cloudflare project build settings and live deployment are not available through the current session's connected tools. To deploy from GitHub use Pages **framework None**, **build `node scripts/build-cloudflare.cjs`**, **output `public`**, root `.` and the user-approved production branch `development` only when preview QA has passed. If `development` is already the production branch, its push can publish before the CI quality gate finishes; protect the deployment until manual approval.

## Security and future expansion

No sign-in or backend account flow is part of this release. Configure Cloudflare HTTPS-only routing before launch. Do not collect credentials over HTTP. Optional donation buttons are future work and should not change the free-to-use experience. Existing browser-local progress keys are intentionally preserved.
