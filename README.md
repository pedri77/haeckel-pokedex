# Formas de la naturaleza · La Pokédex de Haeckel

Web cinemática con las 100 láminas de *Kunstformen der Natur* (1904), de Ernst Haeckel: radiolarios, medusas, orquídeas, murciélagos y colibríes, como una Pokédex.

Demo: https://pedri77.github.io/haeckel-pokedex/

## Qué tiene

- Portada en un ocular de microscopio: el aumento baja de ×6 a ×1 y la lente se abre.
- Árbol de la vida al estilo de Haeckel (1866), con los ocho grupos de las láminas.
- Caleidoscopio de simetrías (2, 3, 5, 6 y 12 ejes) pintado en canvas.
- La Pokédex: lista y visor, teclado (↑ ↓, Inicio, Fin), filtro por grupo y búsqueda. Cada ficha lleva su lámina, el nombre en castellano y los registros de su grupo moderno en GBIF.

## Datos y derechos

- Láminas: Wikimedia Commons, **dominio público** (Haeckel murió en 1919; el litógrafo Adolf Giltsch, en 1911). Enlace a cada fichero desde su ficha.
- Recuentos: API pública de [GBIF](https://www.gbif.org/), consultada al construir. La equivalencia entre los grupos de Haeckel y los taxones modernos es aproximada; 23 láminas no tienen equivalente exacto.
- Nombres en castellano y textos: propios. Textos y código hechos con IA (Claude) y revisados.

```bash
python3 -I scripts/explorar.py                         # lista de láminas y licencias (Commons)
python3 -I scripts/datos.py                            # fichas + GBIF → src/datos/laminas.json
uv run --with pillow python -I scripts/imagenes.py     # WebP + color dominante
```

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3010
npm run lint && npm run build
```

React 19, Vite, Tailwind 4 y Lenis; un solo bucle `requestAnimationFrame`. Respeta `prefers-reduced-motion`. Despliegue a GitHub Pages con `.github/workflows/pages.yml` en cada push a `main`.
