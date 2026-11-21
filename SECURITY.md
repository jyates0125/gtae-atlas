# Security Policy — Elario Studios Team Jura Atlas (updated 21 November 2026)

## Supported website and source

The maintained public website is **https://gtae-online.pages.dev/**, deployed from the canonical GitHub source repository **https://github.com/jyates0125/team-jura-atlas-preview**.

- `development` (all lowercase) is Cloudflare's **live production branch**. It requires a pull request and successful release acceptance, not direct changes.
- `main` (all lowercase) is the separately protected **reference/release branch**. Its GitHub default-branch protection is dependent on correct default-branch settings; do not rename branches when selecting a default.
- `feature/...` and `fix/...` branches are temporary staging work; old `atlas-7-dev` and prior repository references are **historical**, not current instructions.
- Current operational branch/repository recovery and cleanup: [Canonical Repository & Deployment Plan](docs/TEAM-JURA-CANONICAL-REPO-AND-DEPLOYMENT.md). The original Studio design/release rules remain in the [Standing Project Charter](docs/TEAM-JURA-STANDING-CHARTER.md).

## Report vulnerabilities privately

**Never open a public issue containing an exploitable secret, private customer data, credentials or detailed exploitation steps that would expose visitors.**

Use GitHub **Report a vulnerability / private security advisory** for this repository, if available:
https://github.com/jyates0125/team-jura-atlas-preview/security/advisories/new

If the feature is unavailable, contact the repository owner privately before disclosure. For ordinary non-sensitive defects, use
https://github.com/jyates0125/team-jura-atlas-preview/issues

Include the affected website URL, branch and commit, browser and device, minimal non-sensitive reproduction, expected impact and mitigation. Do not post credentials, access tokens or another visitor's personal data. No unverified response-time guarantee is made.

## Current defensive boundaries

- GTAE is a **public HTTPS static site** with optional guest play. Public account registration, passwords and cloud-save login are **disabled**. Guest progress lives in the user's browser unless deliberately exported; cross-origin migration from the old project requires an explicit backup/import.
- The staged future-accounts transport has a **client-side HTTPS, secure-context and top-level-page guard**. This is defense in depth, **not** a substitute for server-enforced authentication. No HTTP/embedded sign-ins; do not activate signup until the owner separately authorizes and verifies the provider and integration.
- When a real backend is introduced, require server-side authorization, per-user ownership controls / row-level security, parameterized queries against injection (including always-true conditions such as `OR 1=1`), session and CSRF defenses, safe cookies, validation, rate limiting and independent security tests. Static-site HTTPS alone does not prevent SQL injection or account bypass.
- Do not use `eval` on imported files, executable data, user notes, URL parameters or third-party map content. Treat research, map tiles, comments, JSON, and third-party metadata as untrusted. Encode for the destination HTML/URL/text context; validate origins, file limits and schema.
- Never commit `.env` files, tokens, secrets, raw private progress exports, password material, credentials, copyrighted non-redistributable research or server service-role keys. A route is **not private** merely because it is unlinked. Public GitHub branches and Cloudflare preview deployments are not private data stores.
- Keep `_headers` / TLS configuration reviewed, especially framing restrictions and no-store account pages. Protect source via active PR rulesets, no force pushes, no branch deletions and no bypass actors; monitor Dependabot/secret-scanning options as offered by the repository plan.
- Third-party GTA VI/community coordinates and reference maps are unverified until independently sourced. Credits are not a reuse license. Preserve source and licensing notices.

## Owner's repository settings checklist

In **GitHub Settings → General**, ensure the *existing lowercase* `main` is default (not uppercase `Main`); this is **not** a branch rename. In **Settings → Rulesets**, verify both lowercase `main` and `development` show protected, with deletion and non-fast-forward blocks and pull-request requirements. Review **Settings → Security / Advanced Security** for secret scanning, push protection, Dependabot alerts/updates, and private vulnerability reporting as the account permits. Some settings require repository administration rights; a documentation change does not activate them.

For Cloudflare Pages, confirm the project's **production source = `development`**, current deployment succeeded and its commit matches the reviewed GitHub merge. Do not turn off the public website to protect GitHub source; do not delete old cloud projects until legacy redirects and player exports have been verified.
