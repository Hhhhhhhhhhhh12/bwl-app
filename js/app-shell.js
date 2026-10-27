// js/app-shell.js
(function(){
  'use strict';

  // debug guard (enable with ?dev=1)
  const DBG = new URLSearchParams(location.search).get('dev') === '1' || location.search.includes('dev=1');
  const log = (...a) => { if (DBG) console.debug('[shell]', ...a); };

  // derive current page (MPA): prefer data-page, fall back to pathname
  const derivePage = () => {
    const dp = document.body.getAttribute('data-page');
    if (dp) return dp;
    const tail = (location.pathname.split('/').pop() || '').toLowerCase();
    if (!tail || tail === '' || tail === 'index.html') return 'dashboard';
    return tail.endsWith('.html') ? tail.slice(0, -5) : 'dashboard';
  };
  const PAGE = derivePage();
  log('page', PAGE);

  // active nav state via aria-current (CSP-safe)
  const links = document.querySelectorAll('a.nav-link');
  links.forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    const file = href.split('/').pop();
    const target = file && file.endsWith('.html') ? file.slice(0, -5) : '';
    if (target && target === PAGE) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });

  // version (no-store to avoid stale footer after deploy)
  fetch('version.txt', { cache: 'no-store' })
    .then(r => r.ok ? r.text() : 'Stand unbekannt')
    .then(v => {
      const entry = String(v || '').match(/^version=(.+)$/m);
      const vv = (entry ? entry[1] : String(v || '').trim()).replace('-arbeitskopie', ' · Arbeitskopie');
      const els = document.querySelectorAll('#app-version, #app-version-dashboard, .app-version');
      els.forEach(e => e && (e.textContent = vv || 'Stand unbekannt'));
      log('version', vv);
    })
    .catch(() => {
      const els = document.querySelectorAll('#app-version, #app-version-dashboard, .app-version');
      els.forEach(e => e && (e.textContent = 'Stand unbekannt'));
    });

  // theme handling (light/dark/auto) with persistence and live updates
  const THEME_KEY = 'bwl_theme';
  const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  const applyTheme = (t) => {
    if (t === 'auto') {
      const dark = !!(mql && mql.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      document.body.dataset.theme = dark ? 'dark' : 'light';
    } else {
      document.documentElement.dataset.theme = t || 'light';
      document.body.dataset.theme = t || 'light';
    }
  };

  const currentTheme = () => {
    try { return localStorage.getItem(THEME_KEY) || 'light'; } catch (_) { return 'light'; }
  };

  // init theme
  applyTheme(currentTheme());
  const sel = document.getElementById('theme-select');
  if (sel) sel.value = currentTheme();

  // react to select changes
  document.addEventListener('change', (e) => {
    const t = e.target && e.target.id === 'theme-select' ? e.target.value : null;
    if (!t) return;
    try { localStorage.setItem(THEME_KEY, t); } catch (_) {}
    applyTheme(t);
    log('theme change', t);
  });

  // react to system changes when in auto
  if (mql) {
    mql.addEventListener('change', () => {
      if (currentTheme() === 'auto') applyTheme('auto');
    });
  }

  // keep theme in sync across tabs
  window.addEventListener('storage', (e) => {
    if (e.key === THEME_KEY) {
      applyTheme(e.newValue || 'light');
      if (sel) sel.value = e.newValue || 'light';
    }
  });
})();