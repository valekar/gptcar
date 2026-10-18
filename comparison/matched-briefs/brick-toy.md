# Rocket from Spare Parts — matched recreation brief

Status: original scene sequence audited. Independent reconstruction may proceed.

Measured delivery: **1280×720, 24fps, 1296frames, 54s**. Production canvas:1920×1080.

STYLE.md SHA256: `29b23e846951856b722a698a03c9458cfc17b4fc71d044f45d773acf2a742768`. Original video SHA256: `1d74377276a890a3094601f939786b29a70bbde495ee40a75b43ddadd6337936`.

Published premise: A brick astronaut builds a rocket from spare parts and flies to a brick moon.

The original conversation prompt is unavailable. This brief reconstructs the complete published style, story, script and reference movie; it does not claim to be a recovered verbatim chat. Generate new voice and music. Attribute shared generic helpers and licensed assets; independently assemble the scene.

## Reference artwork and performance

Build the full physical toy world on a real walnut desk, with photogrammetry tea set and articulated lamp at household scale. The white brick robot has a cylindrical head, navy face with two white eyes, red antenna ball, three coloured chest buttons, rigid tube arms and separate block legs. Dense bevelled studs, seams, clearcoat, fingerprints, AO and macro depth of field are essential. Show the thin first rocket failing into individual rigid parts; the seated disappointment, brick pickup and rummage; a broader finned rocket rebuilt from the spares; the complete countdown, brick flame/smoke, flight to the book-stack moon, landing, red base brick placement and extended desk reveal. Preserve all21 shots and54seconds.

## Complete timed scene order

**0.0000–3.4000s · macro**

Extreme macro of one red bevelled plastic brick on real walnut desk; room props soft beyond focus.

Voice cues: v1.

**3.4000–5.6718s · place**

Tiny brick-built astronaut snaps first piece onto build at4s.

**5.6718–7.3437s · mA**

Low heroic build montage: first rocket layers fly in on arcs and snap.

Voice cues: v2.

**7.3437–9.0155s · mB**

Second build angle; rigid studded layers stack, camera smooth and character on twos.

**9.0155–10.6873s · mC**

Third low-angle build shot, saturated toy primaries against muted tea-set mountain.

**10.6873–12.3592s · mD**

Fourth detail build angle, no brick stretching.

**12.3592–14.0310s · mE**

Fifth build detail leading to small cone top.

**14.0310–16.9000s · proud**

Astronaut proud V-arm pose; rocket begins to wobble.

**16.9000–20.5000s · collapse**

Rocket tips about base edge then independent rigid bricks fall under precomputed gravity and settle; impact shake; music cuts.

**20.5000–25.0000s · alone**

Low wide lonely shot, astronaut small with fallen pieces; room tone and ticking clock.

Voice cues: v3.

**25.0000–26.3000s · pickup**

Frontal close-up: glove/brick in focus, picks one useful spare piece.

Voice cues: v4.

**26.3000–29.8000s · rummage**

Searches parts, tosses wheel and flower, discovers bigger cone; quiet theme returns.

**29.8000–32.5000s · rebuild**

Same fallen pieces fly back and snap every.19s; stronger rocket assembled.

**32.5000–34.2000s · visor**

Helmet/visor countdown close-up, radio and Quindar.

Voice cues: c3.

**34.2000–35.4000s · fins**

Fin detail with countdown, held rigid poses.

Voice cues: c2, c1.

**35.4000–36.5000s · pad**

Launch-pad anticipation and heartbeat, brick fire flickers before ignition.

**36.5000–40.0000s · liftoff**

Ignition at36.5; rising low-angle camera tracks rocket; flame/smoke made of bricks.

**40.0000–42.5000s · cruise**

Tracking shot beside rocket with book-stack moon visibly ahead.

**42.5000–48.0000s · moon**

Landing on grey brick moon/book stack; astronaut exits and places single base brick.

Voice cues: v5.

**48.0000–51.7100s · reveal**

Slow high pullback reveals desk, tea-set mountain, book moon and lamp sun.

**51.7100–54.0000s · endcard**

Darkened final wide with stepped friendly title and credits.

## Full narration — exact published words

- **v1 · 0.8s** — Every rocket starts with one brick.
- **v2 · 6s** — Then another. And another.
- **v3 · 22.6s** — The first one fell apart.
- **v4 · 25.6s** — That's okay. Now we have spare parts.
- **c3 · 33.3s** — Three.
- **c2 · 34.3s** — Two.
- **c1 · 35.3s** — One.
- **v5 · 45.2s** — And every moon base... starts with one brick.

The companion JSON preserves each original voice name, speed, available original duration, subtitle variant and source record. Fresh synthesis must retain every word without truncation.

## Exact on-screen text

The complete published subtitles follow. Additional title/prop/callout literals, timed cue JSON and timeline text are retained in `on_screen_text_inventory` in the companion JSON; source hashes identify their provenance.

```srt
1
00:00:00,750 --> 00:00:03,762
Every rocket starts with one brick.

2
00:00:05,950 --> 00:00:08,365
Then another. And another.

3
00:00:22,550 --> 00:00:25,276
The first one fell apart.

4
00:00:25,550 --> 00:00:28,797
That's okay. Now we have spare parts.

5
00:00:33,250 --> 00:00:34,250
Three…

6
00:00:34,250 --> 00:00:35,250
Three…  Two…

7
00:00:35,250 --> 00:00:36,500
Three…  Two…  One…

8
00:00:45,150 --> 00:00:48,843
And every moon base… starts with one brick.

```

## Sound direction and recreation

Two Kevin MacLeod tracks (CC BY 4.0), edited to the picture by `demo/music/edit.py`: "Monkeys Spinning Monkeys" (playful, cut on bars) for building, the same theme returning quietly for the rebuild, "Heroic Age" as the orchestral swell for the climax. The edit makes the climax hit land on ignition and the final chord land on the end card (bar-aligned jumps, chroma similarity at the joins). `story.js` times are aligned to the music bars.

Silences: music cut dead on the collapse, leaving room tone and a ticking clock; music pulled out again before the climax, with a low heartbeat drum under the countdown.

Foley specific to this film: ignition boom and rocket roar; radio chatter with Quindar beeps.

Voice: warm British storyteller, Kokoro `bm_george`, speed ~0.9, 4–6 short lines; mission control is `am_adam` through a radio filter (band-pass 380–2800 Hz + soft saturation) with Quindar beeps. Every line verified with whisper. Voice compressed, music ducked ~40 % under voice, −14 LUFS.

## Asset requirements and unresolved gaps

- The original conversation prompt is not published. The complete published style, script, timing and reference movie support the reconstruction.

## Audited coverage and provenance

[
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/brick-toy/sheets/sheet-01.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/brick-toy/sheets/sheet-02.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/brick-toy/sheets/sheet-03.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/brick-toy/sheets/sheet-04.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/brick-toy/sheets/sheet-05.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "times": [
      17.37,
      17.65,
      18.0,
      36.5,
      37.0,
      44.2,
      46.6
    ],
    "sheet": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/outputs/gptcar/work/gptcar/matched-audit/event-frames/brick-toy/sheet.jpg"
  }
]

All regular sheets cover the full film. Supplemental timestamps are listed where used. No claim is made that every encoded frame was inspected. The companion JSON retains complete STYLE.md, DEMO.md, FACTS/CREDITS, exact source hashes, full timeline, fetch scripts and original asset inventory.
