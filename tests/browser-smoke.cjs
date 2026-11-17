const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'load'});
  assert.equal(await page.locator('#file').isVisible(),true,'file picker visible');
  assert.equal(await page.locator('#ai-test').isVisible(),true,'AI detector section visible');
  assert.equal(await page.locator('#c2pa-test').isVisible(),true,'C2PA section visible');
  await page.locator('#file').setInputFiles({
   name:'sample.png',mimeType:'image/png',
   buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9z1QsAAAAASUVORK5CYII=','base64')
  });
  await page.locator('#copy').waitFor({state:'visible'});
  await page.waitForFunction(()=>!document.querySelector('#copy').disabled,{timeout:20000});
  assert.match(await page.locator('#details').innerText(),/Tipo MIME/);
  assert.equal(await page.locator('#ai-test').isEnabled(),true,'AI detector enabled after image selection');
  assert.equal(await page.locator('#c2pa-test').isEnabled(),true,'C2PA enabled after image selection');
  assert.match(await page.locator('#upload-status').innerText(),/Analisi completata/);
  assert.equal(await page.locator('#preview img').count(),1,'image preview displayed');
  assert.equal(errors.length,0,'Browser JavaScript errors: '+errors.join('; '));
  console.log('Browser smoke test passed: upload, analysis, UI and JavaScript');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
