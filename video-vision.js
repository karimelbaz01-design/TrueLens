// Local video frame sampling. Descriptive statistics, NOT AI/deepfake detection.
// Only uses browser video decoder and canvas; no file upload.
async function inspectVideoFrames(file,{count=3,maxDimension=320,timeoutMs=15000}={}) {
 if(!file||!file.type.startsWith('video/'))return {status:'unsupported'};
 const video=document.createElement('video');
 video.muted=true;video.playsInline=true;video.preload='auto';
 const url=URL.createObjectURL(file);
 const wait=(event,timeout)=>new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{cleanup();reject(Error('Timeout decodifica video'));},timeout);
  const done=()=>{cleanup();resolve();};
  const fail=()=>{cleanup();reject(Error('Formato video non decodificabile'));};
  const cleanup=()=>{clearTimeout(timer);video.removeEventListener(event,done);video.removeEventListener('error',fail);};
  video.addEventListener(event,done,{once:true});video.addEventListener('error',fail,{once:true});
 });
 try{
  video.src=url;
  if(video.readyState<1)await wait('loadedmetadata',timeoutMs);
  const duration=video.duration;
  if(!Number.isFinite(duration)||duration<=0||!video.videoWidth||!video.videoHeight)return {status:'unsupported'};
  const scale=Math.min(1,maxDimension/Math.max(video.videoWidth,video.videoHeight));
  const w=Math.max(1,Math.round(video.videoWidth*scale)),h=Math.max(1,Math.round(video.videoHeight*scale));
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)return {status:'unsupported'};
  const frames=[];
  for(let i=0;i<Math.min(Math.max(count,1),5);i++){
   const target=Math.min(Math.max(duration*(i+1)/(count+1),0),Math.max(0,duration-.05));
   if(Math.abs(video.currentTime-target)>.03){
    const seeking=wait('seeked',timeoutMs);
    video.currentTime=target;await seeking;
   }else if(video.readyState<2){await wait('loadeddata',timeoutMs);}
   ctx.drawImage(video,0,0,w,h);
   const features=measurePixels(ctx.getImageData(0,0,w,h).data,w,h);
   frames.push({time:Math.round(target*10)/10,...features});
  }
  return {status:'ok',duration,width:video.videoWidth,height:video.videoHeight,frames};
 }catch(e){return {status:'unsupported',reason:e?.message||'Decodifica non disponibile'};}
 finally{video.pause();video.removeAttribute('src');video.load();URL.revokeObjectURL(url);}
}
