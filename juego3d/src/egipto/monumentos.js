/* ============================================================
   egipto/monumentos
   Las piezas grandes de Egipto en 3D, en variantes para la hoja de bocetos (juego3d/bocetos/egipto.html):
   la necrópolis, la Gran Esfinge, la Casa de la Vida y la entrada del templo. La elegida por el usuario se
   fija en VARIANTES y es la que usa la época.
   EL CUIDADO (pedido del usuario: «que los egipcios estén orgullosos de nosotros»):
   - Las proporciones de Giza son las reales: Keops 230 m de lado y 146 de alto (51,8°), Kefrén 215 y 143
     (53°, sobre una meseta más alta, con su revestimiento todavía en la cima), Micerino 104 y 65, con sus
     tres pirámides de reinas. En la época del juego (~1500 a. C.) las pirámides llevaban mil años en pie y
     seguían revestidas de caliza blanca de Tura: el revestimiento se desmontó en la Edad Media.
   - La Esfinge mira al este, delante de Kefrén. Hacia 1400 a. C. Tutmosis IV la desenterró de la arena y
     puso entre sus patas la Estela del Sueño; en el Reino Nuevo estaba pintada.
   - Los jeroglíficos son REALES (la fuente Noto Sans Egyptian Hieroglyphs, vendor/fuentes): los cartuchos
     dicen los nombres de verdad y los frisos, fórmulas de verdad (ankh-djed-was: vida, estabilidad, poder).
   - Los colores son los de los pigmentos egipcios: azul egipcio, verde malaquita, ocre rojo y amarillo,
     negro de carbón y blanco de yeso; la piel de los hombres en rojo ocre, como la pintaban ellos.
   Escala: 1 = una baldosa; una persona adulta mide ~0,9. El frente de cada pieza mira a +z.
   ============================================================ */
import * as THREE from 'three';
import { fundir } from '../kit.js';
import { tronco, escalera } from '../sumer/monumentos.js';

export const EG = {
  tura: '#e6d7b6', turaD: '#cdbd9c', caliza: '#d9c49c', calizaD: '#c4ad82', calizaS: '#b09a70',
  arenisca: '#dcbd8c', areniscaL: '#e8d0a4', areniscaD: '#c49f6c', granito: '#b56b5a', granitoD: '#8f4d40',
  adobe: '#c9a57a', adobeD: '#a9855a', cal: '#f3ecdc', calD: '#e0d6c1',
  azul: '#2a64ad', azulL: '#4f8fd0', verde: '#3e8f6c', verdeL: '#6fb08c', rojo: '#b3432c', ocre: '#e2ac45', negro: '#2a2420',
  oro: '#e6bb4c', oroD: '#b98f2c', piel: '#a4553a', pielM: '#e2b48a', lino: '#f4efe2', cedro: '#8b5a3a', cedroD: '#6a4228',
};
export const VARIANTES = { necropolis: 'giza1500', esfinge: 'piedra', casa: 'pilono', entrada: 'luxor' };   // elegidas por el usuario el 2026-09-29

/* ---------- los jeroglíficos: la fuente, cargada una vez ---------- */
let fuente = null;
export function cargarJeroglificos(base = '') {
  if (!fuente) {
    const ff = new FontFace('Jeroglificos', `url(${base}vendor/fuentes/jeroglificos.woff2)`);
    fuente = ff.load().then(f => { document.fonts.add(f); return true; }).catch(() => false);
  }
  return fuente;
}
/* frases reales (Unicode, bloque de los jeroglíficos egipcios; el código de Gardiner al lado, verificado contra
   la base de Unicode). En los cartuchos el sol va arriba aunque se lea al final: la transposición honorífica. */
export const JER = {
  ankhDjedWas: '\u{132F9}\u{132BD}\u{13300}',            // S34 R11 S40: vida, estabilidad, poder
  ankhUdjaSeneb: '\u{132F9}\u{13351}\u{132F4}',          // S34 U28 S29: «vida, prosperidad, salud»
  perAnkh: '\u{13250}\u{132F9}',                          // O1 S34: la Casa de la Vida (pr-ꜥnḫ)
  jufu: ['\u{1340D}\u{13171}\u{13191}\u{13171}'],         // Aa1 G43 I9 G43: Keops (ḫwfw)
  jafra: ['\u{131F3}\u{1320D}\u{13191}'],                 // N5 N28 I9: Kefrén (rꜥ-ḫꜥ-f)
  menkaura: ['\u{131F3}\u{133E0}\u{13093}\u{13093}\u{13093}'],   // N5 Y5 D28×3: Micerino (mn-kꜣw-rꜥ)
  tutmosis: ['\u{131F3}\u{133E0}\u{131A3}\u{133E5}'],     // N5 Y5 L1 Z2: Tutmosis IV, nombre de trono Men-jeperu-Ra
  sesh: '\u{133DE}',                                       // Y3: la paleta del escriba («escribir, escriba»)
  neter: '\u{132B9}',                                      // R8: dios
  hotep: '\u{132B5}',                                      // R4: ofrenda, paz
  ra: '\u{131F3}',                                         // N5: el sol
  semaTauy: '\u{13125}',                                   // F36: la unión de las Dos Tierras
  cielo: '\u{131EF}',                                      // N1: el cielo
  rey: '\u{13032}',                                        // A43: el rey con la corona blanca
  thot: '\u{1305F}',                                       // C3: Thot, con cabeza de ibis
  dios: '\u{1302D}',                                       // A40: un dios sentado
  thotNombre: '\u{1315D}\u{1339F}\u{13303}\u{132B9}',       // G26 V30 S43 R8: Thot, señor de las palabras del dios (los jeroglíficos)
  seshat: '\u{132C7}\u{13050}',                            // R20 B1: el emblema de Seshat (la estrella de siete puntas) sobre la diosa sentada
  gato: '\u{130E0}',                                       // E13: el gato
  pato: '\u{1316D}',                                       // G39: el ánade
};
/* Pinta un panel de jeroglíficos en una textura (propia: se libera con la pieza). op: { cols, filas, fondo, tinta,
   texto (o lista por columna), cartucho, vertical, borde } */
export function panelJeroglifico(op = {}) {
  const W = op.w || 128, H = op.h || 256, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = op.fondo || EG.arenisca; g.fillRect(0, 0, W, H);
  if (op.grano !== false) for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(${i % 2 ? '255,255,255' : '90,60,30'},0.05)`; g.fillRect(Math.random() * W, Math.random() * H, 2 + Math.random() * 5, 1 + Math.random() * 2); }
  const cols = op.cols || 1, texto = op.texto || JER.ankhDjedWas;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let k = 0; k < cols; k++) {
    const cx = (k + 0.5) * W / cols, t = Array.isArray(texto) ? texto[k % texto.length] : texto, signos = [...t];
    const tam = Math.min(W / cols * 0.72, (H - 16) / Math.max(signos.length, op.filas || signos.length) * 0.9);
    g.font = `${tam}px Jeroglificos`;
    const n = op.filas || signos.length, paso = (H - 16) / n;
    if (op.cartucho) {                               // el anillo del nombre real
      g.strokeStyle = op.tinta || EG.negro; g.lineWidth = Math.max(2, tam * 0.08);
      const x0 = cx - tam * 0.6, y0 = 6, w = tam * 1.2, h = H - 18, r = w / 2;
      g.beginPath(); g.moveTo(x0, y0 + r); g.arc(cx, y0 + r, r, Math.PI, 0); g.lineTo(x0 + w, y0 + h - r); g.arc(cx, y0 + h - r, r, 0, Math.PI); g.closePath(); g.stroke();
      g.beginPath(); g.moveTo(x0 - 3, y0 + h + 4); g.lineTo(x0 + w + 3, y0 + h + 4); g.stroke();
    }
    for (let i = 0; i < n; i++) {
      const s = signos[i % signos.length];
      g.fillStyle = op.colores ? op.colores[(i + k) % op.colores.length] : (op.tinta || EG.negro);
      g.fillText(s, cx, 8 + (i + 0.5) * paso);
    }
    if (op.borde && k < cols - 1) { g.fillStyle = op.tinta || EG.negro; g.fillRect((k + 1) * W / cols - 1, 4, 2, H - 8); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.userData.propia = true;
  return t;
}
/* EL RELIEVE DE LA OFRENDA: el rey (con la corona blanca) le presenta la paleta del escriba a Thot, señor de los
   jeroglíficos, bajo el signo del cielo; encima de cada uno, su nombre. Las figuras son los signos de la fuente a tamaño
   grande, pintadas como se pintaban los relieves. espejo: la escena al revés (para la otra torre del pilono). */
export function escenaOfrenda({ w = 256, h = 384, fondo = EG.arenisca, espejo = false } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.fillStyle = fondo; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 140; i++) { g.fillStyle = `rgba(${i % 2 ? '255,255,255' : '90,60,30'},0.05)`; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 6, 1 + Math.random() * 2); }
  if (espejo) { g.translate(w, 0); g.scale(-1, 1); }
  g.strokeStyle = '#7a5a36'; g.lineWidth = 3; g.strokeRect(8, 8, w - 16, h - 16);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.save(); g.fillStyle = EG.azul; g.font = `${w * 0.5}px Jeroglificos`; g.translate(w / 2, 58); g.scale(1.9, 0.55); g.fillText(JER.cielo, 0, 0); g.restore();   // el cielo
  // los nombres: el cartucho del rey y el nombre de Thot, en columna
  const col = (txt, x, y0, tam, color, cartucho) => {
    g.fillStyle = color; g.font = `${tam}px Jeroglificos`; const sg = [...txt];
    sg.forEach((sn, i) => g.fillText(sn, x, y0 + (i + 1) * tam * 0.92));
    if (cartucho) { g.strokeStyle = color; g.lineWidth = 2.5; const r = tam * 0.62; g.beginPath(); g.moveTo(x - r, y0 + r); g.arc(x, y0 + r, r, Math.PI, 0); g.lineTo(x + r, y0 + sg.length * tam * 0.92 + 4); g.arc(x, y0 + sg.length * tam * 0.92 + 4, r, 0, Math.PI); g.closePath(); g.stroke(); }
  };
  col(JER.tutmosis[0], w * 0.3, 70, 21, EG.rojo, true);
  col(JER.thotNombre, w * 0.72, 70, 21, EG.azul, false);
  const base = h - 44, tam = h * 0.46;
  g.fillStyle = EG.negro; g.fillRect(16, base + 4, w - 32, 3);                                  // la línea del registro
  g.save(); g.translate(w * 0.3, base); g.scale(-1, 1); g.fillStyle = '#a4553a'; g.font = `${tam}px Jeroglificos`; g.fillText(JER.rey, 0, 0); g.restore();   // el rey, mirando a Thot
  g.fillStyle = '#1f5f8a'; g.font = `${tam}px Jeroglificos`; g.fillText(JER.thot, w * 0.72, base);   // Thot
  g.fillStyle = EG.negro; g.font = `${h * 0.12}px Jeroglificos`; g.fillText(JER.sesh, w * 0.51, base - tam * 0.42);   // la paleta que se ofrece
  g.fillStyle = EG.azul; g.font = `${20}px Jeroglificos`;
  for (let x = 30; x < w - 20; x += 34) g.fillText([...JER.ankhDjedWas][Math.floor(x / 34) % 3], x, h - 16);   // el zócalo
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.userData.propia = true;
  return t;
}
/* un friso: una línea de jeroglíficos repetida, de un color sobre otro (amarillo sobre azul, como en los arquitrabes) */
export function friso(texto, { w = 512, h = 40, fondo = EG.azul, tinta = EG.ocre, colores = null } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.fillStyle = fondo; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, w, 2); g.fillRect(0, h - 2, w, 2);
  const sg = [...texto], tam = h * 0.78; g.font = `${tam}px Jeroglificos`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = 0, x = tam * 0.6; x < w; i++, x += tam * 0.95) { g.fillStyle = colores ? colores[i % colores.length] : tinta; g.fillText(sg[i % sg.length], x, h / 2 + 1); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.userData.propia = true;
  return t;
}
/* la banderola de un mástil: una tela larga y angosta que cae ondeando (en el plano x-y, desde el mástil hacia +x) */
function banderola(largo = 0.55, ancho = 0.12) {
  const f = new THREE.Shape(); f.moveTo(0, 0); f.lineTo(0, -ancho);
  for (let i = 1; i <= 6; i++) { const x = largo * i / 6, y = -ancho * (1 - i * 0.07) - 0.08 * (i / 6) ** 1.5 + 0.015 * Math.sin(i * 1.7); f.lineTo(x, y); }
  for (let i = 6; i >= 1; i--) { const x = largo * i / 6, y = -0.08 * (i / 6) ** 1.5 + 0.015 * Math.sin(i * 1.7) - ancho * i * 0.03; f.lineTo(x, y); }
  f.lineTo(0, 0);
  const geo = new THREE.ShapeGeometry(f); geo.userData.propia = true; return geo;
}
/* el collar ancho (wesekh): medio disco de anillos de cuentas, azul, oro, verde y rojo */
function collarAncho(K, r = 0.2) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const cols = [EG.azul, EG.oro, EG.verde, EG.rojo, EG.azulL, EG.oro, EG.azul];
  for (let i = 0; i < cols.length; i++) { g.fillStyle = cols[i]; g.beginPath(); g.arc(64, 64, 64 - i * (48 / cols.length), 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#000'; g.beginPath(); g.arc(64, 64, 16, 0, Math.PI * 2); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.propia = true;
  const geo = new THREE.CircleGeometry(r, 20, Math.PI, Math.PI); geo.userData.propia = true;
  const m = new THREE.Mesh(geo, K.matMapa(t)); return m;
}
/* una lámina con una textura, pegada a una cara (para relieves y pinturas) */
function lamina(K, tex, w, h) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), K.matMapa(tex)); m.geometry.userData.propia = true; return m; }
const pon = (padre, m, x, y, z, ry = 0) => { m.position.set(x, y, z); if (ry) m.rotation.y = ry; padre.add(m); return m; };
const caja = (K, w, h, d, color, o) => K.malla(K.caja(w, h, d), color, o);
/* una textura de franjas (el nemes, los anillos del collar) */
function franjas(colores, n, vertical = false) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64; const g = c.getContext('2d');
  for (let i = 0; i < n; i++) { g.fillStyle = colores[i % colores.length]; if (vertical) g.fillRect(i * 64 / n, 0, 64 / n + 1, 64); else g.fillRect(0, i * 64 / n, 64, 64 / n + 1); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.userData.propia = true; return t;
}
/* hiladas: bloques de piedra en una textura (las caras de las pirámides sin revestir) */
function hiladas(base, oscuro, n = 24) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 128, 256);
  for (let i = 0; i < n; i++) {
    const y = i * 256 / n; g.fillStyle = oscuro; g.fillRect(0, y, 128, 1.6);
    for (let x = (i % 2) * 9; x < 128; x += 18) { g.fillRect(x, y, 1.2, 256 / n); }
    g.fillStyle = `rgba(255,255,255,${0.04 + (i % 3) * 0.02})`; g.fillRect(0, y + 2, 128, 256 / n - 3);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.propia = true; return t;
}

/* ---------- LA PIRÁMIDE ---------- */
/* lado, alto y estilo: 'revestida' (caliza de Tura lisa, piramidión), 'nucleo' (las hiladas a la vista), 'kefren' (hiladas
   con el revestimiento todavía en la cima). Origen: el centro de la base. */
export function piramide(K, lado, alto, estilo = 'revestida') {
  const g = new THREE.Group(), r = lado / Math.SQRT2;
  if (estilo === 'revestida') {
    /* la caliza lisa con un color por cara: la que da al sol, clara; la de la sombra, un punto más tostada, para
       que la pirámide no se pierda en la arena a mediodía */
    const geo = new THREE.ConeGeometry(r, alto, 4, 1).toNonIndexed(); geo.rotateY(Math.PI / 4); geo.computeVertexNormals();
    const pos = geo.getAttribute('position'), col = [], a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
    const claro = new THREE.Color(EG.tura), sombra = new THREE.Color('#d2bd96'), fondo = new THREE.Color('#ddcba7');
    for (let i = 0; i < pos.count; i += 3) {
      a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
      n.subVectors(c, b).cross(a.clone().sub(b)).normalize();
      const k = n.x > 0.3 ? sombra : n.z < -0.3 || n.x < -0.3 ? fondo : claro;
      for (let j = 0; j < 3; j++) col.push(k.r, k.g, k.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.userData.propia = true;
    const m = K.malla(geo, '#ffffff', { vertexColors: true, grosor: 0.02 }); m.position.y = alto / 2; g.add(m);
  } else {
    const tex = hiladas(EG.caliza, EG.calizaS, Math.round(alto * 11)); tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(4, 1);
    const geo = new THREE.ConeGeometry(r, alto, 4, 1); geo.userData.propia = true;
    const m = K.malla(geo, K.matMapa(tex), { grosor: 0.02 }); m.rotation.y = Math.PI / 4; m.position.y = alto / 2; g.add(m);
    if (estilo === 'kefren') {                         // la caperuza de caliza fina que conserva en la cima
      const f = 0.24, cap = K.malla(new THREE.ConeGeometry(r * f, alto * f, 4, 1), EG.tura, { grosor: 0.01 }); cap.geometry.userData.propia = true; cap.rotation.y = Math.PI / 4; cap.position.y = alto * (1 - f / 2) + 0.004; cap.scale.setScalar(1.01); g.add(cap);
    }
    // bloques caídos al pie
    for (let i = 0; i < 6; i++) { const b = caja(K, 0.12, 0.08, 0.1, i % 2 ? EG.caliza : EG.calizaD, { grosor: 0.006 }); b.position.set(-lado / 2 + 0.2 + i * 0.35, 0.04, lado / 2 + 0.12 + (i % 2) * 0.1); b.rotation.y = i; g.add(b); }
  }
  return g;
}
/* el templo funerario al pie de la cara este y la calzada que baja hacia el valle */
function temploFunerario(K, w, d) {
  const g = new THREE.Group();
  pon(g, caja(K, w, 0.28, d, EG.caliza, { grosor: 0.012 }), 0, 0.14, 0);
  pon(g, caja(K, w * 0.4, 0.3, 0.06, '#3a2a1c', { sinTinta: true }), 0, 0.14, d / 2 + 0.005);
  for (let i = 0; i < 6; i++) pon(g, caja(K, 0.06, 0.24, 0.06, EG.granito, { grosor: 0.005 }), -w / 2 + 0.15 + i * (w - 0.3) / 5, 0.12, d / 2 + 0.06);
  return g;
}

/* ---------- LA NECRÓPOLIS ---------- */
/* Devuelve { obj }. El origen: el centro del conjunto; el este (donde mira la Esfinge) es +z. */
export function necropolis(K, variante = VARIANTES.necropolis) {
  const g = new THREE.Group();
  if (variante === 'giza1500' || variante === 'gizahoy') {
    /* La disposición es la real, en miniatura: los tamaños a 1:80 y las distancias a 1:100 (x = este, z = sur).
       Keops al noreste, Kefrén en medio sobre su roca más alta, Micerino al suroeste con sus tres reinas en fila
       al sur (las dos del oeste quedaron escalonadas, sin revestir). Micerino tenía sus 16 hiladas de abajo
       revestidas de granito rojo de Asuán. Cada una con su templo al pie de la cara este y la calzada al valle. */
    const cas = variante === 'giza1500', S = 1 / 80, D = 1 / 100;
    const P = [[230, 146.6, 260, -300, 'jufu'], [215, 143.5, 0, 0, 'jafra'], [104, 65, -200, 330, 'menkaura']];
    P.forEach(([lado, alto, e, sur, id], i) => {
      const x = e * D, z = sur * D, L = lado * S, y0 = id === 'jafra' ? 0.12 : 0;
      const est = cas ? 'revestida' : id === 'jafra' ? 'kefren' : 'nucleo';
      const py = piramide(K, L, alto * S, est); py.position.set(x, y0, z); g.add(py);
      if (id === 'jafra') pon(g, caja(K, L + 0.5, 0.12, L + 0.5, EG.calizaD, { grosor: 0.01 }), x, 0.06, z);   // la roca más alta de Kefrén
      if (id === 'menkaura' && cas) {                  // el faldón de granito rojo
        const f = 0.28, gr = K.malla(tronco(L, L, L * (1 - f), L * (1 - f), alto * S * f), EG.granito, { grosor: 0.014 }); gr.geometry.userData.propia = true; gr.position.set(x, 0, z); gr.scale.setScalar(1.004); g.add(gr);
      }
      const t = temploFunerario(K, i === 2 ? 0.5 : 0.75, 0.42); t.position.set(x + L / 2 + 0.24, y0, z); t.rotation.y = Math.PI / 2; g.add(t);
      const cal = caja(K, 1.5, 0.05, 0.12, cas ? EG.turaD : EG.calizaD, { grosor: 0.005 }); cal.position.set(x + L / 2 + 1.2, 0.025, z + 0.18); cal.rotation.y = -0.22; g.add(cal);   // la calzada, hacia el valle
    });
    [[-1.2, 0], [-1.72, 1], [-2.24, 2]].forEach(([x, k]) => {                                     // las reinas de Micerino
      const L = 44 * S * (k ? 0.9 : 1), h = L * 0.62;
      if (k && cas) {                                  // escalonadas, como quedaron
        for (let n = 0; n < 4; n++) { const w = L * (1 - n * 0.22); pon(g, caja(K, w, h / 4, w, EG.caliza, { grosor: 0.008 }), x, h / 8 + n * h / 4, 4.55); }
      } else { const q = piramide(K, L, h, cas ? 'revestida' : 'nucleo'); q.position.set(x, 0, 4.55); g.add(q); }
    });
    } else {
    /* SAQQARA: la pirámide escalonada de Djoser, la primera gran obra de piedra (Imhotep, ~2650 a. C.), dentro de su
       recinto de muros con nichos. Imhotep, su arquitecto, era en el Reino Nuevo el patrono de los escribas: antes de
       escribir, derramaban una gota de agua para él. */
    const pasos = [[2.9, 2.5, 0.34], [2.5, 2.1, 0.32], [2.12, 1.74, 0.3], [1.76, 1.4, 0.28], [1.42, 1.08, 0.27], [1.1, 0.8, 0.25]];
    let y = 0;
    pasos.forEach(([w, d, h], i) => {
      const tex = hiladas(i % 2 ? EG.caliza : EG.calizaD, EG.calizaS, 5); tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(3, 1);
      const s = K.malla(tronco(w, d, w - 0.1, d - 0.1, h), K.matMapa(tex), { grosor: 0.016 }); s.geometry.userData.propia = true; s.position.y = y; g.add(s);
      y += h;
    });
    const muro = (w, d, x, z) => { pon(g, caja(K, w, 0.42, d, EG.tura, { grosor: 0.01 }), x, 0.21, z); };
    const W = 4.6, D = 3.6;
    muro(W, 0.1, 0, -D / 2); muro(0.1, D, -W / 2, 0); muro(0.1, D, W / 2, 0); muro(W * 0.42, 0.1, -W * 0.29, D / 2); muro(W * 0.42, 0.1, W * 0.29, D / 2);
    for (let i = 0; i < 22; i++) { const x = -W / 2 + 0.1 + i * (W - 0.2) / 21; if (Math.abs(x) < 0.45) continue; pon(g, caja(K, 0.06, 0.38, 0.03, EG.turaD, { sinTinta: true }), x, 0.21, D / 2 + 0.06); }   // los nichos: la fachada de palacio
    for (let i = 0; i < 12; i++) { const x = W / 2 + 0.06; pon(g, caja(K, 0.03, 0.38, 0.06, EG.turaD, { sinTinta: true }), x, 0.21, -D / 2 + 0.2 + i * (D - 0.4) / 11); }
    for (let i = 0; i < 14; i++) { const b = i < 7 ? -1 : 1, k = i % 7; pon(g, caja(K, 0.05, 0.42, 0.05, EG.tura, { grosor: 0.004 }), b * 0.35, 0.21, D / 2 - 0.1 - k * 0.1); }   // el portal de columnas
    pon(g, caja(K, 0.5, 0.18, 0.5, EG.caliza, { grosor: 0.008 }), 1.65, 0.09, -1.0);   // el patio del Heb-Sed
  }
  g.userData.ficha = { titulo: 'La necrópolis', texto: 'las casas de eternidad de los reyes: mil años antes de la Casa de la Vida' };
  return { obj: g };
}

/* ---------- LA GRAN ESFINGE ---------- */
/* 'pintada' (como la vio Tutmosis IV hacia 1400 a. C.: pintada, con barba y la Estela del Sueño entre las patas),
   'piedra' (la caliza desnuda, sin nariz, como la vemos hoy) o 'carneros' (la avenida de esfinges criocéfalas de Karnak) */
export function esfinge(K, variante = VARIANTES.esfinge) {
  const g = new THREE.Group();
  if (variante === 'carneros') {
    for (let fila = -1; fila <= 1; fila += 2) for (let i = 0; i < 3; i++) {
      const c = criosfinge(K); c.position.set(fila * 0.65, 0, -1 + i * 0.95); c.rotation.y = -fila * Math.PI / 2; g.add(c);
    }
    pon(g, caja(K, 0.9, 0.02, 3.4, EG.areniscaL, { sinTinta: true, sombra: false }), 0, 0.01, 0);   // el dromos, el camino procesional
    g.userData.ficha = { titulo: 'La avenida de esfinges', texto: 'carneros de Amón, cada uno protegiendo a un rey entre sus patas' };
    return g;
  }
  const pint = variante === 'pintada';
  const cuerpo = pint ? '#d9a760' : EG.caliza, cuerpoD = pint ? '#c28d4a' : EG.calizaD;
  // el recinto excavado en la roca: la plataforma y los muros bajos de la zanja
  pon(g, caja(K, 1.5, 0.08, 3.1, pint ? EG.areniscaL : EG.calizaD, { grosor: 0.008 }), 0, 0.04, 0);
  [-1, 1].forEach(l => pon(g, caja(K, 0.08, 0.2, 2.6, pint ? EG.arenisca : EG.calizaS, { grosor: 0.006 }), l * 0.72, 0.1, -0.2));
  const cu = new THREE.Group(); cu.position.y = 0.08; g.add(cu);
  pon(cu, caja(K, 0.56, 0.4, 1.5, cuerpo, { grosor: 0.016 }), 0, 0.26, -0.4);                    // el lomo
  const anca = K.malla(K.esfera(0.27), cuerpo, { grosor: 0.014 }); anca.scale.set(1.12, 0.95, 1.05); anca.position.set(0, 0.3, -1.02); cu.add(anca);   // la grupa
  [-1, 1].forEach(l => {
    const muslo = K.malla(K.esfera(0.2), cuerpoD, { grosor: 0.01 }); muslo.scale.set(0.42, 0.85, 1.3); muslo.position.set(l * 0.29, 0.2, -0.86); cu.add(muslo);   // las patas traseras plegadas
    pon(cu, caja(K, 0.12, 0.08, 0.24, cuerpo, { grosor: 0.006 }), l * 0.29, 0.04, -0.56);            // los pies traseros
    pon(cu, caja(K, 0.16, 0.32, 0.22, cuerpo, { grosor: 0.01 }), l * 0.2, 0.16, 0.38);              // los antebrazos
    pon(cu, caja(K, 0.16, 0.12, 0.86, cuerpo, { grosor: 0.012 }), l * 0.2, 0.06, 0.86);             // las patas delanteras, largas
    for (let d = 0; d < 3; d++) pon(cu, caja(K, 0.035, 0.07, 0.03, cuerpoD, { sinTinta: true }), l * 0.2 + (d - 1) * 0.05, 0.05, 1.29);
  });
  const cola = K.malla(K.capsula(0.025, 0.46, 0.6), cuerpoD, { grosor: 0.006 }); cola.rotation.x = Math.PI / 2; cola.position.set(0.33, 0.05, -0.62); cu.add(cola);
  pon(cu, caja(K, 0.5, 0.62, 0.34, cuerpo, { grosor: 0.014 }), 0, 0.31, 0.3);                    // el pecho
  const cab = cabezaReal(K, { pintada: pint, piedra: !pint, barba: pint, cara: pint ? EG.rojo : EG.calizaD, s: 1.3 });
  cab.position.set(0, 0.62, 0.34); cu.add(cab);
  if (pint) {
    // la Estela del Sueño de Tutmosis IV, entre las patas: granito rojo, arco arriba y el relato con su cartucho
    const est = new THREE.Group(); est.position.set(0, 0, 0.78); cu.add(est);
    pon(est, caja(K, 0.22, 0.34, 0.05, EG.granito, { grosor: 0.008 }), 0, 0.17, 0);
    const arco = K.malla(K.cilindro(0.11, 0.11, 0.05, 14), EG.granito, { grosor: 0.008 }); arco.rotation.x = Math.PI / 2; arco.position.y = 0.34; est.add(arco);
    const rel = lamina(K, panelJeroglifico({ w: 96, h: 128, fondo: '#c07a66', tinta: '#4a2018', cols: 3, texto: [JER.ankhDjedWas, JER.tutmosis[0], JER.ankhUdjaSeneb], grano: false }), 0.19, 0.3); rel.position.set(0, 0.2, 0.027); est.add(rel);
    // la ofrenda: la mesa con panes y el incensario
    pon(cu, caja(K, 0.16, 0.08, 0.1, EG.caliza, { grosor: 0.005 }), 0, 0.04, 1.08);
    pon(cu, K.malla(K.esfera(0.03), '#c8904a', { sinTinta: true }), -0.03, 0.1, 1.08); pon(cu, K.malla(K.esfera(0.03), '#b87a3a', { sinTinta: true }), 0.035, 0.1, 1.08);
  } else {
    for (let i = 0; i < 5; i++) pon(cu, caja(K, 0.52, 0.012, 0.01, EG.calizaS, { sinTinta: true }), 0, 0.1 + i * 0.1, 0.472);   // las capas de la roca, erosionadas en el pecho
    for (let i = 0; i < 4; i++) pon(cu, caja(K, 0.58, 0.012, 1.3, EG.calizaS, { sinTinta: true }), 0, 0.12 + i * 0.09, -0.4);
  }
  g.userData.ficha = { titulo: 'La Gran Esfinge', texto: pint ? 'pintada, con la Estela del Sueño de Tutmosis IV entre las patas' : 'tallada en la roca de la meseta: cuerpo de león, rostro de rey' };
  return g;
}
/* LA CABEZA DEL REY con el nemes: la comparten la esfinge y los colosos. El nemes es el paño de rayas que abre dos
   alas detrás del rostro y cae en dos bandas sobre el pecho; en la frente, la banda y la cobra (el ureo). op: { pintada,
   piedra (sin nariz), barba, cara (color), s (escala) }. El origen: la base del cuello; el frente, +z. */
export function cabezaReal(K, { pintada = true, piedra = false, barba = true, cara = EG.piel, s = 1 } = {}) {
  const g = new THREE.Group(); g.scale.setScalar(s);
  const rayas = pintada ? franjas([EG.ocre, EG.azul], 16) : franjas([EG.caliza, EG.calizaD], 12);
  const mat = K.matMapa(rayas), liso = pintada ? EG.ocre : EG.caliza;
  const t = (w0, d0, w1, d1, h, x, y, z) => { const m = K.malla(tronco(w0, d0, w1, d1, h), mat, { grosor: 0.01 }); m.geometry.userData.propia = true; m.position.set(x, y, z); g.add(m); return m; };
  t(0.46, 0.22, 0.3, 0.22, 0.3, 0, -0.04, -0.05);                   // las alas del nemes, anchas abajo
  t(0.3, 0.26, 0.23, 0.2, 0.1, 0, 0.26, -0.03);                     // la corona, plana arriba
  [-1, 1].forEach(l => { const b = t(0.08, 0.05, 0.07, 0.05, 0.3, l * 0.145, -0.34, 0.06); });   // las bandas que caen sobre el pecho
  pon(g, caja(K, 0.13, 0.22, 0.08, liso, { grosor: 0.006 }), 0, 0.04, -0.2);                     // la coleta de atrás
  pon(g, caja(K, 0.2, 0.25, 0.14, cara, { grosor: 0.01 }), 0, 0.125, 0.06);                      // el rostro
  pon(g, caja(K, 0.235, 0.03, 0.03, pintada ? EG.oro : EG.calizaD, { grosor: 0.004 }), 0, 0.255, 0.12);   // la banda de la frente
  [-1, 1].forEach(l => {
    pon(g, caja(K, 0.045, 0.02, 0.01, EG.negro, { sinTinta: true }), l * 0.048, 0.165, 0.131);   // los ojos
    if (pintada) { pon(g, caja(K, 0.065, 0.008, 0.01, EG.negro, { sinTinta: true }), l * 0.055, 0.19, 0.131); pon(g, caja(K, 0.02, 0.006, 0.01, EG.negro, { sinTinta: true }), l * 0.09, 0.158, 0.131); }   // la ceja y el trazo de kohl
    pon(g, caja(K, 0.035, 0.07, 0.05, cara, { grosor: 0.004 }), l * 0.118, 0.14, 0.04);            // las orejas, por fuera del paño
  });
  if (piedra) pon(g, caja(K, 0.035, 0.045, 0.01, '#9a8664', { sinTinta: true }), 0, 0.11, 0.131);   // el hueco de la nariz
  else pon(g, caja(K, 0.034, 0.06, 0.04, cara, { grosor: 0.004 }), 0, 0.11, 0.14);               // la nariz
  pon(g, caja(K, 0.075, 0.014, 0.01, pintada ? '#6e2a1c' : '#9a8664', { sinTinta: true }), 0, 0.055, 0.131);   // la boca
  const ureo = K.malla(K.capsula(0.016, 0.05, 0.5), pintada ? EG.oro : EG.calizaD, { grosor: 0.004 }); ureo.position.set(0, 0.29, 0.13); g.add(ureo);   // el ureo
  if (barba) { const b = K.malla(K.caja(0.05, 0.17, 0.05), K.matMapa(franjas([EG.azul, '#173c6e'], 8)), { grosor: 0.005 }); b.position.set(0, -0.08, 0.1); b.rotation.x = -0.12; g.add(b); }   // la barba ceremonial trenzada
  return g;
}
function criosfinge(K) {                               // el carnero de Amón sobre su pedestal, con un rey entre las patas
  const g = new THREE.Group();
  pon(g, caja(K, 0.36, 0.18, 0.78, EG.arenisca, { grosor: 0.01 }), 0, 0.09, 0);
  const c = new THREE.Group(); c.position.y = 0.18; g.add(c);
  pon(c, caja(K, 0.24, 0.2, 0.55, EG.areniscaL, { grosor: 0.01 }), 0, 0.12, -0.08);
  [-1, 1].forEach(l => pon(c, caja(K, 0.06, 0.06, 0.28, EG.areniscaL, { grosor: 0.006 }), l * 0.08, 0.03, 0.26));
  const cab = K.malla(K.capsula(0.08, 0.12, 0.6), EG.areniscaL, { grosor: 0.008 }); cab.rotation.x = 1.2; cab.position.set(0, 0.28, 0.24); c.add(cab);
  [-1, 1].forEach(l => { const cu = K.malla(K.toro(0.06, 0.02, Math.PI * 1.5, 0.5), EG.areniscaD, { grosor: 0.005 }); cu.position.set(l * 0.09, 0.3, 0.2); cu.rotation.y = l * Math.PI / 2; c.add(cu); });   // los cuernos enroscados
  const rey = K.malla(K.cilindro(0.035, 0.045, 0.18, 8), EG.areniscaD, { grosor: 0.005 }); rey.position.set(0, 0.09, 0.3); c.add(rey);
  return g;
}

/* ---------- LA CASA DE LA VIDA (Per Ankh), en sus etapas (niv 0 a 3; 'obra' = recién creada) ---------- */
/* 'pilono' (el templo de piedra: pilono con mástiles y banderolas, el patio de columnas papiriformes y la sala de los
   escribas), 'amarna' (la casa de adobe blanqueado junto al templo, como la de Amarna, cuyos ladrillos llevaban sellado
   «Casa de la Vida») o 'hipostila' (la sala de columnas abierta, donde la clase se sienta a la sombra) */
export function casaVida(K, niv = 3, variante = VARIANTES.casa) {
  const g = new THREE.Group();
  if (variante === 'pilono') {
    /* el pilono al frente; el patio abierto con sus dos pórticos de columnas papiriformes; al fondo, la fachada de la
       sala de los escribas con el nombre de la casa sobre la puerta; Thot en el patio */
    const n = typeof niv === 'number' ? niv : 0;
    const pil = pilono(K, { banderas: n >= 1 }); pil.position.z = 1.05; g.add(pil);
    pon(g, caja(K, 3.0, 0.04, 1.6, EG.areniscaL, { sinTinta: true, sombra: false }), 0, 0.02, -0.02);   // el enlosado
    [-1, 1].forEach(l => pon(g, caja(K, 0.12, 0.5, 1.62, EG.arenisca, { grosor: 0.01 }), l * 1.5, 0.25, -0.02));   // los muros del patio
    const cols = [0, 2, 3, 3][n];
    [-1, 1].forEach(l => {
      for (let i = 0; i < cols; i++) { const c = columnaPapiro(K, 0.95); c.position.set(l * 1.12, 0.04, 0.5 - i * 0.5); g.add(c); }
      if (cols) { pon(g, caja(K, 0.18, 0.1, 1.45, EG.arenisca, { grosor: 0.01 }), l * 1.12, 1.0, -0.02); const f = lamina(K, friso(JER.ankhDjedWas, { w: 1024, h: 48 }), 1.4, 0.08); f.position.set(l * 1.12 - l * 0.092, 1.0, -0.02); f.rotation.y = -l * Math.PI / 2; g.add(f); }   // el arquitrabe con su friso
    });
    const sala = new THREE.Group(); sala.position.z = -1.12; g.add(sala);
    const HS = n >= 2 ? 1.15 : 0.9;
    pon(sala, caja(K, 3.12, HS, 0.5, EG.arenisca, { grosor: 0.014 }), 0, HS / 2, 0);
    const gs = gola(K, 3.14, 0.52); gs.position.y = HS; sala.add(gs);
    pon(sala, caja(K, 0.32, 0.62, 0.04, '#3a2a1c', { sinTinta: true }), 0, 0.31, 0.25);
    const rot = lamina(K, friso(JER.perAnkh + JER.ankhDjedWas, { fondo: EG.azul, colores: [EG.ocre, EG.lino] }), 2.2, 0.12); rot.position.set(0, HS - 0.2, 0.252); sala.add(rot);   // «Casa de la Vida» sobre la puerta
    [-1, 1].forEach(l => { const r = lamina(K, escenaOfrenda({ espejo: l > 0 }), 0.62, 0.84); r.position.set(l * 0.85, 0.46, 0.252); r.scale.setScalar(n >= 2 ? 1 : 0.8); sala.add(r); });
    if (n >= 3) {                                      // la estatua de Thot, señor de la escritura, y la mesa de ofrendas
      const thot = new THREE.Group(); thot.position.set(-0.55, 0.04, -0.55); g.add(thot);
      pon(thot, caja(K, 0.28, 0.2, 0.28, EG.granito, { grosor: 0.008 }), 0, 0.1, 0);
      pon(thot, K.malla(K.cilindro(0.06, 0.09, 0.4, 10), EG.lino, { grosor: 0.006 }), 0, 0.4, 0);   // el cuerpo con su faldellín
      pon(thot, caja(K, 0.12, 0.08, 0.08, EG.piel, { grosor: 0.004 }), 0, 0.62, 0);
      pon(thot, K.malla(K.esfera(0.055), EG.negro, { grosor: 0.004 }), 0, 0.7, 0);                   // la cabeza de ibis
      const pico = K.malla(K.capsula(0.012, 0.13, 0.5), EG.negro, { grosor: 0.003 }); pico.rotation.x = 2.0; pico.position.set(0, 0.66, 0.08); thot.add(pico);
      pon(thot, K.malla(K.cilindro(0.05, 0.05, 0.015, 14), EG.oro, { emissive: EG.oro, emissiveIntensity: 0.3, grosor: 0.004 }), 0, 0.79, 0).rotation.x = Math.PI / 2;   // el disco lunar
      pon(g, caja(K, 0.22, 0.12, 0.14, EG.caliza, { grosor: 0.005 }), -0.55, 0.1, -0.2);
    }
    } else if (variante === 'amarna') {
    const H = niv === 'obra' ? 0.2 : 0.78;
    const casa = new THREE.Group(); g.add(casa);
    pon(casa, caja(K, 2.4, H, 1.5, EG.cal, { grosor: 0.014 }), 0, H / 2, -0.35);
    pon(casa, caja(K, 2.45, 0.06, 1.55, EG.calD, { grosor: 0.01 }), 0, H + 0.03, -0.35);
    // el pórtico: columnas de madera pintadas con capiteles de loto, y el alero
    for (let i = 0; i < 5; i++) { const c = columnaLoto(K, H); c.position.set(-1.0 + i * 0.5, 0, 0.55); casa.add(c); }
    pon(casa, caja(K, 2.4, 0.06, 0.5, EG.cedro, { grosor: 0.008 }), 0, H + 0.03, 0.4);
    pon(casa, caja(K, 2.4, 0.05, 0.9, '#d8cbb0', { sinTinta: true, sombra: false }), 0, 0.025, 0.4);
    const friso = lamina(K, franjas([EG.azul, EG.rojo, EG.verde, EG.ocre, EG.lino], 10, true), 2.4, 0.06); friso.position.set(0, H - 0.05, 0.41); casa.add(friso);
    const puerta = caja(K, 0.34, 0.55, 0.03, '#3a2a1c', { sinTinta: true }); puerta.position.set(0, 0.275, 0.405); casa.add(puerta);
    const sello = lamina(K, panelJeroglifico({ w: 96, h: 48, fondo: EG.adobe, tinta: '#5a3a22', cols: 1, texto: JER.perAnkh, grano: false }), 0.26, 0.13); sello.position.set(0.55, 0.3, 0.406); casa.add(sello);   // el ladrillo sellado «Casa de la Vida»
    for (let i = 0; i < 4; i++) pon(casa, caja(K, 0.14, 0.14, 0.03, '#3a2a1c', { sinTinta: true }), -0.95 + i * 0.63 + (i > 1 ? 0.3 : 0), H * 0.72, 0.405);   // las ventanas altas
    // el estanque con lotos y las palmeras del jardín
    const est = caja(K, 0.9, 0.04, 0.5, '#4f86a8', { sinTinta: true }); est.position.set(-0.6, 0.02, 1.25); g.add(est);
    for (let i = 0; i < 4; i++) pon(g, K.malla(K.cilindro(0.05, 0.05, 0.01, 8), EG.verde, { sinTinta: true }), -0.9 + i * 0.2, 0.05, 1.2 + (i % 2) * 0.1);
    if (niv === 'obra') for (let i = 0; i < 12; i++) pon(g, caja(K, 0.16, 0.06, 0.1, EG.adobe, { grosor: 0.004 }), 0.8 + (i % 3) * 0.17, 0.03 + Math.floor(i / 3) * 0.06, 1.1);
  } else {
    /* LA SALA HIPÓSTILA: un bosque de columnas de papiro abierto; arquitrabes con un friso de jeroglíficos; el techo
       de losas con su gola cubre las dos naves del fondo, y la del frente queda abierta al sol */
    const n = typeof niv === 'number' ? niv : 0, cols = [2, 3, 4, 4][n];
    pon(g, caja(K, 2.7, 0.1, 2.2, EG.areniscaD, { grosor: 0.01 }), 0, 0.05, -0.1);
    const X = i => -1.05 + i * (2.1 / Math.max(1, cols - 1));
    for (let f = 0; f < 3; f++) for (let i = 0; i < cols; i++) { const c = columnaPapiro(K, 1.2, true, 1.35); c.position.set(X(i), 0.1, -0.85 + f * 0.72); g.add(c); }
    for (let f = 0; f < 3; f++) {
      const z = -0.85 + f * 0.72;
      pon(g, caja(K, 2.45, 0.14, 0.2, EG.arenisca, { grosor: 0.01 }), 0, 1.37, z);
      const t = lamina(K, friso(JER.ankhDjedWas + JER.hotep + JER.ankhUdjaSeneb, { w: 1024, h: 48 }), 2.4, 0.11); t.position.set(0, 1.37, z + 0.102); g.add(t);
    }
    pon(g, caja(K, 2.7, 1.2, 0.1, EG.arenisca, { grosor: 0.012 }), 0, 0.7, -1.18);                  // el muro del fondo
    if (n >= 2) {
      pon(g, caja(K, 2.6, 0.08, 1.12, EG.arenisca, { grosor: 0.012 }), 0, 1.48, -0.78);            // el techo de losas
      const gt = gola(K, 2.62, 1.14); gt.position.set(0, 1.52, -0.78); g.add(gt);
    }
    if (n >= 3) [-1, 1].forEach(l => { const e = escenaOfrenda({ espejo: l > 0 }), r = lamina(K, e, 0.7, 0.95); r.position.set(l * 0.72, 0.62, -1.128); g.add(r); });
  }
  g.userData.ficha = { titulo: 'La Casa de la Vida', texto: 'Per Ankh: donde se copian y se guardan los libros, y se forman los escribas' };
  return g;
}
function estrellado() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 96; const g = c.getContext('2d');
  g.fillStyle = '#1f4f96'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#f0c95a';
  for (let y = 8; y < 96; y += 16) for (let x = (y % 32 ? 8 : 16); x < 128; x += 16) { g.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5, r = k % 2 ? 1.6 : 4; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.propia = true; return t;
}
/* la columna papiriforme: fuste con bandas, y capitel de papiro cerrado (capullo) o abierto (campaniforme) */
export function columnaPapiro(K, alto, abierto = false, grueso = 1) {
  const g = new THREE.Group(), r = 0.075 * (alto / 0.95) * grueso;
  pon(g, K.malla(K.cilindro(r * 1.35, r * 1.4, 0.05, 12), EG.areniscaD, { grosor: 0.006 }), 0, 0.025, 0);
  pon(g, K.malla(K.cilindro(r * 0.9, r * 1.1, alto * 0.78, 12), EG.areniscaL, { grosor: 0.008 }), 0, 0.05 + alto * 0.39, 0);
  for (let b = 0; b < 5; b++) pon(g, K.malla(K.cilindro(r * 0.93, r * 0.93, 0.022, 12), b % 2 ? EG.azul : EG.rojo, { sinTinta: true }), 0, alto * 0.78 - b * 0.03, 0);
  const cap = abierto ? K.malla(K.cilindro(r * 2.1, r * 1.0, alto * 0.18, 14), EG.verde, { grosor: 0.008 }) : K.malla(K.esfera(r * 1.4), EG.verde, { grosor: 0.008 });
  if (!abierto) cap.scale.set(1, 1.35, 1);
  cap.position.y = alto * 0.87; g.add(cap);
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, h = K.malla(K.cono(r * 0.38, alto * 0.09, 3), k % 2 ? EG.verdeL : EG.azul, { sinTinta: true }); h.position.set(Math.cos(a) * r * 1.0, alto * 0.8 + alto * 0.045, Math.sin(a) * r * 1.0); g.add(h); }   // los sépalos pintados al pie del capitel
  pon(g, K.malla(K.caja(r * (abierto ? 1.5 : 2.2), 0.05, r * (abierto ? 1.5 : 2.2)), EG.arenisca, { grosor: 0.005 }), 0, alto * 0.97, 0);   // el ábaco
  return g;
}
function columnaLoto(K, alto) {
  const g = new THREE.Group(), r = 0.05;
  pon(g, K.malla(K.cilindro(r, r * 1.1, alto * 0.85, 10), EG.rojo, { grosor: 0.006 }), 0, alto * 0.425, 0);
  const cap = K.malla(K.cilindro(r * 1.9, r * 0.9, alto * 0.14, 8), EG.verde, { grosor: 0.006 }); cap.position.y = alto * 0.92; g.add(cap);
  for (let k = 0; k < 4; k++) { const p = K.malla(K.cono(0.03, 0.08, 4), EG.azul, { sinTinta: true }); p.position.set(Math.cos(k * Math.PI / 2) * r * 1.5, alto * 0.95, Math.sin(k * Math.PI / 2) * r * 1.5); g.add(p); }
  return g;
}
/* la gola egipcia: la cornisa curva que corona todo muro de templo */
function gola(K, w, d) {
  const g = new THREE.Group();
  pon(g, caja(K, w, 0.05, d, EG.areniscaD, { grosor: 0.008 }), 0, 0.025, 0);                     // el toro
  const c = K.malla(tronco(w, d, w + 0.12, d + 0.12, 0.13), EG.arenisca, { grosor: 0.01 }); c.geometry.userData.propia = true; c.position.y = 0.05; g.add(c);
  const f = lamina(K, franjas([EG.azul, EG.arenisca, EG.rojo, EG.arenisca, EG.verde, EG.arenisca], 24, true), w + 0.06, 0.1); f.position.set(0, 0.11, d / 2 + 0.035); f.rotation.x = -0.35; g.add(f);   // las hojas pintadas de la gola
  return g;
}
/* el pilono: dos torres en talud con su gola y el toro de las esquinas, las ranuras de los mástiles de cedro con sus
   banderolas, el relieve de la ofrenda en cada torre (en espejo: los dos reyes miran hacia la puerta) y la puerta, más
   baja, con el disco solar alado sobre el dintel y columnas de jeroglíficos en las jambas. */
export function pilono(K, { banderas = true, H = 1.6, W = 1.45, D = 0.62 } = {}) {
  const g = new THREE.Group(), PU = 0.8, inc = 0.12 / 2 / H;
  [-1, 1].forEach(l => {
    const t = new THREE.Group(); t.position.x = l * (PU / 2 + W / 2 - 0.1); g.add(t);
    const cu = K.malla(tronco(W, D, W - 0.26, D - 0.12, H), EG.arenisca, { grosor: 0.016 }); cu.geometry.userData.propia = true; t.add(cu);
    const gl = gola(K, W - 0.22, D - 0.1); gl.position.y = H; t.add(gl);
    [-1, 1].forEach(e => { const tr = K.malla(K.cilindro(0.028, 0.028, H, 6), EG.areniscaD, { grosor: 0.004 }); tr.position.set(e * (W / 2 - 0.08), H / 2, D / 2 - 0.035); tr.rotation.z = e * 0.13 / 2 / H * 2; tr.rotation.x = -inc; t.add(tr); });   // el toro de las esquinas
    const rel = lamina(K, escenaOfrenda({ espejo: l < 0 }), W * 0.5, H * 0.56);
    rel.position.set(l * 0.12, H * 0.42, D / 2 - inc * H * 0.42 + 0.006); rel.rotation.x = -inc; t.add(rel);
    const xs = [-l * 0.5, -l * 0.3];                     // las dos ranuras, del lado de la puerta
    xs.forEach((x, k) => {
      pon(t, caja(K, 0.07, H - 0.12, 0.012, '#8c6a42', { sinTinta: true }), x, (H - 0.12) / 2, D / 2 - inc * H / 2 + 0.004).rotation.x = -inc;
      if (!banderas) return;
      const m = K.malla(K.cilindro(0.022, 0.032, H + 0.75, 6), EG.cedro, { grosor: 0.005 }); m.position.set(x, (H + 0.75) / 2, D / 2 + 0.05); t.add(m);
      [0.4, 0.9, 1.35].forEach(y => pon(t, caja(K, 0.09, 0.03, 0.1, EG.cedroD, { sinTinta: true }), x, y, D / 2 + 0.03));   // las grapas
      const b = new THREE.Group(); b.position.set(x, H + 0.7, D / 2 + 0.05); b.userData.vivo = true; b.userData.banderola = true; t.add(b);
      const tela = K.malla(banderola(), k ? EG.verde : EG.rojo, { side: THREE.DoubleSide, sinTinta: true }); tela.rotation.y = 2.4; b.add(tela);   // todas ondean hacia el mismo lado: el viento del norte
    });
  });
  const pu = new THREE.Group(); g.add(pu);                                              // la puerta, más baja, con su propia gola
  pon(pu, caja(K, PU, 1.22, D + 0.06, EG.arenisca, { grosor: 0.014 }), 0, 0.61, 0);
  const gp = gola(K, PU + 0.06, D + 0.1); gp.position.y = 1.22; pu.add(gp);
  pon(pu, caja(K, 0.34, 0.86, 0.04, '#3a2a1c', { sinTinta: true }), 0, 0.43, D / 2 + 0.02);
  [-1, 1].forEach(l => { const j = lamina(K, panelJeroglifico({ w: 32, h: 192, fondo: EG.areniscaL, cols: 1, texto: JER.ankhDjedWas + JER.perAnkh, filas: 6, colores: [EG.azul, EG.rojo, EG.verde], grano: false }), 0.14, 0.82); j.position.set(l * 0.26, 0.45, D / 2 + 0.032); pu.add(j); });   // las jambas
  const disco = new THREE.Group(); disco.position.set(0, 1.04, D / 2 + 0.035); pu.add(disco);    // el disco solar alado de Behdet
  pon(disco, K.malla(K.cilindro(0.07, 0.07, 0.02, 16), EG.rojo, { grosor: 0.004 }), 0, 0, 0).rotation.x = Math.PI / 2;
  [-1, 1].forEach(l => { const a = caja(K, 0.28, 0.08, 0.015, EG.azul, { grosor: 0.004 }); a.position.set(l * 0.2, 0.005, 0); a.rotation.z = -l * 0.1; disco.add(a); const a2 = caja(K, 0.22, 0.035, 0.016, EG.verde, { sinTinta: true }); a2.position.set(l * 0.17, -0.04, 0.004); a2.rotation.z = -l * 0.1; disco.add(a2); });
  [-1, 1].forEach(l => pon(disco, K.malla(K.capsula(0.012, 0.045, 0.5), EG.oro, { sinTinta: true }), l * 0.085, -0.02, 0.012));   // las dos cobras
  g.userData.ficha = { titulo: 'El pilono', texto: 'la puerta del templo: dos montañas y el sol que nace entre ellas' };
  return g;
}

/* ---------- LA ENTRADA DEL TEMPLO ---------- */
/* 'colosos' (dos reyes sentados, pintados, como los de Abu Simbel o los de Memnón), 'obeliscos' (el par de granito rojo
   de Asuán con el piramidión de oro, como los de Hatshepsut) o 'luxor' (los dos: los reyes a la puerta y los obeliscos
   delante, como en el templo de Luxor y como en el Egipto del 2D) */
export function entrada(K, variante = VARIANTES.entrada) {
  const g = new THREE.Group();
  if (variante === 'colosos') [-1, 1].forEach(l => { const c = coloso(K); c.position.x = l * 0.75; g.add(c); });
  else if (variante === 'obeliscos') [-1, 1].forEach(l => { const o = obelisco(K, 2.7); o.position.x = l * 0.7; g.add(o); });
  else if (variante === 'luxor') [-1, 1].forEach(l => {   // como en Luxor: los reyes sentados a la puerta y los obeliscos delante
    const c = coloso(K); c.position.set(l * 0.8, 0, -0.45); g.add(c);
    const o = obelisco(K, 2.5); o.position.set(l * 0.55, 0, 0.75); g.add(o);
  });
  else return esfinge(K, 'carneros');
  return g;
}
export function obelisco(K, alto = 2.6) {
  const g = new THREE.Group(), b = 0.26 * (alto / 2.6);
  pon(g, caja(K, b * 1.9, 0.14, b * 1.9, EG.granitoD, { grosor: 0.01 }), 0, 0.07, 0);
  const f = K.malla(tronco(b, b, b * 0.66, b * 0.66, alto * 0.9), EG.granito, { grosor: 0.012 }); f.geometry.userData.propia = true; f.position.y = 0.14; g.add(f);
  const cara = lamina(K, panelJeroglifico({ w: 48, h: 512, fondo: EG.granito, tinta: '#5a2418', cols: 1, texto: JER.ankhDjedWas + JER.tutmosis[0] + JER.ra + JER.neter + JER.hotep + JER.ankhUdjaSeneb, filas: 14, grano: false }), b * 0.6, alto * 0.84);
  cara.position.set(0, 0.14 + alto * 0.44, b * 0.42 + 0.004); cara.rotation.x = -Math.atan((b - b * 0.66) / 2 / (alto * 0.9)); g.add(cara);
  const cara2 = cara.clone(); cara2.rotation.set(0, Math.PI / 2, 0); cara2.rotateX(-Math.atan((b - b * 0.66) / 2 / (alto * 0.9))); cara2.position.set(b * 0.42 + 0.004, 0.14 + alto * 0.44, 0); g.add(cara2);
  const pyr = K.malla(new THREE.ConeGeometry(b * 0.66 / Math.SQRT2, alto * 0.1, 4), EG.oro, { emissive: EG.oro, emissiveIntensity: 0.3, grosor: 0.008 }); pyr.geometry.userData.propia = true; pyr.rotation.y = Math.PI / 4; pyr.position.y = 0.14 + alto * 0.95; g.add(pyr);
  g.userData.ficha = { titulo: 'El obelisco', texto: 'granito rojo de Asuán, de una sola pieza, con la punta de oro: el primer rayo del sol' };
  return g;
}
/* el coloso sentado: trono con el signo de la unión de las Dos Tierras, faldellín de lino plisado con su delantal, collar
   ancho, nemes y barba; la piel en ocre rojo, como la pintaban. Las manos, planas sobre las rodillas. */
export function coloso(K) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.72, 0.18, 0.98, EG.areniscaD, { grosor: 0.012 }), 0, 0.09, 0);                 // la basa
  const tr = new THREE.Group(); tr.position.y = 0.18; g.add(tr);
  pon(tr, caja(K, 0.58, 0.62, 0.64, EG.arenisca, { grosor: 0.014 }), 0, 0.31, -0.1);              // el trono
  const sema = lamina(K, panelJeroglifico({ w: 64, h: 64, fondo: EG.arenisca, tinta: EG.azul, cols: 1, texto: JER.semaTauy, grano: false }), 0.34, 0.34);
  sema.position.set(0.291, 0.31, -0.1); sema.rotation.y = Math.PI / 2; tr.add(sema);               // el sema-tauy en el costado
  const nom = lamina(K, panelJeroglifico({ w: 48, h: 160, fondo: EG.arenisca, tinta: EG.azul, cols: 1, texto: JER.tutmosis[0], cartucho: true, grano: false }), 0.14, 0.48);
  nom.position.set(0.24, 0.9, -0.349); tr.add(nom);
  pon(tr, caja(K, 0.52, 1.0, 0.12, EG.arenisca, { grosor: 0.012 }), 0, 1.12, -0.36);             // el pilar de la espalda
  [-1, 1].forEach(l => {
    const pierna = K.malla(K.cilindro(0.06, 0.052, 0.54, 10), EG.piel, { grosor: 0.008 }); pierna.position.set(l * 0.1, 0.33, 0.34); tr.add(pierna);   // las canillas
    pon(tr, caja(K, 0.11, 0.06, 0.22, EG.piel, { grosor: 0.006 }), l * 0.1, 0.03, 0.4);            // los pies
    pon(tr, caja(K, 0.15, 0.14, 0.46, EG.piel, { grosor: 0.008 }), l * 0.1, 0.67, 0.14);           // los muslos
    pon(tr, caja(K, 0.09, 0.3, 0.1, EG.piel, { grosor: 0.008 }), l * 0.26, 1.0, -0.04);           // los brazos
    pon(tr, caja(K, 0.085, 0.07, 0.34, EG.piel, { grosor: 0.006 }), l * 0.19, 0.78, 0.14);         // los antebrazos sobre los muslos
    pon(tr, caja(K, 0.09, 0.04, 0.12, EG.piel, { grosor: 0.005 }), l * 0.17, 0.76, 0.34);          // las manos
  });
  const falda = K.malla(K.caja(0.36, 0.2, 0.5), K.matMapa(franjas([EG.lino, '#e4dccb'], 14, true)), { grosor: 0.008 }); falda.position.set(0, 0.7, 0.1); tr.add(falda);   // el faldellín plisado
  pon(tr, caja(K, 0.12, 0.3, 0.02, EG.oro, { grosor: 0.004 }), 0, 0.56, 0.355);                  // el delantal
  pon(tr, caja(K, 0.36, 0.05, 0.24, EG.oro, { grosor: 0.005 }), 0, 0.83, 0.0);                   // el cinturón
  const torso = K.malla(tronco(0.28, 0.2, 0.46, 0.24, 0.42), EG.piel, { grosor: 0.012 }); torso.geometry.userData.propia = true; torso.position.set(0, 0.85, -0.04); tr.add(torso);
  const collar = collarAncho(K, 0.19); collar.position.set(0, 1.26, 0.082); collar.rotation.x = -0.05; tr.add(collar);
  const cab = cabezaReal(K, { pintada: true, barba: true, cara: EG.piel, s: 0.95 }); cab.position.set(0, 1.27, -0.04); tr.add(cab);
  g.userData.ficha = { titulo: 'El coloso del rey', texto: 'sentado a la puerta, pintado como lo pintaban: el rey guarda la casa del saber' };
  return g;
}
