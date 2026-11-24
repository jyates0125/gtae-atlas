# Atlas 36.1 — Candidate Leonida elevation raster footprint study (2026-11-23)

**Source-only preflight. No actual elevation, image files, or 3D building models were copied or bundled.**

## Source chain, pinned
- GTADB.org: [FAQ](https://faq.gtadb.org/) welcomes reuse unless otherwise stated; [repository](https://github.com/rolux/gtadb.org) contains CC BY 4.0 data and MIT software. GTA VI elevation input is referred to under api/data/6/elevation.bin in source code, but absent from the public repository. GTADB asks users not to fetch their live media. We have not done so.
- Candidate public 16-bit raster: [wpenistone/leonida_gis](https://github.com/wpenistone/leonida_gis) revision 7e3d9b5bc4ae2b09fd60316da0001d706dba10dc, rasters/heightmap_16bit.png git blob SHA 91a73e17ed9d835bfc6b3a4fbc5092e007ccce79 (1,291,768 bytes). Its README credits upstream work by MelonHell/LeonidaHeightmap. Source image rights remain UNCONFIRMED: public access does not establish redistribution permission.
- Toliak's [Apache-2.0 San Andreas vector map](https://github.com/Toliak/San-Andreas-vector-map) is reusable under its stated terms for that game's roads. It is not a GTA VI terrain heightmap license. GTAMap.io's own derivative rendering is distinct from upstream rights.

## Exact spatial compatibility calculation
Atlas VI target 1536 x 1748 samples, scale 0.083188297074 and grid origin (1108.532445611, 938.090772693). Target world X covers -13325.58166 to +5126.53305, world Y covers +11276.71566 to -9723.83443.

The raster has width 2150, height 2736 and six-line ESRI world file: horizontal step 12.01652939, vertical step -12.01652939, initial pixel center X -13318.09624072, Y +11265.41629079.

Projecting Atlas grid corners into candidate pixels gives:
- Pixel X: -0.622927 to 1534.938142
- Pixel Y: -0.940319 to 1746.698239

Thus the target fits within a **one source pixel edge allowance**. Small explicit western/northern boundary clamps are required. This is a geometric footprint match, NOT verification of source heights, alignment, provenance, file licensing, official GTA geography or usable in-game buildings.

## Focused verification
Run:
  python scripts/audit_atlas361_leonida_source_footprint.py
  python -m unittest -v scripts/test_atlas361_source_footprint.py
  python -m unittest -v scripts/test_atlas359_convert.py

These checks use metadata and synthetic fixtures only. The candidate PNG's public auxiliary metadata reports a raw minimum of zero; we do not know if those values mean ocean, no-data or a valid bathymetric measurement. Do not silently treat zeros as land heights or create invented relief. The Atlas converter currently refuses excessive output clipping. Actual source pixel statistics, bathymetry/nodata rules, independent control-point measurements and redistribution rights remain open.

## Branch and release hold
This preflight is for owner-reviewed private research and future authorized local terrain conversion. No elevation is distributed. PR #98 staging remains draft, development and protected main untouched. Native Safari, real WebGL terrain, full Chromium/Edge/ZIP and release acceptance are separate gates.
