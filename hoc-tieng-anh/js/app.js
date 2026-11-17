const App = (() => {
  const views = {};
  const TITLES = { home: 'Hôm nay', path: 'Lộ trình 900', vocab: 'Từ vựng', topic: 'Từ vựng', learn: 'Học từ mới', review: 'Ôn tập', words: 'Kho từ', grammar: 'Ngữ pháp', gram: 'Ngữ pháp', listen: 'Listening', read: 'Reading', train: 'Luyện tập', practice: 'Luyện tập', dictation: 'Nghe chép chính tả', speak: 'Phát âm & Nói', mistakes: 'Sổ lỗi sai', tests: 'Thi thử', result: 'Kết quả thi', couple: 'Mèo & Chó', stats: 'Thống kê', settings: 'Cài đặt', strat: 'Chiến thuật', redo: 'Làm lại câu sai', exam: 'Phòng thi' };
  let current = null, cleanup = null, lastAct = Date.now();

  function register(name, view) { views[name] = view; }
  function parse() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, qs] = raw.split('?');
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    const query = {};
    (qs || '').split('&').filter(Boolean).forEach(kv => { const i = kv.indexOf('='); query[i < 0 ? kv : kv.slice(0, i)] = decodeURIComponent(i < 0 ? '' : kv.slice(i + 1)); });
    return { name: parts[0] || 'home', params: parts.slice(1), query };
  }
  function go(name, ...params) {
    const hash = '#/' + [name, ...params].map(x => { const t = String(x); const i = t.indexOf('?'); return i < 0 ? encodeURIComponent(t) : encodeURIComponent(t.slice(0, i)) + t.slice(i); }).join('/');
    if (location.hash === hash) render(); else location.hash = hash;
  }
  function chrome(r) {
    UI.side(r.name);
    UI.topbar(TITLES[r.name] || 'Pawlish');
    UI.tabbar(r.name);
  }
  async function render() {
    Speech.stop();
    Speech.release();
    FX.closeAll();
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    document.body.classList.remove('exam-mode', 'focus-mode', 'welcome-mode');
    document.querySelectorAll('body > .q-foot').forEach(x => x.remove());
    const root = document.getElementById('view');
    U.clear(root);
    const r = parse();
    if (r.name === 'sync' && r.params[0]) {
      try {
        const res = await Store.importCode(r.params[0]);
        FX.toast(res.stale ? 'Mã này cũ hơn dữ liệu đang có' : 'Đã cập nhật tiến độ của ' + res.name + (res.notes ? ' · ' + res.notes + ' lời nhắn mới' : ''));
      } catch (e) { FX.toast('Không đọc được mã tiến độ'); }
      if (Store.db.setup) { history.replaceState(null, '', '#/couple'); return render(); }
      history.replaceState(null, '', '#/'); return render();
    }
    if (!Store.db.setup || !Store.P()) {
      ['side', 'topbar', 'tabbar'].forEach(id => U.clear(document.getElementById(id)));
      document.body.classList.add('focus-mode');
      views.welcome.render(root);
      return;
    }
    const v = views[r.name] || views.home;
    current = r;
    chrome(r);
    const box = U.h('div.view-root.page-enter');
    root.appendChild(box);
    try {
      const c = v.render(box, r.params, r.query);
      if (typeof c === 'function') cleanup = c;
    } catch (e) {
      console.error(e);
      box.appendChild(UI.empty('Có lỗi khi mở trang này: ' + e.message, 'sad'));
    }
    root.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  const refreshChrome = U.debounce(() => { if (current && Store.P() && Store.db.setup) { UI.topbar(TITLES[current.name] || 'Pawlish'); UI.side(current.name); UI.tabbar(current.name); } }, 350);
  function boot() {
    document.body.classList.toggle('reduce-motion', !Store.settings().motion);
    document.body.classList.toggle('nav-mini', !!Store.settings().navMini);
    addEventListener('hashchange', render);
    Store.onChange(() => { if (!document.body.classList.contains('exam-mode')) refreshChrome(); });
    ['pointerdown', 'keydown', 'scroll'].forEach(ev => addEventListener(ev, () => { lastAct = Date.now(); }, { passive: true }));
    setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastAct < 90000 && Store.P() && Store.db.setup && current && current.name !== 'settings') Store.addMinutes(.5);
    }, 30000);
    render();
    if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  return { register, go, render, refresh: render, boot, TITLES, get current() { return current; } };
})();
document.addEventListener('DOMContentLoaded', () => App.boot());
