const UI = (() => {
  const { h, clear } = U;
  const ic = (n, cls) => Icon.svg(n, cls);

  function accentCast(acc) {
    const list = Speech.enVoices();
    const m = list.find(x => x.accent === acc) || (acc === 'UK' ? list.find(x => x.accent === 'AU') : null);
    return m ? { v: m.v, pitch: 1 } : null;
  }
  function audioBtn(text, opts = {}) {
    const b = h('button.audio' + (opts.size ? '.' + opts.size : ''), { type: 'button', 'aria-label': 'Nghe', title: opts.title || 'Nghe' }, ic('volume'));
    b.addEventListener('click', async e => {
      e.stopPropagation();
      if (b.classList.contains('playing')) { Speech.stop(); b.classList.remove('playing'); return; }
      U.$$('.audio.playing,.audio-acc.playing').forEach(x => x.classList.remove('playing'));
      b.classList.add('playing');
      const t = typeof text === 'function' ? text() : text;
      if (Array.isArray(t)) await Speech.speakLines(t, { rate: opts.rate });
      else await Speech.speak(t, { rate: opts.rate, cast: opts.accent ? accentCast(opts.accent) : null });
      b.classList.remove('playing');
      opts.onPlayed && opts.onPlayed();
    });
    return b;
  }
  function accentBtns(text) {
    const mk = (acc, label) => {
      const b = h('button.audio-acc', { type: 'button', title: 'Giọng ' + label }, ic('volume'), acc);
      b.addEventListener('click', async e => {
        e.stopPropagation();
        U.$$('.audio-acc.playing,.audio.playing').forEach(x => x.classList.remove('playing'));
        b.classList.add('playing');
        await Speech.speak(text, { cast: accentCast(acc) });
        b.classList.remove('playing');
      });
      return b;
    };
    return h('span.row.g6', mk('US', 'Mỹ'), mk('UK', 'Anh'));
  }
  function ring(pct, o = {}) {
    const size = o.size || 44, sw = o.stroke || 5;
    const r = (size - sw) / 2, c = 2 * Math.PI * r;
    const el = h('div.ring', { style: { width: size + 'px', height: size + 'px' } });
    el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${o.track || '#E8EBF2'}" stroke-width="${sw}" fill="none"/><circle class="rf" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${o.color || 'var(--brand)'}" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${o.animate ? c : c * (1 - U.clamp(pct, 0, 1))}"/></svg>`;
    el.appendChild(h('div.rv', { style: { fontSize: (o.font || Math.round(size * .26)) + 'px', color: o.textColor || 'inherit' } }, o.label != null ? o.label : ''));
    if (o.animate) requestAnimationFrame(() => setTimeout(() => { el.querySelector('.rf').style.strokeDashoffset = c * (1 - U.clamp(pct, 0, 1)); }, 60));
    return el;
  }
  function bar(pct, cls = '') { return h('div.bar' + (cls ? '.' + cls.split(' ').join('.') : ''), h('i', { style: { width: Math.round(U.clamp(pct, 0, 1) * 1000) / 10 + '%' } })); }
  const accCls = a => a >= .85 ? 'hi' : a >= .65 ? 'mid' : 'lo';

  const NAV = [
    [null, [['home', 'home', 'Hôm nay'], ['path', 'route', 'Lộ trình 900']]],
    ['Học', [['vocab', 'cards', 'Từ vựng'], ['grammar', 'blocks', 'Ngữ pháp']]],
    ['Luyện', [['listen', 'headphones', 'Listening'], ['read', 'book', 'Reading'], ['speak', 'mic', 'Phát âm & Nói'], ['mistakes', 'target', 'Sổ lỗi sai']]],
    ['Thi', [['tests', 'exam', 'Thi thử']]],
    ['Đôi ta', [['couple', 'users', 'Mèo & Chó'], ['stats', 'chart', 'Thống kê']]],
    [null, [['settings', 'sliders', 'Cài đặt']]]
  ];
  const ACTIVE = { home: 'home', path: 'path', vocab: 'vocab', topic: 'vocab', learn: 'vocab', review: 'vocab', words: 'vocab', grammar: 'grammar', gram: 'grammar', listen: 'listen', dictation: 'listen', read: 'read', speak: 'speak', mistakes: 'mistakes', redo: 'mistakes', practice: 'listen', tests: 'tests', exam: 'tests', result: 'tests', couple: 'couple', stats: 'stats', settings: 'settings', train: 'listen', strat: 'path', unitcheck: 'path' };
  const TABS = [['home', 'home', 'Hôm nay'], ['path', 'route', 'Lộ trình'], ['train', 'zap', 'Luyện'], ['tests', 'exam', 'Thi thử'], ['couple', 'users', 'Đôi ta']];
  const TAB_ACTIVE = { home: 'home', path: 'path', vocab: 'path', topic: 'path', learn: 'path', review: 'path', grammar: 'path', gram: 'path', strat: 'path', words: 'path', train: 'train', listen: 'train', read: 'train', speak: 'train', dictation: 'train', mistakes: 'train', redo: 'train', practice: 'train', tests: 'tests', exam: 'tests', result: 'tests', couple: 'couple', stats: 'couple', unitcheck: 'path' };

  function side(route) {
    const nav = document.getElementById('side');
    clear(nav);
    const p = Store.P(); if (!p) return;
    const active = ACTIVE[route] || route;
    const m = Store.member(p.id);
    const due = D.dueCards(p).length;
    const missN = Object.keys(p.miss).length;
    const pid = Store.otherId(p.id);
    const pv = Store.view(pid);
    const pToday = pv.days && pv.days[U.dayKey()] || 0;
    const inner = h('div.side-in',
      h('div.side-brand', Art.brandMark(36), h('div.side-hide', h('b', 'Pawlish'), h('small', 'TOEIC 800–900 · Mèo & Chó'))),
      h('button.side-who', { onclick: switcher, title: 'Đổi người học' }, Art.avatar(p.id, 'md'), h('div.grow.side-hide', h('div.nm', p.name), h('div.sub', 'Mục tiêu ' + p.target + '+')), h('span.side-hide', ic('swap'))));
    NAV.forEach(([label, items]) => {
      if (label) inner.appendChild(h('div.side-group-l', label));
      items.forEach(([id, icon, text]) => {
        const badge = id === 'vocab' && due ? h('span.badge', due > 99 ? '99+' : due) : id === 'mistakes' && missN ? h('span.badge', missN > 99 ? '99+' : missN) : id === 'speak' ? h('span.ai-chip.side-hide', 'AI') : null;
        inner.appendChild(h('button.side-link' + (active === id ? '.active' : ''), { onclick: () => App.go(id), title: text }, ic(icon), h('span.side-hide', text), badge));
      });
    });
    inner.appendChild(h('div.side-foot',
      h('button.side-partner', { onclick: () => App.go('couple'), title: pv.name }, Art.avatar(pid, 'sm', { dot: pToday > 0 }), h('div.grow.side-hide', h('div', { style: { fontWeight: 650, fontSize: '13.5px' } }, pv.name), h('div.sub', pv.src === 'empty' ? 'Chưa có dữ liệu' : pToday ? 'Hôm nay ' + pToday + ' XP' : 'Hôm nay chưa học'))),
      h('button.side-toggle', { onclick: toggleNav, title: Store.settings().navMini ? 'Mở rộng' : 'Thu gọn' }, ic(Store.settings().navMini ? 'panelOpen' : 'panelClose'), h('span.side-hide', 'Thu gọn menu'))));
    nav.appendChild(inner);
  }
  function toggleNav() {
    const s = Store.settings();
    s.navMini = !s.navMini;
    Store.save(true);
    document.body.classList.toggle('nav-mini', s.navMini);
    side(App.current ? App.current.name : 'home');
  }
  function topbar(title, crumb) {
    const bar = document.getElementById('topbar');
    clear(bar);
    const p = Store.P(); if (!p) return;
    const sv = Store.streakView(p);
    const g = Store.todayXP(p) / p.goal;
    bar.append(
      h('div.tb-title', Art.brandMark(30), h('h1', title || 'Pawlish'), crumb ? h('span.crumb', crumb) : null),
      h('div.tb-right',
        h('span.tb-chip.flame' + (sv.today ? '' : '.off'), { title: sv.today ? 'Chuỗi ngày học' : 'Học hôm nay để giữ chuỗi' }, ic('flame'), sv.n),
        h('span.tb-chip.xp', { title: 'Tổng XP' }, ic('star'), p.xp.toLocaleString('vi-VN')),
        h('span.tb-chip.goal', { title: `Mục tiêu hôm nay: ${Store.todayXP(p)}/${p.goal} XP` }, ring(g, { size: 28, stroke: 4, color: g >= 1 ? 'var(--ok)' : 'var(--brand)', label: '' }), h('span', Math.min(100, Math.round(g * 100)) + '%')),
        h('button.tb-me', { onclick: meMenu, title: 'Tài khoản' }, Art.avatar(p.id, 'sm', { ring: true }))));
  }
  function tabbar(route) {
    const nav = document.getElementById('tabbar');
    clear(nav);
    const p = Store.P(); if (!p) return;
    const act = TAB_ACTIVE[route] || '';
    const due = D.dueCards(p).length;
    TABS.forEach(([id, icon, label]) => nav.appendChild(h('button.tab' + (act === id ? '.active' : ''), { onclick: () => App.go(id) }, h('span.ti', ic(icon)), label, id === 'path' && due ? h('span.dotn', due > 99 ? '99+' : due) : null)));
  }
  function meMenu() {
    const p = Store.P();
    FX.modal(close => h('div',
      h('div.row', Art.avatar(p.id, 'lg', { ring: true }), h('div', h('h2', { style: { margin: 0 } }, p.name), h('div.muted.small', 'Cấp ' + Store.levelOf(p.xp) + ' · ' + p.xp.toLocaleString('vi-VN') + ' XP · mục tiêu ' + p.target))),
      h('div.list.mt',
        h('button.li', { onclick: () => { close(); switcher(); } }, h('span.tile-ic.sm', ic('swap')), h('div.grow', h('div.t', 'Đổi người học'), h('div.d', 'Chuyển sang ' + Store.get(Store.otherId()).name)), ic('chevron', 'chev')),
        h('button.li', { onclick: () => { close(); App.go('stats'); } }, h('span.tile-ic.sm', ic('chart')), h('div.grow', h('div.t', 'Thống kê')), ic('chevron', 'chev')),
        h('button.li', { onclick: () => { close(); App.go('mistakes'); } }, h('span.tile-ic.sm', ic('target')), h('div.grow', h('div.t', 'Sổ lỗi sai')), ic('chevron', 'chev')),
        h('button.li', { onclick: () => { close(); App.go('settings'); } }, h('span.tile-ic.sm', ic('sliders')), h('div.grow', h('div.t', 'Cài đặt')), ic('chevron', 'chev')))));
  }
  function switcher() {
    FX.modal(close => h('div',
      h('h2', 'Ai đang học?'),
      h('p.muted', 'Mỗi người có tiến độ, lộ trình và điểm dự đoán riêng.'),
      h('div.pick-grid.mt', Store.IDS.map(id => {
        const p = Store.get(id), m = Store.member(id);
        return h('button.prof-card' + (Store.db.active === id ? '.on' : ''), { style: { '--c': m.color, '--cs': m.soft }, onclick: () => { Store.setActive(id); close(); FX.sfx.pop(); App.refresh(); FX.toast('Xin chào ' + p.name); } },
          Art.mascot(m.animal, 'happy', 'sm'), h('b', p.name), h('span.small.muted', 'Cấp ' + Store.levelOf(p.xp) + ' · ' + Object.keys(p.cards).length + ' từ'));
      }))));
  }
  function pageHead(title, sub, right) {
    return h('div.page-head', h('div', h('h1', title), sub ? h('p', sub) : null), right || null);
  }
  function secHead(title, sub, right) {
    return h('div.sec-h', h('div', h('h2', title), sub ? h('div.sub', sub) : null), right || null);
  }
  function empty(text, mood = 'think', action) {
    return h('div.empty', Art.mascot(Store.db.active === 'cho' ? 'dog' : 'cat', mood), h('div', text), action || null);
  }
  function back(to, label = 'Quay lại') {
    return h('button.btn.ghost.sm', { onclick: () => typeof to === 'function' ? to() : App.go(to) }, ic('back'), label);
  }
  function markEx(raw) {
    const parts = String(raw).split('*');
    const el = h('span.en');
    parts.forEach((s, i) => el.appendChild(i % 2 ? h('mark', s) : document.createTextNode(s)));
    return el;
  }
  function memLevel(card) {
    if (!card || !card.st) return 0;
    const r = SRS.retrievability(card);
    if (card.st !== 2) return 1;
    return r > .92 && card.s > 20 ? 4 : r > .85 ? 3 : 2;
  }
  function mem(card) {
    const l = memLevel(card);
    return h('span.mem.l' + l, { title: ['Chưa học', 'Đang học', 'Sắp quên', 'Nhớ khá', 'Nhớ chắc'][l] }, h('i'), h('i'), h('i'), h('i'));
  }
  function wordDetail(w) {
    const p = Store.P();
    const card = p && p.cards[w.id];
    return h('div.col.g16',
      h('div.word-hero',
        h('div.row.wrap', h('span.pill.brand', D.POS[w.pos] || w.pos), D.topicById[w.topic] ? h('span.pill', D.topicById[w.topic].t) : null),
        h('div.row.wrap', { style: { gap: '14px' } }, h('div.w', w.w), accentBtns(w.w)),
        w.ipa ? h('div.ipa', { style: { fontSize: '17px' } }, w.ipa) : null,
        h('div.vi', w.vi)),
      w.ex ? h('div.ex', h('div.grow', markEx(w.exRaw)), audioBtn(w.ex, { size: 'sm' })) : null,
      w.fam.length ? h('div', h('div.eyebrow.mb', { style: { marginBottom: '8px' } }, 'Họ từ'), h('div.fam', w.fam.map(f => h('span', f.w, f.pos ? h('em', f.pos) : null)))) : null,
      w.col ? h('div.callout.tip', ic('link'), h('div', h('b', 'Cụm hay gặp: '), w.col)) : null,
      h('div.row.wrap.between',
        h('div.row', mem(card), h('span.small.muted', card ? (card.due <= Date.now() ? 'Đến hạn ôn hôm nay' : 'Ôn lại sau ' + U.fmtInterval((card.due - Date.now()) / SRS.DAY)) : 'Chưa học')),
        Speech.canListen() ? h('button.btn.secondary.sm', { onclick: () => { FX.closeAll(); Pron.modal(w.w, { ipa: w.ipa, extra: w.ex }); } }, ic('mic'), 'Luyện phát âm') : null));
  }
  function openWord(w) { FX.modal(wordDetail(w)); }

  function award(xp, el) {
    if (xp > 0) FX.xpFloat(xp, el);
    Store.addXP(xp);
    celebrate();
  }
  function celebrate() {
    const p = Store.P(); if (!p) return;
    const res = Store.takePending() || {};
    const badges = Store.checkBadges();
    const list = [];
    if (res.streakEvent) list.push(streakCele(p, res.streakEvent));
    (res.quests || []).forEach(q => list.push({ kind: 'quest', title: 'Xong nhiệm vụ', sub: q.t + ' · +' + q.xp + ' XP', hero: h('div.lv-seal.gold', ic('check'), h('small', 'QUEST')), sound: () => FX.sfx.badge(), confetti: { n: 80 } }));
    if (res.goalReached) list.push(goalCele(p));
    if (res.levelUp) list.push({ kind: 'level', title: 'Lên cấp ' + res.level, sub: 'Tổng ' + p.xp.toLocaleString('vi-VN') + ' XP. Giữ nhịp đều như vậy là chạm 900.', hero: h('div.lv-seal', h('b', res.level), h('small', 'LEVEL')), sound: () => FX.sfx.level(), confetti: { n: 160 } });
    badges.forEach(b => list.push({ kind: 'badge', title: 'Huy hiệu: ' + b.name, sub: b.desc, hero: Art.medal(b.icon), sound: () => FX.sfx.badge(), confetti: { n: 90 } }));
    if (!list.length) return;
    setTimeout(() => list.forEach(x => FX.cele(x)), 900);
  }
  function weekRow(p) {
    const keys = U.weekDays();
    const today = U.dayKey();
    const names = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    return h('div.week', keys.map((k, i) => {
      const did = (p.days[k] || 0) > 0;
      return h('div.wd' + (did ? '.on' : '') + (k === today ? '.today' : '') + (k > today ? '.future' : ''), h('i', did ? ic('check') : null), h('span', names[i]));
    }));
  }
  function streakCele(p, ev) {
    const n = p.streak.n;
    const sub = ev === 'start' ? 'Ngày đầu tiên. Quay lại ngày mai để giữ chuỗi.'
      : ev === 'reset' ? 'Chuỗi mới bắt đầu từ hôm nay.'
      : ev === 'freeze' ? 'Thẻ đóng băng đã giữ chuỗi cho bạn. Còn ' + p.streak.freeze + ' thẻ.'
      : n % 7 === 0 ? 'Tròn ' + (n / 7) + ' tuần liên tục, được tặng thêm 1 thẻ đóng băng.'
      : 'Học đều mỗi ngày là cách nhớ lâu nhất.';
    return {
      kind: 'streak', title: n === 1 ? 'Chuỗi ngày học bắt đầu' : n + ' ngày liên tiếp', sub, hero: FX.flame(n), extra: weekRow(p),
      sound: () => FX.sfx.streak(), confetti: n > 1 ? { n: 70, y: innerHeight * .3 } : null,
      onShow: box => FX.countUp(box.querySelector('.fl-n'), n, { from: Math.max(0, n - 1), dur: 700, delay: 450 })
    };
  }
  function goalCele(p) {
    const t = Store.todayXP(p);
    const R = 54, C = 2 * Math.PI * R;
    const hero = h('div.goal-ring');
    hero.innerHTML = `<svg viewBox="0 0 130 130"><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4C64FF"/><stop offset="1" stop-color="#7B5CE6"/></linearGradient></defs><circle cx="65" cy="65" r="${R}" stroke="#E8EBF2" stroke-width="10" fill="none"/><circle class="gr" cx="65" cy="65" r="${R}" stroke="url(#gg)" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 65 65)"/></svg>`;
    hero.appendChild(h('div.gr-c', ic('target'), h('b', '0'), h('small', 'XP hôm nay')));
    return {
      kind: 'goal', title: 'Hoàn thành mục tiêu hôm nay', sub: t + ' XP · mục tiêu ' + p.goal + ' XP', hero,
      sound: () => FX.sfx.rise(), confetti: { rain: true, n: 90 },
      onShow: box => { setTimeout(() => { box.querySelector('.gr').style.strokeDashoffset = '0'; }, 120); FX.countUp(box.querySelector('.gr-c b'), t, { dur: 1000, delay: 120, ticks: true }); }
    };
  }
  function focus(on) { document.body.classList.toggle('focus-mode', !!on); }
  function sparkline(vals, o = {}) {
    const w = o.w || 120, hh = o.h || 32;
    if (vals.length < 2) return h('span');
    const mn = Math.min(...vals), mx = Math.max(...vals);
    const pts = vals.map((v, i) => [i / (vals.length - 1) * w, hh - 3 - (mx === mn ? .5 : (v - mn) / (mx - mn)) * (hh - 6)]);
    const el = h('span');
    el.innerHTML = `<svg width="${w}" height="${hh}" viewBox="0 0 ${w} ${hh}"><polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${o.color || 'var(--lime)'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return el;
  }
  return { audioBtn, accentBtns, accentCast, ring, bar, accCls, side, topbar, tabbar, switcher, meMenu, pageHead, secHead, empty, back, markEx, mem, memLevel, wordDetail, openWord, award, celebrate, weekRow, focus, sparkline, ic };
})();
