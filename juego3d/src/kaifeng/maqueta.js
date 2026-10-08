/* ============================================================
   kaifeng/maqueta
   Las tres composiciones del tablero de China Song para la hoja de bocetos (juego3d/bocetos/kaifeng.html): el tablero
   entero de 16 × 16 (x, z de 2 a 18; la cámara mira desde +x +z, así que el fondo es la esquina de x + z chicas) con las
   piezas REALES a escala: la Pagoda de Hierro en su templo (el héroe, a 15 m por baldosa), el río Bian con el Puente
   Arcoíris (a 7,5 m) y sus barcas, la muralla de tierra apisonada con una puerta (a 12 m), la casa de té en la orilla,
   pocas tiendas, los sauces y las moreras en bosquecillos y el suelo abierto del frente, con las anclas de los seis saberes.
   No entra al juego: dice dónde va cada cosa. China no tiene motor todavía: TABLEROS[v].motor dice qué constantes tendría
   que declarar su 09x (y su espejo kaifeng/lugares.js).
   ============================================================ */
import * as THREE from 'three';
import { PAL, fundir } from '../kit.js';
import * as KM from './monumentos.js';

const E0 = 2, E1 = 18, NIVEL = -0.06, ESC_MURO = 12;
const ss = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
const h3 = (a, b, c = 0) => { const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return s - Math.floor(s); };
const propia = geo => { geo.userData.propia = true; return geo; };
/* el punto más cercano del eje del río: la distancia a la orilla (negativa en el agua), el punto, la tangente y el ancho */
function rioEn(R, x, z) {
  let best = { d: 1e9 };
  for (let i = 0; i < R.pts.length - 1; i++) {
    const [ax, az] = R.pts[i], [bx, bz] = R.pts[i + 1], vx = bx - ax, vz = bz - az, L = vx * vx + vz * vz;
    const t = L ? Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L)) : 0;
    const w = R.anchos[i] + (R.anchos[i + 1] - R.anchos[i]) * t, px = ax + vx * t, pz = az + vz * t, d = Math.hypot(x - px, z - pz) - w / 2;
    if (d < best.d) { const l = Math.sqrt(L) || 1; best = { d, px, pz, tx: vx / l, tz: vz / l, w }; }
  }
  return best;
}
function distPoli(pts, x, z) {
  let d = 1e9;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], vx = bx - ax, vz = bz - az, L = vx * vx + vz * vz;
    const t = L ? Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L)) : 0;
    d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t));
  }
  return d;
}
/* una polilínea suavizada (Catmull-Rom), con sus anchos */
function suave(pts, anchos, n = 8) {
  const c = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z))), N = (pts.length - 1) * n;
  const P = c.getPoints(N).map(v => [v.x, v.z]), A = P.map((_, i) => { const f = i / N * (anchos.length - 1), k = Math.min(anchos.length - 2, Math.floor(f)); return anchos[k] + (anchos[k + 1] - anchos[k]) * (f - k); });
  return { pts: P, anchos: A };
}

/* ---------- LOS TRES TABLEROS (los tres con la Pagoda de Hierro, el Puente Arcoíris, la casa de té y las tiendas) ---------- */
const MOTOR_COMUN = 'China no tiene motor todavía: su 09x declararía PAGODA (la huella del héroe), BIAN (el eje y el ancho del río, con enAgua por distancia, como el Nilo), PUENTE (caminable para el A*, con su rampa), MURALLA y PUERTA (la muralla no se cruza salvo por la puerta), las ANCLAS de los seis saberes y los HOGARES de las tiendas.';
const T_SHOP = (texto, op = {}) => ({ W: 0.95, D: 0.7, h: 0.44, letrero: texto, vertical: true, ...op });
export const TABLEROS = {
  /* A · la pagoda en la esquina de la muralla, el Bian cruzando en diagonal con el puente en el centro */
  muralla: {
    nombre: 'La pagoda junto a la muralla, el Bian por el medio',
    heroe: { x: 5.7, z: 5.9, ry: 0 },
    rio: suave([[19.5, 5.4], [16.5, 6.9], [13.0, 8.8], [10.0, 10.4], [7.0, 11.9], [4.0, 13.4], [0.5, 15.0]], [2.6, 2.6, 2.5, 2.3, 2.5, 2.7, 2.7]),
    puente: [10.0, 10.4],
    murallas: [[2, 2.8, 11.3, 2.8, '-z'], [13.7, 2.8, 18, 2.8, '-z']], puerta: { x: 12.5, z: 2.8, ry: 0 },
    te: [15.2, 7.5, -1],
    caminos: [[[12.5, 3.6], [11.6, 5.8], [10.2, 7.6], [9.3, 8.9]], [[10.7, 11.9], [11.6, 13.4], [12.8, 14.6]], [[11.4, 5.6], [8.6, 6.0], [8.0, 6.0]]],
    plaza: [[9.6, 13.2], [14.4, 11.0], [17.6, 9.8], [17.6, 17.6], [8.0, 17.6]],
    casas: [[10.4, 4.6, 0, T_SHOP('劉家沉檀', { h2: 0.34 })], [14.6, 4.5, 0, T_SHOP('趙太丞家', { toldo: true })], [8.2, 8.4, 0.3, { W: 0.8, D: 0.6, h: 0.4, tono: 'paja', toldo: true, sombrillas: 1 }], [16.7, 4.6, -Math.PI / 2, { W: 0.9, D: 0.65, h: 0.42, bandera: '新酒' }]],
    arboledas: [[5.4, 10.4, 4, 0.7, 3, { sauces: 1 }], [3.0, 9.5, 5, 0.75, 4, { sauces: 0 }], [17.2, 9.3, 3, 0.5, 5, { sauces: 1 }], [4.4, 15.9, 4, 0.6, 6, { sauces: 0.7 }], [16.9, 16.9, 5, 0.75, 7, { sauces: 0 }], [8.6, 3.9, 3, 0.45, 8, { sauces: 0.4, pinos: 0.6 }]],
    barcas: [[14.4, 8.0, { L: 1.5, mastil: 'alto' }], [6.4, 12.2, { L: 1.2, mastil: 'abatido' }], [2.8, 14.0, { L: 0.95, mastil: null, cabina: true }]],
    anclas: { prefectura: [16.6, 11.0], impresos: [13.4, 12.6], huyuan: [16.2, 14.3], anonimo: [12.7, 15.6], academia: [9.2, 15.4], palacio: [15.3, 17.0] },
    persona: [11.2, 13.9],
    texto: 'La Pagoda de Hierro estaba en la esquina noreste de la ciudad interior, junto a la muralla: aquí su templo llena la esquina del fondo (de 3,4 a 8,0 en x y de 4,0 a 7,8 en z) y la muralla corre por el borde de atrás, con la puerta y su torre a la derecha. El Bian cruza el tablero en diagonal, con sus barcas, y el Puente Arcoíris lo salta en el centro; la casa de té mira al río desde la orilla de atrás. Del puente para adelante, la explanada de las escuelas.',
    motor: MOTOR_COMUN + ' Aquí: PAGODA en (5,7, 5,9); BIAN de (19,5, 5,4) a (0,5, 15,0), de 2,3 a 2,7 de ancho; PUENTE en (10,0, 10,4), perpendicular al río; MURALLA por z ≈ 2,8 con la PUERTA en x = 12,5; el camino baja de la puerta al puente y sigue a la explanada.'
  },
  /* B · el Bian por el borde izquierdo, el puente lo cruza hacia afuera del tablero, la muralla al fondo derecho */
  borde: {
    nombre: 'El Bian por el borde izquierdo, la muralla al fondo',
    heroe: { x: 9.2, z: 5.6, ry: 0 },
    rio: suave([[3.4, 0.5], [3.5, 5.0], [3.85, 9.0], [4.0, 12.5], [3.6, 16.0], [3.3, 19.5]], [2.6, 2.6, 2.3, 2.6, 2.8, 2.8]),
    puente: [3.85, 9.0],
    murallas: [[5.6, 2.6, 13.4, 2.6, '-z'], [15.6, 2.6, 18, 2.6, '-z']], puerta: { x: 14.5, z: 2.6, ry: 0 },
    te: [4.0, 13.2, 1],
    caminos: [[[14.5, 3.4], [13.6, 6.5], [12.0, 8.6], [8.0, 9.1], [5.6, 9.0]], [[12.0, 8.6], [13.2, 11.0], [13.6, 13.5]]],
    plaza: [[9.6, 10.6], [17.6, 8.8], [17.6, 17.6], [8.0, 17.6]],
    casas: [[16.4, 5.0, 0, T_SHOP('劉家沉檀', { h2: 0.34 })], [11.4, 10.0, 0, T_SHOP('趙太丞家', { toldo: true })], [7.6, 10.5, 0, { W: 0.8, D: 0.6, h: 0.4, tono: 'paja', toldo: true, sombrillas: 1 }], [15.4, 7.7, -Math.PI / 2, { W: 0.9, D: 0.65, h: 0.42, bandera: '新酒' }]],
    arboledas: [[5.6, 5.4, 4, 0.6, 13, { sauces: 1 }], [6.0, 16.6, 4, 0.6, 14, { sauces: 0.8 }], [17.0, 17.0, 5, 0.7, 15, { sauces: 0 }], [17.1, 11.8, 3, 0.5, 16, { sauces: 0 }], [12.8, 4.0, 3, 0.45, 17, { sauces: 0.3, pinos: 0.7 }]],
    barcas: [[3.4, 6.4, { L: 1.4, mastil: 'alto' }], [3.9, 11.3, { L: 1.1, mastil: 'abatido' }], [3.5, 15.9, { L: 1.0, mastil: null }]],
    anclas: { prefectura: [16.5, 9.4], impresos: [13.0, 12.6], huyuan: [16.4, 13.8], anonimo: [10.8, 14.6], academia: [8.2, 16.5], palacio: [14.0, 16.8] },
    persona: [10.6, 12.6],
    texto: 'La pagoda al fondo, en el centro, con la muralla detrás y la puerta a la derecha. El Bian corre por el borde izquierdo, de atrás hacia adelante, con sus barcas; el Puente Arcoíris lo cruza hacia afuera del tablero (lo que hay del otro lado se sugiere), y la casa de té mira al río desde su orilla. El camino viene de la puerta, pasa por las tiendas y llega al puente; todo el frente derecho queda para las escuelas.',
    motor: MOTOR_COMUN + ' Aquí: PAGODA en (9,2, 5,6); BIAN por x ≈ 3,5-4 (ancho 2,3 a 2,8); PUENTE en (3,85, 9,0), hacia el borde; MURALLA por z ≈ 2,6 con la PUERTA en x = 14,5.'
  },
  /* C · como en el rollo: el Bian por el borde del frente con el puente hacia el borde, la muralla por la izquierda */
  rollo: {
    nombre: 'Como en el rollo: el Bian al frente, la puerta a la izquierda',
    heroe: { x: 7.6, z: 5.0, ry: 0 },
    rio: suave([[0.5, 16.3], [4.0, 15.95], [8.0, 15.75], [12.0, 15.95], [16.0, 16.4], [19.5, 16.9]], [2.4, 2.4, 2.3, 2.5, 2.6, 2.6]),
    puente: [8.0, 15.75],
    murallas: [[2.8, 2, 2.8, 6.9, '-x'], [2.8, 9.1, 2.8, 13.6, '-x']], puerta: { x: 2.8, z: 8.0, ry: Math.PI / 2 },
    te: [12.4, 14.9, -1],
    caminos: [[[3.6, 8.0], [5.6, 9.6], [7.2, 11.6], [8.0, 13.6]], [[5.6, 9.6], [9.6, 9.2], [12.6, 9.6]]],
    plaza: [[10.2, 7.0], [17.6, 5.0], [17.6, 13.8], [10.0, 13.6]],
    casas: [[4.9, 11.6, Math.PI / 2, T_SHOP('劉家沉檀', { h2: 0.34 })], [9.8, 12.6, 0, T_SHOP('趙太丞家', { toldo: true })], [5.2, 13.6, 0, { W: 0.8, D: 0.6, h: 0.4, tono: 'paja', toldo: true, sombrillas: 1 }], [7.2, 9.0, 0, { W: 0.9, D: 0.65, h: 0.42, bandera: '新酒' }]],
    arboledas: [[3.7, 14.2, 3, 0.5, 23, { sauces: 1 }], [15.6, 14.4, 3, 0.55, 24, { sauces: 1 }], [16.8, 3.2, 5, 0.7, 25, { sauces: 0 }], [12.6, 3.0, 4, 0.55, 26, { sauces: 0 }], [17.2, 17.6, 3, 0.4, 27, { sauces: 1 }], [10.9, 4.2, 3, 0.45, 28, { sauces: 0, pinos: 1 }]],
    barcas: [[4.0, 16.0, { L: 1.5, mastil: 'alto' }], [11.0, 16.3, { L: 1.3, mastil: 'bajando' }], [15.6, 16.5, { L: 1.0, mastil: null }]],
    anclas: { prefectura: [15.4, 6.3], impresos: [12.6, 8.0], huyuan: [16.4, 9.4], anonimo: [13.4, 11.4], academia: [10.4, 10.6], palacio: [16.4, 12.6] },
    persona: [11.8, 9.8],
    texto: 'La escena del rollo, girada hacia la cámara: el Bian corre por el borde del frente con sus barcas y el Puente Arcoíris lo cruza hacia el borde, como en la pintura, donde el puente lleva fuera del cuadro. La muralla va por el borde izquierdo, con la puerta mirando al camino que baja al puente entre las tiendas; la casa de té está en la orilla. La pagoda, al fondo; la mitad derecha queda para las escuelas.',
    motor: MOTOR_COMUN + ' Aquí: PAGODA en (7,6, 5,0); BIAN por z ≈ 16 (ancho 2,3 a 2,6); PUENTE en (8,0, 15,75), hacia el borde del frente; MURALLA por x ≈ 2,8 con la PUERTA en z = 8,0.'
  }
};

/* ---------- el terreno ---------- */
function alturaDe(T) {
  return (x, z) => {
    const d = rioEn(T.rio, x, z).d;
    if (d < 0) return NIVEL - 0.02 - 0.28 * ss(-d / 0.8);
    if (d < 0.32) return NIVEL + 0.015 + (-NIVEL - 0.015) * ss(d / 0.32);
    return 0;
  };
}
function enPoligono(P, x, z) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, zi] = P[i], [xj, zj] = P[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; }
function suelo(K, T, alt) {
  const RES = 4, N = 16 * RES, s = 1 / RES, pos = [], col = [], c = new THREE.Color(), c2 = new THREE.Color();
  const BASE = ['#ecdcb4', '#e7d6ab', '#efe2be', '#e3d1a5', '#eadab1'];   // el loess claro de la llanura del río Amarillo
  const tono = (x, z, h) => {
    const d = rioEn(T.rio, x, z).d;
    c.set(BASE[Math.abs(Math.floor(x) * 7 + Math.floor(z) * 13) % 5]);
    if (enPoligono(T.plaza, x, z)) c.set(((Math.floor(x * 2) + Math.floor(z * 2)) % 2) ? '#f2e8cb' : '#eee2c2');   // la explanada de las escuelas: tierra apisonada, clara
    for (const p of T.caminos) if (distPoli(p, x, z) < 0.2) { c.set(((Math.floor(x * 3) + Math.floor(z * 3)) % 2) ? '#d9c393' : '#d3bc8b'); break; }   // los caminos de tierra
    if (d > 0 && d < 1.5) c.lerp(c2.set(d < 0.36 ? '#efe2b8' : '#c4d793'), d < 0.36 ? 0.75 : 0.4 * (1 - (d - 0.36) / 1.14));   // la playa y la hierba de la orilla
    if (h < NIVEL + 0.005) c.set('#7fa797');
    return c;
  };
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s, v = (x, z) => [x, alt(x, z), z];
    const q = [v(x0, z0), v(x0, z1), v(x1, z0), v(x1, z0), v(x0, z1), v(x1, z1)];
    const k = tono(x0 + s / 2, z0 + s / 2, (q[0][1] + q[5][1]) / 2);
    for (const p of q) { pos.push(...p); col.push(k.r, k.g, k.b); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
  return K.malla(propia(geo), '#ffffff', { vertexColors: true, sinTinta: true, sombra: false });
}
/* el agua: una hoja al nivel del río; el terreno la tapa donde no es río */
function agua(K) {
  const t = KM.texAgua().clone(); t.needsUpdate = true; t.repeat.set(10, 10);
  const m = new THREE.Mesh(propia(new THREE.PlaneGeometry(16, 16)), K.matMapa(t)); m.rotation.x = -Math.PI / 2; m.position.set(10, NIVEL, 10); m.receiveShadow = true; return m;
}
/* la losa del diorama: las dos caras que ve la cámara (x = 18 y z = 18) siguen el terreno, con el agua en el corte */
function losa(K, alt) {
  const g = new THREE.Group();
  const pared = (fijo, eje) => {
    const pos = [], col = [], c = new THREE.Color(), paso = 0.125;
    const quad = (p0, p1, p2, p3, color) => { c.set(color); for (const p of [p0, p1, p2, p0, p2, p3]) { pos.push(...p); col.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, P = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const xa = eje === 'x' ? fijo : u, za = eje === 'x' ? u : fijo, xb = eje === 'x' ? fijo : u1, zb = eje === 'x' ? u1 : fijo;
      const h0 = alt(xa, za), h1 = alt(xb, zb);
      if (h0 < NIVEL || h1 < NIVEL) quad(P(u, NIVEL), P(u1, NIVEL), P(u1, Math.min(NIVEL, h1)), P(u, Math.min(NIVEL, h0)), KM.KF.aguaD);
      quad(P(u, h0), P(u1, h1), P(u1, Math.min(h1, -0.12)), P(u, Math.min(h0, -0.12)), h0 < NIVEL ? '#8f8a66' : '#d9c296');
      quad(P(u, Math.min(h0, -0.12)), P(u1, Math.min(h1, -0.12)), P(u1, -0.52), P(u, -0.52), PAL.corte1);
      quad(P(u, -0.52), P(u1, -0.52), P(u1, -1.0), P(u, -1.0), PAL.corte2);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
    return new THREE.Mesh(propia(geo), K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide }));
  };
  g.add(pared(E1, 'x'), pared(E1, 'z'));
  const b = K.malla(K.caja(16, 0.5, 16), PAL.corte2, { grosor: 0.03, sombra: false, recibe: false }); b.position.set(10, -0.76, 10); g.add(b);
  return g;
}
/* los juncos de la orilla, en matas */
function juncos(K, T, alt) {
  const g = new THREE.Group(), geo = K.cono(0.035, 0.22, 4), pts = [];
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  for (let i = 0; i < 900 && pts.length < 240; i++) { const x = E0 + h3(i, 1) * 16, z = E0 + h3(i, 2) * 16, d = rioEn(T.rio, x, z).d; if (d > -0.05 && d < 0.3 && distPoli(T.puenteEje, x, z) > 0.75) pts.push([x, z]); }
  const im = K.instancias(geo, '#86ad66', pts.length, { grosor: 0.002 });
  pts.forEach(([x, z], i) => { e.set((h3(i, 4) - 0.5) * 0.4, 0, (h3(i, 5) - 0.5) * 0.4); q.setFromEuler(e); const s = 0.7 + h3(i, 6) * 0.8; sc.set(s, s, s); v.set(x, Math.max(alt(x, z), NIVEL) + 0.08 * s, z); M.compose(v, q, sc); im.setMatrixAt(i, M); });
  im.count = pts.length; im.frustumCulled = false; g.add(im); return g;
}
/* el ancla de un saber: el anillo ámbar en el suelo y su rótulo (siempre a la vista) */
const NOMBRES = { prefectura: 'la escuela de la prefectura', impresos: 'los clásicos impresos', huyuan: 'las dos salas de Hu Yuan', anonimo: 'el examen anónimo', academia: 'la academia', palacio: 'el examen de palacio' };
const TEX = {};
function rotulo(texto) {
  if (!TEX[texto]) {
    const fuente = '700 30px "Avenir Next", "Nunito", sans-serif', med = document.createElement('canvas').getContext('2d'); med.font = fuente;
    const w = Math.ceil(med.measureText(texto).width + 44), h = 60, cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
    g.fillStyle = 'rgba(255,250,238,.94)'; g.strokeStyle = '#d69a2a'; g.lineWidth = 5;
    const r = 24; g.beginPath(); g.moveTo(r, 3); g.lineTo(w - r, 3); g.arcTo(w - 3, 3, w - 3, r, r); g.arcTo(w - 3, h - 3, w - r, h - 3, r); g.lineTo(r, h - 3); g.arcTo(3, h - 3, 3, r, r); g.arcTo(3, 3, r, 3, r); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#4a3216'; g.font = fuente; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(texto, w / 2, h / 2 + 2);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; TEX[texto] = { t, a: w / h };
  }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX[texto].t, depthTest: false, transparent: true })); s.scale.set(0.42 * TEX[texto].a, 0.42, 1); s.renderOrder = 10; return s;
}
function ancla(K, clave, x, z, y) {
  const g = new THREE.Group();
  const r = new THREE.Mesh(propia(new THREE.RingGeometry(0.36, 0.46, 40)), K.mat('#f2b441', { side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.set(x, y + 0.025, z); g.add(r);
  const p = K.malla(K.cilindro(0.025, 0.025, 0.55, 6), '#d69a2a', { grosor: 0.003 }); p.position.set(x, y + 0.275, z); g.add(p);
  const l = rotulo(NOMBRES[clave]); l.position.set(x, y + 1.1, z); g.add(l);
  return g;
}
const RY_FUERA = { '+z': 0, '-z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 };

/* ---------- LA MAQUETA ---------- */
export function maqueta(K, variante = KM.VARIANTES.tablero, { persona = null } = {}) {
  const T = TABLEROS[variante] || TABLEROS.muralla, raiz = new THREE.Group(), g = new THREE.Group(); raiz.add(g); g.position.set(-10, 0, -10);
  /* el puente: perpendicular al río donde lo cruza */
  const [bx, bz] = T.puente, rb = rioEn(T.rio, bx, bz), nx = -rb.tz, nz = rb.tx, pry = Math.atan2(nx, nz), Lp = 13 / 7.5;
  T.puenteEje = [[bx - nx * Lp, bz - nz * Lp], [bx + nx * Lp, bz + nz * Lp]];
  const alt = alturaDe(T);
  g.add(suelo(K, T, alt), agua(K), losa(K, alt), juncos(K, T, alt));
  const quieto = new THREE.Group(); g.add(quieto);
  /* el héroe: la Pagoda de Hierro en su templo */
  const he = KM.heroe(K, 'hierro'); fundir(K, he, 0.01); he.position.set(T.heroe.x, 0, T.heroe.z); he.rotation.y = T.heroe.ry; g.add(he);
  /* el Puente Arcoíris sobre el Bian */
  const pu = KM.puenteArcoiris(K); fundir(K, pu, 0.01); pu.position.set(bx, 0, bz); pu.rotation.y = pry; g.add(pu);
  /* la muralla de tierra apisonada y la puerta con su torre, a 12 m por baldosa */
  T.murallas.forEach(([x0, z0, x1, z1, fuera]) => { const L = Math.hypot(x1 - x0, z1 - z0), m = KM.muralla(K, L, { esc: ESC_MURO }); m.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); m.rotation.y = RY_FUERA[fuera]; quieto.add(m); });
  const pc = KM.puertaCiudad(K, { esc: ESC_MURO }); pc.position.set(T.puerta.x, 0, T.puerta.z); pc.rotation.y = T.puerta.ry; quieto.add(pc);
  /* la casa de té en la orilla, con la terraza sobre el agua */
  { const [tx, tz, lado] = T.te, r = rioEn(T.rio, tx, tz); let ox = tx - r.px, oz = tz - r.pz; const l = Math.hypot(ox, oz) || 1; ox /= l; oz /= l;
    const x = r.px + ox * (r.w / 2 + 0.3), z = r.pz + oz * (r.w / 2 + 0.3), te = KM.segunda(K, 'te'); fundir(K, te, 0.01); te.position.set(x, 0, z); te.rotation.y = Math.atan2(-ox, -oz); g.add(te); }
  /* las barcas, a lo largo del río */
  T.barcas.forEach(([x, z, op]) => { const r = rioEn(T.rio, x, z), b = KM.barca(K, { remeros: 1, carga: 'grano', ...op }); b.position.set(x, NIVEL - 0.02, z); b.rotation.y = -Math.atan2(r.tz, r.tx) + (h3(x, z) < 0.5 ? Math.PI : 0); quieto.add(b); });
  /* los bosquecillos de sauces, moreras y pinos, y las tiendas, pocas */
  T.arboledas.forEach(([x, z, n, r, sem, op]) => { const a = KM.bosquecillo(K, n, r, sem, op); [...a.children].forEach(t => { t.position.x += x; t.position.z += z; if (rioEn(T.rio, t.position.x, t.position.z).d < 0.15) return; t.position.y = Math.max(alt(t.position.x, t.position.z), 0) - 0.02; quieto.add(t); }); });
  T.casas.forEach(([x, z, ry, op]) => { const c = KM.tienda(K, op); c.position.set(x, alt(x, z), z); c.rotation.y = ry; quieto.add(c); });
  fundir(K, quieto);
  /* las anclas de los seis saberes */
  for (const [k, [x, z]] of Object.entries(T.anclas)) g.add(ancla(K, k, x, z, alt(x, z)));
  if (persona) { persona.position.set(T.persona[0], alt(...T.persona), T.persona[1]); g.add(persona); }
  raiz.userData.tablero = T;
  return raiz;
}
