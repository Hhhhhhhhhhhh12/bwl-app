// === calc.js — Tastatur‑Rechner (unten, CSP‑safe: keine Inline‑Styles, kein eval) ===
(function(){
  const PANEL_ID   = 'calc-panel';
  const DISPLAY_ID = 'calc-display';

  // ——— Utilities ---------------------------------------------------------------
  function $(sel, root=document){ return root.querySelector(sel); }
  function setDisplay(v){ const o = document.getElementById(DISPLAY_ID); if(o) o.value = v; }
  function getDisplay(){ const o = document.getElementById(DISPLAY_ID); return o ? o.value : '0'; }
  function formatDe(n){
    const num = Number(n);
    if(!Number.isFinite(num)) return '0';
    try{ return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 10, useGrouping: false }).format(num); }catch(_e){ return String(num); }
  }

  function normalize(expr){
    return String(expr)
      .replace(/,/g,'.')
      .replace(/[×x]/g,'*')
      .replace(/[÷:]/g,'/');
  }
  // Recursive descent keeps unary signs and power precedence explicit.
  function safeEval(expr){
    const s = normalize(expr);
    if(!/^[-+*/().^\d\s]*$/.test(s)) return NaN;
    const tokens = s.match(/(?:\d+(?:\.\d*)?|\.\d+)|[^\s]/g) || [];
    let pos = 0;
    function primary(){
      const token = tokens[pos++];
      if(token === '('){
        const value = sum();
        if(tokens[pos++] !== ')') throw new Error('Missing parenthesis');
        return value;
      }
      if(!token || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) throw new Error('Expected number');
      return Number(token);
    }
    function power(){
      const value = primary();
      if(tokens[pos] === '^') { pos++; return Math.pow(value, unary()); }
      return value;
    }
    function unary(){
      if(tokens[pos] === '+') { pos++; return unary(); }
      if(tokens[pos] === '-') { pos++; return -unary(); }
      return power();
    }
    function product(){
      let value = unary();
      while(tokens[pos] === '*' || tokens[pos] === '/'){
        const op = tokens[pos++], right = unary();
        value = op === '*' ? value * right : (right === 0 ? NaN : value / right);
      }
      return value;
    }
    function sum(){
      let value = product();
      while(tokens[pos] === '+' || tokens[pos] === '-'){
        const op = tokens[pos++], right = product();
        value = op === '+' ? value + right : value - right;
      }
      return value;
    }
    try {
      const result = sum();
      return pos === tokens.length && Number.isFinite(result) ? result : NaN;
    } catch(_e) { return NaN; }
  }

  // ——— Panel creation under task controls -------------------------------------
  function ensurePanel(){
    let panel = document.getElementById(PANEL_ID);
    if(panel) return panel;

    const controls = $('.task-controls');
    panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.className = 'card calc-card';

    // Header row
    const header = document.createElement('div');
    header.className = 'calc-header';
    const title = document.createElement('strong');
    title.textContent = 'Taschenrechner';
    const btnWrap = document.createElement('div');
    btnWrap.className = 'calc-controls';
    const btnClear = document.createElement('button');
    btnClear.type = 'button';
    btnClear.className = 'btn';
    btnClear.setAttribute('data-calc-action','clear');
    btnClear.textContent = 'C';
    btnWrap.appendChild(btnClear);
    header.appendChild(title);
    header.appendChild(btnWrap);

    // Body
    const body = document.createElement('div');
    body.className = 'calc-body';
    const out = document.createElement('input');
    out.id = DISPLAY_ID;
    out.setAttribute('aria-label','Rechenausdruck und Ergebnis');
    out.setAttribute('inputmode','text');
    out.className = 'calc-output';
    out.value = '0';
    const hint = document.createElement('small');
    hint.className = 'muted calc-hint';
    hint.textContent = 'Eingabe über die Tastatur (0–9, + − × ÷ . , ( ) % ^). Enter = Ergebnis, Backspace = löschen.';

    body.appendChild(out);
    body.appendChild(hint);

    panel.appendChild(header);
    panel.appendChild(body);

    const mount = document.getElementById('calc-mount');
    if(mount){
      mount.appendChild(panel);
    } else if(controls && controls.parentNode){
      controls.parentNode.insertBefore(panel, controls.nextElementSibling);
    } else {
      document.body.appendChild(panel);
    }

    // Wire panel buttons
    panel.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-calc-action]');
      if(!btn) return;
      const act = btn.getAttribute('data-calc-action');
      if(act==='clear') setDisplay('0');
    });

    return panel;
  }

  function clearDisplay(){ setDisplay('0'); }
  window.calc = Object.freeze({ clear: clearDisplay, get:getDisplay, set:setDisplay });

  document.addEventListener('DOMContentLoaded', ()=>{ ensurePanel(); });

  // ——— Keyboard handling (voll, aber ohne Fokusklau bei Eingabefeldern) --------
  function onKey(e){
    const panel = document.getElementById(PANEL_ID);
    if (!panel || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const disclosure = panel.closest?.('details');
    if (disclosure && !disclosure.open) return;
    if (e.target.isContentEditable || e.target.tagName === 'SELECT') return;
    if (e.key === 'Enter' && e.target.closest('button, a, summary')) return;

    // Eingabefelder außerhalb des Rechners behalten ihre normale Tastaturbedienung.
    const target = e.target;
    const isTextControl = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
    const inCalc = !!(target && target.closest && target.closest('#'+PANEL_ID));
    if (isTextControl && !inCalc) return;
    // Let the editable display keep normal caret, selection and deletion behavior.
    if (isTextControl && inCalc && e.key !== 'Enter' && e.key !== '%') return;

    const key = e.key;

    if (key === 'Enter'){
      e.preventDefault(); e.stopPropagation(); try{ e.stopImmediatePropagation(); }catch(_e){}
      const expr = getDisplay();
      const res = safeEval(expr);
      if (Number.isFinite(res)) setDisplay(formatDe(res));
      // Ergebnis in aktives Eingabefeld im Trainingsbereich übertragen
      if (Number.isFinite(res)) {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && activeEl.closest('.task-area')) {
          try {
            activeEl.value = formatDe(res);
            activeEl.dispatchEvent(new Event('input', { bubbles: true }));
            activeEl.dispatchEvent(new Event('change', { bubbles: true }));
          } catch(_e) {}
        }
      }
      return;
    }

    if (key === 'Escape'){
      e.preventDefault(); e.stopPropagation(); try{ e.stopImmediatePropagation(); }catch(_e){}
      return;
    }

    if (key === 'Backspace'){
      e.preventDefault(); e.stopPropagation(); try{ e.stopImmediatePropagation(); }catch(_e){}
      const cur = getDisplay();
      setDisplay(cur.length>1 ? cur.slice(0,-1) : '0');
      return;
    }

    // Prozent als /100 (nicht Modulo)
    if (key === '%'){
      e.preventDefault(); e.stopPropagation(); try{ e.stopImmediatePropagation(); }catch(_e){}
      const cur = getDisplay();
      if (isTextControl && inCalc) {
        const start = target.selectionStart ?? cur.length;
        const end = target.selectionEnd ?? start;
        target.setRangeText('/100', start, end, 'end');
      } else setDisplay(cur==='0' ? '0' : cur + '/100');
      return;
    }

    // Zulässige Zeichen
    if (/^[0-9+\-*/().,^×÷:]$/.test(key)){
      e.preventDefault(); e.stopPropagation(); try{ e.stopImmediatePropagation(); }catch(_e){}
      const mapped = key.replace(/[×x]/,'*').replace(/[÷:]/,'/');
      const cur = getDisplay();
      setDisplay(cur==='0' ? mapped : cur + mapped);
    }
  }

  document.addEventListener('keydown', onKey);

  try{ console.debug('[calc] initialisiert'); }catch(_){ }
})();
