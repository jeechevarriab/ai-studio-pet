// Disposable loopback QA only. Identity and storage are synthetic; no production access.
import http from 'node:http';
import worker from '../../mascot-public-site/dist/server/index.js';
class Bucket{
 records=new Map();counter=0;
 async get(key){const r=this.records.get(key);return r?{etag:r.etag,json:async()=>JSON.parse(r.text)}:null;}
 async put(key,text,{onlyIf:c}={}){const old=this.records.get(key);if(c?.etagDoesNotMatch==='*'&&old||c?.etagMatches&&old?.etag!==c.etagMatches)return null;const etag=String(++this.counter);this.records.set(key,{text,etag});return {etag};}
}
const env={BUCKET:new Bucket(),MASCOT_OWNER_EMAIL:'fixture@example.test'};
let failSaveOnce=process.argv.includes('--fail-save-once');
http.createServer(async(req,res)=>{
 if(req.headers.host!=='127.0.0.1:4175'){res.writeHead(403);return res.end();}
 if(failSaveOnce&&req.method==='PUT'&&req.url==='/api/design'){failSaveOnce=false;req.resume();res.writeHead(503,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:'Temporary save failure. Your preview is kept. Try again.'}));}
 const chunks=[];for await(const chunk of req)chunks.push(chunk);
 const headers=new Headers(req.headers);headers.set('oai-authenticated-user-id','fixture-owner');headers.set('oai-authenticated-user-email','fixture@example.test');
 const request=new Request('http://127.0.0.1:4175'+req.url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)});
 try{const response=await worker.fetch(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}
 catch(error){res.writeHead(500);res.end(error.message);}
}).listen(4175,'127.0.0.1',()=>console.log('Synthetic owner fixture: http://127.0.0.1:4175/customize'));
