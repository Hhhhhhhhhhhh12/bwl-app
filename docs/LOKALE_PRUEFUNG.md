# Lokale Prüfung und Fehlerkorrekturen

Stand: 27. Oktober 2026. Ausgangspunkt: GitHub-Quellstand `d72f7c8`.

## Auftrag und langfristiges Ziel

Ausdrücklich beauftragt waren zunächst lokale Tests der GitHub-Arbeitskopie und die Behebung gefundener Fehler. Diese Prüfung erfolgte im getrennten Zweig `work/bwl-lokale-pruefung-20261027`, während `main` und GitHub zunächst unverändert blieben. Danach gab der Nutzer am 27. Oktober 2026 ausdrücklich die Übernahme der getesteten Korrekturen in `main` und den Upload auf GitHub frei. Der getestete Quellstand `0e577bd` ist in dieser Fassung von `main` enthalten; die Dokumentation wurde auf diesen Übernahmestatus aktualisiert. Bereitstellung und Hostingänderungen bleiben ausgeschlossen.

Langfristig soll die BWL-App eigenständig online nutzbar sein und hochwertig aussehen. Die jetzigen Änderungen beheben konkrete Funktions- und Darstellungsfehler im vorhandenen Stil. Eine größere Gestaltung wird später mit sichtbaren Varianten verglichen und vom Nutzer ausgewählt; aus diesen Korrekturen folgt keine visuelle Abnahme.

## Nachgewiesene und behobene Fehler

- **Unsichtbare Aufgaben:** Eine allgemeine CSS-Regel versteckte jedes Element mit `aria-live`, damit auch den gesamten Aufgabenbereich. Nur ausdrücklich als `.sr-only` bezeichnete Elemente werden nun versteckt; kurze Trainingsmeldungen verwenden eine eigene Live-Region.
- **Fehlerhafte Anordnung:** Die Rechnerkarte spannte innerhalb des Aufgabengitters zwölf implizite Spalten auf. Aufgaben und Bedienbereich bleiben nun in einer einzigen definierten Spalte.
- **Mobile Überläufe:** Zwölf feste Gitterabstände verbreiterten Zweikartenbereiche über den Bildschirm. Diese Bereiche verwenden echte ein-/zweispaltige Gitter. Statistik-SVGs und lange Bezeichnungen passen sich schmalen Ansichten an.
- **Schwarzer Fortschrittskreis:** Fehlende SVG-Regeln führten zur standardmäßigen schwarzen Flächenfüllung. Die Darstellung besitzt jetzt definierte Ringlinien und eine zentrierte Prozentanzeige.
- **Trefferquote bei Wiederholung:** Richtige Antworten auf bereits gutgeschriebene Levels erhöhten die Versuche, aber nicht den bisherigen Richtig-Zähler. Ein separater Zähler erfolgreicher Versuche korrigiert Trefferquoten in Training, Dashboard und Statistik; Punkte und abgeschlossene Levels werden weiterhin nur einmal vergeben. Alte Stände ohne den neuen Zähler nutzen die bisher bekannten abgeschlossenen Levels als Ausgangswert. Historisch nicht gespeicherte erfolgreiche Wiederholungen lassen sich nicht nachträglich rekonstruieren.
- **Beschädigte Teilstände:** Ungültige Arrays oder `null` in Gutschriftlisten konnten das Speichern neuer Ergebnisse verhindern. Bekannte Datenfelder werden nun beim Laden normalisiert; gültige Punkte bleiben erhalten. Es wurden ausschließlich künstliche Daten verwendet, keine vorhandenen Nutzerprofile.
- **Unbemerkte Speicherfehler:** Ein blockierter Browser-Speicher erzeugt nun einen sichtbaren Hinweis. Eine teilweise fehlgeschlagene Themenauswahl versucht, die vorherige Auswahl wiederherzustellen. Das aktuelle Ergebnis bleibt bei einem Speicherfehler in der geöffneten Sitzung verfügbar; dauerhafte Speicherung wird nicht behauptet.
- **Höchster Rang:** An der letzten Rangschwelle blieb der Balken leer bzw. wurde ein nicht vorhandener nächster Rang angekündigt. Der letzte Rang zeigt jetzt einen vollen Balken und eine passende Abschlussmeldung.
- **Rechner:** Vorzeichen, Potenzrangfolge und ungültige Dezimalfolgen werden korrekt verarbeitet. Das Feld ist editierbar und unterstützt Auswahl, Einfügen und mobile Texteingabe. Systemkürzel, andere Eingabefelder und die native Aktivierung der Löschtaste bleiben erhalten. Es wird weiterhin kein `eval` verwendet.
- **Lesbarkeit und Bedienhilfen:** Antwortfelder erhalten verständliche Namen, numerische Antworten den Dezimal-Eingabemodus. Glossarbegriffe bleiben lesbare Textbegriffe und unterstützen Tastaturfokus. Richtige/falsche Felder bleiben im dunklen Modus lesbar. Eine reduzierte Bewegungspräferenz unterbindet Ranganimationen.

## Prüfumgebung und Verfahren

- Node.js `24.16.0`, vorhandenes Chromium `148.0.7778.96`, vorhandenes Playwright.
- Testserver ausschließlich auf `127.0.0.1` und einem temporär vergebenen Port.
- Pro Prüffall ein frischer Browserkontext mit künstlichen Lernständen; keine persönlichen Browserdaten.
- Die erzwingende Content Security Policy wird aus der vorhandenen `.htaccess` auf die lokalen Antworten übernommen. Browserfehler, fehlende App-Dateien und CSP-Verstöße werden in den Einstiegs-/Aufgabentests erfasst.
- Keine Installation, kein automatischer Browserdownload, kein externer API-Aufruf der App, kein GitHub-Upload und keine Änderung am Serverbetrieb.

## Automatisierter Umfang

Die Regressionstests bestehen aus vier Rechnerprüfungen und sechzehn Browserprüfungen:

- Alle fünf HTML-Einstiege, Seitennavigation und lokale Assets unter der CSP.
- Sichtbarer und fokussierbarer Aufgabenbereich.
- Falsche/richtige Antworten, einmalige Punktevergabe, automatische Übergänge und Wiederaufnahme nach Neuladen.
- Vollständiger Durchlauf aller 15 Kostenarten-Levels einschließlich dauerhaftem Abschluss.
- Alle zwölf aktiven Themen in jeweils vier Schwierigkeitsstufen: Aufgaben werden erstellt, Antwortfelder sind benannt, die von den Modulen angegebenen Lösungen werden von der Steuerung akzeptiert.
- Leere Auswahl, Einstellungen, Fortschrittsreset und alte Einstiegsfragmente.
- Teilweise beschädigte Testdaten, höchster Rang und Speicherfehler.
- Rechnerbedienung über echte Browser-Eingaben, Auswahl und Löschtaste.
- Dunkles Theme über Seitennavigation hinweg, gesperrte/fremde Themenparameter und Datenaustausch zwischen zwei Testtabs.
- Dashboard, Training, Erfolge und Einstellungen bei 320, 390, 768, 1024 und 1440 Pixeln Breite, ohne horizontales Überlaufen der Seite; zusätzliche Aufnahme des dunklen Trainings bei 390 Pixeln.

Der erste Browserlauf vor den Korrekturen schlug in sechs von zehn damaligen Prüffällen fehl. Die ergänzten Tests bilden auch die später gefundenen Fehler ab. **Abschlusslauf: 20 von 20 Prüffällen bestanden (16 Browserprüfungen, 4 Rechnerprüfungen), keine fehlgeschlagenen oder ausgelassenen Tests.** Das lokale Prüfprotokoll enthält die Einzelergebnisse. Nach der abschließenden mobilen Beschriftungskorrektur wurden die beiden betroffenen Ansichtsprüfungen nochmals gezielt ausgeführt; beide bestanden.

## Praktische Grenzen

Die Prüfung der angegebenen Aufgabenlösungen belegt die Verbindung zwischen Aufgabenmodulen, Eingabeprüfung und Fortschritt. Sie ist keine unabhängige fachliche Validierung sämtlicher Formeln, Beispiele oder Lernziele. Ebenso ersetzen Chromium und simulierte Fensterbreiten keine Prüfung in Safari/Firefox, mit einem echten Screenreader oder auf physischen Mobilgeräten. Es wird keine Barrierefreiheitszertifizierung oder vollständige Sicherheitsevaluierung behauptet.

Die bestehende Freischaltregel (vier Grundthemen mit je 15 gutgeschriebenen Levels), der automatische Wechsel zum schwächeren Thema und die bisherige Behandlung angezeigter Lösungen wurden nicht neu gestaltet. Das Abwählen eines notwendigen Grundthemas kann Bereich 2 weiterhin sperren. Diese Lernregeln sollten vor einer größeren UX-Überarbeitung bewusst bewertet werden.

Die `.htaccess` wurde nicht verändert. Apache-Weiterleitungen, TLS, Domainwechsel, Fortschrittsübernahme und ein neuer Online-Betrieb wurden nicht ausgeführt oder freigegeben. Die hier dokumentierten Korrekturen wurden nach ausdrücklicher Freigabe in `main` übernommen. Der freigegebene GitHub-Upload betrifft ausschließlich den Code. Bereitstellung und visuelle Nutzerabnahme bleiben getrennte, weiterhin offene Zustände.
