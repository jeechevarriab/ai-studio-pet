# Existing eyes — animation-only release

The final scope adds only smooth blinking, occasional double blinks and directional gaze to the eye types already in the app. No generator, new eye types, extra controls, shared-settings migration or editor redesign is included.

Original types retained: Orbit, Daydream, Glee, Lilt, Prism, Ripple, Intent, Sideglance, Soft wink, Starlit, plus existing activity expressions. Existing ASCII glyphs, eye colors, size, spacing and density settings are unchanged. Existing Blink Frequency remains in use; no saved settings are rewritten. The original body pipeline, floating movement, lighting/color changes, click-to-bottom zoom and navigation remain unchanged.

Production-source changes from the previous live version are limited to renderer.js, the timing-only eye-motion.js module, its service-worker cache entry, and the build asset list. App, Editor, design schema, Favorites API and body artwork match the pre-feature source.

Validation: 41 focused tests and built Worker API/Favorites checks passed. Existing-eyes-only-validation.json verifies all ten original touch eye types have zero static pixel differences, each animates, the body matches its previous rendering, and no generator control exists. Owner saved Favorites remain in the original authenticated app; no write to production design/Favorites data was made.

Earlier images, videos and integration tools in this folder document superseded explorations, not the scope of the final animation-only release. Do not use those old generator fixtures as the production editor.
