/* Conceptual help only: no generated numbers or answer values are read here. */
(function () {
  'use strict';
  const guide = (hint, approach, why) => Object.freeze({hint, approach, why});
  const topics = Object.freeze({
    break_even: guide(
      'Welcher Betrag bleibt von einem verkauften Stück nach seinen variablen Kosten übrig?',
      'Berechne zuerst den Deckungsbeitrag je Stück: Preis − variable Stückkosten. Teile die Fixkosten durch diesen Betrag. Wird nach einer Mindestmenge ganzer Stücke gefragt, runde diese Menge auf.',
      'Jedes verkaufte Stück trägt seinen Deckungsbeitrag zur Deckung der Fixkosten bei. Am Break-even sind diese gerade gedeckt.'),
    bab: guide(
      'Ein Zuschlag vergleicht Gemeinkosten mit ihrer jeweiligen Bezugsgröße. Welche Einzelkosten gehören zum Material- und zum Fertigungsbereich?',
      'MGK-Zuschlag = MGK ÷ Materialeinzelkosten × 100; FGK-Zuschlag = FGK ÷ Fertigungslöhne × 100. Für Verwaltung/Vertrieb bilden Material, Löhne und beide Gemeinkosten zusammen die Herstellkosten als Bezugsbasis.',
      'Die Zuschläge machen Gemeinkosten im Verhältnis zur passenden Bezugsbasis vergleichbar. Ein Wechsel der Bezugsbasis verändert den Prozentsatz.'),
    abgrenzung: guide(
      'Nicht jeder Aufwand ist eine betriebliche Kostenposition. Welche Posten gehören nicht zur eigentlichen betrieblichen Leistung?',
      'Gehe vom Gesamtaufwand aus und ziehe neutralen Aufwand ab. Werden zusätzlich kalkulatorische Zusatzkosten genannt, addiere sie. Nutze nur die in der Aufgabe ausdrücklich beschriebenen Korrekturen.',
      'Neutraler Aufwand gehört nicht zu den betrieblichen Kosten. Zusatzkosten ergänzen dagegen betrieblichen Werteverzehr ohne entsprechenden Aufwand.'),
    kostenstellen: guide(
      'Verteile die Kosten zuerst auf eine einzelne Einheit der angegebenen Bezugsgröße. Achte dabei auf die Einheit: Geld je Stunde ist kein Prozentsatz.',
      'Verrechnungssatz = Gemeinkosten ÷ gesamte Maschinenstunden. Kosten des Auftrags = ungerundeter Verrechnungssatz × Auftragsstunden. Beachte die verlangte Endrundung.',
      'Ein Verrechnungssatz ordnet dem Auftrag die Kosten entsprechend seinen beanspruchten Maschinenstunden zu.'),
    deckungsbeitrag: guide(
      'Trenne zunächst die Kosten je Stück von den Kosten für die gesamte Menge. Welche Kosten müssen kurzfristig beziehungsweise langfristig gedeckt werden?',
      'DB je Stück = Preis − variable Stückkosten; DB gesamt = DB je Stück × Menge. Kurzfristige Preisuntergrenze = variable Stückkosten. Langfristig kommen Fixkosten ÷ Menge hinzu. Befolge die verlangte Rundung.',
      'Der Deckungsbeitrag deckt zunächst Fixkosten. Die langfristige Preisuntergrenze berücksichtigt deshalb auch den Fixkostenanteil je Stück.'),
    aequivalenz: guide(
      'Unterschiedliche Varianten beanspruchen unterschiedlich viel. Mache ihre Mengen mithilfe der Äquivalenzziffern vergleichbar.',
      'Recheneinheiten je Variante = Menge × Äquivalenzziffer. Addiere alle Recheneinheiten. Kosten je Recheneinheit = Gesamtkosten ÷ Summe. Stückkosten einer Variante = Kosten je Recheneinheit × ihre Ziffer.',
      'Äquivalenzziffern gewichten die Mengen nach ihrem relativen Kostenverbrauch. Damit werden gemeinsame Kosten auf unterschiedliche Varianten verteilt.'),
    zuschlag: guide(
      'Arbeite die Kostenstufen der Reihe nach ab. Verwaltungs- und Vertriebsgemeinkosten beziehen sich auf die Herstellkosten, nicht nur auf die Einzelkosten.',
      'Herstellkosten = Materialeinzelkosten + Fertigungseinzelkosten + MGK + FGK. Selbstkosten = Herstellkosten + Verwaltungs- und Vertriebsgemeinkosten. Ein Gewinnzuschlag bezieht sich auf die Selbstkosten. Hier jeden Zuschlagsbetrag auf Cent runden und mit diesen Centbeträgen weiterrechnen. Rabatte, Skonti und Umsatzsteuer nur berücksichtigen, wenn sie ausdrücklich genannt werden.',
      'Jede Kalkulationsstufe baut auf der vorherigen auf. Der Nettoverkaufspreis enthält zusätzlich den vorgesehenen Gewinn, aber keine Umsatzsteuer.'),
    prozesskosten: guide(
      'Bestimme zuerst, wie viel eine einzelne Ausführung jedes Prozesses kostet. Danach zählt, wie oft Produkt X diesen Prozess benötigt.',
      'Prozesskostensatz = Prozesskosten ÷ gesamte Treibermenge. Produktkosten = Summe aus ungerundetem Prozesskostensatz × jeweiligem Treiberbedarf. Runde Ausgabewerte erst wie in der Aufgabe verlangt.',
      'Das Produkt trägt die Prozesskosten entsprechend seinem tatsächlichen Treiberbedarf. Frühes Runden der Sätze kann die Summe verfälschen.'),
    kennzahlen: guide(
      'Die Liquiditätsgrade erweitern schrittweise die verfügbaren Mittel. Verwechsle Eigenkapital und Bilanzsumme nicht mit einzelnen Vermögenspositionen.',
      'Liq I = liquide Mittel ÷ kurzfristige Verbindlichkeiten × 100; Liq II ergänzt kurzfristige Forderungen, Liq III zusätzlich Vorräte. EK-Quote = Eigenkapital ÷ Bilanzsumme × 100. Im vereinfachten Zahlungsmodell: Nettozufluss = Einzahlungen − Auszahlungen.',
      'Die Bezugsgrößen bestimmen die Aussage: Liquidität vergleicht verfügbare Mittel mit kurzfristigen Verpflichtungen, die EK-Quote dagegen Eigenkapital mit dem gesamten Kapital.'),
    investition: guide(
      'Welche jährlichen Zahlungen fließen aus der Investition netto zurück? Zähle eine zusätzliche Ersparnis nur einmal.',
      'Jährlicher Nettozufluss = genannter Rückfluss + zusätzlich genannte zahlungswirksame Ersparnis. Teile die Anschaffungsauszahlung durch diesen Zufluss. Bei Zahlungen am Jahresende und gesuchten vollen Jahren runde auf.',
      'Amortisation bedeutet, dass die Rückflüsse die anfängliche Auszahlung ausgleichen. Bei Zahlungen nur am Jahresende erfolgt dieser Ausgleich erst mit einer vollständigen Jahreszahlung.'),
    lager: guide(
      'Ein Anfangs- und ein Endbestand werden zunächst zu einem vereinfachten Durchschnitt zusammengefasst. Häufigerer Umschlag bedeutet kürzere Lagerdauer.',
      'Durchschnittsbestand = (Anfangsbestand + Endbestand) ÷ 2. Umschlag = Jahreswareneinsatz ÷ Durchschnittsbestand. Lagerdauer = 360 ÷ ungerundeter Umschlag. Runde erst die jeweils gefragten Ausgabewerte.',
      'Der Umschlag beschreibt, wie oft der durchschnittliche Lagerbestand im Jahr verbraucht wird. Die Lagerdauer ist daraus mit der vorgegebenen 360-Tage-Annahme abgeleitet.')
  });
  function kostenarten(index, difficulty) {
    if (index === 0 && difficulty === 1) return guide(
      'Die Kostenangabe gilt für ein einzelnes Stück. Wie oft fällt dieser Betrag bei der genannten Menge an?',
      'In dieser Aufgabe ohne Fixkosten gilt: Gesamtkosten = variable Kosten je Stück × Menge.',
      'Die Stückkosten fallen für jedes hergestellte Stück an. Daher wächst ihre Gesamtsumme mit der Stückzahl.');
    if (index === 0) return guide('Welche Kostenpositionen gehören zusammen?', 'Gesamtkosten = Einzelkosten + Gemeinkosten.', 'Beide Kostenarten gehören zur gesamten Kostenbelastung.');
    if (index === 1) return guide(
      'Unterscheide die gesamten Kosten von den Kosten für ein einziges Stück.',
      difficulty === 1 ? 'Gesamtkosten = Fixkosten + variable Stückkosten × Menge. Durchschnittskosten = Gesamtkosten ÷ Menge.' : 'Durchschnittskosten = (Einzelkosten + Gemeinkosten) ÷ Menge. Runde auf volle Euro.',
      'Die Durchschnittskosten verteilen die gesamten Kosten auf die produzierte Menge.');
    if (index < 5) return guide(
      'Prüfe, nach welchem Merkmal gefragt wird: direkte Zurechenbarkeit oder Zahlungswirksamkeit.',
      'Direkt einem Kostenträger zurechenbar bedeutet Einzelkosten; indirekt zuzurechnen bedeutet Gemeinkosten. Pagatorische Kosten beruhen auf Aufwendungen aus Zahlungen; kalkulatorische Kosten sind rechnerische Ansätze.',
      'Zurechenbarkeit und Zahlungsbezug sind unterschiedliche Einteilungsmerkmale und müssen getrennt beurteilt werden.');
    if (index < 10) return guide(
      'Welche Positionen sind ausdrücklich variabel, und welcher Betrag fällt unabhängig von der Menge an?',
      'Addiere Material, Fertigungslohn und variable Gemeinkosten zu den variablen Kosten. Für die Gesamtkosten kommen die Fixkosten hinzu.',
      'Die Aufgabe trennt die variablen Kostenbestandteile von den zusätzlich anfallenden Fixkosten.');
    return guide('Welcher Teil der gesamten Kosten entfällt rechnerisch auf ein Stück?', 'Stückkosten = Gesamtkosten ÷ Menge. Runde wie verlangt auf volle Euro.', 'Die Division verteilt die gesamten Kosten gleichmäßig auf die angegebene Stückzahl.');
  }
  window.BwlGuidance = Object.freeze({
    forTask(topic, index, difficulty) {
      if (topic === 'kostenarten') return kostenarten(index, difficulty);
      return topics[topic];
    }
  });
})();
