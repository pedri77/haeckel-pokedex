"""Las 100 láminas de Kunstformen der Natur (1904) en Commons, con licencia y miniatura estándar.

Lee la página de galería de Commons (ordenada por número de lámina), pide la licencia y el tamaño de cada
fichero y deja datos-crudos/laminas.json. Después consulta GBIF (API pública, sin clave) para el número
de registros de cada grupo.

Uso: python3 -I scripts/explorar.py
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

UA = "haeckel-pd-portfolio/0.1 (static site build; python-urllib)"
RAIZ = Path(__file__).resolve().parent.parent
CACHE = RAIZ / "datos-crudos" / "cache"
COMMONS = "https://commons.wikimedia.org/w/api.php"
GBIF = "https://api.gbif.org/v1"


def get_json(url: str, params: dict, pausa: float = 1.0) -> dict:
    url = f"{url}?{urllib.parse.urlencode(params)}"
    CACHE.mkdir(parents=True, exist_ok=True)
    fc = CACHE / (hashlib.sha1(url.encode()).hexdigest() + ".json")
    if fc.exists():
        return json.loads(fc.read_text())
    for intento in range(6):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                d = json.load(r)
            fc.write_text(json.dumps(d))
            time.sleep(pausa)
            return d
        except Exception as e:  # noqa: BLE001
            ra = getattr(e, "headers", None) and e.headers.get("Retry-After")
            espera = int(ra) if ra and ra.isdigit() else 15 * (intento + 1)
            print(f"  aviso {e!r}, reintento en {espera}s", file=sys.stderr)
            time.sleep(espera)
    raise RuntimeError(url)


def laminas() -> list[dict]:
    d = get_json(COMMONS, {"action": "parse", "page": "Kunstformen_der_Natur", "prop": "wikitext", "format": "json", "formatversion": 2})
    filas = re.findall(r"^(?:Image|File):([^|\n]+)\|(\d+)\.\s*([^{\n]+)", d["parse"]["wikitext"], re.M)
    salida = {}
    for fichero, n, grupo in filas:
        n = int(n)
        if 1 <= n <= 100 and n not in salida:
            salida[n] = {"lamina": n, "fichero": fichero.strip().replace("_", " "), "grupo": grupo.strip()}
    faltan = sorted(set(range(1, 101)) - set(salida))
    if faltan:
        print("faltan láminas:", faltan, file=sys.stderr)
    lista = [salida[n] for n in sorted(salida)]
    for i in range(0, len(lista), 40):
        lote = lista[i:i + 40]
        info = get_json(COMMONS, {"action": "query", "format": "json", "titles": "|".join("File:" + l["fichero"] for l in lote),
                                  "prop": "imageinfo", "iiprop": "extmetadata|size", "iiextmetadatafilter": "LicenseShortName|Artist"})
        por_titulo = {}
        for pag in info["query"]["pages"].values():
            por_titulo[pag["title"].removeprefix("File:")] = pag
        normal = {x["to"]: x["from"] for x in info["query"].get("normalized", [])}
        for l in lote:
            pag = por_titulo.get(l["fichero"]) or next((p for t, p in por_titulo.items() if normal.get("File:" + t, "").removeprefix("File:") == l["fichero"]), None)
            ii = (pag or {}).get("imageinfo", [{}])[0]
            em = ii.get("extmetadata", {})
            l["licencia"] = em.get("LicenseShortName", {}).get("value", "")
            l["ancho"], l["alto"] = ii.get("width"), ii.get("height")
    return lista


def main() -> None:
    lista = laminas()
    (RAIZ / "datos-crudos").mkdir(exist_ok=True)
    (RAIZ / "datos-crudos" / "laminas.json").write_text(json.dumps(lista, ensure_ascii=False, indent=1))
    print(len(lista), "láminas")
    for l in lista:
        print(l["lamina"], l["grupo"], "|", l["licencia"], l["ancho"], l["alto"], "|", l["fichero"])


if __name__ == "__main__":
    main()
