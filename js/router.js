// === router.js — Hash-Routing & Nav =================================================
(function(){
  function $(s, r=document){ return r.querySelector(s); }
  function $all(s, r=document){ return Array.from(r.querySelectorAll(s)); }

  // Debouncer for view switches
  let __lastView = '';
  let __lastTs = 0;
  function safeShow(name){
    const now = Date.now();
    if (name === __lastView && (now - __lastTs) < 80) return; // entprellen
    __lastView = name; __lastTs = now;
    try{ showView(name); }catch(_e){}
  }

  function showView(name){
    const views = $all('.view');
    let found = false;
    views.forEach(v=>{
      if(v.dataset.view === name){ v.classList.add('active'); found = true; }
      else { v.classList.remove('active'); }
    });
    const buttons = $all('header nav [data-view]');
    buttons.forEach(b=>{
      if(b.dataset.view === name){ b.setAttribute('aria-current','page'); }
      else { b.removeAttribute('aria-current'); }
    });
    if(!found && views[0]){ views[0].classList.add('active'); }
    toggleByView(name);
    if(name === 'dashboard') showDisabledNoticeIfAny();
  }
  function current(){ return (location.hash||'').replace('#','') || 'dashboard'; }

  function toggleByView(name){
    const VIEWS = ['dashboard','train','achievements'];
    VIEWS.forEach(v => {
      const show = (name === v);
      document.querySelectorAll('.only-' + v).forEach(el => {
        el.hidden = !show;
        el.setAttribute('aria-hidden', String(!show));
      });
    });
  }

  // Hinweis anzeigen, wenn Thema deaktiviert wurde
  const TOPIC_LABELS = {
    break_even:'Break-Even', bab:'BAB', kostenarten:'Kostenarten', abgrenzung:'Abgrenzung',
    kostenstellen:'Kostenstellen', deckungsbeitrag:'Deckungsbeitrag', aequivalenz:'Äquivalenzziffern',
    zuschlag:'Zuschlagskalkulation', prozesskosten:'Prozesskosten', kennzahlen:'Kennzahlen',
    investition:'Investitionsrechnung', lager:'Lagerkennziffern'
  };
  function showDisabledNoticeIfAny(){
    try{
      const key = 'bwl_last_disabled';
      const t = localStorage.getItem(key);
      const box = document.getElementById('notice-disabled');
      const txt = document.getElementById('notice-disabled-text');
      const btn = document.getElementById('btn-notice-close');
      if (!box || !txt) return;
      if (t){
        const label = TOPIC_LABELS[t] || t;
        txt.textContent = `„${label}“ wurde deaktiviert. Du kannst es in den Einstellungen wieder aktivieren.`;
        box.hidden = false;
        if (btn) btn.onclick = () => { box.hidden = true; };
        localStorage.removeItem(key);
      } else {
        box.hidden = true;
      }
    }catch(_e){}
  }

  // Delegation für Header-Navigation
  document.addEventListener('click', function(ev){
    const btn = ev.target.closest && ev.target.closest('header nav [data-view]');
    if(!btn) return;
    ev.preventDefault();
    const name = btn.dataset.view;
    if(!name) return;
    if(location.hash !== '#'+name) location.hash = name;
    // Rendering erfolgt zentral über den hashchange-Listener
  }, true);

  function init(){
    // Initial anzeigen
    try{ 
      safeShow(current()); 
      toggleByView(current());
      console.debug('[Router] Navigated to:', current());
      document.body.classList.add('nav-transition');
      setTimeout(()=> document.body.classList.remove('nav-transition'), 100);
    }catch(e){}
    document.addEventListener('DOMContentLoaded', ()=> {
      safeShow(current());
      toggleByView(current());
      console.debug('[Router] Navigated to:', current());
      document.body.classList.add('nav-transition');
      setTimeout(()=> document.body.classList.remove('nav-transition'), 100);
    });
    window.addEventListener('load', ()=> {
      safeShow(current());
      toggleByView(current());
      console.debug('[Router] Navigated to:', current());
      document.body.classList.add('nav-transition');
      setTimeout(()=> document.body.classList.remove('nav-transition'), 100);
    });
    // Consolidated hashchange listener
    window.addEventListener('hashchange', ()=>{
      safeShow(current());
      ensureTrainStarted();
    });

    // Train-Deep-Link (wenn /#train direkt aufgerufen)
    function ensureTrainStarted(){
      if(window.__trainKick && (Date.now() - window.__trainKick) < 1200) return;
      if(location.hash !== '#train') return;
      // Wenn die Themenauswahl (Tiles) sichtbar ist, NICHT autostarten
      const tiles = document.getElementById('topic-tiles');
      if (tiles && tiles.offsetParent !== null) return;
      const wrap = document.getElementById('bab-wrapper');
      const hasTask = !!(wrap && (wrap.querySelector('input[data-answer]') || wrap.querySelector('table')));
      const nextBtn = document.querySelector('[data-action="next"]');
      if(!hasTask && nextBtn){
        // Nur Sitzungswerte und Pillenlabel vorbereiten; Start via Nutzeraktion
        window.session = window.session || {};
        if(!window.session.topic) window.session.topic = 'deckungsbeitrag';
        var d = parseInt(window.session.difficulty || 1, 10);
        if(!Number.isFinite(d) || d < 1) d = 1; if(d > 4) d = 4;
        window.session.difficulty = d;
        window.session.items = window.session.items || [];
        window.session.index = Number.isFinite(window.session.index) ? window.session.index : 0;
        const pill = document.getElementById('session-pill');
        if(pill){
          const map={
            break_even:'Break-Even-Point',
            bab:'BAB',
            kostenarten:'Kostenarten',
            abgrenzung:'Abgrenzung',
            kostenstellen:'Kostenstellen',
            deckungsbeitrag:'Deckungsbeitrag',
            aequivalenz:'Äquivalenzziffern',
            zuschlag:'Zuschlagskalkulation',
            prozesskosten:'Prozesskosten',
            kennzahlen:'Kennzahlen',
            investition:'Investitionsrechnung',
            lager:'Lagerkennziffern'
          };
          const label = map[window.session.topic]||window.session.topic||'Thema';
          pill.textContent = label + ' • Stufe ' + window.session.difficulty;
        }
        // KEIN auto-Start mehr – Nutzer beginnt über Kachel oder Button
      }
    }
    if(document.readyState==='loading'){
      document.addEventListener('DOMContentLoaded', ()=> setTimeout(ensureTrainStarted,0));
    } else { setTimeout(ensureTrainStarted,0); }
  }

  // Export
  window.initRouter = init;
})();