const SpeakUI = (() => {
  const { h } = U;
  const ic = n => Icon.svg(n);
  const SND = typeof SOUNDS !== 'undefined' ? SOUNDS : [];
  const SP = typeof SPEAK !== 'undefined' ? SPEAK : { passages: [], prompts: [] };
  const LINKERS = ['first', 'firstly', 'second', 'then', 'also', 'in addition', 'moreover', 'however', 'because', 'so', 'for example', 'for instance', 'finally', 'overall', 'in my opinion', 'i think', 'i believe', 'on the other hand', 'as a result', 'that is why', 'besides', 'although', 'while', 'such as'];

  function soundModal(s) {
    const pairs = s.pairs || [];
    let quiz = null;
    const body = h('div.col.g16',
      h('div.row', { style: { gap: '18px' } }, h('div', { style: { fontFamily: 'var(--ipa)', fontSize: '56px', fontWeight: 600, color: 'var(--brand)', lineHeight: 1 } }, s.kind === 'tip' ? s.sym : '/' + s.sym + '/'), h('div', h('h2', { style: { margin: 0 } }, s.kind === 'tip' ? s.sym : 'Âm /' + s.sym + '/'), h('div.muted', { cons: 'Phụ âm', short: 'Nguyên âm ngắn', long: 'Nguyên âm dài', diph: 'Nguyên âm đôi', tip: 'Kỹ năng nói tự nhiên' }[s.kind] || ''))),
      h('div.row.wrap', s.ex.map(w => h('span.audio-acc', { onclick: () => Speech.speak(w), style: { cursor: 'pointer' } }, ic('volume'), w))),
      h('div.callout', ic('info'), h('div', h('b', 'Cách phát âm: '), U.rich(s.how))),
      s.err ? h('div.callout.trap', ic('alert'), h('div', h('b', 'Người Việt hay sai: '), U.rich(s.err))) : null,
      pairs.length ? h('div', h('div.eyebrow', { style: { marginBottom: '8px' } }, 'Cặp từ tối thiểu (minimal pairs)'), h('div.list', pairs.map(([a, b]) => h('div.li',
        h('div.grow.row.wrap', h('button.chip-btn', { onclick: () => Speech.speak(a) }, a), h('span.muted', 'vs'), h('button.chip-btn', { onclick: () => Speech.speak(b) }, b)),
        Pron.enabled() ? h('button.btn.secondary.sm', { onclick: () => { FX.closeAll(); Pron.modal(a + ' ' + b + ' ' + a + ' ' + b); } }, ic('mic'), 'Đọc') : null)))) : null,
      pairs.length >= 2 ? h('button.btn', { onclick: () => startQuiz() }, ic('ear'), 'Luyện tai phân biệt') : null,
      h('div', { id: 'snd-quiz' }));
    function startQuiz() {
      const box = body.querySelector('#snd-quiz');
      let n = 0, ok = 0;
      function round() {
        U.clear(box);
        if (n >= 8) { box.appendChild(h('div.callout.tip', ic('check'), h('div', 'Đúng ' + ok + '/8. ' + (ok >= 7 ? 'Tai bạn phân biệt rất tốt.' : 'Nghe lại từng cặp vài lần rồi thử tiếp.')))); if (ok >= 6) UI.award(4); return; }
        const pr = U.pick(pairs);
        const k = Math.random() < .5 ? 0 : 1;
        const btns = h('div.opts.two', pr.map((w, i) => h('button.opt', { onclick: () => { n++; const good = i === k; if (good) ok++; good ? FX.sfx.ok() : FX.sfx.bad(); btns.children[k].classList.add('right'); if (!good) btns.children[i].classList.add('wrong'); setTimeout(round, 900); } }, h('span.k', U.LET[i]), w)));
        box.append(h('div.row.mt', h('b', 'Câu ' + (n + 1) + '/8: bạn nghe thấy từ nào?'), h('button.audio', { onclick: () => Speech.speak(pr[k]) }, ic('volume'))), btns);
        setTimeout(() => Speech.speak(pr[k]), 250);
      }
      round();
    }
    FX.modal(body, { wide: true });
  }
  function soundsTab(box) {
    const p = Store.P();
    const hot = new Set(Store.soundTotals(p).filter(([, v]) => v.err >= 2).map(([k]) => k));
    const groups = [['short', 'Nguyên âm ngắn'], ['long', 'Nguyên âm dài'], ['diph', 'Nguyên âm đôi'], ['cons', 'Phụ âm'], ['tip', 'Kỹ năng nói tự nhiên']];
    box.appendChild(h('div.callout.mb', ic('bulb'), h('div', 'Ô viền đỏ là âm bạn hay đọc sai (AI ghi lại khi bạn luyện nói). Bấm vào âm để xem cách đặt lưỡi, môi bằng tiếng Việt, nghe cặp từ và luyện tai.')));
    groups.forEach(([k, t]) => {
      const list = SND.filter(s => s.kind === k);
      if (!list.length) return;
      box.appendChild(UI.secHead(t));
      box.appendChild(h('div.ipa-grid', list.map(s => h('button.ipa-cell' + ((s.keys || []).some(x => hot.has(x)) ? '.hot' : ''), { onclick: () => soundModal(s) }, h('span.sym', k === 'tip' ? s.sym : '/' + s.sym + '/'), h('span.exw', s.ex[0]), h('span.xs.muted', s.ex.slice(1, 3).join(', '))))));
    });
  }
  function readTab(box, query) {
    const p = Store.P();
    const SRC = {
      short: { t: 'Câu TOEIC ngắn', get: () => Bank.singles[2].flatMap(q => [q.q, q.opts[q.ans]]).filter(s => s.split(' ').length >= 5 && s.split(' ').length <= 16) },
      vocab: { t: 'Câu ví dụ từ đã học', get: () => D.words.filter(w => p.cards[w.id] && w.ex).map(w => w.ex) },
      allvocab: { t: 'Câu ví dụ từ vựng', get: () => D.words.filter(w => w.ex).map(w => w.ex) },
      passage: { t: 'Đoạn văn (như TOEIC Speaking)', get: () => SP.passages.map(x => x.text) }
    };
    const src = SRC[query.src] ? query.src : 'short';
    const seg = h('div.seg', Object.entries(SRC).map(([k, v]) => h('button' + (k === src ? '.on' : ''), { onclick: () => App.go('speak', 'read?src=' + k) }, v.t)));
    box.appendChild(h('div.row.wrap.mb', seg));
    const pool = SRC[src].get();
    if (!pool.length) { box.appendChild(UI.empty(src === 'vocab' ? 'Học vài từ mới trước để có câu ví dụ.' : 'Chưa có câu nào.')); return; }
    const items = U.sample(pool, src === 'passage' ? 3 : 5);
    const scores = [];
    let i = 0;
    const stage = h('div');
    box.appendChild(stage);
    function draw() {
      U.clear(stage);
      if (i >= items.length) {
        const avg = Math.round(U.avg(scores.filter(x => x != null)));
        stage.appendChild(h('div.card.pad-l.center', h('div.col', { style: { alignItems: 'center' } }, UI.ring((avg || 0) / 100, { size: 110, stroke: 10, color: Pron.colorOf(avg || 0), label: avg || '—', font: 30, animate: true }), h('h2', 'Điểm trung bình ' + (avg || 0)), h('p.muted', 'Luyện lại câu điểm thấp, nghe mẫu rồi nhại theo đúng nhịp.'), h('button.btn.lg', { onclick: () => App.go('speak', 'read?src=' + src + '&r=' + Date.now()) }, ic('refresh'), 'Lượt mới'))));
        return;
      }
      const dots = h('div.row.g6.mb', items.map((_, k) => h('span.pill' + (k === i ? '.brand' : scores[k] != null ? (scores[k] >= 80 ? '.ok' : scores[k] >= 60 ? '.warn' : '.bad') : ''), scores[k] != null ? scores[k] : k + 1)));
      const panel = Pron.panel(items[i], { title: 'Câu ' + (i + 1) + '/' + items.length, onScore: r => { scores[i] = Math.max(scores[i] || 0, r.overall); } });
      stage.append(dots, panel, h('div.row.mt', i > 0 ? h('button.btn.secondary', { onclick: () => { i--; draw(); } }, ic('back'), 'Câu trước') : null, h('div.grow'), h('button.btn', { onclick: () => { i++; draw(); } }, i + 1 >= items.length ? 'Xem tổng kết' : 'Câu tiếp', ic('chevron'))));
    }
    draw();
  }
  function shadowTab(box, query) {
    const sets = Bank.sets[3].concat(Bank.sets[4]);
    const st = sets.find(s => s.id === query.set);
    if (!st) {
      box.appendChild(h('div.callout.mb', ic('bulb'), h('div', h('b', 'Shadowing: '), 'nghe một câu rồi nói đuổi theo ngay, bắt chước cả nhịp và ngữ điệu. Đây là cách luyện nghe và nói cùng lúc được nghiên cứu nhiều nhất (Kadota 2007, Hamada 2016). App phát từng câu, bạn nhại lại, AI chấm từng câu.')));
      box.appendChild(h('div.grid.g2', U.sample(sets, 12).map(s => h('div.card.hover', { onclick: () => App.go('speak', 'shadow?set=' + s.id) }, h('div.row', h('span.pill.' + (s.part === 3 ? 'L' : 'brand'), 'Part ' + s.part), h('span.small.muted', s.lines.length + ' câu')), h('p.mt8', { style: { fontWeight: 600 } }, s.lines[0][1].slice(0, 90) + (s.lines[0][1].length > 90 ? '…' : ''))))));
      box.appendChild(h('div.row.mt', h('button.btn.secondary', { onclick: () => App.go('speak', 'shadow?r=' + Date.now()) }, ic('shuffle'), 'Đổi bài khác')));
      return;
    }
    const lines = st.lines.flatMap(([who, text]) => (text.match(/[^.!?]+[.!?]+["']?/g) || [text]).map(t => ({ who, text: t.trim() })));
    const castMap = Speech.cast(U.uniq(lines.map(l => l.who)), st.id);
    const rows = lines.map((l, k) => {
      const chip = h('span.pill', '—');
      const row = h('div.tr-line', h('span.who.' + l.who, Player.WHO[l.who] || l.who), h('div.grow.tx', l.text), chip,
        h('button.icon-btn.ghost.sm', { title: 'Nghe', onclick: () => Speech.speak(l.text, { cast: castMap[l.who] }) }, ic('volume')),
        Pron.enabled() ? h('button.icon-btn.ghost.sm', { title: 'Nhại câu này', onclick: () => Pron.modal(l.text, { onScore: r => setChip(k, r.overall) }) }, ic('mic')) : null);
      row._chip = chip;
      return row;
    });
    const scores = [];
    function setChip(k, s) { scores[k] = s; const c = rows[k]._chip; c.className = 'pill ' + (s >= 80 ? 'ok' : s >= 60 ? 'warn' : 'bad'); c.textContent = s; }
    let running = false;
    const status = h('div.small.muted');
    const startBtn = h('button.btn', { onclick: auto }, ic('play'), 'Nhại tự động');
    async function auto() {
      if (running) { running = false; Speech.stop(); Speech.stopListen(); startBtn.lastChild.textContent = 'Nhại tự động'; return; }
      if (!Pron.enabled()) return FX.toast('Cần Chrome hoặc Edge để AI nghe giọng');
      running = true; startBtn.lastChild.textContent = 'Dừng';
      for (let k = 0; k < lines.length && running; k++) {
        rows.forEach((r, j) => r.classList.toggle('cur', j === k));
        status.textContent = 'Nghe câu ' + (k + 1) + '…';
        await Speech.speak(lines[k].text, { cast: castMap[lines[k].who] });
        if (!running) break;
        status.textContent = 'Đến lượt bạn: nhại lại câu ' + (k + 1);
        FX.sfx.pop();
        let rec = null;
        try { rec = await Speech.listen({ record: true, maxMs: 4000 + lines[k].text.split(' ').length * 700 }); } catch (e) { status.textContent = 'Không ghi âm được: ' + e.message; break; }
        if (!running) break;
        const wave = rec.blob ? await Wave.analyze(rec.blob) : null;
        const res = Pron.evaluate(lines[k].text, rec, wave);
        setChip(k, res.overall);
        Store.noteSpeak(res.overall, res.errKeys, []);
        await U.sleep(350);
      }
      rows.forEach(r => r.classList.remove('cur'));
      if (running) {
        const avg = Math.round(U.avg(scores.filter(x => x != null)));
        status.textContent = 'Xong. Điểm trung bình ' + avg + '. Bấm micro ở câu điểm thấp để luyện lại.';
        if (avg >= 60) UI.award(6); else UI.award(2);
      }
      running = false; startBtn.lastChild.textContent = 'Nhại tự động';
    }
    box.append(h('div.row.wrap.mb', UI.back(() => App.go('speak', 'shadow'), 'Chọn bài khác'), h('div.grow'), h('button.btn.secondary', { onclick: () => Speech.speakLines(lines, { castMap }) }, ic('headphones'), 'Nghe cả bài'), startBtn),
      h('div.card', status, h('div.transcript', rows)));
  }
  function answerTab(box, query) {
    const prompts = SP.prompts || [];
    const pr = prompts.find(x => x.id === query.q);
    if (!pr) {
      box.appendChild(h('div.callout.mb', ic('ai'), h('div', 'Trả lời câu hỏi bằng giọng nói trong 30–60 giây. App chấm độ dài, tốc độ, từ nối và độ bám chủ đề. ', AI.enabled() ? h('b', 'Claude AI sẽ sửa ngữ pháp và viết lại câu trả lời hay hơn.') : h('span', 'Muốn AI sửa ngữ pháp và viết lại bài hay hơn: ', h('a', { href: '#/settings' }, 'thêm API key Claude trong Cài đặt'), ' (tùy chọn, có phí theo lượt dùng).'))));
      box.appendChild(h('div.grid.g2', prompts.map(x => h('div.card.hover', { onclick: () => App.go('speak', 'answer?q=' + x.id) }, h('div.row', h('span.pill', x.cat || 'Chủ đề')), h('p.mt8', { style: { fontWeight: 650 } }, x.q), h('p.small.muted', x.vi)))));
      return;
    }
    const kw = (pr.kw || []).map(k => k.toLowerCase());
    const out = h('div');
    const interim = h('div.interim');
    const canvas = h('canvas.meter.hidden');
    const hint = h('div.mic-hint', 'Bấm micro, nói 30–60 giây, bấm lần nữa để dừng');
    const timer = h('div.pill', '0:00');
    const mic = h('button.mic', { disabled: !Pron.enabled() }, ic('mic'));
    let busy = false, stopMeter = null, t0 = 0, tk = null;
    mic.addEventListener('click', async () => {
      if (busy) { Speech.stopListen(); return; }
      busy = true; U.clear(out);
      mic.classList.add('rec'); mic.innerHTML = ''; mic.appendChild(ic('stop'));
      hint.textContent = 'Đang ghi âm… bấm để dừng';
      t0 = Date.now(); tk = setInterval(() => timer.textContent = U.fmtDur((Date.now() - t0) / 1000), 500);
      let rec = null;
      try { rec = await Speech.listen({ record: true, continuous: true, maxMs: 75000, onInterim: t => interim.textContent = t, onStream: st => { canvas.classList.remove('hidden'); stopMeter = Wave.meter(st, canvas); } }); }
      catch (e) { out.appendChild(h('div.tip.mt', ic('alert'), h('div', h('b', 'Không ghi âm được'), h('p', e.message === 'not-allowed' ? 'Hãy cho phép micro trong Chrome rồi thử lại.' : e.message)))); }
      clearInterval(tk);
      if (stopMeter) { stopMeter(); stopMeter = null; }
      canvas.classList.add('hidden');
      mic.classList.remove('rec'); mic.innerHTML = ''; mic.appendChild(ic('mic'));
      busy = false; interim.textContent = '';
      hint.textContent = 'Bấm micro để trả lời lại';
      if (!rec || !rec.text) { if (rec) out.appendChild(h('div.tip.mt', ic('alert'), h('div', h('b', 'Chưa nghe thấy gì'), h('p', 'Nói to và rõ hơn, để micro gần miệng.')))); return; }
      const wave = rec.blob ? await Wave.analyze(rec.blob) : null;
      const text = rec.text;
      const words = text.split(/\s+/).filter(Boolean);
      const secs = wave ? wave.span : Math.max(1, (Date.now() - t0) / 1000 - 1);
      const wpm = Math.round(words.length / (secs / 60));
      const low = ' ' + text.toLowerCase() + ' ';
      const hitKw = kw.filter(k => low.includes(k));
      const links = LINKERS.filter(k => low.includes(' ' + k + ' '));
      const crit = [
        ['Độ dài', words.length >= 60 ? 1 : words.length / 60, words.length + ' từ (nên từ 60 từ)'],
        ['Tốc độ', wpm >= 100 && wpm <= 170 ? 1 : wpm < 100 ? wpm / 100 : .8, wpm + ' từ/phút (tự nhiên: 110–160)'],
        ['Từ nối', Math.min(1, links.length / 3), links.length ? links.join(', ') : 'chưa dùng từ nối'],
        ['Bám chủ đề', kw.length ? Math.min(1, hitKw.length / Math.min(3, kw.length)) : 1, hitKw.length ? 'có nhắc: ' + hitKw.join(', ') : 'chưa nhắc từ khóa của câu hỏi']
      ];
      const sc = Math.round(U.avg(crit.map(c => c[1])) * 100);
      Store.noteSpeak(sc, [], []);
      UI.award(sc >= 70 ? 6 : 3);
      const aiBox = h('div');
      out.append(h('div.card.mt',
        h('div.row.wrap', { style: { gap: '20px' } }, UI.ring(sc / 100, { size: 92, stroke: 8, color: Pron.colorOf(sc), label: sc, font: 26, animate: true }), h('div.grow', h('div.eyebrow', 'Chấm tự động'), h('div', { style: { fontWeight: 650, marginTop: '4px' } }, sc >= 80 ? 'Câu trả lời đủ ý, nói trôi chảy.' : sc >= 60 ? 'Khá rồi, cần dài và mạch lạc hơn.' : 'Nói thêm ý, dùng từ nối để nối các ý.'))),
        h('table.tbl.mt', h('tbody', crit.map(([k, v, d]) => h('tr', h('td', { style: { fontWeight: 650, width: '120px' } }, k), h('td', UI.bar(v, v >= .8 ? 'ok' : v >= .5 ? 'warn' : 'bad')), h('td.small.muted', d))))),
        h('div.heard', h('b', 'Máy nghe được'), text),
        rec.audio ? h('div.row.mt', h('button.btn.secondary.sm', { onclick: () => Wave.play(rec.audio) }, ic('play'), 'Nghe lại bài nói')) : null,
        aiBox));
      if (AI.enabled()) runAI(aiBox, pr.q, text);
      else aiBox.appendChild(h('div.callout.mt', ic('ai'), h('div', 'Muốn Claude sửa từng lỗi ngữ pháp và viết lại câu trả lời tự nhiên hơn? ', h('a', { href: '#/settings' }, 'Thêm API key trong Cài đặt'), '.')));
    });
    async function runAI(boxEl, q, text) {
      U.clear(boxEl);
      boxEl.appendChild(h('div.callout.mt', ic('ai'), h('div', 'Claude đang đọc bài nói của bạn…')));
      try {
        const r = await AI.feedback(q, text);
        U.clear(boxEl);
        boxEl.appendChild(h('div.mt2',
          h('div.row.wrap', h('span.pill.ai', ic('ai'), 'Claude nhận xét'), h('span.pill.brand', r.level), h('span.pill', 'Tổng ' + r.score)),
          h('div.grid.g4.mt', [['Bám đề', r.relevance], ['Ngữ pháp', r.grammar], ['Từ vựng', r.vocabulary], ['Mạch lạc', r.coherence]].map(([k, v]) => h('div.stat-tile', h('div.stat', h('div.v', { style: { color: Pron.colorOf(v) } }, v), h('div.k', k))))),
          h('p.mt', r.summary_vi),
          r.corrections.length ? h('div.mt', h('div.eyebrow', { style: { marginBottom: '8px' } }, 'Sửa lỗi'), r.corrections.map(c => h('div.note', ic('edit'), h('div.grow', h('div', h('s', { style: { color: 'var(--bad-d)' } }, c.original), ' → ', h('b', { style: { color: 'var(--ok-d)' } }, c.better)), h('div.meta', c.why_vi))))) : null,
          h('div.mt', h('div.eyebrow', { style: { marginBottom: '8px' } }, 'Bản nâng cấp (giữ ý của bạn)'), h('div.ex', h('div.grow.en', r.upgraded_answer), UI.audioBtn(r.upgraded_answer, { size: 'sm' }))),
          Pron.enabled() ? h('button.btn.secondary.sm.mt', { onclick: () => Pron.modal(r.upgraded_answer.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ')) }, ic('mic'), 'Luyện đọc bản nâng cấp') : null,
          r.useful_phrases.length ? h('div.mt', h('div.eyebrow', { style: { marginBottom: '8px' } }, 'Cụm từ nên dùng'), h('div.fam', r.useful_phrases.map(x => h('span', x)))) : null));
      } catch (e) {
        U.clear(boxEl);
        boxEl.appendChild(h('div.tip.mt', ic('alert'), h('div', h('b', 'Chưa nhận xét được'), h('p', AI.errText(e)), h('button.btn.sm.secondary.mt8', { onclick: () => runAI(boxEl, q, text) }, 'Thử lại'))));
      }
    }
    box.append(h('div.row.mb', UI.back(() => App.go('speak', 'answer'), 'Câu hỏi khác')),
      h('div.card.pad-l',
        h('div.eyebrow.brand', pr.cat || 'Câu hỏi'),
        h('div.row.top.mt8', h('h2.grow', { style: { fontSize: '22px' } }, pr.q), UI.audioBtn(pr.q)),
        h('p.muted.mt4', pr.vi),
        pr.hint ? h('div.callout.mt', ic('bulb'), h('div', U.rich(pr.hint))) : null,
        h('div.mic-zone', mic, canvas, interim, h('div.row', timer), hint),
        out,
        pr.sample ? h('details.mt', h('summary', { style: { cursor: 'pointer', fontWeight: 650 } }, 'Xem câu trả lời mẫu'), h('div.ex.mt8', h('div.grow.en', pr.sample), UI.audioBtn(pr.sample, { size: 'sm' }))) : null));
  }
  return { soundsTab, readTab, shadowTab, answerTab, soundModal };
})();

App.register('speak', {
  render(root, params, query) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const p = Store.P();
    const tab = ['read', 'shadow', 'sounds', 'answer'].includes(params[0]) ? params[0] : 'read';
    const sp = p.speak;
    const avg = sp.n ? Math.round(sp.sum / sp.n) : null;
    const top = Store.soundTotals(p).slice(0, 3);
    root.appendChild(UI.pageHead('Phát âm & Nói', 'AI nghe giọng bạn, chấm từng từ theo âm vị, đo tốc độ và chỉ ra lỗi người Việt hay mắc. Luyện nói cũng là cách nhanh nhất để nghe tốt hơn.',
      h('div.row', h('span.pill.ai.lg', ic('ai'), 'AI chấm phát âm'), h('button.btn.ghost.sm', { onclick: Pron.how }, ic('info'), 'Cách AI chấm'))));
    if (!Pron.enabled()) root.appendChild(h('div.callout.warn.mb', ic('alert'), h('div', 'Trình duyệt này chưa hỗ trợ nhận giọng nói. Hãy mở app bằng Google Chrome (máy tính hoặc Android) để dùng AI chấm phát âm. Bạn vẫn nghe mẫu được.')));
    root.appendChild(h('div.grid.g3.mb',
      h('div.stat-tile', h('div.stat', h('div.v', avg != null ? avg : '—', h('small', '/100')), h('div.k', 'Điểm trung bình'))),
      h('div.stat-tile', h('div.stat', h('div.v', sp.n), h('div.k', 'Lượt đã nói'))),
      h('div.stat-tile', h('div.k', { style: { fontSize: '12.5px', color: 'var(--muted)', fontWeight: 550 } }, 'Âm hay sai'), h('div.row.wrap.mt4', top.length ? top.map(([k]) => { const t = Pron.tipFor(k); const s = (typeof SOUNDS !== 'undefined' ? SOUNDS : []).find(x => (x.keys || []).includes(k)); return h('button.chip-btn', { onclick: () => s && SpeakUI.soundModal(s) }, t.t); }) : h('span.small.muted', 'Chưa có dữ liệu')))));
    const tabs = h('div.seg.mb', [['read', 'Đọc to'], ['shadow', 'Nhại hội thoại'], ['sounds', 'Âm & cặp từ'], ['answer', 'Trả lời câu hỏi']].map(([k, t]) => h('button' + (k === tab ? '.on' : ''), { onclick: () => App.go('speak', k) }, t)));
    root.appendChild(tabs);
    const box = h('div.page-enter');
    root.appendChild(box);
    if (tab === 'sounds') SpeakUI.soundsTab(box);
    else if (tab === 'shadow') SpeakUI.shadowTab(box, query);
    else if (tab === 'answer') SpeakUI.answerTab(box, query);
    else SpeakUI.readTab(box, query);
  }
});
