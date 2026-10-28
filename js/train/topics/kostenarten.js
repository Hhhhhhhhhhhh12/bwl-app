/* Kostenarten: A/B's 15 task slots adapted to D's Train registration.
   Existing D numeric tasks remain the first two levels; A/B adds classifications
   and decomposition/stückkosten tasks without a second incompatible engine. */
(function () {
  'use strict';
  const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const fmt = n => new Intl.NumberFormat('de-DE').format(n);
  function field(label, answer, unit) {
    return `<label>${label}<span class="atelier-input-unit"><input data-answer="${answer}" inputmode="decimal" aria-label="${label}"><span>${unit || '€'}</span></span></label>`;
  }
  function task(title, givens, fields, explanation, graphic = '') {
    return { markup: `<div class="card"><h3>Kostenarten — ${title}</h3><p>${givens}</p>
      ${graphic}
      <div class="task-fields">${fields}</div>
      <p class="explain muted is-hidden mt-6" data-explain>${explanation}</p></div>` };
  }
  const generators = [];
  generators.push(difficulty => {
    // Preserve D's easy introductory exercise; A/B's EK+GK follows for later stages.
    if (difficulty === 1) {
      const variable = rnd(2, 10), quantity = rnd(5, 20);
      const packages = `<span class="mission-packages" aria-hidden="true">${'<i class="mission-package"></i>'.repeat(quantity)}</span>`;
      const graphic = `<div class="atelier-equation" aria-label="Kosten je Stück mal Menge ergibt Gesamtkosten">
        <div class="atelier-quantity"><strong>${variable} €</strong><small>je Stück</small></div><span class="atelier-operator" aria-hidden="true">×</span>
        <div class="atelier-quantity">${packages}<strong>${quantity}</strong><small>Stück</small></div><span class="atelier-operator" aria-hidden="true">=</span>
        <div class="atelier-quantity atelier-unknown"><strong data-equation-result data-equation-answer="${fmt(variable * quantity)} €">?</strong><small>Kosten gesamt</small></div></div>`;
      return task('Einsteiger', 'Wie hoch sind die Gesamtkosten für diese Menge? Es fallen keine Fixkosten an; die variablen Kosten je Stück bleiben konstant.',
        field('Gesamtkosten', variable * quantity), `Konstante Stückkosten × Menge: ${variable} × ${quantity} = ${variable * quantity} €. Ohne Fixkosten sind dies zugleich die Gesamtkosten.`, graphic);
    }
    const ek = rnd(400, 900), gk = rnd(100, 400);
    return task('Gesamtkosten', `Einzelkosten: ${ek} €; Gemeinkosten: ${gk} €.`,
      field('Gesamtkosten', ek + gk), `Einzelkosten + Gemeinkosten ergeben hier alle Kosten: ${ek} + ${gk} = ${ek + gk} €.`);
  });
  generators.push(difficulty => {
    if (difficulty === 1) {
      const variable = rnd(2, 10), quantity = rnd(10, 40), fixed = rnd(0, 5) * quantity;
      const total = fixed + variable * quantity;
      return task('Fixe und variable Kosten', `Fixkosten: ${fixed} €; variable Kosten je Stück: ${variable} €; Menge: ${quantity}.`,
        field('Gesamtkosten', total) + field('Durchschnittskosten je Stück', total / quantity, '€/Stück'),
        `Gesamt: ${fixed} + ${variable} × ${quantity} = ${total} €; je Stück: ${total} ÷ ${quantity} = ${total / quantity} €.`);
    }
    const ek = rnd(600, 1200), gk = rnd(200, 600), quantity = rnd(10, 40);
    const answer = Math.round((ek + gk) / quantity);
    return task('Durchschnittskosten', `Einzelkosten: ${ek} €; Gemeinkosten: ${gk} €; Menge: ${quantity}. Runde kaufmännisch auf ganze € je Stück.`,
      field('Durchschnittskosten je Stück', answer, '€/Stück'), `Gesamtkosten durch Menge: (${ek} + ${gk}) ÷ ${quantity} ≈ ${answer} €/Stück; kaufmännisch auf ganze Euro gerundet.`);
  });
  const classifications = [
    { text: 'Lohn, der einem einzelnen Fertigungsauftrag direkt zugeordnet wird', answer: 'Einzelkosten', explanation: 'Die Kosten werden dem einzelnen Auftrag als Kostenträger direkt zugerechnet.', options: ['Einzelkosten', 'Gemeinkosten'] },
    { text: 'Strom für die Verwaltung', answer: 'Gemeinkosten', explanation: 'Verwaltungsstrom lässt sich einem einzelnen Fertigungsauftrag nicht unmittelbar zurechnen; er wird über einen Schlüssel verteilt.', options: ['Einzelkosten', 'Gemeinkosten'] },
    { text: 'rechnerisch angesetzte Miete für eigene Räume ohne Mietzahlung', answer: 'kalkulatorisch', explanation: 'Für eigene Räume wird ein rechnerischer Kostenwert angesetzt, obwohl keine Miete gezahlt wird.', options: ['pagatorisch', 'kalkulatorisch'] },
    { text: 'tatsächliche Mietzahlung für betrieblich genutzte Räume dieser Periode', answer: 'pagatorisch', explanation: 'Die Mietkosten beruhen hier auf einer tatsächlichen Zahlung für betrieblich genutzte Räume in dieser Periode.', options: ['pagatorisch', 'kalkulatorisch'] },
    { text: 'Fertigungsmaterial für einen einzelnen Auftrag', answer: 'Einzelkosten', explanation: 'Die Kosten werden dem einzelnen Auftrag als Kostenträger direkt zugerechnet.', options: ['Einzelkosten', 'Gemeinkosten'] }
  ];
  for (let index = 0; index < 3; index++) {
    generators.push(() => {
      const item = classifications[rnd(0, classifications.length - 1)];
      const options = item.options.map(option => `<option value="${option}">${option}</option>`).join('');
      return task('Einordnung', `Ordne zu: ${item.text}.`,
        `<label>Kostenart: <select data-answer="${item.answer}" aria-label="Kostenart"><option value="">Bitte auswählen</option>${options}</select></label>`,
        `Zuordnung: ${item.answer}. ${item.explanation}`);
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
      return task('Stückkosten', `Gesamtkosten: ${fmt(total)} €; Menge: ${quantity}. Runde kaufmännisch auf volle € je Stück.`,
        field('Stückkosten', answer, '€/Stück'), `Gesamtkosten durch Menge: ${total} ÷ ${quantity} ≈ ${answer} €/Stück; kaufmännisch auf ganze Euro gerundet.`);
    });
  }
  window.Train.registerTopic('kostenarten', (difficulty, level) => {
    const index = Math.max(0, Math.min(generators.length - 1, Number(level) || 0));
    return generators[index](difficulty);
  });
})();
