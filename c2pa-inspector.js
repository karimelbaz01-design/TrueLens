// Optional, local C2PA inspection. No trust anchors are configured.
// A manifest's presence is not proof of authenticity or trusted identity.
function c2paValidationLabel(state){
 const normalized=typeof state==='string'?state.trim().toLowerCase():'';
 if(normalized==='invalid')return 'invalid';
 if(normalized==='valid')return 'valid-untrusted';
 return 'unknown';
}
function c2paSummarizeStore(store){
 if(!store||typeof store!=='object')return {status:'absent'};
 const active=store.active_manifest||store.activeManifest||'';
 const manifests=store.manifests||{};
 const manifest=manifests[active]||{};
 // SDK versions differ. If no explicit validation state is provided, do not infer one.
 const state=store.validation_state??store.validationState??null;
 const errors=Array.isArray(store.validation_status)?store.validation_status:
              Array.isArray(store.validationStatus)?store.validationStatus:[];
 const hasIssues=errors.some(item=>item&&typeof item==='object'&&
  (String(item.code||'').toLowerCase().includes('failure')||
   String(item.code||'').toLowerCase().includes('mismatch')||
   String(item.code||'').toLowerCase().includes('error')));
 return {
  status:'present',active:String(active),title:String(manifest.title||''),
  claimGenerator:String(manifest.claim_generator||''),
  validationState:hasIssues?'invalid':c2paValidationLabel(state),
  diagnosticCount:errors.length
 };
}
let c2paRuntime;
async function inspectC2pa(file){
 if(!file||typeof file.size!=='number')throw Error('File non valido.');
 if(file.size>1024*1024*1024)throw Error('File oltre il limite di 1 GiB del lettore C2PA.');
 if(!c2paRuntime){
  c2paRuntime=import('https://esm.sh/@contentauth/c2pa-web@0.15.4/inline')
   .then(async ({createC2pa,Reader})=>({sdk:await createC2pa(),Reader}))
   .catch(e=>{c2paRuntime=null;throw e;});
 }
 const {sdk,Reader}=await c2paRuntime;
 const reader=await Reader.fromBlob(sdk,file.type||undefined,file);
 if(!reader)return {status:'absent'};
 try{return c2paSummarizeStore(await reader.manifestStore());}
 finally{await reader.free();}
}
