/* ============================================================
   amsterdam/lugares
   La geometría de Ámsterdam que el 3D necesita sin depender del motor cargado (el laboratorio de etapas, juego3d/qa.html,
   arma las piezas sin el motor). Es el ESPEJO de juego/src/09g-amsterdam.js: si se mueve algo aquí, se mueve allá
   (epoca9.js avisa en la consola si no coinciden). El tablero B del replanteo visual (2026-10-04, «los canales como
   gradas»): el centro del anillo en la esquina del fondo, en la orilla del IJ, y los tres canales cruzando el tablero.
   ============================================================ */
export const IJ = { z1: 3.6 };
export const CENTRO = { x: 2.0, y: 3.6 };
export const GRACHTEN = [9.3, 11.8, 14.3];
export const ANCHO_GRACHT = 0.7;
export const GRADO = Math.PI / 180;
export const PUENTES = [9, 31, 49, 69].map(g => g * GRADO);
export const MURALLA = 16.5, FOSO = [16.85, 17.45];
export const PUENTE_FOSO = 30 * GRADO;
export const DAM = { x: 6.0, y: 8.6 };
export const STADHUIS = { x: 4.8, y: 5.95 };
export const polar = (r, g) => ({ x: CENTRO.x + r * Math.cos(g * GRADO), y: CENTRO.y + r * Math.sin(g * GRADO) });   // g: grados
export const PRENSA = polar(10.55, 40), TIPOS = polar(13.05, 40), ESCUELA = polar(13.05, 58), ORBIS = polar(13.05, 21), ATLAS = polar(15.25, 27), AULA = polar(15.25, 57), MOLINO = polar(MURALLA, 45);
export const ESPERA_COMENIO = { x: 12.5, y: 3.9 };
export const LUGAR_COMENIO = { x: 11.27, y: 16.08 };
export const radio = (x, y) => Math.hypot(x - CENTRO.x, y - CENTRO.y);
export const angulo = (x, y) => Math.atan2(y - CENTRO.y, x - CENTRO.x);
export const enPuente = (x, y) => { const a = angulo(x, y), r = radio(x, y); return PUENTES.some(p => Math.abs(a - p) * r < 0.2); };
export const enGracht = (x, y) => { if (y < IJ.z1) return false; const r = radio(x, y); return GRACHTEN.some(g => Math.abs(r - g) < ANCHO_GRACHT / 2) && !enPuente(x, y); };
export const enFoso = (x, y) => { const r = radio(x, y); return y > IJ.z1 && r > FOSO[0] && r < FOSO[1] && Math.abs(angulo(x, y) - PUENTE_FOSO) * r > 0.25; };
export const enAgua = (x, y) => y < IJ.z1 || enGracht(x, y) || enFoso(x, y);
/* el espejo: ¿coincide con el motor? (solo en el juego, donde el motor existe) */
export function verificarEspejo() {
  if (typeof CENTRO_AM === 'undefined') return;
  const pares = [[TIPOS, TIPOS_AM], [PRENSA, PRENSA_AM], [ESCUELA, ESCUELA_AM], [ATLAS, ATLAS_AM], [AULA, AULA_AM], [ORBIS, ORBIS_AM], [MOLINO, MOLINO_AM], [STADHUIS, STADHUIS_AM], [DAM, DAM_AM], [ESPERA_COMENIO, ESPERA_COMENIO_AM], [LUGAR_COMENIO, LUGAR_COMENIO_AM]];
  for (const [a, b] of pares) if (Math.abs(a.x - b.x) > 1e-6 || Math.abs(a.y - b.y) > 1e-6) console.warn('amsterdam/lugares no coincide con 09g-amsterdam', a, b);
  let distintos = 0;   // el agua entera, muestreada: los canales, sus anchos, los puentes, el foso y el IJ
  for (let x = 2.05; x < 18; x += 0.1) for (let y = 2.05; y < 18; y += 0.1) if (enAgua(x, y) !== enAguaAm(x, y)) distintos++;
  if (distintos || CENTRO.x !== CENTRO_AM.x || CENTRO.y !== CENTRO_AM.y || MURALLA !== MURALLA_AM) console.warn('los canales de amsterdam/lugares no coinciden con 09g-amsterdam', distintos);
}
