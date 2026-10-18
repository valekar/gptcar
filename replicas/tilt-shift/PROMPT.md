# Toy Town Rush Hour

Reconstruct the complete published original at 38 seconds, 1280 × 720, 24 fps, with a 1920 × 1080 production canvas and a supersampled physical/tilted focus-band renderer. This is a source-informed reconstructed prompt, not a recovered original conversation.

# Toy Town Rush Hour — matched recreation brief

Status: original scene sequence audited. Independent reconstruction may proceed.

Measured delivery: **1280×720, 24fps, 912frames, 38s**. Production canvas:1920×1080.

STYLE.md SHA256: `131ae50c6bddd30922638cbd5f2fae5c047223360a3f6924b074b0db525a5c63`. Original video SHA256: `2396f4881e386bfcad7a9e3f79dbab0614255c25ba51bd5c24ea29ab8e743e01`.

Published premise: Morning rush hour in a town that looks like a model: traffic, trains and tiny people.

The original conversation prompt is unavailable. This brief reconstructs the complete published style, story, script and reference movie; it does not claim to be a recovered verbatim chat. Generate new voice and music. Attribute shared generic helpers and licensed assets; independently assemble the scene.

## Reference artwork and performance

Model a dense toy town with window grids, rooftop equipment, water towers, road markings, park pond, fountain, trees and a full rail station. A narrow focus band, strong physical foreground/background blur, saturated toys and long-exposure trails establish the miniature scale. Preserve the growing traffic orchestration, in-world rooftop title, green-light notes and the long commuter train as bass. At08:00 the camera dives and slows from40× to real time for a mother duck and five ducklings on a zebra crossing. The last duck fails and retries the curb hop while the music rests. Traffic releases before the logarithmic rise into a repeated circuit-board city pattern and the green road-sign ending.

## Complete timed scene order

**0.0000–5.0000s · dawn**

High oblique dawn town: one car and its long-exposure light trail, narrow sharp band follows near-camera lane.

Voice cues: v1.

**5.0000–9.0000s · title**

Oblique rooftop view toward unobstructed in-world neon TOY TOWN RUSH HOUR; each letter lights on an eighth note.

**9.0000–14.0000s · ix**

High intersection/station push, traffic/crowd flows; green lights gate marimba.

Voice cues: v2.

**14.0000–19.0000s · train**

Commuter train enters/stops/goes; carriages become bass notes.

Voice cues: v3.

**19.0000–24.0000s · jam**

Straight top-down slow rotation at gridlock; hero car held in front of crossing; speed ramps40×→1× during dive.

Voice cues: v4.

**24.0000–30.0000s · ducks**

Low real-time medium close-up over blurred hood/headlights: mother duck and ducklings cross; last duck fails hop then succeeds. Narrowest blur band; no music except discrete hop notes.

Voice cues: v5.

**30.0000–34.0000s · rise**

Traffic releases, engine rev; logarithmic vertical rise40m→820m through thin cloud to circuit-board pattern.

Voice cues: v6.

**34.0000–38.0000s · end**

High pattern view and road-sign style end card; final chord at34.

## Full narration — exact published words

- **v1 · 0.9s** — Six a.m. One car. One note.
- **v2 · 9.6s** — Every green light adds a beat.
- **v3 · 14.3s** — The seven-forty brings the bass.
- **v4 · 19.4s** — By eight, the whole town is playing.
- **v5 · 25.9s** — Every song needs a rest.
- **v6 · 30.6s** — Then... take it from the top.

The companion JSON preserves each original voice name, speed, available original duration, subtitle variant and source record. Fresh synthesis must retain every word without truncation.

## Exact on-screen text

The complete published subtitles follow. Additional title/prop/callout literals, timed cue JSON and timeline text are retained in `on_screen_text_inventory` in the companion JSON; source hashes identify their provenance.

```srt
1
00:00:00,850 --> 00:00:03,869
Six a.m. One car. One note.

2
00:00:09,550 --> 00:00:12,047
Every green light adds a beat.

3
00:00:14,250 --> 00:00:16,856
The seven-forty brings the bass.

4
00:00:19,350 --> 00:00:22,007
By eight, the whole town is playing.

5
00:00:25,850 --> 00:00:28,167
Every song needs a rest.

6
00:00:30,550 --> 00:00:32,845
Then… take it from the top.

```

## Sound direction and recreation

Sampled minimalist marimba ensemble (`demo/music/score.py`), 120 BPM, so the 8 Hz time-lapse stutter is exactly a 16th note. **Fixed phrase skeleton; city events decide which notes sound**: cars crossing stop lines gate marimba A, green lights play woodblock accents, crowds trigger glockenspiel, train carriages play the bass; each section has a base fill rate.

- At peak density the skeleton is full, with phased marimba B and tuned car-horn chords (sampled brass staccato pulsing 8ths).
- The real-time drop is a **tape-stop**: varispeed 1 → 0.22, voices drop out one by one, then true silence. During the rest only one soft note per story event plays, each duck hop a step up the scale.
- The first note of the film is the top note of the final chord.

Sound design: time-lapse = music first with a faint granular sped-up city hiss, rail clacks, relay clicks; real time = idling engines, distant city, sparrows, tiny quacks and peeps, webbed feet patting asphalt; release = engines rev, wind sweeps up during the rise.

Voice: relaxed American male, Kokoro `am_adam`, speed 0.9–0.95, 5–6 short lines, music ducked ~8 dB.

## Asset requirements and unresolved gaps

- The original conversation prompt is not published. The complete published style, script, timing and reference movie support the reconstruction.

## Audited coverage and provenance

[
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/tilt-shift/sheets/sheet-01.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/tilt-shift/sheets/sheet-02.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/tilt-shift/sheets/sheet-03.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/tilt-shift/sheets/sheet-04.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "times": [
      27.1,
      27.5,
      27.9,
      28.3,
      29.0
    ],
    "sheet": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/outputs/gptcar/work/gptcar/matched-audit/event-frames/tilt-shift/sheet.jpg"
  }
]

All regular sheets cover the full film. Supplemental timestamps are listed where used. No claim is made that every encoded frame was inspected. The companion JSON retains complete STYLE.md, DEMO.md, FACTS/CREDITS, exact source hashes, full timeline, fetch scripts and original asset inventory.
