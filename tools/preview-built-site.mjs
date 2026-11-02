// Loopback-only QA of the allowlisted public Worker. No owner credentials or writes.
import http from 'node:http';
import worker from '../../mascot-public-site/dist/server/index.js';
const env={BUCKET:{get:async()=>null}};
http.createServer(async(req,res)=>{
 if(!/^127\.0\.0\.1:4174$/.test(req.headers.host||'')||req.method!=='GET'){res.writeHead(403);return res.end();}
 if(req.url==='/api/design'&&process.argv.includes('--delay-design'))await new Promise(resolve=>setTimeout(resolve,2000));
 try{const response=await worker.fetch(new Request('http://127.0.0.1:4174'+req.url),env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}
 catch{res.writeHead(500);res.end('Preview unavailable');}
}).listen(4174,'127.0.0.1',()=>console.log('Read-only mascot QA: http://127.0.0.1:4174/customize'));
