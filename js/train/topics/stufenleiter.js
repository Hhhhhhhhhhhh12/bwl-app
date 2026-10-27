/* =========================================================================
   Topic: Stufenleiter — liefert { markup } abhängig von difficulty (1..4)
   Registrierung: window.Train.registerTopic('stl', maker)
   ========================================================================= */
(function(){
  'use strict';
  const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const pick=a=>a[rnd(0,a.length-1)];
  const html=(s,...v)=>s.reduce((o,c,i)=>o+c+(i<v.length?String(v[i]):''),'');
  const info=t=>` <span class="i" title="${t}">i</span>`;

  function makeEasy(){
    const a = rnd(100,300), b = rnd(100,300);
    const sum = a+b;
    const markup = html`
      <div class="card">
        <h3>Stufenleiter — Einsteiger</h3>
        <p>Hilfskostenstellen${info('Kosten werden stufenweise ohne Rückverrechnung auf Hauptstellen verteilt')}: <strong>${a} €</strong> und <strong>${b} €</strong></p>
        <table class="bab-table"><tbody>
          <tr><th>Summe</th><td><input type="text" inputmode="numeric" data-answer="${sum}"></td><td class="muted">€</td></tr>
        </tbody></table>
      </div>`;
    return {markup};
  }

  function makeNormal(){
    const h1 = pick([200,300,400,500,600,700,800]);
    const h2 = pick([300,400,500,600,700,800,900]);
    const h3 = pick([200,300,400,500,600,700]);
    const sum = h1+h2+h3;
    const markup = html`
      <div class="card">
        <h3>Stufenleiter — Praxisaufgabe</h3>
        <p>Hilfskostenstellen:</p>
        <ul>
          <li><strong>Instandhaltung</strong>: ${h1} €</li>
          <li><strong>Energieversorgung</strong>: ${h2} €</li>
          <li><strong>Verwaltung</strong>: ${h3} €</li>
        </ul>
        <p>Diese Kosten werden stufenweise (ohne Rückverrechnung) auf die Hauptkostenstellen umgelegt.${info('Sinnvolle Reihenfolge wählen; jede Stelle vollständig verrechnen')}</p>
        <table class="bab-table"><tbody>
          <tr>
            <th>Summe Hilfskostenstellen${info('Summe vor der Umlage')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${sum}"></td>
            <td class="muted">€</td>
          </tr>
        </tbody></table>
        <div class="explain muted is-hidden mt-6" data-explain="1">
          Summe: <strong>${h1} + ${h2} + ${h3} = ${sum} €</strong>. Danach stufenweise verteilen (z. B. Verwaltung → Instandhaltung → Energie).
        </div>
      </div>`;
    return {markup};
  }

  function maker(d){ return (d|0)===1 ? makeEasy() : makeNormal(); }

  if (window.Train?.registerTopic) {
    window.Train.registerTopic('stl', maker);
  } else {
    window.addEventListener('DOMContentLoaded', ()=> window.Train?.registerTopic?.('stl', maker));
  }
})();