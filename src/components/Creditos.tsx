import {creditos} from '../content';
import {useAjustarTexto} from '../hooks/useAjustarTexto';
import {useAparecer} from '../hooks/useAparecer';
import {irA} from '../lib/scroll';

/** Cierre: fuentes y licencias, wordmark de borde a borde en Bodoni cursiva. */
export function Creditos() {
  const ref = useAparecer<HTMLElement>();
  const marca = useAjustarTexto<HTMLSpanElement>();
  return (
    <footer ref={ref} aria-labelledby="creditos-titulo" className="relative bg-void pt-[12svh]">
      <div className="mx-auto grid max-w-[88rem] gap-10 px-4 sm:px-6 md:grid-cols-2 md:px-[6vw]">
        <div>
          <p data-aparece className="font-mono text-etiqueta tracking-[0.12em] text-ocre uppercase">
            {creditos.antetitulo}
          </p>
          <h2 id="creditos-titulo" data-aparece style={{'--i': 1} as React.CSSProperties} className="mt-3 font-display text-display font-medium text-texto italic">
            {creditos.titulo}
          </h2>
          <p data-aparece style={{'--i': 2} as React.CSSProperties} className="mt-5 max-w-[36rem] text-body text-texto-2">
            {creditos.cuerpo}
          </p>
          <button
            type="button"
            onClick={() => irA('#inicio')}
            data-aparece
            style={{'--i': 3} as React.CSSProperties}
            className="mt-8 rounded-full px-5 py-2.5 text-[0.9375rem] font-semibold text-texto ring-1 ring-texto-3 transition-colors hover:bg-hueso hover:text-tinta"
          >
            ↑ {creditos.volver}
          </button>
        </div>
        <div data-aparece style={{'--i': 2} as React.CSSProperties}>
          <p className="border-l-4 border-ocre pl-4 text-body text-texto">{creditos.aviso}</p>
          <ul className="mt-8 grid gap-2 text-[0.9375rem] text-texto-2">
            {creditos.fuentes.map((f) => (
              <li key={f.url}>
                <a href={f.url} target="_blank" rel="noopener" className="underline decoration-borde underline-offset-4 transition-colors hover:text-texto hover:decoration-ocre">
                  {f.texto} ↗
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[0.8125rem] text-texto-3">{creditos.firma}</p>
        </div>
      </div>
      <div className="mt-[10svh] overflow-hidden px-4 pt-[0.12em] pb-[0.08em] sm:px-6 md:px-[6vw]" aria-hidden="true">
        <span ref={marca} className="inline-block font-display leading-[1.05] font-medium whitespace-nowrap text-ocre italic">
          {creditos.wordmark}
        </span>
      </div>
    </footer>
  );
}
