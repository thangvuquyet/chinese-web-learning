const Store = (() => {
  const KEY = 'meo-hsk-v2';
  const AVATARS = ['🐱', '😺', '😸', '🐈', '🐰', '🐻', '🐼', '🦊', '🐨', '🐯', '🐧', '🐹'];
  const COLORS = ['#E2F0EB', '#E5EFF8', '#F8F0DC', '#E7ECF5', '#F6EBE2', '#EDEAE2'];
  let db = null;
  let saveTimer = null;
  let pending = null;
  const listeners = new Set();

  function fresh() {
    return {
      v: 1,
      profiles: {},
      order: [],
      active: null,
      settings: { rate: 0.85, voice: '', sound: true, motion: true, unlockAll: false, autoplay: true, showPy: true, showHv: true, navMini: false, clips: true, theme: 'auto', speakEx: true, speakOff: 0 },
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
      badges: {}, testOut: {}, daily: {}, miss: {}
    };
  }
  function load() {
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
    if (!db || typeof db !== 'object' || !db.profiles) db = fresh();
    const f = fresh();
    db.settings = Object.assign({}, f.settings, db.settings || {});
    db.custom = db.custom || [];
    for (const p of Object.values(db.profiles)) {
      if (p.name === 'Huyền Anh') p.name = 'Huyền Anh Hoàng';
      const b = blankProfile(p.name, p.avatar, p.color);
      for (const k of Object.keys(b)) if (p[k] === undefined) p[k] = b[k];
      p.stats = Object.assign({}, b.stats, p.stats);
      p.streak = Object.assign({}, b.streak, p.streak);
    }
    if (db.active && !db.profiles[db.active]) db.active = db.order[0] || null;
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
    if (gap - 1 <= p.streak.freeze) return { n: p.streak.n, alive: true, today: false, frozen: true, need: gap - 1 };
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
      else if (gap - 1 <= s.freeze) { s.freeze -= gap - 1; s.n += 1; event = 'freeze'; }
      else { s.n = 1; event = 'reset'; }
    }
    s.last = today;
    if (s.n > 0 && s.n % 7 === 0 && s.freeze < 3) s.freeze += 1;
    s.best = Math.max(s.best, s.n);
    return event;
  }
  const QUEST_XP = 10;
  const QUESTS = [
    ['goal', 'Đạt mục tiêu XP hôm nay', p => p.goal, (p, d) => todayXP(p)],
    ['rev20', 'Ôn 20 thẻ từ', () => 20, (p, d) => d.reviews || 0],
    ['lesson', 'Hoàn thành 1 bài trên lộ trình', () => 1, (p, d) => d.lessons || 0],
    ['speak5', 'Đọc 5 câu đạt từ 80% độ chuẩn', () => 5, (p, d) => d.speakOk || 0],
    ['ok30', 'Trả lời đúng 30 câu', () => 30, (p, d) => d.ok || 0],
    ['combo8', 'Đúng 8 câu liên tiếp trong một bài', () => 8, (p, d) => d.combo || 0],
    ['perfect', 'Làm một bài không sai câu nào', () => 1, (p, d) => d.perfect || 0],
    ['listen', 'Làm 1 lượt luyện nghe', () => 1, (p, d) => d.listen || 0]
  ];
  function dayRec(p = P()) {
    const k = U.dayKey();
    p.daily = p.daily || {};
    if (!p.daily[k]) {
      p.daily[k] = { claimed: {} };
      const keys = Object.keys(p.daily).sort();
      while (keys.length > 21) delete p.daily[keys.shift()];
    }
    return p.daily[k];
  }
  function quests(p = P()) {
    if (!p) return [];
    const d = dayRec(p);
    const canSpeak = typeof Speech !== 'undefined' && Speech.canListen() && settings().speakEx !== false;
    const pool = QUESTS.slice(1).filter(q => q[0] !== 'speak5' || canSpeak);
    const pick = d.qs ? d.qs.map(id => QUESTS.find(q => q[0] === id)).filter(Boolean) : U.sample(pool, 2, U.rng('q' + U.dayKey() + p.id));
    if (!d.qs) d.qs = pick.map(q => q[0]);
    return [QUESTS[0], ...pick].map(([id, t, tgt, cur]) => {
      const target = tgt(p);
      const v = Math.min(target, cur(p, d));
      return { id, t, target, v, done: v >= target, claimed: !!d.claimed[id], xp: QUEST_XP };
    });
  }
  function merge(ev) {
    pending = pending || { quests: [] };
    if (ev.streakEvent) pending.streakEvent = ev.streakEvent;
    if (ev.goalReached) pending.goalReached = true;
    if (ev.levelUp) { pending.levelUp = true; pending.level = ev.level; }
    if (ev.quests && ev.quests.length) pending.quests.push(...ev.quests);
  }
  function takePending() { const x = pending; pending = null; return x; }
  function addXP(n, opts = {}) {
    const p = P();
    if (!p) return { levelUp: false };
    n = Math.max(0, Math.round(n || 0));
    const before = levelOf(p.xp);
    const goalBefore = todayXP(p) >= p.goal;
    const k = U.dayKey();
    let sEvent = null;
    if (n) { p.xp += n; p.days[k] = (p.days[k] || 0) + n; sEvent = touchStreak(p); }
    const d = dayRec(p);
    const got = [];
    for (let guard = 0; guard < 5; guard++) {
      const fresh = quests(p).filter(q => q.done && !d.claimed[q.id]);
      if (!fresh.length) break;
      for (const q of fresh) { d.claimed[q.id] = Date.now(); got.push(q); p.xp += QUEST_XP; p.days[k] = (p.days[k] || 0) + QUEST_XP; }
      if (!sEvent) sEvent = touchStreak(p);
    }
    const after = levelOf(p.xp);
    const goalNow = todayXP(p) >= p.goal;
    save();
    const ev = { levelUp: after > before, level: after, streakEvent: sEvent, goalReached: !goalBefore && goalNow, quests: got };
    merge(ev);
    return ev;
  }
  function bump(key, n = 1, max = false) {
    const p = P(); if (!p) return;
    const d = dayRec(p);
    d[key] = max ? Math.max(d[key] || 0, n) : (d[key] || 0) + n;
    addXP(0);
  }
  function noteMiss(id, ok) {
    const p = P(); if (!p || !id) return;
    p.miss = p.miss || {};
    if (!ok) p.miss[id] = { n: ((p.miss[id] && p.miss[id].n) || 0) + 1, at: Date.now() };
    else if (p.miss[id]) { p.miss[id].n -= 1; if (p.miss[id].n <= 0) delete p.miss[id]; }
  }
  function missList(p = P()) {
    return Object.entries((p && p.miss) || {}).filter(([id]) => D.byId[id]).sort((a, b) => b[1].n - a[1].n || b[1].at - a[1].at).map(([id]) => id);
  }
  function addMinutes(min) {
    const p = P(); if (!p) return;
    const k = U.dayKey();
    p.mins[k] = (p.mins[k] || 0) + min;
    save();
  }
  function countAnswer(ok) {
    const p = P(); if (!p) return;
    p.stats.ans++;
    if (ok) { p.stats.ok++; bump('ok'); } else save();
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
    b.id = p.id; b.created = p.created; b.goal = p.goal;
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
  return { AVATARS, COLORS, BADGES, P, all, settings, get db() { return db; }, save, onChange, createProfile, removeProfile, setActive, levelOf, xpForLevel, todayXP, streakView, addXP, addMinutes, countAnswer, checkBadges, exportJSON, importJSON, resetProfileProgress, addCustom, removeCustom, quests, bump, takePending, noteMiss, missList, dayRec };
})();
