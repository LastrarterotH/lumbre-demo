/* ============================================================
   tenochtitlan/piezas
   Los seis saberes de Tenochtitlan en 3D, cada uno con sus etapas (la máxima del proyecto: subir de nivel se VE, con piezas
   nuevas; se audita por diff de píxeles en juego3d/qa.html): el amate (51), el telpochcalli (52), el calmécac (53), la
   cuicacalli (54), la cuenta de los días (55) y la palabra antigua (56). Más la gente de la época (los jóvenes de los
   barrios, los maestros, la partera, Nezahualcóyotl) y los braseros de la noche. Las anclas son las del motor (09e).
   Cada pieza devuelve { obj, anim, ancla, toc, actores } como las de las otras épocas (src/piezas.js).
   ============================================================ */
import * as THREE from 'three';
import { pieza, actor, texturaCanvas } from '../piezas.js';
import * as L from './lugares.js';
import * as MON from './monumentos.js';
import { TE, banda } from './monumentos.js';

const ubic = (m, x, y, z, rx = 0, ry = 0, rz = 0) => { m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx, ry, rz); return m; };
const caja = (K, w, h, d, color, o) => K.malla(K.caja(w, h, d), color, o);
const en = (P, obj, x, y, h = 0, ry = 0) => { obj.position.copy(P.en(x, y)); obj.position.y += h; obj.rotation.y = ry; P.obj.add(obj); return obj; };
const plano = (K, tex, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), K.matMapa(tex)); m.geometry.userData.propia = true; m.castShadow = true; return m; };

export const ANCLAS = {
  amate: { x: 16.0, y: 9.0 }, telpo: { x: L.TELPO.x, y: L.TELPO.y }, telpo2: { x: L.TELPO2.x, y: L.TELPO2.y }, calmecac: { x: L.CALMECAC.x, y: L.CALMECAC.y },
  cuicacalli: { x: L.CUICACALLI.x, y: L.CUICACALLI.y }, tonal: { x: 14.85, y: 12.95 }, palabra: { x: L.PALABRA.x, y: L.PALABRA.y },
};

/* LA GENTE DE TENOCHTITLAN. Los jóvenes: los muchachos con el pelo corto y el taparrabo (maxtlatl) o la manta corta anudada al
   hombro; las muchachas con el huipil y la falda (cueitl), el pelo largo o en trenzas. Los colores de la manta, crudos y
   teñidos (grana, añil, ocre). */
export function joven(i, extra = {}) {
  const chica = i % 3 === 1, nino = i % 4 === 0;
  return { edad: nino ? 'nino' : undefined, piel: [2, 3, 2, 1, 3][i % 5], pelo: chica ? ['trenza', 'melena'][i % 2] : 'corto', colorPelo: ['#1e1610', '#2a1f18', '#1a120c'][i % 3],
    ropa: chica ? 'tunica' : 'corta', colorRopa: chica ? ['#efe6d2', '#e8d8b8', '#f2ead8'][i % 3] : ['#efe6d2', '#e2d6bc', '#d9cfb5'][i % 3], orla: ['#b8352f', '#3f7fb8', '#d09a3a', '#2f9a8a'][i % 4],
    chal: chica || i % 5 === 2 ? undefined : ['#d8c9a6', '#c9b48a'][i % 2], sinFlecos: true, ...extra };
}
/* los maestros: la manta (tilmatli) anudada al hombro, de colores; los sacerdotes del calmécac, de negro, con el pelo largo */
export const MAESTRO = { piel: 2, pelo: 'corto', colorPelo: '#1e1610', ropa: 'tunica', colorRopa: '#efe6d2', orla: '#b8352f', chal: '#b8352f' };
export const SACERDOTE = { piel: 2, pelo: 'melena', colorPelo: '#1a120c', ropa: 'tunica', colorRopa: '#2a2622', orla: '#5a4a3a', chal: '#1e1a18' };
export const PARTERA = { piel: 2, pelo: 'trenza', colorPelo: '#2a1f18', ropa: 'tunica', colorRopa: '#efe0c8', orla: '#b8352f', chal: '#7a4a5e' };
export const NEZA = { piel: 2, pelo: 'melena', colorPelo: '#1a120c', ropa: 'tunica', colorRopa: '#2f6f6a', orla: '#d4a93e', chal: '#d4a93e', pluma: true };
export const ANCIANO = { piel: 2, pelo: 'corto', colorPelo: '#c8c0b2', barba: '#c8c0b2', ropa: 'tunica', colorRopa: '#e2d6bc', orla: '#3f7fb8', chal: '#3f7fb8', edad: 'anciana' };

/* ---------- utensilios ---------- */
function petate(K, w, d, color = TE.paja) { const g = new THREE.Group(); g.add(ubic(caja(K, w, 0.012, d, color, { sinTinta: true, sombra: false }), 0, 0.006, 0)); for (let k = 0; k < Math.floor(w / 0.08); k++) g.add(ubic(caja(K, 0.006, 0.014, d, TE.pajaD, { sinTinta: true, sombra: false }), -w / 2 + 0.04 + k * 0.08, 0.007, 0)); return g; }
function brasero(K, encendido = true) {
  const g = new THREE.Group(); g.userData.vivo = true;
  g.add(ubic(K.malla(K.cilindro(0.08, 0.06, 0.14, 8), '#8a4a32', { grosor: 0.003 }), 0, 0.07, 0));
  g.add(ubic(K.malla(K.toro(0.08, 0.012, Math.PI * 2, 0.6), '#6a3a26', { sinTinta: true }), 0, 0.14, 0, Math.PI / 2, 0, 0));
  const llama = new THREE.Group(); llama.position.y = 0.15; g.add(llama); g.userData.llama = llama;
  if (encendido) llama.add(ubic(K.malla(K.cono(0.04, 0.12, 6), '#ffb24a', { sinTinta: true, sombra: false, emissive: '#ff8a2a', emissiveIntensity: 1 }), 0, 0.06, 0));
  return g;
}
export { brasero };
function huehuetl(K) {
  const g = new THREE.Group();
  g.add(ubic(K.malla(K.cilindro(0.08, 0.09, 0.3, 10), TE.madera, { grosor: 0.003 }), 0, 0.15, 0));
  g.add(ubic(K.malla(K.cilindro(0.081, 0.081, 0.01, 10), '#d8c49a', { sinTinta: true }), 0, 0.305, 0));
  for (let k = 0; k < 3; k++) g.add(ubic(caja(K, 0.04, 0.06, 0.02, TE.maderaD, { sinTinta: true }), Math.cos(k * 2.1) * 0.085, 0.03, Math.sin(k * 2.1) * 0.085, 0, -k * 2.1, 0));   // las patas talladas
  return g;
}
function teponaztli(K) {
  const g = new THREE.Group();
  const t = K.malla(K.capsula(0.05, 0.22, 0.6), TE.maderaD, { grosor: 0.003 }); t.rotation.z = Math.PI / 2; t.position.y = 0.06; g.add(t);
  g.add(ubic(caja(K, 0.18, 0.006, 0.02, '#3a2a1c', { sinTinta: true }), 0, 0.11, 0));   // la H de las lengüetas
  return g;
}
/* un códice extendido en biombo, de largo l (páginas plegadas en zigzag), con sus glifos en negro y rojo */
function codice(K, l = 0.6, plegado = false) {
  const g = new THREE.Group(), N = Math.max(3, Math.round(l / 0.1)), tx = texturaCanvas(32 * N, 48, (c, W, H) => {
    c.fillStyle = '#f2e6c4'; c.fillRect(0, 0, W, H);
    for (let k = 0; k < N; k++) {
      c.strokeStyle = '#b8352f'; c.lineWidth = 2; c.strokeRect(k * 32 + 3, 4, 26, 40);
      c.fillStyle = ['#2a221c', '#b8352f', '#3f7fb8', '#d09a3a'][k % 4]; c.beginPath(); c.arc(k * 32 + 16, 18, 6, 0, 7); c.fill();
      c.fillStyle = '#2a221c'; for (let q = 0; q < (k % 5) + 1; q++) { c.beginPath(); c.arc(k * 32 + 7 + q * 4, 36, 1.6, 0, 7); c.fill(); }   // los puntos de la cuenta
    }
  });
  if (plegado) { for (let k = 0; k < 6; k++) g.add(ubic(caja(K, 0.12, 0.012, 0.16, k % 2 ? '#f2e6c4' : '#e8d8b0', { grosor: 0.0015 }), 0, 0.006 + k * 0.012, 0)); return g; }
  const p = plano(K, tx, l, 0.16); p.rotation.x = -Math.PI / 2; p.position.y = 0.012; g.add(p);
  return g;
}
export { codice };

/* ---------- 51 · EL AMATE: el taller de los que baten la corteza, junto al embarcadero ---------- */
/* 0: la batea con la corteza en remojo y el que bate con la piedra acanalada · 1: los atados de corteza que llegan y la
   segunda piedra · 2: los pliegos secándose sobre tablas al sol · 3: el toldo de zacate sobre las tablas, la mesa con el
   biombo plegado y los atados de papel para los códices */
export function amate(K, n) {
  const P = pieza(ANCLAS.amate), A = ANCLAS.amate;
  const ba = new THREE.Group(); en(P, ba, A.x - 0.05, A.y + 0.08);
  ba.add(ubic(caja(K, 0.58, 0.15, 0.32, TE.maderaD, { grosor: 0.004 }), 0, 0.075, 0));
  ba.add(ubic(caja(K, 0.54, 0.01, 0.28, TE.agua, { sinTinta: true }), 0, 0.145, 0));
  for (let k = 0; k < 4; k++) ba.add(ubic(caja(K, 0.5, 0.012, 0.035, '#b09060', { sinTinta: true }), 0, 0.15, -0.1 + k * 0.065));   // las tiras de corteza en remojo
  const batidor = actor(P, K, { ...joven(3), edad: undefined, oficio: true, k: 'batidor' }, 'agachado', A.x + 0.05, A.y + 0.44, { x: A.x - 0.05, y: A.y + 0.08 });
  en(P, caja(K, 0.15, 0.05, 0.1, TE.piedraD, { grosor: 0.002 }), A.x + 0.34, A.y + 0.32);
  if (n >= 1) {
    [[-0.44, 0.22], [-0.52, -0.02], [-0.38, -0.22]].forEach(([dx, dz], i) => { const at = new THREE.Group(); en(P, at, A.x + dx, A.y + dz, 0, i * 0.7);
      for (let k = 0; k < 4; k++) at.add(ubic(K.malla(K.cilindro(0.024, 0.024, 0.36, 5), '#8a6a42', { grosor: 0.002 }), (k % 2) * 0.05 - 0.025, 0.03 + Math.floor(k / 2) * 0.048, 0, 0, 0, Math.PI / 2));
      at.add(ubic(K.malla(K.toro(0.055, 0.007, Math.PI * 2, 0.5), TE.pajaD, { sinTinta: true }), 0.07, 0.055, 0, 0, Math.PI / 2, 0)); });
    en(P, caja(K, 0.32, 0.11, 0.22, TE.piedra, { grosor: 0.004 }), A.x + 0.36, A.y - 0.12);   // la piedra lisa donde se bate
  }
  if (n >= 2) {
    const ta = new THREE.Group(); en(P, ta, A.x - 0.02, A.y - 0.52);
    for (let k = 0; k < 3; k++) {
      const t = caja(K, 0.34, 0.02, 0.24, TE.madera, { grosor: 0.003 }); t.position.set(-0.37 + k * 0.37, 0.17, 0); t.rotation.x = -0.35; ta.add(t);
      [-1, 1].forEach(l => ta.add(ubic(K.malla(K.cilindro(0.012, 0.012, 0.2, 4), TE.maderaD, { sinTinta: true }), -0.37 + k * 0.37 + l * 0.14, 0.09, -0.05)));
      const h = caja(K, 0.28, 0.006, 0.19, '#cfae7c', { grosor: 0.0015 }); h.position.set(-0.37 + k * 0.37, 0.185, 0.005); h.rotation.x = -0.35; ta.add(h);
    }
  }
  if (n >= 3) {
    const to = new THREE.Group(); en(P, to, A.x - 0.02, A.y - 0.5);   // el toldo de zacate que da sombra a los pliegos
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => to.add(ubic(K.malla(K.cilindro(0.016, 0.018, 0.66, 5), TE.madera, { grosor: 0.0015 }), a * 0.55, 0.33, b * 0.2)));
    to.add(ubic(caja(K, 1.24, 0.04, 0.54, TE.paja, { grosor: 0.003 }), 0, 0.67, 0));
    for (let k = 0; k < 8; k++) to.add(ubic(caja(K, 0.012, 0.045, 0.56, TE.pajaD, { sinTinta: true }), -0.56 + k * 0.16, 0.672, 0));
    const me = caja(K, 0.26, 0.15, 0.22, TE.maderaD, { grosor: 0.003 }); en(P, me, A.x - 0.4, A.y + 0.46, 0, 0.3);
    const bi = codice(K, 0, true); en(P, bi, A.x - 0.4, A.y + 0.46, 0.15, 0.3);
    for (let k = 0; k < 3; k++) { const pa = caja(K, 0.17, 0.065, 0.13, k % 2 ? '#cfae7c' : '#a9824e', { grosor: 0.002 }); en(P, pa, A.x + 0.34, A.y + 0.5, 0.033 + k * 0.066, 0.2); }
  }
  P.toc = [{ x: A.x, y: A.y, k: 'embarcadero', p: batidor }];
  return P;
}

/* ---------- 52 · EL TELPOCHCALLI: la casa de los jóvenes del barrio, al pie del teocalli ---------- */
/* 0: la casa larga de adobe con su patio y el fuego del patio · 1: la ramada de horcones y zacate, y el soporte con las coas
   (los palos de cavar) y el escudo de entrenamiento · 2: el dormitorio de los muchachos (un jacal) con sus petates y el
   tambor del patio · 3: el altar del barrio con su brasero y las banderas de papel (pantli), y la leña para el templo ·
   (otra ranura) el telpochcalli del calpulli de las chinampas */
export function telpochcalli(K, n) {
  const P = pieza(ANCLAS.telpo), A = ANCLAS.telpo;
  en(P, MON.casaTelpochcalli(K, { ramada: n >= 1, patio: false }), A.x, A.y + 0.06);
  en(P, caja(K, 1.66, 0.008, 1.1, '#ddc9a0', { sinTinta: true, sombra: false }), A.x, A.y + 1.0, 0.004);   // el patio de tierra apisonada
  en(P, brasero(K), A.x - 0.62, A.y + 0.86);
  const maestro = actor(P, K, { ...MAESTRO, oficio: true, k: 'telpochtlato' }, 'narrar', A.x + 0.58, A.y + 0.92, { x: A.x - 0.2, y: A.y + 1.0 });
  if (n >= 1) {
    const so = new THREE.Group(); en(P, so, A.x - 0.05, A.y + 1.36, 0, -0.15);
    so.add(ubic(caja(K, 0.045, 0.5, 0.045, TE.maderaD, { grosor: 0.002 }), -0.2, 0.25, 0)); so.add(ubic(caja(K, 0.045, 0.5, 0.045, TE.maderaD, { grosor: 0.002 }), 0.2, 0.25, 0));
    so.add(ubic(caja(K, 0.44, 0.035, 0.045, TE.madera, { grosor: 0.002 }), 0, 0.45, 0));
    for (let k = 0; k < 5; k++) so.add(ubic(K.malla(K.cilindro(0.009, 0.011, 0.52, 4), '#8a6a42', { sinTinta: true }), -0.15 + k * 0.075, 0.27, 0.035, 0.1, 0, 0));   // las coas
    const esc = K.malla(K.cilindro(0.15, 0.15, 0.025, 16), TE.ocre, { grosor: 0.003 }); esc.rotation.x = Math.PI / 2; esc.position.set(0.38, 0.26, 0.04); so.add(esc);   // el chimalli con sus plumas
    so.add(ubic(K.malla(K.toro(0.15, 0.014, Math.PI * 2, 0.5), TE.rojo, { sinTinta: true }), 0.38, 0.26, 0.055));
  }
  if (n >= 2) {
    en(P, MON.jacal(K, { w: 0.62, d: 0.46, h: 0.42, techo: 0.46 }), A.x + 0.56, A.y + 1.34);
    [0, 1].forEach(k => { const pe = petate(K, 0.34, 0.16); en(P, pe, A.x + 0.1 + k * 0.05, A.y + 1.08 + k * 0.2, 0.008, 0.3); });
    en(P, huehuetl(K), A.x - 0.32, A.y + 1.02);
  }
  if (n >= 3) {                                         // el altar del barrio, con su brasero y las banderas de papel (pantli) del calpulli
    const al = new THREE.Group(); en(P, al, A.x - 0.6, A.y + 1.34);
    al.add(ubic(caja(K, 0.46, 0.17, 0.34, TE.estucoD, { grosor: 0.003 }), 0, 0.085, 0));
    al.add(ubic(caja(K, 0.38, 0.12, 0.26, TE.estuco, { grosor: 0.003 }), 0, 0.23, 0));
    const b2 = brasero(K); b2.position.set(0, 0.29, 0); b2.scale.setScalar(0.8); al.add(b2);
    [-1, 1].forEach(l => {
      al.add(ubic(K.malla(K.cilindro(0.009, 0.009, 0.9, 4), TE.maderaD, { sinTinta: true }), l * 0.2, 0.45, 0.12));
      al.add(ubic(caja(K, 0.18, 0.15, 0.006, TE.estucoL, { grosor: 0.0015 }), l * 0.2 + 0.095, 0.82, 0.12));
      al.add(ubic(caja(K, 0.18, 0.03, 0.007, TE.rojo, { sinTinta: true }), l * 0.2 + 0.095, 0.76, 0.12));
    });
    const le = new THREE.Group(); en(P, le, A.x - 0.98, A.y + 0.95, 0, 0.4);   // la leña para el templo
    for (let k = 0; k < 7; k++) { const l = K.malla(K.cilindro(0.025, 0.025, 0.46, 6), k % 2 ? TE.madera : TE.maderaD, { grosor: 0.0015 }); l.rotation.z = Math.PI / 2; l.position.set(0, 0.028 + Math.floor(k / 3) * 0.048, (k % 3) * 0.052 - 0.05 - (Math.floor(k / 3) % 2) * 0.02); le.add(l); }
  }
  P.toc = [{ x: A.x, y: A.y, k: 'telpochcalli', p: maestro }];
  return P;
}
export function telpochcalli2(K) {
  const P = pieza(ANCLAS.telpo2), A = ANCLAS.telpo2;
  const c = MON.casaTelpochcalli(K, { ramada: false, patio: false }); c.scale.setScalar(0.72); en(P, c, A.x, A.y, 0.014, Math.PI / 2);   // en la franja de la chinampa, de cara al poniente
  en(P, brasero(K), A.x, A.y - 0.8, 0.014);
  actor(P, K, { ...MAESTRO, chal: '#3f7fb8', oficio: true, k: 'telpochtlato2' }, 'narrar', A.x, A.y + 0.84, { x: A.x + 0.5, y: A.y + 1.6 });
  return P;
}

/* ---------- 53 · EL CALMÉCAC: la clase, en el pórtico de afuera del muro poniente del recinto (la casa está adentro) ---------- */
/* 0: el pórtico de pilares con su techo plano y su friso, y delante el fuego que no se apaga · 1: los estudiantes sentados
   ante el sacerdote · 2: el tlacuilo pintando el códice extendido en su petate · 3: el amoxcalli, la casa de los libros,
   con los biombos plegados en sus cofres */
export function calmecac(K, n) {
  const P = pieza(ANCLAS.calmecac), A = ANCLAS.calmecac;
  const sa = new THREE.Group(); en(P, sa, A.x + 0.04, A.y - 0.15);   // de espaldas al muro del recinto, abierto al poniente
  sa.add(ubic(caja(K, 0.7, 0.08, 1.15, TE.estucoD, { grosor: 0.004 }), 0, 0.04, 0));
  sa.add(ubic(caja(K, 0.1, 0.56, 1.15, TE.estuco, { grosor: 0.004 }), -0.3, 0.36, 0));
  for (let k = 0; k < 3; k++) sa.add(ubic(K.malla(K.cilindro(0.036, 0.042, 0.56, 8), TE.estuco, { grosor: 0.002 }), 0.27, 0.36, -0.42 + k * 0.42));
  sa.add(ubic(caja(K, 0.8, 0.07, 1.25, TE.tezontle, { grosor: 0.004 }), 0, 0.675, 0));
  banda(K, sa, 0.8, 1.25, 0.675, 0.065);
  sa.add(ubic(caja(K, 0.09, 0.045, 0.5, TE.estucoL, { grosor: 0.002 }), 0.39, 0.022, 0));   // el escalón del frente
  en(P, brasero(K), A.x + 0.22, A.y + 0.66);            // el fuego del calmécac: no se apaga nunca
  const sac = actor(P, K, { ...SACERDOTE, oficio: true, k: 'sacerdote' }, 'narrar', A.x - 0.1, A.y - 0.15, { x: A.x + 0.4, y: A.y - 0.15 });
  if (n >= 1) [[0.14, -0.42], [0.14, 0.1]].forEach(([dx, dz], i) => actor(P, K, { ...joven(i + 6), edad: undefined, colorRopa: '#efe6d2', oficio: true, k: 'calmecatl' + i }, 'leer', A.x + dx, A.y + dz, { x: A.x - 0.1, y: A.y - 0.15 }, { asiento: 0.08 }));
  if (n >= 2) {
    const pe = petate(K, 0.5, 0.24); en(P, pe, A.x + 0.08, A.y + 1.0);
    const co = codice(K, 0.44); en(P, co, A.x + 0.08, A.y + 1.0, 0.006);
    actor(P, K, { ...MAESTRO, chal: '#2a221c', oficio: true, k: 'tlacuilo' }, 'escribir', A.x - 0.22, A.y + 1.04, { x: A.x + 0.08, y: A.y + 1.0 });
    [TE.rojo, TE.azul, TE.negro].forEach((col, k) => en(P, K.malla(K.cilindro(0.022, 0.022, 0.028, 6), col, { sinTinta: true }), A.x + 0.38, A.y + 0.86 + k * 0.06, 0));   // los colores
  }
  if (n >= 3) {
    const am = new THREE.Group(); en(P, am, A.x - 0.02, A.y - 1.08, 0, Math.PI / 2);   // de cara al poniente
    am.add(ubic(caja(K, 0.5, 0.44, 0.4, TE.estuco, { grosor: 0.003 }), 0, 0.22, 0));
    am.add(ubic(caja(K, 0.56, 0.04, 0.46, TE.rojoD, { grosor: 0.002 }), 0, 0.46, 0));
    am.add(ubic(caja(K, 0.14, 0.26, 0.01, '#3a2a1c', { sinTinta: true }), 0, 0.13, 0.201));
    banda(K, am, 0.5, 0.4, 0.38, 0.05);
    for (let k = 0; k < 3; k++) { const bi = codice(K, 0, true); bi.position.set(-0.14 + k * 0.14, 0.48, 0); bi.scale.setScalar(0.8); am.add(bi); }
  }
  P.toc = [{ x: A.x, y: A.y, k: 'calmecac', p: sac }];
  return P;
}

/* ---------- 54 · LA CUICACALLI: la casa del canto, en la plaza del barrio ---------- */
/* 0: la casa y el patio con el huéhuetl · 1: el teponaztli y el círculo de los que danzan · 2: los que tocan con sus
   sonajas y la flauta · 3: los arcos de flores y el toldo del patio */
export function cuicacalli(K, n) {
  const P = pieza(ANCLAS.cuicacalli), A = ANCLAS.cuicacalli;
  en(P, MON.casaMacehual(K, { w: 1.15, d: 0.6, h: 0.64, estuco: true, banda: true, manta: '#d09a3a', ventana: true }), A.x - 0.08, A.y - 0.52);
  en(P, K.malla(K.cilindro(0.56, 0.56, 0.012, 22), '#e2d6b8', { sinTinta: true, sombra: false }), A.x, A.y + 0.22, 0.006);
  en(P, huehuetl(K), A.x - 0.24, A.y + 0.1);
  const maestro = actor(P, K, { ...MAESTRO, chal: '#d09a3a', oficio: true, k: 'cuicanitl' }, 'tocar', A.x - 0.44, A.y + 0.22, { x: A.x + 0.2, y: A.y + 0.4 });
  if (n >= 1) {
    en(P, teponaztli(K), A.x + 0.18, A.y - 0.02, 0, 0.4);
    [[0.3, 0.58], [-0.06, 0.68]].forEach(([dx, dz], i) => actor(P, K, { ...joven(i + 1), edad: undefined, oficio: true, k: 'danzante' + i }, 'cantar', A.x + dx, A.y + dz, { x: A.x, y: A.y + 0.22 }));
  }
  if (n >= 2) {
    actor(P, K, { ...joven(5), edad: undefined, chal: '#3f7fb8', oficio: true, k: 'musico' }, 'tocar', A.x + 0.54, A.y + 0.22, { x: A.x, y: A.y + 0.3 });
    for (let k = 0; k < 3; k++) en(P, K.malla(K.esfera(0.034, 0.5), TE.ocre, { grosor: 0.002 }), A.x + 0.36 + k * 0.07, A.y - 0.12, 0.034);   // las sonajas (ayacachtli)
  }
  if (n >= 3) {
    [-0.62, 0.62].forEach(dx => {
      const ar = new THREE.Group(); en(P, ar, A.x + dx, A.y + 0.24, 0, Math.PI / 2);
      [-1, 1].forEach(l => ar.add(ubic(K.malla(K.cilindro(0.014, 0.014, 0.6, 4), TE.verdeD, { sinTinta: true }), l * 0.28, 0.3, 0)));
      const a = K.malla(K.toro(0.28, 0.035, Math.PI, 0.5), TE.verde, { grosor: 0.002 }); a.position.y = 0.6; ar.add(a);
      for (let k = 0; k < 9; k++) { const t = Math.PI * k / 8; ar.add(ubic(K.malla(K.esfera(0.036, 0.4), ['#f2a83a', '#e8803a', '#f6c25a'][k % 3], { sinTinta: true }), Math.cos(t) * 0.28, 0.6 + Math.sin(t) * 0.28, 0.02)); }   // el cempasúchil
    });
    const to = new THREE.Group(); en(P, to, A.x + 0.02, A.y + 0.26);   // el toldo de manta blanca con la orla roja y la guirnalda
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a2, b2]) => to.add(ubic(K.malla(K.cilindro(0.016, 0.016, 0.9, 5), TE.maderaD, { grosor: 0.002 }), a2 * 0.5, 0.45, b2 * 0.4)));
    const tela = caja(K, 1.12, 0.016, 0.92, TE.estucoL, { grosor: 0.002 }); tela.position.y = 0.9; to.add(tela);
    [-1, 1].forEach(l => to.add(ubic(caja(K, 1.13, 0.06, 0.012, TE.rojo, { sinTinta: true }), 0, 0.88, l * 0.46)));
    for (let k = 0; k < 11; k++) to.add(ubic(K.malla(K.esfera(0.032, 0.4), ['#f2a83a', '#e8803a', '#f6c25a'][k % 3], { sinTinta: true }), -0.5 + k * 0.1, 0.84 - 0.05 * Math.sin(k / 10 * Math.PI), 0.465));
  }
  P.toc = [{ x: A.x, y: A.y, k: 'cuicacalli', p: maestro }];
  return P;
}

/* ---------- 55 · LA CUENTA DE LOS DÍAS: el tonalpohualli, junto a la casa de la partera (ahí se lee el signo del que nace) ---------- */
/* 0: el libro de los días abierto sobre su petate · 1: la piedra redonda con los veinte signos (la que hoy se llama Piedra
   del Sol) · 2: el tonalpouhqui que lee junto al brasero · 3: el atado de cañas del fin de un siglo (52 años, el
   xiuhmolpilli) y el toldo */
function piedraSol(K) {
  const g = new THREE.Group();
  const tx = texturaCanvas(256, 256, (c, W) => {
    const cx = W / 2; c.fillStyle = '#c2b496'; c.beginPath(); c.arc(cx, cx, 126, 0, 7); c.fill();
    c.strokeStyle = '#5a5040'; c.lineWidth = 3;
    [120, 96, 70, 44].forEach(r => { c.beginPath(); c.arc(cx, cx, r, 0, 7); c.stroke(); });
    for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2; c.save(); c.translate(cx + Math.cos(a) * 83, cx + Math.sin(a) * 83); c.rotate(a + Math.PI / 2); c.fillStyle = ['#b8352f', '#3f7fb8', '#2f9a8a', '#d09a3a'][k % 4]; c.fillRect(-7, -7, 14, 14); c.restore(); }   // los veinte signos, en su anillo
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; c.fillStyle = '#8a7a5a'; c.beginPath(); c.moveTo(cx + Math.cos(a) * 46, cx + Math.sin(a) * 46); c.lineTo(cx + Math.cos(a + 0.2) * 68, cx + Math.sin(a + 0.2) * 68); c.lineTo(cx + Math.cos(a - 0.2) * 68, cx + Math.sin(a - 0.2) * 68); c.fill(); }   // los rayos
    c.fillStyle = '#d4a93e'; c.beginPath(); c.arc(cx, cx, 30, 0, 7); c.fill(); c.fillStyle = '#2a221c'; c.beginPath(); c.arc(cx - 9, cx - 5, 3, 0, 7); c.arc(cx + 9, cx - 5, 3, 0, 7); c.fill(); c.fillRect(cx - 6, cx + 8, 12, 3);   // el rostro del centro
  });
  const d = new THREE.Mesh(new THREE.CircleGeometry(0.26, 32), K.matMapa(tx)); d.geometry.userData.propia = true; d.position.set(0, 0.32, 0.035); g.add(d);
  g.add(ubic(K.malla(K.cilindro(0.27, 0.27, 0.06, 28), '#b0a284', { grosor: 0.004 }), 0, 0.32, 0, Math.PI / 2, 0, 0));
  g.add(ubic(caja(K, 0.3, 0.06, 0.16, TE.piedraD, { grosor: 0.003 }), 0, 0.03, 0));
  g.scale.setScalar(1.25);
  return g;
}
export function tonalpohualli(K, n) {
  const P = pieza(ANCLAS.tonal), A = ANCLAS.tonal;
  const pe = petate(K, 0.6, 0.38); en(P, pe, A.x, A.y + 0.12);
  const co = codice(K, 0.5); en(P, co, A.x, A.y + 0.12, 0.006);
  if (n >= 1) en(P, piedraSol(K), A.x - 0.14, A.y - 0.32, 0, 0.35);
  if (n >= 2) { en(P, brasero(K), A.x + 0.44, A.y - 0.12); actor(P, K, { ...SACERDOTE, colorRopa: '#3a3430', chal: '#3f7fb8', oficio: true, k: 'tonalpouhqui' }, 'leer', A.x + 0.32, A.y + 0.4, { x: A.x, y: A.y + 0.12 }); }
  if (n >= 3) {
    const xi = new THREE.Group(); en(P, xi, A.x - 0.44, A.y + 0.32, 0, 0.5);
    for (let k = 0; k < 7; k++) xi.add(ubic(K.malla(K.cilindro(0.012, 0.012, 0.4, 4), '#c9b47a', { sinTinta: true }), (k % 4) * 0.025 - 0.035, 0.045 + Math.floor(k / 4) * 0.022, 0, 0, 0, Math.PI / 2));
    [-0.13, 0.13].forEach(x => xi.add(ubic(K.malla(K.toro(0.045, 0.009, Math.PI * 2, 0.5), TE.rojo, { sinTinta: true }), x, 0.055, 0, 0, Math.PI / 2, 0)));
    const to = new THREE.Group(); en(P, to, A.x, A.y + 0.12);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => to.add(ubic(K.malla(K.cilindro(0.012, 0.012, 0.66, 4), TE.maderaD, { sinTinta: true }), a * 0.34, 0.33, b * 0.24)));
    const tl = caja(K, 0.76, 0.014, 0.56, TE.paja, { grosor: 0.002 }); tl.position.y = 0.66; to.add(tl);
  }
  return P;
}

/* ---------- 56 · LA PALABRA ANTIGUA: el lugar de la palabra, en la plaza del barrio ---------- */
/* 0: el banco de piedra y el anciano de pie · 1: la partera con el recién nacido en brazos · 2: los jóvenes sentados que
   escuchan · 3: el fraile con su cuaderno, que copia lo que le dictan los viejos (Olmos, hacia 1535) */
export function palabra(K, n) {
  const P = pieza(ANCLAS.palabra), A = ANCLAS.palabra;
  en(P, caja(K, 0.6, 0.12, 0.2, TE.piedra, { grosor: 0.003 }), A.x, A.y - 0.22);
  const anc = actor(P, K, { ...ANCIANO, oficio: true, k: 'anciano' }, 'narrar', A.x, A.y - 0.05, { x: A.x + 0.3, y: A.y + 1 });
  if (n >= 1) actor(P, K, { ...PARTERA, oficio: true, k: 'partera' }, 'quieto', A.x - 0.46, A.y + 0.05, { x: A.x + 0.2, y: A.y + 0.8 });
  if (n >= 2) [[0.34, 0.38], [-0.1, 0.48]].forEach(([dx, dz], i) => actor(P, K, { ...joven(i + 8), edad: undefined, oficio: true, k: 'oyente' + i }, 'suelo', A.x + dx, A.y + dz, { x: A.x, y: A.y - 0.05 }));
  if (n >= 3) {
    const me = new THREE.Group(); en(P, me, A.x + 0.58, A.y + 0.62, 0, -0.4);   // detrás de los que escuchan: la bajada del puente queda libre
    me.add(ubic(caja(K, 0.28, 0.022, 0.2, TE.madera, { grosor: 0.002 }), 0, 0.26, 0));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => me.add(ubic(K.malla(K.cilindro(0.009, 0.009, 0.26, 4), TE.maderaD, { sinTinta: true }), a * 0.11, 0.13, b * 0.08)));
    me.add(ubic(caja(K, 0.13, 0.012, 0.17, '#f6f0de', { grosor: 0.0015 }), 0.02, 0.278, 0));
    actor(P, K, { piel: 0, pelo: 'rapado', ropa: 'tunica', colorRopa: '#5a4a3a', orla: '#3a2e24', chal: '#4a3c2e', oficio: true, k: 'fraile' }, 'escribir', A.x + 0.8, A.y + 0.78, { x: A.x + 0.58, y: A.y + 0.62 });
  }
  P.toc = [{ x: A.x, y: A.y, k: 'anciano', p: anc }];
  return P;
}

/* LAS PIEZAS: con su índice de saber para la auditoría de etapas (juego3d/qa.html) */
export const PIEZAS = [
  { id: 'amate', i: 51, crear: amate },
  { id: 'telpochcalli', i: 52, crear: telpochcalli },
  { id: 'calmecac', i: 53, crear: calmecac },
  { id: 'cuicacalli', i: 54, crear: cuicacalli },
  { id: 'tonalpohualli', i: 55, crear: tonalpohualli },
  { id: 'palabra', i: 56, crear: palabra },
];
