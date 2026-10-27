# BWL-App (MPA)

## Struktur
- dashboard.html — Übersicht, Empfehlung, Gesamtfortschritt
- train.html — Training (Tasks, Rechner, Fortschritte)
- achievements.html — Erfolge, Statistiken
- settings.html — Themenauswahl, Theme
- css/ — Styles (base, layout, components, a11y, animations, themen)
- js/
  - app-shell.js — gemeinsamer Rahmen (Nav aktiv, Version, Theme)
  - progress.js — Fortschritt, XP, Ränge, Balken/Donut
  - quickstart.js — Dashboard-Empfehlung, Start-Buttons
  - calc.js — Rechner (dauerhaft sichtbar auf train.html)
  - train/
    - engine.js — Aufgabenlauf (Themenwechsel, Prüfen, Reveal, Next)
    - topics/*.js — einzelne Themen (max 15 Level je Thema)
  - dev/selftest.js — DEV-Overlay (optional)

## Anforderungen
- Keine Inline-Styles/Events (CSP-konform)
- Scripts mit `defer`, korrekte Reihenfolge:
  progress.js → app-shell.js → (seiten-spezifisch)
- Version in `version.txt` (SemVer)

## Deploy (IONOS)
1. Lokal testen (Chrome DevTools: Hard Reload + Cache leeren).
2. Per Cyberduck hochladen.
3. `.htaccess` im Ordner `/bwl-app/` hinterlegen (CSP, Redirect, Caching).

## Pflege
- Backup nach jeder Minor-Version (z. B. 1.4.x).
- Selftest (`?dev=1`) nur in DEV.
- Keine Löschorgien: Artefakte erst entfernen, wenn **nichts** mehr referenziert.
© 2025 – BWL‑App by Henneke

## Entwicklung
- HTML lokal via Live Server oder `file://` öffnen.
- Änderungen an JS/CSS mit Chrome DevTools (Sources) prüfen.
- Build/Test über Selftest (`?dev=1`) oder `console.debug()`.

## Browser-Support
- Getestet in Chrome, Safari und Edge.
- Firefox funktioniert, zeigt aber teils restriktivere CSP-Meldungen.

## Versionierung
- Changelog und aktuelle Version in `version.txt`.
- Format: `x.y.z (Datum)`.