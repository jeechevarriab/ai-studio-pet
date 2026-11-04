// Disposable loopback editor QA. No production settings, identity or network APIs.
// Run with node test/eye-editor-fixture.mjs, then use /customize in the browser.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {DESIGN_DEFAULTS,validateDesign} from '../simulator/design.js';
const root=fileURLToPath(new URL('../',import.meta.url));
let settings=validateDesign({...DESIGN_DEFAULTS,bodyWidth:329}),revision=1,writes=0;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.webmanifest':'application/manifest+json'};
http.createServer(async(req,res)=>{
 const send=(code,body,type='application/json')=>{res.writeHead(code,{'Content-Type':type,'Cache-Control':'no-store'});res.end(type==='application/json'&&!Buffer.isBuffer(body)?JSON.stringify(body):body);};
 if(req.headers.host!=='127.0.0.1:4181')return send(403,{error:'Loopback only'});
 const url=new URL(req.url,'http://127.0.0.1:4181');
 try{
  if(url.pathname==='/api/session')return send(200,{owner:true,signedIn:true});
  if(url.pathname==='/api/design'){
   if(req.method==='PUT'){let body='';for await(const chunk of req)body+=chunk;const data=JSON.parse(body);if(data.revision!==revision)return send(409,{error:'Stale test revision'});settings=validateDesign(data.settings);revision++;writes++;}
   return send(200,{settings,revision});
  }
  if(url.pathname==='/api/favorites')return send(200,{revision:0,items:[]});
  if(url.pathname==='/api/studio')return send(200,{online:false,agents:[],observedAt:null});
  if(url.pathname==='/api/surf')return send(503,{error:'Offline QA fixture'});
  if(url.pathname==='/eye-qa-state')return send(200,{settings,revision,writes});
  if(!['GET','HEAD'].includes(req.method))return send(405,{error:'Unsupported fixture method'});
  if(url.pathname==='/eye-qa-events.js')return send(200,`document.addEventListener('mascot-eye-preview',event=>{const target=document.getElementById('eye-qa-events');target.textContent=JSON.stringify([...JSON.parse(target.textContent||'[]'),event.detail.action]);});`,'text/javascript');
  let file=['/','/app','/customize'].includes(url.pathname)?'simulator/index.html':url.pathname==='/manifest.webmanifest'?'simulator/manifest.webmanifest':url.pathname.startsWith('/icons/')?'simulator'+url.pathname:url.pathname.slice(1);
  if(!/^(simulator|character|scenes)\/[\w./-]+$/.test(file)||file.split('/').includes('..'))return send(404,{error:'Unknown fixture route'});
  let data=await readFile(path.join(root,file));
  if(file==='simulator/index.html')data=Buffer.from(data.toString().replace('</head>','<script defer src="/eye-qa-events.js"></script></head>').replace('</body>','<output id="eye-qa-events" hidden>[]</output></body>'));
  send(200,data,types[path.extname(file)]||'application/octet-stream');
 }catch(error){send(400,{error:error.message});}
}).listen(4181,'127.0.0.1',()=>console.log('Isolated eye editor: http://127.0.0.1:4181/customize'));
