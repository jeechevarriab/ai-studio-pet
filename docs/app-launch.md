# Studio Mascot app launch

## Public iPhone link (owner approved 2026-11-02)

https://studio-mascot.jesse-ech.chatgpt.site

Published with Sites as a separate allowlisted app copy. Site ID:
appgprj_6ae8a58aa97481919638d5a4382c9127. Deployment version 18;
source commit 3bdf3631aa446da11a8edc091b60c823c4b8da48 in its separate
Sites source repository. Working copy: sibling mascot-public-site folder.
It exposes no desktop service or private repo. Public PLAY uses browser-side
reads to the three fixed Open-Meteo/NOAA endpoints because the host's marine
request was rejected. It retains the existing model labels and energy estimate.

Open in iPhone Safari, Share → Add to Home Screen → Open as Web App (if offered)
→ Add. Physical iPhone installation and motion sensors remain untested here.
The local link below continues to be the development preview.

Launch http://127.0.0.1:4173/app on the Windows computer running `node tools/serve.mjs`.
The app-only route has a black surround, a centered responsive 410 × 502 device,
and no outer playground. Tap the device to use the existing menus and gestures.
The original playground and V1 comparison remain at `/` and `/?mascot=v1`.

In Chrome, use More → Cast, save and share → Install page as app. A standalone
manifest, SVG favicon, 192/512 PNG icons and Apple touch icon are supplied.
Installation itself was not performed; Chrome and OS control the install UI.

The service worker caches only the app shell after the app page is opened online.
It uses network-first reads with an offline shell fallback and never caches the
surf API. Offline forecasts are unavailable. Offline relaunch has not been
end-to-end verified. No server auto-start or Windows startup task was added.

This is a loopback link for this computer, not a hosted phone link. Remote or
phone access requires a separately approved deployment/network plan. No core
AI STUDIO service, firewall, permissions, tunnel or public exposure was changed.

Verified 2026-11-02: 16 Node tests, syntax/data validation, private-route/Host
restrictions, manifest/icon routes and PNG dimensions. Chrome desktop and
390 × 844 viewport checked: black surround, no playground, device centered,
no horizontal overflow; touch-style click reveals menu and WORK switches.
No app-origin console error was observed; browser extension warnings were present.
