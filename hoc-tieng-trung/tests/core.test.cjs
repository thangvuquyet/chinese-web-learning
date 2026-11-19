const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { loadApp } = require('../tools/lib.cjs');

const ROOT = path.resolve(__dirname, '..');
const app = loadApp(ROOT, f => /^js\/data\//.test(f) || /^js\/core\/(util|store|srs|data|voices)\.js$/.test(f));
const { SRS, U, D, HSK } = Object.fromEntries(['SRS', 'U', 'D', 'HSK'].map(n => [n, app.get(n)]));
const plainOf = x => JSON.parse(JSON.stringify(x));
const DAY = 86400000;

test('SRS: first good review schedules days ahead, again returns within minutes', () => {
  const now = 1e12;
  const good = SRS.grade(SRS.newCard(), 3, now, false);
  assert.equal(good.st, 2);
  assert.ok(good.due - now >= DAY);
  const again = SRS.grade(SRS.newCard(), 1, now, false);
  assert.equal(again.st, 1);
  assert.ok(again.due - now <= 10 * 60000);
});

test('SRS: intervals grow with each successful review', () => {
  let card = SRS.grade(SRS.newCard(), 3, 1e12, false);
  let t = card.due;
  let prev = 0;
  for (let i = 0; i < 6; i++) {
    const next = SRS.grade(card, 3, t, false);
    const ivl = next.due - t;
    assert.ok(ivl > prev, 'interval ' + i + ' did not grow');
    prev = ivl;
    card = next;
    t = next.due;
  }
});

test('SRS: recall at the due date is close to the 90 percent target', () => {
  const card = SRS.grade(SRS.newCard(), 3, 1e12, false);
  const r = SRS.retrievability(card, card.due);
  assert.ok(r > 0.85 && r < 0.95, 'retrievability ' + r);
});

test('SRS: a lapse enters relearning and lowers stability', () => {
  let card = SRS.grade(SRS.newCard(), 3, 1e12, false);
  let t = card.due;
  for (let i = 0; i < 3; i++) { card = SRS.grade(card, 3, t, false); t = card.due; }
  const lapsed = SRS.grade(card, 1, t, false);
  assert.equal(lapsed.st, 3);
  assert.equal(lapsed.lapses, card.lapses + 1);
  assert.ok(lapsed.s < card.s);
});

test('Pinyin: tones are read from the vowel marks and can be stripped', () => {
  assert.deepEqual(plainOf(U.tonesOf('nǐ hǎo')), [3, 3]);
  assert.deepEqual(plainOf(U.tonesOf('māma')), [1]);
  assert.deepEqual(plainOf(U.tonesOf('xuéxí')), [2, 2]);
  assert.equal(U.stripTones('nǐ hǎo'), 'ni hao');
});

test('Vocabulary: ids are unique and every word has hanzi, pinyin and a meaning', () => {
  assert.ok(D.words.length > 2000);
  assert.equal(new Set(D.words.map(w => w.id)).size, D.words.length);
  const bad = D.words.filter(w => !w.hz || !w.py || !w.vi);
  assert.equal(bad.length, 0, 'incomplete: ' + bad.slice(0, 5).map(w => w.hz).join(', '));
});

test('Vocabulary: tone data only holds valid tone numbers', () => {
  for (const w of D.words) assert.ok(w.tones.every(t => t >= 1 && t <= 4), 'bad tone in ' + w.hz);
  assert.ok(D.words.filter(w => w.toneOk).length > D.words.length * 0.8);
});

test('Sentences: every sentence has text without spaces, a translation and a level', () => {
  assert.ok(D.sentences.length > 500);
  for (const s of D.sentences) {
    assert.ok(!/\s/.test(s.text), 'spaces in ' + s.text);
    assert.ok(s.vi && s.lv >= 1 && s.lv <= 4);
  }
});

test('Listening data: every dialogue line names a speaker and each question has its answer first', () => {
  for (const kind of ['dlg3', 'long3', 'dlg4']) {
    for (const it of HSK[kind]) {
      const lines = it[0].split('|');
      assert.ok(lines.length >= 2);
      assert.ok(lines.every(l => /^(男|女)：/.test(l)), 'unlabeled line in ' + it[0].slice(0, 20));
      assert.ok(Array.isArray(it[2]) && it[2].length >= 3);
    }
  }
});
