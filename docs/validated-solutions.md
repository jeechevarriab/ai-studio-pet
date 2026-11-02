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
