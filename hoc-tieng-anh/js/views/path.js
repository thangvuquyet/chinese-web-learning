const Path = (() => {
  const PART_ROT = [5, 2, 7, 3, 6, 4, 5, 1, 7, 2, 3, 6, 4, 7, 5];
  function units() {
    const G = typeof GRAMMAR !== 'undefined' ? GRAMMAR : [];
    const S = typeof STRATS !== 'undefined' ? STRATS : [];
    const n = Math.max(D.topics.length, G.length);
    return Array.from({ length: n }, (_, i) => ({
      i, id: 'u' + (i + 1),
      topic: D.topics[i] || null,
      gram: G[i] || null,
      strat: S[i] || null,
      part: PART_ROT[i % PART_ROT.length]
    }));
  }
  function state(p, u) {
    const st = p.units[u.id] || {};
    const steps = [];
    if (u.topic) { const pg = D.topicProgress(p, u.topic); steps.push({ k: 'v', icon: 'cards', t: 'Từ vựng', done: pg.pct >= .8, sub: pg.learned + '/' + pg.n, go: () => App.go(pg.learned < pg.n ? 'learn' : 'topic', u.topic.id) }); }
    if (u.gram) steps.push({ k: 'g', icon: 'blocks', t: 'Ngữ pháp', done: !!p.grammar[u.gram.id], go: () => App.go('gram', u.gram.id) });
    if (u.strat) steps.push({ k: 's', icon: 'bulb', t: 'Chiến thuật', done: !!p.strat[u.strat.id], go: () => App.go('strat', u.strat.id) });
    steps.push({ k: 'p', icon: u.part <= 4 ? 'headphones' : 'book', t: 'Luyện Part ' + u.part, done: !!st.p, go: () => { p.units[u.id] = Object.assign({}, p.units[u.id], { p: Date.now() }); Store.save(); App.go('practice', u.part); } });
    steps.push({ k: 'c', icon: 'checkCircle', t: 'Kiểm tra', done: !!st.c, go: () => App.go('unitcheck', u.i) });
    return { steps, done: steps.every(s => s.done), n: steps.filter(s => s.done).length };
  }
  return { units, state };
})();

App.register('path', {
  render(root) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const p = Store.P();
    const us = Path.units();
    const sts = us.map(u => Path.state(p, u));
    const curI = sts.findIndex(s => !s.done);
    const doneN = sts.filter(s => s.done).length;
    root.appendChild(UI.pageHead('Lộ trình 900', 'Mỗi chặng gồm từ vựng theo chủ đề, một điểm ngữ pháp, một chiến thuật làm bài, luyện Part và bài kiểm tra ngắn. Học theo thứ tự hoặc chọn chặng bạn cần.',
      h('div.row', h('span.pill.lg.ok', doneN + '/' + us.length + ' chặng'), curI >= 0 ? h('button.btn', { onclick: () => { const s = sts[curI].steps.find(x => !x.done); s && s.go(); } }, ic('play'), 'Học tiếp chặng ' + (curI + 1)) : null)));
    const pr = Score.predict(p);
    const third = Math.ceil(us.length / 3);
    const phases = [[0, 'Nền tảng vững', 'Mục tiêu 650–700 · chắc từ loại, thì, Part 1–2–5', third], [1, 'Tăng tốc', 'Mục tiêu 750–800 · Part 3–4 đọc trước câu hỏi, Part 6–7 tốc độ', third * 2], [2, 'Về đích 900', 'Mục tiêu 850–900 · đoạn kép, ba đoạn, bẫy khó, đề đầy đủ', us.length]];
    let from = 0;
    phases.forEach(([pi, t, d, to]) => {
      const list = us.slice(from, to);
      const offset = from;
      from = to;
      if (!list.length) return;
      root.appendChild(h('div.phase',
        h('div.phase-dot', pi + 1),
        h('div.phase-h', h('h2', t), h('span.small.muted', d)),
        list.map((u, k) => {
          const i = offset + k;
          const s = sts[i];
          const cur = i === curI;
          return h('div.unit' + (s.done ? '.done' : '') + (cur ? '.current' : ''),
            h('div.u-no', s.done ? ic('check') : i + 1),
            h('div', { style: { minWidth: 0 } },
              h('div.t', u.topic ? u.topic.t : 'Chặng ' + (i + 1)),
              h('div.small.muted', [u.gram && u.gram.t, 'Part ' + u.part].filter(Boolean).join(' · ')),
              h('div.steps', s.steps.map(st => h('button.step' + (st.done ? '.done' : ''), { onclick: st.go, title: st.t }, ic(st.done ? 'check' : st.icon), st.t + (st.sub && !st.done ? ' ' + st.sub : ''))))),
            h('div', UI.ring(s.n / s.steps.length, { size: 40, stroke: 4, color: s.done ? 'var(--ok)' : 'var(--brand)', label: s.n + '/' + s.steps.length, font: 11 })));
        })));
    });
    if (pr && pr.hasData) root.appendChild(h('div.callout.mt2', ic('target'), h('div', 'Điểm dự đoán hiện tại ', h('b', pr.T), '. Hoàn thành mỗi giai đoạn rồi làm một đề rút gọn để kiểm tra tiến bộ.')));
  }
});

App.register('unitcheck', {
  render(root, params) {
    const p = Store.P();
    const u = Path.units()[+params[0]];
    if (!u) return root.appendChild(UI.empty('Không tìm thấy chặng này.'));
    const items = [];
    if (u.topic) {
      const pool = u.topic.words;
      U.sample(pool, 6).forEach(w => { const ds = U.sample(pool.filter(x => x.id !== w.id), 3); const opts = U.shuffle([w, ...ds]); items.push({ type: 'mcq', kind: 'Từ vựng', kindIcon: 'cards', word: w.w, sub: w.ipa, audio: w.w, opts: opts.map(x => x.vi), ans: opts.indexOf(w), why: w.w + ': ' + w.vi, wordRef: w }); });
      U.sample(pool, 8).map(w => Bank.get('a5v-' + w.id) || Bank.get('a5f-' + w.id)).filter(Boolean).slice(0, 4).forEach(a => { const perm = U.shuffle([0, 1, 2, 3]); items.push({ type: 'gap', kind: 'Part 5', kindIcon: 'edit', sent: a.q, q: { opts: perm.map(i => a.opts[i]), ans: perm.indexOf(a.ans), why: a.why }, qid: a.id, tag: a.tag }); });
    }
    if (u.gram) U.sample(u.gram.quiz || [], 4).forEach((q, k) => { const perm = U.shuffle(q[1].map((_, i) => i)); items.push({ type: 'gap', kind: u.gram.t, kindIcon: 'blocks', sent: q[0], q: { opts: perm.map(i => q[1][i]), ans: perm.indexOf(q[2]), why: q[3] }, tag: q[4] || u.gram.tag }); });
    return Quiz.run(root, {
      title: 'Kiểm tra chặng ' + (u.i + 1), items: U.shuffle(items), xpPer: 3, requeue: false,
      onExit: () => App.go('path'),
      onAnswer: (it, ok) => { if (it.type === 'gap') Store.record(5, ok, it.qid || null, it.tag); },
      onDone: r => {
        if (r.early) return;
        if (r.acc >= .7) { p.units[u.id] = Object.assign({}, p.units[u.id], { c: Date.now(), acc: r.acc }); FX.toast('Đã qua chặng ' + (u.i + 1)); }
        else FX.toast('Cần đúng từ 70% để qua chặng. Ôn lại rồi thử nhé.');
        Store.save(true);
      },
      again: () => App.go('unitcheck', u.i)
    });
  }
});
