const SRS = (() => {
  const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
  const DECAY = -0.5, FACTOR = 19 / 81, RET = 0.9;
  const MIN = 60000, DAY = 86400000;
  const clampD = d => Math.min(10, Math.max(1, d));
  const initS = g => Math.max(W[g - 1], 0.1);
  const initD = g => clampD(W[4] - (g - 3) * W[5]);
  const nextD = (d, g) => clampD(W[7] * initD(3) + (1 - W[7]) * (d - W[6] * (g - 3)));
  const retr = (t, s) => Math.pow(1 + FACTOR * t / s, DECAY);
  const recallS = (d, s, r, g) => s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * (g === 2 ? W[15] : 1) * (g === 4 ? W[16] : 1));
  const forgetS = (d, s, r) => Math.max(0.1, W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r)));
  const ivl = s => Math.min(36500, Math.max(1, Math.round(s / FACTOR * (Math.pow(RET, 1 / DECAY) - 1))));

  function newCard() { return { s: 0, d: 0, due: 0, last: 0, reps: 0, lapses: 0, st: 0 }; }

  function grade(card, g, now = Date.now(), fuzz = true) {
    const c = Object.assign(newCard(), card);
    if (c.st === 0) {
      c.d = initD(g); c.s = initS(g);
      if (g === 1) { c.st = 1; c.due = now + MIN; }
      else if (g === 2) { c.st = 1; c.due = now + 6 * MIN; }
      else { c.st = 2; c.due = now + ivl(c.s) * DAY; }
    } else if (c.st === 1 || c.st === 3) {
      const relearn = c.st === 3;
      c.d = nextD(c.d, g);
      if (g === 1) c.due = now + (relearn ? 10 : 1) * MIN;
      else if (g === 2) c.due = now + (relearn ? 10 : 6) * MIN;
      else {
        if (!relearn) c.s = Math.max(c.s, initS(g));
        if (g === 4) c.s *= 1.3;
        c.st = 2;
        c.due = now + ivl(c.s) * DAY;
      }
    } else {
      const t = Math.max(0, (now - c.last) / DAY);
      const r = retr(t, Math.max(c.s, 0.1));
      c.d = nextD(c.d, g);
      if (g === 1) {
        c.s = forgetS(c.d, c.s, r);
        c.lapses++; c.st = 3; c.due = now + 10 * MIN;
      } else {
        c.s = recallS(c.d, c.s, r, g);
        let days = ivl(c.s);
        if (fuzz && days > 2) days = Math.max(1, Math.round(days * (0.95 + Math.random() * 0.1)));
        c.due = now + days * DAY;
      }
    }
    c.last = now; c.reps++;
    return c;
  }
  function preview(card, now = Date.now()) {
    const out = {};
    for (let g = 1; g <= 4; g++) out[g] = (grade(card, g, now, false).due - now) / DAY;
    return out;
  }
  function introduce(card, g, now = Date.now()) {
    if (card && card.st) return card;
    const c = grade(newCard(), g, now, false);
    if (c.st === 2) c.due = now + 20 * 3600 * 1000;
    return c;
  }
  function known(now = Date.now()) {
    const c = newCard();
    c.st = 2; c.s = 20 + Math.random() * 25; c.d = 3; c.reps = 1; c.last = now;
    c.due = now + (7 + Math.random() * 50) * DAY;
    return c;
  }
  function retrievability(card, now = Date.now()) {
    if (!card || card.st === 0) return 0;
    return retr(Math.max(0, (now - card.last) / DAY), Math.max(card.s, 0.1));
  }
  function bucket(card) {
    if (!card || card.st === 0) return 'new';
    if (card.st === 1 || card.st === 3) return 'learning';
    if (card.s >= 21) return 'mature';
    return 'young';
  }
  return { newCard, grade, preview, introduce, known, retrievability, bucket, DAY };
})();
