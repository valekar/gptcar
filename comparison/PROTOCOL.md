# GPTcar comparison protocol · v1

User request: all 51 styles, original Opus films on the left, new GPT-6.1 Sol High films on the right, published on GitHub Pages. Name: GPTcar / gptcar.

The user selected the library's original code-rendered workflow by asking to generate these GPTcar samples. Use its deterministic renderer. HyperFrames conversion is outside this benchmark.

## Comparison conditions

- GPT model: `gpt-6.1-sol`; reasoning effort: `high`. Record the actual generating agent/model. Never label a rerender of upstream code as new GPT output.
- Each right-side film is an independent **20-second visual study**, 1280×720, 24 fps, with an original procedural score and synchronized sound events; no spoken narration. The left-side film is the original, full upstream production with its original duration and sound. The page must disclose these differences: this is a qualitative style comparison, not a controlled model ranking.
- Use the same style and story premise from the style's `style.json`. Original implementation required. The user explicitly wants matching comparisons, so the premise may match the upstream demo; do not copy its scene code, camera path, layout or original audio. References and common assets must be credited.
- Read the complete `styles/<slug>/STYLE.md`. The style invariants are the contract: this is not a generic title-card reel with 51 color palettes. Create recognizable material, camera, motion and subject-specific imagery. Include a complete mini-arc with at least 3 meaningfully distinct views / narrative beats and one native medium-specific transition.
- Evidence Films must use real appropriately licensed data/imagery and sourced or measured numbers. No invented point clouds, fabricated microscopy, fake CAD or satellite images. Keep source URLs and measurement methods in FACTS.md; use a real alternative dataset if the exact original is impractical, and disclose the changed subject.
- No third-party generated video model or AI bitmap substitution for the code-rendered visuals. Procedural illustrations, Canvas, SVG paths and Three.js are appropriate.

## Files per style

Write only your assigned `comparisons/<slug>/` files:

- `TREATMENT.md`: 3 brief candidate structures, choice, concise shot/beat/camera/sound map. Write before drawing and before opening DEMO.md. Do not read upstream demo source.
- `index.html` and any local JS: renderable with `window.DUR=20`, `window.render(t)` and `window.READY=true`. Fonts/assets must finish loading before READY. The viewport is 1280×720; use innerWidth/innerHeight if scalable. Pure time seeking; fixed seeded randomness; no render-time network calls. `/core/` and `/node_modules/three/` imports work.
- `audio.json`: `{ "bpm": 100, "notes": [{"t":0,"duration":0.4,"midi":60,"gain":0.1,"pan":0,"instrument":"felt"}], "effects": [{"t":4,"kind":"paper","duration":0.2,"gain":0.1}] }`. Original score; supported instruments: felt, bell, pluck, bass, pad, chip, brass, marimba, flute, organ. Supported effects: paper, whoosh, hit, click, rain, wind, scratch, chime. Use varied dynamics and breathing space. Composer events must match picture.
- `CREDITS`: code/model authorship, style attribution to Lemomo/LemoLab with source URL and MIT, every external asset source/license. No watermark in the film.
- `FACTS.md` for real-world claims/data.
- `generation.json`: `{ "model":"gpt-6.1-sol", "reasoning_effort":"high", "status":"source-ready", "title":"...", "premise":"...", "duration":20, "comparison_notes":"...", "uses_upstream_demo_code":false, "assets":[...] }`. No invented execution IDs, timestamps, token counts or QA claims.

The parent owns batch rendering/audio/mux/gallery/publishing. It will render contact sheets and check output. Workers may render a small number of stills using `node core/render/still.mjs comparisons/<slug> 2 10 17 --size 1280x720 --out <unique work folder>`; inspect them if possible. Repair page errors and style mismatches before finishing. Do not change root toolkit or gallery, commit, push, or publish.
