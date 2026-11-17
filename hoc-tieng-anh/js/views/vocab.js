const VocabUI = (() => {
  const { h } = U;
  const ic = n => Icon.svg(n);
  function wordRow(w, p) {
    const c = p.cards[w.id];
    return h('button.li', { onclick: () => UI.openWord(w) },
      UI.mem(c),
      h('div.grow', h('div.row.g6.wrap', h('span.w', { style: { fontWeight: 700 } }, w.w), h('span.ipa.small', w.ipa), h('span.tag', D.POS_SHORT[w.pos] || w.pos)), h('div.d', w.vi)),
      UI.audioBtn(w.w, { size: 'sm' }));
  }
  function lessonItems(words, topic, p) {
    const items = [];
    const pool = topic.words;
    const r = Math.random;
    const others = (w, n, key) => U.sample(pool.filter(x => x.id !== w.id && x[key] !== w[key]), n, r);
    const mcqVi = w => { const ds = others(w, 3, 'vi'); const opts = U.shuffle([w, ...ds]); return { type: 'mcq', kind: 'Nghĩa của từ', kindIcon: 'book', word: w.w, sub: w.ipa, audio: w.w, autoplayAudio: true, opts: opts.map(x => x.vi), ans: opts.indexOf(w), why: '**' + w.w + '** (' + (D.POS[w.pos] || w.pos) + '): ' + w.vi, wordRef: w }; };
    const mcqEn = w => { const ds = others(w, 3, 'w'); const opts = U.shuffle([w, ...ds]); return { type: 'mcq', kind: 'Chọn từ tiếng Anh', kindIcon: 'type', title: '“' + w.vi + '”', opts: opts.map(x => x.w), ans: opts.indexOf(w), why: w.w + ' ' + w.ipa, wordRef: w }; };
    const listen = w => { const ds = others(w, 3, 'w'); const opts = U.shuffle([w, ...ds]); return { type: 'mcq', kind: 'Nghe và chọn', kindIcon: 'headphones', title: 'Bạn nghe thấy từ nào?', audio: w.w, opts: opts.map(x => x.w), ans: opts.indexOf(w), why: w.w + ' ' + w.ipa + ': ' + w.vi, wordRef: w }; };
    const typ = w => ({ type: 'type', audio: w.w, answer: w.w, hint: w.vi, why: w.ipa, wordRef: w });
    const gap = w => {
      const a = Bank.get('a5v-' + w.id) || Bank.get('a5f-' + w.id);
      if (!a) return null;
      const perm = U.shuffle([0, 1, 2, 3]);
      return { type: 'gap', kind: 'Điền từ (kiểu Part 5)', kindIcon: 'edit', sent: a.q, q: { opts: perm.map(i => a.opts[i]), ans: perm.indexOf(a.ans), why: a.why }, wordRef: w };
    };
    const speak = w => w.ex ? { type: 'speak', title: 'Đọc to câu ví dụ', text: w.ex, wordRef: w } : null;
    const batches = [words.slice(0, 4), words.slice(4, 8)].filter(b => b.length);
    batches.forEach(b => {
      b.forEach(w => items.push({ type: 'intro', word: w }));
      U.shuffle(b).forEach((w, i) => items.push(i % 2 ? listen(w) : mcqVi(w)));
      U.shuffle(b).forEach(w => items.push(mcqEn(w)));
    });
    if (words.length >= 4) items.push({ type: 'match', title: 'Ghép từ với nghĩa', pairs: U.sample(words, Math.min(5, words.length)).map(w => [w.w, w.vi.length > 34 ? w.vi.slice(0, 32) + '…' : w.vi]) });
    U.sample(words, 3).forEach(w => items.push(typ(w)));
    U.sample(words, 3).map(gap).filter(Boolean).forEach(x => items.push(x));
    if (Pron.enabled()) { const s = speak(U.pick(words.filter(w => w.ex && w.ex.length < 90)) || words[0]); if (s) items.push(s); }
    return items;
  }
  return { wordRow, lessonItems };
})();

App.register('vocab', {
  render(root) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const p = Store.P();
    const due = D.dueCards(p).length;
    const cs = D.cardStats(p);
    const learned = Object.keys(p.cards).length;
    const q = h('input.input', { placeholder: 'Tìm từ tiếng Anh hoặc nghĩa tiếng Việt…', style: { maxWidth: '360px' } });
    const res = h('div');
    q.addEventListener('input', U.debounce(() => { U.clear(res); const list = D.search(q.value); if (q.value.trim()) res.appendChild(h('div.card.mt', list.length ? h('div.list.wlist', list.map(w => VocabUI.wordRow(w, p))) : h('div.muted', 'Không tìm thấy từ nào.'))); }, 200));
    root.append(UI.pageHead('Từ vựng TOEIC', D.words.length.toLocaleString('vi-VN') + ' từ theo ' + D.topics.length + ' chủ đề công sở. Học theo nhóm nhỏ, ôn đúng thời điểm vàng bằng thuật toán FSRS.',
      h('div.row.wrap', due ? h('button.btn', { onclick: () => App.go('review') }, ic('repeat'), 'Ôn ' + due + ' thẻ đến hạn') : h('button.btn.secondary', { onclick: () => App.go('review') }, ic('repeat'), 'Ôn tự do'), h('button.btn.secondary', { onclick: () => App.go('words') }, ic('list'), 'Kho từ'))));
    const tot = D.words.length || 1;
    root.appendChild(h('div.card',
      h('div.row.wrap.between',
        h('div.grid.g4.grow', { style: { gap: '18px' } },
          h('div.stat', h('div.v', learned), h('div.k', 'Đã học')),
          h('div.stat', h('div.v', { style: { color: 'var(--ok)' } }, cs.mature), h('div.k', 'Nhớ chắc (≥ 21 ngày)')),
          h('div.stat', h('div.v', { style: { color: 'var(--brand)' } }, cs.young + cs.learning), h('div.k', 'Đang củng cố')),
          h('div.stat', h('div.v', { style: { color: due ? 'var(--bad)' : 'inherit' } }, due), h('div.k', 'Đến hạn ôn')))),
      h('div.vsbar.mt', h('i', { style: { width: (cs.mature / tot * 100) + '%', background: 'var(--ok)' } }), h('i', { style: { width: ((cs.young + cs.learning) / tot * 100) + '%', background: 'var(--brand)' } })),
      h('div.row.mt', q), res));
    root.appendChild(UI.secHead('Chủ đề', 'Mỗi bài 8 từ, khoảng 8 phút'));
    root.appendChild(h('div.grid.g3.stagger', D.topics.map(t => {
      const pg = D.topicProgress(p, t);
      return h('div.card.hover.topic-card', { onclick: () => App.go('topic', t.id) },
        h('span.tile-ic' + (pg.learned === pg.n ? '.ok' : ''), ic(t.icon || 'briefcase')),
        h('div.grow', h('div.t', t.t), h('div.d', t.en + ' · ' + pg.learned + '/' + pg.n + ' từ'), UI.bar(pg.pct, pg.pct >= 1 ? 'ok thin' : 'thin')));
    })));
  }
});

App.register('topic', {
  render(root, params) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const p = Store.P();
    const t = D.topicById[params[0]];
    if (!t) return root.appendChild(UI.empty('Không tìm thấy chủ đề'));
    const pg = D.topicProgress(p, t);
    const left = t.words.filter(w => !p.cards[w.id]).length;
    root.append(h('div.mb', UI.back('vocab', 'Từ vựng')),
      UI.pageHead(t.t, t.en + ' · ' + pg.learned + '/' + pg.n + ' từ đã học',
        h('div.row.wrap',
          left ? h('button.btn', { onclick: () => App.go('learn', t.id) }, ic('sparkle'), 'Học ' + Math.min(8, left) + ' từ mới') : null,
          pg.learned >= 4 ? h('button.btn.secondary', { onclick: () => App.go('learn', t.id, 'review') }, ic('repeat'), 'Luyện lại chủ đề') : null)));
    root.appendChild(h('div.card', h('div.list.wlist', t.words.map(w => VocabUI.wordRow(w, p)))));
  }
});

App.register('learn', {
  render(root, params) {
    const p = Store.P();
    const t = D.topicById[params[0]] || D.nextTopic(p);
    const reviewMode = params[1] === 'review';
    let words = reviewMode ? U.sample(t.words.filter(w => p.cards[w.id]), 8) : D.newWords(p, t, 8);
    if (!words.length) words = U.sample(t.words, 8);
    const items = VocabUI.lessonItems(words, t, p).map(it => reviewMode && it.type === 'intro' ? null : it).filter(Boolean);
    const firstOk = {};
    return Quiz.run(root, {
      title: t.t, items, xpPer: 2, exitTo: 'topic/' + t.id,
      onExit: () => App.go('topic', t.id),
      onAnswer: (it, ok) => {
        const w = it.wordRef; if (!w) return;
        if (firstOk[w.id] === undefined) firstOk[w.id] = ok; else firstOk[w.id] = firstOk[w.id] && ok;
        if (it.type === 'gap') Store.record(5, ok, null, 'vocab');
      },
      onDone: r => {
        const now = Date.now();
        words.forEach(w => {
          const ok = firstOk[w.id] !== false;
          if (!p.cards[w.id]) p.cards[w.id] = SRS.introduce(null, ok ? 3 : 1, now);
          else if (reviewMode) p.cards[w.id] = SRS.grade(p.cards[w.id], ok ? 3 : 1, now);
        });
        if (!r.early) { p.stats.lessons++; Store.bump('lessons'); p.topics[t.id] = { at: now, acc: r.acc }; }
        Store.save(true);
      },
      again: () => App.go('learn', t.id)
    });
  }
});

App.register('words', {
  render(root) {
    const { h } = U;
    const p = Store.P();
    let filter = 'all', topic = '';
    const list = h('div.list.wlist');
    const seg = h('div.seg', [['all', 'Tất cả'], ['learned', 'Đã học'], ['weak', 'Sắp quên'], ['new', 'Chưa học']].map(([k, t]) => h('button' + (k === filter ? '.on' : ''), { onclick: e => { filter = k; [...seg.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); draw(); } }, t)));
    const sel = h('select.select', { style: { maxWidth: '260px' }, onchange: e => { topic = e.target.value; draw(); } }, h('option', { value: '' }, 'Mọi chủ đề'), D.topics.map(t => h('option', { value: t.id }, t.t)));
    function draw() {
      U.clear(list);
      let ws = D.words.filter(w => !topic || w.topic === topic);
      if (filter === 'learned') ws = ws.filter(w => p.cards[w.id]);
      if (filter === 'new') ws = ws.filter(w => !p.cards[w.id]);
      if (filter === 'weak') ws = ws.filter(w => p.cards[w.id] && UI.memLevel(p.cards[w.id]) <= 2);
      ws.slice(0, 400).forEach(w => list.appendChild(VocabUI.wordRow(w, p)));
      if (!ws.length) list.appendChild(UI.empty('Không có từ nào trong mục này.'));
    }
    root.append(h('div.mb', UI.back('vocab', 'Từ vựng')), UI.pageHead('Kho từ', 'Bấm vào từ để xem phiên âm, ví dụ, họ từ và luyện phát âm.'), h('div.row.wrap.mb', seg, sel), h('div.card', list));
    draw();
  }
});
