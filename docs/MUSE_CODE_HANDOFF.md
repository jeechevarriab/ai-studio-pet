# Studio Mascot — MUSE Code handoff

Prepared 2026-11-02. Read this alongside AGENTS.md. This is a project handoff,
not permission to change AI STUDIO infrastructure or activate a sixth agent.

## Open this existing project

Repository: https://github.com/jeechevarriab/ai-studio-pet (private).
Development branch: design/mascot-v2. Preserve mascot-v1.
Local Windows checkout:
`C:/Users/Chapito/Desktop/AI STUDIO/Codex Source Folders/AI STUDIO PET/ai-studio-pet`.

Run `muse` from that directory after installing/signing in through the official
MUSE Code setup. Read the existing AGENTS.md; do not overwrite it with muse init
--force. No API token or password belongs in the prompt or repository.

## First reading order

1. AGENTS.md — boundaries and approved design.
2. docs/phase-1-brief.md — original brief; subsequent owner decisions below supersede older scope.
3. This handoff and the latest dated entries in docs/progress.md.
4. docs/architecture.md and docs/customization-and-studio.md — current hosted editor/status architecture.
5. docs/app-launch.md, docs/play-forecasts.md, firmware/README.md.
6. third-party/react-bits/README.md and LICENSE.md.

README and older architecture/progress paragraphs describe earlier simulated-only
milestones. The current hosted app has owner-only cloud design persistence and an
owner-authorized metadata-only STUDIO relay. Do not treat those older paragraphs
as instructions to remove working features or recreate completed work.

## Two source trees

`ai-studio-pet/` contains the vanilla HTML/CSS/JavaScript/Canvas simulator,
character data, original brief and project documents, tests, relay source, and
pinned SDK submodule reference. It is the private GitHub project above.

Sibling `mascot-public-site/` contains the deployed app's allowlisted source copy,
Worker API, storage/auth implementation, build and API tests. It is a separate
Sites-managed source repository; pushing the private GitHub branch does not
publish the website. The portable handoff ZIP includes both tracked source trees.
Git metadata, credentials, ignored runtime files and SDK submodule contents are
not included in that ZIP.

Keep common simulator files synchronized deliberately. The hosted app.js has a
browser-side surf-reader adaptation; do not blindly replace that file with the
local copy. Hosted builds embed only allowlisted public assets.

## Current delivered behavior

Live app: https://studio-mascot.jesse-ech.chatgpt.site/app
Owner editor: https://studio-mascot.jesse-ech.chatgpt.site/customize
Latest published Sites version: 18.
Hosted source commit: 3bdf3631aa446da11a8edc091b60c823c4b8da48.

- 410 x 502 mascot with LIVE / WORK / PLAY / SLEEP; AM/PM time.
- Mascot-only at rest; touch reveals controls/messages at top and zoomed eyes below.
- Soft liquid blob, no mouth, ASCII eyes, tilt gaze and pickup greeting.
- Only Cloud Original and actual two-pass React Bits Dither finishes remain.
- Separate validated mode profiles; per-setting Undo/Apply, group randomizers,
  Cloud and Dither Undo/Apply, and fixed Return to Default.
- Return to Default uses character/cloud-default-design.json, confirmed design
  revision 101 captured before Cloud randomization, not factory defaults.
- Randomization is preview-only until Apply; preserve unrelated drafts and other modes.
- Startup remains black until the saved design is loaded and its first frame is drawn.
  Prefer network data; use only validated confirmed cache after network failure.
- Owner sign-in required for writes. Preserve CSRF, revision conflict and owner checks.
- PLAY uses the documented Open-Meteo/NOAA sources, provenance and labeled energy estimate.
- STUDIO status relay sends only five allowlisted role/status/phase/timestamp records.
  Never send prompts, task text, conversations, tools, files or credentials.

## Local checks

In ai-studio-pet:

```powershell
node tools/check.mjs
node --test test/*.test.mjs
node tools/serve.mjs
```

The server is loopback-only at http://127.0.0.1:4173/. `/app` is app-only.
Local `/customize` redirects to the live owner-authenticated editor.
The last completed private suite passed 41 tests.

In mascot-public-site:

```powershell
node scripts/build.mjs
node scripts/validate-artifact.mjs
node scripts/check-site.mjs
node scripts/test-api.mjs
```

These checks use fake storage/identities locally, not production credentials.
After building, ai-studio-pet/tools/preview-built-site.mjs serves a read-only
loopback QA copy on port 4174. `--delay-design` tests the startup gate.
The latest hosted checks passed. Re-run in the destination environment.

## Hosting and sensitive configuration

Sites supplies the trusted owner identity and R2 BUCKET. Runtime environment
variables include MASCOT_OWNER_EMAIL and MASCOT_RELAY_KEY, but their values are
not in this handoff. Never copy local relay configuration or mint broad keys.
Gateway runtime settings under gateway/.local are intentionally excluded.

Retain .openai/hosting.json's existing Site identity. Do not create another Site,
make the private project public, weaken owner saving, or assume MUSE Code has
the publishing tools available in Codex. Prepare and validate source changes;
the owner can bring them back to the established Sites publishing workflow.

## Firmware and unfinished work

Target: Waveshare ESP32-S3-Touch-AMOLED-2.06 (410 x 502).
SDK submodule commit: 1b894f551e64416e2844452ec6056ec56d6a10f1.
After a Git clone, initialize the SDK only if firmware work is needed:
`git submodule update --init firmware/muse-gadget-sdk`.

Firmware compilation, toolchain/dependency reproducibility, hardware touch,
memory/performance/power, and physical iPhone testing are not completed.
The Canvas/WebGL app is not ESP-IDF firmware. Firmware porting requires a scoped
task and reviewed toolchain/hardware steps; do not flash or pair a gadget here.
A persistent sixth specialist and enforced permission isolation remain separate
unfinished configuration work. AGENTS.md is guidance, not an OS permission boundary.

## First MUSE task

Inspect these two source trees, read the project rules, run the applicable local
checks, and report the architecture, current verified behavior and remaining
limitations. Preserve the approved design and existing five agents. Then take
the owner's next specific development task. Do not install software, change
permissions/network exposure/startup tasks/core services, publish, or flash hardware
as part of merely opening this handoff.

Official setup: https://dev.meta.ai/docs/muse-code
Project instructions: https://dev.meta.ai/docs/muse-code/configuration
