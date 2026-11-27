# Elario Studios · Team Jura Atlas — canonical GTAE project

**Current live-site identity:** [GTAE — Team Jura Atlas](https://gtae-online.pages.dev/) · **canonical GitHub source:** `jyates0125/team-jura-atlas-preview` · **production branch:** lowercase `development` · **protected reference/release branch:** lowercase `main`. The GitHub repository name is not the visitor-facing website name.

**Operating authority:** [Standing Project Charter](docs/TEAM-JURA-STANDING-CHARTER.md), [Canonical Deployment and Release Runbook](docs/TEAM-JURA-CANONICAL-REPO-AND-DEPLOYMENT.md), [Designed Brand Master](docs/ATLAS92-MASTER-SPEC.md), [Site Completion Contract](docs/ATLAS-SITE-COMPLETION-CONTRACT.md) and [Credits & Notices](atlas-credits.html). The old README release notes below are preserved only as history, not deploy instructions.

**Build and release:** Open short-lived feature PRs against `development`; require exact-commit provenance, mobile/desktop Chromium+Edge CI, current original art, validated site ZIP, actual deployment verification and owner acceptance. Synchronize `main` only through separately reviewed release PRs, never by forced history rewrite or blind file copying. Preserve rollback refs, prior world and personal-progress data, public credits and legacy guest-export deep links.

**Cloudflare:** Expected project `gtae-online`, production branch `development`, root `.`, build command `node scripts/build-cloudflare.cjs`, output `public`. **A successful GitHub merge is not proof Cloudflare is serving that revision.** Read the generated `atlas-build-identity.json` and inspect live assets. The old `team-jura-atlas-preview.pages.dev` project is retained solely as a carefully managed legacy redirect/export bridge.

**Current focus:** Maintain 13 distinct worlds, accurate collections and routes, Cayo and other heist workspaces, original Elario Forge, vehicles/weapons/characters, navigation and iPhone accessibility. GTA VI public release and speculative individual locations are different evidence questions. Public sign-in remains deferred until the completed website receives its own owner signoff. Do not claim full media/map parity or completed One Last Ride film without delivered and reviewed evidence.

**Rights and reuse:** [Reserved rights](LICENSE.md) · [Community reuse](REUSE-POLICY.md) · [Third-party notices](NOTICE.md) · [Elario operating rights policy](docs/ELARIO-RIGHTS-POLICY.md). No blanket open-source license. Existing upstream permissions are preserved.

## Historical release notes (not current deployment instructions)

---

# Team Jura Atlas 9.8C — integrated release

**Current deploy candidate:** One complete Elario Studios / Team Jura Atlas website with the approved forward-looking designed brand, GTA worlds, research, collectibles, garage, heists, and One Last Ride. Development is the release branch. Legacy `main` remains untouched.

**Cloudflare Pages (Git integration):** Framework `None`; build command `node scripts/build-cloudflare.cjs`; output directory `public`; root `.`. Confirm the production branch setting in Cloudflare. **Do not use `.` as the output directory for this source repository.**

Read [README-RELEASE-98C.md](README-RELEASE-98C.md) for Windows one-push installation, Microsoft Edge tests, sources, safe workflows, and the acceptance checklist. The site is not considered live-verified until Edge/Chromium quality checks and Cloudflare preview acceptance pass.

---

# Team Jura Atlas — 9.8C Full Website Release (15 November 2026)

**Elario Studios → Team Jura → Atlas**. Latest integrated Designed Brand website built from the complete full-site/film archive plus the 8.1–9.8B cumulative upgrades and safe 9.8C fixes. **This ZIP is the entire site**, not an overlay. Development deployment is pending; read [README-RELEASE-98C.md](README-RELEASE-98C.md) and [docs/RELEASE-98C-STATIC-REPORT.json](docs/RELEASE-98C-STATIC-REPORT.json). Do not consider live map tiles or Rockstar icon clearance verified without testing/permission.

Key destinations: [Home](index.html) · [All Maps](maps.html) · [GTA V](atlas.html) · [GTA Online](atlas-online.html) · [Leonida](atlas-vi.html) · [Data Lab](atlas98-data-lab.html) · [Source Registry](atlas-source-registry.html) · [One Last Ride](one-last-ride.html).

The connected GitHub `development` branch contains more current work than the old `main`; this package is designed for `development` only. The release validation workflow never auto-commits. **All older notes below are retained for historical context, not current deployment instructions.**

---

# Atlas 7.4.1 · Polished combined preview (Nov 13, 2026)

**Team Jura / Elario Studios · GTA map portal + One Last Ride studio preview.** This snapshot combines the holiday homepage / map browser design, existing maps and research tools, Atlas Passport, Leonida HQ, One Last Ride 39-second music-only teaser, original score, 9-scene interactive storyboard and [production master](film/production/README.md).

**What is verified here:** valid local file and asset references, JavaScript syntax, HTML parse, included preview MP4 stream, production document and CSV integrity, working source file paths, ZIP CRC. **What still requires browser and real-device review:** third-party map tile availability, dynamic map usability, service worker behavior, 3D support, all game-data coordinates, accessibility layout on every phone/browser and legal clearance of any eventual full animated film. Never claim feature parity or a completed feature film without QA.

**Upload preview to `atlas-7-dev` only. Do not merge over `main` until the new site is checked on phone and laptop.** Place the ZIP contents at repository root; never upload the enclosing parent folder itself. The site entry is `index.html`; film entry is `one-last-ride.html`.

Research provenance: Official Rockstar / Take-Two information, attributed **Community Research & Development**, and **Fan-made / Unverified** are deliberately different categories. Read [attribution](ATTRIBUTION-AND-COMMUNITY-RD.md), [all credits](atlas-credits.html), and [release QA](RELEASE-QA-741.md) before release. Community map tiles and original Rockstar footage remain subject to their individual rights and policies. **A fan project and an attribution statement are not themselves permissions.**

---

# Team Jura Atlas 7.0 — Development Preview

**An Elario Studios project** · unofficial Grand Theft Auto map companion · GTA V Story, GTA Online, and provisional GTA VI Leonida research.

> **Status — 13 November 2026:** This is an Atlas **7.0 preview preparation**, with the functional map/data baseline from the **6.8** development ZIP supplied in this conversation. The complete 6.9 source build was **not** present in the supplied archive. Version labels, page descriptions, deployment instructions and security checks have been refreshed; this alone does **not** mean the entire proposed 7.0 feature set is implemented or live-tested. Do not merge to production until browser acceptance is complete.

## Open the Atlas

| Experience | Page | Notes |
| --- | --- | --- |
| Home / world selection | [index.html](./index.html) | Browser-local guest progress; no account signup |
| GTA V Story | [atlas.html](./atlas.html) | 2D layers, filters, pins and coordinate tools |
| GTA Online | [atlas-online.html](./atlas-online.html) | Separate progress and activity labels |
| GTA VI Leonida | [atlas-vi.html](./atlas-vi.html) | Scaly/YANIS + Loki/DUPZOR reconstructions, unverified |
| Cayo Perico | [atlas-cayo.html](./atlas-cayo.html) | Illustrative, non-calibrated research schematic |
| Research | [atlas-research.html](./atlas-research.html) | Public source-aware workspace; **not** the private lab |
| Collectibles | [atlas-checklist.html](./atlas-checklist.html) | Tracking counts are not verified map coordinates |
| Activities | [atlas-activities.html](./atlas-activities.html) | Story / Online / VI have separate rules |
| Catalog | [atlas-catalog.html](./atlas-catalog.html) | Vehicle and garage workspace |
| Showcase | [project.html](./project.html) | Current 7.0 preview description and roadmap |
| Test Center | [atlas-test-center.html](./atlas-test-center.html) | Browser-side checks |
| Credits | [atlas-credits.html](./atlas-credits.html) | Attribution and rights limitations |

## Architecture and feature honesty

- Responsive static HTML/CSS/JavaScript, data-driven category and marker controls, browser-local save/export, and optional experimental WebGL perspective components. No backend, passwords, or Rockstar account link.
- GTA V and GTA Online share some underlying map imagery but maintain game-specific progress. GTA VI reconstructions are third-party/community-sourced estimates; they are **not** Rockstar-certified coordinates.
- Current UV / UV II appearances may be stylized map treatments rather than independently verified illustrated source layers. Straight-line routes are **not** guaranteed road directions. Do not label potential spawns, daily rotations or collection slots as verified positions without evidence.
- Full functional 3D terrain for all views, additional nested menus, complete marker datasets, live account synchronization and private Cloudflare research deployment remain **planned/in verification**.
- Source links and licenses belong in [atlas-credits.html](./atlas-credits.html). Do not republish anything from a third-party server solely on the basis of a credit label. Respect source-specific exceptions.

## Safe deployment

Current branch plan:

1. Keep **`main`** as the production branch; do not force-merge it with `GTA-maps` (the histories diverged at the last GitHub inspection).
2. Develop on **`atlas-7-dev`**, created from `GTA-maps`; upload **both extracted browser-upload batches** (GitHub permits a maximum of 100 files per web upload), not the ZIP files. Review each overwrite before committing.
3. Ensure the site runs locally and `python scripts/test_site_release_70.py`, `python scripts/test_atlas_static.py` and `python scripts/test_sync_gtadb_vi.py` pass. JavaScript files must pass `node --check`.
4. Connect **Cloudflare Pages → GitHub** to `jyates0125/leonida-explorer`: production branch `main`; enable development branch preview. For this static site use framework **None**, no build command (or `exit 0` if required), output directory `.`. Verify the Cloudflare user interface matches these settings.
5. Cloudflare Pages previews are generally public unless protected. Set **Cloudflare Access** before sharing private URLs or uploading restricted data. **Never put unreleased/private datasets in a public GitHub repository**, even in a hidden route or branch.
6. Open the preview in Edge and mobile; check map tiles, pan/zoom, switchers, marker layers, routes, backups, credits, service-worker cache freshness and console errors. Only then consider a reviewed PR to `main`.

Detailed workflow: [DEPLOY-AND-SHOWCASE.md](./DEPLOY-AND-SHOWCASE.md).

## Security and contribution

See [SECURITY.md](./SECURITY.md) to report vulnerabilities privately, [CONTRIBUTING.md](./CONTRIBUTING.md) for public issues, and [RELEASE-ATLAS-7-0-PREVIEW.md](./RELEASE-ATLAS-7-0-PREVIEW.md) for changes and test boundaries.

Historical release documents (`RELEASE-ATLAS-*.md`, `ACTIVITY-MODE-SEPARATION-6-8.md`, etc.) are retained as **archives**, not current deployment instructions. The earlier cumulative README is archived at [docs/README-HISTORY-THROUGH-6-8.md](./docs/README-HISTORY-THROUGH-6-8.md).

**Team Jura × Elario Studios** — Build it · Package it · Test it · Refine it · Deliver it.
