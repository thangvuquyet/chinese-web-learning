App.register('more', {
  render(root) {
    const { h } = U;
    root.appendChild(UI.pageTitle('🌟', 'Khám phá'));
    const tiles = [
      ['grammar', '🧩', 'Ngữ pháp', '66 điểm HSK3–4'],
      ['words', '📚', 'Kho từ vựng', 'Tìm kiếm, nhập thêm từ'],
      ['sounds', '🎵', 'Phát âm', 'Thanh điệu, Hán Việt'],
      ['hanzi', '🀄', 'Chữ Hán', 'Bộ thủ, tập viết'],
      ['speak', '🎤', 'Luyện nói', 'HSKK, shadowing'],
      ['stats', '📊', 'Tiến độ', 'Biểu đồ, huy hiệu'],
      ['tips', '💡', 'Phương pháp học', 'Mẹo có cơ sở khoa học'],
      ['settings', '⚙️', 'Cài đặt', 'Giọng đọc, sao lưu']
    ];
    root.appendChild(h('div.grid2', tiles.map(([r, e, t, s]) => h('button.tile', { onclick: () => App.go(r) }, h('span.te', e), t, h('span.sub', s)))));
    root.appendChild(h('div.card.tint-sky.mt2.center', FX.mascot('happy', 'sm'), h('b', 'Mèo HSK'), h('div.small.muted', { style: { fontWeight: 500 } }, D.words.length.toLocaleString('vi-VN') + ' từ HSK 1–4 (đủ đề cương HSK 3.0) · ' + D.grammar.length + ' điểm ngữ pháp · 40 đề thi thử · thuật toán ôn FSRS-4.5'), h('div.small.muted', { style: { fontWeight: 500 } }, 'Mỗi ngày một chút, tiến bộ mỗi ngày')));
  }
});

App.register('tips', {
  render(root) {
    const { h } = U;
    root.appendChild(UI.pageTitle('💡', 'Phương pháp & mẹo học'));
    root.appendChild(h('div.card.tint-indigo', h('b', '7 nguyên tắc vàng'), h('ol', { style: { margin: '8px 0 0', paddingLeft: '20px', fontWeight: 500, lineHeight: 1.7 } },
      ['Tự kiểm tra thay vì đọc lại (Roediger & Karpicke, 2006).', 'Ôn ngắt quãng đúng lúc sắp quên (Cepeda và cộng sự, 2006) · app dùng FSRS.', 'Học ít mà đều: 30–45 phút mỗi ngày tốt hơn dồn cuối tuần.', 'Nghe/đọc thứ mình hiểu được khoảng 95–98% (Hu & Nation, 2000).', 'Đủ 4 mạch: nghe-đọc, nói-viết, học có chủ đích, luyện trôi chảy (Nation, 2007).', 'Tận dụng Hán Việt, nhưng cảnh giác bẫy Hán Việt.', 'Động lực đến từ tự chủ, cảm giác giỏi lên và học cùng nhau (Deci & Ryan, 2000).'].map(t => h('li', t)))));
    root.appendChild(h('div.col.mt', HSK.tips.map(([e, t, d]) => h('div.card', h('div.tip-card', h('span.te', e), h('div', h('b', t), h('p', d)))))));
    root.appendChild(h('div.card.tint-clay.mt', h('b', '📖 Tài liệu nghiên cứu đầy đủ'), h('p.small', { style: { fontWeight: 500 } }, 'Xem file TAI-LIEU-NGHIEN-CUU.md đi kèm thư mục app: lộ trình 3 ngôn ngữ, định dạng HSK 3.0 / TOEIC / JLPT, lịch học tuần cho hai vợ chồng và danh sách nguồn tham khảo.')));
  }
});

App.register('settings', {
  render(root) {
    const { h, clear } = U;
    const p = Store.P();
    const s = Store.settings();
    root.appendChild(UI.pageTitle('⚙️', 'Cài đặt'));
    root.appendChild(h('div.card',
      h('div.row', h('span.avatar.lg', { style: { background: p.color } }, p.avatar), h('div.grow', h('b', { style: { fontSize: '18px' } }, p.name), h('div.small.muted', { style: { fontWeight: 500 } }, 'Hồ sơ đang dùng')),
        h('button.btn.ghost.sm', { onclick: () => UI.profileEditor(p) }, '✏️ Sửa'), Store.all().length > 1 ? h('button.btn.ghost.sm', { onclick: UI.profileSwitcher }, '🔄 Đổi') : null)));

    root.appendChild(h('div.sec-title', '🎯 Mục tiêu'));
    const goalRow = h('div.row.wrap');
    const paintGoal = () => { clear(goalRow); [[20, 'Nhẹ nhàng'], [40, 'Đều đặn'], [70, 'Chăm chỉ'], [110, 'Tăng tốc']].forEach(([v, l]) => goalRow.appendChild(h('button.btn.sm' + (p.goal === v ? '' : '.ghost'), { onclick: () => { p.goal = v; Store.save(true); paintGoal(); UI.topbar(); } }, `${l} · ${v} XP`))); };
    paintGoal();
    const dateIn = h('input.input', { type: 'date', value: s.examDate || '', onchange: e => { s.examDate = e.target.value; Store.save(true); FX.toast('Đã lưu ngày thi 📅'); } });
    root.appendChild(h('div.card', h('div.small', { style: { fontWeight: 600, marginBottom: '8px' } }, 'XP mỗi ngày (khoảng 1 XP ≈ 1 câu/1 thẻ)'), goalRow,
      h('div.field', h('label', '📅 Ngày thi dự kiến (hiện đếm ngược ở Trang chủ)'), dateIn),
      h('div.small.muted', { style: { fontWeight: 500 } }, 'Gợi ý: HSK 3.0 thi lần đầu toàn cầu ngày 13/12/2026; lịch các tháng sau xem trên chinesetest.cn.')));

    root.appendChild(h('div.sec-title', '🔊 Giọng đọc tiếng Trung'));
    const voiceSel = h('select.input');
    const fillVoices = () => {
      clear(voiceSel);
      const vs = Speech.zhVoices();
      voiceSel.appendChild(h('option', { value: '' }, vs.length ? 'Tự động (khuyên dùng)' : 'Chưa tìm thấy giọng tiếng Trung'));
      vs.forEach(v => { const o = h('option', { value: v.name }, `${v.name} (${v.lang})`); if (v.name === s.voice) o.selected = true; voiceSel.appendChild(o); });
    };
    fillVoices(); setTimeout(fillVoices, 800);
    voiceSel.addEventListener('change', () => { s.voice = voiceSel.value; Store.save(true); Speech.speak('你好，我是小猫。'); });
    const rateVal = h('b', s.rate.toFixed(2) + 'x');
    const rate = h('input', { type: 'range', min: '0.5', max: '1.3', step: '0.05', value: s.rate, oninput: e => { s.rate = +e.target.value; rateVal.textContent = s.rate.toFixed(2) + 'x'; }, onchange: () => { Store.save(true); Speech.speak('今天天气很好。'); } });
    root.appendChild(h('div.card', h('div.field', h('label', 'Giọng'), voiceSel), h('div.field', h('label', h('span', 'Tốc độ đọc: '), rateVal), rate),
      h('button.btn.sky.sm', { onclick: () => Speech.speak('欢迎你学习汉语！加油！') }, '▶️ Nghe thử'),
      h('details.mt', h('summary', { style: { fontWeight: 600, cursor: 'pointer' } }, 'Không có tiếng? Cách cài giọng tiếng Trung'),
        h('ul.small', { style: { fontWeight: 500, lineHeight: 1.7 } },
          h('li', 'Khuyên dùng trình duyệt Microsoft Edge: có sẵn giọng tự nhiên "Xiaoxiao/Yunxi Online (Natural)".'),
          h('li', 'Windows: Cài đặt → Thời gian & ngôn ngữ → Giọng nói → Thêm giọng nói → Tiếng Trung (Giản thể, Trung Quốc).'),
          h('li', 'Android (Chrome): Cài đặt → Hệ thống → Ngôn ngữ → Chuyển văn bản thành lời nói → Công cụ của Google → tải Tiếng Trung.'),
          h('li', 'iPhone/iPad (Safari): Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Trung → tải giọng.'),
          h('li', 'Nhận dạng giọng nói (Luyện nói) cần Chrome hoặc Edge, có Internet và cho phép micro.')))));

    root.appendChild(h('div.sec-title', '🎛️ Tùy chọn'));
    const toggles = [
      ['sound', '🔔 Âm thanh hiệu ứng'], ['motion', '✨ Hoạt hình & pháo giấy'], ['autoplay', '🔊 Tự đọc từ khi hiện thẻ'],
      ['showPy', '🔤 Hiện pinyin trong câu hỏi và ví dụ'], ['showHv', '📜 Hiện âm Hán Việt'], ['unlockAll', '🔓 Mở khóa tất cả bài (học tự do)']
    ];
    root.appendChild(h('div.card', toggles.map(([k, l]) => {
      const inp = h('input', { type: 'checkbox' }); inp.checked = !!s[k];
      inp.addEventListener('change', () => { s[k] = inp.checked; Store.save(true); if (k === 'motion') document.body.classList.toggle('reduce-motion', !s.motion); });
      return h('label.row.between', { style: { padding: '10px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer' } }, h('b', l), h('span.switch', inp, h('span')));
    })));

    root.appendChild(h('div.sec-title', '💾 Sao lưu & chuyển máy'));
    const file = h('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' } });
    file.addEventListener('change', () => {
      const f = file.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = async () => {
        if (!(await FX.confirm('Nhập tiến độ?', 'Dữ liệu hiện tại trên máy này sẽ được thay bằng dữ liệu trong file.', 'Nhập', 'Thôi'))) return;
        try { Store.importJSON(rd.result); FX.toast('✅ Đã nhập tiến độ'); App.refresh(); } catch (e) { FX.toast('❌ ' + e.message); }
      };
      rd.readAsText(f);
    });
    root.appendChild(h('div.card',
      h('p.small', { style: { fontWeight: 500, marginTop: 0 } }, 'Tiến độ lưu trong trình duyệt của máy này. Hãy xuất file định kỳ để sao lưu, hoặc để chuyển sang điện thoại/máy khác.'),
      h('div.row.wrap',
        h('button.btn.leaf.sm', {
          onclick: () => {
            const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
            const a = h('a', { href: URL.createObjectURL(blob), download: `banhbao-hsk-${U.dayKey()}.json` });
            document.body.appendChild(a); a.click(); a.remove();
            FX.toast('Đã tải file sao lưu 💾');
          }
        }, '⬇️ Xuất tiến độ'),
        h('button.btn.sky.sm', { onclick: () => file.click() }, '⬆️ Nhập tiến độ'), file)));

    root.appendChild(h('div.sec-title', '🧹 Khác'));
    root.appendChild(h('div.card',
      h('div.row.wrap',
        h('button.btn.ghost.sm', { onclick: async () => { if (await FX.confirm(`Xóa tiến độ của ${p.name}?`, 'Toàn bộ thẻ, điểm, huy hiệu của hồ sơ này sẽ về 0. Không thể hoàn tác (trừ khi có file sao lưu).', 'Xóa tiến độ', 'Thôi')) { Store.resetProfileProgress(p.id); FX.toast('Đã đặt lại tiến độ'); App.refresh(); } } }, '♻️ Đặt lại tiến độ hồ sơ này'),
        Store.all().length > 1 ? h('button.btn.red.sm', { onclick: async () => { if (await FX.confirm(`Xóa hồ sơ ${p.name}?`, 'Hồ sơ và toàn bộ tiến độ sẽ bị xóa khỏi máy này.', 'Xóa hồ sơ', 'Thôi')) { Store.removeProfile(p.id); App.go('home'); } } }, '🗑️ Xóa hồ sơ') : null),
      h('p.small.muted', { style: { fontWeight: 500 } }, 'Nguồn: định dạng đề theo đề cương HSK 3.0 (CTI, 2025) do các trang luyện thi tổng hợp; từ vựng: HSK 2.0 cấp 1–4 cộng phần bổ sung theo đề cương HSK 3.0 (11/2025) cấp 1–4; nét chữ: Hanzi Writer / Make Me a Hanzi; pinyin câu ví dụ: tra theo kho từ + quy tắc đa âm, biến điệu 一/不; thuật toán ôn: FSRS-4.5 (open-spaced-repetition). Câu hỏi và bài đọc do app biên soạn theo định dạng chính thức, không phải đề thi gốc.')));
  }
});
