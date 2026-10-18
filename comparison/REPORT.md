# GPTcar: first-pass 51-style run (rejected in review)

**Status:** all51 first-pass studies rendered, but the user rejected their fidelity: scripts/durations changed and artwork was simplified. This report describes that initial attempt, not an accepted matched comparison. The public Pages site has not been deployed. See [the replacement run contract](REPLICATION.md).

[Open the single-page gallery](https://valekar.github.io/gptcar/). All 51 pairs live on that page, with original Opus films on the left and independent GPT films on the right. Search, categories and style hash links navigate the same page. Both README files link to the gallery.

## Production conditions

- Generating model: **GPT-6.1 Sol**, **High** reasoning, with three user-authorized parallel workers. See [RUN.json](RUN.json) and [PROTOCOL.md](PROTOCOL.md).
- **51 independently coded studies**, each 20 seconds, 1280×720, 24 fps, H.264 video with AAC stereo audio: **17 minutes / 24,480 frames** in total.
- Original procedural scores and sound events; no spoken narration. The original Opus productions retain their full duration and original audio.
- The reviewed upstream commit is pinned in `gptcar.json`. Its 51 creative style prompts and original demo sources remain unchanged. New film source lives in `comparisons/<style>/`, including treatment, code, score and credits. No upstream demo scene code was used as new GPT output.
- Same style and broad story premise; changed datasets, subjects and simplified scope are identified beneath the relevant pairs. These are compact qualitative studies, **not a controlled model ranking or a claim of artistic parity**. This run does not establish results for every other GPT model.

## Verification

Each [render record](results/) ties a source SHA-256 to the actual MP4 SHA-256. Every final movie was rendered frame by frame, muxed and probed: 480 frames, 20 seconds, 720p / 24 fps and AAC audio. Automated scans found no black intervals at the documented renderer threshold. Audio was analysed with ffmpeg `ebur128`.

The parent agent visually inspected frames at 2, 10 and 17 seconds for all 51 styles, with additional targeted views for repairs. This is an agent review of sampled frames, not a human watch-through of every frame. Checks caught and corrected blank risograph plates, an empty halftone transition, HD-2D lighting, overexposed product glass, dim LiDAR points, shader errors and a PCB outline-mask problem. Those films were rendered again from their repaired sources. Failed work and intermediate captures remain local; this run does not provide complete cost or generation-time measurements.

An independent worker audited all eight Evidence Films against the retained source assets and recomputed the displayed measurements:

| Style | Actual evidence and scope |
| --- | --- |
| Satellite Briefing | NASA MODIS Aral Sea photographs dated 2000 and 2014; no invented surface-area percentages. |
| Engineering Briefing Board | Attributed real bridge and ship photographs; qualitative structural schematics, without fabricated clearance or load measurements. |
| LiDAR Survey | USGS 3DEP Connecticut returns: 51,560 points, 7,960 class-2 ground returns; a 76×76 nearest-sample ground surface is labelled interpolation. Class 1 remains unclassified. |
| Projection on White Model | 216 real 3DBAG Rotterdam features; 50 with construction year before 1940. Height comes from the supplied roof percentile minus terrain; feature count is not asserted to be unique building count. |
| Data Physicalization | Retained OWID/IRENA solar and wind capacity series, 2014–2025, with source units and scaling. |
| Exploded Teardown | Pinned Corne KiCad source, 21 real switch centres and rotations, source tracks/outline. Simplified component envelopes are disclosed; no case-fit claim. |
| Microscope Story | Calibrated CC0 PathAI/OpenSlide Ventana tissue; recomputed blue-dominant pixel shares 37.34% and 49.68%. This is a colour threshold on a derivative image, not a clinical measurement. |
| Archive Light Table | Actual Library of Congress Wright photographs and catalogue records; first-flight 12 seconds and fourth-flight 59 seconds are sourced. |

Each Evidence film includes `FACTS.md` and asset credits with detailed limitations. Data sources differ from some upstream productions.

The publication builder refuses a missing movie or poster, stale source hash, wrong MP4 checksum, incomplete or duplicate inventory, wrong model settings, unverified render or pending visual review. The published media are distributed in the [comparison-v1 release](https://github.com/valekar/gptcar/releases/tag/comparison-v1); the Pages workflow rebuilds this one gallery page from those checked files.

Seven automated tests pass, including setup/installer integration and incomplete-publication rejection. `npm run check` confirms all 51 upstream style-prompt hashes. JavaScript/Python syntax and whitespace checks pass. Desktop and narrow-screen browser checks cover layout, search, same-page jumps and paired playback. See [validation details](../docs/VALIDATION.md).

## Historical reproduction

See [comparisons/README.md](../comparisons/README.md) to render a source film. Download release MP4 files into `.release/comparison/` and JPG files into its `posters/` subfolder, then run `# Historical v1 command; the current gallery:build command builds reviewed v2 reconstructions.
# Use the v1 source revision to reproduce this historical run.`. The strict builder emits `_site/index.html`, one shared catalogue and media; it creates no separate style pages.

Local rendering was tested on Apple silicon macOS. Optional narration engines and every other platform/model remain outside this run. The left films are served by the upstream gallery, so their continued availability depends on that host. Third-party asset licences and original MIT attribution remain intact.
