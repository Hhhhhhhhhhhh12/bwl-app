/* D dashboard/settings behavior connected to separate HTML pages. */
(function () {
  'use strict';
  let initialized = false;
  function start(topic, difficulty) {
    if (!window.getEnabledTopics().includes(topic) || !window.BwlTopics.allowed(topic)) return;
    const params = new URLSearchParams({ topic, difficulty: String(difficulty || 1) });
    location.href = 'train.html?' + params.toString();
  }
  function refreshSelection() {
    const selected = window.BwlTopics.selected();
    document.querySelectorAll('#topic-prefs input[data-topic]').forEach(input => {
      input.checked = selected.includes(input.dataset.topic);
      // A locked topic may still be selected ahead of its unlock; D's gate remains in training.
      input.title = window.BwlTopics.allowed(input.dataset.topic) ? '' : 'Im Training verfügbar, sobald Bereich 1 abgeschlossen ist.';
    });
    if (window.renderTopicProgress) window.renderTopicProgress();
    if (window.renderDashboardExtras) window.renderDashboardExtras();
    if (document.body.dataset.page === 'achievements' && window.renderAchievements) window.renderAchievements();
  }
  function init() {
    if (initialized) return;
    initialized = true;
    document.querySelectorAll('#topic-prefs input[data-topic]').forEach(input => {
      input.addEventListener('change', () => {
        window.BwlTopics.setEnabled(input.dataset.topic, input.checked);
        refreshSelection();
      });
    });
    document.addEventListener('bwl:topics-changed', refreshSelection);
    window.addEventListener('storage', refreshSelection);
    document.querySelectorAll('[data-start-topic]').forEach(button => {
      button.addEventListener('click', () => start(button.dataset.startTopic, 1));
    });
    const box = document.getElementById('notice-disabled');
    const text = document.getElementById('notice-disabled-text');
    let disabled;
    try { disabled = localStorage.getItem('bwl_last_disabled'); } catch (_) {}
    if (box && text && window.BwlTopics.keys.includes(disabled)) {
      text.textContent = '„' + window.BwlTopics.labels[disabled] + '“ wurde deaktiviert. Du kannst es in den Einstellungen wieder aktivieren.';
      box.hidden = false;
      document.getElementById('btn-notice-close').addEventListener('click', () => {
        box.hidden = true;
        try { localStorage.removeItem('bwl_last_disabled'); } catch (_) {}
      });
    }
    refreshSelection();
  }
  window.BwlNavigation = Object.freeze({ start });
  window.initQuickstart = init;
})();
