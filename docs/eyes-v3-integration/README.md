# Eyes V3 integration — 2026-11-04

Owner approved applying the reviewed Eyes V3 idea and pushing the update.
All ten existing eye masks now project onto the same curved face surface, with
depth shading and glyph foreshortening. Existing colors, palettes, size, density,
selection, per-mode settings and Favorites remain authoritative.

`simulator/eye-surface.js` contains the reviewed 24-second attention timing,
projection and isolated pointer listener. Mouse hover and held touch guide gaze;
release/cancellation clears tracking. The open menu attracts an upward gaze.
Existing swipe, long-press expression selection, tap-to-bottom/zoom, keyboard
navigation, body motion and lighting remain under their original handlers.
Sleeping remains peaceful, pause freezes the clock, reduced motion suppresses
autonomous gaze, and the saved gaze multiplier still controls movement.

Validation: all 59 project tests and syntax/data checks passed. Focused browser
validation in `validation.json` confirmed all ten styles, up/down input, cancel,
menu attention, actual tap/menu, touch dragging and the Face eye list, without
any settings writes. Eight body renders (four modes, normal/menu placement)
matched the original renderer byte-for-byte with eye text suppressed. The
phone-sized screenshot was visually reviewed. Physical iPhone performance is
not yet verified. Run `node tools/verify-eyes-v3.mjs` to reproduce.

No backend, editor, design schema, character data or saved-design changes.
