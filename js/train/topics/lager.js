(function(){
  const topic = 'lager';
  function r(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  function make(d){
    // Jahresverbrauch/Wareneinsatz und durchschnittlicher Lagerbestand (vereinfacht)
    const einsatz = r(40,120)*1000;               // Jahreswareneinsatz
    const anfang  = r(5,30)*1000;
    const ende    = r(5,30)*1000;
    const dLB     = Math.round((anfang+ende)/2);
    const umschl  = (dLB>0? Math.round(einsatz/dLB) : 0);
    const dauer   = (umschl>0? Math.round(360/umschl) : 0);

    const markup = `
      <div class="card">
        <h3>Lagerkennziffern</h3>
        <p class="muted">Einfach gerechnet: 360 Tage Jahr, glatte Werte.</p>
        <ul>
          <li>Jahreswareneinsatz: <strong>${einsatz} €</strong></li>
          <li>Anfangsbestand: <strong>${anfang} €</strong>, Endbestand: <strong>${ende} €</strong></li>
        </ul>
        <div class="bab-table" style="display:grid;gap:.6rem">
          <label>Durchschnittlicher Lagerbestand:
            <input data-answer="${dLB}" placeholder="€" />
          </label>
          <label>Umschlagshäufigkeit:
            <input data-answer="${umschl}" placeholder="x/Jahr" />
          </label>
          <label>durchschn. Lagerdauer (Tage):
            <input data-answer="${dauer}" placeholder="Tage" />
          </label>
          <small data-explain>dLB≈(AB+EB)/2=${dLB}; Umschlag≈Einsatz/dLB=${umschl}×/Jahr; Dauer≈360/Umschlag≈${dauer} Tage.</small>
        </div>
      </div>`;
    return { markup };
  }

  window.Train && window.Train.registerTopic(topic, make);
})();