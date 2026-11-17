const Quiz = (() => {
  const { h } = U;
  const ic = n => Icon.svg(n);
  const normT = s => String(s).toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' -]/g, '').replace(/\s+/g, ' ').trim();

  function run(root, o) {
    UI.focus(true);
    const queue = o.items.slice();
    const total = queue.filter(x => x.type !== 'intro').length;
    let idx = 0, doneN = 0, combo = 0, maxCombo = 0, okFirst = 0, scored = 0, xp = 0, ended = false;
    const t0 = Date.now();
    const seen = new Set();
    const mistakes = [];
    let speakOff = false;
    const bar = UI.bar(0, 'thick');
    const cnt = h('span.cnt', '0/' + total);
    const head = h('div.run-head', h('button.icon-btn.ghost', { title: 'Thoát', onclick: exit }, ic('x')), bar, cnt);
    const body = h('div.run-body');
    const wrap = h('div.runner', head, body);
    root.appendChild(wrap);
    const foot = h('div.q-foot');
    document.body.appendChild(foot);
    let cur = null, state = 'answer';

    async function exit() {
      if (ended) return o.onExit ? o.onExit() : App.go(o.exitTo || 'home');
      if (doneN > 0 && !(await FX.confirm('Dừng bài này?', 'Tiến độ các câu đã làm vẫn được lưu.', 'Dừng', 'Học tiếp'))) return;
      finish(true);
    }
    function setProgress() {
      bar.firstChild.style.width = (total ? doneN / total * 100 : 0) + '%';
      bar.classList.toggle('hot', combo >= 5);
      cnt.textContent = doneN + '/' + total;
    }
    function footAnswer(canCheck, label = 'Kiểm tra') {
      U.clear(foot); foot.className = 'q-foot';
      const skip = cur && cur.item.type === 'speak' ? h('button.btn.ghost', { onclick: skipSpeak }, 'Lúc này không nói được') : cur && cur.item.type !== 'intro' && cur.item.type !== 'match' ? h('button.btn.ghost', { onclick: () => check(true) }, 'Bỏ qua') : null;
      const b = h('button.btn.lg', { disabled: !canCheck, onclick: () => cur.item.type === 'intro' ? next() : check() }, label);
      foot.appendChild(h('div.q-foot-in', skip, h('div.grow'), b));
      foot._btn = b;
    }
    function enableCheck(v = true) { if (foot._btn) foot._btn.disabled = !v; }
    function footResult(ok, item, res) {
      U.clear(foot);
      foot.className = 'q-foot ' + (ok ? 'ok' : 'bad');
      const why = res.why || item.why;
      const right = res.right != null ? res.right : null;
      const b = h('button.btn.lg' + (ok ? '.ok' : '.bad'), { onclick: next }, 'Tiếp tục');
      foot.appendChild(h('div.q-foot-in',
        h('div.fb', h('div.fi', ic(ok ? 'check' : 'x')), h('div.grow', h('b', ok ? U.pick(['Chính xác', 'Tốt lắm', 'Đúng rồi', 'Rất chuẩn']) : 'Chưa đúng'), right && !ok ? h('div.ex', 'Đáp án: ', h('b', { style: { display: 'inline', fontSize: 'inherit' } }, right)) : null, why ? h('div.ex', U.rich(why)) : null)),
        b));
      setTimeout(() => b.focus({ preventScroll: true }), 50);
    }
    function render() {
      Speech.stop();
      U.clear(body);
      if (idx >= queue.length) return finish();
      const item = queue[idx];
      state = 'answer';
      cur = { item, ...build(item) };
      body.appendChild(h('div.page-enter', cur.el));
      footAnswer(item.type === 'intro', item.type === 'intro' ? 'Tiếp tục' : 'Kiểm tra');
      if (item.type === 'match' || item.type === 'speak') U.clear(foot), foot.className = 'q-foot', footAnswer(false, item.type === 'speak' ? 'Tiếp tục' : 'Kiểm tra');
      if (item.autoplay !== false && cur.play) setTimeout(() => cur.play(), 300);
    }
    function build(item) {
      const t = item.type;
      if (t === 'intro') return buildIntro(item);
      if (t === 'type') return buildType(item);
      if (t === 'order') return buildOrder(item);
      if (t === 'match') return buildMatch(item);
      if (t === 'speak') return buildSpeak(item);
      return buildChoice(item);
    }
    function buildIntro(item) {
      const w = item.word;
      const el = h('div.col.g16',
        h('div.q-kind', ic('sparkle'), 'Từ mới'),
        h('div.card.pad-l', UI.wordDetail(w)));
      return { el, play: () => Speech.speak(w.w) };
    }
    function buildChoice(item) {
      let pick = null;
      const q = item.q || item;
      const kids = [];
      kids.push(h('div.q-kind', item.kindIcon ? ic(item.kindIcon) : null, item.kind || 'Chọn đáp án đúng'));
      if (item.title) kids.push(h('div.q-title', item.title));
      if (t1(item) === 'p1') kids.push(Items.p1Visual(q));
      let pl = null;
      const audioLines = item.lines || (item.type === 'p1' || item.type === 'p2' ? Items.linesOf(q) : null);
      if (audioLines) { pl = Player.create({ lines: audioLines, seed: q.id || 'x', showText: false, noTranscript: true, gap: 700 }); kids.push(h('div.mt', pl.el)); }
      else if (item.audio) kids.push(h('div.row', { style: { justifyContent: item.word ? 'flex-start' : 'center', margin: '4px 0 18px' } }, UI.audioBtn(item.audio, { size: 'lg' }), item.slowAudio !== false ? UI.audioBtn(item.audio, { rate: .7, title: 'Nghe chậm' }) : null));
      if (item.word) kids.push(h('div', { style: { marginBottom: '20px' } }, h('div.q-word', item.word), item.sub ? h('div.ipa', { style: { fontSize: '17px', marginTop: '4px' } }, item.sub) : null));
      if (item.sent) {
        const s = h('div.q-sent');
        String(item.sent).split(/_{3,}/).forEach((part, i, arr) => { s.appendChild(document.createTextNode(part)); if (i < arr.length - 1) s.appendChild(h('span.gap', ' ')); });
        kids.push(s);
      }
      if (item.vi) kids.push(h('div.muted', { style: { marginTop: '-10px', marginBottom: '16px' } }, item.vi));
      const hideText = item.type === 'p1' || item.type === 'p2';
      const opts = h('div.opts' + (q.opts.length === 3 || hideText ? '' : ''));
      q.opts.forEach((txt, i) => {
        const b = h('button.opt', { type: 'button' }, h('span.k', String.fromCharCode(65 + i)), h('div.grow', hideText ? h('span.muted', 'Đáp án ' + U.LET[i]) : txt));
        b.addEventListener('click', () => {
          if (state !== 'answer') return;
          pick = i;
          [...opts.children].forEach((x, k) => x.classList.toggle('sel', k === i));
          enableCheck(true);
          if (item.sent) { const g = kidsEl.querySelector('.gap'); if (g) g.textContent = txt; }
          FX.sfx.tap();
        });
        b.addEventListener('dblclick', () => { if (state === 'answer') check(); });
        opts.appendChild(b);
      });
      kids.push(opts);
      const kidsEl = h('div', kids);
      return {
        el: kidsEl,
        play: pl ? () => pl.play() : item.audio && item.autoplayAudio !== false ? () => Speech.speak(item.audio) : null,
        key: k => { const n = +k - 1; if (n >= 0 && n < q.opts.length) opts.children[n].click(); },
        check: () => {
          if (pl) pl.stop();
          [...opts.children].forEach((x, k) => { x.disabled = true; x.classList.remove('sel'); if (k === q.ans) x.classList.add('right'); else if (k === pick) x.classList.add('wrong'); else x.classList.add('dim'); });
          if (hideText) [...opts.children].forEach((x, k) => { const g = x.querySelector('.grow'); U.clear(g); g.appendChild(h('div', q.opts[k])); if (q.whys && q.whys[k] && k !== q.ans) g.appendChild(h('div.why-x', q.whys[k])); });
          if (pl) pl.setShown(true);
          if (item.sent) { const g = kidsEl.querySelector('.gap'); if (g) g.textContent = q.opts[q.ans]; }
          return { ok: pick === q.ans, why: q.why, right: q.opts[q.ans] };
        },
        has: () => pick != null
      };
    }
    function t1(item) { return item.type; }
    function buildType(item) {
      const inp = h('input.input.big', { autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: 'Gõ từ bạn nghe được' });
      inp.addEventListener('input', () => enableCheck(inp.value.trim().length > 0));
      inp.addEventListener('keydown', e => { if (e.key === 'Enter' && inp.value.trim()) { e.preventDefault(); e.stopPropagation(); state === 'answer' ? check() : next(); } });
      const el = h('div',
        h('div.q-kind', ic('headphones'), item.kind || 'Nghe và viết'),
        h('div.q-title', item.title || 'Nghe và gõ lại từ'),
        h('div.row', { style: { justifyContent: 'center', margin: '6px 0 14px' } }, UI.audioBtn(item.audio, { size: 'lg' }), UI.audioBtn(item.audio, { rate: .65, title: 'Nghe chậm' })),
        item.hint ? h('div.center.muted', { style: { marginBottom: '12px' } }, item.hint) : null,
        h('div.letters', [...item.answer].map(c => h('span', c === ' ' ? ' ' : ''))),
        inp);
      setTimeout(() => inp.focus(), 350);
      return {
        el, play: () => Speech.speak(item.audio),
        check: () => {
          const a = normT(inp.value), b = normT(item.answer);
          const d = U.lev(a, b);
          const ok = a === b || (b.length >= 6 && d === 1);
          inp.classList.add(ok ? 'ok' : 'bad'); inp.disabled = true;
          return { ok, right: item.answer, why: (ok && a !== b ? 'Gần đúng, chú ý chính tả: **' + item.answer + '**. ' : '') + (item.why || '') };
        },
        has: () => inp.value.trim().length > 0
      };
    }
    function buildOrder(item) {
      const tiles = U.shuffle(item.tiles.map((t, i) => ({ t, i })));
      const ans = h('div.tiles.answer');
      const bank = h('div.tiles');
      const chosen = [];
      function draw() {
        U.clear(ans); U.clear(bank);
        chosen.forEach((c, k) => ans.appendChild(h('button.wtile', { onclick: () => { chosen.splice(k, 1); draw(); FX.sfx.tap(); } }, c.t)));
        tiles.forEach(c => bank.appendChild(h('button.wtile' + (chosen.includes(c) ? '.used' : ''), { onclick: () => { if (!chosen.includes(c)) { chosen.push(c); draw(); FX.sfx.tap(); } } }, c.t)));
        enableCheck(chosen.length === tiles.length);
      }
      draw();
      const el = h('div',
        h('div.q-kind', ic('layers'), item.kind || 'Sắp xếp câu'),
        h('div.q-title', item.title || 'Sắp xếp thành câu đúng'),
        item.audio ? h('div.row', { style: { margin: '0 0 14px' } }, UI.audioBtn(item.audio, { size: 'lg' }), UI.audioBtn(item.audio, { rate: .7 })) : null,
        item.trans ? h('div.callout', ic('message'), h('div', item.trans)) : null,
        h('div.mt', ans), bank);
      return {
        el, play: item.audio ? () => Speech.speak(item.audio) : null,
        check: () => {
          const got = chosen.map(c => c.t).join(' ');
          const want = item.answer.join(' ');
          const ok = normT(got) === normT(want);
          [...ans.children].forEach(x => x.disabled = true);
          [...bank.children].forEach(x => x.disabled = true);
          if (item.audio) Speech.speak(item.audio);
          return { ok, right: want, why: item.why };
        },
        has: () => chosen.length === tiles.length
      };
    }
    function buildMatch(item) {
      let wrongs = 0, left = null, right = null, remain = item.pairs.length;
      const L = U.shuffle(item.pairs.map((p, i) => ({ t: p[0], i }))), R = U.shuffle(item.pairs.map((p, i) => ({ t: p[1], i })));
      const colL = h('div.col'), colR = h('div.col');
      function attempt() {
        if (!left || !right) return;
        const a = left, b = right;
        left = right = null;
        if (a._d.i === b._d.i) {
          FX.sfx.ok(); Speech.speak(a._d.t);
          a.classList.add('right'); b.classList.add('right');
          setTimeout(() => { a.classList.add('done'); b.classList.add('done'); }, 280);
          remain--;
          if (!remain) setTimeout(() => check(), 450);
        } else {
          wrongs++; FX.sfx.bad();
          a.classList.add('wrong'); b.classList.add('wrong');
          setTimeout(() => { a.classList.remove('wrong', 'sel'); b.classList.remove('wrong', 'sel'); }, 450);
        }
      }
      L.forEach(d => { const b = h('button.opt', d.t); b._d = d; b.addEventListener('click', () => { [...colL.children].forEach(x => x.classList.remove('sel')); b.classList.add('sel'); left = b; attempt(); }); colL.appendChild(b); });
      R.forEach(d => { const b = h('button.opt', d.t); b._d = d; b.addEventListener('click', () => { [...colR.children].forEach(x => x.classList.remove('sel')); b.classList.add('sel'); right = b; attempt(); }); colR.appendChild(b); });
      const el = h('div', h('div.q-kind', ic('grid'), 'Ghép cặp'), h('div.q-title', item.title || 'Ghép từ với nghĩa'), h('div.match', colL, colR));
      return { el, check: () => ({ ok: wrongs === 0, why: wrongs ? 'Có ' + wrongs + ' lần ghép nhầm.' : '' }), has: () => !remain };
    }
    function buildSpeak(item) {
      const panel = Pron.panel(item.text, { ipa: item.ipa, vi: item.vi, xp: false, onScore: r => { cur.score = r.overall; enableCheck(true); foot._btn.textContent = r.overall >= 70 ? 'Tiếp tục' : 'Tiếp tục (chưa đạt)'; } });
      const el = h('div', h('div.q-kind', ic('mic'), h('span', 'Nói'), h('span.pill.ai', ic('ai'), 'AI chấm')), h('div.q-title', item.title || 'Đọc to câu sau'), panel);
      return { el, check: () => ({ ok: (cur.score || 0) >= 70, why: (cur.score || 0) >= 70 ? 'Điểm phát âm ' + cur.score + '/100.' : 'Điểm ' + (cur.score || 0) + '/100. Cần từ 70 trở lên, lần sau thử đọc chậm và rõ âm cuối hơn.' }), has: () => cur.score != null };
    }
    function skipSpeak() {
      speakOff = true;
      for (let k = queue.length - 1; k > idx; k--) if (queue[k].type === 'speak') queue.splice(k, 1);
      queue.splice(idx, 1);
      doneN = Math.min(doneN, total);
      render();
    }
    function check(skipped) {
      if (state !== 'answer' || !cur) return;
      const item = cur.item;
      if (!skipped && cur.has && !cur.has()) return;
      state = 'result';
      const res = skipped ? Object.assign(cur.check ? cur.check() : {}, { ok: false }) : cur.check();
      const ok = !!res.ok;
      const first = !seen.has(item);
      seen.add(item);
      if (first && item.type !== 'speak') {
        scored++;
        if (ok) { okFirst++; xp += o.xpPer || 2; }
        o.onAnswer && o.onAnswer(item, ok);
      }
      if (item.type === 'speak' && ok) xp += 3;
      if (ok) {
        doneN++; combo++; maxCombo = Math.max(maxCombo, combo);
        FX.sfx.ok();
        if (combo === 5 || combo === 10 || combo === 15 || (combo > 15 && combo % 10 === 0)) { FX.banner(combo + ' câu liên tiếp', combo >= 10 ? 'Không thể cản nổi' : 'Đang vào guồng'); FX.sfx.combo(combo); }
      } else {
        combo = 0; FX.sfx.bad();
        if (first) mistakes.push(item);
        if (o.requeue !== false && item.type !== 'speak' && item.type !== 'match' && !item._rq) { item._rq = 1; queue.push(item); }
        else doneN++;
      }
      Store.bump('combo', maxCombo, true);
      setProgress();
      footResult(ok, item, res);
    }
    function next() {
      if (cur && cur.item.type === 'intro') { doneN += 0; }
      idx++;
      render();
    }
    function finish(early) {
      ended = true;
      document.removeEventListener('keydown', onKey);
      Speech.stop();
      foot.remove();
      U.clear(body);
      head.style.visibility = 'hidden';
      const acc = scored ? okFirst / scored : 0;
      const perfect = !early && scored >= 5 && okFirst === scored;
      if (!early && scored) xp += o.bonus != null ? o.bonus : 5;
      if (perfect) { xp += 5; Store.P().stats.perfect++; Store.bump('perfect'); }
      const secs = Math.round((Date.now() - t0) / 1000);
      const result = { early, acc, okFirst, scored, xp, perfect, secs, maxCombo, mistakes, speakOff };
      if (o.onDone) o.onDone(result);
      const m = Store.db.active === 'cho' ? 'dog' : 'cat';
      const pct = Math.round(acc * 100);
      body.appendChild(h('div.col.g16.page-enter', { style: { alignItems: 'center', textAlign: 'center', paddingTop: '10px' } },
        Art.mascot(m, pct >= 80 ? 'happy' : pct >= 50 ? 'think' : 'sad', 'lg'),
        h('h1', { style: { fontSize: '28px', fontWeight: 800 } }, early ? 'Đã lưu phần đã làm' : perfect ? 'Hoàn hảo, không sai câu nào' : pct >= 80 ? 'Làm tốt lắm' : pct >= 50 ? 'Ổn rồi, ôn lại chỗ sai nhé' : 'Đừng nản, lần sau sẽ tốt hơn'),
        o.title ? h('div.muted', o.title) : null,
        h('div.grid.g3', { style: { width: '100%', maxWidth: '520px', marginTop: '8px' } },
          h('div.stat-tile', h('div.stat', h('div.v', { style: { color: 'var(--gold-d)' } }, '+' + xp), h('div.k', 'XP'))),
          h('div.stat-tile', h('div.stat', h('div.v', { style: { color: pct >= 80 ? 'var(--ok)' : pct >= 50 ? 'var(--warn-d)' : 'var(--bad)' } }, pct + '%'), h('div.k', 'Đúng ngay lần đầu'))),
          h('div.stat-tile', h('div.stat', h('div.v', U.fmtDur(secs)), h('div.k', 'Thời gian')))),
        mistakes.length ? h('div.card', { style: { width: '100%', maxWidth: '620px', textAlign: 'left' } }, h('div.card-h', h('h3', 'Câu cần xem lại'), h('span.pill.bad.r', mistakes.length)), h('div.list', mistakes.slice(0, 8).map(it => h('div.li', h('span.tile-ic.sm.bad', ic('x')), h('div.grow', h('div.t', mistakeLabel(it)), it.why || (it.q && it.q.why) ? h('div.d', U.rich(it.why || it.q.why)) : null))))) : null,
        h('div.row.wrap', { style: { justifyContent: 'center', marginTop: '6px' } },
          o.again ? h('button.btn.secondary.lg', { onclick: o.again }, ic('refresh'), 'Làm lượt mới') : null,
          h('button.btn.lg', { onclick: () => o.onExit ? o.onExit() : App.go(o.exitTo || 'home') }, 'Xong'))));
      if (!early || xp) setTimeout(() => { if (xp) UI.award(xp); else UI.celebrate(); FX.sfx.done(); if (pct >= 80 && !early) FX.confetti({ n: perfect ? 160 : 90 }); }, 350);
    }
    function mistakeLabel(it) {
      if (it.word && it.word.w) return it.word.w;
      if (typeof it.word === 'string') return it.word;
      if (it.sent) return it.sent.replace(/_{3,}/, '___');
      if (it.q && it.q.q) return it.q.q;
      if (it.q && it.q.part === 1) return 'Part 1 · ' + it.q.opts[it.q.ans];
      return it.title || it.answer || 'Câu hỏi';
    }
    function onKey(e) {
      if (ended || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Escape') { exit(); return; }
      if (e.key === 'Enter') { e.preventDefault(); if (state === 'answer') { if (cur.item.type === 'intro') next(); else check(); } else next(); return; }
      if (state === 'answer' && cur.key && /^[1-4]$/.test(e.key)) cur.key(e.key);
    }
    document.addEventListener('keydown', onKey);
    setProgress();
    render();
    return () => { document.removeEventListener('keydown', onKey); foot.remove(); UI.focus(false); };
  }
  return { run, normT };
})();
