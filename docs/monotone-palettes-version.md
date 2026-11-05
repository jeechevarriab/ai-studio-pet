# Monotone palettes — new version

Published palette update: LIVE Lavender, WORK Sky, PLAY Rose Pink, SLEEP Red. Exact owner-specified color tokens are in simulator/design.js; all eyes use #FFFFFF. Shape, eye geometry, size, motion, layout and text are unchanged.

Hosted source commit: 6071179d762972e89f9ad71a22d581538f044384.
Deployment: appgdep_6aebe627fcf8819199069e705f537bab (succeeded).
Hosted src/api/design-server.mjs applies the palette settings to existing designs until the next owner save records pagePaletteVersion 1. The published Worker was rebuilt from that source.

Validation: build/artifact checks passed; compared all four resolved palettes against current saved settings and confirmed every non-color setting was preserved. Inspected all four published pages.
