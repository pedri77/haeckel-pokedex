import {intro} from '../content';
import {useAparecer} from '../hooks/useAparecer';

/** Pausa tras la portada: bloque hueso (continúa el fondo de la lente abierta), con la nota sobre Haeckel. */
export function Intro() {
  const ref = useAparecer<HTMLElement>();
  return (
    <section ref={ref} aria-labelledby="intro-titulo" className="relative bg-hueso px-4 pt-[12svh] pb-[16svh] text-tinta sm:px-6 md:px-[6vw]">
      <div className="mx-auto grid max-w-[88rem] gap-10 md:grid-cols-[1.1fr_1fr] md:gap-[6vw]">
        <div>
          <p data-aparece className="font-mono text-etiqueta tracking-[0.12em] text-rojo-profundo uppercase">
            {intro.antetitulo}
          </p>
          <h2 id="intro-titulo" data-aparece style={{'--i': 1} as React.CSSProperties} className="mt-4 font-display text-display font-medium italic">
            {intro.titulo}
          </h2>
        </div>
        <div className="grid content-start gap-5 text-body text-[oklch(32%_0.02_250)] md:pt-10">
          {intro.cuerpo.map((t, i) => (
            <p key={i} data-aparece style={{'--i': i + 2} as React.CSSProperties}>
              {t}
            </p>
          ))}
          <p data-aparece style={{'--i': 4} as React.CSSProperties} className="mt-2 border-l-4 border-rojo pl-4 text-[0.9375rem]">
            {intro.sombra}
          </p>
        </div>
      </div>
    </section>
  );
}
