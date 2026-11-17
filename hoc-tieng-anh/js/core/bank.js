const Bank = (() => {
  const PART_NAME = { 1: 'Mô tả tranh', 2: 'Hỏi – đáp', 3: 'Hội thoại', 4: 'Bài nói ngắn', 5: 'Điền câu', 6: 'Điền đoạn văn', 7: 'Đọc hiểu' };
  const PART_EN = { 1: 'Photographs', 2: 'Question–Response', 3: 'Conversations', 4: 'Talks', 5: 'Incomplete Sentences', 6: 'Text Completion', 7: 'Reading Comprehension' };
  const TAGS = {
    photo: 'Mô tả tranh', 'p1-people': 'Tranh có người', 'p1-object': 'Tranh đồ vật, cảnh',
    wh: 'Câu hỏi Wh-', who: 'Who', where: 'Where', when: 'When', why: 'Why', how: 'How', what: 'What/Which', yesno: 'Câu hỏi Yes/No', choice: 'Câu hỏi lựa chọn', request: 'Đề nghị, yêu cầu', tag: 'Câu hỏi đuôi', statement: 'Câu trần thuật', indirect: 'Trả lời gián tiếp', negative: 'Câu hỏi phủ định',
    gist: 'Ý chính, mục đích', detail: 'Chi tiết', speaker: 'Người nói, nơi chốn', next: 'Việc sắp làm', request2: 'Yêu cầu, đề nghị', problem: 'Vấn đề', implied: 'Hàm ý câu nói', graphic: 'Câu hỏi biểu đồ',
    wordform: 'Từ loại', tense: 'Thì động từ', voice: 'Bị động', agreement: 'Hòa hợp chủ vị', pronoun: 'Đại từ', prep: 'Giới từ', conj: 'Liên từ', relative: 'Mệnh đề quan hệ', participle: 'Phân từ', gerund: 'To V / V-ing', compare: 'So sánh', quant: 'Lượng từ', cond: 'Câu điều kiện, đảo ngữ', subj: 'Thức giả định', adverb: 'Trạng từ', vocab: 'Từ vựng', colloc: 'Collocation', transition: 'Từ nối', insert: 'Chèn câu', modal: 'Động từ khuyết thiếu', noun: 'Mệnh đề danh từ',
    main: 'Ý chính', infer: 'Suy luận', notTrue: 'Câu NOT true', synonym: 'Từ đồng nghĩa', crossref: 'Liên kết nhiều đoạn', purpose: 'Mục đích văn bản', chat: 'Ý người viết (tin nhắn)'
  };
  const LISTEN = new Set([1, 2, 3, 4]);
  const singles = { 1: [], 2: [], 5: [] };
  const sets = { 3: [], 4: [], 6: [], 7: [] };
  const index = {};

  function normQ(arr, id) {
    const [q, opts, ans, why, tag] = arr;
    return { id, q, opts, ans, why: why || '', tag: tag || '' };
  }
  function add(part, list) {
    list.forEach((raw, i) => {
      if (part === 1) {
        const it = Object.assign({ part: 1, tag: raw.tag || 'photo' }, raw);
        singles[1].push(it); index[it.id] = it;
      } else if (part === 2 || part === 5) {
        const it = Array.isArray(raw) ? normQ(raw, 'p' + part + '-' + String(i + 1).padStart(3, '0')) : Object.assign({}, raw);
        it.part = part;
        if (part === 5 && raw.s) it.q = raw.s;
        if (part === 5 && Array.isArray(raw)) { it.s = it.q; }
        singles[part].push(it); index[it.id] = it;
      } else {
        const st = Object.assign({}, raw, { part });
        st.qs = raw.qs.map((q, k) => Object.assign(normQ(q, raw.id + '-' + (k + 1)), { set: raw.id, part }));
        sets[part].push(st); index[st.id] = st;
        st.qs.forEach(q => index[q.id] = q);
      }
    });
  }
  if (typeof P1 !== 'undefined') add(1, P1);
  if (typeof P2 !== 'undefined') add(2, P2);
  if (typeof P3 !== 'undefined') add(3, P3);
  if (typeof P4 !== 'undefined') add(4, P4);
  if (typeof P5 !== 'undefined') add(5, P5);
  if (typeof GRAMMAR !== 'undefined') add(5, GRAMMAR.flatMap(g => (g.quiz || []).map((q, i) => ({ id: 'g-' + g.id + '-' + (i + 1), s: q[0], q: q[0], opts: q[1], ans: q[2], why: q[3], tag: q[4] || g.tag || 'grammar', g: g.id }))));
  if (typeof P6 !== 'undefined') add(6, P6);
  if (typeof P7A !== 'undefined') add(7, P7A);
  if (typeof P7B !== 'undefined') add(7, P7B);

  const IRR = { hold: 'held', lead: 'led', set: 'set', cut: 'cut', put: 'put', oversee: 'overseen', undertake: 'undertaken', withdraw: 'withdrawn', seek: 'sought', forecast: 'forecast', spend: 'spent', build: 'built', send: 'sent', lend: 'lent', deal: 'dealt', bid: 'bid', choose: 'chosen', write: 'written', give: 'given', take: 'taken', break: 'broken', speak: 'spoken', drive: 'driven', rise: 'risen', grow: 'grown', know: 'known', show: 'shown', draw: 'drawn', fly: 'flown', begin: 'begun', buy: 'bought', bring: 'brought', think: 'thought', teach: 'taught', catch: 'caught', sell: 'sold', tell: 'told', pay: 'paid', lay: 'laid', make: 'made', keep: 'kept', leave: 'left', meet: 'met', find: 'found', win: 'won', hang: 'hung', feel: 'felt', mean: 'meant', hear: 'heard', stand: 'stood', understand: 'understood', lose: 'lost', get: 'gotten', run: 'run', come: 'come', go: 'gone', see: 'seen', do: 'done', shut: 'shut', spread: 'spread', upset: 'upset', overcome: 'overcome', mislead: 'misled', foresee: 'foreseen', outgrow: 'outgrown', rebuild: 'rebuilt', resend: 'resent', overtake: 'overtaken' };
  const DBL = new Set(['stop', 'plan', 'ship', 'prefer', 'admit', 'commit', 'transfer', 'refer', 'occur', 'regret', 'submit', 'permit', 'omit', 'equip', 'drop', 'shop', 'chat', 'jog', 'ban', 'scan', 'plug', 'step', 'nod', 'rob', 'fit', 'bar', 'compel', 'control', 'patrol', 'propel', 'expel', 'excel', 'deter', 'confer', 'acquit', 'outfit', 'wrap', 'tap', 'grab', 'skip', 'trim', 'slip', 'zip', 'clap', 'map', 'tag']);
  function inflect(b, kind) {
    if (kind === 'base') return b;
    if (kind === 's') return /(s|x|z|ch|sh)$/.test(b) ? b + 'es' : /[^aeiou]y$/.test(b) ? b.slice(0, -1) + 'ies' : b + 's';
    if (kind === 'ed') {
      if (IRR[b]) return IRR[b];
      if (/e$/.test(b)) return b + 'd';
      if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + 'ied';
      if (DBL.has(b)) return b + b.slice(-1) + 'ed';
      return b + 'ed';
    }
    if (kind === 'ing') {
      if (/ie$/.test(b)) return b.slice(0, -2) + 'ying';
      if (/[^aeioy]e$/.test(b) && !/(ee|ye|oe)$/.test(b)) return b.slice(0, -1) + 'ing';
      if (DBL.has(b)) return b + b.slice(-1) + 'ing';
      return b + 'ing';
    }
    return b;
  }
  function kindOf(base, form) {
    const b = base.toLowerCase(), f = form.toLowerCase();
    for (const k of ['base', 's', 'ed', 'ing']) if (inflect(b, k) === f) return k;
    if (IRR[b] && f === IRR[b]) return 'ed';
    return null;
  }
  const DET = new Set(['the', 'a', 'an', 'his', 'her', 'its', 'their', 'our', 'your', 'my', 'this', 'that', 'these', 'those', 'any', 'some', 'each', 'every', 'no', 'all', 'more', 'most', 'many', 'much', 'several']);
  const MOD = new Set(['will', 'would', 'can', 'could', 'should', 'must', 'may', 'might', 'to', 'please', 'not', "won't", "can't", 'shall']);
  const BE = new Set(['is', 'are', 'was', 'were', 'be', 'been', 'being', 'am', 'become', 'became', 'remain', 'remains', 'seem', 'seems', 'appear', 'appears']);
  function posReason(pos, prev, next) {
    const pv = (prev || '').toLowerCase().replace(/[^a-z']/g, '');
    if (pos === 'n') return DET.has(pv) ? `Sau **${pv}** cần một danh từ.` : pv.endsWith("'s") ? 'Sau sở hữu cách cần danh từ.' : 'Vị trí này cần danh từ (làm chủ ngữ, tân ngữ hoặc sau giới từ).';
    if (pos === 'v') return MOD.has(pv) ? `Sau **${pv}** cần động từ nguyên mẫu.` : 'Câu đang thiếu động từ chính.';
    if (pos === 'adj') return BE.has(pv) ? `Sau **${pv}** dùng tính từ làm bổ ngữ.` : 'Tính từ đứng trước danh từ để bổ nghĩa cho nó.';
    if (pos === 'adv') return 'Trạng từ bổ nghĩa cho động từ, tính từ hoặc cả câu.';
    return 'Chọn từ có nghĩa phù hợp với ngữ cảnh.';
  }
  function autoP5() {
    if (!D.words.length) return;
    const byPos = {};
    D.words.forEach(w => { if (!/\s/.test(w.w)) (byPos[w.pos] = byPos[w.pos] || []).push(w); });
    D.words.forEach(w => {
      if (!w.exRaw || !w.exRaw.includes('*') || /\s/.test(w.form)) return;
      const r = U.rng('a5' + w.id);
      const raw = w.exRaw;
      const blank = raw.replace(/\*[^*]+\*/, '_______');
      const before = raw.split('*')[0].trim().split(/\s+/).pop();
      const after = (raw.split('*')[2] || '').trim().split(/\s+/)[0];
      const famForms = w.fam.filter(f => f.w && !/\s/.test(f.w) && f.w.toLowerCase() !== w.form.toLowerCase());
      const posVi = D.POS[w.pos] || w.pos;
      if (famForms.length >= 3 && ['n', 'v', 'adj', 'adv'].includes(w.pos)) {
        const opts = [w.form, ...U.sample(famForms, 3, r).map(f => f.w)];
        if (opts.length === 4 && new Set(opts.map(o => o.toLowerCase())).size === 4) {
          const it = { id: 'a5f-' + w.id, part: 5, q: blank, s: blank, opts, ans: 0, tag: 'wordform', auto: 1, word: w.id,
            why: posReason(w.pos, before, after) + ` Đáp án **${w.form}** (${posVi}): ${w.vi}. Các lựa chọn khác: ` + famForms.slice(0, 3).map(f => `${f.w}${f.pos ? ' (' + (D.POS[f.pos] || f.pos) + ')' : ''}`).join(', ') + '.' };
          singles[5].push(it); index[it.id] = it;
        }
      }
      const kind = kindOf(w.w, w.form);
      const pool = (byPos[w.pos] || []).filter(x => x.topic !== w.topic && x.id !== w.id && (kind === 'base' || kind === 's' || ['v', 'n'].includes(x.pos)));
      if (!kind || pool.length < 6) return;
      const same = pool.filter(x => x.w[0] === w.w[0]);
      const pickD = U.uniq([...(same.length ? [U.pick(same, r)] : []), ...U.sample(pool, 6, r)]).filter(x => x.w.toLowerCase() !== w.w.toLowerCase()).slice(0, 3);
      if (pickD.length < 3) return;
      const opts = [w.form, ...pickD.map(x => { const f = inflect(x.w.toLowerCase(), kind); return /^[A-Z]/.test(w.form) ? f[0].toUpperCase() + f.slice(1) : f; })];
      if (new Set(opts.map(o => o.toLowerCase())).size < 4) return;
      const it = { id: 'a5v-' + w.id, part: 5, q: blank, s: blank, opts, ans: 0, tag: 'vocab', auto: 1, word: w.id,
        why: `**${w.form}** – ${w.vi}. ` + pickD.map(x => `${x.w}: ${x.vi}`).join('; ') + '.' };
      singles[5].push(it); index[it.id] = it;
    });
  }
  autoP5();

  const get = id => index[id];
  const setOf = q => q && q.set ? index[q.set] : null;
  function count(part) { return part in singles ? singles[part].length : sets[part].reduce((a, s) => a + s.qs.length, 0); }
  function seenScore(p, item) {
    if (!p) return 0;
    if (item.qs) return Math.max(...item.qs.map(q => p.seen[q.id] || 0));
    return p.seen[item.id] || 0;
  }
  function choose(list, n, rnd, p, opts = {}) {
    const used = opts.used || new Set();
    const scored = list.filter(x => !used.has(x.id) && (!opts.filter || opts.filter(x))).map(x => ({ x, k: seenScore(p, x) * 10 + (opts.missFirst && p && p.miss[x.id] ? -50 : 0) + rnd() * (opts.spread || 3) }));
    scored.sort((a, b) => a.k - b.k);
    const out = scored.slice(0, n).map(s => s.x);
    out.forEach(x => used.add(x.id));
    return out;
  }
  function permFor(n, rnd) { return U.shuffle([...Array(n).keys()], rnd); }
  function inst(item, rnd) {
    if (item.part === 1) {
      const T = item.st.map((s, i) => [i, s]).filter(x => x[1][1]);
      const F = item.st.map((s, i) => [i, s]).filter(x => !x[1][1]);
      const t = U.pick(T, rnd)[0];
      const f = U.sample(F, 3, rnd).map(x => x[0]);
      return { id: item.id, part: 1, sel: U.shuffle([t, ...f], rnd) };
    }
    if (item.qs) return { id: item.id, part: item.part, perms: item.qs.map(q => permFor(q.opts.length, rnd)) };
    return { id: item.id, part: item.part, perm: permFor(item.opts.length, rnd) };
  }
  function expand(spec) {
    const item = index[spec.id];
    if (!item) return [];
    if (item.part === 1) {
      const opts = spec.sel.map(i => item.st[i][0]);
      const ans = spec.sel.findIndex(i => item.st[i][1]);
      const whys = spec.sel.map(i => item.st[i][2] || '');
      return [{ id: item.id, part: 1, scene: item.scene, q: '', opts, ans, why: item.why || '', whys, tag: item.tag || 'photo', item }];
    }
    if (item.qs) return item.qs.map((q, k) => {
      const perm = spec.perms[k] || q.opts.map((_, i) => i);
      return Object.assign({}, q, { opts: perm.map(i => q.opts[i]), ans: perm.indexOf(q.ans), set: item.id, setItem: item, idx: k });
    });
    const perm = spec.perm || item.opts.map((_, i) => i);
    return [Object.assign({}, item, { opts: perm.map(i => item.opts[i]), ans: perm.indexOf(item.ans), item })];
  }

  const SPECS = {
    full: { title: 'Đề đầy đủ', sub: '200 câu · khoảng 2 giờ', p1: 6, p2: 25, p3: 13, p4: 10, p5: 30, p6: 4, p7s: [2, 2, 2, 2, 3, 3, 3, 4, 4, 4], p7d: 2, p7t: 3, rMin: 75 },
    mini: { title: 'Đề rút gọn', sub: 'Khoảng 90 câu · 75 phút', p1: 3, p2: 12, p3: 6, p4: 5, p5: 15, p6: 2, p7s: [2, 2, 3, 4], p7d: 1, p7t: 1, rMin: 38 },
    listening: { title: 'Chỉ Listening', sub: '100 câu · khoảng 45 phút', p1: 6, p2: 25, p3: 13, p4: 10, p5: 0, p6: 0, p7s: [], p7d: 0, p7t: 0, rMin: 0 },
    reading: { title: 'Chỉ Reading', sub: '100 câu · 75 phút', p1: 0, p2: 0, p3: 0, p4: 0, p5: 30, p6: 4, p7s: [2, 2, 2, 2, 3, 3, 3, 4, 4, 4], p7d: 2, p7t: 3, rMin: 75 },
    placement: { title: 'Kiểm tra đầu vào', sub: '40 câu · khoảng 25 phút', p1: 2, p2: 6, p3: 2, p4: 2, p5: 10, p6: 1, p7s: [2, 4], p7d: 0, p7t: 0, rMin: 18 }
  };
  function docCount(s) { return (s.docs || []).length; }
  function assemble(kind, seed, p) {
    const sp = SPECS[kind];
    const rnd = U.rng(seed);
    const used = new Set();
    const blocks = [];
    const pushAll = arr => arr.forEach(it => blocks.push(inst(it, rnd)));
    pushAll(choose(singles[1], Math.min(sp.p1, singles[1].length), rnd, p, { used }));
    pushAll(choose(singles[2], Math.min(sp.p2, singles[2].length), rnd, p, { used }));
    const p3g = Math.min(3, Math.round(sp.p3 / 4));
    const p3a = choose(sets[3], sp.p3 - p3g, rnd, p, { used, filter: s => !s.g });
    const p3b = choose(sets[3], sp.p3 - p3a.length, rnd, p, { used, filter: s => !!s.g });
    pushAll(p3a.concat(p3b).slice(0, sp.p3));
    const p4g = Math.min(2, Math.round(sp.p4 / 4));
    const p4a = choose(sets[4], sp.p4 - p4g, rnd, p, { used, filter: s => !s.g });
    const p4b = choose(sets[4], sp.p4 - p4a.length, rnd, p, { used, filter: s => !!s.g });
    pushAll(p4a.concat(p4b).slice(0, sp.p4));
    if (sp.p5) {
      const gram = choose(singles[5], Math.round(sp.p5 * .55), rnd, p, { used, filter: x => !x.auto });
      const wf = choose(singles[5], Math.round(sp.p5 * .2), rnd, p, { used, filter: x => x.tag === 'wordform' });
      const voc = choose(singles[5], sp.p5 - gram.length - wf.length, rnd, p, { used, filter: x => x.auto });
      pushAll(U.shuffle(gram.concat(wf, voc), rnd));
    }
    pushAll(choose(sets[6], sp.p6, rnd, p, { used }));
    const singles7 = [];
    sp.p7s.forEach(nq => {
      const got = choose(sets[7], 1, rnd, p, { used, filter: s => docCount(s) === 1 && s.qs.length === nq });
      if (got.length) singles7.push(got[0]);
      else { const alt = choose(sets[7], 1, rnd, p, { used, filter: s => docCount(s) === 1 }); if (alt.length) singles7.push(alt[0]); }
    });
    pushAll(singles7.sort((a, b) => a.qs.length - b.qs.length));
    pushAll(choose(sets[7], sp.p7d, rnd, p, { used, filter: s => docCount(s) === 2 }));
    pushAll(choose(sets[7], sp.p7t, rnd, p, { used, filter: s => docCount(s) >= 3 }));
    return { kind, seed, title: sp.title, rMin: sp.rMin, blocks };
  }
  function build(test) {
    let num = 0;
    const qs = [];
    const groups = [];
    test.blocks.forEach((b, bi) => {
      const list = expand(b);
      const g = { bi, part: b.part, set: index[b.id] && index[b.id].qs ? index[b.id] : null, nums: [] };
      list.forEach(q => { num++; q.num = num; q.bi = bi; qs.push(q); g.nums.push(num); });
      groups.push(g);
    });
    return { qs, groups, n: num, L: qs.filter(q => LISTEN.has(q.part)).length, R: qs.filter(q => !LISTEN.has(q.part)).length };
  }
  function practice(part, n, opts = {}) {
    const p = Store.P();
    const rnd = opts.seed != null ? U.rng(opts.seed) : Math.random;
    let pool = part in singles ? singles[part] : sets[part];
    if (opts.tag) pool = pool.filter(x => (x.qs ? x.qs.some(q => q.tag === opts.tag) : x.tag === opts.tag));
    if (opts.filter) pool = pool.filter(opts.filter);
    const items = choose(pool, n, rnd, p, { missFirst: !!opts.missFirst, spread: opts.spread || 6 });
    return { kind: 'practice', part, blocks: items.map(it => inst(it, rnd)) };
  }
  function fromIds(ids) {
    const rnd = Math.random;
    const seen = new Set();
    const blocks = [];
    ids.forEach(id => {
      const it = index[id];
      if (!it) return;
      const root = it.set ? index[it.set] : it;
      if (seen.has(root.id)) return;
      seen.add(root.id);
      blocks.push(inst(root, rnd));
    });
    return { kind: 'mistakes', blocks };
  }
  const isListen = part => LISTEN.has(+part);
  return { PART_NAME, PART_EN, TAGS, SPECS, singles, sets, index, get, setOf, count, assemble, build, practice, fromIds, inst, expand, isListen, inflect };
})();
