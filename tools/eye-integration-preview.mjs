// Isolated owner fixture for integration/creative review. Nothing is sent to the
// public app. Saved test settings live only in this process and survive reloads.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateDesign} from '../simulator/design.js';
export async function startEyePreview(port=0){
 const root=fileURLToPath(new URL('../',import.meta.url));
 const original=JSON.parse(await readFile(path.join(root,'character/cloud-default-design.json'),'utf8'));
 let settings=validateDesign(original.settings),revision=1,writes=0;
 const server=http.createServer(async(req,res)=>{
  const reply=(code,data,type='application/json')=>{res.writeHead(code,{'Content-Type':type,'Cache-Control':'no-store'});res.end(type==='application/json'&&!Buffer.isBuffer(data)?JSON.stringify(data):data);};
  if(!/^127\.0\.0\.1(:\d+)?$/.test(req.headers.host||''))return reply(403,{error:'Loopback only'});
  try{
   const url=new URL(req.url,'http://127.0.0.1');
   if(url.pathname==='/api/design'){
    if(req.method==='PUT'){
     let raw='';for await(const c of req)raw+=c;
     const input=JSON.parse(raw);if(input.revision!==revision)return reply(409,{error:'Stale fixture revision'});
     settings=validateDesign(input.settings);revision++;writes++;
    }
    return reply(200,{settings,revision});
   }
   if(url.pathname==='/api/session')return reply(200,{owner:true,signedIn:true});
   if(url.pathname==='/api/favorites')return reply(200,{revision:0,items:[]});
   if(url.pathname==='/api/studio')return reply(200,{online:false,agents:[]});
   if(url.pathname==='/api/surf')return reply(503,{error:'Offline integration fixture'});
   if(url.pathname==='/__fixture')return reply(200,{settings,revision,writes});
   if(url.pathname==='/__baseline.js'){
    const source=(await readFile(path.join(root,'docs/eye-integration/renderer-before.js'),'utf8')).replace("'./color-finishes.js'","'/simulator/color-finishes.js'");
    return reply(200,source,'text/javascript');
   }
   let file=['/','/app','/app/','/customize'].includes(url.pathname)?'simulator/index.html':url.pathname.startsWith('/icons/')?'simulator'+url.pathname:['/sw.js','/manifest.webmanifest'].includes(url.pathname)?'simulator'+url.pathname:url.pathname.slice(1);
   if(!/^(simulator|character|scenes|docs\/eye-integration)\/[\w./-]+$/.test(file)||file.split('/').includes('..'))return reply(404,{error:'Not a preview asset'});
   const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.mp4':'video/mp4','.ico':'image/x-icon','.webmanifest':'application/manifest+json'}[path.extname(file)]||'application/octet-stream';
   let data=await readFile(path.join(root,file));
   if(file==='simulator/index.html')data=Buffer.from(data.toString().replace('<body>','<body><aside style="position:relative;padding:10px 18px;background:#183343;color:#e8f4ff;font:13px system-ui;z-index:2">Creative review preview · Saves stay in this local preview. Production settings are unchanged.</aside>'));
   reply(200,data,type);
  }catch(error){reply(400,{error:error.message});}
 });
 await new Promise(r=>server.listen(port,'127.0.0.1',r));
 return {server,url:'http://127.0.0.1:'+server.address().port,state:()=>({settings,revision,writes})};
}
if(typeof process!=='undefined'&&process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const preview=await startEyePreview(Number(process.argv[2]||4183));
 console.log('Isolated PET eye editor: '+preview.url+'/customize');
}
