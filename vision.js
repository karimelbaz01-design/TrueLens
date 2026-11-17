// AI Vision groundwork: local visual measurements, NOT an AI-authenticity classifier.
// Measurements are descriptive and must never be interpreted as AI probability.
function measurePixels(rgba,width,height) {
 if(!rgba||width<1||height<1||rgba.length<width*height*4)throw Error('Pixel buffer non valido');
 let count=0,sum=0,sumSq=0,edges=0,edgeCount=0;
 const luminance=new Float32Array(width*height);
 for(let i=0;i<width*height;i++){
  const k=i*4,lum=.2126*rgba[k]+.7152*rgba[k+1]+.0722*rgba[k+2];
  luminance[i]=lum;sum+=lum;sumSq+=lum*lum;count++;
 }
 for(let y=1;y<height;y++)for(let x=1;x<width;x++){
  const i=y*width+x;
  edges+=Math.abs(luminance[i]-luminance[i-1])+Math.abs(luminance[i]-luminance[i-width]);
  edgeCount+=2;
 }
 const mean=sum/count,contrast=Math.sqrt(Math.max(0,sumSq/count-mean*mean));
 return {brightness:Math.round(mean),contrast:Math.round(contrast*10)/10,edgeDifference:edgeCount?Math.round(edges/edgeCount*10)/10:0,width,height};
}
async function analyzeImageVisual(file) {
 if(!file.type.startsWith('image/'))return {status:'unsupported'};
 if(typeof createImageBitmap!=='function')return {status:'unsupported'};
 let bitmap;
 try {
  bitmap=await createImageBitmap(file);
  const scale=Math.min(1,512/Math.max(bitmap.width,bitmap.height));
  const w=Math.max(1,Math.round(bitmap.width*scale)),h=Math.max(1,Math.round(bitmap.height*scale));
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)return {status:'unsupported'};
  ctx.drawImage(bitmap,0,0,w,h);
  return {status:'ok',...measurePixels(ctx.getImageData(0,0,w,h).data,w,h)};
 } catch {return {status:'unsupported'};}
 finally {if(bitmap)bitmap.close();}
}
