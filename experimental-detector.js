// Experimental on-device classifier. Never present raw model scores as calibrated probabilities.
// Model files and JS runtime are downloaded from third parties on first use.
const EXPERIMENTAL_MODEL='onnx-community/ai-image-detection-ONNX';
let experimentalPipelinePromise=null;
async function runExperimentalDetector(file) {
 if(!file||!file.type.startsWith('image/'))throw Error('Seleziona una immagine.');
 if(file.size>20*1024*1024)throw Error('Immagine troppo grande per il test sperimentale (max 20 MiB).');
 if(!experimentalPipelinePromise){
  experimentalPipelinePromise=import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1')
   .then(({pipeline,env})=>{
    env.allowLocalModels=false;
    return pipeline('image-classification',EXPERIMENTAL_MODEL,{device:'wasm'});
   }).catch(e=>{experimentalPipelinePromise=null;throw e;});
 }
 const classifier=await experimentalPipelinePromise;
 const blobUrl=URL.createObjectURL(file);
 try{
  const output=await classifier(blobUrl,{top_k:2});
  if(!Array.isArray(output)||!output.length)throw Error('Il modello non ha restituito risultati.');
  return output.map(x=>({label:String(x.label),score:Number(x.score)}));
 }finally{URL.revokeObjectURL(blobUrl);}
}
