# The Island That Grew — matched recreation brief

Status: original scene sequence audited. Independent reconstruction may proceed.

Measured delivery: **1280×720, 24fps, 1272frames, 53s**. Production canvas:1920×1080.

STYLE.md SHA256: `d87e56fd3677841e19f273352ea3481328a237403012ffa7ccb6089c97401702`. Original video SHA256: `d5f2da94f3d8718801ed1381fe1dd593e2fbc51e53995ada27d5c2bf580b9c5b`.

Published premise: An island and its village grow tile by tile from an empty sea, each tile a note, into a starry night.

The original conversation prompt is unavailable. This brief reconstructs the complete published style, story, script and reference movie; it does not claim to be a recovered verbatim chat. Generate new voice and music. Attribute shared generic helpers and licensed assets; independently assemble the scene.

## Reference artwork and performance

Begin with a lonely red/white buoy on a faceted sea; the first hexagonal tile rises at6.25s. Build sand/soil/grass tiers, central rock, many trees, multistorey houses with coloured roofs, palms, windmill, dock and boat through the original sequence of close views and turntable returns. Use true directional shadows, soft coast glow, flat facets and rising tiles with polygonal splashes. The boat departs before dusk; windows illuminate in musical order and the lost boat becomes a tiny distant light. Only then assemble the lighthouse and ignite its rotating volumetric beam, which replays the village melody and guides the boat home. Keep the25× pullback, distant new buoy and complete ending.

## Complete timed scene order

**0.0000–10.6250s · grow**

Lonely buoy in empty faceted sea; one D5 bell, then tiles rise from6.25s with splash and notes; ortho turntable slow pullout.

Voice cues: v1, v2.

**10.6250–12.5000s · rock**

Low-elevation tight close-up of central rock peak breaching sea with splash.

**12.5000–13.7500s · grow2**

Return to whole island turntable, growing tile footprint.

**13.7500–16.2500s · trees**

Medium trees pop at exact musical events, cone andicosahedron foliage.

**16.2500–18.7500s · houses**

Near view floors and prism roofs drop, bounce and settle, each note building melody.

**18.7500–21.2500s · details**

Windmill, dock planks, boat dropped into water; close views sell construction.

**21.2500–23.7500s · square**

Village in day; actual directional sun sweeps100degrees in2.5s, shadow time-lapse.

**23.7500–26.2500s · dock**

Side camera trails boat departing across frame from dock.

**26.2500–31.2500s · dusk**

Fixed3/4 wide with slow push; warm windows light on eighths as sky warms.

Voice cues: v3.

**31.2500–33.7500s · lost**

Very wide low-elevation night; tiny boat light far away, island lower left, negative space and missing note.

Voice cues: v4.

**33.7500–36.2500s · tower**

Final lighthouse rings rise at33.75s, lamp-room glass and cone.

**36.2500–53.0000s · beam**

Ignite36.25s; high camera sees beam replay houses in spatial order, boat answering bell at39.375; home/docked41.25/42.5; pure25× zoom to tiny island with distant buoy echo, end card48.75.

Voice cues: v5.

## Full narration — exact published words

- **v1 · 3.7s** — Once, the ocean knew only one note.
- **v2 · 7s** — Then, the ground began to sing.
- **v3 · 26.5s** — By evening, every house knew its part.
- **v4 · 31.25s** — But one note was still missing.
- **v5 · 44s** — Far away, another island hears its first note.

The companion JSON preserves each original voice name, speed, available original duration, subtitle variant and source record. Fresh synthesis must retain every word without truncation.

## Exact on-screen text

The complete published subtitles follow. Additional title/prop/callout literals, timed cue JSON and timeline text are retained in `on_screen_text_inventory` in the companion JSON; source hashes identify their provenance.

```srt
1
00:00:03,650 --> 00:00:06,706
Once, the ocean knew only one note.

2
00:00:06,950 --> 00:00:09,702
Then, the ground began to sing.

3
00:00:26,450 --> 00:00:29,488
By evening, every house knew its part.

4
00:00:31,200 --> 00:00:33,770
But one note was still missing.

5
00:00:43,950 --> 00:00:47,634
Far away, another island hears its first note.

```

## Sound direction and recreation

- **Event-driven**: page `EV` entries carry `note`; `music/score.py` synthesizes every one at its exact time (rise → marimba, pop → kalimba, floor → woodblock, roof → kalimba+marimba = the melody, window → soft kalimba, ring → rising marimba, beamhit → kalimba lead + marimba octave + bell shimmer). Underneath: ambient pad, a gentle marimba ostinato and shaker/soft kick only in the day and climax sections. **96 BPM, D major pentatonic feel.** No piano, no strings.
- **One note as a motif**: a buoy bell on D5 opens the film ("the only note the sea knows") and a distant bell plays the same note at the end.
- **Silence**: the night section drops to a low pad drone, waves and crickets; the music bus is digital zero for the last half-beat before the climax downbeat.
- Growth scheduled on the 16th grid: tiles on halves → quarters → eighths.
- The boat's answering bell sits in a rest of the melody, filling the gap when the beam finds it.
- **Foley** (`mix.py`): as in STYLE.md §7, plus gulls by day (downward-gliding FM chirps), windmill creak, crickets from dusk; the dock plank knock and lighthouse-ring stone thunk, glass tink for the lamp room, whump + hum on ignition. Floors: second knock 0.21 s after the first.
- **Voice**: Kokoro `af_sky` (clear, gentle female), speed 0.86–0.92, 5 short lines. "Sea" was heard as "C" in a film about notes, so the narration says "ocean".
- **Mix**: voice compressed, ~10 dB over the music; music ducked −8 dB under the voice; −14 LUFS; grain 0.

## Asset requirements and unresolved gaps

- The original conversation prompt is not published. The complete published style, script, timing and reference movie support the reconstruction.

## Audited coverage and provenance

[
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/lowpoly-island/sheets/sheet-01.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/lowpoly-island/sheets/sheet-02.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/lowpoly-island/sheets/sheet-03.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/lowpoly-island/sheets/sheet-04.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/lowpoly-island/sheets/sheet-05.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "times": [
      36.25,
      39.375,
      41.25,
      42.5,
      47.5
    ],
    "sheet": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/outputs/gptcar/work/gptcar/matched-audit/event-frames/lowpoly-island/sheet.jpg"
  }
]

All regular sheets cover the full film. Supplemental timestamps are listed where used. No claim is made that every encoded frame was inspected. The companion JSON retains complete STYLE.md, DEMO.md, FACTS/CREDITS, exact source hashes, full timeline, fetch scripts and original asset inventory.
