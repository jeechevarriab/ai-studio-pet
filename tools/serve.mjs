import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createSurfReader} from './surf.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const assets = new Map([
  ['/character/cloud-default-design.json', ['character/cloud-default-design.json', 'application/json']],
  ['/simulator/color-finishes.js', ['simulator/color-finishes.js', 'text/javascript']],
  ['/simulator/react-bits-shaders.js', ['simulator/react-bits-shaders.js', 'text/javascript']],
  ['/third-party/react-bits/LICENSE.md', ['third-party/react-bits/LICENSE.md', 'text/plain']],
  ['/', ['simulator/index.html', 'text/html']],
  ['/app', ['simulator/index.html', 'text/html']],
  ['/app/', ['simulator/index.html', 'text/html']],
  ['/customize', ['simulator/index.html', 'text/html']],
  ['/simulator/design.js', ['simulator/design.js', 'text/javascript']],
  ['/simulator/editor.js', ['simulator/editor.js', 'text/javascript']],
  ['/simulator/dither-editor.js', ['simulator/dither-editor.js', 'text/javascript']],
  ['/simulator/editor.css', ['simulator/editor.css', 'text/css']],
  ['/simulator/studio.js', ['simulator/studio.js', 'text/javascript']],
  ['/manifest.webmanifest', ['simulator/manifest.webmanifest', 'application/manifest+json']],
  ['/sw.js', ['simulator/sw.js', 'text/javascript']],
  ['/simulator/app-view.js', ['simulator/app-view.js', 'text/javascript']],
  ['/icons/mascot.svg', ['simulator/icons/mascot.svg', 'image/svg+xml']],
  ['/icons/mascot-favicon-v2.svg', ['simulator/icons/mascot-favicon-v2.svg', 'image/svg+xml']],
  ['/icons/mascot-favicon-v2-32.png', ['simulator/icons/mascot-favicon-v2-32.png', 'image/png']],
  ['/favicon.ico', ['simulator/icons/mascot-favicon-v2.ico', 'image/x-icon']],
  ['/icons/mascot-192.png', ['simulator/icons/mascot-192.png', 'image/png']],
  ['/icons/mascot-512.png', ['simulator/icons/mascot-512.png', 'image/png']],
  ['/simulator/style.css', ['simulator/style.css', 'text/css']],
  ['/simulator/app.js', ['simulator/app.js', 'text/javascript']],
  ['/simulator/engine.js', ['simulator/engine.js', 'text/javascript']],
  ['/simulator/eye-surface.js', ['simulator/eye-surface.js', 'text/javascript']],
  ['/simulator/eye-motion.js', ['simulator/eye-motion.js', 'text/javascript']],
  ['/simulator/renderer.js', ['simulator/renderer.js', 'text/javascript']],
  ['/character/expressions.json', ['character/expressions.json', 'application/json']],
  ['/character/eye-expression-sheet.svg', ['character/eye-expression-sheet.svg', 'image/svg+xml']],
  ['/scenes/behavior.json', ['scenes/behavior.json', 'application/json']]
]);
export function createServer() {
  const readSurf = createSurfReader();
  return http.createServer(async (req, res) => {
    if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host || '')) {res.writeHead(403); return res.end('Local preview only');}
    if (!['GET', 'HEAD'].includes(req.method)) {res.writeHead(405, {Allow: 'GET, HEAD'}); return res.end();}
    if(req.url?.split('?')[0]==='/customize'){
      res.writeHead(302,{Location:'https://studio-mascot.jesse-ech.chatgpt.site/customize','Cache-Control':'no-store'});return res.end();
    }
    if (req.url === '/api/surf') {
      try {
        const data = JSON.stringify(await readSurf());
        res.writeHead(200, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
        return res.end(req.method === 'HEAD' ? undefined : data);
      } catch {
        res.writeHead(503, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
        return res.end(JSON.stringify({error:'Surf forecast unavailable. Try reopening PLAY shortly.'}));
      }
    }
    const asset = assets.get(req.url?.split('?')[0]);
    if (!asset) {res.writeHead(404); return res.end('Not found');}
    try {
      const data = await readFile(path.join(root, asset[0]));
      res.writeHead(200, {'Content-Type': asset[1] + '; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'none'"});
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch {res.writeHead(500); res.end('Preview file unavailable');}
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PET_PORT || 4173);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Invalid preview port');
  const server = createServer();
  server.on('error', error => {console.error('PET preview: ' + error.message); process.exitCode = 1;});
  server.listen(port, '127.0.0.1', () => console.log('AI STUDIO PET · Local: http://127.0.0.1:' + port));
}

