#!/usr/bin/env python3
"""Shrink the rasters embedded in hero.svg to the size they are actually drawn at.

hero.svg is a Figma export: 27 KB of markup wrapping six base64 PNGs, several of
them 4-6x larger than the rect they fill. Each <image> is placed through a
<pattern>/<use> whose transform scale is 1/imageWidth, so resizing a raster means
rescaling that transform by the same factor to keep the drawing identical.
"""
import base64, re, struct, subprocess, sys, tempfile
from pathlib import Path

SVG = Path(__file__).resolve().parent.parent / "src/assets/home/hero.svg"
DPR = 2          # keep rasters crisp on retina displays
MIN_PSNR = 38.0  # reject any encode that is visibly worse than the source

# id -> (width, height) of the rect/path each pattern fills, in SVG user units
RENDERED = {
    "image0_70_182": (1280, 853),   # full-bleed background (cover-fit)
    "image1_70_182": (594, 594),
    "image2_70_182": (488, 522),
    "image3_70_182": (166, 165),
    "image4_70_182": (225, 225),
    "image5_70_182": (338, 505),
}


def png_size(data):
    return struct.unpack(">II", data[16:24])


def psnr(a, b):
    out = subprocess.run(["magick", "compare", "-metric", "PSNR", str(a), str(b), "null:"],
                         capture_output=True, text=True).stderr
    m = re.match(r"([\d.]+)", out.strip())
    return float(m.group(1)) if m else 0.0


def encode(src_png, w, h, tmp):
    """Return (mime, bytes) for the smallest encoding that stays above MIN_PSNR."""
    ref = tmp / "ref.png"
    subprocess.run(["magick", str(src_png), "-resize", f"{w}x{h}!", "-strip", str(ref)], check=True)

    candidates = []
    webp = tmp / "c.webp"
    subprocess.run(["magick", str(ref), "-quality", "90", "-define", "webp:method=6", str(webp)], check=True)
    candidates.append(("image/webp", webp))

    png8 = tmp / "c8.png"
    subprocess.run(["magick", str(ref), "-strip", f"PNG8:{png8}"], check=True)
    candidates.append(("image/png", png8))

    scored = [(p.stat().st_size, mime, p) for mime, p in candidates if psnr(ref, p) >= MIN_PSNR]
    if not scored:  # nothing met the bar - fall back to a lossless resize
        lossless = tmp / "c32.png"
        subprocess.run(["magick", str(ref), "-strip", str(lossless)], check=True)
        scored = [(lossless.stat().st_size, "image/png", lossless)]
    size, mime, path = min(scored)
    return mime, path.read_bytes()


def rescale_transform(transform, fx, fy):
    """Scale a pattern transform so the image still draws at its original size."""
    m = re.fullmatch(r"scale\(([\d.eE+-]+)\)", transform)
    if m:
        assert abs(fx - fy) < 1e-9, "uniform scale() needs a uniform resize"
        return f"scale({float(m.group(1)) * fx:.9g})"
    m = re.fullmatch(r"matrix\(([-\d.eE+ ]+)\)", transform)
    if m:
        a, b, c, d, e, f = (float(v) for v in m.group(1).split())
        return f"matrix({a * fx:.9g} {b:.9g} {c:.9g} {d * fy:.9g} {e:.9g} {f:.9g})"
    raise SystemExit(f"unhandled transform: {transform}")


def main():
    svg = SVG.read_text(encoding="utf-8")
    before = len(svg.encode())

    for img in re.finditer(
        r'<image id="([^"]+)" width="(\d+)" height="(\d+)"([^>]*?)'
        r'xlink:href="data:image/\w+;base64,([A-Za-z0-9+/=]+)"',
        svg,
    ):
        img_id, ow, oh, attrs, b64 = img.group(1), int(img.group(2)), int(img.group(3)), img.group(4), img.group(5)
        raw = base64.b64decode(b64)
        rw, rh = RENDERED[img_id]
        nw, nh = min(ow, round(rw * DPR)), min(oh, round(rh * DPR))

        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            src = tmp / "src.png"
            src.write_bytes(raw)
            mime, data = encode(src, nw, nh, tmp)

        new_img = (f'<image id="{img_id}" width="{nw}" height="{nh}"{attrs}'
                   f'xlink:href="data:{mime};base64,{base64.b64encode(data).decode()}"')
        svg = svg.replace(img.group(0), new_img)

        # every <use> pointing at this image needs its transform rescaled
        if (nw, nh) != (ow, oh):
            fx, fy = ow / nw, oh / nh
            for use in re.finditer(rf'<use xlink:href="#{re.escape(img_id)}" transform="([^"]+)"/>', svg):
                svg = svg.replace(use.group(0), use.group(0).replace(
                    f'transform="{use.group(1)}"', f'transform="{rescale_transform(use.group(1), fx, fy)}"'))

        print(f"  {img_id}: {ow}x{oh} {len(raw)/1024:7.0f} KB  ->  "
              f"{nw}x{nh} {len(data)/1024:6.0f} KB  {mime}")

    SVG.write_text(svg, encoding="utf-8")
    after = len(svg.encode())
    print(f"\nhero.svg: {before/1024/1024:.2f} MB -> {after/1024:.0f} KB "
          f"({before/after:.0f}x smaller)")


if __name__ == "__main__":
    sys.exit(main())
