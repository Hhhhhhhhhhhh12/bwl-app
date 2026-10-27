# Quellen und Entwicklungsstatus

Stand: 27. Oktober 2026.

## Referenz und Übernahmen

Die vom Projekteigentümer bestätigte Referenz ist eine ZIP-Sicherung mit deklarierter Version 1.4.4, hier als **D** bezeichnet. Der erste Commit dieses Repositorys bewahrt ihre 52 Nutzdateien ohne macOS-Metadaten. Die ursprünglichen Quellen bleiben separat unverändert erhalten.

Der zweite Commit enthält die daraus abgeleitete Arbeitsfassung und eine für GitHub bereinigte Dokumentation. Die öffentliche Historie bildet die beiden Quellstände ab; interne Übergabeprotokolle, rechnerbezogene Speicherpfade und lokale Inventare wurden nicht übernommen. Deshalb unterscheiden sich die Commitkennungen von denen der internen Arbeitskopie.

| Quelle | Gezielte Übernahme |
|---|---|
| D – Referenz 1.4.4 | Mehrseitenstruktur, Aufgabenmodule, Fortschrittsformat und Assets |
| A – ergänzender Ordnerstand 1.4.4 | Ersatzsuche für fehlende Aufgaben, auf ausgewählte und freigeschaltete Themen begrenzt |
| A/B – weitere Ordnerstände 1.4.4 | Layout-Ergänzungen und zusätzliche Kostenarten-Inhalte, an die vorhandene Engine-Schnittstelle angepasst |
| E – ZIP-Sicherung 1.4.1 | Muster für einen einmaligen Start und Abgrenzungsaufgaben mit eindeutig gegebenen Ausgangswerten |

## Zusammenführung

- Die bisher vermischte Einseiten- und Mehrseitennavigation ist auf D's getrennte HTML-Seiten ausgerichtet.
- Gemeinsame Themenauswahl, Startablauf, Empfehlung, Aufgabencontainer, Rechnerpanel und Statistik-Renderer sind im Quellcode verbunden.
- Die Kostenarten-Aufgaben verwenden dieselbe Registrierung und Antwortübergabe wie die anderen Aufgabenmodule.
- Eine mögliche Endlosschleife und unterbestimmte Abgrenzungsaufgaben aus D sind durch E's einfachere Aufgabenform ersetzt.
- Aufgabenplätze werden anhand des vorhandenen Gutschriftformats fortgesetzt; verzögerte Übergänge werden bei manuellen Wechseln abgebrochen.
- Sicherheitsheader wurden nicht gelockert. Direkte Styles der modularen Aufgaben wurden in externe Stylesheets verschoben.

## Grenzen

Die erste Zusammenführung wurde ausschließlich anhand von Quellen, Diffs und Dateiinhalten bearbeitet. Am 27. Oktober 2026 wurden danach ausdrücklich beauftragte lokale Rechner- und Browserprüfungen mit Fehlerkorrekturen ergänzt. Der aktuelle Umfang und seine Grenzen sind in `LOKALE_PRUEFUNG.md` dokumentiert. Eine allgemeine Veröffentlichungsreife oder visuelle Nutzerabnahme wird damit nicht behauptet.

Bestehende Lernregeln bleiben erhalten: Bereich 2 setzt jeweils 15 gutgeschriebene Aufgaben in vier Grundthemen voraus; das Abwählen eines erforderlichen Grundthemas kann diese Freischaltung weiterhin verhindern. Der automatische Wechsel zum schwächsten Thema und die bestehende Punktebehandlung nach Lösungshinweisen wurden nicht neu gestaltet.

Kennungen wie `thema_index` bezeichnen Levelplätze, keine exakt gespeicherten Zufallsaufgaben. Die erneute Bearbeitung erzeugt daher weiterhin neue Zahlenvarianten. Ein vollständiger neuer Durchlauf nach Abschluss aller Levels ist nicht neu implementiert. Die vorhandene Stufenleiter-Quelldatei ist weiterhin nicht als aktives Thema eingebunden.

Fortschritt wird weiterhin unter `bwl_prog_v2` gespeichert. Eine automatische Übernahme früherer Schlüssel oder Browserdaten eines anderen Ursprungs ist nicht implementiert. Einzelne Punkte wie Zahleneingaben, Speicherausfälle und Seitenübergänge benötigen eine gesonderte technische Prüfung.

GitHub-Codeablage und Betrieb der Webanwendung sind getrennte Schritte. Es ist kein neuer Hostingdienst, keine GitHub-Pages-Seite und kein automatischer Workflow eingerichtet. Der frühere BWL-Bestand wurde in einem separat freigegebenen Auftrag aus Believe in Me entfernt und vollständig gesichert. Während der lokalen Prüf- und Fehlerkorrekturarbeit wurden keine weiteren Hostingänderungen vorgenommen.
