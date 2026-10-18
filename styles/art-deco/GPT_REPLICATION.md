# Midnight at the Starlight Hotel — replication findings

Read the complete canonical scene prompt at `comparison/matched-briefs/art-deco.md` and its full published data/script in the adjacent JSON before implementation. The original chat prompt is not published; this is a source-informed reconstruction. The user-selected reference overrides the normal fresh-story rule.

Preserve full delivery: 1280×720, 24/1fps, 1401frames, 58.375seconds. Keep the separately documented1920×1080 art canvas and native internal medium resolution. Do not use rounded style.json duration or infer fps from default24.

## Production scope that must survive

Black/gold/jade/burgundy with engraved key lines, radial fans, stepped bevel geometry, soft airbrush shading and true perspective. Pip: expressive slim young bellboy, burgundy pillbox with gold stripe, burgundy double breasted jacket, black hair/gloves, ivory sealed envelope. Conductor mature silver hair ivory tailcoat;8 ivory fan dancers. Limelight/Poiret One/Josefin Sans/Italiana OFL.

## Failures to prevent

V 1 reduced faceted engraved hotel/characters and omitted envelope delivery,30 floors, kitchen cap gag,12 letter bells and lift punchline.

## Audio and attribution

116 BPM foxtrot, stride piano/clarinet gliss/brass strings muted trumpet, accelerate stair Charleston 116→138. Kitchen syncopation, stop for letter throw 33.155–35.86, twelve 116 BPM bells then new D-flat full song.

Recreate every published spoken line or short shout, preserving language and cue times. No original master audio reuse. Generic shared components must be named and attributed; scene assembly, route and performance are independently regenerated. engine/deco.js, type.js, bulbs.js, cam.js for attributed general material/text/light/camera; independently assemble hotel, casts and scenes.

## Acceptance evidence

Inspect the whole original, every scene/card, important prop and transition before coding. Use exact decoded absolute timestamps for timing acceptance:1fps contact-sheet labels are approximate and can falsely suggest phase, trajectory or rotation errors. Add exact midpoint captures for every subsecond card. Compare original/generated art at identical timestamps, plus dense coverage for gestures and handoffs. Technical render success alone is not artistic acceptance. Preserve detailed geometry/material/typography and full narrative causality; never reduce difficult action to a title card. Record missing assets or factual uncertainties explicitly.

Original codeMIT; reuse only explicitly attributed general helpers/fonts/assets with supplied licences. New scene staging and animation must be authored independently. Original model end credits recorded as historical reference, replaced honestly in recreation.

## Implementation checks from the matched build
The reusable runCycle returns {pose,bob}; spread pose, not the container, or the hero will stand while translating. envelope and clef use tiny model units; closeup scales must be explicitly enlarged. The material engine beam accepts positional length/width/alpha; airbrush direction is an angle, and fan fill cannot be null. Camera transforms must survive the lobby background fill. Thirty floors require real repeated facade/landings, and a separate closeup at floor30; avoid duplicate hero drawings when switching framing. Overhead fans need a native figure-scale around5 before the camera pullback, and the clock overlay must preserve the dancers rather than opaque-filling over them. Inspect every bell, button tap, cap flight and return, XII insert, envelope catch, baton, sign sweep and lift gag at exact times.
