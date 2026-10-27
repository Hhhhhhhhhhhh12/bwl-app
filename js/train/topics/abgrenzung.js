/* =========================================================================
   Topic: Abgrenzung — liefert { markup } abhängig von difficulty (1..4)
   Registrierung: window.Train.registerTopic('abgrenzung', maker)
   ========================================================================= */
(function(){
  'use strict';
  const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const pick=a=>a[rnd(0,a.length-1)];
  const html=(s,...v)=>s.reduce((o,c,i)=>o+c+(i<v.length?String(v[i]):''),'');
  const info=t=>` <span class="i" title="${t}">i</span>`;

  function makeEasy(){
    const ek = rnd(800,2000);
    const pag= rnd(100,400);
    const erfolg = ek - pag;
    const markup = html`
      <div class="card">
        <h3>Abgrenzung — Einsteiger</h3>
        <p>EK-Änderung: <strong>${ek} €</strong> · pagatorische Aufw.${info('Zahlungswirksam, tatsächlicher Geldfluss')}: <strong>${pag} €</strong></p>
        <table class="bab-table"><tbody>
          <tr><th>Ergebnis</th><td><input type="text" inputmode="numeric" data-answer="${erfolg}"></td><td class="muted">€</td></tr>
        </tbody></table>
        <div class="explain muted is-hidden mt-6" data-explain="1">
          Rechenweg: <strong>${ek} − ${pag} = ${erfolg} €</strong>.
        </div>
      </div>`;
    return {markup};
  }

  function makeNormal(){
    const ek = pick([1000,1200,1500,1800,2000,2400,3000,3500,4000]);
    const pag= pick([100,200,300,400,500,600,700,800]);
    const kalk= pick([100,150,200,250,300]);
    const noise = pick(['Hinweis: periodenfremd','Hinweis: neutral','—']);
    const erfolg = ek - pag + kalk;
    const markup = html`
      <div class="card">
        <h3>Abgrenzung — Aufgabe</h3>
        <p>EK-Änderung: <strong>${ek} €</strong>, pag. Aufw.${info('Zahlungswirksam')}: <strong>${pag} €</strong>, kalk. Kosten${info('Nicht zahlungswirksam, nur rechnerisch')}: <strong>${kalk} €</strong>. (${noise})</p>
        <table class="bab-table"><tbody>
          <tr><th>Ergebnis</th><td><input type="text" inputmode="numeric" data-answer="${erfolg}"></td><td class="muted">€</td></tr>
        </tbody></table>
        <div class="explain muted is-hidden mt-6" data-explain="1">
          So rechnest du: <strong>${ek} − ${pag} + ${kalk} = ${erfolg} €</strong>.
        </div>
      </div>`;
    return {markup};
  }

  function maker(d){ return (d|0)===1 ? makeEasy() : makeNormal(); }

  if (window.Train?.registerTopic) {
    window.Train.registerTopic('abgrenzung', maker);
  } else {
    window.addEventListener('DOMContentLoaded', ()=> window.Train?.registerTopic?.('abgrenzung', maker));
  }
})();