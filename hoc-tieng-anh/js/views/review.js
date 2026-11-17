App.register('review', {
  render(root, params) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const p = Store.P();
    let cards = D.dueCards(p).slice(0, 40);
    let free = false;
    if (!cards.length) {
      const learned = D.words.filter(w => p.cards[w.id]);
      if (params[0] !== 'free') {
        root.append(h('div.mb', UI.back('vocab', 'Từ vựng')), h('div.card.pad-l.center', h('div.col', { style: { alignItems: 'center' } },
          Art.mascot(Art.kindOf(p.id), 'happy', 'lg'),
          h('h2', 'Không còn thẻ nào đến hạn'),
          h('p.muted', learned.length ? 'Bạn đã ôn đúng thời điểm vàng. Có thể ôn tự do hoặc học thêm từ mới.' : 'Hãy học vài từ mới trước, app sẽ nhắc ôn đúng lúc sắp quên.'),
          h('div.row.wrap', { style: { justifyContent: 'center' } },
            h('button.btn', { onclick: () => App.go('learn', D.nextTopic(p).id) }, ic('sparkle'), 'Học từ mới'),
            learned.length >= 5 ? h('button.btn.secondary', { onclick: () => App.go('review', 'free') }, ic('shuffle'), 'Ôn tự do 20 từ') : null))));
        return;
      }
      cards = U.sample(learned.sort((a, b) => SRS.retrievability(p.cards[a.id]) - SRS.retrievability(p.cards[b.id])).slice(0, 60), 20);
      free = true;
    }
    UI.focus(true);
    let i = 0, flipped = false, mode = 'en';
    const t0 = Date.now();
    const tally = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const bar = UI.bar(0, 'thick');
    const cnt = h('span.cnt', '0/' + cards.length);
    const modeSeg = h('div.seg', [['en', 'Từ → nghĩa'], ['audio', 'Nghe → nghĩa'], ['vi', 'Nghĩa → từ']].map(([k, t]) => h('button' + (k === mode ? '.on' : ''), { onclick: e => { mode = k; [...modeSeg.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); draw(); } }, t)));
    const stage = h('div');
    const wrap = h('div.runner', h('div.run-head', h('button.icon-btn.ghost', { onclick: done, title: 'Thoát' }, ic('x')), bar, cnt), h('div.row', { style: { justifyContent: 'center', marginBottom: '18px' } }, modeSeg), stage);
    root.appendChild(wrap);
    function front(w) {
      if (mode === 'audio') return [h('div.eyebrow', 'Nghe và nhớ nghĩa'), UI.audioBtn(w.w, { size: 'lg' }), h('div.muted.small', 'Bấm để nghe lại')];
      if (mode === 'vi') return [h('div.eyebrow', 'Từ tiếng Anh là gì?'), h('div', { style: { fontSize: '24px', fontWeight: 700, lineHeight: 1.35 } }, w.vi), h('span.tag', D.POS_SHORT[w.pos] || w.pos)];
      return [h('div.eyebrow', D.POS[w.pos] || w.pos), h('div.q-word', w.w), h('div.ipa', { style: { fontSize: '17px' } }, w.ipa), UI.audioBtn(w.w)];
    }
    function draw() {
      U.clear(stage);
      if (i >= cards.length) return done();
      flipped = false;
      const w = cards[i];
      const card = p.cards[w.id];
      const prev = card ? SRS.preview(card) : { 1: 0, 2: 0, 3: 1, 4: 4 };
      const fl = h('div.flash', { onclick: flip },
        h('div.face', front(w), h('div.hint', 'Bấm thẻ hoặc phím cách để lật')),
        h('div.face.back', h('div.row.wrap', { style: { justifyContent: 'center', gap: '12px' } }, h('div.q-word', { style: { fontSize: '30px' } }, w.w), UI.accentBtns(w.w)), h('div.ipa', w.ipa), h('div', { style: { fontSize: '18px', fontWeight: 650 } }, w.vi), w.ex ? h('div.ex', h('div.grow', UI.markEx(w.exRaw)), UI.audioBtn(w.ex, { size: 'sm' })) : null, w.fam.length ? h('div.fam', { style: { justifyContent: 'center' } }, w.fam.map(f => h('span', f.w, f.pos ? h('em', f.pos) : null))) : null));
      const grades = h('div.grades', [[1, 'Quên'], [2, 'Khó'], [3, 'Nhớ'], [4, 'Dễ']].map(([g, t]) => h('button.grade.g' + g, { onclick: () => grade(g) }, t, h('small', U.fmtInterval(prev[g])))));
      grades.style.visibility = 'hidden';
      stage.append(h('div.flash-wrap', fl), grades);
      stage._fl = fl; stage._gr = grades;
      if (mode !== 'vi') setTimeout(() => Speech.speak(w.w), 250);
    }
    function flip() {
      if (flipped) return;
      flipped = true;
      stage._fl.classList.add('flip');
      stage._gr.style.visibility = 'visible';
      FX.sfx.flip();
      if (mode === 'vi') Speech.speak(cards[i].w);
    }
    function grade(g) {
      if (!flipped) return;
      const w = cards[i];
      p.cards[w.id] = SRS.grade(p.cards[w.id] || SRS.newCard(), g);
      tally[g]++;
      p.stats.reviews++;
      Store.bump('reviews');
      i++;
      bar.firstChild.style.width = (i / cards.length * 100) + '%';
      cnt.textContent = i + '/' + cards.length;
      g >= 3 ? FX.sfx.ok() : FX.sfx.tap();
      draw();
    }
    function done() {
      document.removeEventListener('keydown', onKey);
      Speech.stop();
      U.clear(stage);
      const n = i;
      const xp = n + (n >= 10 ? 5 : 0);
      Store.save(true);
      stage.appendChild(h('div.col.g16.page-enter', { style: { alignItems: 'center', textAlign: 'center' } },
        Art.mascot(Art.kindOf(p.id), 'happy', 'lg'),
        h('h1', { style: { fontSize: '26px' } }, n ? 'Ôn xong ' + n + ' thẻ' : 'Chưa ôn thẻ nào'),
        h('div.grid.g4', { style: { width: '100%', maxWidth: '520px' } }, [[1, 'Quên', 'bad'], [2, 'Khó', 'warn-d'], [3, 'Nhớ', 'ok'], [4, 'Dễ', 'brand']].map(([g, t, c]) => h('div.stat-tile', h('div.stat', h('div.v', { style: { color: 'var(--' + c + ')' } }, tally[g]), h('div.k', t))))),
        h('p.muted', 'Thời gian ' + U.fmtDur((Date.now() - t0) / 1000) + (free ? ' · ôn tự do' : ' · thẻ quên sẽ quay lại sau 10 phút')),
        h('div.row', h('button.btn.lg', { onclick: () => App.go('vocab') }, 'Xong'))));
      if (n) { UI.award(xp); FX.sfx.done(); }
    }
    function onKey(e) {
      if (e.key === ' ') { e.preventDefault(); flip(); }
      else if (/^[1-4]$/.test(e.key)) grade(+e.key);
      else if (e.key === 'Escape') done();
    }
    document.addEventListener('keydown', onKey);
    draw();
    return () => { document.removeEventListener('keydown', onKey); UI.focus(false); };
  }
});
