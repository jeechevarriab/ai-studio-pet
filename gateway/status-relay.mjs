import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const STUDIO_AGENTS=['agents-manager','pc-master','design-master','animation-master','web-master'];
export function reduceNative(record,id,threadId,now=Date.now()){
 if(!record||record.agentId!==id||record.threadId!==threadId||!['working','approval','completed','interrupted'].includes(record.state)||!Number.isFinite(record.observedAt)||record.observedAt>now+5000)return {id,status:'unknown',startedAt:null,observedAt:null};
 const age=now-record.observedAt;
 const status=['working','approval'].includes(record.state)&&age>=120000?'unknown':record.state==='approval'?'attention':record.state==='completed'&&age>=8000?'idle':record.state;
 return {id,status,startedAt:Number.isFinite(record.startedAt)?record.startedAt:null,observedAt:record.observedAt};
}
async function boundedRead(file){if((await stat(file)).size>20000)throw Error('Activity record too large');return JSON.parse(await readFile(file,'utf8'));}
export function reduceTask(turn,id,healthy,now=Date.now()){
 if(!turn||!STUDIO_AGENTS.includes(id))return null;
 const startedAt=Date.parse(turn.startedAt||turn.createdAt),finishedAt=Date.parse(turn.finishedAt),lastProgress=Date.parse(turn.progress?.at(-1)?.at);
 if(!Number.isFinite(startedAt)||startedAt>now+5000)return null;
 let status,phase;
 if(['queued','running'].includes(turn.status)){
  status=healthy?'working':'unknown';phase=!healthy?'unknown':turn.status==='queued'?'waiting':/verif|check|qa|validat|review/i.test(turn.stage||'')?'checking':/prepar|inspect|plan|assign/i.test(turn.stage||'')?'preparing':'working';
 }else if(turn.status==='completed'){status=Number.isFinite(finishedAt)&&now-finishedAt<8000?'completed':'idle';phase='finished';}
 else if(['failed','blocked'].includes(turn.status)){status='attention';phase='attention';}
 else if(['cancelled','interrupted'].includes(turn.status)){status='interrupted';phase='attention';}
 else return null;
 return {id,status,phase,startedAt,observedAt:Number.isFinite(finishedAt)?finishedAt:Number.isFinite(lastProgress)?lastProgress:startedAt};
}
async function dashboardStatuses(runtime,now){
 let healthy=false;try{const response=await fetch('http://127.0.0.1:8787/api/health',{signal:AbortSignal.timeout(2000)});const health=await response.json();healthy=health.workerOnline===true&&health.codexConnected===true;}catch{}
 const reports=[];
 for(const name of ['manager.json','work-tasks.json','web-reviews.json'])try{
  const file=path.join(runtime,name);if((await stat(file)).size>20*1024*1024)continue;
  const raw=JSON.parse(await readFile(file,'utf8'));
  for(const turn of raw.turns||[]){const id=turn.agent||turn.assignedAgent||turn.conversationAgent||(name==='manager.json'?'agents-manager':null);const report=reduceTask(turn,id,healthy,now);if(report)reports.push(report);}
 }catch{}
 return reports;
}
export async function collectStatus(runtime,now=Date.now()){
 const config=await boundedRead(path.join(runtime,'native-activity-config.json'));
 const map=await boundedRead(path.join(runtime,'native-agent-threads.json'));
 const agents=await Promise.all(STUDIO_AGENTS.map(async id=>{
  const registered=map.agents?.find(a=>a.agentId===id);if(!config.enabled||!registered)return {id,status:'unknown',startedAt:null,observedAt:null};
  try{return reduceNative(await boundedRead(path.join(runtime,'native-activity',id+'.json')),id,registered.threadId,now);}catch{return {id,status:'unknown',startedAt:null,observedAt:null};}
 }));
 const dashboard=await dashboardStatuses(runtime,now);
 for(let i=0;i<agents.length;i++){
  const candidates=[agents[i],...dashboard.filter(r=>r.id===agents[i].id)].sort((a,b)=>b.observedAt-a.observedAt);
  agents[i]=candidates.find(r=>r.status==='working')||candidates[0];
 }
 return {schemaVersion:1,observedAt:now,agents};
}
async function run(){
 const config=JSON.parse(await readFile(new URL('./.local/relay.json',import.meta.url),'utf8'));
 if(config.endpoint!=='https://studio-mascot.jesse-ech.chatgpt.site/api/studio/relay'||!/^[a-f0-9]{64}$/.test(config.key))throw Error('Invalid relay configuration');
 const runtime=path.resolve('C:/Users/Chapito/Desktop/AI STUDIO/Codex Source Folders/AI STUDIO Agent Control Hub/runtime');
 let stopped=false;for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{stopped=true;});
 console.log('STUDIO → Mascot relay running. Read-only native/dashboard statuses; only activity metadata is sent.');
 while(!stopped){
  try{const report=await collectStatus(runtime);const response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+config.key},body:JSON.stringify(report),signal:AbortSignal.timeout(10000)});if(!response.ok)console.error('Status relay not accepted: '+response.status);}
  catch(error){console.error('Status relay unavailable: '+error.message);}
  if(!stopped)await new Promise(resolve=>setTimeout(resolve,5000));
 }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))run().catch(error=>{console.error(error.message);process.exitCode=1;});
