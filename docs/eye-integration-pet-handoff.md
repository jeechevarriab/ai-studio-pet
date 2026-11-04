# PET eye configuration integration handoff

2026-11-03 · shared branch `codex/pet-shared-eye-motion`

## Scope and files

PET ownership completed in `simulator/design.js`, new
`test/shared-eye-design.test.mjs`, and focused expectation updates in
`test/favorites.test.mjs` and `test/parameter-panels.test.mjs`.
No renderer, app, editor, body, color, infrastructure, production API, publishing,
Git commit, or Git push changes were made by PET for this handoff.

## Shared contract

New Face fields:

| Key | Default | Valid range/type |
| --- | --- | --- |
| eyeStyle | 0 | integer 0–100; renderer owns Lilt mapping at 0 |
| eyeBlinkDuration | 180 | 80–500 milliseconds |
| eyeBlinkInterval | 5.1 | 1–15 seconds |
| eyeOpenness | 1 | 0–1, editor step .05 |
| eyeGlow | 0 | 0–8 |
| eyeTracking | true | boolean |

`EYE_SETTING_KEYS` exports these plus existing `eyeSize`, `characterSize`,
`eyeSeparation`, `eyeDensity`, `asciiLight`, `asciiMid`, `asciiDark`, `asciiSpeed`
and legacy `blinkSpeed`. All are global across LIVE/WORK/PLAY/SLEEP. Per-page
`expression` and named `liveEye/workEye/surfEye/sleepEye` colors retain existing
semantics. `eyeDensity` is labeled ASCII Density. Legacy `blinkSpeed` validates
and persists, with `hidden:true`; it is excluded from visible group keys. Editor
must filter hidden fields (its current in-progress integration does this).

New timing is independent from legacy multiplier; renderer must consume the new
duration/interval fields. `designDefinition()` retains `presentationV2.custom`
and also exports eyes.style/blinkDuration/blinkInterval/openness/glow/tracking.
All are portable scalar data; no DOM, API, or timer dependencies were introduced.

## Migration and saved-state compatibility

`validateDesign()` canonicalizes old per-page eye overrides to global values.
For each eye key, the first explicitly overridden value in fixed LIVE → WORK →
PLAY (`surf`) → SLEEP order wins, otherwise its root value/default remains.
Legacy overrides are validated before stripping; expressions, body settings,
finishes, page colors and other settings stay intact. Migration is idempotent,
does not mutate the input, and is independent of JSON object insertion order.
New edits canonicalize old inputs before writing, so a stale override cannot
undo the new global edit. Old divergent eye appearances intentionally converge
to one shared appearance. No production profile was migrated or saved here.

Single-field Apply/Undo use global history keys. `reconcileSavedDesign()` retains
unrelated drafts and eye edits made while another save is in flight. Face section
Apply includes shared eyes and the selected page's expression/color; authentication
and revision handling remain in existing callers.

Favorites continue capturing eyes. Applying a Favorite intentionally updates
global eyes on every page, while its expression/body/color affect only checked
destinations. Legacy Favorites missing the six added fields remain valid and gain
their defaults; unknown fields, missing pre-existing fields, and invalid values
remain rejected. Older clients/servers without the new schema cannot save these
new fields; hosted source and client must be updated together by the lead.

## Helpers

- `resetEyes(design)` returns a validated design with only EYE_SETTING_KEYS reset
  to DESIGN_DEFAULTS, including style 0 (approved Lilt selection). It preserves
  expressions, page eye colors, body, finish, alarm, sensors and all other data.
  This is a schema baseline reset, not a fetch/overwrite of a cloud design.
- `randomizeEyes(design, random = Math.random)` returns a validated design;
  optional seeded source must return finite 0–1 values. It varies style, size,
  separation, density, duration, interval, and restrained glow; opens the eyes.
  It preserves ASCII palettes/flow, tracking preference, character size and all
  non-eye fields. The same random source sequence reproduces the same result.
  Both helpers are draft-only; existing editor Apply controls own persistence.

## Validation

22 focused tests passed:

```text
node --test test/shared-eye-design.test.mjs test/design-editor.test.mjs test/per-mode-design.test.mjs test/favorites.test.mjs test/parameter-panels.test.mjs test/design-startup.test.mjs
```

Coverage includes old-profile migration, serialization/reload, global mode
resolution, independent Apply/Undo, edits during saving, strict bounds/types,
legacy Favorite loading, randomize/reset isolation and deterministic injected
randomness. `designDefinition()` body/task geometry equality is checked before
and after eye randomization. No renderer pixel comparison, animation playback,
browser editor interaction, physical device, firmware build, or production save
is claimed by this schema-only handoff; those remain lead integration checks.
