const Pron = (() => {
  const { h } = U;
  const ic = n => Icon.svg(n);
  const FUNC = new Set(['a', 'an', 'the', 'of', 'to', 'and', 'or', 'in', 'on', 'at', 'for', 'by', 'with', 'from', 'is', 'are', 'was', 'were', 'be', 'it', 'its', 'as', 'that', 'this', 'i', 'you', 'we', 'he', 'she', 'they', 'my', 'your', 'our', 'their', 'his', 'her', 'not', 'do', 'does', 'did', 'have', 'has', 'had', 'will', 'would', 'can', 'could', 'should', 'am', 'so', 'if', 'but', 'than', 'then']);
  const TIPS = typeof PH_TIPS !== 'undefined' ? PH_TIPS : {};

  function evaluate(target, rec, wave) {
    const tgt = Phon.tokenize(target);
    const cands = U.uniq([rec.text, ...(rec.alts || [])].filter(Boolean));
    let best = null;
    for (const alt of cands.length ? cands : ['']) {
      const heard = Phon.tokenize(alt);
      const al = Phon.align(tgt, heard);
      const words = tgt.map(t => {
        const ks = al.keys.filter(k => k.own === t.i);
        if (!ks.length) return { d: t.d, i: t.i, st: 'skip', sc: 1, heard: '', keys: [] };
        const sc = U.avg(ks.map(k => k.st === 'good' ? 1 : k.st === 'near' ? .35 + k.sim * .55 : k.st === 'wrong' ? k.sim * .3 : 0));
        const st = ks.some(k => k.st === 'miss') && ks.every(k => k.st === 'miss') ? 'miss' : ks.some(k => k.st === 'wrong') ? 'wrong' : ks.some(k => k.st === 'near') ? 'near' : ks.some(k => k.st === 'miss') ? 'near' : 'good';
        const heardW = ks.map(k => k.heard).filter(Boolean).join(' ');
        const errs = [];
        ks.forEach(k => { if ((k.st === 'near' || k.st === 'wrong') && k.heard) Phon.diagnose(k.k, k.heard.split(' ')[0]).forEach(e => errs.push(e)); });
        return { d: t.d, i: t.i, st, sc, heard: heardW, keys: ks.map(k => k.k), errs: U.uniq(errs), w: ks.every(k => FUNC.has(k.k)) ? .5 : 1 };
      });
      const scored = words.filter(w => w.st !== 'skip');
      const said = scored.filter(w => w.st !== 'miss');
      const acc = scored.length ? U.sum(scored.map(w => (w.st === 'miss' ? 0 : w.sc) * w.w)) / U.sum(scored.map(w => w.w)) : 0;
      const comp = scored.length ? said.length / scored.length : 0;
      const val = acc * .65 + comp * .35;
      if (!best || val > best.val) best = { words, acc, comp, val, heardText: alt, extra: al.extra };
    }
    const nSaid = best.words.filter(w => w.st !== 'miss' && w.st !== 'skip').length;
    let flu = null, wpm = null, pauses = null;
    const span = wave && wave.span > .3 ? wave.span : (rec.span > .5 ? rec.span + .6 : null);
    if (span && nSaid >= 3) {
      wpm = Math.round(nSaid / (span / 60));
      const allowed = (target.match(/[,.;:!?]/g) || []).length;
      const longP = wave ? wave.longPauses.length : 0;
      pauses = wave ? wave.pauses.length : null;
      const rate = wpm >= 105 && wpm <= 175 ? 1 : wpm < 105 ? Math.max(.35, wpm / 105) : Math.max(.6, 1 - (wpm - 175) / 150);
      const pen = Math.max(0, longP - allowed) * .08;
      flu = U.clamp(rate - pen, 0, 1);
    }
    const accP = Math.round(best.acc * 100), compP = Math.round(best.comp * 100), fluP = flu != null ? Math.round(flu * 100) : null;
    const overall = Math.round(fluP != null ? accP * .6 + compP * .25 + fluP * .15 : accP * .7 + compP * .3);
    const errKeys = U.uniq(best.words.flatMap(w => w.errs || []));
    const flawed = best.words.some(w => w.st === 'wrong' || w.st === 'miss');
    return { target, words: best.words, heardText: best.heardText, extra: best.extra, acc: accP, comp: compP, flu: fluP, wpm, pauses, overall: rec.text ? (flawed ? Math.min(overall, 89) : overall) : 0, errKeys, single: best.words.length === 1 };
  }
  function verdict(s) {
    if (s >= 90) return ['good', 'Xuất sắc, rất giống người bản xứ'];
    if (s >= 80) return ['good', 'Tốt, người nghe hiểu rõ'];
    if (s >= 65) return ['mid', 'Khá, còn vài âm cần sửa'];
    if (s >= 45) return ['mid', 'Cần luyện thêm các từ tô vàng, đỏ'];
    return ['low', 'Máy chưa nhận ra phần lớn câu, thử đọc chậm và rõ hơn'];
  }
  const colorOf = s => s >= 80 ? 'var(--ok)' : s >= 60 ? 'var(--warn)' : 'var(--bad)';
  function tipFor(key) {
    const t = TIPS[key];
    if (t) return t;
    return { t: 'Âm chưa rõ', tip: 'Nghe mẫu thật chậm, nhại lại từng âm tiết rồi ghép cả từ.' };
  }
  function wordPop(w, res) {
    const key = w.keys[0] || w.d;
    const ipa = D.ipaOf(key);
    FX.modal(h('div.col.g16',
      h('div.row.wrap', { style: { gap: '14px' } }, h('div', { style: { fontSize: '30px', fontWeight: 800, letterSpacing: '-.02em' } }, w.d.replace(/[.,!?;:"]/g, '')), UI.accentBtns(key)),
      ipa ? h('div.ipa', { style: { fontSize: '18px' } }, ipa) : null,
      h('div.row.wrap',
        h('span.pill.' + (w.st === 'good' ? 'ok' : w.st === 'near' ? 'warn' : 'bad'), w.st === 'good' ? 'Chuẩn' : w.st === 'near' ? 'Gần đúng' : w.st === 'wrong' ? 'Sai âm' : 'Bị bỏ sót'),
        w.heard && w.st !== 'good' ? h('span.small.muted', 'Máy nghe thành: ', h('b', '“' + w.heard + '”')) : null),
      ...(w.errs || []).map(k => { const t = tipFor(k); return h('div.tip', ic('bulb'), h('div', h('b', t.t), h('p', t.tip))); }),
      !(w.errs || []).length && w.st !== 'good' ? h('div.tip.info', ic('info'), h('div', h('b', 'Cách sửa'), h('p', w.st === 'miss' ? 'Từ này bị nuốt hoặc đọc quá nhỏ. Đọc rõ cả từ, đừng lướt.' : 'Nghe mẫu giọng Mỹ và Anh, nhại lại chậm 3 lần, chú ý trọng âm (dấu ˈ trong phiên âm).'))) : null,
      Speech.canListen() ? h('button.btn.secondary', { onclick: () => { FX.closeAll(); modal(key, { ipa }); } }, ic('mic'), 'Luyện riêng từ này') : null));
  }
  function targetView(target, res) {
    const wrap = h('div.pron-target');
    const toks = target.split(/\s+/).filter(Boolean);
    toks.forEach((t, i) => {
      const w = res ? res.words.find(x => x.i === i) : null;
      const cls = w && w.st !== 'skip' ? '.' + w.st : '';
      const sp = h('span.pw' + cls, t);
      if (w && w.st !== 'skip') sp.addEventListener('click', () => wordPop(w, res));
      else sp.addEventListener('click', () => Speech.speak(t.replace(/[^\w'-]/g, '')));
      wrap.appendChild(sp);
      wrap.appendChild(document.createTextNode(' '));
    });
    return wrap;
  }
  function waveView(wave) {
    if (!wave) return null;
    const box = h('div.wv');
    const per = wave.dur / wave.bars.length;
    wave.bars.forEach((b, i) => {
      const t = i * per;
      const inPause = wave.longPauses.some(p => t >= p.at && t <= p.at + p.len);
      box.appendChild(h('i' + (inPause ? '.p' : ''), { style: { height: Math.max(4, b * 100) + '%' } }));
    });
    return box;
  }
  function resultView(res, rec, wave, actions) {
    const [vc, vt] = verdict(res.overall);
    const rings = h('div.scores',
      h('div.score-ring', UI.ring(res.overall / 100, { size: 92, stroke: 8, color: colorOf(res.overall), label: res.overall, font: 28, animate: true }), h('span.lbl', 'Tổng điểm')),
      h('div.score-ring', UI.ring(res.acc / 100, { size: 60, stroke: 6, color: colorOf(res.acc), label: res.acc, animate: true }), h('span.lbl', 'Phát âm')),
      res.single ? null : h('div.score-ring', UI.ring(res.comp / 100, { size: 60, stroke: 6, color: colorOf(res.comp), label: res.comp, animate: true }), h('span.lbl', 'Đầy đủ')),
      res.flu != null ? h('div.score-ring', UI.ring(res.flu / 100, { size: 60, stroke: 6, color: colorOf(res.flu), label: res.flu, animate: true }), h('span.lbl', 'Trôi chảy')) : null);
    const tips = res.errKeys.slice(0, 3).map(k => { const t = tipFor(k); const ex = res.words.filter(w => (w.errs || []).includes(k)).map(w => w.d.replace(/[.,!?;:"]/g, '')).slice(0, 3); return h('div.tip', ic('bulb'), h('div', h('b', t.t + (ex.length ? ' · ' + ex.join(', ') : '')), h('p', t.tip))); });
    const missed = res.words.filter(w => w.st === 'miss').map(w => w.d.replace(/[.,!?;:"]/g, ''));
    if (missed.length && !res.single) tips.push(h('div.tip.info', ic('info'), h('div', h('b', 'Bị bỏ sót: ' + missed.slice(0, 5).join(', ')), h('p', 'Những từ này máy không nghe thấy. Thường do đọc lướt từ nhỏ hoặc nuốt âm cuối. Đọc chậm hơn một chút và bật rõ phụ âm cuối.'))));
    if (res.wpm && res.wpm < 95 && !res.single) tips.push(h('div.tip.info', ic('speed'), h('div', h('b', 'Tốc độ ' + res.wpm + ' từ/phút'), h('p', 'Người bản xứ đọc khoảng 130–160 từ/phút. Đọc theo cụm ý (dừng ở dấu phẩy, dấu chấm), không dừng sau từng từ.'))));
    return h('div.pron-res',
      rings,
      h('div.verdict.' + vc, vt),
      rec.text ? h('div.heard', h('b', 'Máy nghe được'), '“' + rec.text + '”') : null,
      wave ? h('div.wavebox', h('span.small.muted', 'Giọng bạn'), waveView(wave)) : null,
      res.wpm ? h('div.metrics', h('span', 'Tốc độ ', h('b', res.wpm), ' từ/phút'), wave ? h('span', 'Ngắt dài ', h('b', wave.longPauses.length)) : null, wave ? h('span', 'Thời lượng ', h('b', wave.span.toFixed(1) + 's')) : null) : null,
      tips.length ? h('div.tips', tips) : null,
      actions);
  }
  const enabled = () => Speech.canListen() && Store.settings().speakOn !== false;

  function panel(target, opts = {}) {
    const box = h('div.pron');
    let res = null, rec = null, wave = null, busy = false, stopMeter = null, attempts = 0, best = 0;
    const tgtWrap = h('div');
    const ipaLine = opts.ipa ? h('div.pron-ipa', opts.ipa) : null;
    const hint = h('div.mic-hint', enabled() ? 'Bấm micro rồi đọc to câu trên' : 'Trình duyệt này chưa hỗ trợ nhận giọng nói. Hãy mở bằng Chrome hoặc Edge.');
    const interim = h('div.interim');
    const canvas = h('canvas.meter.hidden');
    const micBtn = h('button.mic', { type: 'button', 'aria-label': 'Ghi âm', disabled: !enabled() }, ic('mic'));
    const out = h('div');
    const listenBtn = h('button.btn.secondary.sm', { onclick: () => Speech.speak(target, { rate: .9 }) }, ic('volume'), 'Nghe mẫu');
    const slowBtn = h('button.btn.ghost.sm', { onclick: () => Speech.speak(target, { rate: .7 }) }, ic('speed'), 'Chậm');
    function drawTarget() { U.clear(tgtWrap); tgtWrap.appendChild(targetView(target, res)); }
    async function start() {
      if (busy) { Speech.stopListen(); return; }
      busy = true;
      Speech.stop();
      micBtn.classList.add('rec');
      micBtn.innerHTML = ''; micBtn.appendChild(ic('stop'));
      hint.textContent = 'Đang nghe… đọc xong máy sẽ tự dừng, hoặc bấm để dừng';
      interim.textContent = '';
      U.clear(out);
      const words = target.split(/\s+/).length;
      try {
        rec = await Speech.listen({
          record: true, continuous: words > 14, maxMs: Math.max(7000, words * 900 + 4000),
          onInterim: t => { interim.textContent = t; },
          onStream: st => { canvas.classList.remove('hidden'); stopMeter = Wave.meter(st, canvas); }
        });
      } catch (e) {
        rec = null;
        const msg = e.message === 'not-allowed' ? 'Chrome đang chặn micro. Bấm biểu tượng ổ khóa cạnh địa chỉ trang → Micro → Cho phép, rồi thử lại.'
          : e.message === 'network' ? 'Nhận giọng nói cần Internet. Kiểm tra kết nối rồi thử lại.'
          : e.message === 'unsupported' ? 'Trình duyệt này không hỗ trợ. Hãy dùng Chrome.' : 'Không ghi âm được (' + e.message + '). Thử lại nhé.';
        out.appendChild(h('div.tip.mt', ic('alert'), h('div', h('b', 'Chưa ghi âm được'), h('p', msg))));
      }
      if (stopMeter) { stopMeter(); stopMeter = null; }
      canvas.classList.add('hidden');
      micBtn.classList.remove('rec');
      micBtn.innerHTML = ''; micBtn.appendChild(ic('mic'));
      busy = false;
      if (!rec) { hint.textContent = 'Bấm micro để thử lại'; return; }
      if (!rec.text) { hint.textContent = 'Chưa nghe thấy gì. Nói to, rõ hơn và để micro gần miệng.'; interim.textContent = ''; return; }
      micBtn.classList.add('busy'); micBtn.innerHTML = ''; micBtn.appendChild(ic('refresh'));
      hint.textContent = 'AI đang chấm…';
      wave = rec.blob ? await Wave.analyze(rec.blob) : null;
      res = evaluate(target, rec, wave);
      micBtn.classList.remove('busy'); micBtn.innerHTML = ''; micBtn.appendChild(ic('mic'));
      interim.textContent = '';
      hint.textContent = 'Bấm vào từ có màu để xem lỗi và cách sửa';
      drawTarget();
      attempts++;
      const improved = res.overall > best;
      best = Math.max(best, res.overall);
      Store.noteSpeak(res.overall, res.errKeys, res.words.filter(w => w.st !== 'skip').map(w => [w.keys.join(' '), w.st === 'good']));
      if (opts.xp !== false && attempts <= 3 && res.overall >= 60) UI.award(res.overall >= 80 ? 4 : 2, micBtn);
      if (res.overall >= 90) { FX.sfx.done(); FX.burstAt(micBtn, 40); } else if (res.overall >= 75) FX.sfx.ok(); else FX.sfx.tap();
      const acts = h('div.row.wrap.mt', { style: { justifyContent: 'center' } },
        rec.audio ? h('button.btn.secondary.sm', { onclick: () => Wave.play(rec.audio) }, ic('play'), 'Nghe giọng bạn') : null,
        h('button.btn.secondary.sm', { onclick: () => Speech.speak(target, { rate: .9 }) }, ic('volume'), 'Nghe mẫu'),
        h('button.btn.sm', { onclick: start }, ic('refresh'), 'Đọc lại'));
      out.appendChild(resultView(res, rec, wave, acts));
      opts.onScore && opts.onScore(res, { improved, attempts, best });
    }
    micBtn.addEventListener('click', start);
    drawTarget();
    [opts.title ? h('div.eyebrow.center', { style: { marginBottom: '10px' } }, opts.title) : null,
      tgtWrap, ipaLine, opts.vi ? h('div.center.muted.small.mt4', opts.vi) : null,
      h('div.row', { style: { justifyContent: 'center', marginTop: '10px' } }, listenBtn, slowBtn, h('button.btn.ghost.sm', { onclick: how }, ic('info'), 'AI chấm thế nào?')),
      h('div.mic-zone', micBtn, canvas, interim, hint),
      out].filter(Boolean).forEach(x => box.appendChild(x));
    box.start = start;
    box.result = () => res;
    return box;
  }
  function modal(target, opts = {}) {
    const close = FX.modal(h('div', h('h2', 'Luyện phát âm'), h('p.muted.small', 'AI nghe giọng bạn, chấm từng từ và chỉ ra âm cần sửa.'), h('div.mt', panel(target, opts)), opts.extra ? h('div.mt', h('div.eyebrow', { style: { marginBottom: '8px' } }, 'Thử cả câu ví dụ'), h('button.btn.secondary.sm', { onclick: () => { FX.closeAll(); modal(opts.extra); } }, ic('mic'), opts.extra.length > 60 ? opts.extra.slice(0, 57) + '…' : opts.extra)) : null), { wide: true, onClose: () => Speech.release() });
    return close;
  }
  function how() {
    FX.modal(h('div.lesson',
      h('h2', 'AI chấm phát âm như thế nào?'),
      h('p', 'Khi bạn bấm micro, Chrome gửi giọng nói tới dịch vụ nhận dạng giọng nói của Google (AI chuyển giọng thành chữ). App so khớp kết quả đó với câu mẫu theo từng âm vị, rồi chấm 3 tiêu chí:'),
      h('ul',
        h('li', h('b', 'Phát âm: '), 'mỗi từ được so theo âm (ví dụ /θ/ trong three với /t/ trong tree). Từ máy nghe đúng được tô xanh, gần đúng tô vàng, sai tô đỏ, bị bỏ sót gạch xám.'),
        h('li', h('b', 'Đầy đủ: '), 'tỷ lệ từ trong câu được máy nghe thấy.'),
        h('li', h('b', 'Trôi chảy: '), 'trên máy tính, app ghi âm giọng bạn để đo tốc độ (từ/phút) và các chỗ ngắt dài bất thường.')),
      h('p', 'App còn nhận ra các lỗi người Việt hay gặp: nuốt âm cuối (/s/, /t/, /k/, -ed), /θ/ đọc thành /t/ hoặc /s/, /ʃ/ thành /s/, /v/ thành /b/, nguyên âm dài ngắn (ship – sheep)… và đưa mẹo sửa bằng tiếng Việt.'),
      h('div.callout.warn', ic('alert'), h('div', h('b', 'Giới hạn: '), 'AI nhận dạng có ngữ cảnh nên đôi khi “đoán đúng” dù bạn đọc chưa chuẩn, và chưa chấm được ngữ điệu, trọng âm câu. Hãy dùng điểm như thước đo tiến bộ, kết hợp nghe lại giọng mình và so với mẫu. Cần Internet và Chrome hoặc Edge.'))), { wide: true });
  }
  return { evaluate, panel, modal, how, enabled, verdict, colorOf, tipFor };
})();
