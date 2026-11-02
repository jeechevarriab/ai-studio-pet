# React Bits shader sources

Selected from the owner's Coding and Animation Library / React Bits reference.
Upstream: https://github.com/DavidHDev/react-bits
Pinned revision: 4dc7b5b7772e1217c8fb8d2a7aa074302180e5b4.

Aurora, Iridescence, ColorBends and Silk JSX/CSS files are unmodified upstream
JS/CSS registry source. LICENSE.md is the exact upstream license. These files
are retained as application provenance; they are not a standalone component pack.

tools/build-react-bits.mjs extracts the GLSL for the mascot application.
ColorBends receives a GLSL ES 3 header/input/output adaptation. The other shader
bodies retain upstream GLSL. simulator/color-finishes.js replaces React/component
lifecycle and renderer dependencies with a single bounded WebGL2 surface driven
by the existing mascot clock. No React or Three runtime is installed. The shared
surface is immediately copied into separate per-page masked Canvas surfaces.
Existing eye rendering, page backgrounds and owner-only design saving remain
independent. WebGL2 failure uses the original soft gradient; device performance
and parity with firmware are not claimed.
