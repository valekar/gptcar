# Production quality learned from the 51-film redo

For a new film, use this with STYLE.md. For a recreation, also read replication.md.
These are observed production lessons, not an assurance that every model will
match an artist or that completing a checklist establishes artistic quality.

## Match the contract to the request

For a **new topic**, preserve the style grammar and production depth, then create
the user's story, assets, facts and score. Do not copy the demo's timeline,
numerical claims or shot count. Obtain the specific properties with
`python3 "$LIB/tools/style_recipe.py" <slug>`. Its recorded example is a technique
reference after treatment. For a **recreation**, inspect the original first and
preserve full scenes, actions, UI states, text, language, timing and format unless
the user changes them. For a **comparison**, record prompt, assets, engines and
reference access. Licensed shared art is permitted when disclosed; it is not
independently invented GPT artwork.

The rejected first pass used short, simplified studies of the same premise.
Style names and valid MP4s did not make those matching films. Do not reduce scope
to make a batch easier. A deliberately short new user film is fine; an unrequested
duration cap on a recreation is not.

## Specify the work before scene code

Save the user request and actual generation prompt. Record the actual model/effort
if known; never inherit the historical run's label. Write a treatment and timed
scene ledger. For each scene specify:

| Property | Concrete detail |
| --- | --- |
| Purpose/time | What changes for the viewer; start/end, holds and short transition phases. |
| Subject/assets | Anatomy, geometry, real data window, UI states, internals and dependencies. |
| Composition | Scale/crop, depth layers, eye-line, negative space and light direction. |
| Material | Palette, transparency, stroke/texture scale, edge behaviour, thickness and shadows. |
| Camera/action | One world-to-screen transform; contact mechanics; entry/action/exit and reverse faces. |
| Visible text | Exact words/language, typeface/size, bounds, clause breaks and reading interval. |
| Speech | Exact synthesis input, cast, cue/window, speed/pitch and intentional trims. |
| Sound | Section intent, tempo/meter, instruments, dynamics, silence type and specific effects. |
| Review | Before/during/after samples and the visible or measurable property to inspect. |

Use the style profile and GPT_REPLICATION.md findings to make these concrete.
“Premium”, “cinematic” or “Opus-level” cannot replace properties. For a new film,
select signature mechanisms that demonstrate the style rather than a catalogue
of disconnected effects.

## Build sufficient assets

Keep an asset ledger: ID, role, path, source URL/author, licence, permitted use,
new/shared status, checksum when applicable, and transitive dependencies. A glTF
without buffers/textures, a font family without the actual face, or a point-cloud
label without its data is incomplete. Attribute engines, complete artwork, rigs,
models, photos, datasets, fonts and sample libraries separately from new staging.
Use the recorded generation.json, CREDITS and shared-components.json when present
as concrete inventories, not as proof that all art was newly drawn.

Detailed art may need anatomical rigs, fine botanical strokes, varied buildings
and windows, complete CAD/PCB internals or registered imagery. Primitives are
useful for blocking, not a silent final substitute. Render the difficult asset
at its largest intended crop; inspect silhouette, internal detail, material and
contact shadows before assembling the film. Add licensed assets when needed by
the subject. Do not download unrelated art merely to fill a checklist.

For evidence films, tie source selection, dates, units and denominators to each
claim. An intermediate animated counter is not a factual measurement. Archived
example claims are not automatically current facts for a new film.

## Animate actual mechanisms and score the story

Use deterministic render(t), fixed seeds and no seek-order dependence. Wait for
fonts/images. Separate native sprite/cel stepping from smooth camera/light.
When caching complex art, compare cold, sequential and out-of-order seeks:
geometry, texture phase or SVG tessellation can change during parallel capture.

Show the mechanism: cake reaches mouth, box opens, pen touches its stroke, and
dimensions anchor to objects. A reverse-stage reveal needs back faces, thickness,
rods/hinges, shadows and the changed viewpoint. Inspect every UI state and hold;
the correct final menu/list is insufficient.

Keep narration takes separate from caption clauses. Preserve cast, gain, pan,
crowd overlap and cue times. For first-word commands, synthesize the full published
input, independently locate the fresh word boundary and retain trim provenance.
An unavailable voice is a disclosed recast, not permission to copy the old take.
Compose section changes and event-specific Foley. Distinguish **music rest**
(intentional ambience/Foley remains) from **full silence** (all buses silent);
inspect mixed PCM during those spans.

Check actual speech with independent ASR and listen when playback is available.
Exact synthesis inputs, recognized outputs and listening reviews are different
evidence. Names, homophones and nonverbal syllables may remain uncertain; never
turn input equality into a claim of perfect audible speech.

Measure encoded AAC, not only WAV. This run used approximately −14 LUFS, accepting
−15.2 to −12.8 LUFS and at most −1 dBTP; these are library delivery defaults, not
universal platform requirements. For limiting, start each attempt from fresh PCM
and copy the video stream. Repeated AAC generations can worsen peaks. Preserve
intentional opening attacks; fade only when the film's timing permits it.

## Review separately from rendering

Inspect every scene, signature asset, close-up, state change, ending and short
transition at delivery size. For recreations decode both completed movies at
the same quantized CFR timestamp. Source render(t) stills and a decoder may pick
opposite sides of a cut; do not retime a correct cut from that false mismatch.

Repair omissions, inadequate assets, wrong scope/crop/scale, weak material,
unreadable text and early/late reveals. Record scene/time, observation, fix,
recheck and remaining limits. Technical gates test files, frames and audio;
they cannot certify refined art. Do not claim pixel identity, human listening
or a controlled benchmark without evidence. Bind final review to the exact
source/dependency and movie hashes, not source-ready flags or sheet existence.

When delegation is authorized, scope each worker to a film. Freeze dependencies
and write source-ready metadata last. Deliver saved prompts, treatment, asset
ledger/credits, source/build commands, audio scripts, movie/poster and actual review.
