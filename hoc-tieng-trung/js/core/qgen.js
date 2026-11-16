const Q = (() => {
  const TONE_NAME = { 1: 'ˉ', 2: 'ˊ', 3: 'ˇ', 4: 'ˋ', 5: '·' };

  function pool(w, rnd, field = 'vi', n = 3, sameLen = false) {
    const lvs = [w.lv, w.lv - 1, w.lv + 1, w.lv - 2, w.lv + 2];
    let cand = D.words.filter(x => x.id !== w.id && x.hz !== w.hz && x[field] !== w[field] && lvs.includes(x.lv || 3));
    const samePos = cand.filter(x => x.pos === w.pos);
    let base = samePos.length >= n * 2 ? samePos : cand;
    if (sameLen) {
      const sl = base.filter(x => x.hz.length === w.hz.length);
      if (sl.length >= n * 2) base = sl;
    }
    const out = [];
    const seen = new Set([w[field]]);
    for (const x of U.shuffle(base, rnd)) {
      if (seen.has(x[field])) continue;
      if (field === 'vi' && overlap(x.vi, w.vi)) continue;
      seen.add(x[field]); out.push(x);
      if (out.length >= n) break;
    }
    return out;
  }
  function overlap(a, b) {
    const sa = a.split(/[,;()]/).map(s => s.trim()).filter(Boolean);
    const sb = b.split(/[,;()]/).map(s => s.trim()).filter(Boolean);
    return sa.some(x => sb.includes(x));
  }
  function mkOpts(correct, wrongs, rnd) {
    const all = U.shuffle([{ ...correct, ok: true }, ...wrongs.map(o => ({ ...o, ok: false }))], rnd);
    return { opts: all, ans: all.findIndex(o => o.ok) };
  }
  const showPy = () => Store.settings().showPy;

  function meaning(w, rnd) {
    const ds = pool(w, rnd, 'vi');
    const { opts, ans } = mkOpts({ t: w.vi }, ds.map(d => ({ t: d.vi })), rnd);
    return { type: 'mc', kind: 'meaning', word: w.id, title: 'Từ này nghĩa là gì?', main: w.hz, zh: true, sub: showPy() ? w.py : '', audio: w.hz, autoplay: true, opts, ans, note: `${w.hz} · ${w.py} · ${w.hv.toUpperCase()} = ${w.vi}` };
  }
  function hanzi(w, rnd) {
    const ds = pool(w, rnd, 'hz', 3, true);
    const { opts, ans } = mkOpts({ t: w.hz, zh: true }, ds.map(d => ({ t: d.hz, zh: true })), rnd);
    return { type: 'mc', kind: 'hanzi', word: w.id, title: 'Chọn chữ Hán đúng', main: w.vi, zh: false, sub: w.emo || '', opts, ans, audioAfter: w.hz, note: `${w.hz} · ${w.py} = ${w.vi}` };
  }
  function listen(w, rnd) {
    const ds = pool(w, rnd, 'hz', 3, true);
    const { opts, ans } = mkOpts({ t: w.hz, zh: true }, ds.map(d => ({ t: d.hz, zh: true })), rnd);
    return { type: 'mc', kind: 'listen', word: w.id, title: 'Nghe và chọn từ đúng', bigAudio: true, audio: w.hz, autoplay: true, opts, ans, note: `${w.hz} · ${w.py} = ${w.vi}` };
  }
  function pinyin(w, rnd) {
    let vars = U.toneVariants(w.py, 3, rnd);
    if (vars.length < 3) {
      const extra = pool(w, rnd, 'py', 6, true).map(x => x.py).filter(p => p !== w.py && !vars.includes(p));
      vars = vars.concat(extra).slice(0, 3);
    }
    if (vars.length < 2) return null;
    const { opts, ans } = mkOpts({ t: w.py }, vars.map(v => ({ t: v })), rnd);
    return { type: 'mc', kind: 'pinyin', word: w.id, title: 'Chọn phiên âm đúng', main: w.hz, zh: true, sub: w.vi, opts, ans, audioAfter: w.hz, note: `${w.hz} đọc là ${w.py} · ${w.vi}` };
  }
  function toneLabel(ts) { return ts.map(t => t + TONE_NAME[t]).join(' – '); }
  function tone(w, rnd) {
    if (!w.toneOk || w.chars.length > 2 || /[一不]/.test(w.hz)) return null;
    const right = w.tones;
    const set = new Set([right.join()]);
    const wrongs = [];
    let guard = 0;
    while (wrongs.length < 3 && guard++ < 50) {
      const v = right.map(() => 1 + Math.floor(rnd() * 4));
      if (!set.has(v.join())) { set.add(v.join()); wrongs.push(v); }
    }
    const { opts, ans } = mkOpts({ t: toneLabel(right) }, wrongs.map(v => ({ t: toneLabel(v) })), rnd);
    return { type: 'mc', kind: 'tone', word: w.id, title: 'Nghe và chọn thanh điệu', bigAudio: true, audio: w.hz, autoplay: true, main: w.hz, zh: true, opts, ans, note: `${w.hz} · ${w.py} = ${w.vi}` };
  }
  function fill(s, w, rnd) {
    const idx = s.toks.findIndex(t => U.bare(t) === w.hz);
    if (idx < 0) return null;
    const ds = pool(w, rnd, 'hz', 3).filter(d => !s.text.includes(d.hz));
    if (ds.length < 2) return null;
    const pre = s.toks.slice(0, idx).join('');
    const post = s.toks[idx].slice(w.hz.length) + s.toks.slice(idx + 1).join('');
    const { opts, ans } = mkOpts({ t: w.hz, zh: true }, ds.map(d => ({ t: d.hz, zh: true })), rnd);
    return { type: 'fill', kind: 'fill', word: w.id, title: 'Chọn từ điền vào chỗ trống', pre, post, opts, ans, vi: s.vi, audioAfter: s.text, note: s.text };
  }
  function orderable(s) {
    const t = s.toks.map(U.bare).filter(Boolean);
    return t.length >= 3 && t.length <= 9 && !/[，、；：]/.test(s.text.slice(0, -1)) && new Set(t).size === t.length;
  }
  function order(s, rnd, extra = {}) {
    if (!orderable(s)) return null;
    const answer = s.toks.map(U.bare).filter(Boolean);
    const end = (s.text.match(/[。？！]$/) || ['。'])[0];
    let toks = U.shuffle(answer, rnd), g = 0;
    while (toks.join('') === answer.join('') && g++ < 10) toks = U.shuffle(answer, rnd);
    return Object.assign({ type: 'order', kind: 'order', title: 'Sắp xếp thành câu đúng', tokens: toks, answer, end, vi: s.vi, audioAfter: s.text, text: s.text }, extra);
  }
  function match(ws, rnd) {
    const list = U.sample(ws, Math.min(5, ws.length), rnd);
    if (list.length < 3) return null;
    return { type: 'match', kind: 'match', title: 'Ghép chữ Hán với nghĩa', pairs: list.map(w => ({ id: w.id, hz: w.hz, vi: w.vi, py: w.py })) };
  }
  function grammarEx(g, ex, rnd) {
    const [q, options, , explain] = ex;
    const { opts, ans } = mkOpts({ t: options[0], zh: /[㐀-鿿]/.test(options[0]) }, options.slice(1).map(o => ({ t: o, zh: /[㐀-鿿]/.test(o) })), rnd);
    const parts = q.split('___');
    if (parts.length === 2) return { type: 'fill', kind: 'grammar', gid: g.id, title: g.title, pre: parts[0], post: parts[1], opts, ans, explain, audioAfter: parts[0] + options[0] + parts[1] };
    return { type: 'mc', kind: 'grammar', gid: g.id, title: g.title, main: q, zh: true, small: true, opts, ans, explain };
  }

  function sentFor(w, maxLv) {
    return D.examplesFor(w, 4).filter(s => s.lv <= (maxLv || 4));
  }
  function lessonQuiz(words, seed) {
    const rnd = U.rng(seed || Math.random() * 1e9);
    const out = [];
    const first = [meaning, listen];
    const second = [hanzi, pinyin, tone, meaning, listen];
    for (const w of U.shuffle(words, rnd)) {
      const f = first[Math.floor(rnd() * first.length)](w, rnd);
      if (f) out.push(f);
    }
    for (const w of U.sample(words, Math.ceil(words.length * 0.6), rnd)) {
      const fns = U.shuffle(second, rnd);
      for (const fn of fns) { const q = fn(w, rnd); if (q && !out.some(o => o.word === w.id && o.kind === q.kind)) { out.push(q); break; } }
    }
    let sentQ = 0;
    const kinds = U.shuffle(['fill', 'trans', 'hear', 'fill'], rnd);
    const usedS = new Set();
    for (const w of U.shuffle(words, rnd)) {
      if (sentQ >= 4) break;
      const ss = sentFor(w, w.lv + 1).filter(s => !usedS.has(s.text));
      if (!ss.length) continue;
      const s = ss[Math.floor(rnd() * ss.length)];
      const k = kinds[sentQ];
      let q = k === 'fill' ? fill(s, w, rnd) : order(s, rnd, k === 'hear' ? { word: w.id, listen: true, title: 'Nghe rồi xếp lại câu' } : { word: w.id, title: 'Xếp các từ thành câu tiếng Trung' });
      if (!q && k !== 'fill') q = fill(s, w, rnd);
      if (q) { out.push(q); sentQ++; usedS.add(s.text); }
    }
    const mixed = U.shuffle(out, rnd);
    const m = match(words, rnd);
    if (m) mixed.splice(Math.min(mixed.length, 4 + Math.floor(rnd() * 4)), 0, m);
    const sp = typeof Pron !== 'undefined' && Pron.enabled() ? speakItem(words, rnd) : null;
    if (sp) mixed.splice(Math.max(3, mixed.length - 3 - Math.floor(rnd() * 3)), 0, sp);
    return mixed;
  }
  function speakItem(words, rnd) {
    const cands = [];
    for (const w of U.shuffle(words, rnd)) {
      const s = sentFor(w, w.lv).find(x => U.countHan(x.text) >= 4 && U.countHan(x.text) <= 12);
      if (s) cands.push({ text: s.text, vi: s.vi, sw: w.id });
      else if ([...w.hz].length >= 2) cands.push({ text: w.hz, vi: w.vi, sw: w.id });
      if (cands.length >= 2) break;
    }
    const c = cands[0];
    return c ? { type: 'speak', kind: 'speak', title: 'Đọc to câu này', text: c.text, vi: c.vi, sw: c.sw } : null;
  }
  function grammarQuiz(g, seed) {
    const rnd = U.rng(seed || Math.random() * 1e9);
    const out = g.ex.map(ex => grammarEx(g, ex, rnd));
    for (const [seg, vi] of U.shuffle(g.examples, rnd).slice(0, 2)) {
      const s = D.sentences.find(x => x.seg === seg);
      const q = s && order(s, rnd, { gid: g.id, title: 'Xếp các từ thành câu tiếng Trung' });
      if (q) out.push(q);
    }
    return U.shuffle(out, rnd);
  }
  function mixedQuiz(words, grammars, n, seed) {
    const rnd = U.rng(seed || Math.random() * 1e9);
    const out = [];
    const gq = [];
    for (const g of grammars) for (const ex of g.ex) gq.push([g, ex]);
    const nG = Math.min(gq.length, Math.round(n * 0.3));
    for (const [g, ex] of U.sample(gq, nG, rnd)) out.push(grammarEx(g, ex, rnd));
    const fns = [meaning, listen, hanzi, pinyin, meaning, listen];
    const ws = U.sample(words, Math.min(words.length, n), rnd);
    let i = 0, sent = 0;
    while (out.length < n && i < ws.length * 2) {
      const w = ws[i % ws.length]; i++;
      let q = null;
      if (sent < Math.round(n * 0.2) && rnd() < 0.4) {
        const ss = sentFor(w, w.lv + 1);
        if (ss.length) { const s = U.pick(ss, rnd); q = rnd() < 0.5 ? fill(s, w, rnd) : order(s, rnd, { word: w.id }); if (q) sent++; }
      }
      if (!q) q = fns[Math.floor(rnd() * fns.length)](w, rnd);
      if (q && !out.some(o => o.word === q.word && o.kind === q.kind)) out.push(q);
    }
    return U.shuffle(out, rnd).slice(0, n);
  }

  function toneGameItem(rnd, lvMax = 4) {
    const cands = D.words.filter(w => w.toneOk && w.chars.length <= 2 && w.lv >= 1 && w.lv <= lvMax && !/[一不]/.test(w.hz));
    return tone(U.pick(cands, rnd), rnd);
  }
  function hvGameItem(rnd) {
    const cands = [];
    for (const w of D.words) {
      if (!w.toneOk || !w.hvOk || w.lv < 1) continue;
      w.chars.forEach((c, i) => { if (!/[一不]/.test(c)) cands.push({ c, t: w.tones[i], hv: w.hvs[i], w }); });
    }
    const it = U.pick(cands, rnd);
    const pred = U.predictTone(it.hv);
    return { ...it, pred, ok: pred.tones.includes(it.t), tip: HSK.toneTip[pred.key] };
  }

  return { meaning, hanzi, listen, pinyin, tone, fill, order, orderable, match, grammarEx, lessonQuiz, grammarQuiz, mixedQuiz, toneGameItem, hvGameItem, toneLabel, mkOpts, pool };
})();
