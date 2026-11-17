App.register('welcome', {
  render(root) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const st = { step: 0, names: { meo: Store.get('meo').name || 'Mèo', cho: Store.get('cho').name || 'Chó' }, target: 850, examDate: '', goal: 60, me: null };
    const art = h('div.wel-art',
      h('div.row', Art.brandMark(40), h('div', h('b', { style: { fontSize: '19px', color: '#fff', letterSpacing: '-.02em' } }, 'Pawlish'), h('div', { style: { fontSize: '12px', color: '#8F9AC8' } }, 'TOEIC Listening & Reading'))),
      h('h1', 'TOEIC 800–900,', h('br'), h('em', 'học cùng nhau.')),
      h('p', 'Lộ trình cá nhân cho Mèo và Chó: từ vựng nhớ lâu bằng FSRS, ngữ pháp Part 5–6, luyện nghe 4 giọng, đọc hiểu Part 7, đề thi thử 200 câu và AI chấm phát âm.'),
      h('div.wel-feats',
        h('div', ic('target'), 'Dự đoán điểm sau mỗi bài'),
        h('div', ic('ai'), 'AI chấm phát âm từng từ'),
        h('div', ic('exam'), 'Đề thi thử như thi thật'),
        h('div', ic('users'), 'So tiến độ, nhắn động viên')),
      h('div.wel-stage', Art.mascot('cat', 'happy'), Art.mascot('dog', 'happy'),
        h('div.wel-float', { style: { top: '0', left: '4%' } }, 'Dự đoán', h('b', '865')),
        h('div.wel-float', { style: { top: '18%', right: '4%', animationDelay: '1.2s' } }, 'Phát âm', h('b', '92/100'))));
    const form = h('div.wel-card');
    const page = h('div.welcome', art, h('div.wel-form', form));
    root.appendChild(page);
    document.body.classList.add('welcome-mode');
    function dots() { return h('div.steps-dots', [0, 1, 2].map(i => h('i' + (i === st.step ? '.on' : '')))); }
    function draw() {
      U.clear(form);
      form.classList.remove('page-enter'); void form.offsetWidth; form.classList.add('page-enter');
      if (st.step === 0) {
        form.append(dots(), h('div.eyebrow.brand', 'Bước 1/3'), h('h2', 'Hai người cùng học'),
          h('p.muted.mt8', 'Mỗi người có hồ sơ, lộ trình và điểm dự đoán riêng. Có thể đổi tên sau trong Cài đặt.'),
          h('div.who-pick', ['meo', 'cho'].map(id => {
            const m = Store.member(id);
            const inp = h('input.input', { value: st.names[id], maxlength: 18, oninput: e => st.names[id] = e.target.value });
            return h('div.who-card.on', { style: { '--c': m.color } }, Art.mascot(m.animal, 'happy'), inp, h('span.small.muted', id === 'meo' ? 'Hình mèo' : 'Hình chó'));
          })),
          h('button.btn.lg.block.mt2', { onclick: () => { if (!st.names.meo.trim() || !st.names.cho.trim()) return FX.toast('Nhập tên cho cả hai nhé'); st.step = 1; draw(); } }, 'Tiếp tục', ic('chevron')));
      } else if (st.step === 1) {
        const dateInp = h('input.input', { type: 'date', value: st.examDate, onchange: e => st.examDate = e.target.value });
        const tOpts = h('div.target-opts', [[800, 'Xanh dương'], [850, 'Khuyến nghị'], [900, 'Gần vàng']].map(([v, s]) => h('button' + (st.target === v ? '.on' : ''), { onclick: () => { st.target = v; draw(); } }, h('b', v), h('small', s))));
        const gOpts = h('div.seg.block', [[30, '15 phút'], [60, '30 phút'], [90, '45 phút'], [120, '60 phút']].map(([v, t]) => h('button' + (st.goal === v ? '.on' : ''), { onclick: () => { st.goal = v; draw(); } }, t)));
        form.append(dots(), h('div.eyebrow.brand', 'Bước 2/3'), h('h2', 'Mục tiêu chung'),
          h('p.muted.mt8', 'Cả hai cùng hướng tới TOEIC 800–900. Điểm này dùng để tính lộ trình và độ chính xác cần đạt ở từng Part.'),
          h('div.field', h('label', 'Điểm mục tiêu'), tOpts, h('div.hint', 'Cần đúng khoảng ' + Math.round(Score.needAcc(st.target) * 100) + '% số câu ở mỗi kỹ năng.')),
          h('div.field', h('label', 'Thời gian học mỗi ngày'), gOpts, h('div.hint', 'Mục tiêu ' + st.goal + ' XP mỗi ngày. Học đều quan trọng hơn học dồn.')),
          h('div.field', h('label', 'Ngày thi dự kiến (không bắt buộc)'), dateInp),
          h('div.row.mt2', h('button.btn.secondary.lg', { onclick: () => { st.step = 0; draw(); } }, ic('back')), h('button.btn.lg.grow', { onclick: () => { st.step = 2; draw(); } }, 'Tiếp tục', ic('chevron'))));
      } else {
        form.append(dots(), h('div.eyebrow.brand', 'Bước 3/3'), h('h2', 'Ai đang dùng máy này?'),
          h('p.muted.mt8', 'Máy này sẽ mở sẵn hồ sơ đó. Người còn lại vẫn học được trên máy này bằng nút đổi người học, hoặc học trên máy riêng rồi gửi mã tiến độ cho nhau.'),
          h('div.who-pick', ['meo', 'cho'].map(id => {
            const m = Store.member(id);
            return h('button.who-card' + (st.me === id ? '.on' : ''), { style: { '--c': m.color }, onclick: () => { st.me = id; draw(); } }, Art.mascot(m.animal, st.me === id ? 'wow' : 'happy'), h('b', st.names[id]));
          })),
          h('div.row.mt2', h('button.btn.secondary.lg', { onclick: () => { st.step = 1; draw(); } }, ic('back')), h('button.btn.lg.grow', { disabled: !st.me, onclick: finish }, 'Bắt đầu học', ic('rocket'))));
      }
    }
    function finish() {
      Store.finishSetup({ names: { meo: st.names.meo.trim(), cho: st.names.cho.trim() }, target: st.target, examDate: st.examDate, me: st.me });
      Store.IDS.forEach(id => Store.get(id).goal = st.goal);
      Store.save(true);
      FX.sfx.done(); FX.confetti({ n: 150 });
      UI.focus(false);
      document.body.classList.remove('welcome-mode');
      location.hash = '#/home';
      App.render();
    }
    draw();
  }
});
