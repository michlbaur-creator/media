#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Baut die Downloadliste von media.mibaso.de aus dem Ordner 'broschueren'.

Aufruf:   python3 tools/liste_bauen.py
Wirkung:  ersetzt in index.html alles zwischen den beiden Marken
          <!-- HANDZETTEL:START --> und <!-- HANDZETTEL:ENDE -->
          durch je eine Download-Zeile pro PDF im Ordner broschueren/.

Der Dateiname bestimmt, was auf der Seite steht:

    2026-09-16_WhatsApp_Sprachnachrichten.pdf
    -> Titel  "WhatsApp Sprachnachrichten"
       Zusatz "PDF · 0,4 MB · 16.09.2026"

    Unterstrich = Leerzeichen. Bindestriche bleiben stehen.
    Das Datum vorne darf 2026-09-16 oder 2026-09 heissen - oder ganz fehlen.
    Dateien, die mit einem Unterstrich beginnen (_entwurf.pdf), werden
    uebersprungen; so kann man etwas ablegen, ohne es zu veroeffentlichen.

Neueste zuerst. Das Skript laeuft automatisch bei jeder Veroeffentlichung,
es muss niemand von Hand starten.
"""

import html
import re
import sys
from pathlib import Path
from urllib.parse import quote

WURZEL = Path(__file__).resolve().parent.parent
ORDNER = WURZEL / "broschueren"
SEITE = WURZEL / "index.html"
START = "<!-- HANDZETTEL:START -->"
ENDE = "<!-- HANDZETTEL:ENDE -->"

DATUM = re.compile(r"^(\d{4})-(\d{2})(?:-(\d{2}))?[_ -]+(.*)$")


def groesse(bytes_: int) -> str:
    if bytes_ >= 1024 * 1024:
        return f"{bytes_ / 1024 / 1024:.1f} MB".replace(".", ",")
    return f"{max(1, round(bytes_ / 1024))} KB"


def zerlegen(pfad: Path):
    """Dateiname -> (Sortierschluessel, Titel, Datumstext)."""
    stamm = pfad.stem
    treffer = DATUM.match(stamm)
    if treffer:
        jahr, monat, tag, rest = treffer.groups()
        schluessel = f"{jahr}-{monat}-{tag or '00'}"
        datumstext = f"{tag}.{monat}.{jahr}" if tag else f"{monat}/{jahr}"
    else:
        schluessel, datumstext, rest = "0000-00-00", "", stamm
    titel = rest.replace("_", " ").strip()
    return schluessel, titel or stamm, datumstext


def zeilen():
    if not ORDNER.is_dir():
        return []
    dateien = [
        p for p in ORDNER.iterdir()
        if p.is_file() and p.suffix.lower() == ".pdf" and not p.name.startswith(("_", "."))
    ]
    eintraege = []
    for pfad in dateien:
        schluessel, titel, datumstext = zerlegen(pfad)
        eintraege.append((schluessel, titel, datumstext, pfad))
    # neueste zuerst, bei gleichem Datum alphabetisch
    eintraege.sort(key=lambda e: (e[0], e[1].lower()), reverse=True)

    ausgabe = []
    for schluessel, titel, datumstext, pfad in eintraege:
        zusatz = " · ".join(x for x in ("PDF", groesse(pfad.stat().st_size), datumstext) if x)
        ausgabe.append(
            f'    <a class="dl" href="broschueren/{quote(pfad.name)}" '
            f'target="_blank" rel="noopener">\n'
            f'      <span class="ico">PDF</span>'
            f'<span class="titel">{html.escape(titel)}'
            f'<small>{html.escape(zusatz)}</small></span>'
            f'<span class="pfeil">öffnen &rarr;</span></a>'
        )
    return ausgabe


def main() -> int:
    if not SEITE.is_file():
        print("FEHLER: index.html nicht gefunden", file=sys.stderr)
        return 1
    text = SEITE.read_text(encoding="utf-8")
    if START not in text or ENDE not in text:
        print(f"FEHLER: Marken {START} / {ENDE} fehlen in index.html", file=sys.stderr)
        return 1

    liste = zeilen()
    if liste:
        block = "\n".join(liste)
    else:
        block = ('    <p class="hinweis">Zurzeit sind keine Handzettel '
                 "hinterlegt – schau bald wieder vorbei.</p>")

    vorher, rest = text.split(START, 1)
    _, nachher = rest.split(ENDE, 1)
    SEITE.write_text(f"{vorher}{START}\n{block}\n    {ENDE}{nachher}", encoding="utf-8")
    print(f"Downloadliste gebaut: {len(liste)} PDF(s) aus broschueren/")
    for zeile in liste:
        treffer = re.search(r'href="broschueren/([^"]+)"', zeile)
        if treffer:
            print("  ·", treffer.group(1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
