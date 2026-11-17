const Player = (() => {
  const { h } = U;
  const ic = n => Icon.svg(n);
  const WHO = { W: 'Nữ', M: 'Nam', W2: 'Nữ 2', M2: 'Nam 2', N: '' };
  function create(o) {
    const lines = o.lines.map(l => Array.isArray(l) ? { who: l[0], text: l[1], vi: l[2] } : l);
    const roles = U.uniq(lines.map(l => l.who || 'N'));
    const castMap = Speech.cast(roles, o.seed || lines[0].text.slice(0, 20));
    let playing = false, cur = -1, rate = 1, shown = !!o.showText;
    const btn = h('button.pl-btn', { type: 'button', 'aria-label': 'Phát' }, ic('play'));
    const segs = h('div.pl-prog', lines.map(() => h('i')));
    const info = h('span.pl-info', lines.length + ' câu');
    const speed = h('div.seg', [['0.8×', .8], ['1×', 1], ['1.2×', 1.2]].map(([t, v]) => {
      const b = h('button' + (v === 1 ? '.on' : ''), { type: 'button', onclick: () => { rate = v; [...speed.children].forEach(x => x.classList.toggle('on', x === b)); } }, t);
      return b;
    }));
    const tr = h('div.transcript' + (o.noTranscript ? '.hidden' : ''));
    const rows = lines.map((l, i) => {
      const tx = h('div.tx' + (shown ? '' : '.blur'), l.text);
      const row = h('div.tr-line',
        l.who && l.who !== 'N' ? h('span.who.' + l.who, WHO[l.who] || l.who) : null,
        h('div.grow', tx, l.vi && shown ? h('div.vi', l.vi) : null),
        h('span.tools',
          h('button.icon-btn.ghost.sm', { title: 'Nghe lại câu này', onclick: () => playFrom(i, true) }, ic('repeat')),
          o.shadow !== false && Pron.enabled() ? h('button.icon-btn.ghost.sm', { title: 'Nhại lại câu này (AI chấm)', onclick: () => { stop(); Pron.modal(l.text); } }, ic('mic')) : null));
      row._tx = tx;
      return row;
    });
    rows.forEach(r => tr.appendChild(r));
    const toggle = h('button.btn.ghost.sm', { type: 'button', onclick: () => setShown(!shown) }, ic(shown ? 'eye' : 'eye'), shown ? 'Ẩn lời' : 'Hiện lời');
    function setShown(v) {
      shown = v;
      rows.forEach((r, i) => { r._tx.classList.toggle('blur', !shown); const vi = r.querySelector('.vi'); if (vi) vi.remove(); if (shown && lines[i].vi) r._tx.after(h('div.vi', lines[i].vi)); });
      toggle.lastChild.textContent = shown ? 'Ẩn lời' : 'Hiện lời';
    }
    function mark(i) {
      cur = i;
      [...segs.children].forEach((s, k) => { s.classList.toggle('cur', k === i); s.classList.toggle('done', i < 0 ? playing === false && k < lines.length : k < i); });
      rows.forEach((r, k) => r.classList.toggle('cur', k === i));
      info.textContent = i >= 0 ? 'Câu ' + (i + 1) + '/' + lines.length : lines.length + ' câu';
    }
    async function playFrom(i = 0, single = false) {
      Speech.stop();
      playing = true;
      btn.classList.add('on'); btn.innerHTML = ''; btn.appendChild(ic('pause'));
      const list = single ? [lines[i]] : lines.slice(i);
      const offset = i;
      const ok = await Speech.speakLines(list, { castMap, rate, gap: o.gap, onLine: k => { if (k >= 0) mark(k + offset); } });
      if (!ok && !playing) return;
      playing = false;
      btn.classList.remove('on'); btn.innerHTML = ''; btn.appendChild(ic('play'));
      mark(-1);
      if (ok && !single) { [...segs.children].forEach(s => s.classList.add('done')); o.onEnd && o.onEnd(); }
    }
    function stop() {
      playing = false;
      Speech.stop();
      btn.classList.remove('on'); btn.innerHTML = ''; btn.appendChild(ic('play'));
      mark(-1);
    }
    btn.addEventListener('click', () => playing ? stop() : playFrom(Math.max(0, cur)));
    const el = h('div.player',
      h('div.pl-top', btn, h('div.grow', segs, h('div.row.between.mt8', info, h('div.row.g6', o.noSpeed ? null : speed, o.noTranscript ? null : toggle)))),
      tr);
    if (o.autoplay) setTimeout(() => playFrom(0), 350);
    return { el, play: () => playFrom(0), stop, setShown, castMap };
  }
  return { create, WHO };
})();
