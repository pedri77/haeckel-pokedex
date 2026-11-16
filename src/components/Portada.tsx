import {useEffect, useRef} from 'react';
import {img, laminas, portada} from '../content';
import {clamp, easeInOutSine, easeOutCubic, lerp, progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * Portada: un ocular de microscopio. Dentro, un detalle de la lámina 8 a ×6; el scroll reduce el
 * aumento hasta ver la lámina entera y luego la lente se abre hasta ocupar toda la pantalla.
 *
 * Guion de scroll (p), sección de 420 svh:
 *   0.00 – 0.05  quieto: titular y lente pequeña; la invitación se apaga
 *   0.05 – 0.55  el aumento baja de ×6 a ×1 (easeInOutSine); el retículo gira 40°
 *   0.18 – 0.42  el titular se apaga y sube
 *   0.45 – 0.78  la lente crece hasta cubrir la pantalla y se centra (easeOutCubic); el retículo se apaga
 *   0.80 – 0.92  aparece el pie de lámina
 *   0.92 – 1.00  quieto hasta soltarse: la lámina entera no deja la pantalla vacía
 */

const ALTO_VH = 420;
const ZOOM = 6;
const FOCO = [0.5, 0.38] as const; // punto de la lámina (0–1) que se ve al principio
const LAM = laminas.find((l) => l.n === portada.lamina)!;
const nf = (v: number) => v.toLocaleString('es-ES', {minimumFractionDigits: 1, maximumFractionDigits: 1});

export function Portada() {
  const raizRef = useRef<HTMLElement>(null);
  const lenteRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const reticuloRef = useRef<SVGSVGElement>(null);
  const tituloRef = useRef<HTMLDivElement>(null);
  const invitaRef = useRef<HTMLParagraphElement>(null);
  const pieRef = useRef<HTMLParagraphElement>(null);
  const aumentoRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let pAnterior = -1;
    let anchoAnterior = 0;
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      if (!raiz) return;
      const {p, visible} = progresoFijado(raiz);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (!visible || (Math.abs(p - pAnterior) < 0.00005 && vw === anchoAnterior)) return;
      pAnterior = p;
      anchoAnterior = vw;
      const movil = vw < 768;

      // Lámina encajada (contain) en el 92 % de la pantalla.
      const aspecto = LAM.w / LAM.h;
      const h = Math.min(vh * 0.92, (vw * 0.92) / aspecto);
      const w = h * aspecto;
      const x0 = (vw - w) / 2;
      const y0 = (vh - h) / 2;
      const fx = x0 + FOCO[0] * w;
      const fy = y0 + FOCO[1] * h;

      const z = lerp(ZOOM, 1, easeInOutSine(tramo(p, 0.05, 0.55)));
      const o = easeOutCubic(tramo(p, 0.45, 0.78));
      const r0 = movil ? Math.min(vw * 0.36, vh * 0.2) : Math.min(vw, vh) * 0.3;
      const cx = lerp(movil ? vw / 2 : vw * 0.69, vw / 2, o);
      const cy = lerp(movil ? vh * 0.66 : vh * 0.5, vh / 2, o);
      const r = lerp(r0, Math.hypot(vw, vh) * 0.6, o);

      const lente = lenteRef.current!;
      lente.style.clipPath = `circle(${r}px at ${cx}px ${cy}px)`;
      const im = imgRef.current!;
      im.style.width = `${w}px`;
      im.style.height = `${h}px`;
      im.style.left = `${x0}px`;
      im.style.top = `${y0}px`;
      im.style.transformOrigin = `${FOCO[0] * 100}% ${FOCO[1] * 100}%`;
      im.style.transform = `translate3d(${(cx - fx) * (1 - o)}px, ${(cy - fy) * (1 - o)}px, 0) scale(${z})`;

      const ret = reticuloRef.current!;
      ret.style.width = ret.style.height = `${r0 * 2 + 36}px`;
      ret.style.left = `${cx - r0 - 18}px`;
      ret.style.top = `${cy - r0 - 18}px`;
      ret.style.opacity = String(1 - tramo(p, 0.45, 0.6));
      ret.style.transform = `rotate(${tramo(p, 0.05, 0.55) * 40}deg)`;

      const t = tramo(p, 0.18, 0.42);
      tituloRef.current!.style.opacity = String(1 - t);
      tituloRef.current!.style.transform = `translate3d(0, ${-t * 6}vh, 0)`;
      invitaRef.current!.style.opacity = String(1 - tramo(p, 0, 0.05));
      pieRef.current!.style.opacity = String(tramo(p, 0.8, 0.92));
      aumentoRef.current!.textContent = `× ${nf(clamp(z, 1, ZOOM))}`;
    });
  }, []);

  const marcas = Array.from({length: 72}, (_, i) => {
    const a = (i / 72) * Math.PI * 2;
    const largo = i % 6 === 0 ? 10 : 4;
    return <line key={i} x1={50 + Math.cos(a) * 49} y1={50 + Math.sin(a) * 49} x2={50 + Math.cos(a) * (49 - largo * 0.3)} y2={50 + Math.sin(a) * (49 - largo * 0.3)} />;
  });

  return (
    <section ref={raizRef} id="inicio" aria-labelledby="portada-titulo" className="relative" style={{height: `${ALTO_VH}svh`}}>
      <div className="sticky top-0 h-pantalla overflow-hidden bg-void">
        <div ref={lenteRef} className="absolute inset-0" style={{clipPath: 'circle(0px at 50% 50%)'}}>
          <div className="absolute inset-0 bg-hueso" />
          <img ref={imgRef} src={img(LAM.n)} alt={`${LAM.nombre} (${LAM.latin}), lámina ${LAM.n} de Kunstformen der Natur.`} className="absolute max-w-none" decoding="async" fetchPriority="high" />
        </div>
        <svg ref={reticuloRef} viewBox="0 0 100 100" className="pointer-events-none absolute" aria-hidden="true">
          <circle cx={50} cy={50} r={49.5} fill="none" stroke="var(--color-hueso)" strokeWidth={0.6} />
          <g stroke="var(--color-hueso)" strokeWidth={0.4}>{marcas}</g>
          <path d="M50 8v8M50 84v8M8 50h8M84 50h8" stroke="var(--color-rojo)" strokeWidth={0.6} />
        </svg>

        <div ref={tituloRef} className="relative z-10 px-4 pt-[9svh] sm:px-6 md:max-w-[46vw] md:px-[6vw] md:pt-[22svh]">
          <p className="font-mono text-etiqueta tracking-[0.12em] text-ocre uppercase">{portada.antetitulo}</p>
          <h1 id="portada-titulo" className="mt-4 font-display text-hero font-medium text-texto italic">
            {portada.titulo}
          </h1>
          <p className="mt-5 max-w-[26rem] text-body text-texto-2 md:text-lead">{portada.bajada}</p>
        </div>

        <p className="absolute bottom-[3svh] left-4 z-10 font-mono text-etiqueta tracking-[0.12em] text-texto-2 uppercase sm:left-6 md:left-[6vw]">
          {portada.aumento} <span ref={aumentoRef} className="tabular-nums text-texto">× 6,0</span>
        </p>
        <p ref={invitaRef} className="absolute right-4 bottom-[3svh] z-10 font-mono text-etiqueta tracking-[0.12em] text-texto-2 uppercase sm:right-6 md:right-[6vw]">
          {portada.invitacion} ↓
        </p>
        <p ref={pieRef} className="absolute right-4 bottom-[3svh] z-10 bg-tinta px-3 py-1.5 font-mono text-etiqueta tracking-[0.12em] text-hueso uppercase sm:right-6 md:right-[6vw]" style={{opacity: 0}}>
          {portada.pie}
        </p>
      </div>
    </section>
  );
}
