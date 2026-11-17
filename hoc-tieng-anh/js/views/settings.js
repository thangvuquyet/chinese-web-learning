App.register('settings', {
  render(root) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const p = Store.P();
    const s = Store.settings();
    const sw = (key, onChange) => { const b = h('button.switch' + (s[key] ? '.on' : ''), { type: 'button', 'aria-pressed': String(!!s[key]), onclick: () => { s[key] = !s[key]; b.classList.toggle('on', s[key]); Store.save(true); onChange && onChange(); } }); return b; };
    const row = (t, d, ctl) => h('div.set-row', h('div.grow', h('div.t', t), d ? h('div.d', d) : null), ctl);
    root.appendChild(UI.pageHead('Cài đặt', 'Áp dụng cho ' + p.name + ' trên máy này.'));

    const nameInp = h('input.input', { value: p.name, maxlength: 18, style: { maxWidth: '220px' }, onchange: e => { if (e.target.value.trim()) { p.name = e.target.value.trim(); Store.save(true); FX.toast('Đã đổi tên'); } } });
    const tgt = h('div.seg', [800, 850, 900, 950].map(v => h('button' + (p.target === v ? '.on' : ''), { onclick: e => { p.target = v; Store.save(true); [...tgt.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); } }, v)));
    const goal = h('div.seg', [[30, '15p'], [60, '30p'], [90, '45p'], [120, '60p']].map(([v, t]) => h('button' + (p.goal === v ? '.on' : ''), { onclick: e => { p.goal = v; Store.save(true); [...goal.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); } }, t)));
    const date = h('input.input', { type: 'date', value: p.examDate || '', style: { maxWidth: '200px' }, onchange: e => { p.examDate = e.target.value; Store.save(true); } });
    root.appendChild(h('div.card', h('div.card-h', Art.avatar(p.id, 'md', { ring: true }), h('h3', 'Hồ sơ học')),
      row('Tên hiển thị', null, nameInp),
      row('Điểm mục tiêu', 'Cần đúng khoảng ' + Math.round(Score.needAcc(p.target) * 100) + '% số câu', tgt),
      row('Mục tiêu mỗi ngày', 'XP mỗi ngày (khoảng thời gian học)', goal),
      row('Ngày thi dự kiến', 'Hiện đếm ngược trên trang chủ', date)));

    const voices = Speech.enVoices();
    const vsel = h('select.select', { style: { maxWidth: '300px' }, onchange: e => { s.voice = e.target.value; Store.save(true); Speech.speak('The quarterly report is due on Friday afternoon.'); } }, h('option', { value: '' }, 'Tự chọn giọng tốt nhất'), voices.map(m => h('option', { value: m.v.name, selected: s.voice === m.v.name }, m.v.name + ' · ' + (Speech.ACC_VI[m.accent] || m.accent) + (m.gender ? (m.gender === 'f' ? ' · nữ' : ' · nam') : ''))));
    const acc = h('div.seg', [['mix', 'Trộn 4 giọng'], ['us', 'Mỹ'], ['uk', 'Anh, Úc']].map(([k, t]) => h('button' + (s.accent === k ? '.on' : ''), { onclick: e => { s.accent = k; Store.save(true); [...acc.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); } }, t)));
    const rate = h('input', { type: 'range', min: '0.7', max: '1.2', step: '0.05', value: s.rate, style: { width: '180px' }, oninput: e => { s.rate = +e.target.value; rateV.textContent = s.rate.toFixed(2) + '×'; }, onchange: () => { Store.save(true); Speech.speak('Please submit your expense report by the end of the month.'); } });
    const rateV = h('span.small.muted', (+s.rate).toFixed(2) + '×');
    const accCount = U.uniq(voices.map(v => v.accent)).length;
    root.appendChild(h('div.card.mt', h('div.card-h', h('span.tile-ic.sm', ic('headphones')), h('h3', 'Giọng đọc')),
      voices.length ? null : h('div.callout.warn', ic('alert'), h('div', 'Chưa tìm thấy giọng tiếng Anh. Hãy dùng Chrome hoặc Edge, hoặc cài thêm giọng tiếng Anh trong Windows.')),
      row('Giọng trong bài nghe', 'Đề TOEIC dùng 4 giọng: Mỹ, Anh, Canada, Úc. Máy này có ' + voices.length + ' giọng, ' + accCount + ' kiểu giọng.', acc),
      row('Giọng đọc từ, câu ví dụ', null, vsel),
      row('Tốc độ đọc', null, h('div.row', rate, rateV)),
      voices.length < 4 ? h('div.callout.mt', ic('info'), h('div', 'Mẹo: Microsoft Edge có nhiều giọng thần kinh (Aria, Guy, Sonia, Natasha…) nghe rất tự nhiên. Chrome có giọng Google Mỹ và Anh.')) : null));

    root.appendChild(h('div.card.mt', h('div.card-h', h('span.tile-ic.sm', ic('sliders')), h('h3', 'Học tập')),
      row('Bài nói trong bài học', 'Có câu đọc to (AI chấm) trong bài từ vựng', sw('speakOn')),
      row('Đồng hồ 20 giây Part 5', 'Giúp luyện tốc độ như khi thi', sw('p5timer')),
      row('Âm thanh hiệu ứng', null, sw('sound')),
      row('Hiệu ứng chuyển động', 'Pháo giấy, màn hình chúc mừng', sw('motion', () => document.body.classList.toggle('reduce-motion', !s.motion)))));

    const keyInp = h('input.input', { type: 'password', value: s.aiKey || '', placeholder: 'sk-ant-…', autocomplete: 'off', spellcheck: 'false', style: { maxWidth: '360px' } });
    root.appendChild(h('div.card.mt', h('div.card-h', h('span.tile-ic.sm.ai', ic('ai')), h('div', h('h3', 'AI nhận xét bài nói (tùy chọn)'), h('div.small.muted', 'Dùng Claude của Anthropic để sửa ngữ pháp và viết lại câu trả lời ở mục Trả lời câu hỏi'))),
      h('p.small', 'Chấm phát âm không cần mục này. Chỉ phần nhận xét nội dung bài nói mới cần API key Claude của riêng bạn (tạo tại console.anthropic.com, tính phí theo lượt dùng, mỗi lượt chỉ vài trăm đồng). Key chỉ lưu trong trình duyệt máy này và được gửi thẳng tới Anthropic khi bạn bấm chấm. Lời nói của bạn (dạng chữ) cũng được gửi tới Anthropic để nhận xét.'),
      h('div.row.wrap.mt', keyInp,
        h('button.btn', { onclick: () => { s.aiKey = keyInp.value.trim(); Store.save(true); FX.toast(s.aiKey ? 'Đã lưu key' : 'Đã xóa key'); } }, 'Lưu'),
        h('button.btn.ghost', { onclick: () => { keyInp.type = keyInp.type === 'password' ? 'text' : 'password'; } }, ic('eye')),
        s.aiKey ? h('button.btn.ghost', { onclick: () => { s.aiKey = ''; keyInp.value = ''; Store.save(true); FX.toast('Đã xóa key'); } }, ic('trash'), 'Xóa') : null)));

    const fileInp = h('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' }, onchange: async e => {
      const f = e.target.files[0]; if (!f) return;
      try { const txt = await f.text(); if (!(await FX.confirm('Khôi phục từ file?', 'Dữ liệu hiện tại của cả hai người trên máy này sẽ được thay bằng file sao lưu.', 'Khôi phục', 'Thôi'))) return; Store.importJSON(txt); FX.toast('Đã khôi phục'); App.refresh(); } catch (err) { FX.toast('File không hợp lệ'); }
    } });
    root.appendChild(h('div.card.mt', h('div.card-h', h('span.tile-ic.sm', ic('save')), h('h3', 'Dữ liệu')),
      row('Sao lưu', 'Tải file chứa tiến độ của cả hai người. Dùng để chuyển sang máy khác.', h('button.btn.secondary', { onclick: () => { const blob = new Blob([Store.exportJSON()], { type: 'application/json' }); const a = h('a', { href: URL.createObjectURL(blob), download: 'pawlish-toeic-' + U.dayKey() + '.json' }); document.body.appendChild(a); a.click(); a.remove(); } }, ic('download'), 'Tải file')),
      row('Khôi phục', 'Nạp lại file sao lưu', h('div', fileInp, h('button.btn.secondary', { onclick: () => fileInp.click() }, ic('upload'), 'Chọn file'))),
      row('Gửi tiến độ cho người kia', 'Khi hai người học trên hai máy', h('button.btn.secondary', { onclick: () => App.go('couple') }, ic('link'), 'Mở Đôi ta')),
      row('Học lại từ đầu (' + p.name + ')', 'Xóa tiến độ của riêng ' + p.name + ', giữ tên và mục tiêu', h('button.btn.secondary', { style: { color: 'var(--bad-d)' }, onclick: async () => { if (await FX.confirm('Xóa tiến độ của ' + p.name + '?', 'Không thể hoàn tác. Nên tải file sao lưu trước.', 'Xóa tiến độ', 'Thôi')) { Store.resetProfile(p.id); ExamDB.clearRun(); FX.toast('Đã đặt lại'); App.refresh(); } } }, ic('trash'), 'Đặt lại'))));
    root.appendChild(h('p.center.xs.muted.mt2', 'Pawlish · TOEIC Listening & Reading · dữ liệu lưu cục bộ trên trình duyệt'));
  }
});
