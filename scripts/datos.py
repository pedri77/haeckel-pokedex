"""Fichas de las 100 láminas: nombre en castellano, grupo, taxón moderno en GBIF y texto propio.

Lee datos-crudos/laminas.json (de explorar.py), comprueba la licencia, consulta GBIF (nº de registros
del taxón moderno equivalente) y escribe src/datos/laminas.json.

Uso: python3 -I scripts/datos.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from explorar import GBIF, RAIZ, get_json  # noqa: E402

# grupo: protistas · plantas · hongos · cnidarios · equinodermos · invertebrados · artropodos · vertebrados
# gbif: (nombre, reino) del taxón moderno más cercano, o None si el grupo de Haeckel no tiene equivalente o está extinto.
FICHAS: dict[int, tuple[str, str, tuple[str, str] | None, str]] = {
    1: ("Radiolarios feodarios", "protistas", None, "Esqueletos de sílice más pequeños que un grano de arena. Haeckel describió miles de radiolarios a partir de las muestras de la expedición del Challenger."),
    2: ("Protistas con concha", "protistas", None, "Una sola célula que se fabrica una casa con forma de ánfora o de botella. El grupo de Haeckel ya no se usa."),
    3: ("Ciliados", "protistas", None, "Células cubiertas de pestañas que remueven el agua para nadar y comer. Ningún grupo moderno coincide con el de Haeckel."),
    4: ("Diatomeas", "protistas", ("Bacillariophyta", "Chromista"), "Algas de una célula encerradas en una caja de vidrio con tapa. Producen una parte enorme del oxígeno del planeta."),
    5: ("Esponjas calcáreas", "cnidarios", ("Calcarea", "Animalia"), "Esponjas con agujas de cal. Haeckel les dedicó una monografía entera en 1872."),
    6: ("Hidroides tubularios", "cnidarios", ("Anthoathecata", "Animalia"), "Pólipos con aspecto de flor que viven en colonias fijas al fondo y sueltan pequeñas medusas."),
    7: ("Sifonóforos", "cnidarios", ("Siphonophorae", "Animalia"), "No es un animal sino una colonia: cada pieza, flotador, campana o tentáculo, es un individuo especializado."),
    8: ("Medusas discoidales", "cnidarios", ("Scyphozoa", "Animalia"), "La gran medusa del centro se llama Desmonema annasethe, en recuerdo de Anna Sethe, la primera mujer de Haeckel."),
    9: ("Corales hexacoralarios", "cnidarios", ("Scleractinia", "Animalia"), "Esqueletos de coral vistos de cerca: cada copa fue la casa de un pólipo de seis brazos."),
    10: ("Ofiuras", "equinodermos", ("Ophiuroidea", "Animalia"), "Estrellas de mar de brazos finos y articulados que reptan como serpientes."),
    11: ("Radiolarios discoideos", "protistas", None, "Radiolarios planos como monedas, con anillos concéntricos de sílice."),
    12: ("Foraminíferos", "protistas", ("Foraminifera", "Protozoa"), "Conchas de una sola célula. Sus restos forman rocas enteras, como la caliza de las pirámides."),
    13: ("Flagelados", "protistas", None, "Células que nadan con un látigo. Haeckel los agrupó por la forma; hoy están repartidos por todo el árbol."),
    14: ("Dinoflagelados", "protistas", ("Dinophyceae", "Chromista"), "Algas con armadura y dos flagelos. Algunas brillan de noche en el mar y otras causan las mareas rojas."),
    15: ("Algas pardas", "plantas", ("Phaeophyceae", "Chromista"), "Fucos y sargazos: las algas que forman bosques submarinos en las costas frías."),
    16: ("Narcomedusas", "cnidarios", ("Narcomedusae", "Animalia"), "Medusas de borde lobulado y tentáculos que salen de la parte alta de la campana."),
    17: ("Sifonóforos", "cnidarios", ("Siphonophorae", "Animalia"), "Colonias flotantes con un flotador lleno de gas en lo alto y cortinas de tentáculos debajo."),
    18: ("Medusas discoidales", "cnidarios", ("Scyphozoa", "Animalia"), "Medusas de campana ancha vistas desde abajo, con los brazos de la boca como encajes."),
    19: ("Plumas de mar", "cnidarios", ("Pennatulacea", "Animalia"), "Colonias de pólipos con forma de pluma clavada en la arena. Algunas brillan si se las toca."),
    20: ("Lirios de mar", "equinodermos", ("Crinoidea", "Animalia"), "Parientes de las estrellas de mar que viven sujetos al fondo con un tallo, como flores."),
    21: ("Radiolarios acantarios", "protistas", None, "Veinte espinas que salen del centro siguiendo una regla geométrica fija. Las espinas son de sulfato de estroncio."),
    22: ("Radiolarios espiroideos", "protistas", None, "Esqueletos de sílice con forma de cesta o de anillo doble."),
    23: ("Briozoos", "invertebrados", ("Bryozoa", "Animalia"), "Colonias de animales diminutos que parecen musgo o encaje sobre las rocas."),
    24: ("Desmidiáceas", "protistas", ("Desmidiaceae", "Plantae"), "Algas verdes de agua dulce partidas en dos mitades simétricas, como un espejo."),
    25: ("Hidroides sertularios", "cnidarios", ("Leptothecata", "Animalia"), "Colonias ramificadas como helechos, con cada pólipo protegido por una copa."),
    26: ("Traquimedusas", "cnidarios", ("Trachymedusae", "Animalia"), "Medusas de mar abierto, con campana alta y tentáculos rígidos."),
    27: ("Ctenóforos", "cnidarios", None, "Animales transparentes que nadan con hileras de peines que irisan la luz. Parecen medusas, pero no lo son."),
    28: ("Medusas discoidales", "cnidarios", ("Scyphozoa", "Animalia"), "Medusas con la campana dividida en lóbulos y largos brazos orales."),
    29: ("Corales tetracoralarios", "cnidarios", None, "Corales de simetría cuádruple que se extinguieron hace unos 250 millones de años. Solo quedan fósiles."),
    30: ("Erizos de mar", "equinodermos", ("Echinoidea", "Animalia"), "Caparazones de erizo sin púas: dibujos de cinco brazos que se repiten como un mosaico."),
    31: ("Radiolarios cirtoideos", "protistas", None, "Esqueletos con forma de casco o de farol, con una cámara encima de otra."),
    32: ("Rotíferos", "invertebrados", ("Rotifera", "Animalia"), "Animales microscópicos con una corona de pestañas que gira como una rueda."),
    33: ("Briozoos", "invertebrados", ("Bryozoa", "Animalia"), "Más briozoos: colonias en abanico y en espiral, cada celdilla con su animal dentro."),
    34: ("Algas coloniales", "protistas", ("Volvocaceae", "Plantae"), "Bolas y estrellas de células verdes que viven juntas: el paso de una célula a un organismo."),
    35: ("Esponjas de vidrio", "cnidarios", ("Hexactinellida", "Animalia"), "Esponjas de aguas profundas con un esqueleto de sílice que parece cristal tallado."),
    36: ("Leptomedusas", "cnidarios", ("Leptothecata", "Animalia"), "Medusas pequeñas y planas, la fase libre de los hidroides con copa."),
    37: ("Sifonóforos", "cnidarios", ("Siphonophorae", "Animalia"), "Haeckel firmó el informe sobre los sifonóforos de la expedición del Challenger, publicado en 1888."),
    38: ("Peromedusas", "cnidarios", ("Coronatae", "Animalia"), "Medusas con un surco que rodea la campana como una corona."),
    39: ("Gorgonias", "cnidarios", ("Gorgoniidae", "Animalia"), "Abanicos de mar: colonias de pólipos sobre un esqueleto flexible."),
    40: ("Estrellas de mar", "equinodermos", ("Asteroidea", "Animalia"), "Simetría de cinco: la regla de casi todos los equinodermos, dibujada en todas sus variantes."),
    41: ("Radiolarios acantofractos", "protistas", None, "Radiolarios con armadura: las espinas se unen en un caparazón de placas."),
    42: ("Peces cofre", "vertebrados", ("Ostraciidae", "Animalia"), "Peces encerrados en una caja de placas óseas, de la que solo salen la boca, los ojos y las aletas."),
    43: ("Nudibranquios", "invertebrados", ("Nudibranchia", "Animalia"), "Babosas de mar de colores imposibles. Muchas se quedan con el veneno de lo que comen."),
    44: ("Amonites", "invertebrados", None, "Conchas en espiral de cefalópodos que se extinguieron con los dinosaurios."),
    45: ("Hidroides campanularios", "cnidarios", ("Leptothecata", "Animalia"), "Colonias en las que cada pólipo vive dentro de una campanita transparente."),
    46: ("Antomedusas", "cnidarios", ("Anthoathecata", "Animalia"), "Medusas de campana alta, con los órganos reproductores colgando de la boca."),
    47: ("Peces acorazados", "vertebrados", None, "Peces fósiles cubiertos de escudos óseos, entre los primeros vertebrados que conocemos."),
    48: ("Estauromedusas", "cnidarios", ("Staurozoa", "Animalia"), "Medusas que no nadan: viven pegadas a las algas por un pie, boca arriba."),
    49: ("Anémonas de mar", "cnidarios", ("Actiniaria", "Animalia"), "Pólipos solitarios con coronas de tentáculos. Una de las láminas más coloridas del libro."),
    50: ("Holoturias", "equinodermos", ("Holothuroidea", "Animalia"), "Pepinos de mar: equinodermos blandos que se arrastran por el fondo."),
    51: ("Radiolarios coloniales", "protistas", None, "Radiolarios que viven en grupo dentro de una masa de gelatina."),
    52: ("Helechos", "plantas", ("Polypodiopsida", "Plantae"), "Hojas, esporas y frondas que se desenrollan: una planta que no da flores ni semillas."),
    53: ("Caracoles marinos", "invertebrados", ("Gastropoda", "Animalia"), "Conchas en espiral, cada una con su ritmo de crecimiento."),
    54: ("Cefalópodos", "invertebrados", ("Cephalopoda", "Animalia"), "Pulpos y calamares, los moluscos que perdieron la concha y ganaron cerebro."),
    55: ("Bivalvos", "invertebrados", ("Bivalvia", "Animalia"), "Almejas, ostras y vieiras: dos valvas y ninguna cabeza. Haeckel los llamaba acéfalos."),
    56: ("Copépodos", "artropodos", ("Copepoda", "Animalia"), "Crustáceos minúsculos del plancton. Puede que sean los animales más numerosos del planeta."),
    57: ("Percebes", "artropodos", None, "Crustáceos que pasan la vida pegados a una roca, pateando la comida hacia la boca."),
    58: ("Polillas", "artropodos", ("Lepidoptera", "Animalia"), "Mariposas nocturnas con las alas extendidas como en una caja de entomólogo."),
    59: ("Sifonóforos", "cnidarios", ("Siphonophorae", "Animalia"), "Colonias en cadena, con campanas que bombean agua para moverse."),
    60: ("Erizos de mar", "equinodermos", ("Echinoidea", "Animalia"), "Erizos irregulares y aplanados, como los dólares de arena."),
    61: ("Radiolarios feodarios", "protistas", None, "Esqueletos huecos de sílice con espinas ramificadas como cristales de nieve."),
    62: ("Plantas carnívoras", "plantas", ("Nepenthes", "Plantae"), "Nepenthes: hojas convertidas en jarras con tapa que ahogan insectos en su interior."),
    63: ("Setas", "hongos", ("Basidiomycota", "Fungi"), "Hongos de sombrero, láminas y poros, con sus esporas."),
    64: ("Algas sifonales", "plantas", ("Bryopsidales", "Plantae"), "Algas verdes que son una sola célula gigante con muchos núcleos."),
    65: ("Algas rojas", "plantas", ("Rhodophyta", "Plantae"), "Algas de encaje rojo. De ellas se saca el agar."),
    66: ("Arácnidos", "artropodos", ("Arachnida", "Animalia"), "Arañas, escorpiones y ácaros, con sus ocho patas ordenadas en abanico."),
    67: ("Murciélagos", "vertebrados", ("Chiroptera", "Animalia"), "Retratos de caras: orejas y hojas nasales que les sirven para ver con el sonido."),
    68: ("Ranas", "vertebrados", None, "Ranas y sapos en todas las posturas. Haeckel los llamó batracios."),
    69: ("Corales hexacoralarios", "cnidarios", ("Scleractinia", "Animalia"), "Corales y sus pólipos abiertos, con tentáculos en múltiplos de seis."),
    70: ("Ofiuras", "equinodermos", ("Ophiuroidea", "Animalia"), "Ofiuras con brazos ramificados como raíces, que atrapan comida en la corriente."),
    71: ("Radiolarios estefoideos", "protistas", None, "Esqueletos con forma de anillo o de corona."),
    72: ("Musgos", "plantas", ("Bryophyta", "Plantae"), "Las cápsulas de esporas de los musgos, vistas con lupa."),
    73: ("Ascomicetos", "hongos", ("Ascomycota", "Fungi"), "Hongos que guardan las esporas en saquitos. Entre ellos, colmenillas y trufas."),
    74: ("Orquídeas", "plantas", ("Orchidaceae", "Plantae"), "Flores que imitan insectos para que otros insectos las polinicen."),
    75: ("Gusanos planos", "invertebrados", ("Platyhelminthes", "Animalia"), "Planarias marinas finas como una hoja y estampadas como una tela."),
    76: ("Crustáceos", "artropodos", ("Malacostraca", "Animalia"), "Gambas, camarones y galeras: crustáceos con el tórax cubierto por un escudo."),
    77: ("Sifonóforos", "cnidarios", ("Siphonophorae", "Animalia"), "Colonias en espiral que flotan a la deriva con su vela."),
    78: ("Cubomedusas", "cnidarios", ("Cubozoa", "Animalia"), "Medusas de campana cuadrada y ojos complejos. Algunas son de las más venenosas del mar."),
    79: ("Lagartos", "vertebrados", ("Squamata", "Animalia"), "Lagartos y camaleones con sus escamas, crestas y colas."),
    80: ("Blastoideos", "equinodermos", None, "Equinodermos fósiles con forma de capullo, extinguidos hace unos 250 millones de años."),
    81: ("Foraminíferos", "protistas", ("Foraminifera", "Protozoa"), "Lagena y sus parientes: conchas de una célula con forma de botella."),
    82: ("Hepáticas", "plantas", ("Marchantia", "Plantae"), "Marchantia: plantas sin tallo, con sombrillas que sueltan las esporas."),
    83: ("Líquenes", "hongos", ("Cladonia", "Fungi"), "Cladonia: un hongo y un alga viviendo como un solo organismo, con copas y ramitas."),
    84: ("Diatomeas", "protistas", ("Bacillariophyta", "Chromista"), "Más diatomeas: estrellas, barcas y discos de vidrio microscópicos."),
    85: ("Ascidias", "invertebrados", ("Ascidiacea", "Animalia"), "Parientes lejanos de los vertebrados: de larva tienen algo parecido a una columna."),
    86: ("Cangrejos", "artropodos", ("Parthenopidae", "Animalia"), "Parthenope y otros decápodos, con caparazones esculpidos como piedra."),
    87: ("Peces dragón", "vertebrados", ("Pegasidae", "Animalia"), "Pegasus: peces pequeños, acorazados y con aletas como alas."),
    88: ("Medusas discoidales", "cnidarios", ("Rhizostomeae", "Animalia"), "Pilema: una gran medusa de brazos gruesos sin tentáculos en el borde."),
    89: ("Tortugas", "vertebrados", ("Testudines", "Animalia"), "Caparazones vistos por arriba y por abajo: costillas convertidas en casa."),
    90: ("Cistoideos", "equinodermos", None, "Callocystis: equinodermos fósiles con forma de saco y poros en las placas."),
    91: ("Radiolarios espumelarios", "protistas", None, "Esferas dentro de esferas, con espinas que las atraviesan."),
    92: ("Helechos arborescentes", "plantas", ("Cyatheaceae", "Plantae"), "Alsophila: helechos con tronco que crecen como palmeras."),
    93: ("Mixomicetos", "protistas", ("Myxomycetes", "Protozoa"), "Mohos mucilaginosos: se arrastran como amebas y luego levantan columnas de esporas."),
    94: ("Coníferas", "plantas", ("Araucaria", "Plantae"), "Araucaria: piñas, escamas y ramas de un árbol que ya existía con los dinosaurios."),
    95: ("Anforideos", "equinodermos", None, "Placocystis: equinodermos fósiles asimétricos, una rareza en un grupo que vive de la simetría."),
    96: ("Gusanos de abanico", "invertebrados", ("Sabella", "Animalia"), "Sabella: gusanos que viven en un tubo y sacan una corona de plumas para comer."),
    97: ("Braquiópodos", "invertebrados", ("Terebratula", "Animalia"), "Terebratula: parecen almejas pero son otro linaje, mucho más antiguo."),
    98: ("Medusas discoidales", "cnidarios", ("Semaeostomeae", "Animalia"), "Aurelia, la medusa luna: cuatro anillos en la campana que se ven a simple vista."),
    99: ("Colibríes", "vertebrados", ("Trochilidae", "Animalia"), "Colibríes con sus picos y colas de todas las formas, ordenados como joyas en un estuche."),
    100: ("Antílopes", "vertebrados", None, "Cuernos de antílope en espiral, en lira y en sacacorchos. La última lámina del libro."),
}

LICENCIA_OK = re.compile(r"^(public domain|pd[- ]|cc0)", re.I)


def gbif(nombre: str, reino: str) -> tuple[int | None, int | None]:
    """Clave y nº de registros del taxón aceptado en GBIF (None si no hay coincidencia exacta)."""
    m = get_json(f"{GBIF}/species/match", {"name": nombre, "kingdom": reino}, pausa=0.4)
    if m.get("canonicalName", "").lower() != nombre.lower() and m.get("scientificName", "").split(" ")[0].lower() != nombre.lower():
        return None, None
    clave = m.get("acceptedUsageKey") or m.get("usageKey")
    aceptado = get_json(f"{GBIF}/species/{clave}", {}, pausa=0.4)
    if aceptado.get("rank") == "KINGDOM":  # un sinónimo que GBIF resuelve al reino entero no sirve
        return None, None
    n = get_json(f"{GBIF}/occurrence/search", {"taxonKey": clave, "limit": 0}, pausa=0.4)
    return clave, n.get("count")


def main() -> None:
    crudas = json.loads((RAIZ / "datos-crudos" / "laminas.json").read_text())
    salida = []
    for l in crudas:
        if not LICENCIA_OK.match(l["licencia"]):
            sys.exit(f"Licencia no válida en lámina {l['lamina']}: {l['licencia']}")
        nombre, grupo, tax, texto = FICHAS[l["lamina"]]
        clave = registros = None
        if tax:
            clave, registros = gbif(*tax)
            if clave is None:
                print(f"  GBIF sin coincidencia: {l['lamina']} {tax}", file=sys.stderr)
        salida.append({
            "n": l["lamina"], "latin": l["grupo"].split("(")[0].strip().replace(" ;", ";"), "nombre": nombre, "grupo": grupo,
            "texto": texto, "fichero": l["fichero"], "licencia": l["licencia"], "ancho": l["ancho"], "alto": l["alto"],
            "taxon": tax[0] if tax and clave else None, "gbif": clave, "registros": registros,
        })
    destino = RAIZ / "src" / "datos" / "laminas.json"
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps(salida, ensure_ascii=False, indent=1))
    con = sum(1 for s in salida if s["registros"])
    print(len(salida), "láminas;", con, "con registros GBIF")


if __name__ == "__main__":
    main()
