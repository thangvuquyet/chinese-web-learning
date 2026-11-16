App.register('home', {
  render(root) {
    const { h } = U;
    const p = Store.P();
    const hr = new Date().getHours();
    const greet = hr < 11 ? ['早上好！', 'Chào buổi sáng'] : hr < 14 ? ['中午好！', 'Chào buổi trưa'] : hr < 18 ? ['下午好！', 'Chào buổi chiều'] : ['晚上好！', 'Chào buổi tối'];
    const due = D.dueCards(p).length;
    const cur = D.currentNode(p);
    const sv = Store.streakView(p);
    const today = Store.todayXP(p);
    const msgs = [
      'Mỗi ngày một chút, HSK4 sẽ tới thôi!',
      sv.today ? `Giữ lửa ${sv.n} ngày rồi, tuyệt quá!` : 'Học 5 phút thôi là giữ được chuỗi lửa 🔥',
      due ? `Có ${due} thẻ đang chờ bạn ôn nè!` : 'Thẻ ôn đã sạch bong, học bài mới nhé!',
      'Mỗi ngày một chút, rồi sẽ tới HSK4. 加油！'
    ];
    const hero = h('div.hero',
      FX.mascot(sv.today ? 'happy' : 'think'),
      h('div.bubble.grow', h('div.zh', greet[0]), h('div', `${greet[1]}, ${p.name}! ${U.pick(msgs)}`)));
    root.appendChild(hero);

    const goalPct = today / p.goal;
    root.appendChild(h('div.card.mt',
      h('div.row.between', h('b', '🎯 Mục tiêu hôm nay'), h('span.small.muted', { style: { fontWeight: 600 } }, `${today} / ${p.goal} XP`)),
      h('div.mt', UI.progress(goalPct, goalPct >= 1 ? '' : 'jade')),
      h('div.row.wrap.mt.small.meta', { style: { color: 'var(--ink2)', gap: '6px 16px' } },
        h('span', `🔥 Chuỗi: ${sv.n} ngày`), h('span', `❄️ Đóng băng: ${p.streak.freeze}`), h('span', `🏅 Cao nhất: ${p.streak.best}`))));

    const QI = { goal: 'target', rev20: 'cards', lesson: 'route', speak5: 'mic', ok30: 'star', combo8: 'flame', perfect: 'trophy', listen: 'volume' };
    const qs = Store.quests(p);
    const qDone = qs.filter(q => q.done).length;
    root.appendChild(h('div.card.mt',
      h('div.row.between.mb', h('b', 'Nhiệm vụ hôm nay'), h('span.small.muted', { style: { fontWeight: 600 } }, `${qDone}/${qs.length} · mỗi nhiệm vụ +${qs[0] ? qs[0].xp : 10} XP`)),
      h('div.quests', qs.map(q => h('div.quest' + (q.done ? '.done' : ''),
        h('span.qi', Icon.svg(q.done ? 'check' : QI[q.id] || 'star')),
        h('div.qb', h('b', q.t), UI.progress(q.v / q.target, q.done ? '' : 'gold')),
        h('span.qv', q.done ? 'Xong' : `${q.v}/${q.target}`))))));
    Store.save();

    const examDate = Store.settings().examDate;
    if (examDate) {
      const left = U.daysBetween(U.dayKey(), examDate);
      if (left >= 0) root.appendChild(h('div.card.tint-gold.mt', { style: { background: 'linear-gradient(135deg,#fff,#F8F0DC)' } }, h('div.row', h('span', { style: { fontSize: '34px' } }, '⏳'), h('div.grow', h('b', left === 0 ? 'Hôm nay là ngày thi! Bình tĩnh, tự tin nhé!' : `Còn ${left} ngày nữa là thi`), h('div.small.muted', { style: { fontWeight: 500 } }, 'Ngày thi: ' + examDate.split('-').reverse().join('/'))))));
    }

    root.appendChild(h('div.sec-title', '✨ Hôm nay học gì?'));
    const acts = h('div.col');
    acts.append(
      h('button.action', { onclick: () => App.go('review') },
        h('span.ai.sky', '🃏'), h('div', h('b', 'Ôn thẻ từ vựng'), h('span.sub', due ? 'Ôn đúng lúc sắp quên để nhớ lâu' : 'Không có thẻ đến hạn')),
        due ? h('span.cnt', due) : h('span.pill.ok', 'Xong ✓')),
      cur ? h('button.action', { onclick: () => App.go('path', cur.id) },
        h('span.ai.jade', cur.emo || '📘'), h('div', h('b', 'Học tiếp: ' + cur.title), h('span.sub', nodeSub(cur))), h('span.go', Icon.svg('chevron'))) : null,
      h('button.action', { onclick: () => App.go('drill', 'listen3') },
        h('span.ai.leaf', '🎧'), h('div', h('b', 'Thử thách nghe 5 phút'), h('span.sub', '8 đoạn hội thoại HSK3, chấm ngay'))),
      h('button.action', { onclick: () => App.go('speak') },
        h('span.ai.clay', '🎤'), h('div', h('b', 'Luyện nói & shadowing'), h('span.sub', 'App chấm từng âm và thanh điệu'))),
      h('button.action', { onclick: () => App.go('exams') },
        h('span.ai.indigo', '📝'), h('div', h('b', 'Thi thử HSK 3.0'), h('span.sub', '20 đề HSK3 + 20 đề HSK4, câu hỏi đổi mỗi lần'))));
    root.appendChild(acts);

    const tip = HSK.tips[U.hash(U.dayKey()) % HSK.tips.length];
    root.appendChild(h('div.sec-title', '💡 Mẹo học hôm nay'));
    root.appendChild(h('div.card.tint-clay', h('div.tip-card', h('span.te', tip[0]), h('div', h('b', tip[1]), h('p', tip[2])))));

    const learned = Object.keys(p.cards).length;
    const best3 = Math.max(0, ...p.exams.filter(e => e.level === 3).map(e => e.total));
    const best4 = Math.max(0, ...p.exams.filter(e => e.level === 4).map(e => e.total));
    root.appendChild(h('div.stat-row.mt2',
      h('div.stat.jade', h('b', learned), h('span', 'Từ đã học')),
      h('div.stat.indigo', h('b', Object.keys(p.grammar).length), h('span', 'Điểm ngữ pháp')),
      h('div.stat.leaf', h('b', best4 ? best4 : best3 || '–'), h('span', best4 ? 'Điểm HSK4 cao nhất' : 'Điểm HSK3 cao nhất'))));

    function nodeSub(n) {
      if (n.type === 'unit') return `${n.words.length} từ mới · ~8 phút`;
      if (n.type === 'grammar') return 'Ngữ pháp · giải thích + bài tập';
      if (n.type === 'check') return 'Bài kiểm tra nhỏ · 20 câu';
      return 'Bài thi cuối chặng · 30 câu';
    }
  }
});
