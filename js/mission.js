/* Read-only presentation of the existing task slots and saved points. */
(function () {
  'use strict';
  let task = null;

  function render() {
    const progress = window.ensureProg();
    const xp = document.getElementById('mission-total-xp');
    if (xp) xp.textContent = String(progress.points);
    const route = document.getElementById('mission-route');
    if (!route) return;
    route.hidden = !task?.topic;
    const hero = document.querySelector('.mission-hero');
    if (hero) hero.dataset.level = task?.topic ? String(Math.min(task.index + 1, task.max)).padStart(2, '0') : '–';
    const reward = document.getElementById('mission-reward-text');
    if (!task?.topic) { if (reward) reward.textContent = ''; return; }

    const title = window.BwlTopics.labels[task.topic];
    document.getElementById('mission-topic-label').textContent = title;
    const map = document.getElementById('mission-level-map');
    map.setAttribute('aria-label', `${title}: ${task.max} Aufgabenlevel`);
    const awarded = progress.topics[task.topic]?.awarded || {};
    let completed = 0;
    const fragment = document.createDocumentFragment();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('mission-map-lines');
    svg.setAttribute('viewBox', '0 0 300 235');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    const points = [];
    for (let index = 0; index < task.max; index++) {
      const row = Math.floor(index / 3);
      const column = row % 2 === 0 ? index % 3 : 2 - index % 3;
      points.push(`${50 + column * 100},${17.5 + row * 50}`);
      const complete = !!awarded[`${task.topic}_${index}`];
      if (complete) completed++;
      const level = document.createElement('li');
      level.className = `mission-level mission-col-${column + 1} mission-row-${row + 1}`;
      level.dataset.complete = String(complete);
      level.dataset.level = String(index + 1);
      level.setAttribute('aria-label', `Level ${index + 1}${complete ? ', gelöst' : ''}`);
      if (index === task.index) level.setAttribute('aria-current', 'step');
      const mark = document.createElement('span');
      mark.className = 'mission-node-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = complete ? '✓' : String(index + 1).padStart(2, '0');
      level.appendChild(mark);
      fragment.appendChild(level);
    }
    line.setAttribute('points', points.join(' '));
    svg.appendChild(line);
    fragment.prepend(svg);
    map.replaceChildren(fragment);
    document.getElementById('mission-level-summary').textContent = `${completed} von ${task.max} Leveln gelöst`;
    if (reward) {
      const amount = task.index < task.max ? window.progNextTaskReward(task.topic, `${task.topic}_${task.index}`) : 0;
      reward.textContent = amount ? `+${amount} XP beim Lösen` : 'Bereits gutgeschrieben';
    }
  }

  document.addEventListener('bwl:task-state', event => {
    task = event.detail;
    render();
  });
  document.addEventListener('bwl:progress-changed', render);
  document.addEventListener('bwl:topics-changed', render);
  document.addEventListener('DOMContentLoaded', render);
})();
