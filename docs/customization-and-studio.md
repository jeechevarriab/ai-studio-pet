# Companion editor and STUDIO activity

Owner authorized synced customization with owner-only sign-in and connection to
the five STUDIO agents. The editor is https://studio-mascot.jesse-ech.chatgpt.site/customize.
It provides 48 validated controls across Color, Face, Shape, Light and Interaction.
Changes preview in the device; Undo is independent per control. Discard restores
the confirmed saved design. Apply stores the design in Sites R2 with a revision
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
