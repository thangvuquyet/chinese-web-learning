const Clips = (() => {
  const BASE = 'audio/';
  let ids = null, active = null, gen = 0;
  const urls = new Map();
  const loading = new Map();
  const stats = { hit: 0, miss: 0 };

  const ready = (typeof fetch === 'function' ? fetch(BASE + 'manifest.json', { cache: 'no-cache' }) : Promise.reject())
    .then(r => r.ok ? r.json() : null)
    .then(m => { ids = new Set((m && m.ids) || []); })
    .catch(() => { ids = new Set(); });

  const parts = (key, text) => [Voices.clipId(key, text)];
  const has = (key, text) => !!ids && !!Voices.norm(text) && parts(key, text).every(id => ids.has(id));

  function warmId(id) {
    if (urls.has(id)) return Promise.resolve(urls.get(id));
    if (loading.has(id)) return loading.get(id);
    const p = fetch(BASE + id + '.mp3').then(r => { if (!r.ok) throw new Error('clip ' + r.status); return r.blob(); }).then(b => {
      const u = URL.createObjectURL(b);
      urls.set(id, u);
      if (urls.size > 90) { const first = urls.keys().next().value; URL.revokeObjectURL(urls.get(first)); urls.delete(first); }
      loading.delete(id);
      return u;
    }).catch(e => { loading.delete(id); throw e; });
    loading.set(id, p);
    return p;
  }
  const warm = (key, text) => Promise.all(parts(key, text).map(warmId));

  function stop() {
    gen++;
    if (active) { const a = active; active = null; try { a.pause(); } catch (e) {} if (a._fin) a._fin(0); }
  }

  function one(url, rate) {
    return new Promise(resolve => {
      const a = new window.Audio(url);
      a.preservesPitch = true;
      a.playbackRate = Math.min(1.6, Math.max(.5, rate || 1));
      let done = false;
      const fin = v => { if (done) return; done = true; if (active === a) active = null; resolve(v); };
      a._fin = fin;
      active = a;
      a.onended = () => fin(1);
      a.onerror = () => fin(-1);
      a.play().catch(() => fin(-1));
    });
  }

  async function play(key, text, rate) {
    stop();
    const my = gen;
    let list;
    try { list = await warm(key, text); } catch (e) { stats.miss++; return -1; }
    if (my !== gen) return 0;
    for (const u of list) {
      const r = await one(u, rate);
      if (my !== gen) return 0;
      if (r !== 1) return r;
    }
    stats.hit++;
    return 1;
  }

  return { ready, has, warm, play, stop, stats, get size() { return ids ? ids.size : 0; } };
})();
