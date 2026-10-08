/* ============================================================
   egipto/piezas
   Los seis saberes de Egipto en 3D, cada uno con sus etapas (la máxima del proyecto: subir de nivel se VE,
   con piezas nuevas; se audita por diff de píxeles en juego3d/qa.html): el papiro (20), la paleta de dos
   tintas (21), la Kemyt (22), la cuerda del agrimensor (23), el patio de las lascas (31, el ostracón) y la
   casa de los libros junto a la Casa de la Vida (32). Más la mesa del papiro, los lindes, los braseros y
   las lámparas. Las posiciones son las del motor 2D (07-sumer, 09-egipto, 14-reglas), corridas donde el
   templo en 3D ocupa lo que el 2D dibujaba encima.
   Cada pieza devuelve { obj, anim, ancla, toc, actores } como las de las otras épocas (src/piezas.js).
   ============================================================ */
import * as THREE from 'three';
import { pieza, actor, ponerEn, texturaCanvas, vasija } from '../piezas.js';
import { tronco } from '../sumer/monumentos.js';
import { EG, JER, panelJeroglifico, friso } from './monumentos.js';

export const ANCLAS = {
  papiro: { x: 11.55, y: 6.6 }, paleta: { x: 10.9, y: 7.65 }, kemyt: { x: 13.9, y: 7.3 }, cuerda: { x: 11.2, y: 12.0 },
  patio: { x: 9.8, y: 7.5 }, mesa: { x: 11.2, y: 5.8 }, anexo: { x: 7.27, y: 6.9 }, copistas: { x: 8.42, y: 8.45 },
};
export const CUERDA_A = { x: 11.64, y: 11.39 }, CUERDA_B = { x: 10.76, y: 12.61 };
/* los aprendices de Egipto: los niños con la cabeza rapada y el mechón de la infancia, las niñas con el pelo
   recogido; faldellín o túnica de lino (06-gente del 2D) */
export function aprendiz(i, extra = {}) {
  const nina = i % 3 === 2;
  return { edad: 'nino', piel: [2, 1, 3, 2][i % 4], pelo: nina ? 'trenza' : 'mechon', colorPelo: '#1c1612', ropa: nina ? 'tunica' : 'corta', colorRopa: ['#f2ecdc', '#ebe3cf', '#f4efe2'][i % 3], orla: nina ? '#c9a24a' : undefined, torsoDesnudo: !nina, sinFlecos: true, ...extra };
}
export const ESCRIBA = { piel: 2, pelo: 'peluca', colorPelo: '#1c1612', ropa: 'corta', colorRopa: EG.lino, torsoDesnudo: true, sinFlecos: true, usej: true };

const caja = (K, w, h, d, color, o) => K.malla(K.caja(w, h, d), color, o);
const oa = (m, { position, rotation, scale } = {}) => { if (position) m.position.copy(position); if (rotation) m.rotation.copy(rotation); if (scale) m.scale.copy(scale); return m; };
const en = (P, obj, x, y, h = 0, ry = 0) => { obj.position.copy(P.en(x, y)); obj.position.y += h; obj.rotation.y = ry; P.obj.add(obj); return obj; };
/* una hoja con renglones de hierático (la escritura cursiva de los escribas): negro con el título en rojo */
function hojaEscrita(w = 96, h = 72, { rubrica = true, columnas = false, fondo = '#efe6c8' } = {}) {
  return texturaCanvas(w, h, (g, W, H) => {
    g.fillStyle = fondo; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(140,110,60,.18)'; for (let i = 0; i < 8; i++) g.fillRect(0, i * H / 8, W, 1);   // las tiras del papiro
    if (columnas) { g.strokeStyle = '#2e2a26'; g.lineWidth = 2; for (let k = 0; k < 5; k++) { const x = 8 + k * (W - 16) / 4; for (let y = 8; y < H - 6; y += 7) { g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + 3, y + 3); g.stroke(); } } return; }
    for (let r = 0; r < 6; r++) {
      const y = 9 + r * (H - 14) / 6; g.strokeStyle = rubrica && r === 0 ? '#c94f43' : '#2e2a26'; g.lineWidth = 2.2;
      for (let x = 6; x < W - 8; x += 7 + (r * 3 + x) % 5) { g.beginPath(); g.moveTo(x, y + ((x * 7) % 3)); g.quadraticCurveTo(x + 2, y - 3, x + 4, y + 1); g.stroke(); }
    }
  });
}
const plano = (K, tex, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), K.matMapa(tex)); m.geometry.userData.propia = true; m.castShadow = true; return m; };
function rollo(K, largo = 0.18, r = 0.028, color = '#e8dcb4') {
  const g = new THREE.Group();
  const c = K.malla(K.cilindro(r, r, largo, 10), color, { grosor: 0.004 }); c.rotation.z = Math.PI / 2; g.add(c);
  const at = K.malla(K.cilindro(r + 0.004, r + 0.004, 0.018, 10), '#b5463a', { sinTinta: true }); at.rotation.z = Math.PI / 2; g.add(at);   // la atadura
  return g;
}
/* el aro dorado que late cuando algo espera el toque */
export function aro(r = 0.42) {
  const m = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.05, 32), new THREE.MeshBasicMaterial({ color: '#ffd24a', transparent: true, opacity: 0.8, depthWrite: false }));
  m.geometry.userData.propia = true; m.rotation.x = -Math.PI / 2; m.position.y = 0.02; m.userData.vivo = true;
  m.userData.latir = (t, on) => { m.visible = on; const c = (t * 0.7) % 1; m.scale.setScalar(0.85 + 0.4 * c); m.material.opacity = 0.8 * (1 - c); };
  return m;
}

/* ---------- 20 · EL PAPIRO: del tallo al archivo ---------- */
/* 0: la estera del taller con los tallos cortados y uno pelándose · 1: las tiras prensadas en cruz bajo dos piedras ·
   2: el rollo extendido entre sus rodillos, ya escrito · 3: el estante de nichos donde lo escrito se vuelve a encontrar */
export function papiro(K, n) {
  const P = pieza(ANCLAS.papiro), A = ANCLAS.papiro;
  en(P, caja(K, 0.78, 0.02, 0.52, '#c8ae78', { grosor: 0.006 }), A.x, A.y, 0.01);                        // la estera
  for (let i = 0; i < 6; i++) {                                                                          // los tallos cortados
    const t = K.malla(K.cilindro(0.016, 0.02, 0.62, 3), i % 2 ? '#7da24e' : '#6f9340', { grosor: 0.004 }); t.rotation.z = Math.PI / 2; t.rotation.y = 0.15 * (i - 3);
    en(P, t, A.x - 0.08, A.y - 0.16 + i * 0.03, 0.035 + (i % 2) * 0.02);
  }
  const um = K.malla(K.cono(0.08, 0.08, 7), '#9ab853', { grosor: 0.004 }); um.rotation.z = -Math.PI / 2; en(P, um, A.x + 0.28, A.y - 0.1, 0.06);
  for (let i = 0; i < 5; i++) en(P, caja(K, 0.22, 0.006, 0.025, '#e6dcb0', { sinTinta: true }), A.x - 0.2, A.y + 0.12 + i * 0.03, 0.025, 0.1 * i);   // las tiras peladas
  if (n >= 1) {                                                                                          // las tiras prensadas en cruz
    const tabla = caja(K, 0.4, 0.04, 0.4, '#9c7a52', { grosor: 0.006 }); en(P, tabla, A.x + 0.55, A.y + 0.12, 0.02);
    for (let k = 0; k < 6; k++) { en(P, caja(K, 0.34, 0.01, 0.05, '#ebe0b6', { sinTinta: true }), A.x + 0.55, A.y - 0.01 + k * 0.055, 0.045); en(P, caja(K, 0.05, 0.012, 0.34, '#e2d6a8', { sinTinta: true }), A.x + 0.42 + k * 0.055, A.y + 0.12, 0.052); }
    [[0.47, 0.05, 0.075], [0.64, 0.2, 0.065]].forEach(([dx, dz, r], i) => { const p = K.malla(K.roca(r, 90 + i), '#9a9188', { grosor: 0.008 }); en(P, p, A.x + dx, A.y + dz, 0.1); });
  }
  if (n >= 2) {                                                                                          // el rollo entre sus rodillos
    const g = new THREE.Group(); en(P, g, A.x + 0.05, A.y + 0.46, 0);
    [-1, 1].forEach(l => { const pata = caja(K, 0.04, 0.2, 0.04, '#8a6a4a', { grosor: 0.004 }); pata.position.set(l * 0.36, 0.1, 0); g.add(pata); const r = rollo(K, 0.24, 0.035); r.rotation.y = Math.PI / 2; r.position.set(l * 0.33, 0.22, 0); g.add(r); });
    const hoja = plano(K, hojaEscrita(160, 64), 0.62, 0.22); hoja.rotation.x = -Math.PI / 2 + 0.25; hoja.position.set(0, 0.225, 0); g.add(hoja);
  }
  if (n >= 3) {                                                                                          // el estante de nichos
    const e = new THREE.Group(); en(P, e, A.x + 0.1, A.y - 0.38, 0);
    e.add(oa(caja(K, 0.78, 0.66, 0.24, '#b98a5e', { grosor: 0.01 }), { position: new THREE.Vector3(0, 0.33, 0) }));
    for (let f = 0; f < 2; f++) for (let c = 0; c < 3; c++) {
      const x = -0.24 + c * 0.24, y = 0.2 + f * 0.26;
      e.add(oa(caja(K, 0.2, 0.2, 0.03, '#4a3222', { sinTinta: true }), { position: new THREE.Vector3(x, y, 0.11) }));
      for (let k = 0; k < 2; k++) { const r = rollo(K, 0.16, 0.026); r.position.set(x, y - 0.06 + k * 0.055, 0.12); e.add(r); }
    }
    e.add(oa(caja(K, 0.84, 0.05, 0.28, '#8a6a4a', { grosor: 0.008 }), { position: new THREE.Vector3(0, 0.68, 0) }));
  }
  // la regla de la acción: con el papiro dominado, alguien lee su rollo en la estera
  const lector = actor(P, K, { ...ESCRIBA, piel: 3, oficio: true, k: 'lector' }, 'leer', A.x - 0.3, A.y + 0.4, { x: A.x + 0.2, y: A.y });
  { const r = plano(K, hojaEscrita(96, 48), 0.24, 0.12); r.rotation.x = -0.9; r.position.set(0, -0.05, 0.08); lector.sostener(r, 'D'); }
  return P;
}

/* ---------- 21 · LA PALETA DE DOS TINTAS ---------- */
/* 0: la paleta con su tinta negra y roja y el cálamo, sobre un escabel · 1: el rincón de moler: la piedra, el pocillo,
   el pan de ocre y el segundo cálamo · 2: el recado del escriba colgado (la paleta, la bolsa del agua y el estuche:
   el signo que escribe «escriba») · 3: la paleta con el nombre de su dueño, expuesta en su soporte */
function paletaEscriba(K, largo = 0.26) {
  const g = new THREE.Group();
  g.add(caja(K, largo, 0.018, 0.06, '#d9c08a', { grosor: 0.004 }));
  [-1, 1].forEach((l, i) => { const t = K.malla(K.cilindro(0.014, 0.014, 0.01, 10), i ? '#c94f43' : '#2e2a26', { sinTinta: true }); t.position.set(largo / 2 - 0.04, 0.012, l * 0.014 * 0); t.position.x = largo / 2 - 0.035 - i * 0.04; g.add(t); });
  const ranura = caja(K, largo * 0.55, 0.01, 0.014, '#8a6a4a', { sinTinta: true }); ranura.position.set(-0.03, 0.01, 0); g.add(ranura);
  for (let k = 0; k < 2; k++) { const c = K.malla(K.cilindro(0.005, 0.005, largo * 0.5, 4), '#6f8f3a', { sinTinta: true }); c.rotation.z = Math.PI / 2; c.position.set(-0.03, 0.016, -0.005 + k * 0.01); g.add(c); }
  return g;
}
export function paleta(K, n) {
  const P = pieza(ANCLAS.paleta), A = ANCLAS.paleta;
  en(P, caja(K, 0.4, 0.14, 0.3, '#a8845a', { grosor: 0.008 }), A.x, A.y, 0.07);                          // el escabel
  const pa = paletaEscriba(K, 0.3); en(P, pa, A.x, A.y, 0.15, 0.3);
  const agua = vasija(K, [[0.001, 0], [0.045, 0.01], [0.055, 0.05], [0.04, 0.09], [0.03, 0.1]], '#b5643a', false); en(P, agua, A.x + 0.14, A.y + 0.08, 0.14);
  if (n >= 1) {                                                                                          // el rincón de moler
    const piedra = caja(K, 0.26, 0.05, 0.2, '#b0a894', { grosor: 0.008 }); en(P, piedra, A.x - 0.36, A.y + 0.18, 0.025, 0.2);
    const mano = K.malla(K.capsula(0.03, 0.06, 0.6), '#9a9280', { grosor: 0.005 }); mano.rotation.z = Math.PI / 2; en(P, mano, A.x - 0.36, A.y + 0.18, 0.08);
    en(P, K.malla(K.cilindro(0.07, 0.05, 0.015, 12), '#2e2a26', { sinTinta: true }), A.x - 0.33, A.y + 0.22, 0.052);   // la tinta molida
    const pocillo = vasija(K, [[0.001, 0], [0.05, 0.005], [0.06, 0.04], [0.055, 0.05]], '#c9b08a', false); en(P, pocillo, A.x - 0.14, A.y + 0.3, 0);
    en(P, K.malla(K.roca(0.05, 77), '#b5462e', { grosor: 0.005 }), A.x - 0.5, A.y - 0.02, 0.03);          // el pan de ocre rojo
    en(P, K.malla(K.roca(0.04, 78), '#2a2420', { grosor: 0.005 }), A.x - 0.46, A.y + 0.36, 0.025);       // el carbón
  }
  if (n >= 2) {                                                                                          // el recado del escriba, colgado de su percha
    const pe = new THREE.Group(); en(P, pe, A.x + 0.34, A.y - 0.22, 0);
    pe.add(oa(caja(K, 0.05, 0.72, 0.05, '#8a6a4a', { grosor: 0.005 }), { position: new THREE.Vector3(0, 0.36, 0) }));
    pe.add(oa(caja(K, 0.24, 0.035, 0.035, '#8a6a4a', { grosor: 0.004 }), { position: new THREE.Vector3(0.09, 0.7, 0) }));
    const kit = new THREE.Group(); kit.position.set(0.17, 0.46, 0.02); kit.scale.setScalar(1.4); pe.add(kit);
    const pal = paletaEscriba(K, 0.24); pal.rotation.set(Math.PI / 2, 0, Math.PI / 2); pal.position.set(0, 0, 0); kit.add(pal);
    const bolsa = K.malla(K.esfera(0.05), '#9a6a45', { grosor: 0.004 }); bolsa.scale.set(0.8, 1.1, 0.7); bolsa.position.set(0.07, -0.05, 0); kit.add(bolsa);
    const est = K.malla(K.cilindro(0.018, 0.018, 0.2, 8), '#7e5732', { grosor: 0.004 }); est.position.set(-0.06, -0.02, 0.01); kit.add(est);
    kit.add(oa(K.malla(K.toro(0.1, 0.008, Math.PI, 0.4), '#6a4a2a', { sinTinta: true }), { position: new THREE.Vector3(0, 0.08, 0), rotation: new THREE.Euler(0, 0, 0) }));   // la correa
  }
  if (n >= 3) {                                                                                          // la paleta con su nombre, expuesta
    const so = new THREE.Group(); en(P, so, A.x + 0.7, A.y + 0.05, 0, Math.PI / 4);
    so.add(oa(caja(K, 0.3, 0.06, 0.18, '#a8845a', { grosor: 0.006 }), { position: new THREE.Vector3(0, 0.03, 0) }));
    so.add(oa(caja(K, 0.03, 0.34, 0.03, '#8a6a4a', { grosor: 0.004 }), { position: new THREE.Vector3(0, 0.2, -0.04) }));
    const grande = caja(K, 0.12, 0.44, 0.025, '#e2c890', { grosor: 0.006 }); grande.position.set(0, 0.32, 0.0); grande.rotation.x = -0.18; so.add(grande);
    const nom = plano(K, panelJeroglifico({ w: 48, h: 160, fondo: '#e2c890', tinta: EG.negro, cols: 1, texto: JER.sesh + JER.ankhUdjaSeneb, grano: false }), 0.09, 0.3); nom.position.set(0, 0.3, 0.017); nom.rotation.x = -0.18; so.add(nom);
    [0.14, 0.2].forEach((y, i) => { const t = K.malla(K.cilindro(0.018, 0.018, 0.01, 10), i ? '#c94f43' : '#2e2a26', { sinTinta: true }); t.rotation.x = Math.PI / 2 - 0.18; t.position.set(0, 0.32 + 0.16 - i * 0.05, 0.02); so.add(t); });
    // y a su lado, el babuino de Thot, señor de los escribas, sentado en su pedestal con el disco de la luna, de fayenza
    // como sus figuritas: antes de escribir, el escriba le dejaba caer una gota del agua de la paleta (la estatua del
    // escriba Nebmertuf, Louvre E 11154, lo muestra escribiendo a sus pies). Mira al patio, de frente a quien juega
    const ba = new THREE.Group(); en(P, ba, A.x + 0.75, A.y + 0.42, 0, Math.PI / 4 + 0.4); ba.scale.setScalar(1.15);   // de tres cuartos: de frente, el hocico se escorzaba
    ba.add(oa(caja(K, 0.22, 0.16, 0.2, '#e0d2ae', { grosor: 0.006 }), { position: new THREE.Vector3(0, 0.08, 0) }));      // el pedestal de caliza
    const fayenza = '#3f9c95', cara = '#1d4f4b', y0 = 0.16;   // la fayenza azul verdosa y su vidriado oscuro
    const cuerpo = K.malla(K.esfera(0.09), fayenza, { grosor: 0.005 }); cuerpo.scale.set(1, 1.15, 0.9); cuerpo.position.set(0, y0 + 0.1, -0.01); ba.add(cuerpo);
    const manto = K.malla(K.esfera(0.085), fayenza, { grosor: 0.005 }); manto.scale.set(1.3, 0.8, 1.15); manto.position.set(0, y0 + 0.18, -0.005); ba.add(manto);   // la melena, como una capa
    [-1, 1].forEach(l => { const r = K.malla(K.esfera(0.042), fayenza, { grosor: 0.004 }); r.position.set(l * 0.05, y0 + 0.05, 0.07); ba.add(r);    // las rodillas altas
      const m = K.malla(K.esfera(0.022), cara, { sinTinta: true }); m.position.set(l * 0.05, y0 + 0.085, 0.1); ba.add(m); });                     // las manos sobre ellas
    const cabeza = K.malla(K.esfera(0.056), fayenza, { grosor: 0.005 }); cabeza.position.set(0, y0 + 0.27, 0.03); ba.add(cabeza);
    const hocico = K.malla(K.capsula(0.032, 0.085), cara, { grosor: 0.004 }); hocico.rotation.x = Math.PI / 2 - 0.12; hocico.position.set(0, y0 + 0.255, 0.1); ba.add(hocico);   // el hocico largo del babuino
    const disco = K.malla(K.cilindro(0.045, 0.045, 0.01, 16), '#d9a93a', { grosor: 0.004 }); disco.rotation.x = Math.PI / 2; disco.position.set(0, y0 + 0.39, 0.02); ba.add(disco);
    ba.add(oa(K.malla(K.toro(0.05, 0.009, Math.PI), '#d9a93a', { sinTinta: true }), { position: new THREE.Vector3(0, y0 + 0.37, 0.02), rotation: new THREE.Euler(0, 0, Math.PI) }));   // la media luna bajo el disco
  }
  // la regla de la acción: la que escribe con las dos tintas, sentada DETRÁS de su escabel y de cara al patio: delante de
  // él tapaba el recado y la paleta con nombre (etapas 2 y 3); lo que crece va a los lados y al frente, que es lo libre
  const pintora = actor(P, K, { ...ESCRIBA, piel: 1, pelo: 'peluca', ropa: 'tunica', torsoDesnudo: false, colorRopa: '#f4efe2', oficio: true, k: 'pintora' }, 'escribir', A.x - 0.25, A.y - 0.25, { x: A.x, y: A.y });
  { const h = plano(K, hojaEscrita(64, 48), 0.18, 0.13); h.rotation.x = -1.2; h.position.set(0, -0.03, 0.06); pintora.sostener(h, 'I'); }
  return P;
}

/* ---------- 22 · LA KEMYT: el libro de arranque de los escribas ---------- */
/* 0: el atril con la tabla del texto · 1: el título en rojo, la vara del maestro y el ostracón del alumno · 2: los
   tramos copiados colgados de una cuerda · 3: la Kemyt entera en sus columnas arcaicas, en un tablero grande */
export function kemyt(K, n) {
  const P = pieza(ANCLAS.kemyt), A = ANCLAS.kemyt;
  const at = new THREE.Group(); en(P, at, A.x, A.y, 0, -0.5);
  at.add(oa(caja(K, 0.05, 0.5, 0.05, '#8a6a4a', { grosor: 0.005 }), { position: new THREE.Vector3(0, 0.25, -0.06) }));
  [-1, 1].forEach(l => at.add(oa(caja(K, 0.04, 0.34, 0.04, '#8a6a4a', { grosor: 0.004 }), { position: new THREE.Vector3(l * 0.14, 0.15, 0.04), rotation: new THREE.Euler(0.3, 0, l * 0.1) })));
  const tabla = caja(K, 0.44, 0.3, 0.03, '#d8c9a0', { grosor: 0.006 }); tabla.position.set(0, 0.46, 0.0); tabla.rotation.x = -0.35; at.add(tabla);
  const texto = plano(K, hojaEscrita(128, 88, { rubrica: n >= 1 }), 0.4, 0.26); texto.position.set(0, 0.465, 0.02); texto.rotation.x = -0.35; at.add(texto);
  if (n >= 1) {
    const vara = K.malla(K.cilindro(0.012, 0.014, 0.7, 5), '#6a4a2a', { grosor: 0.004 }); vara.position.set(0.3, 0.32, 0.05); vara.rotation.z = -0.3; at.add(vara);   // la vara del maestro
    const os = K.malla(K.roca(0.09, 51), '#efe6cc', { grosor: 0.006 }); os.scale.set(1.2, 0.35, 0.9); os.position.set(-0.25, 0.03, 0.22); at.add(os);   // el ostracón del alumno
    at.add(oa(caja(K, 0.1, 0.004, 0.012, '#c94f43', { sinTinta: true }), { position: new THREE.Vector3(-0.25, 0.065, 0.22) }));
  }
  if (n >= 2) {                                                                                          // los tramos colgados
    const cu = new THREE.Group(); en(P, cu, A.x + 0.55, A.y + 0.1, 0, -0.5);
    [-1, 1].forEach(l => cu.add(oa(caja(K, 0.04, 0.7, 0.04, '#8a6a4a', { grosor: 0.004 }), { position: new THREE.Vector3(l * 0.36, 0.35, 0) })));
    const soga = K.malla(K.cilindro(0.006, 0.006, 0.72, 4), '#b89a6a', { sinTinta: true }); soga.rotation.z = Math.PI / 2; soga.position.y = 0.64; cu.add(soga);
    for (let k = 0; k < 3; k++) { const h = plano(K, hojaEscrita(64, 80), 0.17, 0.22); h.material.side = THREE.DoubleSide; h.position.set(-0.22 + k * 0.22, 0.52, 0.01); h.rotation.z = 0.05 * (k - 1); cu.add(h); }
  }
  if (n >= 3) {                                                                                          // la Kemyt en columnas
    const tb = new THREE.Group(); en(P, tb, A.x - 0.5, A.y - 0.3, 0, -0.5);
    [-1, 1].forEach(l => tb.add(oa(caja(K, 0.05, 0.8, 0.05, '#8a6a4a', { grosor: 0.005 }), { position: new THREE.Vector3(l * 0.26, 0.4, 0) })));
    tb.add(oa(caja(K, 0.56, 0.5, 0.03, '#d8c9a0', { grosor: 0.008 }), { position: new THREE.Vector3(0, 0.55, 0.02) }));
    const c = plano(K, hojaEscrita(96, 96, { columnas: true }), 0.5, 0.44); c.position.set(0, 0.55, 0.037); tb.add(c);
  }
  const oy = actor(P, K, { ...aprendiz(4), oficio: true, k: 'oyente2' }, 'suelo', A.x - 0.3, A.y + 0.55, { x: A.x, y: A.y });
  return P;
}

/* ---------- 23 · LA CUERDA DEL AGRIMENSOR, en la vega ---------- */
/* 0: dos estacas y la cuerda con tres nudos · 1: los doce nudos, el rollo de repuesto y el mazo · 2: la tercera estaca
   y el triángulo tendido de 3-4-5 (el ángulo recto) · 3: los cuatro mojones de piedra que la crecida ya no borra */
export function cuerda(K, n) {
  const P = pieza(ANCLAS.cuerda), A = CUERDA_A, B = CUERDA_B;
  const estaca = (x, y) => { const e = K.malla(K.cilindro(0.025, 0.018, 0.4, 6), '#8a6a4a', { grosor: 0.005 }); en(P, e, x, y, 0.2); return e; };
  estaca(A.x, A.y); estaca(B.x, B.y);
  const pa = P.en(A.x, A.y), pb = P.en(B.x, B.y), Lr = pa.distanceTo(pb);
  const soga = K.malla(K.cilindro(0.008, 0.008, Lr, 4), '#c9ad78', { sinTinta: true }); soga.position.copy(pa).add(pb).multiplyScalar(0.5); soga.position.y = 0.3;
  soga.rotation.z = Math.PI / 2; soga.rotation.y = -Math.atan2(pb.z - pa.z, pb.x - pa.x); P.obj.add(soga);
  const nudos = n >= 1 ? 12 : 3;
  for (let k = 1; k <= nudos; k++) { const f = k / (nudos + 1), q = pa.clone().lerp(pb, f); const nd = K.malla(K.esfera(n >= 1 ? 0.024 : 0.016), n >= 1 ? '#8f7442' : '#a8905a', { sinTinta: true }); nd.position.set(q.x, 0.3, q.z); P.obj.add(nd); }
  if (n >= 1) {
    const rollo2 = K.malla(K.toro(0.07, 0.022, Math.PI * 2, 0.6), '#c9ad78', { grosor: 0.004 }); en(P, rollo2, B.x + 0.05, B.y, 0.26); rollo2.rotation.y = 0.4;
    const mazo = new THREE.Group(); en(P, mazo, B.x + 0.28, B.y + 0.12, 0.03, 0.6);
    mazo.add(oa(caja(K, 0.26, 0.025, 0.025, '#8a6a4a', { grosor: 0.003 }), {}));
    mazo.add(oa(caja(K, 0.08, 0.07, 0.07, '#6f5535', { grosor: 0.004 }), { position: new THREE.Vector3(0.14, 0.01, 0) }));
  }
  if (n >= 2) {                                                                                          // el triángulo de 3-4-5 nudos, tendido en el suelo
    const C = { x: 10.5, y: 12.1 }; estaca(C.x, C.y);
    const pts = [P.en(C.x, C.y), P.en(C.x + 0.6, C.y - 0.45), P.en(C.x + 0.6 + 0.36, C.y - 0.45 + 0.48)];
    for (let i = 0; i < 3; i++) { const a = pts[i], b = pts[(i + 1) % 3], L2 = a.distanceTo(b); const s = K.malla(K.cilindro(0.007, 0.007, L2, 4), '#d8bf8a', { sinTinta: true }); s.position.copy(a).add(b).multiplyScalar(0.5); s.position.y = 0.02; s.rotation.z = Math.PI / 2; s.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x); P.obj.add(s); }
    pts.forEach(p => { const e = K.malla(K.cilindro(0.015, 0.012, 0.14, 5), '#8a6a4a', { grosor: 0.004 }); e.position.set(p.x, 0.07, p.z); P.obj.add(e); });
    const esq = caja(K, 0.12, 0.01, 0.12, '#e9e0c6', { sinTinta: true }); esq.position.set(pts[1].x - 0.05, 0.015, pts[1].z + 0.04); esq.rotation.y = 0.64; P.obj.add(esq);   // la escuadra del ángulo recto
  }
  if (n >= 3) [[10.2, 12.15], [12.2, 11.85], [11.4, 12.95], [10.75, 12.7]].forEach(([x, y], i) => {    // los mojones
    const m = caja(K, 0.12, 0.26, 0.1, '#c8bb98', { grosor: 0.008 }); en(P, m, x, y, 0.13, i * 0.4);
    en(P, caja(K, 0.13, 0.02, 0.11, '#a89a78', { sinTinta: true }), x, y, 0.2, i * 0.4);
  });
  // la regla de la acción: dos que tensan la cuerda, uno en cada estaca
  actor(P, K, { ...aprendiz(0, { edad: 'adulto', pelo: 'peluca' }), oficio: true, k: 'tensador0' }, 'tocar', A.x + 0.15, A.y - 0.1, { x: B.x, y: B.y });
  actor(P, K, { ...aprendiz(1, { edad: 'adulto', pelo: 'corto' }), oficio: true, k: 'tensador1' }, 'tocar', B.x - 0.15, B.y + 0.12, { x: A.x, y: A.y });
  return P;
}

/* ---------- 31 · EL PATIO DE LAS LASCAS (el ostracón): donde se ensaya sin pagar los errores ---------- */
/* 0: la tierra pisada, el muro bajo donde esperan los ejercicios y el montón de lascas · 1: la cesta de lascas frescas ·
   2: el montón estratificado (la arqueología literal de Deir el-Medina) · 3: los ostraca figurados: un gato en el muro,
   un pato. El montón crece con cada lasca raspada y, con la paleta dominada, lleva las marcas rojas del maestro. */
function ostracon(K, rojo, figura = null) {
  const g = new THREE.Group();
  const l = K.malla(K.roca(0.07, 30 + (figura ? 9 : 0)), '#efe6cc', { grosor: 0.005 }); l.scale.set(1.3, 0.3, 1); g.add(l);
  if (rojo) g.add(oa(caja(K, 0.08, 0.004, 0.012, '#c94f43', { sinTinta: true }), { position: new THREE.Vector3(0, 0.024, 0) }));
  return g;
}
export function patioLascas(K, n, { ejer = 0, lascas = 0, rojo = false } = {}) {
  const P = pieza(ANCLAS.patio), A = ANCLAS.patio;
  const tierra = new THREE.Mesh(new THREE.CircleGeometry(0.62, 24), K.mat('#dcc99a')); tierra.geometry.userData.propia = true; tierra.rotation.x = -Math.PI / 2; tierra.scale.set(1.25, 0.8, 1); tierra.receiveShadow = true;
  en(P, tierra, A.x, A.y, 0.006);
  const muro = new THREE.Group(); en(P, muro, A.x - 0.3, A.y - 0.3, 0);                                // el muro bajo de adobe
  muro.add(oa(caja(K, 0.62, 0.26, 0.14, '#c2a06c', { grosor: 0.008 }), { position: new THREE.Vector3(0, 0.13, 0) }));
  muro.add(oa(caja(K, 0.64, 0.03, 0.16, '#d0b078', { grosor: 0.004 }), { position: new THREE.Vector3(0, 0.275, 0) }));
  for (let k = 0; k < Math.min(4, ejer); k++) {                                                          // los ejercicios que esperan, apoyados
    const e = caja(K, 0.1, 0.13, 0.015, '#efe6cc', { grosor: 0.003 }); e.position.set(-0.22 + k * 0.15, 0.1, 0.085); e.rotation.x = -0.25; e.rotation.z = -0.08 + k * 0.05; muro.add(e);
    const r = caja(K, 0.06, 0.006, 0.004, '#6a5a3a', { sinTinta: true }); r.position.set(-0.22 + k * 0.15, 0.12, 0.094); r.rotation.x = -0.25; muro.add(r);
  }
  const cuantas = Math.min(16, 2 + Math.floor(lascas / 2));                                              // el montón de lascas
  const mon = new THREE.Group(); en(P, mon, A.x + 0.28, A.y + 0.05, 0);
  for (let k = 0; k < cuantas; k++) { const a = k * 2.4, r = 0.04 + (k % 5) * 0.035, o = ostracon(K, rojo && k % 3 === 0); o.position.set(Math.cos(a) * r, 0.015 + Math.floor(k / 5) * 0.03, Math.sin(a) * r); o.rotation.y = a; mon.add(o); }
  if (n >= 1) {                                                                                          // la cesta de lascas frescas
    const ce = vasija(K, [[0.001, 0], [0.13, 0.01], [0.17, 0.1], [0.17, 0.16]], '#b8a06a', false); en(P, ce, A.x - 0.48, A.y + 0.2, 0);
    for (let k = 0; k < 6; k++) { const o = ostracon(K, false); o.position.set(-0.06 + (k % 3) * 0.05, 0.16 + Math.floor(k / 3) * 0.03, (k % 2) * 0.04 - 0.02); ce.add(o); }
    const ce2 = vasija(K, [[0.001, 0], [0.1, 0.01], [0.13, 0.08], [0.13, 0.12]], '#a8905a', false); en(P, ce2, A.x - 0.62, A.y - 0.08, 0);   // y otra, ya medio vacía
    for (let k = 0; k < 2; k++) { const o = ostracon(K, true); o.position.set(-0.02 + k * 0.04, 0.1, 0); ce2.add(o); }
  }
  if (n >= 2) {                                                                                          // el montón estratificado, más atrás
    const est = new THREE.Group(); en(P, est, A.x + 0.5, A.y - 0.32, 0);
    ['#d8c69c', '#c9b48a', '#e2d3ab'].forEach((c, i) => { const m = K.malla(K.cilindro(0.26 - i * 0.07, 0.3 - i * 0.07, 0.07, 12), c, { grosor: 0.006 }); m.position.y = 0.035 + i * 0.07; est.add(m); });
    for (let k = 0; k < 6; k++) { const o = ostracon(K, true); o.position.set(Math.cos(k) * 0.12, 0.22, Math.sin(k) * 0.1); est.add(o); }
  }
  if (n >= 3) {                                                                                          // los ostraca figurados: el gato y el pato
    [[JER.gato, -0.18], [JER.pato, 0.1]].forEach(([sg, dx], i) => {
      const t = panelJeroglifico({ w: 64, h: 64, fondo: '#efe6cc', tinta: i ? '#c94f43' : EG.negro, cols: 1, texto: sg, grano: false });
      const os = plano(K, t, 0.22, 0.22); os.position.set(dx, 0.41, 0.022); os.rotation.x = -0.15; muro.add(os);
      muro.add(oa(caja(K, 0.24, 0.24, 0.014, '#efe6cc', { grosor: 0.004 }), { position: new THREE.Vector3(dx, 0.41, 0.012), rotation: new THREE.Euler(-0.15, 0, 0) }));
    });
  }
  if (n >= 3) { const t3 = panelJeroglifico({ w: 64, h: 64, fondo: '#efe6cc', tinta: EG.negro, cols: 1, texto: JER.sesh, grano: false }); const b3 = new THREE.Group(); en(P, b3, A.x - 0.05, A.y + 0.42, 0, 0.3); b3.add(oa(caja(K, 0.22, 0.2, 0.014, '#efe6cc', { grosor: 0.004 }), { position: new THREE.Vector3(0, 0.1, 0), rotation: new THREE.Euler(-0.35, 0, 0) })); const p3 = plano(K, t3, 0.19, 0.17); p3.position.set(0, 0.1, 0.01); p3.rotation.x = -0.35; b3.add(p3); }   // el escriba sentado, dibujado en una lasca
  const anillo = aro(0.6); anillo.scale.set(1.2, 1.2, 1); en(P, anillo, A.x, A.y, 0); P.aro = anillo;
  // la regla de la acción: el que raspa su lasca junto al montón
  const pr = actor(P, K, { ...aprendiz(7), oficio: true, k: 'practicante' }, 'raspar', A.x + 0.45, A.y - 0.05, { x: A.x + 0.28, y: A.y + 0.05 });
  { const o = ostracon(K, rojo); o.scale.setScalar(0.7); pr.sostener(o, 'I'); }
  return P;
}

/* ---------- LA MESA DEL PAPIRO: donde lo ensayado pasa limpio a la hoja cara ---------- */
export function mesaPapiro(K, papiros = 0) {
  const P = pieza(ANCLAS.mesa), A = ANCLAS.mesa;
  const m = new THREE.Group(); en(P, m, A.x, A.y, 0);
  [[-0.24, -0.12], [0.24, -0.12], [-0.24, 0.12], [0.24, 0.12]].forEach(([x, z]) => m.add(oa(caja(K, 0.04, 0.24, 0.04, '#8a6a4a', { grosor: 0.004 }), { position: new THREE.Vector3(x, 0.12, z) })));
  m.add(oa(caja(K, 0.56, 0.035, 0.32, '#b08c58', { grosor: 0.006 }), { position: new THREE.Vector3(0, 0.255, 0) }));
  const hoja = plano(K, hojaEscrita(96, 64, { rubrica: false, fondo: '#f2eacc' }), 0.34, 0.22); hoja.rotation.x = -Math.PI / 2; hoja.position.set(-0.03, 0.276, 0); m.add(hoja);
  [[-0.22, 0.06], [0.17, -0.06]].forEach(([x, z], i) => { const p = K.malla(K.roca(0.035, 60 + i), '#9a9188', { grosor: 0.004 }); p.position.set(x, 0.3, z); m.add(p); });
  const pa = paletaEscriba(K, 0.2); pa.position.set(0.18, 0.28, 0.1); pa.rotation.y = 0.3; m.add(pa);
  const ce = vasija(K, [[0.001, 0], [0.12, 0.01], [0.14, 0.1], [0.14, 0.14]], '#b8a06a', false); en(P, ce, A.x + 0.5, A.y + 0.05, 0);   // el cesto del archivo
  for (let k = 0; k < Math.min(6, papiros); k++) { const r = rollo(K, 0.2, 0.026); r.position.set(-0.04 + (k % 3) * 0.04, 0.14 + Math.floor(k / 3) * 0.05, -0.03 + (k % 2) * 0.05); r.rotation.y = 0.4 + k * 0.5; ce.add(r); }
  const anillo = aro(0.5); en(P, anillo, A.x + 0.1, A.y, 0); P.aro = anillo;
  return P;
}

/* ---------- 32 · LA CASA DE LOS LIBROS, junto al templo ---------- */
/* obra: los cimientos, los ladrillos apilados y el andamio · muros: las paredes a medio subir · 0: la casa de adobe
   terminada · 1: el patio de los copistas delante, con su toldo, las esteras, el banco y dos copistas · 2: el segundo
   piso con ventanas, los nichos con rollos en la fachada y un estante suelto · 3: la fachada encalada con Seshat y
   Thot pintados a los lados de la puerta, la estrella de siete puntas y el dintel rojo */
export const ANEXO = { x0: 6.65, x1: 7.9, z0: 5.9, z1: 7.9 };
export function anexo(K, etapa) {
  const P = pieza(ANCLAS.anexo), A = ANCLAS.anexo, W = ANEXO.x1 - ANEXO.x0, D = ANEXO.z1 - ANEXO.z0;
  const niv = typeof etapa === 'number' ? etapa : -1, cal = niv >= 3;
  const casa = new THREE.Group(); en(P, casa, A.x, A.y, 0);
  const H = etapa === 'obra' ? 0.16 : etapa === 'muros' ? 0.46 : 0.7, muro = cal ? EG.cal : '#c9a57a', muroD = cal ? EG.calD : '#a9855a';
  if (etapa === 'obra' || etapa === 'muros') {                                                           // las paredes a medio subir y el andamio
    [[0, -D / 2, W, 0.12], [0, D / 2, W, 0.12], [-W / 2, 0, 0.12, D], [W / 2, 0, 0.12, D]].forEach(([x, z, w, d]) => casa.add(oa(caja(K, w, H, d, muro, { grosor: 0.01 }), { position: new THREE.Vector3(x, H / 2, z) })));
    for (let i = 0; i < (etapa === 'obra' ? 3 : 2); i++) { const pila = new THREE.Group(); pila.position.set(-W / 2 - 0.3, 0, -0.5 + i * 0.4); casa.add(pila); for (let k = 0; k < 6; k++) pila.add(oa(caja(K, 0.16, 0.06, 0.1, EG.adobe, { grosor: 0.004 }), { position: new THREE.Vector3((k % 2) * 0.08, 0.03 + Math.floor(k / 2) * 0.06, 0) })); }
    const alto = H + 0.35;
    [[-W / 2 - 0.08, D / 2 + 0.08], [W / 2 + 0.08, D / 2 + 0.08], [-W / 2 - 0.08, -D / 2 - 0.08], [W / 2 + 0.08, -D / 2 - 0.08]].forEach(([x, z]) => casa.add(oa(K.malla(K.cilindro(0.018, 0.02, alto, 5), '#8a6a4a', { grosor: 0.004 }), { position: new THREE.Vector3(x, alto / 2, z) })));
    [D / 2 + 0.08, -D / 2 - 0.08].forEach(z => casa.add(oa(caja(K, W + 0.2, 0.025, 0.12, '#a88a5a', { grosor: 0.004 }), { position: new THREE.Vector3(0, H + 0.12, z) })));
    return P;
  }
  casa.add(oa(caja(K, W, H, D, muro, { grosor: 0.012 }), { position: new THREE.Vector3(0, H / 2, 0) }));
  casa.add(oa(caja(K, W + 0.04, 0.05, D + 0.04, muroD, { grosor: 0.008 }), { position: new THREE.Vector3(0, H + 0.025, 0) }));
  casa.add(oa(caja(K, 0.22, 0.4, 0.02, '#3a2a1c', { sinTinta: true }), { position: new THREE.Vector3(0.2, 0.2, D / 2 + 0.005) }));   // la puerta
  casa.add(oa(caja(K, 0.3, 0.05, 0.03, cal ? '#b5463a' : '#8b5a3a', { grosor: 0.004 }), { position: new THREE.Vector3(0.2, 0.425, D / 2 + 0.012) }));   // el dintel (rojo al encalar)
  for (let k = 0; k < 3; k++) casa.add(oa(caja(K, 0.1, 0.06, 0.02, '#3a2a1c', { sinTinta: true }), { position: new THREE.Vector3(-W / 2 - 0.005, H * 0.72, -0.55 + k * 0.5), rotation: new THREE.Euler(0, Math.PI / 2, 0) }));   // las ventanas altas del costado
  const sello = plano(K, panelJeroglifico({ w: 64, h: 32, fondo: cal ? EG.cal : EG.adobe, tinta: '#5a3a22', cols: 1, texto: JER.perAnkh, grano: false }), 0.2, 0.1); sello.position.set(-0.3, 0.46, D / 2 + 0.006); casa.add(sello);   // el ladrillo sellado «Casa de la Vida» (el de Amarna)
  if (niv >= 2) {                                                                                        // el segundo piso, los nichos y el estante suelto
    const H2 = 0.36;
    casa.add(oa(caja(K, W * 0.72, H2, D * 0.7, muro, { grosor: 0.012 }), { position: new THREE.Vector3(-W * 0.12, H + H2 / 2 + 0.05, -D * 0.1) }));
    casa.add(oa(caja(K, W * 0.74, 0.04, D * 0.72, muroD, { grosor: 0.006 }), { position: new THREE.Vector3(-W * 0.12, H + H2 + 0.07, -D * 0.1) }));
    for (let k = 0; k < 3; k++) casa.add(oa(caja(K, 0.1, 0.1, 0.02, '#3a2a1c', { sinTinta: true }), { position: new THREE.Vector3(-W * 0.12 - 0.3 + k * 0.3, H + 0.26, -D * 0.1 + D * 0.35 + 0.005) }));
    for (let f = 0; f < 2; f++) for (let c = 0; c < 3; c++) {
      const x = -0.44 + c * 0.2, y = 0.18 + f * 0.24;
      casa.add(oa(caja(K, 0.16, 0.16, 0.02, '#4a3222', { sinTinta: true }), { position: new THREE.Vector3(x, y, D / 2 + 0.006) }));
      const r = rollo(K, 0.12, 0.022); r.position.set(x, y - 0.03, D / 2 + 0.02); casa.add(r);
    }
    const est = new THREE.Group(); est.position.set(-W / 2 - 0.35, 0, -0.1); casa.add(est);
    est.add(oa(caja(K, 0.18, 0.62, 0.4, '#a8845a', { grosor: 0.008 }), { position: new THREE.Vector3(0, 0.31, 0) }));
    for (let k = 0; k < 6; k++) { const r = rollo(K, 0.14, 0.024); r.rotation.y = Math.PI / 2; r.position.set(0.1, 0.12 + Math.floor(k / 2) * 0.18, -0.08 + (k % 2) * 0.16); est.add(r); }
  }
  if (cal) {                                                                                             // Seshat y Thot pintados, y la estrella de siete puntas
    const fig = (sg, color, x) => { const t = panelJeroglifico({ w: 64, h: 96, fondo: EG.cal, tinta: color, cols: 1, texto: sg, grano: false }); const m = plano(K, t, 0.2, 0.3); m.position.set(x, 0.22, D / 2 + 0.007); casa.add(m); };
    fig(JER.thot, '#1f5f8a', -0.2); fig(JER.seshat, '#b5463a', 0.52);
    const estrella = new THREE.Group(); estrella.position.set(0.52, 0.52, D / 2 + 0.02); casa.add(estrella);
    for (let k = 0; k < 7; k++) { const p = K.malla(K.cono(0.018, 0.06, 4), EG.azul, { sinTinta: true }); const a = k * Math.PI * 2 / 7; p.position.set(Math.sin(a) * 0.035, Math.cos(a) * 0.035, 0); p.rotation.z = -a; estrella.add(p); }
    estrella.add(oa(K.malla(K.cilindro(0.02, 0.02, 0.01, 10), EG.oro, { sinTinta: true }), { rotation: new THREE.Euler(Math.PI / 2, 0, 0) }));
    const fr = plano(K, friso(JER.ankhDjedWas, { w: 256, h: 24 }), W, 0.07); fr.position.set(0, H - 0.06, D / 2 + 0.008); casa.add(fr);
  }
  if (niv >= 1) {                                                                                        // el patio de los copistas
    const C = ANCLAS.copistas;
    [[7.7, 8.05], [9.05, 8.15], [7.8, 8.75], [9.15, 8.85]].forEach(([x, y]) => en(P, K.malla(K.cilindro(0.022, 0.026, 0.72, 6), '#8a6a4a', { grosor: 0.004 }), x, y, 0.36));
    const toldo = caja(K, 1.55, 0.03, 0.9, '#d9c08a', { grosor: 0.006 }); en(P, toldo, 8.42, 8.45, 0.73, -0.08);
    en(P, caja(K, 1.2, 0.012, 0.6, '#c8ae78', { sinTinta: true }), C.x, C.y + 0.05, 0.006, -0.08);       // las esteras
    en(P, caja(K, 0.6, 0.14, 0.16, '#a8845a', { grosor: 0.006 }), 8.35, 8.75, 0.07, -0.08);             // el banco
    [[8.1, 8.35], [8.7, 8.3]].forEach(([x, y], i) => {
      const c = actor(P, K, { ...ESCRIBA, piel: [2, 3][i], pelo: i ? 'rapado' : 'peluca' }, 'escribir', x, y, { x: x + 0.1, y: y + 1 });
      const h = plano(K, hojaEscrita(64, 48), 0.2, 0.13); h.rotation.x = -1.2; h.position.set(0, -0.03, 0.07); c.sostener(h, 'I');
    });
  }
  return P;
}
export const CASA = ANCLAS.anexo;

/* ---------- LOS LINDES: el mojón que la crecida derribó, sobre su mancha de limo, esperando la cuerda ---------- */
export function linde(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  const limo = new THREE.Mesh(new THREE.CircleGeometry(0.3, 16), K.mat('#6f6a48')); limo.geometry.userData.propia = true; limo.rotation.x = -Math.PI / 2; limo.position.y = 0.008; limo.scale.set(1.3, 0.9, 1); g.add(limo);
  const e = K.malla(K.cilindro(0.024, 0.018, 0.46, 5), '#8a6a4a', { grosor: 0.005 }); e.rotation.z = 0.45; e.position.set(0.06, 0.2, 0); g.add(e);   // la estaca, torcida por el agua
  const trapo = K.malla(K.caja(0.1, 0.07, 0.01), '#c94f43', { grosor: 0.003 }); trapo.position.set(-0.03, 0.4, 0.01); trapo.rotation.z = 0.45; g.add(trapo);
  const m = caja(K, 0.13, 0.24, 0.1, '#c8bb98', { grosor: 0.006 }); m.rotation.z = 0.55; m.position.set(-0.13, 0.1, 0.06); g.add(m);   // el mojón, medio volcado
  const an = aro(0.3); g.add(an);
  return { obj: g, anim: t => an.userData.latir(t, true) };
}

/* ---------- la luz de la noche: el brasero de bronce en su trípode y la lámpara de aceite en su pie ---------- */
export function brasero(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  [0, 1, 2].forEach(k => { const a = k * Math.PI * 2 / 3, p = K.malla(K.cilindro(0.012, 0.012, 0.44, 4), '#7a5a30', { grosor: 0.003 }); p.position.set(Math.cos(a) * 0.07, 0.21, Math.sin(a) * 0.07); p.rotation.set(Math.sin(a) * 0.15, 0, -Math.cos(a) * 0.15); g.add(p); });
  const cuenco = vasija(K, [[0.001, 0], [0.1, 0.01], [0.14, 0.06], [0.15, 0.08]], '#9a6a2e', false); cuenco.position.y = 0.4; g.add(cuenco);
  const llama = new THREE.Group(); llama.position.y = 0.48; g.add(llama); g.userData.llama = llama;
  [['#ffb13b', 0.08, 0.2], ['#ffe68a', 0.045, 0.13]].forEach(([c, r, h]) => { const f = K.malla(K.cono(r, h, 7), c, { sinTinta: true, sombra: false, emissive: c, emissiveIntensity: 0.9 }); f.position.y = h / 2; llama.add(f); });
  return g;
}
export function lampara(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  g.add(oa(K.malla(K.cilindro(0.02, 0.05, 0.34, 6), '#c9b08a', { grosor: 0.004 }), { position: new THREE.Vector3(0, 0.17, 0) }));
  const c = vasija(K, [[0.001, 0], [0.06, 0.01], [0.075, 0.04]], '#c9b08a', false); c.position.y = 0.34; g.add(c);
  const llama = new THREE.Group(); llama.position.set(0.05, 0.38, 0); g.add(llama); g.userData.llama = llama;
  const f = K.malla(K.cono(0.025, 0.08, 6), '#ffd27a', { sinTinta: true, sombra: false, emissive: '#ffb13b', emissiveIntensity: 1 }); f.position.y = 0.04; llama.add(f);
  return g;
}

/* LAS PIEZAS: con su índice de saber para la auditoría de etapas (juego3d/qa.html) */
const enArena = f => (K, n) => { const P = f(K, n); P.arena = true; return P; };
export const PIEZAS = [
  { id: 'papiro', i: 20, crear: enArena(papiro) },
  { id: 'paleta', i: 21, crear: enArena(paleta) },
  { id: 'kemyt', i: 22, crear: enArena(kemyt) },
  { id: 'cuerda', i: 23, crear: enArena(cuerda) },
  { id: 'lascas', i: 31, crear: enArena((K, n) => patioLascas(K, n, { ejer: 2, lascas: 10, rojo: true })) },
  { id: 'anexo', i: 32, crear: enArena(anexo) },
];
