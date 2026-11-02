# Progress — 2026-11-02

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
