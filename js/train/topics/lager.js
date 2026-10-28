(function(){
  const topic = 'lager';
  function r(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  function make(d){
    // Jahresverbrauch/Wareneinsatz und durchschnittlicher Lagerbestand (vereinfacht)
    const einsatz = r(40,120)*1000;               // Jahreswareneinsatz
    const anfang  = r(5,30)*1000;
    const ende    = r(5,30)*1000;
    const dLB     = Math.round((anfang+ende)/2);
    const exactTurnover = einsatz / dLB;
    const umschl = Math.round(exactTurnover * 100) / 100;
    const dauer = Math.round(360 * dLB / einsatz);

    const markup = `
      <div class="card">
        <h3>Lagerkennziffern</h3>
        <p class="muted">Vereinfachter durchschnittlicher Bestand aus Anfangs- und Endbestand; alle Werte zu Einstandspreisen. Rechne hier mit einem kaufmännischen Jahr von 360 Tagen. Runde kaufmännisch den Umschlag auf zwei Nachkommastellen und die Lagerdauer auf ganze Tage. Für die Lagerdauer mit dem ungerundeten Umschlag weiterrechnen.</p>
        <ul>
          <li>Jahreswareneinsatz: <strong>${einsatz} €</strong></li>
          <li>Anfangsbestand: <strong>${anfang} €</strong>, Endbestand: <strong>${ende} €</strong></li>
        </ul>
        <div class="bab-table task-fields">
          <label>Durchschnittlicher Lagerbestand:
            <input data-answer="${dLB}" placeholder="€" />
          </label>
          <label>Umschlagshäufigkeit:
            <input data-answer="${umschl}" placeholder="x/Jahr" />
          </label>
          <label>durchschn. Lagerdauer (Tage):
            <input data-answer="${dauer}" placeholder="Tage" />
          </label>
          <small class="explain muted is-hidden" data-explain>Durchschnittlicher Lagerbestand = (${anfang} + ${ende}) ÷ 2 = ${dLB} €. Umschlag = ${einsatz} ÷ ${dLB} ≈ ${String(umschl).replace(".", ",")} mal/Jahr. Lagerdauer = 360 × ${dLB} ÷ ${einsatz} ≈ ${dauer} Tage. So vermeidest du einen Fehler durch den zuvor gerundeten Umschlag. In anderen Aufgaben können 365 Tage vorgegeben sein.</small>
        </div>
      </div>`;
    return { markup };
  }

  window.Train && window.Train.registerTopic(topic, make);
})();