// AI Vision 2: evaluation utilities. A model cannot be enabled until independently validated.
// Labels: 1 = AI-generated, 0 = camera/other real-world capture.
// Scores must be probabilities for the AI-generated class, in [0,1].
function evaluateDetector(samples, threshold=0.5) {
 if(!Array.isArray(samples)||!samples.length)throw Error('Dataset vuoto');
 if(!Number.isFinite(threshold)||threshold<0||threshold>1)throw Error('Soglia non valida');
 let tp=0,tn=0,fp=0,fn=0;
 for(const item of samples){
  if(!item||![0,1].includes(item.label)||typeof item.score!=='number'||!Number.isFinite(item.score)||item.score<0||item.score>1)throw Error('Campione non valido');
  const predicted=item.score>=threshold?1:0;
  if(predicted===1&&item.label===1)tp++;
  else if(predicted===0&&item.label===0)tn++;
  else if(predicted===1)fp++;
  else fn++;
 }
 const safe=(n,d)=>d?n/d:null;
 return {n:samples.length,threshold,tp,tn,fp,fn,
  precision:safe(tp,tp+fp),recall:safe(tp,tp+fn),
  specificity:safe(tn,tn+fp),accuracy:safe(tp+tn,samples.length),
  falsePositiveRate:safe(fp,fp+tn),falseNegativeRate:safe(fn,fn+tp)};
}
function canEnableDetector(manifest) {
 // Never present model results as calibrated without evidence.
 return !!(manifest&&manifest.validated===true&&
  typeof manifest.modelId==='string'&&manifest.modelId.length>0&&
  Number.isInteger(manifest.evaluationSize)&&manifest.evaluationSize>=100&&
  Number.isFinite(manifest.falsePositiveRate)&&manifest.falsePositiveRate>=0&&manifest.falsePositiveRate<=1&&
  Number.isFinite(manifest.falseNegativeRate)&&manifest.falseNegativeRate>=0&&manifest.falseNegativeRate<=1);
}
