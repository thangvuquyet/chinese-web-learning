const Palette = (() => {
  const { h } = U;
  const PAGES = [['home', 'home', 'Trang chủ'], ['path', 'route', 'Lộ trình học'], ['review', 'cards', 'Ôn thẻ đến hạn'], ['exams', 'exam', 'Thi thử HSK'], ['grammar', 'blocks', 'Ngữ pháp'], ['words', 'library', 'Kho từ vựng'], ['sounds', 'wave', 'Phát âm, thanh điệu'], ['hanzi', 'brush', 'Chữ Hán, tập viết'], ['speak', 'mic', 'Luyện nói'], ['stats', 'chart', 'Tiến độ, huy hiệu'], ['tips', 'bulb', 'Phương pháp học'], ['more', 'compass', 'Khám phá'], ['settings', 'sliders', 'Cài đặt']];
  const fold = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  function wordMatch(w, q) {
    const pyFlat = U.stripTones(w.py).replace(/\s|'/g, '').toLowerCase();
    return w.hz.includes(q) || w.py.toLowerCase().includes(q) || pyFlat.includes(q.replace(/\s/g, '')) || w.hv.toLowerCase().includes(q) || U.viBase(w.vi).includes(U.viBase(q)) || w.vi.toLowerCase().includes(q);
  }
  function items(raw) {
    const q = fold(raw.trim());
    const out = [];
    PAGES.forEach(([r, i, t]) => { if (!q || fold(t).includes(q) || r.includes(q)) out.push({ icon: i, t, d: 'Trang', go: () => App.go(r) }); });
    const rq = raw.trim().toLowerCase();
    if (rq.length >= 1 && (/[\u4e00-\u9fff]/.test(rq) || rq.length >= 2)) {
      const seen = new Set();
      D.words.filter(w => wordMatch(w, rq)).sort((a, b) => (a.hz === rq ? -1 : 0) - (b.hz === rq ? -1 : 0)).forEach(w => {
        if (seen.has(w.hz) || seen.size >= 8) return;
        seen.add(w.hz);
        out.push({ icon: 'cards', t: w.hz, sub: w.py, d: w.vi, go: () => UI.openWord(w) });
      });
    }
    return out.slice(0, 12);
  }
  let openNow = false;
  function open() {
    if (openNow || !Store.P()) return;
    openNow = true;
    let list = [], sel = 0;
    const inp = h('input', { placeholder: 'Tìm trang, chữ Hán, pinyin, nghĩa…', autocomplete: 'off', spellcheck: 'false' });
    const box = h('div.pal-list');
    let close = () => {};
    function draw() {
      U.clear(box);
      if (!list.length) { box.appendChild(h('div.pal-empty', 'Không có kết quả')); return; }
      list.forEach((it, i) => box.appendChild(h('div.pal-item' + (i === sel ? '.on' : ''), { onclick: () => run(it), onmousemove: () => { if (sel !== i) { sel = i; mark(); } } },
        h('span.tic', Icon.svg(it.icon)), h('div.grow', h('div.t', h('span' + (it.sub ? '.zh' : ''), it.t), it.sub ? h('span.small.muted', { style: { marginLeft: '8px', fontWeight: 500 } }, it.sub) : null), h('div.d', it.d)), i === sel ? h('kbd', 'Enter') : null)));
    }
    function mark() {
      [...box.children].forEach((c, i) => { c.classList.toggle('on', i === sel); const k = c.querySelector('kbd'); if (k) k.remove(); if (i === sel) c.appendChild(h('kbd', 'Enter')); });
      const cur = box.children[sel];
      if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
    }
    function run(it) { close(); setTimeout(() => it.go(), 60); }
    inp.addEventListener('input', () => { list = items(inp.value); sel = 0; draw(); });
    inp.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(list.length - 1, sel + 1); mark(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
      else if (e.key === 'Enter' && list[sel]) { e.preventDefault(); run(list[sel]); }
    });
    list = items('');
    draw();
    close = FX.modal(h('div', h('div.pal-in', Icon.svg('search'), inp, h('kbd', 'Esc')), box), { cls: 'palette', onClose: () => { openNow = false; } });
    setTimeout(() => inp.focus(), 40);
  }
  return { open };
})();
