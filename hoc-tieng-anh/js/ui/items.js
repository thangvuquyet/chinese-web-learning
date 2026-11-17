const Items = (() => {
  const { h } = U;
  const ic = n => Icon.svg(n);
  const KIND_EN = { conversation: 'conversation', 'conversation-3': 'conversation with three speakers', announcement: 'announcement', message: 'telephone message', talk: 'talk', broadcast: 'broadcast', advertisement: 'advertisement', tour: 'tour information', meeting: 'excerpt from a meeting', speech: 'speech', instructions: 'instructions', introduction: 'introduction', report: 'report' };
  function roleOfP2(q) { return (U.hash(q.id || q.q) % 2) ? ['M', 'W'] : ['W', 'M']; }
  function linesOf(q) {
    if (q.part === 1) return q.opts.map((s, i) => ({ who: 'N', text: '(' + U.LET[i] + ') ' + s }));
    if (q.part === 2) { const [a, b] = roleOfP2(q); return [{ who: a, text: q.q }, ...q.opts.map((s, i) => ({ who: b, text: '(' + U.LET[i] + ') ' + s }))]; }
    const st = q.setItem || Bank.get(q.set) || q;
    return (st.lines || []).map(([who, text, vi]) => ({ who, text, vi }));
  }
  function intro(st, nums) {
    if (!nums || !nums.length) return '';
    const a = nums[0], b = nums[nums.length - 1];
    if (st.part === 3) return `Questions ${a} through ${b} refer to the following conversation${st.lines && U.uniq(st.lines.map(l => l[0])).length > 2 ? ' with three speakers' : ''}${st.g ? ' and graphic' : ''}.`;
    if (st.part === 4) return `Questions ${a} through ${b} refer to the following ${KIND_EN[st.kind] || 'talk'}${st.g ? ' and graphic' : ''}.`;
    if (st.part === 6) return `Questions ${a}–${b} refer to the following ${st.doc && st.doc.t === 'email' ? 'e-mail' : st.doc && st.doc.t || 'text'}.`;
    if (st.part === 7) { const n = (st.docs || []).length; return `Questions ${a}–${b} refer to the following ${n > 1 ? (n === 2 ? 'two texts' : n + ' texts') : (st.docs[0].t === 'email' ? 'e-mail' : st.docs[0].t === 'chat' ? 'text-message chain' : st.docs[0].t === 'web' ? 'Web page' : st.docs[0].t)}.`; }
    return '';
  }
  function optList(q, o = {}) {
    const mode = o.mode || 'exam';
    const showText = o.showText !== false && !(mode === 'exam' && (q.part === 1 || q.part === 2) && !o.forceText);
    const box = h('div.opts' + (!showText ? '.two' : ''));
    q.opts.forEach((t, i) => {
      let cls = '';
      if (mode === 'review') cls = i === q.ans ? '.right' : i === o.chosen ? '.wrong' : '.dim';
      else if (o.chosen === i) cls = '.sel';
      const b = h('button.opt' + cls, { type: 'button', dataset: { i } }, h('span.k', U.LET[i]), showText ? h('div.grow', h('div', t), mode === 'review' && q.whys && q.whys[i] && i !== q.ans ? h('div.why-x', q.whys[i]) : null) : h('div.grow.muted', 'Đáp án ' + U.LET[i]));
      if (mode !== 'review' && o.onPick) b.addEventListener('click', () => { o.onPick(i); [...box.children].forEach((x, k) => x.classList.toggle('sel', k === i)); });
      else b.setAttribute('disabled', '');
      box.appendChild(b);
    });
    return box;
  }
  function whyBox(q, chosen) {
    const ok = chosen === q.ans;
    return h('div.why',
      h('div.row', { style: { marginBottom: '4px' } }, h('span.pill.' + (chosen == null ? 'warn' : ok ? 'ok' : 'bad'), chosen == null ? 'Chưa trả lời' : ok ? 'Đúng' : 'Sai'), h('span.small.muted', 'Đáp án đúng: ' + U.LET[q.ans]), q.tag && Bank.TAGS[q.tag] ? h('span.pill', Bank.TAGS[q.tag]) : null),
      q.why ? U.rich(q.why) : null);
  }
  function qblock(q, o = {}) {
    const mode = o.mode || 'exam';
    const showQ = !(q.part === 1 || q.part === 2) && q.q;
    const el = h('div.qblock' + (o.flagged ? '.flagged' : ''), { id: 'q' + (o.num || q.num) },
      h('div.qn', h('span.no', o.num || q.num), showQ ? h('div.grow', q.part === 6 && !q.q ? '' : q.q) : h('div.grow.muted', q.part === 1 ? 'Chọn câu mô tả đúng nhất bức tranh.' : q.part === 2 ? 'Chọn câu đáp lại phù hợp nhất.' : ''), o.flagBtn || null),
      optList(q, { mode, chosen: o.chosen, onPick: o.onPick, showText: o.showText }),
      mode === 'review' ? whyBox(q, o.chosen) : null);
    return el;
  }
  function stimulus(st, o = {}) {
    const box = h('div');
    if (st.part === 3 || st.part === 4) {
      if (o.mode !== 'exam') {
        const pl = Player.create({ lines: st.lines.map(l => ({ who: l[0], text: l[1], vi: l[2] })), seed: st.id, showText: o.mode === 'review', autoplay: !!o.autoplay });
        box.appendChild(pl.el);
        box._player = pl;
      }
      if (st.g) box.appendChild(Docs.graphic(st.g));
    } else if (st.part === 6) {
      box.appendChild(Docs.render(st.doc, { blanks: o.blanks, onBlank: o.onBlank }));
    } else if (st.part === 7) {
      st.docs.forEach(d => box.appendChild(Docs.render(d, {})));
    }
    return box;
  }
  function p1Visual(q) {
    const item = q.item || Bank.get(q.id);
    const wrap = h('div.scene');
    wrap.innerHTML = typeof Scene !== 'undefined' ? Scene.render(item.scene) : '';
    return wrap;
  }
  function blankMap(st, qs, answers, mode, nums) {
    const map = {};
    qs.forEach((q, k) => {
      const ch = answers[k];
      let cls = '', value = '';
      if (mode === 'review') cls = ch === q.ans ? 'ok' : 'no';
      if (ch != null) value = q.opts[ch].length > 28 ? (nums ? nums[k] : k + 1) + ' · ' + U.LET[ch] : q.opts[ch];
      if (mode === 'review') value = q.opts[q.ans].length > 28 ? (nums ? nums[k] : k + 1) + ' · ' + U.LET[q.ans] : q.opts[q.ans];
      map[k + 1] = { label: nums ? nums[k] : k + 1, value, cls };
    });
    return map;
  }
  return { linesOf, intro, optList, whyBox, qblock, stimulus, p1Visual, blankMap, roleOfP2 };
})();
