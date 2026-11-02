# AI STUDIO PET

Local-first browser companion simulator and source foundation for PET Developer, AI STUDIO's proposed sixth on-demand specialist.

Owner brief: [Phase 1](docs/phase-1-brief.md). Current state: [progress](docs/progress.md).

The initial repository was empty when cloned on 2026-11-02. Phase 1 now includes a working buildless simulator and an unmodified, pinned Muse SDK submodule. The firmware has not been compiled. The persistent sixth-agent conversation and enforced permission boundary remain pending; the simulator does not require them and does not connect to the five production agents.

## Run on Windows

Open PowerShell in this repository, then run:

```powershell
node tools/serve.mjs
```

Open http://127.0.0.1:4173/ on the same PC. Stop with Ctrl+C. The server listens on loopback only and serves an explicit simulator-asset allowlist. No installation, API key, Muse token or package download is required for the browser app. Node 22+ is required. A new clone also needs `git submodule update --init` for firmware source checks, but not to run the browser.

## Use the playground

- Swipe left/right on the device, use arrow keys while it is focused, or select LIVE / WORK / SURF / SLEEP.
- Choose Auto for environment-driven behavior or override Idle, Happy, Focused or Sleeping.
- Change time, rain, wave conditions and one of the five simulated agent identities. Task complete/retry buttons set explicit simulated events; Clear removes them.
- Pause/resume movement, change animation speed or tune expression color, eye-dot size and float distance. Export saves editable JSON; restore edited definitions in character/expressions.json to load them on refresh. Reset discards in-session tuning.

Time and events do not automatically expire; controls remain deterministic for review. No real agent status, location, weather or surf data is read. Session changes are not persisted automatically.

## Checks

```powershell
node tools/check.mjs
node --test test/*.test.mjs
node tools/firmware-check.mjs
```

The firmware preflight checks source identity and tool availability, not compilation. See [firmware status and proposed build](firmware/README.md), [research](docs/research.md), [design system](docs/design-system.md) and [gateway proposal](gateway/README.md).

Target: Waveshare ESP32-S3-Touch-AMOLED-2.06, 410 × 502. Character data is portable JSON; the Canvas renderer must be reimplemented for ESP-IDF/C/LVGL. Physical touch, audio, memory, performance and power remain untested.
