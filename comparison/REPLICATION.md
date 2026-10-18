# Reference-matched regeneration · v2

This replaces the first run’s creative brief after user review. Keep v1 as a labelled rejected attempt; do not publish it as the requested comparison.

## User’s requested result

All51 original films are examined scene by scene, described in reproducible prompts/scripts, then recreated with GPT-6.1 Sol High, including recreated voice and music. Improve the skills to preserve the original level of artwork and production detail. Keep the gallery as one professional page, original Opus left / GPT right, with README link, then publish after completion.

## Inputs and provenance

- Original public movies have been downloaded to the task’s private `work/gptcar/reference/films/` for analysis. Every source movie has a SHA-256 and ffprobe record. Complete one-frame-per-second reference sheets are in `work/gptcar/reference/<slug>/sheets/`. These are private analytical captures, not generated artwork.
- Workers inspect the whole sequence and all published source/timing tables. Supplement regular samples for every short shot/card, significant gesture, exact typography and transition. Record concrete coverage; do not claim inspection of every encoded frame.
- `comparison/matched-briefs/<slug>.md` and `.json` hold the exact published narration/cards and the reconstructed scene prompt. Record whether an original input prompt is published. A source-informed reconstruction is not a recovered verbatim chat prompt.
- Keep the original STYLE.md text/hash intact. Add per-style `GPT_REPLICATION.md` instructions when concrete findings improve future generation. Global skill behaviour lives in `.agents/skills/gptcar/references/replication.md`.

## Production

- New source: `replicas/<slug>/`. Independently generated scene assembly and animation. Shared generic toolkit/style engines and licensed assets are permitted, itemized and attributed. Replaying upstream scene code or copying original frames is not new GPT output.
- Preserve original title/topic, complete story, every important shot/action, exact on-screen narrative text, narration/language, scene order and timing. No20-second cap, abbreviated catalogue, new Evidence window or simplified premise.
- Match the actual published original’s video frame count, resolution and frame rate from the reference record. Separately preserve the art detail of its documented production canvas. Do not blindly infer delivery fps from rounded catalogue metadata or DEMO production notes.
- Real Evidence subjects, data windows, asset geometry and measurements must match the original. Any unavailable original input is a named unresolved gap, not permission to replace it and call the pair matched.
- Recreate narration from the original published text and voice direction. New score from the same musical direction/tempo/structure, with distinct planned sections and synchronized material-specific effects. User explicitly selected recreation of voice and music instead of reusing the original master soundtrack.
- Before final video rendering: generate and inspect matched-time stills covering every scene. Refine until story, subject, materials, composition, text, camera and effects satisfy the written shot requirements. Do not equate technical render success with visual quality.

## Worker outputs

`replicas/<slug>/`: `PROMPT.md`, `TREATMENT.md`, `index.html` + source, `narration.json`, `score.json`, `CREDITS`, `FACTS.md` as needed, `generation.json` last.

`generation.json`: model/effort, title, delivery fps/resolution/frame count/duration, `matched_brief_sha256`, shared component list, `uses_upstream_scene_code:false`, and real source-ready status. No invented execution IDs/timing/provenance claims.

`narration.json`: exact text, language, desired voice, start and planned duration per line; no narration for originals without it. `score.json` will use the root audio schema; no copied master audio. Root owns synthesis/mix/render/gallery/publishing.

## Acceptance and publication

Independent scene-by-scene review against the original. Log scene coverage, remaining discrepancies and corrections; rejected or incomplete films do not pass. Technical checks additionally verify full delivery format, frame count, audio, files/hashes and deterministic seeking. All51 must pass before the final one-page gallery and README URL are published. Expose matched script/prompt links and shared-component disclosures for each pair.

### Audio interchange

`score.json`: `{ "duration": 113.6, "bpm": 103.4, "sections": [{"start":0,"end":10.9,"intent":"..."}], "notes": [{"t":0,"duration":1,"midi":60,"gain":0.12,"pan":-0.2,"instrument":"piano"}], "effects": [{"t":2,"duration":0.3,"gain":0.1,"pan":0,"kind":"paper"}] }`.

Prefer real sample instruments from `core/audio/sampler.py` (e.g. piano, upright, violins, cellos, flute, clarinet, oboe, harp, glockenspiel, marimba, kalimba, acoustic_guitar—check registry for exact keys). The root is installing all sample packs. The v1 synthesizer names remain available as explicit synth voices. Score a complete narrative arc with appropriate rests and dynamics rather than a generic ostinato for every film. Add story-specific SFX; root can extend the sound generator for a named need.

`narration.json`: `{ "language":"en-us", "voice":"af_heart", "lines":[{"id":"v01","text":"exact original narration", "start":3.0,"duration":7.4,"voice":"af_heart","speed":0.93,"language":"en-us"}] }`. Times follow the original script; duration is a delivery window, not a claim about freshly synthesized audio. No line may be dropped or silently truncated. For non-narrated originals use an empty lines array. Root prepares fresh speech, timing verification and mix.
