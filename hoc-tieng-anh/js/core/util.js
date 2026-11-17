const U = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function h(tag, attrs, ...kids) {
    const m = tag.match(/^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i);
    const el = document.createElement((m && m[1]) || 'div');
    if (m && m[2]) m[2].replace(/([.#])([\w-]+)/g, (_, t, v) => { if (t === '.') el.classList.add(v); else el.id = v; });
    if (attrs != null && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') el.className += (el.className ? ' ' : '') + v;
        else if (k === 'style' && typeof v === 'object') { for (const [sk, sv] of Object.entries(v)) { if (sk.startsWith('--')) el.style.setProperty(sk, sv); else el.style[sk] = sv; } }
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      }
    }
    append(el, kids);
    return el;
  }
  function append(el, kids) {
    for (const k of kids) {
      if (k == null || k === false) continue;
      if (Array.isArray(k)) append(el, k);
      else if (k instanceof Node) el.appendChild(k);
      else el.appendChild(document.createTextNode(String(k)));
    }
  }
  function svgEl(markup) {
    const t = document.createElement('template');
    t.innerHTML = markup.trim();
    return t.content.firstChild;
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

  function hash(str) {
    let h1 = 0xdeadbeef ^ str.length, h2 = 0x41c6ce57 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0) * 4096 + (h1 >>> 0) % 4096;
  }
  function rng(seed) {
    let a = (typeof seed === 'string' ? hash(seed) : seed) >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, r = Math.random) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const pick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];
  const sample = (arr, n, r = Math.random) => shuffle(arr, r).slice(0, n);
  const uniq = arr => [...new Set(arr)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sleep = ms => new Promise(res => setTimeout(res, ms));
  const sum = arr => arr.reduce((a, b) => a + b, 0);
  const avg = arr => arr.length ? sum(arr) / arr.length : 0;
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  const LET = 'ABCD';

  const pad = n => String(n).padStart(2, '0');
  function dayKey(d = new Date()) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function daysBetween(a, b) {
    const da = new Date(a + 'T00:00:00'), db = new Date(b + 'T00:00:00');
    return Math.round((db - da) / 86400000);
  }
  function addDays(key, n) {
    const d = new Date(key + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return dayKey(d);
  }
  function weekDays(ref = new Date()) {
    const dow = (ref.getDay() + 6) % 7;
    return Array.from({ length: 7 }, (_, i) => dayKey(new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - dow + i)));
  }
  function fmtDur(sec) {
    sec = Math.max(0, Math.round(sec));
    const hh = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    return (hh ? hh + ':' + pad(m) : pad(m)) + ':' + pad(s);
  }
  function fmtMin(min) {
    min = Math.round(min);
    if (min < 60) return min + ' phút';
    return Math.floor(min / 60) + ' giờ ' + (min % 60 ? (min % 60) + ' phút' : '');
  }
  function fmtInterval(days) {
    if (days < 1 / 24) return Math.max(1, Math.round(days * 1440)) + ' ph';
    if (days < 1) return Math.round(days * 24) + ' giờ';
    if (days < 30) return Math.round(days) + ' ngày';
    if (days < 365) return Math.round(days / 30) + ' th';
    return (days / 365).toFixed(1) + ' năm';
  }
  function fmtDate(ts) {
    const d = new Date(ts);
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
  }
  function fmtShort(ts) {
    const d = new Date(ts);
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1);
  }
  function ago(ts) {
    const s = (Date.now() - ts) / 1000;
    if (s < 60) return 'vừa xong';
    if (s < 3600) return Math.floor(s / 60) + ' phút trước';
    if (s < 86400) return Math.floor(s / 3600) + ' giờ trước';
    const d = Math.floor(s / 86400);
    return d === 1 ? 'hôm qua' : d + ' ngày trước';
  }
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  function lev(a, b, cost) {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j), cur = new Array(n + 1);
    for (let i = 1; i <= m; i++) {
      cur[0] = i;
      for (let j = 1; j <= n; j++) {
        const sub = a[i - 1] === b[j - 1] ? 0 : (cost ? cost(a[i - 1], b[j - 1]) : 1);
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + sub);
      }
      [prev, cur] = [cur, prev];
    }
    return prev[n];
  }
  function diffOps(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    const ops = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) { ops.unshift([a[i - 1] === b[j - 1] ? '=' : '~', a[i - 1], b[j - 1]]); i--; j--; }
      else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) { ops.unshift(['-', a[i - 1], null]); i--; }
      else { ops.unshift(['+', null, b[j - 1]]); j--; }
    }
    return ops;
  }
  function b64e(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    bytes.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64d(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
  }
  async function pack(obj) {
    const json = JSON.stringify(obj);
    if (window.CompressionStream) {
      try {
        const cs = new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw'));
        const buf = new Uint8Array(await new Response(cs).arrayBuffer());
        let bin = '';
        buf.forEach(b => bin += String.fromCharCode(b));
        return 'z' + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      } catch (e) {}
    }
    return 'j' + b64e(json);
  }
  async function unpack(code) {
    const kind = code[0], body = code.slice(1);
    if (kind === 'j') return JSON.parse(b64d(body));
    let s = body.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bytes = Uint8Array.from(atob(s), c => c.charCodeAt(0));
    const ds = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return JSON.parse(await new Response(ds).text());
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function mdLite(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/`(.+?)`/g, '<code>$1</code>').replace(/__(.+?)__/g, '<u>$1</u>');
  }
  function rich(s, cls) {
    return h('span' + (cls ? '.' + cls : ''), { html: mdLite(s) });
  }
  function greet() {
    const hr = new Date().getHours();
    return hr < 11 ? 'Chào buổi sáng' : hr < 14 ? 'Chào buổi trưa' : hr < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  }

  return { $, $$, h, svgEl, clear, hash, rng, shuffle, pick, sample, uniq, clamp, sleep, sum, avg, pct, LET, pad, dayKey, daysBetween, addDays, weekDays, fmtDur, fmtMin, fmtInterval, fmtDate, fmtShort, ago, debounce, lev, diffOps, b64e, b64d, pack, unpack, esc, mdLite, rich, greet };
})();
