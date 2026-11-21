# Atlas 22.5 · GTA V Story and GTA Online character appearances

**Purpose:** One character may appear in both GTA V Story and GTA Online, but **each game has a separate indexed profile and a game-correct map link**. This is not permission to mix Story collectibles, events, routes or map markers with GTA Online.

| Character | GTA V Story source and role | GTA Online source and role |
|---|---|---|
| Lamar Davis | [Community GTA V Story mission index](https://gta.wiki/w/Missions_in_GTA_V): Franklin's friend and early mission partner | Existing sourced Online cast reference, mission/contact role |
| Lester Crest | [Community GTA V Story character index](https://gta.wiki/w/Characters_in_GTA_V): supporting heist planner | Existing sourced Online heist contact |
| Franklin Clinton | Original GTA V Story protagonist record | [Rockstar Newswire, December 15, 2021](https://www.rockstargames.com/newswire/article/ak759k91592728/gta-online-the-contract-out-now): F. Clinton and Partner Agency, GTA Online The Contract |
| Chop | Original GTA V Story companion record | [Rockstar Newswire, December 15, 2021](https://www.rockstargames.com/newswire/article/ak759k91592728/gta-online-the-contract-out-now): companion appearing with the GTA Online Agency cast |

These four new, scoped entries raise the seed to **40 character appearances**, not 40 unique individuals and not an exhaustive franchise roster. Source confidence remains per record. Reused remote reference image URLs are *not* a statement of image reuse permission. No spawn coordinates, collectibles, inventory, or player-owned data added.

**UI:** Search by name now finds both documented appearances. The Story or Online tab shows only that edition, and profile detail contains a direct link to the other documented edition. The game-specific map link stays in the correct world.

**Engineering:** `atlas222-characters.js` name-first search, versioned links and shareable dialogs; `scripts/test_atlas222_vi_browser.py` tests real Story/Online behavior at desktop 1440 and phone 390/375; source tests pin the curated scope and source distinctions. Native Safari is not yet reviewed.