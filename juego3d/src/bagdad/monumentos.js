/* ============================================================
   bagdad/monumentos
   Las piezas grandes de Bagdad (Época 6, docs/era6-plan.md), en el idioma de bloques del proyecto con el color de la
   época: el adobe y el ladrillo cocido de Mesopotamia, el azulejo turquesa y lapislázuli, la Cúpula Verde.
   - la muralla redonda de al-Mansur con sus torres y sus cuatro puertas (cada puerta, con su cúpula encima);
   - la Cúpula Verde del palacio, en el centro exacto de la ciudad, con su jinete de oro en la punta;
   - la gran mezquita, con su sala de columnas de madera y el patio;
   - la Casa de la Sabiduría: la biblioteca del califa, con su iwan de estantes y la cúpula de la sala de lectura;
   - el molino de papel con su noria en el canal, el zoco de los libreros y el banco del cadí;
   - el Tigris con sus barcas redondas (las quffa) y el puente de barcas; la caravana de camellos;
   - la madrasa, que crece por etapas (el saber que cierra la época).
   Las proporciones son de maqueta (como la Acrópolis o Guiza): legibles desde la cámara del juego, no a escala.
   ============================================================ */
import * as THREE from 'three';
import { crearPersona } from '../actores.js';
import { pon, caja, propia, textura, matTex, lamina } from '../agora/monumentos.js';
import { tronco } from '../sumer/monumentos.js';

export const BA = {
  adobe: '#d9bb8c', adobeD: '#c39e6c', adobeL: '#e9d4ab',
  ladrillo: '#c99268', ladrilloD: '#a8714a', ladrilloL: '#ddb08a',
  cal: '#efe6d2', calD: '#d8cbaf',
  verde: '#3f8f62', verdeL: '#62b083', verdeD: '#2b6646',
  turquesa: '#2f9aa5', azul: '#23497a', azulL: '#4373a9',
  oro: '#d4a93e', oroD: '#a8822c',
  madera: '#8a5e3a', maderaD: '#5e3e24', maderaL: '#b38253',
  estera: '#c9a95e', tela: '#a8452e', telaL: '#d06a3e', toldo: '#ead6a2', toldoB: '#2f6f8a',
  papel: '#f4ecd6', tinta: '#2c2418', hueco: '#2a1e15', agua: '#6f9e98', brea: '#3a2c20',
  camello: '#c99d66', camelloD: '#a07a4c', fardo: '#b8784a', fardoB: '#6f8a9a'
};

/* ---------- las texturas ---------- */
/* la lacería de los marcos: estrellas de ocho puntas de turquesa y blanco sobre lapislázuli */
const lacerias = () => textura('ba-laceria', 128, 128, (g, w, h) => {
  g.fillStyle = BA.azul; g.fillRect(0, 0, w, h);
  const estrella = (cx, cy, r, color, borde) => {
    g.beginPath();
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 - Math.PI / 2, rr = i % 2 ? r * 0.55 : r; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    g.closePath(); g.fillStyle = color; g.fill(); g.strokeStyle = borde; g.lineWidth = 3; g.stroke();
  };
  for (const [x, y] of [[0, 0], [w, 0], [0, h], [w, h], [w / 2, h / 2]]) estrella(x, y, 30, BA.turquesa, '#f3ead2');
  for (const [x, y] of [[w / 2, 0], [0, h / 2], [w, h / 2], [w / 2, h]]) estrella(x, y, 16, '#f3ead2', BA.oro);
}, { repetir: true });
/* el ladrillo cocido de Bagdad: hiladas con su junta, y alguna más oscura */
const ladrillos = () => textura('ba-ladrillo', 128, 128, (g, w, h) => {
  g.fillStyle = BA.ladrillo; g.fillRect(0, 0, w, h);
  for (let y = 0, fila = 0; y < h; y += 16, fila++) for (let x = (fila % 2) * -16; x < w; x += 32) {
    g.fillStyle = (x * 7 + y * 3) % 5 === 0 ? BA.ladrilloD : (x + y) % 3 === 0 ? BA.ladrilloL : BA.ladrillo; g.fillRect(x + 1, y + 1, 30, 14);
  }
}, { repetir: true });
/* el adobe de la muralla: hiladas gruesas, apenas marcadas */
const adobes = () => textura('ba-adobe', 128, 128, (g, w, h) => {
  g.fillStyle = BA.adobe; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(120,88,52,.28)'; g.lineWidth = 2;
  for (let y = 0, fila = 0; y < h; y += 21, fila++) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (fila % 2) * 24; x < w; x += 48) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 21); g.stroke(); } }
}, { repetir: true });
/* una franja escrita: el nombre del lugar en árabe, en oro sobre azul (la epigrafía de los edificios abasíes) */
const franja = (clave, texto) => textura('ba-franja-' + clave, 512, 64, (g, w, h) => {
  g.fillStyle = BA.azul; g.fillRect(0, 0, w, h);
  g.strokeStyle = BA.oro; g.lineWidth = 3; g.strokeRect(3, 3, w - 6, h - 6);
  g.fillStyle = '#f0d58a'; g.font = '600 36px "Geeza Pro", "Noto Naskh Arabic", "Amiri", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl';
  g.fillText(texto, w / 2, h / 2 + 2);
});
const matRep = (K, clave, t, rx, ry) => { const m = matTex(K, clave + rx + 'x' + ry, (() => { const c = t.clone(); c.needsUpdate = true; c.repeat.set(rx, ry); c.wrapS = c.wrapT = THREE.RepeatWrapping; return c; })()); return m; };

/* ---------- las formas ---------- */
/* el arco apuntado (de dos centros): la boca de una puerta o de un iwan, de ancho w y alto h (al vértice) */
export function arcoForma(w, h) {
  const s = new THREE.Shape(), hs = h - w * 0.62;
  s.moveTo(-w / 2, 0); s.lineTo(-w / 2, hs);
  s.quadraticCurveTo(-w / 2, hs + w * 0.5, 0, h); s.quadraticCurveTo(w / 2, hs + w * 0.5, w / 2, hs);
  s.lineTo(w / 2, 0); s.closePath();
  return s;
}
export function hueco(K, w, h, color = BA.hueco) { const m = K.malla(propia(new THREE.ShapeGeometry(arcoForma(w, h), 8)), color, { sinTinta: true }); return m; }
/* la cúpula, apenas apuntada (perfil de torno) */
export function cupula(K, r, color, { punta = 1.18, gr = 0.006 } = {}) {
  const pts = [];
  for (let i = 0; i <= 12; i++) { const u = i / 12, a = u * Math.PI / 2; pts.push(new THREE.Vector2(Math.max(0.002, r * Math.cos(a) * (1 - 0.08 * u * u)), r * Math.sin(a) * (1 + (punta - 1) * u * u))); }
  return K.malla(propia(new THREE.LatheGeometry(pts, 20)), color, { grosor: gr });
}
/* el iwan: el gran marco de azulejo (pishtaq) con la bóveda abierta al frente (+z) */
export function iwan(K, w, h, { prof = 0.08, dentro = BA.hueco, marco = true } = {}) {
  const g = new THREE.Group();
  if (marco) { const f = K.malla(K.caja(w, h, prof), '#ffffff', { grosor: 0.004 }); f.material = matRep(K, 'ba-lac', lacerias(), w * 3, h * 3); f.position.y = h / 2; g.add(f); }
  const b = hueco(K, w * 0.62, h * 0.82, dentro); b.position.set(0, 0.0, prof / 2 + 0.004); g.add(b);
  const c = hueco(K, w * 0.7, h * 0.86, BA.oro); c.position.set(0, -0.012, prof / 2 + 0.002); c.scale.set(1, 1, 1); g.add(c);   // el filete de oro alrededor de la boca
  return g;
}
/* las almenas escalonadas de los muros (merlones) */
function almenas(K, g, w, d, y, color = BA.adobeD, paso = 0.16) {
  for (let x = -w / 2 + paso / 2; x < w / 2; x += paso) [-1, 1].forEach(l => pon(g, caja(K, paso * 0.55, 0.07, 0.05, color, { grosor: 0.003 }), x, y + 0.035, l * d / 2));
  for (let z = -d / 2 + paso / 2; z < d / 2; z += paso) [-1, 1].forEach(l => pon(g, caja(K, 0.05, 0.07, paso * 0.55, color, { grosor: 0.003 }), l * w / 2, y + 0.035, z));
}

/* ---------- LA MURALLA REDONDA ---------- */
/* el anillo de adobe con sus torres y, en las cuatro puertas, el hueco donde va la puerta (aparte). r es el radio del eje. */
export function muralla(K, r, { alto = 0.46, grueso = 0.3, torres = 28 } = {}) {
  const g = new THREE.Group(), PUERTA = 0.17;   // medio hueco de puerta, en radianes
  const matA = matRep(K, 'ba-adobe-m', adobes(), 1, 1);
  const pasos = 96;
  for (let i = 0; i < pasos; i++) {
    const a0 = i / pasos * Math.PI * 2, a1 = (i + 1) / pasos * Math.PI * 2, am = (a0 + a1) / 2;
    if ([0, 1, 2, 3].some(k => { const d = Math.abs(((am - k * Math.PI / 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI); return d < PUERTA; })) continue;
    const L = 2 * r * Math.sin(Math.PI / pasos) + 0.01, seg = new THREE.Group(); seg.position.set(Math.cos(am) * r, 0, Math.sin(am) * r); seg.rotation.y = -am + Math.PI / 2; g.add(seg);
    const m = K.malla(K.caja(L, alto, grueso), '#ffffff', { grosor: 0.006 }); m.material = matA; m.position.y = alto / 2; seg.add(m);
    pon(seg, caja(K, L, 0.035, grueso + 0.04, BA.adobeD, { grosor: 0.003 }), 0, alto + 0.0175, 0);                  // el coronamiento
    [-1, 1].forEach(l => pon(seg, caja(K, L * 0.5, 0.07, 0.045, BA.adobeD, { grosor: 0.003 }), 0, alto + 0.07, l * (grueso / 2 + 0.005)));   // las almenas, por fuera y por dentro
  }
  for (let i = 0; i < torres; i++) {                    // las torres redondas, entre puerta y puerta
    const a = (i + 0.5) / torres * Math.PI * 2;
    if ([0, 1, 2, 3].some(k => { const d = Math.abs(((a - k * Math.PI / 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI); return d < PUERTA + 0.08; })) continue;
    const t = new THREE.Group(); t.position.set(Math.cos(a) * (r + grueso * 0.35), 0, Math.sin(a) * (r + grueso * 0.35)); g.add(t);
    const c = K.malla(K.cilindro(0.15, 0.17, alto + 0.08, 12), '#ffffff', { grosor: 0.005 }); c.material = matA; c.position.y = (alto + 0.08) / 2; t.add(c);
    pon(t, K.malla(K.cilindro(0.175, 0.175, 0.04, 12), BA.adobeD, { grosor: 0.003 }), 0, alto + 0.1, 0);
  }
  g.userData.ficha = { titulo: 'La Ciudad Redonda', texto: 'la muralla circular de al-Mansur, con sus cuatro puertas' };
  return g;
}
/* LA PUERTA: dos torres que flanquean el pasaje de arco apuntado y, encima, la sala de audiencias con su cúpula verde.
   Mira a +z (hacia afuera de la ciudad, cuando se la gira en su lugar). */
export function puerta(K, { nombre = 'kufa' } = {}) {
  const g = new THREE.Group(), matL = matRep(K, 'ba-ladrillo-p', ladrillos(), 1.4, 1);
  /* el cuerpo con su pasaje DE VERDAD (la gente entra y sale de la ciudad por aquí): dos macizos a los lados, el dintel
     arriba y, en lo alto del hueco, el arco apuntado; adentro, la bóveda en sombra */
  const PW = 0.36, PH = 0.5, lado = (0.95 - PW) / 2;
  [-1, 1].forEach(l => { const m = K.malla(K.caja(lado, 0.62, 0.5), '#ffffff', { grosor: 0.006 }); m.material = matL; m.position.set(l * (PW / 2 + lado / 2), 0.31, 0); g.add(m); });
  const din = K.malla(K.caja(PW + 0.002, 0.62 - PH, 0.5), '#ffffff', { grosor: 0.004 }); din.material = matL; din.position.set(0, PH + (0.62 - PH) / 2, 0); g.add(din);
  pon(g, caja(K, PW, 0.006, 0.5, '#3a2a1c', { sinTinta: true }), 0, PH - 0.003, 0);                                     // el techo del pasaje, en sombra
  [-1, 1].forEach(l => pon(g, caja(K, 0.006, PH, 0.5, '#5a4232', { sinTinta: true }), l * (PW / 2 - 0.003), PH / 2, 0)); // sus paredes
  [-1, 1].forEach(l => { const t = K.malla(K.cilindro(0.17, 0.19, 0.72, 12), '#ffffff', { grosor: 0.005 }); t.material = matL; t.position.set(l * 0.5, 0.36, 0.08); g.add(t);
    pon(g, K.malla(K.cilindro(0.2, 0.2, 0.04, 12), BA.ladrilloD, { grosor: 0.003 }), l * 0.5, 0.74, 0.08); });
  [1, -1].forEach(l => {                               // de los dos lados, el marco de ladrillo claro con el arco apuntado calado: se ve a través
    const marco = new THREE.Shape(); marco.moveTo(-PW / 2 - 0.035, 0); marco.lineTo(PW / 2 + 0.035, 0); marco.lineTo(PW / 2 + 0.035, PH + 0.03); marco.lineTo(-PW / 2 - 0.035, PH + 0.03); marco.closePath();
    marco.holes.push(arcoForma(PW - 0.004, PH - 0.004));
    const ar = K.malla(propia(new THREE.ShapeGeometry(marco, 8)), BA.ladrilloL, { sinTinta: true, side: THREE.DoubleSide }); ar.position.set(0, 0, l * 0.252); g.add(ar);
  });
  const fr = new THREE.Mesh(propia(new THREE.PlaneGeometry(0.7, 0.09)), matTex(K, 'ba-franja-' + nombre, franja(nombre, 'مدينة السلام'))); fr.position.set(0, 0.55, 0.253); g.add(fr);   // «la ciudad de la paz»
  almenas(K, g, 0.95, 0.5, 0.62, BA.ladrilloD, 0.14);
  const sala = new THREE.Group(); sala.position.y = 0.62; g.add(sala);
  pon(sala, K.malla(K.cilindro(0.2, 0.22, 0.12, 12), BA.cal, { grosor: 0.004 }), 0, 0.06, 0);
  const cu = cupula(K, 0.2, BA.verde); cu.position.y = 0.12; sala.add(cu);
  pon(sala, K.malla(K.esfera(0.025, 0.6), BA.oro, { sinTinta: true }), 0, 0.37, 0);
  g.userData.ficha = { titulo: 'Una puerta de la Ciudad Redonda', texto: 'cada una con el nombre del camino que salía de ella, y una sala con cúpula encima' };
  return g;
}

/* ---------- LA CÚPULA VERDE (el palacio, en el centro) ---------- */
export function cupulaVerde(K) {
  const g = new THREE.Group(), W = 1.7, H = 0.6, matL = matRep(K, 'ba-ladrillo-pal', ladrillos(), 2.6, 1);
  const base = K.malla(K.caja(W, H, W), '#ffffff', { grosor: 0.008 }); base.material = matL; base.position.y = H / 2; g.add(base);
  pon(g, caja(K, W + 0.08, 0.06, W + 0.08, BA.ladrilloD, { grosor: 0.004 }), 0, 0.03, 0);
  almenas(K, g, W, W, H, BA.ladrilloD, 0.17);
  for (let k = 0; k < 4; k++) {                         // un iwan en cada cara: el palacio mira a los cuatro caminos
    const f = new THREE.Group(); f.rotation.y = k * Math.PI / 2; g.add(f);
    const iw = iwan(K, 0.62, 0.52); iw.position.set(0, 0, W / 2 + 0.04); f.add(iw);
    [-1, 1].forEach(l => { const tr = K.malla(K.cilindro(0.09, 0.1, H + 0.12, 10), '#ffffff', { grosor: 0.004 }); tr.material = matL; tr.position.set(l * W / 2, (H + 0.12) / 2, W / 2); f.add(tr);
      pon(f, K.malla(K.esfera(0.06, 0.6), BA.verde, { grosor: 0.003 }), l * W / 2, H + 0.14, W / 2); });
  }
  const tambor = K.malla(K.cilindro(0.56, 0.6, 0.28, 16), BA.cal, { grosor: 0.006 }); tambor.position.y = H + 0.14; g.add(tambor);
  const banda = new THREE.Mesh(propia(new THREE.CylinderGeometry(0.565, 0.565, 0.1, 24, 1, true)), matRep(K, 'ba-lac-tambor', lacerias(), 10, 1)); banda.position.y = H + 0.16; g.add(banda);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; const v = hueco(K, 0.08, 0.13); v.position.set(Math.cos(a) * 0.605, H + 0.2, Math.sin(a) * 0.605); v.rotation.y = -a + Math.PI / 2; g.add(v); }   // las ventanas del tambor
  const cu = cupula(K, 0.58, BA.verde, { punta: 1.22 }); cu.position.y = H + 0.28; g.add(cu);
  pon(g, K.malla(K.toro(0.585, 0.014, Math.PI * 2, 0.8), BA.oro, { sinTinta: true }), 0, H + 0.29, 0).rotation.x = Math.PI / 2;   // el anillo de oro donde arranca la cúpula
  /* el jinete de oro en la punta, con su lanza (decían que señalaba de dónde venía el enemigo) */
  const j = new THREE.Group(); j.position.y = H + 0.28 + 0.58 * 1.22 + 0.02; g.add(j);
  pon(j, K.malla(K.cilindro(0.02, 0.03, 0.06, 6), BA.oro, { sinTinta: true }), 0, 0.03, 0);
  pon(j, K.malla(K.caja(0.12, 0.05, 0.04), BA.oro, { grosor: 0.002 }), 0, 0.09, 0);                                   // el caballo
  pon(j, K.malla(K.caja(0.03, 0.06, 0.03), BA.oro, { grosor: 0.002 }), 0.06, 0.13, 0);
  pon(j, K.malla(K.capsula(0.018, 0.04, 0.6), BA.oro, { grosor: 0.002 }), -0.01, 0.15, 0);                            // el jinete
  const lanza = K.malla(K.cilindro(0.004, 0.004, 0.2, 4), BA.oroD, { sinTinta: true }); lanza.rotation.z = 1.2; lanza.position.set(0.05, 0.17, 0); j.add(lanza);
  g.userData.ficha = { titulo: 'La Cúpula Verde', texto: 'el palacio de al-Mansur, en el centro exacto de la Ciudad Redonda' };
  return g;
}

/* ---------- LA GRAN MEZQUITA ---------- */
/* el recinto de adobe; la sala de oración del lado de la qibla (hacia el suroeste: aquí, la izquierda), techada sobre
   columnas de madera, y el patio abierto con su fuente; el alminar, una torre cuadrada en la esquina */
export function mezquita(K) {
  const g = new THREE.Group(), W = 1.8, D = 1.5, H = 0.3, matA = matRep(K, 'ba-adobe-mz', adobes(), 1.5, 0.5);
  [[0, -D / 2, W, 0.08], [0, D / 2, W, 0.08]].forEach(([x, z, w, d]) => { const m = K.malla(K.caja(w, H, d), '#ffffff', { grosor: 0.005 }); m.material = matA; m.position.set(x, H / 2, z); g.add(m); });
  [[-W / 2, 0], [W / 2, 0]].forEach(([x, z]) => { const m = K.malla(K.caja(0.08, H, D), '#ffffff', { grosor: 0.005 }); m.material = matA; m.position.set(x, H / 2, z); g.add(m); });
  almenas(K, g, W, D, H, BA.adobeD, 0.16);
  pon(g, caja(K, W - 0.1, 0.02, D - 0.1, BA.calD, { sinTinta: true }), 0, 0.01, 0);                                    // el patio
  /* la sala de oración: techo plano sobre columnas de madera, del lado izquierdo */
  const sx = -W / 2 + 0.38;
  pon(g, caja(K, 0.68, 0.05, D - 0.12, BA.adobeD, { grosor: 0.004 }), sx, H + 0.02, 0);
  for (let i = 0; i < 4; i++) for (let k = 0; k < 2; k++) pon(g, K.malla(K.cilindro(0.025, 0.03, H, 6), BA.madera, { grosor: 0.003 }), sx + 0.3 - k * 0.3, H / 2, -D / 2 + 0.22 + i * 0.35);
  pon(g, caja(K, 0.62, 0.012, D - 0.2, '#8a3a2a', { sinTinta: true }), sx, 0.025, 0);                                  // las alfombras
  /* la fuente del patio */
  pon(g, K.malla(K.cilindro(0.14, 0.15, 0.08, 8), BA.cal, { grosor: 0.004 }), 0.35, 0.04, 0.1);
  pon(g, K.malla(K.cilindro(0.11, 0.11, 0.01, 8), BA.agua, { sinTinta: true }), 0.35, 0.082, 0.1);
  /* el alminar */
  const al = new THREE.Group(); al.position.set(W / 2 - 0.08, 0, -D / 2 + 0.08); g.add(al);
  const t = K.malla(K.caja(0.2, 0.95, 0.2), '#ffffff', { grosor: 0.005 }); t.material = matRep(K, 'ba-ladrillo-al', ladrillos(), 0.5, 2); t.position.y = 0.475; al.add(t);
  pon(al, caja(K, 0.26, 0.05, 0.26, BA.ladrilloD, { grosor: 0.004 }), 0, 0.97, 0);
  pon(al, K.malla(K.cilindro(0.07, 0.09, 0.14, 8), BA.cal, { grosor: 0.003 }), 0, 1.06, 0);
  const cp = cupula(K, 0.08, BA.verde); cp.position.y = 1.13; al.add(cp);
  const lado = hueco(K, 0.24, 0.26); lado.position.set(W / 2 + 0.042, 0, 0.25); lado.rotation.y = Math.PI / 2; g.add(lado);   // la puerta del costado, hacia la plaza
  const fr = hueco(K, 0.3, 0.26); fr.position.set(0.3, 0, D / 2 + 0.042); g.add(fr);                                         // y la del frente
  g.userData.ficha = { titulo: 'La gran mezquita', texto: 'junto al palacio; además de rezar, aquí se enseñaba' };
  return g;
}

/* ---------- LA CASA DE LA SABIDURÍA ---------- */
/* la biblioteca del califa: un cuerpo de dos alturas con el gran iwan al frente (+z), y adentro los estantes con las cajas
   de libros; arriba, la cúpula azul de la sala de lectura; el nombre en la franja: بيت الحكمة.
   Crece por etapas (el saber 46): 'obra' los andamios sobre el zócalo · 0 la planta baja con su iwan · 1 (lo pone la
   pieza: los cofres y el lector) · 2 la sala alta, y los estantes llenos en el iwan · 3 la cúpula de la sala de lectura. */
export const CASA_DIM = { w: 1.6, d: 1.15 };
export function casaSabiduria(K, niv = 3) {
  const g = new THREE.Group(), { w, d } = CASA_DIM, obra = niv === 'obra', n = obra ? -1 : niv, H = n >= 2 ? 0.66 : 0.44;
  const matL = matRep(K, 'ba-ladrillo-cs', ladrillos(), 2.4, H / 0.66);
  pon(g, caja(K, w + 0.14, 0.07, d + 0.14, BA.ladrilloD, { grosor: 0.004 }), 0, 0.035, 0);
  if (obra) {                                           // los andamios: el zócalo, las primeras hiladas y las varas atadas
    const m = K.malla(K.caja(w, 0.16, d), '#ffffff', { grosor: 0.005 }); m.material = matL; m.position.y = 0.08; g.add(m);
    for (let i = 0; i < 4; i++) [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(0.012, 0.012, 0.62, 4), BA.madera, { sinTinta: true }), -w / 2 + 0.1 + i * (w - 0.2) / 3, 0.31, l * (d / 2 + 0.08)));
    [-1, 1].forEach(l => [0.3, 0.52].forEach(y => pon(g, K.malla(K.caja(w, 0.016, 0.016), BA.maderaD, { sinTinta: true }), 0, y, l * (d / 2 + 0.08))));
    for (let k = 0; k < 3; k++) pon(g, caja(K, 0.1, 0.05, 0.05, BA.ladrilloL, { grosor: 0.002 }), -0.3 + k * 0.12, 0.185, d / 2 + 0.18);
    g.userData.ficha = { titulo: 'La Casa de la Sabiduría', texto: 'se levanta' };
    return g;
  }
  const cuerpo = K.malla(K.caja(w, H, d), '#ffffff', { grosor: 0.007 }); cuerpo.material = matL; cuerpo.position.y = H / 2; g.add(cuerpo);
  almenas(K, g, w, d, H, BA.ladrilloD, 0.15);
  /* el gran iwan del frente; con la sala alta, los estantes de libros adentro */
  const iw = new THREE.Group(), IH = H + 0.08; iw.position.set(0, 0, d / 2 + 0.05); g.add(iw);
  const f = K.malla(K.caja(0.78, IH, 0.1), '#ffffff', { grosor: 0.004 }); f.material = matRep(K, 'ba-lac-casa' + n, lacerias(), 2.4, 2.2 * IH / 0.74); f.position.y = IH / 2; iw.add(f);
  const boca = hueco(K, 0.5, IH - 0.12, '#3a2a1c'); boca.position.set(0, 0, 0.054); iw.add(boca);
  if (n >= 2) {
    const est = new THREE.Mesh(propia(new THREE.PlaneGeometry(0.42, 0.34)), matTex(K, 'ba-estantes', textura('ba-estantes', 128, 104, (gg, ww, hh) => {
      gg.fillStyle = '#4a3220'; gg.fillRect(0, 0, ww, hh);
      for (let f2 = 0; f2 < 4; f2++) for (let c = 0; c < 5; c++) { gg.fillStyle = '#2a1a10'; gg.fillRect(4 + c * 24.5, 4 + f2 * 25, 22, 22);
        for (let b = 0; b < 3; b++) { gg.fillStyle = [BA.papel, '#c9a46a', '#8a3a2a', '#2f5f7a'][(c + f2 + b) % 4]; gg.fillRect(6 + c * 24.5 + b * 6.5, 10 + f2 * 25, 5, 15); } }
    }))); est.position.set(0, 0.2, 0.058); iw.add(est);
  }
  const fr = new THREE.Mesh(propia(new THREE.PlaneGeometry(0.74, 0.09)), matTex(K, 'ba-franja-casa', franja('casa', 'بيت الحكمة'))); fr.position.set(0, IH - 0.06, 0.056); iw.add(fr);
  /* las ventanas: abajo siempre; las altas, con la sala de arriba */
  for (const x of [-0.6, 0.6]) { const v = hueco(K, 0.1, 0.18); v.position.set(x, 0.12, d / 2 + 0.004); g.add(v); }
  if (n >= 2) {
    for (const x of [-0.6, 0.6]) { const v = hueco(K, 0.1, 0.16); v.position.set(x, 0.44, d / 2 + 0.004); g.add(v); }
    for (const z of [-0.3, 0.2]) { const v = hueco(K, 0.1, 0.2); v.position.set(w / 2 + 0.004, 0.36, z); v.rotation.y = Math.PI / 2; g.add(v); }
  }
  if (n >= 3) {                                         // la sala de lectura, arriba: el tambor y la cúpula azul
    pon(g, K.malla(K.cilindro(0.3, 0.32, 0.16, 16), BA.cal, { grosor: 0.005 }), 0, H + 0.08, -0.1);
    const banda = new THREE.Mesh(propia(new THREE.CylinderGeometry(0.305, 0.305, 0.06, 20, 1, true)), matRep(K, 'ba-lac-tambor2', lacerias(), 6, 0.6)); banda.position.set(0, H + 0.1, -0.1); g.add(banda);
    const cu = cupula(K, 0.31, BA.azulL); cu.position.set(0, H + 0.16, -0.1); g.add(cu);
    pon(g, K.malla(K.esfera(0.03, 0.6), BA.oro, { sinTinta: true }), 0, H + 0.16 + 0.31 * 1.18 + 0.02, -0.1);
  }
  g.userData.alto = H;
  g.userData.ficha = { titulo: 'La Casa de la Sabiduría', texto: 'la biblioteca del califa, con los libros traducidos' };
  return g;
}

/* ---------- EL MOLINO DE PAPEL ---------- */
/* la casa del molino, con los mazos que baten los trapos, y la noria del canal, que se anima (userData.rueda) */
export function molino(K) {
  const g = new THREE.Group(), matA = matRep(K, 'ba-adobe-mo', adobes(), 1, 0.5);
  const casa = K.malla(K.caja(0.95, 0.42, 0.62), '#ffffff', { grosor: 0.006 }); casa.material = matA; casa.position.set(-0.15, 0.21, -0.25); g.add(casa);
  for (let i = 0; i < 7; i++) pon(g, K.malla(K.cilindro(0.018, 0.018, 0.74, 5), BA.maderaD, { grosor: 0.002 }), -0.6 + i * 0.15, 0.44, -0.25).rotation.x = Math.PI / 2;   // las vigas del techo
  pon(g, caja(K, 1.0, 0.03, 0.7, '#b9945a', { grosor: 0.003 }), -0.15, 0.47, -0.25);                                    // el techo de esteras
  const pt = hueco(K, 0.2, 0.26); pt.position.set(-0.3, 0, 0.065); g.add(pt);
  /* los mazos de batir: tres vigas con su cabeza, del lado del canal */
  for (let k = 0; k < 3; k++) { const m = new THREE.Group(); m.position.set(0.42, 0.18, -0.4 + k * 0.16); g.add(m);
    pon(m, K.malla(K.caja(0.32, 0.03, 0.03), BA.madera, { grosor: 0.002 }), 0, 0.05, 0); pon(m, K.malla(K.caja(0.06, 0.08, 0.06), BA.maderaD, { grosor: 0.002 }), 0.14, 0, 0); }
  /* la noria: la rueda con sus radios y sus cangilones; gira sobre el eje x (el canal corre a lo largo de x) */
  const rueda = new THREE.Group(); rueda.position.set(0.55, 0.3, 0.42); g.add(rueda);
  const aro = K.malla(K.toro(0.36, 0.022, Math.PI * 2, 0.8), BA.madera, { grosor: 0.003 }); aro.rotation.y = Math.PI / 2; rueda.add(aro);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2;
    const r = K.malla(K.caja(0.018, 0.7, 0.018), BA.maderaD, { sinTinta: true }); r.rotation.x = a; rueda.add(r);
    const c = K.malla(K.caja(0.07, 0.06, 0.06), BA.barro || '#8a6a48', { grosor: 0.002 }); c.position.set(0, Math.cos(a) * 0.36, Math.sin(a) * 0.36); rueda.add(c); }
  pon(g, K.malla(K.cilindro(0.025, 0.025, 0.3, 6), BA.maderaD, { grosor: 0.002 }), 0.55, 0.3, 0.42).rotation.z = Math.PI / 2;
  [-1, 1].forEach(l => pon(g, caja(K, 0.05, 0.36, 0.05, BA.maderaD, { grosor: 0.002 }), 0.55 + l * 0.12, 0.18, 0.42));
  g.userData.rueda = rueda;
  g.userData.ficha = { titulo: 'El molino de papel', texto: 'la noria del canal mueve los mazos que baten los trapos' };
  return g;
}

/* ---------- EL ZOCO DE LOS LIBREROS y EL BANCO DEL CADÍ ---------- */
/* una fila de puestos con su toldo, su mostrador y libros apilados; a lo largo de x */
export function zoco(K, n = 4) {
  const g = new THREE.Group(), r = s => Math.abs(Math.sin(s * 91.7) * 1000) % 1;
  for (let i = 0; i < n; i++) {
    const p = new THREE.Group(); p.position.set((i - (n - 1) / 2) * 0.62, 0, 0); g.add(p);
    pon(p, caja(K, 0.52, 0.2, 0.3, BA.maderaL, { grosor: 0.004 }), 0, 0.1, 0);                                         // el mostrador
    [-1, 1].forEach(a => [-1, 1].forEach(b => pon(p, K.malla(K.cilindro(0.012, 0.012, 0.5, 5), BA.maderaD, { sinTinta: true }), a * 0.27, 0.25, b * 0.17 - 0.05)));
    const toldo = K.malla(K.caja(0.6, 0.02, 0.42), i % 2 ? BA.toldo : BA.toldoB, { grosor: 0.003 }); toldo.position.set(0, 0.5, -0.04); toldo.rotation.x = 0.16; p.add(toldo);
    for (let k = 0; k < 3; k++) {                       // las pilas de libros sobre el mostrador
      const h = 2 + Math.floor(r(i * 7 + k) * 3);
      for (let q = 0; q < h; q++) pon(p, caja(K, 0.09, 0.022, 0.07, ['#8a3a2a', '#2f5f7a', '#c9a46a', BA.papel, '#4f6a3a'][(i + k + q) % 5], { grosor: 0.0015 }), -0.15 + k * 0.15, 0.21 + q * 0.023, 0.02).rotation.y = (q % 2) * 0.2;
    }
    pon(p, K.malla(K.cilindro(0.05, 0.06, 0.08, 8), BA.barro || '#8a6a48', { grosor: 0.002 }), 0.2, 0.24, -0.08);         // el tintero del copista
  }
  g.userData.ficha = { titulo: 'El zoco de los libreros', texto: 'más de cien tiendas de libros y copistas' };
  return g;
}
export function bancoCadi(K) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.7, 0.14, 0.5, BA.maderaL, { grosor: 0.004 }), 0, 0.07, 0);
  pon(g, caja(K, 0.66, 0.015, 0.46, BA.tela, { sinTinta: true }), 0, 0.147, 0);                                         // la alfombra
  pon(g, K.malla(K.capsula(0.05, 0.3, 0.6), BA.telaL, { grosor: 0.002 }), 0, 0.2, -0.18).rotation.z = Math.PI / 2;      // el almohadón
  [-1, 1].forEach(a => [-1, 1].forEach(b => pon(g, K.malla(K.cilindro(0.012, 0.012, 0.62, 5), BA.maderaD, { sinTinta: true }), a * 0.34, 0.31, b * 0.24)));
  pon(g, caja(K, 0.78, 0.02, 0.56, BA.toldoB, { grosor: 0.003 }), 0, 0.62, 0);
  /* la balanza del reparto sobre el banco */
  const bz = new THREE.Group(); bz.position.set(0.18, 0.15, 0.08); g.add(bz);
  pon(bz, K.malla(K.cilindro(0.006, 0.006, 0.16, 4), BA.oroD, { sinTinta: true }), 0, 0.08, 0);
  pon(bz, K.malla(K.caja(0.18, 0.006, 0.006), BA.oroD, { sinTinta: true }), 0, 0.16, 0);
  [-1, 1].forEach(l => pon(bz, K.malla(K.cilindro(0.035, 0.03, 0.01, 8), BA.oro, { sinTinta: true }), l * 0.085, 0.11, 0));
  g.userData.ficha = { titulo: 'El banco del cadí', texto: 'donde se reparten las herencias' };
  return g;
}

/* ---------- EL TIGRIS: la quffa y el puente de barcas ---------- */
export function quffa(K, { remero = true } = {}) {
  const g = new THREE.Group();
  const c = K.malla(K.cilindro(0.24, 0.2, 0.12, 14), BA.brea, { grosor: 0.004 }); c.position.y = 0.04; g.add(c);
  pon(g, K.malla(K.toro(0.235, 0.022, Math.PI * 2, 0.7), '#5a4630', { grosor: 0.002 }), 0, 0.1, 0).rotation.x = Math.PI / 2;
  pon(g, K.malla(K.cilindro(0.2, 0.2, 0.01, 14), '#6f5a3a', { sinTinta: true }), 0, 0.09, 0);
  if (remero) {
    const p = crearPersona(K, { piel: 2, pelo: 'corto', colorPelo: '#2a1f18', ropa: 'corta', colorRopa: '#d8cbb0' }); p.anim(0, { pose: 'pertiga', instantaneo: true });
    p.obj.scale.setScalar(0.7); p.obj.position.y = 0.09; g.add(p.obj); g.userData.remero = p;
    for (let k = 0; k < 3; k++) pon(g, caja(K, 0.1, 0.08, 0.08, [BA.fardo, BA.fardoB, '#c9a46a'][k], { grosor: 0.002 }), -0.08 + k * 0.08, 0.13, 0.1);   // la carga
  }
  g.userData.ficha = { titulo: 'La quffa', texto: 'la barca redonda del Tigris' };
  return g;
}
export function puenteBarcas(K, largo) {
  const g = new THREE.Group(), n = Math.max(4, Math.round(largo / 0.32));
  for (let i = 0; i < n; i++) {
    const b = K.malla(K.capsula(0.09, 0.3, 0.6), BA.brea, { grosor: 0.003 }); b.rotation.x = Math.PI / 2; b.position.set(-largo / 2 + (i + 0.5) * largo / n, -0.03, 0); g.add(b);
  }
  pon(g, caja(K, largo, 0.025, 0.36, BA.maderaL, { grosor: 0.004 }), 0, 0.045, 0);
  [-1, 1].forEach(l => pon(g, caja(K, largo, 0.04, 0.02, BA.maderaD, { grosor: 0.002 }), 0, 0.1, l * 0.17));
  for (let i = 0; i <= n; i++) [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(0.008, 0.008, 0.07, 4), BA.maderaD, { sinTinta: true }), -largo / 2 + i * largo / n, 0.075, l * 0.17));
  g.userData.ficha = { titulo: 'El puente de barcas', texto: 'el Tigris se cruzaba sobre barcas atadas' };
  return g;
}

/* ---------- LA CARAVANA ---------- */
/* el camello (el dromedario de las caravanas de Siria) con sus fardos de manuscritos, mirando a +x. La silueta manda: el
   cuerpo ovalado y alto sobre patas largas de dos tramos, la joroba que se ve, el cuello en S que sale bajo del pecho y
   la cabeza horizontal; la manta roja cae sobre la joroba como una tela, y las cajas de cuero cuelgan a los costados. */
export function camello(K, { carga = true, color = BA.camello } = {}) {
  const g = new THREE.Group(), D = BA.camelloD;
  pon(g, K.malla(K.esfera(0.13, 0.7), color, { grosor: 0.004 }), 0, 0.46, 0).scale.set(1.85, 0.95, 0.85);               // el cuerpo
  pon(g, K.malla(K.esfera(0.085, 0.7), color, { grosor: 0.003 }), 0.19, 0.45, 0).scale.set(1, 1.1, 0.95);               // el pecho
  pon(g, K.malla(K.esfera(0.105, 0.7), color, { grosor: 0.004 }), -0.03, 0.56, 0).scale.set(1.35, 1.0, 0.9);            // la joroba
  /* el cuello: sale bajo del pecho, baja un poco hacia adelante y sube; la cabeza, larga y horizontal */
  const curva = new THREE.CatmullRomCurve3([new THREE.Vector3(0.22, 0.47, 0), new THREE.Vector3(0.33, 0.45, 0), new THREE.Vector3(0.41, 0.53, 0), new THREE.Vector3(0.44, 0.66, 0)]);
  const cue = K.malla(propia(new THREE.TubeGeometry(curva, 10, 0.036, 7, false)), color, { grosor: 0.003 }); g.add(cue);
  pon(g, K.malla(K.esfera(0.04, 0.6), color, { grosor: 0.003 }), 0.445, 0.67, 0);
  const cab = K.malla(K.capsula(0.034, 0.1, 0.6), color, { grosor: 0.003 }); cab.position.set(0.5, 0.68, 0); cab.rotation.z = Math.PI / 2 + 0.12; g.add(cab);
  pon(g, K.malla(K.esfera(0.028, 0.6), D, { grosor: 0.002 }), 0.56, 0.665, 0).scale.set(1.2, 0.9, 1);                   // el belfo
  [-1, 1].forEach(l => {
    pon(g, K.malla(K.cono(0.011, 0.032, 4), D, { sinTinta: true }), 0.455, 0.715, l * 0.022);                            // las orejas
    pon(g, K.malla(K.esfera(0.006, 0.5), '#1e140c', { sinTinta: true }), 0.5, 0.695, l * 0.03);                          // los ojos
  });
  /* las patas: el muslo grueso, la rodilla y la caña fina hasta la pezuña ancha */
  [[0.16, 0.06], [0.16, -0.06], [-0.17, 0.06], [-0.17, -0.06]].forEach(([x, z], i) => {
    const pa = new THREE.Group(); pa.position.set(x, 0, z); g.add(pa); g.userData['pata' + i] = pa;
    pon(pa, K.malla(K.cilindro(0.032, 0.019, 0.17, 6), color, { grosor: 0.003 }), 0, 0.32, 0);
    pon(pa, K.malla(K.esfera(0.021, 0.5), D, { sinTinta: true }), 0, 0.225, 0);
    pon(pa, K.malla(K.cilindro(0.016, 0.014, 0.21, 5), D, { grosor: 0.002 }), 0, 0.115, 0);
    pon(pa, K.malla(K.cilindro(0.028, 0.03, 0.02, 7), D, { sinTinta: true }), 0.006, 0.01, 0);
  });
  pon(g, K.malla(K.cilindro(0.008, 0.004, 0.17, 4), D, { sinTinta: true }), -0.27, 0.41, 0).rotation.z = -0.3;           // la cola
  if (carga) {
    /* la manta: una tela curva sobre la joroba (media caña abierta, con su franja), no una tabla */
    const manta = K.malla(propia(new THREE.CylinderGeometry(0.125, 0.125, 0.26, 12, 1, true, -Math.PI * 0.62, Math.PI * 1.24)), BA.tela, { grosor: 0.003, side: THREE.DoubleSide });
    manta.rotation.z = Math.PI / 2; manta.position.set(-0.03, 0.55, 0); g.add(manta);
    const franja = K.malla(propia(new THREE.CylinderGeometry(0.128, 0.128, 0.04, 12, 1, true, -Math.PI * 0.62, Math.PI * 1.24)), BA.oro, { sinTinta: true, side: THREE.DoubleSide });
    franja.rotation.z = Math.PI / 2; franja.position.set(-0.03, 0.55, 0); g.add(franja);
    [-1, 1].forEach(l => {                              // las cajas de cuero con los manuscritos, colgando a los costados, atadas
      const f = caja(K, 0.17, 0.12, 0.06, l > 0 ? BA.fardo : BA.fardoB, { grosor: 0.003 }); f.position.set(-0.03, 0.42, l * 0.155); f.rotation.x = l * 0.12; g.add(f);
      pon(g, caja(K, 0.012, 0.125, 0.064, BA.maderaD, { sinTinta: true }), -0.07, 0.42, l * 0.155).rotation.x = l * 0.12;
      pon(g, caja(K, 0.012, 0.125, 0.064, BA.maderaD, { sinTinta: true }), 0.01, 0.42, l * 0.155).rotation.x = l * 0.12;
    });
    pon(g, K.malla(K.cilindro(0.004, 0.004, 0.3, 3), BA.maderaD, { sinTinta: true }), 0.12, 0.5, 0).rotation.x = Math.PI / 2;   // la cincha del pecho
  }
  return g;
}

/* ---------- LA MADRASA (el saber 50, por etapas) ---------- */
/* niv 'obra': el andamio sobre los cimientos · 0: el patio con su fuente y el muro · 1: los iwanes (al frente y al fondo)
   · 2: los cuartos de los estudiantes · 3: la biblioteca con su cúpula. Mira a +z. */
export function madrasa(K, niv = 3) {
  const g = new THREE.Group(), W = 1.6, D = 1.4, H = 0.36, matL = matRep(K, 'ba-ladrillo-md', ladrillos(), 2, 0.6);
  pon(g, caja(K, W + 0.1, 0.05, D + 0.1, BA.ladrilloD, { grosor: 0.004 }), 0, 0.025, 0);
  if (niv === 'obra') {
    for (let i = 0; i < 4; i++) [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(0.015, 0.015, 0.7, 4), BA.madera, { grosor: 0.002 }), -W / 2 + i * W / 3, 0.35, l * D / 2));
    [0.25, 0.5].forEach(y => [-1, 1].forEach(l => pon(g, caja(K, W, 0.02, 0.06, BA.maderaL, { grosor: 0.002 }), 0, y, l * D / 2)));
    for (let k = 0; k < 4; k++) pon(g, caja(K, 0.16, 0.1, 0.1, BA.ladrillo, { grosor: 0.002 }), -0.3 + k * 0.2, 0.1, 0.1);   // las pilas de ladrillos
    return g;
  }
  pon(g, caja(K, W - 0.2, 0.015, D - 0.2, BA.calD, { sinTinta: true }), 0, 0.055, 0);                                     // el patio
  const fu = new THREE.Group(); fu.position.set(0, 0.05, 0.05); g.add(fu);                                               // la fuente octogonal
  pon(fu, K.malla(K.cilindro(0.18, 0.2, 0.08, 8), BA.cal, { grosor: 0.004 }), 0, 0.04, 0);
  pon(fu, K.malla(K.cilindro(0.15, 0.15, 0.01, 8), BA.agua, { sinTinta: true }), 0, 0.082, 0);
  pon(fu, K.malla(K.cilindro(0.02, 0.03, 0.12, 6), BA.turquesa, { grosor: 0.002 }), 0, 0.1, 0);
  /* el muro bajo alrededor, abierto al frente */
  const muro = (w, d, x, z) => { const m = K.malla(K.caja(w, H * 0.55, d), '#ffffff', { grosor: 0.004 }); m.material = matL; m.position.set(x, H * 0.275, z); g.add(m); };
  muro(W, 0.08, 0, -D / 2); muro(0.08, D, -W / 2, 0); muro(0.08, D, W / 2, 0); muro(W * 0.32, 0.08, -W * 0.34, D / 2); muro(W * 0.32, 0.08, W * 0.34, D / 2);
  if (niv >= 1) {                                       // los iwanes: el del fondo, grande, y el de la entrada
    const iwF = iwan(K, 0.7, 0.72, { prof: 0.14 }); iwF.position.set(0, 0, -D / 2 + 0.07); g.add(iwF);
    const iwE = iwan(K, 0.5, 0.52, { prof: 0.1 }); iwE.position.set(0, 0, D / 2 + 0.05); g.add(iwE);
  }
  if (niv >= 2) {                                       // los cuartos de los estudiantes, con su puerta en arco, en los costados
    [-1, 1].forEach(l => {
      const m = K.malla(K.caja(0.32, H + 0.08, D - 0.3), '#ffffff', { grosor: 0.005 }); m.material = matL; m.position.set(l * (W / 2 - 0.16), (H + 0.08) / 2, -0.02); g.add(m);
      for (let k = 0; k < 3; k++) { const p = hueco(K, 0.1, 0.2); p.position.set(l * (W / 2 - 0.325), 0.06, -0.38 + k * 0.36); p.rotation.y = l > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(p); }
    });
  }
  if (niv >= 3) {                                       // la biblioteca de la madrasa, con su cúpula, detrás del iwan grande
    pon(g, K.malla(K.cilindro(0.26, 0.28, 0.16, 12), BA.cal, { grosor: 0.004 }), 0, 0.8, -D / 2 + 0.2);
    const cu = cupula(K, 0.27, BA.turquesa); cu.position.set(0, 0.88, -D / 2 + 0.2); g.add(cu);
    pon(g, K.malla(K.esfera(0.025, 0.6), BA.oro, { sinTinta: true }), 0, 0.88 + 0.27 * 1.18 + 0.02, -D / 2 + 0.2);
    for (let k = 0; k < 2; k++) pon(g, caja(K, 0.14, 0.22, 0.08, BA.maderaD, { grosor: 0.002 }), -0.5 + k * 1.0, 0.17, -D / 2 + 0.12);   // los armarios de libros
  }
  g.userData.ficha = { titulo: 'La madrasa', texto: 'el patio con iwanes, la renta del waqf y los cuartos de los estudiantes' };
  return g;
}
export { lacerias, ladrillos, adobes, franja };
export { tannur, zir, burro, tendedero, cabra, esteraDatiles };   // lo de afuera de las casas, para el arrabal del juego (bagdad/valle)

/* ============================================================
   EL REPLANTEO VISUAL (2026-10-04, docs/replanteo-visual.md)
   La Cúpula Verde medía 1,9 de alto y la Casa 1,2: chicas en un tablero de arena. Aquí, las piezas grandes en variantes
   para la hoja juego3d/bocetos/bagdad.html, con la vara de la Acrópolis y del Faro (proporciones y rasgos de verdad):
   - el héroe: 'redonda' (la Ciudad Redonda de al-Mansur entera, 762-766), 'palacio' (el palacio de la Puerta de Oro con
     la Cúpula Verde, de cerca) o 'casa' (la Casa de la Sabiduría como edificio grande, por etapas);
   - la segunda pieza: 'mezquita' (la gran mezquita de al-Mansur), 'molino' (el molino de papel con su noria) o 'puente'
     (el puente de barcas con el arco de su cabeza y los molinos flotantes);
   - las casas: 'patio' (de patio, ladrillo y badgir), 'arrabal' (de barro y palma) u 'orilla' (de dos pisos, sobre el río).
   FUENTES: al-Yaqubi (Kitab al-buldan, 891) y al-Jatib al-Bagdadi (Tarij Bagdad, siglo XI), leídos en Lassner, The
   Topography of Baghdad in the Early Middle Ages (1970), y en Creswell, A Short Account of Early Muslim Architecture
   (1958): el foso, la muralla de afuera, el fasil, la muralla mayor con sus torres, las cuatro puertas con su sala de
   cúpula encima, el anillo de las casas y, en el centro, el palacio (el iwan, la sala de la cúpula y, encima, la Cúpula
   Verde de 80 codos con su jinete) junto a la mezquita. Lo que no está escrito sale de lo que sí quedó en pie: Ujaidir
   (775: las torres de medio círculo y los arcos ciegos), Samarra (836-892: el ladrillo color ante, el estuco tallado al
   bisel, los nichos de arco lobulado del Qasr al-Ashiq) y la Mustansiriya (1233).
   Escala: 1 = una baldosa; una persona mide ~1,0. El frente de cada pieza mira a +z.
   ============================================================ */
export const VARIANTES = { heroe: 'redonda', segunda: 'molino', casas: 'patio', tablero: 'derecha' };   // la recomendación de Claude, hasta que el usuario elija

export const AB = {
  ante: '#dcc194', anteL: '#ecd8b2', anteD: '#c8a878', anteS: '#ae8c5e',     // el ladrillo cocido color ante
  barro: '#d6bb8e', barroL: '#e6cfa6', barroD: '#bf9f70',                     // el adobe de la muralla y de las casas
  estuco: '#f1e6cd', estucoD: '#dccba8', cal: '#f5eedf', junta: '#eadbb8',
  verde: '#3f9b69', verdeL: '#68bd8a', verdeD: '#2b7650',
  turquesa: '#37a7aa', turquesaL: '#66c8c3', lapis: '#2e5e98',
  oro: '#dfb34a', oroD: '#b28b33',
  madera: '#8c603b', maderaL: '#b78a5c', maderaD: '#5f3f25',
  agua: '#6db6c7', aguaD: '#4b93ac', aguaL: '#a8d7dd',
  palma: '#8d6c45', palmaD: '#6e5233', hoja: '#5e9646', hojaL: '#89b85e', hojaD: '#3f7135', datil: '#c8782c',
  trigo: '#dfc068', cebada: '#97bc5f', huerta: '#6ea84e', barbecho: '#d5bf8e',
  tela: '#b04a32', telaB: '#2f6f8a', blanco: '#f3ecdc', hueco: '#3b2a1b', sombra: '#6b5236'
};

/* ---------- ayudantes ---------- */
const MATR = new WeakMap();
/* un material con la textura repetida rx × ry veces (cacheado por kit, clave y repetición redondeada) */
function matR(K, clave, tex, rx, ry) {
  let m = MATR.get(K); if (!m) MATR.set(K, m = new Map());
  const qx = Math.max(0.5, Math.round(rx * 2) / 2), qy = Math.max(0.5, Math.round(ry * 2) / 2), k = clave + '|' + qx + 'x' + qy;
  if (!m.has(k)) { const t = tex.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(qx, qy); m.set(k, K.matMapa(t)); }
  return m.get(k);
}
/* una caja con textura: el material de ladrillo, adobe o estuco a la medida (una repetición cada `paso` baldosas) */
function cajaT(K, w, h, d, tex, clave, { paso = 1.0, gr = 0.005 } = {}) {
  const m = K.malla(K.caja(w, h, d), '#ffffff', { grosor: gr }); m.material = matR(K, clave, tex, Math.max(w, d) / paso, h / paso); return m;
}
/* una lámina pegada a una cara (los nichos, las franjas, las celosías): sin tinta, un pelo afuera */
function lamT(K, w, h, tex, clave, rx = 1, ry = 1) { const m = new THREE.Mesh(propia(new THREE.PlaneGeometry(w, h)), matR(K, clave, tex, rx, ry)); m.receiveShadow = true; return m; }
const h3 = (a, b, c = 0) => { const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return s - Math.floor(s); };
/* la geometría compartida de las piezas repetidas (almenas, torres): una por medida, para todas las piezas */
const GEOS = new Map();
const geoComp = (k, f) => { if (!GEOS.has(k)) GEOS.set(k, f()); return GEOS.get(k); };
/* la almena escalonada de los muros abasíes (y sasánidas): tres escalones, vista de frente */
function geoAlmena(w, h, d) {
  return geoComp(`alm${w}_${h}_${d}`, () => {
    const s = new THREE.Shape(), a = w / 2, b = w * 0.24;
    s.moveTo(-a, 0); s.lineTo(a, 0); s.lineTo(a, h * 0.55); s.lineTo(b, h * 0.55); s.lineTo(b, h); s.lineTo(-b, h); s.lineTo(-b, h * 0.55); s.lineTo(-a, h * 0.55); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g;
  });
}
/* muchas piezas iguales en una sola malla instanciada (con su tinta): lista de [x, y, z, ry, escala] */
function instancias(K, geo, color, lista, o = {}) {
  const m = K.instancias(geo, color, lista.length, o), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
  lista.forEach(([x, y, z, ry = 0, k = 1], i) => { q.setFromEuler(e.set(0, ry, 0)); m4.compose(v.set(x, y, z), q, s.set(k, k, k)); m.setMatrixAt(i, m4); });
  m.instanceMatrix.needsUpdate = true; m.computeBoundingSphere(); return m;
}
/* almenas a lo largo de un segmento recto (de a → b, a la altura y), mirando hacia afuera del lado `lado` */
function almenasRecta(lista, ax, az, bx, bz, y, paso) {
  const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.floor(L / paso)), ry = -Math.atan2(bz - az, bx - ax);
  for (let i = 0; i < n; i++) { const u = (i + 0.5) / n; lista.push([ax + (bx - ax) * u, y, az + (bz - az) * u, ry]); }
}
/* almenas alrededor de una caja (w × d, a la altura y), centradas en (x, z) */
function almenasCaja(lista, x, z, w, d, y, paso) {
  almenasRecta(lista, x - w / 2, z + d / 2, x + w / 2, z + d / 2, y, paso); almenasRecta(lista, x - w / 2, z - d / 2, x + w / 2, z - d / 2, y, paso);
  almenasRecta(lista, x - w / 2, z - d / 2, x - w / 2, z + d / 2, y, paso); almenasRecta(lista, x + w / 2, z - d / 2, x + w / 2, z + d / 2, y, paso);
}
/* el sector de anillo extruido (una manzana del anillo de las casas, el patio de la plaza): radios r0-r1, ángulos a0-a1
   (medidos desde +x hacia +z), alto h */
function geoSector(r0, r1, a0, a1, h, n = 6) {
  const s = new THREE.Shape();
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; i ? s.lineTo(Math.cos(a) * r1, -Math.sin(a) * r1) : s.moveTo(Math.cos(a) * r1, -Math.sin(a) * r1); }
  for (let i = n; i >= 0; i--) { const a = a0 + (a1 - a0) * i / n; s.lineTo(Math.cos(a) * r0, -Math.sin(a) * r0); }
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false }); g.rotateX(-Math.PI / 2); return propia(g);
}
/* un anillo de torno: el perfil [[radio, y], …] girado entre los ángulos a0 y a1 (desde +x hacia +z) */
function geoTorno(pts, a0, a1, seg) { return propia(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg, Math.PI / 2 - a1, a1 - a0)); }
/* la cúpula gallonada (de gajos): la de la sala de lectura */
function cupulaGajos(K, r, color, { gajos = 12, punta = 1.25, gr = 0.006 } = {}) {
  const pts = [];
  for (let i = 0; i <= 12; i++) { const u = i / 12, a = u * Math.PI / 2; pts.push(new THREE.Vector2(Math.max(0.002, r * Math.cos(a) * (1 - 0.06 * u * u)), r * Math.sin(a) * (1 + (punta - 1) * u * u))); }
  const g = new THREE.LatheGeometry(pts, gajos * 4), p = g.getAttribute('position');
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 - 0.07 * Math.abs(Math.sin(a * gajos / 2)); p.setX(i, x * k); p.setZ(i, z * k); }
  g.computeVertexNormals();
  return K.malla(propia(g), color, { grosor: gr });
}

/* ---------- las texturas del replanteo ---------- */
/* el ladrillo cocido color ante, en hiladas con su junta de yeso (Ujaidir, Samarra, la Mustansiriya) */
const texAnte = () => textura('ab-ante2', 128, 128, (g, w, h) => {
  g.fillStyle = AB.junta; g.fillRect(0, 0, w, h);
  for (let y = 0, f = 0; y < h; y += 16, f++) for (let x = f % 2 ? -16 : 0; x < w; x += 32) {
    const k = Math.abs((x * 13 + y * 7 + f * 5) % 11); g.fillStyle = k === 0 ? AB.anteD : k === 5 ? AB.anteL : k === 8 ? '#d3b688' : AB.ante; g.fillRect(x + 1.5, y + 1.5, 29, 13);
  }
}, { repetir: true });
/* el adobe de la muralla mayor: hiladas gruesas de barro, apenas marcadas, con su caña entre hilada y hilada */
const texBarro = () => textura('ab-barro', 128, 128, (g, w, h) => {
  g.fillStyle = AB.barro; g.fillRect(0, 0, w, h);
  for (let y = 0, f = 0; y < h; y += 16, f++) {
    g.fillStyle = f % 4 === 3 ? 'rgba(140,104,62,.32)' : 'rgba(150,114,70,.16)'; g.fillRect(0, y, w, 2);
    for (let x = f % 2 ? 16 : 0; x < w; x += 32) { g.fillStyle = 'rgba(150,114,70,.14)'; g.fillRect(x, y, 2, 16); if ((x + y) % 48 === 0) { g.fillStyle = 'rgba(255,240,210,.18)'; g.fillRect(x + 4, y + 4, 22, 8); } }
  }
}, { repetir: true });
/* los nichos ciegos de arco lobulado (Qasr al-Ashiq, Samarra): pilastras claras, el nicho en sombra, el arco festoneado */
const texNichos = () => textura('ab-nichos', 128, 160, (g, w, h) => {
  g.fillStyle = AB.ante; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 8) { g.fillStyle = 'rgba(160,128,84,.18)'; g.fillRect(0, y, w, 1); }
  const x0 = 24, x1 = 104, yb = 156, ya = 58, cx = 64, top = 16;
  g.fillStyle = AB.anteL; g.fillRect(x0 - 10, top - 6, 10, yb - top + 6); g.fillRect(x1, top - 6, 10, yb - top + 6);   // las pilastras
  g.beginPath(); g.moveTo(x0, yb); g.lineTo(x0, ya); g.quadraticCurveTo(x0, top + 8, cx, top); g.quadraticCurveTo(x1, top + 8, x1, ya); g.lineTo(x1, yb); g.closePath();
  const gr = g.createLinearGradient(0, top, 0, yb); gr.addColorStop(0, '#9d7b52'); gr.addColorStop(1, '#bf9d70'); g.fillStyle = gr; g.fill();
  g.fillStyle = AB.ante;                                                       // los lóbulos del arco: mordiscos claros por dentro del borde
  for (let k = 1; k < 8; k++) { const u = k / 8, a = Math.PI * u; const px = cx - Math.cos(a) * (x1 - x0) / 2 * 0.96, py = ya - Math.sin(a) * (ya - top) * 0.98; g.beginPath(); g.arc(px, py + 2, 6.5, 0, 7); g.fill(); }
  g.strokeStyle = AB.anteL; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, yb); g.lineTo(x0, ya); g.quadraticCurveTo(x0, top + 8, cx, top); g.quadraticCurveTo(x1, top + 8, x1, ya); g.lineTo(x1, yb); g.stroke();
  g.fillStyle = '#5a4430'; g.beginPath(); g.moveTo(cx - 7, 120); g.lineTo(cx - 7, 96); g.quadraticCurveTo(cx, 86, cx + 7, 96); g.lineTo(cx + 7, 120); g.fill();   // la ventanita alta
}, { repetir: true });
/* el estuco tallado al bisel del estilo de Samarra: lóbulos espejados que se hunden con un corte oblicuo */
const texEstuco = () => textura('ab-estuco', 128, 32, (g, w, h) => {
  g.fillStyle = AB.estucoD; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 4; i++) {
    const cx = 16 + i * 32;
    for (const s of [-1, 1]) {
      g.beginPath(); g.moveTo(cx, 5); g.bezierCurveTo(cx + s * 15, 3, cx + s * 15, 22, cx + s * 5, 28); g.bezierCurveTo(cx + s * 3, 19, cx + s * 7, 12, cx, 11); g.closePath();
      const gr = g.createLinearGradient(cx - s * 8, 4, cx + s * 10, 28); gr.addColorStop(0, '#fff8e8'); gr.addColorStop(1, '#c2aa80'); g.fillStyle = gr; g.fill();
    }
    g.fillStyle = '#a99068'; g.fillRect(cx - 1, 7, 2, 21); g.beginPath(); g.arc(cx + 16, 16, 2.4, 0, 7); g.fill();
  }
  g.fillStyle = '#bba57c'; g.fillRect(0, 0, w, 2); g.fillRect(0, h - 2, w, 2);
}, { repetir: true });
/* la arcada: arcos apuntados abiertos sobre pilares; 'tiendas' con las mercancías de los puestos (las taqat de las avenidas) */
const texArcada = (tipo = 'liso') => textura('ab-arcada-' + tipo, 128, 64, (g, w, h) => {
  g.fillStyle = AB.ante; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 6) { g.fillStyle = 'rgba(160,128,84,.16)'; g.fillRect(0, y, w, 1); }
  for (let i = 0; i < 2; i++) {
    const x0 = i * 64 + 9, x1 = x0 + 46, cx = (x0 + x1) / 2;
    g.beginPath(); g.moveTo(x0, h); g.lineTo(x0, 30); g.quadraticCurveTo(x0, 9, cx, 5); g.quadraticCurveTo(x1, 9, x1, 30); g.lineTo(x1, h); g.closePath();
    g.fillStyle = '#4b3726'; g.fill(); g.strokeStyle = AB.anteL; g.lineWidth = 3; g.stroke();
    if (tipo === 'tiendas') {
      const cols = ['#b04a32', '#2f6f8a', '#dfb34a', '#5e9646', '#f1e6cd', '#8c603b'];
      for (let k = 0; k < 5; k++) { g.fillStyle = cols[(i * 3 + k) % 6]; g.fillRect(x0 + 4 + k * 8, h - 14 - (k % 2) * 5, 7, 14 + (k % 2) * 5); }
      g.fillStyle = cols[(i + 2) % 6]; g.fillRect(x0 + 2, 26, x1 - x0 - 4, 5);   // el toldito
    }
  }
}, { repetir: true });
/* la celosía de madera (mashrabiya): torneados en retícula, con la luz que pasa entre los huecos */
const texCelosia = () => textura('ab-celosia', 64, 64, (g, w, h) => {
  g.fillStyle = '#3a2716'; g.fillRect(0, 0, w, h);
  for (let y = 4; y < h; y += 8) for (let x = 4; x < w; x += 8) { g.fillStyle = AB.maderaL; g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill(); g.fillStyle = AB.madera; g.fillRect(x - 4, y - 0.8, 8, 1.6); g.fillRect(x - 0.8, y - 4, 1.6, 8); }
  g.strokeStyle = AB.maderaD; g.lineWidth = 3; g.strokeRect(1, 1, w - 2, h - 2);
}, { repetir: true });
/* el agua de los canales y del foso: el azul del Tigris con sus ondas */
const texAgua = () => textura('ab-agua', 128, 128, (g, w, h) => {
  g.fillStyle = AB.agua; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 16; i++) { const y = (i * 37) % 128, x = (i * 53) % 128; g.strokeStyle = i % 2 ? 'rgba(255,255,255,.42)' : 'rgba(40,100,130,.32)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 4, x + 20, y); g.stroke(); }
}, { repetir: true });
/* los estantes de la biblioteca: cajas de libros en nichos (la khizana) */
const texEstantes = () => textura('ab-estantes', 128, 128, (g, w, h) => {
  g.fillStyle = '#4a3220'; g.fillRect(0, 0, w, h);
  for (let f = 0; f < 5; f++) for (let c = 0; c < 5; c++) { g.fillStyle = '#2a1a10'; g.fillRect(4 + c * 24.5, 4 + f * 24.6, 22, 21);
    for (let b = 0; b < 3; b++) { g.fillStyle = [AB.blanco, '#c9a46a', '#8a3a2a', '#2f5f7a'][(c + f + b) % 4]; g.fillRect(6 + c * 24.5 + b * 6.5, 9 + f * 24.6, 5, 15); } }
}, { repetir: true });

/* ---------- la datilera de los palmares (liviana: un bosquecillo pide muchas) ---------- */
export function datilera(K, alto = 1.5, semilla = 1, { datiles = true, liviana = false } = {}) {
  const g = new THREE.Group(), r = n => h3(semilla, n, 3), inc = (r(1) - 0.5) * 0.16, giro = r(2) * 6.3;
  if (liviana) return datileraLiviana(K, alto, semilla);
  const t = new THREE.Group(); t.rotation.set(inc * Math.cos(giro), 0, inc * Math.sin(giro)); g.add(t);
  for (let i = 0; i < 4; i++) { const r0 = 0.06 - i * 0.006; pon(t, K.malla(K.cilindro(r0 - 0.006, r0, alto / 4, 7), i % 2 ? AB.palma : AB.palmaD, { grosor: 0.006 }), 0, (i + 0.5) * alto / 4, 0); }
  pon(t, K.malla(K.cono(0.11, 0.16, 7), AB.palmaD, { grosor: 0.005 }), 0, alto - 0.05, 0).rotation.x = Math.PI;   // la barba de pencas secas
  const copa = new THREE.Group(); copa.position.y = alto; t.add(copa);
  for (let i = 0; i < 10; i++) {
    const a = i * Math.PI * 2 / 10 + r(3) * 2, fr = new THREE.Group(); fr.rotation.y = a; copa.add(fr);
    const lev = i % 3 === 0 ? -0.35 : 0.12 + (i % 2) * 0.18, c = [AB.hoja, AB.hojaL, AB.hojaD][i % 3];
    const p = K.malla(K.caja(0.09, 0.016, 0.42), c, { grosor: 0.005 }); p.position.set(0, 0.04 + (lev < 0 ? 0.06 : 0), 0.2); p.rotation.x = lev; fr.add(p);
    const q = K.malla(K.caja(0.065, 0.012, 0.3), i % 2 ? AB.hojaD : AB.hoja, { grosor: 0.004 }); q.position.set(0, lev < 0 ? 0.2 : -0.06, lev < 0 ? 0.48 : 0.5); q.rotation.x = lev < 0 ? -0.1 : 0.75; fr.add(q);
  }
  if (datiles) [0, 2.2, 4.3].forEach(a => pon(copa, K.malla(K.esfera(0.05, 0.5), AB.datil, { grosor: 0.004 }), Math.cos(a) * 0.07, -0.09, Math.sin(a) * 0.07).scale.set(0.9, 1.4, 0.9));
  g.userData.ficha = { titulo: 'La datilera', texto: 'los palmares del Sawad: dátiles, sombra y vigas para los techos' };
  return g;
}
/* la de los patios, vista de lejos: el tronco de dos tramos y siete pencas */
function datileraLiviana(K, alto, semilla) {
  const g = new THREE.Group(), r = n => h3(semilla, n, 5);
  pon(g, K.malla(K.cilindro(0.045, 0.06, alto * 0.55, 6), AB.palmaD, { grosor: 0.006 }), 0, alto * 0.275, 0);
  pon(g, K.malla(K.cilindro(0.038, 0.045, alto * 0.45, 6), AB.palma, { grosor: 0.006 }), 0, alto * 0.775, 0);
  const copa = new THREE.Group(); copa.position.y = alto; g.add(copa);
  for (let i = 0; i < 7; i++) { const fr = new THREE.Group(); fr.rotation.y = i * Math.PI * 2 / 7 + r(1) * 2; copa.add(fr); const p = K.malla(K.caja(0.1, 0.018, 0.6), [AB.hoja, AB.hojaL, AB.hojaD][i % 3], { grosor: 0.005 }); p.position.set(0, 0.0, 0.27); p.rotation.x = 0.28 + (i % 2) * 0.22; fr.add(p); }
  return g;
}
/* un bosquecillo de datileras con su sotobosque de granados y la acequia: n palmeras en un radio */
export function palmar(K, n = 9, radio = 1.2, semilla = 1, { frutales = true } = {}) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const a = h3(semilla, i, 1) * Math.PI * 2, d = Math.sqrt(h3(semilla, i, 2)) * radio, p = datilera(K, 1.15 + h3(semilla, i, 4) * 0.7, semilla * 31 + i);
    p.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); g.add(p);
  }
  if (frutales) for (let i = 0; i < Math.round(n * 0.45); i++) {   // los granados y naranjos bajo las palmas (la agricultura de tres pisos del Sawad)
    const a = h3(semilla, i, 7) * Math.PI * 2, d = Math.sqrt(h3(semilla, i, 8)) * radio * 0.9, s = 0.13 + h3(semilla, i, 9) * 0.07;
    const f = new THREE.Group(); f.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); g.add(f);
    pon(f, K.malla(K.cilindro(0.018, 0.024, 0.16, 5), AB.palmaD, { grosor: 0.003 }), 0, 0.08, 0);
    pon(f, K.malla(K.esfera(s, 0.6), i % 2 ? '#5d8f3e' : '#6f9e46', { grosor: 0.005 }), 0, 0.16 + s * 0.7, 0).scale.y = 0.8;
    if (i % 3 === 0) pon(f, K.malla(K.esfera(0.025, 0.4), i % 2 ? '#d9662c' : '#c23b2e', { sinTinta: true }), s * 0.6, 0.18 + s * 0.6, 0.02);
  }
  return g;
}

/* ---------- las partes del palacio y de las puertas ---------- */
/* el jinete de oro con su lanza, sobre la Cúpula Verde («la lanza apuntaba hacia donde iba a venir el enemigo», cuenta
   al-Jatib); s: la escala (1 = un jinete de ~0,26 de alto) */
export function jinete(K, s = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s);
  const o = { grosor: 0.002 }, O = AB.oro, D = AB.oroD;
  pon(g, K.malla(K.cilindro(0.012, 0.02, 0.05, 6), D, o), 0, 0.025, 0);                                         // el pedestal
  const cab = K.malla(K.capsula(0.032, 0.085, 0.6), O, o); cab.rotation.z = Math.PI / 2; cab.position.set(0, 0.12, 0); g.add(cab);   // el caballo
  [[0.04, 0.02], [0.04, -0.02], [-0.04, 0.02], [-0.04, -0.02]].forEach(([x, z], i) => { const p = K.malla(K.cilindro(0.008, 0.007, 0.07, 4), D, o); p.position.set(x, 0.075, z); p.rotation.z = (i < 2 ? 1 : -1) * 0.18; g.add(p); });
  const cu = K.malla(K.capsula(0.018, 0.04, 0.5), O, o); cu.position.set(0.075, 0.16, 0); cu.rotation.z = -0.7; g.add(cu);   // el cuello
  pon(g, K.malla(K.caja(0.05, 0.022, 0.026), O, o), 0.105, 0.185, 0).rotation.z = -0.35;                         // la cabeza
  pon(g, K.malla(K.cono(0.012, 0.06, 4), D, o), -0.085, 0.11, 0).rotation.z = 1.9;                              // la cola
  pon(g, K.malla(K.capsula(0.02, 0.045, 0.5), O, o), -0.005, 0.19, 0);                                          // el jinete
  pon(g, K.malla(K.esfera(0.019, 0.5), O, o), 0.0, 0.245, 0);
  const lz = K.malla(K.cilindro(0.0035, 0.0035, 0.3, 4), D, { sinTinta: true }); lz.position.set(0.06, 0.22, 0.02); lz.rotation.z = -1.05; g.add(lz);   // la lanza
  pon(g, K.malla(K.cono(0.008, 0.03, 4), O, { sinTinta: true }), 0.19, 0.295, 0.02).rotation.z = -1.05;
  return g;
}
/* la portada (el pishtaq): el marco alto de estuco tallado con el arco apuntado; dentro, la boca en sombra y, si se pide,
   la puerta (dorada en la Puerta de Oro). Mira a +z; el fondo del marco es `prof`. */
export function portada(K, w, h, { prof = 0.08, puerta = null, franjaTxt = null, clave = 'p' } = {}) {
  const g = new THREE.Group();
  const f = K.malla(K.caja(w, h, prof), AB.estuco, { grosor: 0.004 }); f.position.y = h / 2; g.add(f);
  const bw = w * 0.56, bh = h * 0.74, z = prof / 2 + 0.002;
  const b = hueco(K, bw, bh, AB.hueco); b.position.set(0, 0, z + 0.001); g.add(b);
  if (puerta) { const p = hueco(K, bw * 0.7, bh * 0.66, puerta); p.position.set(0, 0, z + 0.002); g.add(p); }
  const fl = hueco(K, bw + w * 0.07, bh + w * 0.05, AB.anteD); fl.position.set(0, 0, z); g.add(fl);            // el filete del arco
  const e = w * 0.12;                                                                                          // las bandas de estuco: los dos costados y el dintel
  [-1, 1].forEach(l => { const m = lamT(K, e, h * 0.9, texEstuco(), 'est-v', 1, h * 0.9 / e / 4); m.rotation.z = Math.PI / 2; m.scale.set(h * 0.9 / e, e / (h * 0.9), 1); m.position.set(l * (w / 2 - e / 2 - w * 0.02), h * 0.47, z); g.add(m); });
  const top = lamT(K, w * 0.92, e, texEstuco(), 'est-h', w * 0.92 / e / 4, 1); top.position.set(0, h - e / 2 - w * 0.03, z); g.add(top);
  if (franjaTxt) { const fr = new THREE.Mesh(propia(new THREE.PlaneGeometry(w * 0.8, h * 0.075)), matTex(K, 'ba-franja-' + clave, franja(clave, franjaTxt))); fr.position.set(0, bh + (h - bh) * 0.38, z + 0.001); g.add(fr); }
  return g;
}
/* el pasaje en arco apuntado a través de un macizo de ladrillo (las puertas de la muralla): ancho W, fondo D, alto H, con
   el hueco PW × PH. Mira a ±z. */
function macizoConPasaje(K, W, D, H, PW, PH, tex, clave) {
  const g = new THREE.Group(), lado = (W - PW) / 2;
  [-1, 1].forEach(l => { const m = cajaT(K, lado, H, D, tex, clave); m.position.set(l * (PW / 2 + lado / 2), H / 2, 0); g.add(m); });
  const din = cajaT(K, PW + 0.002, H - PH, D, tex, clave); din.position.set(0, PH + (H - PH) / 2, 0); g.add(din);
  pon(g, caja(K, PW, 0.006, D, '#3a2a1c', { sinTinta: true }), 0, PH - 0.003, 0);
  [-1, 1].forEach(l => pon(g, caja(K, 0.006, PH, D, '#5a4232', { sinTinta: true }), l * (PW / 2 - 0.003), PH / 2, 0));
  [1, -1].forEach(l => {
    const marco = new THREE.Shape(); marco.moveTo(-PW / 2 - 0.03, 0); marco.lineTo(PW / 2 + 0.03, 0); marco.lineTo(PW / 2 + 0.03, PH + 0.025); marco.lineTo(-PW / 2 - 0.03, PH + 0.025); marco.closePath();
    marco.holes.push(arcoForma(PW - 0.004, PH - 0.004));
    const ar = K.malla(propia(new THREE.ShapeGeometry(marco, 8)), AB.anteL, { sinTinta: true, side: THREE.DoubleSide }); ar.position.set(0, 0, l * (D / 2 + 0.002)); g.add(ar);
  });
  return g;
}
/* la sala de audiencias de cúpula verde que había sobre cada puerta (el majlis); s: escala */
function salaCupula(K, s = 1, { color = AB.verde, figura = true } = {}) {
  const g = new THREE.Group(), w = 0.58 * s, h = 0.34 * s;
  pon(g, caja(K, w, h, w, AB.estuco, { grosor: 0.004 }), 0, h / 2, 0);
  for (let k = 0; k < 4; k++) { const v = hueco(K, 0.13 * s, 0.22 * s); v.position.set(Math.sin(k * Math.PI / 2) * (w / 2 + 0.003), 0.05 * s, Math.cos(k * Math.PI / 2) * (w / 2 + 0.003)); v.rotation.y = k * Math.PI / 2; g.add(v); }
  pon(g, caja(K, w + 0.05 * s, 0.035 * s, w + 0.05 * s, AB.anteD, { grosor: 0.003 }), 0, h + 0.017 * s, 0);
  pon(g, K.malla(K.cilindro(0.24 * s, 0.25 * s, 0.08 * s, 14), AB.estuco, { grosor: 0.003 }), 0, h + 0.075 * s, 0);
  const cu = cupula(K, 0.26 * s, color, { punta: 1.25 }); cu.position.y = h + 0.115 * s; g.add(cu);
  const top = h + 0.115 * s + 0.26 * s * 1.25;
  pon(g, K.malla(K.esfera(0.025 * s, 0.5), AB.oro, { sinTinta: true }), 0, top + 0.01 * s, 0);
  if (figura) {                                                              // la figura que giraba con el viento (aquí, una veleta con su banderola)
    pon(g, K.malla(K.cilindro(0.005 * s, 0.005 * s, 0.14 * s, 4), AB.oroD, { sinTinta: true }), 0, top + 0.08 * s, 0);
    pon(g, K.malla(K.caja(0.07 * s, 0.035 * s, 0.006 * s), AB.oro, { grosor: 0.002 }), 0.035 * s, top + 0.12 * s, 0);
  }
  g.userData.alto = top + 0.12 * s;
  return g;
}

/* ---------- EL HÉROE A: LA CIUDAD REDONDA ENTERA (Madinat al-Salam, 762-766) ---------- */
/* El orden de afuera hacia adentro es el de al-Jatib: el foso con agua, la muralla de afuera (más baja), el fasil (el
   anillo vacío entre las dos), la muralla mayor de adobe, ancha abajo y con talud, con sus torres de medio círculo, las
   cuatro puertas (cada una con su pasaje, su sala de cúpula encima y, por fuera, el puente del foso), el anillo de las
   casas cortado por las cuatro avenidas con arcadas de tiendas, la muralla interior y la gran plaza con el palacio de la
   Puerta de Oro y la mezquita. R: el radio del eje de la muralla mayor; H: su alto. Las puertas miran a ±x y ±z. */
export const PUERTAS_REDONDA = [['jorasan', 0], ['kufa', Math.PI / 2], ['sham', Math.PI], ['basora', Math.PI * 1.5]];
export function ciudadRedonda(K, { R = 3.5, H = 1.0, torres = 14 } = {}) {
  const g = new THREE.Group(), t0 = 0.36, t1 = 0.24, Ro = R + 0.47, Ho = 0.5, to = 0.12, F0 = Ro + 0.15, F1 = Ro + 0.47, GAP = 0.15, GAPo = 0.09;
  const tB = texBarro(), tA = texAnte();
  const cuarto = (k, gap) => [PUERTAS_REDONDA[k][1] + gap, PUERTAS_REDONDA[k][1] + Math.PI / 2 - gap];
  const almMayor = [], almAfuera = [], torresM = [], torresA = [];
  /* el foso con su agua y sus dos bordillos de ladrillo */
  const agua = new THREE.Mesh(propia(new THREE.RingGeometry(F0, F1, 120, 1)), matR(K, 'ab-agua-foso', texAgua(), F1 * 1.6, F1 * 1.6)); agua.rotation.x = -Math.PI / 2; agua.position.y = 0.012; agua.receiveShadow = true; g.add(agua);
  [[F0, -1], [F1, 1]].forEach(([r, s]) => { const b = K.malla(geoTorno([[r + s * 0.05, 0], [r + s * 0.05, 0.05], [r, 0.05], [r, 0]], 0, Math.PI * 2, 120), AB.anteD, { grosor: 0.004 }); g.add(b); });
  /* el fasil: la tierra apisonada entre las dos murallas */
  const fas = K.malla(propia(new THREE.RingGeometry(R + t0 / 2 - 0.01, Ro - to / 2 + 0.01, 120, 1)), '#d9c49a', { sinTinta: true, sombra: false }); fas.rotation.x = -Math.PI / 2; fas.position.y = 0.004; g.add(fas);
  for (let k = 0; k < 4; k++) {
    /* la muralla de afuera: un muro bajo de adobe con torrecillas y almenas */
    const [b0, b1] = cuarto(k, GAPo), Lo = (b1 - b0) * Ro;
    const mo = matR(K, 'ab-barro-o', tB, Lo / 1.0, Ho / 1.0);
    const ext = K.malla(geoTorno([[Ro + to / 2, 0], [Ro + to / 2, Ho]], b0, b1, 40), mo, { grosor: 0.005 }), int = K.malla(geoTorno([[Ro - to / 2, Ho], [Ro - to / 2, 0]], b0, b1, 40), mo, { grosor: 0.005 });
    g.add(ext, int, K.malla(geoTorno([[Ro + to / 2, Ho], [Ro - to / 2, Ho]], b0, b1, 40), AB.barroD, { grosor: 0.004 }));
    for (let i = 0; i < 11; i++) { const a = b0 + (i + 0.5) / 11 * (b1 - b0); torresA.push([Math.cos(a) * (Ro + to / 2), 0, Math.sin(a) * (Ro + to / 2)]); }
    for (let a = b0 + 0.02; a < b1 - 0.01; a += 0.16 / Ro) almAfuera.push([Math.cos(a) * (Ro + to / 2 - 0.015), Ho, Math.sin(a) * (Ro + to / 2 - 0.015), Math.PI / 2 - a]);
    /* la muralla mayor: el talud de adobe por fuera, el adarve arriba y la cara de adentro */
    const [a0, a1] = cuarto(k, GAP), L = (a1 - a0) * R, mm = matR(K, 'ab-barro-m', tB, L / 1.0, H / 1.0);
    g.add(K.malla(geoTorno([[R + t0 / 2, 0], [R + t1 / 2, H]], a0, a1, 48), mm, { grosor: 0.007 }));
    g.add(K.malla(geoTorno([[R - t1 / 2, H], [R - t0 / 2, 0]], a0, a1, 48), mm, { grosor: 0.007 }));
    g.add(K.malla(geoTorno([[R + t1 / 2, H], [R - t1 / 2, H]], a0, a1, 48), AB.barroD, { grosor: 0.005 }));
    for (let i = 0; i < torres; i++) { const a = a0 + (i + 0.5) / torres * (a1 - a0); torresM.push([Math.cos(a) * (R + t0 / 2 - 0.02), 0, Math.sin(a) * (R + t0 / 2 - 0.02)]); }
    for (let a = a0 + 0.015; a < a1 - 0.01; a += 0.13 / R) almMayor.push([Math.cos(a) * (R + t1 / 2 - 0.025), H, Math.sin(a) * (R + t1 / 2 - 0.025), Math.PI / 2 - a]);
  }
  g.add(instancias(K, K.cilindro(0.11, 0.125, H + 0.08, 10), AB.barroL, torresM.map(([x, , z]) => [x, (H + 0.08) / 2, z]), { grosor: 0.005 }));
  g.add(instancias(K, K.cilindro(0.14, 0.14, 0.04, 10), AB.barroD, torresM.map(([x, , z]) => [x, H + 0.1, z]), { grosor: 0.003 }));
  g.add(instancias(K, K.cilindro(0.065, 0.072, Ho + 0.05, 8), AB.barroL, torresA.map(([x, , z]) => [x, (Ho + 0.05) / 2, z]), { grosor: 0.004 }));
  g.add(instancias(K, geoAlmena(0.075, 0.09, 0.04), AB.barroD, almMayor, { grosor: 0.003 }));
  g.add(instancias(K, K.caja(0.07, 0.07, 0.03), AB.barroD, almAfuera.map(([x, y, z, ry]) => [x, y + 0.035, z, ry]), { grosor: 0.003 }));
  /* las cuatro puertas: el macizo de ladrillo cocido con su pasaje, las dos torres, la sala de cúpula verde encima, el paso
     por el fasil, la puerta de afuera y el puente del foso */
  for (const [nombre, a] of PUERTAS_REDONDA) {
    const p = new THREE.Group(); p.position.set(Math.cos(a) * R, 0, Math.sin(a) * R); p.rotation.y = Math.PI / 2 - a; g.add(p);
    const Wg = 1.0, Dg = 0.68, Hg = 1.42;
    p.add(macizoConPasaje(K, Wg, Dg, Hg, 0.3, 0.56, tA, 'ab-ante-pu'));
    const fr = new THREE.Mesh(propia(new THREE.PlaneGeometry(0.62, 0.08)), matTex(K, 'ba-franja-' + nombre, franja(nombre, 'مدينة السلام'))); fr.position.set(0, 0.72, Dg / 2 + 0.004); p.add(fr);
    const es = lamT(K, 0.74, 0.07, texEstuco(), 'est-pu', 0.74 / 0.07 / 4, 1); es.position.set(0, 0.82, Dg / 2 + 0.004); p.add(es);
    [-1, 1].forEach(l => {
      const t = K.malla(K.cilindro(0.16, 0.18, Hg + 0.08, 12), AB.ante, { grosor: 0.005 }); t.position.set(l * Wg / 2, (Hg + 0.08) / 2, 0.12); p.add(t);
      pon(p, K.malla(K.cilindro(0.19, 0.19, 0.045, 12), AB.anteD, { grosor: 0.003 }), l * Wg / 2, Hg + 0.1, 0.12);
    });
    const alm = []; almenasCaja(alm, 0, 0, Wg, Dg, Hg, 0.11); p.add(instancias(K, geoAlmena(0.07, 0.085, 0.035), AB.anteD, alm, { grosor: 0.003 }));
    const sala = salaCupula(K, 1.0); sala.position.set(0, Hg, -0.02); p.add(sala);
    [-1, 1].forEach(l => pon(p, caja(K, 0.06, 0.46, Ro - R - Dg / 2 - 0.06, AB.barro, { grosor: 0.004 }), l * 0.2, 0.23, Dg / 2 + (Ro - R - Dg / 2 - 0.06) / 2));   // el paso por el fasil
    const pa = macizoConPasaje(K, 0.58, 0.16, 0.7, 0.26, 0.44, tB, 'ab-barro-pa'); pa.position.z = Ro - R; p.add(pa);
    const alo = []; almenasRecta(alo, -0.29, Ro - R + 0.08, 0.29, Ro - R + 0.08, 0.7, 0.1); p.add(instancias(K, geoAlmena(0.065, 0.07, 0.03), AB.barroD, alo, { grosor: 0.003 }));
    const lp = F1 - F0 + 0.12;                                                                                  // el puente del foso
    pon(p, caja(K, 0.34, 0.04, lp, AB.anteD, { grosor: 0.004 }), 0, 0.045, (F0 + F1) / 2 - R);
    [-1, 1].forEach(l => pon(p, caja(K, 0.03, 0.07, lp, AB.ante, { grosor: 0.003 }), l * 0.17, 0.095, (F0 + F1) / 2 - R));
  }
  /* el anillo de las casas: dos anillos de manzanas entre calles radiales (las sikak, con su puerta cada una), cortados por
     las cuatro avenidas; en las azoteas, los patios en sombra, alguna palmera que asoma y alguna torre de viento */
  const rI = [[1.98, 2.5, 5], [2.6, 3.17, 7]], AV = 0.34, MUROS = [AB.barro, AB.barroL, AB.ante, '#e2cfa8', AB.estuco, '#d0b283'];
  const patios = [], palmas = [], badgirs = [];
  rI.forEach(([r0, r1, n], ring) => {
    for (let k = 0; k < 4; k++) {
      const m = AV / r0, b0 = PUERTAS_REDONDA[k][1] + m, b1 = PUERTAS_REDONDA[k][1] + Math.PI / 2 - m, lg = 0.07 / ((r0 + r1) / 2);
      for (let i = 0; i < n; i++) {
        const s0 = b0 + (b1 - b0) * i / n + lg / 2, s1 = b0 + (b1 - b0) * (i + 1) / n - lg / 2, sem = ring * 100 + k * 10 + i, h = 0.3 + h3(sem, 1) * 0.26 + (ring ? 0 : 0.06);
        g.add(K.malla(geoSector(r0, r1, s0, s1, h, 4), MUROS[Math.floor(h3(sem, 2) * MUROS.length)], { grosor: 0.004 }));
        const rm = (r0 + r1) / 2, np = 1 + (h3(sem, 3) > 0.45 ? 1 : 0);
        for (let q = 0; q < np; q++) {
          const a = s0 + (s1 - s0) * (np === 1 ? 0.5 : 0.28 + q * 0.44), rr = rm + (h3(sem, 4 + q) - 0.5) * 0.12, tam = 0.1 + h3(sem, 6 + q) * 0.05;
          patios.push([Math.cos(a) * rr, h + 0.004, Math.sin(a) * rr, Math.PI / 2 - a, tam / 0.12]);
          if (h3(sem, 8 + q) > 0.72) palmas.push([Math.cos(a) * rr, h, Math.sin(a) * rr, sem]);
        }
        if (h3(sem, 9) > 0.62) { const a = s0 + (s1 - s0) * 0.15, rr = r1 - 0.06; badgirs.push([Math.cos(a) * rr, h + 0.06, Math.sin(a) * rr, Math.PI / 2 - a]); }
      }
    }
  });
  g.add(instancias(K, K.caja(0.12, 0.006, 0.12), AB.sombra, patios, { sinTinta: true, sombra: false }));
  g.add(instancias(K, K.caja(0.06, 0.12, 0.06), AB.barroD, badgirs, { grosor: 0.003 }));
  palmas.forEach(([x, y, z, sem]) => { const p = datilera(K, 0.9, sem, { liviana: true }); p.scale.setScalar(0.5); p.position.set(x, y - 0.18, z); g.add(p); });
  /* las cuatro avenidas, de cada puerta a la plaza: el empedrado de ladrillo y, a los dos lados, las arcadas de las tiendas */
  for (const [, a] of PUERTAS_REDONDA) {
    const av = new THREE.Group(); av.rotation.y = Math.PI / 2 - a; g.add(av);
    const ra = 1.97, rb = 3.2, La = rb - ra;
    pon(av, caja(K, 0.36, 0.006, R - 1.86, '#d9b98e', { sinTinta: true, sombra: false }), 0, 0.005, (R + 1.86) / 2 - 0.04);
    [-1, 1].forEach(l => {
      pon(av, caja(K, 0.13, 0.3, La, AB.ante, { grosor: 0.004 }), l * 0.245, 0.15, (ra + rb) / 2);
      pon(av, caja(K, 0.17, 0.025, La + 0.02, AB.anteD, { grosor: 0.003 }), l * 0.245, 0.312, (ra + rb) / 2);
      const f = lamT(K, La, 0.28, texArcada('tiendas'), 'arc-t', La / 0.26, 1); f.position.set(l * (0.245 - 0.066), 0.14, (ra + rb) / 2); f.rotation.y = -l * Math.PI / 2; av.add(f);
    });
  }
  /* la muralla interior y la gran plaza del centro, enladrillada */
  const ri = 1.9, gi = 0.2 / ri;
  for (let k = 0; k < 4; k++) {
    const a0 = PUERTAS_REDONDA[k][1] + gi, a1 = PUERTAS_REDONDA[k][1] + Math.PI / 2 - gi;
    g.add(K.malla(geoTorno([[ri + 0.04, 0], [ri + 0.04, 0.3]], a0, a1, 28), AB.ante, { grosor: 0.004 }), K.malla(geoTorno([[ri - 0.04, 0.3], [ri - 0.04, 0]], a0, a1, 28), AB.anteL, { grosor: 0.004 }), K.malla(geoTorno([[ri + 0.04, 0.3], [ri - 0.04, 0.3]], a0, a1, 28), AB.anteD, { grosor: 0.003 }));
  }
  for (const [, a] of PUERTAS_REDONDA) [-1, 1].forEach(l => { const x = Math.cos(a) * ri - Math.sin(a) * l * 0.22, z = Math.sin(a) * ri + Math.cos(a) * l * 0.22; pon(g, caja(K, 0.1, 0.42, 0.1, AB.anteL, { grosor: 0.003 }), x, 0.21, z, Math.PI / 2 - a); });
  const pl = K.malla(propia(new THREE.CircleGeometry(ri - 0.03, 64)), '#e6d3aa', { sinTinta: true, sombra: false }); pl.rotation.x = -Math.PI / 2; pl.position.y = 0.006; g.add(pl);
  /* el palacio de la Puerta de Oro, en el centro exacto; la mezquita, pegada a su costado; las casas de la guardia */
  /* la Cúpula Verde era lo más alto de Bagdad (80 codos hasta el jinete, el doble que las puertas): el palacio, a 1,3, pasa
     de 3,1 a 4,0 de alto; la mezquita, a 0,78, cabe entre él y la muralla interior */
  const ESC_PAL = 1.3, pal = palacioOro(K, 'compacto'); pal.scale.setScalar(ESC_PAL); g.add(pal);
  const mz = mezquitaChica(K); mz.scale.setScalar(0.78); mz.position.set(1.33, 0, -0.4); g.add(mz);
  [[-1.27, 0.94], [-1.32, -0.88], [0.33, -1.49]].forEach(([x, z], i) => { pon(g, caja(K, 0.42, 0.26, 0.3, MUROS[i + 1], { grosor: 0.004 }), x, 0.13, z, Math.atan2(x, z)); });
  g.userData.alto = pal.userData.alto * ESC_PAL;
  g.userData.ficha = { titulo: 'La Ciudad Redonda', texto: 'Madinat al-Salam, «la ciudad de la paz»: al-Mansur la trazó en 762 con cuatro puertas y el palacio en el centro' };
  return g;
}

/* ---------- el palacio de la Puerta de Oro (Qasr Bab al-Dhahab) ---------- */
/* 'compacto': el bloque que corona la Ciudad Redonda (el cuerpo con sus torres, el iwan de la Puerta de Oro al frente, la
   sala alta con sus nichos, el tambor y la Cúpula Verde con el jinete). La versión de cerca es palacioCerca. */
function coronaCupula(K, w, { hc = 0.78, rd = 0.42, cuerpo = true } = {}) {
  /* la sala alta con nichos lobulados, el tambor con ventanas y la franja de estuco, la Cúpula Verde, el anillo de oro y
     el jinete; devuelve el grupo con su alto en userData */
  const g = new THREE.Group();
  if (cuerpo) {
    pon(g, cajaT(K, w, hc, w, texAnte(), 'ab-ante-cr'), 0, hc / 2, 0);
    for (let k = 0; k < 4; k++) { const n = lamT(K, w * 0.9, hc * 0.8, texNichos(), 'nichos-cr', 3, 1); n.position.set(Math.sin(k * Math.PI / 2) * (w / 2 + 0.003), hc * 0.45, Math.cos(k * Math.PI / 2) * (w / 2 + 0.003)); n.rotation.y = k * Math.PI / 2; g.add(n); }
    pon(g, caja(K, w + 0.06, 0.04, w + 0.06, AB.anteD, { grosor: 0.003 }), 0, hc + 0.02, 0);
    const al = []; almenasCaja(al, 0, 0, w + 0.02, w + 0.02, hc + 0.04, 0.09); g.add(instancias(K, geoAlmena(0.06, 0.07, 0.03), AB.anteD, al, { grosor: 0.003 }));
  }
  const y0 = cuerpo ? hc + 0.04 : 0, ht = rd * 0.74;
  pon(g, K.malla(K.cilindro(rd, rd + 0.01, ht, 16), AB.estuco, { grosor: 0.004 }), 0, y0 + ht / 2, 0);
  const banda = new THREE.Mesh(propia(new THREE.CylinderGeometry(rd + 0.006, rd + 0.006, ht * 0.22, 32, 1, true)), matR(K, 'est-tambor', texEstuco(), rd * 2 * Math.PI / 0.2, 1)); banda.position.y = y0 + ht * 0.86; g.add(banda);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8; const v = hueco(K, rd * 0.2, ht * 0.5); v.position.set(Math.cos(a) * (rd + 0.008), y0 + ht * 0.14, Math.sin(a) * (rd + 0.008)); v.rotation.y = Math.PI / 2 - a; g.add(v); }
  const rc = rd * 1.04, cu = cupula(K, rc, AB.verde, { punta: 1.32, gr: 0.007 }); cu.position.y = y0 + ht; g.add(cu);
  const anillo = K.malla(K.toro(rc * 0.995, 0.014, Math.PI * 2, 0.8), AB.oro, { sinTinta: true }); anillo.rotation.x = Math.PI / 2; anillo.position.y = y0 + ht + 0.01; g.add(anillo);
  const cima = y0 + ht + rc * 1.32;
  pon(g, K.malla(K.cilindro(0.008, 0.012, 0.08, 5), AB.oroD, { sinTinta: true }), 0, cima + 0.03, 0);
  pon(g, K.malla(K.esfera(0.032, 0.5), AB.oro, { grosor: 0.002 }), 0, cima + 0.06, 0);
  const j = jinete(K, rd / 0.42 * 1.0); j.position.y = cima + 0.08; j.rotation.y = 0.5; g.add(j);
  g.userData.alto = cima + 0.08 + 0.26 * rd / 0.42 + 0.06;
  return g;
}
export function palacioOro(K, modo = 'compacto') {
  if (modo === 'cerca') return palacioCerca(K);
  const g = new THREE.Group(), W = 1.22, Hb = 1.0;
  pon(g, caja(K, W + 0.12, 0.06, W + 0.12, AB.anteD, { grosor: 0.004 }), 0, 0.03, 0);
  pon(g, cajaT(K, W, Hb, W, texAnte(), 'ab-ante-pal'), 0, Hb / 2, 0);
  const tor = [], cap = [];
  for (let k = 0; k < 4; k++) {                                         // los contrafuertes de medio círculo de cada cara y las torres de las esquinas
    const s = Math.sin(k * Math.PI / 2), c = Math.cos(k * Math.PI / 2);
    if (k !== 0) for (const u of [-0.3, 0.3]) tor.push([s * (W / 2) + c * u, Hb / 2, c * (W / 2) - s * u]);
    const ex = (k % 2 ? -1 : 1) * W / 2, ez = (k < 2 ? 1 : -1) * W / 2; cap.push([ex, (Hb + 0.08) / 2, ez]);
  }
  g.add(instancias(K, K.cilindro(0.055, 0.06, Hb, 8), AB.anteL, tor, { grosor: 0.004 }));
  g.add(instancias(K, K.cilindro(0.1, 0.11, Hb + 0.08, 10), AB.ante, cap, { grosor: 0.004 }));
  const al = []; almenasCaja(al, 0, 0, W, W, Hb, 0.1); g.add(instancias(K, geoAlmena(0.07, 0.08, 0.035), AB.anteD, al, { grosor: 0.003 }));
  const iw = portada(K, 0.62, 0.92, { prof: 0.07, puerta: AB.oro, franjaTxt: 'باب الذهب', clave: 'babdhahab' }); iw.position.z = W / 2 + 0.035; g.add(iw);   // la Puerta de Oro
  const lat = portada(K, 0.42, 0.66, { prof: 0.05 }); lat.position.x = W / 2 + 0.025; lat.rotation.y = Math.PI / 2; g.add(lat);
  const cr = coronaCupula(K, 0.86, { hc: 0.74, rd: 0.42 }); cr.position.y = Hb; g.add(cr);
  g.userData.alto = Hb + cr.userData.alto;
  g.userData.ficha = { titulo: 'La Cúpula Verde', texto: 'el palacio de la Puerta de Oro, en el centro de la ciudad: 80 codos hasta el jinete' };
  return g;
}
/* la mezquita de la plaza, chica (la que va al lado del palacio en la ciudad entera): el recinto, la sala de columnas de
   madera bajo el techo plano del lado de la qibla y el patio con su fuente */
function mezquitaChica(K) {
  const g = new THREE.Group(), W = 0.92, D = 0.92, H = 0.32;
  [[0, -D / 2, W, 0.06], [0, D / 2, W, 0.06], [-W / 2, 0, 0.06, D], [W / 2, 0, 0.06, D]].forEach(([x, z, w, d]) => pon(g, caja(K, w, H, d, AB.ante, { grosor: 0.004 }), x, H / 2, z));
  pon(g, caja(K, W - 0.06, 0.008, D - 0.06, '#e9dcbc', { sinTinta: true, sombra: false }), 0, 0.006, 0);
  pon(g, caja(K, W - 0.04, 0.05, 0.38, AB.anteD, { grosor: 0.003 }), 0, H + 0.02, -D / 2 + 0.2);
  for (let i = 0; i < 6; i++) pon(g, K.malla(K.cilindro(0.014, 0.016, H, 5), AB.madera, { grosor: 0.002 }), -W / 2 + 0.1 + i * (W - 0.2) / 5, H / 2, -D / 2 + 0.38);
  pon(g, K.malla(K.cilindro(0.08, 0.09, 0.05, 8), AB.cal, { grosor: 0.003 }), 0, 0.03, 0.15);
  pon(g, K.malla(K.cilindro(0.06, 0.06, 0.01, 8), AB.agua, { sinTinta: true }), 0, 0.056, 0.15);
  const al = []; almenasCaja(al, 0, 0, W, D, H, 0.1); g.add(instancias(K, geoAlmena(0.06, 0.06, 0.03), AB.anteD, al, { grosor: 0.003 }));
  const pt = hueco(K, 0.18, 0.24); pt.position.set(0, 0, D / 2 + 0.032); g.add(pt);
  return g;
}

/* ---------- EL HÉROE B: EL PALACIO DE LA PUERTA DE ORO, DE CERCA ---------- */
/* El orden que da al-Jatib: la Puerta de Oro (Bab al-Dhahab, que le dio el nombre), el patio, el iwan de 30 × 20 codos y,
   detrás, la sala de audiencias bajo una cúpula; encima de ella, otra sala con la Cúpula Verde (80 codos hasta el jinete).
   El recinto, de Ujaidir (775, el palacio abasí que sigue en pie): muros de ladrillo con contrafuertes de medio círculo,
   torres en las esquinas, almenas escalonadas; los costados del patio, con arcos ciegos. A su lado, pegada, la mezquita
   (la mitad de su lado: 200 codos contra 400), con la sala de columnas de madera. Mira a +z. */
function palacioCerca(K) {
  const g = new THREE.Group(), S = 3.0, cx = -0.6, Hm = 0.85, e = 0.15, tA = texAnte();
  const pal = new THREE.Group(); pal.position.x = cx; g.add(pal);
  pon(g, caja(K, 4.9, 0.04, 3.5, '#e3cfa4', { sinTinta: true, sombra: false }), 0.22, 0.02, 0.05);              // la plaza enladrillada
  pon(pal, caja(K, S + 0.14, 0.06, S + 0.14, AB.anteD, { grosor: 0.004 }), 0, 0.03, 0);
  /* los muros del recinto, con el hueco de la puerta al frente */
  const muro = (w, d, x, z) => { const m = cajaT(K, w, Hm, d, tA, 'ab-ante-pc'); m.position.set(x, Hm / 2, z); pal.add(m); };
  muro(S, e, 0, -S / 2 + e / 2); muro(e, S, -S / 2 + e / 2, 0); muro(e, S, S / 2 - e / 2, 0);
  muro((S - 1.0) / 2, e, -(S + 1.0) / 4, S / 2 - e / 2); muro((S - 1.0) / 2, e, (S + 1.0) / 4, S / 2 - e / 2);
  const tor = [], esq = [], alm = [];
  for (const [ax, az, bx, bz] of [[-S / 2, S / 2, S / 2, S / 2], [S / 2, -S / 2, S / 2, S / 2], [-S / 2, -S / 2, S / 2, -S / 2], [-S / 2, -S / 2, -S / 2, S / 2]]) {
    const n = 6; for (let i = 1; i < n; i++) { const u = i / n, x = ax + (bx - ax) * u, z = az + (bz - az) * u; if (Math.abs(x) < 0.7 && z > 0) continue; tor.push([x + (az === bz ? 0 : Math.sign(ax) * 0.01), Hm / 2, z + (az === bz ? Math.sign(az) * 0.01 : 0)]); }
    almenasRecta(alm, ax, az, bx, bz, Hm, 0.12);
  }
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => esq.push([a * S / 2, (Hm + 0.17) / 2, b * S / 2]));
  pal.add(instancias(K, K.cilindro(0.075, 0.085, Hm, 10), AB.anteL, tor, { grosor: 0.004 }));
  pal.add(instancias(K, K.cilindro(0.17, 0.19, Hm + 0.17, 12), AB.ante, esq, { grosor: 0.005 }));
  pal.add(instancias(K, K.cilindro(0.2, 0.2, 0.04, 12), AB.anteD, esq.map(([x, , z]) => [x, Hm + 0.19, z]), { grosor: 0.003 }));
  pal.add(instancias(K, geoAlmena(0.08, 0.09, 0.04), AB.anteD, alm.filter(([x, , z]) => !(Math.abs(x) < 0.55 && z > 0)), { grosor: 0.003 }));
  /* la Puerta de Oro, entre dos torres */
  const pu = portada(K, 1.0, 1.42, { prof: 0.26, puerta: AB.oro, franjaTxt: 'باب الذهب', clave: 'babdhahab2' }); pu.position.z = S / 2 + 0.02; pal.add(pu);
  [-1, 1].forEach(l => { pon(pal, K.malla(K.cilindro(0.17, 0.19, 1.28, 12), AB.ante, { grosor: 0.005 }), l * 0.62, 0.64, S / 2 + 0.02); pon(pal, K.malla(K.cilindro(0.2, 0.2, 0.04, 12), AB.anteD, { grosor: 0.003 }), l * 0.62, 1.3, S / 2 + 0.02); });
  /* el patio: el enlosado claro, el estanque y, a los costados, las crujías con arcos ciegos */
  pon(pal, caja(K, S - 2 * e, 0.012, 1.55, '#ecdcb6', { sinTinta: true, sombra: false }), 0, 0.066, 0.62);
  pon(pal, caja(K, 0.7, 0.05, 0.36, AB.estucoD, { grosor: 0.003 }), 0, 0.08, 0.55);
  pon(pal, caja(K, 0.62, 0.01, 0.28, AB.agua, { sinTinta: true }), 0, 0.106, 0.55);
  [-1, 1].forEach(l => {
    const x = l * (S / 2 - e - 0.26);
    pon(pal, cajaT(K, 0.52, 0.66, 1.7, tA, 'ab-ante-pc2'), x, 0.33, 0.55);
    const f = lamT(K, 1.7, 0.6, texArcada('liso'), 'arc-l', 1.7 / 0.3, 1); f.position.set(x - l * 0.262, 0.31, 0.55); f.rotation.y = -l * Math.PI / 2; pal.add(f);
    pon(pal, caja(K, 0.56, 0.03, 1.74, AB.anteD, { grosor: 0.003 }), x, 0.675, 0.55);
  });
  /* el cuerpo del iwan y, a los lados, las habitaciones de atrás con sus patiecitos */
  const Hi = 1.28, zi = -0.78;
  pon(pal, cajaT(K, 1.5, Hi, 1.2, tA, 'ab-ante-pc3'), 0, Hi / 2, zi);
  const iw = portada(K, 0.95, 1.18, { prof: 0.1 }); iw.position.set(0, 0, zi + 0.6 + 0.05); pal.add(iw);
  const ali = []; almenasCaja(ali, 0, zi, 1.5, 1.2, Hi, 0.11); pal.add(instancias(K, geoAlmena(0.07, 0.08, 0.035), AB.anteD, ali, { grosor: 0.003 }));
  [-1, 1].forEach(l => {
    pon(pal, cajaT(K, 0.55, 0.72, 1.2, tA, 'ab-ante-pc4'), l * 1.04, 0.36, zi);
    pon(pal, caja(K, 0.22, 0.008, 0.3, AB.sombra, { sinTinta: true }), l * 1.04, 0.725, zi - 0.1);
  });
  const cr = coronaCupula(K, 1.0, { hc: 0.6, rd: 0.48 }); cr.position.set(0, Hi, zi - 0.05); pal.add(cr);
  /* la mezquita, pegada al costado del palacio */
  const mz = mezquitaMansur(K, { W: 1.5, minarete: false }); mz.position.set(cx + S / 2 + 0.06 + 0.75, 0, 0.35); g.add(mz);
  g.userData.alto = Hi + cr.userData.alto;
  g.userData.ficha = { titulo: 'El palacio de la Puerta de Oro', texto: 'el iwan, la sala de la cúpula y, encima, la Cúpula Verde con su jinete' };
  return g;
}

/* ---------- LA GRAN MEZQUITA DE AL-MANSUR ---------- */
/* Cuadrada, de 200 codos, pegada al palacio; de adobe con columnas de madera bajo el techo plano, y rehecha en ladrillo
   cocido por Harun al-Rashid (808). La sala de oración, del lado de la qibla (aquí, al fondo); en los otros tres lados,
   una galería; en el patio, la fuente de las abluciones. El alminar es supuesto (las crónicas no lo describen): cuadrado y
   en tres cuerpos, como los de su siglo (Cairuán, 836). Mira a +z. */
export function mezquitaMansur(K, { W = 2.4, minarete = true } = {}) {
  const g = new THREE.Group(), Hm = W * 0.21, e = 0.11, tA = texAnte();
  pon(g, caja(K, W + 0.12, 0.05, W + 0.12, AB.anteD, { grosor: 0.004 }), 0, 0.025, 0);
  const muro = (w, d, x, z) => { const m = cajaT(K, w, Hm, d, tA, 'ab-ante-mz'); m.position.set(x, Hm / 2, z); g.add(m); };
  muro(W, e, 0, -W / 2 + e / 2); muro(e, W, -W / 2 + e / 2, 0); muro(e, W, W / 2 - e / 2, 0);
  const pw = W * 0.26; muro((W - pw) / 2, e, -(W + pw) / 4, W / 2 - e / 2); muro((W - pw) / 2, e, (W + pw) / 4, W / 2 - e / 2);
  const tor = [], alm = [];
  for (const [ax, az, bx, bz] of [[-W / 2, W / 2, W / 2, W / 2], [W / 2, -W / 2, W / 2, W / 2], [-W / 2, -W / 2, W / 2, -W / 2], [-W / 2, -W / 2, -W / 2, W / 2]]) {
    const n = Math.round(W / 0.42); for (let i = 0; i <= n; i++) { const u = i / n, x = ax + (bx - ax) * u, z = az + (bz - az) * u; if (Math.abs(x) < pw / 2 + 0.05 && z > 0) continue; tor.push([x, Hm / 2 + (i === 0 || i === n ? 0.03 : 0), z, 0, i === 0 || i === n ? 1.5 : 1]); }
    almenasRecta(alm, ax, az, bx, bz, Hm, 0.12);
  }
  g.add(instancias(K, K.cilindro(0.06, 0.068, Hm, 8), AB.anteL, tor, { grosor: 0.004 }));
  g.add(instancias(K, geoAlmena(0.07, 0.08, 0.035), AB.anteD, alm.filter(([x, , z]) => !(Math.abs(x) < pw / 2 && z > 0)), { grosor: 0.003 }));
  /* el patio y la fuente */
  pon(g, caja(K, W - 2 * e, 0.01, W - 2 * e, '#eadbb6', { sinTinta: true, sombra: false }), 0, 0.055, 0);
  const fu = new THREE.Group(); fu.position.set(0, 0.05, W * 0.12); g.add(fu);
  pon(fu, K.malla(K.cilindro(W * 0.07, W * 0.075, 0.07, 8), AB.cal, { grosor: 0.003 }), 0, 0.035, 0);
  pon(fu, K.malla(K.cilindro(W * 0.058, W * 0.058, 0.01, 8), AB.agua, { sinTinta: true }), 0, 0.072, 0);
  pon(fu, K.malla(K.cilindro(0.012, 0.018, 0.1, 6), AB.turquesa, { grosor: 0.002 }), 0, 0.1, 0);
  /* la sala de oración: el techo plano sobre filas de columnas de madera (de teca, traída de la India) */
  const Dh = W * 0.4, zh = -W / 2 + e + Dh / 2, Hh = Hm * 1.12, cols = [];
  pon(g, caja(K, W - 2 * e + 0.02, 0.06, Dh, AB.anteD, { grosor: 0.004 }), 0, Hh + 0.03, zh);
  const fa = lamT(K, W - 2 * e, 0.06, texEstuco(), 'est-mz', (W - 2 * e) / 0.1, 1); fa.position.set(0, Hh + 0.03, zh + Dh / 2 + 0.002); g.add(fa);
  const nx = Math.round(W / 0.24), nz = 3;
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) cols.push([-W / 2 + e + 0.1 + i * (W - 2 * e - 0.2) / (nx - 1), Hh / 2, zh + Dh / 2 - 0.06 - k * (Dh - 0.12) / (nz - 1)]);
  /* las galerías de los otros tres lados */
  const Dg = W * 0.11;
  pon(g, caja(K, W - 2 * e, 0.04, Dg, AB.anteD, { grosor: 0.003 }), 0, Hm * 0.92, W / 2 - e - Dg / 2);
  [-1, 1].forEach(l => pon(g, caja(K, Dg, 0.04, W - 2 * e - Dh - Dg, AB.anteD, { grosor: 0.003 }), l * (W / 2 - e - Dg / 2), Hm * 0.92, (zh + Dh / 2 + W / 2 - e - Dg) / 2));
  for (let i = 0; i < nx; i++) { const x = -W / 2 + e + 0.1 + i * (W - 2 * e - 0.2) / (nx - 1); if (Math.abs(x) > pw / 2) cols.push([x, Hm * 0.45, W / 2 - e - Dg + 0.03, 0, 0.9]); }
  for (let i = 1; i < 4; i++) [-1, 1].forEach(l => cols.push([l * (W / 2 - e - Dg + 0.03), Hm * 0.45, zh + Dh / 2 + i * (W - 2 * e - Dh - Dg) / 4, 0, 0.9]));
  g.add(instancias(K, K.cilindro(0.018, 0.022, Hh, 6), AB.madera, cols, { grosor: 0.002 }));
  pon(g, caja(K, W * 0.12, 0.012, Dh * 0.5, '#8a3a2a', { sinTinta: true }), 0, 0.064, zh);                       // la alfombra del mihrab
  /* la portada del frente */
  const po = portada(K, pw + 0.12, Hm * 1.7, { prof: 0.1 }); po.position.z = W / 2 + 0.02; g.add(po);
  if (minarete) {                                                               // el alminar, en la esquina del frente
    const m = new THREE.Group(); m.position.set(-W / 2 + 0.05, 0, W / 2 - 0.05); g.add(m);
    const cuerpo = (w, h, y) => { pon(m, cajaT(K, w, h, w, tA, 'ab-ante-al'), 0, y + h / 2, 0); pon(m, caja(K, w + 0.06, 0.035, w + 0.06, AB.anteD, { grosor: 0.003 }), 0, y + h + 0.017, 0);
      for (let k = 0; k < 4; k++) { const v = hueco(K, w * 0.28, h * 0.22); v.position.set(Math.sin(k * Math.PI / 2) * (w / 2 + 0.003), y + h * 0.62, Math.cos(k * Math.PI / 2) * (w / 2 + 0.003)); v.rotation.y = k * Math.PI / 2; m.add(v); } };
    cuerpo(0.42, 1.25, 0); cuerpo(0.32, 0.62, 1.285); cuerpo(0.22, 0.36, 1.94);
    const al = []; almenasCaja(al, 0, 0, 0.46, 0.46, 1.285, 0.11); m.add(instancias(K, geoAlmena(0.07, 0.07, 0.03), AB.anteD, al, { grosor: 0.003 }));
    const cp = cupula(K, 0.12, AB.verde, { punta: 1.25 }); cp.position.y = 2.335; m.add(cp);
    pon(m, K.malla(K.esfera(0.02, 0.5), AB.oro, { sinTinta: true }), 0, 2.335 + 0.16, 0);
  }
  g.userData.ficha = { titulo: 'La gran mezquita de al-Mansur', texto: 'junto al palacio; en sus columnas se sentaban los maestros de la halqa' };
  return g;
}

/* ---------- EL HÉROE C: LA CASA DE LA SABIDURÍA, MONUMENTAL (por etapas) ---------- */
/* De la Casa no queda nada, ni se sabe dónde estaba: Gutas (1998) muestra que era la biblioteca y el archivo del palacio,
   donde se guardaban y copiaban los libros traducidos. LO QUE SE SUPONE: que tenía la forma de un palacio abasí, y se
   arma con lo que sí quedó: el recinto de nichos lobulados y torres del Qasr al-Ashiq (Samarra, ~878), la portada alta
   con su franja (la Mustansiriya), un patio con galerías y, al fondo, la sala de los libros con su iwan de estantes y la
   cúpula de la sala de lectura (la cúpula de gajos turquesa es también supuesta). Etapas (el saber 46): 'obra' los
   cimientos con andamios · 0 los muros, las torres y la portada · 1 las galerías del patio, las palmeras y el nombre en la
   portada · 2 la sala de los libros con su iwan de estantes · 3 la cúpula de la sala de lectura. Mira a +z. */
export const CASA_MON = { w: 4.2, d: 3.3 };
export function casaMonumental(K, niv = 3) {
  const g = new THREE.Group(), { w: W, d: D } = CASA_MON, obra = niv === 'obra', n = obra ? -1 : niv, Hm = 0.82, e = 0.16, tA = texAnte();
  pon(g, caja(K, W + 0.16, 0.08, D + 0.16, AB.anteD, { grosor: 0.005 }), 0, 0.04, 0);
  if (obra) {
    const m = (w, d, x, z) => pon(g, cajaT(K, w, 0.16, d, tA, 'ab-ante-ob'), x, 0.16, z);
    m(W, e, 0, -D / 2 + e / 2); m(W, e, 0, D / 2 - e / 2); m(e, D, -W / 2 + e / 2, 0); m(e, D, W / 2 - e / 2, 0);
    for (let i = 0; i < 6; i++) [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(0.016, 0.016, 1.0, 4), AB.madera, { grosor: 0.002 }), -W / 2 + 0.2 + i * (W - 0.4) / 5, 0.58, l * (D / 2 + 0.12)));
    [-1, 1].forEach(l => [0.45, 0.85].forEach(y => pon(g, caja(K, W, 0.02, 0.02, AB.maderaD, { sinTinta: true }), 0, y, l * (D / 2 + 0.12))));
    for (let k = 0; k < 5; k++) for (let q = 0; q < 2 + (k % 2); q++) pon(g, caja(K, 0.18, 0.06, 0.12, AB.ante, { grosor: 0.002 }), -1.2 + k * 0.55, 0.11 + q * 0.062, 0.6 + (k % 2) * 0.3, k * 0.4);   // las pilas de ladrillo
    const ra = new THREE.Shape(); ra.moveTo(0, 0); ra.lineTo(1.1, 0); ra.lineTo(1.1, 0.24); ra.closePath();                                                  // la rampa de tierra para subir los ladrillos
    const rg = new THREE.ExtrudeGeometry(ra, { depth: 0.36, bevelEnabled: false }); rg.translate(-1.1, 0, -0.18); const r = K.malla(propia(rg), '#c9a877', { grosor: 0.004 }); r.position.set(-W / 2 - 0.02, 0.08, 0.4); r.rotation.y = 0; g.add(r);
    g.userData.ficha = { titulo: 'La Casa de la Sabiduría', texto: 'se levanta' };
    return g;
  }
  /* los muros del recinto con los nichos lobulados por fuera, las torres de las esquinas y las de medio círculo */
  const muro = (w, d, x, z) => { const m = cajaT(K, w, Hm, d, tA, 'ab-ante-cm'); m.position.set(x, 0.08 + Hm / 2, z); g.add(m); };
  muro(W, e, 0, -D / 2 + e / 2); muro(e, D, -W / 2 + e / 2, 0); muro(e, D, W / 2 - e / 2, 0);
  muro((W - 1.2) / 2, e, -(W + 1.2) / 4, D / 2 - e / 2); muro((W - 1.2) / 2, e, (W + 1.2) / 4, D / 2 - e / 2);
  [[(W + 1.2) / 4, D / 2 + 0.003, 0, (W - 1.2) / 2 - 0.3], [-(W + 1.2) / 4, D / 2 + 0.003, 0, (W - 1.2) / 2 - 0.3], [W / 2 + 0.003, 0, Math.PI / 2, D - 0.5], [-W / 2 - 0.003, 0, -Math.PI / 2, D - 0.5], [0, -D / 2 - 0.003, Math.PI, W - 0.5]].forEach(([x, z, ry, w]) => {
    const nl = lamT(K, w, Hm * 0.8, texNichos(), 'nichos-cm' + Math.round(w * 10), Math.max(1, Math.round(w / 0.42)), 1); nl.position.set(x, 0.08 + Hm * 0.46, z); nl.rotation.y = ry; g.add(nl);
  });
  const tor = [], esq = [], alm = [];
  for (const [ax, az, bx, bz] of [[-W / 2, D / 2, W / 2, D / 2], [W / 2, -D / 2, W / 2, D / 2], [-W / 2, -D / 2, W / 2, -D / 2], [-W / 2, -D / 2, -W / 2, D / 2]]) {
    const L = Math.hypot(bx - ax, bz - az), k = Math.round(L / 1.05); for (let i = 1; i < k; i++) { const u = i / k, x = ax + (bx - ax) * u, z = az + (bz - az) * u; if (Math.abs(x) < 0.8 && z > 0) continue; tor.push([x, 0.08 + Hm / 2, z]); }
    almenasRecta(alm, ax, az, bx, bz, 0.08 + Hm, 0.12);
  }
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => esq.push([a * W / 2, 0.08 + (Hm + 0.22) / 2, b * D / 2]));
  g.add(instancias(K, K.cilindro(0.1, 0.11, Hm, 10), AB.anteL, tor, { grosor: 0.004 }));
  g.add(instancias(K, K.cilindro(0.24, 0.26, Hm + 0.22, 14), AB.ante, esq, { grosor: 0.005 }));
  g.add(instancias(K, K.cilindro(0.27, 0.27, 0.05, 14), AB.anteD, esq.map(([x, , z]) => [x, 0.08 + Hm + 0.245, z]), { grosor: 0.003 }));
  g.add(instancias(K, geoAlmena(0.08, 0.09, 0.04), AB.anteD, alm.filter(([x, , z]) => !(Math.abs(x) < 0.62 && z > 0)), { grosor: 0.003 }));
  /* la portada alta, con la franja del nombre desde la etapa 1 */
  const po = portada(K, 1.25, 1.85, { prof: 0.3, puerta: AB.maderaD, franjaTxt: n >= 1 ? 'بيت الحكمة' : null, clave: 'casamon' }); po.position.set(0, 0.08, D / 2 + 0.06); g.add(po);
  [-1, 1].forEach(l => { pon(g, K.malla(K.cilindro(0.11, 0.12, 1.62, 10), AB.anteL, { grosor: 0.004 }), l * 0.66, 0.89, D / 2 + 0.06); pon(g, K.malla(K.esfera(0.12, 0.6), AB.turquesa, { grosor: 0.003 }), l * 0.66, 1.74, D / 2 + 0.06).scale.y = 1.2; });
  /* el patio con su fuente octogonal */
  pon(g, caja(K, W - 2 * e, 0.012, D - 2 * e, '#ecdcb6', { sinTinta: true, sombra: false }), 0, 0.086, 0);
  const fu = new THREE.Group(); fu.position.set(0, 0.08, 0.55); g.add(fu);
  pon(fu, K.malla(K.cilindro(0.3, 0.32, 0.09, 8), AB.cal, { grosor: 0.004 }), 0, 0.045, 0);
  pon(fu, K.malla(K.cilindro(0.26, 0.26, 0.01, 8), AB.agua, { sinTinta: true }), 0, 0.092, 0);
  pon(fu, K.malla(K.cilindro(0.025, 0.04, 0.16, 8), AB.turquesa, { grosor: 0.002 }), 0, 0.15, 0);
  if (n >= 1) {                                                                 // las galerías de los copistas a los dos lados del patio, y dos palmeras
    [-1, 1].forEach(l => {
      const x = l * (W / 2 - e - 0.27);
      pon(g, cajaT(K, 0.54, 0.62, D - 2 * e - 0.15, tA, 'ab-ante-cm2'), x, 0.08 + 0.31, 0.05);
      const f = lamT(K, D - 2 * e - 0.15, 0.56, texArcada('liso'), 'arc-cm', (D - 2 * e - 0.15) / 0.3, 1); f.position.set(x - l * 0.272, 0.08 + 0.29, 0.05); f.rotation.y = -l * Math.PI / 2; g.add(f);
      pon(g, caja(K, 0.58, 0.03, D - 2 * e - 0.11, AB.anteD, { grosor: 0.003 }), x, 0.08 + 0.635, 0.05);
      const p = datilera(K, 1.45, 40 + l); p.position.set(l * 0.82, 0.08, 0.95); g.add(p);
    });
  }
  if (n >= 2) {                                                                 // la sala de los libros, al fondo, con su iwan de estantes
    const Hs = 1.52, zs = -D / 2 + e + 0.55;
    pon(g, cajaT(K, 2.9, Hs, 1.1, tA, 'ab-ante-cm3'), 0, 0.08 + Hs / 2, zs);
    const iw = portada(K, 1.05, 1.3, { prof: 0.12 }); iw.position.set(0, 0.08, zs + 0.55 + 0.06); g.add(iw);
    const es = lamT(K, 0.5, 0.62, texEstantes(), 'estantes-cm', 1, 1); es.position.set(0, 0.08 + 0.36, zs + 0.55 + 0.123); g.add(es);
    [-1, 1].forEach(l => [0.35, 0.95].forEach(y => { const v = hueco(K, 0.16, 0.3); v.position.set(l * 0.98, 0.08 + y, zs + 0.553); g.add(v); }));
    const al = []; almenasCaja(al, 0, zs, 2.9, 1.1, 0.08 + Hs, 0.12); g.add(instancias(K, geoAlmena(0.07, 0.08, 0.035), AB.anteD, al, { grosor: 0.003 }));
    if (n >= 3) {                                                               // la sala de lectura: el tambor alto con sus ventanas y la cúpula de gajos
      const y0 = 0.08 + Hs, rd = 0.5, ht = 0.66;
      pon(g, K.malla(K.cilindro(rd, rd + 0.02, ht, 16), AB.estuco, { grosor: 0.005 }), 0, y0 + ht / 2, zs);
      const banda = new THREE.Mesh(propia(new THREE.CylinderGeometry(rd + 0.006, rd + 0.006, 0.1, 32, 1, true)), matR(K, 'est-tambor2', texEstuco(), rd * 2 * Math.PI / 0.2, 1)); banda.position.set(0, y0 + ht - 0.08, zs); g.add(banda);
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8; const v = hueco(K, 0.11, 0.26); v.position.set(Math.cos(a) * (rd + 0.012), y0 + 0.12, zs + Math.sin(a) * (rd + 0.012)); v.rotation.y = Math.PI / 2 - a; g.add(v); }
      const cu = cupulaGajos(K, rd + 0.04, AB.turquesa, { gajos: 12, punta: 1.28 }); cu.position.set(0, y0 + ht, zs); g.add(cu);
      const cima = y0 + ht + (rd + 0.04) * 1.28;
      pon(g, K.malla(K.cilindro(0.01, 0.014, 0.1, 5), AB.oroD, { sinTinta: true }), 0, cima + 0.04, zs);
      pon(g, K.malla(K.esfera(0.035, 0.5), AB.oro, { grosor: 0.002 }), 0, cima + 0.1, zs);
      g.userData.alto = cima + 0.14;
    }
  }
  g.userData.ficha = { titulo: 'La Casa de la Sabiduría', texto: 'la biblioteca del califa: aquí se guardaban y copiaban los libros traducidos' };
  return g;
}

/* el héroe de la época, según la variante elegida (etapa: solo para la Casa, que crece con el saber 46) */
export function heroe(K, variante = VARIANTES.heroe, etapa = 3) {
  if (variante === 'palacio') return palacioCerca(K);
  if (variante === 'casa') return casaMonumental(K, etapa);
  return ciudadRedonda(K);
}

/* ---------- LA SEGUNDA PIEZA B: EL MOLINO DE PAPEL CON SU NORIA ---------- */
/* Bloom (Paper Before Print, 2001): hacia 794 Bagdad tiene su molino; los trapos de lino se baten con mazos que mueve el
   agua, la pasta se toma con un molde de cañas y las hojas se secan al sol. La noria (la na'ura de los canales del
   Éufrates, en Hit y en Anah, y de Hama): la corriente empuja sus paletas, sus cántaros suben el agua al acueducto de las
   tinas y su eje mueve los mazos de la casa. El canal corre a lo largo de x (en el frente); la rueda gira en el plano
   del canal (userData.rueda). */
export function molinoNoria(K, { canal = true } = {}) {   // canal: false en el juego, donde el agua la pone el valle
  const g = new THREE.Group(), tB = texBarro(), zc = 0.62, R = 1.0, yc = 1.02, xr = 0.78;
  /* el canal con sus bordes de ladrillo */
  const ag = new THREE.Mesh(propia(new THREE.PlaneGeometry(3.4, 0.5)), matR(K, 'ab-agua-c', texAgua(), 3.4 / 1.2, 0.5 / 1.2)); ag.rotation.x = -Math.PI / 2; ag.position.set(0.1, 0.012, zc); ag.receiveShadow = true; if (canal) g.add(ag);
  [-1, 1].forEach(l => pon(g, caja(K, 3.4, 0.06, 0.08, AB.anteD, { grosor: 0.004 }), 0.1, 0.03, zc + l * 0.29));
  /* la casa del molino: dos cuerpos de adobe, la azotea con pretil, la puerta, la boca de los mazos sobre el canal */
  const cx = -0.42, cz = -0.5;
  pon(g, cajaT(K, 1.35, 0.82, 0.86, tB, 'ab-barro-mo'), cx, 0.41, cz);
  pon(g, caja(K, 1.42, 0.05, 0.93, AB.barroD, { grosor: 0.004 }), cx, 0.845, cz);
  [[0, 0.46, 1.42, 0.03], [0, -0.46, 1.42, 0.03], [-0.7, 0, 0.03, 0.93], [0.7, 0, 0.03, 0.93]].forEach(([x, z, w, d]) => pon(g, caja(K, w, 0.07, d, AB.barro, { grosor: 0.003 }), cx + x, 0.905, cz + z));
  pon(g, cajaT(K, 0.5, 0.36, 0.46, tB, 'ab-barro-mo2'), cx - 0.36, 1.05, cz - 0.15);                           // el cuarto de la azotea
  const vz = hueco(K, 0.1, 0.16); vz.position.set(cx - 0.36, 0.95, cz + 0.085); g.add(vz);
  const pt = hueco(K, 0.2, 0.34); pt.position.set(cx - 0.32, 0, cz + 0.433); g.add(pt);
  const boca = hueco(K, 0.46, 0.42, '#2a1e14'); boca.position.set(cx + 0.3, 0.08, cz + 0.433); g.add(boca);
  for (let k = 0; k < 3; k++) { const m = new THREE.Group(); m.position.set(cx + 0.16 + k * 0.13, 0.24, cz + 0.5); g.add(m);   // los mazos que asoman
    pon(m, K.malla(K.caja(0.035, 0.035, 0.26), AB.madera, { grosor: 0.002 }), 0, 0.08, -0.05).rotation.x = -0.4 + k * 0.25;
    pon(m, K.malla(K.caja(0.07, 0.09, 0.07), AB.maderaD, { grosor: 0.002 }), 0, 0.0, 0.06); }
  pon(g, K.malla(K.cilindro(0.025, 0.025, 1.0, 6), AB.maderaD, { grosor: 0.002 }), (cx + 0.3 + xr) / 2, 0.3, cz + 0.55).rotation.z = Math.PI / 2;   // el árbol de levas
  /* la noria: dos aros con sus rayos, las paletas y los cántaros entre los aros, el cubo y el eje sobre dos pilares */
  const rueda = new THREE.Group(); rueda.position.set(xr, yc, zc); g.add(rueda);
  [-1, 1].forEach(l => {
    pon(rueda, K.malla(K.toro(R, 0.024, Math.PI * 2, 0.9), AB.madera, { grosor: 0.003 }), 0, 0, l * 0.075);
    for (let k = 0; k < 8; k++) { const r = K.malla(K.caja(0.026, R * 2, 0.026), AB.maderaD, { grosor: 0.002 }); r.rotation.z = k * Math.PI / 8; r.position.z = l * 0.075; rueda.add(r); }
  });
  for (let k = 0; k < 20; k++) {
    const a = k / 20 * Math.PI * 2, c = new THREE.Group(); c.position.set(Math.cos(a) * R, Math.sin(a) * R, 0); c.rotation.z = a; rueda.add(c);
    pon(c, K.malla(K.caja(0.02, 0.12, 0.17), AB.maderaL, { grosor: 0.002 }), 0.02, 0, 0);                         // la paleta
    if (k % 2 === 0) pon(c, K.malla(K.cilindro(0.04, 0.03, 0.1, 6), '#b8673e', { grosor: 0.002 }), -0.03, 0.05, 0).rotation.z = Math.PI / 2;   // el cántaro (qadus)
  }
  pon(rueda, K.malla(K.cilindro(0.08, 0.08, 0.22, 10), AB.maderaD, { grosor: 0.003 }), 0, 0, 0).rotation.x = Math.PI / 2;
  pon(g, K.malla(K.cilindro(0.03, 0.03, 0.8, 6), AB.maderaD, { grosor: 0.002 }), xr, yc, zc).rotation.x = Math.PI / 2;
  [-1, 1].forEach(l => pon(g, cajaT(K, 0.16, yc + 0.06, 0.16, texAnte(), 'ab-ante-pn'), xr, (yc + 0.06) / 2, zc + l * 0.36));
  /* el acueducto: la canaleta en lo alto, sobre arcos de ladrillo, lleva el agua de la noria a la tina */
  const ya = yc + R - 0.08, z0 = zc - 0.12, z1 = -1.05;
  pon(g, caja(K, 0.16, 0.08, z0 - z1, AB.anteD, { grosor: 0.004 }), xr - 0.02, ya, (z0 + z1) / 2);
  pon(g, caja(K, 0.1, 0.01, z0 - z1, AB.agua, { sinTinta: true }), xr - 0.02, ya + 0.042, (z0 + z1) / 2);
  for (let k = 0; k < 3; k++) { const z = z1 + 0.06 + k * (z0 - z1 - 0.2) / 2; pon(g, cajaT(K, 0.14, ya - 0.04, 0.12, texAnte(), 'ab-ante-ac'), xr - 0.02, (ya - 0.04) / 2, z); }
  pon(g, caja(K, 0.16, 0.16, z0 - z1 - 0.04, AB.ante, { grosor: 0.003 }), xr - 0.02, ya - 0.12, (z0 + z1) / 2);
  /* las tinas de la pasta, los moldes de caña y la pila de hojas; el tendedero con las hojas al sol */
  [[xr - 0.02, z1 - 0.08, 0.2], [xr + 0.36, z1 + 0.1, 0.17]].forEach(([x, z, r]) => { pon(g, K.malla(K.cilindro(r, r * 0.9, 0.2, 12), AB.madera, { grosor: 0.003 }), x, 0.1, z); pon(g, K.malla(K.cilindro(r * 0.9, r * 0.9, 0.01, 12), '#f1ecdf', { sinTinta: true }), x, 0.195, z); });
  [0, 1].forEach(k => { const m = caja(K, 0.22, 0.012, 0.16, AB.maderaL, { grosor: 0.002 }); m.position.set(xr + 0.42 + k * 0.03, 0.13, z1 - 0.22 + k * 0.05); m.rotation.set(0, 0.3, 1.2); g.add(m); });
  for (let q = 0; q < 6; q++) pon(g, caja(K, 0.18, 0.012, 0.13, AB.blanco, { grosor: 0.0015 }), -1.0, 0.012 + q * 0.013, 0.14, q * 0.07);
  const tx = -1.55, tz0 = -0.95, tz1 = 0.12;
  [tz0, (tz0 + tz1) / 2, tz1].forEach(z => pon(g, K.malla(K.cilindro(0.016, 0.016, 0.62, 5), AB.maderaD, { grosor: 0.002 }), tx, 0.31, z));
  [0.56, 0.4].forEach((y, f) => {
    pon(g, K.malla(K.cilindro(0.004, 0.004, tz1 - tz0, 3), '#6a5a48', { sinTinta: true }), tx, y, (tz0 + tz1) / 2).rotation.x = Math.PI / 2;
    for (let k = 0; k < 5; k++) { const h = new THREE.Mesh(propia(new THREE.PlaneGeometry(0.16, 0.13)), K.mat(k % 2 ? AB.blanco : '#efe6cf', { side: THREE.DoubleSide })); h.position.set(tx, y - 0.068, tz0 + 0.12 + k * 0.19 + f * 0.05); h.rotation.y = Math.PI / 2; h.castShadow = true; g.add(h); }
  });
  g.userData.rueda = rueda;
  g.userData.ficha = { titulo: 'El molino de papel', texto: 'la noria sube el agua a las tinas y mueve los mazos que baten los trapos' };
  return g;
}

/* ---------- LA SEGUNDA PIEZA C: EL PUENTE DE BARCAS ---------- */
/* El Tigris se cruzaba sobre barcas atadas con cadenas (al-Yaqubi cuenta tres puentes; Ibn Yubayr, en 1184, lo cruzó
   todavía). En su cabeza, el arco de ladrillo; aguas abajo, los molinos flotantes (dos cascos con la rueda entre medio),
   que molían con la corriente. El río corre a lo largo de x; el puente lo cruza a lo largo de z, desde la orilla del
   fondo (z < -1,2) hacia el frente. */
export function puenteJisr(K, { largo = 3.0 } = {}) {
  const g = new THREE.Group(), z0 = -1.22, n = Math.round(largo / 0.36), tA = texAnte();
  /* el arco de la cabeza del puente, sobre la orilla */
  const ar = new THREE.Group(); ar.position.set(0, 0, z0 - 0.32); g.add(ar);
  ar.add(macizoConPasaje(K, 1.3, 0.5, 1.75, 0.5, 1.12, tA, 'ab-ante-ar'));
  const es = lamT(K, 0.9, 0.08, texEstuco(), 'est-ar', 0.9 / 0.08 / 4, 1); es.position.set(0, 1.3, 0.254); ar.add(es);
  [-1, 1].forEach(l => { pon(ar, K.malla(K.cilindro(0.17, 0.19, 1.95, 12), AB.ante, { grosor: 0.005 }), l * 0.66, 0.975, 0.04); pon(ar, K.malla(K.cilindro(0.2, 0.2, 0.05, 12), AB.anteD, { grosor: 0.003 }), l * 0.66, 1.97, 0.04); });
  const al = []; almenasCaja(al, 0, 0, 1.3, 0.5, 1.75, 0.11); ar.add(instancias(K, geoAlmena(0.075, 0.09, 0.035), AB.anteD, al, { grosor: 0.003 }));
  pon(ar, caja(K, 0.36, 0.3, 0.3, AB.barro, { grosor: 0.004 }), 1.05, 0.15, 0.32);                              // la caseta del portazgo
  pon(ar, caja(K, 0.42, 0.03, 0.36, AB.barroD, { grosor: 0.003 }), 1.05, 0.31, 0.32);
  /* las barcas en fila, con el tablado encima y las barandas; las cadenas a los postes de la orilla */
  for (let i = 0; i < n; i++) {
    const z = z0 + 0.22 + i * 0.36, b = new THREE.Group(); b.position.set(0, -0.02, z); g.add(b);
    const h = K.malla(K.capsula(0.11, 0.62, 0.7), AB.maderaD, { grosor: 0.003 }); h.rotation.z = Math.PI / 2; h.scale.set(1, 1, 0.75); b.add(h);
    pon(b, caja(K, 0.7, 0.02, 0.16, AB.madera, { sinTinta: true }), 0, 0.08, 0);
    pon(b, K.malla(K.cilindro(0.003, 0.003, 0.5, 3), '#4a3a2a', { sinTinta: true }), -0.55, 0.02, 0).rotation.z = 1.35;   // la amarra aguas arriba
  }
  pon(g, caja(K, 0.52, 0.035, n * 0.36 + 0.2, AB.maderaL, { grosor: 0.004 }), 0, 0.105, z0 + n * 0.18 + 0.05);
  [-1, 1].forEach(l => { pon(g, caja(K, 0.025, 0.035, n * 0.36 + 0.2, AB.maderaD, { grosor: 0.002 }), l * 0.25, 0.2, z0 + n * 0.18 + 0.05);
    for (let i = 0; i <= n; i++) pon(g, K.malla(K.cilindro(0.008, 0.008, 0.09, 4), AB.maderaD, { sinTinta: true }), l * 0.25, 0.155, z0 + 0.05 + i * 0.36); });
  [-1, 1].forEach(l => { pon(g, K.malla(K.cilindro(0.05, 0.06, 0.34, 8), AB.maderaD, { grosor: 0.003 }), l * 0.36, 0.17, z0 - 0.05); pon(g, caja(K, 0.03, 0.03, 0.3, '#3a3430', { sinTinta: true }), l * 0.33, 0.12, z0 + 0.1).rotation.x = 0.4; });
  /* los molinos flotantes, aguas abajo */
  [[1.3, -0.35], [1.45, 0.55]].forEach(([x, z], k) => {
    const m = new THREE.Group(); m.position.set(x, -0.02, z); m.rotation.y = k * 0.08; g.add(m);
    [-1, 1].forEach(l => { const h = K.malla(K.capsula(0.1, 0.55, 0.7), AB.maderaD, { grosor: 0.003 }); h.rotation.z = Math.PI / 2; h.position.z = l * 0.17; m.add(h); });
    pon(m, caja(K, 0.62, 0.025, 0.46, AB.madera, { grosor: 0.003 }), 0, 0.1, 0);
    pon(m, caja(K, 0.34, 0.26, 0.3, AB.barroL, { grosor: 0.004 }), -0.1, 0.24, 0);
    const te = caja(K, 0.4, 0.03, 0.38, '#c9a95e', { grosor: 0.003 }); te.position.set(-0.1, 0.39, 0); te.rotation.x = 0.08; m.add(te);
    const r = new THREE.Group(); r.position.set(0.2, 0.08, 0); m.add(r);
    pon(r, K.malla(K.toro(0.2, 0.014, Math.PI * 2, 0.7), AB.madera, { grosor: 0.002 }), 0, 0, 0);
    for (let q = 0; q < 6; q++) { const p = caja(K, 0.02, 0.4, 0.1, AB.maderaL, { grosor: 0.002 }); p.rotation.z = q * Math.PI / 6; r.add(p); }
    pon(m, K.malla(K.cilindro(0.003, 0.003, 1.2, 3), '#4a3a2a', { sinTinta: true }), -0.6, 0.05, -0.4).rotation.set(0.9, 0, 1.2);
  });
  /* una quffa con su barquero, río abajo */
  const q = quffa(K); q.scale.setScalar(0.85); q.position.set(-1.25, -0.02, 0.75); g.add(q);
  g.userData.ficha = { titulo: 'El puente de barcas', texto: 'barcas atadas con cadenas y, en su cabeza, el arco; aguas abajo, los molinos flotantes' };
  return g;
}
export function segunda(K, variante = VARIANTES.segunda) {
  if (variante === 'mezquita') return mezquitaMansur(K);
  if (variante === 'puente') return puenteJisr(K);
  return molinoNoria(K);
}

/* ---------- LAS CASAS ---------- */
/* lo que hay afuera de las casas: el horno de pan (tannur), la tinaja del agua en su trípode (el zir), el poyo de la
   puerta, el burro, la cabra, la estera de los dátiles, el tendedero */
function tannur(K) { const g = new THREE.Group(); pon(g, K.malla(K.cilindro(0.06, 0.09, 0.13, 9), '#c79a68', { grosor: 0.003 }), 0, 0.065, 0); pon(g, K.malla(K.cilindro(0.03, 0.03, 0.005, 8), '#3a2a1c', { sinTinta: true }), 0, 0.133, 0); return g; }
function zir(K) {
  const g = new THREE.Group();
  [0, 2.1, 4.2].forEach(a => pon(g, K.malla(K.cilindro(0.006, 0.006, 0.14, 4), AB.maderaD, { sinTinta: true }), Math.cos(a) * 0.045, 0.07, Math.sin(a) * 0.045));
  pon(g, K.malla(K.esfera(0.06, 0.6), '#d9b88a', { grosor: 0.003 }), 0, 0.17, 0).scale.set(1, 1.25, 1);
  pon(g, K.malla(K.cilindro(0.025, 0.03, 0.03, 8), '#c9a676', { grosor: 0.002 }), 0, 0.25, 0);
  return g;
}
function burro(K, color = '#8f8072') {
  const g = new THREE.Group(), o = { grosor: 0.003 };
  pon(g, K.malla(K.capsula(0.05, 0.13, 0.6), color, o), 0, 0.17, 0).rotation.z = Math.PI / 2;
  [[0.07, 0.03], [0.07, -0.03], [-0.07, 0.03], [-0.07, -0.03]].forEach(([x, z]) => pon(g, K.malla(K.cilindro(0.012, 0.01, 0.13, 4), '#6f6255', o), x, 0.065, z));
  const c = K.malla(K.capsula(0.028, 0.07, 0.5), color, o); c.position.set(0.13, 0.23, 0); c.rotation.z = -0.8; g.add(c);
  pon(g, K.malla(K.caja(0.07, 0.04, 0.045), '#6f6255', o), 0.18, 0.25, 0).rotation.z = -0.4;
  [-1, 1].forEach(l => pon(g, K.malla(K.cono(0.01, 0.05, 4), '#6f6255', { sinTinta: true }), 0.15, 0.3, l * 0.015).rotation.z = 0.3);
  [-1, 1].forEach(l => pon(g, caja(K, 0.08, 0.07, 0.03, l > 0 ? AB.tela : '#c9a95e', o), -0.01, 0.17, l * 0.06));    // las alforjas
  return g;
}
function cabra(K) {
  const g = new THREE.Group(), o = { grosor: 0.002 }, c = '#4a3e36';
  pon(g, K.malla(K.capsula(0.035, 0.08, 0.5), c, o), 0, 0.11, 0).rotation.z = Math.PI / 2;
  [[0.04, 0.02], [0.04, -0.02], [-0.04, 0.02], [-0.04, -0.02]].forEach(([x, z]) => pon(g, K.malla(K.cilindro(0.008, 0.007, 0.08, 4), c, { sinTinta: true }), x, 0.04, z));
  pon(g, K.malla(K.caja(0.05, 0.035, 0.03), c, o), 0.09, 0.15, 0).rotation.z = -0.5;
  [-1, 1].forEach(l => pon(g, K.malla(K.cono(0.006, 0.04, 4), '#d8cbb0', { sinTinta: true }), 0.08, 0.18, l * 0.01).rotation.z = 0.6);
  return g;
}
function tendedero(K, largo = 0.5, colores = [AB.tela, AB.blanco, AB.telaB, '#d9a640']) {
  const g = new THREE.Group();
  [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(0.006, 0.006, 0.2, 4), AB.maderaD, { sinTinta: true }), l * largo / 2, 0.1, 0));
  pon(g, K.malla(K.cilindro(0.002, 0.002, largo, 3), '#5a4a3a', { sinTinta: true }), 0, 0.19, 0).rotation.z = Math.PI / 2;
  colores.forEach((c, i) => { const p = new THREE.Mesh(propia(new THREE.PlaneGeometry(0.08, 0.09)), K.mat(c, { side: THREE.DoubleSide })); p.position.set(-largo / 2 + (i + 0.6) * largo / (colores.length + 0.2), 0.145, 0); p.castShadow = true; g.add(p); });
  return g;
}
/* la cama de la azotea, donde se duerme en verano, con su biombo de caña */
function camaAzotea(K) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.24, 0.025, 0.13, AB.madera, { grosor: 0.002 }), 0, 0.06, 0);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => pon(g, K.malla(K.cilindro(0.006, 0.006, 0.05, 4), AB.maderaD, { sinTinta: true }), a * 0.11, 0.025, b * 0.055));
  pon(g, caja(K, 0.22, 0.02, 0.11, AB.blanco, { grosor: 0.0015 }), 0, 0.083, 0);
  pon(g, caja(K, 0.05, 0.025, 0.09, '#c9d6dc', { grosor: 0.0015 }), -0.08, 0.1, 0);
  pon(g, caja(K, 0.02, 0.14, 0.2, '#d9c27a', { grosor: 0.002 }), 0.15, 0.07, 0);
  return g;
}
/* el badgir: la torre que caza el viento del noroeste y lo baja a la casa */
function badgir(K, color, alto = 0.32) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.13, alto, 0.13, color, { grosor: 0.003 }), 0, alto / 2, 0);
  [[0, 0.066, 0], [0.066, 0, Math.PI / 2]].forEach(([x, z, ry]) => [-0.03, 0.03].forEach(o => { const r = caja(K, 0.022, alto * 0.38, 0.006, '#3a2a1c', { sinTinta: true }); r.position.set(x + (ry ? 0 : o), alto * 0.7, z + (ry ? o : 0)); r.rotation.y = ry; g.add(r); }));
  pon(g, caja(K, 0.16, 0.025, 0.16, AB.anteD, { grosor: 0.002 }), 0, alto + 0.012, 0);
  return g;
}
/* el pretil alto de las azoteas (la gente duerme arriba, y el pretil la tapa de los vecinos) */
function pretil(K, g, w, d, y, color, alto = 0.07) {
  [[0, d / 2 - 0.0125, w, 0.025], [0, -d / 2 + 0.0125, w, 0.025], [-w / 2 + 0.0125, 0, 0.025, d], [w / 2 - 0.0125, 0, 0.025, d]].forEach(([x, z, ww, dd]) => pon(g, caja(K, ww, alto, dd, color, { grosor: 0.003 }), x, y + alto / 2, z));
}
/* la puerta de madera con su arco claro y el poyo al lado */
function puertaCasa(K, g, x, z, alto = 0.27) {
  const fr = hueco(K, 0.19, alto + 0.04, AB.anteL); fr.position.set(x, 0, z + 0.002); g.add(fr);
  const p = hueco(K, 0.14, alto, AB.maderaD); p.position.set(x, 0, z + 0.004); g.add(p);
  pon(g, caja(K, 0.18, 0.025, 0.06, AB.anteD, { grosor: 0.002 }), x, 0.012, z + 0.03);
}

/* A) LA CASA DE PATIO de ladrillo y adobe: las crujías alrededor del patio (abierto al cielo, con su palmera), el zócalo de
   ladrillo cocido, la puerta en arco, el pretil alto de la azotea; con dos pisos, la celosía de madera (mashrabiya) sobre
   la calle; el badgir; la cama de verano en la azotea. Mira a +z. */
export function casaPatio(K, { w = 1.0, d = 0.9, h = 0.62, tono = AB.barro, celosia = false, conBadgir = false, palma = true, cama = false, ropa = false, semilla = 1 } = {}) {
  const g = new THREE.Group(), e = Math.min(w, d) * 0.32, pd = d - 2 * e, oscuro = new THREE.Color(tono).multiplyScalar(0.86).getStyle();
  const ala = (ww, dd, x, z) => pon(g, caja(K, ww, h, dd, tono, { grosor: 0.005 }), x, h / 2, z);
  ala(w, e, 0, d / 2 - e / 2); ala(w, e, 0, -d / 2 + e / 2); ala(e, pd, -w / 2 + e / 2, 0); ala(e, pd, w / 2 - e / 2, 0);
  pon(g, caja(K, w + 0.012, 0.07, d + 0.012, AB.anteD, { grosor: 0.003 }), 0, 0.035, 0);                       // el zócalo de ladrillo cocido
  pon(g, caja(K, w - 2 * e, 0.01, pd, '#e9dab6', { sinTinta: true }), 0, 0.006, 0);                            // el patio
  pretil(K, g, w, d, h, oscuro);
  puertaCasa(K, g, -w * 0.22, d / 2);
  [[w * 0.2, h * 0.72], [w * 0.36, h * 0.72]].forEach(([x, y]) => pon(g, caja(K, 0.05, 0.06, 0.012, '#3a2a1c', { sinTinta: true }), x, y, d / 2 + 0.004));
  pon(g, caja(K, 0.012, 0.06, 0.05, '#3a2a1c', { sinTinta: true }), w / 2 + 0.004, h * 0.72, d * 0.18);
  if (celosia) {                                                                // el balcón de celosía del piso alto
    const c = new THREE.Group(); c.position.set(w * 0.16, h * 0.52, d / 2 + 0.055); g.add(c);
    pon(c, caja(K, 0.36, 0.25, 0.1, AB.madera, { grosor: 0.003 }), 0, 0.125, 0);
    const fr = lamT(K, 0.32, 0.2, texCelosia(), 'cel', 4, 2.5); fr.position.set(0, 0.125, 0.052); c.add(fr);
    const ld = lamT(K, 0.08, 0.2, texCelosia(), 'cel-l', 1, 2.5); ld.position.set(0.182, 0.125, 0); ld.rotation.y = Math.PI / 2; c.add(ld);
    pon(c, caja(K, 0.4, 0.025, 0.13, AB.maderaD, { grosor: 0.002 }), 0, 0.26, 0.005);
    [-0.13, 0.13].forEach(x => pon(c, caja(K, 0.03, 0.07, 0.08, AB.maderaD, { grosor: 0.002 }), x, -0.03, -0.01).rotation.x = 0.5);
  }
  if (conBadgir) { const b = badgir(K, tono); b.position.set(-w / 2 + e / 2, h, -d / 2 + e / 2); g.add(b); }
  if (palma) { const p = datilera(K, h + 0.75 + h3(semilla, 1) * 0.3, semilla); p.position.set((h3(semilla, 2) - 0.5) * (w - 2 * e) * 0.5, 0, (h3(semilla, 3) - 0.5) * pd * 0.4); g.add(p); }
  if (cama) { const c = camaAzotea(K); c.position.set(w * 0.18, h, -d / 2 + e / 2); g.add(c); }
  if (ropa) { const t = tendedero(K, w * 0.5); t.position.set(-w * 0.05, h, d / 2 - e / 2); g.add(t); }
  return g;
}

/* B) EL ARRABAL DE BARRO Y PALMA: la casa de barro de muros en talud con las vigas de palmera asomando, la choza de cañas
   en bóveda (la sarifa, la casa de caña de los pantanos del sur, la misma de Sumer), la sombra de pencas (el arish) y el
   palomar de barro (Bagdad tenía correo de palomas). Mira a +z. */
export function casaBarro(K, { w = 0.8, d = 0.7, h = 0.48, tono = AB.barro, arish = false, semilla = 1 } = {}) {
  const g = new THREE.Group();
  g.add(K.malla(propia(tronco(w, d, w - 0.07, d - 0.07, h)), tono, { grosor: 0.005 }));
  pon(g, K.malla(propia(tronco(w - 0.06, d - 0.06, w - 0.1, d - 0.1, 0.05)), new THREE.Color(tono).multiplyScalar(0.9).getStyle(), { grosor: 0.003 }), 0, h, 0);   // el pretil redondeado
  for (let i = 0; i < 5; i++) pon(g, K.malla(K.cilindro(0.016, 0.018, 0.1, 5), AB.palmaD, { grosor: 0.002 }), -w * 0.36 + i * w * 0.18, h - 0.05, d / 2 - 0.01).rotation.x = Math.PI / 2;   // las vigas de palmera
  const pt = hueco(K, 0.15, 0.25, '#3a2a1c'); pt.position.set(w * 0.12, 0, d / 2 - 0.03); g.add(pt);
  const cort = hueco(K, 0.11, 0.2, h3(semilla, 1) > 0.5 ? AB.tela : AB.telaB); cort.position.set(w * 0.12, 0.02, d / 2 - 0.028); g.add(cort);
  pon(g, caja(K, 0.05, 0.05, 0.01, '#3a2a1c', { sinTinta: true }), -w * 0.25, h * 0.65, d / 2 - 0.033);
  if (arish) {                                                                  // la sombra de pencas de palmera, delante de la puerta
    const a = new THREE.Group(); a.position.set(0, 0, d / 2 + 0.22); g.add(a);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => pon(a, K.malla(K.cilindro(0.012, 0.014, 0.4, 4), AB.palmaD, { sinTinta: true }), x * w * 0.4, 0.2, z * 0.17));
    pon(a, caja(K, w * 0.9, 0.025, 0.42, '#b9a35e', { grosor: 0.003 }), 0, 0.41, 0);
    for (let k = 0; k < 5; k++) pon(a, caja(K, 0.07, 0.012, 0.48, k % 2 ? AB.hojaD : '#8a9450', { grosor: 0.002 }), -w * 0.36 + k * w * 0.18, 0.43, 0).rotation.y = 0.12 * (k - 2);
  }
  return g;
}
export function sarifa(K, { largo = 0.9, r = 0.3 } = {}) {
  const g = new THREE.Group();
  const geo = new THREE.CylinderGeometry(r, r, largo, 12, 1, true, -Math.PI / 2, Math.PI); geo.rotateX(-Math.PI / 2);   // la bóveda de caña, a lo largo de z
  const v = K.malla(propia(geo), '#d6bf7c', { grosor: 0.004, side: THREE.DoubleSide }); g.add(v);
  for (let k = 0; k < 5; k++) { const t = K.malla(K.toro(r + 0.012, 0.016, Math.PI, 0.6), '#b59a55', { grosor: 0.002 }); t.position.z = -largo / 2 + 0.05 + k * (largo - 0.1) / 4; g.add(t); }
  const fr = new THREE.Shape(); fr.absarc(0, 0, r, 0, Math.PI, false); fr.closePath();
  const fg = new THREE.ShapeGeometry(fr, 10); const f = K.malla(propia(fg), '#cdb36e', { grosor: 0.003, side: THREE.DoubleSide }); f.position.z = largo / 2; g.add(f);
  const b = K.malla(propia(new THREE.ShapeGeometry(fr, 10)), '#c2a865', { grosor: 0.003, side: THREE.DoubleSide }); b.position.z = -largo / 2; g.add(b);
  const pt = hueco(K, 0.16, 0.24, '#3a2a1c'); pt.position.z = largo / 2 + 0.003; g.add(pt);
  [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(0.03, 0.035, 0.42, 6), '#b59a55', { grosor: 0.002 }), l * (r + 0.01), 0.21, largo / 2 + 0.01));   // los haces de caña de la entrada
  return g;
}
export function palomar(K, { alto = 0.78 } = {}) {
  const g = new THREE.Group();
  g.add(K.malla(K.cilindro(0.15, 0.2, alto, 12), AB.barroL, { grosor: 0.004 }));
  g.children[0].position.y = alto / 2;
  for (let f = 0; f < 3; f++) for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + f * 0.5; const h = caja(K, 0.03, 0.035, 0.01, '#3a2a1c', { sinTinta: true }); h.position.set(Math.cos(a) * (0.19 - f * 0.012), alto * (0.35 + f * 0.2), Math.sin(a) * (0.19 - f * 0.012)); h.rotation.y = Math.PI / 2 - a; g.add(h); }   // las bocas de las palomas
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; pon(g, caja(K, 0.05, 0.06, 0.03, AB.barroD, { grosor: 0.002 }), Math.cos(a) * 0.14, alto + 0.03, Math.sin(a) * 0.14, Math.PI / 2 - a); }
  [[0.05, 0.02], [-0.04, -0.06]].forEach(([x, z]) => { pon(g, K.malla(K.esfera(0.025, 0.4), '#e8e4dc', { grosor: 0.002 }), x, alto + 0.03, z).scale.set(1.4, 0.9, 0.9); });
  return g;
}
function esteraDatiles(K) {
  const t = textura('ab-datiles', 64, 48, (g, w, h) => { g.fillStyle = '#c9a95e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { g.fillStyle = i % 3 ? '#9a4f22' : '#c0702c'; g.beginPath(); g.ellipse((i * 37) % w, (i * 23) % h, 2.6, 1.8, i, 0, 7); g.fill(); } });
  const m = new THREE.Mesh(propia(new THREE.PlaneGeometry(0.34, 0.24)), matTex(K, 'ab-datiles', t)); m.rotation.x = -Math.PI / 2; m.position.y = 0.006; m.receiveShadow = true; return m;
}

/* C) LAS CASAS DE DOS PISOS DE LA ORILLA: abajo el ladrillo con la arcada que da al río, arriba la cal con el balcón largo
   de celosía (los rawashin, que siglos después Bagdad llamó shanashil), el pretil calado, la escalera del agua con su
   barca amarrada; el pabellón de cúpula del jardín (los jardines de los Barmakíes bajaban así hasta el Tigris). Mira a +z. */
export function casaOrilla(K, { w = 1.0, d = 0.8, h1 = 0.46, h2 = 0.42, tono = AB.cal, balcon = true, conBadgir = false, escalera = false } = {}) {
  const g = new THREE.Group(), oscuro = new THREE.Color(tono).multiplyScalar(0.86).getStyle();
  pon(g, cajaT(K, w, h1, d, texAnte(), 'ab-ante-or'), 0, h1 / 2, 0);
  for (let k = 0; k < 3; k++) { const a = hueco(K, w * 0.18, h1 * 0.72, AB.hueco); a.position.set((k - 1) * w * 0.28, 0, d / 2 + 0.003); g.add(a); }
  pon(g, caja(K, w + 0.03, 0.035, d + 0.03, AB.anteD, { grosor: 0.003 }), 0, h1 + 0.017, 0);
  pon(g, caja(K, w, h2, d, tono, { grosor: 0.005 }), 0, h1 + 0.035 + h2 / 2, 0);
  const ytop = h1 + 0.035 + h2;
  pretil(K, g, w, d, ytop, oscuro, 0.08);
  { const v = hueco(K, 0.07, 0.13); v.position.set(w / 2 + 0.003, h1 + 0.12, 0); v.rotation.y = Math.PI / 2; g.add(v); }
  if (balcon) {                                                                // el balcón largo de celosía sobre el agua
    const c = new THREE.Group(); c.position.set(0, h1 + 0.06, d / 2 + 0.06); g.add(c);
    pon(c, caja(K, w * 0.82, h2 * 0.78, 0.12, AB.madera, { grosor: 0.003 }), 0, h2 * 0.39, 0);
    const fr = lamT(K, w * 0.78, h2 * 0.66, texCelosia(), 'cel-or', Math.round(w * 0.78 / 0.08), Math.round(h2 * 0.66 / 0.08)); fr.position.set(0, h2 * 0.4, 0.062); c.add(fr);
    [-1, 1].forEach(l => { const ld = lamT(K, 0.1, h2 * 0.66, texCelosia(), 'cel-or-l', 1, Math.round(h2 * 0.66 / 0.08)); ld.position.set(l * (w * 0.41 + 0.002), h2 * 0.4, 0); ld.rotation.y = l * Math.PI / 2; c.add(ld); });
    pon(c, caja(K, w * 0.86, 0.025, 0.16, AB.maderaD, { grosor: 0.002 }), 0, h2 * 0.8, 0.01);
    for (let k = 0; k < 4; k++) pon(c, caja(K, 0.025, 0.08, 0.1, AB.maderaD, { grosor: 0.002 }), -w * 0.33 + k * w * 0.22, -0.04, -0.01).rotation.x = 0.55;
  } else for (let k = 0; k < 3; k++) { const v = hueco(K, 0.09, 0.17); v.position.set((k - 1) * w * 0.28, h1 + 0.12, d / 2 + 0.003); g.add(v); }
  if (conBadgir) { const b = badgir(K, tono, 0.34); b.position.set(-w / 2 + 0.1, ytop, -d / 2 + 0.1); g.add(b); }
  if (escalera) {                                                               // la escalera del agua y la barca amarrada
    for (let k = 0; k < 3; k++) pon(g, caja(K, 0.34, 0.05, 0.08, AB.anteD, { grosor: 0.003 }), -w * 0.2, 0.025 - k * 0.025, d / 2 + 0.05 + k * 0.08);
    const b = new THREE.Group(); b.position.set(-w * 0.2 + 0.42, -0.02, d / 2 + 0.3); g.add(b);
    const hz = K.malla(K.capsula(0.06, 0.4, 0.6), AB.maderaD, { grosor: 0.003 }); hz.rotation.z = Math.PI / 2; hz.scale.set(1, 1, 0.8); b.add(hz);
    pon(b, caja(K, 0.4, 0.015, 0.08, AB.madera, { sinTinta: true }), 0, 0.05, 0);
  }
  return g;
}
export function pabellon(K, { s = 1 } = {}) {
  const g = new THREE.Group(), w = 0.5 * s, h = 0.38 * s;
  pon(g, caja(K, w + 0.08, 0.06, w + 0.08, AB.anteD, { grosor: 0.003 }), 0, 0.03, 0);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => pon(g, caja(K, 0.07 * s, h, 0.07 * s, AB.cal, { grosor: 0.003 }), a * (w / 2 - 0.035 * s), 0.06 + h / 2, b * (w / 2 - 0.035 * s)));
  for (let k = 0; k < 4; k++) {                                                 // los dinteles, con un arco apuntado calado en cada cara
    const m = K.malla(K.caja(w, h * 0.28, 0.04 * s), AB.cal, { grosor: 0.003 }); m.position.set(Math.sin(k * Math.PI / 2) * (w / 2 - 0.02 * s), 0.06 + h * 0.86, Math.cos(k * Math.PI / 2) * (w / 2 - 0.02 * s)); m.rotation.y = k * Math.PI / 2; g.add(m);
    const a = hueco(K, w * 0.62, h * 0.82, AB.estucoD); a.position.set(Math.sin(k * Math.PI / 2) * (w / 2 + 0.002), 0.06, Math.cos(k * Math.PI / 2) * (w / 2 + 0.002)); a.rotation.y = k * Math.PI / 2; a.visible = false; g.add(a);
  }
  pon(g, caja(K, w + 0.04, 0.04, w + 0.04, AB.anteD, { grosor: 0.003 }), 0, 0.06 + h + 0.02, 0);
  const cu = cupula(K, w * 0.42, AB.turquesa, { punta: 1.2 }); cu.position.y = 0.06 + h + 0.04; g.add(cu);
  pon(g, K.malla(K.esfera(0.02 * s, 0.5), AB.oro, { sinTinta: true }), 0, 0.06 + h + 0.04 + w * 0.42 * 1.2 + 0.01, 0);
  pon(g, caja(K, w * 0.5, 0.012, w * 0.4, '#8a3a2a', { sinTinta: true }), 0, 0.065, 0);
  return g;
}

/* EL BARRIO: cada idioma como un grupito de casas distintas entre sí, con lo de afuera; ~3,4 × 2,6 */
export function barrio(K, variante = VARIANTES.casas) {
  const g = new THREE.Group(), en = (o, x, z, ry = 0) => { o.position.set(x, o.position.y, z); o.rotation.y = ry; g.add(o); return o; };
  if (variante === 'arrabal') {
    en(casaBarro(K, { w: 0.9, d: 0.72, h: 0.5, arish: true, semilla: 1 }), -0.95, -0.55);
    en(casaBarro(K, { w: 0.66, d: 0.6, h: 0.42, tono: AB.barroL, semilla: 2 }), 0.15, -0.85, -0.12);
    en(sarifa(K, { largo: 0.85, r: 0.3 }), 1.15, -0.35, -0.2);
    en(palomar(K), -0.15, 0.25);
    en(casaBarro(K, { w: 0.62, d: 0.54, h: 0.4, tono: '#ccb083', semilla: 3 }), 0.85, 0.55, 0.15);
    en(esteraDatiles(K), -0.85, 0.45); en(esteraDatiles(K), -0.45, 0.62, 0.3);
    en(cabra(K), 0.35, 0.45, 2.2); en(cabra(K), 0.5, 0.25, 0.6);
    en(tannur(K), -1.35, 0.05); en(zir(K), 0.55, -0.4);
    const p = palmar(K, 3, 0.35, 7, { frutales: false }); en(p, 1.55, 0.55);
  } else if (variante === 'orilla') {
    en(casaOrilla(K, { w: 1.05, d: 0.78, balcon: true, conBadgir: true, escalera: true }), -1.0, -0.25);
    en(casaOrilla(K, { w: 0.82, d: 0.72, h1: 0.42, h2: 0.38, tono: '#f0e2c4', balcon: false }), 0.08, -0.35);
    en(casaOrilla(K, { w: 0.9, d: 0.74, h1: 0.5, h2: 0.46, tono: AB.estuco, balcon: true, escalera: false }), 1.05, -0.3);
    const j = new THREE.Group(); en(j, 0.08, 0.55);                              // el muro del jardín con su naranjo y su palmera
    pon(j, caja(K, 0.9, 0.16, 0.05, AB.anteL, { grosor: 0.003 }), 0, 0.08, 0.25);
    const pa = palmar(K, 2, 0.2, 11, { frutales: true }); pa.position.set(0.1, 0, 0); j.add(pa);
    en(pabellon(K), 1.35, 0.6, 0.3);
  } else {
    en(casaPatio(K, { w: 0.92, d: 0.86, h: 0.6, tono: AB.cal, cama: true, palma: false, semilla: 5 }), -0.75, -0.75);
    en(casaPatio(K, { w: 0.8, d: 0.74, h: 0.52, tono: AB.barro, palma: true, ropa: true, semilla: 8 }), 0.4, -0.8, -0.1);
    en(casaPatio(K, { w: 1.15, d: 1.0, h: 0.92, tono: AB.ante, celosia: true, conBadgir: true, palma: true, semilla: 3 }), -1.0, 0.45);
    en(casaPatio(K, { w: 0.86, d: 0.8, h: 0.72, tono: '#e2cca2', conBadgir: true, palma: false, cama: true, semilla: 9 }), 0.55, 0.45, 0.06);
    en(casaPatio(K, { w: 0.72, d: 0.68, h: 0.5, tono: AB.barroL, palma: false, ropa: true, semilla: 12 }), 1.45, -0.25, 0.18);
    en(tannur(K), -0.15, 0.0); en(zir(K), 0.05, 0.25); en(burro(K), -0.2, 1.15, 0.4); en(zir(K), 1.4, 0.5); en(tendedero(K, 0.5), -0.1, -0.2, 0.3);
  }
  return g;
}
