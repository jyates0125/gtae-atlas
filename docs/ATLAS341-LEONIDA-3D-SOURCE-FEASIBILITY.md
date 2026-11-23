# Atlas 34.1 — Leonida 3D source feasibility (2026-11-23)

## Sources

- GTADB https://github.com/rolux/gtadb.org — locally checked-out map tiles and landmarks; README lists MIT code and CC BY 4.0 data. Do not fetch live GTADB media.
- GTADB FAQ https://faq.gtadb.org/ — describes approximate GTA VI reconstructed elevation sampled at 10×10 metres, derived from incomplete low-resolution data.
- GTADB developer 3D toolkit https://github.com/rolux/gtamaplib-vc — browser WebGL 3D/game mode and camera triangulation. Inspect its LICENSE and each asset's provenance before reuse.
- Leonida 3D https://leonidastate3d.com/ — walk/drive/fly benchmark; no verified permission to copy assets.
- Open-source Leonida Atlas https://github.com/navanem/gta6-leonida-atlas — Three.js explorer; AGPL-3.0-only code, requiring a separate license/architecture review.

## Integration gates

1. Preserve Elario 2D, guest progress, distinct worlds and credits.
2. Existing GTA VI engine expects a 1536×1748 Uint16 heightfield with a specific transform. Validate elevation encoding, axis orientation, origin and scaling using independently sourced control points; matching file size alone is insufficient.
3. Record rights, pinned revision, asset transformations and upstream attribution. No hotlinking, scraped meshes or invented geometry.
4. Prototype opt-in terrain mode and fallback to reliable 2D; test iPhone Safari, memory limits, navigation and markers.
5. Focused 3D tests, full release gates and owner visual approval before publishing to either development-connected Cloudflare site.
6. Source monitoring may propose research updates but cannot silently replace 3D assets.

Status: candidate sources researched, not yet integrated or verified in production.

### Pinned toolkit review, November 23

Reviewed `rolux/gtamaplib-vc` revision `98b858fe6cbb3ea0bffa94aa53d86c1d6b0d5a02`. Its LICENSE dedicates the software to the public domain. Its README explains that bootstrap downloads upstream gtamaplib assets and GTADB tiles. The toolkit tracks only config.json and special.json under data/. Before importing terrain, identify the upstream elevation payload, its grant, units and control-point residuals. Leonida State credits GTADB tiles separately from its own buildings and elevation fields. These are separate rights checks. No new mesh was imported.
