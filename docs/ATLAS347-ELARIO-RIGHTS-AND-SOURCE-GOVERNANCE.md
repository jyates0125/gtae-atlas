# Atlas 34.7 — Elario Studios original work, permissions & license boundary

**Date:** 2026-11-23 · **Status:** staged for review; not a retroactive license change, public release or proof of legal registration.

## What Elario Studios intends to reserve

Elario Studios / Team Jura reserves the rights it **actually lawfully holds**, to the extent protectable, in original human-authored copy, distinctive branding, E-crest presentation, original art contributions, independent interactive website code, original film editing, Forge UX/concepts, custom organizational work and independent technical improvements. The site credits page and terms link to this position without making every reused work proprietary.

A published website necessarily exposes the client-side HTML, CSS, JS and rendered imagery a browser needs; no watermark, minifier or JavaScript obstruction can guarantee secrecy. The canonical GitHub repository was **public** at audit time. Public visibility is not itself a blanket open-source license, but full technical source confidentiality would require an appropriately private, access-controlled repository and deployment arrangement reviewed separately. Do not silently turn the canonical repo private or relocate it in a routine deploy.

### Explicit exclusions

| Material | Ownership/license rule | Evidence/remediation |
| --- | --- | --- |
| Original Elario site copy / UI / independent code | Reserve Elario's lawfully owned, protectable original authorship absent a separate grant | Distinguish independently authored additions from external or MIT source |
| E-crest, brand designs and original concepts | Reserve brand identity and creative presentation subject to applicable rights and AI/human-authorship limitations | Preserve original design pack and evidence of human creative choices; trademark review separate |
| AI-assisted fan concepts and One Last Ride | Claim only legally protectable human authorship, arrangement and licensed contributions | Don't imply all AI-generated visual elements are copyrightable, nor ownership of GTA characters |
| GTA material, titles, game characters and official media | Rockstar/Take-Two or respective rightsholders, with conditional published fan-use policies | Original publisher rights remain; commercial, film and monetization must receive separate review |
| GTADB contributor data/tiles | Verify specific file/revision licenses (eligible upstream data CC BY 4.0; code MIT where actually applicable), plus surviving Rockstar game-art rights | Link to exact source, license and modifications; source attribution alone cannot grant game-IP rights |
| Apache-2.0, MIT, ISC or other credited source | Preserve original terms, full required notices and actual scope | Source-by-source ledger and bundled legal files; no proprietary relicensing of upstream |
| Unclear or unknown imagery/coordinate permissions | Hold public reuse pending review | Replace with original, expressly permitted or linked references rather than guessing |

## Public rights contact

Preferred destination **when owned custom domain and tested mailbox exist**:
- `rights@<owned Elario domain>` for licensing, artwork, correction and takedown requests;
- `hello@<owned Elario domain>` for general studio inquiries, with optional alias routing into one mailbox;
- a security-specific private intake separate from public issues.

Do not publish an undeliverable example address, secret personal mailbox, or contact form that stores user details without a privacy/retention design. Before publishing a live address, verify ownership and inbound/outbound delivery, SPF/DKIM/DMARC, retention, and update `atlas-credits.html`, `atlas-policies.html`, plus linked pages together.

For public nonsensitive corrections, the existing source/issue workflow remains. Private disputes and identity documents should not be posted publicly.

## Cloudflare deployment and public source security

User-confirmed settings on **both** Cloudflare Pages projects 2026-11-23: production branch `development` correct, build command **blank**, output directory **`.`**. Verified source boundary audit [#45167768252](https://github.com/jyates0125/team-jura-atlas-preview/actions/runs/45167768252) demonstrated public raw repository root content and missing generated SHA. **Current public branches must not receive staging release until both projects are corrected.**

For `gtae-online` first, then `team-jura-atlas-preview`:
- repository root: default blank;
- production branch: `development`;
- build command: `node scripts/build-cloudflare.cjs`;
- build output: `public`;
- build and deploy the reviewed existing development SHA, verify generated `atlas-build-identity.json` and absence of raw source; only then revalidate exact staging release Chromium+Edge+ZIP, device Safari, media rights and eventually develop→main.

The current build script excludes `docs/`, `scripts/`, `.github/`, `qa-evidence/`, private research, and bundled test trees. Its output (not repository root) is the Cloudflare static payload. `scripts/audit_published.py` audits built files and catches non-public extensions/directories.

There is no claim that the whole source tree was confidential: all files in the **public GitHub repo** are separately readable there. Do not store passwords, secrets, private user exports, unreleased storyboards or proprietary internal records in the repo merely because Cloudflare now filters them.

## Validation and acceptance

The rights/attribution notice is a public informational policy, not legal advice, a registered copyright/trademark, a valid upstream asset license, technical DRM, or proof that all image rights have been cleared. It must preserve per-asset credits, original license terms, correction procedures and noncommercial fan-content limitations. Do not activate accounts, monetize Rockstar material or publish a live contact address without separate signoff.

Authoritative public notices: `atlas-credits.html#studio-rights` and `atlas-policies.html#terms`; upstream source register and site-completion charter remain authoritative for actual asset provenance.
