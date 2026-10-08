/* ============================================================
   bagdad/maqueta
   Las tres composiciones del tablero de Bagdad para la hoja de bocetos (juego3d/bocetos/bagdad.html, replanteo del
   2026-10-04): el tablero entero de 16 × 16 (x, z de 2 a 18; la cámara mira desde +x +z, así que el fondo es la esquina
   de x + z chicas) con las piezas REALES a escala: la Ciudad Redonda, el Tigris ancho con su orilla y sus barcas, el
   relieve (el dique del río, el tell de la aldea vieja), los palmares en bosquecillos, los campos del Sawad con sus
   canales, pocas casas y el suelo abierto de la mitad del frente, con las anclas de los seis saberes.
   No entra al juego: dice dónde va cada cosa. Cada tablero trae en TABLEROS[v].motor lo que cambiaría en el motor
   (juego/src/09d-bagdad.js y su espejo bagdad/lugares.js).
   ============================================================ */
import * as THREE from 'three';
import { PAL, fundir } from '../kit.js';
import * as BM from './monumentos.js';

const E0 = 2, E1 = 18, NIVEL = -0.06;
const ss = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
const h3 = (a, b, c = 0) => { const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return s - Math.floor(s); };
const propia = geo => { geo.userData.propia = true; return geo; };
/* la distancia de un punto a una polilínea */
function distPoli(pts, x, z) {
  let d = 1e9;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], vx = bx - ax, vz = bz - az, L = vx * vx + vz * vz;
    const t = L ? Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L)) : 0;
    d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t));
  }
  return d;
}
/* una polilínea suavizada (Catmull-Rom) para el río del meandro */
function suave(pts, n = 10) { const c = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z))); return c.getPoints(pts.length * n).map(v => [v.x, v.z]); }

/* ---------- LOS TRES TABLEROS ---------- */
export const TABLEROS = {
  /* A · la ciudad al fondo y el Tigris por el borde del este, como hoy (el motor cambia lo menos) */
  derecha: {
    nombre: 'La ciudad al fondo, el Tigris a la derecha',
    ciudad: { x: 6.6, z: 6.6 },
    rio: { tipo: 'x', x0: 15.2 },
    canales: [[[2.0, 15.3], [5.0, 15.6], [8.5, 16.2], [12.0, 16.35], [15.4, 16.45]], [[4.6, 11.4], [4.6, 15.5]]],
    caminos: [[[6.6, 10.6], [6.6, 18]], [[10.6, 6.6], [15.2, 6.6]], [[6.6, 2.0], [6.6, 2.2]], [[2.0, 6.6], [2.2, 6.6]], [[7.0, 11.4], [12.2, 13.4], [15.0, 13.6]]],
    plaza: [[8.0, 10.9], [14.4, 10.9], [14.4, 15.6], [8.0, 15.6]],
    campos: [[2.3, 11.6, 2.1, 1.7, 'trigo'], [2.3, 13.5, 2.1, 1.6, 'cebada'], [4.95, 11.6, 1.3, 1.8, 'huerta'], [4.95, 13.6, 1.3, 1.6, 'trigo'], [2.3, 16.3, 1.8, 1.5, 'huerta'], [4.4, 16.6, 2.0, 1.3, 'trigo'], [8.3, 16.8, 1.9, 1.1, 'cebada']],
    palmares: [[12.5, 8.3, 14, 1.05, 3], [13.9, 9.9, 7, 0.6, 4], [3.1, 12.5, 6, 0.55, 5], [10.8, 17.25, 9, 0.75, 6], [14.0, 17.3, 7, 0.6, 7], [11.6, 2.9, 9, 0.8, 8], [14.5, 3.0, 6, 0.55, 9], [7.4, 17.4, 4, 0.4, 10], [2.9, 9.9, 5, 0.5, 11]],
    tell: { x: 13.1, z: 5.0, r: 1.4, h: 0.62 },
    casas: [[8.6, 11.35, 0.1, { w: 1.0, d: 0.86, h: 0.78, tono: BM.AB.ante, celosia: true, conBadgir: true, semilla: 3 }], [9.55, 15.1, -0.08, { w: 0.86, d: 0.8, h: 0.55, tono: BM.AB.cal, cama: true, palma: false }],
      [3.3, 15.0, 0.2, { w: 0.82, d: 0.76, h: 0.52, tono: BM.AB.barro, ropa: true }], [13.8, 7.0, -0.1, 'orilla'], [14.2, 11.6, 0.05, { w: 0.8, d: 0.74, h: 0.6, tono: '#e2cca2', conBadgir: true, palma: false, cama: true }], [11.5, 2.4, 0, { w: 0.76, d: 0.7, h: 0.5, tono: BM.AB.barroL, palma: true }]],
    casa: { x: 12.4, z: 11.0 }, molino: { x: 13.1, z: 16.38 }, puente: { x: 16.6, z: 6.6, largo: 2.9, ry: 0 },
    barcas: [[16.2, 11.0, 'quffa'], [17.0, 13.2, 'vela', 0.2], [16.7, 3.4, 'quffa'], [17.3, 8.9, 'vela', -0.3]],
    caravana: [[6.6, 12.6, -Math.PI / 2], [6.6, 13.4, -Math.PI / 2], [6.6, 14.2, -Math.PI / 2]],
    anclas: { casa: [12.4, 12.25], mesa: [11.4, 13.1], halqa: [9.2, 12.6], papel: [12.7, 15.0], algebra: [10.6, 14.6], madrasa: [14.1, 13.6], caravana: [6.6, 11.35] },
    persona: [10.2, 12.0],
    texto: 'La Ciudad Redonda llena la esquina del fondo (su foso va de 2,2 a 11,0); el Tigris corre ancho por el borde del este con el puente de barcas que sale de la puerta de Jorasán; entre la ciudad y el río, el tell de la aldea vieja de Bagdad y los palmares; a la izquierda, los campos del Sawad con su canal; la mitad del frente es el arrabal (Karkh), abierto, con los seis saberes alrededor de una plaza.',
    motor: 'Motor (09d-bagdad y lugares.js): CIUDAD de (9, 9,2, r 4,6) a (6,6, 6,6, r 3,5), y las PUERTAS con ella; TIGRIS.x0 de 16,55 a 15,2 (el río pasa de 1,5 a 2,8 de ancho); las anclas salen de la muralla al arrabal: CASA a (12,4, 11,0), MESA a (11,4, 13,1), HALQA a (9,2, 12,6), ESPERA (los manuscritos) afuera de la puerta de Kufa, a (6,6, 11,3); CANAL a z 16,4 desde x 2 (el canal de los campos) y MOLINO a (13,1, 16,4); ZOCO a (8,6, 14,8), CADI a (10,6, 14,6), MADRASA a (14,1, 13,6), junto al río. La caravana sigue subiendo por el camino de Kufa (x 6,6).'
  },
  /* B · el Tigris por el fondo, como el mar de Alejandría, y la ciudad delante de él */
  fondo: {
    nombre: 'El Tigris por el fondo',
    ciudad: { x: 6.8, z: 9.0 },
    rio: { tipo: 'z', z0: 4.6 },
    canales: [[[15.6, 4.6], [15.7, 8.0], [15.4, 11.5], [15.6, 14.4], [18.0, 14.8]], [[2.0, 15.8], [6.0, 16.0], [10.0, 16.3]]],
    caminos: [[[6.8, 12.9], [6.8, 18]], [[10.8, 9.0], [18, 9.0]], [[2.0, 9.0], [2.8, 9.0]], [[6.8, 4.6], [6.8, 5.0]]],
    plaza: [[11.4, 10.2], [15.0, 10.2], [15.0, 15.4], [9.6, 15.4], [9.6, 13.4]],
    campos: [[2.3, 14.0, 1.9, 1.5, 'trigo'], [2.3, 16.3, 2.0, 1.5, 'huerta'], [4.5, 16.5, 1.9, 1.3, 'cebada'], [16.0, 5.4, 1.8, 1.7, 'cebada'], [16.0, 9.6, 1.8, 1.6, 'trigo'], [16.2, 15.3, 1.6, 1.4, 'huerta'], [11.5, 16.8, 2.0, 1.1, 'trigo']],
    palmares: [[11.8, 5.9, 12, 0.95, 3], [14.2, 6.3, 7, 0.6, 4], [2.9, 5.5, 6, 0.55, 5], [8.2, 17.25, 9, 0.75, 6], [14.0, 17.2, 7, 0.6, 7], [17.0, 12.2, 6, 0.55, 8], [10.9, 7.8, 5, 0.5, 9]],
    tell: { x: 3.4, z: 15.2, r: 1.2, h: 0.55 },
    casas: [[12.0, 10.4, 0.1, { w: 1.0, d: 0.86, h: 0.78, tono: BM.AB.ante, celosia: true, conBadgir: true, semilla: 3 }], [14.2, 15.6, -0.1, { w: 0.86, d: 0.8, h: 0.55, tono: BM.AB.cal, cama: true, palma: false }],
      [9.5, 6.0, 0, 'orilla'], [13.3, 5.7, 0.04, 'orilla'], [10.4, 15.8, 0.15, { w: 0.82, d: 0.76, h: 0.52, tono: BM.AB.barro, ropa: true }], [17.1, 7.1, 0, { w: 0.76, d: 0.7, h: 0.5, tono: BM.AB.barroL, palma: true }]],
    casa: { x: 13.0, z: 8.6 }, molino: { x: 15.65, z: 12.4, ry: Math.PI / 2 }, puente: { x: 6.8, z: 3.3, largo: 2.7, ry: Math.PI / 2 },
    barcas: [[10.5, 3.3, 'quffa'], [13.5, 2.8, 'vela', 1.5], [3.4, 3.6, 'vela', 1.7], [16.2, 3.7, 'quffa']],
    caravana: [[6.8, 14.4, -Math.PI / 2], [6.8, 15.2, -Math.PI / 2], [6.8, 16.0, -Math.PI / 2]],
    anclas: { casa: [13.0, 9.9], mesa: [12.4, 11.6], halqa: [10.6, 13.2], papel: [14.6, 12.6], algebra: [12.2, 14.3], madrasa: [14.0, 13.9], caravana: [6.8, 13.6] },
    persona: [11.6, 12.4],
    texto: 'El río pasa a ser el telón del fondo (el lugar del mar de Alejandría): corre de derecha a izquierda detrás de la ciudad, con el puente de barcas que sale de la puerta del norte y las barcas a la vista. La ciudad queda a la izquierda, delante del agua; los saberes, en la mitad derecha del frente; los campos, en las dos esquinas de los costados, con el canal del molino que baja del río.',
    motor: 'Motor: el Tigris deja de ser x > x0 y pasa a ser z < 4,6 (enAgua, la corriente y las quffas van a lo largo de x); CIUDAD a (6,8, 9,0, r 3,5); la puerta de Kufa mira al frente (6,8, 12,5) y la de Basora al río; CASA a (13,0, 8,6), MESA a (12,4, 11,6), HALQA a (10,6, 13,2), MADRASA a (14,0, 13,9), CADI a (12,2, 14,3); el CANAL del molino baja del río por x 15,6 y el MOLINO va a (15,6, 12,4); la caravana entra por el camino de Kufa desde el borde del frente.'
  },
  /* C · el Tigris en meandro, con las dos orillas y el puente entre ellas */
  meandro: {
    nombre: 'El meandro y las dos orillas',
    ciudad: { x: 6.4, z: 6.4 },
    rio: { tipo: 'curva', pts: suave([[11.4, 1.4], [13.6, 4.6], [13.4, 8.4], [14.6, 11.6], [18.6, 13.6]]), ancho: 2.5 },
    canales: [[[2.0, 15.0], [6.0, 15.4], [10.0, 16.0], [13.6, 15.4], [15.4, 13.6]]],
    caminos: [[[6.4, 10.4], [6.4, 18]], [[10.3, 6.4], [12.2, 6.4]], [[15.0, 6.6], [18, 6.0]], [[2.0, 6.4], [2.4, 6.4]]],
    plaza: [[7.8, 10.8], [12.0, 10.3], [13.2, 12.6], [12.4, 14.8], [7.8, 14.8]],
    campos: [[2.3, 11.2, 1.8, 1.6, 'trigo'], [2.3, 13.0, 1.8, 1.6, 'cebada'], [2.3, 15.9, 1.9, 1.4, 'huerta'], [4.4, 16.0, 2.0, 1.4, 'trigo'], [16.4, 2.4, 1.5, 1.6, 'cebada'], [16.3, 8.6, 1.6, 1.6, 'trigo'], [9.0, 16.5, 1.8, 1.2, 'cebada']],
    palmares: [[10.5, 2.7, 10, 0.85, 3], [16.9, 4.4, 9, 0.8, 4], [16.0, 10.9, 6, 0.55, 5], [12.0, 9.4, 7, 0.6, 6], [3.1, 12.4, 6, 0.55, 7], [13.0, 17.1, 9, 0.8, 8], [6.9, 17.35, 4, 0.4, 9]],
    tell: { x: 3.4, z: 17.0, r: 0.0, h: 0 },
    isla: { x: 15.2, z: 11.9, r: 0.8 },
    casas: [[8.3, 11.2, 0.1, { w: 1.0, d: 0.86, h: 0.78, tono: BM.AB.ante, celosia: true, conBadgir: true, semilla: 3 }], [10.6, 15.7, -0.1, { w: 0.86, d: 0.8, h: 0.55, tono: BM.AB.cal, cama: true, palma: false }],
      [16.9, 7.0, -0.3, 'orilla'], [11.0, 8.5, 0.6, 'orilla'], [3.4, 14.5, 0.1, { w: 0.82, d: 0.76, h: 0.52, tono: BM.AB.barro, ropa: true }], [17.2, 2.9, 0, { w: 0.76, d: 0.7, h: 0.5, tono: BM.AB.barroL, palma: true }]],
    casa: { x: 10.6, z: 11.0 }, molino: { x: 12.9, z: 15.75, ry: 0.4 }, puente: { x: 13.95, z: 6.4, largo: 3.4, ry: 0.06 },
    barcas: [[13.3, 3.2, 'quffa'], [14.2, 9.6, 'vela', 1.2], [16.6, 12.6, 'quffa'], [12.6, 2.0, 'vela', 1.0]],
    caravana: [[6.4, 12.6, -Math.PI / 2], [6.4, 13.4, -Math.PI / 2], [6.4, 14.2, -Math.PI / 2]],
    anclas: { casa: [10.6, 12.25], mesa: [11.8, 13.2], halqa: [8.9, 13.1], papel: [12.0, 14.6], algebra: [10.0, 14.3], madrasa: [16.7, 6.0], caravana: [6.4, 11.3] },
    persona: [9.8, 12.2],
    texto: 'El Tigris entra por el fondo y dobla en meandro hasta la derecha, como en el dibujo aéreo de 1919: deja la esquina de la derecha como la otra orilla (Rusafa, donde la Nizamiyya se levantó en 1067), unida por el puente de barcas que sale de la puerta de Jorasán. En la curva de adentro, una isla de arena. La ciudad, en el fondo a la izquierda; los saberes en el frente, alrededor de la plaza; los campos, a la izquierda.',
    motor: 'Motor: el río pasa a ser una curva (como el Nilo de Egipto: un eje y un ancho, con enAgua por distancia); CIUDAD a (6,4, 6,4, r 3,5); el puente de barcas une las dos orillas y su tablado tiene que ser caminable para el A*; la MADRASA cruza el río, a (16,7, 6,0), en la orilla del este (la de la Nizamiyya); CASA a (10,6, 11,0), MESA a (11,8, 13,2), HALQA a (8,9, 13,1), CADI a (10,0, 14,3); el CANAL del molino corre por el frente y entra al río en (15,4, 13,6), con el MOLINO a (12,9, 15,8); la caravana, por el camino de Kufa.'
  }
};

/* ---------- el terreno ---------- */
function distRio(T, x, z) {
  const r = T.rio;
  if (r.tipo === 'x') return r.x0 - x;
  if (r.tipo === 'z') return z - r.z0;
  return distPoli(r.pts, x, z) - r.ancho / 2;
}
function enCanal(T, x, z) { let d = 1e9; for (const c of T.canales) d = Math.min(d, distPoli(c, x, z)); return d; }
function alturaDe(T) {
  return (x, z) => {
    const d = distRio(T, x, z);
    let h;
    if (d < 0) h = NIVEL - 0.02 - 0.3 * ss(-d / 0.8);
    else if (d < 0.35) h = NIVEL + 0.015 + (-NIVEL - 0.015) * ss(d / 0.35);
    else h = 0;
    if (d > 0.3 && d < 1.5) h += 0.13 * Math.sin(Math.PI * (d - 0.3) / 1.2);                      // el dique natural del río
    if (T.isla) { const di = Math.hypot((x - T.isla.x) * 0.7, z - T.isla.z); if (di < T.isla.r) h = Math.max(h, NIVEL + 0.1 * ss((1 - di / T.isla.r) * 2)); }
    const dc = enCanal(T, x, z);
    if (dc < 0.34) h = Math.min(h, dc < 0.17 ? NIVEL - 0.06 : NIVEL - 0.06 + (0.06 - NIVEL) * ss((dc - 0.17) / 0.17));
    if (T.tell && T.tell.r) { const dt = Math.hypot(x - T.tell.x, z - T.tell.z); if (dt < T.tell.r) h += T.tell.h * ss(Math.min(1, (1 - dt / T.tell.r) * 1.7)); }
    return h;
  };
}
function enPoligono(P, x, z) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, zi] = P[i], [xj, zj] = P[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; }
function suelo(K, T, alt) {
  const RES = 4, N = 16 * RES, s = 1 / RES, pos = [], col = [], c = new THREE.Color(), c2 = new THREE.Color();
  const BASE = ['#e7d4a5', '#e2ce9d', '#eadaad', '#ddc898', '#e4d1a1'];
  const cam = T.caminos;
  const tono = (x, z, h) => {
    const d = distRio(T, x, z), dc = enCanal(T, x, z);
    c.set(BASE[Math.abs(Math.floor(x) * 7 + Math.floor(z) * 13) % 5]);
    if (enPoligono(T.plaza, x, z)) c.set(((Math.floor(x * 2) + Math.floor(z * 2)) % 2) ? '#eedfba' : '#eadab3');   // la plaza del arrabal, tierra apisonada
    for (const p of cam) if (distPoli(p, x, z) < 0.24) { c.set(((Math.floor(x * 3) + Math.floor(z * 3)) % 2) ? '#d8b88a' : '#d2b082'); break; }   // los caminos de ladrillo
    if (d > 0 && d < 1.6) c.lerp(c2.set(d < 0.35 ? '#dccb98' : '#a9b86e'), d < 0.35 ? 0.6 : 0.55 * (1 - (d - 0.35) / 1.25));   // la playa y la hierba del dique
    if (dc < 0.5) c.lerp(c2.set('#9fb46a'), 0.55 * (1 - dc / 0.5));                                   // las orillas verdes de los canales
    if (T.tell && T.tell.r && Math.hypot(x - T.tell.x, z - T.tell.z) < T.tell.r) c.lerp(c2.set('#cdb486'), 0.6);
    if (T.isla && Math.hypot((x - T.isla.x) * 0.7, z - T.isla.z) < T.isla.r && h > NIVEL) c.set(h > NIVEL + 0.06 ? '#a9b56c' : '#e4d3a2');   // la isla de arena con su juncal
    if (h < NIVEL + 0.005) c.set('#b9a77c');
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
/* el agua: una hoja al nivel del río; el terreno la tapa donde no es río ni canal */
const TEX = {};
function texCanvas(clave, w, h, pinta) {
  if (TEX[clave]) return TEX[clave];
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; pinta(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return TEX[clave] = t;
}
function agua(K) {
  const t = texCanvas('mq-agua', 128, 128, (g, w, h) => {
    g.fillStyle = BM.AB.agua; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) { const y = (i * 37) % 128, x = (i * 53) % 128; g.strokeStyle = i % 2 ? 'rgba(255,255,255,.45)' : 'rgba(40,100,130,.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 4, x + 20, y); g.stroke(); }
  }).clone(); t.needsUpdate = true; t.repeat.set(10, 10);
  const m = new THREE.Mesh(propia(new THREE.PlaneGeometry(16, 16)), K.matMapa(t)); m.rotation.x = -Math.PI / 2; m.position.set(10, NIVEL, 10); m.receiveShadow = true; return m;
}
/* la losa del diorama: las dos caras que ve la cámara (x = 18 y z = 18) siguen el terreno, con el agua en el corte */
function losa(K, T, alt) {
  const g = new THREE.Group();
  const pared = (fijo, eje) => {
    const pos = [], col = [], c = new THREE.Color(), paso = 0.125;
    const quad = (p0, p1, p2, p3, color) => { c.set(color); for (const p of [p0, p1, p2, p0, p2, p3]) { pos.push(...p); col.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, P = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const xa = eje === 'x' ? fijo : u, za = eje === 'x' ? u : fijo, xb = eje === 'x' ? fijo : u1, zb = eje === 'x' ? u1 : fijo;
      const h0 = alt(xa, za), h1 = alt(xb, zb);
      if (h0 < NIVEL || h1 < NIVEL) quad(P(u, NIVEL), P(u1, NIVEL), P(u1, Math.min(NIVEL, h1)), P(u, Math.min(NIVEL, h0)), BM.AB.aguaD);
      const t0 = h0, t1 = h1;
      quad(P(u, t0), P(u1, t1), P(u1, Math.min(t1, -0.12)), P(u, Math.min(t0, -0.12)), t0 < NIVEL ? '#9a8a64' : '#d6bd8c');
      quad(P(u, Math.min(t0, -0.12)), P(u1, Math.min(t1, -0.12)), P(u1, -0.52), P(u, -0.52), PAL.corte1);
      quad(P(u, -0.52), P(u1, -0.52), P(u1, -1.0), P(u, -1.0), PAL.corte2);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
    const m = new THREE.Mesh(propia(geo), K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide })); return m;
  };
  g.add(pared(E1, 'x'), pared(E1, 'z'));
  const b = K.malla(K.caja(16, 0.5, 16), PAL.corte2, { grosor: 0.03, sombra: false, recibe: false }); b.position.set(10, -0.76, 10); g.add(b);
  return g;
}
/* el campo del Sawad: el plano con sus surcos (trigo dorado, cebada verde, huerta en bancales) y su lindero */
function campo(K, x0, z0, w, d, tipo) {
  const COL = { trigo: ['#e2c46c', '#c9a64c'], cebada: ['#9cbf62', '#7da24a'], huerta: ['#7fb257', '#a98a5c'] }[tipo];
  const t = texCanvas('mq-campo-' + tipo, 64, 64, (g, w2, h2) => {
    g.fillStyle = COL[0]; g.fillRect(0, 0, w2, h2);
    if (tipo === 'huerta') { for (let y = 0; y < h2; y += 16) { g.fillStyle = COL[1]; g.fillRect(0, y + 11, w2, 5); for (let x = 3; x < w2; x += 8) { g.fillStyle = '#5d9245'; g.beginPath(); g.arc(x, y + 5, 3.2, 0, 7); g.fill(); } } }
    else for (let y = 0; y < h2; y += 8) { g.fillStyle = COL[1]; g.fillRect(0, y, w2, 2.5); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, y + 4, w2, 1.5); }
  }).clone(); t.needsUpdate = true; t.repeat.set(w / 0.8, d / 0.8);
  const g = new THREE.Group();
  const m = new THREE.Mesh(propia(new THREE.PlaneGeometry(w - 0.08, d - 0.08)), K.matMapa(t)); m.rotation.x = -Math.PI / 2; m.position.set(x0 + w / 2, 0.012, z0 + d / 2); m.receiveShadow = true; g.add(m);
  [[0, d / 2, w, 0.05], [0, -d / 2, w, 0.05], [w / 2, 0, 0.05, d], [-w / 2, 0, 0.05, d]].forEach(([x, z, ww, dd]) => { const b = K.malla(K.caja(ww, 0.035, dd), '#c4a978', { grosor: 0.003 }); b.position.set(x0 + w / 2 + x, 0.017, z0 + d / 2 + z); g.add(b); });
  return g;
}
/* el tell: el montículo de la aldea vieja con sus muros caídos de adobe */
function ruinas(K, T, alt) {
  const g = new THREE.Group(); if (!T.tell || !T.tell.r) return g;
  const { x, z } = T.tell, y = alt(x, z);
  [[-0.3, -0.1, 0.7, 0.2, 0.09, 0.2], [0.25, 0.2, 0.09, 0.16, 0.55, -0.1], [-0.05, 0.38, 0.45, 0.12, 0.08, 0.4], [0.35, -0.3, 0.3, 0.26, 0.08, 0.9], [-0.45, 0.25, 0.08, 0.14, 0.4, 0.3], [0.05, -0.45, 0.4, 0.1, 0.08, -0.2]].forEach(([dx, dz, w, h, d, ry]) => {
    const m = K.malla(K.caja(w, h, d), '#cdb185', { grosor: 0.004 }); m.position.set(x + dx, y + h / 2 - 0.03, z + dz); m.rotation.y = ry; g.add(m);
  });
  for (let i = 0; i < 6; i++) { const r = K.malla(K.roca(0.05 + h3(i, 1) * 0.05, i + 3), '#bfa57a', { grosor: 0.003 }); const a = i * 1.1, rr = 0.5 + h3(i, 2) * 0.5; r.position.set(x + Math.cos(a) * rr, alt(x + Math.cos(a) * rr, z + Math.sin(a) * rr) + 0.02, z + Math.sin(a) * rr); g.add(r); }
  return g;
}
/* la barca de vela del Tigris: el casco, el mástil y la vela latina */
export function velero(K) {
  const g = new THREE.Group();
  const h = K.malla(K.capsula(0.09, 0.55, 0.7), BM.AB.maderaD, { grosor: 0.003 }); h.rotation.z = Math.PI / 2; h.scale.set(1, 1, 0.8); g.add(h);
  const p = K.malla(K.caja(0.6, 0.015, 0.11), BM.AB.madera, { sinTinta: true }); p.position.y = 0.065; g.add(p);
  const m = K.malla(K.cilindro(0.008, 0.01, 0.7, 5), BM.AB.maderaD, { grosor: 0.002 }); m.position.set(0.08, 0.4, 0); g.add(m);
  const s = new THREE.Shape(); s.moveTo(-0.38, 0.12); s.lineTo(0.3, 0.78); s.lineTo(0.12, 0.12); s.closePath();
  const v = K.malla(propia(new THREE.ShapeGeometry(s)), '#f1e7cf', { grosor: 0.003, side: THREE.DoubleSide }); v.position.set(0.0, 0.0, 0.0); g.add(v);
  const a = K.malla(K.cilindro(0.004, 0.004, 0.95, 4), BM.AB.maderaD, { sinTinta: true }); a.position.set(-0.04, 0.45, 0.004); a.rotation.z = -0.78; g.add(a);
  return g;
}
/* el ancla de un saber: el anillo ámbar en el suelo y su rótulo (siempre a la vista) */
const NOMBRES = { casa: 'la Casa', mesa: 'la mesa', halqa: 'la halqa', papel: 'el papel', algebra: 'el álgebra', madrasa: 'la madrasa', caravana: 'la caravana' };
function rotulo(texto) {
  const t = texCanvas('mq-rot-' + texto, 256, 64, (g, w, h) => {
    g.fillStyle = 'rgba(255,250,238,.94)'; g.strokeStyle = '#d69a2a'; g.lineWidth = 5;
    const r = 26; g.beginPath(); g.moveTo(r, 3); g.lineTo(w - r, 3); g.arcTo(w - 3, 3, w - 3, r, r); g.arcTo(w - 3, h - 3, w - r, h - 3, r); g.lineTo(r, h - 3); g.arcTo(3, h - 3, 3, r, r); g.arcTo(3, 3, r, 3, r); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#4a3216'; g.font = '700 34px "Avenir Next", "Nunito", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(texto, w / 2, h / 2 + 2);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(1.9, 0.475, 1); s.renderOrder = 10; return s;
}
function ancla(K, clave, x, z, y) {
  const g = new THREE.Group();
  const r = new THREE.Mesh(propia(new THREE.RingGeometry(0.36, 0.46, 40)), K.mat('#f2b441', { side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.set(x, y + 0.025, z); g.add(r);
  const p = K.malla(K.cilindro(0.025, 0.025, 0.55, 6), '#d69a2a', { grosor: 0.003 }); p.position.set(x, y + 0.275, z); g.add(p);
  const l = rotulo(NOMBRES[clave]); l.position.set(x, y + 1.15, z); g.add(l);
  return g;
}

/* ---------- LA MAQUETA ---------- */
export function maqueta(K, variante = BM.VARIANTES.tablero, { persona = null } = {}) {
  const T = TABLEROS[variante] || TABLEROS.derecha, alt = alturaDe(T), raiz = new THREE.Group(), g = new THREE.Group(); raiz.add(g); g.position.set(-10, 0, -10);
  g.add(suelo(K, T, alt), agua(K), losa(K, T, alt));
  const quieto = new THREE.Group(); g.add(quieto);
  T.campos.forEach(([x0, z0, w, d, tipo]) => quieto.add(campo(K, x0, z0, w, d, tipo)));
  quieto.add(ruinas(K, T, alt));
  /* el héroe: la Ciudad Redonda */
  const ci = BM.heroe(K, 'redonda'); fundir(K, ci, 0.012); ci.position.set(T.ciudad.x, 0, T.ciudad.z); g.add(ci);
  /* la Casa (la pieza de su saber), con el diseño C a 0,6, mirando a la plaza */
  if (T.casa) { const c = BM.casaMonumental(K, 3); fundir(K, c, 0.01); c.scale.setScalar(0.6); c.position.set(T.casa.x, 0, T.casa.z); g.add(c); }
  /* el molino de papel sobre su canal, con su noria */
  if (T.molino) { const m = BM.molinoNoria(K); fundir(K, m, 0.01); m.position.set(T.molino.x, 0, T.molino.z); m.rotation.y = T.molino.ry || 0; m.translateZ(-0.62); g.add(m); }
  /* el puente de barcas, las barcas y la caravana */
  if (T.puente) { const p = BM.puenteBarcas(K, T.puente.largo); p.position.set(T.puente.x, NIVEL + 0.02, T.puente.z); p.rotation.y = T.puente.ry; g.add(p); }
  T.barcas.forEach(([x, z, tipo, ry = 0]) => { const b = tipo === 'vela' ? velero(K) : BM.quffa(K); b.scale.setScalar(tipo === 'vela' ? 1.1 : 0.85); b.position.set(x, NIVEL - 0.01, z); b.rotation.y = ry; g.add(b); });
  T.caravana.forEach(([x, z, ry], i) => { const c = BM.camello(K, { color: ['#c99d66', '#b98d58', '#d2a872'][i % 3] }); c.scale.setScalar(1.05); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c); });
  /* los palmares en bosquecillos y las casas, pocas */
  T.palmares.forEach(([x, z, n, r, sem]) => { const p = BM.palmar(K, n, r, sem); p.position.set(x, 0, z); p.traverse(o => { if (o.isGroup && o.parent === p) o.position.y = alt(x + o.position.x, z + o.position.z); }); quieto.add(p); });
  T.casas.forEach(([x, z, ry, op]) => {
    const c = op === 'orilla' ? BM.casaOrilla(K, { w: 0.95, d: 0.74, balcon: true, conBadgir: true }) : BM.casaPatio(K, op);
    c.position.set(x, alt(x, z), z); c.rotation.y = ry; quieto.add(c);
  });
  fundir(K, quieto);
  /* las anclas de los seis saberes y la de la caravana */
  for (const [k, [x, z]] of Object.entries(T.anclas)) g.add(ancla(K, k, x, z, alt(x, z)));
  if (persona) { persona.position.set(T.persona[0], 0, T.persona[1]); g.add(persona); }
  raiz.userData.tablero = T;
  return raiz;
}
