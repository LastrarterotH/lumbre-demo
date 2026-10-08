/* ============================================================
   bagdad/valle
   El tablero de Bagdad en 3D (Época 6), según la maqueta A de la hoja juego3d/bocetos/bagdad.html (replanteo del
   2026-10-04): la Ciudad Redonda llena la esquina del fondo (la pone epoca6, es el héroe); el Tigris corre ancho por el
   borde del este con su playa, su dique de hierba y sus cañas; entre la ciudad y el río, el tell de la aldea vieja de
   Bagdad con sus muros caídos y los palmares; a la izquierda del camino de Kufa, el barrio de casas de patio del arrabal
   (Karkh) y los campos del Sawad; por el frente, el canal de los campos (el que mueve la noria del molino de papel) con
   sus acequias y, delante, más campos; en el medio, la plaza de tierra apisonada donde viven los saberes. El año viste el
   suelo, la hierba y los campos (el trigo verde en invierno, dorado en primavera, rastrojo en verano, arado en otoño; la
   alfalfa y las huertas siempre verdes).
   La geometría es la del motor (09d-bagdad, espejada en lugares.js): la querencia del papel, las caravanas y los toques
   caen donde el motor los espera. Nadie camina sobre el relieve (la gente va a la altura 0): el tell, el dique y los
   campos quedan fuera del paso.
   ============================================================ */
import * as THREE from 'three';
import { azar, PAL } from '../kit.js';
import * as BM from './monumentos.js';
import * as L from './lugares.js';

const pon = (padre, m, x, y, z, ry = 0) => { m.position.set(x, y, z); if (ry) m.rotation.y = ry; padre.add(m); return m; };
export const E0 = 2, E1 = 18, LADO = E1 - E0, CENTRO = 10;
export const NIVEL_RIO = -0.07, NIVEL_CANAL = -0.055;
const C = L.CIUDAD;
export const CIUDAD_R = C.r + 0.98;                                               // hasta el bordillo de afuera del foso
const dC = (x, z) => Math.hypot(x - C.x, z - C.y);
const ss = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
const h3 = (a, b, c = 0) => { const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return s - Math.floor(s); };
function distSeg(ax, az, bx, bz, x, z) { const vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz, t = L2 ? Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L2)) : 0; return Math.hypot(x - ax - vx * t, z - az - vz * t); }

/* ---------- LA COMPOSICIÓN ---------- */
/* los caminos de ladrillo: el de Kufa (de la puerta al borde del frente, cruzando el canal por su puente) y el de Jorasán
   (de la puerta al puente de barcas) */
export const CAMINOS = [[6.6, 10.95, 6.6, 18.0, 0.34], [10.95, 6.6, 15.3, 6.6, 0.32]];
export const PUENTE_CANAL = { x: 6.6, z: L.CANAL.z, w: 0.84, largo: 0.95 };      // el puentecito de ladrillo del camino de Kufa sobre el canal
/* los campos del Sawad: [x0, z0, ancho, fondo, tipo]. El frente (más allá del canal) es una sola banda de campos, de la
   orilla del oeste a la del Tigris, cortada por las acequias: más huertas y alfalfa que mies, para que el frente se lea
   verde, regado, y no arena (la corrección del usuario sobre la maqueta A) */
export const CAMPOS = [
  [2.25, 14.0, 2.3, 0.9, 'trigo'], [2.25, 15.1, 2.3, 0.95, 'alfalfa'], [4.85, 15.2, 1.3, 0.85, 'huerta'],
  [3.2, 16.8, 1.42, 1.12, 'huerta'], [4.8, 16.8, 1.38, 1.12, 'trigo'],
  [7.05, 16.8, 0.88, 1.12, 'alfalfa'], [8.08, 16.8, 0.86, 1.12, 'huerta'], [9.1, 16.8, 1.1, 1.12, 'trigo'], [10.36, 16.8, 1.03, 1.12, 'alfalfa'],
  [11.55, 16.8, 1.22, 1.12, 'cebada'], [12.95, 16.86, 1.1, 1.06, 'huerta'],
  [2.3, 10.55, 1.0, 0.62, 'huerta'],
];
/* las acequias que sacan agua del canal hacia los campos: [x0, z0, x1, z1] (medio ancho 0,06) */
export const ACEQUIAS = [[4.7, 13.92, 4.7, 18.0], [2.0, 15.0, 4.7, 15.0], [8.0, 16.6, 8.0, 18.0], [9.0, 16.6, 9.0, 18.0], [10.28, 16.6, 10.28, 18.0], [11.45, 16.6, 11.45, 18.0], [12.86, 16.6, 12.86, 18.0]];
const ACQ = 0.06;
/* el tell: el montículo de la aldea vieja de Bagdad, entre la ciudad y el río, con sus muros caídos */
export const TELL = { x: 13.2, z: 4.7, r: 1.35, h: 0.72 };
/* el dique natural del Tigris (en la mitad del fondo, donde no se camina) */
const DIQUE = { x0: 14.25, x1: 15.0, z1: 9.9 };
/* los palmares en bosquecillos: [x, z, n, radio, semilla] */
export const PALMARES = [[12.45, 8.55, 11, 0.82, 3], [14.45, 9.3, 6, 0.5, 4], [2.8, 9.85, 6, 0.55, 11], [11.4, 2.95, 8, 0.7, 8], [14.55, 2.85, 5, 0.45, 9],
  [14.6, 17.35, 5, 0.4, 7], [2.7, 17.35, 4, 0.4, 10], [2.75, 3.0, 4, 0.45, 12]];
/* el muelle de tablas en la orilla, con su barca de vela */
export const MUELLE = { x: 15.55, z: 10.2, largo: 1.0 };
/* LAS CASAS: pocas, cada una distinta (la hoja, fila 3 A: las de patio, ladrillo y badgir). El barrio del arrabal al lado
   del camino de Kufa; la de los Hermanos de la Pureza (el secreto), de barro con la azotea ancha; y unas sueltas: junto
   al puente de barcas, a la derecha de la Casa y atrás. */
export const CASAS = [
  { x: 3.5, z: 11.9, ry: 0, t: 'patio', o: { w: 0.92, d: 0.86, h: 0.6, tono: BM.AB.cal, cama: true, palma: false, semilla: 5 } },
  { x: 4.65, z: 11.85, ry: -0.1, t: 'patio', o: { w: 0.8, d: 0.74, h: 0.52, tono: BM.AB.barro, palma: true, ropa: true, semilla: 8 } },
  { x: 3.25, z: 13.1, ry: 0, t: 'patio', o: { w: 1.15, d: 1.0, h: 0.92, tono: BM.AB.ante, celosia: true, conBadgir: true, palma: true, semilla: 3 } },
  { x: 4.8, z: 13.1, ry: 0.06, t: 'patio', o: { w: 0.86, d: 0.8, h: 0.72, tono: '#e2cca2', conBadgir: true, palma: false, cama: true, semilla: 9 } },
  { x: 5.7, z: 12.4, ry: 0.18, t: 'patio', o: { w: 0.72, d: 0.68, h: 0.5, tono: BM.AB.barroL, palma: false, ropa: true, semilla: 12 } },
  { x: 5.35, z: 14.6, ry: 0.05, t: 'barro', o: { w: 1.05, d: 0.95, h: 0.5, tono: BM.AB.barroL, semilla: 4 }, ikhwan: true },
  { x: 13.75, z: 7.6, ry: -0.1, t: 'orilla', o: { w: 0.95, d: 0.74, balcon: true, conBadgir: true } },
  { x: 14.45, z: 11.3, ry: 0.05, t: 'patio', o: { w: 0.8, d: 0.74, h: 0.6, tono: '#e2cca2', conBadgir: true, palma: false, cama: true, semilla: 6 } },
  { x: 9.7, z: 2.6, ry: 0, t: 'patio', o: { w: 0.76, d: 0.7, h: 0.5, tono: BM.AB.barroL, palma: true, semilla: 7 } },
];
export const IKHWAN = CASAS.find(c => c.ikhwan);
/* lo de afuera del barrio: el horno de pan, las tinajas, el burro, la ropa tendida */
const AFUERA = [['tannur', 4.1, 12.6, 0], ['zir', 4.32, 12.86, 0], ['burro', 4.1, 13.9, 0.4], ['zir', 5.62, 13.2, 0], ['tendedero', 4.15, 12.38, 0.3], ['zir', 14.0, 7.25, 0], ['tannur', 14.95, 11.75, 0]];

/* ---------- lo que está en cada lugar ---------- */
export const enRio = x => x > L.TIGRIS_X0;
export const enCanal = (x, z) => x > L.CANAL.x0 && Math.abs(z - L.CANAL.z) < 0.28;
export const enAcequia = (x, z, m = 0) => ACEQUIAS.some(([ax, az, bx, bz]) => distSeg(ax, az, bx, bz, x, z) < ACQ + m);
export const enCiudad = (x, z, m = 0) => dC(x, z) < CIUDAD_R + m;
export const enTell = (x, z, m = 0) => Math.hypot(x - TELL.x, z - TELL.z) < TELL.r + m;
export const enCampo = (x, z, m = 0) => CAMPOS.some(([x0, z0, w, d]) => x > x0 - m && x < x0 + w + m && z > z0 - m && z < z0 + d + m);
export function enCamino(x, z, m = 0) { return CAMINOS.some(([ax, az, bx, bz, w]) => distSeg(ax, az, bx, bz, x, z) < w + m); }
export const enPuenteCanal = (x, z) => Math.abs(x - PUENTE_CANAL.x) < PUENTE_CANAL.w / 2 && Math.abs(z - PUENTE_CANAL.z) < PUENTE_CANAL.largo / 2;
/* la plaza del arrabal (tierra apisonada): la mitad del frente entre el camino de Kufa y el río, afuera del foso; y el
   suelo del barrio */
export const enPlaza = (x, z) => x > 6.9 && x < 14.95 && z > 9.7 && z < 16.12 && dC(x, z) > CIUDAD_R + 0.08;
export const enBarrio = (x, z) => x > 2.35 && x < 6.3 && z > 11.15 && z < 13.98;
export const RESERVAS = [];
export const reservado = (x, z, m = 0) => RESERVAS.some(r => r.r ? Math.hypot(x - r.x, z - r.z) < r.r + m : x > r.x0 - m && x < r.x1 + m && z > r.z0 - m && z < r.z1 + m);
/* lo que el valle ocupa (las casas, el tell, los palmares, el muelle): no se camina a través ni crece hierba encima */
export function reservarValle(R) {
  for (const c of CASAS) { const a = Math.max(c.o.w, c.o.d) / 2 * (1 + Math.abs(Math.sin(c.ry)) * 0.4) + 0.06; R.push({ x0: c.x - a, x1: c.x + a, z0: c.z - a * (c.o.d / Math.max(c.o.w, c.o.d)) - 0.04, z1: c.z + a * (c.o.d / Math.max(c.o.w, c.o.d)) + 0.04, casa: true }); }
  for (const [, x, z] of AFUERA) R.push({ x, z, r: 0.14 });
  for (const [x, z, , r] of PALMARES) R.push({ x, z, r: r + 0.12, palmar: true });
  R.push({ x0: MUELLE.x - MUELLE.largo / 2 - 0.1, x1: MUELLE.x + MUELLE.largo / 2, z0: MUELLE.z - 0.25, z1: MUELLE.z + 0.25 });
}

/* ---------- el relieve: el lecho del Tigris con su playa, el dique de hierba, el canal y sus acequias, el tell ---------- */
export function altura(x, z) {
  let h = 0;
  const dr = x - L.TIGRIS_X0;
  if (dr > -0.38) h = dr < 0 ? -0.045 * ss((dr + 0.38) / 0.38) : -0.045 - 0.33 * ss(dr / 0.9);           // la playa y el lecho
  else if (x > DIQUE.x0 && z < DIQUE.z1 && Math.abs(z - 6.6) > 0.5) {                                       // el dique, en el fondo (el camino del puente lo corta)
    const u = (x - DIQUE.x0) / (DIQUE.x1 - DIQUE.x0), fz = ss((DIQUE.z1 - z) / 0.6) * ss(Math.abs(z - 6.6) - 0.5 < 0.4 ? (Math.abs(z - 6.6) - 0.5) / 0.4 : 1);
    if (u < 1) h = 0.15 * Math.sin(Math.PI * Math.min(1, u * 1.15)) * fz;
  }
  if (x > L.CANAL.x0 - 0.1 && x < L.TIGRIS_X0 + 0.2) { const dz = Math.abs(z - L.CANAL.z); if (dz < 0.34) h = Math.min(h, dz < 0.2 ? -0.13 : -0.13 + 0.13 * ss((dz - 0.2) / 0.14)); }
  for (const [ax, az, bx, bz] of ACEQUIAS) { const d = distSeg(ax, az, bx, bz, x, z); if (d < ACQ + 0.05) h = Math.min(h, d < ACQ ? -0.085 : -0.085 + 0.085 * ss((d - ACQ) / 0.05)); }
  const dt = Math.hypot(x - TELL.x, (z - TELL.z) * 1.1); if (dt < TELL.r) h = Math.max(h, TELL.h * ss(Math.min(1, (1 - dt / TELL.r) * 1.6)) * (0.85 + 0.15 * Math.sin(x * 3.1 + z * 2.3)));
  return h;
}

/* ---------- el suelo: celdas de ¼, pintadas por baldosa; el año lo repinta ---------- */
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
  const c = new THREE.Color(), c2 = new THREE.Color();
  const LADR = ['#dcbb90', '#d4b186', '#e0c29a', '#cfab7f', '#d8b78c'];        // los caminos: ladrillo cocido en espiga
  const pintar = pal => {
    for (let t = 0; t < hondo.length; t++) {
      const h = hondo[t], x = cen[2 * t], z = cen[2 * t + 1], q = Math.abs(Math.floor(x * 2) * 7 + Math.floor(z * 2) * 13);
      c.set(pal.campo[Math.abs(Math.floor(x) * 7 + Math.floor(z) * 13) % 5]).lerp(c2.set('#f0e2bc'), 0.22);       // la arena clara del Sawad
      if (enPlaza(x, z)) c.set((Math.floor(x * 2) + Math.floor(z * 2)) % 2 ? '#ecdcb6' : '#e8d7ae');               // la plaza del arrabal, tierra apisonada
      else if (enBarrio(x, z)) c.set(q % 2 ? '#e8d6ac' : '#e3d0a4');
      else if (enCiudad(x, z, 0.3)) c.set(q % 2 ? '#e2cfa6' : '#ddc99e');
      if (enCamino(x, z)) { c.set(LADR[Math.abs(Math.floor(x * 3) * 7 + Math.floor(z * 3) * 13) % 5]); if ((Math.floor(x * 3) + Math.floor(z * 3)) % 2) c.multiplyScalar(0.965); }
      if (enCampo(x, z, 0.06)) c.set('#c9ad7c');                                                                // la tierra de los linderos
      const dr = L.TIGRIS_X0 - x;
      if (dr > -0.05 && dr < 0.45) c.lerp(c2.set('#eadcb0'), 0.7);                                               // la playa
      if (x > DIQUE.x0 - 0.15 && dr >= 0.45 && z < DIQUE.z1 + 0.3 && !enCamino(x, z)) c.lerp(c2.set(pal.verde), 0.7);   // el dique de hierba
      const dz = Math.abs(z - L.CANAL.z);
      if (x > L.CANAL.x0 && dz < 0.62 && dz > 0.18 && !enCamino(x, z)) c.lerp(c2.set(pal.verde), 0.75 * (1 - Math.max(0, dz - 0.3) / 0.32));   // las orillas verdes del canal
      if (enAcequia(x, z, 0.16) && !enCamino(x, z)) c.lerp(c2.set(pal.verde), 0.55);
      if (enTell(x, z)) c.lerp(c2.set('#d4ba8c'), 0.65);
      if (h < -0.03) c.lerp(c2.set('#8f805c'), Math.min(1, (-h - 0.03) / 0.1));                                // el lecho: limo
      for (let k = 0; k < 3; k++) col.setXYZ(t * 3 + k, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  };
  const m = K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false });
  m.userData.suelo = true; m.userData.pintar = pintar; m.userData.vivo = true;
  return m;
}

/* ---------- los campos: el plano con sus surcos y su lindero; el color lo pone el año ---------- */
const TEX = {};
function texCampo(tipo) {
  if (TEX[tipo]) return TEX[tipo];
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 64);
  if (tipo === 'huerta') { for (let y = 0; y < 64; y += 16) { g.fillStyle = 'rgba(120,80,40,.35)'; g.fillRect(0, y + 11, 64, 5); for (let x = 3; x < 64; x += 8) { g.fillStyle = 'rgba(40,90,30,.45)'; g.beginPath(); g.arc(x, y + 5, 3.4, 0, 7); g.fill(); } } }
  else if (tipo === 'alfalfa') { for (let i = 0; i < 140; i++) { g.fillStyle = i % 2 ? 'rgba(30,80,20,.22)' : 'rgba(255,255,230,.25)'; g.fillRect((i * 37) % 64, (i * 53) % 64, 3, 2); } for (let y = 0; y < 64; y += 16) { g.fillStyle = 'rgba(40,70,20,.16)'; g.fillRect(0, y, 64, 2); } }
  else for (let y = 0; y < 64; y += 8) { g.fillStyle = 'rgba(90,60,20,.28)'; g.fillRect(0, y, 64, 2.5); g.fillStyle = 'rgba(255,255,240,.25)'; g.fillRect(0, y + 4, 64, 1.5); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  return TEX[tipo] = t;
}
/* el color de cada cultivo en cada estación (primavera, verano, otoño, invierno): el trigo de invierno se siembra con las
   lluvias, verdea en invierno, dora en primavera y en verano queda el rastrojo; en otoño se ara. La alfalfa y las huertas,
   regadas por las acequias, siguen verdes todo el año. */
const COLOR_CAMPO = {
  trigo: ['#e4c86c', '#ead9a2', '#d2b483', '#a9c86c'],
  cebada: ['#d9cb72', '#e6d7a0', '#cdb07f', '#9cc566'],
  alfalfa: ['#93c462', '#9ec86a', '#97c064', '#8cbc5e'],
  huerta: ['#86bc5c', '#8fc062', '#93bb5e', '#80b458'],
};
export function campos(K) {
  const g = new THREE.Group(), mats = {};
  for (const [x0, z0, w, d, tipo] of CAMPOS) {
    const mat = mats[tipo] || (mats[tipo] = K.matMapa(texCampo(tipo)));
    const geo = new THREE.PlaneGeometry(w - 0.08, d - 0.08); geo.userData.propia = true;
    const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 0.8, uv.getY(i) * d / 0.8);
    const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(x0 + w / 2, 0.012, z0 + d / 2); m.receiveShadow = true; m.userData.suelo = true; g.add(m);
    for (const [x, z, ww, dd] of [[0, d / 2, w, 0.05], [0, -d / 2, w, 0.05], [w / 2, 0, 0.05, d], [-w / 2, 0, 0.05, d]]) pon(g, K.malla(K.caja(ww, 0.035, dd), '#c4a978', { grosor: 0.003 }), x0 + w / 2 + x, 0.017, z0 + d / 2 + z);
  }
  return {
    g,
    vestir(i, k, j) { for (const [tipo, mat] of Object.entries(mats)) mat.color.set(COLOR_CAMPO[tipo][i]).lerp(new THREE.Color(COLOR_CAMPO[tipo][j]), k); },
  };
}

/* ---------- el agua: el Tigris, ancho y verdoso, que baja de atrás hacia adelante; el canal y sus acequias ---------- */
export function agua(K, vivos) {
  const g = new THREE.Group(), RES = 4, s = 1 / RES;
  const hoja = (enAgua, nivel, pal) => {
    const pos = [], prof = [];
    for (let i = 0; i < LADO * RES; i++) for (let j = 0; j < LADO * RES; j++) {
      const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s;
      const hs = [altura(x0, z0), altura(x1, z0), altura(x0, z1), altura(x1, z1)];
      if (Math.min(...hs) > nivel - 0.004 || !enAgua(x0 + s / 2, z0 + s / 2) && Math.max(...hs) > nivel) continue;
      for (const [x, z, h] of [[x0, z0, hs[0]], [x0, z1, hs[2]], [x1, z0, hs[1]], [x1, z0, hs[1]], [x0, z1, hs[2]], [x1, z1, hs[3]]]) { pos.push(x, 0, z); prof.push(h); }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const col = new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3); geo.setAttribute('color', col);
    geo.computeVertexNormals(); geo.userData.propia = true;
    const c = new THREE.Color(), c2 = new THREE.Color();
    for (let i = 0; i < prof.length; i++) {
      const k = Math.min(1, Math.max(0, (nivel - prof[i]) / 0.3));
      if (k < 0.4) c.set(pal[0]).lerp(c2.set(pal[1]), k / 0.4); else c.set(pal[1]).lerp(c2.set(pal[2]), (k - 0.4) / 0.6);
      col.setXYZ(i, c.r, c.g, c.b);
    }
    const m = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, transparent: true, opacity: 0.93 })); m.receiveShadow = true; m.position.y = nivel; m.userData.vivo = true;
    return m;
  };
  const rio = hoja(x => enRio(x), NIVEL_RIO, ['#c4e0d0', '#82bcae', '#5b9493']);
  const canal = hoja((x, z) => (enCanal(x, z) || enAcequia(x, z)) && !enRio(x), NIVEL_CANAL, ['#bfdccb', '#8bbcac', '#71a39a']);
  g.add(rio, canal);
  /* la corriente: crestas claras que bajan por el río (de z chica a z grande) y por el canal (hacia el oeste) */
  const cresta = new THREE.PlaneGeometry(0.05, 0.42); cresta.userData.propia = true;
  const crestaC = new THREE.PlaneGeometry(0.3, 0.03); crestaC.userData.propia = true;
  const ancho = E1 - L.TIGRIS_X0 - 0.5;
  const olas = Array.from({ length: 22 }, (_, i) => { const m = new THREE.Mesh(cresta, new THREE.MeshBasicMaterial({ color: '#eef8f4', transparent: true, opacity: 0.4, depthWrite: false })); m.rotation.x = -Math.PI / 2; g.add(m); return { m, x: L.TIGRIS_X0 + 0.35 + (i * 0.618 % 1) * ancho, f: (i * 0.41) % 1 }; });
  const olasC = Array.from({ length: 10 }, (_, i) => { const m = new THREE.Mesh(crestaC, new THREE.MeshBasicMaterial({ color: '#eef8f4', transparent: true, opacity: 0.35, depthWrite: false })); m.rotation.x = -Math.PI / 2; g.add(m); return { m, f: i / 10 }; });
  vivos.push(t => {
    olas.forEach(o => { const f = (t * 0.035 + o.f) % 1; o.m.position.set(o.x, rio.position.y + 0.006, E0 + 0.3 + f * (LADO - 0.6)); o.m.material.opacity = 0.38 * Math.sin(Math.PI * f); });
    olasC.forEach(o => { const f = (t * 0.03 + o.f) % 1; o.m.position.set(L.TIGRIS_X0 - 0.2 - f * (L.TIGRIS_X0 - L.CANAL.x0 - 0.5), NIVEL_CANAL + 0.005, L.CANAL.z + 0.06 * Math.sin(o.f * 9)); o.m.material.opacity = 0.3 * Math.sin(Math.PI * f); });
  });
  return { g, rio, canal };
}

/* ---------- la losa del diorama: el corte de tierra y limo, con el Tigris, el canal y las acequias asomando ---------- */
export function losa(K) {
  const g = new THREE.Group();
  const pared = (fijo, eje) => {
    const pos = [], col = [], c = new THREE.Color(), paso = 0.125;
    const quad = (p0, p1, p2, p3, color) => { c.set(color); for (const p of [p0, p1, p2, p0, p2, p3]) { pos.push(...p); col.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, P = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const xa = eje === 'x' ? fijo : u, za = eje === 'x' ? u : fijo, xb = eje === 'x' ? fijo : u1, zb = eje === 'x' ? u1 : fijo;
      const h0 = altura(xa, za), h1 = altura(xb, zb);
      quad(P(u, h0), P(u1, h1), P(u1, Math.min(h1, 0) - 0.1), P(u, Math.min(h0, 0) - 0.1), h0 < -0.03 ? '#9a8a64' : '#d6bd8c');
      quad(P(u, Math.min(h0, 0) - 0.1), P(u1, Math.min(h1, 0) - 0.1), P(u1, -0.46), P(u, -0.46), PAL.corte1);
      quad(P(u, -0.46), P(u1, -0.46), P(u1, -1.05), P(u, -1.05), PAL.corte2);
      const rio = enRio(xa) || enRio(xb), agua = rio || enCanal(xa, za) || enCanal(xb, zb) || enAcequia(xa, za) || enAcequia(xb, zb), nv = rio ? NIVEL_RIO : NIVEL_CANAL;
      if (agua && (h0 < nv || h1 < nv)) quad(P(u, nv), P(u1, nv), P(u1, Math.min(nv, h1)), P(u, Math.min(nv, h0)), '#5f948e');
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals(); geo.userData.propia = true;
    const m = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide })); m.receiveShadow = false; return m;
  };
  g.add(pared(E1, 'x'), pared(E1, 'z'));
  const caja = (w, h, d, x, y, z, color) => { const m = K.malla(K.caja(w, h, d), color, { grosor: 0.03, sombra: false, recibe: false }); m.position.set(x, y, z); g.add(m); };
  caja(LADO, 0.46, 0.06, CENTRO, -0.23, E0 + 0.03, PAL.corte1); caja(0.06, 0.46, LADO, E0 + 0.03, -0.23, CENTRO, PAL.corte1);
  caja(LADO - 0.02, 0.6, LADO - 0.02, CENTRO, -0.76, CENTRO, PAL.corte2);
  const r = azar(2606);
  for (let i = 0; i < 16; i++) {                        // piedritas, tiestos vidriados y ladrillos en el corte
    const izq = r() < 0.5, s = E0 + 0.4 + r() * (LADO - 0.8), y = -(0.3 + r() * 0.65), rr = 0.05 + r() * 0.06;
    const p = K.malla(K.roca(rr, 120 + i), i % 3 ? PAL.piedrita : i % 2 ? BM.BA.turquesa : BM.BA.ladrillo, { sinTinta: true, sombra: false, recibe: false }); p.scale.set(1.4, 0.8, 1.4);
    if (izq) p.position.set(s, y, E1 + 0.005); else p.position.set(E1 + 0.005, y, s);
    g.add(p);
  }
  return g;
}

/* ---------- las casas: pocas, cada una con lo suyo; devuelve dónde se duerme en verano (las azoteas) ---------- */
export function casas(K) {
  const g = new THREE.Group(), techos = []; g.userData.techos = techos;
  const v = new THREE.Vector3();
  for (const c of CASAS) {
    const casa = c.t === 'orilla' ? BM.casaOrilla(K, c.o) : c.t === 'barro' ? BM.casaBarro(K, c.o) : BM.casaPatio(K, c.o);
    casa.position.set(c.x, 0, c.z); casa.rotation.y = c.ry; g.add(casa);
    if (c.t === 'patio') {                                 // en la azotea del frente (o en la cama, si la tiene) se duerme en verano
      const e = Math.min(c.o.w, c.o.d) * 0.32, h = c.o.h;
      const loc = c.o.cama ? [c.o.w * 0.18, -c.o.d / 2 + e / 2] : [c.o.w * 0.12, c.o.d / 2 - e / 2];
      v.set(loc[0], 0, loc[1]).applyAxisAngle(new THREE.Vector3(0, 1, 0), c.ry);
      techos.push([c.x + v.x, c.z + v.z, h + (c.o.cama ? 0.07 : 0.02), c.ry]);
    }
  }
  const FN = { tannur: BM.tannur, zir: BM.zir, burro: BM.burro, tendedero: k => BM.tendedero(k, 0.5) };
  for (const [k, x, z, ry] of AFUERA) pon(g, FN[k](K), x, 0, z, ry);
  /* el puentecito de ladrillo del camino de Kufa sobre el canal: el tablero, los pretiles y el arco en cada cara */
  const P = PUENTE_CANAL, pu = new THREE.Group(); pu.position.set(P.x, 0, P.z); g.add(pu);
  pon(pu, K.malla(K.caja(P.w, 0.07, P.largo), '#d9b98e', { grosor: 0.004 }), 0, 0.035, 0);
  [-1, 1].forEach(l => { pon(pu, K.malla(K.caja(0.07, 0.12, P.largo), BM.AB.ante, { grosor: 0.003 }), l * (P.w / 2 - 0.035), 0.12, 0); pon(pu, K.malla(K.caja(0.1, 0.03, P.largo + 0.04), BM.AB.anteD, { grosor: 0.002 }), l * (P.w / 2 - 0.035), 0.195, 0); });
  [-1, 1].forEach(l => { const a = K.malla(K.caja(P.w + 0.02, 0.16, 0.06), BM.AB.ante, { grosor: 0.003 }); a.position.set(0, -0.04, l * 0.22); pu.add(a); const hu = BM.hueco(K, 0.36, 0.12, '#4a5a50'); hu.position.set(0, -0.12, l * 0.22 + l * 0.031); hu.rotation.y = l > 0 ? 0 : Math.PI; pu.add(hu); });
  /* el muelle de tablas sobre pilotes, en la orilla de la derecha de la Casa */
  const M = MUELLE, mu = new THREE.Group(); mu.position.set(M.x, 0, M.z); g.add(mu);
  pon(mu, K.malla(K.caja(M.largo, 0.03, 0.34), BM.AB.maderaL || '#c9a46a', { grosor: 0.003 }), 0, 0.01, 0);
  for (let i = 0; i < 4; i++) [-1, 1].forEach(l => pon(mu, K.malla(K.cilindro(0.022, 0.024, 0.32, 5), BM.AB.maderaD || '#6a4a2a', { grosor: 0.002 }), -M.largo / 2 + 0.08 + i * (M.largo - 0.16) / 3, -0.1, l * 0.15));
  for (let i = 0; i < 7; i++) pon(mu, K.malla(K.caja(0.012, 0.004, 0.34), '#8a6a44', { sinTinta: true }), -M.largo / 2 + 0.07 + i * (M.largo - 0.14) / 6, 0.027, 0);
  pon(mu, K.malla(K.cilindro(0.03, 0.03, 0.08, 6), BM.AB.maderaD || '#6a4a2a', { grosor: 0.002 }), M.largo / 2 - 0.08, 0.06, 0.13);   // el noray
  return g;
}

/* el tell: los muros caídos de adobe de la aldea vieja, las piedras sueltas y un tiesto vidriado */
export function ruinas(K) {
  const g = new THREE.Group(), { x, z } = TELL, y = TELL.h * 0.8;
  [[-0.35, -0.1, 0.75, 0.22, 0.1, 0.2], [0.28, 0.22, 0.1, 0.18, 0.6, -0.1], [-0.05, 0.42, 0.5, 0.13, 0.09, 0.4], [0.4, -0.32, 0.32, 0.28, 0.09, 0.9], [-0.5, 0.28, 0.09, 0.15, 0.45, 0.3], [0.05, -0.5, 0.45, 0.11, 0.09, -0.2]].forEach(([dx, dz, w, h, d, ry]) => {
    const yy = altura(x + dx, z + dz); pon(g, K.malla(K.caja(w, h, d), '#d2b88c', { grosor: 0.004 }), x + dx, yy + h / 2 - 0.04, z + dz, ry);
  });
  for (let i = 0; i < 9; i++) { const a = i * 0.8, rr = 0.55 + h3(i, 2) * 0.6, px = x + Math.cos(a) * rr, pz = z + Math.sin(a) * rr; pon(g, K.malla(K.roca(0.05 + h3(i, 1) * 0.05, i + 3), '#c4aa7e', { grosor: 0.003 }), px, altura(px, pz) + 0.02, pz); }
  pon(g, K.malla(K.cilindro(0.05, 0.035, 0.07, 7), BM.BA.turquesa, { grosor: 0.002 }), x + 0.15, y + 0.02, z + 0.05).rotation.z = 1.3;
  void y;
  return g;
}

/* ---------- lo que crece: los palmares, las cañas del Tigris y del canal, la hierba y las matas ---------- */
export function vegetacion(K, vivos) {
  const g = new THREE.Group(), r = azar(8008);
  PALMARES.forEach(([x, z, n, rad, sem]) => { const p = BM.palmar(K, n, rad, sem); p.position.set(x, 0, z); p.traverse(o => { if (o.isGroup && o.parent === p) o.position.y = Math.max(0, altura(x + o.position.x, z + o.position.z)); }); g.add(p); });
  const libreDe = (x, z, m) => !reservado(x, z, m) && !enCamino(x, z, 0.08) && !enCiudad(x, z, 0.1) && !enCampo(x, z, 0.05) && !enPuenteCanal(x, z);
  const canas = [], hierba = [], matas = [];
  for (let k = 0; k < 2400 && canas.length < 300; k++) {   // las cañas: la orilla del Tigris, las del canal y las de las acequias
    const u = r(); let x, z;
    if (u < 0.5) { x = L.TIGRIS_X0 - 0.06 - r() * 0.42; z = E0 + 0.3 + r() * (LADO - 0.6); }
    else if (u < 0.85) { x = L.CANAL.x0 + 0.3 + r() * (L.TIGRIS_X0 - L.CANAL.x0 - 0.5); z = L.CANAL.z + (r() < 0.5 ? -1 : 1) * (0.31 + r() * 0.1); }
    else { const [ax, az, bx, bz] = ACEQUIAS[Math.floor(r() * ACEQUIAS.length)], t = r(); x = ax + (bx - ax) * t + (r() < 0.5 ? -1 : 1) * 0.1 * (az === bz ? 0 : 1); z = az + (bz - az) * t + (r() < 0.5 ? -1 : 1) * 0.1 * (az === bz ? 1 : 0); }
    if (!libreDe(x, z, 0.1) || altura(x, z) < -0.03 || Math.abs(z - MUELLE.z) < 0.35 && x > 14.5 || Math.abs(z - 6.6) < 0.45 && x > 14.5 || Math.abs(x - L.MOLINO.x - 0.1) < 1.85 && Math.abs(z - L.CANAL.z) < 0.5) continue;
    for (let q = 0; q < 3; q++) canas.push([x + (r() - 0.5) * 0.14, z + (r() - 0.5) * 0.12, 0.3 + r() * 0.28, r()]);
  }
  for (let k = 0; k < 4000 && (hierba.length < 280 || matas.length < 40); k++) {
    const x = E0 + 0.25 + r() * (LADO - 0.5), z = E0 + 0.25 + r() * (LADO - 0.5);
    if (!libreDe(x, z, 0.15) || altura(x, z) < -0.01 || enTell(x, z, -0.2) || x > L.TIGRIS_X0 - 0.4 || (enPlaza(x, z) && r() < 0.85) || (enBarrio(x, z) && r() < 0.6)) continue;
    if (r() < 0.14 && matas.length < 40) matas.push([x, z, 0.06 + r() * 0.06]); else if (hierba.length < 280) hierba.push([x, z, r()]);
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  const ca = K.instancias(K.cilindro(0.007, 0.011, 1, 4), '#8a9a52', canas.length, { sinTinta: true });
  canas.forEach(([x, z, h, mm], i) => { q.setFromEuler(e.set((mm - 0.5) * 0.3, 0, (mm - 0.5) * 0.25)); m4.compose(v.set(x, altura(x, z) + h / 2, z), q, s.set(1, h, 1)); ca.setMatrixAt(i, m4); });
  const pe = K.instancias(K.cono(0.025, 0.09, 4), '#c2ae70', canas.length, { sinTinta: true });   // los penachos de las cañas
  canas.forEach(([x, z, h, mm], i) => { q.setFromEuler(e.set((mm - 0.5) * 0.3, 0, (mm - 0.5) * 0.25)); m4.compose(v.set(x, altura(x, z) + h + 0.03, z), q, s.set(1, 1, 1)); pe.setMatrixAt(i, m4); });
  const hi = K.instancias(K.cono(0.03, 0.14, 4), '#b8ac6a', hierba.length, { sinTinta: true });
  hierba.forEach(([x, z, rr], i) => { q.setFromEuler(e.set((rr - 0.5) * 0.5, rr * 6, (rr - 0.5) * 0.4)); m4.compose(v.set(x, altura(x, z) + 0.06, z), q, s.set(1, 0.7 + rr * 0.6, 1)); hi.setMatrixAt(i, m4); });
  const ma = K.instancias(K.esfera(1, 0.6), '#87a05a', matas.length, { grosor: 0.01 });
  matas.forEach(([x, z, rr], i) => { m4.compose(v.set(x, altura(x, z) + rr * 0.55, z), q.identity(), s.set(rr * 1.3, rr * 0.9, rr * 1.3)); ma.setMatrixAt(i, m4); });
  g.add(ca, pe, hi, ma);
  vivos.push(t => { pe.rotation.z = Math.sin(t * 0.8) * 0.002; });
  const H = ['#a9bb68', '#c4bc6c', '#b8b268', '#9db66c'];
  return {
    g, hierba: hi,
    vestir(i, k, j) { hi.material.color.set(H[i]).lerp(new THREE.Color(H[j]), k); },
  };
}
/* el verde de la hierba de las orillas en cada estación (el suelo lo usa al repintarse) */
export const VERDE = ['#a3c070', '#aebb6c', '#a6b86a', '#9cbc6a'];
