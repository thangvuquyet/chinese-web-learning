App.register('grammar', {
  render(root, params) {
    const { h, clear } = U;
    const p = Store.P();
    if (!params[0]) return list();
    const g = D.gById[params[0]];
    if (!g) { root.appendChild(UI.empty('Không tìm thấy điểm ngữ pháp.')); return; }
    detail();

    function list() {
      let lv = 3, q = '';
      root.appendChild(UI.pageTitle('🧩', 'Ngữ pháp HSK3 · HSK4'));
      const tabs = h('div.tabs');
      const search = h('input.input', { placeholder: '🔍 Tìm: 把, 被, 只要, so sánh…', oninput: e => { q = e.target.value.trim(); paint(); } });
      const box = h('div.list.mt');
      root.append(tabs, search, box);
      function paintTabs() {
        clear(tabs);
        [[3, 'HSK3 · 34 điểm'], [4, 'HSK4 · 32 điểm']].forEach(([v, label]) => tabs.appendChild(h('button' + (lv === v ? '.on' : ''), { onclick: () => { lv = v; paintTabs(); paint(); } }, label)));
      }
      function paint() {
        clear(box);
        const items = D.grammar.filter(x => x.lv === lv && (!q || (x.title + x.pattern + x.explain).toLowerCase().includes(q.toLowerCase())));
        items.forEach(x => {
          const rec = p.grammar[x.id];
          box.appendChild(h('div.li', { onclick: () => App.go('grammar', x.id) },
            h('span', { style: { fontSize: '26px' } }, x.icon),
            h('div.lm', h('span', { style: { fontWeight: 700 } }, x.title), h('b.zh', { style: { fontWeight: 500 } }, x.pattern)),
            h('span.st', rec ? (rec.best >= 0.9 ? '🌟' : '✅') : '›')));
        });
        if (!items.length) box.appendChild(UI.empty('Không tìm thấy, thử từ khóa khác nhé.'));
      }
      paintTabs(); paint();
    }

    function detail() {
      clear(root);
      const rec = p.grammar[g.id];
      root.append(
        h('div.row', UI.backBtn(() => App.go('grammar'), '← Danh sách'), h('span.grow'), h('span.pill.info', 'HSK ' + g.lv)),
        h('div.card.tint-indigo.mt.page-enter',
          h('div', { style: { fontSize: '44px' } }, g.icon),
          h('h2', g.title),
          h('div.passage', { style: { fontSize: '18px', margin: '8px 0', background: '#fff' } }, '🧱 ', g.pattern),
          h('p', { style: { fontWeight: 500, fontSize: '16px' } }, g.explain)),
        h('div.sec-title', '🗣️ Ví dụ (bấm 🔊 để nghe)'),
        h('div.col', g.examples.map(([seg, vi]) => UI.exampleBox({ text: U.joinSeg(seg), vi }))),
        g.notes && g.notes.length ? h('div.sec-title', '⚠️ Lỗi hay gặp & lưu ý') : null,
        g.notes && g.notes.length ? h('div.card.tint-clay', h('ul', { style: { margin: 0, paddingLeft: '20px', fontWeight: 500 } }, g.notes.map(n => h('li', { style: { margin: '6px 0' } }, n))), ) : null,
        h('div.card.tint-leaf.mt', h('div.tip-card', h('span.te', '✍️'), h('div', h('b', 'Tự đặt 3 câu'), h('p', 'Trước khi làm bài tập, thử nói to 3 câu theo mẫu về chính cuộc sống của bạn (ví dụ về gia đình, công việc). Câu gắn với bản thân nhớ lâu hơn rất nhiều!')))),
        h('div.col.mt2', h('button.btn.indigo.block', { onclick: practice }, rec ? '🔁 Làm lại bài tập' : '🎯 Làm bài tập'),
          rec ? h('div.center.small.muted', { style: { fontWeight: 600 } }, `Lần tốt nhất: ${Math.round(rec.best * 100)}%`) : null));
    }
    function practice() {
      clear(root);
      const run = R.runner(root, { questions: Q.grammarQuiz(g, Date.now()), onExit: detail, onFinish: finish });
      root._cleanup = run.cleanup;
    }
    function finish(res) {
      const prev = p.grammar[g.id] || {};
      p.grammar[g.id] = { best: Math.max(prev.best || 0, res.acc), at: Date.now() };
      const nodeId = 'g:' + g.id;
      const st = res.acc >= 0.9 ? 3 : res.acc >= 0.7 ? 2 : 1;
      const pn = p.nodes[nodeId] || {};
      p.nodes[nodeId] = { done: true, stars: Math.max(pn.stars || 0, st), best: Math.max(pn.best || 0, res.acc), at: Date.now() };
      const d = Store.dayRec(p);
      d.lessons = (d.lessons || 0) + 1;
      if (res.acc === 1) { p.stats.perfect++; d.perfect = (d.perfect || 0) + 1; }
      Store.save(true);
      const xp = 12 + Math.round(res.acc * 8);
      const ev = Store.addXP(xp);
      const node = D.nodeById[nodeId];
      const nxt = node ? D.nextNode(node) : null;
      R.resultScreen(root, res, {
        xp,
        buttons: [
          nxt ? h('button.btn.block', { onclick: () => App.go('path', nxt.id) }, '▶️ Bài tiếp theo: ' + nxt.title) : null,
          h('button.btn.ghost.block', { onclick: detail }, '📖 Xem lại lý thuyết'),
          h('button.btn.ghost.block', { onclick: () => App.go('grammar') }, '🧩 Danh sách ngữ pháp')
        ]
      });
      UI.celebrate(ev);
    }
  }
});
