from PIL import Image

SRC = r"D:\SADEWA PROJECT\rinso\brand\LOGO RINSO PNG...png"
OUT = r"D:\SADEWA PROJECT\rinso\assets\favicon.svg"
GRID = 32

img = Image.open(SRC).convert('RGBA')
w, h = img.size
stride_x = w / GRID
stride_y = h / GRID

cells = []
for gy in range(GRID):
    for gx in range(GRID):
        # sample at real pixel coordinate: center of each grid cell, nearest-neighbor
        px = int((gx + 0.5) * stride_x)
        py = int((gy + 0.5) * stride_y)
        r, g, b, a = img.getpixel((px, py))
        if a < 40:
            continue
        cells.append((gx, gy, r, g, b, px, py))

svg_rects = []
for gx, gy, r, g, b, px, py in cells:
    hexcode = '#%02x%02x%02x' % (r, g, b)
    svg_rects.append(f'<rect x="{gx}" y="{gy}" width="1.02" height="1.02" fill="{hexcode}"/>')

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {GRID} {GRID}">
<!-- Traced from real pixel grid of brand/LOGO RINSO PNG...png (2000x2000, alpha channel).
     {GRID}x{GRID} cells sampled nearest-neighbor at each cell center: px = floor((gx+0.5)*{stride_x:.4f}), py = floor((gy+0.5)*{stride_y:.4f}).
     Colors read directly from source pixels, no invented hex. Alpha<40 treated as transparent (background). -->
{chr(10).join(svg_rects)}
</svg>
'''

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(svg)

print("wrote", OUT, "cells:", len(cells))
