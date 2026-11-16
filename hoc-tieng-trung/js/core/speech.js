const Speech = (() => {
  const synth = window.speechSynthesis || null;
  let voices = [];
  let token = 0;
  const FEMALE = /(xiaoxiao|xiaoyi|xiaochen|xiaohan|xiaomeng|xiaomo|xiaoqiu|xiaorui|xiaoshuang|xiaoxuan|xiaoyan|xiaoyou|xiaozhen|huihui|yaoyao|tingting|meijia|sinji|lili|female|女|ting-ting|google 普通话)/i;
  const MALE = /(yunxi|yunjian|yunyang|yunfeng|yunhao|yunye|yunze|kangkang|male|男|li-mu)/i;

  function refresh() {
    if (!synth) return;
    voices = synth.getVoices() || [];
  }
  if (synth) {
    refresh();
    if ('onvoiceschanged' in synth) synth.onvoiceschanged = refresh;
    setTimeout(refresh, 400);
    setTimeout(refresh, 1500);
  }
  function zhVoices() {
    const zh = voices.filter(v => /^zh/i.test(v.lang) || /chinese|中文|普通话/i.test(v.name));
    const cn = zh.filter(v => /zh[-_]CN|cmn/i.test(v.lang));
    const list = cn.length ? cn : zh;
    return list.sort((a, b) => score(b) - score(a));
  }
  function score(v) {
    let s = 0;
    if (/natural|online|neural/i.test(v.name)) s += 5;
    if (/xiaoxiao|yunxi/i.test(v.name)) s += 3;
    if (/google/i.test(v.name)) s += 2;
    if (v.localService) s += 1;
    return s;
  }
  function pick(gender) {
    const list = zhVoices();
    if (!list.length) return null;
    const chosen = Store.settings().voice;
    if (!gender) return list.find(v => v.name === chosen) || list[0];
    const re = gender === 'f' ? FEMALE : MALE;
    return list.find(v => re.test(v.name)) || null;
  }
  const available = () => !!synth && zhVoices().length > 0;
  const supported = () => !!synth;

  function chunks(text) {
    const parts = String(text).split(/(?<=[。！？；!?;])/).flatMap(s => s.length > 44 ? s.split(/(?<=[，,、：])/) : [s]).filter(s => s.trim());
    const out = [];
    for (const s of parts) {
      if (out.length && (out[out.length - 1] + s).length <= 36) out[out.length - 1] += s;
      else out.push(s);
    }
    return out;
  }
  function speak(text, opts = {}) {
    if (!synth || !text) return Promise.resolve(false);
    const list = String(text).length > 36 ? chunks(text) : [String(text)];
    if (list.length < 2) return speakOne(text, opts);
    const my = opts.token != null ? opts.token : ++token;
    if (opts.cancel !== false) synth.cancel();
    return (async () => {
      for (const c of list) {
        await speakOne(c, Object.assign({}, opts, { token: my, cancel: false }));
        if (my !== token) return false;
      }
      return true;
    })();
  }
  function speakOne(text, opts = {}) {
    return new Promise(resolve => {
      if (!synth || !text) return resolve(false);
      const my = opts.token != null ? opts.token : ++token;
      if (opts.cancel !== false) { synth.cancel(); }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      const base = Store.settings().rate || 0.85;
      u.rate = (opts.rate || 1) * base;
      let v = opts.gender ? pick(opts.gender) : null;
      let pitch = 1;
      if (opts.gender && !v) { v = pick(); pitch = opts.gender === 'f' ? 1.25 : 0.78; }
      if (!v) v = pick();
      if (v) u.voice = v;
      u.pitch = opts.pitch || pitch;
      u.volume = 1;
      let done = false;
      const fin = ok => { if (!done) { done = true; clearTimeout(guard); resolve(ok && my === token); } };
      u.onend = () => fin(true);
      u.onerror = () => fin(false);
      const guard = setTimeout(() => fin(true), 1200 + text.length * 450 / u.rate);
      try { synth.speak(u); if (synth.paused) synth.resume(); } catch (e) { fin(false); }
    });
  }
  async function speakLines(lines, opts = {}) {
    const my = ++token;
    synth && synth.cancel();
    for (const ln of lines) {
      if (my !== token) return false;
      const gender = ln.who === '女' ? 'f' : ln.who === '男' ? 'm' : null;
      await speak(ln.text, { gender, token: my, cancel: false, rate: opts.rate });
      if (my !== token) return false;
      await U.sleep(opts.gap || 380);
    }
    return my === token;
  }
  function stop() { token++; if (synth) synth.cancel(); }
  function parseDialog(str) {
    return str.split('|').map(s => {
      const m = s.match(/^(男|女)：(.*)$/);
      return m ? { who: m[1], text: m[2] } : { who: null, text: s };
    });
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const canListen = () => !!SR;
  let rec = null;
  let stream = null;
  const canRecord = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder) && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  async function micStream() {
    if (stream && stream.active) return stream;
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
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
      let mr = null;
      const chunks = [];
      if (opts.record && canRecord()) {
        try {
          const st = await micStream();
          mr = new MediaRecorder(st);
          mr.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
          mr.start();
        } catch (e) { mr = null; }
      }
      const t0 = Date.now();
      const r = rec = new SR();
      r.lang = 'zh-CN';
      r.interimResults = true;
      r.maxAlternatives = 3;
      r.continuous = !!opts.continuous;
      let finals = [], alts = [], interim = '', err = null;
      r.onresult = e => {
        finals = []; interim = '';
        for (let i = 0; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) { finals.push(res[0].transcript); alts = [...res].map(a => a.transcript); }
          else interim += res[0].transcript;
        }
        opts.onInterim && opts.onInterim(finals.join('') + interim);
      };
      r.onerror = e => { err = e.error || 'error'; };
      r.onend = async () => {
        const secs = (Date.now() - t0) / 1000;
        let audio = null;
        if (mr) audio = await new Promise(res => {
          if (mr.state === 'inactive') return res(null);
          mr.onstop = () => res(chunks.length ? URL.createObjectURL(new Blob(chunks, { type: mr.mimeType || 'audio/webm' })) : null);
          try { mr.stop(); } catch (e) { res(null); }
        });
        const text = finals.join('') || interim;
        if (err && !text && !['no-speech', 'aborted'].includes(err)) return reject(new Error(err));
        resolve({ text, alts: alts.length ? alts : (text ? [text] : []), audio, secs });
      };
      try { r.start(); } catch (e) { if (mr && mr.state !== 'inactive') mr.stop(); return reject(e); }
      if (opts.maxMs) setTimeout(() => { if (rec === r) try { r.stop(); } catch (e) {} }, opts.maxMs);
    });
  }
  function stopListen() { try { rec && rec.stop(); } catch (e) {} }

  return { speak, speakLines, stop, available, supported, zhVoices, parseDialog, canListen, listen, stopListen, release, refresh };
})();
