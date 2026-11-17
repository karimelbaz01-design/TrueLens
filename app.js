const metadataEntries=[];
const input=document.querySelector('#file');
const preview=document.querySelector('#preview');
const result=document.querySelector('#result');
const details=document.querySelector('#details');
const copyButton=document.querySelector('#copy');
let report='',previewUrl=null,requestId=0;
const HASH_LIMIT=64*1024*1024;
const METADATA_LIMIT=4*1024*1024;
const row=(a,b)=>{
 const d=document.createElement('div');d.className='row';
 const x=document.createElement('span'),y=document.createElement('span');
 x.textContent=a;y.textContent=String(b);d.append(x,y);details.append(d);
 metadataEntries.push([a,String(b)]);
};
function updateReport(file){
 report='TrueLens — Rapporto preliminare\n'+file.name+'\n'+
 metadataEntries.map(([key,value])=>key+': '+value).join('\n')+
 '\nOrigine AI: non determinata.';
}
input.addEventListener('change',async()=>{
 const file=input.files?.[0];if(!file)return;
 const id=++requestId;
 if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null;}
 result.style.display='block';preview.replaceChildren();details.replaceChildren();
 metadataEntries.length=0;report='';copyButton.disabled=true;copyButton.textContent='Analisi in corso…';
 document.querySelector('#filename').textContent=file.name;
 document.querySelector('#verdict').textContent='Origine non determinabile: il rilevamento AI non è ancora disponibile.';
 document.querySelector('#notes').textContent='Analisi locale in corso…';
 const valid=()=>id===requestId;
 if(file.type.startsWith('image/')||file.type.startsWith('video/')){
  previewUrl=URL.createObjectURL(file);
  if(file.type.startsWith('image/')){
   const img=document.createElement('img');img.src=previewUrl;img.alt='Anteprima';
   img.onload=()=>{if(valid()){row('Dimensioni',img.naturalWidth+' × '+img.naturalHeight);updateReport(file);}};
   preview.append(img);
  }else{
   const video=document.createElement('video');video.src=previewUrl;video.controls=true;video.preload='metadata';
   video.onloadedmetadata=()=>{if(valid()){row('Durata',Math.round(video.duration)+' secondi');updateReport(file);}};
   preview.append(video);
  }
 }
 try{
  if(file.type==='image/jpeg'){
   try{for(const [k,v] of inspectJpeg(await file.slice(0,METADATA_LIMIT).arrayBuffer())){if(!valid())return;row(k,v);}}
   catch{row('EXIF','Lettura non riuscita');}
  }
  if(file.type==='image/png'){
   try{for(const [k,v] of inspectPng(await file.slice(0,METADATA_LIMIT).arrayBuffer())){if(!valid())return;row(k,v);}}
   catch{row('PNG','Lettura non riuscita');}
  }
  if(!valid())return;
  const signature=inspectSignature(await file.slice(0,32).arrayBuffer(),file.type);
  if(!valid())return;
  row('Formato rilevato dai byte',signature.detected);
  if(signature.match===false)row('Avviso formato','Firma e tipo MIME dichiarato non coincidono');
  if(file.type.startsWith('image/')){
   const visual=await analyzeImageVisual(file);
   if(!valid())return;
   if(visual.status==='ok'){
    row('AI Vision · luminosità media',visual.brightness+' / 255');
    row('AI Vision · contrasto',visual.contrast);
    row('AI Vision · differenza locale pixel',visual.edgeDifference);
    row('AI Vision · nota','Misure descrittive, NON probabilità di generazione AI');
   }else row('AI Vision','Analisi visiva non disponibile');
  }
  row('Tipo MIME',file.type||'Non dichiarato');
  row('Dimensione',new Intl.NumberFormat('it-IT').format(file.size)+' byte');
  row('Ultima modifica',new Date(file.lastModified).toLocaleString('it-IT'));
  if(file.size>HASH_LIMIT){
   row('SHA-256','Non calcolato: file oltre 64 MiB (limite memoria del browser)');
  }else{
   try{
    const hash=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());
    if(!valid())return;
    row('SHA-256',Array.from(new Uint8Array(hash)).map(x=>x.toString(16).padStart(2,'0')).join(''));
   }catch(e){if(!valid())return;row('SHA-256','Non disponibile');}
  }
  const clues=originTrace(metadataEntries);
  row('Origin Trace',clues.length?clues.map(x=>x.name+' (campo '+x.source+')').join('; '):'Nessun indizio riconosciuto');
  document.querySelector('#notes').textContent='Metadati e indizi sono modificabili; non certificano autenticità. Il controllo EXIF/PNG è limitato ai primi 4 MiB. SHA-256 identifica i byte, non la provenienza.';
 }catch(e){if(!valid())return;row('Errore analisi','File non elaborabile in questo browser');}
 if(!valid())return;
 updateReport(file);copyButton.disabled=false;copyButton.textContent='Copia rapporto';
});
copyButton.onclick=async()=>{
 if(!report)return;
 try{await navigator.clipboard.writeText(report);copyButton.textContent='Copiato!';}
 catch{alert('Copia non disponibile in questo browser');}
};
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
