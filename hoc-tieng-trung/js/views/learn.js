App.register('learn', {
  render(root, params) {
    const { h, clear } = U;
    const p = Store.P();
    let node = D.nodeById[params[0]];
    if (params[0] === 'custom') {
      const ids = D.words.filter(w => w.lv === 0 && !p.cards[w.id]).slice(0, 10).map(w => w.id);
      if (!ids.length) { root.appendChild(UI.empty('Tất cả từ của bạn đã vào bộ ôn rồi! 🎉', 'wow')); return; }
      node = { id: 'custom', type: 'unit', stage: 0, title: 'Từ của tôi', emo: '⭐', words: ids, custom: true };
    }
    if (!node || node.type !== 'unit') { root.appendChild(UI.empty('Không tìm thấy bài học này.')); return; }
    const words = D.nodeWords(node);
    let k = 0;
    showCard();

    function showCard() {
      clear(root);
      const w = words[k];
      const dots = h('div.learn-dots', words.map((_, i) => h('i' + (i < k ? '.done' : i === k ? '.on' : ''))));
      const ex = D.examplesFor(w, 1)[0];
      const tip = w.hvOk && w.chars.length === 1 && w.toneOk ? U.predictTone(w.hvs[0]) : null;
      const card = h('div.learn-card',
        h('div.row', { style: { width: '100%' } }, h('span.pill', `${k + 1}/${words.length}`), h('span.grow'), h('span.pill.info', node.title)),
        w.emo ? h('div.emo', w.emo) : null,
        UI.hz(w.hz),
        h('div.row', { style: { justifyContent: 'center' } }, h('span.py', w.py), UI.audioBtn(w.hz)),
        Store.settings().showHv && w.hv ? h('div.hv', 'Hán Việt: ' + w.hv) : null,
        h('div.vi', w.vi),
        h('span.pos', D.POS[w.pos] || w.pos),
        tip && HSK.toneTip[tip.key] ? h('div.tone-hint', '💡 ' + HSK.toneTip[tip.key]) : null,
        falseFriend(w),
        ex ? UI.exampleBox(ex) : null,
        h('div.row.wrap', { style: { justifyContent: 'center', marginTop: '6px' } },
          h('button.btn.ghost.sm', { onclick: () => UI.writerModal(w.hz) }, '✍️ Cách viết'),
          k > 0 ? h('button.btn.ghost.sm', { onclick: () => { k--; showCard(); } }, '← Trước') : null),
        h('button.btn.block.mt', { onclick: () => { FX.sfx.flip(); if (k < words.length - 1) { k++; showCard(); } else startQuiz(); } }, k < words.length - 1 ? 'Tiếp theo ➜' : '🎯 Bắt đầu luyện tập'));
      root.append(h('div.row', UI.backBtn('path', '✕ Thoát'), h('span.grow')), dots, card);
      if (Store.settings().autoplay) setTimeout(() => Speech.speak(w.hz), 300);
    }
    function falseFriend(w) {
      const f = HSK.falseFriends.find(x => x[0] === w.hz);
      return f ? h('div.tone-hint', { style: { background: 'var(--red-l)', color: 'var(--red-t)' } }, `⚠️ Bẫy Hán Việt: "${f[1]}" nhưng nghĩa là "${f[2]}"`) : null;
    }
    function startQuiz() {
      clear(root);
      const qs = Q.lessonQuiz(words, Date.now());
      const run = R.runner(root, { questions: qs, onFinish: finish, onExit: () => App.go('path') });
      root._cleanup = run.cleanup;
    }
    function finish(res) {
      const st = res.acc >= 0.9 ? 3 : res.acc >= 0.7 ? 2 : 1;
      const prev = node.custom ? { done: true } : (p.nodes[node.id] || {});
      if (!node.custom) p.nodes[node.id] = { done: true, stars: Math.max(prev.stars || 0, st), best: Math.max(prev.best || 0, res.acc), at: Date.now() };
      p.stats.lessons++;
      const d = Store.dayRec(p);
      d.lessons = (d.lessons || 0) + 1;
      if (res.acc === 1) { p.stats.perfect++; d.perfect = (d.perfect || 0) + 1; }
      for (const w of words) {
        const pw = res.perWord[w.id] || { ok: 1, bad: 0 };
        const g = pw.bad === 0 ? 3 : pw.bad === 1 ? 2 : 1;
        if (!p.cards[w.id]) p.cards[w.id] = SRS.introduce(null, g);
        else if (pw.bad) p.cards[w.id] = SRS.grade(p.cards[w.id], 1);
      }
      const xp = 10 + Math.round(res.acc * 10) + (prev.done ? 0 : 5);
      Store.save(true);
      const ev = Store.addXP(xp);
      const nxt = node.custom ? null : D.nextNode(node);
      R.resultScreen(root, res, {
        xp,
        extra: h('div.card.tint-leaf', h('b', `📥 Đã thêm ${words.length} từ vào bộ ôn tập FSRS`), h('div.small.muted', { style: { fontWeight: 500 } }, 'Ngày mai app sẽ nhắc bạn ôn lại đúng lúc sắp quên.')),
        buttons: [
          nxt ? h('button.btn.block', { onclick: () => App.go('path', nxt.id) }, '▶️ Bài tiếp theo: ' + nxt.title) : null,
          h('button.btn.ghost.block', { onclick: () => App.go('learn', node.id) }, '🔁 Học lại bài này'),
          h('button.btn.ghost.block', { onclick: () => App.go('path') }, '🗺️ Về lộ trình')
        ]
      });
      UI.celebrate(ev);
    }
  }
});

App.register('check', {
  render(root, params) {
    const { h, clear } = U;
    const p = Store.P();
    const id = params[0] || '';
    let words, grammars, n, pass, title, node = null, stageKey = null;
    if (id.startsWith('testout-')) {
      stageKey = id.slice(8);
      const st = D.STAGES.find(s => s.key === stageKey);
      if (!st) { root.appendChild(UI.empty('Không tìm thấy bài kiểm tra.')); return; }
      words = D.words.filter(w => st.lvs.includes(w.lv));
      grammars = D.grammar.filter(g => st.lvs.includes(g.lv));
      n = 30; pass = 0.8; title = 'Kiểm tra vượt cấp · ' + st.title;
    } else {
      node = D.nodeById[id];
      if (!node || (node.type !== 'check' && node.type !== 'final')) { root.appendChild(UI.empty('Không tìm thấy bài kiểm tra.')); return; }
      words = D.nodeWords(node); grammars = D.nodeGrammar(node);
      n = node.type === 'final' ? 30 : 20; pass = 0.7; title = node.title;
    }
    intro();
    function intro() {
      clear(root);
      root.appendChild(h('div.card.center.page-enter',
        FX.mascot('think', 'lg'),
        h('h2', title),
        h('p', { style: { fontWeight: 500 } }, `${n} câu trộn từ vựng, nghe, điền câu, sắp xếp câu${grammars.length ? ' và ngữ pháp' : ''}.`),
        h('div.row', { style: { justifyContent: 'center' } }, h('span.pill.info', `Đạt: từ ${Math.round(pass * 100)}%`), h('span.pill', `${words.length} từ`), grammars.length ? h('span.pill', `${grammars.length} điểm ngữ pháp`) : null),
        stageKey ? h('p.small.muted', { style: { fontWeight: 500 } }, 'Qua bài này, cả chặng sẽ được đánh dấu hoàn thành và các từ được đưa vào ôn tập với lịch giãn dài.') : null,
        h('div.col.mt', h('button.btn.block', { onclick: start }, '📝 Bắt đầu'), UI.backBtn('path'))));
    }
    function start() {
      clear(root);
      const qs = Q.mixedQuiz(words, grammars, n, Date.now());
      const run = R.runner(root, { questions: qs, onFinish: finish, onExit: () => App.go('path') });
      root._cleanup = run.cleanup;
    }
    function finish(res) {
      const ok = res.acc >= pass;
      const st = res.acc >= 0.95 ? 3 : res.acc >= 0.85 ? 2 : 1;
      let xp = ok ? (n >= 30 ? 40 : 20) : 5;
      for (const [wid, r] of Object.entries(res.perWord)) {
        if (r.bad && p.cards[wid]) p.cards[wid] = SRS.grade(p.cards[wid], 1);
      }
      if (ok && node) {
        const prev = p.nodes[node.id] || {};
        p.nodes[node.id] = { done: true, stars: Math.max(prev.stars || 0, st), best: Math.max(prev.best || 0, res.acc), at: Date.now() };
      }
      if (ok && stageKey) {
        const stg = D.STAGES.find(s => s.key === stageKey);
        p.testOut[stageKey] = Date.now();
        for (const nd of stg.nodes) if (!D.isDone(p, nd.id)) p.nodes[nd.id] = { done: true, stars: 1, best: res.acc, at: Date.now(), skipped: true };
        let added = 0;
        for (const w of words) if (!p.cards[w.id]) { p.cards[w.id] = SRS.known(); added++; }
        xp += 30;
        FX.toast(`⚡ Đã vượt cấp! Thêm ${added} từ vào ôn tập giãn dài.`);
      }
      p.checks[id] = Math.max(p.checks[id] || 0, res.acc);
      if (ok) { const d = Store.dayRec(p); d.lessons = (d.lessons || 0) + 1; if (res.acc === 1) d.perfect = (d.perfect || 0) + 1; }
      Store.save(true);
      const ev = Store.addXP(xp);
      R.resultScreen(root, res, {
        xp,
        title: ok ? 'Qua bài kiểm tra! 🎉' : 'Chưa đạt, ôn thêm chút nhé!',
        hideStars: !ok,
        extra: h('div.card' + (ok ? '.tint-leaf' : '.tint-jade'), h('b', ok ? `Đạt ${Math.round(res.acc * 100)}% (yêu cầu ${Math.round(pass * 100)}%)` : `Được ${Math.round(res.acc * 100)}%, cần ${Math.round(pass * 100)}% để qua`), h('div.small.muted', { style: { fontWeight: 500 } }, ok ? 'Các từ bạn làm sai đã được đưa vào ôn lại hôm nay.' : 'Ôn lại thẻ từ và xem lại ngữ pháp, rồi thử lại nhé.')),
        buttons: [
          ok && node && D.nextNode(node) ? h('button.btn.block', { onclick: () => App.go('path', D.nextNode(node).id) }, '▶️ Tiếp tục lộ trình') : null,
          !ok ? h('button.btn.block', { onclick: intro }, '🔁 Làm lại') : null,
          h('button.btn.ghost.block', { onclick: () => App.go('review') }, '🃏 Ôn thẻ'),
          h('button.btn.ghost.block', { onclick: () => App.go('path') }, '🗺️ Về lộ trình')
        ]
      });
      UI.celebrate(ev);
    }
  }
});
