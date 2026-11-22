# Atlas 22.5 · Rockstar character media source ledger

**Scope:** GTA VI Story only. The eight character images here are direct **publisher-hosted source links**, not redistributed assets. The original officially published page is [Rockstar's Only in Leonida](https://www.rockstargames.com/VI/only-in-leonida), inspected November 21, 2026.

The URLs below were obtained from the page's own corresponding linked **Image** elements in character section order, rather than guessed from filenames. A linked image is **not** a commercial reuse license. Media may be changed, restricted, blocked, or unavailable at runtime. The website must fall back to original Elario world scenery and explicitly say it is *not a character portrait*.

| World character | Official character page image (source link; not a guaranteed downloadable asset) |
|---|---|
| Jason Duval | `https://www.rockstargames.com/VI/_next/static/media/mobile.0jzys13fkqnae.jpg` |
| Lucia Caminos | `https://www.rockstargames.com/VI/_next/static/media/mobile.01e24lvhdu677.jpg` |
| Cal Hampton | `https://www.rockstargames.com/VI/_next/static/media/poster.0-ev6i8jbkd19.jpg` |
| Boobie Ike | `https://www.rockstargames.com/VI/_next/static/media/poster.0fhh.f~4df8kw.jpg` |
| Dre'Quan Priest | `https://www.rockstargames.com/VI/_next/static/media/poster.0dgzn0invq.yx.jpg` |
| Real Dimez | `https://www.rockstargames.com/VI/_next/static/media/poster.0fw301vbqh4~b.jpg` |
| Raul Bautista | `https://www.rockstargames.com/VI/_next/static/media/poster.0ntc_0yu6jyg..jpg` |
| Brian Heder | `https://www.rockstargames.com/VI/_next/static/media/poster.02s1e65vr67eq.jpg` |

**Implementation:** `data/atlas-universe-profiles.json` contains these remote links as references. `atlas222-characters.js` renders sourced art with per-image error handling and an honest original WebP fallback. None of the eight files is committed to Elario's `art/` tree. Existing game-scoped records, map engines, local player progress, and original approved artwork are unchanged.

**QA outstanding:** browser network decode for the exact image sources; screenshot inspection at 375px, 390px, 1440px; actual Chrome/Edge CI and owner visual approval; native Safari test. The media link's presence on Rockstar's page is **not** evidence that the browser successfully decoded it in our site, and source attribution alone does not grant monetization or relicensing rights.