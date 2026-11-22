# Atlas 23.6 collectible route benchmark

Pinned Story dataset: 275 unique community-mapped source records. Compare nearest-next against the same nearest-next order followed by bounded three-pass open-path 2-opt. Three origins per collection: first source location, world (0,0), last source location. Report aggregate straight-line distance over the three origins, not gameplay travel time, roads, or globally optimal routes.

| Type | Records | Reduction |
|---|---:|---:|
| Nuclear Waste | 30 | 0% |
| Money | 12 | 0.36% |
| Spaceship Part | 50 | 9.44% |
| Stunt Jump | 50 | 16.83% |
| Letter Scrap | 50 | 11.52% |
| Knife Flight | 15 | 2.50% |
| Vehicle Spawn | 3 | 0% |
| Epsilon Car | 5 | 1.35% |
| Epsilon Tract | 10 | 8.32% |
| Under the Bridge | 50 | 12.72% |
| All | 275 | 9.86% |

Independent benchmark executed against the actual repository coordinates; the committed Node regression repeats the comparison with the real shared planner in CI. No new game locations, road graph or gameplay route claimed. Existing main-map planner already uses this improvement; Completion tracker previously used nearest-next only. Upgrade that tracker's new route previews, preserving all stops and prior order on ties; do not replace anyone's saved route. Other worlds/heists retain their current route methods pending their own endpoint and coordinate-specific comparison. Browser and exact-head full acceptance pending.
