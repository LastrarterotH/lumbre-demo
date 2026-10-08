/* ============================================================
   futuro/lugares
   Dónde va cada cosa en el valle de la última época (id 21, docs/era21-plan.md), sobre la geometría de la Época 1 (mundo.js):
   el fogón, la cueva y la laguna están donde estaban. El tablero es el elegido por el usuario («BACA»: la escuela en anillo
   alrededor del fogón, la chispa azul, las casas redondas de tierra y el valle de siempre). El motor (juego/src/09k-futuro.js)
   espeja estas anclas: si se mueve una, se mueve en los dos.
   ============================================================ */
import { FOGON, CUEVA, LAGUNA, PLAYA } from '../mundo.js';
export { FOGON, CUEVA, LAGUNA, PLAYA };

/* LAS ANCLAS DE LOS SEIS SABERES (87-92). Cada pieza deja libre el arco de adelante (+x +z): ahí se para o se sienta su gente */
export const ESCUELA    = { x: FOGON.x, y: FOGON.y };      // 87 · la escuela del valle: el anillo alrededor del círculo de piedras
export const TUTOR      = { x: 11.3, y: 13.0 };           // 88 · el tutor que pregunta: el claro de las preguntas, entre la escuela y la laguna
export const LLEGADA    = { x: 8.4, y: 15.9 };            // 89 · la traducción al instante: la parada donde llegan los de lejos, por el camino del frente
export const BIBLIOTECA = { x: 12.6, y: 8.0 };            // 90 · la biblioteca que responde: el pabellón de la cueva
export const EXAMEN     = { x: 15.2, y: 5.6 };            // 91 · el examen que cambia: las gradas de la defensa, al fondo a la derecha
export const MIRADOR    = { x: 3.6, y: 3.6 };             // 92 · la pregunta abierta: el mirador en la esquina del fondo, mirando la niebla

/* lo fijo del valle de hoy */
export const ESCUELA_R = 2.3, ESCUELA_r = 1.45;          // los radios del anillo (afuera y el patio)
export const PASARELA = [[9.25, 9.35], [9.45, 8.4], [9.6, 7.55]];   // a la boca de la cueva, sin pisar el sitio
export const MUELLE = { x: 12.85, y: 14.35 };
export const CASAS = [[4.4, 15.2, 0.9], [15.6, 9.9, -1.2]];          // los dos grupos de casas redondas [x, y, giro]
export const CAMINOS = [
  [[8.4, 17.9], [8.4, 15.4], [8.0, 12.2]],                             // de la llegada a la escuela (por la abertura del anillo)
  [[8.7, 10.6], [9.25, 9.35]],                                         // de la escuela a la pasarela de la cueva
  [[8.9, 11.3], [10.6, 12.4], [11.3, 13.0], [12.85, 14.35]],           // de la escuela al claro y al muelle
  [[9.9, 8.6], [12.2, 8.3]],                                           // de la pasarela al pabellón
  [[12.8, 8.6], [14.6, 9.6]], [[12.6, 7.4], [14.6, 6.2]],              // a las casas y a las gradas
  [[7.7, 7.1], [5.6, 5.0], [4.1, 4.1]],                                // del paso de atrás al mirador
  [[3.8, 11.0], [4.2, 14.1]],                                          // del paso de la izquierda a las casas del frente
];
/* la niebla: lo que todavía no sabemos, en los bordes (más espesa en la esquina del fondo, junto al mirador) */
const borde = (x0, z0, x1, z1, n, s) => Array.from({ length: n }, (_, i) => { const u = (i + 0.5) / n; return [x0 + (x1 - x0) * u, z0 + (z1 - z0) * u, s * (0.85 + 0.3 * ((i * 7) % 5) / 4)]; });
/* solo en los bordes del FONDO (como un horizonte que no se ve): adelante tapaba la parada, el muelle y el borde del tablero */
export const NIEBLA = [...borde(2.2, 2.6, 2.2, 11.5, 6, 1.05), ...borde(2.6, 2.2, 15.5, 2.2, 8, 1.05), [2.6, 2.6, 1.9], [3.4, 2.4, 1.4], [2.4, 3.6, 1.4], [2.1, 12.6, 0.7], [16.6, 2.1, 0.7]];
