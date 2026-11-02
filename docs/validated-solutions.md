# Validated solutions

## Independent surfaces during a swipe (2026-11-02)

V2 outgoing and incoming scenes render in the same animation frame. A single
mutable, throttled texture canvas can return the other scene's tint; use a
separate cache slot per page/palette/geometry and clip each translated page.
The regression in mascot-design.test.mjs exercises 80 alternating page draws.
Static multiscale alpha noise avoids frame-random shimmer and Canvas blur filter
differences. Seventeen Node checks pass; Chrome page navigation and phone-sized
frames reviewed, with no app errors. Physical iPhone playback remains untested.

## Local simulator and portable character data — 2026-11-02

Observed: the simulator runs on the installed Node runtime without additional packages. Its eight Node tests verify automatic behavior priorities, expression overrides, validated 5 × 7 matrices, swipes, pause/time clamping and loopback asset restrictions. Browser checks exercised actual horizontal swipes and keyboard navigation, all four modes/expressions and synthetic task/environment updates. Native framebuffer: 410 × 502; responsive layouts inspected at desktop, 390 and 320 widths.

Limits: these are local simulator results only. They do not validate firmware, hardware, upstream Muse services or enforced agent isolation. No shared-knowledge record was published and no existing studio research was imported.

For each future entry record the problem, applicability, source URL, exact source/tool version, tested method, observed result, limitations and verification date. Keep recommendations separate from tested facts. Include studio knowledge record ID/version/hash when an explicitly shared record is used. Do not store credentials, private conversations or unrelated client material here.

## Per-mode persistence and React Bits shaders — 2026-11-02

Problem: flat editor settings and clearing the touch expression on navigation lost the chosen eye appearance. Method: validated per-mode overrides with legacy global fallbacks, mode-specific histories, targeted Apply and reconciliation of pending/newer changes. Evidence: test/per-mode-design.test.mjs and deployed owner-browser save/switch/reload/restore sequence; 31 private tests and hosted storage/auth tests passed. Never infer anonymous write permission from a preview.

Source for shader integration: https://github.com/DavidHDev/react-bits at 4dc7b5b7772e1217c8fb8d2a7aa074302180e5b4, selected through the supplied local React Bits README. Application adapter extracts the four shaders and uses one WebGL2 context, no React or Three runtime. Copy into per-page surfaces before rendering another page to retain swipe isolation. Preserve the MIT + Commons Clause notice. Browser visually checked Aurora, Iridescence, Color Bends and Silk; no shader fallback messages observed. Limits: no physical iPhone performance, hardware or firmware parity claim.

## Original Cloud plus two-pass Dither — 2026-11-02

Source: React Bits /backgrounds/dither live Customize UI and upstream Dither JSX/demo/presets pinned 4dc7b5b7772e1217c8fb8d2a7aa074302180e5b4. Retain the upstream license. Use a low-resolution wave field texture, followed by the original indexed/ordered dither shader; convert hex palette colors from sRGB to linear before shader input. Copy each page output immediately so the next page cannot overwrite it. Clock, trails, ripples and presets must be per-page. Restore Cloud by bypassing the GPU pass entirely. Evidence: browser rendered Classic/Blueprint/Ice/halftone without fallback, and 35 tests including migrations, preset Undo, per-mode Apply and finish dependency passed. Limits: no physical iPhone performance claim.

## First-frame design gate — 2026-11-02

Problem: initial render preceded saved-design loading and briefly displayed factory appearance. Keep a static HTML/CSS black visibility gate, skip animation rendering until validated settings arrive, then remove the gate after the first configured draw. Prefer the network's saved design; use confirmed local cache only after failure; never accept factory defaults as a saved record. Block preview actions during this load. Evidence: delayed two-second loopback read showed hidden/pending before data, visible/not-pending afterwards; async startup regression tests pass. This verifies the browser flow, not physical iPhone performance.
