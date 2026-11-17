// Origin Trace: inspect declared software clues, never claim verified attribution.
// Metadata is user-editable. C2PA validation is not implemented.
function originTrace(entries) {
 const values=entries.filter(([key])=>/software|commento|png:|modello/i.test(key))
   .map(([key,value])=>({key,value:String(value).slice(0,1000)}));
 const patterns=[
  ['Stable Diffusion / ecosystem',/stable diffusion|automatic1111|comfyui|invokeai|fooocus|negative prompt|cfg scale|sampler:/i],
  ['Midjourney',/midjourney/i],
  ['Adobe Firefly',/adobe firefly|firefly image/i],
  ['OpenAI / DALL-E',/dall[\s·-]*e|openai image/i],
  ['FLUX',/\bflux(?:\.1|\.2|\s+dev|\s+schnell)\b/i],
  ['Photoshop (editing software)',/adobe photoshop|photoshop/i],
  ['GIMP (editing software)',/\bgimp\b/i],
  ['Google Gemini / Imagen / Veo',/\b(?:google\s+)?(?:gemini|imagen\s*\d*|veo\s*\d+(?:\.\d+)?)\b/i],
  ['Kling AI',/\bkling(?:\s*ai)?(?:\s*[34](?:\.\d+)?)?\b/i],
  ['Seedance',/\bseedance(?:\s*\d+(?:\.\d+)?)?\b/i],
  ['OpenAI Sora',/\bsora(?:\s*\d+(?:\.\d+)?)?\b/i],
  ['Wan video models',/\bwan\s*(?:2(?:\.\d+)?|ai)\b/i],
  ['MiniMax / Hailuo',/\bminimax\b|\bhailuo\b/i],
  ['Luma Ray / Dream Machine',/\bluma\s*(?:ai|ray|dream machine)\b|\bray\s*3\b/i],
  ['Krea (platform)',/\bkrea(?:\s*ai)?\b/i],
  ['Creen AI (platform)',/\bcreen\s*ai\b/i]
 ];
 const found=[];
 for(const {key,value} of values){
  for(const [name,pattern] of patterns){
   if(pattern.test(value)&&!found.some(x=>x.name===name))found.push({name,source:key});
  }
 }
 return found;
}
