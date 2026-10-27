# Veröffentlichung über GitHub Pages

Stand: 27. Oktober 2026. Version 1.5.0 (Lernmission).

## Auftrag und Ziel

Der Nutzer hat die Anpassung von GitHub und Hosting beauftragt und ausdrücklich GitHub Pages unter der GitHub-Adresse gewählt. Die BWL-App bleibt getrennt von Believe in Me. Eine eigene Domain oder ein weiterer Hosting-Anbieter ist nicht Teil dieses Schritts.

Online-Adresse: https://hhhhhhhhhhhh12.github.io/bwl-app/
Repository: https://github.com/Hhhhhhhhhhhh12/bwl-app
Quelle: `main`, Ordner `/`.

Die fünf HTML-Einstiege und alle benötigten Dateien sind statisch. `.nojekyll` kennzeichnet die fertigen Dateien; kein Paketdownload und keine Anwendungs-Kompilierung sind nötig. Künftige Uploads auf `main` veröffentlichen diese Quelle automatisch über GitHub Pages.

## Browser-Schutzregeln

Die historische `.htaccess` bleibt als nachvollziehbare Apache-Referenz erhalten. GitHub Pages verarbeitet diese Datei nicht.

Alle aktiven HTML-Seiten enthalten eine früh geladene Content Security Policy als Meta-Angabe. Skripte, Styles, Schriftdateien und Verbindungen bleiben auf die eigene Herkunft beschränkt; eingebetteter ausführbarer JavaScript-Code wird blockiert. Die Referrer-Einstellung wird ebenfalls im HTML gesetzt.

HTTP-Header-Regeln wie `X-Frame-Options`, `frame-ancestors`, Permissions-Policy und die alte Cache-Konfiguration werden dadurch nicht automatisch übernommen. `frame-ancestors` ist bewusst nicht in der Meta-Policy enthalten, weil Browser diese Direktive dort nicht anwenden. HTTPS wird in der Pages-Konfiguration aktiviert.

## Lernstände und Prüfgrenzen

Punkte, Level und Einstellungen bleiben im jeweiligen Browser gespeichert. Vorhandene Lernstände von localhost oder der früheren Believe-in-Me-Adresse werden nicht automatisch auf die GitHub-Adresse übertragen. Es werden keine persönlichen Lernstände hochgeladen.

Die Lernmission besitzt 25 bestandene lokale Prüffälle. Die Pages-Anpassung wird zusätzlich gezielt ohne die Apache-Schutzheader lokal geprüft; dazu gehört, dass die HTML-Policy eingebetteten ausführbaren Code tatsächlich blockiert. Nach der Veröffentlichung werden der GitHub-Bereitstellungsstatus und die öffentlich ausgelieferten Quelldateien geprüft. Eine neue vollständige Geräte-, Fach- oder Screenreader-Abnahme ist damit nicht verbunden.

## Status

- Lernmission 1.5.0 in `main` übernommen und auf GitHub hochgeladen.
- GitHub Pages aktiviert: Quelle `main`, Ordner `/`, HTTPS erzwungen.
- Die erste Bereitstellung von `30f6070` wurde von GitHub mit `built` und ohne Fehler abgeschlossen.
- Vier gezielte lokale Prüfungen im Pages-Modus ohne Apache-Header bestanden: alle Einstiegsseiten, sichtbares Training, Punkte/Pfad und tatsächliche Blockierung eingebetteten Codes durch die HTML-Policy.
- Öffentliche Startadresse und 49 referenzierte Seiten/Dateien schreibfrei abgeglichen: insgesamt 50 Antworten mit HTTP 200, alle inhaltlich identisch mit dem freigegebenen Anwendungsstand. Vorübergehende 503-/Verbindungsfehler verschwanden beim gezielten erneuten Abruf; es blieb kein abweichendes oder fehlendes Asset.
- Die Repository-Homepage verweist auf die öffentliche App.
- Believe in Me, dessen Webspace und DNS wurden bei diesem Auftrag nicht verändert.

Die Online-Quellenprüfung führt keine Lernaktionen aus und liest keine persönlichen Browserdaten. Der frühere lokale Prüfnachweis mit 25 bestandenen Fällen bleibt davon getrennt.
