# Atlas 23.7 — classic collectible coordinate source audit

## Decision: retain the stronger existing data

Exact numeric comparison of every stored XYZ triple against the current pinned upstream source yielded **450 matches, zero mismatches**. No existing marker coordinates, IDs, checklist slots, route orders or map projection formulas changed.

| World / collection | Compared | Matches | Source revision |
|---|---:|---:|---|
| San Andreas snapshots | 50 | 50 | 77dcc3d65e86df7a3806d4e1607445aacfda1855 |
| San Andreas horseshoes | 50 | 50 | 77dcc3d65e86df7a3806d4e1607445aacfda1855 |
| San Andreas oysters | 50 | 50 | 77dcc3d65e86df7a3806d4e1607445aacfda1855 |
| GTA IV flying rats | 200 | 200 | de21b7df7ec8b10dfe5abe7290d894efbfc1bd11 |
| The Lost and Damned seagulls | 50 | 50 | de21b7df7ec8b10dfe5abe7290d894efbfc1bd11 |
| The Ballad of Gay Tony seagulls | 50 | 50 | de21b7df7ec8b10dfe5abe7290d894efbfc1bd11 |

SA source: https://github.com/Flentric/SA.MapCollectibles/blob/77dcc3d65e86df7a3806d4e1607445aacfda1855/source/CollectibleCoords.h. Publisher describes extraction of those three sets from GTA SA 1.0 US main.scm. Original license: https://github.com/Flentric/SA.MapCollectibles/blob/77dcc3d65e86df7a3806d4e1607445aacfda1855/LICENSE.

IV source: https://github.com/whampson/pigeon-locator/tree/de21b7df7ec8b10dfe5abe7290d894efbfc1bd11/PigeonLocator/GameData. Per-file counts match Alderney 56, Algonquin 71, Bohan 22, Dukes/Broker 51, TLAD 50, TBOGT 50. Original license: https://github.com/whampson/pigeon-locator/blob/de21b7df7ec8b10dfe5abe7290d894efbfc1bd11/LICENSE.

Full MIT notices are now retained directly in the respective data manifests. The comparison establishes fidelity to the attributed source, not actual in-game pickup testing, official Rockstar verification or precise visual map alignment. San Andreas SVG alignment remains approximate; IV episodes remain separate. No asserted drivable routes.

## Deferred expansion

- Flentric's mod reads gang tags and stunt jumps dynamically from game memory; its static header only includes the three 50-item sets. It does not supply ready-to-import 100 tag and 70 stunt-jump coordinates.
- A public 100-tag app (https://github.com/jakubfalenczyk/gtasa-map) describes positions from Prineside and says individual locations have not been revisited in-game; its repository has no explicit overall license detected. Do not copy its data or artwork until reuse and provenance are established.
- Other plugin projects inspected read live game structures rather than a reusable static dataset.
- Continue showing honest reference/checklist coverage until a suitable source is established; never fill gaps with estimated spawns.

## Upgrade policy

Keep existing evidence-backed records unless a replacement has a demonstrably stronger source, edition match, explicit reuse basis and stable-ID migration plan. Evaluate route candidates on identical stop sets and endpoint constraints; a shorter geometric path is not proof of a better gameplay route.

Source audit executed by retrieving upstream files at the recorded revisions and comparing numeric triples in source order. Static regression checks metadata and license notices, not the remote source. Actual browser and game validation remain separate gates.
