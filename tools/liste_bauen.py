#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Baut die Downloadliste von media.mibaso.de aus dem Ordner 'broschueren'.

Aufruf:   python3 tools/liste_bauen.py
Wirkung:  ersetzt in index.html alles zwischen den beiden Marken
          <!-- HANDZETTEL:START --> und <!-- HANDZETTEL:ENDE -->
          durch die fertige Downloadliste.

Der Dateiname bestimmt, was auf der Seite steht:

    2026-09-16_WhatsApp_Sprachnachrichten.pdf
    -> Titel  "WhatsApp Sprachnachrichten"
       Zusatz "PDF · 0,4 MB · 16.09.2026"

    Unterstrich = Leerzeichen. Bindestriche bleiben stehen.
    Das Datum vorne darf 2026-09-16 oder 2026-09 heissen - oder ganz fehlen.
    Dateien, die mit einem Unterstrich beginnen (_entwurf.pdf), werden
    uebersprungen; so kann man etwas ablegen, ohne es zu veroeffentlichen.

Kategorien:

    Jeder Unterordner in broschueren/ wird auf der Seite ein Abschnitt zum
    Aufklappen (<details>/<summary>, ganz ohne Javascript). Der Ordnername
    bestimmt Reihenfolge und Ueberschrift:

        broschueren/30_Internet-und-Sicherheit/   ->  "Internet und Sicherheit"

    Die Zahl vorne sortiert nur (kleine Zahl = weiter oben) und erscheint
    nicht auf der Seite. Unterstriche und Bindestriche werden Leerzeichen.
    Hinten in der Ueberschrift steht, wie viele Zettel drin sind.
    Alle Abschnitte sind offen - ausser solchen, deren Name auf "Archiv"
    endet, die sind zugeklappt. Leere Ordner werden weggelassen.
    Es wird nur eine Ebene tief geschaut; Ordner in Ordnern bleiben aussen vor.

    PDFs, die direkt in broschueren/ liegen, stehen wie bisher ganz oben,
    ohne Abschnitt.

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
PRAEFIX = re.compile(r"^(\d+)[_ -]+(.*)$")


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


def ordnername(ordner: Path):
    """Ordnername -> (Sortierschluessel, Ueberschrift).

    "30_Internet-und-Sicherheit" -> (30, "Internet und Sicherheit")
    Ordner ohne Zahl vorne landen hinten.
    """
    treffer = PRAEFIX.match(ordner.name)
    if treffer:
        zahl, rest = int(treffer.group(1)), treffer.group(2)
    else:
        zahl, rest = 10**6, ordner.name
    titel = rest.replace("_", " ").replace("-", " ").strip()
    return zahl, titel or ordner.name


def sichtbar(pfad: Path) -> bool:
    return (
        pfad.is_file()
        and pfad.suffix.lower() == ".pdf"
        and not pfad.name.startswith(("_", "."))
    )


def kasten(pfad: Path, unterordner: str, einzug: str) -> str:
    """Eine Download-Zeile samt Drucker-Knopf."""
    _, titel, datumstext = zerlegen(pfad)
    zusatz = " · ".join(x for x in ("PDF", groesse(pfad.stat().st_size), datumstext) if x)
    teile = ["broschueren"]
    if unterordner:
        teile.append(quote(unterordner))
    teile.append(quote(pfad.name))
    adresse = "/".join(teile)
    sicher = html.escape(titel)
    return (
        f'{einzug}<div class="dlbox">\n'
        f'{einzug}  <a class="dl" href="{adresse}" target="_blank" rel="noopener">\n'
        f'{einzug}    <span class="ico">PDF</span>'
        f'<span class="titel">{sicher}'
        f'<small>{html.escape(zusatz)}</small></span>'
        f'<span class="pfeil">öffnen &rarr;</span></a>\n'
        f'{einzug}  <button type="button" class="druck" data-pdf="{adresse}" '
        f'data-titel="{sicher}" '
        f'title="Ausdrucken" aria-label="{sicher} ausdrucken">'
        f'<svg viewBox="0 0 24 24" aria-hidden="true">'
        f'<rect class="p" x="7" y="2.5" width="10" height="5.5" rx="1"/>'
        f'<rect x="3" y="8" width="18" height="8" rx="2"/>'
        f'<rect class="p" x="7" y="13" width="10" height="8.5" rx="1"/>'
        f'<circle cx="17.6" cy="11" r="1"/></svg></button>\n'
        f'{einzug}</div>'
    )


def sortiert(dateien):
    """Neueste zuerst, bei gleichem Datum alphabetisch."""
    eintraege = [(zerlegen(p)[0], zerlegen(p)[1].lower(), p) for p in dateien]
    eintraege.sort(key=lambda e: (e[0], e[1]), reverse=True)
    return [e[2] for e in eintraege]


def zeilen():
    """Der fertige HTML-Block plus Anzahl der Zettel."""
    if not ORDNER.is_dir():
        return "", 0

    bloecke = []
    gesamt = 0

    # 1. PDFs, die direkt in broschueren/ liegen - ganz oben, ohne Abschnitt
    lose = sortiert([p for p in ORDNER.iterdir() if sichtbar(p)])
    if lose:
        gesamt += len(lose)
        kaesten = "\n".join(kasten(p, "", "      ") for p in lose)
        bloecke.append(f'    <div class="grid2">\n{kaesten}\n    </div>')

    # 2. Unterordner - je ein Abschnitt zum Aufklappen
    ordner = [p for p in ORDNER.iterdir() if p.is_dir() and not p.name.startswith((".", "_"))]
    ordner.sort(key=lambda p: (ordnername(p)[0], ordnername(p)[1].lower()))

    for unter in ordner:
        dateien = sortiert([p for p in unter.iterdir() if sichtbar(p)])
        if not dateien:
            continue
        gesamt += len(dateien)
        _, ueberschrift = ordnername(unter)
        offen = "" if ueberschrift.strip().lower().endswith("archiv") else " open"
        anzahl = f"{len(dateien)} Zettel"
        kaesten = "\n".join(kasten(p, unter.name, "        ") for p in dateien)
        bloecke.append(
            f'    <details class="kat"{offen}>\n'
            f'      <summary>'
            f'<span class="kat-titel">{html.escape(ueberschrift)}</span>'
            f'<span class="kat-zahl">{anzahl}</span></summary>\n'
            f'      <div class="grid2">\n{kaesten}\n      </div>\n'
            f'    </details>'
        )

    return "\n".join(bloecke), gesamt


def main() -> int:
    if not SEITE.is_file():
        print("FEHLER: index.html nicht gefunden", file=sys.stderr)
        return 1
    text = SEITE.read_text(encoding="utf-8")
    if START not in text or ENDE not in text:
        print(f"FEHLER: Marken {START} / {ENDE} fehlen in index.html", file=sys.stderr)
        return 1

    block, anzahl = zeilen()
    if not anzahl:
        block = ('    <p class="hinweis">Zurzeit sind keine Handzettel '
                 "hinterlegt – schau bald wieder vorbei.</p>")

    vorher, rest = text.split(START, 1)
    _, nachher = rest.split(ENDE, 1)
    SEITE.write_text(f"{vorher}{START}\n{block}\n    {ENDE}{nachher}", encoding="utf-8")

    print(f"Downloadliste gebaut: {anzahl} PDF(s) aus broschueren/")
    for zeile in block.splitlines():
        treffer = re.search(r'<span class="kat-titel">([^<]*)</span>'
                            r'<span class="kat-zahl">([^<]*)</span>', zeile)
        if treffer:
            print(f"  [{treffer.group(1)} – {treffer.group(2)}]")
            continue
        treffer = re.search(r'href="broschueren/([^"]+)"', zeile)
        if treffer:
            print("  ·", treffer.group(1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
