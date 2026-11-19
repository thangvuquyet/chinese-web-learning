const fs = require('fs');
const path = require('path');
const { loadApp } = require('./lib.cjs');

const ROOT = path.resolve(__dirname, '..');
const pick = f => /^js\/data\//.test(f) || /^js\/core\/(util|store|srs|data|voices)\.js$/.test(f);
const CJK = /[一-鿿]/;

function dialogLines(str) {
  return str.split('|').map(s => {
    const m = s.match(/^(男|女)：(.*)$/);
    return m ? { who: m[1], text: m[2] } : { who: null, text: s };
  }).filter(l => l.text.trim());
}

function buildPlan(root = ROOT) {
  const app = loadApp(root, pick);
  const [Voices, D, HSK] = ['Voices', 'D', 'HSK'].map(app.get);
  const out = new Map();

  function add(key, text, tier) {
    const t = Voices.norm(text);
    if (!t || !CJK.test(t)) return;
    const id = Voices.clipId(key, t);
    const cur = out.get(id);
    if (!cur) out.set(id, { id, key, text: t, tier });
    else if (cur.key !== key || cur.text !== t) throw new Error('clip id collision: ' + id);
    else if (tier < cur.tier) cur.tier = tier;
  }
  const say = (who, text, tier) => add(Voices.key(who === '男' ? 'm' : 'f'), text, tier);

  for (const w of D.words) add('ZH-F', w.hz, 1);
  for (const s of D.sentences) add('ZH-F', s.text, 1);
  for (const it of HSK.pics) add('ZH-F', it[0], 1);
  for (const it of HSK.picword4) add('ZH-F', it[2], 2);

  for (const kind of ['dlg3', 'long3', 'dlg4']) {
    for (const it of HSK[kind]) {
      for (const l of dialogLines(it[0])) say(l.who, l.text, 1);
      say(null, '问：' + it[1], 1);
    }
  }
  for (const it of HSK.mono4) {
    say(null, it[0], 1);
    for (const s of it[0].split(/(?<=[。！？])/)) say(null, s, 2);
    for (const qq of it[1]) say(null, '问：' + qq[0], 1);
  }

  for (const g of HSK.grammar) {
    for (const ex of g.ex || []) {
      const [text, opts, ans] = ex;
      if (typeof text === 'string' && text.includes('___')) add('ZH-F', text.replace('___', opts[ans]), 2);
    }
  }
  for (const q of HSK.speakQ) { add('ZH-F', q[0], 2); add('ZH-F', q[2], 2); }
  for (const f of HSK.falseFriends) add('ZH-F', f[0], 2);

  const sounds = fs.readFileSync(path.join(root, 'js/views/sounds.js'), 'utf8');
  for (const m of sounds.matchAll(/['"]([一-鿿]{1,8})['"]/g)) add('ZH-F', m[1], 3);
  add('ZH-F', '你好，我是小猫。', 3);
  add('ZH-F', '欢迎你学习汉语！加油！', 3);

  return [...out.values()].sort((x, y) => x.tier - y.tier || x.id.localeCompare(y.id));
}

function summarize(list) {
  const by = {};
  for (const c of list) {
    const t = by[c.tier] || (by[c.tier] = { clips: 0, chars: 0 });
    t.clips++;
    t.chars += c.text.length;
  }
  return by;
}

module.exports = { buildPlan, summarize, ROOT, dialogLines };
