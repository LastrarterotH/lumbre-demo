/* ============================================================
   roma/monumentos
   Las piezas de Roma (Época 14, docs/era14-plan.md: Roma entre los Flavios y Trajano, 70-117 d. C.) para la hoja de
   bocetos (juego3d/bocetos/roma.html), en tres versiones de verdad cada una:
   - EL HÉROE, con las PROPORCIONES REALES de cada conjunto (ESCALA dice cuántos metros mide una baldosa en cada uno):
     A el Foro Romano con la basílica Julia, la Curia, Saturno, los Rostra y el Capitolio con su templo de Júpiter;
     B el Foro de Trajano: la columna entre las dos bibliotecas, la basílica Ulpia delante y el hemiciclo de los Mercados;
     C el Coliseo con el Palatino detrás (sin juegos: la arena vacía);
   - LA SEGUNDA PIEZA: la isla Tiberina con su puente, la basílica Julia sola, los arcos del acueducto;
   - LAS CASAS: las ínsulas de ladrillo, las domus de atrio y peristilo, el barrio de los oficios;
   - los pinos piñoneros y los cipreses, en bosquecillos.
   El frente de cada pieza mira a +z. Paleta clara y cálida: travertino, ladrillo, mármol y teja.
   ============================================================ */
import * as THREE from 'three';
import { pon, caja, propia, textura, matTex, lamina, figura, anfora, estrias } from '../agora/monumentos.js';
import { burro, tendedero } from '../bagdad/monumentos.js';

export const RO = {
  trav: '#e8dcc0', travD: '#d3c19c', travL: '#f3ebd8', travS: '#bfae8a',
  marmol: '#f4f0e6', marmolD: '#ddd5c3', marmolL: '#fbf9f2',
  lad: '#cf7d4e', ladD: '#a95d37', ladL: '#e29a6b',
  teja: '#c4653f', tejaD: '#9d4a2e', tejaL: '#d9805a',
  toba: '#ccb68b', tobaD: '#b09a70', peper: '#bcae94',
  estuco: '#f1e5cb', ocre: '#dca85a', rojo: '#ad4530', rojoD: '#8a3424', negro: '#3a302a',
  giallo: '#e3c27a', pavon: '#d9cdbf', granito: '#c8917c',
  bronce: '#8c6538', bronceV: '#6f9884', oro: '#e2b84c', oroD: '#b98d34',
  madera: '#9a6a42', maderaD: '#6c4a2c', maderaL: '#c08f5e',
  hueco: '#3b2c24', sombra: '#8f7a62', sombraD: '#6e5c48',
  agua: '#93bb98', aguaD: '#6f9a7c', aguaL: '#d9e4b4',
  hierba: '#b3cc80', hierbaD: '#9dbb6c', hierbaL: '#c6da98',
  tierra: '#dcc79d', roca: '#cbb58a', rocaD: '#a99271',
  pino: '#5f8c4a', pinoD: '#46703a', pinoL: '#7ca95e', tronco: '#8b6247', cipres: '#3f6b46', cipresD: '#2f5539', cipresL: '#55845a',
  tela: '#b8483a', telaB: '#eee4cc', telaA: '#4f7299', telaV: '#6f8f4a', lava: '#7d716a', lavaD: '#61574f',
  arena: '#ecd8a8',
};
export const ESCALA = { foro: 20, trajano: 12.7, coliseo: 20 };   // metros por baldosa de cada héroe (las proporciones son las reales)
export const VARIANTES = { heroe: 'foro', segunda: 'isla', casas: 'insulas', tablero: 'capitolio' };   // la recomendación de Claude, hasta que el usuario elija

const h3 = (a, b = 0, c = 0) => { const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return s - Math.floor(s); };
const ss = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
const O = (gr = 0.004) => ({ grosor: gr });
const r2 = n => Math.round(n * 1000) / 1000;

/* ---------- las texturas ---------- */
const MR = new WeakMap();
/* un material con textura repetida: la textura se clona por repetición (redondeada) y el material queda en caché */
function matRep(K, clave, tex, ru, rv) {
  let m = MR.get(K); if (!m) MR.set(K, m = new Map());
  const ku = Math.max(1, Math.round(ru)), kv = Math.max(1, Math.round(rv)), k = `${clave}_${ku}_${kv}`;
  if (!m.has(k)) { const t = tex.clone(); t.needsUpdate = true; t.repeat.set(ku, kv); m.set(k, K.matMapa(t)); }
  return m.get(k);
}
/* el ladrillo romano (opus testaceum): hiladas finas y largas, tres tonos de naranja, la junta clara */
const texLadrillo = () => textura('ro-ladrillo', 64, 64, (g, w, h) => {
  g.fillStyle = '#ecd2b0'; g.fillRect(0, 0, w, h);
  const tonos = [RO.lad, RO.ladL, '#c4703f', '#d98b5b'];
  for (let f = 0; f < 8; f++) for (let c = -1; c < 3; c++) { g.fillStyle = tonos[Math.floor(h3(f, c, 3) * 4)]; g.fillRect(c * 32 + (f % 2) * 16 + 1, f * 8 + 1, 30, 6); }
}, { repetir: true });
export const matLadrillo = (K, w, h) => matRep(K, 'ro-lad', texLadrillo(), w / 0.42, h / 0.42);
/* el sillar de travertino o de toba (opus quadratum): bloques grandes con su junta */
const texSillar = (clave, base, tonos) => textura('ro-sillar-' + clave, 64, 64, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let f = 0; f < 4; f++) for (let c = -1; c < 3; c++) {
    g.fillStyle = tonos[Math.floor(h3(f, c, 7) * tonos.length)]; g.fillRect(c * 32 + (f % 2) * 16 + 1, f * 16 + 1, 30, 14);
    g.fillStyle = 'rgba(90,70,40,.10)'; for (let k = 0; k < 4; k++) g.fillRect(c * 32 + (f % 2) * 16 + 4 + h3(f, c, k) * 22, f * 16 + 3 + h3(c, f, k) * 9, 2, 2);   // los poros
  }
}, { repetir: true });
const sillarTrav = () => texSillar('trav', '#cdbd99', [RO.trav, RO.travL, '#e2d4b4']);
const sillarToba = () => texSillar('toba', '#a8926a', [RO.toba, '#c3ab7e', '#d4bf95', RO.peper]);
export const matSillar = (K, w, h, toba = false) => matRep(K, toba ? 'ro-sit' : 'ro-sil', toba ? sillarToba() : sillarTrav(), w / 0.5, h / 0.5);
/* las losas del Foro: travertino en placas grandes */
const texLosas = () => textura('ro-losas', 64, 64, (g, w, h) => {
  g.fillStyle = '#d6c8a6'; g.fillRect(0, 0, w, h);
  const T = [RO.travL, RO.trav, '#efe4cb', '#e3d6b8'];
  for (let f = 0; f < 4; f++) { let x = -h3(f, 1) * 20; while (x < w) { const L = 14 + h3(f, x) * 18; g.fillStyle = T[Math.floor(h3(f, x, 2) * 4)]; g.fillRect(x + 1, f * 16 + 1, L - 2, 14); x += L; } }
}, { repetir: true });
export const matLosas = (K, w, d) => matRep(K, 'ro-los', texLosas(), w / 0.7, d / 0.7);
/* las tejas: la teja plana (tegula) y la teja curva (imbrex) en filas que bajan por la pendiente; en oro, el bronce dorado */
const texTejas = oro => textura('ro-tejas' + (oro ? 'o' : ''), 64, 64, (g, w, h) => {
  const [base, osc, cla] = oro ? ['#d6b15a', '#a9832f', '#f0d48a'] : [RO.teja, RO.tejaD, RO.tejaL];
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) { g.fillStyle = osc; g.fillRect(0, y, w, 4); g.fillStyle = cla; g.fillRect(0, y + 5, w, 3); }
  for (let x = 0; x < w; x += 32) { g.fillStyle = oro ? 'rgba(90,60,10,.28)' : 'rgba(80,30,10,.28)'; g.fillRect(x, 0, 2, h); }
}, { repetir: true });
export const matTejas = (K, largo, ancho, oro = false) => matRep(K, oro ? 'ro-tjo' : 'ro-tj', texTejas(oro), largo / 0.11, ancho / 0.17);
/* el agua del Tíber, el «rubio Tíber» de Horacio y Virgilio: verde amarillenta, con sus ondas */
export const texAgua = () => textura('ro-agua', 128, 128, (g, w, h) => {
  g.fillStyle = RO.agua; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(214,200,120,.16)'; g.beginPath(); g.ellipse((i * 47) % 128, (i * 29) % 128, 26, 9, 0, 0, 7); g.fill(); }   // el limo amarillo del «rubio Tíber»
  for (let i = 0; i < 18; i++) { const y = (i * 37) % 128, x = (i * 53) % 128; g.strokeStyle = i % 3 ? 'rgba(250,246,205,.62)' : 'rgba(60,105,80,.34)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 4, x + 20, y); g.stroke(); }
}, { repetir: true });
/* la arena del Coliseo, rastrillada */
const texArena = () => textura('ro-arena', 64, 64, (g, w, h) => {
  g.fillStyle = RO.arena; g.fillRect(0, 0, w, h);
  for (let y = 2; y < h; y += 6) { g.fillStyle = 'rgba(180,140,80,.18)'; g.fillRect(0, y, w, 1.5); }
  for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(255,250,235,.35)'; g.fillRect(h3(i, 1) * w, h3(i, 2) * h, 2, 2); }
}, { repetir: true });
/* las gradas: el asiento claro y la sombra del escalón */
const texGradas = (clave, claro, osc) => textura('ro-gradas-' + clave, 4, 32, (g, w, h) => { g.fillStyle = claro; g.fillRect(0, 0, w, h); g.fillStyle = osc; g.fillRect(0, 0, w, 9); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, 9, w, 2); }, { repetir: true });
/* el friso de la columna Trajana: una vuelta por baldosa de textura (la hélice sigue al repetirla), con figuras pintadas */
const texEspiral = () => textura('ro-espiral', 128, 32, (g, w, h) => {
  g.fillStyle = RO.marmol; g.fillRect(0, 0, w, h);
  const COL = ['#a9564a', '#7b8aa0', '#c99a4e', '#7f9a6a', '#8a6a52', '#b9a58a'];
  for (let k = -1; k <= 1; k++) for (let i = 0; i < 46; i++) {
    const t = i / 46, x = t * w, y = h - t * h - h / 2 + k * h;
    g.fillStyle = COL[Math.floor(h3(i, 3) * COL.length)]; g.fillRect(x, y - 4 - h3(i, 4) * 4, 2, 8 + h3(i, 5) * 4);
    if (i % 3 === 0) { g.fillStyle = 'rgba(120,100,80,.35)'; g.beginPath(); g.arc(x + 1, y - 7, 1.6, 0, 7); g.fill(); }
  }
  g.strokeStyle = '#9d8e77'; g.lineWidth = 2.4; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(0, h + k * h); g.lineTo(w, k * h); g.stroke(); }
}, { repetir: true });
/* una inscripción en capitales romanas */
export function letrero(K, texto, { w = 512, h = 64, fondo = RO.marmolL, tinta = '#6a5a48', tam = 34 } = {}) {
  const t = textura('ro-letrero-' + texto, w, h, (g, W, H) => {
    g.fillStyle = fondo; g.fillRect(0, 0, W, H);
    g.fillStyle = tinta; g.font = `600 ${tam}px "Times New Roman", Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const lineas = texto.split('\n'); lineas.forEach((l, i) => g.fillText(l, W / 2, H / 2 + (i - (lineas.length - 1) / 2) * tam * 1.05, W - 10));
  });
  return matTex(K, 'ro-letrero-' + texto, t);
}
/* la pintura de las paredes de Pompeya: el zócalo negro, los paneles rojos y los marcos ocres */
const texFresco = () => textura('ro-fresco', 64, 32, (g, w, h) => {
  g.fillStyle = RO.rojo; g.fillRect(0, 0, w, h);
  g.fillStyle = RO.negro; g.fillRect(0, h - 8, w, 8);
  g.fillStyle = RO.ocre; for (let x = 0; x < w; x += 32) { g.fillRect(x, 0, 3, h - 8); } g.fillRect(0, h - 10, w, 2);
  g.fillStyle = 'rgba(255,230,190,.5)'; for (let x = 14; x < w; x += 32) g.fillRect(x, 10, 4, 4);
}, { repetir: true });

/* ---------- las formas de la arquitectura ---------- */
/* el muro con n arcos que bajan hasta el suelo: un solo polígono con las muescas de los arcos (sin agujeros) */
export function formaArcos(w, h, n, a, hs) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(-w / 2, h); s.lineTo(w / 2, h); s.lineTo(w / 2, 0);
  for (let i = n - 1; i >= 0; i--) { const cx = -w / 2 + (i + 0.5) * w / n; s.lineTo(cx + a / 2, 0); s.lineTo(cx + a / 2, hs); s.absarc(cx, hs, a / 2, 0, Math.PI, false); s.lineTo(cx - a / 2, 0); }
  s.closePath(); return s;
}
export function arcos(K, w, h, n, { hueco = 0.62, arranque = 0.5, grueso = 0.06, color = RO.trav, gr = 0.004 } = {}) {
  const bay = w / n, a = bay * hueco, hs = Math.min(h * arranque, h - a / 2 - 0.01);
  const geo = propia(new THREE.ExtrudeGeometry(formaArcos(w, h, n, a, hs), { depth: grueso, bevelEnabled: false, curveSegments: 6 })); geo.translate(0, 0, -grueso / 2);
  return K.malla(geo, color, O(gr));
}
/* la fachada de arcos en pisos (la basílica Julia, el Tabulario): cada piso, su arcada con las semicolumnas y el entablamento */
export function fachadaArcos(K, w, n, pisos, { grueso = 0.06, color = RO.trav, colorCol = RO.travL, colorEnt = RO.travL, semicol = true, gr = 0.004 } = {}) {
  const g = new THREE.Group(), bay = w / n; let y = 0;
  for (const p of pisos) {
    const hE = p.ent ?? p.h * 0.14, hw = p.h - hE;
    pon(g, arcos(K, w, hw, n, { hueco: p.hueco ?? 0.6, arranque: p.arranque ?? 0.5, grueso, color, gr }), 0, y, 0);
    if (semicol) for (let i = 0; i <= n; i++) pon(g, K.malla(K.cilindro(r2(bay * 0.085), r2(bay * 0.095), r2(hw), 6), colorCol, O(gr * 0.7)), -w / 2 + i * bay, y + hw / 2, grueso / 2);
    pon(g, caja(K, w + 0.02, hE, grueso + 0.05, colorEnt, O(gr)), 0, y + hw + hE / 2, 0.012);
    y += p.h;
  }
  g.userData.alto = y; return g;
}
/* la columna: basa, fuste (estriado) y capitel toscano, jónico o corintio; alto incluye todo */
export function columna(K, alto, r, { color = RO.marmol, capitel = null, orden = 'corintio', estriada = true, gr = 0.003, lados = 10 } = {}) {
  const g = new THREE.Group(), cc = capitel || color;
  alto = r2(alto); r = r2(r);
  pon(g, K.malla(K.cilindro(r2(r * 1.3), r2(r * 1.4), r2(alto * 0.05), lados), color, O(gr)), 0, alto * 0.025, 0);
  const hf = r2(alto * (orden === 'corintio' ? 0.82 : 0.86)), y1 = alto * 0.05 + hf;
  pon(g, K.malla(K.cilindro(r2(r * 0.86), r, hf, lados), estriada ? estrias(K, color) : color, O(gr)), 0, alto * 0.05 + hf / 2, 0);
  if (orden === 'corintio') {
    pon(g, K.malla(K.cilindro(r2(r * 1.36), r2(r * 0.9), r2(alto * 0.1), lados), cc, O(gr)), 0, y1 + alto * 0.05, 0);
    pon(g, caja(K, r2(r * 2.9), r2(alto * 0.03), r2(r * 2.9), cc, O(gr)), 0, y1 + alto * 0.115, 0);
  } else if (orden === 'jonico') {
    pon(g, caja(K, r2(r * 2.3), r2(alto * 0.05), r2(r * 1.4), cc, O(gr)), 0, y1 + alto * 0.025, 0);
    [-1, 1].forEach(l => { const v = K.malla(K.cilindro(r2(r * 0.46), r2(r * 0.46), r2(r * 1.5), 8), cc, O(gr)); v.rotation.x = Math.PI / 2; v.position.set(l * r * 1.1, y1 + alto * 0.02, 0); g.add(v); });
    pon(g, caja(K, r2(r * 2.4), r2(alto * 0.04), r2(r * 2.4), cc, O(gr)), 0, y1 + alto * 0.07, 0);
  } else {
    pon(g, K.malla(K.cilindro(r2(r * 1.25), r2(r * 0.9), r2(alto * 0.05), lados), cc, O(gr)), 0, y1 + alto * 0.025, 0);
    pon(g, caja(K, r2(r * 2.6), r2(alto * 0.04), r2(r * 2.6), cc, O(gr)), 0, y1 + alto * 0.07, 0);
  }
  return g;
}
/* el tejado a dos aguas con la cumbrera a lo largo de z: el frontón macizo y las dos aguas de tejas */
export function tejado(K, ancho, largo, alto, { oro = false, frontis = RO.marmol, gr = 0.005, vuelo = 0.035 } = {}) {
  const g = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(-ancho / 2, 0); s.lineTo(ancho / 2, 0); s.lineTo(0, alto); s.closePath();
  const geo = propia(new THREE.ExtrudeGeometry(s, { depth: largo, bevelEnabled: false })); geo.translate(0, 0, -largo / 2);
  g.add(K.malla(geo, frontis, O(gr)));
  const ang = Math.atan2(alto, ancho / 2), lado = Math.hypot(ancho / 2, alto) + vuelo, mat = matTejas(K, lado, largo + 2 * vuelo, oro);
  [-1, 1].forEach(l => {
    const ag = K.malla(K.caja(r2(lado), 0.022, r2(largo + 2 * vuelo)), mat, O(gr));
    ag.rotation.z = -l * ang; ag.position.set(l * (ancho / 4 + Math.cos(ang) * vuelo / 2) + l * Math.sin(ang) * 0.011, alto / 2 - Math.sin(ang) * vuelo / 2 + Math.cos(ang) * 0.011, 0); g.add(ag);
  });
  pon(g, caja(K, 0.03, 0.03, r2(largo + 2 * vuelo), oro ? RO.oroD : RO.tejaD, O(gr)), 0, alto + 0.022, 0);
  return g;
}
/* el tejado de un agua (los pórticos, los cobertizos): baja hacia +z */
export function tejadoUnAgua(K, ancho, prof, caida, { oro = false, gr = 0.004 } = {}) {
  const ang = Math.atan2(caida, prof), lado = Math.hypot(prof, caida) + 0.03;
  const t = K.malla(K.caja(r2(ancho + 0.04), 0.02, r2(lado)), matTejas(K, ancho, lado, oro), O(gr)); t.rotation.x = ang; const g = new THREE.Group(); t.position.set(0, -caida / 2, 0); g.add(t); return g;
}
/* el templo romano: podio alto con su escalinata al frente, columnas (pronaos) y la cella; con flancos, columnas a los
   costados (períptero sin pórtico atrás, como el de Júpiter en el Capitolio). W ancho (x), L largo (z). */
export function templo(K, { W = 1.2, L = 2.0, podio = 0.3, colH = 0.7, frente = 6, filas = 2, llenas = false, flancos = false, orden = 'corintio', color = RO.marmol, colorCol = null, capitel = null, colorPodio = RO.trav, oro = false, gr = 0.005, lados = 10, estatua = null } = {}) {
  const g = new THREE.Group(), r = Math.min(W / frente * 0.2, colH / 18), m = Math.max(r * 1.6, W / frente * 0.25), s = (W - 2 * m) / (frente - 1);
  const dE = Math.min(L * 0.3, podio * 1.3 + 0.05), Lp = L - dE, zc = -dE / 2;
  pon(g, caja(K, W, podio * 0.84, Lp, colorPodio, O(gr)), 0, podio * 0.42, zc);
  pon(g, caja(K, W + 0.03, podio * 0.16, Lp + 0.03, RO.travL, O(gr)), 0, podio * 0.92, zc);
  pon(g, caja(K, W + 0.03, podio * 0.1, Lp + 0.03, RO.travD, O(gr)), 0, podio * 0.05, zc);
  const k = Math.max(4, Math.min(10, Math.round(podio / 0.04))), Ws = W - 2 * r * 1.5;
  for (let i = 0; i < k; i++) { const d = dE * (k - i) / k; pon(g, caja(K, r2(Ws), r2(podio * (i + 1) / k), r2(d), i % 2 ? RO.marmolD : RO.marmol, O(gr * 0.6)), 0, podio * (i + 1) / k / 2, L / 2 - dE + d / 2); }
  [-1, 1].forEach(l => pon(g, caja(K, r2((W - Ws) / 2), r2(podio * 0.84), r2(dE), colorPodio, O(gr)), l * (W / 2 - (W - Ws) / 4), podio * 0.42, L / 2 - dE / 2));
  const y0 = podio, zf = L / 2 - dE - r * 1.5, cc = colorCol || color;
  const col = (x, z) => pon(g, columna(K, colH, r, { color: cc, capitel, orden, gr: gr * 0.7, lados }), x, y0, z);
  for (let f = 0; f < filas; f++) for (let i = 0; i < frente; i++) if (f === 0 || llenas || i === 0 || i === frente - 1) col(-W / 2 + m + i * s, zf - f * s);
  const zPron = zf - (filas - 1) * s - s * 0.7, zBack = -L / 2 + 0.03;
  if (flancos) for (let z = zf - filas * s; z > zBack + r * 2; z -= s) [-1, 1].forEach(l => col(l * (W / 2 - m), z));
  const Wc = flancos ? W - 2 * m - s * 0.8 : W - 2 * m + r * 2;
  pon(g, caja(K, r2(Wc), r2(colH), r2(zPron - zBack), flancos ? RO.marmolD : color, O(gr)), 0, y0 + colH / 2, (zPron + zBack) / 2);
  pon(g, caja(K, r2(Math.min(0.26, Wc * 0.3)), r2(colH * 0.62), 0.02, RO.bronce, O(gr * 0.5)), 0, y0 + colH * 0.31, zPron + 0.012);
  const hE = colH * 0.2;
  pon(g, caja(K, r2(W), r2(hE * 0.6), r2(Lp), color, O(gr)), 0, y0 + colH + hE * 0.3, zc);
  pon(g, caja(K, r2(W + 0.03), r2(hE * 0.4), r2(Lp + 0.03), RO.marmolL, O(gr)), 0, y0 + colH + hE * 0.8, zc);
  const yT = y0 + colH + hE, hR = W * 0.2;
  pon(g, tejado(K, W + 0.03, Lp + 0.03, hR, { oro, gr }), 0, yT, zc);
  if (estatua) { const e = estatua(); e.position.set(0, yT + hR + 0.01, zc + Lp / 2 - 0.02); g.add(e); }
  g.userData.alto = yT + hR; return g;
}
/* la cuadriga de bronce dorado de los techos (Júpiter Capitolino, la basílica Ulpia): cuatro caballos, el carro y el auriga */
export function cuadriga(K, s = 1, color = RO.oro) {
  const g = new THREE.Group(), o = O(0.003);
  for (let i = 0; i < 4; i++) {
    const x = (i - 1.5) * 0.05;
    pon(g, K.malla(K.capsula(0.022, 0.07, 0.5), color, o), x, 0.1, 0.02).rotation.x = Math.PI / 2;
    pon(g, K.malla(K.capsula(0.012, 0.04, 0.5), color, o), x, 0.15, 0.075).rotation.x = 0.5;
    [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(0.006, 0.006, 0.08, 4), color, { sinTinta: true }), x, 0.04, 0.02 + l * 0.035));
  }
  pon(g, caja(K, 0.18, 0.06, 0.06, color, o), 0, 0.09, -0.07);
  pon(g, figura(K, 0.16, { color, gr: 0.003 }), 0, 0.1, -0.08);
  g.scale.setScalar(s); return g;
}

/* ---------- los árboles de Roma: el pino piñonero (la copa en sombrilla) y el ciprés ---------- */
export function pino(K, alto = 1.4, semilla = 1) {
  const g = new THREE.Group(), a = (h3(semilla, 1) - 0.5) * 0.34, ht = alto * 0.7;
  const tr = K.malla(K.cilindro(r2(alto * 0.022), r2(alto * 0.036), r2(ht), 6), RO.tronco, O(0.003)); tr.rotation.z = -a; tr.position.set(Math.sin(a) * ht / 2, Math.cos(a) * ht / 2, 0); g.add(tr);
  const T = new THREE.Vector3(Math.sin(a) * ht, Math.cos(a) * ht, 0);
  [[-0.7, 0.16], [0.9, 0.13]].forEach(([d, l]) => { const b = K.malla(K.cilindro(r2(alto * 0.012), r2(alto * 0.018), r2(alto * l * 1.4), 5), RO.tronco, O(0.002)); b.position.set(T.x + Math.sin(d) * alto * l * 0.5, T.y - alto * 0.04, Math.cos(d) * alto * l * 0.3); b.rotation.z = -d; g.add(b); });
  const copa = (r, y, dx, dz, col, achata) => { const m = K.malla(K.esfera(1, 0.55), col, O(0.004)); m.scale.set(alto * r, alto * r * achata, alto * r); m.position.set(T.x + dx * alto, T.y + y * alto, dz * alto); g.add(m); };
  copa(0.3, 0.06, 0, 0, RO.pinoD, 0.34);
  copa(0.23, 0.13, 0.08 + h3(semilla, 3) * 0.06, 0.05, RO.pino, 0.4);
  copa(0.17, 0.18, -0.07, -0.05 + h3(semilla, 4) * 0.06, RO.pinoL, 0.42);
  g.rotation.y = h3(semilla, 2) * Math.PI * 2; return g;
}
export function cipres(K, alto = 1.2, semilla = 1) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.018, 0.024, 0.14, 5), RO.tronco, { sinTinta: true }), 0, 0.07, 0);
  const c = K.malla(K.esfera(1, 0.55), RO.cipres, O(0.004)); c.scale.set(alto * 0.13, alto * 0.47, alto * 0.13); c.position.y = alto * 0.5; g.add(c);
  const l = K.malla(K.esfera(1, 0.5), RO.cipresL, { sinTinta: true }); l.scale.set(alto * 0.075, alto * 0.28, alto * 0.075); l.position.set(alto * 0.06, alto * 0.58, alto * 0.06); g.add(l);
  pon(g, K.malla(K.cono(r2(alto * 0.045), r2(alto * 0.16), 6), RO.cipresD, O(0.003)), 0, alto * 0.95, 0);
  g.rotation.y = h3(semilla, 5) * 6.28; g.scale.x = 0.9 + h3(semilla, 6) * 0.2; return g;
}
/* un bosquecillo: pinos y cipreses alrededor de (0, 0); devuelve los árboles como hijos sueltos (cada uno con su x, z) */
export function arboleda(K, n = 6, radio = 1, semilla = 1, { cipreses = 0.4, alto = 1.35 } = {}) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996 + h3(semilla, i) * 0.8, rr = radio * Math.sqrt((i + 0.5) / n) * (0.75 + h3(i, semilla) * 0.3);
    const esC = h3(semilla, i, 9) < cipreses, s = alto * (0.82 + h3(i, semilla, 4) * 0.36);
    const t = esC ? cipres(K, s * 0.95, semilla * 13 + i) : pino(K, s, semilla * 7 + i);
    t.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr); g.add(t);
  }
  return g;
}

/* ---------- el relieve: una colina de caras, verde arriba y toba en las laderas ---------- */
export function relieve(K, x0, x1, z0, z1, paso, alt, { verde = [RO.hierba, RO.hierbaD, RO.hierbaL], ladera = [RO.roca, RO.rocaD, RO.toba], gr = 0.006 } = {}) {
  const nx = Math.ceil((x1 - x0) / paso), nz = Math.ceil((z1 - z0) / paso), sx = (x1 - x0) / nx, sz = (z1 - z0) / nz;
  const pos = [], col = [], c = new THREE.Color(), a = new THREE.Vector3(), b = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const xa = x0 + i * sx, za = z0 + j * sz, xb = xa + sx, zb = za + sz, v = (x, z) => [x, alt(x, z), z];
    const A = v(xa, za), B = v(xa, zb), C = v(xb, za), D = v(xb, zb);
    for (const t of [[A, B, C], [C, B, D]]) {
      if (t[0][1] < 0.003 && t[1][1] < 0.003 && t[2][1] < 0.003) continue;
      a.set(t[1][0] - t[0][0], t[1][1] - t[0][1], t[1][2] - t[0][2]); b.set(t[2][0] - t[0][0], t[2][1] - t[0][1], t[2][2] - t[0][2]); n.crossVectors(a, b).normalize();
      const y = (t[0][1] + t[1][1] + t[2][1]) / 3, k = Math.floor(h3(xa * 3.1, za * 2.7, t === 0 ? 1 : 2) * 3);
      c.set(n.y > 0.8 || y < 0.05 ? verde[k] : ladera[k]);
      if (n.y > 0.8 && n.y < 0.93) c.lerp(new THREE.Color(ladera[0]), 0.35);
      for (const p of t) { pos.push(...p); col.push(c.r, c.g, c.b); }
    }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
  return K.malla(propia(geo), '#ffffff', { vertexColors: true, grosor: gr });
}
/* una colina de planta rectangular con su meseta: dentro del rectángulo [x0,x1]×[z0,z1] vale H; afuera baja con la caída de
   cada lado (oeste, este, atrás, frente) */
export function meseta(H, x0, x1, z0, z1, [mo, me, ma, mf], ondas = 0.05) {
  return (x, z) => {
    const u = Math.max(0, (x0 - x) / mo, (x - x1) / me), v = Math.max(0, (z0 - z) / ma, (z - z1) / mf), q = Math.hypot(u, v);
    if (q >= 1) return 0;
    return Math.max(0, H * (1 - ss(q)) + ondas * Math.sin(x * 2.3 + z * 1.7) * Math.sin(z * 1.9 - x * 0.7) * ss(q * 2) * (1 - q));
  };
}

/* ---------- el elipse del Coliseo: n puntos a igual distancia por el contorno ---------- */
function elipse(a, b, n) {
  const M = 2400, P = [], L = [0];
  for (let i = 0; i <= M; i++) { const t = i / M * Math.PI * 2; P.push([a * Math.cos(t), b * Math.sin(t)]); if (i) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); }
  const tot = L[M], out = []; let j = 0;
  for (let k = 0; k < n; k++) { const s = k / n * tot; while (L[j + 1] < s) j++; const f = (s - L[j]) / (L[j + 1] - L[j]); out.push([P[j][0] + (P[j + 1][0] - P[j][0]) * f, P[j][1] + (P[j + 1][1] - P[j][1]) * f]); }
  return out;
}
/* el anillo elíptico macizo (entablamentos, el ático, el muro de adentro): de y = 0 a y = h */
function anillo(K, ao, bo, ai, bi, h, color, { seg = 48, gr = 0.004, sinTinta = false } = {}) {
  const s = new THREE.Shape(); s.absellipse(0, 0, ao, bo, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absellipse(0, 0, ai, bi, 0, Math.PI * 2, true); s.holes.push(hole);
  const geo = propia(new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: seg })); geo.rotateX(-Math.PI / 2);
  return K.malla(geo, color, sinTinta ? { sinTinta: true } : O(gr));
}
/* la banda elíptica entre dos anillos (las gradas en pendiente, los muros de las precinciones) */
function banda(a0, b0, y0, a1, b1, y1, seg = 96, rv = 1) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= seg; i++) { const t = i / seg * Math.PI * 2, c = Math.cos(t), s = Math.sin(t); pos.push(a0 * c, y0, b0 * s, a1 * c, y1, b1 * s); uv.push(i / seg, 0, i / seg, rv); }
  for (let i = 0; i < seg; i++) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; idx.push(a, c, b, c, d, b); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  return propia(geo);
}

/* =====================================================================================================================
   1 · EL HÉROE
   ===================================================================================================================== */

/* ---------- A · EL FORO ROMANO (1 baldosa = 20 m) ----------
   Mirando al oeste, hacia el Capitolio (el fondo, −z): a la izquierda (−x, el sur) la basílica Julia, de 101 × 49 m, con sus
   dos pisos de arcos; al pie del Capitolio el templo de Saturno (40 × 22,5 m, el podio alto del erario), el de Vespasiano y
   los Rostra; a la derecha la Curia (31 m de alto); arriba, el Tabulario en la falda y, en la cumbre del sur, el templo de
   Júpiter Óptimo Máximo (53 × 62 m), rehecho por Domiciano en 82 con el techo dorado; en la del norte (el Arx), Juno Moneta. */
export function basilicaJulia(K, { L = 5.05, W = 2.45, n = 18, m = 8, h1 = 0.56, h2 = 0.47, alto = 1.38, gr = 0.005, juegos = false } = {}) {
  const g = new THREE.Group(), gro = 0.07;
  [[0.36, RO.travD], [0.24, RO.trav], [0.12, RO.travL]].forEach(([e, c], i) => pon(g, caja(K, r2(W + e), 0.035, r2(L + e), c, O(gr)), 0, 0.0175 + i * 0.035, 0));
  if (juegos) {   // los tableros de juego rayados en las gradas (las tabulae lusoriae, que todavía se ven)
    const t = textura('ro-tabula', 64, 64, (q, w, h) => { q.fillStyle = RO.travL; q.fillRect(0, 0, w, h); q.strokeStyle = '#8f7f68'; q.lineWidth = 2; q.beginPath(); q.arc(32, 32, 24, 0, 7); q.stroke(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; q.beginPath(); q.moveTo(32 + Math.cos(a) * 24, 32 + Math.sin(a) * 24); q.lineTo(32 - Math.cos(a) * 24, 32 - Math.sin(a) * 24); q.stroke(); } });
    const mt = matTex(K, 'ro-tabula', t);
    [[-0.5, 0.2], [0.7, 0.3], [-1.2, 0.18]].forEach(([z, s]) => { const p = lamina(K, mt, s, s); p.rotation.x = -Math.PI / 2; p.position.set(W / 2 + 0.12, 0.106, z); g.add(p); });
  }
  const y0 = 0.105, pisos = [{ h: h1, arranque: 0.5, hueco: 0.62 }, { h: h2, arranque: 0.46, hueco: 0.6 }];
  pon(g, caja(K, r2(W - 0.34), r2(h1 + h2 - 0.02), r2(L - 0.34), RO.sombra, O(gr)), 0, y0 + (h1 + h2) / 2, 0);
  [-1, 1].forEach(l => {
    const f = fachadaArcos(K, L, n, pisos, { grueso: gro, gr }); f.rotation.y = l * Math.PI / 2; f.position.set(l * (W / 2 - gro / 2), y0, 0); g.add(f);
    const c = fachadaArcos(K, W - 2 * gro, m, pisos, { grueso: gro, gr }); c.rotation.y = l > 0 ? 0 : Math.PI; c.position.set(0, y0, l * (L / 2 - gro / 2)); g.add(c);
  });
  const yA = y0 + h1 + h2, Wn = W * 0.4, Ln = L * 0.82;
  pon(g, caja(K, r2(W + 0.02), 0.03, r2(L + 0.02), RO.travL, O(gr)), 0, yA + 0.015, 0);
  [-1, 1].forEach(l => { const t = tejadoUnAgua(K, L * 0.98, (W - Wn) / 2 - 0.02, 0.1); t.rotation.y = l * Math.PI / 2; t.position.set(l * (Wn / 2 + (W - Wn) / 4), yA + 0.13, 0); g.add(t); });
  pon(g, caja(K, r2(W * 0.97), 0.02, r2((L - Ln) / 2), matTejas(K, W, 0.4), O(gr)), 0, yA + 0.04, (L + Ln) / 4 + 0.02);
  pon(g, caja(K, r2(W * 0.97), 0.02, r2((L - Ln) / 2), matTejas(K, W, 0.4), O(gr)), 0, yA + 0.04, -(L + Ln) / 4 - 0.02);
  const hc = alto - yA;
  pon(g, caja(K, r2(Wn), r2(hc), r2(Ln), RO.trav, O(gr)), 0, yA + hc / 2, 0);
  const nv = Math.round(Ln / 0.3);
  for (let i = 0; i < nv; i++) [-1, 1].forEach(l => pon(g, caja(K, 0.012, r2(hc * 0.42), r2(Ln / nv * 0.42), RO.hueco, { sinTinta: true }), l * (Wn / 2 + 0.004), yA + hc * 0.55, -Ln / 2 + (i + 0.5) * Ln / nv));
  pon(g, tejado(K, Wn + 0.06, Ln + 0.06, Wn * 0.32, { frontis: RO.trav, gr }), 0, alto, 0);
  g.userData.alto = alto + Wn * 0.32; return g;
}
export function curia(K, { W = 0.9, L = 1.35, H = 1.22, gr = 0.005 } = {}) {
  const g = new THREE.Group();
  pon(g, caja(K, W, H, L, matLadrillo(K, W, H), O(gr)), 0, H / 2, 0);
  pon(g, caja(K, W + 0.02, H * 0.36, 0.03, RO.estuco, O(gr)), 0, H * 0.18, L / 2 + 0.01);
  [-1, 1].forEach(a => [-1, 1].forEach(b => pon(g, caja(K, 0.07, H, 0.07, RO.travL, O(gr)), a * W / 2, H / 2, b * L / 2)));
  pon(g, caja(K, 0.22, 0.36, 0.025, RO.bronce, O(gr)), 0, 0.06 + 0.18, L / 2 + 0.03);
  pon(g, caja(K, 0.3, 0.035, 0.04, RO.travL, O(gr)), 0, 0.44, L / 2 + 0.035);
  [-0.26, 0, 0.26].forEach(x => { pon(g, caja(K, 0.13, 0.26, 0.02, RO.hueco, O(gr * 0.5)), x, H * 0.68, L / 2 + 0.008); pon(g, caja(K, 0.16, 0.025, 0.035, RO.travL, O(gr * 0.5)), x, H * 0.68 - 0.14, L / 2 + 0.015); });
  pon(g, caja(K, W + 0.06, 0.05, L + 0.06, RO.travL, O(gr)), 0, H + 0.025, 0);
  pon(g, tejado(K, W + 0.06, L + 0.06, 0.28, { frontis: RO.estuco, gr }), 0, H + 0.05, 0);
  for (let i = 0; i < 3; i++) pon(g, caja(K, 0.56 - i * 0.06, 0.02 * (i + 1), 0.2 - i * 0.05, RO.marmol, O(gr * 0.6)), 0, 0.01 * (i + 1), L / 2 + 0.1 - i * 0.025);
  g.userData.alto = H + 0.33; return g;
}
export function rostra(K, { w = 1.2, d = 0.6, h = 0.16, gr = 0.004 } = {}) {
  const g = new THREE.Group();
  pon(g, caja(K, w, h, d, RO.marmol, O(gr)), 0, h / 2, 0);
  pon(g, caja(K, w + 0.03, 0.025, d + 0.03, RO.marmolL, O(gr)), 0, h + 0.012, 0);
  for (let i = 0; i < 6; i++) { const p = K.malla(K.cono(0.022, 0.09, 6), RO.bronceV, O(gr * 0.6)); p.rotation.x = Math.PI / 2; p.position.set(-w / 2 + 0.12 + i * (w - 0.24) / 5, h * 0.55, d / 2 + 0.04); g.add(p); }
  for (let i = 0; i < 9; i++) pon(g, K.malla(K.cilindro(0.008, 0.008, 0.06, 4), RO.marmolD, { sinTinta: true }), -w / 2 + 0.06 + i * (w - 0.12) / 8, h + 0.055, d / 2 - 0.02);
  pon(g, caja(K, w - 0.08, 0.012, 0.02, RO.marmolD, O(0.002)), 0, h + 0.09, d / 2 - 0.02);
  [-0.4, 0, 0.4].forEach((x, i) => { pon(g, caja(K, 0.08, 0.1, 0.08, RO.marmolD, O(0.003)), x, h + 0.05, -d / 2 + 0.12); pon(g, figura(K, 0.18, { color: i === 1 ? RO.oro : RO.bronce, gr: 0.003 }), x, h + 0.1, -d / 2 + 0.12); });
  return g;
}
/* el Tabulario: el archivo de Roma en la falda del Capitolio, con su galería de arcos que mira al Foro */
function tabulario(K, w = 3.6, H = 1.37, gr = 0.005) {
  const g = new THREE.Group();
  pon(g, caja(K, w, 0.72, 0.6, matSillar(K, w, 0.72, true), O(gr)), 0, 0.36, -0.3);
  for (let i = 0; i < 6; i++) pon(g, caja(K, 0.05, 0.1, 0.02, RO.hueco, { sinTinta: true }), -w / 2 + 0.35 + i * (w - 0.7) / 5, 0.45, 0.005);
  pon(g, caja(K, w - 0.1, 0.36, 0.4, RO.sombra, O(gr)), 0, 0.72 + 0.18, -0.32);
  pon(g, fachadaArcos(K, w, 11, [{ h: 0.38, arranque: 0.46, hueco: 0.58 }], { grueso: 0.06, color: RO.peper, colorCol: RO.travL, colorEnt: RO.travL, gr }), 0, 0.72, -0.05);
  pon(g, caja(K, w - 0.3, H - 1.1, 0.5, RO.trav, O(gr)), 0, 1.1 + (H - 1.1) / 2, -0.4);
  for (let i = 0; i < 9; i++) pon(g, caja(K, 0.06, 0.08, 0.02, RO.hueco, { sinTinta: true }), -w / 2 + 0.4 + i * (w - 0.8) / 8, 1.22, -0.14);
  return g;
}
/* los tres árboles del medio del Foro (Plinio, Historia natural XV, 78): la higuera, el olivo y la vid */
function arbolesForo(K) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.42, 0.04, 0.2, RO.marmolD, O(0.003)), 0, 0.02, 0);
  [[-0.13, RO.pino, 0.11], [0.0, '#93a17a', 0.09], [0.13, '#7a9a4a', 0.07]].forEach(([x, c, r], i) => {
    pon(g, K.malla(K.cilindro(0.008, 0.012, 0.12, 5), RO.tronco, { sinTinta: true }), x, 0.08, 0);
    const m = K.malla(K.esfera(1, 0.5), c, O(0.003)); m.scale.set(r, r * 0.8, r); m.position.set(x, 0.16 + r * 0.4, 0); g.add(m);
  });
  return g;
}
export function foroRomano(K) {
  const g = new THREE.Group();
  const H = 1.55, m0 = meseta(H, -4.35, 2.9, -6.9, -4.15, [0.75, 0.85, 0.6, 0.12]), alt = (x, z) => { const h = m0(x, z); return h > 0 ? Math.max(h - 0.17 * Math.exp(-(((x - 0.6) / 1.0) ** 2)) * ss((z + 7.2) * 2) * ss(h / 0.4), 0) : 0; };
  /* las losas del Foro y de la plaza al pie del Capitolio */
  pon(g, caja(K, 6.5, 0.03, 7.75, matLosas(K, 6.5, 7.75), { sinTinta: true, sombra: false }), -0.65, 0.015, -0.27);
  /* la basílica Julia */
  pon(g, basilicaJulia(K), -2.62, 0.03, 0.95);
  /* el templo de Saturno, el de Vespasiano y los Rostra */
  pon(g, templo(K, { W: 1.13, L: 2.0, podio: 0.42, colH: 0.55, frente: 6, filas: 2, orden: 'jonico', colorCol: '#e9e2d4' }), -2.36, 0.03, -2.85);
  pon(g, templo(K, { W: 1.1, L: 1.45, podio: 0.2, colH: 0.71, frente: 6, filas: 2 }), -0.95, 0.03, -3.23);
  pon(g, rostra(K), 0.0, 0.03, -1.75);
  /* la Curia, girada hacia la plaza */
  pon(g, curia(K), 1.85, 0.03, -2.35, -0.3);
  /* el Capitolio: la colina, el Tabulario, Júpiter (mirando al sur, como el de verdad) y Juno Moneta en el Arx */
  g.add(relieve(K, -5.2, 3.85, -7.6, -3.95, 0.2, alt));
  pon(g, tabulario(K), 0.55, 0.0, -4.0);
  const ju = templo(K, { W: 2.65, L: 3.1, podio: 0.22, colH: 0.85, frente: 6, filas: 3, llenas: true, flancos: true, oro: true, estatua: () => cuadriga(K, 1.4) });
  pon(g, ju, -2.75, H - 0.02, -5.52, -Math.PI / 2);
  pon(g, templo(K, { W: 0.76, L: 1.15, podio: 0.12, colH: 0.42, frente: 4, filas: 2 }), 2.35, alt(2.35, -5.6) - 0.02, -5.6);
  [[-4.7, -6.8, 'p', 1.2], [-4.6, -5.2, 'c', 1.0], [-4.75, -4.6, 'p', 1.1], [1.5, -6.6, 'p', 1.2], [3.2, -5.0, 'c', 0.95], [3.35, -6.3, 'p', 1.15], [0.6, -7.0, 'c', 0.9], [-0.6, -6.9, 'p', 1.05], [1.0, -5.3, 'c', 0.85]].forEach(([x, z, t, s], i) => { const a = t === 'p' ? pino(K, s, 11 + i) : cipres(K, s, 5 + i); a.position.set(x, alt(x, z) - 0.02, z); g.add(a); });
  /* en la plaza: los tres árboles, el lago Curcio y las estatuas sobre sus basas */
  pon(g, arbolesForo(K), 0.35, 0.03, 1.6);
  pon(g, caja(K, 0.3, 0.035, 0.22, RO.marmolD, O(0.003)), -0.45, 0.045, 0.55);
  pon(g, K.malla(K.cilindro(0.05, 0.05, 0.07, 10), RO.marmol, O(0.003)), -0.45, 0.08, 0.55);
  [0.0, 1.0, 2.2].forEach((z, i) => { pon(g, caja(K, 0.1, 0.2, 0.1, RO.marmol, O(0.003)), 1.02, 0.13, z); pon(g, figura(K, 0.22, { color: i === 1 ? RO.oro : RO.bronceV, gr: 0.003 }), 1.02, 0.23, z); });
  g.userData.alt = alt; g.userData.escala = ESCALA.foro;
  return g;
}

/* ---------- B · EL FORO DE TRAJANO (1 baldosa = 12,7 m: la columna, con su estatua, mide 3) ----------
   De Apolodoro de Damasco, inaugurado en 112; la columna en 113. Mirando al norte desde la plaza (+z): la basílica Ulpia
   atravesada (170 × 60 m con sus dos ábsides, el techo de bronce dorado), detrás el patio de la columna entre las dos
   bibliotecas (la griega y la latina) y, contra la ladera del Quirinal, el hemiciclo de los Mercados. */
export function columnaTrajana(K, { gr = 0.004 } = {}) {
  const g = new THREE.Group();
  const relieves = textura('ro-pedestal', 64, 64, (q, w, h) => {
    q.fillStyle = RO.marmol; q.fillRect(0, 0, w, h); q.strokeStyle = '#cfc5b0'; q.lineWidth = 3; q.strokeRect(4, 4, w - 8, h - 8);
    q.fillStyle = '#bfb39b'; for (let i = 0; i < 18; i++) q.fillRect(10 + h3(i, 1) * 40, 14 + h3(i, 2) * 34, 4 + h3(i, 3) * 6, 3 + h3(i, 4) * 5);
    q.strokeStyle = '#a99c84'; q.lineWidth = 2; q.beginPath(); q.moveTo(8, 12); q.quadraticCurveTo(32, 26, 56, 12); q.stroke();
  });
  pon(g, caja(K, 0.43, 0.4, 0.43, matTex(K, 'ro-pedestal', relieves), O(gr)), 0, 0.2, 0);
  pon(g, caja(K, 0.47, 0.03, 0.47, RO.marmolL, O(gr)), 0, 0.415, 0);
  pon(g, caja(K, 0.47, 0.03, 0.47, RO.marmolD, O(gr)), 0, 0.015, 0);
  pon(g, caja(K, 0.07, 0.15, 0.01, RO.hueco, { sinTinta: true }), 0, 0.09, 0.216);
  const ins = lamina(K, letrero(K, 'SENATVS POPVLVSQVE ROMANVS\nIMP CAESARI NERVAE TRAIANO', { w: 256, h: 96, tam: 18 }), 0.3, 0.12); ins.position.set(0, 0.28, 0.217); g.add(ins);
  pon(g, K.malla(K.toro(0.155, 0.022, Math.PI * 2, 0.7), '#d8ccb4', O(gr)), 0, 0.45, 0).rotation.x = Math.PI / 2;
  const tex = texEspiral().clone(); tex.needsUpdate = true; tex.repeat.set(1, 23);
  const fuste = K.malla(propia(new THREE.CylinderGeometry(0.128, 0.148, 2.1, 18, 1, true)), K.matMapa(tex), O(gr)); fuste.position.y = 0.46 + 1.05; g.add(fuste);
  pon(g, K.malla(K.cilindro(0.17, 0.13, 0.06, 14), RO.marmol, O(gr)), 0, 2.59, 0);
  pon(g, caja(K, 0.36, 0.05, 0.36, RO.marmolL, O(gr)), 0, 2.645, 0);
  for (let i = 0; i < 4; i++) { const b = caja(K, 0.36, 0.035, 0.01, RO.bronce, { sinTinta: true }); b.rotation.y = i * Math.PI / 2; b.position.set(Math.sin(i * Math.PI / 2) * 0.175, 2.69, Math.cos(i * Math.PI / 2) * 0.175); g.add(b); }
  pon(g, K.malla(K.cilindro(0.075, 0.1, 0.1, 12), RO.marmolD, O(gr)), 0, 2.72, 0);
  pon(g, figura(K, 0.3, { color: RO.oro, manto: RO.oroD, gr: 0.003 }), 0, 2.77, 0);
  g.userData.alto = 3.07; return g;
}
function basilicaUlpia(K, gr = 0.005) {
  const g = new THREE.Group(), L = 9.8, D = 4.72, Hw = 1.05, Dn = 1.97;
  pon(g, caja(K, L + 0.2, 0.06, D + 0.2, RO.travD, O(gr)), 0, 0.03, 0);
  pon(g, caja(K, L, Hw, D, RO.marmolD, O(gr)), 0, 0.06 + Hw / 2, 0);
  for (let i = 0; i <= 20; i++) pon(g, caja(K, 0.05, Hw, 0.025, RO.marmol, O(gr * 0.6)), -L / 2 + i * L / 20, 0.06 + Hw / 2, D / 2 + 0.012);
  for (let i = 0; i < 20; i++) if (Math.abs(-L / 2 + (i + 0.5) * L / 20) > 1.6) pon(g, caja(K, 0.14, 0.2, 0.012, RO.hueco, { sinTinta: true }), -L / 2 + (i + 0.5) * L / 20, 0.86, D / 2 + 0.006);
  pon(g, caja(K, L + 0.04, 0.06, D + 0.04, RO.marmolL, O(gr)), 0, 0.06 + Hw + 0.03, 0);
  /* los ábsides de los extremos, con su techo de bronce */
  [-1, 1].forEach(l => {
    const ab = K.malla(propia(new THREE.CylinderGeometry(1.8, 1.8, Hw, 20, 1, false, l > 0 ? 0 : Math.PI, Math.PI)), RO.marmolD, O(gr)); ab.position.set(l * L / 2, 0.06 + Hw / 2, 0); g.add(ab);
    const te = K.malla(propia(new THREE.ConeGeometry(1.84, 0.42, 20, 1, false, l > 0 ? 0 : Math.PI, Math.PI)), matTejas(K, 2, 6, true), O(gr)); te.position.set(l * L / 2, 0.06 + Hw + 0.21 + 0.06, 0); g.add(te);
    for (let i = 0; i < 7; i++) { const a = (l > 0 ? 0 : Math.PI) + (i + 0.5) * Math.PI / 7; pon(g, caja(K, 0.04, Hw, 0.04, RO.marmol, O(gr * 0.6)), l * L / 2 + Math.sin(a) * 1.81, 0.06 + Hw / 2, Math.cos(a) * 1.81); }
  });
  /* los techos de las naves laterales, el claristorio y la nave central, todo en bronce dorado (Pausanias V, 12, 6) */
  const yA = 0.06 + Hw + 0.06;
  [-1, 1].forEach(l => { const t = tejadoUnAgua(K, L, (D - Dn) / 2, 0.22, { oro: true }); t.rotation.y = l > 0 ? 0 : Math.PI; t.position.set(0, yA + 0.22, l * (Dn / 2 + (D - Dn) / 4)); g.add(t); });
  const hc = 0.55;
  pon(g, caja(K, L - 0.2, hc, Dn, RO.marmol, O(gr)), 0, yA + 0.2 + hc / 2, 0);
  for (let i = 0; i < 16; i++) [-1, 1].forEach(l => pon(g, caja(K, 0.22, 0.24, 0.012, RO.hueco, { sinTinta: true }), -L / 2 + 0.4 + i * (L - 0.8) / 15, yA + 0.2 + hc * 0.5, l * (Dn / 2 + 0.005)));
  const tn = tejado(K, Dn + 0.06, L - 0.14, 0.34, { oro: true, gr }); tn.rotation.y = Math.PI / 2; tn.position.set(0, yA + 0.2 + hc, 0); g.add(tn);
  /* los tres pórticos de la fachada que da a la plaza: columnas de giallo antico, el ático con estatuas y la cuadriga */
  const portico = (x, w, nc, prof, cuadr) => {
    const p = new THREE.Group(), cH = 0.74;
    for (let i = 0; i < 4; i++) pon(p, caja(K, r2(w + 0.16 - i * 0.04), 0.03, r2(prof + 0.12 - i * 0.03), i % 2 ? RO.marmolD : RO.marmol, O(gr * 0.6)), 0, 0.015 + i * 0.03, prof / 2 + 0.06 - i * 0.015);
    for (let i = 0; i < nc; i++) pon(p, columna(K, cH, 0.05, { color: RO.giallo, capitel: RO.marmolL, gr: gr * 0.6, lados: 8 }), -w / 2 + 0.07 + i * (w - 0.14) / (nc - 1), 0.12, prof - 0.04);
    pon(p, caja(K, w + 0.04, 0.09, prof + 0.06, RO.marmolL, O(gr)), 0, 0.12 + cH + 0.045, prof / 2);
    pon(p, caja(K, w, 0.24, prof * 0.7, RO.marmol, O(gr)), 0, 0.12 + cH + 0.09 + 0.12, prof * 0.45);
    const ins = lamina(K, letrero(K, cuadr ? 'EX MANVBIIS' : 'S P Q R', { w: 256, h: 48, tam: 30 }), w * 0.7, 0.1); ins.position.set(0, 0.12 + cH + 0.21, prof * 0.8 + 0.002); p.add(ins);
    const ne = Math.max(2, Math.round(w / 0.5));
    for (let i = 0; i < ne; i++) pon(p, figura(K, 0.17, { color: i % 2 ? RO.pavon : RO.marmol, gr: 0.003 }), -w / 2 + 0.15 + i * (w - 0.3) / (ne - 1), 0.12 + cH + 0.33, prof * 0.55);
    if (cuadr) pon(p, cuadriga(K, 1.6), 0, 0.12 + cH + 0.33, prof * 0.5);
    p.position.set(x, 0.06, D / 2); g.add(p);
  };
  portico(0, 2.9, 8, 0.45, true); portico(-3.3, 1.4, 4, 0.34, false); portico(3.3, 1.4, 4, 0.34, false);
  return g;
}
function biblioteca(K, lado, gr = 0.005) {
  const g = new THREE.Group(), W = 1.39, L = 2.13, H = 1.48;
  pon(g, caja(K, W, H, L, matLadrillo(K, L, H), O(gr)), 0, H / 2, 0);
  pon(g, caja(K, W + 0.04, 0.12, L + 0.04, RO.travL, O(gr)), 0, 0.06, 0);
  pon(g, caja(K, W + 0.05, 0.05, L + 0.05, RO.travL, O(gr)), 0, H + 0.025, 0);
  for (let i = 0; i < 4; i++) { pon(g, caja(K, 0.012, 0.36, 0.22, RO.hueco, { sinTinta: true }), lado * (W / 2 + 0.004), 0.95, -L / 2 + 0.3 + i * (L - 0.6) / 3); pon(g, caja(K, 0.02, 0.03, 0.28, RO.travL, O(gr * 0.5)), lado * (W / 2 + 0.008), 0.76, -L / 2 + 0.3 + i * (L - 0.6) / 3); }
  /* el pórtico que da al patio de la columna, con la puerta de bronce */
  for (let i = 0; i < 4; i++) pon(g, columna(K, 0.66, 0.045, { color: RO.pavon, capitel: RO.marmolL, gr: gr * 0.6, lados: 8 }), -lado * (W / 2 + 0.16), 0.12, -L / 2 + 0.3 + i * (L - 0.6) / 3);
  pon(g, caja(K, 0.26, 0.06, L - 0.2, RO.marmolL, O(gr)), -lado * (W / 2 + 0.12), 0.81, 0);
  pon(g, caja(K, 0.02, 0.42, 0.3, RO.bronce, O(gr * 0.5)), -lado * (W / 2 + 0.01), 0.33, 0);
  pon(g, tejado(K, W + 0.06, L + 0.06, 0.3, { frontis: RO.trav, gr }), 0, H + 0.05, 0);
  return g;
}
function hemiciclo(K, { r = 1.8, n = 11, gr = 0.004 } = {}) {
  const g = new THREE.Group(), bw = Math.PI * r / n + 0.02;
  for (let j = 0; j < n; j++) {
    const th = Math.PI + (j + 0.5) * Math.PI / n, cx = r * Math.cos(th), cz = r * Math.sin(th), f = new THREE.Group();
    f.position.set(cx, 0, cz); f.rotation.y = Math.atan2(-Math.cos(th), -Math.sin(th)); g.add(f);
    pon(f, caja(K, r2(bw), 0.42, 0.5, matLadrillo(K, bw, 0.42), O(gr)), 0, 0.21, -0.25);
    pon(f, caja(K, 0.15, 0.27, 0.01, RO.hueco, { sinTinta: true }), 0, 0.14, 0.003);
    [-1, 1].forEach(l => pon(f, caja(K, 0.025, 0.29, 0.02, RO.travL, O(gr * 0.5)), l * 0.085, 0.145, 0.006)); pon(f, caja(K, 0.2, 0.03, 0.025, RO.travL, O(gr * 0.5)), 0, 0.3, 0.006);
    pon(f, caja(K, r2(bw), 0.38, 0.4, matLadrillo(K, bw, 0.38), O(gr)), 0, 0.42 + 0.19, -0.3);
    pon(f, caja(K, 0.1, 0.17, 0.01, RO.hueco, { sinTinta: true }), 0, 0.6, -0.097);
    [-1, 1].forEach(l => pon(f, caja(K, 0.03, 0.38, 0.03, RO.ladL, O(gr * 0.5)), l * bw / 2, 0.61, -0.095));
    if (j % 2) { const s = new THREE.Shape(); s.moveTo(-0.08, 0); s.lineTo(0.08, 0); s.lineTo(0, 0.05); s.closePath(); pon(f, K.malla(propia(new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false })), RO.ladL, O(gr * 0.5)), 0, 0.705, -0.11); }
    else { const a = K.malla(propia(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 8, 1, false, -Math.PI / 2, Math.PI)), RO.ladL, O(gr * 0.5)); a.rotation.x = -Math.PI / 2; a.position.set(0, 0.7, -0.095); f.add(a); }
    pon(f, caja(K, r2(bw), 0.04, 0.42, RO.travL, O(gr)), 0, 0.82, -0.3);
    pon(f, caja(K, r2(bw), 0.3, 0.3, matLadrillo(K, bw, 0.3), O(gr)), 0, 0.84 + 0.15, -0.42);
    pon(f, caja(K, 0.07, 0.09, 0.01, RO.hueco, { sinTinta: true }), 0, 0.98, -0.267);
    pon(f, caja(K, r2(bw + 0.01), 0.02, 0.36, matTejas(K, 0.4, bw), O(gr)), 0, 1.15, -0.43);
  }
  return g;
}
/* el caballo de Trajano en la plaza (el que admiró Constancio II en 357: Amiano Marcelino XVI, 10, 15) */
function equusTraiani(K) {
  const g = new THREE.Group(), c = RO.oroD, o = O(0.003);
  pon(g, caja(K, 0.26, 0.2, 0.12, RO.marmol, o), 0, 0.1, 0);
  pon(g, K.malla(K.capsula(0.04, 0.12, 0.6), c, o), 0, 0.31, 0).rotation.z = Math.PI / 2;
  [[0.07, 0.025], [0.07, -0.025], [-0.07, 0.025], [-0.07, -0.025]].forEach(([x, z], i) => pon(g, K.malla(K.cilindro(0.01, 0.009, 0.11, 4), c, { sinTinta: true }), x, 0.255, z).rotation.z = i < 2 ? -0.5 : 0);
  const cu = K.malla(K.capsula(0.022, 0.06, 0.5), c, o); cu.position.set(0.11, 0.38, 0); cu.rotation.z = -0.7; g.add(cu);
  pon(g, figura(K, 0.17, { color: RO.oro, gr: 0.003 }), -0.01, 0.33, 0);
  return g;
}
export function foroTrajano(K) {
  const g = new THREE.Group();
  pon(g, caja(K, 9.0, 0.03, 1.7, matLosas(K, 9, 1.7), { sinTinta: true, sombra: false }), 0, 0.015, 3.2);
  pon(g, basilicaUlpia(K), 0, 0, 0);
  pon(g, equusTraiani(K), 0, 0.03, 3.45, -Math.PI / 2);
  /* el patio de la columna entre las dos bibliotecas */
  pon(g, caja(K, 1.92, 0.03, 2.13, matLosas(K, 1.9, 2.1), { sinTinta: true, sombra: false }), 0, 0.015, -3.44);
  pon(g, columnaTrajana(K), 0, 0.03, -3.25);
  pon(g, biblioteca(K, -1), -1.655, 0, -3.44);
  pon(g, biblioteca(K, 1), 1.655, 0, -3.44);
  /* el hemiciclo de los Mercados contra el corte del Quirinal, con el monte detrás */
  const alt = meseta(1.85, -3.0, 6.6, -7.6, -6.55, [1.2, 0.6, 0.3, 0.5]);
  g.add(relieve(K, -4.4, 7.3, -7.7, -5.8, 0.22, alt));
  pon(g, hemiciclo(K), 3.25, 0, -4.85);
  [[4.6, -7.1, 'p', 1.0], [5.9, -6.9, 'c', 0.85], [-0.2, -7.0, 'p', 1.0], [-2.0, -6.8, 'c', 0.85], [-3.1, -6.6, 'p', 0.9], [6.5, -6.2, 'p', 0.9], [1.0, -7.2, 'c', 0.8]].forEach(([x, z, t, s], i) => { const a = t === 'p' ? pino(K, s, 31 + i) : cipres(K, s, 41 + i); a.position.set(x, alt(x, z) - 0.02, z); g.add(a); });
  [[5.0, -6.8, 1.0, 0.5], [2.2, -7.0, 0.8, 0.45]].forEach(([x, z, w, h]) => { const y = alt(x, z); pon(g, caja(K, w, h, 0.5, matLadrillo(K, w, h), O(0.004)), x, y + h / 2 - 0.05, z); pon(g, tejado(K, w + 0.04, 0.54, 0.14, { frontis: RO.lad }), x, y + h - 0.05, z); });
  g.userData.alt = alt; g.userData.escala = ESCALA.trajano;
  return g;
}

/* ---------- C · EL COLISEO CON EL PALATINO (1 baldosa = 20 m) ----------
   El anfiteatro Flavio: empezado por Vespasiano hacia 72 e inaugurado por Tito en 80 (Suetonio, Tito 7; Dión LXVI, 25).
   188 × 156 m y 48 de alto: tres pisos de 80 arcos (toscano, jónico, corintio) y el ático con los mástiles del toldo. La
   arena, vacía y rastrillada. Detrás, el Palatino con el palacio de Domiciano (el aula regia, 92 d. C.); al lado, la Meta
   Sudans y el arco de Tito. */
export function coliseo(K, { a = 4.7, b = 3.9, gr = 0.004 } = {}) {
  const g = new THREE.Group(), N = 80, P = elipse(a, b, N), gro = 0.08;
  const bahias = P.map((p, i) => {
    const q = P[(i + 1) % N], mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2, tx = q[0] - p[0], tz = q[1] - p[1];
    let fi = Math.atan2(-tz, tx); if (Math.sin(fi) * mx / (a * a) + Math.cos(fi) * mz / (b * b) < 0) fi += Math.PI;
    return { mx, mz, len: Math.hypot(tx, tz), fi, p };
  });
  const bw0 = bahias.reduce((s, x) => s + x.len, 0) / N;
  const pisos = [{ h: 0.525, arr: 0.42, hueco: 0.62, c: RO.trav }, { h: 0.59, arr: 0.46, hueco: 0.6, c: RO.travL }, { h: 0.58, arr: 0.46, hueco: 0.6, c: RO.trav }];
  let y = 0;
  pisos.forEach((p, k) => {
    const hE = p.h * 0.14, hw = p.h - hE;
    const geo = propia(new THREE.ExtrudeGeometry(formaArcos(bw0, hw, 1, bw0 * p.hueco, hw * p.arr), { depth: gro, bevelEnabled: false, curveSegments: 5 })); geo.translate(0, 0, -gro / 2);
    for (const B of bahias) {
      const m = K.malla(geo, p.c, O(gr)); m.scale.x = B.len / bw0; m.position.set(B.mx, y, B.mz); m.rotation.y = B.fi; g.add(m);
      const c = K.malla(K.caja(r2(bw0 * 0.13), r2(hw), 0.035), RO.travL, { sinTinta: true }); c.position.set(B.p[0] + Math.sin(B.fi) * gro * 0.5, y + hw / 2, B.p[1] + Math.cos(B.fi) * gro * 0.5); c.rotation.y = B.fi; g.add(c);
    }
    pon(g, anillo(K, a + 0.055, b + 0.055, a - 0.06, b - 0.06, hE, RO.travL, { seg: 40, gr }), 0, y + hw, 0);
    y += p.h;
  });
  /* el muro de adentro (la sombra de los corredores) y el ático con sus ventanas, sus pilastras y los mástiles del toldo */
  pon(g, anillo(K, a - 0.18, b - 0.18, a - 0.3, b - 0.3, y, RO.sombra, { seg: 32, sinTinta: true }), 0, 0, 0);
  const hAt = 0.705;
  pon(g, anillo(K, a + 0.03, b + 0.03, a - 0.1, b - 0.1, hAt, RO.trav, { seg: 40, gr }), 0, y, 0);
  pon(g, anillo(K, a + 0.065, b + 0.065, a - 0.12, b - 0.12, 0.045, RO.travL, { seg: 40, gr }), 0, y + hAt, 0);
  bahias.forEach((B, i) => {
    const sx = Math.sin(B.fi), cz = Math.cos(B.fi);
    const pl = K.malla(K.caja(0.04, r2(hAt), 0.03), RO.travL, { sinTinta: true }); pl.position.set(B.p[0] + sx * 0.04, y + hAt / 2, B.p[1] + cz * 0.04); pl.rotation.y = B.fi; g.add(pl);
    if (i % 2 === 0) { const v = K.malla(K.caja(0.1, 0.13, 0.02), RO.hueco, { sinTinta: true }); v.position.set(B.mx + sx * 0.035, y + hAt * 0.5, B.mz + cz * 0.035); v.rotation.y = B.fi; g.add(v); }
    const ma = K.malla(K.cilindro(0.008, 0.008, 0.36, 4), RO.madera, { sinTinta: true }); ma.position.set(B.p[0] + sx * 0.06, y + hAt + 0.06, B.p[1] + cz * 0.06); g.add(ma);
    const ms = K.malla(K.caja(0.03, 0.03, 0.04), RO.travD, { sinTinta: true }); ms.position.set(B.p[0] + sx * 0.055, y + hAt * 0.82, B.p[1] + cz * 0.055); ms.rotation.y = B.fi; g.add(ms);
  });
  const yTop = y + hAt;
  /* la cávea: el podio, las gradas de mármol de los senadores, las de en medio y las de madera de arriba, separadas por muros */
  const aA = 2.175, bA = 1.375, d = (x, k = 0) => [aA + x, bA + x];
  const gradM = matRep(K, 'ro-grm', texGradas('m', RO.marmolL, RO.marmolD), 1, 7), gradT = matRep(K, 'ro-grt', texGradas('t', RO.trav, RO.travS), 1, 8), gradW = matRep(K, 'ro-grw', texGradas('w', '#c9a476', RO.maderaD), 1, 6);
  const B2 = (x0, y0, x1, y1, mat, rv = 1) => { const [a0, b0] = d(x0), [a1, b1] = d(x1); const m = new THREE.Mesh(banda(a0, b0, y0, a1, b1, y1, 96, rv), mat); m.receiveShadow = true; m.castShadow = false; g.add(m); return m; };
  const muro = (x, y0, y1, c) => B2(x, y0, x, y1, K.mat(c, { side: THREE.DoubleSide }));
  muro(0, 0, 0.22, RO.marmolL); B2(0, 0.22, 0.1, 0.22, K.mat(RO.marmolD, { side: THREE.DoubleSide }));
  B2(0.1, 0.24, 0.75, 0.62, gradM); muro(0.75, 0.62, 0.72, RO.travD);
  B2(0.75, 0.72, 1.45, 1.15, gradT); muro(1.45, 1.15, 1.27, RO.travD);
  B2(1.45, 1.27, 2.0, 1.7, gradT); muro(2.0, 1.7, 1.86, RO.travD);
  B2(2.0, 1.86, 2.42, 2.14, gradW);
  B2(2.2, yTop - 0.05, 2.43, yTop - 0.05, K.mat(RO.teja, { side: THREE.DoubleSide }));
  const pc = elipse(aA + 2.24, bA + 2.24, 64);
  pc.forEach(([x, z]) => pon(g, K.malla(K.cilindro(0.011, 0.011, r2(yTop - 2.14), 5), RO.marmolL, { sinTinta: true }), x, 2.14 + (yTop - 2.14) / 2 - 0.03, z));
  [[0.75, 0.62, 0.72], [1.45, 1.15, 1.27], [2.0, 1.7, 1.86]].forEach(([x, y0, y1]) => elipse(aA + x - 0.006, bA + x - 0.006, 24).forEach(([px, pz]) => { const v = K.malla(K.caja(0.12, r2((y1 - y0) * 0.85), 0.012), RO.hueco, { sinTinta: true }); v.position.set(px, (y0 + y1) / 2 - 0.005, pz); v.rotation.y = Math.atan2(px / (aA * aA), pz / (bA * bA)); g.add(v); }));
  /* la arena y su tablado (el hipogeo de Domiciano queda abajo, tapado) */
  const ar = new THREE.Shape(); ar.absellipse(0, 0, aA, bA, 0, Math.PI * 2, false);
  const at = texArena().clone(); at.needsUpdate = true; at.repeat.set(4, 4);
  const arena = new THREE.Mesh(propia(new THREE.ShapeGeometry(ar, 24)), K.matMapa(at)); arena.rotation.x = -Math.PI / 2; arena.position.y = 0.02; arena.receiveShadow = true;
  const uv = arena.geometry.getAttribute('uv'), pp = arena.geometry.getAttribute('position'); for (let i = 0; i < uv.count; i++) uv.setXY(i, pp.getX(i) / 2, pp.getY(i) / 2);
  g.add(arena);
  /* el toldo (velarium) a medio tender en un costado: lo manejaban marineros de la flota de Miseno */
  const vpos = [], vcol = [], c1 = new THREE.Color(RO.telaB), c2 = new THREE.Color('#e5b25a');
  bahias.forEach((B, i) => {
    const t = Math.atan2(B.p[1] / b, B.p[0] / a); if (!(t > 2.25 || t < -2.6)) return;
    const q = bahias[(i + 1) % N].p, k = 0.6, yo = yTop + 0.2, yi = yTop - 0.02;
    const A = [B.p[0] * 1.01, yo, B.p[1] * 1.01], Bq = [q[0] * 1.01, yo, q[1] * 1.01], C = [q[0] * k, yi, q[1] * k], D = [B.p[0] * k, yi, B.p[1] * k], c = i % 2 ? c1 : c2;
    for (const v of [A, Bq, C, A, C, D]) { vpos.push(...v); vcol.push(c.r, c.g, c.b); }
  });
  const vg = new THREE.BufferGeometry(); vg.setAttribute('position', new THREE.Float32BufferAttribute(vpos, 3)); vg.setAttribute('color', new THREE.Float32BufferAttribute(vcol, 3)); vg.computeVertexNormals();
  g.add(K.malla(propia(vg), '#ffffff', { vertexColors: true, side: THREE.DoubleSide, sinTinta: true }));
  /* la plaza de travertino alrededor, con sus mojones */
  pon(g, anillo(K, a + 0.95, b + 0.95, a - 0.02, b - 0.02, 0.02, RO.travL, { seg: 40, sinTinta: true }), 0, 0, 0);
  elipse(a + 0.82, b + 0.82, 40).forEach(([x, z]) => pon(g, K.malla(K.cilindro(0.025, 0.03, 0.12, 5), RO.travD, { sinTinta: true }), x, 0.06, z));
  g.userData.alto = yTop; return g;
}
function metaSudans(K) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.42, 0.44, 0.07, 18), RO.travL, O(0.003)), 0, 0.035, 0);
  pon(g, K.malla(K.cilindro(0.38, 0.38, 0.02, 18), '#9fc0b8', { sinTinta: true }), 0, 0.065, 0);
  pon(g, K.malla(K.cilindro(0.1, 0.16, 0.5, 10), matLadrillo(K, 0.6, 0.5), O(0.003)), 0, 0.3, 0);
  pon(g, K.malla(K.cono(0.1, 0.3, 10), RO.ladL, O(0.003)), 0, 0.7, 0);
  pon(g, K.malla(K.esfera(0.045, 0.5), RO.bronce, O(0.002)), 0, 0.86, 0);
  return g;
}
function arcoTito(K) {
  const g = new THREE.Group(), W = 0.675, D = 0.24, H = 0.62;
  const s = new THREE.Shape(); s.moveTo(-W / 2, 0); s.lineTo(-W / 2, H); s.lineTo(W / 2, H); s.lineTo(W / 2, 0); s.lineTo(0.135, 0); s.lineTo(0.135, 0.28); s.absarc(0, 0.28, 0.135, 0, Math.PI, false); s.lineTo(-0.135, 0); s.closePath();
  const geo = propia(new THREE.ExtrudeGeometry(s, { depth: D, bevelEnabled: false, curveSegments: 8 })); geo.translate(0, 0, -D / 2);
  g.add(K.malla(geo, RO.marmol, O(0.004)));
  [-1, 1].forEach(l => [-1, 1].forEach(f => [0.17, 0.29].forEach(x => pon(g, K.malla(K.cilindro(0.02, 0.022, 0.4, 6), RO.marmolL, O(0.002)), l * x, 0.24, f * (D / 2 + 0.005)))));
  pon(g, caja(K, W + 0.03, 0.035, D + 0.03, RO.marmolL, O(0.003)), 0, H - 0.02, 0);
  pon(g, caja(K, W * 0.92, 0.15, D * 0.9, RO.marmol, O(0.003)), 0, H + 0.075, 0);
  const ins = lamina(K, letrero(K, 'SENATVS\nPOPVLVSQVE·ROMANVS\nDIVO·TITO·DIVI·VESPASIANI·F', { w: 256, h: 96, tam: 22 }), W * 0.8, 0.13); ins.position.set(0, H + 0.075, D * 0.45 + 0.002); g.add(ins);
  return g;
}
function palatino(K, alt, H, gr = 0.005) {
  const g = new THREE.Group();
  g.add(relieve(K, -7.6, 1.2, -8.8, -3.95, 0.25, alt));
  /* el palacio de Domiciano (de Rabirio, Marcial VIII, 36): el aula regia entre la basílica y el larario, con su pórtico */
  const aula = new THREE.Group();
  pon(aula, caja(K, 1.6, 1.42, 1.95, matLadrillo(K, 1.95, 1.42), O(gr)), 0, 0.71, 0);
  pon(aula, caja(K, 1.64, 0.4, 1.99, RO.estuco, O(gr)), 0, 0.2, 0);
  for (let i = 0; i < 3; i++) pon(aula, caja(K, 0.22, 0.36, 0.012, RO.hueco, { sinTinta: true }), -0.5 + i * 0.5, 1.0, 0.98);
  pon(aula, caja(K, 1.68, 0.06, 2.03, RO.travL, O(gr)), 0, 1.45, 0);
  pon(aula, tejado(K, 1.68, 2.03, 0.33, { frontis: RO.estuco, gr }), 0, 1.48, 0);
  for (let i = 0; i < 6; i++) pon(aula, columna(K, 0.5, 0.045, { color: RO.giallo, capitel: RO.marmolL, gr: 0.003, lados: 8 }), -0.7 + i * 0.28, 0, 1.15);
  pon(aula, caja(K, 1.6, 0.06, 0.3, RO.marmolL, O(gr)), 0, 0.53, 1.12);
  pon(aula, tejadoUnAgua(K, 1.6, 0.3, 0.08), 0, 0.64, 1.12);
  pon(g, aula, -2.75, H - 0.02, -6.6);
  [[-4.1, 0.75], [-1.4, 0.75]].forEach(([x, w]) => { const b = new THREE.Group(); pon(b, caja(K, w, 0.9, 1.6, matLadrillo(K, 1.6, 0.9), O(gr)), 0, 0.45, 0); pon(b, caja(K, w + 0.04, 0.3, 1.64, RO.estuco, O(gr)), 0, 0.15, 0); pon(b, tejado(K, w + 0.04, 1.64, 0.18, { frontis: RO.estuco, gr }), 0, 0.9, 0); pon(g, b, x, H - 0.02, -6.75); });
  /* la Domus Augustana, más baja, y las subestructuras de arcos en la ladera que da al valle */
  [[-5.6, -7.5, 1.1, 0.6], [-5.4, -6.3, 0.9, 0.5]].forEach(([x, z, w, h]) => { const b = new THREE.Group(); pon(b, caja(K, w, h, 0.8, matLadrillo(K, w, h), O(gr)), 0, h / 2, 0); pon(b, tejado(K, w + 0.04, 0.84, 0.14, { frontis: RO.lad, gr }), 0, h, 0); pon(g, b, x, alt(x, z) - 0.03, z); });
  pon(g, fachadaArcos(K, 3.2, 10, [{ h: 0.5, arranque: 0.45 }, { h: 0.42, arranque: 0.45 }], { grueso: 0.07, color: RO.lad, colorCol: RO.ladL, colorEnt: RO.travL, gr }), -3.4, 0, -4.35);
  pon(g, caja(K, 3.1, 0.88, 0.35, RO.sombraD, O(gr)), -3.4, 0.44, -4.58);
  [[-6.9, -7.4, 'p', 1.25], [-6.4, -5.2, 'p', 1.15], [-0.4, -5.0, 'p', 1.2], [0.3, -6.6, 'c', 1.0], [-1.2, -8.0, 'p', 1.1], [-4.8, -8.2, 'c', 0.95], [-6.8, -6.3, 'c', 1.0], [0.6, -7.8, 'p', 1.1], [-5.9, -4.6, 'c', 0.9]].forEach(([x, z, t, s], i) => { const a = t === 'p' ? pino(K, s, 51 + i) : cipres(K, s, 61 + i); a.position.set(x, alt(x, z) - 0.02, z); g.add(a); });
  return g;
}
export function coliseoPalatino(K) {
  const g = new THREE.Group(), H = 1.62;
  const alt = meseta(H, -6.6, -0.2, -8.3, -5.25, [0.7, 1.0, 0.4, 0.95]);
  pon(g, coliseo(K), 0, 0, 0);
  g.add(palatino(K, alt, H));
  pon(g, metaSudans(K), -5.55, 0, -2.5);
  pon(g, arcoTito(K), -6.7, 0, -3.2, Math.PI / 2);
  pon(g, caja(K, 4.0, 0.02, 0.5, matLosas(K, 4, 0.5), { sinTinta: true, sombra: false }), -5.6, 0.01, -2.95);
  g.userData.alt = alt; g.userData.escala = ESCALA.coliseo;
  return g;
}
export function heroe(K, variante = VARIANTES.heroe) {
  if (variante === 'trajano') return foroTrajano(K);
  if (variante === 'coliseo') return coliseoPalatino(K);
  return foroRomano(K);
}

/* =====================================================================================================================
   2 · LA SEGUNDA PIEZA
   ===================================================================================================================== */
/* ---------- A · LA ISLA TIBERINA: el templo de Esculapio, la proa de travertino y el puente Fabricio ----------
   La isla mira con su larga a x (el Tíber corre a lo largo de ella); el puente sale hacia −z, a la orilla del Campo de
   Marte. Sin agua: la pone quien la usa (la hoja o la maqueta), al nivel y = −0.04. */
export function puenteFabricio(K, { largo = 1.75, ancho = 0.42, gr = 0.004 } = {}) {
  const g = new THREE.Group(), hd = 0.42, ra = 0.32, yc = -0.08;
  const s = new THREE.Shape(); s.moveTo(-largo / 2, -0.12); s.lineTo(-largo / 2, hd); s.lineTo(largo / 2, hd); s.lineTo(largo / 2, -0.12);
  [0.45, -0.45].forEach(cx => { s.lineTo(cx + ra * Math.cos(0.22), -0.12); s.lineTo(cx + ra * Math.cos(0.22), yc + ra * Math.sin(0.22)); s.absarc(cx, yc, ra, 0.22, Math.PI - 0.22, false); s.lineTo(cx - ra * Math.cos(0.22), -0.12); });
  s.closePath();
  const geo = propia(new THREE.ExtrudeGeometry(s, { depth: ancho, bevelEnabled: false, curveSegments: 10 })); geo.translate(0, 0, -ancho / 2);
  g.add(K.malla(geo, matLadrillo(K, 1.2, 0.5), O(gr)));
  [0.45, -0.45].forEach(cx => [-1, 1].forEach(l => { const t = K.malla(K.toro(ra + 0.02, 0.022, Math.PI - 0.44, 0.6), RO.travL, O(gr * 0.6)); t.rotation.z = 0.22; t.position.set(cx, yc, l * (ancho / 2 + 0.006)); g.add(t); }));
  [-1, 1].forEach(l => { const f = K.malla(propia(new THREE.CircleGeometry(0.05, 10, 0, Math.PI)), RO.hueco, { sinTinta: true }); f.position.set(0, 0.16, l * (ancho / 2 + 0.004)); if (l < 0) f.rotation.y = Math.PI; g.add(f); pon(g, caja(K, 0.1, 0.11, 0.004, RO.hueco, { sinTinta: true }), 0, 0.105, l * (ancho / 2 + 0.003)); });
  [-1, 1].forEach(l => pon(g, caja(K, largo, 0.09, 0.04, RO.travL, O(gr)), 0, hd + 0.045, l * (ancho / 2 - 0.02)));
  const ins = lamina(K, letrero(K, 'L·FABRICIVS·C·F·CVR·VIAR·FACIVNDVM·COERAVIT', { w: 512, h: 40, tam: 24, fondo: RO.travL }), 0.95, 0.05); ins.position.set(0, hd - 0.05, ancho / 2 + 0.003); g.add(ins);
  [-1, 1].forEach(l => pon(g, figura(K, 0.12, { color: RO.marmolD, gr: 0.002 }), l * 0.25, hd + 0.09, ancho / 2 - 0.02));
  /* las rampas de las cabezas: a la isla (más alta) y a la orilla */
  [[1, 0.04, 0.55], [-1, 0.17, 0.4]].forEach(([l, hf, lr]) => { const a = Math.atan2(hd - hf, lr), t = K.malla(K.caja(r2(Math.hypot(lr, hd - hf)), 0.05, r2(ancho)), RO.travD, O(gr)); t.rotation.z = l * -a; t.position.set(l * (largo / 2 + lr / 2), (hd + hf) / 2 - 0.02, 0); g.add(t); });
  return g;
}
/* el templo redondo de Hércules Víctor en el Foro Boario (siglo II a. C., sigue en pie): veinte columnas alrededor de la cella */
export function tholos(K, { r = 0.37, colH = 0.53, gr = 0.004 } = {}) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) pon(g, K.malla(K.cilindro(r2(r + 0.08 - i * 0.03), r2(r + 0.08 - i * 0.03), 0.035, 24), i % 2 ? RO.travD : RO.trav, O(gr)), 0, 0.0175 + i * 0.035, 0);
  for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; pon(g, columna(K, colH, 0.026, { gr: 0.003, lados: 7 }), Math.sin(a) * r, 0.105, Math.cos(a) * r); }
  pon(g, K.malla(K.cilindro(r * 0.68, r * 0.68, colH, 18), RO.marmolD, O(gr)), 0, 0.105 + colH / 2, 0);
  pon(g, caja(K, 0.12, colH * 0.6, 0.02, RO.bronce, O(0.002)), 0, 0.105 + colH * 0.3, r * 0.68);
  pon(g, K.malla(K.cilindro(r + 0.04, r + 0.04, 0.06, 24), RO.marmolL, O(gr)), 0, 0.105 + colH + 0.03, 0);
  pon(g, K.malla(K.cono(r + 0.07, 0.24, 24), matTejas(K, 0.4, 2.4), O(gr)), 0, 0.105 + colH + 0.06 + 0.12, 0);
  g.userData.alto = 0.105 + colH + 0.3; return g;
}
export function islaTiberina(K, { gr = 0.005 } = {}) {
  const g = new THREE.Group(), L = 2.35, A = 0.88, hI = 0.17;
  const s = new THREE.Shape(); s.moveTo(L, 0); s.quadraticCurveTo(L * 0.55, A * 1.05, 0, A); s.quadraticCurveTo(-L * 0.7, A * 0.95, -L, 0.05); s.lineTo(-L, -0.05); s.quadraticCurveTo(-L * 0.7, -A * 0.95, 0, -A); s.quadraticCurveTo(L * 0.55, -A * 1.05, L, 0); s.closePath();
  const geo = propia(new THREE.ExtrudeGeometry(s, { depth: hI + 0.1, bevelEnabled: false, curveSegments: 10 })); geo.rotateX(-Math.PI / 2); geo.translate(0, -0.1, 0);
  g.add(K.malla(geo, RO.tobaD, O(gr)));
  const top = new THREE.Mesh(propia(new THREE.ShapeGeometry(s, 10)), K.mat('#e6d8b6')); top.rotation.x = -Math.PI / 2; top.position.y = hI + 0.002; top.receiveShadow = true; g.add(top);
  /* la proa de travertino con el bastón de Esculapio y su serpiente (todavía se ve en la punta de aguas abajo) */
  const pr = new THREE.Shape(); pr.moveTo(L + 0.06, 0); pr.lineTo(L - 0.75, 0.42); pr.lineTo(L - 0.75, -0.42); pr.closePath();
  const pg = propia(new THREE.ExtrudeGeometry(pr, { depth: 0.36, bevelEnabled: false })); pg.rotateX(-Math.PI / 2); pg.translate(0, -0.08, 0);
  g.add(K.malla(pg, matSillar(K, 1.2, 0.5), O(gr)));
  const rel = textura('ro-esculapio', 64, 64, (q, w, h) => { q.fillStyle = RO.trav; q.fillRect(0, 0, w, h); q.strokeStyle = '#9d8a6a'; q.lineWidth = 4; q.beginPath(); q.moveTo(32, 8); q.lineTo(32, 58); q.stroke(); q.lineWidth = 3; q.beginPath(); for (let y = 12; y < 54; y++) q.lineTo(32 + Math.sin(y * 0.35) * 9, y); q.stroke(); });
  const rl = lamina(K, matTex(K, 'ro-esculapio', rel), 0.22, 0.22); rl.position.set(L - 0.345 + 0.0025, 0.13, 0.21 + 0.005); rl.rotation.y = Math.atan2(0.42, 0.81); g.add(rl);
  /* el obelisco que hacía de mástil */
  pon(g, caja(K, 0.14, 0.12, 0.14, RO.travL, O(gr)), L - 0.95, hI + 0.06, 0);
  const ob = K.malla(K.cilindro(0.032, 0.055, 1.25, 4), RO.granito, O(gr)); ob.rotation.y = Math.PI / 4; ob.position.set(L - 0.95, hI + 0.12 + 0.625, 0); g.add(ob);
  const pi = K.malla(K.cono(0.032, 0.07, 4), RO.oro, O(gr)); pi.rotation.y = Math.PI / 4; pi.position.set(L - 0.95, hI + 0.12 + 1.25 + 0.035, 0); g.add(pi);
  /* el templo de Esculapio (291 a. C.) y el pórtico de los enfermos */
  pon(g, templo(K, { W: 1.0, L: 1.5, podio: 0.33, colH: 0.98, frente: 4, filas: 2, orden: 'jonico', estatua: () => figura(K, 0.2, { color: RO.oro, gr: 0.003 }) }), -0.75, hI, 0.1);
  const po = new THREE.Group();
  for (let i = 0; i < 6; i++) pon(po, columna(K, 0.5, 0.032, { orden: 'toscano', estriada: false, color: RO.travL, gr: 0.003, lados: 6 }), -0.65 + i * 0.26, 0, 0.12);
  pon(po, caja(K, 1.45, 0.5, 0.06, RO.estuco, O(gr)), 0, 0.25, -0.14);
  pon(po, caja(K, 1.48, 0.04, 0.34, RO.travL, O(gr)), 0, 0.52, -0.01);
  pon(po, tejadoUnAgua(K, 1.46, 0.34, 0.09), 0, 0.62, -0.01);
  pon(g, po, 0.8, hI, 0.36);
  [[-1.8, 0.2, 'p', 1.05], [-1.95, -0.35, 'c', 0.85], [-0.1, -0.55, 'c', 0.8], [1.35, -0.4, 'p', 0.75]].forEach(([x, z, t, s], i) => { const a = t === 'p' ? pino(K, s, 71 + i) : cipres(K, s, 81 + i); a.position.set(x, hI, z); g.add(a); });
  /* el puente Fabricio (62 a. C., sigue en pie) a la orilla del Campo de Marte */
  const pf = puenteFabricio(K); pf.rotation.y = Math.PI / 2; pf.position.set(0.25, 0, -A - 0.7); g.add(pf);
  /* una barca del río con su remero */
  const barca = new THREE.Group(); pon(barca, K.malla(K.capsula(0.06, 0.34, 0.5), RO.maderaD, O(0.003)), 0, 0.0, 0).rotation.z = Math.PI / 2; barca.children[0].scale.set(1, 1, 0.6); pon(barca, caja(K, 0.12, 0.08, 0.08, RO.telaB, O(0.002)), 0.06, 0.07, 0); pon(barca, figura(K, 0.14, { color: RO.tela, cabeza: '#dcae84' }), -0.12, 0.04, 0); pon(g, barca, 1.3, -0.02, 1.25, 0.2);
  g.userData.alto = hI + 0.33 + 0.98 + 0.2 + 0.2 + 0.2;
  return g;
}
/* ---------- C · LOS ARCOS DEL ACUEDUCTO (el Aqua Claudia con el Anio Novus encima) ---------- */
export function acueducto(K, { n = 6, vano = 0.52, pila = 0.3, alto = 1.92, prof = 0.36, gr = 0.005 } = {}) {
  const g = new THREE.Group(), bay = vano + pila, L = n * bay;
  const s = formaArcos(L, alto, n, vano, alto - vano / 2 - 0.1);
  const geo = propia(new THREE.ExtrudeGeometry(s, { depth: prof, bevelEnabled: false, curveSegments: 8 })); geo.translate(0, 0, -prof / 2);
  const t = sillarToba().clone(); t.needsUpdate = true; t.repeat.set(2.6, 2.6);
  g.add(K.malla(geo, K.matMapa(t), O(gr)));
  [-1, 1].forEach(l => pon(g, caja(K, pila / 2, alto, prof, matSillar(K, 0.3, alto, true), O(gr)), l * (L / 2 + pila / 4), alto / 2, 0));
  for (let i = 0; i <= n; i++) pon(g, caja(K, r2(pila + 0.04), 0.04, prof + 0.04, RO.travL, O(gr * 0.6)), -L / 2 + i * bay, alto - vano / 2 - 0.1, 0);
  pon(g, caja(K, L + pila + 0.06, 0.05, prof + 0.06, RO.travL, O(gr)), 0, alto + 0.025, 0);
  pon(g, caja(K, L + pila, 0.3, prof, matSillar(K, L, 0.3, true), O(gr)), 0, alto + 0.05 + 0.15, 0);
  pon(g, caja(K, L + pila + 0.05, 0.04, prof + 0.05, RO.travL, O(gr)), 0, alto + 0.37, 0);
  pon(g, caja(K, L + pila, 0.24, prof * 0.86, matLadrillo(K, L, 0.24), O(gr)), 0, alto + 0.39 + 0.12, 0);
  pon(g, caja(K, L + pila + 0.04, 0.035, prof * 0.86 + 0.04, RO.travL, O(gr)), 0, alto + 0.648, 0);
  const ins = lamina(K, letrero(K, 'TI·CLAVDIVS·DRVSI·F·CAISAR·AVGVSTVS', { w: 512, h: 40, tam: 26, fondo: RO.toba }), 1.8, 0.1); ins.position.set(0, alto + 0.2, prof / 2 + 0.002); g.add(ins);
  /* el camino que pasa bajo un arco, el carro de bueyes y el pastor con sus ovejas */
  pon(g, caja(K, 0.42, 0.012, 2.6, '#d8c393', { sinTinta: true, sombra: false }), -L / 2 + bay * 1.5, 0.006, 0.2);
  const carro = new THREE.Group(); pon(carro, caja(K, 0.18, 0.08, 0.32, RO.madera, O(0.003)), 0, 0.12, 0); [-1, 1].forEach(l => pon(carro, K.malla(K.cilindro(0.07, 0.07, 0.025, 10), RO.maderaD, O(0.002)), l * 0.11, 0.07, 0).rotation.z = Math.PI / 2); pon(carro, anfora(K, 0.6, '#c27a4a'), 0, 0.16, 0.05); pon(carro, anfora(K, 0.6, '#b56f44'), 0, 0.16, -0.07);
  const buey = burro(K, '#cbb79a'); buey.rotation.y = -Math.PI / 2; buey.scale.setScalar(1.15); buey.position.set(0, 0, 0.36); carro.add(buey);
  pon(g, carro, -L / 2 + bay * 1.5, 0, 0.75);
  const ovejas = new THREE.Group(); for (let i = 0; i < 6; i++) { const o = K.malla(K.esfera(1, 0.45), i === 4 ? '#5a4a40' : '#f2ecdf', O(0.002)); o.scale.set(0.07, 0.05, 0.05); o.position.set(h3(i, 1) * 0.6, 0.06, h3(i, 2) * 0.4); ovejas.add(o); }
  pon(ovejas, figura(K, 0.24, { color: RO.telaV, cabeza: '#c08a60' }), -0.15, 0, 0.2); pon(g, ovejas, L / 2 - 0.9, 0, 0.55);
  [[L / 2 + 0.55, -0.35, 'c', 1.1], [L / 2 + 0.45, 0.45, 'p', 1.15], [-L / 2 - 0.5, -0.3, 'p', 1.2]].forEach(([x, z, tt, sc], i) => { const a = tt === 'p' ? pino(K, sc, 91 + i) : cipres(K, sc, 95 + i); a.position.set(x, 0, z); g.add(a); });
  g.userData.alto = alto + 0.67; return g;
}
export function segunda(K, variante = VARIANTES.segunda) {
  if (variante === 'julia') { const b = basilicaJulia(K, { L: 4.2, W: 2.4, n: 14, m: 8, h1: 0.78, h2: 0.66, alto: 1.95, juegos: true }); return b; }
  if (variante === 'acueducto') return acueducto(K);
  return islaTiberina(K);
}

/* =====================================================================================================================
   3 · LAS CASAS
   ===================================================================================================================== */
const hueco = (K, w, h) => K.malla(K.caja(r2(w), r2(h), 0.012), RO.hueco, { sinTinta: true });
/* las persianas de madera abiertas a los lados de una ventana */
function ventana(K, g, x, y, z, w = 0.07, h = 0.1, { persiana = true, ry = 0 } = {}) {
  const v = new THREE.Group(); pon(v, hueco(K, w, h), 0, 0, 0);
  pon(v, caja(K, r2(w + 0.03), 0.014, 0.025, RO.travL, O(0.002)), 0, -h / 2 - 0.005, 0.008);
  if (persiana) [-1, 1].forEach(l => pon(v, caja(K, r2(w * 0.5), r2(h), 0.01, RO.maderaL, O(0.002)), l * w * 0.78, 0, 0.01));
  v.position.set(x, y, z); v.rotation.y = ry; g.add(v); return v;
}
/* la ínsula: tiendas abajo (tabernae con su entresuelo), pisos de ventanas, balcón sobre ménsulas y techo de tejas o terraza */
export function insula(K, { w = 1.3, d = 1.0, pisos = 3, h1 = 0.36, hp = 0.29, balcon = false, terraza = false, tiendas = 3, abierta = 1, toldo = null, ropa = false, semilla = 1, gr = 0.004 } = {}) {
  const g = new THREE.Group(), H = h1 + pisos * hp;
  pon(g, caja(K, w, H, d, matLadrillo(K, w, H), O(gr)), 0, H / 2, 0);
  const sw = w / tiendas;
  for (let i = 0; i < tiendas; i++) {
    const x = -w / 2 + (i + 0.5) * sw;
    pon(g, hueco(K, sw * 0.62, h1 * 0.66), x, h1 * 0.33, d / 2 + 0.003);
    pon(g, caja(K, r2(sw * 0.74), 0.03, 0.03, RO.travL, O(0.002)), x, h1 * 0.68, d / 2 + 0.012);
    if (i !== abierta) for (let k = 0; k < 4; k++) pon(g, caja(K, r2(sw * 0.62 / 4 - 0.004), r2(h1 * 0.64), 0.008, k % 2 ? RO.madera : RO.maderaL, { sinTinta: true }), x - sw * 0.31 + (k + 0.5) * sw * 0.62 / 4, h1 * 0.33, d / 2 + 0.008);
    else { pon(g, caja(K, r2(sw * 0.56), 0.1, 0.07, RO.marmolD, O(0.002)), x, 0.05, d / 2 + 0.035); [-0.1, 0, 0.1].forEach((dx, k) => pon(g, anfora(K, 0.42, ['#c27a4a', '#b56f44', '#d08a58'][k]), x + dx * sw, 0, d / 2 + 0.1)); }
    pon(g, hueco(K, sw * 0.24, 0.05), x, h1 * 0.84, d / 2 + 0.003);
  }
  for (let p = 0; p < pisos; p++) {
    const y = h1 + p * hp + hp * 0.5, nv = Math.max(2, Math.round(w / 0.3));
    pon(g, caja(K, w + 0.015, 0.018, d + 0.015, RO.ladD, { sinTinta: true }), 0, h1 + p * hp, 0);
    for (let i = 0; i < nv; i++) ventana(K, g, -w / 2 + (i + 0.5) * w / nv, y, d / 2 + 0.004, 0.07, 0.1, { persiana: h3(semilla, p, i) > 0.4 });
    const nl = Math.max(1, Math.round(d / 0.32)); for (let i = 0; i < nl; i++) ventana(K, g, w / 2 + 0.004, y, -d / 2 + (i + 0.5) * d / nl, 0.06, 0.09, { persiana: h3(i, p, semilla) > 0.5, ry: Math.PI / 2 });
  }
  if (balcon) {   // el balcón de madera sobre ménsulas de ladrillo, como en la casa de Diana de Ostia
    const yb = h1 + 0.02;
    pon(g, caja(K, w * 0.92, 0.025, 0.14, RO.madera, O(0.003)), 0, yb, d / 2 + 0.07);
    for (let i = 0; i < 5; i++) pon(g, caja(K, 0.035, 0.05, 0.13, RO.ladD, O(0.002)), -w * 0.42 + i * w * 0.21, yb - 0.035, d / 2 + 0.065);
    for (let i = 0; i <= 10; i++) pon(g, K.malla(K.cilindro(0.005, 0.005, 0.09, 4), RO.maderaD, { sinTinta: true }), -w * 0.45 + i * w * 0.09, yb + 0.055, d / 2 + 0.135);
    pon(g, caja(K, w * 0.92, 0.012, 0.012, RO.maderaD, { sinTinta: true }), 0, yb + 0.1, d / 2 + 0.135);
    [-0.3, 0.05, 0.32].forEach((f, i) => { pon(g, K.malla(K.cilindro(0.025, 0.02, 0.035, 6), RO.teja, O(0.002)), f * w, yb + 0.03, d / 2 + 0.1); const m = K.malla(K.esfera(1, 0.45), i % 2 ? RO.pinoL : '#d9707a', O(0.002)); m.scale.setScalar(0.032); m.position.set(f * w, yb + 0.075, d / 2 + 0.1); g.add(m); });
  }
  if (toldo) { const t = K.malla(K.caja(r2(sw * 0.9), 0.012, 0.2), toldo, O(0.002)); t.rotation.x = 0.35; t.position.set(-w / 2 + (abierta + 0.5) * sw, h1 * 0.78, d / 2 + 0.1); g.add(t); }
  if (ropa) { const r = tendedero(K, w * 0.5, [RO.telaB, RO.tela, RO.telaA]); r.position.set(-w * 0.1, h1 + hp * 1.15, d / 2 + 0.02); r.scale.setScalar(0.9); g.add(r); }
  pon(g, caja(K, w + 0.04, 0.03, d + 0.04, RO.travL, O(gr)), 0, H + 0.015, 0);
  if (terraza) {   // la terraza con su pérgola y las plantas (el jardín de arriba)
    pon(g, caja(K, w - 0.06, 0.06, d - 0.06, RO.ladL, O(gr)), 0, H + 0.045, 0);
    for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) pon(g, K.malla(K.cilindro(0.008, 0.008, 0.2, 4), RO.maderaD, { sinTinta: true }), px * w * 0.3, H + 0.13, pz * d * 0.25);
    for (let i = 0; i < 5; i++) pon(g, caja(K, w * 0.66, 0.008, 0.012, RO.madera, { sinTinta: true }), 0, H + 0.23, -d * 0.28 + i * d * 0.14);
    for (let i = 0; i < 4; i++) { const m = K.malla(K.esfera(1, 0.45), i % 2 ? RO.pino : RO.pinoL, O(0.002)); m.scale.set(0.09, 0.03, 0.06); m.position.set(-w * 0.25 + i * w * 0.17, H + 0.245, h3(i, 2) * 0.1 - 0.05); g.add(m); }
  } else pon(g, tejado(K, d + 0.06, w + 0.06, 0.16, { frontis: RO.lad }), 0, H + 0.03, 0).rotation.y = Math.PI / 2;
  g.userData.alto = H; return g;
}
/* la fuente de la calle (lacus): la pila de cuatro losas, el pilar con su cara y el chorro */
export function fuente(K) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.3, 0.11, 0.2, RO.travL, O(0.003)), 0, 0.055, 0);
  pon(g, caja(K, 0.26, 0.02, 0.16, '#a9c2b4', { sinTinta: true }), 0, 0.1, 0);
  pon(g, caja(K, 0.07, 0.22, 0.06, RO.trav, O(0.003)), 0, 0.11, -0.11);
  pon(g, K.malla(K.esfera(0.025, 0.4), RO.travD, O(0.002)), 0, 0.18, -0.075);
  pon(g, caja(K, 0.01, 0.07, 0.01, '#cfe3dc', { sinTinta: true }), 0, 0.13, -0.06);
  return g;
}
/* la domus: atrio con techo hacia adentro (compluvio) y su estanque (impluvio), tiendas a los lados de la puerta, y atrás el
   peristilo con su jardín, columnas pintadas de rojo abajo, la fuente y una estatua */
export function domus(K, { w = 1.5, d1 = 0.95, d2 = 0.9, h = 0.55, semilla = 1, gr = 0.004 } = {}) {
  const g = new THREE.Group(), D = d1 + d2, z1 = D / 2 - d1 / 2, z2 = -D / 2 + d2 / 2, e = 0.32;
  const fr = matRep(K, 'ro-fr', texFresco(), w / 0.6, 1);
  pon(g, caja(K, w, h, d1, RO.estuco, O(gr)), 0, h / 2, z1);
  pon(g, caja(K, w + 0.01, h * 0.22, d1 + 0.01, RO.rojo, { sinTinta: true }), 0, h * 0.11, z1);
  pon(g, hueco(K, 0.16, 0.34), 0, 0.17, D / 2 + 0.004); pon(g, caja(K, 0.15, 0.32, 0.01, RO.maderaD, O(0.002)), 0, 0.16, D / 2 + 0.008);
  pon(g, caja(K, 0.24, 0.035, 0.03, RO.travL, O(0.002)), 0, 0.36, D / 2 + 0.012);
  [-1, 1].forEach(l => { pon(g, hueco(K, 0.28, 0.3), l * w * 0.32, 0.15, D / 2 + 0.004); if (l > 0) for (let k = 0; k < 4; k++) pon(g, caja(K, 0.065, 0.29, 0.008, k % 2 ? RO.madera : RO.maderaL, { sinTinta: true }), l * w * 0.32 - 0.105 + k * 0.07, 0.15, D / 2 + 0.008); else pon(g, caja(K, 0.22, 0.09, 0.06, RO.marmolD, O(0.002)), l * w * 0.32, 0.045, D / 2 + 0.035); });
  for (let i = 0; i < 2; i++) ventana(K, g, w / 2 + 0.004, h * 0.72, z1 - 0.2 + i * 0.4, 0.04, 0.06, { persiana: false, ry: Math.PI / 2 });
  /* el techo del atrio: cuatro aguas que caen hacia el compluvio */
  const yt = h + 0.01, ca = 0.07;
  const fa = (largo, ancho, x, z, ry) => { const t = K.malla(K.caja(r2(largo), 0.02, r2(ancho)), matTejas(K, ancho, largo), O(0.003)); t.rotation.order = 'YXZ'; t.rotation.y = ry; t.rotation.x = -Math.atan2(ca, ancho); t.position.set(x, yt + ca / 2, z); g.add(t); };
  const iw = 0.34, idp = 0.28, bw = (w - iw) / 2, bd = (d1 - idp) / 2;
  fa(w, bd, 0, z1 + d1 / 2 - bd / 2, 0); fa(w, bd, 0, z1 - d1 / 2 + bd / 2, Math.PI); fa(d1 - 2 * bd + 0.01, bw, w / 2 - bw / 2, z1, Math.PI / 2); fa(d1 - 2 * bd + 0.01, bw, -w / 2 + bw / 2, z1, -Math.PI / 2);
  pon(g, caja(K, iw + 0.02, 0.012, idp + 0.02, RO.marmolL, O(0.002)), 0, h + 0.006, z1);
  pon(g, caja(K, iw - 0.06, 0.008, idp - 0.06, '#8fb6b0', { sinTinta: true }), 0, h + 0.012, z1);
  /* el peristilo: las alas bajas, las columnas pintadas, el jardín, la fuente y la estatua */
  const hp = h * 0.78;
  [-1, 1].forEach(l => { pon(g, caja(K, 0.22, hp, d2, RO.estuco, O(gr)), l * (w / 2 - 0.11), hp / 2, z2); pon(g, tejadoUnAgua(K, d2, 0.24, 0.06), l * (w / 2 - 0.11), hp + 0.06, z2).rotation.y = l > 0 ? -Math.PI / 2 : Math.PI / 2; });
  pon(g, caja(K, w, hp, 0.2, RO.estuco, O(gr)), 0, hp / 2, -D / 2 + 0.1);
  pon(g, tejado(K, 0.26, w + 0.04, 0.09, { frontis: RO.estuco }), 0, hp, -D / 2 + 0.1).rotation.y = Math.PI / 2;
  pon(g, caja(K, w - 0.44, 0.02, d2 - 0.2, '#93a868', { sinTinta: true }), 0, 0.01, z2 + 0.02);
  const cols = [], gw = w - 0.44 - 0.12, gd = d2 - 0.32;
  for (let i = 0; i < 4; i++) cols.push([-gw / 2 + i * gw / 3, z2 + 0.02 + gd / 2], [-gw / 2 + i * gw / 3, z2 + 0.02 - gd / 2]);
  cols.push([-gw / 2, z2 + 0.02], [gw / 2, z2 + 0.02]);
  cols.forEach(([x, z]) => { pon(g, K.malla(K.cilindro(0.022, 0.024, hp * 0.38, 6), RO.rojo, O(0.002)), x, hp * 0.19, z); pon(g, K.malla(K.cilindro(0.018, 0.022, hp * 0.58, 6), RO.marmolL, O(0.002)), x, hp * 0.38 + hp * 0.29, z); });
  [[0, 1], [0, -1]].forEach(([_, l]) => pon(g, caja(K, gw + 0.12, 0.04, 0.12, RO.estuco, O(0.002)), 0, hp - 0.02, z2 + 0.02 + l * (gd / 2 + 0.02)));
  pon(g, K.malla(K.cilindro(0.08, 0.085, 0.05, 10), RO.marmol, O(0.002)), 0, 0.045, z2 + 0.02);
  pon(g, K.malla(K.cilindro(0.065, 0.065, 0.01, 10), '#a9c8c0', { sinTinta: true }), 0, 0.07, z2 + 0.02);
  pon(g, figura(K, 0.12, { color: RO.bronce, gr: 0.002 }), 0, 0.07, z2 + 0.02);
  [[-0.25, -0.12], [0.25, 0.1], [-0.22, 0.14], [0.22, -0.14]].forEach(([x, z], i) => { const m = K.malla(K.esfera(1, 0.45), i % 2 ? RO.pino : '#7da35a', O(0.002)); m.scale.set(0.06, 0.05, 0.06); m.position.set(x * w * 1.1, 0.05, z2 + z); g.add(m); if (i === 1) { const f = K.malla(K.esfera(1, 0.4), '#e88aa0', { sinTinta: true }); f.scale.setScalar(0.022); f.position.set(x * w * 1.1, 0.1, z2 + z); g.add(f); } });
  const p = lamina(K, fr, w - 0.46, hp * 0.6); p.position.set(0, hp * 0.3 + 0.02, -D / 2 + 0.202); g.add(p);
  g.userData.alto = h + 0.08; return g;
}
/* la panadería (pistrinum): los molinos de lava en forma de reloj de arena, el burro que gira y el horno de bóveda */
export function molinoLava(K) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.1, 0.11, 0.05, 10), RO.lavaD, O(0.002)), 0, 0.025, 0);
  pon(g, K.malla(K.cono(0.065, 0.12, 10), RO.lava, O(0.002)), 0, 0.11, 0);
  const gira = new THREE.Group(); gira.position.y = 0.05; g.add(gira);
  pon(gira, K.malla(K.cilindro(0.075, 0.035, 0.09, 10), RO.lava, O(0.002)), 0, 0.085, 0);
  pon(gira, K.malla(K.cilindro(0.035, 0.07, 0.08, 10), RO.lavaD, O(0.002)), 0, 0.17, 0);
  pon(gira, caja(K, 0.36, 0.018, 0.022, RO.madera, O(0.002)), 0, 0.13, 0);
  g.userData.gira = gira; return g;
}
export function panaderia(K, { gr = 0.004 } = {}) {
  const g = new THREE.Group(), w = 1.15, d = 0.7, h = 0.62;
  pon(g, caja(K, w, h, d, matLadrillo(K, w, h), O(gr)), 0, h / 2, -0.35);
  pon(g, caja(K, w + 0.01, 0.18, d + 0.01, RO.estuco, { sinTinta: true }), 0, 0.09, -0.35);
  pon(g, hueco(K, 0.24, 0.36), -0.25, 0.18, -0.35 + d / 2 + 0.004);
  ventana(K, g, 0.28, 0.42, -0.35 + d / 2 + 0.004, 0.08, 0.08);
  pon(g, tejado(K, d + 0.06, w + 0.06, 0.16, { frontis: RO.lad }), 0, h, -0.35).rotation.y = Math.PI / 2;
  const ins = lamina(K, letrero(K, 'PISTRINVM', { w: 256, h: 48, tam: 30, fondo: RO.estuco, tinta: RO.rojoD }), 0.36, 0.07); ins.position.set(-0.25, 0.46, -0.35 + d / 2 + 0.005); g.add(ins);
  /* el patio: los tres molinos, uno con su burro, el horno y el mostrador con el pan de ocho gajos */
  pon(g, caja(K, w, 0.012, 0.75, '#e2d2ae', { sinTinta: true, sombra: false }), 0, 0.006, 0.4);
  const molinos = [];
  [[-0.38, 0.32], [0.0, 0.5], [0.36, 0.3]].forEach(([x, z], i) => { const m = molinoLava(K); m.position.set(x, 0, z); g.add(m); molinos.push(m.userData.gira); });
  const bu = burro(K); bu.scale.setScalar(0.8); bu.position.set(0.17, 0, 0); bu.rotation.y = Math.PI / 2; molinos[1].add(bu); molinos[1].userData.vivo = true;
  const ho = new THREE.Group();
  const cu = K.malla(K.esfera(1, 0.6), RO.ladL, O(0.003)); cu.scale.set(0.2, 0.18, 0.2); cu.position.y = 0.06; ho.add(cu);
  pon(ho, caja(K, 0.44, 0.07, 0.44, matLadrillo(K, 0.44, 0.07), O(0.003)), 0, 0.035, 0);
  pon(ho, hueco(K, 0.1, 0.08), 0, 0.12, 0.19);
  pon(ho, K.malla(K.cilindro(0.025, 0.03, 0.12, 6), RO.lad, O(0.002)), 0.08, 0.27, -0.06);
  pon(g, ho, 0.36, 0, -0.35 + d / 2 + 0.25);
  pon(g, caja(K, 0.3, 0.12, 0.12, RO.marmolD, O(0.003)), -0.36, 0.06, 0.72);
  for (let i = 0; i < 5; i++) { const p = K.malla(K.cilindro(0.025, 0.028, 0.018, 8), '#c98a48', O(0.0015)); p.position.set(-0.47 + i * 0.055, 0.13, 0.72); g.add(p); }
  g.userData.molinos = molinos; return g;
}
/* la fullonica: las pilas de pisar la ropa, las tinas de enjuague, el tendedero de telas, la prensa; y en la esquina, las ánforas
   donde se juntaba la orina que blanqueaba la lana (Vespasiano le puso impuesto: «el dinero no huele», Suetonio, Vesp. 23) */
export function fullonica(K, { gr = 0.004 } = {}) {
  const g = new THREE.Group(), w = 1.0, d = 0.62, h = 0.72;
  pon(g, caja(K, w, h, d, RO.estuco, O(gr)), 0, h / 2, -0.4);
  pon(g, caja(K, w + 0.01, 0.16, d + 0.01, RO.ocre, { sinTinta: true }), 0, 0.08, -0.4);
  pon(g, caja(K, w + 0.04, 0.03, d + 0.04, RO.travL, O(gr)), 0, h + 0.015, -0.4);
  pon(g, hueco(K, 0.2, 0.34), -0.2, 0.17, -0.4 + d / 2 + 0.004);
  ventana(K, g, 0.22, 0.5, -0.4 + d / 2 + 0.004, 0.08, 0.09);
  ventana(K, g, w / 2 + 0.004, 0.5, -0.4, 0.07, 0.09, { ry: Math.PI / 2 });
  /* la terraza de arriba, con telas tendidas al sol */
  const t1 = tendedero(K, 0.7, [RO.telaB, RO.tela, RO.ocre, RO.telaA]); t1.position.set(0, h + 0.03, -0.4); g.add(t1);
  pon(g, caja(K, w, 0.012, 0.6, '#e2d2ae', { sinTinta: true, sombra: false }), 0, 0.006, 0.3);
  [[-0.3, 0.15], [-0.12, 0.15], [0.06, 0.15]].forEach(([x, z]) => { pon(g, K.malla(K.cilindro(0.06, 0.055, 0.1, 8), RO.travD, O(0.002)), x, 0.05, z); pon(g, K.malla(K.cilindro(0.05, 0.05, 0.01, 8), '#c9d8c8', { sinTinta: true }), x, 0.098, z); });
  pon(g, figura(K, 0.2, { color: RO.telaB, cabeza: '#c08a60', gr: 0.002 }), -0.12, 0.1, 0.15);
  for (let i = 0; i < 3; i++) { pon(g, caja(K, 0.2, 0.08 + i * 0.015, 0.2, RO.travL, O(0.002)), -0.35 + i * 0.23, 0.04 + i * 0.008, 0.45); pon(g, caja(K, 0.17, 0.01, 0.17, '#a9c8c0', { sinTinta: true }), -0.35 + i * 0.23, 0.085 + i * 0.015, 0.45); }
  const pr = new THREE.Group(); [-1, 1].forEach(l => pon(pr, K.malla(K.cilindro(0.012, 0.012, 0.3, 5), RO.maderaD, O(0.002)), l * 0.07, 0.15, 0)); pon(pr, caja(K, 0.18, 0.03, 0.06, RO.madera, O(0.002)), 0, 0.29, 0); pon(pr, K.malla(K.cilindro(0.01, 0.01, 0.16, 5), RO.maderaL, O(0.002)), 0, 0.2, 0); pon(pr, caja(K, 0.14, 0.04, 0.1, RO.telaB, O(0.002)), 0, 0.06, 0); pon(g, pr, 0.33, 0, 0.32);
  const t2 = tendedero(K, 0.5, [RO.tela, RO.telaB, RO.telaV]); t2.position.set(0.25, 0.0, 0.62); g.add(t2);
  [[0.48, 0.68], [0.52, 0.58], [0.43, 0.6]].forEach(([x, z], i) => pon(g, anfora(K, 0.55, ['#c27a4a', '#b56f44', '#cf8c5c'][i]), x, 0, z));
  return g;
}
/* el thermopolium: el mostrador en L con los dolia empotrados, pintado; los cántaros en su repisa, el toldo y el banco */
export function thermopolium(K, { gr = 0.004 } = {}) {
  const g = new THREE.Group(), w = 0.85, d = 0.65, h = 0.85;
  pon(g, caja(K, w, h, d, matLadrillo(K, w, h), O(gr)), 0, h / 2, -0.3);
  pon(g, caja(K, w + 0.01, 0.42, d + 0.01, RO.estuco, { sinTinta: true }), 0, 0.21, -0.3);
  pon(g, hueco(K, w * 0.8, 0.36), 0, 0.18, -0.3 + d / 2 + 0.003);
  pon(g, caja(K, w * 0.86, 0.035, 0.04, RO.travL, O(0.002)), 0, 0.37, -0.3 + d / 2 + 0.012);
  ventana(K, g, 0, 0.62, -0.3 + d / 2 + 0.004, 0.08, 0.09);
  const mo = textura('ro-mostrador', 64, 32, (q, W, H) => { q.fillStyle = '#e8dcc6'; q.fillRect(0, 0, W, H); const C = ['#b85a3e', '#7b8f6a', '#d4a24e', '#8b7d9a', '#f4efe6']; for (let i = 0; i < 70; i++) { q.fillStyle = C[Math.floor(h3(i, 3) * 5)]; q.fillRect(h3(i, 1) * W, h3(i, 2) * H, 3 + h3(i, 4) * 4, 2 + h3(i, 5) * 3); } q.fillStyle = RO.rojo; q.fillRect(0, 0, W, 4); });
  const mm = matTex(K, 'ro-mostrador', mo);
  pon(g, caja(K, 0.6, 0.16, 0.12, mm, O(0.003)), -0.08, 0.08, -0.3 + d / 2 + 0.12);
  pon(g, caja(K, 0.12, 0.16, 0.28, mm, O(0.003)), 0.28, 0.08, -0.3 + d / 2 + 0.06);
  [-0.28, -0.08, 0.12].forEach(x => pon(g, K.malla(K.cilindro(0.03, 0.03, 0.01, 8), RO.hueco, { sinTinta: true }), x, 0.162, -0.3 + d / 2 + 0.12));
  for (let i = 0; i < 4; i++) pon(g, K.malla(K.cilindro(0.016, 0.02, 0.05, 6), i % 2 ? RO.teja : RO.ocre, O(0.0015)), -0.25 + i * 0.1, 0.19, -0.3 + d / 2 + 0.1);
  const t = K.malla(K.caja(w * 0.9, 0.012, 0.26), RO.tela, O(0.002)); t.rotation.x = 0.3; t.position.set(0, 0.5, -0.3 + d / 2 + 0.13); g.add(t);
  for (let i = 0; i < 5; i++) pon(g, caja(K, w * 0.18, 0.004, 0.262, RO.telaB, { sinTinta: true }), -w * 0.36 + i * w * 0.18, 0.507 + 0, -0.3 + d / 2 + 0.13).rotation.x = 0.3;
  pon(g, caja(K, 0.36, 0.04, 0.1, RO.madera, O(0.002)), -0.15, 0.1, 0.42); [-1, 1].forEach(l => pon(g, caja(K, 0.03, 0.08, 0.08, RO.maderaD, O(0.002)), -0.15 + l * 0.15, 0.04, 0.42));
  pon(g, tejado(K, d + 0.06, w + 0.06, 0.14, { frontis: RO.lad }), 0, h, -0.3).rotation.y = Math.PI / 2;
  const ins = lamina(K, letrero(K, 'C·IVLIVM·POLYBIVM\nAED·O·V·F', { w: 256, h: 64, tam: 22, fondo: RO.estuco, tinta: RO.rojoD }), 0.34, 0.085); ins.position.set(w / 2 + 0.003, 0.25, -0.3); ins.rotation.y = Math.PI / 2; g.add(ins);
  return g;
}
/* las casas, en grupitos de 4-6 sobre un solar de 4 × 3 (con lo de afuera) */
export function barrio(K, variante = VARIANTES.casas) {
  const g = new THREE.Group();
  if (variante === 'domus') {
    pon(g, caja(K, 4.0, 0.012, 0.42, '#c9bca2', { sinTinta: true, sombra: false }), 0, 0.006, 0.88);
    [-1, 1].forEach(l => pon(g, caja(K, 4.0, 0.05, 0.1, RO.travL, O(0.002)), 0, 0.025, 0.88 + l * 0.26));
    [-0.15, 0, 0.15].forEach(dz => pon(g, K.malla(K.cilindro(0.055, 0.06, 0.05, 8), RO.peper, O(0.002)), 0.4, 0.025, 0.88 + dz));
    pon(g, domus(K, { w: 1.6, d1: 1.0, d2: 1.0, h: 0.6, semilla: 2 }), -0.95, 0, -0.3);
    pon(g, domus(K, { w: 1.15, d1: 0.8, d2: 0.75, h: 0.5, semilla: 5 }), 1.15, 0, -0.45);
    const pe = new THREE.Group();
    for (const [x, z] of [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]]) pon(pe, K.malla(K.cilindro(0.015, 0.015, 0.36, 5), RO.marmolL, O(0.002)), x, 0.18, z);
    for (let i = 0; i < 5; i++) pon(pe, caja(K, 0.68, 0.012, 0.02, RO.madera, { sinTinta: true }), 0, 0.37, -0.22 + i * 0.11);
    for (let i = 0; i < 6; i++) { const m = K.malla(K.esfera(1, 0.45), i % 2 ? '#7da35a' : RO.pinoL, O(0.002)); m.scale.set(0.12, 0.04, 0.09); m.position.set(-0.25 + (i % 3) * 0.25, 0.39, -0.1 + Math.floor(i / 3) * 0.2); pe.add(m); }
    [[0, -0.15, 0.5, 0.12], [-0.18, 0.05, 0.12, 0.3], [0.18, 0.05, 0.12, 0.3]].forEach(([x, z, w, d]) => pon(pe, caja(K, w, 0.08, d, RO.estuco, O(0.002)), x, 0.04, z));
    pon(pe, K.malla(K.cilindro(0.06, 0.06, 0.08, 8), RO.marmol, O(0.002)), 0, 0.04, 0.05);
    pon(g, pe, 1.25, 0, 0.42 - 0.02 + 0.0 - 0.0);
    pon(g, fuente(K), -1.75, 0, 0.62);
    [[1.9, -1.2, 'c', 0.95], [1.55, -1.3, 'c', 0.85], [-1.95, -1.3, 'p', 1.0]].forEach(([x, z, t, s], i) => { const a = t === 'p' ? pino(K, s, 101 + i) : cipres(K, s, 111 + i); a.position.set(x, 0, z); g.add(a); });
    return g;
  }
  if (variante === 'oficios') {
    pon(g, caja(K, 4.0, 0.012, 0.36, '#c9bca2', { sinTinta: true, sombra: false }), 0, 0.006, 1.25);
    pon(g, panaderia(K), -1.25, 0, -0.35);
    pon(g, fullonica(K), 0.25, 0, -0.42);
    pon(g, thermopolium(K), 1.45, 0, -0.38);
    pon(g, insula(K, { w: 0.9, d: 0.7, pisos: 2, h1: 0.34, hp: 0.27, tiendas: 2, abierta: 0, ropa: true, semilla: 7 }), 0.95, 0, -1.15);
    pon(g, fuente(K), -0.45, 0, 1.0);
    [[-1.9, -1.25, 'p', 1.05], [1.95, 0.9, 'c', 0.9]].forEach(([x, z, t, s], i) => { const a = t === 'p' ? pino(K, s, 121 + i) : cipres(K, s, 131 + i); a.position.set(x, 0, z); g.add(a); });
    g.userData.molinos = g.children[1].userData.molinos;
    return g;
  }
  /* las ínsulas: la de la esquina con su balcón (la casa de Diana), la de la taberna con su toldo, la angosta con la terraza
     y la ropa tendida, una casa baja con la escalera de afuera; la fuente y las ánforas de la calle */
  pon(g, caja(K, 4.0, 0.012, 0.4, '#c9bca2', { sinTinta: true, sombra: false }), 0, 0.006, 1.0);
  pon(g, insula(K, { w: 1.4, d: 1.05, pisos: 4, h1: 0.38, hp: 0.3, balcon: true, tiendas: 3, abierta: 1, semilla: 1 }), -1.15, 0, -0.35);
  pon(g, insula(K, { w: 1.0, d: 0.9, pisos: 3, h1: 0.36, hp: 0.29, tiendas: 2, abierta: 0, toldo: RO.tela, ropa: true, semilla: 3 }), 0.25, 0, -0.42);
  pon(g, insula(K, { w: 0.75, d: 0.9, pisos: 3, h1: 0.34, hp: 0.28, tiendas: 1, abierta: 9, terraza: true, semilla: 5 }), 1.2, 0, -0.42);
  const cb = new THREE.Group();
  pon(cb, caja(K, 0.7, 0.62, 0.6, matLadrillo(K, 0.7, 0.62), O(0.004)), 0, 0.31, 0);
  pon(cb, tejado(K, 0.66, 0.76, 0.16, { frontis: RO.lad }), 0, 0.62, 0).rotation.y = Math.PI / 2;
  pon(cb, hueco(K, 0.14, 0.24), -0.15, 0.12, 0.304); pon(cb, caja(K, 0.13, 0.23, 0.01, RO.madera, O(0.002)), -0.15, 0.12, 0.31);
  ventana(K, cb, 0.18, 0.46, 0.304);
  for (let i = 0; i < 6; i++) pon(cb, caja(K, 0.1, 0.04 + i * 0.05, 0.06, RO.travL, O(0.002)), 0.4, (0.04 + i * 0.05) / 2, 0.26 - i * 0.065);
  pon(cb, hueco(K, 0.1, 0.18), 0.351, 0.44, -0.12).rotation.y = Math.PI / 2;
  pon(g, cb, 1.55, 0, 0.62 - 0.0);
  pon(g, fuente(K), -0.25, 0, 0.75);
  [[-1.85, 0.45, 'c', 0.9], [1.95, -1.15, 'p', 1.05]].forEach(([x, z, t, s], i) => { const a = t === 'p' ? pino(K, s, 141 + i) : cipres(K, s, 151 + i); a.position.set(x, 0, z); g.add(a); });
  [[0.6, 0.55], [0.7, 0.6]].forEach(([x, z], i) => pon(g, anfora(K, 0.5, ['#c27a4a', '#b56f44'][i]), x, 0, z));
  return g;
}
