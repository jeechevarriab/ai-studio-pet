# Progress — 2026-11-02

## Watch-style companion customization and live STUDIO status

Owner requested an Apple Watch companion-style editor, Undo per feature and Apply
with owner-only cross-device saving, then authorized live STUDIO activity. Added
/customize with 48 controls in five categories, live preview, independent Undo,
discard and Apply & Save. Sites identity bootstraps the configured owner to a
stable site-scoped ID; cloud R2 storage uses revision/etag checks and same-origin
write validation. Owner sign-in and a default-design save were verified live.
Anonymous writes, invalid/oversized settings, identity header spoofing and stale
updates were checked. No credentials or owner identity are sent to app clients.

A separate Windows relay sends only five fixed roles, status/phase enums and
timing metadata from native/dashboard status records. The public app reacts to
working/attention states and displays phase, elapsed time and indeterminate
progress on WORK. There are no actual source percentages, so none are invented.
The source hub API required pairing; its auth was not altered or borrowed. The
relay has its own status-only key and no inbound port. It is running, with a
manual restart helper; Windows startup settings were not changed. 24 local tests
plus hosted API/auth/persistence/relay checks passed. Main features and V1 remain.
See customization-and-studio.md for exact source/projection and limitations.

## ASCII eye rendering

V2 now renders actual monospace characters (.:+ x*o O0#@) instead of vector
circles/crosses. The existing eye masks, footprint, palette, gaze, blinking,
sleeping curves and happy pickup remain. Cells stay fixed to their expression;
staggered 2.2-second character cycles blend over the last 22% of each cycle.
Reduced motion and pause stop the symbol flow. The eye sheet now contains
editable SVG text. No extra fonts or network dependencies were introduced.
Twenty-one automated checks pass, including character validity, shape stability,
character changes over time and reduced-motion invariance. Browser preview
reviewed at phone size; physical iPhone performance remains unmeasured.

## Depth-guided color and lighting

Owner supplied a depth-map reference. Implemented a procedural rounded depth
field (forward center = 1, receding boundary = 0), baked soft edge occlusion,
and a smooth moving highlight/opposing shadow driven by the existing smoothed
tilt/pointer input. This is a browser volume-lighting approximation, not camera
depth capture. No new sensor, camera, network or runtime permissions added.
The approved palettes, dark PLAY, diffusion, eye glyphs, gaze and V1 remain.
Noise/depth masks stay static; dynamic light uses separate per-page scratch
canvases, preserving the swipe fix. Reduced motion freezes the light pose.
Twenty automated checks pass, including monotonic depth, directional lighting,
clamping and reduced-motion invariance. Physical iPhone behavior remains untested.

## Layered eye glyphs, blue PLAY, gaze and pickup

Follow-up correction: inverted the sleeping lid arcs (including the sleepy wink)
and increased V2 eye size another 30%, from 1.4 to 1.82. Separation grows with
the eye footprint to preserve the space between the two eyes.

Replaced crosses etched inside every eye dot with disjoint dot/cross samples
in three tinted depth bands, keeping the original eye contours and spacing.
PLAY now uses blue behind a near-black diffused mascot with luminous cyan eyes;
the grey highlight was removed following the owner's correction. Forecast/menu
text uses light colors for readability. V1 and other page backgrounds preserved.

Orientation adds a smoothed corner glance independent of body sway. After at
least 1.8 seconds at rest in quiet LIVE, a deliberate gravity-vector change
triggers a 2.8-second happy expression, with a six-second cooldown. Active menus,
tasks, hidden tabs and pauses suppress pickup. Accelerometer and orientation
fallback use memory-only samples; Safari permission starts on a real touch.
Motion/denial hardware and installed iPhone behavior remain untested. Detector
and independent eye-glyph regressions added; 19 automated checks pass.

## Diffused surface and swipe flicker

Fixed a shared V2 texture canvas/throttle that could reuse another page's tint
while both pages rendered during a swipe. Each page now owns its cached surface;
page clipping also prevents glows spilling over a neighbouring background.
Replaced the hard gradient/grid finish with a broad diffusion mask, stable
multi-scale mottling, irregular translucent pores and a luminous center. Motion,
eyes, menus and V1 are preserved. The surface no longer depends on Canvas blur
filter support. A regression exercises 80 alternating page draws and checks
surface ownership/tint and soft mask coverage; 17 tests pass. Browser desktop
and phone-size checks passed; physical iPhone playback remains untested.

## Public app authorized and published

Owner explicitly approved making only the mascot public for iPhone access.
Separate Sites release at https://studio-mascot.jesse-ech.chatgpt.site;
private repo and studio services remain unchanged. No tunnel, firewall change,
dashboard/agent access or local service exposure. See app-launch.md for release
identity and browser-side forecast transport difference.

## App-only launch view

Added `/app` with black surround, centered device, favicon/home-screen icons,
standalone manifest and offline shell caching. Existing playground and V1 are
preserved. Browser and 16 automated checks passed; installation and offline
relaunch remain untested. Loopback only; phone/public hosting not enabled.
See app-launch.md for startup, usage and boundaries.

## Setup evidence

- Read the referenced TAMAGOTCHI AGENT chat and the owner's pasted Phase 1 brief.
- Inspected current hub source, five registered native identities and shared-knowledge contracts using read-only operations.
- Existing Git authentication successfully cloned jeechevarriab/ai-studio-pet. The remote advertised no refs and Git reported an empty repository. Read/clone access is verified; push rights and repository visibility have not been independently verified.
- Hub /api/health reported workerOnline=true and codexConnected=true. This is a point-in-time health check, not an end-to-end test of the five agents.
- The knowledge helper refused this chat: "This is not one of the five registered native research conversations". No identity override or retry under another agent was attempted.
- Prepared local project instructions, verbatim brief and memory documents. No production hub edits, service restart, permission changes, network exposure, commits or pushes were performed.

## Pending activation

A PET conversation has not been created. Enforced project-scoped filesystem/network permissions are not yet configured or verified. This setup chat runs with unrestricted filesystem access; AGENTS.md does not impose OS isolation. Obtain owner approval for a PET-only restrictive permission configuration before activating the new developer.

Direct knowledge retrieval is unavailable to PET through the existing five-agent interface. Preferred first step: owner-supplied, relevant validated excerpts without new hub privileges. A dynamic sixth-agent read-only interface requires a separately reviewed core change.

## Phase 1 implementation update

The owner subsequently supplied the same brief again and requested work using the tutorial and prompt. This authorizes project development, not the previously reserved service/permission changes. Phase 1 browser work proceeded in this chat; a sixth agent was not activated implicitly.

Implemented: local vanilla HTML/CSS/Canvas simulator, native 410 × 502 framebuffer, four modes, horizontal pointer swipes and keyboard navigation, four animated dot-matrix expressions, editable JSON, synthetic environment/status/task inputs, minimal scene props, animation pause/speed, reduced-motion handling and a small tuning/export panel. No dependencies installed for the simulator.

Added exact official Muse source pin with preserved notices. Relevant official documentation/board configuration reviewed. ESP-IDF is unavailable in this shell; no firmware build, SDL native simulator or upstream host test ran. Source reproducibility is established, binary/dependency reproducibility remains pending.

Automated behavior/server checks: eight passed after correcting a test fixture to send a real Host header (Node fetch normalized the original test's header). Final syntax/data checks passed. Browser interaction checks exercised all four modes and expressions, desktop/mobile swipes, keyboard navigation, task events, weather, time-of-day and pause. Responsive layout inspected at desktop, 390 and 320 CSS-pixel widths. Screenshots were saved outside the repository for review. No app-origin JavaScript error was observed; unrelated browser-extension warnings were visible. No frame-rate or physical-device performance claim is made.

Next: owner review of visual behavior; separately approve/install an isolated ESP-IDF environment and compile the pinned source; then implement the original character renderer for firmware. Sixth-agent permission isolation/activation remains a separate unfinished setup item. Do not connect real studio events or expand network access without the required approval.
