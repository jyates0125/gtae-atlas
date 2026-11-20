# Atlas 9.0 Pictured Catalog — Tested Scope and Gaps

**Master visual spec:** Team Jura Original Designed Brand, Elario Studios → Team Jura → Atlas. Uses approved local crew image, original purple/orange/gold card treatment and accessible controls. Neither GTADB nor GTAWeb site artwork/icons have been copied.

## Implemented in this package

- Three dedicated galleries: `atlas90-weapons.html`, `atlas90-vehicles5.html`, `atlas90-vehicles6.html`.
- Every rendered card has a visible image element; GTA V archive illustrations are directly linked to the community archive, with original SVG art fallback when a file fails or is unavailable.
- Real name, model/archive ID, grouping, search, category filter, personal collected/wishlist tracking, export, comparison selections (maximum three items), pagination, and source/art links.
- Optional opt-in image archive discovery can find more archive model IDs at runtime. It is NOT guaranteed to retrieve all images offline or at GitHub rate limits. Model names derived from archive filenames need individual verification.
- GTA VI cards do not misrepresent GTA V reference artwork as official GTA VI screenshots. Research candidacy is distinguished from official confirmation, and original illustration fallback is used for models without referenced art.
- Universal Atlas navigation and All Maps page get new pictured catalog links. Loki map **view option** is removed while approved Loki character remains in Team Jura branding.
- Integration is idempotent; original `team-jura-catalog-v51` and map progress keys remain unchanged.

## Important remaining feature-parity gaps

1. **Every weapon and every vehicle:** complete and continuously current GTA Online DLC / variant inventory is not verified. Compare against GTADB (128 weapon entries as seen Nov 2026), GTA Base (105 weapons in a different scope), and GTA VI evidence-graded source entries. We avoid inventing false parity counts.
2. **Complete GTA VI official artwork:** not provided in this package. Some cards show source-labeled GTA V model references, not GTA VI screenshots. Additional rights-reviewed source art can be added by record.
3. **Deep stats:** per-model handling, weapons damage, fire rate, ammo, prices, weapon attachments, visual variants, purchase locations, availability, and game edition/season are not populated without validated source records.
4. **Comparison:** selection chips and class labels only; no normalized performance-stat comparison yet.
5. **Source media:** third-party direct images may break due to availability or licensing changes; original fallback is deterministic. Stuyk archive README permits jsDelivr linking examples, but archive has no repository LICENSE file, so use should be reviewed before public/commercial redistribution.
6. **Full GTAWeb parity:** GTA V interactive categories, filters, routes, timed events, coordinates, dailies, weekly inventories, heist tools, and every classic game world require a separate measured live functional audit.
7. **Visual parity:** page-specific screenshot comparisons with approved original designs after Cloudflare deployment are still pending.

## Research / attribution

- https://github.com/Stuyk/gtav-image-archive — reference weapon and vehicle pictures / CDN examples.
- https://www.gtabase.com/grand-theft-auto-v/weapons/ — GTA V/Online weapon database.
- https://gtadb.net/weapons/ — weapon catalogue.
- https://gtadb.net/gta-6/vehicles/ — evidence and pictures for GTA VI vehicles.
- https://www.gtabase.com/gta-6/vehicles/ — differing scope of GTA VI vehicle identifications.

**Do not claim all image links or full game-specific parity work until checked live.**
