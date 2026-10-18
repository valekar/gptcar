# Recreate an existing film

Use this mode when the user asks to replicate an existing film or compare models on the same script. It overrides the ordinary instruction to invent a fresh story before reading the demo: the reference film is the brief.

Read the published style guide, complete demo guide and original narration/card script. Inspect reference frames across the entire film, plus every distinct shot, screen/card, important action and transition. A few representative stills are insufficient. Use exact transition/beat times from source to inspect fast shots that a regular contact-sheet interval misses. Record the actual reference format and frame count separately from its production-canvas settings.

Write a scene-by-scene reconstruction prompt before generating the film. For each screen/shot include timing, composition, character/prop geometry, material and brush/shader detail, colours, exact text, typography, camera, action, entry/exit transition and sound. Preserve the original narration, language, story beats, scene order, duration and production scope unless the user requests a change. Do not replace a hard scene with a title card or shorten the film to make a batch easier.

Distinguish three things in provenance: the published style prompt, a genuinely published original input prompt (if any), and a reconstruction inferred from the finished film or source. Do not call a reconstructed brief the identical original conversation prompt. When no original chat prompt exists in the repo, disclose that and use the complete published specification and reference breakdown.

The library's generic rendering utilities and reusable style engines are valid production tools. Attribute reused components. New scene assembly, staging and animation must be generated for this version; do not relabel the original scene code, exported frames or master movie as new GPT output. Shared source photographs, datasets, fonts and general style-engine primitives must be identified explicitly. If exact Evidence assets are unavailable, mark the gap rather than substituting a different subject while claiming a match.

Preserve the published caption cue table and clause breaks separately from narration takes. A voice file may contain a full sentence while the screen shows timed clauses. Keep handwritten labels tied to the physical pen and keep closing credits clear of the subtitle/title area.

Recreate voice/music when requested. Preserve narration text and cue timing, and musical direction/tempo/major sound cues. Record any shared or newly composed audio. Avoid generic repeating accompaniment when the original has a narrative score.

Review original and generated frames at matching times for every scene. Check story coverage, subject/shape accuracy, material detail, density/depth, typography, camera, motion continuity and audio cues. Repair visible omissions and weak substitutes before final rendering. A render, black-frame scan or contact-sheet existence is not evidence of artistic fidelity. Record remaining differences honestly; never claim equivalence from technical checks.

Match the shot's visible crop and subject scale as well as its event. A full-stage view does not reproduce a close-up of a bow, a sun impact or a held decision. For a physical reveal, reconstruct the changed viewpoint and mechanism: a reverse-side puppet stage needs its operator, rods, lamps and rear screen, rather than the original front frame with hands added. Check final credit boards for foreground occlusion and verify that narrated physical changes, such as extinguishing a fire, have happened at the spoken cue.

Check reverse faces and shadows in physical fold transitions: a back-facing title card may become blank, and a raised paper leaf needs a cast shadow. Keep illumination and facial reaction cues at their observed times instead of revealing them early.

For animated measurements, inspect consecutive frames and the settled value. A count-up or countdown can display intermediate numbers that differ from the data without any factual discrepancy. Reconstruct the motion from the actual values and timing; do not freeze an intermediate number or add a correction based on one sampled frame.

For final acceptance, decode both completed movies at the same frame timestamps (for example `tools/compare_replicas.py <slug>`). A decoder may select the next frame after a fractional timestamp, while a source `render(t)` still evaluates the preceding shot. Do not retime a correct cut because that mixed sampling method creates a one-frame mismatch. Use matching timestamps for preview posters too. Material and staging differences that persist between cuts still require repair.

For the GPTcar comparison project, canonical briefs live in `comparison/matched-briefs/`; style-specific improvements are in `styles/<slug>/GPT_REPLICATION.md` when present. The run contract is `comparison/REPLICATION.md`. The gallery stays one page with original and generated films side by side.

For long paper-theatre narratives, verify every camera crop and object action against decoded reference frames: an empty chair needs the observed pan, a package needs a genuinely open box and inserted contents, and a bite must bring the cake to the mouth. Match scene boundary timing before replacing detailed scenes with new arrangements. Preserve a recurring landscape silhouette, legible letter scale and lighting direction through repeated settings.
