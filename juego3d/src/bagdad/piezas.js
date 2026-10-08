/* ============================================================
   bagdad/piezas
   Los seis saberes de Bagdad en 3D, cada uno con sus etapas (la máxima del proyecto: subir de nivel se VE, con piezas
   nuevas; se audita por diff de píxeles en juego3d/qa.html): el papel (45), la Casa de la Sabiduría (46), la mesa de los
   traductores (47), la halqa (48), el álgebra (49) y la madrasa (50). Más la gente de la época (estudiantes, maestros,
   al-Jahiz, Hunayn, el cadí) y las lámparas de la noche. Las anclas de la lógica son las del motor (09d-bagdad).
   Cada pieza devuelve { obj, anim, ancla, toc, actores } como las de las otras épocas (src/piezas.js).
   ============================================================ */
import * as THREE from 'three';
import { pieza, actor, texturaCanvas } from '../piezas.js';
import * as L from './lugares.js';
import { BA, hueco, cupula, casaMonumental, madrasa as madrasaMon, zoco } from './monumentos.js';

const ubic = (m, x, y, z, rx = 0, ry = 0, rz = 0) => { m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx, ry, rz); return m; };
const caja = (K, w, h, d, color, o) => K.malla(K.caja(w, h, d), color, o);
const en = (P, obj, x, y, h = 0, ry = 0) => { obj.position.copy(P.en(x, y)); obj.position.y += h; obj.rotation.y = ry; P.obj.add(obj); return obj; };
const plano = (K, tex, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), K.matMapa(tex)); m.geometry.userData.propia = true; m.castShadow = true; return m; };

export const ANCLAS = {
  papel: { x: L.MOLINO.x - 2.6, y: L.MOLINO.y - 0.8 }, casa: { x: L.CASA.x, y: L.CASA.y }, mesa: { x: L.MESA.x, y: L.MESA.y }, halqa: { x: L.HALQA.x, y: L.HALQA.y },
  algebra: { x: L.ZOCO.x + 0.15, y: L.ZOCO.y + 0.75 }, madrasa: { x: L.MADRASA.x, y: L.MADRASA.y }, libreros: { x: L.ZOCO.x - 0.05, y: L.ZOCO.y - 0.8 },
};
/* los asientos de la mesa de los traductores: los dos de siempre, el tercero de la etapa 3 y los dos del taller de Hunayn.
   Cada traductor se sienta en su cojín de cara a la plaza, con el atrilito (el kursi) delante. */
export const ASIENTOS_MESA = [[-0.5, -0.12], [-0.05, -0.12], [0.4, -0.12], [-0.3, 0.38], [0.18, 0.38]].map(([dx, dz]) => ({ x: L.MESA.x + dx, y: L.MESA.y + dz }));

/* LA GENTE DE BAGDAD. Los estudiantes: árabes con su turbante claro, persas con el gorro, cristianos siríacos y algún
   muchacho sin turbante; de vez en cuando una muchacha con su velo (⚖️ pocas, pero las hubo: Shuhda enseñó en Bagdad) */
export function aprendiz(i, extra = {}) {
  const chica = i % 9 === 4, nino = i % 3 === 0;
  return { edad: nino ? 'nino' : undefined, piel: [1, 2, 1, 3, 2][i % 5], pelo: chica ? 'moño' : 'corto', colorPelo: ['#2a1f18', '#3a2a1e', '#1e1610'][i % 3],
    ropa: 'tunica', colorRopa: ['#efe6d2', '#e2d6bc', '#d9cfb5', '#ece2cc', '#cfc4a8'][i % 5], orla: ['#2f6f8a', '#8a5a2a', '#5f7a4a', '#7a3a3a'][i % 4],
    turbante: chica || (nino && i % 2) ? undefined : ['#f1ebdc', '#d9c8a4', '#c9d6dc', '#efe8d8', '#d8b88a', '#e6dcc4', '#b9c4a8'][i % 7], velo: chica ? ['#3d5a7a', '#7a4a5e'][i % 2] : undefined,
    sinFlecos: true, ...extra };
}
/* los maestros: el turbante blanco, la barba y el taylasán (el chal del sabio sobre los hombros) */
export const MAESTRO = { piel: 1, pelo: 'corto', colorPelo: '#3a2a1e', barba: true, ropa: 'tunica', colorRopa: '#f1ebdc', orla: '#2f6f8a', chal: '#2f6f8a', turbante: '#f6f0e2' };
export const ALJAHIZ = { piel: 3, pelo: 'corto', colorPelo: '#1e1610', barba: '#3a3028', ropa: 'tunica', colorRopa: '#e9dcc0', orla: '#8a5a2a', chal: '#8a5a2a', turbante: '#efe4c8' };
export const HUNAYN = { piel: 1, pelo: 'corto', colorPelo: '#4a4038', barba: '#7a7068', ropa: 'tunica', colorRopa: '#3e4660', orla: '#c9a24a', chal: '#2a2f44', turbante: '#5a4e44' };
export const CADI = { piel: 1, pelo: 'corto', colorPelo: '#2a1f18', barba: '#d8d0c0', ropa: 'tunica', colorRopa: '#2e2a28', orla: '#c9a24a', chal: '#1e1a18', turbante: '#1e1a18' };   // el negro de los abasíes
export const SHUHDA = { piel: 1, pelo: 'moño', colorPelo: '#2a1f18', ropa: 'tunica', colorRopa: '#e6dcc8', orla: '#2f6f8a', velo: '#2f5f7a' };
export const TRADUCTORES = [
  { piel: 1, pelo: 'corto', colorPelo: '#3a2a1e', barba: true, ropa: 'tunica', colorRopa: '#ece2cc', orla: '#2f6f8a', turbante: '#f1ebdc' },
  { piel: 2, pelo: 'corto', colorPelo: '#2a1f18', barba: true, ropa: 'tunica', colorRopa: '#4a5a6e', orla: '#c9a24a', turbante: '#3e4660' },        // un cristiano siríaco, de oscuro
  { piel: 1, pelo: 'corto', colorPelo: '#5a4632', barba: '#7a6a5a', ropa: 'tunica', colorRopa: '#d9cfb5', orla: '#7a3a3a', turbante: '#e6dcc4' },
  { piel: 2, pelo: 'corto', colorPelo: '#1e1610', ropa: 'tunica', colorRopa: '#efe6d2', orla: '#5f7a4a', turbante: '#d8cdb2' },                    // un aprendiz del taller
  { piel: 1, pelo: 'corto', colorPelo: '#2a1f18', ropa: 'tunica', colorRopa: '#e2d6bc', orla: '#8a5a2a', turbante: '#efe8d8' },
];

/* ---------- utensilios ---------- */
/* el atrilito plegable de los que leen sentados en el suelo (el kursi): dos tablas en aspa con el libro abierto encima */
export function kursi(K, libro = true) {
  const g = new THREE.Group();
  [-1, 1].forEach(l => { const t = caja(K, 0.16, 0.012, 0.13, BA.madera, { grosor: 0.002 }); t.position.set(0, 0.07, l * 0.03); t.rotation.x = l * 0.75; g.add(t); });
  if (libro) {
    [-1, 1].forEach(l => { const h = caja(K, 0.07, 0.008, 0.1, BA.papel, { grosor: 0.0015 }); h.position.set(l * 0.036, 0.135, 0.01); h.rotation.set(-0.55, 0, -l * 0.12); g.add(h); });
    g.add(ubic(caja(K, 0.15, 0.006, 0.105, '#6a2a1e', { sinTinta: true }), 0, 0.128, 0.008, -0.55, 0, 0));
  }
  return g;
}
function cojin(K, color = BA.tela) { const c = K.malla(K.esfera(0.09, 0.5), color, { grosor: 0.002 }); c.scale.set(1.1, 0.32, 1); c.position.y = 0.03; return c; }
function alfombra(K, w, d, color = '#8a3a2a', borde = BA.oro) {
  const g = new THREE.Group();
  g.add(ubic(caja(K, w, 0.012, d, borde, { sinTinta: true, sombra: false }), 0, 0.006, 0));
  g.add(ubic(caja(K, w - 0.08, 0.014, d - 0.08, color, { sinTinta: true, sombra: false }), 0, 0.007, 0));
  g.add(ubic(caja(K, w * 0.3, 0.016, d * 0.3, BA.azul, { sinTinta: true, sombra: false }), 0, 0.008, 0, 0, Math.PI / 4, 0));   // el medallón del centro
  return g;
}
function cofre(K, color = BA.fardo) {
  const g = new THREE.Group();
  g.add(ubic(caja(K, 0.2, 0.12, 0.13, color, { grosor: 0.003 }), 0, 0.06, 0));
  const tapa = K.malla(new THREE.CylinderGeometry(0.065, 0.065, 0.2, 10, 1, false, 0, Math.PI), color, { grosor: 0.003 }); tapa.geometry.userData.propia = true; tapa.rotation.set(0, 0, Math.PI / 2); tapa.rotation.y = Math.PI / 2; tapa.position.y = 0.12; g.add(tapa);
  [-0.06, 0.06].forEach(x => g.add(ubic(caja(K, 0.018, 0.13, 0.135, BA.oroD, { sinTinta: true }), x, 0.065, 0)));
  return g;
}
function pilaLibros(K, n, semilla = 0) {
  const g = new THREE.Group();
  for (let q = 0; q < n; q++) g.add(ubic(caja(K, 0.11, 0.022, 0.085, ['#8a3a2a', '#2f5f7a', '#c9a46a', BA.papel, '#4f6a3a'][(q + semilla) % 5], { grosor: 0.0015 }), 0, 0.011 + q * 0.023, 0, 0, (q % 2) * 0.25, 0));
  return g;
}
/* la lámpara de la noche: el farol de vidrio colgado de su pie de madera (el qandil) */
export function lampara(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  g.add(ubic(K.malla(K.cilindro(0.014, 0.02, 0.62, 5), BA.maderaD, { grosor: 0.003 }), 0, 0.31, 0));
  g.add(ubic(caja(K, 0.16, 0.014, 0.014, BA.maderaD, { sinTinta: true }), 0.07, 0.61, 0));
  g.add(ubic(K.malla(K.cilindro(0.002, 0.002, 0.06, 3), BA.oroD, { sinTinta: true }), 0.13, 0.58, 0));
  const vidrio = K.malla(K.esfera(0.04, 0.6), '#ffe2a0', { sinTinta: true, transparent: true, opacity: 0.75 }); vidrio.scale.set(1, 1.2, 1); vidrio.position.set(0.13, 0.52, 0); g.add(vidrio);
  g.add(ubic(K.malla(K.cono(0.035, 0.03, 8), BA.oro, { sinTinta: true }), 0.13, 0.565, 0));
  const llama = new THREE.Group(); llama.position.set(0.13, 0.515, 0); g.add(llama); g.userData.llama = llama;
  llama.add(ubic(K.malla(K.cono(0.014, 0.04, 6), '#ffd27a', { sinTinta: true, sombra: false, emissive: '#ffb13b', emissiveIntensity: 1 }), 0, 0, 0));
  return g;
}

/* ---------- 45 · EL PAPEL: el taller del papelero, junto al molino ---------- */
/* 0: la tina de la pasta con el papelero que saca la hoja con el molde de cañas · 1: la prensa de tornillo y el montón de
   trapos de lino · 2: las cuerdas con las hojas secándose al sol · 3: las resmas atadas, listas para el zoco (y, aparte, los
   libreros: la ranura 'libreros') */
export function papel(K, n) {
  const P = pieza(ANCLAS.papel), A = ANCLAS.papel;
  const t = new THREE.Group(); en(P, t, A.x, A.y + 0.05);
  t.add(ubic(K.malla(K.cilindro(0.26, 0.24, 0.2, 14), BA.ladrilloD, { grosor: 0.004 }), 0, 0.1, 0));             // la tina de ladrillo
  t.add(ubic(K.malla(K.cilindro(0.225, 0.225, 0.01, 14), '#e8e2cc', { sinTinta: true }), 0, 0.19, 0));             // la pasta blanca
  const papelero = actor(P, K, { piel: 2, pelo: 'corto', colorPelo: '#2a1f18', ropa: 'corta', colorRopa: '#d8cbb0', turbante: '#cfc4a8', cola: false, oficio: true, k: 'papelero' }, 'agachado', A.x + 0.3, A.y + 0.32, { x: A.x, y: A.y + 0.05 });
  const molde = caja(K, 0.2, 0.012, 0.14, BA.maderaL, { grosor: 0.002 }); molde.position.set(0.15, 0.22, 0.12); molde.rotation.y = 0.7; t.add(molde);
  if (n >= 1) {
    const pr = new THREE.Group(); en(P, pr, A.x - 0.6, A.y - 0.15, 0, 0.3);
    [-1, 1].forEach(l => pr.add(ubic(caja(K, 0.04, 0.42, 0.04, BA.maderaD, { grosor: 0.003 }), l * 0.14, 0.21, 0)));
    pr.add(ubic(caja(K, 0.34, 0.05, 0.08, BA.madera, { grosor: 0.003 }), 0, 0.42, 0));
    pr.add(ubic(K.malla(K.cilindro(0.016, 0.016, 0.22, 6), BA.maderaD, { grosor: 0.002 }), 0, 0.33, 0));             // el tornillo
    pr.add(ubic(caja(K, 0.24, 0.1, 0.18, '#ede6d0', { grosor: 0.002 }), 0, 0.06, 0));                             // el taco de hojas húmedas
    pr.add(ubic(caja(K, 0.26, 0.03, 0.2, BA.madera, { grosor: 0.002 }), 0, 0.125, 0));
    const tr = new THREE.Group(); en(P, tr, A.x - 0.36, A.y + 0.36);                                               // los trapos de lino
    for (let k = 0; k < 5; k++) tr.add(ubic(K.malla(K.esfera(0.06, 0.5), ['#e9e0c8', '#d8cfb6', '#c9b89a', '#e2d6bc', '#efe8d6'][k], { grosor: 0.002 }), (k % 3) * 0.08 - 0.08, 0.035 + Math.floor(k / 3) * 0.05, (k % 2) * 0.06)).scale.set(1.3, 0.55, 1);
  }
  if (n >= 2) {
    const cu = new THREE.Group(); en(P, cu, A.x + 0.05, A.y - 0.52);
    [-0.55, 0.55].forEach(x => cu.add(ubic(K.malla(K.cilindro(0.014, 0.016, 0.62, 5), BA.maderaD, { grosor: 0.003 }), x, 0.31, 0)));
    [0.5, 0.36].forEach((y, f) => {
      cu.add(ubic(K.malla(K.cilindro(0.003, 0.003, 1.1, 3), '#8a7a5a', { sinTinta: true }), 0, y + 0.02, f * 0.12, 0, 0, Math.PI / 2));
      for (let k = 0; k < 6; k++) cu.add(ubic(caja(K, 0.14, 0.15, 0.004, k % 3 === 1 ? '#efe6cc' : '#f8f2e2', { grosor: 0.0015 }), -0.4 + k * 0.16 + f * 0.05, y - 0.06, f * 0.12, 0.06 * Math.sin(k * 1.7), 0, 0.04 * Math.sin(k)));
    });
  }
  if (n >= 3) {
    const rs = new THREE.Group(); en(P, rs, A.x + 0.62, A.y - 0.02, 0, -0.3);
    for (let k = 0; k < 4; k++) { const r = caja(K, 0.18, 0.08, 0.13, '#efe8d4', { grosor: 0.002 }); r.position.set((k % 2) * 0.2 - 0.1, 0.04 + Math.floor(k / 2) * 0.081, 0); rs.add(r);
      rs.add(ubic(caja(K, 0.012, 0.082, 0.135, '#8a6a3a', { sinTinta: true }), (k % 2) * 0.2 - 0.1, 0.04 + Math.floor(k / 2) * 0.081, 0)); }
    const burro = new THREE.Group(); en(P, burro, A.x + 0.55, A.y + 0.4, 0, -0.5);   // el burro que las lleva al zoco
    const GR = '#7e7268', GRD = '#5a5048';
    burro.add(ubic(K.malla(K.esfera(0.085, 0.6), GR, { grosor: 0.003 }), 0, 0.27, 0)).scale.set(1.75, 0.9, 0.8);
    burro.add(ubic(K.malla(K.capsula(0.034, 0.1, 0.6), GR, { grosor: 0.002 }), 0.17, 0.33, 0, 0, 0, -0.75));            // el cuello
    burro.add(ubic(K.malla(K.capsula(0.034, 0.08, 0.6), GR, { grosor: 0.002 }), 0.25, 0.39, 0, 0, 0, Math.PI / 2 + 0.45)); // la cabeza, larga
    burro.add(ubic(K.malla(K.esfera(0.026, 0.5), '#d8d0c4', { sinTinta: true }), 0.3, 0.355, 0));                          // el hocico claro
    [-1, 1].forEach(l => burro.add(ubic(K.malla(K.cono(0.014, 0.085, 4), GRD, { grosor: 0.001 }), 0.21, 0.47, l * 0.022, l * 0.2, 0, -0.25)));   // las orejas largas
    [[0.1, 0.04], [0.1, -0.04], [-0.1, 0.04], [-0.1, -0.04]].forEach(([x, z]) => burro.add(ubic(K.malla(K.cilindro(0.013, 0.011, 0.22, 4), GRD, { grosor: 0.002 }), x, 0.11, z)));
    burro.add(ubic(K.malla(K.cilindro(0.006, 0.003, 0.12, 3), GRD, { sinTinta: true }), -0.16, 0.24, 0, 0, 0, -0.4));     // la cola
    burro.add(ubic(caja(K, 0.16, 0.02, 0.2, BA.tela, { grosor: 0.002 }), 0, 0.345, 0));                                   // la albarda
    [-1, 1].forEach(l => burro.add(ubic(caja(K, 0.12, 0.08, 0.045, '#efe8d4', { grosor: 0.002 }), 0, 0.29, l * 0.1)));
  }
  P.toc = [{ x: A.x, y: A.y, k: 'molino', p: papelero }];
  return P;
}
/* los libreros (el papel en su etapa 3): dos puestos más en el zoco, con los copistas */
export function libreros(K) {
  const P = pieza(ANCLAS.libreros), A = ANCLAS.libreros;
  en(P, zoco(K, 2), A.x, A.y).scale.setScalar(ESC_ZOCO);
  actor(P, K, { ...aprendiz(7), turbante: '#e6dcc4', oficio: true, k: 'copista' }, 'escribir', A.x - 0.3, A.y - 0.45, { x: A.x - 0.3, y: A.y + 1 });
  return P;
}

/* ---------- 46 · LA CASA DE LA SABIDURÍA: la biblioteca del califa, por etapas ---------- */
/* El diseño C de la hoja (casaMonumental, el recinto de ladrillo color ante con su portada alta) a 0,6, como propuso la
   maqueta A: 'obra' los cimientos con andamios · 0 los muros, las torres y la portada · 1 las galerías del patio, las
   palmeras, el nombre en la portada y, afuera, los cofres de manuscritos con el lector · 2 la sala de los libros con su
   iwan de estantes · 3 la cúpula de gajos de la sala de lectura */
export const ESC_CASA = 0.6, ESC_ZOCO = 1.5;
export const FRENTE_CASA = L.CASA.y + 1.04;                                    // la cara de la portada (el frente del zócalo)
export function casa(K, n) {
  const P = pieza(ANCLAS.casa), A = ANCLAS.casa;
  const c = casaMonumental(K, n); c.scale.setScalar(ESC_CASA); en(P, c, A.x, A.y);
  if (n !== 'obra' && n >= 1) {                                                 // a la derecha de la portada: los cofres y el lector
    [[0.62, 1.22, BA.fardo], [0.86, 1.28, BA.fardoB], [1.12, 1.2, '#8a3a2a']].forEach(([dx, dz, col], i) => en(P, cofre(K, col), A.x + dx, A.y + dz, 0, 0.2 * i));
    actor(P, K, { ...MAESTRO, chal: '#8a5a2a', oficio: true, k: 'lectorCasa' }, 'leer', A.x + 0.9, A.y + 1.52, { x: A.x + 0.4, y: A.y + 2.4 });
    en(P, cojin(K, BA.telaL), A.x + 0.9, A.y + 1.52);
    en(P, kursi(K), A.x + 0.78, A.y + 1.66, 0, 0.5);
  }
  P.toc = [{ x: A.x, y: A.y, k: 'casasab' }];
  return P;
}

/* ---------- 47 · LA TRADUCCIÓN: la mesa de los traductores, delante de la Casa ---------- */
/* 0: la alfombra con los dos asientos (cojín y kursi) y el arcón de los diccionarios · 1: el atril grande con el manuscrito
   original y la hoja de la traducción · 2: los cálamos y los tinteros de dos tintas (la negra y la roja de los títulos) ·
   3: el tercer asiento y la tablilla de la cadena: del griego al siríaco y del siríaco al árabe */
export function mesa(K, n) {
  const P = pieza(ANCLAS.mesa), A = ANCLAS.mesa;
  en(P, alfombra(K, 1.45, 0.62), A.x - 0.05, A.y - 0.1);
  const asientos = n >= 3 ? 3 : 2;
  for (let k = 0; k < asientos; k++) { const s = ASIENTOS_MESA[k]; en(P, cojin(K, ['#2f5f7a', '#8a5a2a', '#5f7a4a'][k]), s.x, s.y); en(P, kursi(K), s.x + 0.05, s.y + 0.18); }
  const ar = cofre(K, '#5e3e24'); en(P, ar, A.x - 0.92, A.y - 0.32, 0, 0.4);
  for (let k = 0; k < 2; k++) { const lb = pilaLibros(K, 3 + k, k); lb.position.set(-0.04 + k * 0.08, 0.18, 0); ar.add(lb); }
  if (n >= 1) {
    const at = new THREE.Group(); en(P, at, A.x + 0.78, A.y - 0.05, 0, -0.5);
    at.add(ubic(K.malla(K.cilindro(0.016, 0.022, 0.42, 6), BA.maderaD, { grosor: 0.003 }), 0, 0.21, 0));
    at.add(ubic(caja(K, 0.3, 0.014, 0.2, BA.madera, { grosor: 0.003 }), 0, 0.43, 0, 0.45, 0, 0));
    const tx = texturaCanvas(160, 104, (c, W, H) => {                                         // a la izquierda el original griego, a la derecha el árabe
      c.fillStyle = '#efe4c4'; c.fillRect(0, 0, W / 2 - 2, H); c.fillStyle = '#f8f2e2'; c.fillRect(W / 2 + 2, 0, W / 2 - 2, H);
      c.fillStyle = '#4a3a2a'; c.font = '600 10px Georgia, serif'; ['ΓΑΛΗΝΟΥ', 'περὶ φυσι-', 'κῶν δυνά-', 'μεων α΄'].forEach((f, i) => c.fillText(f, 6, 18 + i * 20));
      c.fillStyle = '#2c2418'; c.font = '600 12px serif'; c.textAlign = 'right'; c.direction = 'rtl';
      c.fillStyle = '#8a2a1e'; c.fillText('كتاب جالينوس', W - 6, 18); c.fillStyle = '#2c2418'; ['في القوى', 'الطبيعية', 'المقالة الأولى'].forEach((f, i) => c.fillText(f, W - 6, 40 + i * 20));
    });
    const hoja = plano(K, tx, 0.28, 0.18); hoja.rotation.x = -(Math.PI / 2 - 0.45); hoja.position.set(0, 0.442, 0.004); at.add(hoja);
    /* el que coteja: un segundo manuscrito (la otra copia del original) abierto en un kursi, con su lámpara de aceite */
    const co = kursi(K); en(P, co, A.x + 0.95, A.y + 0.32, 0, -0.9); en(P, cojin(K, '#7a3a3a'), A.x + 0.82, A.y + 0.18);
    const lb = pilaLibros(K, 5, 1); en(P, lb, A.x + 1.08, A.y - 0.3, 0, 0.3);
  }
  if (n >= 2) {
    const tm = new THREE.Group(); en(P, tm, A.x + 0.62, A.y + 0.35, 0, -0.3);
    tm.add(ubic(caja(K, 0.34, 0.12, 0.2, BA.maderaL, { grosor: 0.003 }), 0, 0.06, 0));
    [['#1e140c', -0.08], ['#a8261e', 0.0]].forEach(([col, x]) => { tm.add(ubic(K.malla(K.cilindro(0.028, 0.034, 0.05, 8), BA.barro || '#8a6a48', { grosor: 0.002 }), x, 0.145, 0.02)); tm.add(ubic(K.malla(K.cilindro(0.02, 0.02, 0.006, 8), col, { sinTinta: true }), x, 0.171, 0.02)); });
    const va = K.malla(K.cilindro(0.03, 0.026, 0.07, 8), BA.turquesa, { grosor: 0.002 }); va.position.set(0.1, 0.155, -0.02); tm.add(va);   // el vaso de los cálamos
    for (let k = 0; k < 5; k++) tm.add(ubic(K.malla(K.cilindro(0.004, 0.003, 0.17, 3), '#c9a46a', { sinTinta: true }), 0.1 + (k - 2) * 0.008, 0.22, -0.02, 0, 0, (k - 2) * 0.1));
    const lb = pilaLibros(K, 4, 2); lb.position.set(-0.05, 0.12, -0.06); tm.add(lb);
  }
  if (n >= 3) {
    const cad = new THREE.Group(); en(P, cad, A.x - 0.15, A.y - 0.5);
    [-0.32, 0.32].forEach(x => cad.add(ubic(K.malla(K.cilindro(0.012, 0.014, 0.52, 5), BA.maderaD, { grosor: 0.002 }), x, 0.26, 0)));
    const tx = texturaCanvas(256, 56, (c, W, H) => {
      c.fillStyle = '#efe4c4'; c.fillRect(0, 0, W, H); c.strokeStyle = '#8a6a3a'; c.lineWidth = 3; c.strokeRect(2, 2, W - 4, H - 4);
      c.textBaseline = 'middle'; c.fillStyle = '#4a3a2a'; c.font = '600 17px Georgia, serif'; c.fillText('ΛΟΓΟΣ', 12, H / 2);
      c.fillStyle = '#8a5a2a'; c.font = '600 18px serif'; c.fillText('→', 82, H / 2); c.fillStyle = '#4a3a2a'; c.font = 'italic 15px Georgia, serif'; c.fillText('melltā', 104, H / 2);
      c.fillStyle = '#8a5a2a'; c.font = '600 18px serif'; c.fillText('→', 164, H / 2); c.fillStyle = '#8a2a1e'; c.font = '600 20px serif'; c.fillText('كلمة', 192, H / 2);
    });
    const tab = plano(K, tx, 0.62, 0.135); tab.position.set(0, 0.46, 0.02); cad.add(tab);
  }
  P.toc = [{ x: A.x, y: A.y, k: 'mesatrad' }];
  return P;
}

/* ---------- 48 · LA HALQA: el círculo de la mezquita y la ijaza ---------- */
/* 0: la galería (dos columnas con su arco, pegada a la mezquita) y la estera redonda donde se sienta el círculo · 1: los
   kursi con los libros alrededor de la estera · 2: Shuhda «la escritora» con su propio círculo, en otra estera · 3: el atril
   de la ijaza con el libro firmado y la lámpara colgada de la galería */
export const HALQA_COLUMNA = { x: L.HALQA.x, y: L.HALQA.y - 0.32 };
export function halqa(K, n) {
  const P = pieza(ANCLAS.halqa), A = ANCLAS.halqa;
  const ga = new THREE.Group(); en(P, ga, HALQA_COLUMNA.x, HALQA_COLUMNA.y - 0.12); ga.scale.setScalar(1.45);   // a la escala de la gente: el arco a 1,1
  [-0.42, 0.42].forEach(x => { ga.add(ubic(K.malla(K.cilindro(0.04, 0.045, 0.5, 8), BA.cal, { grosor: 0.003 }), x, 0.25, 0)); ga.add(ubic(caja(K, 0.11, 0.04, 0.11, BA.calD, { grosor: 0.002 }), x, 0.52, 0)); });
  const arco = K.malla(K.caja(0.98, 0.2, 0.12), '#ffffff', { grosor: 0.004 }); arco.material = K.mat(BA.adobe); arco.position.y = 0.64; ga.add(arco);
  const hu = hueco(K, 0.76, 0.2, BA.adobeD); hu.position.set(0, 0.42, 0.062); ga.add(hu);
  ga.add(ubic(caja(K, 1.04, 0.035, 0.32, BA.adobeD, { grosor: 0.003 }), 0, 0.755, -0.08));
  const es = K.malla(K.cilindro(0.62, 0.62, 0.012, 24), BA.estera, { sinTinta: true, sombra: false }); es.position.set(0, 0.006, 0); en(P, es, A.x, A.y + 0.15);
  en(P, K.malla(K.toro(0.6, 0.012, Math.PI * 2, 0.6), '#a8894a', { sinTinta: true, sombra: false }), A.x, A.y + 0.15, 0.012).rotation.x = Math.PI / 2;
  en(P, cojin(K, '#2f5f7a'), HALQA_COLUMNA.x, HALQA_COLUMNA.y + 0.05);
  if (n >= 1) {
    for (let k = 0; k < 6; k++) { const a = Math.PI * 0.1 + k * Math.PI * 0.8 / 5, r = 0.48; en(P, kursi(K), A.x + Math.cos(a) * r * 0.95, A.y + 0.15 + Math.sin(a) * r, 0, -a + Math.PI / 2); }
    [[-0.32, 0.1, 5, 1], [0.34, 0.08, 4, 3]].forEach(([dx, dz, q, s]) => en(P, pilaLibros(K, q, s), HALQA_COLUMNA.x + dx, HALQA_COLUMNA.y + dz, 0, 0.3 * dx));   // los libros del maestro, a los lados del cojín
    en(P, cofre(K, BA.fardoB), A.x + 0.75, A.y + 0.35, 0, -0.5);                                                       // el arcón de los libros de la lección
  }
  if (n >= 2) {
    const S2 = { x: A.x - 1.0, y: A.y + 0.55 };
    en(P, K.malla(K.cilindro(0.36, 0.36, 0.012, 20), '#b89a58', { sinTinta: true, sombra: false }), S2.x, S2.y);
    actor(P, K, { ...SHUHDA, oficio: true, k: 'shuhda' }, 'narrarSentada', S2.x - 0.12, S2.y - 0.14, { x: S2.x + 0.3, y: S2.y + 0.4 }, { asiento: 0.02 });
    actor(P, K, { ...aprendiz(4), oficio: true, k: 'alumnaShuhda' }, 'leer', S2.x + 0.2, S2.y + 0.16, { x: S2.x - 0.12, y: S2.y - 0.14 }, { asiento: 0.02 });
    en(P, kursi(K), S2.x + 0.05, S2.y - 0.02, 0, 0.8);
    const lb = pilaLibros(K, 4, 3); en(P, lb, S2.x - 0.34, S2.y - 0.26);
  }
  if (n >= 3) {
    const at = new THREE.Group(); en(P, at, A.x + 0.82, A.y - 0.1, 0, -0.6);
    at.add(ubic(K.malla(K.cilindro(0.018, 0.024, 0.46, 6), BA.maderaD, { grosor: 0.003 }), 0, 0.23, 0));
    at.add(ubic(caja(K, 0.3, 0.014, 0.2, BA.madera, { grosor: 0.003 }), 0, 0.47, 0, 0.45, 0, 0));
    const tx = texturaCanvas(160, 104, (c, W, H) => {                                         // la página firmada: el texto, la cadena y el sello
      c.fillStyle = '#f8f2e2'; c.fillRect(0, 0, W, H); c.direction = 'rtl'; c.textAlign = 'right';
      c.fillStyle = '#2c2418'; c.font = '600 11px serif'; ['قرأ عليّ هذا الكتاب', 'من أوله إلى آخره', 'وأجزت له أن يرويه عني'].forEach((f, i) => c.fillText(f, W - 8, 20 + i * 18));
      c.fillStyle = '#a8261e'; c.font = '600 12px serif'; c.fillText('إجازة', W - 8, 86);
      c.fillStyle = '#a8261e'; c.beginPath(); c.arc(28, 80, 13, 0, 7); c.fill(); c.fillStyle = '#f8f2e2'; c.beginPath(); c.arc(28, 80, 7, 0, 7); c.fill();
    });
    const hoja = plano(K, tx, 0.27, 0.175); hoja.rotation.x = -(Math.PI / 2 - 0.45); hoja.position.set(0, 0.482, 0.004); at.add(hoja);
    const lp = lampara(K); en(P, lp, HALQA_COLUMNA.x + 0.55, HALQA_COLUMNA.y + 0.22);
    const ar = cofre(K, '#5e3e24'); en(P, ar, HALQA_COLUMNA.x - 0.95, HALQA_COLUMNA.y + 0.3, 0, 0.3);   // el arcón con los libros firmados
    for (let k = 0; k < 2; k++) { const lb = pilaLibros(K, 3 + k, k + 2); lb.position.set(-0.04 + k * 0.08, 0.18, 0); ar.add(lb); }
  }
  P.toc = [{ x: A.x, y: A.y, k: 'halqa' }];
  return P;
}

/* ---------- 49 · EL ÁLGEBRA DE AL-JUARISMI: en el zoco, junto al cadí ---------- */
/* 0: la tabla de polvo con las cifras de la India, y el maestro del cálculo · 1: la balanza grande de la muqabala, con sus
   pesas · 2: los mercaderes que aprenden a hacer cuentas, con sus tablas · 3: el atril con el libro del álgebra abierto en
   la figura que completa el cuadrado */
function tablaPolvo(K) {
  const g = new THREE.Group();
  g.add(ubic(caja(K, 0.5, 0.04, 0.34, BA.madera, { grosor: 0.003 }), 0, 0.2, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(ubic(K.malla(K.cilindro(0.012, 0.012, 0.2, 4), BA.maderaD, { grosor: 0.002 }), a * 0.21, 0.1, b * 0.13)));
  const tx = texturaCanvas(160, 108, (c, W, H) => {
    c.fillStyle = '#d9c49a'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) { c.fillStyle = i % 2 ? 'rgba(150,120,80,.25)' : 'rgba(255,248,230,.3)'; c.fillRect((i * 37) % W, (i * 53) % H, 2, 2); }
    c.fillStyle = '#5a4230'; c.font = '600 22px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('٣٩ = ١٠ + ٢', W / 2, 30);                    // los numerales de la India, como se escribían en Bagdad
    c.fillText('١٢٣٤٥٦٧٨٩٠', W / 2, 66);
    c.strokeStyle = '#5a4230'; c.lineWidth = 2; c.beginPath(); c.moveTo(18, 86); c.lineTo(W - 18, 86); c.stroke();
    c.font = 'italic 13px serif'; c.fillText('صفر · ٠', W / 2, 98);
  });
  const p = plano(K, tx, 0.46, 0.3); p.rotation.x = -Math.PI / 2; p.position.y = 0.222; g.add(p);
  return g;
}
export function algebra(K, n) {
  const P = pieza(ANCLAS.algebra), A = ANCLAS.algebra;
  en(P, tablaPolvo(K), A.x, A.y, 0, 0.15);
  const maestro = actor(P, K, { ...MAESTRO, chal: '#5f7a4a', oficio: true, k: 'calculista' }, 'escribir', A.x - 0.1, A.y - 0.32, { x: A.x, y: A.y });
  en(P, cojin(K, '#5f7a4a'), A.x - 0.1, A.y - 0.32);
  if (n >= 1) {
    const bz = new THREE.Group(); en(P, bz, A.x + 0.62, A.y - 0.15, 0, 0.3);
    bz.add(ubic(caja(K, 0.22, 0.04, 0.22, BA.maderaD, { grosor: 0.003 }), 0, 0.02, 0));
    bz.add(ubic(K.malla(K.cilindro(0.014, 0.018, 0.62, 6), BA.oroD, { grosor: 0.002 }), 0, 0.33, 0));
    bz.add(ubic(caja(K, 0.5, 0.018, 0.018, BA.oroD, { grosor: 0.002 }), 0, 0.62, 0, 0, 0, 0.06));
    [-1, 1].forEach(l => {
      bz.add(ubic(K.malla(K.cilindro(0.003, 0.003, 0.2, 3), '#8a7a5a', { sinTinta: true }), l * 0.24, 0.52 + l * 0.015, 0));
      const pl = K.malla(K.cilindro(0.075, 0.06, 0.02, 10), BA.oro, { grosor: 0.002 }); pl.position.set(l * 0.24, 0.42 + l * 0.015, 0); bz.add(pl);
    });
    for (let k = 0; k < 3; k++) bz.add(ubic(K.malla(K.cilindro(0.022 - k * 0.004, 0.026 - k * 0.004, 0.03, 8), '#6a5a4a', { grosor: 0.002 }), -0.24, 0.445 + k * 0.03, 0));   // las pesas
    bz.add(ubic(caja(K, 0.06, 0.05, 0.06, BA.fardo, { grosor: 0.002 }), 0.24, 0.47, 0));
  }
  if (n >= 2) [[-0.6, 0.1, 2], [-0.32, 0.36, 5]].forEach(([dx, dz, i], k) => {
    actor(P, K, { ...aprendiz(i), edad: undefined, barba: k === 0, turbante: ['#c9b48a', '#e6dcc4'][k], colorRopa: ['#8a5a3a', '#4f6a7a'][k], oficio: true, k: 'mercader' + k }, 'leer', A.x + dx, A.y + dz, { x: A.x, y: A.y });
    en(P, cojin(K, ['#8a3a2a', '#2f5f7a'][k]), A.x + dx, A.y + dz);
  });
  if (n >= 3) {
    const at = new THREE.Group(); en(P, at, A.x + 0.42, A.y + 0.3, 0, -0.35);
    at.add(ubic(K.malla(K.cilindro(0.018, 0.024, 0.46, 6), BA.maderaD, { grosor: 0.003 }), 0, 0.23, 0));
    at.add(ubic(caja(K, 0.32, 0.014, 0.21, BA.madera, { grosor: 0.003 }), 0, 0.47, 0, 0.45, 0, 0));
    const tx = texturaCanvas(160, 104, (c, W, H) => {                                         // la figura del libro: completar el cuadrado (x² + 10x = 39)
      c.fillStyle = '#f8f2e2'; c.fillRect(0, 0, W, H);
      const x0 = 18, y0 = 14, a = 44, b = 22; c.strokeStyle = '#2c2418'; c.lineWidth = 2;
      c.strokeRect(x0 + b, y0 + b, a, a); c.strokeRect(x0 + b, y0, a, b); c.strokeRect(x0 + b, y0 + b + a, a, b); c.strokeRect(x0, y0 + b, b, a); c.strokeRect(x0 + b + a, y0 + b, b, a);
      c.fillStyle = 'rgba(168,38,30,.35)'; [[x0, y0], [x0 + b + a, y0], [x0, y0 + b + a], [x0 + b + a, y0 + b + a]].forEach(([x, y]) => c.fillRect(x, y, b, b));
      c.direction = 'rtl'; c.textAlign = 'right'; c.fillStyle = '#2c2418'; c.font = '600 11px serif';
      ['الكتاب المختصر', 'في حساب', 'الجبر والمقابلة'].forEach((f, i) => c.fillText(f, W - 6, 26 + i * 20));
    });
    const hoja = plano(K, tx, 0.29, 0.185); hoja.rotation.x = -(Math.PI / 2 - 0.45); hoja.position.set(0, 0.482, 0.004); at.add(hoja);
  }
  return P;
}

/* ---------- 50 · LA MADRASA: la escuela con renta, junto al camino del puente ---------- */
export function madrasa(K, n) {
  const P = pieza(ANCLAS.madrasa), A = ANCLAS.madrasa;
  const m = madrasaMon(K, n); m.scale.set(1.1, 1.5, 1.1); en(P, m, A.x, A.y);   // los muros, los iwanes y la cúpula a la altura de las casas nuevas
  if (n !== 'obra' && n >= 1) actor(P, K, { ...MAESTRO, chal: '#2f9aa5', oficio: true, k: 'mudarris' }, 'narrar', A.x, A.y - 0.42, { x: A.x + 0.4, y: A.y + 0.6 });
  if (n !== 'obra' && n >= 2) [0, 1].forEach(k => actor(P, K, { ...aprendiz(k + 1), oficio: true, k: 'talib' + k }, 'leer', A.x - 0.22 + k * 0.46, A.y + 0.1, { x: A.x, y: A.y - 0.42 }, { asiento: 0.02 }));
  return P;
}

/* LAS PIEZAS: con su índice de saber para la auditoría de etapas (juego3d/qa.html) */
export const PIEZAS = [
  { id: 'papel', i: 45, crear: papel },
  { id: 'casa', i: 46, crear: casa },
  { id: 'mesa', i: 47, crear: mesa },
  { id: 'halqa', i: 48, crear: halqa },
  { id: 'algebra', i: 49, crear: algebra },
  { id: 'madrasa', i: 50, crear: madrasa },
];
