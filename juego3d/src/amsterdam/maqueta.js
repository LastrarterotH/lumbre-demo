/* ============================================================
   amsterdam/maqueta
   Las maquetas del tablero entero (16 × 16 baldosas, de x, z = 2 a 18; la cámara mira desde +x +z, así que el fondo es la
   esquina de x + z chicas) para la hoja juego3d/bocetos/amsterdam.html (el replanteo visual, 2026-10-04). Cada una con las
   piezas REALES a escala: el héroe (la casa consistorial de la opción recomendada, entera), la segunda pieza, UNA fila de
   casas por canal, el agua con sus muelles, el relieve (la muralla de tierra y el baluarte con su molino), los olmos en
   hileras y bosquecillos, los barcos del IJ, el suelo abierto y los seis saberes en sus anclas propuestas (las piezas del
   juego en su última etapa, con un anillo ámbar: ahí se juega).
   - 'anillo': la geometría de hoy (el centro del medio anillo en la orilla del IJ), en fragmento.
   - 'gradas': el centro del anillo en la esquina del fondo: los canales cruzan el tablero como gradas frente a la cámara.
   - 'puerto': el IJ ancho al fondo como el mar de Alejandría, canales rectos y el pólder de tulipanes al frente.
   Es para mirar y elegir: no lo usa el juego.
   ============================================================ */
import * as THREE from 'three';
import { azar, PAL } from '../kit.js';
import { crearPersona } from '../actores.js';
import * as MON from './monumentos.js';
import * as PZ from './piezas.js';

const E0 = 2, E1 = 18, LADO = E1 - E0, RES = 8, NIVEL = -0.07, HONDO = -0.24;
const deg = d => d * Math.PI / 180;
const ss = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
const pol = (c, r, a) => ({ x: c.x + r * Math.cos(a), z: c.z + r * Math.sin(a) });
const rotHacia = a => Math.atan2(Math.cos(a), Math.sin(a));   // el giro que lleva el +z local hacia el ángulo a (medido desde +x hacia +z)
function enPoligono(x, z, P) { let d = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, zi] = P[i], [xj, zj] = P[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) d = !d; } return d; }
/* el baluarte en el mundo: ¿(x, z) cae dentro de su planta agrandada f veces? */
function dentroBaluarte(b, x, z, f = 1) {
  const dx = x - b.x, dz = z - b.z, lx = dx * Math.cos(b.rot) - dz * Math.sin(b.rot), lz = dx * Math.sin(b.rot) + dz * Math.cos(b.rot);
  return enPoligono(lx / f, lz / f, MON.BALUARTE);
}
const COL = {
  calle: ['#dcc29e', '#d7bc97', '#e1c9a6'], muelle: ['#e8dabf', '#e2d3b6'], plaza: ['#eee6d3', '#e8dfcb'],
  jardin: ['#acd077', '#a8cd73', '#b0d27b'], muralla: ['#92bf5b', '#89b654'], polder: ['#a5d067', '#9ac65e', '#90bd56'],
  dique: ['#cfb68e', '#c8ae86'], tulipan: ['#e0383f', '#f3c43c', '#f6eff0', '#e56b9e'], acequia: '#6fb0cf',
};
const DEP = 0.75;   // el fondo de las casas en el tablero

/* las casas a lo largo de un canal en arco, en su orilla de adentro, mirando al agua (y a la cámara) */
function filaArco(c, R, a0, a1, estilos, semilla = 1, afuera = false) {   // afuera: en la orilla de afuera, mirando al centro
  const lista = MON.FILAS[estilos], out = [], rc = afuera ? R + 0.45 + 0.3 + DEP / 2 : R - 0.45 - 0.3 - DEP / 2, paso = a1 > a0 ? 1 : -1;
  let a = a0, i = semilla;
  while ((a1 - a) * paso > 0) {
    const op = lista[i % lista.length], da = (op.w + 0.03) / rc;
    const am = a + paso * da / 2; if ((a1 - am) * paso < 0) break;
    const p = pol(c, rc, am); out.push({ x: p.x, z: p.z, rot: rotHacia(am) + (afuera ? Math.PI : 0), op: { ...op, d: DEP, semilla: i } });
    a += paso * da; i++;
  }
  return out;
}
function filaRecta(x0, x1, z, rot, estilos, semilla = 1) {   // a lo largo de x, el frente a +z (rot 0) o girada
  const lista = MON.FILAS[estilos], out = []; let x = x0, i = semilla;
  while (x < x1) { const op = lista[i % lista.length]; if (x + op.w > x1) break; out.push({ x: x + op.w / 2, z, rot, op: { ...op, d: DEP, semilla: i } }); x += op.w + 0.03; i++; }
  return out;
}

/* ============================================================ LOS TRES PLANES ============================================================ */
function planAnillo() {
  const C = { x: 9.6, z: 4.0 }, R = [6.6, 8.9, 11.2], A = 0.45, MU = [12.5, 13.1], FO = [13.15, 13.75], IJ = 4.0;
  const r = (x, z) => Math.hypot(x - C.x, z - C.z), ang = (x, z) => Math.atan2(z - C.z, x - C.x);
  const bast = { ...pol(C, 13.0, deg(57)), rot: rotHacia(deg(57)) };
  const damrak = [13.05, 13.75, IJ - 0.1, 7.0];
  const heroe = { x: 8.9, z: 6.2, rot: 0 }, dam = [6.3, 12.95, 7.8, 9.35];
  const anclas = { tipos: pol(C, 7.75, deg(24)), prensa: pol(C, 7.75, deg(64)), cartilla: pol(C, 10.05, deg(86)), atlas: pol(C, 10.05, deg(44)), didactica: pol(C, 12.0, deg(98)), orbis: pol(C, 12.0, deg(72)) };
  const segunda = { ...pol(C, 9.8, deg(132)), rot: Math.PI };
  const puentes = [52, 93].map(deg);
  const filas = [filaArco(C, R[0], deg(141), deg(168), 'keyser', 1, true), filaArco(C, R[1], deg(97), deg(124), 'vingboons', 2), filaArco(C, R[2], deg(99), deg(118), 'pakhuis', 3)];
  return {
    C, R, A, IJ, bast, heroe, segunda, anclas, filas,
    canal: (x, z) => z > IJ && R.some(g => Math.abs(r(x, z) - g) < A),
    radial: (x, z) => z > IJ && r(x, z) < MU[0] && puentes.some(p => Math.abs(ang(x, z) - p) * r(x, z) < 0.22),
    agua(x, z) {
      if (z < IJ) return 2;
      if (x > damrak[0] && x < damrak[1] && z < damrak[3]) return 1;
      if (this.canal(x, z)) return 1;
      if (dentroBaluarte(bast, x, z, 1.0)) return 0;
      const rr = r(x, z);
      if ((rr > FO[0] && rr < FO[1]) || (dentroBaluarte(bast, x, z, 1.32) && rr > MU[1] - 0.1)) return 3;
      return 0;
    },
    muralla: (x, z) => { const rr = r(x, z); return z > IJ && rr > MU[0] && rr < MU[1] ? ss(1 - Math.abs(rr - (MU[0] + MU[1]) / 2) / ((MU[1] - MU[0]) / 2)) : 0; },
    fuera: (x, z) => r(x, z) > FO[1] - 0.05 && !dentroBaluarte(bast, x, z, 1.32),
    dam: (x, z) => x > dam[0] && x < dam[1] && z > dam[2] && z < dam[3],
    muelle(x, z) { const rr = r(x, z); return (z > IJ && z < IJ + 0.35) || (z > IJ && R.some(g => Math.abs(rr - g) < A + 0.3)) || (x > damrak[0] - 0.3 && x < damrak[1] + 0.3 && z < damrak[3] + 0.3); },
    tulipanes: (x, z) => z > 15.2,
    puentes: puentes.flatMap(p => [...R.map(g => ({ ...pol(C, g, p), rot: rotHacia(p), largo: 2 * A + 0.5 })), { ...pol(C, (FO[0] + FO[1]) / 2, p), rot: rotHacia(p), largo: FO[1] - FO[0] + 0.4 }]).filter(b => b.x > 2.4 && b.x < 17.6 && b.z < 17.6),
    quais: R.flatMap(g => [g - A - 0.17, g + A + 0.17]).map(rq => ({ c: C, r: rq })),
    barcos: [{ t: 'retour', x: 5.6, z: 2.95, rot: 0 }, { t: 'fluit', x: 11.2, z: 2.6, rot: Math.PI }, { t: 'boeier', x: 15.2, z: 3.35, rot: 0.3 }, { t: 'fluit', x: 16.9, z: 2.45, rot: 0 }, { t: 'boeier', x: 3.0, z: 3.5, rot: Math.PI }],
    bosques: [{ x: 3.4, z: 16.9, n: 6, s: 0.55 }, { x: 17.2, z: 17.3, n: 4, s: 0.45 }, { x: 5.2, z: 5.4, n: 5, s: 0.5 }, { x: 15.0, z: 4.75, n: 3, s: 0.4 }, { x: 15.17, z: 9.38, n: 4, s: 0.45 }, { x: 13.85, z: 13.11, n: 4, s: 0.45 }, { x: 4.53, z: 14.88, n: 4, s: 0.45 }],
    gente: [[9.2, 8.5, 0.4], [10.6, 8.9, -0.6], [7.4, 8.7, 0.9], [12.4, 9.6, 0.2], [14.6, 9.0, -0.4]],
    texto: 'anillo',
  };
}
function planGradas() {
  const C = { x: 2.0, z: 3.6 }, R = [9.3, 11.8, 14.3], A = 0.45, MU = [16.2, 16.8], FO = [16.85, 17.45], IJ = 3.6;
  const r = (x, z) => Math.hypot(x - C.x, z - C.z), ang = (x, z) => Math.atan2(z - C.z, x - C.x);
  const bast = { ...pol(C, 16.5, deg(45)), rot: rotHacia(deg(45)) };
  const damrak = [9.9, 10.6, IJ - 0.1, 7.6];
  const heroe = { x: 4.8, z: 5.95, rot: 0 }, dam = [2.3, 9.7, 7.62, 9.6];
  const anclas = { prensa: pol(C, 10.55, deg(40)), tipos: pol(C, 13.05, deg(40)), cartilla: pol(C, 13.05, deg(58)), orbis: pol(C, 13.05, deg(21)), atlas: pol(C, 15.25, deg(27)), didactica: pol(C, 15.25, deg(57)) };
  const segunda = { ...pol(C, 13.0, deg(7)), rot: Math.PI };   // la torre del Westerkerk entre el Keizersgracht y el Prinsengracht, como la de verdad
  const puentes = [49, 9].map(deg);
  const filas = [filaArco(C, R[0], deg(57), deg(86), 'keyser', 1), filaArco(C, R[1], deg(6), deg(31), 'vingboons', 2), filaArco(C, R[2], deg(66), deg(86), 'pakhuis', 3)];
  return {
    C, R, A, IJ, bast, heroe, segunda, anclas, filas,
    canal: (x, z) => z > IJ && R.some(g => Math.abs(r(x, z) - g) < A),
    radial: (x, z) => z > IJ && r(x, z) < MU[0] && puentes.some(p => Math.abs(ang(x, z) - p) * r(x, z) < 0.22),
    agua(x, z) {
      if (z < IJ) return 2;
      if (x > damrak[0] && x < damrak[1] && z < damrak[3]) return 1;
      if (this.canal(x, z)) return 1;
      if (dentroBaluarte(bast, x, z, 1.0)) return 0;
      const rr = r(x, z);
      if ((rr > FO[0] && rr < FO[1]) || (dentroBaluarte(bast, x, z, 1.32) && rr > MU[1] - 0.1)) return 3;
      return 0;
    },
    muralla: (x, z) => { const rr = r(x, z); return z > IJ && rr > MU[0] && rr < MU[1] ? ss(1 - Math.abs(rr - (MU[0] + MU[1]) / 2) / ((MU[1] - MU[0]) / 2)) : 0; },
    fuera: (x, z) => r(x, z) > FO[1] - 0.05 && !dentroBaluarte(bast, x, z, 1.32),
    dam: (x, z) => x > dam[0] && x < dam[1] && z > dam[2] && z < dam[3],
    muelle(x, z) { const rr = r(x, z); return (z > IJ && z < IJ + 0.35) || (z > IJ && R.some(g => Math.abs(rr - g) < A + 0.3)) || (x > damrak[0] - 0.3 && x < damrak[1] + 0.3 && z < damrak[3] + 0.3); },
    tulipanes: (x, z) => x + z > 30.5,
    puentes: puentes.flatMap(p => [...R.map(g => ({ ...pol(C, g, p), rot: rotHacia(p), largo: 2 * A + 0.5 })), { ...pol(C, (FO[0] + FO[1]) / 2, deg(30)), rot: rotHacia(deg(30)), largo: FO[1] - FO[0] + 0.4 }]).filter(b => b.x > 2.4 && b.x < 17.6 && b.z < 17.6),
    quais: R.flatMap(g => [g - A - 0.17, g + A + 0.17]).map(rq => ({ c: C, r: rq })),
    barcos: [{ t: 'retour', x: 12.2, z: 2.75, rot: 0 }, { t: 'fluit', x: 16.2, z: 2.55, rot: Math.PI }, { t: 'boeier', x: 8.8, z: 2.95, rot: 0.2 }, { t: 'boeier', x: 14.4, z: 3.25, rot: Math.PI + 0.3 }],
    bosques: [{ x: 15.8, z: 17.3, n: 5, s: 0.5 }, { x: 17.3, z: 14.5, n: 4, s: 0.45 }, { x: 11.8, z: 17.6, n: 4, s: 0.45 }, { x: 9.2, z: 5.2, n: 3, s: 0.4 }, { x: 12.03, z: 6.86, n: 4, s: 0.45 }, { x: 7.75, z: 12.45, n: 4, s: 0.45 }, { x: 16.92, z: 6.9, n: 3, s: 0.4 }, { x: 4.6, z: 14.2, n: 4, s: 0.45 }],
    gente: [[5.0, 8.6, 0.4], [6.4, 9.0, -0.6], [3.6, 8.9, 0.9], [8.6, 9.2, 0.2], [9.0, 11.6, -0.4]],
    texto: 'gradas',
  };
}
function planPuerto() {
  const IJ = 5.0, A = 0.45;
  const her = [11.8, 12.7], kei = [15.0, 15.9], rokin = [11.6, 12.4];
  const bast = { x: 16.3, z: 16.3, rot: Math.PI / 4 };
  const heroe = { x: 6.8, z: 7.5, rot: 0 }, dam = [4.4, 11.55, 9.1, 10.75];
  const anclas = { prensa: { x: 9.7, z: 13.85 }, tipos: { x: 13.3, z: 13.85 }, orbis: { x: 16.4, z: 13.7 }, cartilla: { x: 7.2, z: 13.85 }, didactica: { x: 10.6, z: 17.0 }, atlas: { x: 13.4, z: 16.9 } };
  const segunda = { x: 15.4, z: 8.9, rot: Math.PI };
  const filas = [filaRecta(2.3, 4.35, her[0] - 0.3 - DEP / 2, 0, 'keyser', 1), filaRecta(12.75, 17.7, her[0] - 0.3 - DEP / 2, 0, 'vingboons', 2), filaRecta(2.3, 6.0, kei[0] - 0.3 - DEP / 2, 0, 'pakhuis', 3)];
  return {
    IJ, A, bast, heroe, segunda, anclas, filas,
    canal: (x, z) => (z > her[0] && z < her[1]) || (z > kei[0] && z < kei[1] && x < 11.6) || (x > rokin[0] && x < rokin[1] && z < her[1] && z > IJ - 0.1),
    radial: (x, z) => (Math.abs(x - 9.7) < 0.22 && z > her[1] && z < kei[0]) || (Math.abs(x - 3.0) < 0.22 && z > 10.8 && z < kei[1]),
    agua(x, z) {
      if (z < IJ) return 2;
      if (this.canal(x, z)) return 1;
      if (dentroBaluarte(bast, x, z, 1.0)) return 0;
      if (dentroBaluarte(bast, x, z, 1.32) || (x > 16.85 && z > 10.5 && z < 15.6) || (z > 16.85 && x > 11.8 && x < 15.6)) return 3;
      return 0;
    },
    muralla: (x, z) => (x > 16.15 && x < 16.8 && z > 10.6 && z < 15.6 ? ss(1 - Math.abs(x - 16.47) / 0.33) : 0) + (z > 16.15 && z < 16.8 && x > 11.9 && x < 15.6 ? ss(1 - Math.abs(z - 16.47) / 0.33) : 0),
    fuera: (x, z) => (x > 16.85 || z > 16.85 || (x < 11.9 && z > 16.0)) && !dentroBaluarte(bast, x, z, 1.32),
    dam: (x, z) => x > dam[0] && x < dam[1] && z > dam[2] && z < dam[3],
    muelle: (x, z) => (z > IJ && z < IJ + 0.4) || (z > her[0] - 0.3 && z < her[1] + 0.3) || (z > kei[0] - 0.3 && z < kei[1] + 0.3 && x < 11.9) || (x > rokin[0] - 0.3 && x < rokin[1] + 0.3 && z < her[1]),
    tulipanes: (x, z) => z > 16.2 && x < 11.6,
    puentes: [{ x: 9.7, z: (her[0] + her[1]) / 2, rot: 0, largo: 1.4 }, { x: 3.0, z: (her[0] + her[1]) / 2, rot: 0, largo: 1.4 }, { x: 3.0, z: (kei[0] + kei[1]) / 2, rot: 0, largo: 1.4 }, { x: 8.6, z: (kei[0] + kei[1]) / 2, rot: 0, largo: 1.4 }, { x: (rokin[0] + rokin[1]) / 2, z: 10.0, rot: Math.PI / 2, largo: 1.3 }, { x: 14.4, z: (her[0] + her[1]) / 2, rot: 0, largo: 1.4 }],
    quaisRectos: [[2, 18, her[0] - 0.17], [2, 18, her[1] + 0.17], [2, 11.6, kei[0] - 0.17], [2, 11.6, kei[1] + 0.17]],
    barcos: [{ t: 'retour', x: 4.6, z: 3.3, rot: 0 }, { t: 'retour', x: 13.2, z: 2.9, rot: Math.PI }, { t: 'fluit', x: 9.0, z: 3.9, rot: 0 }, { t: 'fluit', x: 16.6, z: 4.1, rot: 0.15 }, { t: 'boeier', x: 7.4, z: 2.5, rot: Math.PI }, { t: 'boeier', x: 15.4, z: 2.4, rot: 0.4 }],
    bosques: [{ x: 4.0, z: 17.2, n: 6, s: 0.55 }, { x: 8.2, z: 16.9, n: 4, s: 0.45 }, { x: 17.4, z: 17.4, n: 3, s: 0.4 }, { x: 14.6, z: 6.4, n: 4, s: 0.45 }, { x: 3.2, z: 6.8, n: 4, s: 0.45 }, { x: 3.4, z: 13.8, n: 4, s: 0.45 }],
    gente: [[7.0, 9.9, 0.4], [8.4, 10.2, -0.6], [5.6, 10.0, 0.9], [10.4, 10.4, 0.2], [11.0, 13.2, -0.4]],
    texto: 'puerto',
  };
}
export const PLANES = { anillo: planAnillo, gradas: planGradas, puerto: planPuerto };

/* ============================================================ EL ARMADO ============================================================ */
export function maqueta(K, variante = MON.VARIANTES.tablero, { heroe = MON.VARIANTES.heroe, segunda = MON.VARIANTES.segunda } = {}) {
  const P = PLANES[variante](), g = new THREE.Group(), rnd = azar(1648);
  const tipoAgua = (x, z) => P.agua(x, z);
  const altura = (x, z) => tipoAgua(x, z) ? HONDO : 0.34 * P.muralla(x, z);
  // las reservas: lo que no se pisa con árboles
  const reservas = [];
  const resRect = (x0, x1, z0, z1) => reservas.push(q => q.x > x0 && q.x < x1 && q.z > z0 && q.z < z1);
  const resCirc = (x, z, rr) => reservas.push(q => Math.hypot(q.x - x, q.z - z) < rr);
  const libre = (x, z) => !reservas.some(f => f({ x, z }));
  const SVW = MON.SV.W, SVD = MON.SV.D;
  resRect(P.heroe.x - SVW / 2 - 0.3, P.heroe.x + SVW / 2 + 1.9, P.heroe.z - SVD / 2 - 1.9, P.heroe.z + SVD / 2 + 1.3);
  for (const a of Object.values(P.anclas)) resCirc(a.x, a.z, 0.95);
  resCirc(P.segunda.x, P.segunda.z, 0.9);
  resCirc(P.bast.x, P.bast.z, 1.5);
  for (const f of P.filas) for (const h of f) resCirc(h.x, h.z, 0.55);
  for (const b of P.puentes) resCirc(b.x, b.z, 0.5);

  /* ---------- el suelo: la grilla con su color por zona y los muros de los canales ---------- */
  const N = LADO * RES, s = 1 / RES, pos = [], col = [], c = new THREE.Color(), cc = new THREE.Color();
  const zonaColor = (x, z) => {
    const t = Math.abs(Math.floor(x * 2) * 7 + Math.floor(z * 2) * 13);
    for (const a of Object.values(P.anclas)) if (Math.hypot(x - a.x, z - a.z) < 0.85) return COL.plaza[t % 2];
    if (P.dam(x, z)) return COL.plaza[(Math.floor(x * 4) + Math.floor(z * 4)) % 2];
    if (P.muralla(x, z) > 0.02) return P.muralla(x, z) > 0.75 ? '#a6cd6c' : COL.muralla[t % 2];   // la muralla de tierra: el camino de ronda arriba, el talud de pasto
    if (P.fuera(x, z)) {   // los pólderes: parcelas largas entre acequias; al frente, los campos de tulipanes en franjas de un color
      const fz = z / 1.25, parcela = Math.floor(fz), borde = fz - parcela;
      if (borde < 0.07) return COL.acequia;
      if (P.tulipanes(x, z)) { const campo = Math.floor(x / 1.15) + parcela * 3, franja = Math.floor((borde - 0.07) / 0.93 * 6); return franja % 2 === 1 ? COL.polder[franja % 3] : COL.tulipan[((campo % 4) + 4) % 4]; }
      return COL.polder[((Math.floor(x / 2.4) + parcela) % 3 + 3) % 3];
    }
    if (P.muelle(x, z)) return COL.muelle[(Math.floor(x * 5) + Math.floor(z * 5)) % 2];
    if (P.radial(x, z)) return COL.calle[t % 3];
    const h = Math.sin(Math.floor(x * 3) * 12.9898 + Math.floor(z * 3) * 78.233) * 43758.5453; return COL.jardin[Math.floor((h - Math.floor(h)) * 3)];
  };
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s, v = (x, z) => [x, altura(x, z), z];
    const quad = [[v(x0, z0), v(x0, z1), v(x1, z0)], [v(x1, z0), v(x0, z1), v(x1, z1)]];
    for (const tri of quad) {
      const hx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, hz = (tri[0][2] + tri[1][2] + tri[2][2]) / 3, hy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
      const muro = hy < -0.02 && hy > HONDO + 0.02, ta = tipoAgua(hx, hz);
      if (muro) c.set(ta === 2 ? '#a88e6a' : ta === 3 ? '#86a85a' : MON.AMB.muro);   // el muro de ladrillo del canal; el talud del dique y del foso
      else if (hy <= HONDO + 0.02) c.set('#7c8a7a');
      else c.set(zonaColor(hx, hz));
      for (const q of tri) { pos.push(...q); col.push(c.r, c.g, c.b); }
    }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals(); geo.userData.propia = true;
  g.add(K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false }));

  /* ---------- el agua: azul de verdad, más clara en las orillas ---------- */
  const pa = [], ca = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s;
    if (!tipoAgua(x0 + s / 2, z0 + s / 2) && [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].every(([x, z]) => !tipoAgua(x, z))) continue;
    for (const [x, z] of [[x0, z0], [x0, z1], [x1, z0], [x1, z0], [x0, z1], [x1, z1]]) {
      pa.push(x, NIVEL, z);
      let k = 0; for (const [dx, dz] of [[0.18, 0], [-0.18, 0], [0, 0.18], [0, -0.18]]) if (!tipoAgua(x + dx, z + dz)) k++;
      const t = tipoAgua(x, z) || tipoAgua(x + s / 2, z + s / 2);
      c.set(t === 2 ? MON.AMB.aguaD : MON.AMB.agua).lerp(cc.set(MON.AMB.aguaL), Math.min(1, k * 0.35));
      ca.push(c.r, c.g, c.b);
    }
  }
  const ga = new THREE.BufferGeometry(); ga.setAttribute('position', new THREE.Float32BufferAttribute(pa, 3)); ga.setAttribute('color', new THREE.Float32BufferAttribute(ca, 3)); ga.computeVertexNormals(); ga.userData.propia = true;
  const agua = new THREE.Mesh(ga, K.mat('#ffffff', { vertexColors: true })); agua.receiveShadow = true; g.add(agua);
  for (let k = 0; k < 40; k++) {   // las olitas
    const x = E0 + 0.3 + rnd() * (LADO - 0.6), z = E0 + 0.2 + rnd() * (LADO - 0.4);
    if (!tipoAgua(x, z) || !tipoAgua(x + 0.2, z) || !tipoAgua(x - 0.2, z)) continue;
    const o = K.malla(K.caja(0.26, 0.004, 0.016), MON.AMB.aguaL, { sinTinta: true, sombra: false }); o.position.set(x, NIVEL + 0.004, z); g.add(o);
  }
  /* ---------- la losa: los dos cortes que ve la cámara, con el agua asomando ---------- */
  const corte = (fijo, eje) => {
    const p2 = [], c2 = [], paso = 0.125;
    const quad = (a, b, d, e, color) => { c.set(color); for (const q of [a, b, d, a, d, e]) { p2.push(...q); c2.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, Pp = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const xa = eje === 'x' ? fijo : u, za = eje === 'x' ? u : fijo, xb = eje === 'x' ? fijo : u1, zb = eje === 'x' ? u1 : fijo;
      const h0 = altura(xa, za), h1 = altura(xb, zb);
      quad(Pp(u, h0), Pp(u1, h1), Pp(u1, Math.min(h1, 0) - 0.08), Pp(u, Math.min(h0, 0) - 0.08), h0 < -0.03 ? '#6a7a6a' : '#c9ad84');
      quad(Pp(u, Math.min(h0, 0) - 0.08), Pp(u1, Math.min(h1, 0) - 0.08), Pp(u1, -0.42), Pp(u, -0.42), PAL.corte1);
      quad(Pp(u, -0.42), Pp(u1, -0.42), Pp(u1, -0.9), Pp(u, -0.9), PAL.corte2);
      if (h0 < NIVEL || h1 < NIVEL) quad(Pp(u, NIVEL), Pp(u1, NIVEL), Pp(u1, Math.min(NIVEL, h1)), Pp(u, Math.min(NIVEL, h0)), MON.AMB.aguaD);
    }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(p2, 3)); gg.setAttribute('color', new THREE.Float32BufferAttribute(c2, 3)); gg.computeVertexNormals(); gg.userData.propia = true;
    return new THREE.Mesh(gg, K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide }));
  };
  g.add(corte(E1, 'x'), corte(E1, 'z'));
  const fondo = K.malla(K.caja(LADO - 0.02, 0.5, LADO - 0.02), PAL.corte2, { grosor: 0.03, sombra: false, recibe: false }); fondo.position.set(10, -0.66, 10); g.add(fondo);

  /* ---------- el héroe, la segunda pieza, el baluarte con su molino ---------- */
  const h = MON.heroe(K, heroe, 3, { plaza: false }); h.position.set(P.heroe.x, 0, P.heroe.z); h.rotation.y = P.heroe.rot; g.add(h); g.userData.heroe = h;
  const sg = MON.segunda(K, segunda); sg.position.set(P.segunda.x, 0, P.segunda.z); sg.rotation.y = P.segunda.rot; g.add(sg);
  const mb = MON.molinoBastion(K, { foso: false }); mb.position.set(P.bast.x, 0, P.bast.z); mb.rotation.y = P.bast.rot; g.add(mb);

  /* ---------- las casas: una fila por canal ---------- */
  for (const f of P.filas) for (const q of f) { const casa = MON.casaCanal(K, q.op); casa.position.set(q.x, 0, q.z); casa.rotation.y = q.rot; g.add(casa); }

  /* ---------- los puentes de ladrillo con su arco y sus pretiles ---------- */
  for (const b of P.puentes) {
    const pu = new THREE.Group(); pu.position.set(b.x, 0, b.z); pu.rotation.y = b.rot; g.add(pu);
    pu.add(K.malla(K.caja(0.5, 0.06, b.largo), MON.AMB.muro, { grosor: 0.004 }));
    const arco = K.malla(K.toro(b.largo * 0.3, 0.05, Math.PI, 0.6), MON.AMB.muro, { grosor: 0.003 }); arco.rotation.y = Math.PI / 2; arco.position.y = -0.2; arco.scale.set(1, 0.55, 1); pu.add(arco);
    [-1, 1].forEach(l => { const pr = K.malla(K.caja(0.04, 0.08, b.largo), MON.AMB.arenL, { grosor: 0.002 }); pr.position.set(l * 0.23, 0.07, 0); pu.add(pr); });
  }

  /* ---------- los saberes en sus anclas propuestas: las piezas del juego en su última etapa, con el anillo ámbar ---------- */
  const CREA = { tipos: PZ.tipos, prensa: PZ.prensa, cartilla: PZ.cartilla, atlas: PZ.atlas, didactica: PZ.didactica, orbis: PZ.orbis };
  const piezas = [];
  for (const [k, a] of Object.entries(P.anclas)) {
    const pz = CREA[k](K, 3); pz.obj.position.set(a.x, 0, a.z); g.add(pz.obj); pz.anim(0.5, 0.016); piezas.push(pz);
    const an = K.malla(K.toro(0.82, 0.018, Math.PI * 2, 0.6), '#f2b441', { sinTinta: true, sombra: false }); an.rotation.x = Math.PI / 2; an.position.set(a.x, 0.015, a.z); g.add(an);
  }
  g.userData.piezas = piezas;

  /* ---------- los olmos: en hilera sobre los muelles y en bosquecillos (instanciados) ---------- */
  const arb = [];
  const pon = (x, z, hh) => { if (x < E0 + 0.25 || x > E1 - 0.25 || z < E0 + 0.25 || z > E1 - 0.25) return; if (tipoAgua(x, z) || !libre(x, z) || P.dam(x, z)) return; if (arb.some(q => Math.hypot(q[0] - x, q[1] - z) < 0.42)) return; arb.push([x, z, hh]); };
  for (const q of P.quais || []) for (let a = 0; a < Math.PI * 2; a += 0.62 / q.r) { const p = pol(q.c, q.r, a); if (p.z > P.IJ + 0.3 && Math.floor(a * q.r / 1.9 + q.r) % 3 === 0) pon(p.x, p.z, 0.72 + rnd() * 0.16); }   // tramos cortos de olmos, con huecos
  for (const [x0, x1, z] of P.quaisRectos || []) for (let x = x0 + 0.3; x < x1; x += 0.62) if (Math.floor(x / 1.9 + z) % 3 === 0) pon(x, z, 0.72 + rnd() * 0.16);
  for (const b of P.bosques) for (let k = 0; k < b.n * 4 && k < 50; k++) { const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * (0.35 + b.n * b.s * 0.22); pon(b.x + Math.cos(a) * rr, b.z + Math.sin(a) * rr, 0.8 + rnd() * 0.3); }
  const n = arb.length, m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3();
  const troncos = K.instancias(K.cilindro(0.025, 0.036, 1, 6), MON.AMB.tronco, n, { grosor: 0.002 });
  const copas = [MON.AMB.hoja, MON.AMB.hojaL].map(cl => K.instancias(K.esfera(1, 0.42), cl, n, { grosor: 0.006 }));
  arb.forEach(([x, z, hh], i) => {
    const y0 = altura(x, z) > 0 ? altura(x, z) : 0;
    m4.compose(v3.set(x, y0 + hh * 0.3, z), q4.identity(), s3.set(1, hh * 0.6, 1)); troncos.setMatrixAt(i, m4);
    [[0, 0.74, 0, 0.28], [0.1, 0.62, 0.05, 0.22]].forEach(([dx, dy, dz, rr], k) => { m4.compose(v3.set(x + dx * hh * (i % 2 ? 1 : -1), y0 + dy * hh, z + dz * hh), q4.identity(), s3.set(rr * hh, rr * hh * 0.86, rr * hh)); copas[(k + i) % 2].setMatrixAt(i, m4); });   // la copa en dos bultos
  });
  g.add(troncos, ...copas);

  /* ---------- los barcos del IJ ---------- */
  for (const b of P.barcos) { const o = MON.navio(K, b.t); o.position.set(b.x, NIVEL + 0.02, b.z); o.rotation.y = b.rot; g.add(o); }
  /* ---------- la gente en el Dam y en los muelles, para medir ---------- */
  P.gente.slice(0, 3).forEach(([x, z, r], i) => { const p = crearPersona(K, i % 2 ? { piel: 0, pelo: 'moño', colorPelo: '#7a5a34', velo: '#f4f0e6', ropa: 'tunica', colorRopa: ['#7a3a2a', '#3f4f6a'][i % 2], orla: '#2e2a24', chal: '#f4f0e6', sinFlecos: true } : { piel: 0, pelo: 'melena', colorPelo: '#5a3a24', barba: '#5a3a24', ropa: 'tunica', colorRopa: '#26221e', orla: '#1a1714', chal: '#f4f0e6', bonete: '#1e1c1a', sinFlecos: true }); p.anim(0, { pose: 'quieto', instantaneo: true }); p.obj.position.set(x, 0, z); p.obj.rotation.y = r; g.add(p.obj); });
  g.userData.plan = P;
  return g;
}
