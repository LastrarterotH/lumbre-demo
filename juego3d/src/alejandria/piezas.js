/* ============================================================
   alejandria/piezas
   Los seis saberes de Alejandría en 3D, cada uno con sus etapas (la máxima del proyecto: subir de nivel se VE, con
   piezas nuevas; se audita por diff de píxeles en juego3d/qa.html): el Museo (39), los rollos de los barcos (40),
   los Pínakes (41), los Elementos (42), la sombra de Eratóstenes (43) y el códice (44). Más lo que está desde la
   llegada: la Biblioteca (la sala de los rollos junto al puerto), el muelle de piedra y la barca de los hombres del
   rey; y las lámparas de la noche. Las anclas de la lógica son las del motor (09c-alejandria).
   Cada pieza devuelve { obj, anim, ancla, toc, actores } como las de las otras épocas (src/piezas.js).
   ============================================================ */
import * as THREE from 'three';
import { pieza, actor, texturaCanvas } from '../piezas.js';
import { AT, columnaDorica, tejado, entablamento } from '../agora/monumentos.js';
import * as L from './lugares.js';
import { AL, nichos, rolloSuelto, capsa, armilar, columnaCorintia, museo as museoMon, VARIANTES } from './monumentos.js';

const ubic = (m, x, y, z, rx = 0, ry = 0, rz = 0) => { m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx, ry, rz); return m; };
const caja = (K, w, h, d, color, o) => K.malla(K.caja(w, h, d), color, o);
const en = (P, obj, x, y, h = 0, ry = 0) => { obj.position.copy(P.en(x, y)); obj.position.y += h; obj.rotation.y = ry; P.obj.add(obj); return obj; };
const plano = (K, tex, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), K.matMapa(tex)); m.geometry.userData.propia = true; m.castShadow = true; return m; };

export const ANCLAS = {
  museo: { x: L.MUSEO.x, y: L.MUSEO.y }, rollos: { x: L.MUELLE.x + 0.75, y: L.MUELLE.y + 0.55 }, pinakes: { x: L.BIBLIOTECA.x, y: L.BIBLIOTECA.y + 1.4 },
  elementos: { x: 11.55, y: 11.0 }, sombra: { x: L.VARA.x, y: L.VARA.y }, codice: { x: 8.75, y: 7.85 },
};
export const BIBLIOTECA = { x: L.BIBLIOTECA.x, y: L.BIBLIOTECA.y, w: 2.0, d: 1.3 };
/* los estudiantes del Museo: griegos de quitón claro, egipcios de lino con la cabeza rapada y judíos del barrio del
   este con su manto; muchachos y jóvenes, y alguna muchacha (⚖️ pocas: Hipatia fue la excepción que se recuerda) */
export function aprendiz(i, extra = {}) {
  const egipcio = i % 4 === 1, chica = i % 7 === 3;
  return { edad: i % 3 === 0 ? 'nino' : undefined, piel: egipcio ? 3 : [0, 1, 2][i % 3], pelo: egipcio ? 'rapado' : chica ? 'moño' : ['corto', 'rizos'][i % 2],
    colorPelo: ['#3a2a1e', '#5a4632', '#2a1f18'][i % 3], ropa: chica ? 'tunica' : egipcio ? 'corta' : 'tunica', colorRopa: egipcio ? '#f2ead2' : ['#f1ebdc', '#e9e0cb', '#efe6d4'][i % 3],
    orla: ['#3f6b8a', AL.ocre, '#7a4a6e'][i % 3], sinFlecos: true, ...extra };
}
/* los maestros: quitón largo y el himatión cruzado; la barba recortada del sabio */
export const MAESTRO = { piel: 1, pelo: 'rizos', colorPelo: '#4a3a2c', barba: true, ropa: 'tunica', colorRopa: '#f1ebdc', orla: '#3f6b8a', chal: '#3f6b8a' };
export const ERATOSTENES = { piel: 1, pelo: 'corto', colorPelo: '#cfc8b8', barba: '#cfc8b8', ropa: 'tunica', colorRopa: '#efe7d2', orla: '#3a6a8a', chal: '#3a6a8a' };
export const HIPATIA = { piel: 1, pelo: 'moño', colorPelo: '#2e2620', ropa: 'tunica', colorRopa: '#e9e2d2', orla: '#c9a24a', chal: '#3d4a5e' };

/* una mesa de madera con sus patas */
function mesa(K, w = 0.6, d = 0.34, h = 0.3) {
  const g = new THREE.Group();
  g.add(ubic(caja(K, w, 0.03, d, AL.madera, { grosor: 0.004 }), 0, h, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(ubic(K.malla(K.cilindro(0.014, 0.014, h, 5), AL.maderaD, { grosor: 0.003 }), a * (w / 2 - 0.04), h / 2, b * (d / 2 - 0.04))));
  return g;
}
function cesta(K, rollos = 6, etiquetas = false) {
  const g = new THREE.Group();
  g.add(ubic(K.malla(K.cilindro(0.11, 0.09, 0.12, 10), '#b9945a', { grosor: 0.004 }), 0, 0.06, 0));
  for (let k = 0; k < rollos; k++) {
    const a = k * 1.1, r = K.malla(K.cilindro(0.018, 0.018, 0.2, 6), k % 2 ? AL.rollo : AL.rolloD, { grosor: 0.002 });
    r.position.set(Math.cos(a) * 0.05, 0.12, Math.sin(a) * 0.05); r.rotation.set(Math.sin(a) * 0.3, 0, Math.cos(a) * 0.3); g.add(r);
    if (etiquetas) g.add(ubic(caja(K, 0.025, 0.04, 0.004, [AL.etiqueta, AL.ocre, AL.pintado][k % 3], { sinTinta: true }), Math.cos(a) * 0.075, 0.19, Math.sin(a) * 0.075, 0, a, 0));
  }
  return g;
}
/* un armario de madera con nichos de rollos, abierto al frente (+z) */
function armario(K, w = 0.6, h = 0.62, d = 0.2, cols = 3, filas = 3) {
  const g = new THREE.Group();
  g.add(ubic(caja(K, w, h, d, AL.maderaD, { grosor: 0.005 }), 0, h / 2, 0));
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.04, h - 0.06), nichos(K, cols, filas)); f.geometry.userData.propia = true; f.position.set(0, h / 2, d / 2 + 0.003); g.add(f);
  g.add(ubic(caja(K, w + 0.04, 0.04, d + 0.04, AL.madera, { grosor: 0.004 }), 0, h + 0.02, 0));
  return g;
}

/* ---------- LO QUE ESTÁ DESDE LA LLEGADA ---------- */
/* LA BIBLIOTECA: la sala de los rollos junto al puerto. Un pórtico dórico al frente (mira a +z, a la vía Canópica),
   la sala detrás con su techo de tejas y las ventanas altas; por la puerta abierta se ven los armarios. */
export function biblioteca(K) {
  const g = new THREE.Group(), { w, d } = BIBLIOTECA, H = 0.78;
  g.add(ubic(caja(K, w + 0.12, 0.1, d + 0.5, AL.calizaD, { grosor: 0.006 }), 0, 0.05, 0.2));
  g.add(ubic(caja(K, w, H, d - 0.35, AL.caliza, { grosor: 0.008 }), 0, 0.1 + H / 2, -0.17));
  for (let k = 0; k < 4; k++) g.add(ubic(caja(K, 0.16, 0.12, 0.02, '#3e3226', { sinTinta: true }), -0.6 + k * 0.4, 0.1 + H * 0.82, (d - 0.35) / 2 - 0.17 + 0.006));   // las ventanas altas
  /* la puerta grande, abierta: adentro, los armarios llenos */
  g.add(ubic(caja(K, 0.46, 0.5, 0.012, '#2e251c', { sinTinta: true }), 0, 0.35, (d - 0.35) / 2 - 0.17 + 0.007));
  const adentro = armario(K, 0.4, 0.4, 0.04, 2, 2); adentro.position.set(0, 0.11, (d - 0.35) / 2 - 0.17 - 0.02); g.add(adentro);
  /* el pórtico: seis columnas dóricas */
  for (let i = 0; i < 6; i++) { const c = columnaDorica(K, 0.6, 0.045, { color: AL.calizaL, gr: 0.003 }); c.position.set(-w / 2 + 0.12 + i * (w - 0.24) / 5, 0.1, d / 2 + 0.05); g.add(c); }
  g.add(ubic(caja(K, w + 0.06, 0.07, 0.42, AL.calizaL, { grosor: 0.004 }), 0, 0.73, d / 2 - 0.12));
  const te = tejado(K, d + 0.16, w + 0.12, 0.2, { tipo: 'teja', tema: 'musas', gr: 0.004 }); te.rotation.y = Math.PI / 2; te.position.set(0, 0.1 + H, -0.05); g.add(te);
  /* la inscripción: ΒΙΒΛΙΟΘΗΚΗ («la caja de los libros») */
  const c = document.createElement('canvas'); c.width = 256; c.height = 40; const cg = c.getContext('2d');
  cg.fillStyle = AL.calizaL; cg.fillRect(0, 0, 256, 40); cg.fillStyle = '#5a4a36'; cg.font = '600 24px Georgia, serif'; cg.textAlign = 'center'; cg.textBaseline = 'middle'; cg.fillText('ΒΙΒΛΙΟΘΗΚΗ', 128, 21);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.userData.propia = true;
  const ins = plano(K, tx, 0.9, 0.12); ins.position.set(0, 0.735, d / 2 + 0.095); g.add(ins);
  g.userData.ficha = { titulo: 'La Biblioteca', texto: 'la sala de los rollos, junto al puerto' };
  return g;
}
/* EL MUELLE de piedra del Gran Puerto: el espigón que entra al agua, con sus bolardos y los aros de amarre */
export function muelle(K) {
  const g = new THREE.Group(), L = 2.5, A = 0.7;           // del arranque en tierra (z = 0) hasta la punta, adentro del puerto (z = −L)
  g.add(ubic(caja(K, A, 0.2, L, AL.calizaD, { grosor: 0.008 }), 0, -0.06, -L / 2));
  g.add(ubic(caja(K, A + 0.05, 0.03, L + 0.04, AL.caliza, { grosor: 0.004 }), 0, 0.05, -L / 2));
  for (let k = 0; k < 4; k++) [-1, 1].forEach(l => g.add(ubic(K.malla(K.cilindro(0.03, 0.04, 0.11, 8), AL.calizaS, { grosor: 0.003 }), l * (A / 2 - 0.05), 0.11, -0.7 - k * 0.55)));   // los bolardos
  for (let k = 0; k < 6; k++) g.add(ubic(caja(K, A + 0.01, 0.02, 0.02, AL.calizaS, { sinTinta: true }), 0, 0.066, -0.2 - k * 0.42));   // las juntas de los sillares
  g.add(ubic(caja(K, A + 0.25, 0.22, 0.3, AL.calizaD, { grosor: 0.006 }), 0, -0.05, -L - 0.05));   // la cabeza del espigón, más ancha
  return g;
}
/* las lámparas de la noche: la lámpara de barro sobre su pie */
export function lampara(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  g.add(ubic(K.malla(K.cilindro(0.012, 0.04, 0.5, 6), AT.bronce, { grosor: 0.004 }), 0, 0.25, 0));
  const c = K.malla(K.esfera(0.05, 0.6), '#b5603a', { grosor: 0.003 }); c.scale.set(1.3, 0.5, 0.9); c.position.y = 0.52; g.add(c);
  const llama = new THREE.Group(); llama.position.set(0.06, 0.55, 0); g.add(llama); g.userData.llama = llama;
  const f = K.malla(K.cono(0.022, 0.07, 6), '#ffd27a', { sinTinta: true, sombra: false, emissive: '#ffb13b', emissiveIntensity: 1 }); f.position.y = 0.035; llama.add(f);
  return g;
}

/* ---------- 39 · EL MUSEO: la casa de las Musas, por etapas (la variante elegida en la hoja de bocetos) ---------- */
export function museo(K, n) {
  const P = pieza(ANCLAS.museo), A = ANCLAS.museo;
  const m = museoMon(K, VARIANTES.museo, n); m.scale.setScalar(0.72); en(P, m, A.x, A.y + 0.15);
  if (n !== 'obra' && n >= 1) actor(P, K, { ...ERATOSTENES, oficio: true, k: 'eratostenes' }, 'narrar', A.x - 0.4, A.y + 0.05, { x: A.x + 0.3, y: A.y + 0.3 });
  if (n !== 'obra' && n >= 2) actor(P, K, { ...MAESTRO, chal: '#7a4a3a', oficio: true, k: 'sabio' }, 'sentado', A.x + 0.55, A.y + 0.5, { x: A.x + 0.68, y: A.y + 0.1 }, { asiento: 0.12 });
  return P;
}

/* ---------- 40 · LOS ROLLOS DE LOS BARCOS: el muelle se vuelve puerto de libros ---------- */
/* 0: la grúa de madera con su cesta colgando y las ánforas · 1: las cestas de rollos del muelle · 2: el armario de los
   rollos, con su toldo · 3: la mesa de los hombres del rey, que anotan cada libro que entra */
export function rollos(K, n) {
  const P = pieza(ANCLAS.rollos), A = ANCLAS.rollos;
  const gr = new THREE.Group(); en(P, gr, A.x + 0.3, A.y - 0.55);
  gr.add(ubic(K.malla(K.cilindro(0.03, 0.04, 0.9, 6), AL.maderaD, { grosor: 0.004 }), 0, 0.45, 0));
  const brazo = K.malla(K.cilindro(0.02, 0.02, 0.8, 5), AL.madera, { grosor: 0.003 }); brazo.position.set(0, 0.86, -0.25); brazo.rotation.x = 1.05; gr.add(brazo);
  gr.add(ubic(K.malla(K.cilindro(0.003, 0.003, 0.4, 3), AL.cuerda, { sinTinta: true }), 0, 0.82, -0.6));
  const cc = cesta(K, 4); cc.position.set(0, 0.5, -0.6); gr.add(cc);
  [[-0.3, 0.1], [-0.42, -0.08]].forEach(([x, z], i) => { const a = K.malla(K.cilindro(0.04, 0.025, 0.22, 8), i ? '#a8683e' : '#b9784a', { grosor: 0.003 }); a.position.set(x, 0.11, z); gr.add(a); });
  if (n >= 1) [[-0.45, 0.2], [-0.22, 0.32], [0.02, 0.22]].forEach(([dx, dz], i) => en(P, cesta(K, 5 + i), A.x + dx, A.y + dz));
  if (n >= 2) {
    const ar = armario(K, 0.7, 0.62, 0.22, 3, 3); en(P, ar, A.x - 0.75, A.y - 0.15, 0, Math.PI / 2);
    const t = new THREE.Group(); en(P, t, A.x - 0.75, A.y - 0.15);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => t.add(ubic(K.malla(K.cilindro(0.012, 0.012, 0.85, 4), AL.maderaD, { sinTinta: true }), a * 0.3, 0.425, b * 0.42)));
    const toldo = caja(K, 0.7, 0.015, 0.95, '#c9a46a', { grosor: 0.003 }); toldo.position.y = 0.86; toldo.rotation.z = 0.12; t.add(toldo);
  }
  if (n >= 3) {
    const ms = mesa(K, 0.55, 0.32, 0.28); en(P, ms, A.x + 0.35, A.y + 0.5, 0, 0.3);
    for (let k = 0; k < 3; k++) { const c = capsa(K, 0.9); c.position.set(-0.15 + k * 0.15, 0.3, 0); ms.add(c); }
    actor(P, K, { piel: 1, pelo: 'corto', colorPelo: '#3a2a1e', barba: true, ropa: 'tunica', colorRopa: '#efe7d2', chal: '#7a2f3a', oficio: true, k: 'escribaRey' }, 'escribir', A.x + 0.38, A.y + 0.82, { x: A.x + 0.35, y: A.y + 0.4 });
  }
  return P;
}
/* la biblioteca hija del Serapeo, los armarios y los que leen (la etapa 3 de los rollos): al pie de la colina, a la
   derecha de la escalinata (al centro suben los «cien escalones» entre sus esfinges) */
export function hija(K) {
  const P = pieza({ x: L.SERAPEO.x + 1.2, y: L.SERAPEO.y + 1.5 }), A = P.ancla;
  [-0.12, 0.42].forEach(dx => en(P, armario(K, 0.5, 0.5, 0.18, 2, 3), A.x + dx, A.y - 0.1));
  actor(P, K, { ...aprendiz(5), oficio: true, k: 'lector' }, 'leer', A.x + 0.95, A.y + 0.3, { x: A.x + 1.7, y: A.y + 1.0 });
  return P;
}

/* ---------- 41 · LOS PÍNAKES: el catálogo, delante de la Biblioteca ---------- */
/* 0: el escritorio de Calímaco con su rollo y su lámpara · 1: las cestas con las etiquetas colgando · 2: los cuatro
   estantes rotulados por género · 3: la mesa de los ciento veinte libros del catálogo */
export function pinakes(K, n) {
  const P = pieza(ANCLAS.pinakes), A = ANCLAS.pinakes;
  const ms = mesa(K, 0.5, 0.3, 0.3); en(P, ms, A.x - 0.15, A.y + 0.05, 0, 0.1);
  const r = rolloSuelto(K, 0.22); r.position.set(0, 0.33, 0); ms.add(r);
  actor(P, K, { piel: 1, pelo: 'rizos', colorPelo: '#3a2a1e', barba: true, ropa: 'tunica', colorRopa: '#f1ebdc', chal: '#7a4a6e', oficio: true, k: 'calimaco' }, 'escribir', A.x - 0.15, A.y + 0.33, { x: A.x - 0.15, y: A.y });
  if (n >= 1) [[0.35, 0.1], [0.55, -0.12], [-0.6, 0.15]].forEach(([dx, dz], i) => en(P, cesta(K, 6, true), A.x + dx, A.y + dz));
  if (n >= 2) L.GENEROS.forEach((G, k) => {
    const x = A.x - 0.75 + k * 0.5, est = armario(K, 0.42, 0.55, 0.16, 2, 3); en(P, est, x, A.y - 0.42);
    const c = document.createElement('canvas'); c.width = 128; c.height = 48; const cg = c.getContext('2d');
    cg.fillStyle = '#efe4c8'; cg.fillRect(0, 0, 128, 48); cg.strokeStyle = '#8a6a3a'; cg.lineWidth = 4; cg.strokeRect(2, 2, 124, 44);
    cg.fillStyle = '#4a3a22'; cg.font = '600 20px Georgia, serif'; cg.textAlign = 'center'; cg.textBaseline = 'middle'; cg.fillText(G.n, 64, 25);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.userData.propia = true;
    const rot = plano(K, tx, 0.4, 0.15); rot.position.copy(P.en(x, A.y - 0.42 + 0.09)); rot.position.y = 0.66; P.obj.add(rot);
  });
  if (n >= 3) {
    const gm = mesa(K, 0.75, 0.4, 0.32); en(P, gm, A.x + 0.55, A.y + 0.45, 0, -0.15);
    for (let f = 0; f < 3; f++) for (let k = 0; k < 6 - f; k++) { const rr = K.malla(K.cilindro(0.022, 0.022, 0.26, 6), (k + f) % 2 ? AL.rollo : AL.rolloD, { grosor: 0.002 }); rr.rotation.z = Math.PI / 2; rr.position.set(-0.13 + k * 0.05 + f * 0.025, 0.36 + f * 0.04, 0); gm.add(rr); }
  }
  return P;
}

/* ---------- 42 · LOS ELEMENTOS DE EUCLIDES: la geometría en la arena ---------- */
/* la tabla de arena con la proposición I.1: el triángulo equilátero con sus dos círculos */
function tablaArena(K, figura = 'I1') {
  const g = new THREE.Group();
  g.add(ubic(caja(K, 0.72, 0.05, 0.5, AL.madera, { grosor: 0.004 }), 0, 0.32, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(ubic(K.malla(K.cilindro(0.016, 0.016, 0.32, 5), AL.maderaD, { grosor: 0.003 }), a * 0.3, 0.16, b * 0.2)));
  const tx = texturaCanvas(192, 128, (c, W, H) => {
    c.fillStyle = '#e8d6a6'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 300; i++) { c.fillStyle = i % 2 ? 'rgba(170,140,90,.25)' : 'rgba(255,250,235,.3)'; c.fillRect((i * 37) % W, (i * 53) % H, 2, 2); }
    c.strokeStyle = '#6a5232'; c.lineWidth = 2.5;
    if (figura === 'I1') {
      const ax = 72, bx = 120, y = 78, r = bx - ax, cx = (ax + bx) / 2, cy = y - r * Math.sqrt(3) / 2;
      c.beginPath(); c.arc(ax, y, r, 0, 7); c.stroke(); c.beginPath(); c.arc(bx, y, r, 0, 7); c.stroke();
      c.lineWidth = 3.5; c.beginPath(); c.moveTo(ax, y); c.lineTo(bx, y); c.lineTo(cx, cy); c.closePath(); c.stroke();
      c.fillStyle = '#6a5232'; c.font = 'italic 13px Georgia, serif'; c.fillText('Α', ax - 14, y + 5); c.fillText('Β', bx + 5, y + 5); c.fillText('Γ', cx - 4, cy - 6);
    } else {                                             // I.47: los cuadrados sobre los lados del triángulo rectángulo
      const A0 = [70, 80], B0 = [118, 80], C0 = [70, 52];
      c.beginPath(); c.moveTo(...A0); c.lineTo(...B0); c.lineTo(...C0); c.closePath(); c.stroke();
      c.strokeRect(70, 80, 48, 34); c.strokeRect(42, 52, 28, 28);
      c.beginPath(); c.moveTo(...B0); c.lineTo(146, 34); c.lineTo(98, 6); c.lineTo(...C0); c.stroke();
    }
  });
  const ar = plano(K, tx, 0.66, 0.44); ar.rotation.x = -Math.PI / 2; ar.position.y = 0.348; g.add(ar);
  return g;
}
/* 0: la tabla de arena con la proposición I.1 · 1: el compás y la regla de bronce, y la segunda tabla con la I.47 · 2: el
   atril con los trece rollos · 3: la pizarra de madera con los postulados, que se enseñan de pie */
export function elementos(K, n) {
  const P = pieza(ANCLAS.elementos), A = ANCLAS.elementos;
  const t1 = tablaArena(K, 'I1'); en(P, t1, A.x, A.y, 0, -0.2);
  actor(P, K, { ...aprendiz(6), oficio: true, k: 'geometra' }, 'escribir', A.x - 0.05, A.y + 0.36, { x: A.x, y: A.y });
  if (n >= 1) {
    const t2 = tablaArena(K, 'I47'); en(P, t2, A.x - 0.78, A.y + 0.12, 0, 0.25);
    const comp = new THREE.Group(); t2.add(comp); comp.position.set(0.18, 0.36, 0.1);
    [-1, 1].forEach(l => { const p = K.malla(K.cilindro(0.006, 0.004, 0.2, 4), AT.bronce, { sinTinta: true }); p.position.set(l * 0.035, 0.08, 0); p.rotation.z = l * 0.3; comp.add(p); });
    const reg = caja(K, 0.3, 0.008, 0.025, AT.bronce, { sinTinta: true }); reg.position.set(-0.12, 0.36, -0.12); reg.rotation.y = 0.4; t2.add(reg);
  }
  if (n >= 2) {
    const at = new THREE.Group(); en(P, at, A.x + 0.62, A.y - 0.25, 0, -0.4);
    at.add(ubic(caja(K, 0.42, 0.4, 0.16, AL.maderaD, { grosor: 0.004 }), 0, 0.2, 0));
    for (let k = 0; k < 13; k++) { const rr = K.malla(K.cilindro(0.02, 0.02, 0.16, 6), k % 3 ? AL.rollo : AL.rolloD, { grosor: 0.002 }); rr.rotation.x = Math.PI / 2; rr.position.set(-0.16 + (k % 7) * 0.053, 0.27 + Math.floor(k / 7) * 0.05, 0.02); at.add(rr); }
  }
  if (n >= 3) {
    const pz = new THREE.Group(); en(P, pz, A.x + 0.1, A.y - 0.62, 0, 0);
    [-1, 1].forEach(l => pz.add(ubic(K.malla(K.cilindro(0.016, 0.02, 0.9, 5), AL.maderaD, { grosor: 0.003 }), l * 0.3, 0.45, 0, 0.12, 0, 0)));
    const tx = texturaCanvas(160, 96, (c, W, H) => {
      c.fillStyle = '#2f3a34'; c.fillRect(0, 0, W, H); c.fillStyle = '#e9e2cf'; c.font = '600 11px Georgia, serif';
      ['ΑΙΤΗΜΑΤΑ', 'α΄ ἀπὸ παντὸς σημείου…', 'β΄ πεπερασμένην εὐθεῖαν…', 'γ΄ παντὶ κέντρῳ…', 'δ΄ πάσας τὰς ὀρθὰς…', 'ε΄ ἐὰν εἰς δύο εὐθείας…'].forEach((f, i) => c.fillText(f, 8, 15 + i * 15));
    });
    const pi = plano(K, tx, 0.62, 0.38); pi.position.set(0, 0.62, 0.03); pi.rotation.x = -0.12; pz.add(pi);
  }
  return P;
}

/* ---------- 43 · LA SOMBRA DE ERATÓSTENES: la vara en la plaza ---------- */
/* 0: la vara clavada en su círculo de arena, con la sombra · 1: las marcas de la sombra en el suelo y la cuerda de medir
   · 2: la skaphe, el reloj de sol en cuenco, sobre su pie · 3: la esfera armilar sobre su columna */
export function sombra(K, n) {
  const P = pieza(ANCLAS.sombra), A = ANCLAS.sombra;
  const ci = new THREE.Group(); en(P, ci, A.x, A.y);
  ci.add(ubic(K.malla(K.cilindro(0.42, 0.44, 0.02, 24), '#e3cf9c', { grosor: 0.003, sombra: false }), 0, 0.01, 0));
  ci.add(ubic(K.malla(K.cilindro(0.012, 0.016, 0.7, 6), AL.maderaD, { grosor: 0.003 }), 0, 0.35, 0));
  ci.add(ubic(K.malla(K.esfera(0.02, 0.5), AT.bronce, { sinTinta: true }), 0, 0.71, 0));
  const somb = caja(K, 0.3, 0.004, 0.03, '#7a6646', { sinTinta: true, sombra: false }); somb.position.set(0.15, 0.022, 0.06); somb.rotation.y = -0.35; ci.add(somb);
  if (n >= 1) {
    for (let k = 0; k < 7; k++) { const a = -0.9 + k * 0.3, m = caja(K, 0.12, 0.004, 0.01, '#6a5232', { sinTinta: true, sombra: false }); m.position.set(Math.cos(a) * 0.32, 0.022, Math.sin(a) * 0.32); m.rotation.y = -a; ci.add(m); }
    const cu = K.malla(K.toro(0.12, 0.006, Math.PI * 1.6, 0.5), AL.cuerda, { sinTinta: true }); cu.rotation.x = Math.PI / 2; cu.position.set(-0.3, 0.03, 0.22); ci.add(cu);
    actor(P, K, { ...ERATOSTENES, oficio: true, k: 'eratostenes' }, 'quieto', A.x - 0.45, A.y + 0.15, { x: A.x, y: A.y });
  }
  if (n >= 2) {
    const sk = new THREE.Group(); en(P, sk, A.x + 0.65, A.y - 0.3);
    sk.add(ubic(K.malla(K.cilindro(0.08, 0.1, 0.36, 8), AL.calizaD, { grosor: 0.004 }), 0, 0.18, 0));
    const cu = K.malla(new THREE.SphereGeometry(0.15, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), AL.calizaL, { grosor: 0.004, side: THREE.DoubleSide }); cu.geometry.userData.propia = true; cu.position.y = 0.5; sk.add(cu);
    sk.add(ubic(K.malla(K.cilindro(0.004, 0.004, 0.12, 3), AT.bronce, { sinTinta: true }), 0, 0.45, 0));
  }
  if (n >= 3) {
    const co = new THREE.Group(); en(P, co, A.x + 0.2, A.y - 0.72);
    co.add(ubic(K.malla(K.cilindro(0.06, 0.07, 0.5, 8), AL.calizaL, { grosor: 0.004 }), 0, 0.25, 0));
    const ar = armilar(K, 1.5); ar.position.y = 0.5; co.add(ar);
  }
  return P;
}

/* ---------- 44 · EL CÓDICE: el libro que se hojea ---------- */
/* 0: el cuaderno de tablillas de cera atadas por un lado, sobre su mesa · 1: el códice de pergamino abierto en un atril
   · 2: el armario con los códices de lomo, junto a los rollos · 3: el que lee sentado, hojeando */
function codiceAbierto(K, s = 1) {
  const g = new THREE.Group();
  [-1, 1].forEach(l => { const h = caja(K, 0.11 * s, 0.012 * s, 0.15 * s, '#f1e6c8', { grosor: 0.002 }); h.position.x = l * 0.057 * s; h.rotation.z = -l * 0.08; g.add(h); });
  g.add(ubic(caja(K, 0.24 * s, 0.008 * s, 0.16 * s, '#6a3a26', { grosor: 0.002 }), 0, -0.008 * s, 0));
  return g;
}
export function codice(K, n) {
  const P = pieza(ANCLAS.codice), A = ANCLAS.codice;
  const ms = mesa(K, 0.48, 0.3, 0.3); en(P, ms, A.x, A.y, 0, -0.2);
  for (let k = 0; k < 4; k++) { const t = caja(K, 0.16, 0.014, 0.12, k % 2 ? '#8a6a4a' : '#7a5a3a', { grosor: 0.002 }); t.position.set(-0.08, 0.32 + k * 0.016, 0); t.rotation.y = k * 0.04; ms.add(t); }
  ms.add(ubic(K.malla(K.cilindro(0.004, 0.004, 0.08, 3), '#c9b38a', { sinTinta: true }), -0.16, 0.35, 0, Math.PI / 2, 0, 0));   // el cordel que las ata por un lado
  if (n >= 1) {
    const at = new THREE.Group(); en(P, at, A.x + 0.45, A.y + 0.15, 0, -0.5);
    at.add(ubic(K.malla(K.cilindro(0.016, 0.02, 0.42, 5), AL.maderaD, { grosor: 0.003 }), 0, 0.21, 0));
    const cd = codiceAbierto(K, 1.2); cd.position.y = 0.44; cd.rotation.x = -0.5; at.add(cd);
  }
  if (n >= 2) {
    const ar = new THREE.Group(); en(P, ar, A.x - 0.1, A.y - 0.45, 0, 0);
    ar.add(ubic(caja(K, 0.62, 0.6, 0.2, AL.maderaD, { grosor: 0.004 }), 0, 0.3, 0));
    for (let f = 0; f < 3; f++) for (let k = 0; k < 7; k++) {
      const lomo = f === 1 ? caja(K, 0.05, 0.14, 0.14, ['#7a2f2a', '#3a5a7a', '#5a6a3a', '#8a6a2a'][k % 4], { grosor: 0.002 }) : K.malla(K.cilindro(0.025, 0.025, 0.14, 6), k % 2 ? AL.rollo : AL.rolloD, { grosor: 0.002 });
      if (f !== 1) lomo.rotation.x = Math.PI / 2;
      lomo.position.set(-0.24 + k * 0.08, 0.1 + f * 0.19, 0.04); ar.add(lomo);
    }
  }
  if (n >= 3) {
    const lector = actor(P, K, { ...aprendiz(4), oficio: true, k: 'lectorCodice' }, 'leer', A.x + 0.5, A.y - 0.3, { x: A.x + 0.5, y: A.y + 0.2 });
    const cd = codiceAbierto(K, 0.9); cd.rotation.x = -0.6; lector.sostener?.(cd, 'D');
  }
  return P;
}

/* LAS PIEZAS: con su índice de saber para la auditoría de etapas (juego3d/qa.html) */
export const PIEZAS = [
  { id: 'museo', i: 39, crear: museo },
  { id: 'rollos', i: 40, crear: rollos },
  { id: 'pinakes', i: 41, crear: pinakes },
  { id: 'elementos', i: 42, crear: elementos },
  { id: 'sombra', i: 43, crear: sombra },
  { id: 'codice', i: 44, crear: codice },
];
