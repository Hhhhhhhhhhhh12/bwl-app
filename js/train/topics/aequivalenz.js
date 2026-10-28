/* Einstufige Äquivalenzziffernkalkulation einer Sortenfertigung. */
(function () {
  'use strict';
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  function maker(difficulty) {
    const products = [
      { name: 'A', quantity: rnd(5, 15) * 10, factor: 1 },
      { name: 'B', quantity: rnd(5, 15) * 10, factor: rnd(2, 4) },
    ];
    if (difficulty >= 3) products.push({ name: 'C', quantity: rnd(5, 15) * 10, factor: rnd(3, 6) });
    const units = products.reduce((total, p) => total + p.quantity * p.factor, 0);
    const unitCost = rnd(10, 20);
    const totalCosts = units * unitCost;
    return { markup: `<div class="card">
      <h3>Äquivalenzziffernrechnung</h3>
      <p>Verteile die gesamten Herstellkosten von <strong>${totalCosts} €</strong> auf verwandte Produktsorten.
        Die Äquivalenzziffer (ÄZ) beschreibt das konstante Kostenverhältnis je Stück zur Sorte A.
        Alle angegebenen Stückzahlen wurden in derselben Periode hergestellt.</p>
      <ul>${products.map(p => `<li>Sorte ${p.name}: Menge <strong>${p.quantity} Stück</strong>; ÄZ <strong>${p.factor}</strong></li>`).join('')}</ul>
      <div class="task-fields">
        <label>Summe der Recheneinheiten:<input data-answer="${units}" inputmode="decimal" placeholder="RE" /></label>
        <label>Herstellkosten je Recheneinheit:<input data-answer="${unitCost}" inputmode="decimal" placeholder="€/RE" /></label>
        ${products.map(p => `<label>Herstellkosten je Stück ${p.name}:<input data-answer="${unitCost * p.factor}" inputmode="decimal" placeholder="€/Stück" /></label>`).join('')}
      </div>
      <p class="explain muted is-hidden" data-explain>
        Recheneinheiten = ${products.map(p => `${p.quantity} × ${p.factor}`).join(' + ')} = ${units} RE.
        Herstellkosten je RE = ${totalCosts} ÷ ${units} = ${unitCost} €/RE.
        Stückkosten = Kosten je RE × ÄZ: ${products.map(p => `${p.name}: ${unitCost} × ${p.factor} = ${unitCost * p.factor} €/Stück`).join('; ')}.
        Die Summe aus Stückkosten × Stückzahl aller Sorten ergibt wieder ${totalCosts} €.
      </p></div>` };
  }
  window.Train.registerTopic('aequivalenz', maker);
})();
