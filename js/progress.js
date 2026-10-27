/* progress.js — XP, Rang, Fortschritt, Stats (15 Level/Topic) */
(function(){
  'use strict';

  // ------- Constants ---------------------------------------------------------
  const TOPIC_LABELS = {
    break_even: 'Break-Even',
    bab: 'BAB',
    kostenarten: 'Kostenarten',
    abgrenzung: 'Abgrenzung',
    kostenstellen: 'Kostenstellen',
    deckungsbeitrag:'Deckungsbeitrag',
    aequivalenz:'Äquivalenzziffern',
    zuschlag:'Zuschlagskalkulation',
    prozesskosten:'Prozesskosten',
    kennzahlen:'Kennzahlen',
    investition:'Investitionsrechnung',
    lager:'Lagerkennziffern'
  };
  const TOPICS = Object.keys(TOPIC_LABELS);
  // Bereichslogik (Area 1 zuerst freischalten)
  const AREA1_TOPICS = ['deckungsbeitrag','kostenarten','kostenstellen','zuschlag'];
  const AREA2_TOPICS = ['break_even','bab','abgrenzung','aequivalenz','prozesskosten','kennzahlen','investition','lager'];

  // Use Dashboard preferences if available
  function enabledTopics(){
    return window.BwlTopics.selected().filter(window.BwlTopics.allowed);
  }

  window.progEnabledTopics = enabledTopics;
  window.enabledTopics = enabledTopics; // expose for selftest/tools
  const MAX = 15;                 // 15 Level je Thema → Zielgröße
  window.MAX_LEVELS_PER_TOPIC = MAX;
  // XP-Vergabe pro Aufgabe: abhängig von Anzahl Versuche (1. / 2. / 3.+)
  const AWARD_FIRST  = 20;
  const AWARD_SECOND = 14;
  const AWARD_LATER  = 8;
  const STORE_KEY = 'bwl_prog_v2';

  // Rang-Schwellen (Punkte-Gesamt)
  const RANK_STEPS = [0, 50, 200, 400, 700, 1000];
  const RANK_TITLES = ['BWL-Justus','Azubi für IT-Systemmanagement','Controller:in auf Probe','Kostenkiller:in','KLR-Ass','Taschenrechner'];

  // ------- State & Persistence ----------------------------------------------
  function blankTopics(){
    const t = {}; TOPICS.forEach(k => t[k] = { seen:0, correct:0, successfulAttempts:0, correctIds:[], wrongIds:[], awarded:{}, tries:{} });
    return t;
  }
  const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  function count(value) {
    const number = Number(value);
    return Number.isSafeInteger(number) && number >= 0 ? number : 0;
  }
  function normalizeTopic(value) {
    const original = isRecord(value) ? value : {};
    const correct = count(original.correct);
    const seen = Math.max(correct, count(original.seen));
    return {
      ...original, seen, correct,
      // Earlier saves do not distinguish successful attempts from unique levels.
      successfulAttempts: Math.min(seen, Math.max(correct, count(original.successfulAttempts))),
      correctIds: Array.isArray(original.correctIds) ? original.correctIds.filter(id => typeof id === 'string') : [],
      wrongIds: Array.isArray(original.wrongIds) ? original.wrongIds.filter(id => typeof id === 'string') : [],
      awarded: isRecord(original.awarded) ? original.awarded : {},
      tries: isRecord(original.tries) ? original.tries : {},
    };
  }
  function storageWarning() { document.dispatchEvent(new CustomEvent('bwl:storage-error')); }
  function load(){
    let original;
    try { original = JSON.parse(localStorage.getItem(STORE_KEY)); }
    catch (_) { storageWarning(); }
    if (!isRecord(original)) return { points:0, topics:blankTopics(), lastRank:'' };
    const topics = isRecord(original.topics) ? { ...original.topics } : {};
    TOPICS.forEach(key => { topics[key] = normalizeTopic(topics[key]); });
    return { ...original, points:count(original.points), topics, lastRank:typeof original.lastRank === 'string' ? original.lastRank : '' };
  }
  function save(p){
    try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); }
    catch (_) { storageWarning(); }
  }

  function ensureProg(){
    window.prog = window.prog || load();
    return window.prog;
  }
  // expose for selftest/other modules
  window.ensureProg = ensureProg;

  // Public API for other modules (engine/quickstart)
  window.Progress = window.Progress || {};
  window.Progress.getTopic = function(id){
    const p = ensureProg();
    return (p.topics && p.topics[id]) || { seen:0, correct:0, successfulAttempts:0, correctIds:[], wrongIds:[], awarded:{}, tries:{} };
  };
  Object.defineProperty(window.Progress, 'data', { get(){ return ensureProg(); } });
  function label(t){ return TOPIC_LABELS[t] || t; }

  // ------- Rank/Level helpers ----------------------------------------------
  function rankTitle(points){
    for (let i = RANK_STEPS.length - 1; i >= 0; i--) if (points >= RANK_STEPS[i]) return RANK_TITLES[i];
    return RANK_TITLES[0];
  }
  function levelState(points){
    // Prozent bis zum nächsten Rang
    let curIdx = 0;
    for (let i=0;i<RANK_STEPS.length;i++){ if (points >= RANK_STEPS[i]) curIdx = i; }
    const cur  = RANK_STEPS[curIdx];
    const next = RANK_STEPS[Math.min(curIdx+1, RANK_STEPS.length-1)];
    const span = Math.max(1, next - cur);
    const atHighestRank = curIdx === RANK_STEPS.length - 1;
    const into = atHighestRank ? span : Math.max(0, Math.min(points - cur, span));
    const pct  = Math.round(into / span * 100);
    return { curIdx, cur, next, pct, need: Math.max(0, next - points), atHighestRank };
  }
  // expose helpers (read-only)
  window.rankTitle = rankTitle;
  window.levelState = levelState;

  // ------- Awarding / Anti-Double-XP ---------------------------------------
  // Call this once per task result
  function markResult(topic, taskId, correct){
    const p = ensureProg();
    const t = p.topics[topic] || (p.topics[topic] = { seen:0, correct:0, successfulAttempts:0, correctIds:[], wrongIds:[], awarded:{}, tries:{} });

    // Versuche-Map initialisieren und hochzählen
    if (!t.tries) t.tries = {};
    t.tries[taskId] = (t.tries[taskId]||0) + 1;

    t.seen++;
    if (correct) t.successfulAttempts = (t.successfulAttempts || 0) + 1;

    // Award only once pro Task (mit XP nach Versuchen)
    if (correct){
      if (!t.awarded[taskId]){
        t.correct++;
        t.correctIds.push(taskId);
        t.awarded[taskId] = 1;
        const tries = t.tries[taskId] || 1; // 1 = First try
        const gain  = (tries <= 1) ? AWARD_FIRST : (tries === 2 ? AWARD_SECOND : AWARD_LATER);
        p.points += gain;
      }
      // remove from wrongIds if present
      t.wrongIds = t.wrongIds.filter(id => id !== taskId);
    } else {
      if (!t.wrongIds.includes(taskId)) t.wrongIds.push(taskId);
    }

    // Persist immediately
    save(p);

    // Rank animation when rank changes
    try{
      const now = rankTitle(p.points);
      if (p.lastRank && p.lastRank !== now){ animateRankChange(); }
      p.lastRank = now; save(p);
    }catch{}

    // If all 15 done, we do not reset; wrongIds remain for späteres Wiederholen
    document.dispatchEvent(new CustomEvent('bwl:progress-changed'));
    return p;
  }

  function animateRankChange(){
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ids = ['rank-badge','rank-badge-dashboard'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el || !el.animate) return;
      try{
        el.animate([
          { transform:'scale(1)',   offset:0   },
          { transform:'scale(1.12)', offset:.32 },
          { transform:'scale(1)',   offset:1   }
        ], { duration:720, easing:'cubic-bezier(.2,.9,.2,1)' });
      }catch{}
    });
  }

  // Expose to train engine
  window.progMarkResult = markResult;
  window.progNextTaskReward = function (topic, taskId) {
    const current = ensureProg().topics[topic];
    if (current?.awarded?.[taskId]) return 0;
    const tries = current?.tries?.[taskId] || 0;
    return tries === 0 ? AWARD_FIRST : tries === 1 ? AWARD_SECOND : AWARD_LATER;
  };

  // ------- DOM helpers ------------------------------------------------------
  function setText(id, text){ const n = document.getElementById(id); if (n) n.textContent = String(text); }
  function setWidth(id, pct){
    const n = document.getElementById(id); if (!n) return;
    const p = Math.max(0, Math.min(100, pct|0));
    const cls = (n.className || '').replace(/(?:^|\s)w-\d{1,3}(?=\s|$)/g, '').trim();
    n.className = cls; // keep other classes
    n.classList.add('w-' + p);
  }

  // ------- Renders: Rank & Topic progress ----------------------------------
  function renderRankAll(){
    const p = ensureProg();
    const title = rankTitle(p.points);
    const st = levelState(p.points);

    setText('rank-badge', title);
    setWidth('rank-level-fill', st.pct);
    setText('rank-level-label', st.atHighestRank ? 'Höchster Rang erreicht' : `noch ${st.need} XP bis zum nächsten Rang`);

    setText('rank-badge-dashboard', title);
    setWidth('rank-level-fill-dashboard', st.pct);
    setText('rank-level-label-dashboard', st.atHighestRank ? 'Höchster Rang erreicht' : `noch ${st.need} XP bis zum nächsten Rang`);

    const rb = document.getElementById('rank-box');
    if (rb && !rb.dataset.filled){ rb.textContent = `${title} • ${p.points} XP`; rb.dataset.filled='1'; }
  }

  function renderTopicProgress(){
    const p = ensureProg();
    const topics = enabledTopics();
    topics.forEach(t => { if (!p.topics[t]) p.topics[t] = {seen:0, correct:0, correctIds:[], wrongIds:[], awarded:{}}; });

    function row(t){
      const s = p.topics[t];
      const done = Math.min(s.correct | 0, MAX);
      const rate = s.seen > 0 ? Math.round(((s.successfulAttempts ?? s.correct) / s.seen) * 100) : 0;
      const w = Math.round((done / MAX) * 100);
      return `
        <div class="row">
          <span class="label">${label(t)}</span>
          <div class="bar"><i class="w-${w}" id="tp-${t}-fill"></i></div>
          <span class="value">${done}/${MAX} • ${rate}%</span>
        </div>`;
    }

    const html = topics.map(row).join('');
    const block = `<div class="progress">${html}</div>`;
    const dash = document.getElementById('topic-progress'); if (dash) dash.innerHTML = block;
    const train = document.getElementById('topic-progress-train'); if (train) train.innerHTML = block;

    const pb = document.getElementById('progress-box');
    if (pb && !pb.dataset.filled){ pb.innerHTML = block; pb.dataset.filled = '1'; }
  }

  // ------- Dashboard Extras -------------------------------------------------
  function renderDashboardExtras(){
    const p = ensureProg();
    const active = enabledTopics();
    const totalCorrect = active.reduce((a,k)=> a + (p.topics[k]?.correct||0), 0);
    const totalSeen    = active.reduce((a,k)=> a + (p.topics[k]?.seen||0), 0);
    const overallPct   = Math.round(Math.min(100, active.length ? totalCorrect / (active.length*MAX) * 100 : 0));

    // Gesamtfortschritt: Donut + Balken (CSP-safe, Visual helpers)
    const arc   = document.getElementById('overall-progress-arc');
    const label = document.getElementById('overall-progress-label');
    const bar   = document.getElementById('overall-progress-bar');
    if (arc) arc.setAttribute('stroke-dasharray', `${overallPct} 100`);
    if (label) label.textContent = `${overallPct}%`;
    setWidth('overall-progress-bar', overallPct);
    const oc = document.getElementById('overall-correct');
    const ot = document.getElementById('overall-total');
    if (oc) oc.textContent = totalCorrect;
    if (ot) ot.textContent = (active.length * MAX);

    // Empfehlung: Thema mit geringstem Fortschritt
    let weakest = null; let minRate = 101;
    const unfinished = active.filter(t => (p.topics[t]?.correct || 0) < MAX);
    (unfinished.length ? unfinished : active).forEach(t=>{
      const s = p.topics[t] || {correct:0, seen:0};
      const rate = s.seen ? Math.round(((s.successfulAttempts ?? s.correct) / s.seen) * 100) : 0; // Quote statt absolut
      if (rate < minRate){ minRate = rate; weakest = t; }
    });
    const recName = weakest ? (TOPIC_LABELS[weakest] || weakest) : '—';
    const recEl = document.getElementById('recommend-topic');
    if (recEl) recEl.textContent = recName;
    const recBtn = document.getElementById('btn-start-recommend');
    if (recBtn) {
      recBtn.onclick = null;
      if (weakest) {
        recBtn.href = 'train.html?' + new URLSearchParams({ topic: weakest, difficulty: '1' }).toString();
        recBtn.removeAttribute('aria-disabled');
      } else {
        recBtn.removeAttribute('href');
        recBtn.setAttribute('aria-disabled', 'true');
      }
    }

    // Humor-Banner (zufällige absurde Botschaft)
    const lines = [
      'Dein Taschenrechner hat heute schon drei Mal Pi gerülpst.',
      'Der BAB hat angerufen – er vermisst dich!',
      'Kostenartenrechnung träumt nachts von dir.',
      'Du bist 97% effizienter als eine Excel-Tabelle mit Emotionen.',
      'Das KLR-Universum applaudiert leise in Controlling-Dur.'
    ];
    const funny = lines[Math.floor(Math.random()*lines.length)];
    const humor = document.getElementById('humor-line');
    if (humor) humor.textContent = funny;
  }

  // ------- Achievements / Stats --------------------------------------------
  function svgPie(percent, size){
    const r = size/2 - 2; const c = size/2; const circ = 2*Math.PI*r;
    const dash = Math.max(0, Math.min(100, percent)) / 100 * circ;
    return `\n<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">\n  <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--bar-bg)" stroke-width="6"/>\n  <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--bar)" stroke-width="6"\n          stroke-dasharray="${dash.toFixed(2)} ${circ.toFixed(2)}"\n          transform="rotate(-90 ${c} ${c})"/>\n</svg>`;
  }
  function svgBar(value, max, w, h){
    const pct = Math.max(0, Math.min(1, max? (value/max):0));
    const fill = Math.round(pct * w);
    return `\n<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">\n  <rect x="0" y="0" width="${w}" height="${h}" rx="6" ry="6" fill="var(--bar-bg)"/>\n  <rect x="0" y="0" width="${fill}" height="${h}" rx="6" ry="6" fill="var(--bar)"/>\n</svg>`;
  }

  function renderAchievements(){
    const p = ensureProg();
    const ACTIVE = enabledTopics();
    const wrap = document.getElementById('achievements-graphs') || document.getElementById('achievements') || document.querySelector('[data-view="achievements"]');
    if (!wrap) return;

    // Build cards
    const totalCorrect = ACTIVE.reduce((a,k)=> a + (p.topics[k]?.correct||0), 0);
    const totalSeen    = ACTIVE.reduce((a,k)=> a + (p.topics[k]?.seen||0), 0);
    const totalSuccessful = ACTIVE.reduce((sum, key) => sum + (p.topics[key]?.successfulAttempts ?? p.topics[key]?.correct ?? 0), 0);
    const overallRate = totalSeen ? Math.round(totalSuccessful/totalSeen*100) : 0;

    // Donuts per topic (correct/15)
    const donuts = ACTIVE.map(k=>{
      const s = p.topics[k]; const pct = Math.round(Math.min(100, (s.correct||0)/MAX*100));
      return `
        <div class="mini-card donut-row">
          <div class="donut-wrap">${svgPie(pct,56)}</div>
          <div class="donut-info">
            <div class="title-strong">${label(k)}</div>
            <div class="meta">${s.correct|0}/${MAX} • ${s.seen|0} Versuche</div>
          </div>
        </div>`;
    }).join('');

    // Bar: Accuracy per topic
    const bars = ACTIVE.map(k=>{
      const s = p.topics[k];
      const acc = s.seen? Math.round(((s.successfulAttempts ?? s.correct)/s.seen)*100) : 0;
      return `
        <div class="mini-card bar-card">
          <div class="bar-head">
            <strong>${label(k)}</strong>
            <span class="meta">${acc}%</span>
          </div>
          ${svgBar(s.successfulAttempts ?? s.correct, s.seen, 260, 10)}
        </div>`;
    }).join('');

    // Overall summary + rank
    const rankNow = rankTitle(p.points);
    const st = levelState(p.points);
    const head = `
      <div class="card" id="stats-head">
        <h3>Dein Lernprofil</h3>
        <p class="subtle">Abgeschlossene Level: <strong>${totalCorrect}</strong> · Versuche: <strong>${totalSeen}</strong> · Quote: <strong>${overallRate}%</strong></p>
        <div class="progress mt-6">
          <div class="bar"><i id="rank-level-fill-stats" class="w-${st.pct}"></i></div>
          <div class="meta" id="rank-level-label-stats">Rang: <strong>${rankNow}</strong> • ${st.atHighestRank ? 'Höchster Rang erreicht' : `noch ${st.need} XP bis: <strong>${RANK_TITLES[st.curIdx + 1]}</strong>`}</div>
        </div>
      </div>`;

    const left = `<div class="card"><h3>Fortschritt je Thema</h3><div class="grid spaced two-col">${donuts}</div></div>`;
    const right = `<div class="card"><h3>Trefferquote</h3><div class="grid spaced one-col">${bars}</div></div>`;

    wrap.innerHTML = head + left + right;
  }

  // ------- Retry-Queue API --------------------------------------------------
  function getRetryQueue(topic){
    const p = ensureProg();
    const t = p.topics[topic] || { wrongIds:[] };
    return Array.from(new Set(t.wrongIds));
  }
  window.progGetRetryQueue = getRetryQueue;

  // ------- Public API -------------------------------------------------------
  window.renderTopicProgress = renderTopicProgress;
  window.renderRank = renderRankAll;
  window.renderRankAll = renderRankAll; // alias for selftest
  window.renderDashboardExtras = renderDashboardExtras;
  window.renderAchievements = renderAchievements;
  window._progState = ensureProg;
  window.progLabel = label;

  function refreshSavedProgress() {
    window.prog = load();
    renderRankAll();
    renderTopicProgress();
    renderDashboardExtras();
    if (document.body.dataset.page === 'achievements') renderAchievements();
    document.dispatchEvent(new CustomEvent('bwl:topics-changed'));
  }
  window.addEventListener('storage', event => {
    if (event.key === STORE_KEY || event.key === null) refreshSavedProgress();
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) refreshSavedProgress();
  });

  // ------- Boot hooks -------------------------------------------------------
  document.addEventListener('DOMContentLoaded', ()=>{
    try { ensureProg(); renderRankAll(); } catch(e){ console.warn('[progress] rank init', e); }
    try { renderTopicProgress(); } catch(e){ console.warn('[progress] topic init', e); }
    try { renderDashboardExtras(); } catch(e){ console.warn('[progress] dashboard extras', e); }
    // Auto-render achievements when view is opened
    try {
      const go = ()=>{ if (document.body.dataset.page === 'achievements'){ renderAchievements(); } };
      window.addEventListener('hashchange', go); go();
    } catch(e){ console.warn('[progress] achievements init', e); }
    try {
      const refreshDash = ()=>{ if (document.body.dataset.page === 'dashboard'){ renderDashboardExtras(); } };
      window.addEventListener('hashchange', refreshDash);
    }catch(e){}

    // Fortschritt zurücksetzen
    try{
      const btnReset = document.getElementById('btn-reset-progress');
      if (btnReset){
        btnReset.addEventListener('click', ()=>{
          const ok = window.confirm('Fortschritt wirklich zurücksetzen? (Alle XP & Themenstände werden gelöscht)');
          if (!ok) return;
          try { localStorage.removeItem(STORE_KEY); }
          catch (_) { storageWarning(); return; }
          window.prog = load();
          renderRankAll();
          renderTopicProgress();
          renderDashboardExtras();
          // optional: Erfolge neu zeichnen, falls offen
          if (document.body.dataset.page === 'achievements') renderAchievements();
          document.dispatchEvent(new CustomEvent('bwl:topics-changed'));
        });
      }
    }catch(_e){}
  });
})();
