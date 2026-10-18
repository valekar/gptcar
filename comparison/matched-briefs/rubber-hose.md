# Coffee Cup Chase — matched recreation brief

Status: original scene sequence audited. Independent reconstruction may proceed.

Measured delivery: **1280×720, 24fps, 1200frames, 50s**. Production canvas:1920×1080.

STYLE.md SHA256: `bf850f9cd22e68b2125fed00d1b9804e91479620b44420ba7ec50e570e472a94`. Original video SHA256: `e7d1d0a0ad1b88ef411b97787fbd83dfdbdb414ad92207a7718466b078a7eeb5`.

Published premise: A coffee cup chases a runaway sugar cube around the kitchen, 1930s-cartoon style.

The original conversation prompt is unavailable. This brief reconstructs the complete published style, story, script and reference movie; it does not claim to be a recovered verbatim chat. Generate new voice and music. Attribute shared generic helpers and licensed assets; independently assemble the scene.

## Reference artwork and performance

Stage the full cartoon inside an Academy4:3 gate with black side bars, monochrome warm greys, film weave, scratches and a soft vignette. A detailed kitchen contains striped wallpaper, tiles, cupboards, a curtain-framed window, jars, pans and ladles. The hero is a white cylindrical mug with black coffee, pie eyes, a left handle, white gloves, noodle limbs and black shoes. The sugar cube has three visible faces and a face on its front. Preserve every acted gag: toaster soot, plate staircase and spoon slide, sink spiral rescue, deliberate release, the cube’s voluntary return, steam heart, ensemble dance and the glove closing the iris. Caption plaques and the moving starburst cards must follow the complete script.

## Complete timed scene order

**0.0000–5.0000s · title**

Rotating sunburst title; fat Shrikhand letters hop in a travelling wave, then the whole card rolls upward like a window shade.

**5.0000–8.3333s · wide1**

Eye-level kitchen proscenium: sleeping squat diner mug, alarm clock, living kitchen props; alarm rings, mug wakes, dips/tastes its own black coffee.

Voice cues: v1a, v1b.

**8.3333–10.0000s · bitterCU**

Hard close-up of pie-eyed mug reacting to bitter coffee, zigzag steam, mouth wah shapes on brass responses.

**10.0000–11.6667s · wide2**

Mug spots projected3D sugar cube by sugar jar; two characters lock eyes in stop-time, wind up and run.

**11.6667–15.0000s · chase**

Eased lateral truck beside noodle-limbed cup and cube across countertop; destination toaster arrives before gag.

Voice cues: v2.

**15.0000–16.6667s · toaster**

Toaster lever is pressed, ticks, ding and spring pop; held blink/reaction.

**16.6667–23.3333s · cupboard**

Medium follow cube up a plate xylophone on eighths; alternate mug climbing on tuba quarters; cube uses spoon slide, crash and downward tilt.

Voice cues: v3.

**23.3333–30.0000s · sink**

High view of sink whirlpool: cube at drain, cup anticipates then extends one rubber arm around whirlpool; full unbroken stretch, silence, tug and retract.

Voice cues: v4.

**30.0000–31.6667s · twoShot**

Mug lowers rescued cube, pats it and turns away rather than eating it.

**31.6667–36.8750s · leaving**

Mug back walks small into background, cube larger on foreground counter hesitates; eye glances, crouch, smile, hop and voluntary leap into mug.

**36.8750–38.3333s · sweetCU**

Close reaction as sugar enters coffee; white steam heart, sweet grin.

Voice cues: v5.

**38.3333–43.3333s · dance**

Pull from hero close-up to packed medium-full: living props behind and larger dancers in a foreground row; sway, kick, squat-and-spring; held ta-da.

**43.3333–46.6667s · iris**

Iris follows heroes; glove reaches beyond frame and pulls iris shut.

Voice cues: v6.

**46.6667–50.0000s · end**

Sunburst The End card, original style/credits as published reference.

## Full narration — exact published words

- **v1a · 5.15s** — Seven a.m., folks!
- **v1b · 7.053333333333334s** — And boy, is this coffee bitter!
- **v2 · 11.666666666666668s** — And they're off!
- **v3 · 17.083333333333336s** — Up the china cabinet... what a climber!
- **v4 · 23.750000000000004s** — Look out, folks... the drain!
- **v5 · 37.50000000000001s** — Well, I'll be... sweet as pie!
- **v6 · 43.75s** — Good night, folks!

The companion JSON preserves each original voice name, speed, available original duration, subtitle variant and source record. Fresh synthesis must retain every word without truncation.

## Exact on-screen text

The complete published subtitles follow. Additional title/prop/callout literals, timed cue JSON and timeline text are retained in `on_screen_text_inventory` in the companion JSON; source hashes identify their provenance.

```srt
1
00:00:05,150 --> 00:00:09,583
Seven a.m., folks! And boy, is this coffee bitter!

2
00:00:11,667 --> 00:00:13,617
And they're off!

3
00:00:17,083 --> 00:00:20,333
Up the china cabinet... what a climber!

4
00:00:23,750 --> 00:00:26,350
Look out, folks... the drain!

5
00:00:37,500 --> 00:00:40,200
Well, I'll be... sweet as pie!

6
00:00:43,750 --> 00:00:45,700
Good night, folks!

```

## Sound direction and recreation

Original big-band score (`demo/music/score.py`, VSCO 2 CE / VCSL samples via `core/audio/sampler.py`, banjo via `pluck.py`). **144 BPM, 4/4 → 1 beat = 10 frames**, 1 bar = 1.667 s, 28 bars. One original 4-bar syncopated theme, stated for the title, the chase, a slow solo-clarinet version for the tender beat, and a key-change full-band out-chorus for the climax.

Stops (hard silence including reverb tails) on the lock-eyes beat, on the suspense before a gag, and a full 2 beats of silence right after the stretch; stingers on every gag; slide whistle for every stretch / slide / fall; the xylophone *is* the plates. The projector clatter is the only sound inside the silence.

Foley specific to this film (all synthesised): porcelain = hard inharmonic partials (~2.7 / 4.2 / 6.3 kHz) + tiny transient; thick mug = lower, duller partials; sugar = high woodblock + sparse crunch; clock = 18 Hz hammer on two bells; toaster = click, eighth-note ticks, bell + spring "boing"; water = filtered noise + rising blips, drain slurp, bubble bed; rubber = sawtooth creak through a band-pass.

Voice: an old radio announcer calling the action like a horse race (Kokoro `bm_lewis`, speed 1.0), 7 short lines ("Seven a.m., folks!" … "Good night, folks!"). Chain: HP 260 Hz / LP 4.6 kHz, tanh saturation, a short room, compression. Music ducked ~8 dB under the voice. Optical pass: band-limit 110 Hz–6.2 kHz, wow 0.6 Hz, flutter 7 Hz.

## Asset requirements and unresolved gaps

- The original conversation prompt is not published. The complete published style, script, timing and reference movie support the reconstruction.

## Audited coverage and provenance

[
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/rubber-hose/sheets/sheet-01.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/rubber-hose/sheets/sheet-02.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/rubber-hose/sheets/sheet-03.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/rubber-hose/sheets/sheet-04.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/rubber-hose/sheets/sheet-05.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "times": [
      4.95,
      16.0,
      28.0,
      28.5,
      29.0,
      37.0,
      37.5,
      45.8
    ],
    "sheet": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/outputs/gptcar/work/gptcar/matched-audit/event-frames/rubber-hose/sheet.jpg"
  }
]

All regular sheets cover the full film. Supplemental timestamps are listed where used. No claim is made that every encoded frame was inspected. The companion JSON retains complete STYLE.md, DEMO.md, FACTS/CREDITS, exact source hashes, full timeline, fetch scripts and original asset inventory.
