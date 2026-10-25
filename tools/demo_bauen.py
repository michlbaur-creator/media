"""Baut broschueren/40_KI/Demo.pdf neu (5 Karten). Aufruf: python3 tools/demo_bauen.py tools/demo_bilder broschueren/40_KI/Demo.pdf"""
import sys
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader

IMG, OUT = sys.argv[1], sys.argv[2]
W, H = A4
CREME = (0.9686, 0.9529, 0.9098)
TERRA = (0.6118, 0.2902, 0.2275)
INK = (0.2, 0.188, 0.169)

c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle("Demo"); c.setAuthor("Michael Baur")

def Y(t):  # Abstand von oben -> reportlab-y
    return H - t

def text(x, top, s, font, size, col):
    c.setFillColorRGB(*col); c.setFont(font, size)
    c.drawString(x, Y(top) - size * 0.95, s)

def rrect(x, top, w, h, r, col):
    c.setFillColorRGB(*col)
    c.roundRect(x, Y(top + h), w, h, r, stroke=0, fill=1)

def link(x, top, w, h, url):
    c.linkURL(url, (x, Y(top + h), x + w, Y(top)), relative=0, thickness=0)

c.setFillColorRGB(*CREME); c.rect(0, 0, W, H, stroke=0, fill=1)
text(38, 32.1 + 1.5, "MIBASO  /  EINSTIEG  /  KI", "Helvetica", 10, TERRA)
text(38, 50.1 + 4, "Demo", "Times-Roman", 34, INK)
text(38, 109.1 + 1.5, "Fünf Beispiele zum Anklicken: planen, entdecken, vergleichen und kreativ gestalten.",
     "Helvetica", 11, INK)

# --- Illustrationen ohne Foto ---------------------------------------------
def poly(pts, col, x0, t0, s):
    c.setFillColorRGB(*col)
    p = c.beginPath(); p.moveTo(x0 + pts[0][0] * s[0], Y(t0 + pts[0][1] * s[1]))
    for a, b in pts[1:]:
        p.lineTo(x0 + a * s[0], Y(t0 + b * s[1]))
    p.close(); c.drawPath(p, stroke=0, fill=1)

def bild_landschaft(x, top, w, h):
    s = (w / 90, h / 113)
    rrect(x, top, w, h, 0.1, (0.8314, 0.9059, 0.8824))
    c.setFillColorRGB(0.9294, 0.8118, 0.5529); c.circle(x + 66 * s[0], Y(top + 28 * s[1]), 12 * min(s), stroke=0, fill=1)
    poly([(0, 78), (31, 30), (65, 74), (90, 49), (90, 113), (0, 113)], (0.5686, 0.6863, 0.6275), x, top, s)
    poly([(0, 85), (58, 46), (90, 90), (90, 113), (0, 113)], (0.2745, 0.4667, 0.3922), x, top, s)
    rrect(x, top + 89 * s[1], w, 24 * s[1], 0.1, (0.5333, 0.7059, 0.7333))

def blase(cx, ctop, w, h, col, links):
    rrect(cx, ctop, w, h, h / 2.6, col)
    sx = cx + (8 if links else w - 16)
    poly([(0, 0), (8, 0), (0 if links else 8, 7)], col, sx, ctop + h - 1, (1, 1))
    c.setFillColorRGB(1, 1, 1)
    for i in range(3):
        c.circle(cx + w / 2 + (i - 1) * 7, Y(ctop + h / 2), 2, stroke=0, fill=1)

def bild_vergleich(x, top, w, h):
    rrect(x, top, w, h, 0.1, (0.8314, 0.9059, 0.8824))
    blase(x + 8, top + 10, 46, 22, (0.2745, 0.4667, 0.3922), True)
    blase(x + 36, top + 38, 46, 22, TERRA, False)
    # Waage
    m = x + w / 2; b = top + h - 8
    c.setFillColorRGB(*INK)
    c.rect(m - 1.2, Y(b), 2.4, 16, stroke=0, fill=1)           # Säule
    c.rect(m - 12, Y(b), 24, 2.6, stroke=0, fill=1)            # Fuß
    c.setStrokeColorRGB(*INK); c.setLineWidth(1.6)
    c.line(m - 28, Y(b - 16), m + 28, Y(b - 16))               # Balken
    c.setLineWidth(0.8)
    for sx in (-28, 28):
        c.line(m + sx, Y(b - 16), m + sx - 6, Y(b - 7)); c.line(m + sx, Y(b - 16), m + sx + 6, Y(b - 7))
        c.setFillColorRGB(0.9294, 0.8118, 0.5529)
        p = c.beginPath(); p.moveTo(m + sx - 9, Y(b - 7)); p.lineTo(m + sx + 9, Y(b - 7))
        p.arcTo(m + sx - 9, Y(b - 7) - 6, m + sx + 9, Y(b - 7) + 6, 180, 180); p.close()
        c.drawPath(p, stroke=0, fill=1)

def foto(name, maxw, maxh):
    im = Image.open(f"{IMG}/{name}")
    r = min(maxw / im.width, maxh / im.height)
    return ImageReader(im), im.width * r, im.height * r

KARTEN = [
    ("01  /  INTERAKTIVE WEBSEITE", "Viechtach interaktiv",
     ["Ausflugstage tauschen, Regenalternativen wählen, Budget berechnen und eigene",
      "Notizen speichern. Mit Karten und Kalenderexport."],
     "Reiseplan öffnen  >", "https://media.mibaso.de/demos/urlaubsplanung/Viechtach-Urlaubsplan-interaktiv.html",
     "01.jpg"),
    ("02  /  PDF MIT LINKS", "Urlaubsprogramm Viechtach",
     ["Ein ausgearbeiteter Reiseplan mit Natur, Wellness, Einkehr und weiterführenden",
      "Links. Lesen, speichern und ausdrucken."],
     "Urlaubsprogramm öffnen  >", "https://media.mibaso.de/demos/urlaubsplanung/Urlaubsprogramm_Viechtach_2027.pdf",
     "02.png"),
    ("03  /  DIGITALES BUCH", "Der Fuchs und der Wolf",
     ["Ein Vorlesebuch von Michael Baur. Das digitale Flip-Buch verbindet Geschichte",
      "und Bilder und lässt sich Seite für Seite durchblättern."],
     "Flip-Buch öffnen  >", "https://online.fliphtml5.com/mibaso/slmj/", "03.png"),
    ("04  /  REISEPLANUNG MIT CHATGPT", "Deinen Urlaub im Chat planen",
     ["Reiseauftrag kopieren, in den eigenen ChatGPT-Chat einfügen und gemeinsam",
      "planen. Auch mit kostenlosem Zugang, innerhalb seiner Limits."],
     "Reiseauftrag öffnen  >", "https://media.mibaso.de/demos/urlaubsplanung/Reiseauftrag.html", bild_landschaft),
    ("05  /  KI-ANGEBOTE VERGLEICHEN", "KI-Vergleichswerkstatt",
     ["Welche KI passt zu mir? Fünf Chat-Angebote, Kosten und Limits im Überblick –",
      "und im Blindtest selbst beurteilen, welche Antwort überzeugt."],
     "Vergleichswerkstatt öffnen  >", "https://media.mibaso.de/demos/ki-vergleich/#entdecken",
     bild_vergleich),
]

TOP, KH, GAP = 146.0, 112.0, 9.5
for i, (lab, tit, zeilen, knopf, url, bild) in enumerate(KARTEN):
    t = TOP + i * (KH + GAP)
    rrect(38, t, 519.28, KH, 10, (1, 1, 1))
    sx, st, sw, sh = 50, t + 10, 90, KH - 20
    if callable(bild):
        bild(sx, st, sw, sh)
    else:
        ir, iw, ih = foto(bild, sw, sh)
        c.drawImage(ir, sx + (sw - iw) / 2, Y(st + (sh - ih) / 2 + ih), iw, ih)
    link(sx, st, sw, sh, url)
    text(156, t + 8.5, lab, "Helvetica", 8.7, TERRA)
    text(156, t + 20, tit, "Times-Roman", 19, INK)
    for j, z in enumerate(zeilen):
        text(156, t + 46.5 + j * 13, z, "Helvetica", 10.5, INK)
    rrect(156, t + KH - 33, 230, 23, 5, TERRA)
    text(168, t + KH - 33 + 6.2, knopf, "Helvetica", 10.5, (1, 1, 1))
    link(156, t + KH - 33, 230, 23, url)

ende = TOP + 5 * KH + 4 * GAP
text(38, ende + 12, "Zum Öffnen auf das Bild oder die Schaltfläche klicken. Internetverbindung erforderlich.",
     "Helvetica", 10, INK)
text(38, ende + 26, "KI-Vorschläge und Preise sind unverbindlich. Angaben vor einer Buchung prüfen.",
     "Helvetica", 10, INK)
text(38, 797.2 + 1.3, "Michael Baur  |  media.mibaso.de", "Helvetica", 9, TERRA)
c.setFillColorRGB(*TERRA); c.setFont("Helvetica", 9)
c.drawRightString(530.6, Y(797.2 + 1.3) - 9 * 0.95, "KI im Alltag - Beispiele zum Ausprobieren")
c.showPage(); c.save()
