# Aura — Hear the Light — matched recreation brief

Status: original scene sequence audited. Independent reconstruction may proceed.

Measured delivery: **1280×720, 24fps, 768frames, 32s**. Production canvas:1920×1080.

STYLE.md SHA256: `630fa80cde0930154ba64f15bce5c8ee0c8dcf48d921253f8c7e3194712c8fb5`. Original video SHA256: `4d4d07073e2bc7abcb537afae06fa19562de6f69f67f754df6865b734c308f25`.

Published premise: Unboxing and close-ups of Aura, fictional glass earbuds, in strip-light sweeps and caustics.

The original conversation prompt is unavailable. This brief reconstructs the complete published style, story, script and reference movie; it does not claim to be a recovered verbatim chat. Generate new voice and music. Attribute shared generic helpers and licensed assets; independently assemble the scene.

## Reference artwork and performance

The complete11-shot glass pilot has its own detailed PROMPT.md, TREATMENT.md and REVIEW.md. Preserve the stemless lens earbuds, pebble case,100° halo lid, ten-part diagonal stack,16s same-camera snap, one-second front view, channel macro, left arrival, large floor caustics, paired settlement and exact thin typography. Actual worker stills and parent independent matched-time review cover all shots.

## Complete timed scene order

**0.0000–4.0000s · dark**

Black studio, fictional stemless lens earbuds in pebble glass case; low3/4 push and two rear-camera strip sweeps reveal contours only.

**4.0000–8.0000s · open**

High3/4 forty-degree orbit; glass lid hinges open to100degrees halo and clicks into place.

**8.0000–10.0000s · macroA**

Right earbud lifts at8s;25–45mm macro, focus glass surface→metal/diaphragm inside; sweep on beat.

Voice cues: v1.

**10.0000–12.0000s · macroB**

Side macro orbit contrasts clear lens, satin titanium band, frost and soft tip.

**12.0000–17.0000s · explode**

Parts spread along diagonal axis40degrees to view:3s easeout, hover; halfbar silence then.25s ease-in snap at16s; light channels ignite same frame and camera pushes40percent.

Voice cues: v2.

**17.0000–18.0000s · front**

Straight-on slight push hero view, complete light ring pulsing on808 grid.

**18.0000–20.0000s · channels**

Top-down macro of comet pulses running within polished acrylic channels, white-hot cores, blue→violet tails.

**20.0000–22.0000s · pair**

Second earbud flies in laterally on downbeat; stereo pulses alternate left/right.

**22.0000–24.0000s · caustics**

High topdown floor; dispersive caustics and spreading beat rings show sound leaving glass.

**24.0000–28.0000s · reveal**

Low3/4 hero under widely tracked ultra-thin AURA title; original opening sweep repeats over internally lit object.

Voice cues: v3, v4.

**28.0000–32.0000s · end**

Earbuds magnetically settle back at27.72/27.84; frosted charging base glows cool white, camera pulls out for credits; last.6s black fade.

## Full narration — exact published words

- **v1 · 8.55s** — Nothing to hide.
- **v2 · 12.45s** — Every part, in plain sight.
- **v3 · 24.5s** — Meet Aura.
- **v4 · 25.8s** — Hear the light.

The companion JSON preserves each original voice name, speed, available original duration, subtitle variant and source record. Fresh synthesis must retain every word without truncation.

## Exact on-screen text

The complete published subtitles follow. Additional title/prop/callout literals, timed cue JSON and timeline text are retained in `on_screen_text_inventory` in the companion JSON; source hashes identify their provenance.

```srt
1
00:00:08,550 --> 00:00:10,494
Nothing to hide.

2
00:00:12,450 --> 00:00:14,966
Every part, in plain sight.

3
00:00:24,500 --> 00:00:25,800
Meet Aura.

4
00:00:25,800 --> 00:00:27,700
Hear the light.

```

## Sound direction and recreation

Original numpy score (`demo/music/score.py`), **120 BPM, minor key**. Sub drone + glass shimmer for the dark open; FM glass-pluck arpeggio with a low-pass opening over the build; soft short kicks on every beat under the macro sweeps; noise + saw risers over the exploded view; **half a bar of total silence (reverb tails cut too)** before the drop, with a long reverse whoosh inside it; **808 drop** with a syncopated pattern ([0, .75, 1, 1.5] per bar) that the light pulses follow exactly; clap on 2 & 4; a four-note glass-bell motif; a minor-9 pad for the reveal; a high glass ding on the final settle. One kick list shared between the score and the renderer (`story.js`, `cues.json`).

Foley as used: shimmer per sweep, lid friction, magnetic clicks, an air puff per exploded part, and on the snap a cluster of six clicks 15 ms apart + the inharmonic glass chord.

Voice: Kokoro `am_michael`, speed 0.86–0.88, 3–4 very short lines. "Aura." alone was misheard as Laura / Dora, so the line became "Meet Aura." Music ducked −12 dB and foley −6 dB under the voice. The 808 peaks left no headroom and loudnorm fell back to dynamic mode (−13.7 LUFS); limiting the drop peaks ~3 dB in the mix fixed it. Grain 0 in mux.

## Asset requirements and unresolved gaps

- The original conversation prompt is not published. The complete published style, script, timing and reference movie support the reconstruction.

## Audited coverage and provenance

[
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/glass-product/sheets/sheet-01.jpg",
    "sampling": "decoded0.5s +1fps across fullfilm"
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/glass-product/sheets/sheet-02.jpg",
    "sampling": "decoded0.5s +1fps across fullfilm"
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/glass-product/sheets/sheet-03.jpg",
    "sampling": "decoded0.5s +1fps across fullfilm"
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/outputs/gptcar/work/gptcar/matched-audit/glass-product/transition-review.jpg",
    "timestamps": [
      7.9,
      8.05,
      12.05,
      15.75,
      15.9583,
      16,
      16.0833,
      16.9583,
      17,
      20.05,
      21.2,
      27.72,
      27.84,
      31.95
    ]
  }
]

All regular sheets cover the full film. Supplemental timestamps are listed where used. No claim is made that every encoded frame was inspected. The companion JSON retains complete STYLE.md, DEMO.md, FACTS/CREDITS, exact source hashes, full timeline, fetch scripts and original asset inventory.
