const Scene = (() => {
  const C = {
    wall: '#E8EDF5', wall2: '#DCE3EE', floor: '#CDD5E2', floor2: '#BFC8D8', wood: '#B98A5E', wood2: '#9A6F48', woodL: '#D9B48C',
    metal: '#8D97AD', metal2: '#6B7590', dark: '#2A3150', screen: '#25304F', glass: '#BFD7F2', sky: '#CFE3F7', sky2: '#EAF3FC',
    leaf: '#3F9D6A', leaf2: '#2D7D52', pot: '#C46A3C', box: '#C9A06A', box2: '#A9814F', water: '#6FA7D6', water2: '#5A90C0',
    white: '#F7F9FC', paper: '#FFFFFF', red: '#D9534F', yellow: '#F2C14E'
  };
  const SKIN = ['#F1C7A0', '#D9A47C', '#A8714C', '#F5D3B5'];
  const HAIR = ['#2B2522', '#5B3A26', '#1C1C22', '#8A5A3A', '#3A2B22'];
  const rad = d => d * Math.PI / 180;
  const f1 = n => Math.round(n * 10) / 10;
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.max(0, ((n >> 16) & 255) * k)), g = Math.min(255, Math.max(0, ((n >> 8) & 255) * k)), b = Math.min(255, Math.max(0, (n & 255) * k));
    return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  }
  const line = (a, b, col, w) => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
  const rect = (x, y, w, h, col, r = 0, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${r}" fill="${col}" ${extra}/>`;
  const circ = (x, y, r, col) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${col}"/>`;
  const ell = (x, y, rx, ry, col, op = 1) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${col}" opacity="${op}"/>`;

  function person(o) {
    const s = o.s || 1, f = o.f || 1;
    const T = 56 * s, UA = 30 * s, FA = 28 * s, TH = 40 * s, SH = 40 * s, HR = 15 * s;
    const lean = o.lean || 0;
    const dir = a => [Math.sin(rad(a)) * f, Math.cos(rad(a))];
    const add = (p, a, l) => { const d = dir(a); return [p[0] + d[0] * l, p[1] + d[1] * l]; };
    const hip = [o.x, o.y];
    const sh = [hip[0] + Math.sin(rad(lean)) * f * T, hip[1] - Math.cos(rad(lean)) * T];
    const head = [sh[0] + Math.sin(rad(lean)) * f * (HR + 9 * s), sh[1] - Math.cos(rad(lean)) * (HR + 9 * s)];
    const arms = (o.arms || [[5, 5], [-5, -5]]).map(([ua, fa]) => { const e = add(sh, ua, UA); return [e, add(e, fa, FA)]; });
    const legs = (o.legs || [[2, 2], [-2, -2]]).map(([th, sn]) => { const k = add(hip, th, TH); return [k, add(k, sn, SH)]; });
    const shirt = o.shirt || '#4C64FF', pants = o.pants || '#2A3358', skin = o.skin || SKIN[0], hair = o.hair || HAIR[0];
    let g = '';
    if (!o.noShadow) g += ell(o.shadowX != null ? o.shadowX : (legs[0][1][0] + legs[1][1][0]) / 2, Math.max(legs[0][1][1], legs[1][1][1]) + 4 * s, 34 * s, 6 * s, '#0D1433', .12);
    const leg = (L, col) => line(hip, L[0], col, 15 * s) + line(L[0], L[1], col, 14 * s) + ell(L[1][0] + 6 * s * f, L[1][1] + 1, 10 * s, 5 * s, o.shoe || '#22263A');
    const arm = (A, col) => line(sh, A[0], col, 11.5 * s) + line(A[0], A[1], o.sleeve === 'short' ? skin : col, 10 * s) + circ(A[1][0], A[1][1], 5.2 * s, skin);
    g += leg(legs[0], shade(pants, .82));
    if (o.hairStyle === 'long') g += line([head[0] - 4 * s * f, head[1]], [head[0] - 9 * s * f, head[1] + 26 * s], hair, 17 * s);
    g += arm(arms[0], shade(shirt, .8));
    if (o.skirt) g += `<path d="M${f1(hip[0] - 15 * s)} ${f1(hip[1] - 6 * s)} L${f1(hip[0] + 15 * s)} ${f1(hip[1] - 6 * s)} L${f1(hip[0] + 19 * s)} ${f1(hip[1] + 22 * s)} L${f1(hip[0] - 19 * s)} ${f1(hip[1] + 22 * s)} Z" fill="${pants}"/>`;
    g += line(hip, sh, shirt, 30 * s);
    if (o.apron) g += line([hip[0] + 4 * s * f, hip[1] + 10 * s], [sh[0] + 4 * s * f, sh[1] + 12 * s], '#F7F9FC', 20 * s);
    g += leg(legs[1], pants);
    g += line(sh, [sh[0] + Math.sin(rad(lean)) * f * 8 * s, sh[1] - 8 * s], skin, 9 * s);
    g += circ(head[0], head[1], HR, skin);
    const hx = head[0], hy = head[1];
    if (o.hairStyle === 'bun') g += circ(hx - 8 * s * f, hy - 13 * s, 7 * s, hair);
    if (o.hat === 'chef') g += rect(hx - 13 * s, hy - 33 * s, 26 * s, 18 * s, '#FFFFFF', 7 * s) + rect(hx - 15 * s, hy - 19 * s, 30 * s, 6 * s, '#FFFFFF', 3 * s);
    else if (o.hat === 'hard') g += `<path d="M${f1(hx - 17 * s)} ${f1(hy - 3 * s)} Q${f1(hx)} ${f1(hy - 28 * s)} ${f1(hx + 17 * s)} ${f1(hy - 3 * s)} Z" fill="${C.yellow}"/>` + rect(hx - 19 * s, hy - 5 * s, 38 * s, 4 * s, '#E0A92E', 2);
    else g += `<path d="M${f1(hx - HR - .5)} ${f1(hy + 1)} Q${f1(hx - HR)} ${f1(hy - HR - 4 * s)} ${f1(hx)} ${f1(hy - HR - 1.5 * s)} Q${f1(hx + HR)} ${f1(hy - HR - 4 * s)} ${f1(hx + HR + .5)} ${f1(hy + 1)} Q${f1(hx + (HR - 4 * s) * f)} ${f1(hy - 8 * s)} ${f1(hx - 2 * s * f)} ${f1(hy - 7 * s)} Q${f1(hx - (HR - 3 * s) * f)} ${f1(hy - 6 * s)} ${f1(hx - HR - .5)} ${f1(hy + 1)}Z" fill="${hair}"/>`;
    if (o.glasses) g += `<path d="M${f1(hx + 3 * s * f)} ${f1(hy - 1)} h${f1(9 * s * f)}" stroke="#2A3150" stroke-width="${2.2 * s}"/>`;
    g += arm(arms[1], shirt);
    if (o.tie) g += line([sh[0] + 2 * s * f, sh[1] + 4 * s], [sh[0] + 2 * s * f + Math.sin(rad(lean)) * 0, sh[1] + 24 * s], o.tie, 4 * s);
    return { svg: g, hand: arms[1][1], hand2: arms[0][1], head, sh, hip, feet: [legs[0][1], legs[1][1]] };
  }
  function windowBox(x, y, w, h, opt = {}) {
    let g = rect(x - 6, y - 6, w + 12, h + 12, '#FFFFFF', 4) + rect(x, y, w, h, opt.sky || C.sky, 2);
    if (opt.city) g += `<path d="M${x} ${y + h} V${y + h * .6} h${w * .18} v${-h * .18} h${w * .14} v${h * .1} h${w * .2} v${-h * .28} h${w * .16} v${h * .22} h${w * .32} V${y + h} Z" fill="#A9C3E2"/>`;
    if (opt.tree) g += circ(x + w * .75, y + h * .65, h * .28, '#8FCB9F') + circ(x + w * .6, y + h * .75, h * .22, '#7DBE90');
    g += line([x + w / 2, y], [x + w / 2, y + h], '#FFFFFF', 5) + line([x, y + h / 2], [x + w, y + h / 2], '#FFFFFF', 5);
    return g;
  }
  function room(o = {}) {
    let g = rect(0, 0, 600, o.floorY || 300, o.wall || C.wall) + rect(0, o.floorY || 300, 600, 400 - (o.floorY || 300), o.floor || C.floor);
    g += rect(0, (o.floorY || 300) - 6, 600, 6, shade(o.wall || C.wall, .9));
    return g;
  }
  function desk(x, y, w) { return rect(x, y, w, 10, C.wood, 3) + rect(x + 8, y + 10, 8, 90, C.wood2, 2) + rect(x + w - 16, y + 10, 8, 90, C.wood2, 2) + rect(x + w - 90, y + 14, 70, 44, shade(C.wood, .92), 3) + rect(x + w - 62, y + 32, 14, 4, C.woodL, 2); }
  function officeChair(x, y, f = 1) { return line([x, y + 10], [x, y + 48], C.metal2, 6) + line([x - 22, y + 56], [x + 22, y + 56], C.metal2, 5) + rect(x - 24, y - 2, 48, 13, '#3C4566', 6) + line([x - 18 * f, y], [x - 26 * f, y - 58], '#3C4566', 13); }
  function chair(x, y, col = '#4C64FF', f = 1) { return rect(x - 18, y, 36, 8, col, 3) + line([x - 14, y + 8], [x - 14, y + 44], C.metal2, 4) + line([x + 14, y + 8], [x + 14, y + 44], C.metal2, 4) + line([x - 16 * f, y], [x - 18 * f, y - 40], col, 7); }
  function laptop(x, y, f = 1) { return `<path d="M${x - 26} ${y} h52 l6 4 h-64 z" fill="#9AA3BA"/>` + `<path d="M${x - 22 * f} ${y} L${x - 30 * f} ${y - 36} L${x + 14 * f} ${y - 36} L${x + 20 * f} ${y} Z" fill="#3C4566"/>` + `<path d="M${x - 19 * f} ${y - 3} L${x - 26 * f} ${y - 33} L${x + 11 * f} ${y - 33} L${x + 17 * f} ${y - 3} Z" fill="#8FB3E8"/>`; }
  function monitor(x, y) { return rect(x - 40, y - 62, 80, 50, C.screen, 4) + rect(x - 36, y - 58, 72, 42, '#7FA6E0', 2) + rect(x - 5, y - 12, 10, 12, C.metal2) + rect(x - 18, y - 2, 36, 4, C.metal2, 2); }
  function plant(x, y, s = 1) { return `<path d="M${x - 18 * s} ${y - 34 * s} h${36 * s} l${-5 * s} ${34 * s} h${-26 * s} z" fill="${C.pot}"/>` + ell(x - 14 * s, y - 52 * s, 12 * s, 22 * s, C.leaf) + ell(x + 12 * s, y - 56 * s, 12 * s, 24 * s, C.leaf2) + ell(x, y - 66 * s, 11 * s, 26 * s, C.leaf); }
  function cup(x, y, col = '#FFFFFF') { return rect(x - 7, y - 16, 14, 16, col, 3) + `<path d="M${x + 7} ${y - 13} q8 1 0 9" stroke="${col}" stroke-width="3" fill="none"/>`; }
  function box(x, y, w, h, col = C.box) { return rect(x, y - h, w, h, col, 2) + rect(x, y - h, w, h * .18, shade(col, .88), 2) + line([x + w / 2, y - h], [x + w / 2, y - h * .65], '#E9D7B8', 3); }
  function shelf(x, y, w, h, rows, fill) {
    let g = rect(x, y, w, h, '#8C9BB5', 3) + rect(x + 6, y + 6, w - 12, h - 12, '#C9D1E0', 2);
    const rh = (h - 12) / rows;
    for (let i = 1; i < rows; i++) g += rect(x + 6, y + 6 + rh * i - 3, w - 12, 6, '#8C9BB5');
    for (let i = 0; i < rows; i++) g += fill(x + 8, y + 6 + rh * (i + 1) - 3, w - 16, rh - 8, i);
    return g;
  }
  const books = (x, y, w, hh, i) => { let g = '', cx = x + 4; const cols = ['#4C64FF', '#F08A24', '#16A34A', '#7B5CE6', '#D9534F', '#0F9AA3', '#F2C14E']; let k = i * 3; while (cx < x + w - 10) { const bw = 7 + (k * 5) % 6, bh = hh * (.65 + ((k * 7) % 4) * .08); g += rect(cx, y - bh, bw, bh, cols[k % cols.length], 1.5); cx += bw + 2; k++; } return g; };
  const boxesFill = (x, y, w, hh, i) => { let g = '', cx = x + 4; while (cx < x + w - 34) { g += box(cx, y, 32, Math.min(30, hh * .8), i % 2 ? C.box : C.box2); cx += 36; } return g; };
  const productsFill = (x, y, w, hh, i) => { let g = ''; const cols = [['#F08A24', '#F2C14E'], ['#16A34A', '#9BD38A'], ['#D9534F', '#F2A3A0']][i % 3]; for (let cx = x + 10; cx < x + w - 8; cx += 18) g += circ(cx, y - 9, 8, cols[(cx / 18 | 0) % 2]) + circ(cx + 9, y - 20, 8, cols[((cx / 18 | 0) + 1) % 2]); return g; };
  function whiteboard(x, y, w, h, chart) {
    let g = rect(x - 4, y - 4, w + 8, h + 8, '#9AA3BA', 4) + rect(x, y, w, h, '#FFFFFF', 2);
    if (chart) { const bars = [.4, .55, .7, .9]; bars.forEach((b, i) => g += rect(x + 18 + i * (w - 36) / 4, y + h - 14 - (h - 34) * b, (w - 36) / 4 - 10, (h - 34) * b, ['#4C64FF', '#0F9AA3', '#F08A24', '#16A34A'][i], 2)); g += line([x + 12, y + h - 12], [x + w - 12, y + h - 12], '#2A3150', 2); }
    return g;
  }
  function ladder(x, y, h) { let g = line([x, y], [x + 18, y - h], C.metal, 6) + line([x + 46, y], [x + 64, y - h], C.metal, 6); for (let i = 1; i < 7; i++) { const t = i / 7; g += line([x + 18 * t, y - h * t], [x + 46 + 18 * t, y - h * t], C.metal2, 4); } return g; }
  function bike(x, y, col = '#4C64FF') { return `<g fill="none" stroke-linecap="round">` + `<circle cx="${x}" cy="${y}" r="22" stroke="#2A3150" stroke-width="4"/><circle cx="${x + 64}" cy="${y}" r="22" stroke="#2A3150" stroke-width="4"/>` + `<path d="M${x} ${y} L${x + 24} ${y - 30} L${x + 52} ${y - 30} L${x + 64} ${y} M${x + 24} ${y - 30} L${x + 30} ${y} L${x + 52} ${y - 30} M${x + 20} ${y - 38} h12 M${x + 50} ${y - 30} l4 -12 h10" stroke="${col}" stroke-width="5" stroke-linejoin="round"/></g>`; }
  function tree(x, y, s = 1) { return rect(x - 6 * s, y - 60 * s, 12 * s, 60 * s, '#8A6040', 3) + circ(x, y - 86 * s, 36 * s, '#5DAE7A') + circ(x - 26 * s, y - 70 * s, 24 * s, '#4C9D69') + circ(x + 26 * s, y - 72 * s, 26 * s, '#6BBB86'); }
  function suitcase(x, y, col = '#7B5CE6') { return rect(x, y - 54, 38, 54, col, 7) + line([x + 19, y - 54], [x + 19, y - 86], '#6B7590', 4) + line([x + 10, y - 86], [x + 28, y - 86], '#6B7590', 5) + circ(x + 7, y + 2, 4, '#22263A') + circ(x + 31, y + 2, 4, '#22263A') + line([x + 8, y - 44], [x + 8, y - 10], shade(col, .85), 3) + line([x + 30, y - 44], [x + 30, y - 10], shade(col, .85), 3); }
  function counter(x, y, w, h, col = '#5A6688') { return rect(x, y, w, h, col, 4) + rect(x - 4, y - 8, w + 8, 10, '#3C4566', 3); }
  const wrap = (body, title) => `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title || 'Photograph'}"><defs><linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sky}"/><stop offset="1" stop-color="${C.sky2}"/></linearGradient></defs>${body}</svg>`;

  const S = {};
  S.typing = () => {
    let g = room() + windowBox(70, 50, 150, 120, { city: true }) + plant(520, 300, 1.1);
    g += desk(220, 262, 260) + monitor(430, 262) + laptop(318, 262, -1) + cup(260, 262, '#F08A24') + rect(370, 252, 30, 10, '#FFFFFF', 1) + rect(372, 247, 30, 6, '#F7F9FC', 1);
    g += officeChair(390, 300, -1);
    const p = person({ x: 392, y: 300, f: -1, lean: -6, shirt: '#0F9AA3', pants: '#2A3358', skin: SKIN[0], hair: HAIR[1], hairStyle: 'long', arms: [[60, 95], [52, 98]], legs: [[88, 2], [92, 0]], noShadow: true });
    return g + p.svg;
  };
  S.meeting = () => {
    let g = room({ wall: '#E3E9F3' }) + whiteboard(320, 70, 200, 130, true) + rect(40, 70, 120, 90, '#C9D6EA', 4);
    g += rect(60, 270, 280, 14, C.wood, 4) + rect(80, 284, 10, 76, C.wood2) + rect(310, 284, 10, 76, C.wood2);
    g += chair(110, 300, '#3C4566') + chair(230, 300, '#3C4566', -1);
    const a = person({ x: 100, y: 300, f: 1, shirt: '#4C64FF', pants: '#2A3358', skin: SKIN[1], hair: HAIR[0], arms: [[40, 85], [36, 90]], legs: [[90, 0], [86, 2]], noShadow: true });
    const b = person({ x: 240, y: 300, f: -1, shirt: '#F08A24', pants: '#3A3F55', skin: SKIN[0], hair: HAIR[3], hairStyle: 'bun', skirt: true, arms: [[38, 88], [34, 92]], legs: [[90, 0], [88, 2]], noShadow: true });
    const c = person({ x: 455, y: 286, f: -1, lean: 4, shirt: '#F7F9FC', pants: '#2A3358', skin: SKIN[2], hair: HAIR[2], tie: '#4C64FF', arms: [[10, 5], [140, 130]], legs: [[6, 2], [-6, -2]] });
    g += rect(110, 262, 40, 6, '#FFFFFF', 1) + rect(190, 262, 40, 6, '#FFFFFF', 1) + cup(175, 270, '#4C64FF');
    return g + a.svg + b.svg + c.svg;
  };
  S.warehouse = () => {
    let g = room({ wall: '#E2E6EC', floor: '#C4CAD4' }) + shelf(30, 60, 220, 240, 3, boxesFill) + shelf(400, 60, 180, 240, 3, boxesFill);
    g += box(300, 360, 60, 46, C.box2) + box(306, 314, 50, 40, C.box) + box(250, 370, 44, 36, C.box);
    const p = person({ x: 200, y: 290, f: 1, shirt: '#16A34A', pants: '#3A4158', skin: SKIN[1], hair: HAIR[0], hat: 'hard', arms: [[50, 120], [45, 115]], legs: [[12, 4], [-14, -4]] });
    g += p.svg + box(p.hand[0] - 10, p.hand[1] + 8, 54, 40, C.box);
    g += line([520, 380], [520, 300], C.metal2, 6) + line([520, 380], [560, 380], C.metal2, 6) + circ(528, 384, 8, '#22263A');
    return g;
  };
  S.ladder = () => {
    let g = room({ wall: '#EEF1F6' }) + rect(260, 0, 80, 14, '#C9D1E0') + circ(300, 22, 12, '#FFF3C4') + rect(286, 10, 28, 10, '#9AA3BA', 3);
    g += ladder(250, 380, 230) + rect(150, 340, 34, 40, '#7B5CE6', 4) + rect(150, 336, 34, 8, '#5136B8', 3) + rect(450, 220, 90, 80, '#D3DCEA', 4);
    const p = person({ x: 300, y: 205, f: 1, lean: -4, shirt: '#F08A24', pants: '#2A3358', skin: SKIN[0], hair: HAIR[1], arms: [[160, 175], [-20, 10]], legs: [[20, 5], [-10, 0]] });
    return g + p.svg;
  };
  S.emptyRows = () => {
    let g = room({ wall: '#E6EBF4', floor: '#C8D0DE' }) + rect(250, 70, 100, 70, '#FFFFFF', 4) + rect(256, 76, 88, 58, '#9DB7E3', 2) + `<path d="M270 300 h60 l-8 -90 h-44 z" fill="#5A6688"/>` + rect(280, 200, 40, 10, '#3C4566', 3);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) g += chair(70 + i * 92, 320 + r * 36, r ? '#4C64FF' : '#3B54D8', 1);
    return g;
  };
  S.bikes = () => {
    let g = rect(0, 0, 600, 240, 'url(#skyg)') + `<path d="M0 240 V150 h60 v-40 h50 v60 h40 v-80 h70 v100 h50 v-50 h60 v70 h80 v-30 h90 v70 h100 V240 Z" fill="#B9C9DE"/>` + rect(0, 240, 600, 60, C.water) + rect(0, 300, 600, 100, '#D4D9E2');
    g += line([0, 300], [600, 300], '#8C97AD', 6) + line([0, 272], [600, 272], '#8C97AD', 4);
    for (let i = 0; i < 12; i++) g += line([i * 52 + 10, 272], [i * 52 + 10, 300], '#8C97AD', 3);
    ['#4C64FF', '#F08A24', '#16A34A', '#7B5CE6'].forEach((c, i) => g += bike(80 + i * 120, 352, c));
    return g + tree(560, 300, .8);
  };
  S.dock = () => {
    let g = rect(0, 0, 600, 200, 'url(#skyg)') + `<path d="M0 200 V130 h80 v-30 h40 v50 h60 v-70 h50 v70 h70 v-40 h60 v40 h90 v-20 h150 V200 Z" fill="#B3C4DB"/>` + rect(0, 200, 600, 200, C.water) + `<path d="M0 250 q30 -6 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" stroke="#8DBBE3" stroke-width="3" fill="none"/>`;
    g += rect(360, 230, 240, 26, C.wood, 3);
    for (let i = 0; i < 5; i++) g += rect(372 + i * 52, 256, 10, 120, C.wood2);
    g += `<path d="M90 300 h230 l-30 46 h-170 z" fill="#F7F9FC"/>` + rect(150, 262, 110, 38, '#4C64FF', 6) + rect(160, 270, 26, 18, '#BFD7F2', 3) + rect(196, 270, 26, 18, '#BFD7F2', 3) + rect(232, 270, 18, 18, '#BFD7F2', 3) + rect(90, 316, 230, 8, '#D9534F');
    g += line([320, 304], [392, 256], '#6B4A35', 3) + rect(388, 244, 10, 14, '#6B4A35', 2);
    return g;
  };
  S.produce = () => {
    let g = room({ wall: '#F1EEE6', floor: '#D7D2C6' }) + rect(0, 40, 600, 30, '#16A34A') + rect(0, 70, 600, 8, '#0E7A36');
    g += `<path d="M300 300 l40 -90 h240 v90 z" fill="#B98A5E"/>` + rect(340, 214, 240, 8, '#9A6F48');
    for (let i = 0; i < 9; i++) g += circ(360 + i * 26, 226, 11, i % 2 ? '#F08A24' : '#D9534F') + circ(372 + i * 26, 244, 11, i % 2 ? '#F2C14E' : '#16A34A');
    const p = person({ x: 240, y: 288, f: 1, lean: 8, shirt: '#7B5CE6', pants: '#2A3358', skin: SKIN[3], hair: HAIR[0], hairStyle: 'long', arms: [[20, 30], [70, 80]], legs: [[8, 3], [-8, -3]] });
    g += p.svg + `<path d="M${p.hand2[0] - 22} ${p.hand2[1] + 4} h44 l-6 30 h-32 z" fill="#C46A3C"/>` + `<path d="M${p.hand2[0] - 18} ${p.hand2[1] + 4} q18 -26 36 0" stroke="#9A4F29" stroke-width="4" fill="none"/>` + circ(p.hand[0] + 6, p.hand[1] - 4, 9, '#D9534F');
    return g;
  };
  S.cashier = () => {
    let g = room({ wall: '#E9EEF6' }) + shelf(30, 50, 170, 200, 3, productsFill);
    const cashier = person({ x: 470, y: 262, f: -1, shirt: '#0F9AA3', pants: '#2A3358', skin: SKIN[1], hair: HAIR[0], hairStyle: 'bun', apron: true, arms: [[70, 90], [10, 0]], legs: [[0, 0], [0, 0]], noShadow: true });
    const cust = person({ x: 210, y: 290, f: 1, shirt: '#F08A24', pants: '#3A4158', skin: SKIN[0], hair: HAIR[3], arms: [[10, 5], [75, 85]], legs: [[10, 3], [-10, -3]] });
    g += cashier.svg + counter(260, 240, 300, 120) + rect(410, 196, 70, 44, '#3C4566', 4) + rect(418, 202, 54, 22, '#7FA6E0', 2) + `<path d="M310 232 h56 v-18 h-56 z" fill="#C46A3C"/>` + cust.svg + rect(cust.hand[0] + 4, cust.hand[1] - 8, 22, 14, '#4C64FF', 2);
    return g;
  };
  S.library = () => {
    let g = room({ wall: '#EDE8DE', floor: '#CFC6B5' }) + shelf(240, 20, 330, 330, 4, books) + rect(40, 300, 140, 12, C.wood, 3) + rect(50, 312, 8, 70, C.wood2) + rect(162, 312, 8, 70, C.wood2) + plant(110, 300, .8);
    const p = person({ x: 300, y: 290, f: 1, lean: 2, shirt: '#16A34A', pants: '#2A3358', skin: SKIN[0], hair: HAIR[4], hairStyle: 'long', arms: [[165, 170], [20, 10]], legs: [[6, 2], [-6, -2]] });
    g += p.svg + rect(p.hand2[0] - 3, p.hand2[1] - 4, 18, 26, '#4C64FF', 2);
    return g;
  };
  S.watering = () => {
    let g = rect(0, 0, 600, 260, '#F3E7D6') + rect(0, 260, 600, 140, '#D9CBB4') + rect(40, 60, 120, 140, '#FFFFFF', 4) + rect(48, 68, 104, 124, '#A9C9E8', 2);
    g += plant(330, 330, 1) + plant(420, 340, 1.2) + plant(520, 330, .9);
    const p = person({ x: 210, y: 280, f: 1, lean: 14, shirt: '#4C64FF', pants: '#6B5B45', skin: SKIN[2], hair: HAIR[0], sleeve: 'short', arms: [[20, 40], [65, 70]], legs: [[10, 4], [-14, -6]] });
    const hx = p.hand[0], hy = p.hand[1];
    g += p.svg + rect(hx - 6, hy - 6, 40, 28, '#16A34A', 6) + line([hx + 32, hy + 2], [hx + 66, hy - 10], '#16A34A', 6) + `<path d="M${hx + 70} ${hy - 6} q10 16 4 40 M${hx + 76} ${hy - 4} q12 16 8 38 M${hx + 82} ${hy - 2} q12 14 12 34" stroke="#7CB7E8" stroke-width="2" fill="none" stroke-dasharray="3 5"/>`;
    return g;
  };
  S.handshake = () => {
    let g = room({ wall: '#E5EAF3', floor: '#C9D1DF' }) + rect(40, 40, 520, 30, '#3C4566', 4) + rect(240, 48, 120, 14, '#C6F36B', 3) + plant(80, 300, 1) + plant(530, 300, 1);
    const a = person({ x: 240, y: 288, f: 1, shirt: '#2A3358', pants: '#2A3358', skin: SKIN[0], hair: HAIR[1], tie: '#D9534F', arms: [[10, 5], [62, 80]], legs: [[8, 2], [-8, -2]] });
    const b = person({ x: 370, y: 288, f: -1, shirt: '#7B5CE6', pants: '#2A3358', skin: SKIN[2], hair: HAIR[2], hairStyle: 'bun', arms: [[8, 4], [62, 80]], legs: [[8, 2], [-8, -2]] });
    return g + a.svg + b.svg + circ((a.hand[0] + b.hand[0]) / 2, (a.hand[1] + b.hand[1]) / 2, 7, SKIN[1]);
  };
  S.phoneWindow = () => {
    let g = room({ wall: '#E8EDF5' }) + windowBox(250, 40, 280, 210, { city: true, tree: true }) + rect(40, 260, 140, 40, '#5A6688', 8) + rect(30, 220, 160, 44, '#6C7899', 10) + plant(560, 300, .9);
    const p = person({ x: 210, y: 288, f: 1, shirt: '#F7F9FC', pants: '#3A4158', skin: SKIN[1], hair: HAIR[0], tie: '#0F9AA3', arms: [[40, 10], [125, -112]], legs: [[8, 2], [-8, -2]] });
    g += p.svg + rect(p.hand[0] - 2, p.hand[1] - 12, 7, 16, '#22263A', 2) + cup(p.hand2[0] + 6, p.hand2[1] + 10, '#F08A24');
    return g;
  };
  S.suitcase = () => {
    let g = room({ wall: '#E3E9F3', floor: '#D0D7E4' }) + rect(330, 40, 240, 110, '#22263A', 6);
    for (let i = 0; i < 4; i++) g += rect(342, 56 + i * 22, 140, 12, '#F2C14E', 2) + rect(492, 56 + i * 22, 64, 12, i === 2 ? '#D9534F' : '#16A34A', 2);
    g += windowBox(40, 40, 230, 150, { sky: '#CFE3F7' }) + `<path d="M90 120 l60 -10 l30 -20 l6 4 l-18 22 l40 -4 l8 6 l-50 10 l-20 20 l-8 -2 l10 -18 l-56 6 z" fill="#FFFFFF"/>`;
    const p = person({ x: 300, y: 288, f: 1, shirt: '#D9534F', pants: '#2A3358', skin: SKIN[0], hair: HAIR[1], hairStyle: 'long', arms: [[-30, -20], [10, 5]], legs: [[18, 6], [-16, -4]] });
    g += suitcase(p.hand2[0] - 44, 372, '#7B5CE6') + line([p.hand2[0] - 25, 286], p.hand2, '#6B7590', 4) + p.svg;
    return g;
  };
  S.laptopLeft = () => {
    let g = room({ wall: '#E6ECF5' }) + whiteboard(60, 60, 200, 130, false) + `<path d="M80 90 h120 M80 110 h90 M80 130 h140 M80 150 h70" stroke="#4C64FF" stroke-width="4" stroke-linecap="round"/>` + windowBox(380, 50, 170, 120, { city: true });
    g += rect(120, 272, 380, 14, C.wood, 4) + rect(140, 286, 10, 80, C.wood2) + rect(470, 286, 10, 80, C.wood2) + laptop(300, 272, 1) + rect(380, 264, 50, 8, '#FFFFFF', 1) + rect(386, 258, 50, 8, '#F7F9FC', 1) + cup(200, 272, '#0F9AA3');
    g += chair(170, 312, '#3C4566') + chair(440, 312, '#3C4566', -1);
    return g;
  };
  S.chef = () => {
    let g = room({ wall: '#EEF1F5', floor: '#C7CED9' });
    for (let i = 0; i < 10; i++) for (let j = 0; j < 4; j++) g += rect(i * 60 + 2, 40 + j * 40 + 2, 56, 36, '#FFFFFF', 3);
    g += rect(440, 120, 90, 70, '#6B7590', 8) + rect(434, 186, 102, 8, '#3C4566', 3) + circ(470, 150, 10, '#9AA3BA') + circ(500, 150, 10, '#9AA3BA');
    const p = person({ x: 230, y: 300, f: 1, shirt: '#FFFFFF', pants: '#2A3358', skin: SKIN[1], hair: HAIR[0], hat: 'chef', apron: true, arms: [[58, 100], [48, 104]], legs: [[0, 0], [0, 0]], noShadow: true });
    g += p.svg + rect(20, 248, 560, 12, '#8C97AD', 3) + rect(30, 260, 540, 140, '#B8C0D0', 4) + rect(60, 280, 140, 90, '#AAB3C5', 4) + rect(400, 280, 140, 90, '#AAB3C5', 4);
    const bx = p.hand[0] - 24;
    g += rect(bx, 238, 110, 10, C.woodL, 3) + `<path d="M${bx + 52} 238 h34" stroke="#16A34A" stroke-width="9" stroke-linecap="round"/>` + circ(bx + 94, 232, 8, '#D9534F') + circ(bx + 30, 234, 5, '#F08A24') + circ(bx + 40, 234, 5, '#F08A24');
    g += line([p.hand[0] + 2, p.hand[1] - 2], [p.hand[0] + 34, p.hand[1] + 2], '#D5DBE6', 5) + rect(p.hand[0] - 6, p.hand[1] - 5, 12, 7, '#22263A', 2);
    return g;
  };
  const NAMES = Object.keys(S);
  function render(id) { const f = S[id]; return f ? wrap(f(), id) : wrap(room() + `<text x="300" y="200" text-anchor="middle" font-size="18" fill="#69718F">${U.esc(id || '')}</text>`); }
  return { render, NAMES };
})();
