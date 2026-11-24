# Atlas 36.0 — 3D iPhone gesture and rendering milestone
Date: 2026-11-23 · Combined source staging only · original 2D safe

## Changes
- Single pointer/mouse drag keeps 3D orbit and pitch behavior; Shift+mouse drag pans in game coordinates.
- Two-finger touch pans by midpoint while pinch changes 3D camera distance. Pointer changes rebase gesture anchors, preventing jumps as a second finger arrives or leaves. Pointer cancellations and lost captures clear stale gesture state.
- The 3D canvas sets touch-action none while active; the normal page returns to standard touch handling in 2D. iPhone Safari must still be tested on a physical device before release claims.
- Pointer camera updates coalesce with requestAnimationFrame instead of issuing WebGL frame draws for every high-frequency pointer move.
- Mesh subdivisions adapt within 35–70 based on viewport width; phone texture size is 512 instead of 768, while desktop retains up to 768. Saves repeated CPU/GPU work on phone without touching 2D maps.

## Rights and terrain
No heightfield, unofficial map media, external mesh or source data added. GTADB published data and vector-license review remain separate. 3D only displays geometry when a suitable local heightfield is imported; otherwise the current perspective-only fallback remains clearly disclosed.

## Focused QA
Run node --check atlas-3d.js; node scripts/test_atlas360_touch_camera.cjs; node scripts/test_heightfield_import.cjs; python scripts/audit_3d_heightfields.py on exact head. Test physical iPhone Safari: one-finger orbit, two-finger simultaneous pan/pinch, release/restart, 2D back and normal scrolling, pan after rotation, many pins, zoom limits and context loss. Native Safari and completed relief are NOT certified by source tests.

## Release boundary
Draft feature PR targets integrated staging PR #98, not Cloudflare-connected development nor protected production main. Neither public branch may be moved before final approved browser/ZIP and native-device checks.
