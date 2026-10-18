# Meet Pip — matched recreation brief

Status: original scene sequence audited. Independent reconstruction may proceed.

Measured delivery: **1280×720, 24fps, 960frames, 40s**. Production canvas:1920×1080.

STYLE.md SHA256: `e73614b6f9e2f2e8ee279f4909da8429235b96f6d13a12345b6e57d5823c30b8`. Original video SHA256: `02212da5584e09cf29b0590f8d24fbed41e2a69687c1b4f6c5a80cb929943844`.

Published premise: A robot vacuum set up in three steps, told like a 1950s classroom film: place the dock, connect the app, press start.

The original conversation prompt is unavailable. This brief reconstructs the complete published style, story, script and reference movie; it does not claim to be a recovered verbatim chat. Generate new voice and music. Attribute shared generic helpers and licensed assets; independently assemble the scene.

## Reference artwork and performance

Keep June’s black bob, yellow headband, coral sweater, navy trousers, pointed nose and long geometric limbs. Pip has a teal disc top, cream side ring, front sensor and red dot. Use mustard, blue, coral, olive and cream with printed paper texture. The film must demonstrate all three tasks with circular magnified callouts: dock placement and50cm clearance, app setup on2.4GHz Wi-Fi, and a one-second held button press. A growing iris then reveals the complete furnished living-room/hall/kitchen plan with a serpentine cleaning route. Preserve the cable pickup, long three-step summary hold, full-manual CTA and circular end card.

## Complete timed scene order

**0.0000–7.2727s · hook**

Box opens on mustard ground, June held geometric body, Meet Pip lockup; slow push1→1.07.

Voice cues: hook, step0.

**7.2727–12.7273s · step0**

Place dock against wall with50cm eachside; truck/push; circularhandcallout and arrows; numberediris.

Voice cues: step1.

**12.7273–18.1818s · step1**

Phone app and2.4GHz; pushinto phone thenpan signalrings toPip; callout; numberediris.

Voice cues: step2.

**18.1818–21.8182s · step2**

Finger press andhold1s; tilt withfinger; buttonirisopensintoplan.

**21.8182–27.2727s · payoff**

Vacuum route roombyroomavoidsfurniture; signature5.4→1pullback with−6°→0counterrotation; atomictextilepattern.

**27.2727–30.9091s · tip**

Loose-cables tip; sidecolourblockwipe; half-timebreath.

Voice cues: tip.

**30.9091–36.3636s · lockup**

Threestepmedallionslockup; deadstill≥3s, fullmanualCTA.

Voice cues: outro.

**36.3636–40.0000s · end**

IrisoutontoPip, endcardinsidecircle.

## Full narration — exact published words

- **hook · 1.978181818181818s** — Meet Pip, your new robot vacuum.
- **step0 · 7.045454545454545s** — Step one. Set the dock against a wall.
- **step1 · 12.5s** — Step two. Open the app and add Pip.
- **step2 · 17.954545454545453s** — Step three. Press start.
- **tip · 27.35272727272727s** — Tip: pick up loose cables first.
- **outro · 31.443636363636358s** — Three steps. That's it.

The companion JSON preserves each original voice name, speed, available original duration, subtitle variant and source record. Fresh synthesis must retain every word without truncation.

## Exact on-screen text

The complete published subtitles follow. Additional title/prop/callout literals, timed cue JSON and timeline text are retained in `on_screen_text_inventory` in the companion JSON; source hashes identify their provenance.

```srt
1
00:00:01,978 --> 00:00:05,645
Meet Pip, your new robot vacuum.

2
00:00:07,045 --> 00:00:11,212
Step one. Set the dock against a wall.

3
00:00:12,500 --> 00:00:16,417
Step two. Open the app and add Pip.

4
00:00:17,955 --> 00:00:20,955
Step three. Press start.

5
00:00:27,353 --> 00:00:31,019
Tip: pick up loose cables first.

6
00:00:31,444 --> 00:00:34,360
Three steps. That's it.

```

## Sound direction and recreation

- **Music:** an original West-Coast cool-jazz combo at **132 BPM**: vibraphone (chords, arpeggios, glissandi, motor tremolo), flute (melody), pizzicato upright bass (walking), brushes (a swirl plus 2 and 4, sticks on the ride for the payoff), a celesta colour. **Every step lands on its own vibraphone chord** (F6, B♭maj7, C9), and the lockup brings those chords back one per medallion, transposed. In the payoff the vibraphone plays "one note per lap", driven by lap times exported in `events.json`.
- **Rhythm arc:** normal → double-time at the payoff (key up a whole step) → half-time for the tip (the breath) → normal for the lockup.
- **Silences:** A (0–1.36 s): no music, only the box. B (the last beat before the press): *everything* off, ambience included, so the first sound after it is the start click. C (before the lockup): room tone only. The first sound after silence C is the first medallion stamp.
- **J/L cuts:** music enters before the reveal; each step's line starts half a beat before its iris; the motor starts 0.2 s before the payoff; the last Wi-Fi pip rings into step 3; the payoff's glissando tail rings into the tip.
- **Ambience:** warm room tone (low-passed brown noise, about −42 dB) and a very quiet mantel-clock tick on the half-note grid. In the payoff, Pip's motor hum (a band-passed saw with a slow LFO plus brush hiss) takes over.
- **Foley in this film:** the box (creak, flap thumps a semitone apart, a swish into a slap), the plug click, floor scrapes for the dock, stamps for every medallion, slide whistles for the 50 cm arrows, rising pips for "connected", pen scratches as each room's route draws, the ink line peeling off paper, an iris "shhk".
- **Mix:** narration compressed on top, music ducks 8 dB under it, foley unducked, −14 LUFS, true peak −1.2. `tools/cuecheck.py` found 0 hits off the half-beat grid.
- **Narrator:** calm classroom authority. The demo uses Kokoro `am_michael` at 0.94. `bm_george` was tried: whisper heard "dock" as "dark" in his British vowel. Keep lines to one clause: "Step one. Set the dock against a wall."

## Asset requirements and unresolved gaps

- The original conversation prompt is not published. The complete published style, script, timing and reference movie support the reconstruction.

## Audited coverage and provenance

[
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/midcentury-toon/sheets/sheet-01.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/midcentury-toon/sheets/sheet-02.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/midcentury-toon/sheets/sheet-03.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "path": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/work/gptcar/reference/midcentury-toon/sheets/sheet-04.jpg",
    "sampling": "One decoded sample persecond acrosscompletefilm; actual timestampsapprox0.5s+i."
  },
  {
    "times": [
      7.1,
      12.5,
      18.05,
      21.8,
      22.0,
      27.3
    ],
    "sheet": "/Users/valekar/Documents/Codex/2026-10-18/https-github-com-valekar-roast-room/outputs/gptcar/work/gptcar/matched-audit/event-frames/midcentury-toon/sheet.jpg"
  }
]

All regular sheets cover the full film. Supplemental timestamps are listed where used. No claim is made that every encoded frame was inspected. The companion JSON retains complete STYLE.md, DEMO.md, FACTS/CREDITS, exact source hashes, full timeline, fetch scripts and original asset inventory.
