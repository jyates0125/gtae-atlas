# Atlas 36.7 — completed terrain-import handoff and fail-closed public distribution

November 23, 2026. Feature branch only, draft staging until reviewed and CI green.

## Recovered defects and functional behavior
- Atlas 36.6 correctly tried local same-origin relief before opening genuine WebGL, but the 3D button's pending fetch could return **after** a user imported a valid local grid. A late unsuccessful response could reset the map back to "no elevation installed" even though actual WebGL had activated.
- Atlas 36.7 always checks the **current accepted terrain** when an async result completes. The local import increments the generation to cancel old UI outcomes. Stale requests never overrule the user.
- If a user attempts to replace a working DEM with a malformed upload, the original engine grid and optional evidence are retained and the UI explicitly reports that preservation. World switching, local 2D exit and the previous valid local 3D grid remain independently scoped.
- No automatic GTADB requests, tile changes, localStorage/IndexedDB migration or upload to a remote server. Preserves the one slim GTADB CC BY 4.0 attribution strip and Sources register.

## Real browser and release evidence
- New built-site Chromium test covers 390px iPhone-sized viewport and 1440px desktop: click 3D while a same-origin request is still pending; select valid **synthetic-only** 5,369,856-byte local grid via the real file input; resolve an invalid late server result; verify WebGL or an honest fallback without state contradiction; reject a damaged replacement without losing the prior grid/evidence; return 2D and reopen without another download; cancel 3D during a new in-flight request and confirm no stale install.
- Production-payload audit **fails closed** when any dense GTA V or VI elevation file is present without a matching JSON evidence file under docs/ containing its actual SHA-256, source URL, source revision, declared redistribution right, and independently sourced calibration controls. It uses the existing exact elevation and evidence validator; it compares source binary against built Cloudflare output. A successful programmatic proof checks declared evidence **not** its external factual/legal authenticity.
- Synthetic verifier tests verify missing proof, mismatched SHA, modified output and stray published files. Test evidence lives in temporary memory or OS temp only and is never copied to art, public/ or the repository.
- Source document filename required for a future approved VI asset: docs/ATLAS-HEIGHTFIELD-6-RELEASE-PROOF.json (schema team-jura-terrain-proof-v1); the required 1536x1748 uint16 LE binary remains elevation-6.bin. No actual heightfield or sample rights-proof manifest is introduced by this PR.

## Release status
This closes a genuine UI/race and release-audit gap, **not** the still absent dense GTADB-compatible GTA VI source binary. The user-approved reuse decision for GTADB's published repo-owned map/data/photos/tiles remains unchanged: credit GTADB.org/contributors under CC BY 4.0 with bottom strip plus dedicated Sources page. If new heightfield bytes are imported, they still require per-asset source review, correct datum/calibration, independent map control points and actual owner approval.

The official public GTAE deployment is protected main, not this draft staging branch. Before promotion verify final full Chromium+Edge+ZIP, native iPhone Safari visual/interaction, 13 map / 15 heist workflows, source media, Cloudflare deployment SHA and explicit owner acceptance.
