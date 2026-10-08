/* ============================================================
   sumer/monumentos
   Las piezas grandes de Sumer en 3D: el zigurat del Eanna, la casa de las tablillas (la edubba) y los
   guardianes de la puerta. Cada una en variantes para la hoja de bocetos (juego3d/bocetos/sumer.html):
   la regla del proyecto pide que una pieza de arte grande pase por bocetos y por la elección del usuario
   antes de entrar al juego. La variante elegida se fija en VARIANTES (abajo) y es la que usa la época.
   Escala: 1 = una baldosa; una persona adulta mide ~0,9. El frente de cada pieza mira a +z (la cámara
   mira desde +x +z, así que el frente y el costado +x son los que se ven).
   Referencias: el zigurat de Ur-Nammu en Ur (~2100 a. C., la triple escalinata y los contrafuertes),
   el Templo Blanco de Uruk (~3500 a. C.), el templo de Eridu (el más antiguo, de adobe y caña), las casas
   de patio de Ur y Nippur donde funcionaban las edubbas (bancos de adobe, el cajón de arcilla para
   reamasar tablillas: Woolley, «Ur Excavations VII», 1976; Stone, «Nippur Neighborhoods», 1987), el mudhif
   de cañas de las marismas, los leones de terracota de Tell Harmal (~1800 a. C.) y los haces de caña con
   aro, emblema de Inanna en las puertas de Uruk.
   ============================================================ */
import * as THREE from 'three';
import { fundir } from '../kit.js';

export const SU = {
  adobe: '#cfa978', adobeL: '#dfc193', adobeD: '#ad8a5c', adobeS: '#9a7a50',
  ladrillo: '#b97a4f', ladrilloD: '#98613f', betun: '#4a3b30',
  cal: '#efe8d8', calD: '#d8cdb8', lapis: '#2f5f99', lapisL: '#4f86c0', oro: '#e0b44a',
  cana: '#cdb57c', canaD: '#a88f55', canaL: '#e3cf98', atadura: '#7c5f36', estera: '#b0925a', esteraD: '#86693d', arco: '#9a7c45',
  palma: '#8a6a45', palmaD: '#6e5236', hoja: '#5e8c3a', hojaL: '#80ad55', hojaD: '#46702c',
  arcilla: '#b98f62', arcillaD: '#8f6c46', terracota: '#c47c4c', terracotaD: '#9c5a34',
  tela: '#e9dfc9', rojo: '#a8432f', madera: '#8b6843', maderaD: '#6b4e31',
};

/* la variante de cada pieza que usa el juego (la elige el usuario en la hoja de bocetos) */
export const VARIANTES = { zigurat: 'ur', edubba: 'mixto', guardian: 'leones' };   // elegidas por el usuario el 2026-09-29

/* ---------- utilidades de forma ---------- */
/* Un tronco de pirámide rectangular: base w0×d0, cima w1×d1, alto h. Caras planas (no indexado), con uv por cara (0 abajo, 1 arriba) para las texturas. */
export function tronco(w0, d0, w1, d1, h) {
  const a = [[-w0 / 2, 0, -d0 / 2], [w0 / 2, 0, -d0 / 2], [w0 / 2, 0, d0 / 2], [-w0 / 2, 0, d0 / 2]];
  const b = [[-w1 / 2, h, -d1 / 2], [w1 / 2, h, -d1 / 2], [w1 / 2, h, d1 / 2], [-w1 / 2, h, d1 / 2]];
  const p = [], uv = [], quad = (q0, q1, q2, q3) => { p.push(...q0, ...q1, ...q2, ...q0, ...q2, ...q3); uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1); };
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; quad(a[i], a[j], b[j], b[i]); }
  quad(b[3], b[2], b[1], b[0]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  // las caras laterales se orientan hacia afuera
  const pos = g.getAttribute('position');
  for (let t = 0; t < pos.count; t += 3) {
    const v0 = new THREE.Vector3().fromBufferAttribute(pos, t), v1 = new THREE.Vector3().fromBufferAttribute(pos, t + 1), v2 = new THREE.Vector3().fromBufferAttribute(pos, t + 2);
    const n = v1.clone().sub(v0).cross(v2.clone().sub(v0)), c = v0.clone().add(v1).add(v2).multiplyScalar(1 / 3); c.y -= h / 2;
    if (n.dot(c) < 0) { pos.setXYZ(t + 1, v2.x, v2.y, v2.z); pos.setXYZ(t + 2, v1.x, v1.y, v1.z); const u = g.getAttribute('uv'), a = [u.getX(t + 1), u.getY(t + 1)]; u.setXY(t + 1, u.getX(t + 2), u.getY(t + 2)); u.setXY(t + 2, a[0], a[1]); }
  }
  g.computeVertexNormals();
  return g;
}
const pon = (padre, m, x, y, z, ry = 0) => { m.position.set(x, y, z); if (ry) m.rotation.y = ry; padre.add(m); return m; };
const caja = (K, w, h, d, color, o) => K.malla(K.caja(w, h, d), color, o);

/* Una escalera maciza: sube `alto` en `largo`, con `n` peldaños, hacia −z local; el origen es el pie, al centro. */
export function escalera(K, { largo, alto, ancho, n = 10, color = SU.ladrillo, baranda = SU.adobeD }) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const h = alto * (i + 1) / n, d = largo / n;
    pon(g, caja(K, ancho, h, d, color, { grosor: 0.008 }), 0, h / 2, -(i + 0.5) * d);
  }
  if (baranda) {
    const L = Math.hypot(largo, alto), ang = Math.atan2(alto, largo);
    [-1, 1].forEach(l => {
      const b = caja(K, 0.07, 0.13, L, baranda, { grosor: 0.01 });
      b.position.set(l * (ancho / 2 + 0.035), alto / 2 + 0.05, -largo / 2); b.rotation.x = ang; g.add(b);
    });
  }
  return g;
}
/* Contrafuertes: pilastras salientes en las cuatro caras de un cuerpo w×d×h que empieza en y0. */
function contrafuertes(K, g, w, d, h, y0, paso, color, sale = 0.05) {
  const nx = Math.max(2, Math.round(w / paso)), nz = Math.max(2, Math.round(d / paso));
  for (let i = 0; i <= nx; i++) { const x = -w / 2 + (w * i) / nx; [-1, 1].forEach(l => pon(g, caja(K, 0.11, h, sale * 2, color, { grosor: 0.006 }), x, y0 + h / 2, l * (d / 2))); }
  for (let i = 1; i < nz; i++) { const z = -d / 2 + (d * i) / nz; [-1, 1].forEach(l => pon(g, caja(K, sale * 2, h, 0.11, color, { grosor: 0.006 }), l * (w / 2), y0 + h / 2, z)); }
}
/* Las capas de esteras y betún que Woolley vio en los muros del zigurat de Ur: bandas oscuras finas. */
function capasDeBetun(K, g, w, d, y, color = SU.betun) { pon(g, caja(K, w + 0.03, 0.022, d + 0.03, color, { sinTinta: true }), 0, y, 0); }
/* La llama del santuario: la luz sagrada del Eanna (se anima: userData.llama). */
function brasero(K, g, x, y, z) {
  const b = new THREE.Group(); b.position.set(x, y, z); g.add(b);
  pon(b, K.malla(K.cilindro(0.09, 0.06, 0.08, 10), SU.ladrilloD, { grosor: 0.008 }), 0, 0.04, 0);
  const llama = new THREE.Group(); llama.position.y = 0.08; llama.userData.vivo = true; b.add(llama);
  [[0.06, 0.2, '#f6a23c', 0], [0.04, 0.14, '#f8dc8c', 0.01]].forEach(([r, h, c, dx]) => {
    const m = K.malla(K.cono(r, h, 7), c, { emissive: c, emissiveIntensity: 0.9, sombra: false, grosor: 0.008 }); m.position.set(dx, h / 2, 0); llama.add(m);
  });
  b.userData.llama = llama;
  return b;
}
/* El santuario de cal con su friso de lapislázuli, su puerta y su llama. */
function santuario(K, w, d, h, { friso = SU.lapis, cuernos = true } = {}) {
  const g = new THREE.Group();
  pon(g, caja(K, w, h, d, SU.cal, { grosor: 0.014 }), 0, h / 2, 0);
  pon(g, caja(K, w + 0.04, 0.07, d + 0.04, friso, { grosor: 0.008 }), 0, h - 0.06, 0);
  for (let i = 0; i < 5; i++) pon(g, caja(K, 0.05, 0.05, 0.02, SU.oro, { sinTinta: true }), -w / 2 + w * (i + 0.5) / 5, h - 0.06, d / 2 + 0.03);   // rosetas de oro del friso
  const n = Math.round(w / 0.16);
  for (let i = 0; i <= n; i++) pon(g, caja(K, 0.07, 0.07, 0.07, SU.calD, { grosor: 0.006 }), -w / 2 + (w * i) / n, h + 0.035, d / 2 - 0.035);   // almenas
  pon(g, caja(K, 0.22, 0.34, 0.03, '#3a2a1c', { sinTinta: true }), 0, 0.17, d / 2 + 0.005);   // la puerta
  pon(g, caja(K, 0.3, 0.05, 0.05, SU.madera, { grosor: 0.006 }), 0, 0.36, d / 2 + 0.02);     // el dintel de cedro
  [-1, 1].forEach(l => { for (let k = 0; k < 3; k++) pon(g, caja(K, 0.03, h * 0.8, 0.02, SU.calD, { sinTinta: true }), l * (0.2 + k * 0.08), h * 0.42, d / 2 + 0.01); });   // nichos de la fachada
  if (cuernos) [-1, 1].forEach(l => { const c = K.malla(K.cono(0.035, 0.16, 6), SU.oro, { grosor: 0.006 }); c.position.set(l * (w / 2 - 0.05), h + 0.13, d / 2 - 0.05); c.rotation.z = -l * 0.35; g.add(c); });
  g.userData.fuego = brasero(K, g, 0, h + 0.07, 0);
  return g;
}

/* ---------- EL ZIGURAT ---------- */
/* Devuelve { obj, llama, huellas? } con el origen en el centro de la base. */
export function zigurat(K, variante = VARIANTES.zigurat) {
  const g = new THREE.Group();
  let san;
  if (variante === 'ur') {
    /* UR-NAMMU: tres terrazas con contrafuertes, bandas de betún y la triple escalinata que converge en la
       portada de la primera terraza; arriba, el santuario de cal con friso de lapislázuli. */
    const T = [[3.4, 3.2, 0.82, 0, 0], [2.3, 2.1, 0.64, 0, -0.3], [1.4, 1.2, 0.48, 0, -0.45]];
    let y = 0;
    T.forEach(([w, d, h, x, z], i) => {
      const cuerpo = new THREE.Group(); cuerpo.position.set(x, y, z); g.add(cuerpo);
      pon(cuerpo, K.malla(tronco(w, d, w - 0.12, d - 0.12, h), i ? SU.adobe : SU.adobeD, { grosor: 0.016 }), 0, 0, 0);
      contrafuertes(K, cuerpo, w - 0.04, d - 0.04, h - 0.02, 0, 0.42, i ? SU.adobeL : SU.adobe);
      pon(cuerpo, K.malla(K.caja(w - 0.1, 0.03, d - 0.1), SU.adobeL, { sinTinta: true }), 0, h + 0.015, 0);   // el piso de la terraza
      if (i < 2) { capasDeBetun(K, cuerpo, w - 0.06, d - 0.06, h * 0.36); capasDeBetun(K, cuerpo, w - 0.08, d - 0.08, h * 0.72); }
      y += h;
    });
    const h1 = T[0][2], zf = T[0][1] / 2;              // la cara del frente de la primera terraza
    const central = escalera(K, { largo: 1.6, alto: h1, ancho: 0.6, n: 13 }); central.position.set(0, 0, zf + 1.6); g.add(central);
    [-1, 1].forEach(l => {                              // las dos laterales, pegadas al muro, suben hacia el centro
      const e = escalera(K, { largo: 1.2, alto: h1, ancho: 0.36, n: 10 }); e.rotation.y = l * Math.PI / 2; e.position.set(l * 1.65, 0, zf + 0.2); g.add(e);
    });
    const portada = new THREE.Group(); portada.position.set(0, h1, zf - 0.26); g.add(portada);   // donde se juntan las tres
    pon(portada, caja(K, 0.72, 0.42, 0.36, SU.ladrillo, { grosor: 0.012 }), 0, 0.21, 0);
    pon(portada, caja(K, 0.24, 0.3, 0.03, '#3a2a1c', { sinTinta: true }), 0, 0.15, 0.185);
    pon(portada, caja(K, 0.8, 0.06, 0.42, SU.ladrilloD, { grosor: 0.008 }), 0, 0.45, 0);
    const alto2 = T[1][2], z2 = T[1][4] + T[1][1] / 2;  // el tramo que sigue a la segunda terraza
    const tramo = escalera(K, { largo: 0.5, alto: alto2, ancho: 0.44, n: 8 }); tramo.position.set(0.62, h1, z2 + 0.5); g.add(tramo);
    const tramo3 = escalera(K, { largo: 0.4, alto: T[2][2], ancho: 0.36, n: 6 }); tramo3.position.set(0, h1 + alto2, T[2][4] + T[2][1] / 2 + 0.4); g.add(tramo3);
    san = santuario(K, 0.95, 0.72, 0.5); san.position.set(0, y, T[2][4] - 0.08); g.add(san);
  } else if (variante === 'uruk') {
    /* EL TEMPLO BLANCO DE URUK: una sola plataforma alta en talud, con nichos, y el templo encalado arriba;
       se sube por una rampa larga por el costado, que es como se subía al de Anu. */
    const w = 3.6, d = 3.3, h = 1.25;
    pon(g, K.malla(tronco(w, d, w - 0.7, d - 0.7, h), SU.adobeD, { grosor: 0.016 }), 0, 0, 0);
    for (let i = 0; i < 9; i++) {                      // los nichos verticales del talud, en las dos caras que se ven
      const u = -0.4 + 0.8 * (i + 0.5) / 9;
      const n1 = caja(K, 0.12, h * 0.8, 0.03, SU.adobeS, { sinTinta: true }); n1.position.set(u * (w - 0.35), h * 0.45, d / 2 - 0.16); n1.rotation.x = -0.24; g.add(n1);
      if (i < 7) { const n2 = caja(K, 0.03, h * 0.8, 0.12, SU.adobeS, { sinTinta: true }); n2.position.set(w / 2 - 0.16, h * 0.45, u * (d - 0.35) * 1.1); n2.rotation.z = 0.24; g.add(n2); }
    }
    pon(g, K.malla(K.caja(w - 0.72, 0.04, d - 0.72), SU.cal, { sinTinta: true }), 0, h + 0.02, 0);
    const rampa = escalera(K, { largo: 2.5, alto: h, ancho: 0.5, n: 18, color: SU.adobeL, baranda: SU.adobe });
    rampa.position.set(w / 2 + 0.2, 0, d / 2 + 0.6); g.add(rampa);   // sube por el costado que se ve, de frente hacia atrás
    san = santuario(K, 1.7, 0.9, 0.6, { friso: SU.calD, cuernos: false });
    for (let i = 0; i < 8; i++) pon(san, caja(K, 0.06, 0.48, 0.03, SU.calD, { sinTinta: true }), -0.74 + i * 0.21, 0.29, 0.46);
    san.position.set(0, h + 0.04, -0.15); g.add(san);
  } else {
    /* ERIDU, EL MÁS ANTIGUO: dos terrazas bajas de adobe sin cocer, una rampa de frente y arriba un santuario
       de caña con su arco, como las primeras casas de los dioses en las marismas. */
    const T = [[3.4, 3.0, 0.55, 0], [2.2, 1.9, 0.42, -0.35]];
    let y = 0;
    T.forEach(([w, d, h, z], i) => { pon(g, K.malla(tronco(w, d, w - 0.3, d - 0.3, h), i ? SU.arcilla : SU.arcillaD, { grosor: 0.016 }), 0, y, z); y += h; });
    const r = escalera(K, { largo: 1.3, alto: T[0][2], ancho: 0.7, n: 9, color: SU.arcilla, baranda: null }); r.position.set(0, 0, T[0][1] / 2 + 1.3 - 0.15); g.add(r);
    const r2 = escalera(K, { largo: 0.7, alto: T[1][2], ancho: 0.55, n: 6, color: SU.arcilla, baranda: null }); r2.position.set(0, T[0][2], T[1][3] + T[1][1] / 2 + 0.7 - 0.15); g.add(r2);
    san = casaDeCana(K, { largo: 1.3, ancho: 0.8, alto: 0.7, arcos: 5 }); san.position.set(0, y, -0.35); g.add(san);
    san.userData.fuego = brasero(K, san, 0, 0.02, 0.62);
  }
  g.userData.ficha = { titulo: 'El Eanna', texto: 'la casa de Inanna: la ciudad reza, cuenta y guarda el grano' };
  return { obj: g, llama: san.userData.fuego?.userData.llama, altoSantuario: san.position.y };
}

/* ---------- las casas de caña (mudhif): arcos de haces de caña y esteras ---------- */
export function casaDeCana(K, { largo = 2.4, ancho = 1.3, alto = 1.05, arcos = 7, frente = true, sinEstera = false } = {}) {
  const g = new THREE.Group(), r = ancho / 2, k = alto / r;
  for (let i = 0; i < arcos; i++) {                  // los arcos de haces, que asoman sobre la estera
    const x = -largo / 2 + (largo * i) / (arcos - 1);
    const a = K.malla(K.toro(r, 0.055, Math.PI, 0.9), SU.arco, { grosor: 0.01 }); a.rotation.y = Math.PI / 2; a.scale.set(1, k, 1); a.position.x = x; g.add(a);
  }
  if (sinEstera) {                                     // solo los arcos y dos largueros: se ve la clase debajo
    [0.7, 1.0].forEach(f => [-1, 1].forEach(l => { const ang = Math.PI / 2 + l * (Math.PI / 2) * (1 - f * 0.55); const c = K.malla(K.cilindro(0.025, 0.025, largo, 6), SU.arco, { grosor: 0.006 }); c.rotation.z = Math.PI / 2; c.position.set(0, Math.sin(ang) * r * k, Math.cos(ang) * r); g.add(c); }));
    return g;
  }
  const techo = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.02, r - 0.02, largo, 18, 1, true, 0, Math.PI), K.mat(SU.estera, { side: THREE.DoubleSide }));
  techo.rotation.z = Math.PI / 2; techo.scale.set(k, 1, 1); techo.castShadow = techo.receiveShadow = true; g.add(techo);
  for (let i = 0; i < 6; i++) {                      // las costuras de la estera, a lo largo
    const ang = Math.PI * (i + 0.5) / 6;
    const c = caja(K, largo, 0.02, 0.02, SU.esteraD, { sinTinta: true }); c.position.set(0, Math.sin(ang) * r * k, Math.cos(ang) * r); g.add(c);
  }
  if (frente) [-1, 1].forEach(l => {                 // las columnas de haces del frente, más altas que la bóveda
    [0.26, 0.5].forEach((dz, j) => {
      const h = alto * (1.15 - j * 0.12), col = K.malla(K.cilindro(0.05, 0.075, h, 8), SU.cana, { grosor: 0.01 });
      col.position.set(largo / 2 + 0.02, h / 2, l * (r - dz * 0.55)); g.add(col);
      for (let b = 1; b <= 3; b++) pon(g, K.malla(K.cilindro(0.078, 0.078, 0.025, 8), SU.atadura, { sinTinta: true }), largo / 2 + 0.02, h * b / 4, l * (r - dz * 0.55));
      const punta = K.malla(K.cono(0.05, 0.14, 7), SU.canaL, { grosor: 0.008 }); punta.position.set(largo / 2 + 0.02, h + 0.06, l * (r - dz * 0.55)); punta.rotation.x = l * 0.5; g.add(punta);
    });
  });
  if (frente) {                                        // la celosía del frente, con la puerta
    const cel = new THREE.Group(); cel.position.x = largo / 2 + 0.005; g.add(cel);
    for (let i = -3; i <= 3; i++) if (Math.abs(i) > 0) { const hh = Math.sqrt(Math.max(0, 1 - (i / 3.6) ** 2)) * alto * 0.92; pon(cel, caja(K, 0.015, hh, 0.02, SU.canaD, { sinTinta: true }), 0, hh / 2, (i / 3.6) * r); }
    for (let j = 1; j <= 4; j++) { const yy = alto * j / 5, ww = 2 * r * Math.sqrt(Math.max(0, 1 - (yy / alto) ** 2)); pon(cel, caja(K, 0.015, 0.015, ww, SU.canaD, { sinTinta: true }), 0, yy, 0); }
    pon(cel, caja(K, 0.02, alto * 0.62, 0.3, '#3a2a1c', { sinTinta: true }), 0, alto * 0.31, 0);
  }
  return g;
}

/* ---------- LA EDUBBA: la casa de las tablillas, en sus etapas (niv 0 a 3) ---------- */
/* niv 0: se está levantando (andamio y adobes); 1: la casa con su patio, esteras y bancos; 2: el patio techado
   y más bancos; 3: el nicho de Nisaba y el asiento del ummia. Origen: centro; el frente mira a +z. */
export function edubba(K, niv = 3, variante = VARIANTES.edubba) {
  const g = new THREE.Group();
  const esteras = (x, z, n, rot = 0) => { for (let i = 0; i < n; i++) { const e = caja(K, 0.34, 0.012, 0.22, i % 2 ? SU.cana : SU.canaD, { sinTinta: true }); e.position.set(x + (rot ? 0 : i * 0.38), 0.05, z + (rot ? i * 0.26 : 0)); g.add(e); } };
  const tablillas = (x, z, n) => { for (let i = 0; i < n; i++) { const t = caja(K, 0.07, 0.02, 0.1, i % 3 ? SU.arcilla : SU.arcillaD, { sinTinta: true }); t.position.set(x + (i % 4) * 0.09, 0.2 + Math.floor(i / 4) * 0.025, z); g.add(t); } };
  if (variante === 'patio' || variante === 'mixto') {
    const W = variante === 'mixto' ? 1.4 : 2.5, D = variante === 'mixto' ? 1.3 : 2.1, e = 0.14, H = niv === 0 ? 0.36 : 0.66;
    const bx = variante === 'mixto' ? -0.75 : 0;
    const casa = new THREE.Group(); casa.position.x = bx; g.add(casa);
    pon(casa, caja(K, W, 0.05, D, SU.adobeL, { sinTinta: true }), 0, 0.025, 0);                 // el piso de tierra apisonada
    const muro = (w, d, x, z) => { pon(casa, caja(K, w, H, d, SU.adobe, { grosor: 0.012 }), x, H / 2, z); pon(casa, caja(K, w + 0.02, 0.04, d + 0.02, SU.adobeD, { grosor: 0.006 }), x, H + 0.02, z); };
    muro(W, e, 0, -D / 2 + e / 2); muro(e, D, -W / 2 + e / 2, 0); muro(e, D, W / 2 - e / 2, 0);
    const puerta = 0.38; muro((W - puerta) / 2, e, -(W + puerta) / 4, D / 2 - e / 2); muro((W - puerta) / 2, e, (W + puerta) / 4, D / 2 - e / 2);
    if (niv === 0) {                                   // la obra: andamio de palos, adobes apilados y el molde
      for (let i = 0; i < 4; i++) pon(casa, K.malla(K.cilindro(0.02, 0.02, 0.95, 5), SU.madera, { grosor: 0.006 }), -W / 2 + 0.2 + i * (W - 0.4) / 3, 0.47, D / 2 + 0.12);
      pon(casa, caja(K, W - 0.2, 0.03, 0.14, SU.maderaD, { grosor: 0.006 }), 0, 0.78, D / 2 + 0.12);
      for (let i = 0; i < 9; i++) pon(casa, caja(K, 0.16, 0.06, 0.1, i % 2 ? SU.adobe : SU.adobeD, { grosor: 0.006 }), W / 2 + 0.3 + (i % 3) * 0.17, 0.03 + Math.floor(i / 3) * 0.06, D / 2 - 0.1);
      pon(casa, caja(K, 0.3, 0.06, 0.2, SU.madera, { grosor: 0.006 }), -W / 2 - 0.3, 0.03, D / 2 - 0.2);
    } else {
      const fondo = variante === 'mixto' ? D : D * 0.45;   // las salas techadas del fondo
      pon(casa, caja(K, W, 0.06, fondo, SU.adobeD, { grosor: 0.012 }), 0, H + 0.05, -D / 2 + fondo / 2);
      for (let i = 0; i < 6; i++) { const v = K.malla(K.cilindro(0.028, 0.028, 0.16, 6), SU.palmaD, { grosor: 0.006 }); v.rotation.x = Math.PI / 2; v.position.set(-W / 2 + 0.2 + i * (W - 0.4) / 5, H - 0.02, -D / 2 + fondo + 0.07); casa.add(v); }   // las vigas de palmera asoman
      pon(casa, caja(K, puerta + 0.14, 0.06, e + 0.06, SU.madera, { grosor: 0.008 }), 0, H - 0.08, D / 2 - e / 2);   // el dintel
      if (variante === 'patio') {
        [-1, 1].forEach(l => pon(casa, caja(K, 0.2, 0.15, 0.78, SU.adobeL, { grosor: 0.008 }), l * (W / 2 - e - 0.1), 0.1, 0.22));   // los bancos de adobe del patio
        pon(casa, caja(K, 0.3, 0.16, 0.26, SU.adobeD, { grosor: 0.008 }), W / 2 - e - 0.22, 0.08, D / 2 - e - 0.2);                // el cajón de arcilla para reamasar
        pon(casa, caja(K, 0.24, 0.02, 0.2, SU.arcillaD, { sinTinta: true }), W / 2 - e - 0.22, 0.165, D / 2 - e - 0.2);
      }
      const escal = escalera(K, { largo: 0.5, alto: H, ancho: 0.2, n: 6, color: SU.adobeD, baranda: null });   // la escalera al techo
      escal.rotation.y = Math.PI / 2; escal.position.set(W / 2 + 0.5, 0, -D / 2 + 0.25); casa.add(escal);
    }
    if (niv >= 1) {
      if (variante === 'patio') { esteras(-0.55, 0.18, 3); tablillas(0.35, -0.1, 7); }
      else esteras(0.25, 0.1, 4);
    }
    if (niv >= 2) {                                    // el patio se techa: palos y estera de caña (o el porche de arcos)
      if (variante === 'patio') {
        [[-0.85, 0.75], [0.85, 0.75], [-0.85, -0.05], [0.85, -0.05]].forEach(([x, z]) => pon(casa, K.malla(K.cilindro(0.025, 0.03, 0.78, 6), SU.palma, { grosor: 0.006 }), x, 0.39, z));
        pon(casa, caja(K, 1.9, 0.03, 0.95, SU.cana, { grosor: 0.008 }), 0, 0.8, 0.35);
        for (let i = 0; i < 7; i++) pon(casa, caja(K, 0.02, 0.012, 0.95, SU.canaD, { sinTinta: true }), -0.9 + i * 0.3, 0.82, 0.35);
        [-1, 1].forEach(l => pon(casa, caja(K, 0.2, 0.15, 0.5, SU.adobeL, { grosor: 0.008 }), l * 0.45, 0.1, 0.62));
      } else {
        const porche = casaDeCana(K, { largo: 1.5, ancho: 1.3, alto: 0.95, arcos: 5, frente: false }); porche.rotation.y = Math.PI / 2; porche.position.set(0.75, 0, 0.15); g.add(porche);
      }
    }
    if (niv >= 3) {                                    // el nicho de Nisaba en el muro del fondo y el asiento del ummia
      const nicho = new THREE.Group(); nicho.position.set(0, 0, -D / 2 + e + 0.02); casa.add(nicho);
      pon(nicho, caja(K, 0.34, 0.46, 0.06, SU.cal, { grosor: 0.008 }), 0, 0.28, 0);
      pon(nicho, caja(K, 0.36, 0.05, 0.08, SU.lapis, { grosor: 0.006 }), 0, 0.53, 0);
      const diosa = K.malla(K.cilindro(0.04, 0.06, 0.2, 8), SU.lapisL, { grosor: 0.006 }); diosa.position.set(0, 0.22, 0.05); nicho.add(diosa);
      pon(nicho, K.malla(K.esfera(0.04), SU.oro, { grosor: 0.006 }), 0, 0.35, 0.05);
      const silla = new THREE.Group(); silla.position.set(-0.45, 0, -0.1); casa.add(silla);
      pon(silla, caja(K, 0.26, 0.2, 0.24, SU.madera, { grosor: 0.008 }), 0, 0.1, 0);
      pon(silla, caja(K, 0.26, 0.26, 0.05, SU.maderaD, { grosor: 0.008 }), 0, 0.33, -0.1);
      pon(silla, caja(K, 0.22, 0.03, 0.2, SU.rojo, { sinTinta: true }), 0, 0.215, 0.01);
    }
  } else {
    /* EL MUDHIF: la casa de cañas de las marismas, con su celosía y sus columnas de haces */
    const H = niv === 0 ? 0.55 : 1.05;
    if (niv === 0) {                                   // los arcos se están levantando: haces sueltos en el suelo
      const a = casaDeCana(K, { largo: 1.2, ancho: 1.3, alto: H, arcos: 3, frente: false }); a.position.x = -0.6; g.add(a);
      for (let i = 0; i < 6; i++) { const h = K.malla(K.cilindro(0.05, 0.05, 1.1, 7), SU.cana, { grosor: 0.008 }); h.rotation.z = Math.PI / 2; h.position.set(0.6 + (i % 2) * 0.15, 0.05 + Math.floor(i / 2) * 0.1, 0.4 + (i % 3) * 0.12); g.add(h); }
    } else {
      const m = casaDeCana(K, { largo: 2.4, ancho: 1.3, alto: H, arcos: 7 }); m.rotation.y = -Math.PI / 2; g.add(m);
      esteras(-0.6, 0.9, 4);
    }
    if (niv >= 2) [-1, 1].forEach(l => pon(g, caja(K, 0.9, 0.15, 0.2, SU.adobeL, { grosor: 0.008 }), l * 0.95, 0.08, 1.45));
    if (niv >= 3) {
      pon(g, caja(K, 0.34, 0.5, 0.08, SU.cal, { grosor: 0.008 }), 0.9, 0.25, -1.05);
      pon(g, K.malla(K.cilindro(0.04, 0.06, 0.2, 8), SU.lapisL, { grosor: 0.006 }), 0.9, 0.22, -0.98);
      pon(g, caja(K, 0.26, 0.2, 0.24, SU.madera, { grosor: 0.008 }), -0.2, 0.1, 1.5);
    }
  }
  g.userData.ficha = { titulo: 'La edubba', texto: 'la casa de las tablillas: aquí se aprende a escribir copiando' };
  return g;
}

/* ---------- LOS GUARDIANES DE LA PUERTA ---------- */
export function guardian(K, variante = VARIANTES.guardian, lado = 1) {
  const g = new THREE.Group();
  if (variante === 'leones') {
    /* LOS LEONES DE TELL HARMAL: terracota sentada, fauces abiertas, sobre su basa (~1800 a. C.) */
    g.scale.setScalar(1.3);
    pon(g, caja(K, 0.42, 0.14, 0.6, SU.adobeD, { grosor: 0.01 }), 0, 0.07, 0);
    const c = new THREE.Group(); c.position.y = 0.14; g.add(c);
    const anca = K.malla(K.esfera(0.17), SU.terracota, { grosor: 0.012 }); anca.scale.set(1, 0.8, 1.2); anca.position.set(0, 0.14, -0.12); c.add(anca);
    const pecho = K.malla(K.capsula(0.12, 0.2), SU.terracota, { grosor: 0.012 }); pecho.position.set(0, 0.32, 0.06); pecho.rotation.x = -0.35; c.add(pecho);
    [-1, 1].forEach(l => { const p = K.malla(K.capsula(0.045, 0.24), SU.terracota, { grosor: 0.01 }); p.position.set(l * 0.08, 0.14, 0.14); c.add(p); pon(c, K.malla(K.esfera(0.05), SU.terracotaD, { grosor: 0.008 }), l * 0.08, 0.02, 0.19); });
    const melena = K.malla(K.esfera(0.16), SU.terracotaD, { grosor: 0.012 }); melena.position.set(0, 0.5, 0.13); melena.scale.set(1.05, 1, 0.8); c.add(melena);
    const cara = K.malla(K.esfera(0.1), SU.terracota, { grosor: 0.01 }); cara.position.set(0, 0.5, 0.23); c.add(cara);
    const boca = K.malla(K.caja(0.1, 0.05, 0.06), '#5a2a1c', { sinTinta: true }); boca.position.set(0, 0.45, 0.31); c.add(boca);
    [-1, 1].forEach(l => pon(c, K.malla(K.esfera(0.018), '#f3ead2', { sinTinta: true }), l * 0.04, 0.54, 0.31));
    const cola = K.malla(K.capsula(0.02, 0.22), SU.terracotaD, { grosor: 0.006 }); cola.position.set(lado * 0.14, 0.08, -0.2); cola.rotation.x = 1.2; c.add(cola);
  } else if (variante === 'lamassu') {
    /* EL LAMASSU (asirio, ~850 a. C.: mil años después de la edubba; el 2D lo tenía) */
    pon(g, caja(K, 0.4, 0.12, 0.9, SU.calD, { grosor: 0.01 }), 0, 0.06, 0);
    const cuerpo = K.malla(K.capsula(0.17, 0.42), SU.cal, { grosor: 0.012 }); cuerpo.rotation.x = Math.PI / 2; cuerpo.position.set(0, 0.5, 0); g.add(cuerpo);
    [[-1, 0.25], [1, 0.25], [-1, -0.25], [1, -0.25]].forEach(([l, z]) => pon(g, K.malla(K.cilindro(0.045, 0.05, 0.36, 7), SU.cal, { grosor: 0.008 }), l * 0.09, 0.3, z));
    const ala = caja(K, 0.04, 0.34, 0.62, SU.calD, { grosor: 0.01 }); ala.position.set(lado * 0.12, 0.72, -0.1); ala.rotation.x = -0.25; g.add(ala);
    for (let i = 0; i < 4; i++) pon(g, caja(K, 0.045, 0.02, 0.58 - i * 0.08, '#b9ad96', { sinTinta: true }), lado * 0.13, 0.62 + i * 0.07, -0.1);
    const cab = K.malla(K.esfera(0.11), SU.cal, { grosor: 0.01 }); cab.position.set(0, 0.8, 0.33); g.add(cab);
    const barba = caja(K, 0.14, 0.16, 0.06, '#3a2a1c', { grosor: 0.006 }); barba.position.set(0, 0.69, 0.4); g.add(barba);
    pon(g, K.malla(K.cilindro(0.1, 0.11, 0.14, 10), SU.calD, { grosor: 0.008 }), 0, 0.95, 0.33);
  } else {
    /* EL HAZ DE INANNA: la columna de cañas atada con su aro y su cinta, en las puertas de Uruk */
    const alto = 1.55;
    pon(g, K.malla(K.cilindro(0.1, 0.12, 0.08, 10), SU.adobeD, { grosor: 0.008 }), 0, 0.04, 0);
    pon(g, K.malla(K.cilindro(0.055, 0.075, alto, 9), SU.cana, { grosor: 0.01 }), 0, alto / 2, 0);
    for (let b = 1; b <= 5; b++) pon(g, K.malla(K.cilindro(0.078 - b * 0.004, 0.078 - b * 0.004, 0.03, 9), SU.atadura, { sinTinta: true }), 0, alto * b / 6, 0);
    const aro = K.malla(K.toro(0.13, 0.03, Math.PI * 2, 0.8), SU.cana, { grosor: 0.008 }); aro.position.set(0, alto + 0.1, 0); aro.rotation.y = Math.PI / 2; g.add(aro);
    const cinta = caja(K, 0.015, 0.5, 0.07, SU.rojo, { grosor: 0.004 }); cinta.position.set(0, alto - 0.18, 0.12); cinta.rotation.x = 0.15; cinta.userData.vivo = true; g.add(cinta); g.userData.cinta = cinta;
  }
  return g;
}

/* ---------- la palmera datilera (la de la ribera, con racimos) ---------- */
export function palmera(K, alto = 1.6, semilla = 1) {
  const g = new THREE.Group(), n = 9, inclina = ((semilla * 37) % 10 - 5) * 0.025;
  const tronco = new THREE.Group(); tronco.rotation.z = inclina; g.add(tronco);
  for (let i = 0; i < n; i++) {                      // el tronco anillado: tramos que se afinan
    const r0 = 0.085 - i * 0.004, s = K.malla(K.cilindro(r0 - 0.008, r0, alto / n, 8), i % 2 ? SU.palma : SU.palmaD, { grosor: 0.008 });
    s.position.y = (i + 0.5) * alto / n; tronco.add(s);
  }
  const copa = new THREE.Group(); copa.position.y = alto; copa.userData.vivo = true; tronco.add(copa);
  for (let i = 0; i < 9; i++) {                      // las pencas arqueadas
    const a = i * 2 * Math.PI / 9 + semilla, fr = new THREE.Group(); fr.rotation.y = a; copa.add(fr);
    const p = K.malla(K.caja(0.1, 0.02, 0.62), i % 3 ? SU.hoja : SU.hojaL, { grosor: 0.006 }); p.position.set(0, 0.02, 0.3); p.rotation.x = 0.35 + (i % 2) * 0.25; fr.add(p);
    const q = K.malla(K.caja(0.07, 0.015, 0.32), SU.hojaD, { grosor: 0.005 }); q.position.set(0, -0.1, 0.62); q.rotation.x = 0.9; fr.add(q);
  }
  [0, 2.1, 4.2].forEach(a => { const r = K.malla(K.esfera(0.07, 0.6), '#c07a2a', { grosor: 0.006 }); r.scale.set(0.9, 1.3, 0.9); r.position.set(Math.cos(a) * 0.08, -0.1, Math.sin(a) * 0.08); copa.add(r); });   // los racimos de dátiles
  fundir(K, copa);                                     // la copa se mece entera: sus pencas van en pocas mallas
  g.userData.copa = copa;
  g.userData.ficha = { titulo: 'La datilera', texto: 'la palmera de la ribera: sombra, dátiles y vigas para los techos' };
  return g;
}
