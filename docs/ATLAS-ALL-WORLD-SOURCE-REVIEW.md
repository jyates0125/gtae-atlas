# All-world source review — Atlas 23.9

Owner direction: actively seek better sources across all 13 maps; attribution and explicit reuse evidence recorded. Preserve working data when no superior replacement is established. Inventory below is a review of current directory and source evidence, not completed gameplay testing.

| Destination | Current evidence | Next unresolved review |
|---|---|---|
| GTA V Story | 275 locally bundled calibrated community rows, 255 numbered in seven sets | Compare numbering and pinpoint alignment against gameplay; missing sets |
| GTA Online | Scoped catalog, separate rotation state | Individual collectible coordinates, dated rotations; no guessed active pins |
| Leonida | Community provisional map, official references separate | Post-launch source/edition verification and calibration, no bulk promotion |
| Cayo Perico | Independent route workspace and possible chest spots | Exact projection/current daily positions; retain tested planner |
| GTA IV | 2650 source landmarks, 200 source-matched birds | Verify remaining categories and map alignment |
| San Andreas | 320 sourced records across five sets | Individual visual/gameplay alignment; tags 61 direct matches, 39 transcription-only; jumps trigger boxes not ramps |
| Vice City | Personal notebook and source links | Permitted calibrated base and individual coordinates |
| GTA III | Personal notebook and source links | Permitted calibrated base and individual coordinates |
| Vice City Stories | Personal notebook and source links | Edition-specific map and collectible positions |
| Liberty City Stories | Personal notebook and source links | Edition-specific map and collectible positions |
| Chinatown Wars | Personal notebook and source links | Edition-specific map and collectible positions |
| The Lost and Damned | 50 source-matched seagulls, IV explorer link | Other edition categories, native workspace |
| The Ballad of Gay Tony | 50 source-matched seagulls, IV explorer link | Other edition categories, native workspace |

## San Andreas jumps: source extraction
Pinned source: https://github.com/gtasa-savegame-editor/gtasa-savegame-editor/blob/6611e3cf21422bdd530a38743c1d15178d5d5df2/savegame-editor/src/main/resources/savegame.b. MIT software notice in manifest; numerical game-world facts only, no source binary or game artwork redistributed. Checksum 14857859 equals additive file checksum; exact 202752 bytes; BLOCK marker at 160411; 70 records each 68 bytes; next BLOCK marker at expected offset. All 70 start and landing bounds finite, ordered, in world bounds, all rewards 500, unique start boxes. Completion flags ignored. Midpoint of each airborne start box is projected into Toliak map; landing midpoint and full bounds retained. Source numbering is not walkthrough numbering. Reproduce with scripts/extract_sa_jump_zones.py on original source file. No gameplay certification or exact ramp placement. New code pending browser validation.
