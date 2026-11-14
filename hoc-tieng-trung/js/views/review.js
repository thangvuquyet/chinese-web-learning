App.register('review', {
  render(root) {
    const { h, clear } = U;
    const p = Store.P();
    let queue = [], stats = { 1: 0, 2: 0, 3: 0, 4: 0 }, startAt = 0, keyH = null;
    overview();
    return () => { if (keyH) document.removeEventListener('keydown', keyH); };

    function overview() {
      clear(root);
      const due = D.dueCards(p);
      const counts = { new: 0, learning: 0, young: 0, mature: 0 };
      for (const c of Object.values(p.cards)) counts[SRS.bucket(c)]++;
      const total = Object.keys(p.cards).length;
      const soon = Object.values(p.cards).filter(c => c.due > Date.now() && c.due < Date.now() + 86400000).length;
      root.append(
        UI.pageTitle('🃏', 'Ôn thẻ thông minh'),
        h('div.hero', FX.mascot(due.length ? 'think' : 'happy'), h('div.bubble.grow',
          due.length ? h('div', h('b', `${due.length} thẻ`), ' đang chờ ôn. Ôn đúng lúc sắp quên giúp nhớ lâu gấp nhiều lần!') : h('div', total ? 'Hết thẻ đến hạn rồi! Ngày mai quay lại nhé 🎉' : 'Chưa có thẻ nào. Học bài đầu tiên trong Lộ trình để có thẻ ôn nhé!'),
          soon ? h('div.small.muted', `${soon} thẻ sẽ đến hạn trong 24 giờ tới`) : null)),
        h('div.stat-row.mt',
          h('div.stat.jade', h('b', counts.learning), h('span', 'Đang học')),
          h('div.stat.gold', h('b', counts.young), h('span', 'Đang nhớ')),
          h('div.stat.leaf', h('b', counts.mature), h('span', 'Nhớ chắc (≥21 ngày)'))),
        total ? h('div.card.mt', h('div.small', { style: { fontWeight: 600, marginBottom: '6px' } }, `Tổng ${total} từ trong bộ ôn`), h('div.progress', h('i', { style: { width: (total ? counts.mature / total * 100 : 0) + '%' } })), h('div.small.muted', { style: { fontWeight: 500, marginTop: '6px' } }, 'Thanh xanh: tỷ lệ từ đã nhớ chắc')) : null,
        h('div.col.mt',
          due.length ? h('button.btn.block', { onclick: () => start(due) }, `▶️ Bắt đầu ôn ${Math.min(due.length, 150)} thẻ`) : null,
          total >= 4 ? h('button.btn.ghost.block', { onclick: freePractice }, '🎲 Luyện ngẫu nhiên 15 từ đã học') : null,
          !total ? h('button.btn.block', { onclick: () => App.go('path') }, '🗺️ Đến lộ trình') : null),
        h('div.card.tint-indigo.mt', h('div.tip-card', h('span.te', '🧠'), h('div', h('b', 'Cách chấm thẻ'), h('p', '😵 Quên: không nhớ ra · 😅 Khó: nhớ nhưng chật vật · 🙂 Được: nhớ ra bình thường · 😎 Dễ: nhớ ngay lập tức. Hãy trung thực, thuật toán FSRS sẽ tự xếp lịch tối ưu.')))));
    }
    function freePractice() {
      clear(root);
      const ws = U.sample(Object.keys(p.cards).map(id => D.byId[id]).filter(Boolean), 15);
      const qs = Q.mixedQuiz(ws, [], 15, Date.now());
      const run = R.runner(root, {
        questions: qs, onExit: overview, onFinish: res => {
          const xp = 5 + Math.round(res.acc * 10);
          const ev = Store.addXP(xp);
          R.resultScreen(root, res, { xp, buttons: [h('button.btn.block', { onclick: overview }, '← Quay lại')] });
          UI.celebrate(ev);
        }
      });
      root._cleanup = run.cleanup;
    }
    function start(ids) {
      queue = ids.slice(0, 150);
      stats = { 1: 0, 2: 0, 3: 0, 4: 0 };
      startAt = Date.now();
      next();
    }
    function next() {
      if (keyH) { document.removeEventListener('keydown', keyH); keyH = null; }
      if (!queue.length) return done();
      const id = queue[0];
      const w = D.byId[id];
      const card = p.cards[id];
      if (!w || !card) { queue.shift(); return next(); }
      clear(root);
      const reverse = card.reps >= 3 && U.hash(id + card.reps) % 10 < 3;
      const totalLeft = queue.length;
      const flash = h('div.flash');
      const front = h('div.flash-face.front',
        reverse ? [w.emo ? h('div.emo', w.emo) : null, h('div.vi', { style: { fontSize: '26px' } }, w.vi), h('div.small.muted', { style: { fontWeight: 600 } }, 'Chữ Hán là gì? Đọc thế nào?')]
          : [UI.hz(w.hz), UI.audioBtn(w.hz), h('div.small.muted', { style: { fontWeight: 600 } }, 'Nghĩa là gì? Nhớ ra rồi mới lật nhé!')]);
      const ex = D.examplesFor(w, 1)[0];
      const back = h('div.flash-face.back',
        w.emo ? h('div.emo', { style: { fontSize: '34px' } }, w.emo) : null,
        UI.hz(w.hz, w.hz.length > 3 ? 'sm' : 'md'),
        h('div.row', { style: { justifyContent: 'center' } }, h('span.py', w.py), UI.audioBtn(w.hz, { sm: true })),
        w.hv ? h('div.hv', w.hv) : null,
        h('div.vi', w.vi),
        ex ? h('div.small.zh', { style: { fontSize: '17px' } }, ex.text) : null,
        ex ? h('div.small.muted', { style: { fontWeight: 500 } }, ex.vi) : null);
      flash.appendChild(h('div.flash-inner', front, back));
      const reveal = h('button.btn.block.mt', { style: { maxWidth: '460px', margin: '16px auto 0', display: 'flex' }, onclick: flip }, '👀 Hiện đáp án');
      const grades = h('div.grade-row.hidden');
      const pv = SRS.preview(card);
      [[1, '😵 Quên', 'g1'], [2, '😅 Khó', 'g2'], [3, '🙂 Được', 'g3'], [4, '😎 Dễ', 'g4']].forEach(([g, label, cls]) => {
        grades.appendChild(h('button.grade.' + cls, { onclick: () => rate(g) }, label, h('small', U.fmtInterval(pv[g]))));
      });
      root.append(
        h('div.quiz-top', h('button.btn.ghost.icon.sm', { onclick: overview }, '✕'), UI.progress(1 - totalLeft / (totalLeft + stats[1] + stats[2] + stats[3] + stats[4] || 1), 'indigo'), h('span.combo', `${totalLeft} thẻ`)),
        flash, reveal, grades,
        h('p.center.small.muted', { style: { fontWeight: 500 } }, 'Phím tắt: ', h('span.kbd', 'Space'), ' lật · ', h('span.kbd', '1–4'), ' chấm'));
      if (!reverse && Store.settings().autoplay) setTimeout(() => Speech.speak(w.hz), 250);
      let flipped = false;
      function flip() {
        if (flipped) return; flipped = true;
        flash.classList.add('flipped'); FX.sfx.flip();
        reveal.classList.add('hidden'); grades.classList.remove('hidden');
        if (reverse) setTimeout(() => Speech.speak(w.hz), 300);
      }
      function rate(g) {
        if (!flipped) return;
        const now = Date.now();
        p.cards[id] = SRS.grade(card, g, now);
        stats[g]++;
        p.stats.reviews++;
        queue.shift();
        if (p.cards[id].due - now < 20 * 60000) queue.splice(Math.min(queue.length, 3 + Math.floor(Math.random() * 4)), 0, id);
        Store.addXP(1);
        if (g >= 3) FX.sfx.ok(); else FX.sfx.tap();
        next();
      }
      keyH = e => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
        else if (/^[1-4]$/.test(e.key)) rate(+e.key);
      };
      document.addEventListener('keydown', keyH);
    }
    function done() {
      const n = stats[1] + stats[2] + stats[3] + stats[4];
      Store.addMinutes(Math.max(1, Math.round((Date.now() - startAt) / 60000)));
      const ev = Store.addXP(5);
      clear(root);
      R.resultScreen(root, { acc: n ? (stats[3] + stats[4]) / n : 1, secs: Math.round((Date.now() - startAt) / 1000) }, {
        xp: n + 5, title: 'Ôn xong rồi! 🎉', hideStars: true,
        extra: h('div.grid4', [[1, '😵'], [2, '😅'], [3, '🙂'], [4, '😎']].map(([g, e]) => h('div.stat', h('b', e + ' ' + stats[g]), h('span', ['', 'Quên', 'Khó', 'Được', 'Dễ'][g])))),
        buttons: [h('button.btn.block', { onclick: () => App.go('path') }, '🗺️ Học bài mới'), h('button.btn.ghost.block', { onclick: () => App.go('home') }, '🏠 Trang chủ')]
      });
      UI.celebrate(ev);
    }
  }
});
