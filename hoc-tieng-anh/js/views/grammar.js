const Lesson = (() => {
  const { h } = U;
  const ic = n => Icon.svg(n);
  function blocks(list) {
    const out = [];
    let ul = null;
    (list || []).forEach(raw => {
      const k = raw.indexOf(':');
      const type = raw.slice(0, k), text = raw.slice(k + 1).trim();
      if (type !== 'li') ul = null;
      if (type === 'h') out.push(h('h3', text));
      else if (type === 'p') out.push(h('p', U.rich(text)));
      else if (type === 'li') { if (!ul) { ul = h('ul'); out.push(ul); } ul.appendChild(h('li', U.rich(text))); }
      else if (type === 'ex') { const [en, vi] = text.split('|'); out.push(h('div.ex', h('div.grow', h('div.en', U.rich(en)), vi ? h('div.small.muted.mt4', vi) : null), UI.audioBtn(en.replace(/\*\*/g, '').replace(/\*/g, ''), { size: 'sm' }))); }
      else if (type === 'tip') out.push(h('div.callout.tip', ic('bulb'), h('div', U.rich(text))));
      else if (type === 'trap') out.push(h('div.callout.trap', ic('alert'), h('div', h('b', 'Bẫy TOEIC: '), U.rich(text))));
      else if (type === 'note') out.push(h('div.callout', ic('info'), h('div', U.rich(text))));
      else if (type === 'tbl') { const rows = text.split(';').map(r => r.split('|')); out.push(h('table', h('thead', h('tr', rows[0].map(c => h('th', c)))), h('tbody', rows.slice(1).map(r => h('tr', r.map(c => h('td', U.rich(c)))))))); }
    });
    return out;
  }
  return { blocks };
})();

App.register('grammar', {
  render(root) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const p = Store.P();
    const list = typeof GRAMMAR !== 'undefined' ? GRAMMAR : [];
    const done = list.filter(g => p.grammar[g.id]).length;
    root.appendChild(UI.pageHead('Ngữ pháp Part 5–6', 'Các chủ điểm ra nhiều nhất trong Part 5 và Part 6, giải thích bằng tiếng Việt kèm bẫy hay gặp. Mỗi bài có câu luyện kiểu đề thật.',
      h('div.row', h('span.pill.lg.ok', done + '/' + list.length + ' bài'), h('button.btn', { onclick: () => App.go('practice', 5) }, ic('zap'), 'Luyện Part 5'))));
    const phases = [[1, 'Nền tảng', 'Chắc phần này là có 650–700'], [2, 'Tăng tốc', 'Phân biệt các bẫy hay gặp để lên 800'], [3, 'Về đích', 'Cấu trúc khó và từ vựng ngữ pháp cho 850–900']];
    phases.forEach(([lv, t, d]) => {
      const gs = list.filter(g => (g.lv || 1) === lv);
      if (!gs.length) return;
      root.appendChild(UI.secHead(t, d));
      root.appendChild(h('div.grid.g2.stagger', gs.map(g => {
        const r = p.grammar[g.id];
        const tag = Bank.TAGS[g.tag] ? g.tag : null;
        const st = tag && p.tags[tag];
        return h('div.card.hover', { onclick: () => App.go('gram', g.id) },
          h('div.row.top', h('span.tile-ic' + (r ? '.ok' : '.R'), ic(r ? 'check' : 'blocks')),
            h('div.grow', h('div', { style: { fontWeight: 700 } }, g.t), h('div.small.muted', g.en), h('p.small.mt8', { style: { color: 'var(--ink-2)' } }, g.sum)),
            h('div.col.g4', { style: { alignItems: 'flex-end' } }, r ? h('span.pill.ok', Math.round((r.best || 0) * 100) + '%') : h('span.pill', (g.quiz || []).length + ' câu'), st && st.n >= 5 ? h('span.xs.muted', 'Part 5: ' + U.pct(st.ok, st.n) + '%') : null)));
      })));
    });
  }
});

App.register('gram', {
  render(root, params) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const p = Store.P();
    const list = typeof GRAMMAR !== 'undefined' ? GRAMMAR : [];
    const g = list.find(x => x.id === params[0]);
    if (!g) return root.appendChild(UI.empty('Không tìm thấy bài ngữ pháp'));
    if (params[1] === 'quiz') {
      const items = U.shuffle((g.quiz || []).map((q, k) => {
        const perm = U.shuffle(q[1].map((_, i) => i));
        return { type: 'gap', kind: g.t, kindIcon: 'blocks', sent: q[0], q: { opts: perm.map(i => q[1][i]), ans: perm.indexOf(q[2]), why: q[3] }, qid: 'g-' + g.id + '-' + (k + 1), tag: q[4] || g.tag };
      }));
      return Quiz.run(root, {
        title: g.t, items, xpPer: 3, requeue: true,
        onExit: () => App.go('gram', g.id),
        onAnswer: (it, ok) => Store.record(5, ok, it.qid, it.tag),
        onDone: r => {
          if (r.early) return;
          const prev = p.grammar[g.id];
          p.grammar[g.id] = { at: Date.now(), best: Math.max(r.acc, prev ? prev.best || 0 : 0) };
          Store.bump('gram');
          Store.save(true);
        },
        again: () => App.go('gram', g.id, 'quiz')
      });
    }
    const idx = list.indexOf(g);
    const nextG = list[idx + 1];
    const r = p.grammar[g.id];
    root.append(h('div.mb', UI.back('grammar', 'Ngữ pháp')),
      h('div.lesson',
        h('div.eyebrow.brand', 'Ngữ pháp · ' + g.en),
        h('h1', { style: { fontSize: '30px', fontWeight: 800, letterSpacing: '-.025em', margin: '6px 0 8px' } }, g.t),
        h('p', { style: { fontSize: '16.5px', color: 'var(--ink-2)' } }, U.rich(g.sum)),
        Lesson.blocks(g.body),
        h('div.card.mt2', { style: { background: 'linear-gradient(135deg,#ECEFFF,#F1EDFD)', borderColor: 'var(--brand-m)' } },
          h('div.row.wrap.between',
            h('div', h('h3', 'Luyện ngay ' + (g.quiz || []).length + ' câu kiểu Part 5'), h('div.small.muted', r ? 'Lần trước đúng ' + Math.round((r.best || 0) * 100) + '%' : 'Làm sai sẽ có giải thích chi tiết')),
            h('div.row', h('button.btn.lg', { onclick: () => App.go('gram', g.id, 'quiz') }, ic('play'), 'Bắt đầu'), nextG ? h('button.btn.secondary.lg', { onclick: () => App.go('gram', nextG.id) }, 'Bài tiếp', ic('chevron')) : null)))));
  }
});

App.register('strat', {
  render(root, params) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const list = typeof STRATS !== 'undefined' ? STRATS : [];
    const s = list.find(x => x.id === params[0]);
    const p = Store.P();
    if (!s) {
      root.appendChild(UI.pageHead('Chiến thuật làm bài', 'Mẹo theo từng Part, đúc kết từ cách ra đề của ETS.'));
      root.appendChild(h('div.grid.g2.stagger', list.map(x => h('div.card.hover', { onclick: () => App.go('strat', x.id) }, h('div.row.top', h('span.tile-ic' + (x.part >= 5 ? '.R' : ''), ic(x.part >= 5 ? 'book' : 'headphones')), h('div.grow', h('div.eyebrow', 'Part ' + x.part), h('div', { style: { fontWeight: 700 } }, x.t), h('p.small.muted.mt4', x.sum)), p.strat[x.id] ? h('span.pill.ok', ic('check')) : null)))));
      return;
    }
    p.strat[s.id] = Date.now(); Store.save();
    root.append(h('div.mb', UI.back(() => history.back(), 'Quay lại')),
      h('div.lesson',
        h('div.eyebrow.brand', 'Chiến thuật · Part ' + s.part + ' · ' + Bank.PART_NAME[s.part]),
        h('h1', { style: { fontSize: '30px', fontWeight: 800, letterSpacing: '-.025em', margin: '6px 0 8px' } }, s.t),
        h('p', { style: { fontSize: '16.5px', color: 'var(--ink-2)' } }, U.rich(s.sum)),
        Lesson.blocks(s.body),
        h('div.row.mt2', h('button.btn.lg', { onclick: () => App.go('practice', s.part) }, ic('play'), 'Luyện Part ' + s.part + ' ngay'))));
  }
});
