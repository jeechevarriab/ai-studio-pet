import fs from 'node:fs';
import path from 'node:path';
const root=path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/,'$1'));
function boxes(b,s=0,e=b.length){const out=[];for(let p=s;p+8<=e;){const n=b.readUInt32BE(p),type=b.toString('ascii',p+4,p+8);if(n<8||p+n>e)break;out.push({p,n,type,start:p+8,end:p+n});p+=n;}return out;}
const report=[];
for(const file of ['editor-demo.mp4']){
 const b=fs.readFileSync(path.join(root,file)),top=boxes(b),children=x=>boxes(b,x.start,x.end),moov=top.find(x=>x.type==='moov'),mvhd=children(moov).find(x=>x.type==='mvhd');
 const tracks=children(moov).filter(x=>x.type==='trak').map(t=>{const tkhd=children(t).find(x=>x.type==='tkhd'),mdhd=children(children(t).find(x=>x.type==='mdia')).find(x=>x.type==='mdhd');const ver=b[tkhd.start];return{tkhd,mdhd,id:b.readUInt32BE(tkhd.start+(ver===1?20:12)),scale:b.readUInt32BE(mdhd.start+(b[mdhd.start]===1?20:12)),end:0,samples:0};});
 const defaults={};const mvex=children(moov).find(x=>x.type==='mvex');if(mvex)for(const x of children(mvex))if(x.type==='trex')defaults[b.readUInt32BE(x.start+4)]=b.readUInt32BE(x.start+12);
 for(const moof of top.filter(x=>x.type==='moof'))for(const traf of children(moof).filter(x=>x.type==='traf')){
  const entries=children(traf),tfhd=entries.find(x=>x.type==='tfhd'),tfdt=entries.find(x=>x.type==='tfdt');const flags=b.readUInt32BE(tfhd.start)&0xffffff,id=b.readUInt32BE(tfhd.start+4),track=tracks.find(t=>t.id===id);let cursor=tfhd.start+8;if(flags&1)cursor+=8;if(flags&2)cursor+=4;const defaultDuration=flags&8?b.readUInt32BE(cursor):defaults[id];let end=b[tfdt.start]===1?Number(b.readBigUInt64BE(tfdt.start+4)):b.readUInt32BE(tfdt.start+4);
  for(const trun of entries.filter(x=>x.type==='trun')){const f=b.readUInt32BE(trun.start)&0xffffff,n=b.readUInt32BE(trun.start+4);let p=trun.start+8;if(f&1)p+=4;if(f&4)p+=4;for(let i=0;i<n;i++){let d=defaultDuration;if(f&0x100){d=b.readUInt32BE(p);p+=4;}if(!d)throw Error('Missing sample duration');if(f&0x200)p+=4;if(f&0x400)p+=4;if(f&0x800)p+=4;end+=d;track.samples++;}}
  track.end=Math.max(track.end,end);
 }
 const duration=Math.max(...tracks.map(t=>t.end/t.scale));const movieScale=b.readUInt32BE(mvhd.start+(b[mvhd.start]===1?20:12));function durationField(box,offset,ticks){if(b[box.start]===1)b.writeBigUInt64BE(BigInt(Math.round(ticks)),box.start+offset[1]);else b.writeUInt32BE(Math.round(ticks),box.start+offset[0]);}
 durationField(mvhd,[16,24],duration*movieScale);for(const t of tracks){durationField(t.tkhd,[20,28],duration*movieScale);durationField(t.mdhd,[16,24],t.end);}if(mvex){const mehd=children(mvex).find(x=>x.type==='mehd');if(mehd)durationField(mehd,[4,4],duration*movieScale);}
 fs.writeFileSync(path.join(root,file),b);report.push({file,durationSeconds:duration,tracks:tracks.map(t=>({samples:t.samples,timescale:t.scale,frameRateAverage:t.samples/duration})),durationHeaderFinalized:true});
}
fs.writeFileSync(path.join(root,'video-validation.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
