const D = (() => {
  const POS = { n: 'danh từ', v: 'động từ', a: 'tính từ', d: 'phó từ', m: 'lượng từ', p: 'giới từ', c: 'liên từ', r: 'đại từ', u: 'trợ từ', num: 'số từ', i: 'thán từ', t: 'thời gian', f: 'phương vị', x: 'cụm từ' };
  const words = [];
  const byId = {};
  const byHz = {};
  const groups = [];
  let sentences = [];
  const tokIndex = {};
  const grammar = HSK.grammar.slice();
  const gById = {};
  grammar.forEach(g => gById[g.id] = g);

  function parseLine(line) {
    const p = line.split('|').map(s => s.trim());
    return { hz: p[0], py: p[1], hv: p[2] || '', vi: p[3] || '', pos: p[4] || 'x', emo: p[5] || '' };
  }
  function addWord(w, lv, gi, gt, ge) {
    const id = w.hz + '|' + w.py;
    if (byId[id]) return null;
    const tones = U.tonesOf(w.py);
    const chars = [...w.hz];
    const hvs = w.hv ? w.hv.split(/\s+/) : [];
    const o = Object.assign(w, { id, lv, g: gi, gt, ge, chars, tones, toneOk: tones.length === chars.length, hvs, hvOk: hvs.length === chars.length });
    words.push(o); byId[id] = o;
    (byHz[w.hz] = byHz[w.hz] || []).push(o);
    return o;
  }
  for (const lv of [1, 2, 3, 4]) {
    (HSK.vocab[lv] || []).forEach((grp, gi) => {
      const list = [];
      for (const line of grp.w.split('\n').map(s => s.trim()).filter(Boolean)) {
        const o = addWord(parseLine(line), lv, gi, grp.t, grp.e);
        if (o) { if (grp.x) o.x = 1; list.push(o.id); }
      }
      groups.push({ lv, gi, title: grp.t, emo: grp.e, ids: list });
    });
  }
  function loadCustom() {
    for (const w of (Store.db.custom || [])) {
      if (!byId[w.hz + '|' + w.py]) addWord({ hz: w.hz, py: w.py, hv: w.hv || '', vi: w.vi, pos: w.pos || 'x', emo: w.emo || '' }, 0, 0, 'Từ của tôi', '⭐');
    }
  }
  loadCustom();

  function buildSentences() {
    const out = [];
    const seen = new Set();
    for (const line of HSK.sentences.split('\n').map(s => s.trim()).filter(Boolean)) {
      const [seg, vi, lv] = line.split('|');
      if (seen.has(seg)) continue; seen.add(seg);
      out.push(mkSent(seg, vi, +lv || 3, 'bank'));
    }
    for (const g of grammar) for (const [seg, vi] of g.examples) {
      if (seen.has(seg)) continue; seen.add(seg);
      out.push(mkSent(seg, vi, g.lv, g.id));
    }
    return out;
  }
  function mkSent(seg, vi, lv, src) {
    const toks = U.tokens(seg);
    return { seg, text: U.joinSeg(seg), vi, lv, src, toks, bare: toks.map(U.bare).filter(Boolean) };
  }
  sentences = buildSentences();
  sentences.forEach((s, i) => { s.i = i; for (const t of new Set(s.bare)) (tokIndex[t] = tokIndex[t] || []).push(i); });

  const tokPy = {};
  for (const pair of (HSK.tokPy || '').split(/\s(?=[^\s:]+:)/)) {
    const k = pair.indexOf(':');
    if (k > 0) tokPy[pair.slice(0, k)] = pair.slice(k + 1);
  }
  const pyDict = {};
  for (const w of words) if (!pyDict[w.hz]) pyDict[w.hz] = w.py;
  const NUM = /^[零一二三四五六七八九十百千万两几半第\d]/;
  const SUBJ = new Set(['我', '你', '他', '她', '它', '我们', '你们', '他们', '她们', '咱们', '大家', '您', '谁', '也', '还', '就', '都', '可能', '一定', '总', '只', '又']);
  const firstTone = py => { const t = U.tonesOf(py || ''); return t.length ? t[0] : 5; };
  const clean = t => U.bare(t).replace(/[—–\-…·]/g, '');
  function wordOf(t) { const c = byHz[t]; return c && c[0]; }
  function basePy(t) {
    if (!t) return '';
    const w = wordOf(t);
    if (w) return w.py;
    if (tokPy[t]) return tokPy[t];
    const out = [];
    let i = 0;
    const ch = [...t];
    while (i < ch.length) {
      let hit = null;
      for (let L = Math.min(4, ch.length - i); L >= 1; L--) {
        const sub = ch.slice(i, i + L).join('');
        const p = pyDict[sub] || tokPy[sub];
        if (p) { hit = [L, p]; break; }
      }
      if (hit) { out.push(hit[1]); i += hit[0]; }
      else { out.push(/[㐀-鿿]/.test(ch[i]) ? '·' : ch[i]); i++; }
    }
    return out.join('');
  }
  const isVerbLike = t => { const w = wordOf(t); return w ? ['v', 'a'].includes(w.pos) : (!!t && [...t].length === 1 && !SUBJ.has(t)); };
  const RULES = {
    '得': (p, n) => {
      if (!p || /[，]$/.test(p) || SUBJ.has(p)) return n && !/^(很|非常|太|真|特别|不|多)/.test(n) ? 'děi' : 'de';
      return 'de';
    },
    '长': (p, n) => /^(得|大|高|胖|成|出)/.test(n || '') ? 'zhǎng' : 'cháng',
    '还': (p, n, n2) => /^(书|钱|给|回|清)/.test(n || '') || (SUBJ.has(n) && /^(书|钱|那|这|一)/.test(n2 || '')) ? 'huán' : 'hái',
    '过': p => p && isVerbLike(p) && !/^(不|没|很|太)$/.test(p) ? 'guo' : 'guò',
    '地': (p, n) => /^(上|下|方|铁|图|址|点|区|球|板)/.test(n || '') || /^(在|到|满|草|土|一)$/.test(p || '') ? 'dì' : 'de',
    '只': p => p && (NUM.test(p) || /^(这|那|哪|每)$/.test(p)) ? 'zhī' : 'zhǐ',
    '种': (p, n) => !p || NUM.test(p) || /^(这|那|哪|每|各|多|某|有)$/.test(p) ? 'zhǒng' : (/^(花|树|菜|植物|草|地)/.test(n || '') ? 'zhòng' : 'zhǒng'),
    '一': (p, n) => {
      if (!n || NUM.test(n) || /^(月|号|日|年|楼|层|班|半)/.test(n) || /^(第|十|统|唯|星期|周)$/.test(p || '') || NUM.test(p || '')) return 'yī';
      const t = firstTone(basePy(n));
      return t === 4 || t === 5 ? 'yí' : 'yì';
    },
    '不': (p, n) => firstTone(basePy(n)) === 4 ? 'bú' : 'bù'
  };
  function readAt(toks, i) {
    const b = toks.map(clean);
    const t = b[i];
    if (!t) return '';
    let j = i - 1; while (j >= 0 && !b[j]) j--;
    let k = i + 1; while (k < b.length && !b[k]) k++;
    let k2 = k + 1; while (k2 < b.length && !b[k2]) k2++;
    const prevRaw = j >= 0 ? toks[j] : '';
    const p = j >= 0 && !/[，。？！：；]$/.test(prevRaw) ? b[j] : '';
    const n = k < b.length ? b[k] : '';
    const n2 = k2 < b.length ? b[k2] : '';
    if (RULES[t]) return RULES[t](p, /[，。？！：；]$/.test(toks[i]) ? '' : n, n2);
    return basePy(t);
  }
  function segment(text) {
    const out = [];
    const ch = [...text];
    let i = 0;
    while (i < ch.length) {
      if (!/[㐀-鿿]/.test(ch[i])) { if (out.length) out[out.length - 1] += ch[i]; else out.push(ch[i]); i++; continue; }
      let L = Math.min(5, ch.length - i);
      for (; L > 1; L--) { const sub = ch.slice(i, i + L).join(''); if (byHz[sub] || tokPy[sub]) break; }
      out.push(ch.slice(i, i + L).join(''));
      i += L;
    }
    return out;
  }
  const sentByText = {};
  sentences.forEach(s => { sentByText[s.text] = s; });
  const PMAP = { '，': ',', '。': '.', '？': '?', '！': '!', '：': ':', '；': ';', '、': ',', '“': '"', '”': '"', '…': '…' };
  function pinyin(x) {
    const s = typeof x === 'string' ? sentByText[x] : x;
    const toks = s ? s.toks : segment(String(x));
    const parts = [];
    toks.forEach((raw, i) => {
      const py = readAt(toks, i);
      const tail = (raw.match(/[，。？！：；、“”"…—]+$/) || [''])[0].replace(/[—]/g, '');
      const head = (raw.match(/^[“"—]+/) || [''])[0].replace(/[—]/g, '');
      const fix = str => [...str].map(c => PMAP[c] || c).join('');
      if (py || tail) parts.push(fix(head) + py + fix(tail));
    });
    let out = parts.join(' ').replace(/\s+([,.?!:;])/g, '$1');
    out = out.replace(/(^|[.?!]\s+)([a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ])/g, (m, a, b) => a + b.toUpperCase());
    return out;
  }
  function readingOk(s, w) {
    if ((byHz[w.hz] || []).length < 2) return true;
    const want = U.stripTones(w.py) + U.tonesOf(w.py).join('');
    return s.toks.some((t, i) => clean(t) === w.hz && (() => { const r = readAt(s.toks, i); return U.stripTones(r) + U.tonesOf(r).join('') === want; })());
  }
  function examplesFor(w, n = 2) {
    let ids = (tokIndex[w.hz] || []).slice();
    if (!ids.length && w.hz.length > 1) ids = sentences.filter(s => s.text.includes(w.hz)).map(s => s.i);
    const list = ids.map(i => sentences[i]).filter(s => readingOk(s, w));
    list.sort((a, b) => Math.abs(a.lv - w.lv) - Math.abs(b.lv - w.lv) || a.text.length - b.text.length);
    return list.slice(0, n);
  }
  function wordAt(s, i) {
    const t = clean(s.toks[i]);
    const c = byHz[t] || [];
    if (c.length < 2) return c[0] || null;
    const r = readAt(s.toks, i);
    return c.find(w => w.py === r) || c[0];
  }

  const STAGES = [
    { id: 1, key: 's1', title: 'Chặng 1 · Ôn nền HSK1–2', sub: 'Ôn lại 300 từ nền tảng (có thể làm bài vượt cấp)', lvs: [1, 2], chunk: 14, cls: 'st-1', deco: '一', optional: true },
    { id: 2, key: 's2', title: 'Chặng 2 · HSK3', sub: 'Từ vựng HSK3 + 34 điểm ngữ pháp + kiểm tra định kỳ', lvs: [3], chunk: 10, cls: 'st-2', deco: '二' },
    { id: 3, key: 's3', title: 'Chặng 3 · HSK4', sub: 'Từ vựng HSK4 + 32 điểm ngữ pháp, sẵn sàng thi HSK 3.0', lvs: [4], chunk: 10, cls: 'st-3', deco: '三' }
  ];
  function chunks(arr, size) {
    const n = Math.max(1, Math.ceil(arr.length / size));
    const base = Math.floor(arr.length / n), extra = arr.length % n;
    const out = []; let i = 0;
    for (let k = 0; k < n; k++) { const len = base + (k < extra ? 1 : 0); out.push(arr.slice(i, i + len)); i += len; }
    return out;
  }
  const nodes = [];
  const nodeById = {};
  for (const st of STAGES) {
    const units = [];
    for (const g of groups.filter(g => st.lvs.includes(g.lv))) {
      chunks(g.ids, st.chunk).forEach((ids, k, all) => {
        units.push({ id: `u${g.lv}-${g.gi}-${k}`, type: 'unit', stage: st.id, title: g.title + (all.length > 1 ? ` (${k + 1}/${all.length})` : ''), emo: g.emo, words: ids, lv: g.lv });
      });
    }
    const gps = grammar.filter(g => st.lvs.includes(g.lv)).map(g => ({ id: 'g:' + g.id, type: 'grammar', stage: st.id, title: g.title, emo: g.icon, gid: g.id, lv: g.lv }));
    const seq = [];
    const ratio = gps.length ? units.length / gps.length : Infinity;
    let gi = 0;
    units.forEach((u, i) => {
      seq.push(u);
      while (gi < gps.length && (i + 1) >= Math.round((gi + 1) * ratio)) seq.push(gps[gi++]);
    });
    while (gi < gps.length) seq.push(gps[gi++]);
    const withChecks = [];
    let bucket = [], ck = 0;
    const per = st.id === 1 ? 6 : 8;
    seq.forEach((n, i) => {
      withChecks.push(n); bucket.push(n.id);
      if (bucket.length >= per && i < seq.length - 1) {
        withChecks.push({ id: `c${st.id}-${ck}`, type: 'check', stage: st.id, title: `Kiểm tra chặng nhỏ ${ck + 1}`, emo: '📋', covers: bucket.slice() });
        bucket = []; ck++;
      }
    });
    if (bucket.length >= 4) withChecks.push({ id: `c${st.id}-${ck}`, type: 'check', stage: st.id, title: `Kiểm tra chặng nhỏ ${ck + 1}`, emo: '📋', covers: bucket.slice() });
    withChecks.push({ id: `f${st.id}`, type: 'final', stage: st.id, title: `Bài thi cuối ${st.title.split('·')[1].trim()}`, emo: '👑', covers: seq.map(n => n.id) });
    st.nodes = withChecks;
    withChecks.forEach((n, i) => { n.idx = i; nodes.push(n); nodeById[n.id] = n; });
  }

  function nodeWords(node) {
    if (node.type === 'unit') return node.words.map(id => byId[id]).filter(Boolean);
    if (node.covers) return node.covers.flatMap(id => nodeById[id] && nodeById[id].type === 'unit' ? nodeById[id].words : []).map(id => byId[id]).filter(Boolean);
    return [];
  }
  function nodeGrammar(node) {
    if (node.type === 'grammar') return [gById[node.gid]];
    if (node.covers) return node.covers.map(id => nodeById[id]).filter(n => n && n.type === 'grammar').map(n => gById[n.gid]);
    return [];
  }
  function isDone(p, nodeId) { return !!(p.nodes[nodeId] && p.nodes[nodeId].done); }
  function stageUnlocked(p, st) {
    if (Store.settings().unlockAll) return true;
    if (st.id <= 2) return true;
    const prev = STAGES.find(s => s.id === st.id - 1);
    return isDone(p, `f${prev.id}`) || !!p.testOut[prev.key];
  }
  function nodeUnlocked(p, node) {
    if (Store.settings().unlockAll) return true;
    const st = STAGES.find(s => s.id === node.stage);
    if (!stageUnlocked(p, st)) return false;
    if (p.testOut[st.key]) return true;
    if (node.idx === 0) return true;
    return isDone(p, st.nodes[node.idx - 1].id);
  }
  function currentNode(p) {
    for (const st of STAGES) {
      if (!stageUnlocked(p, st)) continue;
      if (st.optional) {
        const started = st.nodes.some(n => isDone(p, n.id));
        if (!started || p.testOut[st.key]) continue;
      }
      for (const n of st.nodes) if (!isDone(p, n.id) && nodeUnlocked(p, n)) return n;
    }
    for (const st of STAGES) for (const n of st.nodes) if (!isDone(p, n.id) && nodeUnlocked(p, n)) return n;
    return null;
  }
  function stageProgress(p, st) {
    const total = st.nodes.length;
    const done = st.nodes.filter(n => isDone(p, n.id)).length;
    return { done, total, pct: total ? done / total : 0 };
  }
  function nextNode(node) {
    const st = STAGES.find(s => s.id === node.stage);
    return st.nodes[node.idx + 1] || (STAGES[st.id] && STAGES[st.id].nodes[0]) || null;
  }

  function dueCards(p, now = Date.now()) {
    return Object.entries(p.cards).filter(([id, c]) => c.due <= now && byId[id]).sort((a, b) => a[1].due - b[1].due).map(([id]) => id);
  }
  function wordPool(lv) { return words.filter(w => w.lv === lv); }

  return { POS, words, byId, byHz, groups, sentences, tokIndex, grammar, gById, examplesFor, pinyin, readAt, wordAt, STAGES, nodes, nodeById, nodeWords, nodeGrammar, isDone, nodeUnlocked, stageUnlocked, currentNode, stageProgress, nextNode, dueCards, wordPool, loadCustom, addWord };
})();
