App.register('exam', {
  render(root, params, query) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const p = Store.P();
    let run = params[0] === 'resume' ? ExamDB.loadRun() : null;
    if (!run || run.status !== 'running') {
      const kind = Bank.SPECS[params[0]] ? params[0] : 'mini';
      const seedName = params[1] || 'r' + Date.now().toString(36);
      const attempt = p.tests.filter(t => t.seedName === seedName).length;
      const t = Bank.assemble(kind, seedName + ':' + attempt + ':' + p.id, p);
      run = { id: 'T' + Date.now().toString(36), kind, seedName: /^set\d+$/.test(seedName) ? seedName : null, title: Bank.SPECS[kind].title + (/^set\d+$/.test(seedName) ? ' · ' + seedName.replace('set', 'Đề ') : ''), mode: query.mode === 'practice' ? 'practice' : 'real', blocks: t.blocks, rMin: t.rMin, answers: {}, flags: [], startedAt: Date.now(), rUsed: 0, lPos: 0, rPage: 0, status: 'running' };
      const b0 = Bank.build({ blocks: run.blocks });
      run.sec = b0.L ? 'L' : 'R';
      ExamDB.saveRun(run);
      history.replaceState(null, '', '#/exam/resume');
    }
    document.body.classList.add('exam-mode');
    const built = Bank.build({ blocks: run.blocks });
    const Lg = built.groups.filter(g => g.part <= 4);
    const Rg = built.groups.filter(g => g.part >= 5);
    const pages = [];
    let chunk = [];
    Rg.forEach(g => {
      if (g.part === 5) { chunk.push(g); if (chunk.length === 5) { pages.push(chunk); chunk = []; } }
      else { if (chunk.length) { pages.push(chunk); chunk = []; } pages.push([g]); }
    });
    if (chunk.length) pages.push(chunk);
    const real = run.mode === 'real';
    let token = 0, rStartAt = 0, playing = false, skipWait = null;
    const save = () => { if (run.sec === 'R' && rStartAt) run.rUsed = (Date.now() - rStartAt) / 1000; ExamDB.saveRun(run); };

    const timerEl = h('div.timer', ic('clock'), h('span', '00:00'));
    const secEl = h('div.ex-sec', h('span' + (run.sec === 'L' ? '.on' : ''), 'Listening'), h('span' + (run.sec === 'R' ? '.on' : ''), 'Reading'));
    const sheetBtn = h('button.btn.sm.secondary', { style: { background: 'rgba(255,255,255,.08)', color: '#fff', borderColor: 'rgba(255,255,255,.15)' }, onclick: () => side.classList.toggle('open') }, ic('grid'), h('span', 'Phiếu'));
    const head = h('div.ex-head', Art.brandMark(30), h('div', { style: { minWidth: 0 } }, h('div.t', run.title), h('div.s', (real ? 'Như thi thật' : 'Luyện thi') + ' · ' + built.n + ' câu')), secEl, timerEl, sheetBtn, h('button.btn.sm.lime', { onclick: () => submit(false) }, 'Nộp bài'), h('button.icon-btn.sm', { style: { background: 'transparent', borderColor: 'rgba(255,255,255,.15)', color: '#fff' }, title: 'Thoát (lưu bài làm dở)', onclick: leave }, ic('x')));
    const mainIn = h('div.ex-main-in');
    const side = h('div.ex-side');
    const foot = h('div.ex-foot');
    root.appendChild(h('div.exam', head, h('div.ex-body', h('div.ex-main', mainIn), side), foot));

    function flagBtn(num) {
      const on = run.flags.includes(num);
      return h('button.icon-btn.ghost.sm', { title: on ? 'Bỏ đánh dấu' : 'Đánh dấu xem lại', style: { color: on ? 'var(--gold-d)' : '' }, onclick: e => { e.stopPropagation(); const i = run.flags.indexOf(num); if (i >= 0) run.flags.splice(i, 1); else run.flags.push(num); save(); drawSheet(); const qb = mainIn.querySelector('#q' + num); if (qb) qb.classList.toggle('flagged', i < 0); e.currentTarget.style.color = i < 0 ? 'var(--gold-d)' : ''; } }, ic('flag'));
    }
    function qb(q) {
      return Items.qblock(q, { num: q.num, mode: 'exam', chosen: run.answers[q.num], flagged: run.flags.includes(q.num), flagBtn: flagBtn(q.num), showText: !(real && (q.part === 1 || q.part === 2)), onPick: i => { run.answers[q.num] = i; save(); drawSheet(); if (q.part === 6) redrawBlanks(); } });
    }
    let curGroup = null;
    function redrawBlanks() {
      if (!curGroup || curGroup.part !== 6) return;
      const qs = curGroup.nums.map(n => built.qs[n - 1]);
      const nb = Items.blankMap(curGroup.set, qs, qs.map(q => run.answers[q.num]), 'exam', curGroup.nums);
      mainIn.querySelectorAll('.blank').forEach(b => { const v = nb[b.dataset.k]; b.textContent = v.value || v.label; b.classList.toggle('filled', !!v.value); });
    }
    function drawSheet() {
      U.clear(side);
      const answered = Object.keys(run.answers).filter(k => run.answers[k] != null && run.answers[k] >= 0).length;
      side.appendChild(h('div.sheet-h', h('b', 'Phiếu trả lời'), h('span.pill', answered + '/' + built.n)));
      const cur = new Set(curGroup ? curGroup.nums : []);
      for (let part = 1; part <= 7; part++) {
        const qs = built.qs.filter(q => q.part === part);
        if (!qs.length) continue;
        side.appendChild(h('div.sheet-part', 'Part ' + part));
        side.appendChild(h('div.sheet-grid', qs.map(q => h('button' + (run.answers[q.num] != null ? '.ans' : '') + (run.flags.includes(q.num) ? '.flag' : '') + (cur.has(q.num) ? '.cur' : ''), { onclick: () => jump(q.num) }, q.num))));
      }
      side.appendChild(h('div.legend', h('span', h('i', { style: { background: 'var(--brand)' } }), 'Đã trả lời'), h('span', h('i', { style: { background: 'var(--gold)' } }), 'Đánh dấu'), h('span', h('i', { style: { border: '2px solid var(--navy)' } }), 'Đang làm')));
    }
    function jump(num) {
      side.classList.remove('open');
      const q = built.qs[num - 1];
      if (q.part <= 4) {
        if (run.sec !== 'L') return FX.toast('Phần nghe đã kết thúc');
        const gi = Lg.findIndex(g => g.nums.includes(num));
        if (gi === run.lPos) { const el = mainIn.querySelector('#q' + num); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
        if (real) return FX.toast('Như thi thật: phần nghe chạy theo thứ tự, không quay lại được');
        playListening(gi);
        return;
      }
      if (run.sec === 'L') {
        if (real) return FX.toast('Làm xong phần nghe mới sang phần đọc');
        return confirmToReading(num);
      }
      const pi = pages.findIndex(pg => pg.some(g => g.nums.includes(num)));
      run.rPage = pi; save(); drawReading();
      setTimeout(() => { const el = mainIn.querySelector('#q' + num); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 60);
    }
    async function confirmToReading(num) {
      if (!(await FX.confirm('Chuyển sang Reading?', 'Phần nghe chưa xong sẽ dừng lại. Ở chế độ luyện thi bạn vẫn quay lại nghe được.', 'Chuyển', 'Ở lại'))) return;
      startReading();
      if (num) jump(num);
    }

    const stageSt = h('div.st', '');
    const stageCd = h('div.cd', '');
    const stage = h('div.listen-stage', h('div.eq', h('i'), h('i'), h('i'), h('i'), h('i')), stageSt, stageCd);
    function setStage(t, on, cd) { stageSt.textContent = t; stage.classList.toggle('on', !!on); stageCd.textContent = cd || ''; }
    function showListenGroup(li) {
      const g = Lg[li];
      curGroup = g;
      U.clear(mainIn);
      const qs = g.nums.map(n => built.qs[n - 1]);
      mainIn.appendChild(stage);
      const part = g.part;
      mainIn.appendChild(h('div.row.mb', h('span.pill.L', 'Part ' + part), h('b', Bank.PART_EN[part]), h('span.small.muted', '· ' + Bank.PART_NAME[part]), h('div.grow'), h('span.small.muted', 'Bài ' + (li + 1) + '/' + Lg.length)));
      if (part === 1) { mainIn.appendChild(Items.p1Visual(qs[0])); mainIn.appendChild(h('div.mt', qb(qs[0]))); }
      else if (part === 2) mainIn.appendChild(qb(qs[0]));
      else {
        mainIn.appendChild(h('p.small.muted.mb', Items.intro(g.set, g.nums)));
        if (g.set.g) mainIn.appendChild(h('div.mb', Docs.graphic(g.set.g)));
        mainIn.appendChild(h('div.col.g16', qs.map(qb)));
      }
      drawSheet();
      drawFootL();
    }
    function drawFootL() {
      U.clear(foot);
      if (real) { foot.appendChild(h('span.small.muted', 'Phần nghe chạy tự động như thi thật. Chọn đáp án ngay khi nghe.')); return; }
      foot.append(
        h('button.btn.secondary.sm', { onclick: () => playListening(run.lPos) }, ic('repeat'), 'Phát lại bài này'),
        h('button.btn.secondary.sm', { onclick: () => { if (playing) { token++; Speech.stop(); playing = false; setStage('Đã dừng. Bấm Tiếp tục để nghe lại bài này.', false); drawFootL(); } else playListening(run.lPos); } }, ic(playing ? 'pause' : 'play'), playing ? 'Dừng' : 'Tiếp tục'),
        h('div.ex-nav', run.lPos > 0 ? h('button.btn.secondary.sm', { onclick: () => playListening(run.lPos - 1) }, ic('back'), 'Bài trước') : null, h('button.btn.sm', { onclick: () => { if (skipWait) skipWait(); else if (run.lPos + 1 < Lg.length) playListening(run.lPos + 1); else startReading(); } }, run.lPos + 1 < Lg.length ? 'Bài tiếp' : 'Sang Reading', ic('chevron'))));
    }
    function wait(sec, my, label) {
      return new Promise(res => {
        const end = Date.now() + sec * 1000;
        const done = () => { clearInterval(t); skipWait = null; res(); };
        skipWait = done;
        const t = setInterval(() => {
          if (my !== token) return done();
          const left = Math.ceil((end - Date.now()) / 1000);
          setStage(label, false, 'Còn ' + Math.max(0, left) + ' giây');
          if (Date.now() >= end) done();
        }, 200);
      });
    }
    async function say(lines, castMap, my, label) {
      setStage(label, true);
      const ok = await Speech.speakLines(lines, { castMap, gap: 450 });
      return ok && my === token;
    }
    async function playGroup(g, my) {
      const qs = g.nums.map(n => built.qs[n - 1]);
      if (g.part === 1) {
        const q = qs[0];
        const cm = Speech.cast(['N'], 'p1');
        if (!(await say([{ who: 'N', text: 'Number ' + q.num + '. Look at the picture marked number ' + q.num + ' in your test book.' }, ...Items.linesOf(q)], cm, my, 'Câu ' + q.num + ' · đang đọc 4 mô tả'))) return false;
        await wait(5, my, 'Câu ' + q.num + ' · chọn đáp án');
      } else if (g.part === 2) {
        const q = qs[0];
        const roles = Items.roleOfP2(q);
        const cm = Speech.cast(['N', ...roles], q.id);
        if (!(await say([{ who: 'N', text: 'Number ' + q.num + '.' }, ...Items.linesOf(q)], cm, my, 'Câu ' + q.num + ' · câu hỏi và 3 câu đáp'))) return false;
        await wait(5, my, 'Câu ' + q.num + ' · chọn đáp án');
      } else {
        const st = g.set;
        const cm = Speech.cast(['N', ...U.uniq(st.lines.map(l => l[0]))], st.id);
        if (!(await say([{ who: 'N', text: Items.intro(st, g.nums) }], cm, my, 'Câu ' + g.nums[0] + '–' + g.nums[g.nums.length - 1] + ' · giới thiệu'))) return false;
        if (!(await say(st.lines.map(l => ({ who: l[0], text: l[1] })), cm, my, g.part === 3 ? 'Đang phát hội thoại' : 'Đang phát bài nói'))) return false;
        for (const q of qs) {
          if (!(await say([{ who: 'N', text: 'Number ' + q.num + '. ' + q.q }], cm, my, 'Câu ' + q.num))) return false;
          await wait(st.g ? 12 : 8, my, 'Câu ' + q.num + ' · chọn đáp án');
          if (my !== token) return false;
        }
      }
      return my === token;
    }
    async function playListening(from) {
      const my = ++token;
      Speech.stop();
      playing = true;
      for (let li = from; li < Lg.length; li++) {
        if (my !== token) return;
        run.lPos = li; save();
        showListenGroup(li);
        await U.sleep(400);
        const ok = await playGroup(Lg[li], my);
        if (my !== token || !ok) return;
      }
      playing = false;
      if (my === token) startReading();
    }
    function startReading() {
      token++; Speech.stop(); playing = false;
      if (!pages.length) return submit(true);
      run.sec = 'R';
      rStartAt = Date.now() - (run.rUsed || 0) * 1000;
      [...secEl.children].forEach((s, i) => s.classList.toggle('on', i === 1));
      save();
      drawReading();
      if (Lg.length) FX.toast('Bắt đầu phần Reading · ' + run.rMin + ' phút');
    }
    function drawReading() {
      const pg = pages[run.rPage] || pages[0];
      U.clear(mainIn);
      curGroup = pg[0];
      const part = pg[0].part;
      mainIn.appendChild(h('div.row.mb', h('span.pill.R', 'Part ' + part), h('b', Bank.PART_EN[part]), h('span.small.muted', '· ' + Bank.PART_NAME[part]), h('div.grow'), h('span.small.muted', 'Trang ' + (run.rPage + 1) + '/' + pages.length)));
      if (part === 5) mainIn.appendChild(h('div.col.g16', pg.flatMap(g => g.nums.map(n => built.qs[n - 1])).map(q => {
        const b = qb(q);
        const qn = b.querySelector('.qn .grow');
        U.clear(qn);
        String(q.q).split(/_{3,}|-{4,}/).forEach((part2, i, arr) => { qn.appendChild(document.createTextNode(part2)); if (i < arr.length - 1) qn.appendChild(h('span', { style: { display: 'inline-block', minWidth: '70px', borderBottom: '2px solid var(--ink)', margin: '0 3px' } }, ' ')); });
        return b;
      })));
      else {
        const g = pg[0];
        const qs = g.nums.map(n => built.qs[n - 1]);
        const blanks = g.part === 6 ? Items.blankMap(g.set, qs, qs.map(q => run.answers[q.num]), 'exam', g.nums) : null;
        mainIn.appendChild(h('div.stimulus', h('div.s-left', h('p.small.muted.mb', Items.intro(g.set, g.nums)), Items.stimulus(g.set, { mode: 'exam', blanks, onBlank: k => { const el = mainIn.querySelector('#q' + g.nums[k - 1]); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } })), h('div.s-right', qs.map(qb))));
      }
      U.clear(foot);
      foot.append(h('span.small.muted', 'Hết giờ app tự nộp bài'), h('div.ex-nav',
        run.rPage > 0 ? h('button.btn.secondary', { onclick: () => { run.rPage--; save(); drawReading(); window.scrollTo(0, 0); } }, ic('back'), 'Trang trước') : null,
        run.rPage + 1 < pages.length ? h('button.btn', { onclick: () => { run.rPage++; save(); drawReading(); window.scrollTo(0, 0); } }, 'Trang tiếp', ic('chevron')) : h('button.btn.ok', { onclick: () => submit(false) }, ic('check'), 'Nộp bài')));
      drawSheet();
    }
    const tick = setInterval(() => {
      if (run.sec === 'R' && rStartAt) {
        const left = run.rMin * 60 - (Date.now() - rStartAt) / 1000;
        timerEl.lastChild.textContent = U.fmtDur(Math.max(0, left));
        timerEl.classList.toggle('low', left < 300);
        if (Math.round(left) % 15 === 0) save();
        if (left <= 0) { clearInterval(tick); FX.toast('Hết giờ, app tự nộp bài'); submit(true); }
      } else timerEl.lastChild.textContent = U.fmtDur((Date.now() - run.startedAt) / 1000);
    }, 1000);
    async function leave() {
      token++; Speech.stop();
      if (!(await FX.confirm('Thoát phòng thi?', 'Bài làm được lưu, có thể làm tiếp từ mục Thi thử. Phần nghe sẽ phát lại từ bài đang dở.', 'Thoát', 'Ở lại'))) { if (run.sec === 'L' && real) playListening(run.lPos); return; }
      save();
      App.go('tests');
    }
    async function submit(force) {
      if (run.status !== 'running') return;
      const left = built.n - Object.keys(run.answers).length;
      if (!force) {
        const wasPlaying = playing;
        if (wasPlaying && real) { }
        if (!(await FX.confirm('Nộp bài?', left ? 'Còn ' + left + ' câu chưa trả lời, sẽ tính là sai.' : 'Bạn đã trả lời đủ ' + built.n + ' câu.', 'Nộp bài', 'Làm tiếp'))) return;
      }
      token++; Speech.stop(); clearInterval(tick);
      if (run.sec === 'R' && rStartAt) run.rUsed = (Date.now() - rStartAt) / 1000;
      run.status = 'done';
      const parts = {};
      let okN = 0;
      built.qs.forEach(q => {
        const ok = run.answers[q.num] === q.ans;
        if (ok) okN++;
        const r = parts[q.part] = parts[q.part] || [0, 0];
        r[1]++; if (ok) r[0]++;
        Store.record(q.part, ok, q.id, q.tag);
      });
      const sc = Score.fromParts(parts);
      const secs = Math.round((Date.now() - run.startedAt) / 1000);
      const sum = { id: run.id, kind: run.kind, seedName: run.seedName, at: Date.now(), L: sc.L, R: sc.R, T: sc.T, parts, secs, n: built.n, okN, acc: okN / built.n, mode: run.mode };
      if (run.kind === 'placement') p.level0 = { at: Date.now(), acc: { L: sc.lPct != null ? Math.max(.25, sc.lPct) : .55, R: sc.rPct != null ? Math.max(.25, sc.rPct) : .55 }, L: sc.L, R: sc.R, T: sc.T };
      Store.addTest(sum);
      ExamDB.saveRes({ id: run.id, at: sum.at, kind: run.kind, title: run.title, blocks: run.blocks, answers: run.answers, flags: run.flags, secs });
      ExamDB.clearRun();
      Store.addXP({ full: 60, mini: 35, listening: 30, reading: 30, placement: 20 }[run.kind] || 20);
      FX.sfx.stamp();
      App.go('result', run.id);
    }
    if (run.sec === 'L' && Lg.length) {
      showListenGroup(run.lPos || 0);
      setStage('Chuẩn bị nghe…', false);
      if (!Speech.available()) setStage('Trình duyệt chưa có giọng đọc tiếng Anh. Hãy dùng Chrome hoặc Edge.', false);
      setTimeout(() => playListening(run.lPos || 0), 900);
    } else startReading();
    return () => { token++; clearInterval(tick); Speech.stop(); if (run.status === 'running') save(); document.body.classList.remove('exam-mode'); };
  }
});
