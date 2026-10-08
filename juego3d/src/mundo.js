/* ============================================================
   mundo
   El valle del fogón como diorama: la losa de tierra flotando, la estepa, la playa y la laguna, la
   cueva, el fogón, la choza, los árboles, el mamut y el clan. La grilla del juego 2D (x, y) es aquí
   el suelo (x, z): una celda mide una unidad y la losa va de la arista 2 a la 18, como en 2D.
   ============================================================ */
import * as THREE from 'three';
import { PAL, azar, fundir } from './kit.js';
import { crearGente, ELENCO } from './gente.js';
import { crearMamut } from './mamut.js';

/* La losa jugable es la del juego 2D: de la arista 2 a la 18 (el rombo de 16 × 16), centro en (10, 10). */
export const E0 = 2, E1 = 18, LADO = E1 - E0, CENTRO = 10;
export const FOGON  = { x: 6.5, y: 9.5 };
export const CUEVA  = { x: 9.9, y: 5.4, mira: -0.29 };          // la boca mira al campamento
export const PLAYA  = { x: 15.0, y: 14.5, rx: 2.9, ry: 2.4 };
export const LAGUNA = { x: 14.88, y: 14.48, rx: 1.55, ry: 1.25 };
export const CHOZA  = { x: 4.7, y: 5.8 };
export const HUESO  = { x: 5.3, y: 8.4 };
export const TAMBOR = { x: 7.7, y: 10.4 };
export const MAMUT_CASA = { x: 13.0, y: 3.9 };
const SENDERO = [[[4, 16.5], [6, 13], [8, 10.2], [9.5, 8.7]], [[8, 10.2], [6.4, 9.4], [5.3, 9.9]]];

// [tipo, x, y, escala] con las posiciones de PROPS (19-render) y de 20-main; el árbol seco, corrido
// de (14,6; 6,6) a (15,2; 7,4) para dejar lugar al rastro del mamut (etapa 2 de la cacería)
export const ARBOLES = [
  ['redondo', 2.9, 11.5, 1.25], ['redondo', 16.6, 11.2, 0.9], ['redondo', 2.6, 6.5, 0.85], ['redondo', 16.5, 3.2, 0.95],
  ['pino', 15.7, 4.9, 1.15], ['pino', 16.6, 6.2, 0.8], ['seco', 15.2, 7.4, 1],
  ['arbusto', 2.6, 4.5, 1], ['arbusto', 16.4, 9.2, 1.1], ['arbusto', 10.2, 15.6, 1], ['arbusto', 9.9, 15.8, 0.9], ['arbusto', 2.6, 13.6, 0.8],
];
export const ROCAS = [[12.5, 15.8, 0.24], [3.3, 3.5, 0.22], [7.8, 15.5, 0.17], [3.3, 13.9, 0.36], [16.8, 8.7, 0.32]];   // la de (7,3; 14,9) se corrió a (7,8; 15,5): tapaba al aprendiz de Ossa (QA 2026-09-28)
const TRONCOS = [[4.0, 12.9, 0.18], [12.4, 5.6, -0.12]];

const RADS_LAGO = [1.0, 1.14, 0.92, 1.08, 0.86, 1.12, 0.95, 1.18, 0.9, 1.05]; // la silueta de la laguna 2D
function radioLaguna(a) {
  const u = ((a / (Math.PI * 2)) % 1 + 1) % 1 * 10, i = Math.floor(u), f = u - i, k = (1 - Math.cos(Math.PI * f)) / 2;
  return RADS_LAGO[i % 10] * (1 - k) + RADS_LAGO[(i + 1) % 10] * k;
}
function dLaguna(x, z) {
  const dx = (x - LAGUNA.x) / LAGUNA.rx, dz = (z - LAGUNA.y) / LAGUNA.ry;
  return Math.hypot(dx, dz) / radioLaguna(Math.atan2(dz, dx));
}
export const NIVEL_AGUA = -0.09;
export { dLaguna };
export function altura(x, z) {
  const d = dLaguna(x, z);
  if (d >= 1.2) return 0;
  const t = Math.min(1, (1.2 - d) / 0.62);
  return -0.36 * t * t * (3 - 2 * t);
}
function enPlaya(cx, cy) {
  const dx = (cx + 0.5 - PLAYA.x) / PLAYA.rx, dy = (cy + 0.5 - PLAYA.y) / PLAYA.ry;
  return dx * dx + dy * dy <= 1 + ((cx * 7 + cy * 13) % 3 - 1) * 0.12;
}
const colorCelda = (cx, cy, estepa = PAL.estepa, arena = PAL.arena) => {
  cx = Math.max(E0, Math.min(E1 - 1, cx)); cy = Math.max(E0, Math.min(E1 - 1, cy));
  return enPlaya(cx, cy) ? arena[(cx * 7 + cy * 13) % 5] : estepa[(cx * 7 + cy * 13) % 5];
};
const libre = (x, z, r = 0) =>
  Math.hypot(x - FOGON.x, z - FOGON.y) > 1.5 + r && Math.hypot(x - CUEVA.x, z - CUEVA.y) > 2.1 + r &&
  Math.hypot(x - CHOZA.x, z - CHOZA.y) > 0.9 + r && dLaguna(x, z) > 1.25;

/* ---------- el suelo y la losa ---------- */
export function suelo(K) {
  const RES = 3, N = LADO * RES, fondo = new THREE.Color('#8f8358'), c = new THREE.Color(), c2 = new THREE.Color();
  const hundir = (col, h) => h < NIVEL_AGUA + 0.02 ? col.lerp(fondo, Math.min(1, (NIVEL_AGUA + 0.02 - h) / 0.25) * 0.7) : col;
  let geo, pintar = () => {};
  if (K.E.suave) {                                 // arcilla: vértices compartidos y color que se funde entre celdas
    geo = new THREE.PlaneGeometry(LADO, LADO, N, N); geo.rotateX(-Math.PI / 2); geo.translate(CENTRO, 0, CENTRO);
    const p = geo.getAttribute('position'), col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), h = altura(x, z); p.setY(i, h);
      const fx = x - 0.5, fz = z - 0.5, cx = Math.floor(fx), cz = Math.floor(fz), u = fx - cx, v = fz - cz;
      c.set(colorCelda(cx, cz)).multiplyScalar((1 - u) * (1 - v))
        .add(c2.set(colorCelda(cx + 1, cz)).multiplyScalar(u * (1 - v)))
        .add(c2.set(colorCelda(cx, cz + 1)).multiplyScalar((1 - u) * v))
        .add(c2.set(colorCelda(cx + 1, cz + 1)).multiplyScalar(u * v));
      hundir(c, h).toArray(col, i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
  } else {                                          // maqueta y tinta: cada celda con su tono, sin mezclar
    const pos = [], celdas = [], hondo = [], s = 1 / RES;
    const tri = (a, b, d, cx, cz) => {
      for (const q of [a, b, d]) pos.push(q[0], q[1], q[2]);
      celdas.push(cx, cz); hondo.push((a[1] + b[1] + d[1]) / 3);
    };
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s, cx = Math.floor(x0 + s / 2), cz = Math.floor(z0 + s / 2);
      const v = (x, z) => [x, altura(x, z), z];
      tri(v(x0, z0), v(x0, z1), v(x1, z0), cx, cz); tri(v(x1, z0), v(x0, z1), v(x1, z1), cx, cz);
    }
    geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const col = new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3); geo.setAttribute('color', col);
    geo.computeVertexNormals();
    /* El suelo se vuelve a pintar con la estación: los cinco tonos de la estepa y la arena del año. */
    pintar = (estepa, arena) => {
      for (let t = 0; t < hondo.length; t++) {
        c.set(colorCelda(celdas[2 * t], celdas[2 * t + 1], estepa, arena)); hundir(c, hondo[t]);
        for (let k = 0; k < 3; k++) col.setXYZ(t * 3 + k, c.r, c.g, c.b);
      }
      col.needsUpdate = true;
    };
    pintar(PAL.estepa, PAL.arena);
  }
  const m = K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false });
  m.userData.suelo = true; m.userData.pintar = pintar; m.userData.vivo = true;   // se repinta con la estación: no se funde
  return m;
}

export function losa(K) {
  /* El pastel cortado: el cuerpo de tierra va por debajo del hueco de la laguna, y arriba solo hay
     paredes en el borde (una caja entera taparía el agua con su tapa). */
  const g = new THREE.Group(), T = 0.06;
  const caja = (w, h, d, x, y, z, color) => { const m = K.malla(K.caja(w, h, d), color, { grosor: 0.03, sombra: false, recibe: false }); m.position.set(x, y, z); g.add(m); };   // el corte de tierra no recibe sombras: las del valle caían sobre la pared
  const aro = (y0, y1, color) => {
    const h = y1 - y0, y = (y0 + y1) / 2;
    caja(LADO, h, T, CENTRO, y, E0 + T / 2, color); caja(LADO, h, T, CENTRO, y, E1 - T / 2, color);
    caja(T, h, LADO - 2 * T, E0 + T / 2, y, CENTRO, color); caja(T, h, LADO - 2 * T, E1 - T / 2, y, CENTRO, color);
  };
  aro(-0.14, -0.002, PAL.labio);
  aro(-0.45, -0.14, PAL.corte1);
  caja(LADO, 0.28, LADO, CENTRO, -0.59, CENTRO, PAL.corte1);
  caja(LADO - 0.04, 0.66, LADO - 0.04, CENTRO, -1.05, CENTRO, PAL.corte2);
  const r = azar(20260712);
  for (let i = 0; i < 18; i++) {                  // piedritas del corte, en las dos caras que se ven
    const izq = r() < 0.5, s = E0 + 0.4 + r() * (LADO - 0.8), y = -(0.28 + r() * 1.0), rr = 0.07 + r() * 0.07;
    const p = K.malla(K.roca(rr, 30 + i), y > -0.72 ? PAL.piedrita : PAL.piedritaD, { sinTinta: true, sombra: false, recibe: false });
    p.scale.set(1.4, 0.8, 1.4);
    if (izq) p.position.set(s, y, E1 - 0.01); else p.position.set(E1 - 0.01, y, s);
    g.add(p);
  }
  return g;
}

/* ---------- el sendero pisado: de la orilla a la boca de la cueva, con su ramal al fogón ---------- */
export function sendero(K) {
  const g = new THREE.Group(), r = azar(5150), pasos = [];
  for (const tramo of SENDERO) for (let i = 0; i < tramo.length - 1; i++) {
    const [a, b] = [tramo[i], tramo[i + 1]], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 3.2);
    for (let k = 0; k < n; k++) pasos.push([a[0] + (b[0] - a[0]) * k / n + (r() - 0.5) * 0.4, a[1] + (b[1] - a[1]) * k / n + (r() - 0.5) * 0.4, r() * 3]);
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), eje = new THREE.Vector3(0, 1, 0);
  const huellas = K.instancias(K.cilindro(0.16, 0.16, 0.01, 12), '#9c7d52', pasos.length, { sinTinta: true, sombra: false, transparent: true, opacity: 0.42, depthWrite: false });
  pasos.forEach(([x, z, a], i) => { q.setFromAxisAngle(eje, a); m4.compose(v.set(x, 0.006, z), q, s.set(1, 1, 0.55)); huellas.setMatrixAt(i, m4); });
  g.add(huellas);
  const piedritas = K.instancias(K.roca(0.05, 7), '#a8a396', pasos.length, { sinTinta: true, sombra: false });
  pasos.forEach(([x, z, a], i) => { q.setFromAxisAngle(eje, a * 2); m4.compose(v.set(x + Math.cos(a) * 0.3, 0.01, z + Math.sin(a) * 0.3), q, s.set(1, 0.6, 1)); piedritas.setMatrixAt(i, m4); });
  g.add(piedritas);
  return g;
}

/* ---------- la laguna ---------- */
export function laguna(K, vivos) {
  const g = new THREE.Group(), forma = new THREE.Shape(), n = 60;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2, r = 1.14 * radioLaguna(a);
    const x = Math.cos(a) * LAGUNA.rx * r, z = Math.sin(a) * LAGUNA.ry * r;
    i ? forma.lineTo(x, -z) : forma.moveTo(x, -z);     // en el plano de la forma, y = −z: al acostarla queda boca arriba
  }
  const geo = new THREE.ShapeGeometry(forma, 4); geo.rotateX(-Math.PI / 2);
  const matAgua = K.E.suave
    ? new THREE.MeshStandardMaterial({ color: PAL.agua, roughness: 0.12, metalness: 0.05, transparent: true, opacity: 0.8 })
    : K.mat(PAL.agua, { transparent: true, opacity: 0.8 });
  const agua = new THREE.Mesh(geo, matAgua); agua.position.set(LAGUNA.x, NIVEL_AGUA, LAGUNA.y); agua.receiveShadow = true;
  agua.userData.ficha = { titulo: 'La laguna', texto: 'aquí se pesca: un pequeño se sienta junto a quien ya sabe' };
  g.add(agua);
  const anillos = [[-0.6, 0.2], [0.7, -0.3], [0.1, 0.45]].map(([dx, dz], i) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.24, 28), new THREE.MeshBasicMaterial({ color: '#eef8fb', transparent: true, opacity: 0.5, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; g.add(m); return { m, fase: i * 1.3, x: LAGUNA.x + dx, z: LAGUNA.y + dz };
  });
  const peces = [0, 1, 2, 3].map(i => {
    const p = new THREE.Group(); p.userData.vivo = true;
    const cu = K.malla(K.esfera(0.12), '#5e93a6', { sombra: false, sinTinta: true }); cu.scale.set(0.45, 0.4, 1); p.add(cu);
    const co = K.malla(K.cono(0.08, 0.14, 4), '#5e93a6', { sombra: false, sinTinta: true }); co.rotation.x = Math.PI / 2; co.position.z = -0.15; co.scale.x = 0.3; p.add(co);
    g.add(p); return { p, fase: i * 1.6, r: 0.35 + (i % 2) * 0.35, v: 0.35 + i * 0.06 };
  });
  // piedras de la orilla y juncos (los fijos y los que se mecen del 2D)
  [[12.95, 13.25], [16.9, 15.9], [16.7, 12.9]].forEach(([x, z], i) => { const p = K.malla(K.roca(0.14, 80 + i), '#9b968a', { grosor: 0.018 }); p.position.set(x, 0.04, z); p.scale.set(1.2, 0.7, 1); g.add(p); });
  const junco = K.cilindro(0.018, 0.028, 0.5, 4), r = azar(77), juncos = [];
  [[13.3, 15.5], [16.5, 14.0], [13.45, 13.25], [15.7, 16.1], [16.75, 15.35], [12.95, 14.7], [17.1, 13.9], [13.0, 16.1], [15.4, 16.5]].forEach(([x, z]) => {
    const mata = new THREE.Group(); mata.userData.vivo = true; mata.position.set(x, altura(x, z), z); g.add(mata); juncos.push(mata);
    for (let k = 0; k < 3; k++) {
      const h = 0.7 + r() * 0.6, j = K.malla(junco, '#7d8b4a', { sinTinta: true });
      j.scale.y = h; j.position.set((r() - 0.5) * 0.16, 0.25 * h, (r() - 0.5) * 0.16); j.rotation.set((r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3); mata.add(j);
      if (k === 0) { const e = K.malla(K.capsula(0.035, 0.08), '#8a6f4d', { sinTinta: true }); e.position.set(j.position.x, 0.5 * h + 0.02, j.position.z); mata.add(e); }
    }
    fundir(K, mata);                                  // la mata se mece entera: sus juncos van en una sola malla
  });
  vivos.push(t => {
    anillos.forEach(a => {
      const c = ((t * 0.45 + a.fase) % 3) / 3;
      a.m.position.set(a.x, NIVEL_AGUA + 0.005, a.z); a.m.scale.setScalar(0.6 + c * 2.6); a.m.material.opacity = 0.45 * (1 - c);
    });
    peces.forEach((f, i) => {
      const a = t * f.v + f.fase;
      const periodo = [17, 21, 26, 31][i], c = (t + i * 5.3) % periodo, salto = c < 1.1 ? Math.sin(c / 1.1 * Math.PI) : 0;   // de tanto en tanto, uno salta (como en 2D)
      f.p.position.set(LAGUNA.x + Math.cos(a) * f.r * 1.3, NIVEL_AGUA - 0.1 + salto * 0.55, LAGUNA.y + Math.sin(a) * f.r);
      f.p.rotation.y = -a; f.p.rotation.x = salto ? -Math.cos(c / 1.1 * Math.PI) * 0.9 : 0;
      if (c < 1.3 && c > 1.1 && anillos[i % 3]) { const r = anillos[i % 3]; r.x = f.p.position.x; r.z = f.p.position.z; r.fase = -t * 0.45 % 3 + 3; }
    });
    juncos.forEach((m, i) => { m.rotation.z = 0.06 * Math.sin(t * 1.1 + i); m.rotation.x = 0.04 * Math.sin(t * 0.8 + i * 2); });
  });
  return g;
}

/* ---------- la cueva ---------- */
export function cueva(K) {
  const g = new THREE.Group(); g.position.set(CUEVA.x, 0, CUEVA.y); g.rotation.y = CUEVA.mira;
  const bloque = (r, s, x, y, z, sx, sy, sz, color = PAL.roca) => {
    const m = K.malla(K.roca(r, s), color, { grosor: 0.04 }); m.position.set(x, y, z); m.scale.set(sx, sy, sz); g.add(m); return m;
  };
  bloque(1.35, 1, 0, 0.5, -0.15, 1.15, 0.98, 1.0);
  bloque(0.95, 2, 1.15, 0.2, -0.65, 1, 0.9, 1, PAL.rocaD);
  bloque(0.78, 3, -1.1, 0.12, 0.3, 1.1, 0.8, 1);
  bloque(0.5, 4, 1.0, 0.05, 0.75, 1, 0.8, 1, PAL.rocaD);
  const musgo = K.malla(K.esfera(0.6), PAL.musgo, { grosor: 0.03 }); musgo.scale.set(1.1, 0.26, 0.9); musgo.position.set(-0.25, 1.72, -0.3); g.add(musgo);
  // la boca: un hueco oscuro que se abre hacia el campamento
  const boca = new THREE.Mesh(K.esfera(0.56), new THREE.MeshBasicMaterial({ color: PAL.boca }));
  boca.scale.set(1.0, 0.95, 0.45); boca.position.set(0.12, 0.22, 1.1); g.add(boca);
  const umbral = K.malla(K.roca(0.4, 5), PAL.rocaD, { grosor: 0.03 }); umbral.scale.set(1.8, 0.28, 0.7); umbral.position.set(0.12, 0.02, 1.32); g.add(umbral);
  // junto a la boca: la pila de leña y la lanza apoyada
  [[-0.7, 0.07, 1.25, 0.3], [-0.62, 0.07, 1.42, -0.2], [-0.66, 0.2, 1.33, 0.05]].forEach(([x, y, z, ry]) => {
    const l = K.malla(K.cilindro(0.06, 0.06, 0.5, 7), '#6e4d33', { grosor: 0.016 }); l.rotation.set(0, ry, Math.PI / 2); l.position.set(x, y, z); g.add(l);
  });
  const lanza = new THREE.Group(); lanza.position.set(-0.3, 0, 1.15); lanza.rotation.set(-0.25, 0, 0.35); g.add(lanza);
  const asta = K.malla(K.cilindro(0.02, 0.025, 1.3, 5), PAL.troncoL, { grosor: 0.012 }); asta.position.y = 0.65; lanza.add(asta);
  const punta = K.malla(K.cono(0.045, 0.14, 4), '#9aa4ac', { grosor: 0.012 }); punta.position.y = 1.36; lanza.add(punta);
  g.userData.ficha = { titulo: 'La cueva', texto: 'el refugio del clan; de noche, las historias' };
  return g;
}

/* ---------- el fogón, el hueso de conteo y el tambor ---------- */
const ASIENTOS = [[0.79, -0.6], [-0.88, -0.47], [-0.21, 0.98], [0.93, 0.36]].map(([dx, dz]) => ({ x: FOGON.x + dx, z: FOGON.y + dz }));
function fogon(K, vivos, luces) {
  const g = new THREE.Group(); g.position.set(FOGON.x, 0, FOGON.y);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2, p = K.malla(K.roca(0.12, 40 + i), i % 2 ? PAL.piedraL : PAL.piedraD, { grosor: 0.02 });
    p.position.set(Math.cos(a) * 0.5, 0.05, Math.sin(a) * 0.5); p.scale.set(1.1, 0.7, 1); g.add(p);
  }
  const ceniza = K.malla(K.cilindro(0.38, 0.4, 0.04, 14), '#4a3a30', { sinTinta: true, sombra: false }); ceniza.position.y = 0.02; g.add(ceniza);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4, l = K.malla(K.cilindro(0.05, 0.06, 0.58, 7), i ? '#6e4d33' : PAL.troncoD, { grosor: 0.018 });
    l.position.set(Math.cos(a) * 0.13, 0.19, Math.sin(a) * 0.13); l.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); g.add(l);
  }
  const llama = new THREE.Group(); llama.position.y = 0.1; g.add(llama);
  const lenguas = [[0.22, 0.66, '#e86a2e', 0, 0], [0.16, 0.58, '#f6a23c', 0.08, 0.05], [0.13, 0.46, '#f6a23c', -0.08, -0.04], [0.09, 0.34, '#f8dc8c', 0, 0.02]].map(([r, h, c, x, z]) => {
    const m = K.malla(K.cono(r, h, 7), c, { emissive: c, emissiveIntensity: 0.9, sombra: false, grosor: 0.014 });
    m.position.set(x, h / 2, z); llama.add(m); return m;
  });
  // asientos: troncos cortos bajo quien se sienta, mirando al fuego
  ASIENTOS.forEach(a => {
    const t = K.malla(K.cilindro(0.1, 0.1, 0.46, 8), PAL.troncoL, { grosor: 0.016 });
    t.rotation.set(0, Math.atan2(a.x - FOGON.x, a.z - FOGON.y) + Math.PI / 2, Math.PI / 2); t.position.set(a.x - FOGON.x, 0.1, a.z - FOGON.y); g.add(t);
  });
  const chispas = Array.from({ length: 10 }, (_, i) => {
    const m = new THREE.Mesh(K.esfera(0.022), new THREE.MeshBasicMaterial({ color: '#ffd27a' })); g.add(m); return { m, f: i / 10 };
  });
  const humo = Array.from({ length: 6 }, (_, i) => {
    const m = new THREE.Mesh(K.esfera(0.2), new THREE.MeshLambertMaterial({ color: '#efe9df', transparent: true, opacity: 0.4, depthWrite: false, flatShading: !!K.E.flat }));
    g.add(m); return { m, f: i / 6 };
  });
  const luz = new THREE.PointLight('#ffa552', 3, 11, 1.6); luz.position.set(FOGON.x, 0.8, FOGON.y);
  luz.shadow.mapSize.set(512, 512); luz.shadow.bias = -0.004; luz.shadow.radius = 3; luz.shadow.camera.near = 0.2;
  luces.fuego = luz;
  g.userData.ficha = { titulo: 'El fogón', texto: 'donde el clan se junta: aquí empieza todo' };
  vivos.push((t, dt, hora) => {
    lenguas.forEach((m, i) => { const k = Math.sin(t * (9 + i * 2.3) + i) * 0.5 + Math.sin(t * 5.7 + i * 3) * 0.5; m.scale.set(1 + 0.1 * k, 1 + 0.22 * k, 1 + 0.1 * k); m.rotation.y = t * (0.6 + i * 0.2); });
    luz.intensity = luces.fuegoBase * (0.88 + 0.12 * Math.sin(t * 13) * Math.sin(t * 7.3));
    chispas.forEach(c => { const u = (t * 0.55 + c.f) % 1; c.m.position.set(Math.sin(c.f * 40 + u * 3) * 0.25 * u, 0.3 + u * 1.5, Math.cos(c.f * 31 + u * 2) * 0.25 * u); c.m.scale.setScalar(1 - u); });
    humo.forEach(h => { const u = (t * 0.12 + h.f) % 1; h.m.position.set(0.3 * u + 0.1 * Math.sin(t + h.f * 9), 0.85 + u * 3, -0.25 * u); h.m.scale.setScalar(0.5 + u * 2); h.m.material.opacity = 0.32 * Math.sin(Math.PI * u) * (hora === 'noche' ? 0.5 : 1); });
  });
  return g;
}
function hueso(K) {
  const g = new THREE.Group(); g.position.set(HUESO.x, 0, HUESO.y);
  const losa = K.malla(K.roca(0.3, 90), PAL.piedraL, { grosor: 0.02 }); losa.scale.set(1.3, 0.42, 1); losa.position.y = 0.1; g.add(losa);
  const hg = new THREE.Group(); hg.position.y = 0.25; hg.rotation.y = Math.PI / 4 - 0.25; g.add(hg);   // el hueso, en diagonal sobre la losa
  const h = K.malla(K.capsula(0.045, 0.34), '#efe8d4', { grosor: 0.014 }); h.rotation.z = Math.PI / 2; hg.add(h);
  for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(K.caja(0.014, 0.02, 0.1), K.mat('#6b4a2a')); m.position.set(-0.12 + i * 0.06, 0.04, 0); hg.add(m); }
  [[-0.38, 0.2], [-0.42, 0.02], [-0.3, -0.12]].forEach(([x, z], i) => { const p = K.malla(K.roca(0.05, 95 + i), '#8f8a7c', { sinTinta: true }); p.position.set(x, 0.03, z); g.add(p); });
  g.userData.ficha = { titulo: 'El hueso de conteo', texto: 'cada cuenta pendiente se talla como una muesca' };
  return g;
}
function tambor(K) {
  const g = new THREE.Group(); g.position.set(TAMBOR.x, 0, TAMBOR.y);
  const c = K.malla(K.cilindro(0.16, 0.17, 0.3, 12), '#6e4d33'); c.position.y = 0.15; g.add(c);
  const parche = K.malla(K.cilindro(0.155, 0.155, 0.02, 12), '#d9b98a', { grosor: 0.012 }); parche.position.y = 0.31; g.add(parche);
  const banda = K.malla(K.toro(0.168, 0.018), '#a24e30', { sinTinta: true }); banda.rotation.x = Math.PI / 2; banda.position.y = 0.18; g.add(banda);
  const baq = K.malla(K.cilindro(0.015, 0.02, 0.36, 5), '#8a6f4d', { grosor: 0.01 }); baq.rotation.set(0, 0.6, Math.PI / 2); baq.position.set(0.12, 0.02, 0.22); g.add(baq);
  g.userData.ficha = { titulo: 'El tambor', texto: 'marca el ritmo: acorta la formación' };
  return g;
}

/* ---------- la choza (del asentamiento: muro de adobe y techo de paja) ---------- */
function choza(K) {
  const g = new THREE.Group(); g.position.set(CHOZA.x, 0, CHOZA.y);
  const muro = K.malla(K.cilindro(0.4, 0.43, 0.42, 14), '#b98a5c'); muro.position.y = 0.21; g.add(muro);
  const pie = K.malla(K.cilindro(0.45, 0.46, 0.06, 14), '#946c47', { sinTinta: true }); pie.position.y = 0.03; g.add(pie);
  const techo = K.malla(K.cono(0.64, 0.72, 14), '#cba64f'); techo.position.y = 0.42 + 0.36; g.add(techo);
  const alero = K.malla(K.toro(0.56, 0.035), '#b38d3b', { sinTinta: true }); alero.rotation.x = Math.PI / 2; alero.position.y = 0.5; g.add(alero);
  const remate = K.malla(K.cono(0.11, 0.2, 8), '#9c7a34', { grosor: 0.012 }); remate.position.y = 1.18; g.add(remate);
  const puerta = new THREE.Mesh(K.esfera(0.16), new THREE.MeshBasicMaterial({ color: '#3a2a1c' }));
  puerta.scale.set(0.9, 1.35, 0.35); puerta.position.set(0.29, 0.16, 0.29); puerta.rotation.y = Math.PI / 4; g.add(puerta);
  g.userData.ficha = { titulo: 'La choza', texto: 'el primer techo propio, fuera de la cueva' };
  return g;
}

/* ---------- árboles, rocas, pasto y flores ---------- */
export function arbol(K, [tipo, x, z, s]) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s * 0.72);
  const copas = [], capas = [];
  if (tipo === 'redondo') {
    const t = K.malla(K.cilindro(0.11, 0.16, 1.3, 7), PAL.troncoL); t.position.y = 0.65; g.add(t);
    [[0.78, PAL.copaD, 0, 1.55, 0], [0.62, PAL.copaM, 0.1, 2.15, 0.05], [0.42, PAL.copaL, -0.05, 2.65, 0.08]].forEach(([r, c, dx, y, dz]) => {
      const m = K.malla(K.esfera(r), c); m.position.set(dx, y, dz); m.userData.vivo = true; g.add(m); copas.push(m);
    });
    for (let i = 0; i < 7; i++) {                  // los brotes: rosados en primavera, dorados en verano…
      const a = i * 2.4, y = 1.5 + (i % 3) * 0.5, r = 0.8 - (i % 3) * 0.18;
      const b = K.malla(K.esfera(0.06), '#f2b8d0', { sinTinta: true, sombra: false }); b.position.set(Math.cos(a) * r * 0.85, y, Math.sin(a) * r * 0.85); b.userData.brote = true; g.add(b);
    }
    const nv = K.malla(K.esfera(0.4), '#f4f8f7', { grosor: 0.02 }); nv.scale.set(1, 0.4, 1); nv.position.set(-0.05, 2.9, 0.08); nv.visible = false; nv.userData.vivo = true; g.add(nv); capas.push(nv);
  } else if (tipo === 'pino') {
    const t = K.malla(K.cilindro(0.1, 0.14, 0.7, 6), PAL.troncoD); t.position.y = 0.35; g.add(t);
    [[0.85, 1.2, 1.0, '#5c8c41'], [0.66, 1.0, 1.65, '#7fae5a'], [0.45, 0.85, 2.25, '#5c8c41']].forEach(([r, h, y, c]) => {
      const m = K.malla(K.cono(r, h, 8), c); m.position.y = y; g.add(m);
    });
    [[0.6, 1.25], [0.46, 1.85], [0.3, 2.45]].forEach(([r, y]) => { const nv = K.malla(K.cono(r, 0.32, 8), '#f4f8f7', { grosor: 0.015 }); nv.position.y = y + 0.1; nv.visible = false; nv.userData.vivo = true; g.add(nv); capas.push(nv); });
  } else if (tipo === 'seco') {
    const t = K.malla(K.cilindro(0.07, 0.12, 1.6, 6), '#6a5748'); t.position.y = 0.8; g.add(t);
    const nido = new THREE.Mesh(K.esfera(0.06), new THREE.MeshBasicMaterial({ color: '#2a201a' })); nido.scale.set(1, 1.4, 0.4); nido.position.set(0.02, 1.0, 0.1); g.add(nido);
    [[0.6, 1.2, 0.7], [-0.7, 1.35, -0.4], [0.35, 1.5, -1.0]].forEach(([rz, y, ry]) => {
      const r = new THREE.Group(); r.position.y = y; r.rotation.set(0, ry, rz); g.add(r);
      const m = K.malla(K.cilindro(0.025, 0.045, 0.7, 5), '#6a5748'); m.position.y = 0.35; r.add(m);
    });
  } else {
    [[0.34, 0, 0.22, 0], [0.26, 0.28, 0.16, 0.1], [0.22, -0.2, 0.14, 0.18]].forEach(([r, dx, y, dz], i) => {
      const m = K.malla(K.esfera(r), i ? PAL.copaM : PAL.copaD); m.position.set(dx, y, dz); g.add(m);
    });
    if ((x * 7 + z) % 2 < 1) for (let i = 0; i < 5; i++) { const b = K.malla(K.esfera(0.045), '#c94f43', { sinTinta: true, sombra: false }); b.position.set(Math.cos(i * 1.3) * 0.26, 0.2 + (i % 3) * 0.08, Math.sin(i * 1.3) * 0.26 + 0.1); g.add(b); }
  }
  g.userData.copas = copas; g.userData.capas = capas;
  g.userData.ficha = tipo === 'arbusto' ? { titulo: 'Arbusto', texto: 'bayas, cuando es la estación' } : { titulo: tipo === 'pino' ? 'Pino' : tipo === 'seco' ? 'Árbol seco' : 'Árbol', texto: tipo === 'seco' ? 'leña, y un nido en el hueco' : 'leña y sombra' };
  return g;
}

export function menudo(K, excluir = () => false) {
  const g = new THREE.Group(), r = azar(4242), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
  const alAzar = () => [E0 + 0.3 + r() * (LADO - 0.6), E0 + 0.3 + r() * (LADO - 0.6)];
  // manchas de pradera: el verde más hondo que da vida a la estepa
  const nM = 14, manchas = K.instancias(K.cilindro(1, 1, 0.01, 16), '#55772f', nM, { sinTinta: true, sombra: false, transparent: true, opacity: 0.12, depthWrite: false });
  for (let i = 0; i < nM;) { const [x, z] = alAzar(); if (!libre(x, z, -0.4) || excluir(x, z)) continue; m4.compose(v.set(x, 0.004, z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * 3), s.set(0.6 + r() * 0.6, 1, 0.3 + r() * 0.3)); manchas.setMatrixAt(i++, m4); }
  g.add(manchas);
  // pasto
  const nP = 180, pasto = K.instancias(K.cono(0.055, 0.28, 4), '#93974f', nP, { sinTinta: true, sombra: false }); g.userData.pasto = pasto;
  let k = 0;
  while (k < nP) {
    const [x, z] = alAzar();
    if (!libre(x, z, 0.1) || excluir(x, z)) continue;
    const enArena = enPlaya(Math.floor(x), Math.floor(z));
    for (let j = 0; j < 3 && k < nP; j++, k++) {
      e.set((r() - 0.5) * 0.7, r() * 3, (r() - 0.5) * 0.7); q.setFromEuler(e);
      const h = (enArena ? 0.6 : 0.8) + r() * 0.7;
      m4.compose(v.set(x + (r() - 0.5) * 0.18, 0.12 * h, z + (r() - 0.5) * 0.18), q, s.set(1, h, 1)); pasto.setMatrixAt(k, m4);
    }
  }
  g.add(pasto);
  // flores
  PAL.flor.forEach(c => {
    const n = 12, f = K.instancias(K.esfera(0.05), c, n, { sinTinta: true, sombra: false });
    for (let i = 0; i < n;) {
      const [x, z] = alAzar();
      if (!libre(x, z) || excluir(x, z) || enPlaya(Math.floor(x), Math.floor(z))) continue;
      m4.compose(v.set(x, 0.06, z), q.identity(), s.set(1, 0.7, 1)); f.setMatrixAt(i++, m4);
    }
    g.add(f);
  });
  // rocas, troncos caídos y el tocón
  ROCAS.forEach(([x, z, rr], i) => { const m = K.malla(K.roca(rr, 60 + i), i % 2 ? PAL.piedraL : PAL.piedraD, { grosor: 0.02 }); m.position.set(x, rr * 0.35, z); m.scale.set(1.25, 0.7, 1); g.add(m); });
  TRONCOS.forEach(([x, z, ry], i) => {
    const t = new THREE.Group(); t.position.set(x, 0.1, z); t.rotation.y = -Math.PI / 4 + ry; g.add(t);
    const l = K.malla(K.cilindro(0.1, 0.11, 0.62, 8), '#6e4d33', { grosor: 0.018 }); l.rotation.z = Math.PI / 2; t.add(l);
    const mu = K.malla(K.esfera(0.08), PAL.musgo, { sinTinta: true }); mu.scale.set(1.6, 0.5, 1); mu.position.set(0.05, 0.09, 0); t.add(mu);
    const ho = K.malla(K.esfera(0.05), '#c98a4a', { sinTinta: true }); ho.scale.set(1, 0.5, 1); ho.position.set(-0.2, 0.04, 0.1); t.add(ho);
  });
  const tocon = K.malla(K.cilindro(0.13, 0.15, 0.18, 9), '#7a5636', { grosor: 0.016 }); tocon.position.set(11.1, 0.09, 14.9); g.add(tocon);
  const corte = K.malla(K.cilindro(0.125, 0.125, 0.01, 9), '#d9b98a', { sinTinta: true }); corte.position.set(11.1, 0.185, 14.9); g.add(corte);
  return g;
}

/* ---------- las nubes ---------- */
/* Las nubes van en el cielo (y 12-13,5): tapan poco del valle y su sombra lo cruza. */
export function nubes(K, vivos) {
  const g = new THREE.Group(), mat = K.mat('#f6f2eb');   // opaca: así cada nube se funde en una malla
  const lista = [[2, 12.5, 1, 0.9], [11, 13.5, 5, 1.2], [20, 12, 12, 0.85]].map(([x, y, z, s], i) => {
    const n = new THREE.Group(); n.scale.setScalar(s); n.userData.vivo = true;
    [[0, 0, 0, 1], [0.95, -0.15, 0.2, 0.75], [-0.9, -0.2, -0.1, 0.7], [0.3, 0.45, -0.1, 0.7], [-0.35, 0.3, 0.3, 0.6]].forEach(([dx, dy, dz, r]) => {
      const m = K.malla(K.esfera(r), mat, { recibe: false, grosor: 0.03 }); m.position.set(dx, dy, dz); m.scale.y = 0.72; n.add(m);
    });
    fundir(K, n);                                   // cada nube, una sola malla
    n.position.set(x, y, z); g.add(n); return { n, x0: x, z0: z, v: 0.16 + i * 0.05 };
  });
  vivos.push(t => lista.forEach(c => {
    const u = ((c.x0 + 6 + t * c.v) % 30) - 6;
    c.n.position.x = u; c.n.position.z = c.z0 + (u - c.x0) * 0.3;
  }));
  return { g, mat };
}

/* ---------- lo que cae con la estación: pétalos, vilanos, hojas o nieve ---------- */
export function cayendo(K, vivos) {
  const n = 70, mat = K.matMapa(null, { color: '#f2b8d0' }), m = new THREE.InstancedMesh(K.caja(0.07, 0.012, 0.05), mat, n), r = azar(88);
  m.frustumCulled = false;
  const ps = Array.from({ length: n }, () => ({ x: E0 + r() * LADO, y: r() * 6, z: E0 + r() * LADO, f: r() * 9, v: 0.3 + r() * 0.4 }));
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
  const api = { obj: m, tipo: 0, ver: 1 };
  vivos.push((t, dt) => {
    const nieve = api.tipo === 3, vilano = api.tipo === 1;
    const cuantos = Math.round(n * api.ver * (nieve ? 1 : vilano ? 0.35 : 0.6));
    for (let i = 0; i < n; i++) {
      const p = ps[i];
      p.y -= dt * (vilano ? -0.08 : nieve ? p.v * 0.8 : p.v) ; p.x += dt * (vilano ? 0.25 : 0.12) * Math.sin(t * 0.4 + p.f); p.z += dt * 0.1 * Math.cos(t * 0.3 + p.f);
      if (p.y < 0 || p.y > 6.5) { p.y = vilano ? 0.2 : 6; p.x = E0 + r() * LADO; p.z = E0 + r() * LADO; }
      e.set(t * 2 + p.f, t * 1.3 + p.f, nieve ? 0 : Math.sin(t * 3 + p.f)); q.setFromEuler(e);
      s.setScalar(i < cuantos ? (nieve ? 0.8 : 1) : 0);
      m4.compose(v.set(p.x, p.y, p.z), q, s); m.setMatrixAt(i, m4);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return api;
}

/* ---------- las luciérnagas ---------- */
export function luciernagas(vivos) {
  const g = new THREE.Group(), r = azar(9), lista = [];
  for (let i = 0; i < 16; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), new THREE.MeshBasicMaterial({ color: '#fff9c8', transparent: true }));
    const cerca = r() < 0.5, cx = cerca ? LAGUNA.x + (r() - 0.5) * 4 : 4.5 + r() * 12, cz = cerca ? LAGUNA.y - 1 + (r() - 0.5) * 3 : 5 + r() * 11;
    g.add(m); lista.push({ m, cx, cz, f: r() * 9 });
  }
  vivos.push(t => lista.forEach(l => {
    l.m.position.set(l.cx + 0.5 * Math.sin(t * 0.4 + l.f), 0.35 + 0.2 * Math.sin(t * 0.9 + l.f * 2), l.cz + 0.5 * Math.cos(t * 0.33 + l.f));
    l.m.material.opacity = Math.max(0, Math.sin(t * 1.7 + l.f * 3)) ** 2 * (g.userData.k ?? 1);
  }));
  return g;
}

/* ---------- el clan: a dónde va ---------- */
const PUNTOS = [[6, 13], [8, 10.2], [9.45, 8.75], [5.4, 10.9], [6.2, 11.2], [5.2, 13.6], [11, 8.6], [14.3, 9.6], [13.6, 12.5],
  [10.9, 13.4], [9, 15.6], [12, 15], [3.6, 7.2], [6.6, 7.2], [12, 7.4], [13.6, 8.4], [12.6, 9.4], [4, 12.4]];
const OBSTACULOS = [{ x: FOGON.x, z: FOGON.y, r: 1.45 }, { x: CUEVA.x, z: CUEVA.y, r: 2.0 }, { x: LAGUNA.x, z: LAGUNA.y, r: 2.0 }, { x: CHOZA.x, z: CHOZA.y, r: 0.85 }];
/* Una ruta que rodea lo que estorba: si el tramo recto pasa por encima de un obstáculo, se agrega un
   punto por fuera de él, del lado más corto. */
function ruta(o, d) {
  for (const ob of OBSTACULOS) {
    const ax = d.x - o.x, az = d.z - o.z, L2 = ax * ax + az * az || 1;
    const u = Math.max(0, Math.min(1, ((ob.x - o.x) * ax + (ob.z - o.z) * az) / L2));
    const px = o.x + ax * u - ob.x, pz = o.z + az * u - ob.z, dist = Math.hypot(px, pz);
    if (dist < ob.r && u > 0.05 && u < 0.95) {
      const n = dist > 0.01 ? [px / dist, pz / dist] : [-az / Math.sqrt(L2), ax / Math.sqrt(L2)];
      return [{ x: ob.x + n[0] * (ob.r + 0.25), z: ob.z + n[1] * (ob.r + 0.25) }, d];
    }
  }
  return [d];
}

function clan(K, tipo, vivos, piezas) {
  const g = new THREE.Group(), r = azar(31);
  const gente = ELENCO.map((d, i) => {
    const p = crearGente(K, tipo, d, i);
    const st = { andando: false, sentado: d.sienta !== undefined, espera: 1 + r() * 3, cola: [], vel: d.rol === 'aprendiz' ? 0.95 : 0.8 };
    if (st.sentado) {
      const a = ASIENTOS[d.sienta]; p.obj.position.set(a.x, 0, a.z);
      p.obj.rotation.y = Math.atan2(FOGON.x - a.x, FOGON.y - a.z);
    } else {
      const q = PUNTOS[(i * 5) % PUNTOS.length]; p.obj.position.set(q[0], 0, q[1]);
    }
    g.add(p.obj); piezas.push(p.obj);
    return { p, st };
  });
  vivos.push((t, dt) => gente.forEach(({ p, st }) => {
    if (!st.sentado) {
      if (!st.cola.length) {
        st.espera -= dt;
        if (st.espera <= 0) { const q = PUNTOS[Math.floor(r() * PUNTOS.length)]; st.cola = ruta(p.obj.position, { x: q[0] + (r() - 0.5) * 0.6, z: q[1] + (r() - 0.5) * 0.6 }); }
      } else {
        const o = p.obj.position, dest = st.cola[0], dx = dest.x - o.x, dz = dest.z - o.z, d = Math.hypot(dx, dz);
        if (d < 0.05) { st.cola.shift(); if (!st.cola.length) st.espera = 1.5 + r() * 4; }
        else {
          const paso = Math.min(d, st.vel * dt); o.x += dx / d * paso; o.z += dz / d * paso;
          let da = Math.atan2(dx, dz) - p.obj.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); p.obj.rotation.y += da * Math.min(1, dt * 8);
        }
      }
      st.andando = st.cola.length > 0;
      p.obj.position.y = 0;
    }
    p.anim(t, st);
  }));
  return g;
}

/* ---------- el mamut, que pasta alrededor de su casa ---------- */
function mamutDePaseo(K, vivos, piezas) {
  const m = crearMamut(K); m.obj.scale.setScalar(0.6); piezas.push(m.obj);
  let ang = 0, reloj = 0;
  vivos.push((t, dt) => {
    reloj += dt;
    const andando = reloj % 11 < 6;                      // seis segundos de paso, cinco pastando
    if (andando) ang += dt * 0.16;
    m.obj.position.set(MAMUT_CASA.x + Math.cos(ang) * 1.05, 0, MAMUT_CASA.y + Math.sin(ang) * 0.7);
    m.obj.rotation.y = Math.atan2(-Math.sin(ang) * 1.05, Math.cos(ang) * 0.7);
    m.anim(t, andando);
  });
  return m.obj;
}

/* ---------- todo junto ---------- */
export function construirMundo(K, tipoGente) {
  const raiz = new THREE.Group(), vivos = [], piezas = [], luces = { fuegoBase: 3 };
  raiz.add(suelo(K), losa(K), sendero(K), menudo(K));
  const lag = laguna(K, vivos); raiz.add(lag); piezas.push(lag.children[0]);
  const fijas = [cueva(K), fogon(K, vivos, luces), hueso(K), tambor(K), choza(K), ...ARBOLES.map(a => arbol(K, a))];
  fijas.forEach(f => { raiz.add(f); piezas.push(f); });
  raiz.add(luces.fuego);
  const nb = nubes(K, vivos); raiz.add(nb.g);
  const luc = luciernagas(vivos); raiz.add(luc);
  const gente = new THREE.Group(); raiz.add(gente);
  let vivosGente = [];
  const ponerGente = tipo => {
    gente.clear(); vivosGente = []; const pz = [];
    gente.add(clan(K, tipo, vivosGente, pz));
    gente.add(mamutDePaseo(K, vivosGente, pz));
    gente.userData.piezas = pz;
  };
  ponerGente(tipoGente);
  return {
    raiz, luces, nubes: nb, luciernagas: luc, ponerGente,
    piezas: () => [...piezas, ...gente.userData.piezas],
    actualizar(t, dt, hora) { vivos.forEach(f => f(t, dt, hora)); vivosGente.forEach(f => f(t, dt, hora)); },
  };
}
