(() => {
  const { h, clear } = U;
  const PKEY = 'banhbao-exam-progress';
  const getProg = () => { try { return JSON.parse(localStorage.getItem(PKEY)); } catch (e) { return null; } };
  const setProg = v => { try { v ? localStorage.setItem(PKEY, JSON.stringify(v)) : localStorage.removeItem(PKEY); } catch (e) {} };

  App.register('exams', {
    render(root, params) {
      const p = Store.P();
      let lv = +(params[0] || (Object.keys(p.cards).filter(id => D.byId[id] && D.byId[id].lv === 4).length > 150 ? 4 : 3));
      root.appendChild(UI.pageTitle('📝', 'Thi thử HSK 3.0'));
      const prog = getProg();
      if (prog && prog.pid === p.id) root.appendChild(h('div.card.tint-gold.mb', { style: { background: 'linear-gradient(135deg,#fff,#F8F0DC)' } },
        h('div.row', h('span', { style: { fontSize: '30px' } }, '⏸️'), h('div.grow', h('b', `Đang làm dở: HSK${prog.level} · Đề ${prog.no}`), h('div.small.muted', { style: { fontWeight: 500 } }, `Đã trả lời ${Object.keys(prog.answers || {}).length} câu · còn ${U.fmtDur(prog.left)}`)),
          h('button.btn.sm', { onclick: () => App.go('exam', prog.level, prog.no) }, 'Làm tiếp'))));
      const tabs = h('div.tabs');
      const body = h('div');
      root.append(tabs, body);
      function paintTabs() {
        clear(tabs);
        [[3, '📘 HSK3 · 20 đề'], [4, '🏆 HSK4 · 20 đề']].forEach(([v, l]) => tabs.appendChild(h('button' + (v === lv ? '.on' : ''), { onclick: () => { lv = v; paintTabs(); paint(); } }, l)));
      }
      function paint() {
        clear(body);
        const conf = Exam.CONF[lv];
        const mine = p.exams.filter(e => e.level === lv);
        const best = mine.length ? Math.max(...mine.map(e => e.total)) : 0;
        const passN = U.uniq(mine.filter(e => e.total >= 180).map(e => e.no)).length;
        body.append(
          h('div.card.tint-jade', h('div.tip-card', h('span.te', lv === 3 ? '📘' : '🏆'), h('div', h('b', conf.intro), h('p', 'Mỗi đề có bộ câu hỏi riêng. Mỗi lần làm lại, khoảng một nửa câu hỏi được thay mới và đáp án được xáo trộn. Chấm theo thang 300 (mỗi phần 100), mốc đỗ tham khảo 180.')))),
          h('div.stat-row', h('div.stat.jade', h('b', mine.length), h('span', 'Lượt đã làm')), h('div.stat.leaf', h('b', best || '–'), h('span', 'Điểm cao nhất')), h('div.stat.gold', h('b', `${passN}/20`), h('span', 'Đề đã đỗ'))),
          h('div.exam-grid', Array.from({ length: Exam.COUNT }, (_, i) => {
            const no = i + 1;
            const at = mine.filter(e => e.no === no);
            const b = at.length ? Math.max(...at.map(e => e.total)) : null;
            return h('button.exam-card' + (b >= 180 ? '.pass' : b != null ? '.tried' : ''), { onclick: () => App.go('exam', lv, no) },
              h('span.en', 'Đề'), h('span.eno', no), h('span.es', b != null ? `${b}/300 · ${at.length} lần` : 'Chưa làm'));
          })),
          h('div.sec-title', '⚡ Luyện nhanh theo dạng bài'),
          h('div.grid2', [
            ['listen3', '🎧', 'Nghe hội thoại HSK3'], ['pic', '🖼️', 'Nghe chọn tranh'],
            ['listen4', '🎧', 'Nghe hội thoại HSK4'], ['read3', '📖', 'Đọc hiểu HSK3'], ['read4', '📚', 'Đọc hiểu HSK4']
          ].map(([k, e, t]) => h('button.tile', { onclick: () => App.go('drill', k) }, h('span.te', e), t, h('span.sub', '8 câu · chấm ngay')))),
          mine.length ? h('div.sec-title', '🗂️ Lịch sử làm bài') : null,
          mine.length ? h('div.card', h('table.simple', h('tr', ...['Ngày', 'Đề', 'Nghe', 'Đọc', 'Viết', 'Tổng', ''].map(t => h('th', t))),
            ...mine.slice().reverse().slice(0, 15).map(e => h('tr', h('td', U.fmtDate(e.date)), h('td', e.no), h('td', e.L), h('td', e.R), h('td', e.W), h('td', h('b', { style: { color: e.total >= 180 ? 'var(--leaf-d)' : 'var(--jade-d)' } }, e.total)),
              h('td', h('button.btn.ghost.sm', { onclick: () => App.go('examreview', p.exams.indexOf(e)) }, 'Xem')))))) : null);
      }
      paintTabs(); paint();
    }
  });

  App.register('exam', {
    render(root, params) {
      const p = Store.P();
      const level = +params[0], no = +params[1];
      if (!Exam.CONF[level] || !(no >= 1 && no <= Exam.COUNT)) { root.appendChild(UI.empty('Không tìm thấy đề.')); return; }
      const prog = getProg();
      const resume = prog && prog.pid === p.id && prog.level === level && prog.no === no ? prog : null;
      const attempt = resume ? resume.attempt : p.exams.filter(e => e.level === level && e.no === no).length;
      const exam = Exam.build(level, no, attempt);
      let answers = resume ? resume.answers : {};
      let plays = resume ? (resume.plays || {}) : {};
      let idx = resume ? resume.idx || 0 : 0;
      let left = resume ? resume.left : exam.time;
      let realMode = resume ? resume.real : true;
      let timer = null;
      let saveTick = 0;
      if (resume) run(); else intro();
      return () => { clearInterval(timer); Speech.stop(); };

      function intro() {
        clear(root);
        const conf = Exam.CONF[level];
        const modeSel = h('div.col');
        const paintMode = () => {
          clear(modeSel);
          [[true, '🎯 Thi thật', 'Có giờ, mỗi đoạn nghe tối đa 2 lượt, câu hỏi nghe chỉ có trong audio'], [false, '🌱 Luyện tập', 'Vẫn tính giờ nhưng nghe không giới hạn, hiện câu hỏi nghe']].forEach(([v, t, d]) =>
            modeSel.appendChild(h('button.opt' + (realMode === v ? '.sel' : ''), { onclick: () => { realMode = v; paintMode(); } }, h('span.k', v ? 'A' : 'B'), h('div', h('b', t), h('div.small.muted', d)))));
        };
        paintMode();
        root.append(
          h('div.row', UI.backBtn(() => App.go('exams', level)), h('span.grow')),
          h('div.card.center.mt.page-enter',
            FX.mascot('think', 'lg'),
            h('h2', `HSK${level} · Đề số ${no}` + (attempt ? ` · lần ${attempt + 1}` : '')),
            h('p', { style: { fontWeight: 500 } }, conf.intro),
            h('div.col', { style: { textAlign: 'left' } }, exam.sections.map(s => h('div.card', { style: { padding: '12px' } }, h('b', `${s.icon} ${s.name} · ${s.items.length} câu`), h('ul.small', { style: { margin: '6px 0 0', paddingLeft: '18px', fontWeight: 500 } }, s.parts.map(pt => h('li', `Câu ${pt.from}–${pt.to}: ${pt.label.split('·')[1] || pt.label}`)))))),
            h('div.sec-title', 'Chế độ làm bài'), modeSel,
            h('p.small.muted', { style: { fontWeight: 500 } }, '💡 Đeo tai nghe, chọn nơi yên tĩnh. Bài làm tự lưu, thoát giữa chừng vẫn làm tiếp được.'),
            h('button.btn.block.mt', { onclick: () => { left = exam.time; answers = {}; plays = {}; idx = 0; run(); } }, `⏱️ Bắt đầu (${Math.round(exam.time / 60)} phút)`)));
      }
      function persist() { setProg({ pid: p.id, level, no, attempt, answers, plays, idx, left, real: realMode }); }
      function run() {
        clear(root);
        window.scrollTo(0, 0);
        const timerEl = h('span.timer', U.fmtDur(left));
        const secPills = h('div.row.wrap');
        const qnav = h('div.qnav');
        const head = h('div.exam-head',
          h('div.row', h('b', `HSK${level} · Đề ${no}`), h('span.grow'), timerEl, h('button.btn.sm.leaf', { onclick: submitAsk }, 'Nộp bài')),
          h('div.mt', secPills), qnav);
        const area = h('div');
        const nav = h('div.row.mt2', h('button.btn.ghost', { onclick: () => goTo(idx - 1) }, '← Câu trước'), h('span.grow'), h('button.btn.sky', { onclick: () => goTo(idx + 1) }, 'Câu sau →'));
        root.append(head, area, nav);
        clearInterval(timer);
        timer = setInterval(() => {
          left--;
          timerEl.textContent = U.fmtDur(left);
          timerEl.classList.toggle('warn', left <= 300);
          if (++saveTick % 10 === 0) persist();
          if (left <= 0) { clearInterval(timer); FX.toast('⏰ Hết giờ! Tự động nộp bài.'); submit(); }
        }, 1000);
        function paintNav() {
          clear(secPills); clear(qnav);
          const cq = exam.items[idx];
          exam.sections.forEach(s => secPills.appendChild(h('button.btn.sm' + (cq.sec === s.key ? '.indigo' : '.ghost'), { onclick: () => goTo(exam.items.indexOf(s.items[0])) }, `${s.icon} ${s.name}`)));
          exam.items.forEach((q, i) => {
            if (q.sec !== cq.sec) return;
            const a = answers[i];
            const has = a != null && (!Array.isArray(a) || a.length) && (typeof a !== 'object' || Array.isArray(a) || (a.text || '').length);
            qnav.appendChild(h('button' + (i === idx ? '.cur' : has ? '.ans' : ''), { onclick: () => goTo(i) }, q.num));
          });
        }
        function goTo(i) {
          if (i < 0 || i >= exam.items.length) { if (i >= exam.items.length) submitAsk(); return; }
          Speech.stop();
          idx = i; persist(); paint();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        function paint() {
          paintNav();
          const q = exam.items[idx];
          clear(area);
          area.appendChild(h('div.row.mb', h('span.sec-pill', `Câu ${q.num}/${exam.items.length}`), h('span.small.muted', { style: { fontWeight: 600 } }, q.part)));
          const holder = h('div');
          area.appendChild(holder);
          const ctx = {
            mode: 'exam', value: answers[idx], audioLimit: realMode ? 2 : 0, plays: plays[idx] || 0,
            autoListen: !(plays[idx] > 0),
            onPlay: n => { plays[idx] = n; persist(); },
            onAnswer: v => { answers[idx] = v; persist(); paintNav(); }
          };
          if (!realMode && (q.type === 'listen')) ctx.mode = 'exam';
          R.render(q, holder, ctx);
          if (!realMode && q.type === 'listen' && q.q) holder.querySelector('.q-prompt').appendChild(h('div.qsent.mt', { style: { fontSize: '19px' } }, '问：' + q.q));
        }
        paint();
      }
      async function submitAsk() {
        const unanswered = exam.items.filter((q, i) => answers[i] == null || (Array.isArray(answers[i]) && !answers[i].length)).length;
        const ok = await FX.confirm('Nộp bài?', unanswered ? `Còn ${unanswered} câu chưa trả lời.` : 'Bạn đã trả lời tất cả câu hỏi.', 'Nộp bài', 'Làm tiếp');
        if (ok) submit();
      }
      function submit() {
        clearInterval(timer);
        Speech.stop();
        const sc = Exam.score(exam, answers);
        const rec = { level, no, attempt, date: Date.now(), dur: exam.time - left, L: sc.L, R: sc.R, W: sc.W, total: sc.total, right: sc.right, count: sc.count, answers, real: realMode };
        p.exams.push(rec);
        setProg(null);
        Store.addMinutes(Math.max(1, Math.round(rec.dur / 60)));
        Store.save(true);
        const pass = sc.total >= 180;
        const ev = Store.addXP(40 + (pass ? 30 : 0));
        showResult(root, p, rec, sc, p.exams.length - 1);
        UI.celebrate(ev);
      }
    }
  });

  function showResult(root, p, rec, sc, index) {
    clear(root);
    const pass = rec.total >= 180;
    const hist = p.exams.filter(e => e.level === rec.level);
    root.append(h('div.result-wrap.page-enter',
      FX.mascot(pass ? 'wow' : 'happy', 'lg'),
      h('h1', { style: { margin: '6px 0' } }, pass ? 'ĐỖ rồi! 恭喜你！' : 'Hoàn thành bài thi!'),
      h('div.score-big', rec.total), h('div', { style: { fontWeight: 700, color: 'var(--muted)' } }, '/ 300 điểm · mốc đỗ tham khảo 180'),
      h('div.card.mt', { style: { textAlign: 'left' } },
        ...[['🎧 Nghe', rec.L, ''], ['📖 Đọc', rec.R, 'indigo'], ['✍️ Viết', rec.W, 'gold']].map(([n, v, c]) => h('div.sec-bar', h('span', n), UI.progress(v / 100, c), h('b', v))),
        sc && sc.essay ? h('div.small.muted', { style: { fontWeight: 500, marginTop: '8px' } }, `Bài viết: ${sc.essay.pts}/40 điểm (${sc.essay.auto.n} chữ, ${sc.essay.auto.found.length} liên từ)`) : null,
        h('div.small', { style: { fontWeight: 600, marginTop: '8px' } }, `Đúng ${rec.right}/${rec.count} câu trắc nghiệm · thời gian ${U.fmtDur(rec.dur)}`)),
      hist.length > 1 ? h('div.card.mt', h('b', '📈 Tiến bộ HSK' + rec.level), lineChart(hist.map(e => e.total))) : null,
      h('div.card.tint-indigo.mt', { style: { textAlign: 'left' } }, h('b', '🧭 Gợi ý ôn tập'), h('ul', { style: { margin: '6px 0 0', paddingLeft: '18px', fontWeight: 500 } }, advice(rec).map(t => h('li', t)))),
      h('div.col.mt',
        h('button.btn.block', { onclick: () => App.go('examreview', index) }, '🔍 Xem lại đáp án & lời dịch'),
        h('button.btn.indigo.block', { onclick: () => App.go('exam', rec.level, rec.no) }, '🔁 Làm lại đề này (câu hỏi mới)'),
        rec.no < Exam.COUNT ? h('button.btn.ghost.block', { onclick: () => App.go('exam', rec.level, rec.no + 1) }, `▶️ Sang đề ${rec.no + 1}`) : null,
        h('button.btn.ghost.block', { onclick: () => App.go('exams', rec.level) }, '📝 Danh sách đề'))));
    FX.sfx.done();
    setTimeout(() => FX.confetti({ n: pass ? 220 : 100 }), 300);
  }
  function advice(rec) {
    const out = [];
    const min = Math.min(rec.L, rec.R, rec.W);
    if (rec.L === min) out.push('Nghe là phần yếu nhất: mỗi ngày làm "Thử thách nghe 5 phút" và shadowing 5 câu.');
    if (rec.R === min) out.push('Đọc là phần yếu nhất: ôn thẻ từ đều đặn, đọc câu hỏi trước rồi mới tìm trong bài.');
    if (rec.W === min) out.push('Viết là phần yếu nhất: luyện "Sắp xếp câu" theo trật tự S + thời gian + nơi chốn + V + O; học kỹ câu 把/被 và bổ ngữ.');
    if (rec.total < 180) out.push('Mục tiêu tiếp theo: tăng 15–20 điểm mỗi tuần. Làm 1–2 đề/tuần, xem lại kỹ câu sai.');
    else out.push('Đã qua mốc 180! Giữ phong độ bằng cách làm thêm đề khác và nhắm 210+ để an toàn khi thi thật.');
    out.push('Đề trong app được biên soạn theo định dạng HSK 3.0. Trước kỳ thi hãy làm thêm đề mẫu chính thức trên chinesetest.cn.');
    return out;
  }
  function lineChart(vals) {
    const W = 320, H = 120, pad = 22;
    const n = vals.length;
    const x = i => pad + (n === 1 ? 0 : i * (W - pad * 2) / (n - 1));
    const y = v => H - pad - v / 300 * (H - pad * 2);
    const pts = vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    const el = h('div');
    el.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}"><line x1="${pad}" x2="${W - pad}" y1="${y(180)}" y2="${y(180)}" stroke="#2A9D68" stroke-dasharray="4 4"/><text x="${W - pad}" y="${y(180) - 4}" text-anchor="end">180</text><polyline points="${pts}" fill="none" stroke="#0F7B66" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="#fff" stroke="#0B5F4F" stroke-width="2.5"/><text x="${x(i)}" y="${y(v) - 8}" text-anchor="middle">${v}</text>`).join('')}</svg>`;
    return el;
  }

  App.register('examreview', {
    render(root, params) {
      const p = Store.P();
      const rec = p.exams[+params[0]];
      if (!rec) { root.appendChild(UI.empty('Không tìm thấy lượt thi.')); return; }
      const exam = Exam.build(rec.level, rec.no, rec.attempt);
      const sc = Exam.score(exam, rec.answers);
      let onlyWrong = false;
      const box = h('div');
      root.append(
        h('div.row', UI.backBtn(() => App.go('exams', rec.level)), h('span.grow'), h('b', `HSK${rec.level} · Đề ${rec.no} · ${rec.total}/300`)),
        h('div.row.mt', h('label.row', h('span.switch', h('input', { type: 'checkbox', onchange: e => { onlyWrong = e.target.checked; paint(); } }), h('span')), h('b', 'Chỉ xem câu sai'))),
        box);
      function paint() {
        clear(box);
        for (const s of exam.sections) {
          box.appendChild(h('div.sec-title', `${s.icon} ${s.name} · ${rec[s.key]}/100`));
          for (const q of s.items) {
            const i = exam.items.indexOf(q);
            const ok = q.type === 'essay' ? null : sc.per[i];
            if (onlyWrong && ok !== false) continue;
            const holder = h('div');
            const card = h('div.card.mt',
              h('div.row.mb', h('span.sec-pill', `Câu ${q.num}`), h('span.small.muted.grow', { style: { fontWeight: 600 } }, q.part), ok == null ? h('span.pill.info', 'Tự chấm') : h('span.pill' + (ok ? '.ok' : '.bad'), ok ? '✓ Đúng' : rec.answers[i] == null ? '– Bỏ trống' : '✗ Sai')),
              holder);
            R.render(q, holder, { mode: 'review', value: rec.answers[i] });
            box.appendChild(card);
          }
        }
        if (!box.querySelector('.card')) box.appendChild(UI.empty('Không có câu sai nào. Quá đỉnh! 🎉', 'wow'));
      }
      paint();
    }
  });

  App.register('drill', {
    render(root, params) {
      const kind = params[0] || 'listen3';
      const names = { listen3: 'Nghe hội thoại HSK3', listen4: 'Nghe hội thoại HSK4', pic: 'Nghe chọn tranh', read3: 'Đọc hiểu HSK3', read4: 'Đọc hiểu HSK4' };
      const qs = Exam.drill(kind, 8);
      root.appendChild(h('div.small.muted.mb', { style: { fontWeight: 600 } }, '⚡ ' + (names[kind] || 'Luyện nhanh')));
      const holder = h('div');
      root.appendChild(holder);
      const run = R.runner(holder, {
        questions: qs, onExit: () => App.go('exams'), onFinish: res => {
          const xp = 8 + Math.round(res.acc * 12);
          const ev = Store.addXP(xp);
          R.resultScreen(holder, res, { xp, buttons: [h('button.btn.block', { onclick: () => App.go('drill', kind) }, '🔁 Làm 8 câu khác'), h('button.btn.ghost.block', { onclick: () => App.go('exams') }, '📝 Về trang thi thử')] });
          UI.celebrate(ev);
        }
      });
      root._cleanup = run.cleanup;
    }
  });
})();
