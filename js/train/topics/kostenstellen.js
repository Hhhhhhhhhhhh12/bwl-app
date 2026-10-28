/* Kostenstellen: mengenbezogene Verrechnung mit Maschinenstunden. */
(function () {
  'use strict';
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  function maker(difficulty) {
    const hours = rnd(50, 150);
    const rate = rnd(20, 60);
    const overhead = hours * rate;
    const orderHours = rnd(5, 40);
    return { markup: `<div class="card">
      <h3>Kostenstellen — ${(difficulty | 0) === 1 ? 'Einsteiger' : 'Aufgabe'}</h3>
      <p>Die Gemeinkosten dieser Kostenstelle werden vollständig nach Maschinenstunden verrechnet.
        Gemeinkosten der Periode: <strong>${overhead} €</strong>; Maschinenstunden der Periode: <strong>${hours} h</strong>.
        ${(difficulty | 0) === 1 ? '' : `Auftrag A beansprucht davon <strong>${orderHours} h</strong>.`}</p>
      <div class="task-fields">
        <label>Verrechnungssatz je Maschinenstunde:
          <input data-answer="${rate}" inputmode="decimal" placeholder="€/h" /></label>
        ${(difficulty | 0) === 1 ? '' : `<label>Gemeinkosten für Auftrag A:
          <input data-answer="${rate * orderHours}" inputmode="decimal" placeholder="€" /></label>`}
      </div>
      <p class="explain muted is-hidden" data-explain>
        Der Verrechnungssatz ist ${overhead} € ÷ ${hours} h = ${rate} €/h.
        ${(difficulty | 0) === 1 ? '' : `Auftrag A erhält ${rate} €/h × ${orderHours} h = ${rate * orderHours} € Gemeinkosten.`}
        Euro geteilt durch Stunden ergibt €/h. Ein prozentualer Zuschlag würde eine Bezugsbasis in Euro benötigen.
      </p></div>` };
  }
  window.Train.registerTopic('kostenstellen', maker);
})();
