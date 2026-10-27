/* =========================================================================
   Topic: BAB — liefert { markup } abhängig von difficulty (1..4)
   Registrierung: window.Train.registerTopic('bab', maker)
   ========================================================================= */
(function(){
  'use strict';
  const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const pick=a=>a[rnd(0,a.length-1)];
  const html=(s,...v)=>s.reduce((o,c,i)=>o+c+(i<v.length?String(v[i]):''),'');
  const info=t=>` <span class="i" title="${t}">i</span>`;

  function makeEasy(){
    const em = rnd(8,20)*100;        // 800..2000
    const zus = rnd(5,25);           // 5..25 %
    const mgk = Math.round(em*zus/100);
    const markup = html`
      <div class="card">
        <h3>BAB — Einsteiger</h3>
        <p>Einzelmaterial (EM)${info('Direkt zuordenbares Material')}: <strong>${em} €</strong> · Material-Gemeinkosten (MGK)${info('Gemeinkosten Materialbereich')}: <strong>${mgk} €</strong></p>
        <table class="bab-table"><tbody>
          <tr>
            <th>MGK-Zuschlag${info('MGK ÷ EM × 100')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${zus}"></td>
            <td class="muted">%</td>
          </tr>
        </tbody></table>
        <div class="explain muted" data-explain="1" style="display:none;margin-top:.5rem">
          Rechenweg: MGK ÷ EM × 100 = <strong>${mgk} ÷ ${em} × 100 = ${zus}%</strong>.
        </div>
      </div>`;
    return {markup};
  }

  function makeNormal(){
    const EM = pick([1000,1200,1500,2000,2400,3000,4000,5000,6000,8000]);
    const rateMGK = pick([10,15,20,25,30]);
    const MGK = Math.round(EM*rateMGK/100);

    const FL = pick([1000,1200,1500,1800,2000,2500,3000,4000,5000,6000]);
    const rateFGK = pick([10,15,20,25,30]);
    const FGK = Math.round(FL*rateFGK/100);

    const HK = EM + FL + MGK + FGK;
    const rateVwVt = pick([5,10,15,20]);
    const sumVwVt = Math.round(HK*rateVwVt/100);
    const VwGK = Math.floor(sumVwVt/2);
    const VtGK = sumVwVt - VwGK;

    const markup = html`
      <div class="card">
        <h3>BAB — Aufgabe</h3>
        <p>
          EM: <strong>${EM} €</strong>, MGK: <strong>${MGK} €</strong>,
          FL: <strong>${FL} €</strong>, FGK: <strong>${FGK} €</strong>,
          VwGK: <strong>${VwGK} €</strong>, VtGK: <strong>${VtGK} €</strong>
        </p>
        <table class="bab-table"><tbody>
          <tr><th>MGK-Zuschlag${info('MGK ÷ EM × 100')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${rateMGK}"></td><td class="muted">%</td></tr>
          <tr><th>FGK-Zuschlag${info('FGK ÷ FL × 100')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${rateFGK}"></td><td class="muted">%</td></tr>
          <tr><th>Vw/Vt-Zuschlag${info('(VwGK+VtGK) ÷ HK × 100')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${rateVwVt}"></td><td class="muted">%</td></tr>
        </tbody></table>
        <div class="explain muted" data-explain="1" style="display:none;margin-top:.5rem">
          1) MGK-Zuschlag = <strong>${MGK} ÷ ${EM} × 100 ≈ ${rateMGK}%</strong>
          <br>2) FGK-Zuschlag = <strong>${FGK} ÷ ${FL} × 100 ≈ ${rateFGK}%</strong>
          <br>3) HK = EM + FL + MGK + FGK = <strong>${HK} €</strong>
          <br>4) Vw/Vt-Zuschlag = <strong>(${VwGK}+${VtGK}) ÷ ${HK} × 100 ≈ ${rateVwVt}%</strong>
        </div>
      </div>`;
    return {markup};
  }

  function maker(d){ return (d|0)===1 ? makeEasy() : makeNormal(); }

  if (window.Train?.registerTopic) {
    window.Train.registerTopic('bab', maker);
  } else {
    window.addEventListener('DOMContentLoaded', ()=> window.Train?.registerTopic?.('bab', maker));
  }
})();