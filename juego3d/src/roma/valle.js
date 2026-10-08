/* ============================================================
   roma/valle
   Roma en 3D (Época 14), la maqueta A de la hoja (juego3d/bocetos/roma.html, AAAA): el Foro Romano con el Capitolio en la
   esquina del fondo (el héroe, que trae su colina), el Tíber por el borde izquierdo con su playa, sus juncos y su
   corriente, que se abre en dos brazos alrededor de la isla Tiberina; detrás a la derecha, las ínsulas de la Subura; al
   frente, el suelo claro de las escuelas con sus caminos de basalto. Los pinos piñoneros y los cipreses, en bosquecillos.
   El año (ESTACIONES_ROMA del motor) viste el suelo: el verde de marzo, el pasto dorado del verano, el ocre de la
   vendimia y el verde del invierno lluvioso; el Tíber crece en invierno y baja en verano.
   La geometría es la del motor (09i-roma, espejada en lugares.js).
   ============================================================ */
import * as THREE from 'three';
import { azar, PAL } from '../kit.js';
import { RO, insula, domus, fuente, arboleda } from './monumentos.js';
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

/* ---------- los caminos de basalto (del Foro al frente, el del este hacia la Subura, el del puente, el arco de las
   escuelas) y la explanada de tierra apisonada donde enseñan ---------- */
export const CAMINOS = [[[9.5, 13.2], [9.9, 15.6], [10.3, 18]], [[12.3, 10.4], [14.6, 9.0], [18, 8.7]], [[7.45, 13.5], [6.6, 13.6], [6.45, 14.6], [6.55, 15.7]], [[10.0, 15.0], [13.0, 15.0], [15.4, 13.3], [16.6, 11.2]]];
export const PLAZA = [[11.4, 11.6], [17.4, 9.7], [17.4, 17.4], [11.0, 17.4], [10.6, 14.2]];
export const enCamino = (x, z, m = 0) => CAMINOS.some(p => distPoli(p, x, z) < 0.2 + m);
/* los prados: manchas de pasto donde no hay camino ni explanada (el año las viste) */
const prado = (x, z) => Math.sin(x * 1.31 + z * 0.67) * Math.sin(z * 1.13 - x * 0.52) + 0.25 * Math.sin(x * 3.1 - z * 2.3) > 0.32;

/* ---------- la altura: el lecho del Tíber con su playa; lo demás es llano (el Capitolio lo trae el héroe) ---------- */
export function altura(x, z) {
  const d = L.distTiber(x, z);
  if (d < 0) return NIVEL - 0.02 - 0.28 * ss(-d / 0.8);
  if (d < 0.32) return NIVEL + 0.015 + (-NIVEL - 0.015) * ss(d / 0.32);
  return 0;
}

/* ---------- las casas: las ínsulas de la Subura (ladrillo, tres pisos, tiendas abajo, ropa tendida) y la domus junto al río ---------- */
export const CASAS = [[15.0, 3.7, 0, 'insula', { w: 1.3, d: 1.0, pisos: 3, balcon: true, tiendas: 3, abierta: 1, semilla: 1 }], [17.0, 4.6, -Math.PI / 2, 'insula', { w: 1.0, d: 0.85, pisos: 3, tiendas: 2, abierta: 0, toldo: RO.tela, ropa: true, semilla: 3 }],
  [14.4, 5.7, 0, 'insula', { w: 0.8, d: 0.8, pisos: 2, tiendas: 1, abierta: 9, terraza: true, semilla: 5 }], [16.4, 6.6, 0, 'insula', { w: 0.9, d: 0.75, pisos: 2, tiendas: 2, abierta: 1, semilla: 7 }],
  [7.6, 15.3, 0, 'domus', { w: 1.2, d1: 0.8, d2: 0.75, h: 0.5 }]];
export const FUENTES = [[15.7, 7.4]];
export function casas(K) {
  const g = new THREE.Group(), puestas = []; g.userData.puestas = puestas;
  CASAS.forEach(([x, z, ry, tipo, o], i) => {
    const c = tipo === 'domus' ? domus(K, o) : insula(K, o); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c);
    const w = o.w, d = tipo === 'domus' ? o.d1 + o.d2 : o.d, gira = Math.abs(Math.sin(ry)) > 0.7;
    puestas.push({ x, z, w: gira ? d : w, d: gira ? w : d, i, tipo });
  });
  FUENTES.forEach(([x, z]) => { const f = fuente(K); f.position.set(x, 0, z); g.add(f); });
  /* las ánforas apoyadas en la puerta de la taberna y el banco de piedra junto a la fuente */
  const banco = K.malla(K.caja(0.36, 0.07, 0.1), RO.travD, { grosor: 0.002 }); banco.position.set(15.25, 0.035, 7.55); g.add(banco);
  return g;
}

/* ---------- los bosquecillos (x, z, cuántos, radio, semilla, parte de cipreses): pinos piñoneros y cipreses ---------- */
export const BOSQUES = [[7.95, 17.4, 4, 0.5, 3, 0.3], [5.05, 10.7, 4, 0.45, 4, 0.8], [17.5, 16.0, 3, 0.36, 5, 0.4], [13.9, 7.65, 3, 0.45, 6, 0.9], [16.75, 2.75, 4, 0.6, 8, 0.3],
  [12.55, 17.3, 3, 0.42, 9, 0.6], [17.35, 12.0, 2, 0.3, 10, 0.5]];
export function vegetacion(K, vivos, libre = () => true) {
  const g = new THREE.Group(), r = azar(1404), puestos = [], propios = new Map();
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  BOSQUES.forEach(([x, z, n, rr, sem, cip]) => {
    const a = arboleda(K, n, rr, sem, { cipreses: cip });
    a.children.slice().forEach(t => {
      const tx = t.position.x + x, tz = t.position.z + z;
      if (tx < E0 + 0.15 || tz < E0 + 0.15 || tx > E1 - 0.15 || tz > E1 - 0.15 || altura(tx, tz) < -0.01 || enCamino(tx, tz, 0.05) || !libre(tx, tz, 0.2)) return;
      t.position.set(tx, -0.02, tz); g.add(t); puestos.push({ x: tx, z: tz, r: 0.16 });
    });
  });
  g.userData.puestos = puestos;
  /* las copas que el año tiñe: cada color de follaje con su material propio */
  const FOLLAJE = [RO.pino, RO.pinoD, RO.pinoL, RO.cipres, RO.cipresD, RO.cipresL].map(c => new THREE.Color(c).getHexString());
  const adoptar = obj => obj.traverse(o => { if (!o.isMesh || !o.material || !o.material.color) return; const hx = o.material.color.getHexString(); if (!FOLLAJE.includes(hx)) return;
    if (!propios.has(hx)) propios.set(hx, { m: o.material.clone(), base: new THREE.Color('#' + hx) }); o.material = propios.get(hx).m; });
  adoptar(g);
  /* los juncos y las cañas de las orillas, en matas */
  const jun = [];
  for (let k = 0; k < 5000 && jun.length < 230; k++) {
    const x = E0 + 0.05 + r() * 6.5, z = E0 + 0.1 + r() * (LADO - 0.2), a = altura(x, z);
    if (a > -0.055 || a < -0.17 || L.enPuente(x, z) || Math.abs(z - L.PUENTE.y) < 0.35 || L.enIsla(x, z, 0.05)) continue; jun.push([x, z, 0.12 + r() * 0.14, r()]);
  }
  const ju = K.instancias(K.cilindro(0.005, 0.009, 1, 4), '#8aa45a', Math.max(1, jun.length), { sinTinta: true }); ju.material = ju.material.clone();
  jun.forEach(([x, z, h, k], i) => { q.setFromEuler(e.set((k - 0.5) * 0.35, 0, (k - 0.5) * 0.35)); m4.compose(v.set(x, NIVEL + h / 2, z), q, s.set(1, h, 1)); ju.setMatrixAt(i, m4); });
  /* las matas de la orilla y de los prados (mirtos, laureles y acantos), redondas y bajas */
  const mat = [];
  for (let k = 0; k < 4000 && mat.length < 70; k++) {
    const x = E0 + 0.2 + r() * (LADO - 0.4), z = E0 + 0.2 + r() * (LADO - 0.4), d = L.distTiber(x, z);
    const orilla = d > 0.35 && d < 1.0, pr = prado(x, z) && !enPoligono(PLAZA, x, z);
    if (!(orilla || (pr && r() < 0.25)) || enCamino(x, z, 0.12) || L.enColina(x, z, 0.1) || reservado(x, z, 0.12) || !libre(x, z, 0.15)) continue;
    mat.push([x, z, 0.05 + r() * 0.04, r()]);
  }
  const ma = K.instancias(K.esfera(1, 0.45), '#7f9f56', Math.max(1, mat.length), { grosor: 0.002 }); ma.material = ma.material.clone();
  mat.forEach(([x, z, rr, k], i) => { m4.compose(v.set(x, rr * 0.6, z), q.setFromEuler(e.set(0, k * 6, 0)), s.set(rr * 1.3, rr, rr * 1.1)); ma.setMatrixAt(i, m4); });
  /* las amapolas y las margaritas de la primavera, en los prados (el año las muestra o las esconde) */
  const flo = [];
  for (let k = 0; k < 6000 && flo.length < 160; k++) {
    const x = E0 + 0.2 + r() * (LADO - 0.4), z = E0 + 0.2 + r() * (LADO - 0.4);
    if (!prado(x, z) || enPoligono(PLAZA, x, z) || enCamino(x, z, 0.08) || L.enColina(x, z, 0.1) || L.distTiber(x, z) < 0.4 || reservado(x, z, 0.06)) continue;
    flo.push([x, z, r()]);
  }
  const fl = K.instancias(K.esfera(1, 0.3), '#ffffff', Math.max(1, flo.length), { sinTinta: true, sombra: false }); fl.material = fl.material.clone();   // blanco: el color de cada flor va en la instancia
  const cf = new THREE.Color();
  flo.forEach(([x, z, k], i) => { m4.compose(v.set(x, 0.02, z), q.identity(), s.set(0.018, 0.012, 0.018)); fl.setMatrixAt(i, m4); fl.setColorAt?.(i, cf.set(k < 0.6 ? '#d8483a' : k < 0.85 ? '#f4efe0' : '#e9c24a')); });
  if (fl.instanceColor) fl.instanceColor.needsUpdate = true;
  g.add(ju, ma, fl);
  const c = new THREE.Color(), c2 = new THREE.Color();
  /* el pino y el ciprés no pierden la hoja: el verano los aclara, el invierno los oscurece un poco */
  const TINTE = [['#b4d06a', 0.1], ['#c9c46a', 0.12], ['#b09a5a', 0.1], ['#4a6a52', 0.12]];
  const copa = (base, i) => c2.copy(base).lerp(c.set(TINTE[i][0]), TINTE[i][1]).clone();
  return {
    g, adoptar, puestos,
    vestir(i, k, j) {
      for (const { m, base } of propios.values()) m.color.copy(copa(base, i).lerp(copa(base, j), k));
      const JU = ['#8aa65a', '#a6a45a', '#a8945a', '#7f9a5e'], MA = ['#7fa456', '#8f9a58', '#8f8a52', '#6f9452'];
      ju.material.color.set(JU[i]).lerp(c.set(JU[j]), k); ma.material.color.set(MA[i]).lerp(c.set(MA[j]), k);
      const flor = [1, 0.35, 0, 0][i] * (1 - k) + [1, 0.35, 0, 0][j] * k; fl.visible = flor > 0.05; fl.count = Math.round(flo.length * flor);
    },
  };
}

/* ---------- el suelo: cada triángulo sabe qué es (agua, playa, orilla, camino, explanada, prado, ciudad) y el año lo pinta ---------- */
const AGUA = 0, PLAYA = 1, ORILLA = 2, CAMINO = 3, EXPLANADA = 4, PRADO = 5, CIUDAD = 6;
function clase(x, z, h) {
  if (h < NIVEL + 0.004) return AGUA;
  const d = L.distTiber(x, z);
  if (d > 0 && d < 0.34) return PLAYA;
  if (enCamino(x, z)) return CAMINO;
  if (enPoligono(PLAZA, x, z)) return EXPLANADA;
  if (d > 0 && d < 1.3) return ORILLA;
  if (prado(x, z)) return PRADO;
  return CIUDAD;
}
/* la paleta del año (primavera, verano, otoño, invierno): el suelo claro y cálido; los verdes, vivos */
const CIUDADES = [['#ecdcb4', '#e7d6ab', '#efe2be', '#e3d1a5', '#eadab1'], ['#efdfb4', '#ead9ab', '#f2e4bc', '#e6d4a6', '#eddcb0'], ['#eadab0', '#e5d4a7', '#ede0ba', '#e1cfa1', '#e8d8ad'], ['#e6dab6', '#e1d4ad', '#eadfbe', '#ddd0a8', '#e4d8b2']];
const PRADOS = [['#bfd58e', '#b7cf86', '#c6da96', '#b1ca80', '#bbd28a'], ['#d6cf8e', '#cfc887', '#dcd597', '#c9c282', '#d2cb8b'], ['#d2be86', '#cab67e', '#d8c58e', '#c4b078', '#ceba82'], ['#b6cc8e', '#aec686', '#bdd296', '#a8c080', '#b2c98a']];
const ORILLAS = [['#c4d793', '#bcd18b'], ['#d4d394', '#ccca8c'], ['#cdc28c', '#c5ba84'], ['#b2ca8e', '#aac286']];
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
      case AGUA: return c.set('#d2c79a').lerp(c2.set('#8f9474'), Math.min(1, (NIVEL - h) / 0.22));
      case PLAYA: return c.set(['#efe2b8', '#ece0b4', '#f1e5bf', '#eadcb0', '#eee1b8'][tab]);
      case CAMINO: return c.set(((Math.floor(x * 3) + Math.floor(z * 3)) & 1) ? '#cfc3ad' : '#c7baa2');
      case EXPLANADA: return c.set(((Math.floor(x * 2) + Math.floor(z * 2)) & 1) ? '#f1e6c8' : '#ede1c0');
      case ORILLA: { const d = L.distTiber(x, z); return c.set(ORILLAS[e][tab & 1]).lerp(c2.set(CIUDADES[e][tab]), ss((d - 0.4) / 0.9)); }
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

/* ---------- el agua del Tíber: verde de limo («el rubio Tíber»), más honda al medio, con su corriente río abajo (+z) ---------- */
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
    if (k < 0.3) c.set('#c6dcc0').lerp(c2.set('#94c0b2'), k / 0.3); else c.set('#94c0b2').lerp(c2.set('#5f9a9c'), (k - 0.3) / 0.7);
    col.setXYZ(i, c.r, c.g, c.b);
  }
  const rio = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, transparent: true, opacity: 0.93 })); rio.receiveShadow = true; rio.position.y = NIVEL; rio.userData.vivo = true;
  g.add(rio);
  /* la corriente: estelas claras que bajan siguiendo el eje del río, a distintas distancias de la orilla */
  const P = L.CAUCE.pts, A = L.CAUCE.anchos, largos = [0];
  for (let i = 1; i < P.length; i++) largos.push(largos[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const total = largos[largos.length - 1];
  const enEje = u => { let i = 1; while (i < largos.length - 1 && largos[i] < u) i++; const k = (u - largos[i - 1]) / (largos[i] - largos[i - 1] || 1), dx = P[i][0] - P[i - 1][0], dz = P[i][1] - P[i - 1][1], l = Math.hypot(dx, dz) || 1;
    return { x: P[i - 1][0] + dx * k, z: P[i - 1][1] + dz * k, ancho: A[i - 1] + (A[i] - A[i - 1]) * k, tx: dx / l, tz: dz / l }; };
  const onda = new THREE.PlaneGeometry(0.026, 0.4); onda.userData.propia = true;
  const mo = new THREE.MeshBasicMaterial({ color: '#f4f8ee', transparent: true, opacity: 0.4, depthWrite: false });
  const olas = [], rr = azar(1402);
  for (let k = 0; k < 44; k++) { const m = new THREE.Mesh(onda, mo.clone()); m.rotation.order = 'YXZ'; m.rotation.x = -Math.PI / 2; g.add(m); olas.push({ m, u: rr() * total, lado: (rr() - 0.5) * 0.8, f: rr(), v: 0.09 + rr() * 0.05 }); }
  vivos.push((t, dt) => olas.forEach(o => {
    o.u += (dt || 0) * o.v; if (o.u > total) o.u -= total;
    const q = enEje(o.u), x = q.x - q.tz * o.lado * q.ancho / 2, z = q.z + q.tx * o.lado * q.ancho / 2, f = (t * 0.15 + o.f) % 1;
    o.m.position.set(x, rio.position.y + 0.006, z); o.m.rotation.y = Math.atan2(q.tx, q.tz);
    const ok = z > E0 + 0.2 && z < E1 - 0.2 && x > E0 + 0.05 && altura(x, z) < -0.16 && !L.enIsla(x, z, 0.12) && Math.abs(z - L.PUENTE.y) > 0.4;
    o.m.material.opacity = ok ? 0.42 * Math.sin(Math.PI * f) : 0;
  }));
  return { g, rio, enEje, total };
}

/* ---------- la losa del diorama: el corte de tierra con el río asomando, y en el corte los tiestos de ánforas (en Roma
   se tiraban rotas: el monte Testaccio entero está hecho de ellas) ---------- */
export function losa(K) {
  const g = new THREE.Group();
  const pared = (fijo, eje) => {
    const pos = [], col = [], c = new THREE.Color(), paso = 0.125;
    const quad = (p0, p1, p2, p3, color) => { c.set(color); for (const p of [p0, p1, p2, p0, p2, p3]) { pos.push(...p); col.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, P = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const xa = eje === 'x' ? fijo : u, za = eje === 'x' ? u : fijo, xb = eje === 'x' ? fijo : u1, zb = eje === 'x' ? u1 : fijo;
      const h0 = altura(xa, za), h1 = altura(xb, zb);
      quad(P(u, h0), P(u1, h1), P(u1, Math.min(h1, 0) - 0.1), P(u, Math.min(h0, 0) - 0.1), h0 < -0.03 ? '#8a8462' : '#d9c296');
      quad(P(u, Math.min(h0, 0) - 0.1), P(u1, Math.min(h1, 0) - 0.1), P(u1, -0.48), P(u, -0.48), PAL.corte1);
      quad(P(u, -0.48), P(u1, -0.48), P(u1, -1.05), P(u, -1.05), PAL.corte2);
      if (h0 < NIVEL || h1 < NIVEL) quad(P(u, NIVEL), P(u1, NIVEL), P(u1, Math.min(NIVEL, h1)), P(u, Math.min(NIVEL, h0)), '#5f9a9c');
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals(); geo.userData.propia = true;
    const m = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide })); m.receiveShadow = false; return m;
  };
  g.add(pared(E1, 'x'), pared(E1, 'z'));
  const caja = (w, h, d, x, y, z, color) => { const m = K.malla(K.caja(w, h, d), color, { grosor: 0.03, sombra: false, recibe: false }); m.position.set(x, y, z); g.add(m); };
  caja(LADO, 0.46, 0.06, CENTRO, -0.23, E0 + 0.03, PAL.corte1); caja(0.06, 0.46, LADO, E0 + 0.03, -0.23, CENTRO, PAL.corte1);
  caja(LADO - 0.02, 0.6, LADO - 0.02, CENTRO, -0.76, CENTRO, PAL.corte2);
  const r = azar(1414);
  for (let i = 0; i < 18; i++) {
    const izq = r() < 0.5, s = E0 + 0.4 + r() * (LADO - 0.8), y = -(0.28 + r() * 0.66), rr = 0.045 + r() * 0.05, tiesto = i % 3 !== 0;
    const p = K.malla(tiesto ? K.caja(rr * 2.2, rr * 0.7, 0.02) : K.roca(rr, 140 + i), tiesto ? [RO.teja, RO.lad, RO.ladL][i % 3] : RO.toba, { sinTinta: true, sombra: false, recibe: false });
    if (tiesto) p.rotation.z = (r() - 0.5) * 1.2; else p.scale.set(1.4, 0.8, 1.4);
    if (izq) p.position.set(s, y, E1 + 0.008); else { p.position.set(E1 + 0.008, y, s); p.rotation.y = Math.PI / 2; }
    g.add(p);
  }
  return g;
}

/* ---------- la barca del Tíber: baja con la corriente por el brazo de la izquierda de la isla, con su carga de ánforas ---------- */
export function barca(K) {
  const g = new THREE.Group(); g.userData.vivo = true; g.userData.barca = true;
  const casco = K.malla(K.capsula(0.1, 0.55, 0.6), RO.maderaD, { grosor: 0.003 }); casco.rotation.x = Math.PI / 2; casco.scale.set(1, 1, 0.5); casco.position.y = 0.0; g.add(casco);
  const borda = K.malla(K.caja(0.15, 0.025, 0.62), RO.madera, { grosor: 0.002 }); borda.position.y = 0.045; g.add(borda);
  [[0.0, -0.08, '#c27a4a'], [0.04, 0.04, '#b56f44'], [-0.04, 0.1, '#d08a58'], [0.03, -0.16, '#b56f44']].forEach(([x, z, cc]) => { const a = K.malla(K.cilindro(0.028, 0.02, 0.09, 6), cc, { grosor: 0.002 }); a.position.set(x, 0.09, z); g.add(a); });
  return g;
}
export { distPoli, enPoligono, h3 };
