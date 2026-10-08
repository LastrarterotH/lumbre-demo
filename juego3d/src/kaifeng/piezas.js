/* ============================================================
   kaifeng/piezas
   Los seis saberes de China Song en 3D, cada uno con sus etapas (la máxima del proyecto: subir de nivel se VE, con piezas
   nuevas y no con brillos; se audita por diff de píxeles en juego3d/qa.html): la escuela de la prefectura (81), los
   clásicos impresos (82), las dos salas de Hu Yuan (83), el examen anónimo (84), la academia (85) y el examen de palacio
   (86). La arquitectura es la de las piezas grandes (el Yingzao Fashi: cubierta cóncava, alero que se levanta, madera
   bermellón, muros encalados, tejas grises), a la escala de las tiendas: las salas miden lo que una casa (0,9-1,2 de
   alto con el techo) y las cosas de adentro, lo que su gente.
   EL ACUERDO CON LA ÉPOCA (epoca15.js): cada sala va DETRÁS de su gente y le deja libre el arco de adelante (+x +z), donde
   se sientan. En la prefectura, el maestro enseña en SITIOS.prefectura y los que estudian de memoria se sientan delante; los
   que esperan hacen fila en SITIOS.fila, junto a la portada. Hu Yuan tiene dos maestros, uno por sala (SITIOS.clasicos y
   SITIOS.asuntos). En la academia se sientan los que estudian para entender. En el recinto del examen, P.celdas dice
   dónde se sienta cada candidato el día del examen. Las cosas de cada pieza no tapan a su gente desde la cámara.
   Más la gente de la época: los candidatos, los letrados, los de la ciudad, los maestros, Li Qingzhao y Zhu Xi.
   ============================================================ */
import * as THREE from 'three';
import { pieza, actor } from '../piezas.js';
import * as L from './lugares.js';
import * as KM from './monumentos.js';
import { textura, matTex, lamina } from '../agora/monumentos.js';

const { KF } = KM;
const ubic = (m, x, y, z, rx = 0, ry = 0, rz = 0) => { m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx, ry, rz); return m; };
const caja = (K, w, h, d, color, o = { grosor: 0.002 }) => K.malla(K.caja(w, h, d), color, o);
const cil = (K, r1, r2, h, n, color, o = { grosor: 0.002 }) => K.malla(K.cilindro(r1, r2, h, n), color, o);
const esf = (K, r, color, o = { grosor: 0.002 }, q = 0.5) => K.malla(K.esfera(r, q), color, o);
const en = (P, obj, x, y, h = 0, ry = 0) => { obj.position.copy(P.en(x, y)); obj.position.y += h; obj.rotation.y = ry; P.obj.add(obj); return obj; };
const poner = (P, B, obj, dx, dz, ry = 0, h = 0) => en(P, obj, B.x + dx, B.y + dz, h, ry);
const ST = { sinTinta: true };
const TINTA = '#2a2420', PAPEL = '#f3ead2', AZUL_LIBRO = '#3f5a7a', AMARILLO = '#e8c45a';
/* LA ESCALA: las piezas se arman a la medida de las tiendas de la hoja y se agrandan desde su ancla (ESC), para que las
   salas midan lo que una casa del juego (1,1-1,2 con el techo) junto a su gente. Lo que se toca y las celdas, también */
export const ESC = 1.35;
function escalar(P, s = ESC) {
  const w = new THREE.Group(); w.scale.setScalar(s); [...P.obj.children].forEach(c => w.add(c)); P.obj.add(w);
  const B = P.ancla, f = q => ({ ...q, x: B.x + (q.x - B.x) * s, y: B.y + (q.y - B.y) * s });
  P.toc = (P.toc || []).map(f); if (P.celdas) P.celdas = P.celdas.map(f);
  return P;
}

export const ANCLAS = {
  prefectura: { x: L.PREFECTURA.x, y: L.PREFECTURA.y }, impresos: { x: L.IMPRESOS.x, y: L.IMPRESOS.y }, huyuan: { x: L.HUYUAN.x, y: L.HUYUAN.y },
  anonimo: { x: L.ANONIMO.x, y: L.ANONIMO.y }, academia: { x: L.ACADEMIA.x, y: L.ACADEMIA.y }, palacio: { x: L.PALACIO.x, y: L.PALACIO.y },
};
const A = ANCLAS;
/* dónde se para cada uno (epoca15 los usa): el maestro de cada sala, delante de ella, y la fila de los que esperan */
export const SITIOS = {
  prefectura: { x: A.prefectura.x - 0.25, y: A.prefectura.y - 0.2 },
  fila: { x: A.prefectura.x + 0.95, y: A.prefectura.y + 0.45 },
  clasicos: { x: A.huyuan.x - 0.62, y: A.huyuan.y - 0.12 },
  asuntos: { x: A.huyuan.x + 0.62, y: A.huyuan.y - 0.12 },
  academia: { x: A.academia.x - 0.3, y: A.academia.y - 0.05 },
  impresos: { x: A.impresos.x + 0.1, y: A.impresos.y - 0.2 },
  examen: { x: A.anonimo.x + 0.55, y: A.anonimo.y + 0.55 },
  lista: { x: A.palacio.x + 0.55, y: A.palacio.y + 0.3 },
};

/* ---------- las pinturas (lienzos en caché: no se liberan con la pieza) ---------- */
const cartel = (K, clave, w, h, pinta, ancho, alto) => lamina(K, matTex(K, clave, textura(clave, w, h, pinta)), ancho, alto);
const FUENTE = '"Songti SC", "STSong", "Noto Serif CJK SC", "Hiragino Mincho ProN", "SimSun", serif';
const columnas = (g, w, h, txt, tam, color, x0, paso, y0) => { g.fillStyle = color; g.font = `700 ${tam}px ${FUENTE}`; g.textAlign = 'center'; g.textBaseline = 'top';
  txt.forEach((col, i) => [...col].forEach((c, j) => g.fillText(c, w - x0 - i * paso, y0 + j * tam * 1.05))); };
/* la plancha tallada: los caracteres al revés, en relieve sobre la madera (lo blanco se saca, lo negro queda) */
const pPlancha = (g, w, h) => {
  g.fillStyle = '#c99c6b'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(90,60,30,.25)'; for (let i = 0; i < 40; i++) g.fillRect(0, (i * 13) % h, w, 1);
  g.strokeStyle = '#5a3a20'; g.lineWidth = 4; g.strokeRect(8, 8, w - 16, h - 16); g.save(); g.translate(w, 0); g.scale(-1, 1);
  columnas(g, w, h, ['學而時習之', '不亦說乎有', '朋自遠方來', '不亦樂乎人'], 34, '#3a2414', 22, 44, 18); g.restore();
};
/* la hoja impresa, ya derecha: el comienzo de las Analectas */
const pHoja = (g, w, h) => {
  g.fillStyle = PAPEL; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a4a2a'; g.lineWidth = 3; g.strokeRect(10, 10, w - 20, h - 20);
  for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(w - 10 - i * 40, 10); g.lineTo(w - 10 - i * 40, h - 10); g.lineWidth = 1; g.stroke(); }
  columnas(g, w, h, ['子曰學而時', '習之不亦說', '乎有朋自遠', '方來不亦樂', '乎人不知而'], 30, TINTA, 30, 40, 18);
};
/* la lista de los aprobados (el bang): papel amarillo, los nombres en columnas, el sello rojo del emperador */
const pLista = (g, w, h) => {
  g.fillStyle = '#f1d488'; g.fillRect(0, 0, w, h); g.strokeStyle = '#a8382a'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
  columnas(g, w, h, ['進士及第', '蘇軾', '蘇轍', '曾鞏', '張載', '程顥', '呂惠卿', '王韶', '朱光庭', '蔣之奇'], 28, TINTA, 26, 46, 16);
  g.fillStyle = '#c0392b'; g.fillRect(40, h - 80, 54, 54); g.fillStyle = '#f1d488'; g.font = `700 22px ${FUENTE}`; g.textAlign = 'center'; g.fillText('御', 67, h - 64);
};
/* la estela de la promoción de 1057 */
const pEstela = (g, w, h) => {
  g.fillStyle = '#c9c2b2'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(80,70,60,.15)'; for (let i = 0; i < 160; i++) g.fillRect((i * 37) % w, (i * 53) % h, 3, 2);
  columnas(g, w, h, ['嘉祐二年', '蘇軾蘇轍', '曾鞏張載', '程顥同榜'], 30, '#3a3430', 22, 40, 20);
};
/* la tabla de los asuntos de cada uno: el principal y el de al lado (gobernar, la defensa, el agua, la aritmética) */
const pAsuntos = (g, w, h) => {
  g.fillStyle = '#f1e6c9'; g.fillRect(0, 0, w, h); g.strokeStyle = '#a8382a'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10);
  columnas(g, w, h, ['主治', '治民', '講武', '堰水', '曆算', '兼攝', '水利', '算數', '治民', '講武'], 26, TINTA, 22, 30, 16);
};
/* el biombo de la sala de los clásicos: el comienzo de la Gran Enseñanza, en tres hojas */
const pBiombo = k => (g, w, h) => {
  g.fillStyle = '#efe3c4'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a4a2a'; g.lineWidth = 4; g.strokeRect(5, 5, w - 10, h - 10);
  columnas(g, w, h, [['大學之道', '在明明德', '在親民'][k], ['在止於至', '善知止而', '后有定'][k]], 26, TINTA, 26, 36, 14);
};
/* el tablero de los asuntos: el río y sus canales, con las esclusas (lo que se estudiaba en la sala de Hu Yuan) */
const pMapaRio = (g, w, h) => {
  g.fillStyle = '#efe3c4'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3f6a8a'; g.lineWidth = 9; g.beginPath(); g.moveTo(0, h * 0.3); g.bezierCurveTo(w * 0.3, h * 0.2, w * 0.5, h * 0.7, w, h * 0.6); g.stroke();
  g.lineWidth = 4; g.beginPath(); g.moveTo(w * 0.4, h * 0.42); g.lineTo(w * 0.45, h); g.stroke(); g.beginPath(); g.moveTo(w * 0.7, h * 0.62); g.lineTo(w * 0.8, 0); g.stroke();
  g.fillStyle = '#8a4a2a'; [[0.43, 0.7], [0.76, 0.3]].forEach(([x, y]) => g.fillRect(w * x - 10, h * y - 4, 20, 8));
  g.strokeStyle = '#a8382a'; g.lineWidth = 2; for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(i * w / 6, 0); g.lineTo(i * w / 6, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 6); g.lineTo(w, i * h / 6); g.stroke(); }
};

/* ---------- los muebles y las cosas ---------- */
function sala(K, { W = 1.2, D = 0.7, h = 0.48, frente = 'abierto', bahias = 3, tipo = 'xieshan', tono = 'gris', plat = 0.06, vuelo = 0.16, dougong = true, pisos = null, inset = 0.1, baranda = false } = {}) {
  return KM.edificio(K, { W, D, plat, pisos: pisos || [{ h, frente, bahias, dougong }], tipo, vuelo, tono, inset, baranda });
}
function placaSobre(K, P, B, texto, dx, dz, y, alto = 0.085, ry = 0) { const p = KM.placa(K, texto, alto, { fondo: '#2e4766' }); poner(P, B, p, dx, dz, ry, y); return p; }
/* el escritorio bajo (an) con los cuatro tesoros: el pincel, la barra de tinta, el papel y la piedra de moler */
export function escritorio(K, s = 1) {
  const g = new THREE.Group();
  g.add(ubic(caja(K, 0.3 * s, 0.018, 0.17 * s, KF.madera), 0, 0.12 * s, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(ubic(caja(K, 0.016, 0.12 * s, 0.016, KF.maderaD, ST), a * 0.13 * s, 0.06 * s, b * 0.065 * s)));
  g.add(ubic(caja(K, 0.11 * s, 0.006, 0.08 * s, PAPEL, ST), -0.05 * s, 0.132 * s, 0.01));
  g.add(ubic(caja(K, 0.06 * s, 0.014, 0.05 * s, '#3a3634', { grosor: 0.001 }), 0.09 * s, 0.137 * s, -0.02));   // la piedra de tinta
  g.add(ubic(cil(K, 0.004, 0.004, 0.09 * s, 4, KF.maderaD, ST), 0.04 * s, 0.135 * s, 0.05 * s, 0, 0, Math.PI / 2));
  return g;
}
/* el farol de papel rojo en su palo (la ciudad que no dormía: el mercado de la noche) */
export function farol(K, alto = 0.5, color = '#d4553a') {
  const g = new THREE.Group(); g.userData.vivo = true;
  g.add(ubic(cil(K, 0.012, 0.016, alto, 6, KF.maderaD), 0, alto / 2, 0));
  g.add(ubic(caja(K, 0.12, 0.012, 0.012, KF.maderaD), 0.05, alto - 0.01, 0));
  const fa = esf(K, 0.045, color, { grosor: 0.0015 }, 0.6); fa.scale.set(1, 1.2, 1); g.add(ubic(fa, 0.1, alto - 0.08, 0));
  [-1, 1].forEach(l => g.add(ubic(cil(K, 0.022, 0.022, 0.012, 8, '#2a2420', ST), 0.1, alto - 0.08 + l * 0.05, 0)));
  const llama = new THREE.Group(); llama.position.set(0.1, alto - 0.08, 0); g.add(llama); g.userData.llama = llama;
  llama.add(K.malla(K.esfera(0.05, 0.5), '#ffcf7a', { sinTinta: true, sombra: false, emissive: '#ff9a4a', emissiveIntensity: 1.1, transparent: true, opacity: 0.55 }));
  llama.visible = false;
  return g;
}
/* el estante de los libros cosidos (de tapas azules, apilados de costado, como se guardaban) */
function estante(K, w = 0.42, h = 0.5, filas = 3) {
  const g = new THREE.Group();
  [-1, 1].forEach(l => g.add(ubic(caja(K, 0.025, h, 0.14, KF.maderaD), l * w / 2, h / 2, 0)));
  for (let f = 0; f <= filas; f++) g.add(ubic(caja(K, w, 0.018, 0.14, KF.madera), 0, 0.02 + f * (h - 0.04) / filas, 0));
  for (let f = 0; f < filas; f++) for (let k = 0; k < 5; k++) {
    const pila = 2 + (k + f) % 3;
    for (let p = 0; p < pila; p++) g.add(ubic(caja(K, w / 5 - 0.02, 0.018, 0.1, p % 2 ? AZUL_LIBRO : '#4f6a8a', ST), -w / 2 + (k + 0.5) * w / 5, 0.04 + f * (h - 0.04) / filas + p * 0.02, 0.01));
  }
  return g;
}
/* la tabla de contar (el suanpan no existe todavía: se cuenta con las varillas sobre el tablero cuadriculado) */
function varillas(K) {
  const g = new THREE.Group();
  g.add(ubic(caja(K, 0.32, 0.02, 0.22, '#3a5a4a'), 0, 0.14, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(ubic(caja(K, 0.016, 0.13, 0.016, KF.maderaD, ST), a * 0.14, 0.065, b * 0.09)));
  for (let k = 0; k < 9; k++) { const v = caja(K, 0.006, 0.006, 0.07, k % 3 ? '#f1e6c9' : '#c64a30', ST); v.position.set(-0.12 + k * 0.03, 0.154, (k % 2 ? 0.03 : -0.03)); v.rotation.y = (k % 4 === 0) ? Math.PI / 2 : 0; g.add(v); }
  return g;
}
/* la maqueta del canal con su esclusa de dos compuertas (la de Qiao Weiyue, de 984: la primera del mundo) */
function maquetaCanal(K) {
  const g = new THREE.Group();
  g.add(ubic(caja(K, 0.56, 0.12, 0.26, KF.maderaD), 0, 0.06, 0));
  const ag = caja(K, 0.5, 0.01, 0.12, '#8fb8a8', ST); g.add(ubic(ag, 0, 0.126, 0));
  [-0.1, 0.1].forEach(x => { g.add(ubic(caja(K, 0.012, 0.06, 0.15, KF.madera), x, 0.15, 0)); g.add(ubic(caja(K, 0.03, 0.012, 0.17, KF.maderaD), x, 0.185, 0)); });
  g.add(ubic(caja(K, 0.08, 0.03, 0.05, KF.madera), 0.18, 0.14, -0.02));
  return g;
}
/* la pila de planchas de madera, con sus mangos */
function planchas(K, n = 6) {
  const g = new THREE.Group();
  for (let k = 0; k < n; k++) g.add(ubic(caja(K, 0.16, 0.022, 0.11, k % 2 ? KF.maderaL : KF.madera, { grosor: 0.001 }), (k % 2) * 0.01, 0.011 + k * 0.023, 0, 0, (k % 3 - 1) * 0.08, 0));
  return g;
}
/* el cordel con las hojas impresas que se secan */
function tendedero(K, largo = 0.7, hojas = 5, h = 0.62) {
  const g = new THREE.Group();
  [-1, 1].forEach(l => g.add(ubic(cil(K, 0.012, 0.015, h, 6, KF.maderaD), l * largo / 2, h / 2, 0)));
  g.add(ubic(cil(K, 0.003, 0.003, largo, 3, '#6a5a44', ST), 0, h - 0.04, 0, 0, 0, Math.PI / 2));
  for (let k = 0; k < hojas; k++) { const p = cartel(K, 'kf-hoja', 160, 220, pHoja, 0.1, 0.14); p.position.set(-largo / 2 + (k + 0.6) * largo / (hojas + 0.2), h - 0.115, 0.004); g.add(p); }
  return g;
}

/* ================= 81 · LA ESCUELA DE LA PREFECTURA: la sala, los cuatro tesoros, el templo de Confucio, las tierras =================
   FUENTES: el edicto de 1044 (las escuelas de prefectura de Fan Zhongyan, junto a un templo de Confucio; los trescientos
   días de estudio antes del examen); las tierras de la escuela (xuetian) que pagaban al maestro (Lee, Government Education
   and Examinations in Sung China, 1985). Etapas: 0 la sala con su placa · 1 los escritorios con los cuatro tesoros · 2 el
   templo de Confucio con su estela · 3 las tierras de la escuela, con el granero y el campo. */
export function prefectura(K, n) {
  const B = A.prefectura, P = pieza(B);
  const s = sala(K, { W: 1.25, D: 0.62, h: 0.46, frente: 'abierto' }); poner(P, B, s, -0.25, -0.78);
  placaSobre(K, P, B, '州學', -0.25, -0.78 + 0.33, 0.06 + 0.42);
  poner(P, B, KM.mesa(K, 1.1, false), -0.25, -0.62, 0, 0.06);
  for (let k = 0; k < 2; k++) poner(P, B, KM.tinaja(K, 0.9, '#9a7a5a'), 0.48 + k * 0.12, -0.52);
  P.toc = [{ x: B.x - 0.25, y: B.y - 0.6, k: 'prefecturaCh' }];
  if (n >= 1) {   // los cuatro tesoros: los escritorios bajos de los que memorizan, y el pincelero grande
    [[-0.85, 0.05], [-0.85, 0.42], [0.35, -0.2]].forEach(([x, z]) => poner(P, B, escritorio(K, 1.1), x, z, 0.2));
    const pr = new THREE.Group(); poner(P, B, pr, 0.62, -0.25);
    pr.add(ubic(caja(K, 0.22, 0.03, 0.1, KF.maderaD), 0, 0.3, 0)); [-1, 1].forEach(l => pr.add(ubic(caja(K, 0.02, 0.3, 0.02, KF.maderaD, ST), l * 0.1, 0.15, 0)));
    for (let k = 0; k < 6; k++) pr.add(ubic(cil(K, 0.006, 0.004, 0.16, 4, k % 2 ? '#7d5434' : '#5a4636', ST), -0.08 + k * 0.032, 0.22, 0.03));
    pr.add(ubic(caja(K, 0.18, 0.06, 0.12, PAPEL, { grosor: 0.001 }), 0, 0.03, 0.12));
  }
  if (n >= 2) {   // el templo de Confucio, puerta con puerta: la sala bermellón y la estela
    const t = sala(K, { W: 0.85, D: 0.6, h: 0.44, frente: 'puertas', tipo: 'wudian' }); poner(P, B, t, -1.45, -0.55, Math.PI / 2);
    placaSobre(K, P, B, '大成殿', -1.45 + 0.32, -0.55, 0.06 + 0.4, 0.075, Math.PI / 2);
    const est = KM.estelaTortuga(K, 0.8); poner(P, B, est, -1.0, 0.25, Math.PI / 2);
    const inc = new THREE.Group(); poner(P, B, inc, -1.05, -0.55);
    inc.add(ubic(cil(K, 0.07, 0.055, 0.08, 10, KF.bronce), 0, 0.1, 0)); [-1, 0, 1].forEach(l => inc.add(ubic(cil(K, 0.008, 0.008, 0.06, 4, KF.bronce, ST), l * 0.04, 0.03, 0)));
  }
  if (n >= 3) {   // las tierras de la escuela: el campo de mijo en surcos, el granero de paja y los sacos de la renta
    const ca = new THREE.Group(); poner(P, B, ca, -0.3, -1.55);
    ca.add(ubic(caja(K, 0.7, 0.02, 0.5, '#b49a62', ST), 0, 0.01, 0));
    for (let k = 0; k < 5; k++) ca.add(ubic(caja(K, 0.66, 0.05, 0.05, k % 2 ? '#c9b05a' : '#a8a050', { grosor: 0.001 }), 0, 0.035, -0.2 + k * 0.1));
    const gr = KM.tienda(K, { W: 0.5, D: 0.42, h: 0.32, tono: 'paja', frente: 'puertas' }); poner(P, B, gr, 0.62, -1.2, -0.3);
    poner(P, B, KM.sacos(K, 5, 0.8), 0.68, -0.72, -0.3);
  }
  return escalar(P);
}

/* ================= 82 · LOS CLÁSICOS IMPRESOS: la plancha, la imprenta de la Academia, los modelos de Jianyang =================
   FUENTES: la impresión con planchas de madera (Shen Gua, Mengxi bitan ~1088; Xing Bing a Zhenzong, 1005: «cuando era joven,
   pocos tenían los comentarios; hoy hay planchas de todos»); las ediciones de la Academia Imperial (Guozijian); los libreros
   de Jianyang, en Fujian, que imprimían ensayos modelo para el examen (Chia, Printing for Profit, 2002). Etapas: 0 el taller
   con el banco del tallador · 1 la mesa de imprimir y el cordel de las hojas · 2 el estante de los clásicos de la Academia ·
   3 el puesto de los modelos de Jianyang, con su bandera. */
export function impresos(K, n) {
  const B = A.impresos, P = pieza(B);
  const s = sala(K, { W: 1.15, D: 0.6, h: 0.44, frente: 'abierto', dougong: false, tipo: 'dos' }); poner(P, B, s, -0.35, -0.72);
  placaSobre(K, P, B, '書坊', -0.35, -0.72 + 0.32, 0.06 + 0.38);
  const banco = new THREE.Group(); poner(P, B, banco, -0.5, -0.5);
  banco.add(ubic(caja(K, 0.34, 0.025, 0.2, KF.madera), 0, 0.15, 0)); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => banco.add(ubic(caja(K, 0.018, 0.15, 0.018, KF.maderaD, ST), a * 0.15, 0.075, b * 0.08)));
  const pl = cartel(K, 'kf-plancha', 220, 160, pPlancha, 0.17, 0.12); pl.rotation.x = -Math.PI / 2; pl.position.set(0, 0.165, 0); banco.add(pl);
  poner(P, B, planchas(K, 7), -0.92, -0.38);
  if (n >= 1) {   // la mesa de imprimir (la plancha entintada, la escobilla, el papel) y el cordel con las hojas
    const me = new THREE.Group(); poner(P, B, me, 0.25, -0.55);
    me.add(ubic(caja(K, 0.36, 0.025, 0.22, KF.maderaL), 0, 0.15, 0)); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => me.add(ubic(caja(K, 0.018, 0.15, 0.018, KF.maderaD, ST), a * 0.16, 0.075, b * 0.09)));
    me.add(ubic(caja(K, 0.14, 0.02, 0.1, '#3a3430', ST), -0.08, 0.172, 0)); me.add(ubic(caja(K, 0.13, 0.008, 0.1, PAPEL, ST), 0.09, 0.166, 0));
    me.add(ubic(cil(K, 0.03, 0.03, 0.06, 8, '#5a4636'), 0.13, 0.19, 0.07, Math.PI / 2, 0, 0));
    poner(P, B, tendedero(K, 1.0, 6), 0.15, -1.05);
    poner(P, B, tendedero(K, 0.8, 5), 0.75, -0.45, -Math.PI / 2 + 0.3);
    const re = new THREE.Group(); poner(P, B, re, 0.62, -0.95);
    for (let k = 0; k < 6; k++) re.add(ubic(caja(K, 0.16, 0.05, 0.12, k % 2 ? PAPEL : '#e8dcbc', { grosor: 0.001 }), (k % 2) * 0.17, 0.025 + Math.floor(k / 2) * 0.05, 0));
  }
  if (n >= 2) {   // los clásicos de la Academia: el estante de los libros cosidos y el cartel del Guozijian
    poner(P, B, estante(K, 0.48, 0.56, 3), -0.95, -0.55, 0.35);
    placaSobre(K, P, B, '國子監本', -0.95 + 0.07, -0.55 + 0.19, 0.62, 0.07, 0.35);
    poner(P, B, estante(K, 0.4, 0.42, 2), -1.05, 0.05, Math.PI / 2 - 0.2);
  }
  if (n >= 3) {   // los modelos de Jianyang: el puesto con la sombrilla, las pilas de cuadernos baratos y la bandera de los ensayos
    const pu = new THREE.Group(); poner(P, B, pu, 0.78, -0.38, -0.4);
    pu.add(ubic(caja(K, 0.42, 0.13, 0.22, KF.madera), 0, 0.065, 0));
    for (let k = 0; k < 4; k++) for (let p = 0; p < 3; p++) pu.add(ubic(caja(K, 0.08, 0.014, 0.1, p % 2 ? '#d9c79a' : '#e8d8b0', ST), -0.15 + k * 0.1, 0.137 + p * 0.015, 0));
    const so = KM.sombrilla(K, 1.0, KF.telaO); so.position.set(0.05, 0, -0.12); pu.add(so);
    const ba = KM.bandera(K, '時文', 1.15, { fondo: '#f1e6c9', tinta: '#a8382a' }); ba.position.set(-0.28, 0, -0.08); pu.add(ba);
  }
  return escalar(P);
}

/* ================= 83 · LAS DOS SALAS DE HU YUAN: la de los clásicos y la de los asuntos =================
   FUENTES: Hu Yuan en Huzhou (Huang Zongxi, Song Yuan xue'an: la sala del sentido de los clásicos, jingyi zhai, y la de los
   asuntos, zhishi zhai: gobernar, la defensa, el agua, la aritmética; cada estudiante un asunto principal y otro al lado); en
   1044 el emperador manda copiar su método para la Universidad. Etapas: 0 las dos salas · 1 la de los clásicos con su placa,
   el estante y el atril · 2 la de los asuntos: el mapa del río, la maqueta del canal con su esclusa, la tabla de contar y el
   arco · 3 la galería que las une, con la tabla de los nombres. */
export function huyuan(K, n) {
  const B = A.huyuan, P = pieza(B);
  [-1, 1].forEach(l => { const s = sala(K, { W: 0.95, D: 0.56, h: 0.42, frente: 'abierto', bahias: 3 }); poner(P, B, s, l * 0.68, -0.78); });
  [[-0.68, '經義齋'], [0.68, '治事齋']].forEach(([x, t]) => placaSobre(K, P, B, t, x, -0.78 + 0.3, 0.06 + 0.38, 0.065));
  if (n >= 1) {   // la sala de los clásicos: el estante, el atril con el libro abierto y la mesa de conversar
    poner(P, B, estante(K, 0.38, 0.46, 3), -1.25, -0.55, Math.PI / 2 - 0.15);
    const at = new THREE.Group(); poner(P, B, at, -0.84, -0.22, 0.4);   // corrido de la orilla: rozaba el alero de la sala de los copistas
    at.add(ubic(cil(K, 0.012, 0.016, 0.3, 6, KF.maderaD), 0, 0.15, 0)); const tb = caja(K, 0.16, 0.012, 0.12, KF.madera); tb.rotation.x = -0.5; at.add(ubic(tb, 0, 0.31, 0));
    const li = caja(K, 0.14, 0.008, 0.1, PAPEL, ST); li.rotation.x = -0.5; at.add(ubic(li, 0, 0.32, 0.004));
    poner(P, B, KM.mesa(K, 1.0, true), -0.55, -0.42, 0, 0.0);
    poner(P, B, caja(K, 0.66, 0.01, 0.44, '#c8ae74', ST), -0.6, -0.38, 0, 0.005);   // la estera de junco bajo la mesa de conversar, con sus cojines: aquí se discute, no se recita
    [[-0.68, -0.15], [-0.44, -0.15], [-0.3, -0.32]].forEach(([x, z]) => poner(P, B, caja(K, 0.12, 0.035, 0.12, '#8a3f2c', ST), x, z, 0.2, 0.012));
    const bi = new THREE.Group(); poner(P, B, bi, -1.25, -0.56, Math.PI / 2 - 0.35);   // el biombo con el comienzo de la Gran Enseñanza
    bi.add(ubic(caja(K, 0.56, 0.05, 0.12, KF.maderaD), 0, 0.025, 0));
    for (let k = 0; k < 3; k++) { const h = cartel(K, 'kf-biombo' + k, 96, 192, pBiombo(k), 0.17, 0.36); h.position.set(-0.18 + k * 0.18, 0.25, 0.012); bi.add(h); bi.add(ubic(caja(K, 0.18, 0.4, 0.018, KF.berm), -0.18 + k * 0.18, 0.25, 0)); }
  }
  if (n >= 2) {   // la sala de los asuntos: el mapa del río, la maqueta del canal con su esclusa, la tabla de contar y el arco
    const ma = cartel(K, 'kf-mapa-rio', 256, 180, pMapaRio, 0.42, 0.3); poner(P, B, ma, 0.68, -1.05, 0, 0.32);
    poner(P, B, maquetaCanal(K), 1.25, -0.45, Math.PI / 2 - 0.3);
    poner(P, B, varillas(K), 0.38, -0.42, 0.2);
    const ar = new THREE.Group(); poner(P, B, ar, 1.32, -0.95, -0.6);
    ar.add(ubic(cil(K, 0.012, 0.014, 0.42, 6, KF.maderaD), 0, 0.21, 0)); const arco = K.malla(K.toro ? K.toro(0.16, 0.008, Math.PI * 0.8, 0.5) : K.cilindro(0.008, 0.008, 0.3, 4), '#5a3a20', { grosor: 0.001 }); arco.position.set(0.03, 0.28, 0); arco.rotation.z = Math.PI / 2 + Math.PI * 0.1; ar.add(arco);
  }
  if (n >= 3) {   // uno principal y otro al lado: la galería techada que une las dos salas y la tabla de los nombres
    const ga = new THREE.Group(); poner(P, B, ga, 0, -0.62);
    for (let k = 0; k < 3; k++) [-1, 1].forEach(l => ga.add(ubic(cil(K, 0.02, 0.022, 0.42, 6, KF.berm), -0.2 + k * 0.2, 0.21, l * 0.14)));
    const te = caja(K, 0.62, 0.025, 0.4, KF.teja, { grosor: 0.002 }); ga.add(ubic(te, 0, 0.44, 0));
    ga.add(ubic(caja(K, 0.64, 0.045, 0.05, KF.tejaD, ST), 0, 0.475, 0));
    const tn = new THREE.Group(); poner(P, B, tn, 0.02, -0.28);
    [-1, 1].forEach(l => tn.add(ubic(cil(K, 0.016, 0.016, 0.62, 6, KF.maderaD), l * 0.3, 0.31, 0)));
    const lista = cartel(K, 'kf-asuntos', 320, 200, pAsuntos, 0.56, 0.35); lista.position.set(0, 0.36, 0.012); tn.add(lista);
    tn.add(ubic(caja(K, 0.6, 0.38, 0.02, KF.maderaD), 0, 0.36, 0));
    const tt = caja(K, 0.72, 0.022, 0.16, KF.teja, { grosor: 0.002 }); tt.rotation.x = 0.15; tn.add(ubic(tt, 0, 0.6, 0.01));
  }
  return escalar(P);
}

/* ================= 84 · EL EXAMEN ANÓNIMO: el nombre tapado, la copia, el recinto cerrado =================
   FUENTES: el nombre tapado (hu ming, desde 992 en el examen de palacio) y la copia de cada prueba por escribanos (teng lu,
   desde 1015); los examinadores encerrados por semanas (suo yuan) (Chaffee, The Thorny Gates of Learning in Sung China,
   1985); las celdas marcadas con el Clásico de los mil caracteres (las de Nankín). Etapas: 0 una fila de celdas · 1 la mesa
   del nombre tapado, con las pruebas y sus tiras · 2 la sala de los copistas y la segunda fila · 3 el recinto cerrado: el
   muro y la torre de los examinadores. P.celdas: los asientos del día del examen. */
export function anonimo(K, n) {
  const B = A.anonimo, P = pieza(B);
  const filas = [['天', 0.0, -0.95]]; if (n >= 2) filas.push(['地', 0.0, -0.5]);
  P.celdas = [];
  filas.forEach(([letra, dx, dz]) => {
    const c = KM.celdas(K, 7, 1.35, letra, 2); poner(P, B, c, dx, dz);   // al doble de alto: el que escribe sentado no asoma por el techo (las de verdad eran del alto de un hombre)
    for (let i = 0; i < 7; i++) P.celdas.push({ x: B.x + dx - 1.35 / 2 + (i + 0.5) * 1.35 / 7, y: B.y + dz + 0.05 });
  });
  P.celdas.sort((a, b) => b.y - a.y);   // primero la fila de adelante: la de atrás queda detrás del muro de la otra y no se ve
  if (n >= 1) {   // el nombre tapado: la mesa del sellador con las pruebas, cada una con su tira de papel pegada sobre el nombre
    const me = new THREE.Group(); poner(P, B, me, -1.0, -0.15, 0.5);
    me.add(ubic(caja(K, 0.34, 0.025, 0.2, KF.madera), 0, 0.15, 0)); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => me.add(ubic(caja(K, 0.018, 0.15, 0.018, KF.maderaD, ST), a * 0.15, 0.075, b * 0.08)));
    for (let k = 0; k < 4; k++) { me.add(ubic(caja(K, 0.1, 0.006, 0.13, PAPEL, ST), -0.11 + k * 0.075, 0.166 + k * 0.004, 0)); me.add(ubic(caja(K, 0.1, 0.004, 0.025, '#c64a30', ST), -0.11 + k * 0.075, 0.171 + k * 0.004, -0.045)); }
    placaSobre(K, P, B, '糊名', -1.0, -0.38, 0.38, 0.065, 0.5);
    [-1, 1].forEach(l => poner(P, B, cil(K, 0.012, 0.012, 0.42, 5, KF.maderaD), -1.0 + l * 0.12, -0.38, 0, 0.21));
  }
  if (n >= 2) {   // la copia: la sala de los escribanos con sus mesas
    const s = sala(K, { W: 0.7, D: 0.5, h: 0.4, frente: 'abierto', tipo: 'dos', dougong: false }); poner(P, B, s, 1.3, -0.75, -Math.PI / 2);
    placaSobre(K, P, B, '謄錄所', 1.3 - 0.27, -0.75, 0.06 + 0.36, 0.06, -Math.PI / 2);
    [-0.2, 0.15].forEach(z => poner(P, B, escritorio(K, 1.0), 0.95, -0.55 + z, -Math.PI / 2));
  }
  if (n >= 3) {   // el recinto cerrado: el muro con la puerta y, en medio, la torre desde donde se vigila (como la de Nankín)
    const mu = new THREE.Group(); poner(P, B, mu, 0, 0);
    KM.tramo(K, mu, -0.75, -1.22, 1.55, -1.22, 0.3); KM.tramo(K, mu, 1.55, -1.22, 1.55, -0.3, 0.3);
    const to = sala(K, { W: 0.5, D: 0.5, plat: 0.08, pisos: [{ h: 0.4, frente: 'puertas', bahias: 1, dougong: false }, { h: 0.34, frente: 'abierto', bahias: 1 }], inset: 0.06, baranda: true, tipo: 'xieshan', vuelo: 0.12 });
    poner(P, B, to, -0.95, -1.05);
    placaSobre(K, P, B, '明遠樓', -0.95, -1.05 + 0.27, 0.86, 0.06);
  }
  return escalar(P);
}

/* ================= 85 · LA ACADEMIA (la shuyuan): el monte y los libros, vivir con el maestro, la placa del emperador =================
   FUENTES: Yuelu (976) y la placa que le regaló Zhenzong a Zhou Shi en 1015; la casa de los libros (cangshu lou) y las
   habitaciones de los estudiantes (zhaishe) de las academias (Walton, Academies and Society in Southern Sung China, 1999).
   Etapas: 0 la sala de las lecturas entre pinos · 1 la casa de los libros, de dos pisos · 2 las habitaciones de los que viven
   con el maestro y la mesa del té · 3 la portada con la placa dorada del emperador. */
export function academia(K, n) {
  const B = A.academia, P = pieza(B);
  const s = sala(K, { W: 1.15, D: 0.62, h: 0.46, frente: 'abierto' }); poner(P, B, s, -0.35, -0.72);
  placaSobre(K, P, B, '講堂', -0.35, -0.72 + 0.33, 0.06 + 0.42, 0.07);
  [[0.55, -1.05, 1.2, 1], [-1.15, -1.2, 1.35, 2]].forEach(([x, z, s2, k]) => poner(P, B, KM.bosquecillo(K, 1, 0.01, 50 + k, { pinos: 1, sauces: 0, alto: s2 }), x, z));
  if (n >= 1) {   // la casa de los libros: dos pisos, con baranda y el estante a la vista
    const lib = sala(K, { W: 0.72, D: 0.55, plat: 0.08, pisos: [{ h: 0.42, frente: 'ventanas', bahias: 3 }, { h: 0.34, frente: 'celosia', bahias: 3 }], inset: 0.08, baranda: true, vuelo: 0.14 });
    poner(P, B, lib, -1.25, -0.45, Math.PI / 2 - 0.2);
    placaSobre(K, P, B, '藏書樓', -1.25 + 0.27, -0.45 + 0.06, 0.86, 0.055, Math.PI / 2 - 0.2);
  }
  if (n >= 2) {   // vivir con el maestro: la hilera de habitaciones y la mesa del té con sus cuencos
    const hi = KM.tienda(K, { W: 1.0, D: 0.42, h: 0.34, frente: 'puertas', tono: 'gris' }); poner(P, B, hi, 0.55, -1.25, 0);
    const te = new THREE.Group(); poner(P, B, te, 0.55, -0.6);
    te.add(ubic(KM.mesa(K, 0.9, true), 0, 0, 0));
    for (let k = 0; k < 4; k++) te.add(ubic(cil(K, 0.02, 0.012, 0.018, 8, k % 2 ? '#2a2a2e' : '#7a5a3a', ST), -0.07 + k * 0.045, 0.138, (k % 2) * 0.03));   // los cuencos negros de Jian
    te.add(ubic(cil(K, 0.03, 0.025, 0.06, 8, '#9ec2a8'), 0.08, 0.16, -0.03));
  }
  if (n >= 3) {   // la placa del emperador: la portada de la academia con el nombre dorado, y la estela
    const pt = sala(K, { W: 0.62, D: 0.32, h: 0.4, frente: 'puertas', bahias: 1, tipo: 'dos', dougong: false }); poner(P, B, pt, -1.15, 0.45, Math.PI / 2 - 0.5);
    const pl = KM.placa(K, '嶽麓書院', 0.075, { fondo: '#2e4766', tinta: '#f0d27a' }); poner(P, B, pl, -1.15 + 0.14, 0.45 + 0.1, Math.PI / 2 - 0.5, 0.5);
    poner(P, B, KM.estelaTortuga(K, 0.7), -0.7, 0.75, Math.PI / 2 - 0.5);
  }
  return escalar(P);
}

/* ================= 86 · EL EXAMEN DE PALACIO: la pregunta del emperador, la lista, la promoción de 1057 =================
   FUENTES: el examen de palacio desde 973; desde 1057 no reprueba a nadie y el emperador ordena la lista; la lista colgada
   en la puerta (el bang) y la ciudad que sale a leerla; la promoción de 1057, con Su Shi, Su Zhe, Zeng Gong, Zhang Zai y Cheng
   Hao (Chaffee 1985; Egan, Word, Image, and Deed in the Life of Su Shi, 1994). Etapas: 0 el pabellón de tejas vidriadas ·
   1 el estrado con la sombrilla del emperador y la pregunta · 2 el tablero con la lista de los aprobados · 3 la estela de la
   promoción de 1057, con los faroles. */
export function palacio(K, n) {
  const B = A.palacio, P = pieza(B);
  const s = sala(K, { W: 1.2, D: 0.62, h: 0.5, frente: 'abierto', tono: 'verde', tipo: 'wudian' }); poner(P, B, s, -0.4, -0.75);
  placaSobre(K, P, B, '集英殿', -0.4, -0.75 + 0.33, 0.06 + 0.46, 0.07);
  if (n >= 1) {   // la pregunta del emperador: el estrado con la sombrilla amarilla y la mesa del incienso con la pregunta
    const es = new THREE.Group(); poner(P, B, es, -0.4, -0.45);
    es.add(ubic(caja(K, 0.42, 0.06, 0.26, KF.bermD), 0, 0.03, 0)); es.add(ubic(caja(K, 0.2, 0.18, 0.12, KF.berm), 0, 0.15, -0.05));
    const so = KM.sombrilla(K, 1.15, AMARILLO); so.position.set(0.22, 0, 0.02); es.add(so);
    const me = new THREE.Group(); poner(P, B, me, 0.25, -0.3);
    me.add(ubic(caja(K, 0.22, 0.02, 0.14, KF.bermD), 0, 0.15, 0)); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => me.add(ubic(caja(K, 0.016, 0.15, 0.016, KF.bermD, ST), a * 0.09, 0.075, b * 0.05)));
    me.add(ubic(cil(K, 0.022, 0.022, 0.14, 8, AMARILLO), 0, 0.18, 0, 0, 0, Math.PI / 2));
  }
  if (n >= 2) {   // la lista de los aprobados: el tablero con su techito, la hoja amarilla y el sello
    const ta = new THREE.Group(); poner(P, B, ta, 0.65, -0.55, -0.35);
    [-1, 1].forEach(l => ta.add(ubic(cil(K, 0.018, 0.02, 0.62, 6, KF.berm), l * 0.3, 0.31, 0)));
    ta.add(ubic(caja(K, 0.66, 0.36, 0.025, KF.maderaD), 0, 0.38, -0.01));
    const li = cartel(K, 'kf-lista', 480, 260, pLista, 0.6, 0.32); li.position.set(0, 0.38, 0.006); ta.add(li);
    const te = caja(K, 0.76, 0.025, 0.16, KF.teja, { grosor: 0.002 }); te.rotation.x = 0.2; ta.add(ubic(te, 0, 0.6, 0.01));
  }
  if (n >= 3) {   // la promoción de 1057: la estela con los cinco nombres y los faroles de la fiesta
    const et = new THREE.Group(); poner(P, B, et, -1.2, -0.2, 0.5);
    et.add(ubic(caja(K, 0.2, 0.07, 0.12, KF.grisD), 0, 0.035, 0)); const pi = cartel(K, 'kf-estela', 160, 300, pEstela, 0.16, 0.32);
    et.add(ubic(caja(K, 0.18, 0.34, 0.05, KF.grisL), 0, 0.24, 0)); pi.position.set(0, 0.24, 0.027); et.add(pi); et.add(ubic(caja(K, 0.22, 0.04, 0.08, KF.teja), 0, 0.43, 0));
    [[-0.95, -0.75], [0.2, -1.05], [1.15, -0.15]].forEach(([x, z]) => poner(P, B, farol(K, 0.5), x, z));
    [[-1.45, -0.6], [0.05, -1.25]].forEach(([x, z], k) => { const b = KM.bandera(K, k ? '及第' : '狀元', 1.0, { fondo: KF.telaR, tinta: '#f0d27a', borde: KF.oro }); poner(P, B, b, x, z, 0.4); });
  }
  escalar(P);
  P.faroles = []; P.obj.traverse(o => { if (o.userData.llama) P.faroles.push(o.userData.llama); });
  return P;
}

/* LAS PIEZAS: con su índice de saber (la auditoría de etapas de juego3d/qa.html) */
export const PIEZAS = [
  { id: 'prefectura', i: 81, crear: prefectura },
  { id: 'impresos', i: 82, crear: impresos },
  { id: 'huyuan', i: 83, crear: huyuan },
  { id: 'anonimo', i: 84, crear: anonimo },
  { id: 'academia', i: 85, crear: academia },
  { id: 'palacio', i: 86, crear: palacio },
];

/* ---------- LA GENTE DE KAIFENG (1050-1120) ----------
   Los candidatos y los letrados: la túnica larga de cuello redondo (lanshan) blanca o azul pálido, el pañuelo blando
   atado atrás (fujin); los funcionarios, la túnica de color de su rango y el futou negro de alas largas; la gente de la
   ciudad, la ropa corta de trabajo, azul o de cáñamo, con el pañuelo o el gorro; las mujeres, la falda larga, el beizi
   abierto encima y el moño alto. */
const LANSHAN = ['#f2ede0', '#e6ebe8', '#dfe6ee', '#efe6d0', '#e9e2d0'];
export function candidato(i, extra = {}) {
  return { piel: [0, 1, 1, 2][i % 4], pelo: 'moño', colorPelo: ['#1e1a18', '#2a221c', '#1a1716'][i % 3], ropa: 'tunica', colorRopa: LANSHAN[i % LANSHAN.length], orla: '#c9c2b2', panuelo: '#26232a', sinFlecos: true, ...extra };
}
/* el que aprueba: ya es funcionario, con la túnica de su rango (el verde de los que empiezan) y el futou de alas */
export function funcionario(i, extra = {}) {
  return { ...candidato(i), colorRopa: ['#5f8a6a', '#4f7a5e', '#6a9474'][i % 3], orla: '#3f5a4a', panuelo: undefined, futou: true, alas: true, ...extra };
}
/* la gente de la ciudad: ropa corta de trabajo, mujeres de falda y beizi, algún letrado de paseo */
export function vecino(i, extra = {}) {
  const k = i % 6;
  if (k === 1 || k === 4) return { piel: [0, 1, 2][i % 3], pelo: 'moño', colorPelo: ['#1e1a18', '#2a221c'][i % 2], ropa: 'tunica', colorRopa: ['#c97a6a', '#8fae9a', '#e0c48a', '#a6b8d0'][i % 4], orla: '#f2ede0', chal: ['#f2ede0', '#e8d8b8'][i % 2], sinFlecos: true, ...extra };
  if (k === 2 || k === 5) return { piel: [1, 2, 1, 3][i % 4], pelo: 'moño', colorPelo: '#1e1a18', ropa: 'corta', colorRopa: ['#41709c', '#8a7a5a', '#5a6f8a'][i % 3], panuelo: ['#e8e0cc', '#3a3430'][i % 2], sinFlecos: true, ...extra };
  return candidato(i, extra);
}
/* los maestros (LEX().nombres de China: Hu Yuan, Sun Fu, Shi Jie, Fan Zhongyan, Cheng Yi, el maestro de la escuela de aldea) */
const MAESTRO = { piel: 1, pelo: 'moño', colorPelo: '#3a3430', barba: '#5a5450', ropa: 'tunica', colorRopa: '#ddd6c4', orla: '#5a6f8a', chal: '#5a6f8a', panuelo: '#26232a', sinFlecos: true };
export const MAESTROS = [MAESTRO, { ...MAESTRO, colorPelo: '#2a221c', barba: '#2a221c', chal: '#7a5a3a', orla: '#7a5a3a' }, { ...MAESTRO, colorRopa: '#e6ebe8', chal: '#3f5a4a', orla: '#3f5a4a' },
  { ...MAESTRO, colorRopa: '#4f6a5a', chal: '#3a4a3e', orla: '#3a4a3e', panuelo: undefined, futou: true, alas: true }, { ...MAESTRO, colorPelo: '#1e1a18', barba: '#1e1a18', colorRopa: '#efe6d0', chal: '#8a7a5a' },
  { piel: 2, pelo: 'moño', colorPelo: '#2a221c', ropa: 'corta', colorRopa: '#8a7a5a', panuelo: '#e8e0cc', sinFlecos: true }];
/* Li Qingzhao: la poeta, de falda larga y beizi verde agua, con el moño alto y la horquilla */
export const LIQINGZHAO = { piel: 0, pelo: 'moño', colorPelo: '#1a1716', ropa: 'tunica', colorRopa: '#e9dcc8', orla: '#7fa996', chal: '#8fbcaa', sinFlecos: true };
/* Zhu Xi: viejo ya, la túnica sencilla de letrado, el pañuelo y la barba larga y canosa */
export const ZHUXI = { piel: 1, pelo: 'moño', colorPelo: '#b8b2a8', barba: '#d8d2c8', ropa: 'tunica', colorRopa: '#efe9da', orla: '#3a3430', chal: '#3e4a56', panuelo: '#2a2a2e', sinFlecos: true };
/* el maestro taoísta y su discípulo (el secreto): la túnica azul oscura y el moño con su horquilla de madera */
export const TAOISTA = { piel: 1, pelo: 'moño', colorPelo: '#d8d2c8', barba: '#e8e2d8', ropa: 'tunica', colorRopa: '#2f3a5a', orla: '#1f2742', chal: '#1f2742', sinFlecos: true };
