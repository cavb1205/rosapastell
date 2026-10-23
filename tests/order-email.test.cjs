const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
test('retail order receipt never claims an unpaid order was paid',()=>{
  const exports={};
  const source=ts.transpileModule(fs.readFileSync('src/lib/email-templates.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(source,{exports,require:(id)=>id.endsWith('constants')?{SITE_NAME:'Synthetic QA',SITE_URL:'https://example.invalid',WHATSAPP_URL:'https://example.invalid/contact'}:{formatPrice:String}});
  const email=exports.orderConfirmationHtml({orderNumber:1,firstName:'QA',items:[],subtotal:100,total:100,city:'QA',address:'QA',paymentMethod:'wompi'});
  assert.match(email,/pendiente de pago/);assert.doesNotMatch(email,/pago fue procesado exitosamente|Pronto prepararemos tu envío/);
});
