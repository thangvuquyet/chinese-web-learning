const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadApp(root, pick) {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const files = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(pick);
  const store = {};
  const sandbox = {
    console,
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
    navigator: { userAgent: 'node' },
    document: { createElement: () => ({}), getElementById: () => null },
    matchMedia: () => ({ matches: false, addEventListener() {} })
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f });
  const get = name => vm.runInContext('typeof ' + name + " !== 'undefined' ? " + name + ' : undefined', sandbox);
  return { get, sandbox, files };
}

module.exports = { loadApp };
