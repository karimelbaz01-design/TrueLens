// Conservative, local JPEG metadata inspection. No authenticity claims.
function inspectJpeg(buffer) {
 const b=new Uint8Array(buffer), out=[];
 if(b.length<4||b[0]!==255||b[1]!==216)return out;
 let p=2; const decoder=new TextDecoder('latin1');
 while(p+4<b.length){
  if(b[p]!==255)break;
  const marker=b[p+1]; if(marker===218||marker===217)break;
  if(marker===255){p++;continue}
  if(marker===0||marker===1||(marker>=208&&marker<=215)){p+=2;continue}
  const length=(b[p+2]<<8)|b[p+3];
  if(length<2||p+2+length>b.length)break;
  const data=b.subarray(p+4,p+2+length);
  if(marker===225&&data.length>=6&&decoder.decode(data.subarray(0,6))==='Exif\0\0'){
    out.push(['EXIF','Presente (non prova autenticità)']);
    const tiff=data.subarray(6);
    if(tiff.length>=8){
      const little=tiff[0]===73&&tiff[1]===73, big=tiff[0]===77&&tiff[1]===77;
      if(little||big){
       const dv=new DataView(tiff.buffer,tiff.byteOffset,tiff.byteLength);
       const u16=o=>dv.getUint16(o,little),u32=o=>dv.getUint32(o,little);
       const start=u32(4);
       if(start+2<=tiff.length){
        const count=Math.min(u16(start),128);
        for(let i=0;i<count;i++){
         const off=start+2+i*12;if(off+12>tiff.length)break;
         const tag=u16(off),type=u16(off+2),n=u32(off+4);
         if((tag===0x010f||tag===0x0110||tag===0x0131||tag===0x0132)&&type===2&&n>0&&n<256){
          const strOff=n<=4?off+8:u32(off+8);
          if(strOff+n<=tiff.length){
           const val=decoder.decode(tiff.subarray(strOff,strOff+n)).replace(/\0/g,'').trim();
           if(val)out.push([{0x010f:'Produttore',0x0110:'Modello',0x0131:'Software dichiarato',0x0132:'Data EXIF'}[tag],val]);
          }
         }
        }
       }
      }
    }
  }
  if(marker===254&&data.length){out.push(['Commento JPEG',decoder.decode(data.subarray(0,Math.min(data.length,160))).replace(/[\x00-\x1f]/g,' ').trim()])}
  p+=2+length;
 }
 return out;
}
