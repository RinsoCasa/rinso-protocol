import struct
from collections import Counter
import numpy as np
from PIL import Image

files = [
    r"D:\SADEWA PROJECT\rinso\brand\LOGO RINSO PNG.png",
    r"D:\SADEWA PROJECT\rinso\brand\LOGO RINSO PNG...png",
    r"D:\SADEWA PROJECT\rinso\brand\LOGO RINSO JPG.jpg.jpeg",
    r"D:\SADEWA PROJECT\rinso\reference\SAMPUL RINSO JPG.jpg.jpeg",
]

def read_ihdr(path):
    if not path.lower().endswith('.png'):
        return None
    with open(path, 'rb') as f:
        data = f.read(33)
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        return None
    width, height, bitdepth, colortype, comp, filt, interlace = struct.unpack('>IIBBBBB', data[16:29])
    colortype_map = {0:'grayscale',2:'truecolor',3:'palette',4:'grayscale+alpha',6:'truecolor+alpha'}
    return dict(width=width, height=height, bitdepth=bitdepth, colortype=colortype_map.get(colortype,colortype))

def alpha_histogram(arr):
    if arr.shape[-1] != 4:
        return None
    alphas = arr[...,3].flatten()
    total = alphas.size
    vals, counts = np.unique(alphas, return_counts=True)
    order = np.argsort(-counts)
    top = [(int(vals[i]), int(counts[i]), round(100*counts[i]/total,2)) for i in order[:10]]
    return dict(total=int(total), top=top)

def kmeans_palette(path, k=6, seed=42):
    img = Image.open(path).convert('RGBA')
    w,h = img.size
    arr = np.array(img)
    flat = arr.reshape(-1,4)
    if flat.shape[1]==4 and flat[:,3].min() < 255:
        mask = flat[:,3] > 10
        pts = flat[mask,:3].astype(np.float64)
    else:
        pts = flat[:,:3].astype(np.float64)
    rng = np.random.default_rng(seed)
    # subsample for fitting to bound memory; full pts kept for coord lookup later
    fit_n = min(200000, len(pts))
    fit_idx = rng.choice(len(pts), size=fit_n, replace=False)
    fit_pts = pts[fit_idx]
    idx = rng.choice(len(fit_pts), size=min(k, len(fit_pts)), replace=False)
    centers = fit_pts[idx].copy()
    for _ in range(15):
        d = ((fit_pts[:,None,:]-centers[None,:,:])**2).sum(axis=2)
        assign = d.argmin(axis=1)
        newcenters = centers.copy()
        for i in range(len(centers)):
            sel = fit_pts[assign==i]
            if len(sel):
                newcenters[i] = sel.mean(axis=0)
        centers = newcenters
    # assign full point set in chunks
    assign_full = np.empty(len(pts), dtype=np.int32)
    chunk = 200000
    for start in range(0, len(pts), chunk):
        block = pts[start:start+chunk]
        d = ((block[:,None,:]-centers[None,:,:])**2).sum(axis=2)
        assign_full[start:start+chunk] = d.argmin(axis=1)
    assign = assign_full
    pts_for_count = pts
    results = []
    for i in range(len(centers)):
        sel = pts[assign==i]
        if len(sel)==0:
            continue
        d2 = ((sel-centers[i])**2).sum(axis=1)
        nearest = sel[d2.argmin()]
        hexcode = '#%02x%02x%02x' % tuple(int(v) for v in nearest)
        # find coord of first matching pixel in full arr
        rgb = arr[...,:3]
        match = np.all(rgb == nearest.astype(arr.dtype), axis=-1)
        ys, xs = np.where(match)
        coord = (int(xs[0]), int(ys[0])) if len(xs) else None
        results.append(dict(hex=hexcode, count=int(len(sel)), pct=round(100*len(sel)/len(pts),2), coord=coord))
    results.sort(key=lambda r: -r['count'])
    return results, dict(width=w,height=h)

for f in files:
    print("="*80)
    print(f)
    ihdr = read_ihdr(f)
    if ihdr:
        print("IHDR:", ihdr)
    img = Image.open(f).convert('RGBA')
    arr = np.array(img)
    ah = alpha_histogram(arr)
    if ah:
        print("Alpha histogram (value,count,pct):", ah['top'])
    pal, dims = kmeans_palette(f, k=6)
    print("dims:", dims)
    print("K-means palette (hex,count,pct,coord):")
    for p in pal:
        print("  ", p)
