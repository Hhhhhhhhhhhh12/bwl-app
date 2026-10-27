/* Startup adapted from E's idempotent bootstrap to D's separate HTML pages.
   No hash router, automatic tests, dev overlay or data conversion is loaded. */
(function () {
  'use strict';
  function boot() {
    if (window.__BWL_BOOTED__) return;
    window.__BWL_BOOTED__ = true;
    const page = document.body.dataset.page;
    const legacyPage = location.hash.slice(1);
    const tail = location.pathname.split('/').pop();
    if ((!tail || tail === 'index.html') && ['train', 'achievements', 'settings'].includes(legacyPage)) {
      location.replace(legacyPage + '.html' + location.search);
      return;
    }
    if (window.initQuickstart) window.initQuickstart();
    if (page === 'train' && window.Train) {
      const params = new URLSearchParams(location.search);
      const topic = params.get('topic');
      // The engine validates topic names against selected, unlocked registrations.
      window.Train.prime(topic, params.get('difficulty') || 1);
      window.Train.init();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
