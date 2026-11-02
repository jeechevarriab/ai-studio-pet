import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from '../tools/serve.mjs';
import http from 'node:http';
test('local server serves only simulator assets and rejects writes, spoofed hosts and private paths', async () => {
  const server = createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = 'http://127.0.0.1:' + server.address().port;
  try {
    for (const asset of ['/', '/app', '/app/', '/simulator/app-view.js', '/sw.js', '/manifest.webmanifest', '/icons/mascot.svg', '/icons/mascot-192.png', '/icons/mascot-512.png', '/simulator/app.js', '/simulator/style.css', '/character/expressions.json', '/scenes/behavior.json']) assert.equal((await fetch(url + asset)).status, 200);
    const manifest = await (await fetch(url + '/manifest.webmanifest')).json();
    assert.equal(manifest.start_url, '/app?mascot=v2');
    assert.equal(manifest.display, 'standalone');
    for (const icon of manifest.icons) {
      const png = Buffer.from(await (await fetch(url + icon.src)).arrayBuffer());
      const [width, height] = icon.sizes.split('x').map(Number);
      assert.equal(png.readUInt32BE(16), width);
      assert.equal(png.readUInt32BE(20), height);
    }
    assert.equal((await fetch(url + '/.git/config')).status, 404);
    assert.equal((await fetch(url + '/docs/progress.md')).status, 404);
    assert.equal((await fetch(url + '/firmware/muse-gadget-sdk/README.md')).status, 404);
    assert.equal((await fetch(url, {method: 'POST', body: 'no'})).status, 405);
    // Node fetch normalizes Host; use HTTP directly to exercise an actual spoofed header.
    const rejectedHost = await new Promise((resolve, reject) => {
      http.get(url, {headers: {Host: 'other.example'}}, response => {response.resume(); resolve(response.statusCode);}).on('error', reject);
    });
    assert.equal(rejectedHost, 403);
    const page = await fetch(url); assert.match(page.headers.get('content-security-policy'), /connect-src 'self'/);
  } finally {await new Promise(resolve => server.close(resolve));}
});
