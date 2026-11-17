const Phon = (() => {
  const VOWELS = new Set(['i', 'ɪ', 'ɛ', 'æ', 'ʌ', 'ə', 'ɑ', 'ɔ', 'ʊ', 'u', 'ɝ', 'eɪ', 'aɪ', 'ɔɪ', 'aʊ', 'oʊ']);
  const UNITS = ['tʃ', 'dʒ', 'eɪ', 'aɪ', 'ɔɪ', 'aʊ', 'oʊ', 'əʊ', 'ɪə', 'eə', 'ʊə', 'iː', 'uː', 'ɑː', 'ɔː', 'ɜː', 'ɝː', 'ər', 'ɚ', 'ɝ', 'ɜ', 'i', 'ɪ', 'e', 'ɛ', 'æ', 'ʌ', 'ə', 'ɑ', 'ɒ', 'ɔ', 'ʊ', 'u', 'o', 'a', 'p', 'b', 't', 'd', 'k', 'g', 'ɡ', 'f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ', 'h', 'm', 'n', 'ŋ', 'l', 'r', 'ɹ', 'w', 'j', 'ɾ', 'ᵻ'];
  const NORM = { 'iː': 'i', 'uː': 'u', 'ɑː': 'ɑ', 'ɒ': 'ɑ', 'ɔː': 'ɔ', 'ɜː': 'ɝ', 'ɝː': 'ɝ', 'ɜ': 'ɝ', 'ɚ': 'ɝ', 'ər': 'ɝ', 'e': 'ɛ', 'əʊ': 'oʊ', 'o': 'oʊ', 'ɡ': 'g', 'ɹ': 'r', 'ɾ': 't', 'ᵻ': 'ɪ', 'a': 'æ', 'ɪə': 'ɪr', 'eə': 'ɛr', 'ʊə': 'ʊr' };

  function ipaToPh(ipa) {
    const s = String(ipa || '').replace(/[\/\[\]ˈˌ.()\s‿-]/g, '');
    const out = [];
    let i = 0;
    while (i < s.length) {
      let hit = null;
      for (const u of UNITS) if (s.startsWith(u, i)) { hit = u; break; }
      if (!hit) { i++; continue; }
      i += hit.length;
      const n = NORM[hit] || hit;
      if (n.length === 2 && !UNITS.includes(n) && n !== 'ɪr' && n !== 'ɛr' && n !== 'ʊr') out.push(n);
      else if (n === 'ɪr') out.push('ɪ', 'r');
      else if (n === 'ɛr') out.push('ɛ', 'r');
      else if (n === 'ʊr') out.push('ʊ', 'r');
      else out.push(n);
    }
    return out;
  }

  const DICT = {};
  function addLex(map) { for (const [w, ipa] of Object.entries(map)) DICT[w.toLowerCase()] = ipa; }
  if (typeof LEX !== 'undefined') {
    LEX.split('|').forEach(e => { const k = e.indexOf(' '); if (k > 0) DICT[e.slice(0, k)] = e.slice(k + 1); });
  }

  const VTH = new Set(['the', 'this', 'that', 'these', 'those', 'then', 'than', 'there', 'their', 'theirs', 'they', 'them', 'themselves', 'though', 'although', 'thus', 'with', 'without', 'within', 'other', 'another', 'mother', 'father', 'brother', 'together', 'weather', 'whether', 'either', 'neither', 'rather', 'further', 'gather', 'bother', 'smooth', 'breathe', 'clothes', 'southern', 'northern', 'therefore', 'otherwise', 'nevertheless']);
  const isV = c => 'aeiouy'.includes(c);
  const VOICELESS = new Set(['p', 'k', 's', 'ʃ', 'tʃ', 'f', 'θ', 't']);
  const SIB = new Set(['s', 'z', 'ʃ', 'ʒ', 'tʃ', 'dʒ']);

  function g2pCore(w) {
    const out = [];
    let i = 0;
    const n = w.length;
    const at = (k, s) => w.startsWith(s, k);
    while (i < n) {
      const c = w[i], nx = w[i + 1] || '', nx2 = w[i + 2] || '';
      const end = i === n - 1;
      if (at(i, 'tion')) { out.push('ʃ', 'ə', 'n'); i += 4; continue; }
      if (at(i, 'sion')) { out.push(i > 0 && isV(w[i - 1]) ? 'ʒ' : 'ʃ', 'ə', 'n'); i += 4; continue; }
      if (at(i, 'cian') || at(i, 'tian')) { out.push('ʃ', 'ə', 'n'); i += 4; continue; }
      if (at(i, 'ture')) { out.push('tʃ', 'ɝ'); i += 4; continue; }
      if (at(i, 'sure') && i > 0) { out.push(isV(w[i - 1]) ? 'ʒ' : 'ʃ', 'ɝ'); i += 4; continue; }
      if (at(i, 'cious') || at(i, 'tious')) { out.push('ʃ', 'ə', 's'); i += 5; continue; }
      if (at(i, 'ous') && i + 3 === n) { out.push('ə', 's'); i += 3; continue; }
      if (at(i, 'eigh')) { out.push('eɪ'); i += 4; continue; }
      if (at(i, 'igh')) { out.push('aɪ'); i += 3; continue; }
      if (at(i, 'ough')) { out.push(at(i, 'ought') ? 'ɔ' : 'oʊ'); i += 4; continue; }
      if (at(i, 'augh')) { out.push('ɔ'); i += 4; continue; }
      if (at(i, 'tch')) { out.push('tʃ'); i += 3; continue; }
      if (at(i, 'sch')) { out.push('s', 'k'); i += 3; continue; }
      if (at(i, 'chr')) { out.push('k', 'r'); i += 3; continue; }
      if (at(i, 'ch')) { out.push('tʃ'); i += 2; continue; }
      if (at(i, 'sh')) { out.push('ʃ'); i += 2; continue; }
      if (at(i, 'th')) { out.push(VTH.has(w) ? 'ð' : 'θ'); i += 2; continue; }
      if (at(i, 'ph')) { out.push('f'); i += 2; continue; }
      if (at(i, 'gh')) { if (i === 0) out.push('g'); i += 2; continue; }
      if (at(i, 'ck')) { out.push('k'); i += 2; continue; }
      if (at(i, 'ng')) { out.push('ŋ'); if (nx2 && isV(nx2) && !at(i, 'nge')) out.push('g'); i += 2; continue; }
      if (at(i, 'nk')) { out.push('ŋ', 'k'); i += 2; continue; }
      if (at(i, 'qu')) { out.push('k', 'w'); i += 2; continue; }
      if (at(i, 'wh')) { out.push(at(i, 'who') ? 'h' : 'w'); i += 2; continue; }
      if (i === 0 && at(i, 'wr')) { out.push('r'); i += 2; continue; }
      if (i === 0 && (at(i, 'kn') || at(i, 'gn'))) { out.push('n'); i += 2; continue; }
      if (at(i, 'gn') && i + 2 === n) { out.push('n'); i += 2; continue; }
      if (at(i, 'mb') && i + 2 === n) { out.push('m'); i += 2; continue; }
      if (at(i, 'dg')) { out.push('dʒ'); i += 2; continue; }
      if (at(i, 'eau')) { out.push('oʊ'); i += 3; continue; }
      if (at(i, 'ee')) { out.push('i'); i += 2; continue; }
      if (at(i, 'ea')) { out.push(nx2 === 'd' || at(i, 'eath') || at(i, 'eas') && w.length > i + 4 ? 'ɛ' : 'i'); i += 2; continue; }
      if (at(i, 'ie')) { out.push(i + 2 === n && n <= 4 ? 'aɪ' : 'i'); i += 2; continue; }
      if (at(i, 'ei')) { out.push(i > 0 && w[i - 1] === 'c' ? 'i' : 'eɪ'); i += 2; continue; }
      if (at(i, 'ey')) { out.push(i + 2 === n && n > 4 ? 'i' : 'eɪ'); i += 2; continue; }
      if (at(i, 'ai') || at(i, 'ay')) { out.push('eɪ'); i += 2; continue; }
      if (at(i, 'oa')) { out.push('oʊ'); i += 2; continue; }
      if (at(i, 'oo')) { out.push(/oo[dkt]/.test(w.slice(i, i + 3)) ? 'ʊ' : 'u'); i += 2; continue; }
      if (at(i, 'our')) { out.push('aʊ', 'ɝ'); i += 3; continue; }
      if (at(i, 'ou')) { out.push(at(i, 'oul') ? 'ʊ' : 'aʊ'); i += 2; continue; }
      if (at(i, 'ow')) { out.push(i + 2 === n && n > 3 ? 'oʊ' : 'aʊ'); i += 2; continue; }
      if (at(i, 'oi') || at(i, 'oy')) { out.push('ɔɪ'); i += 2; continue; }
      if (at(i, 'au') || at(i, 'aw')) { out.push('ɔ'); i += 2; continue; }
      if (at(i, 'ue') || at(i, 'ew')) { out.push('u'); i += 2; continue; }
      if (at(i, 'ui')) { out.push('u'); i += 2; continue; }
      if (at(i, 'ar')) { out.push(w[i + 2] === 'e' && i + 3 === n ? 'ɛ' : 'ɑ', 'r'); i += 2; if (w[i] === 'e' && i + 1 === n) i++; continue; }
      if ((at(i, 'er') || at(i, 'ir') || at(i, 'ur')) && !isV(nx2)) { out.push('ɝ'); i += 2; continue; }
      if (at(i, 'or') && !isV(nx2)) { out.push('ɔ', 'r'); i += 2; continue; }
      if (at(i, 'ore') && i + 3 === n) { out.push('ɔ', 'r'); i += 3; continue; }
      if (at(i, 'ire') && i + 3 === n) { out.push('aɪ', 'ɝ'); i += 3; continue; }
      if (at(i, 'ure') && i + 3 === n) { out.push('j', 'ʊ', 'r'); i += 3; continue; }
      if (at(i, 'le') && i + 2 === n && i > 0 && !isV(w[i - 1])) { out.push('ə', 'l'); i += 2; continue; }
      if (isV(c) && c !== 'y') {
        const magic = !isV(nx) && nx && w[i + 2] === 'e' && (i + 3 === n || w[i + 3] === 's' && i + 4 === n || w[i + 3] === 'd' && i + 4 === n || w[i + 3] === 'r' && i + 4 === n);
        const open = !nx;
        const map = magic || open ? { a: 'eɪ', e: 'i', i: 'aɪ', o: 'oʊ', u: 'u' } : { a: 'æ', e: 'ɛ', i: 'ɪ', o: 'ɑ', u: 'ʌ' };
        if (c === 'e' && end && i > 0) { i++; continue; }
        if (c === 'e' && i + 2 === n && w[i + 1] === 's' && i > 1 && !SIB.has(out[out.length - 1])) { i++; continue; }
        if (c === 'e' && i + 2 === n && w[i + 1] === 'd' && i > 1) { i++; continue; }
        out.push(map[c]); i++; continue;
      }
      if (c === 'y') {
        if (i === 0) out.push('j');
        else if (end) out.push(out.some(x => VOWELS.has(x)) ? 'i' : 'aɪ');
        else out.push(isV(nx) ? 'j' : 'ɪ');
        i++; continue;
      }
      if (c === nx && !isV(c)) { i++; continue; }
      if (c === 'c') { out.push('eiy'.includes(nx) ? 's' : 'k'); i++; continue; }
      if (c === 'g') { out.push('eiy'.includes(nx) && !/^(get|give|girl|gift|begin|together|forget|target)/.test(w) ? 'dʒ' : 'g'); i++; continue; }
      if (c === 'x') { if (i === 0) out.push('z'); else out.push('k', 's'); i++; continue; }
      if (c === 'j') { out.push('dʒ'); i++; continue; }
      if (c === 's') { out.push(end && i > 0 && (isV(w[i - 1]) || 'bdglmnrvw'.includes(w[i - 1])) ? 'z' : 's'); i++; continue; }
      if (c === 'q') { out.push('k'); i++; continue; }
      if ('bdfhklmnprtvwz'.includes(c)) { out.push(c); i++; continue; }
      i++;
    }
    return out;
  }

  const IRREG_PAST = { went: 'go', made: 'make', took: 'take', gave: 'give', came: 'come', sent: 'send', spent: 'spend', paid: 'pay', said: 'say', told: 'tell', sold: 'sell', bought: 'buy', brought: 'bring', thought: 'think', built: 'build', left: 'leave', met: 'meet', held: 'hold', kept: 'keep', found: 'find', wrote: 'write', written: 'write', chose: 'choose', chosen: 'choose', drove: 'drive', driven: 'drive', began: 'begin', begun: 'begin', rose: 'rise', risen: 'rise', fell: 'fall', fallen: 'fall', ran: 'run', saw: 'see', seen: 'see', knew: 'know', known: 'know', grew: 'grow', grown: 'grow', flew: 'fly', flown: 'fly', got: 'get', gotten: 'get', set: 'set', put: 'put', cut: 'cut', led: 'lead', felt: 'feel', meant: 'mean', heard: 'hear', stood: 'stand', understood: 'understand', taught: 'teach', caught: 'catch', lost: 'lose', won: 'win', shown: 'show', done: 'do', did: 'do', been: 'be', was: 'be', were: 'be', had: 'have', broke: 'break', broken: 'break', spoke: 'speak', spoken: 'speak', forgot: 'forget', forgotten: 'forget', hung: 'hang', laid: 'lay', lain: 'lie', lent: 'lend', dealt: 'deal', sought: 'seek', withdrew: 'withdraw', withdrawn: 'withdraw', undertook: 'undertake', undertaken: 'undertake', oversaw: 'oversee', overseen: 'oversee', forecast: 'forecast' };

  function g2p(word) {
    const w = word.toLowerCase().replace(/[^a-z']/g, '');
    if (!w) return [];
    if (DICT[w]) return ipaToPh(DICT[w]);
    const poss = w.match(/^(.+)'s$/);
    if (poss) { const b = g2p(poss[1]); const l = b[b.length - 1]; return b.concat(SIB.has(l) ? ['ɪ', 'z'] : VOICELESS.has(l) ? ['s'] : ['z']); }
    const clean = w.replace(/'/g, '');
    if (DICT[clean]) return ipaToPh(DICT[clean]);
    let m;
    if ((m = clean.match(/^(.{3,})ies$/)) && DICT[m[1] + 'y']) return ipaToPh(DICT[m[1] + 'y']).slice(0, -1).concat(['i', 'z']);
    if ((m = clean.match(/^(.{2,}?)(es|s)$/))) {
      const base = DICT[m[1]] ? m[1] : DICT[m[1] + (m[2] === 'es' ? 'e' : '')] ? m[1] + 'e' : m[2] === 'es' && DICT[m[1] + 'es'.slice(0, 1)] ? m[1] + 'e' : null;
      const b2 = base || (DICT[clean.slice(0, -1)] ? clean.slice(0, -1) : null);
      if (b2) { const b = ipaToPh(DICT[b2]); const l = b[b.length - 1]; return b.concat(SIB.has(l) ? ['ɪ', 'z'] : VOICELESS.has(l) ? ['s'] : ['z']); }
    }
    if ((m = clean.match(/^(.{2,}?)(ed|d)$/))) {
      const cands = [m[1], m[1] + 'e', clean.slice(0, -1), m[1].replace(/(.)\1$/, '$1'), m[1].replace(/i$/, 'y')];
      const b2 = cands.find(x => DICT[x]);
      if (b2) { const b = ipaToPh(DICT[b2]); const l = b[b.length - 1]; return b.concat(l === 't' || l === 'd' ? ['ɪ', 'd'] : VOICELESS.has(l) ? ['t'] : ['d']); }
    }
    if ((m = clean.match(/^(.{2,}?)ing$/))) {
      const cands = [m[1], m[1] + 'e', m[1].replace(/(.)\1$/, '$1')];
      const b2 = cands.find(x => DICT[x]);
      if (b2) return ipaToPh(DICT[b2]).concat(['ɪ', 'ŋ']);
    }
    if ((m = clean.match(/^(.{3,}?)ly$/))) {
      const cands = [m[1], m[1] + 'le', m[1].replace(/i$/, 'y')];
      const b2 = cands.find(x => DICT[x]);
      if (b2) return ipaToPh(DICT[b2]).concat(['l', 'i']);
    }
    let core = g2pCore(clean);
    if (/[^aeiou]ed$/.test(clean) && core.length > 1) {
      const l = core[core.length - 1];
      if (l === 'd') { const prev = core[core.length - 2]; if (prev === 't' || prev === 'd') core.splice(core.length - 1, 0, 'ɪ'); else if (VOICELESS.has(prev)) core[core.length - 1] = 't'; }
    }
    if (/[^s]es$/.test(clean) && SIB.has(core[core.length - 2])) core.splice(core.length - 1, 0, 'ɪ');
    if (/[^aeious]s$/.test(clean) && VOICELESS.has(core[core.length - 2])) core[core.length - 1] = 's';
    return core;
  }
  const cache = new Map();
  function phones(word) {
    const k = String(word).toLowerCase();
    if (cache.has(k)) return cache.get(k);
    const r = g2p(k);
    cache.set(k, r);
    return r;
  }
  function ipaOf(word) { return DICT[String(word).toLowerCase().replace(/[^a-z' -]/g, '')] || ''; }

  const NEAR = [
    ['i', 'ɪ', .3], ['u', 'ʊ', .3], ['æ', 'ɛ', .35], ['ʌ', 'ə', .15], ['ɑ', 'ʌ', .4], ['ɑ', 'ɔ', .3], ['ə', 'ɪ', .4], ['ɛ', 'eɪ', .4], ['oʊ', 'ɔ', .4], ['ɝ', 'ə', .4],
    ['θ', 't', .4], ['θ', 's', .45], ['θ', 'f', .4], ['ð', 'd', .4], ['ð', 'z', .45], ['ʃ', 's', .4], ['tʃ', 'ʃ', .4], ['tʃ', 't', .5], ['dʒ', 'ʒ', .4], ['dʒ', 'z', .5], ['dʒ', 'j', .5],
    ['v', 'b', .45], ['v', 'w', .5], ['v', 'f', .4], ['r', 'l', .5], ['n', 'l', .5], ['n', 'ŋ', .4], ['p', 'b', .4], ['t', 'd', .35], ['k', 'g', .4], ['s', 'z', .3], ['f', 'p', .5], ['m', 'n', .5]
  ];
  const NEARMAP = new Map();
  NEAR.forEach(([a, b, c]) => { NEARMAP.set(a + '|' + b, c); NEARMAP.set(b + '|' + a, c); });
  const subCost = (a, b) => a === b ? 0 : (NEARMAP.get(a + '|' + b) || (VOWELS.has(a) && VOWELS.has(b) ? .6 : 1));
  function phSim(a, b) {
    if (!a.length && !b.length) return 1;
    const d = U.lev(a, b, subCost);
    return Math.max(0, 1 - d / Math.max(a.length, b.length));
  }

  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const ORD = { one: 'first', two: 'second', three: 'third', five: 'fifth', eight: 'eighth', nine: 'ninth', twelve: 'twelfth' };
  function num(n) {
    n = Math.floor(n);
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
    if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + num(n % 100) : '');
    if (n < 1e6) return num(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + num(n % 1000) : '');
    if (n < 1e9) return num(Math.floor(n / 1e6)) + ' million' + (n % 1e6 ? ' ' + num(n % 1e6) : '');
    return String(n);
  }
  function numWords(s) {
    const clean = s.replace(/,/g, '');
    if (/^\d{4}$/.test(clean) && +clean >= 1900 && +clean < 2100 && +clean % 1000 >= 10) {
      const a = Math.floor(+clean / 100), b = +clean % 100;
      return num(a) + ' ' + (b < 10 ? 'oh ' + num(b) : num(b));
    }
    if (/^\d+\.\d+$/.test(clean)) { const [a, b] = clean.split('.'); return num(+a) + ' point ' + [...b].map(d => ONES[+d]).join(' '); }
    return num(+clean);
  }
  function ordWords(n) {
    const w = num(n).split(' ');
    const last = w.pop();
    return w.concat(ORD[last] || (last.endsWith('y') ? last.slice(0, -1) + 'ieth' : last + 'th')).join(' ');
  }
  const CONTR = { "can't": 'can not', cannot: 'can not', "won't": 'will not', "shan't": 'shall not', "n't": ' not', "let's": 'let us', "i'm": 'i am', "it's": 'it is', "that's": 'that is', "there's": 'there is', "here's": 'here is', "what's": 'what is', "where's": 'where is', "who's": 'who is', "he's": 'he is', "she's": 'she is', "how's": 'how is' };
  const ABBR = { 'mr.': 'mister', 'mrs.': 'missus', 'ms.': 'miss', 'dr.': 'doctor', 'st.': 'street', 'a.m.': 'am', 'p.m.': 'pm', 'no.': 'number', 'e-mail': 'email', 'e-mails': 'emails', 'ok': 'okay', 'o.k.': 'okay', 'vs.': 'versus', 'etc.': 'etcetera', 'inc.': 'incorporated', 'co.': 'company', 'ltd.': 'limited', 'jan.': 'january', 'feb.': 'february', 'aug.': 'august', 'sept.': 'september', 'oct.': 'october', 'nov.': 'november', 'dec.': 'december' };
  const SPELL = { colour: 'color', colours: 'colors', favour: 'favor', favourite: 'favorite', honour: 'honor', labour: 'labor', neighbour: 'neighbor', neighbourhood: 'neighborhood', behaviour: 'behavior', centre: 'center', centres: 'centers', theatre: 'theater', metre: 'meter', metres: 'meters', litre: 'liter', catalogue: 'catalog', programme: 'program', programmes: 'programs', cheque: 'check', cheques: 'checks', licence: 'license', defence: 'defense', enrol: 'enroll', enrolment: 'enrollment', fulfil: 'fulfill', judgement: 'judgment', grey: 'gray', tyre: 'tire', tyres: 'tires', aluminium: 'aluminum', travelled: 'traveled', travelling: 'traveling', traveller: 'traveler', travellers: 'travelers', cancelled: 'canceled', cancelling: 'canceling', labelled: 'labeled', modelling: 'modeling', analyse: 'analyze', organisation: 'organization', organisations: 'organizations', realise: 'realize', recognise: 'recognize', apologise: 'apologize', specialise: 'specialize', finalise: 'finalize', prioritise: 'prioritize', emphasise: 'emphasize', summarise: 'summarize', authorise: 'authorize', organise: 'organize', organised: 'organized', organising: 'organizing', customise: 'customize', minimise: 'minimize', maximise: 'maximize', utilise: 'utilize', optimise: 'optimize', standardise: 'standardize', programmer: 'programmer', jewellery: 'jewelry', storey: 'story', plough: 'plow', practise: 'practice' };
  const HOMO = [['to', 'too', 'two'], ['for', 'four', 'fore'], ['there', 'their', "they're"], ['its', "it's"], ['your', "you're"], ['by', 'buy', 'bye'], ['no', 'know'], ['right', 'write'], ['here', 'hear'], ['see', 'sea'], ['meet', 'meat'], ['weak', 'week'], ['wait', 'weight'], ['mail', 'male'], ['sale', 'sail'], ['fair', 'fare'], ['hire', 'higher'], ['our', 'hour'], ['new', 'knew'], ['one', 'won'], ['whole', 'hole'], ['piece', 'peace'], ['brake', 'break'], ['flour', 'flower'], ['through', 'threw'], ['wear', 'where'], ['which', 'witch'], ['whether', 'weather'], ['cell', 'sell'], ['site', 'sight', 'cite'], ['principal', 'principle'], ['stationary', 'stationery'], ['complement', 'compliment'], ['board', 'bored'], ['aisle', "i'll", 'isle'], ['residents', 'residence'], ['patients', 'patience'], ['presents', 'presence'], ['would', 'wood'], ['made', 'maid'], ['plane', 'plain'], ['road', 'rode'], ['steal', 'steel'], ['suite', 'sweet'], ['tail', 'tale'], ['waist', 'waste'], ['way', 'weigh'], ['ate', 'eight'], ['be', 'bee'], ['dear', 'deer'], ['die', 'dye'], ['knight', 'night'], ['not', 'knot'], ['pair', 'pear', 'pare'], ['rain', 'reign', 'rein'], ['role', 'roll'], ['seen', 'scene'], ['so', 'sew'], ['some', 'sum'], ['son', 'sun'], ['their', 'there'], ['vain', 'vein'], ['wear', 'ware'], ['allowed', 'aloud'], ['ceiling', 'sealing'], ['council', 'counsel'], ['desert', 'dessert'], ['lead', 'led'], ['passed', 'past'], ['bare', 'bear'], ['berth', 'birth'], ['coarse', 'course'], ['fourth', 'forth'], ['heard', 'herd'], ['idle', 'idol'], ['loan', 'lone'], ['morning', 'mourning'], ['pole', 'poll'], ['rap', 'wrap'], ['root', 'route'], ['sole', 'soul'], ['tide', 'tied'], ['toe', 'tow'], ['wade', 'weighed'], ['wholly', 'holy'], ['whose', "who's"], ['days', 'daze'], ['cents', 'sense', 'scents'], ['band', 'banned'], ['bored', 'board'], ['accept', 'except'], ['ad', 'add'], ['air', 'heir'], ['altar', 'alter'], ['finally', 'finely'], ['guessed', 'guest'], ['missed', 'mist'], ['mall', 'maul'], ['need', 'knead'], ['oh', 'owe'], ['peak', 'peek'], ['plaque', 'plack'], ['rays', 'raise'], ['stares', 'stairs'], ['tea', 'tee'], ['team', 'teem'], ['ware', 'wear'], ['we', 'wee'], ['yoke', 'yolk']];
  const HMAP = new Map();
  HOMO.forEach(g => g.forEach(w => HMAP.set(w, (HMAP.get(w) || new Set()))));
  HOMO.forEach(g => g.forEach(w => g.forEach(x => HMAP.get(w).add(x))));

  function expandToken(tok) {
    let t = tok.toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”"()\[\]{}!?;…]+/g, '').replace(/:(?!\d)/g, '').replace(/^[',.]+|[',.]+$/g, m => m.includes('.') && /[a-z]\.$/.test(tok.toLowerCase()) ? m : '');
    t = t.replace(/[.,]+$/, s => ABBR[t] ? s : '');
    if (ABBR[t]) return ABBR[t].split(' ');
    if (ABBR[t + '.']) return ABBR[t + '.'].split(' ');
    t = t.replace(/\.$/, '');
    if (!t) return [];
    if (CONTR[t]) return CONTR[t].split(' ');
    let m;
    if ((m = t.match(/^(.+)n't$/))) return [m[1] === 'ca' ? 'can' : m[1] === 'wo' ? 'will' : m[1], 'not'];
    if ((m = t.match(/^(i|you|we|they|he|she|it|that|there|who|what)'(re|ve|ll|d|s|m)$/))) return [m[1], { re: 'are', ve: 'have', ll: 'will', d: 'would', s: 'is', m: 'am' }[m[2]]];
    if ((m = t.match(/^\$([\d,.]+)(k|m|million|billion)?$/))) return numWords(m[1]).split(' ').concat(m[2] ? [m[2] === 'k' ? 'thousand' : m[2] === 'm' ? 'million' : m[2]] : []).concat(['dollars']);
    if ((m = t.match(/^([\d,.]+)%$/))) return numWords(m[1]).split(' ').concat(['percent']);
    if ((m = t.match(/^(\d{1,2}):(\d{2})$/))) return num(+m[1]).split(' ').concat(+m[2] === 0 ? [] : (+m[2] < 10 ? ['oh'] : []).concat(num(+m[2]).split(' ')));
    if ((m = t.match(/^(\d+)(st|nd|rd|th)$/))) return ordWords(+m[1]).split(' ');
    if ((m = t.match(/^(\d+)(am|pm)$/))) return num(+m[1]).split(' ').concat([m[2]]);
    if (/^[\d,]+(\.\d+)?$/.test(t)) return numWords(t).split(' ');
    if (t.includes('-')) return t.split('-').filter(Boolean).flatMap(x => expandToken(x));
    if (t.includes('/')) return t.split('/').filter(Boolean).flatMap(x => expandToken(x));
    t = t.replace(/'s$/, 's').replace(/s'$/, 's').replace(/'/g, '');
    if (SPELL[t]) t = SPELL[t];
    return t ? [t] : [];
  }
  function tokenize(text) {
    const disp = String(text).replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
    const out = [];
    disp.forEach((d, i) => {
      const keys = expandToken(d);
      out.push({ d, keys, i });
    });
    return out;
  }
  function sameWord(a, b) {
    if (a === b) return true;
    if (HMAP.has(a) && HMAP.get(a).has(b)) return true;
    if (a.replace(/s$/, '') === b.replace(/s$/, '') && a.length > 3 && (a.endsWith("s") !== b.endsWith("s")) && false) return true;
    return false;
  }
  function wordSim(a, b) {
    if (sameWord(a, b)) return 1;
    const pa = phones(a), pb = phones(b);
    if (pa.length && pb.length && pa.join('') === pb.join('')) return 1;
    const s = phSim(pa, pb);
    const spell = 1 - U.lev(a, b) / Math.max(a.length, b.length);
    return Math.max(s * .85 + spell * .15, 0);
  }

  function align(target, heard) {
    const T = [], H = [];
    target.forEach(t => t.keys.forEach((k, j) => T.push({ k, own: t.i, sub: j })));
    heard.forEach(h => h.keys.forEach(k => H.push({ k })));
    const m = T.length, n = H.length;
    const INF = 1e9;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(INF));
    const bk = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
    const sims = Array.from({ length: m }, () => new Array(n).fill(null));
    const sim = (i, j) => sims[i][j] != null ? sims[i][j] : (sims[i][j] = wordSim(T[i].k, H[j].k));
    dp[0][0] = 0;
    for (let i = 0; i <= m; i++) for (let j = 0; j <= n; j++) {
      const cur = dp[i][j];
      if (cur >= INF) continue;
      if (i < m && cur + 1 < dp[i + 1][j]) { dp[i + 1][j] = cur + 1; bk[i + 1][j] = ['del', i, j]; }
      if (j < n && cur + .7 < dp[i][j + 1]) { dp[i][j + 1] = cur + .7; bk[i][j + 1] = ['ins', i, j]; }
      if (i < m && j < n) {
        const s = sim(i, j);
        const c = s >= .999 ? 0 : s >= .45 ? 1 - s : 1.4;
        if (cur + c < dp[i + 1][j + 1]) { dp[i + 1][j + 1] = cur + c; bk[i + 1][j + 1] = ['sub', i, j, s]; }
      }
      if (i + 1 < m && j < n && T[i].k + T[i + 1].k === H[j].k) { if (cur < dp[i + 2][j + 1]) { dp[i + 2][j + 1] = cur; bk[i + 2][j + 1] = ['m21', i, j]; } }
      if (i < m && j + 1 < n && H[j].k + H[j + 1].k === T[i].k) { if (cur < dp[i + 1][j + 2]) { dp[i + 1][j + 2] = cur; bk[i + 1][j + 2] = ['m12', i, j]; } }
    }
    const res = T.map(t => ({ k: t.k, own: t.own, st: 'miss', sim: 0, heard: '' }));
    const extra = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      const b = bk[i][j];
      if (!b) break;
      const [op, pi, pj] = b;
      if (op === 'sub') { res[pi].sim = b[3]; res[pi].heard = H[pj].k; res[pi].st = b[3] >= .999 ? 'good' : b[3] >= .45 ? 'near' : 'wrong'; }
      else if (op === 'm21') { res[pi].sim = res[pi + 1].sim = 1; res[pi].st = res[pi + 1].st = 'good'; res[pi].heard = res[pi + 1].heard = H[pj].k; }
      else if (op === 'm12') { res[pi].sim = 1; res[pi].st = 'good'; res[pi].heard = H[pj].k + ' ' + H[pj + 1].k; }
      else if (op === 'ins') extra.push(H[pj].k);
      i = pi; j = pj;
    }
    return { keys: res, extra: extra.reverse() };
  }

  const PAIRKEY = {
    'θ|t': 'th', 'θ|s': 'th', 'θ|f': 'th', 'θ|d': 'th', 'ð|d': 'dh', 'ð|z': 'dh', 'ð|v': 'dh',
    'ʃ|s': 'sh', 's|ʃ': 'sh', 'tʃ|ʃ': 'ch', 'ʃ|tʃ': 'ch', 'tʃ|t': 'ch', 'dʒ|z': 'j', 'dʒ|j': 'j', 'dʒ|ʒ': 'j', 'dʒ|d': 'j', 'ʒ|z': 'j',
    'v|b': 'v', 'v|w': 'v', 'v|f': 'v', 'r|l': 'rl', 'l|r': 'rl', 'r|z': 'rl', 'n|l': 'nl', 'l|n': 'nl', 'ŋ|n': 'ng',
    'i|ɪ': 'ii', 'ɪ|i': 'ii', 'u|ʊ': 'uu', 'ʊ|u': 'uu', 'æ|ɛ': 'ae', 'ɛ|æ': 'ae', 'ʌ|ɑ': 'uh', 'ɑ|ʌ': 'uh', 'ɑ|oʊ': 'uh', 'ɝ|ɑ': 'er', 'ɝ|ɛ': 'er', 'ɝ|ə': 'er', 'eɪ|ɛ': 'ei', 'oʊ|ɔ': 'ou', 'aɪ|eɪ': 'ai',
    'z|s': 'zs', 'p|b': 'final', 't|d': 'final', 'k|g': 'final', 'd|t': 'final', 'b|p': 'final', 'g|k': 'final'
  };
  function diagnose(target, heard) {
    const out = new Set();
    if (!heard) return [];
    const a = phones(target), b = phones(heard);
    if (/s$/.test(target) && !/s$/.test(heard) && (target.replace(/e?s$/, '') === heard || target.replace(/'s$/, '') === heard)) out.add('s-end');
    if (/ed$/.test(target) && (target.replace(/e?d$/, '') === heard || target.replace(/ed$/, '') === heard)) out.add('ed-end');
    if (!out.size && a.length && b.length) {
      const ops = U.diffOps(a, b);
      ops.forEach(([op, x, y], idx) => {
        if (op === '~') { const k = PAIRKEY[x + '|' + y]; if (k) out.add(k); }
        if (op === '-' && x && !VOWELS.has(x)) {
          const tail = ops.slice(idx + 1).every(o => o[0] === '-' || o[0] === '=') && ops.slice(idx + 1).filter(o => o[0] === '=').length === 0;
          if (tail) out.add(x === 's' || x === 'z' ? 's-end' : x === 'd' || x === 't' ? (/ed$/.test(target) ? 'ed-end' : 'final') : 'final');
          else if (!VOWELS.has(ops[idx - 1] ? ops[idx - 1][1] : '') || !VOWELS.has(ops[idx + 1] ? ops[idx + 1][1] : '')) out.add('cluster');
        }
      });
    }
    return [...out];
  }

  return { ipaToPh, g2p, phones, ipaOf, addLex, phSim, wordSim, tokenize, expandToken, align, diagnose, num, numWords, sameWord, DICT, VOWELS };
})();
