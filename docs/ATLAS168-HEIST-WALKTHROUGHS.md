# Atlas 16.8 — mission walkthrough and heist POI enhancement

Staging only, extends current PR #70. The owner-approved cinematic WebPs, separate original heist map concepts and guest checklist keys are unchanged.

Each of the fifteen existing heist workspaces now includes a lightweight guide panel with prerequisite/intel/prep/finale/challenge filtering, searchable steps, clickable What/When/Where/Why/How answers, links to related existing map POIs and a locally stored completion tracker with JSON export. New progress key: `teamjura-heist-walkthrough-v1:<slug>` (never overwrites previous task, map or note keys). No login, no remote account sync.

Guide detail levels:
- **Source-informed mission-specific walkthroughs:** Cayo Perico (Kosatka, gather intel, access, equipment, finale, elite), Kortz Center (Mansion Art Studio, scope museum, gallery objectives, finale), Diamond Casino (Arcade, access photos, vault surveillance, approach), Fleeca, Humane Labs, Prison Break, Series A, Pacific Standard, Doomsday Acts I–III.
- **Research-level planning guidance:** Cluckin’ Bell, Salvage Yard, Auto Shop and Agency VIP. These guide the user to current in-game mission markers instead of inventing specific coordinates, requirements or rotated contract details.
- **All map positions still illustrative**, even where the POI names and general real-world game locations have source evidence. The quality level of an original cinematic map does not establish position accuracy. Heist source links are shown in the guide. Challenges are explained without fabricated tier-specific numbers.

Representative source references checked Nov 20 2026:
- https://www.gtabase.com/gta-online/jobs/heists/the-cayo-perico-heist
- https://www.gtabase.com/missions/gta-online/heists/the-kortz-center-heist
- https://www.gtaboom.com/diamond-casino-heist-scope-out-all-access-points-and-points-of-interest-c29d
- https://www.gtabase.com/gta-online/jobs/heists/the-fleeca-job
- https://www.gtabase.com/gta-online/jobs/heists/the-humane-labs-raid
- https://www.gtabase.com/gta-online/jobs/heists/the-prison-break
- https://gta.wiki/w/The_Doomsday_Heist

Still needed before feature parity claims: exact permitted heist basemaps and georeferencing, verified marker locations, item-by-item source provenance, current Career tier criteria, full user flows in iOS Safari. Browser CI is required before merge, and the user's visual approval is pending.
