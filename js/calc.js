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
    try{ return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 10 }).format(num); }catch(_e){ return String(num); }
  }

  function normalize(expr){
    return String(expr)
      .replace(/,/g,'.')
      .replace(/[×x]/g,'*')
      .replace(/[÷:]/g,'/')
      .replace(/\^/g,'**');
  }
  // Shunting‑Yard Parser (safe): supports + - * / ( ) and ^ mapped to ** precedence
  function safeEval(expr){
    const s = normalize(expr);
    // allow digits, ops, dot, spaces and parentheses only
    if(!/^[-+*/().^\d\s]*$/.test(s)) return NaN;

    // Tokenize
    const tokens = [];
    let i=0; const n=s.length;
    while(i<n){
      const ch = s[i];
      if(ch===' '){ i++; continue; }
      if(/[0-9.]/.test(ch)){
        let j=i+1;
        while(j<n && /[0-9.]/.test(s[j])) j++;
        tokens.push({t:'num', v: parseFloat(s.slice(i,j))});
        i=j; continue;
      }
      if(/[+\-*/^()]/.test(ch)){
        tokens.push({t:'op', v: ch}); i++; continue;
      }
      return NaN; // illegal char
    }

    // Shunting Yard → RPN
    const prec = { '^':4, '*':3, '/':3, '+':2, '-':2 };
    const rightAssoc = { '^': true };
    const out = []; const stack = [];
    for(const tk of tokens){
      if(tk.t==='num'){ out.push(tk); continue; }
      const op = tk.v;
      if(op==='('){ stack.push(op); continue; }
      if(op===')'){
        while(stack.length && stack[stack.length-1] !== '('){ out.push({t:'op', v: stack.pop()}); }
        if(!stack.length) return NaN; // mismatched
        stack.pop(); // remove '('
        continue;
      }
      // operator
      while(stack.length){
        const top = stack[stack.length-1];
        if(top==='(') break;
        const pTop = prec[top]||0, pOp = prec[op]||0;
        if( (rightAssoc[op] && pOp < pTop) || (!rightAssoc[op] && pOp <= pTop) ){
          out.push({t:'op', v: stack.pop()});
        } else break;
      }
      stack.push(op);
    }
    while(stack.length){
      const x = stack.pop();
      if(x==='('||x===')') return NaN;
      out.push({t:'op', v:x});
    }

    // Evaluate RPN
    const st = [];
    for(const tk of out){
      if(tk.t==='num'){ st.push(tk.v); continue; }
      const b = st.pop(); const a = st.pop();
      if(a===undefined || b===undefined) return NaN;
      let r;
      switch(tk.v){
        case '+': r = a + b; break;
        case '-': r = a - b; break;
        case '*': r = a * b; break;
        case '/': r = b===0 ? NaN : a / b; break;
        case '^': r = Math.pow(a, b); break;
        default: return NaN;
      }
      st.push(r);
    }
    return (st.length===1 && Number.isFinite(st[0])) ? st[0] : NaN;
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
    out.setAttribute('aria-label','Rechenergebnis');
    out.setAttribute('inputmode','numeric');
    out.className = 'calc-output';
    out.readOnly = true;
    out.value = '0';
    const hint = document.createElement('small');
    hint.className = 'muted calc-hint';
    hint.textContent = 'Eingabe über die Tastatur (0–9, + − × ÷ . , ( ) % ^). Enter = Ergebnis, Backspace = löschen.';

    body.appendChild(out);
    body.appendChild(hint);

    panel.appendChild(header);
    panel.appendChild(body);

    if(controls && controls.parentNode){
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
    if (!panel) return; // only act if panel exists

    // Wenn der Fokus im Lösungsbereich liegt (Trainings‑Eingabefeld), NICHT abfangen
    const target = e.target;
    const isTextControl = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
    const inTaskField = !!(isTextControl && target.closest && target.closest('.task-area'));
    const inCalc = !!(target && target.closest && target.closest('#'+PANEL_ID));
    if (inTaskField && !inCalc) return;

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
      setDisplay(cur==='0' ? '1/100' : cur + '/100');
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