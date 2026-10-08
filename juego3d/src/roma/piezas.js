/* ============================================================
   roma/piezas
   Los seis saberes de Roma en 3D, cada uno con sus etapas (la máxima del proyecto: subir de nivel se VE, con piezas
   nuevas y no con brillos; se audita por diff de píxeles en juego3d/qa.html): el ludus (75), los calculi (76), el
   grammaticus (77), el rétor (78), la escuela pagada (79) y la Institutio Oratoria (80). A la escala de las ínsulas:
   la pérgola, la sala y el pórtico miden lo que una casa (1,1-1,3 de alto), y las cosas de adentro, lo que su gente.
   EL ACUERDO CON LA ÉPOCA (epoca14.js): en las tres escuelas el maestro se para en MAESTRO_SALA (ancla − 0,32 en x y en
   z, mirando a la cámara) y sus alumnos se sientan en el arco de adelante (+x +z), en los asientos libres que epoca14
   busca cada vez que cambian las piezas. Cada escuela va DETRÁS de su maestro y le deja libre ese arco: el ludus justo
   atrás; la sala del grammaticus atrás a la izquierda (atrás pasa el camino de basalto); el pórtico del rétor atrás a la
   derecha (atrás está la domus). Las tres son cuartos con las dos paredes del fondo (−x, −z) y abiertos hacia la cámara;
   sus techos los mide la huella, y por eso nadie se sienta ni camina debajo. Los calculi y la Institutio tienen a su
   maestro detrás del ancla (epoca14, MAESTROS): la mesa queda entre él y su corro, y lo demás a sus costados.
   Más la gente de la época: los niños de la escuela, los romanos del Foro, el pedagogo, los maestros, Plinio y Quintiliano.
   ============================================================ */
import * as THREE from 'three';
import { pieza } from '../piezas.js';
import * as L from './lugares.js';
import { RO, columna, tejado, tejadoUnAgua, matLadrillo } from './monumentos.js';
import { textura, matTex, lamina, anfora } from '../agora/monumentos.js';

const ubic = (m, x, y, z, rx = 0, ry = 0, rz = 0) => { m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx, ry, rz); return m; };
const caja = (K, w, h, d, color, o = { grosor: 0.002 }) => K.malla(K.caja(w, h, d), color, o);
const cil = (K, r1, r2, h, n, color, o = { grosor: 0.002 }) => K.malla(K.cilindro(r1, r2, h, n), color, o);
const esf = (K, r, color, o = { grosor: 0.002 }, q = 0.5) => K.malla(K.esfera(r, q), color, o);
const en = (P, obj, x, y, h = 0, ry = 0) => { obj.position.copy(P.en(x, y)); obj.position.y += h; obj.rotation.y = ry; P.obj.add(obj); return obj; };
/* pone obj a (dx, dz) de su base B (el maestro de la escuela o el ancla de la pieza) */
const poner = (P, B, obj, dx, dz, ry = 0, h = 0) => en(P, obj, B.x + dx, B.y + dz, h, ry);
const ST = { sinTinta: true }, R4 = Math.PI / 4;
const CERA = '#4b4034', CUERO = '#8a5a34', HIERRO = '#4f4943', PAPIRO = '#efe2bf';

export const ANCLAS = {
  ludus: { x: L.LUDUS.x, y: L.LUDUS.y }, calculi: { x: L.CALCULI.x, y: L.CALCULI.y }, grammaticus: { x: L.GRAMMATICUS.x, y: L.GRAMMATICUS.y },
  rhetor: { x: L.RHETOR.x, y: L.RHETOR.y }, pagada: { x: L.PAGADA.x, y: L.PAGADA.y }, institutio: { x: L.INSTITUTIO.x, y: L.INSTITUTIO.y },
};
/* donde enseña el maestro de cada escuela (0 el ludus, 1 el grammaticus, 2 el rétor): detrás de su ancla */
export const MAESTRO_SALA = [ANCLAS.ludus, ANCLAS.grammaticus, ANCLAS.rhetor].map(A => ({ x: A.x - 0.32, y: A.y - 0.32 }));
const MS = MAESTRO_SALA;

/* ---------- las pinturas (lienzos en caché: no se liberan con la pieza) ---------- */
const cartel = (K, clave, w, h, pinta, ancho, alto) => lamina(K, matTex(K, clave, textura(clave, w, h, pinta)), ancho, alto);
const grano = (g, w, h, n, c) => { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${c},${0.035 + (i % 5) * 0.012})`; g.fillRect((i * 97) % w, (i * 53 + (i >> 3) * 7) % h, 2 + i % 3, 1 + i % 2); } };
const letras = (g, txt, x, y, tam, color, peso = 'bold', ancho) => { g.fillStyle = color; g.font = `${peso} ${tam}px "Times New Roman", Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, y, ancho); };
/* el abecedario pintado con minio en el revoque blanco (las paredes de Pompeya están llenas de abecedarios escritos) */
const pAlfabeto = (g, w, h) => {
  g.fillStyle = '#f3ead6'; g.fillRect(0, 0, w, h); grano(g, w, h, 300, '150,120,80');
  g.strokeStyle = '#a8382a'; g.lineWidth = 5; g.strokeRect(7, 7, w - 14, h - 14);
  letras(g, 'A B C D E F G H I K L M', w / 2, h * 0.33, 52, '#a8382a', 'bold', w - 34);
  letras(g, 'N O P Q R S T V X Y Z', w / 2, h * 0.72, 52, '#a8382a', 'bold', w - 34);
};
/* los números del ludus: el litterator enseñaba las letras y la cuenta */
const pNumeros = (g, w, h) => {
  g.fillStyle = '#ead29a'; g.fillRect(0, 0, w, h); grano(g, w, h, 240, '140,100,40');
  g.strokeStyle = '#a8382a'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
  letras(g, 'I  II  III  IIII  V', w / 2, h * 0.32, 44, '#3a302a', 'bold', w - 30);
  letras(g, 'VI  VII  VIII  IX  X', w / 2, h * 0.72, 44, '#3a302a', 'bold', w - 30);
};
/* la tabla de cera grande con las letras hondas para guiar el estilo (Quintiliano I, 1, 27) */
const pTablaLetras = (g, w, h) => {
  g.fillStyle = CERA; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(214,201,160,.35)'; g.lineWidth = 1; for (let y = 22; y < h; y += 26) { g.beginPath(); g.moveTo(8, y); g.lineTo(w - 8, y); g.stroke(); }
  letras(g, 'A  B  C', w / 2, h * 0.34, 34, '#d8caa6', 'normal', w - 16); letras(g, 'D  E  F', w / 2, h * 0.72, 34, '#bfb08c', 'normal', w - 16);
};
/* la cera escrita con la cursiva (el contrato, las cuentas): renglones raspados */
const pCursiva = (g, w, h) => {
  g.fillStyle = CERA; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d4c49c'; g.lineWidth = 1.6;
  for (let r = 0; r < 7; r++) { const y = 16 + r * 15; g.beginPath(); for (let x = 10; x < w - 10 - (r % 3) * 12; x += 4) g.lineTo(x, y + Math.sin(x * 0.7 + r) * 3 + (x % 11 < 2 ? -4 : 0)); g.stroke(); }
};
/* el rollo abierto de Virgilio: el papiro con sus columnas y el primer verso arriba */
const pVirgilio = (g, w, h) => {
  g.fillStyle = PAPIRO; g.fillRect(0, 0, w, h); grano(g, w, h, 160, '160,130,80');
  g.fillStyle = '#a8382a'; g.font = 'bold 8px Georgia, serif'; g.textAlign = 'left'; g.fillText('ARMA VIRVMQVE CANO', 8, 9);
  g.fillStyle = '#5a5046'; for (let c = 0; c < 3; c++) for (let r = 0; r < 9; r++) g.fillRect(8 + c * 40, 15 + r * 5.2, 26 + ((r * 7 + c * 3) % 9), 1.6);
};
/* el mapa pintado del orbe: el mar Interior al medio, Italia como una bota, Roma en rojo (Eumenio, Panegírico IX, 20-21) */
const pMapa = (g, w, h) => {
  g.fillStyle = '#8fb6c2'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; for (let i = 0; i < 26; i++) { const x = (i * 53) % w, y = 30 + (i * 37) % (h - 50); g.beginPath(); g.arc(x, y, 5, 0.2, 1.4); g.stroke(); }
  const tierra = (pts, c) => { g.fillStyle = c; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x * w, y * h) : g.moveTo(x * w, y * h)); g.closePath(); g.fill(); g.strokeStyle = '#8a6a3a'; g.lineWidth = 1.4; g.stroke(); };
  tierra([[0, 0], [1, 0], [1, 0.26], [0.88, 0.3], [0.76, 0.28], [0.7, 0.34], [0.64, 0.3], [0.56, 0.33], [0.5, 0.28], [0.42, 0.3], [0.34, 0.36], [0.26, 0.33], [0.18, 0.42], [0.1, 0.4], [0.06, 0.56], [0, 0.58]], '#e3c88e');
  tierra([[0.42, 0.29], [0.48, 0.3], [0.53, 0.41], [0.61, 0.5], [0.63, 0.57], [0.59, 0.58], [0.56, 0.53], [0.52, 0.6], [0.48, 0.58], [0.49, 0.5], [0.43, 0.39]], '#dcbf84');
  tierra([[0.66, 0.31], [0.72, 0.3], [0.75, 0.43], [0.71, 0.5], [0.68, 0.44], [0.64, 0.39]], '#e3c88e');
  tierra([[0.78, 0.28], [1, 0.24], [1, 0.66], [0.93, 0.62], [0.86, 0.47], [0.8, 0.42]], '#d9bd82');
  tierra([[0, 0.8], [0.14, 0.71], [0.3, 0.69], [0.42, 0.66], [0.5, 0.73], [0.6, 0.77], [0.72, 0.8], [0.86, 0.76], [1, 0.73], [1, 1], [0, 1]], '#e6cf98');
  [[0.53, 0.65, 0.035, 0.022], [0.4, 0.5, 0.018, 0.04], [0.73, 0.62, 0.04, 0.012], [0.88, 0.6, 0.03, 0.012]].forEach(([x, y, rx, ry]) => { g.fillStyle = '#dcbf84'; g.beginPath(); g.ellipse(x * w, y * h, rx * w, ry * h, 0, 0, 7); g.fill(); g.stroke(); });
  g.fillStyle = '#9a7a4a'; for (let i = 0; i < 14; i++) { const x = [0.2, 0.3, 0.46, 0.52, 0.7, 0.84, 0.92, 0.12, 0.36, 0.6, 0.78, 0.9, 0.26, 0.5][i] * w, y = [0.2, 0.15, 0.22, 0.4, 0.2, 0.36, 0.45, 0.88, 0.86, 0.9, 0.9, 0.84, 0.25, 0.12][i] * h; g.beginPath(); g.moveTo(x - 5, y + 4); g.lineTo(x, y - 4); g.lineTo(x + 5, y + 4); g.fill(); }
  g.strokeStyle = '#5f8fb0'; g.lineWidth = 2; g.beginPath(); g.moveTo(0.82 * w, 0.78 * h); g.lineTo(0.84 * w, 0.95 * h); g.stroke();   // el Nilo
  g.fillStyle = '#b8352f'; [[0.47, 0.43], [0.7, 0.4], [0.82, 0.77], [0.36, 0.69]].forEach(([x, y], i) => { g.beginPath(); g.arc(x * w, y * h, i ? 3 : 5, 0, 7); g.fill(); });
  g.strokeStyle = '#7a3a24'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
  g.fillStyle = '#f3ead6'; g.fillRect(w * 0.3, 9, w * 0.4, 17); letras(g, 'ORBIS TERRARVM', w / 2, 18, 13, '#7a3a24');
};
/* la inscripción de Plinio en Como (CIL V 5262, hoy en Milán): su comienzo, con las letras pintadas de rojo */
const pLapida = (g, w, h) => {
  g.fillStyle = '#f2ede2'; g.fillRect(0, 0, w, h); grano(g, w, h, 200, '120,110,90');
  g.strokeStyle = '#cfc6b3'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12); g.lineWidth = 1.5; g.strokeRect(13, 13, w - 26, h - 26);
  ['C · PLINIVS · L · F', 'OVF · CAECILIVS', 'SECVNDVS · COS', 'AVGVR'].forEach((t, i) => letras(g, t, w / 2, 40 + i * 34, i === 0 ? 21 : 19, '#9a3226', 'bold', w - 30));
  g.fillStyle = '#9a3226'; g.beginPath(); g.moveTo(w / 2 - 10, h - 40); g.lineTo(w / 2 + 10, h - 40); g.lineTo(w / 2, h - 30); g.fill();   // la hedera, la hojita que separa
};
/* los títulos escritos en los postes de la librería (Marcial I, 117: «scriptis postibus hinc et inde totis») */
const pTitulos = (g, w, h) => {
  g.fillStyle = '#efe4c8'; g.fillRect(0, 0, w, h); grano(g, w, h, 120, '140,110,70');
  for (let r = 0; r < 11; r++) { const y = 10 + r * 16.5; if (r % 3 === 0) { g.fillStyle = '#a8382a'; g.fillRect(8, y, w - 16, 4); } else { g.fillStyle = '#4a4038'; g.fillRect(10, y, w - 22 - (r * 5) % 14, 2.4); g.fillRect(10, y + 6, w - 30 + (r * 3) % 10, 2.4); } }
};
const pLetrero = (texto, fondo, tinta) => (g, w, h) => { g.fillStyle = fondo; g.fillRect(0, 0, w, h); g.strokeStyle = tinta; g.lineWidth = 4; g.strokeRect(4, 4, w - 8, h - 8); letras(g, texto, w / 2, h / 2 + 1, h * 0.52, tinta, 'bold', w - 16); };

/* ---------- los muebles y las cosas de la escuela ---------- */
function patas(K, g, w, d, h, color = RO.maderaD, gr = 0.022) { [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(ubic(caja(K, gr, h, gr, color, ST), a * (w / 2 - gr / 2 - 0.004), h / 2, b * (d / 2 - gr / 2 - 0.004)))); }
/* la cátedra del maestro: la silla de respaldo alto y redondo (la de mimbre del relieve de Neumagen), con su almohadón y su escabel */
export function catedra(K) {
  const g = new THREE.Group(), hs = 0.27;
  g.add(ubic(caja(K, 0.28, 0.035, 0.24, RO.madera), 0, hs, 0)); patas(K, g, 0.28, 0.24, hs - 0.017, RO.maderaD, 0.026);
  [-1, 1].forEach(l => g.add(ubic(caja(K, 0.012, 0.012, 0.21, RO.maderaD, ST), l * 0.12, 0.08, 0)));
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i / 8) * Math.PI, hb = 0.2 + 0.24 * Math.cos(a);
    g.add(ubic(caja(K, 0.045, hb, 0.02, i % 2 ? RO.maderaL : RO.madera, { grosor: 0.0012 }), Math.sin(a) * 0.125, hs + hb / 2, -Math.cos(a) * 0.115, 0, Math.PI - a, 0));
    g.add(ubic(caja(K, 0.05, 0.016, 0.026, RO.maderaD, ST), Math.sin(a) * 0.125, hs + hb, -Math.cos(a) * 0.115, 0, Math.PI - a, 0));
  }
  g.add(ubic(caja(K, 0.24, 0.045, 0.2, RO.tela, { grosor: 0.0015 }), 0, hs + 0.04, 0.012));
  g.add(ubic(caja(K, 0.24, 0.008, 0.2, RO.rojoD, ST), 0, hs + 0.064, 0.012));
  g.add(ubic(caja(K, 0.2, 0.05, 0.1, RO.maderaD, { grosor: 0.0015 }), 0, 0.025, 0.2)); g.add(ubic(caja(K, 0.2, 0.012, 0.1, RO.maderaL, ST), 0, 0.054, 0.2));
  return g;
}
/* la tablilla de cera en su caballete, con las letras hondas */
export function tablilla(K) {
  const g = new THREE.Group(), y = 0.42;
  [-1, 1].forEach(l => g.add(ubic(caja(K, 0.024, 0.56, 0.024, RO.maderaD, ST), l * 0.15, 0.27, 0.02, -0.14, 0, 0)));
  g.add(ubic(caja(K, 0.022, 0.52, 0.022, RO.maderaD, ST), 0, 0.25, -0.12, 0.3, 0, 0));
  g.add(ubic(caja(K, 0.36, 0.27, 0.025, RO.madera), 0, y, 0.05, -0.14, 0, 0));
  const t = cartel(K, 'ro-tablaletras', 128, 96, pTablaLetras, 0.31, 0.22); t.position.set(0, y, 0.064); t.rotation.x = -0.14; g.add(t);
  g.add(ubic(caja(K, 0.34, 0.016, 0.05, RO.maderaL, { grosor: 0.0012 }), 0, y - 0.15, 0.085));                // la repisa con el estilo
  g.add(ubic(cil(K, 0.004, 0.004, 0.13, 4, RO.bronce, ST), 0.04, y - 0.135, 0.09, 0, 0, Math.PI / 2));
  g.add(ubic(caja(K, 0.018, 0.012, 0.006, RO.bronce, ST), 0.112, y - 0.135, 0.09));
  return g;
}
/* el banco largo de los alumnos (subsellium) */
export function banco(K, l = 0.5, h = 0.2) {
  const g = new THREE.Group();
  g.add(ubic(caja(K, l, 0.03, 0.1, RO.maderaL, { grosor: 0.0015 }), 0, h - 0.015, 0));
  g.add(ubic(caja(K, l - 0.02, 0.025, 0.09, RO.madera, ST), 0, h - 0.04, 0));
  [-1, 1].forEach(s => g.add(ubic(caja(K, 0.03, h - 0.03, 0.09, RO.maderaD, { grosor: 0.0015 }), s * (l / 2 - 0.05), (h - 0.03) / 2, 0)));
  g.add(ubic(caja(K, l - 0.1, 0.02, 0.02, RO.maderaD, ST), 0, 0.06, 0));
  return g;
}
/* la cartera de cuero del alumno (loculus: Horacio, Sátiras I, 6, 74) */
function loculo(K, c = CUERO) {
  const g = new THREE.Group();
  g.add(ubic(caja(K, 0.09, 0.065, 0.045, c, { grosor: 0.0012 }), 0, 0.033, 0));
  g.add(ubic(caja(K, 0.092, 0.03, 0.048, '#5a3a22', ST), 0, 0.058, 0.002));
  g.add(ubic(K.malla(K.toro(0.035, 0.004, Math.PI, 0.5), '#5a3a22', ST), 0, 0.066, 0));
  return g;
}
/* una tablilla de cera (o el díptico cerrado, acostado) */
function tabella(K, w = 0.11, h = 0.085) {
  const g = new THREE.Group();
  g.add(caja(K, w, h, 0.012, RO.madera, { grosor: 0.0012 }));
  g.add(ubic(caja(K, w - 0.018, h - 0.018, 0.004, CERA, ST), 0, 0, 0.006));
  return g;
}
/* la lucerna en su pie (el lychnuchus): la luz de la escuela antes del amanecer. `userData.llama` se enciende de noche */
export function lampara(K, alto = 0.5) {
  const g = new THREE.Group(); g.userData.vivo = true;
  g.add(ubic(K.malla(K.cilindro(0.012, 0.016, alto, 6), RO.bronce, { grosor: 0.002 }), 0, alto / 2, 0));
  [0, 1, 2].forEach(i => { const a = i * 2.1; g.add(ubic(K.malla(K.cilindro(0.004, 0.004, 0.05, 3), RO.bronce, { sinTinta: true }), Math.sin(a) * 0.03, 0.02, Math.cos(a) * 0.03, Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.5)); });
  g.add(ubic(K.malla(K.cilindro(0.035, 0.025, 0.012, 8), RO.bronce, { grosor: 0.002 }), 0, alto, 0));
  const lu = K.malla(K.esfera(0.028, 0.5), RO.lad, { grosor: 0.002 }); lu.scale.set(1.3, 0.55, 0.9); g.add(ubic(lu, 0, alto + 0.016, 0));
  const llama = new THREE.Group(); llama.position.set(0.036, alto + 0.03, 0); g.add(llama); g.userData.llama = llama;
  llama.add(K.malla(K.esfera(0.02, 0.4), '#ffd27a', { sinTinta: true, sombra: false, emissive: '#ffb04a', emissiveIntensity: 1.3 }));
  llama.visible = false;
  return g;
}
/* el atril con el rollo abierto (el libro de Virgilio) */
export function atril(K) {
  const g = new THREE.Group();
  [0, 1, 2].forEach(i => { const a = i * 2.094; g.add(ubic(caja(K, 0.02, 0.014, 0.13, RO.maderaD, ST), Math.sin(a) * 0.05, 0.007, Math.cos(a) * 0.05, 0, a, 0)); });
  g.add(ubic(cil(K, 0.016, 0.022, 0.48, 6, RO.maderaD), 0, 0.24, 0));
  const ta = new THREE.Group(); ta.position.set(0, 0.49, 0); ta.rotation.x = 0.55; g.add(ta);
  ta.add(caja(K, 0.27, 0.018, 0.17, RO.madera));
  ta.add(ubic(caja(K, 0.27, 0.03, 0.012, RO.maderaD, ST), 0, 0.012, 0.086));
  const ho = cartel(K, 'ro-virgilio', 128, 64, pVirgilio, 0.17, 0.12); ho.rotation.x = -Math.PI / 2; ho.position.set(0, 0.011, -0.005); ta.add(ho);
  [-1, 1].forEach(l => { ta.add(ubic(cil(K, 0.018, 0.018, 0.15, 8, '#e8d9b0', { grosor: 0.0015 }), l * 0.105, 0.022, -0.005, Math.PI / 2, 0, 0)); [-1, 1].forEach(e => ta.add(ubic(esf(K, 0.008, RO.maderaD, ST, 0.4), l * 0.105, 0.022, -0.005 + e * 0.08))); });
  return g;
}
/* la capsa: la caja redonda de los rollos, con su tapa y la correa */
export function capsa(K, n = 5) {
  const g = new THREE.Group();
  g.add(ubic(K.malla(K.cilindro(0.06, 0.06, 0.14, 12), RO.maderaL, { grosor: 0.002 }), 0, 0.07, 0));
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; g.add(ubic(K.malla(K.cilindro(0.012, 0.012, 0.06, 6), i % 2 ? '#efe4c6' : '#e6d6b0', { sinTinta: true }), Math.sin(a) * 0.03, 0.16, Math.cos(a) * 0.03)); }
  g.add(ubic(cil(K, 0.062, 0.062, 0.012, 12, RO.maderaD, ST), 0, 0.03, 0));
  return g;
}
/* el pilar revocado: el tercio de abajo rojo, como los de Pompeya */
function pilar(K, h, { ancho = 0.09, campo = RO.estuco, zocalo = RO.rojo } = {}) {
  const g = new THREE.Group(), hz = h * 0.3, hc = h - 0.09 - hz;
  g.add(ubic(caja(K, ancho + 0.03, 0.05, ancho + 0.03, RO.travD), 0, 0.025, 0));
  g.add(ubic(caja(K, ancho, hz, ancho, zocalo, { grosor: 0.003 }), 0, 0.05 + hz / 2, 0));
  g.add(ubic(caja(K, ancho, hc, ancho, campo, { grosor: 0.003 }), 0, 0.05 + hz + hc / 2, 0));
  g.add(ubic(caja(K, ancho + 0.03, 0.04, ancho + 0.03, RO.travL), 0, h - 0.02, 0));
  return g;
}
/* el muro revocado y pintado a la pompeyana (largo en x, la cara pintada a +z): el zócalo oscuro, los paneles, el friso rojo y la cornisa */
function muroPintado(K, largo, alto, { campo = RO.giallo, gr = 0.003 } = {}) {
  const g = new THREE.Group(), e = 0.06, z = e / 2 + 0.003;
  g.add(ubic(caja(K, largo, alto, e, RO.estuco, { grosor: gr }), 0, alto / 2, 0));
  g.add(ubic(caja(K, largo - 0.01, 0.2, 0.008, RO.negro, ST), 0, 0.1, z));
  g.add(ubic(caja(K, largo - 0.01, 0.014, 0.01, RO.ocre, ST), 0, 0.207, z));
  const n = Math.max(2, Math.round(largo / 0.3)), pw = (largo - 0.04) / n;
  for (let i = 0; i < n; i++) {
    const x = -largo / 2 + 0.02 + (i + 0.5) * pw;
    g.add(ubic(caja(K, pw - 0.05, alto * 0.42, 0.007, campo, ST), x, 0.24 + alto * 0.24, z));
    g.add(ubic(caja(K, pw - 0.11, alto * 0.42 - 0.06, 0.009, i % 2 ? RO.rojo : '#c9a05a', ST), x, 0.24 + alto * 0.24, z + 0.001));
    g.add(ubic(esf(K, 0.016, RO.rojoD, ST, 0.4), x, 0.24 + alto * 0.24, z + 0.006));
  }
  g.add(ubic(caja(K, largo - 0.01, 0.06, 0.008, RO.rojo, ST), 0, alto - 0.08, z));
  g.add(ubic(caja(K, largo + 0.04, 0.04, e + 0.05, RO.travL), 0, alto - 0.02, 0.02));
  return g;
}
/* el busto en su pilar: Virgilio de mármol con su laurel (y el hollín de las lámparas: «haereret nigro fuligo Maroni»,
   Juvenal VII, 227), Quintiliano de bronce, viejo, con el pelo corto que le queda */
function busto(K, { color = RO.marmol, colorD = RO.marmolD, pelo = null, corona = false, hollin = false, calvo = false } = {}) {
  const g = new THREE.Group(), y = 0.525;
  g.add(ubic(caja(K, 0.17, 0.05, 0.17, RO.travD), 0, 0.025, 0));
  g.add(ubic(caja(K, 0.12, 0.44, 0.12, RO.trav, { grosor: 0.003 }), 0, 0.27, 0));
  g.add(ubic(caja(K, 0.15, 0.035, 0.15, RO.travL), 0, 0.507, 0));
  g.add(ubic(cil(K, 0.035, 0.05, 0.03, 8, colorD), 0, y + 0.015, 0));
  const pe = esf(K, 0.1, color, { grosor: 0.002 }, 0.6); pe.scale.set(1.0, 0.62, 0.55); g.add(ubic(pe, 0, y + 0.085, 0));
  g.add(ubic(caja(K, 0.035, 0.12, 0.02, colorD, ST), 0.028, y + 0.088, 0.048, 0, 0, 0.55));   // el pliegue de la toga
  g.add(ubic(cil(K, 0.026, 0.03, 0.06, 8, color), 0, y + 0.15, 0));
  const ca = esf(K, 0.052, color, { grosor: 0.002 }, 0.6); ca.scale.set(0.9, 1.08, 1.0); g.add(ubic(ca, 0, y + 0.215, 0.004));
  g.add(ubic(caja(K, 0.014, 0.026, 0.02, colorD, ST), 0, y + 0.208, 0.055));
  [-1, 1].forEach(l => g.add(ubic(caja(K, 0.01, 0.024, 0.016, colorD, ST), l * 0.047, y + 0.212, 0)));
  if (pelo) { const pc = esf(K, 0.055, pelo, ST, 0.6); pc.scale.set(0.92, calvo ? 0.5 : 0.75, 1.0); g.add(ubic(pc, 0, y + (calvo ? 0.2 : 0.235), calvo ? -0.012 : -0.006)); }
  if (calvo) { const cu = esf(K, 0.049, color, ST, 0.6); cu.scale.set(0.9, 0.72, 0.9); g.add(ubic(cu, 0, y + 0.238, 0.008)); }
  if (hollin) { const ho = esf(K, 0.05, '#55504a', ST, 0.6); ho.scale.set(0.9, 0.45, 0.95); g.add(ubic(ho, 0, y + 0.258, -0.002)); }
  if (corona) for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; if (Math.abs(Math.sin(a)) < 0.2 && Math.cos(a) > 0) continue; g.add(ubic(esf(K, 0.014, [RO.pino, RO.pinoL, RO.cipresL][i % 3], ST, 0.35), Math.sin(a) * 0.05, y + 0.24 + (i % 2) * 0.006, Math.cos(a) * 0.052)); }
  return g;
}
/* el armario de los libros (armarium): estantes abiertos con los rollos de punta y su etiqueta colgando, o con capsae */
function armario(K, { w = 0.46, h = 0.64, d = 0.15, filas = 3, cols = 4, capsae = false } = {}) {
  const g = new THREE.Group(), y0 = 0.06, t = 0.02;
  g.add(ubic(caja(K, w + 0.03, y0, d + 0.02, RO.maderaD), 0, y0 / 2, 0));
  g.add(ubic(caja(K, w, h, 0.015, RO.maderaD, { grosor: 0.002 }), 0, y0 + h / 2, -d / 2 + 0.008));
  [-1, 1].forEach(l => g.add(ubic(caja(K, t, h, d, RO.madera), l * (w / 2 - t / 2), y0 + h / 2, 0)));
  for (let f = 0; f <= filas; f++) g.add(ubic(caja(K, w, t, d, f === filas ? RO.madera : RO.maderaL, { grosor: 0.0015 }), 0, y0 + f * (h - t) / filas + t / 2, 0));
  g.add(ubic(caja(K, w + 0.05, 0.03, d + 0.04, RO.madera), 0, y0 + h + 0.015, 0.005));
  const cw = (w - 2 * t) / cols, ch = (h - t) / filas;
  if (!capsae) for (let c = 1; c < cols; c++) g.add(ubic(caja(K, 0.012, h - t, d - 0.02, RO.maderaL, ST), -w / 2 + t + c * cw, y0 + h / 2, 0.005));
  let k = 0;
  for (let f = 0; f < filas; f++) for (let c = 0; c < cols; c++, k++) {
    const x = -w / 2 + t + (c + 0.5) * cw, yb = y0 + f * ch + t;
    if (capsae) {
      if ((f * 3 + c) % 4 === 3) continue;
      g.add(ubic(cil(K, 0.034, 0.034, ch * 0.62, 10, (k % 3) ? RO.maderaL : '#b88a58', { grosor: 0.0012 }), x, yb + ch * 0.31, 0.01));
      for (let r = 0; r < 3; r++) g.add(ubic(cil(K, 0.009, 0.009, 0.04, 5, r % 2 ? PAPIRO : '#e3d2a8', ST), x - 0.012 + r * 0.012, yb + ch * 0.62 + 0.012, 0.01));
    } else {
      g.add(ubic(cil(K, 0.032, 0.032, d - 0.03, 8, k % 2 ? PAPIRO : '#e6d6b0', { grosor: 0.0012 }), x, yb + 0.034, 0.006, Math.PI / 2, 0, 0));
      g.add(ubic(esf(K, 0.01, RO.maderaD, ST, 0.35), x, yb + 0.034, d / 2 - 0.006));
      g.add(ubic(caja(K, 0.03, 0.034, 0.004, k % 3 === 1 ? RO.ocre : RO.tela, ST), x + 0.008, yb + 0.012, d / 2 - 0.004, 0, 0, 0.15));   // el sillybos, la etiqueta con el título
    }
  }
  return g;
}

/* ================= 75 · EL LUDUS: la pérgola del maestro de primeras letras =================
   FUENTES: la escuela pintada en el Foro de Pompeya (fresco de los Praedia de Julia Félix, Nápoles, MANN 9066): los niños
   en bancos bajo el pórtico, con las tablillas en las rodillas; Suetonio, De grammaticis 18 («docuit in pergula»);
   Horacio, Sátiras I, 6, 74 (la cartera y la tablilla colgadas del brazo); Quintiliano I, 1, 27 (las letras hondas en la
   tabla para guiar el estilo); Marcial IX, 68 y X, 62 (el maestro que grita antes del alba, las férulas, el verano);
   Lucrecio IV, 75 (las velas «lutea russaque», amarillas y rojas, tendidas al sol). Los abecedarios rayados en las paredes
   de Pompeya. Etapas: 0 la pérgola con su toldo y la parra · 1 los bancos (la cátedra, los subsellia, las carteras) ·
   2 las tablillas y el estilo (el caballete, las tablillas colgadas, el díptico) · 3 la pared con el alfabeto pintado,
   los números, la férula y la lámpara. */
export function ludus(K, n) {
  const A = ANCLAS.ludus, P = pieza(A), M = MS[0];
  const X0 = -0.94, X1 = -0.24, Z0 = -0.94, Z1 = -0.24, HA = 1.3, HF = 1.12, cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2;
  const piso = new THREE.Group(); poner(P, M, piso, cx, cz);
  piso.add(ubic(caja(K, 0.84, 0.03, 0.84, RO.travD, { grosor: 0.002 }), 0, 0.015, 0));
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) piso.add(ubic(caja(K, 0.19, 0.008, 0.19, (i + j) % 2 ? RO.trav : RO.travL, ST), -0.3 + i * 0.2, 0.034, -0.3 + j * 0.2));
  [[X0, Z0, HA], [X1, Z0, HA], [X0, Z1, HF]].forEach(([x, z, h]) => poner(P, M, pilar(K, h), x, z));
  const po = new THREE.Group(); poner(P, M, po, X1, Z1);
  po.add(ubic(cil(K, 0.026, 0.03, HF, 8, RO.maderaD), 0, HF / 2, 0)); po.add(ubic(cil(K, 0.045, 0.05, 0.05, 8, RO.travD), 0, 0.025, 0));
  const inc = Math.atan2(HA - HF, Z1 - Z0), lv = Math.hypot(HA - HF, Z1 - Z0) + 0.08;
  const vi = new THREE.Group(); poner(P, M, vi, cx, cz);
  vi.add(ubic(caja(K, 0.86, 0.06, 0.06, RO.madera), 0, HA + 0.03, Z0 - cz));
  vi.add(ubic(caja(K, 0.86, 0.05, 0.05, RO.madera), 0, HF + 0.025, Z1 - cz));
  [X0, X1].forEach(x => vi.add(ubic(caja(K, 0.045, 0.045, lv, RO.maderaD), x - cx, (HA + HF) / 2 + 0.05, 0, inc, 0, 0)));
  /* el toldo: franjas amarillas y rojas que bajan hacia el frente, con su ribete y los faldones colgando */
  const to = new THREE.Group(); poner(P, M, to, cx, cz, 0, (HA + HF) / 2 + 0.085); to.rotation.x = inc;
  const nF = 7, wt = 0.92, lt = lv + 0.04;
  for (let i = 0; i < nF; i++) to.add(ubic(caja(K, wt / nF, 0.012, lt, i % 2 ? RO.tela : RO.ocre, { grosor: 0.0015 }), -wt / 2 + (i + 0.5) * wt / nF, 0, 0));
  to.add(ubic(caja(K, wt + 0.01, 0.02, 0.03, RO.rojoD, ST), 0, -0.004, lt / 2));
  const fa = new THREE.Group(); poner(P, M, fa, 0, 0);
  for (let i = 0; i < nF; i++) { const x = cx - wt / 2 + (i + 0.5) * wt / nF; fa.add(ubic(caja(K, wt / nF - 0.008, 0.08, 0.008, i % 2 ? RO.tela : RO.ocre, { grosor: 0.0012 }), x, HF + 0.03, Z1 + 0.055)); }
  for (let i = 0; i < 6; i++) { const z = Z0 + 0.02 + (i + 0.5) * 0.7 / 6, y = HA - (HA - HF) * (z - Z0) / (Z1 - Z0) + 0.03; fa.add(ubic(caja(K, 0.008, 0.08, 0.7 / 6 - 0.008, i % 2 ? RO.ocre : RO.tela, { grosor: 0.0012 }), X1 + 0.055, y, z)); }
  /* la parra que sube por el poste (pergula es también el emparrado) */
  const pa = new THREE.Group(); poner(P, M, pa, X1, Z1);
  for (let k = 0; k < 9; k++) { const a = k * 1.9; pa.add(ubic(esf(K, 0.034 + (k % 3) * 0.008, [RO.hierbaD, RO.pinoL, RO.pino][k % 3], ST, 0.4), Math.cos(a) * 0.036, 0.28 + k * 0.095, Math.sin(a) * 0.036)); }
  for (let k = 0; k < 6; k++) pa.add(ubic(esf(K, 0.042, [RO.pinoL, RO.hierbaD, RO.pino][k % 3], ST, 0.4), -0.06 - k * 0.11, HF + 0.07 + (k % 2) * 0.02, 0.035));
  [[-0.17, 0], [-0.39, 0.02]].forEach(([x, dz]) => { for (let u = 0; u < 4; u++) pa.add(ubic(esf(K, 0.014, '#6a3a5a', ST, 0.35), x + (u % 2) * 0.016, HF - 0.0 - Math.floor(u / 2) * 0.022, 0.05 + dz)); });
  if (n >= 1) {
    poner(P, M, catedra(K), -0.74, -0.74, R4);
    poner(P, M, banco(K, 0.3), -0.83, -0.36, Math.PI / 2); poner(P, M, banco(K, 0.3), -0.36, -0.83, 0);
    [[-0.83, -0.46, CUERO], [-0.83, -0.26, '#6a4a2c'], [-0.46, -0.83, '#7a4a30']].forEach(([x, z, c]) => poner(P, M, loculo(K, c), x, z, R4, 0.2));
  }
  if (n >= 2) {
    poner(P, M, tablilla(K), -0.62, -0.08, R4);
    const cu = new THREE.Group(); poner(P, M, cu, 0, 0);   // las tablillas colgadas de la viga, cada una de su cordel
    [-0.84, -0.71, -0.58, -0.45, -0.33].forEach((x, i) => { cu.add(ubic(cil(K, 0.003, 0.003, 0.13, 3, '#6a5a44', ST), x, HF - 0.065, Z1)); const t = tabella(K, 0.1, 0.08); t.position.set(x, HF - 0.17, Z1); t.rotation.z = (i % 2 ? 1 : -1) * 0.06; cu.add(t); });
    [[-0.83, -0.36, 0.1], [-0.27, -0.83, -0.2]].forEach(([x, z, r]) => { const t = tabella(K, 0.1, 0.075); t.rotation.set(-Math.PI / 2, 0, r); poner(P, M, t, x, z, 0, 0.208); });
    const th = new THREE.Group(); poner(P, M, th, -0.37, -0.83, 0, 0.2);   // la theca de los estilos
    th.add(ubic(cil(K, 0.018, 0.016, 0.05, 8, RO.bronce), 0, 0.025, 0)); [-1, 0, 1].forEach(l => th.add(ubic(cil(K, 0.003, 0.003, 0.09, 3, RO.oroD, ST), l * 0.006, 0.06, 0, 0, 0, l * 0.2)));
  }
  if (n >= 3) {
    const mu = new THREE.Group(); poner(P, M, mu, 0, 0);
    const lz = Z1 - Z0 - 0.09, lx = X1 - X0 - 0.09;
    mu.add(ubic(caja(K, lx, HA - 0.02, 0.05, RO.estuco, { grosor: 0.003 }), cx, (HA - 0.02) / 2, Z0));
    mu.add(ubic(caja(K, lx, 0.17, 0.056, RO.rojo, ST), cx, 0.085, Z0));
    mu.add(ubic(caja(K, 0.05, 1.08, lz, RO.estuco, { grosor: 0.003 }), X0, 0.54, cz));
    mu.add(ubic(caja(K, 0.056, 0.17, lz, RO.rojo, ST), X0, 0.085, cz));
    const al = cartel(K, 'ro-alfabeto', 512, 176, pAlfabeto, lx - 0.04, 0.215); al.position.set(cx, 0.33, Z0 + 0.027); mu.add(al);
    const nu = cartel(K, 'ro-numeros', 512, 160, pNumeros, lz - 0.06, 0.18); nu.position.set(X0 + 0.027, 0.33, cz); nu.rotation.y = Math.PI / 2; mu.add(nu);
    mu.add(ubic(caja(K, 0.012, 0.42, 0.012, '#7a5a34', ST), X0 + 0.04, 0.72, cz + 0.1, 0.5, 0, 0));   // la férula colgada (Marcial X, 62)
    mu.add(ubic(cil(K, 0.006, 0.006, 0.05, 4, RO.bronce, ST), X0 + 0.03, 0.91, cz + 0.0, 0, 0, Math.PI / 2));
    poner(P, M, lampara(K, 0.55), -0.3, -0.6);
  }
  P.toc = [{ x: M.x + cx, y: M.y + cz, k: 'ludusRo' }];
  P.lamparas = P.obj.children.filter(o => o.userData.llama).map(o => o.userData.llama);
  return P;
}

/* ================= 76 · LOS CALCULI: las piedrecillas, la tabla de contar y el ábaco =================
   FUENTES: calculus es la piedrecilla (Cicerón: «calculos subducere», hacer la cuenta); la tabla de Salamina (mármol con
   sus líneas de unidades, decenas, centenas; Museo Epigráfico de Atenas); el ábaco romano de bronce, de ranuras con sus
   cuentas (cuatro abajo, una arriba; los del Museo Nazionale Romano y del Cabinet des Médailles); Horacio, Sátiras I, 6,
   74-75 (los niños van a la escuela a aprender a contar); la mesa del cambista (mensa argentaria) y la balanza de bronce
   (libra) de los hallazgos de Pompeya. El maestro está detrás del ancla (epoca14): la tabla, entre él y su corro.
   Etapas: 0 el montoncito de piedras (la estera, el cesto) · 1 la tabla de contar · 2 el ábaco · 3 la mesa del cambista
   con la balanza, las monedas y la bolsa. */
function montoncito(K) {
  const g = new THREE.Group(), C = ['#f2eee4', '#d8d2c4', '#bdb6aa', '#6a625a', '#c98e6a'];
  g.add(ubic(caja(K, 0.36, 0.012, 0.28, '#c9a86a', { grosor: 0.0012 }), 0, 0.006, 0));
  for (let k = 0; k < 6; k++) g.add(ubic(caja(K, 0.36, 0.003, 0.012, '#a88a52', ST), 0, 0.013, -0.12 + k * 0.048));
  let k = 0;
  for (let c = 0; c < 4; c++) { const nr = 10 - c * 3, rr = 0.075 - c * 0.022; for (let i = 0; i < nr; i++) { const a = i / nr * Math.PI * 2 + c; g.add(ubic(esf(K, 0.015, C[(k++ * 7) % 5], ST, 0.35), -0.05 + Math.cos(a) * rr, 0.026 + c * 0.019, Math.sin(a) * rr)); } }
  const ce = new THREE.Group(); ce.position.set(0.12, 0, 0.05); g.add(ce);
  ce.add(ubic(cil(K, 0.066, 0.05, 0.1, 10, '#b8925a'), 0, 0.05, 0));
  [0.03, 0.06].forEach(y => ce.add(ubic(cil(K, 0.064 - y * 0.15, 0.06 - y * 0.15, 0.008, 10, '#8a6a3a', ST), 0, y, 0)));
  ce.add(ubic(cil(K, 0.069, 0.069, 0.014, 10, '#8a6a3a', ST), 0, 0.1, 0));
  for (let i = 0; i < 7; i++) { const a = i * 2.3; ce.add(ubic(esf(K, 0.014, C[i % 5], ST, 0.35), Math.cos(a) * 0.03, 0.105, Math.sin(a) * 0.03)); }
  [[0.13, -0.1], [-0.15, 0.1], [0.02, 0.12], [-0.17, -0.09]].forEach(([x, z], i) => g.add(ubic(esf(K, 0.013, C[(i + 2) % 5], ST, 0.35), x, 0.02, z)));
  const sa = esf(K, 0.045, CUERO, { grosor: 0.0015 }, 0.5); sa.scale.set(1, 0.8, 0.9); g.add(ubic(sa, -0.14, 0.04, -0.07));
  g.add(ubic(cil(K, 0.012, 0.02, 0.03, 6, '#6a4228', ST), -0.14, 0.085, -0.07));
  return g;
}
function tablaContar(K) {
  const g = new THREE.Group(), w = 0.58, d = 0.3, h = 0.3;
  [-1, 1].forEach(l => { g.add(ubic(caja(K, 0.06, h - 0.04, d - 0.08, RO.travD, { grosor: 0.002 }), l * (w / 2 - 0.09), (h - 0.04) / 2, 0)); g.add(ubic(caja(K, 0.1, 0.03, d - 0.03, RO.trav), l * (w / 2 - 0.09), 0.015, 0)); g.add(ubic(caja(K, 0.09, 0.025, d - 0.05, RO.travL, ST), l * (w / 2 - 0.09), h - 0.052, 0)); });
  g.add(ubic(caja(K, w, 0.04, d, RO.marmol, { grosor: 0.002 }), 0, h - 0.02, 0));
  g.add(ubic(caja(K, w + 0.01, 0.012, d + 0.01, RO.marmolD, ST), 0, h - 0.044, 0));
  for (let i = 0; i < 7; i++) g.add(ubic(caja(K, 0.005, 0.003, d * 0.62, RO.sombra, ST), -0.18 + i * 0.06, h + 0.0015, 0.03));
  g.add(ubic(caja(K, 0.4, 0.003, 0.005, RO.sombra, ST), 0, h + 0.0015, -0.04));
  for (let i = 0; i < 7; i++) for (let k = 0; k < (i * 3 + 2) % 5; k++) g.add(ubic(esf(K, 0.012, k % 2 ? '#f2eee4' : '#d8d2c4', ST, 0.35), -0.18 + i * 0.06, h + 0.011, 0.11 - k * 0.028));
  for (let i = 0; i < 3; i++) g.add(ubic(esf(K, 0.012, '#6a625a', ST, 0.35), -0.15 + i * 0.09, h + 0.011, -0.085));
  return g;
}
/* el ábaco de bronce, grande para la clase: ocho ranuras largas (cuatro cuentas) y ocho cortas (una), en su caballete */
export function abaco(K) {
  const g = new THREE.Group(), w = 0.44, hp = 0.3, y0 = 0.32;
  [-1, 1].forEach(l => { g.add(ubic(caja(K, 0.03, y0 + hp + 0.04, 0.03, RO.maderaD), l * (w / 2 + 0.015), (y0 + hp + 0.04) / 2, 0)); g.add(ubic(caja(K, 0.05, 0.03, 0.2, RO.maderaD, ST), l * (w / 2 + 0.015), 0.015, 0)); });
  g.add(ubic(caja(K, w + 0.03, 0.025, 0.04, RO.madera), 0, y0 - 0.012, 0.005));
  g.add(ubic(caja(K, w, hp, 0.025, RO.bronce), 0, y0 + hp / 2, 0));
  g.add(ubic(caja(K, w - 0.04, hp - 0.04, 0.006, '#a07a46', ST), 0, y0 + hp / 2, 0.014));
  for (let i = 0; i < 8; i++) {
    const x = -0.17 + i * 0.0486, k = (i * 3 + 1) % 5;
    g.add(ubic(caja(K, 0.009, 0.15, 0.004, RO.hueco, ST), x, y0 + 0.1, 0.018)); g.add(ubic(caja(K, 0.009, 0.06, 0.004, RO.hueco, ST), x, y0 + 0.24, 0.018));
    for (let b = 0; b < 4; b++) g.add(ubic(esf(K, 0.012, RO.oro, ST, 0.35), x, y0 + (b < k ? 0.162 - b * 0.026 : 0.04 + (3 - b) * 0.026), 0.024));
    g.add(ubic(esf(K, 0.012, RO.oroD, ST, 0.35), x, y0 + (i % 3 === 0 ? 0.218 : 0.258), 0.024));
  }
  g.add(ubic(caja(K, w - 0.03, 0.012, 0.01, RO.oroD, ST), 0, y0 + 0.195, 0.02));
  const ro = cartel(K, 'ro-abaco', 128, 32, pLetrero('M  C  X  I', '#e9dcc0', '#6a4a2c'), 0.26, 0.055); ro.position.set(0, y0 + hp + 0.035, 0.016); g.add(ro);
  g.add(ubic(caja(K, 0.29, 0.07, 0.02, RO.madera), 0, y0 + hp + 0.035, 0.002));
  return g;
}
function monedas(K, g, x, z, y, n, color) { for (let i = 0; i < n; i++) g.add(ubic(cil(K, 0.017, 0.017, 0.006, 8, color, ST), x + (i % 2) * 0.002, y + 0.003 + i * 0.0065, z)); }
function mesaCambista(K) {
  const g = new THREE.Group(), w = 0.42, d = 0.26, h = 0.34;
  g.add(ubic(caja(K, w, 0.03, d, RO.madera), 0, h - 0.015, 0)); g.add(ubic(caja(K, w + 0.012, 0.01, d + 0.012, RO.maderaL, ST), 0, h + 0.004, 0));
  patas(K, g, w, d, h - 0.03, RO.maderaD, 0.026);
  g.add(ubic(caja(K, w - 0.02, 0.13, 0.006, RO.tela, { grosor: 0.001 }), 0, h - 0.095, d / 2 + 0.004));
  g.add(ubic(caja(K, w - 0.02, 0.014, 0.008, RO.ocre, ST), 0, h - 0.158, d / 2 + 0.006));
  const li = new THREE.Group(); li.position.set(-0.08, h + 0.008, -0.03); g.add(li);
  li.add(ubic(cil(K, 0.032, 0.036, 0.016, 8, RO.bronce), 0, 0.008, 0));
  li.add(ubic(cil(K, 0.006, 0.007, 0.26, 6, RO.bronce), 0, 0.14, 0));
  li.add(ubic(esf(K, 0.012, RO.oroD, ST, 0.4), 0, 0.275, 0));
  li.add(ubic(caja(K, 0.27, 0.01, 0.01, RO.oroD), 0, 0.268, 0, 0, 0, 0.06));
  [-1, 1].forEach(l => { const yb = 0.268 + l * 0.0081, x = l * 0.128; [-1, 1].forEach(e => li.add(ubic(cil(K, 0.0015, 0.0015, 0.17, 3, RO.oroD, ST), x + e * 0.02, yb - 0.085, 0, 0, 0, e * 0.12))); li.add(ubic(cil(K, 0.048, 0.036, 0.014, 10, RO.bronce, { grosor: 0.0012 }), x, yb - 0.172, 0)); });
  monedas(K, li, 0.128, 0, 0.268 + 0.0081 - 0.165, 3, RO.oro);
  monedas(K, g, 0.08, 0.08, h + 0.009, 6, RO.oro); monedas(K, g, 0.13, 0.06, h + 0.009, 4, '#c9cdd0'); monedas(K, g, 0.18, 0.085, h + 0.009, 7, '#b98a5a'); monedas(K, g, -0.16, 0.08, h + 0.009, 3, '#c9cdd0');
  const bo = esf(K, 0.05, CUERO, { grosor: 0.0015 }, 0.5); bo.scale.set(1, 0.85, 0.9); g.add(ubic(bo, 0.16, h + 0.05, -0.07));
  g.add(ubic(cil(K, 0.012, 0.022, 0.035, 6, '#6a4228', ST), 0.16, h + 0.1, -0.07));
  const ar = new THREE.Group(); ar.position.set(0, 0, -0.02); g.add(ar);   // la caja de hierro bajo la mesa
  ar.add(ubic(caja(K, 0.22, 0.13, 0.15, RO.maderaD), 0, 0.065, 0)); [-0.06, 0.06].forEach(x => ar.add(ubic(caja(K, 0.018, 0.135, 0.155, HIERRO, ST), x, 0.065, 0)));
  return g;
}
export function calculi(K, n) {
  const A = ANCLAS.calculi, P = pieza(A);
  poner(P, A, montoncito(K), 0.05, -0.55, 0.3);
  if (n >= 1) poner(P, A, tablaContar(K), -0.22, -0.08, R4);
  if (n >= 2) {
    poner(P, A, abaco(K), 0.3, -0.42, R4);
    const ma = new THREE.Group(); poner(P, A, ma, -0.22, -0.08, R4, 0.3);   // y en la tabla, el ábaco de mano
    ma.add(ubic(caja(K, 0.12, 0.012, 0.09, RO.bronce), 0.13, 0.006, -0.06)); for (let i = 0; i < 6; i++) ma.add(ubic(caja(K, 0.006, 0.004, 0.06, RO.hueco, ST), 0.09 + i * 0.016, 0.013, -0.06));
  }
  if (n >= 3) poner(P, A, mesaCambista(K), 0.42, -0.02, 0);
  P.toc = [n >= 1 ? { x: A.x - 0.22, y: A.y - 0.08, k: 'tiber' } : { x: A.x + 0.05, y: A.y - 0.55, k: 'tiber' }];
  return P;
}

/* ================= 77 · EL GRAMMATICUS: la sala con la cátedra y el rollo de Virgilio =================
   FUENTES: el relieve de la escuela de Neumagen (Trier, Rheinisches Landesmuseum, ~180-200 d. C.): el maestro en su
   cátedra de respaldo redondo entre dos alumnos con rollos, y un tercero que llega con su capsa; Suetonio, De
   grammaticis 16 (Cecilio Epirota, el primero en leer a Virgilio en la escuela); Quintiliano I, 8, 5 (se empieza por
   Homero y Virgilio); Juvenal VII, 226-227 (Horacio desteñido y Virgilio negro del hollín de las lámparas); Eumenio,
   Panegíricos latinos IX, 20-21 (el orbe pintado en los pórticos de la escuela de Autun, para aprender dónde queda
   cada cosa). Atrás del maestro pasa el camino: la sala queda atrás a su izquierda, abierta hacia él y hacia la cámara.
   Etapas: 0 la cátedra sobre su estrado, con el atril y el rollo · 1 la sala (las dos paredes pintadas, las pilastras y
   el alero) · 2 los estantes con capsae · 3 el mapa pintado y el busto de Virgilio. */
export function grammaticus(K, n) {
  const A = ANCLAS.grammaticus, P = pieza(A), M = MS[1];
  const X0 = -1.0, X1 = -0.2, Z0 = -0.3, Z1 = 0.5, H = 1.05, cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2;
  const es = new THREE.Group(); poner(P, M, es, -0.62, 0.12);
  es.add(ubic(caja(K, 0.44, 0.06, 0.4, RO.travD), 0, 0.03, 0)); es.add(ubic(caja(K, 0.4, 0.012, 0.36, RO.trav, ST), 0, 0.066, 0));
  poner(P, M, catedra(K), -0.64, 0.1, R4, 0.072);
  poner(P, M, atril(K), -0.31, 0.34, R4);
  poner(P, M, capsa(K, 5), -0.88, 0.4);
  if (n >= 1) {
    poner(P, M, muroPintado(K, X1 - X0 + 0.02, H), cx + 0.01, Z0);
    poner(P, M, muroPintado(K, Z1 - Z0, H, { campo: '#e9d8a6' }), X0, cz + 0.03, Math.PI / 2);
    [[X0, Z0], [X1 + 0.02, Z0], [X0, Z1 + 0.02]].forEach(([x, z]) => poner(P, M, pilar(K, H + 0.04, { ancho: 0.1, campo: RO.travL, zocalo: RO.trav }), x, z));
    const al1 = tejadoUnAgua(K, X1 - X0 + 0.1, 0.24, 0.07); poner(P, M, al1, cx + 0.01, Z0 + 0.1, 0, H + 0.04);
    const al2 = tejadoUnAgua(K, Z1 - Z0 + 0.1, 0.24, 0.07); poner(P, M, al2, X0 + 0.1, cz + 0.03, Math.PI / 2, H + 0.04);
  }
  if (n >= 2) {
    poner(P, M, armario(K, { w: 0.44, h: 0.64, capsae: true }), -0.6, Z0 + 0.12);
    poner(P, M, capsa(K, 6), -0.9, 0.2, 0.6);
  }
  if (n >= 3) {
    const ma = new THREE.Group(); poner(P, M, ma, X0 + 0.07, 0.18, Math.PI / 2);
    ma.add(ubic(caja(K, 0.52, 0.38, 0.025, RO.maderaD), 0, 0.6, 0));
    const mp = cartel(K, 'ro-mapa', 256, 176, pMapa, 0.47, 0.33); mp.position.set(0, 0.6, 0.014); ma.add(mp);
    poner(P, M, busto(K, { corona: true, hollin: true, pelo: RO.marmolD }), X1 - 0.08, Z0 + 0.16, R4);
  }
  P.toc = [{ x: M.x - 0.64, y: M.y + 0.1, k: 'grammaticusRo' }];
  return P;
}

/* ================= 78 · EL RÉTOR: la tarima de la declamación =================
   FUENTES: Séneca el Viejo, Controversiae y Suasoriae (los prefacios: la escuela del rétor llena de oyentes, el que
   declama de pie); Quintiliano II, 2 (el maestro, los alumnos que declaman y los aplausos) y II, 10; Juvenal VII,
   150-154 (la clase entera que mata tiranos); Plinio, Epístolas II, 11, 14 y VI, 2, 5-7, y Marcial VI, 35 (las clepsidras
   que miden el turno del orador: «septem clepsydras»); la clepsidra de terracota del Ágora de Atenas (~400 a. C.).
   Atrás del maestro está la esquina de la domus: el pórtico queda atrás a su derecha.
   Etapas: 0 la tarima con sus gradas y su baranda · 1 el pórtico (seis columnas toscanas, el arquitrabe, el tejado) ·
   2 la cátedra del rétor y el banco de los oyentes · 3 la clepsidra con el ánfora para llenarla. */
export function tarima(K) {
  const g = new THREE.Group(), w = 0.42, d = 0.42, h = 0.19;
  g.add(ubic(caja(K, w + 0.04, 0.03, d + 0.04, RO.travD), 0, 0.015, 0));
  g.add(ubic(caja(K, w, h - 0.01, d, RO.trav, { grosor: 0.002 }), 0, (h - 0.01) / 2, 0));
  g.add(ubic(caja(K, w + 0.02, 0.02, d + 0.02, RO.travL, ST), 0, h - 0.035, 0));
  for (let i = 0; i < 6; i++) g.add(ubic(caja(K, w / 6 - 0.004, 0.02, d, [RO.madera, RO.maderaL, RO.madera, '#a8774a', RO.maderaL, RO.madera][i], { grosor: 0.0012 }), -w / 2 + (i + 0.5) * w / 6, h, 0));
  g.add(ubic(caja(K, w * 0.66, h * 0.66, 0.08, RO.travL, { grosor: 0.0015 }), 0, h * 0.33, d / 2 + 0.04));
  g.add(ubic(caja(K, w * 0.66, h * 0.33, 0.07, RO.trav, { grosor: 0.0015 }), 0, h * 0.165, d / 2 + 0.115));
  for (let i = 0; i < 6; i++) g.add(ubic(cil(K, 0.008, 0.01, 0.15, 5, RO.maderaD, ST), -w / 2 + 0.03 + i * (w - 0.06) / 5, h + 0.085, -d / 2 + 0.02));
  [-1, 1].forEach(l => { for (let i = 1; i < 4; i++) g.add(ubic(cil(K, 0.008, 0.01, 0.15, 5, RO.maderaD, ST), l * (w / 2 - 0.02), h + 0.085, -d / 2 + 0.02 + i * 0.1)); g.add(ubic(caja(K, 0.025, 0.02, d - 0.12, RO.madera), l * (w / 2 - 0.02), h + 0.165, -0.04)); });
  g.add(ubic(caja(K, w, 0.02, 0.025, RO.madera), 0, h + 0.165, -d / 2 + 0.02));
  return g;
}
function clepsidra(K) {
  const g = new THREE.Group(), AG = '#9cc4d0';
  g.add(ubic(caja(K, 0.2, 0.04, 0.22, RO.travD), 0, 0.02, 0)); g.add(ubic(caja(K, 0.17, 0.012, 0.19, RO.trav, ST), 0, 0.046, 0));
  g.add(ubic(caja(K, 0.035, 0.6, 0.035, RO.maderaD), 0, 0.33, -0.08));
  g.add(ubic(caja(K, 0.03, 0.03, 0.13, RO.madera), 0, 0.6, -0.025));
  g.add(ubic(K.malla(K.toro(0.075, 0.008, Math.PI * 2, 0.5), RO.oroD, ST), 0, 0.615, 0.03, Math.PI / 2, 0, 0));
  g.add(ubic(cil(K, 0.08, 0.052, 0.14, 12, RO.bronce), 0, 0.66, 0.03));   // la vasija de arriba, la que se vacía
  g.add(ubic(cil(K, 0.086, 0.086, 0.014, 12, RO.oroD, ST), 0, 0.732, 0.03));
  g.add(ubic(cil(K, 0.072, 0.072, 0.004, 12, AG, ST), 0, 0.72, 0.03));
  g.add(ubic(cil(K, 0.008, 0.006, 0.03, 6, RO.oroD, ST), 0, 0.578, 0.03));
  g.add(ubic(cil(K, 0.004, 0.004, 0.43, 4, AG, ST), 0, 0.36, 0.03));       // el chorrito
  g.add(ubic(cil(K, 0.075, 0.058, 0.11, 12, RO.lad), 0, 0.105, 0.03));   // la de abajo, de barro
  g.add(ubic(cil(K, 0.065, 0.065, 0.004, 12, AG, ST), 0, 0.148, 0.03));
  g.add(ubic(cil(K, 0.08, 0.08, 0.012, 12, RO.ladD, ST), 0, 0.158, 0.03));
  for (let k = 0; k < 5; k++) g.add(ubic(caja(K, 0.025, 0.004, 0.004, RO.negro, ST), 0, 0.63 + k * 0.022, 0.111));   // las marcas del nivel
  const an = anfora(K, 0.6, '#b56f44'); an.position.set(0.13, 0.04, 0.05); g.add(an);
  return g;
}
export function rhetor(K, n) {
  const A = ANCLAS.rhetor, P = pieza(A), M = MS[2];
  const XS = [-0.18, 0.23, 0.64], ZS = [-0.96, -0.24], HC = 0.98, cx = 0.23, cz = -0.6;
  poner(P, M, tarima(K), 0.03, -0.64);
  if (n >= 1) {
    XS.forEach(x => ZS.forEach(z => poner(P, M, columna(K, HC, 0.042, { orden: 'toscano', estriada: false, color: RO.trav, capitel: RO.travL, lados: 10 }), x, z)));
    const ar = new THREE.Group(); poner(P, M, ar, cx, cz);
    ZS.forEach(z => { ar.add(ubic(caja(K, 0.94, 0.07, 0.1, RO.travL), 0, HC + 0.035, z - cz)); ar.add(ubic(caja(K, 0.94, 0.02, 0.11, RO.trav, ST), 0, HC + 0.075, z - cz)); });
    [XS[0], XS[2]].forEach(x => ar.add(ubic(caja(K, 0.1, 0.07, 0.62, RO.travL), x - cx, HC + 0.035, 0)));
    const te = tejado(K, 0.92, 1.0, 0.2, { frontis: RO.trav }); poner(P, M, te, cx, cz, Math.PI / 2, HC + 0.085);
  }
  if (n >= 2) {
    poner(P, M, catedra(K), 0.5, -0.8, -R4);
    poner(P, M, banco(K, 0.3), 0.58, -0.47, Math.PI / 2);
    poner(P, M, capsa(K, 4), 0.58, -0.55, 0, 0.2);
    const ro = new THREE.Group(); poner(P, M, ro, 0.58, -0.38, 0, 0.2); ro.add(ubic(cil(K, 0.016, 0.016, 0.11, 8, PAPIRO, { grosor: 0.0012 }), 0, 0.016, 0, Math.PI / 2, 0, 0));
  }
  if (n >= 3) poner(P, M, clepsidra(K), 0.42, -0.32, -0.3);
  P.toc = [{ x: M.x + 0.03, y: M.y - 0.62, k: 'rhetorRo' }];
  return P;
}

/* ================= 79 · LA ESCUELA PAGADA: el arca del municipio y el contrato =================
   FUENTES: Plinio el Joven, Epístolas IV, 13 (en Como no hay maestros y los hijos se van a estudiar a Milán: Plinio pone
   un tercio de lo que se junte, para que sean los padres los que contraten, «conducendi», a los maestros); las tablillas
   de cera con los sellos de los testigos (el archivo de L. Cecilio Jucundo en Pompeya); la inscripción de Plinio en
   Como (CIL V 5262); el arca ferrata de la casa de los Vettii (Pompeya). Plinio se para a su lado (epoca14).
   Etapas: 0 el arca con las monedas y las bolsas · 1 la tablilla del contrato, abierta en su caballete, con los sellos ·
   2 la mesa del cuestor, con su silla, las cuentas y las pilas de monedas · 3 la lápida con la dedicatoria. */
export function arca(K) {
  const g = new THREE.Group(), w = 0.4, h = 0.24, d = 0.28, y0 = 0.05;
  g.add(ubic(caja(K, w + 0.06, y0, d + 0.06, RO.travD), 0, y0 / 2, 0));
  g.add(ubic(caja(K, w, h, d, RO.maderaD), 0, y0 + h / 2, 0));
  [-0.13, 0, 0.13].forEach(x => g.add(ubic(caja(K, 0.026, h + 0.006, d + 0.006, HIERRO, ST), x, y0 + h / 2, 0)));
  [0.08, 0.18].forEach(y => g.add(ubic(caja(K, w + 0.006, 0.02, d + 0.006, '#5c544c', ST), 0, y0 + y, 0)));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(ubic(caja(K, 0.04, h + 0.01, 0.04, RO.bronce, ST), a * (w / 2 - 0.012), y0 + h / 2, b * (d / 2 - 0.012))));
  for (let i = 0; i < 6; i++) g.add(ubic(esf(K, 0.008, RO.oro, ST, 0.3), -0.17 + i * 0.068, y0 + h - 0.02, d / 2 + 0.004));
  g.add(ubic(caja(K, 0.07, 0.08, 0.008, RO.oroD, ST), 0, y0 + h * 0.55, d / 2 + 0.006)); g.add(ubic(caja(K, 0.012, 0.03, 0.004, RO.hueco, ST), 0, y0 + h * 0.55, d / 2 + 0.011));
  const ta = new THREE.Group(); ta.position.set(0, y0 + h, -d / 2); ta.rotation.x = -1.85; g.add(ta);
  ta.add(ubic(caja(K, w + 0.01, 0.035, d + 0.01, RO.madera), 0, 0.017, d / 2));
  [-0.13, 0, 0.13].forEach(x => ta.add(ubic(caja(K, 0.026, 0.04, d + 0.016, HIERRO, ST), x, 0.017, d / 2)));
  g.add(ubic(caja(K, w - 0.03, 0.01, d - 0.03, RO.hueco, ST), 0, y0 + h - 0.028, 0));
  for (let i = 0; i < 30; i++) { const a = i * 2.4, r = 0.02 + (i % 7) * 0.018; g.add(ubic(cil(K, 0.016, 0.016, 0.005, 8, i % 3 ? RO.oro : '#c9cdd0', ST), Math.cos(a) * r * 1.35, y0 + h - 0.018 + (i % 4) * 0.006, Math.sin(a) * r * 0.85, 0.3 * Math.sin(i), 0, 0.3 * Math.cos(i))); }
  return g;
}
function saco(K, s = 1) {
  const g = new THREE.Group();
  const b = esf(K, 0.06 * s, '#c9b48a', { grosor: 0.0015 }, 0.5); b.scale.set(1, 0.85, 0.95); g.add(ubic(b, 0, 0.05 * s, 0));
  g.add(ubic(cil(K, 0.015 * s, 0.03 * s, 0.045 * s, 6, '#b39c70', ST), 0, 0.115 * s, 0)); g.add(ubic(cil(K, 0.018 * s, 0.018 * s, 0.008, 6, RO.tela, ST), 0, 0.1 * s, 0));
  return g;
}
function contrato(K) {
  const g = new THREE.Group(), y = 0.5;
  [-1, 1].forEach(l => g.add(ubic(caja(K, 0.024, 0.62, 0.024, RO.maderaD, ST), l * 0.17, 0.3, 0.02, -0.12, 0, 0)));
  g.add(ubic(caja(K, 0.022, 0.58, 0.022, RO.maderaD, ST), 0, 0.28, -0.13, 0.3, 0, 0));
  g.add(ubic(caja(K, 0.4, 0.022, 0.06, RO.madera, { grosor: 0.0015 }), 0, y - 0.135, 0.06));
  [-1, 1].forEach(l => { const ho = new THREE.Group(); ho.position.set(0, y, 0.05); ho.rotation.set(-0.12, -l * 0.32, 0); g.add(ho);
    ho.add(ubic(caja(K, 0.17, 0.24, 0.014, RO.madera, { grosor: 0.0015 }), l * 0.087, 0, 0));
    const p = cartel(K, 'ro-cursiva', 128, 128, pCursiva, 0.145, 0.21); p.position.set(l * 0.087, 0, 0.008); ho.add(p); });
  g.add(ubic(cil(K, 0.002, 0.002, 0.2, 3, '#8a7452', ST), 0.0, y - 0.24, 0.07, 0, 0, Math.PI / 2));   // el cordel con los sellos de los testigos
  for (let i = 0; i < 5; i++) g.add(ubic(cil(K, 0.012, 0.012, 0.008, 8, '#a8382a', ST), -0.08 + i * 0.04, y - 0.24, 0.074, Math.PI / 2, 0, 0));
  return g;
}
function mesaCuestor(K) {
  const g = new THREE.Group(), w = 0.6, d = 0.3, h = 0.33;
  g.add(ubic(caja(K, w, 0.035, d, RO.madera), 0, h - 0.017, 0)); g.add(ubic(caja(K, w + 0.014, 0.01, d + 0.014, RO.maderaL, ST), 0, h + 0.004, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { g.add(ubic(cil(K, 0.016, 0.024, h - 0.035, 6, RO.maderaD, { grosor: 0.0015 }), a * (w / 2 - 0.04), (h - 0.035) / 2, b * (d / 2 - 0.04))); g.add(ubic(esf(K, 0.024, RO.maderaD, ST, 0.4), a * (w / 2 - 0.04), 0.02, b * (d / 2 - 0.04))); });
  g.add(ubic(caja(K, w - 0.02, 0.1, 0.006, RO.telaA, { grosor: 0.001 }), 0, h - 0.07, d / 2 + 0.004));
  monedas(K, g, -0.2, 0.04, h + 0.009, 8, RO.oro); monedas(K, g, -0.16, -0.05, h + 0.009, 5, '#c9cdd0'); monedas(K, g, -0.24, -0.06, h + 0.009, 6, '#b98a5a'); monedas(K, g, -0.12, 0.07, h + 0.009, 3, RO.oro);
  [0, 1].forEach(k => { const t = tabella(K, 0.13, 0.1); t.rotation.set(-Math.PI / 2, 0, 0.1 * k); t.position.set(0.04 + k * 0.135, h + 0.016, 0.0); g.add(t); });
  const pc = cartel(K, 'ro-cursiva', 128, 128, pCursiva, 0.1, 0.08); pc.rotation.x = -Math.PI / 2; pc.position.set(0.04, h + 0.024, 0); g.add(pc);
  g.add(ubic(cil(K, 0.018, 0.018, 0.035, 8, RO.bronce), 0.24, h + 0.026, -0.08)); g.add(ubic(cil(K, 0.003, 0.003, 0.12, 3, '#c9b48a', ST), 0.245, h + 0.07, -0.08, 0, 0, 0.3));
  g.add(ubic(cil(K, 0.022, 0.022, 0.2, 8, PAPIRO, { grosor: 0.0012 }), 0.18, h + 0.022, 0.09, 0, 0, Math.PI / 2));
  const s = saco(K, 0.8); s.position.set(0.24, h + 0.004, 0.06); g.add(s);
  return g;
}
/* la silla plegable del magistrado (sella), de patas en tijera */
function sella(K) {
  const g = new THREE.Group(), h = 0.22;
  [-1, 1].forEach(l => [-1, 1].forEach(e => g.add(ubic(caja(K, 0.018, 0.27, 0.02, RO.bronce, ST), l * 0.1, h / 2, 0, e * 0.62, 0, 0))));
  g.add(ubic(caja(K, 0.24, 0.025, 0.18, RO.tela, { grosor: 0.0012 }), 0, h + 0.012, 0));
  [-1, 1].forEach(l => g.add(ubic(caja(K, 0.24, 0.016, 0.016, RO.oroD, ST), 0, h, l * 0.085)));
  return g;
}
function lapida(K) {
  const g = new THREE.Group(), w = 0.34, h = 0.62;
  g.add(ubic(caja(K, w + 0.1, 0.06, 0.22, RO.travD), 0, 0.03, 0));
  g.add(ubic(caja(K, w + 0.05, 0.045, 0.18, RO.marmolD), 0, 0.082, 0));
  g.add(ubic(caja(K, w, h, 0.13, RO.marmol, { grosor: 0.003 }), 0, 0.105 + h / 2, 0));
  g.add(ubic(caja(K, w + 0.05, 0.045, 0.18, RO.marmolD), 0, 0.127 + h, 0));
  g.add(ubic(caja(K, w + 0.07, 0.035, 0.2, RO.marmolL), 0, 0.167 + h, 0));
  const ins = cartel(K, 'ro-lapida', 160, 224, pLapida, w - 0.04, h - 0.06); ins.position.set(0, 0.105 + h / 2, 0.066); g.add(ins);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; g.add(ubic(esf(K, 0.017, [RO.pino, RO.pinoL, RO.cipresL][i % 3], ST, 0.35), Math.cos(a) * 0.12, 0.19 + h + (i % 2) * 0.007, Math.sin(a) * 0.06)); }   // la corona de laurel
  [-1, 1].forEach(l => g.add(ubic(caja(K, 0.018, 0.16, 0.004, RO.tela, ST), l * 0.1, 0.12 + h, 0.093, 0, 0, l * 0.12)));   // sus cintas
  return g;
}
export function pagada(K, n) {
  const A = ANCLAS.pagada, P = pieza(A);
  poner(P, A, arca(K), 0.05, -0.1, R4);
  poner(P, A, saco(K), 0.32, 0.06, 0.4); poner(P, A, saco(K, 0.8), 0.38, -0.08, 1.2); poner(P, A, saco(K, 0.9), -0.2, -0.3, 2);
  if (n >= 1) poner(P, A, contrato(K), 0.5, -0.38, R4);
  if (n >= 2) { poner(P, A, mesaCuestor(K), -0.12, -0.64); poner(P, A, sella(K), -0.12, -0.92); }
  if (n >= 3) poner(P, A, lapida(K), -0.72, -0.82, R4);
  P.toc = [{ x: A.x + 0.05, y: A.y - 0.1, k: 'saturnoRo' }];
  return P;
}

/* ================= 80 · LA INSTITUTIO ORATORIA: el scriptorium del libro con los doce rollos =================
   FUENTES: la carta de Quintiliano a su librero Trifón que abre la Institutio («Efflagitasti cotidiano convicio…»: que
   la publique ya); Marcial IV, 72 (Trifón, el librero) y I, 117 (la librería del Argileto, con los postes llenos de
   títulos); la Institutio en doce libros, un rollo cada uno; el copista en su pupitre con el tintero y los cálamos (las
   pinturas de Pompeya: tintero doble, cálamo y rollo). Verrio Flaco enseña a su lado (epoca14): la taberna queda a su
   espalda y a su izquierda. Etapas: 0 el pupitre del copista, con el rollo, el tintero y su taburete · 1 la taberna de
   Trifón (el muro de ladrillo, los postes con los títulos, el alero y el letrero) · 2 el armario con los doce rollos ·
   3 el busto de Quintiliano, de bronce. */
function pupitre(K) {
  const g = new THREE.Group(), w = 0.3, d = 0.22, h = 0.4;
  patas(K, g, w, d, h - 0.03, RO.maderaD, 0.024);
  g.add(ubic(caja(K, w - 0.04, 0.016, d - 0.04, RO.madera, ST), 0, 0.1, 0));   // el estante de abajo
  const ta = new THREE.Group(); ta.position.set(0, h, 0); ta.rotation.x = 0.3; g.add(ta);
  ta.add(caja(K, w + 0.02, 0.022, d + 0.02, RO.madera));
  ta.add(ubic(caja(K, w + 0.02, 0.025, 0.014, RO.maderaD, ST), 0, 0.016, d / 2 + 0.004));
  const ho = cartel(K, 'ro-virgilio', 128, 64, pVirgilio, 0.17, 0.12); ho.rotation.x = -Math.PI / 2; ho.position.set(-0.01, 0.013, 0); ta.add(ho);
  [-1, 1].forEach(l => ta.add(ubic(cil(K, 0.017, 0.017, 0.15, 8, '#e8d9b0', { grosor: 0.0015 }), -0.01 + l * 0.1, 0.024, 0, Math.PI / 2, 0, 0)));
  g.add(ubic(cil(K, 0.022, 0.022, 0.04, 8, RO.bronce), w / 2 - 0.02, h + 0.04, -d / 2 + 0.02));   // el tintero doble
  g.add(ubic(cil(K, 0.016, 0.016, 0.04, 8, RO.bronce), w / 2 - 0.06, h + 0.04, -d / 2 + 0.02));
  [-1, 0, 1].forEach(l => g.add(ubic(cil(K, 0.0025, 0.0025, 0.13, 3, '#c9b48a', ST), w / 2 - 0.02 + l * 0.006, h + 0.09, -d / 2 + 0.02, 0, 0, l * 0.18)));   // los cálamos
  g.add(ubic(esf(K, 0.022, '#d9c48a', ST, 0.4), -w / 2 + 0.03, h + 0.03, -d / 2 + 0.03));   // la esponja
  return g;
}
function taburete(K) { const g = new THREE.Group(); g.add(ubic(cil(K, 0.08, 0.075, 0.03, 10, RO.madera), 0, 0.215, 0)); for (let i = 0; i < 3; i++) { const a = i * 2.094; g.add(ubic(cil(K, 0.011, 0.014, 0.2, 5, RO.maderaD, ST), Math.sin(a) * 0.055, 0.1, Math.cos(a) * 0.055)); } return g; }
function taberna(K) {
  const g = new THREE.Group(), W = 0.9, D = 0.44, H = 1.12, lad = matLadrillo(K, W, H);
  g.add(ubic(caja(K, W, H + 0.19, 0.07, lad, { grosor: 0.003 }), 0, (H + 0.19) / 2, -D / 2));
  g.add(ubic(caja(K, 0.07, H + 0.1, D, matLadrillo(K, D, H), { grosor: 0.003 }), -W / 2, (H + 0.1) / 2, 0));
  g.add(ubic(caja(K, W - 0.06, 0.16, 0.012, RO.estuco, ST), 0, 0.08, -D / 2 + 0.04));
  [-1, 1].forEach(l => {
    g.add(ubic(caja(K, 0.1, H, 0.1, '#efe4c8', { grosor: 0.003 }), l * (W / 2 - 0.02), H / 2, D / 2));
    g.add(ubic(caja(K, 0.12, 0.05, 0.12, RO.travD), l * (W / 2 - 0.02), 0.025, D / 2));
    const ti = cartel(K, 'ro-titulos', 64, 192, pTitulos, 0.08, 0.62); ti.position.set(l * (W / 2 - 0.02), 0.52, D / 2 + 0.052); g.add(ti);
  });
  g.add(ubic(caja(K, 0.1, H, 0.1, RO.estuco, { grosor: 0.003 }), W / 2 - 0.02, H / 2, -D / 2));
  g.add(ubic(caja(K, W + 0.06, 0.07, 0.1, RO.travL), 0, H + 0.035, D / 2));
  const le = cartel(K, 'ro-tryphon', 256, 48, pLetrero('TRYPHON · BIBLIOPOLA', '#f3ead6', '#9a3226'), 0.6, 0.11); le.position.set(0, H + 0.035, D / 2 + 0.052); g.add(le);
  const te = tejadoUnAgua(K, W + 0.12, D + 0.24, 0.16); te.position.set(0, H + 0.2, 0.04); g.add(te);
  g.add(ubic(caja(K, 0.34, 0.3, 0.16, RO.madera, { grosor: 0.002 }), -0.2, 0.15, 0.08));   // el mostrador
  g.add(ubic(caja(K, 0.36, 0.02, 0.18, RO.maderaL, ST), -0.2, 0.31, 0.08));
  [0, 1, 2].forEach(k => g.add(ubic(cil(K, 0.016, 0.016, 0.14, 8, k % 2 ? PAPIRO : '#e6d6b0', { grosor: 0.0012 }), -0.3 + k * 0.05, 0.338, 0.08 + (k % 2) * 0.02, 0, 0.3 * k, Math.PI / 2)));
  return g;
}
export function institutio(K, n) {
  const A = ANCLAS.institutio, P = pieza(A);
  poner(P, A, pupitre(K), 0.18, -0.38, R4);
  poner(P, A, taburete(K), 0.0, -0.55);
  poner(P, A, capsa(K, 6), 0.44, -0.16);
  if (n >= 1) poner(P, A, taberna(K), 0.3, -0.92);
  if (n >= 2) poner(P, A, armario(K, { w: 0.42, h: 0.6, cols: 4, filas: 3 }), 0.48, -1.0);
  if (n >= 3) poner(P, A, busto(K, { color: RO.bronceV, colorD: RO.bronce, pelo: '#5a7a68', calvo: true }), 0.86, -0.36, R4);
  return P;
}

/* LAS PIEZAS: con su índice de saber (la auditoría de etapas de juego3d/qa.html) */
export const PIEZAS = [
  { id: 'ludus', i: 75, crear: ludus },
  { id: 'calculi', i: 76, crear: calculi },
  { id: 'grammaticus', i: 77, crear: grammaticus },
  { id: 'rhetor', i: 78, crear: rhetor },
  { id: 'pagada', i: 79, crear: pagada },
  { id: 'institutio', i: 80, crear: institutio },
];

/* ---------- LA GENTE DE ROMA (70-117 d. C.) ----------
   Los niños de la escuela: túnica corta de lana sin teñir (o azafrán, o roja), el pelo corto; las niñas, la túnica larga
   y el pelo recogido. Los romanos del Foro: la toga blanca de lana sobre la túnica; las mujeres, la estola de color y la
   palla. Los maestros eran casi siempre libertos griegos: túnica, el palio cruzado y barba; el rétor y los senadores van
   afeitados, como se usaba con los Flavios. */
const LANAS = ['#efe6d0', '#e9dcc0', '#f2ecdc', '#ddcba6', '#d9a24a', '#b8483a', '#efe6d0', '#c9b48a'];
export function nino(i, g = 'o', extra = {}) {
  const nina = g === 'a';
  return { edad: 'nino', piel: [0, 1, 1, 2, 0][i % 5], pelo: nina ? ['moño', 'trenza'][i % 2] : ['corto', 'rizos', 'corto'][i % 3], colorPelo: ['#3a2a1e', '#5a3a24', '#2a1f18', '#7a5a34'][i % 4],
    ropa: nina ? 'tunica' : 'corta', colorRopa: LANAS[(i * 3) % LANAS.length], orla: nina ? '#a9566a' : undefined, sinFlecos: true, ...extra };
}
/* el muchacho del rétor (desde los 15): ya lleva la toga viril, blanca */
export function muchacho(i, extra = {}) {
  return { piel: [1, 0, 2, 1][i % 4], pelo: ['corto', 'rizos'][i % 2], colorPelo: ['#3a2a1e', '#2a1f18', '#5a3a24'][i % 3], ropa: 'tunica', colorRopa: '#f1ebdc', orla: '#e3dac4', chal: '#f6f1e4', sinFlecos: true, ...extra };
}
/* los romanos del Foro: togados, mujeres con estola y palla, gente de oficio con la túnica corta */
export function romano(i, extra = {}) {
  const k = i % 6;
  if (k === 1 || k === 4) return { piel: [0, 1, 2][i % 3], pelo: 'moño', colorPelo: ['#2a1f18', '#5a3a24', '#7a5a34'][i % 3], ropa: 'tunica', colorRopa: ['#b8483a', '#4f7299', '#6f8f4a', '#d9a24a'][i % 4], orla: '#e9dcc0', chal: ['#ece2c8', '#c9b48a', '#a9566a'][i % 3], sinFlecos: true, ...extra };
  if (k === 2 || k === 5) return { piel: [1, 2, 1, 3][i % 4], pelo: ['corto', 'revuelto'][i % 2], colorPelo: ['#3a2a1e', '#2a1f18'][i % 2], ropa: 'corta', colorRopa: ['#a8875a', '#8a7452', '#c9b48a'][i % 3], sinFlecos: true, ...extra };
  return { piel: [0, 1, 1][i % 3], pelo: 'corto', colorPelo: ['#3a2a1e', '#5a4a3a', '#8a8070'][i % 3], ropa: 'tunica', colorRopa: '#f1ebdc', orla: '#e3dac4', chal: '#f6f1e4', sinFlecos: true, ...extra };
}
/* el pedagogo: un esclavo griego que acompaña al niño a la escuela y le lleva las cosas */
export const PEDAGOGO = { piel: 1, pelo: 'rizos', colorPelo: '#4a3a2c', barba: true, ropa: 'corta', colorRopa: '#9a8462', sinFlecos: true, chal: '#7a6a52' };
/* los maestros: libertos griegos con su palio; el rétor, togado y afeitado */
export const LITTERATOR = { piel: 1, pelo: 'revuelto', colorPelo: '#5a4a3a', barba: true, ropa: 'tunica', colorRopa: '#c9b48a', orla: '#8a7452', chal: '#8a7452', sinFlecos: true };
export const GRAMMATICUS = { piel: 1, pelo: 'rizos', colorPelo: '#6a6058', barba: true, ropa: 'tunica', colorRopa: '#ece2cc', orla: '#4f7299', chal: '#4f7299', sinFlecos: true };
export const RHETOR = { piel: 0, pelo: 'corto', colorPelo: '#3a2a1e', ropa: 'tunica', colorRopa: '#f4efe2', orla: '#e3dac4', chal: '#f8f4ea', sinFlecos: true };
export const MAESTROS = [GRAMMATICUS, LITTERATOR, { ...GRAMMATICUS, colorPelo: '#3a2a1e', chal: '#8a5a3a', orla: '#8a5a3a' }, RHETOR, { ...LITTERATOR, colorPelo: '#2a1f18', barba: undefined, chal: '#6f8f4a' }, LITTERATOR];
/* Plinio el Joven: senador, la túnica con la franja ancha de púrpura (el latus clavus) bajo la toga */
export const PLINIO = { piel: 0, pelo: 'corto', colorPelo: '#4a3424', ropa: 'tunica', colorRopa: '#f4efe2', orla: '#6a2a4a', chal: '#f8f4ea', sinFlecos: true };
/* Quintiliano: de Calagurris, en Hispania; viejo ya cuando escribe la Institutio, togado y afeitado */
export const QUINTILIANO = { piel: 1, pelo: 'corto', colorPelo: '#a8a094', ropa: 'tunica', colorRopa: '#f1ebdc', orla: '#e3dac4', chal: '#f6f1e4', sinFlecos: true };
