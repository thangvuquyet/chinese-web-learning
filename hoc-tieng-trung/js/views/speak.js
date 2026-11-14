App.register('speak', {
  render(root, params) {
    const { h, clear } = U;
    const p = Store.P();
    let tab = params[0] || 'repeat';
    let lvl = 3, hideText = false;
    root.appendChild(UI.pageTitle('🎤', 'Luyện nói (HSKK)'));
    if (!Speech.canListen()) root.appendChild(h('div.card.tint-clay.mb', h('div.tip-card', h('span.te', 'ℹ️'), h('div', h('b', 'Trình duyệt chưa hỗ trợ nhận dạng giọng nói'), h('p', 'Hãy mở bằng Chrome hoặc Edge (có Internet) để app chấm phát âm. Bạn vẫn có thể nghe mẫu, nói theo và tự so sánh.')))));
    if (!Speech.available()) root.appendChild(h('div.card.tint-jade.mb', h('b', '🔇 Chưa có giọng đọc tiếng Trung'), h('p.small', { style: { fontWeight: 500 } }, 'Vào Cài đặt → Giọng đọc để xem hướng dẫn cài giọng tiếng Trung cho Windows/điện thoại.')));
    const tabs = h('div.tabs');
    const body = h('div');
    root.append(tabs, body);
    const TABS = [['repeat', 'Nghe & nói theo'], ['answer', 'Trả lời câu hỏi'], ['shadow', 'Shadowing']];
    function paintTabs() { clear(tabs); TABS.forEach(([k, l]) => tabs.appendChild(h('button' + (k === tab ? '.on' : ''), { onclick: () => { tab = k; Speech.stop(); paintTabs(); paint(); } }, l))); }
    function paint() { clear(body); ({ repeat, answer, shadow })[tab](); }
    paintTabs(); paint();
    return () => { Speech.stopListen(); Speech.stop(); };

    function micBlock(target, onScore) {
      const out = h('div.center.mt');
      const mic = h('button.mic-btn', { 'aria-label': 'Bấm để nói' }, '🎙️');
      const hint = h('div.small.muted', { style: { fontWeight: 600 } }, Speech.canListen() ? 'Bấm micro rồi nói' : 'Nói to theo mẫu, rồi tự so sánh');
      mic.addEventListener('click', async () => {
        if (!Speech.canListen()) { FX.toast('Cần Chrome/Edge để nhận dạng giọng nói'); return; }
        if (mic.classList.contains('rec')) { Speech.stopListen(); return; }
        Speech.stop();
        mic.classList.add('rec'); hint.textContent = '🔴 Đang nghe… nói xong sẽ tự dừng';
        clear(out);
        try {
          const alts = await Speech.listen({ onInterim: t => { hint.textContent = '👂 ' + t; } });
          mic.classList.remove('rec'); hint.textContent = 'Bấm micro để thử lại';
          if (!alts.length) { out.appendChild(h('div.small.muted', { style: { fontWeight: 600 } }, 'Không nghe rõ, thử lại gần micro hơn nhé.')); return; }
          let best = null;
          for (const a of alts) { const s = U.similarity(target, a); if (!best || s.score > best.s.score) best = { a, s }; }
          showDiff(best);
        } catch (e) {
          mic.classList.remove('rec');
          hint.textContent = e.message === 'not-allowed' ? 'Hãy cho phép quyền micro cho trang này' : 'Lỗi nhận dạng: ' + e.message;
        }
      });
      function showDiff(best) {
        const pct = Math.round(best.s.score * 100);
        const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
        const diff = h('div.diff', [...best.s.target].map((c, i) => h('span.' + (best.s.hit[i] ? 'ok' : 'miss'), c)));
        out.append(
          h('div.result-stars', { style: { fontSize: '40px' } }, [0, 1, 2].map(i => h('span' + (i < stars ? '' : '.off'), '⭐'))),
          h('div', { style: { fontWeight: 700, fontSize: '20px' } }, `Độ giống: ${pct}%`),
          h('div.mt', diff),
          h('div.small.muted.mt', { style: { fontWeight: 500 } }, 'App nghe được: ', h('span.zh', best.a)));
        if (stars >= 2) { FX.sfx.ok(); FX.burstAt(out, 40); } else FX.sfx.tap();
        p.stats.speak++; Store.save();
        onScore && onScore(pct);
      }
      return h('div', mic, hint, out);
    }

    function repeat() {
      const pool = D.sentences.filter(s => s.lv === lvl && s.text.length <= 22);
      const s = U.pick(pool);
      const ctrls = h('div.row.wrap', { style: { justifyContent: 'center' } },
        ...[[2, 'HSK2'], [3, 'HSK3'], [4, 'HSK4']].map(([v, l]) => h('button.btn.sm' + (lvl === v ? '.indigo' : '.ghost'), { onclick: () => { lvl = v; paint(); } }, l)),
        h('label.row', { style: { marginLeft: '8px' } }, h('span.switch', h('input', { type: 'checkbox', checked: hideText, onchange: e => { hideText = e.target.checked; paint(); } }), h('span')), h('b.small', 'Ẩn chữ (khó hơn)')));
      const textBox = h('div.qsent', { style: { textAlign: 'center', margin: '12px 0' } }, hideText ? '••••••' : s.text);
      body.append(ctrls,
        h('div.card.center.mt.page-enter',
          h('div.qtitle', { style: { fontWeight: 700, color: 'var(--ink2)' } }, 'Nghe mẫu, rồi nói lại thật giống'),
          h('div.row', { style: { justifyContent: 'center', gap: '14px' } }, UI.audioBtn(s.text, { big: true }), UI.audioBtn(s.text, { rate: 0.75 })),
          h('div.small.muted', { style: { fontWeight: 500 } }, 'Nút lớn: tốc độ thường · nút nhỏ: chậm'),
          textBox,
          !hideText && Store.settings().showPy ? h('div.pyl', { style: { color: 'var(--jade-d)', fontWeight: 500 } }, D.pinyin(s.text)) : null,
          h('div.small', { style: { fontWeight: 500 } }, s.vi),
          micBlock(s.text, pct => { if (hideText) { clear(textBox); textBox.append(s.text); } if (pct >= 70) Store.addXP(3); }),
          h('button.btn.block.mt', { onclick: paint }, 'Câu khác ➜')));
      setTimeout(() => Speech.speak(s.text), 300);
    }
    function answer() {
      const q = U.pick(HSK.speakQ);
      const model = h('div.hidden', h('div.card.tint-sky.mt', { style: { textAlign: 'left' } }, h('b', '📌 Câu trả lời mẫu'), h('div.row', h('p.zh.grow', { style: { fontSize: '18px', lineHeight: 1.8 } }, q[2]), UI.audioBtn(q[2], { sm: true }))));
      body.append(
        h('div.card.tint-indigo', h('div.tip-card', h('span.te', '💬'), h('div', h('b', 'Dạng "Trả lời câu hỏi" của HSKK'), h('p', 'Nghe câu hỏi, chuẩn bị 10 giây, rồi trả lời ít nhất 3–4 câu. Dùng khung: trả lời thẳng → lý do (因为…) → ví dụ → kết (所以…).')))),
        h('div.card.center.mt.page-enter',
          UI.audioBtn(q[0], { big: true }),
          h('div.qsent.mt', q[0]), h('div.small', { style: { fontWeight: 500 } }, q[1]),
          micBlock(q[2], pct => { if (pct >= 30) Store.addXP(4); }),
          h('div.row', { style: { justifyContent: 'center' } }, h('button.btn.ghost.sm', { onclick: () => model.classList.toggle('hidden') }, '👀 Xem câu mẫu')),
          model,
          h('button.btn.block.mt', { onclick: paint }, 'Câu hỏi khác ➜')));
      setTimeout(() => Speech.speak(q[0]), 300);
    }
    function shadow() {
      const bank = [...HSK.dlg3.map(d => ['HSK3', d[0], d[3]]), ...HSK.dlg4.map(d => ['HSK4', d[0], d[3]]), ...HSK.mono4.map(m => ['HSK4 · đoạn văn', m[0].split(/(?<=[。！？])/).join('|'), m[2]])];
      const item = U.pick(bank);
      const lines = Speech.parseDialog(item[1]).filter(l => l.text.trim());
      let playing = false;
      const list = h('div.col');
      lines.forEach((l, i) => list.appendChild(h('div.li', { onclick: () => Speech.speak(l.text, { gender: l.who === '女' ? 'f' : l.who === '男' ? 'm' : null }) },
        h('span.avatar', { style: { width: '30px', height: '30px', fontSize: '15px', background: l.who === '男' ? 'var(--sky-l)' : 'var(--jade-l)' } }, l.who || (i + 1)),
        h('div.lm', h('span.zh', { style: { fontSize: '18px', fontWeight: 500 } }, l.text)), h('span', '🔊'))));
      const status = h('div.center.small.muted', { style: { fontWeight: 600 } }, '');
      async function playAll() {
        if (playing) { playing = false; Speech.stop(); btn.textContent = '▶️ Bắt đầu shadowing'; status.textContent = ''; return; }
        playing = true; btn.textContent = '⏹️ Dừng';
        for (let i = 0; i < lines.length && playing; i++) {
          [...list.children].forEach((c, k) => c.style.borderColor = k === i ? 'var(--jade)' : '');
          status.textContent = '👂 Nghe…';
          const ok = await Speech.speak(lines[i].text, { gender: lines[i].who === '女' ? 'f' : lines[i].who === '男' ? 'm' : null });
          if (!playing || ok === false && !playing) break;
          status.textContent = '🗣️ Đến lượt bạn nói lại!';
          await U.sleep(900 + lines[i].text.length * 260);
        }
        playing = false; btn.textContent = '▶️ Bắt đầu shadowing'; status.textContent = 'Xong một lượt! Thử lại cho trôi chảy hơn nhé 🎉';
        [...list.children].forEach(c => c.style.borderColor = '');
        Store.addXP(3);
      }
      const btn = h('button.btn.block', { onclick: playAll }, '▶️ Bắt đầu shadowing');
      body.append(
        h('div.card.tint-leaf', h('div.tip-card', h('span.te', '🗣️'), h('div', h('b', 'Shadowing là gì?'), h('p', 'App đọc từng câu rồi dừng cho bạn nói lại. Cố bắt chước cả ngữ điệu và tốc độ. Lặp 3 lượt mỗi đoạn, lượt cuối thử không nhìn chữ.')))),
        h('div.row.mt', h('span.pill.info', item[0]), h('span.grow'), h('button.btn.ghost.sm', { onclick: () => { playing = false; Speech.stop(); paint(); } }, '🔀 Đoạn khác')),
        h('div.mt', list), status, h('div.mt', btn),
        h('div.trans', '💬 ' + item[2]));
    }
  }
});
