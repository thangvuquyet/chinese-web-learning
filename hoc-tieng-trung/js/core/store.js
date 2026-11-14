const Store = (() => {
  const KEY = 'banhbao-hsk-v1';
  const AVATARS = ['🐱', '😺', '😸', '🐈', '🐰', '🐻', '🐼', '🦊', '🐨', '🐯', '🐧', '🐹'];
  const COLORS = ['#E2F0EB', '#E5EFF8', '#F8F0DC', '#E7ECF5', '#F6EBE2', '#EDEAE2'];
  const OLD_COLORS = { '#ffe3ec': '#F6EBE2', '#e3f3fd': '#E5EFF8', '#ddf7ec': '#E2F0EB', '#eee8ff': '#E7ECF5', '#fff0e3': '#F6EBE2', '#fff4d4': '#F8F0DC' };
  let db = null;
  let saveTimer = null;
  const listeners = new Set();

  function fresh() {
    return {
      v: 1,
      profiles: {},
      order: [],
      active: null,
      settings: { rate: 0.85, voice: '', sound: true, motion: true, unlockAll: false, autoplay: true, showPy: true, showHv: true, navMini: false },
      custom: []
    };
  }
  function blankProfile(name, avatar, color) {
    return {
      id: 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36),
      name, avatar, color, created: Date.now(),
      xp: 0, days: {}, mins: {},
      streak: { n: 0, last: null, best: 0, freeze: 2 },
      goal: 40,
      nodes: {}, cards: {}, grammar: {}, exams: [], checks: {},
      stats: { ans: 0, ok: 0, lessons: 0, reviews: 0, speak: 0, perfect: 0, tones: 0 },
      badges: {}, testOut: {}
    };
  }
  function load() {
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
    if (!db || typeof db !== 'object' || !db.profiles) db = fresh();
    const f = fresh();
    db.settings = Object.assign({}, f.settings, db.settings || {});
    db.custom = db.custom || [];
    for (const p of Object.values(db.profiles)) {
      const b = blankProfile(p.name, p.avatar, p.color);
      for (const k of Object.keys(b)) if (p[k] === undefined) p[k] = b[k];
      p.stats = Object.assign({}, b.stats, p.stats);
      p.streak = Object.assign({}, b.streak, p.streak);
      if (OLD_COLORS[String(p.color).toLowerCase()]) p.color = OLD_COLORS[String(p.color).toLowerCase()];
    }
    let moved = false;
    for (const [id, p] of Object.entries(db.profiles)) {
      if (p.name === 'Chồng' && !p.xp && !Object.keys(p.cards || {}).length) { delete db.profiles[id]; db.order = db.order.filter(x => x !== id); moved = true; }
    }
    for (const p of Object.values(db.profiles)) {
      if (p.name === 'Vợ') { p.name = 'Huyền Anh'; if (p.avatar === '🐰') p.avatar = '🐱'; db.active = p.id; moved = true; }
      delete p.cheers;
    }
    if (db.active && !db.profiles[db.active]) db.active = db.order[0] || null;
    if (moved) try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {}
  }
  function save(now) {
    clearTimeout(saveTimer);
    const w = () => {
      try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { if (typeof FX !== 'undefined') FX.toast('⚠️ Không lưu được tiến độ (bộ nhớ trình duyệt đầy?)'); }
    };
    if (now) w(); else saveTimer = setTimeout(w, 250);
    listeners.forEach(fn => fn());
  }
  const onChange = fn => listeners.add(fn);

  function createProfile(name, avatar, color) {
    const p = blankProfile(name || 'Bạn', avatar || AVATARS[db.order.length % AVATARS.length], color || COLORS[db.order.length % COLORS.length]);
    db.profiles[p.id] = p;
    db.order.push(p.id);
    if (!db.active) db.active = p.id;
    save(true);
    return p;
  }
  function removeProfile(id) {
    delete db.profiles[id];
    db.order = db.order.filter(x => x !== id);
    if (db.active === id) db.active = db.order[0] || null;
    save(true);
  }
  function setActive(id) { if (db.profiles[id]) { db.active = id; save(true); } }
  const P = () => db.profiles[db.active] || null;
  const all = () => db.order.map(id => db.profiles[id]).filter(Boolean);
  const settings = () => db.settings;

  const levelOf = xp => Math.floor(Math.sqrt(xp / 40)) + 1;
  const xpForLevel = lv => 40 * (lv - 1) * (lv - 1);
  function todayXP(p = P()) { return (p && p.days[U.dayKey()]) || 0; }

  function streakView(p = P()) {
    if (!p || !p.streak.last) return { n: 0, alive: false, today: false };
    const gap = U.daysBetween(p.streak.last, U.dayKey());
    if (gap === 0) return { n: p.streak.n, alive: true, today: true };
    if (gap === 1) return { n: p.streak.n, alive: true, today: false };
    if (gap === 2 && p.streak.freeze > 0) return { n: p.streak.n, alive: true, today: false, frozen: true };
    return { n: 0, alive: false, today: false };
  }
  function touchStreak(p) {
    const today = U.dayKey();
    const s = p.streak;
    let event = null;
    if (s.last === today) return null;
    if (!s.last) { s.n = 1; event = 'start'; }
    else {
      const gap = U.daysBetween(s.last, today);
      if (gap === 1) { s.n += 1; event = 'up'; }
      else if (gap === 2 && s.freeze > 0) { s.freeze -= 1; s.n += 1; event = 'freeze'; }
      else { s.n = 1; event = 'reset'; }
    }
    s.last = today;
    if (s.n > 0 && s.n % 7 === 0 && s.freeze < 3) s.freeze += 1;
    s.best = Math.max(s.best, s.n);
    return event;
  }
  function addXP(n, opts = {}) {
    const p = P();
    if (!p || !n) return { levelUp: false };
    const before = levelOf(p.xp);
    const goalBefore = todayXP(p) >= p.goal;
    p.xp += n;
    const k = U.dayKey();
    p.days[k] = (p.days[k] || 0) + n;
    const sEvent = touchStreak(p);
    const after = levelOf(p.xp);
    const goalNow = todayXP(p) >= p.goal;
    save();
    return { levelUp: after > before, level: after, streakEvent: sEvent, goalReached: !goalBefore && goalNow };
  }
  function addMinutes(min) {
    const p = P(); if (!p) return;
    const k = U.dayKey();
    p.mins[k] = (p.mins[k] || 0) + min;
    save();
  }
  function countAnswer(ok) {
    const p = P(); if (!p) return;
    p.stats.ans++; if (ok) p.stats.ok++;
    save();
  }

  const BADGES = [
    ['first', '🌱', 'Bước đầu tiên', 'Hoàn thành bài học đầu tiên', p => p.stats.lessons >= 1],
    ['streak3', '🔥', 'Lửa nhỏ', 'Chuỗi 3 ngày liên tiếp', p => p.streak.best >= 3],
    ['streak7', '🌟', 'Một tuần chăm chỉ', 'Chuỗi 7 ngày', p => p.streak.best >= 7],
    ['streak30', '👑', 'Bền bỉ 30 ngày', 'Chuỗi 30 ngày', p => p.streak.best >= 30],
    ['w50', '🌱', '50 từ', 'Đã học 50 từ', p => Object.keys(p.cards).length >= 50],
    ['w200', '📗', '200 từ', 'Đã học 200 từ', p => Object.keys(p.cards).length >= 200],
    ['w500', '📘', '500 từ', 'Đã học 500 từ', p => Object.keys(p.cards).length >= 500],
    ['w1000', '🏆', '1000 từ', 'Đã học 1000 từ', p => Object.keys(p.cards).length >= 1000],
    ['g10', '🧩', 'Thợ ngữ pháp', 'Học 10 điểm ngữ pháp', p => Object.keys(p.grammar).length >= 10],
    ['g30', '🧠', 'Bậc thầy ngữ pháp', 'Học 30 điểm ngữ pháp', p => Object.keys(p.grammar).length >= 30],
    ['exam1', '📝', 'Thí sinh nhí', 'Làm đề thi thử đầu tiên', p => p.exams.length >= 1],
    ['exam10', '🎓', 'Cày đề', 'Làm 10 đề thi thử', p => p.exams.length >= 10],
    ['pass3', '🥉', 'Đỗ HSK3 thử', 'Đạt từ 180/300 ở đề HSK3', p => p.exams.some(e => e.level === 3 && e.total >= 180)],
    ['pass4', '🥇', 'Đỗ HSK4 thử', 'Đạt từ 180/300 ở đề HSK4', p => p.exams.some(e => e.level === 4 && e.total >= 180)],
    ['perfect', '💯', 'Hoàn hảo', 'Một bài học đúng 100%', p => p.stats.perfect >= 1],
    ['rev300', '🔁', 'Ôn tập chăm', 'Ôn 300 thẻ', p => p.stats.reviews >= 300],
    ['speak20', '🎤', 'Họa mi', 'Luyện nói 20 câu', p => p.stats.speak >= 20],
    ['tone50', '🎵', 'Tai thính', 'Đúng 50 câu thanh điệu', p => p.stats.tones >= 50],
    ['xp1000', '⭐', '1000 XP', 'Tích lũy 1000 XP', p => p.xp >= 1000],
    ['xp5000', '🌈', '5000 XP', 'Tích lũy 5000 XP', p => p.xp >= 5000]
  ];
  function checkBadges() {
    const p = P(); if (!p) return [];
    const got = [];
    for (const [id, e, name, desc, test] of BADGES) {
      if (!p.badges[id] && test(p)) { p.badges[id] = Date.now(); got.push({ id, e, name, desc }); }
    }
    if (got.length) save();
    return got;
  }

  function exportJSON() { return JSON.stringify(db, null, 1); }
  function importJSON(text) {
    const d = JSON.parse(text);
    if (!d || !d.profiles || !d.order) throw new Error('File không hợp lệ');
    db = d; save(true); load();
  }
  function resetProfileProgress(id) {
    const p = db.profiles[id]; if (!p) return;
    const b = blankProfile(p.name, p.avatar, p.color);
    b.id = p.id; b.created = p.created;
    db.profiles[id] = b; save(true);
  }
  function addCustom(list) {
    for (const w of list) {
      if (!db.custom.some(x => x.hz === w.hz && x.py === w.py)) db.custom.push(w);
    }
    save(true);
  }
  function removeCustom(hz, py) { db.custom = db.custom.filter(x => !(x.hz === hz && x.py === py)); save(true); }

  load();
  return { AVATARS, COLORS, BADGES, P, all, settings, get db() { return db; }, save, onChange, createProfile, removeProfile, setActive, levelOf, xpForLevel, todayXP, streakView, addXP, addMinutes, countAnswer, checkBadges, exportJSON, importJSON, resetProfileProgress, addCustom, removeCustom };
})();
