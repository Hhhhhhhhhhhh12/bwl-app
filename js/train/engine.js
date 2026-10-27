  function wireDashboardMassToggles(){
    const btnAllOn  = document.getElementById('btn-enable-all');
    const btnAllOff = document.getElementById('btn-disable-all');

    if (btnAllOn){
      btnAllOn.addEventListener('click', ()=>{
        try{
          const ALL = ['break_even','bab','kostenarten','abgrenzung','kostenstellen',
                       'deckungsbeitrag','aequivalenz','zuschlag','prozesskosten',
                       'kennzahlen','investition','lager'];
          writeEnabledTopics(ALL);
          // sync checkboxes
          ALL.forEach(t=>{
            const cb = document.querySelector(`input[type="checkbox"][data-topic="${t}"]`);
            if (cb){ cb.checked = true; cb.setAttribute('aria-checked','true'); }
          });
          if (typeof window.renderTopicProgress === 'function') window.renderTopicProgress();
        }catch(_e){}
      });
    }

    if (btnAllOff){
      btnAllOff.addEventListener('click', ()=>{
        try{
          writeEnabledTopics([]);
          document.querySelectorAll('input[type="checkbox"][data-topic]').forEach(cb=>{
            cb.checked = false; cb.setAttribute('aria-checked','false');
          });
          if (typeof window.renderTopicProgress === 'function') window.renderTopicProgress();
        }catch(_e){}
      });
    }
  }
/* =======================================================================
   Train Engine (modular) — zentrale Steuerung
   Exposes: window.Train
   ======================================================================= */

(function () {
  "use strict";

  const MAX_LEVELS_PER_TOPIC = 15;

  // ------------------ State & Utilities ---------------------------------
  const session = {
    topic: "break_even",
    difficulty: 1,
    index: 0,
    correctStreak: 0, // zählt korrekt beantwortete Aufgaben in Folge
  };

  const topics = Object.create(null); // {name: makerFn(difficulty) -> {markup}}

  // CSS helper classes to avoid inline styles (CSP safe)
  const HIDDEN_CLS = 'is-hidden';
  function hideEl(el){ if (el && el.classList) el.classList.add(HIDDEN_CLS); }
  function showEl(el){ if (el && el.classList) el.classList.remove(HIDDEN_CLS); }

  // ---- Enabled-Topics (Dashboard-Checkboxen) ---------------------------
  const ENABLE_KEY = 'bwl_enabled_topics_v1';
  const DEFAULT_ALL = [
    'break_even','bab','kostenarten','abgrenzung','kostenstellen',
    'deckungsbeitrag','aequivalenz','zuschlag','prozesskosten',
    'kennzahlen','investition','lager'
  ];
  const DEFAULT_DISABLED = new Set(['aequivalenz','prozesskosten','lager','kennzahlen','investition']);

  // === Topic Areas / Gating ==================================================
  const AREA1_TOPICS = ['deckungsbeitrag','kostenarten','kostenstellen','zuschlag'];
  const AREA2_TOPICS = ['break_even','bab','abgrenzung','aequivalenz','prozesskosten','kennzahlen','investition','lager'];

  function isArea1Complete(){
    try{
      const p = ensureProg();
      for (const t of AREA1_TOPICS){
        const s = (p.topics && p.topics[t]) || {correct:0};
        if ((s.correct|0) < MAX_LEVELS_PER_TOPIC) return false;
      }
      return true;
    }catch(_e){ return false; }
  }
  function topicAllowed(topic){
    if (AREA1_TOPICS.includes(topic)) return true;
    return isArea1Complete();
  }

  function readEnabledTopics(){
    try{
      const raw = localStorage.getItem(ENABLE_KEY);
      if (raw){
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length){
          return arr.filter(t => DEFAULT_ALL.includes(t));
        }
      }
    }catch(_e){}
    // Default-Initialisierung: alle außer den temporär deaktivierten
    return DEFAULT_ALL.filter(t => !DEFAULT_DISABLED.has(t));
  }
  function writeEnabledTopics(list){
    try{ localStorage.setItem(ENABLE_KEY, JSON.stringify(list)); }catch(_e){}
  }
  function setTopicEnabled(topic, enabled){
    const cur = new Set(readEnabledTopics());
    if (enabled) cur.add(topic); else cur.delete(topic);
    const out = DEFAULT_ALL.filter(t => cur.has(t));
    writeEnabledTopics(out);
    // UI-Checkbox auf dem Dashboard synchronisieren (falls vorhanden)
    try{
      const cb = document.querySelector(`input[type="checkbox"][data-topic="${topic}"]`);
      if (cb){ cb.checked = !!enabled; cb.setAttribute('aria-checked', String(!!enabled)); }
    }catch(_e){}
  }
  // Exponiere eine getEnabledTopics-API, falls noch nicht vorhanden
  if (typeof window.getEnabledTopics !== 'function'){
    window.getEnabledTopics = () => readEnabledTopics();
  }

  const rnd = (min, max) => {
    min = Math.floor(min); max = Math.floor(max);
    if (max < min) [min, max] = [max, min];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  function clampLevel() {
    if (session.index < 0) session.index = 0;
    if (session.index > MAX_LEVELS_PER_TOPIC) session.index = MAX_LEVELS_PER_TOPIC;
  }

  function labelOf(t) {
    return ({
      break_even: "Break-Even",
      bab: "BAB",
      kostenarten: "Kostenarten",
      abgrenzung: "Abgrenzung",
      kostenstellen: "Kostenstellen",
      stl: "Stufenleiter",
      deckungsbeitrag: "Deckungsbeitrag",
      aequivalenz: "Äquivalenzziffern",
      zuschlag: "Zuschlagskalkulation",
      prozesskosten: "Prozesskosten",
      kennzahlen: "Kennzahlen",
      investition: "Investitionsrechnung",
      lager: "Lagerkennziffern",
    })[t] || t;
  }

  const TOPIC_INTRO = {
    break_even: 'Break‑Even: Ab welcher Absatzmenge decken Erlöse die Gesamtkosten (Fix + variabel)? Kernformel: Fixkosten / (Preis – var. Kosten je Stück).',
    bab: 'BAB: Verteilung der Gemeinkosten auf Kostenstellen und Weiterverrechnung auf Kostenträger — Grundlage sauberer Zuschläge.',
    kostenarten: 'Kostenartenrechnung: Systematische Erfassung aller Kostenarten (z. B. Material, Personal, kalkulatorisch) — WAS ist angefallen?',
    abgrenzung: 'Abgrenzung: Trennung neutraler Aufwände und Ansatz kalkulatorischer Kosten — handelsrechtlich vs. kalkulatorisch.',
    kostenstellen: 'Kostenstellenrechnung: WO fallen Gemeinkosten an? Verteilungsschlüssel/Bezugsgrößen führen zu verursachungsgerechten Sätzen.',
    deckungsbeitrag: 'Deckungsbeitrag & Preisuntergrenzen: DB = Erlös – var. Kosten. Kurzfristige Preisuntergrenze = var. Kosten, langfristige = ges. Kosten.',
    aequivalenz: 'Äquivalenzziffernrechnung: Verteilung von Gesamtkosten auf Variantenfamilien proportional zu Ziffern.',
    zuschlag: 'Zuschlagskalkulation: Gemeinkostenverteilung über Zuschlagssätze (Material, Fertigung, Verw., Vertrieb).',
    prozesskosten: 'Prozesskostenrechnung (light): Gemeinkosten über Prozesse/Prozessmengen verteilen statt Pauschalen.',
    kennzahlen: 'Kennzahlen: Liquidität I–III, Eigenkapitalquote, Cashflow (vereinfacht) zur finanziellen Beurteilung.',
    investition: 'Investitionsrechnung (Amortisation): Rückflusszeit bis zum Break‑Even der Anschaffung, ohne Zinseszins.',
    lager: 'Lagerkennziffern: Umschlagshäufigkeit und durchschnittliche Lagerdauer als Effizienzmaß.'
  };
  function initInlineTooltips(scope){
    const root = scope || document;
    const sel = '[data-tip], [data-info], [data-i], .info-btn';
    const items = root.querySelectorAll(sel);
    if (!items.length) return;

    // Create a single tooltip element without inline styles
    let tip = document.getElementById('bwl-tip');
    if (!tip){
      tip = document.createElement('div');
      tip.id = 'bwl-tip';
      tip.setAttribute('role','tooltip');
      tip.className = 'bwl-tip'; // styled via CSS (no inline style)
      document.body.appendChild(tip);
    }

    // Create/update a dedicated <style> rule for position (CSP safe)
    let tipPos = document.getElementById('bwl-tip-pos');
    if (!tipPos){
      tipPos = document.createElement('style');
      tipPos.id = 'bwl-tip-pos';
      document.head.appendChild(tipPos);
    }
    const pad = 10;
    function place(x, y){
      const mx = Math.max(0, x + pad);
      const my = Math.max(0, y + pad);
      // write absolute position through stylesheet (not inline)
      tipPos.textContent = `#bwl-tip{ left:${mx}px; top:${my}px; }`;
    }

    function showTip(e, el){
      const txt = el.getAttribute('data-tip') || el.getAttribute('data-info') || el.getAttribute('data-i') || el.getAttribute('title') || '—';
      tip.textContent = txt;
      tip.classList.add('is-visible');
      place(e.clientX, e.clientY);
    }
    function hideTip(){ tip.classList.remove('is-visible'); }

    items.forEach(el=>{
      if (el.hasAttribute('title')){ el.setAttribute('data-title', el.getAttribute('title')); el.removeAttribute('title'); }
      el.addEventListener('mouseenter', (e)=> showTip(e, el));
      el.addEventListener('mousemove', (e)=> place(e.clientX, e.clientY));
      el.addEventListener('mouseleave', hideTip);
      el.addEventListener('focus', (e)=> showTip(e, el));
      el.addEventListener('blur', hideTip);
    });
  }

  function updateLevelPill() {
    const pill = document.getElementById("session-pill");
    if (!pill) return;
    const current = Math.min(session.index + 1, MAX_LEVELS_PER_TOPIC);
    pill.textContent = `${labelOf(session.topic)} • Stufe ${session.difficulty} • Level ${current}/${MAX_LEVELS_PER_TOPIC}`;
  }

  // ------------------ Progress helpers (robust, ohne Abhängigkeit) ------
  function ensureProg() {
    window.prog = window.prog || {};
    window.prog.points = window.prog.points || 0;
    window.prog.topics = window.prog.topics || {}; // {topic: {seen, correct}}
    return window.prog;
  }
  function ensureTopicStat(topic) {
    const p = ensureProg();
    p.topics[topic] = p.topics[topic] || { seen: 0, correct: 0 };
    return p.topics[topic];
  }
  function getLowestCorrectTopic() {
    // Use enabled topics from quickstart.js if available
    const enabled = (typeof window.getEnabledTopics === 'function') ? window.getEnabledTopics() : readEnabledTopics();
    const names = enabled.filter(t => topics[t] && topicAllowed(t));
    const p = ensureProg();
    names.forEach(t => { if (!p.topics[t]) p.topics[t] = { seen: 0, correct: 0 }; });

    let best = session.topic, bestCorrect = Infinity, bestRate = Infinity;
    names.forEach(t => {
      const s = p.topics[t];
      const corr = s.correct | 0;
      const rate = s.seen > 0 ? (s.correct / s.seen) : 0;
      if (corr < bestCorrect || (corr === bestCorrect && rate < bestRate)) {
        best = t; bestCorrect = corr; bestRate = rate;
      }
    });
    return best || session.topic;
  }

  function giveXP(points, allCorrect) {
    try {
      const p = ensureProg();
      p.points = (p.points | 0) + (points | 0);
      if (typeof window.renderRank === "function") window.renderRank();
      if (typeof window.save === "function") window.save(p);
      if (allCorrect && typeof window.announce === "function") window.announce("Aufgabe korrekt — +" + points + " XP");
    } catch { /* noop */ }
  }

  // ------------------ Public API ----------------------------------------
  function registerTopic(name, makerFn) {
    topics[name] = makerFn;
  }

  function prime(topic, difficulty) {
    // Gating: if requested topic is not allowed, pick first allowed fallback
    if (topic && !topicAllowed(topic)){
      const enabled = (typeof window.getEnabledTopics === 'function') ? window.getEnabledTopics() : readEnabledTopics();
      const fallbackList = enabled.filter(t => topics[t] && topicAllowed(t));
      topic = fallbackList[0] || AREA1_TOPICS[0] || 'deckungsbeitrag';
    }
    if (topic) session.topic = topic;
    if (difficulty) session.difficulty = Math.max(1, Math.min(4, parseInt(difficulty, 10) || 1));
    session.index = 0;
    clampLevel();
    updateLevelPill();
  }

  // ------------------ Rendering + Wiring --------------------------------
  function renderFinished() {
    const retryQueue = (window.progGetRetryQueue && window.progGetRetryQueue(session.topic)) || [];
    if (retryQueue.length > 0) {
      session.index = 0;
      renderTask();
      return;
    }

    const wrap = document.getElementById("bab-wrapper");
    if (!wrap) return;
    wrap.innerHTML = `
      <div class="card">
        <h3>Alle Level abgeschlossen</h3>
        <p class="muted">Du hast die ${MAX_LEVELS_PER_TOPIC} Level für dieses Thema erledigt. Wechsle das Thema oder starte die Stufe neu.</p>
        <div class="task-controls">
          <button class="btn" id="btn-finish-change">Thema wechseln!</button>
        </div>
        <p class="muted small">Alle falsch beantworteten Aufgaben werden später erneut gestellt.</p>
      </div>`;
    const btn = document.getElementById("btn-finish-change");
    if (btn) {
      btn.addEventListener("click", () => {
        const names = Object.keys(topics).filter(t => t !== session.topic && topicAllowed(t));
        const pick = names.length ? names[rnd(0, names.length - 1)] : session.topic;
        prime(pick, session.difficulty);
        renderTask();
      });
    }
  }

  // Zentrale Glossar‑Texte → automatisch als i‑Buttons markiert
  const GLOSSARY = {
    'pagatorisch': 'pagatorisch = zahlungswirksam, nicht kalkulatorisch',
    'kalkulatorisch': 'kalkulatorisch = rechnerisch angesetzte, nicht zahlungswirksame Kosten',
    'neutraler Aufwand': 'Neutraler Aufwand = betriebsfremd/außerordentlich/periodenfremd, gehört nicht in die KLR',
    'gemeinkosten': 'Gemeinkosten = nicht direkt einem Kostenträger zurechenbar; werden über Schlüssel verteilt',
    'einzelkosten': 'Einzelkosten = direkt und eindeutig einem Kostenträger zurechenbar',
    'deckungsbeitrag': 'Deckungsbeitrag = Erlös – variable Kosten',
    'break-even': 'Break‑Even = Erlöse decken Gesamtkosten (Fix + variabel)',
    'zusatzkosten': 'Zusatzkosten = kalkulatorische Kosten ohne Aufwand (z. B. Unternehmerlohn)',
    'anderskosten': 'Anderskosten = Aufwand in anderer Höhe als Kosten (z. B. Abschreibungen)'
  };

  // Hilfsfunktion: Glossarbegriffe in Textknoten zu <span class="info-btn" data-tip="…">…</span> umwandeln
  function annotateTerms(root){
    if (!root) return;
    const SKIP = new Set(['SCRIPT','STYLE','CODE','PRE','TEXTAREA','INPUT','SELECT','BUTTON']);

    const terms = Object.keys(GLOSSARY);
    if (!terms.length) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const p = node.parentElement;
        if (!p || SKIP.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('.info-btn')) return NodeFilter.FILTER_REJECT;
        const text = node.nodeValue;
        if (!text || !text.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const frags = [];
    let node;
    const makeSpan = (txt, tip)=>{
      const s = document.createElement('span');
      s.className = 'info-btn';
      s.setAttribute('data-tip', tip || '—');
      s.textContent = txt;
      s.tabIndex = 0; // fokusierbar für a11y
      return s;
    };

    while ((node = walker.nextNode())){
      let t = node.nodeValue;
      let changed = false;
      const parent = node.parentNode;
      const df = document.createDocumentFragment();

      // Für jeden Begriff ggf. mehrfach im Text ersetzen (ohne Regex-HTML Tricks)
      // Wir ersetzen iterativ den **ersten** Treffer je Durchlauf, bis keiner mehr übrig ist.
      outer: while (true){
        let bestIdx = -1, bestLen = 0, bestTerm = null;
        for (const term of terms){
          const idx = t.toLowerCase().indexOf(term.toLowerCase());
          if (idx !== -1 && (bestIdx === -1 || idx < bestIdx)){ bestIdx = idx; bestLen = term.length; bestTerm = term; }
        }
        if (bestIdx === -1) break; // nichts mehr zu markieren

        // vor dem Treffer → Textknoten
        if (bestIdx > 0) df.appendChild(document.createTextNode(t.slice(0, bestIdx)));
        const matchTxt = t.slice(bestIdx, bestIdx + bestLen);
        df.appendChild(makeSpan(matchTxt, GLOSSARY[bestTerm]));
        t = t.slice(bestIdx + bestLen);
        changed = true;
      }
      if (changed){
        if (t) df.appendChild(document.createTextNode(t));
        frags.push([parent, node, df]);
      }
    }

    // Apply batched replacements to avoid walker invalidation
    for (const [parent, oldNode, frag] of frags){
      try{ parent.replaceChild(frag, oldNode); }catch(_e){}
    }
  }

  function renderTask() {
    const wrap = document.getElementById("bab-wrapper");
    if (!wrap) return;

    clampLevel();
    if (session.index >= MAX_LEVELS_PER_TOPIC) {
      updateLevelPill();
      renderFinished();
      return;
    }

    const maker = topics[session.topic];
    if (typeof maker !== "function") {
      wrap.innerHTML = `<div class="card"><h3>Fehler</h3><p>Kein Generator für Thema <strong>${session.topic}</strong>.</p></div>`;
      return;
    }

    const out = maker(session.difficulty) || {};
    wrap.innerHTML = out.markup || `<div class="card"><h3>Keine Aufgabe</h3></div>`;

    // Level‑1: fachliche Einordnung oben als Intro-Karte
    if (session.index === 0) {
      const intro = document.createElement('div');
      intro.className = 'mini-card';
      intro.innerHTML = `<strong>Worum geht’s hier?</strong><br><span class="muted">${TOPIC_INTRO[session.topic] || ''}</span>`;
      wrap.prepend(intro);
    }

    // Zentrale Glossarbegriffe automatisch markieren
    annotateTerms(wrap);

    // Tooltips für i-Buttons initialisieren
    initInlineTooltips(wrap);

    // Starter-Hinweis ausblenden, Erklärungen verstecken, erstes Feld fokussieren
    const starter = document.getElementById('train-starter');
    hideEl(starter);
    wrap.querySelectorAll('[data-explain]').forEach(x => hideEl(x));
    const first = wrap.querySelector("input, select, textarea, button");
    if (first && typeof first.focus === "function") first.focus();

    // Prüfen-Button neutralisieren
    try {
      const btn = document.querySelector('[data-action="check"]');
      if (btn) btn.classList.remove("ok", "err");
    } catch { /* noop */ }

    updateLevelPill();
  }

  function wireControls() {
    const wrap = document.getElementById("bab-wrapper");
    const btnCheck = document.querySelector('[data-action="check"]');
    const btnReveal = document.querySelector('[data-action="reveal"]');
    const btnNext = document.querySelector('[data-action="next"]');
    const btnChange = document.getElementById("btn-change-topic");

    // Prüfen
    if (btnCheck) btnCheck.addEventListener("click", () => {
      let total = 0, ok = 0;
      // tolerant parsing: decimal comma/point, thousands, percent off-by-one
      const EPS_NUM = 0.5;   // numeric tolerance
      const EPS_PCT = 1.0;   // percentage: allow ±1 %-Punkt

      function isPercentInput(el){
        const ph = (el.getAttribute('placeholder')||'').trim();
        if (/%/.test(ph)) return true;
        const unit = (el.getAttribute('data-unit')||'').trim();
        if (unit === '%') return true;
        return false;
      }
      function parseFlexible(s){
        if (s == null) return { num: NaN, raw: '' };
        let raw = String(s).trim();
        // remove spaces
        raw = raw.replace(/\s+/g,'');
        // If both separators appear, treat last one as decimal, others as thousand
        const lastSep = Math.max(raw.lastIndexOf(','), raw.lastIndexOf('.'));
        if (lastSep > -1){
          const head = raw.slice(0,lastSep).replace(/[.,]/g,'');
          const tail = raw.slice(lastSep+1);
          raw = head + '.' + tail;
        }
        // If only comma appears
        else if (/,/.test(raw)){
          raw = raw.replace(/,/g,'.');
        }
        // remove thousand groupers like 1'000 (CH)
        raw = raw.replace(/'(?!\d{3}(\D|$))/g, "");
        // strip percent sign for numeric part
        const pct = /%$/.test(raw);
        raw = raw.replace(/%$/,'');
        const n = parseFloat(raw);
        return { num: n, raw: s, pct };
      }

      wrap.querySelectorAll('input[data-answer]').forEach(inp => {
        total++;
        const wantStr = String(inp.getAttribute('data-answer')).trim();
        const gotStr = String(inp.value || '').trim();

        const want = parseFlexible(wantStr);
        const got  = parseFlexible(gotStr);

        let correct;
        if (!Number.isNaN(want.num) && !Number.isNaN(got.num)){
          const isPct = isPercentInput(inp) || want.pct || /%$/.test(wantStr) || /%$/.test(gotStr);
          const eps = isPct ? EPS_PCT : EPS_NUM;
          correct = Math.abs(want.num - got.num) <= eps;
        } else {
          // fallback: case-insensitive exact match (e.g., Textantworten)
          correct = gotStr.toLowerCase() === wantStr.toLowerCase();
        }

        if (correct) { ok++; inp.classList.remove('err'); inp.classList.add('ok'); }
        else { inp.classList.remove('ok'); inp.classList.add('err'); }
      });

      const allCorrect = ok === total && total > 0;
      // Streak-Logik: nach 3 korrekten Antworten Thema mit geringstem Fortschritt laden
      if (allCorrect) {
        // 1) Persist result ONCE for current taskId (before index changes)
        try {
          if (typeof window.progMarkResult === 'function') {
            const taskId = `${session.topic}_${session.index}`;
            window.progMarkResult(session.topic, taskId, true);
          }
        } catch {}

        // 2) Visual feedback: show explanations, mark button green
        try {
          wrap.querySelectorAll('[data-explain]').forEach(x => showEl(x));
          if (btnCheck) { btnCheck.classList.remove('err'); btnCheck.classList.add('ok'); btnCheck.disabled = true; }
        } catch {}

        // 3) Update streak for auto-topic switching after 3 correct
        session.correctStreak = (session.correctStreak | 0) + 1;

        // 4) After a short pause, clear calc & advance
        setTimeout(() => {
          // Rechner leeren beim Themen-/Levelwechsel
          try { if (window.calc && typeof window.calc.clear === 'function') window.calc.clear(); } catch {}

          // Level increment
          session.index = Math.min(session.index + 1, MAX_LEVELS_PER_TOPIC);

          // Zielthema bestimmen (geringster Fortschritt und ggf. Streak-Trigger)
          let target = session.topic;
          if ((session.correctStreak | 0) >= 3) {
            target = getLowestCorrectTopic();
            session.correctStreak = 0; // Streak zurücksetzen nach Wechsel
          } else {
            target = getLowestCorrectTopic();
          }
          if (target !== session.topic) {
            prime(target, session.difficulty);
          }

          if (session.index >= MAX_LEVELS_PER_TOPIC) {
            renderFinished();
          } else {
            renderTask();
          }

          // Re-enable button for next task
          if (btnCheck) btnCheck.disabled = false;

          // Refresh rank/progress UI
          if (typeof window.renderRank === 'function') window.renderRank();
          if (typeof window.renderTopicProgress === 'function') window.renderTopicProgress();
        }, 700);

        return; // stop immediate navigation on correct; handled by timeout
      }

      const base = session.difficulty === 1 ? 10 : 15;
      const partial = total > 0 ? Math.max(1, Math.floor((ok / total) * (session.difficulty === 1 ? 4 : 6))) : 0;
      // giveXP(allCorrect ? base : partial, allCorrect); // removed, replaced by progMarkResult

      if (typeof window.progMarkResult === 'function') {
        const taskId = `${session.topic}_${session.index}`;
        window.progMarkResult(session.topic, taskId, allCorrect);
      }
      if (typeof window.renderRank === "function") window.renderRank();
      if (typeof window.renderTopicProgress === "function") window.renderTopicProgress();

      // Button-Farbe setzen
      if (btnCheck) {
        btnCheck.classList.toggle("ok", allCorrect);
        btnCheck.classList.toggle("err", !allCorrect);
      }

      // Statistik & Persistenz
      // Removed redundant stat tracking here (handled by progress.js)

      // Fokus: erstes falsches Feld, sonst erstes Feld
      try {
        const bad = wrap.querySelector("input.err");
        const first = wrap.querySelector('input[data-answer]');
        (bad || first) && (bad || first).focus();
      } catch { /* noop */ }
    });

    // Lösung zeigen
    if (btnReveal) btnReveal.addEventListener("click", () => {
      wrap.querySelectorAll('input[data-answer]').forEach(inp => {
        inp.value = inp.getAttribute("data-answer");
        inp.classList.remove("err"); inp.classList.add("ok");
      });
      wrap.querySelectorAll('[data-explain]').forEach(x => showEl(x));
      if (btnCheck) {
        btnCheck.classList.remove("err");
        btnCheck.classList.add("ok");
      }
    });

    // Nächste
    if (btnNext) btnNext.addEventListener("click", () => {
      if (session.index + 1 >= MAX_LEVELS_PER_TOPIC) {
        session.index = MAX_LEVELS_PER_TOPIC;
        updateLevelPill();
        renderFinished();
        const c = document.getElementById("btn-change-topic"); c && c.classList.remove("hidden");
        return;
      }
      session.index = Math.min(session.index + 1, MAX_LEVELS_PER_TOPIC);
      updateLevelPill();
      const c = document.getElementById("btn-change-topic"); if ((session.index % 3 === 0) && c) c.classList.remove("hidden");
      if (btnCheck) btnCheck.classList.remove("ok", "err");
      renderTask();
    });

    // Thema wechseln
    if (btnChange) btnChange.addEventListener("click", () => {
      const names = Object.keys(topics).filter(t => t !== session.topic && topicAllowed(t));
      const pick = names.length ? names[rnd(0, names.length - 1)] : session.topic;
      prime(pick, session.difficulty);
      updateLevelPill();
      if (btnCheck) btnCheck.classList.remove("ok", "err");
      renderTask();
    });

    // Enter-Flow (Training):
    // - Wenn Fokus im Rechner → calc.js behandelt Enter.
    // - Wenn Fokus in Aufgaben-Input:
    //     leer  → graues Pulse, NICHT prüfen
    //     befüllt → Lösung anzeigen (statt prüfen)
    // - Sonst: Prüfen
    let enterLock = false;
    document.addEventListener("keydown", (ev) => {
      if (enterLock) return;
      if (ev.key === "Enter") {
        enterLock = true;
        setTimeout(() => enterLock = false, 400);
      } else {
        return;
      }
      if ((location.hash || "#dashboard") !== "#train") return;

      const target = ev.target;
      // Rechner? Dann nichts tun – calc.js übernimmt
      if (target && typeof target.closest === 'function' && target.closest('#calc-panel')) return;
      // In Textareas kein Prüfen mit Enter
      if (target && target.tagName === "TEXTAREA") return;

      const active = document.activeElement;
      const inTaskInput = !!(active && active.tagName === 'INPUT' && active.closest && active.closest('#bab-wrapper'));

      if (inTaskInput){
        const val = (active.value||'').trim();
        if (!val){
          // leer → kurz grau pulsieren
          active.classList.add('hint');
          setTimeout(()=> active && active.classList && active.classList.remove('hint'), 180);
          ev.preventDefault();
          ev.stopPropagation();
          return;
        }
        // Nicht leer → Lösung anzeigen statt prüfen
        const btnSol = wrap.querySelector('[data-action="solution"], [data-action="show-solution"], [data-action="reveal"]');
        if (btnSol){
          ev.preventDefault(); ev.stopPropagation();
          btnSol.click();
          return;
        }
      }

      // Default: Prüfen (nur wenn vorhanden)
      if (btnCheck) {
        ev.preventDefault();
        btnCheck.click();
      }
    }, true);

    // Skip-Topic Button → aktuelles Thema deaktivieren und zurück zum Dashboard
    const btnSkip = document.getElementById('btn-skip-topic');
    if (btnSkip){
      btnSkip.addEventListener('click', (e)=>{
        e.preventDefault();
        try{
          setTopicEnabled(session.topic, false);
          localStorage.setItem('bwl_last_disabled', session.topic);
        }catch(_e){}
        location.hash = '#dashboard';
      });
    }

    // Sicherstellen: Dashboard-only Elemente im Training unsichtbar
    if ((location.hash||'#dashboard') === '#train'){
      document.querySelectorAll('.only-dashboard').forEach(hideEl);
    }
  }

  function init() {
    // Stelle sicher, dass ENABLE_KEY initialisiert ist
    try{
      if (!localStorage.getItem(ENABLE_KEY)){
        writeEnabledTopics(readEnabledTopics());
      }
    }catch(_e){}
    try{ wireDashboardMassToggles(); }catch(_e){}
    updateLevelPill();
    renderTask();
    wireControls();
  }

  // Expose
  window.Train = {
    init,
    registerTopic,
    prime,
    MAX_LEVELS_PER_TOPIC,
  };
})();