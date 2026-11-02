# AI STUDIO PET — PHASE 1: PROJECT FOUNDATION & WEB SIMULATOR

You are the lead developer for AI STUDIO PET, a physical AI Tamagotchi companion built around the Waveshare ESP32-S3-Touch-AMOLED-2.06 (410 × 502 AMOLED).

## Project repository

https://github.com/jeechevarriab/ai-studio-pet

Official Meta Muse SDK:
https://github.com/facebookincubator/muse-gadget-sdk

Reference tutorial:
https://comunidad.eriktaveras.com/resources/tamagotchi-meta-muse-gadgets/

## Objective

Establish a clean, version-controlled foundation and develop a browser-based simulator while we wait for the physical ESP32 to arrive.

The simulator must closely represent the future hardware experience.

**Preserve all existing AI STUDIO agents, conversations, configurations, dashboard, and infrastructure. This is a separate project.**

## Step 1 — Inspect and initialize

1. Verify the current repository and Git authentication.
2. Inspect the repository before making changes.
3. Read the official Muse SDK documentation, licensing, architecture, and Waveshare `s3-206` board configuration.
4. Record the exact Muse upstream commit and required ESP-IDF version.
5. Establish a reproducible Muse firmware baseline without modifying upstream code unnecessarily.
6. Create an appropriate `.gitignore`, README, and development structure.
7. Preserve all existing repository contents.
8. Never commit credentials, Wi-Fi passwords, tokens, or generated secrets.

## Step 2 — Browser simulator

Develop a local web simulator with:

- Native design resolution: 410 × 502.
- Responsive preview of the physical touchscreen.
- Vanilla JavaScript, HTML, CSS, and Canvas.
- Smooth horizontal swipe navigation.
- Four screens: LIVE, WORK, SURF, SLEEP.
- Dark AMOLED-friendly visual design.
- Minimal UI and typography.
- Development controls outside the device preview.

Avoid introducing unnecessary frameworks or paid services.

## Step 3 — Custom character engine

Create a modular character system.

Visual direction:

- Premium minimalist Tamagotchi.
- Expressive dot-matrix eyes and facial expressions.
- Soft neon gradients.
- Subtle halftone textures.
- Geometric, code-generated shapes.
- Minimal decorative elements.
- No detailed illustrated environments.
- No generic emoji-style faces.
- No use of Meta's proprietary mascot artwork.

Support these initial expressions:

Idle, Happy, Excited, Focused, Thinking, Listening, Speaking, Sleepy, Sleeping, Sad, Concerned, Confused, Surprised, Surfing, Cozy, and Celebrating.

Expressions should be editable through structured data, with configurable colors, geometry, animation timing, and transitions.

Design the data format to support a future ESP-IDF/C renderer. Do not assume browser Canvas code can run unchanged on the ESP32.

## Step 4 — Living World simulator

Create simulated inputs for:

- Time of day.
- Weather and rainfall.
- Surf conditions.
- Agent status.
- Task success or failure.

LIVE mode should automatically select a character activity using a configurable behavior engine.

Initial activities:

- Working at a computer.
- Surfing.
- Sleeping or camping.
- Staying cozy during rain.

Use simple procedural visuals and reusable animation components, not video backgrounds.

## Step 5 — AI STUDIO preparation

Inspect AI STUDIO's existing status/event interfaces using read-only methods.

Design a separate companion gateway for:

- Manager
- IT
- Design
- Animation
- Web & Coding

Do not modify the existing AI STUDIO server or agent conversations.

Initially use simulated agent events. Real integration requires a separately tested, authenticated, read-only interface.

Do not expose network ports publicly or give the ESP32 direct shell access.

## Step 6 — Validation

Before committing:

- Run available tests and build checks.
- Test each mode and expression.
- Test horizontal navigation.
- Verify that simulated events update the character.
- Confirm the simulator works at 410 × 502.
- Check for JavaScript errors.
- Confirm no existing AI STUDIO files were modified.
- Document hardware-dependent functionality that cannot yet be tested.

## GitHub workflow

Use a development branch. Make focused commits with descriptive messages and push verified changes to:

jeechevarriab/ai-studio-pet

Never force-push or overwrite unrelated work.

## First milestone only

For this execution, focus on:

1. Repository foundation.
2. Official Muse SDK baseline and documentation.
3. A working browser simulator.
4. Basic swipe navigation.
5. One animated custom dot-matrix mascot with Idle, Happy, Focused, and Sleeping states.
6. Basic automated tests.

Do not implement live surf APIs, voice integration, or firmware flashing yet.

## Completion report

Return:

- Repository branch and commit hashes.
- Files created or modified.
- Exact Muse version used.
- Local simulator URL and startup commands.
- Screenshots or visual evidence.
- Tests passed and failed.
- Features implemented versus simulated.
- Any blockers.
- Recommended next milestone.

Begin by inspecting the repository and environment. Preserve the existing AI STUDIO installation and chats.