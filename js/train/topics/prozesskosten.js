(function(){
  const topic = 'prozesskosten';
  const fmt = n => new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  function r(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  function make(d){
    // 2–3 Prozesse, Kostentreiber-Mengen, Gesamtkosten → Kostensatz + Zuschlag auf Produkt
    const p1 = r(100,300), p2 = r(50,200), p3 = (d>=3? r(20,120):0);
    const k1 = r(2000,6000), k2 = r(1500,5000), k3 = (p3? r(800,3000):0);
    const cents = value => Math.round(value * 100 + Number.EPSILON * Math.abs(value * 100) * 4) / 100;
    const s1 = cents(k1/p1), s2 = cents(k2/p2), s3 = (p3? cents(k3/p3):0);

    // Produkt X benötigt Treiber: t1, t2, (t3)
    const t1 = r(1,5), t2 = r(1,5), t3 = (p3? r(0,3):0);
    const prozesskosten = cents(k1/p1*t1 + k2/p2*t2 + (p3? k3/p3*t3:0));

    const markup = `
      <div class="card">
        <h3>Prozesskostenrechnung (light)</h3>
        <p class="muted">Die angegebenen Prozesskosten sind bereits vollständig zugeordnet. Ein Treiber bezeichnet hier eine Prozessdurchführung. Berechne die Kostensätze und die dem Produkt X zuzurechnenden Prozesskosten. Runde jedes Eingabefeld kaufmännisch auf Cent; für die Produktkosten mit den ungerundeten Kostensätzen weiterrechnen.</p>
        <ul>
          <li>Prozess 1: ${k1} € / ${p1} Treiber ⇒ Kostensatz ?</li>
          <li>Prozess 2: ${k2} € / ${p2} Treiber ⇒ Kostensatz ?</li>
          ${p3?`<li>Prozess 3: ${k3} € / ${p3} Treiber ⇒ Kostensatz ?</li>`:''}
          <li>Ein Stück von Produkt X benötigt: P1×${t1}, P2×${t2}${p3?`, P3×${t3}`:''}</li>
        </ul>
        <div class="bab-table task-fields">
          <label>Kostensatz P1:
            <input data-answer="${s1}" placeholder="€/Treiber" />
          </label>
          <label>Kostensatz P2:
            <input data-answer="${s2}" placeholder="€/Treiber" />
          </label>
          ${p3?`<label>Kostensatz P3:
            <input data-answer="${s3}" placeholder="€/Treiber" />
          </label>`:''}
          <label>Prozesskosten für Produkt X:
            <input data-answer="${prozesskosten}" placeholder="€" />
            <span class="i" title="Summe(Kostensatz×Treiberbedarf)"></span>
          </label>
          <small class="explain muted is-hidden" data-explain>Kostensatz = Prozesskosten ÷ Prozessmenge.
            P1: ${k1}/${p1} ≈ ${fmt(s1)} €/Treiber; P2: ${k2}/${p2} ≈ ${fmt(s2)} €/Treiber${p3?`; P3: ${k3}/${p3} ≈ ${fmt(s3)} €/Treiber`:''}.
            X: (${k1}/${p1}) × ${t1} + (${k2}/${p2}) × ${t2}${p3?` + (${k3}/${p3}) × ${t3}`:''} ≈ ${fmt(prozesskosten)} €.
            Erst das Gesamtergebnis auf Cent runden.</small>
        </div>
      </div>`;
    return { markup };
  }

  window.Train && window.Train.registerTopic(topic, make);
})();