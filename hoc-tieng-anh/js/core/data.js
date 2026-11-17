const D = (() => {
  const POS = { n: 'danh từ', v: 'động từ', adj: 'tính từ', adv: 'trạng từ', prep: 'giới từ', conj: 'liên từ', phr: 'cụm từ', pv: 'cụm động từ', pron: 'đại từ' };
  const POS_SHORT = { n: 'n', v: 'v', adj: 'adj', adv: 'adv', prep: 'prep', conj: 'conj', phr: 'phr', pv: 'phr v', pron: 'pron' };
  const topics = [];
  const words = [];
  const byId = {};
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function parseTopic(t) {
    const list = [];
    t.words.split('\n').map(s => s.trim()).filter(Boolean).forEach(line => {
      const [w, ipa, pos, vi, ex, fam, col] = line.split('|').map(s => (s || '').trim());
      if (!w) return;
      let id = slug(w);
      if (byId[id]) id = id + '-' + t.id;
      const m = (ex || '').match(/\*([^*]+)\*/);
      const word = {
        id, w, ipa: ipa ? '/' + ipa.replace(/^\/|\/$/g, '') + '/' : '', pos, vi, topic: t.id,
        ex: (ex || '').replace(/\*/g, ''), exRaw: ex || '', form: m ? m[1] : w,
        fam: (fam || '').split(',').map(s => s.trim()).filter(Boolean).map(s => { const k = s.lastIndexOf(' '); return k > 0 ? { w: s.slice(0, k), pos: s.slice(k + 1) } : { w: s, pos: '' }; }),
        col: col || ''
      };
      byId[id] = word;
      words.push(word);
      list.push(word);
      if (ipa && !/\s/.test(w)) { const o = {}; o[w.toLowerCase()] = ipa; Phon.addLex(o); }
    });
    return Object.assign({}, t, { words: list });
  }
  if (typeof VOCAB !== 'undefined') VOCAB.forEach(t => topics.push(parseTopic(t)));
  const topicById = Object.fromEntries(topics.map(t => [t.id, t]));

  function dueCards(p, now = Date.now()) {
    if (!p) return [];
    return Object.entries(p.cards).filter(([id, c]) => byId[id] && c.due <= now).sort((a, b) => a[1].due - b[1].due).map(([id]) => byId[id]);
  }
  function topicProgress(p, t) {
    const n = t.words.length;
    const learned = t.words.filter(w => p && p.cards[w.id]).length;
    const strong = t.words.filter(w => p && p.cards[w.id] && p.cards[w.id].st === 2 && p.cards[w.id].s >= 7).length;
    return { n, learned, strong, pct: n ? learned / n : 0 };
  }
  function newWords(p, t, n = 8) { return t.words.filter(w => !p.cards[w.id]).slice(0, n); }
  function nextTopic(p) { return topics.find(t => topicProgress(p, t).learned < t.words.length) || topics[0]; }
  function cardStats(p) {
    const out = { new: 0, learning: 0, young: 0, mature: 0 };
    for (const c of Object.values(p.cards)) out[SRS.bucket(c)]++;
    out.new = words.length - Object.keys(p.cards).length;
    return out;
  }
  function ipaOf(w) {
    const k = String(w).toLowerCase();
    const v = words.find(x => x.w.toLowerCase() === k);
    if (v && v.ipa) return v.ipa;
    const d = Phon.ipaOf(k);
    return d ? '/' + d + '/' : '';
  }
  function search(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    return words.filter(w => w.w.toLowerCase().includes(q) || w.vi.toLowerCase().includes(q)).slice(0, 60);
  }
  return { POS, POS_SHORT, topics, topicById, words, byId, dueCards, topicProgress, newWords, nextTopic, cardStats, ipaOf, search, slug };
})();
