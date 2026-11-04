# Eye editor integration — Web & Coding

Ready for lead integration/review on codex/pet-shared-eye-motion.
No commit, push, deployment or production settings writes.

## Files owned

- simulator/editor.js
- simulator/editor.css
- test/eye-editor-fixture.mjs — disposable owner/settings HTTP fixture, loopback4181.
- test/eye-editor-preview.jpg — mobile control screenshot.

## Implementation

Face extends the existing parameter UI with an Eyes heading and toolbar:
Randomize Eyes, Reset Eyes, Pause eyes / Play eyes, Blink, Compare approved
default / Back to edited eyes. All preview buttons have 44px minimum height.
The new schema-driven controls from PET's DESIGN_GROUPS appear automatically;
legacy fields marked hidden are filtered before passing the Face schema into
the existing compact control builder. Per-field and panel Undo/Apply remain.

Randomize uses PET's randomizeEyes helper, ensures the geometry differs from the
current style, records one Face undo snapshot and individual changed-eye history.
Reset Eyes uses PET's resetEyes helper and EYE_SETTING_KEYS only: it preserves
expression, per-page eye colors and every body/page/lighting draft. The existing
Reset Face settings still resets that complete category as before.

Preview events dispatch on document as mascot-eye-preview, detail {action}:
pause, play, blink, compare-start, compare-end. Compare toggles off on leaving
Face, mode change, parameter edit/Undo/Redo/Reset or discard. These preview-only
actions never edit the design. Renderer/app owns actual playback and comparison.

## Focused evidence

Isolated fixture browser check, no live services or cloud:

- Pause/Blink/Play/Compare dispatched the expected five events in sequence and
  left the save footer hidden. Editing and leaving Face end comparison.
- Eye size118 -> Reset100 -> Undo118 -> individual Apply -> reload118.
- Randomize produced a new integer style. Then generator67, duration240ms,
  interval7s, openness0.65, glow1.5, trackingfalse were saved with Apply Face.
  WORK showed the same style67; editor reload retained all six server values.
- Reset Eyes -> generator0; Undo Face ->67, with no false pending footer.
- Fixture bodyWidth stayed at nondefault329 throughout; one save in the final
  schema check. No unrelated body value was changed by the eye operation.
- 390x844 layout: no horizontal overflow, all five toolbar buttons44px high,
  clear wrapping and per-row controls/actions retained. Screenshot above.
- editor.js and fixture syntax checks, changed-source whitespace check passed.
- Browser's only recorded error was the initial disposable fixture serving JSON
  as a Buffer wrapper; fixed in the fixture before every successful test. No new
  app error appeared during the successful controls/save/reload flow.

Fixture stopped and viewport reset. Physical-device touch, renderer body-pixel
comparison and five-style visual review belong to lead's integrated validation;
this handoff does not claim those checks or creative approval.
