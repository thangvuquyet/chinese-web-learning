App.register('path', {
  render(root, params) {
    const { h } = U;
    const p = Store.P();
    const cur = D.currentNode(p);
    root.appendChild(UI.pageTitle('🗺️', 'Lộ trình HSK2 → HSK4'));
    root.appendChild(h('div.legend', h('span', h('i.u'), 'Từ vựng'), h('span', h('i.g'), 'Ngữ pháp'), h('span', h('i.c'), 'Kiểm tra nhỏ'), h('span', h('i.f'), 'Thi cuối chặng')));
    root.appendChild(h('p.small.muted', { style: { marginTop: '6px' } }, 'Đi lần lượt từng bài. Chặng 1 là ôn tập HSK1–2, có thể làm bài kiểm tra vượt cấp để bỏ qua.'));
    let curEl = null;
    for (const st of D.STAGES) {
      const pr = D.stageProgress(p, st);
      const unlocked = D.stageUnlocked(p, st);
      const head = h('div.stage-head.' + st.cls,
        h('span.deco', st.deco),
        h('h2', st.title + (unlocked ? '' : ' 🔒')),
        h('p', st.sub),
        UI.progress(pr.pct),
        h('div.small', { style: { marginTop: '6px', fontWeight: 600 } }, `${pr.done}/${pr.total} bài`),
        h('div.stage-actions',
          st.id < 3 && !p.testOut[st.key] && !D.isDone(p, `f${st.id}`) ? h('button.btn.sm', { onclick: () => App.go('check', 'testout-' + st.key) }, '⚡ Kiểm tra vượt cấp') : null,
          p.testOut[st.key] ? h('span.pill.ok', '✓ Đã vượt cấp') : null));
      root.appendChild(head);
      const path = h('div.path');
      st.nodes.forEach((n, i) => {
        const done = D.isDone(p, n.id);
        const open = D.nodeUnlocked(p, n);
        const isCur = cur && cur.id === n.id;
        const x = Math.round(Math.sin(i * 0.9) * 80);
        const rec = p.nodes[n.id];
        const btn = h('button.node.' + (n.type === 'unit' ? 'unit' : n.type) + (done ? '.done' : '') + (!open ? '.locked' : '') + (isCur ? '.current' : ''),
          { style: `--x:${x}px`, onclick: () => openNode(n), title: n.title, 'aria-label': n.title },
          glyph(n), done ? h('span.done-b', Icon.svg('check')) : null, !open ? h('span.lock', Icon.svg('lock')) : null);
        const wrapEl = h('div.node-wrap',
          isCur ? h('div.here', { style: `--x:${x}px` }, 'Học ở đây!') : null,
          btn,
          rec && rec.stars ? h('div.node-stars', { style: `--x:${x}px` }, '⭐'.repeat(rec.stars)) : h('div.node-label', { style: `--x:${x}px` }, short(n.title)));
        if (isCur) {
          curEl = wrapEl;
          const m = FX.mascot('happy', 'sm');
          m.classList.add('path-mascot');
          m.style.left = `calc(50% + ${x > 0 ? x - 128 : x + 62}px)`;
          wrapEl.appendChild(m);
        }
        path.appendChild(wrapEl);
      });
      root.appendChild(path);
    }
    const focus = params[0] ? D.nodeById[params[0]] : null;
    setTimeout(() => {
      if (focus) openNode(focus);
      if (curEl) curEl.scrollIntoView({ behavior: FX.motionOk() ? 'smooth' : 'auto', block: 'center' });
    }, 120);

    function glyph(n) {
      if (n.type === 'unit') { const w = D.byId[n.words[0]]; return w ? [...w.hz][0] : '字'; }
      if (n.type === 'grammar') return Icon.svg('blocks');
      if (n.type === 'check') return Icon.svg('exam');
      return '考';
    }
    function short(t) { return t.length > 22 ? t.slice(0, 21) + '…' : t; }
    function openNode(n) {
      const open = D.nodeUnlocked(p, n);
      const rec = p.nodes[n.id];
      const ws = D.nodeWords(n);
      const gs = D.nodeGrammar(n);
      FX.modal(close => h('div',
        h('div.center', h('div', { style: { fontSize: '56px', animation: 'pop-in .4s' } }, n.emo)),
        h('h2.center', n.title),
        h('div.center.mb', h('span.pill.info', { unit: 'Từ vựng', grammar: 'Ngữ pháp', check: 'Kiểm tra nhỏ', final: 'Thi cuối chặng' }[n.type]), ' ', rec && rec.stars ? h('span.pill.ok', '⭐'.repeat(rec.stars) + (rec.best != null ? ` · ${Math.round(rec.best * 100)}%` : '')) : null),
        n.type === 'unit' ? h('div.row.wrap', { style: { justifyContent: 'center' } }, ws.map(w => h('span.pill', { style: { fontSize: '15px' } }, h('span.zh', w.hz), ' ', w.vi.split(/[,;]/)[0]))) : null,
        n.type === 'grammar' ? h('p.center', { style: { fontWeight: 500 } }, h('span.zh', gs[0].pattern)) : null,
        n.type === 'check' || n.type === 'final' ? h('p.center.muted', { style: { fontWeight: 500 } }, `Ôn lại ${ws.length} từ và ${gs.length} điểm ngữ pháp. Đạt từ 70% để qua.`) : null,
        !open ? h('p.center', { style: { fontWeight: 600, color: 'var(--jade-d)' } }, '🔒 Hoàn thành bài trước để mở khóa nhé (hoặc bật "Mở khóa tất cả" trong Cài đặt).') : null,
        h('div.col.mt',
          open ? h('button.btn.block', {
            onclick: () => {
              close();
              if (n.type === 'unit') App.go('learn', n.id);
              else if (n.type === 'grammar') App.go('grammar', n.gid);
              else App.go('check', n.id);
            }
          }, rec && rec.done ? '🔁 Học lại' : n.type === 'unit' ? '🚀 Bắt đầu học' : n.type === 'grammar' ? '📖 Học ngữ pháp' : '📝 Làm bài kiểm tra') : null)));
    }
  }
});
