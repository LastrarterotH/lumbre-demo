/* ============================================================
   amsterdam/piezas
   Los seis saberes de Ámsterdam en 3D, cada uno con sus etapas (la máxima del proyecto: subir de nivel se VE, con piezas
   nuevas; se audita por diff de píxeles en juego3d/qa.html): el tipo móvil (63), la prensa (64), la cartilla (65), el
   atlas (66), la Didáctica Magna (67) y el Orbis Pictus (68). Más la gente de la época (los niños y las niñas de la escuela
   de barrio, los impresores de negro con el cuello blanco, Blaeu y Comenio) y los faroles de la noche.
   Cada pieza devuelve { obj, anim, ancla, toc, actores } como las de las otras épocas (src/piezas.js).
   ============================================================ */
import * as THREE from 'three';
import { pieza, actor, texturaCanvas } from '../piezas.js';
import * as L from './lugares.js';
import { AM } from './monumentos.js';

const ubic = (m, x, y, z, rx = 0, ry = 0, rz = 0) => { m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx, ry, rz); return m; };
const caja = (K, w, h, d, color, o) => K.malla(K.caja(w, h, d), color, o);
const en = (P, obj, x, y, h = 0, ry = 0) => { obj.position.copy(P.en(x, y)); obj.position.y += h; obj.rotation.y = ry; P.obj.add(obj); return obj; };
const plano = (K, tex, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), K.matMapa(tex)); m.geometry.userData.propia = true; m.castShadow = true; return m; };
const patas = (K, g, w, d, h, color = AM.maderaD) => [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(ubic(caja(K, 0.018, h, 0.018, color, { sinTinta: true }), a * (w / 2 - 0.015), h / 2, b * (d / 2 - 0.015))));

export const ANCLAS = {
  tipos: { x: L.TIPOS.x, y: L.TIPOS.y }, prensa: { x: L.PRENSA.x, y: L.PRENSA.y }, cartilla: { x: L.ESCUELA.x, y: L.ESCUELA.y },
  atlas: { x: L.ATLAS.x, y: L.ATLAS.y }, didactica: { x: L.AULA.x, y: L.AULA.y }, orbis: { x: L.ORBIS.x, y: L.ORBIS.y },
};

/* LA ESCALA Y EL GIRO (el replanteo, 2026-10-05). Las casas nuevas de los canales miden 1-1,25 con el frontón y los muebles
   de los saberes quedaban a media altura de ellas: todo lo de la pieza crece desde su ancla (cada una lo que cabe en su
   franja de tierra entre dos canales); la gente no crece (se corre con lo suyo para seguir en su puesto). Y cada pieza se
   gira para mirar hacia afuera del anillo, como las gradas: su frente, hacia la cámara; su fondo, a lo largo del canal,
   así cabe en la franja sin colgar sobre el agua. */
export const ESCALAS = { tipos: 1.25, prensa: 1.3, cartilla: 1.3, atlas: 1.05, didactica: 1.0, orbis: 1.15 };
/* cuánto se corre cada una hacia afuera del anillo (o hacia adentro, si es negativo) para quedar al medio de su franja */
const CORRER = { prensa: -0.15, cartilla: 0.12, atlas: -0.02, didactica: 0.22, orbis: -0.22 };
export const giroDe = A => Math.PI / 2 - L.angulo(A.x, A.y);   // el +z de la pieza, hacia afuera del anillo
function agrandar(P, id) {
  const s = ESCALAS[id], dz0 = CORRER[id] || 0, A = P.ancla, giro = giroDe(A), c = Math.cos(giro), sn = Math.sin(giro);
  const gente = new Set((P.actores || []).map(p => p.obj));
  for (const h of P.obj.children) {
    h.position.x *= s; h.position.z = h.position.z * s + dz0;
    if (gente.has(h)) continue;
    h.position.y *= s; h.scale.multiplyScalar(s);
  }
  P.obj.rotation.y = giro;
  for (const q of P.toc || []) { const dx = (q.x - A.x) * s, dz = (q.y - A.y) * s + dz0; q.x = A.x + dx * c + dz * sn; q.y = A.y - dx * sn + dz * c; }
  return P;
}

/* LA GENTE DE ÁMSTERDAM. Los niños y las niñas de la escuela de barrio: ellas con la cofia blanca y el delantal, ellos con
   la gorra o el pelo corto; ropa de lana parda, azul, gris y roja. Los impresores y los maestros, de negro con el cuello
   blanco, como en los retratos de Rembrandt. */
export function nino(i, extra = {}) {
  const chica = i % 2 === 1;
  return { edad: 'nino', piel: [0, 1, 0, 2, 1][i % 5], pelo: chica ? 'trenza' : 'corto', colorPelo: ['#b08a4a', '#7a5a34', '#4a3424', '#c8a868', '#5a3a24'][i % 5],
    velo: chica ? '#f4f0e6' : undefined, ropa: 'tunica', colorRopa: ['#5a4a3a', '#3f4f6a', '#7a3a2a', '#5a5a52', '#6a5a3a'][i % 5], orla: '#2e2a24',
    chal: chica ? '#f4f0e6' : undefined, sinFlecos: true, ...extra };
}
export const IMPRESOR = { piel: 0, pelo: 'melena', colorPelo: '#5a3a24', barba: '#5a3a24', ropa: 'tunica', colorRopa: '#26221e', orla: '#1a1714', chal: '#f4f0e6', sinFlecos: true };
export const MAESTRA = { piel: 0, pelo: 'moño', colorPelo: '#5a3a24', velo: '#f4f0e6', ropa: 'tunica', colorRopa: '#2e2a26', orla: '#1a1714', chal: '#f4f0e6', sinFlecos: true };
export const OBRERO = { piel: 1, pelo: 'revuelto', colorPelo: '#6a4a2e', ropa: 'corta', colorRopa: '#8a7a5a', orla: '#5a4a32', chal: '#c9b48a', sinFlecos: true };
export const BLAEU = { ...IMPRESOR, colorPelo: '#5a3a24', bonete: '#1e1c1a' };
export const COMENIO = { piel: 0, pelo: 'corto', colorPelo: '#e8e4dc', barba: '#e8e4dc', ropa: 'tunica', colorRopa: '#2a2a2e', orla: '#1a1a1e', chal: '#e8e4dc', bonete: '#1e1c1a', edad: 'anciana', sinFlecos: true };

/* ---------- utensilios ---------- */
export function farol(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  g.add(ubic(K.malla(K.cilindro(0.012, 0.016, 0.42, 5), AM.negro, { sinTinta: true }), 0, 0.21, 0));
  g.add(ubic(caja(K, 0.07, 0.08, 0.07, '#3a3632', { grosor: 0.002 }), 0, 0.46, 0));
  const llama = new THREE.Group(); llama.position.y = 0.46; g.add(llama); g.userData.llama = llama;
  llama.add(ubic(K.malla(K.esfera(0.026, 0.4), '#ffd27a', { sinTinta: true, sombra: false, emissive: '#ffb04a', emissiveIntensity: 1.2 }), 0, 0, 0));
  return g;
}
function banco(K, l = 0.5) { const g = new THREE.Group(); g.add(ubic(caja(K, l, 0.025, 0.09, AM.madera, { grosor: 0.002 }), 0, 0.08, 0)); [-1, 1].forEach(s => g.add(ubic(caja(K, 0.025, 0.08, 0.08, AM.maderaD, { sinTinta: true }), s * (l / 2 - 0.04), 0.04, 0))); return g; }
function mesa(K, w, d, h = 0.22) { const g = new THREE.Group(); g.add(ubic(caja(K, w, 0.02, d, AM.madera, { grosor: 0.002 }), 0, h, 0)); patas(K, g, w, d, h); return g; }
function pagina(K, w, tipo = 'texto') {
  const tx = texturaCanvas(64, 80, (c, W, H) => {
    c.fillStyle = '#f8f4ea'; c.fillRect(0, 0, W, H);
    if (tipo === 'orbis') {   // el grabado con sus números arriba, el texto en dos columnas abajo
      c.strokeStyle = '#2a2622'; c.lineWidth = 1.5; c.strokeRect(6, 6, W - 12, 36);
      c.fillStyle = '#5a7a4a'; c.beginPath(); c.arc(22, 30, 9, 0, 7); c.fill(); c.fillStyle = '#8a6a42'; c.fillRect(40, 18, 10, 20); c.fillStyle = '#3f6a9a'; c.fillRect(8, 8, W - 16, 8);
      c.fillStyle = '#9a2a1e'; c.font = 'bold 7px Georgia'; c.fillText('1', 20, 22); c.fillText('2', 44, 16);
      c.fillStyle = '#3a342a'; for (let y = 48; y < H - 4; y += 4) { c.fillRect(6, y, 24, 1.2); c.fillRect(34, y, 24, 1.2); }
    } else if (tipo === 'abc') {
      c.fillStyle = '#1e1a16'; c.font = 'bold 13px Georgia'; ['A B C D', 'E F G H', 'I K L M', 'N O P Q'].forEach((t, k) => c.fillText(t, 7, 18 + k * 16));
      c.fillStyle = '#9a2a1e'; c.fillRect(6, H - 10, W - 12, 3);
    } else { c.fillStyle = '#1e1a16'; c.fillRect(8, 8, W - 16, 6); c.fillStyle = '#4a443a'; for (let y = 20; y < H - 6; y += 5) c.fillRect(8, y, W - 16, 1.4); c.fillStyle = '#9a2a1e'; c.fillRect(8, 20, 7, 8); }
  });
  return plano(K, tx, w, w * 1.25);
}
function globo(K, celeste = false) {
  const g = new THREE.Group();
  g.add(ubic(K.malla(K.cilindro(0.03, 0.05, 0.16, 6), AM.maderaD, { grosor: 0.002 }), 0, 0.08, 0));
  g.add(ubic(K.malla(K.toro(0.1, 0.008, Math.PI * 2, 0.5), AM.oro, { sinTinta: true }), 0, 0.26, 0, 0.4, 0, 0));
  const tx = texturaCanvas(64, 32, (c, W, H) => { c.fillStyle = celeste ? '#2a3a6a' : '#7aa2c8'; c.fillRect(0, 0, W, H); c.fillStyle = celeste ? '#f2e6b8' : '#c8b47a';
    if (celeste) for (let k = 0; k < 30; k++) { c.beginPath(); c.arc((k * 37) % W, (k * 13) % H, 0.9, 0, 7); c.fill(); } else { c.fillRect(8, 6, 12, 14); c.fillRect(28, 8, 10, 18); c.fillRect(44, 6, 14, 10); } });
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), K.matMapa(tx)); s.geometry.userData.propia = true; s.position.y = 0.26; s.castShadow = true; g.add(s);
  return g;
}
function pliegosColgados(K, w, n = 5) {
  const g = new THREE.Group();
  [-1, 1].forEach(l => g.add(ubic(K.malla(K.cilindro(0.008, 0.008, 0.6, 4), AM.maderaD, { sinTinta: true }), l * w / 2, 0.3, 0)));
  g.add(ubic(K.malla(K.cilindro(0.004, 0.004, w, 3), AM.maderaD, { sinTinta: true }), 0, 0.56, 0, 0, 0, Math.PI / 2));
  for (let k = 0; k < n; k++) g.add(ubic(caja(K, w / n - 0.02, 0.14, 0.004, '#f8f4ea', { grosor: 0.0012 }), -w / 2 + (k + 0.5) * w / n, 0.49, 0));
  return g;
}

/* ---------- 63 · EL TIPO MÓVIL: la fundición de tipos ---------- */
/* 0: el horno con su crisol y el fundidor · 1: la mesa del molde de mano con las letras recién fundidas en fila · 2: las
   cajas alta y baja en su atril · 3: las resmas de pliegos del molino y la tina donde se mojan antes de imprimir */
export function tipos(K, n) {
  const P = pieza(ANCLAS.tipos), A = ANCLAS.tipos;
  const ho = new THREE.Group(); en(P, ho, A.x - 0.25, A.y - 0.15);
  ho.add(ubic(caja(K, 0.32, 0.26, 0.26, AM.ladrilloD, { grosor: 0.004 }), 0, 0.13, 0));
  ho.add(ubic(caja(K, 0.12, 0.08, 0.012, '#ff8a3a', { sinTinta: true, emissive: '#ff6a1a', emissiveIntensity: 0.8 }), 0, 0.08, 0.131));   // la boca del horno
  ho.add(ubic(K.malla(K.cilindro(0.06, 0.05, 0.06, 8), AM.negro, { grosor: 0.002 }), 0, 0.29, 0));   // el crisol
  ho.add(ubic(caja(K, 0.06, 0.26, 0.06, AM.ladrillo, { grosor: 0.002 }), 0.1, 0.39, -0.08));   // la chimenea
  const fu = actor(P, K, { ...OBRERO, oficio: true, k: 'fundidor' }, 'labrar', A.x + 0.08, A.y + 0.1, { x: A.x - 0.25, y: A.y - 0.15 });
  if (n >= 1) {
    const me = mesa(K, 0.32, 0.18); en(P, me, A.x + 0.38, A.y - 0.15);
    for (let k = 0; k < 10; k++) me.add(ubic(caja(K, 0.012, 0.03, 0.012, '#9aa0a6', { sinTinta: true }), -0.12 + (k % 5) * 0.06, 0.245, -0.04 + Math.floor(k / 5) * 0.06));   // las letras en fila
    me.add(ubic(caja(K, 0.05, 0.04, 0.04, AM.madera, { grosor: 0.0015 }), 0.1, 0.25, 0.04));   // el molde de mano
  }
  if (n >= 2) {
    const at = new THREE.Group(); en(P, at, A.x + 0.0, A.y - 0.5);
    patas(K, at, 0.42, 0.2, 0.22);
    [[0.32, 0.2], [0.24, 0.3]].forEach(([y, rx], k) => { const c = caja(K, 0.42, 0.02, 0.2, AM.madera, { grosor: 0.002 }); c.position.set(0, y + k * 0.1, -0.02 * k); c.rotation.x = rx; at.add(c);
      for (let q = 0; q < 6; q++) at.add(ubic(caja(K, 0.004, 0.022, 0.18, AM.maderaD, { sinTinta: true }), -0.18 + q * 0.07, y + k * 0.1 + 0.015, -0.02 * k, rx, 0, 0)); });   // la caja alta y la caja baja, con sus casillas
  }
  if (n >= 3) {
    const re = new THREE.Group(); en(P, re, A.x + 0.5, A.y + 0.28);
    for (let k = 0; k < 4; k++) re.add(ubic(caja(K, 0.16, 0.04, 0.12, k % 2 ? '#fffaf0' : '#efe8d8', { grosor: 0.0015 }), 0, 0.02 + k * 0.04, 0));   // las resmas
    const ti = new THREE.Group(); en(P, ti, A.x - 0.45, A.y + 0.3);
    ti.add(ubic(caja(K, 0.26, 0.08, 0.16, AM.maderaD, { grosor: 0.003 }), 0, 0.04, 0));
    ti.add(ubic(caja(K, 0.22, 0.01, 0.12, '#7a9aa6', { sinTinta: true }), 0, 0.078, 0));   // la tina del agua
  }
  P.toc = [{ x: A.x, y: A.y, k: 'fundicion', p: fu }];
  return agrandar(P, 'tipos');
}

/* ---------- 64 · LA PRENSA: el taller de la casa Blaeu ---------- */
/* 0: la prensa de madera con el tirador que jala la barra · 1: el cajista en su atril, con el componedor · 2: el
   entintador con sus dos balas y la losa de la tinta · 3: el tendedero con los pliegos colgados a secar */
function prensaMadera(K) {
  const g = new THREE.Group();
  [-1, 1].forEach(l => g.add(ubic(caja(K, 0.05, 0.6, 0.06, AM.maderaD, { grosor: 0.003 }), l * 0.13, 0.3, 0)));
  g.add(ubic(caja(K, 0.34, 0.06, 0.08, AM.maderaD, { grosor: 0.003 }), 0, 0.6, 0));   // el sombrero
  g.add(ubic(caja(K, 0.3, 0.05, 0.08, AM.madera, { grosor: 0.002 }), 0, 0.42, 0));
  g.add(ubic(K.malla(K.cilindro(0.02, 0.02, 0.14, 6), '#8a8a8a', { grosor: 0.0015 }), 0, 0.33, 0));   // el tornillo
  g.add(ubic(caja(K, 0.2, 0.03, 0.18, AM.madera, { grosor: 0.002 }), 0, 0.25, 0.02));   // la platina
  g.add(ubic(caja(K, 0.26, 0.04, 0.5, AM.madera, { grosor: 0.002 }), 0, 0.19, 0.12));   // el carro, que corre hacia adelante
  g.add(ubic(caja(K, 0.18, 0.012, 0.16, '#4a4a4e', { sinTinta: true }), 0, 0.216, 0.24));   // la forma con las letras
  g.add(ubic(caja(K, 0.18, 0.006, 0.14, '#f8f4ea', { grosor: 0.001 }), 0, 0.222, 0.4, -0.5, 0, 0));   // el tímpano con el pliego
  g.add(ubic(K.malla(K.cilindro(0.008, 0.008, 0.26, 4), '#5a5a5a', { sinTinta: true }), 0.14, 0.34, 0.05, 0, 0.5, Math.PI / 2));   // la barra
  return g;
}
export function prensa(K, n) {
  const P = pieza(ANCLAS.prensa), A = ANCLAS.prensa;
  en(P, prensaMadera(K), A.x, A.y - 0.2);
  const ti = actor(P, K, { ...OBRERO, colorRopa: '#5a4a3a', oficio: true, k: 'tirador' }, 'labrar', A.x + 0.28, A.y - 0.12, { x: A.x, y: A.y - 0.2 });
  if (n >= 1) {
    const at = new THREE.Group(); en(P, at, A.x - 0.48, A.y - 0.15, 0, 0.3);
    patas(K, at, 0.3, 0.16, 0.26); const c = caja(K, 0.32, 0.02, 0.18, AM.madera, { grosor: 0.002 }); c.position.y = 0.3; c.rotation.x = 0.35; at.add(c);
    for (let q = 0; q < 5; q++) at.add(ubic(caja(K, 0.004, 0.02, 0.16, AM.maderaD, { sinTinta: true }), -0.12 + q * 0.06, 0.31, 0, 0.35, 0, 0));
    actor(P, K, { ...IMPRESOR, oficio: true, k: 'cajista' }, 'escribir', A.x - 0.44, A.y + 0.12, { x: A.x - 0.48, y: A.y - 0.15 });
  }
  if (n >= 2) {
    const lo = mesa(K, 0.2, 0.16, 0.2); en(P, lo, A.x + 0.5, A.y + 0.2);
    lo.add(ubic(caja(K, 0.14, 0.012, 0.1, AM.negro, { sinTinta: true }), 0, 0.215, 0));   // la losa de la tinta
    actor(P, K, { ...OBRERO, colorRopa: '#3a3632', chal: undefined, oficio: true, k: 'entintador' }, 'tocar', A.x + 0.5, A.y + 0.42, { x: A.x + 0.5, y: A.y + 0.2 });
    [-0.04, 0.04].forEach(dx => lo.add(ubic(K.malla(K.esfera(0.03, 0.5), '#6a4a30', { grosor: 0.0015 }), dx, 0.25, 0.03)));   // las balas
  }
  if (n >= 3) { const te = pliegosColgados(K, 0.9, 6); en(P, te, A.x - 0.05, A.y + 0.3); }
  P.toc = [{ x: A.x, y: A.y, k: 'imprenta', p: ti }];
  return agrandar(P, 'prensa');
}

/* ---------- 65 · LA CARTILLA: la escuela del barrio ---------- */
/* 0: el maestro en su silla con la mesa y un banco de niños con su cartilla · 1: la tabla del abecedario en su caballete ·
   2: el banco de las niñas, al otro lado · 3: el letrero de la escuela y la palmeta en la mano del maestro */
export function cartilla(K, n) {
  const P = pieza(ANCLAS.cartilla), A = ANCLAS.cartilla;
  const me = mesa(K, 0.26, 0.16); en(P, me, A.x - 0.1, A.y - 0.32);
  me.add(ubic(caja(K, 0.08, 0.02, 0.06, '#5a3a24', { grosor: 0.001 }), 0.05, 0.24, 0));
  const ma = actor(P, K, { ...IMPRESOR, chal: '#f4f0e6', bonete: '#1e1c1a', oficio: true, k: 'maestroEsc' }, n >= 3 ? 'narrar' : 'leer', A.x - 0.1, A.y - 0.5, { x: A.x, y: A.y + 0.5 }, { asiento: 0.08 });
  const b0 = banco(K, 0.5); en(P, b0, A.x + 0.12, A.y + 0.05);
  [0, 2].forEach((k, i) => actor(P, K, { ...nino(k), oficio: true, k: 'nino' + i }, 'leer', A.x + 0.0 + i * 0.22, A.y + 0.05, { x: A.x - 0.1, y: A.y - 0.5 }, { asiento: 0.08 }));
  if (n >= 1) {
    const ta = new THREE.Group(); en(P, ta, A.x + 0.45, A.y - 0.32, 0, -0.3);
    [-1, 1].forEach(l => ta.add(ubic(caja(K, 0.016, 0.42, 0.016, AM.maderaD, { sinTinta: true }), l * 0.1, 0.21, 0, l * 0.0, 0, l * 0.1)));
    const pa = pagina(K, 0.24, 'abc'); pa.position.set(0, 0.32, 0.012); ta.add(pa);
  }
  if (n >= 2) {
    const b1 = banco(K, 0.5); en(P, b1, A.x + 0.12, A.y + 0.32);
    [1, 3].forEach((k, i) => actor(P, K, { ...nino(k), oficio: true, k: 'nina' + i }, 'leer', A.x + 0.0 + i * 0.22, A.y + 0.32, { x: A.x - 0.1, y: A.y - 0.5 }, { asiento: 0.08 }));
  }
  if (n >= 3) {
    const le = new THREE.Group(); en(P, le, A.x - 0.48, A.y + 0.2);
    le.add(ubic(K.malla(K.cilindro(0.01, 0.01, 0.62, 4), AM.maderaD, { sinTinta: true }), 0, 0.31, 0));
    le.add(ubic(caja(K, 0.2, 0.12, 0.012, AM.blanco, { grosor: 0.0015 }), 0.08, 0.56, 0));
    le.add(ubic(caja(K, 0.08, 0.06, 0.014, '#1e1a16', { sinTinta: true }), 0.08, 0.56, 0));   // el letrero de la escuela, con su letra
    me.add(ubic(caja(K, 0.03, 0.012, 0.12, AM.madera, { grosor: 0.001 }), -0.08, 0.24, 0.03));   // la palmeta, sobre la mesa
  }
  P.toc = [{ x: A.x, y: A.y, k: 'escuelaAm', p: ma }];
  return agrandar(P, 'cartilla');
}

/* ---------- 66 · EL ATLAS: la casa del atlas ---------- */
/* 0: el globo terrestre y el geógrafo · 1: el globo del cielo y un mapa en su caballete · 2: el grabador con la plancha de
   cobre · 3: la iluminadora que pinta los mapas, con los mapas puestos a secar */
export function atlas(K, n) {
  const P = pieza(ANCLAS.atlas), A = ANCLAS.atlas;
  en(P, globo(K), A.x - 0.2, A.y - 0.2);
  const ge = actor(P, K, { ...BLAEU, oficio: true, k: 'geografo' }, 'narrar', A.x - 0.0, A.y - 0.05, { x: A.x - 0.2, y: A.y - 0.2 });
  if (n >= 1) {
    en(P, globo(K, true), A.x + 0.28, A.y - 0.3);
    const ca = new THREE.Group(); en(P, ca, A.x + 0.5, A.y + 0.05, 0, -0.4);
    [-1, 1].forEach(l => ca.add(ubic(caja(K, 0.016, 0.44, 0.016, AM.maderaD, { sinTinta: true }), l * 0.12, 0.22, 0, 0, 0, l * 0.08)));
    const tx = texturaCanvas(64, 48, (c, W, H) => { c.fillStyle = '#efe4c8'; c.fillRect(0, 0, W, H); c.fillStyle = '#9ab8c8'; c.fillRect(4, 4, W - 8, H - 8); c.fillStyle = '#c8b47a'; c.fillRect(10, 10, 18, 20); c.fillRect(34, 14, 16, 22); c.strokeStyle = '#7a2a1e'; c.lineWidth = 1.5; c.strokeRect(4, 4, W - 8, H - 8); });
    const ma = plano(K, tx, 0.28, 0.21); ma.position.set(0, 0.34, 0.012); ca.add(ma);
  }
  if (n >= 2) {
    const me = mesa(K, 0.28, 0.18); en(P, me, A.x - 0.45, A.y + 0.25);
    me.add(ubic(caja(K, 0.16, 0.008, 0.12, '#b87333', { grosor: 0.001 }), 0, 0.235, 0));   // la plancha de cobre
    actor(P, K, { ...IMPRESOR, colorPelo: '#2a1f18', barba: undefined, oficio: true, k: 'grabador' }, 'escribir', A.x - 0.45, A.y + 0.48, { x: A.x - 0.45, y: A.y + 0.25 });
  }
  if (n >= 3) {
    const me = mesa(K, 0.28, 0.18); en(P, me, A.x + 0.15, A.y + 0.42);
    ['#c8541e', '#3f6a9a', '#5f8a4a', '#d4a93e'].forEach((c, k) => me.add(ubic(K.malla(K.cilindro(0.012, 0.012, 0.02, 6), c, { sinTinta: true }), -0.09 + k * 0.06, 0.24, 0.05)));
    actor(P, K, { ...MAESTRA, oficio: true, k: 'iluminadora' }, 'escribir', A.x + 0.15, A.y + 0.62, { x: A.x + 0.15, y: A.y + 0.42 });
    const se = pliegosColgados(K, 0.5, 3); en(P, se, A.x - 0.1, A.y - 0.5);
  }
  P.toc = [{ x: A.x, y: A.y, k: 'atlasAm', p: ge }];
  return agrandar(P, 'atlas');
}

/* ---------- 67 · LA DIDÁCTICA MAGNA: el aula de Comenio ---------- */
/* 0: la sala con sus bancos en filas y el pupitre del maestro · 1: los niños en los bancos, todos con el mismo libro · 2: el
   segundo grupo, el de los más chicos, en su banco · 3: la pizarra, el reloj de arena y el lema en la pared */
export function didactica(K, n) {
  const P = pieza(ANCLAS.didactica), A = ANCLAS.didactica;
  const sa = new THREE.Group(); en(P, sa, A.x, A.y - 0.35);
  sa.add(ubic(caja(K, 1.0, 0.04, 0.6, AM.madera, { grosor: 0.003 }), 0, 0.02, 0.05));   // el piso de tablas
  sa.add(ubic(caja(K, 1.0, 0.42, 0.06, AM.ladrillo, { grosor: 0.004 }), 0, 0.21, -0.26));
  [-1, 1].forEach(l => sa.add(ubic(caja(K, 0.06, 0.42, 0.62, AM.ladrillo, { grosor: 0.004 }), l * 0.48, 0.21, 0.04)));
  const s = new THREE.Shape(); s.moveTo(-0.56, 0); s.lineTo(0.56, 0); s.lineTo(0, 0.34); s.closePath();
  const tg = new THREE.ExtrudeGeometry(s, { depth: 0.7, bevelEnabled: false }); tg.userData.propia = true; tg.translate(0, 0, -0.35);
  sa.add(ubic(K.malla(tg, AM.teja, { grosor: 0.003 }), 0, 0.42, 0.04));
  const pu = mesa(K, 0.2, 0.12, 0.26); en(P, pu, A.x, A.y - 0.42);
  const ma = actor(P, K, { ...IMPRESOR, bonete: '#1e1c1a', oficio: true, k: 'maestroAula' }, 'narrar', A.x + 0.0, A.y - 0.5, { x: A.x, y: A.y + 0.6 });
  [[-0.2, -0.22], [0.2, -0.22], [-0.2, 0.0], [0.2, 0.0]].forEach(([dx, dz]) => en(P, banco(K, 0.34), A.x + dx, A.y + dz));
  if (n >= 1) [[-0.28, -0.22], [-0.12, -0.22], [0.12, -0.22], [0.28, -0.22]].forEach(([dx, dz], i) => actor(P, K, { ...nino(i + 4), oficio: true, k: 'alumnoA' + i }, 'leer', A.x + dx, A.y + dz, { x: A.x, y: A.y - 0.6 }, { asiento: 0.08 }));
  if (n >= 2) [[-0.2, 0.0], [0.2, 0.0]].forEach(([dx, dz], i) => actor(P, K, { ...nino(i + 9), oficio: true, k: 'alumnoB' + i }, 'leer', A.x + dx, A.y + dz, { x: A.x, y: A.y - 0.6 }, { asiento: 0.08 }));
  if (n >= 3) {
    const pi = new THREE.Group(); en(P, pi, A.x + 0.28, A.y - 0.55);
    pi.add(ubic(caja(K, 0.3, 0.2, 0.02, '#2a2e2a', { grosor: 0.002 }), 0, 0.3, 0));   // la pizarra
    pi.add(ubic(caja(K, 0.32, 0.02, 0.03, AM.madera, { sinTinta: true }), 0, 0.19, 0.01));
    pu.add(ubic(K.malla(K.cono(0.025, 0.04, 6), '#d8c8a0', { grosor: 0.001 }), 0.06, 0.26, 0, Math.PI, 0, 0));   // el reloj de arena
    pu.add(ubic(K.malla(K.cono(0.025, 0.04, 6), '#d8c8a0', { grosor: 0.001 }), 0.06, 0.3, 0));
    const le = pagina(K, 0.16, 'texto'); le.position.set(-0.3, 0.34, -0.22); sa.add(le);   // el lema: «omnes omnia omnino»
    /* el alero del frente, sobre cuatro postes, y debajo la pizarra grande con el abecedario y los números, para la clase que sale al patio */
    const al = new THREE.Group(); en(P, al, A.x, A.y + 0.38);
    [[-1, 0], [1, 0], [-1, 1], [1, 1]].forEach(([a2, b2]) => al.add(ubic(K.malla(K.cilindro(0.014, 0.014, 0.42, 5), AM.maderaD, { grosor: 0.002 }), a2 * 0.46, 0.21, b2 * 0.32 - 0.1)));
    const te = caja(K, 1.04, 0.02, 0.46, AM.teja, { grosor: 0.002 }); te.position.set(0, 0.43, 0.06); te.rotation.x = 0.18; al.add(te);
    const pz = new THREE.Group(); en(P, pz, A.x - 0.62, A.y + 0.45, 0, 0.5);
    [-1, 1].forEach(l => pz.add(ubic(caja(K, 0.016, 0.46, 0.016, AM.maderaD, { sinTinta: true }), l * 0.13, 0.23, 0, 0, 0, l * 0.06)));
    pz.add(ubic(caja(K, 0.3, 0.22, 0.016, '#2a2e2a', { grosor: 0.002 }), 0, 0.34, 0.01));
    const ab = pagina(K, 0.18, 'abc'); ab.position.set(0, 0.34, 0.02); ab.scale.set(1, 0.7, 1); pz.add(ab);
  }
  P.toc = [{ x: A.x, y: A.y, k: 'aulaAm', p: ma }];
  return agrandar(P, 'didactica');
}

/* ---------- 68 · EL ORBIS PICTUS: el taller de los grabadores ---------- */
/* 0: el banco del grabador con su taco de madera · 1: la página con el grabado numerado, clavada en su tablero · 2: el
   segundo grabador y la pila de libros recién encuadernados · 3: el puesto del librero, con los niños mirando las imágenes */
export function orbis(K, n) {
  const P = pieza(ANCLAS.orbis), A = ANCLAS.orbis;
  const me = mesa(K, 0.32, 0.18); en(P, me, A.x - 0.2, A.y - 0.3);
  me.add(ubic(caja(K, 0.12, 0.03, 0.1, '#c8a46a', { grosor: 0.0015 }), 0, 0.235, 0));   // el taco de madera
  const gr = actor(P, K, { ...IMPRESOR, colorPelo: '#7a5a34', barba: undefined, oficio: true, k: 'grabadorOrbis' }, 'escribir', A.x - 0.2, A.y - 0.08, { x: A.x - 0.2, y: A.y - 0.3 });
  if (n >= 1) {
    const ta = new THREE.Group(); en(P, ta, A.x + 0.3, A.y - 0.4, 0, -0.3);
    ta.add(ubic(caja(K, 0.3, 0.38, 0.02, AM.madera, { grosor: 0.002 }), 0, 0.3, 0));
    const pa = pagina(K, 0.24, 'orbis'); pa.position.set(0, 0.32, 0.012); ta.add(pa);
    ta.add(ubic(K.malla(K.cilindro(0.008, 0.008, 0.22, 4), AM.maderaD, { sinTinta: true }), 0, 0.11, -0.06, 0.4, 0, 0));
  }
  if (n >= 2) {
    const m2 = mesa(K, 0.26, 0.16); en(P, m2, A.x - 0.55, A.y + 0.15);
    actor(P, K, { ...OBRERO, colorRopa: '#3f4f6a', oficio: true, k: 'grabador2' }, 'escribir', A.x - 0.55, A.y + 0.36, { x: A.x - 0.55, y: A.y + 0.15 });
    for (let k = 0; k < 4; k++) en(P, caja(K, 0.12, 0.03, 0.09, ['#7a3a2a', '#3f4f3a', '#5a4630', '#2a3a5a'][k], { grosor: 0.0015 }), A.x + 0.4, A.y + 0.15, 0.015 + k * 0.031);   // los libros encuadernados
  }
  if (n >= 3) {
    const pu = new THREE.Group(); en(P, pu, A.x + 0.05, A.y + 0.45);
    pu.add(ubic(caja(K, 0.5, 0.18, 0.18, AM.madera, { grosor: 0.003 }), 0, 0.09, 0));
    for (let k = 0; k < 4; k++) { const l = pagina(K, 0.09, 'orbis'); l.rotation.x = -1.1; l.position.set(-0.18 + k * 0.12, 0.2, 0.0); pu.add(l); }   // los libros abiertos en el puesto
    [-1, 1].forEach(l => pu.add(ubic(K.malla(K.cilindro(0.008, 0.008, 0.46, 4), AM.maderaD, { sinTinta: true }), l * 0.24, 0.23, -0.08)));
    pu.add(ubic(caja(K, 0.56, 0.014, 0.26, '#c8541e', { grosor: 0.0015 }), 0, 0.46, -0.02));   // el toldo
    [0, 1].forEach(i => actor(P, K, { ...nino(i + 13), oficio: true, k: 'mira' + i }, 'leer', A.x - 0.1 + i * 0.3, A.y + 0.72, { x: A.x + 0.05, y: A.y + 0.45 }));
  }
  P.toc = [{ x: A.x, y: A.y, k: 'orbisAm', p: gr }];
  return agrandar(P, 'orbis');
}

/* LAS PIEZAS: con su índice de saber para la auditoría de etapas (juego3d/qa.html) */
export const PIEZAS = [
  { id: 'tipos', i: 63, crear: tipos },
  { id: 'prensa', i: 64, crear: prensa },
  { id: 'cartilla', i: 65, crear: cartilla },
  { id: 'atlas', i: 66, crear: atlas },
  { id: 'didactica', i: 67, crear: didactica },
  { id: 'orbis', i: 68, crear: orbis },
];
