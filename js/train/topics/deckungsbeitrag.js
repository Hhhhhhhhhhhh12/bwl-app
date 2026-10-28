(function(){
  const topic = 'deckungsbeitrag';
  function r(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  function make(d){
    // d: 1..4 – höhere Stufe = leicht mehr Positionen, aber kopfrechenfreundlich
    const p = r(12,24)*5;                 // Preis z.B. 60..120
    const kv = r(3,9)*5;                  // variable Kosten/Stück z.B. 15..45
    const m  = r(40,200);                 // Menge
    const fk = (d>=3? r(10,40)*50 : r(4,20)*50); // Fixkosten gesamt

    const db_stk = p - kv;                     // Deckungsbeitrag je Stück
    const db_ges = db_stk * m;                 // gesamt
    const pu_kurz = kv;                         // kurzfristige PUG = kv
    const pu_lang = Math.ceil((fk / m) + kv);   // kleinster kostendeckender Preis bei Vorgabe ganzer Euro

    const markup = `
      <div class="card">
        <h3>Deckungsbeitrag & Preisuntergrenzen</h3>
        <p class="muted">Ein Produkt; konstante variable Stückkosten und unveränderte Fixkosten. Die Menge wird vollständig verkauft. Für einen kurzfristigen Zusatzauftrag sind freie Kapazitäten vorhanden, ohne zusätzliche Fixkosten oder Verdrängung anderer Aufträge. Alle Beträge sind netto.</p>
        <ul>
          <li>Verkaufspreis je Stück: <strong>${p} €</strong></li>
          <li>Variable Kosten je Stück: <strong>${kv} €</strong></li>
          <li>Menge: <strong>${m} Stück</strong></li>
          <li>Fixkosten gesamt: <strong>${fk} €</strong></li>
        </ul>

        <div class="task-controls"></div>

        <div class="bab-table task-fields mt-6">
          <label>Deckungsbeitrag je Stück:
            <input data-answer="${db_stk}" placeholder="€/Stück" />
            <span class="i" title="DB je Stück = Preis − variable Kosten"></span>
          </label>
          <label>Gesamter Deckungsbeitrag:
            <input data-answer="${db_ges}" placeholder="€" />
            <span class="i" title="DB gesamt = DB je Stück × Menge"></span>
          </label>
          <label>Kurzfristige Preisuntergrenze je Stück:
            <input data-answer="${pu_kurz}" placeholder="€/Stück" />
            <span class="i" title="kurzfristig: PUG = variable Kosten je Stück"></span>
          </label>
          <label>Langfristige Preisuntergrenze je Stück (auf volle Euro aufrunden):
            <input data-answer="${pu_lang}" placeholder="€/Stück" />
            <span class="i" title="langfristig: variable Stückkosten + Fixkosten/Menge; für einen kostendeckenden Ganz-Euro-Preis aufrunden"></span>
          </label>
          <small class="explain muted is-hidden" data-explain>DB je Stk = ${p} − ${kv} = ${db_stk}; DB gesamt = ${db_stk} × ${m} = ${db_ges}.
          PUG kurz = ${kv}. PUG lang = (${kv} × ${m} + ${fk}) ÷ ${m}; auf volle Euro aufgerundet ${pu_lang} €/Stück. Abrunden könnte einen Teil der Kosten ungedeckt lassen.</small>
        </div>
      </div>`;
    return { markup };
  }

  window.Train && window.Train.registerTopic(topic, make);
})();
