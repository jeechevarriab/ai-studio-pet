# Project architecture and boundaries

## Confirmed project direction

The owner's Phase 1 brief defines a vanilla HTML/CSS/JavaScript/Canvas simulator at 410 × 502 with LIVE, WORK, SURF and SLEEP modes. Structured expression definitions should later be implemented by a separate ESP-IDF/C renderer. Browser code is not firmware.

Implemented folders: simulator/ (browser app), character/ (expressions), scenes/ (behavior priorities), firmware/ (pinned source and notes), gateway/ (proposal only), tools/ (loopback server and checks), test/. First milestone expressions: Idle, Happy, Focused and Sleeping; the full expression list remains in the original brief.

## Studio boundary

PET is a separate project, not an additional running worker. The existing hub has five fixed identities across team configuration, skill retrieval, native registration and knowledge publishing. Do not add a sixth mapping alone: the native link rejects identities outside the fixed list.

Existing /api/state contains broader task/conversation data and must not be passed wholesale to PET or hardware. A future companion gateway should return only an authenticated, read-only, allowlisted status shape; no task text, file paths, conversation contents or secrets. Begin with synthetic events. This gateway is a proposal, not an installed service.

No shared knowledge has been imported. Existing project-scoped knowledge cannot be cross-agent shared under the current service policy. General/application records require explicit permitted sharing, compatible tool versions and retained provenance. Active status alone does not grant PET access.

## Technical evidence and pending work

Muse source is pinned to 1b894f551e64416e2844452ec6056ec56d6a10f1. Relevant official source and documentation were reviewed; see research.md. The main guide specifies ESP-IDF 6.0.1; board notes cite 6.1 testing. Upstream declares LVGL 9.5.0 and the exact s3-206 board overlay. Compilation, transitive dependency locking and all hardware measurements remain pending. The browser renderer uses none of the upstream avatar assets or runtime components.

## Browser runtime

The app fetches only local character and behavior JSON. engine.js selects scenes/expressions with configurable priorities; renderer.js draws original procedural geometry; app.js owns controls, a clamped animation clock and pointer/keyboard navigation. The scene moves across a 410 × 502 framebuffer during navigation. HTML status labels and controls remain outside that render pipeline for accessibility. Visual parity with future firmware remains a development goal rather than a verified equivalence.
