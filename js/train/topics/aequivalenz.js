(function(){
  const topic = 'aequivalenz';
  function r(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  function make(d){
    // Produkte A,B,(C) mit ÄZ; Basispreis für ÄZ=1
    const base = r(10,20); // € für ÄZ=1
    const zA=1, zB=r(2,4), zC=(d>=3? r(3,6):null);
    const pA = base*zA, pB = base*zB, pC = zC? base*zC : null;

    const markup = `
      <div class="card">
        <h3>Äquivalenzziffernrechnung</h3>
        <p class="muted">Preis je Produkt auf Basis einer Äquivalenzziffer.</p>
        <ul>
          <li>Basis (ÄZ = 1): <strong>${base} €</strong></li>
          <li>ÄZ(A)=1, ÄZ(B)=${zB}${zC?`, ÄZ(C)=${zC}`:''}</li>
        </ul>
        <div class="bab-table task-fields">
          <label>Preis A:
            <input data-answer="${pA}" placeholder="€" />
            <span class="i" title="Preis = Basis × ÄZ"></span>
          </label>
          <label>Preis B:
            <input data-answer="${pB}" placeholder="€" />
          </label>
          ${zC?`<label>Preis C:
            <input data-answer="${pC}" placeholder="€" />
          </label>`:''}
          <small data-explain>Preis = Basis × ÄZ. A=${base}×1=${pA}; B=${base}×${zB}=${pB}${zC?`; C=${base}×${zC}=${pC}`:''}.</small>
        </div>
      </div>`;
    return { markup };
  }

  window.Train && window.Train.registerTopic(topic, make);
})();