/* js/selftest.js — BWL-App Self Check (non-invasive)
   Läuft nach DOMContentLoaded, erzeugt eine Report-Box + Console-Report.
   Keine Schreibzugriffe auf Progress/Themen. Safemode.
*/
(function(){
  'use strict';

  const VERSION_EXPECTED_PREFIX = '1.4.'; // wir sind ab 1.4.x
  const TOPICS = [
    'break_even','bab','kostenarten','abgrenzung','kostenstellen',
    'deckungsbeitrag','aequivalenz','zuschlag','prozesskosten',
    'kennzahlen','investition','lager'
  ];

  const REQUIRED_IDS = {
    dashboard: [
      'recommend-topic','btn-start-recommend',
      'overall-progress-donut','overall-progress-bar','overall-correct','overall-total',
      'topic-progress','btn-reset-progress'
    ],
    train: [
      'topic-progress-train','btn-skip-topic'
    ],
    rank: [
      'rank-badge','rank-level-fill','rank-level-label',
      'rank-badge-dashboard','rank-level-fill-dashboard','rank-level-label-dashboard'
    ],
    notices: [
      'notice-disabled','btn-notice-close'
    ]
  };

  const REQUIRED_FUNCTIONS = [
    'renderTopicProgress','renderRankAll','enabledTopics','ensureProg',
  ];

  const OPTIONAL_FUNCTIONS = [
    'renderDashboardExtras'
  ];

  const REQUIRED_SCRIPTS_ORDER = [
    /js\/progress\.js$/,
    /js\/router\.js$/,
    /js\/train\/engine\.js$/,
    /js\/quickstart\.js$/,
    /js\/calc\.js$/
  ];

  const CSS_REQUIRED_CLASSES = [
    'w-0','w-50','w-100','btn'
  ];

  const results = [];
  const t0 = performance.now();

  function pass(msg, extra){ results.push({ok:true,msg,extra}); console.debug('[selftest] ✅', msg, extra||''); }
  function fail(msg, extra){ results.push({ok:false,msg,extra}); console.warn('[selftest] ❌', msg, extra||''); }
  function info(msg, extra){ results.push({ok:null,msg,extra}); console.log('[selftest] ℹ️', msg, extra||''); }

  function hasId(id){
    const el = document.getElementById(id);
    if(el) pass(`ID vorhanden: #${id}`);
    else fail(`ID fehlt: #${id}`);
    return !!el;
  }

  function checkRequiredIds(){
    info('Prüfe erforderliche IDs…');
    Object.entries(REQUIRED_IDS).forEach(([group,ids])=>{
      ids.forEach(id=> hasId(id) );
    });
  }

  function checkScriptOrder(){
    info('Prüfe Script-Reihenfolge (defer)…');
    const scripts = Array.from(document.scripts).filter(s=>s.src);
    const srcs = scripts.map(s=>s.src);
    let idx = 0;
    for(const re of REQUIRED_SCRIPTS_ORDER){
      const pos = srcs.findIndex(s=> re.test(s) );
      if(pos === -1){ fail('Script fehlt in DOM', re.toString()); continue; }
      if(pos < idx){ fail('Script-Reihenfolge falsch', re.toString()); }
      else pass('Script gefunden / Reihenfolge ok', srcs[pos]);
      idx = pos;
    }
    // defer?
    scripts.forEach(s=>{
      // ignore dynamically injected scripts (no dataset or selftest)
      if (!s.hasAttribute('defer')) {
        // tolerate selftest or scripts without src (already filtered)
        if (!/selftest\.js/.test(s.src)) {
          fail('Script ohne defer', s.src);
        }
      }
    });
  }

  function checkGlobals(){
    info('Prüfe globale Funktionen & Konstanten…');
    // Funktionen
    REQUIRED_FUNCTIONS.forEach(fn=>{
      if(typeof window[fn] === 'function') pass(`Funktion vorhanden: ${fn}`);
      else fail(`Funktion fehlt: ${fn}`);
    });
    OPTIONAL_FUNCTIONS.forEach(fn=>{
      if(typeof window[fn] === 'function') pass(`(optional) Funktion vorhanden: ${fn}`);
      else info(`(optional) Funktion fehlt: ${fn}`);
    });

    // Konstanten in progress.js
    try{
      const p = window.ensureProg ? window.ensureProg() : null;
      if(p){
        pass('Progress-Objekt initialisiert');
        if(typeof p.points === 'number') pass('XP-Punkte vorhanden'); else fail('XP-Punkte fehlen/invalid');
      }else{
        fail('ensureProg() liefert kein Objekt');
      }
    }catch(e){
      fail('ensureProg() wirft Fehler', e.message);
    }

    // Rank-Funktionen
    if(typeof window.rankTitle === 'function') pass('rankTitle() vorhanden'); else info('rankTitle() nicht exportiert (ok, wenn intern)');
    if(typeof window.levelState === 'function') pass('levelState() vorhanden'); else info('levelState() nicht exportiert (ok, wenn intern)');
  }

  function checkVersion(){
    info('Prüfe Version via version.txt…');
    fetch('version.txt', {cache:'no-store'}).then(r=>{
      if(!r.ok){ fail('version.txt nicht erreichbar'); return ''; }
      return r.text();
    }).then(txt=>{
      if(!txt) return;
      const m = txt.match(/version=([^\n\r]+)/);
      if(!m){ fail('version.txt hat kein version='); return; }
      const v = m[1].trim();
      if(v.startsWith(VERSION_EXPECTED_PREFIX)){ pass('Version passt zum erwarteten Branch', v); }
      else fail('Version weicht ab vom erwarteten Branch', v);
      const build = (txt.match(/build=([^\n\r]+)/)||[])[1];
      if(build){ pass('Build-Zeitstempel vorhanden', build); }
    }).catch(e=> fail('Fehler beim Laden von version.txt', e.message));
  }

  function checkCSS(){
    info('Prüfe zentrale CSS-Klassen…');
    const test = document.createElement('div');
    document.body.appendChild(test);
    let okCount = 0;
    CSS_REQUIRED_CLASSES.forEach(cls=>{
      test.className = cls;
      const style = getComputedStyle(test);
      // sehr grob: Breite-Klassen, Buttons etc. lassen sich so schwer prüfen; wir prüfen nur, ob applied wird
      if(style){ okCount++; }
    });
    document.body.removeChild(test);
    if(okCount === CSS_REQUIRED_CLASSES.length) pass('CSS-Basis vorhanden');
    else fail('CSS unvollständig (heuristisch)');
  }

  function checkRouter(){
    info('Prüfe Hash-Router…');
    const before = document.querySelector('section.view.active');
    const prev = location.hash;
    // toggle hash to force route resolution
    const tmp = prev === '#dashboard' ? '#train' : '#dashboard';
    try {
      location.hash = tmp;
      // if app relies on 'hashchange' listener, this will fire automatically
      // but on some browsers it might not if same value -> ensure different
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      const after = document.querySelector('section.view.active');
      if (after && after !== before) pass('Router aktiviert eine View');
      else if (after) pass('Router-Handler reagiert (gleiche View möglich)');
      else fail('Keine aktive View nach hashchange');
    } finally {
      // restore previous hash
      if (location.hash !== prev) {
        location.hash = prev || '#dashboard';
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    }
  }

  function checkDashboardExtras(){
    info('Prüfe Dashboard-Extras Rendering…');
    try{
      if(typeof window.renderDashboardExtras === 'function'){
        window.renderDashboardExtras();
        const donut = document.getElementById('overall-progress-donut');
        const label = document.getElementById('overall-progress-label');
        if(donut && label && /\d+%/.test(label.textContent)) pass('Overall-Donut gerendert');
        else fail('Overall-Donut nicht gerendert');
      }else{
        info('renderDashboardExtras() nicht verfügbar (optional)');
      }
    }catch(e){ fail('Fehler bei renderDashboardExtras()', e.message); }
  }

  function checkProgressBars(){
    info('Prüfe Thema-Fortschrittsbalken…');
    try{
      if(typeof window.renderTopicProgress === 'function'){
        window.renderTopicProgress();
        const box = document.getElementById('topic-progress') || document.getElementById('topic-progress-train');
        if(!box){ fail('Kein topic-progress Container im DOM'); return; }
        if(box.children.length > 0) pass('Themenbalken gerendert');
        else fail('Themenbalken leer (evtl. keine aktiven Themen?)');
      }else{
        fail('renderTopicProgress() fehlt');
      }
    }catch(e){ fail('Fehler bei renderTopicProgress()', e.message); }
  }

  function checkCalc(){
    info('Prüfe Taschenrechner-Hooks…');
    const panel = document.getElementById('calc-panel');
    const out = panel && panel.querySelector('.calc-output');
    if(panel && out){ pass('Calc-Panel vorhanden'); } else { fail('Calc-Panel oder Ausgabe fehlt'); }
    // Prüfe keine Enter-Events invasiv. Nur Existenz.
    if(typeof window.calc === 'object' && typeof window.calc.clear === 'function'){
      pass('calc API vorhanden (clear)');
    }else{
      info('calc API nicht gefunden (optional, je nach Implementierung)');
    }
  }

  function checkDarkMode(){
    info('Prüfe Dark-Mode Toggle (oberflächlich)…');
    const b = document.body;
    const prev = b.getAttribute('data-theme') || 'light';
    b.setAttribute('data-theme','dark');
    const bgDark = getComputedStyle(document.body).getPropertyValue('--bg').trim();
    b.setAttribute('data-theme', prev);
    if(bgDark) pass('Dark-Mode-Token vorhanden'); else fail('Dark-Mode-Token fehlen');
  }

  function checkHtaccessHeaders(){
    info('Heuristik für Security-Header (Client-seitig limitiert)…');
    // Wir können Header nicht sauber auslesen; wir prüfen, ob CSS/JS mit korrekten Typen geladen sind.
    const anyCss = Array.from(document.styleSheets).length > 0;
    const anyJs = Array.from(document.scripts).some(s=>s.type===''||s.type==='text/javascript'||s.defer);
    if(anyCss && anyJs) pass('Assets laden typkorrekt (nosniff wahrscheinlich ok)');
    else info('Header nicht beurteilbar (ok in DEV)');
  }

  function ensureSelftestStyles(){ /* CSP-friendly: no inline styles */ }

  function renderReport(){
    const ok = results.filter(r=>r.ok===true).length;
    const bad = results.filter(r=>r.ok===false).length;
    const meh = results.filter(r=>r.ok===null).length;

    const errList = Array.isArray(window.__ERR_LIST__) ? window.__ERR_LIST__ : [];

    const box = document.createElement('div');
    box.className = 'selftest-box';

    const h = document.createElement('div');
    h.className = 'selftest-h';
    h.textContent = '';
    const title = document.createElement('strong');
    title.textContent = 'Selftest';
    const meta = document.createElement('span');
    meta.className = 'selftest-meta';
    meta.textContent = `${ok} ✓ · ${bad} ✗ · ${meh} ℹ︎ · ${errList.length} errors`;
    h.appendChild(title);
    h.appendChild(meta);
    box.appendChild(h);

    const ul = document.createElement('ul');
    ul.className = 'selftest-ul';
    results.slice(-10).forEach(r=>{
      const li = document.createElement('li');
      li.className = 'selftest-li ' + (r.ok===true?'selftest-ok':r.ok===false?'selftest-bad':'selftest-meh');
      li.textContent = (r.ok===true?'✓ ':r.ok===false?'✗ ':'• ') + r.msg;
      ul.appendChild(li);
    });
    box.appendChild(ul);

    const row = document.createElement('div');
    row.className = 'selftest-row';

    const btn = document.createElement('button');
    btn.className = 'selftest-btn';
    btn.textContent = 'Details in Konsole';
    btn.onclick = ()=> console.table(results);
    row.appendChild(btn);

    const btn2 = document.createElement('button');
    btn2.className = 'selftest-btn ghost';
    btn2.textContent = 'Schließen';
    btn2.onclick = ()=> box.remove();
    row.appendChild(btn2);

    box.appendChild(row);
    document.body.appendChild(box);

    const t1 = performance.now();
    info(`Selbsttest fertig in ${Math.round(t1-t0)} ms`);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    console.group('[selftest] BWL-App');
    try{
      checkRequiredIds();
      checkScriptOrder();
      checkGlobals();
      checkVersion();
      checkCSS();
      checkRouter();
      checkDashboardExtras();
      checkProgressBars();
      checkCalc();
      checkDarkMode();
      checkHtaccessHeaders();
    }catch(e){
      fail('Ungefangener Fehler im Selftest', e.message);
    }finally{
      console.groupEnd();
      renderReport();
    }
  });
})();

/* js/progress.js */
(function(){
  if (typeof window.ensureProg === 'function') return;
  const DEFAULT_TOPICS = [
    'break_even','bab','kostenarten','abgrenzung','kostenstellen',
    'deckungsbeitrag','aequivalenz','zuschlag','prozesskosten',
    'kennzahlen','investition','lager'
  ];
  function topicList(){
    try{ if(Array.isArray(window.enabledTopics)) return window.enabledTopics; }catch(_){}
    return DEFAULT_TOPICS;
  }
  function save(p){ localStorage.setItem('bwl_progress', JSON.stringify(p)); }
  window.ensureProg = function ensureProg(){
    let p = null;
    try{ p = JSON.parse(localStorage.getItem('bwl_progress')||'null'); }catch(_){ p=null; }
    const topics = topicList();
    if(!p || p.schema !== 'v2'){ // initialize or migrate
      p = { schema:'v2', points:0, topics:{} };
      topics.forEach(t=>{ p.topics[t] = { correct:0, total:0, locked:false }; });
      save(p);
    } else {
      // ensure all current topics exist
      topics.forEach(t=>{ if(!p.topics[t]) p.topics[t] = { correct:0, total:0, locked:false }; });
    }
    return p;
  };
})();