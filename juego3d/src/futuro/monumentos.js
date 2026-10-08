/* ============================================================
   futuro/monumentos
   Las piezas de la última época (id 21, docs/era21-plan.md: hoy y lo que viene, en el valle del principio) para la
   hoja de bocetos (juego3d/bocetos/futuro.html), en tres versiones de verdad cada una:
   - EL HÉROE, la escuela que vuelve al lugar donde empezó la educación: A la escuela de la colina (madera y vidrio,
     con el techo de pasto que baja hasta el suelo y la linterna de lectura arriba); B la escuela en anillo, abierta
     hacia el valle, con el círculo de piedras del fogón en su patio; C la escuela bajo el gran árbol;
   - CÓMO SE VE LA IA en el mundo: A la chispa azul que acompaña a cada estudiante (la rima fría con la chispa naranja
     del fogón); B las pantallas; C los hilos de luz;
   - LAS CASAS del valle de hoy: A las de madera y chapa del campo; B las de colores del pueblo; C las redondas de
     tierra con el techo de pasto (la rima con las chozas de la aldea);
   - y el círculo de piedras del fogón viejo, que está donde estaba.
   A escala de maqueta, como todo el juego: una persona mide ~0,9 y un piso, 0,75. El frente de cada pieza mira a +z
   (y la cámara mira desde +x +z). Paleta clara y cálida.
   ============================================================ */
import * as THREE from 'three';
import { PAL, azar } from '../kit.js';
import { pon, caja, propia, textura } from '../agora/monumentos.js';

export const FT = {
  madera: '#c9955f', maderaD: '#a5743f', maderaL: '#e2ba86',
  vidrio: '#cfe7f0', vidrioD: '#9cc6da', marco: '#f3efe6', marcoD: '#5b6168',
  pasto: '#8fbd5c', pastoD: '#70a046', pastoL: '#aed27a',
  hormigon: '#dcd6ca', hormigonD: '#c0b9ab',
  tierra: '#ddb88d', tierraD: '#c69c70', tierraL: '#ecd2ae',
  chapaR: '#b8503f', chapaV: '#5e8c6c', chapaG: '#9aa3a8',
  solar: '#2f4d70', solarL: '#7aa0c8',
  ocre: '#e3a85c', turquesa: '#5fb3a8', rosa: '#e39a92', celeste: '#7ea7d4', crema: '#f1e6cf',
  chispa: '#9fdcff', chispaD: '#4aa8ff', fuego: '#ffb14a',
  tela: '#e9d9b8', libro: ['#c64a30', '#41709c', '#d9a441', '#5f9a6a', '#8a5a8a'],
};
export const VARIANTES = { heroe: 'anillo', ia: 'chispa', casas: 'redondas', tablero: 'siempre' };   // ELEGIDAS por el usuario el 2026-10-07: «BACA»

const r2 = n => Math.round(n * 1000) / 1000;
const O = (gr = 0.004) => ({ grosor: gr });

/* ---------- las texturas ---------- */
const MR = new WeakMap();
export function matRep(K, clave, tex, ru = 1, rv = 1, extra = {}) {
  let m = MR.get(K); if (!m) MR.set(K, m = new Map());
  const ku = Math.max(1, Math.round(ru)), kv = Math.max(1, Math.round(rv)), k = `${clave}_${ku}_${kv}`;
  if (!m.has(k)) { const t = tex.clone(); t.needsUpdate = true; t.repeat.set(ku, kv); m.set(k, K.matMapa(t, extra)); }
  return m.get(k);
}
/* las tablas de madera verticales, con su veta y la junta oscura */
export const texTablas = () => textura('ft-tablas', 64, 64, (g, w, h) => {
  const tonos = [FT.madera, FT.maderaL, '#d3a571', FT.madera, '#bf8a55'];
  for (let i = 0; i < 8; i++) { g.fillStyle = tonos[i % 5]; g.fillRect(i * 8, 0, 8, h); g.fillStyle = 'rgba(90,55,25,0.55)'; g.fillRect(i * 8, 0, 1, h); }
  g.fillStyle = 'rgba(120,80,40,0.18)'; for (let i = 0; i < 26; i++) g.fillRect((i * 37) % w, (i * 23) % h, 1, 6 + (i % 4) * 3);
}, { repetir: true });
/* el pasto del techo: el verde con matas más claras y más oscuras */
export const texPasto = () => textura('ft-pasto', 64, 64, (g, w, h) => {
  g.fillStyle = FT.pasto; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) { g.fillStyle = i % 3 ? FT.pastoD : FT.pastoL; const x = (i * 53) % w, y = (i * 29) % h; g.fillRect(x, y, 2 + (i % 3), 2); }
  g.fillStyle = '#f2e27a'; for (let i = 0; i < 7; i++) g.fillRect((i * 41 + 7) % w, (i * 17 + 3) % h, 2, 2);   // flores
}, { repetir: true });
/* la tierra apisonada de las casas redondas, con su paja */
export const texTierra = () => textura('ft-tierra', 64, 64, (g, w, h) => {
  g.fillStyle = FT.tierra; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) { g.fillStyle = i % 2 ? FT.tierraD : FT.tierraL; g.fillRect((i * 47) % w, (i * 31) % h, 3, 1); }
  g.strokeStyle = 'rgba(160,120,70,0.35)'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(0, 8 + i * 16); g.lineTo(w, 10 + i * 16); g.stroke(); }
}, { repetir: true });
/* el panel solar: celdas azules con su retícula */
const texSolar = () => textura('ft-solar', 64, 64, (g, w, h) => {
  g.fillStyle = FT.solar; g.fillRect(0, 0, w, h); g.strokeStyle = FT.solarL; g.lineWidth = 1.5;
  for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 16); g.lineTo(w, i * 16); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(4, 4, 18, 6);
}, { repetir: true });
/* un signo que flota sobre la chispa: «?» cuando pregunta y «!» cuando responde */
function texSigno(s) {
  return textura('ft-signo-' + s, 64, 64, (g, w, h) => {
    g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.arc(w / 2, h / 2, 26, 0, Math.PI * 2); g.fill();
    g.lineWidth = 3; g.strokeStyle = FT.chispaD; g.stroke();
    g.fillStyle = '#1f5f99'; g.font = '800 40px "Avenir Next", "Nunito", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, w / 2, h / 2 + 2);
  });
}

/* ---------- piezas chicas que comparten todas ---------- */
export const tablas = (K, w, h, d) => K.malla(K.caja(w, h, d), matRep(K, 'tablas', texTablas(), w * 2.2, h * 1.2), O(0.004));
export const vidrio = (K, w, h, d = 0.02) => K.malla(K.caja(w, h, d), FT.vidrio, { transparent: true, opacity: 0.42, depthWrite: false, grosor: 0.002 });
/* una pared de vidrio con sus montantes y su travesaño, a lo largo de x, de ancho w y alto h */
export function muroVidrio(K, w, h, paso = 0.3, marco = FT.marco) {
  const g = new THREE.Group(), n = Math.max(2, Math.round(w / paso));
  pon(g, vidrio(K, w, h - 0.04), 0, h / 2, 0);
  for (let i = 0; i <= n; i++) pon(g, caja(K, 0.025, h, 0.035, marco, O(0.0015)), -w / 2 + i * w / n, h / 2, 0);
  pon(g, caja(K, w, 0.03, 0.035, marco, O(0.0015)), 0, h * 0.62, 0);
  pon(g, caja(K, w + 0.02, 0.04, 0.05, marco, O(0.0015)), 0, h - 0.02, 0);
  return g;
}
/* las matas del techo de pasto: conitos instanciados sobre un rectángulo o un anillo */
export function matas(K, puntos, color = FT.pastoD) {
  const m = K.instancias(K.cono(0.035, 0.09, 5), color, puntos.length, { sinTinta: true, sombra: false });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
  puntos.forEach(([x, y, z], i) => { m4.compose(v.set(x, y + 0.04, z), q, s); m.setMatrixAt(i, m4); });
  return m;
}
export const tiesto = (K, x, z, color = FT.pastoD) => { const g = new THREE.Group(); pon(g, K.malla(K.cilindro(0.09, 0.07, 0.12, 10), FT.hormigonD, O(0.002)), 0, 0.06, 0); pon(g, K.malla(K.esfera(0.12, 0.6), color, O(0.002)), 0, 0.17, 0); g.position.set(x, 0, z); return g; };
export function banco(K, largo = 0.7) {
  const g = new THREE.Group();
  pon(g, caja(K, largo, 0.035, 0.16, FT.maderaL, O(0.002)), 0, 0.16, 0);
  [-1, 1].forEach(l => pon(g, caja(K, 0.04, 0.15, 0.13, FT.hormigonD, O(0.0015)), l * (largo / 2 - 0.06), 0.075, 0));
  return g;
}
export function bici(K, color = '#c64a30') {
  const g = new THREE.Group();
  [-1, 1].forEach(l => { const r = pon(g, K.malla(K.toro(0.075, 0.01, Math.PI * 2, 0.5), '#2c2c2c', { sinTinta: true }), l * 0.12, 0.085, 0); r.rotation.y = 0; });
  const cuadro = pon(g, caja(K, 0.22, 0.015, 0.015, color, { sinTinta: true }), 0, 0.15, 0); cuadro.rotation.z = 0.15;
  pon(g, caja(K, 0.015, 0.09, 0.015, color, { sinTinta: true }), -0.05, 0.13, 0); pon(g, caja(K, 0.06, 0.012, 0.03, '#2c2c2c', { sinTinta: true }), -0.05, 0.18, 0);
  pon(g, caja(K, 0.015, 0.1, 0.015, color, { sinTinta: true }), 0.1, 0.14, 0); pon(g, caja(K, 0.012, 0.012, 0.09, '#2c2c2c', { sinTinta: true }), 0.1, 0.19, 0);
  return g;
}
/* un estante con libros (de colores, de alturas distintas) */
export function estante(K, w = 0.5, h = 0.5, semilla = 1) {
  const g = new THREE.Group(), r = azar(semilla);
  pon(g, caja(K, w, h, 0.14, FT.maderaD, O(0.002)), 0, h / 2, -0.01);
  for (let f = 0; f < 3; f++) { let x = -w / 2 + 0.04; while (x < w / 2 - 0.05) { const a = 0.025 + r() * 0.02, al = 0.09 + r() * 0.05; pon(g, caja(K, a, al, 0.1, FT.libro[Math.floor(r() * 5)], { sinTinta: true }), x + a / 2, 0.04 + f * (h / 3) + al / 2, 0.03); x += a + 0.004; } }
  return g;
}
/* el panel solar sobre su bastidor, inclinado hacia el sol */
export function panelSolar(K, w = 0.6, d = 0.36, incl = 0.45) {
  const g = new THREE.Group();
  const p = pon(g, K.malla(K.caja(w, 0.02, d), matRep(K, 'solar', texSolar(), w / 0.3, d / 0.3), O(0.002)), 0, 0.1, 0); p.rotation.x = -incl;
  [-1, 1].forEach(l => pon(g, caja(K, 0.02, 0.12, 0.02, FT.chapaG, { sinTinta: true }), l * (w / 2 - 0.05), 0.06, 0.06));
  return g;
}

/* ---------- EL CÍRCULO DE PIEDRAS DEL FOGÓN: el de la Época 1, que sigue donde estaba ---------- */
export function fogonViejo(K, { fuego = true, r = 0.55 } = {}) {
  const g = new THREE.Group(), rr = azar(1971);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + rr() * 0.1, p = K.malla(K.roca(0.11 + rr() * 0.04, 60 + i), i % 3 ? PAL.roca : PAL.rocaD, O(0.006));
    p.scale.set(1.2, 0.7, 1); p.position.set(Math.cos(a) * r, 0.05, Math.sin(a) * r); p.rotation.y = a; g.add(p);
  }
  pon(g, K.malla(K.cilindro(r * 0.72, r * 0.78, 0.02, 18), '#8f8270', { sinTinta: true, sombra: false }), 0, 0.01, 0);   // la ceniza
  [[0.3, 0.4], [-0.25, -0.6], [0.05, 1.7]].forEach(([d, a]) => { const l = pon(g, K.malla(K.cilindro(0.035, 0.035, 0.42, 6), '#7a5a3c', O(0.003)), Math.cos(a) * d * 0.4, 0.05, Math.sin(a) * d * 0.4); l.rotation.set(Math.PI / 2, a, 0.3); });
  if (fuego) {
    const f = new THREE.Group(); f.position.y = 0.08; f.userData.vivo = true; g.add(f); g.userData.llama = f;   // vivo: fundir no lo junta (sin tinta, se anima)
    pon(f, new THREE.Mesh(K.cono(0.13, 0.36, 7), new THREE.MeshBasicMaterial({ color: FT.fuego })), 0, 0.15, 0);
    pon(f, new THREE.Mesh(K.cono(0.07, 0.22, 6), new THREE.MeshBasicMaterial({ color: '#fff0c2' })), 0, 0.1, 0.02);
  }
  return g;
}

/* ---------- LA GENTE DE HOY (para medir y para los bocetos de la IA) ---------- */
export const GENTE_HOY = [
  { piel: 1, pelo: 'corto', colorPelo: '#3a2a20', colorRopa: '#4f7fb5', sinFlecos: true, pantalon: '#3d4f6e', zapato: '#f2f2f2' },
  { piel: 2, pelo: 'melena', colorPelo: '#2a1d16', colorRopa: '#e3a85c', sinFlecos: true, pantalon: '#55606e', zapato: '#7a4a2e' },
  { piel: 0, pelo: 'trenza', colorPelo: '#8a5a2e', colorRopa: '#5fb3a8', sinFlecos: true, pantalon: '#2f3e57', zapato: '#e9e2d4' },
  { piel: 3, pelo: 'rizos', colorPelo: '#1e1712', colorRopa: '#e39a92', sinFlecos: true, pantalon: '#4a4440', zapato: '#f2f2f2' },
  { piel: 1, pelo: 'revuelto', colorPelo: '#4a3426', colorRopa: '#8fbd5c', sinFlecos: true, pantalon: '#3d4f6e', zapato: '#2c2c2c' },
];

/* =====================================================================================================
   1 · EL HÉROE: la escuela
   ===================================================================================================== */
export function heroe(K, variante = VARIANTES.heroe) {
  return variante === 'colina' ? escuelaColina(K) : variante === 'arbol' ? escuelaArbol(K) : escuelaAnillo(K);
}

/* A · LA ESCUELA DE LA COLINA: una barra baja de madera y vidrio; el techo es pasto y del lado izquierdo baja hasta el
   suelo como una ladera (se sube caminando y se lee arriba); a la derecha, el segundo piso y la linterna de lectura */
function escuelaColina(K) {
  const g = new THREE.Group(), H = 0.75, W = 4.2, D = 1.4;
  pon(g, caja(K, W + 0.2, 0.05, D + 0.3, FT.hormigon, O(0.003)), 0.1, 0.025, 0.05);                       // el zócalo
  pon(g, tablas(K, W, H, D - 0.08), 0, 0.05 + H / 2, -0.04);                                               // la barra
  const fr = pon(g, muroVidrio(K, W - 0.5, H - 0.08, 0.3), 0.1, 0.05, D / 2 - 0.05);                         // el frente de vidrio
  pon(g, caja(K, 0.25, H - 0.05, 0.06, FT.maderaD, O(0.002)), -W / 2 + 0.12, 0.05 + H / 2, D / 2 - 0.04);
  // el techo de pasto y la ladera que baja hasta el suelo por la izquierda
  const techo = pon(g, K.malla(K.caja(W + 0.12, 0.07, D + 0.1), matRep(K, 'pasto', texPasto(), W * 1.5, D * 1.5), O(0.003)), 0, 0.05 + H + 0.035, 0);
  const lad = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(1.25, 0), new THREE.Vector2(1.25, H + 0.12), new THREE.Vector2(1.05, H + 0.12)]);
  const lgeo = propia(new THREE.ExtrudeGeometry(lad, { depth: D + 0.1, bevelEnabled: false })); lgeo.translate(0, 0, -(D + 0.1) / 2);
  pon(g, K.malla(lgeo, matRep(K, 'pasto', texPasto(), 2, 2), O(0.003)), -W / 2 - 1.25, 0, 0);
  // el segundo piso a la derecha, con su vidrio corrido y su alero de madera
  const X2 = 1.05, W2 = 2.1;
  pon(g, tablas(K, W2, H, D - 0.3), X2, 0.12 + H + H / 2, -0.12);
  pon(g, muroVidrio(K, W2 - 0.2, H - 0.1, 0.26), X2, 0.12 + H, D / 2 - 0.2);
  pon(g, K.malla(K.caja(W2 + 0.3, 0.06, D + 0.05), matRep(K, 'pasto', texPasto(), W2 * 1.5, D * 1.5), O(0.003)), X2, 0.12 + 2 * H + 0.03, -0.05);
  pon(g, caja(K, W2 + 0.34, 0.05, 0.08, FT.maderaD, O(0.002)), X2, 0.12 + 2 * H + 0.005, D / 2 - 0.02);
  // la linterna de lectura: una caja de vidrio arriba, con su mesa y su lámpara (de noche, se enciende)
  const lin = new THREE.Group(); lin.position.set(X2 + 0.35, 0.12 + 2 * H + 0.06, -0.1); g.add(lin);
  pon(lin, muroVidrio(K, 0.7, 0.55, 0.23), 0, 0, 0.3); pon(lin, muroVidrio(K, 0.7, 0.55, 0.23), 0, 0, -0.3);
  [-1, 1].forEach(l => { const m = pon(lin, muroVidrio(K, 0.6, 0.55, 0.2), l * 0.35, 0, 0); m.rotation.y = Math.PI / 2; });
  pon(lin, caja(K, 0.8, 0.05, 0.7, FT.maderaD, O(0.003)), 0, 0.58, 0);
  pon(lin, caja(K, 0.36, 0.03, 0.2, FT.maderaL, O(0.002)), 0, 0.22, 0); pon(lin, estante(K, 0.5, 0.36, 7), 0, 0, -0.22);
  const lampara = pon(lin, K.malla(K.esfera(0.05, 0.6), '#fff4d6', { emissive: '#ffd27a', emissiveIntensity: 0.6, sinTinta: true }), 0.1, 0.34, 0);
  g.userData.lampara = lampara;
  // la entrada: la pérgola, los tiestos, las bicis y un banco
  const per = new THREE.Group(); per.position.set(-0.6, 0.05, D / 2 + 0.35); g.add(per);
  [-0.35, 0.35].forEach(x => [-0.1, 0.25].forEach(z => pon(per, caja(K, 0.05, 0.6, 0.05, FT.maderaD, O(0.002)), x, 0.3, z)));
  for (let i = 0; i < 6; i++) pon(per, caja(K, 0.82, 0.03, 0.04, FT.maderaL, O(0.0015)), 0, 0.62, -0.12 + i * 0.08);
  [[-1.55, 1.05], [0.35, 1.0], [1.9, 0.98]].forEach(([x, z]) => g.add(tiesto(K, x, z)));
  [0, 1, 2].forEach(i => { const b = pon(g, bici(K, ['#c64a30', '#41709c', '#d9a441'][i]), 1.25 + i * 0.16, 0.05, D / 2 + 0.38); b.rotation.y = Math.PI / 2; });
  pon(g, banco(K, 0.8), -1.6, 0.05, D / 2 + 0.55);
  // matas en el techo y en la ladera
  const rr = azar(77), pts = [];
  for (let i = 0; i < 40; i++) pts.push([-W / 2 + rr() * W, 0.05 + H + 0.07, -D / 2 + rr() * D]);
  for (let i = 0; i < 18; i++) { const u = rr(); pts.push([-W / 2 - 1.2 + u * 1.15, u * (H + 0.1), -D / 2 + rr() * D]); }
  g.add(matas(K, pts));
  return g;
}

/* B · LA ESCUELA EN ANILLO: rodea el círculo de piedras del fogón y se abre hacia el valle (y hacia la cámara). Un piso de
   madera con el patio de vidrio; atrás, la biblioteca de dos pisos; el techo de pasto; dos pasos para entrar al patio */
export const sectorGeo = (r0, r1, a0, a1, h, n = 24) => {
  const pts = [];
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push(new THREE.Vector2(r1 * Math.cos(a), -r1 * Math.sin(a))); }
  for (let i = n; i >= 0; i--) { const a = a0 + (a1 - a0) * i / n; pts.push(new THREE.Vector2(r0 * Math.cos(a), -r0 * Math.sin(a))); }
  const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: h, bevelEnabled: false, curveSegments: 1 });
  geo.rotateX(-Math.PI / 2); return propia(geo);
};
export const deg = d => d * Math.PI / 180;
/* el constructor de la escuela en anillo, por partes (lo usan la hoja de bocetos y los saberes de la época, futuro/piezas.js):
   - tramos: los tramos de un piso que se construyen (grados del mundo, atan2(z, x)); el zócalo va del primero al último;
   - patio: el piso de tierra del patio; fogon: el círculo de piedras (en el juego ya está en el valle: la pieza no lo dibuja);
   - biblioteca: el segundo piso del fondo, con sus estantes; linterna: la caja de vidrio arriba, con su lámpara (vivo);
   - muebles: las mesas que se ven tras el vidrio (solo las de los tramos que hay); gradas: los bancos del patio;
   - arbol: el árbol joven del patio; entradas: los felpudos de los dos pasos; detalles: las bicis y las matas del techo;
   - soloTechos: las matas solo sobre los techos que hay (y también sobre la biblioteca); tiestos: los tiestos de afuera.
   Con las opciones por defecto es la escuela de la hoja de bocetos, tal cual */
export const ANILLO = { R: 2.3, r: 1.45, H: 0.75, TRAMOS: [[90, 142], [158, 292], [308, 360]], GRADAS: [[200, 0.95], [235, 0.95], [270, 0.95], [305, 0.95]],
  TIESTOS: [[144, 2.68], [156, 2.68], [294, 2.68], [306, 2.68], [118, 2.62], [334, 2.62], [205, 2.62], [255, 2.62]] };
export function escuelaAnillo(K, op = {}) {
  const { tramos: TRAMOS = ANILLO.TRAMOS, patio = true, fogon = true, biblioteca = true, linterna = true, muebles = true, gradas = true,
    arbol = true, entradas = true, detalles = true, soloTechos = false, tiestos = false } = op;
  const g = new THREE.Group(), { R, r, H } = ANILLO;
  const tangente = a => -a - Math.PI / 2;
  const enTramo = a => TRAMOS.some(([a0, a1]) => a >= a0 && a <= a1);
  const z0 = Math.min(...TRAMOS.map(t => t[0])), z1 = Math.max(...TRAMOS.map(t => t[1]));
  pon(g, K.malla(sectorGeo(r - 0.12, R + 0.18, deg(z0), deg(z1), 0.05, Math.max(8, Math.round((z1 - z0) / 270 * 40))), FT.hormigon, O(0.003)), 0, 0, 0);   // el zócalo
  if (patio) pon(g, K.malla(K.cilindro(r - 0.1, r - 0.1, 0.03, 32), '#d9cfb6', { sinTinta: true, sombra: false }), 0, 0.012, 0);   // el patio de tierra
  for (const [a0, a1] of TRAMOS) {
    const A0 = deg(a0), A1 = deg(a1), n = Math.ceil((a1 - a0) / 6);
    pon(g, K.malla(sectorGeo(r + 0.06, R, A0, A1, H, n), matRep(K, 'tablas', texTablas(), 10, 1.2), O(0.004)), 0, 0.05, 0);   // la madera de afuera
    // el vidrio del patio, con sus montantes
    const cv = new THREE.Mesh(propia(new THREE.CylinderGeometry(r, r, H - 0.06, n * 2, 1, true, Math.PI / 2 - A1, A1 - A0)), K.mat(FT.vidrio, { transparent: true, opacity: 0.38, depthWrite: false, side: THREE.DoubleSide }));
    cv.position.y = 0.05 + (H - 0.06) / 2; g.add(cv);
    for (let a = a0; a <= a1 + 0.1; a += (a1 - a0) / Math.round((a1 - a0) / 9)) { const t = deg(a); pon(g, caja(K, 0.03, H, 0.03, FT.marco, O(0.0015)), r * Math.cos(t), 0.05 + H / 2, r * Math.sin(t)); }
    // el techo de pasto con su borde de madera
    pon(g, K.malla(sectorGeo(r - 0.08, R + 0.1, A0, A1, 0.07, n), matRep(K, 'pasto', texPasto(), 6, 1), O(0.003)), 0, 0.05 + H, 0);
    // las ventanas de afuera, en bandas
    for (let a = a0 + 6; a < a1 - 4; a += 11) {
      const t = deg(a), v = pon(g, caja(K, 0.26, 0.32, 0.03, FT.vidrioD, O(0.0015)), (R + 0.01) * Math.cos(t), 0.05 + H * 0.55, (R + 0.01) * Math.sin(t)); v.rotation.y = tangente(t);
      const m = pon(g, caja(K, 0.3, 0.035, 0.05, FT.marco, O(0.0015)), (R + 0.02) * Math.cos(t), 0.05 + H * 0.55 - 0.18, (R + 0.02) * Math.sin(t)); m.rotation.y = tangente(t);
    }
    // las testas de cada tramo: de madera oscura
    [A0, A1].forEach(t => { const c = pon(g, caja(K, R - r + 0.14, H + 0.1, 0.07, FT.maderaD, O(0.003)), ((R + r) / 2) * Math.cos(t), 0.05 + (H + 0.1) / 2, ((R + r) / 2) * Math.sin(t)); c.rotation.y = -t; });
  }
  // la biblioteca: el segundo piso del fondo, con el vidrio corrido hacia el patio y la linterna
  const B0 = deg(180), B1 = deg(270), Y2 = 0.05 + H + 0.07;
  if (biblioteca) {
    pon(g, K.malla(sectorGeo(r + 0.25, R - 0.15, B0, B1, H, 16), matRep(K, 'tablas', texTablas(), 6, 1.2), O(0.004)), 0, Y2, 0);
    const cv2 = new THREE.Mesh(propia(new THREE.CylinderGeometry(r + 0.2, r + 0.2, H - 0.08, 24, 1, true, Math.PI / 2 - B1, B1 - B0)), K.mat(FT.vidrio, { transparent: true, opacity: 0.38, depthWrite: false, side: THREE.DoubleSide }));
    cv2.position.y = Y2 + (H - 0.08) / 2; g.add(cv2);
    for (let a = 180; a <= 270.1; a += 9) { const t = deg(a); pon(g, caja(K, 0.03, H, 0.03, FT.marco, O(0.0015)), (r + 0.2) * Math.cos(t), Y2 + H / 2, (r + 0.2) * Math.sin(t)); }
    pon(g, K.malla(sectorGeo(r + 0.1, R - 0.05, B0, B1, 0.07, 16), matRep(K, 'pasto', texPasto(), 4, 1), O(0.003)), 0, Y2 + H, 0);
    if (linterna) {
      const lt = deg(225), lin = new THREE.Group(); lin.position.set((r + R) / 2 * Math.cos(lt), Y2 + H + 0.07, (r + R) / 2 * Math.sin(lt)); lin.rotation.y = -lt + Math.PI / 2; g.add(lin);
      pon(lin, muroVidrio(K, 0.6, 0.45, 0.2), 0, 0, 0.25); pon(lin, muroVidrio(K, 0.6, 0.45, 0.2), 0, 0, -0.25);
      [-1, 1].forEach(l => { const m = pon(lin, muroVidrio(K, 0.5, 0.45, 0.25), l * 0.3, 0, 0); m.rotation.y = Math.PI / 2; });
      pon(lin, caja(K, 0.7, 0.05, 0.6, FT.maderaD, O(0.003)), 0, 0.48, 0);
      const lampara = pon(lin, K.malla(K.esfera(0.05, 0.6), '#fff4d6', { emissive: '#ffd27a', emissiveIntensity: 0.6, sinTinta: true }), 0, 0.3, 0);
      lampara.userData.vivo = true;   // fundir no la junta: la época la enciende de noche
      g.userData.lampara = lampara;
    }
    // adentro del vidrio, lo que se ve: los estantes con libros
    [200, 225, 250].forEach((a, i) => { const t = deg(a), e = pon(g, estante(K, 0.4, 0.42, 30 + i), (r + 0.42) * Math.cos(t), Y2, (r + 0.42) * Math.sin(t)); e.rotation.y = -t + Math.PI / 2; });
  }
  // y las mesas de la planta baja (las de los tramos que hay)
  if (muebles) [110, 130, 175, 205, 240, 280, 330, 350].filter(enTramo).forEach(a => { const t = deg(a), m = pon(g, caja(K, 0.3, 0.03, 0.18, FT.maderaL, { sinTinta: true }), (r + 0.3) * Math.cos(t), 0.05 + 0.25, (r + 0.3) * Math.sin(t)); m.rotation.y = -t + Math.PI / 2; });
  // el patio: el círculo de piedras del fogón, las gradas de madera en medialuna y un árbol joven
  if (fogon) g.add(fogonViejo(K));
  if (gradas) ANILLO.GRADAS.forEach(([a, d]) => { const t = deg(a), b = pon(g, banco(K, 0.5), d * Math.cos(t), 0.02, d * Math.sin(t)); b.rotation.y = -t + Math.PI / 2; });
  if (arbol) {
    const ar = new THREE.Group(); ar.position.set(-0.75, 0, 0.6); g.add(ar);
    pon(ar, K.malla(K.cilindro(0.04, 0.06, 0.6, 6), PAL.troncoL, O(0.003)), 0, 0.3, 0);
    [[0.28, FT.pastoD, 0, 0.7, 0], [0.22, FT.pasto, 0.08, 0.88, 0.04], [0.16, FT.pastoL, -0.05, 1.02, 0.02]].forEach(([rr, c, x, y, z]) => pon(ar, K.malla(K.esfera(rr, 0.7), c, O(0.004)), x, y, z));
  }
  // las dos entradas (pasos al patio) con su felpudo, y las bicis afuera
  if (entradas) [150, 300].forEach(a => { const t = deg(a); pon(g, K.malla(K.caja(0.4, 0.012, 0.25), '#b98e5c', { sinTinta: true, sombra: false }), (R + 0.3) * Math.cos(t), 0.006, (R + 0.3) * Math.sin(t)).rotation.y = -t; });
  if (detalles) [0, 1, 2, 3].forEach(i => { const t = deg(320 + i * 6), b = pon(g, bici(K, ['#c64a30', '#41709c', '#d9a441', '#5f9a6a'][i]), (R + 0.32) * Math.cos(t), 0, (R + 0.32) * Math.sin(t)); b.rotation.y = -t; });
  // los tiestos de afuera, junto a los pasos y a las ventanas
  if (tiestos) ANILLO.TIESTOS.forEach(([a, d], i) => { const t = deg(a); g.add(tiesto(K, d * Math.cos(t), d * Math.sin(t), [FT.pastoD, FT.pasto, '#5f9a6a'][i % 3])); });
  // las matas del techo
  if (detalles) {
    const rr = azar(88), pts = [];
    for (let i = 0; i < 70; i++) {
      const ad = 90 + rr() * 270, a = deg(ad), d = r + rr() * (R - r);
      if (soloTechos && (!enTramo(ad) || (biblioteca && ad > 182 && ad < 268 && d > r + 0.06))) continue;   // sin matas en el aire ni adentro de la biblioteca
      pts.push([d * Math.cos(a), 0.05 + H + 0.07, d * Math.sin(a)]);
    }
    if (soloTechos && biblioteca) for (let i = 0; i < 30; i++) {   // y sobre la biblioteca, sin meterse en la linterna
      const ad = 184 + rr() * 82, a = deg(ad), d = r + 0.14 + rr() * (R - r - 0.22);
      if (!(linterna && Math.abs(ad - 225) < 12 && Math.abs(d - (r + R) / 2) < 0.34)) pts.push([d * Math.cos(a), Y2 + H + 0.07, d * Math.sin(a)]);
    }
    g.add(matas(K, pts));
  }
  return g;
}

/* C · LA ESCUELA BAJO EL GRAN ÁRBOL: un árbol viejo y enorme cuya copa cubre el círculo de piedras; debajo, las gradas, el
   pizarrón y la caseta de los libros (de madera y vidrio). Se enseña al aire libre, como en el principio */
function escuelaArbol(K) {
  const g = new THREE.Group(), rr = azar(4040);
  // el tronco con sus raíces y las ramas
  pon(g, K.malla(K.cilindro(0.3, 0.45, 2.0, 10), PAL.troncoL, O(0.006)), 0, 1.0, 0);
  for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3, m = pon(g, K.malla(K.cono(0.16, 0.7, 6), PAL.troncoL, O(0.004)), Math.cos(a) * 0.38, 0.12, Math.sin(a) * 0.38); m.rotation.set(Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2); }
  [[0.9, 1.9, 0.4, 0.9], [-0.8, 2.0, -0.3, 0.85], [0.2, 2.1, -0.9, 0.8], [-0.3, 2.0, 0.85, 0.75]].forEach(([x, y, z, l]) => {
    const rama = pon(g, K.malla(K.cilindro(0.08, 0.15, l * 1.4, 6), PAL.troncoL, O(0.004)), x * 0.5, y - 0.2, z * 0.5);
    rama.lookAt(x * 2, y + 0.8, z * 2); rama.rotateX(Math.PI / 2);
  });
  // la copa: nubes de hojas en tres verdes
  for (let i = 0; i < 16; i++) {
    const a = rr() * Math.PI * 2, d = 0.4 + rr() * 1.45, y = 2.35 + rr() * 0.9 - d * 0.25, s = 0.55 + rr() * 0.45;
    pon(g, K.malla(K.esfera(s, 0.8), [PAL.copaD, PAL.copaM, PAL.copaL][i % 3], O(0.008)), Math.cos(a) * d, y, Math.sin(a) * d);
  }
  // el columpio de una rama
  const col = new THREE.Group(); col.position.set(1.15, 0, 0.75); g.add(col);
  [-0.12, 0.12].forEach(x => pon(col, caja(K, 0.012, 1.6, 0.012, '#6b5a48', { sinTinta: true }), x, 1.05, 0));
  pon(col, caja(K, 0.3, 0.03, 0.12, FT.maderaL, O(0.002)), 0, 0.25, 0);
  // el círculo de piedras, las gradas de troncos y el pizarrón
  const f = pon(g, fogonViejo(K, { fuego: false }), 0.15, 0, 1.2);
  for (let i = 0; i < 7; i++) { const a = Math.PI * (0.05 + i * 0.13), d = 2.0, t = pon(g, K.malla(K.cilindro(0.09, 0.09, 0.42, 8), '#a07850', O(0.003)), Math.cos(a) * d * 0.9 + 0.15, 0.09, Math.sin(a) * d * 0.8 + 0.4); t.rotation.set(Math.PI / 2, 0, a); }
  const piz = new THREE.Group(); piz.position.set(-1.35, 0, 0.6); piz.rotation.y = 0.9; g.add(piz);
  [-1, 1].forEach(l => { const p = pon(piz, caja(K, 0.03, 0.8, 0.03, FT.maderaD, O(0.002)), l * 0.3, 0.4, 0); p.rotation.z = l * 0.08; });
  pon(piz, caja(K, 0.6, 0.42, 0.03, '#2f4a3f', O(0.003)), 0, 0.6, 0.02);
  pon(piz, caja(K, 0.4, 0.008, 0.008, '#f2f2f2', { sinTinta: true }), -0.02, 0.66, 0.04); pon(piz, caja(K, 0.25, 0.008, 0.008, '#f2f2f2', { sinTinta: true }), -0.08, 0.58, 0.04);
  // la caseta de los libros, de madera y vidrio
  const cas = new THREE.Group(); cas.position.set(-1.7, 0, -1.0); cas.rotation.y = 0.6; g.add(cas);
  pon(cas, tablas(K, 0.9, 0.7, 0.6), 0, 0.35, -0.05); pon(cas, muroVidrio(K, 0.7, 0.62, 0.23), 0, 0, 0.26);
  const tc = pon(cas, caja(K, 1.05, 0.05, 0.85, FT.chapaV, O(0.003)), 0, 0.74, 0); tc.rotation.x = 0.12;
  pon(cas, estante(K, 0.6, 0.5, 51), 0, 0.02, 0.12);
  pon(g, banco(K, 0.7), 1.6, 0, -0.5).rotation.y = 1.2;
  return g;
}

/* =====================================================================================================
   2 · CÓMO SE VE LA IA
   ===================================================================================================== */
/* A · LA CHISPA AZUL: una llamita fría que flota junto a cada estudiante. Cuando pregunta, lleva su «?»; cuando
   responde, su «!». Se anima con userData.anim(t) */
export function chispa(K, signo = '') {
  const g = new THREE.Group(), semilla = Math.random() * 10;
  const nucleo = new THREE.Mesh(K.esfera(0.035, 0.6), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  const halo = new THREE.Mesh(K.esfera(0.075, 0.7), new THREE.MeshBasicMaterial({ color: FT.chispa, transparent: true, opacity: 0.45, depthWrite: false }));
  const llama = new THREE.Mesh(K.cono(0.05, 0.14, 8), new THREE.MeshBasicMaterial({ color: '#cfeeff', transparent: true, opacity: 0.8, depthWrite: false }));
  llama.position.y = 0.07; g.add(halo, nucleo, llama);
  const chispas = [0, 1, 2, 3].map(i => { const c = new THREE.Mesh(K.esfera(0.012, 0.4), new THREE.MeshBasicMaterial({ color: '#e8f8ff' })); g.add(c); return c; });
  let sg = null;
  if (signo) { sg = new THREE.Sprite(new THREE.SpriteMaterial({ map: texSigno(signo), depthTest: false })); sg.scale.set(0.17, 0.17, 1); sg.position.y = 0.21; sg.renderOrder = 5; g.add(sg); }
  g.userData.anim = t => {
    const y = 0.03 * Math.sin(t * 2.2 + semilla); nucleo.position.y = halo.position.y = y; llama.position.y = 0.07 + y; llama.scale.y = 1 + 0.18 * Math.sin(t * 9 + semilla);
    halo.scale.setScalar(1 + 0.12 * Math.sin(t * 5 + semilla));
    chispas.forEach((c, i) => { const a = t * 1.6 + i * Math.PI / 2 + semilla; c.position.set(Math.cos(a) * 0.12, y + 0.02 * Math.sin(a * 2), Math.sin(a) * 0.12); });
    if (sg) sg.position.y = 0.2 + y;
  };
  g.scale.setScalar(1.6); g.userData.anim(0); g.userData.vivo = true;
  return g;
}
/* B · LA PANTALLA: una tableta o un portátil con la pantalla encendida */
export function pantalla(K, tipo = 'portatil') {
  const g = new THREE.Group(), luz = new THREE.MeshBasicMaterial({ color: '#bfe4ff' });
  if (tipo === 'portatil') {
    pon(g, caja(K, 0.2, 0.012, 0.14, '#9aa3a8', O(0.001)), 0, 0.006, 0);
    const tapa = new THREE.Group(); tapa.position.set(0, 0.012, -0.07); tapa.rotation.x = -0.35; g.add(tapa);
    pon(tapa, caja(K, 0.2, 0.13, 0.01, '#9aa3a8', O(0.001)), 0, 0.065, 0);
    pon(tapa, new THREE.Mesh(K.caja(0.18, 0.11, 0.002), luz), 0, 0.065, 0.006).userData.vivo = true;
  } else {
    const t = pon(g, caja(K, 0.12, 0.17, 0.012, '#2c2c2c', O(0.001)), 0, 0.09, 0); t.rotation.x = -0.3;
    pon(t, new THREE.Mesh(K.caja(0.1, 0.15, 0.002), luz), 0, 0, 0.007).userData.vivo = true;
  }
  return g;
}
/* C · LOS HILOS DE LUZ: un poste con su farol azul y los hilos que bajan a cada estudiante */
export function hilo(K, a, b, alto = 0.5) {
  const m = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5); m.y += alto;
  const curva = new THREE.QuadraticBezierCurve3(a, m, b);
  return new THREE.Mesh(propia(new THREE.TubeGeometry(curva, 24, 0.008, 5, false)), new THREE.MeshBasicMaterial({ color: FT.chispa, transparent: true, opacity: 0.85 }));
}
export function farolRed(K) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.03, 0.045, 1.6, 8), '#7d858b', O(0.003)), 0, 0.8, 0);
  pon(g, K.malla(K.cilindro(0.12, 0.14, 0.04, 10), '#7d858b', O(0.002)), 0, 0.02, 0);
  pon(g, new THREE.Mesh(K.esfera(0.11, 0.8), new THREE.MeshBasicMaterial({ color: '#d9f3ff' })), 0, 1.7, 0).userData.vivo = true;
  pon(g, new THREE.Mesh(K.esfera(0.19, 0.8), new THREE.MeshBasicMaterial({ color: FT.chispa, transparent: true, opacity: 0.35, depthWrite: false })), 0, 1.7, 0);
  return g;
}

/* =====================================================================================================
   3 · LAS CASAS
   ===================================================================================================== */
export function barrio(K, variante = VARIANTES.casas) {
  return variante === 'madera' ? casasMadera(K) : variante === 'colores' ? casasColores(K) : casasRedondas(K);
}
/* un techo a dos aguas de chapa ondulada (con sus canaletas pintadas) */
function techoChapa(K, w, d, alto, color) {
  const g = new THREE.Group(), lado = Math.hypot(d / 2 + 0.06, alto), ang = Math.atan2(alto, d / 2 + 0.06);
  const tex = textura('ft-chapa' + color, 32, 32, (c, W, H) => { c.fillStyle = color; c.fillRect(0, 0, W, H); for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(i * 4, 0, 2, H); } }, { repetir: true });
  [-1, 1].forEach(l => { const p = pon(g, K.malla(K.caja(w + 0.12, 0.025, lado), matRep(K, 'chapa' + color, tex, w * 3, 1), O(0.003)), 0, alto / 2, l * (d / 4 + 0.03)); p.rotation.x = l * ang; });
  const fr = new THREE.Shape([new THREE.Vector2(-d / 2, 0), new THREE.Vector2(d / 2, 0), new THREE.Vector2(0, alto)]);
  [-1, 1].forEach(l => { const m = pon(g, K.malla(propia(new THREE.ShapeGeometry(fr)), K.mat('#f1e6cf', { side: THREE.DoubleSide }), { sinTinta: true }), l * w / 2, 0, 0); m.rotation.y = Math.PI / 2; });
  return g;
}
function ventana(K, w = 0.18, h = 0.22, marco = FT.marco) {
  const g = new THREE.Group(); pon(g, caja(K, w + 0.04, h + 0.04, 0.02, marco, O(0.0015)), 0, 0, 0); pon(g, caja(K, w, h, 0.025, FT.vidrioD, { sinTinta: true }), 0, 0, 0.002);
  pon(g, caja(K, 0.012, h, 0.03, marco, { sinTinta: true }), 0, 0, 0.004); return g;
}
/* A · LAS DE MADERA Y CHAPA del campo: con su galería, su tanque de agua, el panel solar y la huerta */
function casasMadera(K) {
  const g = new THREE.Group();
  const casa = (x, z, w, d, pared, techo, ry, extras = {}) => {
    const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c);
    pon(c, caja(K, w + 0.06, 0.08, d + 0.06, FT.hormigonD, O(0.002)), 0, 0.04, 0);
    pon(c, pared === 'tablas' ? tablas(K, w, 0.6, d) : caja(K, w, 0.6, d, pared, O(0.004)), 0, 0.38, 0);
    pon(c, techoChapa(K, w, d, 0.32, techo), 0, 0.68, 0);
    pon(c, caja(K, 0.16, 0.36, 0.03, FT.maderaD, O(0.002)), w * 0.18, 0.26, d / 2 + 0.005);
    pon(c, ventana(K), -w * 0.22, 0.42, d / 2 + 0.01);
    if (extras.galeria) { [-1, 1].forEach(l => pon(c, caja(K, 0.04, 0.6, 0.04, FT.maderaL, O(0.002)), l * (w / 2 - 0.05), 0.38, d / 2 + 0.3)); const t = pon(c, caja(K, w + 0.06, 0.03, 0.36, techo, O(0.002)), 0, 0.7, d / 2 + 0.17); t.rotation.x = 0.12; pon(c, banco(K, 0.45), -0.1, 0.08, d / 2 + 0.2); }
    if (extras.solar) { const p = pon(c, panelSolar(K, w * 0.6, 0.3, 0.3), 0, 0.8, -d / 4 - 0.02); p.rotation.y = Math.PI; }
    if (extras.tanque) { const tq = new THREE.Group(); tq.position.set(w / 2 + 0.22, 0, -d / 4); c.add(tq); [-1, 1].forEach(l => [-1, 1].forEach(m => pon(tq, caja(K, 0.025, 0.55, 0.025, FT.maderaD, { sinTinta: true }), l * 0.09, 0.275, m * 0.09))); pon(tq, K.malla(K.cilindro(0.13, 0.13, 0.26, 12), '#2f5d8a', O(0.003)), 0, 0.68, 0); }
    return c;
  };
  casa(-1.2, -0.2, 1.1, 0.8, '#f3ead6', FT.chapaR, 0.15, { galeria: true, solar: true });
  casa(0.45, -0.55, 0.9, 0.7, '#cfe0d9', FT.chapaV, -0.1, { tanque: true });
  casa(1.55, 0.35, 0.8, 0.7, 'tablas', FT.chapaG, 0.25, { solar: true });
  // la huerta con sus surcos y la cerca
  const h = new THREE.Group(); h.position.set(0.2, 0, 0.85); g.add(h);
  for (let i = 0; i < 4; i++) { pon(h, K.malla(K.caja(0.9, 0.05, 0.12), '#8a6a48', { sinTinta: true }), 0, 0.025, -0.25 + i * 0.17); for (let j = 0; j < 6; j++) pon(h, K.malla(K.esfera(0.05, 0.5), j % 2 ? FT.pastoD : FT.pasto, { sinTinta: true }), -0.38 + j * 0.15, 0.07, -0.25 + i * 0.17); }
  for (let i = 0; i < 8; i++) pon(h, caja(K, 0.025, 0.22, 0.025, FT.maderaD, { sinTinta: true }), -0.55 + i * 0.16, 0.11, 0.42);
  pon(h, caja(K, 1.15, 0.02, 0.015, FT.maderaD, { sinTinta: true }), 0.01, 0.17, 0.42);
  return g;
}
/* B · LAS DE COLORES del pueblo: de bloque, con la azotea plana, el tanque negro y la reja; y el almacén con su toldo */
function casasColores(K) {
  const g = new THREE.Group();
  const casa = (x, z, w, d, h, color, ry, extras = {}) => {
    const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c);
    pon(c, caja(K, w, h, d, color, O(0.004)), 0, h / 2, 0);
    pon(c, caja(K, w + 0.04, 0.06, d + 0.04, FT.crema, O(0.002)), 0, h + 0.03, 0);
    pon(c, caja(K, 0.17, 0.36, 0.03, extras.puerta || '#6b4a32', O(0.002)), w * 0.2, 0.18, d / 2 + 0.005);
    pon(c, ventana(K, 0.2, 0.2, '#f1e6cf'), -w * 0.2, h * 0.55, d / 2 + 0.01);
    for (let i = 0; i < 5; i++) pon(c, caja(K, 0.008, 0.2, 0.008, '#3a3a3a', { sinTinta: true }), -w * 0.2 - 0.08 + i * 0.04, h * 0.55, d / 2 + 0.025);   // la reja
    if (extras.tanque) pon(c, K.malla(K.cilindro(0.11, 0.12, 0.22, 12), '#2c2c2c', O(0.003)), w / 4, h + 0.17, -d / 4);
    if (extras.piso2) { pon(c, caja(K, w * 0.55, h * 0.8, d * 0.7, extras.piso2, O(0.004)), -w * 0.2, h + h * 0.4, -d * 0.1); pon(c, ventana(K, 0.16, 0.16, '#f1e6cf'), -w * 0.2, h * 1.45, d * 0.25 + 0.01); }
    if (extras.toldo) { const t = pon(c, caja(K, w * 0.9, 0.025, 0.3, '#c64a30', O(0.002)), 0, h * 0.78, d / 2 + 0.14); t.rotation.x = 0.35; pon(c, caja(K, w * 0.6, 0.12, 0.02, '#f6efe0', O(0.0015)), 0, h * 0.92, d / 2 + 0.012); }
    return c;
  };
  casa(-1.3, -0.3, 0.9, 0.8, 0.7, FT.ocre, 0.12, { tanque: true });
  casa(-0.25, -0.45, 0.85, 0.75, 0.7, FT.turquesa, 0.05, { piso2: FT.crema, tanque: true });
  casa(0.8, -0.2, 0.9, 0.8, 0.72, FT.rosa, -0.08, { toldo: true });
  casa(1.65, 0.45, 0.7, 0.7, 0.66, FT.celeste, -0.25, { tanque: true });
  // la vereda y un árbol de la plaza
  pon(g, K.malla(K.caja(4.2, 0.03, 0.3), FT.hormigon, O(0.002)), 0.15, 0.015, 0.45);
  const ar = new THREE.Group(); ar.position.set(0.15, 0, 0.95); g.add(ar);
  pon(ar, K.malla(K.cilindro(0.04, 0.06, 0.6, 6), PAL.troncoL, O(0.003)), 0, 0.3, 0);
  [[0.3, PAL.copaD, 0, 0.75, 0], [0.24, PAL.copaM, 0.1, 0.92, 0.05]].forEach(([rr, c, x, y, z]) => pon(ar, K.malla(K.esfera(rr, 0.7), c, O(0.004)), x, y, z));
  return g;
}
/* C · LAS REDONDAS DE TIERRA con el techo de pasto: la rima con las chozas de la aldea, diez mil años después. Con sus
   ventanas redondas, la puerta de madera, el panel solar y el molinito de viento */
function casasRedondas(K) {
  const g = new THREE.Group();
  const casa = (x, z, r, h, ry, extras = {}) => {
    const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c);
    const rb = azar(Math.round(x * 100 + z * 7));
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, p = K.malla(K.roca(0.07, 80 + i), i % 2 ? PAL.roca : PAL.rocaD, { grosor: 0.002 }); p.scale.set(1.3, 0.8, 1); p.position.set(Math.cos(a) * (r + 0.02), 0.04, Math.sin(a) * (r + 0.02)); c.add(p); }   // el zócalo de piedras
    pon(c, K.malla(K.cilindro(r, r * 1.03, h, 22), matRep(K, 'tierra', texTierra(), r * 6, h * 2), O(0.004)), 0, 0.05 + h / 2, 0);
    pon(c, K.malla(K.toro(r + 0.02, 0.035, Math.PI * 2, 0.6), FT.maderaD, { grosor: 0.002 }), 0, 0.05 + h, 0).rotation.x = Math.PI / 2;   // la viga de borde
    const cup = pon(c, K.malla(propia(new THREE.SphereGeometry(r + 0.08, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2)), matRep(K, 'pasto', texPasto(), r * 4, 2), O(0.004)), 0, 0.05 + h + 0.01, 0);
    cup.scale.y = 0.42;
    // la claraboya de vidrio arriba
    pon(c, K.malla(K.cilindro(r * 0.28, r * 0.3, 0.06, 14), FT.maderaD, O(0.002)), 0, 0.05 + h + (r + 0.08) * 0.42 - 0.01, 0);
    pon(c, K.malla(K.esfera(r * 0.26, 0.6), FT.vidrio, { transparent: true, opacity: 0.6, depthWrite: false, grosor: 0.002 }), 0, 0.05 + h + (r + 0.08) * 0.42 + 0.02, 0).scale.y = 0.5;
    // la puerta (mira a +z) con su alero y dos postes, y las ventanas redondas de marco blanco
    pon(c, caja(K, 0.2, 0.38, 0.05, FT.maderaD, O(0.002)), 0, 0.24, r + 0.005);
    pon(c, K.malla(K.esfera(0.012, 0.4), '#e0b44a', { sinTinta: true }), 0.06, 0.24, r + 0.04);
    const al = pon(c, caja(K, 0.42, 0.03, 0.28, FT.madera, O(0.002)), 0, 0.5, r + 0.1); al.rotation.x = 0.18;
    [-1, 1].forEach(l => pon(c, caja(K, 0.03, 0.48, 0.03, FT.maderaD, { grosor: 0.0015 }), l * 0.18, 0.25, r + 0.22));
    [-1.0, 1.0, 2.5].forEach(a => { const v = new THREE.Group(); v.position.set(Math.sin(a) * (r + 0.005), 0.05 + h * 0.58, Math.cos(a) * (r + 0.005)); v.rotation.y = a; c.add(v);
      pon(v, K.malla(K.cilindro(0.1, 0.1, 0.03, 14), FT.marco, { grosor: 0.0015 }), 0, 0, 0).rotation.x = Math.PI / 2;
      pon(v, K.malla(K.cilindro(0.078, 0.078, 0.035, 14), FT.vidrioD, { sinTinta: true }), 0, 0, 0.004).rotation.x = Math.PI / 2;
      pon(v, caja(K, 0.15, 0.012, 0.012, FT.marco, { sinTinta: true }), 0, 0, 0.024); });
    if (extras.solar) { const p = pon(c, panelSolar(K, 0.38, 0.24, 0.45), -r * 0.45, 0.05 + h + 0.08, -r * 0.35); p.rotation.y = 0.4; }
    if (extras.chimenea) { pon(c, K.malla(K.cilindro(0.03, 0.03, 0.34, 8), '#9aa3a8', O(0.002)), r * 0.5, 0.05 + h + 0.12, -r * 0.35); pon(c, K.malla(K.cono(0.06, 0.05, 8), '#9aa3a8', O(0.0015)), r * 0.5, 0.05 + h + 0.31, -r * 0.35); }
    if (extras.lena) for (let i = 0; i < 5; i++) pon(c, K.malla(K.cilindro(0.025, 0.025, 0.26, 6), '#8a6a48', { grosor: 0.0015 }), r * 0.75 + (i % 3) * 0.055, 0.03 + Math.floor(i / 3) * 0.05, r * 0.55).rotation.x = Math.PI / 2;
    return c;
  };
  casa(-1.25, -0.35, 0.48, 0.6, 0.35, { solar: true, lena: true });
  casa(0.25, -0.5, 0.58, 0.66, 0.1, { chimenea: true });
  casa(1.55, 0.2, 0.42, 0.56, 0.55, { solar: true });
  // el molinito de viento
  const mo = new THREE.Group(); mo.position.set(-0.45, 0, 0.55); g.add(mo);
  pon(mo, K.malla(K.cilindro(0.02, 0.035, 1.3, 6), '#c9cdd0', O(0.002)), 0, 0.65, 0);
  pon(mo, caja(K, 0.06, 0.06, 0.12, '#e8ebed', O(0.0015)), 0, 1.32, 0);
  const aspas = new THREE.Group(); aspas.position.set(0, 1.32, 0.08); mo.add(aspas); mo.userData.aspas = aspas;
  for (let i = 0; i < 3; i++) { const piv = new THREE.Group(); piv.rotation.z = i * Math.PI * 2 / 3; aspas.add(piv); pon(piv, caja(K, 0.035, 0.42, 0.01, '#f4f6f7', O(0.0015)), 0, 0.21, 0); }
  // la huerta en espiral
  const h = new THREE.Group(); h.position.set(0.8, 0, 0.75); g.add(h);
  for (let i = 0; i < 14; i++) { const a = i * 0.55, d = 0.08 + i * 0.022; pon(h, K.malla(K.esfera(0.055, 0.5), i % 3 ? FT.pastoD : '#d9a441', { sinTinta: true }), Math.cos(a) * d, 0.05, Math.sin(a) * d); }
  pon(h, K.malla(K.cilindro(0.38, 0.4, 0.05, 16), '#8a6a48', { sinTinta: true }), 0, 0.02, 0);
  return g;
}

/* ---------- LA NIEBLA: lo que todavía no sabemos, en los bordes del tablero ---------- */
export function niebla(K, puntos, semilla = 9) {
  const g = new THREE.Group(), r = azar(semilla);
  const mat = new THREE.MeshBasicMaterial({ color: '#f7f6f2', transparent: true, opacity: 0.5, depthWrite: false });
  for (const [x, z, s] of puntos) for (let k = 0; k < 3; k++) {
    const m = new THREE.Mesh(K.esfera(1, 0.7), mat); m.scale.set(s * (0.8 + r() * 0.5), s * (0.32 + r() * 0.2), s * (0.8 + r() * 0.5));
    m.position.set(x + (r() - 0.5) * s, s * 0.15 + r() * s * 0.2, z + (r() - 0.5) * s); m.renderOrder = 3; g.add(m);
  }
  g.userData.vivo = true;
  return g;
}

/* =====================================================================================================
   4 · EL PAISAJE DEL VALLE DE HOY: la pasarela de la cueva, el pabellón, el muelle y los caminos
   ===================================================================================================== */
/* la pasarela de tablas sobre pilotes, con sus barandas: lleva a la boca de la cueva sin pisar el suelo del sitio */
export function pasarela(K, puntos, ancho = 0.42) {
  const g = new THREE.Group(), tablas = [], postes = [];
  for (let i = 0; i < puntos.length - 1; i++) {
    const [ax, az] = puntos[i], [bx, bz] = puntos[i + 1], L = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bx - ax, bz - az), n = Math.ceil(L / 0.12);
    for (let k = 0; k < n; k++) { const u = (k + 0.5) / n; tablas.push([ax + (bx - ax) * u, az + (bz - az) * u, ry]); }
    for (let k = 0; k <= Math.ceil(L / 0.6); k++) { const u = Math.min(1, k * 0.6 / L); [-1, 1].forEach(l => postes.push([ax + (bx - ax) * u + Math.cos(ry) * l * ancho / 2, az + (bz - az) * u - Math.sin(ry) * l * ancho / 2])); }
    [-1, 1].forEach(l => { const b = pon(g, caja(K, 0.025, 0.025, L, FT.maderaD, { sinTinta: true }), (ax + bx) / 2 + Math.cos(ry) * l * ancho / 2, 0.36, (az + bz) / 2 - Math.sin(ry) * l * ancho / 2); b.rotation.y = ry; });
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1), Yv = new THREE.Vector3(0, 1, 0);
  const mt = K.instancias(K.caja(ancho, 0.03, 0.1), FT.maderaL, tablas.length, { grosor: 0.002 });
  tablas.forEach(([x, z, ry], i) => { q.setFromAxisAngle(Yv, ry); m4.compose(v.set(x, 0.14, z), q, s); mt.setMatrixAt(i, m4); }); g.add(mt);
  const mp = K.instancias(K.caja(0.035, 0.38, 0.035), FT.maderaD, postes.length, { sinTinta: true });
  postes.forEach(([x, z], i) => { m4.compose(v.set(x, 0.19, z), q.identity(), s); mp.setMatrixAt(i, m4); }); g.add(mp);
  return g;
}
/* el pabellón de la cueva: la caja de vidrio donde se cuenta lo que hay adentro (y se ve la réplica de una pintura) */
export function pabellon(K, { cartel: dondeCartel = null } = {}) {   // cartel: [x, z] para mover el cartel (por defecto, adelante a la derecha)
  const g = new THREE.Group(), W = 1.3, D = 0.85, H = 0.62;
  pon(g, caja(K, W + 0.2, 0.06, D + 0.2, FT.hormigon, O(0.003)), 0, 0.03, 0);
  pon(g, muroVidrio(K, W, H, 0.26), 0, 0.06, D / 2); pon(g, tablas(K, W, H, 0.06), 0, 0.06 + H / 2, -D / 2 + 0.03);
  [-1, 1].forEach(l => { const m = pon(g, muroVidrio(K, D, H, 0.28), l * W / 2, 0.06, 0); m.rotation.y = Math.PI / 2; });
  pon(g, caja(K, W + 0.45, 0.06, D + 0.4, FT.maderaD, O(0.003)), 0, 0.06 + H + 0.03, 0.05);
  // adentro: el panel con la réplica del uro y las manos, y una vitrina
  const tx = textura('ft-pintura', 96, 64, (c, w, h) => { c.fillStyle = '#d8c4a0'; c.fillRect(0, 0, w, h); c.fillStyle = '#8a3a22'; c.beginPath(); c.ellipse(46, 34, 24, 11, 0, 0, Math.PI * 2); c.fill(); c.fillRect(30, 40, 4, 14); c.fillRect(58, 40, 4, 14); c.beginPath(); c.moveTo(66, 26); c.lineTo(80, 14); c.lineTo(74, 30); c.fill(); c.fillStyle = '#5a3a2a'; [[12, 14], [84, 46]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.fill(); }); });
  const pin = pon(g, new THREE.Mesh(propia(new THREE.PlaneGeometry(0.6, 0.4)), K.matMapa(tx)), -0.15, 0.06 + 0.36, -D / 2 + 0.07);
  pon(g, caja(K, 0.3, 0.3, 0.22, FT.vidrio, { transparent: true, opacity: 0.5, depthWrite: false }), 0.35, 0.06 + 0.15, 0);
  pon(g, caja(K, 0.12, 0.05, 0.08, '#efe8d4', O(0.001)), 0.35, 0.06 + 0.32, 0);
  // el cartel
  const cartel = new THREE.Group(), [cx, cz] = dondeCartel || [W / 2 + 0.35, D / 2 + 0.25]; cartel.position.set(cx, 0, cz); g.add(cartel);
  pon(cartel, caja(K, 0.03, 0.4, 0.03, FT.maderaD, O(0.0015)), 0, 0.2, 0);
  const tc = textura('ft-cartel-cueva', 128, 48, (c, w, h) => { c.fillStyle = '#4b5d43'; c.fillRect(0, 0, w, h); c.fillStyle = '#f3efe6'; c.font = '700 18px "Avenir Next", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('la cueva pintada', w / 2, h / 2 - 7); c.font = '500 12px "Avenir Next", sans-serif'; c.fillText('hace 20.000 años', w / 2, h / 2 + 11); });
  pon(cartel, new THREE.Mesh(propia(new THREE.PlaneGeometry(0.42, 0.16)), K.matMapa(tc)), 0, 0.4, 0.02);
  return g;
}
/* el muelle de la laguna con su canoa */
export function muelle(K, largo = 1.2) {
  const g = new THREE.Group();
  for (let i = 0; i < Math.round(largo / 0.1); i++) pon(g, caja(K, 0.42, 0.03, 0.085, i % 3 ? FT.maderaL : FT.madera, { grosor: 0.0015 }), 0, 0.06, i * 0.1);
  for (let i = 0; i <= Math.round(largo / 0.4); i++) [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(0.025, 0.025, 0.45, 6), FT.maderaD, { sinTinta: true }), l * 0.19, -0.12, i * 0.4));
  const ca = new THREE.Group(); ca.position.set(0.42, -0.07, largo * 0.7); g.add(ca);
  const casco = pon(ca, K.malla(K.capsula(0.09, 0.55, 0.7), '#d9643a', O(0.003)), 0, 0, 0); casco.rotation.x = Math.PI / 2; casco.scale.set(1, 1, 0.55);
  pon(ca, caja(K, 0.12, 0.02, 0.05, FT.maderaL, { sinTinta: true }), 0, 0.03, 0.1);
  const remo = pon(ca, caja(K, 0.02, 0.012, 0.6, FT.maderaD, { sinTinta: true }), 0.08, 0.05, -0.05); remo.rotation.y = 0.3;
  return g;
}
/* los caminos de maicillo: manchas claras a lo largo de cada tramo */
export function caminos(K, tramos, semilla = 31) {
  const r = azar(semilla), pasos = [];
  for (const tramo of tramos) for (let i = 0; i < tramo.length - 1; i++) {
    const [a, b] = [tramo[i], tramo[i + 1]], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 5);
    for (let k = 0; k < n; k++) pasos.push([a[0] + (b[0] - a[0]) * k / n + (r() - 0.5) * 0.12, a[1] + (b[1] - a[1]) * k / n + (r() - 0.5) * 0.12, r() * 3]);
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), Yv = new THREE.Vector3(0, 1, 0);
  const m = K.instancias(K.cilindro(0.2, 0.2, 0.012, 12), '#e7dcc0', pasos.length, { sinTinta: true, sombra: false });
  pasos.forEach(([x, z, a], i) => { q.setFromAxisAngle(Yv, a); m4.compose(v.set(x, 0.007, z), q, s.set(1, 1, 0.8)); m.setMatrixAt(i, m4); });
  return m;
}
