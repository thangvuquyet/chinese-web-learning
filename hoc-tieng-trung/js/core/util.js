const U = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function h(tag, attrs, ...kids) {
    const m = tag.match(/^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i);
    const el = document.createElement((m && m[1]) || 'div');
    if (m && m[2]) {
      m[2].replace(/([.#])([\w-]+)/g, (_, t, v) => {
        if (t === '.') el.classList.add(v); else el.id = v;
      });
    }
    if (attrs != null && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) {
      kids.unshift(attrs);
      attrs = null;
    }
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') el.className += (el.className ? ' ' : '') + v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
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

  const VOW = { a: 'aāáǎà', e: 'eēéěè', i: 'iīíǐì', o: 'oōóǒò', u: 'uūúǔù', 'ü': 'üǖǘǚǜ' };
  const TONED = {};
  for (const [base, s] of Object.entries(VOW)) {
    for (let t = 1; t <= 4; t++) {
      TONED[s[t]] = [base, t];
      TONED[s[t].toUpperCase()] = [base.toUpperCase(), t];
    }
  }
  function tonesOf(py) {
    const out = [];
    for (const ch of py) if (TONED[ch]) out.push(TONED[ch][1]);
    return out;
  }
  function setToneAt(py, idx, tone) {
    let n = -1, res = '';
    for (const ch of py) {
      if (TONED[ch]) {
        n++;
        if (n === idx) {
          const [base] = TONED[ch];
          const lower = base.toLowerCase();
          let rep = VOW[lower][tone];
          if (base !== lower) rep = rep.toUpperCase();
          res += rep;
          continue;
        }
      }
      res += ch;
    }
    return res;
  }
  function toneVariants(py, n, r = Math.random) {
    const ts = tonesOf(py);
    const out = new Set();
    if (!ts.length) return [];
    let guard = 0;
    while (out.size < n && guard++ < 80) {
      let v = py;
      const changes = ts.length > 1 && r() < 0.5 ? 2 : 1;
      const idxs = sample([...ts.keys()], Math.min(changes, ts.length), r);
      for (const i of idxs) {
        let t;
        do { t = 1 + Math.floor(r() * 4); } while (t === ts[i]);
        v = setToneAt(v, i, t);
      }
      if (v !== py) out.add(v);
    }
    return [...out];
  }
  function stripTones(py) {
    let s = '';
    for (const ch of py) s += TONED[ch] ? TONED[ch][0] : ch;
    return s;
  }

  const FINALS = ['iang', 'iong', 'uang', 'ueng', 'ang', 'eng', 'ing', 'ong', 'ian', 'iao', 'uai', 'uan', 'üan', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'er', 'in', 'un', 'ün', 'ia', 'ie', 'iu', 'ua', 'uo', 'ui', 'üe', 'ue', 'a', 'o', 'e', 'i', 'u', 'ü'];
  const INITS = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w'];
  const SYL = new Set(['r', 'n', 'ng', 'm', 'hm', 'hng']);
  for (const f of FINALS) { SYL.add(f); for (const i of INITS) SYL.add(i + f); }
  function splitPy(py, n) {
    const raw = py.toLowerCase().replace(/[^a-zāáǎàēéěèīíǐìōóǒòūúǔùüǖǘǚǜ·]/g, '');
    const base = stripTones(raw).replace(/v/g, 'ü');
    let memo = {}, strict = true;
    function go(pos, k) {
      const key = pos + ':' + k;
      if (key in memo) return memo[key];
      let res = null;
      if (pos === base.length) res = k === 0 ? [] : null;
      else if (k > 0) {
        if (base[pos] === '·') { const r = go(pos + 1, k - 1); res = r ? [[pos, pos + 1], ...r] : null; }
        else for (let L = Math.min(6, base.length - pos); L >= 1 && !res; L--) {
          const sub = base.slice(pos, pos + L);
          if (!SYL.has(sub)) continue;
          if (strict && pos > 0 && /^[aoeiuü]/.test(sub) && base[pos - 1] !== '·' && !(sub === 'r' || sub === 'er')) continue;
          const r = go(pos + L, k - 1);
          if (r) res = [[pos, pos + L], ...r];
        }
      }
      return (memo[key] = res);
    }
    let cut = go(0, n);
    if (!cut) { memo = {}; strict = false; cut = go(0, n); }
    if (!cut) return null;
    return cut.map(([a, b]) => {
      const s = raw.slice(a, b);
      if (s === '·') return { py: '', base: '', tone: 0 };
      const t = tonesOf(s);
      return { py: s, base: base.slice(a, b), tone: t.length ? t[0] : 5 };
    });
  }
  const PUNCT = /[，。？！：；、“”"‘’（）《》…—,.?!:;()\s]/g;
  const onlyHan = s => (s || '').replace(PUNCT, '');
  function tokens(seg) {
    return seg.trim().split(/\s+/).flatMap(t => t.split(/(?<=[，。？！：；、])/)).filter(Boolean);
  }
  const bare = t => t.replace(/[，。？！：；、“”"]/g, '');
  const joinSeg = seg => seg.replace(/\s+/g, '');
  const countHan = s => ((s || '').match(/[㐀-鿿]/g) || []).length;

  function viTone(syl) {
    const d = syl.normalize('NFD');
    if (d.includes('̀')) return 'huyền';
    if (d.includes('́')) return 'sắc';
    if (d.includes('̉')) return 'hỏi';
    if (d.includes('̃')) return 'ngã';
    if (d.includes('̣')) return 'nặng';
    return 'ngang';
  }
  function viBase(syl) {
    return syl.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  }
  function hvEntering(syl) { return /(p|t|c|ch)$/.test(viBase(syl)); }
  function predictTone(syl) {
    const t = viTone(syl), ent = hvEntering(syl), son = /^(m|n|l|ng|nh|v)/.test(viBase(syl));
    if (ent) return { tones: t === 'nặng' ? [2, 4] : [1, 2, 3, 4], key: 'tắc' };
    if (t === 'huyền') return { tones: [2], key: t };
    if (t === 'hỏi') return { tones: [3], key: t };
    if (t === 'ngã') return { tones: son ? [3] : [4], key: t };
    if (t === 'sắc') return { tones: [4], key: t };
    if (t === 'nặng') return { tones: [4], key: t };
    return { tones: son ? [2] : [1], key: t };
  }

  const pad = n => String(n).padStart(2, '0');
  function dayKey(d = new Date()) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function daysBetween(a, b) {
    const da = new Date(a + 'T00:00:00'), db = new Date(b + 'T00:00:00');
    return Math.round((db - da) / 86400000);
  }
  function fmtDur(sec) {
    sec = Math.max(0, Math.round(sec));
    const m = Math.floor(sec / 60), s = sec % 60;
    return pad(m) + ':' + pad(s);
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
  function similarity(a, b) {
    a = onlyHan(a); b = onlyHan(b);
    if (!a.length && !b.length) return 1;
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
    const lcs = dp[m][n];
    const hit = new Array(m).fill(false);
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) { hit[i - 1] = true; i--; j--; }
      else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--;
    }
    return { score: (2 * lcs) / (m + n || 1), hit, target: a };
  }
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  const short = n => { const w = String(n || '').trim().split(/\s+/).filter(Boolean); return w.length >= 3 ? w.slice(0, -1).join(' ') : w.join(' '); };
  return { short, splitPy, $, $$, h, clear, hash, rng, shuffle, pick, sample, uniq, clamp, sleep, tonesOf, setToneAt, toneVariants, stripTones, onlyHan, tokens, bare, joinSeg, countHan, viTone, viBase, hvEntering, predictTone, dayKey, daysBetween, fmtDur, fmtInterval, fmtDate, similarity, debounce };
})();
