# Veröffentlichung über GitHub Pages

Stand: 27. Oktober 2026. Version 1.5.0 (Lernmission).

## Auftrag und Ziel

Der Nutzer hat die Anpassung von GitHub und Hosting beauftragt und ausdrücklich GitHub Pages unter der GitHub-Adresse gewählt. Die BWL-App bleibt getrennt von Believe in Me. Eine eigene Domain oder ein weiterer Hosting-Anbieter ist nicht Teil dieses Schritts.

Geplante Adresse: https://hhhhhhhhhhhh12.github.io/bwl-app/
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

GitHub-Übernahme und Einrichtung sind beauftragt und vorbereitet. Der erfolgreiche Online-Status wird nach Einrichtung ergänzt.
