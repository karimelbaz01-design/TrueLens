const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('experimental-detector.js','utf8');
const ctx=vm.createContext({
  Map,Error,Number,String,Math,Promise,
  createImageBitmap:async()=>({width:2000,height:1000,close(){ctx.closed=true}}),
  document:{createElement(tag){
    assert.equal(tag,'canvas');
    return {width:0,height:0,getContext(){
      return {drawImage(_img,_x,_y,w,h){ctx.drawn=[w,h]}};
    },toBlob(callback){callback({type:'image/png'})}};
  }},
  URL,
});
vm.runInContext(source,ctx);
(async()=>{
  ctx.decodeAiInput=async()=>({width:2000,height:1000,draw(_ctx,w,h){ctx.drawn=[w,h]},close(){ctx.closed=true}});
  ctx.mockPipeline=Promise.resolve({
    RawImage:{fromBlob:async(blob)=>{assert.equal(blob.type,'image/png');return {pixels:true}}},
    classifier:async(img)=>{assert.equal(img.pixels,true);return [{label:'FAKE',score:.92},{label:'REAL',score:.08}]}
  });
  vm.runInContext('experimentalPipelinePromise=mockPipeline',ctx);
  ctx.file={type:'image/png',size:1024};
  const result=await vm.runInContext('runExperimentalDetector(file)',ctx);
  assert.equal(result.verified,false);
  assert.equal(result.calibrated,false);
  assert.equal(result.fakeScore,.92);
  assert.equal(ctx.drawn[0],1024);
  assert.equal(ctx.drawn[1],512);
  assert.equal(ctx.closed,true);
  ctx.closed=false;
  ctx.decodeAiInput=async()=>({width:0,height:100,draw(){throw Error('Should not draw')},close(){ctx.closed=true}});
  await assert.rejects(vm.runInContext('runExperimentalDetector(file)',ctx),/Dimensioni immagine non valide/);
  assert.equal(ctx.closed,true,'Decoded image resources must be closed on validation error');
  ctx.decodeAiInput=async()=>({width:100,height:100,draw(){throw Error('Canvas drawing failed')},close(){ctx.closed=true}});
  ctx.closed=false;
  await assert.rejects(vm.runInContext('runExperimentalDetector(file)',ctx),/Canvas drawing failed/);
  assert.equal(ctx.closed,true,'Decoded image resources must be closed on canvas error');
  console.log('AI inference integration mock passed, including failure cleanup');
})().catch(e=>{console.error(e);process.exitCode=1});
