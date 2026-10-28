(function(){
  const topic = 'investition';
  function r(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  function make(d){
    const A = r(5,15)*1000;          // Anschaffung
    const rueck = r(1,4)*1000;       // jährlicher Netto-Rückfluss vor zusätzlicher Einsparung
    const erspar = (d>=3? r(1,3)*1000 : 0); // jährliche Kostenersparnis (optional)
    const cf = rueck + erspar;       // jährlicher Nettozufluss
    const amor = Math.ceil(A / cf);  // Jahre (aufgerundet)

    const markup = `
      <div class="card">
        <h3>Investitionsrechnung (Amortisation)</h3>
        <p class="muted">Statische Amortisation ohne Verzinsung und Restwert. Die gleichbleibenden Netto-Rückflüsse fallen jeweils am Jahresende an. Gesucht ist das erste volle Jahr, an dessen Ende die Anschaffungsauszahlung gedeckt ist: auf ganze Jahre aufrunden.</p>
        <ul>
          <li>Anschaffungsauszahlung: <strong>${A} €</strong></li>
          <li>jährlicher Netto-Rückfluss nach laufenden Auszahlungen: <strong>${rueck} €</strong>${erspar?`, zusätzliche jährliche zahlungswirksame Ersparnis (im Rückfluss noch nicht enthalten): <strong>${erspar} €</strong>`:''}</li>
        </ul>
        <div class="bab-table task-fields">
          <label>Jährlicher Nettozufluss:
            <input data-answer="${cf}" placeholder="€" />
          </label>
          <label>Amortisation am Ende welchen Jahres?
            <input data-answer="${amor}" placeholder="Jahre" />
          </label>
          <small class="explain muted is-hidden" data-explain>CF = Rückfluss${erspar?` + Ersparnis`:''} = ${cf}; ${A}/${cf} aufgerundet ergibt ${amor} Jahre. Erst nach ${amor} vollständigen Jahresrückflüssen ist die Anschaffungsauszahlung gedeckt; nach ${amor - 1} noch nicht. Bei gleichmäßigem unterjährigem Zufluss wäre stattdessen die ungerundete Dauer relevant.</small>
        </div>
      </div>`;
    return { markup };
  }

  window.Train && window.Train.registerTopic(topic, make);
})();