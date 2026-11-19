const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildPlan, ROOT } = require('./plan.cjs');
const az = require('./azure.cjs');

const sleep = ms => new Promise(r => setTimeout(r, ms));
const MONTHLY_FREE = 480000;

function parseArgs(argv) {
  const o = { tiers: [1, 2, 3], rpm: 18, maxChars: 400000, concurrency: 1, plan: false, prune: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const v = () => argv[++i];
    if (a === '--plan') o.plan = true;
    else if (a === '--prune') o.prune = true;
    else if (a === '--tiers') o.tiers = v().split(',').map(Number);
    else if (a === '--rpm') o.rpm = Number(v());
    else if (a === '--max-chars') o.maxChars = Number(v());
    else if (a === '--concurrency') o.concurrency = Number(v());
    else if (a === '--key-file') o.keyFile = v();
    else if (a === '--endpoint') o.endpoint = v();
    else if (a === '--out') o.out = v();
    else if (a === '--limit') o.limit = Number(v());
    else throw new Error('unknown option ' + a);
  }
  return o;
}

function readCfg(o) {
  const file = o.keyFile || process.env.AZURE_SPEECH_FILE || path.join(os.homedir(), 'azure-speech.json');
  if (!fs.existsSync(file)) throw new Error('key file not found: ' + file);
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!j.key || !(j.region || o.endpoint)) throw new Error('key file must contain key and region');
  return { key: j.key, region: j.region, endpoint: o.endpoint };
}

function writeManifest(dir, ids) {
  const tmp = path.join(dir, 'manifest.json.tmp');
  fs.writeFileSync(tmp, JSON.stringify({ v: 1, ids: [...ids].sort() }));
  fs.renameSync(tmp, path.join(dir, 'manifest.json'));
}

const monthKey = () => new Date().toISOString().slice(0, 7);

async function run(o, log = console.log) {
  const root = o.root || ROOT;
  const outDir = o.out || path.join(root, 'audio');
  fs.mkdirSync(outDir, { recursive: true });
  const all = buildPlan(root);
  const planIds = new Set(all.map(c => c.id));
  let list = all.filter(c => o.tiers.includes(c.tier));
  if (o.limit) list = list.slice(0, o.limit);
  const have = new Set(fs.readdirSync(outDir).filter(f => f.endsWith('.mp3')).map(f => f.slice(0, -4)));
  const todo = list.filter(c => !have.has(c.id));
  const chars = todo.reduce((s, c) => s + c.text.length, 0);
  log('plan: ' + list.length + ' clips, ' + have.size + ' on disk, ' + todo.length + ' to generate, ' + chars + ' characters');
  if (o.plan) return { planned: list.length, todo: todo.length, chars, done: 0, failed: [] };

  const cfg = readCfg(o);
  const usageFile = o.usageFile || path.join(os.homedir(), '.azure-speech-usage.json');
  const usage = fs.existsSync(usageFile) ? JSON.parse(fs.readFileSync(usageFile, 'utf8')) : {};
  const used = usage[monthKey()] || 0;
  const budget = Math.min(o.maxChars, MONTHLY_FREE - used);
  if (budget <= 0) throw new Error('monthly character budget used up (' + used + ' of ' + MONTHLY_FREE + ' counted)');

  const known = await az.listVoices(cfg);
  const need = [...new Set(todo.map(c => c.key))];
  const missing = need.filter(k => !known.has(az.VOICES[k]));
  if (missing.length) throw new Error('voices not available in this region: ' + missing.map(k => az.VOICES[k]).join(', '));

  const interval = 60000 / o.rpm;
  let nextSlot = Date.now();
  const takeSlot = async () => {
    const at = Math.max(nextSlot, Date.now());
    nextSlot = at + interval;
    if (at > Date.now()) await sleep(at - Date.now());
  };

  const ids = new Set([...have].filter(id => planIds.has(id)));
  const failed = [];
  let done = 0, spent = 0, idx = 0, stopped = false;
  const started = Date.now();
  const saveUsage = () => { usage[monthKey()] = used + spent; fs.writeFileSync(usageFile, JSON.stringify(usage)); };

  async function worker() {
    while (!stopped) {
      const c = todo[idx++];
      if (!c) return;
      if (spent + c.text.length > budget) { stopped = true; log('character budget for this run reached'); return; }
      await takeSlot();
      spent += c.text.length;
      try {
        const buf = await az.synth(cfg, az.VOICES[c.key], c.text, { backoff: o.backoff });
        const tmp = path.join(outDir, c.id + '.tmp');
        fs.writeFileSync(tmp, buf);
        fs.renameSync(tmp, path.join(outDir, c.id + '.mp3'));
        ids.add(c.id);
        done++;
        if (done % 50 === 0) {
          writeManifest(outDir, ids);
          saveUsage();
          const rate = done / ((Date.now() - started) / 60000);
          log(done + '/' + todo.length + ' done, ' + rate.toFixed(1) + ' clips/min, about ' + Math.round((todo.length - done) / Math.max(rate, 0.1)) + ' min left');
        }
      } catch (e) {
        failed.push({ id: c.id, error: e.message });
        if (e.fatal) { stopped = true; log('stopped: ' + e.message); return; }
        log('skip ' + c.id + ': ' + e.message);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, o.concurrency) }, worker));

  writeManifest(outDir, ids);
  saveUsage();
  if (o.prune) {
    for (const f of fs.readdirSync(outDir)) if (f.endsWith('.mp3') && !planIds.has(f.slice(0, -4))) fs.unlinkSync(path.join(outDir, f));
  }
  log('finished: ' + done + ' new, ' + ids.size + ' in manifest, ' + failed.length + ' failed');
  return { planned: list.length, todo: todo.length, chars, done, failed };
}

module.exports = { run, parseArgs };

if (require.main === module) {
  run(parseArgs(process.argv.slice(2))).then(r => { process.exitCode = r.failed.length ? 1 : 0; }).catch(e => { console.error(e.message); process.exitCode = 1; });
}
