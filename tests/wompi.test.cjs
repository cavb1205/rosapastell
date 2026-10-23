const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(fetch, key = 'prv_test_synthetic_only') {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync('src/lib/wompi.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(source,{exports,fetch,process:{env:{WOMPI_PRIVATE_KEY:key}},AbortSignal});
  return exports.getVerifiedWompiTransaction;
}
const tx={id:'synthetic_tx',reference:'rp-1',status:'APPROVED',amount_in_cents:10000,currency:'COP'};
test('gateway verification requires a private key',async()=>{
  await assert.rejects(load(()=>assert.fail('must not fetch'),'')('synthetic_tx'));
});
test('gateway verification uses fixed sandbox origin, authorization and no cache',async()=>{
  const get=load(async(url,options)=>{
    assert.equal(url,'https://sandbox.wompi.co/v1/transactions/synthetic_tx');assert.equal(options.cache,'no-store');assert.equal(options.headers.Authorization,'Bearer prv_test_synthetic_only');
    return {ok:true,json:async()=>({data:tx})};
  });
  assert.equal((await get('synthetic_tx')).reference,'rp-1');
});
test('production key uses only the production gateway',async()=>{
  const get=load(async(url)=>{assert.match(url,/^https:\/\/production\.wompi\.co\/v1\/transactions\//);return {ok:true,json:async()=>({data:tx})};},'prv_prod_synthetic_only');
  assert.equal((await get('synthetic_tx')).id,tx.id);
});
for(const [label,fetch] of [
  ['HTTP error',async()=>({ok:false})],
  ['wrong transaction',async()=>({ok:true,json:async()=>({data:{...tx,id:'other'}})})],
  ['invalid amount',async()=>({ok:true,json:async()=>({data:{...tx,amount_in_cents:'10000'}})})],
  ['malformed response',async()=>({ok:true,json:async()=>null})],
]) test('gateway verification rejects '+label,async()=>assert.rejects(load(fetch)('synthetic_tx')));
