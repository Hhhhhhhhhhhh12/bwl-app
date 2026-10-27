(function(){
  const topic = 'kennzahlen';
  function r(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  function make(d){
    // kleine Bilanz-/Zahlungsdaten
    const kasse = r(5,20)*1000;
    const bank  = r(5,20)*1000;
    const ford  = r(10,40)*1000;
    const vorr  = r(8,30)*1000;
    const kurzV = r(10,40)*1000;
    const langV = r(20,60)*1000;
    const ek    = r(30,90)*1000;
    const cf_ein = r(10,40)*1000, cf_aus = r(5,30)*1000;

    const liq1 = Math.round(((kasse+bank)/kurzV)*100);                    // %
    const liq2 = Math.round(((kasse+bank+ford)/kurzV)*100);
    const liq3 = Math.round(((kasse+bank+ford+vorr)/kurzV)*100);
    const bilanzsumme = kasse+bank+ford+vorr + langV + ek; // vereinfachte Annahme (nur Näherung)
    const ekq = Math.round((ek/bilanzsumme)*100);
    const cf  = cf_ein - cf_aus;

    const markup = `
      <div class="card">
        <h3>Kennzahlen (Basic)</h3>
        <p class="muted">Liquidität I–III, EK-Quote, einfacher Cashflow.</p>
        <ul>
          <li>Kasse: ${kasse} €, Bank: ${bank} €, Forderungen: ${ford} €, Vorräte: ${vorr} €</li>
          <li>kurzfr. Verb.: ${kurzV} €, langfr. Verb.: ${langV} €, Eigenkapital: ${ek} €</li>
          <li>Einzahlungen: ${cf_ein} €, Auszahlungen: ${cf_aus} €</li>
        </ul>
        <div class="bab-table" style="display:grid;gap:.6rem">
          <label>Liquidität I (%):
            <input data-answer="${liq1}" placeholder="%" />
          </label>
          <label>Liquidität II (%):
            <input data-answer="${liq2}" placeholder="%" />
          </label>
          <label>Liquidität III (%):
            <input data-answer="${liq3}" placeholder="%" />
          </label>
          <label>Eigenkapitalquote (%):
            <input data-answer="${ekq}" placeholder="%" />
          </label>
          <label>Cashflow (light):
            <input data-answer="${cf}" placeholder="€" />
          </label>
          <small data-explain>Liq I=(liquide Mittel/kurzfr. Verb.)×100, Liq II=(+Forderungen)×100, Liq III=(+Vorräte)×100; EKQ=EK/Bilanzsumme×100; CF=Einz−Ausz.</small>
        </div>
      </div>`;
    return { markup };
  }

  window.Train && window.Train.registerTopic(topic, make);
})();