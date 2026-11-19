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
    Speech.release();
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
  function applyTheme() {
    const t = Store.settings().theme || 'auto';
    const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const m = document.querySelector('meta[name=theme-color]');
    if (m) m.content = dark ? '#0B1511' : '#0E6A59';
    return dark;
  }
  function boot() {
    applyTheme();
    try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if ((Store.settings().theme || 'auto') === 'auto') applyTheme(); }); } catch (e) {}
    addEventListener('keydown', e => {
      const tag = ((document.activeElement || {}).tagName || '');
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); Palette.open(); }
      else if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(tag)) { e.preventDefault(); Palette.open(); }
    });
    document.body.classList.toggle('reduce-motion', !Store.settings().motion);
    Icon.observe();
    UI.applyNav();
    addEventListener('hashchange', render);
    Store.onChange(() => { if (Store.P()) { UI.topbar(); } });
    render();
    if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  return { register, go, render, refresh, boot, applyTheme, get current() { return current; } };
})();
document.addEventListener('DOMContentLoaded', () => App.boot());
