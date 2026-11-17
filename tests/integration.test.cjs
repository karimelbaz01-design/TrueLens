const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('app.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const scripts=[...html.matchAll(/<script\s+src="\.\/([^"]+)"/g)].map(m=>m[1]);
assert.ok(scripts.includes('app.js'),'app.js must load');
assert.ok(scripts.includes('c2pa-inspector.js'),'C2PA script must load');
assert.ok(scripts.indexOf('c2pa-inspector.js')<scripts.indexOf('app.js'),'C2PA must load before app');
for(const path of scripts){
 assert.ok(fs.existsSync(path),'missing script: '+path);
 assert.ok(sw.includes("'./"+path+"'"),'service worker cache missing '+path);
}
for(const id of ['file','preview','result','details','copy','ai-test','ai-output','c2pa-test','c2pa-output']){
 assert.ok(html.includes('id="'+id+'"'),'missing UI element '+id);
}
assert.ok(!js.includes('};\\ncopyButton'),'literal escaped newline must not break app');
assert.ok(js.includes('Produttore|Modello'),'camera conflict detection must recognize actual EXIF labels');
assert.ok(js.includes('Origine non determinabile: classificazione sperimentale non convalidata.'),'unvalidated model must not produce definitive verdict');
console.log('HTML, scripts, UI and cache integration checks passed');
