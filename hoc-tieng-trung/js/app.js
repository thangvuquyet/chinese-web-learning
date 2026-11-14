const App = (() => {
  const views = {};
  const TAB_OF = { home: 'home', path: 'path', learn: 'path', check: 'path', review: 'review', exams: 'exams', exam: 'exams', examreview: 'exams', drill: 'exams' };
  let current = null;
  let cleanup = null;

  function register(name, view) { views[name] = view; }
  function parse() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, qs] = raw.split('?');
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    const query = {};
    (qs || '').split('&').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); query[k] = decodeURIComponent(v || ''); });
    return { name: parts[0] || 'home', params: parts.slice(1), query };
  }
  function go(name, ...params) {
    const hash = '#/' + [name, ...params].map(encodeURIComponent).join('/');
    if (location.hash === hash) render(); else location.hash = hash;
  }
  function render() {
    Speech.stop();
    FX.closeAll();
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    const root = document.getElementById('view');
    const old = root.querySelector('.view-root');
    if (old && old._cleanup) try { old._cleanup(); } catch (e) {}
    document.querySelectorAll('body > .feedback').forEach(x => x.remove());
    U.clear(root);
    if (!Store.P()) { UI.onboarding(); return; }
    const r = parse();
    const v = views[r.name] || views.home;
    current = r;
    UI.topbar();
    UI.tabbar(TAB_OF[r.name] || 'more');
    const box = U.h('div.view-root.page-enter');
    root.appendChild(box);
    try {
      const c = v.render(box, r.params, r.query);
      if (typeof c === 'function') cleanup = c;
    } catch (e) {
      console.error(e);
      box.appendChild(UI.empty('Ối, có lỗi nhỏ: ' + e.message, 'sad'));
    }
    root.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  function refresh() { render(); }
  function boot() {
    document.body.classList.toggle('reduce-motion', !Store.settings().motion);
    Icon.observe();
    UI.applyNav();
    addEventListener('hashchange', render);
    Store.onChange(() => { if (Store.P()) { UI.topbar(); } });
    render();
    if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  return { register, go, render, refresh, boot, get current() { return current; } };
})();
document.addEventListener('DOMContentLoaded', () => App.boot());
