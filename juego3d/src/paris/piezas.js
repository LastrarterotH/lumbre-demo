/* ============================================================
   paris/piezas
   Los seis saberes de París en 3D, cada uno con sus etapas (la máxima del proyecto: subir de nivel se VE, con piezas nuevas;
   se audita por diff de píxeles en juego3d/qa.html): el pergamino (57), la campana (58), el scriptorium (59), la disputatio
   (60), la universidad (61) y la Sorbona (62). Más la gente de la época (los estudiantes con su tonsura y su capa, los
   maestros con el bonete, los canónigos de San Víctor de blanco, Hugo y Abelardo) y los faroles de la noche.
   Cada pieza devuelve { obj, anim, ancla, toc, actores } como las de las otras épocas (src/piezas.js).
   ============================================================ */
import * as THREE from 'three';
import { pieza, actor, texturaCanvas } from '../piezas.js';
import * as L from './lugares.js';
import { PA, tejado } from './monumentos.js';

const ubic = (m, x, y, z, rx = 0, ry = 0, rz = 0) => { m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx, ry, rz); return m; };
const caja = (K, w, h, d, color, o) => K.malla(K.caja(w, h, d), color, o);
const en = (P, obj, x, y, h = 0, ry = 0) => { obj.position.copy(P.en(x, y)); obj.position.y += h; obj.rotation.y = ry; P.obj.add(obj); return obj; };
const plano = (K, tex, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), K.matMapa(tex)); m.geometry.userData.propia = true; m.castShadow = true; return m; };

export const ANCLAS = {
  pergamino: { x: L.PERGAMINERO.x, y: L.PERGAMINERO.y }, campana: { x: L.CAMPANA.x, y: L.CAMPANA.y }, scriptorium: { x: 16.5, y: 8.2 },
  disputatio: { x: L.MONTANA.x, y: L.MONTANA.y }, universidad: { x: L.UNIVERSIDAD.x, y: L.UNIVERSIDAD.y }, sorbona: { x: L.SORBONA.x, y: L.SORBONA.y },
};

/* LA GENTE DE PARÍS. Los estudiantes: clérigos con la tonsura chica, la túnica larga y la capa con capucha (negra, parda,
   azul de pastel, roja de rubia), muchachos de catorce a veinte años venidos de toda Europa. Los maestros: la capa negra
   cerrada y el bonete redondo. Los canónigos de San Víctor: el hábito blanco, la tonsura ancha. */
export function estudiante(i, extra = {}) {
  return { piel: [0, 1, 0, 2, 1][i % 5], pelo: 'corto', colorPelo: ['#4a3424', '#7a5a34', '#2a1f18', '#b08a4a', '#5a3a24'][i % 5], tonsura: true,
    ropa: 'tunica', colorRopa: ['#5a4a3a', '#3f4a6a', '#6a4a3a', '#4a5a4a', '#7a6a52'][i % 5], orla: '#3a2e24', chal: undefined,
    capucha: ['#2a2622', '#5a4630', '#3f4f7a', '#8a3a2a'][i % 4], sinFlecos: true, ...extra };
}
export const MAESTRO = { piel: 1, pelo: 'corto', colorPelo: '#5a4a3a', tonsura: true, ropa: 'tunica', colorRopa: '#2a2622', orla: '#1e1c1a', chal: undefined, capucha: '#2a2622', bonete: '#1e1c1a', sinFlecos: true };
export const CANONIGO = { piel: 1, pelo: 'corto', colorPelo: '#8a8070', tonsura: 'ancha', ropa: 'tunica', colorRopa: '#ece6d6', orla: '#d8d0bc', chal: undefined, capucha: '#2a2622', sinFlecos: true };
export const HUGO = { ...CANONIGO, colorPelo: '#9a9286', barba: undefined };
export const ABELARDO = { piel: 1, pelo: 'corto', colorPelo: '#3a2a1e', tonsura: true, ropa: 'tunica', colorRopa: '#2a2a34', orla: '#1e1e26', chal: undefined, capucha: '#3a2430', sinFlecos: true };
export const ARTESANO = { piel: 1, pelo: 'revuelto', colorPelo: '#5a3a24', barba: '#5a3a24', ropa: 'corta', colorRopa: '#8a7452', orla: '#5a4a32', chal: '#c9b48a', sinFlecos: true };

/* ---------- utensilios ---------- */
export function farol(K) {   // el farol de la noche (en la puerta de los colegios y del Petit Pont), con su vela
  const g = new THREE.Group(); g.userData.vivo = true;
  g.add(ubic(K.malla(K.cilindro(0.012, 0.016, 0.42, 5), PA.hierro, { sinTinta: true }), 0, 0.21, 0));
  g.add(ubic(caja(K, 0.07, 0.08, 0.07, '#3a3632', { grosor: 0.002 }), 0, 0.46, 0));
  const llama = new THREE.Group(); llama.position.y = 0.46; g.add(llama); g.userData.llama = llama;
  llama.add(ubic(K.malla(K.esfera(0.026, 0.4), '#ffd27a', { sinTinta: true, sombra: false, emissive: '#ffb04a', emissiveIntensity: 1.2 }), 0, 0, 0));
  return g;
}
function atril(K, libro = true) {   // el atril inclinado del copista, con su banco
  const g = new THREE.Group();
  g.add(ubic(K.malla(K.cilindro(0.012, 0.016, 0.24, 5), PA.maderaD, { sinTinta: true }), 0, 0.12, 0));
  const t = caja(K, 0.2, 0.014, 0.15, PA.madera, { grosor: 0.002 }); t.position.y = 0.25; t.rotation.x = 0.45; g.add(t);
  if (libro) { const l = caja(K, 0.15, 0.008, 0.1, PA.pergamino, { grosor: 0.0012 }); l.position.set(0, 0.262, 0.004); l.rotation.x = 0.45; g.add(l); }
  g.add(ubic(caja(K, 0.14, 0.12, 0.1, PA.maderaD, { grosor: 0.002 }), 0, 0.06, 0.2));   // el banco
  return g;
}
function libroAbierto(K, w = 0.16) {
  const g = new THREE.Group(), tx = texturaCanvas(64, 32, (c, W, H) => {
    c.fillStyle = PA.pergamino; c.fillRect(0, 0, W, H); c.fillStyle = '#3a2e1e'; for (let y = 6; y < H - 3; y += 4) { c.fillRect(4, y, 24, 1.2); c.fillRect(36, y, 24, 1.2); }
    c.fillStyle = PA.rojo; c.fillRect(4, 4, 5, 6); c.fillStyle = PA.azul; c.fillRect(36, 4, 5, 6); c.fillStyle = '#a8916a'; c.fillRect(31, 0, 2, H);
  });
  const p = plano(K, tx, w, w / 2); p.rotation.x = -Math.PI / 2; p.position.y = 0.006; g.add(p);
  return g;
}
function banco(K, l = 0.5) { const g = new THREE.Group(); g.add(ubic(caja(K, l, 0.025, 0.09, PA.madera, { grosor: 0.002 }), 0, 0.08, 0)); [-1, 1].forEach(s => g.add(ubic(caja(K, 0.025, 0.08, 0.08, PA.maderaD, { sinTinta: true }), s * (l / 2 - 0.04), 0.04, 0))); return g; }
function paja(K, w, d) { const g = new THREE.Group(); g.add(ubic(caja(K, w, 0.012, d, PA.paja, { sinTinta: true, sombra: false }), 0, 0.006, 0)); for (let k = 0; k < Math.floor(w / 0.07); k++) g.add(ubic(caja(K, 0.04, 0.006, d * 0.8, '#bfa056', { sinTinta: true, sombra: false }), -w / 2 + 0.04 + k * 0.07, 0.013, (k % 3 - 1) * 0.02, 0, (k % 5 - 2) * 0.2, 0)); return g; }
export { atril, libroAbierto, banco, paja };
function campanaBronce(K, r = 0.07) {
  const g = new THREE.Group();
  const pts = [[0.0, 0.0], [r * 0.95, 0.0], [r, 0.02], [r * 0.7, r * 0.6], [r * 0.55, r * 1.1], [r * 0.45, r * 1.3], [0, r * 1.35]].map(([a, b]) => new THREE.Vector2(a, b));
  const geo = new THREE.LatheGeometry(pts, 14); geo.userData.propia = true;
  g.add(K.malla(geo, PA.bronce, { grosor: 0.003 }));
  g.add(ubic(K.malla(K.esfera(r * 0.18, 0.4), '#6a4a24', { sinTinta: true }), 0, 0.01, 0));
  return g;
}

/* ---------- 57 · EL PERGAMINO: el taller del pergaminero, junto al Sena ---------- */
/* 0: el bastidor con la piel estirada y el pergaminero raspando con la luneta · 1: las tinas de cal donde se remojan las
   pieles · 2: el secadero con más bastidores y las pieles colgadas · 3: los pliegos cortados y doblados en cuadernos, sobre
   la mesa del estacionario que los vende */
function bastidor(K, h = 0.46) {
  const g = new THREE.Group();
  [-1, 1].forEach(l => g.add(ubic(caja(K, 0.025, h, 0.025, PA.madera, { grosor: 0.002 }), l * 0.17, h / 2, 0)));
  [0.05, h - 0.02].forEach(y => g.add(ubic(caja(K, 0.38, 0.022, 0.022, PA.madera, { grosor: 0.002 }), 0, y, 0)));
  g.add(ubic(caja(K, 0.28, h - 0.13, 0.006, '#efe2c4', { grosor: 0.0015 }), 0, h / 2 + 0.01, 0.004));
  for (let k = 0; k < 4; k++) [-1, 1].forEach(l => g.add(ubic(K.malla(K.cilindro(0.002, 0.002, 0.03, 3), '#8a7a5a', { sinTinta: true }), l * 0.155, 0.12 + k * 0.08, 0, 0, 0, Math.PI / 2)));   // las cuerdas
  return g;
}
export function pergamino(K, n) {
  const P = pieza(ANCLAS.pergamino), A = ANCLAS.pergamino;
  en(P, bastidor(K), A.x, A.y, 0, 0.2);
  const per = actor(P, K, { ...ARTESANO, oficio: true, k: 'pergaminero' }, 'labrar', A.x + 0.05, A.y + 0.3, { x: A.x, y: A.y });
  en(P, caja(K, 0.16, 0.01, 0.12, '#e8dcc2', { grosor: 0.0015 }), A.x - 0.32, A.y + 0.2, 0.005);   // una piel ya raspada en el suelo
  if (n >= 1) [[0.45, -0.1], [0.62, 0.22]].forEach(([dx, dz]) => {
    const t = new THREE.Group(); en(P, t, A.x + dx, A.y + dz);
    t.add(ubic(K.malla(K.cilindro(0.12, 0.1, 0.16, 12), PA.maderaD, { grosor: 0.003 }), 0, 0.08, 0));
    t.add(ubic(K.malla(K.cilindro(0.11, 0.11, 0.01, 12), '#e6e2d6', { sinTinta: true }), 0, 0.15, 0));   // la cal
    t.add(ubic(caja(K, 0.12, 0.006, 0.1, '#d8cbb0', { sinTinta: true }), 0.02, 0.157, 0, 0, 0.4, 0));
  });
  if (n >= 2) {
    const s = new THREE.Group(); en(P, s, A.x - 0.15, A.y - 0.5, 0, 0.1);
    [-0.25, 0.25].forEach(x => { const b = bastidor(K, 0.4); b.position.x = x; s.add(b); });
    [-1, 1].forEach(l => s.add(ubic(K.malla(K.cilindro(0.01, 0.01, 0.5, 4), PA.maderaD, { sinTinta: true }), l * 0.62, 0.25, 0.15)));
    s.add(ubic(K.malla(K.cilindro(0.006, 0.006, 1.24, 3), PA.maderaD, { sinTinta: true }), 0, 0.48, 0.15, 0, 0, Math.PI / 2));
    for (let k = 0; k < 4; k++) s.add(ubic(caja(K, 0.14, 0.2, 0.004, k % 2 ? '#efe2c4' : '#e2d2b0', { grosor: 0.0012 }), -0.42 + k * 0.28, 0.37, 0.15));   // las pieles colgadas
  }
  if (n >= 3) {
    const me = new THREE.Group(); en(P, me, A.x - 0.55, A.y + 0.25, 0, 0.3);
    me.add(ubic(caja(K, 0.36, 0.02, 0.2, PA.madera, { grosor: 0.002 }), 0, 0.2, 0));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => me.add(ubic(caja(K, 0.02, 0.2, 0.02, PA.maderaD, { sinTinta: true }), a * 0.16, 0.1, b * 0.08)));
    for (let k = 0; k < 4; k++) me.add(ubic(caja(K, 0.09, 0.025, 0.12, k % 2 ? PA.pergamino : '#e6d8b8', { grosor: 0.0012 }), -0.12 + (k % 2) * 0.1, 0.223 + Math.floor(k / 2) * 0.026, 0));   // los cuadernos
    me.add(ubic(K.malla(K.cilindro(0.008, 0.008, 0.5, 4), PA.maderaD, { sinTinta: true }), 0.2, 0.25, -0.1));
    me.add(ubic(caja(K, 0.14, 0.09, 0.008, PA.rojo, { grosor: 0.0015 }), 0.27, 0.42, -0.1));   // el letrero del estacionario
    me.add(ubic(caja(K, 0.06, 0.04, 0.009, PA.pergamino, { sinTinta: true }), 0.27, 0.42, -0.095));
  }
  P.toc = [{ x: A.x, y: A.y, k: 'pergaminero', p: per }];
  return P;
}

/* ---------- 58 · LA CAMPANA: el campanario de San Víctor ---------- */
/* 0: la espadaña de madera con una campana chica y el canónigo que tira de la cuerda · 1: la base de piedra de la torre ·
   2: la torre entera, con sus ventanas de campanas y el chapitel de pizarra · 3: la campana grande a la vista, el reloj de
   sol en el muro y, al pie, el reloj de agua del sacristán (para saber la hora de noche) */
export function campana(K, n) {
  const P = pieza(ANCLAS.campana), A = ANCLAS.campana;
  const cuerda = (alto) => K.malla(K.cilindro(0.003, 0.003, alto, 3), '#c9b88a', { sinTinta: true });
  if (n === 0) {
    const es = new THREE.Group(); en(P, es, A.x, A.y);
    [-1, 1].forEach(l => es.add(ubic(caja(K, 0.04, 0.6, 0.04, PA.madera, { grosor: 0.002 }), l * 0.14, 0.3, 0)));
    es.add(ubic(caja(K, 0.36, 0.04, 0.05, PA.madera, { grosor: 0.002 }), 0, 0.6, 0));
    const t = tejado(K, 0.22, 0.4, 0.1, { tipo: 'teja', piñon: PA.madera }); t.rotation.y = Math.PI / 2; t.position.y = 0.62; es.add(t);
    const c = campanaBronce(K, 0.06); c.position.y = 0.46; es.add(c);
    es.add(ubic(cuerda(0.3), 0, 0.3, 0));
  } else {
    const H = n === 1 ? 0.42 : 0.86, to = new THREE.Group(); en(P, to, A.x, A.y);
    to.add(ubic(caja(K, 0.34, H, 0.34, PA.piedra, { grosor: 0.004 }), 0, H / 2, 0));
    for (let y = 0.1; y < H; y += 0.12) to.add(ubic(caja(K, 0.345, 0.006, 0.345, PA.piedraD, { sinTinta: true }), 0, y, 0));   // las hiladas
    to.add(ubic(caja(K, 0.09, 0.15, 0.01, '#3a2e22', { sinTinta: true }), 0, 0.075, 0.172));
    if (n === 1) {   // la torre a medio hacer: la campana colgada en un marco de madera sobre lo construido
      [-1, 1].forEach(l => to.add(ubic(caja(K, 0.03, 0.3, 0.03, PA.madera, { grosor: 0.002 }), l * 0.12, H + 0.15, 0)));
      to.add(ubic(caja(K, 0.28, 0.03, 0.04, PA.madera, { grosor: 0.002 }), 0, H + 0.3, 0));
      const c = campanaBronce(K, 0.065); c.position.y = H + 0.12; to.add(c);
      for (let k = 0; k < 3; k++) to.add(ubic(caja(K, 0.08, 0.05, 0.08, PA.piedra, { grosor: 0.002 }), -0.3 + k * 0.05, 0.025 + (k % 2) * 0.05, 0.25));   // los sillares que esperan
    } else {
      [[0, 0.172, 0], [0.172, 0, Math.PI / 2]].forEach(([x, z, ry]) => [-0.07, 0.07].forEach(dx => { const v = caja(K, 0.05, 0.14, 0.006, '#2a2e3a', { sinTinta: true }); v.position.set(x ? x : dx, H - 0.14, z ? z : dx); v.rotation.y = ry; to.add(v); }));   // las ventanas de las campanas
      const ch = K.malla(K.cono(0.27, 0.42, 4), PA.pizarra, { grosor: 0.003 }); ch.rotation.y = Math.PI / 4; ch.position.y = H + 0.21; to.add(ch);
      to.add(ubic(caja(K, 0.004, 0.08, 0.04, PA.hierro, { sinTinta: true }), 0, H + 0.46, 0));   // la cruz de hierro
      to.add(ubic(cuerda(H - 0.2), 0.1, (H - 0.2) / 2 + 0.05, 0.18));
    }
  }
  const sac = actor(P, K, { ...CANONIGO, oficio: true, k: 'campanero' }, 'pertiga', A.x + (n === 0 ? 0.0 : 0.1), A.y + 0.28, { x: A.x, y: A.y });
  if (n >= 3) {
    const c = campanaBronce(K, 0.1); en(P, c, A.x, A.y, 0.86 - 0.3);   // la campana grande, en el cuerpo de campanas
    const rs = new THREE.Group(); en(P, rs, A.x + 0.172, A.y - 0.05, 0.45, Math.PI / 2);   // el reloj de sol en el muro, con su gnomon
    rs.add(ubic(K.malla(K.cilindro(0.07, 0.07, 0.006, 12, 1), PA.piedraL, { sinTinta: true }), 0, 0, 0.004, Math.PI / 2, 0, 0));
    rs.add(ubic(caja(K, 0.006, 0.006, 0.06, PA.hierro, { sinTinta: true }), 0, 0, 0.03, -0.5, 0, 0));
    for (let k = 0; k < 5; k++) { const a = Math.PI * (0.15 + k * 0.175); rs.add(ubic(caja(K, 0.004, 0.05, 0.002, '#5a5046', { sinTinta: true }), Math.cos(a) * 0.035, -Math.sin(a) * 0.035, 0.008, 0, 0, a + Math.PI / 2)); }
    const ra = new THREE.Group(); en(P, ra, A.x + 0.42, A.y + 0.12);   // el reloj de agua: el recipiente que gotea en otro y la vara que sube y marca
    ra.add(ubic(caja(K, 0.22, 0.02, 0.16, PA.madera, { grosor: 0.002 }), 0, 0.2, 0));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => ra.add(ubic(caja(K, 0.018, 0.2, 0.018, PA.maderaD, { sinTinta: true }), a * 0.09, 0.1, b * 0.06)));
    ra.add(ubic(K.malla(K.cilindro(0.04, 0.035, 0.08, 10), PA.bronce, { grosor: 0.002 }), -0.05, 0.3, 0));
    ra.add(ubic(K.malla(K.cilindro(0.035, 0.035, 0.1, 10), '#c9d6d8', { grosor: 0.002, transparent: true, opacity: 0.7 }), 0.05, 0.26, 0));
    ra.add(ubic(K.malla(K.cilindro(0.004, 0.004, 0.12, 3), PA.maderaD, { sinTinta: true }), 0.05, 0.34, 0));
  }
  P.toc = [{ x: A.x, y: A.y, k: 'campana', p: sac }];
  return P;
}

/* ---------- 59 · EL SCRIPTORIUM: donde se copian los libros, junto al claustro ---------- */
/* 0: la sala de piedra abierta al jardín con un atril y su copista · 1: el segundo atril, el tintero de cuerno y las
   plumas · 2: el armarium, el armario de los libros, con el bibliotecario · 3: la mesa del iluminador con el oro y los
   colores, y el gran libro abierto en su facistol (la Biblia de San Víctor) */
export function scriptorium(K, n) {
  const P = pieza(ANCLAS.scriptorium), A = ANCLAS.scriptorium;
  const sa = new THREE.Group(); en(P, sa, A.x, A.y - 0.32);
  sa.add(ubic(caja(K, 0.78, 0.04, 0.42, PA.piedraD, { grosor: 0.003 }), 0, 0.02, 0));
  sa.add(ubic(caja(K, 0.78, 0.36, 0.06, PA.piedra, { grosor: 0.004 }), 0, 0.2, -0.18));
  [-1, 1].forEach(l => sa.add(ubic(caja(K, 0.06, 0.36, 0.42, PA.piedra, { grosor: 0.004 }), l * 0.36, 0.2, 0)));
  const t = tejado(K, 0.5, 0.86, 0.22, { tipo: 'pizarra' }); t.rotation.y = Math.PI / 2; t.position.set(0, 0.38, -0.02); sa.add(t);
  for (let k = 0; k < 2; k++) sa.add(ubic(caja(K, 0.08, 0.14, 0.006, '#2a2e3a', { sinTinta: true }), -0.18 + k * 0.36, 0.24, -0.148));   // las ventanas que dan la luz del norte
  const c0 = new THREE.Group(); en(P, c0, A.x - 0.16, A.y - 0.3); c0.add(atril(K));
  const cop = actor(P, K, { ...CANONIGO, oficio: true, k: 'copista' }, 'escribir', A.x - 0.16, A.y - 0.1, { x: A.x - 0.16, y: A.y - 0.4 }, { asiento: 0.12 });
  if (n >= 1) {
    const c1 = new THREE.Group(); en(P, c1, A.x + 0.16, A.y - 0.3); c1.add(atril(K));
    actor(P, K, { ...estudiante(3), colorRopa: '#ece6d6', oficio: true, k: 'copista2' }, 'escribir', A.x + 0.16, A.y - 0.1, { x: A.x + 0.16, y: A.y - 0.4 }, { asiento: 0.12 });
    const me = new THREE.Group(); en(P, me, A.x, A.y - 0.08);
    me.add(ubic(K.malla(K.cono(0.018, 0.06, 6), '#d8c9a6', { grosor: 0.0015 }), 0, 0.03, 0, Math.PI, 0, 0));   // el tintero de cuerno
    [-0.02, 0.02].forEach(dx => me.add(ubic(K.malla(K.cono(0.008, 0.1, 4), '#f4f0e8', { sinTinta: true }), dx, 0.08, 0, 0, 0, dx * 8)));   // las plumas
  }
  if (n >= 2) {
    const ar = new THREE.Group(); en(P, ar, A.x + 0.6, A.y - 0.2, 0, -Math.PI / 2);
    ar.add(ubic(caja(K, 0.34, 0.44, 0.14, PA.maderaD, { grosor: 0.003 }), 0, 0.22, 0));
    for (let f = 0; f < 3; f++) { ar.add(ubic(caja(K, 0.3, 0.008, 0.1, PA.madera, { sinTinta: true }), 0, 0.1 + f * 0.13, 0.025));
      for (let k = 0; k < 6; k++) ar.add(ubic(caja(K, 0.035, 0.1, 0.08, [PA.rojo, '#5a3a24', PA.azul, '#7a5232', PA.verdeD, '#8a6a3a'][(k + f) % 6], { grosor: 0.001 }), -0.12 + k * 0.045, 0.157 + f * 0.13, 0.025)); }
    actor(P, K, { ...CANONIGO, capucha: '#5a4630', oficio: true, k: 'armarius' }, 'leer', A.x + 0.52, A.y + 0.15, { x: A.x + 0.6, y: A.y - 0.2 });
  }
  if (n >= 3) {
    const me = new THREE.Group(); en(P, me, A.x - 0.56, A.y + 0.1, 0, 0.4);
    me.add(ubic(caja(K, 0.3, 0.02, 0.18, PA.madera, { grosor: 0.002 }), 0, 0.2, 0));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => me.add(ubic(caja(K, 0.018, 0.2, 0.018, PA.maderaD, { sinTinta: true }), a * 0.13, 0.1, b * 0.07)));
    const lb = libroAbierto(K, 0.18); lb.position.y = 0.21; me.add(lb);
    [PA.oro, PA.azul, PA.rojo, PA.verde].forEach((c, k) => me.add(ubic(K.malla(K.cilindro(0.014, 0.014, 0.02, 6), c, { sinTinta: true }), -0.11 + k * 0.03, 0.22, 0.065)));   // el oro y los colores
    const fa = new THREE.Group(); en(P, fa, A.x + 0.05, A.y + 0.32);   // el facistol con la Biblia grande
    fa.add(ubic(K.malla(K.cilindro(0.016, 0.03, 0.3, 6), PA.maderaD, { grosor: 0.002 }), 0, 0.15, 0));
    const tb = caja(K, 0.26, 0.016, 0.18, PA.madera, { grosor: 0.002 }); tb.position.y = 0.31; tb.rotation.x = 0.35; fa.add(tb);
    const bl = libroAbierto(K, 0.22); bl.position.set(0, 0.325, 0.005); bl.rotation.x = 0.35; fa.add(bl);
  }
  P.toc = [{ x: A.x, y: A.y, k: 'scriptorium', p: cop }];
  return P;
}

/* ---------- 60 · LA DISPUTATIO: al pie de la Montaña de Santa Genoveva ---------- */
/* 0: la cátedra del maestro sobre su tarima, con la paja del suelo · 1: los dos estrados enfrentados del que objeta y del que
   responde · 2: los bancos de los que escuchan y el bedel con su vara · 3: el toldo, la mesa con los dos libros abiertos (lo
   que se dice a favor, lo que se dice en contra) y el pendón de la escuela */
export function disputatio(K, n) {
  const P = pieza(ANCLAS.disputatio), A = ANCLAS.disputatio;
  en(P, paja(K, 1.1, 0.7), A.x, A.y + 0.1);
  const ca = new THREE.Group(); en(P, ca, A.x, A.y - 0.32);
  ca.add(ubic(caja(K, 0.4, 0.06, 0.3, PA.maderaD, { grosor: 0.003 }), 0, 0.03, 0));
  ca.add(ubic(caja(K, 0.18, 0.12, 0.16, PA.madera, { grosor: 0.002 }), 0, 0.12, -0.02));
  ca.add(ubic(caja(K, 0.2, 0.42, 0.03, PA.madera, { grosor: 0.002 }), 0, 0.3, -0.11));   // el respaldo alto de la cátedra
  ca.add(ubic(caja(K, 0.24, 0.03, 0.14, PA.maderaD, { grosor: 0.002 }), 0, 0.52, -0.06));   // el dosel
  const mae = actor(P, K, { ...MAESTRO, oficio: true, k: 'maestroDisputa' }, 'narrar', A.x, A.y - 0.3, { x: A.x, y: A.y + 0.6 }, { asiento: 0.06 });
  if (n >= 1) [[-0.42, 0.0, 1], [0.42, 0.0, -1]].forEach(([dx, dz, l], i) => {
    const es = new THREE.Group(); en(P, es, A.x + dx, A.y + dz);
    es.add(ubic(caja(K, 0.16, 0.05, 0.16, PA.maderaD, { grosor: 0.002 }), 0, 0.025, 0));
    es.add(ubic(K.malla(K.cilindro(0.01, 0.014, 0.22, 5), PA.madera, { sinTinta: true }), l * 0.06, 0.16, 0));
    const tb = caja(K, 0.1, 0.01, 0.08, PA.madera, { grosor: 0.0015 }); tb.position.set(l * 0.06, 0.27, 0); tb.rotation.z = l * 0.4; es.add(tb);
    actor(P, K, { ...estudiante(i + 6), oficio: true, k: i ? 'respondens' : 'opponens' }, 'narrar', A.x + dx - l * 0.05, A.y + dz, { x: A.x - dx, y: A.y + dz }, { asiento: 0.05 });
  });
  if (n >= 2) {
    [0.38, 0.6].forEach((dz, f) => { const b = banco(K, 0.7); en(P, b, A.x, A.y + dz); });
    [[-0.22, 0.46], [0.12, 0.46], [-0.08, 0.68]].forEach(([dx, dz], i) => actor(P, K, { ...estudiante(i + 1), oficio: true, k: 'oyente' + i }, 'leer', A.x + dx, A.y + dz, { x: A.x, y: A.y - 0.3 }, { asiento: 0.1 }));
    actor(P, K, { ...ARTESANO, colorRopa: '#3f4f7a', chal: undefined, barba: undefined, oficio: true, k: 'bedel' }, 'pertiga', A.x + 0.55, A.y - 0.3, { x: A.x, y: A.y });
  }
  if (n >= 3) {
    const to = new THREE.Group(); en(P, to, A.x, A.y + 0.1);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => to.add(ubic(K.malla(K.cilindro(0.012, 0.012, 0.74, 5), PA.maderaD, { grosor: 0.002 }), a * 0.56, 0.37, b * 0.42)));
    const tela = caja(K, 1.16, 0.014, 0.88, '#e8d8b8', { grosor: 0.002 }); tela.position.y = 0.74; to.add(tela);
    [-1, 1].forEach(l => to.add(ubic(caja(K, 1.17, 0.05, 0.012, PA.azul, { sinTinta: true }), 0, 0.72, l * 0.44)));
    const me = new THREE.Group(); en(P, me, A.x + 0.22, A.y - 0.18);
    me.add(ubic(caja(K, 0.3, 0.02, 0.14, PA.madera, { grosor: 0.002 }), 0, 0.18, 0));
    [-1, 1].forEach(a => me.add(ubic(caja(K, 0.02, 0.18, 0.12, PA.maderaD, { sinTinta: true }), a * 0.13, 0.09, 0)));
    [-0.075, 0.075].forEach(dx => { const l = libroAbierto(K, 0.12); l.position.set(dx, 0.19, 0); me.add(l); });
    const pe = new THREE.Group(); en(P, pe, A.x - 0.6, A.y - 0.3);
    pe.add(ubic(K.malla(K.cilindro(0.008, 0.008, 0.8, 4), PA.maderaD, { sinTinta: true }), 0, 0.4, 0));
    pe.add(ubic(caja(K, 0.16, 0.22, 0.006, PA.rojo, { grosor: 0.0015 }), 0.08, 0.66, 0));
    pe.add(ubic(caja(K, 0.06, 0.06, 0.007, PA.oro, { sinTinta: true }), 0.08, 0.68, 0.001));
  }
  P.toc = [{ x: A.x, y: A.y, k: 'montana', p: mae }];
  return P;
}

/* ---------- 61 · LA UNIVERSIDAD: donde se juntaban los maestros (San Julián el Pobre) y se daba la licencia ---------- */
/* 0: la iglesia chica de San Julián, donde la universidad hacía sus asambleas · 1: el arca de las tres llaves con los
   privilegios y el gran sello en su atril · 2: los maestros con el bonete y el bedel con la maza · 3: los pendones de las
   cuatro naciones (Francia, Picardía, Normandía, Inglaterra) */
export function universidad(K, n) {
  const P = pieza(ANCLAS.universidad), A = ANCLAS.universidad;
  const ig = new THREE.Group(); en(P, ig, A.x, A.y - 0.35);
  ig.add(ubic(caja(K, 0.7, 0.3, 0.32, PA.piedra, { grosor: 0.004 }), 0, 0.15, 0));
  const t = tejado(K, 0.36, 0.74, 0.2, { tipo: 'teja' }); t.rotation.y = Math.PI / 2; t.position.y = 0.3; ig.add(t);
  ig.add(ubic(K.malla(K.cilindro(0.15, 0.15, 0.26, 10), PA.piedra, { grosor: 0.003 }), 0.36, 0.13, 0));
  ig.add(ubic(K.malla(K.cono(0.16, 0.14, 10), PA.tejaD, { grosor: 0.003 }), 0.36, 0.33, 0));
  ig.add(ubic(caja(K, 0.1, 0.15, 0.012, '#3a2e22', { sinTinta: true }), -0.12, 0.075, 0.166));
  ig.add(ubic(caja(K, 0.05, 0.14, 0.05, PA.piedraD, { grosor: 0.002 }), -0.32, 0.43, 0));   // la espadaña
  const sello = new THREE.Group(); en(P, sello, A.x + 0.1, A.y + 0.05);
  const bed = actor(P, K, { ...MAESTRO, oficio: true, k: 'canciller' }, 'narrar', A.x - 0.2, A.y + 0.05, { x: A.x + 0.5, y: A.y + 0.8 });
  if (n >= 1) {
    const ar = new THREE.Group(); en(P, ar, A.x + 0.45, A.y + 0.05, 0, -0.3);
    ar.add(ubic(caja(K, 0.26, 0.14, 0.15, PA.maderaD, { grosor: 0.003 }), 0, 0.07, 0));
    ar.add(ubic(caja(K, 0.27, 0.04, 0.16, PA.madera, { grosor: 0.002 }), 0, 0.155, 0));
    for (let k = 0; k < 3; k++) ar.add(ubic(caja(K, 0.03, 0.04, 0.01, PA.hierro, { sinTinta: true }), -0.08 + k * 0.08, 0.1, 0.078));   // las tres cerraduras (cada llave, en manos de un maestro distinto)
    sello.add(ubic(K.malla(K.cilindro(0.014, 0.02, 0.26, 5), PA.maderaD, { sinTinta: true }), 0, 0.13, 0));
    sello.add(ubic(K.malla(K.cilindro(0.06, 0.06, 0.015, 14), '#a8261e', { grosor: 0.002 }), 0, 0.3, 0, Math.PI / 2 - 0.4, 0, 0));   // el sello de cera roja
    sello.add(ubic(K.malla(K.cilindro(0.035, 0.035, 0.017, 10), '#8a1e18', { sinTinta: true }), 0, 0.3, 0.004, Math.PI / 2 - 0.4, 0, 0));
  }
  if (n >= 2) {
    [[0.2, 0.4], [-0.1, 0.48]].forEach(([dx, dz], i) => actor(P, K, { ...MAESTRO, piel: i, colorPelo: ['#7a6a52', '#3a2a1e'][i], oficio: true, k: 'maestroU' + i }, 'quieto', A.x + dx, A.y + dz, { x: A.x - 0.2, y: A.y + 0.05 }));
    const b = actor(P, K, { ...ARTESANO, colorRopa: '#3f4f7a', chal: undefined, barba: undefined, oficio: true, k: 'bedelU' }, 'pertiga', A.x - 0.45, A.y + 0.3, { x: A.x, y: A.y });
  }
  if (n >= 3) [['#2f4f9a', PA.oro], ['#3f7a4a', '#f2ead2'], ['#a8261e', PA.oro], ['#f2ead2', '#a8261e']].forEach(([c1, c2], i) => {
    const pe = new THREE.Group(); en(P, pe, A.x - 0.55 + i * 0.36, A.y - 0.7);
    pe.add(ubic(K.malla(K.cilindro(0.008, 0.008, 0.82, 4), PA.maderaD, { sinTinta: true }), 0, 0.41, 0));
    pe.add(ubic(caja(K, 0.14, 0.2, 0.006, c1, { grosor: 0.0015 }), 0.07, 0.68, 0));
    pe.add(ubic(caja(K, 0.05, 0.05, 0.007, c2, { sinTinta: true }), 0.07, 0.7, 0.001));
  });
  P.toc = [{ x: A.x, y: A.y, k: 'universidad', p: bed }];
  return P;
}

/* ---------- 62 · LA SORBONA: el colegio de Roberto de Sorbon (1257) para estudiantes pobres ---------- */
/* 0: la casa de piedra con su patio y su muro · 1: el ala de los cuartos (las camerae), con los estudiantes en la puerta ·
   2: la biblioteca, con los libros encadenados a los atriles · 3: la capilla con su espadaña y el pozo del jardín */
export function sorbona(K, n) {
  const P = pieza(ANCLAS.sorbona), A = ANCLAS.sorbona;
  const ca = new THREE.Group(); en(P, ca, A.x - 0.2, A.y - 0.4);
  ca.add(ubic(caja(K, 0.6, 0.36, 0.3, PA.piedra, { grosor: 0.004 }), 0, 0.18, 0));
  const t = tejado(K, 0.34, 0.64, 0.24, { tipo: 'pizarra' }); t.rotation.y = Math.PI / 2; t.position.y = 0.36; ca.add(t);
  ca.add(ubic(caja(K, 0.1, 0.15, 0.012, '#3a2e22', { sinTinta: true }), 0.1, 0.075, 0.156));
  [-0.18, 0.0].forEach(x => ca.add(ubic(caja(K, 0.06, 0.08, 0.008, '#33302c', { sinTinta: true }), x, 0.26, 0.153)));
  const mu = new THREE.Group(); en(P, mu, A.x, A.y + 0.42);   // el muro del patio, con su portón
  [-1, 1].forEach(l => mu.add(ubic(caja(K, 0.36, 0.16, 0.05, PA.piedraD, { grosor: 0.003 }), l * 0.3, 0.08, 0)));
  const dir = actor(P, K, { ...MAESTRO, bonete: undefined, oficio: true, k: 'provisor' }, 'quieto', A.x + 0.0, A.y - 0.05, { x: A.x, y: A.y + 0.6 });
  if (n >= 1) {
    const al = new THREE.Group(); en(P, al, A.x + 0.5, A.y - 0.05, 0, Math.PI / 2);
    al.add(ubic(caja(K, 0.7, 0.3, 0.22, PA.revoque, { grosor: 0.004 }), 0, 0.15, 0));
    const t2 = tejado(K, 0.26, 0.74, 0.18, { tipo: 'teja', piñon: PA.revoque }); t2.rotation.y = Math.PI / 2; t2.position.y = 0.3; al.add(t2);
    for (let k = 0; k < 4; k++) { al.add(ubic(caja(K, 0.05, 0.06, 0.006, '#33302c', { sinTinta: true }), -0.26 + k * 0.17, 0.22, 0.113)); al.add(ubic(caja(K, 0.06, 0.11, 0.006, PA.maderaD, { sinTinta: true }), -0.26 + k * 0.17, 0.055, 0.113)); }   // un cuarto, una ventana y una puerta
    [[0.3, 0.12], [0.36, 0.3]].forEach(([dx, dz], i) => actor(P, K, { ...estudiante(i + 10), oficio: true, k: 'socius' + i }, 'leer', A.x + dx, A.y + dz, { x: A.x + 0.5, y: A.y - 0.05 }));
  }
  if (n >= 2) {
    const bi = new THREE.Group(); en(P, bi, A.x - 0.62, A.y + 0.05, 0, -Math.PI / 2);
    bi.add(ubic(caja(K, 0.62, 0.04, 0.3, PA.piedraD, { grosor: 0.003 }), 0, 0.02, 0));
    bi.add(ubic(caja(K, 0.62, 0.32, 0.05, PA.piedra, { grosor: 0.004 }), 0, 0.18, -0.13));
    const t3 = tejado(K, 0.34, 0.66, 0.2, { tipo: 'pizarra' }); t3.rotation.y = Math.PI / 2; t3.position.set(0, 0.34, 0); bi.add(t3);
    [-1, 1].forEach(l => bi.add(ubic(caja(K, 0.05, 0.34, 0.3, PA.piedra, { grosor: 0.003 }), l * 0.29, 0.17, 0)));
    for (let k = 0; k < 3; k++) {   // los atriles con los libros encadenados
      const at = atril(K); at.position.set(-0.18 + k * 0.18, 0.04, -0.02); at.scale.setScalar(0.8); bi.add(at);
      bi.add(ubic(K.malla(K.cilindro(0.002, 0.002, 0.14, 3), PA.hierro, { sinTinta: true }), -0.18 + k * 0.18, 0.18, -0.07, 0.6, 0, 0));
    }
    bi.add(ubic(K.malla(K.cilindro(0.004, 0.004, 0.56, 3), PA.hierro, { sinTinta: true }), 0, 0.12, -0.1, 0, 0, Math.PI / 2));   // la barra de las cadenas
  }
  if (n >= 3) {
    const cp = new THREE.Group(); en(P, cp, A.x - 0.25, A.y - 0.95);
    cp.add(ubic(caja(K, 0.42, 0.3, 0.24, PA.piedraL, { grosor: 0.004 }), 0, 0.15, 0));
    const t4 = tejado(K, 0.28, 0.46, 0.2, { tipo: 'pizarra', piñon: PA.piedraL }); t4.rotation.y = Math.PI / 2; t4.position.y = 0.3; cp.add(t4);
    cp.add(ubic(caja(K, 0.06, 0.18, 0.05, PA.piedraL, { grosor: 0.002 }), -0.2, 0.5, 0));
    const cb = campanaBronce(K, 0.025); cb.position.set(-0.2, 0.47, 0.03); cp.add(cb);
    cp.add(ubic(K.malla(K.cilindro(0.05, 0.05, 0.006, 12), PA.azul, { sinTinta: true }), 0.212, 0.2, 0, 0, 0, Math.PI / 2));   // la ventana redonda
    const po = new THREE.Group(); en(P, po, A.x + 0.2, A.y + 0.18);
    po.add(ubic(K.malla(K.cilindro(0.06, 0.06, 0.07, 10), PA.piedraD, { grosor: 0.002 }), 0, 0.035, 0));
    [-1, 1].forEach(l => po.add(ubic(caja(K, 0.01, 0.14, 0.01, PA.maderaD, { sinTinta: true }), l * 0.06, 0.11, 0)));
    po.add(ubic(caja(K, 0.14, 0.01, 0.01, PA.maderaD, { sinTinta: true }), 0, 0.18, 0));
  }
  P.toc = [{ x: A.x, y: A.y, k: 'sorbona', p: dir }];
  return P;
}

/* LAS PIEZAS: con su índice de saber para la auditoría de etapas (juego3d/qa.html) */
export const PIEZAS = [
  { id: 'pergamino', i: 57, crear: pergamino },
  { id: 'campana', i: 58, crear: campana },
  { id: 'scriptorium', i: 59, crear: scriptorium },
  { id: 'disputatio', i: 60, crear: disputatio },
  { id: 'universidad', i: 61, crear: universidad },
  { id: 'sorbona', i: 62, crear: sorbona },
];
