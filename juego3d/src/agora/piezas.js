/* ============================================================
   agora/piezas
   Los seis saberes del ágora en 3D, cada uno con sus etapas (la máxima del proyecto: subir de nivel se VE,
   con piezas nuevas; se audita por diff de píxeles en juego3d/qa.html): la tablilla de cera (33), la lira
   del kitharistes (34), la palestra (35), el sofista (36), la pregunta (37) y la Academia (38). Más las
   lámparas de aceite de la noche. Las anclas de la lógica (el banco, el claro, la tarima) son las del motor
   2D (09b-agora); lo que el 2D dibujaba encima de la stoa se corrió afuera, porque en 3D el techo lo tapa.
   Cada pieza devuelve { obj, anim, ancla, toc, actores } como las de las otras épocas (src/piezas.js).
   ============================================================ */
import * as THREE from 'three';
import { pieza, actor, texturaCanvas, vasija } from '../piezas.js';
import { AT, palestra as palestraMon, muroBajo, altar, museion, banco, figura, anfora, herma, columnaDorica } from './monumentos.js';
import { PLATANO } from './valle.js';

const ubic = (m, x, y, z, rx = 0, ry = 0, rz = 0) => { m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx, ry, rz); return m; };
export const ANCLAS = {
  cera: { x: 11.35, y: 7.75 }, lira: { x: 7.45, y: 7.4 }, palestra: { x: 14.0, y: 4.7 }, sofista: { x: 12.1, y: 8.7 },
  pregunta: { x: 10.3, y: 8.3 }, academia: { x: 4.6, y: 7.95 }, banco: { x: 8.8, y: 7.0 },
};
export const ACADEMIA = { x0: 3.0, x1: 6.2, z0: 6.45, z1: 9.45 };
/* los aprendices del ágora: muchachos de quitón corto, de lino claro con la orla de color; el pelo corto
   castaño o rubio, y la cinta del atleta en uno de cada tres. ⚖️ Solo varones: la escuela de Atenas era para
   los hijos libres (la ficha de las casas lo dice). */
export function aprendiz(i, extra = {}) {
  return { edad: 'nino', piel: [0, 1, 1, 2][i % 4], pelo: ['corto', 'rizos', 'corto'][i % 3], colorPelo: i % 3 === 1 ? '#8a5a2e' : '#5a4632',
    ropa: 'corta', colorRopa: ['#f4efe2', '#efe6d0', '#e9e2d2'][i % 3], sinFlecos: true, vincha: i % 3 === 0 ? '#b5533c' : undefined, ...extra };
}
/* los maestros: quitón largo y el himatión cruzado al hombro (el chal), barba recortada */
export const MAESTRO = { piel: 1, pelo: 'rizos', colorPelo: '#4a3a2c', barba: true, ropa: 'tunica', colorRopa: '#f4efe2', orla: '#3f7fb5', chal: '#c9b48a' };

const caja = (K, w, h, d, color, o) => K.malla(K.caja(w, h, d), color, o);
const en = (P, obj, x, y, h = 0, ry = 0) => { obj.position.copy(P.en(x, y)); obj.position.y += h; obj.rotation.y = ry; P.obj.add(obj); return obj; };
const plano = (K, tex, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), K.matMapa(tex)); m.geometry.userData.propia = true; m.castShadow = true; return m; };
/* la tablilla de cera: marco de madera y la cera negra; escrita, con renglones claros raspados por el estilo */
function tablilla(K, { w = 0.22, h = 0.16, escrita = true, letras = null } = {}) {
  const g = new THREE.Group();
  g.add(caja(K, w, 0.02, h, '#8a6a4a', { grosor: 0.003 }));
  const tx = texturaCanvas(96, 72, (c, W, H) => {
    c.fillStyle = '#3f3a32'; c.fillRect(0, 0, W, H);
    c.strokeStyle = '#d6c9a0'; c.lineWidth = 2.2;
    if (letras) { c.fillStyle = '#efe6cc'; c.font = '600 15px Georgia, serif'; c.textAlign = 'center'; letras.split('\n').forEach((f, i) => c.fillText(f, W / 2, 22 + i * 20)); return; }
    if (escrita) for (let r = 0; r < 4; r++) { const y = 14 + r * 14; c.beginPath(); for (let x = 8; x < W - 10 - (r % 2) * 18; x += 5) { c.moveTo(x, y + (x * 7 % 3)); c.lineTo(x + 3, y - 2); } c.stroke(); }
  });
  const cera = plano(K, tx, w - 0.03, h - 0.03); cera.rotation.x = -Math.PI / 2; cera.position.y = 0.0105; g.add(cera);
  return g;
}
function estilo(K) { const e = K.malla(K.cilindro(0.004, 0.006, 0.15, 5), '#e9e2d0', { grosor: 0.002 }); e.rotation.z = Math.PI / 2; return e; }
function taburete(K, alto = 0.2) {
  const g = new THREE.Group();
  g.add(ubic(caja(K, 0.24, 0.03, 0.2, AT.madera, { grosor: 0.004 }), 0, alto, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const p = K.malla(K.cilindro(0.012, 0.012, alto, 5), AT.maderaD, { grosor: 0.003 }); p.position.set(a * 0.09, alto / 2, b * 0.07); p.rotation.z = a * 0.12; g.add(p); });
  return g;
}

/* ---------- 33 · LA TABLILLA DE CERA: el error que se borra ---------- */
/* 0: la tablilla suelta y su estilo sobre un taburete · 1: el díptico atado con cordel, sobre su atril · 2: el
   políptico apilado en la mesa y el cazo para fundir la cera de nuevo · 3: la tablilla grande del abecedario
   colgada de su poste: la letra que se aprende de todos */
export function cera(K, n) {
  const P = pieza(ANCLAS.cera), A = ANCLAS.cera;
  const tb = taburete(K, 0.22); en(P, tb, A.x, A.y);
  const t0 = tablilla(K); t0.rotation.y = 0.2; t0.position.set(0, 0.245, 0); tb.add(t0);
  const e0 = estilo(K); e0.position.set(0.05, 0.26, 0.06); e0.rotation.y = 0.5; tb.add(e0);
  if (n >= 1) {                                         // el atril con el díptico abierto: dos hojas atadas
    const at = new THREE.Group(); en(P, at, A.x - 0.38, A.y - 0.12, 0, 0.3);
    [-1, 1].forEach(l => { const p = K.malla(K.cilindro(0.012, 0.012, 0.36, 5), AT.maderaD, { grosor: 0.003 }); p.position.set(l * 0.1, 0.18, 0); p.rotation.x = l * 0.0; at.add(p); });
    const d = new THREE.Group(); d.position.set(0, 0.38, 0); d.rotation.x = -0.9; at.add(d);
    [-1, 1].forEach(l => { const h = tablilla(K, { w: 0.17, h: 0.21 }); h.position.x = l * 0.09; h.rotation.z = l * 0.12; d.add(h); });
    d.add(ubic(K.malla(K.cilindro(0.004, 0.004, 0.2, 4), '#b09a60', { sinTinta: true }), 0, 0.02, 0));
  }
  if (n >= 2) {                                         // la mesa con el políptico apilado y el brasero con el cazo de cera
    const m = new THREE.Group(); en(P, m, A.x + 0.42, A.y - 0.32, 0, -0.2);
    m.add(ubic(caja(K, 0.42, 0.03, 0.28, AT.madera, { grosor: 0.004 }), 0, 0.3, 0));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => m.add(ubic(K.malla(K.cilindro(0.014, 0.014, 0.3, 5), AT.maderaD, { grosor: 0.003 }), a * 0.17, 0.15, b * 0.1)));
    for (let k = 0; k < 5; k++) { const h = tablilla(K, { w: 0.2, h: 0.15, escrita: k === 4 }); h.position.set(-0.08, 0.33 + k * 0.022, 0); h.rotation.y = k * 0.06; m.add(h); }
    const br = new THREE.Group(); br.position.set(0.12, 0.315, 0.02); m.add(br);
    br.add(vasija(K, [[0.001, 0], [0.06, 0.005], [0.07, 0.04]], '#7a5a30', false));
    const cz = vasija(K, [[0.001, 0], [0.045, 0.01], [0.05, 0.05]], '#9a6b35', false); cz.position.y = 0.04; br.add(cz);
    br.add(ubic(K.malla(K.cilindro(0.04, 0.04, 0.01, 10), '#e0b84a', { sinTinta: true }), 0, 0.085, 0));   // la cera fundida
  }
  if (n >= 3) {                                         // el abecedario: la tablilla grande en su poste
    const ps = new THREE.Group(); en(P, ps, A.x - 0.05, A.y - 0.62, 0);
    ps.add(ubic(K.malla(K.cilindro(0.025, 0.03, 0.95, 6), AT.maderaD, { grosor: 0.004 }), 0, 0.475, 0));
    const ab = tablilla(K, { w: 0.5, h: 0.34, letras: 'Α Β Γ Δ Ε\nΖ Η Θ Ι Κ\nΛ Μ Ν Ξ Ο' }); ab.rotation.x = Math.PI / 2 - 0.05; ab.position.set(0, 0.78, 0.04); ps.add(ab);
  }
  actor(P, K, { ...aprendiz(4), oficio: true, k: 'escribiente' }, 'escribir', A.x + 0.3, A.y + 0.12, { x: A.x, y: A.y });
  return P;
}

/* ---------- 34 · LA LIRA DEL KITHARISTES: el ánimo se educa ---------- */
/* 0: la lira de caparazón de tortuga colgada de su poste · 1: las liras de los alumnos, del travesaño · 2: el aulós
   doble y los taburetes de la clase · 3: el trípode de bronce que gana el coro en las Dionisias, sobre su basa */
function lira(K, s = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s);
  const caja2 = K.malla(K.esfera(0.06, 0.6), '#8a6a4a', { grosor: 0.003 }); caja2.scale.set(1, 0.4, 0.8); g.add(caja2);   // el caparazón
  [-1, 1].forEach(l => { const b = K.malla(K.capsula(0.008, 0.16, 0.4), '#c9a24a', { grosor: 0.002 }); b.position.set(l * 0.045, 0.09, 0); b.rotation.z = -l * 0.2; g.add(b); });   // los brazos de cuerno
  g.add(ubic(K.malla(K.cilindro(0.006, 0.006, 0.13, 5), '#c9a24a', { grosor: 0.002 }), 0, 0.18, 0, 0, 0, Math.PI / 2));
  for (let k = -3; k <= 3; k++) g.add(ubic(K.malla(K.cilindro(0.0015, 0.0015, 0.16, 3), '#efe6cc', { sinTinta: true }), k * 0.009, 0.1, 0.02));   // las siete cuerdas
  return g;
}
export function liraPieza(K, n) {
  const P = pieza(ANCLAS.lira), A = ANCLAS.lira;
  const po = new THREE.Group(); en(P, po, A.x, A.y);
  po.add(ubic(K.malla(K.cilindro(0.025, 0.03, 0.8, 6), AT.maderaD, { grosor: 0.004 }), 0, 0.4, 0));
  po.add(ubic(K.malla(K.cilindro(0.012, 0.012, n >= 1 ? 0.7 : 0.28, 5), AT.madera, { grosor: 0.003 }), n >= 1 ? 0.25 : 0.1, 0.74, 0, 0, 0, Math.PI / 2));
  const l0 = lira(K, 1.3); l0.position.set(0.12, 0.5, 0.03); po.add(l0);
  if (n >= 1) [0.32, 0.5].forEach(x => { const l = lira(K, 1.15); l.position.set(x, 0.52, 0.03); l.rotation.z = 0.05; po.add(l); });
  if (n >= 2) {                                         // los taburetes de la clase y el aulós sobre uno
    [[0.35, 0.45], [-0.15, 0.5]].forEach(([dx, dz], i) => { const tb = taburete(K, 0.2); en(P, tb, A.x + dx, A.y + dz, 0, i * 0.4); });
    const au = new THREE.Group(); en(P, au, A.x + 0.35, A.y + 0.45, 0.235, 0.3);
    [-1, 1].forEach(l => { const c = K.malla(K.cilindro(0.008, 0.012, 0.3, 5), '#c9a875', { grosor: 0.002 }); c.rotation.z = Math.PI / 2 + l * 0.12; c.position.z = l * 0.02; au.add(c); });
  }
  if (n >= 3) {                                         // el trípode de la victoria del coro, en su basa de mármol
    const tr = new THREE.Group(); en(P, tr, A.x - 0.45, A.y - 0.15, 0);
    tr.add(ubic(caja(K, 0.3, 0.22, 0.3, AT.marmol, { grosor: 0.004 }), 0, 0.11, 0));
    [0, 1, 2].forEach(k => { const a = k * Math.PI * 2 / 3, p = K.malla(K.cilindro(0.01, 0.012, 0.5, 4), AT.bronce, { grosor: 0.003 }); p.position.set(Math.cos(a) * 0.08, 0.47, Math.sin(a) * 0.08); p.rotation.set(Math.sin(a) * 0.14, 0, -Math.cos(a) * 0.14); tr.add(p); });
    const cal = vasija(K, [[0.001, 0], [0.09, 0.02], [0.13, 0.1], [0.12, 0.14]], AT.bronceL, false); cal.position.y = 0.66; tr.add(cal);
    [-1, 1].forEach(l => tr.add(ubic(K.malla(K.toro(0.035, 0.007, Math.PI * 2, 0.5), AT.bronceL, { sinTinta: true }), l * 0.1, 0.84, 0)));
  }
  actor(P, K, { ...MAESTRO, colorRopa: '#efe6d0', chal: '#7a5a8a', oficio: true, k: 'liricista' }, 'tocar', A.x + 0.2, A.y + 0.5, { x: A.x + 0.5, y: A.y + 1.2 });
  return P;
}

/* ---------- 35 · LA PALESTRA: el cuerpo también aprende ---------- */
/* el patio de barrio elegido en la hoja de bocetos; sus etapas suman piezas grandes (el pórtico, el saco del
   boxeo y el aceite, Hermes y los luchadores) */
export function palestra(K, n) {
  const P = pieza(ANCLAS.palestra), A = ANCLAS.palestra;
  const m = palestraMon(K, 'barrio', n); en(P, m, A.x, A.y);
  if (n >= 3) {                                         // el korykos: el saco de arena que cuelga de su marco, para el boxeo
    const k = new THREE.Group(); en(P, k, A.x + 0.75, A.y + 0.2, 0.03);
    [-1, 1].forEach(l => k.add(ubic(K.malla(K.cilindro(0.015, 0.018, 0.62, 5), AT.madera, { grosor: 0.003 }), l * 0.22, 0.31, 0)));
    k.add(ubic(K.malla(K.cilindro(0.012, 0.012, 0.5, 5), AT.madera, { grosor: 0.003 }), 0, 0.61, 0, 0, 0, Math.PI / 2));
    const saco = K.malla(K.capsula(0.07, 0.1, 0.6), '#b59a6a', { grosor: 0.004 }); saco.position.y = 0.38; k.add(saco); k.userData.saco = saco;
    P.vivos.push(t => { saco.rotation.z = 0.12 * Math.sin(t * 2.1); });
    const lo = new THREE.Group(); en(P, lo, A.x - 0.6, A.y + 0.55, 0.03);   // el lebrillo para lavarse
    lo.add(ubic(K.malla(K.cilindro(0.03, 0.05, 0.24, 8), AT.marmol, { grosor: 0.003 }), 0, 0.12, 0));
    lo.add(ubic(K.malla(K.cilindro(0.16, 0.09, 0.05, 16), AT.marmol, { grosor: 0.004 }), 0, 0.265, 0));
    lo.add(ubic(K.malla(K.cilindro(0.14, 0.14, 0.01, 16), '#6fb8d4', { sinTinta: true }), 0, 0.285, 0));
  }
  if (n >= 3) {                                         // el estante de las jabalinas, y dos que luchan bajo la vara del paidotriba
    const es = new THREE.Group(); en(P, es, A.x + 1.05, A.y - 0.45, 0.03);
    es.add(ubic(caja(K, 0.04, 0.4, 0.04, AT.madera, { grosor: 0.003 }), 0, 0.2, 0));
    for (let k = 0; k < 4; k++) { const j = K.malla(K.cilindro(0.005, 0.005, 0.8, 4), '#a8875a', { grosor: 0.002 }); j.position.set(0.03, 0.4, -0.12 + k * 0.08); j.rotation.x = 0.15; es.add(j); }
    actor(P, K, { ...aprendiz(1), torsoDesnudo: true, oficio: true, k: 'luchador' }, 'agachado', A.x - 0.1, A.y + 0.25, { x: A.x + 0.2, y: A.y + 0.25 });
    actor(P, K, { ...aprendiz(2), torsoDesnudo: true, oficio: true, k: 'luchador' }, 'agachado', A.x + 0.2, A.y + 0.25, { x: A.x - 0.1, y: A.y + 0.25 });
    const he = new THREE.Group(); en(P, he, A.x - 0.95, A.y - 0.3, 0.03);   // el herma: el pilar con la cabeza de Hermes, patrón de la palestra
    he.add(ubic(caja(K, 0.16, 0.06, 0.16, AT.marmol, { grosor: 0.003 }), 0, 0.03, 0));
    he.add(ubic(caja(K, 0.1, 0.5, 0.1, AT.marmol, { grosor: 0.004 }), 0, 0.31, 0));
    he.add(ubic(K.malla(K.esfera(0.075, 0.6), AT.marmol, { grosor: 0.003 }), 0, 0.62, 0));
    he.add(ubic(K.malla(K.capsula(0.05, 0.05, 0.5), AT.marmol, { grosor: 0.002 }), 0, 0.56, 0.035, 0.3, 0, 0));   // la barba
  }
  // aprendida, la palestra se llena: uno ensaya el salto con las halteras en la mano y otro corre la vuelta del patio
  actor(P, K, { ...aprendiz(0), torsoDesnudo: true, oficio: true, k: 'atleta' }, 'agachado', A.x + 0.45, A.y - 0.38, { x: A.x - 0.4, y: A.y - 0.38 });
  const co = actor(P, K, { ...aprendiz(4), torsoDesnudo: true, oficio: true, k: 'atleta' }, 'andar', A.x - 0.55, A.y + 0.1, null);
  if (co.obj && co.obj.parent) { const c0 = co.obj.position.clone(); P.vivos.push(t => { const a = t * 0.9; co.obj.position.set(c0.x + 0.55 + Math.cos(a) * 0.62, 0, c0.z - 0.1 + Math.sin(a) * 0.42); co.obj.rotation.y = Math.atan2(-Math.sin(a) * 0.62, Math.cos(a) * 0.42); }); }
  const pt = actor(P, K, { ...MAESTRO, colorRopa: '#e9dfc6', chal: '#7a4a3a', oficio: true, k: 'paidotriba' }, 'quieto', A.x + 0.1, A.y + 0.75, { x: A.x + 0.05, y: A.y + 0.25 });
  if (pt.sostener) { const v = K.malla(K.cilindro(0.008, 0.008, 0.9, 4), AT.maderaD, { grosor: 0.002 }); v.position.y = -0.1; pt.sostener(v, 'D'); }   // la vara ahorquillada del paidotriba
  return P;
}

/* ---------- 36 · EL SOFISTA: el primer maestro que cobra ⚖️ ---------- */
/* 0: el sofista de pie, con su manto de púrpura y su bolsa · 1: su tarima de madera · 2: el público que paga por
   oír · 3: la puerta de la escuela de Isócrates, con el precio grabado (Χ: mil dracmas por el curso completo) */
export function sofista(K, n) {
  const P = pieza(ANCLAS.sofista), A = ANCLAS.sofista;
  const alto = n >= 1 ? 0.14 : 0;
  if (n >= 1) { en(P, caja(K, 0.7, 0.14, 0.5, '#c9a875', { grosor: 0.005 }), A.x, A.y, 0.07); en(P, caja(K, 0.3, 0.07, 0.2, '#b08a55', { grosor: 0.004 }), A.x, A.y + 0.32, 0.035); }
  const so = actor(P, K, { piel: 1, pelo: 'rizos', colorPelo: '#3a2c20', barba: true, ropa: 'tunica', colorRopa: '#7a4a6e', orla: '#c9a24a', chal: '#c9a24a', k: 'sofista' }, 'narrar', A.x, A.y, { x: A.x + 0.4, y: A.y + 1 });
  so.obj.position.y = alto;
  if (so.sostener) { const b = K.malla(K.esfera(0.05, 0.6), '#c9a24a', { grosor: 0.003 }); b.scale.set(1, 1.2, 1); b.position.y = -0.06; so.sostener(b, 'I'); }   // la bolsa
  if (n >= 2) [[-0.45, 0.6], [0.0, 0.75], [0.45, 0.6]].forEach(([dx, dz], i) => actor(P, K, { ...aprendiz(i + 6), colorRopa: ['#e8d8b0', '#f4efe2', '#e2d4b4'][i], oficio: true, k: 'oyente' }, 'suelo', A.x + dx, A.y + dz, { x: A.x, y: A.y }));
  if (n >= 3) {                                         // la puerta de la escuela de Isócrates, con su precio
    const pu = new THREE.Group(); en(P, pu, A.x + 0.85, A.y - 0.35, 0, -0.5);
    [-1, 1].forEach(l => pu.add(ubic(caja(K, 0.1, 0.7, 0.12, AT.marmol, { grosor: 0.004 }), l * 0.25, 0.35, 0)));
    pu.add(ubic(caja(K, 0.62, 0.1, 0.14, AT.marmol, { grosor: 0.004 }), 0, 0.75, 0));
    pu.add(ubic(caja(K, 0.4, 0.62, 0.03, '#6a4a2e', { grosor: 0.003 }), 0, 0.31, 0));
    const tx = texturaCanvas(96, 40, (c, W, H) => { c.fillStyle = AT.marmolL; c.fillRect(0, 0, W, H); c.fillStyle = AT.rojo; c.font = '700 26px Georgia, serif'; c.textAlign = 'center'; c.fillText('Χ', W / 2, 30); });
    const le = plano(K, tx, 0.24, 0.1); le.position.set(0, 0.75, 0.072); pu.add(le);
  }
  return P;
}

/* ---------- 37 · LA PREGUNTA: preguntar en vez de decir ---------- */
/* 0: el cuadrado del Menón dibujado en la arena, con la vara · 1: la diagonal y el cuadrado doble que nace de
   ella, y el muchacho que lo descubre · 2: el banco de mármol del claro · 3: el banco bajo el plátano del Ilisos,
   donde se conversa (el Fedro) */
export function pregunta(K, n) {
  const P = pieza(ANCLAS.pregunta), A = ANCLAS.pregunta, Lc = 0.62;
  pon(P, K.malla(K.cilindro(0.75, 0.75, 0.01, 24), '#e2d3a6', { sinTinta: true, sombra: false }), A.x, A.y, 0.005);   // la arena barrida del claro
  const raya = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), m = caja(K, L, 0.012, 0.025, '#8f7650', { sinTinta: true }); en(P, m, (x0 + x1) / 2, (z0 + z1) / 2, 0.012, -Math.atan2(z1 - z0, x1 - x0)); };
  const h = Lc / 2, x = A.x - 0.15, z = A.y;
  raya(x - h, z - h, x + h, z - h); raya(x + h, z - h, x + h, z + h); raya(x + h, z + h, x - h, z + h); raya(x - h, z + h, x - h, z - h);
  const va = K.malla(K.cilindro(0.008, 0.008, 0.62, 4), AT.maderaD, { grosor: 0.002 }); va.rotation.z = Math.PI / 2 - 0.15; en(P, va, x - h - 0.12, z + h + 0.1, 0.02, 0.4);
  if (n >= 1) {                                         // la diagonal, y el cuadrado sobre ella: el doble, como pide Sócrates
    raya(x - h, z - h, x + h, z + h);
    raya(x + h, z - h, x + h + Lc * 0.7, z); raya(x + h + Lc * 0.7, z, x + h, z + h);
    actor(P, K, { ...aprendiz(5), ropa: 'corta', colorRopa: '#d8cbb0', oficio: true, k: 'esclavoMenon' }, 'agachado', x + 0.1, z + h + 0.25, { x, y: z });
  }
  if (n >= 2) { const b = banco(K, 0.8); en(P, b, A.x + 0.35, A.y + 0.75, 0, 0); }
  if (n >= 3) {                                         // el banco bajo el plátano, con el par que conversa
    const b = banco(K, 0.8); en(P, b, PLATANO.x - 0.75, PLATANO.y + 0.45, 0, -0.3);
    actor(P, K, { ...MAESTRO, oficio: true, k: 'conversan' }, 'narrarSentada', PLATANO.x - 0.95, PLATANO.y + 0.45, { x: PLATANO.x - 0.4, y: PLATANO.y + 0.7 });
    actor(P, K, { ...aprendiz(3), edad: 'adulto', oficio: true, k: 'conversan' }, 'sentado', PLATANO.x - 0.5, PLATANO.y + 0.55, { x: PLATANO.x - 0.95, y: PLATANO.y + 0.45 });
  }
  return P;
}
const pon = (P, m, x, y, h) => en(P, m, x, y, h);

/* ---------- 38 · LA ACADEMIA: la escuela con nombre y lugar (cierra la época) ---------- */
/* el olivar sagrado elegido en la hoja de bocetos. 'obra': el muro a medio levantar y las estacas · 0: el muro bajo,
   el mojón de la entrada y el altar de Prometeo · 1: la casa del jardín de Platón · 2: el santuario de las Musas ·
   3: el banco en hemiciclo donde se enseña, con Platón y dos discípulos */
export function academia(K, etapa) {
  const P = pieza(ANCLAS.academia), A = ANCLAS.academia, n = typeof etapa === 'number' ? etapa : -1;
  const W = ACADEMIA.x1 - ACADEMIA.x0, D = ACADEMIA.z1 - ACADEMIA.z0;
  const mu = muroBajo(K, W, D, { hueco: 0.62, alto: etapa === 'obra' ? 0.1 : 0.22 }); en(P, mu, A.x, A.y);
  if (etapa === 'obra') {                               // las estacas de la cerca y las piedras por poner
    [[-0.5, D / 2 + 0.15], [0.5, D / 2 + 0.15], [-W / 2 - 0.1, 0], [W / 2 + 0.1, -0.5]].forEach(([dx, dz]) => en(P, K.malla(K.cilindro(0.012, 0.014, 0.4, 4), AT.madera, { grosor: 0.003 }), A.x + dx, A.y + dz, 0.2));
    for (let k = 0; k < 6; k++) en(P, caja(K, 0.12, 0.07, 0.08, AT.rocaL, { grosor: 0.003 }), A.x + 0.7 + (k % 3) * 0.14, A.y + D / 2 + 0.3 + Math.floor(k / 3) * 0.1, 0.035 + Math.floor(k / 3) * 0.0, k * 0.5);
    return P;
  }
  /* el mojón: «ΗΟΡΟΣ ΤΕΣ ΗΕΚΑΔΕΜΕΙΑΣ», junto a la entrada */
  const ho = new THREE.Group(); en(P, ho, A.x - 0.48, A.y + D / 2 - 0.22);
  ho.add(ubic(caja(K, 0.15, 0.4, 0.09, AT.marmol, { grosor: 0.004 }), 0, 0.2, 0));
  const tx = texturaCanvas(96, 192, (c, Wc) => { c.fillStyle = AT.marmol; c.fillRect(0, 0, Wc, 192); c.fillStyle = '#5a5246'; c.font = '600 19px Georgia, serif'; c.textAlign = 'center'; ['ΗΟΡΟΣ', 'ΤΕΣ', 'ΗΕΚΑ', 'ΔΕΜΕ', 'ΙΑΣ'].forEach((f, i) => c.fillText(f, 48, 36 + i * 32)); });
  const lam = plano(K, tx, 0.13, 0.36); lam.position.set(0, 0.2, 0.046); ho.add(lam);
  const al = altar(K, 0.95); en(P, al, A.x, A.y + 1.15, 0, 0);                 // el altar de Prometeo, a la entrada: de aquí sale la carrera de antorchas
  if (n >= 1) {                                         // la casa del jardín de Platón, en el rincón del noreste
    const c = new THREE.Group(); en(P, c, A.x + 1.0, A.y - 0.9, 0, 0.0);
    c.add(ubic(caja(K, 0.72, 0.42, 0.6, '#f0e9d8', { grosor: 0.008 }), 0, 0.21, 0));
    [-1, 1].forEach(l => { const t = K.malla(K.caja(0.8, 0.03, 0.38), l < 0 ? AT.tejaD : AT.tejaL, { grosor: 0.006 }); t.rotation.x = l * 0.42; t.position.set(0, 0.5, l * 0.16); c.add(t); });
    c.add(ubic(caja(K, 0.18, 0.28, 0.02, '#4a3a28', { sinTinta: true }), 0.12, 0.14, 0.305));
  }
  if (n >= 2) { const ms = museion(K); en(P, ms, A.x - 0.85, A.y - 0.2, 0, 0); }   // el santuario de las Musas, al oeste
  if (n >= 3) {                                         // el hemiciclo: el banco curvo donde enseña Platón, en el centro del olivar
    const E = { x: A.x + 0.15, y: A.y + 0.6 };
    const sector = (r0, r1, a0, a1) => { const sh = new THREE.Shape(); sh.absarc(0, 0, r1, a0, a1, false); sh.absarc(0, 0, r0, a1, a0, true); sh.closePath(); return sh; };
    const losa = (sh, hh, color) => { const geo = new THREE.ExtrudeGeometry(sh, { depth: hh, bevelEnabled: false, curveSegments: 20 }); geo.userData.propia = true; geo.rotateX(-Math.PI / 2); return K.malla(geo, color, { grosor: 0.004 }); };
    const ex = new THREE.Group(); en(P, ex, E.x, E.y, 0, 0);
    ex.add(losa(sector(0.42, 0.56, 0.15, Math.PI - 0.15), 0.12, AT.marmol), losa(sector(0.56, 0.61, 0.15, Math.PI - 0.15), 0.26, AT.marmolD));
    actor(P, K, { piel: 1, pelo: 'corto', colorPelo: '#8a8478', barba: '#8a8478', ropa: 'tunica', colorRopa: '#f4efe2', chal: '#3f7fb5', oficio: true, k: 'platon' }, 'narrarSentada', E.x, E.y - 0.48, { x: E.x, y: E.y + 0.5 });
    actor(P, K, { ...aprendiz(7), edad: 'adulto', oficio: true, k: 'discipulo' }, 'sentado', E.x - 0.36, E.y - 0.32, { x: E.x, y: E.y - 0.1 });
    actor(P, K, { ...aprendiz(8), edad: 'adulto', oficio: true, k: 'discipulo' }, 'sentado', E.x + 0.36, E.y - 0.32, { x: E.x, y: E.y - 0.1 });
  }
  return P;
}

/* ---------- la luz de la noche: la lámpara de aceite de barro en su pie de bronce ---------- */
export function lampara(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  g.add(ubic(K.malla(K.cilindro(0.012, 0.04, 0.5, 6), AT.bronce, { grosor: 0.004 }), 0, 0.25, 0));
  const c = K.malla(K.esfera(0.05, 0.6), '#b5603a', { grosor: 0.003 }); c.scale.set(1.3, 0.5, 0.9); c.position.y = 0.52; g.add(c);
  const llama = new THREE.Group(); llama.position.set(0.06, 0.55, 0); g.add(llama); g.userData.llama = llama;
  const f = K.malla(K.cono(0.022, 0.07, 6), '#ffd27a', { sinTinta: true, sombra: false, emissive: '#ffb13b', emissiveIntensity: 1 }); f.position.y = 0.035; llama.add(f);
  return g;
}

/* LAS PIEZAS: con su índice de saber para la auditoría de etapas (juego3d/qa.html) */
const enArena = f => (K, n) => { const P = f(K, n); P.arena = true; return P; };
export const PIEZAS = [
  { id: 'cera', i: 33, crear: enArena(cera) },
  { id: 'lira', i: 34, crear: enArena(liraPieza) },
  { id: 'palestra', i: 35, crear: enArena(palestra) },
  { id: 'sofista', i: 36, crear: enArena(sofista) },
  { id: 'pregunta', i: 37, crear: enArena(pregunta) },
  { id: 'academia', i: 38, crear: enArena(academia) },
];
