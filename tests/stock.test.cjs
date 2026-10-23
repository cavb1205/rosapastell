const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./ts-harness.cjs');

function load(fetch) {
  return harness({ fetch })('src/lib/stock.ts');
}
const item = { product_id: 1, quantity: 1 };
const row = { id: 1, stock_status: 'instock', stock_quantity: 1, manage_stock: true, backorders_allowed: false };
for (const [name, fetch] of [
  ['HTTP failure', async () => ({ ok: false })],
  ['network failure', async () => { throw new Error('offline'); }],
  ['malformed JSON', async () => ({ ok: true, json: async () => { throw new Error('invalid'); } })],
  ['missing product', async () => ({ ok: true, json: async () => [] })],
  ['invalid response shape', async () => ({ ok: true, json: async () => ({}) })],
  ['unknown quantity for managed stock', async () => ({ ok: true, json: async () => [{ ...row, stock_quantity: null }] })],
  ['unknown stock management policy', async () => ({ ok: true, json: async () => [{ ...row, manage_stock: undefined }] })],
]) test(`fails closed: ${name}`, async () => {
  const { findInsufficientStock, StockValidationError } = load(fetch);
  await assert.rejects(findInsufficientStock([item]), StockValidationError);
});
test('available physical stock remains an early check, not a reservation', async () => {
  const { findInsufficientStock } = load(async () => ({ ok: true, json: async () => [row] }));
  assert.equal((await findInsufficientStock([item])).length, 0);
});
test('duplicate lines are aggregated instead of each spending the same unit', async () => {
  const { findInsufficientStock } = load(async () => ({ ok: true, json: async () => [row] }));
  assert.equal((await findInsufficientStock([item, item])).length, 2);
});
test('out of stock is rejected', async () => {
  const { findInsufficientStock } = load(async () => ({ ok: true, json: async () => [{ ...row, stock_status: 'outofstock', stock_quantity: 0 }] }));
  assert.equal((await findInsufficientStock([item])).length, 1);
});
test('explicit owner backorders policy is respected', async () => {
  const { findInsufficientStock } = load(async () => ({ ok: true, json: async () => [{ ...row, stock_status: 'onbackorder', stock_quantity: 0, backorders_allowed: true }] }));
  assert.equal((await findInsufficientStock([item])).length, 0);
});
test('missing one requested variation is not accepted', async () => {
  const { findInsufficientStock, StockValidationError } = load(async () => ({ ok: true, json: async () => [{ ...row, id: 10 }] }));
  await assert.rejects(findInsufficientStock([{ ...item, variation_id: 10 }, { ...item, variation_id: 11 }]), StockValidationError);
});
test('inherited parent stock is left for the atomic backend aggregation',async()=>{
  const {findInsufficientStock}=load(async()=>({ok:true,json:async()=>[{...row,manage_stock:'parent',stock_quantity:null}]}));
  assert.equal((await findInsufficientStock([item])).length,0);
});
