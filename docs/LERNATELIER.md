# Lernatelier: lokale Umsetzung und Prüfung

Stand: 27. Oktober 2026. Basis: `main` bei `7a229a5`.
Arbeitszweig: `work/bwl-lernatelier-20261027`.

## Entscheidung und Freigabe

Der Nutzer hat nach dem sichtbaren Vergleich die Variante **Lernatelier** gewählt und die lokale Umsetzung samt Prüfung betroffener Ansichten und Abläufe ausdrücklich beauftragt.

| Zustand | Status |
|---|---|
| Designrichtung | Lernatelier bestätigt |
| Lokale Umsetzung | Abgeschlossen |
| Lokale technische Prüfung | 23 von 23 Prüffällen bestanden |
| Sichtprüfung der Browseraufnahmen durch Entwicklungsagent | Durchgeführt |
| Visuelle Nutzerabnahme der realen Umsetzung | Nicht abgenommen; Farben, Schrift und Gesamtwirkung passen noch nicht |
| Übernahme in `main` / GitHub-Upload dieser Gestaltung | Nicht erfolgt |
| Bereitstellung / Hostingänderung | Nicht erfolgt |

## Umsetzung

- Papierfarbene Flächen, dunkelgrüne Aktionen, redaktionelle Überschriften; passende dunkle Darstellung. Vorhandene lokale Schriftdatei, keine neue Abhängigkeit.
- Gemeinsame Navigation und Seitengestaltung für Übersicht (auch `index.html`), Training, Erfolge und Einstellungen.
- Übersicht mit Trainingsempfehlung, Themenfortschritt und schmaler Begleitleiste. Themenauswahl bleibt in den Einstellungen erreichbar.
- Training mit klar abgegrenztem Arbeitsblatt und Hauptaktion „Antwort prüfen“. Kontext und Fortschritt stehen auf großen Fenstern daneben, auf schmalen darunter. Die Seite scrollt ohne zusätzliche innere Aufgaben-Scrollbereiche.
- Eine Grafik stellt bei der einfachen Kostenarten-Einstiegsaufgabe die tatsächlich erzeugten Werte und ihre Multiplikation dar. Das Ergebnis erscheint nach Lösungseinblendung oder richtiger Prüfung.
- „Rechenweg“ zeigt die vorhandene Erklärung, ohne Eingaben zu überschreiben oder Punkte zu vergeben. Sie kann die vollständige Rechnung einschließlich Ergebnis enthalten. „Lösung anzeigen“ behält das bisherige Ausfüllen der Antwortfelder bei.
- Der Rechner ist aufklappbar; geschlossen fängt er keine Tastatureingaben ab. Enter auf der Aufklappüberschrift führt ausschließlich deren native Aktion aus.
- Sichtbare textliche Antwortmeldung zusätzlich zu Farbe und bestehender Vorlesemeldung, `aria-invalid` für fehlerhafte Antworten, sichtbarer Sprunglink bei Tastaturfokus.

Aufgabenkennungen, Punktelogik, Speicherung, Freischaltregeln und der automatische Aufgabenwechsel wurden beibehalten. Insbesondere bleiben die bisherige Bewertung angezeigter Lösungen und das Einblenden der Lösung per Enter im ausgefüllten Aufgabenfeld unverändert. Diese Lernregeln sind keine neuen Designentscheidungen.

## Prüfung und behobene Befunde

Abschlusslauf: **23 bestanden, 0 fehlgeschlagen, 0 ausgelassen** (19 Browserfälle und 4 Rechnerfälle), Chromium `148.0.7778.96`, Node.js `24.16.0`.

Die vorhandenen Funktionsprüfungen bleiben enthalten: alle Einstiege unter der unveränderten Content Security Policy, alle zwölf aktiven Themen in vier Schwierigkeitsstufen, vollständiger Kostenarten-Durchlauf, richtige/falsche Antworten, einmalige Punkte, Wiederaufnahme, Einstellungen, Reset, zwei Tabs und Speicherfehler.

Zusätzlich geprüft:

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

## Grenzen und weitere Zustände

Die Aufnahmen wurden visuell kontrolliert; die Nutzerabnahme ist weiterhin offen. Chromium und Fenstergrößen ersetzen keine Prüfung auf echten Mobilgeräten, in Safari/Firefox oder mit einem echten Screenreader. Angegebene Aufgabenlösungen wurden technisch akzeptiert, aber nicht unabhängig fachlich vollständig validiert.

Der Quellstand ist lokal versioniert. Die frühere Freigabe zum Upload der Funktionskorrekturen erstreckt sich nicht automatisch auf diese neue Gestaltung. `main`, GitHub und das Hosting bleiben auf ihrem vorherigen Stand.
