# Companion editor and STUDIO activity

## Dither spectrum and Undo — 2026-11-03

The owner's supplied Presets / Customize and color-picker screenshots govern the
Dither layout. Six preset tiles sit above compact numeric sliders and toggles.
Wave Color and Background mirror the actual active palette endpoints. Click an
endpoint or any spectrum shade for the HSV plane, hue slider, hex entry, fixed and
recent swatches, copy and feature-detected screen eyedropper. Recent colors are
browser-local only. Named palettes convert to Custom by retaining their exact
shades before the selected edit. Colors controls the real palette length (2–8);
without a palette it controls scalar levels (2–16). Existing schema is retained.

Dither header Reset/Undo/Redo restores the full Dither state for this mode, without
altering eyes or other pages. A pointer drag records one history entry. Apply
Dither look still uses owner-only revision-protected saving. Canonical design
comparison prevents phantom pending edits when JSON field order changes. Generic
native color controls coalesce changes during one picker session for their Undo.

Ten focused tests passed for spectrum transfer, validation, Undo, exact HSV
roundtrips, successful-save equality and existing per-mode behavior. Existing
hosted auth/design/favorites checks and build passed. Isolated browser verified
Game Boy endpoint #9bbc0f, highlight edit preserving three shades, one-drag Undo,
Redo, Apply/reload, numeric shade growth 4→6→Undo 4 and 390px no overflow. See
docs/previews/dither-picker.jpg and dither-controls.jpg. No production test writes;
physical phone gestures and the browser's native eyedropper were not exercised.

## Favorites and editor navigation — 2026-11-03

Favorites saves the current page's complete appearance and a small canvas preview
to a separate owner-only revision-checked cloud collection (maximum 30). Saving a
favorite never activates it. Choose destination pages, then Preview or Apply
favorite. Preview has its own undo; Apply changes only the checked pages. It copies
eyes, colors, shape, finish and visual motion, not alarms, sensor/pickup settings,
menu behavior or STUDIO auto-follow. Other pending edits remain previews. Favorite
removal requires confirmation and does not alter active pages.

All eight feature tabs remain visible, with keyboard navigation. Colors/eye colors
are filtered to the selected page. Dither field edits also select Dither in preview.
The mobile preview no longer covers the menu; tablet uses the single-column layout.
Save messages stay next to the sticky save controls; unchanged saves disable.
Unsaved changes raise a leave warning and Open Mascot opens in another tab.

Five focused model tests and hosted API/auth/revision/route checks passed. Browser
QA used tools/preview-favorites.mjs, a disposable loopback-only synthetic owner and
in-memory bucket; it never reads or writes production preferences. Verified save,
thumbnail, reload, WORK-only Apply, unrelated draft retention, undo and empty-target
feedback; inspected 390/820/desktop layouts. Preview: docs/previews/favorites-editor.jpg.
Physical iPhone behavior and cross-device live owner sessions were not tested.

Owner authorized synced customization with owner-only sign-in and connection to
the five STUDIO agents. The editor is https://studio-mascot.jesse-ech.chatgpt.site/customize.
It provides 48 validated controls across Color, Face, Shape, Light and Interaction.
Changes preview in the device; Undo is independent per control.
Each control also has its own Apply button, which saves only that setting while
leaving other preview edits pending. The bottom Apply & Save button saves all
pending settings. Buttons are enabled only for the signed-in owner.
Discard restores the confirmed saved design. Apply stores the design in Sites R2 with a revision
check; another device's newer save cannot be silently overwritten. The app reads
the shared saved design on launch, return, and every 20 seconds while visible.
Confirmed settings may be cached locally for offline viewing, never auth tokens.

Sites supplies authenticated identity. A server-only configured owner email can
bootstrap one stable site-scoped owner ID; after that, only that ID can write.
Anonymous visitors can preview but cannot save. Same-origin write checks, bounded
input and strict setting validation apply. Live tests verified owner sign-in and
an unchanged-default cloud save (revision 1); anonymous and spoofed identity
requests were not authenticated. No new OAuth implementation or STUDIO account
credentials were copied.

The separate Windows relay reads the existing native-activity configuration,
registered mappings, five bounded activity records, and the fixed manager,
work-task and web-review status files. It also reads the public local health
endpoint. Its output contains only role IDs, fixed role names, enum states,
normalized progress phases and start/observation timestamps. No
task captions, prompts, conversation IDs, tool names, results, files or commands
are sent. Working records expire to unknown after two minutes; native completion
means a turn ended, not that deliverables passed QA. There are no reliable native
percentages: WORK shows live state, elapsed time and indeterminate progress.

Task progress phases are normalized to Waiting, Preparing, In progress or
Checking; arbitrary stage text is never published. Dashboard work is trusted
as active only while the local hub reports its worker and Codex connection live.
The relay posts outward to a dedicated HTTPS endpoint using its own scoped
write-only status key. The key is in the ignored gateway/.local/relay.json and
the Site's server-side secret settings. It cannot change design settings or
control STUDIO. No port, tunnel, hub change, dashboard change, agent identity,
startup task or firewall change was introduced. Reports expire after 30 seconds.
The app polls every five seconds and follows live activity when enabled. Manual
WORK navigation remains possible. Approval and unknown states are not
fabricated into percentages or completion claims.

The relay is running in this session. After restarting Windows, start it with
gateway/Start-Relay.ps1 (do not start a duplicate while it is already running).
Automatic Windows startup remains a separate approval, not an installed feature.
The helper's full location is C:/Users/Chapito/Desktop/AI STUDIO/Codex Source Folders/AI STUDIO PET/ai-studio-pet/gateway/Start-Relay.ps1.
If the PC/relay is unavailable, WORK clearly shows Connection paused.

WORK and PLAY stay in the readable menu/half-face pose until dismissed. Timer
expiration on other pages also synchronizes all panels to prevent a panel from
remaining over the quiet mascot after its header hides.

Verified: 24 local tests plus hosted API authorization/CSRF/revision/persistence/
relay checks. A live report had exactly five agents and the allowed fields.
Physical iPhone pickup/sensors, native watchOS installation and exact progress
percentages are not claimed.
