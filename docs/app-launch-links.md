# App menu and native app links — 2026-11-04

Published Sites version 29 at https://studio-mascot.jesse-ech.chatgpt.site/app.
Source: e8a0e0a285f377bce8d8beba9a025b2fbc6402e2.
Deployment: appgdep_6aeb3fcd530c8191b33ee4bb65c5de21 (succeeded).

Navigation returns near the previous 16% vertical position and info near 25%,
using fixed minimum gaps to separate header, Customize, buttons and content.
Tapping WORK/SURF/SLEEP information opens its linked app. LIVE has no action.
No eye/mascot renderer, artwork or saved appearance changes.

## iPhone setup

First tap opens instructions. Create these shortcuts on the phone:

- Studio Work: Open App -> ChatGPT. Use ChatGPT's Open Remote action instead
  when available to enter Codex directly.
- Studio Surf: Open App -> Windy.app.
- Studio Sleep: Open App -> Clock.

Return and choose Shortcut is ready. Later taps run the named shortcut using
Apple's supported shortcuts://run-shortcut?name= scheme. App setup reopens help.
Only the readiness preference is stored locally; no phone/account credentials.
Marking ready records the user's setup confirmation, not a verified data link.

Desktop WORK uses codex://, Windows SLEEP uses ms-clock:, SURF uses windy.app's
website. macOS Clock uses the named shortcut. Unsupported Clock platforms show
an explanation rather than pretending to open an app.

## Data and limitations

WORK retains the existing read-only STUDIO relay, polls every five seconds,
checks report freshness and shows its timestamp. It reports the computer's
activity, not private mobile-app contents.

SURF was failing because the hosted Worker does not implement /api/surf. It now
falls back to the already bundled browser weather reader. Model source remains
Open-Meteo with NOAA tides; Windy account, favorites and saved spots are not
connected. Visible checks occur every 15 seconds and on focus/return, respecting
the 10-minute source cache and a one-minute failure backoff.

App time uses the device clock instead of simulated noon. SLEEP shows local time
and labels the configured reminder as not synced with phone alarms. A website
launching Clock does not grant access to its alarms; a supported native bridge or
explicit Shortcuts data-sharing flow remains required for that separate feature.

## Verification

Worker ESM build/artifact check, route isolation/import availability, iPhone
setup gate and supported-platform destination checks passed. A real provider
read returned all three forecast locations. Focused test is in the hosted source:
scripts/test-app-launch.mjs. No production preferences were changed.

Local browser use is disabled in Work settings, so no visual browser check or
physical iPhone app-launch test was possible. Do not claim device verification.

## Official references

- https://support.apple.com/en-ie/guide/shortcuts/apd624386f42/ios
- https://developers.openai.com/blog/mastering-codex-remote-for-engineering
- https://developer.apple.com/documentation/alarmkit/alarmmanager/alarms
