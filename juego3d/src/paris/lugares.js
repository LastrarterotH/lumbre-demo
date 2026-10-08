/* ============================================================
   paris/lugares
   La geometría de París que el 3D necesita sin depender del motor cargado (el laboratorio de etapas, juego3d/qa.html,
   arma las piezas sin el motor). Es el ESPEJO de juego/src/09f-paris.js: si se mueve algo aquí, se mueve allá
   (epoca8.js avisa en la consola si no coinciden).
   La composición es la maqueta A de la hoja (juego3d/bocetos/paris.html, «la orilla de las escuelas», 2026-10-04): el Sena
   corre a lo largo de z por el borde del fondo izquierdo (x < 6,6), con la Cité larga en z y Notre-Dame mostrando la fachada
   (+z, el poniente) y el flanco sur (+x); toda la orilla de enfrente es de las escuelas, con la Montaña al medio a la derecha.
   ============================================================ */
export const SENA = { x0: 1.4, x1: 6.6 };                       // el río: una franja en x (corre hacia +z, río abajo)
export const CITE = { x: 4.2, y: 8.1, rx: 1.4, ry: 5.6 };       // la isla: un rectángulo de esquinas redondas (superelipse de grado 4)
export const NOTREDAME = { x: 4.2, y: 6.05 };
export const ABADIA = { x: 15.75, y: 3.6 };
export const CAMPANA = { x: 15.1, y: 6.75 };
export const FOUARRE = { x: 9.7, y: 11.6 };
export const MONTANA = { x: 10.8, y: 9.7 };
export const SORBONA = { x: 11.75, y: 13.75 };
export const UNIVERSIDAD = { x: 9.05, y: 12.75 };
export const PERGAMINERO = { x: 7.6, y: 14.1 };
export const PUENTES = [{ z: 10.6, x0: 5.43, x1: 6.68 }, { z: 11.6, x0: 2.0, x1: 2.95 }];   // el Petit-Pont (a las escuelas) y el Grand-Pont (a los mercaderes, fuera del tablero): a lo largo de x
export const LUGAR_ABELARDO = { x: 12.75, y: 9.95 };
export const ESPERA_ABELARDO = { x: 7.75, y: 10.6 };
export const HOGARES = [[7.95, 9.9], [8.5, 9.95], [7.4, 11.55], [12.95, 12.35]];
export const enSena = (x) => x > SENA.x0 && x < SENA.x1;
export const enCite = (x, y, m = 0) => { const dx = (x - CITE.x) / (CITE.rx + m), dy = (y - CITE.y) / (CITE.ry + m); return dx * dx * dx * dx + dy * dy * dy * dy < 1; };
export const enPuente = (x, y) => PUENTES.some(p => Math.abs(y - p.z) < 0.22 && x > p.x0 - 0.05 && x < p.x1 + 0.05);
export const enAgua = (x, y, m = 0) => x > SENA.x0 - m && x < SENA.x1 + m && !enCite(x, y, -m) && !enPuente(x, y);
/* la Montaña de Santa Genoveva: la loma con sus viñas al medio de la orilla, a la derecha; la muralla la cruza */
export const LOMA = { x: 12.5, y: 6.6, rx: 3.3, ry: 3.0, h: 0.78 };
/* la muralla de Felipe Augusto (1190-1215): sale del río por la torre de Nesle, corre al sur, sube la ladera y vuelve al río
   por la Tournelle. Sus puertas: Santiago (la calle que sube del Petit-Pont), San Víctor (en la ladera) y la de Buci (al prado) */
export const MURALLA = [[6.65, 16.1], [13.9, 16.1], [13.9, 4.95], [6.65, 4.95]];
export const PUERTAS = [[13.9, 10.6], [12.9, 4.95], [10.15, 16.1]];
export const MURALLA_OESTE = 16.1, MURALLA_SUR = 13.9, MURALLA_ESTE = 4.95;
/* el espejo: ¿coincide con el motor? (solo en el juego, donde el motor existe) */
export function verificarEspejo() {
  if (typeof CITE_PA === 'undefined') return;
  const pares = [[NOTREDAME, NOTREDAME_PA], [ABADIA, ABADIA_PA], [CAMPANA, CAMPANA_PA], [FOUARRE, FOUARRE_PA], [MONTANA, MONTANA_PA], [SORBONA, SORBONA_PA], [UNIVERSIDAD, UNIVERSIDAD_PA], [PERGAMINERO, PERGAMINERO_PA], [LUGAR_ABELARDO, LUGAR_ABELARDO_PA], [ESPERA_ABELARDO, ESPERA_ABELARDO_PA]];
  for (const [a, b] of pares) if (Math.abs(a.x - b.x) > 1e-6 || Math.abs(a.y - b.y) > 1e-6) console.warn('paris/lugares no coincide con 09f-paris', a, b);
  if (CITE.x !== CITE_PA.x || CITE.ry !== CITE_PA.ry || SENA.x1 !== SENA_PA.x1 || PUENTES[0].z !== PUENTES_PA[0].z) console.warn('el Sena, la Cité o los puentes de paris/lugares no coinciden con 09f-paris');
}
