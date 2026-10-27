/* Kostenarten: A/B's 15 task slots adapted to D's Train registration.
   Existing D numeric tasks remain the first two levels; A/B adds classifications
   and decomposition/stückkosten tasks without a second incompatible engine. */
(function () {
  'use strict';
  const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const fmt = n => new Intl.NumberFormat('de-DE').format(n);
  function field(label, answer, unit) {
    return `<label>${label}: <input data-answer="${answer}" inputmode="decimal" aria-label="${label}"> ${unit || '€'}</label>`;
  }
  function task(title, givens, fields, explanation) {
    return { markup: `<div class="card"><h3>Kostenarten — ${title}</h3><p>${givens}</p>
      <div class="task-fields">${fields}</div>
      <p class="explain muted is-hidden mt-6" data-explain>${explanation}</p></div>` };
  }
  const generators = [];
  generators.push(difficulty => {
    // Preserve D's easy introductory exercise; A/B's EK+GK follows for later stages.
    if (difficulty === 1) {
      const variable = rnd(2, 10), quantity = rnd(5, 20);
      return task('Einsteiger', `Variable Kosten je Stück: ${variable} €; Menge: ${quantity}.`,
        field('Gesamtkosten', variable * quantity), `${variable} × ${quantity} = ${variable * quantity} €.`);
    }
    const ek = rnd(400, 900), gk = rnd(100, 400);
    return task('Gesamtkosten', `Einzelkosten: ${ek} €; Gemeinkosten: ${gk} €.`,
      field('Gesamtkosten', ek + gk), `${ek} + ${gk} = ${ek + gk} €.`);
  });
  generators.push(difficulty => {
    if (difficulty === 1) {
      const variable = rnd(2, 10), quantity = rnd(10, 40), fixed = rnd(0, 5) * quantity;
      const total = fixed + variable * quantity;
      return task('Fixe und variable Kosten', `Fixkosten: ${fixed} €; variable Kosten je Stück: ${variable} €; Menge: ${quantity}.`,
        field('Gesamtkosten', total) + field('Durchschnittskosten je Stück', total / quantity),
        `Gesamt: ${fixed} + ${variable} × ${quantity} = ${total} €; je Stück: ${total} ÷ ${quantity} = ${total / quantity} €.`);
    }
    const ek = rnd(600, 1200), gk = rnd(200, 600), quantity = rnd(10, 40);
    const answer = Math.round((ek + gk) / quantity);
    return task('Durchschnittskosten', `Einzelkosten: ${ek} €; Gemeinkosten: ${gk} €; Menge: ${quantity}. Runde auf ganze €.`,
      field('Durchschnittskosten je Stück', answer), `(${ek} + ${gk}) ÷ ${quantity} ≈ ${answer} €.`);
  });
  const classifications = [
    { text: 'Lohn, der einem einzelnen Fertigungsauftrag direkt zugeordnet wird', answer: 'Einzelkosten', options: ['Einzelkosten', 'Gemeinkosten'] },
    { text: 'Strom für die Verwaltung', answer: 'Gemeinkosten', options: ['Einzelkosten', 'Gemeinkosten'] },
    { text: 'rechnerisch angesetzte Miete für eigene Räume ohne Mietzahlung', answer: 'kalkulatorisch', options: ['pagatorisch', 'kalkulatorisch'] },
    { text: 'tatsächliche Mietzahlung', answer: 'pagatorisch', options: ['pagatorisch', 'kalkulatorisch'] },
    { text: 'Fertigungsmaterial für einen einzelnen Auftrag', answer: 'Einzelkosten', options: ['Einzelkosten', 'Gemeinkosten'] }
  ];
  for (let index = 0; index < 3; index++) {
    generators.push(() => {
      const item = classifications[rnd(0, classifications.length - 1)];
      const options = item.options.map(option => `<option value="${option}">${option}</option>`).join('');
      return task('Einordnung', `Ordne zu: ${item.text}.`,
        `<label>Kostenart: <select data-answer="${item.answer}" aria-label="Kostenart"><option value="">Bitte auswählen</option>${options}</select></label>`,
        `Zuordnung: ${item.answer}.`);
    });
  }
  for (let index = 0; index < 5; index++) {
    generators.push(() => {
      const material = rnd(200, 500), wages = rnd(150, 400), overhead = rnd(100, 300), fixed = rnd(50, 150);
      const variable = material + wages + overhead, total = variable + fixed;
      return task('Zerlegung', `Material: ${material} €, Fertigungslohn: ${wages} €, variable Gemeinkosten: ${overhead} €, Fixkosten: ${fixed} €. Material und Fertigungslohn sind hier vollständig variabel.`,
        field('Variable Kosten gesamt', variable) + field('Gesamtkosten', total),
        `Variabel: ${material} + ${wages} + ${overhead} = ${variable} €; gesamt: ${variable} + ${fixed} = ${total} €.`);
    });
  }
  for (let index = 0; index < 5; index++) {
    generators.push(() => {
      const total = rnd(900, 1600), quantity = rnd(15, 40), answer = Math.round(total / quantity);
      return task('Stückkosten', `Gesamtkosten: ${fmt(total)} €; Menge: ${quantity}. Runde auf volle €.`,
        field('Stückkosten', answer), `${total} ÷ ${quantity} ≈ ${answer} €.`);
    });
  }
  window.Train.registerTopic('kostenarten', (difficulty, level) => {
    const index = Math.max(0, Math.min(generators.length - 1, Number(level) || 0));
    return generators[index](difficulty);
  });
})();
