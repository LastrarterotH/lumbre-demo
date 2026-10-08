/* ============================================================
   kaifeng/valle
   Kaifeng en 3D (Época 15), la maqueta A de la hoja (juego3d/bocetos/kaifeng.html, ACAA): la Pagoda de Hierro con su
   templo en la esquina del fondo (el héroe), la muralla de tierra apisonada por el borde de atrás con su puerta, el Bian
   en diagonal con su playa, sus juncos y su corriente amarilla de limo (es agua del río Amarillo), el Puente Arcoíris en
   el centro y, del puente para adelante, la explanada de las escuelas. En la orilla de atrás, las tiendas de la calle del
   rollo, la casa de té y el horno de hollín al pie de los pinos; del otro lado del río, entre sauces, el templo taoísta.
   El año (ESTACIONES_KAIFENG del motor) viste el suelo: el verde del Qingming, el verano húmedo con el Bian crecido, el
   ocre de la luna de otoño y la nieve del invierno, cuando cerraban la toma del río Amarillo y el Bian bajaba.
   La geometría es la del motor (09j-kaifeng, espejada en lugares.js).
   ============================================================ */
import * as THREE from 'three';
import { azar, PAL } from '../kit.js';
import * as KM from './monumentos.js';
import { pon, caja } from '../agora/monumentos.js';
import * as L from './lugares.js';

export const E0 = 2, E1 = 18, LADO = E1 - E0, CENTRO = 10;
export const NIVEL = -0.06;
export const RESERVAS = [];
export const reservado = (x, z, m = 0) => RESERVAS.some(r => r.r ? Math.hypot(x - r.x, z - r.z) < r.r + m : x > r.x0 - m && x < r.x1 + m && z > r.z0 - m && z < r.z1 + m);
const ss = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
const h3 = (a, b, c = 0) => { const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return s - Math.floor(s); };
function distPoli(pts, x, z) {
  let d = 1e9;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz;
    const t = L2 ? Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L2)) : 0;
    d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t));
  }
  return d;
}
function enPoligono(P, x, z) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, zi] = P[i], [xj, zj] = P[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; }

/* ---------- los caminos de tierra: de la puerta al puente, del puente a la explanada, y el de la orilla de atrás que lleva
   a la portada del templo de la pagoda ---------- */
export const CAMINOS = [[[12.5, 3.4], [11.6, 5.8], [10.2, 7.6], [9.17, 8.8]], [[10.83, 12.0], [11.5, 13.0], [12.3, 13.55]], [[11.2, 6.2], [10.0, 7.3], [8.2, 8.35], [6.4, 8.4], [5.7, 7.95]]];
export const PLAZA = L.EXPLANADA;
export const enCamino = (x, z, m = 0) => CAMINOS.some(p => distPoli(p, x, z) < 0.2 + m);
/* los prados: manchas de pasto donde no hay camino ni explanada (el año las viste) */
const prado = (x, z) => Math.sin(x * 1.21 + z * 0.73) * Math.sin(z * 1.07 - x * 0.58) + 0.25 * Math.sin(x * 3.3 - z * 2.1) > 0.3;

/* ---------- la altura: el lecho del Bian con su playa; lo demás es llano (el puente pone su propio tablero) ---------- */
export function altura(x, z) {
  const d = L.distBian(x, z);
  if (d < 0) return NIVEL - 0.02 - 0.28 * ss(-d / 0.8);
  if (d < 0.32) return NIVEL + 0.015 + (-NIVEL - 0.015) * ss(d / 0.32);
  return 0;
}
/* el tablero del Puente Arcoíris: la altura a la que se camina sobre él (0 fuera del puente). yDe lo pone el puente */
let yDePuente = null;
export function alPuente(yDe) { yDePuente = yDe; }
export function alturaPaso(x, z) {
  if (!yDePuente || !L.enPuente(x, z)) return 0;
  return Math.max(0, yDePuente((x - L.PUENTE.x) * L.PUENTE.nx + (z - L.PUENTE.y) * L.PUENTE.ny));
}

/* ---------- las casas de la orilla de atrás: la tienda de los Liu (áloe y sándalo, 劉家沉檀), la casa del doctor Zhao (趙太丞家)
   y la taberna del vino nuevo (新酒), los letreros que se leen en el rollo; más el puesto de sombrillas del camino ---------- */
const T_SHOP = (texto, op = {}) => ({ W: 0.95, D: 0.7, h: 0.44, letrero: texto, vertical: true, ...op });
export const CASAS = [
  [10.4, 4.6, 0, T_SHOP('劉家沉檀', { h2: 0.34 }), 'tiendaLiuCh'], [14.6, 4.5, 0, T_SHOP('趙太丞家', { toldo: true }), 'boticaCh'],
  [16.7, 4.6, -Math.PI / 2, { W: 0.9, D: 0.65, h: 0.42, bandera: '新酒' }, 'tabernaCh'], [8.2, 8.4, 0.3, { W: 0.8, D: 0.6, h: 0.4, tono: 'paja', toldo: true, sombrillas: 1 }, null],
];
export function casas(K) {
  const g = new THREE.Group(), puestas = []; g.userData.puestas = puestas;
  CASAS.forEach(([x, z, ry, o, ficha], i) => {
    const c = KM.tienda(K, { ...o, semilla: i + 1 }); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c);
    const gira = Math.abs(Math.sin(ry)) > 0.7;
    puestas.push({ x, z, w: gira ? o.D : o.W, d: gira ? o.W : o.D, i, ficha });
  });
  /* EL HORNO DE HOLLÍN (la tinta): el horno largo y bajo de ladrillo que sube por el talud, con sus bocas, la chimenea que
     humea y las rajas de pino apiladas; el hollín se raspa de adentro y se amasa con cola (Shen Gua, Mengxi bitan, ~1088) */
  const ho = new THREE.Group(); ho.position.set(L.HORNO_TINTA.x, 0, L.HORNO_TINTA.y); ho.rotation.y = 0.35; g.add(ho);
  const boveda = new THREE.CylinderGeometry(0.13, 0.13, 0.3, 10, 1, false, 0, Math.PI); boveda.rotateZ(Math.PI / 2); boveda.rotateX(-Math.PI / 2); boveda.userData.propia = true;   // tramos de bóveda baja, uno tras otro talud arriba
  for (let k = 0; k < 4; k++) { const b = K.malla(boveda, k % 2 ? '#b07a5a' : '#a06c4e', { grosor: 0.003, side: THREE.DoubleSide }); b.position.set(-0.45 + k * 0.29, k * 0.035, 0); ho.add(b); }
  pon(ho, caja(K, 1.2, 0.04, 0.32, '#8a5a40', { grosor: 0.002 }), -0.02, 0.02, 0);
  pon(ho, K.malla(K.cilindro(0.045, 0.06, 0.42, 8), '#9a6a4c', { grosor: 0.003 }), 0.7, 0.3, 0);
  pon(ho, K.malla(K.esfera(0.06, 0.5), '#3a302c', { sinTinta: true }), -0.6, 0.06, 0.0).scale.set(1, 0.8, 1.2);   // la boca del fuego
  for (let k = 0; k < 9; k++) pon(ho, K.malla(K.cilindro(0.022, 0.022, 0.34, 6), k % 2 ? KF_TR : KF_TRD, { grosor: 0.0015 }), -0.35 + (k % 3) * 0.05, 0.03 + Math.floor(k / 3) * 0.042, 0.32 + (k % 3) * 0.045).rotation.z = Math.PI / 2;
  puestas.push({ x: L.HORNO_TINTA.x, z: L.HORNO_TINTA.y, w: 1.45, d: 0.75, i: 90, ficha: 'hornoCh' });
  /* EL TEMPLO TAOÍSTA del otro lado del río, chico, entre los sauces: la sala con su incensario y el muro bajo */
  const tt = new THREE.Group(); tt.position.set(L.TEMPLO_TAO.x, 0, L.TEMPLO_TAO.y); tt.rotation.y = 0.5; g.add(tt);
  const sala = KM.edificio(K, { W: 0.95, D: 0.65, plat: 0.06, pisos: [{ h: 0.42, frente: 'puertas', bahias: 3 }], tipo: 'xieshan', vuelo: 0.14, col: KF_BERM }); tt.add(sala);
  KM.tramo(K, tt, -0.62, 0.62, -0.18, 0.62, 0.18); KM.tramo(K, tt, 0.18, 0.62, 0.62, 0.62, 0.18); KM.tramo(K, tt, -0.62, 0.62, -0.62, -0.45, 0.18); KM.tramo(K, tt, 0.62, 0.62, 0.62, -0.45, 0.18);
  const inc = new THREE.Group(); inc.position.set(0, 0, 0.52); tt.add(inc);
  pon(inc, K.malla(K.cilindro(0.07, 0.055, 0.08, 10), KF_BRONCE, { grosor: 0.002 }), 0, 0.1, 0);
  [-1, 0, 1].forEach(l => pon(inc, K.malla(K.cilindro(0.008, 0.008, 0.06, 4), KF_BRONCE, { sinTinta: true }), l * 0.04, 0.03, 0));
  pon(inc, K.malla(K.cilindro(0.02, 0.03, 0.04, 8), KF_BRONCE, { grosor: 0.0015 }), 0, 0.16, 0);
  puestas.push({ x: L.TEMPLO_TAO.x, z: L.TEMPLO_TAO.y, w: 1.35, d: 1.35, i: 91, ficha: 'temploCh' });
  return g;
}
const KF_TR = KM.KF.tronco, KF_TRD = KM.KF.troncoD, KF_BERM = KM.KF.berm, KF_BRONCE = KM.KF.bronce;

/* ---------- los bosquecillos (x, z, cuántos, radio, semilla, { sauces, pinos }): los sauces del Bian, las moreras y los
   pinos al pie de la muralla, donde se queman para el hollín ---------- */
export const BOSQUES = [[5.0, 10.0, 4, 0.6, 3, { sauces: 1 }], [3.0, 9.4, 4, 0.65, 4, { sauces: 0 }], [17.2, 9.0, 3, 0.45, 5, { sauces: 1 }], [4.3, 16.0, 4, 0.55, 6, { sauces: 0.7 }],
  [16.95, 17.0, 3, 0.45, 7, { sauces: 0 }], [8.7, 3.9, 3, 0.4, 8, { sauces: 0, pinos: 1 }], [2.6, 12.2, 2, 0.35, 9, { sauces: 1 }], [7.2, 17.3, 2, 0.3, 10, { sauces: 0.5 }]];
export function vegetacion(K, vivos, libre = () => true) {
  const g = new THREE.Group(), r = azar(1515), puestos = [], propios = new Map();
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  BOSQUES.forEach(([x, z, n, rr, sem, op]) => {
    const a = KM.bosquecillo(K, n, rr, sem, { ...op, alto: 1.25 });
    a.children.slice().forEach(t => {
      const tx = t.position.x + x, tz = t.position.z + z;
      if (tx < E0 + 0.15 || tz < E0 + 0.15 || tx > E1 - 0.15 || tz > E1 - 0.15 || L.distBian(tx, tz) < 0.18 || enCamino(tx, tz, 0.05) || L.enPagoda(tx, tz, 0.1) || L.enExplanada(tx, tz) || !libre(tx, tz, 0.2)) return;
      t.position.set(tx, -0.02, tz); g.add(t); puestos.push({ x: tx, z: tz, r: 0.27 });   // los sauces tienen la copa ancha: nadie camina debajo
    });
  });
  g.userData.puestos = puestos;
  /* las copas que el año tiñe: los sauces y las moreras amarillean en otoño y se quedan casi desnudos en invierno */
  const FOLLAJE = [KM.KF.sauce, KM.KF.sauceD, KM.KF.sauceL, KM.KF.morera, KM.KF.moreraD, KM.KF.moreraL].map(c => new THREE.Color(c).getHexString());
  const adoptar = obj => obj.traverse(o => { if (!o.isMesh || !o.material || !o.material.color) return; const hx = o.material.color.getHexString(); if (!FOLLAJE.includes(hx)) return;
    if (!propios.has(hx)) propios.set(hx, { m: o.material.clone(), base: new THREE.Color('#' + hx) }); o.material = propios.get(hx).m; });
  adoptar(g);
  /* los juncos y las cañas de las orillas, en matas (no bajo el puente) */
  const jun = [];
  for (let k = 0; k < 6000 && jun.length < 260; k++) {
    const x = E0 + 0.05 + r() * (LADO - 0.1), z = E0 + 0.1 + r() * (LADO - 0.2), a = altura(x, z);
    if (a > -0.055 || a < -0.17 || Math.hypot(x - L.PUENTE.x, z - L.PUENTE.y) < 1.1) continue; jun.push([x, z, 0.12 + r() * 0.14, r()]);
  }
  const ju = K.instancias(K.cilindro(0.005, 0.009, 1, 4), '#8aa45a', Math.max(1, jun.length), { sinTinta: true }); ju.material = ju.material.clone();
  jun.forEach(([x, z, h, k], i) => { q.setFromEuler(e.set((k - 0.5) * 0.35, 0, (k - 0.5) * 0.35)); m4.compose(v.set(x, NIVEL + h / 2, z), q, s.set(1, h, 1)); ju.setMatrixAt(i, m4); });
  /* las matas de la orilla y de los prados, redondas y bajas */
  const mat = [];
  for (let k = 0; k < 4000 && mat.length < 60; k++) {
    const x = E0 + 0.2 + r() * (LADO - 0.4), z = E0 + 0.2 + r() * (LADO - 0.4), d = L.distBian(x, z);
    const orilla = d > 0.35 && d < 1.0, pr = prado(x, z) && !enPoligono(PLAZA, x, z);
    if (!(orilla || (pr && r() < 0.25)) || enCamino(x, z, 0.12) || L.enPagoda(x, z, 0.1) || z < 3.4 || reservado(x, z, 0.12) || !libre(x, z, 0.15)) continue;
    mat.push([x, z, 0.05 + r() * 0.04, r()]);
  }
  const ma = K.instancias(K.esfera(1, 0.45), '#7f9f56', Math.max(1, mat.length), { grosor: 0.002 }); ma.material = ma.material.clone();
  mat.forEach(([x, z, rr, k], i) => { m4.compose(v.set(x, rr * 0.6, z), q.setFromEuler(e.set(0, k * 6, 0)), s.set(rr * 1.3, rr, rr * 1.1)); ma.setMatrixAt(i, m4); });
  /* las flores del Qingming en los prados: los melocotoneros y las peonías de Kaifeng (el año las muestra o las esconde) */
  const flo = [];
  for (let k = 0; k < 6000 && flo.length < 150; k++) {
    const x = E0 + 0.2 + r() * (LADO - 0.4), z = E0 + 0.2 + r() * (LADO - 0.4);
    if (!prado(x, z) || enPoligono(PLAZA, x, z) || enCamino(x, z, 0.08) || L.enPagoda(x, z, 0.1) || z < 3.4 || L.distBian(x, z) < 0.4 || reservado(x, z, 0.06)) continue;
    flo.push([x, z, r()]);
  }
  const fl = K.instancias(K.esfera(1, 0.3), '#ffffff', Math.max(1, flo.length), { sinTinta: true, sombra: false }); fl.material = fl.material.clone();
  const cf = new THREE.Color();
  flo.forEach(([x, z, k], i) => { m4.compose(v.set(x, 0.02, z), q.identity(), s.set(0.018, 0.012, 0.018)); fl.setMatrixAt(i, m4); fl.setColorAt?.(i, cf.set(k < 0.55 ? '#f4b6c2' : k < 0.85 ? '#f6eee0' : '#d8486a')); });
  if (fl.instanceColor) fl.instanceColor.needsUpdate = true;
  g.add(ju, ma, fl);
  const c = new THREE.Color(), c2 = new THREE.Color();
  /* el tinte de cada estación: la primavera tierna, el verano espeso, el amarillo del otoño, el invierno pálido y escarchado */
  const TINTE = [['#c4e07a', 0.12], ['#5e8f3c', 0.12], ['#e2b84a', 0.55], ['#cfd2c4', 0.55]];
  const copa = (base, i) => c2.copy(base).lerp(c.set(TINTE[i][0]), TINTE[i][1]).clone();
  return {
    g, adoptar, puestos,
    vestir(i, k, j) {
      for (const { m, base } of propios.values()) m.color.copy(copa(base, i).lerp(copa(base, j), k));
      const JU = ['#8aa65a', '#7f9e4e', '#b0a05a', '#b4b09a'], MA = ['#7fa456', '#6f9a4a', '#a8984e', '#b8b8a8'];
      ju.material.color.set(JU[i]).lerp(c.set(JU[j]), k); ma.material.color.set(MA[i]).lerp(c.set(MA[j]), k);
      const flor = [1, 0.25, 0, 0][i] * (1 - k) + [1, 0.25, 0, 0][j] * k; fl.visible = flor > 0.05; fl.count = Math.round(flo.length * flor);
    },
  };
}

/* ---------- el suelo: cada triángulo sabe qué es (agua, playa, orilla, camino, explanada, prado, ciudad) y el año lo pinta ---------- */
const AGUA = 0, PLAYA = 1, ORILLA = 2, CAMINO = 3, EXPLANADA = 4, PRADO = 5, CIUDAD = 6;
function clase(x, z, h) {
  if (h < NIVEL + 0.004) return AGUA;
  const d = L.distBian(x, z);
  if (d > 0 && d < 0.34) return PLAYA;
  if (enCamino(x, z)) return CAMINO;
  if (enPoligono(PLAZA, x, z)) return EXPLANADA;
  if (d > 0 && d < 1.3) return ORILLA;
  if (prado(x, z)) return PRADO;
  return CIUDAD;
}
/* la paleta del año (primavera, verano, otoño, invierno): el loess claro de la llanura del río Amarillo; en invierno, nieve */
const CIUDADES = [['#ecdcb4', '#e7d6ab', '#efe2be', '#e3d1a5', '#eadab1'], ['#efdfb4', '#ead9ab', '#f2e4bc', '#e6d4a6', '#eddcb0'], ['#eadab0', '#e5d4a7', '#ede0ba', '#e1cfa1', '#e8d8ad'], ['#eeebe2', '#e8e4da', '#f3f0e8', '#e2ded3', '#ebe8de']];
const PRADOS = [['#bfd58e', '#b7cf86', '#c6da96', '#b1ca80', '#bbd28a'], ['#b6cc7e', '#aec676', '#bdd286', '#a8c070', '#b2c97a'], ['#d6c28a', '#ceba82', '#dcc892', '#c8b47c', '#d2be86'], ['#e4e6de', '#dcdfd6', '#eaece4', '#d6d9cf', '#e0e2da']];
const ORILLAS = [['#c4d793', '#bcd18b'], ['#b8cf86', '#b0c77e'], ['#cdc28c', '#c5ba84'], ['#d8dccf', '#d0d4c6']];
const EXPLANADAS = [['#f2e8cb', '#eee2c2'], ['#f2e8cb', '#eee2c2'], ['#f0e4c4', '#ecdfbc'], ['#f4f1e8', '#efece2']];
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
  geo.computeVertexNormals(); geo.userData.propia = true;
  const cls = hondo.map((h, t) => { const x = cen[2 * t], z = cen[2 * t + 1]; return [clase(x, z, h), Math.abs(Math.floor(x * 2) * 7 + Math.floor(z * 2) * 13) % 5, x, z]; });
  const c = new THREE.Color(), c2 = new THREE.Color();
  const base = (t, e) => {
    const [k, tab, x, z] = cls[t], h = hondo[t];
    switch (k) {
      case AGUA: return c.set('#d6c99a').lerp(c2.set('#9a9272'), Math.min(1, (NIVEL - h) / 0.22));
      case PLAYA: return c.set(e === 3 ? ['#efece2', '#ebe7dc', '#f2efe6', '#e7e3d8', '#eeeae0'][tab] : ['#efe2b8', '#ece0b4', '#f1e5bf', '#eadcb0', '#eee1b8'][tab]);
      case CAMINO: return c.set(((Math.floor(x * 3) + Math.floor(z * 3)) & 1) ? '#d9c393' : '#d3bc8b').lerp(c2.set('#ece8de'), e === 3 ? 0.45 : 0);
      case EXPLANADA: return c.set(EXPLANADAS[e][(Math.floor(x * 2) + Math.floor(z * 2)) & 1]);
      case ORILLA: { const d = L.distBian(x, z); return c.set(ORILLAS[e][tab & 1]).lerp(c2.set(CIUDADES[e][tab]), ss((d - 0.4) / 0.9)); }
      case PRADO: return c.set(PRADOS[e][tab]);
      default: return c.set(CIUDADES[e][tab]);
    }
  };
  const pintar = ({ i, j, k }) => {
    for (let t = 0; t < hondo.length; t++) {
      base(t, i); if (k > 0) { const a = c.clone(); base(t, j); c.copy(a.lerp(c, k)); }
      for (let q = 0; q < 3; q++) col.setXYZ(t * 3 + q, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  };
  pintar({ i: 0, j: 0, k: 0 });
  const m = K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false });
  m.userData.suelo = true; m.userData.pintar = pintar; m.userData.vivo = true;
  return m;
}

/* ---------- el agua del Bian: amarilla de limo (es agua del río Amarillo, que entra por la toma de Sishui), más verde al
   medio, con su corriente río abajo; en invierno cerraban la toma y el canal bajaba ---------- */
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
    const k = Math.min(1, Math.max(0, (NIVEL - prof[i]) / 0.26));
    if (k < 0.3) c.set('#dcd6ac').lerp(c2.set('#b9c09a'), k / 0.3); else c.set('#b9c09a').lerp(c2.set('#88a08e'), (k - 0.3) / 0.7);
    col.setXYZ(i, c.r, c.g, c.b);
  }
  const rio = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, transparent: true, opacity: 0.94 })); rio.receiveShadow = true; rio.position.y = NIVEL; rio.userData.vivo = true;
  g.add(rio);
  /* la corriente: estelas claras que bajan por el eje, a distintas distancias de la orilla (no bajo el puente) */
  const onda = new THREE.PlaneGeometry(0.026, 0.4); onda.userData.propia = true;
  const mo = new THREE.MeshBasicMaterial({ color: '#f6f2e2', transparent: true, opacity: 0.4, depthWrite: false });
  const olas = [], rr = azar(1502);
  for (let k = 0; k < 46; k++) { const m = new THREE.Mesh(onda, mo.clone()); m.rotation.order = 'YXZ'; m.rotation.x = -Math.PI / 2; g.add(m); olas.push({ m, u: rr() * L.LARGO_BIAN, lado: (rr() - 0.5) * 0.8, f: rr(), v: 0.1 + rr() * 0.05 }); }
  vivos.push((t, dt) => olas.forEach(o => {
    o.u += (dt || 0) * o.v; if (o.u > L.LARGO_BIAN) o.u -= L.LARGO_BIAN;
    const q = L.enEje(o.u), x = q.x - q.tz * o.lado * q.ancho / 2, z = q.z + q.tx * o.lado * q.ancho / 2, f = (t * 0.15 + o.f) % 1;
    o.m.position.set(x, rio.position.y + 0.006, z); o.m.rotation.y = Math.atan2(q.tx, q.tz);
    const ok = z > E0 + 0.2 && z < E1 - 0.2 && x > E0 + 0.2 && x < E1 - 0.2 && altura(x, z) < -0.16 && Math.hypot(x - L.PUENTE.x, z - L.PUENTE.y) > 0.9;
    o.m.material.opacity = ok ? 0.42 * Math.sin(Math.PI * f) : 0;
  }));
  return { g, rio };
}

/* ---------- la losa del diorama: el corte del loess en capas (la llanura la hizo el río Amarillo, crecida tras crecida),
   con el río asomando y, en el corte, los tiestos de celadón y de las vasijas de la ciudad ---------- */
export function losa(K) {
  const g = new THREE.Group();
  const pared = (fijo, eje) => {
    const pos = [], col = [], c = new THREE.Color(), paso = 0.125;
    const quad = (p0, p1, p2, p3, color) => { c.set(color); for (const p of [p0, p1, p2, p0, p2, p3]) { pos.push(...p); col.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, P = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const xa = eje === 'x' ? fijo : u, za = eje === 'x' ? u : fijo, xb = eje === 'x' ? fijo : u1, zb = eje === 'x' ? u1 : fijo;
      const h0 = altura(xa, za), h1 = altura(xb, zb);
      quad(P(u, h0), P(u1, h1), P(u1, Math.min(h1, 0) - 0.1), P(u, Math.min(h0, 0) - 0.1), h0 < -0.03 ? '#8f8a66' : '#d9c296');
      quad(P(u, Math.min(h0, 0) - 0.1), P(u1, Math.min(h1, 0) - 0.1), P(u1, -0.3), P(u, -0.3), PAL.corte1);
      quad(P(u, -0.3), P(u1, -0.3), P(u1, -0.36), P(u, -0.36), '#c9a878');   // una capa de limo de una crecida vieja
      quad(P(u, -0.36), P(u1, -0.36), P(u1, -0.52), P(u, -0.52), PAL.corte1);
      quad(P(u, -0.52), P(u1, -0.52), P(u1, -1.05), P(u, -1.05), PAL.corte2);
      if (h0 < NIVEL || h1 < NIVEL) quad(P(u, NIVEL), P(u1, NIVEL), P(u1, Math.min(NIVEL, h1)), P(u, Math.min(NIVEL, h0)), '#9aa58a');
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals(); geo.userData.propia = true;
    const m = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide })); m.receiveShadow = false; return m;
  };
  g.add(pared(E1, 'x'), pared(E1, 'z'));
  const cj = (w, h, d, x, y, z, color) => { const m = K.malla(K.caja(w, h, d), color, { grosor: 0.03, sombra: false, recibe: false }); m.position.set(x, y, z); g.add(m); };
  cj(LADO, 0.46, 0.06, CENTRO, -0.23, E0 + 0.03, PAL.corte1); cj(0.06, 0.46, LADO, E0 + 0.03, -0.23, CENTRO, PAL.corte1);
  cj(LADO - 0.02, 0.6, LADO - 0.02, CENTRO, -0.76, CENTRO, PAL.corte2);
  const r = azar(1515);
  for (let i = 0; i < 16; i++) {
    const izq = r() < 0.5, s = E0 + 0.4 + r() * (LADO - 0.8), y = -(0.2 + r() * 0.75), rr = 0.04 + r() * 0.05, tiesto = i % 3 !== 0;
    const p = K.malla(tiesto ? K.caja(rr * 2.2, rr * 0.7, 0.02) : K.roca(rr, 150 + i), tiesto ? ['#9ec2a8', '#c9b48a', '#7fa996'][i % 3] : '#b8a184', { sinTinta: true, sombra: false, recibe: false });
    if (tiesto) p.rotation.z = (r() - 0.5) * 1.2; else p.scale.set(1.4, 0.8, 1.4);
    if (izq) p.position.set(s, y, E1 + 0.008); else { p.position.set(E1 + 0.008, y, s); p.rotation.y = Math.PI / 2; }
    g.add(p);
  }
  return g;
}
export { distPoli, enPoligono, h3 };
