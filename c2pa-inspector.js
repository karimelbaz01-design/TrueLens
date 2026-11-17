// Optional C2PA reader. The SDK validates manifest structure/signature, but
// trust anchors are not configured here: never equate 'Valid' with 'Trusted'.
let c2paRuntime;
async function inspectC2pa(file){
 if(file.size>1024*1024*1024)throw Error('File oltre il limite di 1 GiB del lettore C2PA.');
 if(!c2paRuntime){
  c2paRuntime=import('https://esm.sh/@contentauth/c2pa-web@0.15.4/inline')
   .then(async ({createC2pa,Reader})=>({sdk:await createC2pa(),Reader}))
   .catch(e=>{c2paRuntime=null;throw e;});
 }
 const {sdk,Reader}=await c2paRuntime;
 const reader=await Reader.fromBlob(sdk,file.type||undefined,file);
 if(!reader)return {status:'absent'};
 try{
  const store=await reader.manifestStore();
  if(!store)return {status:'absent'};
  const active=store.active_manifest||store.activeManifest||'';
  const manifests=store.manifests||{};
  const manifest=manifests[active]||{};
  const state=store.validation_state||store.validationState||'Unknown';
  const status=state==='Invalid'?'invalid':state==='Valid'?'valid-untrusted':state==='Trusted'?'trusted':'unknown';
  return {status:'present',active:String(active),title:String(manifest.title||''),
   claimGenerator:String(manifest.claim_generator||''),validationState:status};
 }finally{await reader.free();}
}
