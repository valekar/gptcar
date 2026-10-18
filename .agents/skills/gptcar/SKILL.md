---
name: gptcar
description: Create code-rendered short films using GPTcar's 51 film styles, or list and compare those styles. Use for an explicit GPTcar request or a film in a named library style, including watercolor, ink wash, pixel RPG, LiDAR survey and product teardown. Not for editing existing video files.
---

# GPTcar

An independent Codex adaptation of Lemomo/LemoLab's Lemo-Opuscar library. The
style prompts and historical demos retain their original authorship. No specific
model or model API is required by the renderer.

1. Run `sh "<skill base directory>/scripts/setup.sh" check`. It finds this
   checkout or downloads GPTcar to its data folder and prints `LIB=<path>`.
   Read `$LIB/AGENTS.md`, then the matching `$LIB/styles/<slug>/STYLE.md`.
   For style browsing only, read `$LIB/styles/README.md`; no dependencies needed.
2. For film production, read `$LIB/DIRECTOR.md` and `$LIB/TECHNIQUE.md`.
   Run `sh "<skill base directory>/scripts/setup.sh" deps` to install local
   packages. Add `deps voice` or `deps music` only when needed. Report missing
   system tools. The script never installs Node or ffmpeg system-wide.
3. Use the user's chosen topic and renderer. If the host has a required video
   workflow, use its routing and take the library's style as art direction,
   unless the user explicitly requests the GPTcar renderer. That renderer
   uses deterministic `window.render(t)`, not HyperFrames timing attributes.
4. For an explicit recreation or same-script comparison, first read
   [replication mode](references/replication.md) and the style’s
   `GPT_REPLICATION.md` if present. Preserve the reference’s full scope; follow
   its scene audit and fidelity review instead of inventing a new story.
   For a fresh film, write the treatment before opening `DEMO.md` or demo sources. Render and
   inspect real style frames before production; the historical demos are
   technique references, not templates for the user's story. Work in the film
   folder and keep the library's style guides and core tools unchanged.
5. Deliver the MP4, poster, source/build script, treatment, credits, subtitles
   when applicable, and `FACTS.md` for factual films. Report checks actually run
   and any limits. A successful render does not establish visual parity with
   the upstream Opus demos.

In a library checkout, films go in `films/<name>/`. When invoked from another
folder, create `<name>/` there. Run core tools from `$LIB` with the film's absolute
path. Pages use `/core/…` and `/node_modules/three/…`; shell scripts use `$LIB`.

Setup never updates a checkout silently. An explicit
`sh "<skill base directory>/scripts/setup.sh" update` fast-forwards only a clean
clone whose origin matches `GPTCAR_REPO`. Use `GPTCAR_HOME` to select a
different library location. `demo <slug>` reports the bundled reference path.
