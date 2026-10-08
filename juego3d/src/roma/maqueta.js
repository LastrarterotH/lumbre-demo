/* ============================================================
   roma/maqueta
   Las tres composiciones del tablero de Roma para la hoja de bocetos (juego3d/bocetos/roma.html): el tablero entero de
   16 × 16 (x, z de 2 a 18; la cámara mira desde +x +z, así que el fondo es la esquina de x + z chicas) con las piezas
   REALES a escala: el Foro Romano con el Capitolio (el héroe, a 20 m por baldosa), el Tíber con su orilla y la isla
   Tiberina con el puente Fabricio, el relieve (el Capitolio, que viene con el héroe, y en una el Palatino), pocas casas
   (las ínsulas del barrio y alguna domus), los pinos piñoneros y los cipreses en bosquecillos y el suelo abierto de la
   mitad del frente, con las anclas de los seis saberes.
   No entra al juego: dice dónde va cada cosa. Roma no tiene motor todavía: TABLEROS[v].motor dice qué constantes tendría
   que declarar su 09x (y su espejo roma/lugares.js).
   ============================================================ */
import * as THREE from 'three';
import { PAL, fundir } from '../kit.js';
import * as RM from './monumentos.js';

const E0 = 2, E1 = 18, NIVEL = -0.06;
const ss = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
const h3 = (a, b, c = 0) => { const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return s - Math.floor(s); };
const propia = geo => { geo.userData.propia = true; return geo; };
/* la distancia de un punto a una polilínea, con el ancho interpolado a lo largo de ella */
function distRioPoli(pts, anchos, x, z) {
  let d = 1e9;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], vx = bx - ax, vz = bz - az, L = vx * vx + vz * vz;
    const t = L ? Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L)) : 0;
    const w = anchos[i] + (anchos[i + 1] - anchos[i]) * t;
    d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t) - w / 2);
  }
  return d;
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

/* ---------- LOS TRES TABLEROS (todos con el Foro de héroe, la isla Tiberina y las ínsulas) ---------- */
const MOTOR_COMUN = 'Roma no tiene motor todavía: su 09x declararía FORO (la huella del héroe), TIBER (el eje y el ancho del río, con enAgua por distancia, como el Nilo), ISLA y PUENTE (caminable para el A*), las ANCLAS de los seis saberes y los HOGARES de las ínsulas.';
export const TABLEROS = {
  /* A · el Foro mirando al Capitolio, que llena la esquina del fondo; el Tíber por el borde izquierdo con la isla */
  capitolio: {
    nombre: 'El Foro al fondo, el Tíber a la izquierda',
    heroe: { x: 9.6, z: 9.7, ry: 0 },
    rio: suave([[3.0, 0.5], [3.05, 6.0], [3.3, 10.5], [3.8, 13.6], [3.9, 16.0], [3.6, 19.5]], [2.2, 2.2, 2.4, 3.8, 4.4, 3.6]),
    isla: { x: 3.6, z: 15.45, ry: -Math.PI / 2 },
    caminos: [[[9.5, 13.2], [9.9, 15.6], [10.3, 18]], [[12.3, 10.4], [14.6, 9.0], [18, 8.7]], [[6.6, 13.3], [6.4, 14.6], [6.25, 15.35]], [[10.0, 15.0], [13.0, 15.0], [15.4, 13.3], [16.6, 11.2]]],
    plaza: [[11.4, 11.6], [17.4, 9.7], [17.4, 17.4], [11.0, 17.4], [10.6, 14.2]],
    arboledas: [[7.6, 16.9, 5, 0.8, 3, 0.3], [5.1, 10.6, 4, 0.5, 4, 0.8], [17.1, 17.0, 4, 0.6, 5, 0.4], [13.9, 7.6, 3, 0.45, 6, 0.9], [4.8, 3.2, 3, 0.4, 7, 0.5], [16.7, 2.8, 4, 0.6, 8, 0.3], [12.6, 17.2, 3, 0.45, 9, 0.6]],
    casas: [[15.0, 3.7, 0, 'insula', { w: 1.3, d: 1.0, pisos: 3, balcon: true, tiendas: 3, abierta: 1, semilla: 1 }], [17.0, 4.6, -Math.PI / 2, 'insula', { w: 1.0, d: 0.85, pisos: 3, tiendas: 2, abierta: 0, toldo: RM.RO.tela, ropa: true, semilla: 3 }],
      [14.4, 5.7, 0, 'insula', { w: 0.8, d: 0.8, pisos: 2, tiendas: 1, abierta: 9, terraza: true, semilla: 5 }], [16.4, 6.6, 0, 'insula', { w: 0.9, d: 0.75, pisos: 2, tiendas: 2, abierta: 1, semilla: 7 }], [7.6, 15.3, 0, 'domus', { w: 1.2, d1: 0.8, d2: 0.75, h: 0.5 }]],
    fuentes: [[15.7, 7.4]],
    anclas: { ludus: [15.3, 15.8], calculi: [16.5, 13.2], grammaticus: [12.6, 15.9], rhetor: [9.0, 16.6], pagada: [16.0, 10.6], institutio: [13.4, 12.4] },
    persona: [11.6, 14.0],
    texto: 'El héroe en su orientación de verdad: se mira el Foro hacia el oeste y el Capitolio llena la esquina del fondo (la colina va de 4,5 a 13,4 en x y de 2,2 a 6,2 en z; Júpiter, en la cumbre del sur, a la izquierda). El Tíber corre por el borde izquierdo, al pie del Capitolio, y se abre en dos brazos alrededor de la isla Tiberina, con el puente Fabricio a la orilla del Velabro. Detrás a la derecha, por el Argileto, la Subura con sus ínsulas. La mitad del frente queda libre para las escuelas, en un arco que va del ludus (lejos) al rhetor (junto a la basílica Julia).',
    motor: MOTOR_COMUN + ' Aquí: FORO en (9,6, 9,7) sin girar; TIBER por el borde x ≈ 3 (ancho 2,2, 4,4 en la isla); ISLA en (3,6, 15,5); el camino de las tres escuelas baja del ludus (15,3, 15,8) al rhetor (9,0, 16,6), al pie de la basílica Julia.'
  },
  /* B · el Foro de costado, con el Palatino y sus domus al frente izquierdo y el Tíber por el borde del frente */
  palatino: {
    nombre: 'El Foro de costado, el Palatino y el Tíber al frente',
    heroe: { x: 9.7, z: 6.0, ry: Math.PI / 2 },
    rio: suave([[0.5, 16.1], [3.5, 16.5], [6.5, 16.9], [9.5, 17.5], [12.5, 18.3], [15.0, 19.6]], [2.6, 4.6, 4.4, 2.8, 2.5, 2.3]),
    isla: { x: 4.9, z: 16.6, ry: 0 },
    loma: { H: 0.95, x0: 6.0, x1: 9.8, z0: 11.7, z1: 13.1, m: [0.9, 1.0, 0.7, 0.8] },
    caminos: [[[13.4, 7.0], [15.5, 7.6], [18, 7.6]], [[10.8, 10.2], [11.6, 12.4], [12.4, 14.6], [13.2, 17.4]], [[5.2, 13.7], [5.0, 12.6], [5.4, 11.4]]],
    plaza: [[11.4, 10.6], [17.4, 9.0], [17.4, 17.4], [13.4, 17.6], [11.0, 14.0]],
    arboledas: [[7.0, 12.4, 5, 0.75, 13, 0.3], [9.6, 13.0, 4, 0.6, 14, 0.5], [16.6, 2.8, 4, 0.6, 15, 0.3], [11.4, 16.0, 3, 0.45, 16, 0.7], [17.2, 16.6, 4, 0.55, 17, 0.4], [2.8, 12.6, 3, 0.5, 18, 0.6], [13.7, 2.6, 3, 0.4, 19, 0.8]],
    casas: [[15.0, 4.0, 0, 'insula', { w: 1.3, d: 1.0, pisos: 3, balcon: true, tiendas: 3, abierta: 1, semilla: 1 }], [16.9, 4.6, -Math.PI / 2, 'insula', { w: 1.0, d: 0.85, pisos: 3, tiendas: 2, abierta: 0, toldo: RM.RO.tela, ropa: true, semilla: 3 }],
      [15.3, 5.9, 0, 'insula', { w: 0.8, d: 0.8, pisos: 2, tiendas: 1, abierta: 9, terraza: true, semilla: 5 }], [7.2, 12.0, 0, 'domus', { w: 1.2, d1: 0.8, d2: 0.75, h: 0.5 }], [9.0, 12.2, 0, 'domus', { w: 1.0, d1: 0.7, d2: 0.6, h: 0.45 }]],
    fuentes: [[14.4, 7.3]],
    anclas: { ludus: [16.4, 15.6], calculi: [16.6, 12.6], grammaticus: [13.9, 15.2], rhetor: [12.4, 11.3], pagada: [15.6, 10.4], institutio: [14.6, 13.0] },
    persona: [13.0, 13.4],
    texto: 'El héroe girado: el Capitolio queda atrás a la izquierda y el Foro corre hacia la derecha, de modo que los frentes de los templos y de la Curia miran a la cámara y la basílica Julia muestra su costado del sur. Hacia el frente izquierdo, el Palatino como relieve (con sus domus y sus pinos: la colina de los que pagaban al grammaticus) y, a sus pies, el Tíber por el borde del frente con la isla Tiberina. Las ínsulas, detrás a la derecha; la mitad derecha del frente, libre para las escuelas.',
    motor: MOTOR_COMUN + ' Aquí: FORO en (9,7, 6,0) girado un cuarto (el Capitolio al oeste del tablero); PALATINO como loma de 0,95 en (6-10, 11,7-13,1); TIBER por el borde del frente (z ≈ 16,5-18); ISLA en (4,9, 16,6) con el puente hacia el Palatino.'
  },
  /* C · el Foro a la derecha y el Tíber en meandro por la izquierda, con la isla en la curva y el Foro Boario en la orilla */
  meandro: {
    nombre: 'El meandro del Tíber y el Foro Boario',
    heroe: { x: 12.2, z: 9.7, ry: 0 },
    rio: suave([[4.8, 0.5], [4.4, 4.5], [3.4, 8.5], [3.5, 11.5], [4.8, 14.3], [7.0, 16.6], [8.6, 19.5]], [2.4, 2.4, 3.0, 4.4, 3.2, 2.6, 2.6]),
    isla: { x: 3.55, z: 11.0, ry: -Math.PI / 2 },
    caminos: [[[12.1, 13.2], [12.3, 15.4], [12.6, 18]], [[9.2, 11.6], [7.9, 12.2], [6.2, 11.1]], [[9.2, 12.8], [8.3, 14.6], [9.4, 16.4], [11.6, 17.0]]],
    plaza: [[8.8, 14.0], [17.6, 13.8], [17.6, 17.6], [10.0, 17.6]],
    arboledas: [[6.4, 7.6, 4, 0.55, 23, 0.5], [7.2, 4.0, 4, 0.6, 24, 0.4], [16.9, 11.8, 4, 0.55, 25, 0.5], [4.2, 17.4, 3, 0.5, 26, 0.3], [9.7, 16.9, 3, 0.4, 27, 0.7], [17.2, 17.2, 3, 0.45, 28, 0.4], [2.6, 3.0, 3, 0.4, 29, 0.6]],
    casas: [[16.9, 7.5, -Math.PI / 2, 'insula', { w: 1.3, d: 1.0, pisos: 3, balcon: true, tiendas: 3, abierta: 1, semilla: 1 }], [16.9, 9.6, -Math.PI / 2, 'insula', { w: 1.0, d: 0.85, pisos: 3, tiendas: 2, abierta: 0, toldo: RM.RO.tela, ropa: true, semilla: 3 }],
      [6.4, 16.4, 0.3, 'insula', { w: 0.8, d: 0.8, pisos: 2, tiendas: 1, abierta: 9, terraza: true, semilla: 5 }], [8.0, 17.3, 0, 'domus', { w: 1.1, d1: 0.75, d2: 0.7, h: 0.48 }]],
    templos: [['tholos', 7.2, 13.4, 0], ['portuno', 7.0, 10.9, 0]],
    fuentes: [[15.4, 12.6]],
    anclas: { ludus: [16.4, 15.6], calculi: [16.4, 13.0], grammaticus: [13.7, 16.2], rhetor: [10.6, 15.0], pagada: [14.9, 14.2], institutio: [12.3, 13.9] },
    persona: [13.0, 15.2],
    texto: 'El Foro con el Capitolio, corrido a la derecha; el Tíber entra por el fondo y dobla en meandro por la esquina izquierda, con la isla Tiberina en la curva y el puente Fabricio a la orilla. En esa orilla, el Foro Boario con sus dos templos que siguen en pie, el redondo de Hércules Víctor y el de Portuno. Las ínsulas, en fila a la derecha; las escuelas, en la franja del frente, de la basílica Julia hacia la esquina.',
    motor: MOTOR_COMUN + ' Aquí: FORO en (12,2, 9,7) sin girar; TIBER como curva (un eje y un ancho, como el Nilo de Egipto); ISLA en (3,6, 11,0); el Foro Boario en la orilla, entre el río y la basílica, con sus dos templos como piezas fijas.'
  }
};

/* ---------- el terreno ---------- */
function alturaDe(T) {
  const loma = T.loma ? RM.meseta(T.loma.H, T.loma.x0, T.loma.x1, T.loma.z0, T.loma.z1, T.loma.m) : null;
  return (x, z) => {
    const d = distRioPoli(T.rio.pts, T.rio.anchos, x, z);
    let h;
    if (d < 0) h = NIVEL - 0.02 - 0.28 * ss(-d / 0.8);
    else if (d < 0.32) h = NIVEL + 0.015 + (-NIVEL - 0.015) * ss(d / 0.32);
    else h = 0;
    if (loma && d > 0) h = Math.max(h, loma(x, z) * ss(d / 0.6));
    return h;
  };
}
function enPoligono(P, x, z) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, zi] = P[i], [xj, zj] = P[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; }
function suelo(K, T, alt) {
  const RES = 4, N = 16 * RES, s = 1 / RES, pos = [], col = [], c = new THREE.Color(), c2 = new THREE.Color();
  const BASE = ['#ecdcb4', '#e7d6ab', '#efe2be', '#e3d1a5', '#eadab1'];
  const tono = (x, z, h) => {
    const d = distRioPoli(T.rio.pts, T.rio.anchos, x, z);
    c.set(BASE[Math.abs(Math.floor(x) * 7 + Math.floor(z) * 13) % 5]);
    if (enPoligono(T.plaza, x, z)) c.set(((Math.floor(x * 2) + Math.floor(z * 2)) % 2) ? '#f1e6c8' : '#ede1c0');   // el suelo de las escuelas: tierra apisonada, clara
    for (const p of T.caminos) if (distPoli(p, x, z) < 0.2) { c.set(((Math.floor(x * 3) + Math.floor(z * 3)) % 2) ? '#cfc3ad' : '#c7baa2'); break; }   // los caminos: losas de basalto entibiadas
    if (d > 0 && d < 1.5) c.lerp(c2.set(d < 0.36 ? '#efe2b8' : '#c4d793'), d < 0.36 ? 0.75 : 0.4 * (1 - (d - 0.36) / 1.14));   // la playa clara y la hierba fresca de la orilla
    if (h > 0.05) c.lerp(c2.set(h > 0.5 ? '#a9c879' : '#bcd58e'), 0.75);                                                        // la loma verde
    if (h < NIVEL + 0.005) c.set('#86a888');
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
/* el agua: una hoja al nivel del río, con el «rubio Tíber»; el terreno la tapa donde no es río */
function agua(K) {
  const t = RM.texAgua().clone(); t.needsUpdate = true; t.repeat.set(10, 10);
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
      if (h0 < NIVEL || h1 < NIVEL) quad(P(u, NIVEL), P(u1, NIVEL), P(u1, Math.min(NIVEL, h1)), P(u, Math.min(NIVEL, h0)), RM.RO.aguaD);
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
/* los juncos y la hierba alta de la orilla, en matas */
function juncos(K, T, alt) {
  const g = new THREE.Group(), geo = K.cono(0.035, 0.22, 4);
  let n = 0; const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  const pts = [];
  for (let i = 0; i < 900 && pts.length < 260; i++) {
    const x = E0 + h3(i, 1) * 16, z = E0 + h3(i, 2) * 16, d = distRioPoli(T.rio.pts, T.rio.anchos, x, z);
    if (d > -0.05 && d < 0.3) pts.push([x, z]);
  }
  const im = K.instancias(geo, '#86ad66', pts.length, { grosor: 0.002 });
  pts.forEach(([x, z], i) => { e.set((h3(i, 4) - 0.5) * 0.4, 0, (h3(i, 5) - 0.5) * 0.4); q.setFromEuler(e); const s = 0.7 + h3(i, 6) * 0.8; sc.set(s, s, s); v.set(x, Math.max(alt(x, z), NIVEL) + 0.08 * s, z); M.compose(v, q, sc); im.setMatrixAt(i, M); n++; });
  im.count = n; im.frustumCulled = false; g.add(im); return g;
}
/* el ancla de un saber: el anillo ámbar en el suelo y su rótulo (siempre a la vista) */
const NOMBRES = { ludus: 'el ludus', calculi: 'los calculi', grammaticus: 'el grammaticus', rhetor: 'el rhetor', pagada: 'la escuela pagada', institutio: 'la Institutio' };
const TEX = {};
function rotulo(texto) {
  if (!TEX[texto]) {
    const cv = document.createElement('canvas'); cv.width = 320; cv.height = 64; const g = cv.getContext('2d'), w = 320, h = 64;
    g.fillStyle = 'rgba(255,250,238,.94)'; g.strokeStyle = '#d69a2a'; g.lineWidth = 5;
    const r = 26; g.beginPath(); g.moveTo(r, 3); g.lineTo(w - r, 3); g.arcTo(w - 3, 3, w - 3, r, r); g.arcTo(w - 3, h - 3, w - r, h - 3, r); g.lineTo(r, h - 3); g.arcTo(3, h - 3, 3, r, r); g.arcTo(3, 3, r, 3, r); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#4a3216'; g.font = '700 32px "Avenir Next", "Nunito", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(texto, w / 2, h / 2 + 2);
    TEX[texto] = new THREE.CanvasTexture(cv); TEX[texto].colorSpace = THREE.SRGBColorSpace;
  }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX[texto], depthTest: false, transparent: true })); s.scale.set(2.3, 0.46, 1); s.renderOrder = 10; return s;
}
function ancla(K, clave, x, z, y) {
  const g = new THREE.Group();
  const r = new THREE.Mesh(propia(new THREE.RingGeometry(0.36, 0.46, 40)), K.mat('#f2b441', { side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.set(x, y + 0.025, z); g.add(r);
  const p = K.malla(K.cilindro(0.025, 0.025, 0.55, 6), '#d69a2a', { grosor: 0.003 }); p.position.set(x, y + 0.275, z); g.add(p);
  const l = rotulo(NOMBRES[clave]); l.position.set(x, y + 1.15, z); g.add(l);
  return g;
}

/* ---------- LA MAQUETA ---------- */
export function maqueta(K, variante = RM.VARIANTES.tablero, { persona = null } = {}) {
  const T = TABLEROS[variante] || TABLEROS.capitolio, alt = alturaDe(T), raiz = new THREE.Group(), g = new THREE.Group(); raiz.add(g); g.position.set(-10, 0, -10);
  g.add(suelo(K, T, alt), agua(K), losa(K, alt), juncos(K, T, alt));
  const quieto = new THREE.Group(); g.add(quieto);
  /* el héroe: el Foro Romano con el Capitolio */
  const fo = RM.heroe(K, 'foro'); fundir(K, fo, 0.01); fo.position.set(T.heroe.x, 0, T.heroe.z); fo.rotation.y = T.heroe.ry; g.add(fo);
  /* la segunda pieza: la isla Tiberina con su puente, en el río */
  const is = RM.islaTiberina(K); fundir(K, is, 0.01); is.position.set(T.isla.x, NIVEL + 0.02, T.isla.z); is.rotation.y = T.isla.ry; g.add(is);
  /* el Foro Boario: el templo redondo de Hércules y el de Portuno (solo en el meandro) */
  (T.templos || []).forEach(([tipo, x, z, ry]) => { const t = tipo === 'tholos' ? RM.tholos(K) : RM.templo(K, { W: 0.6, L: 1.25, podio: 0.12, colH: 0.42, frente: 4, filas: 2, orden: 'jonico', colorPodio: RM.RO.toba }); t.position.set(x, alt(x, z), z); t.rotation.y = ry; quieto.add(t); });
  /* los bosquecillos de pinos y cipreses, y las casas, pocas */
  T.arboledas.forEach(([x, z, n, r, sem, cip]) => { const a = RM.arboleda(K, n, r, sem, { cipreses: cip }); a.children.forEach(t => { t.position.x += x; t.position.z += z; t.position.y = Math.max(alt(t.position.x, t.position.z), 0) - 0.02; quieto.add(t); }); });
  T.casas.forEach(([x, z, ry, tipo, op]) => { const c = tipo === 'domus' ? RM.domus(K, op) : RM.insula(K, op); c.position.set(x, alt(x, z), z); c.rotation.y = ry; quieto.add(c); });
  (T.fuentes || []).forEach(([x, z]) => { const f = RM.fuente(K); f.position.set(x, alt(x, z), z); quieto.add(f); });
  fundir(K, quieto);
  /* las anclas de los seis saberes */
  for (const [k, [x, z]] of Object.entries(T.anclas)) g.add(ancla(K, k, x, z, alt(x, z)));
  if (persona) { persona.position.set(T.persona[0], alt(...T.persona), T.persona[1]); g.add(persona); }
  raiz.userData.tablero = T;
  return raiz;
}
