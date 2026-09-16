# Media Mibaso

Drittes Haus im mibaso-Universum (nach Flora & Fauna).
Vorträge (öffentlich) und VHS-Kursmaterialien (geschützt) rund um digitale Medien.

- `index.html` – öffentliches Schaufenster (media.mibaso.de/)
- `kurse/index.html` – geschützter Kursbereich hinter JS-Vorhang (media.mibaso.de/kurse/)
- `broschueren/` – hier neue PDFs ablegen, die Downloadliste baut sich daraus selbst
- `tools/liste_bauen.py` – baut diese Liste (läuft automatisch beim Veröffentlichen)
- `CNAME` – Custom Domain für GitHub Pages: media.mibaso.de

Hausstil: Creme, Georgia, Kacheln; Leitfarbe Terrakotta #9C4A3A.

## Neuen Handzettel veröffentlichen

1. PDF in den Ordner `broschueren/` legen.
2. Änderung hochladen (GitHub Desktop: „Commit to main" und „Push origin",
   oder auf github.com im Ordner `broschueren` über „Add file → Upload files").
3. Fertig – nach ein bis zwei Minuten steht die neue Zeile auf der Seite.

Der Dateiname bestimmt, was zu lesen ist:

    2026-09-16_WhatsApp_Sprachnachrichten.pdf
    → „WhatsApp Sprachnachrichten“, darunter „PDF · 0,4 MB · 16.09.2026“

- Unterstrich wird zum Leerzeichen, Bindestriche bleiben stehen.
- Datum vorne: `2026-09-16` oder `2026-09` – oder ganz weglassen.
- Neueste stehen oben.
- Dateiname mit `_` am Anfang (`_entwurf.pdf`) = liegt da, wird aber nicht gezeigt.
- Löschen heißt: PDF aus `broschueren/` entfernen, dann verschwindet die Zeile.

<!-- Veröffentlichungs-Anstoß: 2026-07-03 10:11 -->
