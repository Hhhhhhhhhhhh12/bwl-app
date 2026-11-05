# Isolierte Chromium-Prüfung · 02.11.2026

## Auftrag, Grundlage und Grenzen

Ausgangsstand ist `main` bei `481239a3fef02f3e1bc3743eda88755cac7d5ee4`
(Version 1.6.0). Der Remote-Abgleich bestätigte diesen Stand. Die Arbeit liegt
isoliert auf `codex/bwl-mobile-browser-20261102`.

Beauftragt und freigegeben sind echte isolierte Chromium-Browserprüfungen bei
320 und 390 CSS-Pixeln, technische UI-Korrekturen mit Regressionstests sowie ein
Draft-PR. Merge und Veröffentlichung sind ausgeschlossen. Eine andere
Wiederaufnahme nach Reload ist eine offene fachliche Entscheidung und wurde
nicht umgesetzt.

Maßgebliche Lernregeln: [Lernführung vom 28.10.2026](LERNFUEHRUNG_2026_10_28.md).
Geprüfter und ergänzter Testcode: [tests/browser.test.cjs](../tests/browser.test.cjs).

## Prüfaufbau

- Node.js v24.16.0, Playwright 1.62.0, Chromium 148.0.7778.96; vorhandene
  Installationen, keine Downloads, kein Build.
- Lokaler HTTP-Server ausschließlich an `127.0.0.1`, zufälliger Port;
  GitHub-Pages-Bedingungen mit der HTML-Meta-CSP, ohne Apache-Header.
- Für jeden neuen mobilen Prüffall ein frischer Browserkontext, künstlicher
  Lernstand und explizites Theme. Keine persistenten oder persönlichen Profile.
  Seitenanfragen außerhalb des lokalen Servers werden blockiert.
- Viewports `320 × 844` und `390 × 844`, jeweils Hell/Dunkel. Dies sind
  Chromium-Viewportprüfungen mit Maus-/Klick- und Tastaturbedienung, keine
  Geräteemulation oder Prüfung einer realen Bildschirmtastatur.
- Alle zwölf Themen in Stufe 4; BAB und Zuschlagskalkulation zusätzlich in
  Stufen 1–3: insgesamt **72 neue mobile Prüffälle**. Die Themenidentität wird
  nach dem Laden geprüft, damit gesperrte Themen nicht unbemerkt Ersatzaufgaben
  liefern.
- Die mobile Matrix verwendet den reproduzierbaren Zufallsstartwert `781`.
  Die Grundthemen erhalten künstliche Freischaltungen; das jeweils geprüfte
  Thema beginnt ohne Abschlüsse. Für genau dieses Thema ist Training ausgewählt.

Die Lösungseingaben der Browserabläufe stammen aus `data-answer`. Das prüft
Bedienung, Zustandswechsel und Darstellung. Es ist keine unabhängige fachliche
Neuberechnung; dafür laufen die bestehenden Fachreferenztests gesondert mit.
Die bestehenden Vergleichsregeln und Aufgabenformeln werden nicht verändert.

## Reproduzierbarer technischer Befund U1

**P2: Rechenweg der Zuschlagskalkulation wird durch seinen eigenen Hintergrund
teilweise verdeckt.**

Reproduktion auf dem Ausgangsstand:

1. Frischen Kontext mit obigem künstlichen Lernstand, Theme und Zufallsstartwert
   öffnen; `train.html?topic=zuschlag&difficulty=4` laden.
2. Entweder „Vollständige Lösung · ohne XP“ aktivieren oder die richtigen Werte
   `612` und `734,4` eingeben und „Antwort prüfen“ aktivieren.
3. Den mehrzeiligen grünen Rechenweg unter der Kalkulationstabelle betrachten.

Der gepolsterte `<small class="explain">` bleibt ein Inline-Element.
Inline-Elemente erzeugen bei Zeilenumbrüchen mehrere Hintergrundflächen. Hier
überdeckt deren vertikale Innenpolsterung die jeweils benachbarten Textzeilen
und beginnt bereits innerhalb der Tabelle. Die Inhaltsbreite der Seite bleibt
dabei korrekt; eine reine Prüfung auf horizontalen Überlauf erkennt das nicht.

Bei 320 px zerfällt der Rechenweg im festen Stufe-4-Erfolgsfall in **neun
Fragmente**, bei 390 px in **acht**. Sein Hintergrund beginnt **13 px vor dem
Tabellenende**. Der Fehler ist bei beiden Themes und allen vier Stufen
reproduzierbar. Er tritt sowohl bei eingeblendeter Lösung als auch nach einer
richtigen eigenen Antwort auf.

Die fünf anderen Module mit `<small>`-Rechenwegen verwenden ein Rasterlayout,
das ihre Elemente bereits zu zusammenhängenden Boxen macht. Der Fehler wurde
dort in der mobilen Matrix nicht reproduziert. BAB verwendet einen Block und
ist ebenfalls nicht betroffen.

Korrektur: Die bestehende `.explain`-Regel in `css/style.atelier.css` erhält
`display:block`. Die bestehende `.is-hidden`-Regel blendet verborgene Rechenwege
weiterhin aus. Lernmechanik, Rechenwerte, Texte und gespeicherte Daten bleiben
unverändert.

## Abgrenzung zu Gestaltungswünschen

BAB und Zuschlagskalkulation sind in allen vier Breite-/Theme-Kombinationen
bedienbar. Die geprüften Zahlenwerte passen vollständig in ihre Antwortfelder;
die Felder bleiben im Viewport. Bei 320 px brechen lange Tabellenbezeichnungen,
Abkürzungen und teilweise Prozentangaben mehrfach um. Platzhalter können gekürzt
erscheinen; die vollständige Bezeichnung bleibt als Zeilenüberschrift und
zugänglicher Feldname vorhanden.

Mehr Weißraum, andere Spaltenbreiten, zusammengehaltene Abkürzungen, kürzere
Aufgabentexte oder eine andere mobile Tabellenanordnung wären
Gestaltungsentscheidungen. Die Beobachtungen belegen keinen weiteren
Funktionsverlust. Deshalb gibt es hierfür keine Änderung und keine vorweggenommene
visuelle Nutzerabnahme.

## Abgedeckte Bedienabläufe

Die neue Matrix klickt Hinweis und Rechenansatz, prüft unveränderte Eingaben und
Fortschritte und löst anschließend mit regulären 20 XP. Sie prüft sichtbaren
Rechenweg und begriffliche Erklärung, gesperrte Antworten, wiederholtes Enter ohne
doppelte Wertung und das Ausbleiben eines automatischen Wechsels nach 1,1 Sekunden.
Erst die ausdrückliche Tastaturaktivierung von „Weiter“ öffnet Level 2.

Auf Level 2 wird eine vollständige Lösung eingeblendet. Auch nach Öffnen und
Schließen einer Teilhilfe und anschließendem Prüfen entstehen keine XP,
Versuchsgutschrift oder Abschlüsse. „Neu selbst lösen“ bleibt auf demselben Level,
entfernt den Rechenweg und ermöglicht wieder reguläre XP.

Zusätzlich zur Seitenbreite werden die tatsächliche Textbreite ausgefüllter
Antwortfelder und die Geometrie sichtbarer Rechenwege geprüft: ein
zusammenhängendes Panel, kein Überlappen vorangehender Inhalte und Text innerhalb
des Panels. Screenshots ergänzen diese Messungen; sie ersetzen keine Nutzerabnahme.

## Testergebnisse und Nachweise

Die vollständigen lokalen Artefakte liegen im benachbarten Ordner
`BWL-Browserpruefung-2026-11-02`: Laufprotokolle, Laufzeitdaten, Mess-JSONs,
Vollseiten- und Arbeitsblatt-Screenshots. Die dauerhaft im Repository verfügbare
Auswahl liegt unter [pruefnachweise/mobile-20261102](pruefnachweise/mobile-20261102/).
Die Vollseitenaufnahmen zeigen zusätzlich Navigation, Hilfsaktionen, Weiter und
Lernpfad. Die folgende Auswahl zeigt jeweils das unveränderte Aufgabenbeispiel in
Stufe 4 nach richtiger Antwort; dadurch bleiben Vorher und Nachher vergleichbar.

Geprüfter Anwendungs- und Testcode: **`803fbca84ae054ad9f3da95b7027815c3965e294`**.
Nach diesem Lauf werden nur Dokumentation und Nachweise ergänzt.

| Lauf | Ergebnis | Protokoll |
|---|---|---|
| Vorhandene Browsertests auf 481239a | 31 bestanden, 0 fehlgeschlagen | [Baseline](pruefnachweise/mobile-20261102/baseline-browser.txt) |
| Neue mobile Regressionen vor der CSS-Korrektur | 56 bestanden, 16 fehlgeschlagen; ausschließlich U1 in Zuschlag | [Fehlernachweis](pruefnachweise/mobile-20261102/before-regression.txt) |
| Vollständiger Abschlusslauf nach Korrektur | **124 bestanden, 0 fehlgeschlagen**, 223,86 s | [Abschlusslauf](pruefnachweise/mobile-20261102/final-full.txt) |

Der Abschlusslauf enthält **103 Chromium-Prüffälle** (31 bestehende + 72 neue)
sowie 4 Rechner- und 17 Fachreferenzprüfungen. Die mobile Matrix protokolliert
**360 Zustände**: Aufgabe, Hinweis, Rechenansatz, richtige Antwort und eingeblendete
Lösung für jeden ihrer 72 Fälle. Alle gemessenen Seiten- und Zahlenwertüberläufe
sowie Überlappungen vorangehender Inhalte sind nach der Korrektur 0 px; jeder
sichtbare Rechenweg bildet ein einziges Panel.

Zusätzliche maschinenlesbare Nachweise:
[Matrix](pruefnachweise/mobile-20261102/mobile-matrix.json),
[Laufzeit](pruefnachweise/mobile-20261102/runtime.json),
[Quell-Hashes und geprüfter Commit](pruefnachweise/mobile-20261102/source-sha256.json).
Neben jedem ausgewählten Vorher-/Nachher-Screenshot liegt die zugehörige
Messung mit gleichem Dateinamen und Endung `.json`. Absolute lokale Repositorypfade
in den versionierten Fehlerprotokollen sind durch `<repo>` ersetzt; die lokalen
Originale bleiben erhalten.

| Thema | Viewport/Theme | Ausgangsstand 481239a | Korrektur |
|---|---|---|---|
| Zuschlag | 320 / Hell | [Vorher](pruefnachweise/mobile-20261102/before-zuschlag-light-320.png) | [Nachher](pruefnachweise/mobile-20261102/after-zuschlag-light-320.png) |
| Zuschlag | 320 / Dunkel | [Vorher](pruefnachweise/mobile-20261102/before-zuschlag-dark-320.png) | [Nachher](pruefnachweise/mobile-20261102/after-zuschlag-dark-320.png) |
| Zuschlag | 390 / Hell | [Vorher](pruefnachweise/mobile-20261102/before-zuschlag-light-390.png) | [Nachher](pruefnachweise/mobile-20261102/after-zuschlag-light-390.png) |
| Zuschlag | 390 / Dunkel | [Vorher](pruefnachweise/mobile-20261102/before-zuschlag-dark-390.png) | [Nachher](pruefnachweise/mobile-20261102/after-zuschlag-dark-390.png) |
| BAB | 320 / Hell | [Vorher](pruefnachweise/mobile-20261102/before-bab-light-320.png) | [Nachher](pruefnachweise/mobile-20261102/after-bab-light-320.png) |
| BAB | 320 / Dunkel | [Vorher](pruefnachweise/mobile-20261102/before-bab-dark-320.png) | [Nachher](pruefnachweise/mobile-20261102/after-bab-dark-320.png) |
| BAB | 390 / Hell | [Vorher](pruefnachweise/mobile-20261102/before-bab-light-390.png) | [Nachher](pruefnachweise/mobile-20261102/after-bab-light-390.png) |
| BAB | 390 / Dunkel | [Vorher](pruefnachweise/mobile-20261102/before-bab-dark-390.png) | [Nachher](pruefnachweise/mobile-20261102/after-bab-dark-390.png) |

Weitere Zustandsbeispiele: [BAB-Hinweis, 320 Dunkel](pruefnachweise/mobile-20261102/after-bab-dark-320-hint.png),
[BAB-Rechenansatz, 390 Hell](pruefnachweise/mobile-20261102/after-bab-light-390-method.png),
[Lösung ohne XP, 320 Hell](pruefnachweise/mobile-20261102/after-zuschlag-light-320-solution.png),
[Lösung ohne XP, 390 Dunkel](pruefnachweise/mobile-20261102/after-zuschlag-dark-390-solution.png)
und [Vollseite mit Weiter-Aktion](pruefnachweise/mobile-20261102/after-zuschlag-dark-390-full.png).

## Reproduktion der Prüfungen

Eine vorhandene Playwright-/Chromium-Installation verwenden:

```sh
export BWL_PLAYWRIGHT_MODULE=/absoluter/pfad/zu/playwright
export BWL_CHROMIUM_PATH=/absoluter/pfad/zum/Chromium-Programm
export BWL_TEST_HOSTING=github-pages
export BWL_TEST_ARTIFACTS=/absoluter/pfad/zu/neuen-pruefnachweisen
export BWL_SNAPSHOT_LABEL=review
node --test --test-name-pattern='mobile learning flow' tests/browser.test.cjs
# Gesamter ausdrücklich beauftragter Regressionstest:
node --test tests/calculator.test.cjs tests/content.test.cjs tests/browser.test.cjs
```

Für eine erneute Fehlerreproduktion auf `481239a` nur den ergänzten
`tests/browser.test.cjs` in eine separate Kopie dieses Stands übernehmen; die
CSS-Korrektur nicht übernehmen. Der Testfilter isoliert die 72 mobilen Fälle.

## Status und offene Entscheidungen

- Technische Umsetzung und freigegebene Prüfungen erfolgreich abgeschlossen;
  eine CSS-Deklaration ergänzt, Regressionen und Nachweise gesichert.
- Visuelle Nutzerabnahme bleibt offen.
- Safari/Firefox, echte Mobilgeräte, Bildschirmtastaturen und die aktuell
  ausgelieferte GitHub-Pages-Instanz wurden in diesem Auftrag nicht geprüft.
- Wiederaufnahme nach Reload bleibt eine fachliche Frage. Die bestehenden
  Reload-Tests dokumentieren das vorhandene Verhalten und wurden nicht geändert.
- Übergabe über Draft-PR; keine Integration und keine Veröffentlichung.
