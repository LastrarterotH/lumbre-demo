/* ============================================================
   kaifeng/lugares
   La geometría de Kaifeng que el 3D necesita sin depender del motor cargado (el laboratorio de etapas, juego3d/qa.html,
   arma las piezas sin el motor). Es el ESPEJO de juego/src/09j-kaifeng.js: si se mueve algo aquí, se mueve allá
   (epoca15.js avisa en la consola si no coinciden).
   La composición es la maqueta A de la hoja (juego3d/bocetos/kaifeng.html, ACAA, 2026-10-06): la Pagoda de Hierro con su
   templo llena la esquina del fondo; la muralla de la ciudad interior corre por el borde de atrás, con la puerta y su
   torre a la derecha; el Bian cruza en diagonal con sus barcas y el Puente Arcoíris lo salta en el centro; la casa de té
   mira al río desde la orilla de atrás; del puente para adelante, la explanada de las escuelas. 1 = una baldosa; x, y del
   motor = x, z del mundo. El norte queda atrás (−z) y el este a la izquierda (−x): el Bian entra por el noroeste y sale
   por el sudeste, como en la ciudad.
   ============================================================ */
import { suave } from '../roma/lugares.js';

/* el Bian: los puntos de control del eje y el ancho en cada uno; el cauce, el mismo Catmull-Rom uniforme del Tíber */
export const BIAN = { pts: [[19.5, 5.4], [16.5, 6.9], [13.0, 8.8], [10.0, 10.4], [7.0, 11.9], [4.0, 13.4], [0.5, 15.0]], anchos: [2.6, 2.6, 2.5, 2.3, 2.5, 2.7, 2.7] };
export const CAUCE = suave(BIAN.pts, BIAN.anchos);
/* la distancia a la orilla: negativa adentro del cauce (el puente no cuenta aquí) */
export function distBian(x, y) {
  const P = CAUCE.pts, A = CAUCE.anchos; let d = 1e9;
  for (let i = 0; i < P.length - 1; i++) {
    const ax = P[i][0], ay = P[i][1], vx = P[i + 1][0] - ax, vy = P[i + 1][1] - ay, L = vx * vx + vy * vy;
    const t = L ? Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / L)) : 0;
    d = Math.min(d, Math.hypot(x - ax - vx * t, y - ay - vy * t) - (A[i] + (A[i + 1] - A[i]) * t) / 2);
  }
  return d;
}
export const HEROE = { x: 5.7, y: 5.9 };
export const PAGODA = { x0: 3.4, x1: 8.0, y0: 4.0, y1: 7.8 };
export const PUENTE = { x: 10.0, y: 10.4, nx: 0.461, ny: 0.887, largo: 3.6, ancho: 0.5 };
export const MURALLA = { y: 2.8, x0: 2.0, x1: 18.0, grosor: 0.5 };
export const PUERTA = { x: 12.5, y: 2.8, x0: 11.3, x1: 13.7 };
export const CASA_TE = { x: 14.49, y: 6.19 };
export const EXPLANADA = [[9.6, 13.2], [14.4, 11.0], [17.6, 9.8], [17.6, 17.6], [8.0, 17.6]];
export const PREFECTURA = { x: 16.6, y: 11.0 };
export const IMPRESOS = { x: 13.4, y: 12.6 };
export const HUYUAN = { x: 16.2, y: 14.3 };
export const ANONIMO = { x: 12.7, y: 15.6 };
export const ACADEMIA = { x: 9.2, y: 15.4 };
export const PALACIO = { x: 15.3, y: 17.0 };
export const HORNO_TINTA = { x: 9.3, y: 4.4 };
export const ESPERA_ZHUXI = { x: 12.3, y: 4.2 };
export const LUGAR_ZHUXI = { x: 10.3, y: 15.9 };
export const TEMPLO_TAO = { x: 2.9, y: 17.1 };
export const HOGARES = [[10.4, 4.95], [14.6, 4.85], [16.35, 4.6], [14.68, 6.54]];
export const enPuente = (x, y) => {
  const dx = x - PUENTE.x, dy = y - PUENTE.y, a = dx * PUENTE.nx + dy * PUENTE.ny, b = -dx * PUENTE.ny + dy * PUENTE.nx;
  return Math.abs(a) < PUENTE.largo / 2 && Math.abs(b) < PUENTE.ancho / 2;
};
export const enBian = (x, y) => distBian(x, y) < 0 && !enPuente(x, y);
export const enAgua = (x, y, m = 0) => distBian(x, y) < m && !enPuente(x, y);
export const enPagoda = (x, y, m = 0) => x > PAGODA.x0 - m && x < PAGODA.x1 + m && y > PAGODA.y0 - m && y < PAGODA.y1 + m;
export const enMuralla = (x, y, m = 0) => Math.abs(y - MURALLA.y) < MURALLA.grosor / 2 + m && !(x > PUERTA.x0 && x < PUERTA.x1);
export function enExplanada(x, y) {
  let c = false; const P = EXPLANADA;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; }
  return c;
}
/* el eje del Bian, recorrido de punta a punta (río abajo): el punto a la distancia u, su ancho y su rumbo */
const LARGOS = CAUCE.pts.reduce((a, p, i) => { a.push(i ? a[i - 1] + Math.hypot(p[0] - CAUCE.pts[i - 1][0], p[1] - CAUCE.pts[i - 1][1]) : 0); return a; }, []);
export const LARGO_BIAN = LARGOS[LARGOS.length - 1];
export function enEje(u) {
  const P = CAUCE.pts, A = CAUCE.anchos; let i = 1;
  while (i < LARGOS.length - 1 && LARGOS[i] < u) i++;
  const k = (u - LARGOS[i - 1]) / (LARGOS[i] - LARGOS[i - 1] || 1), dx = P[i][0] - P[i - 1][0], dz = P[i][1] - P[i - 1][1], l = Math.hypot(dx, dz) || 1;
  return { x: P[i - 1][0] + dx * k, z: P[i - 1][1] + dz * k, ancho: A[i - 1] + (A[i] - A[i - 1]) * k, tx: dx / l, tz: dz / l };
}
/* lo que el eje lleva recorrido al pasar más cerca de (x, z) */
export function uDe(x, z) {
  const P = CAUCE.pts; let best = 1e9, u = 0;
  for (let i = 0; i < P.length - 1; i++) {
    const ax = P[i][0], az = P[i][1], vx = P[i + 1][0] - ax, vz = P[i + 1][1] - az, L = vx * vx + vz * vz;
    const t = L ? Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L)) : 0, d = Math.hypot(x - ax - vx * t, z - az - vz * t);
    if (d < best) { best = d; u = LARGOS[i] + t * (LARGOS[i + 1] - LARGOS[i]); }
  }
  return u;
}

/* el espejo: ¿coincide con el motor? (solo en el juego, donde el motor existe) */
export function verificarEspejo() {
  if (typeof BIAN_CH === 'undefined') return;
  const pares = [[HEROE, HEROE_CH], [PUENTE, PUENTE_CH], [PUERTA, PUERTA_CH], [CASA_TE, CASA_TE_CH], [PREFECTURA, PREFECTURA_CH], [IMPRESOS, IMPRESOS_CH], [HUYUAN, HUYUAN_CH],
    [ANONIMO, ANONIMO_CH], [ACADEMIA, ACADEMIA_CH], [PALACIO, PALACIO_CH], [HORNO_TINTA, HORNO_TINTA_CH], [ESPERA_ZHUXI, ESPERA_ZHUXI_CH], [LUGAR_ZHUXI, LUGAR_ZHUXI_CH], [TEMPLO_TAO, TEMPLO_TAO_CH]];
  for (const [a, b] of pares) if (Math.abs(a.x - b.x) > 1e-6 || Math.abs(a.y - b.y) > 1e-6) console.warn('kaifeng/lugares no coincide con 09j-kaifeng', a, b);
  const igual = (u, v) => JSON.stringify(u) === JSON.stringify(v);
  if (!igual(BIAN, BIAN_CH) || !igual(PAGODA, PAGODA_CH) || !igual(PUENTE, PUENTE_CH) || !igual(MURALLA, MURALLA_CH) || !igual(PUERTA, PUERTA_CH) || !igual(EXPLANADA, EXPLANADA_CH) || !igual(HOGARES, HOGARES_CH))
    console.warn('el Bian, la pagoda, el puente, la muralla, la explanada o las casas de kaifeng/lugares no coinciden con 09j-kaifeng');
}
