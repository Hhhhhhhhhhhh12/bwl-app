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

  // Enabled list helper (filters to registered + allowed)
  function enabledRegisteredTopics() {
    const raw = (typeof window.getEnabledTopics === 'function') ? window.getEnabledTopics() : readEnabledTopics();
    return raw.filter(t => topics[t] && topicAllowed(t));
  }
  function firstAvailableTopic() {
    const available = enabledRegisteredTopics();
    return available.find(topic => firstUnawardedLevel(topic) < MAX_LEVELS_PER_TOPIC) || available[0] || null;
  }

  // CSS helper classes to avoid inline styles (CSP safe)
  const HIDDEN_CLS = 'is-hidden';
  function hideEl(el){ if (el && el.classList) el.classList.add(HIDDEN_CLS); }
  function showEl(el){ if (el && el.classList) el.classList.remove(HIDDEN_CLS); }

  const readEnabledTopics = () => window.BwlTopics.selected();
  const topicAllowed = topic => window.BwlTopics.allowed(topic);
  const setTopicEnabled = (topic, enabled) => window.BwlTopics.setEnabled(topic, enabled);

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
  function initInlineTooltips(scope) {
    scope.querySelectorAll('[data-tip], [data-info], [data-i], .i').forEach(el => {
      const text = el.dataset.tip || el.dataset.info || el.dataset.i || el.title;
      if (!text) return;
      el.dataset.tip = text;
      el.setAttribute('aria-label', text);
      el.tabIndex = 0;
    });
  }

  function announce(message) {
    const region = document.getElementById('train-status');
    if (region) region.textContent = message;
  }

  function updateLevelPill() {
    document.dispatchEvent(new CustomEvent('bwl:task-state', { detail: {
      topic: session.topic, index: session.index, difficulty: session.difficulty, max: MAX_LEVELS_PER_TOPIC
    } }));
    const intro = document.getElementById('topic-intro');
    if (intro) intro.textContent = TOPIC_INTRO[session.topic] || 'Wähle ein aktives Thema in den Einstellungen, um loszulegen.';
    const pill = document.getElementById("session-pill");
    if (!pill) return;
    if (!session.topic) { pill.textContent = 'Kein aktives Thema'; return; }
    const current = Math.min(session.index + 1, MAX_LEVELS_PER_TOPIC);
    pill.textContent = `${labelOf(session.topic)} • Stufe ${session.difficulty} • Level ${current}/${MAX_LEVELS_PER_TOPIC}`;
  }

  // ------------------ Shared persisted progress -------------------------
  function ensureProg() { return window.ensureProg(); }
  function getLowestCorrectTopic() {
    // Use the same selected and unlocked topics as dashboard/settings.
    const names = enabledRegisteredTopics();
    const p = ensureProg();
    names.forEach(t => { if (!p.topics[t]) p.topics[t] = { seen: 0, correct: 0 }; });

    let best = session.topic, bestCorrect = Infinity, bestRate = Infinity;
    const unfinished = names.filter(t => firstUnawardedLevel(t) < MAX_LEVELS_PER_TOPIC);
    (unfinished.length ? unfinished : names).forEach(t => {
      const s = p.topics[t];
      const corr = s.correct | 0;
      const rate = s.seen > 0 ? ((s.successfulAttempts ?? s.correct) / s.seen) : 0;
      if (corr < bestCorrect || (corr === bestCorrect && rate < bestRate)) {
        best = t; bestCorrect = corr; bestRate = rate;
      }
    });
    return best || session.topic;
  }

  // ------------------ Public API ----------------------------------------
  function registerTopic(name, makerFn) {
    topics[name] = makerFn;
  }

  let pendingAdvance = null;
  let generation = 0;
  let initialized = false;
  function cancelAdvance() {
    if (pendingAdvance !== null) clearTimeout(pendingAdvance);
    pendingAdvance = null;
    generation++;
  }
  function firstUnawardedLevel(topic) {
    const awarded = ensureProg().topics[topic]?.awarded || {};
    for (let index = 0; index < MAX_LEVELS_PER_TOPIC; index++) {
      if (!awarded[`${topic}_${index}`]) return index;
    }
    return MAX_LEVELS_PER_TOPIC;
  }
  function prime(topic, difficulty) {
    cancelAdvance();
    const candidates = enabledRegisteredTopics();
    session.topic = candidates.includes(topic) ? topic : firstAvailableTopic();
    session.difficulty = Math.max(1, Math.min(4, parseInt(difficulty, 10) || 1));
    session.index = session.topic ? firstUnawardedLevel(session.topic) : 0;
    session.correctStreak = 0;
    clampLevel();
    updateLevelPill();
  }

  // ------------------ Rendering + Wiring --------------------------------
  function renderFinished() {
    const remaining = firstUnawardedLevel(session.topic);
    if (remaining < MAX_LEVELS_PER_TOPIC) {
      session.index = remaining;
      renderTask();
      return;
    }
    updateLevelPill();

    const wrap = document.getElementById("bab-wrapper");
    if (!wrap) return;
    resetTaskSupport();
    document.querySelectorAll('[data-action="check"], [data-action="reveal"], [data-action="next"]').forEach(button => { button.disabled = true; });
    announce(`${labelOf(session.topic)}: Alle Level abgeschlossen.`);
    wrap.innerHTML = `
      <div class="card">
        <h3>Alle Level abgeschlossen</h3>
        <p class="muted">Du hast die ${MAX_LEVELS_PER_TOPIC} Level für dieses Thema erledigt. Wechsle zu einem anderen aktiven Thema.</p>
        <div class="task-controls">
          <button class="btn" id="btn-finish-change">Thema wechseln!</button>
        </div>
        <p class="muted small">Deine gutgeschriebenen Level bleiben gespeichert.</p>
      </div>`;
    const btn = document.getElementById("btn-finish-change");
    if (btn) {
      btn.addEventListener("click", () => {
        const names = enabledRegisteredTopics().filter(t => t !== session.topic);
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
      s.className = 'info-btn info-term';
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
    resetTaskSupport();

    clampLevel();
    if (session.index >= MAX_LEVELS_PER_TOPIC) {
      updateLevelPill();
      renderFinished();
      return;
    }

    if (!enabledRegisteredTopics().includes(session.topic)) prime(firstAvailableTopic(), session.difficulty);
    let out = null;
    const candidates = [session.topic, ...enabledRegisteredTopics().filter(t => t !== session.topic)].filter(Boolean);
    for (const topic of candidates) {
      if (topic !== session.topic) prime(topic, session.difficulty);
      if (session.index >= MAX_LEVELS_PER_TOPIC) continue;
      const maker = topics[session.topic];
      for (let attempt = 0; attempt < 2; attempt++) {
        try { out = typeof maker === 'function' ? maker(session.difficulty, session.index) : null; }
        catch (error) { console.warn('[train] Aufgabe konnte nicht erstellt werden', error); }
        if (out && out.markup) break;
      }
      if (out && out.markup) break;
    }
    if (!out || !out.markup) {
      wrap.innerHTML = '<div class="card"><h3>Keine Aufgabe verfügbar</h3><p>Aktiviere ein verfügbares Thema in den <a href="settings.html">Einstellungen</a>.</p></div>';
      announce('Keine Aufgabe verfügbar. Bitte prüfe die Themenauswahl in den Einstellungen.');
      document.querySelectorAll('[data-action="check"], [data-action="reveal"], [data-action="next"]').forEach(button => { button.disabled = true; });
      return;
    }
    document.querySelectorAll('[data-action="check"], [data-action="reveal"], [data-action="next"]').forEach(button => { button.disabled = false; });
    wrap.innerHTML = out.markup;
    announce(`${labelOf(session.topic)}: Level ${session.index + 1} von ${MAX_LEVELS_PER_TOPIC}.`);
    wrap.querySelectorAll('input[data-answer], select[data-answer]').forEach((field, index) => {
      if (!field.labels?.length && !field.hasAttribute('aria-label') && !field.hasAttribute('aria-labelledby')) {
        const header = field.closest('tr')?.querySelector('th');
        const name = header?.textContent.replace(/\s+/g, ' ').trim();
        field.setAttribute('aria-label', name || `Antwort ${index + 1}`);
      }
      if (field.tagName === 'INPUT' && Number.isFinite(Number(field.dataset.answer))) field.inputMode = 'decimal';
    });

    // Zentrale Glossarbegriffe automatisch markieren
    annotateTerms(wrap);

    // Tooltips für i-Buttons initialisieren
    initInlineTooltips(wrap);

    // Starter-Hinweis ausblenden, Erklärungen verstecken, erstes Feld fokussieren
    const starter = document.getElementById('train-starter');
    hideEl(starter);
    const explanations = [...wrap.querySelectorAll('[data-explain]')];
    explanations.forEach((x, i) => { x.id = `task-explanation-${i}`; hideEl(x); });
    const help = document.getElementById('btn-help');
    if (help) {
      help.disabled = explanations.length === 0;
      help.setAttribute('aria-controls', explanations.map(x => x.id).join(' '));
    }
    const first = wrap.querySelector("input, select, textarea, button");
    if (first && typeof first.focus === "function") first.focus();

    // Prüfen-Button neutralisieren
    try {
      const btn = document.querySelector('[data-action="check"]');
      if (btn) { btn.classList.remove("ok", "err"); btn.disabled = false; }
    } catch { /* noop */ }

    updateLevelPill();
  }

  function resetTaskSupport() {
    const help = document.getElementById('btn-help');
    if (help) { help.disabled = true; help.setAttribute('aria-expanded', 'false'); help.removeAttribute('aria-controls'); }
    const feedback = document.getElementById('task-feedback');
    if (feedback) { feedback.hidden = true; feedback.textContent = ''; }
  }

  function showEquationResult(wrap) {
    wrap.querySelectorAll('[data-equation-result]').forEach(result => {
      result.textContent = result.dataset.equationAnswer;
    });
  }

  function wireControls() {
    const wrap = document.getElementById("bab-wrapper");
    const btnCheck = document.querySelector('[data-action="check"]');
    const btnReveal = document.querySelector('[data-action="reveal"]');
    const btnNext = document.querySelector('[data-action="next"]');
    const btnChange = document.getElementById("btn-change-topic");
    const btnHelp = document.getElementById('btn-help');
    if (btnHelp) btnHelp.addEventListener('click', () => {
      const expanded = btnHelp.getAttribute('aria-expanded') !== 'true';
      wrap.querySelectorAll('[data-explain]').forEach(x => expanded ? showEl(x) : hideEl(x));
      btnHelp.setAttribute('aria-expanded', String(expanded));
    });

    // Prüfen
    if (btnCheck) btnCheck.addEventListener("click", () => {
      if (!wrap || !session.topic || pendingAdvance !== null) return;
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
        // If both separators appear, the last is decimal and earlier ones group digits.
        raw = raw.replace(/'/g, '');
        const lastSep = Math.max(raw.lastIndexOf(','), raw.lastIndexOf('.'));
        if (lastSep > -1) {
          const head = raw.slice(0, lastSep).replace(/[.,]/g, '');
          raw = head + '.' + raw.slice(lastSep + 1);
        }
        // strip percent sign for numeric part
        const pct = /%$/.test(raw);
        raw = raw.replace(/%$/,'');
        const n = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw) ? Number(raw) : NaN;
        return { num: n, raw: s, pct };
      }

      wrap.querySelectorAll('input[data-answer], select[data-answer]').forEach(inp => {
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
        inp.setAttribute('aria-invalid', String(!correct));
      });

      if (!total) return;
      const allCorrect = ok === total;
      const message = allCorrect ? 'Richtig gelöst. Weiter zur nächsten Aufgabe …' : `${ok} von ${total} Antworten richtig. Prüfe die markierten Felder.`;
      const feedback = document.getElementById('task-feedback');
      if (!allCorrect) {
        announce(message);
        if (feedback) { feedback.textContent = message; feedback.hidden = false; }
      }
      if (allCorrect) showEquationResult(wrap);
      // Preserve D's automatic transition to the selected topic with least progress.
      if (allCorrect) {
        const previousPoints = ensureProg().points;
        // 1) Persist result ONCE for current taskId (before index changes)
        try {
          if (typeof window.progMarkResult === 'function') {
            const taskId = `${session.topic}_${session.index}`;
            window.progMarkResult(session.topic, taskId, true);
          }
        } catch {}
        const gained = ensureProg().points - previousPoints;
        const success = gained > 0 ? `Level gelöst! +${gained} XP. Weiter zur nächsten Aufgabe …` : message;
        announce(success);
        if (feedback) { feedback.textContent = success; feedback.hidden = false; }

        // 2) Visual feedback: show explanations, mark button green
        try {
          wrap.querySelectorAll('[data-explain]').forEach(x => showEl(x));
          if (btnCheck) { btnCheck.classList.remove('err'); btnCheck.classList.add('ok'); btnCheck.disabled = true; }
        } catch {}

        // 3) Track the current correct-answer streak.
        session.correctStreak = (session.correctStreak | 0) + 1;

        // 4) After a short pause, clear calc & advance
        const currentGeneration = generation;
        pendingAdvance = setTimeout(() => {
          pendingAdvance = null;
          if (generation !== currentGeneration) return;
          // Rechner leeren beim Themen-/Levelwechsel
          try { if (window.calc && typeof window.calc.clear === 'function') window.calc.clear(); } catch {}

          // Level increment
          session.index = Math.min(session.index + 1, MAX_LEVELS_PER_TOPIC);

          const target = getLowestCorrectTopic();
          if (target !== session.topic) prime(target, session.difficulty);
          else if (session.index >= MAX_LEVELS_PER_TOPIC) session.index = firstUnawardedLevel(session.topic);

          if (session.index >= MAX_LEVELS_PER_TOPIC) {
            renderFinished();
          } else {
            renderTask();
          }

          // Refresh rank/progress UI
          if (typeof window.renderRank === 'function') window.renderRank();
          if (typeof window.renderTopicProgress === 'function') window.renderTopicProgress();
        }, 700);

        return; // stop immediate navigation on correct; handled by timeout
      }

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
        const bad = wrap.querySelector("input.err, select.err");
        const first = wrap.querySelector('input[data-answer], select[data-answer]');
        (bad || first) && (bad || first).focus();
      } catch { /* noop */ }
    });

    // Lösung zeigen
    if (btnReveal) btnReveal.addEventListener("click", () => {
      if (pendingAdvance !== null) return;
      wrap.querySelectorAll('input[data-answer], select[data-answer]').forEach(inp => {
        inp.value = inp.getAttribute("data-answer");
        inp.classList.remove("err"); inp.classList.add("ok");
        inp.setAttribute('aria-invalid', 'false');
      });
      wrap.querySelectorAll('[data-explain]').forEach(x => showEl(x));
      if (btnHelp && !btnHelp.disabled) btnHelp.setAttribute('aria-expanded', 'true');
      showEquationResult(wrap);
      announce('Lösung und Rechenweg angezeigt.');
      if (btnCheck) {
        btnCheck.classList.remove("err");
        btnCheck.classList.add("ok");
      }
    });

    // Nächste
    if (btnNext) btnNext.addEventListener("click", () => {
      cancelAdvance();
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
      cancelAdvance();
      const names = enabledRegisteredTopics().filter(t => t !== session.topic);
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
      if (ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (ev.target.closest && ev.target.closest('button, a, select, summary')) return;
      if (enterLock) return;
      if (ev.key === "Enter") {
        enterLock = true;
        setTimeout(() => enterLock = false, 400);
      } else {
        return;
      }
      if (document.body.dataset.page !== "train") return;

      const target = ev.target;
      // Rechner? Dann nichts tun – calc.js übernimmt
      if (target && typeof target.closest === 'function' && target.closest('#calc-panel')) return;
      // In Textareas kein Prüfen mit Enter
      if (target && (target.tagName === "TEXTAREA" || target.isContentEditable)) return;

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
        const btnSol = btnReveal;
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
        cancelAdvance();
        location.href = 'dashboard.html';
      });
    }

  }

  function init() {
    if (initialized) return;
    initialized = true;
    if (!session.topic) prime(null, 1);
    updateLevelPill();
    renderTask();
    wireControls();
    window.addEventListener('pagehide', cancelAdvance);
    window.addEventListener('storage', event => {
      if (event.key === null || ['bwl_topics_enabled', 'bwl_enabled_topics_v1'].includes(event.key)) {
        prime(session.topic, session.difficulty);
        renderTask();
      }
    });
    document.addEventListener('bwl:topics-changed', () => {
      prime(session.topic, session.difficulty);
      renderTask();
    });
  }

  // Expose
  window.Train = {
    init,
    registerTopic,
    prime,
    MAX_LEVELS_PER_TOPIC,
  };
})();
