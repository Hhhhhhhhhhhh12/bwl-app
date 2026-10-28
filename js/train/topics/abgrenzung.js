/* Sachliche Abgrenzung: Aufwand in Kosten überleiten; keine Anderskosten. */
(function () {
  'use strict';
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  function maker(difficulty) {
    const expense = rnd(8, 20) * 100;
    const neutral = rnd(1, 4) * 100;
    const additional = (difficulty | 0) === 1 ? 0 : rnd(1, 6) * 50;
    const costs = expense - neutral + additional;
    return { markup: `<div class="card">
      <h3>Abgrenzung — ${(difficulty | 0) === 1 ? 'Einsteiger' : 'Aufgabe'}</h3>
      <p>Gesamtaufwand der Periode: <strong>${expense} €</strong>.
        Darin enthaltener neutraler Aufwand (betriebsfremde Spende): <strong>${neutral} €</strong>.
        ${additional ? `Zusätzlicher kalkulatorischer Unternehmerlohn, ohne entsprechenden Aufwand: <strong>${additional} €</strong>.` : 'Es gibt keine kalkulatorischen Zusatzkosten.'}
        Der übrige Aufwand wird unverändert als Kosten übernommen; es gibt keine Anderskosten.</p>
      <div class="task-fields"><label>Kosten der Periode:
        <input data-answer="${costs}" inputmode="decimal" placeholder="€" /></label></div>
      <p class="explain muted is-hidden" data-explain>
        Die betriebsfremde Spende ist Aufwand, aber keine Kosten der betrieblichen Leistungserstellung.
        Kosten = Gesamtaufwand − neutraler Aufwand${additional ? ' + Zusatzkosten' : ''} =
        ${expense} − ${neutral}${additional ? ` + ${additional}` : ''} = ${costs} €.
        ${additional ? 'Der kalkulatorische Unternehmerlohn ist eine zusätzliche Kostenposition ohne Aufwand in der Finanzbuchhaltung.' : ''}
      </p></div>` };
  }
  window.Train.registerTopic('abgrenzung', maker);
})();
