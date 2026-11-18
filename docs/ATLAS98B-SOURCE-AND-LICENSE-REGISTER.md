# Atlas 9.8B · External map/source register and rights ledger

Checked November 15, 2026. This separates **source licenses and file-specific permissions** from public web accessibility. A site's 'no reuse forbidden' silence is NOT a grant of permission. Prior Team Jura research on CreepPork, Vector, Plytus, Yanis, Dupzor, GTADB, GTAWeb and GTAMI informs the compatibility roadmap; it does not replace per-work provenance.

| Source or creator | What it may contribute | Rights confirmed / restriction | Atlas action |
|---|---|---|---|
| **GTADB.ORG / rolux + contributors** | GTA IV/V/VI landmarks, coordinate research, map tiles/code | Author repository states MIT code, CC BY 4.0 landmark data/photos/tiles with attribution. Game IP remains Rockstar's. | GTA VI 3,425 sourced research records already mirrored in 9.7 (`data/gtadb-6.json`); 9.8B GitHub Action mirrors IV/V locally, writes attribution/manifests; it does **not** copy game collectibles from a different publisher. |
| **GTADB.net** | Per-collection marker UI, daily activity/source status, article data | Independent publisher. Blanket dataset/artwork redistribution NOT confirmed. | Compare functionality and link to pages, do not bulk copy proprietary original content. |
| **GTAWeb.eu** | GTA Online tool/legend/route examples; Cayo map and classic UI expectations | Feature reference, no blanket rights to map images, code or marker data. | Use for interaction parity, not direct code/data copy without rights. |
| **GTAMI** | GTA VI map/provisional vs official evidence labels | Site says content under the licenses stated on each source page; CC BY 4.0 applies to underlying GTADB contributions, not to all GTAMI editorial/assets. | Link as source; reuse source-licensed GTADB originals instead. |
| **GTAMap.io** | Working category toggles, per-world map styles, progress, routes | Site credits mixed sources including CC BY-SA 3.0 wiki markers, Apache vector map, MIT repositories, and Rockstar game-owned artwork; its full compiled site/map is NOT blanket open licensed. | Compare behaviors, link to classic worlds; go to original upstream license before any import. |
| **Toliak/San-Andreas-vector-map** | GTA San Andreas vector road tracing / geographic artwork | GitHub repository Apache-2.0 for tracing code/map. Rockstar underlying world rights remain. Archived Aug 30, 2026. | Highest priority candidate for a dedicated attributed San Andreas backdrop after rendering/projection tests; not silently installed here. |
| **Ian Albert San Andreas maps** | Radar/aerial map references | Page statement invites reuse, but original Rockstar game radar imagery has separate rights. | Rights and map calibration review before bundling. |
| **CreepPork/GTAV-Maps** | GTA V tiles and existing map-view layer reference | Repository collection MIT; Rockstar original art rights are distinct. | Preserve existing credited layers; test tile host/reliability. Do not treat MIT as blanket ownership of Rockstar artwork. |
| **YANIS / Dupzor / Scaly / Loki community map styles** | VI alternative visual maps and research layers | Artist-specific attribution and use conditions must be checked for each output; existing map views preserved. | Do not remove existing layers; audit which are illustrated/reconstructed and which are game-confirmed. Never assume a flat view has true 3D elevation. |
| **Vector, Plytus and other community candidates** | Source/tiles or coordinate transforms potentially compatible with Atlas | License and exact repo/asset need individual re-verification. | Investigation queue, not accepted data automatically. |
| **GTA Wiki (thegta.wiki / GTA Fandom)** | Counts/collectible descriptions and some licensed community annotations | Game facts used with citations; wiki data/images may be CC BY-SA with share-alike and attribution requirements; Rockstar media remain separate. | 9.8B uses **facts and hyperlinks**, no bulk wiki markup/images. Imported markers would require appropriate derivative license and provenance. |
| **Rockstar Games / Take-Two** | Published game facts, artwork and release information | Trademarks and game artwork belong to rights holder; fan work isn't officially endorsed. | Clear fan disclaimer; source official facts, no fake Rockstar integration. |

## Explicitly verified featured release

Rockstar Games and Take-Two list GTA VI release as **November 19, 2026**. At this report date, Leonida community coordinates remain preliminary and require post-release gameplay cross-check. Any page using "live" must have a dated, verifiable source record or be relabeled.

## Older game world implementation source links

- GTA III: https://gtamap.io/gta-3-map/
- Vice City: https://gtamap.io/gta-vice-city-map/
- Vice City Stories: https://gtamap.io/gta-vice-city-stories-map/
- Liberty City Stories: https://gtamap.io/gta-liberty-city-stories-map/
- Chinatown Wars: https://gtamap.io/gta-chinatown-wars-map/
- The Lost and Damned & The Ballad of Gay Tony: https://gtamap.io/gta-maps/
- GTA IV/V/VI open landmark research: https://github.com/rolux/gtadb.org
- Original score/provenance-based individual collection totals: `atlas98b-collection-data.js` with upstream links and edition notes.

## What we are not pretending

1. Individual game collectible counts are NOT the same as a data dump of coordinates.
2. A public map or image is not necessarily licensed for copying.
3. A source that is CC BY 4.0 may have original photographs or Rockstar game artwork with different rights; inspect before use.
4. A loaded map tile is not proof its marker coordinates are correct.
5. Fan/community source positions for GTA VI are not verified on-disc gameplay pre-release.
6. All map and tracker files remain independent of live Rockstar Online accounts.
