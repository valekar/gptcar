# Worked example: the successful reference recreation

This is the repeatable production recipe from the second pass. Watercolor's
**Follow the Rain** is the worked example: 113.6 seconds, 6,816 frames at 60 fps,
1280×720 delivery, with a documented 1920×1080 artwork canvas. The same recipe
resolves the recorded files for **all 51 styles**. It preserves the full story,
not the rejected first pass's 20-second interpretation of its premise.

## Recorded artifacts, not a reconstructed chat transcript

| Input or output | Actual second-pass file |
| --- | --- |
| Original published style instructions | [STYLE.md](../../styles/watercolor/STYLE.md) |
| Exact text and reconstructed scene-by-scene descriptions | [canonical script](../../comparison/matched-briefs/watercolor.md) / [JSON](../../comparison/matched-briefs/watercolor.json) |
| Saved generation brief | [PROMPT.md](../../replicas/watercolor/PROMPT.md) |
| Production treatment | [TREATMENT.md](../../replicas/watercolor/TREATMENT.md) |
| Renderable scene/animation source | [index.html and adjacent scripts](../../replicas/watercolor/index.html) |
| Fresh voice input, cast, timing and rate | [narration.json](../../replicas/watercolor/narration.json) |
| Fresh score, section intent and material effects | [score.json](../../replicas/watercolor/score.json) |
| Asset/engine provenance and notices | [generation.json](../../replicas/watercolor/generation.json) / [CREDITS](../../replicas/watercolor/CREDITS) |
| Original delivery measurements | [reference-metadata](../../comparison/reference-metadata/watercolor.json) |
| Encoded result and source/movie hashes | [render record](../../comparison/replica-results/watercolor.json) |
| Review coverage, audio evidence and remaining differences | [accepted review](../../comparison/replica-reviews/watercolor.json) |
| Final actual AAC measurements | [51-film audio audit](../../comparison/final-audio-audit.json) |

The saved prompt and treatment are the actual documents in the generation bundle.
The original Opus private chat prompt was not published. The full worker chat
history and exact interactive shell history are not supplied as reproducible
inputs. [prompt.txt](prompt.txt) is a **new reusable handoff** pointing to the
recorded brief, not a claim to be a verbatim original conversation. Some frozen
briefs retain the former `outputs/gptcar/` prefix; resolve it to the checkout root.

## Inspect a style without rendering

From the repository root:

```sh
python3 tools/style_recipe.py watercolor
python3 examples/reference-recreation/reproduce.py watercolor
python3 examples/reference-recreation/reproduce.py lidar-survey
python3 tools/style_recipe.py --validate
```

The recipe prints the exact saved file paths, historical model/effort, attributed
shared-component inventory and the commands for that style. Production properties
in [production-profiles.json](../../styles/production-profiles.json) describe what
to build and review for new topics; specific old facts/shot counts stay in the
reference script. The complete example list is the [51-style evidence index](../../comparison/REPLICATION_REPORT.md#per-style-audit-trail).

## Reproduce the saved source in a fresh checkout

Use a separate clone for experiments if you want to preserve the accepted local
release and evidence. These stages do not invoke a language model; they execute
the scene/score code already authored during the GPT-6.1 Sol High run.

```sh
sh tools/setup.sh deps voice music
sh tools/fetch.sh instruments all
python3 examples/reference-recreation/reproduce.py watercolor --fetch-inputs
python3 examples/reference-recreation/reproduce.py watercolor --check
python3 examples/reference-recreation/reproduce.py watercolor --run stills
python3 examples/reference-recreation/reproduce.py watercolor --run render
python3 examples/reference-recreation/reproduce.py watercolor --run speech
python3 examples/reference-recreation/reproduce.py watercolor --run compare
```

`--fetch-inputs` downloads the original movie **for analysis** and the small shared
dependency archive, verifying recorded SHA-256 values before installing them.
Original frames/master audio are not used as the new film's runtime output. Fonts,
drawings, models, rigs and other licensed shared source assets already committed
in the checkout retain their original credits. The instruments command downloads
the documented licensed sample packs; it can be narrowed to those used by a film.
Kokoro is local; Mandarin Edge speech needs network access. Game Show's native
macOS voices require their installed original cast; another OS cannot silently
claim identical casting. An explicit recast needs new provenance and review.

Private intermediate files live in `work/replication/`, independent of where the
checkout is located. Set `GPTCAR_WORK_DIR` to use another work folder and
`GPTCAR_VOICE_PYTHON` to an environment with the audio dependencies. The final
movie/posters live in `.release/replicas/`; encoded result metadata lives in
`comparison/replica-results/`. A matching source/movie can return `cached`.
Rendering changed media invalidates the old movie-bound review; no command here
automatically accepts a film, modifies a remote release or deploys Pages.

The render stage runs the same production scripts used in the redo:

1. `tools/synthesize_replica_voice.py`: exact input → fresh per-line takes/timing.
2. `tools/compose_replica_audio.py`: new sectioned score/Foley + voice → PCM mix.
3. `core/render/still.mjs` and `core/render/video.mjs`: deterministic scene code
   → reviewed frames and full picture at the measured original fps/frame count.
4. `core/render/mux.sh` and `tools/limit_replica_peaks.py`: PCM/picture → AAC MP4;
   remeasure actual encoded loudness/true peak, starting from PCM for limiting.
5. `tools/check_replica_narration.py` and `tools/compare_replicas.py`: independent
   speech-recognition evidence and same-time decoded final-movie pairs.

Fresh TTS, OS voices, fonts/browser/GPU and codec versions can change output bytes
or performance. “Reproducible recipe” means saved inputs, code and explicit stages,
not a promise of identical new audio bytes or an identical model response.

## Ask a model to author another reconstruction

Paste [prompt.txt](prompt.txt) into your tool-capable agent, replacing the selected
style if needed. A Codex CLI invocation for the recorded model/effort is:

```sh
codex -m gpt-6.1-sol -c model_reasoning_effort='"high"' "$(cat examples/reference-recreation/prompt.txt)"
```

That is a new invocation example, not a claim that this exact shell command
launched the historical workers. For another model, select its real available
identifier/settings and record them. The historical comparison renderer and
gallery intentionally verify their recorded GPT-6.1 Sol High provenance; do not
edit that label to make another run pass. Author separate user films in `films/`
using the model-neutral core renderer and the [new-topic prompt](new-topic-prompt.txt).
Loading a skill in a text-only chat does not supply a shell, browser or renderer.

## What made the second pass better

The [production findings](../../.agents/skills/gptcar/references/production.md)
explain the reusable changes: full scope and per-screen properties; sufficiently
detailed assets; actual object contacts and physical mechanisms; matched camera
crop/scale; exact text and intermediate UI states; narrative music and silence;
independent speech checks; decoded-movie review rather than render-success claims;
and hash-bound review of the final source, dependencies and export.

For Watercolor, that meant fine botanical construction and transparent pigment,
all five biomes, rain following branches to roots, fire/regrowth, the tall tree
camera move, rainforest strata and the complete deep-time map—not a generic
watercolour landscape. For a new subject, design equivalently specific mechanisms
for that subject. Shared assets are credited, and remaining differences are
documented. These are source-informed recreations, not blind model benchmarks.
