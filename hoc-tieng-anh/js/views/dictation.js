App.register('dictation', {
  render(root, params) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const p = Store.P();
    const LV = {
      short: { t: 'Câu ngắn', d: 'Câu hỏi và câu đáp Part 2, 6–12 từ', icon: 'message', src: () => Bank.singles[2].flatMap(q => [{ text: q.q, who: 'W' }, { text: q.opts[q.ans], who: 'M' }]) },
      conv: { t: 'Hội thoại', d: 'Từng lượt lời trong Part 3', icon: 'chat', src: () => Bank.sets[3].flatMap(s => s.lines.map(l => ({ text: l[1], who: l[0] }))) },
      talk: { t: 'Bài nói', d: 'Từng câu trong thông báo, tin nhắn Part 4', icon: 'megaphone', src: () => Bank.sets[4].flatMap(s => s.lines.flatMap(l => (l[1].match(/[^.!?]+[.!?]+/g) || [l[1]]).map(t => ({ text: t.trim(), who: l[0] })))) },
      vocab: { t: 'Câu ví dụ từ vựng', d: 'Câu chứa từ TOEIC bạn đã học', icon: 'cards', src: () => D.words.filter(w => p.cards[w.id] && w.ex).map(w => ({ text: w.ex, who: 'N' })) }
    };
    const lv = LV[params[0]];
    if (!lv) {
      root.appendChild(UI.pageHead('Nghe chép chính tả', 'Cách luyện tai hiệu quả nhất để bắt âm cuối, từ nối và số. Nghe từng câu, gõ lại, app so từng từ và chỉ ra chỗ nghe sót.'));
      root.appendChild(h('div.callout.mb', ic('bulb'), h('div', 'Mẹo: nghe 1 lần ở tốc độ thường, gõ những gì nghe được. Nghe lại chậm để điền chỗ thiếu. Đừng nhìn lời trước khi kiểm tra. Các lỗi hay gặp: mất -s, -ed, mạo từ a/the, giới từ.')));
      root.appendChild(h('div.grid.g2.stagger', Object.entries(LV).map(([k, v]) => {
        const n = v.src().filter(x => x.text.split(' ').length >= 4 && x.text.split(' ').length <= 26).length;
        return h('div.card.hover', { onclick: () => n && App.go('dictation', k) }, h('div.row', h('span.tile-ic.lg', ic(v.icon)), h('div.grow', h('div', { style: { fontWeight: 750, fontSize: '16px' } }, v.t), h('div.small.muted', v.d), h('div.xs.muted.mt4', n + ' câu')), ic('chevron')));
      })));
      root.appendChild(h('div.row.mt', h('span.small.muted', 'Đã chép ' + p.stats.dict + ' câu')));
      return;
    }
    UI.focus(true);
    const pool = lv.src().filter(x => x.text.split(' ').length >= 4 && x.text.split(' ').length <= 26);
    const items = U.sample(pool, 5);
    let i = 0, total = 0, xp = 0;
    const bar = UI.bar(0, 'thick');
    const stage = h('div');
    root.appendChild(h('div.runner', h('div.run-head', h('button.icon-btn.ghost', { onclick: () => App.go('dictation'), title: 'Thoát' }, ic('x')), bar, h('span.cnt', lv.t)), stage));
    const castMap = Speech.cast(['W', 'M', 'N'], 'dict' + Date.now());
    const say = (t, r) => Speech.speak(t, { cast: castMap[items[i].who || 'N'], rate: r });
    function keys(t) { return Phon.tokenize(t).flatMap(x => x.keys); }
    function draw() {
      U.clear(stage);
      if (i >= items.length) return done();
      const it = items[i];
      const ta = h('textarea.textarea.dict-input', { placeholder: 'Gõ lại câu bạn nghe được…', rows: 3, spellcheck: 'false' });
      const out = h('div');
      const checkBtn = h('button.btn.lg', { onclick: check }, 'Kiểm tra');
      ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); check(); } });
      stage.append(h('div.page-enter',
        h('div.q-kind', ic('edit'), 'Câu ' + (i + 1) + '/' + items.length),
        h('div.q-title', 'Nghe và gõ lại chính xác'),
        h('div.row', { style: { margin: '6px 0 16px' } },
          h('button.audio.lg', { type: 'button', title: 'Nghe lại', onclick: () => say(it.text, 1) }, ic('volume')),
          h('button.btn.secondary', { onclick: () => say(it.text, .7) }, ic('speed'), 'Nghe chậm'),
          h('span.small.muted', 'Enter để kiểm tra · Shift+Enter xuống dòng')),
        ta, out, h('div.row.mt', h('div.grow'), checkBtn)));
      setTimeout(() => { say(it.text, 1); ta.focus(); }, 300);
      let checked = false;
      function check() {
        if (checked) { i++; bar.firstChild.style.width = (i / items.length * 100) + '%'; return draw(); }
        if (!ta.value.trim()) return;
        checked = true;
        const tk = keys(it.text), gk = keys(ta.value);
        const ops = U.diffOps(tk, gk);
        const disp = h('div.diff', { style: { fontSize: '17px', lineHeight: 1.8 } });
        let hit = 0;
        ops.forEach(([op, a, b]) => {
          if (op === '=') { hit++; disp.appendChild(h('span.ok', a)); }
          else if (op === '~') disp.appendChild(h('span.miss', { title: 'Bạn gõ: ' + b }, a));
          else if (op === '-') disp.appendChild(h('span.miss', a));
          else disp.appendChild(h('span.extra', b));
          disp.appendChild(document.createTextNode(' '));
        });
        const acc = tk.length ? hit / tk.length : 0;
        total += acc;
        p.stats.dict++;
        Store.bump('dict');
        if (acc >= .8) xp += 2;
        const missed = ops.filter(o => o[0] !== '=' && o[1]).map(o => o[1]);
        const endings = missed.filter(w => /(s|ed)$/.test(w)).length;
        out.append(h('div.card.mt', { style: { borderColor: acc >= .9 ? '#BFE7CD' : acc >= .7 ? '#F6DFA8' : '#F6C6C7' } },
          h('div.row.between', h('b', 'Đúng ' + Math.round(acc * 100) + '% số từ'), h('div.row.g6', UI.audioBtn(it.text, { size: 'sm' }), Pron.enabled() ? h('button.btn.secondary.sm', { onclick: () => Pron.modal(it.text) }, ic('mic'), 'Nhại lại') : null)),
          h('div.mt8', disp),
          h('div.small.muted.mt8', h('b', 'Câu gốc: '), it.text),
          endings ? h('div.tip.mt', ic('bulb'), h('div', h('b', 'Bạn hay sót đuôi -s, -ed'), h('p', 'Đây là lỗi nghe số 1 của người Việt. Khi nghe lại, chú ý âm /s/, /z/, /t/, /d/ ở cuối từ, nhất là khi từ sau bắt đầu bằng nguyên âm (nối âm).'))) : null));
        acc >= .9 ? FX.sfx.ok() : FX.sfx.tap();
        checkBtn.textContent = i + 1 >= items.length ? 'Xem kết quả' : 'Câu tiếp';
        ta.disabled = true;
        checkBtn.focus();
      }
    }
    function done() {
      U.clear(stage);
      const acc = total / items.length;
      Store.save(true);
      stage.appendChild(h('div.col.g16.page-enter', { style: { alignItems: 'center', textAlign: 'center' } },
        Art.mascot(Art.kindOf(p.id), acc >= .8 ? 'happy' : 'think', 'lg'),
        h('h1', { style: { fontSize: '26px' } }, 'Trung bình đúng ' + Math.round(acc * 100) + '% số từ'),
        h('p.muted', acc >= .9 ? 'Tai bạn đã bắt rất tốt. Thử mức khó hơn.' : 'Chép lại những câu sai thêm một lần nữa sẽ nhớ rất lâu.'),
        h('div.row', h('button.btn.secondary.lg', { onclick: () => App.go('dictation', params[0]) }, ic('refresh'), 'Thêm 5 câu'), h('button.btn.lg', { onclick: () => App.go('dictation') }, 'Xong'))));
      UI.award(xp + 3);
    }
    draw();
    return () => UI.focus(false);
  }
});
