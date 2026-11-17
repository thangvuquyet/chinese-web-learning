App.register('result', {
  render(root, params) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const p = Store.P();
    const sum = p.tests.find(t => t.id === params[0]);
    const res = ExamDB.getRes(params[0]);
    if (!sum) return root.appendChild(UI.empty('Không tìm thấy kết quả này.'));
    const built = res ? Bank.build({ blocks: res.blocks }) : null;
    const prev = p.tests.filter(t => t.kind === sum.kind && t.at < sum.at && t.T != null).slice(-1)[0];
    const target = p.target;
    const T = sum.T;
    const scoreEl = h('div.score-big', '0');
    const placement = sum.kind === 'placement';
    const hero = h('div.hero',
      T != null && T >= target ? h('div.res-stamp', 'ĐẠT ' + target) : null,
      h('div.res-hero',
        h('div',
          h('div.eyebrow', { style: { color: '#AEB7DD' } }, placement ? 'Mức xuất phát của ' + p.name : (Bank.SPECS[sum.kind] || {}).title + ' · ' + U.fmtDate(sum.at)),
          T != null ? h('div.row', { style: { alignItems: 'baseline', gap: '6px', marginTop: '6px' } }, scoreEl, h('small', { style: { color: '#9AA4CF', fontWeight: 600 } }, '/ 990')) : h('div.score-big', (sum.L != null ? sum.L : sum.R), h('small', '/ 495')),
          h('div.row.wrap.mt8',
            T != null ? h('span.band', { style: { '--c': Score.band(T).color } }, h('i'), Score.band(T).vi) : null,
            prev && T != null ? h('span.band', { style: { '--c': T >= prev.T ? 'var(--lime)' : '#FF8A8E' } }, h('i'), (T >= prev.T ? '+' : '') + (T - prev.T) + ' so với lần trước') : null)),
        h('div',
          h('div.lr', { style: { marginTop: 0 } },
            sum.L != null ? h('div', h('div.k', h('span', 'Listening · ' + Score.cefr(sum.L, sum.R || 5).L), h('b', sum.L + ' / 495')), UI.bar(sum.L / 495, 'dark')) : null,
            sum.R != null ? h('div', h('div.k', h('span', 'Reading · ' + Score.cefr(sum.L || 5, sum.R).R), h('b', sum.R + ' / 495')), UI.bar(sum.R / 495, 'dark R')) : null),
          h('div.row.wrap.mt', { style: { color: '#AEB7DD', fontSize: '13px', gap: '18px' } },
            h('span', ic('checkCircle'), ' Đúng ' + sum.okN + '/' + sum.n + ' câu'),
            h('span', ic('clock'), ' ' + U.fmtDur(sum.secs)),
            sum.mode ? h('span', ic('sliders'), ' ' + (sum.mode === 'real' ? 'Như thi thật' : 'Luyện thi')) : null),
          T != null ? h('p.mt', { style: { color: '#D3D8EE' } }, T >= target ? 'Đã đạt mục tiêu ' + target + '. Duy trì bằng 1 đề rút gọn mỗi tuần và ôn từ đến hạn mỗi ngày.' : 'Còn ' + (target - T) + ' điểm nữa tới mục tiêu ' + target + '. Tập trung vào các Part có độ chính xác thấp bên dưới.') : null)));
    if (T != null) setTimeout(() => FX.countUp(scoreEl, T, { dur: 1300, ticks: true }), 200);
    root.appendChild(h('div.row.mb', UI.back('tests', 'Thi thử'), h('div.grow'), h('button.btn.secondary.sm', { onclick: () => App.go('home') }, ic('home'), 'Trang chủ')));
    root.appendChild(hero);

    const need = Score.needAcc(target);
    const partRows = Object.keys(Bank.PART_NAME).filter(k => sum.parts[k]).map(k => {
      const [ok, n] = sum.parts[k];
      const acc = ok / n;
      const b = UI.bar(acc, +k <= 4 ? '' : 'R');
      b.appendChild(h('span.mark', { style: { left: need * 100 + '%' } }));
      return h('div.part-row', h('div.pn', 'Part ' + k, h('small', Bank.PART_NAME[k])), b, h('div.v', h('span.acc.' + UI.accCls(acc), ok + '/' + n)));
    });
    const tagStat = {};
    if (built) built.qs.forEach(q => { if (!q.tag || !Bank.TAGS[q.tag]) return; const t = tagStat[q.tag] = tagStat[q.tag] || { n: 0, ok: 0, part: q.part }; t.n++; if (res.answers[q.num] === q.ans) t.ok++; });
    const tags = Object.entries(tagStat).filter(([, v]) => v.n >= 2).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).slice(0, 8);
    const weakParts = Object.keys(sum.parts).map(k => ({ k: +k, acc: sum.parts[k][0] / sum.parts[k][1] })).sort((a, b) => a.acc - b.acc).slice(0, 2);
    const recs = weakParts.filter(w => w.acc < need + .05).map(w => {
      const s = (typeof STRATS !== 'undefined' ? STRATS : []).find(x => x.part === w.k);
      return h('div.plan-item', { onclick: () => App.go('practice', w.k) }, h('span.tile-ic' + (w.k >= 5 ? '.R' : ''), ic(w.k >= 5 ? 'book' : 'headphones')), h('div.grow', h('div.t', 'Luyện Part ' + w.k + ' · ' + Bank.PART_NAME[w.k]), h('div.d', 'Đúng ' + Math.round(w.acc * 100) + '%, cần khoảng ' + Math.round(need * 100) + '%' + (s ? ' · đọc chiến thuật “' + s.t + '”' : ''))), ic('chevron', 'chev'));
    });
    root.appendChild(h('div.grid.g2.mt2',
      h('div.card', h('div.card-h', h('h3', 'Kết quả theo Part'), h('span.r.small.muted', 'Vạch đen: mức cần cho ' + target)), partRows),
      h('div.card', h('div.card-h', h('h3', 'Dạng câu cần cải thiện')), tags.length ? h('table.tbl', h('tbody', tags.map(([t, v]) => h('tr', h('td', { style: { fontWeight: 600 } }, Bank.TAGS[t]), h('td.r', h('span.acc.' + UI.accCls(v.ok / v.n), v.ok + '/' + v.n)), h('td.r', h('button.btn.sm.ghost', { onclick: () => App.go('practice', v.part, t) }, 'Luyện')))))) : h('p.muted', 'Chưa đủ dữ liệu theo dạng câu.'))));
    if (recs.length) root.append(UI.secHead('Nên làm tiếp', 'Gợi ý theo kết quả bài này'), h('div', recs));
    if (placement) root.appendChild(h('div.callout.tip.mt', ic('route'), h('div', h('b', 'Lộ trình đã được cá nhân hóa. '), 'Điểm dự đoán trên trang chủ sẽ cập nhật sau mỗi bài luyện. Bắt đầu từ ', h('a', { href: '#/path' }, 'Lộ trình 900'), '.')));

    const oid = Store.otherId(p.id);
    const pv = Store.view(oid);
    const pBest = (pv.tests || []).filter(t => t.T != null).sort((a, b) => b.T - a.T)[0];
    if (pBest && T != null) root.appendChild(h('div.card.mt', h('div.duel', h('div.side', Art.avatar(p.id, 'lg'), h('div.nm', p.name), h('div.val', T)), h('div.vs', 'VS'), h('div.side', Art.avatar(oid, 'lg'), h('div.nm', pv.name + ' (cao nhất)'), h('div.val', pBest.T))), h('p.center.small.muted.mt', T >= pBest.T ? 'Bạn đang dẫn trước. Rủ ' + pv.name + ' làm một đề cùng nhau nhé.' : 'Còn ' + (pBest.T - T) + ' điểm để bắt kịp ' + pv.name + '.')));

    if (!built) return;
    root.appendChild(UI.secHead('Xem lại từng câu', 'Có lời thoại, dịch giải thích và nút nhại lại'));
    let filter = 'wrong';
    const seg = h('div.seg', [['wrong', 'Câu sai'], ['skip', 'Bỏ trống'], ['flag', 'Đánh dấu'], ['all', 'Tất cả']].map(([k, t]) => h('button' + (k === filter ? '.on' : ''), { onclick: e => { filter = k; [...seg.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); draw(); } }, t)));
    const list = h('div.col.g16');
    root.append(h('div.row.mb', seg), list);
    function keep(q) {
      const a = res.answers[q.num];
      if (filter === 'wrong') return a != null && a !== q.ans;
      if (filter === 'skip') return a == null;
      if (filter === 'flag') return (res.flags || []).includes(q.num);
      return true;
    }
    function draw() {
      U.clear(list);
      let shown = 0;
      built.groups.forEach(g => {
        const qs = g.nums.map(n => built.qs[n - 1]);
        if (!qs.some(keep) || shown > 40) return;
        shown++;
        const card = h('div.card');
        if (!g.set) {
          const q = qs[0];
          card.appendChild(h('div.row.mb', h('span.pill.' + (q.part <= 4 ? 'L' : 'R'), 'Part ' + q.part), h('span.small.muted', 'Câu ' + q.num)));
          if (q.part === 1) card.appendChild(Items.p1Visual(q));
          if (q.part <= 2) card.appendChild(h('div.mt', Player.create({ lines: Items.linesOf(q), seed: q.id, showText: true }).el));
          card.appendChild(h('div.mt', Items.qblock(q, { num: q.num, mode: 'review', chosen: res.answers[q.num] })));
        } else {
          const blanks = g.part === 6 ? Items.blankMap(g.set, qs, qs.map(q => res.answers[q.num]), 'review', g.nums) : null;
          card.appendChild(h('div.row.mb', h('span.pill.' + (g.part <= 4 ? 'L' : 'R'), 'Part ' + g.part), h('span.small.muted', 'Câu ' + g.nums[0] + '–' + g.nums[g.nums.length - 1])));
          card.appendChild(h('div.stimulus', h('div.s-left', Items.stimulus(g.set, { mode: 'review', blanks })), h('div.s-right', qs.map(q => Items.qblock(q, { num: q.num, mode: 'review', chosen: res.answers[q.num] })))));
        }
        list.appendChild(card);
      });
      if (!shown) list.appendChild(h('div.card', UI.empty(filter === 'wrong' ? 'Không có câu sai nào. Xuất sắc.' : 'Không có câu nào trong mục này.', 'happy')));
    }
    draw();
    setTimeout(() => { UI.celebrate(); if (T != null && T >= target) FX.confetti({ n: 180 }); }, 600);
  }
});
