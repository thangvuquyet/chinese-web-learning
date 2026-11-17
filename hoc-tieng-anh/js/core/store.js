const Store = (() => {
  const KEY = 'pawlish-v1';
  const MEMBERS = {
    meo: { id: 'meo', animal: 'cat', name: 'Mèo', color: '#F08A24', soft: '#FFF1E3', deep: '#B85F0C' },
    cho: { id: 'cho', animal: 'dog', name: 'Chó', color: '#7B5CE6', soft: '#F1EDFD', deep: '#5136B8' }
  };
  const IDS = ['meo', 'cho'];
  let db = null;
  let saveTimer = null;
  let pending = null;
  const listeners = new Set();

  function fresh() {
    return {
      v: 1, setup: false, me: null, active: null,
      profiles: { meo: blank('meo'), cho: blank('cho') },
      snaps: { meo: null, cho: null },
      notes: [],
      settings: { rate: 1, accent: 'mix', voice: '', sound: true, motion: true, navMini: false, speakOn: true, showIPA: true, autoNext: true, p5timer: true, aiKey: '', aiModel: 'claude-opus-5-5' }
    };
  }
  function blank(id) {
    const m = MEMBERS[id];
    return {
      id, name: m.name, animal: m.animal, created: Date.now(), updated: 0,
      target: 850, examDate: '', goal: 60,
      xp: 0, days: {}, mins: {},
      streak: { n: 0, last: null, best: 0, freeze: 2 },
      cards: {}, topics: {}, grammar: {}, units: {}, strat: {},
      parts: { 1: { n: 0, ok: 0, h: [] }, 2: { n: 0, ok: 0, h: [] }, 3: { n: 0, ok: 0, h: [] }, 4: { n: 0, ok: 0, h: [] }, 5: { n: 0, ok: 0, h: [] }, 6: { n: 0, ok: 0, h: [] }, 7: { n: 0, ok: 0, h: [] } },
      tags: {}, seen: {}, miss: {}, tests: [], level0: null,
      speak: { n: 0, sum: 0, best: 0, sounds: {}, words: {} },
      stats: { ans: 0, ok: 0, lessons: 0, reviews: 0, speak: 0, perfect: 0, dict: 0, sets: 0 },
      badges: {}, daily: {}, plan: {}
    };
  }
  function load() {
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
    if (!db || typeof db !== 'object' || !db.profiles) db = fresh();
    const f = fresh();
    db.settings = Object.assign({}, f.settings, db.settings || {});
    db.snaps = Object.assign({ meo: null, cho: null }, db.snaps || {});
    db.notes = db.notes || [];
    for (const id of IDS) {
      const p = db.profiles[id] || blank(id);
      const b = blank(id);
      for (const k of Object.keys(b)) if (p[k] === undefined) p[k] = b[k];
      p.stats = Object.assign({}, b.stats, p.stats);
      p.streak = Object.assign({}, b.streak, p.streak);
      p.speak = Object.assign({}, b.speak, p.speak);
      for (const k of Object.keys(b.parts)) p.parts[k] = Object.assign({ n: 0, ok: 0, h: [] }, p.parts[k] || {});
      db.profiles[id] = p;
    }
    if (!IDS.includes(db.active)) db.active = db.me || null;
  }
  function save(now) {
    clearTimeout(saveTimer);
    const w = () => {
      try { localStorage.setItem(KEY, JSON.stringify(db)); }
      catch (e) { if (typeof FX !== 'undefined') FX.toast('Không lưu được tiến độ: bộ nhớ trình duyệt đã đầy'); }
    };
    if (now) w(); else saveTimer = setTimeout(w, 250);
    listeners.forEach(fn => { try { fn(); } catch (e) {} });
  }
  const onChange = fn => listeners.add(fn);
  const touch = (p = P()) => { if (p) p.updated = Date.now(); };

  const P = () => (db.active && db.profiles[db.active]) || null;
  const get = id => db.profiles[id];
  const otherId = (id = db.active) => id === 'meo' ? 'cho' : 'meo';
  const settings = () => db.settings;
  const member = id => MEMBERS[id];
  function setActive(id) { if (db.profiles[id]) { db.active = id; save(true); } }
  function finishSetup(o) {
    for (const id of IDS) {
      const p = db.profiles[id];
      if (o.names && o.names[id]) p.name = o.names[id];
      if (o.target) p.target = o.target;
      if (o.examDate != null) p.examDate = o.examDate;
    }
    db.me = o.me; db.active = o.me; db.setup = true;
    save(true);
  }

  const levelOf = xp => Math.floor(Math.sqrt(xp / 50)) + 1;
  const xpForLevel = lv => 50 * (lv - 1) * (lv - 1);
  const todayXP = (p = P()) => (p && p.days[U.dayKey()]) || 0;
  const weekXP = (p = P()) => U.sum(U.weekDays().map(k => (p && p.days[k]) || 0));

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
    ['goal', 'Đạt mục tiêu XP hôm nay', p => p.goal, p => todayXP(p)],
    ['rev20', 'Ôn 20 thẻ từ vựng', () => 20, (p, d) => d.reviews || 0],
    ['lesson', 'Học xong 1 bài từ vựng mới', () => 1, (p, d) => d.lessons || 0],
    ['sets', 'Làm 3 bộ câu hỏi Part 3, 4, 6 hoặc 7', () => 3, (p, d) => d.sets || 0],
    ['p5', 'Làm 15 câu Part 5', () => 15, (p, d) => d.p5 || 0],
    ['speak5', 'Đọc 5 câu đạt từ 80 điểm phát âm', () => 5, (p, d) => d.speakOk || 0],
    ['ok30', 'Trả lời đúng 30 câu', () => 30, (p, d) => d.ok || 0],
    ['combo8', 'Đúng 8 câu liên tiếp', () => 8, (p, d) => d.combo || 0],
    ['dict5', 'Nghe chép chính tả 5 câu', () => 5, (p, d) => d.dict || 0],
    ['lq10', 'Làm 10 câu Listening', () => 10, (p, d) => d.lq || 0]
  ];
  function dayRec(p = P()) {
    const k = U.dayKey();
    if (!p.daily[k]) {
      p.daily[k] = { claimed: {} };
      const keys = Object.keys(p.daily).sort();
      while (keys.length > 30) delete p.daily[keys.shift()];
    }
    return p.daily[k];
  }
  function quests(p = P()) {
    if (!p) return [];
    const d = dayRec(p);
    const canSpeak = typeof Speech !== 'undefined' && Speech.canListen() && settings().speakOn !== false;
    const pool = QUESTS.slice(1).filter(q => q[0] !== 'speak5' || canSpeak);
    const picked = d.qs ? d.qs.map(id => QUESTS.find(q => q[0] === id)).filter(Boolean) : U.sample(pool, 2, U.rng('q' + U.dayKey() + p.id));
    if (!d.qs) d.qs = picked.map(q => q[0]);
    return [QUESTS[0], ...picked].map(([id, t, tgt, cur]) => {
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
  function addXP(n) {
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
      const fr = quests(p).filter(q => q.done && !d.claimed[q.id]);
      if (!fr.length) break;
      for (const q of fr) { d.claimed[q.id] = Date.now(); got.push(q); p.xp += QUEST_XP; p.days[k] = (p.days[k] || 0) + QUEST_XP; }
      if (!sEvent) sEvent = touchStreak(p);
    }
    const after = levelOf(p.xp);
    const goalNow = todayXP(p) >= p.goal;
    touch(p);
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
  function addMinutes(min) {
    const p = P(); if (!p) return;
    const k = U.dayKey();
    p.mins[k] = Math.round(((p.mins[k] || 0) + min) * 10) / 10;
    save();
  }

  function record(part, ok, qid, tag) {
    const p = P(); if (!p) return;
    const r = p.parts[part];
    if (r) {
      r.n++; if (ok) r.ok++;
      r.h.push(ok ? 1 : 0);
      if (r.h.length > 80) r.h.splice(0, r.h.length - 80);
    }
    if (tag) {
      const t = p.tags[tag] = p.tags[tag] || { n: 0, ok: 0 };
      t.n++; if (ok) t.ok++;
    }
    if (qid) {
      p.seen[qid] = (p.seen[qid] || 0) + 1;
      if (!ok) p.miss[qid] = { n: ((p.miss[qid] && p.miss[qid].n) || 0) + 1, at: Date.now() };
      else if (p.miss[qid]) { p.miss[qid].n -= 1; if (p.miss[qid].n <= 0) delete p.miss[qid]; }
    }
    p.stats.ans++;
    const d = dayRec(p);
    if (part <= 4) d.lq = (d.lq || 0) + 1;
    if (part === 5) d.p5 = (d.p5 || 0) + 1;
    if (ok) { p.stats.ok++; d.ok = (d.ok || 0) + 1; }
    touch(p);
    addXP(0);
  }
  function markSeen(qid) { const p = P(); if (p && qid) p.seen[qid] = (p.seen[qid] || 0) + 1; }
  function addTest(t) {
    const p = P(); if (!p) return;
    p.tests.push(t);
    if (p.tests.length > 60) p.tests.splice(0, p.tests.length - 60);
    touch(p); save(true);
  }
  function noteSpeak(score, sounds, words) {
    const p = P(); if (!p) return;
    const s = p.speak;
    s.n++; s.sum += score; s.best = Math.max(s.best, score);
    for (const k of sounds || []) { const r = s.sounds[k] = s.sounds[k] || { n: 0, err: 0, at: 0 }; r.err++; r.at = Date.now(); }
    for (const [w, ok] of words || []) {
      const r = s.words[w] = s.words[w] || { n: 0, ok: 0 };
      r.n++; if (ok) r.ok++;
    }
    const keys = Object.keys(s.words);
    if (keys.length > 400) keys.sort((a, b) => s.words[a].n - s.words[b].n).slice(0, keys.length - 400).forEach(k => delete s.words[k]);
    p.stats.speak++;
    if (score >= 80) bump('speakOk');
    touch(p); save();
  }
  function soundTotals(p = P()) {
    return Object.entries((p && p.speak.sounds) || {}).sort((a, b) => b[1].err - a[1].err);
  }

  const BADGES = [
    ['first', 'sparkle', 'Khởi động', 'Hoàn thành bài học đầu tiên', p => p.stats.lessons >= 1],
    ['streak3', 'flame', 'Ba ngày liền', 'Chuỗi 3 ngày học liên tiếp', p => p.streak.best >= 3],
    ['streak7', 'flame', 'Một tuần bền bỉ', 'Chuỗi 7 ngày', p => p.streak.best >= 7],
    ['streak30', 'crown', 'Ba mươi ngày', 'Chuỗi 30 ngày', p => p.streak.best >= 30],
    ['streak100', 'crown', 'Trăm ngày', 'Chuỗi 100 ngày', p => p.streak.best >= 100],
    ['w100', 'cards', '100 từ', 'Đã học 100 từ', p => Object.keys(p.cards).length >= 100],
    ['w300', 'cards', '300 từ', 'Đã học 300 từ', p => Object.keys(p.cards).length >= 300],
    ['w600', 'library', '600 từ', 'Đã học 600 từ', p => Object.keys(p.cards).length >= 600],
    ['w1000', 'library', '1.000 từ', 'Đã học 1.000 từ', p => Object.keys(p.cards).length >= 1000],
    ['g10', 'blocks', 'Vững ngữ pháp', 'Học 10 chủ điểm ngữ pháp', p => Object.keys(p.grammar).length >= 10],
    ['g25', 'brain', 'Bậc thầy Part 5', 'Học 25 chủ điểm ngữ pháp', p => Object.keys(p.grammar).length >= 25],
    ['test1', 'exam', 'Đề đầu tiên', 'Làm xong một đề thi thử', p => p.tests.some(t => t.kind !== 'placement')],
    ['test10', 'exam', 'Cày đề', 'Làm 10 đề thi thử', p => p.tests.filter(t => t.kind !== 'placement').length >= 10],
    ['s700', 'medal', 'Mốc 700', 'Đạt 700 trong một đề đầy đủ hoặc rút gọn', p => p.tests.some(t => t.kind !== 'placement' && t.T >= 700)],
    ['s800', 'medal', 'Mốc 800', 'Đạt 800 trong một đề đầy đủ hoặc rút gọn', p => p.tests.some(t => t.kind !== 'placement' && t.T >= 800)],
    ['s900', 'trophy', 'Mốc 900', 'Đạt 900 trong một đề đầy đủ hoặc rút gọn', p => p.tests.some(t => t.kind !== 'placement' && t.T >= 900)],
    ['perfect', 'target', 'Không sai câu nào', 'Một bài học đúng 100%', p => p.stats.perfect >= 1],
    ['rev500', 'repeat', 'Ôn tập chăm', 'Ôn 500 lượt thẻ', p => p.stats.reviews >= 500],
    ['speak50', 'mic', 'Giọng tự tin', 'Luyện nói 50 câu', p => p.stats.speak >= 50],
    ['speak90', 'wave', 'Phát âm chuẩn', 'Đạt từ 90 điểm phát âm, không sai từ nào', p => p.speak.best >= 90],
    ['dict100', 'ear', 'Tai thính', 'Nghe chép 100 câu', p => p.stats.dict >= 100],
    ['xp2000', 'star', '2.000 XP', 'Tích lũy 2.000 XP', p => p.xp >= 2000],
    ['xp10000', 'star', '10.000 XP', 'Tích lũy 10.000 XP', p => p.xp >= 10000]
  ];
  function checkBadges() {
    const p = P(); if (!p) return [];
    const got = [];
    for (const [id, icon, name, desc, test] of BADGES) {
      if (!p.badges[id] && test(p)) { p.badges[id] = Date.now(); got.push({ id, icon, name, desc }); }
    }
    if (got.length) save();
    return got;
  }

  function hasData(p) { return !!(p && (p.xp > 0 || p.tests.length || Object.keys(p.cards).length)); }
  function snap(p = P()) {
    const keys = Array.from({ length: 35 }, (_, i) => U.addDays(U.dayKey(), -i));
    const days = {}, mins = {};
    keys.forEach(k => { if (p.days[k]) days[k] = p.days[k]; if (p.mins[k]) mins[k] = p.mins[k]; });
    const pred = typeof Score !== 'undefined' ? Score.predict(p) : null;
    return {
      v: 1, id: p.id, name: p.name, at: Date.now(), xp: p.xp, goal: p.goal, target: p.target, examDate: p.examDate,
      streak: { n: p.streak.n, best: p.streak.best, last: p.streak.last },
      days, mins, words: Object.keys(p.cards).length,
      known: Object.values(p.cards).filter(c => c.st === 2).length,
      grammar: Object.keys(p.grammar).length,
      pred: pred && pred.hasData ? { L: pred.L, R: pred.R, T: pred.T, conf: pred.conf } : null,
      tests: p.tests.filter(t => t.kind !== 'placement').slice(-10).map(t => ({ at: t.at, kind: t.kind, L: t.L, R: t.R, T: t.T })),
      parts: Object.fromEntries(Object.entries(p.parts).map(([k, r]) => [k, [r.h.filter(Boolean).length, r.h.length]])),
      badges: Object.keys(p.badges).length,
      speak: p.speak.n ? Math.round(p.speak.sum / p.speak.n) : 0
    };
  }
  function view(id) {
    const p = db.profiles[id];
    const s = db.snaps[id];
    const local = hasData(p) ? snap(p) : null;
    if (local && (!s || (p.updated || 0) >= (s.at || 0))) return Object.assign(local, { src: 'local' });
    if (s) return Object.assign({}, s, { name: p.name, src: 'snap' });
    return Object.assign(snap(p), { src: 'empty' });
  }
  async function shareCode(id = db.active) {
    const p = db.profiles[id];
    const notes = db.notes.filter(n => n.from === id && !n.sent);
    notes.forEach(n => n.sent = Date.now());
    save(true);
    return U.pack({ k: 'pawlish', s: snap(p), notes: notes.map(n => ({ text: n.text, at: n.at })) });
  }
  async function importCode(code) {
    const data = await U.unpack(code);
    if (!data || data.k !== 'pawlish' || !data.s || !IDS.includes(data.s.id)) throw new Error('Mã không hợp lệ');
    const id = data.s.id;
    const prev = db.snaps[id];
    if (prev && prev.at >= data.s.at) return { id, stale: true, name: data.s.name };
    db.snaps[id] = data.s;
    if (data.s.name) db.profiles[id].name = data.s.name;
    let added = 0;
    for (const n of data.notes || []) {
      if (!db.notes.some(x => x.from === id && x.at === n.at)) { db.notes.push({ from: id, to: otherId(id), text: n.text, at: n.at, read: false }); added++; }
    }
    save(true);
    return { id, stale: false, name: data.s.name, notes: added };
  }
  function addNote(text) {
    db.notes.push({ from: db.active, to: otherId(), text, at: Date.now(), read: false, sent: 0 });
    if (db.notes.length > 80) db.notes.splice(0, db.notes.length - 80);
    save(true);
  }
  function inbox(id = db.active) { return db.notes.filter(n => n.to === id).sort((a, b) => b.at - a.at); }

  function exportJSON() { return JSON.stringify(db); }
  function importJSON(text) {
    const d = JSON.parse(text);
    if (!d || !d.profiles || !d.profiles.meo || !d.profiles.cho) throw new Error('File sao lưu không hợp lệ');
    localStorage.setItem(KEY, JSON.stringify(d));
    load(); save(true);
  }
  function resetProfile(id) {
    const p = db.profiles[id]; if (!p) return;
    const b = blank(id);
    b.name = p.name; b.target = p.target; b.examDate = p.examDate; b.goal = p.goal;
    db.profiles[id] = b; save(true);
  }
  function resetAll() { localStorage.removeItem(KEY); db = fresh(); save(true); }

  load();
  return {
    MEMBERS, IDS, BADGES, QUESTS,
    get db() { return db; }, P, get, otherId, member, settings, setActive, finishSetup, save, onChange, touch,
    levelOf, xpForLevel, todayXP, weekXP, streakView, addXP, bump, addMinutes, takePending, quests, dayRec,
    record, markSeen, addTest, noteSpeak, soundTotals, checkBadges,
    hasData, snap, view, shareCode, importCode, addNote, inbox, exportJSON, importJSON, resetProfile, resetAll
  };
})();
