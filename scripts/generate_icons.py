"""
Génère les icônes PWA (PNG) à partir d'un dégradé + éclair blanc.
Aucune police externe requise (l'éclair est un polygone vectoriel).

Usage : python3 scripts/generate_icons.py
Sortie : public/icon-192.png, icon-512.png, maskable-512.png,
         apple-touch-icon.png, favicon-64.png
"""
from PIL import Image, ImageDraw

OUT = "public"
BIG = 1024

# Dégradé de marque (indigo -> violet)
TOP = (99, 102, 241)   # #6366F1
BOT = (139, 92, 246)   # #8B5CF6

# Éclair normalisé dans une boîte [0,1] x [0,1]
BOLT = [
    (0.60, 0.03), (0.24, 0.55), (0.46, 0.55),
    (0.38, 0.97), (0.80, 0.41), (0.54, 0.41), (0.66, 0.03),
]


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(size):
    img = Image.new("RGB", (size, size), TOP)
    px = img.load()
    for y in range(size):
        c = lerp(TOP, BOT, y / (size - 1))
        for x in range(size):
            px[x, y] = c
    return img


def rounded_mask(size, radius):
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return m


def draw_bolt(img, box_frac):
    size = img.size[0]
    box = size * box_frac
    ox = (size - box) / 2
    oy = (size - box) / 2
    pts = [(ox + bx * box, oy + by * box) for (bx, by) in BOLT]
    ImageDraw.Draw(img).polygon(pts, fill=(255, 255, 255))


def main():
    LANCZOS = Image.Resampling.LANCZOS

    # Icône arrondie (fond app classique)
    base = gradient(BIG)
    draw_bolt(base, 0.46)
    rounded = base.convert("RGBA")
    rounded.putalpha(rounded_mask(BIG, int(BIG * 0.22)))
    for s in (192, 512):
        rounded.resize((s, s), LANCZOS).save(f"{OUT}/icon-{s}.png")
    rounded.resize((64, 64), LANCZOS).save(f"{OUT}/favicon-64.png")

    # Maskable : plein cadre, éclair dans la zone de sécurité (~60%)
    mbase = gradient(BIG)
    draw_bolt(mbase, 0.34)
    mbase.resize((512, 512), LANCZOS).save(f"{OUT}/maskable-512.png")

    # Apple touch : plein cadre carré (iOS applique son propre arrondi)
    abase = gradient(BIG)
    draw_bolt(abase, 0.46)
    abase.resize((180, 180), LANCZOS).save(f"{OUT}/apple-touch-icon.png")

    print("Icônes générées dans", OUT)


if __name__ == "__main__":
    main()
