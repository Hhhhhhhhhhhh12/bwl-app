/* Lineares Einproduktmodell: konstante Stückwerte, fixe Periodenkosten. */
(function () {
  'use strict';
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  function maker(difficulty) {
    const price = rnd(10, 30);
    const variable = rnd(3, price - 2);
    const contribution = price - variable;
    const baseQuantity = rnd(8, 30);
    const fixed = contribution * baseQuantity + (difficulty >= 3 ? rnd(1, contribution - 1) : 0);
    const quantity = Math.ceil(fixed / contribution);
    const threshold = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 4 }).format(fixed / contribution);
    return { markup: `<div class="card">
      <h3>Break-Even — ${(difficulty | 0) === 1 ? 'Einsteiger' : 'Aufgabe'}</h3>
      <p>Preis je Stück: <strong>${price} €</strong>; variable Kosten je Stück: <strong>${variable} €</strong>;
        gesamte Fixkosten der Periode: <strong>${fixed} €</strong>.
        Preis und variable Stückkosten bleiben konstant. Produzierte und verkaufte Menge sind gleich;
        die Kapazität reicht aus. Alle Beträge sind netto.</p>
      <div class="task-fields"><label>Mindestens nötige Absatzmenge zur Kostendeckung (auf ganze Stück aufrunden):
        <input data-answer="${quantity}" inputmode="numeric" placeholder="Stück" /></label></div>
      <p class="explain muted is-hidden" data-explain>
        Deckungsbeitrag je Stück = ${price} − ${variable} = ${contribution} €.
        Rechnerische Gewinnschwelle q₀ = ${fixed} ÷ ${contribution} ${fixed % contribution ? '≈' : '='} ${threshold} Stück.
        Mindestens ${quantity} ganze Stück decken die Kosten; bei ${quantity - 1} Stück bleibt noch ein Verlust.
        Eine nicht ganzzahlige Gewinnschwelle wird für die gefragte Mindestmenge aufgerundet.
      </p></div>` };
  }
  window.Train.registerTopic('break_even', maker);
})();
