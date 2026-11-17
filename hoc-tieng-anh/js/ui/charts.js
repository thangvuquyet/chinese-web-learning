const Charts = (() => {
  const { h } = U;
  function line(o) {
    const W = o.w || 640, H = o.h || 220, pl = 40, pr = 16, pt = 14, pb = 26;
    const all = o.series.flatMap(s => s.pts.map(p => p[1]));
    if (o.target) all.push(o.target);
    let mn = o.yMin != null ? o.yMin : Math.min(...all), mx = o.yMax != null ? o.yMax : Math.max(...all);
    if (mx - mn < 50) { mn -= 25; mx += 25; }
    mn = Math.max(0, Math.floor(mn / 50) * 50); mx = Math.ceil(mx / 50) * 50;
    const n = Math.max(...o.series.map(s => s.pts.length), 2);
    const X = i => pl + (n === 1 ? 0 : i / (n - 1)) * (W - pl - pr);
    const Y = v => pt + (1 - (v - mn) / (mx - mn || 1)) * (H - pt - pb);
    let g = '';
    const steps = 4;
    for (let k = 0; k <= steps; k++) { const v = mn + (mx - mn) * k / steps; g += `<line class="grid-l" x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${pl - 8}" y="${Y(v) + 4}" text-anchor="end">${Math.round(v)}</text>`; }
    if (o.target && o.target >= mn && o.target <= mx) g += `<line class="tgt" x1="${pl}" x2="${W - pr}" y1="${Y(o.target)}" y2="${Y(o.target)}"/><text class="tgt-l" x="${W - pr}" y="${Y(o.target) - 6}" text-anchor="end">Mục tiêu ${o.target}</text>`;
    const labels = o.labels || [];
    const every = Math.max(1, Math.ceil(labels.length / 8));
    labels.forEach((l, i) => { if (i % every === 0 || i === labels.length - 1) g += `<text class="ax" x="${X(i)}" y="${H - 6}" text-anchor="middle">${U.esc(l)}</text>`; });
    o.series.forEach(s => {
      if (!s.pts.length) return;
      const d = s.pts.map((p, i) => (i ? 'L' : 'M') + X(p[0] != null ? p[0] : i).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join(' ');
      if (s.area) g += `<path d="${d} L${X(s.pts[s.pts.length - 1][0]).toFixed(1)} ${H - pb} L${X(s.pts[0][0]).toFixed(1)} ${H - pb} Z" fill="${s.color}" opacity=".08"/>`;
      g += `<path class="ln" d="${d}" stroke="${s.color}"/>`;
      s.pts.forEach(p => g += `<circle class="dot" cx="${X(p[0])}" cy="${Y(p[1])}" r="4" fill="${s.color}"><title>${p[2] || ''}${p[1]}</title></circle>`);
    });
    const el = h('div');
    el.appendChild(U.svgEl(`<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:${H}px">${g}</svg>`));
    if (o.legend) el.appendChild(h('div.row.wrap.mt8', { style: { gap: '14px', fontSize: '12.5px', color: 'var(--muted)' } }, o.series.map(s => h('span.row.g6', h('i', { style: { width: '10px', height: '10px', borderRadius: '3px', background: s.color, display: 'inline-block' } }), s.name))));
    return el;
  }
  function bars2(o) {
    const W = o.w || 560, H = o.h || 180, pb = 24, pt = 10;
    const mx = Math.max(10, ...o.a.vals, ...(o.b ? o.b.vals : []));
    const n = o.labels.length, gw = W / n, bw = o.b ? Math.min(18, gw * .28) : Math.min(28, gw * .5);
    let g = '';
    o.labels.forEach((l, i) => {
      const cx = gw * i + gw / 2;
      const draw = (v, col, dx) => { const hh = (H - pb - pt) * v / mx; g += `<rect x="${cx + dx - bw / 2}" y="${H - pb - hh}" width="${bw}" height="${Math.max(hh, v ? 2 : 0)}" rx="${Math.min(5, bw / 2)}" fill="${col}"><title>${v}</title></rect>`; };
      if (o.b) { draw(o.a.vals[i], o.a.color, -bw * .6); draw(o.b.vals[i], o.b.color, bw * .6); } else draw(o.a.vals[i], o.a.color, 0);
      g += `<text class="ax" x="${cx}" y="${H - 6}" text-anchor="middle">${U.esc(l)}</text>`;
    });
    g = `<line class="grid-l" x1="0" x2="${W}" y1="${H - pb}" y2="${H - pb}"/>` + g;
    const el = h('div');
    el.appendChild(U.svgEl(`<svg class="chart" viewBox="0 0 ${W} ${H}" style="height:${H}px">${g}</svg>`));
    if (o.b) el.appendChild(h('div.row.wrap.mt8', { style: { gap: '14px', fontSize: '12.5px', color: 'var(--muted)' } }, [o.a, o.b].map(s => h('span.row.g6', h('i', { style: { width: '10px', height: '10px', borderRadius: '3px', background: s.color, display: 'inline-block' } }), s.name))));
    return el;
  }
  function heat(days, weeks = 18) {
    const today = new Date();
    const dow = (today.getDay() + 6) % 7;
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dow - (weeks - 1) * 7);
    const grid = h('div.heat');
    for (let i = 0; i < weeks * 7; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const k = U.dayKey(d);
      const v = days[k] || 0;
      const l = d > today ? '' : v >= 80 ? '.l4' : v >= 45 ? '.l3' : v >= 20 ? '.l2' : v > 0 ? '.l1' : '';
      grid.appendChild(h('i' + l, { title: U.fmtShort(d) + ': ' + v + ' XP', style: d > today ? { opacity: .3 } : null }));
    }
    return h('div', { style: { overflowX: 'auto' } }, grid, h('div.legend-h.mt8', 'Ít', h('i', { style: { background: 'var(--surface-3)' } }), h('i', { style: { background: '#D6DCFF' } }), h('i', { style: { background: '#A6B3FA' } }), h('i', { style: { background: '#6C82F2' } }), h('i', { style: { background: '#3048E0' } }), 'Nhiều'));
  }
  return { line, bars2, heat };
})();
