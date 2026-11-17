const Art = (() => {
  const { h } = U;
  const FACE = `
      <g class="eye"><ellipse cx="42" cy="62" rx="6.2" ry="7.4" fill="#1E1B18"/><circle cx="44.2" cy="59.4" r="2.2" fill="#fff"/><circle cx="40.6" cy="65" r="1" fill="#fff" opacity=".8"/></g>
      <g class="eye"><ellipse cx="78" cy="62" rx="6.2" ry="7.4" fill="#1E1B18"/><circle cx="80.2" cy="59.4" r="2.2" fill="#fff"/><circle cx="76.6" cy="65" r="1" fill="#fff" opacity=".8"/></g>`;
  const MOUTH = `
      <path class="m-happy" d="M51 80 Q55.5 86 60 80 Q64.5 86 69 80" stroke="#4A3428" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="m-sad" d="M52 87 Q56 82 60 84 Q64 82 68 87" stroke="#4A3428" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <ellipse class="m-wow" cx="60" cy="85" rx="4" ry="5" fill="#4A3428"/>
      <path class="m-think" d="M54 84 Q60 82.5 66 85" stroke="#4A3428" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  function catSVG() {
    return `<svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      <ellipse class="shadow" cx="60" cy="114" rx="32" ry="4.5" fill="rgba(13,20,51,.10)"/>
      <path d="M19 58 L25 14 Q27 9 31 12 L55 33 Z" fill="#F4BE86" stroke="#D99A58" stroke-width="2" stroke-linejoin="round"/>
      <path d="M101 58 L95 14 Q93 9 89 12 L65 33 Z" fill="#F4BE86" stroke="#D99A58" stroke-width="2" stroke-linejoin="round"/>
      <path d="M26 46 L29 22 L44 35 Z" fill="#FBE3C8"/><path d="M94 46 L91 22 L76 35 Z" fill="#FBE3C8"/>
      <ellipse cx="42" cy="108" rx="11" ry="7" fill="#F4BE86" stroke="#D99A58" stroke-width="2"/>
      <ellipse cx="78" cy="108" rx="11" ry="7" fill="#F4BE86" stroke="#D99A58" stroke-width="2"/>
      <path d="M36 108v-3M42 108v-4M48 108v-3M72 108v-3M78 108v-4M84 108v-3" stroke="#D99A58" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="60" cy="64" rx="45" ry="39" fill="#F4BE86" stroke="#D99A58" stroke-width="2"/>
      <path d="M50 28 Q52 36 51 42 M60 26 Q61 35 60 42 M70 28 Q68 36 69 42" stroke="#DE9B55" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M17 62 Q24 60 29 63 M16 70 Q23 69 28 71 M103 62 Q96 60 91 63 M104 70 Q97 69 92 71" stroke="#DE9B55" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="60" cy="80" rx="24" ry="17" fill="#FFF6EA"/>
      ${FACE}
      <ellipse cx="30" cy="77" rx="7" ry="4.2" fill="#EE9A62" opacity=".32"/><ellipse cx="90" cy="77" rx="7" ry="4.2" fill="#EE9A62" opacity=".32"/>
      <path d="M56.2 72.5 Q60 70.6 63.8 72.5 Q62.6 76 60 76.8 Q57.4 76 56.2 72.5Z" fill="#8A5A44"/>
      <path d="M60 76.8 V79.5" stroke="#4A3428" stroke-width="2" stroke-linecap="round"/>
      ${MOUTH}
      <path d="M38 80 L20 77 M38 84 L21 86 M82 80 L100 77 M82 84 L99 86" stroke="#B8875E" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M27 96 Q60 110 93 96 L91 103 Q60 118 29 103Z" fill="#1E2A6B"/>
      <circle cx="60" cy="108" r="5.6" fill="#F2B705" stroke="#B88A00" stroke-width="1.6"/>
      <path d="M56 107.5h8M60 109.5v3" stroke="#B88A00" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`;
  }
  function dogSVG() {
    return `<svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      <ellipse class="shadow" cx="60" cy="114" rx="32" ry="4.5" fill="rgba(13,20,51,.10)"/>
      <path d="M21 56 L27 15 Q29 9 34 13 L57 32 Z" fill="#D9934E" stroke="#B5722F" stroke-width="2" stroke-linejoin="round"/>
      <path d="M99 56 L93 15 Q91 9 86 13 L63 32 Z" fill="#D9934E" stroke="#B5722F" stroke-width="2" stroke-linejoin="round"/>
      <path d="M28 46 L31 23 L45 35 Z" fill="#FFE9D2"/><path d="M92 46 L89 23 L75 35 Z" fill="#FFE9D2"/>
      <ellipse cx="42" cy="108" rx="11" ry="7" fill="#FFF3E4" stroke="#C9935A" stroke-width="2"/>
      <ellipse cx="78" cy="108" rx="11" ry="7" fill="#FFF3E4" stroke="#C9935A" stroke-width="2"/>
      <path d="M36 108v-3M42 108v-4M48 108v-3M72 108v-3M78 108v-4M84 108v-3" stroke="#C9935A" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="60" cy="64" rx="45" ry="39" fill="#E2A05C" stroke="#B5722F" stroke-width="2"/>
      <path d="M17 72 Q20 98 60 104 Q100 98 103 72 Q92 60 76 69 Q68 63 60 66 Q52 63 44 69 Q28 60 17 72Z" fill="#FFF3E4"/>
      <ellipse cx="44" cy="48" rx="5" ry="3.2" fill="#FFF3E4"/><ellipse cx="76" cy="48" rx="5" ry="3.2" fill="#FFF3E4"/>
      ${FACE}
      <ellipse cx="30" cy="79" rx="7" ry="4.2" fill="#E9945B" opacity=".28"/><ellipse cx="90" cy="79" rx="7" ry="4.2" fill="#E9945B" opacity=".28"/>
      <path d="M54 72.2 Q60 69.4 66 72.2 Q65 77.5 60 78.5 Q55 77.5 54 72.2Z" fill="#2B211C"/>
      <ellipse cx="58" cy="72.4" rx="2.2" ry="1.1" fill="#fff" opacity=".55"/>
      <path d="M60 78.5 V80.5" stroke="#4A3428" stroke-width="2" stroke-linecap="round"/>
      ${MOUTH}
      <path class="tongue" d="M57 83 Q60 91 63 83Z" fill="#E77A62"/>
      <path d="M27 96 Q60 110 93 96 L91 103 Q60 118 29 103Z" fill="#7B5CE6"/>
      <path d="M55 105 h10 l-1.5 8 h-7z" fill="#F2B705" stroke="#B88A00" stroke-width="1.4" stroke-linejoin="round"/>
      <circle cx="60" cy="108.6" r="1.3" fill="#B88A00"/>
    </svg>`;
  }
  function mascot(kind = 'cat', mood = 'happy', size = '') {
    const el = h('div.mascot' + (size ? '.' + size : '') + '.' + kind, { dataset: { mood } });
    el.innerHTML = kind === 'dog' ? dogSVG() : catSVG();
    return el;
  }
  const kindOf = id => (Store.member(id) || {}).animal === 'dog' ? 'dog' : 'cat';
  function avatar(id, size = 'md', opts = {}) {
    const m = Store.member(id);
    const el = h('span.avatar.' + size + (opts.ring ? '.ringed' : ''), { style: { '--c': m.color, '--cs': m.soft }, title: opts.title || '' });
    el.innerHTML = (m.animal === 'dog' ? dogSVG() : catSVG()).replace('viewBox="0 0 120 120"', 'viewBox="12 12 96 96"');
    if (opts.dot) el.appendChild(h('i.dot'));
    return el;
  }
  function brandMark(size = 36) {
    const el = h('span.brand-mark');
    el.style.width = el.style.height = size + 'px';
    el.innerHTML = `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true"><defs><linearGradient id="bmg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4C64FF"/><stop offset="1" stop-color="#2133B8"/></linearGradient></defs><rect width="64" height="64" rx="17" fill="url(#bmg)"/><circle cx="16.5" cy="25" r="5.2" fill="#fff"/><circle cx="26.5" cy="16.5" r="5.2" fill="#fff"/><circle cx="37.5" cy="16.5" r="5.2" fill="#fff"/><circle cx="47.5" cy="25" r="5.2" fill="#C6F36B"/><path d="M22 30.5h20a8 8 0 0 1 8 8v3a8 8 0 0 1-8 8h-9l-6.5 5.5v-5.5H22a8 8 0 0 1-8-8v-3a8 8 0 0 1 8-8Z" fill="#fff"/><path d="M23.5 38.5h17M23.5 43h11" stroke="#2D45D6" stroke-width="2.6" stroke-linecap="round"/></svg>`;
    return el;
  }
  function duo(opts = {}) {
    return h('div.duo' + (opts.size ? '.' + opts.size : ''), mascot('cat', opts.catMood || 'happy'), mascot('dog', opts.dogMood || 'happy'));
  }
  function medal(icon, tone = 'gold') {
    return h('div.medal-x.' + tone, h('div.mx-ring'), h('div.mx-core', Icon.svg(icon)));
  }
  return { mascot, avatar, brandMark, duo, medal, kindOf, catSVG, dogSVG };
})();
