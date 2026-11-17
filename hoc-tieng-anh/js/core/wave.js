const Wave = (() => {
  let actx = null;
  function ctx() {
    if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; actx = new C(); }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  async function analyze(blob) {
    const c = ctx();
    if (!c || !blob) return null;
    let buf;
    try { buf = await c.decodeAudioData(await blob.arrayBuffer()); } catch (e) { return null; }
    const data = buf.getChannelData(0);
    const sr = buf.sampleRate;
    const fr = Math.round(sr * .02);
    const rms = [];
    for (let i = 0; i + fr <= data.length; i += fr) {
      let s = 0;
      for (let j = i; j < i + fr; j++) s += data[j] * data[j];
      rms.push(Math.sqrt(s / fr));
    }
    if (!rms.length) return null;
    const sorted = rms.slice().sort((a, b) => a - b);
    const floor = sorted[Math.floor(sorted.length * .15)] || 0;
    const peak = sorted[Math.floor(sorted.length * .98)] || 0;
    const th = Math.max(floor * 2.6, floor + (peak - floor) * .12, .006);
    const voiced = rms.map(v => v > th);
    for (let i = 1; i < voiced.length - 1; i++) if (!voiced[i] && voiced[i - 1] && voiced[i + 1]) voiced[i] = true;
    const segs = [];
    let st = -1;
    voiced.forEach((v, i) => {
      if (v && st < 0) st = i;
      if (!v && st >= 0) { if (i - st >= 3) segs.push([st, i]); st = -1; }
    });
    if (st >= 0 && voiced.length - st >= 3) segs.push([st, voiced.length]);
    const T = i => i * .02;
    const pauses = [];
    for (let i = 1; i < segs.length; i++) {
      const gap = T(segs[i][0] - segs[i - 1][1]);
      if (gap >= .35) pauses.push({ at: T(segs[i - 1][1]), len: gap });
    }
    const voicedSec = U.sum(segs.map(([a, b]) => T(b - a)));
    const span = segs.length ? T(segs[segs.length - 1][1] - segs[0][0]) : 0;
    const bins = 96;
    const per = Math.max(1, Math.floor(rms.length / bins));
    const bars = [];
    for (let i = 0; i < bins; i++) { const sl = rms.slice(i * per, (i + 1) * per); bars.push(sl.length ? Math.max(...sl) : 0); }
    const mx = Math.max(...bars, .0001);
    return { dur: buf.duration, span, voicedSec, pauses, longPauses: pauses.filter(p => p.len >= .7), segs: segs.map(([a, b]) => [T(a), T(b)]), bars: bars.map(b => b / mx), start: segs.length ? T(segs[0][0]) : 0 };
  }
  function meter(stream, canvas) {
    const c = ctx();
    if (!c || !stream || !canvas) return () => {};
    const src = c.createMediaStreamSource(stream);
    const an = c.createAnalyser();
    an.fftSize = 512;
    src.connect(an);
    const g = canvas.getContext('2d');
    const buf = new Uint8Array(an.fftSize);
    const hist = [];
    let raf = 0, on = true;
    const dpr = devicePixelRatio || 1;
    function draw() {
      if (!on) return;
      const w = canvas.clientWidth * dpr, h = canvas.clientHeight * dpr;
      if (canvas.width !== w) { canvas.width = w; canvas.height = h; }
      an.getByteTimeDomainData(buf);
      let s = 0;
      for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; s += v * v; }
      hist.push(Math.min(1, Math.sqrt(s / buf.length) * 5));
      const n = Math.floor(w / (5 * dpr));
      while (hist.length > n) hist.shift();
      g.clearRect(0, 0, w, h);
      const color = getComputedStyle(canvas).color || '#3048E0';
      g.fillStyle = color;
      hist.forEach((v, i) => {
        const bh = Math.max(2 * dpr, v * h * .9);
        const x = w - (hist.length - i) * 5 * dpr;
        const y = (h - bh) / 2;
        const bw = 3 * dpr;
        g.globalAlpha = .35 + .65 * (i / hist.length);
        g.beginPath();
        if (g.roundRect) g.roundRect(x, y, bw, bh, bw / 2); else g.rect(x, y, bw, bh);
        g.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { on = false; cancelAnimationFrame(raf); try { src.disconnect(); } catch (e) {} };
  }
  function play(url) {
    return new Promise(res => {
      if (!url) return res(false);
      const a = new window.Audio(url);
      a.onended = () => res(true);
      a.onerror = () => res(false);
      a.play().catch(() => res(false));
    });
  }
  return { analyze, meter, play, ctx };
})();
