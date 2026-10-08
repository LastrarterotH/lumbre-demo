/* ============================================================
   bagdad/lugares
   La geometría de Bagdad que el 3D necesita sin depender del motor cargado (el laboratorio de etapas, juego3d/qa.html,
   arma las piezas sin el motor). Es el ESPEJO de juego/src/09d-bagdad.js: si se mueve algo aquí, se mueve allá
   (epoca6.js avisa en la consola si no coinciden).
   ============================================================ */
export const CIUDAD = { x: 6.6, y: 6.6, r: 3.5 };
export const PUERTAS = { kufa: { x: 6.6, y: 10.1 }, jorasan: { x: 10.1, y: 6.6 }, sham: { x: 3.1, y: 6.6 }, basora: { x: 6.6, y: 3.1 } };
export const PALACIO = { x: 6.6, y: 6.6 };
export const MEZQUITA = { x: 7.93, y: 6.2 };
export const HALQA = { x: 9.2, y: 12.6 };
export const CASA = { x: 12.4, y: 11.0 };
export const MESA = { x: 11.4, y: 13.1 };
export const ESPERA = { x: 6.6, y: 11.3 };
export const MOLINO = { x: 13.1, y: 16.4 };
export const ZOCO = { x: 8.6, y: 14.8 };
export const CADI = { x: 10.6, y: 14.6 };
export const MADRASA = { x: 14.1, y: 13.6 };
export const TIGRIS_X0 = 15.2;
export const CANAL = { z: 16.4, x0: 2.0 };
export const HOGARES = [[3.3, 12.35], [4.5, 12.25], [3.0, 13.62], [4.6, 13.52]];
export const LUGAR_HUNAYN = { x: 12.65, y: 12.4 };
export const PUERTA_CASA = { x: 10.75, y: 11.85 };
export const enAgua = (x, y, m = 0) => x > TIGRIS_X0 - m || (x > CANAL.x0 - m && Math.abs(y - CANAL.z) < 0.28 + m);
export function enMuralla(x, y, ancho = 0.35) {
  const d = Math.hypot(x - CIUDAD.x, y - CIUDAD.y);
  if (Math.abs(d - CIUDAD.r) > ancho) return false;
  return !Object.values(PUERTAS).some(p => Math.hypot(x - p.x, y - p.y) < 0.75);
}
/* el espejo: ¿coincide con el motor? (solo en el juego, donde el motor existe) */
export function verificarEspejo() {
  if (typeof CIUDAD_BA === 'undefined') return;
  const pares = [[CIUDAD, CIUDAD_BA], ...Object.keys(PUERTAS).map(k => [PUERTAS[k], PUERTAS_BA[k]]), [PALACIO, PALACIO_BA], [MEZQUITA, MEZQUITA_BA], [HALQA, HALQA_BA], [CASA, CASA_BA], [MESA, MESA_BA], [ESPERA, ESPERA_BA], [MOLINO, MOLINO_BA], [ZOCO, ZOCO_BA], [CADI, CADI_BA], [MADRASA, MADRASA_BA], [LUGAR_HUNAYN, LUGAR_HUNAYN_BA], [PUERTA_CASA, PUERTA_CASA_BA]];
  for (const [a, b] of pares) if (Math.abs(a.x - b.x) > 1e-6 || Math.abs(a.y - b.y) > 1e-6) console.warn('bagdad/lugares no coincide con 09d-bagdad', a, b);
  if (CIUDAD.r !== CIUDAD_BA.r || TIGRIS_X0 !== TIGRIS_BA.x0 || CANAL.z !== CANAL_BA.z || CANAL.x0 !== CANAL_BA.x0) console.warn('el Tigris o el canal de bagdad/lugares no coinciden con 09d-bagdad');
}
