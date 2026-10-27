# Lernatelier / Lernmission: lokale Umsetzung und Prüfung

Stand: 27. Oktober 2026. Basis: `main` bei `7a229a5`.
Arbeitszweig: `work/bwl-lernatelier-20261027`.

## Entscheidung und Freigabe

Der Nutzer hatte zunächst **Lernatelier** gewählt und die lokale Umsetzung samt Prüfung betroffener Ansichten und Abläufe ausdrücklich beauftragt. Nach der Rückmeldung „zu wenig Gaming“ wurde **Lernmission mit ruhigerem Hintergrund** ausdrücklich ausgewählt. Diese Korrektur wird im bereits autorisierten lokalen Ablauf umgesetzt.

| Zustand | Status |
|---|---|
| Designrichtung | Lernmission bestätigt; ruhiger, gleichmäßiger Hintergrund ohne Raster |
| Lokale Umsetzung | Abgeschlossen |
| Lokale technische Prüfung | 25 von 25 Prüffällen bestanden |
| Sichtprüfung der Browseraufnahmen durch Entwicklungsagent | Durchgeführt |
| Visuelle Nutzerabnahme der realen Umsetzung | Aktuelle Lernmission-Umsetzung noch offen; Designrichtung und Hintergrundkorrektur bestätigt |
| Übernahme in `main` / GitHub-Upload dieser Gestaltung | Am 27.10.2026 ausdrücklich beauftragt |
| Bereitstellung / Hostingänderung | GitHub Pages unter der GitHub-Adresse ausdrücklich ausgewählt und beauftragt |

## Umsetzung

- Gleichmäßiger, ruhiger Seitenhintergrund ohne Raster oder Textur, markanter Missionskopf, kräftige serifenlose Überschriften und aktive grüne Akzente; passende dunkle Darstellung. Vorhandene lokale Schriftdatei, keine neue Abhängigkeit oder externe Schriftanfrage.
- Gemeinsame Navigation und Seitengestaltung für Übersicht (auch `index.html`), Training, Erfolge und Einstellungen.
- Übersicht mit Trainingsempfehlung, Themenfortschritt und schmaler Begleitleiste. Themenauswahl bleibt in den Einstellungen erreichbar.
- Training mit klar abgegrenztem Arbeitsblatt und Hauptaktion „Antwort prüfen“. Links steht der Pfad der 15 bestehenden Aufgabenlevel mit den tatsächlich gespeicherten Abschlüssen und dem aktuellen Level; Rang und Kontext ergänzen ihn. Auf schmalen Ansichten steht die Aufgabe zuerst und der Pfad darunter. Die Seite scrollt ohne zusätzliche innere Aufgaben-Scrollbereiche.
- Die Punkteanzeige in der Navigation, der Pfad und der Hinweis auf die nächste mögliche Gutschrift lesen vorhandene Lernstände. Sichtbare Erfolgsrückmeldung zeigt nur die tatsächlich hinzugekommenen Punkte. Eine knappe Benachrichtigung verbindet die bestehende Trainingssteuerung mit dieser Darstellung; sie vergibt selbst keine Punkte und speichert nichts.
- Eine Grafik stellt bei der einfachen Kostenarten-Einstiegsaufgabe die tatsächlich erzeugten Werte und ihre Multiplikation dar. Paketmarken veranschaulichen die tatsächliche Stückzahl. Das Ergebnis erscheint nach Lösungseinblendung oder richtiger Prüfung.
- „Rechenweg“ zeigt die vorhandene Erklärung, ohne Eingaben zu überschreiben oder Punkte zu vergeben. Sie kann die vollständige Rechnung einschließlich Ergebnis enthalten. „Lösung anzeigen“ behält das bisherige Ausfüllen der Antwortfelder bei.
- Der Rechner ist aufklappbar; geschlossen fängt er keine Tastatureingaben ab. Enter auf der Aufklappüberschrift führt ausschließlich deren native Aktion aus.
- Sichtbare textliche Antwortmeldung zusätzlich zu Farbe und bestehender Vorlesemeldung, `aria-invalid` für fehlerhafte Antworten, sichtbarer Sprunglink bei Tastaturfokus.

Aufgabenkennungen, Punktelogik, Speicherung, Freischaltregeln und der automatische Aufgabenwechsel wurden beibehalten. Insbesondere bleiben die bisherige Bewertung angezeigter Lösungen und das Einblenden der Lösung per Enter im ausgefüllten Aufgabenfeld unverändert. Diese Lernregeln sind keine neuen Designentscheidungen.

## Prüfung und behobene Befunde

Abschlusslauf: **25 bestanden, 0 fehlgeschlagen, 0 ausgelassen** (21 Browserfälle und 4 Rechnerfälle), Chromium `148.0.7778.96`, Node.js `24.16.0`.

Die vorhandenen Funktionsprüfungen bleiben enthalten: alle Einstiege unter der unveränderten Content Security Policy, alle zwölf aktiven Themen in vier Schwierigkeitsstufen, vollständiger Kostenarten-Durchlauf, richtige/falsche Antworten, einmalige Punkte, Wiederaufnahme, Einstellungen, Reset, zwei Tabs und Speicherfehler.

Zusätzlich geprüft:

- Levelpfad, einmalige Punkte, 20/14/8-Hinweise aus den bestehenden Regeln, automatische Themenwechsel, Wiederaufnahme und kein aktiver Knoten nach vollständigem Abschluss.
- Punkte- und Pfadanzeigen aktualisieren sich auch nach Fortschrittsänderung oder Reset aus einem zweiten Tab; bei leerer Auswahl wird kein falscher Pfad angezeigt.
- Ruhiger Seitenhintergrund ohne Hintergrundbild in beiden Farbschemata auf allen aktiven Ansichten.

- Rechenweg öffnen/schließen ohne Überschreiben, Lösung anzeigen, zurückgesetzte Hilfestellung nach Aufgabenwechsel.
- Rechner über Tastatur öffnen/schließen, rechnen, geschlossenen Rechner nicht unbeabsichtigt bedienen.
- Alle vier Ansichten hell/dunkel bei 1440, 390 und 320 Pixeln; vorhandene Zwischenbreiten 768 und 1024 Pixel bleiben geprüft.
- Alle zwölf Themen bei 320 Pixeln mit Schwierigkeitsstufe 4, einschließlich Tabellen und fokussierter Begriffserklärungen.
- Auf 200 Prozent vergrößerte Grundschrift bei 320 Pixeln, sichtbarer Sprunglink und Tastatursprung zum Hauptinhalt.

Dabei entdeckt und behoben: unsichtbare Tooltip-Flächen verbreiterten komplexere mobile Aufgaben; lange Begriffe in der Rechengrafik liefen bei großer Schrift über. Geschlossene Tooltips beanspruchen jetzt keinen Platz; geöffnete Hinweise bleiben auf schmalen Fenstern im sichtbaren Bereich. Die Grafik ordnet sich bei geringem Platz untereinander an.

Die Testhilfe des isolierten Rechner-Unit-Tests wurde auf native Aufklappüberschriften erweitert. Die echte Browserbedienung prüft zusätzlich, dass Enter beim Öffnen keine Antwortprüfung auslöst.

Der lokale Testserver bindet an `127.0.0.1`. Die Browserfälle verwenden frische Profile mit künstlichen Lernständen und blockieren nichtlokale Anfragen. Keine Installation, keine persönlichen Browserdaten und kein externer App-Dienst.

## Rückmeldung und nächster Gestaltungsvergleich

Der Nutzer hat die lokale Umsetzung visuell noch nicht abgenommen und die Kritik ausdrücklich auf **Farben, Schrift oder Gesamtwirkung** eingegrenzt. Das ist keine Ablehnung des Lernatelier-Aufbaus und keine allgemeine dauerhafte Farbpräferenz.

Zwei Gegenentwürfe innerhalb der bestehenden Informationsstruktur werden zusammen mit der bisherigen Farbrichtung sichtbar verglichen: „Klar & modern“ (Blau, kräftige serifenlose Schrift) und „Graphit & Terrakotta“ (wärmere neutrale Flächen, rostfarbene Akzente). Diese Vorschläge sind noch nicht ausgewählt und nicht in den App-Quellstand übernommen. Eine weitere Gestaltungsauswahl ist offen.

Die anschließende Nutzerkorrektur lautet **„zu wenig Gaming“**. Die BWL-Oberfläche soll damit eine deutlichere Spielidentität erhalten; ein reiner Wechsel von Farben und Schrift reicht nicht. Der ergänzte sichtbare Vergleich umfasst „Lernmission“ (technische Spieloberfläche mit einem Pfad für die 15 bestehenden Level) und „Lernarena“ (kräftige Konturen und Spielsteine). Die bisherige Lernatelier-Richtung bleibt als Referenz dabei. Empfehlung des Entwicklungsagenten: Lernmission, weil sie den Lernweg sichtbar macht und die Aufgabe fokussiert. Der Nutzer wählte anschließend ausdrücklich **Lernmission**, mit der Bedingung **„ruhigerer Hintergrund!!“**. Das Raster entfällt vollständig; die akzeptierten Gaming-Elemente bleiben erhalten. Lernarena bleibt ungewählt.

Die ursprüngliche separate Gestaltungsvorschau zeigt Rang, Punkte und eine Beispielreaktion mit den bekannten 20/14/8 Punkten. Die anschließend lokal umgesetzte Lernmission bindet diese Darstellung an die echte bestehende Trainingssteuerung. Neue Aufgaben-, Freischalt- oder Belohnungsregeln wurden nicht eingeführt; die Umsetzung ist keine vorweggenommene Nutzerabnahme des Lernablaufs. Die Vorschau wurde in 24 Kombinationen aus Variante, Farbschema und Fensterbreite auf Überläufe und die Beispielbedienung geprüft. Diese Vorschauprüfung ist vom dokumentierten App-Prüfstand getrennt.

## Grenzen und weitere Zustände

Die Aufnahmen wurden visuell kontrolliert; die Nutzerabnahme ist weiterhin offen. Chromium und Fenstergrößen ersetzen keine Prüfung auf echten Mobilgeräten, in Safari/Firefox oder mit einem echten Screenreader. Angegebene Aufgabenlösungen wurden technisch akzeptiert, aber nicht unabhängig fachlich vollständig validiert.

Der Nutzer hat am 27. Oktober 2026 die Anpassung von GitHub und Hosting ausdrücklich beauftragt und GitHub Pages unter der GitHub-Adresse gewählt. Damit ist die Übernahme und Veröffentlichung des vorliegenden Lernmission-Stands freigegeben. Der konkrete Bereitstellungsstatus wird in [GITHUB_PAGES.md](GITHUB_PAGES.md) dokumentiert. Eine separate ausdrückliche visuelle Abnahme wurde nicht nachträglich behauptet.
