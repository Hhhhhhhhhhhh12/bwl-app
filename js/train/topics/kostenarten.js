/* =========================================================================
   Topic: Kostenarten — liefert { markup } abhängig von difficulty (1..4)
   Registrierung: window.Train.registerTopic('kostenarten', maker)
   ========================================================================= */
(function(){
  'use strict';
  const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const pick=a=>a[rnd(0,a.length-1)];
  const html=(s,...v)=>s.reduce((o,c,i)=>o+c+(i<v.length?String(v[i]):''),'');
  const info=t=>` <span class="i" title="${t}">i</span>`;

  function makeEasy(){
    const varStk = rnd(2,10);
    const menge  = rnd(5,20);
    const gesamt = varStk*menge;
    const markup = html`
      <div class="card">
        <h3>Kostenarten — Einsteiger</h3>
        <p>Variable Kosten je Stück: <strong>${varStk} €</strong> · Menge: <strong>${menge}</strong></p>
        <table class="bab-table"><tbody>
          <tr>
            <th>Gesamtkosten${info('Variable/Stück × Menge')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${gesamt}"></td>
            <td class="muted">€</td>
          </tr>
        </tbody></table>
        <div class="explain muted" data-explain="1" style="display:none;margin-top:.5rem">
          Rechenweg: <strong>${varStk} × ${menge} = ${gesamt} €</strong>.
        </div>
      </div>`;
    return {markup};
  }

  function makeNormal(){
    const varStk = rnd(2,10);
    const menge  = pick([10,12,15,20,25,30,40]);
    const fixProStk = pick([0,1,2,3,4,5]);
    const fix   = fixProStk*menge; // glatte Durchschnittskosten
    const gesamt= fix + varStk*menge;
    const avg   = gesamt/menge;
    const markup = html`
      <div class="card">
        <h3>Kostenarten — Aufgabe</h3>
        <p>Fixe Kosten: <strong>${fix} €</strong>, variable/Stück: <strong>${varStk} €</strong>, Menge: <strong>${menge}</strong></p>
        <table class="bab-table"><tbody>
          <tr><th>Gesamtkosten${info('Fix + (var/Stück × Menge)')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${gesamt}"></td><td class="muted">€</td></tr>
          <tr><th>Durchschnittskosten/Stück${info('Gesamtkosten ÷ Menge')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${avg}"></td><td class="muted">€</td></tr>
        </tbody></table>
        <div class="explain muted" data-explain="1" style="display:none;margin-top:.5rem">
          GK = <strong>${fix} + (${varStk} × ${menge}) = ${gesamt} €</strong>; Ø/Stück = <strong>${gesamt} ÷ ${menge} = ${avg} €</strong>.
        </div>
      </div>`;
    return {markup};
  }

  function maker(d){ return (d|0)===1 ? makeEasy() : makeNormal(); }

  if (window.Train?.registerTopic) {
    window.Train.registerTopic('kostenarten', maker);
  } else {
    window.addEventListener('DOMContentLoaded', ()=> window.Train?.registerTopic?.('kostenarten', maker));
  }
})();