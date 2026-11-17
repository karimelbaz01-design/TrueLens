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
  console.log('AI inference integration mock passed');
})().catch(e=>{console.error(e);process.exitCode=1});
