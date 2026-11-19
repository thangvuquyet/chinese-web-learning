App.register('stats', {
  render(root) {
    const { h } = U;
    const p = Store.P();
    const lv = Store.levelOf(p.xp);
    const curL = Store.xpForLevel(lv), nextL = Store.xpForLevel(lv + 1);
    root.appendChild(UI.pageTitle('📊', 'Tiến độ của ' + U.short(p.name)));
    root.appendChild(h('div.card.tint-jade',
      h('div.row', UI.avatarEl(p, 'lg'),
        h('div.grow', h('b', { style: { fontSize: '20px' } }, `Cấp ${lv}`), h('div.small.muted', { style: { fontWeight: 600 } }, `${p.xp} XP · còn ${nextL - p.xp} XP để lên cấp ${lv + 1}`), h('div.mt', UI.progress((p.xp - curL) / (nextL - curL), 'gold'))))));

    const days = [];
    for (let i = 13; i >= 0; i--) { const d = new Date(Date.now() - i * 86400000); days.push([d, p.days[U.dayKey(d)] || 0, p.mins[U.dayKey(d)] || 0]); }
    const maxX = Math.max(p.goal, ...days.map(d => d[1]));
    const W = 340, H = 140, bw = 16;
    const bars = days.map(([d, x], i) => {
      const bh = Math.round(x / maxX * (H - 36));
      const xx = 14 + i * ((W - 28) / 14);
      return `<rect x="${xx}" y="${H - 20 - bh}" width="${bw}" height="${Math.max(bh, 2)}" rx="5" fill="${x >= p.goal ? '#2A9D68' : '#0F7B66'}"/><text x="${xx + bw / 2}" y="${H - 6}" text-anchor="middle">${d.getDate()}</text>${x ? `<text x="${xx + bw / 2}" y="${H - 24 - bh}" text-anchor="middle">${x}</text>` : ''}`;
    }).join('');
    const goalY = H - 20 - Math.round(p.goal / maxX * (H - 36));
    const chart = h('div');
    chart.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}"><line x1="10" x2="${W - 10}" y1="${goalY}" y2="${goalY}" stroke="#C99429" stroke-dasharray="4 4"/>${bars}</svg>`;
    const totMin = Object.values(p.mins).reduce((a, b) => a + b, 0);
    root.append(h('div.sec-title', '📅 XP 14 ngày qua'), h('div.card', chart, h('div.small.muted', { style: { fontWeight: 600 } }, `Vạch vàng: mục tiêu ${p.goal} XP/ngày · tổng thời gian học khoảng ${totMin} phút`)));

    const counts = { new: 0, learning: 0, young: 0, mature: 0 };
    for (const c of Object.values(p.cards)) counts[SRS.bucket(c)]++;
    const byLv = [1, 2, 3, 4].map(l => { const all = D.words.filter(w => w.lv === l); const got = all.filter(w => p.cards[w.id]).length; return [l, got, all.length]; });
    root.append(h('div.sec-title', '🧠 Từ vựng'),
      h('div.card',
        h('div.stat-row', h('div.stat.jade', h('b', counts.learning), h('span', 'Đang học')), h('div.stat.gold', h('b', counts.young), h('span', 'Đang nhớ')), h('div.stat.leaf', h('b', counts.mature), h('span', 'Nhớ chắc'))),
        ...byLv.map(([l, got, all]) => h('div.sec-bar', h('span', 'HSK' + l), UI.progress(got / all, l === 3 ? 'jade' : l === 4 ? 'indigo' : ''), h('b', `${got}/${all}`))),
        h('div.small.muted', { style: { fontWeight: 500 } }, `Độ chính xác khi trả lời: ${p.stats.ans ? Math.round(p.stats.ok / p.stats.ans * 100) : 0}% (${p.stats.ans} câu) · đã ôn ${p.stats.reviews} thẻ`)));

    const ex3 = p.exams.filter(e => e.level === 3).map(e => e.total), ex4 = p.exams.filter(e => e.level === 4).map(e => e.total);
    if (ex3.length || ex4.length) {
      const W2 = 340, H2 = 140, pad = 24;
      const line = (vals, color) => {
        if (!vals.length) return '';
        const n = Math.max(ex3.length, ex4.length);
        const x = i => pad + (n === 1 ? 0 : i * (W2 - pad * 2) / (n - 1));
        const y = v => H2 - pad - v / 300 * (H2 - pad * 2);
        return `<polyline points="${vals.map((v, i) => x(i) + ',' + y(v)).join(' ')}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round"/>` + vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="#fff" stroke="${color}" stroke-width="2.5"/>`).join('');
      };
      const y180 = H2 - pad - 180 / 300 * (H2 - pad * 2);
      const c2 = h('div');
      c2.innerHTML = `<svg class="chart" viewBox="0 0 ${W2} ${H2}"><line x1="${pad}" x2="${W2 - pad}" y1="${y180}" y2="${y180}" stroke="#2A9D68" stroke-dasharray="4 4"/><text x="${W2 - pad}" y="${y180 - 4}" text-anchor="end">180</text>${line(ex3, '#0F7B66')}${line(ex4, '#34508A')}</svg>`;
      root.append(h('div.sec-title', '📝 Điểm thi thử'), h('div.card', c2, h('div.row.small', { style: { fontWeight: 600 } }, h('span', { style: { color: 'var(--jade-t)' } }, `● HSK3: ${ex3.length} lượt, cao nhất ${ex3.length ? Math.max(...ex3) : '–'}`), h('span', { style: { color: 'var(--indigo-t)' } }, `● HSK4: ${ex4.length} lượt, cao nhất ${ex4.length ? Math.max(...ex4) : '–'}`))));
    }

    root.append(h('div.sec-title', `🏅 Huy hiệu (${Object.keys(p.badges).length}/${Store.BADGES.length})`),
      h('div.grid4', Store.BADGES.map(([id, e, name, desc]) => h('div.badge' + (p.badges[id] ? '.on' : '.off'), { title: desc }, h('span.be', e), h('b', name), h('small', p.badges[id] ? U.fmtDate(p.badges[id]) : desc)))));

  }
});
