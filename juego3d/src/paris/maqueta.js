/* ============================================================
   paris/maqueta
   Las tres composiciones del tablero de París para la hoja de bocetos (juego3d/bocetos/paris.html): el tablero entero de
   16 × 16 (x, z de 2 a 18; la cámara mira desde +x +z, así que el fondo es la esquina de x + z chicas) con las piezas
   REALES a su escala: la catedral, el Sena con su orilla, la Montaña de Santa Genoveva con sus viñas, las casas (pocas),
   los bosquecillos, la muralla de Felipe Augusto y los seis saberes en la mitad del frente, donde se juega.
   - 'orilla': la geografía de verdad (el norte atrás a la izquierda): el Sena por el borde del fondo izquierdo, la Cité con
     la catedral que muestra su fachada del poniente y su flanco sur, toda la orilla izquierda para las escuelas, la Montaña
     al medio a la derecha y San Víctor en la esquina, afuera de la muralla.
   - 'hoy': la orientación de la época tal como está (el Sena corre por el fondo derecho y la fachada mira a +x, en espejo):
     lo que menos mueve el motor. La Montaña en la esquina de la izquierda, San Víctor a la derecha.
   - 'orillas': las dos orillas: el Sena más adentro, con la orilla de los mercaderes al fondo (el muelle, el Grand-Pont con
     sus cambistas, el Châtelet) y la Cité entera con su catedral (la variante «en su isla»); la Montaña a la derecha.
   Las anclas de cada una son las que tendría el motor (juego/src/09f-paris.js y su espejo lugares.js): la hoja las lista.
   ============================================================ */
import * as THREE from 'three';
import { azar, PAL } from '../kit.js';
import { crearPersona } from '../actores.js';
import { conActores } from '../piezas.js';
import * as M from './monumentos.js';
import * as PZ from './piezas.js';

const E0 = 2, E1 = 18, LADO = E1 - E0, CENTRO = 10, NIVEL = -0.08;
const ss = k => k * k * (3 - 2 * k);
const { ND } = M;

/* ---------- las tres composiciones ---------- */
export const TABLEROS = {
  orilla: {
    rio: { eje: 'x', a: 1.4, b: 6.6 },
    isla: { x: 4.2, z: 8.1, rx: 1.4, rz: 5.6 },
    lomas: [{ x: 12.5, z: 6.6, rx: 3.3, rz: 3.0, h: 0.78, cima: true }],
    heroe: { v: 'completa', x: 4.2, z: 6.05 },
    segunda: { v: 'sanvictor', x: 15.75, z: 3.6, espejo: true },
    muralla: [[6.65, 16.1], [13.9, 16.1], [13.9, 4.95], [6.65, 4.95]], cerrada: false,
    puertas: [[13.9, 10.6], [12.9, 4.95], [10.15, 16.1]], torresGrandes: [[6.65, 16.1], [6.65, 4.95]],
    calles: [[[6.7, 10.6], [18, 10.6], 0.36], [[10.15, 10.7], [10.15, 16.4], 0.24]],
    prado: [6.8, 12.6, 16.45, 17.9], campos: [[14.3, 17.9, 8.2, 17.9, 'x'], [7.2, 13.6, 2.2, 4.6, 'z']],
    anclas: { pergamino: [7.6, 14.1], universidad: [9.05, 12.75], sorbona: [11.75, 13.75], disputatio: [10.8, 9.7], campana: [15.1, 6.75], scriptorium: [16.5, 8.2] },
    casas: [
      ['e', 3.55, 10.75, 0, { w: 0.4, pisos: 2, yeso: ND.ocre, estilo: 'cruces' }], ['p', 4.75, 10.9, 0, { w: 0.5, pisos: 1, vanos: 'gotica', alero: true }],
      ['e', 3.7, 12.2, 0, { w: 0.42, pisos: 1, yeso: ND.revoque, estilo: 'postes', techo: 'pizarra' }], ['e', 4.7, 12.35, 0, { w: 0.38, pisos: 2, yeso: ND.rosa, estilo: 'riostras' }],
      ['e', 7.95, 9.9, 0, { w: 0.4, pisos: 2, yeso: ND.revoque, letrero: '#b03a2c' }], ['e', 8.5, 9.95, 0, { w: 0.44, pisos: 1, yeso: ND.ocre, estilo: 'postes', techo: 'pizarra' }], ['e', 9.05, 9.9, 0, { w: 0.38, pisos: 3, yeso: ND.blanco, estilo: 'riostras', letrero: '#3a5cb0' }],
      ['e', 7.4, 11.55, Math.PI / 2, { w: 0.4, pisos: 2, yeso: ND.rosa }], ['p', 12.95, 12.35, 0, { w: 0.48, pisos: 2, vanos: 'romana', torre: true }], ['p', 10.9, 15.2, 0, { w: 0.5, pisos: 1, vanos: 'gotica', alero: true }], ['e', 9.5, 11.45, Math.PI / 2, { w: 0.46, pisos: 2, yeso: '#ecd9a8', estilo: 'postes', alero: true, tienda: false }],
      ['a', 15.0, 11.55, 0, { w: 0.5 }], ['a', 15.75, 12.75, -0.2, { w: 0.42, dos: true, techo: 'teja', cal: ND.ocre }], ['a', 16.7, 15.6, 0.3, { w: 0.6, cobertizo: true }],
    ],
    arboles: [[6.95, 3.4, 0.45, 3, 'sauce'], [6.9, 7.2, 0.55, 3, 'alamo'], [6.95, 15.05, 0.35, 2, 'sauce'], [7.8, 17.2, 0.6, 4, 'olmo'], [11.7, 17.3, 0.5, 3, 'olmo'], [4.1, 2.8, 0.4, 3, 'olmo'], [11.2, 12.2, 0.3, 2, 'frutal'], [8.3, 13.0, 0.25, 1, 'olmo'],
      [10.1, 3.9, 0.45, 3, 'olmo'], [15.0, 9.4, 0.4, 2, 'olmo'], [16.9, 13.4, 0.7, 3, 'frutal'], [17.3, 9.6, 0.4, 2, 'olmo'], [10.0, 14.6, 0.35, 3, 'frutal'], [12.6, 15.4, 0.35, 2, 'olmo']],
    huertos: [[8.1, 15.2, 0.7, 0.45], [16.2, 11.0, 0.6, 0.4]],
    puentes: [{ x: 6.06, z: 10.6, largo: 1.25, eje: 'x', casas: 2 }],
    chatelets: [[7.1, 10.05, 0]],
    barcas: [[3.0, 15.2, Math.PI / 2, 'toneles'], [6.05, 3.9, Math.PI / 2, 'piedra'], [6.05, 15.9, Math.PI / 2, 'heno'], [2.35, 6.4, Math.PI / 2, 'pieles']],
    gente: [[9.7, 11.25, 'narrar', 0, 'MAESTRO'], [9.45, 11.7, 'suelo', 0, 1], [9.95, 11.75, 'suelo', 0, 2], [9.7, 12.0, 'suelo', 0, 3], [9.25, 12.05, 'suelo', 0, 4], [10.2, 12.1, 'suelo', 0, 0],
      [8.6, 17.0, 'andar', 0.7, 5], [9.3, 17.2, 'andar', -2, 6], [10.0, 16.95, 'andar', 2.4, 7], [8.0, 10.6, 'andar', 1.57, 8], [12.4, 10.6, 'andar', -1.57, 9]],
  },
  hoy: {
    rio: { eje: 'z', a: 1.4, b: 6.6 },
    isla: { x: 8.1, z: 4.2, rx: 5.6, rz: 1.4 },
    lomas: [{ x: 4.35, z: 15.2, rx: 2.5, rz: 2.4, h: 0.78, cima: true }],
    heroe: { v: 'completa', x: 6.05, z: 4.2, espejo: true },
    segunda: { v: 'sanvictor', x: 15.3, z: 14.75, espejo: false },
    muralla: [[1.9, 16.4], [12.25, 16.4], [12.25, 6.75]], cerrada: false,
    puertas: [[9.55, 16.4], [12.25, 12.1]], torresGrandes: [[12.25, 6.75]],
    calles: [[[9.55, 6.7], [9.55, 18], 0.36], [[7.0, 11.0], [12.1, 11.0], 0.24]],
    prado: [2.3, 5.4, 9.5, 12.3], campos: [[12.5, 17.9, 16.65, 17.9, 'z'], [7.4, 12.1, 16.7, 17.9, 'z'], [13.4, 17.9, 6.6, 9.6, 'x']],
    anclas: { pergamino: [14.6, 7.8], universidad: [10.7, 12.9], sorbona: [8.6, 13.6], disputatio: [6.4, 13.1], campana: [12.95, 11.0], scriptorium: [16.1, 11.7] },
    casas: [
      ['e', 10.75, 3.5, 0, { w: 0.4, pisos: 2, yeso: ND.ocre }], ['p', 11.6, 3.55, 0, { w: 0.5, pisos: 1, vanos: 'gotica', alero: true }], ['e', 12.55, 3.6, 0, { w: 0.42, pisos: 1, yeso: ND.revoque, estilo: 'postes', techo: 'pizarra' }], ['e', 11.3, 4.85, 0, { w: 0.38, pisos: 2, yeso: ND.rosa, estilo: 'riostras' }],
      ['e', 8.75, 7.4, Math.PI / 2, { w: 0.4, pisos: 2, yeso: ND.revoque, letrero: '#b03a2c' }], ['e', 8.72, 7.96, Math.PI / 2, { w: 0.44, pisos: 1, yeso: ND.ocre, estilo: 'postes', techo: 'pizarra' }], ['e', 8.76, 8.5, Math.PI / 2, { w: 0.38, pisos: 3, yeso: ND.blanco, estilo: 'riostras' }],
      ['e', 10.3, 7.45, 0, { w: 0.4, pisos: 2, yeso: ND.rosa, letrero: '#3a5cb0' }], ['p', 7.4, 12.25, 0, { w: 0.48, pisos: 2, vanos: 'romana', torre: true }], ['p', 11.9, 14.6, 0, { w: 0.5, pisos: 1, vanos: 'gotica', alero: true }],
      ['a', 13.3, 17.05, 0, { w: 0.5 }], ['a', 14.25, 17.25, -0.2, { w: 0.42, dos: true, techo: 'teja', cal: ND.ocre }], ['a', 16.9, 9.0, 0.3, { w: 0.6, cobertizo: true }],
      ['p', 5.2, 8.1, 0, { w: 0.5, pisos: 2, vanos: 'gotica', alero: false }], ['e', 6.1, 8.2, 0, { w: 0.4, pisos: 2, yeso: ND.ocre, estilo: 'cruces', alero: true }],
    ],
    arboles: [[4.2, 8.6, 0.35, 2, 'frutal'], [3.3, 6.95, 0.5, 3, 'sauce'], [7.3, 6.95, 0.5, 3, 'alamo'], [15.6, 6.9, 0.35, 2, 'sauce'], [3.0, 10.4, 0.6, 4, 'olmo'], [4.8, 11.6, 0.45, 3, 'olmo'], [2.9, 4.1, 0.4, 3, 'olmo'], [11.4, 13.9, 0.3, 2, 'frutal'], [7.6, 10.4, 0.25, 1, 'olmo'],
      [6.9, 15.9, 0.4, 2, 'olmo'], [13.5, 9.2, 0.4, 2, 'olmo'], [17.2, 13.3, 0.6, 3, 'frutal'], [16.9, 16.9, 0.45, 2, 'olmo'], [11.6, 9.0, 0.35, 3, 'frutal'], [8.2, 15.3, 0.35, 2, 'olmo']],
    huertos: [[10.9, 9.1, 0.7, 0.45], [7.6, 9.6, 0.6, 0.4]],
    puentes: [{ x: 9.55, z: 6.06, largo: 1.25, eje: 'z', casas: 2 }],
    chatelets: [[9.55, 7.1, 0]],
    barcas: [[3.6, 3.0, 0, 'toneles'], [14.8, 6.05, 0, 'piedra'], [15.6, 6.1, 0, 'heno'], [6.4, 2.35, 0, 'pieles']],
    gente: [[9.95, 10.75, 'narrar', 0, 'MAESTRO'], [9.7, 11.4, 'suelo', 0, 1], [10.25, 11.45, 'suelo', 0, 2], [9.95, 11.75, 'suelo', 0, 3], [10.5, 11.8, 'suelo', 0, 4], [9.4, 11.8, 'suelo', 0, 0],
      [3.4, 11.0, 'andar', 0.7, 5], [3.9, 11.6, 'andar', -2, 6], [4.4, 11.0, 'andar', 2.4, 7], [9.55, 8.9, 'andar', 0, 8], [9.55, 14.6, 'andar', 3.1, 9]],
  },
  orillas: {
    rio: { eje: 'x', a: 3.6, b: 9.4 },
    isla: null,
    lomas: [{ x: 14.3, z: 7.1, rx: 3.1, rz: 2.8, h: 0.78, cima: true }],
    heroe: { v: 'isla', x: 6.2, z: 7.6 },
    segunda: null,
    muralla: [[9.45, 16.6], [16.9, 16.6], [16.9, 4.4], [9.45, 4.4]], cerrada: false,
    puertas: [[16.9, 11.35], [12.9, 4.4]], torresGrandes: [[9.45, 16.6], [9.45, 4.4]],
    calles: [[[9.45, 11.35], [18, 11.35], 0.34], [[3.05, 2.0], [3.05, 18], 0.26], [[11.6, 11.45], [11.6, 16.5], 0.22]],
    prado: [9.6, 14.2, 16.9, 17.9], campos: [[17.15, 17.95, 4.4, 17.9, 'z'], [10.2, 17.9, 2.2, 4.15, 'z']],
    anclas: { pergamino: [10.15, 15.0], universidad: [10.95, 12.95], sorbona: [13.3, 14.15], disputatio: [11.55, 9.7], campana: [15.4, 12.6], scriptorium: [15.85, 14.9] },
    casas: [
      ['e', 2.55, 3.4, Math.PI / 2, { w: 0.42, pisos: 2, yeso: ND.ocre, letrero: '#b03a2c' }], ['e', 2.55, 4.0, Math.PI / 2, { w: 0.4, pisos: 1, yeso: ND.revoque, estilo: 'postes', techo: 'pizarra' }], ['e', 2.55, 5.55, Math.PI / 2, { w: 0.44, pisos: 2, yeso: ND.rosa, estilo: 'riostras' }],
      ['p', 2.6, 12.0, Math.PI / 2, { w: 0.5, pisos: 2, vanos: 'romana', alero: true }], ['e', 2.55, 13.4, Math.PI / 2, { w: 0.4, pisos: 2, yeso: ND.blanco }], ['e', 2.55, 14.0, Math.PI / 2, { w: 0.38, pisos: 1, yeso: ND.ocre, estilo: 'postes' }],
      ['e', 10.0, 10.3, 0, { w: 0.4, pisos: 2, yeso: ND.revoque, letrero: '#3a5cb0' }], ['e', 10.55, 10.38, 0, { w: 0.42, pisos: 1, yeso: ND.ocre, estilo: 'postes', techo: 'pizarra' }],
      ['p', 14.4, 13.1, 0, { w: 0.48, pisos: 2, vanos: 'romana', torre: true }], ['p', 12.3, 15.6, 0, { w: 0.5, pisos: 1, vanos: 'gotica', alero: true }],
      ['a', 12.0, 3.0, 0, { w: 0.5 }], ['a', 15.6, 2.9, -0.2, { w: 0.42, dos: true, techo: 'teja', cal: ND.ocre }], ['a', 17.5, 13.0, Math.PI / 2, { w: 0.5, cobertizo: false }],
    ],
    arboles: [[2.5, 7.4, 0.35, 2, 'alamo'], [2.5, 16.6, 0.45, 3, 'olmo'], [9.75, 5.2, 0.35, 2, 'sauce'], [9.8, 16.0, 0.35, 2, 'sauce'], [10.6, 17.3, 0.5, 3, 'olmo'], [13.6, 17.4, 0.45, 3, 'olmo'],
      [11.1, 5.6, 0.45, 3, 'olmo'], [16.2, 10.2, 0.35, 2, 'olmo'], [17.5, 6.5, 0.4, 2, 'frutal'], [14.3, 3.3, 0.5, 3, 'frutal'], [12.9, 12.4, 0.3, 2, 'frutal']],
    huertos: [[12.0, 14.3, 0.6, 0.4], [16.4, 3.3, 0.6, 0.35]],
    puentes: [{ x: 3.95, z: 9.6, largo: 0.85, eje: 'x', casas: 1 }],
    chatelets: [[2.75, 9.6, Math.PI / 2]],
    barcas: [[4.0, 3.2, Math.PI / 2, 'toneles'], [9.0, 4.2, Math.PI / 2, 'piedra'], [3.95, 14.6, Math.PI / 2, 'heno'], [9.1, 15.8, Math.PI / 2, 'pieles']],
    gente: [[11.1, 11.95, 'narrar', 0, 'MAESTRO'], [10.85, 12.35, 'suelo', Math.PI, 1], [11.35, 12.4, 'suelo', Math.PI, 2], [12.1, 12.1, 'suelo', -1.57, 3],
      [10.6, 17.35, 'andar', 0.7, 5], [11.3, 17.5, 'andar', -2, 6], [12.0, 17.3, 'andar', 2.4, 7], [13.0, 11.35, 'andar', 1.57, 8], [3.05, 8.0, 'andar', 0, 9]],
  },
};

/* ---------- el terreno ---------- */
const enRio = (T, x, z) => { const u = T.rio.eje === 'x' ? x : z; return u > T.rio.a && u < T.rio.b; };
const islaE = (I, x, z) => Math.pow(Math.pow(Math.abs(x - I.x) / I.rx, 4) + Math.pow(Math.abs(z - I.z) / I.rz, 4), 0.25);   // < 1 adentro (un rectángulo de esquinas redondas)
export function altura(T, x, z) {
  if (enRio(T, x, z)) {
    const u = T.rio.eje === 'x' ? x : z, I = T.isla;
    let d = Math.min(T.rio.a <= E0 ? 9 : u - T.rio.a, T.rio.b >= E1 ? 9 : T.rio.b - u);
    if (I) { const e = islaE(I, x, z), m = Math.min(I.rx, I.rz); if (e < 1) return e > 0.92 ? -0.06 * (e - 0.92) / 0.08 : 0.0; d = Math.min(d, (e - 1) * m); }
    return -0.04 - 0.3 * ss(Math.min(1, d / 0.38));
  }
  let h = 0;
  for (const L of T.lomas) { const d = Math.hypot((x - L.x) / L.rx, (z - L.z) / L.rz); if (d < 1) h = Math.max(h, L.h * ss(Math.min(1, (1 - d) / 0.62))); }
  return h;
}
const enRect = (r, x, z, m = 0) => x > r[0] - m && x < r[1] + m && z > r[2] - m && z < r[3] + m;
function enCalle(T, x, z, m = 0) {
  return T.calles.some(([a, b, w]) => { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz, u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L2)); return Math.hypot(x - a[0] - u * dx, z - a[1] - u * dz) < w / 2 + m; });
}
/* dentro de la muralla: el lado del tablero que ella encierra con el río (una prueba de polígono con el borde del agua) */
function adentro(T, x, z) {
  const P = T.muralla, cerrar = T.rio.eje === 'x' ? [[T.rio.b, P[P.length - 1][1]], [T.rio.b, P[0][1]]] : [[P[P.length - 1][0], T.rio.b], [P[0][0], T.rio.b]];
  const Q = P.concat(cerrar);
  let c = false; for (let i = 0, j = Q.length - 1; i < Q.length; j = i++) { const [xi, zi] = Q[i], [xj, zj] = Q[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; }
  return c;
}
function colorSuelo(T, x, z, h, c, c2) {
  const tab = Math.abs(Math.floor(x * 2) * 7 + Math.floor(z * 2) * 13) % 5;
  if (h < -0.025) { c.set('#d8c79c').lerp(c2.set('#9a8a66'), Math.min(1, (-h - 0.025) / 0.12)); return; }   // la playa y el lecho
  if (T.isla && islaE(T.isla, x, z) < 1) { c.set(['#e3d6b6', '#ddd0ae', '#e6dabb', '#d9cca8', '#e0d3b2'][tab]); return; }   // la Cité
  const orilla = (() => { for (const [dx, dz] of [[0.3, 0], [-0.3, 0], [0, 0.3], [0, -0.3]]) if (enRio(T, x + dx, z + dz) && altura(T, x + dx, z + dz) < -0.03) return true; return false; })();
  if (enCalle(T, x, z)) { c.set(((Math.floor(x * 4) + Math.floor(z * 4)) & 1) ? '#c4ad84' : '#bba47a'); return; }   // el empedrado de la calle
  for (const L of T.lomas) { const d = Math.hypot((x - L.x) / L.rx, (z - L.z) / L.rz); if (d < 0.97) {   // las viñas de la Montaña, en hileras; arriba, el prado de la abadía
    if (d < 0.32) { c.set(['#a6c466', '#9fbe60'][tab & 1]); return; }
    c.set((Math.floor(z * 7.5) & 1) ? '#93ad56' : '#b9a068'); return; } }
  if (T.prado && enRect(T.prado, x, z)) { c.set(['#a8c66c', '#a1c064', '#aecb72', '#9cbb60', '#a5c369'][tab]); return; }
  for (const r of T.campos) if (enRect(r, x, z)) { const k = Math.floor((r[4] === 'x' ? x : z) * 1.25) % 4; c.set(['#d9c46e', '#a9c463', '#c7a56a', '#bccf72'][k]).lerp(c2.set('#ffffff'), tab * 0.012); return; }
  if (orilla) { c.set('#c9c08a'); return; }
  if (T.rio.a > E0 + 0.5 && (T.rio.eje === 'x' ? x : z) < T.rio.a) { c.set(['#e2d4ae', '#ddcfa8', '#e6d8b4', '#d9cba4', '#dfd1ab'][tab]); return; }   // la orilla de los mercaderes
  if (adentro(T, x, z)) { c.set(['#e2d4ae', '#ddcfa8', '#e6d8b4', '#d9cba4', '#dfd1ab'][tab]); return; }   // la tierra de la ciudad, clara
  c.set(['#b4cd7a', '#aac672', '#bad180', '#a6c26e', '#b0ca76'][tab]);                                          // el campo de afuera
}
function suelo(K, T) {
  const RES = 4, N = LADO * RES, s = 1 / RES, pos = [], cen = [], hondo = [];
  const tri = (a, b, d) => { for (const q of [a, b, d]) pos.push(q[0], q[1], q[2]); hondo.push((a[1] + b[1] + d[1]) / 3); cen.push((a[0] + b[0] + d[0]) / 3, (a[2] + b[2] + d[2]) / 3); };
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s, v = (x, z) => [x, altura(T, x, z), z];
    tri(v(x0, z0), v(x0, z1), v(x1, z0)); tri(v(x1, z0), v(x0, z1), v(x1, z1));
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const col = new Float32Array(pos.length), c = new THREE.Color(), c2 = new THREE.Color();
  for (let t = 0; t < hondo.length; t++) { colorSuelo(T, cen[2 * t], cen[2 * t + 1], hondo[t], c, c2); for (let k = 0; k < 3; k++) col.set([c.r, c.g, c.b], t * 9 + k * 3); }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals(); geo.userData.propia = true;
  return K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false });
}
function agua(K, T) {
  const RES = 4, s = 1 / RES, pos = [], prof = [];
  for (let i = 0; i < LADO * RES; i++) for (let j = 0; j < LADO * RES; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s, hs = [altura(T, x0, z0), altura(T, x1, z0), altura(T, x0, z1), altura(T, x1, z1)];
    if (Math.min(...hs) > NIVEL - 0.004) continue;
    for (const [x, z, h] of [[x0, z0, hs[0]], [x0, z1, hs[2]], [x1, z0, hs[1]], [x1, z0, hs[1]], [x0, z1, hs[2]], [x1, z1, hs[3]]]) { pos.push(x, NIVEL, z); prof.push(h); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const col = new Float32Array(pos.length), c = new THREE.Color(), c2 = new THREE.Color();
  for (let i = 0; i < prof.length; i++) { const k = Math.min(1, Math.max(0, (NIVEL - prof[i]) / 0.24)); if (k < 0.3) c.set('#bcd9d6').lerp(c2.set('#93c2cc'), k / 0.3); else c.set('#93c2cc').lerp(c2.set('#6aa3bc'), (k - 0.3) / 0.7); col.set([c.r, c.g, c.b], i * 3); }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals(); geo.userData.propia = true;
  const m = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, transparent: true, opacity: 0.93 })); m.receiveShadow = true;
  const g = new THREE.Group(); g.add(m);
  const onda = new THREE.PlaneGeometry(0.42, 0.026); onda.userData.propia = true; const mo = new THREE.MeshBasicMaterial({ color: '#f2f8f6', transparent: true, opacity: 0.4, depthWrite: false }), r = azar(808);
  for (let k = 0, n = 0; k < 400 && n < 34; k++) { const x = E0 + r() * LADO, z = E0 + r() * LADO; if (altura(T, x, z) > -0.25) continue; const o = new THREE.Mesh(onda, mo); o.rotation.x = -Math.PI / 2; if (T.rio.eje === 'x') o.rotation.z = Math.PI / 2; o.position.set(x, NIVEL + 0.004, z); g.add(o); n++; }
  return g;
}
/* la losa del diorama: el corte de tierra, con el río asomando por donde lo corta */
function losa(K, T) {
  const g = new THREE.Group();
  const pared = (fijo, eje) => {
    const pos = [], col = [], c = new THREE.Color(), paso = 0.125;
    const quad = (p0, p1, p2, p3, color) => { c.set(color); for (const p of [p0, p1, p2, p0, p2, p3]) { pos.push(...p); col.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, P = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const h0 = altura(T, eje === 'x' ? fijo : u, eje === 'x' ? u : fijo), h1 = altura(T, eje === 'x' ? fijo : u1, eje === 'x' ? u1 : fijo);
      quad(P(u, h0), P(u1, h1), P(u1, Math.min(h1, 0) - 0.1), P(u, Math.min(h0, 0) - 0.1), h0 < -0.03 ? '#7a6e52' : '#cdbd94');
      quad(P(u, Math.min(h0, 0) - 0.1), P(u1, Math.min(h1, 0) - 0.1), P(u1, -0.46), P(u, -0.46), PAL.corte1);
      quad(P(u, -0.46), P(u1, -0.46), P(u1, -1.05), P(u, -1.05), PAL.corte2);
      if (h0 < NIVEL || h1 < NIVEL) quad(P(u, NIVEL), P(u1, NIVEL), P(u1, Math.min(NIVEL, h1)), P(u, Math.min(NIVEL, h0)), '#5f93a8');
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals(); geo.userData.propia = true;
    return new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide }));
  };
  g.add(pared(E1, 'x'), pared(E1, 'z'));
  const caja = (w, h, d, x, y, z, color) => { const m = K.malla(K.caja(w, h, d), color, { grosor: 0.03, sombra: false, recibe: false }); m.position.set(x, y, z); g.add(m); };
  caja(LADO, 0.46, 0.06, CENTRO, -0.23, E0 + 0.03, PAL.corte1); caja(0.06, 0.46, LADO, E0 + 0.03, -0.23, CENTRO, PAL.corte1);
  caja(LADO - 0.02, 0.6, LADO - 0.02, CENTRO, -0.76, CENTRO, PAL.corte2);
  return g;
}

/* ---------- lo construido ---------- */
/* la muralla de Felipe Augusto (1190-1215): el lienzo almenado que sigue el terreno, las torres redondas cada ~70 m con su
   chapitel, las puertas de torres gemelas y las torres grandes sobre el río (la Tournelle y la torre de Nesle) */
export function muralla(K, T, alt) {
  const g = new THREE.Group(), H = 0.44, cal = '#dccfad', P = T.muralla, cerca = (x, z, r) => T.puertas.some(([px, pz]) => Math.hypot(px - x, pz - z) < r);
  const torre = (x, z, r, h, cono = true) => { const y = Math.max(0, alt(x, z)); const t = K.malla(K.cilindro(r, r * 1.08, h, 12), '#e2d5b4', { grosor: 0.003 }); t.position.set(x, y + h / 2, z); g.add(t); if (cono) { const c = K.malla(K.cono(r * 1.2, r * 2.0, 12), ND.pizarra, { grosor: 0.003 }); c.position.set(x, y + h + r, z); g.add(c); } pon2(g, K.malla(K.caja(0.014, 0.06, 0.012), ND.hueco, { sinTinta: true }), x + r * 0.72, y + h * 0.55, z + r * 0.72); };
  for (let i = 0; i < P.length - 1; i++) {
    const [ax, az] = P[i], [bx, bz] = P[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 0.45), ux = (bx - ax) / L, uz = (bz - az) / L, ang = -Math.atan2(bz - az, bx - ax);
    for (let k = 0; k < n; k++) {
      const u0 = k * L / n, u1 = (k + 1) * L / n, um = (u0 + u1) / 2, x = ax + ux * um, z = az + uz * um;
      if (cerca(x, z, 0.32)) continue;
      const y = Math.max(0, alt(x, z)), m = K.malla(K.caja(u1 - u0 + 0.01, H, 0.12), cal, { grosor: 0.003 }); m.position.set(x, y + H / 2 - 0.02, z); m.rotation.y = ang; g.add(m);
      for (let a = u0 + 0.05; a < u1; a += 0.11) { const mm = K.malla(K.caja(0.055, 0.05, 0.13), cal, { grosor: 0.0012 }); mm.position.set(ax + ux * a, y + H + 0.005, az + uz * a); mm.rotation.y = ang; g.add(mm); }
    }
    for (let u = 0; u <= L + 1e-6; u += L / Math.max(1, Math.round(L / 1.45))) { const x = ax + ux * u, z = az + uz * u; if (cerca(x, z, 0.4) || T.torresGrandes.some(([tx, tz]) => Math.hypot(tx - x, tz - z) < 0.3)) continue; torre(x, z, 0.13, 0.62); }
  }
  T.torresGrandes.forEach(([x, z]) => torre(x, z, 0.2, 0.86));
  T.puertas.forEach(([x, z]) => {                                                                                   // la puerta: dos torres y el arco con su cuerpo encima
    const seg = P.findIndex((p, i) => i < P.length - 1 && Math.abs((P[i + 1][0] - p[0]) * (z - p[1]) - (P[i + 1][1] - p[1]) * (x - p[0])) < 0.05), [ax, az] = P[Math.max(0, seg)], [bx, bz] = P[Math.max(0, seg) + 1];
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, y = Math.max(0, alt(x, z));
    [-1, 1].forEach(l => torre(x + ux * l * 0.24, z + uz * l * 0.24, 0.15, 0.74));
    const c = K.malla(K.caja(0.36, 0.22, 0.2), '#e2d5b4', { grosor: 0.003 }); c.position.set(x, y + 0.5, z); c.rotation.y = -Math.atan2(bz - az, bx - ax); g.add(c);
    const t = M.tejado(K, 0.24, 0.42, 0.14, { tipo: 'pizarra', piñon: '#e2d5b4', gr: 0.002 }); t.rotation.y = Math.PI / 2 - Math.atan2(bz - az, bx - ax); t.position.set(x, y + 0.61, z); g.add(t);
  });
  return g;
}
const pon2 = (g, m, x, y, z, ry = 0) => { m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
/* el puente de piedra con sus casas encima (el Petit-Pont, donde tuvo su escuela Adam du Petit-Pont; el Grand-Pont de los cambistas) */
export function puenteCasas(K, largo, casas = 2) {
  const g = new THREE.Group();
  pon2(g, K.malla(K.caja(largo, 0.07, 0.52), '#d9cba8', { grosor: 0.003 }), 0, 0.0, 0);
  for (let k = 0; k < 3; k++) pon2(g, K.malla(K.caja(0.12, 0.26, 0.56), '#d2c3a0', { grosor: 0.003 }), -largo / 2 + (k + 0.5) * largo / 3, -0.16, 0);
  [-1, 1].forEach(l => { for (let k = 0; k < casas; k++) { const c = M.casaEntramado(K, { w: Math.min(0.34, largo / casas - 0.06), d: 0.16, h1: 0.2, hp: 0.18, pisos: 1, vol: 0.02, yeso: [ND.revoque, ND.ocre, ND.rosa][k % 3], estilo: k % 2 ? 'postes' : 'cruces', tienda: true }); c.position.set(-largo / 2 + (k + 0.5) * largo / casas, 0.035, l * 0.18); c.rotation.y = l > 0 ? Math.PI : 0; g.add(c); } });
  return g;
}
/* el châtelet: la puerta fortificada que guarda la cabeza del puente */
export function chatelet(K) {
  const g = new THREE.Group();
  pon2(g, K.malla(K.caja(0.6, 0.4, 0.4), '#dccfad', { grosor: 0.003 }), 0, 0.2, 0);
  pon2(g, K.malla(K.caja(0.2, 0.24, 0.02), ND.hueco, { sinTinta: true }), 0, 0.12, 0.205);
  [-1, 1].forEach(l => { pon2(g, K.malla(K.cilindro(0.13, 0.14, 0.62, 12), '#e2d5b4', { grosor: 0.003 }), l * 0.3, 0.31, 0.12); pon2(g, K.malla(K.cono(0.16, 0.28, 12), ND.pizarra, { grosor: 0.003 }), l * 0.3, 0.76, 0.12); });
  for (let k = 0; k < 6; k++) pon2(g, K.malla(K.caja(0.05, 0.05, 0.05), '#dccfad', { grosor: 0.0012 }), -0.25 + k * 0.1, 0.42, 0.18);
  return g;
}
/* el que pone la pieza en espejo (la orientación de la época de hoy): gira -90° y refleja x, así la fachada mira a +x y el
   flanco sur a +z */
export function espejar(obj) { const w = new THREE.Group(); w.scale.x = -1; obj.rotation.y = -Math.PI / 2; w.add(obj); return w; }

/* ---------- LA MAQUETA ---------- */
export function maqueta(K, variante = 'orilla') {
  const T = TABLEROS[variante] || TABLEROS.orilla, g = new THREE.Group(), alt = (x, z) => altura(T, x, z), r = azar(1163);
  const ocupado = [];                                                                                               // donde ya hay algo (para que los árboles no caigan encima)
  const ocupa = (x, z, rr) => ocupado.push([x, z, rr]), libre = (x, z, m = 0) => !ocupado.some(([ox, oz, rr]) => Math.hypot(x - ox, z - oz) < rr + m);
  g.add(suelo(K, T), agua(K, T), losa(K, T));
  /* el héroe */
  const H = T.heroe, nd = M.catedral(K, H.v, 3), hw = H.espejo ? espejar(nd) : nd; hw.position.set(H.x, 0, H.z); g.add(hw); g.userData.heroe = hw;
  const ext = H.v === 'isla' ? [4.4, 3.6] : [2.9, 1.3]; ocupa(H.x, H.z, Math.max(...ext));
  /* la segunda pieza y lo alto de la Montaña */
  if (T.segunda) { const s = M.segunda(K, T.segunda.v), sw = T.segunda.espejo ? espejar(s) : s; sw.position.set(T.segunda.x, 0, T.segunda.z); g.add(sw); ocupa(T.segunda.x, T.segunda.z, 1.6); }
  for (const L of T.lomas) if (L.cima) { const c = M.genovevaCima(K), cx = L.x + 0.15, cz = L.z - 0.1; c.position.set(cx, alt(cx, cz) - 0.03, cz); if (T.rio.eje === 'x') c.rotation.y = -Math.PI / 2; g.add(c); ocupa(cx, cz, 0.95); }
  /* los seis saberes, a su etapa más alta, en sus anclas nuevas */
  const piezas = { pergamino: PZ.pergamino, campana: PZ.campana, scriptorium: PZ.scriptorium, disputatio: PZ.disputatio, universidad: PZ.universidad, sorbona: PZ.sorbona };
  const anim = [];
  for (const [id, [x, z]] of Object.entries(T.anclas)) { const P = conActores(true, () => piezas[id](K, 3)); P.obj.position.set(x, Math.max(0, alt(x, z)), z); g.add(P.obj); anim.push(P); ocupa(x, z, 0.75); }
  /* la muralla, los puentes y los châtelets */
  g.add(muralla(K, T, alt));
  T.puentes.forEach(p => { const b = puenteCasas(K, p.largo, p.casas); b.position.set(p.x, 0.0, p.z); if (p.eje === 'z') b.rotation.y = Math.PI / 2; g.add(b); });
  T.chatelets.forEach(([x, z, ry]) => { const c = chatelet(K); c.position.set(x, Math.max(0, alt(x, z)), z); c.rotation.y = ry; g.add(c); ocupa(x, z, 0.4); });
  /* las casas (pocas, de los tres idiomas, cada una distinta) */
  T.casas.forEach(([t, x, z, ry, o]) => { const c = t === 'p' ? M.casaPiedra(K, o) : t === 'a' ? M.casaArrabal(K, o) : M.casaEntramado(K, { h1: 0.26, hp: 0.22, ...o }); c.position.set(x, Math.max(0, alt(x, z)), z); c.rotation.y = ry; g.add(c); ocupa(x, z, 0.35); });
  /* los huertos y las cosas de afuera */
  T.huertos.forEach(([x, z, w, d]) => { const h = M.huerta(K, w, d); h.position.set(x, Math.max(0, alt(x, z)), z); g.add(h); const c = M.cerca(K, w + 0.1); c.position.set(x, Math.max(0, alt(x, z)), z + d / 2 + 0.05); g.add(c); ocupa(x, z, Math.max(w, d) / 2); });
  /* los bosquecillos: olmos, álamos y sauces de la orilla, frutales de los huertos */
  T.arboles.forEach(([x, z, rr, n, tipo], gi) => { for (let k = 0, puestos = 0; k < n * 12 && puestos < n; k++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * rr, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (alt(px, pz) < -0.02 || enCalle(T, px, pz, 0.12) || !libre(px, pz, 0.1)) continue; const t = M.arbolPa(K, tipo === 'mixto' ? (k % 2 ? 'olmo' : 'frutal') : tipo, (tipo === 'frutal' ? 1.35 : 1.1) * (0.85 + r() * 0.3), gi * 10 + k); t.position.set(px, Math.max(0, alt(px, pz)) - 0.01, pz); g.add(t); ocupa(px, pz, 0.12); puestos++; } });
  /* la mies de los campos de afuera, las cepas de las viñas */
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  const mies = []; for (const rc of T.campos) for (let x = rc[0] + 0.08; x < rc[1]; x += 0.15) for (let z = rc[2] + 0.08; z < rc[3]; z += 0.15) { const k = Math.floor((rc[4] === 'x' ? x : z) * 1.25) % 4; if ((k === 0 || k === 3) && libre(x, z, 0.05) && !enCalle(T, x, z, 0.05) && alt(x, z) > -0.01) mies.push([x, z, k]); }
  const mi = K.instancias(K.cono(0.035, 1, 4), '#c9b456', Math.max(1, mies.length), { sinTinta: true });
  mies.forEach(([x, z, k], i) => { const h = 0.1 + ((x * 13 + z * 7) % 1) * 0.05; q.setFromEuler(e.set(0, x * 3, 0)); m4.compose(v.set(x, h / 2 + alt(x, z), z), q, s.set(1, h, 1)); mi.setMatrixAt(i, m4); }); g.add(mi);
  const cep = []; for (const L of T.lomas) for (let z = L.z - L.rz; z < L.z + L.rz; z += 1 / 7.5) for (let x = L.x - L.rx; x < L.x + L.rx; x += 0.1) { const d = Math.hypot((x - L.x) / L.rx, (z - L.z) / L.rz), zz = (Math.floor(z * 7.5) + 0.5) / 7.5; if (d < 0.34 || d > 0.95 || !(Math.floor(z * 7.5) & 1) || !libre(x, zz, 0.05) || x < E0 + 0.1 || zz > E1 - 0.1 || zz < E0 + 0.1 || x > E1 - 0.1 || enCalle(T, x, zz, 0.05)) continue; cep.push([x, zz]); }
  const vi = K.instancias(K.esfera(1, 0.35), '#5f7f3a', Math.max(1, cep.length), { sinTinta: true });
  cep.forEach(([x, z], i) => { m4.compose(v.set(x, alt(x, z) + 0.03, z), q.identity(), s.set(0.035, 0.04, 0.03)); vi.setMatrixAt(i, m4); }); g.add(vi);
  /* las barcas del Sena */
  T.barcas.forEach(([x, z, ry, carga]) => { const b = M.barca(K, { carga, persona: true }); b.position.set(x, NIVEL + 0.01, z); b.rotation.y = ry; g.add(b); });
  /* la gente: el maestro de la calle de la paja con los suyos sentados en el suelo, la soule en el prado, los que caminan */
  const gente = [];
  T.gente.forEach(([x, z, pose, ry, i]) => { const p = crearPersona(K, i === 'MAESTRO' ? PZ.MAESTRO : PZ.estudiante(i)); p.obj.position.set(x, Math.max(0, alt(x, z)), z); p.obj.rotation.y = ry; p.anim(0, { pose, instantaneo: true }); g.add(p.obj); gente.push([p, pose]); });
  g.position.set(-CENTRO, 0, -CENTRO);                                                                              // el centro del tablero en el origen de la hoja
  g.userData.anim = (t, dt) => { anim.forEach(P => P.anim(t, dt)); gente.forEach(([p, pose]) => p.anim(t, { pose, dt })); };
  g.userData.anclas = T.anclas;
  return g;
}
