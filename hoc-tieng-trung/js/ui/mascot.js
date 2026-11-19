const Mascot = (() => {
  const INK = '#2A2220';
  const PAL = {
    cat: { fur: '#F2A44B', furD: '#DB8227', cream: '#FFF3E2', inner: '#F8D3AE', nose: '#8A5443', blush: '#F08A3C', whisk: '#A9784C', tongue: '#E8604C' },
    dog: { fur: '#E7A04B', furD: '#C47628', cream: '#FFF5E6', inner: '#F6CCA0', nose: '#2A2220', blush: '#F08A3C', whisk: '#A9784C', tongue: '#E8604C' }
  };
  const P = (x, y) => x + ' ' + y;
  const mir = x => 200 - x;

  function eye(cx, cy, rx, ry, dx = 0, dy = 0) {
    return `<g class="eye"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${INK}"/><circle cx="${cx + 3.4 + dx}" cy="${cy - 3.8 + dy}" r="3.5" fill="#fff"/><circle cx="${cx - 3.2 + dx}" cy="${cy + 3.9 + dy}" r="1.7" fill="#fff" opacity=".85"/></g>`;
  }
  const arc = (cx, cy, w, up) => `<path d="M${cx - w} ${cy + (up ? 4 : -2)} Q${cx} ${cy + (up ? -9 : 9)} ${cx + w} ${cy + (up ? 4 : -2)}" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>`;

  function tail(k, p) {
    if (k === 'cat') {
      const d = 'M138 172 C178 176 192 138 172 114 C164 104 150 110 156 122';
      return `<g class="tail"><path d="${d}" fill="none" stroke="${p.furD}" stroke-width="21" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${p.fur}" stroke-width="16" stroke-linecap="round"/><path d="M168 160 l9 -4 M177 142 l9 -2 M172 124 l8 4" stroke="${p.furD}" stroke-width="3.4" stroke-linecap="round" fill="none"/></g>`;
    }
    const d = 'M138 170 C176 172 190 140 174 122 C164 112 150 118 156 132';
    return `<g class="tail"><path d="${d}" fill="none" stroke="${p.furD}" stroke-width="23" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${p.fur}" stroke-width="18" stroke-linecap="round"/><path d="M160 134 C152 124 156 116 166 118" fill="none" stroke="${p.cream}" stroke-width="12" stroke-linecap="round"/></g>`;
  }

  function body(k, p, collar, tag) {
    let g = `<g class="body"><path d="M58 150 C58 120 78 106 100 106 C122 106 142 120 142 150 C142 176 124 188 100 188 C76 188 58 176 58 150Z" fill="${p.fur}"/>`;
    g += k === 'dog'
      ? `<path d="M76 128 C80 118 90 114 100 114 C110 114 120 118 124 128 C128 150 118 176 100 182 C82 176 72 150 76 128Z" fill="${p.cream}"/>`
      : `<ellipse cx="100" cy="158" rx="24" ry="27" fill="${p.cream}"/><path d="M62 138 l8 4 M138 138 l-8 4 M60 154 l9 2 M140 154 l-9 2" stroke="${p.furD}" stroke-width="3.4" stroke-linecap="round"/>`;
    g += `<ellipse cx="80" cy="182" rx="14" ry="9.5" fill="${p.cream}" stroke="${p.furD}" stroke-opacity=".35" stroke-width="1.6"/><ellipse cx="120" cy="182" rx="14" ry="9.5" fill="${p.cream}" stroke="${p.furD}" stroke-opacity=".35" stroke-width="1.6"/>`;
    g += `<path d="M74 183 v4 M80 184 v4 M86 183 v4 M114 183 v4 M120 184 v4 M126 183 v4" stroke="${p.furD}" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>`;
    g += `<path d="M66 121 Q100 140 134 121 L132 133 Q100 152 68 133Z" fill="${collar}"/><path d="M66 121 Q100 140 134 121" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.6"/>`;
    g += `<g class="tag"><circle cx="100" cy="146" r="7.5" fill="${tag}" stroke="#00000022" stroke-width="1.4"/><path d="M97 145.5h6M100 148.5v3" stroke="#00000033" stroke-width="1.6" stroke-linecap="round"/></g></g>`;
    return g;
  }

  function ears(k, p) {
    const l = k === 'cat'
      ? `<path d="M47 74 C40 54 40 34 49 21 C51 17 56 17 60 20 L90 44Z" fill="${p.fur}"/><path d="M53 62 C51 49 52 40 56 31 L77 46Z" fill="${p.inner}"/>`
      : `<path d="M50 72 C43 52 46 30 56 17 C59 13 64 14 68 18 L92 44Z" fill="${p.fur}"/><path d="M57 62 C55 48 57 37 62 28 L80 46Z" fill="${p.inner}"/>`;
    const r = k === 'cat'
      ? `<path d="M${mir(47)} 74 C${mir(40)} 54 ${mir(40)} 34 ${mir(49)} 21 C${mir(51)} 17 ${mir(56)} 17 ${mir(60)} 20 L${mir(90)} 44Z" fill="${p.fur}"/><path d="M${mir(53)} 62 C${mir(51)} 49 ${mir(52)} 40 ${mir(56)} 31 L${mir(77)} 46Z" fill="${p.inner}"/>`
      : `<path d="M${mir(50)} 72 C${mir(43)} 52 ${mir(46)} 30 ${mir(56)} 17 C${mir(59)} 13 ${mir(64)} 14 ${mir(68)} 18 L${mir(92)} 44Z" fill="${p.fur}"/><path d="M${mir(57)} 62 C${mir(55)} 48 ${mir(57)} 37 ${mir(62)} 28 L${mir(80)} 46Z" fill="${p.inner}"/>`;
    return `<g class="ear-l" style="transform-origin:72px 50px">${l}</g><g class="ear-r" style="transform-origin:128px 50px">${r}</g>`;
  }

  function face(k, p) {
    let g = `<path d="M43 88 C43 56 68 38 100 38 C132 38 157 56 157 88 C157 117 132 135 100 135 C68 135 43 117 43 88Z" fill="${p.fur}"/>`;
    if (k === 'cat') {
      g += `<path d="M45 97 L32 101 L46 110Z" fill="${p.fur}"/><path d="M155 97 L168 101 L154 110Z" fill="${p.fur}"/>`;
      g += `<path d="M100 40 v13 M88 42 q1 8 -2 14 M112 42 q-1 8 2 14" stroke="${p.furD}" stroke-width="3.8" stroke-linecap="round" fill="none"/>`;
      g += `<ellipse cx="100" cy="108" rx="25" ry="17.5" fill="${p.cream}"/>`;
    } else {
      g += `<path d="M47 94 C52 124 76 135 100 135 C124 135 148 124 153 94 C144 108 128 112 114 106 L100 113 L86 106 C72 112 56 108 47 94Z" fill="${p.cream}"/>`;
      g += `<ellipse cx="74" cy="70" rx="5" ry="3.6" fill="${p.cream}"/><ellipse cx="126" cy="70" rx="5" ry="3.6" fill="${p.cream}"/>`;
      g += `<ellipse cx="100" cy="108" rx="25" ry="17" fill="${p.cream}"/>`;
    }
    g += `<ellipse cx="84" cy="52" rx="27" ry="8.5" fill="#fff" opacity=".2" transform="rotate(-14 84 52)"/>`;
    g += `<ellipse cx="57" cy="107" rx="10" ry="5.8" fill="${p.blush}" opacity=".32"/><ellipse cx="143" cy="107" rx="10" ry="5.8" fill="${p.blush}" opacity=".32"/>`;
    g += `<path d="M52 99 L28 94 M52 105 L28 107 M148 99 L172 94 M148 105 L172 107" stroke="${p.whisk}" stroke-opacity=".55" stroke-width="1.8" stroke-linecap="round" fill="none"/>`;
    return g;
  }

  function nose(k, p) {
    return k === 'cat'
      ? `<path d="M94.5 98 Q100 94.2 105.5 98 Q103 104.5 100 105.5 Q97 104.5 94.5 98Z" fill="${p.nose}"/><ellipse cx="98" cy="97.8" rx="1.8" ry="1" fill="#fff" opacity=".45"/>`
      : `<path d="M92.5 98 Q100 93 107.5 98 Q105 106 100 107 Q95 106 92.5 98Z" fill="${p.nose}"/><ellipse cx="97.5" cy="97.8" rx="2.6" ry="1.3" fill="#fff" opacity=".5"/>`;
  }
  const smile = (p, k) => `<path d="M100 105.5 V109 M100 109 Q94 116 87 110.5 M100 109 Q106 116 113 110.5" fill="none" stroke="#5A3A2E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>${k === 'dog' ? `<path d="M93 113.5 Q100 130 107 113.5 Q100 119 93 113.5Z" fill="${p.tongue}"/>` : ''}`;
  const openMouth = (p, w = 11) => `<path d="M${100 - w} 108 Q100 ${108 + w * 1.7} ${100 + w} 108 Q100 112 ${100 - w} 108Z" fill="#5A3A2E"/><path d="M${100 - w + 3.5} ${108 + w * .9} Q100 ${108 + w * 1.7} ${100 + w - 3.5} ${108 + w * .9} Q100 ${113 + w * .4} ${100 - w + 3.5} ${108 + w * .9}Z" fill="${p.tongue}"/>`;
  const brow = (cx, flip, tilt, p) => `<path d="M${cx - 9} ${70 + tilt * flip} Q${cx} ${66 - Math.abs(tilt) * .4} ${cx + 9} ${70 - tilt * flip}" fill="none" stroke="${p.furD}" stroke-width="3.2" stroke-linecap="round"/>`;

  function moods(k, p) {
    const L = 74, R = 126, Y = 88;
    const m = {};
    m.happy = eye(L, Y, 9, 10.5) + eye(R, Y, 9, 10.5) + smile(p, k);
    m.wow = brow(L, 1, -3, p) + brow(R, -1, -3, p) + eye(L, Y, 10.5, 12.5) + eye(R, Y, 10.5, 12.5) + `<ellipse cx="100" cy="113" rx="6.5" ry="8" fill="#5A3A2E"/><ellipse cx="100" cy="116.5" rx="4" ry="3.4" fill="${p.tongue}"/>`;
    m.sad = brow(L, 1, 4, p) + brow(R, -1, 4, p) + eye(L, Y + 1, 9, 10.5) + eye(R, Y + 1, 9, 10.5) + `<path d="M91 115 Q100 106.5 109 115" fill="none" stroke="#5A3A2E" stroke-width="2.8" stroke-linecap="round"/><path d="M66 98 q-3 6 0 9 q3 -3 0 -9Z" fill="#8EC5F4"/>`;
    m.think = `<path d="M${R - 9} 69 Q${R} 62 ${R + 9} 69" fill="none" stroke="${p.furD}" stroke-width="3.2" stroke-linecap="round"/>` + eye(L, Y, 9, 10.5, 2.4, -2.2) + eye(R, Y, 9, 10.5, 2.4, -2.2) + `<path d="M93 112 Q100 109 108 112.5" fill="none" stroke="#5A3A2E" stroke-width="2.6" stroke-linecap="round"/><circle cx="160" cy="44" r="2.6" fill="#B6C1FA"/><circle cx="170" cy="32" r="3.8" fill="#B6C1FA"/><circle cx="181" cy="16" r="5.4" fill="#B6C1FA"/>`;
    m.cheer = arc(L, Y, 9.5, true) + arc(R, Y, 9.5, true) + openMouth(p, 12) + `<path d="M34 56 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3Z M166 46 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4Z" fill="#F2B705"/>`;
    m.sleep = `<path d="M65 90 Q74 98 83 90 M117 90 Q126 98 135 90" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/><path d="M95 110 Q100 114 105 110" fill="none" stroke="#5A3A2E" stroke-width="2.4" stroke-linecap="round"/><text x="150" y="40" font-family="Inter,Arial,sans-serif" font-size="20" font-weight="800" fill="#B6C1FA">z</text><text x="166" y="24" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="800" fill="#B6C1FA">z</text>`;
    return Object.entries(m).map(([k2, v]) => `<g class="m-${k2}">${v}</g>`).join('');
  }

  function paws(p) {
    return `<g class="paws-up"><ellipse cx="50" cy="132" rx="11" ry="14" transform="rotate(-24 50 132)" fill="${p.fur}"/><ellipse cx="150" cy="132" rx="11" ry="14" transform="rotate(24 150 132)" fill="${p.fur}"/><ellipse cx="46" cy="124" rx="7" ry="8.5" transform="rotate(-24 46 124)" fill="${p.cream}"/><ellipse cx="154" cy="124" rx="7" ry="8.5" transform="rotate(24 154 124)" fill="${p.cream}"/></g>`;
  }

  function svg(kind, o = {}) {
    const k = kind === 'dog' ? 'dog' : 'cat';
    const p = Object.assign({}, PAL[k], o.palette || {});
    const collar = o.collar || (k === 'cat' ? '#3048E0' : '#7B5CE6');
    const tag = o.tag || '#F2B705';
    return `<svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" focusable="false"><ellipse class="shadow" cx="100" cy="190" rx="58" ry="7" fill="#0D1433" opacity=".12"/>${tail(k, p)}${body(k, p, collar, tag)}<ellipse cx="100" cy="135" rx="40" ry="8" fill="#5A3A1E" opacity=".1"/>${paws(p)}<g class="head" style="transform-origin:100px 132px">${ears(k, p)}${face(k, p)}${nose(k, p)}${moods(k, p)}</g></svg>`;
  }
  const headBox = '28 10 144 134';
  return { svg, headBox, PAL };
})();
