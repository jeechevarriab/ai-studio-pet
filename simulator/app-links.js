// App launch preferences stay on this device; launching is not a data connection.
export const APP_DESTINATIONS={
 work:{name:'Codex',shortcut:'Studio Work',app:'ChatGPT',web:'https://chatgpt.com/codex'},
 surf:{name:'Windy.app',shortcut:'Studio Surf',app:'Windy.app',web:'https://windy.app'},
 sleep:{name:'Clock',shortcut:'Studio Sleep',app:'Clock'}
};
export function appLaunchTarget(mode,{appleMobile=false,mac=false,windows=false,shortcutReady=false}={}){
 const destination=APP_DESTINATIONS[mode];if(!destination)return null;
 if(appleMobile||mode==='sleep'&&mac)return {href:'shortcuts://run-shortcut?name='+encodeURIComponent(destination.shortcut),needsSetup:!shortcutReady};
 if(mode==='work'&&(windows||mac))return {href:'codex://',needsSetup:false};
 if(mode==='sleep')return windows?{href:'ms-clock:',needsSetup:false}:{href:'#',needsSetup:true,unsupported:true};
 return {href:destination.web,needsSetup:false};
}
export function connectAppLinks(){
 const appleMobile=/iPhone|iPad|iPod/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;
 const platform={appleMobile,mac:!appleMobile&&/Mac/.test(navigator.platform),windows:/Win/.test(navigator.platform)};
 const readyModes=new Set();
 const ready=mode=>{if(readyModes.has(mode))return true;try{return localStorage.getItem('mascot-app-shortcut-'+mode)==='ready';}catch{return false;}};
 const dialog=document.createElement('dialog');dialog.className='app-launch-dialog';dialog.setAttribute('aria-labelledby','app-launch-title');document.body.append(dialog);
 let opener=null;
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>opener?.focus());
 const showSetup=(mode,trigger)=>{
  opener=trigger;const destination=APP_DESTINATIONS[mode];dialog.replaceChildren();
  const heading=document.createElement('h2');heading.id='app-launch-title';heading.textContent='Open '+destination.name;
  const close=document.createElement('button');close.type='button';close.className='app-launch-close';close.textContent='Close';close.addEventListener('click',()=>dialog.close());
  const intro=document.createElement('p');intro.textContent='One-time setup on this device:';
  if(appLaunchTarget(mode,platform).unsupported){intro.textContent='Open Clock directly on this device. A browser launch link is not configured for this platform.';dialog.append(close,heading,intro);dialog.showModal();return;}
  const steps=document.createElement('ol');
  for(const text of ['In Apple Shortcuts, create a shortcut named '+destination.shortcut+'.','Add Open App and choose '+destination.app+'.',...(mode==='work'?['If ChatGPT offers Open Remote, use that action to go straight to Codex.']:[]),'Save it, then return here and select Shortcut is ready.']){const item=document.createElement('li');item.textContent=text;steps.append(item);}
  const note=document.createElement('p');note.className='app-launch-note';note.textContent=mode==='work'?'The status shown here comes from your connected STUDIO computer.':mode==='surf'?'The forecast here comes from Open-Meteo and NOAA. Your Windy account and saved spots are not synced.':'This opens Clock. It does not give this website access to your phone alarms.';
  const actions=document.createElement('div');actions.className='app-launch-actions';
  const shortcuts=document.createElement('a');shortcuts.href='shortcuts://';shortcuts.textContent='Open Shortcuts';
  const done=document.createElement('button');done.type='button';done.textContent='Shortcut is ready';done.addEventListener('click',()=>{readyModes.add(mode);try{localStorage.setItem('mascot-app-shortcut-'+mode,'ready');}catch{}dialog.close();});
  actions.append(shortcuts,done);
  if(destination.web){const fallback=document.createElement('a');fallback.href=destination.web;fallback.target='_blank';fallback.rel='noopener noreferrer';fallback.textContent='Open '+destination.name+' website';actions.append(fallback);}
  dialog.append(close,heading,intro,steps,note,actions);dialog.showModal();
 };
 for(const [mode,id]of [['work','studio-panel'],['surf','play-panel'],['sleep','sleep-panel']]){
  const panel=document.getElementById(id);if(!panel)continue;panel.classList.add('app-launch-panel');
  const link=document.createElement('a');link.className='panel-open';link.setAttribute('aria-label','Open '+APP_DESTINATIONS[mode].name);
  const label=document.createElement('span');label.textContent='Open '+APP_DESTINATIONS[mode].name+' ↗';link.append(label);
  const target=()=>appLaunchTarget(mode,{...platform,shortcutReady:ready(mode)});link.href=target().href;
  link.addEventListener('click',event=>{const launch=target();link.href=launch.href;if(launch.needsSetup){event.preventDefault();showSetup(mode,link);}});
  const setup=document.createElement('button');setup.type='button';setup.className='panel-launch-setup';setup.textContent='App setup';setup.setAttribute('aria-label',APP_DESTINATIONS[mode].name+' app setup');setup.addEventListener('click',()=>showSetup(mode,setup));
  setup.hidden=!(appleMobile||platform.mac&&mode==='sleep');panel.append(link,setup);
 }
}
