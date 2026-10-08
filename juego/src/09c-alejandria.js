/* ============================================================
   09c-alejandria
   Época 5 (Alejandría, docs/era5-plan.md): la geometría del mundo que comparten el motor y Lumbre 3D (la costa,
   el muelle, el amarre del barco, la Biblioteca, la vara de la sombra, el lago Mareotis) y los autores que traen
   los barcos para el catálogo. La época se juega en 3D: aquí no hay dibujos 2D, solo los lugares.
   La orientación es la real, girada para la cámara: el norte queda atrás a la derecha (z chica), así que el mar y el
   Gran Puerto son una franja del fondo, con el Faro en su isla en la esquina de arriba; el sur, al frente a la
   izquierda, es el lago Mareotis con su juncal de papiro. La vía Canópica cruza la ciudad de oeste a este (a lo largo
   de x) y la calle del Soma de norte a sur (a lo largo de z): se cruzan en la plaza del centro. El barrio de los
   palacios, con el Museo y la Biblioteca, queda al noreste, junto al puerto; el Serapeo, en su colina, al suroeste.
   ============================================================ */
function costaAl(x) { return 4.45 + 0.3 * Math.sin(x * 0.6) + 0.55 * Math.exp(-(((x - 9.2) / 2.4) ** 2)); }   // la orilla del mar: el Gran Puerto se mete un poco en la ciudad
function lagoAl(x) { return 15.9 + 0.3 * Math.sin(x * 0.7 + 1); }                                            // la orilla del Mareotis
const FARO_AL = { x: 3.3, y: 2.7, r: 1.25 };                      // el Faro en su isla, al fondo
const MUELLE_AL = { x: 8.6, y: 5.0 };                             // el muelle de piedra del Gran Puerto: aquí esperan los rollos
const AMARRE_AL = { x: 8.75, y: 2.75 };                           // donde amarra el barco que trae libros: en la punta del espigón
const BARCA_AL = { x: 6.9, y: 4.0 };                              // la barca de los hombres del rey, junto al muelle
const BIBLIOTECA_AL = { x: 7.1, y: 6.75 };                        // la sala de los rollos, junto al puerto
const MUSEO_AL = { x: 13.3, y: 7.1 };                             // la casa de las Musas
const VARA_AL = { x: 9.05, y: 10.85 };                            // la vara de Eratóstenes, en la plaza
const SERAPEO_AL = { x: 4.6, y: 13.0 };                           // la colina de Racotis, al suroeste
const LAGO_AL = { x: 11.5, y: 15.4, r: 1.0 };                     // el juncal del lago Mareotis (la orilla la da lagoAl)
const HOGARES_AL = [[13.6, 11.6], [15.2, 11.3], [14.4, 12.9]];   // las puertas de las casas del barrio griego
const SOMA_AL = { x: 10.2, y: 9.6 };                              // el cruce de la vía Canópica con la calle del Soma: la plaza
function enAguaAl(x, y, m = 0) {                                  // el mar del puerto y el lago (la isla del Faro es tierra); m ensancha el agua
  if (Math.hypot(x - FARO_AL.x, y - FARO_AL.y) < FARO_AL.r - m) return false;
  return y < costaAl(x) + m || y > lagoAl(x) - m;
}

/* LOS GÉNEROS DE LOS PÍNAKES (cuatro estantes de los muchos que tuvo el catálogo de Calímaco) y LOS AUTORES que
   traen los barcos: cada uno con la pista con que se lo conocía. Autores de fuera de Alejandría, porque llegan por
   mar (Arquímedes le mandaba sus libros a Eratóstenes desde Siracusa). */
const GENEROS_AL = [
  { n: 'Poesía', ico: '🎭' }, { n: 'Historia', ico: '📜' }, { n: 'Medicina', ico: '⚕️' }, { n: 'Matemática', ico: '📐' }
];
const AUTORES_AL = [
  { n: 'Homero', e: 'el que cantó la cólera de Aquiles', g: 0 },
  { n: 'Safo', e: 'la de Lesbos, que cantó al amor', g: 0 },
  { n: 'Píndaro', e: 'el que cantó a los que vencían en Olimpia', g: 0 },
  { n: 'Eurípides', e: 'el de las tragedias de Medea y de las troyanas', g: 0 },
  { n: 'Heródoto', e: 'el que les preguntó a los egipcios por sus reyes', g: 1 },
  { n: 'Tucídides', e: 'el de la guerra entre Atenas y Esparta', g: 1 },
  { n: 'Jenofonte', e: 'el que volvió de Persia con los Diez Mil', g: 1 },
  { n: 'Manetón', e: 'el sacerdote que contó las dinastías de los faraones', g: 1 },
  { n: 'Hipócrates', e: 'el de Cos, que miraba al enfermo antes que al dios', g: 2 },
  { n: 'Diocles', e: 'el de Caristo, que escribió de dietas y de hierbas', g: 2 },
  { n: 'Praxágoras', e: 'el que distinguió las arterias de las venas', g: 2 },
  { n: 'Alcmeón', e: 'el de Crotona, que dijo que se piensa con el cerebro', g: 2 },
  { n: 'Arquímedes', e: 'el de Siracusa, el de la palanca y la esfera', g: 3 },
  { n: 'Eudoxo', e: 'el de Cnido, el de las proporciones', g: 3 },
  { n: 'Tales', e: 'el de Mileto, que midió las pirámides por su sombra', g: 3 },
  { n: 'Autólico', e: 'el de Pitane, el de la esfera que gira', g: 3 }
];
