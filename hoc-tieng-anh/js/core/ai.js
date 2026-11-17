const AI = (() => {
  let clientP = null, clientKey = '';
  const enabled = () => !!(Store.settings().aiKey || '').trim();
  async function client() {
    const key = Store.settings().aiKey.trim();
    if (clientP && clientKey === key) return clientP;
    clientKey = key;
    clientP = import('https://esm.sh/@anthropic-ai/sdk').then(m => {
      const Anthropic = m.default || m.Anthropic;
      return new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
    });
    return clientP;
  }
  const SCHEMA = {
    type: 'object',
    properties: {
      score: { type: 'integer' },
      level: { type: 'string' },
      relevance: { type: 'integer' },
      grammar: { type: 'integer' },
      vocabulary: { type: 'integer' },
      coherence: { type: 'integer' },
      summary_vi: { type: 'string' },
      corrections: { type: 'array', items: { type: 'object', properties: { original: { type: 'string' }, better: { type: 'string' }, why_vi: { type: 'string' } }, required: ['original', 'better', 'why_vi'], additionalProperties: false } },
      upgraded_answer: { type: 'string' },
      useful_phrases: { type: 'array', items: { type: 'string' } }
    },
    required: ['score', 'level', 'relevance', 'grammar', 'vocabulary', 'coherence', 'summary_vi', 'corrections', 'upgraded_answer', 'useful_phrases'],
    additionalProperties: false
  };
  const SYSTEM = 'You are an experienced TOEIC Speaking examiner and English coach for Vietnamese adult learners aiming at TOEIC 800-900. You receive a speaking question and a speech-recognition transcript of the learner\'s spoken answer. The transcript may contain recognition errors; do not penalise obvious mis-recognitions of correct words. Evaluate relevance to the question, grammar, vocabulary range and coherence, each 0-100, and an overall score 0-100. Give level as a CEFR estimate (A2, B1, B2, C1). Write summary_vi in Vietnamese, 2-3 sentences, encouraging but honest and specific. List up to 5 corrections of real grammar or word-choice errors (original fragment, better version, short Vietnamese reason). upgraded_answer must keep the learner\'s own ideas but rewrite them as a natural B2-C1 answer of similar length plus at most 30%. useful_phrases: 3-5 short reusable phrases for this topic.';
  async function feedback(question, transcript) {
    const c = await client();
    const res = await c.beta.messages.create({
      model: Store.settings().aiModel || 'claude-opus-5-5',
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      system: SYSTEM,
      messages: [{ role: 'user', content: 'Question: ' + question + '\n\nTranscript of my spoken answer: ' + transcript }]
    });
    if (res.stop_reason === 'refusal') throw new Error('Claude từ chối trả lời yêu cầu này.');
    const block = res.content.find(b => b.type === 'text');
    if (!block) throw new Error('Không nhận được phản hồi.');
    return JSON.parse(block.text);
  }
  function errText(e) {
    const s = String(e && (e.status || '') + ' ' + (e.message || e));
    if (/401|authentication|invalid x-api-key/i.test(s)) return 'API key không hợp lệ. Kiểm tra lại trong Cài đặt.';
    if (/429|rate/i.test(s)) return 'Đang gửi quá nhiều yêu cầu, thử lại sau ít phút.';
    if (/credit|billing|402/i.test(s)) return 'Tài khoản API hết tín dụng.';
    if (/Failed to fetch|NetworkError|import/i.test(s)) return 'Không kết nối được tới máy chủ AI. Kiểm tra Internet.';
    return 'Lỗi AI: ' + (e.message || e);
  }
  return { enabled, feedback, errText };
})();
