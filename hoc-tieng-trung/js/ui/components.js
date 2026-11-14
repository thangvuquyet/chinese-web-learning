const UI = (() => {
  const { h, clear } = U;

  function audioBtn(text, opts = {}) {
    const b = h('button.audio-btn' + (opts.big ? '.big' : '') + (opts.sm ? '.sm' : ''), { type: 'button', 'aria-label': 'Nghe phát âm', title: 'Nghe' }, Icon.svg('volume'));
    b.addEventListener('click', async e => {
      e.stopPropagation();
      b.classList.add('playing');
      const t = typeof text === 'function' ? text() : text;
      if (Array.isArray(t)) await Speech.speakLines(t, opts);
      else await Speech.speak(t, opts);
      b.classList.remove('playing');
      opts.onPlayed && opts.onPlayed();
    });
    return b;
  }
  function stars(n, max = 3) {
    return h('span', Array.from({ length: max }, (_, i) => h('span' + (i < n ? '' : '.off'), '⭐')));
  }
  function ring(pct, color = '#0F7B66', label = '') {
    const r = 14, c = 2 * Math.PI * r;
    const el = h('div.ring');
    el.innerHTML = `<svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="${r}" stroke="#E6E1D6" stroke-width="5" fill="none"/><circle cx="17" cy="17" r="${r}" stroke="${color}" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - U.clamp(pct, 0, 1))}" style="transition:stroke-dashoffset .8s"/></svg><div class="rv">${label}</div>`;
    return el;
  }
  function progress(pct, cls = '') {
    return h('div.progress' + (cls ? '.' + cls : ''), h('i', { style: { width: Math.round(U.clamp(pct, 0, 1) * 100) + '%' } }));
  }

  function topbar() {
    const bar = document.getElementById('topbar');
    clear(bar);
    const p = Store.P();
    if (!p) return;
    const sv = Store.streakView(p);
    const goalPct = Store.todayXP(p) / p.goal;
    bar.append(
      h('button.tb-profile', { onclick: () => Store.all().length > 1 ? profileSwitcher() : profileEditor(p), title: 'Hồ sơ của bạn' },
        h('span.avatar', { style: { background: p.color } }, p.avatar),
        h('span', p.name)),
      h('div.tb-stats',
        h('span.chip.flame' + (sv.today ? '' : '.off'), { title: sv.today ? 'Chuỗi ngày học' : 'Học hôm nay để giữ lửa!' }, h('span.em', Icon.svg('flame')), sv.n),
        h('span.chip.xp', { title: 'Tổng XP' }, Icon.svg('star'), p.xp),
        h('span', { title: `Mục tiêu hôm nay: ${Store.todayXP(p)}/${p.goal} XP` }, ring(goalPct, goalPct >= 1 ? '#2A9D68' : '#0F7B66', goalPct >= 1 ? '✓' : Math.round(goalPct * 100) + '%'))
      )
    );
  }
  const TABS = [
    ['home', 'home', 'Trang chủ'],
    ['path', 'route', 'Lộ trình'],
    ['review', 'cards', 'Ôn thẻ'],
    ['exams', 'exam', 'Thi thử'],
    ['more', 'compass', 'Khám phá']
  ];
  function tabbar(active) {
    const nav = document.getElementById('tabbar');
    clear(nav);
    const p = Store.P();
    const due = p ? D.dueCards(p).length : 0;
    nav.appendChild(h('div.brand', h('span.brand-mark', '猫'), h('div.brand-t', h('b', 'Mèo HSK'), h('small', 'HSK 3.0 · HSK3 → HSK4'))));
    for (const [id, icon, label] of TABS) {
      const b = h('button.tab' + (active === id ? '.active' : ''), { onclick: () => App.go(id), title: label },
        h('span.ti', Icon.svg(icon)), h('span.tl', label),
        id === 'review' && due ? h('span.badge-dot', due > 99 ? '99+' : due) : null);
      nav.appendChild(b);
    }
    const mini = !!Store.settings().navMini;
    nav.appendChild(h('button.nav-toggle', { onclick: toggleNav, title: mini ? 'Mở rộng menu' : 'Thu gọn menu', 'aria-label': mini ? 'Mở rộng menu' : 'Thu gọn menu' }, Icon.svg(mini ? 'panelOpen' : 'panelClose'), h('span.tl', 'Thu gọn menu')));
    nav.appendChild(h('div.side-foot', h('span.zh-q', '学而时习之'), 'Học rồi thường xuyên ôn lại · Luận Ngữ'));
  }

  function applyNav() { document.body.classList.toggle('nav-mini', !!Store.settings().navMini); }
  function toggleNav() {
    const s = Store.settings();
    s.navMini = !s.navMini;
    Store.save(true);
    applyNav();
    const cur = App.current ? App.current.name : 'home';
    tabbar({ home: 'home', path: 'path', learn: 'path', check: 'path', review: 'review', exams: 'exams', exam: 'exams', examreview: 'exams', drill: 'exams' }[cur] || 'more');
  }
  function wordDetail(w) {
    const p = Store.P();
    const card = p && p.cards[w.id];
    const ex = D.examplesFor(w, 3);
    const tip = w.hvOk && w.chars.length === 1 && w.toneOk ? U.predictTone(w.hvs[0]) : null;
    return h('div.col', { style: { alignItems: 'center', textAlign: 'center' } },
      w.emo ? h('div.emo', w.emo) : null,
      hz(w.hz),
      h('div.row', { style: { justifyContent: 'center' } }, h('span.py', w.py), audioBtn(w.hz, { sm: true })),
      w.hv ? h('div.hv', 'Hán Việt: ' + w.hv) : null,
      h('div.vi', w.vi),
      h('div.row', { style: { justifyContent: 'center' } },
        h('span.pos', D.POS[w.pos] || w.pos),
        h('span.pill', w.lv ? 'HSK ' + w.lv : 'Từ của tôi'),
        card ? h('span.pill.info', 'Ôn tiếp: ' + (card.due <= Date.now() ? 'hôm nay' : U.fmtInterval((card.due - Date.now()) / SRS.DAY))) : h('span.pill', 'Chưa học')),
      tip && HSK.toneTip[tip.key] ? h('div.tone-hint', '💡 ' + HSK.toneTip[tip.key]) : null,
      ...ex.map(s => exampleBox(s)),
      h('div.row', { style: { justifyContent: 'center' } },
        h('button.btn.indigo.sm', { onclick: () => writerModal(w.hz) }, '✍️ Xem cách viết'))
    );
  }
  function exampleBox(s) {
    return h('div.ex-sent',
      h('div.row', h('div.grow', h('div.zh', s.text), Store.settings().showPy ? h('div.pyl', D.pinyin(s.text)) : null, h('div.vil', s.vi)), audioBtn(s.text, { sm: true })));
  }
  function openWord(w) { FX.modal(wordDetail(w)); }

  let hwLoading = null;
  function loadHanziWriter() {
    if (window.HanziWriter) return Promise.resolve(true);
    if (hwLoading) return hwLoading;
    hwLoading = new Promise(res => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.2/dist/hanzi-writer.min.js';
      s.onload = () => res(true);
      s.onerror = () => { hwLoading = null; res(false); };
      document.head.appendChild(s);
    });
    return hwLoading;
  }
  function writerPanel(text, opts = {}) {
    const chars = [...text].filter(c => /[㐀-鿿]/.test(c));
    let idx = 0, writer = null;
    const box = h('div.writer-box');
    const info = h('div.center.muted.small.mt', 'Đang tải dữ liệu nét chữ…');
    const sel = h('div.row.wrap', { style: { justifyContent: 'center', marginTop: '10px' } });
    const ctrl = h('div.row.wrap', { style: { justifyContent: 'center', marginTop: '12px' } },
      h('button.btn.sky.sm', { onclick: () => writer && writer.animateCharacter() }, '▶️ Xem lại'),
      h('button.btn.leaf.sm', { onclick: quiz }, '✏️ Tự viết thử'),
      h('button.btn.ghost.sm', { onclick: () => Speech.speak(chars[idx]) }, '🔊'));
    function render() {
      clear(sel);
      if (chars.length > 1) chars.forEach((c, i) => sel.appendChild(h('button.btn.sm' + (i === idx ? '' : '.ghost'), { onclick: () => { idx = i; mount(); render(); } }, h('span.zh', c))));
    }
    async function mount() {
      clear(box);
      const ok = await loadHanziWriter();
      if (!ok) { info.textContent = 'Cần Internet để tải hoạt hình nét chữ (Hanzi Writer).'; return; }
      info.textContent = 'Theo dõi thứ tự nét, sau đó bấm "Tự viết thử" để vẽ bằng tay/chuột.';
      writer = window.HanziWriter.create(box, chars[idx], {
        width: 260, height: 260, padding: 18, showOutline: true,
        strokeColor: '#17211D', radicalColor: '#0B5F4F', outlineColor: '#E3DED2',
        strokeAnimationSpeed: 1, delayBetweenStrokes: 220, drawingColor: '#34508A', highlightColor: '#2A9D68',
        onLoadCharDataError: () => { info.textContent = 'Không tải được dữ liệu cho chữ này.'; }
      });
      writer.animateCharacter();
    }
    function quiz() {
      if (!writer) return;
      info.textContent = 'Vẽ từng nét theo đúng thứ tự nhé!';
      writer.quiz({
        onComplete: d => {
          const good = d.totalMistakes <= 2;
          info.textContent = good ? `Tuyệt vời! Chỉ sai ${d.totalMistakes} nét 🎉` : `Hoàn thành, sai ${d.totalMistakes} nét. Thử lại cho nhớ nhé!`;
          if (good) { FX.sfx.done(); FX.burstAt(box, 50); } else FX.sfx.ok();
        }
      });
    }
    render(); setTimeout(mount, 30);
    return h('div', opts.title ? h('h2.center', opts.title) : null, sel, box, info, ctrl);
  }
  function writerModal(text) { FX.modal(writerPanel(text, { title: 'Cách viết ' + text })); }

  function profileSwitcher() {
    FX.modal(close => {
      const list = Store.all();
      return h('div',
        h('h2', 'Chọn hồ sơ'),
        h('div.grid2', list.map(p => h('button.prof-card' + (p.id === Store.db.active ? '.on' : ''), {
          onclick: () => { Store.setActive(p.id); close(); FX.sfx.pop(); App.refresh(); FX.toast(`Chào ${p.name}! ${p.avatar}`); }
        }, h('span.avatar', { style: { background: p.color } }, p.avatar), p.name, h('span.small.muted', `Cấp ${Store.levelOf(p.xp)} · ${Object.keys(p.cards).length} từ`)))),
      );
    });
  }
  function profileEditor(p, onDone) {
    let name = p ? p.name : '', avatar = p ? p.avatar : Store.AVATARS[Store.all().length % Store.AVATARS.length], color = p ? p.color : Store.COLORS[0];
    FX.modal(close => {
      const prev = h('span.avatar.lg', { style: { background: color } }, avatar);
      const inp = h('input.input', { value: name, placeholder: 'Tên gọi (ví dụ: Huyền Anh)', maxlength: 20, oninput: e => name = e.target.value });
      const avs = h('div.avatar-pick', Store.AVATARS.map(a => h('button' + (a === avatar ? '.on' : ''), {
        onclick: e => { avatar = a; prev.textContent = a; [...avs.children].forEach(c => c.classList.toggle('on', c === e.currentTarget)); }
      }, a)));
      const cols = h('div.avatar-pick', Store.COLORS.map(c => h('button' + (c === color ? '.on' : ''), {
        style: { background: c }, onclick: e => { color = c; prev.style.background = c; [...cols.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); }
      }, '')));
      return h('div',
        h('h2', p ? 'Sửa hồ sơ' : 'Người học mới'),
        h('div.center', prev),
        h('div.field', h('label', 'Tên'), inp),
        h('div.field', h('label', 'Hình đại diện'), avs),
        h('div.field', h('label', 'Màu'), cols),
        h('button.btn.block.mt', {
          onclick: () => {
            if (!name.trim()) { FX.toast('Nhập tên trước nhé!'); return; }
            if (p) { p.name = name.trim(); p.avatar = avatar; p.color = color; Store.save(true); }
            else { const np = Store.createProfile(name.trim(), avatar, color); Store.setActive(np.id); }
            close(); App.refresh(); onDone && onDone();
          }
        }, p ? 'Lưu' : 'Tạo hồ sơ')
      );
    });
  }
  function onboarding() {
    const view = document.getElementById('view');
    clear(view);
    document.getElementById('tabbar').innerHTML = '';
    document.getElementById('topbar').innerHTML = '';
    let name = 'Huyền Anh';
    const start = () => {
      const p = Store.createProfile((name || 'Huyền Anh').trim(), '🐱', '#F8F0DC');
      Store.setActive(p.id);
      FX.sfx.done(); FX.confetti({ n: 140 });
      App.go('home');
    };
    const card = h('div.card.center.page-enter.welcome',
      FX.mascot('wow', 'lg'),
      h('h1', { style: { margin: '6px 0' } }, 'Chào mừng đến Mèo HSK!'),
      h('p', { style: { color: 'var(--ink2)' } }, 'Lộ trình HSK2 → HSK3 → HSK4 theo định dạng HSK 3.0: thẻ từ thông minh, ngữ pháp, luyện nghe nói và 40 đề thi thử. Mỗi ngày một chút là tới đích.'),
      h('div.field.mt', { style: { textAlign: 'left' } }, h('label', 'Tên của bạn'), h('input.input', { value: name, maxlength: 20, oninput: e => name = e.target.value, onkeydown: e => { if (e.key === 'Enter') start(); } })),
      h('p.small.muted', 'Có thể đổi tên và hình đại diện bất cứ lúc nào trong Cài đặt.'),
      h('button.btn.block.mt', { onclick: start }, 'Bắt đầu học 🚀')
    );
    view.appendChild(card);
  }

  function celebrate(res) {
    if (!res) return;
    const p = Store.P(); if (!p) return;
    const badges = Store.checkBadges();
    const list = [];
    if (res.streakEvent) list.push(streakCele(p, res.streakEvent));
    if (res.goalReached) list.push(goalCele(p));
    if (res.levelUp) list.push({
      kind: 'level', title: 'Lên cấp ' + res.level,
      sub: 'Tổng ' + p.xp + ' XP. Giữ nhịp học đều như thế này nhé.',
      hero: h('div.seal.jade.lv-seal', h('b', res.level), h('small', '级')),
      sound: () => FX.sfx.level(), confetti: { n: 160 }
    });
    badges.forEach(b => list.push({
      kind: 'badge', title: 'Huy hiệu mới: ' + b.name, sub: b.desc,
      hero: h('div.medal', h('span', b.e)),
      sound: () => FX.sfx.badge(), confetti: { n: 90 }
    }));
    if (!list.length) return;
    setTimeout(() => list.forEach(x => FX.cele(x)), 1250);
  }
  function weekRow(p) {
    const now = new Date();
    const dow = (now.getDay() + 6) % 7;
    const names = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    return h('div.week', names.map((nm, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow + i);
      const did = (p.days[U.dayKey(d)] || 0) > 0;
      return h('div.wd' + (did ? '.on' : '') + (i === dow ? '.today' : '') + (i > dow ? '.future' : ''), h('i', did ? Icon.svg('check') : null), h('span', nm));
    }));
  }
  function streakCele(p, ev) {
    const n = p.streak.n;
    const hero = FX.flame(n);
    const sub = ev === 'start' ? 'Ngày đầu tiên. Quay lại vào ngày mai để giữ lửa.'
      : ev === 'reset' ? 'Chuỗi mới bắt đầu từ hôm nay. Mỗi ngày một chút là đủ.'
      : ev === 'freeze' ? 'Thẻ đóng băng đã giữ chuỗi cho bạn. Còn ' + p.streak.freeze + ' thẻ.'
      : n % 7 === 0 ? 'Tròn ' + (n / 7) + ' tuần liên tục, tặng thêm 1 thẻ đóng băng.'
      : 'Học đều mỗi ngày là cách nhớ lâu nhất.';
    return {
      kind: 'streak', title: n === 1 ? 'Chuỗi ngày học bắt đầu' : n + ' ngày liên tiếp', sub, hero, extra: weekRow(p),
      sound: () => FX.sfx.streak(), confetti: n > 1 ? { n: 70, y: innerHeight * 0.3 } : null,
      onShow: box => { const el = box.querySelector('.fl-n'); FX.countUp(el, n, { from: Math.max(0, n - 1), dur: 700, delay: 450 }); }
    };
  }
  function goalCele(p) {
    const t = Store.todayXP(p);
    const R = 54, C = 2 * Math.PI * R;
    const hero = h('div.goal-ring');
    hero.innerHTML = '<svg viewBox="0 0 130 130"><circle cx="65" cy="65" r="' + R + '" stroke="#E6E1D6" stroke-width="10" fill="none"/><circle class="gr" cx="65" cy="65" r="' + R + '" stroke="url(#gg)" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '" transform="rotate(-90 65 65)"/><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0F7B66"/><stop offset="1" stop-color="#2FAE8E"/></linearGradient></defs></svg>';
    hero.appendChild(h('div.gr-c', Icon.svg('target'), h('b', '0'), h('small', 'XP hôm nay')));
    return {
      kind: 'goal', title: 'Hoàn thành mục tiêu hôm nay', sub: t + ' XP · mục tiêu ' + p.goal + ' XP', hero,
      sound: () => FX.sfx.rise(), confetti: { rain: true, n: 90 },
      onShow: box => {
        const c = box.querySelector('.gr');
        setTimeout(() => { c.style.strokeDashoffset = '0'; }, 120);
        FX.countUp(box.querySelector('.gr-c b'), t, { dur: 1000, delay: 120, ticks: true });
      }
    };
  }
  function empty(text, mood = 'think') {
    return h('div.empty', FX.mascot(mood), h('div', text));
  }
  function backBtn(to, label = '← Quay lại') {
    return h('button.btn.ghost.sm', { onclick: () => typeof to === 'function' ? to() : App.go(to) }, label);
  }
  function pageTitle(icon, text, right) {
    return h('h1.page', h('span', icon), h('span.grow', text), right || null);
  }
  function hz(text, cls = '') {
    const ch = [...String(text)];
    const size = cls || (ch.length > 3 ? 'sm' : ch.length > 2 ? 'md' : '');
    return h('div.big-hz' + (size ? '.' + size : ''), { lang: 'zh-CN', 'aria-label': text }, ch.map(c => /[㐀-鿿]/.test(c) ? h('span.gz', h('span', c)) : h('span', c)));
  }
  return { audioBtn, stars, ring, progress, topbar, tabbar, wordDetail, exampleBox, openWord, writerPanel, writerModal, loadHanziWriter, profileSwitcher, profileEditor, onboarding, celebrate, empty, backBtn, pageTitle, hz, applyNav };
})();
