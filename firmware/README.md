# Muse firmware source baseline

The SDK is an unmodified Git submodule pinned to `1b894f551e64416e2844452ec6056ec56d6a10f1`. Source files, license notices and board overlays stay upstream. Our simulator does not load its code or avatar artwork. See upstream-lock.json and docs/research.md.

Initialize an existing clone with `git submodule update --init`. Check the source pin with `node tools/firmware-check.mjs` from the project root. This is a source preflight, not a compiler or hardware test.

## Version discrepancy

The pinned ESP32 README, AGENTS.md and board helper require ESP-IDF 6.0.1. The exact board document reports hardware tests with 6.1. Dependency metadata has broader minimum constraints. This project selects 6.0.1 as the documented baseline and records the discrepancy; it does not assert a successful build on either version. LVGL is pinned upstream to 9.5.0 and the 2.06 BSP to 2.0.0. Other transitive dependencies use ranges and no resolved lock was produced. The source pin is reproducible; a fully reproducible binary baseline remains pending compilation and retained dependency/toolchain metadata.

## Build preparation on Windows

ESP-IDF is not available in the current shell; CMake/Ninja were not found on PATH. No toolchain was installed and no firmware binary has been produced. Use Espressif's official Windows installation instructions to establish a dedicated 6.0.1 environment after the owner approves installation. Keep this separate from AI STUDIO services and global agent permissions. The upstream bash helper is documented for Linux/macOS, not verified native Windows.

In an activated ESP-IDF PowerShell, the equivalent build command is proposed below. It has not been executed here. From `firmware/muse-gadget-sdk/esp32`:

```powershell
idf.py -B build-ai-studio-pet -DIDF_TARGET=esp32s3 `
  -DSDKCONFIG=build-ai-studio-pet/sdkconfig `
  '-DSDKCONFIG_DEFAULTS=sdkconfig.defaults;devices/sdkconfig.muse;devices/sdkconfig.muse-waveshare-s3-206' build
```

Review the generated configuration and upstream warnings; this command has no flash operation. A pairing build eventually needs the owner's personal SDK token. Do not request, copy, print or commit that token during simulator development. The browser simulator needs no token.

The baseline upstream board configuration includes network/tunnel/OTA capabilities. No such firmware is flashed or executed here; retaining source does not approve deployment of those capabilities. Define a minimal offline/custom-avatar configuration and review it before hardware deployment. Back up factory flash before a separately authorized first flash, and recheck actual board revision, flash and PSRAM rather than relying solely on documents.

No ESP32 hardware, touch, audio, pairing, power, timing, memory or firmware tests have been performed by this project. Upstream host tests and SDL simulator have not been run; they require additional tools/dependencies. Do not present the browser tests as firmware tests.
