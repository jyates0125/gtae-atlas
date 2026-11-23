# Atlas 32.9 — One Last Ride 39-second **music-only lock** and voice-session handoff

**Recorded:** 2026-11-23 (America/Chicago). **Status:** owner-selected working master; private editorial proof only; no Cloudflare/public video release. **Next intended voice review:** 2026-11-24, on the owner's next request (not an autonomous scheduled render).

## Decision
The owner explicitly approved **the MUSIC-ONLY edition** of the 39-second teaser while the three character voices are refined separately. **Do not** substitute the rough synthetic-voice theatrical version, old 64-second 2D teaser, or earlier 40/46-second cinema rough cuts as the working video. Preserve the 39-second picture edit, nine scene timings, Loki/Scaly hand rescue, C-Mac's 55th/Yeti beat, Arcadius argument, Elario score and foley until the owner approves a specific change. The finished 4:15 treatment and 8:30 extended screenplay remain separate.

### Locked, checked master
- File in the conversation's original source kit: `team_jura_olr_39/ONE-LAST-RIDE-39-SECOND-MUSIC-ONLY.mp4`.
- Copy in new voice-ready handoff: `ONE-LAST-RIDE-39S-MUSIC-ONLY-APPROVED.mp4`.
- SHA-256 **`520a05e165d7dac953c3194e8651bf2985aa7e6d5bd60572ce7809a830720976`** (copy matches original).
- 39.000 seconds; 1920×1080; H.264 video with AAC music/effects. **Zero audible placeholder speeches.**
- New smaller phone-safe, still music-only version: `ONE-LAST-RIDE-39S-MUSIC-ONLY-IPHONE-720P.mp4`. 39.000 seconds; 1280×720; H.264/AAC; SHA-256 `ddd2d44c6d58b114cceb523fea47dfce9fbe3259a449a3ce8e61d8b5b002798f`.
- Use source `01-original-score-and-effects.wav` (48 kHz) for lossless music and foley. Do not double the volume by playing both original MP4's AAC soundtrack **and** this WAV simultaneously.

### Five exact, spoken-only-when-visible slots

| Cue | Millisecond range | Character | Exact script | Voice direction |
| --- | --- | --- | --- | --- |
| 1 | **00:00.900–00:03.550** | **LOKI** | “You are not selling my last ride, mate!” | Owner's Loki: red top hat/red hair, playful and gritty; fast, original British Isles/Traveller-influenced cadence, *not* an actor imitation |
| 2 | **00:04.450–00:07.400** | **SCALY** | “Quit arguing. Our crew's in trouble.” | Modern short dark-brown hair/glasses; distinct low, thoughtful, urgent-original voice |
| 3 | **00:14.280–00:17.650** | **C-MAC** | “Everything gon' C alright. You five me?” | Bald, clean-shaven, heavyset, some blue; serious-but-funny 55th LA energy; an **original** interpretation, not a clone of the real person's voice |
| 4 | **00:22.000–00:24.200** | **SCALY** | “Loki! Give me your hand!” | Protective and suddenly urgent, visible in the dock rescue |
| 5 | **00:24.450–00:26.650** | **LOKI** | “Aye! I'm right here, brother!” | Relieved loyalty, visible in the dock rescue |

No voiceover narration or extra offscreen lines in this cut. Individual consented voice takes only. Keep the score under each performance; never embed the earlier synthetic readings in the bed. No celebrity/movie/game soundalikes or scraped samples.

## Ready-to-use package and reproducible QA

The owner was delivered a new archive in this conversation:

`TEAM-JURA-ONE-LAST-RIDE-39S-MUSIC-LOCK-VOICE-READY.zip`

SHA-256: `60d41706024e7c8ce7c16360e7e626371041d5e5cbf8b7d28b69e2b6e9dabe9f`; ~22.2MB. Includes the unchanged verified full-HD music MP4, newly validated 720p music-only MP4, lossless original 48kHz score/FX, nine-scene review image, SRT captions, editable machine-readable cue JSON, `START-HERE-TOMORROW.md`, and `mix_voices.py` with an empty five-slot `voice_takes/` folder. No new voice speech is included.

**Mixer passed meaningful local QA:** processed a temporary **original test sine wave** in the Loki 00:00.900 slot over the untouched music bed; output stayed precisely 39.0 seconds and kept the complete video frame count, the original locked master checksum remained unchanged, and the script correctly refused a five-second voice recording in a 2.65-second slot (no silent truncation). The synthetic *tone* was deleted after QA and is **not** included with the final archive. Package ZIP CRC test passed. Source program uses Python 3 + FFmpeg only; voice session can alternatively be edited fully in free Kdenlive.

## Continued production, not publication
1. Preserve the 39-second music-only master as the baseline **now**.
2. On the next session, develop and approve three original distinct speaking voices, five clips. Re-record individually as needed; no rewrites or video re-renders required to change a voice.
3. Mix consenting voice performances on top of the original score, listen on iPhone for audibility and timing, and export a **new review** MP4. Never overwrite the unchanged master.
4. Full character likeness/visual inspection, complete motion/voice signoff, original artwork/music and fan-content rights review, and owner approval all remain **OPEN**. Do not publish film to the live GTAE site or merge `development`/`main` based on this docs-only lock.

**Many Crews. One Vision.**
