App.register('hanzi', {
  render(root, params) {
    const { h, clear } = U;
    const p = Store.P();
    let tab = params[0] || 'radicals';
    root.appendChild(UI.pageTitle('🀄', 'Chữ Hán'));
    const tabs = h('div.tabs');
    const body = h('div');
    root.append(tabs, body);
    const TABS = [['radicals', 'Bộ thủ'], ['write', 'Tập viết'], ['traps', 'Bẫy Hán Việt']];
    function paintTabs() { clear(tabs); TABS.forEach(([k, l]) => tabs.appendChild(h('button' + (k === tab ? '.on' : ''), { onclick: () => { tab = k; paintTabs(); paint(); } }, l))); }
    function paint() { clear(body); ({ radicals, write, traps })[tab](); }
    paintTabs(); paint();

    function radicals() {
      body.append(
        h('div.card.tint-clay', h('div.tip-card', h('span.te', '🔍'), h('div', h('b', '50 bộ thủ hay gặp nhất HSK1–4'), h('p', 'Bộ thủ cho biết nhóm nghĩa của chữ. Bấm vào để xem ví dụ, nghe đọc và tập viết.')))),
        h('div.rad-grid.mt', HSK.radicals.map(r => h('button.rad', { onclick: () => openRad(r) }, h('span.zh', r[0]), h('small', r[3].split(',')[0])))));
    }
    function openRad(r) {
      const [rad, py, hv, mean, ex] = r;
      FX.modal(h('div.center',
        UI.hz(rad),
        h('div.py', py), h('div.hv', 'Bộ ' + hv), h('div.vi', mean),
        h('div.sec-title', { style: { justifyContent: 'center' } }, 'Chữ có bộ này'),
        h('div.row.wrap', { style: { justifyContent: 'center' } }, ex.split(/\s+/).map(c => {
          const w = D.byHz[c] && D.byHz[c][0];
          return h('button.btn.ghost.sm', { onclick: () => w ? UI.openWord(w) : UI.writerModal(c) }, h('span.zh', { style: { fontSize: '22px' } }, c), w ? h('span.small', ' ' + w.vi.split(/[,;]/)[0]) : null);
        })),
        h('button.btn.indigo.block.mt', { onclick: () => UI.writerModal(ex.split(/\s+/)[0]) }, '✍️ Tập viết chữ đầu tiên')));
    }
    function write() {
      const recent = Object.entries(p.cards).sort((a, b) => b[1].last - a[1].last).slice(0, 18).map(([id]) => D.byId[id]).filter(Boolean);
      const inp = h('input.input.zh', { placeholder: 'Nhập chữ Hán, ví dụ: 爱', maxlength: 6, style: { fontSize: '22px' } });
      const holder = h('div.mt');
      const go = () => { const v = U.onlyHan(inp.value); if (!v) return FX.toast('Nhập chữ Hán trước nhé!'); clear(holder); holder.appendChild(UI.writerPanel(v)); };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      body.append(
        h('div.row', inp, h('button.btn', { onclick: go }, 'Xem')),
        recent.length ? h('div.mt', h('div.small.muted', { style: { fontWeight: 600 } }, 'Từ vừa học:'), h('div.row.wrap.mt', recent.map(w => h('button.btn.ghost.sm', { onclick: () => { inp.value = w.hz; go(); } }, h('span.zh', { style: { fontSize: '18px' } }, w.hz))))) : null,
        holder,
        h('div.card.tint-leaf.mt', h('div.tip-card', h('span.te', '✍️'), h('div', h('b', 'Quy tắc viết cơ bản'), h('p', 'Ngang trước sổ sau · Phẩy trước mác sau · Trên trước dưới sau · Trái trước phải sau · Ngoài trước trong sau · Vào nhà rồi đóng cửa (国) · Giữa trước hai bên sau (小).')))));
      if (recent[0]) { inp.value = recent[0].hz; go(); }
    }
    function traps() {
      body.append(
        h('div.card.tint-jade', h('div.tip-card', h('span.te', '⚠️'), h('div', h('b', 'Bẫy Hán Việt'), h('p', 'Âm Hán Việt giúp đoán nghĩa rất nhiều, nhưng những từ dưới đây đã đổi nghĩa trong tiếng Trung hiện đại. Học kỹ để không bị lừa!')))),
        h('button.btn.block.mt', { onclick: quiz }, '🎲 Đố vui 10 câu'),
        h('div.list.mt', HSK.falseFriends.map(([hz, hv, real]) => h('div.li', { onclick: () => { const w = D.byHz[hz] && D.byHz[hz][0]; w ? UI.openWord(w) : Speech.speak(hz); } },
          h('span.lz', hz), h('div.lm', h('b', 'Hán Việt: ' + hv), h('span', '→ ' + real)), h('span', '🔊')))));
    }
    function quiz() {
      clear(body);
      const rnd = U.rng(Date.now());
      const qs = U.sample(HSK.falseFriends, 10, rnd).map(([hz, hv, real]) => {
        const wrong = U.sample(HSK.falseFriends.filter(x => x[2] !== real), 2, rnd).map(x => ({ t: x[2] }));
        const { opts, ans } = Q.mkOpts({ t: real }, [{ t: hv + ' (nghĩa Hán Việt)' }, ...wrong], rnd);
        return { type: 'mc', title: 'Nghĩa thật trong tiếng Trung là gì?', main: hz, zh: true, sub: 'Hán Việt: ' + hv, audio: hz, autoplay: true, opts, ans, note: `${hz} (${hv}) = ${real}` };
      });
      const holder = h('div'); body.appendChild(holder);
      const run = R.runner(holder, {
        questions: qs, onExit: () => { tab = 'traps'; paint(); }, onFinish: res => {
          const xp = 5 + res.right;
          const ev = Store.addXP(xp);
          R.resultScreen(holder, res, { xp, buttons: [h('button.btn.block', { onclick: quiz }, '🔁 Chơi lại'), h('button.btn.ghost.block', { onclick: () => { tab = 'traps'; paint(); } }, '← Quay lại')] });
          UI.celebrate(ev);
        }
      });
      root._cleanup = run.cleanup;
    }
  }
});
