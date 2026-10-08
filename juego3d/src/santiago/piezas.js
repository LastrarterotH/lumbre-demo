/* ============================================================
   santiago/piezas
   Los seis saberes de Santiago en 3D, cada uno con sus etapas (la máxima del proyecto: subir de nivel se VE, con piezas
   nuevas; se audita por diff de píxeles en juego3d/qa.html): la escuela lancasteriana (69), la Escuela Normal (70), el
   silabario (71), la Escuela de Preceptoras (72), la ley (73) y el kindergarten (74). Más la gente de la época (los niños de
   la escuela, los preceptores de levita, las preceptoras, Bello y Sarmiento) y los faroles de la noche.
   Cada pieza devuelve { obj, anim, ancla, toc, actores } como las de las otras épocas (src/piezas.js).
   ============================================================ */
import * as THREE from 'three';
import { pieza, actor, texturaCanvas } from '../piezas.js';
import * as L from './lugares.js';
import { SA, casa } from './monumentos.js';

const ubic = (m, x, y, z, rx = 0, ry = 0, rz = 0) => { m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx, ry, rz); return m; };
const caja = (K, w, h, d, color, o) => K.malla(K.caja(w, h, d), color, o);
const en = (P, obj, x, y, h = 0, ry = 0) => { obj.position.copy(P.en(x, y)); obj.position.y += h; obj.rotation.y = ry; P.obj.add(obj); return obj; };
const plano = (K, tex, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), K.matMapa(tex)); m.geometry.userData.propia = true; m.castShadow = true; return m; };
const patas = (K, g, w, d, h, color = SA.maderaD) => [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(ubic(caja(K, 0.018, h, 0.018, color, { sinTinta: true }), a * (w / 2 - 0.015), h / 2, b * (d / 2 - 0.015))));

export const ANCLAS = {
  lancaster: { x: L.LANCASTER.x, y: L.LANCASTER.y }, normal: { x: L.NORMAL.x, y: L.NORMAL.y }, silabario: { x: L.SILABARIO.x, y: L.SILABARIO.y },
  preceptoras: { x: L.PRECEPTORAS.x, y: L.PRECEPTORAS.y }, ley: { x: L.CONGRESO.x, y: L.CONGRESO.y }, kinder: { x: L.KINDER.x, y: L.KINDER.y },
};

/* LA GENTE DE SANTIAGO. Los niños de la escuela: chaqueta corta, pantalón y alpargatas; las niñas con su vestido largo y el
   pelo en trenzas. Los preceptores, de levita negra y corbatín; las preceptoras, de negro con el cuello blanco. */
export function nino(i, extra = {}) {
  const chica = i % 2 === 1;
  return { edad: 'nino', piel: [1, 2, 1, 3, 2][i % 5], pelo: chica ? 'trenza' : 'corto', colorPelo: ['#2a1f18', '#3a2a1e', '#1e1610', '#4a3424', '#2a1f18'][i % 5],
    ropa: chica ? 'tunica' : 'corta', colorRopa: chica ? ['#7a3a4a', '#3f5a7a', '#8a6a3a', '#5a4a6a'][i % 4] : ['#5a4a3a', '#3f4f6a', '#6a5a42', '#4a5a4a'][i % 4], orla: '#2e2a24',
    chal: chica ? '#efe6d2' : undefined, sinFlecos: true, ...extra };
}
export const PRECEPTOR = { piel: 1, pelo: 'corto', colorPelo: '#2a1f18', barba: undefined, ropa: 'tunica', colorRopa: '#26221e', orla: '#1a1714', chal: '#f4f0e6', sinFlecos: true };
export const PRECEPTORA = { piel: 1, pelo: 'moño', colorPelo: '#2a1f18', ropa: 'tunica', colorRopa: '#2a2630', orla: '#1a1714', chal: '#f4f0e6', sinFlecos: true };
export const BELLO = { piel: 0, pelo: 'corto', colorPelo: '#bab4aa', ropa: 'tunica', colorRopa: '#2a2a30', orla: '#1a1a1e', chal: '#f4f0e6', edad: 'anciana', sinFlecos: true };
export const SARMIENTO = { piel: 1, pelo: 'corto', colorPelo: '#3a2a1e', barba: undefined, ropa: 'tunica', colorRopa: '#3a2a22', orla: '#26201a', chal: '#8a3a2a', sinFlecos: true };
export const ARRIERO = { piel: 2, pelo: 'corto', colorPelo: '#2a1f18', ropa: 'corta', colorRopa: '#8a6a42', orla: '#5a4a32', chal: '#a8352f', sinFlecos: true };

/* ---------- utensilios ---------- */
export function farol(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  g.add(ubic(K.malla(K.cilindro(0.012, 0.016, 0.44, 5), SA.negro, { sinTinta: true }), 0, 0.22, 0));
  g.add(ubic(caja(K, 0.07, 0.08, 0.07, '#3a3632', { grosor: 0.002 }), 0, 0.48, 0));
  const llama = new THREE.Group(); llama.position.y = 0.48; g.add(llama); g.userData.llama = llama;
  llama.add(ubic(K.malla(K.esfera(0.026, 0.4), '#ffd27a', { sinTinta: true, sombra: false, emissive: '#ffb04a', emissiveIntensity: 1.2 }), 0, 0, 0));
  return g;
}
function banco(K, l = 0.5) { const g = new THREE.Group(); g.add(ubic(caja(K, l, 0.025, 0.09, SA.madera, { grosor: 0.002 }), 0, 0.08, 0)); [-1, 1].forEach(s => g.add(ubic(caja(K, 0.025, 0.08, 0.08, SA.maderaD, { sinTinta: true }), s * (l / 2 - 0.04), 0.04, 0))); return g; }
function mesa(K, w, d, h = 0.22) { const g = new THREE.Group(); g.add(ubic(caja(K, w, 0.02, d, SA.madera, { grosor: 0.002 }), 0, h, 0)); patas(K, g, w, d, h); return g; }
function pizarron(K, w, texto = 'ma me mi mo mu') {
  const g = new THREE.Group();
  const tx = texturaCanvas(96, 48, (c, W, H) => { c.fillStyle = '#2e3a32'; c.fillRect(0, 0, W, H); c.fillStyle = '#eef0ea'; c.font = 'bold 13px Georgia'; c.textAlign = 'center'; c.fillText(texto, W / 2, 20); c.font = '10px Georgia'; c.fillText('pa pe pi po pu', W / 2, 38); });
  const p = plano(K, tx, w, w / 2); p.position.y = 0.32; g.add(p);
  g.add(ubic(caja(K, w + 0.02, w / 2 + 0.02, 0.012, SA.madera, { grosor: 0.002 }), 0, 0.32, -0.008));
  [-1, 1].forEach(l => g.add(ubic(caja(K, 0.016, 0.34, 0.016, SA.maderaD, { sinTinta: true }), l * w * 0.42, 0.17, -0.02, 0, 0, l * 0.06)));
  return g;
}
function semicirculo(K) { const m = K.malla(K.toro(0.18, 0.01, Math.PI, 0.5), '#f4f0e6', { sinTinta: true, sombra: false }); m.rotation.x = -Math.PI / 2; m.position.y = 0.006; return m; }

/* ---------- 69 · LA ESCUELA LANCASTERIANA: un maestro, cien niños ---------- */
/* 0: el salón largo, el maestro en su tarima y el primer grupo de pie en su semicírculo con su monitor · 1: el segundo grupo
   con su monitor · 2: las cajas de arena donde se escribe con el dedo · 3: el telégrafo, los carteles en lo alto que dicen
   qué grupo es, y el tercer grupo */
export function lancaster(K, n) {
  const P = pieza(ANCLAS.lancaster), A = ANCLAS.lancaster;
  const sa = new THREE.Group(); en(P, sa, A.x, A.y - 0.3);
  sa.add(ubic(caja(K, 0.86, 0.32, 0.22, SA.adobe, { grosor: 0.004 }), 0, 0.16, -0.08));
  const s = new THREE.Shape(); s.moveTo(-0.45, 0); s.lineTo(0.45, 0); s.lineTo(0, 0.14); s.closePath();
  const tg = new THREE.ExtrudeGeometry(s, { depth: 0.28, bevelEnabled: false }); tg.userData.propia = true; tg.translate(0, 0, -0.14);
  sa.add(ubic(K.malla(tg, SA.teja, { grosor: 0.003 }), 0, 0.32, -0.08));
  sa.add(ubic(caja(K, 0.22, 0.06, 0.12, SA.madera, { grosor: 0.002 }), 0, 0.03, 0.1));   // la tarima del maestro
  const ma = actor(P, K, { ...PRECEPTOR, oficio: true, k: 'maestroLanc' }, 'narrar', A.x, A.y - 0.2, { x: A.x, y: A.y + 0.6 }, { asiento: 0.06 });
  const grupo = (gx, gz, i0, mon) => { en(P, semicirculo(K), gx, gz); actor(P, K, { ...nino(i0), edad: undefined, oficio: true, k: 'monitor' + mon }, 'narrar', gx, gz - 0.16, { x: gx, y: gz + 0.3 });
    [-0.12, 0, 0.12].forEach((dx, k) => actor(P, K, { ...nino(i0 + k + 1), oficio: true, k: 'grupo' + mon + k }, 'quieto', gx + dx, gz + 0.12, { x: gx, y: gz - 0.16 })); };
  grupo(A.x - 0.25, A.y + 0.15, 0, 0);
  if (n >= 1) grupo(A.x + 0.25, A.y + 0.15, 4, 1);
  if (n >= 2) { const ca = new THREE.Group(); en(P, ca, A.x - 0.52, A.y + 0.05); for (let k = 0; k < 3; k++) { ca.add(ubic(caja(K, 0.16, 0.03, 0.1, SA.maderaD, { grosor: 0.002 }), 0, 0.18, -0.14 + k * 0.14)); ca.add(ubic(caja(K, 0.14, 0.01, 0.08, '#e8d8b0', { sinTinta: true }), 0, 0.196, -0.14 + k * 0.14)); } patas(K, ca, 0.16, 0.38, 0.17); }   // las cajas de arena
  if (n >= 3) { grupo(A.x, A.y + 0.5, 8, 2); [-0.25, 0.25, 0].forEach((dx, k) => { const t = new THREE.Group(); en(P, t, A.x + dx + 0.12, A.y + 0.1 + (k === 2 ? 0.35 : 0)); t.add(ubic(K.malla(K.cilindro(0.006, 0.006, 0.42, 4), SA.maderaD, { sinTinta: true }), 0, 0.21, 0)); t.add(ubic(caja(K, 0.08, 0.06, 0.006, ['#b8352f', '#2f4f8a', '#d4a93e'][k], { grosor: 0.0012 }), 0.04, 0.4, 0)); }); }   // el telégrafo
  P.toc = [{ x: A.x, y: A.y, k: 'lancasteriana', p: ma }];
  return P;
}

/* ---------- 70 · LA ESCUELA NORMAL: donde se forman los preceptores ---------- */
/* 0: el edificio de dos pisos con su portón y el director · 1: la escuela anexa, donde practican con niños · 2: los
   normalistas que salen con su maleta, junto a la carreta · 3: el internado, el ala de los dormitorios y la biblioteca */
export function normal(K, n) {
  const P = pieza(ANCLAS.normal), A = ANCLAS.normal;
  const ed = new THREE.Group(); en(P, ed, A.x, A.y - 0.3);
  ed.add(ubic(caja(K, 0.7, 0.44, 0.3, SA.estuco, { grosor: 0.004 }), 0, 0.22, 0));
  for (let p2 = 0; p2 < 2; p2++) for (let k = 0; k < 4; k++) ed.add(ubic(caja(K, 0.06, 0.09, 0.006, '#3a4048', { sinTinta: true }), -0.24 + k * 0.16, 0.12 + p2 * 0.2, 0.153));
  ed.add(ubic(caja(K, 0.12, 0.18, 0.008, SA.maderaD, { sinTinta: true }), 0, 0.09, 0.154));
  const t = new THREE.Group(); ed.add(t); t.position.y = 0.44;
  const geo = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1); geo.rotateY(Math.PI / 4); geo.userData.propia = true; const tc = K.malla(geo, SA.teja, { grosor: 0.003 }); tc.scale.set(0.76, 0.12, 0.36); tc.position.y = 0.06; t.add(tc);
  ed.add(ubic(caja(K, 0.3, 0.04, 0.006, '#26221e', { sinTinta: true }), 0, 0.38, 0.155));   // el letrero
  const di = actor(P, K, { ...SARMIENTO, chal: '#f4f0e6', oficio: true, k: 'director' }, 'narrar', A.x + 0.15, A.y - 0.05, { x: A.x, y: A.y + 0.6 });
  if (n >= 1) {
    const an = new THREE.Group(); en(P, an, A.x - 0.48, A.y + 0.18, 0, Math.PI / 2);
    an.add(ubic(caja(K, 0.36, 0.24, 0.2, SA.adobe, { grosor: 0.003 }), 0, 0.12, 0)); const ta = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1); ta.rotateY(Math.PI / 4); ta.userData.propia = true; const tt = K.malla(ta, SA.teja, { grosor: 0.002 }); tt.scale.set(0.4, 0.1, 0.24); tt.position.y = 0.29; an.add(tt);
    actor(P, K, { ...nino(3), oficio: true, k: 'anexo0' }, 'leer', A.x - 0.3, A.y + 0.3, { x: A.x - 0.1, y: A.y + 0.25 }, { asiento: 0.06 });
    actor(P, K, { ...PRECEPTOR, colorPelo: '#3a2a1e', oficio: true, k: 'practicante' }, 'narrar', A.x - 0.1, A.y + 0.25, { x: A.x - 0.3, y: A.y + 0.3 });
  }
  if (n >= 2) {
    [[0.35, 0.3], [0.5, 0.15]].forEach(([dx, dz], i) => { actor(P, K, { ...PRECEPTOR, colorPelo: ['#2a1f18', '#4a3424'][i], oficio: true, k: 'normalista' + i }, 'quieto', A.x + dx, A.y + dz, { x: A.x + 0.8, y: A.y + 0.6 });
      en(P, caja(K, 0.08, 0.06, 0.04, '#5a3a24', { grosor: 0.0015 }), A.x + dx + 0.07, A.y + dz + 0.03, 0.03); });   // las maletas
  }
  if (n >= 3) {
    const al = new THREE.Group(); en(P, al, A.x + 0.1, A.y - 0.62);
    al.add(ubic(caja(K, 0.8, 0.3, 0.16, SA.estucoD, { grosor: 0.003 }), 0, 0.15, 0));
    for (let k = 0; k < 6; k++) al.add(ubic(caja(K, 0.04, 0.06, 0.006, '#3a4048', { sinTinta: true }), -0.3 + k * 0.12, 0.2, 0.083));
    const ta = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1); ta.rotateY(Math.PI / 4); ta.userData.propia = true; const tt = K.malla(ta, SA.tejaD, { grosor: 0.002 }); tt.scale.set(0.84, 0.1, 0.2); tt.position.y = 0.35; al.add(tt);
  }
  P.toc = [{ x: A.x, y: A.y, k: 'normal', p: di }];
  return P;
}

/* ---------- 71 · EL SILABARIO: la escuela del barrio ---------- */
/* 0: la sala con su corredor, el pizarrón de las sílabas y la preceptora · 1: los niños con sus pizarras en los bancos · 2:
   el estante con los libros de lectura · 3: el mapa de Chile en la pared del corredor */
export function silabario(K, n) {
  const P = pieza(ANCLAS.silabario), A = ANCLAS.silabario;
  const sa = casa(K, 0.8, 0.3, 0.3, { zaguan: true }); en(P, sa, A.x, A.y - 0.32);
  en(P, pizarron(K, 0.3), A.x - 0.2, A.y - 0.02);
  const pr = actor(P, K, { ...PRECEPTORA, oficio: true, k: 'preceptoraSil' }, 'narrar', A.x - 0.38, A.y + 0.05, { x: A.x + 0.2, y: A.y + 0.4 });
  if (n >= 1) [[0.0, 0.32], [0.3, 0.32]].forEach(([dx, dz], i) => { en(P, banco(K, 0.26), A.x + dx, A.y + dz); actor(P, K, { ...nino(i + 2), oficio: true, k: 'pizarra' + i }, 'leer', A.x + dx, A.y + dz, { x: A.x - 0.2, y: A.y - 0.02 }, { asiento: 0.08 }); });
  if (n >= 2) { const es = new THREE.Group(); en(P, es, A.x + 0.45, A.y - 0.05, 0, -0.4); es.add(ubic(caja(K, 0.22, 0.34, 0.08, SA.maderaD, { grosor: 0.002 }), 0, 0.17, 0)); for (let f = 0; f < 3; f++) for (let k = 0; k < 4; k++) es.add(ubic(caja(K, 0.035, 0.08, 0.06, ['#7a3a2a', '#3f4f6a', '#5a4630', '#4a5a3a'][(k + f) % 4], { grosor: 0.001 }), -0.07 + k * 0.045, 0.07 + f * 0.1, 0.012)); }
  if (n >= 3) {
    const tx = texturaCanvas(24, 96, (c, W, H) => { c.fillStyle = '#efe4c8'; c.fillRect(0, 0, W, H); c.fillStyle = '#8ab0c8'; c.fillRect(0, 0, 8, H); c.fillStyle = '#b8a070'; c.beginPath(); c.moveTo(9, 2); c.lineTo(15, 2); c.lineTo(14, 40); c.lineTo(13, 70); c.lineTo(10, 94); c.lineTo(9, 60); c.closePath(); c.fill(); c.fillStyle = '#a8261e'; c.beginPath(); c.arc(12, 44, 1.6, 0, 7); c.fill(); });
    const ma = plano(K, tx, 0.1, 0.4); ma.position.set(0, 0.24, 0.002); const mm = new THREE.Group(); mm.add(ma); en(P, mm, A.x + 0.18, A.y - 0.165);   // el mapa de Chile, largo y angosto
  }
  P.toc = [{ x: A.x, y: A.y, k: 'silabarioSa', p: pr }];
  return P;
}

/* ---------- 72 · LA ESCUELA DE PRECEPTORAS ---------- */
/* 0: la casa con su espadaña y la directora · 1: las preceptoras con las niñas en los bancos · 2: la mesa de las labores ·
   3: el patio con la pila y el limonero */
export function preceptoras(K, n) {
  const P = pieza(ANCLAS.preceptoras), A = ANCLAS.preceptoras;
  const ca = casa(K, 0.8, 0.32, 0.34, { zaguan: true, tono: 1 }); en(P, ca, A.x, A.y - 0.32);
  const es = new THREE.Group(); en(P, es, A.x + 0.3, A.y - 0.32); es.add(ubic(caja(K, 0.1, 0.18, 0.04, SA.adobe, { grosor: 0.002 }), 0, 0.52, 0)); es.add(ubic(K.malla(K.esfera(0.025, 0.4), '#a87a3a', { sinTinta: true }), 0, 0.5, 0.025));   // la espadaña con su campana
  const di = actor(P, K, { ...PRECEPTORA, colorRopa: '#1e1c22', oficio: true, k: 'directora' }, 'narrar', A.x - 0.2, A.y + 0.02, { x: A.x + 0.2, y: A.y + 0.5 });
  if (n >= 1) { en(P, banco(K, 0.4), A.x + 0.15, A.y + 0.28); [1, 3].forEach((k, i) => actor(P, K, { ...nino(k), oficio: true, k: 'nina' + i }, 'leer', A.x + 0.05 + i * 0.2, A.y + 0.28, { x: A.x - 0.2, y: A.y + 0.02 }, { asiento: 0.08 })); actor(P, K, { ...PRECEPTORA, colorPelo: '#3a2a1e', oficio: true, k: 'preceptora1' }, 'quieto', A.x + 0.45, A.y + 0.1, { x: A.x + 0.15, y: A.y + 0.28 }); }
  if (n >= 2) { const me = mesa(K, 0.24, 0.16); en(P, me, A.x - 0.45, A.y + 0.35); me.add(ubic(caja(K, 0.1, 0.012, 0.08, '#f4f0e6', { sinTinta: true }), 0, 0.235, 0)); me.add(ubic(K.malla(K.esfera(0.02, 0.4), SA.rojo, { sinTinta: true }), 0.07, 0.24, 0.03)); }   // las labores
  if (n >= 3) { const pi = new THREE.Group(); en(P, pi, A.x + 0.0, A.y + 0.62); pi.add(ubic(K.malla(K.cilindro(0.1, 0.12, 0.08, 10), SA.adobeD, { grosor: 0.002 }), 0, 0.04, 0)); pi.add(ubic(K.malla(K.cilindro(0.08, 0.08, 0.01, 10), '#7aa8c0', { sinTinta: true }), 0, 0.082, 0));
    const li = new THREE.Group(); en(P, li, A.x + 0.4, A.y + 0.6); li.add(ubic(K.malla(K.cilindro(0.012, 0.016, 0.22, 5), '#6a5236', { grosor: 0.002 }), 0, 0.11, 0)); li.add(ubic(K.malla(K.esfera(0.11, 0.5), '#4f7a3a', { grosor: 0.003 }), 0, 0.3, 0)); for (let k = 0; k < 4; k++) li.add(ubic(K.malla(K.esfera(0.015, 0.3), '#f2d23a', { sinTinta: true }), Math.cos(k * 1.6) * 0.09, 0.28 + (k % 2) * 0.04, Math.sin(k * 1.6) * 0.09)); }   // la pila y el limonero
  P.toc = [{ x: A.x, y: A.y, k: 'preceptorasSa', p: di }];
  return P;
}

/* ---------- 73 · LA LEY: el Congreso ---------- */
/* 0: el edificio del Congreso con su pórtico · 1: los diputados de levita que discuten · 2: la mesa con la urna de los
   votos · 3: el bando de la ley pegado en su tablero, y los vecinos que lo leen */
export function ley(K, n) {
  const P = pieza(ANCLAS.ley), A = ANCLAS.ley;
  const co = new THREE.Group(); en(P, co, A.x, A.y - 0.32);
  co.add(ubic(caja(K, 0.76, 0.36, 0.3, SA.estuco, { grosor: 0.004 }), 0, 0.18, 0));
  [-0.18, -0.06, 0.06, 0.18].forEach(x => co.add(ubic(K.malla(K.cilindro(0.02, 0.022, 0.36, 8), SA.estucoD, { grosor: 0.002 }), x, 0.18, 0.18)));
  const s = new THREE.Shape(); s.moveTo(-0.26, 0); s.lineTo(0.26, 0); s.lineTo(0, 0.1); s.closePath();
  co.add(ubic(K.malla(new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false }), SA.estucoD, { grosor: 0.002 }), 0, 0.36, 0.14));
  co.children[co.children.length - 1].geometry.userData.propia = true;
  co.add(ubic(caja(K, 0.78, 0.03, 0.32, SA.estucoD, { grosor: 0.002 }), 0, 0.375, 0));
  const pre = actor(P, K, { ...PRECEPTOR, colorPelo: '#8a8070', oficio: true, k: 'presidenteCamara' }, 'narrar', A.x, A.y - 0.02, { x: A.x, y: A.y + 0.6 });
  if (n >= 1) [[-0.32, 0.25], [0.32, 0.25]].forEach(([dx, dz], i) => actor(P, K, { ...PRECEPTOR, colorPelo: ['#3a2a1e', '#6a5a4a'][i], oficio: true, k: 'diputado' + i }, 'narrar', A.x + dx, A.y + dz, { x: A.x - dx, y: A.y + dz }));
  if (n >= 2) { const me = mesa(K, 0.26, 0.16); en(P, me, A.x, A.y + 0.3); me.add(ubic(caja(K, 0.08, 0.08, 0.06, SA.maderaD, { grosor: 0.0015 }), 0, 0.26, 0)); me.add(ubic(caja(K, 0.03, 0.004, 0.01, '#1e1a16', { sinTinta: true }), 0, 0.302, 0)); }   // la urna
  if (n >= 3) {
    const ba = new THREE.Group(); en(P, ba, A.x - 0.5, A.y + 0.5);
    ba.add(ubic(caja(K, 0.22, 0.28, 0.02, SA.madera, { grosor: 0.002 }), 0, 0.3, 0));
    const tx = texturaCanvas(48, 64, (c, W, H) => { c.fillStyle = '#f4efe0'; c.fillRect(0, 0, W, H); c.fillStyle = '#1e1a16'; c.font = 'bold 8px Georgia'; c.textAlign = 'center'; c.fillText('LEI', W / 2, 12); c.fillStyle = '#4a443a'; for (let y = 18; y < H - 4; y += 4) c.fillRect(6, y, W - 12, 1.2); });
    const pl = plano(K, tx, 0.18, 0.24); pl.position.set(0, 0.3, 0.012); ba.add(pl);
    [0, 1].forEach(i => actor(P, K, { ...nino(i + 5), edad: undefined, oficio: true, k: 'vecino' + i }, 'leer', A.x - 0.6 + i * 0.22, A.y + 0.75, { x: A.x - 0.5, y: A.y + 0.5 }));
  }
  P.toc = [{ x: A.x, y: A.y, k: 'congreso', p: pre }];
  return P;
}

/* ---------- 74 · EL KINDERGARTEN: el jardín de infantes ---------- */
/* 0: el pabellón, la kindergartnerin y la mesa con los dones (la esfera, el cubo, el cilindro) · 1: la ronda de los niños ·
   2: los canteros del jardín, uno para cada niño · 3: la pérgola con las flores */
export function kinder(K, n) {
  const P = pieza(ANCLAS.kinder), A = ANCLAS.kinder;
  const pa = casa(K, 0.6, 0.28, 0.28, { zaguan: true }); en(P, pa, A.x, A.y - 0.34);
  const me = mesa(K, 0.24, 0.16, 0.16); en(P, me, A.x - 0.32, A.y + 0.02);
  me.add(ubic(K.malla(K.esfera(0.025, 0.5), SA.rojo, { grosor: 0.0015 }), -0.07, 0.185, 0)); me.add(ubic(caja(K, 0.04, 0.04, 0.04, SA.azul, { grosor: 0.0015 }), 0, 0.18, 0)); me.add(ubic(K.malla(K.cilindro(0.02, 0.02, 0.05, 8), SA.oro, { grosor: 0.0015 }), 0.07, 0.185, 0));   // los dones
  const ki = actor(P, K, { ...PRECEPTORA, colorRopa: '#5a6a8a', oficio: true, k: 'kindergartnerin' }, 'narrar', A.x - 0.1, A.y + 0.1, { x: A.x + 0.2, y: A.y + 0.4 });
  if (n >= 1) [0, 1, 2, 3].forEach(i => { const a = i * Math.PI / 2 + 0.4; actor(P, K, { ...nino(i + 7), oficio: true, k: 'ronda' + i }, 'cantar', A.x + 0.22 + Math.cos(a) * 0.17, A.y + 0.32 + Math.sin(a) * 0.14, { x: A.x + 0.22, y: A.y + 0.32 }); });
  if (n >= 2) for (let k = 0; k < 4; k++) { const c = new THREE.Group(); en(P, c, A.x - 0.48 + (k % 2) * 0.18, A.y + 0.4 + Math.floor(k / 2) * 0.18); c.add(ubic(caja(K, 0.14, 0.03, 0.12, '#7a5a3a', { sinTinta: true }), 0, 0.015, 0)); c.add(ubic(K.malla(K.esfera(0.035, 0.4), ['#e8506a', '#f2c33a', '#6f9a4a', '#e88a3a'][k], { sinTinta: true }), 0, 0.06, 0)); }   // los canteros
  if (n >= 3) { const pe = new THREE.Group(); en(P, pe, A.x + 0.42, A.y - 0.05); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => pe.add(ubic(K.malla(K.cilindro(0.01, 0.01, 0.4, 4), SA.madera, { sinTinta: true }), a * 0.12, 0.2, b * 0.12))); pe.add(ubic(caja(K, 0.3, 0.02, 0.3, SA.madera, { grosor: 0.002 }), 0, 0.4, 0)); for (let k = 0; k < 8; k++) pe.add(ubic(K.malla(K.esfera(0.035, 0.4), ['#e8506a', '#f2a8c8', '#6f9a4a'][k % 3], { sinTinta: true }), -0.12 + (k % 4) * 0.08, 0.43, -0.1 + Math.floor(k / 4) * 0.2)); }   // la pérgola
  P.toc = [{ x: A.x, y: A.y, k: 'kinder', p: ki }];
  return P;
}

/* LAS PIEZAS: con su índice de saber para la auditoría de etapas (juego3d/qa.html) */
export const PIEZAS = [
  { id: 'lancaster', i: 69, crear: lancaster },
  { id: 'normal', i: 70, crear: normal },
  { id: 'silabario', i: 71, crear: silabario },
  { id: 'preceptoras', i: 72, crear: preceptoras },
  { id: 'ley', i: 73, crear: ley },
  { id: 'kinder', i: 74, crear: kinder },
];
