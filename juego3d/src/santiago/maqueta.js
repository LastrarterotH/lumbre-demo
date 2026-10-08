/* ============================================================
   santiago/maqueta
   Las tres maquetas del tablero de Santiago para la hoja juego3d/bocetos/santiago.html (el replanteo visual del
   2026-10-04, docs/replanteo-visual.md): el tablero entero de 16 × 16 (x, z de 2 a 18; la cámara mira desde +x +z, así
   que el fondo es la esquina de x + z chicas) con las piezas REALES a escala: la cordillera de telón, el héroe, el
   Mapocho con sus tajamares y el puente, el relieve, pocas casas, los bosquecillos, la Alameda y el suelo abierto.
   Cada maqueta trae en userData.datos lo que cambiaría en la geometría del motor (09h-santiago.js y lugares.js).
   - 'santalucia' (mirando al nororiente, como desde la ciudad): el cerro contra la cordillera y El Plomo.
   - 'plaza' (mirando al nororiente): la Plaza de Armas al centro, con la catedral de frente (girada: ver la nota).
   - 'alameda' (mirando al suroriente): San Francisco sobre la Alameda, la cordillera a la izquierda, el Mapocho delante.
   ============================================================ */
import * as THREE from 'three';
import { PAL, azar } from '../kit.js';
import { crearPersona } from '../actores.js';
import * as MON from './monumentos.js';
import * as PZ from './piezas.js';

const E0 = 2, E1 = 18, LADO = 16;
const pon = (padre, o, x, z, ry = 0, s = 1, y = 0) => { o.position.set(x, y, z); o.rotation.y = ry; o.scale.setScalar(s); padre.add(o); return o; };
const h3 = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
const dentro = (x, z, r) => x > r[0] && x < r[2] && z > r[1] && z < r[3];
function dSeg(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], q = dx * dx + dz * dz; let t = ((x - a[0]) * dx + (z - a[1]) * dz) / q; t = Math.max(0, Math.min(1, t)); return Math.hypot(x - (a[0] + t * dx), z - (a[1] + t * dz)); }

/* ---------- LAS TRES COMPOSICIONES ----------
   rio: el Mapocho ({ eje: 'z' corre a lo largo de z, en x de a0 a a1, desde `desde` }) · alameda: igual · andes: el borde
   donde está la cordillera ('z': el de z = 2, 'x': el de x = 2) · cerros: los cerros secos del norte (San Cristóbal) ·
   centro: la Plaza de Armas cuando no es el héroe · anclas: los seis saberes y los lugares del motor. */
export const COMPOSICIONES = {
  santalucia: {
    mira: 'nororiente',
    andes: { lado: 'z', prof: 3.0, alto: 6.2, plomo: 0.1 },
    cerros: { x: 2, z0: 5.0, z1: 11.4, prof: 1.5, alto: 2.4 },
    rio: { eje: 'z', a0: 3.6, a1: 5.2, desde: 4.6 },
    puente: { x: 4.4, z: 10.6 },
    alameda: { eje: 'z', a0: 13.3, a1: 14.3, desde: 4.8 },
    heroe: { v: 'santalucia', x: 10.2, z: 7.2, rot: 0, s: 1 },
    centro: { x: 9.0, z: 12.6 },
    extras: [],
    casas: [['patio', 6.0, 14.9, Math.PI / 2, { w: 1.35, d: 1.2, color: MON.SC.cal, patio: 'naranjo' }], ['patio', 8.6, 17.0, 0, { w: 1.2, d: 1.15, color: MON.SC.ocre, patio: 'parron', puerta: 1 }],
      ['balcon', 6.5, 9.6, Math.PI / 2, { w: 1.0, color: MON.SC.colorado }], ['patio', 9.1, 10.3, 0, { w: 1.1, d: 1.05, color: MON.SC.celeste, patio: 'pozo' }],
      ['quinta', 2.85, 15.6, Math.PI / 2, { w: 1.5, color: MON.SC.cal }], ['rancho', 2.8, 13.0, Math.PI / 2, {}], ['quinta', 16.4, 9.2, Math.PI / 2, { w: 1.4, color: MON.SC.rosado }], ['rancho', 15.4, 6.6, 0.3, {}]],
    bosques: [[2.9, 17.4, 5, 'naranjo'], [16.8, 7.4, 4, 'naranjo'], [15.6, 17.2, 4, 'naranjo'], [10.2, 17.6, 4, 'naranjo'], [6.6, 7.4, 4, 'quillay']],
    chacras: [[14.5, 12.6, 18, 18, 'vina'], [14.5, 5.0, 18, 8.2, 'trigo'], [2.0, 11.6, 3.5, 12.6, 'verde'], [5.4, 5.0, 7.4, 6.6, 'verde']],
    calles: [[[5.25, 10.6], [7.3, 10.6], [7.3, 11.4]], [[10.2, 12.6], [13.3, 12.6]], [[7.2, 13.6], [7.2, 18]], [[14.3, 5.6], [16.4, 5.0]], [[12.6, 9.6], [13.3, 9.6]]],
    anclas: { LANCASTER: [11.0, 15.5], NORMAL: [11.7, 13.9], SILABARIO: [11.6, 10.4], PRECEPTORAS: [15.6, 10.6], CONGRESO: [6.0, 16.6], KINDER: [12.5, 17.1] },
    lugares: { DILIGENCIA: [7.8, 17.6], ESPERA_SARMIENTO: [15.8, 5.4], LUGAR_SARMIENTO: [12.6, 14.6] },
  },
  plaza: {
    mira: 'nororiente',
    andes: { lado: 'z', prof: 3.0, alto: 6.0, plomo: 0.1, semilla: 9 },
    cerros: { x: 2, z0: 5.0, z1: 10.6, prof: 1.5, alto: 2.3 },
    rio: { eje: 'z', a0: 3.6, a1: 5.2, desde: 4.6 },
    puente: { x: 4.4, z: 9.2 },
    alameda: { eje: 'z', a0: 14.6, a1: 15.6, desde: 4.8 },
    heroe: { v: 'plaza', x: 8.6, z: 8.9, rot: 0, s: 1 },
    extras: [['mercado', 7.1, 14.4, 0, 0.85], ['santalucia', 13.0, 6.6, 0, 0.5]],
    casas: [['balcon', 12.9, 12.4, 0, { w: 1.0, color: MON.SC.ocre }], ['patio', 13.3, 13.9, Math.PI / 2, { w: 1.2, d: 1.1, color: MON.SC.cal, patio: 'naranjo' }],
      ['patio', 12.6, 17.2, 0, { w: 1.2, d: 1.1, color: MON.SC.amarillo, patio: 'parron' }], ['balcon', 10.9, 14.3, Math.PI / 2, { w: 0.95, color: MON.SC.celeste }],
      ['quinta', 2.85, 14.6, Math.PI / 2, { w: 1.5, color: MON.SC.cal }], ['rancho', 2.8, 12.0, Math.PI / 2, {}], ['quinta', 16.6, 8.0, Math.PI / 2, { w: 1.4, color: MON.SC.rosado }], ['rancho', 16.6, 5.6, 0.3, {}]],
    bosques: [[2.9, 16.8, 5, 'naranjo'], [17.0, 10.4, 4, 'naranjo'], [16.8, 16.8, 3, 'naranjo'], [9.6, 17.6, 3, 'naranjo']],
    chacras: [[15.8, 13.6, 18, 18, 'vina'], [15.8, 4.9, 18, 7.0, 'trigo'], [2.0, 10.8, 3.5, 11.6, 'verde']],
    calles: [[[5.25, 9.2], [6.0, 9.2]], [[8.6, 11.1], [8.6, 18]], [[11.3, 9.0], [14.6, 9.0]], [[15.6, 5.6], [17.4, 5.2]]],
    anclas: { LANCASTER: [12.4, 15.4], NORMAL: [10.6, 12.2], SILABARIO: [12.8, 9.9], PRECEPTORAS: [17.0, 12.4], CONGRESO: [6.6, 17.2], KINDER: [10.5, 16.6] },
    lugares: { DILIGENCIA: [5.8, 17.5], ESPERA_SARMIENTO: [16.0, 5.0], LUGAR_SARMIENTO: [11.6, 13.1] },
  },
  alameda: {
    mira: 'suroriente',
    andes: { lado: 'x', prof: 3.0, alto: 6.2, plomo: 0.16, semilla: 5 },
    rio: { eje: 'x', a0: 14.6, a1: 16.0, desde: 4.6 },
    puente: { x: 12.1, z: 15.3 },
    alameda: { eje: 'x', a0: 5.6, a1: 6.6, desde: 4.8 },
    heroe: { v: 'sanfrancisco', x: 12.2, z: 4.05, rot: 0, s: 1 },
    centro: { x: 12.2, z: 11.4, girada: true },
    extras: [['santalucia', 7.0, 8.9, Math.PI / 2, 0.68], ['moneda', 15.4, 8.4, 0, 0.55]],
    casas: [['patio', 9.6, 12.2, 0, { w: 1.2, d: 1.1, color: MON.SC.ocre, patio: 'naranjo' }], ['balcon', 10.4, 13.6, 0, { w: 1.0, color: MON.SC.colorado }],
      ['patio', 16.6, 11.6, Math.PI / 2, { w: 1.15, d: 1.1, color: MON.SC.cal, patio: 'parron' }], ['patio', 9.2, 7.6, Math.PI / 2, { w: 1.1, d: 1.0, color: MON.SC.celeste, patio: 'pozo' }],
      ['quinta', 9.0, 17.0, 0, { w: 1.5, color: MON.SC.cal }], ['rancho', 15.8, 17.0, 0, {}], ['quinta', 16.6, 3.2, Math.PI / 2, { w: 1.2, color: MON.SC.rosado }], ['rancho', 7.0, 3.4, 0.2, {}]],
    bosques: [[6.4, 17.2, 4, 'naranjo'], [17.2, 4.8, 3, 'naranjo'], [12.6, 17.3, 4, 'naranjo'], [8.2, 4.4, 4, 'naranjo'], [17.2, 17.3, 3, 'naranjo']],
    chacras: [[5.0, 2.0, 9.4, 5.4, 'trigo'], [14.6, 2.0, 18, 5.4, 'vina'], [5.0, 16.1, 18, 18, 'verde']],
    calles: [[[12.1, 12.8], [12.1, 14.6]], [[12.7, 9.5], [12.7, 6.6]], [[13.4, 12.9], [18, 12.9]], [[10.8, 11.4], [5.2, 11.4]]],
    anclas: { LANCASTER: [9.0, 13.6], NORMAL: [16.4, 13.6], SILABARIO: [11.0, 8.2], PRECEPTORAS: [17.1, 10.2], CONGRESO: [10.4, 10.4], KINDER: [14.4, 13.7] },
    lugares: { DILIGENCIA: [17.5, 12.2], ESPERA_SARMIENTO: [5.6, 13.0], LUGAR_SARMIENTO: [15.2, 14.0] },
  },
};
const NOMBRE_ANCLA = { LANCASTER: 'la lancasteriana', NORMAL: 'la Escuela Normal', SILABARIO: 'el silabario', PRECEPTORAS: 'las preceptoras', CONGRESO: 'el Congreso (la ley)', KINDER: 'el kindergarten' };
export const COLOR_ANCLA = { LANCASTER: '#b8352f', NORMAL: '#2f4f8a', SILABARIO: '#d4a93e', PRECEPTORAS: '#7a3a6a', CONGRESO: '#3f7a4a', KINDER: '#e07a3a' };

/* ---------- el suelo: la tierra dorada del valle, las calles, la plaza, las chacras y el lecho del río ---------- */
const enBanda = (b, x, z, m = 0) => b.eje === 'z' ? x > b.a0 - m && x < b.a1 + m && z > b.desde - m : z > b.a0 - m && z < b.a1 + m && x > b.desde - m;
const across = (b, x, z) => b.eje === 'z' ? x : z;
function alturaDe(C) {
  return (x, z) => {
    const r = C.rio; if (!enBanda(r, x, z)) return 0;
    const a = across(r, x, z), k = Math.min(1, (a - r.a0) / 0.22, (r.a1 - a) / 0.06);   // la orilla de la Chimba es playa; la de la ciudad, el tajamar
    return -0.22 * Math.max(0, Math.min(1, k));
  };
}
function suelo(K, C, altura) {
  const RES = 4, N = LADO * RES, s = 1 / RES, pos = [], col = [], c = new THREE.Color();
  const TIERRA = ['#e5ce97', '#e2ca91', '#e8d29d', '#dfc78f'];
  const zona = (x, z) => {
    if (altura(x, z) < -0.02) return (h3(Math.round(x * 6), Math.round(z * 6), 2) > 0.7 ? '#bfb092' : '#d2c6a8');           // el lecho de ripio del Mapocho
    for (const [x0, z0, x1, z1, t] of C.chacras) if (dentro(x, z, [x0, z0, x1, z1])) {
      if (t === 'vina') return (Math.floor((C.mira === 'suroriente' ? x : z) * 5) % 2) ? '#c9bc78' : '#b8b06a';
      if (t === 'trigo') return (Math.floor((x + z) * 1.2) % 3) ? '#e6c86e' : '#d9b85c';
      return (Math.floor(x * 1.5 + z * 0.7) % 2) ? '#aac06e' : '#9ab463';
    }
    if (enBanda(C.alameda, x, z)) return '#ecdcae';                                                                     // el paseo de la Alameda
    for (const ca of C.calles || []) for (let i = 0; i < ca.length - 1; i++) if (dSeg(x, z, ca[i], ca[i + 1]) < 0.17) return '#eedfb6';   // las calles de tierra
    for (const [ax, az] of Object.values(C.anclas)) if (Math.hypot(x - ax, z - az) < 0.62) return '#efe0b8';                         // los solares de los saberes
    return TIERRA[Math.abs(Math.floor(x * 2) * 7 + Math.floor(z * 2) * 13) % 4];
  };
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s, v = (x, z) => [x, altura(x, z), z];
    c.set(zona(x0 + s / 2, z0 + s / 2));
    for (const p of [v(x0, z0), v(x0, z1), v(x1, z0), v(x1, z0), v(x0, z1), v(x1, z1)]) { pos.push(...p); col.push(c.r, c.g, c.b); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals(); geo.userData.propia = true;
  return K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false });
}
/* la losa del diorama: los dos lados que se ven, con sus capas y la hondonada del río */
function losa(K, altura) {
  const g = new THREE.Group();
  const pared = (fijo, eje) => {
    const pos = [], col = [], c = new THREE.Color(), paso = 0.125;
    const quad = (p0, p1, p2, p3, color) => { c.set(color); for (const p of [p0, p1, p2, p0, p2, p3]) { pos.push(...p); col.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, P = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const h0 = eje === 'x' ? altura(fijo - 0.01, u) : altura(u, fijo - 0.01), h1 = eje === 'x' ? altura(fijo - 0.01, u1) : altura(u1, fijo - 0.01);
      quad(P(u, h0), P(u1, h1), P(u1, Math.min(h1, 0) - 0.1), P(u, Math.min(h0, 0) - 0.1), h0 < -0.03 ? '#8a7e66' : '#c4ae88');
      quad(P(u, Math.min(h0, 0) - 0.1), P(u1, Math.min(h1, 0) - 0.1), P(u1, -0.46), P(u, -0.46), PAL.corte1);
      quad(P(u, -0.46), P(u1, -0.46), P(u1, -1.05), P(u, -1.05), PAL.corte2);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals(); geo.userData.propia = true;
    return new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide }));
  };
  g.add(pared(E1, 'x'), pared(E1, 'z'));
  const b = K.malla(K.caja(LADO - 0.02, 0.6, LADO - 0.02), PAL.corte2, { grosor: 0.03, sombra: false, recibe: false }); b.position.set(10, -0.76, 10); g.add(b);
  return g;
}
/* ---------- el Mapocho: el agua trenzada sobre el ripio, los tajamares de la ciudad, los sauces de la Chimba y el puente ---------- */
function rio(K, C) {
  const g = new THREE.Group(), r = C.rio, rr = azar(1782);
  const P = (a, l, y) => r.eje === 'z' ? [a, y, l] : [l, y, a];
  [[0.35, 0.3, 0.32, 0], [0.62, 0.18, 0.16, 2], [0.8, 0.12, 0.1, 4]].forEach(([fa, amp, ancho, fase]) => {   // los brazos del río, trenzados
    const pts = []; for (let l = r.desde + 0.2; l <= E1 + 0.001; l += 0.25) { const a = r.a0 + (r.a1 - r.a0) * fa + Math.sin(l * 0.9 + fase) * amp * (r.a1 - r.a0) * 0.5; pts.push(P(a, Math.min(l, E1), -0.2)); }
    g.add(MON_cinta(K, pts, ancho, MON.SC.agua));
  });
  const geoP = new THREE.IcosahedronGeometry(1, 0), piedras = K.instancias(geoP, '#b4a68a', 60, { sinTinta: true });   // los cantos rodados
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
  for (let k = 0; k < 60; k++) { const a = r.a0 + 0.1 + rr() * (r.a1 - r.a0 - 0.2), l = r.desde + 0.3 + rr() * (E1 - r.desde - 0.4), [x, y, z] = P(a, l, -0.2); m4.compose(v.set(x, y, z), q.identity(), s.setScalar(0.03 + rr() * 0.04)); piedras.setMatrixAt(k, m4); }
  g.add(piedras);
  // los tajamares (Toesca, 1792-1805): el muro de piedra y ladrillo de la orilla de la ciudad
  const largo = E1 - r.desde, t = K.malla(K.caja(r.eje === 'z' ? 0.08 : largo, 0.3, r.eje === 'z' ? largo : 0.08), MON.SC.piedra, { grosor: 0.004 });
  const [tx, , tz] = P(r.a1 + 0.02, r.desde + largo / 2, 0); t.position.set(tx, -0.08, tz); g.add(t);
  const cap = K.malla(K.caja(r.eje === 'z' ? 0.12 : largo, 0.03, r.eje === 'z' ? largo : 0.12), MON.SC.piedraL, { grosor: 0.002 }); cap.position.set(tx, 0.075, tz); g.add(cap);
  // los sauces de la orilla de la Chimba
  for (let l = r.desde + 0.8; l < E1 - 0.3; l += 1.3 + rr() * 0.6) { const [x, , z] = P(r.a0 - 0.2, l, 0); pon(g, MON.sauce(K, 0.9 + rr() * 0.3), x, z, rr() * 6); }
  // el puente de Cal y Canto, cinco ojos a esta escala; las garitas con tiendas, río abajo (al poniente), como estaban
  const pu = MON.calYCanto(K, { arcos: 5, orilla: 0.29 }); pon(g, pu, C.puente.x, C.puente.z, r.eje === 'z' ? Math.PI : -Math.PI / 2, 0.75, -0.22);
  return g;
}
/* una cinta horizontal (la del agua), como la de monumentos, para no exportar más de la cuenta */
function MON_cinta(K, pts, ancho, color) {
  const tris = [];
  const borde = i => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1; return [-dz / L * ancho / 2, dx / L * ancho / 2]; };
  for (let i = 0; i < pts.length - 1; i++) { const [nx0, nz0] = borde(i), [nx1, nz1] = borde(i + 1), p = pts[i], q = pts[i + 1]; tris.push(p[0] + nx0, p[1], p[2] + nz0, p[0] - nx0, p[1], p[2] - nz0, q[0] - nx1, q[1], q[2] - nz1, p[0] + nx0, p[1], p[2] + nz0, q[0] - nx1, q[1], q[2] - nz1, q[0] + nx1, q[1], q[2] + nz1); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(tris, 3)); geo.computeVertexNormals(); geo.userData.propia = true;
  return K.malla(geo, color, { side: THREE.DoubleSide, sinTinta: true, sombra: false });
}
/* ---------- la Alameda de las Delicias: las cuatro hileras de álamos de O'Higgins y sus acequias ---------- */
function alameda(K, C) {
  const g = new THREE.Group(), b = C.alameda, P = (a, l) => b.eje === 'z' ? [a, l] : [l, a];
  for (const fa of [0.08, 0.92]) for (let l = b.desde + 0.3; l < E1 - 0.15; l += 0.66) {
    const a = b.a0 + (b.a1 - b.a0) * fa, [x, z] = P(a, l + (fa > 0.5 ? 0.33 : 0));
    if (C.heroe.v === 'sanfrancisco' && fa < 0.5 && x > 9.4 && x < 14.6) continue;   // delante de San Francisco están los suyos
    pon(g, MON.alamo(K, 0.9 + h3(l, fa, 3) * 0.22), x, z);
  }
  [0.02, 0.98].forEach(fa => { const a = b.a0 + (b.a1 - b.a0) * fa, [x0, z0] = P(a, b.desde), [x1, z1] = P(a, E1); const ac = K.malla(K.caja(Math.abs(x1 - x0) + 0.04, 0.012, Math.abs(z1 - z0) + 0.04), MON.SC.aguaD, { sinTinta: true }); ac.position.set((x0 + x1) / 2, 0.006, (z0 + z1) / 2); g.add(ac); });
  return g;
}
/* ---------- la Plaza de Armas cuando no es el héroe: el jardín, la catedral de espaldas (mira a la plaza, al oriente), la Real Audiencia ---------- */
function centro(K, C) {
  const g = new THREE.Group(), { x, z } = C.centro;
  const p = new THREE.Group(); p.position.set(x, 0, z); g.add(p);
  // en el marco de la plaza: +x es el sur y −z el oriente (mirando al nororiente) · en la del suroriente se gira
  if (C.centro.girada) p.rotation.y = Math.PI / 2;
  const jar = new THREE.Group(); p.add(jar);
  jar.add(new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.02, 2.4), K.mat('#e6d4a6')));
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => { const pr = K.malla(K.caja(0.85, 0.03, 0.85), MON.SC.jardin, { sinTinta: true }); pr.position.set(sx * 0.58, 0.02, sz * 0.58); jar.add(pr); const n = MON.naranjo(K, 1.15, false); n.position.set(sx * 0.62, 0.03, sz * 0.62); jar.add(n); });
  const lib = MON.libertadAmericana(K); lib.position.y = 0.02; jar.add(lib);
  [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]].forEach(([a, b]) => { const f = MON.farol(K); f.position.set(a, 0.01, b); jar.add(f); });
  // la catedral al poniente (+z del marco), mirando a la plaza: desde aquí se ve su espalda y su campanario
  const ca = new THREE.Group(); ca.position.set(0.25, 0, 1.45); ca.rotation.y = Math.PI; ca.scale.setScalar(0.8); p.add(ca);
  ca.add(MON.catedralFrente(K, 3)); const sg = MON.sagrario(K, 3); sg.position.x = -1.55; ca.add(sg);
  // la Real Audiencia al norte (−x del marco), mirando al sur: de frente con su torre del reloj
  const ra = MON.realAudiencia(K, 3, 2.2); ra.position.set(-1.45, 0, 0.0); ra.rotation.y = Math.PI / 2; ra.scale.setScalar(0.85); p.add(ra);
  // el portal de Sierra Bella al sur (+x del marco), mirando al norte: se ve de frente cuando la vista es al suroriente
  if (C.centro.girada) { const po = MON.portalSierraBella(K, 3.0); po.position.set(1.5, 0, 0.0); po.rotation.y = -Math.PI / 2; po.scale.setScalar(0.75); p.add(po); }
  return g;
}
/* ---------- los bosquecillos (los huertos de las quintas) y las viñas en hileras ---------- */
function bosque(K, g, x, z, n, tipo, sem) {
  for (let k = 0; k < n; k++) { const a = k * 2.4 + sem, r = 0.25 + (k % 3) * 0.22, t = tipo === 'naranjo' ? (k % 3 === 2 ? MON.alamo(K, 0.9) : MON.naranjo(K, 1.0 + h3(k, sem, 1) * 0.3, k % 2 === 0)) : MON.quillay(K, 1.2, k); pon(g, t, x + Math.cos(a) * r, z + Math.sin(a) * r * 0.8); }
}
function vinas(K, C, rect) {
  const [x0, z0, x1, z1] = rect, pts = [], porX = C.mira === 'suroriente';
  for (let a = (porX ? x0 : z0) + 0.15; a < (porX ? x1 : z1) - 0.1; a += 0.2) for (let l = (porX ? z0 : x0) + 0.15; l < (porX ? z1 : x1) - 0.1; l += 0.14) pts.push(porX ? [a, l] : [l, a]);
  const m = K.instancias(K.esfera(1, 0.4), '#7f9a48', pts.length, { sinTinta: true }), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
  pts.forEach(([x, z], i) => { m4.compose(v.set(x, 0.05, z), q.identity(), s.set(0.06, 0.05, 0.06)); m.setMatrixAt(i, m4); });
  return m;
}
/* ---------- la gente en el suelo abierto ---------- */
function gente(K, g, puntos) {
  puntos.forEach(([x, z, op, ry], i) => { const p = crearPersona(K, op); p.anim(0, { pose: i % 4 === 0 ? 'andar' : 'quieto', instantaneo: true }); pon(g, p.obj, x, z, ry); });
}

export function maqueta(K, variante = MON.VARIANTES.maqueta) {
  const C = COMPOSICIONES[variante], g = new THREE.Group(), altura = alturaDe(C), huellas = [];
  const anota = (nombre, o) => { o.updateMatrixWorld(true); huellas.push([nombre, new THREE.Box3().setFromObject(o)]); };
  g.add(suelo(K, C, altura), losa(K, altura));
  /* la cordillera de telón, y en el norte los cerros secos (el San Cristóbal, pelado hasta el siglo XX) */
  const A = C.andes, an = MON.andes(K, { largo: LADO, prof: A.prof, alto: A.alto, plomo: A.plomo, semilla: A.semilla || 7, cortes: A.lado === 'z' ? [false, true] : [true, false] });
  if (A.lado === 'z') pon(g, an, 10, E0 + A.prof); else { an.rotation.y = Math.PI / 2; an.position.set(E0 + A.prof, 0, 10); g.add(an); }
  g.userData.nevar = an.userData.nevar;
  if (C.cerros) { const ce = C.cerros, cr = MON.andes(K, { largo: ce.z1 - ce.z0, prof: ce.prof, alto: ce.alto, plomo: 0.45, semilla: 21, seco: true, cortes: [false, false], res: 6, bajaFin: true }); cr.rotation.y = Math.PI / 2; cr.position.set(ce.x + ce.prof, 0, (ce.z0 + ce.z1) / 2); g.add(cr); }
  g.add(rio(K, C), alameda(K, C));
  /* el héroe y las otras piezas grandes */
  const H = C.heroe; anota('héroe', pon(g, MON.heroe(K, H.v, 3), H.x, H.z, H.rot, H.s));
  for (const [t, x, z, ry, s] of C.extras) anota(t, pon(g, t === 'mercado' ? MON.mercadoCentral(K) : t === 'moneda' ? MON.laMoneda(K) : MON.heroe(K, t, 3), x, z, ry, s));
  if (C.centro) { const ce = centro(K, C); g.add(ce); ce.children[0].children.forEach((o, i) => anota('centro' + i, o)); }
  /* las casas, pocas y con carácter */
  for (const [t, x, z, ry, op] of C.casas) {
    const c = t === 'balcon' ? MON.casaBalcon(K, { ...op, fondo: false }) : t === 'quinta' ? MON.quintaCasa(K, op) : t === 'rancho' ? MON.rancho(K, op) : MON.casaPatio(K, op);
    anota(t + '@' + x + ',' + z, pon(g, c, x, z, ry));
  }
  /* los bosquecillos y las chacras */
  C.bosques.forEach(([x, z, n, t], i) => bosque(K, g, x, z, n, t, i * 3 + 1));
  C.chacras.filter(c => c[4] === 'vina').forEach(c => g.add(vinas(K, C, c)));
  /* los solares de los seis saberes en sus anclas nuevas (la tierra apisonada, el mojón con su banderín) y, en tres, el corro */
  Object.entries(C.anclas).forEach(([k, [x, z]], i) => {
    const m = new THREE.Group(); m.position.set(x, 0, z); g.add(m);
    for (let j = 0; j < 14; j++) { const a = j / 14 * Math.PI * 2, p = K.malla(K.esfera(0.035, 0.4), j % 2 ? '#cdbf9f' : '#b9ab8c', { sinTinta: true }); p.scale.y = 0.6; p.position.set(Math.cos(a) * 0.6, 0.012, Math.sin(a) * 0.6); m.add(p); }
    const es = K.malla(K.cilindro(0.012, 0.014, 0.42, 5), MON.SC.maderaD, { sinTinta: true }); es.position.set(0.42, 0.21, -0.42); m.add(es);
    const ba = K.malla(K.caja(0.14, 0.09, 0.006), COLOR_ANCLA[k], { grosor: 0.001 }); ba.position.set(0.49, 0.37, -0.42); m.add(ba);
    if (i % 2 === 0) { const ma = crearPersona(K, i === 2 ? PZ.PRECEPTORA : PZ.PRECEPTOR); ma.anim(0, { pose: 'narrar', instantaneo: true }); pon(m, ma.obj, -0.15, -0.2, 0.74);
      for (let j = 0; j < 4; j++) { const a = 0.2 + j * 0.42, n = crearPersona(K, PZ.nino(i + j)); n.anim(0, { pose: 'quieto', instantaneo: true }); pon(m, n.obj, -0.15 + Math.cos(a) * 0.45, -0.2 + Math.sin(a) * 0.45, Math.atan2(-Math.cos(a), -Math.sin(a))); } }
  });
  /* la gente en la plaza y en los caminos */
  const pl = C.centro || { x: H.x, z: H.z + 0.6 };
  gente(K, g, [[pl.x + 1.5, pl.z + 1.4, PZ.nino(0), 0.4], [pl.x + 1.7, pl.z + 1.2, PZ.nino(1), 3], [pl.x + 1.9, pl.z + 1.7, PZ.PRECEPTORA, 2.2], [C.lugares.DILIGENCIA[0], C.lugares.DILIGENCIA[1] - 0.4, PZ.ARRIERO, 1.2], [C.lugares.ESPERA_SARMIENTO[0], C.lugares.ESPERA_SARMIENTO[1], PZ.SARMIENTO, 0.8]]);
  const mu = MON.mula(K); mu.scale.setScalar(1.6); pon(g, mu, C.lugares.ESPERA_SARMIENTO[0] + 0.35, C.lugares.ESPERA_SARMIENTO[1] - 0.1, -0.6, 1.6);
  for (const [k, [x, z]] of Object.entries(C.anclas)) huellas.push(['solar ' + k, new THREE.Box3(new THREE.Vector3(x - 0.62, 0, z - 0.62), new THREE.Vector3(x + 0.62, 1, z + 0.62))]);
  { const P = C.puente, L = 4.32 * 0.75 / 2; huellas.push(['puente', C.rio.eje === 'z' ? new THREE.Box3(new THREE.Vector3(P.x - L, -1, P.z - 0.25), new THREE.Vector3(P.x + L, 1, P.z + 0.25)) : new THREE.Box3(new THREE.Vector3(P.x - 0.25, -1, P.z - L), new THREE.Vector3(P.x + 0.25, 1, P.z + L))]); }
  g.userData.huellas = huellas;
  g.userData.datos = datosMotor(C, variante);
  return g;
}
/* lo que cambiaría en el motor (09h-santiago.js y su espejo lugares.js), para el texto de la hoja */
function datosMotor(C, v) {
  const f = n => (Math.round(n * 100) / 100).toString().replace('.', ',');
  const banda = b => b.eje === 'z' ? `x de ${f(b.a0)} a ${f(b.a1)} (corre a lo largo de z)` : `z de ${f(b.a0)} a ${f(b.a1)}`;
  const anclas = Object.entries(C.anclas).map(([k, [x, z]]) => `<i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:${COLOR_ANCLA[k]};margin-right:3px"></i>${NOMBRE_ANCLA[k]} (${k}_SA) a ${f(x)}; ${f(z)}`).join(' · ');
  return {
    andes: C.andes.lado === 'z' ? 'ANDES_SA pasa a ser la franja z < ' + f(E0 + C.andes.prof) : 'ANDES_SA pasa a ser la franja x < ' + f(E0 + C.andes.prof),
    rio: 'MAPOCHO_SA: ' + banda(C.rio) + `; PUENTE_SA en ${f(C.puente.x)}; ${f(C.puente.z)}`,
    alameda: 'ALAMEDA_SA: ' + banda(C.alameda),
    heroe: C.heroe.v === 'santalucia' ? `SANTALUCIA_SA en ${f(C.heroe.x)}; ${f(C.heroe.z)}, con huella de elipse (radios 2,5 y 1,9: enCerroSa deja de ser un círculo de 0,9)`
      : C.heroe.v === 'plaza' ? `PLAZA_SA en ${f(C.heroe.x)}; ${f(C.heroe.z + 0.35)} y CATEDRAL_SA al fondo de la plaza (${f(C.heroe.x + 0.95)}; ${f(C.heroe.z - 1.45)}), con la huella del bloque (5,2 × 5,8)`
      : `SANFRANCISCO_SA (nuevo) en ${f(C.heroe.x)}; ${f(C.heroe.z)}, con la huella del convento (4,7 × 4,7) pegada a la Alameda`,
    plaza: C.centro ? `PLAZA_SA en ${f(C.centro.x)}; ${f(C.centro.z)} (la catedral al poniente de la plaza, como está)` : '',
    anclas, lugares: Object.entries(C.lugares).map(([k, [x, z]]) => `${k}_SA a ${f(x)}; ${f(z)}`).join(' · '),
    damero: 'DAMERO_SA se achica a las pocas manzanas de la maqueta (las casas son piezas, no grilla)',
  };
}
