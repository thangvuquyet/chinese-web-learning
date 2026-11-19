const http = require('http');
const { VOICES } = require('./azure.cjs');

function fakeMp3(text) {
  const head = Buffer.from([0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  const body = Buffer.alloc(600 + text.length * 40, text.length % 251);
  return Buffer.concat([head, body]);
}

function start({ key = 'test-key', failEvery = 0, rateLimitFirst = 0 } = {}) {
  const log = { requests: [], voiceLists: 0 };
  let n = 0;
  const server = http.createServer((req, res) => {
    if (req.headers['ocp-apim-subscription-key'] !== key) { res.writeHead(401); return res.end('denied'); }
    if (req.method === 'GET' && req.url === '/cognitiveservices/voices/list') {
      log.voiceLists++;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(Object.values(VOICES).map(v => ({ ShortName: v }))));
    }
    if (req.method === 'POST' && req.url === '/cognitiveservices/v1') {
      const chunks = [];
      req.on('data', c => chunks.push(c));
      req.on('end', () => {
        n++;
        const body = Buffer.concat(chunks).toString('utf8');
        const voice = (/<voice name="([^"]+)"/.exec(body) || [])[1];
        const text = body.replace(/<[^>]+>/g, '');
        log.requests.push({ voice, text, ssml: body, format: req.headers['x-microsoft-outputformat'], type: req.headers['content-type'] });
        if (n <= rateLimitFirst || (failEvery && n % failEvery === 0)) { res.writeHead(429, { 'Retry-After': '0' }); return res.end('slow down'); }
        if (!voice) { res.writeHead(400); return res.end('no voice'); }
        res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
        res.end(fakeMp3(text));
      });
      return;
    }
    res.writeHead(404);
    res.end();
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({ server, log, url: 'http://127.0.0.1:' + server.address().port, close: () => new Promise(r => server.close(r)) })));
}

module.exports = { start };
