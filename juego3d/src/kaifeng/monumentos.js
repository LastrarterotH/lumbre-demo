/* ============================================================
   kaifeng/monumentos
   Las piezas de China Song (Época 15, docs/era15-plan.md: Kaifeng hacia 1050-1120, la capital de los Song del Norte)
   para la hoja de bocetos (juego3d/bocetos/kaifeng.html), en tres versiones de verdad cada una:
   - EL HÉROE, con las PROPORCIONES REALES (ESCALA dice cuántos metros mide una baldosa en cada uno):
     A la Pagoda de Hierro (1049) en su templo, el Kaibao; B el Puente Arcoíris sobre el río Bian con la puerta de la
     ciudad y su torre (la escena del rollo del Qingming de Zhang Zeduan); C la Universidad Imperial (Taixue) con su
     sala de examen de doble alero, las tres salas de Wang Anshi, las celdas del examen y el estanque semicircular;
   - LA SEGUNDA PIEZA: la academia (shuyuan) entre pinos, la torre del tambor, la casa de té de dos pisos junto al río;
   - LAS CASAS: las tiendas de la calle del rollo, las casas de patio de los letrados, el barrio del río;
   - los sauces y las moreras, en bosquecillos, y las barcas del Bian.
   La arquitectura es la del Yingzao Fashi (1103): la cubierta cóncava (el juzhe), el alero que se levanta y se abre en
   las esquinas, las ménsulas (dougong) pintadas de verde y azul, la madera bermellón, los muros encalados y las tejas
   grises vidriadas. El frente de cada pieza mira a +z. Paleta clara y cálida.
   ============================================================ */
import * as THREE from 'three';
import { mergeVertices } from '../../vendor/addons/BufferGeometryUtils.js';
import { pon, caja, propia, textura, lamina } from '../agora/monumentos.js';
import { pino } from '../roma/monumentos.js';
import { camello } from '../bagdad/monumentos.js';

export const KF = {
  teja: '#8496a6', tejaD: '#64778b', tejaL: '#aebdc9', cumbre: '#5c6d80',
  berm: '#c64a30', bermD: '#98372a', bermL: '#de6b4a',
  cal: '#f5efe2', calD: '#e3d8c4', calL: '#fbf8f1',
  gris: '#c1bbae', grisD: '#a39d91', grisL: '#d8d3c7',
  muroT: '#d68a6c', muroTD: '#bd7258',
  hierro: '#8e5b3b', hierroD: '#6c4129', hierroL: '#ad774f',
  bronce: '#6f8064', bronceD: '#55634a', oro: '#e0b44a',
  madera: '#a8774c', maderaD: '#7d5434', maderaL: '#c99c6b',
  esmeralda: '#4f8f7a', azul: '#41709c', azulOsc: '#3a4a6a',
  papel: '#f1e6c9', tinta: '#2f2a26', piel: '#e9c39b',
  agua: '#9cc4b4', aguaD: '#79a596', aguaL: '#d9e8d2',
  sauce: '#a4c66f', sauceD: '#86ab57', sauceL: '#c4dc90',
  morera: '#5e9446', moreraD: '#4a7b38', moreraL: '#7bae5c',
  tronco: '#7d6248', troncoD: '#5f4836',
  tapial: '#dcc496', tapialD: '#c7ad7c', tapialL: '#e8d5ab',
  camino: '#dcc89a', estera: '#d2b17a', esteraD: '#ae8d58', paja: '#d9bd82',
  tela: '#efe6cf', telaR: '#c64a30', telaA: '#41709c', telaO: '#d9a441', telaV: '#5f9a6a',
  hueco: '#3b2c26', saco: '#e6d9b8', sacoD: '#cdbd96', flor: '#f4c9d0',
};
export const ESCALA = { hierro: 15, arcoiris: 7.5, taixue: 7 };   // metros por baldosa de cada héroe (las proporciones son las reales)
export const VARIANTES = { heroe: 'hierro', segunda: 'te', casas: 'tiendas', tablero: 'muralla' };   // la recomendación de Claude, hasta que el usuario elija

const h3 = (a, b = 0, c = 0) => { const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return s - Math.floor(s); };
const r2 = n => Math.round(n * 1000) / 1000;
const O = (gr = 0.004) => ({ grosor: gr });
const Z = new THREE.Vector3(0, 0, 1), Y = new THREE.Vector3(0, 1, 0);

/* ---------- las texturas ---------- */
const MR = new WeakMap();
/* un material con textura repetida: la textura se clona por repetición (redondeada) y el material queda en caché */
function matRep(K, clave, tex, ru = 1, rv = 1, extra = {}) {
  let m = MR.get(K); if (!m) MR.set(K, m = new Map());
  const ku = Math.max(1, Math.round(ru)), kv = Math.max(1, Math.round(rv)), k = `${clave}_${ku}_${kv}`;
  if (!m.has(k)) { const t = tex.clone(); t.needsUpdate = true; t.repeat.set(ku, kv); m.set(k, K.matMapa(t, extra)); }
  return m.get(k);
}
/* las tejas: las hileras de tejas redondas (con su brillo vidriado) y los canales; o la paja de los techos pobres */
const TONOS_TEJA = { gris: [KF.teja, KF.tejaL, KF.tejaD], hierro: [KF.hierro, KF.hierroL, KF.hierroD], verde: ['#78a283', '#a0c4a5', '#557f62'] };
const texTeja = tono => textura('kf-teja-' + tono, 64, 64, (g, w, h) => {
  if (tono === 'paja') {
    g.fillStyle = KF.paja; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { g.fillStyle = i % 3 ? 'rgba(150,115,60,.35)' : 'rgba(250,235,190,.6)'; g.fillRect(h3(i, 1) * 64, h3(i, 2) * 64, 1, 6 + h3(i, 3) * 8); }
    for (let r = 0; r < 4; r++) { g.fillStyle = 'rgba(120,90,45,.25)'; g.fillRect(0, r * 16 + 14, w, 2); }
    return;
  }
  const [b, l, d] = TONOS_TEJA[tono];
  g.fillStyle = b; g.fillRect(0, 0, w, h);
  for (let s = 0; s < 4; s++) {
    const x = s * 16;
    g.fillStyle = d; g.fillRect(x + 11, 0, 5, h);                     // el canal (las tejas cóncavas)
    g.fillStyle = l; g.fillRect(x + 3, 0, 4, h);                      // el lomo de las tejas redondas
    g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(x + 4, 0, 1, h);  // el brillo del vidriado
  }
  for (let r = 0; r < 4; r++) { g.fillStyle = 'rgba(40,52,70,.22)'; g.fillRect(0, r * 16 + 14, w, 2); }   // el traslape de cada hilada
}, { repetir: true });
const matTeja = (K, tono = 'gris') => matRep(K, 'kf-tj-' + tono, texTeja(tono));
/* el ladrillo vidriado de la Pagoda de Hierro: losetas color de óxido con relieves (budas sentados, apsaras, leones);
   el vidriado tiene reflejos morados y verdosos, por eso «de hierro» */
const texHierro = () => textura('kf-hierro', 64, 64, (g) => {
  const tonos = ['#8e5b3b', '#83533a', '#9a6643', '#7d5840', '#8c6442', '#76523c'];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const x = i * 16, y = j * 16; g.fillStyle = tonos[Math.floor(h3(i, j, 2) * 6)]; g.fillRect(x, y, 16, 16);
    g.fillStyle = 'rgba(255,214,170,.32)'; g.fillRect(x, y, 16, 2); g.fillRect(x, y, 2, 16);
    g.fillStyle = 'rgba(40,18,8,.38)'; g.fillRect(x, y + 14, 16, 2); g.fillRect(x + 14, y, 2, 16);
    g.fillStyle = 'rgba(50,25,12,.45)';
    if (h3(i, j, 5) < 0.55) { g.beginPath(); g.arc(x + 8, y + 7, 4, 0, 7); g.fill(); g.fillRect(x + 5, y + 9, 6, 4); g.fillStyle = 'rgba(255,220,180,.4)'; g.beginPath(); g.arc(x + 7, y + 6, 1.5, 0, 7); g.fill(); }
    else { g.beginPath(); g.ellipse(x + 8, y + 8, 5, 2.5, -0.4, 0, 7); g.fill(); g.fillStyle = 'rgba(140,150,120,.3)'; g.fillRect(x + 3, y + 3, 4, 2); }
  }
}, { repetir: true });
/* las puertas de celosía (gezi men): marco bermellón, el papel detrás de la reja y el panel bajo */
const texCelosia = () => textura('kf-celosia', 64, 64, (g, w, h) => {
  g.fillStyle = KF.bermD; g.fillRect(0, 0, w, h);
  for (let l = 0; l < 2; l++) {
    const x = l * 32;
    g.fillStyle = KF.berm; g.fillRect(x + 2, 2, 28, 60);
    g.fillStyle = KF.papel; g.fillRect(x + 5, 5, 22, 32);
    g.strokeStyle = KF.bermD; g.lineWidth = 1.5;
    for (let k = 1; k < 5; k++) { g.beginPath(); g.moveTo(x + 5 + k * 4.4, 5); g.lineTo(x + 5 + k * 4.4, 37); g.stroke(); }
    for (let k = 1; k < 7; k++) { g.beginPath(); g.moveTo(x + 5, 5 + k * 4.6); g.lineTo(x + 27, 5 + k * 4.6); g.stroke(); }
    g.fillStyle = '#b5452c'; g.fillRect(x + 6, 44, 20, 15);
    g.strokeStyle = 'rgba(255,220,180,.35)'; g.lineWidth = 1; g.strokeRect(x + 8.5, 46.5, 15, 10);
  }
}, { repetir: true });
/* la ventana de celosía de las casas: un marco y la reja de papel */
const texVentana = (marco = KF.berm) => textura('kf-ventana' + marco, 32, 32, (g, w, h) => {
  g.fillStyle = marco; g.fillRect(0, 0, w, h); g.fillStyle = KF.papel; g.fillRect(3, 3, 26, 26);
  g.strokeStyle = marco; g.lineWidth = 1.5;
  for (let k = 1; k < 5; k++) { g.beginPath(); g.moveTo(3 + k * 5.2, 3); g.lineTo(3 + k * 5.2, 29); g.moveTo(3, 3 + k * 5.2); g.lineTo(29, 3 + k * 5.2); g.stroke(); }
});
/* el portón rojo con sus clavos dorados (las mendings) */
const texPuerta = () => textura('kf-puerta', 64, 64, (g, w, h) => {
  g.fillStyle = KF.bermD; g.fillRect(0, 0, w, h);
  for (let l = 0; l < 2; l++) {
    g.fillStyle = KF.berm; g.fillRect(l * 32 + 2, 2, 28, 60);
    g.fillStyle = KF.oro; for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) { g.beginPath(); g.arc(l * 32 + 7 + i * 6, 8 + j * 9.5, 1.8, 0, 7); g.fill(); }
  }
  g.fillStyle = KF.oro; g.beginPath(); g.arc(28, 34, 2.6, 0, 7); g.arc(36, 34, 2.6, 0, 7); g.fill();
});
/* las ménsulas (dougong) bajo el alero, pintadas de verde y azul con el filo claro, como manda el Yingzao Fashi */
const texDougong = () => textura('kf-dougong', 64, 16, (g, w, h) => {
  g.fillStyle = '#4a352d'; g.fillRect(0, 0, w, h);
  for (let s = 0; s < 4; s++) {
    const x = s * 16;
    g.fillStyle = KF.esmeralda; g.fillRect(x + 5, 11, 6, 5);
    g.fillStyle = KF.azul; g.fillRect(x + 1, 7, 14, 3);
    g.fillStyle = KF.esmeralda; g.fillRect(x + 4, 3, 8, 3);
    g.fillStyle = KF.azul; g.fillRect(x + 2, 0, 12, 2);
    g.fillStyle = 'rgba(255,240,210,.6)'; g.fillRect(x + 1, 7, 14, 1); g.fillRect(x + 4, 3, 8, 1); g.fillRect(x + 5, 11, 6, 1);
  }
}, { repetir: true });
/* la baranda de madera (goulan), calada: el fondo es transparente */
const texBaranda = () => textura('kf-baranda', 64, 16, (g, w, h) => {
  g.clearRect(0, 0, w, h); g.fillStyle = KF.bermD; g.fillRect(0, 0, w, 3); g.fillRect(0, 12, w, 4);
  for (let k = 0; k < 4; k++) g.fillRect(k * 16, 0, 3, h);
  g.strokeStyle = KF.berm; g.lineWidth = 2;
  for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(k * 16 + 3, 3); g.lineTo(k * 16 + 16, 12); g.moveTo(k * 16 + 16, 3); g.lineTo(k * 16 + 3, 12); g.stroke(); }
}, { repetir: true });
const matBaranda = (K, largo) => matRep(K, 'kf-bar', texBaranda(), largo / 0.3, 1, { alphaTest: 0.5, side: THREE.DoubleSide });
/* el agua del Bian: traía el limo del río Amarillo, verde jade con vetas ocres */
export const texAgua = () => textura('kf-agua', 128, 128, (g, w, h) => {
  g.fillStyle = KF.agua; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(214,190,120,.16)'; g.beginPath(); g.ellipse((i * 47) % 128, (i * 29) % 128, 26, 9, 0, 0, 7); g.fill(); }
  for (let i = 0; i < 18; i++) { const y = (i * 37) % 128, x = (i * 53) % 128; g.strokeStyle = i % 3 ? 'rgba(248,252,232,.62)' : 'rgba(50,100,90,.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 4, x + 20, y); g.stroke(); }
}, { repetir: true });
export const matAgua = (K, w, d) => matRep(K, 'kf-ag', texAgua(), w / 1.6, d / 1.6);
/* el ladrillo gris (qingzhuan) de las plataformas y de la puerta */
const texLadrillo = () => textura('kf-ladrillo', 64, 64, (g, w, h) => {
  g.fillStyle = '#ddd7cb'; g.fillRect(0, 0, w, h);
  const tonos = ['#c3bdb0', '#b8b2a5', '#ccc6b9', '#b0aa9d'];
  for (let f = 0; f < 8; f++) for (let c = -1; c < 3; c++) { g.fillStyle = tonos[Math.floor(h3(f, c, 7) * 4)]; g.fillRect(c * 32 + (f % 2) * 16 + 1, f * 8 + 1, 30, 6); }
}, { repetir: true });
/* la tierra apisonada de la muralla (hangtu): capas finas, en franjas verticales porque así caen las uv de la extrusión */
const texTapial = () => textura('kf-tapial', 64, 64, (g, w, h) => {
  for (let f = 0; f < 8; f++) { g.fillStyle = f % 2 ? KF.tapial : KF.tapialL; g.fillRect(f * 8, 0, 8, h); g.fillStyle = 'rgba(120,88,48,.2)'; g.fillRect(f * 8 + 7, 0, 1, h); }
  for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(150,115,70,.18)'; g.fillRect(h3(i, 1) * 64, h3(i, 2) * 64, 2, 3); }
}, { repetir: true });
/* las losas grises del patio */
const texLosas = () => textura('kf-losas', 64, 64, (g, w, h) => {
  g.fillStyle = '#c9c2b2'; g.fillRect(0, 0, w, h); const tonos = ['#ddd6c6', '#d3ccbb', '#e3ddcf', '#d8d1c0'];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = tonos[Math.floor(h3(i, j, 9) * 4)]; g.fillRect(i * 16 + 1, j * 16 + 1, 14, 14); }
}, { repetir: true });
export const matLosas = (K, w, d) => matRep(K, 'kf-los', texLosas(), w / 0.45, d / 0.45);
/* un letrero con caracteres: la tabla laqueada con el borde dorado (o el paño de la bandera) */
export function letrero(K, texto, { vertical = false, fondo = '#2e4766', tinta = '#f0d27a', borde = '#c9a24a' } = {}) {
  const n = Math.max(1, [...texto].length), W = vertical ? 64 : 64 * n, H = vertical ? 64 * n : 64, clave = 'kf-let-' + texto + fondo + tinta + vertical;
  const t = textura(clave, W + 16, H + 16, (g, w, h) => {
    g.fillStyle = borde; g.fillRect(0, 0, w, h); g.fillStyle = fondo; g.fillRect(5, 5, w - 10, h - 10);
    g.fillStyle = tinta; g.font = '700 50px "Songti SC", "STSong", "Noto Serif CJK SC", "Hiragino Mincho ProN", "SimSun", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    [...texto].forEach((c, i) => g.fillText(c, vertical ? w / 2 : 40 + i * 64, vertical ? 42 + i * 64 : h / 2 + 2));
  });
  return { mat: matRep(K, clave, t), aspecto: (W + 16) / (H + 16) };
}
export function placa(K, texto, alto, op = {}) {
  const L = letrero(K, texto, op), b = K.malla(K.caja(r2(alto * L.aspecto), r2(alto), 0.01), L.mat, O(0.0015)); return b;
}

/* ---------- utilidades de forma ---------- */
/* una viga (caja) de a a b, y un rollizo (cilindro) de a a b */
export function viga(K, a, b, w, h, color, gr = 0.002) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B);
  const m = K.malla(K.caja(r2(w), r2(h), r2(L)), color, gr ? O(gr) : { sinTinta: true }); m.position.addVectors(A, B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(Z, B.sub(A).normalize()); return m;
}
export function rollizo(K, a, b, r, color, gr = 0.002) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B);
  const m = K.malla(K.cilindro(r2(r), r2(r), r2(L), 6), color, gr ? O(gr) : { sinTinta: true }); m.position.addVectors(A, B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(Y, B.sub(A).normalize()); return m;
}
const escalarUV = (geo, f) => { const uv = geo.getAttribute('uv'); for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * f, uv.getY(i) * f); return geo; };
const rect = (a, b) => [[-a, b], [a, b], [a, -b], [-a, -b]];
const oct = (r, giro = 0) => Array.from({ length: 8 }, (_, k) => { const t = Math.PI / 8 + k * Math.PI / 4 + giro; return [r * Math.sin(t), r * Math.cos(t)]; });

/* ---------- LA CUBIERTA (la firma de la arquitectura Song) ----------
   Cada vertiente es una cara con su alero (e0-e1, en planta) y su caballete (r0-r1). La altura sigue la curva cóncava
   del juzhe (más tendida abajo, más empinada arriba); cerca de las esquinas el alero se levanta y se abre (el qiqiao).
   La cara tiene espesor (t) y los bordes libres se cierran, para que la tinta la contorne. v0/v1: el tramo de la
   vertiente que cubre la cara (el xieshan tiene dos: la parte de cuatro aguas y el hastial de arriba). */
function puntoCara(F, u, v, alza, sag) {
  const vg = F.v0 + (F.v1 - F.v0) * v;
  const ex = F.e0[0] + (F.e1[0] - F.e0[0]) * u, ez = F.e0[1] + (F.e1[1] - F.e0[1]) * u;
  const rx = F.r0[0] + (F.r1[0] - F.r0[0]) * u, rz = F.r0[1] + (F.r1[1] - F.r0[1]) * u;
  const w = Math.max(F.a0 ? Math.max(0, 1 - u / 0.4) ** 2 : 0, F.a1 ? Math.max(0, 1 - (1 - u) / 0.4) ** 2 : 0);
  const k = alza * (F.suave ?? 1) * w * Math.max(0, 1 - vg / F.vlim) ** 1.6;
  let dx = ex - rx, dz = ez - rz; const dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl;
  return [ex + (rx - ex) * v + dx * k * 0.9, F.yb + F.hh * Math.pow(vg, sag) + k, ez + (rz - ez) * v + dz * k * 0.9];
}
function geoCubierta(caras, { alza = 0.06, sag = 1.55, t = 0.025, nu = 8, nv = 4, surco = 0.05 } = {}) {
  const pos = [], uv = [], A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), N = new THREE.Vector3(), W = new THREE.Vector3();
  const tri = (a, b, c, want) => {
    A.fromArray(a.p); B.fromArray(b.p).sub(A); C.fromArray(c.p).sub(A); N.crossVectors(B, C);
    if (N.dot(want) < 0) [b, c] = [c, b];
    pos.push(...a.p, ...b.p, ...c.p); uv.push(...a.uv, ...b.uv, ...c.uv);
  };
  const quad = (a, b, c, d, want) => { tri(a, b, c, want); tri(a, c, d, want); };
  const corre = q => ({ p: q.p, uv: [q.uv[0] + 0.25, q.uv[1] + 0.25] });   // los bordes no se suavizan con la cara
  const UP = new THREE.Vector3(0, 1, 0), DOWN = new THREE.Vector3(0, -1, 0);
  for (const F of caras) {
    const nU = F.nu || nu, nV = F.nv || nv, L = Math.hypot(F.e1[0] - F.e0[0], F.e1[1] - F.e0[1]);
    const lv = Math.hypot(Math.hypot(F.r0[0] - F.e0[0], F.r0[1] - F.e0[1]) / Math.max(0.05, F.v1 - F.v0), F.hh);
    const T = [], Bo = [];
    for (let i = 0; i <= nU; i++) {
      T.push([]); Bo.push([]);
      for (let j = 0; j <= nV; j++) {
        const p = puntoCara(F, i / nU, j / nV, alza, sag), vg = F.v0 + (F.v1 - F.v0) * j / nV, q = [i / nU * L / (surco * 4), vg * lv / 0.4];
        T[i].push({ p, uv: q }); Bo[i].push({ p: [p[0], p[1] - t, p[2]], uv: [q[0] + 0.5, q[1] + 0.5] });
      }
    }
    for (let i = 0; i < nU; i++) for (let j = 0; j < nV; j++) { quad(T[i][j], T[i + 1][j], T[i + 1][j + 1], T[i][j + 1], UP); quad(Bo[i][j], Bo[i + 1][j], Bo[i + 1][j + 1], Bo[i][j + 1], DOWN); }
    const fuera = (i, j) => { const u = i / nU; const ex = F.e0[0] + (F.e1[0] - F.e0[0]) * u, ez = F.e0[1] + (F.e1[1] - F.e0[1]) * u, rx = F.r0[0] + (F.r1[0] - F.r0[0]) * u, rz = F.r0[1] + (F.r1[1] - F.r0[1]) * u; return W.set(ex - rx, 0, ez - rz).clone().multiplyScalar(j); };
    const b = F.bordes;
    if (b.v0) for (let i = 0; i < nU; i++) quad(corre(T[i][0]), corre(T[i + 1][0]), corre(Bo[i + 1][0]), corre(Bo[i][0]), fuera(i + 0.5, 1));
    if (b.v1) for (let i = 0; i < nU; i++) quad(corre(T[i][nV]), corre(T[i + 1][nV]), corre(Bo[i + 1][nV]), corre(Bo[i][nV]), fuera(i + 0.5, -1));
    const ed = new THREE.Vector3(F.e1[0] - F.e0[0], 0, F.e1[1] - F.e0[1]);
    if (b.u0) for (let j = 0; j < nV; j++) quad(corre(T[0][j]), corre(T[0][j + 1]), corre(Bo[0][j + 1]), corre(Bo[0][j]), ed.clone().negate());
    if (b.u1) for (let j = 0; j < nV; j++) quad(corre(T[nU][j]), corre(T[nU][j + 1]), corre(Bo[nU][j + 1]), corre(Bo[nU][j]), ed);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  const m = mergeVertices(geo); geo.dispose(); m.computeVertexNormals(); return propia(m);
}
const cara = (e0, e1, r0, r1, H, o = {}) => ({ e0, e1, r0, r1, v0: 0, v1: 1, vlim: 1, yb: 0, hh: H, a0: true, a1: true, bordes: { v0: true }, ...o });
/* las caras de cada tipo: wudian (cuatro aguas, el de más rango), xieshan (cuatro aguas con hastial arriba), dos (dos aguas
   con los hastiales volados, el de las casas) y pira (la pirámide de los pabellones) */
function carasTecho(tipo, W, D, H) {
  const w = W / 2, d = D / 2;
  if (tipo === 'wudian' || tipo === 'pira' || (tipo === 'xieshan' && w < d)) {
    const R = tipo === 'pira' ? 0 : Math.max(0, w - d * 0.92);
    return [cara([-w, d], [w, d], [-R, 0], [R, 0], H), cara([w, d], [w, -d], [R, 0], [R, 0], H), cara([w, -d], [-w, -d], [R, 0], [-R, 0], H), cara([-w, -d], [-w, d], [-R, 0], [-R, 0], H)];
  }
  if (tipo === 'dos') {
    const o = { bordes: { v0: true, u0: true, u1: true }, suave: 0.35 };
    return [cara([-w, d], [w, d], [-w, 0], [w, 0], H, o), cara([w, -d], [-w, -d], [w, 0], [-w, 0], H, o)];
  }
  const xg = Math.max(w * 0.35, w - d * 0.55), zg = d - (w - xg), vb = (d - zg) / d;
  const lo = { v0: 0, v1: vb, vlim: vb }, up = { v0: vb, v1: 1, vlim: vb, bordes: { u0: true, u1: true } };
  return [
    cara([-w, d], [w, d], [-xg, zg], [xg, zg], H, lo), cara([-xg, zg], [xg, zg], [-xg, 0], [xg, 0], H, up),
    cara([w, -d], [-w, -d], [xg, -zg], [-xg, -zg], H, lo), cara([xg, -zg], [-xg, -zg], [xg, 0], [-xg, 0], H, up),
    cara([w, d], [w, -d], [xg, zg], [xg, -zg], H, { ...lo, bordes: { v0: true, v1: true } }), cara([-w, -d], [-w, d], [-xg, -zg], [-xg, zg], H, { ...lo, bordes: { v0: true, v1: true } }),
  ];
}
/* el chiwen: el remate del caballete, la cola de pez que se curva hacia adentro (protege del fuego) */
function chiwen(K, s, lado) {
  const g = new THREE.Group();
  pon(g, K.malla(K.caja(r2(s * 0.9), r2(s * 2.0), r2(s * 0.7)), KF.cumbre, O(0.0015)), 0, s * 1.0, 0);
  const c = K.malla(K.caja(r2(s * 0.65), r2(s * 1.2), r2(s * 0.55)), KF.tejaD, O(0.0015)); c.position.set(-lado * s * 0.42, s * 2.0, 0); c.rotation.z = lado * 0.65; g.add(c);
  return g;
}
/* el techo entero: la cubierta, el caballete con sus chiwen, las limas y, en el xieshan, el hastial encalado */
export function techo(K, W, D, H, { tipo = 'xieshan', tono = 'gris', alza = null, t = null, nu = 8, nv = 4, cumbrera = true, remates = true, muros = null, gablete = KF.cal, gr = 0.004 } = {}) {
  const g = new THREE.Group(), caras = carasTecho(tipo, W, D, H), sag = 1.55;
  const al = alza ?? Math.min(W, D) * 0.075, tt = t ?? r2(Math.max(0.01, Math.min(W, D) * 0.022));
  g.add(K.malla(geoCubierta(caras, { alza: al, sag, t: tt, nu, nv, surco: Math.max(0.022, Math.min(0.055, W / 40)) }), matTeja(K, tono), O(gr)));
  const P = (F, u, v) => puntoCara(F, u, v, al, sag), hr = r2(Math.max(0.012, Math.min(0.09, H * 0.1)));
  const col = tono === 'paja' ? KF.esteraD : tono === 'hierro' ? KF.hierroD : KF.cumbre;
  const lima = (F, u) => { const a = P(F, u, 0), b = P(F, u, 0.5), c = P(F, u, 1); [[a, b], [b, c]].forEach(([p, q]) => g.add(viga(K, [p[0], p[1] + hr * 0.35, p[2]], [q[0], q[1] + hr * 0.35, q[2]], hr * 0.6, hr * 0.7, col, 0.0015))); };
  if (cumbrera) {
    if (tipo === 'pira') {
      [0, 1].forEach(u => { lima(caras[0], u); lima(caras[2], u); });
      pon(g, K.malla(K.esfera(r2(hr * 1.1), 0.5), KF.oro, O(0.0015)), 0, H + hr * 0.9, 0);
      pon(g, K.malla(K.cilindro(r2(hr * 0.5), r2(hr * 0.9), r2(hr * 0.8), 8), col, O(0.0015)), 0, H + hr * 0.2, 0);
    } else {
      const top = tipo === 'xieshan' && W / 2 >= D / 2 ? caras[1] : caras[0], a = P(top, 0, 1), b = P(top, 1, 1), L = Math.abs(b[0] - a[0]);
      if (L > 0.01) pon(g, K.malla(K.caja(r2(L + hr), r2(hr), r2(hr * 0.75)), col, O(0.0018)), (a[0] + b[0]) / 2, H + hr * 0.35, 0);
      if (remates && tipo !== 'dos') [-1, 1].forEach(l => { const c = chiwen(K, hr, l); c.position.set(l * (L / 2 + hr * 0.2), H + hr * 0.6, 0); g.add(c); });
      if (tipo === 'wudian' || (tipo === 'xieshan' && W / 2 < D / 2)) [0, 1].forEach(u => { lima(caras[0], u); lima(caras[2], u); });
      if (tipo === 'dos') [0, 1].forEach(u => { lima(caras[0], u); lima(caras[1], u); });
      if (tipo === 'xieshan' && W / 2 >= D / 2) [0, 1].forEach(u => { lima(caras[0], u); lima(caras[2], u); lima(caras[1], u); lima(caras[3], u); });
    }
  }
  /* el hastial (shanhua) del xieshan: el triángulo encalado bajo el caballete, en los dos costados */
  if (tipo === 'xieshan' && W / 2 >= D / 2) {
    const up = caras[1], s = new THREE.Shape(), n = 6;
    const pts = []; for (let k = 0; k <= n; k++) { const p = P(up, 0, k / n); pts.push([p[2], p[1]]); }
    s.moveTo(pts[0][0], pts[0][1] - tt); pts.forEach(([z, y]) => s.lineTo(z, y - tt * 0.5)); [...pts].reverse().forEach(([z, y]) => s.lineTo(-z, y - tt * 0.5)); s.lineTo(-pts[0][0], pts[0][1] - tt); s.closePath();
    const xg = Math.abs(up.e0[0]);
    [-1, 1].forEach(l => { const geo = propia(new THREE.ShapeGeometry(s)); geo.rotateY(l * Math.PI / 2); const m = K.malla(geo, gablete, { sinTinta: true }); m.position.x = l * (xg - 0.004); g.add(m); });
  }
  /* los hastiales de las paredes bajo un techo de dos aguas */
  if (tipo === 'dos' && muros) {
    const d = D / 2, s = new THREE.Shape(), n = 6, dw = muros.d / 2;
    s.moveTo(-dw, 0); for (let k = 0; k <= n; k++) { const z = -dw + (2 * dw) * k / n, v = (d - Math.abs(z)) / d; s.lineTo(z, H * Math.pow(v, sag) - tt); } s.lineTo(dw, 0); s.closePath();
    [-1, 1].forEach(l => { const geo = propia(new THREE.ShapeGeometry(s)); geo.rotateY(l * Math.PI / 2); const m = K.malla(geo, muros.color || KF.cal, { sinTinta: true }); m.position.x = l * (muros.w / 2 - 0.016); g.add(m); });
  }
  return g;
}
/* un alero de anillo (el faldón entre dos pisos, o el de cada piso de la pagoda): de un polígono exterior a uno interior */
export function alero(K, ext, int, h, { tono = 'gris', alza = null, t = null, nu = 4, nv = 2, gr = 0.004, punta = false } = {}) {
  const n = ext.length, caras = ext.map((e, k) => ({ e0: e, e1: ext[(k + 1) % n], r0: int[k], r1: int[(k + 1) % n], v0: 0, v1: 1, vlim: 1, yb: 0, hh: h, a0: true, a1: true, bordes: punta ? { v0: true } : { v0: true, v1: true } }));
  const L = Math.hypot(ext[1][0] - ext[0][0], ext[1][1] - ext[0][1]);
  const m = K.malla(geoCubierta(caras, { alza: alza ?? L * 0.08, sag: 1.4, t: t ?? r2(Math.max(0.008, h * 0.18)), nu, nv, surco: 0.03 }), matTeja(K, tono), O(gr));
  m.userData.caras = caras; return m;
}

/* ---------- EL EDIFICIO: plataforma, cuerpo de columnas y muros, ménsulas y techo ---------- */
/* un piso: muros encalados con zócalo gris, columnas bermellón, el frente (celosía, portón, ventanas, abierto o tienda),
   la viga del frente y la banda de ménsulas */
export function cuerpo(K, W, D, h, { frente = 'celosia', bahias = 3, dougong = true, pared = KF.cal, col = KF.berm, zocalo = true, gr = 0.004 } = {}) {
  const g = new THREE.Group(), rc = r2(Math.min(0.045, Math.max(0.012, W * 0.015))), hd = dougong ? r2(Math.max(0.025, Math.min(0.12, h * 0.17))) : 0, fz = D / 2;
  const abierto = frente === 'abierto' || frente === 'tienda';
  if (!abierto) pon(g, caja(K, r2(W - 0.03), r2(h), r2(D - 0.03), pared, O(gr)), 0, h / 2, 0);
  else {
    pon(g, caja(K, r2(W - 0.03), r2(h), 0.03, pared, O(gr)), 0, h / 2, -fz + 0.03);
    [-1, 1].forEach(l => pon(g, caja(K, 0.03, r2(h), r2(D - 0.03), pared, O(gr)), l * (W / 2 - 0.03), h / 2, 0));
    pon(g, caja(K, r2(W - 0.06), 0.012, r2(D - 0.05), KF.maderaD, { sinTinta: true, sombra: false }), 0, 0.006, 0);
    pon(g, caja(K, r2(W - 0.06), r2(h * 0.25), 0.012, col, { sinTinta: true }), 0, h - h * 0.125, fz - 0.03);   // el dintel
  }
  if (zocalo && !abierto) pon(g, caja(K, r2(W - 0.02), r2(h * 0.2), r2(D - 0.02), KF.gris, O(gr)), 0, h * 0.1, 0);
  const bah = W / bahias;
  if (frente === 'celosia') pon(g, lamina(K, matRep(K, 'kf-cel', texCelosia(), bahias * 2, 1), r2(W - 0.04), r2(h * 0.84)), 0, h * 0.44, fz - 0.013);
  if (frente === 'puertas') { pon(g, lamina(K, matRep(K, 'kf-pue', texPuerta()), r2(bah * 0.8), r2(h * 0.8)), 0, h * 0.4, fz - 0.013); }
  if (frente === 'ventanas' || frente === 'puertas') for (let i = 0; i < bahias; i++) {
    const x = -W / 2 + bah * (i + 0.5); if (frente === 'puertas' && i === (bahias - 1) / 2) continue;
    if (frente === 'ventanas' && i === Math.floor(bahias / 2)) { pon(g, lamina(K, matRep(K, 'kf-cel', texCelosia(), 2, 1), r2(bah * 0.7), r2(h * 0.8)), x, h * 0.42, fz - 0.013); continue; }
    pon(g, lamina(K, matRep(K, 'kf-ven' + col, texVentana(col)), r2(bah * 0.55), r2(h * 0.36)), x, h * 0.58, fz - 0.013);
  }
  if (frente !== 'abierto' && frente !== 'tienda') [-1, 1].forEach(l => { const v = lamina(K, matRep(K, 'kf-ven' + col, texVentana(col)), r2(Math.min(0.3, D * 0.4)), r2(h * 0.34)); v.rotation.y = l * Math.PI / 2; v.position.set(l * (W / 2 - 0.013), h * 0.58, 0); g.add(v); });
  if (frente === 'tienda') {   // el mostrador y los estantes con sus tinajas
    pon(g, caja(K, r2(W * 0.62), r2(h * 0.32), 0.07, KF.madera, O(0.002)), -W * 0.12, h * 0.16, fz - 0.07);
    pon(g, caja(K, r2(W * 0.8), 0.015, 0.08, KF.maderaD, { sinTinta: true }), 0, h * 0.55, -fz + 0.08);
    for (let k = 0; k < 5; k++) pon(g, K.malla(K.cilindro(0.022, 0.028, 0.06, 6), k % 2 ? '#b98a5a' : '#8d6a8a', { sinTinta: true }), -W * 0.35 + k * W * 0.17, h * 0.59, -fz + 0.08);
  }
  for (let i = 0; i <= bahias; i++) pon(g, K.malla(K.cilindro(rc, r2(rc * 1.08), r2(h), 8), col, O(0.002)), -W / 2 + i * bah, h / 2, fz - 0.012);
  [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(rc, r2(rc * 1.08), r2(h), 8), col, O(0.002)), l * W / 2, h / 2, -fz + 0.012));
  if (!abierto) pon(g, caja(K, r2(W + 0.02), r2(Math.max(0.016, h * 0.075)), 0.03, KF.bermD, O(0.002)), 0, h - h * 0.04, fz - 0.008);
  if (dougong) pon(g, K.malla(K.caja(r2(W + 0.03), hd, r2(D + 0.03)), matRep(K, 'kf-dg', texDougong(), Math.max(2, Math.round(W / hd / 1.2)), 1), O(gr)), 0, h + hd / 2, 0);
  g.userData.alto = h + hd; return g;
}
/* el edificio: la plataforma de piedra (taiji) con su escalinata, uno o más pisos (con el faldón entre pisos y, si se pide,
   la galería con baranda) y el techo */
export function edificio(K, { W = 1.2, D = 0.8, plat = 0.06, pisos = [{ h: 0.32 }], inset = 0.1, baranda = false, tipo = 'xieshan', H = null, vuelo = null, tono = 'gris', pared = KF.cal, col = KF.berm, gr = 0.004, nu, nv, escalones = true, gablete } = {}) {
  const g = new THREE.Group();
  if (plat > 0) {
    pon(g, K.malla(K.caja(r2(W + 0.14), r2(plat), r2(D + 0.14)), matRep(K, 'kf-lad', texLadrillo(), (W + 0.14) / 0.3, 1), O(gr)), 0, plat / 2, 0);
    pon(g, caja(K, r2(W + 0.16), 0.012, r2(D + 0.16), KF.grisL, O(0.002)), 0, plat - 0.006, 0);
    if (escalones) { const n = Math.max(1, Math.round(plat / 0.035)); for (let k = 0; k < n; k++) pon(g, caja(K, r2(Math.min(0.5, W * 0.32)), r2(plat * (n - k) / n), 0.04, KF.grisL, O(0.0015)), 0, plat * (n - k) / n / 2, D / 2 + 0.07 + 0.02 + k * 0.04); }
  }
  let y = plat, w = W, d = D;
  const v = vuelo ?? r2(Math.max(0.07, Math.min(W, D) * 0.2));
  pisos.forEach((p, i) => {
    const c = cuerpo(K, w, d, p.h, { frente: p.frente || 'celosia', bahias: p.bahias || 3, dougong: p.dougong !== false, pared: p.pared || pared, col, gr, zocalo: i === 0 && p.zocalo !== false });
    c.position.y = y; g.add(c); y += c.userData.alto;
    if (p.cosas) p.cosas(g, y - c.userData.alto, w, d);
    if (i < pisos.length - 1) {
      const w2 = w - 2 * inset, d2 = d - 2 * inset, vo = v * 0.8, hr = r2((d / 2 + vo - d2 / 2) * 0.4);
      const ring = alero(K, rect(w / 2 + vo, d / 2 + vo), rect(w2 / 2 - 0.02, d2 / 2 - 0.02), hr, { tono, gr }); ring.position.y = y; g.add(ring);
      if (baranda) {   // la galería (pingzuo): un piso volado sobre ménsulas, con su baranda calada
        const yb = y + hr + 0.005, gw = w2 + 0.16, gd = d2 + 0.16;
        pon(g, K.malla(K.caja(r2(gw), 0.035, r2(gd)), matRep(K, 'kf-dg', texDougong(), Math.round(gw / 0.05), 1), O(gr)), 0, yb + 0.0175, 0);
        const hb = 0.075;
        [[0, gd / 2, gw, 0], [0, -gd / 2, gw, 0], [gw / 2, 0, gd, Math.PI / 2], [-gw / 2, 0, gd, Math.PI / 2]].forEach(([x, z, L, ry]) => { const b = new THREE.Mesh(propia(new THREE.PlaneGeometry(L, hb)), matBaranda(K, L)); b.position.set(x, yb + 0.035 + hb / 2, z); b.rotation.y = ry; g.add(b); });
        y = yb + 0.035;
      } else y += hr * 0.9;
      w = w2; d = d2;
    }
  });
  const HH = H ?? r2((d + 2 * v) * 0.3);
  const t = techo(K, w + 2 * v, d + 2 * v, HH, { tipo, tono, gr, muros: { w, d, color: pared }, nu, nv, gablete }); t.position.y = y; g.add(t);
  g.userData.alto = y + HH; g.userData.techo = y; return g;
}
/* un muro con su caballete de tejas */
export function muro(K, L, h, { grosor = 0.05, color = KF.cal, zocalo = true, gr = 0.003 } = {}) {
  const g = new THREE.Group();
  pon(g, caja(K, r2(L), r2(h), r2(grosor), color, O(gr)), 0, h / 2, 0);
  if (zocalo) pon(g, caja(K, r2(L + 0.006), r2(h * 0.22), r2(grosor + 0.006), KF.gris, O(gr)), 0, h * 0.11, 0);
  const t = techo(K, L + 0.03, grosor + 0.07, r2(Math.max(0.03, grosor * 0.6)), { tipo: 'dos', alza: 0.004, nu: 3, nv: 1, remates: false, gr: 0.002 }); t.position.y = h; g.add(t);
  return g;
}
/* un muro de (x0, z0) a (x1, z1) */
export function tramo(K, padre, x0, z0, x1, z1, h, op) { const L = Math.hypot(x1 - x0, z1 - z0), m = muro(K, L, h, op); m.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); padre.add(m); return m; }

/* ---------- la gente menuda de las maquetas, las sombrillas, los toldos, las banderas ---------- */
export function gente(K, alto = 0.22, color = KF.azulOsc, { gorro = '#2a2622', piel = KF.piel } = {}) {
  const g = new THREE.Group(), r = alto * 0.17;
  g.userData.gente = true;   // la gentecita de la hoja: el juego la cambia por personas de verdad
  pon(g, K.malla(K.cilindro(r2(r * 0.75), r2(r * 1.1), r2(alto * 0.74), 6), color, O(0.0012)), 0, alto * 0.37, 0);
  pon(g, K.malla(K.esfera(r2(r * 0.62), 0.45), piel, O(0.0012)), 0, alto * 0.83, 0);
  if (gorro) pon(g, K.malla(K.cilindro(r2(r * 0.45), r2(r * 0.55), r2(r * 0.5), 6), gorro, { sinTinta: true }), 0, alto * 0.95, 0);
  return g;
}
export function sombrilla(K, s = 1, color = KF.tela) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(r2(0.008 * s), r2(0.008 * s), r2(0.55 * s), 4), KF.maderaD, { sinTinta: true }), 0, 0.275 * s, 0);
  pon(g, K.malla(K.cono(r2(0.25 * s), r2(0.09 * s), 10), color, O(0.002)), 0, 0.58 * s, 0);
  pon(g, K.malla(K.cono(r2(0.07 * s), r2(0.03 * s), 6), KF.esteraD, { sinTinta: true }), 0, 0.635 * s, 0);
  return g;
}
export function toldo(K, w, d, alto, color = KF.estera) {
  const g = new THREE.Group(), t = caja(K, r2(w), 0.01, r2(d), color, O(0.002)); t.position.set(0, alto, d / 2); t.rotation.x = 0.22; g.add(t);
  [-1, 1].forEach(l => g.add(viga(K, [l * (w / 2 - 0.02), 0, d - 0.02], [l * (w / 2 - 0.02), alto - d * 0.2, d - 0.02], 0.014, 0.014, KF.maderaD, 0.0015)));
  return g;
}
/* la bandera de la taberna (jiuqi) o de la casa de té: el mástil, el brazo y el paño con sus caracteres */
export function bandera(K, texto, alto = 2.4, { fondo = KF.tela, tinta = '#3a4f78', borde = KF.telaA } = {}) {
  const g = new THREE.Group();
  g.add(viga(K, [0, 0, 0], [0, alto, 0], 0.025, 0.025, KF.maderaD, 0.002));
  g.add(viga(K, [0, alto - 0.04, 0], [0.34, alto - 0.04, 0], 0.016, 0.016, KF.maderaD, 0.0015));
  const L = letrero(K, texto, { vertical: true, fondo, tinta, borde }), hp = 0.17 / L.aspecto;
  const p = K.malla(K.caja(0.17, r2(hp), 0.006), L.mat, O(0.0015)); p.position.set(0.24, alto - 0.05 - hp / 2, 0); p.rotation.z = 0.04; g.add(p);
  return g;
}
/* el caileng huanmen: la portada de palos atados con paños de colores de las tabernas grandes (la de Sun Yang en el rollo) */
export function huanmen(K, s = 1) {
  const g = new THREE.Group(), W = 0.9 * s, H = 0.95 * s, P = 1.4 * s, c = KF.maderaD, zf = 0.06 * s;
  const palo = (a, b) => g.add(viga(K, a, b, 0.018 * s, 0.018 * s, c, 0.0015));
  [-1, 1].forEach(l => { palo([l * W / 2, 0, zf], [l * W / 2, H, zf]); palo([l * W / 2, 0, -zf], [l * W / 2, H, -zf]); });
  palo([-W / 2 - 0.06 * s, H, zf], [W / 2 + 0.06 * s, H, zf]); palo([-W / 2, H * 0.8, zf], [W / 2, H * 0.8, zf]);
  [[-W / 2, W * 0.12], [W / 2, -W * 0.12], [-W * 0.28, W * 0.3], [W * 0.28, -W * 0.3]].forEach(([x0, x1]) => palo([x0, H, zf], [x1, P, zf]));
  palo([-W * 0.36, (H + P) / 2, zf], [W * 0.36, (H + P) / 2, zf]);
  [KF.telaR, KF.telaV, KF.telaA, KF.telaO, KF.telaR].forEach((col, k) => pon(g, caja(K, r2(0.07 * s), r2(0.03 * s), r2(0.05 * s), col, { sinTinta: true }), -W / 2 + k * W / 4, H - 0.02 * s, zf + 0.004));
  [KF.telaR, KF.telaA, KF.telaV, KF.telaO].forEach((col, k) => pon(g, caja(K, r2(0.045 * s), r2(0.24 * s), 0.004, col, { sinTinta: true }), -W * 0.3 + k * W * 0.2, H * 0.8 - 0.12 * s, zf + 0.012));
  pon(g, K.malla(K.esfera(r2(0.05 * s), 0.5), KF.telaR, O(0.0015)), 0, P + 0.03 * s, zf);
  return g;
}
/* las tinajas, los sacos, los cestos y la carretilla */
export function tinaja(K, s = 1, color = '#b9845a') { const g = new THREE.Group(); pon(g, K.malla(K.esfera(r2(0.07 * s), 0.6), color, O(0.0015)), 0, 0.06 * s, 0).scale.set(1, 1.1, 1); pon(g, K.malla(K.cilindro(r2(0.035 * s), r2(0.045 * s), r2(0.03 * s), 8), color, O(0.0015)), 0, 0.13 * s, 0); return g; }
export function sacos(K, n = 5, s = 1) { const g = new THREE.Group(); for (let k = 0; k < n; k++) { const f = k < 3 ? 0 : 1, i = f ? k - 3 : k; pon(g, K.malla(K.caja(r2(0.13 * s), r2(0.07 * s), r2(0.09 * s)), k % 2 ? KF.saco : KF.sacoD, O(0.0015)), (i - (f ? 0.5 : 1)) * 0.13 * s, 0.035 * s + f * 0.065 * s, 0); } return g; }
function carretilla(K, s = 1) {
  const g = new THREE.Group(); pon(g, caja(K, r2(0.28 * s), r2(0.07 * s), r2(0.16 * s), KF.madera, O(0.0015)), 0, 0.11 * s, 0);
  const r = K.malla(K.cilindro(r2(0.07 * s), r2(0.07 * s), r2(0.02 * s), 10), KF.maderaD, O(0.0015)); r.rotation.x = Math.PI / 2; r.position.set(0.1 * s, 0.07 * s, 0); g.add(r);
  [-1, 1].forEach(l => g.add(viga(K, [-0.1 * s, 0.1 * s, l * 0.06 * s], [-0.32 * s, 0.05 * s, l * 0.07 * s], 0.012 * s, 0.012 * s, KF.maderaD, 0.001)));
  return g;
}
export function mesa(K, s = 1, banco = true) {
  const g = new THREE.Group(); pon(g, caja(K, r2(0.24 * s), 0.015, r2(0.16 * s), KF.madera, O(0.0015)), 0, 0.14 * s, 0);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => pon(g, caja(K, 0.012, r2(0.14 * s), 0.012, KF.maderaD, { sinTinta: true }), a * 0.1 * s, 0.07 * s, b * 0.06 * s));
  if (banco) [-1, 1].forEach(l => pon(g, caja(K, r2(0.24 * s), 0.012, r2(0.05 * s), KF.maderaD, O(0.001)), 0, 0.08 * s, l * 0.14 * s));
  return g;
}

/* ---------- los árboles: el sauce llorón del Bian, la morera de los gusanos de seda, el pino ---------- */
export function sauce(K, s = 1, semilla = 1) {
  const g = new THREE.Group(), a = (h3(semilla, 1) - 0.5) * 0.4, ht = 0.42 * s;
  const tr = K.malla(K.cilindro(r2(0.03 * s), r2(0.055 * s), r2(ht), 6), KF.tronco, O(0.003)); tr.rotation.z = -a; tr.position.set(Math.sin(a) * ht / 2, Math.cos(a) * ht / 2, 0); g.add(tr);
  const T = [Math.sin(a) * ht, Math.cos(a) * ht], cols = [KF.sauce, KF.sauceL, KF.sauceD, KF.sauce, KF.sauceL];
  for (let k = 0; k < 5; k++) { const an = k * 1.257 + h3(semilla, k) * 0.5, rr = 0.13 * s, c = K.malla(K.esfera(1, 0.55), cols[k], O(0.004)); c.scale.set(0.15 * s, 0.24 * s, 0.15 * s); c.position.set(T[0] + Math.cos(an) * rr, T[1] + 0.02 * s + (k % 2) * 0.06 * s, Math.sin(an) * rr); g.add(c); }
  pon(g, K.malla(K.esfera(1, 0.55), KF.sauceL, O(0.004)), T[0], T[1] + 0.2 * s, 0).scale.set(0.15 * s, 0.13 * s, 0.15 * s);
  for (let k = 0; k < 7; k++) { const an = k * 0.9 + h3(semilla, k, 2), rr = 0.22 * s, f = K.malla(K.cono(r2(0.035 * s), r2(0.3 * s), 4), k % 2 ? KF.sauceL : KF.sauce, O(0.002)); f.rotation.x = Math.PI; f.position.set(T[0] + Math.cos(an) * rr, T[1] - 0.1 * s, Math.sin(an) * rr); g.add(f); }
  g.rotation.y = h3(semilla, 3) * 6.28; return g;
}
export function morera(K, s = 1, semilla = 1) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(r2(0.035 * s), r2(0.05 * s), r2(0.26 * s), 6), KF.tronco, O(0.003)), 0, 0.13 * s, 0);
  pon(g, K.malla(K.esfera(r2(0.055 * s), 0.5), KF.troncoD, O(0.002)), 0, 0.27 * s, 0);   // la cabeza podada (a la morera se le cortan las ramas para dar hojas a los gusanos)
  [[0, 0.42, 0, 0.22, KF.moreraD], [0.1, 0.48, 0.06, 0.16, KF.morera], [-0.09, 0.5, -0.05, 0.14, KF.moreraL]].forEach(([x, y, z, r, c]) => { const m = K.malla(K.esfera(1, 0.55), c, O(0.004)); m.scale.set(r * s, r * s * 0.8, r * s); m.position.set(x * s, y * s, z * s); g.add(m); });
  g.rotation.y = h3(semilla, 7) * 6.28; return g;
}
/* el ciruelo en flor del patio de los letrados */
export function ciruelo(K, s = 1) {
  const g = new THREE.Group(); g.add(rollizo(K, [0, 0, 0], [0.04 * s, 0.3 * s, 0], 0.025 * s, KF.troncoD));
  g.add(rollizo(K, [0.04 * s, 0.3 * s, 0], [-0.1 * s, 0.45 * s, 0.05 * s], 0.015 * s, KF.troncoD)); g.add(rollizo(K, [0.04 * s, 0.3 * s, 0], [0.16 * s, 0.42 * s, -0.04 * s], 0.015 * s, KF.troncoD));
  [[-0.1, 0.47, 0.05, 0.1], [0.15, 0.44, -0.04, 0.1], [0.03, 0.52, 0, 0.12]].forEach(([x, y, z, r], k) => pon(g, K.malla(K.esfera(r2(r * s), 0.5), k % 2 ? KF.flor : '#fbe3e6', O(0.002)), x * s, y * s, z * s));
  return g;
}
export function bambu(K, s = 1, semilla = 1) {
  const g = new THREE.Group();
  for (let k = 0; k < 7; k++) { const x = (h3(semilla, k) - 0.5) * 0.2 * s, z = (h3(semilla, k, 3) - 0.5) * 0.2 * s, a = (h3(k, semilla) - 0.5) * 0.25, hh = (0.6 + h3(k, 2) * 0.3) * s; g.add(rollizo(K, [x, 0, z], [x + Math.sin(a) * hh, hh, z], 0.008 * s, '#8fae5a', 0.001)); pon(g, K.malla(K.esfera(r2(0.07 * s), 0.5), k % 2 ? '#7fae5c' : '#9cc46e', O(0.002)), x + Math.sin(a) * hh, hh, z).scale.set(1, 1.6, 1); }
  return g;
}
/* un bosquecillo alrededor de (0, 0): sauces, moreras y pinos; devuelve los árboles como hijos sueltos */
export function bosquecillo(K, n = 6, radio = 1, semilla = 1, { sauces = 0.5, pinos = 0, alto = 1.3 } = {}) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996 + h3(semilla, i) * 0.8, rr = radio * Math.sqrt((i + 0.5) / n) * (0.75 + h3(i, semilla) * 0.3), q = h3(semilla, i, 9), s = alto * (0.85 + h3(i, semilla, 4) * 0.3);
    const t = q < pinos ? pino(K, s * 1.05, semilla * 7 + i) : q < pinos + sauces ? sauce(K, s * 1.25, semilla * 13 + i) : morera(K, s * 1.45, semilla * 5 + i);
    t.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr); g.add(t);
  }
  return g;
}

/* ---------- LAS BARCAS DEL BIAN: el casco plano de popa alta, la cabina con su techo de esteras, el mástil en A ---------- */
export function barca(K, { L = 1.2, carga = 'grano', mastil = 'alto', remeros = 2, cabina = true, gr = 0.003 } = {}) {
  const g = new THREE.Group(), B = L * 0.21, h = L * 0.075, cub = h * 0.62;
  const s = new THREE.Shape(); s.moveTo(-L * 0.5, h * 1.45); s.lineTo(-L * 0.4, 0); s.lineTo(L * 0.38, 0); s.lineTo(L * 0.5, h * 1.85); s.lineTo(L * 0.44, h * 1.85); s.lineTo(L * 0.37, h); s.lineTo(-L * 0.4, h); s.lineTo(-L * 0.46, h * 1.45); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: B, bevelEnabled: false }); geo.translate(0, -h * 0.38, -B / 2);
  g.add(K.malla(propia(geo), KF.madera, O(gr)));
  pon(g, caja(K, r2(L * 0.8), r2(h * 0.18), r2(B + 0.006), KF.maderaD, { sinTinta: true }), -L * 0.01, h * 0.42, 0);
  pon(g, caja(K, r2(L * 0.76), 0.008, r2(B * 0.9), KF.maderaL, { sinTinta: true }), 0, cub, 0);
  if (cabina) {   // la cabina de tablas y su techo curvo de esteras de bambú
    pon(g, caja(K, r2(L * 0.4), r2(h * 1.4), r2(B * 0.84), KF.maderaL, O(gr)), L * 0.08, cub + h * 0.7, 0);
    const cg = new THREE.CylinderGeometry(B * 0.5, B * 0.5, L * 0.44, 8, 1, true, -Math.PI / 2, Math.PI); cg.rotateZ(Math.PI / 2); cg.rotateX(-Math.PI / 2);
    const te = K.malla(propia(cg), KF.estera, { grosor: gr, side: THREE.DoubleSide }); te.scale.y = 0.5; te.position.set(L * 0.08, cub + h * 1.4, 0); g.add(te);
    for (let k = 0; k < 3; k++) [-1, 1].forEach(l => pon(g, caja(K, r2(L * 0.06), r2(h * 0.5), 0.004, KF.hueco, { sinTinta: true }), L * (-0.04 + k * 0.12), cub + h * 0.8, l * B * 0.425));
  }
  if (carga === 'grano') { const sc = sacos(K, 5, L * 0.6); sc.position.set(-L * 0.25, cub, 0); sc.rotation.y = Math.PI / 2; g.add(sc); }
  if (mastil) {   // el mástil en A: se abate hacia la popa para pasar bajo el puente
    const ang = { alto: 0.05, bajando: 0.85, abatido: 1.4 }[mastil] ?? 0, Lm = L * 0.62, x0 = -L * 0.12, top = [x0 + Math.sin(ang) * Lm, cub + Math.cos(ang) * Lm, 0];
    [-1, 1].forEach(l => g.add(rollizo(K, [x0, cub, l * B * 0.32], top, L * 0.008, KF.maderaD, 0.0015)));
    g.add(viga(K, top, [-L * 0.47, cub + h * 0.6, 0], 0.003, 0.003, '#5a4636', 0));
    g.add(viga(K, top, [L * 0.42, cub + h * 1.5, 0], 0.003, 0.003, '#5a4636', 0));
  }
  g.add(viga(K, [L * 0.46, cub + h * 1.2, 0], [L * 0.78, -h * 0.4, B * 0.15], L * 0.012, L * 0.02, KF.maderaD, 0.0015));   // el remo de popa (lu)
  pon(g, caja(K, r2(L * 0.06), r2(h * 1.4), 0.012, KF.maderaD, O(0.0015)), L * 0.5, h * 0.2, 0);                           // el timón
  for (let k = 0; k < remeros; k++) {   // los barqueros, con sus pértigas
    const p = gente(K, L * 0.085, k ? '#6b7a8a' : '#8a6a4a', { gorro: k ? '#d9c79a' : false }); p.position.set(-L * 0.36 + k * L * 0.7, cub, (k ? -1 : 1) * B * 0.3); g.add(p);
    g.add(rollizo(K, [p.position.x + L * 0.03, cub + L * 0.06, p.position.z], [p.position.x - L * 0.12, -h, p.position.z * 1.6], L * 0.004, KF.maderaD, 0));
  }
  return g;
}

/* ============================================================
   1 · EL HÉROE
   ============================================================ */
/* A · la Pagoda de Hierro (1049): octogonal, trece pisos, de ladrillo vidriado color de óxido, con las 104 campanillas
   (ocho por alero) y el remate de bronce. 56,9 m: a 15 m por baldosa mide 3,7 */
export function pagodaHierro(K, { esc = ESCALA.hierro, pisos = 13, gr = 0.004 } = {}) {
  const g = new THREE.Group(), m = v => v / esc;
  [[6.4, 6.8, 1.0, 0.5, KF.gris], [6.0, 6.2, 0.6, 1.3, KF.grisD], [6.3, 6.0, 0.35, 1.78, KF.grisL]].forEach(([rt, rb, h, y, c]) => { const z = K.malla(K.cilindro(r2(m(rt)), r2(m(rb)), r2(m(h)), 8), c, O(gr)); z.rotation.y = Math.PI / 8; z.position.y = m(y); g.add(z); });
  let y = m(1.95);
  const H0 = m(4.4), dH = m(0.13), R0 = m(5.2), R1 = m(3.7), matH = matRep(K, 'kf-hie', texHierro(), 6, 2);
  for (let i = 0; i < pisos; i++) {
    const h = H0 - dH * i, rb = R0 + (R1 - R0) * i / 13, rt = R0 + (R1 - R0) * (i + 1) / 13;
    const c = K.malla(K.cilindro(r2(rt), r2(rb), r2(h), 8), matH, O(gr)); c.rotation.y = Math.PI / 8; c.position.y = y + h / 2; g.add(c);
    const ap = (rb + rt) / 2 * Math.cos(Math.PI / 8);
    for (let k = 0; k < 4; k++) {   // las ventanas en arco, en caras alternas de un piso al otro
      const phi = k * Math.PI / 2 + (i % 2) * Math.PI / 4, v = new THREE.Group(); v.position.set(Math.sin(phi) * ap, y + h * 0.42, Math.cos(phi) * ap); v.rotation.y = phi;
      pon(v, caja(K, r2(m(1.1)), r2(m(1.4)), 0.014, KF.hueco, { sinTinta: true }), 0, 0, 0);
      const a = K.malla(K.cilindro(r2(m(0.55)), r2(m(0.55)), 0.014, 10), KF.hueco, { sinTinta: true }); a.rotation.x = Math.PI / 2; a.position.y = m(0.7); v.add(a);
      g.add(v);
    }
    const ye = y + h - m(0.55);
    const b = K.malla(K.cilindro(r2(rt + m(0.3)), r2(rt + m(0.08)), r2(m(0.6)), 8), KF.hierroD, O(0.003)); b.rotation.y = Math.PI / 8; b.position.y = ye - m(0.15); g.add(b);   // las ménsulas de ladrillo
    const ro = rt + m(1.2), al = alero(K, oct(ro), oct(rt - 0.004), m(0.95), { tono: 'hierro', alza: m(0.6), t: m(0.3), nu: 3, nv: 2, gr: 0.003 }); al.position.y = ye; g.add(al);
    for (let k = 0; k < 8; k++) {   // las campanillas de bronce, una por esquina
      const t = Math.PI / 8 + k * Math.PI / 4, rr = ro + m(0.6) * 0.9;
      pon(g, K.malla(K.cono(r2(m(0.32)), r2(m(0.7)), 6), KF.bronce, { sinTinta: true }), Math.sin(t) * rr, ye + m(0.6) - m(0.55), Math.cos(t) * rr);
    }
    y += h;
  }
  const tp = alero(K, oct(R1 + m(1.3)), oct(0.001), m(2.3), { tono: 'hierro', alza: m(0.7), t: m(0.35), nu: 3, nv: 3, punta: true }); tp.position.y = y - m(0.4); g.add(tp);
  y += m(1.7);
  const b = KF.bronceD;   // el remate (tasha): el loto, el cuenco, los anillos y la calabaza
  [[K.cilindro(r2(m(0.9)), r2(m(0.6)), r2(m(0.5)), 8), 0.25], [K.esfera(r2(m(0.75)), 0.6), 0.9], [K.cilindro(r2(m(0.35)), r2(m(0.35)), r2(m(1.2)), 6), 1.9], [K.esfera(r2(m(0.6)), 0.6), 2.7], [K.esfera(r2(m(0.42)), 0.6), 3.45], [K.cono(r2(m(0.2)), r2(m(0.9)), 6), 4.2]].forEach(([geo, yy]) => pon(g, K.malla(geo, b, O(0.0015)), 0, y + m(yy), 0));
  g.userData.alto = y + m(4.65); return g;
}
/* el incensario de bronce de tres patas y la estela sobre la tortuga (el bixi) */
function incensario(K, s = 1) {
  const g = new THREE.Group(); pon(g, K.malla(K.cilindro(r2(0.05 * s), r2(0.04 * s), r2(0.05 * s), 8), KF.bronce, O(0.0015)), 0, 0.07 * s, 0);
  for (let k = 0; k < 3; k++) { const a = k * 2.09; pon(g, K.malla(K.cilindro(0.006, 0.006, r2(0.05 * s), 4), KF.bronceD, { sinTinta: true }), Math.sin(a) * 0.035 * s, 0.025 * s, Math.cos(a) * 0.035 * s); }
  [-1, 1].forEach(l => pon(g, caja(K, 0.01, r2(0.03 * s), 0.02, KF.bronceD, { sinTinta: true }), l * 0.05 * s, 0.11 * s, 0));
  return g;
}
export function estelaTortuga(K, s = 1) {
  const g = new THREE.Group();
  pon(g, K.malla(K.esfera(1, 0.6), KF.grisD, O(0.0015)), 0, 0.03 * s, 0).scale.set(0.09 * s, 0.045 * s, 0.13 * s);
  pon(g, K.malla(K.esfera(r2(0.03 * s), 0.5), KF.grisD, O(0.0015)), 0, 0.035 * s, 0.13 * s);
  pon(g, caja(K, r2(0.12 * s), r2(0.24 * s), r2(0.03 * s), KF.grisL, O(0.0015)), 0, 0.17 * s, 0);
  const c = K.malla(K.cilindro(r2(0.065 * s), r2(0.065 * s), r2(0.035 * s), 10), KF.grisL, O(0.0015)); c.rotation.x = Math.PI / 2; c.position.set(0, 0.29 * s, 0); c.scale.set(1, 1, 0.7); g.add(c);
  return g;
}
/* el templo Kaibao con la pagoda: el patio enlosado, el muro ocre, la puerta de la montaña, la sala grande, el pabellón de
   la campana y el de los sutras, la estela, el incensario y los pinos */
export function templeKaibao(K) {
  const g = new THREE.Group(), m = v => v / ESCALA.hierro, X = 2.35, Zm = 1.95;
  pon(g, K.malla(K.caja(r2(2 * X - 0.06), 0.02, r2(2 * Zm - 0.06)), matLosas(K, 2 * X, 2 * Zm), { sinTinta: true, sombra: false }), 0, 0.01, 0);
  const te = K.malla(K.cilindro(r2(m(8.5)), r2(m(8.9)), r2(m(0.9)), 8), matRep(K, 'kf-lad', texLadrillo(), 4, 1), O(0.003)); te.rotation.y = Math.PI / 8; te.position.set(-0.85, m(0.45), -0.55); g.add(te);
  const p = pagodaHierro(K); p.position.set(-0.85, m(0.9), -0.55); g.add(p);
  const sg = edificio(K, { W: m(26), D: m(16), plat: m(1.4), pisos: [{ h: m(5.4), bahias: 5 }], tipo: 'xieshan', vuelo: m(3) }); sg.position.set(1.2, 0, -1.0); g.add(sg);
  const pu = edificio(K, { W: m(16), D: m(9), plat: m(0.9), pisos: [{ h: m(4.6), frente: 'puertas', bahias: 3 }], tipo: 'wudian', vuelo: m(2.4) }); pu.position.set(0, 0, Zm); g.add(pu);
  [[1.65, 'campana'], [-1.75, 'sutras']].forEach(([x, que]) => {
    const pb = edificio(K, { W: m(8.5), D: m(8.5), plat: m(0.7), pisos: [{ h: m(3.8), frente: 'puertas', bahias: 1 }, { h: m(3.0), frente: 'abierto', bahias: 1 }], inset: m(0.9), baranda: true, tipo: 'xieshan', vuelo: m(2.0) });
    pb.position.set(x, 0, 0.75); g.add(pb);
    if (que === 'campana') pon(g, K.malla(K.cilindro(r2(m(0.75)), r2(m(1.0)), r2(m(1.8)), 10), KF.bronce, O(0.0015)), x, pb.userData.techo - m(1.5), 0.75);
  });
  tramo(K, g, -X, Zm, -0.58, Zm, m(4), { color: KF.muroT }); tramo(K, g, 0.58, Zm, X, Zm, m(4), { color: KF.muroT });
  tramo(K, g, X, Zm, X, -Zm, m(4), { color: KF.muroT }); tramo(K, g, -X, -Zm, -X, Zm, m(4), { color: KF.muroT }); tramo(K, g, -X, -Zm, X, -Zm, m(4), { color: KF.muroT });
  const ic = incensario(K, 1.2); ic.position.set(-0.85, 0.02, 0.25); g.add(ic);
  const es = estelaTortuga(K, 1); es.position.set(0.55, 0.02, 0.1); es.rotation.y = 0.0; g.add(es);
  [[2.0, 0.0, 1.0], [-2.05, -1.55, 1.1], [0.15, -1.65, 0.95], [-1.95, 1.55, 0.9], [2.0, 1.5, 0.85], [-0.05, -0.2, 0.75]].forEach(([x, z, s], i) => { const t = pino(K, s, 30 + i); t.position.set(x, 0.02, z); g.add(t); });
  g.userData.ficha = { titulo: 'La Pagoda de Hierro', texto: 'Kaifeng, 1049' };
  return g;
}

/* B · el Puente Arcoíris (Hongqiao) sobre el Bian: el arco de vigas entrelazadas sin pilares (dos sistemas de rollizos, de
   tres y de cuatro tramos, atados por travesaños), el tablero curvo con su baranda, los cuatro mástiles con su veleta de
   grulla y los puestos con sombrilla; a 7,5 m por baldosa (luz de 20 m) */
export function puenteArcoiris(K, { esc = ESCALA.arcoiris, gente: conGente = true, puestos = true } = {}) {
  const g = new THREE.Group(), m = v => v / esc;
  const hz = m(10), hz2 = m(13), yc = m(4.8), Wd = m(9), th = m(0.55), N = 18;
  const yDe = z => yc * Math.cos(Math.PI * Math.max(-1, Math.min(1, z / hz2)) / 2);
  for (let i = 0; i < N; i++) {   // el tablero, en tablones
    const z0 = -hz2 + 2 * hz2 * i / N, z1 = -hz2 + 2 * hz2 * (i + 1) / N;
    g.add(viga(K, [0, yDe(z0) - th / 2, z0], [0, yDe(z1) - th / 2, z1], Wd, th, i % 2 ? KF.madera : KF.maderaL, 0.003));
  }
  const y0 = -m(0.9);
  const sisA = [[-hz, y0], [-hz * 0.45, yc - m(1.5)], [hz * 0.45, yc - m(1.5)], [hz, y0]];
  const sisB = [[-hz * 0.97, y0 - m(0.3)], [-hz * 0.66, yc - m(2.9)], [0, yc - m(1.15)], [hz * 0.66, yc - m(2.9)], [hz * 0.97, y0 - m(0.3)]];
  const n = 7, rr = m(0.3);
  [[sisA, 0], [sisB, 0.5]].forEach(([S, off]) => {
    for (let k = 0; k < n; k++) { const x = -Wd / 2 + (k + 0.25 + off * 0.5) * Wd / n; for (let j = 0; j < S.length - 1; j++) g.add(rollizo(K, [x, S[j][1], S[j][0]], [x, S[j + 1][1], S[j + 1][0]], rr, j % 2 ? KF.maderaD : KF.madera, 0.002)); }
    S.slice(1, -1).forEach(([z, y]) => g.add(viga(K, [-Wd / 2 - m(0.7), y, z], [Wd / 2 + m(0.7), y, z], m(0.55), m(0.55), KF.maderaD, 0.002)));
  });
  [-1, 1].forEach(l => {   // la baranda
    const x = l * (Wd / 2 - m(0.25));
    for (let i = 0; i <= N; i++) { const z = -hz2 + 2 * hz2 * i / N, y = yDe(z); pon(g, caja(K, r2(m(0.3)), r2(m(1.15)), r2(m(0.3)), KF.maderaD, O(0.0015)), x, y + m(0.55), z); }
    for (let i = 0; i < N; i++) { const z0 = -hz2 + 2 * hz2 * i / N, z1 = -hz2 + 2 * hz2 * (i + 1) / N; [m(1.05), m(0.5)].forEach(dy => g.add(viga(K, [x, yDe(z0) + dy, z0], [x, yDe(z1) + dy, z1], m(0.22), m(0.2), KF.berm, 0.0012))); }
  });
  [-1, 1].forEach(l => {   // los estribos de piedra en las orillas
    pon(g, K.malla(K.caja(r2(Wd + m(3)), r2(m(1.6)), r2(m(3.4))), matRep(K, 'kf-lad', texLadrillo(), 3, 1), O(0.003)), 0, -m(0.8) + 0.004, l * (hz + m(1.5)));
    [-1, 1].forEach(s => {   // los mástiles con la veleta de la grulla (xiangfeng wu)
      const x = s * (Wd / 2 + m(1.1)), z = l * (hz2 - m(0.6)), H = m(13);
      g.add(rollizo(K, [x, 0, z], [x, H, z], m(0.2), KF.maderaD, 0.0015));
      g.add(viga(K, [x - m(1), H * 0.9, z], [x + m(1), H * 0.9, z], m(0.18), m(0.18), KF.maderaD, 0.0012));
      pon(g, K.malla(K.esfera(r2(m(0.45)), 0.5), KF.calL, O(0.0012)), x, H + m(0.35), z).scale.set(0.7, 0.7, 1.6);
    });
  });
  if (puestos) [[-m(4.2), 1], [m(3.6), -1]].forEach(([z, l]) => { const s = sombrilla(K, m(5.5), l > 0 ? KF.tela : '#e6d6b0'); s.position.set(l * (Wd / 2 - m(1.6)), yDe(z), z); g.add(s); });
  if (conGente) for (let k = 0; k < 11; k++) {
    const z = -hz2 * 0.85 + 2 * hz2 * 0.85 * h3(k, 5), x = (h3(k, 6) - 0.5) * Wd * 0.8, cols = [KF.azulOsc, '#efe6cf', '#7a5a3a', '#5a6f8a', '#a86a4a'];
    const p = gente(K, m(1.65), cols[k % 5], { gorro: k % 3 ? '#2a2622' : false }); p.position.set(x, yDe(z), z); g.add(p);
  }
  g.userData.yDe = yDe; g.userData.largo = 2 * hz2; return g;
}
/* el macizo con su paso trapezoidal (los Song no abovedaban: el paso iba armado con postes de madera, el paicha zhu) */
function macizoConPaso(K, W, D, H, p0, p1, ph, gr = 0.004) {
  const g = new THREE.Group(), s = new THREE.Shape();
  s.moveTo(-W / 2, 0); s.lineTo(-p0 / 2, 0); s.lineTo(-p1 / 2, ph); s.lineTo(p1 / 2, ph); s.lineTo(p0 / 2, 0); s.lineTo(W / 2, 0); s.lineTo(W / 2 * 0.96, H); s.lineTo(-W / 2 * 0.96, H); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: D, bevelEnabled: false }); geo.translate(0, 0, -D / 2); escalarUV(geo, 3);
  g.add(K.malla(propia(geo), matRep(K, 'kf-lad', texLadrillo(), 1, 1), O(gr)));
  [-1, 1].forEach(l => { [D / 2 + 0.004, -D / 2 - 0.004].forEach(z => g.add(viga(K, [l * p0 / 2, 0, z], [l * p1 / 2, ph, z], 0.04, 0.03, KF.maderaD, 0.0015))); });
  [D / 2 + 0.004, -D / 2 - 0.004].forEach(z => g.add(viga(K, [-p1 / 2 - 0.02, ph, z], [p1 / 2 + 0.02, ph, z], 0.04, 0.035, KF.maderaD, 0.0015)));
  pon(g, caja(K, r2(p1 * 0.9), 0.012, r2(D - 0.02), KF.hueco, { sinTinta: true }), 0, ph - 0.008, 0);
  return g;
}
/* la puerta de la ciudad (como la del rollo): el macizo de ladrillo con el paso, el parapeto almenado y la torre de cinco
   tramos con techo de cuatro aguas */
export function puertaCiudad(K, { esc = ESCALA.arcoiris, gr = 0.004 } = {}) {
  const g = new THREE.Group(), m = v => v / esc, W = m(26), D = m(14), Hp = m(12.8);
  g.add(macizoConPaso(K, W, D, Hp, m(5.6), m(3.9), m(7.2), gr));
  [-1, 1].forEach(l => { const p = caja(K, r2(m(2.6)), r2(m(5.4)), r2(m(0.35)), KF.berm, O(0.0015)); p.position.set(l * m(1.5), m(2.7), D / 2 - m(2.2)); p.rotation.y = l * 1.1; g.add(p); });   // los batientes, abiertos
  [D / 2 - m(0.4), -D / 2 + m(0.4)].forEach(z => { for (let x = -W / 2 + m(1); x <= W / 2 - m(1); x += m(2.7)) pon(g, caja(K, r2(m(1.5)), r2(m(1.4)), r2(m(0.7)), KF.gris, O(0.0015)), x * 0.96, Hp + m(0.7), z); });
  const t = edificio(K, { W: m(19.5), D: m(9.5), plat: m(0.5), pisos: [{ h: m(4.6), frente: 'celosia', bahias: 5 }], tipo: 'wudian', H: m(5.6), vuelo: m(2.6), escalones: false }); t.position.y = Hp; g.add(t);
  const pl = placa(K, '', m(1.6), { fondo: '#2e4766' }); pl.scale.x = 1.6; pl.position.set(0, Hp + m(0.5) + m(4.2), m(9.5) / 2 + m(0.3)); g.add(pl);
  g.userData.alto = Hp + t.userData.alto; g.userData.ancho = W; g.userData.fondo = D; return g;
}
/* un tramo de muralla de tierra apisonada (hangtu), con talud y almenas hacia +z */
export function muralla(K, L, { esc = ESCALA.arcoiris, alto = 11, base = 10, cima = 4.5, gr = 0.004 } = {}) {
  const g = new THREE.Group(), m = v => v / esc, s = new THREE.Shape(), H = m(alto);
  s.moveTo(-m(base) / 2, 0); s.lineTo(m(base) / 2, 0); s.lineTo(m(cima) / 2, H); s.lineTo(-m(cima) / 2, H); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: L, bevelEnabled: false }); geo.rotateY(-Math.PI / 2); geo.translate(L / 2, 0, 0); escalarUV(geo, 3);
  g.add(K.malla(propia(geo), matRep(K, 'kf-tap', texTapial(), 1, 1), O(gr)));
  for (let x = -L / 2 + m(1.2); x <= L / 2 - m(1); x += m(3)) pon(g, caja(K, r2(m(1.6)), r2(m(1.3)), r2(m(0.6)), KF.tapialD, O(0.0015)), x, H + m(0.65), m(cima) / 2 - m(0.3));
  return g;
}
/* una tienda del rollo: de una o dos plantas, de madera sin ménsulas (la ley se las prohibía a los plebeyos), con techo de
   dos aguas de tejas o de paja, letrero, toldo y lo de afuera */
export function tienda(K, { W = 1.0, D = 0.75, h = 0.42, h2 = 0, tono = 'gris', frente = 'tienda', letrero: L = null, vertical = true, toldo: conToldo = false, bandera: B = null, huan = false, sombrillas = 0, cosas = [], semilla = 1 } = {}) {
  const pisos = [{ h, frente, bahias: 3, dougong: false, pared: KF.calD }]; if (h2) pisos.push({ h: h2, frente: 'ventanas', bahias: 3, dougong: false, pared: KF.cal });
  const g = new THREE.Group(), e = edificio(K, { W, D, plat: 0.03, pisos, inset: 0.0, tipo: 'dos', tono, col: KF.madera, vuelo: 0.1, H: r2((D + 0.2) * 0.3), escalones: false, nu: 6, nv: 3 }); g.add(e);
  if (L) { const p = placa(K, L, vertical ? 0.42 : 0.1, { vertical, fondo: '#efe3c4', tinta: '#3a2a1a', borde: KF.maderaD }); if (vertical) { p.position.set(W / 2 + 0.06, 0.25, D / 2 + 0.08); } else p.position.set(0, 0.03 + h - 0.06, D / 2 + 0.01); g.add(p); if (vertical) pon(g, caja(K, 0.08, 0.04, 0.04, KF.maderaD, O(0.001)), W / 2 + 0.06, 0.02, D / 2 + 0.08); }
  if (conToldo) { const t = toldo(K, W * 0.9, 0.32, h * 0.85, KF.estera); t.position.z = D / 2; g.add(t); }
  if (B) { const b = bandera(K, B, 1.15); b.position.set(-W / 2 - 0.05, 0, D / 2 + 0.08); g.add(b); }
  if (huan) { const hm = huanmen(K, 0.62); hm.position.set(0, 0, D / 2 + 0.22); g.add(hm); }
  for (let k = 0; k < sombrillas; k++) { const s = sombrilla(K, 1.05, k % 2 ? '#e6d6b0' : KF.tela); s.position.set(-W * 0.3 + k * W * 0.6, 0, D / 2 + 0.38); g.add(s); }
  cosas.forEach(([tipo, x, z, ry = 0]) => { const c = tipo === 'mesa' ? mesa(K) : tipo === 'carretilla' ? carretilla(K) : tipo === 'sacos' ? sacos(K) : tipo === 'cestos' ? cestos(K) : tinaja(K); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c); });
  return g;
}
export function cestos(K, s = 1) { const g = new THREE.Group(); [[0, 0], [0.12, 0.05], [0.05, -0.1]].forEach(([x, z], k) => pon(g, K.malla(K.cilindro(r2(0.05 * s), r2(0.04 * s), r2(0.06 * s), 8), k % 2 ? KF.estera : KF.esteraD, O(0.0015)), x * s, 0.03 * s, z * s)); return g; }
/* el conjunto del rollo: el puente sobre el Bian, la barca que abate el mástil, la puerta con la caravana de camellos */
export function escenaRollo(K) {
  const g = new THREE.Group(), m = v => v / ESCALA.arcoiris;
  const pu = puenteArcoiris(K); pu.position.set(-1.4, 0, 1.0); g.add(pu);
  const ba = barca(K, { L: m(20), mastil: 'bajando', remeros: 3, carga: 'grano' }); ba.position.set(0.75, -0.03, 1.05); ba.rotation.y = 0.04; g.add(ba);
  const bb = barca(K, { L: m(11), mastil: 'alto', remeros: 1, carga: null }); bb.position.set(2.8, -0.03, 1.95); bb.rotation.y = Math.PI + 0.1; g.add(bb);
  const pc = puertaCiudad(K); pc.position.set(1.55, 0, -2.6); g.add(pc);
  const ml = muralla(K, 2.6); ml.position.set(-1.45, 0, -2.6); g.add(ml);
  const mr = muralla(K, 0.6); mr.position.set(3.55, 0, -2.6); g.add(mr);
  [[1.55, -1.45], [1.42, -0.95], [1.22, -0.48]].forEach(([x, z], k) => { const c = camello(K); c.scale.setScalar(0.34); c.position.set(x, 0, z); c.rotation.y = -Math.PI / 2 - 0.25; g.add(c); });
  const t1 = tienda(K, { W: m(8), D: m(5.5), h: m(3.4), tono: 'gris', letrero: '脚店', vertical: true, sombrillas: 1, toldo: false }); t1.position.set(-0.75, 0, -1.55); g.add(t1);
  const t2 = tienda(K, { W: m(7), D: m(5), h: m(3.2), tono: 'paja', toldo: true }); t2.position.set(-2.55, 0, -1.4); g.add(t2);
  [[-3.3, -0.55, 1.0, 1], [-2.1, -0.6, 0.9, 2], [-3.4, 2.55, 1.0, 3], [0.9, 2.6, 0.95, 4], [3.2, -0.65, 0.9, 5]].forEach(([x, z, s, k]) => { const t = sauce(K, s, k); t.position.set(x, 0, z); g.add(t); });
  [[0.2, -1.1, '#7a5a3a'], [-0.2, -0.75, KF.azulOsc], [2.3, -1.2, '#efe6cf'], [-1.0, 2.75, '#5a6f8a']].forEach(([x, z, c]) => { const p = gente(K, m(1.65), c); p.position.set(x, 0, z); g.add(p); });
  g.userData.ficha = { titulo: 'El Puente Arcoíris', texto: 'el río Bian, hacia 1100' };
  return g;
}

/* C · la Universidad Imperial (Taixue): la sala de doble alero al fondo (como la de la Madre Santa de Jinci, 1102), el
   estanque semicircular con su puente (el panchi de las escuelas confucianas), las tres salas de Wang Anshi (de afuera,
   de adentro y de arriba, 1071), las filas de celdas del examen y las estelas de los clásicos en piedra; a 7 m por baldosa */
export function celdas(K, n = 11, L = 1.9, letra = '天', alto = 1) {   // alto: cuánto más altas (en el juego, para que quepa sentado el que escribe)
  const g = new THREE.Group(), d = 0.24, hf = 0.27 * alto, hb = 0.36 * alto, c = L / n;
  pon(g, caja(K, r2(L + 0.04), r2(hb), 0.03, KF.cal, O(0.003)), 0, hb / 2, -d / 2);
  for (let i = 0; i <= n; i++) pon(g, caja(K, 0.02, r2(hf + 0.02), r2(d), KF.cal, O(0.0015)), -L / 2 + i * c, (hf + 0.02) / 2, 0);
  for (let i = 0; i < n; i++) { const x = -L / 2 + (i + 0.5) * c; pon(g, caja(K, r2(c - 0.03), 0.012, r2(d * 0.5), KF.madera, { sinTinta: true }), x, 0.13, -0.02); pon(g, caja(K, r2(c - 0.03), 0.01, r2(d * 0.4), KF.maderaD, { sinTinta: true }), x, 0.07, -0.06); }
  const t = caja(K, r2(L + 0.1), 0.018, r2(d + 0.14), KF.teja, O(0.002)); t.position.set(0, (hf + hb) / 2 + 0.02, 0.005); t.rotation.x = Math.atan2(hb - hf, d + 0.1); g.add(t);
  const p = placa(K, letra + '字號', 0.065, { fondo: '#efe3c4', tinta: '#3a2a1a', borde: KF.bermD }); p.position.set(L / 2 + 0.11, 0.3 * alto, d / 2 - 0.02); g.add(p);
  g.add(viga(K, [L / 2 + 0.11, 0, d / 2 - 0.03], [L / 2 + 0.11, 0.27 * alto, d / 2 - 0.03], 0.02, 0.02, KF.maderaD, 0.001));
  return g;
}
export function estanqueMedialuna(K, r = 0.6) {
  const g = new THREE.Group(), geo = propia(new THREE.CircleGeometry(r, 20, Math.PI, Math.PI)); geo.rotateX(-Math.PI / 2);
  const a = new THREE.Mesh(geo, matAgua(K, 1.6, 1.6)); a.position.y = 0.012; a.receiveShadow = true; g.add(a);
  for (let k = 0; k < 10; k++) { const t0 = Math.PI * k / 10, t1 = Math.PI * (k + 1) / 10; g.add(viga(K, [Math.cos(t0) * (r + 0.02), 0.03, Math.sin(t0) * (r + 0.02)], [Math.cos(t1) * (r + 0.02), 0.03, Math.sin(t1) * (r + 0.02)], 0.04, 0.05, KF.grisL, 0.0015)); }
  g.add(viga(K, [-r - 0.04, 0.03, 0], [r + 0.04, 0.03, 0], 0.04, 0.05, KF.grisL, 0.0015));
  [[-0.12, 0.02, 0.18, 0.09], [0.18, 0.09, r + 0.12, 0.02]].forEach(([z0, y0, z1, y1]) => g.add(viga(K, [0, y0, z0], [0, y1, z1], 0.2, 0.03, KF.grisL, 0.0015)));
  [-1, 1].forEach(l => g.add(viga(K, [l * 0.1, 0.13, 0.02], [l * 0.1, 0.13, r + 0.05], 0.015, 0.04, KF.grisL, 0.001)));
  return g;
}
export function taixue(K) {
  const g = new THREE.Group(), m = v => v / ESCALA.taixue, X = 3.0, Zm = 2.4;
  pon(g, K.malla(K.caja(r2(2 * X - 0.06), 0.02, r2(2 * Zm - 0.06)), matLosas(K, 2 * X, 2 * Zm), { sinTinta: true, sombra: false }), 0, 0.01, 0);
  const sala = edificio(K, { W: m(21), D: m(13.3), plat: m(2.0), pisos: [{ h: m(5.6), bahias: 5 }, { h: m(3.0), frente: 'ventanas', bahias: 3 }], inset: m(2.2), tipo: 'xieshan', H: m(7.6), vuelo: m(3.2) });
  sala.position.set(0, 0, -1.45); g.add(sala);
  const es = estanqueMedialuna(K, 0.6); es.position.set(0, 0, 0.12); g.add(es);
  const pu = edificio(K, { W: m(12), D: m(6), plat: m(0.7), pisos: [{ h: m(4.2), frente: 'puertas', bahias: 3 }], tipo: 'wudian', vuelo: m(2.0) }); pu.position.set(0, 0, 1.95); g.add(pu);
  const pl = placa(K, '太學', 0.1, { fondo: '#2e4766' }); pl.position.set(0, m(0.7) + m(4.2) - 0.05, 1.95 + m(3) + 0.02); g.add(pl);
  tramo(K, g, -X, 1.95, -0.9, 1.95, m(2.6)); tramo(K, g, 0.9, 1.95, X, 1.95, m(2.6)); tramo(K, g, X, 1.95, X, -Zm, m(3.2)); tramo(K, g, -X, -Zm, -X, 1.95, m(3.2)); tramo(K, g, -X, -Zm, X, -Zm, m(3.2));
  /* las tres salas, de la puerta a la sala grande: la de afuera, la de adentro y la de arriba */
  [['外舍', 1.0, 1.35, 'dos', false], ['內舍', -0.35, 1.05, 'dos', false], ['上舍', -1.6, 0.85, 'xieshan', true]].forEach(([nombre, z, W, tipo, dg]) => {
    const e = edificio(K, { W, D: 0.62, plat: 0.05, pisos: [{ h: 0.4, frente: 'ventanas', bahias: 3, dougong: dg }], tipo, vuelo: 0.12, nu: 6, nv: 3 }); e.position.set(-2.45, 0, z); e.rotation.y = Math.PI / 2; g.add(e);
    const p = placa(K, nombre, 0.075, { fondo: '#2e4766' }); p.position.set(-2.45 + 0.31 + 0.012, 0.05 + 0.33, z); p.rotation.y = Math.PI / 2; g.add(p);
  });
  /* las filas de celdas del examen, con su carácter del Mil Caracteres */
  ['天', '地', '玄', '黃'].forEach((l, k) => { const c = celdas(K, 11, 1.85, l); c.position.set(1.85, 0, -0.05 + k * 0.48); g.add(c); });
  for (let k = 0; k < 5; k++) { const s = new THREE.Group(); pon(s, caja(K, 0.14, 0.05, 0.08, KF.grisD, O(0.0015)), 0, 0.025, 0); pon(s, caja(K, 0.12, 0.3, 0.035, KF.grisL, O(0.0015)), 0, 0.2, 0); pon(s, caja(K, 0.15, 0.03, 0.06, KF.teja, O(0.0015)), 0, 0.365, 0); s.position.set(1.85 + k * 0.22, 0.02, -1.95); g.add(s); }
  [[-1.25, 1.2, 1.25], [-1.35, -0.25, 1.15], [0.55, 1.35, 1.05]].forEach(([x, z, s], i) => { const t = pino(K, s, 40 + i); t.position.set(x, 0.02, z); g.add(t); });
  [[-0.5, 1.0, KF.azulOsc], [0.4, 0.95, KF.azulOsc], [-0.25, -0.15, KF.berm], [1.2, 0.68, KF.azulOsc], [2.1, 1.17, KF.azulOsc], [-1.9, 0.6, '#efe6cf'], [-0.9, 0.3, KF.azulOsc]].forEach(([x, z, c]) => { const p = gente(K, m(1.65), c); p.position.set(x, 0.02, z); g.add(p); });
  g.userData.ficha = { titulo: 'La Universidad Imperial', texto: 'Kaifeng, 1044-1127' };
  return g;
}
export function heroe(K, variante = VARIANTES.heroe) {
  if (variante === 'arcoiris') return escenaRollo(K);
  if (variante === 'taixue') return taixue(K);
  return templeKaibao(K);
}

/* ============================================================
   2 · LA SEGUNDA PIEZA (de 2 a 3 de alto)
   ============================================================ */
/* A · la academia (shuyuan) entre pinos: la portada, la sala de lectura (jiangtang) y el pabellón de los libros (cangshu
   lou) de dos pisos, como en Yuelu y en Yingtian, donde estudió y enseñó Fan Zhongyan */
export function academia(K) {
  const g = new THREE.Group();
  pon(g, K.malla(K.caja(3.0, 0.02, 2.4), matLosas(K, 3, 2.4), { sinTinta: true, sombra: false }), 0.15, 0.01, 0.05);
  const lib = edificio(K, { W: 1.5, D: 0.95, plat: 0.1, pisos: [{ h: 0.68, frente: 'ventanas', bahias: 3 }, { h: 0.56, frente: 'celosia', bahias: 3 }], inset: 0.12, baranda: true, tipo: 'xieshan', vuelo: 0.2 }); lib.position.set(-0.55, 0, -0.75); g.add(lib);
  const sl = edificio(K, { W: 1.9, D: 1.05, plat: 0.08, pisos: [{ h: 0.5, frente: 'abierto', bahias: 3 }], tipo: 'xieshan', vuelo: 0.2 }); sl.position.set(0.55, 0, 0.45); g.add(sl);
  for (let k = 0; k < 3; k++) { const ms = mesa(K, 0.8, false); ms.position.set(0.1 + k * 0.42, 0.08, 0.35); g.add(ms); }
  const pp = placa(K, '書院', 0.1, { fondo: '#2e4766' }); pp.position.set(0.55, 0.08 + 0.48, 0.45 + 0.53); g.add(pp);
  const pt = edificio(K, { W: 0.8, D: 0.45, plat: 0.04, pisos: [{ h: 0.42, frente: 'puertas', bahias: 1, dougong: false }], tipo: 'dos', vuelo: 0.1, nu: 6, nv: 3 }); pt.position.set(-0.9, 0, 1.1); g.add(pt);
  tramo(K, g, -1.35, 1.1, -1.35, -1.15, 0.28); tramo(K, g, -0.5, 1.1, 0.0, 1.1, 0.28);
  [[1.45, -0.6, 1.5, 1], [1.25, -1.15, 1.25, 2], [-1.6, 0.1, 1.35, 3], [0.6, -1.25, 1.1, 4], [-1.7, -1.1, 1.45, 5], [1.7, 0.95, 1.2, 6]].forEach(([x, z, s, k]) => { const t = pino(K, s, 50 + k); t.position.set(x, 0, z); g.add(t); });
  [[0.25, 0.95, KF.azulOsc], [-0.1, 0.25, KF.azulOsc]].forEach(([x, z, c]) => { const p = gente(K, 0.3, c); p.position.set(x, 0.02, z); g.add(p); });
  return g;
}
/* B · la torre del tambor (gulou): el macizo de ladrillo con el paso, y encima el pabellón de dos pisos con el tambor */
export function torreTambor(K) {
  const g = new THREE.Group(), Hb = 1.0;
  g.add(macizoConPaso(K, 2.3, 1.6, Hb, 0.62, 0.44, 0.62));
  for (let x = -1.05; x <= 1.06; x += 0.3) [0.76, -0.76].forEach(z => pon(g, caja(K, 0.14, 0.12, 0.06, KF.gris, O(0.0015)), x, Hb + 0.06, z));
  const t = edificio(K, { W: 1.55, D: 1.05, plat: 0.04, pisos: [{ h: 0.48, frente: 'celosia', bahias: 3 }, { h: 0.4, frente: 'abierto', bahias: 3 }], inset: 0.12, baranda: true, tipo: 'xieshan', vuelo: 0.22, escalones: false }); t.position.y = Hb; g.add(t);
  const yT = t.userData.techo, tb = K.malla(K.cilindro(0.17, 0.17, 0.2, 14), KF.berm, O(0.002)); tb.rotation.x = Math.PI / 2; tb.position.set(0, yT - 0.24, 0.12); g.add(tb);
  [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(0.165, 0.165, 0.012, 14), KF.papel, { sinTinta: true }), 0, yT - 0.24, 0.12 + l * 0.106).rotation.x = Math.PI / 2);
  pon(g, caja(K, 0.3, 0.12, 0.06, KF.maderaD, O(0.0015)), 0, yT - 0.4, 0.12);
  const pl = placa(K, '鼓樓', 0.1, { fondo: '#2e4766' }); pl.position.set(0, Hb + 0.04 + 0.48 + 0.02, 0.52 + 0.02); g.add(pl);
  for (let k = 0; k < 6; k++) pon(g, caja(K, 0.28, r2(0.17 * (k + 1)), 0.17, KF.gris, O(0.0015)), 1.3, 0.085 * (k + 1), 0.6 - k * 0.2);
  [[-0.2, 1.2, '#7a5a3a'], [0.3, 1.0, KF.azulOsc]].forEach(([x, z, c]) => { const p = gente(K, 0.3, c); p.position.set(x, 0, z); g.add(p); });
  const s = sauce(K, 1.2, 9); s.position.set(-1.45, 0, 0.9); g.add(s);
  return g;
}
/* C · la casa de té de dos pisos junto al río: la planta baja abierta con sus mesas, el piso de arriba con la galería, la
   portada de palos y paños, la bandera alta y la terraza sobre pilotes en el agua */
export function casaTe(K) {
  const g = new THREE.Group();
  const e = edificio(K, { W: 1.9, D: 1.3, plat: 0.06, pisos: [{ h: 0.55, frente: 'abierto', bahias: 3, dougong: false }, { h: 0.46, frente: 'celosia', bahias: 3, dougong: false }], inset: 0.0, baranda: true, tipo: 'xieshan', vuelo: 0.24, col: KF.berm, escalones: false }); e.position.set(0, 0, -0.45); g.add(e);
  for (let k = 0; k < 3; k++) { const ms = mesa(K, 0.95); ms.position.set(-0.55 + k * 0.55, 0.06, -0.35); g.add(ms); }
  const pl = placa(K, '茶坊', 0.11, { fondo: '#2e4766' }); pl.position.set(0, 0.06 + 0.55 + 0.03, -0.45 + 0.65 + 0.12); g.add(pl);
  pon(g, caja(K, 2.3, 0.04, 0.7, KF.maderaL, O(0.003)), 0.05, 0.05, 0.6);   // la terraza
  for (let x = -1.05; x <= 1.15; x += 0.44) [0.3, 0.9].forEach(z => pon(g, K.malla(K.cilindro(0.025, 0.025, 0.4, 6), KF.maderaD, O(0.0015)), x, -0.15, z));
  [[0.05, 0.95, 2.3, 0], [1.2, 0.6, 0.7, Math.PI / 2], [-1.1, 0.6, 0.7, Math.PI / 2]].forEach(([x, z, L, ry]) => { const b = new THREE.Mesh(propia(new THREE.PlaneGeometry(L, 0.08)), matBaranda(K, L)); b.position.set(x, 0.11, z); b.rotation.y = ry; g.add(b); });
  for (let k = 0; k < 2; k++) { const ms = mesa(K, 0.85); ms.position.set(-0.55 + k * 0.85, 0.07, 0.6); g.add(ms); }
  const hm = huanmen(K, 0.95); hm.position.set(1.18, 0, -0.45); hm.rotation.y = Math.PI / 2; g.add(hm);
  const b = bandera(K, '茶　', 2.55); b.position.set(1.25, 0, 0.3); b.rotation.y = -0.4; g.add(b);
  const bt = barca(K, { L: 1.0, mastil: null, remeros: 1, carga: null }); bt.position.set(-0.3, -0.03, 1.35); g.add(bt);
  [[-0.5, 0.75, KF.azulOsc], [0.5, 0.7, '#efe6cf'], [1.45, -0.1, '#7a5a3a'], [0.2, -0.3, KF.azulOsc]].forEach(([x, z, c]) => { const p = gente(K, 0.3, c); p.position.set(x, z > 0.2 ? 0.07 : 0.06, z); g.add(p); });
  const s = sauce(K, 1.35, 4); s.position.set(-1.55, 0, -0.1); g.add(s);
  return g;
}
export function segunda(K, variante = VARIANTES.segunda) {
  if (variante === 'academia') return academia(K);
  if (variante === 'tambor') return torreTambor(K);
  return casaTe(K);
}

/* ============================================================
   3 · LAS CASAS
   ============================================================ */
/* A · las tiendas de la calle del rollo (los letreros son los que se leen en él) */
export function calleRollo(K) {
  const g = new THREE.Group();
  const a = tienda(K, { W: 1.05, D: 0.75, h: 0.46, h2: 0.36, letrero: '劉家沉檀', vertical: true, toldo: false, cosas: [['tinaja', -0.42, 0.55]] }); a.position.set(-1.25, 0, -0.75); g.add(a);
  const b = tienda(K, { W: 1.0, D: 0.72, h: 0.5, letrero: '趙太丞家', vertical: true, toldo: true, cosas: [['cestos', 0.25, 0.62]] }); b.position.set(0.2, 0, -0.85); g.add(b);
  const c = tienda(K, { W: 0.95, D: 0.7, h: 0.48, h2: 0.34, bandera: '新酒', huan: true, tono: 'gris' }); c.position.set(1.55, 0, -0.25); c.rotation.y = -Math.PI / 2 + 0.0; g.add(c);
  const d = tienda(K, { W: 0.85, D: 0.62, h: 0.4, tono: 'paja', toldo: true, cosas: [['mesa', 0.0, 0.75]] }); d.position.set(-1.45, 0, 0.75); g.add(d);
  const e = tienda(K, { W: 0.8, D: 0.6, h: 0.42, letrero: '王員外家', vertical: false, sombrillas: 1 }); e.position.set(0.05, 0, 0.7); g.add(e);
  const cr = carretilla(K); cr.position.set(0.85, 0, 0.55); cr.rotation.y = 0.5; g.add(cr);
  const sm = sombrilla(K, 1.1); sm.position.set(-0.6, 0, 0.05); g.add(sm); const ms = mesa(K, 0.9, false); ms.position.set(-0.45, 0, 0.12); g.add(ms);
  return g;
}
/* B · las casas de patio (siheyuan) de los letrados: el muro, la portada en la esquina del sudeste, la sala del fondo y las
   alas; la grande con la planta en «工» de las casas Song (dos salas unidas por un corredor) y el ciruelo en flor */
export function casasPatio(K) {
  const g = new THREE.Group(), hm = 0.3;
  const c1 = new THREE.Group(); c1.position.set(-0.75, 0, -0.35); g.add(c1);
  const fw = 1.25, fd = 1.0;
  const back = edificio(K, { W: 1.2, D: 0.5, plat: 0.05, pisos: [{ h: 0.42, frente: 'ventanas', bahias: 3, dougong: false }], tipo: 'xieshan', vuelo: 0.12, nu: 6, nv: 3 }); back.position.set(0, 0, -0.62); c1.add(back);
  const cor = edificio(K, { W: 0.26, D: 0.4, plat: 0.04, pisos: [{ h: 0.34, frente: 'abierto', bahias: 1, dougong: false }], tipo: 'dos', vuelo: 0.06, escalones: false, nu: 4, nv: 2 }); cor.position.set(0, 0, -0.2); cor.rotation.y = Math.PI / 2; c1.add(cor);
  const fr = edificio(K, { W: 1.1, D: 0.45, plat: 0.05, pisos: [{ h: 0.4, frente: 'celosia', bahias: 3, dougong: false }], tipo: 'dos', vuelo: 0.12, nu: 6, nv: 3 }); fr.position.set(0, 0, 0.18); c1.add(fr);
  [-1, 1].forEach(l => { const w = edificio(K, { W: 0.7, D: 0.36, plat: 0.03, pisos: [{ h: 0.34, frente: 'ventanas', bahias: 3, dougong: false }], tipo: 'dos', vuelo: 0.08, nu: 5, nv: 2 }); w.position.set(l * 0.98, 0, -0.2); w.rotation.y = -l * Math.PI / 2; c1.add(w); });
  tramo(K, c1, -fw, fd, 0.75, fd, hm); tramo(K, c1, fw, -fd, fw, fd, hm); tramo(K, c1, -fw, -fd, -fw, fd, hm); tramo(K, c1, -fw, -fd, fw, -fd, hm);
  const pt = edificio(K, { W: 0.42, D: 0.3, plat: 0.03, pisos: [{ h: 0.36, frente: 'puertas', bahias: 1, dougong: false }], tipo: 'dos', vuelo: 0.07, escalones: false, nu: 4, nv: 2 }); pt.position.set(1.0, 0, fd); c1.add(pt);
  const ci = ciruelo(K, 1.1); ci.position.set(0.55, 0, 0.62); c1.add(ci);
  const c2 = new THREE.Group(); c2.position.set(1.35, 0, 0.45); g.add(c2);
  const m2 = edificio(K, { W: 0.95, D: 0.48, plat: 0.04, pisos: [{ h: 0.4, frente: 'ventanas', bahias: 3, dougong: false }], tipo: 'dos', vuelo: 0.1, nu: 6, nv: 3 }); m2.position.set(0, 0, -0.35); c2.add(m2);
  const s2 = edificio(K, { W: 0.55, D: 0.34, plat: 0.03, pisos: [{ h: 0.32, frente: 'ventanas', bahias: 2, dougong: false }], tipo: 'dos', vuelo: 0.07, nu: 5, nv: 2 }); s2.position.set(-0.42, 0, 0.12); s2.rotation.y = Math.PI / 2; c2.add(s2);
  tramo(K, c2, -0.65, 0.62, 0.25, 0.62, hm); tramo(K, c2, 0.65, -0.68, 0.65, 0.62, hm); tramo(K, c2, -0.65, -0.68, -0.65, 0.62, hm); tramo(K, c2, -0.65, -0.68, 0.65, -0.68, hm);
  const p2 = edificio(K, { W: 0.36, D: 0.26, plat: 0.03, pisos: [{ h: 0.34, frente: 'puertas', bahias: 1, dougong: false }], tipo: 'dos', vuelo: 0.06, escalones: false, nu: 4, nv: 2 }); p2.position.set(0.45, 0, 0.62); c2.add(p2);
  const bb = bambu(K, 1.0, 3); bb.position.set(0.3, 0, 0.15); c2.add(bb);
  const sl = new THREE.Group(); pon(sl, caja(K, 0.22, 0.24, 0.2, KF.berm, O(0.0015)), 0, 0.2, 0); pon(sl, caja(K, 0.26, 0.04, 0.24, KF.bermD, O(0.0015)), 0, 0.34, 0); [-1, 1].forEach(l => sl.add(viga(K, [l * 0.07, 0.15, -0.35], [l * 0.07, 0.15, 0.35], 0.018, 0.018, KF.maderaD, 0.001))); sl.position.set(1.95, 0, 1.3); sl.rotation.y = 0.3; g.add(sl);   // la silla de manos
  const tj = tinaja(K, 1.3, '#7d8a8f'); tj.position.set(0.15, 0, 0.85); g.add(tj);
  const s = sauce(K, 1.25, 7); s.position.set(-1.95, 0, 1.0); g.add(s);
  return g;
}
/* C · el barrio del río: los almacenes (tafang) de los granos que llegaban por el Bian, el muelle de tablas, los sacos y
   la barca amarrada */
export function barrioRio(K) {
  const g = new THREE.Group();
  const a1 = edificio(K, { W: 1.8, D: 0.8, plat: 0.05, pisos: [{ h: 0.5, frente: 'puertas', bahias: 5, dougong: false, pared: KF.calD }], tipo: 'dos', col: KF.madera, vuelo: 0.1, nu: 7, nv: 3 }); a1.position.set(-0.85, 0, -0.75); g.add(a1);
  const a2 = edificio(K, { W: 1.15, D: 0.8, plat: 0.05, pisos: [{ h: 0.48, frente: 'puertas', bahias: 3, dougong: false, pared: KF.calD }, { h: 0.32, frente: 'ventanas', bahias: 3, dougong: false }], inset: 0.0, tipo: 'dos', col: KF.madera, vuelo: 0.1, nu: 6, nv: 3 }); a2.position.set(1.2, 0, -0.85); g.add(a2);
  g.add(viga(K, [1.2, 0.95, -0.45], [1.2, 0.95, -0.1], 0.04, 0.04, KF.maderaD, 0.0015)); g.add(viga(K, [1.2, 0.95, -0.12], [1.2, 0.35, -0.12], 0.004, 0.004, '#5a4636', 0));
  const sh = new THREE.Group(); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => sh.add(viga(K, [a * 0.32, 0, b * 0.25], [a * 0.32, 0.42, b * 0.25], 0.03, 0.03, KF.maderaD, 0.0015)));
  const ts = techo(K, 0.85, 0.7, 0.2, { tipo: 'dos', tono: 'paja', nu: 4, nv: 2 }); ts.position.y = 0.42; sh.add(ts); sh.position.set(1.55, 0, 0.1); g.add(sh);
  const hu = edificio(K, { W: 0.7, D: 0.55, plat: 0.03, pisos: [{ h: 0.36, frente: 'ventanas', bahias: 1, dougong: false, pared: KF.calD }], tipo: 'dos', tono: 'paja', col: KF.madera, vuelo: 0.08, nu: 5, nv: 2, escalones: false }); hu.position.set(-1.85, 0, 0.05); g.add(hu);
  pon(g, caja(K, 0.5, 0.03, 1.1, KF.maderaL, O(0.002)), -0.25, 0.02, 0.95);   // el muelle
  for (let z = 0.55; z <= 1.45; z += 0.3) [-0.47, -0.03].forEach(x => pon(g, K.malla(K.cilindro(0.02, 0.02, 0.36, 6), KF.maderaD, O(0.0015)), x, -0.13, z));
  const ba = barca(K, { L: 1.45, mastil: 'alto', remeros: 1, carga: 'grano' }); ba.position.set(0.78, -0.03, 1.15); ba.rotation.y = Math.PI; g.add(ba);
  [[-0.35, 0.05], [0.3, 0.15], [0.75, -0.25]].forEach(([x, z], k) => { const s = sacos(K, 5, 1.2); s.position.set(x, 0, z); s.rotation.y = k * 0.7; g.add(s); });
  const cr = carretilla(K); cr.position.set(-0.9, 0, 0.3); cr.rotation.y = -0.6; g.add(cr);
  const cs = cestos(K, 1.2); cs.position.set(-0.15, 0.035, 0.75); g.add(cs);
  const s = sauce(K, 1.3, 2); s.position.set(-1.9, 0, -0.75); g.add(s);
  return g;
}
export function barrio(K, variante = VARIANTES.casas) {
  if (variante === 'patios') return casasPatio(K);
  if (variante === 'rio') return barrioRio(K);
  return calleRollo(K);
}
