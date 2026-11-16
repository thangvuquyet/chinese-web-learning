const Pron = (() => {
  const { h, clear } = U;
  const HAN = /[㐀-鿿]/;
  const TONE_TIP = {
    1: 'thanh 1 giữ cao và bằng từ đầu tới cuối',
    2: 'thanh 2 đi lên như dấu sắc',
    3: 'thanh 3 hạ thấp xuống (trong câu chỉ cần phần trầm)',
    4: 'thanh 4 rơi mạnh từ cao xuống, dứt khoát',
    5: 'thanh nhẹ đọc ngắn và nhẹ'
  };
  const PAIRS = [
    [['zh', 'z'], 'zh uốn đầu lưỡi lên, z để lưỡi thẳng sau răng'],
    [['ch', 'c'], 'ch uốn lưỡi và bật hơi, c lưỡi thẳng và bật hơi'],
    [['sh', 's'], 'sh uốn lưỡi, s đọc như "x" tiếng Việt'],
    [['n', 'l'], 'n cho hơi ra mũi, l cho hơi ra hai bên lưỡi'],
    [['r', 'l'], 'r uốn lưỡi, gần như "r" nhẹ; l như "l"'],
    [['j', 'zh'], 'j đặt mặt lưỡi, môi dẹt; zh uốn lưỡi'],
    [['q', 'ch'], 'q đặt mặt lưỡi và bật hơi; ch uốn lưỡi'],
    [['x', 'sh'], 'x đặt mặt lưỡi; sh uốn lưỡi'],
    [['f', 'h'], 'f chạm răng trên vào môi dưới; h bật hơi từ cổ'],
    [['b', 'p'], 'p bật hơi mạnh, b không bật hơi'],
    [['d', 't'], 't bật hơi mạnh, d không bật hơi'],
    [['g', 'k'], 'k bật hơi mạnh, g không bật hơi'],
    [['an', 'ang'], 'an kết thúc ở đầu lưỡi, ang kết thúc ở cuống lưỡi'],
    [['ian', 'iang'], 'ian kết thúc ở đầu lưỡi, iang kết thúc ở cuống lưỡi'],
    [['uan', 'uang'], 'uan kết thúc ở đầu lưỡi, uang kết thúc ở cuống lưỡi'],
    [['en', 'eng'], 'en gần "ân", eng gần "âng"'],
    [['in', 'ing'], 'in gần "in", ing gần "inh"'],
    [['u', 'ü'], 'ü tròn môi rồi nói "i"'],
    [['un', 'ong'], 'un đọc "uân", ong đọc "ung"'],
    [['e', 'ei'], 'e đọc gần "ưa", ei đọc gần "ây"']
  ];
  const EQUIV = { '两': '二' };

  const split = U.splitPy;
  function numZh(str) {
    const D1 = '零一二三四五六七八九';
    const int = s => {
      let n = parseInt(s, 10);
      if (!n) return '零';
      if (n >= 100000000) return [...s].map(c => D1[c]).join('');
      const four = x => {
        const u = ['', '十', '百', '千'];
        const ds = String(x).padStart(4, '0');
        let out = '', zero = false;
        for (let i = 0; i < 4; i++) {
          const d = +ds[i];
          if (!d) { zero = out.length > 0; continue; }
          if (zero) { out += '零'; zero = false; }
          out += D1[d] + u[3 - i];
        }
        return out;
      };
      let out = '';
      if (n >= 10000) { out = four(Math.floor(n / 10000)) + '万'; n %= 10000; if (n && n < 1000) out += '零'; }
      out += n ? four(n) : '';
      return out.replace(/^一十/, '十');
    };
    return str
      .replace(/(\d{4})年/g, (m, y) => [...y].map(c => D1[c]).join('') + '年')
      .replace(/(\d+)%/g, (m, a) => '百分之' + int(a))
      .replace(/(\d+):(\d{2})/g, (m, a, b) => int(a) + '点' + (b === '00' ? '' : (b[0] === '0' ? '零' : '') + int(b)))
      .replace(/(\d+)\.(\d+)/g, (m, a, b) => int(a) + '点' + [...b].map(c => D1[c]).join(''))
      .replace(/(?<![\d.])2(?=[个本张次杯位件块条双口家把辆台岁点只种])/g, '两')
      .replace(/\d+/g, int);
  }
  function syls(text) {
    const src = numZh(String(text || '')).replace(/[A-Za-z\s]+/g, '');
    const toks = D.toksOf(src);
    const out = [];
    toks.forEach((raw, i) => {
      const chars = [...raw].filter(c => HAN.test(c));
      if (!chars.length) return;
      const py = D.readAt(toks, i) || '';
      const parts = split(py, chars.length);
      chars.forEach((c, k) => {
        const s = parts ? parts[k] : null;
        out.push({ c, py: s ? s.py : '', base: s ? s.base : '', tone: s ? s.tone : 0, opt: c === '儿' && s && s.base === 'r' });
      });
    });
    return out;
  }
  function initFinal(b) {
    const m = b.match(/^(zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?(.*)$/);
    let ini = m[1] || '', fin = m[2];
    if (/^[jqxy]$/.test(ini) && fin[0] === 'u') fin = 'ü' + fin.slice(1);
    return [ini, fin];
  }
  function nearTip(a, b) {
    if (!a.base || !b.base) return null;
    const [ia, fa] = initFinal(a.base), [ib, fb] = initFinal(b.base);
    const hit = (x, y) => PAIRS.find(([p]) => (p[0] === x && p[1] === y) || (p[0] === y && p[1] === x));
    if (fa === fb && ia !== ib) { const p = hit(ia, ib); return p ? p[1] : null; }
    if (ia === ib && fa !== fb) { const p = hit(fa, fb); return p ? p[1] : null; }
    return null;
  }
  const eqC = (a, b) => a === b || EQUIV[a] === b || EQUIV[b] === a;
  function rel(t, x) {
    if (eqC(t.c, x.c)) return 'ok';
    if (t.base && t.base === x.base) return t.tone === x.tone || t.tone === 5 || x.tone === 5 ? 'ok' : 'tone';
    if (nearTip(t, x)) return 'near';
    return 'miss';
  }
  const COST = { ok: 0, tone: 0.45, near: 0.55, miss: 1 };
  function check(target, heard) {
    const T = syls(target), H = syls(heard);
    const m = T.length, n = H.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i ? i : j)));
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j - 1] + COST[rel(T[i - 1], H[j - 1])], dp[i - 1][j] + 1, dp[i][j - 1] + 1);
    }
    const items = T.map(t => ({ ...t, st: 'miss', heard: null }));
    const erDrop = () => items.forEach(x => { if (x.opt && x.st === 'miss' && !x.heard) x.st = 'ok'; });
    let extra = 0, i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && Math.abs(dp[i][j] - (dp[i - 1][j - 1] + COST[rel(T[i - 1], H[j - 1])])) < 1e-9) {
        const r = rel(T[i - 1], H[j - 1]);
        items[i - 1].st = r; items[i - 1].heard = H[j - 1];
        i--; j--;
      } else if (i > 0 && Math.abs(dp[i][j] - (dp[i - 1][j] + 1)) < 1e-9) { i--; }
      else { extra++; j--; }
    }
    erDrop();
    const W = { ok: 1, tone: 0.5, near: 0.55, miss: 0 };
    const sum = items.reduce((a, x) => a + W[x.st], 0);
    const score = m ? U.clamp((sum - extra * 0.5) / m, 0, 1) : 0;
    const soundOk = items.filter(x => x.st === 'ok' || x.st === 'tone').length;
    const toneOk = items.filter(x => x.st === 'ok' || (x.heard && x.heard.tone === x.tone)).length;
    return { score, items, extra, n: m, soundOk, toneOk, heardText: heard };
  }
  function tips(res) {
    const out = [];
    const tone = res.items.filter(x => x.st === 'tone');
    const near = res.items.filter(x => x.st === 'near');
    const miss = res.items.filter(x => x.st === 'miss');
    tone.slice(0, 3).forEach(x => out.push(['tone', h('span', h('b.zh', x.c), ` cần đọc ${x.py} (thanh ${x.tone === 5 ? 'nhẹ' : x.tone}), app nghe ra ${x.heard.py} (thanh ${x.heard.tone === 5 ? 'nhẹ' : x.heard.tone}). Nhớ: ${TONE_TIP[x.tone]}.`)]));
    near.slice(0, 2).forEach(x => out.push(['near', h('span', h('b.zh', x.c), ` cần đọc ${x.py}, app nghe ra ${x.heard.py}. ${nearTip(x, x.heard)}.`)]));
    if (miss.length) out.push(['miss', h('span', 'Chưa nghe rõ ', h('b.zh', miss.map(x => x.c).join(' ')), '. Đọc chậm lại, rõ từng chữ, rồi thử lại.')]);
    if (res.extra) out.push(['miss', h('span', `App nghe thừa ${res.extra} chữ. Đọc đúng câu mẫu, không thêm bớt nhé.`)]);
    return out;
  }
  function label(res) {
    const clean = !res.extra && res.items.every(x => x.st === 'ok');
    const s = res.score;
    return s >= 0.9 && clean ? ['Rất chuẩn', 'ok'] : s >= 0.8 ? ['Khá chuẩn', 'ok'] : s >= 0.55 ? ['Cần luyện thêm', 'mid'] : ['Chưa rõ', 'bad'];
  }
  function view(res, opts = {}) {
    const pct = Math.round(res.score * 100);
    const [lb, cls] = label(res);
    const chars = h('div.pron-chars', res.items.map(x => h('span.pc.' + x.st, { title: x.heard && x.st !== 'ok' ? 'App nghe ra: ' + (x.heard.py || x.heard.c) : '' },
      h('i', x.py || ' '), h('b', x.c), x.st !== 'ok' && x.heard ? h('small', x.heard.py || x.heard.c) : h('small', ' '))));
    const list = tips(res);
    return h('div.pron' + (opts.compact ? '.compact' : ''),
      h('div.pron-head',
        h('div.pron-score.' + cls, h('b', pct + '%'), h('span', lb)),
        h('div.pron-meta',
          h('span', h('i.dot.ok'), `Âm đúng ${res.soundOk}/${res.n}`),
          h('span', h('i.dot.tone'), `Thanh đúng ${res.toneOk}/${res.n}`),
          opts.audio ? h('button.btn.ghost.sm', { onclick: () => playBlob(opts.audio) }, Icon.svg('volume'), ' Nghe lại giọng mình') : null)),
      chars,
      list.length ? h('ul.pron-tips', list.map(([k, el]) => h('li.' + k, el))) : h('div.pron-good', 'Không có chữ nào bị lệch âm hay thanh.'),
      opts.compact ? null : h('div.pron-heard', 'App nghe được: ', h('span.zh', res.heardText || '…')));
  }
  let player = null;
  function playBlob(url) {
    Speech.stop();
    if (player) player.pause();
    player = new Audio(url);
    player.play().catch(() => {});
  }
  const enabled = () => Speech.canListen() && Store.settings().speakEx !== false && !(Store.settings().speakOff > Date.now());

  function mic(opts) {
    const out = h('div.pron-out');
    const btn = h('button.mic-btn', { type: 'button', 'aria-label': 'Bấm để nói' }, Icon.svg('mic'));
    const hint = h('div.mic-hint', Speech.canListen() ? (opts.hint || 'Bấm micro rồi đọc to') : 'Trình duyệt này chưa nhận dạng được giọng nói. Hãy mở bằng Chrome hoặc Edge.');
    let busy = false;
    btn.addEventListener('click', async () => {
      if (!Speech.canListen()) { FX.toast('Cần Chrome hoặc Edge để chấm phát âm'); return; }
      if (busy) { Speech.stopListen(); return; }
      if (btn.disabled) return;
      busy = true;
      Speech.stop();
      btn.classList.add('rec');
      hint.textContent = opts.continuous ? 'Đang nghe… nói xong bấm micro lần nữa' : 'Đang nghe… nói xong sẽ tự dừng';
      clear(out);
      opts.onStart && opts.onStart();
      try {
        const r = await Speech.listen({ continuous: !!opts.continuous, record: true, onInterim: t => { hint.textContent = t; } });
        btn.classList.remove('rec'); busy = false;
        hint.textContent = opts.again || 'Bấm micro để thử lại';
        if (!r.text) { out.appendChild(h('div.pron-none', 'Chưa nghe thấy gì. Kiểm tra micro, nói to và gần hơn một chút.')); opts.onNone && opts.onNone(); return; }
        if (opts.custom) { opts.custom(r, out); return; }
        const target = typeof opts.target === 'function' ? opts.target() : opts.target;
        const res = check(target, r.text);
        res.audio = r.audio;
        out.appendChild(view(res, { audio: r.audio, compact: opts.compact }));
        Store.P().stats.speak++;
        if (res.score >= 0.8) Store.bump('speakOk');
        Store.save();
        if (res.score >= 0.75) { FX.sfx.ok(); FX.burstAt(out.querySelector('.pron-score'), 22); } else FX.sfx.tap();
        opts.onResult && opts.onResult(res);
      } catch (e) {
        btn.classList.remove('rec'); busy = false;
        hint.textContent = e.message === 'not-allowed' || e.message === 'service-not-allowed' ? 'Hãy cho phép trang này dùng micro (biểu tượng ổ khóa cạnh thanh địa chỉ).' : e.message === 'network' ? 'Nhận dạng giọng nói cần Internet. Kiểm tra mạng rồi thử lại.' : e.message === 'no-speech' ? 'Chưa nghe thấy gì, thử lại nhé.' : 'Lỗi nhận dạng: ' + e.message;
        opts.onNone && opts.onNone();
      }
    });
    const el = h('div.mic-block', btn, hint, out);
    el.lock = () => { btn.disabled = true; btn.classList.add('off'); };
    el.start = () => btn.click();
    return el;
  }

  const LINKS = ['因为', '所以', '但是', '可是', '而且', '虽然', '如果', '首先', '其次', '然后', '最后', '另外', '比如', '总之', '不但', '不仅', '还有', '觉得', '认为', '因此', '而是', '只要', '即使'];
  const STOP = new Set(['你', '我', '他', '她', '的', '了', '吗', '呢', '吧', '是', '有', '在', '什么', '为什么', '怎么', '怎么样', '哪', '哪儿', '哪里', '谁', '请', '一下', '介绍', '一般', '说说', '说', '谈谈', '最', '一个', '一些', '这', '那', '和', '都', '也', '很', '会', '能', '要', '想', '多', '对', '给', '让', '过', '着', '还', '自己', '平时', '常常', '经常', '比较', '喜欢']);
  function keyWords(q) {
    return [...new Set(D.segment(q).map(t => t.replace(/[^㐀-鿿]/g, '')).filter(t => t && !STOP.has(t)))];
  }
  function answerCheck(q, text, secs) {
    const n = U.countHan(text);
    const links = LINKS.filter(w => text.includes(w));
    const keys = keyWords(q);
    const hitKeys = keys.filter(k => text.includes(k) || ([...k].length >= 2 && [...k].some(c => text.includes(c) && !STOP.has(c))));
    const speed = secs > 3 ? Math.round(n / secs * 60) : 0;
    const crit = [
      ['len', n >= 50, `Độ dài: ${n} chữ`, n >= 50 ? 'đủ ý (HSKK trung cấp nên nói từ 50 chữ trở lên)' : 'còn ngắn, cố nói thêm lý do và ví dụ cho tới khoảng 50 chữ'],
      ['link', links.length >= 2, `Từ nối: ${links.length ? links.join(' · ') : 'chưa có'}`, links.length >= 2 ? 'câu trả lời có mạch lạc' : 'thêm 因为…所以…, 首先…然后…, 而且 để bài nói mạch lạc'],
      ['topic', !keys.length || hitKeys.length > 0, 'Đúng chủ đề', !keys.length || hitKeys.length ? 'có nhắc tới ý chính của câu hỏi' : 'chưa nhắc tới ý của câu hỏi (' + keys.slice(0, 3).join('、') + ')'],
      ['speed', speed >= 70, speed ? `Tốc độ: khoảng ${speed} chữ/phút` : 'Tốc độ', speed >= 70 ? 'nói khá trôi chảy' : 'còn ngắt quãng nhiều, luyện nói liền mạch hơn (khoảng 100 chữ/phút)']
    ];
    return { n, links, crit, passed: crit.filter(c => c[1]).length };
  }
  function answerView(res, r) {
    return h('div.pron',
      h('div.pron-head',
        h('div.pron-score.' + (res.passed >= 3 ? 'ok' : res.passed >= 2 ? 'mid' : 'bad'), h('b', res.passed + '/4'), h('span', 'tiêu chí đạt')),
        h('div.pron-meta', r.audio ? h('button.btn.ghost.sm', { onclick: () => playBlob(r.audio) }, Icon.svg('volume'), ' Nghe lại giọng mình') : null)),
      h('ul.crit', res.crit.map(([k, ok, t, d]) => h('li.' + (ok ? 'ok' : 'no'), h('span.ck', Icon.svg(ok ? 'check' : 'x')), h('div', h('b', t), h('span', d))))),
      h('div.pron-heard', 'App nghe được: ', h('span.zh', r.text)),
      h('div.pyl.small', D.pinyin(r.text)));
  }

  return { syls, check, view, mic, enabled, answerCheck, answerView, playBlob, numZh, split };
})();
