/* ============================================================
   paris/valle
   París en 3D (Época 8), la maqueta A de la hoja (juego3d/bocetos/paris.html, «la orilla de las escuelas»): el Sena corre por
   el borde del fondo izquierdo con la Cité larga al medio, donde Notre-Dame muestra la fachada y el flanco sur; toda la
   orilla de enfrente es de las escuelas: la calle de Santiago sube del Petit-Pont a su puerta, la calle de la paja baja a la
   puerta de Buci, la Montaña de Santa Genoveva se levanta al medio con sus viñas y la muralla de Felipe Augusto la cruza.
   Afuera quedan San Víctor (en la esquina), el arrabal con sus campos y el prado de los clérigos junto al río.
   Pocas casas y cada una distinta (las de entramado de la calle, las de piedra de los maestros, las del arrabal); los
   árboles en bosquecillos (olmos, álamos y sauces de la orilla, frutales de los huertos). El año viste el suelo y las copas
   (el verde nuevo, el oro de las mieses, el ocre del otoño, la nieve), el Sena crece y baja, y el agua corre río abajo.
   La geometría es la del motor (09f-paris, espejada en lugares.js).
   ============================================================ */
import * as THREE from 'three';
import { azar, PAL } from '../kit.js';
import { PA, ND, casaEntramado, casaPiedra, casaArrabal, arbolPa, huerta, cerca, pozo, tonel } from './monumentos.js';
import * as L from './lugares.js';

export const E0 = 2, E1 = 18, LADO = E1 - E0, CENTRO = 10;
export const NIVEL = -0.08;
export const RESERVAS = [];
export const reservado = (x, z, m = 0) => RESERVAS.some(r => r.r ? Math.hypot(x - r.x, z - r.z) < r.r + m : x > r.x0 - m && x < r.x1 + m && z > r.z0 - m && z < r.z1 + m);
const ss = k => k * k * (3 - 2 * k);
const cl = k => Math.max(0, Math.min(1, k));

/* ---------- las calles, el prado, los campos, los huertos ---------- */
/* la calle de Santiago (del Petit-Pont a su puerta, en la muralla del sur) y la calle de la paja (a la puerta de Buci) */
export const CALLES = [[[6.7, 10.6], [18, 10.6], 0.36], [[10.15, 10.7], [10.15, 16.4], 0.24]];
export const enCalle = (x, z, m = 0) => CALLES.some(([a, b, w]) => { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz, u = cl(((x - a[0]) * dx + (z - a[1]) * dz) / L2); return Math.hypot(x - a[0] - u * dx, z - a[1] - u * dz) < w / 2 + m; });
const enRect = (r, x, z, m = 0) => x > r[0] - m && x < r[1] + m && z > r[2] - m && z < r[3] + m;
export const PRADO_R = [6.8, 12.6, 16.45, 17.9];                                // el prado de los clérigos, entre la muralla y el río
export const enPrado = (x, z) => enRect(PRADO_R, x, z);
export const CAMPOS = [[14.3, 17.9, 9.9, 17.9, 'x'], [7.2, 12.4, 2.2, 4.55, 'z']];   // los campos del arrabal y los de afuera de la puerta de San Víctor
export const HUERTOS = [[7.6, 15.55, 0.7, 0.4], [16.25, 11.05, 0.6, 0.4], [13.0, 3.3, 0.6, 0.36]];
export const fueraMuralla = (x, z) => z > L.MURALLA_OESTE || x > L.MURALLA_SUR || z < L.MURALLA_ESTE;
/* la Montaña: su loma no se camina (las viñas); arriba, la abadía; las terrazas planas donde se apoya lo construido */
const LO = L.LOMA;
const dLoma = (x, z) => Math.hypot((x - LO.x) / LO.rx, (z - LO.y) / LO.ry);
const PLANOS = [{ r: [14.45, 17.4, 2.15, 5.3] }, { x: 15.15, z: 6.8, rr: 0.62 }];   // el recinto de San Víctor y la terraza del campanario
const aplanar = (x, z) => { let k = 1; for (const P of PLANOS) { const d = P.r ? Math.hypot(Math.max(P.r[0] - x, 0, x - P.r[1]), Math.max(P.r[2] - z, 0, z - P.r[3])) : Math.max(0, Math.hypot(x - P.x, z - P.z) - P.rr); k = Math.min(k, ss(cl(d / 0.45))); } return k; };
export const enLoma = (x, z, m = 0) => dLoma(x, z) < 0.95 + m / LO.rx && aplanar(x, z) > 0.3;
export const CIMA = { x: LO.x + 0.15, y: LO.y - 0.1 };

/* ---------- la altura: el lecho del Sena con su playa, la isla, la loma ---------- */
const islaE = (x, z) => { const dx = Math.abs(x - L.CITE.x) / L.CITE.rx, dz = Math.abs(z - L.CITE.y) / L.CITE.ry; return Math.pow(dx * dx * dx * dx + dz * dz * dz * dz, 0.25); };
export function altura(x, z) {
  if (x > L.SENA.x0 && x < L.SENA.x1) {
    let d = L.SENA.x1 - x; if (L.SENA.x0 > E0) d = Math.min(d, x - L.SENA.x0);
    const e = islaE(x, z);
    if (e < 1) return e > 0.92 ? -0.06 * (e - 0.92) / 0.08 : 0.0;
    d = Math.min(d, (e - 1) * Math.min(L.CITE.rx, L.CITE.ry));
    return -0.04 - 0.3 * ss(Math.min(1, d / 0.38));
  }
  const d = dLoma(x, z);
  return d < 1 ? LO.h * ss(Math.min(1, (1 - d) / 0.62)) * aplanar(x, z) : 0;
}

/* ---------- las casas: pocas, cada una distinta (tipo, x, z, giro, opciones). El frente mira a +z, o a +x si giran 90° ---------- */
export const CASAS = [
  // la Cité: las casas de los canónigos del claustro, junto al atrio
  ['e', 3.55, 10.75, 0, { w: 0.4, pisos: 2, yeso: ND.ocre, estilo: 'cruces' }], ['p', 4.75, 10.9, 0, { w: 0.5, pisos: 1, vanos: 'gotica', alero: true }],
  ['e', 3.7, 12.2, 0, { w: 0.42, pisos: 1, yeso: ND.revoque, estilo: 'postes', techo: 'pizarra' }], ['e', 4.7, 12.35, 0, { w: 0.38, pisos: 2, yeso: ND.rosa, estilo: 'riostras' }],
  // la calle de Santiago, del lado del río: las tiendas con su letrero
  ['e', 7.95, 9.9, 0, { w: 0.4, pisos: 2, yeso: ND.revoque, letrero: '#b03a2c' }], ['e', 8.5, 9.95, 0, { w: 0.44, pisos: 1, yeso: ND.ocre, estilo: 'postes', techo: 'pizarra' }],
  ['e', 9.05, 9.9, 0, { w: 0.38, pisos: 3, yeso: ND.blanco, estilo: 'riostras', letrero: '#3a5cb0' }],
  // la del estudiante pobre, junto al río, con su buhardilla; la escuela de la calle de la paja, con la cátedra bajo el alero
  ['e', 7.4, 11.55, Math.PI / 2, { w: 0.4, pisos: 3, yeso: ND.rosa, estilo: 'cruces', tienda: false }],
  ['e', 9.5, 11.45, Math.PI / 2, { w: 0.46, pisos: 2, yeso: '#ecd9a8', estilo: 'postes', alero: true, tienda: false }],
  // las casas de piedra de los maestros
  ['p', 12.95, 12.35, 0, { w: 0.48, pisos: 2, vanos: 'romana', torre: true }], ['p', 10.9, 15.2, 0, { w: 0.5, pisos: 1, vanos: 'gotica', alero: true }],
  // el arrabal de afuera de la puerta de Santiago
  ['a', 15.0, 11.55, 0, { w: 0.5 }], ['a', 15.75, 12.75, -0.2, { w: 0.42, dos: true, techo: 'teja', cal: ND.ocre }], ['a', 16.7, 15.6, 0.3, { w: 0.6, cobertizo: true }],
];
const huella = ([t, , , ry, o]) => { const w = o.w || 0.5, d = o.d || (t === 'e' ? 0.5 : t === 'p' ? 0.42 : 0.36); return Math.abs(Math.sin(ry)) > 0.7 ? [d, w] : [w, d]; };
export function casas(K) {
  const g = new THREE.Group(), puestas = []; g.userData.puestas = puestas;
  CASAS.forEach((c, i) => {
    const [t, x, z, ry, o] = c, y = Math.max(0, altura(x, z));
    const m = t === 'p' ? casaPiedra(K, o) : t === 'a' ? casaArrabal(K, o) : casaEntramado(K, { h1: 0.26, hp: 0.22, ...o });
    m.position.set(x, y, z); m.rotation.y = ry; g.add(m);
    const [w, d] = huella(c); puestas.push({ x, z, w: w + (o.torre ? 0.3 : 0), d, i });
  });
  /* lo de afuera de las casas: el pozo de la calle, los toneles del tabernero, la carreta del arrabal, la ropa tendida */
  const en = (o, x, z, ry = 0) => { o.position.set(x, Math.max(0, altura(x, z)), z); o.rotation.y = ry; g.add(o); return o; };
  en(pozo(K), 8.55, 11.25);
  [[9.4, 10.25], [9.5, 10.18], [9.45, 10.3]].forEach(([x, z]) => en(tonel(K), x, z));
  [[15.45, 11.75], [15.5, 11.62]].forEach(([x, z]) => en(tonel(K), x, z));
  [[4.25, 11.0], [4.32, 10.93]].forEach(([x, z]) => en(tonel(K), x, z));
  const ropa = new THREE.Group(); en(ropa, 16.15, 15.95, 0.3);                                                   // la ropa tendida del arrabal
  [-1, 1].forEach(l => { const p = K.malla(K.cilindro(0.008, 0.008, 0.36, 4), PA.maderaD, { sinTinta: true }); p.position.set(l * 0.28, 0.18, 0); ropa.add(p); });
  const cu = K.malla(K.cilindro(0.003, 0.003, 0.56, 3), '#c9b88a', { sinTinta: true }); cu.rotation.z = Math.PI / 2; cu.position.y = 0.34; ropa.add(cu);
  ['#f2ead2', '#b03a2c', '#e8dcc2', '#3f4f7a'].forEach((c, k) => { const p = K.malla(K.caja(0.09, 0.12, 0.006), c, { grosor: 0.001 }); p.position.set(-0.19 + k * 0.125, 0.27, 0); ropa.add(p); });
  return g;
}

/* ---------- los bosquecillos (x, z, radio, cuántos, especie): olmos, álamos y sauces de la orilla, frutales de los huertos ---------- */
const BOSQUES = [[6.95, 3.4, 0.45, 3, 'sauce'], [6.95, 7.2, 0.55, 3, 'alamo'], [6.95, 15.05, 0.35, 2, 'sauce'], [7.8, 17.2, 0.6, 4, 'olmo'], [11.7, 17.3, 0.5, 3, 'olmo'],
  [4.1, 2.75, 0.4, 3, 'olmo'], [3.0, 13.2, 0.3, 2, 'frutal'], [6.85, 12.9, 0.2, 1, 'olmo'], [9.4, 3.4, 0.45, 3, 'olmo'], [17.35, 9.6, 0.3, 2, 'olmo'], [16.9, 13.4, 0.7, 3, 'frutal'],
  [17.4, 6.4, 0.35, 2, 'olmo'], [13.3, 16.95, 0.4, 2, 'olmo'], [8.5, 5.5, 0.3, 2, 'frutal']];
export const ARBOLES = (() => {
  const out = [], r = azar(1163);
  BOSQUES.forEach(([x, z, rr, n, tipo], gi) => {
    for (let k = 0, puestos = 0; k < n * 14 && puestos < n; k++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * rr, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d, s = (tipo === 'frutal' ? 1.35 : 1.1) * (0.85 + r() * 0.3);
      if (px < E0 + 0.15 || pz < E0 + 0.15 || px > E1 - 0.15 || pz > E1 - 0.15 || altura(px, pz) < -0.02 || enCalle(px, pz, 0.14) || enLoma(px, pz, 0.1)) continue;
      if (out.some(q => Math.hypot(q.x - px, q.z - pz) < 0.3)) continue;
      out.push({ x: px, z: pz, s, tipo, sem: gi * 10 + k, r: tipo === 'alamo' ? 0.16 : tipo === 'sauce' ? 0.22 : 0.24 }); puestos++;
    }
  });
  return out;
})();

/* las copas que el año viste: cada color de follaje tiene su material propio (no el compartido del kit) */
const FOLLAJE = ['#557f38', '#6f9a46', '#4b7232', '#88b35a', '#5f8a3e', '#7fa652', '#8aa45a', '#a2b86c', '#748f48', '#6f9a48', '#8ab35a'];
export function vegetacion(K, vivos, libre = () => true) {
  const g = new THREE.Group(), r = azar(1215), propios = new Map();
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  const puestos = [];
  ARBOLES.forEach(a => {
    if (!libre(a.x, a.z, a.r)) return;
    const t = arbolPa(K, a.tipo, a.s, a.sem); t.position.set(a.x, Math.max(0, altura(a.x, a.z)) - 0.01, a.z); g.add(t); puestos.push(a);
  });
  g.userData.puestos = puestos;
  const adoptar = obj => obj.traverse(o => { if (!o.isMesh || !o.material || !o.material.color) return; const hx = '#' + o.material.color.getHexString(); if (!FOLLAJE.includes(hx)) return;
    if (!propios.has(hx)) propios.set(hx, { m: o.material.clone(), base: new THREE.Color(hx) }); o.material = propios.get(hx).m; });
  /* los huertos con su cerca */
  HUERTOS.forEach(([x, z, w, d]) => { const h = huerta(K, w, d); h.position.set(x, Math.max(0, altura(x, z)), z); g.add(h); const c = cerca(K, w + 0.1); c.position.set(x, Math.max(0, altura(x, z)), z + d / 2 + 0.05); g.add(c); });
  /* las cepas de la Montaña, en hileras sobre la ladera; arriba, el prado de la abadía */
  const cep = [];
  for (let z = LO.y - LO.ry; z < LO.y + LO.ry; z += 1 / 7.5) for (let x = LO.x - LO.rx; x < LO.x + LO.rx; x += 0.1) {
    const zz = (Math.floor(z * 7.5) + 0.5) / 7.5, d = dLoma(x, zz);
    if (d < 0.34 || d > 0.95 || !(Math.floor(z * 7.5) & 1) || x < E0 + 0.1 || zz < E0 + 0.1 || x > E1 - 0.1 || zz > E1 - 0.1 || aplanar(x, zz) < 0.95 || reservado(x, zz, 0.06)) continue;
    if (L.MURALLA.some((p, i) => i < L.MURALLA.length - 1 && distSeg(x, zz, p, L.MURALLA[i + 1]) < 0.16)) continue;
    cep.push([x, zz]);
  }
  const vi = K.instancias(K.esfera(1, 0.35), '#5f7f3a', Math.max(1, cep.length), { sinTinta: true }); vi.material = vi.material.clone();
  cep.forEach(([x, z], i) => { m4.compose(v.set(x, altura(x, z) + 0.03, z), q.identity(), s.set(0.035, 0.04, 0.03)); vi.setMatrixAt(i, m4); });
  /* los juncos de las orillas */
  const jun = [];
  for (let k = 0; k < 4000 && jun.length < 170; k++) {
    const x = E0 + 0.1 + r() * (L.SENA.x1 - E0), z = E0 + 0.2 + r() * (LADO - 0.4), a = altura(x, z);
    if (a > -0.06 || a < -0.16 || L.enPuente(x, z) || Math.abs(z - L.PUENTES[0].z) < 0.4) continue; jun.push([x, z, 0.14 + r() * 0.12, r()]);
  }
  const ju = K.instancias(K.cilindro(0.005, 0.009, 1, 4), '#8a9a52', Math.max(1, jun.length), { sinTinta: true }); ju.material = ju.material.clone();
  jun.forEach(([x, z, h, k], i) => { q.setFromEuler(e.set((k - 0.5) * 0.3, 0, (k - 0.5) * 0.3)); m4.compose(v.set(x, NIVEL + h / 2, z), q, s.set(1, h, 1)); ju.setMatrixAt(i, m4); });
  /* la mies de los campos, en franjas */
  const mies = [];
  for (const rc of CAMPOS) for (let x = rc[0] + 0.08; x < rc[1]; x += 0.15) for (let z = rc[2] + 0.08; z < rc[3]; z += 0.15) {
    const k = Math.floor((rc[4] === 'x' ? x : z) * 1.25) % 4;
    if ((k === 0 || k === 3) && !reservado(x, z, 0.08) && !enCalle(x, z, 0.06) && altura(x, z) > -0.01 && altura(x, z) < 0.03 && libre(x, z, 0.02)) mies.push([x, z, r()]);
  }
  const mi = K.instancias(K.cono(0.035, 1, 4), '#c9b456', Math.max(1, mies.length), { sinTinta: true }); mi.material = mi.material.clone();
  mies.forEach(([x, z, k], i) => { const h = 0.1 + k * 0.05; q.setFromEuler(e.set((k - 0.5) * 0.2, k * 6, 0)); m4.compose(v.set(x, h / 2 + Math.max(0, altura(x, z)), z), q, s.set(1, h, 1)); mi.setMatrixAt(i, m4); });
  g.add(vi, ju, mi);
  const tinte = [null, '#9fae4a', '#c98a3a', '#b4b0a4'], fuerza = [0, 0.18, 0.62, 0.7], c = new THREE.Color(), c2 = new THREE.Color();
  const copa = (base, i) => { c2.copy(base); if (i === 0) c2.lerp(c.set('#b4d06a'), 0.18); else if (tinte[i]) c2.lerp(c.set(tinte[i]), fuerza[i]); return c2.clone(); };
  adoptar(g);
  return {
    g, adoptar,
    vestir(i, k, j, nieve = 0) {                          // las copas: verde nuevo, verde lleno, ocre del otoño, ramas grises con escarcha; la mies verde, dorada, segada, nevada
      for (const { m, base } of propios.values()) { const a = copa(base, i), b = copa(base, j); m.color.copy(a.lerp(b, k)); if (nieve > 0) m.color.lerp(c.set('#eef0f0'), nieve * 0.35); }
      const MI = ['#9cb85a', '#d6bf5e', '#bfa066', '#d8d8d4'], VI = ['#6f9a3e', '#5f7f3a', '#a07a3a', '#8a8070'], JU = ['#8aa652', '#9a9a52', '#a8945a', '#a8a490'];
      mi.material.color.set(MI[i]).lerp(c.set(MI[j]), k); vi.material.color.set(VI[i]).lerp(c.set(VI[j]), k); ju.material.color.set(JU[i]).lerp(c.set(JU[j]), k);
    },
  };
}
function distSeg(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz, u = cl(((x - a[0]) * dx + (z - a[1]) * dz) / L2); return Math.hypot(x - a[0] - u * dx, z - a[1] - u * dz); }
export { distSeg };

/* ---------- el suelo: cada triángulo sabe qué es (agua, isla, calle, viña, prado, campo, ciudad, campo de afuera) y el año lo pinta ---------- */
const AGUA = 0, ISLA = 1, CALLE = 2, VINA = 3, CIMAP = 4, PRADO = 5, CAMPO = 6, ORILLA = 7, CIUDAD = 8, AFUERA = 9;
function clase(x, z, h) {
  if (h < -0.025) return [AGUA, 0];
  if (L.enCite(x, z)) return [ISLA, 0];
  if (enCalle(x, z)) return [CALLE, 0];
  const d = dLoma(x, z);
  if (d < 0.97 && aplanar(x, z) > 0.5) return d < 0.32 ? [CIMAP, 0] : [VINA, (Math.floor(z * 7.5) & 1)];
  if (enPrado(x, z)) return [PRADO, 0];
  for (const r of CAMPOS) if (enRect(r, x, z) && !reservado(x, z, 0.05)) return [CAMPO, Math.floor((r[4] === 'x' ? x : z) * 1.25) % 4];
  for (const [dx, dz] of [[0.3, 0], [-0.3, 0], [0, 0.3], [0, -0.3]]) if (altura(x + dx, z + dz) < -0.03 && x > L.SENA.x1 - 0.5) return [ORILLA, 0];
  if (!fueraMuralla(x, z)) return [CIUDAD, 0];
  return [AFUERA, 0];
}
/* la paleta del año (primavera, verano, otoño, invierno): el suelo claro y cálido, los verdes vivos */
const VERDES = [['#b4cd7a', '#aac672', '#bad180', '#a6c26e', '#b0ca76'], ['#bccb74', '#b4c46c', '#c3d07c', '#aebf68', '#b8c870'], ['#c9bd7e', '#c1b476', '#cfc386', '#bbae70', '#c5b97a'], ['#c8c8b8', '#c2c2b2', '#cfcfbf', '#bcbcac', '#c6c6b6']];
const PRADOS = [['#a8c66c', '#a1c064', '#aecb72', '#9cbb60', '#a5c369'], ['#b2c46a', '#abbd62', '#b8c970', '#a5b85e', '#afc167'], ['#bdb070', '#b5a868', '#c3b676', '#ae9f62', '#b9ac6c'], ['#c0c2b0', '#babcaa', '#c6c8b6', '#b4b6a4', '#bec0ae']];
const MIESES = [['#a9c463', '#bccf72', '#c9b98a', '#b4cd7a'], ['#d9c46e', '#e2cf7c', '#c7a56a', '#d2c070'], ['#c7a56a', '#b89a64', '#d0b27a', '#a99060'], ['#c4b89a', '#bcb092', '#cabea0', '#b4a88a']];
const VINAS = [['#93ad56', '#b9a068'], ['#8fa64e', '#c2a66a'], ['#b08a4a', '#c2a46e'], ['#a09a88', '#b8ad90']];
const CIMAS = [['#a6c466', '#9fbe60'], ['#b0c262', '#a8ba5a'], ['#bcae6a', '#b4a662'], ['#bebfac', '#b8b9a6']];
const CIUDADES = ['#e2d4ae', '#ddcfa8', '#e6d8b4', '#d9cba4', '#dfd1ab'], ISLAS = ['#e3d6b6', '#ddd0ae', '#e6dabb', '#d9cca8', '#e0d3b2'];
export function suelo(K) {
  const RES = 4, N = LADO * RES, s = 1 / RES, pos = [], hondo = [], cen = [];
  const tri = (a, b, d) => { for (const q of [a, b, d]) pos.push(q[0], q[1], q[2]); hondo.push((a[1] + b[1] + d[1]) / 3); cen.push((a[0] + b[0] + d[0]) / 3, (a[2] + b[2] + d[2]) / 3); };
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s, v = (x, z) => [x, altura(x, z), z];
    tri(v(x0, z0), v(x0, z1), v(x1, z0)); tri(v(x1, z0), v(x0, z1), v(x1, z1));
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const col = new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3); geo.setAttribute('color', col);
  geo.computeVertexNormals();
  const cls = hondo.map((h, t) => { const x = cen[2 * t], z = cen[2 * t + 1]; return [...clase(x, z, h), Math.abs(Math.floor(x * 2) * 7 + Math.floor(z * 2) * 13) % 5]; });
  const c = new THREE.Color(), c2 = new THREE.Color(), nv = new THREE.Color('#eef0f2');
  const base = (t, e) => {
    const [k, sub, tab] = cls[t], h = hondo[t], x = cen[2 * t], z = cen[2 * t + 1];
    switch (k) {
      case AGUA: return c.set('#d8c79c').lerp(c2.set('#9a8a66'), Math.min(1, (-h - 0.025) / 0.12));
      case ISLA: return c.set(ISLAS[tab]);
      case CALLE: return c.set(((Math.floor(x * 4) + Math.floor(z * 4)) & 1) ? '#c4ad84' : '#bba47a');
      case VINA: return c.set(VINAS[e][sub]);
      case CIMAP: return c.set(CIMAS[e][tab & 1]);
      case PRADO: return c.set(PRADOS[e][tab]);
      case CAMPO: return c.set(MIESES[e][sub]).lerp(c2.set('#ffffff'), tab * 0.012);
      case ORILLA: return c.set(['#c9c08a', '#c6c08a', '#cbc490', '#c8bc86'][e]);
      case CIUDAD: return c.set(CIUDADES[tab]);
      default: return c.set(VERDES[e][tab]);
    }
  };
  const pintar = ({ i, j, k, nieve }) => {
    for (let t = 0; t < hondo.length; t++) {
      base(t, i); if (k > 0) { const a = c.clone(); base(t, j); c.copy(a.lerp(c, k)); }
      const kl = cls[t][0];
      if (nieve > 0 && hondo[t] > -0.04) c.lerp(nv, nieve * (kl === CALLE ? 0.5 : kl === CIUDAD || kl === ISLA ? 0.62 : 0.85));
      for (let q = 0; q < 3; q++) col.setXYZ(t * 3 + q, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  };
  pintar({ i: 0, j: 0, k: 0, nieve: 0 });
  const m = K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false });
  m.userData.suelo = true; m.userData.pintar = pintar; m.userData.vivo = true;
  return m;
}

/* ---------- el agua del Sena: corre hacia +z (río abajo, hacia el poniente de verdad), con sus ondas ---------- */
export function agua(K, vivos) {
  const g = new THREE.Group(), RES = 4, s = 1 / RES, pos = [], prof = [];
  for (let i = 0; i < LADO * RES; i++) for (let j = 0; j < LADO * RES; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s;
    const hs = [altura(x0, z0), altura(x1, z0), altura(x0, z1), altura(x1, z1)];
    if (Math.min(...hs) > NIVEL - 0.004) continue;
    for (const [x, z, h] of [[x0, z0, hs[0]], [x0, z1, hs[2]], [x1, z0, hs[1]], [x1, z0, hs[1]], [x0, z1, hs[2]], [x1, z1, hs[3]]]) { pos.push(x, 0, z); prof.push(h); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const col = new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3); geo.setAttribute('color', col);
  geo.computeVertexNormals(); geo.userData.propia = true;
  const c = new THREE.Color(), c2 = new THREE.Color();
  for (let i = 0; i < prof.length; i++) {
    const k = Math.min(1, Math.max(0, (NIVEL - prof[i]) / 0.24));
    if (k < 0.3) c.set('#bcd9d6').lerp(c2.set('#93c2cc'), k / 0.3); else c.set('#93c2cc').lerp(c2.set('#6aa3bc'), (k - 0.3) / 0.7);
    col.setXYZ(i, c.r, c.g, c.b);
  }
  const rio = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, transparent: true, opacity: 0.92 })); rio.receiveShadow = true; rio.position.y = NIVEL; rio.userData.vivo = true;
  g.add(rio);
  const onda = new THREE.PlaneGeometry(0.026, 0.42); onda.userData.propia = true;
  const mo = new THREE.MeshBasicMaterial({ color: '#f2f8f6', transparent: true, opacity: 0.38, depthWrite: false });
  const olas = [], rr = azar(4242);
  for (let k = 0; k < 400 && olas.length < 30; k++) {
    const x = E0 + 0.1 + rr() * (L.SENA.x1 - E0 - 0.2), z = E0 + rr() * LADO;
    if (altura(x, z) > -0.2) continue;
    const m = new THREE.Mesh(onda, mo.clone()); m.rotation.x = -Math.PI / 2; g.add(m);
    olas.push({ m, x, z, f: rr() });
  }
  vivos.push(t => olas.forEach(o => { const f = (t * 0.07 + o.f) % 1; let z = o.z + f * 0.9; if (z > E1 - 0.2) z -= LADO - 0.4; o.m.position.set(o.x, rio.position.y + 0.006, z); o.m.material.opacity = altura(o.x, z) < -0.15 ? 0.34 * Math.sin(Math.PI * f) : 0; }));
  return { g, rio };
}

/* ---------- la losa del diorama: el corte de tierra con el río asomando ---------- */
export function losa(K) {
  const g = new THREE.Group();
  const pared = (fijo, eje) => {
    const pos = [], col = [], c = new THREE.Color(), paso = 0.125;
    const quad = (p0, p1, p2, p3, color) => { c.set(color); for (const p of [p0, p1, p2, p0, p2, p3]) { pos.push(...p); col.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, P = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const xa = eje === 'x' ? fijo : u, za = eje === 'x' ? u : fijo, xb = eje === 'x' ? fijo : u1, zb = eje === 'x' ? u1 : fijo;
      const h0 = altura(xa, za), h1 = altura(xb, zb);
      quad(P(u, h0), P(u1, h1), P(u1, Math.min(h1, 0) - 0.1), P(u, Math.min(h0, 0) - 0.1), h0 < -0.03 ? '#7a6e52' : '#cdbd94');
      quad(P(u, Math.min(h0, 0) - 0.1), P(u1, Math.min(h1, 0) - 0.1), P(u1, -0.46), P(u, -0.46), PAL.corte1);
      quad(P(u, -0.46), P(u1, -0.46), P(u1, -1.05), P(u, -1.05), PAL.corte2);
      if (h0 < NIVEL || h1 < NIVEL) quad(P(u, NIVEL), P(u1, NIVEL), P(u1, Math.min(NIVEL, h1)), P(u, Math.min(NIVEL, h0)), '#5f93a8');
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals(); geo.userData.propia = true;
    const m = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide })); m.receiveShadow = false; return m;
  };
  g.add(pared(E1, 'x'), pared(E1, 'z'));
  const caja = (w, h, d, x, y, z, color) => { const m = K.malla(K.caja(w, h, d), color, { grosor: 0.03, sombra: false, recibe: false }); m.position.set(x, y, z); g.add(m); };
  caja(LADO, 0.46, 0.06, CENTRO, -0.23, E0 + 0.03, PAL.corte1); caja(0.06, 0.46, LADO, E0 + 0.03, -0.23, CENTRO, PAL.corte1);
  caja(LADO - 0.02, 0.6, LADO - 0.02, CENTRO, -0.76, CENTRO, PAL.corte2);
  const r = azar(1163);
  for (let i = 0; i < 16; i++) {                        // la caliza de las canteras de París (los sillares de la catedral salieron de debajo de la ciudad) y algún tiesto
    const izq = r() < 0.5, s = E0 + 0.4 + r() * (LADO - 0.8), y = -(0.3 + r() * 0.65), rr = 0.05 + r() * 0.06;
    const p = K.malla(K.roca(rr, 160 + i), i % 3 ? PA.piedraL : i % 2 ? PAL.piedrita : PA.teja, { sinTinta: true, sombra: false, recibe: false }); p.scale.set(1.4, 0.8, 1.4);
    if (izq) p.position.set(s, y, E1 + 0.005); else p.position.set(E1 + 0.005, y, s);
    g.add(p);
  }
  return g;
}
