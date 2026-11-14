App.register('sounds', {
  render(root, params) {
    const { h, clear } = U;
    const p = Store.P();
    let tab = params[0] || 'tones';
    root.appendChild(UI.pageTitle('🎵', 'Phát âm & thanh điệu'));
    const tabs = h('div.tabs');
    const body = h('div');
    root.append(tabs, body);
    const TABS = [['tones', '4 thanh'], ['listen', 'Nghe thanh'], ['hv', 'Đoán qua Hán Việt'], ['pairs', 'Âm dễ nhầm']];
    function paintTabs() { clear(tabs); TABS.forEach(([k, l]) => tabs.appendChild(h('button' + (k === tab ? '.on' : ''), { onclick: () => { tab = k; paintTabs(); paint(); } }, l))); }
    function paint() {
      clear(body);
      ({ tones, listen, hv, pairs })[tab]();
    }
    paintTabs(); paint();

    function contour(t) {
      const pts = { 1: [[10, 10], [90, 10]], 2: [[10, 30], [90, 6]], 3: [[10, 26], [45, 42], [90, 12]], 4: [[10, 6], [90, 42]], 5: [[45, 28], [55, 28]] }[t];
      const d = pts.map((q, i) => (i ? 'L' : 'M') + q[0] + ' ' + q[1]).join(' ');
      const el = h('div');
      el.innerHTML = `<svg viewBox="0 0 100 48"><g stroke="#E6E1D6">${[6, 15, 24, 33, 42].map(y => `<line x1="4" x2="96" y1="${y}" y2="${y}"/>`).join('')}</g><path d="${t === 3 ? 'M10 26 Q45 52 90 12' : d}" stroke="#0B5F4F" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
      return el.firstChild;
    }
    function tones() {
      const data = [[1, '妈', 'mā', 'mẹ', 'Cao, bằng, kéo dài, cao hơn thanh ngang tiếng Việt'], [2, '麻', 'má', 'tê', 'Đi lên như thanh sắc'], [3, '马', 'mǎ', 'ngựa', 'Xuống thấp rồi lên. Trong câu thường chỉ đọc nửa trầm (gần thanh hỏi)'], [4, '骂', 'mà', 'mắng', 'Từ cao rơi mạnh, dứt khoát'], [5, '吗', 'ma', 'không? (hỏi)', 'Thanh nhẹ: ngắn, nhẹ, không nhấn']];
      body.append(
        h('div.grid3', data.map(([t, hz, py, vi, desc]) => h('div.tone-card', { onclick: () => Speech.speak(hz) },
          contour(t), h('div.zh', hz), h('b', { style: { color: 'var(--jade-d)', fontSize: '18px' } }, py), h('div.small', { style: { fontWeight: 600 } }, (t === 5 ? 'Thanh nhẹ' : 'Thanh ' + t) + ' · ' + vi), h('div.small.muted', { style: { fontWeight: 500 } }, desc)))),
        h('div.sec-title', '🔄 Biến điệu phải nhớ'),
        h('div.col', [
          ['你好', 'nǐ hǎo → ní hǎo', 'Hai thanh 3 đi liền: âm đầu đọc thành thanh 2'],
          ['不是', 'bù shì → bú shì', '不 đứng trước thanh 4 đọc thành bú'],
          ['一个', 'yī gè → yí gè', '一 trước thanh 4 đọc thành yí'],
          ['一起', 'yī qǐ → yì qǐ', '一 trước thanh 1, 2, 3 đọc thành yì'],
          ['好吗', 'hǎo ma', 'Thanh 3 trước thanh nhẹ: đọc nửa trầm rồi hơi lên']
        ].map(([hz, py, d]) => h('div.li', { onclick: () => Speech.speak(hz) }, h('span.lz', hz), h('div.lm', h('b', py), h('span', d)), h('span', '🔊')))),
        h('div.card.tint-indigo.mt', h('div.tip-card', h('span.te', '🪞'), h('div', h('b', 'Mẹo cho người Việt'), h('p', 'Thanh 1 hay bị đọc thấp, hãy nâng giọng cao hẳn. Thanh 4 phải rơi hết đà như khi nói "Không!" thật dứt khoát. Thanh 3 trong câu đa số chỉ đọc phần trầm. Tập trước gương, ghi âm lại nghe.')))));
    }
    function listen() {
      body.append(h('div.card.tint-sky', h('div.tip-card', h('span.te', '🎧'), h('div', h('b', 'Nghe chọn thanh điệu'), h('p', '10 từ 1–2 âm tiết, nghe rồi chọn đúng chuỗi thanh. Mỗi câu đúng giúp tai bạn nhạy hơn!')))),
        h('div.grid2.mt', [[2, 'Từ HSK1–2'], [4, 'Từ HSK1–4']].map(([lv, t]) => h('button.tile', { onclick: () => startListen(lv) }, h('span.te', lv === 2 ? '🐣' : '🦅'), t, h('span.sub', '10 câu')))));
    }
    function startListen(lvMax) {
      clear(body);
      const rnd = U.rng(Date.now());
      const qs = [];
      while (qs.length < 10) { const q = Q.toneGameItem(rnd, lvMax); if (q && !qs.some(x => x.word === q.word)) qs.push(q); }
      const holder = h('div'); body.appendChild(holder);
      const run = R.runner(holder, {
        questions: qs, onExit: () => { tab = 'listen'; paint(); }, onFinish: res => {
          p.stats.tones += res.right; Store.save();
          const xp = 5 + res.right;
          const ev = Store.addXP(xp);
          R.resultScreen(holder, res, { xp, buttons: [h('button.btn.block', { onclick: () => startListen(lvMax) }, '🔁 Chơi tiếp'), h('button.btn.ghost.block', { onclick: () => { tab = 'listen'; paint(); } }, '← Quay lại')] });
          UI.celebrate(ev);
        }
      });
      root._cleanup = run.cleanup;
    }
    function hv() {
      body.append(
        h('div.card.tint-indigo', h('b', '📜 Quy luật Hán Việt → thanh tiếng Trung'), h('table.simple.mt',
          h('tr', h('th', 'Hán Việt'), h('th', 'Thường là'), h('th', 'Ví dụ')),
          ...[['huyền', 'thanh 2', '同 đồng tóng'], ['hỏi', 'thanh 3', '好 hảo hǎo'], ['ngã', '3 (m/n/l/ng/nh/v) hoặc 4', '马 mã mǎ'], ['sắc', 'thanh 4', '爱 ái ài'], ['nặng', 'thanh 4', '大 đại dà'], ['ngang', '1 (hoặc 2 nếu m/n/l/ng/nh/v)', '天 thiên tiān · 人 nhân rén'], ['-p -t -c -ch', 'khó đoán', '学 học xué']].map(r => h('tr', ...r.map((c, i) => h('td', i === 2 ? h('span.zh', c) : c)))))),
        h('button.btn.indigo.block.mt', { onclick: startHv }, '🎲 Chơi đoán thanh (10 chữ)'));
    }
    function startHv() {
      clear(body);
      const rnd = U.rng(Date.now());
      let i = 0, right = 0, ruleHits = 0;
      const items = [];
      while (items.length < 10) { const it = Q.hvGameItem(rnd); if (!items.some(x => x.c === it.c)) items.push(it); }
      round();
      function round() {
        clear(body);
        if (i >= items.length) return end();
        const it = items[i];
        const btns = h('div.tone-btns');
        const info = h('div');
        [1, 2, 3, 4].forEach(t => btns.appendChild(h('button.tone-btn', { onclick: e => choose(t, e.currentTarget) }, t + Q.toneLabel([t]).slice(1), h('small', ['', 'ngang cao', 'đi lên', 'xuống-lên', 'rơi xuống'][t]))));
        body.append(
          h('div.quiz-top', h('button.btn.ghost.icon.sm', { onclick: () => { tab = 'hv'; paint(); } }, '✕'), UI.progress(i / items.length, 'indigo'), h('span.combo', `${right}/${i}`)),
          h('div.card.center.page-enter',
            h('div.qtitle', { style: { fontWeight: 700, color: 'var(--ink2)' } }, 'Đoán thanh tiếng Trung của chữ này'),
            UI.hz(it.c),
            h('div.hv', { style: { fontSize: '22px' } }, 'Hán Việt: ' + it.hv),
            h('div.small.muted', { style: { fontWeight: 500 } }, `(trong từ ${it.w.hz} · ${it.w.vi})`)),
          h('div.mt', btns), info);
        let locked = false;
        function choose(t, el) {
          if (locked) return; locked = true;
          const ok = t === it.t;
          if (ok) { right++; FX.sfx.ok(); el.classList.add('right'); } else { FX.sfx.bad(); el.classList.add('wrong'); btns.children[it.t - 1].classList.add('right'); }
          if (it.ok) ruleHits++;
          Speech.speak(it.c);
          info.appendChild(h('div.card.mt.' + (ok ? 'tint-leaf' : 'tint-jade'),
            h('b', `${it.c} mang thanh ${it.t} (trong ${it.w.hz} · ${it.w.py})`),
            h('div.small', { style: { fontWeight: 500, marginTop: '4px' } }, (it.ok ? '✅ Quy luật đoán đúng! ' : '🤔 Chữ này là ngoại lệ. ') + (it.tip || '')),
            h('button.btn.block.mt', { onclick: () => { i++; round(); } }, i < items.length - 1 ? 'Tiếp ➜' : 'Xem kết quả')));
        }
      }
      function end() {
        clear(body);
        const ev = Store.addXP(5 + right);
        p.stats.tones += right; Store.save();
        R.resultScreen(body, { acc: right / items.length, maxCombo: null, secs: 0 }, {
          xp: 5 + right, title: `Đúng ${right}/${items.length} chữ`, hideStars: false,
          extra: h('div.card.tint-indigo', h('b', `Quy luật Hán Việt đúng với ${ruleHits}/${items.length} chữ trong lượt này`), h('div.small.muted', { style: { fontWeight: 500 } }, 'Nhớ quy luật giúp bạn đoán đúng phần lớn chữ mới gặp!')),
          buttons: [h('button.btn.block', { onclick: startHv }, '🔁 Chơi tiếp'), h('button.btn.ghost.block', { onclick: () => { tab = 'hv'; paint(); } }, '← Quay lại')]
        });
        UI.celebrate(ev);
      }
    }
    function pairs() {
      const P = [
        ['zh – z', [['知道', 'zhīdao'], ['自己', 'zìjǐ']], 'zh uốn lưỡi lên vòm họng; z lưỡi thẳng chạm sau răng'],
        ['ch – c', [['吃', 'chī'], ['次', 'cì']], 'ch uốn lưỡi + bật hơi; c lưỡi thẳng + bật hơi'],
        ['sh – s', [['是', 'shì'], ['四', 'sì']], 'sh uốn lưỡi; s như "x" tiếng Việt'],
        ['j – q – x', [['鸡蛋', 'jīdàn'], ['七', 'qī'], ['西瓜', 'xīguā']], 'j ≈ "ch" nhẹ, q ≈ "ch" bật hơi mạnh, x ≈ "x" mặt lưỡi'],
        ['ü – u', [['女', 'nǚ'], ['努力', 'nǔlì']], 'ü: tròn môi nói "i" (như "uy" khép); u: như "u"'],
        ['r – l', [['热', 'rè'], ['乐', 'lè']], 'r uốn lưỡi gần như "r/gi" nhẹ; l như "l"'],
        ['an – ang', [['看', 'kàn'], ['抗', 'kàng']], 'an kết thúc đầu lưỡi; ang kết thúc cuống lưỡi (như "ang" tiếng Việt)'],
        ['en – eng', [['门', 'mén'], ['朋友', 'péngyou']], 'en ≈ "ân"; eng ≈ "âng"'],
        ['in – ing', [['今天', 'jīntiān'], ['星期', 'xīngqī']], 'in ≈ "in"; ing ≈ "inh"'],
        ['e', [['喝', 'hē'], ['饿', 'è']], 'e đọc gần "ưa/ơ", không phải "e" tiếng Việt']
      ];
      body.append(h('div.col', P.map(([t, ex, d]) => h('div.card',
        h('b', { style: { fontSize: '17px' } }, t), h('div.small.muted', { style: { fontWeight: 500 } }, d),
        h('div.row.wrap.mt', ex.map(([hz, py]) => h('button.btn.ghost.sm', { onclick: () => Speech.speak(hz) }, h('span.zh', { style: { fontSize: '18px' } }, hz), ' ' + py, ' 🔊')))))));
    }
  }
});
