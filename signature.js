// File signature checks: compare bytes to declared MIME, never infer authenticity.
function inspectSignature(buffer, declared='') {
 const b=new Uint8Array(buffer);
 const starts=(arr)=>arr.every((v,i)=>b[i]===v);
 let detected='Sconosciuto';
 if(b.length>=3&&starts([255,216,255]))detected='image/jpeg';
 else if(b.length>=8&&starts([137,80,78,71,13,10,26,10]))detected='image/png';
 else if(b.length>=6&&(starts([71,73,70,56,55,97])||starts([71,73,70,56,57,97])))detected='image/gif';
 else if(b.length>=12&&String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP')detected='image/webp';
 else if(b.length>=12&&String.fromCharCode(...b.slice(4,8))==='ftyp')detected='video/mp4 / ISO-BMFF (famiglia contenitori)';
 return {detected,match:!declared||detected==='Sconosciuto'?null:(detected===declared||detected.startsWith(declared+' /'))};
}
