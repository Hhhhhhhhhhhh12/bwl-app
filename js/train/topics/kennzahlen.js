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
    const ek    = kasse + bank + ford + vorr + r(3,9)*1000;
    const cf_ein = r(10,40)*1000, cf_aus = r(5,30)*1000;

    const liq1 = Math.round((kasse+bank)*100/kurzV);                    // %
    const liq2 = Math.round((kasse+bank+ford)*100/kurzV);
    const liq3 = Math.round((kasse+bank+ford+vorr)*100/kurzV);
    const bilanzsumme = kurzV + langV + ek; // vollständige Passivseite
    const anlagen = bilanzsumme - (kasse + bank + ford + vorr);
    const ekq = Math.round(ek*100/bilanzsumme);
    const cf  = cf_ein - cf_aus;

    const markup = `
      <div class="card">
        <h3>Kennzahlen (Basic)</h3>
        <p class="muted">Runde alle Prozentwerte kaufmännisch auf ganze Prozent. Bank ist ein Guthaben, sämtliche Forderungen sind kurzfristig. Das Umlaufvermögen besteht nur aus Kasse, Bank, Forderungen und Vorräten; weitere Bilanzpositionen gibt es nicht.</p>
        <ul>
          <li>Kasse: ${kasse} €, Bank: ${bank} €, Forderungen: ${ford} €, Vorräte: ${vorr} €</li>
          <li>Anlagevermögen: ${anlagen} €</li>
          <li>kurzfr. Verb.: ${kurzV} €, langfr. Verb.: ${langV} €, Eigenkapital: ${ek} €</li>
          <li>Einzahlungen aus laufender Geschäftstätigkeit: ${cf_ein} €, Auszahlungen aus laufender Geschäftstätigkeit: ${cf_aus} €</li>
        </ul>
        <div class="bab-table task-fields">
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
          <label>Operativer Cashflow (vereinfachte direkte Methode):
            <input data-answer="${cf}" placeholder="€" />
          </label>
          <small class="explain muted is-hidden" data-explain>
            Liquidität I = (${kasse} + ${bank}) ÷ ${kurzV} × 100 ≈ ${liq1}%.
            Liquidität II = (${kasse} + ${bank} + ${ford}) ÷ ${kurzV} × 100 ≈ ${liq2}%.
            Liquidität III = (${kasse} + ${bank} + ${ford} + ${vorr}) ÷ ${kurzV} × 100 ≈ ${liq3}%.
            Gesamtkapital = ${ek} + ${kurzV} + ${langV} = ${bilanzsumme} €; Eigenkapitalquote = ${ek} ÷ ${bilanzsumme} × 100 ≈ ${ekq}%.
            Operativer Cashflow = ${cf_ein} − ${cf_aus} = ${cf} €. Hier zählen nur die genannten operativen Zahlungen derselben Periode; Investitions- und Finanzierungsvorgänge sind ausgeschlossen.
          </small>
        </div>
      </div>`;
    return { markup };
  }

  window.Train && window.Train.registerTopic(topic, make);
})();