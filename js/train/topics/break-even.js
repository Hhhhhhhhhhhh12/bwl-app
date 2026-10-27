/* =========================================================================
   Topic: Break-Even — liefert { markup } abhängig von difficulty (1..4)
   Exposes by registration: window.Train.registerTopic('break_even', maker)
   ========================================================================= */

(function () {
  "use strict";

  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (arr) => arr[rnd(0, arr.length - 1)];
  const html = (strings, ...vals) => strings.reduce((s, str, i) => s + str + (i < vals.length ? String(vals[i]) : ""), "");
  const info = (tip) => ` <span class="i" title="${tip}">i</span>`;

  function makeEasy() {
    const p = rnd(10, 20);                // Preis
    const v = rnd(3, Math.max(4, p - 2)); // var < p
    const db = p - v;
    const q0 = rnd(8, 20);
    const F = db * q0; // exakt
    const markup = html`
      <div class="card">
        <h3>Break-Even — Einsteiger</h3>
        <p>
          Preis p = <strong>${p} €</strong> · variable Kosten v = <strong>${v} €</strong> · Fixkosten F = <strong>${F} €</strong>
          <br>Kapazitätsgrenze K = <strong>${rnd(200,500)} Stück</strong> · Geplante Absatzmenge nächstes Monat = <strong>${rnd(30,120)} Stück</strong>
          <br>Verwaltung pauschal = <strong>${rnd(200,600)} €</strong> · Restwert Anlage = <strong>${pick([0,0,0,100])} €</strong>
        </p>
        <table class="bab-table"><tbody>
          <tr>
            <th>q₀ = F ÷ (p − v)${info('Break-even-Menge: Fixkosten geteilt durch Deckungsbeitrag/Stück')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${q0}"></td>
            <td class="muted">Stück</td>
          </tr>
        </tbody></table>
        <div class="explain muted hidden" data-explain="1">
          Rechenweg: q₀ = <strong>${F} ÷ (${p} − ${v}) = ${F} ÷ ${db} = ${q0}</strong>.
        </div>
      </div>`;
    return { markup };
  }

  function makeNormal() {
    const price = pick([20, 25, 30, 40]);
    const varCost = price - pick([5, 10]); // DB = 5 oder 10
    const db = price - varCost;
    const q = pick([10, 12, 15, 20, 25, 30]);
    const fixed = db * q; // glatt
    const markup = html`
      <div class="card">
        <h3>Break-Even — Aufgabe</h3>
        <p>
          Preis je Stück: <strong>${price} €</strong>, variable Kosten: <strong>${varCost} €</strong>, fixe Kosten: <strong>${fixed} €</strong>
          <br>Lagerbestand aktuell = <strong>${rnd(50,150)} Stück</strong> · Marketingbudget Quartal = <strong>${pick([0,500,1000])} €</strong>
          <br>Maschinenverfügbarkeit = <strong>${pick(["95%","98%","99%"])} </strong> · Reklamationsquote = <strong>${pick(["0,5%","1%","2%"])} </strong>
        </p>
        <table class="bab-table"><tbody>
          <tr>
            <th>Menge am Break-Even${info('Fixkosten ÷ (Preis − variable Kosten)')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${q}"></td>
            <td class="muted">Stück</td>
          </tr>
        </tbody></table>
      </div>`;
    return { markup };
  }

  function maker(difficulty) {
    if ((difficulty | 0) === 1) return makeEasy();
    return makeNormal();
  }

  // Registrierung
  if (window.Train && typeof window.Train.registerTopic === "function") {
    window.Train.registerTopic("break_even", maker);
  } else {
    // Falls Engine noch nicht geladen ist, verzögert registrieren
    window.addEventListener("DOMContentLoaded", () => {
      window.Train && window.Train.registerTopic && window.Train.registerTopic("break_even", maker);
    });
  }
})();