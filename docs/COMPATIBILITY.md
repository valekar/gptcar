# Compatibility review: Lemo-Opuscar → GPTcar

Reviewed 18 October 2026 at upstream commit `ded40b25679fe5d5dcfc07a282a25da1ceee3be1`.

## Decision

The style instructions and code toolkit are reusable with GPT-6.1 Sol in Codex. A separate creative rewrite is not required. The repository already has `AGENTS.md` and tells other agents to copy the main skill into their skill folder. GPTcar provides a convenient Codex entry point, setup and documentation around that reusable content. It is an adaptation, not a newly invented set of styles.

This is a compatibility assessment, not a claim that every model reproduces the upstream demos. The upstream author explicitly warns that the prompts were tuned for Opus 5.5. No controlled comparison of complete films across models has been performed here. See [VALIDATION.md](VALIDATION.md) and the [51-style run report](../comparison/REPORT.md) for what was actually executed. The published gallery adds independent 20-second GPT-6.1 Sol High studies; it does not establish parity with the full Opus productions.

## What was reviewed

- `plugin/skills/lemo-opuscar/SKILL.md`: the main skill; its bootstrap downloads the upstream library.
- `tools/directory/SKILL.md`: an alternate packaging of the same skill, not another creative capability. It ships a bundled library and has extra online narration consent guidance.
- `AGENTS.md`, `CLAUDE.md`, `DIRECTOR.md`, `TECHNIQUE.md`, core tool documentation, setup scripts, package requirements, asset downloader and gallery workflow.
- All 51 non-template `styles/*/STYLE.md` files and their metadata. Each full style file was scanned for model/vendor requirements, rendering dependencies and extra package notes; SHA-256 hashes are in `gptcar.json`.
- `styles/_template/` is a maintainer scaffold, excluded from the count. The OPUSCAR 98 JSON contains 98 showcase style breakdowns; these are not 98 standalone installed skills or 98 additional fully packaged production workflows.

## Model versus agent host

| Environment | Assessment |
| --- | --- |
| GPT-6.1 Sol inside Codex | Compatible instruction format and local tool workflow; artistic parity not established. |
| Other Codex models | The same files can be used; code quality, context limits, visual judgment and long-task reliability vary. |
| ChatGPT with an appropriate skill host and execution tools | Reusable instructions; actual rendering depends on shell/browser/files/ffmpeg access in that environment. |
| Plain ChatGPT conversation or a bare model API call | Can reason about the prompts or generate source; cannot run this local pipeline by merely loading a Markdown file. |
| Another tool-capable coding agent | The creative specs and runtime code are portable; installation, discovery, tool names and permissions need host-specific wiring. |

Official sources: [Codex / ChatGPT skills](https://developers.openai.com/codex/skills), [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol), [API Skills](https://developers.openai.com/api/docs/guides/tools-skills). These document skills and model/tool capabilities; they do not certify this library's visual quality. A Responses API integration would also need its own shell execution wiring; GPTcar does not implement an OpenAI API client.

## What transfers unchanged

The 51 style guides contain no Claude, Anthropic, OpenAI or model-version requirements. They specify palettes, materials, camera behavior, motion, typography, sound and failure cases. The runtime renders deterministic pages with `window.render(t)` using Canvas, WebGL/Three.js, headless Chromium and ffmpeg. Audio tools use Python, Kokoro, optional edge-tts, sample libraries and speech checking. There is no Anthropic SDK or language-model API dependency in the shared production runtime.

The 8 Evidence Films styles need genuine source material, metadata and measured/sourced claims. Using GPT instead of Claude does not remove those data and asset prerequisites. The 3D and shader styles still need appropriate browser/GPU support. Local voice models and external assets remain separate downloads.

## Changes in this adaptation

1. A discoverable `.agents/skills/gptcar/SKILL.md`, UI metadata and a no-overwrite symlink installer.
2. Codex setup that works from the repo, a linked skill or a standalone copied skill. `GPTCAR_HOME` and `GPTCAR_REPO` select the library/source. No silent updates, remote changes or hard resets; explicit updates fast-forward a clean matching clone only.
3. Codex-first README files, package naming and setup/error guidance. Original toolkit environment variables such as `LEMO_ANGLE` and `LEMO_COLOR` are preserved to avoid breaking the existing runtime.
4. Original gallery/Claude publishing artifacts remain attributed; automatic gallery deployment is restricted to the original repository. Codex-specific checks run separately.
5. Upstream commit and exact style hashes, a complete inventory and setup regression checks. All creative STYLE.md files and demo sources are unchanged.
6. Independent GPT-6.1 Sol High sample sources in `comparisons/`, a single-page Opus/GPT gallery, checksum-verified media in a GitHub Release, and a publication gate requiring every film and visual review.

The local skill can coexist with HyperFrames. Its original render contract is different from HyperFrames' timed HTML contract: take the style as art direction in an established HyperFrames workflow, or explicitly choose the GPTcar renderer. Rewriting all 51 demos into HyperFrames is a separate project.

## Why the original name?

The README identifies the creator as **Lemomo**, GitHub owner `lemomo-ai`, and credits **LemoLab × Claude Opus 5.5**. Thus “Lemo” is the creator/brand prefix. “Opuscar” appears to combine **Opus** with **Oscar**, reinforced by the OPUSCAR 98 showcase of 98 Best Picture winners. That wordplay is an inference; no explicit etymology was found in the reviewed README or guides. “Car” is not documented as a standalone acronym or a software core.

The new project is **GPTcar**, repository slug **gptcar**, as requested. The new name does not erase the MIT copyright or third-party asset credits. The original demos keep their authorship; newly created user films do not need an upstream watermark.

## Complete style inventory

Every row below is **instruction-compatible by static review**. “Requirements” describes the technical dependency or quality challenge, not a model restriction. The later gallery run adds a 20-second GPT-6.1 Sol High study for every style; these compact studies have not been rated as equivalent to the original full films.

| Style | Category | Requirements / review focus |
| --- | --- | --- |
| [1930s Rubber Hose Cartoon](../styles/rubber-hose/STYLE.md) | Cartoon & Anime | Character rig, curved limbs, expression and musical performance. |
| [80s Cel Anime](../styles/cel-anime-80s/STYLE.md) | Cartoon & Anime | Cel layers, held drawings, multiplane camera and character consistency. |
| [Mid-century Cartoon](../styles/midcentury-toon/STYLE.md) | Cartoon & Anime | Flat character construction, limited animation and graphic staging. |
| [Sci-Fi Sitcom Toon](../styles/scifi-toon/STYLE.md) | Cartoon & Anime | Character rigs/lip sync and shot-to-shot acting consistency. |
| [1920s Silent Film](../styles/silent-film/STYLE.md) | Cinema & Eras | Film/ink post-processing, physical comedy and score timing. |
| [Liminal Found Footage](../styles/backrooms/STYLE.md) | Cinema & Eras | 3D/environmental camera, lighting and analog/CRT treatment. |
| [Paper-cut Lightbox](../styles/paper-lantern/STYLE.md) | East Asian Traditions | Layered cut-paper lighting, parallax and warm transmission. |
| [Red Paper-cut](../styles/papercut-red/STYLE.md) | East Asian Traditions | Cut geometry, holes, paper layers and consistent shadow/depth. |
| [Shadow Puppetry](../styles/shadow-puppet/STYLE.md) | East Asian Traditions | Jointed cutout puppets and WebGL lamp/transmission compositor. |
| [Ukiyo-e](../styles/ukiyoe/STYLE.md) | East Asian Traditions | Layered print colors, carved outlines, bokashi gradients and handscroll motion. |
| [Archive Light Table](../styles/archive-lighttable/STYLE.md) | Evidence Films | Real archive scans with catalog metadata; WebGL loupe, texture sampling and parallax. |
| [Data Physicalization](../styles/data-physical/STYLE.md) | Evidence Films | Sourced time series, physical-scale 3D geometry, HDRI and walnut materials. |
| [Engineering Briefing Board](../styles/briefing-board/STYLE.md) | Evidence Films | Measured engineering data; optional cutout/matting ONNX packages in a project environment. |
| [Exploded Teardown](../styles/teardown/STYLE.md) | Evidence Films | CAD/PCB/BOM files; optional occt-import-js STEP conversion, Three.js, HDRI. |
| [LiDAR Survey](../styles/lidar-survey/STYLE.md) | Evidence Films | Real classified LiDAR; laspy/lazrs and scientific image processing in a project environment. |
| [Microscope Story](../styles/microscope/STYLE.md) | Evidence Films | Calibrated image pyramids; tifffile/imagecodecs, or OpenSlide for other scan formats. |
| [Projection on White Model](../styles/white-model/STYLE.md) | Evidence Films | Open city geometry and dated source data; GIS/mesh preprocessing, Three.js and GPU. |
| [Satellite Briefing](../styles/satellite-briefing/STYLE.md) | Evidence Films | Real georeferenced imagery; map registration, raster/GIS preprocessing and source claims. |
| [16-bit Pixel RPG](../styles/pixel-rpg/STYLE.md) | Games | Pixel grid, sprite stepping and stable camera sampling. |
| [Game Show Flat](../styles/game-show/STYLE.md) | Games | Flat game geometry, performance cues and score/action synchronization. |
| [HD-2D](../styles/hd-2d/STYLE.md) | Games | Pixel figures with depth/lighting and coherent perspective. |
| [Microgame Frenzy](../styles/microgame/STYLE.md) | Games | Fast state changes, cue-grid synchronization and readable instructions. |
| [60s Spy Title Sequence](../styles/spy-titles/STYLE.md) | Graphic & Type | Graphic silhouettes, tracking and music/camera synchronization. |
| [ASCII / CRT Terminal](../styles/ascii-crt/STYLE.md) | Graphic & Type | Character-cell rendering and WebGL CRT post-processing. |
| [Art Deco](../styles/art-deco/STYLE.md) | Graphic & Type | Geometric ornament, metallic light and controlled symmetry. |
| [Blueprint](../styles/blueprint/STYLE.md) | Graphic & Type | Technical linework, labels and coherent dimensioning. |
| [Pictogram Motion](../styles/pictogram-motion/STYLE.md) | Graphic & Type | Icon geometry, morphs and readable symbolic motion. |
| [Stained Glass](../styles/stained-glass/STYLE.md) | Graphic & Type | Glass/lead geometry, transmitted light and texture stability. |
| [Swiss Motion Graphics](../styles/swiss-motion/STYLE.md) | Graphic & Type | Type/grid animation; precise timing and readable text. |
| [Chinese Ink Wash](../styles/ink-wash/STYLE.md) | Hand-drawn & Painting | Ink strokes and WebGL paper/bleed compositor; guqin score may use music tier. |
| [Crayon Picture Book](../styles/crayon-book/STYLE.md) | Hand-drawn & Painting | Canvas wax/pressure and WebGL paper/resist compositor; character rig. |
| [Impasto Oil Painting](../styles/impasto/STYLE.md) | Hand-drawn & Painting | Painterly stroke conversion, height/light compositor and supersampling. |
| [One-line Drawing](../styles/one-line/STYLE.md) | Hand-drawn & Painting | Continuous paths, pressure and morphs; continuity at scene boundaries. |
| [Urban Sketch · Pen & Wash](../styles/urban-sketch/STYLE.md) | Hand-drawn & Painting | Pen/wash layers; architectural perspective and anchored paper texture. |
| [Watercolor Brush](../styles/watercolor/STYLE.md) | Hand-drawn & Painting | Canvas brush/wash engine; seeded strokes and texture stability. |
| [Whiteboard Explainer](../styles/whiteboard/STYLE.md) | Hand-drawn & Painting | Stroke-order handwriting, board camera and readable explainer pacing. |
| [Dark Tech Keynote](../styles/dark-keynote/STYLE.md) | Information & Keynote | Product/type staging, lighting and text/camera timing. |
| [Data Storytelling](../styles/dataviz/STYLE.md) | Information & Keynote | Sourced data, chart interpolation and reading-time checks. |
| [Isometric Infographic](../styles/iso-infographic/STYLE.md) | Information & Keynote | Isometric construction, diagram sequencing and legible callouts. |
| [Living Screencast](../styles/living-screencast/STYLE.md) | Information & Keynote | Functional UI state, pointer actions and meaningful demonstrations. |
| [Sci-fi Hologram HUD](../styles/hologram-hud/STYLE.md) | Information & Keynote | Layered technical graphics, scanning and readable motion hierarchy. |
| [Brick Toy](../styles/brick-toy/STYLE.md) | Materials & 3D | Three.js geometry/materials, lighting, depth of field and GPU. |
| [Glass Product Render](../styles/glass-product/STYLE.md) | Materials & 3D | Physical glass/refraction, studio lights, post-processing and GPU. |
| [Low-poly Isometric Island](../styles/lowpoly-island/STYLE.md) | Materials & 3D | Low-poly geometry, isometric staging, lighting and GPU. |
| [Paper Pop-up Book](../styles/paper-popup/STYLE.md) | Materials & 3D | Three.js folding geometry, paper materials and GPU. |
| [Tilt-Shift Miniature](../styles/tilt-shift/STYLE.md) | Materials & 3D | Miniature scene, camera/depth of field and GPU. |
| [Copperplate Engraving](../styles/engraving/STYLE.md) | Print & Printmaking | Fine line/hatching stability at delivery resolution. |
| [Halftone Dossier](../styles/halftone-dossier/STYLE.md) | Print & Printmaking | Canvas/print compositor; legible document composition and halftone stability. |
| [Risograph Print](../styles/risograph/STYLE.md) | Print & Printmaking | Separate print plates, halftone/registration and restrained animation. |
| [Silkscreen Travel Poster](../styles/silkscreen-poster/STYLE.md) | Print & Printmaking | Limited print plates, grain and screen-print registration. |
| [Woodcut Print](../styles/woodcut/STYLE.md) | Print & Printmaking | Carved strokes, hatch density and high-contrast movement. |

## Acceptance before claiming visual parity

Render original topics in a simple 2D style, a painterly shader style, a 3D style and an Evidence Films style. Review motion, readable text, sound, factual sourcing, source reproducibility and the style invariants. Keep failed attempts and regeneration time in the comparison. Expand that sample before claiming all 51 work equally well on a model. No such comparative benchmark is claimed by this adaptation.
