const PracticeHub = (() => {
  const { h } = U;
  const ic = n => Icon.svg(n);
  const DESC = {
    1: 'Nhìn tranh, nghe 4 câu mô tả, chọn câu đúng. Bẫy: động từ sai, vật có trong tranh nhưng hành động không khớp.',
    2: 'Nghe một câu hỏi và 3 câu đáp. Bẫy: lặp âm, sai loại câu hỏi. Câu trả lời gián tiếp thường là đáp án.',
    3: 'Hội thoại 2–3 người, mỗi bài 3 câu hỏi. Đọc trước câu hỏi, nghe từ khóa.',
    4: 'Bài nói một người: thông báo, tin nhắn thoại, quảng cáo, hướng dẫn. 3 câu mỗi bài.',
    5: 'Điền từ vào câu. Mục tiêu 20 giây mỗi câu: nhìn đáp án trước để biết hỏi từ loại, ngữ pháp hay từ vựng.',
    6: 'Điền từ và câu vào đoạn văn. Đọc cả đoạn, chú ý thì và từ nối giữa các câu.',
    7: 'Đọc hiểu email, quảng cáo, bài báo, tin nhắn, đoạn kép và ba đoạn. Đọc câu hỏi trước, quét tìm thông tin.'
  };
  function partCard(part, p) {
    const r = p.parts[part];
    const acc = r.h.length ? U.avg(r.h) : null;
    const n = Bank.count(part);
    const isL = part <= 4;
    return h('div.card.hover.part-card' + (isL ? '' : '.R'), { onclick: () => App.go('practice', part) },
      h('div.row.between', h('span.pn', 'PART ' + part), acc != null ? h('span.acc.' + UI.accCls(acc), Math.round(acc * 100) + '%') : h('span.pill', 'Chưa làm')),
      h('h3', Bank.PART_NAME[part]),
      h('p.small.muted', DESC[part]),
      h('div.meta', h('span', ic('layers'), ' ' + n + ' câu trong kho'), h('span', ic('activity'), ' ' + r.n + ' câu đã làm')),
      acc != null ? UI.bar(acc, isL ? '' : 'R') : null);
  }
  function hub(root, kind) {
    const p = Store.P();
    const isL = kind === 'listen';
    const parts = isL ? [1, 2, 3, 4] : [5, 6, 7];
    root.appendChild(UI.pageHead(isL ? 'Listening' : 'Reading', isL ? 'Luyện 4 Part nghe với giọng Mỹ, Anh, Úc, Canada. Có chế độ nghe chậm, xem lời, nhại lại và chép chính tả.' : 'Luyện 3 Part đọc có giải thích từng đáp án. Part 5 có đồng hồ 20 giây mỗi câu như khi thi thật.',
      h('div.row.wrap', isL ? h('button.btn.secondary', { onclick: () => App.go('dictation') }, ic('edit'), 'Nghe chép chính tả') : h('button.btn.secondary', { onclick: () => App.go('grammar') }, ic('blocks'), 'Ngữ pháp'), h('button.btn.secondary', { onclick: () => App.go('strat') }, ic('bulb'), 'Chiến thuật'))));
    root.appendChild(h('div.grid.g2.stagger', parts.map(k => partCard(k, p))));
    const tags = Object.entries(p.tags).filter(([t, v]) => v.n >= 4 && Bank.TAGS[t]).map(([t, v]) => ({ t, acc: v.ok / v.n, n: v.n })).filter(x => {
      const pool = isL ? [1, 2, 3, 4] : [5, 6, 7];
      return pool.some(pt => (pt in Bank.singles ? Bank.singles[pt] : Bank.sets[pt].flatMap(s => s.qs)).some(q => q.tag === x.t));
    }).sort((a, b) => a.acc - b.acc).slice(0, 6);
    if (tags.length) {
      root.appendChild(UI.secHead('Dạng câu hay sai', 'Bấm để luyện riêng dạng đó'));
      root.appendChild(h('div.card', h('table.tbl', h('thead', h('tr', h('th', 'Dạng câu'), h('th.r', 'Đã làm'), h('th.r', 'Đúng'), h('th'))), h('tbody', tags.map(x => h('tr', h('td', { style: { fontWeight: 650 } }, Bank.TAGS[x.t]), h('td.r', x.n), h('td.r', h('span.acc.' + UI.accCls(x.acc), Math.round(x.acc * 100) + '%')), h('td.r', h('button.btn.sm.secondary', { onclick: () => practiceTag(x.t) }, 'Luyện'))))))));
    }
  }
  function practiceTag(tag) {
    for (const part of [5, 2, 1, 3, 4, 6, 7]) {
      const pool = part in Bank.singles ? Bank.singles[part] : Bank.sets[part].flatMap(s => s.qs);
      if (pool.some(q => q.tag === tag)) { App.go('practice', part, tag); return; }
    }
  }
  return { hub, partCard };
})();

App.register('listen', { render(root) { PracticeHub.hub(root, 'listen'); } });
App.register('read', { render(root) { PracticeHub.hub(root, 'read'); } });
App.register('train', {
  render(root) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const p = Store.P();
    root.appendChild(UI.pageHead('Luyện tập', 'Chọn kỹ năng muốn luyện hôm nay.'));
    const tiles = [
      ['listen', 'headphones', '', 'Listening', 'Part 1–4, nghe 4 giọng'],
      ['read', 'book', 'R', 'Reading', 'Part 5–7, có đồng hồ'],
      ['speak', 'mic', 'ai', 'Phát âm & Nói', 'AI chấm từng từ'],
      ['dictation', 'edit', 'gold', 'Nghe chép chính tả', 'Luyện tai bắt âm cuối'],
      ['vocab', 'cards', 'meo', 'Từ vựng', D.dueCards(p).length + ' thẻ đến hạn'],
      ['grammar', 'blocks', 'cho', 'Ngữ pháp', 'Chủ điểm Part 5–6'],
      ['mistakes', 'target', 'bad', 'Sổ lỗi sai', Object.keys(p.miss).length + ' câu cần làm lại'],
      ['strat', 'bulb', 'ok', 'Chiến thuật', 'Mẹo theo từng Part']
    ];
    root.appendChild(h('div.grid.g2.stagger', tiles.map(([r, i, tone, t, d]) => h('div.card.hover', { onclick: () => App.go(r) }, h('div.row', h('span.tile-ic.lg' + (tone ? '.' + tone : ''), ic(i)), h('div.grow', h('div', { style: { fontWeight: 750, fontSize: '16px' } }, t), h('div.small.muted', d)), ic('chevron'))))));
  }
});

const SetRunner = (() => {
  const { h } = U;
  const ic = n => Icon.svg(n);
  function run(root, o) {
    UI.focus(true);
    const test = o.test;
    const built = Bank.build(test);
    const groups = built.groups;
    let gi = 0, answers = {}, checked = {}, okN = 0, doneQ = 0, xp = 0, combo = 0, maxCombo = 0;
    const t0 = Date.now();
    const bar = UI.bar(0, 'thick');
    const cnt = h('span.cnt', '0/' + built.n);
    const timerEl = h('span.pill', ic('clock'), '0:00');
    const body = h('div');
    const wrap = h('div.runner', { style: { maxWidth: '1180px' } }, h('div.run-head', h('button.icon-btn.ghost', { onclick: exit, title: 'Thoát' }, ic('x')), bar, cnt, timerEl), body);
    root.appendChild(wrap);
    const foot = h('div.q-foot');
    document.body.appendChild(foot);
    const tick = setInterval(() => { timerEl.lastChild.textContent = U.fmtDur((Date.now() - t0) / 1000); }, 1000);
    let qTimer = null;
    async function exit() {
      if (doneQ && doneQ < built.n && !(await FX.confirm('Dừng luyện tập?', 'Các câu đã kiểm tra vẫn được tính vào thống kê.', 'Dừng', 'Làm tiếp'))) return;
      finish(true);
    }
    function draw() {
      Speech.stop();
      clearInterval(qTimer);
      U.clear(body);
      if (gi >= groups.length) return finish();
      const g = groups[gi];
      const qs = g.nums.map(n => built.qs[n - 1]);
      const st = g.set;
      const isChecked = qs.every(q => checked[q.num]);
      const mode = isChecked ? 'review' : 'practice';
      const content = h('div.page-enter');
      if (!st) {
        const q = qs[0];
        const kids = [h('div.q-kind', q.part <= 4 ? ic('headphones') : ic('book'), 'Part ' + q.part + ' · ' + Bank.PART_NAME[q.part], q.tag && Bank.TAGS[q.tag] && isChecked ? h('span.pill', Bank.TAGS[q.tag]) : null)];
        let pl = null;
        if (q.part === 1) kids.push(Items.p1Visual(q));
        if (q.part === 1 || q.part === 2) {
          pl = Player.create({ lines: Items.linesOf(q), seed: q.id, showText: isChecked, gap: 650, autoplay: !isChecked });
          kids.push(h('div.mt', pl.el));
        }
        if (q.part === 5) {
          const s = h('div.q-sent');
          String(q.q).split(/_{3,}|-{4,}/).forEach((part, i, arr) => { s.appendChild(document.createTextNode(part)); if (i < arr.length - 1) s.appendChild(h('span.gap', answers[q.num] != null ? q.opts[answers[q.num]] : ' ')); });
          kids.push(s);
          if (!isChecked && Store.settings().p5timer) {
            const tb = UI.bar(1, 'thin warn');
            kids.push(h('div.row.mb', { style: { maxWidth: '260px' } }, ic('timer'), h('div.grow', tb), h('span.xs.muted.qt', '20s')));
            const qs0 = Date.now();
            qTimer = setInterval(() => { const left = Math.max(0, 20 - (Date.now() - qs0) / 1000); tb.firstChild.style.width = (left / 20 * 100) + '%'; const lab = content.querySelector('.qt'); if (lab) lab.textContent = Math.ceil(left) + 's'; if (!left) { clearInterval(qTimer); tb.classList.add('bad'); } }, 250);
          }
        }
        kids.push(Items.optList(q, { mode, chosen: answers[q.num], forceText: q.part > 2 || isChecked, showText: q.part > 2 || isChecked, onPick: i => { answers[q.num] = i; if (q.part === 5) { const gp = content.querySelector('.gap'); if (gp) gp.textContent = q.opts[i]; } footState(); } }));
        if (isChecked) kids.push(h('div.qblock.mt', { style: { padding: 0, border: 0 } }, Items.whyBox(q, answers[q.num])));
        content.append(...kids);
        content._pl = pl;
      } else {
        const blanks = st.part === 6 ? Items.blankMap(st, qs, qs.map(q => answers[q.num]), mode, g.nums) : null;
        const left = h('div.s-left', h('div.small.muted.mb', Items.intro(st, g.nums)), Items.stimulus(st, { mode, blanks, autoplay: !isChecked && (st.part === 3 || st.part === 4) }));
        const right = h('div.s-right', qs.map(q => Items.qblock(q, { num: q.num, mode, chosen: answers[q.num], onPick: i => { answers[q.num] = i; if (st.part === 6) redrawBlanks(); footState(); } })));
        content.appendChild(h('div.stimulus', left, right));
        function redrawBlanks() {
          const nb = Items.blankMap(st, qs, qs.map(q => answers[q.num]), mode, g.nums);
          content.querySelectorAll('.blank').forEach(b => { const v = nb[b.dataset.k]; b.textContent = v.value || v.label; b.classList.toggle('filled', !!v.value); });
        }
        content._pl = left.querySelector('.player') ? left.firstChild : null;
      }
      body.appendChild(content);
      body._content = content;
      footState();
    }
    function footState() {
      const g = groups[gi];
      if (!g) return;
      const qs = g.nums.map(n => built.qs[n - 1]);
      const isChecked = qs.every(q => checked[q.num]);
      U.clear(foot);
      foot.className = 'q-foot';
      if (!isChecked) {
        const all = qs.every(q => answers[q.num] != null);
        const b = h('button.btn.lg', { disabled: !all, onclick: check }, 'Kiểm tra');
        foot.appendChild(h('div.q-foot-in', { style: { maxWidth: '1180px' } }, h('span.small.muted', qs.length > 1 ? qs.filter(q => answers[q.num] != null).length + '/' + qs.length + ' câu đã chọn' : ''), h('div.grow'), h('button.btn.ghost', { onclick: () => { qs.forEach(q => { if (answers[q.num] == null) answers[q.num] = -1; }); check(); } }, 'Bỏ qua'), b));
      } else {
        const ok = qs.filter(q => answers[q.num] === q.ans).length;
        foot.className = 'q-foot ' + (ok === qs.length ? 'ok' : 'bad');
        foot.appendChild(h('div.q-foot-in', { style: { maxWidth: '1180px' } },
          h('div.fb', h('div.fi', ic(ok === qs.length ? 'check' : 'x')), h('div.grow', h('b', qs.length > 1 ? 'Đúng ' + ok + '/' + qs.length + ' câu' : ok ? 'Chính xác' : 'Chưa đúng'), h('div.ex', qs.length > 1 ? 'Xem giải thích dưới mỗi câu. Bấm biểu tượng micro trong lời thoại để nhại lại.' : 'Đọc giải thích bên trên.'))),
          h('button.btn.lg' + (ok === qs.length ? '.ok' : '.bad'), { onclick: () => { gi++; draw(); } }, gi + 1 >= groups.length ? 'Xem kết quả' : 'Tiếp tục')));
      }
    }
    function check() {
      const g = groups[gi];
      const qs = g.nums.map(n => built.qs[n - 1]);
      clearInterval(qTimer);
      let allOk = true;
      qs.forEach(q => {
        checked[q.num] = true;
        const ok = answers[q.num] === q.ans;
        if (ok) { okN++; xp += 2; combo++; maxCombo = Math.max(maxCombo, combo); } else { allOk = false; combo = 0; }
        doneQ++;
        Store.record(q.part, ok, q.id, q.tag);
      });
      if (g.set) Store.bump('sets');
      Store.bump('p' + qs[0].part, 1);
      Store.bump('combo', maxCombo, true);
      allOk ? FX.sfx.ok() : FX.sfx.bad();
      if (combo >= 5 && combo % 5 === 0) FX.banner(combo + ' câu liên tiếp', 'Giữ phong độ');
      bar.firstChild.style.width = (doneQ / built.n * 100) + '%';
      cnt.textContent = doneQ + '/' + built.n;
      draw();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function finish(early) {
      clearInterval(tick); clearInterval(qTimer);
      document.removeEventListener('keydown', onKey);
      Speech.stop();
      foot.remove();
      U.clear(body);
      const acc = doneQ ? okN / doneQ : 0;
      if (!early && doneQ) xp += 5;
      Store.save(true);
      const pct = Math.round(acc * 100);
      const parts = U.uniq(built.qs.map(q => q.part));
      const wrongs = built.qs.filter(q => checked[q.num] && answers[q.num] !== q.ans);
      body.appendChild(h('div.col.g16.page-enter', { style: { alignItems: 'center', textAlign: 'center' } },
        Art.mascot(Art.kindOf(Store.P().id), pct >= 80 ? 'happy' : pct >= 50 ? 'think' : 'sad', 'lg'),
        h('h1', { style: { fontSize: '27px' } }, doneQ ? 'Đúng ' + okN + '/' + doneQ + ' câu' : 'Chưa làm câu nào'),
        h('div.muted', parts.map(x => 'Part ' + x).join(', ') + ' · ' + U.fmtDur((Date.now() - t0) / 1000) + (parts.includes(5) && doneQ ? ' · trung bình ' + Math.round((Date.now() - t0) / 1000 / doneQ) + ' giây/câu' : '')),
        doneQ ? UI.ring(acc, { size: 120, stroke: 10, color: pct >= 80 ? 'var(--ok)' : pct >= 60 ? 'var(--warn)' : 'var(--bad)', label: pct + '%', font: 28, animate: true }) : null,
        wrongs.length ? h('div.card', { style: { width: '100%', maxWidth: '680px', textAlign: 'left' } }, h('div.card-h', h('h3', 'Câu sai đã vào Sổ lỗi sai'), h('span.r.pill.bad', wrongs.length)), h('p.small.muted', 'App sẽ ưu tiên cho bạn làm lại các câu này trong mục Sổ lỗi sai.')) : null,
        h('div.row.wrap', { style: { justifyContent: 'center' } },
          o.again ? h('button.btn.secondary.lg', { onclick: o.again }, ic('refresh'), 'Làm lượt mới') : null,
          h('button.btn.lg', { onclick: () => App.go(o.exitTo || 'home') }, 'Xong'))));
      if (xp) setTimeout(() => { UI.award(xp); FX.sfx.done(); if (pct >= 80) FX.confetti({ n: 100 }); }, 300);
    }
    function onKey(e) {
      if (e.target.tagName === 'INPUT') return;
      const g = groups[gi]; if (!g) return;
      const qs = g.nums.map(n => built.qs[n - 1]);
      if (e.key === 'Enter') { e.preventDefault(); const isC = qs.every(q => checked[q.num]); if (isC) { gi++; draw(); } else if (qs.every(q => answers[q.num] != null)) check(); }
      else if (qs.length === 1 && /^[1-4]$/.test(e.key) && !checked[qs[0].num]) { const b = body.querySelectorAll('.opt')[+e.key - 1]; if (b) b.click(); }
    }
    document.addEventListener('keydown', onKey);
    draw();
    return () => { clearInterval(tick); clearInterval(qTimer); document.removeEventListener('keydown', onKey); foot.remove(); UI.focus(false); };
  }
  return { run };
})();

App.register('practice', {
  render(root, params) {
    const part = +params[0] || 5;
    const tag = params[1] || '';
    const n = { 1: 6, 2: 10, 3: 3, 4: 3, 5: 15, 6: 2, 7: 3 }[part];
    let test;
    if (tag) {
      const pool = part in Bank.singles ? Bank.singles[part].filter(q => q.tag === tag) : Bank.sets[part].filter(s => s.qs.some(q => q.tag === tag));
      test = { blocks: U.sample(pool, n).map(it => Bank.inst(it, Math.random)) };
    } else test = Bank.practice(part, n);
    if (!test.blocks.length) return root.appendChild(UI.empty('Kho câu Part ' + part + ' đang trống.'));
    return SetRunner.run(root, { test, exitTo: part <= 4 ? 'listen' : 'read', again: () => App.go('practice', part, tag) });
  }
});

App.register('mistakes', {
  render(root) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const p = Store.P();
    const ids = Object.entries(p.miss).filter(([id]) => Bank.get(id)).sort((a, b) => b[1].n - a[1].n || b[1].at - a[1].at).map(x => x[0]);
    root.appendChild(UI.pageHead('Sổ lỗi sai', 'Mọi câu bạn làm sai đều được lưu ở đây. Làm lại đúng sẽ tự gạch khỏi sổ.', ids.length ? h('button.btn', { onclick: () => App.go('redo', 'all') }, ic('play'), 'Làm lại ' + Math.min(12, ids.length) + ' câu') : null));
    if (!ids.length) return root.appendChild(h('div.card', UI.empty('Chưa có câu sai nào. Làm bài luyện hoặc đề thi thử, câu sai sẽ hiện ở đây.', 'happy')));
    const byPart = {};
    ids.forEach(id => { const q = Bank.get(id); (byPart[q.part] = byPart[q.part] || []).push(id); });
    root.appendChild(h('div.grid.g4.mb', Object.keys(Bank.PART_NAME).map(k => h('div.stat-tile', h('div.stat', h('div.v', (byPart[k] || []).length), h('div.k', 'Part ' + k + ' · ' + Bank.PART_NAME[k]))))));
    root.appendChild(h('div.card', h('div.list', ids.slice(0, 80).map(id => {
      const q = Bank.get(id);
      const label = q.part === 1 ? 'Mô tả tranh' : q.part === 2 ? q.q : q.part === 5 ? q.q : (q.q || 'Điền vào chỗ trống');
      return h('div.li', h('span.pill.' + (q.part <= 4 ? 'L' : 'R'), 'P' + q.part), h('div.grow', h('div.t', { style: { fontWeight: 600 } }, label), h('div.d', 'Sai ' + p.miss[id].n + ' lần · ' + U.ago(p.miss[id].at) + (q.tag && Bank.TAGS[q.tag] ? ' · ' + Bank.TAGS[q.tag] : ''))), h('button.btn.sm.secondary', { onclick: () => App.go('redo', id) }, 'Làm lại'));
    }))));
  }
});

App.register('redo', {
  render(root, params) {
    const p = Store.P();
    const ids = params[0] === 'all' ? Object.entries(p.miss).filter(([id]) => Bank.get(id)).sort((a, b) => b[1].n - a[1].n || b[1].at - a[1].at).map(x => x[0]).slice(0, 12) : [params[0]];
    const test = Bank.fromIds(ids);
    if (!test.blocks.length) return root.appendChild(UI.empty('Không còn câu nào để làm lại.', 'happy'));
    return SetRunner.run(root, { test, exitTo: 'mistakes', again: params[0] === 'all' ? () => App.go('redo', 'all') : null });
  }
});
