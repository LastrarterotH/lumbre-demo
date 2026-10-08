/* ============================================================
   tenochtitlan/maqueta
   Las tres composiciones del tablero para la hoja de bocetos (juego3d/bocetos/tenochtitlan.html): el tablero entero de
   16 × 16 baldosas (x, z de 2 a 18; la cámara mira desde +x +z, así que el fondo es la esquina de x y z chicas) con las
   piezas reales a escala. Es un boceto de la composición: el suelo va en planos de color por zona, el agua es una lámina y
   las anclas de los saberes se marcan con discos numerados. El juego toma de aquí los volcanes y lo que crece (al final).
   LA BRÚJULA (la misma en las tres, y la verdadera): el poniente es +x (el Templo Mayor mira al poniente: su frente da a la
   cámara), el norte +z, el oriente -x y el sur -z. Así los volcanes, que desde Tenochtitlan se ven al sureste, quedan en
   la esquina del fondo, con el Iztaccíhuatl a la izquierda del Popocatépetl, como se ven desde la ciudad; Tlatelolco queda
   al norte (a la izquierda), la calzada de Tlacopan con el acueducto de Chapultepec sale al poniente (abajo a la derecha),
   la del Tepeyac al norte y la de Iztapalapa al sur, hacia la tierra firme del fondo.
   ============================================================ */
import * as THREE from 'three';
import { azar, PAL, fundir } from '../kit.js';
import { crearPersona } from '../actores.js';
import * as M from './monumentos.js';
import { joven } from './piezas.js';

const E0 = 2, E1 = 18, LADO = 16, NIVEL = -0.06;
const ss = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
const ruido = (x, z) => Math.sin(x * 2.3 + z * 0.7) * 0.5 + Math.sin(z * 1.9 - x * 1.3) * 0.5;
const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
const enRect = (x, z, r, m = 0) => x > r[0] - m && x < r[1] + m && z > r[2] - m && z < r[3] + m;
const enRectRedondo = (x, z, [x0, x1, z0, z1], rad) => { const cx = Math.max(x0 + rad, Math.min(x1 - rad, x)), cz = Math.max(z0 + rad, Math.min(z1 - rad, z)); return Math.hypot(x - cx, z - cz) < rad; };
/* las franjas de una chinampa: tierra de `tierra` de ancho y canal hasta completar el `paso`, largas a lo largo del eje */
const franja = (x, z, r, eje = 'x', paso = 0.8, tierra = 0.56) => { if (!enRect(x, z, r)) return null; const u = eje === 'x' ? z - r[2] : x - r[0]; return (u % paso) < tierra ? 'chinampa' : 'canal'; };

/* ---------- LO COMÚN A LAS TRES: los volcanes en la esquina del fondo y la tierra firme a su pie ---------- */
export const POPO = { x: 5.7, z: 2.15, r: 2.45, h: 4.4 };
export const IZTA = { z0: 4.9, z1: 13.6, h: 3.1 };
const CIMAS_IZTA = [{ z: 12.4, h: 0.95, s: 0.6 }, { z: 10.5, h: 1.0, s: 1.2 }, { z: 8.3, h: 0.95, s: 1.0 }, { z: 6.4, h: 0.9, s: 0.9 }];   // la cabeza, el pecho, las rodillas y los pies
/* una sola cresta larga, con sus cuatro cumbres apenas marcadas (la mujer dormida), no cuatro picos */
const altIzta = (x, z) => { const fx = Math.exp(-(((x - E0) / 1.0) ** 1.6)); let m = 0.84 * ss((z - IZTA.z0) / 1.5) * ss((IZTA.z1 - z) / 1.0); for (const c of CIMAS_IZTA) m = Math.max(m, c.h * Math.exp(-(((z - c.z) / (c.s * 1.5)) ** 2))); return IZTA.h * m * fx; };
export function enOrilla(x, z) {
  if (Math.hypot(x - POPO.x, z - POPO.z) < POPO.r + 0.2) return true;
  if (altIzta(x, z) > 0.12) return true;
  return z < 3.15 + 0.25 * ruido(x, z) || x < 3.25 + 0.25 * ruido(z, x);
}
const altOrilla = (x, z) => 0.04 + 0.32 * ss((3.7 - Math.min(x, z)) / 1.7);
/* la isla: un rectángulo de bordes redondeados y algo desparejos, con la bahía al pie del Popocatépetl */
const ISLA = [4.3, 16.9, 4.3, 16.9];
const enIsla = (x, z) => enRectRedondo(x + 0.14 * ruido(x * 1.7, z), z + 0.14 * ruido(z * 1.3, x), ISLA, 1.35) && Math.hypot(x - POPO.x, z - POPO.z) > POPO.r + 0.85;

const ALT = { lago: -0.32, canal: -0.26, isla: 0, recinto: 0.03, plaza: 0.014, calle: 0.01, calzada: 0.035, chinampa: 0.014 };
const COL = {
  isla: ['#e6d5ab', '#e1cfa3', '#eadab2', '#dccb9d', '#e4d3a8'],
  calle: ['#efe6d0', '#eae0c8'], plaza: ['#f0e6cf', '#ebe0c6', '#f3eadb'], recinto: ['#f3ede0', '#ece5d4'],
  chinampa: ['#8fb85a', '#83ae4f', '#98c063'], calzada: ['#e6dabd', '#ddd0b0'],
  orilla: ['#adc26c', '#a2ba63', '#b6c875'], fondo: '#5d8f88',
};

/* ---------- el suelo: la malla de alturas, pintada por zona ---------- */
function suelo(K, zona, alt) {
  const RES = 7, N = LADO * RES, s = 1 / RES, H = new Float32Array((N + 1) * (N + 1));
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) H[i * (N + 1) + j] = alt(E0 + i * s, E0 + j * s);
  const pos = [], col = [], c = new THREE.Color();
  const pintar = (x, z, h) => {
    if (h < -0.005 && h > -0.14) return '#dcc791';                                   // la orilla de arena, apenas sobre el agua
    if (h <= -0.14) return COL.fondo;
    const k = zona(x, z), t = COL[k] || COL.isla;
    if (k === 'recinto') return t[(Math.floor(x * 2.5) + Math.floor(z * 2.5)) % 2];  // las losas estucadas
    if (k === 'chinampa') return t[Math.abs(Math.floor(x * 1.25) * 3 + Math.floor(z * 1.25) * 7) % 3];
    if (k === 'orilla') { const v = new THREE.Color(t[Math.abs(Math.floor(x * 2) * 7 + Math.floor(z * 2) * 13) % 3]); return '#' + v.lerp(new THREE.Color('#6f9a52'), ss((h - 0.12) / 0.2) * 0.6).getHexString(); }
    return t[Math.abs(Math.floor(x * 2) * 7 + Math.floor(z * 2) * 13) % t.length];
  };
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s;
    const h00 = H[i * (N + 1) + j], h10 = H[(i + 1) * (N + 1) + j], h01 = H[i * (N + 1) + j + 1], h11 = H[(i + 1) * (N + 1) + j + 1];
    for (const [a, b, d] of [[[x0, h00, z0], [x0, h01, z1], [x1, h10, z0]], [[x1, h10, z0], [x0, h01, z1], [x1, h11, z1]]]) {
      const cx = (a[0] + b[0] + d[0]) / 3, cz = (a[2] + b[2] + d[2]) / 3, ch = (a[1] + b[1] + d[1]) / 3;
      c.set(pintar(cx, cz, ch));
      for (const q of [a, b, d]) { pos.push(q[0], q[1], q[2]); col.push(c.r, c.g, c.b); }
    }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals(); geo.userData.propia = true;
  return K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false });
}
/* el agua del lago: una lámina turquesa con sus ondas, a la altura del lago */
function agua(K) {
  const t = document.createElement('canvas'); t.width = t.height = 128; const c = t.getContext('2d');
  c.fillStyle = '#63bdb3'; c.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 16; i++) { const y = (i * 37) % 128, xx = (i * 53) % 128; c.strokeStyle = i % 2 ? 'rgba(255,255,255,.42)' : 'rgba(30,120,115,.28)'; c.lineWidth = 2; c.beginPath(); c.moveTo(xx, y); c.quadraticCurveTo(xx + 10, y - 4, xx + 20, y); c.stroke(); }
  const tex = new THREE.CanvasTexture(t); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(LADO / 1.7, LADO / 1.7); tex.userData.propia = true;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(LADO, LADO), K.matMapa(tex)); m.geometry.userData.propia = true; m.rotation.x = -Math.PI / 2; m.position.set(10, NIVEL, 10); m.receiveShadow = true;
  return m;
}
/* la losa del diorama: el corte de tierra en los dos bordes del frente, con el lago asomando */
function losa(K, alt) {
  const g = new THREE.Group();
  const pared = (fijo, eje) => {
    const pos = [], col = [], c = new THREE.Color(), paso = 0.125;
    const quad = (p0, p1, p2, p3, color) => { c.set(color); for (const p of [p0, p1, p2, p0, p2, p3]) { pos.push(...p); col.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, P = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const h0 = eje === 'x' ? alt(fijo - 0.01, u) : alt(u, fijo - 0.01), h1 = eje === 'x' ? alt(fijo - 0.01, u1) : alt(u1, fijo - 0.01), t0 = Math.min(h0, 0.05), t1 = Math.min(h1, 0.05);
      quad(P(u, t0), P(u1, t1), P(u1, t1 - 0.1), P(u, t0 - 0.1), t0 < -0.03 ? '#6a6248' : '#c9b98e');
      quad(P(u, t0 - 0.1), P(u1, t1 - 0.1), P(u1, -0.46), P(u, -0.46), PAL.corte1);
      quad(P(u, -0.46), P(u1, -0.46), P(u1, -1.05), P(u, -1.05), PAL.corte2);
      if (h0 < NIVEL || h1 < NIVEL) quad(P(u, NIVEL), P(u1, NIVEL), P(u1, Math.min(NIVEL, t1)), P(u, Math.min(NIVEL, t0)), '#3f8f8c');
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals(); geo.userData.propia = true;
    return new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide }));
  };
  g.add(pared(E1, 'x'), pared(E1, 'z'));
  const r = azar(2707);
  for (let i = 0; i < 18; i++) {                         // piedritas, obsidiana y tiestos de tezontle en el corte
    const izq = r() < 0.5, s = E0 + 0.4 + r() * (LADO - 0.8), y = -(0.3 + r() * 0.65), rr = 0.05 + r() * 0.06;
    const p = K.malla(K.roca(rr, 140 + i), i % 3 ? PAL.piedrita : i % 2 ? '#2a2a30' : M.TE.tezontle, { sinTinta: true, sombra: false, recibe: false }); p.scale.set(1.4, 0.8, 1.4);
    if (izq) p.position.set(s, y, E1 + 0.005); else p.position.set(E1 + 0.005, y, s);
    g.add(p);
  }
  return g;
}
/* el Popocatépetl: el cono de laderas cóncavas, el bosque abajo, la roca y la nieve con sus barrancas; humea. El tablero lo
   corta en su borde (la cara cortada mira hacia atrás y no se ve) */
function popocatepetl(K) {
  const { x: cx, z: cz, r: R, h: H } = POPO, g = new THREE.Group();
  const perfil = [[R, 0], [R * 0.8, H * 0.09], [R * 0.6, H * 0.24], [R * 0.43, H * 0.45], [R * 0.28, H * 0.68], [R * 0.17, H * 0.9], [R * 0.13, H], [R * 0.08, H * 0.95]].map(([r, y]) => new THREE.Vector2(r, y));
  const geo = new THREE.LatheGeometry(perfil, 36).toNonIndexed(), p = geo.getAttribute('position');
  for (let i = 0; i < p.count; i++) p.setXYZ(i, Math.max(E0 + 0.01, p.getX(i) + cx), p.getY(i), Math.max(E0 + 0.01, p.getZ(i) + cz));
  const pg = M.pintarCaras(geo, (n, x, y, z) => {
    const a = Math.atan2(z - cz, x - cx), u = y / H, nieve = 0.47 + 0.05 * Math.sin(a * 7) + 0.03 * Math.sin(a * 17);
    if (u > nieve) return hash(Math.round(a * 9), 1) > 0.76 && u < 0.78 ? '#9a9488' : u > 0.72 ? '#f5f7f9' : '#e7ecf0';
    if (u > 0.22) return ['#a39a8c', '#958c7e', '#aca292'][Math.floor(hash(Math.round(a * 11), Math.round(u * 6)) * 3)];
    return ['#62904c', '#6f9a54', '#588546'][Math.floor(hash(Math.round(a * 13), Math.round(u * 9)) * 3)];
  });
  g.add(K.malla(pg, '#ffffff', { vertexColors: true, grosor: 0.02 }));
  const humo = new THREE.Group(); humo.position.set(cx + 0.05, H + 0.25, cz + 0.05); humo.userData.humo = true; humo.userData.y0 = H + 0.25; g.add(humo);
  [[0, 0, 0.22], [0.18, 0.28, 0.27], [0.42, 0.55, 0.32], [0.7, 0.78, 0.26]].forEach(([x, y, r]) => { const b = K.malla(K.esfera(r, 0.6), '#eeeae2', { sinTinta: true, transparent: true, opacity: 0.8 }); b.position.set(x, y, x * 0.4); humo.add(b); });
  return g;
}
/* el Iztaccíhuatl, la mujer dormida: la cresta larga a lo largo del borde del oriente, con la cabeza, el pecho, las rodillas
   y los pies nevados */
function iztaccihuatl(K) {
  const NX = 24, NZ = 72, x1 = E0 + 2.6, pos = [];
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
    const xa = E0 + (x1 - E0) * i / NX, xb = E0 + (x1 - E0) * (i + 1) / NX, za = IZTA.z0 - 0.6 + (IZTA.z1 - IZTA.z0 + 1.2) * j / NZ, zb = IZTA.z0 - 0.6 + (IZTA.z1 - IZTA.z0 + 1.2) * (j + 1) / NZ;
    const v = (x, z) => [x, Math.max(0, altIzta(x, z) - 0.06), z], a = v(xa, za), b = v(xa, zb), c = v(xb, za), d = v(xb, zb);
    if (Math.max(a[1], b[1], c[1], d[1]) < 0.02) continue;
    pos.push(...a, ...b, ...c, ...c, ...b, ...d);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const pg = M.pintarCaras(geo, (n, x, y, z) => {
    const u = y / IZTA.h, nieve = 0.5 + 0.06 * Math.sin(z * 5.1) + 0.03 * Math.sin(z * 13);
    if (u > nieve) return hash(Math.round(z * 4), 2) > 0.8 && u < 0.66 ? '#9a9488' : u > 0.64 ? '#f5f7f9' : '#e7ecf0';
    if (u > 0.18) return ['#a39a8c', '#958c7e', '#aca292'][Math.floor(hash(Math.round(z * 5), Math.round(u * 8)) * 3)];
    return ['#62904c', '#6f9a54', '#588546'][Math.floor(hash(Math.round(z * 6), Math.round(x * 6)) * 3)];
  });
  return K.malla(pg, '#ffffff', { vertexColors: true, grosor: 0.018 });
}

/* ---------- los que crecen, en bosquecillos: los pinos de la ladera, los ahuejotes de las chinampas, los tulares ---------- */
function instanciar(K, lista, geo, color, op, f) {
  const m = K.instancias(geo, color, lista.length, op), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
  lista.forEach((it, i) => { f(it, v, q, s); m4.compose(v, q, s); m.setMatrixAt(i, m4); });
  return m;
}
function pinos(K, zona, alt, semilla = 11) {
  const r = azar(semilla), lista = [];
  for (let k = 0; k < 900 && lista.length < 70; k++) {
    const x = E0 + 0.15 + r() * LADO, z = E0 + 0.15 + r() * LADO;
    if (zona(x, z) !== 'orilla' || Math.hypot(x - POPO.x, z - POPO.z) < POPO.r * 0.86 || altIzta(x, z) > 0.5) continue;
    lista.push([x, z, alt(x, z), 0.7 + r() * 0.5]);
  }
  const g = new THREE.Group();
  g.add(instanciar(K, lista, K.cono(0.13, 0.5, 7), '#3f6a40', { grosor: 0.004 }, ([x, z, h, s], v, q, sc) => { v.set(x, h + 0.25 * s, z); sc.setScalar(s); }));
  g.add(instanciar(K, lista, K.cono(0.09, 0.3, 7), '#55874a', { grosor: 0.003 }, ([x, z, h, s], v, q, sc) => { v.set(x, h + 0.52 * s, z); sc.setScalar(s); }));
  return g;
}
function ahuejotes(K, lista) {
  const g = new THREE.Group();
  g.add(instanciar(K, lista, K.cilindro(0.02, 0.03, 0.5, 6), '#6a5236', { grosor: 0.002 }, ([x, z, s], v, q, sc) => { v.set(x, 0.25 * s, z); sc.setScalar(s); }));
  g.add(instanciar(K, lista, K.esfera(0.12, 0.7), '#6f9a48', { grosor: 0.005 }, ([x, z, s], v, q, sc) => { v.set(x, 0.62 * s, z); sc.set(s, s * 3.4, s); }));
  g.add(instanciar(K, lista, K.esfera(0.08, 0.6), '#94bc62', { grosor: 0.003 }, ([x, z, s], v, q, sc) => { v.set(x + 0.035 * s, 0.72 * s, z + 0.04 * s); sc.set(s, s * 2.6, s); }));
  return g;
}
function tulares(K, zona, alt, semilla = 5) {
  const r = azar(semilla), lista = [];
  for (let k = 0; k < 9000 && lista.length < 340; k++) {
    const x = E0 + 0.2 + r() * (LADO - 0.4), z = E0 + 0.2 + r() * (LADO - 0.4), h = alt(x, z);
    if (h > -0.1 || zona(x, z) === 'canal') continue;
    if ([[0.22, 0], [-0.22, 0], [0, 0.22], [0, -0.22]].some(([a, b]) => alt(x + a, z + b) > -0.02)) lista.push([x, z, 0.2 + r() * 0.2, r()]);
  }
  const e = new THREE.Euler();
  return instanciar(K, lista, K.cilindro(0.006, 0.011, 1, 4), '#8a9e52', { sinTinta: true }, ([x, z, h, k], v, q, sc) => { q.setFromEuler(e.set((k - 0.5) * 0.35, 0, (k - 0.5) * 0.35)); v.set(x, NIVEL + h / 2, z); sc.set(1, h, 1); });
}
/* los ahuejotes en hilera por los bordes de las chinampas (de `paso` en `paso`) */
function bordes(r, eje = 'x', paso = 0.8, cada = 0.62, semilla = 1) {
  const out = [], rr = azar(semilla);
  if (eje === 'x') { for (let z = r[2] + 0.04; z < r[3]; z += paso) for (let x = r[0] + 0.25; x < r[1] - 0.1; x += cada) if (rr() < 0.8) out.push([x + (rr() - 0.5) * 0.1, z, 0.95 + rr() * 0.35]); }
  else { for (let x = r[0] + 0.04; x < r[1]; x += paso) for (let z = r[2] + 0.25; z < r[3] - 0.1; z += cada) if (rr() < 0.8) out.push([x, z + (rr() - 0.5) * 0.1, 0.95 + rr() * 0.35]); }
  return out;
}

/* ---------- las marcas de las anclas: un disco ámbar con su número, que mira siempre a la cámara ---------- */
function marca(K, texto) {
  const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d');
  g.fillStyle = 'rgba(46,42,37,.35)'; g.beginPath(); g.arc(48, 52, 40, 0, 7); g.fill();
  g.fillStyle = '#f2b441'; g.beginPath(); g.arc(48, 46, 40, 0, 7); g.fill(); g.lineWidth = 5; g.strokeStyle = '#fff6df'; g.stroke();
  g.fillStyle = '#3b2a1e'; g.font = '800 38px "Avenir Next", Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(texto, 48, 48);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.propia = true;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.setScalar(0.85); s.renderOrder = 10;
  return s;
}

/* ---------- el armado: el suelo, el agua, la losa, los volcanes y lo que cada composición pone ---------- */
function armar(K, plan) {
  const g = new THREE.Group(), quieto = new THREE.Group(), vivo = new THREE.Group(); g.add(quieto, vivo);
  const zona = plan.zona, alt = (x, z) => { const k = zona(x, z); return k === 'orilla' ? altOrilla(x, z) : ALT[k]; };
  quieto.add(suelo(K, zona, alt), losa(K, alt), popocatepetl(K), iztaccihuatl(K), pinos(K, zona, alt), tulares(K, zona, alt));
  g.add(agua(K));
  const pon = (o, x, z, ry = 0, s = 1, y = null) => { o.position.set(x, y ?? alt(x, z), z); o.rotation.y = ry; if (s !== 1) o.scale.multiplyScalar(s); quieto.add(o); return o; };
  const gente = (x, z, i, mira = null, pose = 'quieto') => { const p = crearPersona(K, joven(i, { edad: undefined })); p.anim(0, { pose, instantaneo: true }); p.obj.position.set(x, alt(x, z), z); if (mira) p.obj.rotation.y = Math.atan2(mira[0] - x, mira[1] - z); vivo.add(p.obj); return p; };
  const canoa = (x, z, ry, carga = 'amate') => { const c = M.canoa(K, { carga }); c.position.set(x, NIVEL + 0.01, z); c.rotation.y = ry; quieto.add(c); return c; };
  const puente = (x, z, w, d) => {                       // el puente de vigas: se quitaban, y el agua seguía pasando
    const b = new THREE.Group(), n = Math.floor(Math.max(w, d) / 0.12);
    b.add(K.malla(K.caja(w, 0.05, d), M.TE.madera, { grosor: 0.004 }));
    for (let k = 0; k < n; k++) { const l = K.malla(K.caja(w > d ? 0.012 : w + 0.004, 0.054, w > d ? d + 0.004 : 0.012), M.TE.maderaD, { sinTinta: true }); if (w > d) l.position.x = -w / 2 + 0.06 + k * 0.12; else l.position.z = -d / 2 + 0.06 + k * 0.12; b.add(l); }
    return pon(b, x, z, 0, 1, 0.045);
  };
  plan.poner({ K, pon, gente, canoa, puente, alt, quieto, vivo });
  fundir(K, quieto, 0.012);
  for (const [t, x, z] of plan.anclas) { const s = marca(K, t); s.position.set(x, alt(x, z) + 0.75, z); vivo.add(s); const an = K.malla(K.toro(0.2, 0.025, Math.PI * 2, 0.6), '#f2b441', { sinTinta: true }); an.rotation.x = Math.PI / 2; an.position.set(x, alt(x, z) + 0.03, z); vivo.add(an); }
  g.userData.plan = plan;
  return g;
}

/* el recinto sagrado en el tablero: el piso, el muro de serpientes y lo que cabe adentro, con el templo mirando al poniente */
function recinto(c, R, tz, { pelota = true, calmecac = true } = {}) {
  const { K, pon } = c, cx = (R[0] + R[1]) / 2, cz = (R[2] + R[3]) / 2;
  const mu = M.coatepantli(K, R[1] - R[0], R[3] - R[2], { puertas: [0, 1, 2] }); pon(mu, cx, cz);
  const t = M.templo7(K, 3); pon(t, R[0] + 2.75, tz, Math.PI / 2);                 // la plataforma va de -2,45 a 2,84 en su eje
  const eh = M.temploRedondo(K); pon(eh, R[1] - 0.95, tz, -Math.PI / 2, 0.8);       // mirando al Templo Mayor
  if (pelota) pon(M.tlachtli(K), R[1] - 0.95, R[2] + 0.95, Math.PI / 2, 0.72);
  if (calmecac) pon(M.calmecacGrande(K, { templo: false }), R[1] - 0.85, R[3] - 0.95, Math.PI / 2, 0.52);
  [-1, 1].forEach(l => pon(M.braseroGrande(K, 1.1), R[1] - 2.0, tz + l * 1.05));
  return t;
}

/* ---------- LAS TRES COMPOSICIONES ---------- */
export const PLANES = {
  /* A · LA ISLA ENTERA: la isla llena el tablero y el lago es su borde; el recinto al fondo, con las tres calzadas que salen
     de sus puertas; un canal cruza la ciudad; las chinampas en los dos flancos; el barrio de las escuelas al frente, con su
     plaza. */
  isla: (() => {
    const REC = [4.75, 12.45, 4.75, 11.25], CHI1 = [4.45, 7.45, 12.35, 16.75], CHI2 = [12.85, 16.75, 4.55, 7.45], PLAZA = [11.55, 14.2, 12.45, 14.1];
    const zona = (x, z) => {
      if (enOrilla(x, z)) return 'orilla';
      if (enRect(x, z, [8.38, 8.82, 16.0, 18.1]) || enRect(x, z, [16.0, 18.1, 7.78, 8.22]) || enRect(x, z, [8.38, 8.82, 1.9, 5.0])) return 'calzada';
      if (!enIsla(x, z)) return 'lago';
      if (enRect(x, z, REC)) return 'recinto';
      if (enRect(x, z, [8.38, 8.82, 11.2, 16.9]) || enRect(x, z, [12.4, 16.9, 7.78, 8.22]) || enRect(x, z, [8.38, 8.82, 4.0, 4.8])) return 'calle';
      if (Math.abs(z - 12.15) < 0.16 && x < 16.6) return 'canal';
      const ch = franja(x, z, CHI1, 'x') || franja(x, z, CHI2, 'z'); if (ch) return ch;
      if (enRect(x, z, PLAZA)) return 'plaza';
      return 'isla';
    };
    return {
      zona, anclas: [['51', 16.3, 11.0], ['52', 15.55, 10.35], ['53', 12.85, 10.35], ['54', 11.9, 14.45], ['55', 13.1, 11.35], ['56', 13.2, 12.95], ['P', 16.1, 13.5], ['E', 17.25, 10.95]],
      poner(c) {
        const { K, pon, gente, canoa, puente } = c;
        recinto(c, REC, 8.0);
        pon(M.teocalliBarrio(K), 14.9, 9.75);
        pon(M.barrio(K, 'macehual'), 14.85, 15.2, Math.PI, 1, 0);
        pon(M.barrio(K, 'pilli'), 10.2, 15.3, Math.PI / 2, 1, 0);
        pon(M.barrio(K, 'chinampa', { suelo: false }), 14.75, 5.75, Math.PI / 2, 1, 0.014);
        pon(M.acueducto(K, 4.4), 15.0, 8.47, 0, 1, 0.01);
        puente(8.6, 12.15, 0.6, 0.5); puente(13.9, 12.15, 0.7, 0.5); puente(16.4, 8.0, 0.55, 0.62); puente(8.6, 16.6, 0.6, 0.5); puente(8.6, 3.9, 0.6, 0.5);
        c.quieto.add(ahuejotes(K, [...bordes(CHI1, 'x', 0.8, 0.62, 3), ...bordes(CHI2, 'z', 0.8, 0.62, 4)]));
        [[5.2, 11.6, 1.0], [5.9, 12.0, 0.85], [4.9, 12.3, 0.8], [16.3, 12.7, 0.9], [16.4, 13.5, 0.75], [11.6, 16.3, 0.85], [12.3, 16.5, 0.7]].forEach(([x, z, s], i) => pon(M.ahuehuete(K, s, i + 1), x, z));
        canoa(16.0, 12.15, 0, 'maiz'); canoa(10.9, 12.15, Math.PI, 'amate'); canoa(17.45, 13.2, Math.PI / 2); canoa(17.4, 5.2, Math.PI / 2 + 0.3, 'maiz'); canoa(9.8, 17.45, 0.2); canoa(16.95, 10.55, Math.PI, 'amate');
        const em = M.embarcadero(K, 0.9); pon(em, 16.75, 10.95, 0, 1, 0.01);
        [[12.4, 13.0, 1], [12.9, 12.75, 2], [13.5, 13.2, 3], [12.6, 13.6, 4], [13.6, 13.75, 5], [12.0, 13.2, 6], [11.75, 14.0, 7], [15.6, 10.75, 8], [15.25, 11.05, 9], [12.6, 10.35, 10], [6.0, 14.0, 11], [5.4, 15.6, 12]].forEach(([x, z, i]) => gente(x, z, i, [13.0, 13.25], i > 10 ? 'labrar' : 'quieto'));
      },
    };
  })(),
  /* B · LAS CHINAMPAS AL FRENTE: la ciudad estucada atrás, con el recinto; al frente, el barrio del agua, las franjas verdes
     de las chinampas con sus canales, sus ahuejotes y sus jacales; las escuelas en la orilla de la ciudad, de cara a las
     chinampas donde los jóvenes salen al tequio, y el tianguis junto al agua. */
  chinampas: (() => {
    const REC = [4.75, 12.15, 4.85, 10.95], BORDE = 23.3, PLAZA = [12.55, 14.75, 11.25, 13.35], SOLAR = [13.35, 16.6, 8.45, 11.1], CASAS = [5.6, 9.0, 12.2, 15.2];
    const enChin = (x, z) => { const zk = Math.floor((z - 4.3) / 0.8) * 0.8 + 4.3 + 0.28; return x + zk >= BORDE; };
    const zona = (x, z) => {
      if (enOrilla(x, z)) return 'orilla';
      if (enRect(x, z, [8.23, 8.67, 16.0, 18.1]) || enRect(x, z, [16.0, 18.1, 7.68, 8.12]) || enRect(x, z, [8.23, 8.67, 1.9, 5.0])) return 'calzada';
      if (!enIsla(x, z)) return 'lago';
      if (enRect(x, z, REC)) return 'recinto';
      if (enRect(x, z, [8.23, 8.67, 10.9, 16.9]) || enRect(x, z, [12.1, 16.9, 7.68, 8.12]) || enRect(x, z, [8.23, 8.67, 4.0, 4.9])) return 'calle';
      if (enRect(x, z, PLAZA)) return 'plaza';
      if (enRect(x, z, SOLAR) || enRect(x, z, CASAS)) return 'isla';
      if (enChin(x, z)) return franja(x, z, [2, 18, 4.3, 18], 'x') || 'isla';
      return 'isla';
    };
    return {
      zona, anclas: [['51', 16.2, 12.1], ['52', 15.6, 9.9], ['53', 12.55, 10.45], ['54', 10.0, 12.6], ['55', 13.25, 9.25], ['56', 12.0, 11.7], ['P', 8.9, 15.4], ['E', 15.55, 13.05]],
      poner(c) {
        const { K, pon, gente, canoa, puente } = c;
        recinto(c, REC, 7.9, { pelota: false });
        pon(M.teocalliBarrio(K), 14.85, 9.55);
        pon(M.barrio(K, 'macehual'), 7.25, 13.7, Math.PI / 2, 1, 0);
        pon(M.barrio(K, 'pilli'), 13.9, 5.6, -Math.PI / 2, 1, 0);
        pon(M.barrio(K, 'chinampa', { suelo: false }), 12.0, 15.6, 0, 1, 0.014);
        [[15.4, 15.4, 0], [10.2, 16.4, 0.3]].forEach(([x, z, r]) => pon(M.jacal(K, { w: 0.5, d: 0.42, h: 0.28, techo: 0.32 }), x, z, r));
        pon(M.cuexcomatl(K, 1.0), 16.1, 15.5);
        pon(M.acueducto(K, 4.7), 14.5, 8.37, 0, 1, 0.01);
        const ah = []; for (let z = 4.3 + 0.04; z < 16.9; z += 0.8) for (let x = 4.6; x < 16.7; x += 0.7) { if (x + z - 0.0 > BORDE + 0.4 && enIsla(x, z) && !enRect(x, z, PLAZA, 0.3) && !enRect(x, z, SOLAR, 0.2) && !enRect(x, z, CASAS, 0.2) && !enRect(x, z, [8.0, 8.9, 10, 18]) && hash(x, z) < 0.36) ah.push([x, z, 0.95 + hash(z, x) * 0.35]); }
        c.quieto.add(ahuejotes(K, ah));
        [[5.3, 11.5, 1.0], [6.0, 11.7, 0.8], [13.0, 4.6, 0.85], [16.2, 6.9, 0.8]].forEach(([x, z, s], i) => pon(M.ahuehuete(K, s, i + 1), x, z));
        puente(8.45, 16.6, 0.6, 0.5); puente(16.4, 7.9, 0.55, 0.62); puente(8.45, 3.9, 0.6, 0.5);
        canoa(13.8, 14.45, 0, 'maiz'); canoa(10.9, 15.25, Math.PI, 'amate'); canoa(15.5, 13.75, 0.1); canoa(17.45, 12.0, Math.PI / 2); canoa(9.5, 17.45, 0.2, 'maiz'); canoa(15.0, 16.85, Math.PI);
        const em = M.embarcadero(K, 0.8); pon(em, 14.8, 13.05, 0, 1, 0.01);
        [[13.2, 12.0, 1], [13.8, 11.9, 2], [14.3, 12.4, 3], [13.4, 12.8, 4], [12.0, 11.3, 5], [10.3, 12.3, 6], [15.2, 10.6, 7], [15.6, 11.0, 8], [14.0, 15.0, 9], [12.6, 14.25, 10], [16.0, 14.5, 11], [9.2, 15.0, 12]].forEach(([x, z, i]) => gente(x, z, i, [13.6, 12.3], i > 8 ? 'labrar' : 'quieto'));
      },
    };
  })(),
  /* C · LAS DOS CIUDADES: Tenochtitlan al sur (a la derecha) con su recinto al fondo, y Tlatelolco al norte (a la izquierda),
     con su templo gemelo, más chico, y el gran mercado; un canal las separa. El barrio de las escuelas, al frente a la
     derecha; el mercado es el gran suelo abierto donde se junta la gente. */
  gemelas: (() => {
    const REC = [4.75, 12.15, 4.9, 10.45], TLA = [4.6, 8.4, 11.35, 16.5], MERC = [8.4, 12.1, 11.6, 16.2], CHI = [12.75, 16.75, 4.55, 7.2];
    const zona = (x, z) => {
      if (enOrilla(x, z)) return 'orilla';
      if (enRect(x, z, [9.78, 10.22, 16.0, 18.1]) || enRect(x, z, [16.0, 18.1, 7.45, 7.9]) || enRect(x, z, [8.23, 8.67, 1.9, 5.0])) return 'calzada';
      if (!enIsla(x, z)) return 'lago';
      if (enRect(x, z, REC) || enRect(x, z, TLA)) return 'recinto';
      if (enRect(x, z, MERC)) return 'plaza';
      if (enRect(x, z, [9.78, 10.22, 16.0, 16.9]) || enRect(x, z, [12.1, 16.9, 7.45, 7.9]) || enRect(x, z, [8.23, 8.67, 4.0, 4.95])) return 'calle';
      if (Math.abs(z - 10.95) < 0.17 && x < 16.6) return 'canal';
      const ch = franja(x, z, CHI, 'z'); if (ch) return ch;
      return 'isla';
    };
    return {
      zona, anclas: [['51', 16.2, 11.6], ['52', 15.75, 9.95], ['53', 12.85, 9.6], ['54', 12.3, 15.3], ['55', 13.6, 11.45], ['56', 11.6, 11.6], ['P', 16.05, 13.2], ['E', 17.25, 11.75]],
      poner(c) {
        const { K, pon, gente, canoa, puente } = c;
        recinto(c, REC, 7.7);
        const tt = M.templo7(K, 3); pon(tt, TLA[0] + 1.75, 13.92, Math.PI / 2, 0.6);   // el templo gemelo de Tlatelolco, más chico
        const me = M.mercado(K); pon(me, 10.25, 13.9, Math.PI / 2, 0.8);
        pon(M.teocalliBarrio(K), 14.9, 9.2);
        pon(M.barrio(K, 'macehual'), 14.85, 15.2, Math.PI, 1, 0);
        pon(M.barrio(K, 'pilli'), 13.6, 13.15, Math.PI / 2, 0.85, 0);
        pon(M.barrio(K, 'chinampa', { suelo: false }), 14.75, 5.85, Math.PI / 2, 1, 0.014);
        pon(M.acueducto(K, 4.7), 14.5, 8.17, 0, 1, 0.01);
        puente(10.0, 16.6, 0.6, 0.5); puente(16.4, 7.68, 0.55, 0.62); puente(8.45, 3.9, 0.6, 0.5); puente(10.0, 10.95, 0.6, 0.5); puente(14.2, 10.95, 0.7, 0.5);
        c.quieto.add(ahuejotes(K, [...bordes(CHI, 'z', 0.8, 0.62, 4), [4.8, 16.6, 1.1], [5.4, 16.7, 1.0], [12.4, 16.4, 1.0], [13.0, 16.55, 1.2]]));
        [[16.3, 12.6, 0.9], [16.4, 13.3, 0.75], [12.5, 11.4, 0.7], [5.0, 10.95, 0.8]].forEach(([x, z, s], i) => pon(M.ahuehuete(K, s, i + 1), x, z));
        canoa(15.8, 10.95, 0, 'maiz'); canoa(7.0, 10.95, Math.PI, 'amate'); canoa(17.45, 13.4, Math.PI / 2); canoa(17.4, 5.2, Math.PI / 2 + 0.3, 'maiz'); canoa(11.6, 17.45, 0.2); canoa(16.95, 11.35, Math.PI, 'amate');
        const em = M.embarcadero(K, 0.9); pon(em, 16.75, 11.75, 0, 1, 0.01);
        [[9.2, 12.6, 1], [9.6, 13.2, 2], [11.2, 12.4, 3], [11.5, 15.6, 4], [9.0, 15.4, 5], [10.6, 15.9, 6], [11.8, 13.6, 7], [15.6, 10.6, 8], [15.2, 11.0, 9], [12.9, 10.0, 10], [11.2, 11.45, 11], [11.9, 11.3, 12]].forEach(([x, z, i]) => gente(x, z, i, [10.2, 13.9]));
      },
    };
  })(),
};

export function maqueta(K, variante = M.VARIANTES.tablero) { return armar(K, PLANES[variante]); }
/* lo que el juego toma de aquí para su tablero (tenochtitlan/valle.js): los volcanes, la tierra firme y lo que crece */
export { popocatepetl, iztaccihuatl, altIzta, altOrilla, pinos, ahuejotes, tulares, bordes };
