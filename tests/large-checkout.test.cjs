/* eslint-disable @typescript-eslint/no-require-imports -- Node test runner. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { harness } = require('./ts-harness.cjs');
const address = { first_name: 'Prueba', last_name: 'Sintetica', email: 'qa@example.invalid', phone: '3000000000', address_1: 'Direccion prueba 123', city: 'Ibague', state: 'Tolima', country: 'CO' };
function payload(count) {
  return { payment_method: 'whatsapp', payment_method_title: 'Transferencia / WhatsApp', set_paid: false, status: 'on-hold', billing: { ...address }, shipping: { ...address }, line_items: Array.from({ length: count }, (_, i) => ({ product_id: i + 1, quantity: 1 })) };
}
const stockRow = id => ({ id, stock_status: 'instock', stock_quantity: 10, manage_stock: true, backorders_allowed: false });

test('51, 100 and 200 checkout lines are accepted; 201 has an actionable error', () => {
  const load = harness();
  const { orderSchema } = load('src/lib/validations.ts');
  const { orderValidationMessage } = load('src/lib/order-validation.ts');
  for (const count of [1, 50, 51, 100, 200]) assert.equal(orderSchema.safeParse(payload(count)).success, true);
  const result = orderSchema.safeParse(payload(201));
  assert.equal(result.success, false);
  assert.match(orderValidationMessage(result.error), /200 combinaciones/);
});

test('errors identify fields and item quantity without echoing customer data', () => {
  const load = harness();
  const { orderSchema } = load('src/lib/validations.ts');
  const { orderValidationMessage } = load('src/lib/order-validation.ts');
  for (const [mutate, pattern] of [
    [p => p.billing.email = 'private-invalid-email', /correo electrónico/],
    [p => p.shipping.address_1 = '', /dirección/],
    [p => p.customer_note = 'x'.repeat(501), /500 caracteres/],
    [p => p.line_items[1].quantity = 100, /artículo 2.*1 y 99/],
    [p => p.line_items[1].quantity = 0, /artículo 2/],
  ]) {
    const p = payload(2); mutate(p);
    const result = orderSchema.safeParse(p); assert.equal(result.success, false);
    const message = orderValidationMessage(result.error);
    assert.match(message, pattern); assert.doesNotMatch(message, /private-invalid-email/);
  }
});

test('200 simple products and 200 variations are fully checked in two batches, without cache', async () => {
  for (const variable of [false, true]) {
    const calls = [];
    const load = harness({ fetch: async (url, options) => {
      const ids = new URL(url).searchParams.get('include').split(',').map(Number);
      calls.push({ ids, options });
      return { ok: true, json: async () => ids.map(stockRow) };
    } });
    const items = payload(200).line_items.map(i => variable ? { product_id: 999, variation_id: i.product_id, quantity: 1 } : i);
    assert.equal((await load('src/lib/stock.ts').findInsufficientStock(items)).length, 0);
    assert.equal(calls.length, 2);
    assert.equal(calls.flatMap(c => c.ids).length, 200);
    for (const call of calls) { assert.ok(call.ids.length <= 100); assert.equal(call.options.cache, 'no-store'); }
  }
});

test('a missing product in the second batch fails closed', async () => {
  const load = harness({ fetch: async url => {
    const ids = new URL(url).searchParams.get('include').split(',').map(Number).filter(id => id !== 200);
    return { ok: true, json: async () => ids.map(stockRow) };
  } });
  const { findInsufficientStock, StockValidationError } = load('src/lib/stock.ts');
  await assert.rejects(findInsufficientStock(payload(200).line_items), StockValidationError);
});

test('out of stock in the second batch is reported at the correct cart index', async () => {
  const load = harness({ fetch: async url => {
    const ids = new URL(url).searchParams.get('include').split(',').map(Number);
    return { ok: true, json: async () => ids.map(id => id === 150 ? { ...stockRow(id), stock_status: 'outofstock', stock_quantity: 0 } : stockRow(id)) };
  } });
  assert.equal(JSON.stringify(await load('src/lib/stock.ts').findInsufficientStock(payload(200).line_items)), '[149]');
});

test('mixed variation parents have at most two active upstream requests', async () => {
  let active = 0, peak = 0;
  const load = harness({ fetch: async url => {
    peak = Math.max(peak, ++active);
    await new Promise(resolve => setTimeout(resolve, 2));
    active--;
    const ids = new URL(url).searchParams.get('include').split(',').map(Number);
    return { ok: true, json: async () => ids.map(stockRow) };
  } });
  const items = payload(40).line_items.map(i => ({ ...i, variation_id: i.product_id + 1000 }));
  assert.equal((await load('src/lib/stock.ts').findInsufficientStock(items)).length, 0);
  assert.equal(peak, 2);
});

test('200 wholesale lines resolve fresh prices in two requests, not 200', async () => {
  let calls = 0;
  const load = harness({ fetch: async (url, options) => {
    calls++; assert.equal(options.cache, 'no-store');
    const ids = new URL(url).searchParams.get('include').split(',').map(Number);
    return { ok: true, json: async () => ids.map(id => ({ id, price: '60000', regular_price: '60000', meta_data: [{ key: '_role_based_price', value: { mayorista: { regular_price: '42000' } } }] })) };
  } });
  const rows = await load('src/lib/wholesale-checkout.ts').resolveWholesalePrices(payload(200).line_items);
  assert.equal(calls, 2); assert.equal(rows.length, 200);
  assert.equal(rows[199].total, '42000.00'); assert.equal(rows[199].subtotal, '60000.00');
});

test('missing wholesale prices response is not accepted as a successful checkout', async () => {
  const load = harness({ fetch: async () => ({ ok: true, json: async () => [] }) });
  await assert.rejects(load('src/lib/wholesale-checkout.ts').resolveWholesalePrices(payload(51).line_items));
});

test('backend and frontend cart limits match', () => {
  const { MAX_CART_LINES } = harness()('src/lib/checkout-limits.ts');
  const php = fs.readFileSync('wordpress/rosapastell-stock-guard.php', 'utf8');
  assert.equal(Number(php.match(/MAX_CART_LINES = (\d+)/)[1]), MAX_CART_LINES);
  assert.match(php, /ksort\(\$required, SORT_NUMERIC\)/);
  assert.match(php, /wc_reserve_stock_for_order\(\$order\)/);
  assert.match(php, /START TRANSACTION/);
});

function routeHarness({ rejectStock = false } = {}) {
  let created = 0, reads = 0;
  const warnings = [];
  const overrides = {
    'next/server': { NextResponse: Response },
    '@/lib/auth': { getUserFromCookie: async () => ({ id: 123, isWholesale: true }), AUTH_COOKIE_NAME: 'qa-auth' },
    '@/lib/rate-limit': { rateLimit: () => null },
    '@/lib/email': { sendEmail: async () => { throw new Error('No email allowed in synthetic test'); } },
    '@/lib/email-templates': { orderConfirmationHtml: () => '' },
  };
  const load = harness({ console: { warn: (...v) => warnings.push(v), error: () => {} }, fetch: async url => {
    reads++;
    const ids = new URL(url).searchParams.get('include').split(',').map(Number);
    return { ok: true, json: async () => ids.map(id => ({ ...stockRow(id), price: '60000', regular_price: '60000', meta_data: [{ key: '_role_based_price', value: { mayorista: { regular_price: '42000' } } }] })) };
  } }, overrides);
  const woo = load('src/lib/woocommerce.ts');
  overrides['@/lib/woocommerce'] = { ...woo, getStoreStatus: async () => ({ paused: false }), createOrder: async data => {
    created++;
    if (rejectStock) throw new woo.WooCommerceError('rp_insufficient_stock', 'Sin unidades disponibles', 409);
    return { id: 999, number: 'QA', billing: {}, ...data };
  } };
  const { POST } = load('src/app/api/orders/route.ts');
  const submit = body => POST({ json: async () => body, headers: new Headers({ 'Idempotency-Key': 'synthetic-checkout-123456' }), cookies: { has: () => false } });
  return { submit, created: () => created, reads: () => reads, warnings };
}

test('full handler accepts a 200-line wholesale request with four bounded fresh reads', async () => {
  const h = routeHarness();
  const response = await h.submit(payload(200));
  assert.equal(response.status, 201);
  const order = await response.json();
  assert.equal(order.line_items.length, 200);
  assert.equal(order.line_items[199].total, '42000.00');
  assert.equal(order.status, 'on-hold'); assert.equal(order.set_paid, false);
  assert.equal(h.created(), 1); assert.equal(h.reads(), 4);
});

test('invalid large request returns a specific error before stock reads or order creation', async () => {
  const h = routeHarness();
  const response = await h.submit(payload(201));
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /200 combinaciones/);
  assert.equal(h.created(), 0); assert.equal(h.reads(), 0);
  assert.doesNotMatch(JSON.stringify(h.warnings), /qa@example.invalid|Direccion prueba/);
});

test('native inventory rejection never becomes order success for a large cart', async () => {
  const h = routeHarness({ rejectStock: true });
  const response = await h.submit(payload(51));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).stockError, true);
});
