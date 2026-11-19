const VOICES = {
  'ZH-F': 'zh-CN-XiaoxiaoNeural',
  'ZH-M': 'zh-CN-YunxiNeural'
};
const FORMAT = 'audio-24khz-48kbitrate-mono-mp3';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

function ssml(voice, text) {
  const lang = voice.split('-').slice(0, 2).join('-');
  return '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="' + lang + '"><voice name="' + voice + '">' + esc(text) + '</voice></speak>';
}

const base = cfg => cfg.endpoint || 'https://' + cfg.region + '.tts.speech.microsoft.com';
const sleep = ms => new Promise(r => setTimeout(r, ms));

function looksLikeMp3(buf) {
  if (!buf || buf.length < 400) return false;
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) return true;
  return buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0;
}

class AzureError extends Error {
  constructor(message, status, fatal) {
    super(message);
    this.status = status;
    this.fatal = !!fatal;
  }
}

async function synth(cfg, voice, text, opts = {}) {
  const tries = opts.tries || 6;
  let wait = opts.backoff != null ? opts.backoff : 4000;
  for (let i = 1; i <= tries; i++) {
    let res;
    try {
      res = await fetch(base(cfg) + '/cognitiveservices/v1', {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': cfg.key,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': FORMAT,
          'User-Agent': 'clip-generator'
        },
        body: ssml(voice, text)
      });
    } catch (e) {
      if (i === tries) throw new AzureError('network: ' + e.message, 0, false);
      await sleep(wait);
      wait = Math.min(wait * 2, 60000);
      continue;
    }
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (!looksLikeMp3(buf)) throw new AzureError('response is not mp3 (' + buf.length + ' bytes)', 200, false);
      return buf;
    }
    if (res.status === 401 || res.status === 403) throw new AzureError('auth rejected (' + res.status + '): check key and region', res.status, true);
    if (res.status === 400) throw new AzureError('bad request: ' + (await res.text()).slice(0, 120), 400, false);
    if (res.status === 429 || res.status >= 500) {
      if (i === tries) throw new AzureError('gave up after ' + res.status, res.status, false);
      const ra = Number(res.headers.get('retry-after'));
      await sleep(ra > 0 ? ra * 1000 : wait);
      wait = Math.min(wait * 2, 60000);
      continue;
    }
    throw new AzureError('unexpected status ' + res.status, res.status, true);
  }
  throw new AzureError('exhausted retries', 0, false);
}

async function listVoices(cfg) {
  const res = await fetch(base(cfg) + '/cognitiveservices/voices/list', { headers: { 'Ocp-Apim-Subscription-Key': cfg.key } });
  if (res.status === 401 || res.status === 403) throw new AzureError('auth rejected (' + res.status + '): check key and region', res.status, true);
  if (!res.ok) throw new AzureError('voice list failed: ' + res.status, res.status, true);
  const j = await res.json();
  return new Set(j.map(v => v.ShortName));
}

module.exports = { VOICES, FORMAT, ssml, synth, listVoices, looksLikeMp3, AzureError, esc };
