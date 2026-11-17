const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync('experimental-detector.js','utf8'),ctx);
function test(values){ctx.values=values;return vm.runInContext('interpretAiScores(values)',ctx);}
assert.match(test([{label:'FAKE',score:.94},{label:'REAL',score:.06}]).label,/AI/);
assert.match(test([{label:'FAKE',score:.1},{label:'REAL',score:.9}]).label,/fotografica/);
assert.equal(test([{label:'FAKE',score:.55},{label:'REAL',score:.45}]).label,'Risultato incerto');
assert.equal(test([{label:'FAKE',score:.95},{label:'REAL',score:.05}]).verified,false);
assert.equal(test([{label:'FAKE',score:.95},{label:'REAL',score:.05}]).calibrated,false);
assert.throws(()=>test([{label:'FAKE',score:.9}]));
assert.throws(()=>test([{label:'FAKE',score:1.2},{label:'REAL',score:-.2}]));
assert.throws(()=>test([{label:'FAKE',score:.8},{label:'REAL',score:.8}]));
assert.throws(()=>test([{label:'CAT',score:.8},{label:'DOG',score:.2}]));
console.log('Experimental AI score interpretation tests passed');
