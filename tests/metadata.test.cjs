const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx=vm.createContext({TextDecoder,Uint8Array,DataView});
for(const file of ['metadata.js','png-metadata.js','origin-trace.js','signature.js','vision.js']){
 vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
}
const run=(s)=>vm.runInContext(s,ctx);
assert.equal(run("originTrace([['PNG: parameters','Steps: 25, CFG scale: 7']]).length"),1);
assert.equal(run("originTrace([['Dimensione','Stable Diffusion']]).length"),0);
assert.equal(run("originTrace([['PNG: Software','Adobe Photoshop']])[0].name"),'Photoshop (editing software)');
assert.equal(run("originTrace([['PNG: Comment','Midjourney']])[0].name"),'Midjourney');
assert.equal(run("inspectJpeg(new Uint8Array([0,1,2]).buffer).length"),0);
assert.equal(run("inspectPng(new Uint8Array([0,1,2]).buffer).length"),0);
const png=new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,10,0,0,0,20,8,2,0,0,0,0,0,0,0]);
ctx.sample=png.buffer;
assert.equal(run("inspectPng(sample)[0][1]"),'10 × 20');
assert.equal(run("inspectSignature(new Uint8Array([255,216,255,0]).buffer,'image/jpeg').match"),true);
assert.equal(run("inspectSignature(new Uint8Array([255,216,255,0]).buffer,'image/png').match"),false);
const pixels=new Uint8Array([0,0,0,255,255,255,255,255,0,0,0,255,255,255,255,255]);ctx.pixels=pixels;
assert.equal(run("measurePixels(pixels,2,2).brightness"),128);
assert.equal(run("measurePixels(pixels,2,2).contrast"),127.5);
console.log('TrueLens metadata and vision tests passed');
