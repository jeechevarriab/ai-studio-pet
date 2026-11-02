export function connectStudio({receive}){
 let last=null;
 const read=async()=>{if(document.hidden)return;try{const response=await fetch('/api/studio',{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error();const data=await response.json();if(!Array.isArray(data.agents))throw Error();last=data;receive(data);}catch{receive({online:false,agents:[],observedAt:null});}};
 void read();let timer=setInterval(()=>void read(),5000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)void read();});
 window.addEventListener('pagehide',()=>clearInterval(timer));
 window.addEventListener('pageshow',event=>{if(event.persisted){clearInterval(timer);timer=setInterval(()=>void read(),5000);void read();}});
 return {get latest(){return last;}};
}
export function paintStudio(panel,report){
 panel.replaceChildren();const heading=document.createElement('h2');heading.textContent='STUDIO';panel.append(heading);
 const status=document.createElement('p');status.className='studio-connection';status.textContent=report?.online?'LIVE CONNECTION':'Connection paused';panel.append(status);
 if(!report?.online){const note=document.createElement('p');note.textContent='Waiting for your Windows studio.';panel.append(note);return;}
 for(const agent of report.agents){
  const row=document.createElement('div');row.className='studio-agent';const name=document.createElement('span');name.textContent=agent.name;
  const value=document.createElement('span');value.textContent=({working:'In progress',attention:'Needs approval',completed:'Turn finished',idle:'Standing by',interrupted:'Interrupted',unknown:'Status unavailable'})[agent.status]||'Status unavailable';
  if(agent.status==='working')value.textContent=({waiting:'Waiting',preparing:'Preparing',checking:'Checking'})[agent.phase]||'In progress';
  if(agent.status==='working'&&Number.isFinite(agent.startedAt)){const seconds=Math.max(0,Math.floor((Date.now()-agent.startedAt)/1000));value.textContent+=' · '+(seconds<60?seconds+'s':Math.floor(seconds/60)+'m '+seconds%60+'s');}
  row.append(name,value);panel.append(row);
  if(agent.status==='working'){const bar=document.createElement('progress');bar.setAttribute('aria-label',agent.name+' in progress');panel.append(bar);}
 }
 const note=document.createElement('p');note.className='studio-footnote';note.textContent='Live activity · percentages are not provided by STUDIO';panel.append(note);
}
