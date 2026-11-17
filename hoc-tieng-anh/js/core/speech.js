const Speech = (() => {
  const synth = window.speechSynthesis || null;
  let voices = [];
  let token = 0;
  const F_RE = /(zira|aria|jenny|michelle|emma|ava\b|ana\b|sonia|libby|maisie|hazel|susan|natasha|catherine|clara|linda|heera|neerja|emily|samantha|karen|moira|tessa|fiona|victoria|allison|serena|kate\b|female|google us english|sara\b|jane\b|nancy|amber|ashley|cora|elizabeth|monica|molly|hollie|bella|abbie|olivia|sienna|ellie|freya|annette|carly|elsie|joanne|tina|nicola|leah|luna|nova|jessa|ivy|aoife|isla)/i;
  const M_RE = /(david|mark\b|guy\b|davis|andrew|brian|christopher|eric\b|roger|steffan|ryan|thomas|george|william|liam|james|richard|prabhat|ravi|daniel|alex\b|fred\b|tom\b|oliver|arthur|aaron|gordon|lee\b|rishi|\bmale|tony|jason|brandon|jacob|ken\b|duncan|neil|darren|tim\b|ethan|elliot|noah|connor|mitchell|kenneth|wayne)/i;
  const ACC = { 'en-us': 'US', 'en-gb': 'UK', 'en-au': 'AU', 'en-ca': 'CA', 'en-ie': 'IE', 'en-nz': 'NZ', 'en-in': 'IN', 'en-za': 'ZA', 'en-sg': 'SG', 'en-ph': 'PH' };
  const ACC_VI = { US: 'Mỹ', UK: 'Anh', AU: 'Úc', CA: 'Canada', IE: 'Ireland', NZ: 'New Zealand', IN: 'Ấn Độ' };

  function refresh() { if (synth) voices = synth.getVoices() || []; }
  if (synth) {
    refresh();
    if ('onvoiceschanged' in synth) synth.addEventListener ? synth.addEventListener('voiceschanged', refresh) : (synth.onvoiceschanged = refresh);
    setTimeout(refresh, 400); setTimeout(refresh, 1500);
  }
  function meta(v) {
    const lang = (v.lang || '').replace('_', '-').toLowerCase();
    const accent = ACC[lang] || (/^en/.test(lang) ? 'US' : null);
    const nm = v.name.replace(/microsoft|google|online|\(natural\)|natural|english|united states|united kingdom|australia|canada|-/gi, ' ');
    const gender = /google uk english female|google us english/i.test(v.name) ? 'f' : /google uk english male/i.test(v.name) ? 'm' : F_RE.test(nm) ? 'f' : M_RE.test(nm) ? 'm' : null;
    let q = 0;
    if (/natural|neural|online/i.test(v.name)) q += 6;
    if (/google/i.test(v.name)) q += 4;
    if (/microsoft/i.test(v.name)) q += 1;
    if (/compact|espeak|robot/i.test(v.name)) q -= 6;
    if (['US', 'UK', 'AU', 'CA'].includes(accent)) q += 1;
    return { v, accent, gender, q };
  }
  function enVoices() { return voices.filter(v => /^en[-_]/i.test(v.lang)).map(meta).sort((a, b) => b.q - a.q); }
  const available = () => !!synth && enVoices().length > 0;
  const supported = () => !!synth;
  function allowed(m) {
    const a = Store.settings().accent;
    if (a === 'us') return m.accent === 'US' || m.accent === 'CA';
    if (a === 'uk') return m.accent === 'UK' || m.accent === 'AU' || m.accent === 'IE' || m.accent === 'NZ';
    return ['US', 'UK', 'AU', 'CA'].includes(m.accent);
  }
  function main() {
    const list = enVoices();
    const chosen = Store.settings().voice;
    const c = list.find(m => m.v.name === chosen);
    if (c) return c;
    return list.filter(allowed).find(m => m.accent === 'US') || list.find(allowed) || list[0] || null;
  }
  function cast(roles, seed = 'x') {
    const list = enVoices();
    const pool = list.filter(allowed).length ? list.filter(allowed) : list;
    const r = U.rng('cast' + seed);
    const out = {};
    const usedV = new Set(), usedA = new Set();
    roles.forEach(role => {
      if (out[role]) return;
      const g = /^W/.test(role) ? 'f' : /^M/.test(role) ? 'm' : null;
      let cands = pool.filter(m => (!g || m.gender === g) && !usedV.has(m.v.name));
      if (Store.settings().accent === 'mix') {
        const fresh = cands.filter(m => !usedA.has(m.accent));
        if (fresh.length) cands = fresh;
      }
      if (cands.length) {
        const best = cands[0].q;
        const top = cands.filter(m => m.q >= best - 2);
        const m = top[Math.floor(r() * top.length)];
        usedV.add(m.v.name); usedA.add(m.accent);
        out[role] = { v: m.v, pitch: 1, accent: m.accent };
      } else {
        const any = pool.find(m => !usedV.has(m.v.name)) || pool[0] || null;
        if (any) usedV.add(any.v.name);
        out[role] = { v: any ? any.v : null, pitch: g === 'm' ? .82 : g === 'f' ? 1.18 : 1, accent: any ? any.accent : 'US' };
      }
    });
    return out;
  }
  function chunks(text, max = 170) {
    const sents = String(text).match(/[^.!?;]+[.!?;]*["')\]]*\s*/g) || [String(text)];
    const out = [];
    for (let s of sents) {
      while (s.length > max) {
        let cut = s.lastIndexOf(', ', max);
        if (cut < 40) cut = s.lastIndexOf(' ', max);
        if (cut < 20) cut = max;
        out.push(s.slice(0, cut + 1)); s = s.slice(cut + 1);
      }
      if (out.length && (out[out.length - 1] + s).length <= max) out[out.length - 1] += s;
      else if (s.trim()) out.push(s);
    }
    return out.map(s => s.trim()).filter(Boolean);
  }
  function speakOne(text, opts, my) {
    return new Promise(resolve => {
      if (!synth || !text) return resolve(false);
      const u = new SpeechSynthesisUtterance(text);
      const c = opts.cast || main() && { v: main().v, pitch: 1 };
      if (c && c.v) { u.voice = c.v; u.lang = c.v.lang; } else u.lang = 'en-US';
      u.rate = U.clamp((opts.rate || 1) * (Store.settings().rate || 1), .5, 1.6);
      u.pitch = opts.pitch || (c && c.pitch) || 1;
      u.volume = 1;
      let done = false;
      const fin = ok => { if (!done) { done = true; clearTimeout(guard); resolve(ok && my === token); } };
      u.onend = () => fin(true);
      u.onerror = () => fin(false);
      if (opts.onBoundary) u.onboundary = opts.onBoundary;
      const guard = setTimeout(() => fin(true), 2500 + text.length * 110 / u.rate);
      try { synth.speak(u); if (synth.paused) synth.resume(); } catch (e) { fin(false); }
    });
  }
  async function speak(text, opts = {}) {
    if (!synth || !text) return false;
    const my = opts.token != null ? opts.token : ++token;
    if (opts.cancel !== false) synth.cancel();
    for (const c of chunks(text)) {
      if (my !== token) return false;
      await speakOne(c, opts, my);
      if (my !== token) return false;
    }
    return true;
  }
  async function speakLines(lines, opts = {}) {
    const my = ++token;
    if (synth) synth.cancel();
    const roles = U.uniq(lines.map(l => l.who || 'N'));
    const cs = opts.castMap || cast(roles, opts.seed || lines.map(l => l.text).join('').slice(0, 30));
    for (let i = opts.from || 0; i < lines.length; i++) {
      if (my !== token) return false;
      opts.onLine && opts.onLine(i);
      await speak(lines[i].text, { cast: cs[lines[i].who || 'N'], token: my, cancel: false, rate: opts.rate });
      if (my !== token) return false;
      if (i < lines.length - 1) await U.sleep(opts.gap != null ? opts.gap : 320);
    }
    opts.onLine && opts.onLine(-1);
    return my === token;
  }
  function stop() { token++; if (synth) synth.cancel(); }
  const newToken = () => ++token;
  const live = t => t === token;

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const canListen = () => !!SR;
  let rec = null, stream = null;
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const canRecord = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder) && !mobile;
  async function micStream() {
    if (stream && stream.active) return stream;
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    return stream;
  }
  function release() {
    stopListen();
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  }
  function listen(opts = {}) {
    return new Promise(async (resolve, reject) => {
      if (!SR) return reject(new Error('unsupported'));
      try { if (rec) rec.abort(); } catch (e) {}
      let mr = null, st = null;
      const parts = [];
      if (opts.record && canRecord()) {
        try {
          st = await micStream();
          mr = new MediaRecorder(st);
          mr.ondataavailable = e => { if (e.data && e.data.size) parts.push(e.data); };
          mr.start();
          opts.onStream && opts.onStream(st);
        } catch (e) { mr = null; if (e && e.name === 'NotAllowedError') return reject(new Error('not-allowed')); }
      }
      const t0 = Date.now();
      let firstAt = 0, lastAt = 0;
      const r = rec = new SR();
      r.lang = opts.lang || 'en-US';
      r.interimResults = true;
      r.maxAlternatives = 5;
      r.continuous = !!opts.continuous;
      let finals = [], alts = [], interim = '', err = null, conf = [];
      r.onresult = e => {
        const now = Date.now();
        if (!firstAt) firstAt = now;
        lastAt = now;
        finals = []; interim = ''; conf = [];
        for (let i = 0; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) {
            finals.push(res[0].transcript.trim());
            if (res[0].confidence) conf.push(res[0].confidence);
            if (e.results.length === 1) alts = [...res].map(a => a.transcript.trim());
          } else interim += res[0].transcript;
        }
        opts.onInterim && opts.onInterim((finals.join(' ') + ' ' + interim).trim());
      };
      r.onerror = e => { err = e.error || 'error'; };
      r.onend = async () => {
        const secs = (Date.now() - t0) / 1000;
        let blob = null;
        if (mr) blob = await new Promise(res => {
          if (mr.state === 'inactive') return res(null);
          mr.onstop = () => res(parts.length ? new Blob(parts, { type: mr.mimeType || 'audio/webm' }) : null);
          try { mr.stop(); } catch (e) { res(null); }
        });
        const text = (finals.join(' ') || interim).trim();
        if (err === 'not-allowed' || err === 'service-not-allowed') return reject(new Error('not-allowed'));
        if (err && !text && !['no-speech', 'aborted'].includes(err)) return reject(new Error(err));
        resolve({ text, alts: alts.length ? alts : (text ? [text] : []), conf: conf.length ? U.avg(conf) : null, blob, audio: blob ? URL.createObjectURL(blob) : null, secs, span: firstAt ? (lastAt - firstAt) / 1000 : 0 });
      };
      try { r.start(); } catch (e) { if (mr && mr.state !== 'inactive') mr.stop(); return reject(e); }
      opts.onStart && opts.onStart();
      if (opts.maxMs) setTimeout(() => { if (rec === r) try { r.stop(); } catch (e) {} }, opts.maxMs);
    });
  }
  function stopListen() { try { rec && rec.stop(); } catch (e) {} }

  return { speak, speakLines, stop, newToken, live, cast, main, enVoices, available, supported, canListen, canRecord, listen, stopListen, release, micStream, refresh, ACC_VI, chunks };
})();
