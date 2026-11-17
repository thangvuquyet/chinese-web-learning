const Score = (() => {
  const LT = [[0, 5], [5, 5], [10, 15], [15, 40], [20, 65], [25, 90], [30, 115], [35, 140], [40, 165], [45, 195], [50, 225], [55, 255], [60, 285], [65, 315], [70, 345], [75, 375], [80, 405], [85, 440], [90, 475], [94, 495], [100, 495]];
  const RT = [[0, 5], [5, 5], [10, 15], [15, 35], [20, 55], [25, 75], [30, 100], [35, 125], [40, 150], [45, 175], [50, 205], [55, 230], [60, 260], [65, 290], [70, 320], [75, 350], [80, 380], [85, 410], [90, 440], [95, 470], [98, 495], [100, 495]];
  const N = { 1: 6, 2: 25, 3: 39, 4: 30, 5: 30, 6: 16, 7: 54 };
  const r5 = x => Math.max(5, Math.min(495, Math.round(x / 5) * 5));
  function interp(tab, raw) {
    raw = U.clamp(raw, 0, 100);
    for (let i = 1; i < tab.length; i++) {
      if (raw <= tab[i][0]) {
        const [x0, y0] = tab[i - 1], [x1, y1] = tab[i];
        return y0 + (y1 - y0) * (raw - x0) / (x1 - x0 || 1);
      }
    }
    return tab[tab.length - 1][1];
  }
  const scaleL = raw => r5(interp(LT, raw));
  const scaleR = raw => r5(interp(RT, raw));
  function fromParts(res) {
    let lOk = 0, lN = 0, rOk = 0, rN = 0;
    for (const [k, [ok, n]] of Object.entries(res)) {
      if (!n) continue;
      if (+k <= 4) { lOk += ok; lN += n; } else { rOk += ok; rN += n; }
    }
    const L = lN ? scaleL(lOk / lN * 100) : null;
    const R = rN ? scaleR(rOk / rN * 100) : null;
    return { L, R, T: L != null && R != null ? L + R : null, lPct: lN ? lOk / lN : null, rPct: rN ? rOk / rN : null };
  }
  function partAcc(p, k) {
    const r = p.parts[k];
    const prior = p.level0 && p.level0.acc ? (+k <= 4 ? p.level0.acc.L : p.level0.acc.R) : .55;
    const w = 6;
    const h = r.h;
    return (U.sum(h) + prior * w) / (h.length + w);
  }
  function predict(p) {
    if (!p) return null;
    const acc = {};
    let n = 0;
    for (const k of Object.keys(N)) { acc[k] = partAcc(p, k); n += p.parts[k].h.length; }
    const rawL = [1, 2, 3, 4].reduce((a, k) => a + acc[k] * N[k], 0);
    const rawR = [5, 6, 7].reduce((a, k) => a + acc[k] * N[k], 0);
    const L = scaleL(rawL), R = scaleR(rawR);
    const conf = Math.min(1, n / 320);
    const spread = Math.round(((1 - conf) * 110 + 30) / 5) * 5;
    return { L, R, T: L + R, acc, n, conf, spread, hasData: n >= 15 || !!p.level0 };
  }
  function needAcc(target) {
    let lo = 0, hi = 1;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (scaleL(mid * 100) + scaleR(mid * 100) >= target) hi = mid; else lo = mid;
    }
    return hi;
  }
  function gaps(p) {
    const pr = predict(p);
    const need = needAcc(p.target);
    return Object.keys(N).map(k => ({ part: +k, acc: pr.acc[k], n: p.parts[k].h.length, need, gap: need - pr.acc[k], weight: N[k] })).sort((a, b) => (b.gap * b.weight) - (a.gap * a.weight));
  }
  function track(p) {
    const pr = predict(p);
    if (!pr || !pr.hasData) return pr;
    p.predHist = p.predHist || {};
    const k = U.dayKey();
    if (p.predHist[k] !== pr.T) { p.predHist[k] = pr.T; const ks = Object.keys(p.predHist).sort(); while (ks.length > 120) delete p.predHist[ks.shift()]; Store.save(); }
    return pr;
  }
  function band(T) {
    if (T >= 860) return { name: 'Gold', vi: 'Chứng chỉ màu Vàng (860–990)', color: '#C9970C' };
    if (T >= 730) return { name: 'Blue', vi: 'Chứng chỉ màu Xanh dương (730–855)', color: '#3048E0' };
    if (T >= 470) return { name: 'Green', vi: 'Chứng chỉ màu Xanh lá (470–725)', color: '#16A34A' };
    if (T >= 220) return { name: 'Brown', vi: 'Chứng chỉ màu Nâu (220–465)', color: '#9A6B3F' };
    return { name: 'Orange', vi: 'Chứng chỉ màu Cam (10–215)', color: '#E8862A' };
  }
  function cefr(L, R) {
    const l = L >= 490 ? 'C1' : L >= 400 ? 'B2' : L >= 275 ? 'B1' : L >= 110 ? 'A2' : 'A1';
    const r = R >= 455 ? 'C1' : R >= 385 ? 'B2' : R >= 275 ? 'B1' : R >= 115 ? 'A2' : 'A1';
    return { L: l, R: r };
  }
  return { scaleL, scaleR, fromParts, predict, needAcc, gaps, track, band, cefr, N };
})();
