# Progress — 2026-11-02

## Apply for every control

Added an owner-only Apply button beside each of the 48 Undo controls. A row Apply
merges only that setting into the confirmed design; unrelated drafts and edits
made during the save remain pending. Apply & Save retains the save-all action.
The same cloud revision/etag checks and auth apply. Per-setting save isolation
is covered by a new regression; 25 local checks pass.

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

## Color Apply and consistent ASCII lettering — 2026-11-02

Published Sites version 12. All V2 ASCII eyes share PLAY's font weight and one-pixel edge softness, preserving per-mode tints. Color controls handle both input and change events without duplicate history entries. The editor shows owner/save access above the controls and explains disabled Apply buttons. Local /customize redirects to the synced owner-only editor; no local anonymous write route was added.

Verification: 25 private tests, syntax/data checks, hosted artifact checks and API authorization/persistence/relay checks passed. Signed-in Chrome UI confirmed that changing LIVE color activates its Apply button; Undo restored the user's original color without saving a test value. Existing cloud preferences were preserved.

## Mode personalities and four finishes — 2026-11-02

Published Sites version 14. V2 WORK uses focused eyes while standing by as well as working; PLAY uses cheerful animated arcs; SLEEP has downward closed lids with periodic sleepy stretches. Automatic idle LIVE blends between six eye silhouettes every 5.2 seconds. User-selected expressions and reduced-motion controls remain available, and V1 keeps its previous mode expression behavior.

Color controls now include Gradient Cloud, Boiling / Temperature Spectrum, Trace Paper and Dither, with independent Undo and Apply. Saturation defaults to 120 percent for both the background and blob, leaving eye lettering and UI unfiltered. Existing saved records gain defaults without resetting original fields. Boiling uses slowly moving continuous color pools; Trace Paper uses translucent warm veils and fine fibers; Dither uses a stable ordered matrix and a luminous ink on dark PLAY surfaces. The procedural finishes are original implementations inspired by the owner's screenshots, React Bits Shape Waves (https://reactbits.dev/backgrounds/shape-waves), and Dither Boy (https://studioaaa.com/product/dither-boy/); no third-party app was installed or embedded.

Verified 28 private tests, syntax/data checks, hosted build/artifact/route checks, and API owner/CSRF/revision/persistence/relay checks. Browser checked focused WORK, cheerful PLAY, sleepy SLEEP, all finish previews, and per-setting Apply activation. Found saved global Lilt override; changed only expression to Follow activity and saved with its individual Apply, per the owner's requested behavior. Preview-only finish experiments were discarded. Other saved sizes, spacing, glyph density, colors and interaction settings were preserved. Physical iPhone performance remains unverified.

## React Bits finishes and independent mode profiles — 2026-11-02

Published Sites version 15, source 80f11595d94d66cb8a5c7160985a07de7448998a. Replaced the earlier cloud/boiling/paper/dither implementations with adapted React Bits Aurora, Iridescence, Color Bends and Silk GLSL pinned to 4dc7b5b7772e1217c8fb8d2a7aa074302180e5b4. The owner's local Coding and Animation Library / React Bits README was used as the starting reference. Original JSX/CSS and exact license are retained in third-party/react-bits; the shipped shader module and license asset preserve attribution. No React/Three package, plugin, service or network exposure was installed. The existing clock drives one bounded WebGL2 surface; each result is copied immediately into separate per-page Canvas caches and the approved soft mask. PLAY uses restrained shader opacity to preserve its dark surface. WebGL absence/errors retain the original gradient. Reduced motion and pause use the frozen app time.

User reported that custom eye styles disappeared when changing modes. Previously settings were flat/global and changeMode explicitly cleared touchEye. Added validated, whitelisted modeOverrides for independent LIVE/WORK/PLAY/SLEEP profiles. Rendering restores each mode's definition and eye selection; editor values and Undo histories follow the selected mode, including device swipes. One Apply writes only that mode/field; global Apply saves all drafts. Unrelated and newer in-flight edits are preserved. Named per-mode color fields and STUDIO auto-follow remain shared controls. Legacy flat designs remain the fallback, and old finish IDs migrate without resetting saved preferences.

Verification: 31 private tests passed, including separate mode serialization/reload, independent Apply/Undo, concurrent edit reconciliation and invalid nested settings. Hosted owner/CSRF/revision/persistence/relay checks pass, including nested mode profiles. Browser compiled all four shaders and inspected representative frames. Local LIVE eye choice survived WORK and return. On the live owner editor, temporarily changed only WORK expression from touch-9 to touch-8, applied, switched to LIVE (still touch-9), returned to WORK (touch-8), reloaded and confirmed touch-8. Restored WORK to touch-9 with its individual Apply and confirmed saved status. No other test settings were saved. Browser screenshot from the earlier Apply complaint was signed out; owner authentication remains required. Physical iPhone shader performance is unverified.

## Original Cloud restored and complete React Bits Dither — 2026-11-02

Owner rejected the four shader finishes. Published Sites version 16 (a839f3bc07332d6aa57c71a2838ac568dc0c9606) with only Cloud / Original and Dither. Cloud bypasses WebGL and restores the earlier radial gradient, diffuse material mask, lighting and stable pores. Removed finish IDs migrate to Cloud in global and per-mode settings; existing eyes, colors, saturation, geometry and motion remain intact.

Dither uses the pinned React Bits 4dc7b5b7772e1217c8fb8d2a7aa074302180e5b4 WAVE_FRAGMENT and DITHER_FRAGMENT, with its real two-pass framebuffer algorithm. Read the live https://reactbits.dev/backgrounds/dither controls and exact upstream demo/presets. Added six presets; wave/background colors; six named palettes plus custom 2–8 colors; all eight patterns; pixel size, colors, scale, wave speed/frequency/amplitude, contrast, brightness; mouse erase/reveal/ripple, radius, strength, trail, interaction toggle; click ripple; intro; disable animation. Added transparent background and render detail. Shader uses app time, freeze/reduced-motion handling and device pointer input. No new dependencies or infrastructure changes.

Each control retains per-mode Undo/Apply. Preset Undo restores the complete prior Dither configuration, including manual values; preset Apply saves the complete preset. Apply on a Dither control also records an explicitly selected Dither finish, without saving unrelated drafts. Custom palette controls are hidden until Custom is selected; controls that palettes/toggles supersede are disabled.

Verification: 35 private tests pass, hosted build/artifact/routes/API authorization/revision/persistence checks pass. Browser inspected original Cloud, Classic Dither, Blueprint and Ice/halftone, no Dither fallback messages; preset Undo restored Bayer and no palette; switching to WORK retained default Bayer and returning to LIVE retained its halftone. Physical iPhone rendering/performance remains unverified. Existing cloud design was not overwritten with preview experiments.

## Dither randomizer and saved-design startup gate — 2026-11-02

Published Sites version 17, source d66b766d799568a820dce2bd3ac1efd7be2441e4. Dither now has Randomize Dither / Undo randomize / Apply Dither look. Randomization previews a coordinated named palette, pattern, pixel size, wave parameters and cursor settings in the selected mode. It keeps eyes, other modes, render detail and interaction/animation toggles unchanged. Per-mode snapshot stacks restore the complete prior Dither look in one step. No writes occur until Apply; group Apply saves only this mode's Dither configuration plus its selected finish. Preset displays Custom for a randomized look.

Owner reported factory-design flash on reload. Cause: animation started before the asynchronous saved-design read. Initial HTML now contains a design-pending gate; device children stay invisible on a black surface. The animation loop skips painting until saved settings are accepted, then removes the gate only after rendering the first configured frame. Network reads precede the validated confirmed cache; no factory-default fallback is displayed when neither can load. An error leaves the device black and saving disabled. Mode/discard preview actions cannot bypass the pending load. Added a twelve-second network timeout and a QA-only delayed-read option on the loopback preview helper.

Verification: 38 tests passed, covering randomized bounds/variation, mode isolation, restore, group Apply, waiting for network before cache, and rejecting absent saved designs. Hosted build/artifact/routes/API authorization/persistence checks passed. Browser with a two-second design-read delay observed canvas visibility hidden/design-pending true, then visible/pending false after load. Randomize produced Custom settings with Undo enabled; Undo restored Cloud. Public preferences were not changed by preview tests. Physical iPhone reload/performance remains unverified.

## Cloud randomizer and saved default restore — 2026-11-02

Published Sites version 18, source 3bdf3631aa446da11a8edc091b60c823c4b8da48. Color tab now offers Randomize Cloud, Undo Cloud randomize, Apply Cloud look and Return to Default. Cloud randomization varies a coordinated palette, saturation, soft shape, diffusion, stable texture, depth/light and subtle float/liquid values within restrained bounds. It preserves eyes, Dither settings, interaction toggles and the other modes; WORK keeps a light background and PLAY keeps a dark surface. Undo is an independent bounded stack for each mode. Group Apply saves only the selected mode's Cloud appearance and named colors; other drafts remain pending.

Owner requested returning to the previously liked design from the last update. Captured confirmed public design revision 101 before Cloud randomization was published, forced Cloud as the finish per mode and retained the owner's other confirmed design values. This is character/cloud-default-design.json, served as a public design-only asset. Return to Default previews that saved restore point for the selected mode, including eyes and motion, and changes Apply Cloud look to Apply default so the complete selected profile is saved. Discard changes cancels the preview. It does not restore the first-draft factory design or change STUDIO auto-follow/global service settings. The saved restore point is fixed and not replaced by later randomizations.

Verification: 41 private tests pass for bounded randomization, mode isolation, exact Undo values, group Apply isolation and the saved default profile including eyes. Hosted build/artifact/routes/API checks pass. Browser Randomize Cloud changed its color and enabled Undo; Return to Default restored the revision-101 blue Cloud finish and displayed the save/cancel instruction. Preview tests did not overwrite the user's cloud settings. No hardware/performance claim is made.

## Tap-controlled persistent UI and Sleep alarm time — 2026-11-03

Published Sites version 19, source 6645ecb51076806f837a9a86a2e95225e1f28ad5. Page changes now retain the current controls-visible state rather than revealing the UI. Removed the swipe-end reveal call and the automatic hide timer. Tap/Enter opens or closes the UI; open UI persists through page navigation, and hidden UI keeps full-body presentation. Editor mode selection follows the same behavior. Simulated notifications no longer open a hidden UI automatically; existing long-press expression behavior remains. The legacy menuSeconds value is still accepted for old saved designs, but its obsolete editor control is hidden.

Added a SLEEP alarm-time panel shown only with the page UI. Default 7:00 AM, configurable under Customize / Alarm with hour, minute and explicit AM/PM, each retaining Undo/Apply. This is a stored time preview only, not an armed/ringing alarm, notification permission request, background timer or automation. Alarm fields are shared for the single Sleep clock and excluded from Cloud default/reset appearance fields.

Verification: 43 private tests and hosted build/artifact/routes/API checks passed. Browser navigated LIVE/WORK/PLAY/SLEEP using the device keyboard path and observed UI hidden until activation; actual click opened UI and navigation retained it, including after more than the previous menu timeout. Sleep panel hid in full-body view and showed 7:00 AM after activation. Local editor PM selection updated the preview to 7:00 PM without saving test settings. Native drag automation triggered the existing long-press behavior, so no physical swipe timing claim is made; navigation gesture handlers were inspected and existing engine swipe tests passed. Before/after public design revision 102 and WORK projection hash matched; its saved finish remained Dither. No user's cloud design was written during these checks. Physical iPhone behavior/performance remains unverified.

## Favorites and editor navigation — 2026-11-03

Published Sites version 20, source 7581e556128a44a8231bf329954a31081e144a13,
deployment appgdep_6ae96d1ecb00819190445efbb2318e30 (succeeded).
Favorites stores up to 30 named looks and small JPEG previews in an independent,
owner-only revision/ETag checked R2 collection. Save does not activate; Preview,
Undo favorite preview and Apply favorite to explicitly checked pages are separate.
Transfers eyes, colors, shape, finish and visual motion, preserving other pages,
alarms, sensors and STUDIO behavior. The editor now shows only the selected page's
colors, all feature tabs remain visible, Dither edits activate the preview, saved
state disables unnecessary saves, and mobile preview/menu no longer overlap.
Existing approved character rendering and saved preferences were preserved.

Verified five focused model tests, favorites API authorization/CSRF/validation/
revision/persistence/removal, existing design and relay API checks, build/routes.
Isolated synthetic browser tested save with thumbnail, reload, WORK-only Apply,
unrelated draft retention, preview undo and no-target guard. Layouts inspected at
390, 820 and desktop. Screenshot: docs/previews/favorites-editor.jpg (test look).
No production test preference writes, model calls or infrastructure changes.
Physical iPhone and multiple live signed-in owner devices remain unverified.

## Reference-style Dither editor and reliable Undo — 2026-11-03

Published Sites version 21, source 378ba599ce2485f4638404c1693e22534c393075;
deployment appgdep_6ae9e3fb09c88191b3f4cfe33cd8e410 succeeded. Implemented the
owner's supplied full Presets / Customize format, compact range/numeric controls,
full HSV picker with hue/hex/swatches/recents and feature-detected screen eyedropper.
Active palette endpoints replace misleading ignored Wave Color/Background values.
Editing a named spectrum retains its shades before converting to Custom; Colors
resizes the actual palette. Per-mode Reset/Undo/Redo restores complete Dither
snapshots; one pointer drag records one undo step. Generic native color picker
sessions also coalesce changes. Fixed false unsaved state after Apply by comparing
canonical design values rather than JSON field insertion order.

Ten focused model/HSV/per-mode/save regression tests and existing hosted design,
favorites and relay API authorization checks passed. Browser verified endpoint
matching, hex editing with palette seeding, one-drag Undo and Redo, Apply/reload
with All changes saved disabled, 4→6-shade editing and Undo back to 4, and 390px
layout without horizontal overflow. Saved dither-picker.jpg and dither-controls.jpg
in docs/previews. Browser experiments used only a loopback synthetic owner/bucket;
no production settings were written and the owner's existing browser drafts were
left untouched. Physical iPhone touch and native eyedropper execution unverified.

## Unified parameter UI, individual actions and dark selects — 2026-11-03

Published Sites version 22, source 54ef60d7849c8aef01822a4192d5b3634c3c6bf5;
deployment appgdep_6ae9e873086c81918992c4b46edca955 succeeded. Reused the compact
Dither panel and full HSV picker for Color, Face, Shape, Light, Interaction and
Alarm in every mode. Each group has Reset/Undo/Redo/Apply; every parameter has
individual Undo/Apply. Group saves affect only their category and page; individual
saves preserve unrelated drafts. Palette dependencies remain atomic, and undoing
one shade preserves later shade changes. Alarm is still shared. Select controls
and options declare black backgrounds, white text and dark color-scheme.

Fixed redundant inherited-value overrides causing false pending state after Undo.
Eleven focused model/per-mode/palette/Undo/save tests and existing hosted API auth,
design/favorites/relay checks passed. Browser traversed all 28 mode/category views,
verified individual Face and Dither Undo, category Apply, page isolation, shared
color picker saving and clearing dirty state. 390px preview has no horizontal
overflow; screenshot docs/previews/parameter-panels-mobile.jpg. All browser writes
used a synthetic loopback owner/bucket. Production preferences and existing drafts
were preserved. Physical phone and OS-specific native popup styling unverified.

## Pale mobile background bands — 2026-11-03

Published Sites version 23, source 1b1108ee0eeeed861cac9c2b199bd1877da99c9c;
deployment appgdep_6ae9ea015828819191bd9de1187d42c2 succeeded. Removed the separate
low-alpha canvas-wide halo drawn inside the moving mascot transform. Its gradient
bands and transformed rectangle became visible above the mascot on pale surfaces.
Kept the flat page color, material mask, texture, depth lighting and character
movement. No saved design, control, permission or infrastructure change.

One focused browser comparison used the same 390px WORK scene in the synthetic
loopback fixture. Blank-region RGB ranges changed from 4/3/2 before to 0/0/0 after,
and the affected background is visibly flat. Saved mobile-lines-before.jpg and
mobile-lines-fixed.jpg in docs/previews. Worker build/artifact validation passed.
Physical iPhone display/compositing remains unverified.

## Favicon refresh — 2026-11-03

Published Sites version 24, source f9ecfb343010637888ac13bb9cafb9951b09041a;
deployment appgdep_6ae9ecca39b88191b3c8e92fe7d680be succeeded. Updated the tab icon
with the existing teal cloud silhouette/palette and ASCII eyes. Editable source:
simulator/icons/mascot-favicon-v2.svg. Browser-rendered PNG exports at 32/192px and
an ICO fallback are retained. HTML uses new SVG/32px filenames and /favicon.ico
serves the same new icon. Original Apple touch and installed-app icons preserved.

Inspected vector preview and exported PNG, verified dimensions and hosted Worker
asset/root fallback/page-link checks. Direct browser download waiting timed out;
recovered by saving the export page's generated PNG data links without installing
any dependency. All design/account settings and existing drafts were untouched.

## Non-blocking mobile editor and app interaction audit — 2026-11-03

Published Sites version 25, source c58c93e83c632df78b99b8cc01c99485cae1edbc;
deployment appgdep_6ae9f181c9d081918f876beaf5d8e2d7 succeeded. Removed sticky
bottom save overlay: pending Save/Discard lives only in normal flow at the end,
and disappears when clean. Parameter actions report Saving/Saved/Retry inline;
failed saves retain values and show a local error. Kept per-field Undo/Apply and
section controls. Raised mobile editable text to 16px, enlarged tap targets and
allowed vertical scrolling through the editor preview. Hex Undo groups one edit;
recents record completed colors, not intermediate inputs. Only the active editor
panel updates during drags. Favorites requires a checked destination. App menu and
Customize targets are larger and separated from panels; menu taps no longer toggle
body gestures or request sensors. Saved artwork/design data is unchanged.

One focused synthetic browser review covered the exact reported Face/picker flow
at 390×700 with no save overlay, pending footer below content, local Saved state,
a deliberate save failure plus successful Retry with no lost value, draft retention
across tabs and section Apply isolation, one-step hex Undo/clean recents, Favorites
zero-target guards and app mode navigation retaining its menu. Measured 40px mode
buttons and no Customize/nav/content overlap. Syntax and built Worker validation
passed. Preview: docs/previews/mobile-ux-clear-controls.jpg. All test writes used
the disposable loopback owner/bucket; no production preferences or existing user
drafts changed. Physical Safari keyboard/sensors and hardware touch unverified.

## 2026-11-03 — Dither app background
Added App background to the selected mode in Dither using the shared picker and per-row Undo/Apply. Renamed texture Background to Effect background. Group Undo/Redo, Reset and Apply Dither look include the selected page background while preserving other pages and unrelated drafts. Six focused parameter-panel regressions passed; browser checks confirmed group Undo/Redo, individual Undo/Apply, matching Color control, separate LIVE/WORK values and reload persistence. Worker build/artifact validation passed. Published version 26, source b94cbbb39c1aad25cb396de0ee3ab9401940962a, deployment appgdep_6aea6e3287a08191aff4d0a2be85b2ae. Preview: docs/previews/dither-app-background.jpg. Synthetic test settings only; physical phone unverified.
