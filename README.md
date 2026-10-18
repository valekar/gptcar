# GPTcar

> **Comparison status:** the first 51 short studies were rejected in review because they changed the original scripts and simplified the artwork. Full scene-by-scene descriptions and scripts are now available for all 51 films; reference-matched regeneration and review are in progress. The Pages gallery has not been deployed yet.

**[Open the Opus ↔ GPT comparison gallery](https://valekar.github.io/gptcar/)** — one page, all 51 styles side by side. Original Opus films on the left; independently coded GPT-6.1 Sol High studies on the right. [Production conditions](comparison/REPLICATION.md) · [Current run report](comparison/REPLICATION_REPORT.md).

**[Read all 51 scene scripts and reconstruction prompts](comparison/matched-briefs/README.md)** · [Full replication protocol](comparison/REPLICATION.md). The original conversation prompts were not published; the reconstruction briefs distinguish verbatim published instructions from shot descriptions derived by inspecting the finished films. New films retain the full story, scene timing and narration text, with freshly recreated speech and music.

**51 film styles for GPT coding agents.** Pick a style, bring your own topic, and use a coding agent to draw, animate, score and render a short film in code.

An independent adaptation of [Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar), created by Lemomo / LemoLab. The original style prompts and demo sources are preserved. The historical demos were made with Claude Opus 5.5; they are not Codex benchmarks. See [NOTICE](NOTICE), [LICENSE](LICENSE) and the [compatibility review](docs/COMPATIBILITY.md).

## Start in Codex

```sh
git clone https://github.com/valekar/gptcar.git
cd gptcar
sh tools/setup.sh check
codex
```

Use this prompt in Codex CLI, IDE or the desktop app with this folder open:

> Use $gptcar with the GPTcar renderer. Make a 45-second watercolor film about how rain reaches a coffee farm. English narration, 16:9.

For style browsing:

> Use $gptcar to show me the styles that fit a robotics explainer.

The repo skill lives at [`.agents/skills/gptcar/SKILL.md`](.agents/skills/gptcar/SKILL.md). To use it from other folders, link this checkout into your personal skills directory:

```sh
python3 tools/install_codex_skill.py
```

Keep the checkout in place. Restart Codex if the skill does not appear. The installer refuses to replace an existing skill. To remove this symlink later, inspect its target and remove only `~/.agents/skills/gptcar`, keeping the library if you still need it. A skill copied on its own also works: its setup script downloads the full library on first use.

For the comparison run, select **GPT-6.1 Sol** with **High** reasoning. In Codex CLI: `codex -m gpt-6.1-sol -c model_reasoning_effort='"high"'`. Other available models can use the same style instructions. There is no model ID or Anthropic API call in the production toolkit. Skill availability depends on the agent host; a text-only chat cannot execute the renderer. Results and instruction-following vary by model. [Official skill documentation](https://developers.openai.com/codex/skills) · [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol).

## Production requirements

Install Node 20+, ffmpeg and Python 3.11+ (or uv). The upstream toolkit was developed on Apple silicon macOS; Linux needs suitable browser/GPU support; use WSL on Windows. Then:

```sh
sh tools/setup.sh deps        # local npm packages, headless Chromium and Python venv
sh tools/setup.sh deps voice  # only for narration / speech checking; downloads models
sh tools/setup.sh deps music  # only for the optional plucked-string engine
```

Packages and assets come from npm, PyPI, Playwright, Hugging Face and the upstream GitHub assets release. The large asset manifest retains upstream URLs and checksums because those assets are hosted there. Core setup is several hundred MB; optional voice/sample packs add more. English TTS uses local Kokoro; the Chinese edge-tts option sends narration text to Microsoft's service. Style-specific data readers install into the film's own environment.

Setup uses this checkout. For a standalone installed skill, the fallback library is `${XDG_DATA_HOME:-$HOME/.local/share}/gptcar`. Override it with `GPTCAR_HOME`. Setup never auto-updates or hard-resets a library; run `sh tools/setup.sh update` for an explicit fast-forward of a clean checkout. `GPTCAR_REPO` overrides the clone source.

## Styles and workflow

All **51** styles are listed in the [style index](styles/README.md), with prompts in `styles/<slug>/STYLE.md`. Browse the [original demo gallery](https://lemomo-ai.github.io/lemo-opuscar/) to see the look. The additional [98-film style breakdown](styleboard/opuscar98_styles.json) is showcase reference data, not 98 separately packaged skills.

The library includes painting, printmaking, type, anime, games, 3D and evidence-based films. [DIRECTOR.md](DIRECTOR.md) covers treatment, camera, performance and quality review; [TECHNIQUE.md](TECHNIQUE.md) and [core/README.md](core/README.md) cover rendering, voice, score, mix and subtitles.

Films go in `films/<name>/` in this checkout, or `<name>/` in the folder where you invoke the installed skill. Default output is 1920×1080 at 24 fps. The deliverable includes the MP4, poster, subtitles when applicable, source/build script, treatment and asset credits. Factual films include source evidence in `FACTS.md`.

The original renderer exposes deterministic `window.render(t)`. If your host requires another video workflow, such as HyperFrames, use the style prompts as art direction within that workflow, or explicitly select the GPTcar renderer. There is no automatic conversion between renderer contracts.

## Validation and provenance

```sh
npm run check
npm test
```

The [compatibility review](docs/COMPATIBILITY.md) inventories every style and explains the model/host distinction. [Validation results](docs/VALIDATION.md) distinguish automated and render checks from artistic quality evaluation. `gptcar.json` pins the upstream commit and hashes all 51 style prompts. The original Claude plugin and gallery tooling remain as historical upstream artifacts; their deployment job runs only in the original repository. The separate GPTcar workflow publishes the comparison page. They are not the Codex installation path.

The MIT license and original notices remain intact. Demo assets retain their own licenses in `CREDITS`. GPTcar is an independent project, not an official OpenAI, Anthropic or LemoLab product.
