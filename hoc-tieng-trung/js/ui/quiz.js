const R = (() => {
  const { h, clear } = U;
  const KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

  function optList(q, ctx) {
    const wrap = h('div.opts' + (q.opts.some(o => o.emoji) ? '.two' : ''));
    const btns = q.opts.map((o, i) => {
      const b = h('button.opt' + (o.emoji ? '.emoji-opt' : ''), { type: 'button' },
        h('span.k', KEYS[i]),
        o.emoji ? h('span', o.t) : h('span' + (o.zh ? '.zh' : ''), o.t));
      b.addEventListener('click', () => choose(i));
      return b;
    });
    btns.forEach(b => wrap.appendChild(b));
    function paint() {
      btns.forEach((b, i) => {
        b.classList.remove('sel', 'right', 'wrong', 'dim');
        if (ctx.mode === 'exam' && ctx.value === i) b.classList.add('sel');
        if (ctx.mode === 'review' || ctx.locked) {
          if (i === q.ans) b.classList.add('right');
          else if (i === ctx.value) b.classList.add('wrong');
          else b.classList.add('dim');
          b.disabled = true;
        }
      });
    }
    function choose(i) {
      if (ctx.mode === 'review' || ctx.locked) return;
      if (ctx.mode === 'practice') { ctx.locked = true; ctx.value = i; paint(); ctx.onAnswer(i, i === q.ans); }
      else { ctx.value = i; paint(); FX.sfx.tap(); ctx.onAnswer(i); }
    }
    paint();
    wrap._choose = choose;
    return wrap;
  }

  function playLines(q) {
    if (q.lines) {
      const lines = q.lines.slice();
      if (q.q) lines.push({ who: null, text: '问：' + q.q });
      return lines;
    }
    return [{ who: null, text: q.audio }];
  }
  function listenBtn(q, ctx) {
    const limit = ctx.mode === 'exam' ? ctx.audioLimit || 0 : 0;
    let plays = ctx.plays || 0;
    const note = h('div.small.muted', limit ? `Còn ${Math.max(0, limit - plays)} lượt nghe` : '');
    const btn = UI.audioBtn(() => playLines(q), {
      big: true,
      onPlayed: () => {}
    });
    btn.addEventListener('click', () => {
      if (limit && plays >= limit) return;
      plays++; ctx.plays = plays; ctx.onPlay && ctx.onPlay(plays);
      note.textContent = limit ? `Còn ${Math.max(0, limit - plays)} lượt nghe` : '';
      if (limit && plays >= limit) setTimeout(() => btn.disabled = true, 50);
    }, true);
    if (limit && plays >= limit) btn.disabled = true;
    return h('div.col', { style: { alignItems: 'center', gap: '6px' } }, btn, note);
  }
  function transcript(q) {
    if (!q.lines) return null;
    return h('div.card.tint-indigo', { style: { padding: '12px', marginTop: '12px' } },
      h('div.small.muted', { style: { fontWeight: 700 } }, '📜 Lời thoại'),
      ...q.lines.map(l => h('div.dialog-line', l.who ? h('span.sp' + (l.who === '男' ? '.m' : ''), l.who) : null, h('span', l.text))),
      q.q ? h('div.dialog-line', h('span.sp', '问'), h('span', q.q)) : null,
      q.vi ? h('div.trans', '💬 ' + q.vi) : null);
  }
  function infoAfter(q) {
    const parts = [];
    if (q.lines) parts.push(transcript(q));
    else if (q.vi) parts.push(h('div.trans', '💬 ' + q.vi));
    if (q.explain) parts.push(h('div.explain', '💡 ' + q.explain));
    return parts;
  }

  function render(q, area, ctx) {
    clear(area);
    const box = h('div.page-enter');
    area.appendChild(box);
    const t = q.type;
    if (t === 'mc') {
      const pr = h('div.q-prompt',
        h('div.qtitle', q.title),
        q.bigAudio ? UI.audioBtn(q.audio, { big: true }) : null,
        q.main && !(q.bigAudio && q.kind !== 'tone') ? h('div' + (q.zh ? (q.small ? '.qsent' : '.qmain') : '.qmain.vi-main'), q.main) : null,
        q.sub ? h('div.qsub', q.sub) : null,
        !q.bigAudio && q.audio ? h('div.mt', UI.audioBtn(q.audio, { sm: true })) : null);
      box.append(pr, optList(q, ctx));
      if (q.autoplay && Store.settings().autoplay && ctx.mode !== 'review') setTimeout(() => Speech.speak(q.audio), 250);
    } else if (t === 'fill') {
      const blank = h('span.blank', ctx.value != null && q.opts[ctx.value] ? q.opts[ctx.value].t : '＿＿');
      const pr = h('div.q-prompt', h('div.qtitle', q.title), h('div.qsent', q.pre, blank, q.post));
      if (!ctx._base) ctx._base = ctx.onAnswer;
      ctx.onAnswer = (i, ok) => { blank.textContent = q.opts[i].t; ctx._base && ctx._base(i, ok); };
      box.append(pr, optList(q, ctx));
    } else if (t === 'listen' || t === 'pic') {
      box.append(h('div.q-prompt',
        h('div.qtitle', t === 'pic' ? 'Nghe câu, chọn tranh phù hợp' : 'Nghe rồi chọn đáp án đúng'),
        listenBtn(q, ctx),
        t === 'listen' && q.q && ctx.mode !== 'exam' ? h('div.qsent.mt', { style: { fontSize: '19px' } }, '问：' + q.q) : null,
        t === 'listen' && ctx.mode === 'exam' ? h('div.small.muted.mt', '👂 Câu hỏi được đọc ở cuối đoạn nghe') : null),
        optList(q, ctx));
      if (ctx.mode !== 'review' && ctx.autoListen && !(ctx.plays > 0)) setTimeout(() => { const b = box.querySelector('.audio-btn'); b && b.click(); }, 350);
    } else if (t === 'read') {
      box.append(h('div.qtitle.mb', { style: { fontWeight: 700 } }, 'Đọc đoạn văn rồi trả lời'),
        h('div.passage', q.passage),
        h('div.qsent.mb', { style: { fontSize: '19px', fontWeight: 500 } }, '★ ' + q.q),
        optList(q, ctx));
    } else if (t === 'reply') {
      box.append(h('div.q-prompt', h('div.qtitle', 'Chọn câu đáp phù hợp nhất'), h('div.qsent', q.prompt)), optList(q, ctx));
    } else if (t === 'charpick') {
      const blank = h('span.blank', { style: { position: 'relative' } }, h('span', { style: { position: 'absolute', top: '-22px', left: 0, right: 0, fontSize: '14px', fontFamily: 'var(--font)', fontWeight: 700, color: 'var(--indigo-d)' } }, q.py), ctx.mode === 'review' ? q.opts[q.ans].t : '＿');
      box.append(h('div.q-prompt', h('div.qtitle', 'Nhìn pinyin, chọn chữ Hán đúng'), h('div.qsent', { style: { marginTop: '18px' } }, q.pre, blank, q.post)), optList(q, ctx));
    } else if (t === 'para') {
      const pass = h('div.passage');
      const segs = q.passage.split(/\[(\d)\]/);
      for (let i = 0; i < segs.length; i++) {
        if (i % 2 === 0) pass.appendChild(document.createTextNode(segs[i]));
        else {
          const bi = +segs[i] - 1;
          if (!q.ask.includes(bi)) pass.appendChild(h('span.filled', q.sents[bi]));
          else pass.appendChild(h('span.gap' + (bi === q.blank ? '.cur' : ''), String(q.ask.indexOf(bi) + q.num - q.ask.indexOf(q.blank))));
        }
      }
      box.append(h('div.qtitle.mb', { style: { fontWeight: 700 } }, `Chọn câu phù hợp cho ô số ${q.num || ''}`), pass, optList(q, ctx));
    } else if (t === 'order') {
      box.append(orderUI(q, ctx));
    } else if (t === 'match') {
      box.append(matchUI(q, ctx));
    } else if (t === 'essay') {
      box.append(essayUI(q, ctx));
    }
    if (ctx.mode === 'review') box.append(...infoAfter(q));
    return box;
  }

  function orderUI(q, ctx) {
    const picked = Array.isArray(ctx.value) ? ctx.value.slice() : [];
    const area = h('div.order-area');
    const bank = h('div.order-bank');
    const wrap = h('div',
      h('div.q-prompt', h('div.qtitle', q.title || 'Sắp xếp thành câu đúng'),
        q.pic ? h('div', { style: { fontSize: '64px', lineHeight: 1.1 } }, q.pic) : null,
        q.given ? h('div', h('span.pill.info', { style: { fontSize: '16px' } }, h('span.zh', q.given))) : null),
      area, bank);
    const used = new Array(q.tokens.length).fill(false);
    const placedIdx = [];
    if (picked.length) {
      for (const t of picked) { const i = q.tokens.findIndex((x, k) => x === t && !used[k]); if (i >= 0) { used[i] = true; placedIdx.push(i); } }
    }
    let checkBtn = null;
    function paint() {
      clear(area); clear(bank);
      placedIdx.forEach((ti, pos) => area.appendChild(h('button.tok', { onclick: () => { if (lockedNow()) return; used[ti] = false; placedIdx.splice(pos, 1); FX.sfx.tap(); changed(); } }, q.tokens[ti])));
      if (placedIdx.length === q.tokens.length) area.appendChild(h('span.zh', { style: { fontSize: '21px', alignSelf: 'center' } }, q.end || '。'));
      q.tokens.forEach((t, ti) => bank.appendChild(h('button.tok' + (used[ti] ? '.used' : ''), { onclick: () => { if (lockedNow() || used[ti]) return; used[ti] = true; placedIdx.push(ti); FX.sfx.tap(); changed(); } }, t)));
      if (ctx.mode === 'review') {
        const ok = placedIdx.map(i => q.tokens[i]).join('') === q.answer.join('');
        area.classList.add(ok ? 'right' : 'wrong');
      }
      if (checkBtn) checkBtn.disabled = placedIdx.length !== q.tokens.length;
    }
    const lockedNow = () => ctx.mode === 'review' || ctx.locked;
    function changed() {
      paint();
      const val = placedIdx.map(i => q.tokens[i]);
      if (ctx.mode === 'exam') { ctx.value = val; ctx.onAnswer(val); }
    }
    if (ctx.mode === 'practice') {
      checkBtn = h('button.btn.leaf.block.mt', {
        disabled: true, onclick: () => {
          const val = placedIdx.map(i => q.tokens[i]);
          const ok = val.join('') === q.answer.join('');
          ctx.locked = true; ctx.value = val;
          area.classList.add(ok ? 'right' : 'wrong');
          checkBtn.remove();
          ctx.onAnswer(val, ok);
        }
      }, 'Kiểm tra ✓');
      wrap.appendChild(checkBtn);
    }
    if (ctx.mode === 'review') wrap.appendChild(h('div.trans', '✅ ' + q.answer.join('') + (q.end || '。') + (q.vi ? '  ·  ' + q.vi : '')));
    paint();
    return wrap;
  }

  function matchUI(q, ctx) {
    const left = U.shuffle(q.pairs), right = U.shuffle(q.pairs);
    let selL = null, selR = null, done = 0, mistakes = 0;
    const grid = h('div.match-grid');
    const lb = left.map(p => h('button.match-item', { onclick: () => pickSide('L', p, lb[left.indexOf(p)]) }, h('span.zh', p.hz)));
    const rb = right.map(p => h('button.match-item', { onclick: () => pickSide('R', p, rb[right.indexOf(p)]) }, p.vi));
    for (let i = 0; i < left.length; i++) { grid.appendChild(lb[i]); grid.appendChild(rb[i]); }
    function pickSide(side, p, el) {
      if (el.classList.contains('ok')) return;
      if (side === 'L') { lb.forEach(b => b.classList.remove('sel')); selL = { p, el }; Speech.speak(p.hz); }
      else { rb.forEach(b => b.classList.remove('sel')); selR = { p, el }; }
      el.classList.add('sel');
      if (selL && selR) {
        const a = selL, b = selR; selL = selR = null;
        if (a.p.id === b.p.id) {
          a.el.classList.remove('sel'); b.el.classList.remove('sel');
          a.el.classList.add('ok'); b.el.classList.add('ok');
          FX.sfx.ok(); done++;
          if (done === q.pairs.length) setTimeout(() => ctx.onAnswer(null, mistakes === 0, { mistakes }), 350);
        } else {
          mistakes++; FX.sfx.bad();
          [a.el, b.el].forEach(x => { x.classList.remove('sel'); x.classList.add('no'); setTimeout(() => x.classList.remove('no'), 450); });
        }
      }
    }
    return h('div', h('div.q-prompt', h('div.qtitle', q.title)), grid);
  }

  function essayUI(q, ctx) {
    const val = ctx.value || { text: '', rubric: {} };
    const ta = h('textarea.essay', { placeholder: 'Gõ tiếng Trung tại đây (dùng bộ gõ pinyin)…', disabled: ctx.mode === 'review' });
    ta.value = val.text || '';
    const meter = h('div.row.wrap.small', { style: { fontWeight: 600, marginTop: '6px' } });
    const paintMeter = () => {
      const au = Exam.essayAuto(ta.value);
      clear(meter);
      meter.append(h('span.pill' + (au.n >= 80 ? '.ok' : '.warn'), `${au.n}/80 chữ`), h('span.pill' + (au.found.length >= 3 ? '.ok' : '.warn'), `Liên từ: ${au.found.length ? au.found.join(' · ') : 'chưa có'}`));
    };
    ta.addEventListener('input', () => { val.text = ta.value; paintMeter(); ctx.value = val; ctx.onAnswer && ctx.onAnswer(val); });
    paintMeter();
    const rub = h('div.rubric.card.tint-leaf', { style: { marginTop: '12px', padding: '12px' } },
      h('div', { style: { fontWeight: 700 } }, '🧾 Tự đánh giá (trung thực nhé!)'),
      ...[['topic', 'Bài viết đúng chủ đề, có mở – thân – kết'], ['clean', 'Mình đã đọc lại, không sai chữ / ngữ pháp lớn']].map(([k, label]) => {
        const cb = h('input', { type: 'checkbox', disabled: ctx.mode === 'review' });
        cb.checked = !!(val.rubric && val.rubric[k]);
        cb.addEventListener('change', () => { val.rubric = val.rubric || {}; val.rubric[k] = cb.checked; ctx.value = val; ctx.onAnswer && ctx.onAnswer(val); });
        return h('label', cb, label);
      }));
    return h('div',
      h('div.q-prompt', h('div.qtitle', 'Viết đoạn văn'), h('div.qsent', { style: { fontSize: '20px' } }, q.prompt), h('div.qsub', q.promptVi)),
      h('div.small.muted', { style: { fontWeight: 500, marginBottom: '6px' } }, '💡 Khung gợi ý: 1 câu mở → 3–4 câu thân bài có 首先 / 其次 / 另外 / 因为…所以… → 1 câu kết cảm nghĩ.'),
      ta, meter, rub,
      ctx.mode === 'review' ? h('div.card.tint-sky', { style: { marginTop: '12px' } }, h('b', '📌 Bài mẫu tham khảo'), h('p.zh', { style: { fontSize: '18px', lineHeight: 1.9 } }, q.model)) : null);
  }

  function runner(root, opts) {
    const queue = opts.questions.map((q, i) => ({ q, i }));
    const total = queue.length;
    const firstRes = {};
    let doneN = 0, combo = 0, maxCombo = 0, startAt = Date.now();
    clear(root);
    const bar = U.h('div.progress', U.h('i', { style: { width: '0%' } }));
    const comboEl = h('div.combo', '');
    const top = h('div.quiz-top',
      h('button.btn.ghost.icon.sm', { onclick: async () => { if (await FX.confirm('Dừng bài này?', 'Tiến độ bài đang làm sẽ không được lưu.', 'Dừng', 'Học tiếp')) { Speech.stop(); opts.onExit ? opts.onExit() : history.back(); } } }, '✕'),
      bar, comboEl);
    const area = h('div');
    const fb = h('div.feedback');
    root.append(top, area);
    document.body.appendChild(fb);
    const keyH = e => {
      if (fb.classList.contains('show') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); fb.querySelector('.btn').click(); return; }
      const n = parseInt(e.key, 10);
      const ol = area.querySelector('.opts');
      if (n >= 1 && n <= 6 && ol && ol._choose) ol._choose(n - 1);
    };
    document.addEventListener('keydown', keyH);
    const cleanup = () => { document.removeEventListener('keydown', keyH); fb.remove(); };
    root._cleanup = cleanup;

    function next() {
      fb.classList.remove('show', 'bad');
      if (!queue.length) return finish();
      const { q, i } = queue[0];
      const ctx = { mode: 'practice', autoListen: true };
      ctx.onAnswer = (val, ok, extra) => answered(q, i, ok, extra);
      render(q, area, ctx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function answered(q, i, ok, extra) {
      queue.shift();
      if (!(i in firstRes)) firstRes[i] = ok;
      Store.countAnswer(ok);
      if (ok) {
        doneN++; combo++; maxCombo = Math.max(maxCombo, combo);
        FX.sfx.ok();
        if (combo >= 3) { U.clear(comboEl); comboEl.append(Icon.svg('flame'), ' x' + combo); comboEl.classList.remove('hot'); void comboEl.offsetWidth; comboEl.classList.add('hot'); FX.sfx.combo(combo); }
        if (combo === 3 || combo === 5 || combo % 10 === 0) { FX.banner(combo + ' câu đúng liên tiếp', combo >= 10 ? 'Phong độ rất ổn định' : combo >= 5 ? 'Đang vào guồng' : 'Combo'); if (combo >= 5) FX.confetti({ n: 50, y: innerHeight * 0.22 }); }
        bar.classList.remove('glow'); void bar.offsetWidth; bar.classList.add('glow');
        setTimeout(() => { const el = area.querySelector('.opt.right, .tone-btn.right, .order-area.right, .match-grid'); if (el) FX.burstAt(el, 18); }, 40);
      } else {
        combo = 0; comboEl.textContent = '';
        FX.sfx.bad();
        const copy = Object.assign({}, q);
        if (copy.opts) {
          const r2 = U.rng(Math.random() * 1e9);
          const right = copy.opts[copy.ans];
          copy.opts = U.shuffle(copy.opts, r2); copy.ans = copy.opts.indexOf(right);
        }
        if (copy.tokens) copy.tokens = U.shuffle(copy.tokens);
        queue.splice(Math.min(queue.length, 2 + Math.floor(Math.random() * 3)), 0, { q: copy, i });
      }
      bar.firstChild.style.width = Math.round(doneN / total * 100) + '%';
      showFeedback(q, ok, extra);
      if (q.audioAfter && ok) setTimeout(() => Speech.speak(q.audioAfter), 200);
    }
    function showFeedback(q, ok, extra) {
      clear(fb);
      const right = q.opts ? q.opts[q.ans] : null;
      let body = null;
      if (q.type === 'match') body = ok ? 'Ghép đúng hết rồi!' : `Hoàn thành (sai ${extra ? extra.mistakes : 0} lần ghép)`;
      else if (q.type === 'order') body = h('span', h('span.zh', q.answer.join('') + (q.end || '。')), q.vi ? h('div', q.vi) : null);
      else {
        body = h('div',
          !ok && right ? h('div', 'Đáp án đúng: ', h('b' + (right.zh ? '.zh' : ''), right.t)) : null,
          q.note ? h('div' + (/[㐀-鿿]/.test(q.note) ? '.zh' : ''), q.note) : null,
          q.vi ? h('div', '💬 ' + q.vi) : null,
          q.explain ? h('div', '💡 ' + q.explain) : null);
      }
      const pool = ok ? HSK.cheers : HSK.comforts;
      fb.appendChild(h('div.fb-in',
        h('div.fb-cat', FX.mascot(ok ? 'happy' : 'think', 'xs')),
        h('div.grow', h('div.fb-title', U.pick(pool)), h('div.fb-body', body)),
        h('button.btn' + (ok ? '.leaf' : '.red'), { onclick: () => { FX.sfx.tap(); next(); } }, 'Tiếp tục')));
      fb.classList.toggle('bad', !ok);
      requestAnimationFrame(() => fb.classList.add('show'));
    }
    function finish() {
      cleanup();
      const n = Object.keys(firstRes).length;
      const right = Object.values(firstRes).filter(Boolean).length;
      const perWord = {};
      opts.questions.forEach((q, i) => {
        if (!q.word) return;
        perWord[q.word] = perWord[q.word] || { ok: 0, bad: 0 };
        if (firstRes[i]) perWord[q.word].ok++; else perWord[q.word].bad++;
      });
      const mins = Math.max(1, Math.round((Date.now() - startAt) / 60000));
      Store.addMinutes(mins);
      opts.onFinish({ total: n, right, acc: n ? right / n : 0, maxCombo, perWord, secs: Math.round((Date.now() - startAt) / 1000), firstRes });
    }
    next();
    return { cleanup };
  }

  function resultScreen(root, res, opts = {}) {
    clear(root);
    const acc = res.acc;
    const st = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
    const mood = acc >= 0.7 ? 'wow' : 'happy';
    const seal = acc >= 0.9 ? ['优', ''] : acc >= 0.7 ? ['良', '.jade'] : ['进', '.gold'];
    const p = Store.P();
    const accEl = h('b', '0%'), xpEl = h('b', '+0');
    const title = opts.title || (acc >= 0.999 && (res.total || 0) >= 5 ? 'Hoàn hảo!' : acc >= 0.9 ? 'Xuất sắc!' : acc >= 0.7 ? 'Làm tốt lắm!' : 'Hoàn thành rồi!');
    const line = res.total ? res.right + '/' + res.total + ' câu đúng ngay lần đầu' + (res.secs ? ' · ' + U.fmtDur(res.secs) : '') : (p ? 'Tiếp tục giữ nhịp nhé, ' + p.name + '.' : '');
    const box = h('div.result-wrap.page-enter',
      h('div.result-hero', FX.mascot(mood, 'lg'), h('span.seal.res-seal' + seal[1], seal[0])),
      h('h1.res-title', title),
      line ? h('p.res-line', line) : null,
      opts.hideStars ? null : h('div.result-stars', [0, 1, 2].map(i => h('span' + (i < st ? '' : '.off'), '⭐'))),
      h('div.stat-row.res-stats',
        h('div.stat.leaf', accEl, h('span', 'Chính xác')),
        h('div.stat.gold', xpEl, h('span', 'XP nhận được')),
        h('div.stat.jade', h('b', res.maxCombo != null ? 'x' + res.maxCombo : U.fmtDur(res.secs || 0)), h('span', res.maxCombo != null ? 'Combo cao nhất' : 'Thời gian'))),
      opts.extra || null,
      h('div.col.mt', ...(opts.buttons || [])));
    root.appendChild(box);
    FX.sfx.done();
    setTimeout(() => FX.sfx.stamp(), 620);
    FX.countUp(accEl, Math.round(acc * 100), { suffix: '%', dur: 900, delay: 700 });
    FX.countUp(xpEl, opts.xp || 0, { prefix: '+', dur: 900, delay: 850, ticks: true });
    setTimeout(() => FX.confetti({ n: acc >= 0.9 ? 180 : 100 }), 650);
    return st;
  }

  return { render, runner, resultScreen, optList, transcript, infoAfter };
})();
