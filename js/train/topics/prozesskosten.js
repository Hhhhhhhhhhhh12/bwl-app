(function(){
  const topic = 'prozesskosten';
  function r(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  function make(d){
    // 2–3 Prozesse, Kostentreiber-Mengen, Gesamtkosten → Kostensatz + Zuschlag auf Produkt
    const p1 = r(100,300), p2 = r(50,200), p3 = (d>=3? r(20,120):0);
    const k1 = r(2000,6000), k2 = r(1500,5000), k3 = (p3? r(800,3000):0);
    const s1 = Math.round(k1/p1), s2 = Math.round(k2/p2), s3 = (p3? Math.round(k3/p3):0);

    // Produkt X benötigt Treiber: t1, t2, (t3)
    const t1 = r(1,5), t2 = r(1,5), t3 = (p3? r(0,3):0);
    const prozesskosten = s1*t1 + s2*t2 + (p3? s3*t3:0);

    const markup = `
      <div class="card">
        <h3>Prozesskostenrechnung (light)</h3>
        <p class="muted">Kostensatz je Prozess und Zuschlag aufs Produkt X.</p>
        <ul>
          <li>Prozess 1: ${k1} € / ${p1} Treiber ⇒ Kostensatz ?</li>
          <li>Prozess 2: ${k2} € / ${p2} Treiber ⇒ Kostensatz ?</li>
          ${p3?`<li>Prozess 3: ${k3} € / ${p3} Treiber ⇒ Kostensatz ?</li>`:''}
          <li>Produkt X benötigt: P1×${t1}, P2×${t2}${p3?`, P3×${t3}`:''}</li>
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
          <small data-explain>P1=${s1}, P2=${s2}${p3?`, P3=${s3}`:''}; X: ${s1}×${t1} + ${s2}×${t2}${p3?` + ${s3}×${t3}`:''} = ${prozesskosten}.</small>
        </div>
      </div>`;
    return { markup };
  }

  window.Train && window.Train.registerTopic(topic, make);
})();