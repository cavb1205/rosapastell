/* eslint-disable @typescript-eslint/no-require-imports -- Node test harness. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

exports.harness = function harness(bindings = {}, overrides = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    function localRequire(id) {
      if (id in overrides) return overrides[id];
      if (id.startsWith('@/')) return load('src/' + id.slice(2) + '.ts');
      if (id.startsWith('.')) return load(path.resolve(path.dirname(file), id + '.ts'));
      return require(id);
    }
    vm.runInNewContext(source, { exports, require: localRequire, Buffer, Headers, URL, URLSearchParams, Response, console, setTimeout,
      process: { env: { WOOCOMMERCE_URL: 'https://example.invalid', WOOCOMMERCE_CONSUMER_KEY: 'synthetic', WOOCOMMERCE_CONSUMER_SECRET: 'synthetic' } },
      fetch: async () => { throw new Error('Unexpected network in test'); }, ...bindings,
    });
    return exports;
  }
  return load;
};
