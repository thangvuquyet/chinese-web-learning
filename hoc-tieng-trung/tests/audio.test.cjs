const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadApp } = require('../tools/lib.cjs');
const { buildPlan, summarize, ROOT, dialogLines } = require('../tools/plan.cjs');
const az = require('../tools/azure.cjs');
const mock = require('../tools/mock-azure.cjs');
const { run } = require('../tools/make-audio.cjs');

const app = loadApp(ROOT, f => /^js\/data\//.test(f) || /^js\/core\/(util|store|srs|data|voices)\.js$/.test(f));
const Voices = app.get('Voices');
const D = app.get('D');
const HSK = app.get('HSK');
const plan = buildPlan(ROOT);
const byId = new Map(plan.map(c => [c.id, c]));

test('Voices: gender decides the voice and unknown speakers get the female voice', () => {
  assert.equal(Voices.key('m'), 'ZH-M');
  assert.equal(Voices.key('男'), 'ZH-M');
  assert.equal(Voices.key('f'), 'ZH-F');
  assert.equal(Voices.key('女'), 'ZH-F');
  assert.equal(Voices.key(null), 'ZH-F');
  assert.equal(Voices.key(undefined), 'ZH-F');
});

test('Voices: ids ignore spacing and differ by voice and text', () => {
  assert.equal(Voices.clipId('ZH-F', '我 爱 我 的 家。'), Voices.clipId('ZH-F', '我爱我的家。'));
  assert.notEqual(Voices.clipId('ZH-F', '你好'), Voices.clipId('ZH-M', '你好'));
  assert.notEqual(Voices.clipId('ZH-F', '你好'), Voices.clipId('ZH-F', '你们好'));
});

test('Plan: no two different clips share an id and the plan stays far below the free allowance', () => {
  assert.equal(byId.size, plan.length);
  const sum = summarize(plan);
  assert.ok(sum[1].clips > 3000);
  const total = Object.values(sum).reduce((n, x) => n + x.chars, 0);
  assert.ok(total < 100000, 'plan needs ' + total + ' characters');
});

test('Plan: every word, sentence and dialogue line a learner can hear has a clip', () => {
  const need = (key, text) => assert.ok(byId.has(Voices.clipId(key, text)), 'missing ' + key + ' ' + text);
  D.words.forEach(w => need('ZH-F', w.hz));
  D.sentences.forEach(s => need('ZH-F', s.text));
  for (const kind of ['dlg3', 'long3', 'dlg4']) {
    for (const it of HSK[kind]) {
      for (const l of dialogLines(it[0])) need(l.who === '男' ? 'ZH-M' : 'ZH-F', l.text);
      need('ZH-F', '问：' + it[1]);
    }
  }
  for (const it of HSK.mono4) {
    need('ZH-F', it[0]);
    it[1].forEach(qq => need('ZH-F', '问：' + qq[0]));
  }
  HSK.pics.forEach(it => need('ZH-F', it[0]));
});

test('Plan: shadowing sentences cut from monologues have clips', () => {
  for (const it of HSK.mono4) for (const s of it[0].split(/(?<=[。！？])/).filter(x => x.trim())) assert.ok(byId.has(Voices.clipId('ZH-F', s)), 'missing ' + s);
});

test('Plan: dialogues use both voices', () => {
  const keys = new Set(dialogLines(HSK.dlg3[0][0]).map(l => Voices.key(l.who === '男' ? 'm' : 'f')));
  assert.equal(keys.size, 2);
});

test('Azure client: SSML escapes markup and sets the Chinese language', () => {
  const x = az.ssml('zh-CN-XiaoxiaoNeural', '你好 <吗> & "好"');
  assert.match(x, /你好 &lt;吗&gt; &amp; &quot;好&quot;/);
  assert.match(x, /xml:lang="zh-CN"/);
  assert.match(x, /<voice name="zh-CN-XiaoxiaoNeural">/);
});

function sandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clips-'));
  const keyFile = path.join(dir, 'key.json');
  fs.writeFileSync(keyFile, JSON.stringify({ key: 'test-key', region: 'local' }));
  return { dir, keyFile, out: path.join(dir, 'audio'), usageFile: path.join(dir, 'usage.json') };
}
const quiet = () => {};
const base = (s, srv, extra) => Object.assign({ tiers: [1], rpm: 100000, maxChars: 400000, concurrency: 1, keyFile: s.keyFile, endpoint: srv.url, out: s.out, usageFile: s.usageFile, backoff: 0 }, extra);

test('Generator: writes clips, manifest and resumes without repeating work', async () => {
  const s = sandbox();
  const srv = await mock.start();
  try {
    const opts = base(s, srv, { concurrency: 2, limit: 60 });
    const first = await run(opts, quiet);
    assert.equal(first.done, 60);
    assert.equal(first.failed.length, 0);
    const manifest = JSON.parse(fs.readFileSync(path.join(s.out, 'manifest.json'), 'utf8'));
    assert.equal(manifest.ids.length, 60);
    for (const id of manifest.ids) assert.ok(fs.existsSync(path.join(s.out, id + '.mp3')));
    assert.equal(srv.log.requests.length, 60);
    srv.log.requests.forEach(r => { assert.equal(r.format, az.FORMAT); assert.equal(r.type, 'application/ssml+xml'); });
    const second = await run(opts, quiet);
    assert.equal(second.done, 0);
    assert.equal(srv.log.requests.length, 60);
  } finally { await srv.close(); fs.rmSync(s.dir, { recursive: true, force: true }); }
});

test('Generator: each clip is requested with its planned voice', async () => {
  const s = sandbox();
  const srv = await mock.start();
  try {
    await run(base(s, srv, { limit: 80 }), quiet);
    const planned = plan.filter(c => c.tier === 1).slice(0, 80);
    const voices = new Set(srv.log.requests.map(r => r.voice));
    for (const c of planned) assert.ok(voices.has(az.VOICES[c.key]));
  } finally { await srv.close(); fs.rmSync(s.dir, { recursive: true, force: true }); }
});

test('Generator: rate limit responses are retried and not counted as failures', async () => {
  const s = sandbox();
  const srv = await mock.start({ rateLimitFirst: 3 });
  try {
    const r = await run(base(s, srv, { limit: 5 }), quiet);
    assert.equal(r.done, 5);
    assert.equal(r.failed.length, 0);
    assert.ok(srv.log.requests.length > 5);
  } finally { await srv.close(); fs.rmSync(s.dir, { recursive: true, force: true }); }
});

test('Generator: a rejected key stops the run at once and writes nothing', async () => {
  const s = sandbox();
  fs.writeFileSync(s.keyFile, JSON.stringify({ key: 'wrong', region: 'local' }));
  const srv = await mock.start();
  try {
    await assert.rejects(run(base(s, srv, { limit: 5 }), quiet), /auth rejected/);
    assert.equal(srv.log.requests.length, 0);
    assert.equal(fs.readdirSync(s.out).filter(f => f.endsWith('.mp3')).length, 0);
  } finally { await srv.close(); fs.rmSync(s.dir, { recursive: true, force: true }); }
});

test('Generator: the character budget caps a run and is remembered', async () => {
  const s = sandbox();
  const srv = await mock.start();
  try {
    const r = await run(base(s, srv, { maxChars: 40, limit: 200 }), quiet);
    assert.ok(r.done > 0 && r.done < 200);
    const counted = Object.values(JSON.parse(fs.readFileSync(s.usageFile, 'utf8')))[0];
    assert.ok(counted > 0 && counted <= 40, 'counted ' + counted);
  } finally { await srv.close(); fs.rmSync(s.dir, { recursive: true, force: true }); }
});

test('Generator: plan mode makes no requests and reports the cost', async () => {
  const s = sandbox();
  const srv = await mock.start();
  try {
    const r = await run({ plan: true, tiers: [1, 2, 3], keyFile: s.keyFile, endpoint: srv.url, out: s.out, usageFile: s.usageFile }, quiet);
    assert.equal(r.planned, plan.length);
    assert.equal(r.done, 0);
    assert.equal(srv.log.requests.length, 0);
    assert.ok(r.chars > 10000);
  } finally { await srv.close(); fs.rmSync(s.dir, { recursive: true, force: true }); }
});
