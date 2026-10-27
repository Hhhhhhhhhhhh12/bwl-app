/* Shared topic names, selection and the existing D area-unlock rule. */
(function () {
  'use strict';
  const labels = Object.freeze({
    break_even: 'Break-Even', bab: 'BAB', kostenarten: 'Kostenarten',
    abgrenzung: 'Abgrenzung', kostenstellen: 'Kostenstellen',
    deckungsbeitrag: 'Deckungsbeitrag', aequivalenz: 'Äquivalenzziffern',
    zuschlag: 'Zuschlagskalkulation', prozesskosten: 'Prozesskosten',
    kennzahlen: 'Kennzahlen', investition: 'Investitionsrechnung', lager: 'Lagerkennziffern'
  });
  const keys = Object.freeze(Object.keys(labels));
  const area1 = Object.freeze(['deckungsbeitrag', 'kostenarten', 'kostenstellen', 'zuschlag']);
  const disabledByDefault = new Set(['aequivalenz', 'prozesskosten', 'lager', 'kennzahlen', 'investition']);
  const PREF_KEY = 'bwl_topics_enabled';
  const ENABLE_KEY = 'bwl_enabled_topics_v1';
  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (_) { return null; }
  }
  function selected() {
    const prefs = read(PREF_KEY);
    const hasPrefs = !!prefs && typeof prefs === 'object' && !Array.isArray(prefs);
    const enabled = read(ENABLE_KEY);
    const hasEnabled = Array.isArray(enabled);
    // Respect both historical selections, including an explicitly empty list.
    // Reading never rewrites either key or any learning progress.
    return keys.filter(key =>
      (!hasPrefs || prefs[key] !== false) &&
      (!hasEnabled || enabled.includes(key)) &&
      (hasPrefs || hasEnabled || !disabledByDefault.has(key))
    );
  }
  function setEnabled(key, enabled) {
    if (!keys.includes(key)) return;
    const list = new Set(selected());
    if (enabled) list.add(key); else list.delete(key);
    const ordered = keys.filter(item => list.has(item));
    const existing = read(PREF_KEY);
    const prefs = existing && typeof existing === 'object' && !Array.isArray(existing) ? existing : {};
    keys.forEach(item => { prefs[item] = list.has(item); });
    let previousPrefs, previousEnabled;
    try {
      previousPrefs = localStorage.getItem(PREF_KEY);
      previousEnabled = localStorage.getItem(ENABLE_KEY);
      localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
      localStorage.setItem(ENABLE_KEY, JSON.stringify(ordered));
    } catch (_) {
      try {
        if (previousPrefs === null) localStorage.removeItem(PREF_KEY);
        else if (previousPrefs !== undefined) localStorage.setItem(PREF_KEY, previousPrefs);
        if (previousEnabled === null) localStorage.removeItem(ENABLE_KEY);
        else if (previousEnabled !== undefined) localStorage.setItem(ENABLE_KEY, previousEnabled);
      } catch (_) { /* Keep the existing choice if storage is unavailable. */ }
      document.dispatchEvent(new CustomEvent('bwl:storage-error'));
      return;
    }
    document.dispatchEvent(new CustomEvent('bwl:topics-changed'));
  }
  function allowed(key) {
    if (!keys.includes(key)) return false;
    if (area1.includes(key)) return true;
    const progress = window.ensureProg ? window.ensureProg() : { topics: {} };
    return area1.every(item => (progress.topics[item]?.correct || 0) >= 15);
  }
  window.BwlTopics = Object.freeze({ labels, keys, selected, setEnabled, allowed });
  window.getEnabledTopics = selected;
})();
