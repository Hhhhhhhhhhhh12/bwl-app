# BWL-App

Eine browserbasierte Lernanwendung für Kosten- und Leistungsrechnung, unter anderem mit Übungen zu Kostenarten, Kostenstellen, Deckungsbeitrag, Zuschlagskalkulation, BAB und Break-even.

**Entwicklungsstand: lokal in Chromium geprüft; visuelle Nutzerabnahme und fachliche Inhaltsprüfung stehen noch aus.** Dieses Repository ist eine eigenständige Codeablage. Eine neue Bereitstellung der App ist damit nicht verbunden.

## Aufbau

- `index.html` / `dashboard.html`: Übersicht, Themenauswahl und Lernfortschritt.
- `train.html`: Aufgaben, Lösungshinweise und Tastatur-Taschenrechner.
- `achievements.html`: Fortschritts- und Trefferquotenstatistik.
- `settings.html`: Darstellung und Themenauswahl.
- `js/topics.js`: gemeinsame Themenauswahl und Freischaltregeln.
- `js/app.js`, `js/app-shell.js`: Seitenstart, Navigation und Darstellung.
- `js/progress.js`: lokale Fortschritte, Punkte und Diagramme.
- `js/train/`: Trainingssteuerung und Aufgabenmodule.
- `css/`, `assets/`: Styles, Symbole und lokale Schriftdatei.

Die Anwendung besteht aus HTML, CSS und JavaScript. Es gibt keine Paketinstallation und keinen Build-Schritt. Die Dateien sind für die Auslieferung über einen Webserver vorgesehen; die Versionsdatei wird relativ per HTTP abgerufen. Eine konkrete neue Hostingplattform ist noch nicht ausgewählt.

## Lernfortschritt

Die App speichert Fortschritte und Einstellungen lokal im jeweiligen Browser. Es gibt keine Konten, Cloud-Synchronisierung oder reguläre Export-/Importfunktion. Bei einem Wechsel von Domain, Protokoll oder Port werden vorhandene Browserdaten nicht automatisch übernommen. Dieses Repository enthält keine persönlichen Lernfortschrittsdaten.

## Herkunft und Status

Die Versionsgeschichte beginnt mit der ausgewählten Referenzfassung 1.4.4. Darauf folgt die gezielte Zusammenführung ergänzender Quellen: Startablauf, kompatible zusätzliche Kostenarten-Aufgaben, begrenzte Ersatzsuche und Layout-Ergänzungen. Die bisherige Aufteilung in getrennte HTML-Seiten bleibt erhalten. Einzelheiten stehen in [docs/QUELLEN_UND_STATUS.md](docs/QUELLEN_UND_STATUS.md).

Die enthaltene `.htaccess` stammt unverändert aus der Referenzfassung und beschreibt den historischen Apache-Betrieb unter `/bwl-app/`. Sie ist keine fertige Konfiguration für ein neues Hosting. Der laufende bisherige Webauftritt wurde durch die Übernahme in dieses Repository nicht verändert.

## Lokale Prüfung

Die Regressionstests decken App-Start, Training, Punkte/Fortschritt, Einstellungen, Speicherung, Rechner und Darstellungsfehler ab. Umfang, behobene Fehler und Grenzen stehen in [docs/LOKALE_PRUEFUNG.md](docs/LOKALE_PRUEFUNG.md).

Rechnerprüfungen benötigen nur Node.js:

```sh
node --test tests/calculator.test.cjs
```

Für die Browsertests wird eine bereits vorhandene Playwright-/Chromium-Installation verwendet:

```sh
node --test tests/browser.test.cjs
```

Bei einer externen Installation kann `BWL_PLAYWRIGHT_MODULE` auf das vorhandene Playwright-Modul und `BWL_CHROMIUM_PATH` auf den vorhandenen Chromium-Browser zeigen. Die Tests installieren oder laden nichts automatisch herunter. `BWL_TEST_ARTIFACTS` ist ein optionaler Ausgabeordner für Screenshots und Laufzeitangaben. Der Testserver bindet ausschließlich an `127.0.0.1`; jede Prüfung verwendet ein eigenes temporäres Browserprofil mit künstlichen Daten.

## Ziel und offene Schritte

Langfristiges Ziel ist eine eigenständige, online nutzbare und visuell hochwertige BWL-Lernapp. Die aktuellen Gestaltungskorrekturen beheben konkrete Anzeigeprobleme im vorhandenen Stil. Ein größeres Gestaltungskonzept wird getrennt verglichen und abgenommen.

- Visuelle Nutzerabnahme und Prüfung auf echten Geräten sowie in weiteren Browsern.
- Fachliche Prüfung der Aufgaben und Lernregeln.
- Datenübernahme für vorhandene Lernstände.
- Auswahl und Prüfung des neuen Hostings.

Historische Dateien wie `js/router.js`, `js/train-engine.js`, `style.css` und `js/dev/selftest.js` bleiben nachvollziehbar erhalten, werden von den aktiven HTML-Seiten jedoch nicht geladen. Der Selftest enthält Schreibcode und ist keine nachgewiesen schreibfreie Prüfroutine. Es ist kein automatischer Test- oder Deployment-Workflow eingerichtet.
