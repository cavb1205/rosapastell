/* eslint-disable @typescript-eslint/no-require-imports -- Node test runner CJS harness. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const crypto = require('node:crypto');

function load(file, bindings = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  vm.runInNewContext(source, {
    exports, Buffer, URLSearchParams, URL, console,
    process: { env: {
      WOOCOMMERCE_URL: 'https://example.invalid',
      WOOCOMMERCE_CONSUMER_KEY: 'synthetic-key',
      WOOCOMMERCE_CONSUMER_SECRET: 'synthetic-secret',
      WOOCOMMERCE_WEBHOOK_SECRET: 'synthetic-webhook',
    } },
    ...bindings,
  });
  return exports;
}

function wooHarness() {
  const calls = [];
  const cache = load('src/lib/catalog-cache.ts');
  const woo = load('src/lib/woocommerce.ts', {
    require: id => id.endsWith('catalog-cache') ? cache : { WHOLESALE_ROLES: ['mayorista'] },
    fetch: async (url, options) => {
      calls.push({ url, options });
      return { ok: true, headers: new Headers({ 'x-wp-totalpages': '1', 'x-wp-total': '1' }),
        json: async () => url.includes('store-status') ? { paused: true, message: 'QA' } : [{ id: 1 }] };
    },
  });
  return { woo, calls };
}

test('public catalog reads have bounded revalidation and invalidation tags', async () => {
  const { woo, calls } = wooHarness();
  await woo.getProducts({ orderby: 'date', order: 'desc' });
  await woo.getProductBySlug('qa');
  await woo.getProductVariations(1);
  await woo.getCategories();
  await woo.getCategoryBySlug('qa');
  assert.equal(calls.length, 5);
  for (const [index, { url, options }] of calls.entries()) {
    assert.equal(options.next.revalidate, index < 3 ? 30 : 60);
    assert.equal(options.next.tags[0], index < 3 ? 'catalog-products' : 'catalog-categories');
    assert.equal(options.cache, undefined);
    assert.ok(options.headers.Authorization.startsWith('Basic '));
    assert.ok(!url.includes('synthetic-secret'));
  }
  assert.match(calls[0].url, /orderby=date&order=desc/);
});

test('order reads and mutations never inherit the catalog cache', async () => {
  const { woo, calls } = wooHarness();
  await woo.getOrder(1, true);
  await woo.createOrder({ line_items: [] }, 'qa-idempotency');
  await woo.getPaymentReadiness(1, 'qa-order-key');
  await woo.applyWompiPayment(1, { status: 'APPROVED' });
  await woo.updateOrderStatus(1, 'pending');
  await woo.updateOrder(1, { status: 'pending' });
  for (const { options } of calls) {
    assert.equal(options.next, undefined);
    assert.notEqual(options.cache, 'force-cache');
  }
  assert.equal(calls[0].options.cache, 'no-store');
  assert.equal(calls[1].options.headers['X-RP-Checkout-Key'], 'qa-idempotency');
  assert.equal(calls[2].options.cache, 'no-store');
  assert.equal(calls[3].options.cache, 'no-store');
});

test('checkout always obtains a fresh store pause status', async () => {
  const { woo, calls } = wooHarness();
  assert.equal((await woo.getStoreStatus({ fresh: true })).paused, true);
  assert.equal(calls[0].options.cache, 'no-store');
  assert.equal(calls[0].options.next, undefined);
});

test('webhook invalidation expires both public catalog caches immediately', () => {
  const calls = [];
  const cache = load('src/lib/catalog-cache.ts');
  const { revalidateCatalogData } = load('src/lib/catalog-revalidation.ts', {
    require: id => id === 'next/cache' ? { revalidateTag: (...args) => calls.push(args) } : cache,
  });
  revalidateCatalogData();
  assert.equal(JSON.stringify(calls), JSON.stringify([
    ['catalog-products', { expire: 0 }], ['catalog-categories', { expire: 0 }],
  ]));
});

test('active order webhook invalidates stock even without email or on repeated status', async () => {
  let invalidations = 0;
  let emails = 0;
  const { POST } = load('src/app/api/webhooks/woocommerce/route.ts', {
    setInterval: () => {},
    require: id => {
      if (id === 'next/server') return { NextResponse: Response };
      if (id === 'crypto') return crypto;
      if (id.endsWith('catalog-revalidation')) return { revalidateCatalogData: () => invalidations++ };
      if (id.endsWith('/email')) return { sendEmail: async () => emails++ };
      if (id.endsWith('formatters')) return { formatPrice: String };
      return {};
    },
  });
  const raw = JSON.stringify({ id: 1, number: '1', status: 'pending', total: '1', billing: { email: 'qa@example.invalid' }, shipping: {} });
  const request = () => ({ text: async () => raw, nextUrl: new URL('https://example.invalid'), headers: new Headers({
    'x-wc-webhook-topic': 'order.updated',
    'x-wc-webhook-signature': crypto.createHmac('sha256', 'synthetic-webhook').update(raw).digest('base64'),
  }) });
  assert.equal((await POST(request())).status, 200);
  assert.equal((await POST(request())).status, 200);
  assert.equal(invalidations, 2);
  assert.equal(emails, 0);
  const unsigned = request();
  unsigned.headers.delete('x-wc-webhook-signature');
  assert.equal((await POST(unsigned)).status, 401);
  assert.equal(invalidations, 2);
});

test('catalog links suppress viewport prefetch and show accessible pending feedback', () => {
  const { CatalogLink } = load('src/components/catalog/CatalogLink.tsx', {
    require: id => id === 'react/jsx-runtime'
      ? { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) }
      : { __esModule: true, default: 'Link', useLinkStatus: () => ({ pending: true }) },
  });
  const link = CatalogLink({ href: '/producto/qa', children: 'QA', prefetch: true });
  assert.equal(link.props.prefetch, false);
  assert.equal(link.props.href, '/producto/qa');
  const hint = link.props.children[1].type();
  assert.equal(hint.props.role, 'status');
  assert.equal(hint.props['aria-hidden'], false);
  assert.equal(hint.props.children.props.children, 'Cargando…');
});
