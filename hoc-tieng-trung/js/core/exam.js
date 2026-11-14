const Exam = (() => {
  const COUNT = 20;
  const CONNECT = ['首先', '其次', '另外', '最后', '因为', '所以', '虽然', '但是', '不但', '而且', '不仅', '如果', '就', '于是', '因此', '然后', '而且', '可是', '不过', '只要', '即使', '无论', '不管', '既然', '尽管', '对我来说', '总之', '一方面', '另一方面'];
  const CONF = {
    3: {
      time: 83 * 60,
      intro: 'Mô phỏng HSK3 (HSK 3.0): 70 câu · Nghe 30 · Đọc 30 · Viết 10 · khoảng 83 phút.',
      sections: [
        { key: 'L', name: 'Nghe', icon: '🎧', parts: [['pic', 10, 'Phần 1 · Nghe câu, chọn tranh phù hợp'], ['dlg3', 10, 'Phần 2 · Nghe hội thoại ngắn, chọn đáp án'], ['long3', 10, 'Phần 3 · Nghe hội thoại dài, chọn đáp án']] },
        { key: 'R', name: 'Đọc', icon: '📖', parts: [['fill3', 10, 'Phần 1 · Chọn từ điền vào chỗ trống'], ['reply3', 10, 'Phần 2 · Chọn câu đáp phù hợp'], ['read3', 10, 'Phần 3 · Đọc đoạn văn, trả lời câu hỏi']] },
        { key: 'W', name: 'Viết', icon: '✍️', parts: [['order3', 5, 'Phần 1 · Sắp xếp từ thành câu hoàn chỉnh'], ['charpick', 5, 'Phần 2 · Nhìn pinyin, chọn chữ Hán đúng']] }
      ]
    },
    4: {
      time: 85 * 60,
      intro: 'Mô phỏng HSK4 (HSK 3.0): 70 câu · Nghe 32 · Đọc 32 · Viết 6 (có bài viết ≥80 chữ) · khoảng 85 phút.',
      sections: [
        { key: 'L', name: 'Nghe', icon: '🎧', parts: [['dlg4s', 7, 'Phần 1 · Hội thoại hai câu (4 đáp án)'], ['dlg4l', 7, 'Phần 1 · Hội thoại bốn câu (4 đáp án)'], ['mono1', 5, 'Phần 2 · Nghe đoạn ngắn, một câu hỏi'], ['mono2', 13, 'Phần 2 · Nghe đoạn dài, hai câu hỏi']] },
        { key: 'R', name: 'Đọc', icon: '📖', parts: [['fill4', 10, 'Phần 1 · Chọn từ điền vào chỗ trống'], ['read4', 9, 'Phần 2 · Đọc đoạn văn, một câu hỏi'], ['read4d', 6, 'Phần 2 · Đọc đoạn văn, hai câu hỏi'], ['para4', 7, 'Phần 3 · Chọn câu điền vào đoạn văn']] },
        { key: 'W', name: 'Viết', icon: '✍️', parts: [['picword', 5, 'Phần 1 · Nhìn tranh và từ cho sẵn, sắp xếp câu'], ['essay', 1, 'Phần 2 · Viết đoạn văn ít nhất 80 chữ']] }
      ]
    }
  };

  function takeFactory(level, no, attempt, rnd) {
    const used = {};
    return function take(name, bank, n) {
      if (!bank.length) return [];
      const base = U.shuffle(bank.map((_, i) => i), U.rng(`base-${level}-${name}`));
      used[name] = used[name] || new Set();
      const out = [];
      let start = ((no - 1) * n * 3 + attempt * 7) % base.length;
      let k = 0;
      while (out.length < n && k < base.length * 2) {
        let idx = base[(start + k) % base.length];
        k++;
        if (attempt > 0 && rnd() < 0.55) idx = base[Math.floor(rnd() * base.length)];
        if (used[name].has(idx)) continue;
        used[name].add(idx); out.push(bank[idx]);
      }
      return out;
    };
  }

  function listenQ(item, rnd, nOpt) {
    const [dl, q, opts] = item;
    const lines = Speech.parseDialog(dl);
    const { opts: o, ans } = Q.mkOpts({ t: opts[0], zh: true }, opts.slice(1, nOpt).map(t => ({ t, zh: true })), rnd);
    return { type: 'listen', lines, q, opts: o, ans, vi: item[3] };
  }
  function sentWithWord(lvMax, lvWord, rnd, usedS) {
    const cands = U.shuffle(D.sentences.filter(s => s.lv <= lvMax && s.lv >= lvMax - 1 && !usedS.has(s.i)), rnd);
    for (const s of cands) {
      const ws = U.shuffle(s.toks.map((t, i) => D.wordAt(s, i)).filter(w => w && (lvWord.includes(w.lv)) && w.hz.length <= 3 && w.pos !== 'u'), rnd);
      for (const w of ws) {
        const q = Q.fill(s, w, rnd);
        if (q) { usedS.add(s.i); return q; }
      }
    }
    return null;
  }
  function charPick(rnd, usedS) {
    const sets = U.shuffle(HSK.charSets, rnd);
    for (const set of sets) {
      const [py, ...chars] = set;
      const setTone = U.tonesOf(py)[0] || 0;
      const cands = U.shuffle(D.sentences.filter(s => s.lv <= 3 && !usedS.has(s.i)), rnd);
      for (const s of cands) {
        for (const c of U.shuffle(chars, rnd)) {
          if (s.text.split(c).length !== 2) continue;
          const ti = s.toks.findIndex(t => U.bare(t).includes(c));
          const tok = U.bare(s.toks[ti]);
          const w = D.wordAt(s, ti);
          if (!w) continue;
          const rd = D.readAt(s.toks, ti);
          const rt = U.tonesOf(rd);
          const pos = [...tok].indexOf(c);
          let ok = false;
          if (rt.length === [...tok].length) ok = rt[pos] === setTone;
          else ok = tok === c && rd === py;
          if (c === '得') {
            const prev = ti > 0 ? s.toks[ti - 1] : '';
            if (!prev || /[，]$/.test(prev) || ['我', '你', '他', '她', '我们', '你们', '他们', '咱们', '大家'].includes(U.bare(prev))) ok = false;
          }
          if (!ok) continue;
          let opts = chars.slice();
          if (opts.length < 3) {
            const extra = U.shuffle(HSK.charSets.filter(x => x !== set).flatMap(x => x.slice(1)), rnd).filter(x => !opts.includes(x) && !s.text.includes(x));
            opts = opts.concat(extra.slice(0, 3 - opts.length));
          }
          opts = U.sample(opts.filter(x => x !== c), 3, rnd);
          const { opts: o, ans } = Q.mkOpts({ t: c, zh: true }, opts.map(t => ({ t, zh: true })), rnd);
          usedS.add(s.i);
          const [pre, post] = s.text.split(c);
          return { type: 'charpick', pre, post, py, opts: o, ans, vi: s.vi, text: s.text };
        }
      }
    }
    return null;
  }
  function replyQs(items, rnd) {
    const lines = items.map(it => Speech.parseDialog(it[0]));
    return lines.map((ls, i) => {
      const right = ls[1].text;
      const others = U.shuffle(lines.filter((_, j) => j !== i).map(x => x[1].text), rnd).slice(0, 3);
      const { opts, ans } = Q.mkOpts({ t: right, zh: true }, others.map(t => ({ t, zh: true })), rnd);
      return { type: 'reply', prompt: ls[0].text, opts, ans, vi: items[i][3] };
    });
  }

  function build(level, no, attempt = 0) {
    const conf = CONF[level];
    const rnd = U.rng(`exam-${level}-${no}-${attempt}`);
    const take = takeFactory(level, no, attempt, rnd);
    const usedS = new Set();
    const sections = conf.sections.map(sec => ({ key: sec.key, name: sec.name, icon: sec.icon, parts: [], items: [] }));
    let num = 1;
    const push = (si, part, qs) => {
      const sec = sections[si];
      sec.parts.push({ label: part, from: num, to: num + qs.length - 1 });
      for (const q of qs) { q.num = num++; q.sec = sec.key; q.part = part; sec.items.push(q); }
    };
    conf.sections.forEach((sec, si) => {
      for (const [kind, n, label] of sec.parts) {
        let qs = [];
        if (kind === 'pic') {
          const items = take('pics', HSK.pics, n);
          qs = items.map(it => {
            const others = U.sample(HSK.pics.filter(p => p !== it), 3, rnd);
            const { opts, ans } = Q.mkOpts({ t: it[1], emoji: true }, others.map(o => ({ t: o[1], emoji: true })), rnd);
            return { type: 'pic', lines: [{ who: null, text: it[0] }], opts, ans, vi: it[2], text: it[0] };
          });
        } else if (kind === 'dlg3') qs = take('dlg3', HSK.dlg3, n).map(it => listenQ(it, rnd, 3));
        else if (kind === 'long3') qs = take('long3', HSK.long3, n).map(it => listenQ(it, rnd, 3));
        else if (kind === 'reply3') qs = replyQs(take('dlg3', HSK.dlg3, n), rnd);
        else if (kind === 'fill3' || kind === 'fill4') {
          for (let i = 0; i < n; i++) { const q = sentWithWord(level, level === 3 ? [2, 3] : [3, 4], rnd, usedS); if (q) qs.push(Object.assign(q, { type: 'fill' })); }
        } else if (kind === 'read3') {
          qs = take('read3', HSK.read3, n).map(it => {
            const { opts, ans } = Q.mkOpts({ t: it[2][0], zh: true }, it[2].slice(1).map(t => ({ t, zh: true })), rnd);
            return { type: 'read', passage: it[0], q: it[1], opts, ans, vi: it[3] };
          });
        } else if (kind === 'order3') {
          const cands = U.shuffle(D.sentences.filter(s => s.lv >= 2 && s.lv <= 3 && Q.orderable(s) && !usedS.has(s.i) && s.bare.length >= 4), rnd);
          qs = cands.slice(0, n).map(s => { usedS.add(s.i); return Q.order(s, rnd); });
        } else if (kind === 'charpick') {
          for (let i = 0; i < n; i++) { const q = charPick(rnd, usedS); if (q) qs.push(q); }
        } else if (kind === 'dlg4s' || kind === 'dlg4l') {
          const bank = HSK.dlg4.filter(d => (d[0].split('|').length <= 2) === (kind === 'dlg4s'));
          qs = take(kind, bank, n).map(it => listenQ(it, rnd, 4));
        } else if (kind === 'mono1') {
          qs = take('mono1', HSK.mono4.filter(m => m[1].length === 1), n).map(it => monoQ(it, it[1][0], rnd));
        } else if (kind === 'mono2') {
          const pairs = Math.floor(n / 2);
          const items = take('mono2', HSK.mono4.filter(m => m[1].length === 2), pairs);
          items.forEach((it, gi) => it[1].forEach((qq, k) => qs.push(monoQ(it, qq, rnd, `m${gi}`, k))));
          if (n % 2) qs = qs.concat(take('mono1', HSK.mono4.filter(m => m[1].length === 1), 1).map(it => monoQ(it, it[1][0], rnd)));
        } else if (kind === 'read4') {
          qs = take('read4', HSK.read4, n).map(it => readQ(it, it[1][0], rnd));
        } else if (kind === 'read4d') {
          take('read4d', HSK.read4d, Math.ceil(n / 2)).forEach((it, gi) => it[1].forEach((qq, k) => qs.push(readQ(it, qq, rnd, `r${gi}`, k))));
          qs = qs.slice(0, n);
        } else if (kind === 'para4') {
          const items = take('para4', HSK.para4, 3);
          let left = n;
          items.forEach((it, gi) => {
            const nb = (it[0].match(/\[\d\]/g) || []).length;
            const ask = Math.min(nb, left, gi === 2 ? left : 3);
            const askIdx = U.sample([...Array(nb).keys()], ask, rnd).sort();
            const order = U.shuffle(it[1].map((t, i) => ({ t, i })), rnd);
            askIdx.forEach(bi => {
              const opts = order.map(o => ({ t: o.t, zh: true, ok: o.i === bi }));
              qs.push({ type: 'para', passage: it[0], blank: bi, ask: askIdx, sents: it[1], opts, ans: opts.findIndex(o => o.ok), vi: it[2], group: `p${gi}` });
            });
            left -= ask;
          });
        } else if (kind === 'picword') {
          qs = take('picword', HSK.picword4, n).map(it => {
            const s = { seg: it[2], text: U.joinSeg(it[2]), vi: it[3], toks: U.tokens(it[2]) };
            s.bare = s.toks.map(U.bare).filter(Boolean);
            const q = Q.order(Object.assign(s, { text: s.text }), rnd);
            return q ? Object.assign(q, { type: 'order', pic: it[1], given: it[0], title: 'Nhìn tranh, dùng từ cho sẵn sắp xếp câu' }) : null;
          }).filter(Boolean);
        } else if (kind === 'essay') {
          qs = take('essay', HSK.essay4, 1).map(it => ({ type: 'essay', prompt: it[0], promptVi: it[1], model: it[2] }));
        }
        if (qs.length) push(si, label, qs);
      }
    });
    const all = sections.flatMap(s => s.items);
    return { level, no, attempt, sections, items: all, time: conf.time, intro: conf.intro };
  }
  function monoQ(it, qq, rnd, group, k) {
    const { opts, ans } = Q.mkOpts({ t: qq[1][0], zh: true }, qq[1].slice(1).map(t => ({ t, zh: true })), rnd);
    return { type: 'listen', lines: [{ who: null, text: it[0] }], q: qq[0], opts, ans, vi: it[2], group, gk: k };
  }
  function readQ(it, qq, rnd, group, k) {
    const { opts, ans } = Q.mkOpts({ t: qq[1][0], zh: true }, qq[1].slice(1).map(t => ({ t, zh: true })), rnd);
    return { type: 'read', passage: it[0], q: qq[0], opts, ans, vi: it[2], group, gk: k };
  }

  function essayAuto(text) {
    const n = U.countHan(text);
    const found = U.uniq(CONNECT.filter(c => text.includes(c)));
    return { n, found };
  }
  function isRight(q, a) {
    if (a == null) return false;
    if (q.type === 'order') return Array.isArray(a) && a.join('') === q.answer.join('');
    if (q.type === 'essay') return false;
    return a === q.ans;
  }
  function score(exam, answers) {
    const res = { L: 0, R: 0, W: 0, total: 0, per: {}, right: 0, count: 0 };
    for (const sec of exam.sections) {
      let pts = 0, max = 0;
      for (const q of sec.items) {
        const qi = exam.items.indexOf(q);
        const a = answers[qi];
        if (q.type === 'essay') {
          const ev = (a && a.rubric) || {};
          const au = essayAuto((a && a.text) || '');
          const ep = (au.n >= 80 ? 10 : Math.round(au.n / 8)) + (au.found.length >= 3 ? 10 : au.found.length * 3) + (ev.topic ? 10 : 0) + (ev.clean ? 10 : 0);
          res.essay = { pts: ep, auto: au };
          pts += ep; max += 40;
        } else {
          const ok = isRight(q, a);
          const w = exam.level === 4 && sec.key === 'W' ? 12 : 1;
          pts += ok ? w : 0; max += w;
          res.per[qi] = ok; res.count++; if (ok) res.right++;
        }
      }
      res[sec.key] = max ? Math.round(pts / max * 100) : 0;
    }
    res.total = res.L + res.R + res.W;
    return res;
  }
  function drill(kind, n = 8) {
    const rnd = U.rng(Math.random() * 1e9);
    const map = {
      listen3: () => U.sample(HSK.dlg3.concat(HSK.long3), n, rnd).map(it => listenQ(it, rnd, 3)),
      listen4: () => U.sample(HSK.dlg4, n, rnd).map(it => listenQ(it, rnd, 4)),
      pic: () => U.sample(HSK.pics, n, rnd).map(it => {
        const others = U.sample(HSK.pics.filter(p => p !== it), 3, rnd);
        const { opts, ans } = Q.mkOpts({ t: it[1], emoji: true }, others.map(o => ({ t: o[1], emoji: true })), rnd);
        return { type: 'pic', lines: [{ who: null, text: it[0] }], opts, ans, vi: it[2], text: it[0] };
      }),
      read3: () => U.sample(HSK.read3, n, rnd).map(it => { const { opts, ans } = Q.mkOpts({ t: it[2][0], zh: true }, it[2].slice(1).map(t => ({ t, zh: true })), rnd); return { type: 'read', passage: it[0], q: it[1], opts, ans, vi: it[3] }; }),
      read4: () => U.sample(HSK.read4, n, rnd).map(it => readQ(it, it[1][0], rnd))
    };
    return (map[kind] || map.listen3)();
  }
  return { COUNT, CONF, build, score, isRight, essayAuto, drill, CONNECT };
})();
