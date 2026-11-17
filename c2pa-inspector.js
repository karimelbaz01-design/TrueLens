// Optional Content Credentials inspection. Trust validation is not configured.
// A parsed manifest is NOT proof that the signer is trusted.
let c2paRuntime;
async function inspectC2pa(file){
 if(!c2paRuntime){
  c2paRuntime=import('https://esm.sh/@contentauth/c2pa-web@0.15.4/inline')
   .then(async m=>({sdk:await m.createC2pa(),Reader:m.Reader}))
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
  return {status:'present',active:String(active),title:String(manifest.title||''),claimGenerator:String(manifest.claim_generator||''),validationStatus:store.validation_status||store.validationStatus||null};
 }finally{await reader.free();}
}
