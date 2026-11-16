import {useMemo, useRef, useState} from 'react';
import {commons, gbifUrl, grupos, img, laminas, miniatura, num, pokedex, type GrupoId} from '../content';
import {useAparecer} from '../hooks/useAparecer';

/**
 * La Pokédex: un aparato con la lista de especímenes a un lado y el visor al otro. El fondo de la
 * sección es un bloque liso del color dominante de la lámina elegida (transición de 500 ms) y el texto
 * pasa a tinta o a hueso según la luminancia. No va ligada al scroll: es la parte que se usa.
 * Teclado: en la lista, ↑ ↓ (y ← →) mueven la selección y el foco; Inicio y Fin van a los extremos.
 */

const GRUPO = Object.fromEntries(grupos.map((g) => [g.id, g.nombre]));

function luminancia(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const sinTildes = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function Pokedex() {
  const ref = useAparecer<HTMLElement>();
  const [grupo, setGrupo] = useState<GrupoId | null>(null);
  const [busca, setBusca] = useState('');
  const [sel, setSel] = useState(8);
  const filaRefs = useRef(new Map<number, HTMLButtonElement>());

  const visibles = useMemo(() => {
    const q = sinTildes(busca.trim());
    return laminas.filter((l) => (!grupo || l.grupo === grupo) && (!q || sinTildes(`${l.n} ${l.nombre} ${l.latin}`).includes(q)));
  }, [grupo, busca]);
  const l = laminas.find((x) => x.n === sel)!;
  const claro = luminancia(l.color) > 0.32;
  const tinta = claro ? 'var(--color-tinta)' : 'var(--color-hueso)';

  const ir = (n: number, foco = false) => {
    setSel(n);
    if (foco) {
      const b = filaRefs.current.get(n);
      b?.focus({preventScroll: true});
      b?.scrollIntoView({block: 'nearest', inline: 'nearest'});
    }
  };
  const mover = (paso: number, foco = false) => {
    if (!visibles.length) return;
    const i = visibles.findIndex((x) => x.n === sel);
    const j = i < 0 ? 0 : (i + paso + visibles.length) % visibles.length;
    ir(visibles[j].n, foco);
  };

  return (
    <section
      ref={ref}
      id="pokedex"
      aria-labelledby="pokedex-titulo"
      className="relative px-4 pt-[12svh] pb-[12svh] transition-colors duration-500 sm:px-6 md:px-[4vw]"
      style={{background: l.color, color: tinta}}
    >
      <div className="mx-auto max-w-[96rem]">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p data-aparece className="font-mono text-etiqueta tracking-[0.12em] uppercase opacity-80">
              {pokedex.antetitulo}
            </p>
            <h2 id="pokedex-titulo" data-aparece style={{'--i': 1} as React.CSSProperties} className="mt-3 font-display text-display font-medium italic">
              {pokedex.titulo}
            </h2>
            <p data-aparece style={{'--i': 2} as React.CSSProperties} className="mt-3 max-w-[40rem] text-body opacity-85">
              {pokedex.cuerpo}
            </p>
          </div>
          <label data-aparece style={{'--i': 3} as React.CSSProperties} className="block">
            <span className="sr-only">{pokedex.buscar}</span>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={pokedex.buscar}
              className="w-full rounded-full bg-hueso px-5 py-2.5 text-[0.9375rem] text-tinta placeholder:text-[oklch(50%_0.02_250)] md:w-80"
            />
          </label>
        </div>

        <div data-aparece style={{'--i': 3} as React.CSSProperties} role="group" aria-label="Filtrar por grupo" className="mt-6 flex flex-wrap gap-2">
          {[null, ...grupos.map((g) => g.id)].map((id) => {
            const activo = grupo === id;
            return (
              <button
                key={id ?? 'todos'}
                type="button"
                aria-pressed={activo}
                onClick={() => setGrupo(id)}
                className={`rounded-full px-3.5 py-1.5 text-[0.875rem] font-medium ring-1 ring-current transition-colors ${activo ? 'bg-tinta text-hueso ring-tinta' : 'hover:bg-current/10'}`}
              >
                {id ? GRUPO[id] : pokedex.todos}
              </button>
            );
          })}
        </div>
        <p className="sr-only" aria-live="polite">
          {pokedex.resultados(visibles.length)}
        </p>

        {/* El aparato */}
        <div className="mt-8 grid gap-3 rounded-[2rem] bg-tinta p-3 text-hueso shadow-[0_30px_80px_-30px_oklch(10%_0.02_250/0.7)] md:grid-cols-[minmax(16rem,22rem)_1fr] md:p-4">
          <ul
            aria-label={pokedex.titulo}
            onKeyDown={(e) => {
              const pasos: Record<string, number> = {ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1};
              if (e.key in pasos) {
                e.preventDefault();
                mover(pasos[e.key], true);
              } else if (e.key === 'Home' || e.key === 'End') {
                e.preventDefault();
                if (visibles.length) ir(visibles[e.key === 'Home' ? 0 : visibles.length - 1].n, true);
              }
            }}
            className="lista-fina order-2 flex gap-1 overflow-x-auto rounded-[1.4rem] bg-[oklch(22%_0.025_250)] p-2 md:order-1 md:block md:h-[74svh] md:overflow-x-hidden md:overflow-y-auto"
            data-lenis-prevent
          >
            {visibles.length === 0 && <li className="p-4 text-[0.9375rem] text-texto-3">{pokedex.sinResultados}</li>}
            {visibles.map((x) => {
              const activo = x.n === sel;
              return (
                <li key={x.n} className="shrink-0">
                  <button
                    ref={(el) => {
                      if (el) filaRefs.current.set(x.n, el);
                      else filaRefs.current.delete(x.n);
                    }}
                    type="button"
                    aria-current={activo ? 'true' : undefined}
                    tabIndex={activo || (!visibles.some((v) => v.n === sel) && x === visibles[0]) ? 0 : -1}
                    onClick={() => ir(x.n)}
                    className={`flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition-colors md:px-2 ${activo ? 'bg-hueso text-tinta' : 'hover:bg-white/10'}`}
                  >
                    <img src={miniatura(x.n)} alt="" loading="lazy" decoding="async" className="h-14 w-10 shrink-0 rounded-md object-cover md:h-11 md:w-8" />
                    <span className="min-w-0 max-md:hidden">
                      <span className={`block font-mono text-[0.6875rem] tabular-nums ${activo ? 'text-[oklch(45%_0.02_250)]' : 'text-texto-3'}`}>N.º {num(x.n)}</span>
                      <span className="block truncate text-[0.9375rem] font-medium">{x.nombre}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Visor */}
          <div className="order-1 grid gap-3 md:order-2 lg:grid-cols-[1fr_minmax(18rem,22rem)]">
            <div className="relative flex items-center justify-center overflow-hidden rounded-[1.4rem] bg-hueso p-3 md:h-[74svh]">
              <img
                key={l.n}
                src={img(l.n)}
                alt={`${l.nombre} (${l.latin}), lámina ${l.n} de Kunstformen der Natur, de Ernst Haeckel.`}
                width={l.w}
                height={l.h}
                decoding="async"
                className="max-h-[62svh] w-auto max-w-full animate-[entra-lamina_0.4s_ease-out] object-contain md:max-h-full"
              />
              <span className="absolute top-4 left-4 rounded-full bg-tinta px-3 py-1 font-mono text-[0.75rem] tabular-nums text-hueso">
                N.º {num(l.n)} <span className="text-texto-3">{pokedex.laminaDe}</span>
              </span>
            </div>
            <div className="flex flex-col rounded-[1.4rem] bg-[oklch(22%_0.025_250)] p-5 md:p-6">
              <p className="flex items-center gap-2 font-mono text-[0.75rem] tracking-[0.12em] uppercase">
                <span className="inline-block size-3 rounded-full" style={{background: l.color}} aria-hidden="true" />
                {GRUPO[l.grupo]}
              </p>
              <h3 className="mt-3 font-display text-[clamp(1.875rem,3vw,2.75rem)] leading-[1.02] font-medium" aria-live="polite">
                {l.nombre}
              </h3>
              <p className="mt-1 font-display text-[1.125rem] text-ocre italic">{l.latin}</p>
              <p className="mt-4 text-body text-texto-2">{l.texto}</p>

              <div className="mt-5 border-t border-white/15 pt-4">
                {l.registros !== null && l.gbif !== null ? (
                  <>
                    <p className="text-[2rem] leading-none font-semibold tracking-[-0.02em] tabular-nums">{l.registros.toLocaleString('es-ES')}</p>
                    <p className="mt-1 text-[0.875rem] text-texto-2">
                      {pokedex.registros} · <i>{l.taxon}</i>
                    </p>
                    <a href={gbifUrl(l.gbif)} target="_blank" rel="noopener" className="mt-2 inline-block text-[0.875rem] underline decoration-white/30 underline-offset-4 hover:decoration-ocre">
                      {pokedex.verGbif} ↗
                    </a>
                  </>
                ) : (
                  <>
                    <p className="text-[1rem] font-semibold">{pokedex.sinTaxon}</p>
                    <p className="mt-1 text-[0.875rem] text-texto-2">{pokedex.sinTaxonDetalle}</p>
                  </>
                )}
              </div>
              <a href={commons(l.fichero)} target="_blank" rel="noopener" className="mt-3 text-[0.875rem] underline decoration-white/30 underline-offset-4 hover:decoration-ocre">
                {pokedex.verCommons} ↗
              </a>
              <div className="mt-auto flex gap-2 pt-6">
                <button type="button" onClick={() => mover(-1)} className="flex-1 rounded-full py-2 text-[0.875rem] font-semibold ring-1 ring-white/30 hover:bg-white/10">
                  ← {pokedex.anterior}
                </button>
                <button type="button" onClick={() => mover(1)} className="flex-1 rounded-full py-2 text-[0.875rem] font-semibold ring-1 ring-white/30 hover:bg-white/10">
                  {pokedex.siguiente} →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
