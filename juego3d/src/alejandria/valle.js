/* ============================================================
   alejandria/valle
   La ciudad de Alejandría en 3D (Época 5): el mar del Gran Puerto al fondo, con su orilla de arena y espuma, la isla
   del Faro y el dique del Heptastadio; la ciudad en damero (la vía Canópica de oeste a este y la calle del Soma de
   norte a sur, que se cruzan en la plaza), las casas de azotea encaladas, las palmeras, los jardines de los palacios,
   y al frente el lago Mareotis con su juncal de papiro. La losa del diorama muestra el agua en el corte.
   La geometría de la costa y del lago es la del motor (costaAl, lagoAl y FARO_AL de 09c-alejandria, espejados en lugares.js): la querencia del
   papiro, los barcos y los toques caen donde el motor los espera.
   ============================================================ */
import * as THREE from 'three';
import { azar, PAL } from '../kit.js';
import { palmera } from '../sumer/monumentos.js';
import { AL } from './monumentos.js';
import * as L from './lugares.js';

const ubic = (m, x, y, z, rx = 0, ry = 0, rz = 0) => { m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx, ry, rz); return m; };
const pon = (padre, m, x, y, z) => { m.position.set(x, y, z); padre.add(m); return m; };
export const E0 = 2, E1 = 18, LADO = E1 - E0, CENTRO = 10;
export const NIVEL_MAR = -0.06, NIVEL_LAGO = -0.05;

/* ---------- dónde vive cada cosa de la ciudad ---------- */
export const CANOPICA = { z0: 9.2, z1: 10.0 };                                   // la vía Canópica, de la puerta del Sol a la de la Luna
export const SOMA = { x0: 9.8, x1: 10.6 };                                       // la calle del Soma, del puerto al lago
export const PLAZA = { x0: 8.5, x1: 11.9, z0: 8.4, z1: 11.5 };                   // el cruce: la plaza del centro
export const ISLA = { x: L.FARO.x, z: L.FARO.y, r: L.FARO.r };
export const HEPTASTADIO = { x: 3.35, z0: L.FARO.y + L.FARO.r - 0.25, ancho: 0.42 }; // el dique de siete estadios: de la isla a la ciudad
/* las casas: [x0, z0, ancho, fondo, alto, barrio]. El barrio griego al sureste, Racotis (el egipcio) al suroeste, junto
   al Serapeo, y el puerto con sus almacenes al norte de la Canópica */
export const CASAS = [
  [12.6, 10.4, 0.8, 0.8, 0.42, 'g'], [13.6, 10.4, 0.95, 0.75, 0.5, 'g'], [14.8, 10.35, 0.8, 0.85, 0.4, 'g'], [16.0, 10.4, 1.0, 0.8, 0.46, 'g'],
  [12.7, 12.4, 0.9, 0.8, 0.44, 'g'], [14.0, 12.5, 0.8, 0.9, 0.52, 'g'], [15.3, 12.4, 0.95, 0.8, 0.4, 'g'], [16.5, 12.6, 0.8, 0.8, 0.46, 'g'],
  [12.8, 13.9, 0.85, 0.75, 0.38, 'g'], [15.6, 13.9, 0.9, 0.7, 0.42, 'g'],
  [2.5, 10.5, 0.8, 0.8, 0.36, 'e'], [7.0, 10.5, 0.85, 0.75, 0.4, 'e'], [7.2, 12.2, 0.8, 0.8, 0.34, 'e'], [7.0, 13.7, 0.85, 0.7, 0.38, 'e'],
  [2.5, 5.4, 0.9, 0.8, 0.44, 'p'], [3.6, 5.5, 0.8, 0.9, 0.5, 'p'], [2.6, 7.0, 0.85, 0.8, 0.4, 'p'], [4.9, 7.6, 0.8, 0.8, 0.46, 'p']
];
export const PALMERAS = [[8.3, 8.95, 1.25], [11.7, 8.7, 1.3], [8.3, 11.75, 1.2], [12.2, 11.7, 1.35], [6.3, 9.0, 1.15], [14.6, 9.0, 1.2], [17.0, 9.05, 1.1],
  [3.8, 8.9, 1.25], [10.9, 14.6, 1.3], [9.3, 14.9, 1.2], [16.9, 14.8, 1.15], [2.6, 14.9, 1.25], [17.2, 6.3, 1.3], [5.6, 6.0, 1.1]];
export const OBELISCOS = [[11.0, 5.5], [11.6, 5.5]];                            // las «agujas de Cleopatra», traídas de Heliópolis al puerto (siglo I a. C.)

/* ---------- el relieve: el lecho del mar y del lago; la isla del Faro, de roca baja; lo demás es llano ---------- */
const ss = k => k * k * (3 - 2 * k);
export function altura(x, z) {
  const dI = Math.hypot(x - ISLA.x, z - ISLA.z);
  if (dI < ISLA.r) return 0.02;
  const dm = L.costa(x) - z, dl = z - L.lago(x);
  let h = 0;
  if (dm > -0.12) h = Math.min(h, dm < 0 ? -0.03 * (1 + dm / 0.12) : -0.03 - 0.4 * ss(Math.min(1, dm / 1.4)));
  if (dl > -0.12) h = Math.min(h, dl < 0 ? -0.03 * (1 + dl / 0.12) : -0.03 - 0.26 * ss(Math.min(1, dl / 1.0)));
  if (dI < ISLA.r + 0.5) { const k = ss(Math.min(1, (dI - ISLA.r) / 0.5)); h = 0.02 * (1 - k) + h * k; }   // la isla baja al agua
  if (Math.abs(x - HEPTASTADIO.x) < HEPTASTADIO.ancho / 2 && z > HEPTASTADIO.z0 && dm > 0) h = Math.max(h, NIVEL_MAR - 0.02);   // el dique asienta en el bajo
  return h;
}
export const enMar = (x, z) => z < L.costa(x) && Math.hypot(x - ISLA.x, z - ISLA.z) >= ISLA.r;
export const enLago = (x, z) => z > L.lago(x);
export const enCalle = (x, z) => (z > CANOPICA.z0 && z < CANOPICA.z1) || (x > SOMA.x0 && x < SOMA.x1 && z > L.costa(x) && z < L.lago(x));
export const enPlaza = (x, z) => x > PLAZA.x0 && x < PLAZA.x1 && z > PLAZA.z0 && z < PLAZA.z1;

/* los sitios que ocupa la época (monumentos, casas, saberes): ahí no crecen matas ni camina nadie */
export const RESERVAS = [];
export const reservado = (x, z, m = 0) => RESERVAS.some(r => r.r ? Math.hypot(x - r.x, z - r.z) < r.r + m : x > r.x0 - m && x < r.x1 + m && z > r.z0 - m && z < r.z1 + m);

/* ---------- el suelo: celdas de ¼, pintadas por baldosa y hundidas bajo el agua ---------- */
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
  const LOSAS = ['#e6dcc2', '#ded3b6', '#ebe2ca', '#d8cdb0', '#e2d8bc'];
  /* se repinta con el año: la arena de la ciudad (ESTACIONES_ALEJANDRIA del motor) */
  const pintar = pal => {
    for (let t = 0; t < hondo.length; t++) {
      const h = hondo[t], x = cen[2 * t], z = cen[2 * t + 1];
      if (enPlaza(x, z) || enCalle(x, z)) { const i = Math.floor(x * 2.5) * 7 + Math.floor(z * 2.5) * 13; c.set(LOSAS[Math.abs(i) % 5]); if ((Math.floor(x * 2.5) + Math.floor(z * 2.5)) % 2) c.multiplyScalar(0.975); }
      else c.set(pal.campo[Math.abs(Math.floor(x) * 7 + Math.floor(z) * 13) % 5]);
      const dm = L.costa(x) - z, dl = z - L.lago(x), dI = Math.hypot(x - ISLA.x, z - ISLA.z);
      if (dI < ISLA.r + 0.1) c.set(Math.abs(Math.floor(x * 3) + Math.floor(z * 3)) % 3 ? AL.roca : AL.rocaL);
      else if (dm > -0.55 && dm < 0.05) c.lerp(c2.set('#efe3bf'), 0.7);                              // la playa del puerto
      if (dl > -0.7 && dl < 0.05) c.lerp(c2.set('#9aa66a'), 0.55 * (1 - Math.max(0, -dl) / 0.7));  // la orilla húmeda del lago, con su juncal
      if (h < -0.04) c.lerp(c2.set(dl > 0 ? '#7f8a62' : '#c9b98a'), Math.min(1, (-h - 0.04) / 0.12));  // el fondo: arena bajo el mar, limo bajo el lago
      for (let k = 0; k < 3; k++) col.setXYZ(t * 3 + k, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  };
  const m = K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false });
  m.userData.suelo = true; m.userData.pintar = pintar; m.userData.vivo = true;
  return m;
}

/* ---------- el agua: el mar turquesa del puerto (con olas y espuma en la orilla) y el lago, verdoso y quieto ---------- */
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
  const mar = hoja((x, z) => enMar(x, z), NIVEL_MAR, ['#b9ece6', '#62c3d4', '#3c9ccb']);
  const lago = hoja((x, z) => enLago(x, z), NIVEL_LAGO, ['#a9c7a8', '#6f9f96', '#527f80']);
  g.add(mar, lago);
  /* la espuma de la orilla del mar y de la isla: una cinta blanca que respira con la ola (instanciada: una sola llamada) */
  const tiras = [];
  for (let x = E0; x < E1; x += 0.25) tiras.push({ x: x + 0.125, z: L.costa(x) - 0.06, ry: -Math.atan(0.3 * 0.6 * Math.cos(x * 0.6)), w: 0.27, fase: x * 0.9, mueve: true });
  for (let k = 0; k < 28; k++) { const a = k / 28 * Math.PI * 2; tiras.push({ x: ISLA.x + Math.cos(a) * (ISLA.r + 0.08), z: ISLA.z + Math.sin(a) * (ISLA.r + 0.08), ry: -a + Math.PI / 2, w: 0.22, fase: a, mueve: false }); }
  const espMat = new THREE.MeshBasicMaterial({ color: AL.espuma, transparent: true, opacity: 0.75, depthWrite: false });
  const espuma = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.006, 0.07), espMat, tiras.length); espuma.geometry.userData.propia = true; espuma.userData.vivo = true; g.add(espuma);
  const m4e = new THREE.Matrix4(), qe = new THREE.Quaternion(), ve = new THREE.Vector3(), se = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const ponTiras = t => tiras.forEach((e, i) => { const k = Math.sin(t * 1.3 + e.fase); qe.setFromAxisAngle(up, e.ry); m4e.compose(ve.set(e.x, NIVEL_MAR + 0.004, e.z - (e.mueve ? 0.05 * k : 0)), qe, se.set(e.w * (0.85 + 0.15 * k), 1, 1)); espuma.setMatrixAt(i, m4e); });
  ponTiras(0);
  /* las olas del puerto: crestas claras que viajan hacia la orilla */
  const cresta = new THREE.PlaneGeometry(0.55, 0.035);
  const olas = Array.from({ length: 16 }, (_, i) => {
    const m = new THREE.Mesh(cresta, new THREE.MeshBasicMaterial({ color: '#f2fbfd', transparent: true, opacity: 0.45, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; g.add(m); return { m, x: E0 + 0.6 + (i * 2.37) % (LADO - 1.2), f: (i * 0.37) % 1 };
  });
  vivos.push(t => {
    ponTiras(t); espuma.instanceMatrix.needsUpdate = true; espMat.opacity = 0.6 + 0.2 * Math.sin(t * 0.9);
    olas.forEach(o => {
      const f = (t * 0.05 + o.f) % 1, zc = L.costa(o.x), z = E0 + 0.15 + (zc - E0 - 0.5) * f;
      const libre = Math.hypot(o.x - ISLA.x, z - ISLA.z) > ISLA.r + 0.35 && Math.abs(o.x - HEPTASTADIO.x) > 0.5 && z < zc - 0.25;
      o.m.visible = libre; o.m.position.set(o.x, NIVEL_MAR + 0.006, z); o.m.material.opacity = 0.42 * Math.sin(Math.PI * f);
    });
  });
  return { g, mar, lago };
}

/* ---------- la losa del diorama: el corte de arena y limo, con el mar y el lago asomando por el borde ---------- */
export function losa(K) {
  const g = new THREE.Group();
  const pared = (fijo, eje) => {
    const pos = [], col = [], c = new THREE.Color(), paso = 0.125;
    const quad = (p0, p1, p2, p3, color) => { c.set(color); for (const p of [p0, p1, p2, p0, p2, p3]) { pos.push(...p); col.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, P = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const xa = eje === 'x' ? fijo : u, za = eje === 'x' ? u : fijo, xb = eje === 'x' ? fijo : u1, zb = eje === 'x' ? u1 : fijo;
      const h0 = altura(xa, za), h1 = altura(xb, zb), top0 = Math.min(h0, 0), top1 = Math.min(h1, 0);
      quad(P(u, top0), P(u1, top1), P(u1, top1 - 0.1), P(u, top0 - 0.1), top0 < -0.03 ? '#b8a878' : '#d9c79a');
      quad(P(u, top0 - 0.1), P(u1, top1 - 0.1), P(u1, -0.46), P(u, -0.46), PAL.corte1);
      quad(P(u, -0.46), P(u1, -0.46), P(u1, -1.05), P(u, -1.05), PAL.corte2);
      const marA = enMar(xa, za) || enMar(xb, zb), nv = marA ? NIVEL_MAR : NIVEL_LAGO;
      if ((marA || enLago(xa, za) || enLago(xb, zb)) && (h0 < nv || h1 < nv)) quad(P(u, nv), P(u1, nv), P(u1, Math.min(nv, top1)), P(u, Math.min(nv, top0)), marA ? '#4f93b5' : '#6f9a8e');
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals(); geo.userData.propia = true;
    const m = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide })); m.receiveShadow = false; return m;
  };
  g.add(pared(E1, 'x'), pared(E1, 'z'));
  const caja = (w, h, d, x, y, z, color) => { const m = K.malla(K.caja(w, h, d), color, { grosor: 0.03, sombra: false, recibe: false }); m.position.set(x, y, z); g.add(m); };
  caja(LADO, 0.46, 0.06, CENTRO, -0.23, E0 + 0.03, PAL.corte1); caja(0.06, 0.46, LADO, E0 + 0.03, -0.23, CENTRO, PAL.corte1);
  caja(LADO - 0.02, 0.6, LADO - 0.02, CENTRO, -0.76, CENTRO, PAL.corte2);
  const r = azar(2505);
  for (let i = 0; i < 16; i++) {                        // piedritas, conchas y tiestos de ánfora en el corte
    const izq = r() < 0.5, s = E0 + 0.4 + r() * (LADO - 0.8), y = -(0.3 + r() * 0.65), rr = 0.05 + r() * 0.06;
    const p = K.malla(K.roca(rr, 90 + i), i % 3 ? PAL.piedrita : i % 2 ? '#b5603a' : '#efe6d8', { sinTinta: true, sombra: false, recibe: false }); p.scale.set(1.4, 0.8, 1.4);
    if (izq) p.position.set(s, y, E1 + 0.005); else p.position.set(E1 + 0.005, y, s);
    g.add(p);
  }
  return g;
}

/* ---------- las calles: los pórticos de la vía Canópica (columnas a los dos lados, como la describe Aquiles Tacio) ---------- */
export function calles(K) {
  const g = new THREE.Group();
  const col = (x, z) => { const c = new THREE.Group(); c.position.set(x, 0, z); g.add(c);
    pon(c, K.malla(K.caja(0.1, 0.05, 0.1), AL.calizaD, { grosor: 0.003 }), 0, 0.025, 0);
    pon(c, K.malla(K.cilindro(0.032, 0.036, 0.62, 8), AL.calizaL, { grosor: 0.003 }), 0, 0.36, 0);
    pon(c, K.malla(K.caja(0.1, 0.04, 0.1), AL.calizaL, { grosor: 0.003 }), 0, 0.69, 0); };
  for (let x = E0 + 0.4; x < E1 - 0.2; x += 0.62) {
    if (x > PLAZA.x0 - 0.2 && x < PLAZA.x1 + 0.2) continue;               // la plaza se abre
    [CANOPICA.z0 - 0.06, CANOPICA.z1 + 0.06].forEach(z => col(x, z));
  }
  /* el arquitrabe corrido sobre las columnas, tramo por tramo */
  const tramos = [[E0 + 0.35, PLAZA.x0 - 0.25], [PLAZA.x1 + 0.25, E1 - 0.25]];
  tramos.forEach(([a, b]) => [CANOPICA.z0 - 0.06, CANOPICA.z1 + 0.06].forEach(z => pon(g, K.malla(K.caja(b - a, 0.05, 0.08), AL.caliza, { grosor: 0.004 }), (a + b) / 2, 0.735, z)));
  return g;
}

/* ---------- las casas de azotea: muros encalados, la puerta, la escalera a la terraza y lo que tienen afuera ---------- */
export const AZOTEA_ALQUIMISTA = 13;   // la casa de Racotis cuya azotea guarda el secreto: sin toldo ni cuarto arriba
export function casas(K) {
  const g = new THREE.Group(), r = azar(5150);
  const MUROS = { g: ['#f3eee2', '#eee6d4', '#f6f1e6'], e: ['#e3cfa6', '#d9c39a', '#e8d6b0'], p: ['#efe6d2', '#e6dcc4', '#f1eadb'] };
  CASAS.forEach(([x0, z0, w, d, h, barrio], i) => {
    const c = new THREE.Group(); c.position.set(x0 + w / 2, 0, z0 + d / 2); g.add(c);
    const muro = MUROS[barrio][i % 3];
    c.add(ubic(K.malla(K.caja(w, h, d), muro, { grosor: 0.01 }), 0, h / 2, 0));
    c.add(ubic(K.malla(K.caja(w + 0.02, 0.05, d + 0.02), '#cbbf9f', { sinTinta: true }), 0, 0.025, 0));
    c.add(ubic(K.malla(K.caja(w + 0.04, 0.04, d + 0.04), barrio === 'e' ? '#c9b083' : '#ddd3bc', { grosor: 0.005 }), 0, h + 0.02, 0));   // el borde de la azotea
    pon(c, K.malla(K.caja(0.18, h * 0.58, 0.02), '#4a3a28', { sinTinta: true }), w * 0.12, h * 0.29, d / 2 + 0.006);   // la puerta
    for (let k = 0; k < 2; k++) pon(c, K.malla(K.caja(0.08, 0.07, 0.02), '#3e3226', { sinTinta: true }), -w * 0.3 + k * 0.18, h * 0.74, d / 2 + 0.006);   // los ventanucos altos
    if (r() < 0.6 && i !== AZOTEA_ALQUIMISTA) {        // en la azotea: un toldo de cañas o el cuarto de arriba
      if (r() < 0.5) { pon(c, K.malla(K.caja(w * 0.45, 0.2, d * 0.45), muro, { grosor: 0.006 }), -w * 0.18, h + 0.12, -d * 0.18); }
      else { [-1, 1].forEach(l => [-1, 1].forEach(m => pon(c, K.malla(K.cilindro(0.01, 0.01, 0.2, 4), AL.maderaD, { sinTinta: true }), l * w * 0.3, h + 0.1, m * d * 0.3))); pon(c, K.malla(K.caja(w * 0.66, 0.015, d * 0.66), '#d9b56b', { grosor: 0.003 }), 0, h + 0.2, 0); }
    }
    if (barrio === 'e' && i % 2) { const v = K.malla(K.esfera(0.08), '#b9784a', { grosor: 0.004 }); v.scale.set(1, 1.3, 1); v.position.set(w / 2 + 0.11, 0.1, d * 0.25); c.add(v); }   // la tinaja del agua
  });
  return g;
}

/* ---------- lo que crece: las palmeras de las calles, los jardines, el juncal de papiro del lago y la hierba seca ---------- */
export function vegetacion(K, vivos) {
  const g = new THREE.Group(), r = azar(6006);
  PALMERAS.forEach(([x, z, h], i) => { const p = palmera(K, h, i + 3); p.position.set(x, 0, z); g.add(p); });
  /* el juncal de papiro de la orilla del Mareotis: tallos altos con su penacho, en matas */
  const tallos = [], penachos = [], hierba = [], matas = [];
  for (let k = 0; k < 900 && tallos.length < 260; k++) {
    const x = E0 + 0.3 + r() * (LADO - 0.6), z = L.lago(x) - 0.05 - r() * 0.75;
    if (reservado(x, z, 0.1) || (x > SOMA.x0 - 0.2 && x < SOMA.x1 + 0.2)) continue;
    const mata = r(); for (let q = 0; q < 3; q++) { const xx = x + (r() - 0.5) * 0.18, zz = z + (r() - 0.5) * 0.12, h = 0.35 + r() * 0.3; tallos.push([xx, zz, h, mata]); penachos.push([xx, zz, h]); }
  }
  for (let k = 0; k < 3000 && (hierba.length < 260 || matas.length < 40); k++) {
    const x = E0 + 0.25 + r() * (LADO - 0.5), z = E0 + 0.25 + r() * (LADO - 0.5);
    if (reservado(x, z, 0.15) || enCalle(x, z) || enPlaza(x, z) || altura(x, z) < -0.01 || z < L.costa(x) + 0.5 || z > L.lago(x) - 0.9) continue;
    if (r() < 0.12 && matas.length < 40) matas.push([x, z, 0.06 + r() * 0.06]); else if (hierba.length < 260) hierba.push([x, z, r()]);
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  const ta = K.instancias(K.cilindro(0.008, 0.012, 1, 4), '#6f8f3e', tallos.length, { sinTinta: true });
  tallos.forEach(([x, z, h, mm], i) => { q.setFromEuler(e.set((mm - 0.5) * 0.25, 0, (mm - 0.5) * 0.2)); m4.compose(v.set(x, altura(x, z) + h / 2, z), q, s.set(1, h, 1)); ta.setMatrixAt(i, m4); });
  const pe = K.instancias(K.cono(0.07, 0.08, 6), '#8fae4e', penachos.length, { sinTinta: true });
  penachos.forEach(([x, z, h], i) => { q.setFromEuler(e.set(Math.PI, 0, 0)); m4.compose(v.set(x, altura(x, z) + h + 0.02, z), q, s.set(1, 1, 1)); pe.setMatrixAt(i, m4); });
  const hi = K.instancias(K.cono(0.03, 0.15, 4), '#b8ac6a', hierba.length, { sinTinta: true });
  hierba.forEach(([x, z, rr], i) => { q.setFromEuler(e.set((rr - 0.5) * 0.5, rr * 6, (rr - 0.5) * 0.4)); m4.compose(v.set(x, 0.065, z), q, s.set(1, 0.7 + rr * 0.6, 1)); hi.setMatrixAt(i, m4); });
  const ma = K.instancias(K.esfera(1, 0.6), '#8a9460', matas.length, { grosor: 0.01 });
  matas.forEach(([x, z, rr], i) => { m4.compose(v.set(x, rr * 0.55, z), q.identity(), s.set(rr * 1.3, rr * 0.9, rr * 1.3)); ma.setMatrixAt(i, m4); });
  g.add(ta, pe, hi, ma);
  vivos.push(t => { pe.rotation.z = Math.sin(t * 0.7) * 0.003; });
  return {
    g, hierba: hi,
    vestir(i, k, j) { const H = ['#b3b06a', '#cdb86a', '#c2ad66', '#a9ad72'], col = new THREE.Color(H[i]).lerp(new THREE.Color(H[j]), k); hi.material.color.copy(col); },
  };
}
