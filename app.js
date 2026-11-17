const metadataEntries=[];
const input=document.querySelector('#file');
const preview=document.querySelector('#preview');
const result=document.querySelector('#result');
const details=document.querySelector('#details');
const copyButton=document.querySelector('#copy');
const c2paButton=document.querySelector('#c2pa-test'),c2paOutput=document.querySelector('#c2pa-output');
const aiButton=document.querySelector('#ai-test'),aiOutput=document.querySelector('#ai-output');
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
 result.style.display='block';c2paButton.disabled=false;c2paOutput.textContent='';aiButton.disabled=!file.type.startsWith('image/');aiOutput.textContent='';preview.replaceChildren();details.replaceChildren();
 metadataEntries.length=0;report='';copyButton.disabled=true;copyButton.textContent='Analisi in corso…';
 document.querySelector('#filename').textContent=file.name;
 document.querySelector('#verdict').textContent='Analisi preliminare: origine non determinata. Per tentare il rilevamento AI, usa il pulsante sperimentale in fondo al rapporto.';
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
  if(file.type.startsWith('video/')){const videoAnalysis=await inspectVideoFrames(file);if(!valid())return;if(videoAnalysis.status==='ok'){row('Video Vision · risoluzione',videoAnalysis.width+' × '+videoAnalysis.height);row('Video Vision · frame campionati',videoAnalysis.frames.length);for(const frame of videoAnalysis.frames)row('Frame '+frame.time+'s','luminosità '+frame.brightness+', contrasto '+frame.contrast+', differenza pixel '+frame.edgeDifference);row('Video Vision · nota','Statistiche descrittive, NON rilevamento deepfake')}else row('Video Vision','Non disponibile: '+(videoAnalysis.reason||'formato non supportato'));}row('Tipo MIME',file.type||'Non dichiarato');
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
 document.querySelector('#verdict').textContent=file.type.startsWith('image/')?'Analisi preliminare completata. Per una stima AI sperimentale, premi «Prova rilevatore AI sperimentale» qui sotto.':'Analisi preliminare completata. Rilevatore AI sperimentale disponibile solo per le immagini.';
 updateReport(file);copyButton.disabled=false;copyButton.textContent='Copia rapporto';
});
c2paButton.onclick=async()=>{
 const file=input.files?.[0];if(!file)return;
 const id=requestId;c2paButton.disabled=true;c2paOutput.textContent='Lettura C2PA in corso…';
 try{const info=await inspectC2pa(file);if(id!==requestId)return;
  if(info.status==='absent'){c2paOutput.textContent='Nessun manifesto C2PA rilevato. Non dimostra autenticità.';row('C2PA','Manifesto assente');}
  else {c2paOutput.textContent='Manifesto rilevato. Attendibilità della firma NON verificata.';row('C2PA · manifest',info.active||'Presente');if(info.claimGenerator)row('C2PA · software dichiarato',info.claimGenerator);if(info.title)row('C2PA · titolo',info.title);row('C2PA · validazione',info.validationState==='invalid'?'Non valida':info.validationState==='valid-untrusted'?'Firma valida, firmatario non attendibile':'Non determinabile');}
  updateReport(file);
 }catch(e){if(id!==requestId)return;c2paOutput.textContent='Lettura non disponibile: '+(e?.message||'errore');}
 finally{if(id===requestId)c2paButton.disabled=false;}
};
aiButton.onclick=async()=>{
 const file=input.files?.[0];if(!file||!file.type.startsWith('image/'))return;
 const id=requestId;aiButton.disabled=true;aiOutput.textContent='Caricamento del modello ed elaborazione sul dispositivo…';
 try{const assessment=await runExperimentalDetector(file);if(id!==requestId)return;
  const cameraMetadata=metadataEntries.some(([key,value])=>/^(EXIF: )?(Make|Model|Camera Make|Camera Model|Marca|Modello|Fotocamera)$/i.test(key.trim())&&value.trim().length>1);
  const conflict=cameraMetadata&&assessment.fakeScore>=.85;
  const interpretation=conflict?'Risultati discordanti: il modello segnala la classe AI, ma il file contiene metadati fotografici. Origine non determinabile.':'Origine non determinabile: classificazione sperimentale non convalidata.';
  document.querySelector('#verdict').textContent=interpretation;
  row('AI Vision · interpretazione',interpretation);
  aiOutput.textContent=interpretation+' Risultato del modello: '+assessment.label+'. Score grezzi NON calibrati (non probabilità di autenticità): classe AI +(assessment.fakeScore*100).toFixed(1)+'%, classe fotografica '+(assessment.realScore*100).toFixed(1)+'%. Metadati e punteggi possono essere errati o manipolati.';
  row('AI Vision · valutazione',assessment.label);
  row('AI Vision · score non calibrati','AI '+assessment.fakeScore.toFixed(3)+'; fotografica '+assessment.realScore.toFixed(3));
  row('AI Vision · attendibilità','Non validato sui generatori recenti; nessuna attribuzione');
  updateReport(file);
 }catch(e){if(id!==requestId)return;aiOutput.textContent='Rilevatore non disponibile: '+(e?.message||'errore sconosciuto');}
 finally{if(id===requestId)aiButton.disabled=false;}
};
copyButton.onclick=async()=>{
 if(!report)return;
 try{await navigator.clipboard.writeText(report);copyButton.textContent='Copiato!';}
 catch{alert('Copia non disponibile in questo browser');}
};
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
