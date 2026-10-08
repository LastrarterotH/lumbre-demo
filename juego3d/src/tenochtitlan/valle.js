/* ============================================================
   tenochtitlan/valle
   La isla entera en 3D (Época 7; la maqueta A de juego3d/bocetos/tenochtitlan.html): la isla llena el tablero y el lago de
   Texcoco es su borde turquesa, con sus tulares y su orilla de arena; el piso estucado del recinto, las calles claras que
   salen de sus puertas hacia las calzadas, el canal que cruza la ciudad y la plaza del barrio de las escuelas; las franjas de
   las chinampas en los dos flancos, con sus ahuejotes en hilera y su maíz; la tierra firme del fondo, con sus pinos, al pie
   del Popocatépetl (que humea) y de la Iztaccíhuatl (la mujer dormida). Tres barrios de casas, uno por idioma: el de la gente
   común (macehualtin), el de los principales (pipiltin) y los jacales de la chinampa. El año sube y baja el lago, verdea y
   dora las chinampas; la losa del diorama muestra el lago en el corte.
   La geometría es la del motor (09e-tenochtitlan, espejada en lugares.js); los volcanes y lo que crece, de la maqueta.
   ============================================================ */
import * as THREE from 'three';
import { azar, PAL, fundir } from '../kit.js';
import * as MON from './monumentos.js';
import * as L from './lugares.js';
import * as MQ from './maqueta.js';
import { huellasDe } from '../caminos.js';

export const E0 = 2, E1 = 18, LADO = E1 - E0, CENTRO = 10;
export const NIVEL_LAGO = -0.06;

export const RESERVAS = [];
export const reservado = (x, z, m = 0) => RESERVAS.some(r => r.r ? Math.hypot(x - r.x, z - r.z) < r.r + m : x > r.x0 - m && x < r.x1 + m && z > r.z0 - m && z < r.z1 + m);
export const enRecinto = (x, z, m = 0) => x > L.RECINTO.x0 - m && x < L.RECINTO.x1 + m && z > L.RECINTO.y0 - m && z < L.RECINTO.y1 + m;

/* las calles estucadas que salen de las tres puertas del recinto hacia sus calzadas, y la plaza del barrio de las escuelas */
export const CALLES = [{ x0: 8.38, x1: 8.82, y0: 11.25, y1: 16.9 }, { x0: 12.45, x1: 16.9, y0: 7.78, y1: 8.22 }, { x0: 8.38, x1: 8.82, y0: 4.3, y1: 4.75 }];
export const PLAZA = { x0: 11.55, x1: 14.2, y0: 12.45, y1: 14.1 };
/* los tres barrios: [variante, x, z, giro] (la maqueta A) */
export const BARRIOS = [['macehual', 14.85, 15.2, Math.PI], ['pilli', 9.95, 15.3, Math.PI / 2], ['chinampa', 14.75, 5.75, Math.PI / 2]];
/* los ahuehuetes, en bosquecillos: delante del muro del recinto, detrás de la casa del canto, junto a la casa de la partera */
export const AHUEHUETES = [[4.95, 11.62, 1.0], [5.75, 11.68, 0.7], [11.75, 16.35, 0.85], [12.45, 16.55, 0.7], [16.5, 14.28, 0.75], [7.95, 16.2, 0.75], [10.95, 11.62, 0.7]];

const ss = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
const ruido = (x, z) => Math.sin(x * 2.3 + z * 0.7) * 0.5 + Math.sin(z * 1.9 - x * 1.3) * 0.5;
const enRect = (x, z, r, m = 0) => x > r.x0 - m && x < r.x1 + m && z > r.y0 - m && z < r.y1 + m;

/* ---------- las zonas: la isla dibujada tiene el borde algo desparejo; lo demás es la geometría del motor ---------- */
export const enIslaD = (x, z) => L.enIsla(x + 0.14 * ruido(x * 1.7, z), z + 0.14 * ruido(z * 1.3, x));
export function zona(x, z) {
  if (MQ.enOrilla(x, z)) return 'orilla';
  if (!enIslaD(x, z)) return L.enCalzada(x, z) ? 'calzada' : 'lago';
  if (enRecinto(x, z)) return 'recinto';
  if (Math.abs(z - L.CANAL.y) < L.CANAL.a && x < L.CANAL.x1) return 'canal';
  if (CALLES.some(c => enRect(x, z, c))) return 'calle';
  if (enRect(x, z, L.CHINAMPAS) || enRect(x, z, L.CHINAMPAS2)) return L.enChinampa(x, z) ? 'chinampa' : 'canal';
  if (enRect(x, z, PLAZA)) return 'plaza';
  return 'isla';
}
const ALT = { lago: -0.32, canal: -0.26, isla: 0, recinto: 0.02, plaza: 0.01, calle: 0.01, calzada: 0.035, chinampa: 0.014 };
export function altura(x, z) { const k = zona(x, z); return k === 'orilla' ? MQ.altOrilla(x, z) : ALT[k]; }
/* ¿se camina? la isla sí; el agua, la tierra firme del fondo y el canal no (salvo por sus puentes) */
export const seCamina = (x, z) => { const k = zona(x, z); return k !== 'orilla' && k !== 'lago' && k !== 'canal' || (k === 'canal' && L.enPuente(x, z)); };

/* ---------- el suelo: la malla de alturas, pintada por zona; el año la repinta ---------- */
const COL = {
  isla: ['#e6d5ab', '#e1cfa3', '#eadab2', '#dccb9d', '#e4d3a8'], calle: ['#efe6d0', '#eae0c8'], plaza: ['#f0e6cf', '#ebe0c6', '#f3eadb'],
  recinto: ['#f3ede0', '#ece5d4'], calzada: ['#e6dabd', '#ddd0b0'], orilla: ['#adc26c', '#a2ba63', '#b6c875'], fondo: '#5d8f88', arena: '#dcc791',
};
/* las chinampas por estación: verdes en las lluvias, doradas en la cosecha, más pálidas en las secas */
const CHIN = [['#98ba5e', '#8cb052', '#a2c266'], ['#aab65e', '#9fac54', '#b4be68'], ['#7fb04a', '#74a640', '#88b852'], ['#c2b25a', '#b6a650', '#ccbc66']];
const ORI = ['#a8bf68', '#b4bc66', '#94bc5c', '#b0b862'];
export function suelo(K) {
  const RES = 7, N = LADO * RES, s = 1 / RES, H = new Float32Array((N + 1) * (N + 1));
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) H[i * (N + 1) + j] = altura(E0 + i * s, E0 + j * s);
  const pos = [], tris = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s;
    const h00 = H[i * (N + 1) + j], h10 = H[(i + 1) * (N + 1) + j], h01 = H[i * (N + 1) + j + 1], h11 = H[(i + 1) * (N + 1) + j + 1];
    for (const [a, b, d] of [[[x0, h00, z0], [x0, h01, z1], [x1, h10, z0]], [[x1, h10, z0], [x0, h01, z1], [x1, h11, z1]]]) {
      const cx = (a[0] + b[0] + d[0]) / 3, cz = (a[2] + b[2] + d[2]) / 3, ch = (a[1] + b[1] + d[1]) / 3;
      tris.push(cx, cz, ch, zona(cx, cz));
      for (const q of [a, b, d]) pos.push(q[0], q[1], q[2]);
    }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const col = new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3); geo.setAttribute('color', col);
  geo.computeVertexNormals(); geo.userData.propia = true;
  const c = new THREE.Color(), c2 = new THREE.Color(), verde = new THREE.Color('#6f9a52');
  /* pal: { campo (los cinco tonos de la estación del motor), i (la estación), k (cuánto va hacia la siguiente), j (la siguiente) } */
  const pintar = pal => {
    const campo = pal.campo || ['#c9c08e'], i = pal.i ?? 0, j = pal.j ?? i, k = pal.k || 0;
    const chin = CHIN[i].map((h, n) => new THREE.Color(h).lerp(new THREE.Color(CHIN[j][n]), k));
    const ori = new THREE.Color(ORI[i]).lerp(new THREE.Color(ORI[j]), k);
    for (let t = 0; t < tris.length / 4; t++) {
      const x = tris[4 * t], z = tris[4 * t + 1], h = tris[4 * t + 2], zn = tris[4 * t + 3];
      if (h < -0.005 && h > -0.14) c.set(COL.arena);                                     // la orilla de arena, apenas sobre el agua
      else if (h <= -0.14) c.set(COL.fondo);
      else if (zn === 'recinto') c.set(COL.recinto[(Math.floor(x * 2.5) + Math.floor(z * 2.5)) % 2]);   // las losas estucadas
      else if (zn === 'chinampa') c.copy(chin[Math.abs(Math.floor(x * 1.25) * 3 + Math.floor(z * 1.25) * 7) % 3]);
      else if (zn === 'orilla') { c.set(COL.orilla[Math.abs(Math.floor(x * 2) * 7 + Math.floor(z * 2) * 13) % 3]).lerp(ori, 0.45).lerp(verde, ss((h - 0.12) / 0.2) * 0.6); }
      else { const tt = COL[zn] || COL.isla; c.set(tt[Math.abs(Math.floor(x * 2) * 7 + Math.floor(z * 2) * 13) % tt.length]); if (zn === 'isla') c.lerp(c2.set(campo[Math.abs(Math.floor(x) * 7 + Math.floor(z) * 13) % campo.length]), 0.18); }
      for (let q = 0; q < 3; q++) col.setXYZ(t * 3 + q, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  };
  pintar({});
  const m = K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false });
  m.userData.suelo = true; m.userData.pintar = pintar; m.userData.vivo = true;
  return m;
}

/* ---------- el agua del lago: una lámina turquesa con sus ondas, que se mueven despacio; el año la sube y la baja ---------- */
export function agua(K, vivos) {
  const g = new THREE.Group();
  const t = document.createElement('canvas'); t.width = t.height = 128; const c = t.getContext('2d');
  c.fillStyle = '#63bdb3'; c.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 16; i++) { const y = (i * 37) % 128, xx = (i * 53) % 128; c.strokeStyle = i % 2 ? 'rgba(255,255,255,.42)' : 'rgba(30,120,115,.28)'; c.lineWidth = 2; c.beginPath(); c.moveTo(xx, y); c.quadraticCurveTo(xx + 10, y - 4, xx + 20, y); c.stroke(); }
  const tex = new THREE.CanvasTexture(t); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(LADO / 1.7, LADO / 1.7); tex.userData.propia = true;
  const lago = new THREE.Mesh(new THREE.PlaneGeometry(LADO, LADO), K.matMapa(tex)); lago.geometry.userData.propia = true; lago.rotation.x = -Math.PI / 2; lago.position.set(CENTRO, NIVEL_LAGO, CENTRO); lago.receiveShadow = true; lago.userData.vivo = true;
  g.add(lago);
  vivos.push(tt => { tex.offset.set((tt * 0.012) % 1, (tt * 0.007) % 1); });
  return { g, lago };
}

/* ---------- la losa del diorama: el corte de tierra con el lago asomando ---------- */
export function losa(K) {
  const g = new THREE.Group();
  const pared = (fijo, eje) => {
    const pos = [], col = [], c = new THREE.Color(), paso = 0.125;
    const quad = (p0, p1, p2, p3, color) => { c.set(color); for (const p of [p0, p1, p2, p0, p2, p3]) { pos.push(...p); col.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, P = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const h0 = eje === 'x' ? altura(fijo - 0.01, u) : altura(u, fijo - 0.01), h1 = eje === 'x' ? altura(fijo - 0.01, u1) : altura(u1, fijo - 0.01), t0 = Math.min(h0, 0.05), t1 = Math.min(h1, 0.05);
      quad(P(u, t0), P(u1, t1), P(u1, t1 - 0.1), P(u, t0 - 0.1), t0 < -0.03 ? '#6a6248' : '#c9b98e');
      quad(P(u, t0 - 0.1), P(u1, t1 - 0.1), P(u1, -0.46), P(u, -0.46), PAL.corte1);
      quad(P(u, -0.46), P(u1, -0.46), P(u1, -1.05), P(u, -1.05), PAL.corte2);
      if (h0 < NIVEL_LAGO || h1 < NIVEL_LAGO) quad(P(u, NIVEL_LAGO), P(u1, NIVEL_LAGO), P(u1, Math.min(NIVEL_LAGO, t1)), P(u, Math.min(NIVEL_LAGO, t0)), '#3f8f8c');
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals(); geo.userData.propia = true;
    const m = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide })); m.receiveShadow = false; return m;
  };
  g.add(pared(E1, 'x'), pared(E1, 'z'));
  const caja = (w, h, d, x, y, z, color) => { const m = K.malla(K.caja(w, h, d), color, { grosor: 0.03, sombra: false, recibe: false }); m.position.set(x, y, z); g.add(m); };
  caja(LADO, 0.46, 0.06, CENTRO, -0.23, E0 + 0.03, PAL.corte1); caja(0.06, 0.46, LADO, E0 + 0.03, -0.23, CENTRO, PAL.corte1);
  caja(LADO - 0.02, 0.6, LADO - 0.02, CENTRO, -0.76, CENTRO, PAL.corte2);
  const r = azar(2707);
  for (let i = 0; i < 18; i++) {                        // piedritas, obsidiana y tiestos de tezontle en el corte
    const izq = r() < 0.5, s = E0 + 0.4 + r() * (LADO - 0.8), y = -(0.3 + r() * 0.65), rr = 0.05 + r() * 0.06;
    const p = K.malla(K.roca(rr, 140 + i), i % 3 ? PAL.piedrita : i % 2 ? '#2a2a30' : MON.TE.tezontle, { sinTinta: true, sombra: false, recibe: false }); p.scale.set(1.4, 0.8, 1.4);
    if (izq) p.position.set(s, y, E1 + 0.005); else p.position.set(E1 + 0.005, y, s);
    g.add(p);
  }
  return g;
}

/* ---------- los volcanes del fondo: el Popocatépetl (que humea) y la Iztaccíhuatl ---------- */
export function volcanes(K) {
  const popo = MQ.popocatepetl(K), iz = MQ.iztaccihuatl(K);
  const humo = popo.children.find(o => o.userData.humo);
  if (humo) popo.remove(humo);
  fundir(K, popo, 0.01);
  const g = new THREE.Group(); g.add(popo, iz);
  if (humo) g.add(humo);
  return { g, humo };
}

/* ---------- los tres barrios, la casa de la partera y los puentes; su huella para el paso ---------- */
export function barrios(K) {
  const g = new THREE.Group(), huellas = [];
  for (const [v, x, z, ry] of BARRIOS) {
    const b = MON.barrio(K, v, { suelo: v !== 'chinampa' }); b.position.set(x, v === 'chinampa' ? ALT.chinampa : 0, z); b.rotation.y = ry; g.add(b);
    b.updateMatrixWorld(true); huellas.push(...huellasDe(b, 0.06));
  }
  /* la casa de la partera: estucada, con su franja roja y la manta de la puerta */
  const pa = MON.casaMacehual(K, { w: 0.66, d: 0.54, h: 0.64, estuco: true, banda: true, rodapie: true, manta: '#b8352f', ventana: true }); pa.position.set(L.PARTERA.x + 0.02, 0, L.PARTERA.y - 0.38); g.add(pa);
  pa.updateMatrixWorld(true); huellas.push(...huellasDe(pa, 0.06));
  g.userData.huellas = huellas;
  return g;
}
/* el puente de vigas sobre el canal: se quitaban, y el agua seguía pasando */
export function puentes(K) {
  const g = new THREE.Group();
  for (const p of L.PUENTES) {
    const b = new THREE.Group(), w = p.w, d = 0.62, n = Math.floor(d / 0.11);
    b.add(K.malla(K.caja(w, 0.05, d), MON.TE.madera, { grosor: 0.004 }));
    for (let k = 0; k < n; k++) { const l = K.malla(K.caja(w + 0.004, 0.054, 0.012), MON.TE.maderaD, { sinTinta: true }); l.position.z = -d / 2 + 0.06 + k * 0.11; b.add(l); }
    [-1, 1].forEach(s => { const ba = K.malla(K.caja(0.035, 0.1, d), MON.TE.maderaD, { grosor: 0.002 }); ba.position.set(s * (w / 2 - 0.02), 0.07, 0); b.add(ba); });   // los barandales
    b.position.set(p.x, 0.03, p.y); g.add(b);
  }
  return g;
}

/* ---------- lo que crece: los pinos de la tierra firme, los ahuejotes en hilera, el maíz de las chinampas, los tulares y los ahuehuetes ---------- */
export function vegetacion(K, vivos) {
  const g = new THREE.Group(), r = azar(5151);
  g.add(MQ.pinos(K, zona, altura));
  const tul = MQ.tulares(K, zona, altura); tul.material = tul.material.clone(); g.add(tul);
  /* los ahuejotes por los bordes de las chinampas (fuera de lo reservado: los jacales y el telpochcalli de la chinampa) */
  const rr = c => [c.x0, c.x1, c.y0, c.y1];
  const ahue = [...MQ.bordes(rr(L.CHINAMPAS), 'x', 0.8, 0.62, 3), ...MQ.bordes(rr(L.CHINAMPAS2), 'z', 0.8, 0.62, 4)].filter(([x, z]) => enIslaD(x, z) && L.enIsla(x, z, -0.2) && !reservado(x, z, 0.08));
  g.add(MQ.ahuejotes(K, ahue));
  /* el maíz de las chinampas, en hileras sobre las franjas de tierra */
  const maiz = [];
  for (let x = E0; x < E1; x += 0.13) for (let z = E0; z < E1; z += 0.15) {
    if (!L.enChinampa(x, z) || !L.enChinampa(x + 0.1, z + 0.1) || !L.enChinampa(x - 0.1, z - 0.1) || reservado(x, z, 0.06) || r() < 0.25) continue;
    if (ahue.some(([a, b]) => Math.abs(a - x) < 0.12 && Math.abs(b - z) < 0.12)) continue;
    maiz.push([x + (r() - 0.5) * 0.04, z + (r() - 0.5) * 0.04, r()]);
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  const mz = K.instancias(K.cono(0.035, 1, 4), '#7a9a42', maiz.length, { sinTinta: true }); mz.material = mz.material.clone();
  maiz.forEach(([x, z, k], i) => { const h = 0.2 + k * 0.1; q.setFromEuler(e.set((k - 0.5) * 0.2, k * 6, (k - 0.5) * 0.2)); m4.compose(v.set(x, ALT.chinampa + h / 2, z), q, s.set(1, h, 1)); mz.setMatrixAt(i, m4); });
  g.add(mz);
  /* los ahuehuetes, los árboles viejos del valle */
  const viejos = new THREE.Group();
  AHUEHUETES.forEach(([x, z, sc], i) => { const a = MON.ahuehuete(K, sc, i + 1); a.position.set(x, 0, z); a.rotation.y = i * 1.3; viejos.add(a); });
  fundir(K, viejos, 0.01); g.add(viejos);
  return {
    g, maiz: mz,
    vestir(i, k, j) {                                   // el maíz y los tulares: verdes en las lluvias, dorados en la cosecha; los ahuejotes, siempre verdes
      const M = ['#8a9a52', '#a09a58', '#6f9a3e', '#c9a85a'], T = ['#8a9e52', '#a8a262', '#6f9a44', '#a69a56'];
      mz.material.color.set(M[i]).lerp(new THREE.Color(M[j]), k); tul.material.color.set(T[i]).lerp(new THREE.Color(T[j]), k);
    },
  };
}
