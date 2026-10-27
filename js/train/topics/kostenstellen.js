/* =========================================================================
   Topic: Kostenstellen — liefert { markup } abhängig von difficulty (1..4)
   Registrierung: window.Train.registerTopic('kostenstellen', maker)
   ========================================================================= */
(function(){
  'use strict';

  const rnd  = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
  const pick = (arr) => arr[rnd(0, arr.length-1)];
  const html = (s,...v)=>s.reduce((o,chunk,i)=>o+chunk+(i<v.length?String(v[i]):''),'');
  const info = (t)=>` <span class="i" title="${t}">i</span>`;

  function makeEasy(){
    const gk = rnd(1000, 4000);     // Gemeinkosten
    const b  = rnd(10, 50);         // Verteilungsschlüssel (z. B. Maschinenstunden)
    const satz = Math.round((gk / b) * 100); // %
    const markup = html`
      <div class="card">
        <h3>Kostenstellen — Einsteiger</h3>
        <p>Gemeinkosten (GK)${info('Kosten, die nicht direkt zuordenbar sind')}: <strong>${gk} €</strong> · Verteilungsschlüssel (V)${info('z. B. Maschinenstunden oder Flächenanteile')}: <strong>${b}</strong></p>
        <table class="bab-table"><tbody>
          <tr>
            <th>Zuschlagssatz${info('GK ÷ Verteilungsschlüssel × 100')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${satz}"></td>
            <td class="muted">%</td>
          </tr>
        </tbody></table>
        <div class="explain muted is-hidden" data-explain="1">
          Rechenweg: <strong>${gk} ÷ ${b} × 100 ≈ ${satz}%</strong>.
        </div>
      </div>`;
    return { markup };
  }

  function makeNormal(){
    // Wähle kopfrechenfreundliche Werte
    const b = pick([50, 60, 80, 100, 120, 150]);
    const gkProE = pick([2, 3, 4, 5]); // € je Einheit
    const gk = gkProE * b;             // exakt teilbar
    const a = pick([20, 25, 30, 40, 50, 60]);
    const gkAuftrag = gkProE * a;      // glatt
    const zuschlag = Math.round((gk / b) * 100); // = gkProE*100 (%-Satz)

    const markup = html`
      <div class="card">
        <h3>Kostenstellen — Aufgabe</h3>
        <p>Gegeben: Gemeinkosten (GK)${info('Nicht direkt zuordenbare Kosten')}: <strong>${gk} €</strong>, Verteilungsschlüssel (V)${info('z. B. Maschinenstunden oder Flächenanteile')}: <strong>${b}</strong>, Auftragsmenge A${info('Menge, auf die verrechnet wird')}: <strong>${a}</strong>.</p>
        <table class="bab-table"><tbody>
          <tr>
            <th>Zuschlagssatz${info('GK ÷ Verteilungsschlüssel × 100')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${zuschlag}"></td>
            <td class="muted">%</td>
          </tr>
          <tr>
            <th>GK pro Einheit${info('GK ÷ Verteilungsschlüssel')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${gkProE}"></td>
            <td class="muted">€</td>
          </tr>
          <tr>
            <th>GK für Auftrag A${info('GK je Einheit × A')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${gkAuftrag}"></td>
            <td class="muted">€</td>
          </tr>
        </tbody></table>
        <div class="explain muted is-hidden" data-explain="1">
          1) Zuschlagssatz = <strong>${gk} ÷ ${b} × 100 = ${zuschlag}%</strong>
          <br>2) GK/Einheit = <strong>${gk} ÷ ${b} = ${gkProE} €</strong>
          <br>3) GK für Auftrag = <strong>${gkProE} × ${a} = ${gkAuftrag} €</strong>
        </div>
      </div>`;
    return { markup };
  }

  function maker(difficulty){
    return (difficulty|0) === 1 ? makeEasy() : makeNormal();
  }

  // Registrierung (sofort oder nach DOMReady)
  if (window.Train && typeof window.Train.registerTopic === 'function'){
    window.Train.registerTopic('kostenstellen', maker);
  } else {
    window.addEventListener('DOMContentLoaded', ()=>{
      window.Train && window.Train.registerTopic && window.Train.registerTopic('kostenstellen', maker);
    });
  }
})();