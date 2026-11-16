App.register('review', {
  render(root) {
    const { h, clear } = U;
    const p = Store.P();
    let queue = [], stats = { 1: 0, 2: 0, 3: 0, 4: 0 }, startAt = 0, keyH = null, owed = 0;
    overview();
    return () => { if (keyH) document.removeEventListener('keydown', keyH); settle(); };

    function settle() {
      if (!owed) return;
      Store.addMinutes(Math.max(1, Math.round((Date.now() - startAt) / 60000)));
      UI.award(owed);
      owed = 0;
    }

    function overview() {
      if (keyH) { document.removeEventListener('keydown', keyH); keyH = null; }
      settle();
      clear(root);
      const due = D.dueCards(p);
      const counts = { new: 0, learning: 0, young: 0, mature: 0 };
      for (const c of Object.values(p.cards)) counts[SRS.bucket(c)]++;
      const total = Object.keys(p.cards).length;
      const soon = Object.values(p.cards).filter(c => c.due > Date.now() && c.due < Date.now() + 86400000).length;
      const missN = Store.missList(p).length;
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
          missN >= 3 ? h('button.btn.ghost.block', { onclick: mistakes }, `🎯 Luyện ${Math.min(missN, 15)} từ hay làm sai`) : null,
          total >= 4 ? h('button.btn.ghost.block', { onclick: freePractice }, '🎲 Luyện ngẫu nhiên 15 từ đã học') : null,
          !total ? h('button.btn.block', { onclick: () => App.go('path') }, '🗺️ Đến lộ trình') : null),
        h('div.card.tint-indigo.mt', h('div.tip-card', h('span.te', '🧠'), h('div', h('b', 'Cách chấm thẻ'), h('p', '😵 Quên: không nhớ ra · 😅 Khó: nhớ nhưng chật vật · 🙂 Được: nhớ ra bình thường · 😎 Dễ: nhớ ngay lập tức. Hãy trung thực, thuật toán FSRS sẽ tự xếp lịch tối ưu.')))));
    }
    function mistakes() {
      clear(root);
      const ws = Store.missList(p).slice(0, 15).map(id => D.byId[id]);
      const qs = Q.mixedQuiz(ws, [], Math.max(8, Math.min(20, ws.length * 2)), Date.now());
      const run = R.runner(root, {
        questions: qs, onExit: overview, onFinish: res => {
          for (const [wid, r] of Object.entries(res.perWord)) if (r.bad && p.cards[wid]) p.cards[wid] = SRS.grade(p.cards[wid], 1);
          Store.save(true);
          const xp = 6 + Math.round(res.acc * 12);
          Store.addXP(xp);
          const left = Store.missList(p).length;
          R.resultScreen(root, res, { xp, title: res.acc >= 0.9 ? 'Sửa lỗi xong!' : 'Đã luyện lại lỗi sai', extra: h('div.card.tint-leaf', h('b', left ? `Còn ${left} từ trong danh sách hay sai` : 'Danh sách từ hay sai đã trống'), h('div.small.muted', { style: { fontWeight: 500 } }, 'Mỗi lần trả lời đúng ngay, từ đó được gỡ bớt khỏi danh sách.')), buttons: [h('button.btn.block', { onclick: overview }, '← Quay lại')] });
          UI.celebrate();
        }
      });
      root._cleanup = run.cleanup;
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
        h('div.quiz-top', h('button.btn.ghost.icon.sm', { onclick: overview, title: 'Dừng ôn, giữ kết quả các thẻ đã chấm' }, '✕'), UI.progress(1 - totalLeft / (totalLeft + stats[1] + stats[2] + stats[3] + stats[4] || 1), 'indigo'), h('span.combo', `${totalLeft} thẻ`)),
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
        const d = Store.dayRec(p);
        d.reviews = (d.reviews || 0) + 1;
        Store.noteMiss(id, g >= 3);
        queue.shift();
        if (p.cards[id].due - now < 20 * 60000) queue.splice(Math.min(queue.length, 3 + Math.floor(Math.random() * 4)), 0, id);
        owed++;
        Store.save();
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
      if (keyH) { document.removeEventListener('keydown', keyH); keyH = null; }
      const n = stats[1] + stats[2] + stats[3] + stats[4];
      Store.addMinutes(Math.max(1, Math.round((Date.now() - startAt) / 60000)));
      Store.addXP(owed + 5);
      owed = 0;
      clear(root);
      R.resultScreen(root, { acc: n ? (stats[3] + stats[4]) / n : 1, secs: Math.round((Date.now() - startAt) / 1000) }, {
        xp: n + 5, title: 'Ôn xong rồi!', hideStars: true,
        extra: h('div.grid4', [[1, '😵'], [2, '😅'], [3, '🙂'], [4, '😎']].map(([g, e]) => h('div.stat', h('b', e + ' ' + stats[g]), h('span', ['', 'Quên', 'Khó', 'Được', 'Dễ'][g])))),
        buttons: [h('button.btn.block', { onclick: () => App.go('path') }, '🗺️ Học bài mới'), h('button.btn.ghost.block', { onclick: () => App.go('home') }, '🏠 Trang chủ')]
      });
      UI.celebrate(ev);
    }
  }
});
