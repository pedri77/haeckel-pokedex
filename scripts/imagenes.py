"""Descarga las 100 láminas (miniatura estándar de Commons), las pasa a WebP y saca su color dominante.

Salida: public/laminas/NNN.webp (900 px de ancho), public/laminas/m/NNN.webp (240 px) y el campo
`color` (hex) en src/datos/laminas.json. Los originales dan 429 a clientes automáticos: se piden
miniaturas de ancho estándar (960 px).

Uso: uv run --with pillow python -I scripts/imagenes.py
"""
from __future__ import annotations

import colorsys
import io
import json
import sys
import time
import urllib.request
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from explorar import COMMONS, RAIZ, UA, get_json  # noqa: E402

CRUDO = RAIZ / "datos-crudos" / "laminas"
PUB = RAIZ / "public" / "laminas"


def bajar(fichero: str, n: int) -> Path:
    destino = CRUDO / f"{n:03d}.jpg"
    if destino.exists():
        return destino
    info = get_json(COMMONS, {"action": "query", "format": "json", "titles": "File:" + fichero, "prop": "imageinfo", "iiprop": "url", "iiurlwidth": 960})
    url = next(iter(info["query"]["pages"].values()))["imageinfo"][0]["thumburl"].split("?")[0]
    for intento in range(6):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                datos = r.read()
            CRUDO.mkdir(parents=True, exist_ok=True)
            destino.write_bytes(datos)
            time.sleep(1.5)
            return destino
        except Exception as e:  # noqa: BLE001
            ra = getattr(e, "headers", None) and e.headers.get("Retry-After")
            espera = int(ra) if ra and ra.isdigit() else 20 * (intento + 1)
            print(f"  aviso {n}: {e!r}, reintento en {espera}s", file=sys.stderr)
            time.sleep(espera)
    raise RuntimeError(url)


def color_dominante(im: Image.Image) -> str:
    """Media de los píxeles saturados y no demasiado claros (la tinta de color, no el papel)."""
    peq = im.convert("RGB").resize((120, 170))
    r = g = b = n = 0
    for pr, pg, pb in peq.getdata():
        h, l, s = colorsys.rgb_to_hls(pr / 255, pg / 255, pb / 255)
        if s > 0.35 and 0.18 < l < 0.75:
            r, g, b, n = r + pr, g + pg, b + pb, n + 1
    if n < 60:  # lámina casi monocroma: tono de la tinta oscura
        datos = [p for p in peq.getdata() if sum(p) < 330]
        if not datos:
            return "#5a4a3a"
        r, g, b, n = sum(p[0] for p in datos), sum(p[1] for p in datos), sum(p[2] for p in datos), len(datos)
    return "#{:02x}{:02x}{:02x}".format(r // n, g // n, b // n)


def main() -> None:
    ruta = RAIZ / "src" / "datos" / "laminas.json"
    laminas = json.loads(ruta.read_text())
    (PUB / "m").mkdir(parents=True, exist_ok=True)
    total = 0
    for l in laminas:
        orig = bajar(l["fichero"], l["n"])
        im = Image.open(io.BytesIO(orig.read_bytes())).convert("RGB")
        grande = im.resize((900, round(im.height * 900 / im.width)), Image.LANCZOS)
        grande.save(PUB / f"{l['n']:03d}.webp", "WEBP", quality=72, method=6)
        peq = im.resize((240, round(im.height * 240 / im.width)), Image.LANCZOS)
        peq.save(PUB / "m" / f"{l['n']:03d}.webp", "WEBP", quality=70, method=6)
        l["color"] = color_dominante(im)
        l["w"], l["h"] = grande.size
        total += (PUB / f"{l['n']:03d}.webp").stat().st_size + (PUB / "m" / f"{l['n']:03d}.webp").stat().st_size
        print(l["n"], l["color"], end="  ", flush=True)
    ruta.write_text(json.dumps(laminas, ensure_ascii=False, indent=1))
    print(f"\n{len(laminas)} láminas, {total / 1e6:.1f} MB en public/laminas")


if __name__ == "__main__":
    main()
