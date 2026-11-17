App.register('stats', {
  render(root) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const p = Store.P();
    const pr = Score.predict(p);
    const totalMin = U.sum(Object.values(p.mins));
    const cs = D.cardStats(p);
    const acc = p.stats.ans ? p.stats.ok / p.stats.ans : 0;
    root.appendChild(UI.pageHead('Thống kê của ' + p.name, 'Mọi con số đều tính từ bài bạn đã làm trên máy này.', h('button.btn.secondary', { onclick: UI.switcher }, ic('swap'), 'Xem người khác')));
    root.appendChild(h('div.grid.g4.stagger',
      h('div.stat-tile', h('div.stat', h('div.v', pr.hasData ? pr.T : '—'), h('div.k', 'Điểm dự đoán' + (pr.hasData ? ' (± ' + pr.spread + ')' : '')))),
      h('div.stat-tile', h('div.stat', h('div.v', U.fmtMin(totalMin).replace(' phút', '').replace(' giờ ', 'g ')), h('div.k', 'Thời gian học'))),
      h('div.stat-tile', h('div.stat', h('div.v', p.stats.ans.toLocaleString('vi-VN')), h('div.k', 'Câu đã làm · đúng ' + Math.round(acc * 100) + '%'))),
      h('div.stat-tile', h('div.stat', h('div.v', Object.keys(p.cards).length), h('div.k', 'Từ đã học · ' + cs.mature + ' nhớ chắc')))));
    const hist = Object.entries(p.predHist || {}).sort();
    const tests = p.tests.filter(t => t.T != null);
    const trend = h('div.card.mt', h('div.card-h', h('h3', 'Điểm theo thời gian'), h('span.r.small.muted', 'Đường xanh: dự đoán · chấm cam: đề thi thử')));
    if (hist.length >= 2 || tests.length >= 2) {
      const days = U.uniq(hist.map(x => x[0]).concat(tests.map(t => U.dayKey(new Date(t.at))))).sort();
      const idx = k => days.indexOf(k);
      trend.appendChild(Charts.line({ series: [{ name: 'Dự đoán', color: 'var(--brand)', area: true, pts: hist.map(([k, v]) => [idx(k), v]) }, { name: 'Đề thi thử', color: 'var(--meo)', pts: tests.map(t => [idx(U.dayKey(new Date(t.at))), t.T]) }], labels: days.map(k => k.slice(8) + '/' + k.slice(5, 7)), target: p.target, legend: true, h: 230 }));
    } else trend.appendChild(h('p.muted', 'Làm thêm bài luyện và đề thi thử để thấy đường tiến bộ.'));
    root.appendChild(trend);
    const need = Score.needAcc(p.target);
    root.appendChild(h('div.grid.g2.mt',
      h('div.card', h('div.card-h', h('h3', 'Độ chính xác 80 câu gần nhất mỗi Part')), Object.keys(Bank.PART_NAME).map(k => {
        const r = p.parts[k];
        const a = r.h.length ? U.avg(r.h) : 0;
        const b = UI.bar(a, +k <= 4 ? '' : 'R');
        b.appendChild(h('span.mark', { style: { left: need * 100 + '%' } }));
        return h('div.part-row', h('div.pn', 'Part ' + k, h('small', Bank.PART_NAME[k])), b, h('div.v', r.h.length ? h('span.acc.' + UI.accCls(a), Math.round(a * 100) + '%') : '—'));
      })),
      h('div.card', h('div.card-h', h('h3', 'Theo dạng câu')), (() => {
        const rows = Object.entries(p.tags).filter(([t, v]) => v.n >= 3 && Bank.TAGS[t]).sort((x, y) => x[1].ok / x[1].n - y[1].ok / y[1].n).slice(0, 12);
        return rows.length ? h('table.tbl', h('tbody', rows.map(([t, v]) => h('tr', h('td', { style: { fontWeight: 600 } }, Bank.TAGS[t]), h('td.r.small.muted', v.n + ' câu'), h('td.r', h('span.acc.' + UI.accCls(v.ok / v.n), Math.round(v.ok / v.n * 100) + '%')))))) : h('p.muted', 'Chưa đủ dữ liệu.');
      })())));
    const last14 = Array.from({ length: 14 }, (_, i) => U.addDays(U.dayKey(), i - 13));
    root.appendChild(h('div.grid.g2.mt',
      h('div.card', h('div.card-h', h('h3', 'Lịch học 18 tuần')), Charts.heat(p.days, 18), h('div.row.mt.small.muted', ic('flame'), 'Chuỗi hiện tại ' + Store.streakView(p).n + ' ngày · dài nhất ' + p.streak.best + ' ngày')),
      h('div.card', h('div.card-h', h('h3', 'Phút học 14 ngày qua')), Charts.bars2({ labels: last14.map(k => k.slice(8)), a: { vals: last14.map(k => Math.round(p.mins[k] || 0)), color: 'var(--brand)' }, h: 160 }))));
    root.appendChild(UI.secHead('Huy hiệu', Object.keys(p.badges).length + '/' + Store.BADGES.length));
    root.appendChild(h('div.grid', { style: { gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '12px' } }, Store.BADGES.map(([id, icon, name, desc]) => {
      const got = p.badges[id];
      return h('div.card.center', { style: { padding: '16px 10px', opacity: got ? 1 : .5 } }, h('div', { style: { transform: 'scale(.5)', margin: '-34px auto -30px', width: '150px' } }, Art.medal(icon, got ? 'gold' : 'blue')), h('div', { style: { fontWeight: 700, fontSize: '13.5px' } }, name), h('div.xs.muted', got ? U.fmtDate(got) : desc));
    })));
  }
});
