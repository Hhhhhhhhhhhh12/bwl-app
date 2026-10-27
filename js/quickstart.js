// === quickstart.js — Dashboard/Train Quickstart- & Empfehlungs-Start ======
(function(){
  console.debug('[Quickstart] Modul initialisiert, Version 1.4.1');
  function $(sel, root=document){ return root.querySelector(sel); }

  // ——— Label-Mapping
  const TOPIC_LABEL = {
    break_even: 'Break‑Even',
    bab: 'BAB',
    kostenarten: 'Kostenarten',
    abgrenzung: 'Abgrenzung',
    kostenstellen: 'Kostenstellen',
    deckungsbeitrag: 'Deckungsbeitrag',
    aequivalenz: 'Äquivalenzziffern',
    zuschlag: 'Zuschlagskalkulation',
    prozesskosten: 'Prozesskosten',
    kennzahlen: 'Kennzahlen',
    investition: 'Investitionsrechnung',
    lager: 'Lagerkennziffern'
  };

  const TOPIC_DESC = {
    break_even: 'Fixkosten, variable Kosten, Break-Even-Point.',
    bab: 'Kostenstellen auf Basis eines Betriebsabrechnungsbogens.',
    kostenarten: 'Systematische Erfassung der Kostenarten.',
    abgrenzung: 'Neutraler Aufwand, kalkulatorische Kosten.',
    kostenstellen: 'Gemeinkostenverteilung auf Stellen.',
    deckungsbeitrag: 'Kurzfristige und langfristige Preisuntergrenzen.',
    aequivalenz: 'Gewichtung nach Äquivalenzziffern für Produktfamilien.',
    zuschlag: 'Zuschlagskalkulation – ein- und mehrstufig.',
    prozesskosten: 'Verursachungsgerechte Kostenzuordnung durch Prozesse.',
    kennzahlen: 'Liquidität, Rentabilität, Eigenkapitalquote.',
    investition: 'Amortisation und Kapitalrückflusszeiten.',
    lager: 'Lagerumschlag, Lagerdauer und Effizienzbewertung.'
  };

  // === Topic Gating (Bereich 1 / Bereich 2) =============================
  const AREA1_TOPICS = ['deckungsbeitrag','kostenarten','kostenstellen','zuschlag'];
  const AREA2_TOPICS = ['break_even','bab','abgrenzung','aequivalenz','prozesskosten','kennzahlen','investition','lager'];

  function isArea1Complete(){
    try {
      const prog = (typeof ensureProg === 'function') ? ensureProg() : (window.Progress && window.Progress.data);
      if(!prog || !prog.topics) return false;
      for (const t of AREA1_TOPICS){
        const s = prog.topics[t] || { correct:0 };
        if ((s.correct||0) < (window.MAX_LEVELS_PER_TOPIC || 15)) return false;
      }
      return true;
    } catch(_e){ return false; }
  }

  function topicAllowed(topic){
    if (AREA1_TOPICS.includes(topic)) return true;
    return isArea1Complete();
  }

  // --- LocalStorage helper for topic preferences
  const PREF_KEY = 'bwl_topics_enabled';
  function loadPrefs(){
    try{ return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; }catch(_){ return {}; }
  }
  function savePrefs(obj){
    try{ localStorage.setItem(PREF_KEY, JSON.stringify(obj)); }catch(_e){}
  }
  window.getEnabledTopics = function(){
    const prefs = loadPrefs();
    return topicKeys().filter(k => prefs[k] !== false);
  };

  // ——— Helper: Topicschlüssel, Stats, Empfehlung
  function topicKeys(){
    // __TOPICS kann Array oder Objekt sein; fallback auf fixe Liste
    try{
      if (Array.isArray(__TOPICS)) return __TOPICS.slice();
      if (typeof __TOPICS === 'object' && __TOPICS) return Object.keys(__TOPICS);
    }catch(_){}
    return ['break_even','bab','kostenarten','abgrenzung','kostenstellen'];
  }

  function getStats(key){
    try{ return ensureTopic(key); }catch(_e){ return { seen:0, correct:0, points:0 }; }
  }

  function recommend(){
    var keys = topicKeys().filter(k => topicAllowed(k));
    if(!keys || !keys.length){ return { topic: 'break_even', diff: 1 }; }
    // Kriterium: niedrigste Erfahrung (seen), bei Gleichstand niedrigere Trefferquote
    const ranked = keys.map(function(k){
      const s = getStats(k);
      const seen = s.seen||0;
      const pct = seen ? (s.correct||0)/seen : 0;
      return { key:k, seen:seen, pct:pct };
    }).sort(function(a,b){
      return (a.seen - b.seen) || (a.pct - b.pct);
    });
    const pick = ranked[0] || { key:'break_even', seen:0 };
    // Grobe Stufenableitung: alle 3 Aufgaben eine Stufe; min 1, max 4
    const diff = Math.max(1, Math.min(4, Math.floor((pick.seen||0)/3)+1));
    return { topic: pick.key, diff: diff };
  }

  function label(rec){
    const t = TOPIC_LABEL[rec.topic] || rec.topic;
    return t + ' • Stufe ' + rec.diff;
  }

  function renderReco(){
    var el = $('#reco-label');
    if(!el) return;
    var r = recommend();
    el.textContent = 'Empfohlen: ' + label(r);
  }

  // ——— Session primen & robust starten
  function primeSession(topic, diff){
    window.session = window.session || {};
    window.session.topic = topic || 'break_even';
    var d = parseInt(diff || 1, 10);
    if(!Number.isFinite(d) || d < 1) d = 1;
    if(d > 4) d = 4;
    window.session.difficulty = d;
    window.session.items = [];
    window.session.index = 0;
  }

  // ——— Robust waiter for Next-Button
  function waitForNextAndClick(timeoutMs){
    var t = typeof timeoutMs === 'number' ? timeoutMs : 800;
    var start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    (function tick(){
      var nextBtn = document.querySelector('[data-action="next"]');
      if (nextBtn){ nextBtn.click(); return; }
      var now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      if (now - start < t){ requestAnimationFrame(tick); }
      else { try{ console.warn('[Quickstart] Next-Button nicht gefunden (timeout).'); }catch(_e){} }
    })();
  }

  function goTrainAndStart(topic, diff){
    if (window.__goTrainAndStartRobust) {
      window.__goTrainAndStartRobust(topic, diff);
      return;
    }
    primeSession(topic, diff);
    if (location.hash !== '#train') location.hash = '#train';
    // Warten, bis die Train-View gerendert ist, dann "Nächste" klicken
    waitForNextAndClick(900);
  }

  // ——— Init
  function init(){
    // --- Pref-Checkboxes ---
    const prefs = loadPrefs();
    document.querySelectorAll('#topic-prefs input[type="checkbox"]').forEach(cb => {
      const t = cb.dataset.topic;
      if (!topicAllowed(t)) {
        cb.checked = false;
        cb.disabled = true;
        cb.title = 'Wird freigeschaltet, sobald Bereich 1 komplett ist.';
      }
      if(prefs[t] === false) cb.checked = false;
      cb.addEventListener('change', ()=>{
        prefs[t] = cb.checked;
        savePrefs(prefs);
        console.debug('[Prefs]', prefs);
      });
    });

    // --- Topic tiles ---
    document.querySelectorAll('#topic-tiles [data-start-topic]').forEach(btn => {
      btn.addEventListener('click', ()=>{
        const topic = btn.dataset.startTopic;
        const enabled = loadPrefs()[topic] !== false;
        if (!topicAllowed(topic)) {
          alert('Dieses Thema ist noch gesperrt. Bereich 2 wird frei, sobald Bereich 1 komplett ist.');
          return;
        }
        if(!enabled){
          alert('Dieses Thema ist deaktiviert. Aktiviere es zuerst in den Einstellungen.');
          return;
        }
        goTrainAndStart(topic, 1);
      });
    });

    document.querySelectorAll('#topic-tiles [data-start-topic]').forEach(btn=>{
      const t = btn.dataset.startTopic;
      const icon = btn.dataset.icon || '📘';
      const label = TOPIC_LABEL[t] || t;
      if(!btn.querySelector('.icon')){
        const span = document.createElement('span');
        span.className = 'icon';
        span.textContent = icon + ' ';
        btn.prepend(span);
      }
      btn.title = TOPIC_DESC[t] || ('Lerneinheit: ' + label);
    });

    // Empfehlung rendern
    renderReco();
    document.addEventListener('bwl:checked', renderReco);
    window.addEventListener('storage', renderReco);

    console.debug('[Quickstart] Tiles und Checkboxen aktiv.');
  }

  window.initQuickstart = init;
})();

/*
Style-Tipp:
#topic-tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
#topic-tiles button {
  padding: 1rem;
  border-radius: 10px;
  transition: transform .1s ease, background .2s ease;
}
#topic-tiles button:hover {
  transform: translateY(-2px);
  background: var(--card-hover);
}
*/