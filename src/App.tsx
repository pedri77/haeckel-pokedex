import {useEffect} from 'react';
import {Arbol} from './components/Arbol';
import {Creditos} from './components/Creditos';
import {Intro} from './components/Intro';
import {Pokedex} from './components/Pokedex';
import {Portada} from './components/Portada';
import {Simetrias} from './components/Simetrias';
import {useMovimientoReducido} from './hooks/useMovimientoReducido';
import {iniciarScroll} from './lib/scroll';

/** Orden del guion: ocular · quién era Haeckel · árbol de la vida · simetrías · Pokédex · fuentes. */
export default function App() {
  const reducido = useMovimientoReducido();
  useEffect(() => iniciarScroll(reducido), [reducido]);
  return (
    <main>
      <Portada />
      <Intro />
      <Arbol />
      <Simetrias />
      <Pokedex />
      <Creditos />
    </main>
  );
}
