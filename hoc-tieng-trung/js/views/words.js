App.register('words', {
  render(root) {
    const { h, clear } = U;
    const p = Store.P();
    let lv = 3, q = '', filter = 'all', limit = 80;
    root.appendChild(UI.pageTitle('📚', 'Kho từ vựng', h('button.btn.sm.indigo', { onclick: importer }, '➕ Nhập từ')));
    const tabs = h('div.tabs');
    const search = h('input.input', { placeholder: 'Tìm chữ Hán, pinyin, Hán Việt hoặc nghĩa…', oninput: U.debounce(e => { q = e.target.value.trim().toLowerCase(); limit = 80; paint(); }, 200) });
    const filt = h('div.row.wrap.mt');
    const info = h('div.small.muted.mt', { style: { fontWeight: 600 } });
    const list = h('div.list.mt');
    root.append(tabs, h('div.search', Icon.svg('search'), search), filt, info, list);
    function paintTabs() {
      clear(tabs);
      [[1, 'HSK1'], [2, 'HSK2'], [3, 'HSK3'], [4, 'HSK4'], [0, '⭐ Của tôi']].forEach(([v, l]) => tabs.appendChild(h('button' + (lv === v ? '.on' : ''), { onclick: () => { lv = v; limit = 80; paintTabs(); paint(); } }, l)));
      clear(filt);
      [['all', 'Tất cả'], ['new', 'Chưa học'], ['learn', 'Đang học'], ['mature', 'Nhớ chắc']].forEach(([v, l]) => filt.appendChild(h('button.btn.sm' + (filter === v ? '.indigo' : '.ghost'), { onclick: () => { filter = v; paintTabs(); paint(); } }, l)));
    }
    function match(w) {
      if (!q) return true;
      const pyFlat = U.stripTones(w.py).replace(/\s|'/g, '').toLowerCase();
      return w.hz.includes(q) || w.py.toLowerCase().includes(q) || pyFlat.includes(q.replace(/\s/g, '')) || w.hv.toLowerCase().includes(q) || U.viBase(w.vi).includes(U.viBase(q)) || w.vi.toLowerCase().includes(q);
    }
    function paint() {
      clear(list);
      let ws = D.words.filter(w => (q ? true : w.lv === lv) && match(w));
      if (q) ws.sort((a, b) => (a.hz === q ? -1 : 0) - (b.hz === q ? -1 : 0));
      ws = ws.filter(w => {
        const b = SRS.bucket(p.cards[w.id]);
        if (filter === 'new') return b === 'new';
        if (filter === 'learn') return b === 'learning' || b === 'young';
        if (filter === 'mature') return b === 'mature';
        return true;
      });
      info.textContent = `${ws.length} từ` + (q ? ' (tìm trong tất cả cấp)' : '');
      if (lv === 0 && !q) {
        const cu = D.words.filter(w => w.lv === 0);
        const notIn = cu.filter(w => !p.cards[w.id]);
        if (cu.length) list.appendChild(h('div.card.tint-leaf', h('div.row', h('div.grow', h('b', `${cu.length} từ của tôi`), h('div.small.muted', { style: { fontWeight: 500 } }, `${notIn.length} từ chưa vào bộ ôn`)), notIn.length ? h('button.btn.sm', { onclick: () => App.go('learn', 'custom') }, '🚀 Học 10 từ') : null)));
        else list.appendChild(UI.empty('Chưa có từ nào. Bấm "Nhập từ" để thêm từ trong giáo trình bạn đang học.'));
      }
      const names = { new: 'Chưa học', learning: 'Đang học', young: 'Đang nhớ', mature: 'Nhớ chắc' };
      ws.slice(0, limit).forEach(w => {
        const b = SRS.bucket(p.cards[w.id]);
        list.appendChild(h('div.li', { onclick: () => UI.openWord(w) },
          h('span.lz', w.hz),
          h('div.lm', h('b', w.py + (w.hv ? ' · ' + w.hv : '')), h('span', w.vi)),
          w.x ? h('span.pill.info.x30', { title: 'Từ bổ sung theo đề cương HSK 3.0 (11/2025)' }, 'HSK 3.0') : null,
          h('span.st-dot.' + b, { title: names[b], 'aria-label': names[b] }),
          UI.audioBtn(w.hz, { sm: true })));
      });
      if (ws.length > limit) list.appendChild(h('button.btn.ghost.block', { onclick: () => { limit += 120; paint(); } }, `Xem thêm (${ws.length - limit})`));
    }
    paintTabs(); paint();

    function importer() {
      FX.modal(close => {
        const ta = h('textarea.essay', { style: { minHeight: '180px', fontSize: '16px' }, placeholder: '汉字|pinyin|nghĩa tiếng Việt|Hán Việt (tùy chọn)\n例如|lìrú|ví dụ như|lệ như\n新闻|xīnwén|tin tức' });
        return h('div',
          h('h2', '➕ Nhập từ của riêng bạn'),
          h('p.small', { style: { fontWeight: 500 } }, 'Mỗi dòng một từ, các cột cách nhau bằng dấu | hoặc Tab hoặc dấu phẩy. Kho từ đã đủ đề cương HSK 3.0 cấp 1–4; phần này dùng để thêm từ trong giáo trình hoặc tài liệu bạn đang học.'),
          ta,
          h('button.btn.block.mt', {
            onclick: () => {
              const rows = ta.value.split('\n').map(s => s.trim()).filter(Boolean);
              const list = [];
              for (const r of rows) {
                const sep = r.includes('|') ? '|' : r.includes('\t') ? '\t' : ',';
                const c = r.split(sep).map(s => s.trim());
                if (c.length < 3 || !/[㐀-鿿]/.test(c[0])) continue;
                list.push({ hz: c[0], py: c[1], vi: c[2], hv: c[3] || '' });
              }
              if (!list.length) { FX.toast('Không đọc được dòng nào, kiểm tra định dạng nhé'); return; }
              Store.addCustom(list); D.loadCustom();
              close(); FX.toast(`Đã thêm ${list.length} từ ⭐`); lv = 0; paintTabs(); paint();
            }
          }, 'Lưu các từ'));
      });
    }
  }
});
