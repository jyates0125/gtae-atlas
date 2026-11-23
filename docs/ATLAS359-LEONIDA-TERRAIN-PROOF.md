# Atlas 35.9 — Leonida 3D heightfield proof and source handoff (Nov 23, 2026)

**Status: private research importer implemented in draft source. No licensed elevation grid bundled. No public merge.**

## Actual progress
- Existing GTA VI terrain engine expects 1536 x 1748 little-endian uint16 samples; file size 5,369,856 bytes. The viewer converts raw grid values through GTADB-referenced coordinates and displays actual relief only when a grid is present.
- The JavaScript importer was already implemented but its upload control was absent from the Leonida page. It is now reachable through Directions > Experimental Leonida 3D terrain > Choose elevation-6.bin. The imported bytes are not transmitted or saved to server; reloading discards them.
- Optional evidence JSON checks source declaration fields, exact asset checksum, three or more spatially dispersed claimed independent observations and residuals. This is a technical check only, NOT independent provenance verification, redistribution permission or certified official game geometry. Rejected evidence leaves the personal terrain as UNVERIFIED.
- GTA V Story, GTA Online, working 2D maps, guest saves, and existing 3D controls are unaffected.

## Verified existing reuse permissions
- GTADB repository https://github.com/rolux/gtadb.org: code MIT; data and imagery present in repo CC BY 4.0 per https://github.com/rolux/gtadb.org/blob/main/LICENSE-DATA. Credit GTADB.ORG and contributors, CC BY 4.0 URL, and changes. README requests GitHub downloads rather than hotlinking GTADB media.
- GTADB FAQ https://faq.gtadb.org/ says reuse is welcome unless otherwise stated and describes the GTA VI 3D elevation as an imperfect community reconstruction.
- GTADB API source references the input at api/data/6/elevation.bin but it is absent from the public GTADB repository. It has NOT been copied or requested through an unapproved live media endpoint.
- The separate wpenistone/leonida_gis repository publishes a 2150 x 2736, 16-bit grayscale PNG with a georeferencing world file; its encoding and source bounds are different from Atlas and no explicit repo-wide license was found at this inspection. This file is a research candidate, NOT a licensed Atlas release asset. MelonHell/LeonidaHeightmap also has no explicit repository license listed. Do not redistribute either based solely on public availability.

## Source-matched 16-bit raster conversion tool
The separate source-only utility scripts/convert_atlas359_leonida_heightfield.py converts a LOCAL, permission-cleared grayscale 16-bit PNG with a six-line ESRI world file into exactly the GTA VI heightfield layout expected by Atlas. It bilinearly resamples in the game coordinate frame, converts the explicitly supplied source raw height datum and vertical units to the GTADB-compatible 16-bit representation, bounds-checks source coverage, records edge clamps and clipping, and writes a SHA-256 research report. It does not call any external service or package input sources.

Example for an independently authorized raster only (replace the file paths, sea datum and raw/meter calibration with those documented by the actual source):

    python -m pip install Pillow
    python scripts/convert_atlas359_leonida_heightfield.py --png PERMITTED_HEIGHTMAP.png --world-file PERMITTED_HEIGHTMAP.pgw --raw-sea 28150 --raw-per-meter 46.51 --out elevation-6.bin

The raw datum and scale above are a worked example based on public wpenistone/leonida_gis documentation; **that repository's lack of an explicit license is NOT cured by an example command.** Do not publish or bundle its heightmap without asset-specific rights review. Clipped input elevations above the configured 5% threshold are rejected; do not raise that threshold for a release to hide miscalibration. Even when a local conversion succeeds, the terrain remains approximate until independent control points are checked. Run focused converter unit tests with:

    python -m unittest -v scripts/test_atlas359_convert.py

## Technical evidence manifest requirements
The JSON file supplied to the optional control must have schema value team-jura-terrain-proof-v1; game number 6; encoding value uint16-le; coordinateSystem value gtadb-game-xy; grid width 1536 and height 1748; sha256 of exactly 64 hexadecimal characters; source object with https URL, rightsEvidenceUrl, license, pinned revision and redistributionPermission true; and 3-32 independent controlPoints.

Each control point needs a nonempty label, x and y game-world coordinates, an independently measured zMeters, toleranceMeters > 0 and <= 40, basis equal to independent, and a verifiable https evidenceUrl. Points must span 2 km in both axes and form a non-collinear triangle. The validator checks little-endian bilinear height decoding and altitude residuals. A self-authored JSON can make arbitrary claims, so passing this check does NOT prove those underlying claims.

## Staging release gate
- Run focused node terrain tests plus Python terrain audit on the exact PR head.
- Review source permission for any real distributed heightfield, non-derived independent observations, quantization and correct axis/origin. Do not invent or extrapolate a verified grid.
- Test iPhone Safari file picker, 3D perspective and texture, orbit, zoom, return to 2D and memory; keep invalid import safe.
- Before any public merge: approved reference artwork, full Chromium + Edge + validated ZIP, Cloudflare preview and explicit owner approval. Main is protected.
