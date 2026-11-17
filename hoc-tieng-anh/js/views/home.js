const Plan = (() => {
  function today(p) {
    const d = Store.dayRec(p);
    const due = D.dueCards(p).length;
    if (d.due0 == null) d.due0 = due;
    const gaps = Score.gaps(p).filter(g => g.part !== 1);
    const weak = gaps[0];
    const nextT = D.nextTopic(p);
    const nextG = (typeof GRAMMAR !== 'undefined' ? GRAMMAR : []).find(g => !p.grammar[g.id]);
    const dow = new Date().getDay();
    const items = [];
    if (d.due0 > 0) items.push({ id: 'rev', icon: 'repeat', tone: '', t: 'Ôn từ đến hạn', d: Math.min(d.due0, 40) + ' thẻ · thời điểm vàng để nhớ lâu', min: Math.ceil(Math.min(d.due0, 40) / 6), done: (d.reviews || 0) >= Math.min(d.due0, 20), go: () => App.go('review') });
    items.push({ id: 'new', icon: 'sparkle', tone: 'gold', t: 'Học 8 từ mới', d: nextT ? nextT.t : 'Từ vựng TOEIC', min: 8, done: (d.lessons || 0) >= 1, go: () => App.go('learn', nextT.id) });
    if (weak) {
      const isL = weak.part <= 4;
      const n = weak.part === 5 ? 15 : weak.part === 2 ? 10 : 3;
      items.push({ id: 'weak', icon: isL ? 'headphones' : 'book', tone: isL ? '' : 'R', t: 'Luyện Part ' + weak.part + ' · ' + Bank.PART_NAME[weak.part], d: weak.n < 10 ? 'Chưa có nhiều dữ liệu, làm để app hiểu bạn hơn' : 'Đang đúng ' + Math.round(weak.acc * 100) + '%, cần ' + Math.round(weak.need * 100) + '%', min: weak.part === 5 ? 6 : 8, done: (d['p' + weak.part] || 0) >= 1, go: () => App.go('practice', weak.part) });
    }
    if (nextG) items.push({ id: 'gram', icon: 'blocks', tone: 'R', t: 'Ngữ pháp: ' + nextG.t, d: 'Bài giảng ngắn + ' + (nextG.quiz || []).length + ' câu Part 5', min: 7, done: (d.gram || 0) >= 1, go: () => App.go('gram', nextG.id) });
    if (Pron.enabled()) items.push({ id: 'speak', icon: 'mic', tone: 'ai', t: 'Phát âm cùng AI', d: 'Đọc 5 câu, đạt từ 80 điểm', min: 5, done: (d.speakOk || 0) >= 5, go: () => App.go('speak') });
    if ((dow === 6 || dow === 0) && !p.tests.some(t => U.dayKey(new Date(t.at)) === U.dayKey())) items.push({ id: 'test', icon: 'exam', tone: 'dark', t: 'Đề rút gọn cuối tuần', d: 'Khoảng 90 câu · đo tiến bộ cả tuần', min: 75, done: false, go: () => App.go('tests') });
    return items;
  }
  return { today };
})();

App.register('home', {
  render(root) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const p = Store.P();
    const pr = Score.track(p);
    const target = p.target;
    const plan = Plan.today(p);
    const doneN = plan.filter(x => x.done).length;
    const next = plan.find(x => !x.done);
    const days = p.examDate ? U.daysBetween(U.dayKey(), p.examDate) : null;
    const hasPred = pr && pr.hasData;
    const T = hasPred ? pr.T : null;

    const pos = v => ((v - 10) / 980 * 100) + '%';
    const track = h('div.target-track',
      h('div.zone', { style: { left: pos(800), width: (100 / 980 * 100) + '%' } }),
      h('div.fill', { style: { width: '0%' } }),
      [10, 250, 500, 750, 990].map(v => h('span.tick', { style: { left: pos(v) } }, v)),
      h('span.tick', { style: { left: pos(850), top: '-22px', color: 'var(--lime)', fontWeight: 700 } }, 'Mục tiêu ' + target));
    if (hasPred) setTimeout(() => { track.querySelector('.fill').style.width = pos(T); }, 150);
    const hist = Object.entries(p.predHist || {}).sort().map(x => x[1]);
    const scoreEl = h('div.score-big', hasPred ? '0' : '—');
    const hero = h('div.hero',
      h('div.row.top.between',
        h('div',
          h('div.eyebrow', { style: { color: '#AEB7DD' } }, hasPred ? 'Điểm TOEIC dự đoán' : 'Bắt đầu từ đây'),
          hasPred ? h('div.row', { style: { alignItems: 'baseline', marginTop: '6px', gap: '4px' } }, scoreEl, h('small', { style: { color: '#9AA4CF', fontWeight: 600 } }, '± ' + pr.spread))
            : h('h2', { style: { fontSize: '26px', fontWeight: 800, marginTop: '8px', maxWidth: '460px', lineHeight: 1.25 } }, 'Làm bài kiểm tra đầu vào 25 phút để app dự đoán điểm và xếp lộ trình cho ' + p.name),
          hasPred ? h('div.row.wrap.mt8', h('span.band', { style: { '--c': Score.band(T).color } }, h('i'), Score.band(T).vi), hist.length > 2 ? UI.sparkline(hist.slice(-20), { w: 110, h: 26 }) : null) : null),
        h('div', { style: { marginRight: '-6px', marginTop: '-6px' } }, Art.mascot(Art.kindOf(p.id), hasPred && T >= target ? 'wow' : 'happy', 'sm'))),
      hasPred ? h('div.lr',
        h('div', h('div.k', h('span', 'Listening'), h('b', pr.L + ' / 495')), UI.bar(pr.L / 495, 'dark')),
        h('div', h('div.k', h('span', 'Reading'), h('b', pr.R + ' / 495')), UI.bar(pr.R / 495, 'dark R'))) : null,
      hasPred ? track : null,
      h('div.hero-cta',
        hasPred && next ? h('button.btn.white.lg', { onclick: next.go }, ic('play'), 'Học tiếp: ' + next.t) : null,
        !hasPred ? h('button.btn.lime.lg', { onclick: () => App.go('exam', 'placement') }, ic('target'), 'Làm bài đầu vào') : null,
        !hasPred ? h('button.btn.white.lg', { onclick: () => App.go('learn', D.nextTopic(p).id) }, 'Học từ vựng trước') : h('button.btn.lg', { style: { background: 'rgba(255,255,255,.1)', boxShadow: 'none' }, onclick: () => App.go('tests') }, ic('exam'), 'Thi thử')));
    if (hasPred) FX.countUp(scoreEl, T, { dur: 1100, delay: 150 });

    const planCard = h('div.card',
      h('div.card-h', h('h3', 'Kế hoạch hôm nay'), h('span.pill' + (doneN === plan.length ? '.ok' : ''), doneN + '/' + plan.length), h('span.r.small.muted', 'Khoảng ' + U.sum(plan.filter(x => !x.done).map(x => x.min)) + ' phút')),
      h('div', plan.map(it => h('button.plan-item' + (it.done ? '.done' : ''), { onclick: it.go },
        h('span.tile-ic' + (it.tone ? '.' + it.tone : ''), ic(it.icon)),
        h('div.grow', h('div.t', it.t), h('div.d', it.d)),
        h('span.small.muted.nowrap', it.min + ' ph'),
        h('span.chk', it.done ? ic('check') : null)))));

    const gaps = Score.gaps(p).sort((a, b) => a.part - b.part);
    const partsCard = h('div.card',
      h('div.card-h', h('h3', 'Độ chính xác theo Part'), h('span.r.small.muted', 'Vạch đen: mức cần cho ' + target)),
      h('div', gaps.map(g => h('button.li', { onclick: () => App.go('practice', g.part) },
        h('span.pill.' + (g.part <= 4 ? 'L' : 'R'), 'P' + g.part),
        h('div.grow', h('div.row.between', h('span.small', { style: { fontWeight: 650 } }, Bank.PART_NAME[g.part]), h('span.acc.small.' + UI.accCls(g.acc), g.n ? Math.round(g.acc * 100) + '%' : '—')),
          (() => { const b = UI.bar(g.n ? g.acc : 0, g.part <= 4 ? '' : 'R'); b.appendChild(h('span.mark', { style: { left: (g.need * 100) + '%' } })); return h('div.mt4', b); })()),
        ic('chevron', 'chev')))));

    const quests = Store.quests(p);
    const questCard = h('div.card',
      h('div.card-h', h('h3', 'Nhiệm vụ hôm nay'), h('span.r.pill.gold', '+10 XP mỗi nhiệm vụ')),
      quests.map(q => h('div.quest' + (q.done ? '.done' : ''), h('span.q-ic', ic(q.done ? 'check' : q.id === 'goal' ? 'target' : 'bolt')), h('div.grow', h('div.row.between', h('span.t', q.t), h('span.n', q.v + '/' + q.target)), UI.bar(q.v / q.target, q.done ? 'ok' : 'gold')))));

    const sv = Store.streakView(p);
    const streakCard = h('div.card',
      h('div.card-h', h('span.tile-ic.sm.warn', ic('flame')), h('div', h('h3', sv.n + ' ngày liên tiếp'), h('div.small.muted', sv.today ? 'Hôm nay đã giữ chuỗi' : 'Học một bài để giữ chuỗi')), h('span.r.pill', { title: 'Thẻ đóng băng giữ chuỗi khi lỡ một ngày' }, ic('snow'), p.streak.freeze)),
      UI.weekRow(p));

    const oid = Store.otherId(p.id);
    const pv = Store.view(oid);
    const pToday = (pv.days && pv.days[U.dayKey()]) || 0;
    const inbox = Store.inbox(p.id).filter(n => !n.read);
    const partnerCard = h('div.card',
      h('div.card-h', Art.avatar(oid, 'md', { ring: true, dot: pToday > 0 }), h('div', h('h3', pv.name), h('div.small.muted', pv.src === 'empty' ? 'Chưa có tiến độ' : pv.src === 'snap' ? 'Cập nhật ' + U.ago(pv.at) : 'Cùng máy này')), h('button.r.icon-btn.sm', { onclick: () => App.go('couple'), title: 'Mở Đôi ta' }, ic('chevron'))),
      pv.src === 'empty' ? h('p.small.muted', 'Khi ' + pv.name + ' học trên máy khác, nhờ ' + pv.name + ' gửi mã tiến độ trong mục Đôi ta để hai người so tiến độ.')
        : h('div.grid.g3', { style: { gap: '8px' } },
          h('div.stat', h('div.v', { style: { fontSize: '20px' } }, pToday), h('div.k', 'XP hôm nay')),
          h('div.stat', h('div.v', { style: { fontSize: '20px' } }, (pv.streak && pv.streak.n) || 0), h('div.k', 'Ngày liên tiếp')),
          h('div.stat', h('div.v', { style: { fontSize: '20px' } }, pv.pred && pv.pred.T ? pv.pred.T : '—'), h('div.k', 'Dự đoán'))),
      inbox.length ? h('div.note.unread.mt', Art.avatar(oid, 'xs'), h('div.grow', h('div', inbox[0].text), h('div.meta', U.ago(inbox[0].at)))) : null,
      h('div.row.mt', h('button.btn.secondary.sm.grow', { onclick: () => App.go('couple') }, ic('send'), 'Nhắn động viên'), h('button.btn.ghost.sm', { onclick: () => App.go('couple') }, ic('swap'), 'So tiến độ')));
    if (inbox.length) { inbox.forEach(n => n.read = true); Store.save(); }

    const head = h('div.page-head',
      h('div', h('div.eyebrow', new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })), h('h1', U.greet() + ', ' + p.name)),
      days != null && days >= 0 ? h('span.pill.lg.dark', ic('calendar'), days === 0 ? 'Hôm nay thi' : 'Còn ' + days + ' ngày tới ngày thi') : null);
    root.appendChild(head);
    root.appendChild(h('div.layout',
      h('div.col.g16.stagger', hero, planCard, partsCard),
      h('div.aside.stagger', questCard, streakCard, partnerCard)));
    setTimeout(() => UI.celebrate(), 300);
  }
});
