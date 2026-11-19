const FX = (() => {
  const { h } = U;
  let actx = null;
  function ctx() {
    if (!actx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      actx = new C();
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  function tone(freq, dur = 0.12, type = 'sine', vol = 0.18, delay = 0) {
    if (!Store.settings().sound) return;
    const c = ctx(); if (!c) return;
    const t0 = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  const sfx = {
    ok() { tone(880, 0.12, 'sine', 0.16); tone(1318, 0.22, 'sine', 0.14, 0.09); },
    bad() { tone(220, 0.18, 'triangle', 0.16); tone(180, 0.25, 'triangle', 0.12, 0.12); },
    tap() { tone(660, 0.05, 'square', 0.04); },
    flip() { tone(520, 0.06, 'triangle', 0.08); tone(780, 0.06, 'triangle', 0.06, 0.05); },
    done() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.25, 'sine', 0.14, i * 0.09)); },
    level() { [392, 523, 659, 784, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, i % 2 ? 'triangle' : 'sine', 0.14, i * 0.1)); },
    combo(n) { tone(660 + Math.min(n, 10) * 60, 0.1, 'sine', 0.12); },
    pop() { tone(990, 0.07, 'sine', 0.1); },
    stamp() { tone(140, 0.16, 'triangle', 0.22); tone(95, 0.22, 'sine', 0.18, 0.02); tone(1760, 0.05, 'sine', 0.05, 0.03); },
    streak() { [392, 494, 587, 784].forEach((f, i) => tone(f, 0.3, 'triangle', 0.12, i * 0.11)); tone(1175, 0.5, 'sine', 0.1, 0.48); },
    badge() { [659, 880, 1109, 1319].forEach((f, i) => tone(f, 0.35, 'sine', 0.11, i * 0.08)); },
    tick() { tone(1500, 0.025, 'square', 0.025); },
    rise() { [523, 587, 659, 784].forEach((f, i) => tone(f, 0.12, 'sine', 0.08, i * 0.05)); }
  };

  const canvas = document.getElementById('fx-canvas');
  const g2 = canvas ? canvas.getContext('2d') : null;
  let parts = [], running = false;
  const COLORS = ['#0F7B66', '#C99429', '#D24A2C', '#34508A', '#2C74B3', '#E3C77A', '#8CC5B5'];
  function resize() { if (!canvas) return; canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio; }
  addEventListener('resize', resize); resize();
  function motionOk() { return Store.settings().motion && !matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function confetti(opts = {}) {
    if (!g2 || !motionOk()) return;
    const n = opts.n || 120;
    const x = (opts.x != null ? opts.x : innerWidth / 2) * devicePixelRatio;
    const y = (opts.y != null ? opts.y : innerHeight / 3) * devicePixelRatio;
    for (let i = 0; i < n; i++) {
      const a = opts.rain ? Math.PI / 2 : Math.random() * Math.PI * 2;
      const sp = (opts.rain ? 2 : 6 + Math.random() * 9) * devicePixelRatio;
      parts.push({
        x: opts.rain ? Math.random() * canvas.width : x,
        y: opts.rain ? -20 - Math.random() * canvas.height * 0.5 : y,
        vx: Math.cos(a) * sp * (opts.rain ? 0.3 : 1),
        vy: Math.sin(a) * sp - (opts.rain ? 0 : 4 * devicePixelRatio),
        s: (5 + Math.random() * 7) * devicePixelRatio,
        c: COLORS[i % COLORS.length],
        r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
        shape: Math.random() < 0.3 ? 2 : Math.random() < 0.55 ? 0 : 1,
        life: 0, max: 140 + Math.random() * 60
      });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  function ribbon(ctx2, p) {
    const w = p.s * 0.28, l = p.s * 1.9, k = Math.sin(p.life * 0.25) * p.s * 0.35;
    ctx2.beginPath();
    ctx2.moveTo(-w, -l / 2);
    ctx2.quadraticCurveTo(k - w, 0, -w, l / 2);
    ctx2.lineTo(w, l / 2);
    ctx2.quadraticCurveTo(k + w, 0, w, -l / 2);
    ctx2.closePath();
    ctx2.fill();
  }
  function tick() {
    g2.clearRect(0, 0, canvas.width, canvas.height);
    parts = parts.filter(p => p.life < p.max && p.y < canvas.height + 40);
    for (const p of parts) {
      p.life++; p.vy += 0.25 * devicePixelRatio; p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx; p.y += p.vy; p.r += p.vr;
      g2.save(); g2.translate(p.x, p.y); g2.rotate(p.r);
      g2.globalAlpha = Math.max(0, 1 - p.life / p.max);
      g2.fillStyle = p.c;
      if (p.shape === 0) g2.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      else if (p.shape === 1) { g2.beginPath(); g2.arc(0, 0, p.s / 2.6, 0, Math.PI * 2); g2.fill(); }
      else ribbon(g2, p);
      g2.restore();
    }
    if (parts.length) requestAnimationFrame(tick);
    else { running = false; g2.clearRect(0, 0, canvas.width, canvas.height); }
  }
  function burstAt(el, n = 40) {
    if (!el) return confetti({ n });
    const r = el.getBoundingClientRect();
    confetti({ x: r.left + r.width / 2, y: r.top + r.height / 2, n });
  }

  function toast(text) {
    const root = document.getElementById('toast-root');
    const t = h('div.toast', text);
    root.appendChild(t);
    setTimeout(() => t.remove(), 2900);
  }
  function xpFloat(n, el) {
    if (!motionOk()) return;
    let x = innerWidth / 2, y = innerHeight / 2;
    if (el) { const r = el.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top; }
    const f = h('div.xp-float', '+' + n + ' XP');
    f.style.left = (x - 40) + 'px'; f.style.top = y + 'px';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1300);
  }

  function mascot(mood = 'happy', size = '') {
    const wrap = h('div.mascot.cat' + (size ? '.' + size : ''), { dataset: { mood } });
    wrap.innerHTML = Mascot.svg('cat', { collar: '#0F7B66', tag: '#E3B54A' });
    return wrap;
  }

  let modalStack = [];
  function modal(content, opts = {}) {
    const root = document.getElementById('modal-root');
    const box = h('div.modal' + (opts.cls ? '.' + opts.cls : ''), { role: 'dialog', 'aria-modal': 'true' });
    const back = h('div.modal-back', box);
    const close = () => {
      back.remove();
      modalStack = modalStack.filter(m => m !== close);
      document.removeEventListener('keydown', onKey);
      opts.onClose && opts.onClose();
    };
    const onKey = e => { if (e.key === 'Escape' && modalStack[modalStack.length - 1] === close) close(); };
    if (!opts.noClose) box.appendChild(h('button.modal-x', { onclick: close, 'aria-label': 'Đóng' }, '✕'));
    box.appendChild(typeof content === 'function' ? content(close) : content);
    back.addEventListener('click', e => { if (e.target === back && !opts.noClose) close(); });
    document.addEventListener('keydown', onKey);
    root.appendChild(back);
    modalStack.push(close);
    return close;
  }
  function closeAll() { [...modalStack].forEach(c => c()); }
  function confirm(title, text, okLabel = 'Đồng ý', cancelLabel = 'Thôi') {
    return new Promise(res => {
      let answered = false;
      const close = modal(c => h('div.center',
        mascot('think', 'sm'),
        h('h2', title),
        text ? h('p.muted', { style: { fontWeight: 500 } }, text) : null,
        h('div.row', { style: { justifyContent: 'center', marginTop: '14px' } },
          h('button.btn.ghost', { onclick: () => { answered = true; c(); res(false); } }, cancelLabel),
          h('button.btn', { onclick: () => { answered = true; c(); res(true); } }, okLabel))
      ), { onClose: () => { if (!answered) res(false); } });
    });
  }
  function countUp(el, to, o = {}) {
    const from = o.from || 0, dur = o.dur || 900, pre = o.prefix || '', suf = o.suffix || '';
    if (!motionOk() || to === from) { el.textContent = pre + to + suf; return; }
    const t0 = performance.now();
    let lastTick = 0;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + Math.round(from + (to - from) * e) + suf;
      if (o.ticks && now - lastTick > 70 && k < 1) { sfx.tick(); lastTick = now; }
      if (k < 1) requestAnimationFrame(step);
    };
    el.textContent = pre + from + suf;
    setTimeout(() => requestAnimationFrame(step), o.delay || 0);
  }
  function banner(text, sub) {
    const root = document.getElementById('toast-root');
    root.querySelectorAll('.combo-banner').forEach(x => x.remove());
    const b = h('div.combo-banner', h('span.cb-n', text), sub ? h('span.cb-s', sub) : null);
    root.appendChild(b);
    setTimeout(() => b.remove(), 1900);
  }
  function flame(n, plain) {
    const el = h('div.flame-hero');
    const k = plain ? 'h' : '';
    el.innerHTML = `<svg viewBox="0 0 120 140" aria-hidden="true"><defs><linearGradient id="fg${k}1" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#C2410C"/><stop offset=".55" stop-color="#E8622C"/><stop offset="1" stop-color="#F2A93B"/></linearGradient><linearGradient id="fg${k}2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#F59E0B"/><stop offset="1" stop-color="#FDE68A"/></linearGradient></defs><path class="fl-o" d="M60 134c27 0 48-18 48-46 0-21-12-37-24-50-2 12-8 21-17 25 3-24-9-45-27-58 1 23-13 37-22 50-6 9-10 20-10 33 0 28 23 46 52 46Z" fill="url(#fg${k}1)"/><path class="fl-i" d="M60 132c15 0 26-10 26-25 0-12-7-21-14-28-1 7-5 12-10 14 2-13-5-25-15-32 0 13-7 21-12 28-3 5-5 11-5 18 0 15 13 25 30 25Z" fill="url(#fg${k}2)"/></svg>${plain ? '' : `<b class="fl-n">${Math.max(0, n - 1)}</b>`}`;
    return el;
  }
  const celeQ = [];
  let celeOn = false;
  function cele(spec) { celeQ.push(spec); if (!celeOn) nextCele(); }
  function nextCele() {
    const spec = celeQ.shift();
    if (!spec) { celeOn = false; return; }
    celeOn = true;
    const btn = h('button.btn.block.cele-btn', spec.btn || 'Tiếp tục');
    const box = h('div.cele.' + (spec.kind || 'plain'), { role: 'dialog', 'aria-modal': 'true', 'aria-label': spec.title },
      h('div.cele-in',
        h('div.cele-hero', h('div.rays'), spec.hero),
        h('h2.cele-title', spec.title),
        spec.sub ? h('p.cele-sub', spec.sub) : null,
        spec.extra || null,
        btn));
    const close = () => {
      document.removeEventListener('keydown', onKey, true);
      box.classList.add('out');
      setTimeout(() => { box.remove(); nextCele(); }, 260);
    };
    const onKey = e => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } };
    btn.addEventListener('click', () => { sfx.tap(); close(); });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(box);
    requestAnimationFrame(() => box.classList.add('show'));
    spec.sound && spec.sound();
    if (spec.confetti) setTimeout(() => confetti(spec.confetti), 280);
    spec.onShow && spec.onShow(box);
    setTimeout(() => btn.focus({ preventScroll: true }), 400);
  }
  function celeBusy() { return celeOn; }
  return { sfx, confetti, burstAt, toast, xpFloat, mascot, modal, closeAll, confirm, motionOk, countUp, banner, flame, cele, celeBusy };
})();
