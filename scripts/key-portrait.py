"""Key the white ground out of the avatar so the portrait sits on the page
background instead of on a disc.

The source is a 1024x1024 illustration: a white circle (centre 511.5,511.5
r 357.5) on black, with the figure drawn inside it. It has been through heavy
compression, so the silhouette is not a clean alpha ramp but several pixels of
speckle. Two consequences drive the approach below:

  * the ground is flood-filled from seeds on the rim rather than keyed by
    colour, so the cream shirt and the light highlights inside the figure are
    never mistaken for background;
  * edge pixels are treated as partial coverage of the silhouette, taking their
    colour from the nearest solid pixel. Un-blending their own grey instead
    leaves a bright hairline all the way round the figure.
"""
from PIL import Image, ImageDraw, ImageFilter
import math

SRC, DST = 'src/assets/portrait-source.png', 'src/assets/portrait.png'
CX, CY, R = 511.5, 511.5, 357.5
INSET = 6      # the source's own rim is grey for ~4px; stay inside it
SS = 4         # supersample factor for the disc mask
GROW = 5       # half-width of the edge band, in pixels
LO, HI = 150, 245   # min(r,g,b): <=LO full coverage, >=HI none

src = Image.open(SRC).convert('RGB')
W, H = src.size
px = src.load()

# ---------------------------------------------------------------- disc mask
disc = Image.new('L', (W * SS, H * SS), 0)
ImageDraw.Draw(disc).ellipse(
    [(CX - R + INSET) * SS, (CY - R + INSET) * SS,
     (CX + R - INSET) * SS, (CY + R - INSET) * SS], fill=255)
disc = disc.resize((W, H), Image.BOX)
dpx = disc.load()

# ------------------------------------------------------- flood the white ground
bg = bytearray(W * H)
def whiteish(x, y):
    r, g, b = px[x, y]
    return r > 205 and g > 205 and b > 205

stack = []
for deg in range(360):
    a = math.radians(deg)
    for inset in (INSET + 2, INSET + 8, INSET + 16):
        x = int(CX + (R - inset) * math.cos(a))
        y = int(CY + (R - inset) * math.sin(a))
        if 0 <= x < W and 0 <= y < H and dpx[x, y] and whiteish(x, y) and not bg[y * W + x]:
            bg[y * W + x] = 1
            stack.append((x, y))
while stack:
    x, y = stack.pop()
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= nx < W and 0 <= ny < H:
            i = ny * W + nx
            if not bg[i] and dpx[nx, ny] and whiteish(nx, ny):
                bg[i] = 1
                stack.append((nx, ny))

core = Image.frombytes('L', (W, H), bytes(255 if v else 0 for v in bg))
band = core.filter(ImageFilter.MaxFilter(GROW * 2 + 1))
corepx, bandpx = core.load(), band.load()

# --------------------------------------------- nearest solid colour, propagated
# Everything that is neither ground nor edge band is "solid". Painting the rest
# white and running MinFilter pushes the solid colours outward, so each band
# pixel ends up holding the darkest solid colour near it — which, on this
# drawing, is the ink outline that bounds the figure.
solid = Image.new('L', (W, H), 0)
spx = solid.load()
for y in range(H):
    for x in range(W):
        spx[x, y] = 255 if (dpx[x, y] and not corepx[x, y] and not bandpx[x, y]) else 0
prop = Image.composite(src, Image.new('RGB', (W, H), (255, 255, 255)), solid)
for _ in range(GROW + 2):
    prop = prop.filter(ImageFilter.MinFilter(3))
ppx = prop.load()

# ------------------------------------------------------------------- compose
out = Image.new('RGBA', (W, H))
opx = out.load()
for y in range(H):
    for x in range(W):
        d = dpx[x, y]
        if not d or corepx[x, y]:
            opx[x, y] = (0, 0, 0, 0)
            continue
        r, g, b = px[x, y]
        if bandpx[x, y]:
            m = min(r, g, b)
            a = 255 if m <= LO else (0 if m >= HI else int(255 * (HI - m) / (HI - LO)))
            if not a:
                opx[x, y] = (0, 0, 0, 0)
                continue
            pr, pg, pb = ppx[x, y]
            if min(pr, pg, pb) < 250:
                r, g, b = pr, pg, pb
            else:   # nothing solid within reach — un-blend against white
                f = a / 255.0
                r, g, b = (min(255, max(0, int((c - 255 * (1 - f)) / f))) for c in (r, g, b))
            a = min(a, d)
        else:
            a = d
        opx[x, y] = (r, g, b, a)

alpha = out.getchannel('A').point(lambda v: v if v > 6 else 0)

# The shirt runs off the bottom of the source's disc, so the silhouette ends in a
# flat arc. Fade the last few percent of it out instead, so the figure dissolves
# into the page rather than looking sliced.
apx = alpha.load()
ys = [y for y in range(H) if any(apx[x, y] for x in range(0, W, 2))]
bottom, top = ys[-1], ys[0]
fade = int((bottom - top) * 0.12)
for i in range(fade):
    y = bottom - i
    k = (i / fade) ** 0.6  # 0 at the very bottom row, 1 where the fade ends
    for x in range(W):
        if apx[x, y]:
            apx[x, y] = int(apx[x, y] * k)
out.putalpha(alpha)

x0, y0, x1, y1 = alpha.getbbox()
pad = 10
x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
x1, y1 = min(W, x1 + pad), min(H, y1 + pad)
side = max(x1 - x0, y1 - y0)
cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
out = out.crop((cx - side // 2, cy - side // 2, cx - side // 2 + side, cy - side // 2 + side))
out.resize((720, 720), Image.LANCZOS).save(DST)
print('bbox', (x0, y0, x1, y1), '-> 720x720')
