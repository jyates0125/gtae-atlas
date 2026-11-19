# Atlas 14.1 · Vehicle feature-parity gate

Status: **in progress — not a parity-complete release**.

## Existing implementation (verified in repository)
- `atlas93-garage.js`: vehicle catalog, ownership, local build metadata, archive photos, selected vehicle details, paint choices, model-specific specification panel where sourced.
- `atlas99-garage3d.js`: original interactive WebGL **generic silhouette** and turntable; not an exact GTA vehicle mesh. Some craft classes deliberately omit the generic car.
- `data/atlas-vehicle-intel.json`: available vehicle intelligence; coverage and source provenance need a model-by-model audit.
- `my-crew.html`: separate GTA Online multi-crew profiles and GTA V / VI Story workspaces (in progress on this branch).

## Parity acceptance criteria before futuristic extras
1. **Vehicle catalog:** searchable filters, game/mode separation, ownership, garage assignment, images, sources, and correct class for cars, boats, aircraft, bikes.
2. **Vehicle details:** source-backed speed, acceleration, braking, traction/handling, seating, acquisition, price, manufacturer, release, storage, special abilities. Distinguish game-file stats, tests, and unknowns; no invented telemetry.
3. **Performance graphs:** accessible bars and labels for available measured/source-backed metrics; no decorative graph passed off as data. Include source and test methodology.
4. **Customization:** paint, secondary/pearlescent color, wheel/rim/tire, liveries, spoiler, armor, brakes, engine, transmission, suspension, turbo, neon, windows, and relevant special upgrades **only where applicable**. Record options and known availability per model.
5. **3D:** accurate per-model preview only with licensed/authorized model assets. Existing generic silhouette must remain explicitly labeled as conceptual; avoid showing a road car for boats/planes. Provide a photo/spec fallback and a low-power mobile mode.
6. **Crew connections:** player-owned vehicles can be associated with a chosen GTA Online crew without changing canonical catalog data.
7. **Reliability:** no external dependency required for core saved progress, export/import, iPhone touch controls, reduced motion, loading states, broken-asset fallback, security, and browser tests.
8. **Game coverage:** GTA V Story, GTA Online and GTA VI Story clearly separated. Do not claim GTA VI Online functionality without official confirmation.

## Source order and rights
Rockstar first for official game facts/media; then licensed/open community datasets with attribution. Third-party interface designs and 3D meshes cannot simply be copied. Keep Elario's own original visual system.

## Release gate
Document each feature as verified, partial, unavailable, or blocked by data/rights. Complete source-backed parity and device testing before marketing the configurator as equivalent to competitors. User reviews the finished branch before any live merge.
