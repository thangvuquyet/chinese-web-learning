const ExamDB = (() => {
  const rk = () => 'pawlish-run-' + Store.db.active;
  const sk = () => 'pawlish-res-' + Store.db.active;
  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  function saveRun(r) { write(rk(), r); }
  function loadRun() { return read(rk()); }
  function clearRun() { localStorage.removeItem(rk()); }
  function saveRes(r) {
    const all = read(sk()) || {};
    all[r.id] = r;
    const ids = Object.keys(all).sort((a, b) => all[a].at - all[b].at);
    while (ids.length > 12) delete all[ids.shift()];
    write(sk(), all);
  }
  function getRes(id) { return (read(sk()) || {})[id] || null; }
  return { saveRun, loadRun, clearRun, saveRes, getRes };
})();

App.register('tests', {
  render(root) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const p = Store.P();
    const run = ExamDB.loadRun();
    const tests = p.tests.filter(t => t.kind !== 'placement');
    root.appendChild(UI.pageHead('Thi thử TOEIC', 'Đề được ghép từ kho câu hỏi theo đúng cấu trúc ETS, ưu tiên câu bạn chưa làm. Mỗi lần làm là một đề mới, có quy đổi điểm 10–990 và phân tích từng Part.'));
    if (run && run.status === 'running') root.appendChild(h('div.callout.warn.mb', ic('clock'), h('div.grow', h('b', 'Bạn đang làm dở: ' + run.title), h('div.small', 'Đã trả lời ' + Object.keys(run.answers || {}).length + ' câu · bắt đầu ' + U.ago(run.startedAt))), h('button.btn.sm', { onclick: () => App.go('exam', 'resume') }, 'Làm tiếp')));
    const card = (kind, icon, tone, extra) => {
      const sp = Bank.SPECS[kind];
      const last = p.tests.filter(t => t.kind === kind).slice(-1)[0];
      return h('div.card.hover', { onclick: () => start(kind) },
        h('div.row.top', h('span.tile-ic.lg' + (tone ? '.' + tone : ''), ic(icon)), h('div.grow', h('div', { style: { fontWeight: 750, fontSize: '16.5px' } }, sp.title), h('div.small.muted', sp.sub), extra ? h('p.small.mt8', { style: { color: 'var(--ink-2)' } }, extra) : null), last ? h('div.col.g4', { style: { alignItems: 'flex-end' } }, h('span.pill.brand', last.T != null ? last.T : Math.round((last.acc || 0) * 100) + '%'), h('span.xs.muted', U.fmtShort(last.at))) : null));
    };
    root.appendChild(h('div.grid.g2.stagger',
      card('full', 'exam', 'dark', 'Mô phỏng ngày thi: Listening chạy liền mạch như băng thật, Reading 75 phút.'),
      card('mini', 'timer', '', 'Nửa đề, khoảng 75 phút. Hợp làm cuối tuần để đo tiến bộ.'),
      card('listening', 'headphones', '', 'Chỉ 4 Part nghe, khoảng 45 phút.'),
      card('reading', 'book', 'R', 'Chỉ 3 Part đọc, 75 phút. Luyện quản lý thời gian.'),
      card('placement', 'target', 'gold', p.level0 ? 'Đã làm ngày ' + U.fmtDate(p.level0.at) + '. Làm lại để cập nhật mức xuất phát.' : 'Làm trước tiên để app dự đoán điểm và xếp lộ trình.')));
    root.appendChild(UI.secHead('Bộ 20 đề đầy đủ', 'Mỗi đề có mã riêng, câu hỏi thay đổi giữa các lần làm'));
    root.appendChild(h('div.grid', { style: { gridTemplateColumns: 'repeat(auto-fill,minmax(112px,1fr))', gap: '10px' } }, Array.from({ length: 20 }, (_, i) => {
      const seed = 'set' + (i + 1);
      const done = p.tests.filter(t => t.seedName === seed);
      const best = done.length ? Math.max(...done.map(t => t.T || 0)) : null;
      return h('button.card.hover.center', { style: { padding: '14px 8px' }, onclick: () => start('full', seed) }, h('div.eyebrow', 'Đề'), h('div', { style: { fontSize: '26px', fontWeight: 850, letterSpacing: '-.03em' } }, i + 1), best != null ? h('span.pill.ok', best) : h('span.xs.muted', 'Chưa làm'));
    })));
    if (tests.length) {
      root.appendChild(UI.secHead('Lịch sử thi thử', tests.length + ' đề'));
      const withT = tests.filter(t => t.T != null);
      if (withT.length >= 2) root.appendChild(h('div.card.mb', Charts.line({ series: [{ name: 'Tổng điểm', color: 'var(--brand)', area: true, pts: withT.map((t, i) => [i, t.T]) }], labels: withT.map(t => U.fmtShort(t.at)), target: p.target, h: 200 })));
      root.appendChild(h('div.card', h('table.tbl', h('thead', h('tr', h('th', 'Ngày'), h('th', 'Loại đề'), h('th.r', 'Listening'), h('th.r', 'Reading'), h('th.r', 'Tổng'), h('th.r', 'Thời gian'), h('th'))),
        h('tbody', tests.slice().reverse().map(t => h('tr', h('td', U.fmtDate(t.at)), h('td', (Bank.SPECS[t.kind] || {}).title + (t.seedName ? ' · ' + t.seedName.replace('set', 'Đề ') : '')), h('td.r', t.L != null ? t.L : '—'), h('td.r', t.R != null ? t.R : '—'), h('td.r', h('b', t.T != null ? t.T : '—')), h('td.r.small.muted', U.fmtDur(t.secs || 0)), h('td.r', ExamDB.getRes(t.id) ? h('button.btn.sm.secondary', { onclick: () => App.go('result', t.id) }, 'Xem lại') : null)))))));
    }
    function start(kind, seedName) {
      const sp = Bank.SPECS[kind];
      let mode = 'real';
      const isL = sp.p1 + sp.p2 + sp.p3 + sp.p4 > 0;
      FX.modal(close => {
        const seg = h('div.seg.block', [['real', 'Như thi thật'], ['practice', 'Luyện thi']].map(([k, t]) => h('button' + (k === mode ? '.on' : ''), { onclick: e => { mode = k; [...seg.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); } }, t)));
        return h('div',
          h('h2', sp.title + (seedName ? ' · ' + seedName.replace('set', 'Đề ') : '')),
          h('p.muted', sp.sub),
          isL ? h('div.field', h('label', 'Chế độ'), seg, h('div.hint', 'Như thi thật: phần nghe tự chạy, mỗi bài nghe một lần, không tua. Luyện thi: được dừng, nghe lại từng bài.')) : null,
          h('div.callout.mt', ic('headphones'), h('div', isL ? 'Đeo tai nghe, mở âm lượng vừa đủ. Giọng đọc lấy từ trình duyệt (Chrome có giọng Google Mỹ, Anh). Nên làm liền một mạch.' : 'Bấm giờ ' + sp.rMin + ' phút. Hết giờ app tự nộp bài.')),
          run && run.status === 'running' ? h('div.callout.warn.mt', ic('alert'), h('div', 'Bắt đầu đề mới sẽ hủy đề đang làm dở.')) : null,
          h('div.row.mt2', h('button.btn.secondary.lg', { onclick: close }, 'Để sau'), h('button.btn.lg.grow', { onclick: () => { close(); ExamDB.clearRun(); App.go('exam', kind, (seedName || 'r' + Date.now().toString(36)) + '?mode=' + mode); } }, ic('play'), 'Bắt đầu làm bài')));
      });
    }
  }
});
