# Shared eye system — creative review

Implemented on feature branch codex/pet-shared-eye-motion, coordinating with the existing Web & Coding and PET Developer chats. The production site and owner settings have not been deployed or written.

## Features

One reusable Canvas eye renderer consumes portable numeric style and animation data across LIVE, WORK, PLAY/SURF, SLEEP and the editor. Open/half/closed, smooth blinks and occasional double blinks, independent blink duration/frequency, subtle directional gaze/pupil tracking, expression-specific focused/happy/sleep behavior, manual openness and glow. Appearance transitions use the existing app clock. Paused/hidden renders do not continuously schedule animation frames; reduced motion freezes automatic movement.

Face → Eyes extends the existing parameter UI: Eye Style Generator, size, spacing, ASCII density, glow, openness, tracking, blink duration and interval. Existing glyph palette/flow controls remain. Randomize Eyes, Reset Eyes, Pause/Play, Blink and Compare approved default are draft/preview actions with existing Undo/Apply/save persistence.

Ten curated style families: Approved Lilt, Orbit, Daydream, Tall oval, Focused, Soft rectangle, Wide curious, Angular, Asymmetric, Horizontal. Generator values are deterministic; some values within an original curated family intentionally share geometry. Existing ten touch expressions remain available when the approved baseline style is selected; generated styles retain activity-driven emotion and blinking.

Legacy per-page eye appearance settings converge to shared values in fixed LIVE → WORK → PLAY → SLEEP precedence. Expressions and eye colors remain per-page. Old Favorites stay valid. Only eye keys are reset/randomized. Changing a style retains animation settings.

## Body preservation

The original body rendering pipeline is restored verbatim, including its material, colors, gradient cycle, lighting, sensor pose, floating motion, deformation, tap-to-menu movement and zoom. Existing page navigation and menu behavior remain. Before/after body comparisons use the same clock and pose, with eye drawing suppressed. Source baseline retained in renderer-before.js. Existing body/color settings and production profiles are not overwritten.

## Verification

46 focused node tests passed, plus two built Worker API/Favorites suites and build/artifact validation. Browser verification covers immediate response of nine new/existing eye controls, save/reload, global mode sharing, reset/randomize/compare, manual blink returning to pause, and no new page errors. Paused and hidden requestAnimationFrame counters remain unchanged. 390px viewport has no horizontal overflow. Collaborator mobile checks measured 44px eye toolbar buttons.

five-styles.png was captured from actual editor preview canvases at generator values 0,12,38,60,86. editor-demo.mp4 records those five styles from the actual app renderer, approximately 20 seconds at 30fps. Full normal-speed decoded playback completed; playback-review.png holds six representative frames. Validation JSON files retain measured results.

## Review preview

Run node tools/eye-integration-preview.mjs 4183, then open http://127.0.0.1:4183/customize and choose Face. Saves affect only the synthetic local fixture, survive page reloads within that preview process, and reset when it stops. This is not production authentication or storage. The normal app uses its existing owner-authenticated revisioned backend and local confirmed cache. The mirrored Sites source includes the shared module/schema for a later reviewed release.

## Limits

Physical phone touch/sensors and ESP32 compilation/hardware are unverified. Browser Canvas appearance is not a firmware implementation; pure eye-motion.js masks/timing and numeric configuration are portable source for that later work. Owner-account production persistence was not changed/tested against live settings. Final creative approval and production release remain pending. No libraries, paid services, AI STUDIO core services or agent settings were changed.
