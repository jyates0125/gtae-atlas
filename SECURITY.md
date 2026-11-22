# Security Policy — Team Jura Atlas

## Supported code

The maintained public website line is lowercase `development`, connected to GTAE Cloudflare Pages. Lowercase `main` is the protected, separately approved reference/release branch. Neither stale release tags nor uppercase `Main` are current public sources. Historical releases and legacy explorers are not independently supported; fixes may be incorporated into the current line.

## Report vulnerabilities privately

**Do not open a public issue containing an exploit, secret, private user data or reproduction steps that would expose users.**

Use GitHub's **Report a vulnerability** / private security advisory for the repository, if available: <https://github.com/jyates0125/team-jura-atlas-preview/security/advisories/new>. If the feature is not enabled, contact the repository maintainer through a private channel before disclosing technical details. We have not published an email address in this policy. Ordinary non-sensitive defects can use [Issues](https://github.com/jyates0125/team-jura-atlas-preview/issues).

Please include affected URL/branch and commit, browser/device, minimal steps to reproduce, expected impact and a suggested mitigation, **without posting active credentials or someone else's private data**. Maintainers will review reports as they are available; no unverified response-time commitment is made.

## Architecture and security boundaries

- Static browser-side site. No account/password feature or Rockstar sign-in is offered. User progress is stored in browser local storage; users should export backups before resetting browsers.
- GTA VI claims and community maps are not trusted authoritative location or security data.
- Map tile and data providers are separate trust and licensing boundaries; do not treat third-party map text as code instructions.
- Never commit `.env` files, secrets, tokens, raw private exports, access credentials, or non-redistributable research files.
- A secret or sensitive dataset is **not private** just because it resides on an unlinked web route or a preview branch in a public repository.
- Preview branches/URLs require real access controls if used for sensitive research. A public web page titled "Research" is not a private Research Lab.

### Repo settings for maintainers

Under **Settings → Security / Code security and analysis**, inspect availability of secret scanning, push protection, Dependabot alerts/security updates and private vulnerability reporting. Some features depend on plan or repository settings. Under **Settings → Branches / Rules**, enable applicable protections for `main`, require reviewed PRs and successful tests. These settings must be activated by the repository owner; adding this file does not activate them automatically.

## Release and future signup controls (November 22, 2026)

- This site is currently **guest-first**; its browser-local data and backups are private to each origin. Never enter passwords, API secrets, or Rockstar credentials into placeholder website forms. Public account signup, cloud save and personal synchronization remain disabled until a separately approved security-tested phase.
- Only the canonical GTAE Cloudflare project and its configured `development` production deployment may be represented as the active site. Protect `main` and `development`; keep safe backups and avoid force-pushes or accidental destructive branch cleanup.
- Before considering user accounts: require provider-verified HTTPS, secure sessions, server-side authorization and row-level ownership checks, safe parameterized database access, abuse and rate controls, recovery flow, privacy notices, consent-based guest-data migration and real device tests. A client-only sign-in page is not sufficient security.
- For legitimate vulnerability reports, prefer the canonical repository's private advisory submission if it is enabled; never publish live credentials, exploit details or another visitor's data in a public Issue.
