import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const assets = new Map([
  ['/', ['simulator/index.html', 'text/html']],
  ['/simulator/style.css', ['simulator/style.css', 'text/css']],
  ['/simulator/app.js', ['simulator/app.js', 'text/javascript']],
  ['/simulator/engine.js', ['simulator/engine.js', 'text/javascript']],
  ['/simulator/renderer.js', ['simulator/renderer.js', 'text/javascript']],
  ['/character/expressions.json', ['character/expressions.json', 'application/json']],
  ['/scenes/behavior.json', ['scenes/behavior.json', 'application/json']]
]);
export function createServer() {
  return http.createServer(async (req, res) => {
    if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host || '')) {res.writeHead(403); return res.end('Local preview only');}
    if (!['GET', 'HEAD'].includes(req.method)) {res.writeHead(405, {Allow: 'GET, HEAD'}); return res.end();}
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
