# Character portrait coverage — Atlas 33.1 staging

Local-first on character gallery, profile cards and Universe Database; homepage cast rail already prefers a local concept. 40 appearance records, 15 dedicated local illustrations and 25 reference-only appearances (not proof that every external image fails). GTA characters and original assets remain the property of their rightsholders. Elario concepts are labeled fan illustrations. Separate game appearances remain separate records, including when names are repeated.

## Locally backed portraits (15)

| Character | Game | Asset |
|---|---|---|
| Michael De Santa | GTA V | `art/jura221-michael-cinematic.webp` |
| Franklin Clinton | GTA V | `art/jura221-franklin-cinematic.webp` |
| Trevor Philips | GTA V | `art/jura221-trevor-cinematic.webp` |
| Lamar Davis | GTA V Story | `art/lamar-gta-v-story.webp` |
| Lamar Davis | GTA Online | `art/lamar-gta-online.webp` |
| Agent 14 | GTA Online | `art/elario-agent14-portrait.webp` |
| Agatha Baker | GTA Online | `art/elario-agatha-baker-portrait.webp` |
| Niko Bellic | GTA IV | `art/jura221-niko-cinematic.webp` |
| Carl Johnson | GTA San Andreas | `art/jura221-cj-cinematic.webp` |
| Big Smoke | GTA San Andreas | `art/elario-bigsmoke-portrait.webp` |
| Tommy Vercetti | GTA Vice City | `art/jura221-tommy-cinematic.webp` |
| Claude | GTA III | `art/jura221-claude-cinematic.webp` |
| Lucia Caminos | GTA VI Story | `art/jura221-lucia-cinematic.webp` |
| Jason Duval | GTA VI Story | `art/jura221-jason-cinematic.webp` |
| Huang Lee | GTA Chinatown Wars | `art/elario-huang-lee-portrait.webp` |

## Reference-only portrait queue (25 appearances)

| Character | Game | Record ID |
|---|---|---|
| Lester Crest | GTA V / Online | `character:lester` |
| Chop | GTA V | `character:chop` |
| Simeon Yetarian | GTA V | `character:simeon` |
| Amanda De Santa | GTA V | `character:amanda` |
| Jimmy De Santa | GTA V | `character:jimmy` |
| Tracey De Santa | GTA V | `character:tracey` |
| Pavel | GTA Online | `character:pavel` |
| English Dave | GTA Online | `character:english-dave` |
| Roman Bellic | GTA IV | `character:roman` |
| Kate McReary | GTA IV | `character:kate` |
| Sean 'Sweet' Johnson | GTA San Andreas | `character:sweet` |
| Lance Vance | GTA Vice City | `character:lance` |
| Victor Vance | GTA Vice City Stories | `character:vic-vance` |
| Toni Cipriani | GTA Liberty City Stories | `character:toni-cipriani` |
| Johnny Klebitz | GTA The Lost and Damned | `character:johnny-klebitz` |
| Luis Fernando Lopez | GTA The Ballad of Gay Tony | `character:luis-lopez` |
| Cal Hampton | GTA VI Story | `character:cal-hampton` |
| Boobie Ike | GTA VI Story | `character:boobie-ike` |
| Dre'Quan Priest | GTA VI Story | `character:dre-quan-priest` |
| Real Dimez | GTA VI Story | `character:real-dimez` |
| Raul Bautista | GTA VI Story | `character:raul-bautista` |
| Brian Heder | GTA VI Story | `character:brian-heder` |
| Lester Crest | GTA V Story | `character:lester-story` |
| Franklin Clinton | GTA Online | `character:franklin-online` |
| Chop | GTA Online | `character:chop-online` |

Use permitted subject-specific references or individually created accurate fan concepts; preserve the correct title/era. Do not substitute generic art for a finished portrait or claim a remote image was verified just because the URL is present. Prioritize protagonists for VCS, LCS, TLAD and TBOGT, then the supporting cast and distinct Story/Online portrayals. The newly generated cinematic CJ artwork from the chat is not yet in this repository: the existing local CJ portrait remains active.

## Validation

Static test checks local files and explicit preference. Browser test checks every record, same-origin decode for the 15 concepts and the named pending state for the others under intentionally blocked remote requests at 375, 390 and 1440 px. This is a failure-mode check, not a remote publisher availability/rights audit. Real visual review and owner release approval remain required.

## Atlas 29.3 — focused portrait acceptance checkpoint

- Agent 14, Carl Johnson (CJ) and Claude remain locally bundled, **individual Elario fan concepts**, not verified game-model renders. The real-browser check now requires each exact image to decode at phone and desktop widths, and checks the individual profile dialog.
- Lamar Davis has **two separate** GTA V Story and GTA Online records. A dedicated source contract and browser journey check both appearances, distinct world destinations and the clearly labeled individual-portrait-pending fallback when external references are unavailable.
- A dedicated subject-specific Lamar portrait is **not yet delivered**. No generic scene or unrelated image is presented as a completed Lamar portrait. Owner visual review of Agent 14, CJ and Claude is still required; automated decode only proves that the file renders, not that it resembles the character.
- Tests: `scripts/test_atlas293_lamar_appearances.py`, `scripts/test_atlas293_character_portraits_browser.py`, scoped workflow `atlas293-garage-forge.yml`. These are staging checks and do not authorize release.

The two Lamar portraits come from the Team Jura Story/Online artwork review package. Both are original AI-assisted fan concepts pending owner likeness review.
