/* ============================================================
   sumer/piezas
   Los seis saberes de Sumer en 3D, cada uno con sus etapas (la máxima del proyecto: subir de nivel se VE,
   con piezas nuevas; se audita por diff de píxeles en juego3d/qa.html). Las posiciones son las del motor
   2D (07-sumer.js, ESCENAS_SABER), para que la consejera, los anillos y los toques caigan donde deben.
   Cada pieza devuelve { obj, anim, ancla, toc, actores } como las de la Época 1 (src/piezas.js).
   ============================================================ */
import * as THREE from 'three';
import { pieza, actor, ponerEn, texturaCanvas, vasija } from '../piezas.js';
import { crearPersona } from '../actores.js';
import { SU, casaDeCana, escalera } from './monumentos.js';

export const ANCLAS = {
  tablilla: { x: 11.3, y: 6.3 }, calamo: { x: 10.2, y: 7.9 }, calculos: { x: 12.4, y: 8.8 }, listas: { x: 8.6, y: 9.4 },
  dictado: { x: 9.9, y: 8.4 }, edubba: { x: 9.5, y: 6.2 }, toldo: { x: 10.22, y: 8.58 }, copia: { x: 10.35, y: 9.0 },
};
/* los aprendices de Sumer: túnica de lana clara, el pelo negro liso, trenzado o rapado (06-gente del 2D) */
export function aprendiz(i, extra = {}) {
  return { edad: 'nino', piel: (i + 1) % 4, pelo: ['corto', 'trenza', 'rapado'][i % 3], colorPelo: '#241c16', ropa: 'tunica', colorRopa: ['#e8dcc8', '#e2d3b8', '#ece2cf'][i % 3], orla: '#b98a5c', ...extra };
}
export const ESCRIBA = { piel: 2, pelo: 'rapado', ropa: 'kaunakes', colorRopa: '#e6dcc4', colorMechon: '#d8ccb0', torsoDesnudo: true };

/* ---------- las tablillas: arcilla con cuñas (una textura por mano: torcida, recta, fina, numérica, lista) ---------- */
function marcas(tipo) {
  return texturaCanvas(64, 80, (c, w, h) => {
    c.fillStyle = tipo === 'cocida' ? '#b27449' : '#c9a372'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(0, 0, w, 6);
    const fila = (y, n, torcida) => {
      for (let i = 0; i < n; i++) {
        const x = 7 + i * (50 / n) + (torcida ? Math.sin(i * 3.1 + y) * 2.5 : 0), yy = y + (torcida ? Math.cos(i * 2.3 + y) * 2 : 0), s = torcida ? 3.4 : 2.6;
        c.fillStyle = '#5e4128'; c.beginPath(); c.moveTo(x, yy); c.lineTo(x + s * 1.8, yy + s * 0.6); c.lineTo(x, yy + s * 1.3); c.fill();
        if (!torcida) { c.fillRect(x + s * 1.7, yy + s * 0.55, 3.2, 1.1); }
      }
    };
    if (tipo === 'numerica') {
      for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { c.fillStyle = '#5e4128'; c.beginPath(); c.arc(12 + i * 13, 16 + r * 20, r === 1 ? 4 : 3, 0, 7); c.fill(); }
    } else if (tipo === 'lista') {
      c.strokeStyle = '#7a5a3c'; c.lineWidth = 1; for (let y = 10; y < h - 4; y += 9) { c.beginPath(); c.moveTo(4, y + 6); c.lineTo(w - 4, y + 6); c.stroke(); fila(y, 4, false); }
      c.beginPath(); c.moveTo(w / 2, 6); c.lineTo(w / 2, h - 4); c.stroke();
    } else {
      const n = tipo === 'torcida' ? 3 : tipo === 'recta' ? 4 : 6;
      for (let r = 0; r < n; r++) fila(12 + r * (60 / n), tipo === 'fina' ? 7 : 5, tipo === 'torcida');
      if (tipo === 'torcida') { c.fillStyle = '#c0392b'; c.beginPath(); c.moveTo(38, 30); c.lineTo(46, 33); c.lineTo(38, 36); c.fill(); }
    }
  });
}
function tablillaMarcada(K, tipo, w = 0.13, d = 0.17, alto = 0.025) {
  const g = new THREE.Group(), mapa = marcas(tipo);
  const cuerpo = new THREE.Mesh(K.caja(w, alto, d), K.mat(tipo === 'cocida' ? '#a86c42' : '#bf9869')); cuerpo.castShadow = true; g.add(cuerpo);
  const cara = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, d * 0.94), K.matMapa(mapa)); cara.rotation.x = -Math.PI / 2; cara.position.y = alto / 2 + 0.002; g.add(cara);
  return g;
}
const tablillaLisa = (K, color = SU.arcilla) => K.malla(K.caja(0.09, 0.022, 0.12), color, { grosor: 0.005 });
/* un atril de caña con una tablilla parada (para las que se muestran) */
function atril(K, tipo, alto = 0.34) {
  const g = new THREE.Group();
  [-1, 1].forEach(l => { const p = K.malla(K.cilindro(0.012, 0.014, alto, 5), SU.canaD, { grosor: 0.005 }); p.position.set(l * 0.08, alto / 2, -0.04); p.rotation.x = 0.15; g.add(p); });
  const t = tablillaMarcada(K, tipo, 0.15, 0.2); t.rotation.x = -1.2; t.position.set(0, alto - 0.02, 0); g.add(t);
  return g;
}
const estera = (K, w, d, color = SU.estera) => {
  const g = new THREE.Group(), m = K.malla(K.caja(w, 0.012, d), color, { sinTinta: true, sombra: false }); m.position.y = 0.006; g.add(m);
  for (let i = 1; i < Math.round(w / 0.09); i++) { const r = K.malla(K.caja(0.012, 0.004, d * 0.96), SU.esteraD, { sinTinta: true, sombra: false }); r.position.set(-w / 2 + i * 0.09, 0.014, 0); g.add(r); }
  return g;
};
/* coloca una malla (position/rotation/scale de three son de solo lectura: no sirven con Object.assign) */
const oa = (m, p) => { if (p.position) m.position.copy(p.position); if (p.rotation) m.rotation.copy(p.rotation); if (p.scale) m.scale.copy(p.scale); return m; };
const punto = (K) => { const s = K.malla(K.esfera(0.035), SU.oro, { emissive: SU.oro, emissiveIntensity: 0.35, grosor: 0.006 }); return s; };

/* ---------- 16 · LA TABLILLA DE ARCILLA: la mesa, el tendal, el canasto y el horno ---------- */
export function tablilla(K, n) {
  const P = pieza(ANCLAS.tablilla), A = ANCLAS.tablilla;
  const mesa = new THREE.Group();
  mesa.add(oa(K.malla(K.caja(0.72, 0.2, 0.44), SU.adobeL, { grosor: 0.01 }), { position: new THREE.Vector3(0, 0.1, 0) }));
  const barro = K.malla(K.esfera(0.12), SU.arcillaD, { grosor: 0.008 }); barro.scale.set(1.2, 0.55, 1); barro.position.set(-0.2, 0.25, 0); mesa.add(barro);
  const grande = tablillaMarcada(K, 'recta', 0.16, 0.2); grande.position.set(0.1, 0.215, 0.02); grande.rotation.y = 0.2; mesa.add(grande);
  const chica = tablillaLisa(K); chica.position.set(0.26, 0.215, -0.1); mesa.add(chica);
  ponerEn(P, mesa, A.x, A.y, -0.25);
  const cantaro = vasija(K, [[0.001, 0], [0.09, 0.02], [0.12, 0.12], [0.1, 0.24], [0.05, 0.3], [0.055, 0.34]], SU.terracota, false); ponerEn(P, cantaro, A.x + 0.5, A.y + 0.2);
  actor(P, K, { ...ESCRIBA, k: 'copista', oficio: true, titulo: 'Copista', texto: 'amasa el barro y alisa la tablilla' }, 'moldear', A.x - 0.15, A.y + 0.6, A);
  if (n >= 1) {                                         // el tendal: una estera en alto donde se secan al sol
    const t = new THREE.Group();
    [[-0.34, -0.14], [0.34, -0.14], [-0.34, 0.14], [0.34, 0.14]].forEach(([x, z]) => { const p = K.malla(K.cilindro(0.018, 0.02, 0.24, 5), SU.madera, { grosor: 0.005 }); p.position.set(x, 0.12, z); t.add(p); });
    const m = estera(K, 0.8, 0.36); m.position.y = 0.24; t.add(m);
    for (let i = 0; i < 8; i++) { const tb = tablillaLisa(K, i % 2 ? SU.arcilla : '#c9a372'); tb.position.set(-0.3 + (i % 4) * 0.2, 0.265, -0.08 + Math.floor(i / 4) * 0.16); t.add(tb); }
    ponerEn(P, t, A.x - 0.35, A.y - 0.85, 0.3);
  }
  if (n >= 2) {                                         // el canasto del taller, lleno, y la pila junto a la mesa
    const c = new THREE.Group();
    c.add(oa(K.malla(K.cilindro(0.2, 0.15, 0.28, 12), SU.cana, { grosor: 0.01 }), { position: new THREE.Vector3(0, 0.14, 0) }));
    for (let i = 0; i < 3; i++) c.add(oa(K.malla(K.toro(0.18 - i * 0.015, 0.012, Math.PI * 2, 0.5), SU.canaD, { sinTinta: true }), { position: new THREE.Vector3(0, 0.06 + i * 0.09, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0) }));
    for (let i = 0; i < 7; i++) { const tb = tablillaLisa(K); tb.position.set(-0.08 + (i % 3) * 0.08, 0.29 + Math.floor(i / 3) * 0.02, -0.05 + (i % 2) * 0.08); tb.rotation.y = i; c.add(tb); }
    ponerEn(P, c, A.x - 0.62, A.y - 0.3);
    for (let i = 0; i < 6; i++) { const tb = tablillaLisa(K); ponerEn(P, tb, A.x + 0.3, A.y + 0.1, i * 0.2); tb.position.y = 0.011 + i * 0.022; }
  }
  if (n >= 3) {                                         // el horno de cocer: lo escrito ya no teme a la lluvia
    const h = new THREE.Group();
    const cupula = K.malla(new THREE.SphereGeometry(0.34, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), SU.adobeD, { grosor: 0.012 }); cupula.scale.y = 0.95; h.add(cupula);
    const aro = K.malla(K.cilindro(0.36, 0.38, 0.08, 16), SU.adobe, { grosor: 0.01 }); aro.position.y = 0.04; h.add(aro);
    const boca = K.malla(K.caja(0.16, 0.14, 0.06), '#ff8a3a', { emissive: '#ff6a1a', emissiveIntensity: 0.9, sinTinta: true }); boca.position.set(0, 0.08, 0.31); h.add(boca);
    const chim = K.malla(K.cilindro(0.05, 0.06, 0.08, 8), SU.adobeS, { grosor: 0.006 }); chim.position.y = 0.34; h.add(chim);
    for (let i = 0; i < 5; i++) { const tb = tablillaLisa(K, '#a86c42'); tb.position.set(0.42 + (i % 2) * 0.06, 0.011 + i * 0.022, 0.1); tb.rotation.y = i * 0.3; h.add(tb); }
    h.userData.vivo = true; ponerEn(P, h, A.x + 0.95, A.y + 0.65, -0.6);
    P.horno = boca;
    P.vivos.push(t => { boca.material.emissiveIntensity = 0.7 + 0.3 * Math.sin(t * 3.1) * Math.sin(t * 1.7); });
    const lleva = crearPersona(K, { ...ESCRIBA, pelo: 'corto', colorPelo: '#241c16', ropa: 'corta', colorRopa: '#d8ccb0', torsoDesnudo: true, sinFlecos: true, titulo: 'Aprendiz del horno', texto: 'lleva las tablillas a cocer' });
    const bandeja = K.malla(K.caja(0.22, 0.03, 0.16), SU.madera, { grosor: 0.006 }); bandeja.position.set(0, 0.02, 0); const cb = new THREE.Group(); cb.add(bandeja); for (let i = 0; i < 3; i++) { const tb = tablillaLisa(K); tb.position.set(-0.07 + i * 0.07, 0.045, 0); cb.add(tb); }
    lleva.sostener(cb, 'I'); P.obj.add(lleva.obj); P.actores.push(lleva);
    const a0 = P.en(A.x + 0.35, A.y + 0.35), a1 = P.en(A.x + 0.85, A.y + 1.1), e = { pose: 'cargar' };
    P.vivos.push((t, dt) => {                           // va y viene de la mesa al horno (26 s, como el 2D)
      const c = (t % 26) / 26, ida = c < 0.5, k = ida ? Math.min(1, c / 0.4) : Math.min(1, (c - 0.5) / 0.4), u = ida ? k : 1 - k, anda = (ida ? c : c - 0.5) < 0.4;
      lleva.obj.position.lerpVectors(a0, a1, u); lleva.obj.rotation.y = Math.atan2(a1.x - a0.x, a1.z - a0.z) + (ida ? 0 : Math.PI);
      e.pose = anda ? 'cargar' : 'quieto'; e.dt = dt; lleva.anim(t, e); cb.visible = ida;
    });
  }
  return P;
}

/* ---------- 17 · EL CÁLAMO: las cañas, la tablilla de práctica, la mano recta y la muestra del mejor ---------- */
export function calamo(K, n) {
  const P = pieza(ANCLAS.calamo), A = ANCLAS.calamo;
  const jarra = vasija(K, [[0.001, 0], [0.1, 0.02], [0.13, 0.14], [0.11, 0.28], [0.08, 0.34], [0.09, 0.38]], '#b58a5a', false); ponerEn(P, jarra, A.x, A.y);
  for (let i = 0; i < 6; i++) {                        // los cálamos cortados, en la jarra y sueltos
    const c = K.malla(K.cilindro(0.008, 0.01, 0.6, 5), SU.canaL, { grosor: 0.004 }); const a = i * 1.1;
    ponerEn(P, c, A.x + Math.cos(a) * 0.03, A.y + Math.sin(a) * 0.03); c.rotation.set(Math.cos(a) * 0.18, 0, Math.sin(a) * 0.18); c.position.y = 0.55;
  }
  for (let i = 0; i < 3; i++) { const c = K.malla(K.cilindro(0.008, 0.01, 0.4, 5), SU.cana, { grosor: 0.004 }); c.rotation.z = Math.PI / 2; ponerEn(P, c, A.x + 0.28, A.y + 0.12 + i * 0.05, 0.3 + i * 0.2); c.position.y = 0.01 + i * 0.012; }
  actor(P, K, { ...aprendiz(4), k: 'practicanteSu', oficio: true, titulo: 'Aprendiz', texto: 'ensaya la cuña: la mano aprende a fuerza de barro' }, 'escribir', A.x + 0.25, A.y - 0.35, { x: A.x + 0.25, y: A.y + 0.5 });
  if (n >= 1) {                                         // la tablilla de práctica en su atril, con su banquito: cuñas torcidas y gordas
    ponerEn(P, atril(K, 'torcida', 0.44), A.x + 0.75, A.y + 0.15, -0.5);
    const b = K.malla(K.caja(0.26, 0.16, 0.2), SU.madera, { grosor: 0.006 }); ponerEn(P, b, A.x + 0.72, A.y + 0.5); b.position.y = 0.08;
    const e = estera(K, 0.5, 0.34); ponerEn(P, e, A.x + 0.72, A.y + 0.4);
  }
  if (n >= 2) {                                         // la mano se endereza: tres tablillas terminadas, apoyadas en el muro
    for (let i = 0; i < 3; i++) { const t = tablillaMarcada(K, 'recta'); t.rotation.x = -1.3; ponerEn(P, t, A.x - 0.55 + i * 0.2, A.y - 0.62); t.position.y = 0.09; }
    const e = estera(K, 0.5, 0.34); ponerEn(P, e, A.x + 0.25, A.y - 0.35);
  }
  if (n >= 3) {                                         // la muestra junto a la puerta: la tablilla fina del mejor aprendiz
    const c = new THREE.Group();
    [[-0.12, 0], [0.12, 0], [0, -0.14]].forEach(([x, z]) => { const p = K.malla(K.cilindro(0.015, 0.018, 0.62, 5), SU.madera, { grosor: 0.005 }); p.position.set(x, 0.29, z); p.rotation.x = z ? 0.3 : -0.08; c.add(p); });
    const t = tablillaMarcada(K, 'fina', 0.22, 0.28, 0.03); t.rotation.x = -1.25; t.position.set(0, 0.46, 0.03); c.add(t);
    const o = punto(K); o.position.set(0.09, 0.62, 0.06); c.add(o);
    ponerEn(P, c, A.x + 0.55, A.y - 0.62, -0.4);
  }
  return P;
}

/* ---------- 18 · LOS CÁLCULOS: las fichas, el cuenco, las bullas selladas y la tablilla numérica ---------- */
function ficha(K, forma, color = SU.arcilla) {
  const s = 0.028, geo = forma === 0 ? K.cono(s, s * 1.8, 6) : forma === 1 ? K.esfera(s * 0.9) : forma === 2 ? K.cilindro(s * 1.1, s * 1.1, s * 0.6, 8) : K.caja(s * 1.4, s * 1.4, s * 1.4);
  return K.malla(geo, color, { sinTinta: true });
}
export function calculos(K, n) {
  const P = pieza(ANCLAS.calculos), A = ANCLAS.calculos;
  ponerEn(P, estera(K, 0.62, 0.44), A.x, A.y, 0.2);
  for (let i = 0; i < 9; i++) { const f = ficha(K, i % 4); f.position.y = 0.035; ponerEn(P, f, A.x - 0.18 + (i % 3) * 0.1, A.y - 0.1 + Math.floor(i / 3) * 0.08); f.position.y = 0.035; }
  const bulla = K.malla(K.esfera(0.075), SU.arcillaD, { grosor: 0.008 }); ponerEn(P, bulla, A.x + 0.18, A.y + 0.05); bulla.position.y = 0.08;
  actor(P, K, { ...ESCRIBA, pelo: 'corto', colorPelo: '#241c16', barba: true, k: 'cuentafichas', oficio: true, titulo: 'El contador', texto: 'cuenta el grano del templo con fichas de barro' }, 'escribir', A.x - 0.25, A.y + 0.5, A);
  P.toc.push({ x: A.x, y: A.y, k: 'sellar' });
  if (n >= 1) {                                         // el cuenco de fichas
    const cu = vasija(K, [[0.001, 0], [0.12, 0.01], [0.15, 0.07], [0.16, 0.1]], SU.terracota, false); ponerEn(P, cu, A.x + 0.45, A.y - 0.2);
    for (let i = 0; i < 6; i++) { const f = ficha(K, i % 4, i % 2 ? SU.arcilla : '#d9b98a'); ponerEn(P, f, A.x + 0.4 + (i % 3) * 0.05, A.y - 0.22 + Math.floor(i / 3) * 0.05); f.position.y = 0.09; }
  }
  if (n >= 2) {                                         // el banco de las bullas selladas: el contrato dentro del barro
    const b = new THREE.Group();
    b.add(oa(K.malla(K.caja(0.7, 0.22, 0.26), SU.adobeL, { grosor: 0.01 }), { position: new THREE.Vector3(0, 0.11, 0) }));
    for (let i = 0; i < 4; i++) {
      const bu = K.malla(K.esfera(0.1), i % 2 ? '#b58a5a' : '#a67a4c', { grosor: 0.008 }); bu.position.set(-0.24 + i * 0.16, 0.31, 0); b.add(bu);
      const se = K.malla(K.toro(0.1, 0.012, Math.PI * 2, 0.5), SU.betun, { sinTinta: true }); se.rotation.x = Math.PI / 2 + 0.5; se.position.set(-0.24 + i * 0.16, 0.31, 0); b.add(se);
    }
    const sello = K.malla(K.cilindro(0.04, 0.04, 0.14, 10), SU.lapis, { grosor: 0.005 }); sello.rotation.z = Math.PI / 2; sello.position.set(0.1, 0.25, 0.12); b.add(sello);   // el sello cilíndrico
    const tira = K.malla(K.caja(0.3, 0.012, 0.08), SU.arcilla, { sinTinta: true }); tira.position.set(-0.12, 0.225, 0.12); b.add(tira);
    ponerEn(P, b, A.x - 0.5, A.y + 0.45, 0.2);
  }
  if (n >= 3) {                                         // la tablilla numérica, grande y a la vista: el signo ya no necesita la ficha
    const c = new THREE.Group();
    [[-0.16, 0], [0.16, 0], [0, -0.18]].forEach(([x, z]) => { const p = K.malla(K.cilindro(0.018, 0.022, 0.85, 5), SU.madera, { grosor: 0.005 }); p.position.set(x, 0.4, z); p.rotation.x = z ? 0.3 : -0.08; c.add(p); });
    const t = tablillaMarcada(K, 'numerica', 0.34, 0.4, 0.035); t.rotation.x = -1.25; t.position.set(0, 0.62, 0.04); c.add(t);
    ponerEn(P, c, A.x + 0.6, A.y + 0.1, -0.7);
  }
  return P;
}

/* ---------- 19 · LAS LISTAS: la estela, la segunda columna, la losa gemela y el estante de tablillas ---------- */
function estela(K, alto, columnas) {
  const g = new THREE.Group(), w = 0.34;
  g.add(oa(K.malla(K.caja(w + 0.08, 0.08, 0.2), SU.adobeD, { grosor: 0.008 }), { position: new THREE.Vector3(0, 0.04, 0) }));
  const piedra = K.malla(K.caja(w, alto, 0.1), '#b9b3a4', { grosor: 0.012 }); piedra.position.y = 0.08 + alto / 2; g.add(piedra);
  const tope = K.malla(K.cilindro(w / 2, w / 2, 0.1, 12, 0.5), '#b9b3a4', { grosor: 0.012 }); tope.rotation.x = Math.PI / 2; tope.scale.set(1, 1, 0.5); tope.position.y = 0.08 + alto; g.add(tope);
  const mapa = texturaCanvas(64, 110, (c, W, H) => {
    c.fillStyle = '#c4beae'; c.fillRect(0, 0, W, H); c.fillStyle = '#6e685a';
    const cols = columnas;
    for (let k = 0; k < cols; k++) for (let y = 8; y < H - 6; y += 9) for (let i = 0; i < 3; i++) { const x = 6 + k * (56 / cols) + i * (15 / cols); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 5, y + 2); c.lineTo(x, y + 4); c.fill(); }
    c.strokeStyle = '#8a8474'; for (let k = 1; k < cols; k++) { c.beginPath(); c.moveTo(k * W / cols, 4); c.lineTo(k * W / cols, H - 4); c.stroke(); }
  });
  const cara = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.86, alto * 0.9), K.matMapa(mapa)); cara.position.set(0, 0.08 + alto / 2, 0.051); g.add(cara);
  return g;
}
export function listas(K, n) {
  const P = pieza(ANCLAS.listas), A = ANCLAS.listas;
  ponerEn(P, estela(K, 0.5, n >= 2 ? 2 : 1), A.x, A.y, 0.35);
  actor(P, K, { ...aprendiz(7), k: 'recitador', oficio: true, titulo: 'Aprendiz', texto: 'recita la lista de los pájaros' }, 'leer', A.x + 0.4, A.y + 0.5, { x: A.x + 0.4, y: A.y + 2 });
  if (n >= 1) ponerEn(P, estela(K, 0.34, 1), A.x - 0.65, A.y + 0.2, 0.55);
  if (n >= 2) ponerEn(P, estela(K, 0.44, 2), A.x - 1.1, A.y + 0.55, 0.7);
  if (n >= 3) {                                         // el estante: la primera biblioteca escolar
    const e = new THREE.Group();
    [0, 0.2, 0.4].forEach(y => e.add(oa(K.malla(K.caja(0.7, 0.04, 0.2), SU.madera, { grosor: 0.006 }), { position: new THREE.Vector3(0, y + 0.02, 0) })));
    [-1, 1].forEach(l => e.add(oa(K.malla(K.caja(0.04, 0.46, 0.2), SU.maderaD, { grosor: 0.006 }), { position: new THREE.Vector3(l * 0.35, 0.23, 0) })));
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) { const t = tablillaLisa(K, i % 2 ? SU.arcilla : '#a86c42'); t.rotation.set(-1.4, 0, 0); t.position.set(-0.24 + i * 0.16, 0.1 + r * 0.2, 0); e.add(t); }
    ponerEn(P, e, A.x - 0.35, A.y + 0.95, 0.2);
  }
  return P;
}
/* LA MESA DE COPIA (llega con las listas dominadas): el modelo del maestro arriba, el intento abajo, y la cuña
   roja que late mientras haya copias esperando (P.cuna, la anima la época) */
export function mesaCopia(K) {
  const P = pieza(ANCLAS.copia), A = ANCLAS.copia;
  const m = new THREE.Group();
  m.add(oa(K.malla(K.caja(0.5, 0.16, 0.32), SU.adobeL, { grosor: 0.01 }), { position: new THREE.Vector3(0, 0.08, 0) }));
  const modelo = tablillaMarcada(K, 'fina', 0.17, 0.22); modelo.rotation.x = -1.1; modelo.position.set(-0.08, 0.28, -0.08); m.add(modelo);
  const intento = tablillaMarcada(K, 'torcida', 0.15, 0.19); intento.position.set(0.1, 0.175, 0.05); m.add(intento);
  const cuna = K.malla(K.cono(0.03, 0.07, 3), '#d23b28', { emissive: '#ff3a1a', emissiveIntensity: 0.6, sinTinta: true }); cuna.rotation.z = -Math.PI / 2; cuna.position.set(0.12, 0.2, 0.05); m.add(cuna);
  m.userData.vivo = true; ponerEn(P, m, A.x, A.y, -0.3);
  P.cuna = cuna;
  actor(P, K, { ...ESCRIBA, k: 'mesacopia', titulo: 'El maestro de la copia', texto: 'pone el modelo arriba y el intento abajo: el error se ve' }, 'escribir', A.x - 0.3, A.y - 0.2, A);
  return P;
}

/* ---------- 29 · EL DICTADO: la voz que viaja del oído a la mano (solo dominado) ---------- */
export function dictado(K, n) {
  const P = pieza(ANCLAS.dictado), A = ANCLAS.dictado;
  actor(P, K, { edad: 'adulto', piel: 1, pelo: 'melena', colorPelo: '#241c16', ropa: 'tunica', colorRopa: '#d9c9a8', orla: '#8a5a3c', k: 'dictado', titulo: 'Belessunu', texto: 'dicta: la voz se vuelve señal compartida' }, 'dictar', A.x, A.y, { x: A.x + 0.7, y: A.y + 0.15 });
  actor(P, K, { ...aprendiz(2), k: 'dictado2', titulo: 'Aprendiz', texto: 'escribe lo que oye: si oíste mal, se corrige distinto' }, 'escribir', A.x + 0.7, A.y + 0.15, A);
  ponerEn(P, estera(K, 1.0, 0.5), A.x + 0.35, A.y + 0.08);
  if (n >= 1) { const e = estera(K, 0.5, 0.34); ponerEn(P, e, A.x - 0.45, A.y + 1.25); for (let i = 0; i < 4; i++) { const t = tablillaLisa(K); ponerEn(P, t, A.x - 0.6 + i * 0.1, A.y + 1.25); t.position.y = 0.024; } }
  if (n >= 2) [[A.x - 0.6, A.y + 0.75], [A.x - 0.25, A.y + 1.35]].forEach(([x, y], i) => actor(P, K, { ...aprendiz(9 + i), titulo: 'Aprendiz', texto: 'espera su turno para escribir' }, 'escribir', x, y, A));
  if (n >= 3) {                                         // el dictado coral: una voz, tres manos, y las tres tablillas comparadas
    const c = new THREE.Group();                        // un tablero de caña con las tres tablillas lado a lado, y el que compara
    c.add(oa(K.malla(K.caja(0.86, 0.5, 0.05), SU.cana, { grosor: 0.008 }), { position: new THREE.Vector3(0, 0.5, -0.04), rotation: new THREE.Euler(-0.18, 0, 0) }));
    [-0.4, 0.4].forEach(x => c.add(oa(K.malla(K.cilindro(0.022, 0.026, 0.82, 5), SU.maderaD, { grosor: 0.005 }), { position: new THREE.Vector3(x, 0.41, -0.02) })));
    [-0.26, 0, 0.26].forEach((x, i) => { const t = tablillaMarcada(K, i === 1 ? 'fina' : i ? 'recta' : 'torcida', 0.19, 0.25, 0.03); t.rotation.x = -1.39; t.position.set(x, 0.52, 0.0); c.add(t); });
    const o = punto(K); o.position.set(0, 0.82, 0.0); c.add(o);
    ponerEn(P, c, A.x + 1.6, A.y + 1.35, -0.7);
    actor(P, K, { ...aprendiz(5), titulo: 'Aprendiz', texto: 'compara las tres tablillas: evaluar es mirar juntas las respuestas' }, 'leer', A.x + 1.95, A.y + 1.95, { x: A.x + 1.6, y: A.y + 1.35 });
  }
  return P;
}

/* ---------- 30 · LA EDUBBA: la casa del maestro (adobe) y, con las etapas, el porche de cañas de la clase ---------- */
/* etapa: 'obra' (recién creada: cimiento, adobes y andamio), 'muros' (encendiendo el saber) o 0-3 (dominada) */
export const CASA = { x: 9.5, y: 6.2, w: 1.7, d: 1.4 };
export const PORCHE = { x: 8.6, y: 8.35, largo: 1.6, ancho: 1.1 };
export const ASIENTO_UMMIA = { x: 8.15, y: 7.85 };
export function edubbaCasa(K, etapa) {
  const P = pieza(ANCLAS.edubba), C = CASA, g = new THREE.Group(); ponerEn(P, g, C.x, C.y);
  const W = C.w, D = C.d, e = 0.14, H = etapa === 'obra' ? 0.12 : etapa === 'muros' ? 0.36 : 0.72, completa = typeof etapa === 'number';
  g.add(oa(K.malla(K.caja(W + 0.1, 0.06, D + 0.1), SU.adobeD, { grosor: 0.01 }), { position: new THREE.Vector3(0, 0.03, 0) }));   // el cimiento
  const muro = (w, d, x, z) => {
    g.add(oa(K.malla(K.caja(w, H, d), SU.adobe, { grosor: 0.012 }), { position: new THREE.Vector3(x, H / 2 + 0.03, z) }));
    for (let y = 0.12; y < H - 0.02; y += 0.12) g.add(oa(K.malla(K.caja(w + 0.005, 0.008, d + 0.005), SU.adobeS, { sinTinta: true }), { position: new THREE.Vector3(x, y + 0.03, z) }));   // las hiladas de adobe
  };
  const puerta = 0.36;
  muro(W, e, 0, -D / 2 + e / 2); muro(e, D, -W / 2 + e / 2, 0); muro(e, D, W / 2 - e / 2, 0);
  muro((W - puerta) / 2, e, -(W + puerta) / 4, D / 2 - e / 2); muro((W - puerta) / 2, e, (W + puerta) / 4, D / 2 - e / 2);
  if (!completa) {                                     // la obra: andamio de palos, adobes apilados y el molde
    for (let i = 0; i < 4; i++) g.add(oa(K.malla(K.cilindro(0.02, 0.022, 0.95, 5), SU.madera, { grosor: 0.005 }), { position: new THREE.Vector3(-W / 2 + 0.15 + i * (W - 0.3) / 3, 0.5, D / 2 + 0.14) }));
    g.add(oa(K.malla(K.caja(W - 0.1, 0.03, 0.16), SU.maderaD, { grosor: 0.005 }), { position: new THREE.Vector3(0, 0.62, D / 2 + 0.14) }));
    for (let i = 0; i < 12; i++) g.add(oa(K.malla(K.caja(0.16, 0.06, 0.1), i % 2 ? SU.adobe : SU.adobeD, { grosor: 0.005 }), { position: new THREE.Vector3(-W / 2 - 0.35 + (i % 3) * 0.17, 0.03 + Math.floor(i / 3) * 0.06, D / 2 + 0.55) }));
    g.add(oa(K.malla(K.caja(0.3, 0.06, 0.2), SU.madera, { grosor: 0.005 }), { position: new THREE.Vector3(W / 2 + 0.3, 0.03, D / 2 + 0.4) }));
    g.add(oa(K.malla(K.esfera(0.16), SU.arcillaD, { grosor: 0.008 }), { position: new THREE.Vector3(W / 2 + 0.3, 0.06, D / 2 + 0.85), scale: new THREE.Vector3(1.4, 0.4, 1.2) }));
    return P;
  }
  g.add(oa(K.malla(K.caja(W + 0.04, 0.07, D + 0.04), SU.adobeD, { grosor: 0.012 }), { position: new THREE.Vector3(0, H + 0.065, 0) }));   // el techo plano de barro
  for (let i = 0; i <= 8; i++) g.add(oa(K.malla(K.caja(0.08, 0.08, 0.08), SU.adobeL, { grosor: 0.005 }), { position: new THREE.Vector3(-W / 2 + (W * i) / 8, H + 0.14, D / 2) }));   // el pretil
  for (let i = 0; i < 6; i++) { const v = K.malla(K.cilindro(0.028, 0.028, 0.14, 6), SU.palmaD, { grosor: 0.005 }); v.rotation.x = Math.PI / 2; v.position.set(-W / 2 + 0.18 + i * (W - 0.36) / 5, H - 0.02, D / 2 + 0.06); g.add(v); }   // las vigas de palmera asoman
  g.add(oa(K.malla(K.caja(puerta + 0.14, 0.06, e + 0.06), SU.madera, { grosor: 0.006 }), { position: new THREE.Vector3(0, 0.52, D / 2 - e / 2) }));   // el dintel
  const toldillo = K.malla(K.caja(puerta + 0.3, 0.02, 0.3), SU.estera, { grosor: 0.005 }); toldillo.position.set(0, 0.62, D / 2 + 0.12); toldillo.rotation.x = 0.25; g.add(toldillo);
  [-1, 1].forEach(l => g.add(oa(K.malla(K.caja(0.1, 0.06, 0.02), '#3a2a1c', { sinTinta: true }), { position: new THREE.Vector3(l * 0.55, 0.47, D / 2 + 0.002) })));   // las ventanitas
  const esc = escalera(K, { largo: 0.55, alto: H + 0.03, ancho: 0.22, n: 7, color: SU.adobeD, baranda: null }); esc.rotation.y = -Math.PI / 2; esc.position.set(-W / 2 - 0.55, 0, -D / 2 + 0.25); g.add(esc);
  const tinaja = vasija(K, [[0.001, 0], [0.12, 0.02], [0.16, 0.16], [0.13, 0.32], [0.07, 0.4], [0.075, 0.44]], SU.terracota, true); tinaja.position.set(W / 2 + 0.22, 0, D / 2 - 0.1); g.add(tinaja);
  const niv = etapa;
  if (niv >= 1) {                                       // la clase: esteras delante de la casa y el banquito del maestro
    [[8.35, 8.5], [8.95, 8.52]].forEach(([x, y]) => ponerEn(P, estera(K, 0.62, 0.42), x, y));
    const banco = K.malla(K.caja(0.22, 0.16, 0.2), SU.madera, { grosor: 0.006 }); ponerEn(P, banco, ASIENTO_UMMIA.x, ASIENTO_UMMIA.y); banco.position.y = 0.08;
    const jarra = vasija(K, [[0.001, 0], [0.07, 0.02], [0.09, 0.12], [0.06, 0.22], [0.035, 0.26]], SU.terracota, false); ponerEn(P, jarra, 9.55, 8.2);
  }
  if (niv >= 2) {                                       // el patio techado: arcos de caña sobre la clase (se ve a través)
    const po = casaDeCana(K, { largo: PORCHE.largo, ancho: PORCHE.ancho, alto: 0.95, arcos: 5, frente: false, sinEstera: true });
    ponerEn(P, po, PORCHE.x, PORCHE.y);
    [[8.15, 9.05], [9.2, 9.05]].forEach(([x, y]) => ponerEn(P, estera(K, 0.55, 0.36), x, y));
  }
  if (niv >= 3) {                                       // el nicho de Nisaba en la fachada y el asiento propio del ummia
    const ni = new THREE.Group(); ni.position.set(0.52, 0, D / 2 + 0.01); g.add(ni);
    ni.add(oa(K.malla(K.caja(0.3, 0.42, 0.04), SU.cal, { grosor: 0.008 }), { position: new THREE.Vector3(0, 0.36, 0) }));
    ni.add(oa(K.malla(K.caja(0.34, 0.04, 0.06), SU.oro, { grosor: 0.005 }), { position: new THREE.Vector3(0, 0.58, 0.01) }));
    ni.add(oa(K.malla(K.cilindro(0.035, 0.05, 0.18, 8), SU.lapisL, { grosor: 0.005 }), { position: new THREE.Vector3(0, 0.27, 0.04) }));
    ni.add(oa(punto(K), { position: new THREE.Vector3(0, 0.39, 0.05) }));
    const silla = new THREE.Group();
    silla.add(oa(K.malla(K.caja(0.26, 0.2, 0.24), SU.madera, { grosor: 0.006 }), { position: new THREE.Vector3(0, 0.1, 0) }));
    silla.add(oa(K.malla(K.caja(0.26, 0.3, 0.05), SU.maderaD, { grosor: 0.006 }), { position: new THREE.Vector3(0, 0.34, -0.1) }));
    silla.add(oa(K.malla(K.caja(0.22, 0.03, 0.2), SU.rojo, { sinTinta: true }), { position: new THREE.Vector3(0, 0.215, 0.01) }));
    ponerEn(P, silla, ASIENTO_UMMIA.x - 0.25, ASIENTO_UMMIA.y - 0.15, 0.3);
    const azotea = new THREE.Group(); azotea.position.set(-0.2, H + 0.1, -0.1); g.add(azotea);   // la sombra de caña en la azotea: la clase de la tarde
    [[-0.45, -0.35], [0.45, -0.35], [-0.45, 0.35], [0.45, 0.35]].forEach(([x, z]) => azotea.add(oa(K.malla(K.cilindro(0.02, 0.02, 0.42, 5), SU.palma, { grosor: 0.005 }), { position: new THREE.Vector3(x, 0.21, z) })));
    azotea.add(oa(K.malla(K.caja(1.05, 0.03, 0.85), SU.estera, { grosor: 0.006 }), { position: new THREE.Vector3(0, 0.43, 0) }));
    [-1, 1].forEach(l => {                             // los haces de caña con aro a los lados de la puerta: la casa ya es de Nisaba
      const h = new THREE.Group(); h.position.set(l * 0.34, 0, D / 2 + 0.12); g.add(h);
      h.add(oa(K.malla(K.cilindro(0.035, 0.05, 0.95, 7), SU.cana, { grosor: 0.006 }), { position: new THREE.Vector3(0, 0.47, 0) }));
      h.add(oa(K.malla(K.toro(0.07, 0.018, Math.PI * 2, 0.5), SU.oro, { grosor: 0.005 }), { position: new THREE.Vector3(0, 1.0, 0), rotation: new THREE.Euler(0, Math.PI / 2, 0) }));
    });
  }
  P.toc.push({ x: 9.5, y: 6.6, k: 'edubbaCasa' });
  return P;
}

/* ---------- lo que siempre está en el patio: el toldo del dictado, las lámparas, la estatua y las vasijas ---------- */
export function toldo(K) {
  const g = new THREE.Group();
  [[9.55, 8.1, 0.95], [10.95, 8.1, 0.95], [10.95, 9.05, 0.78], [9.55, 9.05, 0.78]].forEach(([x, z, h]) => { const p = K.malla(K.cilindro(0.025, 0.03, h, 6), SU.palma, { grosor: 0.006 }); p.position.set(x, h / 2, z); g.add(p); });
  const techo = new THREE.Group(); techo.position.set(10.25, 0.87, 8.575); techo.rotation.x = 0.18; g.add(techo);
  [-0.48, 0.48].forEach(z => techo.add(oa(K.malla(K.cilindro(0.02, 0.02, 1.5, 5), SU.madera, { grosor: 0.005 }), { position: new THREE.Vector3(0, 0, z), rotation: new THREE.Euler(0, 0, Math.PI / 2) })));
  for (let i = 0; i < 11; i++) techo.add(oa(K.malla(K.caja(0.07, 0.015, 1.02), i % 2 ? SU.cana : SU.canaD, { grosor: 0.004 }), { position: new THREE.Vector3(-0.66 + i * 0.132, 0.02, 0) }));   // cañas con luz entre ellas: se ve quién está debajo
  g.userData.ficha = { titulo: 'El toldo', texto: 'la sombra de cañas del patio, donde se dicta' };
  return g;
}
export function lampara(K) {
  const g = new THREE.Group();
  g.add(oa(K.malla(K.cilindro(0.06, 0.04, 0.05, 10), SU.terracota, { grosor: 0.005 }), { position: new THREE.Vector3(0, 0.025, 0) }));
  const llama = K.malla(K.cono(0.025, 0.07, 6), '#ffd27a', { emissive: '#ffb13b', emissiveIntensity: 1, sombra: false, sinTinta: true }); llama.position.set(0.04, 0.08, 0); g.add(llama);
  g.userData.llama = llama; g.userData.vivo = true;
  return g;
}
export function estatuaRey(K) {                        // el rey orante de diorita, al estilo de Gudea de Lagash
  const g = new THREE.Group(), dio = '#3f5147', dioL = '#56685e';
  g.add(oa(K.malla(K.caja(0.34, 0.2, 0.34), SU.adobeL, { grosor: 0.008 }), { position: new THREE.Vector3(0, 0.1, 0) }));
  g.add(oa(K.malla(K.cilindro(0.1, 0.15, 0.46, 12), dio, { grosor: 0.01 }), { position: new THREE.Vector3(0, 0.43, 0) }));
  g.add(oa(K.malla(K.esfera(0.1), dioL, { grosor: 0.008 }), { position: new THREE.Vector3(0, 0.66, 0), scale: new THREE.Vector3(1.1, 0.5, 0.9) }));
  g.add(oa(K.malla(K.esfera(0.075), dio, { grosor: 0.008 }), { position: new THREE.Vector3(0, 0.78, 0.01) }));
  g.add(oa(K.malla(K.cilindro(0.075, 0.08, 0.05, 12), dioL, { grosor: 0.006 }), { position: new THREE.Vector3(0, 0.83, 0) }));
  g.add(oa(K.malla(K.esfera(0.05), dioL, { grosor: 0.006 }), { position: new THREE.Vector3(0, 0.58, 0.1), scale: new THREE.Vector3(1.3, 0.8, 0.6) }));   // las manos juntas
  [-1, 1].forEach(l => g.add(oa(K.malla(K.esfera(0.016), '#e9e2cf', { sinTinta: true }), { position: new THREE.Vector3(l * 0.03, 0.79, 0.07) })));
  g.userData.ficha = { titulo: 'El rey orante', texto: 'reza por la ciudad aunque no esté' };
  return g;
}
export function vasijasPatio(K, niv26) {                // las del patio crecen con la cerámica aprendida en la aldea
  const g = new THREE.Group(), perfiles = [
    [[0.001, 0], [0.08, 0.02], [0.12, 0.14], [0.1, 0.28], [0.05, 0.34], [0.055, 0.38]],
    [[0.001, 0], [0.07, 0.02], [0.1, 0.1], [0.08, 0.22], [0.04, 0.27]],
    [[0.001, 0], [0.09, 0.02], [0.13, 0.2], [0.11, 0.38], [0.06, 0.46], [0.065, 0.5]],
    [[0.001, 0], [0.14, 0.03], [0.2, 0.2], [0.18, 0.4], [0.12, 0.5], [0.13, 0.54]]];
  const n = 2 + Math.max(0, Math.min(2, niv26 - 1));
  for (let i = 0; i < n; i++) { const v = vasija(K, perfiles[i], i % 2 ? SU.terracotaD : SU.terracota, niv26 >= 2 && i >= 1); v.position.set([0, 0.26, -0.2, 0.3][i], 0, [0, 0.1, 0.25, -0.2][i]); g.add(v); }
  return g;
}

/* el catálogo para la hoja de piezas y la auditoría de etapas (juego3d/qa.html) */
/* las piezas de Sumer se miran sobre limo, no sobre estepa (la hoja de piezas lee P.arena) */
const enLimo = f => (K, n) => { const P = f(K, n); P.arena = true; return P; };
export const PIEZAS = [
  { id: 'tablilla', i: 16, crear: enLimo(tablilla) },
  { id: 'calamo', i: 17, crear: enLimo(calamo) },
  { id: 'calculos', i: 18, crear: enLimo(calculos) },
  { id: 'listas', i: 19, crear: enLimo(listas) },
  { id: 'dictado', i: 29, crear: enLimo(dictado) },
  { id: 'edubba', i: 30, crear: enLimo((K, n) => edubbaCasa(K, n)) },
];
