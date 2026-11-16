/** Todo el texto de la página vive aquí. Los componentes no llevan texto suelto. */
import datos from './datos/laminas.json';

export type GrupoId = 'protistas' | 'plantas' | 'hongos' | 'cnidarios' | 'equinodermos' | 'invertebrados' | 'artropodos' | 'vertebrados';

export type Lamina = {
  n: number;
  latin: string;
  nombre: string;
  grupo: GrupoId;
  texto: string;
  fichero: string;
  licencia: string;
  taxon: string | null;
  gbif: number | null;
  registros: number | null;
  color: string;
  w: number;
  h: number;
};

export const laminas = datos as Lamina[];

const base = import.meta.env.BASE_URL;
export const img = (n: number) => `${base}laminas/${String(n).padStart(3, '0')}.webp`;
export const miniatura = (n: number) => `${base}laminas/m/${String(n).padStart(3, '0')}.webp`;
export const commons = (fichero: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fichero.replace(/ /g, '_'))}`;
export const gbifUrl = (clave: number) => `https://www.gbif.org/species/${clave}`;
export const num = (n: number) => String(n).padStart(3, '0');

export const grupos: {id: GrupoId; nombre: string; reino: 'Protista' | 'Plantae' | 'Animalia'}[] = [
  {id: 'protistas', nombre: 'Protistas', reino: 'Protista'},
  {id: 'plantas', nombre: 'Plantas y algas', reino: 'Plantae'},
  {id: 'hongos', nombre: 'Hongos y líquenes', reino: 'Plantae'},
  {id: 'cnidarios', nombre: 'Esponjas y medusas', reino: 'Animalia'},
  {id: 'equinodermos', nombre: 'Equinodermos', reino: 'Animalia'},
  {id: 'invertebrados', nombre: 'Gusanos y moluscos', reino: 'Animalia'},
  {id: 'artropodos', nombre: 'Artrópodos', reino: 'Animalia'},
  {id: 'vertebrados', nombre: 'Vertebrados', reino: 'Animalia'},
];

export const portada = {
  antetitulo: 'Ernst Haeckel · Kunstformen der Natur · 1904',
  titulo: 'Formas de la naturaleza',
  bajada: 'Cien láminas de radiolarios, medusas, orquídeas y murciélagos. Mira por el ocular.',
  invitacion: 'Desliza para enfocar',
  lamina: 8,
  aumento: 'Aumento',
  pie: 'Lámina 8 · Discomedusae',
};

export const intro = {
  antetitulo: 'Quién las dibujó',
  titulo: 'Un zoólogo que veía arte donde otros veían plancton.',
  cuerpo: [
    'Ernst Haeckel (1834–1919) enseñaba zoología en Jena y fue el gran defensor de Darwin en Alemania. Inventó palabras que hoy usamos sin pensar: ecología, filo, Protista.',
    'Entre 1899 y 1904 publicó por entregas Kunstformen der Natur, «formas artísticas de la naturaleza»: cien láminas litografiadas por Adolf Giltsch a partir de sus dibujos. El modernismo las copió en rejas, lámparas y portadas; la puerta monumental de la Exposición de París de 1900 está inspirada en sus radiolarios.',
  ],
  sombra:
    'No todo se celebra: Haeckel retocó dibujos de embriones para que encajaran con su teoría y defendió jerarquías raciales que luego se usaron para justificar lo injustificable. Aquí se miran sus láminas, no sus ideas.',
};

export const arbol = {
  antetitulo: 'El árbol de la vida',
  titulo: 'Tres troncos y una raíz',
  cuerpo:
    'En 1866 Haeckel dibujó uno de los primeros árboles genealógicos de todos los seres vivos, con tres reinos: plantas, animales y uno nuevo que inventó para lo que no era ni lo uno ni lo otro, los protistas.',
  etiqueta: 'Árbol de la vida al estilo de Haeckel, con los ocho grupos de las láminas',
  raiz: 'Origen común',
  laminas: (n: number) => (n === 1 ? '1 lámina' : `${n} láminas`),
};

export const simetrias = {
  antetitulo: 'Simetrías',
  titulo: 'La regla que se repite',
  etiqueta: 'Caleidoscopio con un radiolario de la lámina 21',
  lamina: 21,
  pasos: [
    {n: 2, nombre: 'Bilateral', texto: 'Un solo espejo: izquierda y derecha. La de las mariposas, los peces y la tuya.'},
    {n: 3, nombre: 'Radial de tres', texto: 'Muchas diatomeas y radiolarios reparten su cuerpo en tres sectores iguales.'},
    {n: 5, nombre: 'Radial de cinco', texto: 'La firma de los equinodermos: estrellas, erizos y lirios de mar.'},
    {n: 6, nombre: 'Radial de seis', texto: 'Los corales hexacoralarios cuentan sus tentáculos de seis en seis.'},
    {n: 12, nombre: 'Casi esférica', texto: 'Los radiolarios rozan la esfera perfecta. Haeckel los dibujaba como joyas.'},
  ],
};

export const pokedex = {
  antetitulo: 'La Pokédex de Haeckel',
  titulo: 'Las cien láminas',
  cuerpo: 'Elige un espécimen en la lista o recórrela con ↑ y ↓. Cada ficha lleva su lámina, su grupo y cuántos registros tiene hoy su grupo moderno en GBIF.',
  todos: 'Todos',
  buscar: 'Buscar por nombre o número',
  sinResultados: 'Ningún espécimen coincide.',
  resultados: (n: number) => (n === 1 ? '1 lámina' : `${n} láminas`),
  registros: 'registros en GBIF',
  sinTaxon: 'Sin equivalente moderno exacto',
  sinTaxonDetalle: 'El grupo de Haeckel ya no existe como tal o está extinguido.',
  verGbif: 'Ver en GBIF',
  verCommons: 'Lámina en Commons',
  anterior: 'Anterior',
  siguiente: 'Siguiente',
  laminaDe: 'de 100',
};

export const creditos = {
  antetitulo: 'Fuentes',
  titulo: 'Cómo está hecha',
  cuerpo:
    'Las cien láminas de Kunstformen der Natur (1904) proceden de Wikimedia Commons y están en dominio público: Ernst Haeckel murió en 1919 y su litógrafo, Adolf Giltsch, en 1911. Los recuentos de registros salen de la API pública de GBIF, consultada al construir la web. Nombres en castellano y textos propios.',
  fuentes: [
    {texto: 'Kunstformen der Natur en Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/Kunstformen_der_Natur'},
    {texto: 'GBIF, Global Biodiversity Information Facility', url: 'https://www.gbif.org/'},
    {texto: 'Biodiversity Heritage Library', url: 'https://www.biodiversitylibrary.org/'},
  ],
  aviso: 'Los grupos de Haeckel no siempre coinciden con la clasificación actual. El taxón moderno de cada ficha es una equivalencia aproximada.',
  volver: 'Volver arriba',
  wordmark: 'Kunstformen',
  firma: 'Textos y código hechos con IA (Claude) y revisados, como pieza de portfolio.',
};
