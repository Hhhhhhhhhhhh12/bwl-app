# Sprachfunktion im Training

Stand: 7. November 2026. Implementierungsentwurf, noch nicht technisch getestet
oder für die Veröffentlichung freigegeben.

## Umfang

Der aufklappbare Bereich „Vorlesen und Diktieren“ ergänzt `train.html`:

- Die sichtbare Aufgabenstellung wird erst auf Knopfdruck vorgelesen.
  Lösungsteile, Formularelemente, Antwortattribute und Tooltips werden ausgelassen.
- Ein Diktat gilt für ein explizit gewähltes, beschreibbares Antwortfeld.
  Auswahlfelder werden weiterhin manuell bedient.
- Das Ergebnis erscheint zunächst in einer korrigierbaren Vorschau. Die Übernahme
  ersetzt das gewählte Feld erst nach Bestätigung. Sie prüft keine Antwort und
  vergibt keine Punkte.
- Aufgabenwechsel, Seitenwechsel, ausgeblendeter Tab und Schließen des Bereichs
  stoppen laufende Sprache. Verspätete Erkennungsergebnisse werden verworfen.
- Ohne unterstützte Browserfunktionen bleibt die bisherige Eingabe verfügbar.

Die Umsetzung verwendet die Web Speech API ohne eigene Schlüssel, neue Pakete
oder einen zusätzlichen Backenddienst. Sie ist keine ElevenLabs-Integration
und kein dialogfähiger KI-Tutor.

## Datenverarbeitung und Grenzen

Die BWL-App speichert keine Audioaufnahme und speichert auch die Freigabe der
Sprachfunktion nicht dauerhaft. Vor dem Start ist eine ausdrückliche Auswahl
im Sprachbereich erforderlich. Je nach Browser und gewählter Stimme können Audio
oder vorgelesener Text durch einen externen Sprachdienst verarbeitet werden.
Eine lokale oder vollständig offline verfügbare Verarbeitung wird nicht zugesagt.
Für das Vorlesen wird eine lokale deutsche Stimme bevorzugt, falls vorhanden.

Spracherkennung ist browserabhängig und nicht überall verfügbar. Zahlen,
Dezimalzeichen und mathematische Formeln können fehlerhaft erkannt oder
vorgelesen werden. Die Vorschau bleibt deshalb korrigierbar. Texteingabe und
explizites Prüfen bleiben erhalten.

Quellen:

- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis

## Durchgeführte Durchsicht

Nur Quellcode-, Diff- und Statusdurchsicht. Die Bewertungs- und Fortschrittsengine
wurde nicht geändert. Die neue Funktion liest keine Sollantworten aus Attributen.
Das bestätigt keine funktionierende Laufzeit oder Browserkompatibilität.

## Vorgeschlagener Testumfang nach ausdrücklicher Freigabe

Die globale `AGENTS.md` im Repository `workflow-arbeitsanweisungen` verlangt eine
ausdrückliche Freigabe für technische Tests. Deshalb wurden keine Tests, Builds,
Simulationen oder Browserprüfungen ausgeführt.

1. Vorhandene Tests für Rechner und Inhalte ausführen. Bestehende Browserprüfung
   zur unveränderten Aufgabenbedienung und Fortschrittsvergabe ausführen.
2. Vorlesen auf einer Textaufgabe und einer Tabelle prüfen. Verborgene und bereits
   aufgedeckte Lösungen dürfen nicht mitgelesen werden. Stoppen, Aufgabenwechsel
   und Seitenwechsel prüfen.
3. Diktat in ein eindeutig gewähltes Feld prüfen. Vorschau bearbeiten, übernehmen
   und anschließend die bestehende Antwortprüfung nutzen. Feldwechsel und
   Aufgabenwechsel dürfen keine späten Ergebnisse in andere Felder übernehmen.
4. Abgelehnte Mikrofonfreigabe, fehlendes Mikrofon, nicht unterstützter Browser,
   ausfallender Sprachdienst und Beendigung einer Aufnahme prüfen.
5. Gesperrte beziehungsweise bereits gelöste Antwortfelder dürfen nicht verändert
   werden. Vorlesen und Diktieren dürfen selbst keine XP vergeben.
6. Tastaturbedienung, verständliche Statusmeldungen und schmale Ansicht prüfen.

Ein Test mit echtem Mikrofon und gegebenenfalls externem Browser-Sprachdienst
benötigt eine entsprechende bewusste Freigabe und neutrale Testeingaben. Eine
simulierte Prüfung ersetzt diesen Kompatibilitätstest nicht. Tests erlauben noch
keine Integration nach `main` oder Veröffentlichung.
