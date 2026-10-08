/* ============================================================
   amsterdam/valle
   Ámsterdam en 3D (Época 9), el tablero B del replanteo visual (2026-10-04, «los canales como gradas», elegido por el
   usuario en juego3d/bocetos/amsterdam.html): el centro del anillo en la esquina del fondo, en la orilla del IJ, con la
   casa consistorial en el foco; los tres canales cruzan el tablero de lado a lado frente a la cámara, cada uno con su
   muelle angosto, su muro de ladrillo y sus olmos en tramos cortos; cuatro calles los cruzan con sus puentes; UNA fila
   de casas de De Keyser por canal (alternadas: izquierda, derecha, izquierda); la muralla de tierra con el baluarte que
   apunta a la cámara, el foso del Singelgracht y, detrás, los pólderes con sus tulipanes. Menos franjas que la maqueta:
   el muelle es una vereda delante de las casas y no una banda a cada lado de cada canal, la tierra entre canales es
   ancha y se rompe en jardines grandes, y el Damrak no entra (corría pegado al Herengracht). Y menos todavía (2026-10-05,
   «que no se vea rayado»): los canales sin el borde claro a cada lado (la orilla la dibuja el muro de ladrillo), una
   sola hilera de olmos por canal, la muralla toda de pasto y una acequia cada tres parcelas. En invierno el agua se hiela.
   La geometría es la del motor (09g-amsterdam, espejada en lugares.js).
   ============================================================ */
import * as THREE from 'three';
import { azar, PAL } from '../kit.js';
import * as MON from './monumentos.js';
import * as L from './lugares.js';

export const E0 = 2, E1 = 18, LADO = E1 - E0, CENTRO = 10;
export const NIVEL = -0.07;
const HONDO = -0.24, A2 = L.ANCHO_GRACHT / 2, QUAI = 0.3, DEP = 0.75, GR = L.GRADO;
export const RESERVAS = [];
export const reservado = (x, z, m = 0) => RESERVAS.some(r => r.r ? Math.hypot(x - r.x, z - r.z) < r.r + m : x > r.x0 - m && x < r.x1 + m && z > r.z0 - m && z < r.z1 + m);

const ss = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
const hash2 = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };
const ruido = (x, z, f) => { const X = x * f, Z = z * f, i = Math.floor(X), j = Math.floor(Z), u = ss(X - i), v = ss(Z - j), a = hash2(i, j), b = hash2(i + 1, j), c = hash2(i, j + 1), d = hash2(i + 1, j + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };

/* ---------- el baluarte: la planta de monumentos.js, agrandada, en la muralla, con la punta hacia la cámara ---------- */
export const BASTION = { x: L.MOLINO.x, z: L.MOLINO.y, rot: Math.PI / 4, esc: 1.2 };
function enPoligono(x, z, P) { let d = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, zi] = P[i], [xj, zj] = P[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) d = !d; } return d; }
export function enBaluarte(x, z, f = 1) {
  const b = BASTION, dx = x - b.x, dz = z - b.z, lx = dx * Math.cos(b.rot) - dz * Math.sin(b.rot), lz = dx * Math.sin(b.rot) + dz * Math.cos(b.rot);
  return enPoligono(lx / (f * b.esc), lz / (f * b.esc), MON.BALUARTE);
}
/* lo local del baluarte (x a lo ancho, z hacia la punta) en el mundo */
export const enBastion = (lx, lz) => { const b = BASTION, c = Math.cos(b.rot), s = Math.sin(b.rot); return { x: b.x + lx * c + lz * s, z: b.z - lx * s + lz * c }; };

/* ---------- los puentes: uno en cada calle que cruza un canal (el Prinsengracht no lleva el de la calle del norte, que daría al borde) ---------- */
export const PUENTES = [];
for (const g of L.GRACHTEN) for (const p of L.PUENTES) {
  if (g === L.GRACHTEN[2] && p > 60 * GR) continue;
  const q = L.polar(g, p / GR); if (q.x < 2.3 || q.x > 17.7 || q.y > 17.7) continue;
  PUENTES.push({ x: q.x, z: q.y, g, p, rot: Math.atan2(Math.cos(p), Math.sin(p)), levadizo: g === L.GRACHTEN[1] && Math.abs(p - 31 * GR) < 1e-6 });
}
export const PUENTE_FOSO = (() => { const q = L.polar((L.FOSO[0] + L.FOSO[1]) / 2, L.PUENTE_FOSO / GR); return { x: q.x, z: q.y, rot: Math.atan2(Math.cos(L.PUENTE_FOSO), Math.sin(L.PUENTE_FOSO)) }; })();
/* ¿(x, z) está sobre el tablero de un puente? (para caminar sobre el agua por ahí) */
export const hayPuente = (x, z) => { const r = L.radio(x, z), a = L.angulo(x, z); return PUENTES.some(b => Math.abs(r - b.g) < A2 + 0.14 && Math.abs(a - b.p) * r < 0.2); };

/* ---------- el agua y el relieve ---------- */
const canal = (x, z, r = L.radio(x, z)) => z > L.IJ.z1 && L.GRACHTEN.some(g => Math.abs(r - g) < A2);
const foso = (x, z, r = L.radio(x, z)) => z > L.IJ.z1 && !enBaluarte(x, z) && ((r > L.FOSO[0] && r < L.FOSO[1]) || (enBaluarte(x, z, 1.34) && r > 16.7));
export const enMuro = (x, z) => { const r = L.radio(x, z); return z > L.IJ.z1 && r > 16.15 && r < L.FOSO[0] && !enBaluarte(x, z); };
export const fuera = (x, z) => z > L.IJ.z1 && L.radio(x, z) > L.FOSO[1] - 0.02 && !enBaluarte(x, z, 1.34);
export const DAM_RECT = { x0: 2.35, x1: 9.6, z0: 7.62, z1: 9.65 };
export const enDam = (x, z) => x > DAM_RECT.x0 && x < DAM_RECT.x1 && z > DAM_RECT.z0 && z < DAM_RECT.z1 && L.radio(x, z) < L.GRACHTEN[0] - A2 - 0.1;
export function altura(x, z) {
  if (z < L.IJ.z1) return z > L.IJ.z1 - 0.05 ? -0.05 : -0.3;              // el IJ, con el muelle a pique
  const r = L.radio(x, z);
  if (canal(x, z, r)) return HONDO;                                       // los canales, entre muros de ladrillo
  if (foso(x, z, r)) return -0.22;                                        // el foso, con su talud de pasto
  if (enBaluarte(x, z)) return 0;                                         // el baluarte: lo pone su malla
  if (r > 16.15 && r < 16.85) return 0.38 * ss(1 - Math.abs(r - 16.5) / 0.35);   // la muralla de tierra
  return 0;
}

/* ---------- las casas: UNA fila de De Keyser por canal, en su orilla de adentro, mirando al agua (y a la cámara) ---------- */
export const FILAS = [{ g: 0, a0: 56, a1: 84, semilla: 1 }, { g: 1, a0: 13, a1: 29.5, semilla: 3 }, { g: 2, a0: 72, a1: 86.5, semilla: 2 }];
export const CASAS = (() => {
  const out = [], lista = MON.FILAS[MON.VARIANTES.casas] || MON.FILAS.keyser;
  for (const f of FILAS) {
    const g = L.GRACHTEN[f.g], rc = g - A2 - QUAI - DEP / 2;
    let a = f.a0 * GR, i = f.semilla;
    while (a < f.a1 * GR) {
      const op = lista[i % lista.length], da = (op.w + 0.03) / rc, am = a + da / 2;
      if (am + da / 2 > f.a1 * GR) break;
      if (L.PUENTES.some(p => Math.abs(am - p) * rc < op.w / 2 + 0.36)) { a += 0.05 / rc; continue; }   // la calle del puente queda abierta
      const p = L.polar(rc, am / GR);
      out.push({ x: p.x, z: p.y, rot: Math.atan2(Math.cos(am), Math.sin(am)), w: op.w, op: { ...op, d: DEP, semilla: i } });
      a += da; i++;
    }
  }
  return out;
})();
/* ¿(x, z) cae dentro de una casa (agrandada m)? Las casas van giradas a lo largo del arco: se mide en su marco */
export const enCasa = (x, z, m = 0) => CASAS.some(c => { const dx = x - c.x, dz = z - c.z, s = Math.sin(c.rot), co = Math.cos(c.rot), lx = dx * co - dz * s, lz = dx * s + dz * co; return Math.abs(lx) < c.w / 2 + m && Math.abs(lz) < DEP / 2 + m; });
const enVereda = (x, z, r, a) => FILAS.some(f => { const g = L.GRACHTEN[f.g]; return r > g - A2 - QUAI - 0.02 && r < g - A2 && a > f.a0 * GR - 0.012 && a < f.a1 * GR + 0.012; });   // el muelle delante de cada fila
const ANCLAS = [L.PRENSA, L.TIPOS, L.ESCUELA, L.ORBIS, L.ATLAS, L.AULA];

/* ---------- el suelo: cada triángulo con su zona; el año lo repinta ---------- */
const PALETA = {   // por estación: primavera, verano, otoño, invierno (la nieve se suma aparte)
  jardin: [['#b6d87e', '#acd173', '#c0de8a'], ['#b2d06c', '#a8c962', '#bcd879'], ['#d4c47c', '#cab76c', '#ddce8e'], ['#cfcfb8', '#c8c8b0', '#d6d6c0']],
  polder: [['#a9d26a', '#9fc962', '#b3d978'], ['#b8d064', '#acc65a', '#c2da72'], ['#cfb86e', '#c1a65e', '#d8c480'], ['#cdd0b8', '#c4c8b0', '#d4d6c0']],
  muralla: [['#9ec962', '#94c05a'], ['#a6c75c', '#9cbd54'], ['#beb466', '#b2a75a'], ['#c8cab4', '#c0c2ac']],
};
const FIJO = {
  tierra: ['#e7d6b1', '#e2d0a9'], muelle: ['#eadcbb', '#e5d6b3'], calle: ['#e4d0ac', '#dec9a4'], plaza: ['#f2eadb', '#ece3d0'],
  dam: ['#f0e8d7', '#e6dcc7'],
};
const TULIPAN = ['#e0383f', '#f3c43c', '#f7f0f1', '#e56b9e'];
export function suelo(K) {
  const RES = 8, N = LADO * RES, s = 1 / RES, pos = [], zona = [], var_ = [];
  const v = (x, z) => [x, altura(x, z), z];
  const clasificar = (x, z, h) => {
    const r = L.radio(x, z), a = L.angulo(x, z), t = Math.abs(Math.floor(x * 2) * 7 + Math.floor(z * 2) * 13);
    if (h <= HONDO + 0.03) return ['fondo', 0];
    if (h < -0.02) return [z < L.IJ.z1 + 0.02 ? 'muroIJ' : foso(x, z, r) || r > 16.6 ? 'talud' : 'muro', 0];
    if (h > 0.02 && r > 16.1) return ['muralla', h > 0.3 ? 0 : 1];   // la muralla de tierra: el talud y el camino de ronda, todo pasto (menos franjas)
    if (fuera(x, z)) {   // los pólderes: parcelas largas; pocas acequias; al frente, los campos de tulipanes de un color cada uno
      const fz = z / 1.2, fila = Math.floor(fz), borde = fz - fila, col = Math.floor(x / 1.45);
      if (fila % 3 === 0 && borde < 0.09) return ['acequia', 0];
      if (x + z > 29.4) return ['tulipan', ((col + fila * 3) % 4 + 4) % 4];
      return ['polder', ((col + fila) % 3 + 3) % 3];
    }
    if (enBaluarte(x, z)) return ['polder', 0];
    if (enDam(x, z) || (x > L.STADHUIS.x - MON.SV.W / 2 - 0.3 && x < 9.1 && z > L.IJ.z1 && z < L.STADHUIS.y + MON.SV.D / 2 + 0.2)) return ['dam', (Math.floor(x * 4) + Math.floor(z * 4)) % 2];
    for (const q of ANCLAS) if (Math.hypot(x - q.x, z - q.y) < 0.95) return ['plaza', t % 2];
    if (z < L.IJ.z1 + 0.42) return ['muelle', (Math.floor(x * 5) + Math.floor(z * 5)) % 2];      // el muelle del IJ
    if (enVereda(x, z, r, a)) return ['muelle', (Math.floor(x * 5) + Math.floor(z * 5)) % 2];
    if (r > L.GRACHTEN[0] - A2 - 0.6 && r < 16.15 && L.PUENTES.some(p => Math.abs(a - p) * r < 0.22)) return ['calle', t % 2];   // las calles de los puentes
    const n = ruido(x, z, 0.45) * 0.75 + ruido(x + 31, z - 17, 1.6) * 0.25;
    return n > 0.4 ? ['jardin', Math.floor(hash2(Math.floor(x * 3), Math.floor(z * 3)) * 3)] : ['tierra', t % 2];
  };
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s;
    for (const tri of [[v(x0, z0), v(x0, z1), v(x1, z0)], [v(x1, z0), v(x0, z1), v(x1, z1)]]) {
      for (const q of tri) pos.push(q[0], q[1], q[2]);
      const [zn, k] = clasificar((tri[0][0] + tri[1][0] + tri[2][0]) / 3, (tri[0][2] + tri[1][2] + tri[2][2]) / 3, (tri[0][1] + tri[1][1] + tri[2][1]) / 3);
      zona.push(zn); var_.push(k);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const col = new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3); geo.setAttribute('color', col);
  geo.computeVertexNormals(); geo.userData.propia = true;
  const c = new THREE.Color(), c2 = new THREE.Color(), nv = new THREE.Color('#f3f5f6');
  const NIEVE = { jardin: 0.88, polder: 0.92, muralla: 0.88, tierra: 0.75, muelle: 0.55, calle: 0.6, plaza: 0.5, dam: 0.5, tulipan: 0.92, talud: 0.6 };
  const pintar = ({ i = 0, j = 1, k = 0, nieve = 0 } = {}) => {
    const est = (zn, vr) => { const A = PALETA[zn][i], B = PALETA[zn][j]; c.set(A[vr % A.length]); if (k > 0) c.lerp(c2.set(B[vr % B.length]), k); };
    for (let t = 0; t < zona.length; t++) {
      const zn = zona[t], vr = var_[t];
      if (zn === 'jardin' || zn === 'polder' || zn === 'muralla') est(zn, vr);
      else if (zn === 'tulipan') { const tul = q => q === 0 ? TULIPAN[vr] : q === 1 ? PALETA.polder[1][vr % 3] : q === 2 ? '#bda06a' : PALETA.polder[3][vr % 3]; c.set(tul(i)); if (k > 0) c.lerp(c2.set(tul(j)), k); }
      else if (zn === 'acequia') c.set('#7fc0dc').lerp(c2.set('#e2eef2'), Math.min(1, nieve * 1.3));
      else if (zn === 'muro') c.set('#b06a4c');
      else if (zn === 'muroIJ') c.set('#a8805e');
      else if (zn === 'talud') c.set(PALETA.muralla[i][0]).lerp(c2.set('#8aa860'), 0.4);
      else if (zn === 'fondo') c.set('#5e8790');
      else c.set(FIJO[zn][vr % 2]);
      if (nieve && NIEVE[zn]) c.lerp(nv, nieve * NIEVE[zn]);
      for (let q = 0; q < 3; q++) col.setXYZ(t * 3 + q, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  };
  pintar();
  const m = K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false });
  m.userData.suelo = true; m.userData.pintar = pintar; m.userData.vivo = true;
  return m;
}

/* ---------- el agua: el IJ, los canales y el foso, azul de verdad y más clara en las orillas; en invierno, hielo ---------- */
export function agua(K, vivos) {
  const g = new THREE.Group(), RES = 8, s = 1 / RES, pos = [], prof = [], orilla = [];
  const seco = (x, z) => altura(x, z) > NIVEL - 0.004;
  for (let i = 0; i < LADO * RES; i++) for (let j = 0; j < LADO * RES; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s;
    const hs = [altura(x0, z0), altura(x1, z0), altura(x0, z1), altura(x1, z1)];
    if (Math.min(...hs) > NIVEL - 0.004) continue;
    for (const [x, z, h] of [[x0, z0, hs[0]], [x0, z1, hs[2]], [x1, z0, hs[1]], [x1, z0, hs[1]], [x0, z1, hs[2]], [x1, z1, hs[3]]]) {
      pos.push(x, 0, z); prof.push(z < L.IJ.z1 ? Math.min(1, (L.IJ.z1 - z) / 0.9) : 0.4);
      let n = 0; for (const [dx, dz] of [[0.18, 0], [-0.18, 0], [0, 0.18], [0, -0.18]]) if (seco(x + dx, z + dz)) n++;
      orilla.push(Math.min(1, n * 0.35 + (seco(x, z) ? 0.3 : 0)));
    }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const col = new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3); geo.setAttribute('color', col);
  geo.computeVertexNormals(); geo.userData.propia = true;
  const c = new THREE.Color(), c2 = new THREE.Color(), cl = new THREE.Color(MON.AMB.aguaL), hielo = new THREE.Color('#ddecf2');
  const pintar = kh => {
    for (let i = 0; i < prof.length; i++) {
      c.set(MON.AMB.agua).lerp(c2.set(MON.AMB.aguaD), prof[i]).lerp(cl, orilla[i] * 0.8);
      if (kh) c.lerp(hielo, kh * 0.88);
      col.setXYZ(i, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  };
  pintar(0);
  const mat = K.mat('#ffffff', { vertexColors: true, transparent: true, opacity: 0.93 });
  const rio = new THREE.Mesh(geo, mat); rio.receiveShadow = true; rio.position.y = NIVEL; rio.userData.vivo = true;
  g.add(rio);
  const onda = new THREE.PlaneGeometry(0.36, 0.022); onda.userData.propia = true;
  const olas = [], rr = azar(1648);
  for (let k = 0; k < 80 && olas.length < 22; k++) {   // las olitas del IJ, y unas pocas en los canales
    const enIJ = olas.length < 15, x = E0 + 0.3 + rr() * (LADO - 0.6), z = enIJ ? E0 + 0.2 + rr() * (L.IJ.z1 - E0 - 0.5) : E0 + rr() * LADO;
    if (!enIJ && !(canal(x, z) && canal(x + 0.3, z) && canal(x - 0.1, z))) continue;
    const m = new THREE.Mesh(onda, new THREE.MeshBasicMaterial({ color: '#f2fafc', transparent: true, opacity: 0.35, depthWrite: false })); m.rotation.x = -Math.PI / 2; g.add(m);
    olas.push({ m, x, z, f: rr(), d: enIJ ? 0.6 : 0.2 });
  }
  let helado = 0;
  vivos.push(t => olas.forEach(o => { const f = (t * 0.06 + o.f) % 1; o.m.position.set(o.x + f * o.d, rio.position.y + 0.006, o.z); o.m.material.opacity = helado > 0.5 ? 0 : 0.34 * Math.sin(Math.PI * f); }));
  return { g, rio, helar(kh) { if (Math.abs(kh - helado) < 0.02) return; helado = kh; pintar(kh); } };
}

/* ---------- la losa del diorama: el corte con el agua del IJ y de los canales asomando, y los pilotes en la turba ---------- */
export function losa(K) {
  const g = new THREE.Group();
  const pared = (fijo, eje) => {
    const pos = [], col = [], c = new THREE.Color(), paso = 0.125;
    const quad = (p0, p1, p2, p3, color) => { c.set(color); for (const p of [p0, p1, p2, p0, p2, p3]) { pos.push(...p); col.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, P = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const xa = eje === 'x' ? fijo : u, za = eje === 'x' ? u : fijo, xb = eje === 'x' ? fijo : u1, zb = eje === 'x' ? u1 : fijo;
      const h0 = altura(xa, za), h1 = altura(xb, zb);
      quad(P(u, h0), P(u1, h1), P(u1, Math.min(h1, 0) - 0.1), P(u, Math.min(h0, 0) - 0.1), h0 < -0.03 ? '#6a7a6a' : '#cdb088');
      quad(P(u, Math.min(h0, 0) - 0.1), P(u1, Math.min(h1, 0) - 0.1), P(u1, -0.46), P(u, -0.46), PAL.corte1);
      quad(P(u, -0.46), P(u1, -0.46), P(u1, -1.05), P(u, -1.05), PAL.corte2);
      if (h0 < NIVEL || h1 < NIVEL) quad(P(u, NIVEL), P(u1, NIVEL), P(u1, Math.min(NIVEL, h1)), P(u, Math.min(NIVEL, h0)), MON.AMB.aguaD);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals(); geo.userData.propia = true;
    const m = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide })); m.receiveShadow = false; return m;
  };
  g.add(pared(E1, 'x'), pared(E1, 'z'));
  const caja = (w, h, d, x, y, z, color) => { const m = K.malla(K.caja(w, h, d), color, { grosor: 0.03, sombra: false, recibe: false }); m.position.set(x, y, z); g.add(m); };
  caja(LADO, 0.46, 0.06, CENTRO, -0.23, E0 + 0.03, PAL.corte1); caja(0.06, 0.46, LADO, E0 + 0.03, -0.23, CENTRO, PAL.corte1);
  caja(LADO - 0.02, 0.6, LADO - 0.02, CENTRO, -0.76, CENTRO, PAL.corte2);
  const r = azar(1658);
  for (let i = 0; i < 18; i++) {                        // los pilotes de madera clavados en el barro (la ciudad entera está sobre pilotes) y la turba
    const izq = r() < 0.5, s = E0 + 0.4 + r() * (LADO - 0.8);
    if (i % 2) { const p = K.malla(K.cilindro(0.025, 0.025, 0.5, 5), '#6a5236', { sinTinta: true, sombra: false, recibe: false }); if (izq) p.position.set(s, -0.5, E1 + 0.01); else p.position.set(E1 + 0.01, -0.5, s); g.add(p); }
    else { const p = K.malla(K.roca(0.05 + r() * 0.05, 170 + i), '#4a3a2a', { sinTinta: true, sombra: false, recibe: false }); p.scale.set(1.4, 0.8, 1.4); if (izq) p.position.set(s, -(0.3 + r() * 0.6), E1 + 0.005); else p.position.set(E1 + 0.005, -(0.3 + r() * 0.6), s); g.add(p); }
  }
  return g;
}

/* ---------- las casas de los canales ---------- */
export function casas(K) {
  const g = new THREE.Group(), puestas = []; g.userData.puestas = puestas;
  CASAS.forEach((q, i) => { const c = MON.casaCanal(K, q.op); c.position.set(q.x, 0, q.z); c.rotation.y = q.rot; g.add(c); puestas.push([q.x, q.z, q.w, i]); });
  return g;
}

/* ---------- los puentes de ladrillo (el del Keizersgracht en la calle del medio, levadizo) y el del foso ---------- */
export function puentes(K) {
  const g = new THREE.Group();
  for (const b of PUENTES) { const o = MON.puente(K, L.ANCHO_GRACHT + 0.3, 0.4, { levadizo: b.levadizo }); o.position.set(b.x, 0, b.z); o.rotation.y = b.rot; g.add(o); }
  const pf = MON.puente(K, L.FOSO[1] - L.FOSO[0] + 0.4, 0.4); pf.position.set(PUENTE_FOSO.x, 0, PUENTE_FOSO.z); pf.rotation.y = PUENTE_FOSO.rot; g.add(pf);
  return g;
}

/* ---------- lo que crece: los olmos en tramos cortos sobre los muelles y en bosquecillos, los árboles de los pólderes y los tulipanes ---------- */
const BOSQUES = [{ x: 15.8, z: 17.3, n: 5, s: 0.5 }, { x: 17.3, z: 14.5, n: 4, s: 0.45 }, { x: 12.2, z: 17.4, n: 4, s: 0.45 }, { x: 9.6, z: 5.4, n: 3, s: 0.4 }, { x: 12.0, z: 7.4, n: 3, s: 0.4 },
  { x: 7.0, z: 12.0, n: 3, s: 0.4 }, { x: 16.9, z: 7.4, n: 3, s: 0.4 }, { x: 4.3, z: 14.0, n: 4, s: 0.45 }, { x: 2.9, z: 16.9, n: 4, s: 0.45 }, { x: 15.6, z: 13.9, n: 3, s: 0.4 }];
export function vegetacion(K) {
  const g = new THREE.Group(), r = azar(1638), arb = [];
  const pon = (x, z, hh) => {
    if (x < E0 + 0.25 || x > E1 - 0.25 || z < E0 + 0.25 || z > E1 - 0.25) return;
    if (altura(x, z) < -0.02 || enDam(x, z) || reservado(x, z, 0.05) || enCasa(x, z, 0.12) || enBaluarte(x, z, 1.05) || hayPuente(x, z)) return;
    const a = L.angulo(x, z), rr = L.radio(x, z);
    if (rr > L.GRACHTEN[0] - 1 && rr < 16.2 && L.PUENTES.some(p => Math.abs(a - p) * rr < 0.34)) return;   // las calles de los puentes, despejadas
    if (arb.some(q => Math.hypot(q[0] - x, q[1] - z) < 0.42)) return;
    arb.push([x, z, hh]);
  };
  for (const gr of L.GRACHTEN) for (const lado of [1]) {   // los olmos del muelle: tramos cortos, con huecos, en la orilla de afuera (una hilera por canal: menos franjas)
    const rq = gr + lado * (A2 + 0.17);
    for (let a = 0.02; a < Math.PI / 2; a += 0.6 / rq) if (Math.floor(a * rq / 1.7 + gr + (lado > 0 ? 0.5 : 0)) % 3 === 0) { const p = L.polar(rq, a / GR); if (p.y > L.IJ.z1 + 0.4) pon(p.x, p.y, 0.72 + r() * 0.16); }
  }
  for (const b of BOSQUES) for (let k = 0; k < b.n * 4 && k < 40; k++) { const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * (0.35 + b.n * b.s * 0.22); pon(b.x + Math.cos(a) * rr, b.z + Math.sin(a) * rr, 0.8 + r() * 0.3); }
  for (let k = 0; k < 300; k++) { const x = E0 + 0.3 + r() * (LADO - 0.6), z = E0 + 0.3 + r() * (LADO - 0.6); if (fuera(x, z) && x + z < 29.2 && r() < 0.35) pon(x, z, 0.62 + r() * 0.2); }   // sueltos en los pólderes
  const n = arb.length, m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3();
  const troncos = K.instancias(K.cilindro(0.025, 0.036, 1, 6), MON.AMB.tronco, n, { grosor: 0.002 });
  const copas = [MON.AMB.hoja, MON.AMB.hojaL].map(cl => K.instancias(K.esfera(1, 0.42), cl, n, { grosor: 0.006 }));
  arb.forEach(([x, z, hh], i) => {
    const y0 = Math.max(0, altura(x, z));
    m4.compose(v3.set(x, y0 + hh * 0.3, z), q4.identity(), s3.set(1, hh * 0.6, 1)); troncos.setMatrixAt(i, m4);
    [[0, 0.74, 0, 0.28], [0.1, 0.62, 0.05, 0.22]].forEach(([dx, dy, dz, rr], k) => { m4.compose(v3.set(x + dx * hh * (i % 2 ? 1 : -1), y0 + dy * hh, z + dz * hh), q4.identity(), s3.set(rr * hh, rr * hh * 0.86, rr * hh)); copas[(k + i) % 2].setMatrixAt(i, m4); });   // la copa en dos bultos
  });
  g.add(troncos, ...copas);
  g.userData.arboles = arb;
  /* los tulipanes en los campos del frente, en hileras del color de su campo (solo se ven en primavera) */
  const tul = [[], [], [], []];
  for (let x = E0 + 0.2; x < E1 - 0.15; x += 0.13) for (let z = 9; z < E1 - 0.15; z += 0.15) {
    if (!fuera(x, z) || x + z < 29.6 || altura(x, z) < 0) continue;
    const fz = z / 1.2, fila = Math.floor(fz), borde = fz - fila; if (borde < 0.14 || borde > 0.94) continue;
    tul[((Math.floor(x / 1.45) + fila * 3) % 4 + 4) % 4].push([x + (hash2(x * 9, z * 7) - 0.5) * 0.05, z]);
  }
  const tulipanes = TULIPAN.map((cl, j) => { const f = tul[j]; const im = K.instancias(K.esfera(1, 0.4), cl, Math.max(1, f.length), { sinTinta: true }); f.forEach(([x, z], i) => { m4.compose(v3.set(x, 0.045, z), q4.identity(), s3.set(0.032, 0.04, 0.032)); im.setMatrixAt(i, m4); }); return im; });
  g.add(...tulipanes);
  const C = [['#8cc35a', '#a6d36c'], ['#6fa34a', '#8dbd5c'], ['#d9a441', '#c77f38'], ['#b3a898', '#a49a8a']];   // verde nuevo, verde, oro, ramas desnudas
  const ca = new THREE.Color(), cb = new THREE.Color();
  return {
    g,
    vestir(i, k, j) {
      copas.forEach((m, q) => m.material.color.copy(ca.set(C[i][q]).lerp(cb.set(C[j][q]), k)));
      const t = i === 0 ? 1 - k : j === 0 ? k : 0; tulipanes.forEach(m => { m.visible = t > 0.05; m.scale.set(1, Math.max(0.05, t), 1); });
    },
  };
}
