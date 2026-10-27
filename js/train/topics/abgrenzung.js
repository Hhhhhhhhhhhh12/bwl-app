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
    const ek   = rnd(800,2000);
    const pag  = rnd(100,400);
    const erfolg = ek - pag; // einfache Grundlogik ohne kalk. Kosten

    // Wähle bis zu 2 Lücken (maximal 2 Felder als Input)
    const fields = ['ek','pag','erg'];
    const blanks = new Set();
    while (blanks.size < 2){
      const f = pick(fields);
      // Stelle sicher, dass Ergebnis nicht die einzige Lücke ist
      if (blanks.size === 1 && blanks.has('erg')) continue;
      blanks.add(f);
      if (blanks.size >= 2) break;
    }

    const ekCell  = blanks.has('ek')  ? `<input type="text" inputmode="numeric" placeholder="?" data-answer="${ek}">` : `<strong>${ek} €</strong>`;
    const pagCell = blanks.has('pag') ? `<input type="text" inputmode="numeric" placeholder="?" data-answer="${pag}">` : `<strong>${pag} €</strong>`;
    const ergCell = blanks.has('erg') ? `<input type="text" inputmode="numeric" placeholder="?" data-answer="${erfolg}">` : `<strong>${erfolg} €</strong>`;

    const markup = html`
      <div class="card compact">
        <h3>Abgrenzung — Einsteiger</h3>
        <table class="bab-table compact"><tbody>
          <tr><th>EK‑Änderung</th><td>${ekCell}</td><td class="muted">€</td></tr>
          <tr><th>pagatorische Aufw.${info('Zahlungswirksam, tatsächlicher Geldfluss')}</th><td>${pagCell}</td><td class="muted">€</td></tr>
          <tr><th>Ergebnis</th><td>${ergCell}</td><td class="muted">€</td></tr>
        </tbody></table>
        <div class="explain muted is-hidden" data-explain="1">
          Rechenweg: <strong>${ek} − ${pag} = ${erfolg} €</strong>.
        </div>
      </div>`;
    return {markup};
  }

  function makeNormal(){
    const ek   = pick([1000,1200,1500,1800,2000,2400,3000,3500,4000]);
    const pag  = pick([100,200,300,400,500,600,700,800]);
    const kalk = pick([100,150,200,250,300]);
    const noise = pick(['Hinweis: periodenfremd','Hinweis: neutral','—']);
    const erfolg = ek - pag + kalk;

    // bis zu 2 Lücken
    const fields = ['ek','pag','kalk','erg'];
    const blanks = new Set();
    while (blanks.size < 2){
      const f = pick(fields);
      // Ergebnis nicht einzige Lücke
      if (blanks.size === 1 && blanks.has('erg')) continue;
      blanks.add(f);
      if (blanks.size >= 2) break;
    }

    const ekCell   = blanks.has('ek')   ? `<input type="text" inputmode="numeric" placeholder="?" data-answer="${ek}">`   : `<strong>${ek} €</strong>`;
    const pagCell  = blanks.has('pag')  ? `<input type="text" inputmode="numeric" placeholder="?" data-answer="${pag}">`  : `<strong>${pag} €</strong>`;
    const kalkCell = blanks.has('kalk') ? `<input type="text" inputmode="numeric" placeholder="?" data-answer="${kalk}">` : `<strong>${kalk} €</strong>`;
    const ergCell  = blanks.has('erg')  ? `<input type="text" inputmode="numeric" placeholder="?" data-answer="${erfolg}">` : `<strong>${erfolg} €</strong>`;

    const markup = html`
      <div class="card compact">
        <h3>Abgrenzung — Aufgabe</h3>
        <p class="muted">${noise}</p>
        <table class="bab-table compact"><tbody>
          <tr><th>EK‑Änderung</th><td>${ekCell}</td><td class="muted">€</td></tr>
          <tr><th>pag. Aufw.${info('Zahlungswirksam')}</th><td>${pagCell}</td><td class="muted">€</td></tr>
          <tr><th>kalk. Kosten${info('Nicht zahlungswirksam, nur rechnerisch')}</th><td>${kalkCell}</td><td class="muted">€</td></tr>
          <tr><th>Ergebnis</th><td>${ergCell}</td><td class="muted">€</td></tr>
        </tbody></table>
        <div class="explain muted is-hidden" data-explain="1">
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