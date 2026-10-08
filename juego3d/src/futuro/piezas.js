/* ============================================================
   futuro/piezas
   Los seis saberes de la última época (id 21, docs/era21-plan.md: hoy y lo que viene, en el valle del principio), cada
   uno con sus etapas (la máxima del proyecto: subir de nivel se VE, con piezas nuevas y no con brillos; cada etapa cambia
   al menos un 8 % de la silueta de la anterior, lo mide la hoja juego3d/bocetos/futuro-piezas.html):
   la escuela en anillo (87), el claro de las preguntas (88), la parada de los que llegan de lejos (89), la biblioteca que
   responde (90), la defensa (91) y el mirador de la pregunta abierta (92). Son los ecos del repertorio: el fogón, la
   pregunta de Atenas, la traducción de Bagdad, el catálogo de Alejandría y el examen de Kaifeng, multiplicados por la IA.
   Se arman directo a la escala del juego (una persona mide 0,9 y un piso, 0,75), con la paleta FT de monumentos.js.
   EL ACUERDO CON LA ÉPOCA (epoca21.js): cada pieza deja libre el arco de adelante (+x +z), donde se para su gente, y nada
   la tapa desde la cámara (que mira desde +x +z, a ~30° de altura). P.asientos dice dónde se sienta la gente de cada etapa
   ({ x, y, mira, alto }, en la grilla); SITIOS, dónde se para. La escuela deja P.lampara (la linterna de la biblioteca), el
   claro P.luces (las guirnaldas) y el mirador P.faro: la época los enciende de noche. El círculo de piedras del fogón NO es
   de la pieza: ya está en el valle (el patio de la escuela, r < 1,35, queda libre para la gente).
   ============================================================ */
import * as THREE from 'three';
import { PAL, azar } from '../kit.js';
import { pieza } from '../piezas.js';
import * as L from './lugares.js';
import * as KM from './monumentos.js';
import { textura, matTex, lamina, propia } from '../agora/monumentos.js';

const { FT } = KM;
const ubic = (m, x, y, z, rx = 0, ry = 0, rz = 0) => { m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx, ry, rz); return m; };
const O = (gr = 0.002) => ({ grosor: gr });
const ST = { sinTinta: true };
const caja = (K, w, h, d, color, o = O()) => K.malla(K.caja(w, h, d), color, o);
const cil = (K, r1, r2, h, n, color, o = O()) => K.malla(K.cilindro(r1, r2, h, n), color, o);
const esf = (K, r, color, o = O(), q = 0.5) => K.malla(K.esfera(r, q), color, o);
const en = (P, obj, x, y, h = 0, ry = 0) => { obj.position.copy(P.en(x, y)); obj.position.y += h; obj.rotation.y = ry; P.obj.add(obj); return obj; };
const poner = (P, B, obj, dx, dz, ry = 0, h = 0) => en(P, obj, B.x + dx, B.y + dz, h, ry);
const grupo = (padre, x, y, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; padre.add(g); return g; };
const deg = KM.deg;
/* lo que brilla de noche (bombillas, el faro): materiales básicos compartidos por todas las piezas, no se liberan */
const BRILLOS = new Map();
const brillo = (color, o = {}) => { const k = color + JSON.stringify(o); if (!BRILLOS.has(k)) BRILLOS.set(k, new THREE.MeshBasicMaterial({ color, ...o })); return BRILLOS.get(k); };
/* una cuerda que cuelga entre a y b (una parábola con su comba) y el hilo que la dibuja */
function cuerda(a, b, comba, n = 14) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push(new THREE.Vector3(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u - comba * 4 * u * (1 - u), a.z + (b.z - a.z) * u)); }
  return pts;
}
const hilo = (K, pts, r = 0.006, color = '#3a332c') => K.malla(propia(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 2, r, 4, false)), color, ST);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
/* un cartel pintado en un lienzo (en caché: no se libera con la pieza) */
const cartel = (K, clave, w, h, pinta, ancho, alto) => lamina(K, matTex(K, clave, textura(clave, w, h, pinta)), ancho, alto);
const LETRA = '"Avenir Next", "Nunito", "Helvetica Neue", "PingFang SC", "Hiragino Sans", "Geeza Pro", "Noto Sans Arabic", sans-serif';
const SERIF = '"Iowan Old Style", "Palatino", "Georgia", serif';
/* la piedra en bloques (las gradas), con sus juntas */
const texPiedra = () => textura('fu-piedra', 64, 64, (g, w, h) => {
  g.fillStyle = '#d9d2c4'; g.fillRect(0, 0, w, h);
  const tonos = ['#e4ded2', '#cfc7b7', '#d8d0c0', '#e9e3d8', '#d2cab9'];
  for (let f = 0; f < 4; f++) for (let c = -1; c < 3; c++) { g.fillStyle = tonos[(f * 3 + c + 5) % 5]; g.fillRect(c * 24 + (f % 2) * 12 + 1, f * 16 + 1, 22, 14); }
  g.fillStyle = 'rgba(150,135,110,0.35)'; for (let i = 0; i < 40; i++) g.fillRect((i * 37) % w, (i * 23) % h, 2, 1);
}, { repetir: true });
/* la tela a rayas del toldo y de las reposeras */
const texRayas = (clave, a, b) => textura(clave, 32, 32, (g, w, h) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * 8, 0, 8, h); } g.fillStyle = 'rgba(0,0,0,0.06)'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1); }, { repetir: true });

export const ANCLAS = {
  escuela: { x: L.ESCUELA.x, y: L.ESCUELA.y }, tutor: { x: L.TUTOR.x, y: L.TUTOR.y }, llegada: { x: L.LLEGADA.x, y: L.LLEGADA.y },
  biblioteca: { x: L.BIBLIOTECA.x, y: L.BIBLIOTECA.y }, examen: { x: L.EXAMEN.x, y: L.EXAMEN.y }, mirador: { x: L.MIRADOR.x, y: L.MIRADOR.y },
};
const A = ANCLAS;
/* dónde se para la gente de cada saber (en el arco de adelante de su pieza) */
export const SITIOS = {
  patio: { x: A.escuela.x + 0.15, y: A.escuela.y + 0.75 },          // en el patio, delante del fogón (que queda en el centro)
  claro: { x: A.tutor.x + 0.55, y: A.tutor.y + 0.55 },              // quien llega al claro, por la abertura de adelante
  llegada: { x: A.llegada.x + 0.55, y: A.llegada.y + 0.45 },        // los que bajan del bus, junto al cartel
  biblioteca: { x: A.biblioteca.x + 0.55, y: A.biblioteca.y + 0.45 }, // delante del quiosco, preguntando
  defensa: { x: A.examen.x - 0.06, y: A.examen.y + 0.33 },          // sobre el tablado, detrás del atril, mirando a las gradas
  mirador: { x: A.mirador.x + 0.45, y: A.mirador.y + 0.45 },        // al pie de la escalera del mirador
};
const asiento = (B, dx, dz, mx, mz, alto) => ({ x: B.x + dx, y: B.y + dz, mira: { x: B.x + mx, y: B.y + mz }, alto });

/* ================= 87 · LA ESCUELA DEL VALLE: el anillo alrededor del círculo de piedras =================
   La escuela vuelve al lugar donde empezó la educación: el constructor es el de la hoja de bocetos (KM.escuelaAnillo), sin
   el fogón (que está en el valle) ni el árbol del patio. Etapas: 0 el tramo del fondo (158°-292°), de un piso, con su
   vidrio y su techo de pasto · 1 el anillo completo y las gradas del patio · 2 la biblioteca de dos pisos del fondo ·
   3 la linterna que se enciende (P.lampara), las bicis, los tiestos y las matas del techo. */
export function escuela(K, n) {
  const B = A.escuela, P = pieza(B), { R, r, GRADAS } = KM.ANILLO;
  const op = n === 0 ? { tramos: [[158, 292]], patio: false, gradas: false, entradas: false, biblioteca: false }
    : { biblioteca: n >= 2, linterna: n >= 3, detalles: n >= 3, tiestos: n >= 3, soloTechos: true };
  const g = KM.escuelaAnillo(K, { fogon: false, arbol: false, linterna: false, detalles: false, ...op });
  poner(P, B, g, 0, 0);
  if (g.userData.lampara) P.lampara = g.userData.lampara;
  if (n >= 3) [96, 112, 124, 137, 313, 330, 341, 354, 165, 285].forEach((a, i) => { const u = deg(a), d = R + 0.2 + (i % 2) * 0.06, ar = new THREE.Group(); ar.position.set(Math.cos(u) * d, 0, Math.sin(u) * d); ar.rotation.y = i;   // los arbustos al pie
    [[0, 0.11, 0, 0.13, FT.pastoD], [0.09, 0.08, 0.05, 0.1, '#5f8f3e'], [-0.08, 0.08, -0.03, 0.1, FT.pasto], [0.02, 0.2, 0.01, 0.08, FT.pastoL]].forEach(([x, y, z, rr, c]) => ar.add(ubic(esf(K, rr, c, O(0.002), 0.6), x, y, z)));
    if (i % 3 === 0) ar.add(ubic(esf(K, 0.025, ['#f2e27a', FT.rosa, '#ffffff'][i % 3], ST), 0.05, 0.22, 0.06));
    g.add(ar); });
  const t = deg(225);
  P.toc = [{ x: B.x + Math.cos(t) * (r + R) / 2, y: B.y + Math.sin(t) * (r + R) / 2, k: 'escuelaFu' }];
  // las gradas del patio: dos asientos por banco, mirando al fogón
  P.asientos = n < 1 ? [] : GRADAS.flatMap(([a, d]) => { const u = deg(a), cx = d * Math.cos(u), cz = d * Math.sin(u), sx = Math.sin(u), sz = -Math.cos(u);
    return [-1, 1].map(l => asiento(B, cx + l * 0.12 * sx, cz + l * 0.12 * sz, 0, 0, 0.2)); });
  return P;
}

/* ================= 88 · EL TUTOR QUE PREGUNTA: el claro de las preguntas =================
   El eco de Sócrates en el ágora: no se enseña de frente, se pregunta en círculo. Etapas: 0 seis tocones alrededor de una
   laja con un «?» de tiza · 1 la pérgola de madera con su enredadera (cubre la mitad del fondo: así no tapa a nadie desde
   la cámara) · 2 la pizarra con su pregunta y el tambor de una columna de mármol con «Solo sé que no sé nada» · 3 las
   guirnaldas de luces (P.luces, vivas), el estante bajo con libros y los cojines. */
const TOCONES = [15, 75, 135, 195, 255, 315], R_TOCON = 0.62;
const POSTES_PERGOLA = [125, 165, 205, 245, 285, 325], R_PERGOLA = 0.92, H_PERGOLA = 1.18;
function tocon(K, h, semilla) {
  const g = new THREE.Group(), r = azar(semilla), cort = ['#8a6a48', PAL.troncoL, '#7a5a3c'][semilla % 3];
  g.add(ubic(cil(K, 0.088, 0.1, h, 9, cort, O(0.003)), 0, h / 2, 0));
  g.add(ubic(cil(K, 0.084, 0.084, 0.012, 12, '#e4cb98', ST), 0, h + 0.002, 0));              // el corte, claro
  g.add(ubic(cil(K, 0.05, 0.05, 0.004, 10, '#c9a46e', ST), 0, h + 0.009, 0));                 // los anillos
  g.add(ubic(cil(K, 0.018, 0.018, 0.005, 6, '#a77f50', ST), 0, h + 0.011, 0));
  for (let i = 0; i < 3; i++) { const a = i * 2.1 + r() * 0.8, ra = K.malla(K.cono(0.035, 0.12, 5), cort, ST); ra.position.set(Math.cos(a) * 0.09, 0.03, Math.sin(a) * 0.09); ra.rotation.set(Math.sin(a) * 1.25, 0, -Math.cos(a) * 1.25); g.add(ra); }
  if (semilla % 2) { const mu = esf(K, 0.04, '#7fa64a', ST); mu.scale.set(1.2, 0.45, 1); mu.position.set(0.06, h * 0.55, 0.06); g.add(mu); }   // el musgo
  return g;
}
function pizarra(K) {
  const g = new THREE.Group();
  [-1, 1].forEach(l => { const p = caja(K, 0.035, 0.92, 0.035, FT.maderaD); p.position.set(l * 0.3, 0.45, 0.04); p.rotation.z = l * 0.06; p.rotation.x = -0.1; g.add(p); });
  const tr = caja(K, 0.03, 0.88, 0.03, FT.maderaD); tr.position.set(0, 0.42, -0.16); tr.rotation.x = 0.32; g.add(tr);     // la pata de atrás
  g.add(ubic(caja(K, 0.64, 0.5, 0.035, FT.madera, O(0.003)), 0, 0.62, 0.02));
  const tx = cartel(K, 'fu-pizarra', 160, 120, (c, w, h) => {
    c.fillStyle = '#2f4a3f'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 9; i++) c.fillRect((i * 37) % w, (i * 19) % h, 30, 6);
    c.fillStyle = '#f4f1e6'; c.font = `700 25px ${LETRA}`; c.textAlign = 'center'; c.fillText('¿Cómo lo', w / 2, 34); c.fillText('sabes?', w / 2, 62);
    c.strokeStyle = '#f4f1e6'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(28, 104); c.lineTo(62, 78); c.lineTo(96, 104); c.closePath(); c.stroke();
    c.font = `700 22px ${LETRA}`; c.fillText('?', 122, 104); c.fillStyle = '#f2c46a'; c.beginPath(); c.arc(140, 84, 4, 0, Math.PI * 2); c.fill();
  }, 0.58, 0.44);
  g.add(ubic(tx, 0, 0.62, 0.04));
  g.add(ubic(caja(K, 0.6, 0.025, 0.06, FT.maderaD), 0, 0.36, 0.06));                         // la repisa, con su tiza
  g.add(ubic(caja(K, 0.05, 0.015, 0.015, '#f4f1e6', ST), -0.12, 0.38, 0.07)); g.add(ubic(caja(K, 0.04, 0.015, 0.015, '#f2c46a', ST), 0.05, 0.38, 0.07));
  return g;
}
function tamborColumna(K) {
  const g = new THREE.Group(), R0 = 0.2, H0 = 0.36;
  g.add(ubic(cil(K, R0 + 0.025, R0 + 0.03, 0.05, 20, '#d8d2c6', O(0.003)), 0, 0.025, 0));     // el plinto
  g.add(ubic(cil(K, R0, R0, H0, 20, '#efebe3', O(0.004)), 0, 0.05 + H0 / 2, 0));               // el tambor estriado (20 caras)
  for (let i = 0; i < 20; i++) { const a = (i + 0.5) / 20 * Math.PI * 2; if (Math.cos(a - Math.PI / 4) > 0.35) continue; g.add(ubic(caja(K, 0.012, H0 - 0.04, 0.012, '#d3cdc0', ST), Math.sin(a) * (R0 - 0.002), 0.05 + H0 / 2, Math.cos(a) * (R0 - 0.002))); }
  g.add(ubic(cil(K, R0 + 0.006, R0 + 0.006, 0.02, 20, '#e2ddd2', ST), 0, 0.05 + H0 - 0.005, 0));
  // la frase, cincelada en la cara que mira a la cámara
  const t = textura('fu-socrates', 256, 112, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.textAlign = 'center'; c.font = `600 34px ${SERIF}`;
    c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillText('SOLO SÉ QUE', w / 2 + 1, 46); c.fillText('NO SÉ NADA', w / 2 + 1, 92);
    c.fillStyle = '#6a6052'; c.fillText('SOLO SÉ QUE', w / 2, 44); c.fillText('NO SÉ NADA', w / 2, 90);
  });
  const ins = new THREE.Mesh(propia(new THREE.CylinderGeometry(R0 + 0.004, R0 + 0.004, 0.22, 16, 1, true, Math.PI / 4 - 1.0, 2.0)), K.matMapa(t, { transparent: true, depthWrite: false }));
  ins.position.y = 0.05 + H0 / 2; g.add(ins);
  // arriba, una rama de olivo
  const ra = grupo(g, 0.02, 0.05 + H0 + 0.01, -0.02, 0.4);
  ra.add(ubic(caja(K, 0.22, 0.01, 0.01, '#7a6a4a', ST), 0, 0, 0));
  for (let i = 0; i < 7; i++) { const h = esf(K, 0.022, i % 2 ? '#8fa58a' : '#a9b99a', ST); h.scale.set(1.6, 0.5, 0.7); h.position.set(-0.09 + i * 0.03, 0.008, (i % 2 ? 1 : -1) * 0.02); h.rotation.y = (i % 2 ? 0.6 : -0.6); ra.add(h); }
  return g;
}
export function tutor(K, n) {
  const B = A.tutor, P = pieza(B), T = new THREE.Group(); poner(P, B, T, 0, 0);
  // el claro: la tierra pisada y el pasto alrededor
  T.add(ubic(cil(K, 0.98, 1.0, 0.012, 28, '#e7d8b2', { sinTinta: true, sombra: false }), 0, 0.006, 0));
  const rr = azar(8801), pasto = [];
  for (let i = 0; i < 46; i++) { const a = rr() * Math.PI * 2, d = 0.95 + rr() * 0.3; if (Math.cos(a - Math.PI / 4) > 0.55) continue; pasto.push([Math.cos(a) * d, 0, Math.sin(a) * d]); }
  T.add(KM.matas(K, pasto, FT.pastoD));
  // la laja con su «?» de tiza
  T.add(ubic(cil(K, 0.27, 0.31, 0.08, 7, '#bdb5a5', O(0.003)), 0, 0.04, 0));
  T.add(ubic(cil(K, 0.31, 0.33, 0.025, 7, '#9f978a', ST), 0, 0.012, 0));
  const sg = grupo(T, 0, 0.083, 0, Math.PI / 4);
  const q = cartel(K, 'fu-tiza', 64, 64, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(248,246,236,0.95)'; c.font = `800 52px ${LETRA}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', w / 2, h / 2 + 2); c.fillStyle = 'rgba(189,181,165,0.5)'; for (let i = 0; i < 30; i++) c.fillRect((i * 29) % w, (i * 17) % h, 3, 1); }, 0.34, 0.34);
  q.material.transparent = true; q.rotation.x = -Math.PI / 2; sg.add(q);
  T.add(ubic(caja(K, 0.06, 0.016, 0.016, '#f4f1e6', ST), 0.16, 0.088, -0.08, 0, 0.5));        // la tiza
  // los seis tocones
  TOCONES.forEach((a, i) => { const t = deg(a); T.add(ubic(tocon(K, 0.16 + (i % 3) * 0.015, i + 3), Math.cos(t) * R_TOCON, 0, Math.sin(t) * R_TOCON, 0, i * 0.9)); });
  P.asientos = TOCONES.map((a, i) => { const t = deg(a); return asiento(B, Math.cos(t) * R_TOCON, Math.sin(t) * R_TOCON, 0, 0, 0.17 + (i % 3) * 0.015); });
  P.toc = [{ x: B.x, y: B.y, k: 'tutorFu' }];
  if (n >= 1) {   // la pérgola: seis postes en la medialuna del fondo, las vigas, las tablillas y la enredadera
    const top = POSTES_PERGOLA.map(a => { const t = deg(a); return V(Math.cos(t) * R_PERGOLA, H_PERGOLA, Math.sin(t) * R_PERGOLA); });
    top.forEach(p => {
      T.add(ubic(caja(K, 0.055, H_PERGOLA, 0.055, FT.maderaD, O(0.0025)), p.x, H_PERGOLA / 2, p.z));
      T.add(ubic(caja(K, 0.09, 0.05, 0.09, FT.hormigonD, O(0.0015)), p.x, 0.025, p.z));
    });
    const viga = (a, b, y, alto = 0.05, color = FT.madera) => { const L = Math.hypot(b.x - a.x, b.z - a.z), m = caja(K, L + 0.06, alto, 0.06, color, O(0.002)); m.position.set((a.x + b.x) / 2, y, (a.z + b.z) / 2); m.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x); T.add(m); };
    for (let i = 0; i < top.length - 1; i++) viga(top[i], top[i + 1], H_PERGOLA);
    viga(top[0], top.at(-1), H_PERGOLA, 0.06, FT.maderaD);                                       // la viga del frente (la cuerda de la medialuna)
    const sC = (Math.cos(deg(125)) + Math.sin(deg(125))) * R_PERGOLA / Math.SQRT2;               // la cuerda, a lo largo del eje de la cámara
    for (let s = sC - 0.02; s > -R_PERGOLA + 0.05; s -= 0.105) {
      const L = 2 * Math.sqrt(Math.max(0, (R_PERGOLA + 0.04) ** 2 - s * s)), m = caja(K, L, 0.028, 0.04, FT.maderaL, O(0.0015));
      m.position.set(s / Math.SQRT2, H_PERGOLA + 0.04, s / Math.SQRT2); m.rotation.y = Math.PI / 4; T.add(m);
    }
    // la enredadera: matas de hojas en tres verdes, flores y los zarcillos que bajan por los postes
    const re = azar(8812), hojas = [[], [], []], flores = [];
    for (let i = 0; i < 70; i++) {
      const a = deg(118 + re() * 214), d = Math.sqrt(re()) * (R_PERGOLA + 0.04), x = Math.cos(a) * d, z = Math.sin(a) * d;
      if ((x + z) / Math.SQRT2 > sC + 0.06) continue;
      hojas[i % 3].push([x, H_PERGOLA + 0.08 + re() * 0.05, z, 0.07 + re() * 0.05]);
      if (i % 5 === 0) flores.push([x + 0.03, H_PERGOLA + 0.15, z + 0.03]);
    }
    [1, 2, 4].forEach(k => { const p = top[k]; for (let j = 0; j < 7; j++) hojas[j % 3].push([p.x + (j % 2 ? 0.03 : -0.03), H_PERGOLA - 0.08 - j * 0.09, p.z + 0.03, 0.05 - j * 0.003]); flores.push([p.x + 0.05, H_PERGOLA - 0.3, p.z + 0.04]); });
    const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), v = new THREE.Vector3(), s3 = new THREE.Vector3();
    ['#5f8f3e', FT.pastoD, FT.pasto].forEach((c, k) => {
      const im = K.instancias(K.esfera(1, 0.5), c, hojas[k].length, { grosor: 0.025 });
      hojas[k].forEach(([x, y, z, s], i) => { m4.compose(v.set(x, y, z), qq, s3.set(s * 1.3, s * 0.65, s * 1.3)); im.setMatrixAt(i, m4); }); T.add(im);
    });
    const fl = K.instancias(K.esfera(0.022, 0.4), FT.rosa, flores.length, ST);
    flores.forEach(([x, y, z], i) => { m4.compose(v.set(x, y, z), qq, s3.set(1, 1, 1)); fl.setMatrixAt(i, m4); }); T.add(fl);
  }
  if (n >= 2) {   // la pizarra y el tambor de la columna
    T.add(ubic(pizarra(K), -1.18, 0, 0.36, 0, 1.2));
    T.add(ubic(tamborColumna(K), 0.98, 0, -0.84, 0, 0));
  }
  if (n >= 3) {   // las guirnaldas, el estante bajo y los cojines
    // dos postes más, a los lados (no delante de nadie)
    const PL = V(-0.98, 1.22, 1.32), PD = V(1.36, 1.22, -0.98);
    [PL, PD].forEach(p => { T.add(ubic(caja(K, 0.05, 1.22, 0.05, FT.maderaD, O(0.0025)), p.x, 0.61, p.z)); T.add(ubic(caja(K, 0.08, 0.05, 0.08, FT.hormigonD), p.x, 0.025, p.z)); T.add(ubic(cil(K, 0.035, 0.03, 0.03, 8, FT.maderaD, ST), p.x, 1.235, p.z)); });
    const top = POSTES_PERGOLA.map(a => { const t = deg(a); return V(Math.cos(t) * R_PERGOLA, H_PERGOLA - 0.02, Math.sin(t) * R_PERGOLA); });
    const tramos = [];
    for (let i = 0; i < top.length - 1; i++) tramos.push(cuerda(top[i], top[i + 1], 0.07));
    tramos.push(cuerda(top[0], top.at(-1), 0.03, 22), cuerda(top[0], PL, 0.12), cuerda(top.at(-1), PD, 0.12));
    const luces = new THREE.Group(); luces.userData.vivo = true; T.add(luces); P.luces = luces;
    for (const pts of tramos) {
      luces.add(hilo(K, pts, 0.005));
      const curva = new THREE.CatmullRomCurve3(pts), nb = Math.max(3, Math.round(curva.getLength() / 0.1));
      for (let i = 1; i < nb; i++) {
        const p = curva.getPointAt(i / nb);
        luces.add(ubic(new THREE.Mesh(K.esfera(0.022, 0.5), brillo('#ffd98a')), p.x, p.y - 0.035, p.z));
        luces.add(ubic(new THREE.Mesh(K.cilindro(0.01, 0.01, 0.018, 6), brillo('#4a4038')), p.x, p.y - 0.01, p.z));
      }
    }
    // el estante bajo con libros, de cara al círculo
    const es = grupo(T, -0.8, 0, -0.8, Math.PI / 4), rb = azar(8830);
    es.add(ubic(caja(K, 0.66, 0.36, 0.17, FT.maderaD, O(0.0025)), 0, 0.18, -0.01));
    es.add(ubic(caja(K, 0.6, 0.3, 0.12, '#7c5530', ST), 0, 0.18, 0.02));
    [0.03, 0.19].forEach((y0, f) => { let x = -0.27; while (x < 0.25) { const a = 0.025 + rb() * 0.018, al = 0.1 + rb() * 0.04, tumbado = rb() < 0.12;
      if (tumbado) { es.add(ubic(caja(K, al, a, 0.1, FT.libro[Math.floor(rb() * 5)], ST), x + al / 2, y0 + a / 2, 0.04)); x += al + 0.01; }
      else { es.add(ubic(caja(K, a, al, 0.1, FT.libro[Math.floor(rb() * 5)], ST), x + a / 2, y0 + al / 2, 0.04)); x += a + 0.004; } } });
    es.add(ubic(caja(K, 0.2, 0.06, 0.12, FT.libro[1], O(0.0015)), -0.16, 0.39, 0.0)); es.add(ubic(caja(K, 0.17, 0.04, 0.1, FT.libro[2], O(0.0015)), -0.16, 0.44, 0.0));
    es.add(KM.tiesto(K, 0.18, 0, FT.pasto)); es.children.at(-1).position.y = 0.36;
    // los cojines, entre los tocones del fondo
    [[225, 0.86, FT.ocre], [175, 0.88, FT.turquesa], [278, 0.88, FT.rosa], [205, 1.06, FT.celeste], [250, 1.06, '#c64a30']].forEach(([a, d, c]) => {
      const t = deg(a), co = esf(K, 0.11, c, O(0.002), 0.6); co.scale.set(1.05, 0.36, 1.05); co.position.set(Math.cos(t) * d, 0.04, Math.sin(t) * d); T.add(co);
      T.add(ubic(esf(K, 0.014, '#f1e6cf', ST), Math.cos(t) * d, 0.08, Math.sin(t) * d));
      P.asientos.push(asiento(B, Math.cos(t) * d, Math.sin(t) * d, 0, 0, 0.07));
    });
  }
  return P;
}

/* ================= 89 · LA TRADUCCIÓN AL INSTANTE: la parada donde llegan los de lejos =================
   El eco de Bagdad, al revés: ya no se traducen los libros que llegan, llegan los que hablan otras lenguas y todos se
   entienden. Está por el camino del frente (que baja hacia +z, al borde del tablero). Etapas: 0 el poste con el cartel de
   bienvenida en seis escrituras · 1 el refugio de madera con su banco y las maletas · 2 el bus eléctrico chico,
   estacionado en el camino · 3 los banderines de colores y el tablero con el mapa del mundo. */
const SALUDOS = [['Bienvenidos', '#c64a30', 30], ['Welcome', '#41709c', 30], ['欢迎', '#b5832a', 32], ['مرحبا', '#3f8a5a', 32], ['Karibu', '#8a5a8a', 30], ['Добро пожаловать', '#2f6a8a', 22]];
function cartelBienvenida(K) {
  const g = new THREE.Group();
  g.add(ubic(caja(K, 0.075, 1.3, 0.075, FT.maderaD, O(0.003)), 0, 0.65, -0.05));
  for (let i = 0; i < 5; i++) { const a = i * 1.3, p = K.malla(K.roca(0.05, 300 + i), i % 2 ? PAL.roca : PAL.rocaD, O(0.002)); p.scale.set(1.2, 0.7, 1); p.position.set(Math.cos(a) * 0.08, 0.02, -0.05 + Math.sin(a) * 0.08); g.add(p); }
  g.add(ubic(caja(K, 0.82, 0.66, 0.04, FT.madera, O(0.003)), 0, 0.82, 0));                    // el marco
  const tx = cartel(K, 'fu-bienvenida', 256, 208, (c, w, h) => {
    c.fillStyle = '#fbf6ea'; c.fillRect(0, 0, w, h); c.textAlign = 'center'; c.textBaseline = 'middle';
    SALUDOS.forEach(([s, col, px], i) => { c.fillStyle = col; c.font = `700 ${px}px ${LETRA}`; c.fillText(s, w / 2, 19 + i * 34); });
    c.fillStyle = 'rgba(120,90,50,0.18)'; for (let i = 1; i < 6; i++) c.fillRect(30, i * 34 + 2, w - 60, 1);
  }, 0.76, 0.6);
  g.add(ubic(tx, 0, 0.82, 0.021));
  [-1, 1].forEach(l => { const t = caja(K, 0.5, 0.035, 0.12, FT.chapaV, O(0.002)); t.position.set(l * 0.22, 1.2, 0); t.rotation.z = -l * 0.32; g.add(t); });   // el techito
  // arriba, el disco de la parada con el bus
  const d = cartel(K, 'fu-parada', 64, 64, (c, w, h) => {
    c.fillStyle = '#3f8a5a'; c.beginPath(); c.arc(w / 2, h / 2, 31, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(w / 2, h / 2, 25, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#3f8a5a'; c.fillRect(16, 20, 32, 20); c.fillStyle = '#ffffff'; c.fillRect(19, 23, 12, 8); c.fillRect(33, 23, 12, 8); c.fillStyle = '#3f8a5a'; c.beginPath(); c.arc(23, 42, 4, 0, Math.PI * 2); c.arc(41, 42, 4, 0, Math.PI * 2); c.fill();
  }, 0.2, 0.2);
  d.material.transparent = true; g.add(ubic(d, 0, 1.42, -0.01)); g.add(ubic(caja(K, 0.03, 0.12, 0.03, '#9aa3a8', ST), 0, 1.3, -0.04));
  // las flores al pie
  const rr = azar(8901); for (let i = 0; i < 9; i++) { const a = rr() * Math.PI * 2, dd = 0.12 + rr() * 0.12; g.add(ubic(esf(K, 0.03, i % 3 ? FT.pastoD : FT.pasto, ST), Math.cos(a) * dd, 0.03, 0.05 + Math.sin(a) * dd)); if (i % 2) g.add(ubic(esf(K, 0.016, ['#f2e27a', FT.rosa, '#ffffff'][i % 3], ST), Math.cos(a) * dd, 0.065, 0.05 + Math.sin(a) * dd)); }
  return g;
}
function refugio(K) {
  const g = new THREE.Group(), W = 1.05, D = 0.46, H = 0.9;
  g.add(ubic(caja(K, W + 0.1, 0.04, D + 0.12, FT.hormigon, O(0.002)), 0, 0.02, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(ubic(caja(K, 0.05, H, 0.05, FT.maderaD, O(0.0025)), a * (W / 2 - 0.03), 0.04 + H / 2, b * (D / 2 - 0.03))));
  g.add(ubic(KM.tablas(K, W - 0.06, 0.66, 0.03), 0, 0.12 + 0.33, -D / 2 + 0.03));                 // la pared del fondo
  [-1, 1].forEach(l => { const m = KM.muroVidrio(K, D - 0.06, 0.6, 0.2); m.position.set(l * (W / 2 - 0.03), 0.16, 0); m.rotation.y = Math.PI / 2; g.add(m); });
  // el techo inclinado, con su pasto y sus tapas
  const te = new THREE.Group(); te.position.set(0, 0.04 + H + 0.02, 0.02); te.rotation.x = 0.13; g.add(te);
  te.add(ubic(caja(K, W + 0.2, 0.05, D + 0.28, FT.maderaD, O(0.003)), 0, 0, 0));
  te.add(ubic(K.malla(K.caja(W + 0.14, 0.04, D + 0.22), KM.matRep(K, 'pasto', KM.texPasto(), 2, 1), O(0.002)), 0, 0.045, 0));
  te.add(ubic(caja(K, W + 0.22, 0.07, 0.03, FT.madera, O(0.002)), 0, 0.0, (D + 0.28) / 2));
  // el banco, el horario y el mapita de la línea
  g.add(ubic(KM.banco(K, W - 0.2), 0, 0.04, -0.06));
  const ho = cartel(K, 'fu-horario', 64, 80, (c, w, h) => { c.fillStyle = '#f3efe6'; c.fillRect(0, 0, w, h); c.fillStyle = '#3f8a5a'; c.fillRect(0, 0, w, 14); c.fillStyle = '#5b6168'; for (let i = 0; i < 6; i++) { c.fillRect(6, 22 + i * 9, 18, 3); c.fillRect(30, 22 + i * 9, 26, 3); } }, 0.16, 0.2);
  g.add(ubic(ho, -0.3, 0.62, -D / 2 + 0.05));
  const li = cartel(K, 'fu-linea', 96, 48, (c, w, h) => { c.fillStyle = '#f3efe6'; c.fillRect(0, 0, w, h); c.strokeStyle = '#3f8a5a'; c.lineWidth = 4; c.beginPath(); c.moveTo(8, 30); c.lineTo(40, 18); c.lineTo(88, 26); c.stroke(); c.fillStyle = '#c64a30'; [[8, 30], [40, 18], [64, 22], [88, 26]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 2); c.fill(); }); }, 0.24, 0.12);
  g.add(ubic(li, 0.2, 0.66, -D / 2 + 0.05));
  return g;
}
function maletas(K) {
  const g = new THREE.Group();
  const maleta = (x, z, w, h, c, ry) => { const m = grupo(g, x, 0, z, ry);
    m.add(ubic(caja(K, w, h, 0.09, c, O(0.002)), 0, 0.02 + h / 2, 0));
    m.add(ubic(caja(K, w + 0.006, 0.012, 0.094, '#5b6168', ST), 0, 0.02 + h * 0.5, 0));            // la cremallera
    [-1, 1].forEach(l => { m.add(ubic(caja(K, 0.008, 0.12, 0.008, '#9aa3a8', ST), l * w * 0.25, 0.02 + h + 0.06, -0.03)); m.add(ubic(cil(K, 0.012, 0.012, 0.012, 6, '#2c2c2c', ST), l * w * 0.35, 0.012, 0.03)); });
    m.add(ubic(caja(K, w * 0.6, 0.014, 0.014, '#2c2c2c', ST), 0, 0.02 + h + 0.12, -0.03)); };
  maleta(0, 0, 0.2, 0.26, FT.celeste, 0.3); maleta(0.2, 0.08, 0.16, 0.2, FT.rosa, -0.2);
  const mo = grupo(g, -0.14, 0, 0.12, 0.5);                                                         // la mochila
  mo.add(ubic(caja(K, 0.14, 0.18, 0.09, '#5f9a6a', O(0.002)), 0, 0.09, 0)); mo.add(ubic(caja(K, 0.15, 0.06, 0.1, '#4c7f56', O(0.0015)), 0, 0.17, 0.005)); mo.add(ubic(caja(K, 0.1, 0.06, 0.02, '#4c7f56', ST), 0, 0.07, 0.05));
  const bo = K.malla(K.capsula(0.06, 0.16, 0.6), FT.ocre, O(0.002)); bo.rotation.z = Math.PI / 2; bo.position.set(0.1, 0.06, 0.24); bo.rotation.y = 0.4; g.add(bo);   // el bolso
  return g;
}
function busElectrico(K) {   // a lo largo de z, con el frente hacia +z (la pieza lo gira); la puerta va del lado derecho (-x)
  const g = new THREE.Group(), L0 = 1.25, W = 0.5, BL = '#f3f1ea';
  [-1, 1].forEach(e => [-1, 1].forEach(l => { const r = grupo(g, l * (W / 2 - 0.02), 0.085, e * 0.36);
    const ru = cil(K, 0.085, 0.085, 0.07, 14, '#2c2c2c', O(0.002)); ru.rotation.z = Math.PI / 2; r.add(ru);
    const ta = cil(K, 0.045, 0.045, 0.074, 10, '#c9cdd0', ST); ta.rotation.z = Math.PI / 2; r.add(ta); }));
  g.add(ubic(caja(K, W, 0.3, L0, BL, O(0.003)), 0, 0.26, 0));                                     // la carrocería
  g.add(ubic(caja(K, W + 0.006, 0.07, L0 + 0.006, FT.turquesa, ST), 0, 0.15, 0));                  // la franja
  g.add(ubic(caja(K, W - 0.02, 0.22, L0 - 0.08, FT.vidrioD, O(0.002)), 0, 0.52, -0.02));           // las ventanas
  for (let i = 0; i < 5; i++) [-1, 1].forEach(l => g.add(ubic(caja(K, 0.012, 0.22, 0.03, BL, ST), l * (W / 2 - 0.005), 0.52, -0.5 + i * 0.25)));
  g.add(ubic(caja(K, W + 0.01, 0.06, L0 + 0.01, BL, O(0.003)), 0, 0.66, 0));                     // el techo
  g.add(ubic(caja(K, W - 0.12, 0.06, 0.6, FT.turquesa, O(0.002)), 0, 0.72, -0.15));                // las baterías
  // el frente: el parabrisas, los focos, el letrero
  g.add(ubic(caja(K, W - 0.04, 0.24, 0.02, FT.vidrio, O(0.0015)), 0, 0.5, L0 / 2 + 0.002));
  [-1, 1].forEach(l => g.add(ubic(caja(K, 0.07, 0.035, 0.02, '#fff4d6', ST), l * 0.16, 0.2, L0 / 2 + 0.006)));
  const le = cartel(K, 'fu-letrero', 96, 20, (c, w, h) => { c.fillStyle = '#2c2c2c'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffcf5a'; c.font = `700 15px ${LETRA}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ESCUELA', w / 2, h / 2 + 1); }, 0.36, 0.075);
  g.add(ubic(le, 0, 0.62, L0 / 2 + 0.012));
  // la puerta (dos hojas de vidrio) del lado derecho, y el rayo verde de eléctrico del otro lado
  g.add(ubic(caja(K, 0.02, 0.4, 0.24, FT.vidrioD, O(0.0015)), -W / 2 - 0.006, 0.36, 0.3)); g.add(ubic(caja(K, 0.024, 0.4, 0.012, BL, ST), -W / 2 - 0.006, 0.36, 0.3));
  const ra = cartel(K, 'fu-rayo', 32, 32, (c, w, h) => { c.fillStyle = '#5f9a6a'; c.beginPath(); c.arc(16, 16, 15, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(18, 4); c.lineTo(9, 18); c.lineTo(15, 18); c.lineTo(13, 28); c.lineTo(23, 13); c.lineTo(17, 13); c.closePath(); c.fill(); }, 0.12, 0.12);
  ra.material.transparent = true; ra.rotation.y = -Math.PI / 2; g.add(ubic(ra, -W / 2 - 0.008, 0.27, -0.25));
  const ls = cartel(K, 'fu-letrero', 96, 20, () => {}, 0.36, 0.075); ls.rotation.y = -Math.PI / 2; g.add(ubic(ls, -W / 2 - 0.008, 0.36, -0.2));
  // la cola: la luneta, los focos rojos y la patente
  g.add(ubic(caja(K, W - 0.08, 0.2, 0.02, FT.vidrioD, O(0.0015)), 0, 0.52, -L0 / 2 - 0.002));
  [-1, 1].forEach(l => g.add(ubic(caja(K, 0.06, 0.05, 0.02, '#c64a30', ST), l * 0.18, 0.22, -L0 / 2 - 0.006)));
  g.add(ubic(caja(K, 0.12, 0.04, 0.012, '#f2e27a', ST), 0, 0.16, -L0 / 2 - 0.008));
  [-1, 1].forEach(l => g.add(ubic(caja(K, 0.03, 0.06, 0.02, '#2c2c2c', ST), l * (W / 2 + 0.03), 0.5, L0 / 2 - 0.04)));   // los espejos
  return g;
}
/* el mapa del mundo (equirrectangular, a mano alzada) con las chinchetas de dónde vienen */
const CONTINENTES = [
  [[-168, 66], [-156, 71], [-125, 72], [-95, 72], [-80, 73], [-62, 66], [-55, 52], [-66, 45], [-75, 35], [-81, 25], [-90, 29], [-97, 26], [-97, 19], [-88, 15], [-83, 9], [-79, 8], [-87, 13], [-95, 16], [-105, 20], [-112, 29], [-117, 33], [-124, 40], [-124, 48], [-133, 56], [-150, 60], [-165, 60]],
  [[-55, 60], [-43, 60], [-20, 70], [-20, 80], [-40, 83], [-60, 80], [-70, 77]],
  [[-80, 8], [-60, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-65, -42], [-68, -54], [-72, -50], [-74, -40], [-71, -30], [-70, -18], [-76, -12], [-81, -5], [-78, 2]],
  [[-10, 36], [-9, 43], [-2, 44], [-4, 48], [2, 51], [8, 54], [12, 55], [10, 58], [5, 62], [15, 69], [25, 71], [40, 68], [45, 60], [40, 50], [30, 45], [28, 41], [23, 37], [20, 40], [15, 38], [12, 44], [8, 44], [3, 42], [0, 38], [-5, 36]],
  [[-17, 21], [-10, 30], [-5, 36], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 12], [42, -2], [40, -15], [35, -24], [32, -29], [20, -35], [17, -29], [12, -17], [13, -5], [9, 4], [-5, 5], [-13, 8], [-17, 14]],
  [[40, 68], [60, 70], [80, 73], [100, 77], [130, 72], [160, 70], [180, 66], [170, 60], [160, 52], [142, 46], [135, 35], [122, 30], [120, 22], [108, 20], [106, 10], [100, 13], [98, 8], [95, 16], [90, 22], [80, 15], [77, 8], [72, 20], [66, 25], [57, 26], [50, 30], [57, 23], [52, 16], [43, 13], [35, 28], [35, 36], [28, 41], [30, 45], [40, 50], [45, 60]],
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [140, -38], [132, -32], [115, -34]],
  [[-6, 50], [1, 51], [0, 54], [-3, 58], [-6, 57]], [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]], [[130, 31], [135, 34], [141, 38], [142, 44], [140, 41], [136, 36]],
  [[95, 5], [105, -6], [115, -8], [120, -9], [110, -2], [100, 1]], [[110, 1], [118, 7], [119, 0], [116, -4]],
];
function tableroMapa(K) {
  const g = new THREE.Group(), W = 0.8, H = 0.47;
  [-1, 1].forEach(l => g.add(ubic(caja(K, 0.045, 1.08, 0.045, FT.maderaD, O(0.0025)), l * (W / 2 - 0.02), 0.54, -0.03)));
  g.add(ubic(caja(K, W + 0.06, H + 0.06, 0.035, FT.madera, O(0.003)), 0, 0.74, 0));
  const tx = cartel(K, 'fu-mapa', 240, 140, (c, w, h) => {
    c.fillStyle = '#bfe0ea'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(0, i * h / 6); c.lineTo(w, i * h / 6); c.stroke(); c.beginPath(); c.moveTo(i * w / 6, 0); c.lineTo(i * w / 6, h); c.stroke(); }
    const P2 = ([lo, la]) => [(lo + 180) / 360 * w, (90 - la) / 180 * h];
    CONTINENTES.forEach((poli, i) => { c.fillStyle = ['#e8dfb8', '#f3efe6', '#cfe0a8', '#e8dfb8', '#e9cf9a', '#d9e4b0', '#ecc79a'][i % 7]; c.strokeStyle = '#8a7a5a'; c.lineWidth = 1; c.beginPath(); poli.forEach((p, k) => { const [x, y] = P2(p); k ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.fill(); c.stroke(); });
    const valle = P2([-70, -33]);   // de dónde vienen: hilos punteados hasta el valle
    c.setLineDash([3, 3]); c.strokeStyle = '#c64a30'; c.lineWidth = 1.5;
    [[116, 40], [31, 30], [37, -1], [-0, 51], [37, 55], [-99, 19], [77, 28], [135, -25]].forEach(p => { const [x, y] = P2(p); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo((x + valle[0]) / 2, Math.min(y, valle[1]) - 20, valle[0], valle[1]); c.stroke(); c.setLineDash([]); c.fillStyle = '#c64a30'; c.beginPath(); c.arc(x, y, 3.5, 0, Math.PI * 2); c.fill(); c.setLineDash([3, 3]); });
    c.setLineDash([]); c.fillStyle = '#f2b441'; c.strokeStyle = '#8a5a14'; c.beginPath(); c.arc(valle[0], valle[1], 6, 0, Math.PI * 2); c.fill(); c.stroke();
  }, W, H);
  g.add(ubic(tx, 0, 0.74, 0.019));
  const te = caja(K, W + 0.18, 0.035, 0.14, FT.chapaV, O(0.002)); te.position.set(0, 1.0, 0.02); te.rotation.x = 0.25; g.add(te);
  return g;
}
function banderines(K, a, b, comba, padre, semilla) {
  const pts = cuerda(a, b, comba, 16), curva = new THREE.CatmullRomCurve3(pts), n = Math.max(4, Math.round(curva.getLength() / 0.075));
  padre.add(hilo(K, pts, 0.004, '#5b5148'));
  const tri = propia(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-0.03, 0), new THREE.Vector2(0.03, 0), new THREE.Vector2(0, -0.075)])));
  const COL = ['#c64a30', '#f2b441', '#41709c', '#5f9a6a', FT.rosa, '#8a5a8a', FT.turquesa];
  for (let i = 1; i < n; i++) {
    const p = curva.getPointAt(i / n), t = curva.getTangentAt(i / n);
    const f = K.malla(tri, K.mat(COL[(i + semilla) % COL.length], { side: THREE.DoubleSide }), { grosor: 0.0015 });
    f.position.copy(p); f.rotation.y = -Math.atan2(t.z, t.x); padre.add(f);
  }
}
export function llegada(K, n) {
  const B = A.llegada, P = pieza(B), G = new THREE.Group(); poner(P, B, G, 0, 0);
  G.add(ubic(cartelBienvenida(K), -0.45, 0, -0.3, 0, Math.PI / 4));
  P.toc = [{ x: B.x - 0.45, y: B.y - 0.3, k: 'llegadaFu' }];
  P.asientos = [];
  const RF = { x: 0.78, z: -0.82, ry: 0.35 };
  if (n >= 1) {
    G.add(ubic(refugio(K), RF.x, 0, RF.z, 0, RF.ry));
    G.add(ubic(maletas(K), 0.3, 0, -0.42, 0, 0.3));
    const sx = Math.cos(RF.ry), sz = -Math.sin(RF.ry), fx = Math.sin(RF.ry), fz = Math.cos(RF.ry);
    P.asientos = [-0.22, 0.22].map(l => asiento(B, RF.x + l * sx - 0.06 * fx, RF.z + l * sz - 0.06 * fz, RF.x + fx * 2, RF.z + fz * 2, 0.2));
  }
  if (n >= 2) G.add(ubic(busElectrico(K), -0.13, 0, 1.36, 0, Math.PI));
  if (n >= 3) {
    G.add(ubic(tableroMapa(K), -1.28, 0, 0.08, 0, Math.PI / 4 + 0.2));
    const PD = V(1.62, 1.12, -0.28);
    G.add(ubic(caja(K, 0.045, 1.12, 0.045, FT.maderaD, O(0.0025)), PD.x, 0.56, PD.z)); G.add(ubic(cil(K, 0.03, 0.03, 0.03, 8, '#c64a30', ST), PD.x, 1.13, PD.z));
    const esq = (lx, lz) => V(RF.x + lx * Math.cos(RF.ry) + lz * Math.sin(RF.ry), 1.02, RF.z - lx * Math.sin(RF.ry) + lz * Math.cos(RF.ry));
    const poste = V(-0.45 + Math.sin(Math.PI / 4) * -0.05, 1.22, -0.3 + Math.cos(Math.PI / 4) * -0.05);
    banderines(K, poste, esq(-0.6, 0.28), 0.12, G, 0);
    banderines(K, esq(0.6, 0.28), PD, 0.1, G, 3);
    banderines(K, poste, V(-1.28 + 0.38 * Math.cos(Math.PI / 4 + 0.2), 1.02, 0.08 - 0.38 * Math.sin(Math.PI / 4 + 0.2)), 0.1, G, 5);
  }
  return P;
}

/* ================= 90 · LA BIBLIOTECA QUE RESPONDE: junto a la cueva =================
   El eco de Alejandría: todo se encuentra… y a veces se inventa (⚖️). Etapas: 0 el quiosco de vidrio chico donde se
   pregunta · 1 el pabellón entero (el de la cueva, monumentos.js) · 2 la terraza de lectura con sus reposeras y los
   estantes afuera · 3 la mesa de revisión: los papeles con marcas rojas (✓ y ✗), la lámpara, la lupa y el corcho donde
   se clavan las respuestas inventadas que se pillaron. */
function quiosco(K) {
  const g = new THREE.Group(), W = 0.56, D = 0.44, H = 0.68;
  g.add(ubic(caja(K, W + 0.12, 0.05, D + 0.12, FT.hormigon, O(0.002)), 0, 0.025, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(ubic(caja(K, 0.045, H, 0.045, FT.maderaD, O(0.002)), a * W / 2, 0.05 + H / 2, b * D / 2)));
  g.add(ubic(KM.muroVidrio(K, W - 0.04, H - 0.02, 0.27), 0, 0.05, D / 2));
  [-1, 1].forEach(l => { const m = KM.muroVidrio(K, D - 0.04, H - 0.02, 0.2); m.position.set(l * W / 2, 0.05, 0); m.rotation.y = Math.PI / 2; g.add(m); });
  g.add(ubic(KM.tablas(K, W, H, 0.03), 0, 0.05 + H / 2, -D / 2 + 0.015));
  g.add(ubic(caja(K, W + 0.2, 0.05, D + 0.2, FT.maderaD, O(0.003)), 0, 0.05 + H + 0.025, 0.02));
  g.add(ubic(K.malla(K.caja(W + 0.12, 0.04, D + 0.12), KM.matRep(K, 'pasto', KM.texPasto(), 1, 1), O(0.002)), 0, 0.05 + H + 0.07, 0.02));
  // adentro: el atril con el libro abierto y la chispa azul que responde
  g.add(ubic(cil(K, 0.025, 0.04, 0.34, 8, FT.maderaD, ST), 0, 0.05 + 0.17, -0.04));
  const at = caja(K, 0.2, 0.02, 0.14, FT.madera, O(0.0015)); at.position.set(0, 0.42, -0.04); at.rotation.x = 0.35; g.add(at);
  [-1, 1].forEach(l => { const h = caja(K, 0.085, 0.006, 0.11, '#fbf6ea', ST); h.position.set(l * 0.045, 0.437, -0.035); h.rotation.set(0.35, 0, -l * 0.08); g.add(h); });
  g.add(ubic(new THREE.Mesh(K.esfera(0.035, 0.6), brillo(FT.chispa)), 0.12, 0.55, -0.06));
  g.add(ubic(new THREE.Mesh(K.esfera(0.06, 0.6), brillo(FT.chispa, { transparent: true, opacity: 0.35, depthWrite: false })), 0.12, 0.55, -0.06));
  // arriba, el letrero redondo con su «?»
  g.add(ubic(caja(K, 0.025, 0.14, 0.025, '#9aa3a8', ST), 0, 0.05 + H + 0.16, 0));
  const s = cartel(K, 'fu-pregunta', 64, 64, (c, w, h) => { c.fillStyle = '#41709c'; c.beginPath(); c.arc(32, 32, 31, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ffffff'; c.font = `800 42px ${LETRA}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 32, 35); }, 0.2, 0.2);
  s.material.transparent = true; g.add(ubic(s, 0, 0.05 + H + 0.3, 0.015));
  return g;
}
function reposera(K, tela) {
  const g = new THREE.Group(), mt = KM.matRep(K, tela, tela === 'rayasA' ? texRayas('fu-rayasA', FT.turquesa, '#f3efe6') : texRayas('fu-rayasB', FT.ocre, '#f3efe6'), 1, 2);
  [-1, 1].forEach(l => { const a = caja(K, 0.025, 0.025, 0.52, FT.maderaD, O(0.0015)); a.position.set(l * 0.11, 0.13, 0.02); a.rotation.x = 0.12; g.add(a);
    const b = caja(K, 0.025, 0.36, 0.025, FT.maderaD, O(0.0015)); b.position.set(l * 0.11, 0.2, -0.18); b.rotation.x = -0.75; g.add(b);
    g.add(ubic(caja(K, 0.022, 0.14, 0.022, FT.maderaD, ST), l * 0.11, 0.07, 0.24)); });
  const s = K.malla(K.caja(0.2, 0.012, 0.3), mt, O(0.0015)); s.position.set(0, 0.12, 0.08); s.rotation.x = 0.08; g.add(s);
  const r = K.malla(K.caja(0.2, 0.012, 0.3), mt, O(0.0015)); r.position.set(0, 0.25, -0.13); r.rotation.x = -0.82; g.add(r);
  return g;
}
const texPapel = (marca) => textura('fu-papel-' + marca, 48, 64, (c, w, h) => {
  c.fillStyle = '#fbf8f0'; c.fillRect(0, 0, w, h); c.fillStyle = '#8d8577'; for (let i = 0; i < 8; i++) c.fillRect(6, 8 + i * 6, 22 + ((i * 7) % 12), 2);
  c.strokeStyle = '#d23a2a'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath();
  if (marca === 'si') { c.moveTo(26, 50); c.lineTo(32, 57); c.lineTo(44, 40); } else { c.moveTo(28, 42); c.lineTo(42, 56); c.moveTo(42, 42); c.lineTo(28, 56); }
  c.stroke(); if (marca === 'no') { c.lineWidth = 2; c.beginPath(); c.ellipse(18, 21, 14, 5, 0, 0, Math.PI * 2); c.stroke(); }
});
const papel = (K, marca, w = 0.09, h = 0.12) => new THREE.Mesh(propia(new THREE.PlaneGeometry(w, h)), matTex(K, 'fu-papel-' + marca, texPapel(marca)));
function mesaRevision(K) {
  const g = new THREE.Group(), Y = 0.34;
  g.add(ubic(caja(K, 0.62, 0.035, 0.34, FT.maderaL, O(0.0025)), 0, Y, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(ubic(caja(K, 0.03, Y, 0.03, FT.maderaD, ST), a * 0.27, Y / 2, b * 0.14)));
  // los papeles: con ✓, con ✗ y la pila de los que faltan
  [['si', -0.17, 0.03, 0.2], ['no', -0.05, -0.04, -0.15], ['no', 0.07, 0.05, 0.1], ['si', 0.19, -0.02, -0.3]].forEach(([m, x, z, r], i) => { const p = papel(K, m); p.rotation.set(-Math.PI / 2, 0, r); p.position.set(x, Y + 0.019 + i * 0.001, z); g.add(p); });
  for (let i = 0; i < 6; i++) g.add(ubic(caja(K, 0.1, 0.006, 0.13, i % 2 ? '#fbf8f0' : '#f1ead8', ST), -0.23, Y + 0.02 + i * 0.006, -0.08, 0, 0.05 * (i % 3)));
  g.add(ubic(caja(K, 0.11, 0.008, 0.008, '#d23a2a', ST), 0.12, Y + 0.022, 0.12, 0, 0.6));       // el lápiz rojo
  // la lupa, sobre un papel
  const lu = grupo(g, 0.03, Y + 0.025, 0.11, 0.8);
  const aro = K.malla(K.toro(0.04, 0.008, Math.PI * 2, 0.6), '#5b6168', ST); aro.rotation.x = Math.PI / 2; lu.add(aro);
  lu.add(ubic(new THREE.Mesh(K.cilindro(0.036, 0.036, 0.004, 14), K.mat(FT.vidrio, { transparent: true, opacity: 0.55 })), 0, 0, 0));
  lu.add(ubic(caja(K, 0.08, 0.016, 0.016, '#2c2c2c', ST), 0.08, 0, 0));
  // la lámpara de escritorio
  const la = grupo(g, 0.22, Y + 0.018, -0.1, -0.6);
  la.add(ubic(cil(K, 0.05, 0.055, 0.02, 12, '#41709c', O(0.0015)), 0, 0.01, 0));
  const b1 = caja(K, 0.015, 0.2, 0.015, '#41709c', ST); b1.position.set(0, 0.11, 0.03); b1.rotation.x = 0.3; la.add(b1);
  const b2 = caja(K, 0.015, 0.16, 0.015, '#41709c', ST); b2.position.set(0, 0.24, 0.1); b2.rotation.x = 1.2; la.add(b2);
  const pa = K.malla(K.cono(0.055, 0.08, 12), '#41709c', O(0.0015)); pa.position.set(0, 0.25, 0.18); pa.rotation.x = 0.5; la.add(pa);
  la.add(ubic(new THREE.Mesh(K.esfera(0.022, 0.5), brillo('#fff2c4')), 0, 0.225, 0.19));
  // el piso de quien revisa
  const pi = grupo(g, 0, 0, -0.32);
  pi.add(ubic(cil(K, 0.11, 0.1, 0.035, 12, FT.madera, O(0.0015)), 0, 0.22, 0)); [0, 1, 2].forEach(i => { const a = i * 2.1, p = caja(K, 0.02, 0.22, 0.02, FT.maderaD, ST); p.position.set(Math.cos(a) * 0.07, 0.11, Math.sin(a) * 0.07); g.add(p); p.position.add(pi.position); });
  return g;
}
function corcho(K) {
  const g = new THREE.Group(), W = 0.6, H = 0.42;
  [-1, 1].forEach(l => g.add(ubic(caja(K, 0.04, 1.02, 0.04, FT.maderaD, O(0.002)), l * (W / 2 + 0.01), 0.51, -0.02)));
  g.add(ubic(caja(K, W + 0.05, H + 0.05, 0.03, FT.maderaD, O(0.0025)), 0, 0.76, 0));
  g.add(ubic(caja(K, W, H, 0.03, '#c99a64', ST), 0, 0.76, 0.006));
  [['no', -0.2, 0.86, 0.1], ['si', -0.05, 0.8, -0.08], ['no', 0.1, 0.88, 0.05], ['si', 0.22, 0.78, 0.12], ['no', -0.14, 0.66, -0.06], ['no', 0.06, 0.66, 0.08], ['si', 0.21, 0.63, -0.1]].forEach(([m, x, y, r]) => {
    const p = papel(K, m, 0.1, 0.13); p.position.set(x, y, 0.024); p.rotation.z = r; g.add(p);
    g.add(ubic(esf(K, 0.01, m === 'no' ? '#d23a2a' : '#41709c', ST), x, y + 0.055, 0.03));
  });
  return g;
}
export function biblioteca(K, n) {
  const B = A.biblioteca, P = pieza(B), G = new THREE.Group(), TZ = { x: 1.58, z: -0.4 }; poner(P, B, G, 0, 0);
  G.add(ubic(quiosco(K), 0.5, 0, -0.3, 0, 0.35));
  P.toc = [{ x: B.x + 0.5, y: B.y - 0.3, k: 'bibliotecaFu' }];
  P.asientos = [];
  if (n >= 1) { G.add(ubic(KM.pabellon(K, { cartel: [-0.95, 0.62] }), -1.0, 0, -0.72, 0, 0.15)); P.toc.push({ x: B.x - 1.0, y: B.y - 0.72, k: 'bibliotecaFu' }); }
  if (n >= 2) {   // la terraza: la tarima, las reposeras, los estantes de afuera con su alero y una mesita
    const T = grupo(G, TZ.x, 0, TZ.z);
    T.add(ubic(K.malla(K.caja(1.4, 0.06, 0.9), KM.matRep(K, 'tablas', KM.texTablas(), 3, 1), O(0.003)), 0, 0.03, 0));
    T.add(ubic(caja(K, 1.44, 0.04, 0.05, FT.maderaD, O(0.0015)), 0, 0.02, 0.46)); T.add(ubic(caja(K, 0.4, 0.03, 0.14, FT.maderaL, O(0.0015)), -0.4, 0.015, 0.52));
    [[-0.5, 0.2, 'rayasA', 0.55], [-0.1, 0.24, 'rayasB', 0.45]].forEach(([x, z, t, ry]) => T.add(ubic(reposera(K, t), x, 0.06, z, 0, ry)));
    const mi = grupo(T, -0.3, 0.06, 0.32); mi.add(ubic(cil(K, 0.07, 0.07, 0.02, 12, FT.maderaL, O(0.0015)), 0, 0.2, 0)); mi.add(ubic(cil(K, 0.015, 0.03, 0.2, 6, FT.maderaD, ST), 0, 0.1, 0));
    mi.add(ubic(cil(K, 0.02, 0.018, 0.04, 8, '#c64a30', ST), 0.02, 0.23, 0.01)); mi.add(ubic(caja(K, 0.07, 0.015, 0.05, FT.libro[1], ST), -0.02, 0.217, -0.02, 0, 0.3));
    [-0.48, -0.04].forEach((x, i) => T.add(ubic(KM.estante(K, 0.42, 0.5, 90 + i), x, 0.06, -0.34)));
    const al = caja(K, 1.0, 0.035, 0.26, FT.chapaV, O(0.002)); al.position.set(-0.26, 0.66, -0.3); al.rotation.x = 0.22; T.add(al);
    [-0.74, 0.22].forEach(x => T.add(ubic(caja(K, 0.035, 0.6, 0.035, FT.maderaD, O(0.0015)), x, 0.36, -0.2)));
    T.add(ubic(KM.tiesto(K, 0, 0, FT.pasto), 0.6, 0.06, 0.34));
    P.asientos.push(asiento(B, TZ.x - 0.5, TZ.z + 0.2, TZ.x + 0.6, TZ.z + 1.3, 0.16), asiento(B, TZ.x - 0.1, TZ.z + 0.24, TZ.x + 0.6, TZ.z + 1.3, 0.16));
  }
  if (n >= 3) {   // la mesa de revisión, en la punta de la terraza, y el corcho de las respuestas inventadas
    const MR = { x: TZ.x + 0.42, z: TZ.z + 0.0, ry: 0.25 };
    G.add(ubic(mesaRevision(K), MR.x, 0.06, MR.z, 0, MR.ry));
    G.add(ubic(corcho(K), TZ.x + 0.45, 0, TZ.z - 0.68, 0, 0.3));
    P.asientos.push(asiento(B, MR.x - 0.32 * Math.sin(MR.ry), MR.z - 0.32 * Math.cos(MR.ry), MR.x, MR.z, 0.28));
  }
  return P;
}

/* ================= 91 · EL EXAMEN QUE CAMBIA: la defensa =================
   El eco de Kaifeng y de Atenas: cuando la IA aprueba los exámenes escritos, se evalúa conversando, con el trabajo a la
   vista. Las gradas son una medialuna que se abre hacia la cámara (así se ven las caras del público). Etapas: 0 tres gradas
   de piedra · 1 el tablado de madera con su atril · 2 los proyectos expuestos (los paneles en caballetes con las preguntas de
   los estudiantes, el volcán, el autito solar y la planta en su caja de vidrio) · 3 el toldo de tela, las plantas y los
   bancos para el público. */
const GRADAS_EX = [[0.8, 1.02, 0.13], [1.02, 1.24, 0.26], [1.24, 1.46, 0.39]], ARCO_EX = [135, 315];
const PREGUNTAS = [
  ['¿Por qué el cielo', 'es azul?', c => { c.fillStyle = '#f2b441'; c.beginPath(); c.arc(30, 92, 13, 0, Math.PI * 2); c.fill(); ['#c64a30', '#f2b441', '#5f9a6a', '#41709c', '#8a5a8a'].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.moveTo(46, 92); c.lineTo(88, 72 + i * 8); c.stroke(); }); }],
  ['¿Cuánto mide la', 'sombra del árbol?', c => { c.fillStyle = '#5f9a6a'; c.beginPath(); c.arc(34, 76, 14, 0, Math.PI * 2); c.fill(); c.fillStyle = '#8a6a48'; c.fillRect(31, 86, 6, 22); c.fillStyle = 'rgba(60,60,60,0.35)'; c.beginPath(); c.moveTo(37, 108); c.lineTo(90, 108); c.lineTo(37, 100); c.fill(); c.strokeStyle = '#c64a30'; c.lineWidth = 2; c.beginPath(); c.moveTo(37, 112); c.lineTo(90, 112); c.stroke(); }],
  ['¿Qué come', 'una célula?', c => { c.fillStyle = '#cfe0a8'; c.strokeStyle = '#5f9a6a'; c.lineWidth = 3; c.beginPath(); c.ellipse(60, 90, 32, 20, 0.2, 0, Math.PI * 2); c.fill(); c.stroke(); c.fillStyle = '#8a5a8a'; c.beginPath(); c.arc(64, 88, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = '#f2b441'; [[40, 84], [78, 98], [52, 100]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 2); c.fill(); }); }],
];
function caballete(K, k) {
  const g = new THREE.Group();
  [-1, 1].forEach(l => { const p = caja(K, 0.03, 0.95, 0.03, FT.madera, O(0.0015)); p.position.set(l * 0.17, 0.46, 0.04); p.rotation.set(-0.1, 0, l * 0.12); g.add(p); });
  const tr = caja(K, 0.025, 0.9, 0.025, FT.madera, ST); tr.position.set(0, 0.43, -0.14); tr.rotation.x = 0.3; g.add(tr);
  g.add(ubic(caja(K, 0.42, 0.02, 0.06, FT.maderaD, ST), 0, 0.36, 0.06));
  g.add(ubic(caja(K, 0.4, 0.5, 0.02, '#f3efe6', O(0.002)), 0, 0.62, 0.04));
  const [t1, t2, dibuja] = PREGUNTAS[k];
  const tx = cartel(K, 'fu-poster' + k, 120, 150, (c, w, h) => {
    c.fillStyle = '#fbf8f0'; c.fillRect(0, 0, w, h); c.fillStyle = ['#41709c', '#5f9a6a', '#8a5a8a'][k]; c.fillRect(0, 0, w, 10);
    c.fillStyle = '#2e2a25'; c.font = `700 14px ${LETRA}`; c.textAlign = 'center'; c.fillText(t1, w / 2, 30); c.fillText(t2, w / 2, 47);
    c.save(); c.translate(0, 8); dibuja(c); c.restore();
    c.fillStyle = '#8d8577'; for (let i = 0; i < 3; i++) c.fillRect(14, 128 + i * 6, 92 - i * 18, 2);
  }, 0.38, 0.475);
  g.add(ubic(tx, 0, 0.62, 0.051));
  return g;
}
function mesaProyectos(K) {
  const g = new THREE.Group(), Y = 0.36;
  g.add(ubic(caja(K, 0.82, 0.03, 0.36, '#f3efe6', O(0.002)), 0, Y, 0));
  g.add(ubic(caja(K, 0.83, 0.12, 0.37, FT.turquesa, ST), 0, Y - 0.06, 0));                       // el mantel
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(ubic(caja(K, 0.03, Y - 0.1, 0.03, FT.maderaD, ST), a * 0.37, (Y - 0.1) / 2, b * 0.15)));
  // el volcán: la base verde, el cono, el cráter y la lava
  const vo = grupo(g, -0.27, Y + 0.015, 0);
  vo.add(ubic(caja(K, 0.24, 0.02, 0.22, '#7fa64a', O(0.0015)), 0, 0.01, 0));
  vo.add(ubic(cil(K, 0.03, 0.11, 0.16, 10, '#8a6a48', O(0.002)), 0, 0.1, 0));
  vo.add(ubic(cil(K, 0.032, 0.026, 0.02, 10, '#c64a30', ST), 0, 0.185, 0));
  [0.5, 2.3, 4.0].forEach(a => { const la = caja(K, 0.025, 0.1, 0.012, '#e8743a', ST); la.position.set(Math.cos(a) * 0.055, 0.13, Math.sin(a) * 0.055); la.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6); vo.add(la); });
  // el autito solar
  const au = grupo(g, 0.0, Y + 0.015, 0.02, 0.4);
  au.add(ubic(caja(K, 0.2, 0.05, 0.11, FT.ocre, O(0.0015)), 0, 0.05, 0));
  [-1, 1].forEach(e => [-1, 1].forEach(l => { const r = cil(K, 0.025, 0.025, 0.02, 10, '#2c2c2c', ST); r.rotation.x = Math.PI / 2; r.position.set(e * 0.065, 0.025, l * 0.06); au.add(r); }));
  const pv = KM.panelSolar(K, 0.18, 0.1, 0.25); pv.position.set(0, 0.0, 0); au.add(pv);
  // la planta en su caja de vidrio
  const te = grupo(g, 0.27, Y + 0.015, 0);
  te.add(ubic(caja(K, 0.16, 0.04, 0.16, '#7a5a3c', ST), 0, 0.02, 0));
  te.add(ubic(cil(K, 0.008, 0.008, 0.1, 5, '#5f8f3e', ST), 0, 0.09, 0));
  [[0, 0.15, 0, 0.04], [0.03, 0.12, 0.02, 0.03], [-0.03, 0.11, -0.01, 0.03]].forEach(([x, y, z, r]) => te.add(ubic(esf(K, r, FT.pastoD, ST), x, y, z)));
  te.add(ubic(caja(K, 0.17, 0.2, 0.17, FT.vidrio, { transparent: true, opacity: 0.35, depthWrite: false, grosor: 0.0015 }), 0, 0.1, 0));
  te.add(ubic(caja(K, 0.18, 0.012, 0.18, FT.marco, ST), 0, 0.2, 0));
  return g;
}
const planta = (K, s = 1, c = FT.pastoD) => { const g = new THREE.Group();
  g.add(ubic(cil(K, 0.1 * s, 0.075 * s, 0.17 * s, 12, '#c9775a', O(0.002)), 0, 0.085 * s, 0)); g.add(ubic(cil(K, 0.105 * s, 0.105 * s, 0.025 * s, 12, '#b5674c', ST), 0, 0.17 * s, 0));
  [[0, 0.3, 0, 0.13, c], [0.07, 0.26, 0.04, 0.1, FT.pasto], [-0.06, 0.24, -0.03, 0.1, '#5f8f3e'], [0.01, 0.38, -0.01, 0.08, FT.pastoL]].forEach(([x, y, z, r, col]) => g.add(ubic(esf(K, r * s, col, O(0.002)), x * s, y * s, z * s)));
  return g; };
export function examen(K, n) {
  const B = A.examen, P = pieza(B), G = new THREE.Group(); poner(P, B, G, 0, 0);
  const mp = KM.matRep(K, 'piedra', texPiedra(), 3, 3);
  GRADAS_EX.forEach(([r0, r1, h], i) => {
    G.add(ubic(K.malla(KM.sectorGeo(r0, r1, deg(ARCO_EX[0]), deg(ARCO_EX[1]), h, 30), mp, O(0.003)), 0, 0, 0));
    G.add(ubic(K.malla(KM.sectorGeo(r0 - 0.02, r0 + 0.08, deg(ARCO_EX[0]), deg(ARCO_EX[1]), 0.02, 30), ['#ece6da', '#e6dfd1', '#efe9de'][i], O(0.0015)), 0, h, 0));   // la arista clara
  });
  const rr = azar(9101), pasto = [];   // el pasto que crece al pie y entre las piedras
  for (let i = 0; i < 40; i++) { const a = deg(ARCO_EX[0] - 6 + rr() * 192), d = rr() < 0.5 ? 0.74 + rr() * 0.05 : 1.48 + rr() * 0.12; pasto.push([Math.cos(a) * d, 0, Math.sin(a) * d]); }
  G.add(KM.matas(K, pasto, FT.pastoD));
  P.asientos = [];
  GRADAS_EX.forEach(([r0, r1, h]) => { for (let a = 150; a <= 300; a += 30) { const t = deg(a), d = (r0 + r1) / 2 + 0.02; P.asientos.push(asiento(B, Math.cos(t) * d, Math.sin(t) * d, 0, 0, h)); } });
  P.toc = [{ x: B.x - 0.85, y: B.y - 0.85, k: 'examenFu' }];
  if (n >= 1) {   // el tablado con su escalón y el atril
    const T = grupo(G, 0.05, 0, 0.05, Math.PI / 4);
    T.add(ubic(K.malla(K.caja(0.96, 0.1, 0.58), KM.matRep(K, 'tablas', KM.texTablas(), 2, 1), O(0.003)), 0, 0.05, 0));
    T.add(ubic(caja(K, 1.0, 0.03, 0.62, FT.maderaD, O(0.002)), 0, 0.012, 0));
    T.add(ubic(caja(K, 0.44, 0.05, 0.14, FT.maderaL, O(0.002)), 0.18, 0.025, 0.36));
    const at = grupo(T, -0.28, 0.1, -0.12);
    at.add(ubic(caja(K, 0.16, 0.025, 0.12, FT.maderaD, ST), 0, 0.012, 0));
    at.add(ubic(caja(K, 0.06, 0.48, 0.06, FT.madera, O(0.002)), 0, 0.25, 0));
    const ta = caja(K, 0.3, 0.025, 0.22, FT.madera, O(0.002)); ta.position.set(0, 0.52, 0.02); ta.rotation.x = 0.4; at.add(ta);
    const ho = caja(K, 0.12, 0.006, 0.15, '#fbf8f0', ST); ho.position.set(0.02, 0.538, 0.02); ho.rotation.x = 0.4; at.add(ho);
    const mi = caja(K, 0.008, 0.14, 0.008, '#2c2c2c', ST); mi.position.set(-0.1, 0.6, 0.06); mi.rotation.x = 0.5; at.add(mi); at.add(ubic(esf(K, 0.016, '#2c2c2c', ST), -0.1, 0.67, 0.1));
    P.toc.push({ x: B.x + 0.05, y: B.y + 0.05, k: 'examenFu' });
  }
  if (n >= 2) {   // los proyectos: los caballetes a la izquierda y la mesa a la derecha
    G.add(ubic(caballete(K, 0), -0.62, 0, 1.12, 0, 1.0));
    G.add(ubic(caballete(K, 1), -0.16, 0, 1.3, 0, 0.62));
    G.add(ubic(caballete(K, 2), 1.32, 0, -0.18, 0, 0.95));
    G.add(ubic(mesaProyectos(K), 1.42, 0, -0.78, 0, -0.62));
  }
  if (n >= 3) {   // el toldo sobre las gradas del fondo, las plantas y los bancos
    const TA = [150, 300], H = 1.42, mt = KM.matRep(K, 'toldo', texRayas('fu-toldo', '#f3efe6', '#c8664a'), 4, 4);
    G.add(ubic(K.malla(KM.sectorGeo(0.92, 1.66, deg(TA[0]), deg(TA[1]), 0.025, 24), mt, O(0.002)), 0, H, 0));
    for (let a = TA[0]; a <= TA[1] + 0.1; a += 7.5) { const t = deg(a), v = K.malla(K.cono(0.035, 0.07, 3), (a / 7.5) % 2 ? '#c8664a' : '#f3efe6', ST); v.rotation.x = Math.PI; v.position.set(Math.cos(t) * 0.93, H - 0.035, Math.sin(t) * 0.93); G.add(v); }
    [150, 200, 250, 300].forEach(a => { const t = deg(a), x = Math.cos(t) * 1.7, z = Math.sin(t) * 1.7;
      G.add(ubic(cil(K, 0.025, 0.03, H + 0.06, 8, FT.maderaD, O(0.002)), x, (H + 0.06) / 2, z));
      G.add(ubic(esf(K, 0.035, FT.madera, ST), x, H + 0.07, z));
      G.add(hilo(K, [V(x, H, z), V(x * 1.25, 0.01, z * 1.25)], 0.004, '#d8cdb6')); });
    [[150, 1.0], [300, 1.0]].forEach(([a, d]) => { const t = deg(a); G.add(hilo(K, cuerda(V(Math.cos(t) * 0.93, H, Math.sin(t) * 0.93), V(Math.cos(t) * 1.7, H + 0.02, Math.sin(t) * 1.7), 0.01, 4), 0.006, '#d8cdb6')); });
    [[-1.15, 0.92, 1.1, FT.pastoD], [0.92, -1.2, 1.1, '#5f8f3e'], [-1.55, -0.55, 1.25, FT.pastoD], [-0.6, -1.62, 1.25, FT.pasto]].forEach(([x, z, s, c]) => G.add(ubic(planta(K, s, c), x, 0, z)));
    [[-0.32, 0.84], [0.86, -0.36]].forEach(([x, z]) => { const ry = Math.atan2(0.05 - x, 0.05 - z); G.add(ubic(KM.banco(K, 0.62), x, 0, z, 0, ry));
      [-1, 1].forEach(l => P.asientos.push(asiento(B, x + l * 0.16 * Math.cos(ry), z - l * 0.16 * Math.sin(ry), 0.05, 0.05, 0.2))); });
  }
  return P;
}

/* ================= 92 · LA PREGUNTA ABIERTA: el mirador =================
   En la esquina del fondo, mirando la niebla (lo que todavía no sabemos). Es lo más alto del valle después de la escuela.
   Se arma con su frente hacia la cámara y su espalda hacia la niebla. Etapas: 0 la plataforma de madera con baranda ·
   1 la torre de dos niveles con su escalera (~1,6) · 2 el telescopio arriba, los binoculares de la plataforma y el banco ·
   3 el faro chico arriba (P.faro: la luz cálida de la noche) y la veleta. */
function baranda(K, padre, a, b, y, alto = 0.3, paso = 0.16) {
  const L = Math.hypot(b.x - a.x, b.z - a.z), ry = -Math.atan2(b.z - a.z, b.x - a.x), n = Math.max(1, Math.round(L / paso));
  const g = grupo(padre, (a.x + b.x) / 2, y, (a.z + b.z) / 2, ry);
  g.add(ubic(caja(K, L + 0.04, 0.03, 0.04, FT.maderaL, O(0.0015)), 0, alto, 0));
  g.add(ubic(caja(K, L, 0.02, 0.025, FT.madera, ST), 0, alto * 0.5, 0));
  for (let i = 0; i <= n; i++) g.add(ubic(caja(K, 0.03, alto, 0.03, FT.maderaD, i % n ? ST : O(0.0015)), -L / 2 + i * L / n, alto / 2, 0));
  return g;
}
function cruz(K, padre, a, b, y0, y1, color = FT.madera) {   // las riostras en X entre dos postes, de y0 a y1
  const L = Math.hypot(b.x - a.x, b.z - a.z), H = y1 - y0, d = Math.hypot(L, H), ang = Math.atan2(H, L), ry = -Math.atan2(b.z - a.z, b.x - a.x);
  const g = grupo(padre, (a.x + b.x) / 2, (y0 + y1) / 2, (a.z + b.z) / 2, ry);
  [-1, 1].forEach(l => { const m = caja(K, d, 0.035, 0.025, color, O(0.0012)); m.rotation.z = l * ang; g.add(m); });
}
export function mirador(K, n) {
  const B = A.mirador, P = pieza(B), M = new THREE.Group(); poner(P, B, M, 0, 0, Math.PI / 4);
  const Y0 = 0.32, Y1 = 0.8, Y2 = 1.26, mt = KM.matRep(K, 'tablas', KM.texTablas(), 2, 1);
  // la plataforma: los pilotes, la tarima, la escalera de adelante y la baranda de atrás y de los lados
  for (const x of [-0.47, 0, 0.47]) for (const z of [-0.82, -0.34, 0.12]) { M.add(ubic(caja(K, 0.06, Y0, 0.06, FT.maderaD, O(0.002)), x, Y0 / 2, z)); M.add(ubic(caja(K, 0.1, 0.04, 0.1, FT.hormigonD, ST), x, 0.02, z)); }
  M.add(ubic(K.malla(K.caja(1.04, 0.05, 1.04), mt, O(0.003)), 0, Y0, -0.35));
  M.add(ubic(caja(K, 1.08, 0.04, 0.05, FT.maderaD, O(0.0015)), 0, Y0 - 0.02, 0.18));
  [[0.24, 0.21], [0.4, 0.105]].forEach(([z, y]) => M.add(ubic(caja(K, 0.4, 0.04, 0.16, FT.maderaL, O(0.0015)), 0, y, z)));
  const c = [V(-0.5, 0, 0.15), V(-0.5, 0, -0.85), V(0.5, 0, -0.85), V(0.5, 0, 0.15)];
  baranda(K, M, c[0], c[1], Y0 + 0.025); baranda(K, M, c[1], c[2], Y0 + 0.025); baranda(K, M, c[2], c[3], Y0 + 0.025);
  const mx = (px, pz) => ({ x: B.x + (px + pz) / Math.SQRT2, y: B.y + (pz - px) / Math.SQRT2 });   // del marco del mirador a la grilla
  P.toc = [{ ...mx(0, -0.35), k: 'miradorFu' }];
  P.asientos = [];
  if (n >= 1) {   // la torre: cuatro postes, dos tarimas, las riostras, la escalera y la escala
    const T = [V(-0.3, 0, -0.85), V(0.3, 0, -0.85), V(0.3, 0, -0.25), V(-0.3, 0, -0.25)];
    T.forEach(p => M.add(ubic(caja(K, 0.07, Y2 + 0.32, 0.07, FT.maderaD, O(0.0025)), p.x, (Y2 + 0.32) / 2, p.z)));
    [Y1, Y2].forEach(y => { M.add(ubic(K.malla(K.caja(0.7, 0.05, 0.7), mt, O(0.003)), 0, y, -0.55)); M.add(ubic(caja(K, 0.74, 0.06, 0.06, FT.maderaD, ST), 0, y - 0.04, -0.2)); });
    cruz(K, M, T[0], T[1], Y0 + 0.03, Y1 - 0.03); cruz(K, M, T[0], T[3], Y0 + 0.03, Y1 - 0.03); cruz(K, M, T[1], T[2], Y0 + 0.03, Y1 - 0.03);
    cruz(K, M, T[0], T[1], Y1 + 0.03, Y2 - 0.03); cruz(K, M, T[0], T[3], Y1 + 0.03, Y2 - 0.03); cruz(K, M, T[1], T[2], Y1 + 0.03, Y2 - 0.03);
    const t2 = [V(-0.34, 0, -0.21), V(-0.34, 0, -0.89), V(0.34, 0, -0.89), V(0.34, 0, -0.21)];
    baranda(K, M, t2[0], t2[1], Y2 + 0.025, 0.3, 0.12); baranda(K, M, t2[1], t2[2], Y2 + 0.025, 0.3, 0.12); baranda(K, M, t2[2], t2[3], Y2 + 0.025, 0.3, 0.12);
    baranda(K, M, V(-0.34, 0, -0.21), V(0.12, 0, -0.21), Y2 + 0.025, 0.3, 0.12);
    baranda(K, M, t2[1], t2[2], Y1 + 0.025, 0.28, 0.17); baranda(K, M, t2[0], t2[1], Y1 + 0.025, 0.28, 0.17);
    // la escalera, por el lado derecho: de la plataforma a la primera tarima
    const ne = 5;
    for (let i = 0; i < ne; i++) { const u = (i + 0.5) / ne; M.add(ubic(caja(K, 0.17, 0.03, 0.1, FT.maderaL, O(0.0012)), 0.42, Y0 + (Y1 - Y0) * u, -0.02 - 0.5 * u)); }
    [0.34, 0.5].forEach(x => { const z = caja(K, 0.025, 0.06, Math.hypot(0.5, Y1 - Y0) + 0.08, FT.maderaD, O(0.0012)); z.position.set(x, (Y0 + Y1) / 2 + 0.01, -0.27); z.rotation.x = Math.atan2(Y1 - Y0, 0.5); M.add(z); });
    const pa = caja(K, 0.02, 0.02, Math.hypot(0.5, Y1 - Y0) + 0.06, FT.maderaL, ST); pa.position.set(0.51, (Y0 + Y1) / 2 + 0.28, -0.27); pa.rotation.x = Math.atan2(Y1 - Y0, 0.5); M.add(pa);
    // la escala, de la primera tarima a la de arriba
    [0.17, 0.29].forEach(x => M.add(ubic(caja(K, 0.025, Y2 - Y1 + 0.12, 0.025, FT.maderaD, O(0.0012)), x, (Y1 + Y2) / 2 + 0.04, -0.17)));
    for (let i = 1; i < 5; i++) M.add(ubic(caja(K, 0.13, 0.018, 0.018, FT.maderaL, ST), 0.23, Y1 + i * (Y2 - Y1) / 5, -0.17));
    P.cima = mx(0, -0.55); P.cima.alto = Y2 + 0.025;
  }
  if (n >= 2) {   // el telescopio arriba, los binoculares de la plataforma y el banco que mira a la niebla
    const te = grupo(M, -0.05, Y2 + 0.025, -0.6);
    [0, 1, 2].forEach(i => { const a = i * 2.1 + 0.4, p = caja(K, 0.018, 0.36, 0.018, '#5b6168', ST); p.position.set(Math.cos(a) * 0.08, 0.17, Math.sin(a) * 0.08); p.rotation.set(Math.sin(a) * 0.22, 0, -Math.cos(a) * 0.22); te.add(p); });
    const tu = grupo(te, 0, 0.36, 0); tu.rotation.x = 0.3;
    const cu = cil(K, 0.04, 0.05, 0.5, 14, '#f3efe6', O(0.002)); cu.rotation.x = Math.PI / 2; tu.add(cu);
    const an = cil(K, 0.056, 0.056, 0.05, 14, '#41709c', O(0.0015)); an.rotation.x = Math.PI / 2; an.position.z = -0.24; tu.add(an);
    const oc = cil(K, 0.016, 0.016, 0.08, 8, '#2c2c2c', ST); oc.rotation.x = Math.PI / 2; oc.position.z = 0.28; tu.add(oc);
    const bu = cil(K, 0.014, 0.014, 0.16, 8, '#5b6168', ST); bu.rotation.x = Math.PI / 2; bu.position.set(0.05, 0.05, -0.02); tu.add(bu);
    const bi = grupo(M, -0.36, Y0 + 0.025, 0.02);
    bi.add(ubic(cil(K, 0.03, 0.04, 0.42, 10, '#5e8c6c', O(0.002)), 0, 0.21, 0)); bi.add(ubic(cil(K, 0.08, 0.09, 0.03, 12, '#5e8c6c', ST), 0, 0.015, 0));
    bi.add(ubic(caja(K, 0.16, 0.09, 0.1, '#5e8c6c', O(0.0015)), 0, 0.47, 0));
    [-1, 1].forEach(l => { const o = cil(K, 0.026, 0.03, 0.08, 10, '#3f6a4e', ST); o.rotation.x = Math.PI / 2; o.position.set(l * 0.045, 0.47, -0.08); bi.add(o); });
    M.add(ubic(KM.banco(K, 0.62), 0.78, 0, 0.36, 0, Math.PI));
    [-1, 1].forEach(l => P.asientos.push({ ...mx(0.78 + l * 0.15, 0.36), mira: mx(0, -6), alto: 0.18 }));
  }
  if (n >= 3) {   // el faro chico en la esquina de atrás, sobre su mástil, y la veleta en la otra
    const F = grupo(M, -0.3, 0, -0.85);
    F.add(ubic(caja(K, 0.06, 0.2, 0.06, FT.maderaD, O(0.002)), 0, Y2 + 0.32 + 0.1, 0));
    [-1, 1].forEach(l => { const r = caja(K, 0.025, 0.3, 0.025, FT.madera, ST); r.position.set(l * 0.09, Y2 + 0.4, 0.09); r.rotation.set(0.5, 0, -l * 0.5); F.add(r); });   // las ménsulas
    const fy = Y2 + 0.52;
    F.add(ubic(cil(K, 0.15, 0.15, 0.03, 8, FT.maderaD, O(0.002)), 0, fy - 0.01, 0));                     // la galería, con su barandilla
    F.add(ubic(K.malla(K.toro(0.15, 0.008, Math.PI * 2, 0.6), '#2c2c2c', ST), 0, fy + 0.07, 0, Math.PI / 2));
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; F.add(ubic(caja(K, 0.01, 0.07, 0.01, '#2c2c2c', ST), Math.cos(a) * 0.15, fy + 0.035, Math.sin(a) * 0.15)); }
    F.add(ubic(cil(K, 0.11, 0.1, 0.06, 12, '#b8503f', O(0.002)), 0, fy + 0.035, 0));
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; F.add(ubic(caja(K, 0.014, 0.2, 0.014, '#2c2c2c', ST), Math.cos(a) * 0.095, fy + 0.165, Math.sin(a) * 0.095)); }
    F.add(ubic(cil(K, 0.092, 0.092, 0.2, 12, FT.vidrio, { transparent: true, opacity: 0.4, depthWrite: false, grosor: 0.0015 }), 0, fy + 0.165, 0));
    const faro = grupo(F, 0, fy + 0.16, 0); faro.userData.vivo = true; P.faro = faro;
    faro.add(new THREE.Mesh(K.esfera(0.055, 0.6), brillo('#ffd27a')));
    faro.add(new THREE.Mesh(K.esfera(0.1, 0.6), brillo('#ffcf73', { transparent: true, opacity: 0.3, depthWrite: false })));
    F.add(ubic(K.malla(K.cono(0.13, 0.12, 12), '#b8503f', O(0.002)), 0, fy + 0.325, 0));
    F.add(ubic(esf(K, 0.026, '#e0b44a', ST), 0, fy + 0.4, 0));
    // el panel que lo alimenta, sobre la baranda del fondo, y su cable
    const pv = KM.panelSolar(K, 0.42, 0.26, 0.6); pv.position.set(0, Y2 + 0.33, -0.86); pv.rotation.y = Math.PI; M.add(pv);
    M.add(hilo(K, cuerda(V(-0.1, Y2 + 0.4, -0.88), V(-0.3, fy, -0.85), 0.06, 6), 0.006, '#2c2c2c'));
    // la veleta: el mástil, la cruz de los rumbos y la flecha
    const W = grupo(M, 0.3, 0, -0.85);
    W.add(ubic(caja(K, 0.03, 0.42, 0.03, '#5b6168', O(0.0015)), 0, Y2 + 0.32 + 0.21, 0));
    const wy = Y2 + 0.32 + 0.36;
    [0, Math.PI / 2].forEach(r => W.add(ubic(caja(K, 0.26, 0.012, 0.012, '#5b6168', ST), 0, wy, 0, 0, r)));
    [['N', 0, -0.15], ['S', 0, 0.15], ['E', 0.15, 0], ['O', -0.15, 0]].forEach(([l, x, z]) => { const s = cartel(K, 'fu-rumbo' + l, 32, 32, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#3a3a3a'; c.font = `800 28px ${LETRA}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(l, 16, 17); }, 0.07, 0.07); s.material.transparent = true; s.material.side = THREE.DoubleSide; W.add(ubic(s, x, wy + 0.045, z)); });
    const fl = grupo(W, 0, wy + 0.13, 0, 0.7);
    fl.add(ubic(caja(K, 0.4, 0.016, 0.016, '#2c2c2c', ST), 0, 0, 0));
    const pu = K.malla(K.cono(0.04, 0.09, 4), '#2c2c2c', ST); pu.rotation.z = -Math.PI / 2; pu.position.x = 0.23; fl.add(pu);
    // el gallo de la veleta, recortado en chapa
    const ga = new THREE.Shape([[-0.2, 0], [-0.08, 0], [-0.05, 0.05], [0.0, 0.06], [0.04, 0.11], [0.08, 0.12], [0.1, 0.1], [0.08, 0.08], [0.09, 0.05], [0.05, 0.03], [0.04, 0], [-0.02, 0.0], [-0.12, 0.13], [-0.2, 0.12], [-0.16, 0.05]].map(([x, y]) => new THREE.Vector2(x, y)));
    fl.add(ubic(K.malla(propia(new THREE.ShapeGeometry(ga)), K.mat('#2c2c2c', { side: THREE.DoubleSide }), ST), -0.02, 0.01, 0));
    W.add(ubic(esf(K, 0.024, '#e0b44a', ST), 0, wy + 0.3, 0));
  }
  return P;
}

export const PIEZAS = [
  { id: 'escuela', i: 87, crear: escuela },
  { id: 'tutor', i: 88, crear: tutor },
  { id: 'llegada', i: 89, crear: llegada },
  { id: 'biblioteca', i: 90, crear: biblioteca },
  { id: 'examen', i: 91, crear: examen },
  { id: 'mirador', i: 92, crear: mirador },
];
