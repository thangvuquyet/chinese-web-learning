const Voices = (() => {
  const norm = t => String(t).replace(/\s+/g, '');
  const key = gender => (gender === 'm' || gender === 'M' || gender === '男') ? 'ZH-M' : 'ZH-F';
  function clipId(k, text) {
    const t = norm(text);
    return U.hash(k + '|' + t).toString(36) + U.hash(t + '|' + k + '#').toString(36);
  }
  return { norm, key, clipId };
})();
