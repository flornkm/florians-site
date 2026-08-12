"""Bakes the tools-page dither thumbnail into public/images/dither-ball.svg.

Replicates dither-plugin's pipeline (screen-blend a 4x4 Bayer threshold map over
the content, then hard-threshold at 50% gray) over a radial-gradient ball, at one
Bayer sub-dot per SVG unit. Pre-rendered because Safari composites the live
filter + mix-blend-mode chain unreliably at thumbnail scale.

Run: python3 scripts/build-dither-ball.py
"""

import math
from pathlib import Path

BAYER = [[0, 4, 1, 5], [6, 2, 7, 3], [1, 5, 0, 4], [7, 3, 6, 2]]
LEVELS = [k * 32 / 255 for k in range(8)]

# radial-gradient(circle at 35% 30%, ...) with stops as (position, luminance);
# positions are fractions of the farthest-corner radius like in CSS.
CENTER = (0.35, 0.30)
STOPS = [(0, 1.0), (0.20, 0.62), (0.52, 0.22), (0.75, 0.0), (1.0, 0.0)]

N = 32  # sub-dots per axis; rendered at 64px this gives the xs-cell 2px dot size


def gradient(d: float) -> float:
    for (p0, c0), (p1, c1) in zip(STOPS, STOPS[1:]):
        if d <= p1:
            return c0 + (c1 - c0) * (0 if p1 == p0 else max(0.0, (d - p0) / (p1 - p0)))
    return STOPS[-1][1]


def is_dark(x: int, y: int) -> bool:
    px, py = (x + 0.5) / N, (y + 0.5) / N
    farthest_corner = math.hypot(max(CENTER[0], 1 - CENTER[0]), max(CENTER[1], 1 - CENTER[1]))
    base = gradient(math.hypot(px - CENTER[0], py - CENTER[1]) / farthest_corner)
    threshold = LEVELS[BAYER[y % 4][x % 4]]
    return 1 - (1 - base) * (1 - threshold) < 0.5


rects = []
for y in range(N):
    x = 0
    while x < N:
        if is_dark(x, y):
            x0 = x
            while x < N and is_dark(x, y):
                x += 1
            rects.append(f'<rect x="{x0}" y="{y}" width="{x - x0}" height="1"/>')
        else:
            x += 1

svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {N} {N}" width="64" height="64" '
    'shape-rendering="crispEdges">'
    f'<clipPath id="dither-ball-clip"><circle cx="{N / 2}" cy="{N / 2}" r="{N / 2}"/></clipPath>'
    f'<g clip-path="url(#dither-ball-clip)"><rect width="{N}" height="{N}" fill="#fff"/>'
    f'<g fill="#000">{"".join(rects)}</g></g></svg>'
)

out = Path(__file__).parent.parent / "public" / "images" / "dither-ball.svg"
out.write_text(svg)
print(f"wrote {out} ({len(svg)} bytes, {len(rects)} rects)")
