const CACHE = 'studio-mascot-shell-v3-eyes';
const SHELL = ['/app', '/simulator/style.css', '/simulator/app-view.js', '/simulator/app.js',
  '/simulator/engine.js', '/simulator/renderer.js', '/simulator/eye-motion.js',
  '/simulator/design.js', '/simulator/editor.js', '/simulator/dither-editor.js',
  '/simulator/studio.js', '/simulator/color-finishes.js', '/simulator/react-bits-shaders.js', '/character/expressions.json',
  '/scenes/behavior.json', '/manifest.webmanifest', '/icons/mascot.svg',
  '/icons/mascot-192.png', '/icons/mascot-512.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys =>
  Promise.all(keys.filter(key => key.startsWith('studio-mascot-shell-') && key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Never cache forecasts: offline mode must not present stale conditions as fresh.
  const asset = url.pathname === '/app/' ? '/app' : url.pathname;
  if (url.origin !== self.location.origin || event.request.method !== 'GET' || !SHELL.includes(asset)) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(asset)));
});
