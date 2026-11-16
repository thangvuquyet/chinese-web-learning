App.register('speak', {
  render(root, params) {
    const { h, clear } = U;
    const p = Store.P();
    let tab = params[0] || 'repeat';
    let lvl = 3, hideText = false;
    let stopShadow = null;
    root.appendChild(UI.pageTitle('🎤', 'Luyện nói'));
    if (!Speech.canListen()) root.appendChild(h('div.card.tint-clay.mb', h('div.tip-card', h('span.te', 'ℹ️'), h('div', h('b', 'Trình duyệt này chưa chấm được phát âm'), h('p', 'Mở app bằng Chrome hoặc Edge trên máy tính hoặc điện thoại Android, có Internet và cho phép micro. Bạn vẫn nghe mẫu và nói theo được.')))));
    if (!Speech.available()) root.appendChild(h('div.card.tint-jade.mb', h('b', '🔇 Chưa có giọng đọc tiếng Trung'), h('p.small', { style: { fontWeight: 500 } }, 'Vào Cài đặt → Giọng đọc để xem cách cài giọng tiếng Trung cho Windows/điện thoại.')));
    const tabs = h('div.tabs');
    const body = h('div');
    root.append(tabs, body);
    const TABS = [['repeat', 'Đọc theo câu'], ['shadow', 'Shadowing'], ['answer', 'Trả lời câu hỏi']];
    function paintTabs() { clear(tabs); TABS.forEach(([k, l]) => tabs.appendChild(h('button' + (k === tab ? '.on' : ''), { onclick: () => { tab = k; halt(); paintTabs(); paint(); } }, l))); }
    function halt() { if (stopShadow) stopShadow(); stopShadow = null; Speech.stop(); Speech.stopListen(); }
    function paint() { clear(body); ({ repeat, answer, shadow })[tab](); }
    paintTabs(); paint();
    return () => { halt(); Speech.release(); };

    function howCard() {
      return h('details.card.tint-indigo.how',
        h('summary', 'App chấm phát âm thế nào?'),
        h('p', 'App dùng bộ nhận dạng giọng nói tiếng Trung của trình duyệt để nghe bạn đọc, rồi so từng âm tiết với câu mẫu: chữ xanh là đúng, chữ vàng là đúng âm nhưng sai thanh, chữ cam là lẫn âm gần giống (zh/z, an/ang…), chữ đỏ là chưa nghe ra.'),
        h('p', 'Bộ nhận dạng hay "đoán giúp" theo ngữ cảnh nên đôi khi bỏ qua lỗi thanh nhỏ. Vì vậy hãy bấm "Nghe lại giọng mình" để tự so với giọng mẫu.'));
    }

    function repeat() {
      const pool = D.sentences.filter(s => s.lv === lvl && U.countHan(s.text) >= 4 && s.text.length <= 22);
      const s = U.pick(pool);
      const ctrls = h('div.row.wrap', { style: { justifyContent: 'center' } },
        ...[[2, 'HSK2'], [3, 'HSK3'], [4, 'HSK4']].map(([v, l]) => h('button.btn.sm' + (lvl === v ? '.indigo' : '.ghost'), { onclick: () => { lvl = v; paint(); } }, l)),
        h('label.row', { style: { marginLeft: '8px' } }, h('span.switch', h('input', { type: 'checkbox', checked: hideText, onchange: e => { hideText = e.target.checked; paint(); } }), h('span')), h('b.small', 'Ẩn chữ (khó hơn)')));
      const textBox = h('div.qsent', { style: { textAlign: 'center', margin: '12px 0 4px' } }, hideText ? '••••••' : s.text);
      const pyBox = !hideText && Store.settings().showPy ? h('div.pyl', D.pinyin(s.text)) : h('div.pyl');
      let paid = false;
      body.append(ctrls,
        h('div.card.center.mt.page-enter',
          h('div.qtitle', 'Nghe mẫu, rồi đọc lại thật giống'),
          h('div.row', { style: { justifyContent: 'center', gap: '14px' } }, UI.audioBtn(s.text, { big: true }), UI.audioBtn(s.text, { rate: 0.7 })),
          h('div.small.muted', 'Nút lớn: tốc độ thường · nút nhỏ: chậm'),
          textBox, pyBox,
          h('div.small', { style: { fontWeight: 500 } }, s.vi),
          Pron.mic({
            target: s.text,
            onResult: res => {
              if (hideText) { clear(textBox); textBox.append(s.text); clear(pyBox); pyBox.append(D.pinyin(s.text)); }
              if (res.score >= 0.7 && !paid) { paid = true; UI.award(3); }
            }
          }),
          h('button.btn.block.mt', { onclick: paint }, 'Câu khác ➜')),
        howCard());
      setTimeout(() => Speech.speak(s.text), 300);
    }

    function answer() {
      const q = U.pick(HSK.speakQ);
      let paid = false;
      const model = h('div.hidden', h('div.card.tint-sky.mt', { style: { textAlign: 'left' } }, h('b', '📌 Câu trả lời mẫu'), h('div.row', h('p.zh.grow', { style: { fontSize: '18px', lineHeight: 1.8 } }, q[2]), UI.audioBtn(q[2], { sm: true })), Store.settings().showPy ? h('div.pyl.small', D.pinyin(q[2])) : null));
      body.append(
        h('div.card.tint-indigo', h('div.tip-card', h('span.te', '💬'), h('div', h('b', 'Dạng "Trả lời câu hỏi" của HSKK'), h('p', 'Nghe câu hỏi, nghĩ 10 giây, rồi bấm micro và trả lời liền mạch 4–6 câu, khoảng 50 chữ trở lên. Khung: trả lời thẳng → lý do (因为…) → ví dụ → kết (所以…). Nói xong bấm micro lần nữa để chấm.')))),
        h('div.card.center.mt.page-enter',
          UI.audioBtn(q[0], { big: true }),
          h('div.qsent.mt', q[0]),
          Store.settings().showPy ? h('div.pyl', D.pinyin(q[0])) : null,
          h('div.small', { style: { fontWeight: 500 } }, q[1]),
          Pron.mic({
            continuous: true,
            hint: 'Bấm micro rồi trả lời, nói xong bấm lần nữa',
            again: 'Bấm micro để trả lời lại',
            custom: (r, out) => {
              const res = Pron.answerCheck(q[0], r.text, r.secs);
              out.appendChild(Pron.answerView(res, r));
              p.stats.speak++; Store.save();
              if (res.passed >= 3) { FX.sfx.ok(); FX.burstAt(out.querySelector('.pron-score'), 22); } else FX.sfx.tap();
              if (res.passed >= 2 && !paid) { paid = true; UI.award(4 + res.passed); }
            }
          }),
          h('div.row', { style: { justifyContent: 'center' } }, h('button.btn.ghost.sm', { onclick: () => model.classList.toggle('hidden') }, '👀 Xem câu mẫu')),
          model,
          h('button.btn.block.mt', { onclick: paint }, 'Câu hỏi khác ➜')));
      setTimeout(() => Speech.speak(q[0]), 300);
    }

    function shadow() {
      const bank = [...HSK.dlg3.map(d => ['HSK3', d[0], d[3]]), ...HSK.dlg4.map(d => ['HSK4', d[0], d[3]]), ...HSK.mono4.map(m => ['HSK4 · đoạn văn', m[0].split(/(?<=[。！？])/).join('|'), m[2]])];
      const item = U.pick(bank);
      const lines = Speech.parseDialog(item[1]).filter(l => l.text.trim()).map(l => ({ ...l, res: null, audio: null }));
      const can = Speech.canListen();
      let running = false, idx = 0, paid = false;
      const gender = l => l.who === '女' ? 'f' : l.who === '男' ? 'm' : null;
      const list = h('div.sh-list');
      const status = h('div.sh-status', can ? 'Bấm Bắt đầu: app đọc từng câu, bạn nhại lại ngay sau đó, app chấm luôn.' : 'App đọc từng câu rồi dừng cho bạn nói lại.');
      const summary = h('div');
      const todo = () => lines.map((_, i) => i).filter(i => !lines[i].res);
      const btnText = () => running ? '⏹️ Dừng' : !lines.some(l => l.res) ? '▶️ Bắt đầu shadowing' : todo().length ? '▶️ Làm tiếp' : '🔁 Làm lại cả đoạn';
      const btn = h('button.btn.block', { onclick: () => { if (running) return stop(); const t = todo(); run(t.length ? t : lines.map((_, i) => i)); } }, btnText());
      const hideIn = h('input', { type: 'checkbox', checked: hideText, onchange: e => { hideText = e.target.checked; paintList(); } });

      function rowOf(l, i) {
        const showText = !hideText || l.res;
        const sc = l.res ? Math.round(l.res.score * 100) : null;
        const micB = can ? h('button.btn.ghost.icon.sm', { title: 'Đọc lại câu này', onclick: e => { e.stopPropagation(); if (!running) run([i], true); } }, Icon.svg('mic')) : null;
        return h('div.sh-row' + (i === idx && running ? '.on' : '') + (l.res ? (sc >= 80 ? '.good' : sc >= 50 ? '.mid' : '.bad') : ''),
          h('div.sh-line',
            h('span.avatar.sh-who' + (l.who === '男' ? '.m' : ''), l.who || (i + 1)),
            h('div.grow',
              h('div.zh.sh-text', showText ? l.text : '••••••'),
              showText && Store.settings().showPy ? h('div.pyl.small', D.pinyin(l.text)) : null),
            sc != null ? h('span.sh-score', sc + '%') : null,
            h('button.btn.ghost.icon.sm', { title: 'Nghe câu này', onclick: e => { e.stopPropagation(); Speech.speak(l.text, { gender: gender(l) }); } }, Icon.svg('volume')),
            micB),
          l.res ? Pron.view(l.res, { audio: l.audio, compact: true }) : null);
      }
      function paintList() { clear(list); lines.forEach((l, i) => list.appendChild(rowOf(l, i))); }
      function stop() { running = false; Speech.stop(); Speech.stopListen(); btn.textContent = btnText(); status.textContent = 'Đã dừng. Bấm Làm tiếp để đọc tiếp các câu chưa chấm.'; paintList(); }
      stopShadow = () => { running = false; };
      const halt = msg => { running = false; btn.textContent = btnText(); status.textContent = msg; paintList(); };
      async function run(order, single) {
        running = true; btn.textContent = btnText(); clear(summary);
        for (const i of order) {
          if (!running) return;
          idx = i; paintList();
          const row = list.children[i];
          row && row.scrollIntoView({ block: 'nearest', behavior: FX.motionOk() ? 'smooth' : 'auto' });
          status.textContent = '👂 Nghe mẫu…';
          await Speech.speak(lines[i].text, { gender: gender(lines[i]) });
          if (!running) return;
          if (!can) {
            status.textContent = '🗣️ Đến lượt bạn nói lại!';
            await U.sleep(900 + lines[i].text.length * 260);
            continue;
          }
          await U.sleep(200);
          if (!running) return;
          status.textContent = '🎙️ Đến lượt bạn, đọc lại câu vừa nghe…';
          let r = null;
          try { r = await Speech.listen({ record: true, onInterim: t => { status.textContent = '🎙️ ' + t; } }); }
          catch (e) { return halt(e.message === 'network' ? 'Nhận dạng giọng nói cần Internet.' : e.message === 'not-allowed' ? 'Hãy cho phép trang này dùng micro rồi bấm Làm tiếp.' : 'Lỗi nhận dạng: ' + e.message); }
          if (!running) return;
          if (!r.text) return halt('Chưa nghe thấy bạn đọc câu này. Bấm Làm tiếp để thử lại từ câu này.');
          const res = Pron.check(lines[i].text, r.text);
          lines[i].res = res; lines[i].audio = r.audio;
          p.stats.speak++;
          if (res.score >= 0.8) Store.bump('speakOk'); else Store.save();
          res.score >= 0.75 ? FX.sfx.ok() : FX.sfx.tap();
          paintList();
          if (single) break;
        }
        running = false;
        idx = -1;
        btn.textContent = btnText();
        status.textContent = '';
        paintList();
        if (can && lines.every(l => l.res)) finish();
        else if (!can) { status.textContent = 'Xong một lượt! Lặp 3 lượt, lượt cuối thử không nhìn chữ.'; if (!paid) { paid = true; UI.award(3); } }
      }
      function finish() {
        const avg = lines.reduce((a, l) => a + l.res.score, 0) / lines.length;
        const good = lines.filter(l => l.res.score >= 0.8).length;
        const weak = lines.map((l, i) => i).filter(i => lines[i].res.score < 0.8);
        clear(summary);
        summary.appendChild(h('div.card.sh-sum.page-enter',
          h('div.row', h('div.pron-score.' + (avg >= 0.8 ? 'ok' : avg >= 0.5 ? 'mid' : 'bad'), h('b', Math.round(avg * 100) + '%'), h('span', 'trung bình')),
            h('div.grow', h('b', `${good}/${lines.length} câu đạt từ 80%`), h('div.small.muted', weak.length ? 'Luyện lại các câu chưa đạt, rồi thử ẩn chữ.' : 'Cả đoạn đều chuẩn. Thử bật "Ẩn chữ" cho lượt sau.'))),
          weak.length ? h('button.btn.block.mt', { onclick: () => run(weak) }, `🔁 Luyện lại ${weak.length} câu chưa đạt`) : null));
        if (!paid && avg >= 0.6) { paid = true; UI.award(5 + good * 2); }
        if (avg >= 0.8) FX.confetti({ n: 90 });
      }
      body.append(
        h('div.card.tint-leaf', h('div.tip-card', h('span.te', '🗣️'), h('div', h('b', 'Shadowing là gì?'), h('p', 'Nghe một câu rồi nhại lại ngay, bắt chước cả ngữ điệu và tốc độ. Làm 3 lượt mỗi đoạn, lượt cuối bật "Ẩn chữ".')))),
        h('div.row.wrap.mt', h('span.pill.info', item[0]), h('span.grow'),
          h('label.row', h('span.switch', hideIn, h('span')), h('b.small', 'Ẩn chữ')),
          h('button.btn.ghost.sm', { onclick: () => { stop(); paint(); } }, '🔀 Đoạn khác')),
        h('div.mt', list), status, h('div.mt', btn), summary,
        h('div.trans', '💬 ' + item[2]),
        can ? howCard() : null);
      paintList();
    }
  }
});
