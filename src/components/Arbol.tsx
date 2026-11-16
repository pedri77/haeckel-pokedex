import {useEffect, useRef} from 'react';
import {arbol, grupos, laminas, miniatura, type GrupoId} from '../content';
import {easeOutCubic, progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * Árbol de la vida al estilo de Haeckel (1866): una raíz, tres troncos (Plantae, Protista, Animalia) y
 * ocho ramas, una por grupo de láminas. Cada rama termina en un medallón con una lámina del grupo.
 * Dibujo propio, no una copia del original.
 *
 * Guion de scroll (p), sección de 380 svh:
 *   0.00 – 0.10  se dibuja la raíz
 *   0.10 – 0.28  se dibujan los tres troncos; sus nombres aparecen al final de cada uno
 *   0.28 – 0.88  las ocho ramas, escalonadas: cada una se dibuja en 0.12 y su medallón crece al terminar
 *   0.88 – 1.00  quieto hasta soltarse
 */

const ALTO_VH = 380;

const RAIZ = 'M500 970 C500 910 500 840 500 780';
const TRONCOS = [
  {reino: 'Plantae', d: 'M500 780 C470 720 330 700 280 620', x: 330, y: 760, ancla: 'middle'},
  {reino: 'Protista', d: 'M500 780 C505 720 495 660 500 600', x: 520, y: 700, ancla: 'start'},
  {reino: 'Animalia', d: 'M500 780 C560 720 780 720 815 620 C825 500 822 300 820 150', x: 700, y: 800, ancla: 'middle'},
] as const;
type Lado = 'arriba' | 'abajo';
const RAMAS: {id: GrupoId; d: string; x: number; y: number; lamina: number; lado: Lado}[] = [
  {id: 'protistas', d: 'M500 600 L500 566', x: 500, y: 520, lamina: 1, lado: 'arriba'},
  {id: 'plantas', d: 'M280 620 C240 540 170 480 150 436', x: 140, y: 390, lamina: 74, lado: 'abajo'},
  {id: 'hongos', d: 'M280 620 C300 570 320 530 328 496', x: 330, y: 450, lamina: 63, lado: 'abajo'},
  {id: 'cnidarios', d: 'M817 560 C760 550 690 500 665 466', x: 660, y: 420, lamina: 49, lado: 'arriba'},
  {id: 'equinodermos', d: 'M818 520 C880 515 945 505 958 486', x: 960, y: 440, lamina: 40, lado: 'abajo'},
  {id: 'invertebrados', d: 'M821 380 C770 370 710 320 685 286', x: 680, y: 240, lamina: 43, lado: 'arriba'},
  {id: 'artropodos', d: 'M821 330 C880 320 940 310 966 306', x: 970, y: 260, lamina: 66, lado: 'abajo'},
  {id: 'vertebrados', d: 'M820 150 L820 136', x: 820, y: 90, lamina: 99, lado: 'arriba'},
];
const R = 46;
const cuenta = Object.fromEntries(grupos.map((g) => [g.id, laminas.filter((l) => l.grupo === g.id).length]));
const nombre = Object.fromEntries(grupos.map((g) => [g.id, g.nombre]));

export function Arbol() {
  const raizRef = useRef<HTMLElement>(null);
  const raizTrazo = useRef<SVGPathElement>(null);
  const troncoRefs = useRef<(SVGPathElement | null)[]>([]);
  const reinoRefs = useRef<(SVGTextElement | null)[]>([]);
  const ramaRefs = useRef<(SVGPathElement | null)[]>([]);
  const hojaRefs = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    let pAnterior = -1;
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      if (!raiz) return;
      const {p, visible} = progresoFijado(raiz);
      if (!visible || Math.abs(p - pAnterior) < 0.00005) return;
      pAnterior = p;
      raizTrazo.current!.style.strokeDashoffset = String(1 - tramo(p, 0, 0.1));
      troncoRefs.current.forEach((el, i) => {
        const k = tramo(p, 0.1 + i * 0.02, 0.24 + i * 0.02);
        el!.style.strokeDashoffset = String(1 - k);
        reinoRefs.current[i]!.style.opacity = String(tramo(k, 0.7, 1));
      });
      RAMAS.forEach((_, i) => {
        const a = 0.28 + i * 0.065;
        ramaRefs.current[i]!.style.strokeDashoffset = String(1 - tramo(p, a, a + 0.08));
        const s = easeOutCubic(tramo(p, a + 0.07, a + 0.12));
        const hoja = hojaRefs.current[i]!;
        hoja.style.opacity = String(s);
        hoja.style.transform = `scale(${0.6 + 0.4 * s})`;
      });
    });
  }, []);

  return (
    <section ref={raizRef} id="arbol" aria-labelledby="arbol-titulo" className="relative" style={{height: `${ALTO_VH}svh`}}>
      <div className="sticky top-0 h-pantalla overflow-hidden bg-tinta">
        <div className="mx-auto grid h-full max-w-[88rem] grid-rows-[auto_1fr_auto] gap-3 px-4 pt-[8svh] pb-[3svh] sm:px-6 md:grid-cols-[0.8fr_1.2fr] md:grid-rows-1 md:items-center md:gap-[4vw] md:px-[6vw] md:py-0">
          <div>
            <p className="font-mono text-etiqueta tracking-[0.12em] text-ocre uppercase">{arbol.antetitulo}</p>
            <h2 id="arbol-titulo" className="mt-3 font-display text-display font-medium text-texto italic">
              {arbol.titulo}
            </h2>
            <p className="mt-4 max-w-[30rem] text-body text-texto-2 max-md:text-[0.9375rem]">{arbol.cuerpo}</p>
          </div>
          <svg viewBox="40 -10 1060 1020" className="mx-auto block h-full max-h-[46svh] w-auto max-w-full md:max-h-[88svh]" role="img" aria-label={arbol.etiqueta}>
            <defs>
              <clipPath id="medallon">
                <circle r={R} />
              </clipPath>
            </defs>
            <g fill="none" stroke="var(--color-hueso)" strokeLinecap="round">
              <path ref={raizTrazo} d={RAIZ} pathLength={1} strokeDasharray="1 1" strokeWidth={14} />
              {TRONCOS.map((t, i) => (
                <path
                  key={t.reino}
                  ref={(el) => {
                    troncoRefs.current[i] = el;
                  }}
                  d={t.d}
                  pathLength={1}
                  strokeDasharray="1 1"
                  strokeWidth={9}
                />
              ))}
              {RAMAS.map((r, i) => (
                <path
                  key={r.id}
                  ref={(el) => {
                    ramaRefs.current[i] = el;
                  }}
                  d={r.d}
                  pathLength={1}
                  strokeDasharray="1 1"
                  strokeWidth={4}
                  stroke="var(--color-ocre)"
                />
              ))}
            </g>
            <text x={500} y={995} textAnchor="middle" className="font-mono" fontSize={18} letterSpacing={2} fill="var(--color-texto-3)">
              {arbol.raiz.toUpperCase()}
            </text>
            {TRONCOS.map((t, i) => (
              <text
                key={t.reino}
                ref={(el) => {
                  reinoRefs.current[i] = el;
                }}
                x={t.x}
                y={t.y}
                textAnchor={t.ancla}
                className="font-display"
                fontStyle="italic"
                fontSize={30}
                fill="var(--color-rojo)"
                style={{opacity: 0}}
              >
                {t.reino}
              </text>
            ))}
            {RAMAS.map((r, i) => (
              <g key={r.id} transform={`translate(${r.x} ${r.y})`}>
                <g
                  ref={(el) => {
                    hojaRefs.current[i] = el;
                  }}
                  style={{opacity: 0, transformBox: 'fill-box', transformOrigin: 'center'}}
                >
                  <circle r={R + 4} fill="var(--color-hueso)" />
                  <image href={miniatura(r.lamina)} x={-R} y={-R} width={R * 2} height={R * 2} preserveAspectRatio="xMidYMid slice" clipPath="url(#medallon)" />
                  <text y={r.lado === 'abajo' ? R + 30 : -R - 36} textAnchor="middle" className="font-sans max-md:hidden" fontSize={23} fontWeight={600} fill="var(--color-texto)" stroke="var(--color-tinta)" strokeWidth={7} paintOrder="stroke">
                    {nombre[r.id]}
                  </text>
                  <text y={r.lado === 'abajo' ? R + 54 : -R - 13} textAnchor="middle" className="font-mono max-md:hidden" fontSize={17} fill="var(--color-texto-3)" stroke="var(--color-tinta)" strokeWidth={6} paintOrder="stroke">
                    {arbol.laminas(cuenta[r.id])}
                  </text>
                </g>
              </g>
            ))}
          </svg>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[0.8125rem] text-texto-2 md:hidden">
            {grupos.map((g) => (
              <li key={g.id} className="flex justify-between gap-2 border-b border-white/10 py-1">
                <span>{g.nombre}</span>
                <span className="font-mono text-texto-3 tabular-nums">{cuenta[g.id]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
