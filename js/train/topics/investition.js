(function(){
  const topic = 'investition';
  function r(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  function make(d){
    const A = r(5,15)*1000;          // Anschaffung
    const rueck = r(1,4)*1000;       // jährlicher Rückfluss (Cash In)
    const erspar = (d>=3? r(1,3)*1000 : 0); // jährliche Kostenersparnis (optional)
    const cf = rueck + erspar;       // jährlicher Nettozufluss
    const amor = Math.ceil(A / cf);  // Jahre (aufgerundet)

    const markup = `
      <div class="card">
        <h3>Investitionsrechnung (Amortisation)</h3>
        <p class="muted">Ohne Zinseszins, grobe Amortisationsdauer in Jahren.</p>
        <ul>
          <li>Anschaffung: <strong>${A} €</strong></li>
          <li>jährl. Rückfluss: <strong>${rueck} €</strong>${erspar?`, jährl. Ersparnis: <strong>${erspar} €</strong>`:''}</li>
        </ul>
        <div class="bab-table" style="display:grid;gap:.6rem">
          <label>Jährlicher Nettozufluss:
            <input data-answer="${cf}" placeholder="€" />
          </label>
          <label>Amortisationsdauer (Jahre):
            <input data-answer="${amor}" placeholder="Jahre" />
          </label>
          <small data-explain>CF = Rückfluss${erspar?` + Ersparnis`:''} = ${cf}; Amortisation ≈ Anschaffung / CF = ${A}/${cf} ≈ ${amor} Jahre.</small>
        </div>
      </div>`;
    return { markup };
  }

  window.Train && window.Train.registerTopic(topic, make);
})();