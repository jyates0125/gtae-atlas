# Team Jura Atlas 9.8C — complete integrated website · 15 November 2026

## This is the SINGLE full website archive

Unzip this release. Its root contains `index.html`, the complete `art/`, `film/`, `data/`, `scripts/`, `.github/workflows/` and every working map/guide page. It is **not** another incremental overlay. The latest approved 9.8B homepage and maps directory are included. The complete *One Last Ride* 7.4.1 cinema page and included motion-preview MP4 and original score were recovered before the newer overlays were applied.

**No code was pushed to GitHub** because the connector returns HTTP 403 for writes. The full-site archive can be pushed to the Cloudflare-connected `development` branch using the provided Windows installer. This release must not be merged to `main` just because `main` is behind.

### Windows — one branch, one push

1. Extract the **entire ZIP** into a folder (not just the ZIP file in the repository).
2. Install Git for Windows if not already installed. Sign into GitHub in your normal browser so Git Credential Manager can request authorization.
3. Open PowerShell in the extracted folder and run:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\INSTALL-TO-DEVELOPMENT.ps1
   ```

   Inspect the installer before running it. It clones the public `jyates0125/team-jura-atlas-preview` repository's **`development`** branch into a sibling `Team-Jura-Development-Working` folder, merges all release files, deletes **only named retired GitHub Actions workflows**, commits, and pushes `development`. It never force-pushes, merges `main`, or deletes unrelated repository content. If existing work is uncommitted or push permissions fail, it stops with an error.
4. Visit GitHub → Actions → **Team Jura Atlas - validate production website** and confirm the release-checks job passes. The workflow runs automatically on a `development` push, runs desktop/mobile smoke tests in Chromium and Microsoft Edge, and creates a validated artifact **only after both jobs pass**. Cloudflare Git deployments are independent; a workflow check alone does not hold a Cloudflare push. No workflow automatically edits source files or merges branches. An optional **manual licensed data review** workflow can fetch source-owned GTADB landmark data and publish an artifact for review without pushing it into the site.
5. In Cloudflare Pages, use **Production branch `development`** only after the preview has passed both browser jobs. Confirm project settings manually; do not assume they changed. Framework preset **None**, Build command **`node scripts/build-cloudflare.cjs`**, Build output directory **`public`**, Root directory **`.`**. Cloudflare build-image v3 provides Node.js 22. This avoids exposing source scripts and QA files. If Cloudflare currently publishes `development` directly, a push can deploy *before* GitHub Actions passes: use a protected preview/staging deployment and wait for green checks before sharing it publicly. Cloudflare's Git integration should pick up the commit. Verify the deployment URL and custom domain. The GitHub `main` branch is still old and should remain unpublished.
6. Verify homepage, four worlds, first GTA V map tile, GTA Online mode, VI map art, Cayo, legends, search, collectibles, routes, Data Lab, Source Registry, and `one-last-ride.html` film preview on desktop and iPhone before sharing publicly.

### Proven features and limits

**Built and tested locally:** all 65 HTML pages with zero missing same-origin references in source and clean Cloudflare output; 75 root/deep JavaScript files checked by Node; 11 Data Lab tests including safe GTA map pack creation; 58 of 58 9.8B isolated DOM fixture tests; previously implemented Atlas 9.7 contract checks; internal JSON data parse; original character assets and film files included. Browser navigation was blocked in this execution environment, so Edge/Chromium GitHub Actions execution, Cloudflare deployment and physical device acceptance are **still required**. Do not call the release fully browser-tested before those jobs are green.

**Preserved:** mapped GTA V Story, Online, provisional Leonida, Cayo, GTA IV, classic notebooks, heist hub, garage, personal progress keys and imports, user pins and navigation systems; original Elario Studios > Team Jura > Atlas purple/amber approved artwork. Existing historic source files and screenshots are not presented as verified current Rockstar data.

**Still incomplete:** full independently verified current GTA V/Online collectible coordinates; GTA VI gameplay-verified data; Cayo calibrated terrain; validated road routing; full Rockstar icon files, original full video film, offline tile asset mirroring, complete visual screenshot parity. This is a workable community site, not a claim of complete GTAWeb feature parity.

**License policy:** original Rockstar Games names and imagery remain their owners' intellectual property. This package uses our approved original style and CC BY 4.0 GTADB.org community overlays where sourced. Rockstar's own icon artwork is **not** assumed to be freely redistributable. GTAWeb remains a source of functionality/troubleshooting references, not a blanket source-code or database license. GTA VI research is visibly provisional.

### Data note

The supplied `gtadb-v5.json` and `gtadb-v6.json` are small **18-row starter samples**, not complete landmark/collectible sets. The included GTA IV starter contains **15** rows. GTA V catalog currently carries **279** existing records and the native Atlas lists **20** collectible sets; numbers should not be interpreted as confirmed comprehensive game data. The full GTADB.org IV/V data can be fetched from its explicitly CC BY 4.0 GitHub repository using the manual review workflow; official game datasets and external licensing remain subject to separate verification.

### Technical deployment policy

- Only `development` is a production-site candidate. Do not force-merge old `main`.
- Workflows are read-only and cannot automatically push source changes. Preview build artifact is produced by the validation workflow.
- Existing on-device `localStorage` keys are unchanged. A changed Cloudflare hostname creates a different browser origin and cannot transparently import previous local progress; use the site's backup/export to move it.
- GitHub Pages publishing is separate from Cloudflare Pages. GitHub Pages can remain disabled.
- The site must pass hosted QA before a public link is described as fully working.

## QA and Microsoft Edge deployment settings (updated 15 November 2026)

- Cloudflare Pages: **Build command:** `node scripts/build-cloudflare.cjs` · **Output:** `public` · **Root:** `.` · **Framework:** None · **Production:** `development` after quality-gate approval. These settings must be confirmed in the Cloudflare dashboard; they cannot be changed by this archive.
- The GitHub quality workflow runs Chromium (Linux) and Microsoft Edge (Windows). It builds the same `public/` payload, checks missing assets, then probes the real pages. The ZIP artifact is uploaded only once both browser jobs pass.
- Manual desktop Edge verification: PowerShell `./RUN-EDGE-QA.ps1` after installing Node 22, Python 3.12, and `playwright==1.58.0`; Edge must be installed.
- **Do not point Cloudflare directly at `.`**: it contains scripts, QA sources, and development documents not intended as website assets.
- For privacy and site security, no user registration, payment, or sign-in is present. Set Cloudflare **Always Use HTTPS** for the custom domain. Require HTTPS when accounts are introduced in a future version; do not add HTTP authentication endpoints.
- Optional donations are a future addition, not a launch dependency. Free maps remain free.
- Film: retains original motion preview, scene cards and screenplay; no claim of a completed feature-length video. Original approved Team Jura artwork and the user-established story remain the reference for creative changes.

### Release confidence

Source/unit/static checks passed locally; 65 source pages and 65 output pages have no missing local links. **Hosted interaction tests, external GTA map tiles, film playback on actual Edge and iPhone, and Cloudflare production branch settings remain unverified until tested in those environments.** A site with an unverified external map dependency cannot be certified universally functional.
