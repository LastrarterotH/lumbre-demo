/* ============================================================
   santiago/lugares
   La geometría de Santiago que el 3D necesita sin depender del motor cargado (el laboratorio de etapas, juego3d/qa.html,
   arma las piezas sin el motor). Es el ESPEJO de juego/src/09h-santiago.js: si se mueve algo aquí, se mueve allá
   (epoca10.js avisa en la consola si no coinciden).
   ============================================================ */
export const ANDES = 7.4;
export const MAPOCHO = { z0: 5.55, z1: 6.15 };
export const PUENTE = { x: 9.3, z0: 5.4, z1: 6.3 };
export const DAMERO = { x0: 3.1, x1: 16.6, y0: 6.75, y1: 12.35, paso: 1.125, calle: 0.22 };
export const PLAZA = { x: 9.2875, y: 9.5625, r: 0.45 };
export const SANTALUCIA = { x: 13.7875, y: 9.5625, r: 0.9 };
export const ALAMEDA = { z0: 12.55, z1: 13.15 };
export const LANCASTER = { x: 4.7875, y: 10.6875 }, NORMAL = { x: 7.0375, y: 11.8125 }, SILABARIO = { x: 11.5375, y: 7.3125 };
export const PRECEPTORAS = { x: 11.5375, y: 11.8125 }, CONGRESO = { x: 7.0375, y: 7.3125 }, KINDER = { x: 14.9125, y: 11.8125 };
export const MONEDA = { x: 9.2875, y: 11.8125 }, CATEDRAL = { x: 8.1625, y: 9.5625 };
export const DILIGENCIA = { x: 3.4, y: 12.0 };
export const ESPERA_SARMIENTO = { x: 15.6, y: 6.9 }, LUGAR_SARMIENTO = { x: 7.6, y: 12.42 };
export const enAndes = (x, y) => x + y < ANDES;
export const enMapocho = (x, y) => y > MAPOCHO.z0 && y < MAPOCHO.z1 && !(Math.abs(x - PUENTE.x) < 0.2);
export const enCerro = (x, y, m = 0) => Math.hypot(x - SANTALUCIA.x, y - SANTALUCIA.y) < SANTALUCIA.r + m;
/* el damero: ¿es calle? (las calles corren cada `paso`, de ancho `calle`) */
export const enCalle = (x, y) => {
  if (x < DAMERO.x0 - 0.12 || x > DAMERO.x1 + 0.12 || y < DAMERO.y0 - 0.12 || y > DAMERO.y1 + 0.12) return false;
  const fx = ((x - DAMERO.x0) % DAMERO.paso + DAMERO.paso) % DAMERO.paso, fy = ((y - DAMERO.y0) % DAMERO.paso + DAMERO.paso) % DAMERO.paso;
  return fx < DAMERO.calle / 2 || fx > DAMERO.paso - DAMERO.calle / 2 || fy < DAMERO.calle / 2 || fy > DAMERO.paso - DAMERO.calle / 2;
};
export const enDamero = (x, y) => x > DAMERO.x0 && x < DAMERO.x1 && y > DAMERO.y0 && y < DAMERO.y1;
/* el centro de la manzana en que cae un punto */
export const manzana = (x, y) => ({ x: DAMERO.x0 + (Math.floor((x - DAMERO.x0) / DAMERO.paso) + 0.5) * DAMERO.paso, y: DAMERO.y0 + (Math.floor((y - DAMERO.y0) / DAMERO.paso) + 0.5) * DAMERO.paso });
export function verificarEspejo() {
  if (typeof NORMAL_SA === 'undefined') return;
  const pares = [[LANCASTER, LANCASTER_SA], [NORMAL, NORMAL_SA], [SILABARIO, SILABARIO_SA], [PRECEPTORAS, PRECEPTORAS_SA], [CONGRESO, CONGRESO_SA], [KINDER, KINDER_SA], [MONEDA, MONEDA_SA], [CATEDRAL, CATEDRAL_SA], [ESPERA_SARMIENTO, ESPERA_SARMIENTO_SA], [LUGAR_SARMIENTO, LUGAR_SARMIENTO_SA]];
  for (const [a, b] of pares) if (Math.abs(a.x - b.x) > 1e-6 || Math.abs(a.y - b.y) > 1e-6) console.warn('santiago/lugares no coincide con 09h-santiago', a, b);
  if (DAMERO.x0 !== DAMERO_SA.x0 || MAPOCHO.z0 !== MAPOCHO_SA.z0) console.warn('el damero o el Mapocho de santiago/lugares no coinciden con 09h-santiago');
}
