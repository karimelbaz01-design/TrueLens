// Experimental browser-only image classifier. NOT a forensic authenticity verdict.
// Model trained on older AI images; modern generators are out of distribution.
const EXPERIMENTAL_MODEL='onnx-community/ai-image-detection-ONNX';
const EXPERIMENTAL_MODEL_VARIANT='q8';
let experimentalPipelinePromise=null;
function interpretAiScores(outputs){
 if(!Array.isArray(outputs)||outputs.length<2)throw Error('Risultati incompleti');
 const scores=new Map();
 for(const item of outputs){
  const label=String(item?.label||'').trim().toUpperCase();
  const score=Number(item?.score);
  if(!Number.isFinite(score)||score<0||score>1)throw Error('Score non valido');
  if(label==='FAKE'||label==='REAL')scores.set(label,score);
 }
 if(!scores.has('FAKE')||!scores.has('REAL'))throw Error('Etichette del modello non riconosciute');
 const fake=scores.get('FAKE'),real=scores.get('REAL');
 if(Math.abs(fake+real-1)>.05)throw Error('Score del modello incoerenti');
 // Abstention is deliberate. Thresholds are heuristic, NOT validated sensitivity/specificity.
 const label=fake>=.85?'Segnale sperimentale favorevole alla classe AI':
  real>=.85?'Segnale sperimentale favorevole alla classe fotografica':'Risultato incerto';
 return {label,fakeScore:fake,realScore:real,calibrated:false,verified:false};
}
async function decodeAiInput(file){
 if(typeof createImageBitmap==='function'){
  const bitmap=await createImageBitmap(file);
  return {width:bitmap.width,height:bitmap.height,draw:(ctx,w,h)=>ctx.drawImage(bitmap,0,0,w,h),close:()=>bitmap.close()};
 }
 // Safari fallback for versions where createImageBitmap is unavailable.
 const url=URL.createObjectURL(file);
 const image=new Image();
 try{
  await new Promise((resolve,reject)=>{
   image.onload=resolve;
   image.onerror=()=>reject(Error('Immagine non decodificabile'));
   image.src=url;
  });
  return {width:image.naturalWidth,height:image.naturalHeight,draw:(ctx,w,h)=>ctx.drawImage(image,0,0,w,h),close:()=>URL.revokeObjectURL(url)};
 }catch(e){URL.revokeObjectURL(url);throw e;}
}
async function runExperimentalDetector(file){
 if(!file||!file.type.startsWith('image/'))throw Error('Seleziona un’immagine.');
 if(file.size>20*1024*1024)throw Error('Immagine troppo grande (max 20 MiB).');
 if(!experimentalPipelinePromise){
  experimentalPipelinePromise=import('https://esm.sh/@huggingface/transformers@3.8.1')
   .then(({pipeline,env,RawImage})=>{
    env.allowLocalModels=false;
    // Explicit 8-bit quantization lowers memory pressure on mobile devices.
    return pipeline('image-classification',EXPERIMENTAL_MODEL,{device:'wasm',dtype:EXPERIMENTAL_MODEL_VARIANT}).then(classifier=>({classifier,RawImage}));
   }).catch(e=>{experimentalPipelinePromise=null;throw e;});
 }
 const {classifier,RawImage}=await experimentalPipelinePromise;
 // Decode locally and downscale to avoid huge source images.
 const bitmap=await decodeAiInput(file);
 try{
  const canvas=document.createElement('canvas');
  const scale=Math.min(1,1024/Math.max(bitmap.width,bitmap.height));
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));
  canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext('2d');
  if(!ctx)throw Error('Canvas non disponibile');
  bitmap.draw(ctx,canvas.width,canvas.height);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Impossibile elaborare l’immagine')),'image/png'));
  const decoded=await RawImage.fromBlob(blob);
  const outputs=await classifier(decoded,{top_k:2});
  return interpretAiScores(outputs);
 }finally{bitmap.close();}
}
