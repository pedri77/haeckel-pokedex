import {useEffect, useRef} from 'react';
import {img, simetrias} from '../content';
import {lerp, progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * Simetrías: un caleidoscopio pintado en canvas con un trozo de la lámina 21. Cada paso del scroll
 * reparte el círculo en N sectores (2, 3, 5, 6, 12) y gira despacio. Con N par cada sector impar se
 * refleja (espejo); con N impar solo se rota, que es lo que hace la simetría radial de verdad.
 *
 * Guion de scroll (p), sección de 400 svh:
 *   0.04 – 0.96  cinco pasos iguales; en cada uno el canvas entra y sale con un fundido corto (12 %)
 *   todo        el giro y el desplazamiento de la muestra avanzan con p
 *   lista       el paso activo a opacidad 1 y los demás a 0.35 (se leen todos, no se ocultan)
 */

const ALTO_VH = 400;
const PASOS = simetrias.pasos;

export function Simetrias() {
  const raizRef = useRef<HTMLElement>(null);
  const lienzoRef = useRef<HTMLCanvasElement>(null);
  const pasoRefs = useRef<(HTMLLIElement | null)[]>([]);
  const ejesRef = useRef<HTMLSpanElement>(null);
  const textoRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const fuente = new Image();
    fuente.decoding = 'async';
    fuente.src = img(simetrias.lamina);
    let pAnterior = -1;
    let listo = false;
    fuente.onload = () => {
      listo = true;
      pAnterior = -1;
    };
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      const c = lienzoRef.current;
      if (!raiz || !c) return;
      const {p, visible} = progresoFijado(raiz);
      if (!visible || Math.abs(p - pAnterior) < 0.00005) return;
      pAnterior = p;

      const q = tramo(p, 0.04, 0.96) * PASOS.length;
      const i = Math.min(PASOS.length - 1, Math.floor(q));
      const t = q - i;
      const n = PASOS[i].n;
      pasoRefs.current.forEach((el, k) => {
        if (el) el.style.opacity = k === i ? '1' : '0.35';
      });
      ejesRef.current!.textContent = String(n);
      textoRef.current!.textContent = PASOS[i].texto;

      const entra = i === 0 ? 1 : tramo(t, 0, 0.12);
      const sale = i === PASOS.length - 1 ? 0 : tramo(t, 0.88, 1);
      c.style.opacity = String(Math.min(entra, 1 - sale));
      if (!listo) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const lado = Math.round(c.clientWidth * dpr);
      if (c.width !== lado) c.width = c.height = lado;
      const ctx = c.getContext('2d')!;
      const R = lado / 2;
      ctx.clearRect(0, 0, lado, lado);
      ctx.save();
      ctx.translate(R, R);
      ctx.rotate(p * Math.PI * 0.9);
      const th = (Math.PI * 2) / n;
      // Muestra: un cuadrado del centro de la lámina que se desliza despacio con el scroll.
      const sw = fuente.width * 0.42;
      const sx = fuente.width * lerp(0.22, 0.36, p);
      const sy = fuente.height * lerp(0.26, 0.4, p);
      for (let k = 0; k < n; k++) {
        ctx.save();
        ctx.rotate(k * th);
        if (n % 2 === 0 && k % 2 === 1) {
          ctx.rotate(th);
          ctx.scale(1, -1);
        }
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, R, 0, th + 0.004);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(fuente, sx, sy, sw, sw, -R, -R, R * 2, R * 2);
        ctx.restore();
      }
      ctx.restore();
    });
  }, []);

  return (
    <section ref={raizRef} id="simetrias" aria-labelledby="simetrias-titulo" className="relative" style={{height: `${ALTO_VH}svh`}}>
      <div className="sticky top-0 h-pantalla overflow-hidden bg-rojo text-tinta">
        <div className="mx-auto grid h-full max-w-[88rem] content-center gap-[3svh] px-4 sm:px-6 md:grid-cols-[1fr_1fr] md:items-center md:gap-[5vw] md:px-[6vw]">
          <div className="relative mx-auto w-[min(70vw,38svh)] md:w-[min(40vw,72svh)]">
            <div className="aspect-square overflow-hidden rounded-full bg-hueso ring-4 ring-tinta">
              <canvas ref={lienzoRef} className="block size-full" role="img" aria-label={simetrias.etiqueta} />
            </div>
            <p className="absolute -right-2 -bottom-2 flex size-[5.5rem] flex-col items-center justify-center rounded-full bg-tinta text-hueso md:size-28" aria-hidden="true">
              <span ref={ejesRef} className="font-display text-[2.5rem] leading-none font-semibold tabular-nums md:text-[3.25rem]">
                2
              </span>
              <span className="font-mono text-[0.625rem] tracking-[0.12em] uppercase">ejes</span>
            </p>
          </div>
          <div>
            <p className="font-mono text-etiqueta tracking-[0.12em] uppercase">{simetrias.antetitulo}</p>
            <h2 id="simetrias-titulo" className="mt-2 font-display text-display font-medium italic">
              {simetrias.titulo}
            </h2>
            <ol className="mt-[3svh] grid gap-[1.6svh]">
              {PASOS.map((s, k) => (
                <li
                  key={s.nombre}
                  ref={(el) => {
                    pasoRefs.current[k] = el;
                  }}
                  className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-3 transition-opacity duration-300"
                  style={{opacity: k === 0 ? 1 : 0.35}}
                >
                  <span className="font-display text-[1.75rem] leading-none font-semibold tabular-nums">{s.n}</span>
                  <span>
                    <span className="block text-[1.0625rem] font-semibold">{s.nombre}</span>
                    <span className="block text-[0.9375rem] leading-snug max-md:hidden">{s.texto}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p ref={textoRef} className="mt-3 min-h-[3em] text-[0.9375rem] leading-snug md:hidden" aria-hidden="true">
              {PASOS[0].texto}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
