# Lernführung und fachliche Korrekturen · 28.10.2026

## Auftrag und Freigabe

Die drei beauftragten Schritte sind gestufte Hilfen, ein ausdrücklicher Weiter-Schritt nach einer richtigen Lösung und eine fachliche Prüfung aller zwölf aktiven Aufgabenmodule. Die lokalen Prüfungen mit frischen Testdaten wurden ausdrücklich freigegeben, einschließlich Hilfestufen, Punkte, Weiter, Wiederaufnahme und aktiver Module.

Die Arbeit erfolgt isoliert auf `work/bwl-learning-flow-20261028`, ausgehend vom veröffentlichten Stand `2a9a250` (1.5.1). Dieser Arbeitsstand ist kein neuer Release. Übernahme nach `main`, Upload und Hostingänderungen sind für diesen Auftrag nicht freigegeben. Bestehende Sicherungen und persönliche Browserprofile werden nicht verändert.

## Lernregeln

- **Hinweis:** kurze gedankliche Orientierung zur aktuellen Aufgabenart; keine generierten Ergebnisse.
- **Rechenansatz:** passende Formeln und Reihenfolge, ohne eingesetzte Aufgabenwerte. Beide Hilfen lassen die normale Punktevergabe bestehen und verändern keine Eingaben.
- **Vollständige Lösung:** füllt die Ergebnisse aus und öffnet den Rechenweg. Ab diesem Moment zählt diese gerenderte Aufgabe ohne XP, Levelabschluss oder Versuchsgutschrift. Das Schließen einer Teilhilfe oder Änderungen an Eingaben heben die Markierung nicht auf.
- **Neu selbst lösen:** erzeugt eine neue Aufgabe desselben offenen Levels ohne Lösungshilfe. Die normale Wertung ist wieder möglich.
- **Antwort prüfen:** richtige selbst gelöste Antworten werden einmalig gespeichert. Vorherige Fehlversuche mindern die XP weiterhin nach den bestehenden Regeln (20/14/8). Die vollständige Rechnung und eine begriffliche Erklärung erscheinen; Antwortfelder werden gegen nachträgliches Verändern gesperrt.
- **Weiter:** erscheint nach einer richtigen eigenen Lösung als Hauptaktion. Ergebnis und Erklärung bleiben bis zur ausdrücklichen Aktivierung sichtbar. Erst dann erfolgt der bestehende Wechsel zum ausgewählten Thema mit dem geringsten Fortschritt.
- **Aufgabe überspringen:** bleibt vor einer eigenen richtigen Lösung möglich und vergibt keine Punkte. Übersprungene oder mit Lösung geübte Level bleiben offen und werden bei Wiederaufnahme wieder angeboten.

Enter prüft Antworten; Taschenrechner, Auswahllisten, native Schaltflächen und Textbereiche behalten ihre eigene Tastaturbedienung. Ein erneutes Enter im bereits gelösten Antwortfeld zählt nicht doppelt und wechselt die Aufgabe nicht. Die Auswahl von „Weiter“ und dessen ausdrückliche Aktivierung mit Enter bleibt möglich.

## Fachliche Modelle und Rundung

Der separate [Fachbericht](FACHPRUEFUNG_2026_10_28.md) dokumentiert alle aktiven Themen, Primärquellen, Modellannahmen, Änderungen und unabhängigen Rechenprüfungen. Historische, nicht geladene Trainingsdateien gehören nicht zum aktiven Umfang.

Die zentrale Bewertung vergleicht mit dem geforderten gerundeten Endwert; Komma und Punkt als Dezimalzeichen sowie ein optionales Prozentzeichen werden akzeptiert. Die bisherige Toleranz von 0,5 Zahlenwerten beziehungsweise einem Prozentpunkt entfällt. Das verhindert etwa, dass ein falscher Centbetrag als richtig gilt. Eine winzige numerische Toleranz von 0,000001 bleibt für JavaScript-Zahlendarstellung.

Bestehende gespeicherte Level und Punkte werden nicht rückwirkend umgewertet. Die bisherigen 15 Slots je Thema, Freischaltregeln und Speicherkennungen bleiben erhalten. Nicht jedes Thema hat bereits vier didaktisch verschiedene Schwierigkeitsvarianten.

## Prüfung und Grenzen

Der gemeinsame Abschlusslauf am 28.10.2026 ist erfolgreich: **52 Tests bestanden, 0 fehlgeschlagen** (31 Browserabläufe, 4 Rechnerprüfungen, 17 fachliche Referenzprüfungen). Laufzeit: 36,33 Sekunden; Node.js v24.16.0, Chromium 148.0.7778.96. Die Fachmatrix enthält 3.640 erzeugte Aufgaben plus gezielte Randfälle.

Abgedeckt sind alle fünf Einstiegsseiten, alle zwölf aktiven Themen in vier Schwierigkeiten, die 15 Kostenarten-Slots, Hilfen mit unveränderten Eingaben, vollständige Lösungen ohne Wertung, 20/14/8-XP, wiederholtes Enter, ausdrückliches Weiter, Themenwechsel, Abschluss, Wiederaufnahme, Tab-Abgleich, Speicherausfälle und verzögerte Initialisierung der Themenauswahl. Die Browsertests lesen für Abläufe die vorgesehenen Lösungswerte; die davon getrennten fachlichen Tests berechnen Referenzwerte aus den sichtbaren Gegebenheiten. Diese Prüfungen haben unterschiedliche Aufgaben.

Alle Ansichten wurden bei 1440, 1024, 768, 390 und 320 Pixel Breite auf Überlauf geprüft; beide Farbschemata bei 1440/390/320. Alle zwölf Aufgabenlayouts wurden tatsächlich im jeweiligen Thema bei 320 Pixel geöffnet, mit zusätzlicher Kontrolle des angezeigten Themennamens. Hilfe/Erfolg passen auch bei verdoppelter Schriftgröße; Tastaturbedienung und reduzierte Bewegung sind abgedeckt. Die Screenshots der neuen Hilfe-/Ergebniszustände und der engsten Themenlayouts wurden zusätzlich stichprobenartig angesehen. Mehrspaltige Kalkulationstabellen bleiben bei 320 Pixel dicht; eine eigene visuelle Abnahme steht aus.

Die ersten Durchläufe fanden Fehler in zwei neuen Testdatensätzen und eine zu frühe Farbabfrage während einer CSS-Transition. Sie wurden korrigiert. Bei der Screenshotkontrolle fiel zudem auf, dass eine bisherige Layoutprüfung nach gesperrten Grundthemen Ersatzaufgaben statt des angeforderten Themas erfassen konnte. Die Vorbereitung verwendet jetzt für jeden Fall passende künstliche Freischaltungen und prüft die tatsächliche Themenidentität. Der genannte Abschlusslauf enthält diese Absicherung.

Prüfnachweise und Screenshots liegen außerhalb des Quell-Repositories im benachbarten Ordner `BWL-Lernfuehrung-Ergebnisse-2026-10-28`; maßgebliches Protokoll ist `05-abschluss-alle-themen.log`. Frühere Durchläufe sind dort getrennt erhalten. Die Regressionen verwenden einen lokalen HTTP-Server an `127.0.0.1`, temporäre Chromium-Kontexte mit ausschließlich künstlichen Daten und blockierte externe Anfragen. Die GitHub-Pages-Bedingung wird lokal durch die HTML-Meta-CSP ohne Apache-Header nachgebildet. Das ist keine erneute Prüfung der veröffentlichten App.

Visuelle Nutzerabnahme, externe Fachabnahme, Safari/Firefox und echte Mobilgeräte bleiben getrennte offene Schritte. Historische Prüfberichte beschreiben weiterhin ihre jeweiligen früheren Stände.


Reproduzierbarer Abschlussbefehl (mit vorhandener Playwright-/Chromium-Installation; keine Installation oder Downloads):

```sh
BWL_TEST_HOSTING=github-pages node --test tests/calculator.test.cjs tests/content.test.cjs tests/browser.test.cjs
```

Bei externer Laufzeit `BWL_PLAYWRIGHT_MODULE` und `BWL_CHROMIUM_PATH` setzen; `BWL_TEST_ARTIFACTS` und `BWL_SNAPSHOT_LABEL` steuern ausschließlich die lokalen Nachweise. Technische Prüfungen bleiben auf den ausdrücklich freigegebenen Umfang begrenzt.
