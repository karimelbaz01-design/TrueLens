// UI language is independent of image classification. English is the default for non-Italian browsers.
const TL_LANG_KEY='truelens-language';
let tlLanguage=(()=>{try{return localStorage.getItem(TL_LANG_KEY)||(/^it(?:-|$)/i.test(navigator.language)?'it':'en')}catch{return /^it(?:-|$)/i.test(navigator.language)?'it':'en'}})();
const TL_COPY={
 en:{
  headline:'Every file has a story. Find the evidence.',
  intro:'Local preliminary analysis of photos and videos. We distinguish verifiable data from hypotheses.',
  upload:'Select a photo or video',formats:'Files supported by your browser',report:'FORENSIC REPORT',
  copy:'Copy report',c2pa:'Content Credentials (C2PA) · experimental',
  c2padesc:'Optional local inspection. Signature and trust chain have not yet been verified.',
  c2pabutton:'Inspect C2PA credentials',ai:'AI Vision — optional experiment',
  aidesc:'Downloads an experimental model to analyze images on your device. Scores are NOT reliable probabilities or proof of authenticity. It may be slow or fail on some phones. Internet is required on first use.',
  aibutton:'Try experimental AI detector',
  footer:'Privacy first · Your file is not uploaded to our servers. The AI classifier is experimental and cannot reliably identify synthetic content, generators or edits. Missing metadata does not prove authenticity.',
  loading:'Analysis in progress…',done:'Preliminary analysis complete. To try the experimental AI model, use the button below.',
  doneVideo:'Preliminary analysis complete. The experimental AI detector supports images only.',
  pending:'Preliminary analysis: origin undetermined. Use the experimental AI detector below.',
  aiLoading:'Loading model and processing on your device…',
  uncertain:'Origin undetermined: experimental classification is not validated.',
  conflict:'Conflicting signals: the model indicates AI, but the file contains camera metadata. Origin undetermined.',
  modelResult:'Experimental model output',scores:'Uncalibrated raw scores (NOT authenticity probabilities)',
  aiClass:'AI class',photoClass:'photographic class',
  warning:'Metadata and model scores can be incorrect or manipulated.',
  unvalidated:'This model has produced false positives on genuine phone photos. Its raw scores are intentionally hidden until independent validation.',
  modelUnavailable:'Detector unavailable: ',
  copied:'Copied!',copyError:'Copy unavailable in this browser'
 },
 it:{
  headline:'Ogni file ha una storia. Troviamo le prove.',
  intro:'Analisi preliminare locale di foto e video. Distinguiamo dati verificabili da ipotesi.',
  upload:'Seleziona una foto o un video',formats:'File supportati dal browser',report:'RAPPORTO FORENSE',
  copy:'Copia rapporto',c2pa:'Content Credentials (C2PA) · sperimentale',
  c2padesc:'Lettura locale facoltativa. La firma e la catena di fiducia non sono ancora verificate.',
  c2pabutton:'Esamina credenziali C2PA',ai:'AI Vision — esperimento facoltativo',
  aidesc:'Scarica un modello sperimentale e analizza l’immagine sul dispositivo. I punteggi NON sono probabilità affidabili né prove di autenticità. Può essere lento o non funzionare su alcuni telefoni. Richiede Internet al primo utilizzo.',
  aibutton:'Prova rilevatore AI sperimentale',
  footer:'Privacy first · Il file non viene caricato sui nostri server. Il classificatore AI è sperimentale e non identifica con certezza contenuti sintetici, generatori o modifiche. L’assenza di metadati non prova autenticità.',
  loading:'Analisi in corso…',done:'Analisi preliminare completata. Per una stima AI sperimentale, premi il pulsante qui sotto.',
  doneVideo:'Analisi preliminare completata. Rilevatore AI sperimentale disponibile solo per le immagini.',
  pending:'Analisi preliminare: origine non determinata. Usa il pulsante sperimentale qui sotto.',
  aiLoading:'Caricamento del modello ed elaborazione sul dispositivo…',
  uncertain:'Origine non determinabile: classificazione sperimentale non convalidata.',
  conflict:'Risultati discordanti: il modello segnala la classe AI, ma il file contiene metadati fotografici. Origine non determinabile.',
  modelResult:'Risultato del modello sperimentale',scores:'Score grezzi non calibrati (NON probabilità di autenticità)',
  aiClass:'classe AI',photoClass:'classe fotografica',
  warning:'Metadati e punteggi possono essere errati o manipolati.',
  unvalidated:'Questo modello ha prodotto falsi positivi su foto autentiche da smartphone. I punteggi grezzi sono nascosti fino a una validazione indipendente.',
  modelUnavailable:'Rilevatore non disponibile: ',
  copied:'Copiato!',copyError:'Copia non disponibile in questo browser'
 }
};
function tl(key){return (TL_COPY[tlLanguage]||TL_COPY.en)[key]||key}
function tlSetLanguage(lang){if(!TL_COPY[lang])return;try{localStorage.setItem(TL_LANG_KEY,lang)}catch{}location.reload()}
function tlApplyStatic(){
 document.documentElement.lang=tlLanguage;
 const pairs=[
 ['h2','headline'],['main > p.muted','intro'],['.upload h3','upload'],['.upload span','formats'],
 ['#result > .tag','report'],['#copy','copy'],
 ['#result > .status:nth-of-type(2) strong','c2pa'],
 ['#c2pa-test','c2pabutton'],['#ai-test','aibutton'],['footer','footer']
 ];
 for(const [selector,key] of pairs){const node=document.querySelector(selector);if(node)node.textContent=tl(key)}
 const boxes=document.querySelectorAll('#result > .status');
 if(boxes[1]){const p=boxes[1].querySelector('p.muted');if(p)p.textContent=tl('c2padesc');}
 if(boxes[2]){const h=boxes[2].querySelector('strong'),p=boxes[2].querySelector('p.muted');if(h)h.textContent=tl('ai');if(p)p.textContent=tl('aidesc')}
 const select=document.querySelector('#tl-language');if(select)select.value=tlLanguage;
}
document.addEventListener('DOMContentLoaded',tlApplyStatic);
