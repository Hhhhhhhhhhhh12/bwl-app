# Lokale Korrekturen nach dem Online-Praxistest

Stand: 28. Oktober 2026. Basis: veröffentlichter Commit `7318a77` (Version 1.5.0).
Zweig: `work/bwl-training-fixes-20261028`.

## Bestätigter Auftrag und Lernregel

Der Nutzer hat die lokale Korrektur der zwei im Online-Praxistest gefundenen Punkte und anschließende lokale Prüfungen mit frischen Daten ausdrücklich freigegeben. Für eingeblendete Lösungen wurde bestätigt: keine XP, kein Levelabschluss, später erneut selbst lösen. Ein Upload oder eine Bereitstellung dieser Korrekturen ist nicht beauftragt.

## Umsetzung

- Enter im ausgefüllten Aufgabenfeld prüft die Antwort. Eine falsche Eingabe wird nicht mehr durch die Lösung ersetzt. Die bisherige Leerfeld-Rückmeldung sowie die native Bedienung von Rechner, Schaltflächen, Auswahlfeldern und Aufklappüberschriften bleiben erhalten.
- „Lösung anzeigen“ und das Öffnen von „Rechenweg“ markieren die aktuelle Aufgabe als Übung mit Lösungshilfe. Das ist bei beiden nötig, weil auch die vorhandenen Rechenwege das Ergebnis enthalten. Zuklappen oder Ändern der Eingabe hebt diese Markierung nicht auf.
- Die Prüfung einer unterstützten Aufgabe vergibt keine Punkte, keinen Levelabschluss und keine Versuchsgutschrift. Bereits gespeicherte Ergebnisse werden nicht rückwirkend verändert. Es gibt keinen automatischen Weitergang nach einer unterstützten Lösung.
- „Neu selbst lösen“ erzeugt eine neue Aufgabe desselben Levels, leert Eingaben/Rechner und blendet Hilfe aus. Auch nach Neuladen bleiben nicht abgeschlossene Level offen und werden als neue Aufgabe wieder angeboten. Es werden keine neuen Speicherschlüssel eingeführt; die Markierung gehört zur aktuell erzeugten Aufgabe.
- Themen-Checkboxen sind bereits im HTML deaktiviert. Erst nachdem Auswahl und Änderungsbehandlung vollständig initialisiert sind, werden sie freigegeben. Währenddessen steht ein sichtbarer Ladehinweis. Frühe Klicks können dadurch nicht mehr später überschrieben werden.

## Prüfung

Lokaler Pages-Modus ohne Apache-Schutzheader, frische isolierte Chromium-Profile und ausschließlich künstliche Daten. Keine Prüfung der laufenden Online-App in diesem Korrekturschritt.

**30 von 30 Fällen bestanden**: 26 Browserfälle und 4 Rechnerfälle. Enthalten sind die vorhandenen Regressionen sowie gezielte neue Nachweise für Enter, Hilfe ohne Gutschrift, erneutes Selbstlösen, offene Level nach Neuladen und verzögert geladene Themenauswahl. Die betroffene Hilfeansicht wurde zusätzlich bei 320 Pixeln in Hell/Dunkel geprüft; der gezielte Nachlauf bestand ebenfalls. Die dunkle Aufnahme wurde visuell kontrolliert.

Die Prüfungen belegen den technischen Ablauf, keine unabhängige fachliche Abnahme aller Aufgaben. Safari, Firefox und physische Geräte sind damit nicht geprüft.

## Integrationsstatus

Lokal umgesetzt und geprüft. `main`, GitHub Pages und die veröffentlichte Version bleiben unverändert bei `7318a77`.
