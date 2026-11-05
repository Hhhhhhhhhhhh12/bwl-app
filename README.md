# BWL-App

Eine browserbasierte Lernanwendung für Kosten- und Leistungsrechnung, unter anderem mit Übungen zu Kostenarten, Kostenstellen, Deckungsbeitrag, Zuschlagskalkulation, BAB und Break-even.

**Version 1.6.0.** Die Lernmission umfasst zwölf Themen, gestufte Hilfen und einen ausdrücklichen Weiter-Schritt. Details zur Lernführung stehen in [docs/LERNFUEHRUNG_2026_10_28.md](docs/LERNFUEHRUNG_2026_10_28.md).

## Aufbau

- `index.html` / `dashboard.html`: Übersicht, Trainingsempfehlung und Lernfortschritt.
- `train.html`: Aufgaben, Lösungshinweise und Tastatur-Taschenrechner.
- `achievements.html`: Fortschritts- und Trefferquotenstatistik.
- `settings.html`: Darstellung und Themenauswahl.
- `js/topics.js`: gemeinsame Themenauswahl und Freischaltregeln.
- `js/app.js`, `js/app-shell.js`: Seitenstart, Navigation und Darstellung.
- `js/progress.js`: lokale Fortschritte, Punkte und Diagramme.
- `js/train/`: Trainingssteuerung und Aufgabenmodule.
- `css/`, `assets/`: Styles, Symbole und lokale Schriftdatei.

Die Anwendung besteht aus HTML, CSS und JavaScript. Es gibt keine Paketinstallation und keinen Build-Schritt.

## Lokal starten

Voraussetzungen sind Git und Python 3. Klone das öffentliche Repository und starte einen lokalen Webserver:

```sh
git clone https://github.com/Hhhhhhhhhhhh12/bwl-app.git
cd bwl-app
python3 -m http.server 8000 --bind 127.0.0.1
```

Öffne [http://127.0.0.1:8000/](http://127.0.0.1:8000/) im Browser. Der Server ist nur auf dem eigenen Gerät erreichbar. Beende ihn mit `Ctrl+C`. Verwende beim nächsten Start dieselbe Adresse und denselben Port, damit der Browser den lokalen Lernstand wiederfindet. Die frühere Pages-Bereitstellung ist [hier dokumentiert](docs/GITHUB_PAGES.md).

## Korrekturen in 1.5.1

Enter prüft Antworten, statt die Lösung einzublenden. Eingeblendete Lösungen und vollständige Rechenwege zählen als Übungen ohne XP und Levelabschluss; „Neu selbst lösen“ erzeugt eine neue Aufgabe desselben Levels. Die Themenauswahl wird erst nach vollständiger Initialisierung freigegeben. Vorhandene Ergebnisse bleiben erhalten.

## Neuerungen in 1.6.0

„Hinweis“ und „Rechenansatz“ zeigen begriffliche Unterstützung ohne ausgefüllte Ergebnisse; die normale Punktevergabe bleibt möglich. „Vollständige Lösung · ohne XP“ zeigt Ergebnis und Rechenweg und nimmt diese Aufgabe aus der Wertung. „Neu selbst lösen“ startet eine neue Aufgabe desselben Levels. Richtige Antworten werden sofort einmalig gespeichert; Erklärung und Ergebnis bleiben bis „Weiter“ sichtbar. „Aufgabe überspringen“ vergibt keine Punkte.

Die zwölf aktiven Aufgabenmodule wurden anhand ihrer Modellannahmen und mit unabhängigen Referenzrechnungen geprüft und korrigiert. Die Aufgaben nennen Einheiten und Rundung ausdrücklich; die Antwortprüfung akzeptiert keine falschen Centbeträge oder pauschalen Abweichungen von einem Prozentpunkt mehr. Quellen, Änderungen und Grenzen stehen in [docs/FACHPRUEFUNG_2026_10_28.md](docs/FACHPRUEFUNG_2026_10_28.md).

## Lernfortschritt

Die App speichert Fortschritte und Einstellungen lokal im jeweiligen Browser. Es gibt keine Konten, Cloud-Synchronisierung oder reguläre Export-/Importfunktion. Bei einem Wechsel von Domain, Protokoll oder Port werden vorhandene Browserdaten nicht automatisch übernommen. Dieses Repository enthält keine persönlichen Lernfortschrittsdaten.

## Herkunft und Status

Die Versionsgeschichte beginnt mit der ausgewählten Referenzfassung 1.4.4. Darauf folgt die gezielte Zusammenführung ergänzender Quellen: Startablauf, kompatible zusätzliche Kostenarten-Aufgaben, begrenzte Ersatzsuche und Layout-Ergänzungen. Die bisherige Aufteilung in getrennte HTML-Seiten bleibt erhalten. Einzelheiten stehen in [docs/QUELLEN_UND_STATUS.md](docs/QUELLEN_UND_STATUS.md).

Die enthaltene `.htaccess` stammt unverändert aus der Referenzfassung und beschreibt den historischen Apache-Betrieb unter `/bwl-app/`. Der lokale Python-Server verarbeitet diese Datei nicht. Die aktiven HTML-Seiten enthalten eine Content Security Policy und eine Referrer-Regel als Meta-Angaben. Zusätzliche HTTP-Schutzheader aus der Apache-Datei gelten nur bei entsprechender Serverkonfiguration.

## Lokale Prüfung

Die Regressionstests decken App-Start, Training, Punkte/Fortschritt, Einstellungen, Speicherung, Rechner und Darstellungsfehler ab. Umfang, behobene Fehler und Grenzen stehen in [docs/LOKALE_PRUEFUNG.md](docs/LOKALE_PRUEFUNG.md).

Rechner- und fachliche Referenzprüfungen benötigen nur Node.js:

```sh
node --test tests/calculator.test.cjs tests/content.test.cjs
```

Für die Browsertests wird eine bereits vorhandene Playwright-/Chromium-Installation verwendet:

```sh
node --test tests/browser.test.cjs
```

Bei einer externen Installation kann `BWL_PLAYWRIGHT_MODULE` auf das vorhandene Playwright-Modul und `BWL_CHROMIUM_PATH` auf den vorhandenen Chromium-Browser zeigen. Die Tests installieren oder laden nichts automatisch herunter. `BWL_TEST_ARTIFACTS` ist ein optionaler Ausgabeordner für Screenshots und Laufzeitangaben. Der Testserver bindet ausschließlich an `127.0.0.1`; jede Prüfung verwendet ein eigenes temporäres Browserprofil mit künstlichen Daten.

## Ziel und offene Schritte

Langfristiges Ziel ist eine eigenständige und visuell hochwertige BWL-Lernapp. Nach dem sichtbaren Variantenvergleich und der Rückmeldung zur Spielidentität hat der Nutzer „Lernmission“ mit ruhigem Hintergrund ausgewählt. Die lokale Umsetzung umfasst alle aktiven Seiten, helle und dunkle Darstellung, einen Levelpfad aus gespeicherten Abschlüssen, Punkteanzeigen und einen klaren Arbeitsbereich mit aufklappbarem Rechner. Auswahl, Umsetzung, technische Prüfung und visuelle Abnahme sind in [docs/LERNATELIER.md](docs/LERNATELIER.md) getrennt dokumentiert.

- Visuelle Nutzerabnahme und Prüfung auf echten Geräten sowie in weiteren Browsern.
- Zusätzliche externe Fachabnahme und Ausbau der bisher vereinfachten Aufgabenmodelle.
- Datenübernahme für vorhandene Lernstände.

Historische Dateien wie `js/router.js`, `js/train-engine.js`, `style.css` und `js/dev/selftest.js` bleiben nachvollziehbar erhalten, werden von den aktiven HTML-Seiten jedoch nicht geladen. Der Selftest enthält Schreibcode und ist keine nachgewiesen schreibfreie Prüfroutine. Im Repository ist kein eigener Test- oder Deployment-Workflow definiert.
