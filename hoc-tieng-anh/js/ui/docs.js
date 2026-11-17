const Docs = (() => {
  const { h } = U;
  function inline(text, o) {
    const frag = document.createDocumentFragment();
    const re = /\{(\d)\}|\[(\d)\]|\*\*(.+?)\*\*/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      if (m[1]) {
        const k = +m[1];
        const b = o.blanks && o.blanks[k];
        const el = h('span.blank' + (b && b.cls ? '.' + b.cls : '') + (b && b.value ? '.filled' : ''), { dataset: { k } }, b ? (b.value || b.label || '') : '');
        if (o.onBlank) el.addEventListener('click', () => o.onBlank(k));
        frag.appendChild(el);
      } else if (m[2]) frag.appendChild(h('span.slot', '[' + m[2] + ']'));
      else if (m[3]) frag.appendChild(h('b', m[3]));
      last = re.lastIndex;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    return frag;
  }
  function paras(body, o) {
    return String(body || '').split(/\n\n+/).map(p => {
      const el = h('p');
      p.split('\n').forEach((ln, i) => { if (i) el.appendChild(h('br')); el.appendChild(inline(ln, o)); });
      return el;
    });
  }
  function table(t) {
    if (!t) return null;
    return h('table', t.head ? h('thead', h('tr', t.head.map(c => h('th', c)))) : null, h('tbody', t.rows.map(r => h('tr', r.map(c => h('td', String(c)))))));
  }
  function render(d, o = {}) {
    const t = d.t || 'letter';
    if (t === 'email' || t === 'memo') {
      return h('div.doc.' + t,
        t === 'memo' ? h('div.memo-t', 'MEMO') : null,
        h('div.mail-h',
          d.to ? [h('span', 'To:'), h('div', d.to)] : null,
          d.from ? [h('span', 'From:'), h('div', d.from)] : null,
          d.date ? [h('span', 'Date:'), h('div', d.date)] : null,
          d.subject ? [h('span', t === 'memo' ? 'Re:' : 'Subject:'), h('div', { style: { fontWeight: 650 } }, d.subject)] : null,
          d.attach ? [h('span', 'Attachment:'), h('div', d.attach)] : null),
        h('div.mail-b', paras(d.body, o), table(d.table), d.sign ? h('p.sign', inline(d.sign, o)) : null));
    }
    if (t === 'chat') {
      return h('div.doc.chat', d.title ? h('div.d-kicker', d.title) : null, (d.msgs || []).map(([who, time, text]) => h('div.bubble' + (who === d.me ? '.r' : ''), h('div.bh', who + (time ? ' [' + time + ']' : '')), h('div.bb', inline(text, o)))));
    }
    if (t === 'web') {
      return h('div.doc.web', h('div.web-bar', h('i'), h('i'), h('i'), h('span', d.url || 'www.example.com')),
        h('div.web-b', d.nav ? h('div.web-nav', d.nav.map(n => h('span', n))) : null, d.title ? h('div.d-title', d.title) : null, paras(d.body, o), table(d.table)));
    }
    if (t === 'review') {
      return h('div.doc.review', h('div.row.between', h('div.d-title', { style: { margin: 0 } }, d.title || 'Customer review'), h('span.stars', '★'.repeat(d.stars || 4) + '☆'.repeat(5 - (d.stars || 4)))), h('div.d-meta', d.author || ''), paras(d.body, o));
    }
    return h('div.doc.' + t,
      d.kicker ? h('div.d-kicker', d.kicker) : null,
      d.head ? h('div.d-meta', { style: { whiteSpace: 'pre-line' } }, d.head) : null,
      d.date && t === 'letter' ? h('p', d.date) : null,
      d.to && t === 'letter' ? h('p', { style: { whiteSpace: 'pre-line' } }, d.to) : null,
      d.title ? h('div.d-title', d.title) : null,
      d.meta ? h('div.d-meta', d.meta) : null,
      paras(d.body, o), table(d.table),
      d.foot ? h('p', { style: { fontSize: '14px', color: 'var(--muted)' } }, inline(d.foot, o)) : null,
      d.sign ? h('p.sign', { style: { whiteSpace: 'pre-line' } }, d.sign) : null);
  }
  const WX = {
    sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
    cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.5 1.5 3.75 3.75 0 0 1-.5 7.5z"/>',
    rain: '<path d="M7 14.5a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.5 1.5 3.75 3.75 0 0 1-.5 7.5z"/><path d="M8 17.5 7 20.5M12 17.5l-1 3M16 17.5l-1 3"/>',
    storm: '<path d="M7 14.5a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.5 1.5 3.75 3.75 0 0 1-.5 7.5z"/><path d="m12.5 15-2 3.5h3l-2 3.5"/>',
    snow: '<path d="M7 14.5a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.5 1.5 3.75 3.75 0 0 1-.5 7.5z"/><path d="M8 18h.01M12 19.5h.01M16 18h.01M10 21h.01M14 21h.01"/>',
    partly: '<circle cx="8.5" cy="8.5" r="3.5"/><path d="M8.5 2v1.5M2 8.5h1.5M3.9 3.9 5 5M13.1 3.9 12 5"/><path d="M9 19.5a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.5 1.5 3.4 3.4 0 0 1-.4 6.5z"/>'
  };
  function graphic(g) {
    if (!g) return null;
    const head = g.title ? h('div.gh', g.title) : null;
    if (g.t === 'table') return h('div.gfx', head, h('table', g.head ? h('thead', h('tr', g.head.map(c => h('th', c)))) : null, h('tbody', g.rows.map(r => h('tr', r.map(c => h('td', String(c))))))));
    if (g.t === 'list') return h('div.gfx', head, h('table', h('tbody', g.items.map(r => h('tr', (Array.isArray(r) ? r : [r]).map(c => h('td', String(c))))))));
    if (g.t === 'bars') {
      const mx = Math.max(...g.items.map(x => x[1]));
      return h('div.gfx', head, h('div.bars-g', g.items.map(([k, v]) => h('div.b', h('b', (g.pre || '') + v + (g.unit || '')), h('i', { style: { height: Math.max(6, v / mx * 120) + 'px' } }), h('span', k)))));
    }
    if (g.t === 'weather') {
      return h('div.gfx', head, h('div.wx', g.days.map(([d, w, tmp]) => { const c = h('div', d); const s = U.svgEl(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${WX[w] || WX.sun}</svg>`); c.appendChild(s); c.appendChild(h('div', tmp)); return c; })));
    }
    if (g.t === 'coupon') return h('div.gfx', head, h('div.coupon', h('div.big', g.big), (g.lines || []).map(l => h('div.small', l))));
    if (g.t === 'floor') {
      const W = 420, H = 240;
      const rooms = g.rooms.map(([name, x, y, w, hh]) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="6" fill="#F3F5FA" stroke="#9AA1B8" stroke-width="1.5"/><text x="${x + w / 2}" y="${y + hh / 2 + 4}" text-anchor="middle" font-size="13" font-weight="650" fill="#394264" font-family="Inter,sans-serif">${U.esc(name)}</text>`).join('');
      const you = g.you ? `<circle cx="${g.you[0]}" cy="${g.you[1]}" r="7" fill="#3048E0"/><text x="${g.you[0]}" y="${g.you[1] + 22}" text-anchor="middle" font-size="11" font-weight="700" fill="#3048E0" font-family="Inter,sans-serif">${U.esc(g.youLabel || 'You are here')}</text>` : '';
      const extra = (g.labels || []).map(([t, x, y]) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="11.5" fill="#69718F" font-family="Inter,sans-serif">${U.esc(t)}</text>`).join('');
      const box = h('div.gfx', head);
      box.appendChild(U.svgEl(`<svg class="plan-svg" viewBox="0 0 ${W} ${H}"><rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="10" fill="#fff" stroke="#D4D9E5" stroke-width="2"/>${rooms}${extra}${you}</svg>`));
      return box;
    }
    return null;
  }
  return { render, graphic, inline, paras };
})();
