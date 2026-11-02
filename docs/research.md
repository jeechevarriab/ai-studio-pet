# Source review — 2 November 2026

## Tutorial and linked resources

The owner supplied [Erik Taveras's tutorial](https://comunidad.eriktaveras.com/resources/tamagotchi-meta-muse-gadgets/). Its public article was read in full. It is a secondary orientation guide, not the authority for version compatibility or permission changes. The current official repository has more board profiles than the tutorial's table. The tutorial's instructions to disable restrictions or pipe an installer into a shell were not executed.

| Resource | Review and use |
| --- | --- |
| [Official Muse SDK](https://github.com/facebookincubator/muse-gadget-sdk) | Cloned as a pinned submodule; inspected root README/license, ESP32 README and relevant AGENTS sections, board profile/overlay, helper, CMake and dependency declarations. |
| [Muse Gadgets site](https://gadgets.muse.ai/) | Read public overview; no sign-in, account changes or token creation. |
| [SDK token page](https://gadgets.muse.ai/settings/sdk-tokens) | Read public guidance only; token not needed for browser simulation. |
| [SDK token terms](https://gadgets.muse.ai/sdk-terms) | Read current terms as a separate service-access condition; not accepted and no token requested. Code licensing and service access are distinct. |
| [ESP-IDF Windows 6.0.1](https://docs.espressif.com/projects/esp-idf/en/v6.0.1/esp32s3/get-started/windows-setup.html) | Read official Windows installation instructions. Installation remains pending owner approval. |
| [Muse Code](https://developer.meta.com/ai/lp/muse-code/) | Referenced by tutorial; not installed or required for our vanilla browser simulator. Not reviewed as an alternative agent. |
| Amazon affiliate board link | Not used. The owner already selected a specific Waveshare board. No purchase or recommendation made. |
| Community Discord | Not joined or used as technical evidence; no messages sent. |
| Linux/Raspberry Pi path | Tutorial reviewed as context only; no Linux daemon or remote command integration installed. |

This is a relevant-source review, not a claim to have read every file in the SDK, every linked vendor archive, forum thread or community resource.

## Primary technical evidence

- Source commit: `1b894f551e64416e2844452ec6056ec56d6a10f1`, dated 2026-10-30 in upstream Git. Exact gitlink and firmware/upstream-lock.json retain this selection.
- [Pinned ESP32 README](https://github.com/facebookincubator/muse-gadget-sdk/blob/1b894f551e64416e2844452ec6056ec56d6a10f1/esp32/README.md) and [AGENTS.md](https://github.com/facebookincubator/muse-gadget-sdk/blob/1b894f551e64416e2844452ec6056ec56d6a10f1/esp32/AGENTS.md): documented ESP-IDF 6.0.1 baseline; architecture divides Link/network transport from display/UI.
- [Exact S3 2.06 board profile](https://github.com/facebookincubator/muse-gadget-sdk/blob/1b894f551e64416e2844452ec6056ec56d6a10f1/esp32/devices/waveshare-s3-206.md): 410 × 502 panel, `s3-206` alias, `esp32s3` target, PSRAM and board-specific overlay. Its hardware report uses ESP-IDF 6.1, which differs from the main guide. All hardware findings are upstream reports, not this project's measurements.
- [Dependency declarations](https://github.com/facebookincubator/muse-gadget-sdk/blob/1b894f551e64416e2844452ec6056ec56d6a10f1/esp32/components/muse/idf_component.yml): LVGL 9.5.0 and waveshare/esp32_s3_touch_amoled_2_06 2.0.0. Broad IDF minima here do not establish tested application compatibility.
- [Vendor repository](https://github.com/waveshareteam/ESP32-S3-Touch-AMOLED-2.06): confirms product identity and display dimensions. Vendor wiki returned HTTP 403; no schematic/pin-level audit was performed because no hardware adaptation was made.
- [Upstream licensing](https://github.com/facebookincubator/muse-gadget-sdk/blob/1b894f551e64416e2844452ec6056ec56d6a10f1/README.md): Apache-2.0 SDK with separately noted third-party components; Jollybot avatar excluded from that license. No Meta mascot artwork is loaded or copied into the custom simulator. All upstream notices remain intact in the submodule.

## Project choices and limits

The custom character is an original procedural rounded body, gradient, halftone and binary dot eyes. All four implemented expressions use small declarative matrices, geometry and timing; a C/LVGL renderer must still be written. The upstream native SDL simulator targets a different reference display and is not the requested Windows browser simulator.

No live surf/weather/agent API, voice service, firmware flashing, home-network tunnel or real studio task dispatch is connected. No third-party software was installed. No hardware-independent browser result establishes ESP32 performance or memory feasibility.
