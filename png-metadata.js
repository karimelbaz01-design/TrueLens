// PNG metadata inspection. Bounded, local, and deliberately conservative.
// Text chunks can be edited or forged and are never proof of authenticity.
function inspectPng(buffer) {
 const b=new Uint8Array(buffer), out=[];
 const sig=[137,80,78,71,13,10,26,10];
 if(b.length<8||!sig.every((v,i)=>b[i]===v))return out;
 const view=new DataView(b.buffer,b.byteOffset,b.byteLength);
 const decoder=new TextDecoder();
 let p=8, seen=0;
 while(p+12<=b.length && seen++<200){
  const len=view.getUint32(p,false);
  if(len>b.length-p-12)break;
  const type=String.fromCharCode(...b.subarray(p+4,p+8));
  const start=p+8,end=start+len;
  if(type==='IHDR'&&len>=8)out.push(['Dimensioni PNG',view.getUint32(start,false)+' × '+view.getUint32(start+4,false)]);
  if(type==='tEXt'&&len<=16384){
   const data=b.subarray(start,end),split=data.indexOf(0);
   if(split>0&&split<80){
    const key=decoder.decode(data.subarray(0,split)).slice(0,80);
    const value=decoder.decode(data.subarray(split+1)).slice(0,500);
    if(key&&value)out.push(['PNG: '+key,value]);
   }
  }
  if(type==='iTXt'&&len<=16384){
   const data=b.subarray(start,end),split=data.indexOf(0);
   if(split>0&&split<80&&data.length>split+2){
    // Only uncompressed iTXt is directly readable.
    const compressed=data[split+1];
    if(compressed===0){
     let i=split+3;
     const langEnd=data.indexOf(0,i);
     if(langEnd>=0){i=langEnd+1;const translatedEnd=data.indexOf(0,i);
      if(translatedEnd>=0){
       const value=decoder.decode(data.subarray(translatedEnd+1)).slice(0,500);
       if(value)out.push(['PNG: '+decoder.decode(data.subarray(0,split)),value]);
      }
     }
    }
   }
  }
  if(type==='IEND')break;
  p=end+4;
 }
 return out.slice(0,24);
}
